import { tutoresService } from '../services/tutores.service.js';

async function getAll(req, res, next) {
    try {
        const tutores = await tutoresService.listarTutores();
        res.json(tutores);
    } catch (error) {
        next(error);
    }
}

async function getOne(req, res, next) {
    try {
        const tutor = await tutoresService.obtenerTutor(req.params.id);
        res.json(tutor);
    } catch (error) {
        next(error);
    }
}

export const tutoresController = { getAll, getOne };