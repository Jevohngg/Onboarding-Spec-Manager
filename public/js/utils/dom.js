// DOM helpers
export const qs = (sel, root = document) => root.querySelector(sel);
export const qsa = (sel, root = document) => Array.from(root.querySelectorAll(sel));

export function el(tag, attrs = {}, ...children) {
  const node = document.createElement(tag);
  for (const [k, v] of Object.entries(attrs || {})) {
    if (k === 'class') node.className = v;
    else if (k === 'style' && typeof v === 'object') Object.assign(node.style, v);
    else if (k.startsWith('on') && typeof v === 'function') node.addEventListener(k.slice(2).toLowerCase(), v);
    else if (v === true) node.setAttribute(k, '');
    else if (v !== false && v != null) node.setAttribute(k, v);
  }
  for (const child of children.flat()) {
    if (child == null) continue;
    node.append(child.nodeType ? child : document.createTextNode(String(child)));
  }
  return node;
}

export function svgIcon(id, className = 'btn__icon') {
  const NS = 'http://www.w3.org/2000/svg';
  const svg = document.createElementNS(NS, 'svg');
  svg.setAttribute('class', className);
  svg.setAttribute('aria-hidden', 'true');
  svg.setAttribute('focusable', 'false');

  const use = document.createElementNS(NS, 'use');
  // Modern
  use.setAttribute('href', `/assets/icons.svg#${id}`);
  // Safari fallback
  use.setAttributeNS('http://www.w3.org/1999/xlink', 'xlink:href', `/assets/icons.svg#${id}`);

  svg.appendChild(use);
  return svg;
}


export function uid(prefix = 'id') {
  return `${prefix}-${Math.random().toString(36).slice(2, 10)}`;
}

export function prettyBytes(num) {
  if (isNaN(num)) return '';
  const units = ['B','KB','MB','GB','TB'];
  let i = 0;
  while (num >= 1024 && i < units.length - 1) {
    num /= 1024; i++;
  }
  return `${num.toFixed(num < 10 && i > 0 ? 1 : 0)} ${units[i]}`;
}
