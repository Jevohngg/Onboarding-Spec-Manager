// /public/js/components/FileItem.js
import { el, svgIcon, prettyBytes } from '../utils/dom.js';
import { simulateFileUpload } from '../utils/mockApi.js';
import { updateFile, removeFile } from '../store.js';

// Map of type key → custom SVG path
const CUSTOM_ICONS = {
  pdf:  '/assets/file-pdf-complete.svg',
  csv:  '/assets/file-csv.svg',
  doc:  '/assets/file-doc.svg',
  docx: '/assets/file-docx.svg',
  xls:  '/assets/file-xls.svg',
  xlsx: '/assets/file-xlsx.svg'
};

// Common MIME → key
const MIME_MAP = {
  'application/pdf': 'pdf',
  'text/csv': 'csv',
  'application/csv': 'csv',

  'application/msword': 'doc',
  'application/vnd.openxmlformats-officedocument.wordprocessingml.document': 'docx',

  'application/vnd.ms-excel': 'xls',
  'application/vnd.ms-excel.sheet.macroenabled.12': 'xls',
  'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet': 'xlsx'
};

function detectTypeKey(meta) {
  const name = (meta.name || '').toLowerCase();
  const mime = (meta.type || '').toLowerCase();

  // 1) by extension
  const ext = name.includes('.') ? name.split('.').pop() : '';
  if (CUSTOM_ICONS[ext]) return ext;

  // 2) exact MIME
  if (MIME_MAP[mime]) return MIME_MAP[mime];

  // 3) best-effort MIME heuristics
  if (mime.includes('pdf')) return 'pdf';
  if (mime.includes('csv')) return 'csv';

  if (mime.includes('wordprocessingml')) return 'docx';
  if (mime.includes('msword')) return 'doc';

  if (mime.includes('spreadsheetml') || mime.includes('sheet')) return 'xlsx';
  if (mime.includes('excel')) return 'xls';

  return null;
}

export class FileItem {
  constructor(kind, fileMeta) {
    this.kind = kind; // 'specs' | 'plans'
    this.meta = fileMeta;
    this.controller = null;

    this.root = el('div', { class: 'file file--uploading', 'data-id': fileMeta.id });

    // Left: icon (custom for known types, generic otherwise)
    this.iconEl = this.buildIcon(fileMeta);
    const left = el('div', { class: 'file__left' }, this.iconEl);

    const center = el('div', { class: 'file__center' }, [
      el('div', { class: 'file__name' }, fileMeta.name),
      this.metaLine = el('div', {
        class: 'file__meta',
        'aria-live': 'polite'
      }, `${prettyBytes(fileMeta.size)}  ·  ${fileMeta.status === 'complete' ? 'Complete' : 'Uploading…'}`),

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

    // Simulate upload if needed
    if (fileMeta.status !== 'complete' && (fileMeta.progress || 0) < 100) {
      this.controller = simulateFileUpload({
        onProgress: (p) => this.setProgress(p)
      });
      this.controller.promise.then(() => this.markComplete());
    }
  }

  buildIcon(meta) {
    const key = detectTypeKey(meta);
    if (key) {
      return el('img', {
        src: CUSTOM_ICONS[key],
        alt: key.toUpperCase(),
        class: 'file__icon-img',
        width: 20,
        height: 20
      });
    }
    // Fallback to sprite generic file icon
    return svgIcon('icon-file', 'file__icon');
  }

  // If you later want distinct "complete" icons per type, swap here.
  swapIconIfNeeded() {
    const desired = this.buildIcon(this.meta);
    if (desired.outerHTML !== this.iconEl.outerHTML) {
      this.iconEl.replaceWith(desired);
      this.iconEl = desired;
    }
  }

  setProgress(p) {
    this.bar.style.width = `${p}%`;
    this.progress.setAttribute('aria-valuenow', String(p));
    updateFile(this.kind, this.meta.id, {
      progress: p,
      status: p >= 100 ? 'complete' : 'uploading'
    });
  }

  markComplete() {
    this.root.classList.remove('file--uploading');
    this.root.classList.add('file--complete');
    this.metaLine.textContent = `${prettyBytes(this.meta.size)}  ·  Complete`;
    this.swapIconIfNeeded(); // currently no visual change, but safe
    updateFile(this.kind, this.meta.id, { progress: 100, status: 'complete' });
  }

  remove() {
    if (this.controller) this.controller.cancel();
    removeFile(this.kind, this.meta.id);
    this.root.remove();
  }

  mount(parent) { parent.appendChild(this.root); }
}
