import { el, qs } from '../utils/dom.js';

export function showToast(message, { timeout = 2800 } = {}) {
  const container = qs('#toasts') || document.body;
  const toast = el('div', { class: 'toast', role: 'status' }, message);
  container.appendChild(toast);
  const timer = setTimeout(() => {
    toast.remove();
  }, timeout);
  toast.addEventListener('click', () => { clearTimeout(timer); toast.remove(); });
}
