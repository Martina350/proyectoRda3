function togglePassword() {
    const passInput = document.getElementById('password');
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
    const form = document.getElementById('loginForm');
    const emailInput = document.getElementById('email');
    const passInput = document.getElementById('password');
    const submitBtn = document.getElementById('loginSubmitBtn');
    const rememberCheckbox = document.getElementById('remember');
    const toggleBtn = document.querySelector('.toggle-password-btn');

    if (toggleBtn) {
        toggleBtn.addEventListener('click', togglePassword);
    }

    if (window.PCC_FORMS) {
        PCC_FORMS.setupForm(form, () => {
            if (submitBtn) {
                submitBtn.classList.add('is-loading');
                submitBtn.disabled = true;
                submitBtn.innerHTML = `
                    <span class="btn-spinner"></span>
                    <span>Iniciando sesión...</span>
                `;
            }

            setTimeout(() => {
                const user = PCC_AUTH.login(
                    emailInput.value,
                    passInput.value,
                    rememberCheckbox ? rememberCheckbox.checked : true
                );
                if (window.showToast) {
                    window.showToast(`¡Bienvenido de nuevo, ${user.name}!`, 'success');
                }

                const params = new URLSearchParams(window.location.search);
                const nextUrl = params.get('next') || 'miCuenta.html';

                setTimeout(() => {
                    window.location.href = nextUrl;
                }, 400);
            }, 500);
        });
    }
});
