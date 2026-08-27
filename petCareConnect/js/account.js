document.addEventListener('DOMContentLoaded', () => {
    const addPetModal = document.getElementById('addPetModal');
    const logoutModal = document.getElementById('logoutModal');
    const addPetForm = document.getElementById('addPetForm');
    const petNameInput = document.getElementById('petNameInput');
    const petNameError = document.getElementById('petNameError');

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

    function openAddPetModal(trigger = null) {
        if (!addPetForm || !addPetModal) return;
        addPetForm.reset();
        if (window.PCC_FORMS) {
            PCC_FORMS.clearFormErrors(addPetForm);
        }
        openModal(addPetModal, trigger);
    }

    function closeAddPetModal() {
        closeModal(addPetModal);
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

    function renderPets() {
        const pets = PCC_AUTH.getPets();
        const container = document.getElementById('petsGridContainer');
        const countEl = document.getElementById('tabPetsCount');
        if (countEl) countEl.textContent = pets.length;
        if (!container) return;

        let html = '';
        pets.forEach((pet) => {
            html += `
                <article class="pet-card" id="${pet.id}">
                    <div class="pet-card-top">
                        <div class="pet-avatar-icon">
                            <span class="material-symbols-outlined">pets</span>
                        </div>
                        <div class="pet-card-title">
                            <h3>${pet.name}</h3>
                            <p>${pet.type} · ${pet.breed}</p>
                        </div>
                    </div>
                    <div class="pet-specs-list">
                        <span class="pet-spec-pill">${pet.age}</span>
                        <span class="pet-spec-pill">${pet.weight}</span>
                        <span class="pet-spec-pill">${pet.gender}</span>
                    </div>
                    <div class="pet-notes-box">
                        <strong>Notas de cuidado:</strong><br>
                        ${pet.notes}
                    </div>
                    <div class="pet-card-actions">
                        <button type="button" class="pet-btn-delete" data-pet-id="${pet.id}" data-pet-name="${pet.name}">
                            <span class="material-symbols-outlined">delete</span>
                            Eliminar
                        </button>
                    </div>
                </article>
            `;
        });

        container.innerHTML = html;
    }

    renderUserData();
    renderPets();

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
            const nameInput = document.getElementById('petNameInput');
            const name = nameInput ? PCC_FORMS.normalizeName(nameInput.value) : '';

            const newPet = PCC_AUTH.addPet({
                name,
                type: document.getElementById('petTypeSelect').value,
                breed: document.getElementById('petBreedInput').value || 'Mestizo',
                age: document.getElementById('petAgeInput').value || '1 año',
                weight: document.getElementById('petWeightInput').value || '10 kg',
                gender: document.getElementById('petGenderSelect').value,
                notes: document.getElementById('petNotesInput').value || 'Sin observaciones especiales.'
            });

            closeAddPetModal();
            renderPets();
            if (window.showToast) {
                window.showToast(`¡${newPet.name} ha sido añadido a tu lista de mascotas!`, 'success');
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
