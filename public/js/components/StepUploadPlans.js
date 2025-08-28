import { el } from '../utils/dom.js';
import { Dropzone } from './Dropzone.js';
import { FileItem } from './FileItem.js';
import { addFiles, getState, uploadsComplete } from '../store.js';

export class StepUploadPlans {
  constructor() {
    this.root = el('div', { class: 'step step--plans' });

    this.header = el('div', {}, [
      el('h2', { class: 'section__title' }, 'Upload your community plans'),
      el('p', { class: 'section__desc' },
        'Communities are made up of multiple plans and elevations. Upload them here so specs can be tied to the right designs.'
      )
    ]);

    this.drop = new Dropzone({
      onFiles: (files) => {
        const added = addFiles('plans', files);
        this.renderFiles(added);
      },
      iconUrl: '/assets/upload-cloud.svg',   // ← your custom SVG file
      iconLabel: 'Upload files'
    });

    this.filesWrap = el('div', { class: 'files', 'aria-live': 'polite' });
    this.root.append(this.header, this.drop.root, this.filesWrap);
  }

  mountFilesFromState() {
    const { planFiles } = getState();
    this.filesWrap.innerHTML = '';
    planFiles.forEach(f => new FileItem('plans', f).mount(this.filesWrap));
  }

  renderFiles(newFiles) {
    newFiles.forEach(f => new FileItem('plans', f).mount(this.filesWrap));
  }

  canProceed() {
    return uploadsComplete('plans');
  }
}
