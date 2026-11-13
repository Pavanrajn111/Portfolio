/* PAVAN ring loader. Real progress = how many assets have loaded.
   Config: ASSETS (files to wait for), MIN/MAX times, KEY (session flag).
   Add ?loader to the URL to force it to show again during testing. */
(() => {
  const L = document.getElementById('pvl'), root = document.documentElement;
  const hero = document.querySelector('.hero-artwork');
  const ASSETS = ['public/assets/hero-bg.jpg', 'public/assets/pavan-cutout.png', 'public/assets/pavan-letters.png'];
  const MIN = 1500, MAX = 3200, KEY = 'pvLoaderSeen';
  const start = () => { root.classList.remove('pv-loading'); window.pvStart && window.pvStart(); };
  if (!L) return start();
  if (root.classList.contains('pv-skip')) { L.remove(); return start(); }   // already seen this session

  const num = L.querySelector('[data-pct]'), stat = L.querySelector('[data-stat]');
  const label = p => p < 30 ? 'INITIALIZING SYSTEM' : p < 65 ? 'LOADING ASSETS' : p < 100 ? 'CALIBRATING HOLOGRAM' : 'READY';
  const setP = p => { p = Math.round(p); L.style.setProperty('--p', p); num.textContent = p; stat.textContent = label(p); };

  let done = 0; const total = ASSETS.length + 1;       // +1 = window load
  const tick = () => { done++; };
  ASSETS.forEach(src => { const i = new Image(); i.onload = i.onerror = tick; i.src = src; });
  if (document.readyState === 'complete') tick(); else addEventListener('load', tick, { once: true });

  const t0 = performance.now(); let shown = 0, last = t0;
  const finish = () => {
    setP(100); L.classList.add('done');
    try { sessionStorage.setItem(KEY, '1'); } catch (e) {}
    setTimeout(() => {
      L.classList.add('out'); hero && hero.classList.add('reveal'); start();
      setTimeout(() => L.remove(), 900);
    }, 800);
  };
  const frame = now => {
    const el = now - t0, dt = now - last; last = now;
    let target = Math.min(done / total * 100, el / MIN * 100);   // real progress, but never faster than MIN
    if (el >= MAX) target = 100;                                  // slow network: don't hold the visitor
    shown += (target - shown) * (1 - Math.exp(-dt / 110));
    if (target >= 100 && shown > 99.3) return finish();
    setP(shown); requestAnimationFrame(frame);
  };
  setP(0); requestAnimationFrame(frame);
  setTimeout(() => { if (!L.classList.contains('done')) { shown = 100; finish(); } }, 6000); // hard failsafe
})();
