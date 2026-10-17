# Header publication investigation

## Root cause

There is no table/column mismatch in the existing publisher and public reader. Both target `public.homepage_customizations`, uniquely identified by `page_key = 'home'`, and the public reader correctly selects `published_content`.

The checked-out frontend had these concrete gaps:

1. `CustomizePage.tsx` displayed `content.nav` in its header preview, but had no Header selection state, editable Header panel, or `updatePath('nav.…')` bindings. A successful homepage Publish alone did not make that preview editable or produce new header values. The existing image/link/button controls are now connected to the existing `nav` object.
2. `Navbar.tsx` ignored `nav.logo` and always rendered the imported `New logo.png`. Its CTA displayed the configured text/color but always called `onInquiry`, ignoring `nav.inquiryButton.href`.
3. `MobileSidebarDrawer.tsx` used its own imported logo and static `drawerItems`. The published navigation was not passed through `MobileBottomNav` to the drawer.
4. `App.tsx` loaded homepage customization once on mount and subsequently relied entirely on Realtime. The checked-in homepage migration does not add `homepage_customizations` to the Realtime publication. Live publication membership could not be inspected with the public key, so a missed/unavailable Realtime notification is a refresh gap, not a confirmed live database configuration defect. There was no focus, visibility, pageshow, or polling recovery. Errors also reset the app to defaults, and the public service treated any error message containing the table name as a missing-table fallback.

Desktop CTA text and desktop navigation labels were already bound to `customization.nav`; they were not hardcoded. Their update path depends on the admin actually changing `nav` and on the public app receiving/refetching the new published snapshot. Logo, CTA destination, and the mobile drawer had separate confirmed rendering defects.

## Exact data flow

| Step | File / function | Data |
| --- | --- | --- |
| Header editing | Admin `src/pages/customize/CustomizePage.tsx`, `renderActiveSectionPanel`, `updatePath`, `setByPath` | Existing `content.nav.logo`, `.links`, `.inquiryButton` |
| Header selection | Same file, `selectElement('nav', { type: 'headerContent' })` | Existing sidebar editor; Header button or clickable preview |
| Save Draft | Same file, `handleSaveDraft` → admin `src/services/homeCustomizationService.ts`, `saveHomepageDraft` | Upserts `draft_content` only, on conflict `page_key`; no public change |
| Publish, without hero snapshot | Same file, `handlePublish` → `publishHomepageCustomization` | Upserts `draft_content`, `published_content`, `published_at` on row `page_key='home'` |
| Publish, with hero snapshot | Admin `src/services/heroSliderService.ts`, `saveHomepageWithHero` → existing SQL `save_homepage_with_hero(p_content, p_publish=true)` | Atomically writes the same homepage fields and hero snapshots. Only `heroSlider` is removed from homepage JSON; `nav` is retained |
| Supplementary mirror | Admin `homeCustomizationService.ts`, `syncHomepageElements` | Writes existing `homepage_customization_elements` with `is_published=false/true`; this is not the public header source |
| Public fetch | Public `src/services/homeCustomizationService.ts`, `getPublishedHomepageCustomization` | `.from('homepage_customizations').select('published_content').eq('page_key','home').maybeSingle()` |
| Normalization | Public `src/services/homeCustomizationDefaults.ts`, `mergeHomeCustomization` | Merges missing values with existing defaults; existing `nav` field names match the admin model |
| Shared runtime state | Public `src/App.tsx`, `loadCustomization` | `homeCustomization` passed to Navbar and its `nav` passed to the mobile navigation/drawer |
| Desktop render | Public `src/components/Navbar.tsx`, `Navbar` | Published logo, alt, links, CTA text/color/destination |
| Mobile render | Public `src/components/navigation/MobileBottomNav.tsx` → `MobileSidebarDrawer.tsx` | Same published logo and navigation; existing default translations/icons and WhatsApp shortcut retained |

The homepage row has `draft_content`, `published_content`, and `published_at`. It has no header-specific `status` or `is_published` switch and no separate live header row. The `is_published` column belongs to the supplementary element mirror. No UUID is hardcoded in either reader/writer; the unique `page_key='home'` selects the same row.

## Database and configuration evidence

