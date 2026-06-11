import { Op } from 'sequelize';
import { Turno, Tutor, Usuario, HistorialTurno } from '../models/index.js';

// --- Helpers ---

// Devuelve el nombre del día de la semana en español para una fecha 'YYYY-MM-DD'
function obtenerDiaSemana(fecha) {
    const dias = ['domingo', 'lunes', 'martes', 'miércoles', 'jueves', 'viernes', 'sábado'];
    const [anio, mes, dia] = fecha.split('-').map(Number);
    const date = new Date(anio, mes - 1, dia);
    return dias[date.getDay()];
}

// Verifica si dos franjas horarias se superponen
// Si uno termina a las 11:00 y otro empieza a las 11:00 NO hay superposición
function haySuperposicion(inicio1, fin1, inicio2, fin2) {
    return inicio1 < fin2 && fin1 > inicio2;
}

// Valida disponibilidad del tutor: activo, día disponible, sin superposición
async function validarDisponibilidad(tutorId, fecha, horaInicio, horaFin, turnoIdIgnorar = null) {
    const tutor = await Tutor.findByPk(tutorId);

    if (!tutor) {
        const error = new Error('El tutor no existe');
        error.statusCode = 404;
        throw error;
    }

    if (!tutor.activo) {
        const error = new Error('El tutor no está activo');
        error.statusCode = 400;
        throw error;
    }

    const diaSemana = obtenerDiaSemana(fecha);
    if (!tutor.diasDisponibles.includes(diaSemana)) {
        const error = new Error(`El tutor no atiende los días ${diaSemana}`);
        error.statusCode = 400;
        throw error;
    }

    // Buscar turnos que bloquean disponibilidad (solicitado o confirmado)
    const where = {
        tutorId,
        fecha,
        estado: { [Op.in]: ['solicitado', 'confirmado'] }
    };

    // Al editar, ignorar el propio turno
    if (turnoIdIgnorar) {
        where.id = { [Op.ne]: turnoIdIgnorar };
    }

    const turnosExistentes = await Turno.findAll({ where });

    for (const turno of turnosExistentes) {
        if (haySuperposicion(horaInicio, horaFin, turno.horaInicio, turno.horaFin)) {
            const error = new Error('El tutor ya tiene un turno en esa franja horaria');
            error.statusCode = 400;
            throw error;
        }
    }
}

// Registra un cambio en el historial
async function registrarHistorial(turnoId, usuarioId, accion, valorAnterior, valorNuevo) {
    await HistorialTurno.create({
        turnoId,
        usuarioId,
        accion,
        fechaHora: new Date().toISOString(),
        valorAnterior: valorAnterior ? JSON.stringify(valorAnterior) : null,
        valorNuevo: valorNuevo ? JSON.stringify(valorNuevo) : null
    });
}

// --- Servicio principal ---

async function listarTurnos({ fecha, estado, tutorId, especialidad, page, limit, sortBy, order }) {
    const where = {};
    if (fecha)   where.fecha   = fecha;
    if (estado)  where.estado  = estado;
    if (tutorId) where.tutorId = tutorId;

    const pageNum  = parseInt(page)  || 1;
    const limitNum = parseInt(limit) || 10;
    const offset   = (pageNum - 1) * limitNum;
    const campoOrden = sortBy || 'fecha';
    const direccion  = order === 'desc' ? 'DESC' : 'ASC';

    const include = [
        { model: Tutor,    attributes: ['id', 'nombre', 'especialidad'] },
        { model: Usuario,  as: 'estudiante', attributes: ['id', 'nombre', 'email'] }
    ];

    // Filtro por especialidad (requiere join con Tutor)
    if (especialidad) {
        include[0].where = { especialidad };
    }

    const { count, rows } = await Turno.findAndCountAll({
        where,
        include,
        limit: limitNum,
        offset,
        order: [[campoOrden, direccion]]
    });

    return {
        total: count,
        page: pageNum,
        limit: limitNum,
        totalPages: Math.ceil(count / limitNum),
        data: rows
    };
}

