const root = document.documentElement;
const updateViewportWidth = () => {
  root.style.setProperty('--layout-viewport-width', `${root.clientWidth}px`);
};

updateViewportWidth();
window.addEventListener('resize', updateViewportWidth);

const nav = document.getElementById('main-nav');
const tabs = [...nav.querySelectorAll('.lgt-tab')];

const revealEls = document.querySelectorAll('.reveal');
const revealObserver = new IntersectionObserver(
  (entries, observer) => {
    entries.forEach((entry) => {
      if (entry.isIntersecting) {
        entry.target.classList.add('is-visible');
        observer.unobserve(entry.target);
      }
    });
  },
  { threshold: 0.12 }
);

revealEls.forEach((el) => revealObserver.observe(el));

const projectFolders = document.getElementById('project-folders');
new FolderRevealCards(projectFolders);
loadProjectImages(projectFolders);

function initTabsFromHash() {
  const hash = window.location.hash;
  if (!hash) return;
  const target = tabs.find((tab) => tab.dataset.target === hash);
  if (!target) return;
  navTabs.select(tabs.indexOf(target));
}

window.addEventListener('hashchange', initTabsFromHash);
window.addEventListener('load', initTabsFromHash);

function LiquidGlassTabs(root, opts = {}) {
  this.root = root;
  this.lens = root.querySelector('.lgt-lens');
  this.tabs = [...root.querySelectorAll('.lgt-tab')];
  this.onChange = opts.onChange || (() => {});
  this.stiffness = opts.stiffness ?? 260;
  this.damping = opts.damping ?? 22;
  this.reduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  this.index = Math.min(opts.initial ?? 0, this.tabs.length - 1);
  this.dragging = false;
    this.lens.classList.remove('is-dragging');
  this.x = 0;
  this.tx = 0;
  this.v = 0;
  this.raf = 0;
  this.last = 0;

  root.setAttribute('role', 'tablist');
  this.tabs.forEach((tab, i) => {
    tab.setAttribute('role', 'tab');
    tab.tabIndex = i === this.index ? 0 : -1;
    tab.addEventListener('click', () => this.select(i, true));
  });

  this.measure();
  this.x = this.tx = this.targetX(this.index);
  this.render();
  this.paintTabs();
  this.sync();

  const resizeObserver = new ResizeObserver(() => {
    this.measure();
    this.tx = this.targetX(this.index);
    if (!this.dragging) this.x = this.tx;
    this.render();
    this.paintTabs();
  });
  resizeObserver.observe(root);

  this.lens.addEventListener('pointerdown', (event) => this.dragStart(event));
  root.addEventListener('pointerdown', (event) => {
    if (event.target === root) this.dragStart(event, true);
  });
  root.addEventListener('keydown', (event) => {
    if (event.key === 'ArrowRight') {
      event.preventDefault();
      this.select(this.index + 1, true);
    }
    if (event.key === 'ArrowLeft') {
      event.preventDefault();
      this.select(this.index - 1, true);
    }
  });
}

LiquidGlassTabs.prototype.measure = function () {
  const styles = getComputedStyle(this.root);
  this.pad = parseFloat(styles.paddingLeft) || 0;
  const rect = this.root.getBoundingClientRect();
  this.rootW = rect.width;
  this.cell = (rect.width - this.pad * 2) / this.tabs.length;
  this.lensW = Math.max(this.cell - 4, 50);
  this.lens.style.width = this.lensW + 'px';
};

LiquidGlassTabs.prototype.targetX = function (i) {
  return this.pad + i * this.cell + (this.cell - this.lensW) / 2;
};

LiquidGlassTabs.prototype.minX = function () {
  return this.targetX(0);
};

LiquidGlassTabs.prototype.maxX = function () {
  return this.targetX(this.tabs.length - 1);
};

LiquidGlassTabs.prototype.sync = function () {
  this.tabs.forEach((tab, i) => {
    tab.setAttribute('aria-selected', String(i === this.index));
    tab.tabIndex = i === this.index ? 0 : -1;
    tab.style.color = i === this.index ? 'var(--lgt-text-active)' : 'var(--lgt-text)';
  });
};

