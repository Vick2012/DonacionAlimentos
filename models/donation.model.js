const mongoose = require('mongoose');

const donationSchema = new mongoose.Schema({
    donor: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true
    },
    foodType: {
        type: String,
        required: true,
        enum: ['frutas', 'verduras', 'lacteos', 'carnes', 'granos', 'otros']
    },
    quantity: {
        value: {
            type: Number,
            required: true,
            min: 0
        },
        unit: {
            type: String,
            required: true,
            enum: ['kg', 'g', 'l', 'ml', 'unidad']
        }
    },
    expirationDate: {
        type: Date,
        required: true
    },
    storageConditions: {
        type: String,
        required: true,
        enum: ['refrigerado', 'congelado', 'ambiente', 'especial']
    },
    status: {
        type: String,
        required: true,
        enum: ['pendiente', 'aprobada', 'rechazada', 'entregada'],
        default: 'pendiente'
    },
    priority: {
        type: Number,
        min: 1,
        max: 5,
        default: 3
    },
    location: {
        address: {
            type: String,
            required: true
        },
        coordinates: {
            type: {
                type: String,
                enum: ['Point'],
                default: 'Point'
            },
            coordinates: {
                type: [Number],
                required: true
            }
        }
    },
    aiAnalysis: {
        priorityScore: {
            type: Number,
            min: 0,
            max: 1
        },
        category: {
            type: String,
            enum: ['alta_prioridad', 'media_prioridad', 'baja_prioridad']
        },
        recommendations: [String]
    },
    createdAt: {
        type: Date,
        default: Date.now
    },
    updatedAt: {
        type: Date,
        default: Date.now
    }
}, {
    timestamps: true
});

// Índices
donationSchema.index({ location: '2dsphere' });
donationSchema.index({ status: 1, priority: -1 });
donationSchema.index({ expirationDate: 1 });

// Métodos del modelo
donationSchema.methods.calculatePriority = function() {
    const daysUntilExpiration = Math.ceil((this.expirationDate - new Date()) / (1000 * 60 * 60 * 24));
    
    // Lógica básica de priorización
    if (daysUntilExpiration <= 2) return 1;
    if (daysUntilExpiration <= 5) return 2;
    if (daysUntilExpiration <= 10) return 3;
    if (daysUntilExpiration <= 15) return 4;
    return 5;
};

// Middleware pre-save
donationSchema.pre('save', function(next) {
    this.priority = this.calculatePriority();
    next();
});

const Donation = mongoose.model('Donation', donationSchema);

module.exports = Donation; 