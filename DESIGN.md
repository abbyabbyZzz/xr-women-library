---
name: "XR Women Research Library"
description: "A living research atlas with clear catalogue and article reading surfaces."
colors:
  primary: "#604c78"
  primary-hover: "#49375f"
  lavender: "#eae5f0"
  background: "#fafaf7"
  surface: "#fff"
  ink: "#25252a"
  text-secondary: "#625f68"
  warm-gray: "#f0efec"
  border: "#e2dfe7"
  control-border: "#8b8492"
  accent: "#bc6697"
  panel-lavender: "#eae5f0"
  panel-text: "#625f68"
  tag-text: "#625f68"
  focus: "#604c78"
typography:
  display:
    fontFamily: "'spalla', 'Inter Variable', sans-serif"
    fontSize: "72px"
    fontWeight: 400
    lineHeight: 1.07
    letterSpacing: "-.035em"
  headline:
    fontFamily: "'spalla', 'Inter Variable', sans-serif"
    fontSize: "58px"
    fontWeight: 400
    lineHeight: 1
    letterSpacing: "-.015em"
  reading-title:
    fontFamily: "'sofia-pro-narrow', 'Inter Variable', sans-serif"
    fontSize: "38px"
    fontWeight: 400
    lineHeight: 1.25
    letterSpacing: "-.035em"
  title:
    fontFamily: "'sofia-pro-narrow', 'Inter Variable', sans-serif"
    fontSize: "25px"
    fontWeight: 400
    lineHeight: 1.36
    letterSpacing: "-.025em"
  body:
    fontFamily: "'sofia-pro-narrow', 'Inter Variable', sans-serif"
    fontSize: "16px"
    fontWeight: 400
    lineHeight: 1.65
  reading-body:
    fontFamily: "'sofia-pro-narrow', 'Inter Variable', sans-serif"
    fontSize: "16px"
    fontWeight: 400
    lineHeight: 1.9
  label:
    fontFamily: "'sofia-pro-narrow', 'Inter Variable', sans-serif"
    fontSize: "12px"
    fontWeight: 400
    lineHeight: 1.65
rounded:
  control: "6px"
  sm: "6px"
spacing:
  "6": "6px"
  "8": "8px"
  "12": "12px"
  "16": "16px"
  "20": "20px"
  "24": "24px"
  "28": "28px"
  "32": "32px"
  "40": "40px"
components:
  button-primary:
    backgroundColor: "{colors.primary}"
    textColor: "{colors.surface}"
    rounded: "{rounded.sm}"
    padding: "12px 18px"
  button-primary-hover:
    backgroundColor: "{colors.primary-hover}"
  button-text:
    textColor: "{colors.primary}"
    typography: "{typography.label}"
    padding: "0"
  button-icon:
    textColor: "{colors.text-secondary}"
    rounded: "{rounded.control}"
    size: "44px"
  button-icon-hover:
    backgroundColor: "{colors.warm-gray}"
    textColor: "{colors.ink}"
  search-submit:
    backgroundColor: "{colors.primary}"
    textColor: "{colors.surface}"
    rounded: "{rounded.control}"
    padding: "0 21px"
  search-field:
    backgroundColor: "{colors.surface}"
    textColor: "{colors.ink}"
    rounded: "{rounded.sm}"
    padding: "6px 7px 6px 20px"
    height: "64px"
  nav-link:
    textColor: "{colors.ink}"
    typography: "{typography.label}"
  keyword-tag:
    backgroundColor: "{colors.warm-gray}"
    textColor: "{colors.tag-text}"
    rounded: "{rounded.control}"
    padding: "3px 8px"
  result-row:
    textColor: "{colors.ink}"
    padding: "30px 0"
  virtual-panel:
    backgroundColor: "{colors.panel-lavender}"
    textColor: "{colors.panel-text}"
    padding: "28px 24px"
---

# Design System: XR Women Research Library

Current implementation update — 2026-11-12, restored screen transition: after trying the video-inspired foreground overlay, the user preferred the preceding scroll effect and requested its restoration. Search and About are again two full-height panels. When a fine pointer is present and both panels fit, wheel gestures, supported keyboard commands, and section anchors use a smoothstep transition of up to 860ms. Resize updates retarget an active transition; touch and oversized panels retain native scrolling. Reduced motion disables enhanced transitions and snapping. The first screen stays cream; the About second screen now trials #EAE5F0 in response to the requested background change. The standalone /about page is unchanged.

