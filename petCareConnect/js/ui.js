

const PCC_UI = {

    activeModals: [],


    FOCUSABLE_SELECTORS: 'a[href], area[href], input:not([disabled]):not([type="hidden"]), select:not([disabled]), textarea:not([disabled]), button:not([disabled]), [tabindex]:not([tabindex="-1"]), [contenteditable="true"]',

    
    openModal(modal, triggerElement = null) {
        const modalEl = typeof modal === 'string' ? document.querySelector(modal) : modal;
        if (!modalEl) return;

        const trigger = triggerElement || document.activeElement;


        modalEl.classList.add('is-open');
        modalEl.setAttribute('aria-hidden', 'false');
        modalEl.setAttribute('aria-modal', 'true');
        modalEl.setAttribute('role', modalEl.getAttribute('role') || 'dialog');


        const modalRecord = {
            element: modalEl,
            trigger: trigger,
            keydownHandler: (e) => this.handleModalKeydown(e, modalEl)
        };
        this.activeModals.push(modalRecord);


        document.body.style.overflow = 'hidden';


        document.addEventListener('keydown', modalRecord.keydownHandler);


        setTimeout(() => {
            const focusables = modalEl.querySelectorAll(this.FOCUSABLE_SELECTORS);
            if (focusables.length > 0) {
                focusables[0].focus();
            } else {
                modalEl.setAttribute('tabindex', '-1');
                modalEl.focus();
            }
        }, 50);
    },

    
    closeModal(modal) {
        const modalEl = typeof modal === 'string' ? document.querySelector(modal) : modal;
        if (!modalEl) return;


        const index = this.activeModals.findIndex(m => m.element === modalEl);
        let trigger = null;

        if (index !== -1) {
            const record = this.activeModals[index];
            document.removeEventListener('keydown', record.keydownHandler);
            trigger = record.trigger;
            this.activeModals.splice(index, 1);
        }


        modalEl.classList.remove('is-open');
        modalEl.setAttribute('aria-hidden', 'true');
        modalEl.removeAttribute('aria-modal');


        if (this.activeModals.length === 0) {
            document.body.style.overflow = '';
        }


        if (trigger && typeof trigger.focus === 'function') {
            setTimeout(() => {
                trigger.focus();
            }, 50);
        }
    },

    
    closeTopModal() {
        if (this.activeModals.length > 0) {
            const top = this.activeModals[this.activeModals.length - 1];
            this.closeModal(top.element);
        }
    },

    
    handleModalKeydown(e, modalEl) {
        if (e.key === 'Escape' || e.key === 'Esc') {
            e.preventDefault();
            this.closeModal(modalEl);
            return;
        }

        if (e.key === 'Tab') {
            const focusables = Array.from(modalEl.querySelectorAll(this.FOCUSABLE_SELECTORS))
                .filter(el => el.offsetParent !== null);

            if (focusables.length === 0) {
                e.preventDefault();
                return;
            }

            const firstFocusable = focusables[0];
            const lastFocusable = focusables[focusables.length - 1];

            if (e.shiftKey) {

                if (document.activeElement === firstFocusable || !modalEl.contains(document.activeElement)) {
                    e.preventDefault();
                    lastFocusable.focus();
                }
            } else {

                if (document.activeElement === lastFocusable || !modalEl.contains(document.activeElement)) {
                    e.preventDefault();
                    firstFocusable.focus();
                }
            }
        }
    },

    
    makeKeyboardAccessible(element, callback) {
        if (!element) return;
        element.setAttribute('tabindex', element.getAttribute('tabindex') || '0');
        if (!element.getAttribute('role')) {
            element.setAttribute('role', 'button');
        }

        element.addEventListener('keydown', (e) => {
            if (e.key === 'Enter' || e.key === ' ' || e.key === 'Spacebar') {
                e.preventDefault();
                callback(e);
            }
        });
    },

    
    init() {
        document.addEventListener('click', (e) => {

            const openBtn = e.target.closest('[data-open-modal]');
            if (openBtn) {
                e.preventDefault();
                const targetSelector = openBtn.getAttribute('data-open-modal');
                this.openModal(targetSelector, openBtn);
                return;
            }


            const closeBtn = e.target.closest('[data-close-modal], .modal-close-btn');
            if (closeBtn) {
                e.preventDefault();
                const modalEl = closeBtn.closest('.modal-overlay');
                if (modalEl) {
                    this.closeModal(modalEl);
                } else {
                    this.closeTopModal();
                }
                return;
            }


            if (e.target.classList.contains('modal-overlay')) {
                this.closeModal(e.target);
            }
        });
    }
};


if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', () => PCC_UI.init());
} else {
    PCC_UI.init();
}

window.PCC_UI = PCC_UI;
