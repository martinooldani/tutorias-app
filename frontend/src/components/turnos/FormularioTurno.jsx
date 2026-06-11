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
        <div style={styles.container}>
            <h2>{esEdicion ? 'Editar turno' : 'Solicitar turno'}</h2>

            <form onSubmit={handleSubmit(onSubmit)} style={styles.form}>
                <input type="hidden" {...register('id')} />

                <div style={styles.campo}>
                    <label htmlFor="tutorId">Tutor</label>
                    <select
                        id="tutorId"
                        style={styles.input}
                        {...register('tutorId', { required: 'Seleccioná un tutor' })}
                    >
                        <option value="">— Seleccioná un tutor —</option>
                        {tutores.map(t => (
                            <option key={t.id} value={t.id}>
                                {t.nombre} — {t.especialidad} ({t.diasDisponibles?.join(', ')})
                            </option>
                        ))}
                    </select>
                    {errors.tutorId && <p style={styles.error}>{errors.tutorId.message}</p>}
                </div>

                <div style={styles.campo}>
                    <label htmlFor="fecha">Fecha</label>
                    <input
                        id="fecha"
                        type="date"
                        style={styles.input}
                        {...register('fecha', { required: 'La fecha es obligatoria' })}
                    />
                    {errors.fecha && <p style={styles.error}>{errors.fecha.message}</p>}
                </div>

                <div style={styles.fila2}>
                    <div style={styles.campo}>
                        <label htmlFor="horaInicio">Hora inicio</label>
                        <input
                            id="horaInicio"
                            type="time"
                            style={styles.input}
                            {...register('horaInicio', { required: 'La hora de inicio es obligatoria' })}
                        />
                        {errors.horaInicio && <p style={styles.error}>{errors.horaInicio.message}</p>}
                    </div>
                    <div style={styles.campo}>
                        <label htmlFor="horaFin">Hora fin</label>
                        <input
                            id="horaFin"
                            type="time"
                            style={styles.input}
                            {...register('horaFin', { required: 'La hora de fin es obligatoria' })}
                        />
                        {errors.horaFin && <p style={styles.error}>{errors.horaFin.message}</p>}
                    </div>
                </div>

                <div style={styles.campo}>
                    <label htmlFor="tema">Tema</label>
                    <input
                        id="tema"
                        type="text"
                        style={styles.input}
                        placeholder="Ej: JWT y middlewares"
                        {...register('tema', { required: 'El tema es obligatorio' })}
                    />
                    {errors.tema && <p style={styles.error}>{errors.tema.message}</p>}
                </div>

                <div style={styles.campo}>
                    <label htmlFor="modalidad">Modalidad</label>
                    <select
                        id="modalidad"
                        style={styles.input}
                        {...register('modalidad', { required: 'La modalidad es obligatoria' })}
                    >
                        <option value="virtual">Virtual</option>
                        <option value="presencial">Presencial</option>
                    </select>
                    {errors.modalidad && <p style={styles.error}>{errors.modalidad.message}</p>}
                </div>

                <div style={styles.campo}>
                    <label htmlFor="observaciones">Observaciones (opcional)</label>
                    <textarea
                        id="observaciones"
                        style={{ ...styles.input, minHeight: '80px' }}
                        {...register('observaciones')}
                    />
                </div>

                {errorServidor && <p style={styles.error}>{errorServidor}</p>}

                <div style={styles.botones}>
                    <button
                        type="button"
                        onClick={() => navigate('/turnos')}
                        style={styles.botonCancelar}
                    >
                        Cancelar
                    </button>
                    <button
                        type="submit"
                        disabled={!isValid || isSubmitting}
                        style={styles.botonGuardar}
                    >
                        {isSubmitting ? 'Guardando...' : esEdicion ? 'Guardar cambios' : 'Solicitar turno'}
                    </button>
                </div>
            </form>
        </div>
    );
}

const styles = {
    container: { maxWidth: '600px', margin: '0 auto' },
    form: { backgroundColor: 'white', padding: '24px', borderRadius: '8px', boxShadow: '0 1px 4px rgba(0,0,0,0.1)', display: 'flex', flexDirection: 'column', gap: '16px' },
    campo: { display: 'flex', flexDirection: 'column', gap: '4px' },
    fila2: { display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' },
    input: { padding: '8px 12px', border: '1px solid #cbd5e0', borderRadius: '4px', fontSize: '1rem' },
    error: { color: '#e53e3e', fontSize: '0.85rem', margin: '2px 0 0 0' },
    botones: { display: 'flex', gap: '12px', justifyContent: 'flex-end', marginTop: '8px' },
    botonCancelar: { padding: '10px 20px', backgroundColor: '#e2e8f0', border: 'none', borderRadius: '4px', cursor: 'pointer' },
    botonGuardar: { padding: '10px 20px', backgroundColor: '#3182ce', color: 'white', border: 'none', borderRadius: '4px', cursor: 'pointer' }
};

export default FormularioTurno;