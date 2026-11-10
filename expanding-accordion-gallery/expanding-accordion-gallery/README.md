# Expanding Accordion Gallery

Vertical image panels; the active one expands to show a large image, caption, icon and title. No dependencies.

## Use in any project
1. Copy `expanding-accordion-gallery.css` + `.js`.
2. Markup (repeat the `<button class="eag-panel">` block per item):
```html
<section class="eag" id="gallery">
  <button class="eag-panel" style="--img:url('images/one.jpg')">
    <div class="eag-art"></div>
    <span class="eag-num">01</span>
    <div class="eag-foot">
      <p class="eag-caption">Your caption here.</p>
      <div class="eag-meta"><svg viewBox="0 0 24 24"><!-- icon --></svg><span class="eag-title">Title</span></div>
    </div>
  </button>
</section>
```
3. `new ExpandingAccordion(document.getElementById('gallery'), { initial: 0, trigger: 'hover' })`

## Swap the artwork
Set `--img:url(...)` on each panel. The included demo uses CSS gradients (`--art`) as placeholders.

## Customise (variables on `.eag`)
`--eag-height`, `--eag-gap`, `--eag-radius`, `--eag-open` (open-panel width weight), `--eag-speed`, `--eag-bg`, `--eag-muted`.
`trigger: 'click'` for click-only. Works with any number of panels; stacks vertically below ~520px wide; keyboard arrows + reduced-motion supported.
