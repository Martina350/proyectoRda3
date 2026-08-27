document.addEventListener('DOMContentLoaded', () => {
    const form = document.getElementById('recoveryForm');
    const emailInput = document.getElementById('rec-email');
    const submitBtn = document.getElementById('recSubmitBtn');
    const successState = document.getElementById('recoverySuccessState');
    const placeholder = document.getElementById('sentEmailPlaceholder');
    const recoveryDesc = document.getElementById('recoveryDesc');
    const btnResend = document.getElementById('btnResend');

    if (window.PCC_FORMS) {
        PCC_FORMS.setupForm(form, () => {
            if (submitBtn) {
                submitBtn.classList.add('is-loading');
                submitBtn.disabled = true;
                submitBtn.innerHTML = `
                    <span class="btn-spinner"></span>
                    <span>Enviando...</span>
                `;
            }

            setTimeout(() => {
                const emailVal = PCC_FORMS.normalizeEmail(emailInput.value);
                if (placeholder) placeholder.textContent = emailVal;
                if (form) form.style.display = 'none';
                if (successState) successState.style.display = 'flex';
                if (recoveryDesc) recoveryDesc.style.display = 'none';

                if (window.showToast) {
                    window.showToast('Enlace de recuperación enviado con éxito', 'success');
                }
            }, 600);
        });
    }

    if (btnResend) {
        btnResend.addEventListener('click', () => {
            btnResend.disabled = true;
            btnResend.textContent = 'Enviando...';
            setTimeout(() => {
                btnResend.disabled = false;
                btnResend.textContent = 'Reenviar correo';
                if (window.showToast) {
                    window.showToast('Hemos reenviado el correo de recuperación.', 'info');
                }
            }, 600);
        });
    }
});
