# Maintaining the Fiat 500 L owner guide

The guide is a buildless static page with 114 bilingual sections. Deploy `www` as usual: there is no wiki checkout, API, CDN or runtime content fetch.

- `fiat500l-wiki.html`: the authoritative bilingual content, UI translations, examples and source links.
- `fiat500l-wiki-it.html`: generated Italian entry point. Do not edit it directly.
- `css/fiat500l-guide.css`: design tokens, components, locale visibility, responsive and print rules.
- `assets/js/fiat500l-guide.js`: optional in-page language switching, search, navigation and printing.
- `scripts/build-fiat500l-locales.mjs`: generates the Italian page using Node's built-in modules; no packages are required.

After every content or UI change, run from `www`:

```sh
node scripts/build-fiat500l-locales.mjs
node scripts/build-fiat500l-locales.mjs --check
node scripts/check-fiat500l-seo.mjs
node --check assets/js/fiat500l-guide.js
```

Commit both HTML files together. Both are ready to serve without a build during deployment. The existing URL remains the English entry point and retains the original section IDs. The Italian URL has its own canonical metadata; reciprocal `hreflang` links and the sitemap identify both versions.

## Adding content

Each `.guide-topic` section has a stable ID and an `aria-labelledby` pointing to its h2. Each procedure is native `<details class="guide-card" id="topic-procedure">` with a summary/h3 and `.card-body`. Keep IDs unique and stable because bookmarks and cross-references use them.

Place article translations in separate `.language-content` elements with matching `lang` and `data-language` (`en` or `it`). Give headings and surrounding UI two `.ui-copy` spans, with matching `lang` and `data-ui-language`. Every card must contain both translated headings and both body translations. Localise cross-reference labels inside each body, including table headings, worked examples and source descriptions. Use real Unicode accents and local number/date conventions.

For translated accessibility attributes, provide the default attribute and both `data-aria-label-en` / `data-aria-label-it` values. Placeholder, title and image alt attributes use the same convention. Page-title and description translations live on their head elements. The generator sets the Italian initial attributes and metadata; the browser script updates them during in-page switching. Do not use HTML injection for translations in JavaScript.

Use ordered lists for procedures, h4 for subheadings and descriptive source links. Wrap tables in `.table-scroll` with `tabindex="0"`, `role="region"` and a localised `aria-label`. New cards are indexed automatically. New topics need a sidebar link and stable ID; legacy `?page=topic` links are recognised from topic IDs.

## Language behaviour

English and Italian are labelled in their own language at the top of the page, without flags. Their links work with scripts disabled. Each static page displays its own language through the root's `data-ui-language` and `data-reading-language` attributes. The page's `lang` matches its UI; individual translated spans and bodies also declare `lang`.

With scripts enabled, switching updates navigation, hero, summaries, body content, examples, search feedback, control labels, accessibility attributes and metadata together. It preserves the current section and clears the old language's search query. The URL changes to the corresponding static entry point with `?lang=en` or `?lang=it`; links retain the current fragment. Back/Forward restores language state.

“Both languages” is an optional comparison mode. It shows both bodies with language labels and keeps the UI in the most recently selected language. Its shareable URL includes `lang=both&ui=en` or `lang=both&ui=it`.

Each canonical URL starts in its declared language, regardless of browser language or stored preferences. An explicit `?lang` enables shared reading modes. User selections are stored optionally, but never override the initial URL. Avoid automatic navigation or location-based redirects.

All article content is present in the initial HTML, including closed accordion bodies. The generated procedure directory contains a real anchor link to every section. Do not edit its marked block directly: the locale generator rebuilds it from card headings. Canonical and reciprocal hreflang links identify the language URLs; the sitemap lists both. Deployment checks generated content before copying `public/robots.txt` and `public/sitemap.xml` to the site root.

This approach follows [W3C language-declaration guidance](https://www.w3.org/International/questions/qa-html-language-declarations) and [Google's guidance on separate language URLs](https://developers.google.com/search/docs/specialty/international/managing-multi-regional-sites).

## Technical content and sources

Preserve the local Fiat F/L owner-manual PDF. The scan's printed page numbers differ from PDF viewer page numbers; references intentionally identify printed pages. Original 110 F.000 factory references are scoped to that configuration. Verify modifications against the installed engine, carburettor, distributor and component manufacturer's instructions.

The revised cooling, valve-clearance, ignition, gearbox and brake guidance was checked against printed manual pages 26–31 and 45–48. Model identity uses linked Stellantis Heritage/Fiat history; modern fuel-hose compatibility uses Gates; spark-plug interpretation uses DENSO. Do not add universal jetting, torque, oil, tyre-pressure or ignition recommendations without a verified, configuration-specific source. Worked examples are illustrative diagnostic reasoning, not evidence that one symptom proves one fault.

## Verification

Check both static pages with scripts disabled. Confirm the top language links, translated headings, body visibility, metadata and internal/local links. With scripts enabled, check switching at the top and halfway through a procedure, English/Italian search, no results, clearing, saved preferences, denied storage, browser language, comparison mode, Back/Forward and legacy `?page=manual&lang=it` links. Test print state restoration and narrow mobile layouts.

Search uses the selected language's heading and body, opens matches and restores the previous open/closed state when cleared. Following a content anchor clears search and reveals its destination. Printing opens visible procedures, preserves language/filter choice and restores the reading state afterward.

## Wiki migration

All ten `www-wiki/FIAT-500-L*.md` pages were consolidated into 107 original sections and retired. Seven new bilingual sections were added during the language/content review. `www-wiki/Motors.md` points to the owner guide, and `wiki.html` retains the old wiki-name routing map for incoming bookmarks. Publishing `www` and deleting the old pages in the separate wiki repository remain separate Git operations.

## Hero illustration

`assets/images/fiat500l-classic-illustration.png` is an original AI-generated illustration of the historic 500 L, not an archival photograph or an exact restoration reference. It replaces the generic inline silhouette. Keep its alpha channel and aspect ratio. Alt text is provided in English and Italian and updated with the page language. The smaller 500 L wordmark keeps the illustration as the panel’s focus.
