const tf = require('@tensorflow/tfjs-node');
const { NLP } = require('@nlpjs/basic');

class AIService {
    constructor() {
        this.nlp = new NLP();
        this.model = null;
        this.initialized = false;
    }

    async initialize() {
        if (this.initialized) return;

        // Inicializar NLP
        await this.nlp.addCorpus({
            locale: 'es',
            data: [
                {
                    intent: 'donation_help',
                    utterances: [
                        '¿Cómo puedo donar?',
                        '¿Qué tipo de alimentos puedo donar?',
                        '¿Cuáles son los requisitos para donar?',
                        '¿Necesito registrarme para donar?'
                    ],
                    answers: [
                        'Puedes donar cualquier alimento no perecedero o perecedero en buen estado. Para donar, primero regístrate en el sistema y luego usa el formulario de donación.',
                        'Aceptamos frutas, verduras, lácteos, carnes, granos y otros alimentos en buen estado. Los alimentos deben estar dentro de su fecha de vencimiento.',
                        'Los requisitos principales son: alimentos en buen estado, dentro de su fecha de vencimiento, y correctamente almacenados según sus necesidades.'
                    ]
                }
            ]
        });

        // Inicializar modelo de clasificación
        this.model = await this.createPriorityModel();
        this.initialized = true;
    }

    async createPriorityModel() {
        // Crear un modelo simple para clasificación de prioridad
        const model = tf.sequential();
        
        model.add(tf.layers.dense({
            units: 16,
            activation: 'relu',
            inputShape: [4] // [días_hasta_vencimiento, cantidad, tipo_alimento, condiciones_almacenamiento]
        }));
        
        model.add(tf.layers.dense({
            units: 8,
            activation: 'relu'
        }));
        
        model.add(tf.layers.dense({
            units: 3,
            activation: 'softmax' // [baja_prioridad, media_prioridad, alta_prioridad]
        }));

        model.compile({
            optimizer: 'adam',
            loss: 'categoricalCrossentropy',
            metrics: ['accuracy']
        });

        return model;
    }

    async analyzeDonation(donation) {
        await this.initialize();

        // Análisis de prioridad
        const priorityScore = await this.calculatePriorityScore(donation);
        
        // Análisis de categoría
        const category = this.categorizeDonation(priorityScore);
        
        // Generar recomendaciones
        const recommendations = await this.generateRecommendations(donation, priorityScore);

        return {
            priorityScore,
            category,
            recommendations
        };
    }

    async calculatePriorityScore(donation) {
        const daysUntilExpiration = Math.ceil((donation.expirationDate - new Date()) / (1000 * 60 * 60 * 24));
        
        // Normalizar inputs
        const normalizedDays = Math.max(0, Math.min(1, daysUntilExpiration / 30));
        const normalizedQuantity = Math.min(1, donation.quantity.value / 100);
        
        // Codificar tipo de alimento (one-hot encoding simplificado)
        const foodTypeEncoding = this.encodeFoodType(donation.foodType);
        
        // Codificar condiciones de almacenamiento
        const storageEncoding = this.encodeStorageConditions(donation.storageConditions);

        // Combinar features
        const features = tf.tensor2d([
            [normalizedDays, normalizedQuantity, foodTypeEncoding, storageEncoding]
        ]);

        // Predecir
        const prediction = await this.model.predict(features).array();
        return prediction[0][2]; // Probabilidad de alta prioridad
    }

    categorizeDonation(priorityScore) {
        if (priorityScore >= 0.7) return 'alta_prioridad';
        if (priorityScore >= 0.4) return 'media_prioridad';
        return 'baja_prioridad';
    }

    async generateRecommendations(donation, priorityScore) {
        const recommendations = [];

        // Recomendaciones basadas en prioridad
        if (priorityScore >= 0.7) {
            recommendations.push('Esta donación requiere atención inmediata debido a su alta prioridad.');
        }

        // Recomendaciones basadas en tipo de alimento
        if (['carnes', 'lacteos'].includes(donation.foodType)) {
            recommendations.push('Asegúrese de mantener la cadena de frío para estos productos.');
        }

        // Recomendaciones basadas en cantidad
        if (donation.quantity.value > 50) {
            recommendations.push('Considere dividir la donación en lotes más pequeños para facilitar su distribución.');
        }

        return recommendations;
    }

    encodeFoodType(foodType) {
        const encoding = {
            'frutas': 0.2,
            'verduras': 0.3,
            'lacteos': 0.6,
            'carnes': 0.8,
            'granos': 0.1,
            'otros': 0.4
        };
        return encoding[foodType] || 0.4;
    }

    encodeStorageConditions(conditions) {
        const encoding = {
            'refrigerado': 0.6,
            'congelado': 0.8,
            'ambiente': 0.2,
            'especial': 0.7
        };
        return encoding[conditions] || 0.2;
    }

    async processUserQuery(query) {
        await this.initialize();
        const result = await this.nlp.process('es', query);
        return {
            intent: result.intent,
            answer: result.answer,
            confidence: result.score
        };
    }

    async analyzeDonationPatterns(donations) {
        // Implementar análisis de patrones de donación
        const patterns = {
            frequency: this.calculateFrequency(donations),
            preferredCategories: this.analyzeCategories(donations),
            timePatterns: this.analyzeTimePatterns(donations)
        };

        return patterns;
    }

    calculateFrequency(donations) {
        if (donations.length < 2) return 'ocasional';

        const timeSpan = donations[donations.length - 1].createdAt - donations[0].createdAt;
        const daysSpan = timeSpan / (1000 * 60 * 60 * 24);
        const frequency = donations.length / daysSpan;

        if (frequency >= 0.5) return 'frecuente';
        if (frequency >= 0.2) return 'regular';
        return 'ocasional';
    }

    analyzeCategories(donations) {
        const categories = donations.reduce((acc, donation) => {
            acc[donation.foodType] = (acc[donation.foodType] || 0) + 1;
            return acc;
        }, {});

        return Object.entries(categories)
            .sort(([,a], [,b]) => b - a)
            .slice(0, 3)
            .map(([category]) => category);
    }

    analyzeTimePatterns(donations) {
        // Implementar análisis de patrones temporales
        return {
            preferredDays: this.getPreferredDays(donations),
            preferredHours: this.getPreferredHours(donations)
        };
    }

    getPreferredDays(donations) {
        const dayCounts = donations.reduce((acc, donation) => {
            const day = new Date(donation.createdAt).getDay();
            acc[day] = (acc[day] || 0) + 1;
            return acc;
        }, {});

        return Object.entries(dayCounts)
            .sort(([,a], [,b]) => b - a)
            .slice(0, 3)
            .map(([day]) => day);
    }

    getPreferredHours(donations) {
        const hourCounts = donations.reduce((acc, donation) => {
            const hour = new Date(donation.createdAt).getHours();
            acc[hour] = (acc[hour] || 0) + 1;
            return acc;
        }, {});

        return Object.entries(hourCounts)
            .sort(([,a], [,b]) => b - a)
            .slice(0, 3)
            .map(([hour]) => hour);
    }
}

module.exports = new AIService(); 