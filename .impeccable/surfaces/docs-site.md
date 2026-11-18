---
version: 1
slug: "docs-site"
primary_target: "docs-site"
related_targets: []
---

# Website redesign

Mode: Persuade for the homepage, Read for documentation. Product truth stays in product Markdown. The homepage uses the real existing deployer screenshot; visual polish changes only its surrounding presentation.

Grounded candidates considered: engineering publication; software release catalogue; product exhibition with a working documentation library; architectural portfolio; typography specimen; workshop field guide; open-source community portal. The third direction carries the product through real interfaces and distinct reading paths. Seed challengers (grid specimen, glyph cascade, immersive portal) do not improve product clarity; retain their composition discipline, without decorative grids, rain or cinematic controls.

## Direction contract

THESIS: A real product front door leads into a task-based documentation library. The homepage explains and demonstrates; it does not reproduce the repository document.

OWN-WORLD: A continuous white and pale lavender surface, with violet actions inherited from the existing icon. Spacious Chinese display typography, compact navigation, visible real application screens, softly rounded controls. Reading surfaces are restrained and bright in daytime use, with a complete native dark theme.

STORY: A plugin user learns what AFR does, downloads the installer, checks CAD compatibility, configures fonts and verifies the drawing. The public site serves installation, everyday use and troubleshooting. Internal architecture and implementation plans remain in repository documents.

FIRST VIEWPORT: Horizontal navigation above a pale lavender exhibition area. Two lines explain the real AFR benefit on the left; one genuine deployer screenshot, capped at 472px desktop / 320px mobile, sits on the right. Outline brand typography is centered by its intrinsic width, with balanced insets and pointer movement bounded by available space. Static centering remains in reduced motion. The scroll progress is a child of the navigation header at its inner bottom edge. Three linked functional nodes complete the hero. User scenarios follow on white, then the three-step onboarding returns to the same pale canvas. Dark mode changes all surfaces together.

FORM: Product exhibition and documentation library, candidate 3; seed:45660bbabbdb78ab. Vite informs clear product/action hierarchy; Godot informs demonstration-led presentation and separate documentation/download paths. These are references, not copied layouts or assets.

FINISH: unreviewed and undocumented is unfinished; this build ends with the finish review, the verdict, DESIGN.md, and every shipping raster carrying its provenance

## References

- https://vite.dev/ — inspected 2026-11-03; product thesis, first action, distinct feature narrative.
- https://godotengine.org/zh-cn/ — inspected 2026-11-03; real product context, download and docs navigation.
- https://starlight.astro.build/guides/overriding-components/ — supported native component overrides, retained Pagefind and navigation.

Palette: paper #ffffff, canvas #f6f5fb, ink #20243a, muted #5a6078, violet #6654c7, dark canvas #232a3f. Headings: self-hosted Noto Sans SC subset; body: self-hosted Noto Sans SC with system Chinese sans fallback. Left-aligned reading text, 45rem reading width, deliberate large vertical gaps between narrative sections.

## Current homepage refinement, 2026-11-03

Use one real deployer screenshot from the product repository. Preserve its controls, text, layout, version and status. The screenshot is a historical UI reference, not new release or future-product evidence. Use CSS surface, inset and offset soft shadow to present it; keep the raw image accessible. User requested no invented software interface and no multi-window image gallery.

The homepage leads with AFR benefits, then three specific use scenarios, a three-step start guide and practical documentation paths. Preserve native search, responsive reading layout and real image viewing. Public navigation and search contain user documentation.

## Motion refinement, 2026-11-03

The entire documentation site is approved by the user as of 2026-11-03. Preserve the adopted homepage and reading-page composition, real UI, user audience and motion. See the [design specification](../../DESIGN.md) for the adopted visual system and the [site maintenance guide](../../docs-site/README.md) for editing and build steps.

## Reading refinement, 2026-11-03

Modules, installation, the user guide and configuration/results pages use a scoped reading surface: a compact pale-lavender title card bounded to the body column with 12px corners and neutral surrounding space, source-backed introduction and two actionable links, numbered instructions, restrained notes, compact genuine screenshots with original-image viewing, and source-table task links. Native Starlight TOC, sidebar, mobile navigation, search, copy and pagination stay in place. No reading-page entrance choreography. Content and raw images retain their original Markdown sources; the homepage stays frozen.

All remaining public reading routes share the compact body-width title card. Downloads use the title's release action without another promotional block. FAQ uses native disclosures and concise user-facing answers; fonts retain the searchable original file list and source attribution; compatibility keeps a semantic, horizontally scrollable table. Migration source paragraphs are grouped by task, and feedback/support keep their original destinations and source assets. Route-specific refinements do not alter the approved homepage or earlier reading-page composition.

## Homepage motion contract

Focal moment: product-benefit title, real UI and outline brand are revealed by a left-to-right mask within 900ms; the connecting line then crosses the three functional nodes in 1000ms, with each node briefly scaling and changing color. An 1100ms light pulse runs along the connection on entry and pointer/keyboard interaction. Continuity: expandable user scenarios reveal their instructions in 350ms; ordered start numbers appear sequentially on first entry. Feedback: bounded brand movement (28px pointer / 85px scroll), CTA sweep, press and directional arrows. Budget: native APIs, no dependencies, no idle loops, no blur or animated shadow field. Hidden-page and runtime reduced-motion changes cancel active sequences. Reduced motion preserves static composition, focus, color and progress. All content and native disclosure work without JavaScript.