- Both local production-mode Vite environment configurations contain Supabase configuration and point to the same project. This does not independently inspect environment settings on deployed hosting services.
- An actual anonymous REST read using the public website's existing Supabase key returned **HTTP 200**, one `home` record, a non-null `published_at`, and a `nav` object with the expected `logo`, `links`, and `inquiryButton` fields. At inspection time the CTA was `Talk to a Travel Specialist` with `href='#inquiry'`.
- The live public row contained a stored logo URL; the previous Navbar still rendered its imported logo instead.
- Existing SQL grants anonymous select on the home customization row and authenticated management. The successful live public read shows anonymous RLS is not blocking this request.
- There is no localStorage/sessionStorage or React Query/SWR cache of this configuration. The header is fetched at runtime, not baked into the build. Static hosting cache headers apply to HTML/assets, not these Supabase requests.
- There was no authenticated browser surface available. No production header was edited or published during this investigation; no production restoration was necessary.

## Fix

- Connected the Header panel to the existing Customize state and existing Save Draft/Publish functions. No parallel configuration system was introduced.
- Bound both public header logos to `nav.logo`, retaining the existing imported image only as an empty/broken-image fallback.
- Bound CTA navigation to its configured URL. The default `#inquiry` still prevents navigation and opens the existing inquiry modal. Existing typography, colors, classes, desktop visibility, and responsive layout remain intact.
- Passed published navigation into the mobile drawer. Its default translations, icons, WhatsApp shortcut, social links, and bottom navigation are retained. Custom labels and destinations now reflect the admin configuration.
- Added a scoped five-second refresh while visible, plus focus/pageshow/visibility recovery, alongside the existing Realtime subscription. Switching back to the public tab requests the latest snapshot immediately. No global caching was disabled. Unchanged content does not trigger a state update; overlapping refreshes are avoided; transient errors retain the last successful snapshot.
- Narrowed missing-table fallback to actual missing-relation codes (`42P01`, `PGRST205`), so permission/network/database failures no longer masquerade as successful default configuration.

Other homepage sections already consume the published homepage snapshot; the shared refresh/error recovery benefits them as well. Hero slides use their existing separate published hero RPC and refresh handling, which were retained. No packages, reviews, bookings, inquiries, analytics, authentication, or visual header styles were changed.

**No additional Supabase SQL is required.** No production migration was created or changed for this fix. The added SQL file is an isolated regression test, not setup SQL.

## Files modified for this fix

- Admin: `src/pages/customize/CustomizePage.tsx`.
- Public: `src/App.tsx`, `src/components/Navbar.tsx`, `src/components/navigation/MobileBottomNav.tsx`, `src/components/navigation/MobileSidebarDrawer.tsx`, `src/services/homeCustomizationService.ts`.

Files added:

- Public: `tests/header-customization.test.mjs`, `HEADER_CUSTOMIZATION_FIX.md`.
- Admin: `supabase/tests/header-customization.test.sql` (disposable database only).

## Verification

- Both projects: `npm run build` passes. Existing bundle-size warnings remain.
- Public: `node --test tests/header-customization.test.mjs` passes all five tests. Tests execute the actual admin service functions and public query/normalization/rendering code with an isolated Supabase transport, exercising both publisher branches. `TEST HEADER UPDATE`, a distinct logo URL, `TEST NAV UPDATE`, and a distinct CTA URL are asserted in rendered desktop/mobile markup after Publish and absent before Publish. Original fixtures are restored.
- Local PostgreSQL: existing migrations plus `supabase/tests/header-customization.test.sql` pass using Auth/Storage fixtures. This tests the real existing SQL RPC: draft isolation, anonymous published reads, every changed header field, another homepage content field, publication timestamp, and restoration/rollback.
- Refresh tests cover Realtime callbacks, focus, visibility changes, visible-tab polling, hidden-tab suppression, and listener/timer cleanup. Failure and empty-snapshot fallbacks are tested.
- Existing hero tests remain separate and unchanged by the header fix.
- Targeted lint finds only the previously existing synchronous state-in-effect issues in Navbar/MobileBottomNav/Customize and the existing gallery memo warning; no new test/service/drawer/App lint errors were introduced.
- Manual authenticated admin interactions, a live `TEST HEADER UPDATE` publish, and real phone/desktop visual checks remain unverified because no connected browser is available. Responsive classes and desktop/mobile rendering were checked in automated render tests; this is not a physical device test.

After deploying the updated apps, verify the live browser flow by editing Header, saving only a draft and checking the unchanged public header, then publishing `TEST HEADER UPDATE` and switching to the public tab. Confirm a navigation label, logo, and CTA destination too, then restore the original values and publish again.
