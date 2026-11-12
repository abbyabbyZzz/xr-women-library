# XR Women Research Library

A React + Vite + TypeScript frontend MVP. React Router manages the catalogue and project pages; Lucide supplies interface icons. Catalogue search, filters, and connections run locally over live Zotero metadata. Spalla and Sofia Pro Narrow load from the user-supplied Adobe Fonts Web Project; bundled Inter provides a fallback.

## Run locally

Requires Node.js 20.19+ or 22.12+ and npm.

**Windows quick start:** double-click `启动网站.cmd`. It starts Vite and opens the library in your browser. Keep the command window open while using the site; closing it stops the local server. See `如何打开网站.txt` for Chinese instructions. The launcher can also run with `--no-open` when browser opening is not needed.

Do not open the source `index.html` or `dist/index.html` directly with a `file://` URL. The source entry imports TypeScript/React modules, and the production app expects HTTP-served assets and client-side routes. Use the launcher or the commands below.

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

The production output is `dist/`. The original Sites deployment uses `npm run build`; GitHub Pages uses `npm run build:pages`, its repository base path, and a custom `404.html` app fallback for directly opened paper URLs. The original Sites identity remains in `.openai/hosting.json`.

## GitHub Pages

Repository: https://github.com/abbyabbyZzz/xr-women-library

Website: https://abbyabbyzzz.github.io/xr-women-library/

The Pages source is **GitHub Actions**. Pushing to `main` runs tests, builds the website, and publishes `dist/` using `.github/workflows/deploy-pages.yml`. The workflow gets its base path from GitHub Pages configuration. Common routes have generated entry pages; dynamic paper routes use the custom 404 entry and React Router. Such direct dynamic requests can have HTTP 404 status while the application loads normally.

`ZOTERO_API_URL` is an optional GitHub repository Actions variable containing only the public catalogue endpoint. It becomes `VITE_ZOTERO_API_URL` during the build. Zotero credentials stay in the separate server; never add keys to frontend or GitHub Pages build variables. The API must allow origin `https://abbyabbyzzz.github.io`.

## Manage the API locally

Double-click **管理API.cmd**, or run `npm run manage-api`, to open the local management page on http://127.0.0.1:4190/. It checks the connection, reads collection status, saves the public API endpoint, and starts/monitors a GitHub Pages publish. See `tools/api-manager/README.md` for setup and details. Local settings and credentials are not committed.

## Pages and interactions

- `/`: a full-screen cream search panel with dense animated hands, followed by a full-screen lavender About project panel. On fine-pointer devices where both panels fit, wheel gestures, Page Up/Down, Home/End, Space, and section links use the restored eased screen transition (up to 860ms). Touch and oversized content retain native scrolling; reduced motion disables the enhanced transition and supplies static artwork. The floating paper shortcuts were removed at the user's request; Zotero records and the catalogue remain intact. Catalogue-based subject links, pause/resume, connection/retry status, and the footer remain available.
- `/papers`: live, accent-insensitive and case-insensitive search across titles, authors, abstracts, summaries, keywords, and categories; Zotero Collections or item-type filters; multiple selections match **all** filters; newest/oldest sorting; clear actions and no-results state.
- `/papers/:id`: original metadata, source-preserved abstract, Zotero Collections and Tags, publication links, related research in an interactive network or list, and FrameVR location information. The removed At a glance panel and visible paper numbering remain removed.
- `/search` is an alias for the catalogue, matching the design reference's older route.
- `/about`: an internal project introduction, linked from the homepage About second screen. The global navigation's **About project** item was removed at the user's request. The page explains the collection, topic connections, and FrameVR placement without opening an external site.

The URL stores search (`q`), repeated collection filters (`category`), and sorting (`sort=oldest`). Browser Back preserves these; the detail page's Back to search results link also preserves the originating view through related-paper navigation. A directly opened detail page returns to the full catalogue.

## Live Zotero data

The catalogue now loads from the read-only XR Women Zotero API at runtime. The API reads the private VR Library Museum group on the server and exposes only approved bibliographic metadata; the Zotero API key is never included in this frontend bundle.

To add or update a paper, edit the Zotero group rather than this repository. The website maps:

- Zotero Collections to catalogue categories and filters;
- Zotero Tags to searchable keywords and related-paper connections;
- Zotero creators, dates, abstracts, DOI/URL, and publication fields to paper details.

When an item has no Collection, its Zotero item type is used as a temporary category. Empty Tags and abstracts are shown honestly as missing metadata. `src/data/papers.json` remains only as a legacy regression-test fixture and is not the production data source.

`src/data/library.tsx` owns the runtime request, loading state, error recovery, and response normalization. `src/data/catalogue.ts` contains pure search, category, sorting, and relationship functions. Set `VITE_ZOTERO_API_URL` only when testing another compatible backend.

## Configure verified FrameVR locations

Edit **`src/data/locations.ts`**, which is separate from publication data. All destination URLs start empty because the source supplies DOI links, not FrameVR URLs. Article 01 includes the user-supplied instruction “Click on the Article 01 tag.”

