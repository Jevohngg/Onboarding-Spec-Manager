import { el } from '../utils/dom.js';

export class Button {
  constructor({ label, variant = 'secondary', type = 'button', onClick, id }) {
    this.el = el('button', {
      class: `btn btn--${variant}`,
      type,
      id: id || undefined
    }, label);

    this.spinner = el('span', { class: 'btn__spinner', 'aria-hidden': 'true', style: { display: 'none' } });
    this.el.prepend(this.spinner);

    if (onClick) this.el.addEventListener('click', onClick);
  }

  setBusy(b) {
    this.el.classList.toggle('is-busy', !!b);
    this.el.setAttribute('aria-busy', String(!!b));
    this.spinner.style.display = b ? 'inline-block' : 'none';
    this.el.disabled = !!b;
  }

  setDisabled(d) {
    this.el.disabled = !!d;
    this.el.classList.toggle('is-disabled', !!d);
  }

  setLabel(text) {
    // keep spinner as first child
    this.el.lastChild.nodeType === 3 ? (this.el.lastChild.textContent = text) : this.el.append(text);
  }
}
