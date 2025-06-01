// Configuración
const API_URL = window.APP_CONFIG.API_URL || 'http://localhost:3000/api';
// const MAPBOX_TOKEN = window.APP_CONFIG.MAPBOX_TOKEN;

// Elementos del DOM
const donationForm = document.getElementById('donationForm');
const donateBtn = document.getElementById('donateBtn');
const cancelBtn = document.getElementById('cancelBtn');
const donationSection = document.getElementById('donation-form');
const mapElement = document.getElementById('map');

// Verificación inicial de elementos
console.log('Estado inicial de elementos:');
console.log('- Botón de donar:', donateBtn);
console.log('- Sección de donación:', donationSection);
console.log('- Formulario:', donationForm);
console.log('- Mapa:', mapElement);

// Estado
let map = null;
let marker = null;
let currentLocation = null;

// Inicialización
document.addEventListener('DOMContentLoaded', () => {
    console.log('DOM cargado, iniciando configuración...');
    
    // Verificar elementos nuevamente después de que el DOM esté cargado
    console.log('Verificación post-DOM:');
    console.log('- Botón de donar:', document.getElementById('donateBtn'));
    console.log('- Sección de donación:', document.getElementById('donation-form'));
    
    // Intentar agregar el evento click directamente al botón
    const btn = document.getElementById('donateBtn');
    if (btn) {
        console.log('Agregando evento click directamente al botón...');
        btn.onclick = function(e) {
            console.log('Click directo en el botón');
            e.preventDefault();
            e.stopPropagation();
            
            const section = document.getElementById('donation-form');
            if (section) {
                console.log('Mostrando sección de donación');
                section.classList.remove('hidden');
                section.style.display = 'block';
                section.style.visibility = 'visible';
                section.style.opacity = '1';
                section.scrollIntoView({ behavior: 'smooth' });
            } else {
                console.error('No se encontró la sección de donación');
            }
        };
    } else {
        console.error('No se pudo encontrar el botón de donar después de DOMContentLoaded');
    }
    
    initializeMap();
    setupEventListeners();
    validateForm();
});

// Configuración del mapa
function initializeMap() {
    if (!mapElement) {
        console.error('Elemento del mapa no encontrado');
        return;
    }

    // Si el mapa ya está inicializado, solo actualizar su tamaño
    if (map) {
        map.invalidateSize();
        return;
    }

    // Crear contenedor del mapa si no existe
    if (!mapElement.querySelector('.map-container')) {
        const container = document.createElement('div');
        container.className = 'map-container';
        mapElement.appendChild(container);
    }

    const mapContainer = mapElement.querySelector('.map-container');
    mapContainer.style.height = '100%';
    mapContainer.style.width = '100%';

    // Inicializar Leaflet con OpenStreetMap
    map = L.map(mapContainer).setView([-34.6037, -58.3816], 12); // Buenos Aires por defecto

    // Usar OpenStreetMap como proveedor de tiles
    L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
        attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors',
        maxZoom: 19
    }).addTo(map);

    // Obtener ubicación actual
    if (navigator.geolocation) {
        navigator.geolocation.getCurrentPosition(
            position => {
                const { latitude, longitude } = position.coords;
                currentLocation = [latitude, longitude];
                map.setView(currentLocation, 14);
                addMarker(currentLocation);
            },
            error => {
                console.error('Error obteniendo ubicación:', error);
                showNotification('No se pudo obtener tu ubicación. Por favor, selecciónala manualmente en el mapa.', 'error');
            }
        );
    }

    // Evento de clic en el mapa
    map.on('click', e => {
        const coords = [e.latlng.lat, e.latlng.lng];
        addMarker(coords);
        updateLocationInput(coords);
    });
}

function addMarker(coords) {
    if (marker) {
        map.removeLayer(marker);
    }
    marker = L.marker(coords).addTo(map);
}

function updateLocationInput(coords) {
    // Geocodificación inversa básica usando Nominatim (OpenStreetMap)
    fetch(`https://nominatim.openstreetmap.org/reverse?format=jsonv2&lat=${coords[0]}&lon=${coords[1]}`)
        .then(response => response.json())
        .then(data => {
            const address = data.display_name || coords.join(', ');
            document.getElementById('location').value = address;
        })
        .catch(error => {
            console.error('Error en geocodificación:', error);
            document.getElementById('location').value = coords.join(', ');
        });
}

// Event Listeners
function setupEventListeners() {
    console.log('Configurando event listeners...');
    
    // Botón de donar
    if (donateBtn) {
        console.log('Agregando evento click al botón de donar (setupEventListeners)');
        donateBtn.addEventListener('click', function(e) {
            console.log('Botón de donar clickeado (setupEventListeners)');
            e.preventDefault();
            e.stopPropagation();
            
            if (donationSection) {
                console.log('Mostrando sección de donación (setupEventListeners)');
                donationSection.classList.remove('hidden');
                donationSection.style.display = 'block';
                donationSection.style.visibility = 'visible';
                donationSection.style.opacity = '1';
                donationSection.scrollIntoView({ behavior: 'smooth' });
                
                if (!map) {
                    console.log('Inicializando mapa...');
                    setTimeout(() => {
                        initializeMap();
                    }, 100);
                }
            } else {
                console.error('No se encontró la sección de donación (setupEventListeners)');
            }
        });
    } else {
        console.error('No se encontró el botón de donar (setupEventListeners)');
    }

    // Botón de cancelar
    cancelBtn?.addEventListener('click', () => {
        donationForm.reset();
        donationSection.classList.add('hidden');
        if (marker) {
            marker.remove();
            marker = null;
        }
    });

    // Envío del formulario
    donationForm?.addEventListener('submit', handleDonationSubmit);

    // Validación en tiempo real
    const inputs = donationForm?.querySelectorAll('input, select, textarea');
    inputs?.forEach(input => {
        input.addEventListener('input', validateForm);
        input.addEventListener('change', validateForm);
    });
}

