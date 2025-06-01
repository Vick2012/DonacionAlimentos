// Elementos del DOM
let loginBtn = document.getElementById('loginBtn');
let loginModal = document.getElementById('loginModal');
let closeLoginBtn = document.getElementById('closeLoginBtn');
let closeLoginModalBtn = document.getElementById('closeLoginModalBtn');
let loginForm = document.getElementById('loginForm');

// Registro de usuario
let registerBtn = document.getElementById('registerBtn');
let registerModal = document.getElementById('registerModal');
let closeRegisterBtn = document.getElementById('closeRegisterBtn');
let closeRegisterModalBtn = document.getElementById('closeRegisterModalBtn');
let registerForm = document.getElementById('registerForm');

// Estado
let isModalOpen = false;

// Función para verificar elementos
function verifyElements() {
    console.log('=== VERIFICANDO ELEMENTOS ===');
    const elements = {
        loginBtn,
        loginModal,
        closeLoginBtn,
        closeLoginModalBtn,
        registerBtn,
        registerModal,
        closeRegisterBtn,
        closeRegisterModalBtn
    };

    Object.entries(elements).forEach(([name, element]) => {
        if (!element) {
            console.error(`❌ Elemento no encontrado: ${name}`);
        } else {
            console.log(`✅ Elemento encontrado: ${name}`, element);
        }
    });
}

// Función para mostrar un modal
function showModal(modal) {
    console.log('=== MOSTRANDO MODAL ===');
    console.log('Modal:', modal);
    console.log('ID del modal:', modal?.id);
    console.log('Clases actuales:', modal?.className);

    if (!modal) {
        console.error('Modal no proporcionado');
        return;
    }

    modal.style.display = 'flex';
    modal.classList.remove('hidden');
    document.body.style.overflow = 'hidden';
    isModalOpen = true;

    console.log('Modal después de mostrar:');
    console.log('Display:', modal.style.display);
    console.log('Clases:', modal.className);
}

// Función para ocultar un modal
function hideModal(modal) {
    console.log('=== OCULTANDO MODAL ===');
    console.log('Modal:', modal);
    console.log('ID del modal:', modal?.id);
    console.log('Clases actuales:', modal?.className);

    if (!modal) {
        console.error('Modal no proporcionado');
        return;
    }

    modal.style.display = 'none';
    modal.classList.add('hidden');
    document.body.style.overflow = '';
    isModalOpen = false;

    console.log('Modal después de ocultar:');
    console.log('Display:', modal.style.display);
    console.log('Clases:', modal.className);
}

// Función para limpiar y reinicializar los event listeners
function resetEventListeners() {
    console.log('=== REINICIANDO EVENT LISTENERS ===');
    
    // Limpiar botón de registro
    if (registerBtn) {
        const newRegisterBtn = registerBtn.cloneNode(true);
        registerBtn.parentNode.replaceChild(newRegisterBtn, registerBtn);
        registerBtn = newRegisterBtn;
        console.log('✅ Botón de registro reiniciado');
    }

    // Limpiar botón de login
    if (loginBtn) {
        const newLoginBtn = loginBtn.cloneNode(true);
        loginBtn.parentNode.replaceChild(newLoginBtn, loginBtn);
        loginBtn = newLoginBtn;
        console.log('✅ Botón de login reiniciado');
    }

    // Limpiar botones de cierre
    if (closeLoginBtn) {
        const newCloseLoginBtn = closeLoginBtn.cloneNode(true);
        closeLoginBtn.parentNode.replaceChild(newCloseLoginBtn, closeLoginBtn);
        closeLoginBtn = newCloseLoginBtn;
        console.log('✅ Botón de cerrar login reiniciado');
    }

    if (closeLoginModalBtn) {
        const newCloseLoginModalBtn = closeLoginModalBtn.cloneNode(true);
        closeLoginModalBtn.parentNode.replaceChild(newCloseLoginModalBtn, closeLoginModalBtn);
        closeLoginModalBtn = newCloseLoginModalBtn;
        console.log('✅ Botón X de cerrar login reiniciado');
    }

    if (closeRegisterBtn) {
        const newCloseRegisterBtn = closeRegisterBtn.cloneNode(true);
        closeRegisterBtn.parentNode.replaceChild(newCloseRegisterBtn, closeRegisterBtn);
        closeRegisterBtn = newCloseRegisterBtn;
        console.log('✅ Botón de cerrar registro reiniciado');
    }

    if (closeRegisterModalBtn) {
        const newCloseRegisterModalBtn = closeRegisterModalBtn.cloneNode(true);
        closeRegisterModalBtn.parentNode.replaceChild(newCloseRegisterModalBtn, closeRegisterModalBtn);
        closeRegisterModalBtn = newCloseRegisterModalBtn;
        console.log('✅ Botón X de cerrar registro reiniciado');
    }
}