LiquidGlassTabs.prototype.setIndexQuiet = function (i) {
  if (this.dragging || i === this.index) return;
  i = Math.max(0, Math.min(this.tabs.length - 1, i));
  this.index = i;
  this.tx = this.targetX(i);
  this.sync();
  this.animate();
};

LiquidGlassTabs.prototype.select = function (i, focus = false) {
  i = Math.max(0, Math.min(this.tabs.length - 1, i));
  const changed = i !== this.index;
  this.index = i;
  this.tx = this.targetX(i);
  this.sync();
  if (focus) {
    this.tabs[i].focus({ preventScroll: true });
  }
  if (changed) {
    this.onChange(i, this.tabs[i]);
  }
  this.animate();
};

LiquidGlassTabs.prototype.dragStart = function (event, fromTrack = false) {
  this.dragging = true;
  this.lens.classList.add('is-dragging');
  this.lens.setPointerCapture?.(event.pointerId);
  const rect = this.root.getBoundingClientRect();
  this.grab = fromTrack ? this.lensW / 2 : event.clientX - rect.left - this.x;

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
    const centre = this.x + this.lensW / 2 - this.pad;
    this.select(Math.floor(centre / this.cell));
  };

  addEventListener('pointermove', move);
  addEventListener('pointerup', up);
  addEventListener('pointercancel', up);
  move(event);
  event.preventDefault();
};

LiquidGlassTabs.prototype.animate = function () {
  if (!this.raf) {
    this.last = performance.now();
    this.raf = requestAnimationFrame((time) => this.step(time));
  }
};

LiquidGlassTabs.prototype.step = function (now) {
  const dt = Math.min((now - this.last) / 1000, 0.032);
  this.last = now;

  if (this.reduced) {
    this.x = this.tx;
    this.v = 0;
  } else if (this.dragging) {
    const nx = this.x + (this.tx - this.x) * 0.45;
    this.v = (nx - this.x) / Math.max(dt, 0.001);
    this.x = nx;
  } else {
    const a = this.stiffness * (this.tx - this.x) - this.damping * this.v;
    this.v += a * dt;
    this.x += this.v * dt;
  }

  this.render();
  this.paintTabs();

  const settled = !this.dragging && Math.abs(this.tx - this.x) < 0.1 && Math.abs(this.v) < 2;
  if (settled) {
    this.x = this.tx;
    this.v = 0;
    this.render();
    this.paintTabs();
    this.raf = 0;
  } else {
    this.raf = requestAnimationFrame((time) => this.step(time));
  }
};

LiquidGlassTabs.prototype.render = function () {
  const speed = Math.min(Math.abs(this.v), 3000);
  const sx = 1 + speed / 3000 * 0.18 + (this.dragging ? 0.05 : 0);
  const sy = 1 - speed / 3000 * 0.08 - (this.dragging ? 0.02 : 0);
  this.lens.style.transform = `translate3d(${this.x}px, 0, 0) scale(${sx}, ${sy})`;
};

LiquidGlassTabs.prototype.paintTabs = function () {
  const l0 = this.x;
  const l1 = this.x + this.lensW;
  this.tabs.forEach((tab, i) => {
    const c0 = this.pad + i * this.cell;
    const c1 = c0 + this.cell;
    const overlap = Math.max(0, Math.min(l1, c1) - Math.max(l0, c0)) / this.cell;
    const t = Math.round(Math.min(1, overlap * 1.6) * 100);
    tab.style.color = `color-mix(in srgb, var(--lgt-text-active) ${t}%, var(--lgt-text))`;
  });
};

function ExpandingAccordion(root, opts = {}) {
  this.root = root;
  this.panels = [...root.querySelectorAll('.eag-panel')];
  this.trigger = opts.trigger || 'hover';
  this.index = -1;

  this.panels.forEach((panel, i) => {
    panel.addEventListener('click', (event) => {
      event.preventDefault();
      this.open(i);
    });
    panel.addEventListener('focus', () => this.open(i));
    panel.addEventListener('pointerenter', (event) => {
      if (this.trigger === 'hover' && event.pointerType === 'mouse') {
        this.open(i);
      }
    });
    panel.addEventListener('keydown', (event) => {
      const total = this.panels.length;
      if (event.key === 'ArrowRight' || event.key === 'ArrowDown') {
        event.preventDefault();
        this.open((i + 1) % total, true);
      }
      if (event.key === 'ArrowLeft' || event.key === 'ArrowUp') {
        event.preventDefault();
        this.open((i - 1 + total) % total, true);
      }
    });
  });

  this.open(opts.initial ?? 0);
}

