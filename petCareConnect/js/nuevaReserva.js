/**
 * Pet CareConnect - Lógica de Nueva Reserva (nuevaReserva.js)
 * Controla la lectura de parámetros URL, validación interactiva de fechas,
 * selección de cuidadores en tarjetas de radio, cálculo reactivo de costes
 * y guardado seguro en localStorage con toasts y redirección.
 */

document.addEventListener('DOMContentLoaded', () => {
    // Inicializar módulos de soporte si no se ejecutaron aún
    if (window.PCC_BOOKINGS && typeof PCC_BOOKINGS.init === 'function') {
        PCC_BOOKINGS.init();
    }
    if (window.PCC_AUTH && typeof PCC_AUTH.init === 'function') {
        PCC_AUTH.init();
    }

    const form = document.getElementById('booking-reservation-form');
    const sittersGrid = document.getElementById('sitters-cards-grid');
    const serviceSelect = document.getElementById('service-selector');
    const startDateInput = document.getElementById('booking-start-date');
    const endDateInput = document.getElementById('booking-end-date');
    const datesErrorBox = document.getElementById('dates-error-box');
    const datesErrorText = document.getElementById('dates-error-text');
    const petSelect = document.getElementById('booking-pet-selector');
    const petCountSelect = document.getElementById('booking-pet-count');
    const notesInput = document.getElementById('booking-notes');
    const submitErrorAlert = document.getElementById('booking-submit-error-alert');
    const submitErrorText = document.getElementById('booking-submit-error-text');

    // Elementos del resumen en vivo
    const summaryAvatar = document.getElementById('summary-sitter-avatar');
    const summarySitterName = document.getElementById('summary-sitter-name');
    const summarySitterLoc = document.getElementById('summary-sitter-loc-text');
    const summaryServiceName = document.getElementById('summary-service-name');
    const summaryDatesRange = document.getElementById('summary-dates-range');
    const summaryDurationText = document.getElementById('summary-duration-text');
    const summaryPetName = document.getElementById('summary-pet-name');
    const summaryBreakdown = document.getElementById('summary-calc-breakdown');
    const summarySubtotal = document.getElementById('summary-subtotal-val');
    const summaryFee = document.getElementById('summary-fee-val');
    const summaryTotal = document.getElementById('summary-total-val');

    if (!form || !sittersGrid || !serviceSelect) {
        console.warn('Formulario de nueva reserva no encontrado en esta página.');
        return;
    }

    // 1. Leer parámetros URL
    const urlParams = new URLSearchParams(window.location.search);
    const paramSitter = urlParams.get('sitter') || urlParams.get('sitterId') || '';
    const paramService = urlParams.get('service') || urlParams.get('serviceId') || '';
    const paramStart = urlParams.get('start') || urlParams.get('check-in') || '';
    const paramEnd = urlParams.get('end') || urlParams.get('check-out') || '';
    const paramPet = urlParams.get('pet') || urlParams.get('petId') || '';
    const paramPetCount = urlParams.get('petCount') || urlParams.get('pet-quantity') || '1';

    // 2. Establecer límites mínimos y fechas por defecto
    const today = new Date();
    const todayStr = formatDateISO(today);
    
    // Por defecto: entrada = mañana, salida = en 4 días
    const defaultStart = new Date(today);
    defaultStart.setDate(today.getDate() + 1);
    const defaultEnd = new Date(today);
    defaultEnd.setDate(today.getDate() + 4);

    startDateInput.min = todayStr;
    endDateInput.min = todayStr;

    startDateInput.value = paramStart && isValidDateStr(paramStart) ? paramStart : formatDateISO(defaultStart);
    endDateInput.value = paramEnd && isValidDateStr(paramEnd) ? paramEnd : formatDateISO(defaultEnd);

    // 3. Renderizar opciones de cuidadores en tarjetas de radio
    const sitters = PCC_BOOKINGS.getSitters();
    let initialSitterId = sitters[0].id;

    if (paramSitter) {
        const found = PCC_BOOKINGS.getSitterById(paramSitter);
        if (found) initialSitterId = found.id;
    }

    renderSitterCards(sitters, initialSitterId);

    // 4. Renderizar opciones de servicios
    const services = PCC_BOOKINGS.getServices();
    let initialServiceId = services[0].id;

    if (paramService) {
        const foundSrv = PCC_BOOKINGS.getServiceById(paramService);
        if (foundSrv) initialServiceId = foundSrv.id;
    }

    renderServicesOptions(services, initialServiceId);

    // 5. Renderizar mascotas del usuario
    renderPetOptions(paramPet);

    if (paramPetCount && ['1', '2', '3'].includes(paramPetCount)) {
        petCountSelect.value = paramPetCount;
    }

    // 6. Escuchar eventos de cambio para validación y recálculo en vivo
    sittersGrid.addEventListener('change', handleFormChange);
    serviceSelect.addEventListener('change', handleFormChange);
    startDateInput.addEventListener('input', handleDateChange);
    endDateInput.addEventListener('input', handleDateChange);
    petSelect.addEventListener('change', handleFormChange);
    petCountSelect.addEventListener('change', handleFormChange);
    if (notesInput) notesInput.addEventListener('input', () => hideSubmitError());

    // Primer cálculo inicial
    updateLiveSummary();

    // 7. Manejo de envío del formulario
    form.addEventListener('submit', handleFormSubmit);

    // ==========================================
    // FUNCIONES AUXILIARES Y LÓGICA DE NEGOCIO
    // ==========================================

    function renderSitterCards(sittersList, selectedId) {
        sittersGrid.innerHTML = '';

        sittersList.forEach((sitter, index) => {
            const isChecked = sitter.id === selectedId || (!selectedId && index === 0);
            const cardWrapper = document.createElement('div');
            cardWrapper.className = 'sitter-radio-card-wrapper';

            cardWrapper.innerHTML = `
                <input type="radio" 
                       id="sitter-radio-${sitter.id}" 
                       name="sitterId" 
                       value="${sitter.id}" 
                       class="sitter-radio-input" 
                       ${isChecked ? 'checked' : ''} 
                       required 
                       aria-required="true">
                <label for="sitter-radio-${sitter.id}" class="sitter-radio-card" tabindex="0">
                    <div class="sitter-card-body">
                        <div class="sitter-card-avatar-box">
                            <div class="sitter-card-avatar">${sitter.avatar || 'CU'}</div>
                            ${sitter.verified ? `
                                <span class="material-symbols-outlined verified-badge-icon" title="Cuidador verificado">verified</span>
                            ` : ''}
                        </div>
                        <div class="sitter-card-content-col">
                            <div class="sitter-card-header-line">
                                <strong class="sitter-card-name">${sitter.name}</strong>
                                <div class="sitter-rating-pill">
                                    <span class="material-symbols-outlined star-icon">star</span>
                                    <span class="rating-score">${sitter.rating.toFixed(1)}</span>
                                    <span class="rating-reviews">(${sitter.reviewsCount})</span>
                                </div>
                            </div>
                            <p class="sitter-card-specialty">${sitter.title}</p>
                            <p class="sitter-card-location">
                                <span class="material-symbols-outlined loc-icon">location_on</span>
                                <span>${sitter.location} · ${sitter.country || 'Ecuador'}</span>
                            </p>
                            <p class="sitter-card-bio-snippet">${sitter.bio}</p>
                        </div>
                        <div class="sitter-card-rate-col">
                            <div class="sitter-rate-badge">
                                <span class="rate-prefix">Desde</span>
                                <span class="rate-val">$${sitter.pricePerNight}</span>
                                <span class="rate-unit">/ noche</span>
                            </div>
                            <div class="sitter-radio-select-indicator">
                                <span class="material-symbols-outlined checkmark">check_circle</span>
                                <span class="select-label-text">Seleccionado</span>
                            </div>
                        </div>
                    </div>
                </label>
            `;

            // Permitir selección con teclado (Enter / Espacio)
            const label = cardWrapper.querySelector('.sitter-radio-card');
            const radio = cardWrapper.querySelector('input[type="radio"]');
            label.addEventListener('keydown', (e) => {
                if (e.key === ' ' || e.key === 'Enter') {
                    e.preventDefault();
                    radio.checked = true;
                    handleFormChange();
                }
            });

            sittersGrid.appendChild(cardWrapper);
        });
    }

    function renderServicesOptions(servicesList, selectedId) {
        serviceSelect.innerHTML = '<option value="" disabled>Selecciona un servicio...</option>';

        servicesList.forEach(srv => {
            const opt = document.createElement('option');
            opt.value = srv.id;
            opt.textContent = `${srv.name} — Desde $${srv.basePrice} ${srv.priceUnit}`;
            if (srv.id === selectedId) {
                opt.selected = true;
            }
            serviceSelect.appendChild(opt);
        });
    }

    function renderPetOptions(selectedPetParam) {
        let userPets = [];
        if (window.PCC_AUTH && typeof PCC_AUTH.getPets === 'function') {
            userPets = PCC_AUTH.getPets();
        }

        if (!userPets || userPets.length === 0) {
            userPets = [
                { id: 'pet-1', name: 'Bruno', breed: 'Beagle', type: 'Perro' },
                { id: 'pet-2', name: 'Luna', breed: 'Persa', type: 'Gato' }
            ];
        }

        petSelect.innerHTML = '';

        userPets.forEach((pet, index) => {
            const opt = document.createElement('option');
            opt.value = pet.id;
            opt.textContent = `${pet.name} (${pet.type || 'Mascota'} - ${pet.breed || 'Común'})`;
            opt.dataset.petName = pet.name;
            opt.dataset.petType = `${pet.type || 'Mascota'} (${pet.breed || 'Común'})`;

            if (selectedPetParam && (selectedPetParam === pet.id || selectedPetParam.toLowerCase() === pet.name.toLowerCase())) {
                opt.selected = true;
            } else if (!selectedPetParam && index === 0) {
                opt.selected = true;
            }

            petSelect.appendChild(opt);
        });

        // Opción genérica adicional
        const customOpt = document.createElement('option');
        customOpt.value = 'custom';
        customOpt.textContent = '+ Otra mascota';
        customOpt.dataset.petName = 'Mascota adicional';
        customOpt.dataset.petType = 'Perro / Gato';
        petSelect.appendChild(customOpt);
    }

    function handleDateChange() {
        validateDates();
        updateLiveSummary();
    }

    function handleFormChange() {
        validateDates();
        updateLiveSummary();
        hideSubmitError();
    }

    /**
     * Valida la coherencia de las fechas de entrada y salida
     */
    function validateDates() {
        const startVal = startDateInput.value;
        const endVal = endDateInput.value;

        if (!startVal || !endVal) {
            showDateError('Por favor ingresa tanto la fecha de entrada como la de salida.');
            return false;
        }

        const dStart = new Date(startVal + 'T00:00:00');
        const dEnd = new Date(endVal + 'T00:00:00');

        if (isNaN(dStart.getTime()) || isNaN(dEnd.getTime())) {
            showDateError('Las fechas seleccionadas tienen un formato inválido.');
            return false;
        }

        if (dEnd < dStart) {
            showDateError('La fecha de salida debe ser posterior o igual a la fecha de entrada.');
            startDateInput.classList.add('input-invalid');
            endDateInput.classList.add('input-invalid');
            return false;
        }

        // Si es válido, ocultar errores
        hideDateError();
        startDateInput.classList.remove('input-invalid');
        endDateInput.classList.remove('input-invalid');
        return true;
    }

    function showDateError(message) {
        if (datesErrorBox && datesErrorText) {
            datesErrorText.textContent = message;
            datesErrorBox.style.display = 'flex';
        }
    }

    function hideDateError() {
        if (datesErrorBox) {
            datesErrorBox.style.display = 'none';
        }
    }

    function showSubmitError(message) {
        if (submitErrorAlert && submitErrorText) {
            submitErrorText.textContent = message;
            submitErrorAlert.style.display = 'flex';
        }
        if (window.showToast) {
            window.showToast(message, 'error');
        }
    }

    function hideSubmitError() {
        if (submitErrorAlert) {
            submitErrorAlert.style.display = 'none';
        }
    }

    /**
     * Actualiza reactivamente el panel de resumen y cálculo de costes
     */
    function updateLiveSummary() {
        const checkedRadio = sittersGrid.querySelector('input[name="sitterId"]:checked');
        const selectedSitterId = checkedRadio ? checkedRadio.value : (sitters[0] ? sitters[0].id : null);
        const selectedServiceId = serviceSelect.value || 'alojamiento';
        const startVal = startDateInput.value;
        const endVal = endDateInput.value;
        const petCountVal = parseInt(petCountSelect.value, 10) || 1;

        const sitter = PCC_BOOKINGS.getSitterById(selectedSitterId) || sitters[0];
        const service = PCC_BOOKINGS.getServiceById(selectedServiceId) || services[0];

        // Actualizar datos del cuidador en el resumen
        if (sitter) {
            if (summaryAvatar) summaryAvatar.textContent = sitter.avatar || 'CU';
            if (summarySitterName) summarySitterName.textContent = sitter.name;
            if (summarySitterLoc) summarySitterLoc.textContent = `${sitter.location} · ${sitter.country || 'Ecuador'}`;
        }

        // Actualizar servicio
        if (service && summaryServiceName) {
            summaryServiceName.textContent = service.name;
        }

        // Actualizar mascota seleccionada
        if (petSelect && summaryPetName) {
            const selectedOpt = petSelect.options[petSelect.selectedIndex];
            const pName = selectedOpt ? (selectedOpt.dataset.petName || selectedOpt.textContent) : 'Mascota';
            summaryPetName.textContent = petCountVal > 1 ? `${pName} (+${petCountVal - 1})` : pName;
        }

        // Cotización
        const quote = PCC_BOOKINGS.quote({
            sitterId: sitter ? sitter.id : null,
            serviceId: service ? service.id : null,
            startDate: startVal,
            endDate: endVal,
            petCount: petCountVal
        });

        // Fechas y duración
        if (startVal && endVal && isValidDateStr(startVal) && isValidDateStr(endVal)) {
            const dStart = new Date(startVal + 'T00:00:00');
            const dEnd = new Date(endVal + 'T00:00:00');
            const formatOpts = { day: 'numeric', month: 'short' };
            const startFmt = dStart.toLocaleDateString('es-ES', formatOpts);
            const endFmt = dEnd.toLocaleDateString('es-ES', formatOpts);
            if (summaryDatesRange) {
                summaryDatesRange.textContent = startFmt === endFmt ? startFmt : `${startFmt} - ${endFmt}`;
            }
        }

        if (summaryDurationText) {
            summaryDurationText.textContent = `${quote.duration} ${quote.durationUnit}`;
        }

        // Desglose de precios
        if (summaryBreakdown) summaryBreakdown.textContent = quote.breakdownText;
        if (summarySubtotal) summarySubtotal.textContent = `$${quote.subtotal.toFixed(2)}`;
        if (summaryFee) summaryFee.textContent = `$${quote.serviceFee.toFixed(2)}`;
        if (summaryTotal) summaryTotal.textContent = `$${quote.total.toFixed(2)}`;
    }

    /**
     * Procesa la confirmación de la reserva
     */
    function handleFormSubmit(e) {
        e.preventDefault();
        hideSubmitError();

        // 1. Validar selección de cuidador
        const checkedRadio = sittersGrid.querySelector('input[name="sitterId"]:checked');
        if (!checkedRadio) {
            showSubmitError('Por favor selecciona un cuidador en el Paso 1.');
            const block1 = document.getElementById('block-sitter-selection');
            if (block1) block1.scrollIntoView({ behavior: 'smooth' });
            return;
        }

        // 2. Validar selección de servicio
        if (!serviceSelect.value) {
            showSubmitError('Por favor selecciona el tipo de servicio deseado.');
            serviceSelect.focus();
            return;
        }

        // 3. Validar fechas (salida >= entrada)
        const isDatesValid = validateDates();
        if (!isDatesValid) {
            showSubmitError('Las fechas son inválidas. La fecha de salida debe ser igual o posterior a la de entrada.');
            startDateInput.focus();
            return;
        }

        // 4. Validar mascota
        if (!petSelect.value) {
            showSubmitError('Por favor selecciona la mascota para el servicio.');
            petSelect.focus();
            return;
        }

        // 5. Armar objeto para addBooking
        const selectedOpt = petSelect.options[petSelect.selectedIndex];
        const petName = selectedOpt ? (selectedOpt.dataset.petName || 'Bruno') : 'Bruno';
        const petType = selectedOpt ? (selectedOpt.dataset.petType || 'Perro (Beagle)') : 'Perro (Beagle)';
        const petCount = parseInt(petCountSelect.value, 10) || 1;

        const bookingPayload = {
            sitterId: checkedRadio.value,
            serviceId: serviceSelect.value,
            startDate: startDateInput.value,
            endDate: endDateInput.value,
            petId: petSelect.value,
            petName: petName,
            petType: petType,
            petCount: petCount,
            notes: notesInput ? notesInput.value : ''
        };

        // 6. Guardar en localStorage a través del módulo PCC_BOOKINGS
        try {
            const confirmedBooking = PCC_BOOKINGS.addBooking(bookingPayload);

            if (!confirmedBooking || !confirmedBooking.code) {
                throw new Error('La reserva no pudo ser generada correctamente.');
            }

            if (window.showToast) {
                window.showToast('¡Reserva solicitada con éxito!', 'success');
            }

            const submitBtn = document.getElementById('btn-confirm-booking');
            if (submitBtn) {
                submitBtn.disabled = true;
                submitBtn.innerHTML = `
                    <span class="material-symbols-outlined">check_circle</span>
                    <span>Reserva confirmada</span>
                `;
            }

            if (window.PCC_CONFIRMATION) {
                PCC_CONFIRMATION.show(confirmedBooking, submitBtn);
            } else {
                window.location.href = 'reservaConfirmada.html';
            }

            setTimeout(() => {
                if (submitBtn) {
                    submitBtn.disabled = false;
                    submitBtn.innerHTML = `
                        <span class="material-symbols-outlined">check_circle</span>
                        <span>Confirmar Reserva</span>
                    `;
                }
            }, 1200);

        } catch (error) {
            console.error('Error al confirmar la reserva:', error);
            showSubmitError('Error al guardar la reserva: ' + (error.message || 'Error de almacenamiento.'));
            const submitBtn = document.getElementById('btn-confirm-booking');
            if (submitBtn) {
                submitBtn.disabled = false;
                submitBtn.innerHTML = `
                    <span class="material-symbols-outlined">check_circle</span>
                    <span>Confirmar Reserva</span>
                `;
            }
        }
    }

    function formatDateISO(d) {
        const year = d.getFullYear();
        const month = String(d.getMonth() + 1).padStart(2, '0');
        const day = String(d.getDate()).padStart(2, '0');
        return `${year}-${month}-${day}`;
    }

    function isValidDateStr(str) {
        if (!str || !/^\d{4}-\d{2}-\d{2}$/.test(str)) return false;
        const d = new Date(str + 'T00:00:00');
        return !isNaN(d.getTime());
    }

    /* ==========================================================================
       Tour Guiado de Onboarding (Fase 6)
       ========================================================================== */
    const TOUR_STEPS = [
        {
            step: 1,
            badge: 'Paso 1 de 3',
            icon: 'person_search',
            title: '1. Elige un cuidador verificado',
            desc: 'Explora las tarjetas de los cuidadores disponibles, revisa sus valoraciones y selecciona el profesional ideal para tu mascota.',
            targetId: 'block-sitter-selection'
        },
        {
            step: 2,
            badge: 'Paso 2 de 3',
            icon: 'calendar_month',
            title: '2. Configura fechas y mascota',
            desc: 'Elige la modalidad de servicio, indica las fechas de inicio y fin, y selecciona cuál de tus mascotas disfrutará de la estancia.',
            targetId: 'block-service-details'
        },
        {
            step: 3,
            badge: 'Paso 3 de 3',
            icon: 'receipt_long',
            title: '3. Revisa y confirma',
            desc: 'Comprueba el cálculo transparente en tiempo real y confirma la reserva con total garantía y cobertura veterinaria incluida.',
            targetId: 'block-summary-confirm'
        }
    ];

    const tourModal = document.getElementById('bookingTourModal');
    const tourStepBadge = document.getElementById('tourStepBadge');
    const tourStepIcon = document.getElementById('tourStepIcon');
    const tourStepTitle = document.getElementById('tourStepTitle');
    const tourStepDesc = document.getElementById('tourStepDesc');
    const btnTourSkip = document.getElementById('btnTourSkip');
    const btnTourPrev = document.getElementById('btnTourPrev');
    const btnTourNext = document.getElementById('btnTourNext');
    const btnCloseTourModal = document.getElementById('btnCloseTourModal');
    const btnOpenBookingTour = document.getElementById('btn-open-booking-tour');

    let currentTourIndex = 0;

    function clearTourHighlights() {
        document.querySelectorAll('.tour-target-highlight').forEach(el => {
            el.classList.remove('tour-target-highlight');
        });
    }

    function renderTourStep(index) {
        if (index < 0 || index >= TOUR_STEPS.length) return;
        currentTourIndex = index;
        const currentData = TOUR_STEPS[index];

        if (tourStepBadge) tourStepBadge.textContent = currentData.badge;
        if (tourStepIcon) tourStepIcon.textContent = currentData.icon;
        if (tourStepTitle) tourStepTitle.textContent = currentData.title;
        if (tourStepDesc) tourStepDesc.textContent = currentData.desc;

        // Actualizar puntos
        for (let i = 1; i <= 3; i++) {
            const dot = document.getElementById(`tourDot${i}`);
            if (dot) {
                if (i === index + 1) {
                    dot.classList.add('active');
                } else {
                    dot.classList.remove('active');
                }
            }
        }

        // Configurar botones
        if (btnTourPrev) {
            btnTourPrev.style.display = index > 0 ? 'inline-flex' : 'none';
        }
        if (btnTourNext) {
            btnTourNext.textContent = index === TOUR_STEPS.length - 1 ? 'Comenzar reserva' : 'Siguiente';
        }

        // Resaltar sección asociada
        clearTourHighlights();
        const targetSection = document.getElementById(currentData.targetId);
        if (targetSection) {
            targetSection.classList.add('tour-target-highlight');
        }
    }

    function openBookingTour(triggerEl = null) {
        if (!tourModal) return;
        renderTourStep(0);
        if (window.PCC_UI) {
            PCC_UI.openModal(tourModal, triggerEl);
        } else {
            tourModal.classList.add('is-open');
            tourModal.setAttribute('aria-hidden', 'false');
        }
    }

    function closeBookingTour(markAsSeen = true) {
        clearTourHighlights();
        if (markAsSeen && window.PCC_BOOKINGS && typeof PCC_BOOKINGS.setTourSeen === 'function') {
            PCC_BOOKINGS.setTourSeen();
        }
        if (tourModal) {
            if (window.PCC_UI) {
                PCC_UI.closeModal(tourModal);
            } else {
                tourModal.classList.remove('is-open');
                tourModal.setAttribute('aria-hidden', 'true');
            }
        }
    }

    if (btnTourNext) {
        btnTourNext.addEventListener('click', () => {
            if (currentTourIndex < TOUR_STEPS.length - 1) {
                renderTourStep(currentTourIndex + 1);
            } else {
                closeBookingTour(true);
                if (window.showToast) {
                    window.showToast('¡Guía completada! Ya puedes configurar tu reserva.', 'success');
                }
            }
        });
    }

    if (btnTourPrev) {
        btnTourPrev.addEventListener('click', () => {
            if (currentTourIndex > 0) {
                renderTourStep(currentTourIndex - 1);
            }
        });
    }

    if (btnTourSkip) {
        btnTourSkip.addEventListener('click', () => {
            closeBookingTour(true);
            if (window.showToast) {
                window.showToast('Guía omitida. Puedes abrirla en cualquier momento desde el encabezado.', 'info');
            }
        });
    }

    if (btnCloseTourModal) {
        btnCloseTourModal.addEventListener('click', () => {
            closeBookingTour(true);
        });
    }

    if (btnOpenBookingTour) {
        btnOpenBookingTour.addEventListener('click', () => {
            openBookingTour(btnOpenBookingTour);
        });
    }

    // Auto-mostrar en la primera visita
    const isTourSeen = window.PCC_BOOKINGS && typeof PCC_BOOKINGS.isTourSeen === 'function' 
        ? PCC_BOOKINGS.isTourSeen() 
        : localStorage.getItem('pcc_booking_tour_seen') === 'true';

    if (!isTourSeen) {
        setTimeout(() => {
            openBookingTour(null);
        }, 400);
    }
});
