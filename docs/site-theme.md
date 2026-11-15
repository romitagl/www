# Shared www visual theme

The approved home-page direction is now shared by About, Privacy, Wiki, Rider Fit, the English and Italian FIAT owner guides, the programming challenge, and the experimental Matrix lab.

`css/studio.css` provides the textured warm-gray paper background, slate surfaces, blue accents, typography, focus outlines, shared navigation/footer, and feature-specific color adaptations. Pages opt in with `class="studio-page"` and load this stylesheet after their original feature styles. `css/home.css` keeps the accepted home-page composition. Existing functional stylesheets and scripts remain in place.

## Protected standalone FIAT experience

`fiat500L.html` is intentionally excluded. It does not load `studio.css`, `components.js`, or the adapted SVG illustrations. Its existing independent layout, original photographs, contact links, metadata, and business-card URL remain intact. Its SHA-256 before and after this work is:

```
9091a32fbe1acae0a4d023d6e479d14a49104318e8c0d7f708b89dc1736b2cd4
```

Do not opt that page into the shared theme as part of routine site maintenance.

## Navigation and feature boundaries

- Fitness is now a dedicated top-level destination with its own home feature, menu, and footer group. `fitness.html` and all workout hashes remain stable. Legacy `wiki.html#fitness` bookmarks redirect to Rider Fit. The Wiki no longer contains a Fitness tab.
- The two FIAT owner guides share the same site navigation while retaining their language bar, all 114 sections, search, accordion controls, internal links, and print rules. English/Italian labels in the shared menus switch with the guide’s language controls.
- Rider Fit retains circuits, exercise images, motion demos, timers, journal, and storage behavior; only presentation and the navigation hierarchy changed.
- Matrix Lab keeps its dark green rain/terminal demonstration inside a page matching the rest of the site. It and the programming challenge remain unlisted experimental pages, pending their separate release review.
- Original SVG assets are preserved. About and Wiki use palette-adjusted sibling assets (`contact-studio.svg` and `wiki-studio.svg`). No external image dependency was added.

## Verification

Run from `www`:

```sh
node --check components.js
node scripts/check-fitness.mjs
node --test tests/fitness/*.test.mjs
node scripts/build-fiat500l-locales.mjs --check
node scripts/check-fiat500l-seo.mjs
python3 scripts/check-site-links.py --external
```

The fitness integration check executes the legacy redirect on initial load and subsequent hash navigation. The local audit validates candidate-release files and anchors. Existing external URLs remain unchanged by the theme work; the release workflow retains the live link audit and its documented limits.

Release scope: shared www theme and navigation, dedicated Fitness, and verified links. Matrix Lab files remain local and are excluded from this release.

## Paper texture refinement

The shared paper base is now `#dcdcd8` with `#e8e8e4` surfaces. The static monochrome SVG grain uses a 0.65 noise frequency and 0.18 alpha slope, making the texture more visible without placing an overlay over text or images. The standalone FIAT page remains excluded.

## November 2026 warmth and Wiki rendering update

The shared theme now uses ivory paper, forest-green ink and feature panels, terracotta actions, and amber highlights. The home and Wiki heroes use editorial serif type; the Wiki cover is built in HTML/CSS. The grain background has been removed. The standalone `fiat500L.html` remains excluded and retains the checksum above.

Wiki Markdown now uses the bundled Marked parser, with an HTML allowlist and text-node hashtag decoration. This preserves nested lists, tables, fenced code, image URLs, and URL fragments. Level-two section splitting uses Markdown tokens, so introductions and code fences are preserved. Expanded sections have no height cap: the previous 5,000px cap could clip the Cars section before the SAE oil material. Topic shortcuts open the relevant section and scroll to a heading. Expand/collapse controls expose their state to assistive technology. New cache keys retire previously cached content; disabled browser storage does not prevent rendering.

Run Wiki regressions with Node 24 or newer:

```sh
npm ci --prefix tests/wiki --no-audit --no-fund
node --test tests/wiki/rendering.test.cjs
```

The deployment runs these tests, the existing guide and Fitness checks, and the mandatory local link audit. The external link audit runs separately and its JSON report is retained as a workflow artifact. External failures are advisory: a supplier timeout or third-party bot protection should not prevent publishing first-party repairs. In this session, 36 of 40 external destinations returned HTTP 200; two returned HTTP 429, Gates returned HTTP 403, and D’Angelo timed out. These are recorded as verification limits, not treated as successful checks.

Browser preview was unavailable in the editing session. DOM regression checks cover Markdown rendering, SAE navigation, repeated loads, filters, section controls, URL handling, and unsafe HTML removal; visual layout still needs human review.