async function obtenerTurno(id) {
    const turno = await Turno.findByPk(id, {
        include: [
            { model: Tutor,   attributes: ['id', 'nombre', 'especialidad'] },
            { model: Usuario, as: 'estudiante', attributes: ['id', 'nombre', 'email'] }
        ]
    });
    if (!turno) {
        const error = new Error('Turno no encontrado');
        error.statusCode = 404;
        throw error;
    }
    return turno;
}

async function obtenerHistorial(turnoId) {
    const turno = await Turno.findByPk(turnoId);
    if (!turno) {
        const error = new Error('Turno no encontrado');
        error.statusCode = 404;
        throw error;
    }

    const historial = await HistorialTurno.findAll({
        where: { turnoId },
        include: [{ model: Usuario, attributes: ['id', 'nombre', 'rol'] }],
        order: [['fechaHora', 'ASC']]
    });
    return historial;
}

async function crearTurno({ tutorId, estudianteId, fecha, horaInicio, horaFin, tema, modalidad, observaciones }) {
    if (horaInicio >= horaFin) {
        const error = new Error('La hora de inicio debe ser menor que la hora de fin');
        error.statusCode = 400;
        throw error;
    }

    await validarDisponibilidad(tutorId, fecha, horaInicio, horaFin);

    const turno = await Turno.create({
        tutorId,
        estudianteId,
        fecha,
        horaInicio,
        horaFin,
        tema,
        modalidad,
        observaciones,
        estado: 'solicitado'
    });

    await registrarHistorial(turno.id, estudianteId, 'creacion', null, { estado: 'solicitado' });

    return turno;
}

async function editarTurno(id, usuarioReq, { tutorId, fecha, horaInicio, horaFin, tema, modalidad, observaciones }) {
    const turno = await Turno.findByPk(id);
    if (!turno) {
        const error = new Error('Turno no encontrado');
        error.statusCode = 404;
        throw error;
    }

    // Turno realizado: solo se pueden editar observaciones
    if (turno.estado === 'realizado') {
        if (observaciones !== undefined) {
            const anterior = { observaciones: turno.observaciones };
            await turno.update({ observaciones });
            await registrarHistorial(id, usuarioReq.id, 'edicion', anterior, { observaciones });
            return turno;
        }
        const error = new Error('Un turno realizado solo permite editar observaciones');
        error.statusCode = 400;
        throw error;
    }

    if (turno.estado === 'cancelado') {
        const error = new Error('No se puede editar un turno cancelado');
        error.statusCode = 400;
        throw error;
    }

    const nuevoTutorId    = tutorId    || turno.tutorId;
    const nuevaFecha      = fecha      || turno.fecha;
    const nuevoHoraInicio = horaInicio || turno.horaInicio;
    const nuevoHoraFin    = horaFin    || turno.horaFin;

    if (nuevoHoraInicio >= nuevoHoraFin) {
        const error = new Error('La hora de inicio debe ser menor que la hora de fin');
        error.statusCode = 400;
        throw error;
    }

    await validarDisponibilidad(nuevoTutorId, nuevaFecha, nuevoHoraInicio, nuevoHoraFin, id);

    const anterior = {
        tutorId: turno.tutorId,
        fecha: turno.fecha,
        horaInicio: turno.horaInicio,
        horaFin: turno.horaFin,
        tema: turno.tema,
        modalidad: turno.modalidad
    };

    await turno.update({
        tutorId:    nuevoTutorId,
        fecha:      nuevaFecha,
        horaInicio: nuevoHoraInicio,
        horaFin:    nuevoHoraFin,
        tema:       tema       || turno.tema,
        modalidad:  modalidad  || turno.modalidad,
        observaciones: observaciones !== undefined ? observaciones : turno.observaciones
    });

    await registrarHistorial(id, usuarioReq.id, 'edicion', anterior, { tutorId: nuevoTutorId, fecha: nuevaFecha });

    return turno;
}

