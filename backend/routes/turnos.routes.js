import express from 'express';
import { body } from 'express-validator';
import { turnosController } from '../controllers/turnos.controller.js';
import authenticateToken from '../middleware/authenticateToken.js';
import authorizeRole from '../middleware/authorizeRole.js';
import validate from '../middleware/validate.js';

const router = express.Router();

// Listado con filtros — cualquier usuario autenticado
router.get('/api/turnos',
    authenticateToken,
    turnosController.getAll
);

// Resumen admin — solo admin
// OJO: debe ir ANTES de /:id para que Express no confunda 'resumen' con un id
router.get('/api/turnos/resumen',
    authenticateToken,
    authorizeRole('admin'),
    turnosController.getResumen
);

// Detalle de un turno
router.get('/api/turnos/:id',
    authenticateToken,
    turnosController.getOne
);

// Historial de un turno
router.get('/api/turnos/:id/historial',
    authenticateToken,
    turnosController.getHistorial
);

// Crear turno — solo estudiantes
router.post('/api/turnos',
    authenticateToken,
    authorizeRole('estudiante', 'admin'),
    body('tutorId').notEmpty().withMessage('El tutorId es obligatorio'),
    body('fecha').notEmpty().withMessage('La fecha es obligatoria'),
    body('horaInicio').notEmpty().withMessage('La hora de inicio es obligatoria'),
    body('horaFin').notEmpty().withMessage('La hora de fin es obligatoria'),
    body('tema').trim().notEmpty().withMessage('El tema es obligatorio'),
    body('modalidad')
        .isIn(['presencial', 'virtual'])
        .withMessage('La modalidad debe ser presencial o virtual'),
    validate,
    turnosController.create
);

// Editar turno
router.put('/api/turnos/:id',
    authenticateToken,
    authorizeRole('estudiante', 'tutor', 'admin'),
    turnosController.update
);

// Cancelar turno — estudiante (el suyo), tutor (el suyo) o admin
router.patch('/api/turnos/:id/cancelar',
    authenticateToken,
    authorizeRole('estudiante', 'tutor', 'admin'),
    turnosController.cancelar
);

// Confirmar turno — tutor asignado o admin
router.patch('/api/turnos/:id/confirmar',
    authenticateToken,
    authorizeRole('tutor', 'admin'),
    turnosController.confirmar
);

// Marcar como realizado — tutor asignado o admin
router.patch('/api/turnos/:id/realizar',
    authenticateToken,
    authorizeRole('tutor', 'admin'),
    turnosController.realizar
);

export default router;