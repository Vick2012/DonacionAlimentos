const express = require('express');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const User = require('../../models/user.model');
const router = express.Router();

// Registro de usuario
router.post('/register', async (req, res) => {
    try {
        const { name, email, password, phone, address } = req.body;
        if (!name || !email || !password || !phone || !address) {
            return res.status(400).json({ error: 'Todos los campos son obligatorios.' });
        }
        // Verificar si el email ya está registrado
        const existingUser = await User.findOne({ email });
        if (existingUser) {
            return res.status(409).json({ error: 'El email ya está registrado.' });
        }
        // Encriptar la contraseña
        const hashedPassword = await bcrypt.hash(password, 10);
        // Crear usuario
        const user = new User({ name, email, password: hashedPassword, phone, address });
        await user.save();
        res.status(201).json({ message: 'Usuario registrado exitosamente', user: { _id: user._id, name: user.name, email: user.email } });
    } catch (error) {
        res.status(500).json({ error: 'Error al registrar usuario', details: error.message });
    }
});

// Login de usuario
router.post('/login', async (req, res) => {
    try {
        const { email, password } = req.body;
        if (!email || !password) {
            return res.status(400).json({ error: 'Email y contraseña son obligatorios.' });
        }
        const user = await User.findOne({ email });
        if (!user) {
            return res.status(401).json({ error: 'Credenciales inválidas.' });
        }
        const isMatch = await bcrypt.compare(password, user.password);
        if (!isMatch) {
            return res.status(401).json({ error: 'Credenciales inválidas.' });
        }
        // Generar token JWT
        const token = jwt.sign(
            { userId: user._id, email: user.email, role: user.role },
            process.env.JWT_SECRET || 'secreto',
            { expiresIn: process.env.JWT_EXPIRES_IN || '24h' }
        );
        res.json({
            message: 'Login exitoso',
            token,
            user: { _id: user._id, name: user.name, email: user.email, role: user.role }
        });
    } catch (error) {
        res.status(500).json({ error: 'Error al iniciar sesión', details: error.message });
    }
});

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

// Actualizar datos del usuario autenticado
router.put('/:id', authMiddleware, async (req, res) => {
    try {
        if (req.user.userId !== req.params.id) {
            return res.status(403).json({ error: 'No autorizado para modificar este usuario' });
        }
        const { name, phone, address } = req.body;
        const update = {};
        if (name) update.name = name;
        if (phone) update.phone = phone;
        if (address) update.address = address;
        const user = await User.findByIdAndUpdate(req.params.id, update, { new: true });
        if (!user) return res.status(404).json({ error: 'Usuario no encontrado' });
        res.json({ message: 'Usuario actualizado', user: { _id: user._id, name: user.name, email: user.email, phone: user.phone, address: user.address, role: user.role } });
    } catch (error) {
        res.status(500).json({ error: 'Error al actualizar usuario', details: error.message });
    }
});

module.exports = router; 