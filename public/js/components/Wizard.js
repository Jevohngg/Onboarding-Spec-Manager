// /public/js/components/Wizard.js
import { el } from '../utils/dom.js';
import { Stepper } from './Stepper.js';
import { StepUploadSpecs } from './StepUploadSpecs.js';
import { StepCommunityInfo } from './StepCommunityInfo.js';
import { StepUploadPlans } from './StepUploadPlans.js';
import { Button } from './Button.js';
import { subscribe, getState, canAdvanceFrom } from '../store.js';
import { next as goNext, prev as goPrev } from '../router.js';
import { delay } from '../utils/mockApi.js';
import { showToast } from './Toast.js';
import { reset as resetStore } from '../store.js';

export class Wizard {
  constructor(overlay) {
    this.overlay = overlay;

    this.stepper = new Stepper();

    // steps
    this.steps = {
      specs: new StepUploadSpecs(),
      info: new StepCommunityInfo(),
      plans: new StepUploadPlans()
    };

    // footer buttons
    this.btnPrev = new Button({ label: 'Previous', variant: 'secondary', onClick: () => this.handlePrev() });
    this.btnSkip = new Button({ label: 'Skip', variant: 'secondary', onClick: () => this.handleSkip() });
    this.btnNext = new Button({ label: 'Next', variant: 'primary', onClick: () => this.handleNext() });

    this.lastStepId = null;

    // Initial render
    this.render();

    // react to store changes
    this.unsub = subscribe(() => this.render());
  }

  destroy() {
    if (this.unsub) this.unsub();
  }

  getActiveStep() {
    const st = getState();
    return st.steps[st.currentStep];
  }

  render() {
    const st = getState();
    const id = st.steps[st.currentStep];
    const comp = this.steps[id];
    const stepChanged = id !== this.lastStepId;

    // Mount file rows only when entering those steps
    if (stepChanged) {
      if (id === 'specs') comp.mountFilesFromState?.();
      if (id === 'plans') comp.mountFilesFromState?.();
    }

    // Footer
    const footer = el('div', { class: 'footer__grid' });
    this.btnPrev.el.style.visibility = st.currentStep === 0 ? 'hidden' : 'visible';

    const right = el('div', { style: { display: 'flex', gap: '0.5rem', justifyContent: 'flex-end' } });

    // Primary label based on current step
    this.btnNext.setLabel(id === 'plans' ? 'Create Community' : 'Next');

    const canProceed = comp.canProceed ? comp.canProceed() : true;
    this.btnNext.setDisabled(!canProceed);

    right.append(this.btnSkip.el, this.btnNext.el);
    footer.append(this.btnPrev.el, el('div', { style: { flex: 1 } }), right);

    // Only swap main when the step actually changed (preserves input focus)
    this.overlay.setContent({
      stepperEl: this.stepper.root,
      mainEl: stepChanged ? comp.root : undefined,
      footerEl: footer
    });

    this.stepper.render();
    if (stepChanged) this.lastStepId = id;
  }

  async withBusy(btn, fn) {
    btn.setBusy(true);
    try {
      await fn();
    } finally {
      btn.setBusy(false);
    }
  }

  async handleNext() {
    const st = getState();
    const idx = st.currentStep;
    if (!canAdvanceFrom(idx)) return;

    const id = st.steps[idx];

    // If we're on the final step, show "Creating…" while busy then finish.
if (id === 'plans') {
  await this.withBusy(this.btnNext, async () => {
    this.btnNext.setLabel('Creating…');
    await delay();
  });
  this.overlay.close();   // animates & resets the overlay
  resetStore();           // ← ensures step index & data are fresh next time
  showToast('Community created (demo)');
  return;
}

    // Otherwise just go to the next step
    await this.withBusy(this.btnNext, async () => { await delay(); });
    // NOTE: Do NOT reset the label here — let render() set it for the new step
    goNext();
  }

  async handleSkip() {
    await this.withBusy(this.btnSkip, async () => { await delay(500, 900); });
    goNext();
  }

  async handlePrev() {
    await this.withBusy(this.btnPrev, async () => { await delay(200, 400); });
    goPrev();
  }
}