Subsequent navigation correction — 2026-11-12: About project has been removed from the global navbar at the user's request. The homepage About section and its link to the internal /about page remain.

Latest homepage simplification — 2026-11-12: the user requested removal of the floating paper windows. Their DOM links, positioning/hover styles, artwork quiet regions, and paper-position disclaimer have been removed. Keep the hands, search, subject links, browse action, and motion controls; no Zotero records or catalogue/detail functionality is removed. Older descriptions of paper fragments below are historical.

The first-screen background is #FAFAF7, with purple dot-matrix hands. Horizontal pitch targets 340 columns instead of 205, row pitch is 1.4× instead of 2.05×, and the luminance mapping preserves more shading: roughly four times the grid samples at standard desktop/mobile sizes. The dense scene renders at about 30fps and suspends during scrolling; the overlay-only scroll lift has been removed. Text/control quiet areas update with scrolling. Reduced motion supplies a static scene; pause and hidden/offscreen lifecycle behavior remain.

Spalla 400 normal is the active display face; Sofia Pro Narrow 400 normal remains the UI/body face, with bundled Inter fallback. This replaces Retros. Earlier Poppins, Waverly, Retros, ASCII, native-snap, and overlay descriptions document historical iterations and are superseded where they conflict. The restored transition shipped in version 10; floating-paper removal shipped in version 11. Current evidence is `qa/2026-11-12-published-v11-*.jpg` and `qa/2026-11-12-remove-paper-cards-validation.md`; earlier motion evidence remains under `qa/2026-11-12-restored-*`. The video-inspired overlay was rejected for its scroll feel and is historical. Current visual acceptance remains pending. The historical Impeccable sidecar was not regenerated.

## Overview

