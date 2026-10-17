import test from 'node:test'
import assert from 'node:assert/strict'
import { readFile } from 'node:fs/promises'
import { createRequire } from 'node:module'
import { pathToFileURL } from 'node:url'
import ts from 'typescript'
import React from 'react'
import { renderToStaticMarkup } from 'react-dom/server'
import { MemoryRouter } from 'react-router-dom'

const publicRoot = new URL('../', import.meta.url)
const adminRoot = new URL('../../Uganda_Family_Tours_Admin_Dashboard/', import.meta.url)
const require = createRequire(import.meta.url)
const moduleUrl = source => `data:text/javascript;base64,${Buffer.from(source).toString('base64')}`
const clones = value => structuredClone(value)
const originalNav = { logo: { src: 'https://example.invalid/original-logo.png', alt: 'Original logo' }, links: [{ id: 'home', label: 'Home', href: '/' }], inquiryButton: { text: 'Talk to a Travel Specialist', href: '#inquiry', color: '#FB770D', icon: 'arrow' } }
let row = { page_key: 'home', draft_content: { nav: clones(originalNav) }, published_content: { nav: clones(originalNav) }, published_at: null }
let readError = null
const calls = []
let realtimeCallback
let removedChannels = 0
globalThis.__headerClient = {
  auth: { getSession: async () => ({ data: { session: { user: { id: 'signed-in-account' } } }, error: null }) },
  from(table) {
    const query = { payload: undefined,
      select(columns) { calls.push({ table, columns }); return this },
      eq(column, value) { calls.push({ table, column, value }); return this },
      upsert(payload, options) { calls.push({ table, payload: clones(payload), options }); this.payload = payload; return this },
      delete() { return this },
      insert() { return Promise.resolve({ error: null }) },
      async single() { row = { ...row, ...clones(this.payload) }; return { data: clones(row), error: null } },
      async maybeSingle() { return { data: clones(row), error: readError } },
      then(resolve, reject) { return Promise.resolve({ error: null }).then(resolve, reject) },
    }
    return query
  },
  channel() { return { on(event, filter, callback) { realtimeCallback = callback; return this }, subscribe() { return this } } },
  removeChannel() { removedChannels++ },
}
const clientModule = moduleUrl('export const supabase=globalThis.__headerClient')
const heroService = moduleUrl(`
export const getHeroSliderEditorState = async () => ({allowed:true});
export async function saveHomepageWithHero(content,publish){
 const {heroSlider,...homepage}=structuredClone(content);
 globalThis.__saveHeaderSnapshot(homepage,publish);
 return {data:{page_key:'home'},cleanupWarning:false};
}`)
globalThis.__saveHeaderSnapshot = (content, publish) => { row.draft_content = content; if (publish) { row.published_content = clones(content); row.published_at = '2026-10-17T12:00:00Z' } }
const modules = new Map()
async function loadSource(url) {
  if (modules.has(url.href)) return modules.get(url.href)
  let code = ts.transpileModule(await readFile(url, 'utf8'), { compilerOptions: { target: ts.ScriptTarget.ES2022, module: ts.ModuleKind.ESNext, jsx: ts.JsxEmit.ReactJSX } }).outputText
  const specifiers = [...new Set([...code.matchAll(/from\s+['"]([^'"]+)['"]/g)].map(match => match[1]))]
  for (const specifier of specifiers) {
    let replacement
    if (specifier.endsWith('/lib/supabaseClient')) replacement = clientModule
    else if (url.href.includes('Admin_Dashboard') && specifier === './heroSliderService') replacement = heroService
    else if (specifier === 'react-i18next') replacement = moduleUrl("export const useTranslation=()=>({t:key=>({'navbar.home':'Home','navbar.tours':'Tours','navbar.about':'About Us'}[key]||key)})")
    else if (specifier.endsWith('/LanguageSwitcher')) replacement = moduleUrl('export const LanguageSwitcher=()=>null')
    else if (/\.(png|jpe?g|webp|svg)$/.test(specifier)) replacement = moduleUrl(`export default ${JSON.stringify('/fixture-assets/' + specifier.split('/').at(-1))}`)
    else if (specifier.startsWith('.')) {
      const dependency = new URL(specifier + '.ts', url)
      replacement = await loadSource(dependency)
    } else replacement = pathToFileURL(require.resolve(specifier)).href
    code = code.split(JSON.stringify(specifier)).join(JSON.stringify(replacement)).split(`'${specifier}'`).join(JSON.stringify(replacement))
  }
  const result = moduleUrl(code); modules.set(url.href, result); return result
}
const admin = await import(await loadSource(new URL('src/services/homeCustomizationService.ts', adminRoot)))
const publicService = await import(await loadSource(new URL('src/services/homeCustomizationService.ts', publicRoot)))
const { Navbar } = await import(await loadSource(new URL('src/components/Navbar.tsx', publicRoot)))
const { MobileSidebarDrawer } = await import(await loadSource(new URL('src/components/navigation/MobileSidebarDrawer.tsx', publicRoot)))
const render = (Component, props) => renderToStaticMarkup(React.createElement(MemoryRouter, null, React.createElement(Component, props)))

