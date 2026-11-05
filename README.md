# XR Women Research Library

A React + Vite + TypeScript frontend MVP. React Router manages the catalogue and project pages; Lucide supplies interface icons. All catalogue search, filters, and connections run locally. Newsreader and Inter are bundled, so reading does not depend on Google Fonts.

## Run locally

Requires Node.js 20.19+ or 22.12+ and npm.

```sh
npm install
npm run dev
```

Open the Local URL Vite prints (normally http://127.0.0.1:5173). For a production check:

```sh
npm test
npm run build
npm run preview
```

The production output is `dist/`. A static host must serve `index.html` for unknown paths so refreshing `/papers/1` works. Cloudflare static hosting provides this SPA fallback when no top-level `404.html` exists. The project includes Sites hosting metadata.

## Pages and interactions

- `/`: search by Enter or button, topic suggestions, complete collection navigation.
- `/papers`: live, accent-insensitive and case-insensitive search across titles, authors, abstracts, summaries, both keyword sets, and categories; five broader topics derived from standardized keywords; multiple topics match **all** selections; newest/oldest sorting; clear actions and no-results state.
- `/papers/:id`: original metadata, source-preserved abstract, summary, both keyword sets, DOI links, related research in an interactive network or list, and FrameVR location information.
- `/search` is an alias for the catalogue, matching the design reference's older route.
- `/about`: an internal project introduction, linked from the **About project** navigation item. It explains the collection, topic connections, and FrameVR placement without opening an external site.

The URL stores search (`q`), repeated topic filters (`topic`), and sorting (`sort=oldest`). Browser Back preserves these; the detail page's Back to search results link also preserves the originating view through related-paper navigation. A directly opened detail page returns to the full catalogue.

## Data and adding papers

The authoritative academic dataset is **`src/data/papers.json`**. Six records were imported from the supplied `XR_Women_Academic_Writing_Catalogue_demo.txt`. Titles, original author strings, keywords, abstracts, summaries, DOI links, and the source's journal credibility note are preserved. No publication venue or missing metadata is inferred. The source's soft hyphens and line breaks remain in the abstract data; browser text layout handles them normally.

To add a paper, append a record to `papers.json` with a unique string `id`, `title`, `authors` array, original `authorsText`, numeric `year`, `originalKeywords` array, original `originalKeywordsText`, `standardizedKeywords` array, `mainCategory`, full original `abstract`, `shortSummary`, `sourceUrl`, and `sourceMetadata` object (use `{}` if absent). All pages, counts, and relationships update automatically. No individual page needs editing. Update the source-specific acceptance tests when expanding beyond the supplied six-record fixture. The graph displays up to five strongest connections; the list includes all matching papers.

`src/data/catalogue.ts` defines the data type, search, topic keyword mappings, and connections. Topic membership uses exact, case-insensitive standardized keywords. Related papers share an exact standardized keyword or one of those mapped topics. Connections explicitly indicate subject similarity; they make no citation or influence claims. If new standardized keywords need grouping, update the topic definitions here.

`scripts/import_catalogue.py` reproduces the initial import with Python 3:

```sh
python scripts/import_catalogue.py "PATH/TO/XR_Women_Academic_Writing_Catalogue_demo.txt"
```

This importer is deliberately specific to the supplied six-record source. Re-running it replaces `papers.json`; do not use it after manually adding records without updating its validation.

## Configure verified FrameVR locations

Edit **`src/data/locations.ts`**, which is separate from publication data. All destinations start empty because the source supplies DOI links, not FrameVR locations.

1. Open and test the real FrameVR world URL in a browser. Set `virtualLibrary.worldUrl` and `worldUrlVerified: true` only after verifying it. This enables the header's Enter Virtual Library link and general entry links on papers.
2. Add a paper-specific entry in `paperLocations` keyed by its catalogue ID. Available fields are `worldUrl`, `worldUrlVerified`, `section`, `spotName`, `directSpotUrl`, `directSpotUrlVerified`, and `description`.
3. Supply a `directSpotUrl` only if FrameVR actually supports that destination and you have tested it. Set `directSpotUrlVerified: true` only after checking the paper-specific location. Do not derive a spot URL from the DOI or guess its format.
4. The interface chooses a verified direct spot link before a verified general entrance. General entrance links clearly explain that the paper's direct spot is unavailable. Without either, the interface displays **Location not yet mapped** and no navigation button.

The validator accepts HTTPS destinations on `framevr.io` or its subdomains and requires the matching verification flag. This is a guard against accidental misconfiguration, not automatic verification of a world's existence. If the library later uses an approved custom FrameVR domain, update the validator and its tests after verification.

## Design and accessibility

The supplied `design.md` is the visual authority: warm off-white, dark text, archive purple, restrained lavender, serif editorial titles, sans-serif body text, generous space, and bibliography-style results. `src/styles.css` contains reusable design tokens and responsive rules. No official logo was supplied; the identity uses plain brand text and a generic library icon rather than recreating a brand mark.

Semantic landmarks, a skip link, form labels, visible keyboard focus, checkbox and pressed states, result-count announcements, route focus management, reduced-motion support, and a list alternative to the network are included. External links open a new tab and announce that behavior. Mobile filters expand from a labelled control.

## Scope and limits

This is a six-paper demonstration, with no backend, accounts, uploads, AI service, or automated academic recommendations. All data is bundled in the frontend. FrameVR placement remains unconfigured until real destinations are supplied. The catalogue's abstracts and summaries reflect the supplied source; DOI resolver availability and publisher access can change. Keyword connections are intentionally lightweight and do not establish scholarly relationships beyond their explained overlap.
