import { useForm } from 'react-hook-form';
import { useNavigate, useParams } from 'react-router-dom';
import { useEffect, useState } from 'react';
import { turnosService } from '../../services/turnos.service.js';
import { tutoresService } from '../../services/tutores.service.js';

function FormularioTurno() {
    const { id } = useParams();
    const navigate = useNavigate();
    const esEdicion = Boolean(id);
    const [tutores, setTutores] = useState([]);
    const [errorServidor, setErrorServidor] = useState(null);

    const {
        register,
        handleSubmit,
        reset,
        formState: { errors, isSubmitting, isValid }
    } = useForm({
        defaultValues: {
            id: 0,
            tutorId: '',
            fecha: '',
            horaInicio: '',
            horaFin: '',
            tema: '',
            modalidad: 'virtual',
            observaciones: ''
        }
    });

    useEffect(() => {
        cargarTutores();
        if (esEdicion) cargarTurno();
    }, [id]);

    async function cargarTutores() {
        try {
            const data = await tutoresService.BuscarTodos();
            setTutores(data);
        } catch (error) {
            console.error('Error al cargar tutores:', error);
        }
    }

    async function cargarTurno() {
        try {
            const turno = await turnosService.BuscarUno(id);
            reset({
                id: turno.id,
                tutorId: turno.tutorId,
                fecha: turno.fecha,
                horaInicio: turno.horaInicio,
                horaFin: turno.horaFin,
                tema: turno.tema,
                modalidad: turno.modalidad,
                observaciones: turno.observaciones || ''
            });
        } catch (error) {
            console.error('Error al cargar turno:', error);
        }
    }

    const onSubmit = async (data) => {
        try {
            setErrorServidor(null);
            await turnosService.Grabar(data);
            navigate('/turnos');
        } catch (error) {
            setErrorServidor(
                error.response?.data?.error || 'Error al guardar el turno'
            );
        }
    };

    return (
        <div>
            <h2>{esEdicion ? 'Editar turno' : 'Solicitar turno'}</h2>

            <div className="panel">
                <form onSubmit={handleSubmit(onSubmit)} className="form">
                    <input type="hidden" {...register('id')} />

                    <div className="field">
                        <label className="field__label" htmlFor="tutorId">Tutor</label>
                        <select
                            id="tutorId"
                            className="input"
                            {...register('tutorId', { required: 'Seleccioná un tutor' })}
                        >
                            <option value="">— Seleccioná un tutor —</option>
                            {tutores.map(t => (
                                <option key={t.id} value={t.id}>
                                    {t.nombre} — {t.especialidad} ({t.diasDisponibles?.join(', ')})
                                </option>
                            ))}
                        </select>
                        {errors.tutorId && <p className="field__error">{errors.tutorId.message}</p>}
                    </div>

                    <div className="field">
                        <label className="field__label" htmlFor="fecha">Fecha</label>
                        <input
                            id="fecha"
                            type="date"
                            className="input"
                            {...register('fecha', { required: 'La fecha es obligatoria' })}
                        />
                        {errors.fecha && <p className="field__error">{errors.fecha.message}</p>}
                    </div>

                    <div className="field-row">
                        <div className="field">
                            <label className="field__label" htmlFor="horaInicio">Hora inicio</label>
                            <input
                                id="horaInicio"
                                type="time"
                                className="input"
                                {...register('horaInicio', { required: 'Obligatorio' })}
                            />
                            {errors.horaInicio && <p className="field__error">{errors.horaInicio.message}</p>}
                        </div>
                        <div className="field">
                            <label className="field__label" htmlFor="horaFin">Hora fin</label>
                            <input
                                id="horaFin"
                                type="time"
                                className="input"
                                {...register('horaFin', { required: 'Obligatorio' })}
                            />
                            {errors.horaFin && <p className="field__error">{errors.horaFin.message}</p>}
                        </div>
                    </div>

                    <div className="field">
                        <label className="field__label" htmlFor="tema">Tema</label>
                        <input
                            id="tema"
                            type="text"
                            className="input"
                            placeholder="Ej: JWT y middlewares"
                            {...register('tema', { required: 'El tema es obligatorio' })}
                        />
                        {errors.tema && <p className="field__error">{errors.tema.message}</p>}
                    </div>

                    <div className="field">
                        <label className="field__label" htmlFor="modalidad">Modalidad</label>
                        <select
                            id="modalidad"
                            className="input"
                            {...register('modalidad', { required: 'La modalidad es obligatoria' })}
                        >
                            <option value="virtual">Virtual</option>
                            <option value="presencial">Presencial</option>
                        </select>
                        {errors.modalidad && <p className="field__error">{errors.modalidad.message}</p>}
                    </div>

                    <div className="field">
                        <label className="field__label" htmlFor="observaciones">Observaciones (opcional)</label>
                        <textarea
                            id="observaciones"
                            className="input"
                            {...register('observaciones')}
                        />
                    </div>

                    {errorServidor && <p className="form-error">{errorServidor}</p>}

                    <div className="form__actions">
                        <button type="button" onClick={() => navigate('/turnos')} className="btn btn--secondary">
                            Cancelar
                        </button>
                        <button type="submit" disabled={!isValid || isSubmitting} className="btn btn--primary">
                            {isSubmitting ? 'Guardando...' : esEdicion ? 'Guardar cambios' : 'Solicitar turno'}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
}

export default FormularioTurno;