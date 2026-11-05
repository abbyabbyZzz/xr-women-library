# MVP verification — 5 November 2026

Browser review used the local Vite app at desktop, tablet, and phone widths (1440, 1024, 768, and 375 CSS pixels).

Verified interactions:

- Home search submits with Enter; the search button uses the same form submission. Topic suggestions open filtered results.
- Full catalogue renders all six paper rows. Live searches for `harassment`, `Zhang`, and `microaggressions` find the required records.
- Topic selections combine with search; selected states and remove actions work. Clearing restores six rows. Publication-year sorting updates the URL and ordering.
- Paper results open their matching dynamic detail page. Original authors, abstracts, keyword sets, summaries, and source DOI links render.
- Browser Back restores query, topic selection, and sorting. Back to search results retains the originating filter after related-paper navigation.
- The network's related-paper links open the intended paper; the list exposes full titles and explains shared keywords or topics.
- No FrameVR links or inactive navigation buttons appear for unconfigured locations. The explicit unmapped state is visible on detail pages.
- Mobile topic controls expand, paper titles reflow, and reading layouts have no horizontal overflow at the checked widths.
- No browser console errors or warnings appeared in the checked flows. Focus indicators, route-heading focus, semantic controls, and the skip link are implemented. Reduced-motion rules are included.

Source integrity was checked directly against the supplied TXT: title, author string, original keywords, category, full abstract, summary, and publication URL all match for all six records. Soft-hyphen line-wrap artifacts in the first abstract are joined for display only; the JSON retains its exact source text.

Automated coverage in `tests/catalogue.test.ts` checks all six IDs and DOI URLs, requested searches, accent normalization, combined filters, sorting, empty results, grounded reciprocal connections, and verified FrameVR URL handling. `npm test` and `npm run build` are the final release checks.

DOI URLs match the authoritative catalogue. The Frontiers DOI was independently resolved to the matching paper. Several other publisher pages blocked or failed automated fetching, so their live availability was not fully verified. Source URLs were retained without substitution.

Screenshots from the browser review are saved locally in `qa/home-desktop.jpg` and `qa/home-mobile.jpg`; the QA image directory is excluded from source publication. This is a functional MVP review, not a formal assistive-technology audit.
