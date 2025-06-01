// Configuración compartida
const CONFIG = {
    API_URL: 'http://localhost:3000/api',
    // Usando OpenStreetMap que es gratuito y no requiere token
    MAP_PROVIDER: 'openstreetmap'
};

// Hacer la configuración disponible globalmente
window.APP_CONFIG = CONFIG;

document.addEventListener('DOMContentLoaded', () => {
    console.log('Configuración cargada:', CONFIG);
}); 