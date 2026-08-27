document.addEventListener('DOMContentLoaded', () => {
    const form = document.getElementById('reservationForm');
    const sitterRadios = document.querySelectorAll('input[name="selected_sitter"]');
    const serviceSelect = document.getElementById('booking-service');
    const petsCountSelect = document.getElementById('booking-pets-count');
    const dateStartInput = document.getElementById('booking-date-start');
    const dateEndInput = document.getElementById('booking-date-end');
    const petSelect = document.getElementById('booking-pet-select');
    const customPetGroup = document.getElementById('customPetGroup');
    const customPetInput = document.getElementById('booking-custom-pet');
    const specialInstructions = document.getElementById('booking-special-instructions');
    const charCounter = document.getElementById('charCounter');
    const policyCheckbox = document.getElementById('booking-accept-policy');
    const submitBtn = document.getElementById('btnSubmitBooking');

    const dateStartError = document.getElementById('date-start-error');
    const dateEndError = document.getElementById('date-end-error');
    const policyError = document.getElementById('policy-error');

    const sumSitterName = document.getElementById('sum-sitter-name');
    const sumSitterSpec = document.getElementById('sum-sitter-specialty');
    const sumSitterRating = document.getElementById('sum-sitter-rating');
    const sumServiceName = document.getElementById('sum-service-name');
    const sumPetName = document.getElementById('sum-pet-name');
    const sumDatesRange = document.getElementById('sum-dates-range');
    const sumDurationDays = document.getElementById('sum-duration-days');
    const sumRateCalc = document.getElementById('sum-rate-calc');
    const sumSubtotalVal = document.getElementById('sum-subtotal-val');
    const sumTotalVal = document.getElementById('sum-total-val');

    const onboardingBanner = document.getElementById('onboardingBanner');
    const btnDismissOnboarding = document.getElementById('btnDismissOnboarding');

    if (!form) return;

    if (btnDismissOnboarding && onboardingBanner) {
        btnDismissOnboarding.addEventListener('click', () => {
            onboardingBanner.style.opacity = '0';
            onboardingBanner.style.transform = 'translateY(-10px)';
            onboardingBanner.style.transition = 'all 0.25s ease';
            setTimeout(() => onboardingBanner.remove(), 250);
            localStorage.setItem('pcc_onboarding_dismissed', 'true');
        });

        if (localStorage.getItem('pcc_onboarding_dismissed') === 'true') {
            onboardingBanner.style.display = 'none';
        }
    }

    if (window.PCC_AUTH && petSelect) {
        const userPets = PCC_AUTH.getPets();
        if (userPets && userPets.length > 0) {
            petSelect.innerHTML = userPets.map((p) =>
                `<option value="${p.name} (${p.type} - ${p.breed})">${p.name} (${p.type} - ${p.breed})</option>`
            ).join('') + '<option value="otro">+ Ingresar otra mascota</option>';
        }
    }

    const today = new Date();
    const tomorrow = new Date(today);
    tomorrow.setDate(tomorrow.getDate() + 1);
    const inThreeDays = new Date(tomorrow);
    inThreeDays.setDate(inThreeDays.getDate() + 3);

    const formatDate = (d) => d.toISOString().split('T')[0];
    const formatDisplayDate = (dateStr) => {
        if (!dateStr) return '';
        const parts = dateStr.split('-');
        if (parts.length !== 3) return dateStr;
        const months = ['Ene', 'Feb', 'Mar', 'Abr', 'May', 'Jun', 'Jul', 'Ago', 'Sep', 'Oct', 'Nov', 'Dic'];
        return `${parseInt(parts[2], 10)} ${months[parseInt(parts[1], 10) - 1]}, ${parts[0]}`;
    };

    if (dateStartInput && dateEndInput) {
        dateStartInput.min = formatDate(today);
        dateStartInput.value = formatDate(tomorrow);
        dateEndInput.min = formatDate(tomorrow);
        dateEndInput.value = formatDate(inThreeDays);
    }

    const urlParams = new URLSearchParams(window.location.search);
    const preSitter = urlParams.get('sitter');
    const preService = urlParams.get('service');

    if (preSitter) {
        sitterRadios.forEach((radio) => {
            if (radio.value.toLowerCase().includes(preSitter.toLowerCase())) {
                radio.checked = true;
            }
        });
    }

    if (preService && serviceSelect) {
        for (let i = 0; i < serviceSelect.options.length; i++) {
            const option = serviceSelect.options[i];
            if (
                option.value.toLowerCase().includes(preService.toLowerCase()) ||
                option.text.toLowerCase().includes(preService.toLowerCase())
            ) {
                serviceSelect.selectedIndex = i;
                break;
            }
        }
    }

    if (specialInstructions && charCounter) {
        specialInstructions.addEventListener('input', () => {
            charCounter.textContent = `${specialInstructions.value.length} / 400`;
        });
    }

    if (petSelect) {
        petSelect.addEventListener('change', () => {
            if (petSelect.value === 'otro') {
                if (customPetGroup) customPetGroup.style.display = 'block';
                if (customPetInput) {
                    customPetInput.required = true;
                    customPetInput.focus();
                }
            } else {
                if (customPetGroup) customPetGroup.style.display = 'none';
                if (customPetInput) customPetInput.required = false;
            }
            updateSummary();
        });
    }

    function updateSummary() {
        let activeRadio = document.querySelector('input[name="selected_sitter"]:checked');
        if (!activeRadio && sitterRadios.length > 0) {
            sitterRadios[0].checked = true;
            activeRadio = sitterRadios[0];
        }

        document.querySelectorAll('.sitter-select-card').forEach((card) => {
            card.classList.remove('is-selected');
        });

        if (!activeRadio) return false;

        const parentCard = activeRadio.closest('.sitter-select-card');
        if (parentCard) parentCard.classList.add('is-selected');

        const sitterName = activeRadio.value;
        const priceBase = parseFloat(activeRadio.dataset.price) || 25;
        const rating = activeRadio.dataset.rating || '4.9';
        const reviews = activeRadio.dataset.reviews || '40';
        const specialty = activeRadio.dataset.specialty || 'Cuidado profesional certificado';

        if (sumSitterName) sumSitterName.textContent = sitterName;
        if (sumSitterSpec) sumSitterSpec.textContent = specialty;
        if (sumSitterRating) sumSitterRating.textContent = `${rating} (${reviews} reseñas)`;

        const serviceValue = serviceSelect ? serviceSelect.value : '';
        if (sumServiceName) sumServiceName.textContent = serviceValue;

        const petsCount = petsCountSelect ? parseInt(petsCountSelect.value, 10) || 1 : 1;
        const petNameVal = petSelect && petSelect.value === 'otro'
            ? ((customPetInput && customPetInput.value.trim()) || 'Nueva mascota')
            : (petSelect && petSelect.options[petSelect.selectedIndex]
                ? petSelect.options[petSelect.selectedIndex].text
                : 'Mascota');
        if (sumPetName) sumPetName.textContent = petNameVal;

        const d1 = new Date(dateStartInput.value);
        const d2 = new Date(dateEndInput.value);
        let nights = 0;

        if (!isNaN(d1.getTime()) && !isNaN(d2.getTime())) {
            const diffTime = d2.getTime() - d1.getTime();
            nights = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
        }

        const fee = 5;

        if (nights <= 0) {
            if (sumDatesRange) sumDatesRange.textContent = 'Fechas inválidas';
            if (sumDurationDays) sumDurationDays.textContent = '0 noches';
            if (sumRateCalc) sumRateCalc.textContent = `Tarifa base ($${priceBase}/noche):`;
            if (sumSubtotalVal) sumSubtotalVal.textContent = '$0';
            if (sumTotalVal) sumTotalVal.textContent = '$0';
            return false;
        }

        if (sumDatesRange) {
            sumDatesRange.textContent = `${formatDisplayDate(dateStartInput.value)} - ${formatDisplayDate(dateEndInput.value)}`;
        }
        if (sumDurationDays) {
            sumDurationDays.textContent = `${nights} ${nights === 1 ? 'noche / día' : 'noches / días'}`;
        }

        const petMultiplier = petsCount === 1 ? 1 : (petsCount === 2 ? 1.5 : 2.0);
        const subtotal = Math.round(priceBase * nights * petMultiplier);
        const total = subtotal + fee;

        if (sumRateCalc) {
            sumRateCalc.textContent = `$${priceBase} x ${nights} ${nights === 1 ? 'noche' : 'noches'}${petsCount > 1 ? ' (' + petsCount + ' mascotas)' : ''}:`;
        }
        if (sumSubtotalVal) sumSubtotalVal.textContent = `$${subtotal}`;
        if (sumTotalVal) sumTotalVal.textContent = `$${total}`;

        return true;
    }

    function validateDates() {
        let valid = true;
        const d1 = new Date(dateStartInput.value);
        const d2 = new Date(dateEndInput.value);
        const now = new Date();
        now.setHours(0, 0, 0, 0);

        if (!dateStartInput.value || isNaN(d1.getTime()) || d1 < now) {
            dateStartInput.classList.add('is-invalid');
            dateStartInput.setAttribute('aria-invalid', 'true');
            if (dateStartError) dateStartError.classList.add('is-visible');
            valid = false;
        } else {
            dateStartInput.classList.remove('is-invalid');
            dateStartInput.setAttribute('aria-invalid', 'false');
            if (dateStartError) dateStartError.classList.remove('is-visible');
        }

        if (!dateEndInput.value || isNaN(d2.getTime()) || d2 <= d1) {
            dateEndInput.classList.add('is-invalid');
            dateEndInput.setAttribute('aria-invalid', 'true');
            if (dateEndError) dateEndError.classList.add('is-visible');
            valid = false;
        } else {
            dateEndInput.classList.remove('is-invalid');
            dateEndInput.setAttribute('aria-invalid', 'false');
            if (dateEndError) dateEndError.classList.remove('is-visible');
        }

        return valid;
    }

    function validatePolicy() {
        if (!policyCheckbox.checked) {
            if (policyError) policyError.classList.add('is-visible');
            policyCheckbox.setAttribute('aria-invalid', 'true');
            return false;
        }
        if (policyError) policyError.classList.remove('is-visible');
        policyCheckbox.setAttribute('aria-invalid', 'false');
        return true;
    }

    sitterRadios.forEach((radio) => radio.addEventListener('change', updateSummary));
    if (serviceSelect) serviceSelect.addEventListener('change', updateSummary);
    if (petsCountSelect) petsCountSelect.addEventListener('change', updateSummary);

    if (dateStartInput) {
        dateStartInput.addEventListener('change', () => {
            dateEndInput.min = dateStartInput.value;
            validateDates();
            updateSummary();
        });
    }

    if (dateEndInput) {
        dateEndInput.addEventListener('change', () => {
            validateDates();
            updateSummary();
        });
    }

    if (customPetInput) customPetInput.addEventListener('input', updateSummary);
    if (policyCheckbox) policyCheckbox.addEventListener('change', validatePolicy);

    updateSummary();

    form.addEventListener('submit', (e) => {
        e.preventDefault();

        const areDatesValid = validateDates();
        const isPolicyValid = validatePolicy();

        if (!areDatesValid) {
            if (dateStartInput.classList.contains('is-invalid')) dateStartInput.focus();
            else dateEndInput.focus();
            if (window.showToast) {
                window.showToast('Por favor, revisa el rango de fechas seleccionado', 'error');
            }
            return;
        }

        if (petSelect && petSelect.value === 'otro' && customPetInput && !customPetInput.value.trim()) {
            customPetInput.focus();
            customPetInput.classList.add('is-invalid');
            if (window.showToast) {
                window.showToast('Introduce el nombre de la mascota', 'error');
            }
            return;
        }

        if (!isPolicyValid) {
            policyCheckbox.focus();
            if (window.showToast) {
                window.showToast('Debes aceptar las políticas del servicio para continuar', 'error');
            }
            return;
        }

        if (submitBtn) {
            submitBtn.classList.add('is-loading');
            submitBtn.disabled = true;
            submitBtn.innerHTML = `
                <span class="btn-spinner"></span>
                <span>Procesando tu reserva...</span>
            `;
        }

        const activeRadio = document.querySelector('input[name="selected_sitter"]:checked');
        const sitterName = activeRadio ? activeRadio.value : 'Elena Martínez';
        const serviceName = serviceSelect.value;
        const petName = petSelect.value === 'otro'
            ? customPetInput.value.trim()
            : petSelect.options[petSelect.selectedIndex].text;
        const dateStart = dateStartInput.value;
        const dateEnd = dateEndInput.value;
        const datesDisplay = `${formatDisplayDate(dateStart)} - ${formatDisplayDate(dateEnd)}`;
        const totalText = sumTotalVal ? sumTotalVal.textContent : '$0';
        const bookingCode = '#PCC-2026-' + Math.floor(100 + Math.random() * 900);

        const newBooking = {
            id: 'booking-' + Date.now(),
            code: bookingCode,
            sitter: sitterName,
            service: serviceName,
            pet: petName,
            dateStart: dateStart,
            dateEnd: dateEnd,
            datesDisplay: datesDisplay,
            total: totalText,
            status: 'Activa',
            statusDetail: 'Confirmada y programada',
            instructions: specialInstructions ? (specialInstructions.value.trim() || 'Sin observaciones adicionales.') : 'Sin observaciones adicionales.',
            createdAt: new Date().toISOString()
        };

        try {
            let existingBookings = [];
            const saved = localStorage.getItem('pcc_reservas');
            if (saved) existingBookings = JSON.parse(saved);
            existingBookings.unshift(newBooking);
            localStorage.setItem('pcc_reservas', JSON.stringify(existingBookings));
            localStorage.setItem('pcc_last_reservation', JSON.stringify(newBooking));
        } catch (err) {
            console.error('Error guardando reserva en localStorage:', err);
        }

        setTimeout(() => {
            if (window.showToast) {
                window.showToast(`¡Reserva con ${sitterName} confirmada con éxito!`, 'success');
            }

            if (window.PCC_CONFIRMATION) {
                PCC_CONFIRMATION.show(newBooking, submitBtn);
                if (submitBtn) {
                    submitBtn.classList.remove('is-loading');
                    submitBtn.disabled = false;
                    submitBtn.innerHTML = `
                        <span class="btn-text">Confirmar y Solicitar Reserva</span>
                        <span class="material-symbols-outlined btn-icon" aria-hidden="true">arrow_forward</span>
                    `;
                }
            } else {
                const redirectUrl = `reservaConfirmada.html?code=${encodeURIComponent(bookingCode)}&sitter=${encodeURIComponent(sitterName)}&service=${encodeURIComponent(serviceName)}&dates=${encodeURIComponent(datesDisplay)}&pet=${encodeURIComponent(petName)}&total=${encodeURIComponent(totalText)}`;
                window.location.href = redirectUrl;
            }
        }, 500);
    });
});
