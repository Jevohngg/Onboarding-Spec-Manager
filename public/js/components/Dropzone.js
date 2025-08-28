// /public/js/components/Dropzone.js
import { el, svgIcon } from '../utils/dom.js';

export class Dropzone {
  /**
   * @param {Object} opts
   * @param {(files: FileList)=>void} opts.onFiles
   * @param {string} [opts.accept] - input accept string
   * @param {string} [opts.iconId] - id from /assets/icons.svg (e.g., 'icon-upload')
   * @param {string} [opts.iconUrl] - optional external svg/png path. If provided, used instead of iconId.
   * @param {string} [opts.iconLabel] - accessible label for the icon image
   */
  constructor({ onFiles, accept = '.pdf,.doc,.docx,.csv,.xls,.xlsx', iconId = 'icon-upload', iconUrl, iconLabel = 'Upload' } = {}) {
    this.onFiles = onFiles;

    // Root container
    this.root = el('div', {
      class: 'dropzone',
      role: 'group',
      'aria-label': 'File Upload Dropzone',
      tabindex: '0'
    });

    // Header: icon + text
    const header = el('div', { class: 'dropzone__header' });

    // Icon
    let iconEl;
    if (iconUrl) {
      iconEl = el('img', { src: iconUrl, alt: iconLabel, class: 'dropzone__icon-img' });
    } else {
      iconEl = svgIcon(iconId, 'dropzone__icon-svg');
      iconEl.setAttribute('aria-hidden', 'true');
    }
    const iconWrap = el('div', { class: 'dropzone__icon' }, iconEl);

    const title = el('div', { class: 'dropzone__title' }, [
      el('span', { class: 'dropzone__cta' }, 'Click to upload'),
      ' ',
      el('span', { class: 'dropzone__or' }, 'or'),
      ' drag and drop'
    ]);

    const helper = el('div', { class: 'helper dropzone__helper' }, 'DOCX, PDF, or CSV');

    header.append(iconWrap, title, helper);
    this.root.appendChild(header);

    // Hidden input
    this.input = el('input', { type: 'file', accept, multiple: true, style: { display: 'none' } });
    this.root.appendChild(this.input);

    // Interaction
    this.root.addEventListener('click', () => this.input.click());
    this.input.addEventListener('change', (e) => {
      if (this.onFiles) this.onFiles(e.target.files);
      this.input.value = ''; // allow same file to retrigger
    });

    // Keyboard — Enter/Space triggers file dialog
    this.root.addEventListener('keydown', (e) => {
      if (e.key === 'Enter' || e.key === ' ') {
        e.preventDefault();
        this.input.click();
      }
    });

    // DnD
    this.root.addEventListener('dragover', (e) => { e.preventDefault(); this.root.classList.add('is-dragover'); });
    this.root.addEventListener('dragleave', () => this.root.classList.remove('is-dragover'));
    this.root.addEventListener('drop', (e) => {
      e.preventDefault();
      this.root.classList.remove('is-dragover');
      const files = e.dataTransfer?.files;
      if (files && this.onFiles) this.onFiles(files);
    });
  }

  mount(parent) { parent.appendChild(this.root); }
}
