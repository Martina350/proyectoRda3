/**
 * Pet CareConnect - Lógica de Confirmación de Reserva (reservaConfirmada.js)
 * Lee PCC_BOOKINGS.getLast() y renderiza los datos reales de la reserva.
 * Si no hay última reserva guardada en localStorage, muestra el estado vacío sin fingir éxito.
 */

document.addEventListener('DOMContentLoaded', () => {
    const successView = document.getElementById('confirmation-success-view');
    const emptyView = document.getElementById('confirmation-empty-view');

    const codeElem = document.getElementById('confirm-code');
    const sitterElem = document.getElementById('confirm-sitter');
    const serviceElem = document.getElementById('confirm-service');
    const datesElem = document.getElementById('confirm-dates-str');
    const petElem = document.getElementById('confirm-pet-str');
    const totalElem = document.getElementById('confirm-total-str');

    if (!successView || !emptyView) return;

    // Obtener la última reserva directamente del almacenamiento
    let lastBooking = null;
    try {
        const raw = localStorage.getItem('pcc_last_booking');
        if (raw) {
            lastBooking = JSON.parse(raw);
        }
    } catch (e) {
        console.error('Error al leer pcc_last_booking:', e);
    }

    // Si no hay ninguna última reserva guardada, mostrar estado vacío
    if (!lastBooking || !lastBooking.code) {
        successView.style.display = 'none';
        emptyView.style.display = 'block';
        return;
    }

    // Renderizar datos reales de la reserva
    if (codeElem) codeElem.textContent = lastBooking.code || `#PCC-2026-${Date.now().toString().slice(-3)}`;
    if (sitterElem) sitterElem.textContent = lastBooking.sitterName || 'Cuidador verificado';
    if (serviceElem) serviceElem.textContent = lastBooking.serviceName || 'Servicio de cuidado';
    if (datesElem) datesElem.textContent = lastBooking.dateFormatted || `${lastBooking.startDate} - ${lastBooking.endDate}`;
    
    if (petElem) {
        const pCount = lastBooking.petCount || 1;
        const pName = lastBooking.petName || 'Mascota';
        const pType = lastBooking.petType ? ` (${lastBooking.petType})` : '';
        petElem.textContent = pCount > 1 
            ? `${pCount} Mascotas ("${pName}" y acompañantes)`
            : `1 Mascota ("${pName}"${pType})`;
    }

    if (totalElem) {
        const totalAmount = Number(lastBooking.total);
        totalElem.textContent = isNaN(totalAmount) ? `$${lastBooking.total}` : `$${totalAmount.toFixed(2)}`;
    }

    // Mostrar vista de éxito
    emptyView.style.display = 'none';
    successView.style.display = 'block';

    // Toast de éxito al cargar
    if (window.showToast) {
        window.showToast('¡Tu reserva ha sido confirmada con éxito!', 'success', 5000);
    }
});
