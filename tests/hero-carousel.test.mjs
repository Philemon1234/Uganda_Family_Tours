import test from 'node:test'
import assert from 'node:assert/strict'
import { readFile } from 'node:fs/promises'
import { createRequire } from 'node:module'
import { pathToFileURL } from 'node:url'
import React, { act } from 'react'
import { renderToStaticMarkup } from 'react-dom/server'
import { JSDOM } from 'jsdom'
import ts from 'typescript'

const dom = new JSDOM('<!doctype html><html><body></body></html>', { url: 'https://website.example.invalid/', pretendToBeVisual: true })
globalThis.window = dom.window
globalThis.document = dom.window.document
globalThis.IS_REACT_ACT_ENVIRONMENT = true
const { createRoot } = await import('react-dom/client')
const timeouts = new Map(), intervals = new Map()
let timerId = 0
window.setTimeout = (fn, duration) => { const id = ++timerId; timeouts.set(id, { fn, duration }); return id }
window.clearTimeout = id => timeouts.delete(id)
window.setInterval = (fn, duration) => { const id = ++timerId; intervals.set(id, { fn, duration }); return id }
window.clearInterval = id => intervals.delete(id)
window.matchMedia = () => ({ matches: false, addEventListener() {}, removeEventListener() {} })

const warnings = []
const originalWarn = console.warn
console.warn = (...args) => warnings.push(args.join(' '))
const require = createRequire(import.meta.url)
const rootUrl = new URL('../', import.meta.url)
const moduleUrl = code => `data:text/javascript;base64,${Buffer.from(code).toString('base64')}`
let responses = [], rpcCalls = 0, changeCallback
globalThis.__heroCarouselClient = {
  async rpc(name) {
    assert.equal(name, 'get_published_hero_slider')
    rpcCalls++
    return await (responses.shift() ?? { data: null, error: null })
  },
  channel() { return { on(event, filter, callback) { assert.equal(filter.table, 'hero_settings'); changeCallback = callback; return this }, subscribe() { return this } } },
  removeChannel() {},
}
const clientModule = moduleUrl('export const supabase=globalThis.__heroCarouselClient')
const messages = JSON.parse(await readFile(new URL('src/i18n/locales/en-US.json', rootUrl), 'utf8')).home.hero
globalThis.__heroCarouselMessages = messages
const modules = new Map()
async function loadSource(url) {
  if (modules.has(url.href)) return modules.get(url.href)
  let code = ts.transpileModule(await readFile(url, 'utf8'), { compilerOptions: { target: ts.ScriptTarget.ES2022, module: ts.ModuleKind.ESNext, jsx: ts.JsxEmit.ReactJSX } }).outputText
  for (const specifier of [...new Set([...code.matchAll(/from\s+['"]([^'"]+)['"]/g)].map(match => match[1]))]) {
    let replacement
    if (specifier.endsWith('/lib/supabaseClient')) replacement = clientModule
    else if (specifier === 'react-i18next') replacement = moduleUrl("export const useTranslation=()=>({t:key=>globalThis.__heroCarouselMessages[key.split('.').at(-1)]||key})")
    else if (specifier.includes('/assets/')) throw new Error('The public hero must not import local image assets')
    else if (specifier.startsWith('.')) replacement = await loadSource(new URL(specifier + '.ts', url))
    else replacement = pathToFileURL(require.resolve(specifier)).href
    code = code.split(JSON.stringify(specifier)).join(JSON.stringify(replacement)).split(`'${specifier}'`).join(JSON.stringify(replacement))
  }
  const result = moduleUrl(code); modules.set(url.href, result); return result
}
const { HeroCarousel } = await import(await loadSource(new URL('src/components/HeroCarousel.tsx', rootUrl)))
const slide = (id, image, overrides = {}) => ({ id, image_url: `https://storage.example.invalid/hero-slides/${image}.webp`, pre_title: `Published pre-title ${id}`, title: `Published title ${id}`, subtitle: `Published description ${id}`, button_text: 'Published CTA', button_url: '/published-tours', text_position: 'bottom-right', sort_order: 0, is_active: true, ...overrides })
const snapshot = (slides, settings = {}) => ({ data: { slides, autoplay: true, duration_seconds: 5, ...settings }, error: null })
const deferred = () => { let resolve; const promise = new Promise(done => { resolve = done }); return { promise, resolve } }
let container, reactRoot, observer, seenImages
async function mount(response, preserveCache = false) {
  if (!preserveCache) window.sessionStorage.clear()
  responses = [response]; warnings.length = 0; timeouts.clear(); intervals.clear()
  container = document.createElement('div'); document.body.append(container)
  seenImages = new Set()
  observer = new window.MutationObserver(records => {
    for (const record of records) for (const node of record.addedNodes) {
      if (node.nodeType !== 1) continue
      if (node.tagName === 'IMG') seenImages.add(node.getAttribute('src'))
      for (const img of node.querySelectorAll('img')) seenImages.add(img.getAttribute('src'))
    }
  })
  observer.observe(container, { childList: true, subtree: true })
  reactRoot = createRoot(container)
  await act(async () => reactRoot.render(React.createElement(HeroCarousel)))
}
const imageUrls = () => [...container.querySelectorAll('img')].map(img => img.getAttribute('src'))
const heading = () => container.querySelector('h1')?.textContent
async function refresh(response) { responses.push(response); await act(async () => changeCallback()) }
test.afterEach(async () => {
  if (reactRoot) await act(async () => reactRoot.unmount())
  observer?.disconnect(); container?.remove(); reactRoot = null
  window.sessionStorage.clear()
  assert.equal(intervals.size, 0, 'Refresh interval must be cleaned up')
  assert.equal(timeouts.size, 0, 'Autoplay timeout must be cleaned up')
})
test.after(() => { console.warn = originalWarn; dom.window.close() })

