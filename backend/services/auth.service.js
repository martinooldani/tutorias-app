import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import { Usuario } from '../models/index.js';

async function registrar({ nombre, email, password, rol }) {
    const existente = await Usuario.findOne({ where: { email } });
    if (existente) {
        const error = new Error('El email ya está registrado');
        error.statusCode = 400;
        throw error;
    }

    const salt = await bcrypt.genSalt(12);
    const passwordHash = await bcrypt.hash(password, salt);

    const usuario = await Usuario.create({
        nombre,
        email,
        passwordHash,
        rol: rol || 'estudiante',
        activo: true
    });

    return { id: usuario.id, nombre: usuario.nombre, email: usuario.email, rol: usuario.rol };
}

async function login({ email, password }) {
    const usuario = await Usuario.findOne({ where: { email } });
    if (!usuario) {
        const error = new Error('Credenciales inválidas');
        error.statusCode = 401;
        throw error;
    }

    if (!usuario.activo) {
        const error = new Error('Usuario inactivo');
        error.statusCode = 401;
        throw error;
    }

    const esValida = await bcrypt.compare(password, usuario.passwordHash);
    if (!esValida) {
        const error = new Error('Credenciales inválidas');
        error.statusCode = 401;
        throw error;
    }

    // Access token — corta duración
    const accessToken = jwt.sign(
        { id: usuario.id, nombre: usuario.nombre, email: usuario.email, rol: usuario.rol },
        process.env.JWT_SECRET,
        { expiresIn: process.env.JWT_EXPIRES_IN }
    );

    // Refresh token — larga duración
    const refreshToken = jwt.sign(
        { id: usuario.id },
        process.env.JWT_REFRESH_SECRET,
        { expiresIn: process.env.JWT_REFRESH_EXPIRES_IN }
    );

    return { accessToken, refreshToken, usuario: { id: usuario.id, nombre: usuario.nombre, email: usuario.email, rol: usuario.rol } };
}

async function refresh(refreshToken) {
    if (!refreshToken) {
        const error = new Error('Refresh token no encontrado');
        error.statusCode = 401;
        throw error;
    }

    return new Promise((resolve, reject) => {
        jwt.verify(refreshToken, process.env.JWT_REFRESH_SECRET, async (err, decoded) => {
            if (err) {
                const error = new Error('Refresh token inválido');
                error.statusCode = 403;
                return reject(error);
            }

            const usuario = await Usuario.findByPk(decoded.id);
            if (!usuario) {
                const error = new Error('Usuario no encontrado');
                error.statusCode = 403;
                return reject(error);
            }

            const nuevoAccessToken = jwt.sign(
                { id: usuario.id, nombre: usuario.nombre, email: usuario.email, rol: usuario.rol },
                process.env.JWT_SECRET,
                { expiresIn: process.env.JWT_EXPIRES_IN }
            );

            resolve({ accessToken: nuevoAccessToken });
        });
    });
}

export const authService = { registrar, login, refresh };