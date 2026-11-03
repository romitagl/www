# Main www home page — layout for review

This proposal treats romitagl.com as the entry point to the whole collection. The Web Tools redesign remains a separate change in its own repository.

## Proposed order

1. **Introduction:** a text-only personal statement and a Find a tool action. The GIF Maker and FIAT preview panels were removed after review.
2. **Five entry points:** Tools, Fitness, Local stories, Learn & play, Wiki & guides. All five are visible together, without a horizontal carousel.
3. **Tools:** direct links to all nine currently implemented tools, including GIF Maker and Video Speed Controller. QR generation and scanning share one listing. Website Scraper is marked experimental and its network/proxy limitation is explicit.
4. **Fitness:** Rider Fit has a dedicated feature linking to circuits, exercises, and progress.
5. **Local experience:** the FIAT 500 project now follows Fitness, with a larger photograph and a shorter introduction. Its owner guide remains accessible here and under resources.
6. **Learn & play:** Word Association Challenge fills the section with a word-tile illustration and explanatory copy. The unavailable Web Knowledge destination has been removed. Matrix Animation Lab is withheld from the home page, menus, and footer pending a separate review.
7. **Wiki & guides:** Knowledge Wiki, and the bilingual FIAT owner resources. Rider Fit has its own Fitness section.
8. **Personal introduction and footer:** contact, source, sponsorship, privacy, and a complete grouped directory.

## Shared menus

The header and footer use one directory in `components.js`. Top-level menus are Tools, Fitness, Learn & play, Local, Wiki & guides, and About. Native disclosure controls support click, touch, and keyboard use. Opening a group closes the others; Escape closes the menu and restores focus; selecting a link closes the mobile menu. Existing home anchors and child-page URLs are retained.

## Visual direction

Version A was selected after comparing two image mockups. The main home page uses a soft gray paper (`#E2E3E5`), charcoal typography (`#17191D`), and electric-blue accents (`#244FE5`). Bold sans-serif headings, fine gray rules, softly tinted tool cards, and compact navigation follow the light creative-studio direction. The introduction stays text-only. All nine tool links and the verified project destinations remain available. The FIAT feature uses a catalog-style studio illustration derived from the original local car photograph. It is captioned as an AI-styled illustration; original photos remain on the experience page.

The shared theme is scoped to `.studio-page` in `css/studio.css`, including the header, dropdowns, mobile menu, and footer. The home-page composition stays in `css/home.css`. Other www pages now share the theme while preserving their feature layouts; the standalone `fiat500L.html` remains untouched. Web Tools remains a separate project. Layouts stack at narrow widths, respect reduced motion, and provide visible keyboard focus.

## Review decisions

- Is the personal collection positioning right, or should the page lead more strongly with professional services?
- Should Local remain a top-level menu while it has one experience? The current proposal gives it prominence because it is a distinct destination.
- Keep all nine tool links on the hub, or shorten this to four featured tools and send visitors to Web Tools for the rest?
- Matrix Lab is existing uncommitted local work. Its files are preserved locally and excluded from this release; public-facing links have been removed. Review and refine its visual quality, controls, accessibility, motion handling, and mobile layout before deciding whether to publish it.

## Publication notes

The reviewed home-page design and shared theme are approved for release. Web Knowledge was removed after live verification failed; Word Association and all nine Web Tools routes passed live GET checks. See `docs/link-audit.json` and `docs/link-audit.md` for scope, results, and verification limits. No unfinished BuildFast prototype or undocumented project is promoted. The existing standalone programming challenge remains unlisted.

The broad privacy guarantee was replaced with a statement specifically about local file processing. Existing analytics is retained. Existing fitness integration checks now inspect the generated navigation and footer instead of assuming links appear as literal HTML in the JavaScript source.

## Experimental page review gate

Do not push or publish experimental pages as part of this home-page review. The current GitHub Pages workflow copies every root HTML file and all assets, so unlisting a page alone does not exclude it from a deployment. Keep the unreviewed Matrix Lab files out of any release commit until their separate review is complete.

## Background comfort refinement

The light theme now uses a darker gray-paper background with low-opacity monochrome grain, rendered as an embedded static SVG filter behind the page content. Cards and dropdowns use a softly tinted surface instead of pure white. The blue is slightly deeper to retain readable contrast on the darker paper. There is no animation, extra network request, or texture overlay on text.

## Composition refinement

To address the overly sparse appearance, the page now has a tighter introduction, softly colored category links, a blue tools section with nine inline SVG icons, a larger photographic FIAT feature after Fitness, a full-width Word Association feature, and illustrated resource cards. These are CSS and local vector graphics; no new external asset or destination was introduced. The removed GIF/photograph hero panels remain absent.

## FIAT image and color refinement

The Local stories category now uses slate blue. Other lilac accents in the category links and media-tool icons were also changed to slate tones. The FIAT feature now uses `assets/images/fiat500l-catalog-studio.jpg`, a studio treatment generated from the existing car photograph. The vehicle sits on a cool blue-gray backdrop that fits the site. The original photo and the experience-page gallery remain intact. Generation prompt and provenance are in `docs/fiat-catalog-image.md`.

## Dedicated Fitness section

Rider Fit is now an independent destination, reached from the Fitness menu and a full-width home feature. The old Wiki Fitness tab was removed. Its published hash URL redirects to `fitness.html`, and the app breadcrumb leads back to the home Fitness section. The workout, exercise-library, progress, and stored-session behavior is preserved.
