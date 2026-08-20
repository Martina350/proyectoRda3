document.addEventListener('DOMContentLoaded', () => {
    const addPetModal = document.getElementById('addPetModal');
    const logoutModal = document.getElementById('logoutModal');
    const addPetForm = document.getElementById('addPetForm');
    const petNameInput = document.getElementById('petNameInput');
    const petNameError = document.getElementById('petNameError');

    function openModal(modal) {
        if (!modal) return;
        modal.classList.add('is-open', 'is-active');
        modal.setAttribute('aria-hidden', 'false');
    }

    function closeModal(modal) {
        if (!modal) return;
        modal.classList.remove('is-open', 'is-active');
        modal.setAttribute('aria-hidden', 'true');
    }

    function openAddPetModal() {
        if (!addPetForm || !addPetModal) return;
        addPetForm.reset();
        if (petNameError) petNameError.classList.remove('is-visible');
        if (petNameInput) {
            petNameInput.classList.remove('is-invalid');
            petNameInput.focus();
        }
        openModal(addPetModal);
    }

    function closeAddPetModal() {
        closeModal(addPetModal);
    }

    function openLogoutModal() {
        openModal(logoutModal);
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
                            <span class="material-symbols-outlined" style="font-size: 16px;">delete</span>
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
        if (e.target.closest('#btnOpenAddPetModal')) {
            e.preventDefault();
            openAddPetModal();
            return;
        }
        if (e.target.closest('#btnCloseAddPetModal, #btnCancelAddPet')) {
            closeAddPetModal();
            return;
        }
        if (e.target.closest('#btnOpenLogoutModal, #btnDangerLogout')) {
            e.preventDefault();
            openLogoutModal();
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

    document.addEventListener('keydown', (e) => {
        if (e.key === 'Escape') {
            closeAddPetModal();
            closeLogoutModal();
        }
    });

    [addPetModal, logoutModal].forEach((modal) => {
        if (!modal) return;
        modal.addEventListener('click', (e) => {
            if (e.target === modal) {
                closeAddPetModal();
                closeLogoutModal();
            }
        });
    });

    if (addPetForm) {
        addPetForm.addEventListener('submit', (e) => {
            e.preventDefault();
            const name = petNameInput ? petNameInput.value.trim() : '';
            if (!name) {
                if (petNameInput) petNameInput.classList.add('is-invalid');
                if (petNameError) petNameError.classList.add('is-visible');
                if (petNameInput) petNameInput.focus();
                return;
            }

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
    if (profileForm) {
        profileForm.addEventListener('submit', (e) => {
            e.preventDefault();
            const saveBtn = document.getElementById('btnSaveProfile');
            if (saveBtn) saveBtn.classList.add('is-loading');

            setTimeout(() => {
                if (saveBtn) saveBtn.classList.remove('is-loading');
                PCC_AUTH.updateUser({
                    name: document.getElementById('profileName').value.trim(),
                    email: document.getElementById('profileEmail').value.trim(),
                    phone: document.getElementById('profilePhone').value.trim(),
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
    if (passForm) {
        passForm.addEventListener('submit', (e) => {
            e.preventDefault();
            const current = document.getElementById('currentPass').value;
            const newP = document.getElementById('newPass').value;
            const confirmP = document.getElementById('confirmNewPass').value;

            if (!current) {
                window.showToast('Introduce tu contraseña actual', 'error');
                return;
            }
            if (!newP || newP.length < 8) {
                window.showToast('La nueva contraseña debe tener al menos 8 caracteres', 'error');
                return;
            }
            if (newP !== confirmP) {
                window.showToast('Las contraseñas no coinciden', 'error');
                return;
            }

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
