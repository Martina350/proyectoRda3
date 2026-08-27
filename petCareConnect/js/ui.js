/**
 * Pet CareConnect - Módulo de UI y Accesibilidad (ui.js)
 * Proporciona gestión accesible de modales (trampa de foco, escape, aria-hidden,
 * retorno de foco al disparador) y helpers para interacción de teclado (Enter, Espacio).
 */

const PCC_UI = {
    // Pila de modales abiertos para gestionar anidación si la hubiera
    activeModals: [],

    // Selectores de elementos enfocables
    FOCUSABLE_SELECTORS: 'a[href], area[href], input:not([disabled]):not([type="hidden"]), select:not([disabled]), textarea:not([disabled]), button:not([disabled]), [tabindex]:not([tabindex="-1"]), [contenteditable="true"]',

    /**
     * Abre un modal de forma accesible
     * @param {HTMLElement|string} modal - Elemento modal o selector
     * @param {HTMLElement} [triggerElement] - Elemento que disparó la apertura
     */
    openModal(modal, triggerElement = null) {
        const modalEl = typeof modal === 'string' ? document.querySelector(modal) : modal;
        if (!modalEl) return;

        const trigger = triggerElement || document.activeElement;

        // Configurar atributos ARIA
        modalEl.classList.add('is-open');
        modalEl.setAttribute('aria-hidden', 'false');
        modalEl.setAttribute('aria-modal', 'true');
        modalEl.setAttribute('role', modalEl.getAttribute('role') || 'dialog');

        // Guardar referencia en la pila
        const modalRecord = {
            element: modalEl,
            trigger: trigger,
            keydownHandler: (e) => this.handleModalKeydown(e, modalEl)
        };
        this.activeModals.push(modalRecord);

        // Bloquear scroll de fondo
        document.body.style.overflow = 'hidden';

        // Añadir listener para trampa de foco y Escape
        document.addEventListener('keydown', modalRecord.keydownHandler);

        // Mover el foco al primer elemento enfocable o al modal
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

    /**
     * Cierra un modal de forma accesible
     * @param {HTMLElement|string} modal - Elemento modal o selector
     */
    closeModal(modal) {
        const modalEl = typeof modal === 'string' ? document.querySelector(modal) : modal;
        if (!modalEl) return;

        // Buscar en la pila
        const index = this.activeModals.findIndex(m => m.element === modalEl);
        let trigger = null;

        if (index !== -1) {
            const record = this.activeModals[index];
            document.removeEventListener('keydown', record.keydownHandler);
            trigger = record.trigger;
            this.activeModals.splice(index, 1);
        }

        // Actualizar atributos ARIA
        modalEl.classList.remove('is-open');
        modalEl.setAttribute('aria-hidden', 'true');
        modalEl.removeAttribute('aria-modal');

        // Restaurar scroll si ya no hay modales abiertos
        if (this.activeModals.length === 0) {
            document.body.style.overflow = '';
        }

        // Devolver el foco al elemento disparador
        if (trigger && typeof trigger.focus === 'function') {
            setTimeout(() => {
                trigger.focus();
            }, 50);
        }
    },

    /**
     * Cierra el modal activo más reciente
     */
    closeTopModal() {
        if (this.activeModals.length > 0) {
            const top = this.activeModals[this.activeModals.length - 1];
            this.closeModal(top.element);
        }
    },

    /**
     * Trampa de foco y manejo de Escape dentro del modal
     */
    handleModalKeydown(e, modalEl) {
        if (e.key === 'Escape' || e.key === 'Esc') {
            e.preventDefault();
            this.closeModal(modalEl);
            return;
        }

        if (e.key === 'Tab') {
            const focusables = Array.from(modalEl.querySelectorAll(this.FOCUSABLE_SELECTORS))
                .filter(el => el.offsetParent !== null); // Solo elementos visibles

            if (focusables.length === 0) {
                e.preventDefault();
                return;
            }

            const firstFocusable = focusables[0];
            const lastFocusable = focusables[focusables.length - 1];

            if (e.shiftKey) {
                // Shift + Tab hacia atrás
                if (document.activeElement === firstFocusable || !modalEl.contains(document.activeElement)) {
                    e.preventDefault();
                    lastFocusable.focus();
                }
            } else {
                // Tab hacia adelante
                if (document.activeElement === lastFocusable || !modalEl.contains(document.activeElement)) {
                    e.preventDefault();
                    firstFocusable.focus();
                }
            }
        }
    },

    /**
     * Habilita activación con teclado (Enter y Espacio) en elementos interactivos
     */
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

    /**
     * Inicialización global de listeners para data-open-modal y data-close-modal
     */
    init() {
        document.addEventListener('click', (e) => {
            // Abrir modal mediante atributo
            const openBtn = e.target.closest('[data-open-modal]');
            if (openBtn) {
                e.preventDefault();
                const targetSelector = openBtn.getAttribute('data-open-modal');
                this.openModal(targetSelector, openBtn);
                return;
            }

            // Cerrar modal mediante botón de cerrar
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

            // Cerrar al hacer clic en el backdrop / overlay exterior
            if (e.target.classList.contains('modal-overlay')) {
                this.closeModal(e.target);
            }
        });
    }
};

// Inicializar automáticamente cuando el DOM esté listo
if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', () => PCC_UI.init());
} else {
    PCC_UI.init();
}

window.PCC_UI = PCC_UI;