ExpandingAccordion.prototype.open = function (index, focus = false) {
  if (index === this.index) return;
  this.index = index;
  this.panels.forEach((panel, i) => {
    const active = i === index;
    panel.classList.toggle('is-active', active);
    panel.setAttribute('aria-expanded', String(active));
    panel.tabIndex = active ? 0 : -1;
    panel.querySelector('.focus-detail')?.setAttribute('aria-hidden', String(!active));
  });
  if (focus) {
    this.panels[index].focus({ preventScroll: true });
  }
};

function FolderRevealCards(root) {
  if (!root) return;
  const cards = [...root.querySelectorAll('.frc-card')];
  const setOpen = (activeCard) => {
    cards.forEach((card) => {
      const active = card === activeCard;
      card.classList.toggle('is-open', active);
      card.querySelector('.project-toggle')?.setAttribute('aria-expanded', String(active));
      const details = card.querySelector('.project-open-details');
      if (details) {
        details.setAttribute('aria-hidden', String(!active));
        details.toggleAttribute('inert', !active);
      }
    });
  };

  setOpen(null);
  cards.forEach((card) => {
    card.querySelector('.project-toggle')?.addEventListener('click', (event) => {
      event.stopPropagation();
      if (!window.matchMedia('(hover: none)').matches && card.matches(':hover')) {
        setOpen(card);
        return;
      }
      setOpen(card.classList.contains('is-open') ? null : card);
    });
    card.addEventListener('pointerenter', (event) => {
      if (event.pointerType === 'mouse') setOpen(card);
    });
    card.addEventListener('pointerleave', (event) => {
      const nextCard = event.relatedTarget instanceof Element
        ? event.relatedTarget.closest('.frc-card')
        : null;
      if (event.pointerType === 'mouse' && !card.contains(document.activeElement) && !nextCard) {
        setOpen(null);
      }
    });
    card.addEventListener('keydown', (event) => {
      if (event.key === 'Escape' && card.classList.contains('is-open')) {
        setOpen(null);
        card.querySelector('.project-toggle')?.focus();
      }
    });
    card.addEventListener('click', (event) => {
      if (!window.matchMedia('(hover: none)').matches) return;
      if (event.target.closest('a')) {
        if (!card.classList.contains('is-open')) {
          event.preventDefault();
          setOpen(card);
        }
        return;
      }
      if (!card.classList.contains('is-open')) {
        event.preventDefault();
        setOpen(card);
      } else {
        setOpen(null);
      }
    });
  });
}

function loadProjectImages(root) {
  if (!root) return;
  root.querySelectorAll('.project-preview[data-image-path]').forEach((preview) => {
    const path = preview.dataset.imagePath.trim();
    if (!path) return;

    const image = new Image();
    image.alt = '';
    image.onload = () => {
      preview.replaceChildren(image);
      preview.classList.add('has-image');
    };
    image.onerror = () => {
      console.error(`Unable to load project screenshot: ${path}`);
    };
    image.src = path;
  });
}

const navTabs = new LiquidGlassTabs(nav, {
  initial: 0,
  onChange: (_, tab) => {
    const target = tab.dataset.target;
    if (!target) return;
    document.querySelector(target)?.scrollIntoView({ behavior: 'smooth', block: 'start' });
  }
});

const focusGallery = document.getElementById('focus-gallery');
if (focusGallery) {
  new ExpandingAccordion(focusGallery, {
    initial: 0,
    trigger: 'hover'
  });
}

