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
