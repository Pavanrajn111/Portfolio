# Liquid Glass Tabs

Reusable glass-lens tab bar. No dependencies.

## Use in any project
1. Copy `liquid-glass-tabs.css` and `liquid-glass-tabs.js` into your project.
2. Add the markup:
```html
<nav class="lgt" id="nav">
  <div class="lgt-lens"></div>
  <button class="lgt-tab">Work</button>
  <button class="lgt-tab">Studio</button>
  <button class="lgt-tab">Journal</button>
</nav>
```
3. Initialise:
```js
const tabs = new LiquidGlassTabs(document.getElementById('nav'), {
  initial: 0,
  onChange: (index, button) => { /* switch your page/section */ }
});
```

## Customise (CSS variables on `.lgt`)
`--lgt-height`, `--lgt-pad`, `--lgt-font`, `--lgt-font-size`, `--lgt-text`,
`--lgt-text-active`, `--lgt-track`, `--lgt-glass`, `--lgt-rim`.
Spring feel: `stiffness` (default 260) and `damping` (default 22) options.

## Notes
- Any number of tabs works (equal-width columns).
- The glass looks best over a gradient or image; `backdrop-filter` needs a modern browser.
- Keyboard: ← → ; ARIA tablist roles included; respects `prefers-reduced-motion`.
- React/Vue: call `new LiquidGlassTabs(ref.current, …)` in `useEffect`/`onMounted`.
