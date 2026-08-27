function togglePassword() {
    const passInput = document.getElementById('reg-password');
    const passIcon = document.getElementById('passwordIcon');
    if (!passInput) return;
    if (passInput.type === 'password') {
        passInput.type = 'text';
        if (passIcon) passIcon.innerText = 'visibility_off';
    } else {
        passInput.type = 'password';
        if (passIcon) passIcon.innerText = 'visibility';
    }
}

document.addEventListener('DOMContentLoaded', () => {
    const form = document.getElementById('registerForm');
    const nameInput = document.getElementById('reg-name');
    const emailInput = document.getElementById('reg-email');
    const phoneInput = document.getElementById('reg-phone');
    const passInput = document.getElementById('reg-password');
    const strengthContainer = document.getElementById('strengthContainer');
    const strengthText = document.getElementById('strengthText');
    const submitBtn = document.getElementById('regSubmitBtn');
    const toggleBtn = document.querySelector('.toggle-password-btn');

    if (toggleBtn) {
        toggleBtn.addEventListener('click', togglePassword);
    }

    document.querySelectorAll('[data-toast-info]').forEach((link) => {
        link.addEventListener('click', (e) => {
            e.preventDefault();
            if (window.showToast) {
                window.showToast(link.getAttribute('data-toast-info'), 'info');
            }
        });
    });

    function evaluateStrength(pass) {
        if (!pass || pass.length === 0) {
            if (strengthContainer) strengthContainer.className = 'password-strength-container';
            if (strengthText) {
                strengthText.textContent = 'Seguridad: pendiente';
                strengthText.style.color = 'var(--text-muted)';
            }
            return 0;
        }

        let score = 0;
        if (pass.length >= 8) score++;
        if (/[A-Z]/.test(pass) && /[0-9]/.test(pass)) score++;
        if (pass.length >= 10 && /[^A-Za-z0-9]/.test(pass)) score++;

        if (strengthContainer) {
            strengthContainer.className = 'password-strength-container';
            if (score === 0 || (score === 1 && pass.length < 8)) {
                strengthContainer.classList.add('strength-level-weak');
                if (strengthText) {
                    strengthText.textContent = 'Seguridad: Débil (mínimo 8 caracteres)';
                    strengthText.style.color = 'var(--error)';
                }
            } else if (score === 1 || score === 2) {
                strengthContainer.classList.add('strength-level-medium');
                if (strengthText) {
                    strengthText.textContent = 'Seguridad: Media (buen nivel)';
                    strengthText.style.color = 'var(--secondary-bright)';
                }
            } else {
                strengthContainer.classList.add('strength-level-strong');
                if (strengthText) {
                    strengthText.textContent = 'Seguridad: Fuerte (excelente)';
                    strengthText.style.color = 'var(--success)';
                }
            }
        }

        return score;
    }

    if (passInput) {
        passInput.addEventListener('input', () => {
            evaluateStrength(passInput.value);
        });
    }

    if (window.PCC_FORMS) {
        PCC_FORMS.setupForm(form, () => {
            if (submitBtn) {
                submitBtn.classList.add('is-loading');
                submitBtn.disabled = true;
                submitBtn.innerHTML = `
                    <span class="btn-spinner"></span>
                    <span>Creando tu cuenta...</span>
                `;
            }

            setTimeout(() => {
                const user = PCC_AUTH.register(
                    PCC_FORMS.normalizeName(nameInput.value),
                    PCC_FORMS.normalizeEmail(emailInput.value),
                    PCC_FORMS.normalizePhone(phoneInput ? phoneInput.value : ''),
                    passInput.value
                );

                if (window.showToast) {
                    window.showToast(`¡Cuenta creada con éxito! Bienvenido, ${user.name}`, 'success');
                }

                const params = new URLSearchParams(window.location.search);
                const nextUrl = params.get('next') || 'miCuenta.html';

                setTimeout(() => {
                    window.location.href = nextUrl;
                }, 500);
            }, 600);
        });
    }
});
