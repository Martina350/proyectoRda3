document.addEventListener('DOMContentLoaded', () => {
    let lastBooking = null;

    try {
        const raw = localStorage.getItem('pcc_last_booking') || localStorage.getItem('pcc_last_reservation');
        if (raw) lastBooking = JSON.parse(raw);
    } catch (e) {
        console.error('Error al leer la última reserva:', e);
    }

    if (!lastBooking) {
        if (window.PCC_BOOKINGS && typeof PCC_BOOKINGS.getLast === 'function') {
            lastBooking = PCC_BOOKINGS.getLast();
        }
    }

    if (!lastBooking || !(lastBooking.code || lastBooking.id)) {
        if (window.showToast) {
            window.showToast('No hay una reserva reciente para mostrar.', 'info');
        }
        return;
    }

    if (window.PCC_CONFIRMATION) {
        PCC_CONFIRMATION.show(lastBooking);
        if (window.showToast) {
            window.showToast('¡Tu reserva ha sido confirmada con éxito!', 'success', 4000);
        }
    }
});
