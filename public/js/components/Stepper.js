// /public/js/components/Stepper.js
import { el, svgIcon } from '../utils/dom.js';
import { STEPS, goTo } from '../router.js';
import { getState, canAdvanceFrom } from '../store.js';

export class Stepper {
  constructor() {
    this.root = el('nav', { class: 'stepper', 'aria-label': 'Onboarding steps' });
    this.render();
  }

  render() {
    this.root.innerHTML = '';
    const state = getState();

    STEPS.forEach((step, idx) => {
      const current = idx === state.currentStep;
      const done = idx < state.currentStep;

      const item = el('div', { class: `stepper__item${done ? ' is-done' : ''}` });

      const btn = el('button', {
        class: 'stepper__btn',
        'aria-current': current ? 'step' : undefined
      }, [
        el('span', { class: 'stepper__badge' }, done ? svgIcon('icon-check', 'stepper__check') : String(idx + 1)),
        el('span', { class: 'stepper__label' }, step.label)
      ]);

      const forwardBlocked = idx > state.currentStep && !canAdvanceFrom(state.currentStep);
      if (forwardBlocked) btn.setAttribute('aria-disabled', 'true');

      btn.addEventListener('click', () => {
        if (btn.getAttribute('aria-disabled') === 'true') return;
        goTo(idx);
      });

      item.appendChild(btn);
      this.root.appendChild(item);

      // Insert connector AFTER this item if it's not the last one
      if (idx < STEPS.length - 1) {
        this.root.appendChild(
          el('span', { class: 'stepper__connector', 'aria-hidden': 'true' })
        );
      }
    });
  }
}
