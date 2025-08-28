import { getState, setStep, canAdvanceFrom } from './store.js';

export const STEPS = [
  { id: 'specs', label: 'Upload Specs' },
  { id: 'info',  label: 'Community Info' },
  { id: 'plans', label: 'Upload Plans' }
];

export function currentIndex() {
  return getState().currentStep;
}

export function goTo(index) {
  const state = getState();
  const target = Math.max(0, Math.min(STEPS.length - 1, index));
  const cur = state.currentStep;
  // Disallow moving forward if current step is not allowed to advance
  if (target > cur && !canAdvanceFrom(cur)) return false;
  setStep(target);
  return true;
}

export function next() { return goTo(currentIndex() + 1); }
export function prev() { return goTo(currentIndex() - 1); }

export function isDone(idx) {
  // A step is "done" when all earlier steps can advance
  return idx < currentIndex();
}
