# Folder Reveal Cards

Notched "folder" cards. On hover the notch slides down and an image/3D object pops out of the top area. No dependencies.

## Use in any project
1. Copy `folder-reveal-cards.css` (+ optional `folder-reveal-cards.js` for touch devices).
2. Markup (repeat per card; pick a theme class `t-violet`, `t-light`, `t-slate`):
```html
<section class="frc">
  <a class="frc-card t-violet" href="#">
    <div class="frc-art"></div>
    <div class="frc-obj"><!-- your <img> or inline <svg> --></div>
    <div class="frc-body">
      <span class="frc-num">01</span>
      <svg class="frc-arrow" viewBox="0 0 10 10"><path d="M2 8L8 2M3.5 2H8v4.5"/></svg>
      <div class="frc-foot"><h3 class="frc-title">Title</h3><p class="frc-text">Short description.</p></div>
    </div>
  </a>
</section>
```
3. Optional (touch): `new FolderRevealCards(document.querySelector('.frc'))` — first tap reveals, second tap follows the link.

## Use your own image / 3D render
Put a transparent PNG or WebP inside `.frc-obj` (e.g. `<img src="arrow.png" alt="">`, give it `height:100%; object-fit:contain`). The demo uses simple SVG placeholders.

## Customise (variables on `.frc-card`)
Geometry: `--w`, `--hgt`, `--h-rest`, `--h-open`, `--nl` (notch start, px), `--nh` (notch depth), `--r` (notch radius), `--speed`.
Theme: `--art` (top gradient/image), `--body`, `--num`, `--title`, `--muted`, `--ring`, `--glow`.
Make a new theme: add a class that sets those variables.

## Notes
Works on hover, keyboard focus and touch. Respects `prefers-reduced-motion`. The notch is drawn with CSS mask (no images), so it scales with the variables.
