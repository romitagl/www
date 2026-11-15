# Shared personal workspace theme

The local candidate ports the reviewed A sidebar/layout, B headline and PDF tool spotlight, and charcoal/lime palette to romitagl.com and Web Tools. Teal and amber replace the prototype's purple. Nothing is published automatically; the owner reviews locally before authorizing an upstream push.

## Ownership and modules

- `css/theme-tokens.css` is the canonical palette, typography, and sidebar width. `node scripts/sync-theme.mjs` copies the tokens into `../web-tools/src/css/theme-tokens.css`, which is committed with that independent repository. `--check` verifies parity when both repositories are available. Neither production site depends on runtime requests to the other for styling.
- `css/studio.css` is a small entry point. `site-shell.css` owns shared sidebar, mobile navigation, footer, focus behavior, and the legacy token aliases used by existing feature styles. `site-content.css` adapts Wiki, About, Privacy, Fitness, guides, and experimental pages.
- `components.js` owns the main site's navigation/footer directory and bilingual navigation copy. Page content remains static and all established URLs and section hashes remain stable.
- `css/home.css` and `assets/js/home.js` own homepage presentation and progressive search/category filtering. All nine tool links work without JavaScript.
- `assets/js/wiki.js` owns the previously inline Wiki renderer, tabs, filters, caching, and section controls. Marked, URL handling, sanitization, SAE topic navigation, and unrestricted expanded section height are retained.
- `fiat500L.html` is protected and restored byte-for-byte to its original standalone version. It must never be changed by whole-site redesigns, shared themes, navigation migrations, refactors, or preview-time rewriting. Only an explicit request naming this page authorizes changes. Its SHA-256 is `9091a32fbe1acae0a4d023d6e479d14a49104318e8c0d7f708b89dc1736b2cd4`.
- The guide source remains `fiat500l-wiki.html`; never hand-edit its generated Italian counterpart. Both retain 114 sections, translated navigation, search, print controls, internal links, and locale metadata.
- Web Tools keeps its React catalog and processing code. `src/components/SiteNavigation.jsx` owns its sidebar; `Layout.jsx` owns every tool workspace header/footer. `src/css/site-shell.css` owns their geometry; `theme-adapters.css` handles shared surfaces/contrast. White QR output surfaces and actual media content retain their functional colors.

Experimental Matrix files were already local/untracked and remain unpromoted. They inherit the shared shell; they are not newly linked from the public navigation.

## Local review

```sh
# In ../web-tools:
npm ci
npm test
npm run build

# In www:
npm ci --prefix tests/wiki
node --test tests/wiki/*.test.cjs tests/fitness/*.test.mjs
node scripts/check-fitness.mjs
node scripts/build-fiat500l-locales.mjs --check
node scripts/check-fiat500l-seo.mjs
node scripts/sync-theme.mjs --check
python3 scripts/check-site-links.py --report /tmp/site-link-audit.json
python3 scripts/preview-site.py
```

Open `http://127.0.0.1:8766/__review/` for the review directory. The main site is on port 8766 and built Web Tools on 8767. The preview server binds only to loopback. Its injected, preview-only script routes links between these two domains to localhost and serves local `www-wiki` Markdown snapshots. Production source URLs and canonical metadata are untouched. Third-party links and the Website Scraper still use the internet. Rebuild Web Tools after editing its source; the main site serves directly from the checkout.

DOM tests exercise the actual shared components, homepage filtering, responsive-menu controls, active links, both guide locales, and an exact checksum guard for the protected FIAT experience page. Existing Wiki/Fitness checks and the Web Tools build remain required. Browser automation was unavailable in the editing session; responsive visual layout and real browser media/camera/file workflows need the owner's local review. The existing Web Tools browser suite is updated for the new navigation and can be run with `npm run test:e2e` where browser testing is available.