(() => {
  const section = document.getElementById('contact');
  if (!section) return;

  const reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  const wrap = section.querySelector('[data-cc-wrap]');
  const card = section.querySelector('[data-cc-card]');
  const ghost = section.querySelector('[data-cc-ghost]');
  const terminalLines = [
    '> status: open_to_opportunities',
    '> focus: software_development_and_engineering',
    '> interests: DSA + AI/ML + web_systems'
  ];
  const lineEls = [...section.querySelectorAll('[data-cc-line]')];
  let typingStarted = false;
  let copyFeedbackTimer = 0;

  const fillTerminal = () => {
    lineEls.forEach((line, index) => {
      line.textContent = terminalLines[index];
    });
  };

  const typeTerminal = () => {
    if (typingStarted) return;
    typingStarted = true;
    let lineIndex = 0;

    const typeNextLine = () => {
      if (lineIndex >= terminalLines.length) return;

      const currentIndex = lineIndex;
      const target = terminalLines[currentIndex];
      const line = lineEls[currentIndex];
      let characterIndex = 0;
      line.classList.add('cc-cursor');

      const typeNextCharacter = () => {
        characterIndex += 1;
        line.textContent = target.slice(0, characterIndex);
        if (characterIndex < target.length) {
          window.setTimeout(typeNextCharacter, 22 + Math.random() * 26);
        } else {
          line.classList.remove('cc-cursor');
          lineIndex += 1;
          window.setTimeout(typeNextLine, 260);
        }
      };

      typeNextCharacter();
    };

    typeNextLine();
  };

  const activate = () => {
    if (section.classList.contains('cc-in')) return;
    section.classList.add('cc-in');
    if (reduceMotion) fillTerminal();
    else window.setTimeout(typeTerminal, 1500);
  };

  if (wrap && 'IntersectionObserver' in window) {
    const revealObserver = new IntersectionObserver((entries, observer) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          activate();
          observer.disconnect();
        }
      });
    }, { threshold: 0.18 });
    revealObserver.observe(wrap);
  } else {
    activate();
  }

  if (card && !reduceMotion && !window.matchMedia('(hover: none)').matches) {
    card.addEventListener('pointermove', (event) => {
      const rect = card.getBoundingClientRect();
      card.style.setProperty('--cc-mx', `${event.clientX - rect.left}px`);
      card.style.setProperty('--cc-my', `${event.clientY - rect.top}px`);
    });
  }

  const magneticButton = section.querySelector('[data-cc-magnetic]');
  if (magneticButton && !reduceMotion && window.matchMedia('(hover: hover)').matches) {
    magneticButton.addEventListener('pointermove', (event) => {
      const rect = magneticButton.getBoundingClientRect();
      const x = (event.clientX - rect.left - rect.width / 2) * 0.12;
      const y = (event.clientY - rect.top - rect.height / 2) * 0.25;
      magneticButton.style.transform = `translate(${x.toFixed(1)}px, ${y.toFixed(1)}px)`;
    });
    magneticButton.addEventListener('pointerleave', () => {
      magneticButton.style.transform = '';
    });
  }

  const copyButton = section.querySelector('[data-cc-copy]');
  const copyLabel = section.querySelector('[data-cc-copy-label]');
  const email = 'rajnpavan864@gmail.com';

  const fallbackCopy = () => {
    const field = document.createElement('textarea');
    field.value = email;
    field.setAttribute('readonly', '');
    field.style.position = 'fixed';
    field.style.opacity = '0';
    document.body.appendChild(field);
    try {
      field.select();
      return document.execCommand('copy');
    } catch {
      return false;
    } finally {
      field.remove();
    }
  };

  const showCopyFeedback = (copied) => {
    if (!copyButton || !copyLabel) return;
    window.clearTimeout(copyFeedbackTimer);
    copyButton.classList.toggle('cc-copied', copied);
    copyButton.classList.toggle('cc-copy-failed', !copied);
    copyLabel.textContent = copied ? 'Copied' : 'Copy failed';
    copyFeedbackTimer = window.setTimeout(() => {
      copyButton.classList.remove('cc-copied', 'cc-copy-failed');
      copyLabel.textContent = 'Copy';
    }, 2000);
  };

  if (copyButton) {
    copyButton.addEventListener('click', async () => {
      try {
        if (!navigator.clipboard || !navigator.clipboard.writeText) {
          showCopyFeedback(fallbackCopy());
          return;
        }
        await navigator.clipboard.writeText(email);
        showCopyFeedback(true);
      } catch {
        showCopyFeedback(fallbackCopy());
      }
    });
  }
})();