// Inicialización
document.addEventListener('DOMContentLoaded', () => {
    console.log('=== INICIALIZANDO ===');
    verifyElements();

    // Configurar eventos del modal de login
    if (loginBtn) {
        loginBtn.addEventListener('click', (e) => {
            console.log('Click en botón de login');
            e.preventDefault();
            showModal(loginModal);
        });
    }

    if (closeLoginBtn) {
        closeLoginBtn.addEventListener('click', (e) => {
            console.log('Click en botón de cerrar login (Cancelar)');
            e.preventDefault();
            hideModal(loginModal);
        });
    }

    if (closeLoginModalBtn) {
        closeLoginModalBtn.addEventListener('click', (e) => {
            console.log('Click en botón X de cerrar login');
            e.preventDefault();
            hideModal(loginModal);
        });
    }

    // Configurar eventos del modal de registro
    if (registerBtn) {
        registerBtn.addEventListener('click', (e) => {
            console.log('Click en botón de registro');
            e.preventDefault();
            showModal(registerModal);
        });
    }

    if (closeRegisterBtn) {
        closeRegisterBtn.addEventListener('click', (e) => {
            console.log('Click en botón de cerrar registro (Cancelar)');
            e.preventDefault();
            hideModal(registerModal);
        });
    }

    if (closeRegisterModalBtn) {
        closeRegisterModalBtn.addEventListener('click', (e) => {
            console.log('Click en botón X de cerrar registro');
            e.preventDefault();
            hideModal(registerModal);
        });
    }

    // Cerrar modal con Escape
    document.addEventListener('keydown', (e) => {
        if (e.key === 'Escape' && isModalOpen) {
            console.log('Tecla Escape presionada');
            const visibleModal = document.querySelector('.modal:not(.hidden)');
            if (visibleModal) {
                console.log('Cerrando modal visible:', visibleModal.id);
                hideModal(visibleModal);
            }
        }
    });

    // Cerrar modal al hacer clic fuera
    document.addEventListener('click', (e) => {
        if (isModalOpen && e.target.classList.contains('modal')) {
            console.log('Click fuera del modal');
            console.log('Elemento clickeado:', e.target);
            hideModal(e.target);
        }
    });

    // Verificar estado de autenticación
    checkAuthStatus();
    updateUserGreeting();

    console.log(localStorage.getItem('user'));
    console.log(localStorage.getItem('token'));

    if (loginForm) {
        loginForm.addEventListener('submit', handleLogin);
    }
    let logoutBtn = document.getElementById('logoutBtn');
    if (logoutBtn) {
        logoutBtn.addEventListener('click', handleLogout);
    }
});

// Funciones de autenticación
async function handleLogin(event) {
    event.preventDefault();

    const formData = new FormData(loginForm);
    const credentials = {
        email: formData.get('email'),
        password: formData.get('password')
    };

    try {
        showLoading(true);
        const response = await fetch('http://localhost:3000/api/users/login', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(credentials)
        });

        if (!response.ok) {
            throw new Error('Credenciales inválidas');
        }

        const data = await response.json();
        localStorage.setItem('token', data.token);
        localStorage.setItem('user', JSON.stringify(data.user));

        updateUIForAuth(true);
        hideModal(loginModal);
        showNotification('¡Bienvenido!', 'success');
    } catch (error) {
        console.error('Error:', error);
        showNotification(error.message || 'Error al iniciar sesión', 'error');
    } finally {
        showLoading(false);
    }
}

function checkAuthStatus() {
    const token = localStorage.getItem('token');
    const user = JSON.parse(localStorage.getItem('user') || 'null');
    updateUIForAuth(!!token && !!user);
}

function updateUserGreeting() {
    const userGreeting = document.getElementById('userGreeting');
    const token = localStorage.getItem('token');
    const user = JSON.parse(localStorage.getItem('user') || 'null');
    const logoutBtn = document.getElementById('logoutBtn');
    if (token && user && user.name) {
        userGreeting.innerHTML = `<i class="fas fa-user-circle"></i> Hola,  <b>${user.name}</b>`;
        userGreeting.style.display = 'inline-flex';
        if (logoutBtn) logoutBtn.style.display = 'inline-block';
    } else {
        userGreeting.textContent = '';
        userGreeting.style.display = 'none';
        if (logoutBtn) logoutBtn.style.display = 'none';
    }
}

