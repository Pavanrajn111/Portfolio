/*
 * Expanding Accordion Gallery — vanilla JS, no dependencies.
 *
 *   const g = new ExpandingAccordion(document.getElementById('gallery'), {
 *     initial: 3,            // open panel (0-based)
 *     trigger: 'hover',      // 'hover' | 'click'   (touch always uses tap)
 *     onChange: (i, el) => {}
 *   });
 *   g.open(2);
 */
class ExpandingAccordion {
  constructor(root, opts = {}) {
    this.root = root;
    this.panels = [...root.querySelectorAll('.eag-panel')];
    this.trigger = opts.trigger || 'hover';
    this.onChange = opts.onChange || (() => {});
    this.index = -1;

    this.panels.forEach((p, i) => {
      p.addEventListener('click', () => this.open(i));
      p.addEventListener('focus', () => this.open(i));
      p.addEventListener('pointerenter', (e) => {
        if (this.trigger === 'hover' && e.pointerType === 'mouse') this.open(i);
      });
      p.addEventListener('keydown', (e) => {
        const n = this.panels.length;
        if (e.key === 'ArrowRight' || e.key === 'ArrowDown') { e.preventDefault(); this.open((i + 1) % n, true); }
        if (e.key === 'ArrowLeft'  || e.key === 'ArrowUp')   { e.preventDefault(); this.open((i - 1 + n) % n, true); }
      });
    });
    this.open(opts.initial ?? 0, false, true);
  }

  open(i, focus = false, silent = false) {
    if (i === this.index) return;
    this.index = i;
    this.panels.forEach((p, k) => {
      const on = k === i;
      p.classList.toggle('is-active', on);
      p.setAttribute('aria-expanded', String(on));
      p.tabIndex = on ? 0 : -1;
    });
    if (focus) this.panels[i].focus({ preventScroll: true });
    if (!silent) this.onChange(i, this.panels[i]);
  }
}
if (typeof module !== 'undefined') module.exports = ExpandingAccordion;