(() => {
  const section = document.getElementById('resume');
  if (!section) return;

  const reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  const wrap = section.querySelector('[data-rc-wrap]');
  const ghost = section.querySelector('[data-rc-ghost]');
  const terminalLines = [
    '> document: verified_academic_cv',
    '> status: ready_for_recruiter_review',
    '> direct_actions: [view_resume, download_resume]'
  ];
  const terminalEls = [...section.querySelectorAll('[data-rc-line]')];
  let typingStarted = false;

  const fillTerminal = () => {
    terminalEls.forEach((line, index) => {
      line.textContent = terminalLines[index];
    });
  };

  const typeTerminal = () => {
    if (typingStarted) return;
    typingStarted = true;
    let lineIndex = 0;

    const typeNextLine = () => {
      if (lineIndex >= terminalLines.length) return;

      const currentIndex = lineIndex;
      const target = terminalLines[currentIndex];
      const line = terminalEls[currentIndex];
      let characterIndex = 0;
      line.classList.add('rc-cursor');

      const typeNextCharacter = () => {
        characterIndex += 1;
        line.textContent = target.slice(0, characterIndex);
        if (characterIndex < target.length) {
          window.setTimeout(typeNextCharacter, 20 + Math.random() * 24);
        } else {
          line.classList.remove('rc-cursor');
          lineIndex += 1;
          window.setTimeout(typeNextLine, 240);
        }
      };

      typeNextCharacter();
    };

    typeNextLine();
  };

  const countUp = () => {
    const countEls = [...section.querySelectorAll('[data-rc-count]')];
    if (!countEls.length) return;

    const startTime = performance.now();
    const update = (now) => {
      const progress = Math.min(1, (now - startTime) / 1400);
      const eased = 1 - Math.pow(1 - progress, 3);
      countEls.forEach((el) => {
        const value = Number(el.dataset.rcCount);
        el.textContent = (value * eased).toFixed(2);
      });
      if (progress < 1) window.requestAnimationFrame(update);
    };
    window.requestAnimationFrame(update);
  };

  let activated = false;
  const activate = () => {
    if (activated) return;
    activated = true;
    section.classList.add('rc-in');
    if (reduceMotion) {
      fillTerminal();
      return;
    }
    window.setTimeout(countUp, 1300);
    window.setTimeout(typeTerminal, 2000);
  };

  if (wrap && 'IntersectionObserver' in window) {
    const revealObserver = new IntersectionObserver((entries, observer) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          activate();
          observer.disconnect();
        }
      });
    }, { threshold: 0.12 });
    revealObserver.observe(wrap);
  } else {
    activate();
  }

  const cards = [...section.querySelectorAll('.rc-card')];
  const isTouchDevice = navigator.maxTouchPoints > 0 || window.matchMedia('(hover: none)').matches;
  if (!reduceMotion && !isTouchDevice) {
    cards.forEach((card) => {
      card.addEventListener('pointermove', (event) => {
        const rect = card.getBoundingClientRect();
        card.style.setProperty('--rc-mx', `${event.clientX - rect.left}px`);
        card.style.setProperty('--rc-my', `${event.clientY - rect.top}px`);
      });
    });
  }

  const magneticButton = section.querySelector('[data-rc-magnetic]');
  if (magneticButton && !reduceMotion && window.matchMedia('(hover: hover)').matches) {
    magneticButton.addEventListener('pointermove', (event) => {
      const rect = magneticButton.getBoundingClientRect();
      const x = (event.clientX - rect.left - rect.width / 2) * 0.1;
      const y = (event.clientY - rect.top - rect.height / 2) * 0.22;
      magneticButton.style.transform = `translate(${x.toFixed(1)}px, ${y.toFixed(1)}px)`;
    });
    magneticButton.addEventListener('pointerleave', () => {
      magneticButton.style.transform = '';
    });
  }

  const fallbackCopy = (text) => {
    const field = document.createElement('textarea');
    field.value = text;
    field.setAttribute('readonly', '');
    field.style.position = 'fixed';
    field.style.opacity = '0';
    document.body.appendChild(field);
    try {
      field.select();
      return document.execCommand('copy');
    } catch {
      return false;
    } finally {
      field.remove();
    }
  };

  section.querySelectorAll('[data-rc-copy]').forEach((button) => {
    const status = button.parentElement.querySelector('[data-rc-copy-status]');
    let statusTimer = 0;

    button.addEventListener('click', async () => {
      let copied = false;
      try {
        if (!navigator.clipboard || !navigator.clipboard.writeText) {
          copied = fallbackCopy(button.dataset.rcCopy);
        } else {
          await navigator.clipboard.writeText(button.dataset.rcCopy);
          copied = true;
        }
      } catch {
        copied = fallbackCopy(button.dataset.rcCopy);
      }

      window.clearTimeout(statusTimer);
      button.classList.toggle('rc-copied', copied);
      if (status) status.textContent = copied ? 'Copied' : 'Copy failed';
      statusTimer = window.setTimeout(() => {
        button.classList.remove('rc-copied');
        if (status) status.textContent = '';
      }, 2000);
    });
  });

  const dialog = document.querySelector('[data-rc-dialog]');
  const openButton = section.querySelector('[data-rc-preview-open]');
  const closeButton = dialog && dialog.querySelector('[data-rc-preview-close]');
  const pdfFrame = dialog && dialog.querySelector('[data-rc-pdf-frame]');
  let dialogTrigger = null;

  if (dialog && openButton && closeButton && pdfFrame) {
    openButton.addEventListener('click', () => {
      dialogTrigger = openButton;
      if (!pdfFrame.src) pdfFrame.src = pdfFrame.dataset.src;
      dialog.showModal();
      closeButton.focus();
    });
    closeButton.addEventListener('click', () => dialog.close());
    dialog.addEventListener('click', (event) => {
      if (event.target === dialog) dialog.close();
    });
    dialog.addEventListener('close', () => {
      dialogTrigger && dialogTrigger.focus();
    });
  }
})();