Current colour authority: the user requested the original project swatch and a closer relationship to XR Women. Purple (#604C78), pale lavender (#EAE5F0), warm white (#FAFAF7), and sparse rose (#BC6697) replace the previous blue/night interpretation.

**Creative North Star: "XR Women research atlas"**

The XR Women research atlas gives exploration a pale lavender ground, sculptural character matter, and precise purple controls. Rounded Poppins lettering gives the library presence, while Inter keeps research titles, source text, and navigation direct and readable. The confirmed world is exploratory on the homepage and clear on catalogue and article surfaces.

The system is flat, gently rounded, and finely ruled. Real paper fragments can sit within the animated field; reading pages use open rows and generous line spacing. The artwork is procedural canvas, with no shipping raster illustration. Motion is optional, and native controls remain recognizable.

**Key Characteristics:**

- Pale lavender exploration and warm paper reading grounds.
- Poppins display type paired with Inter for reading.
- Fine rules, gently rounded controls, and open research rows.
- Optional procedural motion with stable text and visible keyboard focus.

This is a scan of the finished implementation in `src/styles.css`, `src/App.tsx`, `src/components/SearchField.tsx`, and `src/components/ResearchField.tsx`, checked against the seven browser captures in `.impeccable/review/`. The YAML frontmatter is normative; the sidecar carries motion, responsive behavior, and component states. The captures are review evidence, not shipping image assets. The live collection uses the separate Zotero API; the legacy six-record JSON is a test fixture.

## Colors

Electric blue organizes interaction against cool neutral reading surfaces and the deep night exploration ground. Frontmatter values preserve the canonical CSS values.

### Primary

- **Project Purple** (`primary`): primary actions, active navigation, category links, selection, and light-surface focus.
- **Deep Purple** (`primary-hover`): action hover and selected-filter text.
- **Pale Lavender** (`lavender`): selected collection filters and linked-tag hover.

### Neutral

- **Warm Paper Ground** (`background`): catalogue, detail, and About page ground.
- **Paper White** (`surface`): search-field surfaces and reversed primary-action text.
- **Research Ink** (`ink`): headings and sustained reading text.
- **Muted Plum Text** (`text-secondary`): authors, summaries, guidance, and provenance.
- **Warm Gray Fill** (`warm-gray`): tags and quiet control hover.
- **Fine Rule** (`border`): section and result separators.
- **Control Plum** (`control-border`): search outlines, checkbox outlines, and navigation brackets.
- **Rose Accent** (`accent`): sparse decorative details, including the home title point and character-field highlights; never small body text.
- **Panel Lavender** (`panel-lavender`) and **Panel Plum** (`panel-text`): virtual-library and About support panels.
- **Tag Plum** (`tag-text`): compact keyword text.
- **Purple Focus** (`focus`): keyboard outline on the light home and reading surfaces.

### Named Rules

**The Interaction Color Rule.** Use project purple for actions, selection, and research navigation; use neutral ink for sustained reading.

## Typography

**Display Font:** Poppins, matching the family observed on the XR Women website; Inter and sans-serif provide fallbacks.

**Body Font:** Inter Variable, with Inter, system-ui, and sans-serif fallbacks. Fonts are bundled through the existing Fontsource imports.

**Artwork Font:** Consolas with monospace fallback, used for drawn characters rather than prose. The declared mono stack is not a second reading font.

**Character:** Rounded, sentence-case display lettering echoes the welcoming XR Women website. Inter supplies a calmer, wider texture for source material. The observed hierarchy is role-based, not a uniform mathematical scale.

### Hierarchy

- **Display:** sentence-case home title; `display` defines its desktop setting. It steps through 64px and 60px, then 52px on phones and 46px below 370px.
- **Headline:** Poppins catalogue and About headings; `headline` defines the default. Catalogue uses 40px on phones and About uses 44px. Mobile catalogue source status sits below its title.
- **Reading title:** Inter article heading; `reading-title` steps to 34px below the first desktop breakpoint and 29px on phones, with 1.3 line height on phones.
- **Title:** Inter research-result heading; `title` steps to 22px on phones. Related-list headings use 22px, then 21px.
- **Body:** `body` is the inherited page setting. Full abstracts use `reading-body` and a maximum measure of 75ch; result summaries use 14px at 1.9 line height and a maximum of 78ch.
- **Label:** `label` is the navigation and text-control base. Metadata generally uses 10–13px with generous line height, and dates/counts use tabular numerals.

### Named Rules

**The Reading Type Rule.** Set full research titles and abstracts in Inter; reserve Poppins for display headings and compact visual-network titles.

## Layout

The centered container is capped at 1280px with 48px desktop side margins. At 1023px and below, margins become 32px; at 767px and below, they become 20px. Reused spacing steps appear in frontmatter. These are observed CSS values, not a new utility scale.

Catalogue layout uses a 215px filter column and flexible results with a 54px gap. At 1100px and below it becomes a 195px filter column with a 34px gap. On phones the filters become an expandable section above results, with two filter columns; below 370px those options stack into one column. Research rows use fine bottom rules and 30px vertical padding, reduced to 25px on phones.

Detail layout pairs a reading column of up to 760px with a 250–300px aside and a 75px gap. It tightens to a 270px aside and 40px gap below 1100px, then becomes one reading column below 1023px. The aside stops being sticky and becomes two panels in a row; on phones those panels stack. Abstract text remains 16px at 1.9 line height on phones.

The exploration artwork follows the available canvas bounds. Desktop copy occupies roughly half the container, with real-paper links in the surrounding field. Up to five links are visible on wide screens, three at 1100px and below, and two at 1023px and below. At 767px and below, the two links enter a normal two-column flow below search, their titles become visible without hover, and the search submit action becomes an accessible arrow button. Navigation wraps into its own full-width row. The sidecar records the exact breakpoint values.

## Elevation & Depth

The system uses no box shadows. Depth comes from lavender-versus-paper grounds, muted lavender panels, fine borders, and the canvas character volume. Paper fragments use a translucent warm-paper backing to hold text above the field. Hover changes color, border, or underline rather than lifting surfaces.

### Named Rules

**The Flat Surface Rule.** Separate content with fine rules, spacing, and tonal panels. The shipped system uses no box shadows.

## Shapes

Controls have gentle corners: `control` corners apply to small embedded buttons, checkboxes, and tags; `sm` corners apply to primary buttons and search containers. Research rows, support panels, and network nodes retain square edges. Small circular markers denote status or network points, and the loading indicator is circular. These native circles are part of the world; there is no blanket prohibition on rounded geometry.

## Components

### Buttons

Primary buttons are compact, solid purple rectangles with paper-white text, `sm` corners, and the frontmatter padding. Their foreground and background transition over the shared fast duration. Hover uses the deeper blue. Text buttons are open links with underline on hover; icon buttons use a quiet gray hover fill. Search submit is a distinct embedded variant with tighter corners.

Keyboard focus uses a 2px outline with 5px offset. Purple focus remains visible on the paper and lavender surfaces. Search containers use a 3px-offset focus-within outline; checkbox labels use a 2px offset. The skip link becomes visible on focus. Route changes focus the destination heading without drawing a control outline around that heading.

### Chips

Keyword tags use cool-gray fill, Tag Plum text, `control` corners, and compact padding. In article details they become links with a 38px minimum height and pale lavender hover. Active search and collection filters are removable buttons with pale lavender fill, deeper-blue text, and 36px minimum height, increasing to 44px on phones. A selected checkbox combines color with a visible SVG check.

### Cards / Containers

Research results are open rows with fine bottom rules, not elevated cards. Their title underlines and turns project purple on hover; the entire result remains a link with visible keyboard focus. The publication action area has a purple top rule. Virtual-library and About support panels use a flat lavender fill, square corners, and the established panel padding. Missing locations are explained explicitly rather than shown as disabled invented destinations.

### Inputs / Fields

Search uses a paper surface, a Control Plum stroke, `sm` corners, an inline search icon, a labelled text input, and the embedded action. Home uses a white surface on the pale lavender ground. The input is 15px on desktop and 16px on phones. Focus is carried by the containing form. A clear button appears only when text exists and returns focus to the input. Source-loading, retry, and empty-result states keep the same type and primary-action language.

### Navigation

Primary navigation uses small bracketed text links with 44px minimum targets. Active state adds an underline; hover and active state change color. On the lavender homepage, text stays dark and focus stays purple. Phone navigation remains visible as a full-width row rather than becoming a hidden menu. Footer links preserve the same quiet underline and focus behavior.

### Research field and related research

The homepage signature is a native canvas sculpture made from purple ASCII characters, sparse rose highlights, faint grid lines, and deterministic stars. Paper links are separate DOM links containing real authors and years; full titles appear on hover or keyboard focus and remain available to assistive technology. The artwork excludes measured reading-control regions so it does not draw through navigation, introduction, suggestions, or motion controls.

The canvas targets roughly 30 frames per second, caps device-pixel ratio at 2, and stops while paused, offscreen, or in a hidden tab. Reduced motion supplies a static painted frame and a visible reduced-motion state. Pause keeps the current phase instead of replacing the composition. CSS transitions and the loading animation also honor reduced motion.

The related-research graph is a separate, data-grounded component with rectangular nodes and fine connector lines. It offers a readable list alternative when connections exist and a quiet empty state when none exist. Connections describe shared topics, collections, or tags; decorative home positions do not imply a scholarly relationship.

## Do's and Don'ts

### Do:

- **Do** keep catalogue rows and full abstracts readable on the light research ground.
- **Do** expose the same paper-link information on keyboard focus that appears on hover.
- **Do** retain the motion pause control and honor reduced-motion preferences.
- **Do** use real Zotero titles, authors, collections, and tags, with explicit missing-data states.
- **Do** use inline SVG for interface icons and native canvas for the character artwork.

### Don't:

- **Don't** imply citations with decorative paper positions or topical network connections.
- **Don't** animate dense reading text or extend the homepage artwork across article content.
- **Don't** replace open research rows with decorative elevated cards.
- **Don't** treat unused declarations or auxiliary eyebrow labels as new reusable system rules.

Not canonized: existing auxiliary eyebrow labels on publication/About panels are residual craft-floor drift, not a reusable heading pattern. The rose accent is decorative; medium-radius declarations remain outside the extracted primitive set. Source metadata artifacts remain source content, not typography rules. This documentation pass does not change those implementation details.
