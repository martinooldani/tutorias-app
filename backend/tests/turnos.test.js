import request from 'supertest';
import app from '../app.js';
import { sequelize, Usuario, Tutor, Turno } from '../models/index.js';
import bcrypt from 'bcryptjs';

let tokenAdmin;
let tokenEstudiante;
let tokenTutor;
let tutorId;
let estudianteId;

beforeAll(async () => {
    await sequelize.sync({ force: true });
    const salt = await bcrypt.genSalt(12);

    const admin = await Usuario.create({
        nombre: 'Admin Test',
        email: 'admin@test.com',
        passwordHash: await bcrypt.hash('Admin1234', salt),
        rol: 'admin',
        activo: true
    });

    const usuarioTutor = await Usuario.create({
        nombre: 'Tutor Test',
        email: 'tutor@test.com',
        passwordHash: await bcrypt.hash('Tutor1234', salt),
        rol: 'tutor',
        activo: true
    });

    const usuarioTutorInactivo = await Usuario.create({
        nombre: 'Tutor Inactivo',
        email: 'tutorinactivo@test.com',
        passwordHash: await bcrypt.hash('Tutor1234', salt),
        rol: 'tutor',
        activo: true
    });

    const usuarioEstudiante = await Usuario.create({
        nombre: 'Estudiante Test',
        email: 'estudiante@test.com',
        passwordHash: await bcrypt.hash('Estudiante1234', salt),
        rol: 'estudiante',
        activo: true
    });

    estudianteId = usuarioEstudiante.id;

    const tutor = await Tutor.create({
        usuarioId: usuarioTutor.id,
        nombre: 'Tutor Test',
        email: 'tutor@test.com',
        especialidad: 'backend',
        diasDisponibles: ['lunes', 'martes', 'miércoles', 'jueves', 'viernes'],
        activo: true
    });

    await Tutor.create({
        usuarioId: usuarioTutorInactivo.id,
        nombre: 'Tutor Inactivo',
        email: 'tutorinactivo@test.com',
        especialidad: 'frontend',
        diasDisponibles: ['lunes', 'martes'],
        activo: false
    });

    tutorId = tutor.id;

    // Obtener tokens
    const resAdmin = await request(app)
        .post('/api/auth/login')
        .send({ email: 'admin@test.com', password: 'Admin1234' });
    tokenAdmin = resAdmin.body.accessToken;

    const resTutor = await request(app)
        .post('/api/auth/login')
        .send({ email: 'tutor@test.com', password: 'Tutor1234' });
    tokenTutor = resTutor.body.accessToken;

    const resEst = await request(app)
        .post('/api/auth/login')
        .send({ email: 'estudiante@test.com', password: 'Estudiante1234' });
    tokenEstudiante = resEst.body.accessToken;
});

afterAll(async () => {
    await sequelize.close();
});

describe('GET /api/turnos', () => {

    it('devuelve listado de turnos con token válido', async () => {
        const res = await request(app)
            .get('/api/turnos')
            .set('Authorization', `Bearer ${tokenAdmin}`);

        expect(res.statusCode).toBe(200);
        expect(res.headers['content-type']).toMatch(/json/);
        expect(res.body).toHaveProperty('data');
        expect(Array.isArray(res.body.data)).toBe(true);
    });

    it('devuelve 401 sin token', async () => {
        const res = await request(app).get('/api/turnos');
        expect(res.statusCode).toBe(401);
        expect(res.body).toHaveProperty('error');
    });

    it('filtra por estado correctamente', async () => {
        await Turno.create({
            tutorId,
            estudianteId,
            fecha: '2026-06-16',
            horaInicio: '10:00',
            horaFin: '10:30',
            tema: 'Test filtro',
            modalidad: 'virtual',
            estado: 'solicitado'
        });

        const res = await request(app)
            .get('/api/turnos?estado=solicitado')
            .set('Authorization', `Bearer ${tokenAdmin}`);

        expect(res.statusCode).toBe(200);
        expect(res.body.data.every(t => t.estado === 'solicitado')).toBe(true);
    });

});

describe('GET /api/turnos/:id', () => {

    it('devuelve el detalle de un turno existente', async () => {
        const turno = await Turno.create({
            tutorId,
            estudianteId,
            fecha: '2026-06-16',
            horaInicio: '11:00',
            horaFin: '11:30',
            tema: 'Test detalle',
            modalidad: 'presencial',
            estado: 'solicitado'
        });

        const res = await request(app)
            .get(`/api/turnos/${turno.id}`)
            .set('Authorization', `Bearer ${tokenAdmin}`);

        expect(res.statusCode).toBe(200);
        expect(res.body).toHaveProperty('id', turno.id);
        expect(res.body).toHaveProperty('tema', 'Test detalle');
    });

    it('devuelve 404 para turno inexistente', async () => {
        const res = await request(app)
            .get('/api/turnos/99999')
            .set('Authorization', `Bearer ${tokenAdmin}`);

        expect(res.statusCode).toBe(404);
        expect(res.body).toHaveProperty('error');
    });

});

