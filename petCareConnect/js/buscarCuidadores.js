/**
 * Pet CareConnect - Buscador de cuidadores
 * Modales de filtros y contacto, paginación básica.
 */
document.addEventListener('DOMContentLoaded', () => {
    const moreFiltersBtn = document.querySelector('.button-more-filters');
    const filtersModal = document.getElementById('filters-modal-overlay');
    const closeFiltersBtn = document.getElementById('close-filters-modal');
    const cancelFiltersBtn = document.getElementById('cancel-filters-btn');
    const applyFiltersBtn = document.getElementById('apply-filters-btn');

    if (moreFiltersBtn && filtersModal) {
        moreFiltersBtn.addEventListener('click', () => {
            if (window.PCC_UI) {
                PCC_UI.openModal(filtersModal, moreFiltersBtn);
            } else {
                filtersModal.classList.add('is-open');
                filtersModal.setAttribute('aria-hidden', 'false');
            }
        });

        const closeFModal = () => {
            if (window.PCC_UI) {
                PCC_UI.closeModal(filtersModal);
            } else {
                filtersModal.classList.remove('is-open');
                filtersModal.setAttribute('aria-hidden', 'true');
            }
        };

        if (closeFiltersBtn) closeFiltersBtn.addEventListener('click', closeFModal);
        if (cancelFiltersBtn) cancelFiltersBtn.addEventListener('click', closeFModal);

        if (applyFiltersBtn) {
            applyFiltersBtn.addEventListener('click', () => {
                closeFModal();
                if (window.showToast) {
                    window.showToast('Filtros avanzados aplicados correctamente', 'info');
                }
            });
        }
    }

    const contactBtns = document.querySelectorAll('.contact-sitter-btn');
    const contactModal = document.getElementById('contact-modal-overlay');
    const closeContactBtn = document.getElementById('close-contact-modal');
    const cancelContactBtn = document.getElementById('cancel-contact-btn');
    const contactForm = document.getElementById('contact-sitter-form');
    const contactMsgInput = document.getElementById('contact-msg');
    const contactNameTitle = document.getElementById('contact-sitter-name-title');

    let currentSitter = 'Elena Martínez';

    contactBtns.forEach((btn) => {
        btn.addEventListener('click', () => {
            currentSitter = btn.dataset.sitterName || 'Cuidador';
            if (contactNameTitle) contactNameTitle.textContent = currentSitter;
            if (contactMsgInput && window.PCC_FORMS) {
                PCC_FORMS.clearError(contactMsgInput);
            }
            if (contactModal) {
                if (window.PCC_UI) {
                    PCC_UI.openModal(contactModal, btn);
                } else {
                    contactModal.classList.add('is-open');
                    contactModal.setAttribute('aria-hidden', 'false');
                }
                if (contactMsgInput) contactMsgInput.focus();
            }
        });
    });

    const closeCModal = () => {
        if (contactModal) {
            if (window.PCC_UI) {
                PCC_UI.closeModal(contactModal);
            } else {
                contactModal.classList.remove('is-open');
                contactModal.setAttribute('aria-hidden', 'true');
            }
        }
    };

    if (closeContactBtn) closeContactBtn.addEventListener('click', closeCModal);
    if (cancelContactBtn) cancelContactBtn.addEventListener('click', closeCModal);

    if (contactMsgInput) {
        contactMsgInput.addEventListener('input', () => {
            if (contactMsgInput.value.trim().length >= 10 && window.PCC_FORMS) {
                PCC_FORMS.clearError(contactMsgInput);
            }
        });
    }

    if (contactForm) {
        contactForm.addEventListener('submit', (e) => {
            e.preventDefault();
            const msgVal = (contactMsgInput ? contactMsgInput.value : '').trim();
            if (msgVal.length < 10) {
                if (window.PCC_FORMS && contactMsgInput) {
                    PCC_FORMS.showError(contactMsgInput, 'Escribe un mensaje de al menos 10 caracteres para el cuidador.');
                }
                if (contactMsgInput) contactMsgInput.focus();
                if (window.showToast) {
                    window.showToast('Escribe un mensaje de al menos 10 caracteres para el cuidador.', 'error');
                }
                return;
            }

            if (window.PCC_FORMS && contactMsgInput) {
                PCC_FORMS.clearError(contactMsgInput);
            }
            closeCModal();
            if (window.showToast) {
                window.showToast(`Mensaje enviado a ${currentSitter}. Te responderá pronto.`, 'success');
            }
            contactForm.reset();
        });
    }

    const prevBtn = document.querySelector('.pagination-prev-btn');
    const nextBtn = document.querySelector('.pagination-next-btn');

    if (prevBtn) {
        prevBtn.addEventListener('click', (e) => {
            e.preventDefault();
            if (window.showToast) {
                window.showToast('Ya estás en la primera página', 'info');
            }
        });
    }
    if (nextBtn) {
        nextBtn.addEventListener('click', (e) => {
            e.preventDefault();
            if (window.showToast) {
                window.showToast('Cargando más cuidadores...', 'info');
            }
        });
    }
});
