# Prompt: Expanding Accordion Gallery

Build a reusable, dependency-free "expanding accordion gallery" component (vanilla HTML/CSS/JS: `expanding-accordion-gallery.css`, `.js`, demo `index.html`). Adapt to my stack if I specify one.

## Visual
- Dark, cinematic page: near-black background (#050608) with a faint lighter glow at the top. Component centred, ~640px wide, 400px tall.
- 5 vertical rounded panels (radius ~18px, 14px gap). Closed panels are slim (~60px), the open one is ~5.4x wider. Each panel is a full-bleed image; closed panels show a centred slice of the image (image keeps a fixed width, it is not squashed) and are dimmed (~55% opacity), brightening slightly on hover. The open panel is full brightness.
- A bottom dark gradient fade on every panel for text legibility.
- Number label (01-05) at the top: centred in closed panels, slides to the top-left in the open panel and turns white. Inter 600, 12px.
- Bottom area: closed panels show only a small line icon (stroke 1.6, 16px, muted white) centred. The open panel additionally reveals a 2-line centred caption (13px, muted grey) above, and the icon + title (white, 12.5px, 500) side by side below it. Caption and title fade/slide in with a short delay.
- Demo content: 01 Polar Studio (shield icon), 02 Ember Drift (chat), 03 Glass Cargo (bag), 04 First Contact (tag), 05 Bent Light (sparkle). Panel 4 open by default. Use rich CSS-gradient artwork as image placeholders (aurora + gold streak, burnt-orange streaks, dark glass, glowing moon over a hand, violet/gold metal) that can be replaced with real images via a `--img` CSS variable.

## Behaviour
- Hover (mouse) or click/tap a panel to open it; the previous one closes. Animate flex-grow with ~0.65s cubic-bezier(.22,.9,.24,1).
- Keyboard: arrow keys move between panels, roving tabindex, aria-expanded, focus ring. Respect prefers-reduced-motion.
- Responsive: under ~520px container width, stack panels vertically.
- API: `new ExpandingAccordion(el, { initial, trigger: 'hover'|'click', onChange(i, el) })`, `.open(i)`.
- Theme via CSS variables on `.eag` (height, gap, radius, open weight, speed, bg, text).

## Deliverables
Component files + demo + short README on reusing it in another project. Commented, ~200 lines total.
