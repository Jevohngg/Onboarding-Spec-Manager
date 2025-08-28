import { el } from '../utils/dom.js';
import { Dropzone } from './Dropzone.js';
import { FileItem } from './FileItem.js';
import { addFiles, getState, uploadsComplete } from '../store.js';

export class StepUploadSpecs {
  constructor() {
    this.root = el('div', { class: 'step step--specs step--active' });

    this.header = el('div', {}, [
      el('h2', { class: 'section__title' }, 'Add specifications to your community'),
      el('p', { class: 'section__desc' }, [
        'Upload your community’s specification files, and we’ll automatically populate the data for you. ',
        'Easily edit any information directly in the interface afterward. To improve the accuracy of the import, ',
        'we recommend using ', el('a', { href: '#', tabindex: '0' }, 'Our Template'), '.'
      ])
    ]);

    this.drop = new Dropzone({
      onFiles: (files) => {
        const added = addFiles('specs', files);
        this.renderFiles(added);
      },
      iconUrl: '/assets/upload-cloud.svg',   // ← your custom SVG file
      iconLabel: 'Upload files'
    });

    this.filesWrap = el('div', { class: 'files', 'aria-live': 'polite' });
    this.root.append(this.header, this.drop.root, this.filesWrap);
  }

  mountFilesFromState() {
    const { specFiles } = getState();
    this.filesWrap.innerHTML = '';
    specFiles.forEach(f => new FileItem('specs', f).mount(this.filesWrap));
  }

  renderFiles(newFiles) {
    newFiles.forEach(f => new FileItem('specs', f).mount(this.filesWrap));
  }

  canProceed() {
    return uploadsComplete('specs');
  }
}
