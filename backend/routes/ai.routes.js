const express = require('express');
const jwt = require('jsonwebtoken');
const router = express.Router();

// Base de conocimiento para el chatbot
const knowledgeBase = {
    greetings: [
        '¡Hola! ¿En qué puedo ayudarte hoy?',
        '¡Bienvenido! ¿Cómo puedo asistirte?',
        '¡Hola! Estoy aquí para ayudarte con tus donaciones.'
    ],
    farewells: [
        '¡Gracias por tu ayuda! ¡Hasta pronto!',
        '¡Que tengas un excelente día!',
        '¡Gracias por donar! ¡Hasta la próxima!'
    ],
    donationInfo: {
        process: 'Para donar alimentos, primero debes registrarte o iniciar sesión. Luego, puedes hacer clic en "Donar Ahora" y completar el formulario con los detalles de tu donación.',
        requirements: 'Los alimentos deben estar en buen estado, no vencidos y adecuadamente almacenados. Es importante especificar las condiciones de almacenamiento y la fecha de vencimiento.',
        types: 'Aceptamos diversos tipos de alimentos: frutas, verduras, lácteos, carnes, granos y otros productos no perecederos.',
        storage: 'Los alimentos deben ser almacenados según sus requerimientos: refrigerado, congelado o a temperatura ambiente.'
    },
    faq: {
        '¿Cómo funciona?': 'Nuestro sistema conecta donantes con organizaciones que ayudan a quienes más lo necesitan. Puedes registrar tus donaciones y seguirlas en tiempo real.',
        '¿Qué puedo donar?': 'Puedes donar alimentos no perecederos, frutas, verduras, lácteos y otros productos alimenticios en buen estado.',
        '¿Es seguro?': 'Sí, todas las donaciones son verificadas y las organizaciones receptoras son evaluadas regularmente.',
        '¿Cómo se distribuyen?': 'Las donaciones son distribuidas a través de organizaciones verificadas que trabajan directamente con comunidades necesitadas.'
    }
};

// Función para procesar el mensaje y generar una respuesta
function processMessage(message, history = []) {
    const lowerMessage = message.toLowerCase();
    
    // Detectar intención del mensaje
    if (lowerMessage.includes('hola') || lowerMessage.includes('buenos días') || lowerMessage.includes('buenas')) {
        return {
            answer: knowledgeBase.greetings[Math.floor(Math.random() * knowledgeBase.greetings.length)],
            recommendations: ['¿Quieres saber cómo donar?', '¿Necesitas información sobre el proceso?']
        };
    }

    if (lowerMessage.includes('adiós') || lowerMessage.includes('chao') || lowerMessage.includes('hasta luego')) {
        return {
            answer: knowledgeBase.farewells[Math.floor(Math.random() * knowledgeBase.farewells.length)]
        };
    }

    if (lowerMessage.includes('cómo donar') || lowerMessage.includes('proceso de donación')) {
        return {
            answer: knowledgeBase.donationInfo.process,
            recommendations: ['¿Qué tipos de alimentos puedo donar?', '¿Cuáles son los requisitos?']
        };
    }

    if (lowerMessage.includes('qué puedo donar') || lowerMessage.includes('tipos de alimentos')) {
        return {
            answer: knowledgeBase.donationInfo.types,
            recommendations: ['¿Cómo debo almacenar los alimentos?', '¿Cuáles son los requisitos?']
        };
    }

    if (lowerMessage.includes('requisitos') || lowerMessage.includes('condiciones')) {
        return {
            answer: knowledgeBase.donationInfo.requirements,
            recommendations: ['¿Cómo funciona el proceso de donación?', '¿Qué tipos de alimentos puedo donar?']
        };
    }

    if (lowerMessage.includes('almacenamiento') || lowerMessage.includes('guardar')) {
        return {
            answer: knowledgeBase.donationInfo.storage,
            recommendations: ['¿Qué tipos de alimentos puedo donar?', '¿Cuáles son los requisitos?']
        };
    }

    // Buscar en FAQ
    for (const [question, answer] of Object.entries(knowledgeBase.faq)) {
        if (lowerMessage.includes(question.toLowerCase())) {
            return {
                answer,
                recommendations: ['¿Necesitas más información?', '¿Quieres saber cómo donar?']
            };
        }
    }

    // Respuesta por defecto
    return {
        answer: 'Lo siento, no entiendo tu pregunta. ¿Podrías reformularla? Puedo ayudarte con información sobre el proceso de donación, requisitos, tipos de alimentos aceptados y más.',
        recommendations: [
            '¿Cómo funciona el proceso de donación?',
            '¿Qué tipos de alimentos puedo donar?',
            '¿Cuáles son los requisitos?'
        ]
    };
}

// Middleware para verificar autenticación
const authenticateToken = (req, res, next) => {
    const authHeader = req.headers['authorization'];
    const token = authHeader && authHeader.split(' ')[1];

    if (!token) {
        return res.status(401).json({ error: 'Se requiere autenticación para usar el chatbot' });
    }

    try {
        const decoded = jwt.verify(token, process.env.JWT_SECRET || 'secreto');
        req.user = decoded;
        next();
    } catch (error) {
        return res.status(403).json({ error: 'Token inválido o expirado' });
    }
};

// Ruta para el chat
router.post('/chat', authenticateToken, async (req, res) => {
    try {
        const { message, history } = req.body;
        
        if (!message) {
            return res.status(400).json({ error: 'El mensaje es requerido' });
        }

        const response = processMessage(message, history);
        res.json(response);
    } catch (error) {
        console.error('Error en el chatbot:', error);
        res.status(500).json({ error: 'Error al procesar el mensaje' });
    }
});

module.exports = router; 