test('server/static first render contains no image, production title, or CTA', () => {
  const before = rpcCalls
  const html = renderToStaticMarkup(React.createElement(HeroCarousel))
  assert.doesNotMatch(html, /<img|<h1|href=|gorilla|elephant|Ballon|Bespoke Journeys/i)
  assert.match(html, /aria-busy="true"/)
  assert.equal(rpcCalls, before)
})
test('new session and slow Supabase response stay image-free until the published slide resolves', async () => {
  const pending = deferred(), published = slide('unique', 'unique-published-photo')
  await mount(pending.promise)
  assert.deepEqual(imageUrls(), [])
  assert.equal(container.querySelector('[role="status"]').firstElementChild.className, 'sr-only')
  // Several turns of the event loop represent a slow response; no image can
  // enter the DOM during this interval because there is no local slide source.
  for (let i = 0; i < 4; i++) await act(async () => { await Promise.resolve() })
  assert.deepEqual([...seenImages], [])
  await act(async () => pending.resolve(snapshot([published])))
  assert.deepEqual(imageUrls(), [published.image_url])
  assert.deepEqual([...seenImages], [published.image_url])
  assert.equal(heading(), published.title)
})
test('refresh immediately renders the last published banner and revalidates it', async () => {
  const previous = slide('previous', 'previous-published-photo'), next = slide('replacement', 'replacement-published-photo')
  await mount(snapshot([previous]))
  assert.deepEqual(imageUrls(), [previous.image_url])
  await act(async () => reactRoot.unmount()); observer.disconnect(); container.remove(); reactRoot = null
  const pending = deferred()
  await mount(pending.promise, true)
  assert.deepEqual(imageUrls(), [previous.image_url])
  assert.equal(heading(), previous.title)
  assert.equal(container.querySelector('[role="status"]'), null)
  await act(async () => pending.resolve(snapshot([next])))
  assert.deepEqual(imageUrls(), [next.image_url])
  assert.ok(!container.innerHTML.includes(previous.image_url))
})