// Validación del formulario
function validateForm() {
    if (!donationForm) return false;

    const formData = new FormData(donationForm);
    let isValid = true;
    const errors = {};

    // Validar tipo de alimento
    const foodType = formData.get('foodType');
    if (!foodType) {
        errors.foodType = 'Seleccione un tipo de alimento';
        isValid = false;
    }

    // Validar cantidad
    const quantity = formData.get('quantity');
    if (!quantity || quantity <= 0) {
        errors.quantity = 'Ingrese una cantidad válida';
        isValid = false;
    }

    // Validar unidad
    const unit = formData.get('unit');
    if (!unit) {
        errors.unit = 'Seleccione una unidad';
        isValid = false;
    }

    // Validar fecha de vencimiento
    const expirationDate = formData.get('expirationDate');
    if (!expirationDate) {
        errors.expirationDate = 'Seleccione una fecha de vencimiento';
        isValid = false;
    } else {
        const today = new Date();
        today.setHours(0, 0, 0, 0);
        const expDate = new Date(expirationDate);
        expDate.setHours(0, 0, 0, 0);
        if (expDate < today) {
            errors.expirationDate = 'La fecha de vencimiento no puede ser anterior a hoy';
            isValid = false;
        }
    }

    // Validar condiciones de almacenamiento
    const storageConditions = formData.get('storageConditions');
    if (!storageConditions) {
        errors.storageConditions = 'Seleccione las condiciones de almacenamiento';
        isValid = false;
    }

    // Validar ubicación
    const location = formData.get('location');
    if (!location || !marker) {
        errors.location = 'Seleccione una ubicación en el mapa';
        isValid = false;
    }

    // Mostrar errores
    Object.keys(errors).forEach(field => {
        const input = document.getElementById(field);
        if (!input) return;

        const errorElement = input.parentElement.querySelector('.error-message') || 
            document.createElement('div');
        
        if (!input.parentElement.querySelector('.error-message')) {
            errorElement.className = 'error-message';
            input.parentElement.appendChild(errorElement);
        }

        errorElement.textContent = errors[field];
        input.classList.toggle('error', !!errors[field]);
    });

    // Habilitar/deshabilitar botón de envío
    const submitButton = donationForm.querySelector('button[type="submit"]');
    if (submitButton) {
        submitButton.disabled = !isValid;
    }

    return isValid;
}

// Manejo del envío del formulario
async function handleDonationSubmit(event) {
    event.preventDefault();
    console.log('Intentando enviar formulario...');

    // Verificar autenticación
    const token = localStorage.getItem('token');
    if (!token) {
        console.log('Usuario no autenticado, mostrando modal de login');
        showNotification('Por favor, inicia sesión para registrar una donación', 'warning');
        // Mostrar modal de login
        const loginModal = document.getElementById('loginModal');
        if (loginModal) {
            loginModal.classList.remove('hidden');
        }
        return;
    }

    if (!validateForm()) {
        console.log('Formulario inválido');
        showNotification('Por favor, completa todos los campos requeridos', 'error');
        return;
    }

    const formData = new FormData(donationForm);
    const donationData = {
        foodType: formData.get('foodType'),
        quantity: {
            value: parseFloat(formData.get('quantity')),
            unit: formData.get('unit')
        },
        expirationDate: formData.get('expirationDate'),
        storageConditions: formData.get('storageConditions'),
        location: {
            address: formData.get('location'),
            coordinates: marker ? marker.getLatLng().toArray() : null
        },
        notes: formData.get('notes')
    };

    console.log('Datos de la donación:', donationData);

    try {
        showLoading(true);
        console.log('Enviando datos a la API...');
        const response = await fetch(`${API_URL}/donations`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${token}`
            },
            body: JSON.stringify(donationData)
        });

        console.log('Respuesta de la API:', response.status);
        
        if (!response.ok) {
            const errorData = await response.json().catch(() => ({}));
            throw new Error(errorData.message || 'Error al registrar la donación');
        }

        const result = await response.json();
        console.log('Donación registrada:', result);
        
        showNotification('¡Donación registrada con éxito!', 'success');
        donationForm.reset();
        donationSection.classList.add('hidden');
        if (marker) {
            marker.remove();
            marker = null;
        }

        // Actualizar historial si existe
        if (typeof updateDonationHistory === 'function') {
            updateDonationHistory();
        }
    } catch (error) {
        console.error('Error al registrar donación:', error);
        showNotification(error.message || 'Error al registrar la donación', 'error');
    } finally {
        showLoading(false);
    }
}

// Utilidades
function showNotification(message, type = 'info') {
    const notification = document.createElement('div');
    notification.className = `notification ${type}`;
    notification.textContent = message;

    document.body.appendChild(notification);

    // Animar entrada
    setTimeout(() => notification.classList.add('show'), 100);

    // Remover después de 5 segundos
    setTimeout(() => {
        notification.classList.remove('show');
        setTimeout(() => notification.remove(), 300);
    }, 5000);
}

function showLoading(show) {
    const loader = document.querySelector('.loader') || document.createElement('div');
    if (!document.querySelector('.loader')) {
        loader.className = 'loader';
        document.body.appendChild(loader);
    }
    loader.style.display = show ? 'flex' : 'none';
}

// Exportar funciones necesarias
window.donationModule = {
    validateForm,
    showNotification,
    updateLocationInput
}; 