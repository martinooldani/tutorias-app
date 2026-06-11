import request from 'supertest';
import app from '../app.js';
import { sequelize } from '../models/index.js';
import bcrypt from 'bcryptjs';
import { Usuario } from '../models/index.js';

beforeAll(async () => {
    await sequelize.sync({ force: true });
    const salt = await bcrypt.genSalt(12);
    await Usuario.create({
        nombre: 'Test Admin',
        email: 'testadmin@test.com',
        passwordHash: await bcrypt.hash('Admin1234', salt),
        rol: 'admin',
        activo: true
    });
    await Usuario.create({
        nombre: 'Test Estudiante',
        email: 'testestudiante@test.com',
        passwordHash: await bcrypt.hash('Estudiante1234', salt),
        rol: 'estudiante',
        activo: true
    });
});

afterAll(async () => {
    await sequelize.close();
});

describe('POST /api/auth/login', () => {

    it('login correcto devuelve accessToken y datos del usuario', async () => {
        const res = await request(app)
            .post('/api/auth/login')
            .send({ email: 'testadmin@test.com', password: 'Admin1234' });

        expect(res.statusCode).toBe(200);
        expect(res.headers['content-type']).toMatch(/json/);
        expect(res.body).toHaveProperty('accessToken');
        expect(res.body).toHaveProperty('usuario');
        expect(res.body.usuario.rol).toBe('admin');
    });

    it('login con password incorrecta devuelve 401', async () => {
        const res = await request(app)
            .post('/api/auth/login')
            .send({ email: 'testadmin@test.com', password: 'wrongpassword' });

        expect(res.statusCode).toBe(401);
        expect(res.body).toHaveProperty('error');
    });

    it('login con email inexistente devuelve 401', async () => {
        const res = await request(app)
            .post('/api/auth/login')
            .send({ email: 'noexiste@test.com', password: 'Admin1234' });

        expect(res.statusCode).toBe(401);
        expect(res.body).toHaveProperty('error');
    });

    it('login sin email devuelve 400', async () => {
        const res = await request(app)
            .post('/api/auth/login')
            .send({ password: 'Admin1234' });

        expect(res.statusCode).toBe(400);
        expect(res.body).toHaveProperty('error');
    });

});

describe('POST /api/auth/register', () => {

    it('registro correcto devuelve 201', async () => {
        const res = await request(app)
            .post('/api/auth/register')
            .send({
                nombre: 'Nuevo Usuario',
                email: 'nuevo@test.com',
                password: 'Nuevo1234'
            });

        expect(res.statusCode).toBe(201);
        expect(res.body).toHaveProperty('usuario');
        expect(res.body.usuario.email).toBe('nuevo@test.com');
    });

    it('registro con email duplicado devuelve 400', async () => {
        const res = await request(app)
            .post('/api/auth/register')
            .send({
                nombre: 'Otro Usuario',
                email: 'testadmin@test.com',
                password: 'Admin1234'
            });

        expect(res.statusCode).toBe(400);
        expect(res.body).toHaveProperty('error');
    });

});