import { authService } from '../services/auth.service.js';

async function register(req, res, next) {
    try {
        const { nombre, email, password, rol } = req.body;
        const usuario = await authService.registrar({ nombre, email, password, rol });
        res.status(201).json({ message: 'Usuario registrado correctamente', usuario });
    } catch (error) {
        next(error);
    }
}

async function login(req, res, next) {
    try {
        const { email, password } = req.body;
        const { accessToken, refreshToken, usuario } = await authService.login({ email, password });

        res.cookie('refreshToken', refreshToken, {
            httpOnly: true,
            secure: process.env.NODE_ENV === 'production',
            sameSite: 'Strict',
            maxAge: 7 * 24 * 60 * 60 * 1000
        });

        res.json({ accessToken, usuario });
    } catch (error) {
        next(error);
    }
}

async function refresh(req, res, next) {
    try {
        const refreshToken = req.cookies.refreshToken;
        const resultado = await authService.refresh(refreshToken);
        res.json(resultado);
    } catch (error) {
        next(error);
    }
}

async function logout(req, res) {
    res.clearCookie('refreshToken', {
        httpOnly: true,
        secure: process.env.NODE_ENV === 'production',
        sameSite: 'Strict'
    });
    res.json({ message: 'Sesión cerrada' });
}

export const authController = { register, login, refresh, logout };