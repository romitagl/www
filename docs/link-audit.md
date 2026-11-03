# Website link audit

Checked on 3 November 2026. Machine-readable results, including HTTP status, redirect destination, page title, and source files, are in `docs/link-audit.json`.

## Corrections

- Removed the nonexistent Web Knowledge subdomain from the home page and shared navigation/footer. A README describing a live URL was insufficient evidence.
- Removed six references to an AutoBella workshop-manual article returning HTTP 404 from the bilingual FIAT source, then regenerated the Italian entry page. The existing local original owner-manual PDF and verified manual-directory links remain available. They are not relabelled as an English workshop manual.
- Removed obsolete lorem.space image fallbacks from About and Wiki. Both pages already have local illustrations.
- Kept Matrix Lab out of the release, pending its separate review.

## Verified scope

The audit checks all root HTML files, in the candidate release; shared navigation and footer rendered from `components.js`; local destinations, fragment targets, and assets; URLs in referenced local CSS; and the configured fitness demo model and its attribution links. Same-origin URLs are resolved against the candidate release files, including the contents of `public/` that deployment copies to the root.

At this audit: **834 local references passed; 38 external destinations returned successful HTTP GET responses; one external destination was verified using an alternate retrieval method.** All nine Web Tools routes and Word Association Challenge returned HTTP 200.

The Gates fuel-hose reference returns HTTP 403 to curl. The official page was retrieved through the web browsing tool and confirmed as “4219BG Barricade™ Carbureted Engines Fuel Hose | Gates Corporation.” The exact URL, blocked status, verification method, and short expiry are recorded in `docs/link-verifications.json`. This does not waive other errors or other URLs. After 9 November 2026, that exception requires a fresh review. Do not automatically extend it.

## Repeat before deployment

```sh
python3 scripts/check-site-links.py --external
node scripts/check-fitness.mjs
node scripts/build-fiat500l-locales.mjs --check
node scripts/check-fiat500l-seo.mjs
```

The deployment workflow runs the full link audit before packaging. DNS failures, timeouts, missing files/anchors, failing HTTP responses, obvious not-found page titles, and unreviewed access blocks fail the check. `--external` is required to verify live destinations; omitting it performs local checks only and lists the external URLs not checked.

## Limits

HTTP reachability does not prove a tool's interactive behavior or the continuing accuracy of third-party content. This audit does not crawl links within external destinations. The Wiki also loads remotely maintained Markdown; links inside that remote content are outside the static release files and need a separate content audit. Email and phone links are not contacted. Source files and local hash routes are checked against the candidate release rather than the previously deployed site. Existing fitness and guide checks supplement the link audit. Matrix Lab files are excluded from the release audit and deployment.
