import { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { turnosService } from '../../services/turnos.service.js';
import { useAuth } from '../../context/AuthContext.jsx';

function DetalleTurno() {
    const { id } = useParams();
    const { usuario } = useAuth();
    const navigate = useNavigate();
    const [turno, setTurno] = useState(null);
    const [historial, setHistorial] = useState(null);
    const [error, setError] = useState(null);
    const [mensaje, setMensaje] = useState(null);
    const [cargando, setCargando] = useState(false);

    useEffect(() => {
        cargarTurno();
        cargarHistorial();
    }, [id]);

    async function cargarTurno() {
        try {
            const data = await turnosService.BuscarUno(id);
            setTurno(data);
        } catch (error) {
            setError('Turno no encontrado');
        }
    }

    async function cargarHistorial() {
        try {
            const data = await turnosService.BuscarHistorial(id);
            setHistorial(data);
        } catch (error) {
            console.error('Error al cargar historial:', error);
        }
    }

    async function handleAccion(accion) {
        try {
            setCargando(true);
            setError(null);
            setMensaje(null);
            if (accion === 'cancelar') await turnosService.Cancelar(id);
            if (accion === 'confirmar') await turnosService.Confirmar(id);
            if (accion === 'realizar') await turnosService.Realizar(id);
            setMensaje('Acción realizada correctamente');
            await cargarTurno();
            await cargarHistorial();
        } catch (error) {
            setError(error.response?.data?.error || 'Error al realizar la acción');
        } finally {
            setCargando(false);
        }
    }

    function puedeConfirmar() {
        if (turno?.estado !== 'solicitado') return false;
        return usuario?.rol === 'admin' || usuario?.rol === 'tutor';
    }

    function puedeRealizar() {
        if (turno?.estado !== 'confirmado') return false;
        return usuario?.rol === 'admin' || usuario?.rol === 'tutor';
    }

    function puedeCancelar() {
        if (!['solicitado', 'confirmado'].includes(turno?.estado)) return false;
        if (usuario?.rol === 'admin' || usuario?.rol === 'tutor') return true;
        if (usuario?.rol === 'estudiante' && turno?.estudianteId === usuario?.id) return true;
        return false;
    }

    function puedeEditar() {
        if (turno?.estado === 'cancelado' || turno?.estado === 'realizado') return false;
        if (usuario?.rol === 'admin') return true;
        if (usuario?.rol === 'estudiante' && turno?.estudianteId === usuario?.id) return true;
        return false;
    }

    if (error && !turno) return <p className="alert alert--error">{error}</p>;
    if (!turno) return <p className="empty-state">Cargando turno...</p>;

    return (
        <div>
            <div className="detail-header">
                <button onClick={() => navigate('/turnos')} className="btn btn--secondary btn--sm">
                    ← Volver
                </button>
                <h2>TURNO #{String(turno.id).padStart(4, '0')}</h2>
            </div>

            {mensaje && <p className="alert alert--success">{mensaje}</p>}
            {error && <p className="alert alert--error">{error}</p>}

            {/* Datos del turno */}
            <div className="panel">
                <div className="detail-row">
                    <span className="detail-row__label">Estado</span>
                    <span className={`badge badge--${turno.estado}`}>{turno.estado}</span>
                </div>
                <div className="detail-row">
                    <span className="detail-row__label">Tutor</span>
                    <span className="detail-row__value">{turno.Tutor?.nombre} — {turno.Tutor?.especialidad}</span>
                </div>
                <div className="detail-row">
                    <span className="detail-row__label">Estudiante</span>
                    <span className="detail-row__value">{turno.estudiante?.nombre}</span>
                </div>
                <div className="detail-row">
                    <span className="detail-row__label">Fecha</span>
                    <span className="detail-row__value">{turno.fecha}</span>
                </div>
                <div className="detail-row">
                    <span className="detail-row__label">Horario</span>
                    <span className="detail-row__value">{turno.horaInicio} – {turno.horaFin}</span>
                </div>
                <div className="detail-row">
                    <span className="detail-row__label">Tema</span>
                    <span className="detail-row__value">{turno.tema}</span>
                </div>
                <div className="detail-row">
                    <span className="detail-row__label">Modalidad</span>
                    <span className="detail-row__value">{turno.modalidad}</span>
                </div>
                {turno.observaciones && (
                    <div className="detail-row">
                        <span className="detail-row__label">Observaciones</span>
                        <span className="detail-row__value">{turno.observaciones}</span>
                    </div>
                )}
            </div>

            {/* Acciones según rol y estado */}
            <div className="detail-actions">
                {puedeEditar() && (
                    <Link to={`/turnos/${turno.id}/editar`} className="btn btn--secondary">
                        Editar
                    </Link>
                )}
                {puedeConfirmar() && (
                    <button onClick={() => handleAccion('confirmar')} disabled={cargando} className="btn btn--success">
                        {cargando ? 'Procesando...' : 'Confirmar'}
                    </button>
                )}
                {puedeRealizar() && (
                    <button onClick={() => handleAccion('realizar')} disabled={cargando} className="btn btn--info">
                        {cargando ? 'Procesando...' : 'Marcar realizado'}
                    </button>
                )}
                {puedeCancelar() && (
                    <button onClick={() => handleAccion('cancelar')} disabled={cargando} className="btn btn--danger">
                        {cargando ? 'Procesando...' : 'Cancelar turno'}
                    </button>
                )}
            </div>

            {/* Historial */}
            <div className="panel">
                <h3>Historial de cambios</h3>
                {historial === null ? (
                    <p className="empty-state">Cargando historial...</p>
                ) : historial.length === 0 ? (
                    <p className="empty-state">Sin historial registrado.</p>
                ) : (
                    <ul className="history">
                        {historial.map(h => (
                            <li key={h.id} className="history__item">
                                <span className="history__tag">{h.accion}</span>
                                <span className="history__date">{h.fechaHora?.replace('T', ' ').slice(0, 19)}</span>
                                <span className="history__user">por {h.Usuario?.nombre}</span>
                                {h.valorAnterior && (
                                    <span className="history__diff">
                                        antes: {JSON.stringify(JSON.parse(h.valorAnterior))}
                                    </span>
                                )}
                            </li>
                        ))}
                    </ul>
                )}
            </div>
        </div>
    );
}

export default DetalleTurno;