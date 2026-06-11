import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { turnosService } from '../../services/turnos.service.js';
import { tutoresService } from '../../services/tutores.service.js';
import { useAuth } from '../../context/AuthContext.jsx';

function ListaTurnos() {
    const { usuario } = useAuth();
    const [turnos, setTurnos] = useState(null);
    const [tutores, setTutores] = useState([]);
    const [filtros, setFiltros] = useState({ fecha: '', estado: '', tutorId: '', especialidad: '' });
    const [error, setError] = useState(null);
    const [pagina, setPagina] = useState(1);
    const [totalPages, setTotalPages] = useState(1);

    useEffect(() => {
        cargarTutores();
    }, []);

    useEffect(() => {
        cargarTurnos();
    }, [filtros, pagina]);

    async function cargarTutores() {
        try {
            const data = await tutoresService.BuscarTodos();
            setTutores(data);
        } catch (error) {
            console.error('Error al cargar tutores:', error);
        }
    }

    async function cargarTurnos() {
        try {
            setError(null);
            const params = { ...filtros, page: pagina, limit: 10 };
            // Limpiar params vacíos
            Object.keys(params).forEach(k => !params[k] && delete params[k]);
            const data = await turnosService.BuscarTodos(params);
            setTurnos(data.data);
            setTotalPages(data.totalPages);
        } catch (error) {
            setError('Error al cargar los turnos');
        }
    }

    function handleFiltroChange(e) {
        setFiltros({ ...filtros, [e.target.name]: e.target.value });
        setPagina(1);
    }

    function handleLimpiar() {
        setFiltros({ fecha: '', estado: '', tutorId: '', especialidad: '' });
        setPagina(1);
    }

    function badgeColor(estado) {
        const colores = {
            solicitado: '#d69e2e',
            confirmado: '#38a169',
            cancelado: '#e53e3e',
            realizado: '#3182ce'
        };
        return colores[estado] || '#718096';
    }

    return (
        <div>
            <div style={styles.header}>
                <h2>Turnos</h2>
                {usuario?.rol === 'estudiante' && (
                    <Link to="/turnos/nuevo" style={styles.botonNuevo}>+ Solicitar turno</Link>
                )}
            </div>

            {/* Filtros */}
            <div style={styles.filtros}>
                <input
                    type="date"
                    name="fecha"
                    value={filtros.fecha}
                    onChange={handleFiltroChange}
                    style={styles.input}
                />
                <select name="estado" value={filtros.estado} onChange={handleFiltroChange} style={styles.input}>
                    <option value="">Todos los estados</option>
                    <option value="solicitado">Solicitado</option>
                    <option value="confirmado">Confirmado</option>
                    <option value="cancelado">Cancelado</option>
                    <option value="realizado">Realizado</option>
                </select>
                <select name="tutorId" value={filtros.tutorId} onChange={handleFiltroChange} style={styles.input}>
                    <option value="">Todos los tutores</option>
                    {tutores.map(t => (
                        <option key={t.id} value={t.id}>{t.nombre}</option>
                    ))}
                </select>
                <select name="especialidad" value={filtros.especialidad} onChange={handleFiltroChange} style={styles.input}>
                    <option value="">Todas las especialidades</option>
                    <option value="backend">Backend</option>
                    <option value="frontend">Frontend</option>
                    <option value="testing">Testing</option>
                    <option value="seguridad">Seguridad</option>
                </select>
                <button onClick={handleLimpiar} style={styles.botonLimpiar}>Limpiar</button>
            </div>

            {/* Tabla */}
            {error && <p style={styles.error}>{error}</p>}

            {turnos === null ? (
                <p>Cargando turnos...</p>
            ) : turnos.length === 0 ? (
                <p style={styles.vacio}>No hay turnos que coincidan con los filtros.</p>
            ) : (
                <table style={styles.tabla}>
                    <thead>
                        <tr style={styles.thead}>
                            <th>Fecha</th>
                            <th>Horario</th>
                            <th>Tutor</th>
                            <th>Tema</th>
                            <th>Modalidad</th>
                            <th>Estado</th>
                            <th>Acciones</th>
                        </tr>
                    </thead>
                    <tbody>
                        {turnos.map(turno => (
                            <tr key={turno.id} style={styles.fila}>
                                <td>{turno.fecha}</td>
                                <td>{turno.horaInicio} - {turno.horaFin}</td>
                                <td>{turno.Tutor?.nombre}</td>
                                <td>{turno.tema}</td>
                                <td>{turno.modalidad}</td>
                                <td>
                                    <span style={{ ...styles.badge, backgroundColor: badgeColor(turno.estado) }}>
                                        {turno.estado}
                                    </span>
                                </td>
                                <td>
                                    <Link to={`/turnos/${turno.id}`} style={styles.linkVer}>Ver</Link>
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            )}

            {/* Paginación */}
            {totalPages > 1 && (
                <div style={styles.paginacion}>
                    <button
                        onClick={() => setPagina(p => p - 1)}
                        disabled={pagina === 1}
                        style={styles.botonPag}
                    >
                        Anterior
                    </button>
                    <span>Página {pagina} de {totalPages}</span>
                    <button
                        onClick={() => setPagina(p => p + 1)}
                        disabled={pagina === totalPages}
                        style={styles.botonPag}
                    >
                        Siguiente
                    </button>
                </div>
            )}
        </div>
    );
}

const styles = {
    header: { display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' },
    botonNuevo: { padding: '8px 16px', backgroundColor: '#38a169', color: 'white', borderRadius: '4px', textDecoration: 'none' },
    filtros: { display: 'flex', gap: '12px', flexWrap: 'wrap', marginBottom: '20px', padding: '16px', backgroundColor: '#f7fafc', borderRadius: '8px' },
    input: { padding: '8px', border: '1px solid #cbd5e0', borderRadius: '4px', fontSize: '0.9rem' },
    botonLimpiar: { padding: '8px 12px', backgroundColor: '#718096', color: 'white', border: 'none', borderRadius: '4px', cursor: 'pointer' },
    error: { color: '#e53e3e', marginBottom: '12px' },
    vacio: { color: '#718096', textAlign: 'center', padding: '40px' },
    tabla: { width: '100%', borderCollapse: 'collapse', backgroundColor: 'white', borderRadius: '8px', overflow: 'hidden', boxShadow: '0 1px 4px rgba(0,0,0,0.1)' },
    thead: { backgroundColor: '#2d3748', color: 'white' },
    fila: { borderBottom: '1px solid #e2e8f0' },
    badge: { padding: '2px 10px', borderRadius: '12px', color: 'white', fontSize: '0.8rem' },
    linkVer: { color: '#3182ce', textDecoration: 'none', fontWeight: 'bold' },
    paginacion: { display: 'flex', justifyContent: 'center', alignItems: 'center', gap: '16px', marginTop: '20px' },
    botonPag: { padding: '6px 16px', border: '1px solid #cbd5e0', borderRadius: '4px', cursor: 'pointer', backgroundColor: 'white' }
};

export default ListaTurnos;