function updateUIForAuth(isAuthenticated) {
    console.log('=== ACTUALIZANDO UI PARA AUTENTICACIÓN ===');
    console.log('Estado de autenticación:', isAuthenticated);
    updateUserGreeting();
    if (isAuthenticated) {
        console.log('Usuario autenticado, actualizando UI...');
        if (loginBtn) {
            loginBtn.textContent = 'Mi Cuenta';
            loginBtn.onclick = () => window.location.href = '/profile.html';
        }
        
        // Ocultar el botón de registro
        if (registerBtn) {
            registerBtn.style.display = 'none';
        }
    } else {
        console.log('Usuario no autenticado, actualizando UI...');
        if (loginBtn) {
            loginBtn.textContent = 'Iniciar Sesión';
            loginBtn.onclick = (e) => {
                e.preventDefault();
                showModal(loginModal);
            };
        }
        
        // Mostrar el botón de registro
        if (registerBtn) {
            registerBtn.style.display = '';
            registerBtn.onclick = (e) => {
                e.preventDefault();
                showModal(registerModal);
            };
        }
    }
}

// Funciones de UI
function toggleModal(modal) {
    if (!modal) {
        console.error('Modal no proporcionado a toggleModal');
        return;
    }

    const isHidden = modal.classList.contains('hidden');
    console.log('toggleModal:', { modal, isHidden });

    if (isHidden) {
        // Abrir modal
        modal.classList.remove('hidden');
        document.body.style.overflow = 'hidden';
        isModalOpen = true;

        // Enfocar primer input
        const firstInput = modal.querySelector('input, select, textarea');
        if (firstInput) {
            setTimeout(() => firstInput.focus(), 100);
        }
    } else {
        // Cerrar modal
        modal.classList.add('hidden');
        document.body.style.overflow = '';
        isModalOpen = false;
    }
}

function showLoading(show) {
    const loader = document.querySelector('.loader') || createLoader();
    loader.style.display = show ? 'flex' : 'none';
}

function createLoader() {
    const loader = document.createElement('div');
    loader.className = 'loader';
    loader.innerHTML = `
        <div class="spinner"></div>
        <span>Cargando...</span>
    `;
    document.body.appendChild(loader);
    return loader;
}

function showNotification(message, type = 'info') {
    const notification = document.createElement('div');
    notification.className = `notification ${type}`;
    notification.innerHTML = `
        <i class="fas ${getNotificationIcon(type)}"></i>
        <span>${message}</span>
    `;

    document.body.appendChild(notification);

    // Animar entrada
    requestAnimationFrame(() => {
        notification.classList.add('show');
    });

    // Remover después de 5 segundos
    setTimeout(() => {
        notification.classList.remove('show');
        setTimeout(() => notification.remove(), 300);
    }, 5000);
}

function getNotificationIcon(type) {
    switch (type) {
        case 'success':
            return 'fa-check-circle';
        case 'error':
            return 'fa-exclamation-circle';
        case 'warning':
            return 'fa-exclamation-triangle';
        default:
            return 'fa-info-circle';
    }
}

// Animaciones
function setupAnimations() {
    // Observador de intersección para animaciones al scroll
    const observer = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                entry.target.classList.add('animate');
                observer.unobserve(entry.target);
            }
        });
    }, {
        threshold: 0.1
    });

    // Elementos a animar
    document.querySelectorAll('.animate-on-scroll').forEach(element => {
        observer.observe(element);
    });
}

// Utilidades
function debounce(func, wait) {
    let timeout;
    return function executedFunction(...args) {
        const later = () => {
            clearTimeout(timeout);
            func(...args);
        };
        clearTimeout(timeout);
        timeout = setTimeout(later, wait);
    };
}

function throttle(func, limit) {
    let inThrottle;
    return function executedFunction(...args) {
        if (!inThrottle) {
            func(...args);
            inThrottle = true;
            setTimeout(() => inThrottle = false, limit);
        }
    };
}

// Exportar funciones necesarias
window.uiModule = {
    showNotification,
    showLoading,
    toggleModal,
    debounce,
    throttle
};

function handleLogout() {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    updateUIForAuth(false);
    showNotification('Sesión cerrada', 'success');
} 