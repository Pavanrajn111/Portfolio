(() => {
  const stage = document.querySelector('.pv-stage'); if (!stage) return;
  const hero = stage.parentElement, tilt = stage.querySelector('.pv-tilt');
  const cv = stage.querySelector('.pv-particles'), ctx = cv.getContext('2d');
  const reduce = matchMedia('(prefers-reduced-motion:reduce)').matches;
  const MAX = innerWidth < 700 ? 45 : 120, LOOP = 8000;
  let W = 0, H = 0, P = [], t0 = performance.now(), spin = [];
  /* mouse tilt */
  hero.addEventListener('pointermove', e => {
    const r = hero.getBoundingClientRect();
    tilt.style.setProperty('--ry', ((e.clientX - r.left) / r.width - .5) * 16 + 'deg');
    tilt.style.setProperty('--rx', -((e.clientY - r.top) / r.height - .5) * 10 + 'deg');
  });
  hero.addEventListener('pointerleave', () => { tilt.style.setProperty('--ry', '0deg'); tilt.style.setProperty('--rx', '0deg'); });
  /* canvas */
  const size = () => { const d = Math.min(devicePixelRatio || 1, 2); W = cv.clientWidth; H = cv.clientHeight; cv.width = W * d; cv.height = H * d; ctx.setTransform(d, 0, 0, d, 0, 0); };
  new ResizeObserver(size).observe(cv); size();
  const spawn = burst => {
    const a = Math.random() * 6.283, rr = Math.random() * W * .14, bx = W * .625, by = H * .81;
    P.push({ x: bx + Math.cos(a) * rr, y: burst ? by - Math.random() * H * .45 : by + Math.sin(a) * rr * .3,
      vx: (Math.random() - .5) * (burst ? .8 : .25), vy: -(Math.random() * .9 + .3) * (burst ? 1.4 : 1),
      r: Math.random() * 1.8 + .6, l: 0, m: 110 + Math.random() * 120 });
  };
  /* sync with the CSS loop and speed the rings up during charge-up */
  const sync = () => {
    const all = document.getAnimations();
    const c = all.find(a => a.animationName === 'pvClip'); if (c && c.startTime != null) t0 = c.startTime;
    spin = all.filter(a => /^pvSpin/.test(a.animationName || ''));
  };
  window.pvStart = () => { stage.classList.remove('pv-wait'); setTimeout(sync, 150); };
  if (!document.getElementById('pvl')) window.pvStart();
  const tick = now => {
    const ph = (((now - t0) % LOOP) + LOOP) % LOOP / LOOP, dis = ph > .78 && ph < .93, chg = ph < .14;
    const rate = chg ? 1 + 4 * Math.sin(Math.PI * ph / .14) : 1; spin.forEach(a => a.playbackRate = rate);
    if (!reduce) {
      let n = dis ? 3 : chg ? 1.5 : .5;
      while (n > 0) { if (Math.random() < Math.min(n, 1) && P.length < MAX * (dis ? 2 : 1)) spawn(dis); n--; }
      ctx.clearRect(0, 0, W, H); ctx.globalCompositeOperation = 'lighter';
      P = P.filter(p => p.l < p.m);
      for (const p of P) {
        p.x += p.vx; p.y += p.vy; p.l++;
        ctx.fillStyle = `rgba(25,230,255,${Math.sin(Math.PI * p.l / p.m) * .85})`;
        ctx.beginPath(); ctx.arc(p.x, p.y, p.r, 0, 6.283); ctx.fill();
      }
    }
    requestAnimationFrame(tick);
  };
  requestAnimationFrame(tick);
})();
