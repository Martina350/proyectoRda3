

const PCC_FORMS = {

    EMAIL_REGEX: /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/,
    PHONE_REGEX: /^[+0-9\s()\-]{7,20}$/,


    normalizeEmail(value) {
        return (value || '').trim().toLowerCase();
    },

    normalizeName(value) {
        return (value || '').trim().replace(/\s+/g, ' ');
    },

    normalizePhone(value) {
        return (value || '').trim();
    },


    isValidEmail(email) {
        if (!email) return false;
        return this.EMAIL_REGEX.test(this.normalizeEmail(email));
    },

    isValidPhone(phone) {
        if (!phone) return true;
        const clean = phone.trim();
        const digits = clean.replace(/\D/g, '');
        return this.PHONE_REGEX.test(clean) && digits.length >= 7;
    },

    
    showError(input, message) {
        if (!input) return;

        input.classList.add('is-invalid');
        input.classList.add('input-invalid');
        input.setAttribute('aria-invalid', 'true');


        let errorId = input.getAttribute('aria-describedby') || `${input.id || input.name}-error`;
        let errorEl = document.getElementById(errorId);

        if (!errorEl) {

            const parent = input.closest('.login-form-item, .form-group, .booking-input-group, fieldset, .form-block') || input.parentElement;
            if (parent) {
                errorEl = parent.querySelector('.field-error');
            }
        }

        if (!errorEl && input.parentElement) {
            errorEl = document.createElement('div');
            errorEl.id = errorId;
            errorEl.className = 'field-error';
            errorEl.setAttribute('role', 'alert');
            input.parentElement.appendChild(errorEl);
        }

        if (errorEl) {
            errorEl.innerHTML = `
                <span class="material-symbols-outlined" style="font-size: 15px;" aria-hidden="true">error</span>
                <span class="field-error-text">${message}</span>
            `;
            errorEl.classList.add('is-visible');
            input.setAttribute('aria-describedby', errorEl.id || errorId);
        }
    },

    
    clearError(input) {
        if (!input) return;

        input.classList.remove('is-invalid');
        input.classList.remove('input-invalid');
        input.setAttribute('aria-invalid', 'false');

        const errorId = input.getAttribute('aria-describedby');
        let errorEl = errorId ? document.getElementById(errorId) : null;

        if (!errorEl) {
            const parent = input.closest('.login-form-item, .form-group, .booking-input-group, fieldset, .form-block') || input.parentElement;
            if (parent) {
                errorEl = parent.querySelector('.field-error');
            }
        }

        if (errorEl) {
            errorEl.classList.remove('is-visible');
            errorEl.innerHTML = '';
        }
    },

    
    clearFormErrors(form) {
        if (!form) return;
        const inputs = form.querySelectorAll('input, select, textarea');
        inputs.forEach(input => this.clearError(input));
    },

    
    validateInput(input) {
        if (!input || input.disabled || input.type === 'hidden') {
            return { valid: true, message: '' };
        }

        const value = (input.value || '').trim();
        const type = (input.type || '').toLowerCase();
        const isRequired = input.hasAttribute('required') || input.getAttribute('aria-required') === 'true';
        const name = input.name || input.id || '';


        if (type === 'checkbox') {
            if (isRequired && !input.checked) {
                const msg = input.dataset.errorRequired || 'Debes marcar esta casilla para continuar.';
                return { valid: false, message: msg };
            }
            return { valid: true, message: '' };
        }


        if (type === 'radio') {
            if (isRequired) {
                const radioGroup = document.querySelectorAll(`input[type="radio"][name="${input.name}"]`);
                const anyChecked = Array.from(radioGroup).some(r => r.checked);
                if (!anyChecked) {
                    const msg = input.dataset.errorRequired || 'Por favor selecciona una de las opciones.';
                    return { valid: false, message: msg };
                }
            }
            return { valid: true, message: '' };
        }


        if (isRequired && value.length === 0) {
            if (input.dataset.errorRequired) {
                return { valid: false, message: input.dataset.errorRequired };
            }
            if (type === 'email' || name.toLowerCase().includes('email')) {
                return { valid: false, message: 'Por favor ingresa tu correo electrónico.' };
            }
            if (type === 'password' || name.toLowerCase().includes('pass')) {
                return { valid: false, message: 'Por favor ingresa tu contraseña.' };
            }
            if (name.toLowerCase().includes('pet') && (name.toLowerCase().includes('name') || name.toLowerCase().includes('nombre'))) {
                return { valid: false, message: 'Por favor ingresa el nombre de tu mascota.' };
            }
            if (name.toLowerCase().includes('name') || name.toLowerCase().includes('nombre')) {
                return { valid: false, message: 'Por favor ingresa tu nombre y apellido.' };
            }
            if (type === 'tel' || name.toLowerCase().includes('phone') || name.toLowerCase().includes('tel')) {
                return { valid: false, message: 'Por favor ingresa un número de teléfono.' };
            }
            if (input.tagName === 'TEXTAREA') {
                return { valid: false, message: 'Por favor escribe tu mensaje o consulta.' };
            }
            if (input.tagName === 'SELECT') {
                return { valid: false, message: 'Por favor selecciona una opción.' };
            }
            return { valid: false, message: 'Este campo es obligatorio. Por favor complétalo.' };
        }


        if (!isRequired && value.length === 0) {
            return { valid: true, message: '' };
        }


        if (type === 'email' || name.toLowerCase().includes('email')) {
            if (!this.isValidEmail(value)) {
                return { valid: false, message: 'Ingresa un correo electrónico válido (ejemplo: usuario@correo.com).' };
            }
        }


        if (type === 'tel' || name.toLowerCase().includes('phone') || name.toLowerCase().includes('tel')) {
            if (!this.isValidPhone(value)) {
                return { valid: false, message: 'Ingresa un número de teléfono válido (mínimo 8 dígitos).' };
            }
        }


        const minLength = input.getAttribute('minlength') ? parseInt(input.getAttribute('minlength'), 10) : null;
        if (minLength && value.length < minLength) {
            if (type === 'password' || name.toLowerCase().includes('pass')) {
                return { valid: false, message: `La contraseña debe tener al menos ${minLength} caracteres.` };
            }
            return { valid: false, message: `Debe contener al menos ${minLength} caracteres.` };
        }


        const minChars = input.dataset.minChars ? parseInt(input.dataset.minChars, 10) : null;
        if (minChars && value.length < minChars) {
            return { valid: false, message: `Escribe un mensaje de al menos ${minChars} caracteres para el cuidador.` };
        }


        const matchId = input.dataset.matchField;
        if (matchId) {
            const targetInput = document.getElementById(matchId);
            if (targetInput && targetInput.value !== input.value) {
                return { valid: false, message: 'Las contraseñas no coinciden.' };
            }
        }


        const dateAfterId = input.dataset.dateAfter;
        if (dateAfterId) {
            const startInput = document.getElementById(dateAfterId);
            if (startInput && startInput.value && input.value) {
                const startDate = new Date(startInput.value + 'T00:00:00');
                const endDate = new Date(input.value + 'T00:00:00');
                if (endDate < startDate) {
                    return { valid: false, message: 'La fecha de salida debe ser igual o posterior a la fecha de entrada.' };
                }
            }
        }


        if (input.dataset.validate === 'card-number') {
            const digits = value.replace(/\s+/g, '');
            if (!/^\d{13,19}$/.test(digits)) {
                return { valid: false, message: 'Ingresa un número de tarjeta válido (13 a 19 dígitos).' };
            }
        }


        if (input.dataset.validate === 'card-expiry') {
            const match = value.match(/^(0[1-9]|1[0-2])\/(\d{4})$/);
            if (!match) {
                return { valid: false, message: 'Usa el formato MM/AAAA (ejemplo: 08/2028).' };
            }
            const month = parseInt(match[1], 10);
            const year = parseInt(match[2], 10);
            const now = new Date();
            const expEnd = new Date(year, month, 0, 23, 59, 59);
            if (expEnd < now) {
                return { valid: false, message: 'La tarjeta está caducada. Ingresa una fecha válida.' };
            }
        }

        return { valid: true, message: '' };
    },

    
    validateForm(form, options = {}) {
        if (!form) return true;

        const inputs = form.querySelectorAll('input, select, textarea');
        let isValid = true;
        let firstInvalid = null;
        let firstErrorMessage = '';

        inputs.forEach(input => {
            const result = this.validateInput(input);
            if (!result.valid) {
                this.showError(input, result.message);
                if (isValid) {
                    isValid = false;
                    firstInvalid = input;
                    firstErrorMessage = result.message;
                }
            } else {
                this.clearError(input);
            }
        });

        if (!isValid && firstInvalid) {
            firstInvalid.focus();
            if (options.showToast !== false && window.showToast) {
                window.showToast(firstErrorMessage || 'Por favor completa todos los campos requeridos.', 'error');
            }
        }

        return isValid;
    },

    
    setupForm(form, onValidSubmit) {
        if (!form) return;

        form.setAttribute('novalidate', 'true');

        const inputs = form.querySelectorAll('input, select, textarea');

        inputs.forEach(input => {

            input.addEventListener('blur', () => {
                const result = this.validateInput(input);
                if (!result.valid) {
                    this.showError(input, result.message);
                } else {
                    this.clearError(input);
                }
            });


            const revalidateHandler = () => {
                if (input.classList.contains('is-invalid') || input.getAttribute('aria-invalid') === 'true') {
                    const result = this.validateInput(input);
                    if (result.valid) {
                        this.clearError(input);
                    }
                }
            };

            input.addEventListener('input', revalidateHandler);
            input.addEventListener('change', revalidateHandler);
        });

        if (typeof onValidSubmit === 'function') {
            form.addEventListener('submit', (e) => {
                e.preventDefault();
                const isValid = this.validateForm(form);
                if (isValid) {
                    onValidSubmit(e, form);
                }
            });
        }
    }
};

window.PCC_FORMS = PCC_FORMS;
