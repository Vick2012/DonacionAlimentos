require('dotenv').config();
const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const morgan = require('morgan');
const mongoose = require('mongoose');

// Importar rutas (se crearán después)
const donationRoutes = require('./routes/donation.routes');
const userRoutes = require('./routes/user.routes');
const aiRoutes = require('./routes/ai.routes');

const app = express();

// Middleware
app.use(helmet({
    contentSecurityPolicy: {
        directives: {
            defaultSrc: ["'self'"],
            scriptSrc: ["'self'", "https://unpkg.com", "https://cdnjs.cloudflare.com", "https://*.tiktok.com", "'unsafe-inline'"],
            styleSrc: ["'self'", "https://unpkg.com", "https://cdnjs.cloudflare.com", "'unsafe-inline'"],
            imgSrc: ["'self'", "data:", "blob:", "https://*.tile.openstreetmap.org", "https://*.tiktok.com", "https://unpkg.com"],
            connectSrc: ["'self'", "https://*.tiktok.com", "wss://*.tiktok.com", "https://*.tile.openstreetmap.org"],
            fontSrc: ["'self'", "https://fonts.gstatic.com", "https://cdnjs.cloudflare.com", "data:"],
            objectSrc: ["'none'"],
            mediaSrc: ["'self'"],
            frameSrc: ["'none'"],
            workerSrc: ["'self'", "blob:"]
        },
        crossOriginEmbedderPolicy: false,
        crossOriginResourcePolicy: { policy: "cross-origin" }
    }
}));

// Configuración de CORS más permisiva
app.use(cors({
    origin: '*',
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization'],
    credentials: true
}));

// Agregar headers adicionales para recursos de terceros
app.use((req, res, next) => {
    res.setHeader('Cross-Origin-Resource-Policy', 'cross-origin');
    res.setHeader('Cross-Origin-Embedder-Policy', 'credentialless');
    next();
});

app.use(morgan('dev')); // Logging
app.use(express.json()); // Parse JSON
app.use(express.urlencoded({ extended: true }));

// Servir archivos estáticos
app.use(express.static('frontend'));
app.use('/styles', express.static('frontend/styles'));
app.use('/js', express.static('frontend/js'));
app.use('/images', express.static('frontend/images'));

// Conexión a MongoDB
mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/donaciones-alimentos', {
    useNewUrlParser: true,
    useUnifiedTopology: true
})
.then(() => console.log('📦 Conectado a MongoDB'))
.catch(err => console.error('Error conectando a MongoDB:', err));

// Rutas básicas
app.get('/', (req, res) => {
    res.json({ message: 'API de Sistema de Donaciones de Alimentos' });
});

// Rutas de la API (se implementarán después)
app.use('/api/donations', donationRoutes);
app.use('/api/users', userRoutes);
app.use('/api/ai', aiRoutes);

// Manejo de errores
app.use((err, req, res, next) => {
    console.error(err.stack);
    res.status(500).json({
        error: 'Error interno del servidor',
        message: process.env.NODE_ENV === 'development' ? err.message : undefined
    });
});

// Puerto
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
    console.log(`🚀 Servidor corriendo en puerto ${PORT}`);
}); 