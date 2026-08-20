const PCC_AUTH = {
    STORAGE_KEYS: {
        USER: 'pcc_user',
        SESSION: 'pcc_logged_in',
        PETS: 'pcc_pets'
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

    init() {
        if (!localStorage.getItem(this.STORAGE_KEYS.USER)) {
            localStorage.setItem(this.STORAGE_KEYS.USER, JSON.stringify(this.DEFAULT_USER));
        }
        if (!localStorage.getItem(this.STORAGE_KEYS.PETS)) {
            localStorage.setItem(this.STORAGE_KEYS.PETS, JSON.stringify(this.DEFAULT_PETS));
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

    deletePet(id) {
        let pets = this.getPets();
        pets = pets.filter(p => p.id !== id);
        localStorage.setItem(this.STORAGE_KEYS.PETS, JSON.stringify(pets));
        return pets;
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