for (const withHero of [false, true]) test(`draft/publish header flow ${withHero ? 'with hero RPC' : 'with existing upsert'}`, async () => {
  row = { page_key: 'home', draft_content: { nav: clones(originalNav) }, published_content: { nav: clones(originalNav) }, published_at: null }
  const editedNav = { logo: { src: 'https://example.invalid/test-header-logo.png', alt: 'TEST LOGO' }, links: [{ id: 'custom', label: 'TEST NAV UPDATE', href: '/tours?header=test' }], inquiryButton: { text: 'TEST HEADER UPDATE', href: '/tours?cta=test', color: '#FB770D', icon: 'arrow' } }
  const content = { nav: editedNav, ...(withHero ? { heroSlider: { slides: [], autoplay: true, duration_seconds: 5 } } : {}) }
  await admin.saveHomepageDraft(content)
  assert.deepEqual(row.draft_content.nav, editedNav)
  let published = await publicService.getPublishedHomepageCustomization()
  assert.deepEqual(published.nav, originalNav)
  assert.doesNotMatch(render(Navbar, { customization: published, onInquiry() {} }), /TEST HEADER UPDATE/)
  await admin.publishHomepageCustomization(content)
  assert.deepEqual(row.published_content.nav, editedNav)
  assert.ok(row.published_at)
  published = await publicService.getPublishedHomepageCustomization()
  const desktop = render(Navbar, { customization: published, onInquiry() {} })
  assert.match(desktop, /TEST HEADER UPDATE/)
  assert.match(desktop, /TEST NAV UPDATE/)
  assert.match(desktop, /src="https:\/\/example.invalid\/test-header-logo.png"/)
  assert.match(desktop, /href="\/tours\?cta=test"/)
  assert.match(desktop, /hidden items-center gap-7 lg:flex/)
  const mobile = render(MobileSidebarDrawer, { navigation: published.nav, isOpen: true, onClose() {} })
  assert.match(mobile, /TEST NAV UPDATE/)
  assert.match(mobile, /test-header-logo.png/)
  assert.match(mobile, /lg:hidden/)
  assert.match(mobile, /WhatsApp/)
  await admin.publishHomepageCustomization({ ...content, nav: clones(originalNav) })
  const restored = await publicService.getPublishedHomepageCustomization()
  assert.deepEqual(restored.nav, originalNav)
  assert.doesNotMatch(render(Navbar, { customization: restored, onInquiry() {} }), /TEST HEADER UPDATE/)
  assert.ok(calls.some(call => call.table === 'homepage_customizations' && call.columns === 'published_content'))
  assert.ok(calls.some(call => call.column === 'page_key' && call.value === 'home'))
})

test('read failures are not silently treated as successful default content', async () => {
  readError = { code: '42501', message: 'permission denied for homepage_customizations' }
  await assert.rejects(publicService.getPublishedHomepageCustomization())
  readError = null
})
test('an empty published snapshot retains the existing header fallback', async () => {
  row.published_content = {}
  const content = await publicService.getPublishedHomepageCustomization()
  assert.equal(content.nav.inquiryButton.text, 'Talk to a Travel Specialist')
  assert.ok(content.nav.links.length)
})
test('targeted refresh covers Realtime, focus, polling, visibility, and cleanup', () => {
  const savedWindow = globalThis.window, savedDocument = globalThis.document
  const windowEvents = new Map(), documentEvents = new Map()
  let intervalCallback, cleared = false, refreshes = 0
  globalThis.window = { setInterval(fn, duration) { assert.equal(duration, 5000); intervalCallback = fn; return 19 }, clearInterval(id) { assert.equal(id, 19); cleared = true }, addEventListener(type, fn) { windowEvents.set(type, fn) }, removeEventListener(type) { windowEvents.delete(type) } }
  globalThis.document = { hidden: false, addEventListener(type, fn) { documentEvents.set(type, fn) }, removeEventListener(type) { documentEvents.delete(type) } }
  try {
    const unsubscribe = publicService.subscribeToHomepageCustomizationChanges(() => refreshes++)
    intervalCallback(); windowEvents.get('focus')(); documentEvents.get('visibilitychange')(); realtimeCallback()
    assert.equal(refreshes, 4)
    globalThis.document.hidden = true; intervalCallback(); assert.equal(refreshes, 4)
    unsubscribe(); assert.ok(cleared); assert.equal(removedChannels, 1); assert.equal(windowEvents.size, 0); assert.equal(documentEvents.size, 0)
  } finally { globalThis.window = savedWindow; globalThis.document = savedDocument }
})
