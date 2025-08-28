import { Emitter } from './utils/events.js';
import { uid } from './utils/dom.js';

const emitter = new Emitter();

const initial = {
  steps: ['specs', 'info', 'plans'],
  currentStep: 0,
  community: {
    name: '',
    division: 'Northwestern',
    parcelId: '',
    numLots: '',
    startDate: ''
  },
  specFiles: [], // {id, name, size, type, progress, status}
  planFiles: []
};

const state = structuredClone(initial);

function notify() { emitter.emit('change', getState()); }

export function subscribe(fn) {
  return emitter.on('change', fn);
}

export function getState() {
  // shallow clone for safety
  return {
    steps: state.steps.slice(),
    currentStep: state.currentStep,
    community: { ...state.community },
    specFiles: state.specFiles.slice(),
    planFiles: state.planFiles.slice()
  };
}

export function reset() {
  Object.assign(state, structuredClone(initial));
  notify();
}

export function setStep(index) {
  state.currentStep = Math.max(0, Math.min(state.steps.length - 1, index));
  notify();
}

export function nextStep() { setStep(state.currentStep + 1); }
export function prevStep() { setStep(state.currentStep - 1); }

export function setCommunityField(field, value) {
  state.community[field] = value;
  notify();
}

export function addFiles(kind, files) {
  const target = kind === 'plans' ? state.planFiles : state.specFiles;
  const mapped = Array.from(files).map(f => {
    const ext = (f.name.split('.').pop() || '').toLowerCase();
    return {
      id: uid(kind),
      name: f.name,
      size: f.size || 0,
      type: ext,
      progress: 0,
      status: 'uploading'
    };
  });
  target.push(...mapped);
  notify();
  return mapped;
}

export function removeFile(kind, id) {
  const arr = kind === 'plans' ? state.planFiles : state.specFiles;
  const idx = arr.findIndex(f => f.id === id);
  if (idx >= 0) {
    arr.splice(idx, 1);
    notify();
  }
}

export function updateFile(kind, id, patch) {
  const arr = kind === 'plans' ? state.planFiles : state.specFiles;
  const f = arr.find(x => x.id === id);
  if (f) Object.assign(f, patch);
  notify();
}

export function uploadsComplete(kind) {
  const arr = kind === 'plans' ? state.planFiles : state.specFiles;
  return arr.length === 0 || arr.every(f => f.status === 'complete');
}

export function nameProvided() {
  return state.community.name.trim().length > 0;
}

// guards used by router/components
export function canAdvanceFrom(index) {
  const stepId = state.steps[index];
  if (stepId === 'specs') return uploadsComplete('specs');
  if (stepId === 'info') return nameProvided();
  if (stepId === 'plans') return uploadsComplete('plans');
  return true;
}
