import { turnosService } from '../services/turnos.service.js';

async function getAll(req, res, next) {
    try {
        const { fecha, estado, tutorId, especialidad, page, limit, sortBy, order } = req.query;
        const resultado = await turnosService.listarTurnos({
            fecha, estado, tutorId, especialidad, page, limit, sortBy, order
        });
        res.json(resultado);
    } catch (error) {
        next(error);
    }
}

async function getResumen(req, res, next) {
    try {
        const resumen = await turnosService.obtenerResumen();
        res.json(resumen);
    } catch (error) {
        next(error);
    }
}

async function getOne(req, res, next) {
    try {
        const turno = await turnosService.obtenerTurno(req.params.id);
        res.json(turno);
    } catch (error) {
        next(error);
    }
}

async function getHistorial(req, res, next) {
    try {
        const historial = await turnosService.obtenerHistorial(req.params.id);
        res.json(historial);
    } catch (error) {
        next(error);
    }
}

async function create(req, res, next) {
    try {
        const { tutorId, fecha, horaInicio, horaFin, tema, modalidad, observaciones } = req.body;
        const turno = await turnosService.crearTurno({
            tutorId,
            estudianteId: req.user.id,
            fecha,
            horaInicio,
            horaFin,
            tema,
            modalidad,
            observaciones
        });
        res.status(201).json(turno);
    } catch (error) {
        next(error);
    }
}

async function update(req, res, next) {
    try {
        const turno = await turnosService.editarTurno(
            req.params.id,
            req.user,
            req.body
        );
        res.json(turno);
    } catch (error) {
        next(error);
    }
}

async function cancelar(req, res, next) {
    try {
        const turno = await turnosService.cancelarTurno(req.params.id, req.user);
        res.json(turno);
    } catch (error) {
        next(error);
    }
}

async function confirmar(req, res, next) {
    try {
        const turno = await turnosService.confirmarTurno(req.params.id, req.user);
        res.json(turno);
    } catch (error) {
        next(error);
    }
}

async function realizar(req, res, next) {
    try {
        const turno = await turnosService.realizarTurno(req.params.id, req.user);
        res.json(turno);
    } catch (error) {
        next(error);
    }
}

export const turnosController = {
    getAll,
    getResumen,
    getOne,
    getHistorial,
    create,
    update,
    cancelar,
    confirmar,
    realizar
};