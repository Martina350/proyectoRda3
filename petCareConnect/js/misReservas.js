/**
 * Pet CareConnect - Lógica de Mis Reservas (misReservas.js)
 * Renderiza dinámicamente el historial de reservas en las 3 columnas
 * (Activas, Pasadas, Canceladas), calcula contadores, permite "Reservar de nuevo"
 * y gestionar cancelaciones con actualización en tiempo real en localStorage.
 */

document.addEventListener('DOMContentLoaded', () => {
    // Inicializar módulo de reservas
    if (window.PCC_BOOKINGS && typeof PCC_BOOKINGS.init === 'function') {
        PCC_BOOKINGS.init();
    }

    const activasContainer = document.getElementById('activas-cards-container');
    const pasadasContainer = document.getElementById('pasadas-cards-container');
    const canceladasContainer = document.getElementById('canceladas-cards-container');

    const badgeActivas = document.getElementById('badge-count-activas');
    const badgePasadas = document.getElementById('badge-count-pasadas');
    const badgeCanceladas = document.getElementById('badge-count-canceladas');

    if (!activasContainer || !pasadasContainer || !canceladasContainer) {
        console.warn('Contenedores de columnas de reservas no encontrados.');
        return;
    }

    // Renderizado principal
    renderBookings();

    // Eventos interactivos delegados en el documento
    document.addEventListener('click', handleActionClick);

    function renderBookings() {
        const allBookings = PCC_BOOKINGS.getBookings();

        const activas = [];
        const pasadas = [];
        const canceladas = [];

        allBookings.forEach(b => {
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

        // Actualizar contadores
        if (badgeActivas) badgeActivas.textContent = activas.length;
        if (badgePasadas) badgePasadas.textContent = pasadas.length;
        if (badgeCanceladas) badgeCanceladas.textContent = canceladas.length;

        // Renderizar columna de Activas
        if (activas.length === 0) {
            activasContainer.innerHTML = renderEmptyState(
                'activas',
                'No tienes reservas activas en este momento.',
                true
            );
        } else {
            activasContainer.innerHTML = activas.map(b => renderActiveCard(b)).join('');
        }

        // Renderizar columna de Pasadas
        if (pasadas.length === 0) {
            pasadasContainer.innerHTML = renderEmptyState(
                'pasadas',
                'Aún no tienes servicios de cuidado completados.',
                false
            );
        } else {
            pasadasContainer.innerHTML = pasadas.map(b => renderPastCard(b)).join('');
        }

        // Renderizar columna de Canceladas
        if (canceladas.length === 0) {
            canceladasContainer.innerHTML = renderEmptyState(
                'canceladas',
                'No tienes reservas canceladas en tu historial.',
                false
            );
        } else {
            canceladasContainer.innerHTML = canceladas.map(b => renderCancelledCard(b)).join('');
        }
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

    function renderActiveCard(b) {
        let statusBadgeClass = 'badge-en-progreso';
        let statusText = b.statusLabel || 'Activa';

        if (b.status === 'confirmada') {
            statusBadgeClass = 'badge-confirmada';
            statusText = 'Confirmada';
        } else if (b.status === 'programada') {
            statusBadgeClass = 'badge-manana';
            statusText = 'Programada';
        }

        const petLabel = b.petName ? `"${b.petName}"` : 'Mascota';
        const petTypeStr = b.petType ? ` (${b.petType})` : '';
        const totalAmount = Number(b.total || 0).toFixed(2);
        const avatarClass = avatarClassForService(b);

        return `
            <article class="card-surface booking-card card-hover-effect" data-booking-id="${b.id || b.code}">
                <div class="card-top-row">
                    <div class="card-provider-info">
                        <div class="avatar-circle ${avatarClass}" aria-hidden="true"></div>
                        <div class="provider-text">
                            <h3 class="card-service-title">${b.serviceName || 'Servicio de Cuidado'}</h3>
                            <p class="card-provider-name">Con ${b.sitterName || 'Cuidador'}</p>
                        </div>
                    </div>
                    <p class="status-badge ${statusBadgeClass}"><strong>Estado:</strong> ${statusText}</p>
                </div>

                <div class="card-details-list">
                    <p class="detail-item detail-fecha"><strong>Fecha:</strong> ${b.dateFormatted || `${b.startDate} - ${b.endDate}`}</p>
                    <p class="detail-item detail-mascota"><strong>Mascota:</strong> ${petLabel}${petTypeStr}</p>
                    <p class="detail-item detail-total"><strong>Total:</strong> $${totalAmount} <span class="detail-code-inline">(${b.code || ''})</span></p>
                </div>

                <div class="card-actions-grid two-cols">
                    <button type="button" class="button button-outline btn-seguimiento" data-sitter="${b.sitterName || 'el cuidador'}">Seguimiento</button>
                    <button type="button" class="button button-primary btn-contacto" data-sitter="${b.sitterName || 'el cuidador'}">Contacto</button>
                </div>
                <div class="card-footer-action">
                    <button type="button" class="btn-cancel-booking" data-booking-id="${b.id || b.code}">
                        <span class="material-symbols-outlined">cancel</span>
                        Cancelar reserva
                    </button>
                </div>
            </article>
        `;
    }

    function renderPastCard(b) {
        const ratingStr = b.rating ? `${b.rating.toFixed(1)} estrellas` : '5.0 estrellas';
        const totalAmount = Number(b.total || 0).toFixed(2);
        const petLabel = b.petName ? `"${b.petName}"` : 'Mascota';
        const avatarClass = avatarClassForService(b);

        const sitterParam = encodeURIComponent(b.sitterId || b.sitterName || '');
        const serviceParam = encodeURIComponent(b.serviceId || 'alojamiento');

        return `
            <article class="card-surface booking-card booking-card-past card-hover-effect" data-booking-id="${b.id || b.code}">
                <div class="card-top-row">
                    <div class="card-provider-info">
                        <div class="avatar-circle ${avatarClass} grayscale" aria-hidden="true"></div>
                        <div class="provider-text">
                            <h3 class="card-service-title text-muted">${b.serviceName || 'Cuidado en Casa'}</h3>
                            <p class="card-provider-name">Con ${b.sitterName || 'Cuidador'}</p>
                        </div>
                    </div>
                </div>

                <div class="card-details-list">
                    <p class="detail-item detail-fecha"><strong>Fecha:</strong> ${b.dateFormatted || b.startDate}</p>
                    <p class="detail-item detail-mascota"><strong>Mascota:</strong> ${petLabel}</p>
                    <div class="detail-rating-row">
                        <p class="detail-item detail-rating"><strong>Calificación:</strong> ${ratingStr}</p>
                        <p class="detail-item detail-estado-completada"><strong>Estado:</strong> Completada</p>
                    </div>
                </div>

                <div class="card-actions-grid full-width">
                    <a href="nuevaReserva.html?sitter=${sitterParam}&service=${serviceParam}" class="button button-outline btn-reservar-nuevo">
                        <span class="material-symbols-outlined" style="font-size: 16px;">replay</span>
                        Reservar de nuevo
                    </a>
                </div>
            </article>
        `;
    }

    function renderCancelledCard(b) {
        const totalAmount = Number(b.total || 0).toFixed(2);
        const avatarClass = avatarClassForService(b);

        return `
            <article class="card-surface booking-card booking-card-cancelled" data-booking-id="${b.id || b.code}">
                <div class="card-top-row">
                    <div class="card-provider-info">
                        <div class="avatar-circle ${avatarClass} grayscale" aria-hidden="true"></div>
                        <div class="provider-text">
                            <h3 class="card-service-title text-muted">${b.serviceName || 'Servicio'}</h3>
                            <p class="card-provider-name">Con ${b.sitterName || 'Cuidador'}</p>
                        </div>
                    </div>
                </div>

                <div class="card-details-list">
                    <p class="detail-item detail-cancelada"><strong>Estado:</strong> Cancelada por el usuario</p>
                    <p class="detail-item detail-estaba-para"><strong>Estaba para:</strong> ${b.dateFormatted || b.startDate}</p>
                </div>

                <div class="card-actions-grid full-width">
                    <button type="button" class="button button-secondary-dim btn-reembolso" data-total="${totalAmount}">
                        Detalles del reembolso
                    </button>
                </div>
            </article>
        `;
    }

    function renderEmptyState(category, message, showCTA = false) {
        let iconName = 'event_available';
        let title = 'No hay reservas activas';

        if (category === 'pasadas') {
            iconName = 'history';
            title = 'Sin historial pasado';
        } else if (category === 'canceladas') {
            iconName = 'check_circle';
            title = 'Sin cancelaciones';
        }

        return `
            <div class="empty-column-box">
                <div class="empty-column-icon-box">
                    <span class="material-symbols-outlined empty-column-icon">${iconName}</span>
                </div>
                <h3 class="empty-column-title">${title}</h3>
                <p class="empty-column-desc">${message}</p>
                ${showCTA ? `
                    <a href="nuevaReserva.html" class="button button-accent empty-column-btn">
                        <span class="material-symbols-outlined">add_circle</span>
                        Hacer una reserva
                    </a>
                ` : ''}
            </div>
        `;
    }

    function handleActionClick(e) {
        // Cancelar reserva
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
                    // Re-renderizar columnas
                    renderBookings();
                } else {
                    if (window.showToast) {
                        window.showToast('No se pudo cancelar la reserva.', 'error');
                    }
                }
            }
            return;
        }

        // Seguimiento
        const segBtn = e.target.closest('.btn-seguimiento');
        if (segBtn) {
            e.preventDefault();
            const sitter = segBtn.dataset.sitter || 'el cuidador';
            if (window.showToast) {
                window.showToast(`El rastreo GPS en tiempo real estará activo durante el servicio con ${sitter}.`, 'info');
            }
            return;
        }

        // Contacto
        const contactBtn = e.target.closest('.btn-contacto');
        if (contactBtn) {
            e.preventDefault();
            const sitter = contactBtn.dataset.sitter || 'el cuidador';
            if (window.showToast) {
                window.showToast(`Abriendo canal directo de mensaje con ${sitter}...`, 'info');
            }
            return;
        }

        // Reembolso
        const refundBtn = e.target.closest('.btn-reembolso');
        if (refundBtn) {
            e.preventDefault();
            const total = refundBtn.dataset.total || '25.00';
            if (window.showToast) {
                window.showToast(`El reembolso de $${total} ha sido procesado a tu método original de pago.`, 'success');
            }
            return;
        }
    }
});
