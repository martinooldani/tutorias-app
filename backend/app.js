import 'dotenv/config';
import express from 'express';
import helmet from 'helmet';
import cors from 'cors';
import cookieParser from 'cookie-parser';
import rateLimit from 'express-rate-limit';
import 'express-async-errors';

import authRoutes from './routes/auth.routes.js';
import tutoresRoutes from './routes/tutores.routes.js';
import turnosRoutes from './routes/turnos.routes.js';
import errorHandler from './middleware/errorHandler.js';

const app = express();

// --- Seguridad ---
app.use(helmet());
app.use(cors({
    origin: process.env.FRONTEND_URL || 'http://localhost:5173',
    credentials: true
}));

// --- Rate limiting ---
const generalLimiter = rateLimit({
    windowMs: 15 * 60 * 1000,
    max: 100
});
const loginLimiter = rateLimit({
    windowMs: 15 * 60 * 1000,
    max: 5,
    message: { error: 'Demasiados intentos, intente en 15 minutos' }
});

app.use('/api/', generalLimiter);
app.use('/api/auth/login', loginLimiter);

// --- Parsers ---
app.use(express.json());
app.use(cookieParser());

// --- Rutas ---
app.use(authRoutes);
app.use(tutoresRoutes);
app.use(turnosRoutes);

// --- Middleware de errores (siempre al final) ---
app.use(errorHandler);

export default app;