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
        if (usuario?.rol === 'admin') return true;
        if (usuario?.rol === 'tutor') return true;
        return false;
    }

    function puedeRealizar() {
        if (turno?.estado !== 'confirmado') return false;
        if (usuario?.rol === 'admin') return true;
        if (usuario?.rol === 'tutor') return true;
        return false;
    }

    function puedeCancelar() {
        if (!['solicitado', 'confirmado'].includes(turno?.estado)) return false;
        if (usuario?.rol === 'admin') return true;
        if (usuario?.rol === 'tutor') return true;
        if (usuario?.rol === 'estudiante' && turno?.estudianteId === usuario?.id) return true;
        return false;
    }

    function puedeEditar() {
        if (turno?.estado === 'cancelado' || turno?.estado === 'realizado') return false;
        if (usuario?.rol === 'admin') return true;
        if (usuario?.rol === 'estudiante' && turno?.estudianteId === usuario?.id) return true;
        return false;
    }

    function badgeColor(estado) {
        const colores = { solicitado: '#d69e2e', confirmado: '#38a169', cancelado: '#e53e3e', realizado: '#3182ce' };
        return colores[estado] || '#718096';
    }

    if (error && !turno) return <p style={{ color: '#e53e3e' }}>{error}</p>;
    if (!turno) return <p>Cargando turno...</p>;

    return (
        <div style={styles.container}>
            <div style={styles.header}>
                <button onClick={() => navigate('/turnos')} style={styles.botonVolver}>← Volver</button>
                <h2>Detalle del turno #{turno.id}</h2>
            </div>

            {mensaje && <p style={styles.exito}>{mensaje}</p>}
            {error && <p style={styles.error}>{error}</p>}

            {/* Datos del turno */}
            <div style={styles.card}>
                <div style={styles.fila}>
                    <span style={styles.label}>Estado</span>
                    <span style={{ ...styles.badge, backgroundColor: badgeColor(turno.estado) }}>
                        {turno.estado}
                    </span>
                </div>
                <div style={styles.fila}>
                    <span style={styles.label}>Tutor</span>
                    <span>{turno.Tutor?.nombre} — {turno.Tutor?.especialidad}</span>
                </div>
                <div style={styles.fila}>
                    <span style={styles.label}>Estudiante</span>
                    <span>{turno.estudiante?.nombre}</span>
                </div>
                <div style={styles.fila}>
                    <span style={styles.label}>Fecha</span>
                    <span>{turno.fecha}</span>
                </div>
                <div style={styles.fila}>
                    <span style={styles.label}>Horario</span>
                    <span>{turno.horaInicio} - {turno.horaFin}</span>
                </div>
                <div style={styles.fila}>
                    <span style={styles.label}>Tema</span>
                    <span>{turno.tema}</span>
                </div>
                <div style={styles.fila}>
                    <span style={styles.label}>Modalidad</span>
                    <span>{turno.modalidad}</span>
                </div>
                {turno.observaciones && (
                    <div style={styles.fila}>
                        <span style={styles.label}>Observaciones</span>
                        <span>{turno.observaciones}</span>
                    </div>
                )}
            </div>

            {/* Acciones según rol y estado */}
            <div style={styles.acciones}>
                {puedeEditar() && (
                    <Link to={`/turnos/${turno.id}/editar`} style={styles.botonEditar}>
                        Editar
                    </Link>
                )}
                {puedeConfirmar() && (
                    <button
                        onClick={() => handleAccion('confirmar')}
                        disabled={cargando}
                        style={styles.botonConfirmar}
                    >
                        {cargando ? 'Procesando...' : 'Confirmar'}
                    </button>
                )}
                {puedeRealizar() && (
                    <button
                        onClick={() => handleAccion('realizar')}
                        disabled={cargando}
                        style={styles.botonRealizar}
                    >
                        {cargando ? 'Procesando...' : 'Marcar como realizado'}
                    </button>
                )}
                {puedeCancelar() && (
                    <button
                        onClick={() => handleAccion('cancelar')}
                        disabled={cargando}
                        style={styles.botonCancelar}
                    >
                        {cargando ? 'Procesando...' : 'Cancelar turno'}
                    </button>
                )}
            </div>

            {/* Historial */}
            <div style={styles.historialContainer}>
                <h3>Historial de cambios</h3>
                {historial === null ? (
                    <p>Cargando historial...</p>
                ) : historial.length === 0 ? (
                    <p style={{ color: '#718096' }}>Sin historial registrado.</p>
                ) : (
                    <ul style={styles.historialLista}>
                        {historial.map(h => (
                            <li key={h.id} style={styles.historialItem}>
                                <span style={styles.accionBadge}>{h.accion}</span>
                                <span>{h.fechaHora?.replace('T', ' ').slice(0, 19)}</span>
                                <span style={{ color: '#4a5568' }}>por {h.Usuario?.nombre}</span>
                                {h.valorAnterior && (
                                    <span style={{ color: '#718096', fontSize: '0.85rem' }}>
                                        {JSON.parse(h.valorAnterior) && `antes: ${JSON.stringify(JSON.parse(h.valorAnterior))}`}
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

const styles = {
    container: { maxWidth: '800px', margin: '0 auto' },
    header: { display: 'flex', alignItems: 'center', gap: '16px', marginBottom: '20px' },
    botonVolver: { padding: '6px 12px', backgroundColor: '#e2e8f0', border: 'none', borderRadius: '4px', cursor: 'pointer' },
    card: { backgroundColor: 'white', padding: '24px', borderRadius: '8px', boxShadow: '0 1px 4px rgba(0,0,0,0.1)', marginBottom: '20px' },
    fila: { display: 'flex', justifyContent: 'space-between', padding: '10px 0', borderBottom: '1px solid #f0f0f0' },
    label: { fontWeight: 'bold', color: '#4a5568' },
    badge: { padding: '2px 12px', borderRadius: '12px', color: 'white', fontSize: '0.9rem' },
    acciones: { display: 'flex', gap: '12px', marginBottom: '24px', flexWrap: 'wrap' },
    botonEditar: { padding: '8px 16px', backgroundColor: '#3182ce', color: 'white', borderRadius: '4px', textDecoration: 'none' },
    botonConfirmar: { padding: '8px 16px', backgroundColor: '#38a169', color: 'white', border: 'none', borderRadius: '4px', cursor: 'pointer' },
    botonRealizar: { padding: '8px 16px', backgroundColor: '#3182ce', color: 'white', border: 'none', borderRadius: '4px', cursor: 'pointer' },
    botonCancelar: { padding: '8px 16px', backgroundColor: '#e53e3e', color: 'white', border: 'none', borderRadius: '4px', cursor: 'pointer' },
    exito: { color: '#38a169', backgroundColor: '#f0fff4', padding: '12px', borderRadius: '4px', marginBottom: '16px' },
    error: { color: '#e53e3e', backgroundColor: '#fff5f5', padding: '12px', borderRadius: '4px', marginBottom: '16px' },
    historialContainer: { backgroundColor: 'white', padding: '24px', borderRadius: '8px', boxShadow: '0 1px 4px rgba(0,0,0,0.1)' },
    historialLista: { listStyle: 'none', padding: 0, display: 'flex', flexDirection: 'column', gap: '12px' },
    historialItem: { display: 'flex', gap: '12px', alignItems: 'center', flexWrap: 'wrap', padding: '8px', backgroundColor: '#f7fafc', borderRadius: '4px' },
    accionBadge: { padding: '2px 8px', backgroundColor: '#2d3748', color: 'white', borderRadius: '4px', fontSize: '0.8rem' }
};

export default DetalleTurno;