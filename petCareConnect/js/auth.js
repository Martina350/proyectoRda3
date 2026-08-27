const PCC_AUTH = {
    STORAGE_KEYS: {
        USER: 'pcc_user',
        SESSION: 'pcc_logged_in',
        PETS: 'pcc_pets',
        PAYMENTS: 'pcc_payments'
    },

    DEFAULT_USER: {
        name: 'Gabriel Flor',
        email: 'gabriel.flor@gmail.com',
        phone: '+593 96 931 7653',
        location: 'Quito, Ecuador',
        memberSince: 'Julio 2026',
        avatar: 'GF'
    },

    DEFAULT_PETS: [
        {
            id: 'pet-1',
            name: 'Bruno',
            type: 'Perro',
            breed: 'Beagle',
            age: '3 años',
            weight: '14 kg',
            gender: 'Macho',
            notes: 'Medicación: gotas para ojos por la mañana. Alérgico al pollo. Muy amigable y enérgico.',
            icon: 'pets'
        },
        {
            id: 'pet-2',
            name: 'Luna',
            type: 'Gato',
            breed: 'Persa',
            age: '2 años',
            weight: '4.2 kg',
            gender: 'Hembra',
            notes: 'Tranquila y mimosa. Cepillado de pelaje diario necesario.',
            icon: 'pets'
        }
    ],

    DEFAULT_PAYMENTS: [
        {
            id: 'pay-1',
            brand: 'Visa',
            last4: '4242',
            expiry: '08/2028',
            cardType: 'Débito',
            holder: 'Gabriel Flor',
            isDefault: true
        },
        {
            id: 'pay-2',
            brand: 'Mastercard',
            last4: '8819',
            expiry: '11/2027',
            cardType: 'Crédito',
            holder: 'Gabriel Flor',
            isDefault: false
        }
    ],

    init() {
        if (!localStorage.getItem(this.STORAGE_KEYS.USER)) {
            localStorage.setItem(this.STORAGE_KEYS.USER, JSON.stringify(this.DEFAULT_USER));
        }
        if (!localStorage.getItem(this.STORAGE_KEYS.PETS)) {
            localStorage.setItem(this.STORAGE_KEYS.PETS, JSON.stringify(this.DEFAULT_PETS));
        }
        if (!localStorage.getItem(this.STORAGE_KEYS.PAYMENTS)) {
            localStorage.setItem(this.STORAGE_KEYS.PAYMENTS, JSON.stringify(this.DEFAULT_PAYMENTS));
        }
        if (localStorage.getItem(this.STORAGE_KEYS.SESSION) === null) {

            localStorage.setItem(this.STORAGE_KEYS.SESSION, 'true');
        }

        if (window.PCC_LAYOUT) {
            PCC_LAYOUT.render();
        }
        this.syncNav();
    },

    isLoggedIn() {
        return localStorage.getItem(this.STORAGE_KEYS.SESSION) === 'true';
    },

    getUser() {
        try {
            const data = localStorage.getItem(this.STORAGE_KEYS.USER);
            return data ? JSON.parse(data) : this.DEFAULT_USER;
        } catch (e) {
            return this.DEFAULT_USER;
        }
    },

    updateUser(updates) {
        const current = this.getUser();
        const updated = { ...current, ...updates };
        localStorage.setItem(this.STORAGE_KEYS.USER, JSON.stringify(updated));
        return updated;
    },

    login(email, password, remember = true) {
        let user = this.getUser();
        if (!user || user.email !== email) {

            const nameFromEmail = email.split('@')[0];
            const formattedName = nameFromEmail.charAt(0).toUpperCase() + nameFromEmail.slice(1);
            user = {
                name: formattedName,
                email: email,
                phone: '+593 96 931 7653',
                location: 'Quito, Ecuador',
                memberSince: 'Hoy',
                avatar: formattedName.substring(0, 2).toUpperCase()
            };
            localStorage.setItem(this.STORAGE_KEYS.USER, JSON.stringify(user));
        }
        localStorage.setItem(this.STORAGE_KEYS.SESSION, 'true');
        this.syncNav();
        return user;
    },

    register(name, email, phone, password) {
        const initials = name
            .split(' ')
            .map(n => n.charAt(0))
            .join('')
            .substring(0, 2)
            .toUpperCase() || 'US';

        const newUser = {
            name: name.trim(),
            email: email.trim().toLowerCase(),
            phone: phone ? phone.trim() : '+593 96 931 7653',
            location: 'Quito, Ecuador',
            memberSince: '2026',
            avatar: initials
        };

        localStorage.setItem(this.STORAGE_KEYS.USER, JSON.stringify(newUser));
        localStorage.setItem(this.STORAGE_KEYS.SESSION, 'true');
        this.syncNav();
        return newUser;
    },

    logout(options = {}) {
        localStorage.setItem(this.STORAGE_KEYS.SESSION, 'false');
        this.syncNav();
        if (options.redirectTo) {
            window.location.href = options.redirectTo;
        }
    },

    getPets() {
        try {
            const data = localStorage.getItem(this.STORAGE_KEYS.PETS);
            return data ? JSON.parse(data) : this.DEFAULT_PETS;
        } catch (e) {
            return this.DEFAULT_PETS;
        }
    },

    addPet(pet) {
        const pets = this.getPets();
        const newPet = {
            id: 'pet-' + Date.now(),
            name: pet.name.trim(),
            type: pet.type || 'Perro',
            breed: pet.breed ? pet.breed.trim() : 'Mestizo',
            age: pet.age ? pet.age.trim() : '1 año',
            weight: pet.weight ? pet.weight.trim() : '10 kg',
            gender: pet.gender || 'Macho',
            notes: pet.notes ? pet.notes.trim() : 'Sin observaciones especiales.',
            icon: 'pets'
        };
        pets.push(newPet);
        localStorage.setItem(this.STORAGE_KEYS.PETS, JSON.stringify(pets));
        return newPet;
    },

    updatePet(id, data) {
        const pets = this.getPets();
        const index = pets.findIndex((p) => p.id === id);
        if (index === -1) return null;

        pets[index] = {
            ...pets[index],
            name: data.name.trim(),
            type: data.type || pets[index].type,
            breed: data.breed ? data.breed.trim() : pets[index].breed,
            age: data.age ? data.age.trim() : pets[index].age,
            weight: data.weight ? data.weight.trim() : pets[index].weight,
            gender: data.gender || pets[index].gender,
            notes: data.notes ? data.notes.trim() : pets[index].notes
        };
        localStorage.setItem(this.STORAGE_KEYS.PETS, JSON.stringify(pets));
        return pets[index];
    },

    getPetById(id) {
        return this.getPets().find((p) => p.id === id) || null;
    },

    deletePet(id) {
        let pets = this.getPets();
        pets = pets.filter(p => p.id !== id);
        localStorage.setItem(this.STORAGE_KEYS.PETS, JSON.stringify(pets));
        return pets;
    },

    getPayments() {
        try {
            const data = localStorage.getItem(this.STORAGE_KEYS.PAYMENTS);
            return data ? JSON.parse(data) : this.DEFAULT_PAYMENTS;
        } catch (e) {
            return this.DEFAULT_PAYMENTS;
        }
    },

    addPayment(payment) {
        const payments = this.getPayments();
        const makeDefault = Boolean(payment.isDefault) || payments.length === 0;
        if (makeDefault) {
            payments.forEach((p) => { p.isDefault = false; });
        }
        const newPayment = {
            id: 'pay-' + Date.now(),
            brand: payment.brand,
            last4: String(payment.last4).slice(-4),
            expiry: payment.expiry,
            cardType: payment.cardType,
            holder: payment.holder ? payment.holder.trim() : '',
            isDefault: makeDefault
        };
        payments.push(newPayment);
        localStorage.setItem(this.STORAGE_KEYS.PAYMENTS, JSON.stringify(payments));
        return newPayment;
    },

    setDefaultPayment(id) {
        const payments = this.getPayments();
        let found = false;
        payments.forEach((p) => {
            p.isDefault = p.id === id;
            if (p.isDefault) found = true;
        });
        if (!found) return null;
        localStorage.setItem(this.STORAGE_KEYS.PAYMENTS, JSON.stringify(payments));
        return payments;
    },

    deletePayment(id) {
        let payments = this.getPayments();
        const wasDefault = payments.some((p) => p.id === id && p.isDefault);
        payments = payments.filter((p) => p.id !== id);
        if (wasDefault && payments.length > 0) {
            payments[0].isDefault = true;
        }
        localStorage.setItem(this.STORAGE_KEYS.PAYMENTS, JSON.stringify(payments));
        return payments;
    },

    syncNav() {
        const loggedIn = this.isLoggedIn();
        const user = this.getUser();
        const isRoot = window.location.pathname.endsWith('index.html') || window.location.pathname.endsWith('/') || !window.location.pathname.includes('/pages/');
        const prefix = isRoot ? 'pages/' : '';

        const navLinks = document.querySelectorAll('.main-nav a, .navbar a');
        navLinks.forEach(link => {
            const href = link.getAttribute('href') || '';
            if (href.includes('login.html') || href.includes('miCuenta.html')) {
                if (loggedIn) {
                    link.href = prefix + 'miCuenta.html';
                    link.textContent = 'Mi Cuenta';
                    if (window.location.pathname.includes('miCuenta.html')) {
                        link.classList.add('active');
                    }
                } else {
                    link.href = prefix + 'login.html';
                    link.textContent = 'Iniciar sesión';
                    if (window.location.pathname.includes('login.html')) {
                        link.classList.add('active');
                    }
                }
            }
        });

        const mobileLinks = document.querySelectorAll('.mobile-nav-item');
        mobileLinks.forEach(link => {
            const href = link.getAttribute('href') || '';
            if (href.includes('login.html') || href.includes('miCuenta.html')) {
                if (loggedIn) {
                    link.href = prefix + 'miCuenta.html';
                    const spanText = link.querySelector('span:not(.material-symbols-outlined)');
                    if (spanText) spanText.textContent = 'Cuenta';
                    if (window.location.pathname.includes('miCuenta.html')) {
                        link.classList.add('active');
                    }
                } else {
                    link.href = prefix + 'login.html';
                    const spanText = link.querySelector('span:not(.material-symbols-outlined)');
                    if (spanText) spanText.textContent = 'Entrar';
                    if (window.location.pathname.includes('login.html')) {
                        link.classList.add('active');
                    }
                }
            }
        });
    }
};

if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', () => PCC_AUTH.init());
} else {
    PCC_AUTH.init();
}