// Universal Parallax for All Section Ghost Watermarks
(() => {
  const reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  if (reduceMotion) return;

  const ghostEls = [...document.querySelectorAll('[data-ghost]')];
  if (!ghostEls.length) return;

  const ghostItems = ghostEls.map((ghost) => ({
    ghost,
    section: ghost.closest('section') || ghost.parentElement,
    currentY: 0,
    targetY: 0
  }));

  let rafId = 0;

  const updateTargets = () => {
    const vh = window.innerHeight;
    ghostItems.forEach((item) => {
      if (!item.section) return;
      const rect = item.section.getBoundingClientRect();
      const progress = Math.min(1, Math.max(0, (vh - rect.top) / (vh + rect.height)));
      item.targetY = (progress - 0.5) * -100;
    });
    if (!rafId) rafId = window.requestAnimationFrame(animate);
  };

  const animate = () => {
    let keepRunning = false;
    ghostItems.forEach((item) => {
      item.currentY += (item.targetY - item.currentY) * 0.08;
      item.ghost.style.transform = `translate3d(0, ${item.currentY.toFixed(2)}px, 0)`;
      if (Math.abs(item.targetY - item.currentY) > 0.1) {
        keepRunning = true;
      }
    });
    if (keepRunning) {
      rafId = window.requestAnimationFrame(animate);
    } else {
      rafId = 0;
    }
  };

  window.addEventListener('scroll', updateTargets, { passive: true });
  window.addEventListener('resize', updateTargets);
  updateTargets();
})();

// Top Navigation Scroll Spy (Smooth Tracking without hijacking scroll)
(() => {
  if (!('IntersectionObserver' in window) || !tabs.length || typeof navTabs === 'undefined') return;

  const navSectionMap = new Map();
  tabs.forEach((tab, index) => {
    const selector = tab.dataset.target;
    if (selector) {
      const el = document.querySelector(selector);
      if (el) navSectionMap.set(el, index);
    }
  });

  const scrollSpyObserver = new IntersectionObserver((entries) => {
    entries.forEach((entry) => {
      if (entry.isIntersecting) {
        const targetIndex = navSectionMap.get(entry.target);
        if (targetIndex !== undefined && typeof navTabs.setIndexQuiet === 'function') {
          navTabs.setIndexQuiet(targetIndex);
        }
      }
    });
  }, { rootMargin: '-25% 0px -55% 0px' });

  navSectionMap.forEach((_, sectionEl) => {
    scrollSpyObserver.observe(sectionEl);
  });
})();


