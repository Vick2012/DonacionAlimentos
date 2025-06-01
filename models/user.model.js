const mongoose = require('mongoose');

const userSchema = new mongoose.Schema({
    name: {
        type: String,
        required: true,
        trim: true
    },
    email: {
        type: String,
        required: true,
        unique: true,
        trim: true,
        lowercase: true
    },
    password: {
        type: String,
        required: true
    },
    role: {
        type: String,
        enum: ['donor', 'admin', 'volunteer'],
        default: 'donor'
    },
    phone: {
        type: String,
        required: true
    },
    address: {
        street: String,
        city: String,
        state: String,
        zipCode: String,
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
    preferences: {
        notifications: {
            email: {
                type: Boolean,
                default: true
            },
            sms: {
                type: Boolean,
                default: false
            }
        },
        donationRadius: {
            type: Number,
            default: 10 // km
        }
    },
    stats: {
        totalDonations: {
            type: Number,
            default: 0
        },
        activeDonations: {
            type: Number,
            default: 0
        },
        lastDonationDate: Date
    },
    aiProfile: {
        donationPatterns: [{
            type: String,
            enum: ['regular', 'ocasional', 'frecuente']
        }],
        preferredCategories: [{
            type: String,
            enum: ['frutas', 'verduras', 'lacteos', 'carnes', 'granos', 'otros']
        }],
        activityScore: {
            type: Number,
            min: 0,
            max: 100,
            default: 0
        }
    },
    isActive: {
        type: Boolean,
        default: true
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
userSchema.index({ email: 1 });
userSchema.index({ 'address.coordinates': '2dsphere' });
userSchema.index({ role: 1, 'stats.totalDonations': -1 });

// Métodos del modelo
userSchema.methods.updateStats = async function() {
    const Donation = mongoose.model('Donation');
    
    const [totalDonations, activeDonations] = await Promise.all([
        Donation.countDocuments({ donor: this._id }),
        Donation.countDocuments({ 
            donor: this._id,
            status: { $in: ['pendiente', 'aprobada'] }
        })
    ]);

    const lastDonation = await Donation.findOne({ donor: this._id })
        .sort({ createdAt: -1 })
        .select('createdAt');

    this.stats = {
        totalDonations,
        activeDonations,
        lastDonationDate: lastDonation ? lastDonation.createdAt : null
    };

    return this.save();
};

// Middleware pre-save
userSchema.pre('save', function(next) {
    if (this.isModified('password')) {
        // Aquí iría la lógica de hash de contraseña
        // Por ahora solo actualizamos el timestamp
        this.updatedAt = new Date();
    }
    next();
});

const User = mongoose.model('User', userSchema);

module.exports = User; 