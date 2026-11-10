/*
 * Liquid Glass Tabs — vanilla JS, no dependencies.
 *
 *   <nav class="lgt" id="nav">
 *     <div class="lgt-lens"></div>
 *     <button class="lgt-tab">Work</button> ...
 *   </nav>
 *
 *   const tabs = new LiquidGlassTabs(document.getElementById('nav'), {
 *     initial: 0,
 *     onChange: (index, button) => {}
 *   });
 *   tabs.select(2);  // programmatic
 */
class LiquidGlassTabs {
  constructor(root, opts = {}) {
    this.root = root;
    this.lens = root.querySelector('.lgt-lens');
    this.tabs = [...root.querySelectorAll('.lgt-tab')];
    this.onChange = opts.onChange || (() => {});
    this.stiffness = opts.stiffness ?? 260;
    this.damping = opts.damping ?? 22;
    this.reduced = matchMedia('(prefers-reduced-motion: reduce)').matches;

    this.index = Math.min(opts.initial ?? 0, this.tabs.length - 1);
    this.dragging = false;
    this.x = this.tx = 0; this.v = 0;
    this.last = 0; this.raf = 0;

    root.setAttribute('role', 'tablist');
    this.tabs.forEach((t, i) => {
      t.setAttribute('role', 'tab');
      t.addEventListener('click', () => this.select(i));
    });

    this.measure();
    this.x = this.tx = this.targetX(this.index);
    this.render(); this.paintTabs();
    this.sync();

    new ResizeObserver(() => { this.measure(); this.tx = this.targetX(this.index); if (!this.dragging) this.x = this.tx; this.render(); this.paintTabs(); })
      .observe(root);

    this.lens.addEventListener('pointerdown', (e) => this.dragStart(e));
    root.addEventListener('pointerdown', (e) => { if (e.target === root) this.dragStart(e, true); });
    root.addEventListener('keydown', (e) => {
      if (e.key === 'ArrowRight') { e.preventDefault(); this.select(this.index + 1, true); }
      if (e.key === 'ArrowLeft')  { e.preventDefault(); this.select(this.index - 1, true); }
    });
    // global arrows (works even when nothing is focused)
    addEventListener('keydown', (e) => {
      if (e.target.closest && e.target.closest('input,textarea,select,[contenteditable]')) return;
      if (e.key === 'ArrowRight') this.select(this.index + 1);
      if (e.key === 'ArrowLeft')  this.select(this.index - 1);
    });
  }

  measure() {
    const cs = getComputedStyle(this.root);
    this.pad = parseFloat(cs.paddingLeft) || 0;
    const r = this.root.getBoundingClientRect();
    this.rootW = r.width;
    this.cell = (r.width - this.pad * 2) / this.tabs.length;
    this.lensW = Math.max(this.cell - 4, 40);
    this.lens.style.width = this.lensW + 'px';
  }
  targetX(i) { return this.pad + i * this.cell + (this.cell - this.lensW) / 2; }
  minX() { return this.targetX(0); }
  maxX() { return this.targetX(this.tabs.length - 1); }

  select(i, focus = false) {
    i = Math.max(0, Math.min(this.tabs.length - 1, i));
    const changed = i !== this.index;
    this.index = i;
    this.tx = this.targetX(i);
    this.sync();
    if (focus) this.tabs[i].focus({ preventScroll: true });
    if (changed) this.onChange(i, this.tabs[i]);
    this.animate();
  }
  sync() {
    this.tabs.forEach((t, i) => {
      t.setAttribute('aria-selected', String(i === this.index));
      t.tabIndex = i === this.index ? 0 : -1;
    });
  }

  dragStart(e, fromTrack = false) {
    this.dragging = true;
    this.lens.classList.add('is-dragging');
    this.lens.setPointerCapture?.(e.pointerId);
    const rect = this.root.getBoundingClientRect();
    this.grab = fromTrack ? this.lensW / 2 : e.clientX - rect.left - this.x;
    const move = (ev) => {
      const nx = ev.clientX - rect.left - this.grab;
      this.tx = Math.max(this.minX(), Math.min(this.maxX(), nx));
      this.animate();
    };
    const up = () => {
      removeEventListener('pointermove', move);
      removeEventListener('pointerup', up);
      removeEventListener('pointercancel', up);
      this.dragging = false;
      this.lens.classList.remove('is-dragging');
      const centre = this.x + this.lensW / 2 - this.pad;
      this.select(Math.floor(centre / this.cell));
    };
    addEventListener('pointermove', move);
    addEventListener('pointerup', up);
    addEventListener('pointercancel', up);
    move(e);
    e.preventDefault();
  }

  animate() { if (!this.raf) { this.last = performance.now(); this.raf = requestAnimationFrame((t) => this.step(t)); } }

  step(now) {
    const dt = Math.min((now - this.last) / 1000, 0.032); this.last = now;
    if (this.reduced) { this.x = this.tx; this.v = 0; }
    else if (this.dragging) {          // follow pointer tightly while dragging
      const nx = this.x + (this.tx - this.x) * 0.45;
      this.v = (nx - this.x) / Math.max(dt, 0.001);
      this.x = nx;
    } else {                           // spring to target
      const a = this.stiffness * (this.tx - this.x) - this.damping * this.v;
      this.v += a * dt; this.x += this.v * dt;
    }
    this.render(); this.paintTabs();
    const settled = !this.dragging && Math.abs(this.tx - this.x) < 0.1 && Math.abs(this.v) < 2;
    if (settled) { this.x = this.tx; this.v = 0; this.render(); this.paintTabs(); this.raf = 0; }
    else this.raf = requestAnimationFrame((t) => this.step(t));
  }

  render() {
    const speed = Math.min(Math.abs(this.v), 3000);
    const sx = 1 + speed / 3000 * 0.16 + (this.dragging ? 0.05 : 0);   // stretch with speed
    const sy = 1 - speed / 3000 * 0.07 - (this.dragging ? 0.02 : 0);
    this.lens.style.transform = `translate3d(${this.x}px,0,0) scale(${sx},${sy})`;
  }

  // Blend each label toward the "active" colour by how much the lens covers it.
  paintTabs() {
    const l0 = this.x, l1 = this.x + this.lensW;
    this.tabs.forEach((t, i) => {
      const c0 = this.pad + i * this.cell, c1 = c0 + this.cell;
      const overlap = Math.max(0, Math.min(l1, c1) - Math.max(l0, c0)) / this.cell;
      t.style.color = `color-mix(in srgb, var(--lgt-text-active) ${Math.round(Math.min(1, overlap * 1.4) * 100)}%, var(--lgt-text))`;
    });
  }
}
if (typeof module !== 'undefined') module.exports = LiquidGlassTabs;
