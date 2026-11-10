(function () {
  const footer = document.querySelector('.ft-footer');
  if (!footer) return;

  const reducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  const clock = footer.querySelector('[data-ft-clock]');
  const year = footer.querySelector('[data-ft-year]');
  const progress = footer.querySelector('[data-ft-progress]');
  const mark = footer.querySelector('[data-ft-mark]');
  const email = 'rajnpavan864@gmail.com';

  year.textContent = new Date().getFullYear();

  const formatClock = new Intl.DateTimeFormat('en-GB', {
    hour: '2-digit',
    minute: '2-digit',
    hour12: false,
    timeZone: 'Asia/Kolkata'
  });
  const updateClock = function () {
    clock.textContent = formatClock.format(new Date());
  };
  updateClock();
  window.setInterval(updateClock, 15000);

  const navButtons = Array.from(footer.querySelectorAll('[data-ft-nav] button'));
  const navTargets = navButtons
    .map(function (button) {
      return {
        button: button,
        section: document.getElementById(button.dataset.target)
      };
    })
    .filter(function (item) {
      return item.section;
    });

  function setActiveSection(id) {
    navTargets.forEach(function (item) {
      const active = item.section.id === id;
      item.button.classList.toggle('is-active', active);
      if (active) {
        item.button.setAttribute('aria-current', 'location');
      } else {
        item.button.removeAttribute('aria-current');
      }
    });
  }

  navTargets.forEach(function (item) {
    item.button.addEventListener('click', function () {
      item.section.scrollIntoView({
        behavior: reducedMotion ? 'auto' : 'smooth',
        block: 'start'
      });
      setActiveSection(item.section.id);
    });
  });

  if ('IntersectionObserver' in window && navTargets.length) {
    const sectionObserver = new IntersectionObserver(function (entries) {
      entries.forEach(function (entry) {
        if (entry.isIntersecting) setActiveSection(entry.target.id);
      });
    }, { rootMargin: '-45% 0px -45% 0px' });

    navTargets.forEach(function (item) {
      sectionObserver.observe(item.section);
    });
  }

  let revealed = false;
  function revealFooter() {
    if (revealed) return;
    revealed = true;
    footer.classList.add('ft-in');
  }

  if (!reducedMotion && 'IntersectionObserver' in window) {
    const revealObserver = new IntersectionObserver(function (entries, observer) {
      entries.forEach(function (entry) {
        if (entry.isIntersecting) {
          revealFooter();
          observer.disconnect();
        }
      });
    }, { threshold: 0.15 });
    revealObserver.observe(footer);
  } else {
    revealFooter();
  }

  function updateProgress() {
    const scrollableHeight = document.documentElement.scrollHeight - window.innerHeight;
    const fraction = scrollableHeight > 0
      ? Math.min(1, Math.max(0, window.scrollY / scrollableHeight))
      : 0;
    progress.style.strokeDashoffset = String(100 - fraction * 100);
  }

  let progressFrame = 0;
  function queueProgressUpdate() {
    if (progressFrame) return;
    progressFrame = window.requestAnimationFrame(function () {
      progressFrame = 0;
      updateProgress();
    });
  }

  window.addEventListener('scroll', queueProgressUpdate, { passive: true });
  window.addEventListener('resize', queueProgressUpdate);
  updateProgress();

  function scrollToTop() {
    window.scrollTo({ top: 0, behavior: reducedMotion ? 'auto' : 'smooth' });
  }

  footer.querySelectorAll('[data-ft-top]').forEach(function (button) {
    button.addEventListener('click', scrollToTop);
  });

  const copyButton = footer.querySelector('[data-ft-copy]');
  const copyStatus = footer.querySelector('[data-ft-copy-status]');
  const copyIcon = copyButton.querySelector('svg');
  const copySvg = '<rect x="9" y="9" width="13" height="13" rx="2"></rect><path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1"></path>';
  const checkSvg = '<path d="M20 6 9 17l-5-5"></path>';
  let copyTimeout;

  copyButton.addEventListener('click', function () {
    if (!navigator.clipboard || !navigator.clipboard.writeText) {
      copyStatus.textContent = 'Clipboard access is unavailable in this browser.';
      return;
    }

    navigator.clipboard.writeText(email).then(function () {
      copyButton.classList.add('is-copied');
      copyButton.setAttribute('aria-label', 'Email address copied');
      copyIcon.innerHTML = checkSvg;
      copyStatus.textContent = 'Email address copied.';
      window.clearTimeout(copyTimeout);
      copyTimeout = window.setTimeout(function () {
        copyButton.classList.remove('is-copied');
        copyButton.setAttribute('aria-label', 'Copy email address');
        copyIcon.innerHTML = copySvg;
        copyStatus.textContent = '';
      }, 2000);
    }).catch(function () {
      copyStatus.textContent = 'Could not copy the email address. Please copy it manually.';
    });
  });

  if (reducedMotion) {
    mark.style.setProperty('--ft-mx', mark.offsetWidth / 2 + 'px');
    mark.style.setProperty('--ft-my', mark.offsetHeight / 2 + 'px');
    return;
  }

  let mouseX = 0;
  let mouseY = 0;
  let targetX = 0;
  let targetY = 0;
  let lastPointerMove = -9999;
  let visible = false;

  footer.addEventListener('pointermove', function (event) {
    const bounds = mark.getBoundingClientRect();
    targetX = event.clientX - bounds.left;
    targetY = Math.min(bounds.height, Math.max(0, event.clientY - bounds.top));
    lastPointerMove = performance.now();
  });

  if ('IntersectionObserver' in window) {
    const markObserver = new IntersectionObserver(function (entries) {
      visible = entries[0].isIntersecting;
    });
    markObserver.observe(footer);
  } else {
    visible = true;
  }

  function animateWordmark(now) {
    window.requestAnimationFrame(animateWordmark);
    if (!visible) return;

    if (now - lastPointerMove > 1800) {
      targetX = (0.5 + 0.5 * Math.sin(now / 2400)) * mark.offsetWidth;
      targetY = mark.offsetHeight / 2;
    }

    mouseX += (targetX - mouseX) * 0.08;
    mouseY += (targetY - mouseY) * 0.08;
    mark.style.setProperty('--ft-mx', mouseX.toFixed(1) + 'px');
    mark.style.setProperty('--ft-my', mouseY.toFixed(1) + 'px');
  }

  window.requestAnimationFrame(animateWordmark);
})();
