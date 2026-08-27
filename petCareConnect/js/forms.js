/**
 * Pet CareConnect - Motor Central de Formularios y Validación (forms.js)
 * Proporciona validación accesible (aria-invalid, aria-describedby),
 * mensajes de error contextuales y específicos (vacío vs formato),
 * normalización de campos, gestión en tiempo real (blur e input) y foco automático.
 */

const PCC_FORMS = {
    // Expresiones regulares comunes
    EMAIL_REGEX: /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/,
    PHONE_REGEX: /^[+0-9\s()\-]{7,20}$/,

    // Normalizadores
    normalizeEmail(value) {
        return (value || '').trim().toLowerCase();
    },

    normalizeName(value) {
        return (value || '').trim().replace(/\s+/g, ' ');
    },

    normalizePhone(value) {
        return (value || '').trim();
    },

    // Validadores de formato individuales
    isValidEmail(email) {
        if (!email) return false;
        return this.EMAIL_REGEX.test(this.normalizeEmail(email));
    },

    isValidPhone(phone) {
        if (!phone) return true; // Si es opcional y está vacío, es válido
        const clean = phone.trim();
        const digits = clean.replace(/\D/g, '');
        return this.PHONE_REGEX.test(clean) && digits.length >= 7;
    },

    /**
     * Muestra un error accesible en un campo y vincula aria-describedby
     */
    showError(input, message) {
        if (!input) return;

        input.classList.add('is-invalid');
        input.classList.add('input-invalid');
        input.setAttribute('aria-invalid', 'true');

        // Buscar contenedor de error existente o crearlo
        let errorId = input.getAttribute('aria-describedby') || `${input.id || input.name}-error`;
        let errorEl = document.getElementById(errorId);

        if (!errorEl) {
            // Buscar por clase dentro del padre
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

    /**
     * Limpia el error de un campo
     */
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

    /**
     * Limpia todos los errores de un formulario
     */
    clearFormErrors(form) {
        if (!form) return;
        const inputs = form.querySelectorAll('input, select, textarea');
        inputs.forEach(input => this.clearError(input));
    },

    /**
     * Valida un elemento de formulario individual
     * Retorna { valid: boolean, message: string }
     */
    validateInput(input) {
        if (!input || input.disabled || input.type === 'hidden') {
            return { valid: true, message: '' };
        }

        const value = (input.value || '').trim();
        const type = (input.type || '').toLowerCase();
        const isRequired = input.hasAttribute('required') || input.getAttribute('aria-required') === 'true';
        const name = input.name || input.id || '';

        // 1. Manejo de Checkboxes obligatorios (ej. Términos)
        if (type === 'checkbox') {
            if (isRequired && !input.checked) {
                const msg = input.dataset.errorRequired || 'Debes marcar esta casilla para continuar.';
                return { valid: false, message: msg };
            }
            return { valid: true, message: '' };
        }

        // 2. Manejo de Radio buttons obligatorios (ej. Selección de cuidador)
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

        // 3. Campo vacío obligatorio
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

        // Si no es obligatorio y está vacío, es válido
        if (!isRequired && value.length === 0) {
            return { valid: true, message: '' };
        }

        // 4. Formato de Correo Electrónico
        if (type === 'email' || name.toLowerCase().includes('email')) {
            if (!this.isValidEmail(value)) {
                return { valid: false, message: 'Ingresa un correo electrónico válido (ejemplo: usuario@correo.com).' };
            }
        }

        // 5. Formato de Teléfono
        if (type === 'tel' || name.toLowerCase().includes('phone') || name.toLowerCase().includes('tel')) {
            if (!this.isValidPhone(value)) {
                return { valid: false, message: 'Ingresa un número de teléfono válido (mínimo 8 dígitos).' };
            }
        }

        // 6. Longitud mínima de contraseña o texto
        const minLength = input.getAttribute('minlength') ? parseInt(input.getAttribute('minlength'), 10) : null;
        if (minLength && value.length < minLength) {
            if (type === 'password' || name.toLowerCase().includes('pass')) {
                return { valid: false, message: `La contraseña debe tener al menos ${minLength} caracteres.` };
            }
            return { valid: false, message: `Debe contener al menos ${minLength} caracteres.` };
        }

        // 7. Textarea de contacto / mensaje mínimo (ej. 10 caracteres)
        const minChars = input.dataset.minChars ? parseInt(input.dataset.minChars, 10) : null;
        if (minChars && value.length < minChars) {
            return { valid: false, message: `Escribe un mensaje de al menos ${minChars} caracteres para el cuidador.` };
        }

        // 8. Coincidencia de contraseña (Confirmar contraseña)
        const matchId = input.dataset.matchField;
        if (matchId) {
            const targetInput = document.getElementById(matchId);
            if (targetInput && targetInput.value !== input.value) {
                return { valid: false, message: 'Las contraseñas no coinciden.' };
            }
        }

        // 9. Validación de rango de fechas
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

        // 10. Número de tarjeta (solo dígitos, 13–19)
        if (input.dataset.validate === 'card-number') {
            const digits = value.replace(/\s+/g, '');
            if (!/^\d{13,19}$/.test(digits)) {
                return { valid: false, message: 'Ingresa un número de tarjeta válido (13 a 19 dígitos).' };
            }
        }

        // 11. Caducidad MM/AAAA
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

    /**
     * Valida un formulario completo
     * Si hay errores: muestra mensajes, hace foco en el primer campo inválido y muestra toast
     */
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

    /**
     * Asocia eventos reactivos a los campos del formulario
     */
    setupForm(form, onValidSubmit) {
        if (!form) return;

        form.setAttribute('novalidate', 'true');

        const inputs = form.querySelectorAll('input, select, textarea');

        inputs.forEach(input => {
            // Validar al perder el foco
            input.addEventListener('blur', () => {
                const result = this.validateInput(input);
                if (!result.valid) {
                    this.showError(input, result.message);
                } else {
                    this.clearError(input);
                }
            });

            // Si el campo ya tiene error, revalidar en tiempo real para quitarlo
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
