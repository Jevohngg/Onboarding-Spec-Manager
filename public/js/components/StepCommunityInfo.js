// /public/js/components/StepCommunityInfo.js
import { el } from '../utils/dom.js';
import { getState, setCommunityField } from '../store.js';

export class StepCommunityInfo {
  constructor() {
    this.root = el('div', { class: 'step step--info' });

    const s = getState().community;

    const title = el('h2', { id: 'community-info-title', class: 'section__title' }, 'Add important Community details');
    const desc  = el('p',  { class: 'section__desc' }, 'Every community begins with its land details. This helps define the location and structure so you can add plans and specs later.');

    // Form group
    this.form = el('div', {
      class: 'form-grid',
      role: 'group',
      'aria-labelledby': 'community-info-title'
    });

    // Fields
    this.fName     = this.buildField('Community Name',      'text',  'name',     s.name,       true);
    this.fDivision = this.buildField('Division',            'text',  'division', s.division || 'Northwestern', false);
    this.fParcel   = this.buildField('Parcel ID',           'text',  'parcelId', s.parcelId,  false);
    this.fLots     = this.buildField('Number of Lots',      'number','numLots',  s.numLots,   false);
    this.fStart    = this.buildField('Expected Start Date', 'date',  'startDate',s.startDate, false);

    this.form.append(this.fName, this.fDivision, this.fParcel, this.fLots, this.fStart);

    this.root.append(title, desc, this.form);

    // 🔹 Add a sidebar for this step (was missing, causing empty sidebar)
    this.sidebar = this.buildSidebar();
  }

  buildField(label, type, key, value, autofocus) {
    const field = el('div', { class: 'field' });
    const id = `field-${key}`;
    const lab = el('label', { class: 'field__label', for: id }, label);
    const input = el('input', { class: 'field__control', id, type, value: value || '' });
    input.addEventListener('input', () => setCommunityField(key, input.value));
    if (autofocus) input.autofocus = true;
    field.append(lab, input);
    return field;
  }

  buildSidebar() {
    return el('div', {}, [
      el('h3', {}, 'Why these details?'),
      el('p',  {}, 'Capturing land details now keeps your plans and specs organized by community and division. It also reduces RFIs and speeds up bid packages later.'),
      el('h3', { style: { marginTop: '1rem' } }, 'What to enter'),
      el('ul', {}, [
        el('li', {}, 'Community Name (required)'),
        el('li', {}, 'Division (defaults to “Northwestern”)'),
        el('li', {}, 'Parcel ID (optional)'),
        el('li', {}, 'Number of Lots (optional)'),
        el('li', {}, 'Expected Start Date (optional)')
      ]),
      el('div', { class: 'tip', style: { marginTop: '1rem' } },
        'Tip: You can change these details later — enter what you know now to keep moving.')
    ]);
  }

  canProceed() {
    return getState().community.name.trim().length > 0;
  }

  focusFirst() {
    const input = this.root.querySelector('input');
    if (input) input.focus();
  }
}