1. Open and test the real FrameVR world URL in a browser. Set `virtualLibrary.worldUrl` and `worldUrlVerified: true` only after verifying it. This enables the header's Enter Virtual Library link and general entry links on papers.
2. Add a paper-specific entry in `paperLocations` keyed by its catalogue ID. Available fields are `worldUrl`, `worldUrlVerified`, `section`, `spotName`, `directSpotUrl`, `directSpotUrlVerified`, and `description`.
3. Supply a `directSpotUrl` only if FrameVR actually supports that destination and you have tested it. Set `directSpotUrlVerified: true` only after checking the paper-specific location. Do not derive a spot URL from the DOI or guess its format.
4. The interface chooses a verified direct spot link before a verified general entrance. General entrance links clearly explain that the paper's direct spot is unavailable. Without either, the interface displays **Location not yet mapped** and no navigation button.

The validator accepts HTTPS destinations on `framevr.io` or its subdomains and requires the matching verification flag. This is a guard against accidental misconfiguration, not automatic verification of a world's existence. If the library later uses an approved custom FrameVR domain, update the validator and its tests after verification.

## Design and accessibility

The November 2026 redesign follows the supplied Tour Kyrgyzstan and Sedlecký Kaolin references, experimental network/collage board, and dark ASCII animation reference. The user confirmed an exploratory homepage with clear catalogue and article reading pages. The user’s colour correction restores the original warm-white, purple, lavender, and rose palette. The homepage now uses warm-paper #FAFAF7, denser purple dot-matrix hands, and a lavender #EAE5F0 About second screen. Lavender is the current implementation trial following the request to change that background. The current font trial uses Spalla at 400 normal for display headings and Sofia Pro Narrow at 400 normal for reading and navigation, loaded from the user-supplied https://use.typekit.net/kks0lzw.css. Inter remains bundled as a fallback. These choices do not claim official brand standards. The project `DESIGN.md` records current and historical iterations; the earlier external `design.md` remains a historical reference and is not edited.

`src/styles.css` supplies the two full-height panels. `src/components/useHomeScroll.ts` coordinates desktop eased transitions with router-aware anchors and layout-change handling; zoom gestures and editable controls are preserved. `src/components/ResearchField.tsx` samples the supplied hand photograph into a denser LED halftone, with about four times the grid samples at standard desktop/mobile sizes. The 20-second pose cycle renders at about 30fps and suspends during scrolling to leave time for the transition. Quiet areas follow the actual text and control bounds. Pause, hidden/offscreen stopping, and static reduced-motion behavior remain. The background is decorative and does not encode scholarly relationships. No official logo was supplied; the identity uses plain brand text and a generic library icon rather than recreating a brand mark.

Semantic landmarks, a skip link, form labels, visible keyboard focus, checkbox and pressed states, result-count announcements, route focus management, reduced-motion support, and a list alternative to the network are included. External links open a new tab and announce that behavior. Mobile filters expand from a labelled control.

## Scope and limits

This is a live Zotero-backed catalogue with no accounts, uploads, or automated academic recommendations in the frontend. FrameVR destination URLs remain unconfigured until verified destinations are supplied. DOI resolver availability and publisher access can change. Tag, collection, and broader-topic connections are intentionally lightweight and do not establish scholarly relationships beyond their explained overlap.

Local preview note (2026-11-12): the independent Zotero API currently permits the deployed website origin through CORS. A localhost browser therefore shows the existing retry state even though a direct read-only API check returns HTTP 200. This UI change does not alter the backend or its allowed origins.

## Hand artwork source — 2026-11-12

`public/images/hands-source.webp` is a local 1600 × 905 copy of the four-hand source sheet explicitly supplied in the user’s “Kindred — Dot-Matrix Hands Hero” reference. It is sampled into four low-resolution tiles and two tiny luminance fields; the browser draws the visible dots live. It is not played as a video or GIF. Keeping the supplied sheet local removes a runtime dependency on the remote image proxy.

Source URL: https://images.higgs.ai/?default=1&output=webp&url=https%3A%2F%2Fd8j0ntlcm91z4.cloudfront.net%2Fuser_38xzZboKViGWJOttwIXH07lWA1P%2Fhf_20261030_025250_100df7b8-31fd-4614-aa4a-c1b7d5b6b273.png&w=1600&q=85

SHA256: `82b65a36fabcd7c6d6f59ab93a60c52efe659f0243ea6580180bdf73046a9cf3`. The XR Women identity, purple palette, research content, and Sofia body text are retained; the Kindred brand, partner logos, rainbow CTA, and navigation were not imported.

Title-font trial: Spalla 400 normal is now active, following the user’s explicit switch from Retros. Sofia Pro Narrow 400 remains the body and navigation face. Both are delivered by the same Adobe Web Project.

Historical overlay reference (2026-11-12): the user supplied a local 8.8-second screen recording, prompting a persistent animation and foreground-card trial. The user subsequently preferred the preceding eased full-screen transition and requested its restoration. The overlay is no longer active; its frames and QA captures under `qa/` are historical evidence. The denser hands, cream first screen, and Spalla headings remain.
