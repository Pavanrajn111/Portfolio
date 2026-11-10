# Prompt: Folder Reveal Cards

Build a reusable, dependency-free "folder reveal cards" component (vanilla HTML/CSS/JS: `folder-reveal-cards.css`, optional `.js`, demo `index.html`). Adapt to my stack if I specify one.

## Visual
- Near-black page with a faint glow at the top. Three portrait cards (~198x276px, radius ~18px, 26px gap) centred, each with a 2px ring and soft coloured glow.
- Each card is a "folder": a coloured image area on top and a dark/light body below. The body's top edge is NOTCHED: the left ~63% sits higher, and the right ~37% steps down ~24px with smooth rounded corners (convex corner at the top of the step, concave at the bottom). Build the notch with CSS mask (px-based, no images), driven by CSS variables.
- At rest the image area is a thin strip (~52px) showing only a gradient with a diagonal light streak. The body has a huge bold number (40px, weight 800, tight tracking) at top-left, a small "↗" arrow at top-right, and at the bottom a bold 11px title plus 10px muted two-line description.
- Themes: 01 "Built for speed" - violet gradient art, deep indigo body, white number. 02 "Made to bend" - coral-to-pink art, light grey body fading to mid-grey, black number, silver ring. 03 "Room to grow" - silver-blue art, dark slate body, white number.

## Behaviour
- On hover (and keyboard focus / tap on touch): the body slides down (image area grows from ~52px to ~126px, 0.6s cubic-bezier(.2,.9,.25,1)); a 3D-style object fades/scales up (translateY 26px, scale .82 -> 1) inside the image area: a chrome holographic arrow (01), an open folded frame with gold edges (02), blue glass blades (03). Use SVG placeholders replaceable by <img>. The diagonal sheen drifts slightly, the arrow nudges up-right.
- Touch: first tap reveals, second tap follows the link. Cards are <a> elements, focus-visible ring. Respect prefers-reduced-motion.
- Theme through CSS variables per card (--art, --body, --num, --title, --muted, --ring, --glow, and geometry --w, --hgt, --h-rest, --h-open, --nl, --nh, --r).

## Deliverables
Component files + demo + short README on reusing it in another project. Commented, compact.
