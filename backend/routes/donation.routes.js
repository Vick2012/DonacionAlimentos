const express = require('express');
const jwt = require('jsonwebtoken');
const Donation = require('../../models/donation.model');
const router = express.Router();

const authMiddleware = (req, res, next) => {
    const authHeader = req.headers['authorization'];
    const token = authHeader && authHeader.split(' ')[1];
    if (!token) return res.status(401).json({ error: 'No autenticado' });
    try {
        const decoded = jwt.verify(token, process.env.JWT_SECRET || 'secreto');
        req.user = decoded;
        next();
    } catch (err) {
        return res.status(403).json({ error: 'Token inválido' });
    }
};

// Obtener historial de donaciones del usuario autenticado
router.get('/', authMiddleware, async (req, res) => {
    try {
        const userId = req.query.userId || req.user.userId;
        const donations = await Donation.find({ donor: userId }).sort({ createdAt: -1 });
        res.json({ donations });
    } catch (error) {
        res.status(500).json({ error: 'Error al obtener historial de donaciones', details: error.message });
    }
});

module.exports = router; 