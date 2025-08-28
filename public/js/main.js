import { Overlay } from './components/Overlay.js';
import { Wizard } from './components/Wizard.js';
import { qs } from './utils/dom.js';

let overlay, wizard;

function openWizard() {
  if (!overlay) {
    overlay = new Overlay({
      onClose: () => {
        // Clean up if needed
      }
    });
    overlay.mount(document.body);
  }
  if (!wizard) {
    wizard = new Wizard(overlay);
  }
  overlay.open();
}

document.addEventListener('DOMContentLoaded', () => {
  // Open on load for the demo
  openWizard();

  // Also expose a manual launcher
  const btn = qs('#open-onboarding');
  btn?.addEventListener('click', () => openWizard());
});
