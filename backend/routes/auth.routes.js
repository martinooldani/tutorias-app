import express from 'express';
import { body } from 'express-validator';
import { authController } from '../controllers/auth.controller.js';
import authenticateToken from '../middleware/authenticateToken.js';
import validate from '../middleware/validate.js';

const router = express.Router();

router.post('/api/auth/register',
    body('nombre').trim().notEmpty().withMessage('El nombre es obligatorio'),
    body('email').isEmail().withMessage('Email inválido'),
    body('password')
        .isLength({ min: 6 })
        .withMessage('La contraseña debe tener al menos 6 caracteres'),
    validate,
    authController.register
);

router.post('/api/auth/login',
    body('email').isEmail().withMessage('Email inválido'),
    body('password').notEmpty().withMessage('La contraseña es obligatoria'),
    validate,
    authController.login
);

router.post('/api/auth/refresh', authController.refresh);

router.post('/api/auth/logout', authenticateToken, authController.logout);

export default router;