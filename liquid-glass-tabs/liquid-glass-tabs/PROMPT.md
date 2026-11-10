# Prompt: Liquid Glass Tabs (paste into any AI coding tool)

Build a reusable, dependency-free "liquid glass" tab bar component (vanilla HTML/CSS/JS, files: `liquid-glass-tabs.css`, `liquid-glass-tabs.js`, demo `index.html`). Adapt to my stack (React/Next/Vue/Tailwind) if I specify one.

## Visual design
- Page background: soft vertical gradient, light grey (#d7d7d7) at top, staying light until ~45%, then darkening to charcoal (#4d4d52) at the bottom. Minimal, monochrome, Apple-like.
- Track: full-width pill (height ~66px, fully rounded) that looks *recessed*: faint darker fill (rgba(0,0,0,.045)), soft inset top shadow, 1px light highlight along the bottom edge. 4 equal-width tabs: Work, Studio, Journal, Contact.
- Labels: Inter 500, ~17px, tight letter-spacing. Inactive #8d8d8d, active #262626. Colour blends smoothly based on how much the lens overlaps each label (use color-mix).
- Lens (the active indicator): a glass pill slightly inset from the track, one tab wide. Nearly transparent white fill (~14%) with backdrop-filter blur(1.5px) saturate(1.35) brightness(1.05). 1px bright white rim, soft inner top highlight, subtle inner bottom shade, a faint cool-blue fringe on the left edge and faint pink fringe on the right edge (iridescent refraction, very subtle), a thin gradient ring via mask, a blurred specular highlight near the top, and a soft drop shadow beneath so it floats above the track. Labels sit above the lens so text stays crisp.
- Small hint text centered below: "Click a tab, drag the lens, or use ← →" in muted grey.

## Behaviour
- Click a tab: lens springs to it (spring physics via requestAnimationFrame: stiffness ~260, damping ~22, slight overshoot).
- Drag the lens (pointer events, mouse + touch): follows the pointer, clamped to the track; on release snaps to the nearest tab. Dragging on empty track also grabs the lens.
- Squash & stretch: while moving, lens scaleX increases and scaleY decreases proportional to velocity (max ~+16% / -7%); a slight scale-up while grabbed. Cursor grab/grabbing.
- Keyboard: ← → change tab (global and when focused). Roving tabindex, role=tablist/tab, aria-selected, visible focus ring.
- Respect prefers-reduced-motion (snap, no spring). Handle resize with ResizeObserver.
- API: `new LiquidGlassTabs(el, { initial, onChange(index, button), stiffness, damping })` and `.select(i)`.
- Theming through CSS variables on `.lgt` (height, padding, font, text colours, track, glass, rim).

## Deliverables
Component files + demo page + short README explaining how to copy it into another project. Keep it under ~250 lines total, commented, no external libraries except the Inter font.