describe('POST /api/turnos', () => {

    it('crea un turno válido correctamente', async () => {
        const res = await request(app)
            .post('/api/turnos')
            .set('Authorization', `Bearer ${tokenEstudiante}`)
            .send({
                tutorId,
                fecha: '2026-06-15',
                horaInicio: '09:00',
                horaFin: '09:30',
                tema: 'JWT y middlewares',
                modalidad: 'virtual'
            });

        expect(res.statusCode).toBe(201);
        expect(res.body).toHaveProperty('id');
        expect(res.body.estado).toBe('solicitado');
    });

    it('devuelve 400 si horaInicio no es menor que horaFin', async () => {
        const res = await request(app)
            .post('/api/turnos')
            .set('Authorization', `Bearer ${tokenEstudiante}`)
            .send({
                tutorId,
                fecha: '2026-06-15',
                horaInicio: '10:30',
                horaFin: '10:00',
                tema: 'Horario inválido',
                modalidad: 'virtual'
            });

        expect(res.statusCode).toBe(400);
        expect(res.body).toHaveProperty('error');
    });

    it('devuelve 400 por superposición horaria del tutor', async () => {
        // Primero crear un turno
        await request(app)
            .post('/api/turnos')
            .set('Authorization', `Bearer ${tokenEstudiante}`)
            .send({
                tutorId,
                fecha: '2026-06-16',
                horaInicio: '14:00',
                horaFin: '14:30',
                tema: 'Turno base',
                modalidad: 'virtual'
            });

        // Intentar crear otro que se superpone
        const res = await request(app)
            .post('/api/turnos')
            .set('Authorization', `Bearer ${tokenEstudiante}`)
            .send({
                tutorId,
                fecha: '2026-06-16',
                horaInicio: '14:15',
                horaFin: '14:45',
                tema: 'Turno superpuesto',
                modalidad: 'virtual'
            });

        expect(res.statusCode).toBe(400);
        expect(res.body).toHaveProperty('error');
    });

    it('devuelve 400 si el tutor no está activo', async () => {
        const tutorInactivo = await Tutor.findOne({ where: { activo: false } });

        const res = await request(app)
            .post('/api/turnos')
            .set('Authorization', `Bearer ${tokenEstudiante}`)
            .send({
                tutorId: tutorInactivo.id,
                fecha: '2026-06-16',
                horaInicio: '09:00',
                horaFin: '09:30',
                tema: 'Tutor inactivo',
                modalidad: 'virtual'
            });

        expect(res.statusCode).toBe(400);
        expect(res.body).toHaveProperty('error');
    });

    it('devuelve 400 si el día no está disponible para el tutor', async () => {
        const tutorSoloLunes = await Tutor.create({
            usuarioId: estudianteId,
            nombre: 'Tutor Solo Lunes',
            email: 'sololunestest@test.com',
            especialidad: 'testing',
            diasDisponibles: ['lunes'],
            activo: true
        });

        // 2026-06-16 es martes
        const res = await request(app)
            .post('/api/turnos')
            .set('Authorization', `Bearer ${tokenEstudiante}`)
            .send({
                tutorId: tutorSoloLunes.id,
                fecha: '2026-06-17',
                horaInicio: '09:00',
                horaFin: '09:30',
                tema: 'Día no disponible',
                modalidad: 'virtual'
            });

        expect(res.statusCode).toBe(400);
        expect(res.body).toHaveProperty('error');
    });

    it('devuelve 401 sin token', async () => {
        const res = await request(app)
            .post('/api/turnos')
            .send({
                tutorId,
                fecha: '2026-06-15',
                horaInicio: '12:00',
                horaFin: '12:30',
                tema: 'Sin token',
                modalidad: 'virtual'
            });

        expect(res.statusCode).toBe(401);
        expect(res.body).toHaveProperty('error');
    });

    it('devuelve 403 si un tutor intenta crear un turno', async () => {
        const res = await request(app)
            .post('/api/turnos')
            .set('Authorization', `Bearer ${tokenTutor}`)
            .send({
                tutorId,
                fecha: '2026-06-15',
                horaInicio: '13:00',
                horaFin: '13:30',
                tema: 'Tutor no puede crear',
                modalidad: 'virtual'
            });

        expect(res.statusCode).toBe(403);
        expect(res.body).toHaveProperty('error');
    });

});

describe('PUT /api/turnos/:id — edición con reasignación', () => {

    it('devuelve 400 al reasignar a un tutor ocupado', async () => {
        const tutorOcupado = await Tutor.create({
            usuarioId: estudianteId,
            nombre: 'Tutor Ocupado',
            email: 'ocupadotest@test.com',
            especialidad: 'backend',
            diasDisponibles: ['lunes', 'martes', 'miércoles', 'jueves', 'viernes'],
            activo: true
        });

        // Crear turno con el tutor ocupado
        await Turno.create({
            tutorId: tutorOcupado.id,
            estudianteId,
            fecha: '2026-06-18',
            horaInicio: '10:00',
            horaFin: '10:30',
            tema: 'Turno bloqueante',
            modalidad: 'virtual',
            estado: 'confirmado'
        });

        // Crear el turno a editar
        const turnoAEditar = await Turno.create({
            tutorId,
            estudianteId,
            fecha: '2026-06-18',
            horaInicio: '15:00',
            horaFin: '15:30',
            tema: 'Turno a reasignar',
            modalidad: 'virtual',
            estado: 'solicitado'
        });

        // Intentar reasignar al tutor ya ocupado en esa franja
        const res = await request(app)
            .put(`/api/turnos/${turnoAEditar.id}`)
            .set('Authorization', `Bearer ${tokenAdmin}`)
            .send({
                tutorId: tutorOcupado.id,
                fecha: '2026-06-18',
                horaInicio: '10:00',
                horaFin: '10:30'
            });

        expect(res.statusCode).toBe(400);
        expect(res.body).toHaveProperty('error');
    });

});