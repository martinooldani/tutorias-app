import 'dotenv/config';
import bcrypt from 'bcryptjs';
import { sequelize, Usuario, Tutor, Turno, HistorialTurno } from '../models/index.js';

async function seed() {
    await sequelize.sync({ force: true }); // borra y recrea las tablas
    console.log('Base de datos sincronizada');

    // --- USUARIOS ---
    const salt = await bcrypt.genSalt(12);

    const admin = await Usuario.create({
        nombre: 'Admin Sistema',
        email: 'admin@tutorias.com',
        passwordHash: await bcrypt.hash('Admin1234', salt),
        rol: 'admin',
        activo: true
    });

    const usuarioTutor1 = await Usuario.create({
        nombre: 'Marina López',
        email: 'marina@tutorias.com',
        passwordHash: await bcrypt.hash('Tutor1234', salt),
        rol: 'tutor',
        activo: true
    });

    const usuarioTutor2 = await Usuario.create({
        nombre: 'Carlos Pérez',
        email: 'carlos@tutorias.com',
        passwordHash: await bcrypt.hash('Tutor1234', salt),
        rol: 'tutor',
        activo: true
    });

    const usuarioTutor3 = await Usuario.create({
        nombre: 'Sofía Ríos',
        email: 'sofia@tutorias.com',
        passwordHash: await bcrypt.hash('Tutor1234', salt),
        rol: 'tutor',
        activo: true
    });

    const usuarioTutor4 = await Usuario.create({
        nombre: 'Diego Fernández',
        email: 'diego@tutorias.com',
        passwordHash: await bcrypt.hash('Tutor1234', salt),
        rol: 'tutor',
        activo: true
    });

    const usuarioTutor5 = await Usuario.create({
        nombre: 'Laura Gómez',
        email: 'laura@tutorias.com',
        passwordHash: await bcrypt.hash('Tutor1234', salt),
        rol: 'tutor',
        activo: false // tutor inactivo para probar validación
    });

    const estudiante1 = await Usuario.create({
        nombre: 'Juan García',
        email: 'juan@tutorias.com',
        passwordHash: await bcrypt.hash('Estudiante1234', salt),
        rol: 'estudiante',
        activo: true
    });

    const estudiante2 = await Usuario.create({
        nombre: 'Valentina Cruz',
        email: 'vale@tutorias.com',
        passwordHash: await bcrypt.hash('Estudiante1234', salt),
        rol: 'estudiante',
        activo: true
    });

    const estudiante3 = await Usuario.create({
        nombre: 'Mateo Silva',
        email: 'mateo@tutorias.com',
        passwordHash: await bcrypt.hash('Estudiante1234', salt),
        rol: 'estudiante',
        activo: true
    });

    console.log('Usuarios creados');

    // --- TUTORES ---
    const tutor1 = await Tutor.create({
        usuarioId: usuarioTutor1.id,
        nombre: 'Marina López',
        email: 'marina@tutorias.com',
        especialidad: 'backend',
        diasDisponibles: ['lunes', 'miércoles', 'viernes'],
        activo: true
    });

    const tutor2 = await Tutor.create({
        usuarioId: usuarioTutor2.id,
        nombre: 'Carlos Pérez',
        email: 'carlos@tutorias.com',
        especialidad: 'frontend',
        diasDisponibles: ['martes', 'jueves'],
        activo: true
    });

    const tutor3 = await Tutor.create({
        usuarioId: usuarioTutor3.id,
        nombre: 'Sofía Ríos',
        email: 'sofia@tutorias.com',
        especialidad: 'testing',
        diasDisponibles: ['lunes', 'martes', 'miércoles', 'jueves', 'viernes'],
        activo: true
    });

    const tutor4 = await Tutor.create({
        usuarioId: usuarioTutor4.id,
        nombre: 'Diego Fernández',
        email: 'diego@tutorias.com',
        especialidad: 'seguridad',
        diasDisponibles: ['lunes', 'jueves'],
        activo: true
    });

    const tutor5 = await Tutor.create({
        usuarioId: usuarioTutor5.id,
        nombre: 'Laura Gómez',
        email: 'laura@tutorias.com',
        especialidad: 'frontend',
        diasDisponibles: ['martes', 'viernes'],
        activo: false // inactivo
    });

    console.log('Tutores creados');

    // --- TURNOS (12 en distintos estados) ---
    const t1 = await Turno.create({
        tutorId: tutor1.id,
        estudianteId: estudiante1.id,
        fecha: '2026-06-16', // lunes
        horaInicio: '10:00',
        horaFin: '10:30',
        tema: 'JWT y middlewares',
        modalidad: 'virtual',
        estado: 'solicitado'
    });

    const t2 = await Turno.create({
        tutorId: tutor1.id,
        estudianteId: estudiante2.id,
        fecha: '2026-06-16', // lunes
        horaInicio: '11:00',
        horaFin: '11:30',
        tema: 'Express Router',
        modalidad: 'presencial',
        estado: 'confirmado'
    });

    const t3 = await Turno.create({
        tutorId: tutor1.id,
        estudianteId: estudiante3.id,
        fecha: '2026-06-18', // miércoles
        horaInicio: '09:00',
        horaFin: '09:30',
        tema: 'Sequelize relaciones',
        modalidad: 'virtual',
        estado: 'realizado',
        observaciones: 'Excelente clase'
    });

    const t4 = await Turno.create({
        tutorId: tutor2.id,
        estudianteId: estudiante1.id,
        fecha: '2026-06-17', // martes
        horaInicio: '14:00',
        horaFin: '14:30',
        tema: 'React Hook Form',
        modalidad: 'virtual',
        estado: 'confirmado'
    });

    const t5 = await Turno.create({
        tutorId: tutor2.id,
        estudianteId: estudiante2.id,
        fecha: '2026-06-17', // martes
        horaInicio: '15:00',
        horaFin: '15:30',
        tema: 'Axios e interceptores',
        modalidad: 'presencial',
        estado: 'cancelado',
        observaciones: 'Cancelado por el estudiante'
    });

    const t6 = await Turno.create({
        tutorId: tutor2.id,
        estudianteId: estudiante3.id,
        fecha: '2026-06-19', // jueves
        horaInicio: '10:00',
        horaFin: '10:30',
        tema: 'Context API',
        modalidad: 'virtual',
        estado: 'solicitado'
    });

    const t7 = await Turno.create({
        tutorId: tutor3.id,
        estudianteId: estudiante1.id,
        fecha: '2026-06-16', // lunes
        horaInicio: '16:00',
        horaFin: '16:30',
        tema: 'Jest y Supertest',
        modalidad: 'virtual',
        estado: 'solicitado'
    });

    const t8 = await Turno.create({
        tutorId: tutor3.id,
        estudianteId: estudiante2.id,
        fecha: '2026-06-17', // martes
        horaInicio: '09:00',
        horaFin: '09:30',
        tema: 'Testing de API',
        modalidad: 'presencial',
        estado: 'confirmado'
    });

    const t9 = await Turno.create({
        tutorId: tutor3.id,
        estudianteId: estudiante3.id,
        fecha: '2026-06-18', // miércoles
        horaInicio: '14:00',
        horaFin: '14:30',
        tema: 'Mocks en Jest',
        modalidad: 'virtual',
        estado: 'realizado',
        observaciones: 'El estudiante comprendió los mocks'
    });

    const t10 = await Turno.create({
        tutorId: tutor4.id,
        estudianteId: estudiante1.id,
        fecha: '2026-06-16', // lunes
        horaInicio: '13:00',
        horaFin: '13:30',
        tema: 'CORS y Helmet',
        modalidad: 'virtual',
        estado: 'confirmado'
    });

    const t11 = await Turno.create({
        tutorId: tutor4.id,
        estudianteId: estudiante2.id,
        fecha: '2026-06-19', // jueves
        horaInicio: '11:00',
        horaFin: '11:30',
        tema: 'bcrypt y JWT',
        modalidad: 'presencial',
        estado: 'solicitado'
    });

    const t12 = await Turno.create({
        tutorId: tutor4.id,
        estudianteId: estudiante3.id,
        fecha: '2026-06-19', // jueves
        horaInicio: '15:00',
        horaFin: '15:30',
        tema: 'Rate limiting',
        modalidad: 'virtual',
        estado: 'cancelado',
        observaciones: 'Tutor no disponible ese día'
    });

    console.log('Turnos creados');

    // --- HISTORIAL para algunos turnos ---
    const ahora = new Date().toISOString();

    await HistorialTurno.create({
        turnoId: t1.id,
        usuarioId: estudiante1.id,
        accion: 'creacion',
        fechaHora: ahora,
        valorAnterior: null,
        valorNuevo: JSON.stringify({ estado: 'solicitado' })
    });

    await HistorialTurno.create({
        turnoId: t2.id,
        usuarioId: estudiante2.id,
        accion: 'creacion',
        fechaHora: ahora,
        valorAnterior: null,
        valorNuevo: JSON.stringify({ estado: 'solicitado' })
    });

    await HistorialTurno.create({
        turnoId: t2.id,
        usuarioId: usuarioTutor1.id,
        accion: 'confirmacion',
        fechaHora: ahora,
        valorAnterior: JSON.stringify({ estado: 'solicitado' }),
        valorNuevo: JSON.stringify({ estado: 'confirmado' })
    });

    await HistorialTurno.create({
        turnoId: t3.id,
        usuarioId: estudiante3.id,
        accion: 'creacion',
        fechaHora: ahora,
        valorAnterior: null,
        valorNuevo: JSON.stringify({ estado: 'solicitado' })
    });

    await HistorialTurno.create({
        turnoId: t3.id,
        usuarioId: usuarioTutor1.id,
        accion: 'realizacion',
        fechaHora: ahora,
        valorAnterior: JSON.stringify({ estado: 'confirmado' }),
        valorNuevo: JSON.stringify({ estado: 'realizado' })
    });

    console.log('Historial creado');
    console.log('✅ Semilla completada exitosamente');
    console.log('');
    console.log('Usuarios de prueba:');
    console.log('  admin@tutorias.com     / Admin1234       (admin)');
    console.log('  marina@tutorias.com    / Tutor1234       (tutor)');
    console.log('  juan@tutorias.com      / Estudiante1234  (estudiante)');

    process.exit(0);
}

seed().catch((err) => {
    console.error('Error en seed:', err);
    process.exit(1);
});