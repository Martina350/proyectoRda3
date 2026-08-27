document.addEventListener('DOMContentLoaded', () => {
    const addPetModal = document.getElementById('addPetModal');
    const addPaymentModal = document.getElementById('addPaymentModal');
    const logoutModal = document.getElementById('logoutModal');
    const addPetForm = document.getElementById('addPetForm');
    const addPaymentForm = document.getElementById('addPaymentForm');
    const modalTitle = document.getElementById('addPetModalTitle');
    const submitPetBtn = document.getElementById('btnSubmitPet');

    let editingPetId = null;

    function openModal(modal, trigger = null) {
        if (!modal) return;
        if (window.PCC_UI) {
            PCC_UI.openModal(modal, trigger);
        } else {
            modal.classList.add('is-open');
            modal.setAttribute('aria-hidden', 'false');
        }
    }

    function closeModal(modal) {
        if (!modal) return;
        if (window.PCC_UI) {
            PCC_UI.closeModal(modal);
        } else {
            modal.classList.remove('is-open');
            modal.setAttribute('aria-hidden', 'true');
        }
    }

    function setPetModalMode(isEdit) {
        if (modalTitle) {
            modalTitle.textContent = isEdit ? 'Editar Mascota' : 'Añadir Nueva Mascota';
        }
        if (submitPetBtn) {
            submitPetBtn.textContent = isEdit ? 'Guardar Cambios' : 'Guardar Mascota';
        }
    }

    function fillPetForm(pet) {
        const setVal = (id, value) => {
            const el = document.getElementById(id);
            if (el) el.value = value || '';
        };
        setVal('petNameInput', pet.name);
        setVal('petTypeSelect', pet.type);
        setVal('petBreedInput', pet.breed);
        setVal('petAgeInput', pet.age);
        setVal('petWeightInput', pet.weight);
        setVal('petGenderSelect', pet.gender);
        setVal('petNotesInput', pet.notes);
    }

    function openAddPetModal(trigger = null) {
        if (!addPetForm || !addPetModal) return;
        editingPetId = null;
        addPetForm.reset();
        setPetModalMode(false);
        if (window.PCC_FORMS) {
            PCC_FORMS.clearFormErrors(addPetForm);
        }
        openModal(addPetModal, trigger);
    }

    function openEditPetModal(petId, trigger = null) {
        if (!addPetForm || !addPetModal) return;
        const pet = PCC_AUTH.getPetById(petId);
        if (!pet) return;

        editingPetId = petId;
        addPetForm.reset();
        fillPetForm(pet);
        setPetModalMode(true);
        if (window.PCC_FORMS) {
            PCC_FORMS.clearFormErrors(addPetForm);
        }
        openModal(addPetModal, trigger);
    }

    function closeAddPetModal() {
        editingPetId = null;
        setPetModalMode(false);
        closeModal(addPetModal);
    }

    function openAddPaymentModal(trigger = null) {
        if (!addPaymentForm || !addPaymentModal) return;
        addPaymentForm.reset();
        if (window.PCC_FORMS) {
            PCC_FORMS.clearFormErrors(addPaymentForm);
        }
        openModal(addPaymentModal, trigger);
    }

    function closeAddPaymentModal() {
        closeModal(addPaymentModal);
    }

    function openLogoutModal(trigger = null) {
        openModal(logoutModal, trigger);
    }

    function closeLogoutModal() {
        closeModal(logoutModal);
    }

    function renderUserData() {
        const user = PCC_AUTH.getUser();
        const setText = (id, value) => {
            const el = document.getElementById(id);
            if (el) el.textContent = value;
        };
        const setValue = (id, value) => {
            const el = document.getElementById(id);
            if (el) el.value = value;
        };

        setText('headerUserName', user.name || 'Usuario');
        setText('headerUserEmail', user.email || '');
        setText('headerUserLocation', user.location || 'Quito, Ecuador');
        setText('headerUserMember', `Miembro desde ${user.memberSince || '2026'}`);
        setText('headerUserAvatar', user.avatar || 'US');
        setValue('profileName', user.name || '');
        setValue('profileEmail', user.email || '');
        setValue('profilePhone', user.phone || '');
        setValue('profileLocation', user.location || '');
    }

    function escapeHtml(text) {
        return String(text || '')
            .replace(/&/g, '&amp;')
            .replace(/</g, '&lt;')
            .replace(/>/g, '&gt;')
            .replace(/"/g, '&quot;');
    }

    function renderPets() {
        const pets = PCC_AUTH.getPets();
        const container = document.getElementById('petsGridContainer');
        const countEl = document.getElementById('tabPetsCount');
        if (countEl) countEl.textContent = pets.length;
        if (!container) return;

        let html = '';
        pets.forEach((pet) => {
            const name = escapeHtml(pet.name);
            const type = escapeHtml(pet.type);
            const breed = escapeHtml(pet.breed);
            const age = escapeHtml(pet.age);
            const weight = escapeHtml(pet.weight);
            const gender = escapeHtml(pet.gender);
            const notes = escapeHtml(pet.notes);
            const id = escapeHtml(pet.id);

            html += `
                <article class="pet-card" id="${id}">
                    <div class="pet-card-top">
                        <div class="pet-avatar-icon">
                            <span class="material-symbols-outlined">pets</span>
                        </div>
                        <div class="pet-card-title">
                            <h3>${name}</h3>
                            <p>${type} · ${breed}</p>
                        </div>
                    </div>
                    <div class="pet-specs-list">
                        <span class="pet-spec-pill">${age}</span>
                        <span class="pet-spec-pill">${weight}</span>
                        <span class="pet-spec-pill">${gender}</span>
                    </div>
                    <div class="pet-notes-box">
                        <span class="pet-notes-label">Notas de cuidado</span>
                        <p class="pet-notes-text">${notes}</p>
                    </div>
                    <div class="pet-card-actions">
                        <button type="button" class="pet-btn-edit" data-pet-id="${id}">
                            <span class="material-symbols-outlined">edit</span>
                            Editar
                        </button>
                        <button type="button" class="pet-btn-delete" data-pet-id="${id}" data-pet-name="${name}">
                            <span class="material-symbols-outlined">delete</span>
                            Eliminar
                        </button>
                    </div>
                </article>
            `;
        });

        container.innerHTML = html;
    }

    function detectCardBrand(digits) {
        if (/^4/.test(digits)) return 'Visa';
        if (/^5[1-5]/.test(digits) || /^2(2[2-9]|[3-6]|7[01]|720)/.test(digits)) return 'Mastercard';
        if (/^3[47]/.test(digits)) return 'American Express';
        if (/^3(0[0-5]|[68])/.test(digits)) return 'Diners';
        return '';
    }

    function formatCardNumberInput(raw) {
        const digits = String(raw || '').replace(/\D/g, '').slice(0, 19);
        return digits.replace(/(\d{4})(?=\d)/g, '$1 ').trim();
    }

    function formatExpiryInput(raw) {
        const digits = String(raw || '').replace(/\D/g, '').slice(0, 6);
        if (digits.length <= 2) return digits;
        return digits.slice(0, 2) + '/' + digits.slice(2);
    }

    function renderPayments() {
        const payments = PCC_AUTH.getPayments();
        const container = document.getElementById('paymentMethodsList');
        if (!container) return;

        if (!payments.length) {
            container.innerHTML = '<p class="payment-empty">Aún no tienes métodos de pago guardados.</p>';
            return;
        }

        container.innerHTML = payments.map((pay) => {
            const id = escapeHtml(pay.id);
            const brand = escapeHtml(pay.brand);
            const last4 = escapeHtml(pay.last4);
            const expiry = escapeHtml(pay.expiry);
            const cardType = escapeHtml(pay.cardType);
            const actions = pay.isDefault
                ? '<span class="badge badge-success">Predeterminada</span>'
                : `<button type="button" class="button button-outline button-sm btn-set-default-payment" data-payment-id="${id}">Establecer principal</button>`;

            return `
                <div class="payment-card-item" data-payment-id="${id}">
                    <div class="payment-card-left">
                        <span class="material-symbols-outlined">credit_card</span>
                        <div class="payment-card-details">
                            <strong>${brand} terminada en •••• ${last4}</strong>
                            <span>Caduca: ${expiry} · ${cardType}</span>
                        </div>
                    </div>
                    <div class="payment-card-actions">
                        ${actions}
                        <button type="button" class="pet-btn-delete btn-delete-payment" data-payment-id="${id}" data-payment-label="${brand} •••• ${last4}" aria-label="Eliminar tarjeta">
                            <span class="material-symbols-outlined">delete</span>
                        </button>
                    </div>
                </div>
            `;
        }).join('');
    }

    function collectPetFormData() {
        const nameInput = document.getElementById('petNameInput');
        return {
            name: nameInput && window.PCC_FORMS
                ? PCC_FORMS.normalizeName(nameInput.value)
                : (nameInput ? nameInput.value.trim() : ''),
            type: document.getElementById('petTypeSelect').value,
            breed: document.getElementById('petBreedInput').value.trim(),
            age: document.getElementById('petAgeInput').value.trim(),
            weight: document.getElementById('petWeightInput').value.trim(),
            gender: document.getElementById('petGenderSelect').value,
            notes: document.getElementById('petNotesInput').value.trim()
        };
    }

    renderUserData();
    renderPets();
    renderPayments();

    document.querySelectorAll('.account-tab-btn').forEach((btn) => {
        btn.addEventListener('click', () => {
            document.querySelectorAll('.account-tab-btn').forEach((b) => b.classList.remove('active'));
            document.querySelectorAll('.account-tab-pane').forEach((p) => p.classList.remove('active'));
            btn.classList.add('active');
            const pane = document.getElementById(btn.getAttribute('data-tab'));
            if (pane) pane.classList.add('active');
        });
    });

    document.addEventListener('click', (e) => {
        const addBtn = e.target.closest('#btnOpenAddPetModal');
        if (addBtn) {
            e.preventDefault();
            openAddPetModal(addBtn);
            return;
        }
        if (e.target.closest('#btnCloseAddPetModal, #btnCancelAddPet')) {
            closeAddPetModal();
            return;
        }

        const addPayBtn = e.target.closest('#btnOpenAddPaymentModal');
        if (addPayBtn) {
            e.preventDefault();
            openAddPaymentModal(addPayBtn);
            return;
        }
        if (e.target.closest('#btnCloseAddPaymentModal, #btnCancelAddPayment')) {
            closeAddPaymentModal();
            return;
        }

        const setDefaultBtn = e.target.closest('.btn-set-default-payment');
        if (setDefaultBtn) {
            PCC_AUTH.setDefaultPayment(setDefaultBtn.getAttribute('data-payment-id'));
            renderPayments();
            if (window.showToast) {
                window.showToast('Tarjeta establecida como predeterminada', 'success');
            }
            return;
        }

        const deletePayBtn = e.target.closest('.btn-delete-payment');
        if (deletePayBtn) {
            const label = deletePayBtn.getAttribute('data-payment-label') || 'La tarjeta';
            PCC_AUTH.deletePayment(deletePayBtn.getAttribute('data-payment-id'));
            renderPayments();
            if (window.showToast) {
                window.showToast(`${label} se eliminó de tus métodos de pago`, 'info');
            }
            return;
        }

        const logoutBtn = e.target.closest('#btnOpenLogoutModal, #btnDangerLogout');
        if (logoutBtn) {
            e.preventDefault();
            openLogoutModal(logoutBtn);
            return;
        }
        if (e.target.closest('#btnCloseLogoutModal, #btnCancelLogout')) {
            closeLogoutModal();
            return;
        }
        if (e.target.closest('#btnConfirmLogout')) {
            const confirmBtn = document.getElementById('btnConfirmLogout');
            if (confirmBtn) {
                confirmBtn.classList.add('is-loading');
                confirmBtn.textContent = 'Cerrando...';
            }
            PCC_AUTH.logout();
            if (window.showToast) {
                window.showToast('Has cerrado sesión. Puedes iniciar sesión o registrarte.', 'info');
            }
            setTimeout(() => {
                window.location.href = 'login.html';
            }, 400);
            return;
        }

        const editBtn = e.target.closest('.pet-btn-edit');
        if (editBtn) {
            openEditPetModal(editBtn.getAttribute('data-pet-id'), editBtn);
            return;
        }

        const deleteBtn = e.target.closest('.pet-btn-delete');
        if (deleteBtn) {
            const id = deleteBtn.getAttribute('data-pet-id');
            const name = deleteBtn.getAttribute('data-pet-name');
            PCC_AUTH.deletePet(id);
            renderPets();
            if (window.showToast) {
                window.showToast(`${name} ha sido eliminado de tus mascotas`, 'info');
            }
        }
    });

    if (addPetForm && window.PCC_FORMS) {
        PCC_FORMS.setupForm(addPetForm, () => {
            const petData = collectPetFormData();

            if (editingPetId) {
                const updated = PCC_AUTH.updatePet(editingPetId, petData);
                closeAddPetModal();
                renderPets();
                if (updated && window.showToast) {
                    window.showToast(`Los datos de ${updated.name} se actualizaron correctamente`, 'success');
                }
                return;
            }

            const newPet = PCC_AUTH.addPet(petData);
            closeAddPetModal();
            renderPets();
            if (window.showToast) {
                window.showToast(`¡${newPet.name} ha sido añadido a tu lista de mascotas!`, 'success');
            }
        });
    }

    if (addPaymentForm && window.PCC_FORMS) {
        const numberInput = document.getElementById('payNumberInput');
        const expiryInput = document.getElementById('payExpiryInput');
        const brandSelect = document.getElementById('payBrandSelect');

        if (numberInput) {
            numberInput.addEventListener('input', () => {
                numberInput.value = formatCardNumberInput(numberInput.value);
                const digits = numberInput.value.replace(/\s+/g, '');
                const brand = detectCardBrand(digits);
                if (brand && brandSelect && !brandSelect.value) {
                    brandSelect.value = brand;
                } else if (brand && brandSelect) {
                    brandSelect.value = brand;
                }
            });
        }

        if (expiryInput) {
            expiryInput.addEventListener('input', () => {
                expiryInput.value = formatExpiryInput(expiryInput.value);
            });
        }

        PCC_FORMS.setupForm(addPaymentForm, () => {
            const digits = (numberInput ? numberInput.value : '').replace(/\s+/g, '');
            const newPayment = PCC_AUTH.addPayment({
                holder: document.getElementById('payHolderInput').value.trim(),
                brand: brandSelect ? brandSelect.value : 'Otra',
                last4: digits.slice(-4),
                expiry: expiryInput ? expiryInput.value.trim() : '',
                cardType: document.getElementById('payTypeSelect').value,
                isDefault: Boolean(document.getElementById('payDefaultCheck')?.checked)
            });

            closeAddPaymentModal();
            renderPayments();
            if (window.showToast) {
                window.showToast(`${newPayment.brand} •••• ${newPayment.last4} añadida correctamente`, 'success');
            }
        });
    }

    const profileForm = document.getElementById('userDataForm');
    if (profileForm && window.PCC_FORMS) {
        PCC_FORMS.setupForm(profileForm, () => {
            const saveBtn = document.getElementById('btnSaveProfile');
            if (saveBtn) saveBtn.classList.add('is-loading');

            setTimeout(() => {
                if (saveBtn) saveBtn.classList.remove('is-loading');
                PCC_AUTH.updateUser({
                    name: PCC_FORMS.normalizeName(document.getElementById('profileName').value),
                    email: PCC_FORMS.normalizeEmail(document.getElementById('profileEmail').value),
                    phone: PCC_FORMS.normalizePhone(document.getElementById('profilePhone').value),
                    location: document.getElementById('profileLocation').value.trim()
                });
                renderUserData();
                if (window.showToast) {
                    window.showToast('Información personal guardada con éxito', 'success');
                }
            }, 400);
        });
    }

    const passForm = document.getElementById('changePasswordForm');
    if (passForm && window.PCC_FORMS) {
        PCC_FORMS.setupForm(passForm, () => {
            const btn = document.getElementById('btnUpdatePass');
            if (btn) {
                btn.classList.add('is-loading');
                btn.textContent = 'Actualizando...';
            }
            setTimeout(() => {
                if (btn) {
                    btn.classList.remove('is-loading');
                    btn.textContent = 'Actualizar Contraseña';
                }
                passForm.reset();
                if (window.showToast) {
                    window.showToast('Contraseña actualizada correctamente', 'success');
                }
            }, 500);
        });
    }
});
