/*
 * Folder Reveal Cards — optional helper for touch devices.
 * Desktop works with CSS :hover / :focus-visible alone.
 *
 *   new FolderRevealCards(document.querySelector('.frc'));
 *
 * On touch, the first tap opens a card (reveals the image); a second tap follows its link.
 */
class FolderRevealCards {
  constructor(root) {
    this.cards = [...root.querySelectorAll('.frc-card')];
    this.cards.forEach((c) => c.addEventListener('click', (e) => {
      if (!matchMedia('(hover: none)').matches) return;
      if (!c.classList.contains('is-open')) {
        e.preventDefault();
        this.cards.forEach((o) => o.classList.toggle('is-open', o === c));
      }
    }));
  }
}
if (typeof module !== 'undefined') module.exports = FolderRevealCards;
