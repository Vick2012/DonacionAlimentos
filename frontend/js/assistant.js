// Configuración
// const API_URL = window.APP_CONFIG.API_URL;

// Elementos del DOM
const aiAssistantBtn = document.getElementById('aiAssistantBtn');
const aiChat = document.getElementById('aiChat');
const closeChatBtn = document.getElementById('closeChatBtn');
const chatMessages = document.getElementById('chatMessages');
const userInput = document.getElementById('userInput');
const sendMessageBtn = document.getElementById('sendMessageBtn');

// Estado
let isProcessing = false;
let chatHistory = [];

// Inicialización
document.addEventListener('DOMContentLoaded', () => {
    setupEventListeners();
    addSystemMessage('¡Hola! Soy tu asistente virtual. ¿En qué puedo ayudarte hoy?');
});

// Event Listeners
function setupEventListeners() {
    // Botón del asistente
    aiAssistantBtn?.addEventListener('click', toggleChat);

    // Botón de cerrar chat
    closeChatBtn?.addEventListener('click', toggleChat);

    // Envío de mensaje
    sendMessageBtn?.addEventListener('click', handleUserMessage);
    userInput?.addEventListener('keypress', e => {
        if (e.key === 'Enter' && !e.shiftKey) {
            e.preventDefault();
            handleUserMessage();
        }
    });

    // Cerrar chat con Escape
    document.addEventListener('keydown', e => {
        if (e.key === 'Escape' && !aiChat?.classList.contains('hidden')) {
            toggleChat();
        }
    });
}

// Funciones principales
function toggleChat() {
    console.log('Toggle chat clicked');
    console.log('Chat element:', aiChat);
    console.log('Current classes:', aiChat?.classList.toString());
    
    if (!aiChat) {
        console.error('Chat element not found');
        return;
    }

    const isHidden = aiChat.classList.contains('hidden');
    console.log('Is hidden:', isHidden);

    if (isHidden) {
        // Mostrar chat
        aiChat.classList.remove('hidden');
        // Forzar reflow para que la animación funcione
        void aiChat.offsetWidth;
        aiChat.style.opacity = '1';
        aiChat.style.transform = 'translateY(0)';
        userInput?.focus();
    } else {
        // Ocultar chat
        aiChat.style.opacity = '0';
        aiChat.style.transform = 'translateY(20px)';
        setTimeout(() => {
            aiChat.classList.add('hidden');
        }, 300); // Coincidir con la duración de la transición CSS
    }
}

async function handleUserMessage() {
    if (!userInput || isProcessing) return;

    const message = userInput.value.trim();
    if (!message) return;

    // Agregar mensaje del usuario
    addUserMessage(message);
    userInput.value = '';
    userInput.disabled = true;
    isProcessing = true;

    try {
        // Obtener respuesta del asistente
        const response = await getAIResponse(message);
        
        // Agregar respuesta del asistente
        addAssistantMessage(response.answer);

        // Actualizar historial
        chatHistory.push({
            role: 'user',
            content: message
        }, {
            role: 'assistant',
            content: response.answer
        });

        // Si hay recomendaciones, mostrarlas
        if (response.recommendations?.length > 0) {
            setTimeout(() => {
                addRecommendations(response.recommendations);
            }, 1000);
        }
    } catch (error) {
        console.error('Error:', error);
        addSystemMessage('Lo siento, hubo un error al procesar tu mensaje. Por favor, intenta de nuevo.');
    } finally {
        userInput.disabled = false;
        isProcessing = false;
        userInput.focus();
    }
}

async function getAIResponse(message) {
    const response = await fetch(`${window.APP_CONFIG.API_URL}/ai/chat`, {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${localStorage.getItem('token')}`
        },
        body: JSON.stringify({
            message,
            history: chatHistory.slice(-4) // Últimos 2 pares de mensajes
        })
    });

    if (!response.ok) {
        throw new Error('Error al obtener respuesta del asistente');
    }

    return response.json();
}

// Funciones de UI
function addUserMessage(message) {
    const messageElement = createMessageElement('user', message);
    chatMessages?.appendChild(messageElement);
    scrollToBottom();
}

function addAssistantMessage(message) {
    const messageElement = createMessageElement('assistant', message);
    chatMessages?.appendChild(messageElement);
    scrollToBottom();
}

function addSystemMessage(message) {
    const messageElement = createMessageElement('system', message);
    chatMessages?.appendChild(messageElement);
    scrollToBottom();
}

function addRecommendations(recommendations) {
    const container = document.createElement('div');
    container.className = 'recommendations-container';

    const title = document.createElement('h4');
    title.textContent = 'Recomendaciones:';
    container.appendChild(title);

    const list = document.createElement('ul');
    recommendations.forEach(rec => {
        const item = document.createElement('li');
        item.textContent = rec;
        list.appendChild(item);
    });
    container.appendChild(list);

    chatMessages?.appendChild(container);
    scrollToBottom();
}

function createMessageElement(role, content) {
    const messageDiv = document.createElement('div');
    messageDiv.className = `message ${role}-message`;

    const avatar = document.createElement('div');
    avatar.className = 'message-avatar';
    
    const icon = document.createElement('i');
    icon.className = getAvatarIcon(role);
    avatar.appendChild(icon);

    const contentDiv = document.createElement('div');
    contentDiv.className = 'message-content';
    contentDiv.textContent = content;

    messageDiv.appendChild(avatar);
    messageDiv.appendChild(contentDiv);

    return messageDiv;
}

function getAvatarIcon(role) {
    switch (role) {
        case 'user':
            return 'fas fa-user';
        case 'assistant':
            return 'fas fa-robot';
        case 'system':
            return 'fas fa-info-circle';
        default:
            return 'fas fa-question-circle';
    }
}

function scrollToBottom() {
    if (chatMessages) {
        chatMessages.scrollTop = chatMessages.scrollHeight;
    }
}

// Funciones de utilidad
function formatDate(date) {
    return new Intl.DateTimeFormat('es', {
        hour: '2-digit',
        minute: '2-digit'
    }).format(date);
}

// Exportar funciones necesarias
window.aiAssistantModule = {
    toggleChat,
    addSystemMessage,
    addRecommendations
}; 