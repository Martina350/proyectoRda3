document.addEventListener('DOMContentLoaded', () => {
    const checkInInput = document.getElementById('check-in');
    const checkOutInput = document.getElementById('check-out');
    const petSelect = document.getElementById('pet-quantity');
    const submitBtn = document.querySelector('.booking-submit-btn');
    const costBreakdown = document.querySelector('.booking-cost-breakdown');

    const pricePerNight = 25;
    const fee = 5;

    if (window.PCC_AUTH && petSelect) {
        const userPets = PCC_AUTH.getPets();
        if (userPets && userPets.length > 0) {
            petSelect.innerHTML = userPets.map((p, idx) =>
                `<option value="${idx + 1}">${p.name} (${p.breed || p.type})</option>`
            ).join('') + '<option value="2">2 Mascotas</option>';
        }
    }

    function updatePrice() {
        if (!checkInInput || !checkOutInput || !petSelect || !costBreakdown || !submitBtn) return;

        const d1 = new Date(checkInInput.value + 'T00:00:00');
        const d2 = new Date(checkOutInput.value + 'T00:00:00');

        if (isNaN(d1.getTime()) || isNaN(d2.getTime())) return;

        const timeDiff = d2.getTime() - d1.getTime();
        const nights = Math.ceil(timeDiff / (1000 * 3600 * 24));
        const petsCount = parseInt(petSelect.value, 10) || 1;

        if (nights <= 0) {
            costBreakdown.innerHTML = `
                <div class="cost-row cost-row-error">
                    <span>La fecha de salida debe ser posterior a la de entrada.</span>
                </div>
            `;
            submitBtn.disabled = true;
            submitBtn.style.opacity = '0.5';
            submitBtn.style.cursor = 'not-allowed';
            return;
        }

        submitBtn.disabled = false;
        submitBtn.style.opacity = '1';
        submitBtn.style.cursor = 'pointer';

        const subtotal = pricePerNight * nights * petsCount;
        const total = subtotal + fee;

        costBreakdown.innerHTML = `
            <div class="cost-row">
                <span>$${pricePerNight} x ${nights} noche${nights > 1 ? 's' : ''}${petsCount > 1 ? ' (' + petsCount + ' mascotas)' : ''}: $${subtotal}</span>
            </div>
            <div class="cost-row">
                <span>Gastos de gestión: $${fee}</span>
            </div>
            <div class="cost-row cost-total">
                <span>Total: $${total}</span>
            </div>
        `;
    }

    if (checkInInput && checkOutInput && petSelect) {
        checkInInput.addEventListener('change', updatePrice);
        checkOutInput.addEventListener('change', updatePrice);
        petSelect.addEventListener('change', updatePrice);
        updatePrice();
    }

    const galleryBtns = document.querySelectorAll('.btn-view-gallery');
    const showGalleryFeedback = () => {
        if (window.showToast) {
            window.showToast('Galería con 11 fotos del hogar e instalaciones de Lucía.', 'info');
        }
    };

    galleryBtns.forEach((btn) => {
        btn.addEventListener('click', (e) => {
            e.preventDefault();
            showGalleryFeedback();
        });

        if (window.PCC_UI && btn.getAttribute('role') === 'button') {
            PCC_UI.makeKeyboardAccessible(btn, () => showGalleryFeedback());
        }
    });
});
