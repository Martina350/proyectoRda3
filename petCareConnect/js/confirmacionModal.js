const PCC_CONFIRMATION = {
    MODAL_ID: 'confirmationSuccessModal',

    normalizeBooking(booking) {
        if (!booking) return null;

        const code = booking.code || '#PCC-2026-000';
        const sitter = booking.sitterName || booking.sitter || 'Cuidador verificado';
        const service = booking.serviceName || booking.service || 'Servicio de cuidado';
        const dates = booking.dateFormatted
            || booking.datesDisplay
            || ((booking.startDate && booking.endDate) ? `${booking.startDate} - ${booking.endDate}` : 'Fechas por confirmar');

        let pet = booking.pet || '';
        if (!pet && window.PCC_BOOKINGS && typeof PCC_BOOKINGS.formatPetDisplay === 'function') {
            pet = PCC_BOOKINGS.formatPetDisplay(booking);
        } else if (!pet) {
            const pCount = booking.petCount || 1;
            const pName = booking.petName || 'Mascota';
            const pType = booking.petType || '';
            const pBreed = booking.petBreed || '';
            const details = [pType, pBreed].filter(Boolean).join(' · ');
            pet = details ? `${pName} · ${details}` : pName;
            if (pCount > 1) {
                pet = `${pCount} mascotas — ${pName} y ${pCount - 1} más`;
            }
        }

        let total = booking.total;
        if (typeof total === 'number') total = `$${total.toFixed(2)}`;
        else if (typeof total === 'string' && total && !total.trim().startsWith('$')) {
            const n = Number(total);
            total = isNaN(n) ? total : `$${n.toFixed(2)}`;
        } else if (!total) {
            total = '$0.00';
        }

        return { code, sitter, service, dates, pet, total };
    },

    ensureModal() {
        let overlay = document.getElementById(this.MODAL_ID);
        if (overlay) return overlay;

        overlay = document.createElement('div');
        overlay.id = this.MODAL_ID;
        overlay.className = 'modal-overlay confirmation-modal-overlay';
        overlay.setAttribute('role', 'dialog');
        overlay.setAttribute('aria-modal', 'true');
        overlay.setAttribute('aria-hidden', 'true');
        overlay.setAttribute('aria-labelledby', 'confirm-modal-title');

        overlay.innerHTML = `
            <div class="modal-card confirmation-modal-card">
                <div class="modal-header confirmation-modal-header">
                    <h2 id="confirm-modal-title" class="modal-title">¡Reserva confirmada!</h2>
                    <button type="button" class="modal-close-btn" id="btnCloseConfirmModal" aria-label="Cerrar">&times;</button>
                </div>
                <div class="modal-body confirmation-modal-body">
                    <div class="confirmation-modal-icon" aria-hidden="true">
                        <span class="material-symbols-outlined">check_circle</span>
                    </div>
                    <p class="confirmation-modal-lead">Hemos registrado tu solicitud y enviado el comprobante a tu correo.</p>
                    <div class="confirmation-details-box confirmation-modal-details">
                        <div class="confirmation-code-row">
                            <span><strong>Código:</strong></span>
                            <span id="confirm-code" class="code-badge">#PCC-2026-000</span>
                        </div>
                        <div class="summary-item">
                            <span>Cuidador:</span>
                            <strong id="confirm-sitter">—</strong>
                        </div>
                        <div class="summary-item">
                            <span>Servicio:</span>
                            <strong id="confirm-service">—</strong>
                        </div>
                        <div class="summary-item">
                            <span>Fechas:</span>
                            <strong id="confirm-dates-str">—</strong>
                        </div>
                        <div class="summary-item">
                            <span>Mascota:</span>
                            <strong id="confirm-pet-str">—</strong>
                        </div>
                        <div class="summary-item summary-total">
                            <span>Total:</span>
                            <strong id="confirm-total-str">$0.00</strong>
                        </div>
                    </div>
                    <div class="modal-policy-note confirmation-modal-policy">
                        <span class="material-symbols-outlined">verified_user</span>
                        <span>Cancelación gratuita hasta 24 h antes del inicio del servicio.</span>
                    </div>
                </div>
                <div class="modal-footer confirmation-modal-footer">
                    <a href="misReservas.html" class="button button-primary confirmation-modal-btn">Ver Mis Reservas</a>
                    <a href="buscarCuidadores.html" class="button button-outline confirmation-modal-btn">Explorar Más</a>
                </div>
            </div>
        `;

        document.body.appendChild(overlay);
        this.bindEvents(overlay);
        return overlay;
    },

    bindEvents(overlay) {
        if (overlay.dataset.bound === 'true') return;
        overlay.dataset.bound = 'true';

        const closeBtn = overlay.querySelector('#btnCloseConfirmModal');
        if (closeBtn) {
            closeBtn.addEventListener('click', () => this.hide());
        }

        overlay.addEventListener('click', (e) => {
            if (e.target === overlay) this.hide();
        });
    },

    fill(booking) {
        const data = this.normalizeBooking(booking);
        if (!data) return;

        const setText = (id, value) => {
            const el = document.getElementById(id);
            if (el) el.textContent = value;
        };

        setText('confirm-code', data.code);
        setText('confirm-sitter', data.sitter);
        setText('confirm-service', data.service);
        setText('confirm-dates-str', data.dates);
        setText('confirm-pet-str', data.pet);
        setText('confirm-total-str', data.total);
    },

    show(booking, triggerElement) {
        const overlay = this.ensureModal();
        this.fill(booking);

        if (window.PCC_UI && typeof PCC_UI.openModal === 'function') {
            PCC_UI.openModal(overlay, triggerElement || null);
        } else {
            overlay.classList.add('is-open');
            overlay.setAttribute('aria-hidden', 'false');
            document.body.style.overflow = 'hidden';
        }

        const closeBtn = overlay.querySelector('#btnCloseConfirmModal');
        if (closeBtn) closeBtn.focus();
    },

    hide() {
        const overlay = document.getElementById(this.MODAL_ID);
        if (!overlay) return;

        if (window.PCC_UI && typeof PCC_UI.closeModal === 'function') {
            PCC_UI.closeModal(overlay);
        } else {
            overlay.classList.remove('is-open');
            overlay.setAttribute('aria-hidden', 'true');
            document.body.style.overflow = '';
        }
    }
};

window.PCC_CONFIRMATION = PCC_CONFIRMATION;
