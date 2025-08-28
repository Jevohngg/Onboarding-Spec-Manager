// Focus trap + ARIA helpers
const FOCUSABLE = `
  a[href], area[href],
  input:not([disabled]):not([type="hidden"]),
  select:not([disabled]),
  textarea:not([disabled]),
  button:not([disabled]),
  [tabindex]:not([tabindex="-1"])
`;

export function trapFocus(container) {
  const prev = document.activeElement;
  let focusables = Array.from(container.querySelectorAll(FOCUSABLE)).filter(el => el.offsetParent !== null || el === container);
  if (focusables.length === 0) container.setAttribute('tabindex', '-1');
  const first = focusables[0] || container;
  const last = focusables[focusables.length - 1] || container;
  // Focus on open
  // setTimeout(() => first.focus(), 0);

  function handleKey(e) {
    if (e.key === 'Tab') {
      focusables = Array.from(container.querySelectorAll(FOCUSABLE)).filter(el => el.offsetParent !== null || el === container);
      const f = focusables[0] || container;
      const l = focusables[focusables.length - 1] || container;

      if (e.shiftKey) {
        if (document.activeElement === f || !container.contains(document.activeElement)) {
          e.preventDefault();
          l.focus();
        }
      } else {
        if (document.activeElement === l) {
          e.preventDefault();
          f.focus();
        }
      }
    }
  }

  document.addEventListener('keydown', handleKey);

  return function release() {
    document.removeEventListener('keydown', handleKey);
    if (prev && typeof prev.focus === 'function') prev.focus();
  };
}

export function setBusy(el, busy = true) {
  if (!el) return;
  el.setAttribute('aria-busy', String(busy));
  el.disabled = !!busy;
}