// Cinematic Arrival Observer for All Sections
(() => {
  const sections = document.querySelectorAll('.section');
  if (!sections.length) return;

  const reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  if (reduceMotion) {
    sections.forEach((s) => s.classList.add('cine-in'));
    return;
  }

  if ('IntersectionObserver' in window) {
    const cineObserver = new IntersectionObserver(
      (entries, observer) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            entry.target.classList.add('cine-in');
            observer.unobserve(entry.target);
          }
        });
      },
      { threshold: 0.12 }
    );
    sections.forEach((s) => cineObserver.observe(s));
  } else {
    sections.forEach((s) => s.classList.add('cine-in'));
  }
})();


// Scroll-driven Journey Timeline Engine
(() => {
  const journeySection = document.getElementById('journey');
  if (!journeySection) return;

  const timeline = journeySection.querySelector('[data-timeline]');
  const laser = journeySection.querySelector('[data-timeline-laser]');
  const items = [...journeySection.querySelectorAll('[data-timeline-item]')];
  if (!timeline || !items.length) return;

  const reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  if (reduceMotion) {
    items.forEach((item) => item.classList.add('is-active'));
    if (laser) laser.style.height = '100%';
    return;
  }

  // Click on milestone card or year to smoothly scroll to it
  items.forEach((item) => {
    item.addEventListener('click', () => {
      const topOffset = item.getBoundingClientRect().top + window.scrollY - (window.innerHeight * 0.42);
      window.scrollTo({ top: topOffset, behavior: 'smooth' });
    });
    item.addEventListener('keydown', (e) => {
      if (e.key === 'Enter' || e.key === ' ') {
        e.preventDefault();
        const topOffset = item.getBoundingClientRect().top + window.scrollY - (window.innerHeight * 0.42);
        window.scrollTo({ top: topOffset, behavior: 'smooth' });
      }
    });
  });

  let ticking = false;

  const updateTimeline = () => {
    const vh = window.innerHeight;
    const focusPoint = vh * 0.48; // Reading focal line at 48% of screen height

    const timelineRect = timeline.getBoundingClientRect();

    // Laser progress calculation: from first item node to last item node
    const firstItemRect = items[0].getBoundingClientRect();
    const lastItemRect = items[items.length - 1].getBoundingClientRect();

    const startY = firstItemRect.top + 20;
    const endY = lastItemRect.top + 20;
    const totalDist = endY - startY;

    if (totalDist > 0) {
      const currentProgress = (focusPoint - startY) / totalDist;
      const clamped = Math.min(1, Math.max(0, currentProgress));
      if (laser) {
        laser.style.height = `${(clamped * 100).toFixed(1)}%`;
      }
    }

    // Determine the closest item to the focal line
    let closestIndex = 0;
    let minDistance = Infinity;

    items.forEach((item, idx) => {
      const rect = item.getBoundingClientRect();
      const itemCenter = rect.top + rect.height * 0.4;
      const dist = Math.abs(itemCenter - focusPoint);

      if (dist < minDistance) {
        minDistance = dist;
        closestIndex = idx;
      }
    });

    const isInView = timelineRect.bottom > vh * 0.1 && timelineRect.top < vh * 0.9;

    items.forEach((item, idx) => {
      if (isInView && idx === closestIndex) {
        item.classList.add('is-active');
      } else {
        item.classList.remove('is-active');
      }
    });

    ticking = false;
  };

  const onScroll = () => {
    if (!ticking) {
      window.requestAnimationFrame(updateTimeline);
      ticking = true;
    }
  };

  window.addEventListener('scroll', onScroll, { passive: true });
  window.addEventListener('resize', onScroll);
  updateTimeline();
})();
