// /public/js/components/FileItem.js
import { el, svgIcon, prettyBytes } from '../utils/dom.js';
import { simulateFileUpload } from '../utils/mockApi.js';
import { updateFile, removeFile } from '../store.js';

// Use your custom PDF icon for PDFs at all times (uploading + complete)
const CUSTOM_PDF_ICON = '/assets/file-pdf-complete.svg';

function isPdf(meta) {
  return (meta.type || '').toLowerCase() === 'pdf' ||
         /\.pdf$/i.test(meta.name || '');
}

function spriteIdFor(meta) {
  const t = (meta.type || '').toLowerCase();
  return t === 'pdf' ? 'icon-pdf' : 'icon-file';
}

export class FileItem {
  constructor(kind, fileMeta) {
    this.kind = kind; // 'specs' | 'plans'
    this.meta = fileMeta;
    this.controller = null;

    this.root = el('div', { class: 'file file--uploading', 'data-id': fileMeta.id });

    // Icon (kept as a handle so we can swap if we ever need to)
    this.iconEl = this.buildIcon(fileMeta);
    const left = el('div', { class: 'file__left' }, this.iconEl);

    const center = el('div', { class: 'file__center' }, [
      el('div', { class: 'file__name' }, fileMeta.name),
      this.metaLine = el('div', { class: 'file__meta', 'aria-live': 'polite' },
        `${prettyBytes(fileMeta.size)}  ·  ${fileMeta.status === 'complete' ? 'Complete' : 'Uploading…'}`
      ),
      this.progress = el('div', {
        class: 'progress',
        role: 'progressbar',
        'aria-valuemin': '0',
        'aria-valuemax': '100',
        'aria-valuenow': String(fileMeta.progress || 0)
      }, [
        this.bar = el('div', { class: 'progress__bar', style: { width: `${fileMeta.progress || 0}%` } })
      ])
    ]);

    const actions = el('div', { class: 'file__actions' }, [
      el('button', { class: 'btn btn--icon', 'aria-label': 'Remove file' }, svgIcon('icon-trash'))
    ]);
    actions.firstChild.addEventListener('click', () => this.remove());

    this.root.append(left, center, actions);

    // Initial state classes
    if (fileMeta.status === 'complete') {
      this.root.classList.add('file--complete');
    } else {
      this.root.classList.add('file--uploading');
    }

    // Start simulated upload if needed
    if (fileMeta.status !== 'complete' && (fileMeta.progress || 0) < 100) {
      this.controller = simulateFileUpload({
        onProgress: (p) => this.setProgress(p)
      });
      this.controller.promise.then(() => this.markComplete());
    }
  }

  buildIcon(meta) {
    // Show your custom PDF icon immediately for PDFs (uploading or complete)
    if (isPdf(meta)) {
      return el('img', {
        src: CUSTOM_PDF_ICON,
        alt: 'PDF',
        class: 'file__icon-img',
        width: 20,
        height: 20
      });
    }
    // Non-PDFs use the sprite
    return svgIcon(spriteIdFor(meta), 'file__icon');
  }

  swapIconIfNeeded() {
    // For now, PDFs already use the custom icon from the start,
    // so no swap is needed. Keep this in case you later want a
    // different "complete" icon for non-PDFs.
    const desired = this.buildIcon(this.meta);
    // If node type differs, replace; cheap no-op if identical markup.
    if (desired.outerHTML !== this.iconEl.outerHTML) {
      this.iconEl.replaceWith(desired);
      this.iconEl = desired;
    }
  }

  setProgress(p) {
    this.bar.style.width = `${p}%`;
    this.progress.setAttribute('aria-valuenow', String(p));
    updateFile(this.kind, this.meta.id, { progress: p, status: p >= 100 ? 'complete' : 'uploading' });
  }

  markComplete() {
    this.root.classList.remove('file--uploading');
    this.root.classList.add('file--complete');
    this.metaLine.textContent = `${prettyBytes(this.meta.size)}  ·  Complete`;
    this.swapIconIfNeeded(); // no visual change for PDFs (already custom)
    updateFile(this.kind, this.meta.id, { progress: 100, status: 'complete' });
  }

  remove() {
    if (this.controller) this.controller.cancel();
    removeFile(this.kind, this.meta.id);
    this.root.remove();
  }

  mount(parent) { parent.appendChild(this.root); }
}
