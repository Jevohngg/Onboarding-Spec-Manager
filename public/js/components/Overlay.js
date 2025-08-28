// /public/js/components/Overlay.js
import { el, svgIcon } from '../utils/dom.js';
import { trapFocus } from '../utils/a11y.js';

export class Overlay {
  constructor({ title = 'Add Your First Community', onClose } = {}) {
    this.onClose = onClose;

    // Root overlay container
    this.root = el('div', {
      id: 'onboarding',
      role: 'dialog',
      'aria-modal': 'true',
      'aria-label': title
    });

    // Backdrop + focusable panel
    this.backdrop = el('div', { class: 'overlay__backdrop' });
    this.panel = el('div', { class: 'overlay__panel', tabindex: '-1' });

    // Top bar (logo • divider • title • actions)
    const bar = el('div', { class: 'wizard__bar' }, [
      el('div', { class: 'wizard__title' }, [
        el('img', {
          src: '/assets/logo.svg',
          alt: 'Company logo',
          class: 'wizard__logo'
        }),
        el('span', { class: 'wizard__divider' }),
        el('span', { class: 'wizard__title-text' }, title)
      ]),
      this.actions = el('div', { class: 'wizard__actions' }, [
        this.btnLater = el(
          'button',
          { class: 'btn btn--secondary wizard__btn-later', id: 'btn-do-later' },
          'Do This Later'
        ),
        el('span', { class: 'wizard__divider' }),
        this.btnClose = el(
          'button',
          { class: 'btn btn--icon wizard__btn-close', 'aria-label': 'Close onboarding' },
          svgIcon('icon-x')
        )
      ])
    ]);

    // Content grid: LEFT rail (stepper + main + footer) + RIGHT static sidebar
    this.contentWrap = el('div', { class: 'wizard__content' });

    // Left rail (grouped)
    this.left = el('div', { class: 'wizard__left' });
    this.stepperMount = el('div', { class: 'wizard__stepper' });
    this.main = el('div', { class: 'main' });
    this.footer = el('div', { class: 'wizard__footer' });
    this.left.append(this.stepperMount, this.main, this.footer);

    // Static sidebar (identical for all steps; with fine-grained classes)
    this.sidebar = el('aside', { class: 'sidebar' });
    this.sidebar.append(this.buildStaticSidebar());

    // Compose content grid
    this.contentWrap.append(this.left, this.sidebar);

    // Build panel
    this.panel.append(bar, this.contentWrap);

    // Attach to root
    this.root.append(this.backdrop, this.panel);

    // Events
    this.boundEsc = (e) => { if (e.key === 'Escape') this.close(); };
    this.btnLater.addEventListener('click', () => this.close());
    this.btnClose.addEventListener('click', () => this.close());
    this.backdrop.addEventListener('click', () => this.close());
  }

  // Static sidebar content with classed sections/headers/bodies
  buildStaticSidebar() {
    const wrap = el('div', { class: 'sidebar__content' }, [

      // Section 1
      el('section', { class: 'sidebar__section', 'aria-labelledby': 'sb-why-heading' }, [
        el('h3', { id: 'sb-why-heading', class: 'sidebar__heading' }, 'Why add a community?'),
        el('div', { class: 'sidebar__body' }, [
          el('p', { class: 'sidebar__text' },
            'A community is your central hub, consolidating all plans, specs, and details — minimizing RFIs and providing one place to build bid packages for trades and suppliers.'
          )
        ])
      ]),

      // Section 2
      el('section', { class: 'sidebar__section', 'aria-labelledby': 'sb-steps-heading' }, [
        el('h3', { id: 'sb-steps-heading', class: 'sidebar__heading' }, 'What happens in this setup?'),
        el('div', { class: 'sidebar__body' }, [
          el('ul', { class: 'sidebar__list' }, [
            el('li', { class: 'sidebar__item' }, [
              el('strong', {}, 'Step 1: '),
              'Upload Specs — Add your community-specific or standard base specification sheets.'
            ]),
            el('li', { class: 'sidebar__item' }, [
              el('strong', {}, 'Step 2: '),
              'Community Info — Enter key details to keep everything organized and accessible.'
            ]),
            el('li', { class: 'sidebar__item' }, [
              el('strong', {}, 'Step 3: '),
              'Upload Plans — Add your master plans for this community.'
            ])
          ])
        ])
      ]),

      // Section 3
      el('section', { class: 'sidebar__section', 'aria-labelledby': 'sb-unlocks-heading' }, [
        el('h3', { id: 'sb-unlocks-heading', class: 'sidebar__heading' }, 'What this unlocks'),
        el('div', { class: 'sidebar__body' }, [
          el('ul', { class: 'sidebar__list' }, [
            el('li', { class: 'sidebar__item' }, 'Ensures specs match the right community and division for precision.'),
            el('li', { class: 'sidebar__item' }, 'Leverages existing company data to save time and effort.'),
            el('li', { class: 'sidebar__item' }, 'Delivers ready-to-use spec sheets directly to contractors.')
          ])
        ])
      ]),

      // Tip
      el('div', { class: 'sidebar__tip tip' },
        'Tip: Don’t worry about filling every field now — you can always update or expand details later.'
      )
    ]);

    return wrap;
  }

  mount(parent = document.body) {
    parent.appendChild(this.root);
  }

  /**
   * Mounts provided nodes into the left rail. Sidebar stays static and is not replaced.
   */
  setContent({ stepperEl, mainEl, footerEl /* sidebar is static */ }) {
    if (stepperEl) {
      this.stepperMount.replaceChildren(stepperEl);
    }
    // Only swap the main when a new node is provided and it's different
    if (mainEl && this.main.firstChild !== mainEl) {
      this.main.replaceChildren(mainEl);
    }
    if (footerEl) {
      this.footer.replaceChildren(footerEl);
    }
  }

  /** Clear left-rail content and scroll positions (full overlay reset) */
  reset() {
    this.stepperMount.replaceChildren();
    this.main.replaceChildren();
    this.footer.replaceChildren();
    // scroll back to top
    this.main.scrollTop = 0;
    this.left.scrollTop = 0;
    this.panel.scrollTop = 0;
  }

  open() {
    if (!this.root.isConnected) document.body.appendChild(this.root);
    // Ensure visible while animating (CSS will handle opacity/transform)
    this.root.classList.remove('is-closing');
    this.root.classList.add('is-open');

    document.addEventListener('keydown', this.boundEsc);
    this.releaseTrap = trapFocus(this.panel);
  }

  /**
   * Close with a fade-down animation, then fully reset.
   * @param {{reset?: boolean}} opts
   */
  close(opts = {}) {
    const { reset = true } = opts;

    // Keep visible during the closing animation
    this.root.classList.add('is-closing');
    this.root.classList.remove('is-open');

    document.removeEventListener('keydown', this.boundEsc);

    const onDone = () => {
      this.root.classList.remove('is-closing');
      if (this.releaseTrap) this.releaseTrap();
      if (reset) this.reset();
      if (typeof this.onClose === 'function') this.onClose();
    };

    // Wait for panel transition to finish
    const target = this.panel;
    const handler = (e) => {
      if (e.target !== target) return;
      target.removeEventListener('transitionend', handler);
      // Small rAF to ensure final styles applied before cleanup
      requestAnimationFrame(onDone);
    };
    target.addEventListener('transitionend', handler);
  }
}
