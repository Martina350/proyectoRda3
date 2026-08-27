

document.addEventListener('DOMContentLoaded', () => {
    if (window.PCC_BOOKINGS && typeof PCC_BOOKINGS.init === 'function') {
        PCC_BOOKINGS.init();
    }

    const activasContainer = document.getElementById('activas-cards-container');
    const pasadasContainer = document.getElementById('pasadas-cards-container');
    const canceladasContainer = document.getElementById('canceladas-cards-container');

    const badgeActivas = document.getElementById('badge-count-activas');
    const badgePasadas = document.getElementById('badge-count-pasadas');
    const badgeCanceladas = document.getElementById('badge-count-canceladas');

    const tabButtons = Array.from(document.querySelectorAll('.bookings-tab-btn[data-tab]'));
    const tabPanels = Array.from(document.querySelectorAll('.bookings-tab-panel[data-panel]'));

    if (!activasContainer || !pasadasContainer || !canceladasContainer) {
        console.warn('Contenedores de reservas no encontrados.');
        return;
    }

    const TAB_STORAGE_KEY = 'pcc_mis_reservas_tab';
    let currentTab = 'activas';

    try {
        const saved = sessionStorage.getItem(TAB_STORAGE_KEY);
        if (saved === 'activas' || saved === 'pasadas' || saved === 'canceladas') {
            currentTab = saved;
        }
    } catch (_) {  }

    initTabs();
    renderBookings();
    setActiveTab(currentTab, { skipPersist: true });

    document.addEventListener('click', handleActionClick);

    function initTabs() {
        tabButtons.forEach((btn) => {
            btn.addEventListener('click', () => {
                setActiveTab(btn.getAttribute('data-tab'));
            });

            btn.addEventListener('keydown', (e) => {
                const order = ['activas', 'pasadas', 'canceladas'];
                const idx = order.indexOf(btn.getAttribute('data-tab'));
                let nextIdx = idx;

                if (e.key === 'ArrowRight' || e.key === 'ArrowDown') {
                    nextIdx = (idx + 1) % order.length;
                } else if (e.key === 'ArrowLeft' || e.key === 'ArrowUp') {
                    nextIdx = (idx - 1 + order.length) % order.length;
                } else if (e.key === 'Home') {
                    nextIdx = 0;
                } else if (e.key === 'End') {
                    nextIdx = order.length - 1;
                } else {
                    return;
                }

                e.preventDefault();
                setActiveTab(order[nextIdx]);
                const nextBtn = tabButtons.find((b) => b.getAttribute('data-tab') === order[nextIdx]);
                if (nextBtn) nextBtn.focus();
            });
        });
    }

    function setActiveTab(tabId, options = {}) {
        if (!tabId) return;
        currentTab = tabId;

        tabButtons.forEach((btn) => {
            const isActive = btn.getAttribute('data-tab') === tabId;
            btn.classList.toggle('active', isActive);
            btn.setAttribute('aria-selected', isActive ? 'true' : 'false');
            btn.tabIndex = isActive ? 0 : -1;
        });

        tabPanels.forEach((panel) => {
            const isActive = panel.getAttribute('data-panel') === tabId;
            panel.classList.toggle('active', isActive);
            if (isActive) {
                panel.removeAttribute('hidden');
            } else {
                panel.setAttribute('hidden', '');
            }
        });

        if (!options.skipPersist) {
            try {
                sessionStorage.setItem(TAB_STORAGE_KEY, tabId);
            } catch (_) {  }
        }
    }

    function escapeHtml(value) {
        return String(value ?? '')
            .replace(/&/g, '&amp;')
            .replace(/</g, '&lt;')
            .replace(/>/g, '&gt;')
            .replace(/"/g, '&quot;')
            .replace(/'/g, '&#39;');
    }

    function categorizeBookings(allBookings) {
        const activas = [];
        const pasadas = [];
        const canceladas = [];

        allBookings.forEach((b) => {
            const status = (b.status || '').toLowerCase();
            const category = (b.statusCategory || '').toLowerCase();

            if (category === 'cancelled' || status === 'cancelada' || status === 'reembolsada') {
                canceladas.push(b);
            } else if (category === 'past' || status === 'completada' || status === 'finalizada' || status === 'pasada') {
                pasadas.push(b);
            } else {
                activas.push(b);
            }
        });

        return { activas, pasadas, canceladas };
    }

    function renderBookings() {
        const allBookings = PCC_BOOKINGS.getBookings();
        const { activas, pasadas, canceladas } = categorizeBookings(allBookings);

        if (badgeActivas) badgeActivas.textContent = activas.length;
        if (badgePasadas) badgePasadas.textContent = pasadas.length;
        if (badgeCanceladas) badgeCanceladas.textContent = canceladas.length;

        activasContainer.innerHTML = activas.length
            ? activas.map((b) => renderActiveCard(b)).join('')
            : renderEmptyState(
                'activas',
                'Sin reservas activas',
                'Cuando reserves un servicio, aparecerá aquí para hacer seguimiento.',
                true
            );

        pasadasContainer.innerHTML = pasadas.length
            ? pasadas.map((b) => renderPastCard(b)).join('')
            : renderEmptyState(
                'pasadas',
                'Sin historial todavía',
                'Tus servicios completados se guardarán en esta pestaña.',
                true
            );

        canceladasContainer.innerHTML = canceladas.length
            ? canceladas.map((b) => renderCancelledCard(b)).join('')
            : renderEmptyState(
                'canceladas',
                'Sin cancelaciones',
                'No tienes reservas canceladas en tu historial.',
                false
            );
    }

    function avatarClassForService(b) {
        const id = (b.serviceId || '').toLowerCase();
        const name = (b.serviceName || '').toLowerCase();
        if (id === 'paseos' || name.includes('paseo')) return 'avatar-walker';
        if (id === 'peluqueria' || name.includes('peluquer')) return 'avatar-grooming';
        if (id === 'alojamiento' || name.includes('aloj') || name.includes('cuidado en casa') || name.includes('estancia')) return 'avatar-sitter';
        if (name.includes('veterin') || name.includes('consulta')) return 'avatar-vet';
        if (name.includes('entren')) return 'avatar-trainer';
        if (id === 'guarderia' || name.includes('guarder')) return 'avatar-sitter';
        if (id === 'cuidado_dia' || name.includes('cuidado de día') || name.includes('cuidado de dia')) return 'avatar-sitter';
        return 'avatar-sitter';
    }

    function resolveSitterName(b) {
        if (b.sitterName) return b.sitterName;
        if (b.sitterId && window.PCC_BOOKINGS && typeof PCC_BOOKINGS.getSitterById === 'function') {
            const sitter = PCC_BOOKINGS.getSitterById(b.sitterId);
            if (sitter && sitter.name) return sitter.name;
        }
        return 'Cuidador';
    }

    function formatDate(b) {
        return b.dateFormatted || [b.startDate, b.endDate].filter(Boolean).join(' – ') || 'Fecha por confirmar';
    }

    function formatPet(b) {
        if (window.PCC_BOOKINGS && typeof PCC_BOOKINGS.formatPetDisplay === 'function') {
            return PCC_BOOKINGS.formatPetDisplay(b);
        }
        const name = b.petName || 'Mascota';
        const type = b.petType || '';
        const breed = b.petBreed || '';
        const details = [type, breed].filter(Boolean).join(' · ');
        return details ? `${name} · ${details}` : name;
    }

    function renderActiveCard(b) {
        let statusBadgeClass = 'badge-en-progreso';
        let statusText = b.statusLabel || 'Activa';

        if (b.status === 'confirmada') {
            statusBadgeClass = 'badge-confirmada';
            statusText = 'Confirmada';
        } else if (b.status === 'programada') {
            statusBadgeClass = 'badge-manana';
            statusText = b.statusLabel || 'Programada';
        }

        const sitterName = resolveSitterName(b);
        const totalAmount = Number(b.total || 0).toFixed(2);
        const avatarClass = avatarClassForService(b);
        const bookingId = escapeHtml(b.id || b.code || '');
        const code = escapeHtml(b.code || '');

        return `
            <article class="card-surface booking-card card-hover-effect" data-booking-id="${bookingId}">
                <div class="booking-card-header">
                    <div class="card-provider-info">
                        <div class="avatar-circle ${avatarClass}" aria-hidden="true"></div>
                        <div class="provider-text">
                            <h3 class="card-service-title">${escapeHtml(b.serviceName || 'Servicio de Cuidado')}</h3>
                            <p class="card-provider-name">Con ${escapeHtml(sitterName)}</p>
                            ${code ? `<span class="booking-code">${code}</span>` : ''}
                        </div>
                    </div>
                    <p class="status-badge ${statusBadgeClass}">${escapeHtml(statusText)}</p>
                </div>

                <div class="booking-card-body">
                    <p class="detail-item detail-fecha">${escapeHtml(formatDate(b))}</p>
                    <p class="detail-item detail-mascota">${escapeHtml(formatPet(b))}</p>
                    <p class="detail-item detail-precio"><span class="detail-price-label">Total</span> <strong>$${totalAmount}</strong></p>
                </div>

                <div class="booking-card-footer">
                    <div class="card-actions-grid two-cols">
                        <button type="button" class="button button-outline btn-seguimiento" data-sitter="${escapeHtml(sitterName)}">
                            Seguimiento
                        </button>
                        <button type="button" class="button button-primary btn-contacto" data-sitter="${escapeHtml(sitterName)}">
                            Contacto
                        </button>
                    </div>
                    <button type="button" class="btn-cancel-booking" data-booking-id="${bookingId}">
                        <span class="material-symbols-outlined" aria-hidden="true">cancel</span>
                        Cancelar reserva
                    </button>
                </div>
            </article>
        `;
    }

    function renderPastCard(b) {
        const ratingStr = b.rating ? `${Number(b.rating).toFixed(1)} estrellas` : '5.0 estrellas';
        const totalAmount = Number(b.total || 0).toFixed(2);
        const avatarClass = avatarClassForService(b);
        const sitterName = resolveSitterName(b);
        const bookingId = escapeHtml(b.id || b.code || '');
        const code = escapeHtml(b.code || '');
        const sitterParam = encodeURIComponent(b.sitterId || b.sitterName || '');
        const serviceParam = encodeURIComponent(b.serviceId || 'alojamiento');

        return `
            <article class="card-surface booking-card booking-card-past card-hover-effect" data-booking-id="${bookingId}">
                <div class="booking-card-header">
                    <div class="card-provider-info">
                        <div class="avatar-circle ${avatarClass} grayscale" aria-hidden="true"></div>
                        <div class="provider-text">
                            <h3 class="card-service-title">${escapeHtml(b.serviceName || 'Cuidado en Casa')}</h3>
                            <p class="card-provider-name">Con ${escapeHtml(sitterName)}</p>
                            ${code ? `<span class="booking-code">${code}</span>` : ''}
                        </div>
                    </div>
                    <p class="status-badge badge-completada">Completada</p>
                </div>

                <div class="booking-card-body">
                    <p class="detail-item detail-fecha">${escapeHtml(formatDate(b))}</p>
                    <p class="detail-item detail-mascota">${escapeHtml(formatPet(b))}</p>
                    <p class="detail-item detail-precio"><span class="detail-price-label">Total</span> <strong>$${totalAmount}</strong></p>
                    <p class="detail-item detail-rating">${escapeHtml(ratingStr)}</p>
                </div>

                <div class="booking-card-footer">
                    <div class="card-actions-grid full-width">
                        <a href="nuevaReserva.html?sitter=${sitterParam}&service=${serviceParam}" class="button button-outline btn-reservar-nuevo">
                            <span class="material-symbols-outlined" aria-hidden="true">replay</span>
                            Reservar de nuevo
                        </a>
                    </div>
                </div>
            </article>
        `;
    }

    function renderCancelledCard(b) {
        const totalAmount = Number(b.total || 0).toFixed(2);
        const avatarClass = avatarClassForService(b);
        const sitterName = resolveSitterName(b);
        const bookingId = escapeHtml(b.id || b.code || '');
        const code = escapeHtml(b.code || '');
        const statusLabel = b.statusLabel || 'Cancelada por el usuario';

        return `
            <article class="card-surface booking-card booking-card-cancelled" data-booking-id="${bookingId}">
                <div class="booking-card-header">
                    <div class="card-provider-info">
                        <div class="avatar-circle ${avatarClass} grayscale" aria-hidden="true"></div>
                        <div class="provider-text">
                            <h3 class="card-service-title">${escapeHtml(b.serviceName || 'Servicio')}</h3>
                            <p class="card-provider-name">Con ${escapeHtml(sitterName)}</p>
                            ${code ? `<span class="booking-code">${code}</span>` : ''}
                        </div>
                    </div>
                    <p class="status-badge badge-cancelada-status">Cancelada</p>
                </div>

                <div class="booking-card-body">
                    <p class="detail-item detail-cancelada">${escapeHtml(statusLabel)}</p>
                    <p class="detail-item detail-fecha">${escapeHtml(formatDate(b))}</p>
                    <p class="detail-item detail-precio"><span class="detail-price-label">Total</span> <strong>$${totalAmount}</strong></p>
                </div>

                <div class="booking-card-footer">
                    <div class="card-actions-grid full-width">
                        <button type="button" class="button button-secondary-dim btn-reembolso" data-total="${totalAmount}">
                            Detalles del reembolso
                        </button>
                    </div>
                </div>
            </article>
        `;
    }

    function renderEmptyState(category, title, message, showCTA = false) {
        let iconName = 'event_available';
        if (category === 'pasadas') iconName = 'history';
        if (category === 'canceladas') iconName = 'check_circle';

        return `
            <div class="bookings-empty-state">
                <div class="bookings-empty-illustration" aria-hidden="true">
                    <span class="material-symbols-outlined bookings-empty-paw">pets</span>
                    <span class="material-symbols-outlined bookings-empty-icon">${iconName}</span>
                </div>
                <h3 class="bookings-empty-title">${escapeHtml(title)}</h3>
                <p class="bookings-empty-desc">${escapeHtml(message)}</p>
                ${showCTA ? `
                    <a href="servicios.html" class="button button-accent bookings-empty-cta">
                        <span class="material-symbols-outlined" aria-hidden="true">explore</span>
                        Explorar servicios
                    </a>
                ` : ''}
            </div>
        `;
    }

    function handleActionClick(e) {
        const cancelBtn = e.target.closest('.btn-cancel-booking');
        if (cancelBtn) {
            e.preventDefault();
            const bookingId = cancelBtn.dataset.bookingId;
            if (!bookingId) return;

            if (confirm('¿Estás seguro de que deseas cancelar esta reserva?')) {
                const cancelled = PCC_BOOKINGS.cancelBooking(bookingId);
                if (cancelled) {
                    if (window.showToast) {
                        window.showToast('La reserva ha sido cancelada correctamente.', 'info');
                    }
                    renderBookings();
                    setActiveTab('canceladas');
                } else if (window.showToast) {
                    window.showToast('No se pudo cancelar la reserva.', 'error');
                }
            }
            return;
        }

        const segBtn = e.target.closest('.btn-seguimiento');
        if (segBtn) {
            e.preventDefault();
            const sitter = segBtn.dataset.sitter || 'el cuidador';
            if (window.showToast) {
                window.showToast(`El rastreo GPS en tiempo real estará activo durante el servicio con ${sitter}.`, 'info');
            }
            return;
        }

        const contactBtn = e.target.closest('.btn-contacto');
        if (contactBtn) {
            e.preventDefault();
            const sitter = contactBtn.dataset.sitter || 'el cuidador';
            if (window.showToast) {
                window.showToast(`Abriendo canal directo de mensaje con ${sitter}...`, 'info');
            }
            return;
        }

        const refundBtn = e.target.closest('.btn-reembolso');
        if (refundBtn) {
            e.preventDefault();
            const total = refundBtn.dataset.total || '25.00';
            if (window.showToast) {
                window.showToast(`El reembolso de $${total} ha sido procesado a tu método original de pago.`, 'success');
            }
        }
    }
});