test('expired or corrupt session cache is ignored and published deletion clears it', async () => {
  const key = 'uft:published-hero:v1'
  window.sessionStorage.setItem(key, JSON.stringify({ savedAt: Date.now() - 31 * 60 * 1000, content: snapshot([slide('old', 'old')]).data }))
  const pending = deferred()
  await mount(pending.promise, true)
  assert.deepEqual(imageUrls(), [])
  await act(async () => pending.resolve(snapshot([slide('new', 'new')])))
  assert.ok(window.sessionStorage.getItem(key))
  await refresh(snapshot([]))
  assert.equal(window.sessionStorage.getItem(key), null)
  assert.deepEqual(imageUrls(), [])
  await act(async () => reactRoot.unmount()); observer.disconnect(); container.remove(); reactRoot = null
  window.sessionStorage.setItem(key, '{invalid json')
  await mount(snapshot([]), true)
  assert.deepEqual(imageUrls(), [])
})
test('replacement, deletion, deactivation, and order use only the latest published records', async () => {
  const first = slide('a', 'first', { sort_order: 2 }), second = slide('b', 'second', { sort_order: 1 }), hidden = slide('hidden', 'inactive', { is_active: false })
  await mount(snapshot([first, hidden, second]))
  assert.deepEqual(imageUrls(), [second.image_url, first.image_url])
  assert.equal(heading(), second.title)
  const replacement = { ...first, image_url: 'https://storage.example.invalid/hero-slides/replaced.webp', sort_order: 0 }
  await refresh(snapshot([replacement]))
  assert.deepEqual(imageUrls(), [replacement.image_url])
  assert.ok(!container.innerHTML.includes(second.image_url))
  assert.ok(!container.innerHTML.includes(first.image_url))
  await refresh(snapshot([]))
  assert.deepEqual(imageUrls(), [])
  assert.match(container.textContent, /No featured experiences/)
})
test('multiple slides retain autoplay duration, arrows, CTA, text, and fade classes', async () => {
  const first = slide('a', 'a'), second = slide('b', 'b', { sort_order: 1 })
  await mount(snapshot([first, second], { duration_seconds: 7 }))
  assert.match(container.textContent, /Published pre-title a/)
  assert.match(container.textContent, /Published description a/)
  assert.equal(container.querySelector('a').getAttribute('href'), '/published-tours')
  assert.ok(container.querySelector('img').className.includes('transition-opacity'))
  const [id, timer] = [...timeouts].find(([, item]) => item.duration === 7000)
  assert.equal(timer.duration, 7000)
  await act(async () => { timeouts.delete(id); timer.fn() })
  assert.equal(heading(), second.title)
  await act(async () => container.querySelector('[aria-label="Previous slide"]').dispatchEvent(new window.MouseEvent('click', { bubbles: true })))
  assert.equal(heading(), first.title)
  await refresh(snapshot([first, second], { autoplay: false, duration_seconds: 3 }))
  assert.equal(timeouts.size, 0)
})
test('published text positions and mobile swipe behavior remain applied', async () => {
  const positions = ['top-left','top-center','top-right','center-left','center','center-right','bottom-left','bottom-center','bottom-right']
  const vertical = ['flex-start', 'center', 'flex-end'], horizontal = ['flex-start', 'center', 'flex-end']
  await mount(snapshot([slide('a', 'a')]))
  for (let i = 0; i < positions.length; i++) {
    await refresh(snapshot([slide('a', 'a', { text_position: positions[i] })]))
    const content = container.querySelector('.home-hero-content')
    assert.equal(content.style.justifyContent, vertical[Math.floor(i / 3)])
    assert.equal(content.style.alignItems, horizontal[i % 3])
  }
  await refresh(snapshot([slide('a', 'a'), slide('b', 'b', { sort_order: 1 })]))
  const section = container.querySelector('section')
  const start = new window.Event('touchstart', { bubbles: true }), end = new window.Event('touchend', { bubbles: true })
  Object.defineProperty(start, 'touches', { value: [{ clientX: 250, clientY: 100 }] })
  Object.defineProperty(end, 'changedTouches', { value: [{ clientX: 100, clientY: 103 }] })
  await act(async () => { section.dispatchEvent(start); section.dispatchEvent(end) })
  assert.equal(heading(), 'Published title b')
  assert.match(container.querySelector('[aria-label="Next slide"]').parentElement.className, /safe-area-inset-bottom/)
})
test('empty, missing, inactive-only, and malformed responses never resurrect images', async () => {
  await mount({ data: null, error: null })
  for (const response of [snapshot([]), snapshot([slide('hidden', 'hidden', { is_active: false })]), snapshot([null, {}, { title: 'Malformed', image_url: 'javascript:bad' }])]) {
    await refresh(response)
    assert.deepEqual(imageUrls(), [])
    assert.equal(container.querySelector('h1'), null)
    assert.equal(container.querySelector('a'), null)
  }
  assert.deepEqual([...seenImages], [])
})
test('fetch errors and broken published images show neutral states without local substitutions', async () => {
  await mount({ data: null, error: { message: 'private diagnostic' } })
  assert.deepEqual(imageUrls(), [])
  assert.match(container.textContent, /currently unavailable/)
  assert.doesNotMatch(container.textContent, /private diagnostic/)
  assert.ok(warnings.some(message => message.includes('published hero configuration')))
  await refresh(snapshot([slide('broken', 'broken-photo')]))
  await act(async () => container.querySelector('img').dispatchEvent(new window.Event('error')))
  assert.deepEqual(imageUrls(), [])
  assert.match(container.textContent, /currently unavailable/)
  await refresh(snapshot([slide('good', 'good-photo')]))
  await refresh({ data: null, error: { message: 'another failure' } })
  assert.deepEqual(imageUrls(), [])
  assert.ok([...seenImages].every(url => url.startsWith('https://storage.example.invalid/')))
})
test('a late older request cannot overwrite a newer published response', async () => {
  const pending = deferred(), latest = slide('latest', 'latest-photo')
  await mount(pending.promise)
  await refresh(snapshot([latest]))
  assert.equal(heading(), latest.title)
  await act(async () => pending.resolve(snapshot([slide('stale', 'stale-photo')])))
  assert.deepEqual(imageUrls(), [latest.image_url])
  assert.deepEqual([...seenImages], [latest.image_url])
  assert.equal(JSON.parse(window.sessionStorage.getItem('uft:published-hero:v1')).content.slides[0].id, latest.id)
})
