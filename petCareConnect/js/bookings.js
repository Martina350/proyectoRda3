/**
 * Pet CareConnect - Módulo de Gestión de Reservas y Catálogo
 * Maneja el catálogo de cuidadores, catálogo de servicios, persistencia en localStorage,
 * cotización en tiempo real y registro de nuevas reservas.
 */

const PCC_BOOKINGS = {
    STORAGE_KEYS: {
        BOOKINGS: 'pcc_bookings',
        LAST_BOOKING: 'pcc_last_booking'
    },

    // Catálogo oficial de cuidadores
    SITTERS: [
        {
            id: 'elena-martinez',
            name: 'Elena Martínez',
            title: 'Especialista en razas grandes y cuidado doméstico',
            rating: 4.9,
            reviewsCount: 48,
            location: 'Madrid, Chamberí',
            pricePerNight: 25,
            pricePerDay: 18,
            pricePerWalk: 15,
            verified: true,
            avatar: 'EM',
            bio: 'Amante de los perros con 5 años de experiencia en cuidado doméstico y paseos. Especialista en razas grandes y adiestramiento básico.',
            services: ['alojamiento', 'guarderia', 'paseos']
        },
        {
            id: 'javier-ruiz',
            name: 'Javier Ruiz',
            title: 'Auxiliar técnico veterinario y paseador',
            rating: 4.5,
            reviewsCount: 32,
            location: 'Madrid, Retiro',
            pricePerNight: 22,
            pricePerDay: 16,
            pricePerWalk: 12,
            verified: true,
            avatar: 'JR',
            bio: 'Auxiliar técnico veterinario. Ofrezco paseos educativos, atención médica preventiva y administración de medicación si es necesario.',
            services: ['paseos', 'guarderia', 'veterinaria']
        },
        {
            id: 'sofia-castro',
            name: 'Sofía Castro',
            title: 'Especialista en comportamiento felino y animales tímidos',
            rating: 5.0,
            reviewsCount: 112,
            location: 'Madrid, Salamanca',
            pricePerNight: 28,
            pricePerDay: 20,
            pricePerWalk: 16,
            verified: true,
            avatar: 'SC',
            bio: 'Especialista en comportamiento felino. Tu gato se sentirá como en un spa mientras tú no estás, con un entorno tranquilo y libre de estrés.',
            services: ['alojamiento', 'guarderia', 'peluqueria']
        },
        {
            id: 'lucia-fernandez',
            name: 'Lucía Fernández',
            title: 'Cuidadora certificada y terapeuta canina',
            rating: 4.9,
            reviewsCount: 124,
            location: 'Madrid, Chamberí',
            pricePerNight: 25,
            pricePerDay: 18,
            pricePerWalk: 15,
            verified: true,
            avatar: 'LF',
            bio: 'Más de 6 años de experiencia cuidando mascotas con amor. Casa amplia con terraza, sin humo y atención personalizada 24/7.',
            services: ['alojamiento', 'guarderia', 'paseos', 'peluqueria']
        },
        {
            id: 'carlos-ruiz',
            name: 'Carlos Ruiz',
            title: 'Entrenador canino y cuidador de fin de semana',
            rating: 4.8,
            reviewsCount: 64,
            location: 'Madrid, Moncloa',
            pricePerNight: 24,
            pricePerDay: 18,
            pricePerWalk: 14,
            verified: true,
            avatar: 'CR',
            bio: 'Educador canino en positivo. Espacio amplio con jardín vallado para que tu perro juegue con total seguridad.',
            services: ['alojamiento', 'guarderia', 'paseos']
        },
        {
            id: 'ana-martinez',
            name: 'Ana Martínez',
            title: 'Paseadora canina con seguimiento GPS en directo',
            rating: 4.9,
            reviewsCount: 89,
            location: 'Madrid, Chamartín',
            pricePerNight: 22,
            pricePerDay: 16,
            pricePerWalk: 15,
            verified: true,
            avatar: 'AM',
            bio: 'Paseos diarios dinámicos y divertidos. Reporte fotográfico continuo y monitoreo GPS para tu máxima tranquilidad.',
            services: ['paseos', 'guarderia']
        }
    ],

    // Catálogo oficial de servicios
    SERVICES: [
        {
            id: 'alojamiento',
            name: 'Alojamiento en casa',
            shortName: 'Alojamiento',
            desc: 'Tu mascota se queda en casa del cuidador a dormir con atención continua.',
            basePrice: 25,
            priceUnit: 'por noche',
            billingType: 'nightly',
            unitName: 'noches',
            icon: 'home'
        },
        {
            id: 'guarderia',
            name: 'Guardería de día',
            shortName: 'Guardería',
            desc: 'Cuidado durante el horario diurno o laboral (hasta 8 horas de supervisión).',
            basePrice: 18,
            priceUnit: 'por día',
            billingType: 'daily',
            unitName: 'días',
            icon: 'wb_sunny'
        },
        {
            id: 'paseos',
            name: 'Paseos diarios',
            shortName: 'Paseos',
            desc: 'Rutas seguras y enriquecedoras de 30 a 60 minutos con monitorización.',
            basePrice: 15,
            priceUnit: 'por paseo',
            billingType: 'per-service',
            unitName: 'paseos',
            icon: 'directions_walk'
        },
        {
            id: 'peluqueria',
            name: 'Peluquería y Baño',
            shortName: 'Peluquería',
            desc: 'Higiene integral, corte de pelo, lavado relajante y corte de uñas.',
            basePrice: 25,
            priceUnit: 'por sesión',
            billingType: 'per-service',
            unitName: 'sesiones',
            icon: 'content_cut'
        },
        {
            id: 'veterinaria',
            name: 'Cuidados especiales y salud',
            shortName: 'Cuidados Especiales',
            desc: 'Atención personalizada, curas y administración estricta de medicación.',
            basePrice: 30,
            priceUnit: 'por consulta',
            billingType: 'per-service',
            unitName: 'consultas',
            icon: 'medical_services'
        }
    ],

    // Semilla inicial de reservas para que el historial no aparezca vacío
    DEFAULT_BOOKINGS: [
        {
            id: 'BK-2026-001',
            code: '#PCC-2026-731',
            serviceId: 'paseos',
            serviceName: 'Paseo Diario',
            sitterId: 'ana-martinez',
            sitterName: 'Ana Martínez',
            sitterAvatar: 'AM',
            petId: 'pet-1',
            petName: 'Bruno',
            petType: 'Perro (Beagle)',
            startDate: '2026-10-26',
            endDate: '2026-10-26',
            dateFormatted: 'Hoy, 14:00 - 15:00',
            duration: 1,
            unitLabel: 'paseo',
            petCount: 1,
            rate: 15,
            subtotal: 15,
            serviceFee: 0,
            total: 15,
            status: 'en-progreso',
            statusLabel: 'En progreso',
            statusCategory: 'active',
            notes: 'Paseo por el parque del Retiro.',
            createdAt: '2026-10-26T08:30:00Z'
        },
        {
            id: 'BK-2026-002',
            code: '#PCC-2026-614',
            serviceId: 'peluqueria',
            serviceName: 'Peluquería Canina',
            sitterId: 'lucia-fernandez',
            sitterName: 'Spa de Mascotas "Lulú"',
            sitterAvatar: 'LF',
            petId: 'pet-2',
            petName: 'Luna',
            petType: 'Gato (Persa)',
            startDate: '2026-10-27',
            endDate: '2026-10-27',
            dateFormatted: 'Mañana, 10:30 AM',
            duration: 1,
            unitLabel: 'sesión',
            petCount: 1,
            rate: 30,
            subtotal: 30,
            serviceFee: 5,
            total: 35,
            status: 'programada',
            statusLabel: 'Mañana',
            statusCategory: 'active',
            notes: 'Cepillado profundo de pelaje y baño anti-nudos.',
            createdAt: '2026-10-25T14:15:00Z'
        },
        {
            id: 'BK-2026-003',
            code: '#PCC-2026-502',
            serviceId: 'alojamiento',
            serviceName: 'Cuidado en Casa',
            sitterId: 'carlos-ruiz',
            sitterName: 'Carlos Ruiz',
            sitterAvatar: 'CR',
            petId: 'pet-1',
            petName: 'Bruno',
            petType: 'Perro (Beagle)',
            startDate: '2026-10-15',
            endDate: '2026-10-18',
            dateFormatted: '15 Oct - 18 Oct, 2026',
            duration: 3,
            unitLabel: 'noches',
            petCount: 1,
            rate: 25,
            subtotal: 75,
            serviceFee: 5,
            total: 80,
            status: 'completada',
            statusLabel: 'Completada',
            statusCategory: 'past',
            rating: 5.0,
            notes: 'Excelente estadía, Bruno estuvo muy contento.',
            createdAt: '2026-10-10T11:00:00Z'
        },
        {
            id: 'BK-2026-004',
            code: '#PCC-2026-489',
            serviceId: 'veterinaria',
            serviceName: 'Consulta Veterinaria',
            sitterId: 'javier-ruiz',
            sitterName: 'Clínica San Antón',
            sitterAvatar: 'JR',
            petId: 'pet-2',
            petName: 'Luna',
            petType: 'Gato (Persa)',
            startDate: '2026-10-12',
            endDate: '2026-10-12',
            dateFormatted: '12 Oct, 2026',
            duration: 1,
            unitLabel: 'consulta',
            petCount: 1,
            rate: 35,
            subtotal: 35,
            serviceFee: 5,
            total: 40,
            status: 'completada',
            statusLabel: 'Completada',
            statusCategory: 'past',
            notes: 'Revisión preventiva de vacunas.',
            createdAt: '2026-10-08T09:20:00Z'
        },
        {
            id: 'BK-2026-005',
            code: '#PCC-2026-310',
            serviceId: 'alojamiento',
            serviceName: 'Entrenamiento',
            sitterId: 'carlos-ruiz',
            sitterName: 'Club Canino Elite',
            sitterAvatar: 'CR',
            petId: 'pet-1',
            petName: 'Bruno',
            petType: 'Perro (Beagle)',
            startDate: '2026-10-20',
            endDate: '2026-10-20',
            dateFormatted: '20 Oct, 2026',
            duration: 1,
            unitLabel: 'sesión',
            petCount: 1,
            rate: 20,
            subtotal: 20,
            serviceFee: 5,
            total: 25,
            status: 'cancelada',
            statusLabel: 'Cancelada por el usuario',
            statusCategory: 'cancelled',
            notes: 'Cancelación solicitada con reembolso.',
            createdAt: '2026-10-18T16:00:00Z'
        }
    ],

    /**
     * Inicializa las semillas de reservas si no existen en localStorage
     */
    init() {
        if (!localStorage.getItem(this.STORAGE_KEYS.BOOKINGS)) {
            localStorage.setItem(this.STORAGE_KEYS.BOOKINGS, JSON.stringify(this.DEFAULT_BOOKINGS));
        }
        if (!localStorage.getItem(this.STORAGE_KEYS.LAST_BOOKING)) {
            const bookings = this.getBookings();
            if (bookings.length > 0) {
                localStorage.setItem(this.STORAGE_KEYS.LAST_BOOKING, JSON.stringify(bookings[0]));
            }
        }
    },

    /**
     * Obtiene el catálogo de cuidadores
     */
    getSitters() {
        return this.SITTERS;
    },

    /**
     * Busca un cuidador por id o coincidencia de nombre
     */
    getSitterById(idOrSlug) {
        if (!idOrSlug) return null;
        const normalized = String(idOrSlug).toLowerCase().trim().replace(/\s+/g, '-');
        return this.SITTERS.find(s => 
            s.id.toLowerCase() === normalized || 
            s.name.toLowerCase() === String(idOrSlug).toLowerCase().trim() ||
            s.id.includes(normalized)
        ) || null;
    },

    /**
     * Obtiene el catálogo de servicios
     */
    getServices() {
        return this.SERVICES;
    },

    /**
     * Busca un servicio por id
     */
    getServiceById(id) {
        if (!id) return null;
        const normalized = String(id).toLowerCase().trim();
        return this.SERVICES.find(s => s.id === normalized || s.shortName.toLowerCase() === normalized) || null;
    },

    /**
     * Obtiene todas las reservas almacenadas
     */
    getBookings() {
        try {
            const data = localStorage.getItem(this.STORAGE_KEYS.BOOKINGS);
            if (!data) {
                this.init();
                return this.DEFAULT_BOOKINGS;
            }
            return JSON.parse(data);
        } catch (e) {
            console.error('Error al parsear reservas de localStorage:', e);
            return this.DEFAULT_BOOKINGS;
        }
    },

    /**
     * Obtiene una reserva por su ID o código
     */
    getBookingById(idOrCode) {
        const bookings = this.getBookings();
        return bookings.find(b => b.id === idOrCode || b.code === idOrCode) || null;
    },

    /**
     * Obtiene la última reserva confirmada
     */
    getLast() {
        return this.getLastBooking();
    },

    getLastBooking() {
        try {
            const data = localStorage.getItem(this.STORAGE_KEYS.LAST_BOOKING);
            if (data) {
                return JSON.parse(data);
            }
            const bookings = this.getBookings();
            return bookings.length > 0 ? bookings[0] : null;
        } catch (e) {
            console.error('Error al obtener la última reserva:', e);
            return null;
        }
    },

    /**
     * Calcula la cotización y desglose de costes en base a los parámetros
     */
    quote(params = {}) {
        const {
            sitterId,
            serviceId = 'alojamiento',
            startDate,
            endDate,
            petCount = 1
        } = params;

        const sitter = this.getSitterById(sitterId) || this.SITTERS[0];
        const service = this.getServiceById(serviceId) || this.SERVICES[0];
        const pets = Math.max(1, parseInt(petCount, 10) || 1);

        let duration = 1;
        let durationUnit = service.unitName || 'días';

        if (startDate && endDate) {
            const dStart = new Date(startDate + 'T00:00:00');
            const dEnd = new Date(endDate + 'T00:00:00');

            if (!isNaN(dStart.getTime()) && !isNaN(dEnd.getTime())) {
                const diffTime = dEnd.getTime() - dStart.getTime();
                const diffDays = Math.round(diffTime / (1000 * 60 * 60 * 24));

                if (service.billingType === 'nightly') {
                    duration = Math.max(1, diffDays);
                    durationUnit = duration === 1 ? 'noche' : 'noches';
                } else if (service.billingType === 'daily') {
                    duration = Math.max(1, diffDays + 1);
                    durationUnit = duration === 1 ? 'día' : 'días';
                } else {
                    duration = Math.max(1, diffDays + 1);
                    durationUnit = duration === 1 ? 'sesión' : 'sesiones';
                }
            }
        }

        // Determinar tarifa unitaria por cuidador y servicio
        let unitRate = service.basePrice;
        if (sitter) {
            if (service.id === 'alojamiento' && sitter.pricePerNight) {
                unitRate = sitter.pricePerNight;
            } else if (service.id === 'guarderia' && sitter.pricePerDay) {
                unitRate = sitter.pricePerDay;
            } else if (service.id === 'paseos' && sitter.pricePerWalk) {
                unitRate = sitter.pricePerWalk;
            }
        }

        const subtotal = unitRate * duration * pets;
        const serviceFee = 5; // Tarifa fija de gestión y seguro
        const total = subtotal + serviceFee;

        // Desglose formateado
        let breakdownText = `$${unitRate} × ${duration} ${durationUnit}`;
        if (pets > 1) {
            breakdownText += ` × ${pets} mascotas`;
        }

        return {
            sitter,
            service,
            unitRate,
            duration,
            durationUnit,
            petCount: pets,
            subtotal,
            serviceFee,
            total,
            breakdownText,
            currency: '$'
        };
    },

    /**
     * Agrega una nueva reserva validando datos y guardando en localStorage
     * Lanza error explícito si los datos son inválidos o falla el guardado.
     */
    addBooking(bookingData) {
        if (!bookingData) {
            throw new Error('No se han proporcionado datos para la reserva.');
        }

        const {
            sitterId,
            serviceId,
            startDate,
            endDate,
            petId,
            petName,
            petType,
            petCount = 1,
            notes = '',
            paymentMethod = 'Tarjeta de Crédito / Débito'
        } = bookingData;

        // Validaciones estrictas
        if (!sitterId) {
            throw new Error('Debes seleccionar un cuidador para la reserva.');
        }

        const sitter = this.getSitterById(sitterId);
        if (!sitter) {
            throw new Error('El cuidador seleccionado no es válido.');
        }

        if (!serviceId) {
            throw new Error('Debes seleccionar un tipo de servicio.');
        }

        const service = this.getServiceById(serviceId);
        if (!service) {
            throw new Error('El servicio seleccionado no es válido.');
        }

        if (!startDate) {
            throw new Error('La fecha de entrada o inicio es obligatoria.');
        }

        if (!endDate) {
            throw new Error('La fecha de salida o fin es obligatoria.');
        }

        const dStart = new Date(startDate + 'T00:00:00');
        const dEnd = new Date(endDate + 'T00:00:00');

        if (isNaN(dStart.getTime()) || isNaN(dEnd.getTime())) {
            throw new Error('Las fechas ingresadas tienen un formato inválido.');
        }

        if (dEnd < dStart) {
            throw new Error('La fecha de salida debe ser igual o posterior a la fecha de entrada.');
        }

        if (!petName && !petId) {
            throw new Error('Debes indicar al menos una mascota para el servicio.');
        }

        // Calcular cotización final
        const quoteResult = this.quote({
            sitterId: sitter.id,
            serviceId: service.id,
            startDate,
            endDate,
            petCount
        });

        // Formatear rango de fechas legible
        const formatOptions = { day: 'numeric', month: 'short', year: 'numeric' };
        const startStr = dStart.toLocaleDateString('es-ES', formatOptions);
        const endStr = dEnd.toLocaleDateString('es-ES', formatOptions);
        const dateFormatted = startStr === endStr ? startStr : `${startStr} - ${endStr}`;

        // Generar identificadores únicos
        const randomNum = Math.floor(100 + Math.random() * 900);
        const uniqueId = `BK-2026-${Date.now().toString().slice(-4)}${randomNum.toString().slice(-2)}`;
        const code = `#PCC-2026-${randomNum}`;

        const finalPetName = petName || (petId === 'pet-1' ? 'Bruno' : (petId === 'pet-2' ? 'Luna' : 'Mascota'));
        const finalPetType = petType || (petId === 'pet-2' ? 'Gato (Persa)' : 'Perro (Beagle)');

        const newBooking = {
            id: uniqueId,
            code,
            serviceId: service.id,
            serviceName: service.name,
            sitterId: sitter.id,
            sitterName: sitter.name,
            sitterAvatar: sitter.avatar,
            sitterLocation: sitter.location,
            petId: petId || 'custom',
            petName: finalPetName,
            petType: finalPetType,
            petCount: quoteResult.petCount,
            startDate,
            endDate,
            dateFormatted,
            duration: quoteResult.duration,
            unitLabel: quoteResult.durationUnit,
            rate: quoteResult.unitRate,
            subtotal: quoteResult.subtotal,
            serviceFee: quoteResult.serviceFee,
            total: quoteResult.total,
            status: 'confirmada',
            statusLabel: 'Confirmada',
            statusCategory: 'active',
            paymentMethod,
            notes: notes ? notes.trim() : '',
            createdAt: new Date().toISOString()
        };

        try {
            const bookings = this.getBookings();
            // Agregar al inicio del arreglo
            bookings.unshift(newBooking);

            localStorage.setItem(this.STORAGE_KEYS.BOOKINGS, JSON.stringify(bookings));
            localStorage.setItem(this.STORAGE_KEYS.LAST_BOOKING, JSON.stringify(newBooking));

            return newBooking;
        } catch (e) {
            console.error('Error al persistir la reserva en localStorage:', e);
            throw new Error('No se pudo guardar la reserva en el almacenamiento local: ' + (e.message || 'Error de cuota'));
        }
    }
};

// Exposición en el objeto global window
window.PCC_BOOKINGS = PCC_BOOKINGS;
window.getBookings = () => PCC_BOOKINGS.getBookings();
window.addBooking = (data) => PCC_BOOKINGS.addBooking(data);
window.getLastBooking = () => PCC_BOOKINGS.getLastBooking();
window.getBookingQuote = (params) => PCC_BOOKINGS.quote(params);

// Auto-inicializar cuando cargue el script
if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', () => PCC_BOOKINGS.init());
} else {
    PCC_BOOKINGS.init();
}
