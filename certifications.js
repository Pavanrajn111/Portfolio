(() => {
  const carousel = document.querySelector('[data-cert-carousel]');
  const certificates = window.certificationData;
  if (!carousel || !Array.isArray(certificates) || certificates.length === 0) return;

  const stack = carousel.querySelector('[data-cert-stack]');
  const cards = [...carousel.querySelectorAll('[data-cert-card]')];
  if (!stack || cards.length !== certificates.length) {
    console.error('Certificate carousel cards do not match the certificate data.');
    return;
  }

  const counter = carousel.querySelector('[data-cert-counter]');
  const progress = carousel.querySelector('[data-cert-progress]');
  const category = carousel.querySelector('[data-cert-category]');
  const title = carousel.querySelector('[data-cert-title]');
  const description = carousel.querySelector('[data-cert-description]');
  const issuer = carousel.querySelector('[data-cert-issuer]');
  const date = carousel.querySelector('[data-cert-date]');
  const durationRow = carousel.querySelector('[data-cert-duration-row]');
  const duration = carousel.querySelector('[data-cert-duration]');
  const idRow = carousel.querySelector('[data-cert-id-row]');
  const certificateId = carousel.querySelector('[data-cert-id]');
  const skills = carousel.querySelector('[data-cert-skills]');
  const viewLink = carousel.querySelector('[data-cert-view]');
  const downloadLink = carousel.querySelector('[data-cert-download]');
  const verifyLink = carousel.querySelector('[data-cert-verify]');
  const previousButton = carousel.querySelector('[data-cert-prev]');
  const nextButton = carousel.querySelector('[data-cert-next]');
  let activeIndex = 0;
  let transitionTimer = 0;
  let pointerStart = null;
  let dragX = 0;

  const formatCounter = (index) =>
    `${String(index + 1).padStart(2, '0')} / ${String(certificates.length).padStart(2, '0')}`;

  function render() {
    const certificate = certificates[activeIndex];
    const parts = [certificate.category, certificate.type].filter(Boolean);

    counter.textContent = formatCounter(activeIndex);
    progress.style.width = `${((activeIndex + 1) / certificates.length) * 100}%`;
    category.replaceChildren();
    parts.forEach((part, index) => {
      if (index) {
        const separator = document.createElement('span');
        separator.setAttribute('aria-hidden', 'true');
        separator.textContent = ' • ';
        category.append(separator);
      }
      category.append(document.createTextNode(part));
    });
    title.textContent = certificate.title;
    description.textContent = certificate.description;
    issuer.textContent = certificate.issuer;
    date.textContent = certificate.date;
    durationRow.hidden = !certificate.duration;
    duration.textContent = certificate.duration || '';
    idRow.hidden = !certificate.id;
    certificateId.textContent = certificate.id || '';

    skills.replaceChildren();
    skills.hidden = certificate.skills.length === 0;
    certificate.skills.forEach((skill) => {
      const chip = document.createElement('span');
      chip.textContent = skill;
      skills.append(chip);
    });

    viewLink.href = certificate.pdf;
    downloadLink.href = certificate.pdf;
    downloadLink.download = certificate.downloadName;
    verifyLink.hidden = !certificate.verification;
    if (certificate.verification) verifyLink.href = certificate.verification;

    cards.forEach((card, index) => {
      const relativePosition = (index - activeIndex + certificates.length) % certificates.length;
      const position = ['active', 'next', 'back', 'previous'][relativePosition];
      card.classList.remove('is-active', 'is-next', 'is-back', 'is-previous');
      card.classList.add(`is-${position}`);
      card.setAttribute('aria-hidden', String(position !== 'active'));
      card.setAttribute(
        'aria-label',
        `Certificate ${index + 1} of ${certificates.length}: ${certificates[index].title}`
      );
    });
  }

  function navigate(step, animateDeparture = false) {
    window.clearTimeout(transitionTimer);
    activeIndex = (activeIndex + step + certificates.length) % certificates.length;
    stack.style.setProperty('--cert-drag-x', '0px');
    stack.removeAttribute('data-departing');
    if (animateDeparture) {
      stack.dataset.departing = step > 0 ? 'next' : 'previous';
      transitionTimer = window.setTimeout(() => {
        delete stack.dataset.departing;
        render();
      }, 180);
      return;
    }
    render();
  }

  previousButton.addEventListener('click', () => navigate(-1));
  nextButton.addEventListener('click', () => navigate(1));

  stack.addEventListener('keydown', (event) => {
    if (event.key === 'ArrowLeft' || event.key === 'ArrowRight') {
      event.preventDefault();
      navigate(event.key === 'ArrowRight' ? 1 : -1);
    }
  });

  stack.addEventListener('pointerdown', (event) => {
    if (event.button !== 0 || !event.isPrimary) return;
    pointerStart = { x: event.clientX, y: event.clientY };
    dragX = 0;
    stack.setPointerCapture(event.pointerId);
  });

  stack.addEventListener('pointermove', (event) => {
    if (!pointerStart || !stack.hasPointerCapture(event.pointerId)) return;
    dragX = event.clientX - pointerStart.x;
    stack.style.setProperty('--cert-drag-x', `${dragX}px`);
  });

  function finishPointer(event, cancelled = false) {
    if (!pointerStart) return;
    const threshold = Math.max(48, stack.clientWidth * 0.14);
    const moved = dragX;
    pointerStart = null;
    if (!cancelled && Math.abs(moved) >= threshold) {
      navigate(moved < 0 ? 1 : -1, true);
    } else {
      stack.style.setProperty('--cert-drag-x', '0px');
    }
    if (stack.hasPointerCapture(event.pointerId)) stack.releasePointerCapture(event.pointerId);
  }

  stack.addEventListener('pointerup', (event) => finishPointer(event));
  stack.addEventListener('pointercancel', (event) => finishPointer(event, true));

  render();
})();