async function cancelarTurno(id, usuarioReq) {
    const turno = await Turno.findByPk(id);
    if (!turno) {
        const error = new Error('Turno no encontrado');
        error.statusCode = 404;
        throw error;
    }

    if (!['solicitado', 'confirmado'].includes(turno.estado)) {
        const error = new Error('Solo se pueden cancelar turnos solicitados o confirmados');
        error.statusCode = 400;
        throw error;
    }

    // Estudiante solo puede cancelar sus propios turnos
    if (usuarioReq.rol === 'estudiante' && turno.estudianteId !== usuarioReq.id) {
        const error = new Error('No tiene permisos para cancelar este turno');
        error.statusCode = 403;
        throw error;
    }

    const anterior = { estado: turno.estado };
    await turno.update({ estado: 'cancelado' });
    await registrarHistorial(id, usuarioReq.id, 'cancelacion', anterior, { estado: 'cancelado' });

    return turno;
}

async function confirmarTurno(id, usuarioReq) {
    const turno = await Turno.findByPk(id);
    if (!turno) {
        const error = new Error('Turno no encontrado');
        error.statusCode = 404;
        throw error;
    }

    if (turno.estado !== 'solicitado') {
        const error = new Error('Solo se pueden confirmar turnos solicitados');
        error.statusCode = 400;
        throw error;
    }

    // Solo el tutor asignado o un admin puede confirmar
    if (usuarioReq.rol === 'tutor') {
        const tutor = await Tutor.findOne({ where: { usuarioId: usuarioReq.id } });
        if (!tutor || tutor.id !== turno.tutorId) {
            const error = new Error('No tiene permisos para confirmar este turno');
            error.statusCode = 403;
            throw error;
        }
    }

    const anterior = { estado: turno.estado };
    await turno.update({ estado: 'confirmado' });
    await registrarHistorial(id, usuarioReq.id, 'confirmacion', anterior, { estado: 'confirmado' });

    return turno;
}

async function realizarTurno(id, usuarioReq) {
    const turno = await Turno.findByPk(id);
    if (!turno) {
        const error = new Error('Turno no encontrado');
        error.statusCode = 404;
        throw error;
    }

    if (turno.estado !== 'confirmado') {
        const error = new Error('Solo se pueden realizar turnos confirmados');
        error.statusCode = 400;
        throw error;
    }

    // Solo el tutor asignado o un admin puede marcar como realizado
    if (usuarioReq.rol === 'tutor') {
        const tutor = await Tutor.findOne({ where: { usuarioId: usuarioReq.id } });
        if (!tutor || tutor.id !== turno.tutorId) {
            const error = new Error('No tiene permisos para realizar este turno');
            error.statusCode = 403;
            throw error;
        }
    }

    const anterior = { estado: turno.estado };
    await turno.update({ estado: 'realizado' });
    await registrarHistorial(id, usuarioReq.id, 'realizacion', anterior, { estado: 'realizado' });

    return turno;
}

async function obtenerResumen() {
    const hoy = new Date().toISOString().split('T')[0];

    const turnosHoy = await Turno.findAll({
        where: { fecha: hoy },
        include: [{ model: Tutor, attributes: ['nombre', 'especialidad'] }]
    });

    const pendientes = await Turno.findAll({
        where: { estado: 'solicitado' },
        include: [{ model: Tutor, attributes: ['nombre', 'especialidad'] }]
    });

    // Turnos por tutor
    const todosTurnos = await Turno.findAll({
        include: [{ model: Tutor, attributes: ['id', 'nombre'] }]
    });

    const porTutor = {};
    for (const t of todosTurnos) {
        const nombre = t.Tutor?.nombre || 'Sin tutor';
        porTutor[nombre] = (porTutor[nombre] || 0) + 1;
    }

    // Temas más solicitados
    const temas = {};
    for (const t of todosTurnos) {
        temas[t.tema] = (temas[t.tema] || 0) + 1;
    }
    const temasOrdenados = Object.entries(temas)
        .sort((a, b) => b[1] - a[1])
        .slice(0, 5)
        .map(([tema, cantidad]) => ({ tema, cantidad }));

    return {
        turnosHoy: turnosHoy.length,
        turnosPendientesConfirmacion: pendientes.length,
        turnosPorTutor: porTutor,
        temasMasSolicitados: temasOrdenados
    };
}

export const turnosService = {
    listarTurnos,
    obtenerTurno,
    obtenerHistorial,
    crearTurno,
    editarTurno,
    cancelarTurno,
    confirmarTurno,
    realizarTurno,
    obtenerResumen
};