import { Tutor, Usuario } from '../models/index.js';

async function listarTutores() {
    const tutores = await Tutor.findAll({
        where: { activo: true },
        attributes: ['id', 'nombre', 'email', 'especialidad', 'diasDisponibles', 'activo']
    });
    return tutores;
}

async function obtenerTutor(id) {
    const tutor = await Tutor.findByPk(id, {
        attributes: ['id', 'nombre', 'email', 'especialidad', 'diasDisponibles', 'activo']
    });
    if (!tutor) {
        const error = new Error('Tutor no encontrado');
        error.statusCode = 404;
        throw error;
    }
    return tutor;
}

export const tutoresService = { listarTutores, obtenerTutor };