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

    return (
        <div>
            <div className="section-header">
                <h2>Turnos</h2>
                {usuario?.rol === 'estudiante' && (
                    <Link to="/turnos/nuevo" className="btn btn--primary">+ Solicitar turno</Link>
                )}
            </div>

            {/* Filtros */}
            <div className="filters">
                <input
                    type="date"
                    name="fecha"
                    value={filtros.fecha}
                    onChange={handleFiltroChange}
                    className="input"
                />
                <select name="estado" value={filtros.estado} onChange={handleFiltroChange} className="input">
                    <option value="">Todos los estados</option>
                    <option value="solicitado">Solicitado</option>
                    <option value="confirmado">Confirmado</option>
                    <option value="cancelado">Cancelado</option>
                    <option value="realizado">Realizado</option>
                </select>
                <select name="tutorId" value={filtros.tutorId} onChange={handleFiltroChange} className="input">
                    <option value="">Todos los tutores</option>
                    {tutores.map(t => (
                        <option key={t.id} value={t.id}>{t.nombre}</option>
                    ))}
                </select>
                <select name="especialidad" value={filtros.especialidad} onChange={handleFiltroChange} className="input">
                    <option value="">Todas las especialidades</option>
                    <option value="backend">Backend</option>
                    <option value="frontend">Frontend</option>
                    <option value="testing">Testing</option>
                    <option value="seguridad">Seguridad</option>
                </select>
                <button onClick={handleLimpiar} className="btn btn--secondary btn--sm">Limpiar</button>
            </div>

            {/* Tabla */}
            {error && <p className="alert alert--error">{error}</p>}

            {turnos === null ? (
                <p className="empty-state">Cargando turnos...</p>
            ) : turnos.length === 0 ? (
                <p className="empty-state">No hay turnos que coincidan con los filtros.</p>
            ) : (
                <div className="table-wrap">
                    <table className="table">
                        <thead>
                            <tr>
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
                                <tr key={turno.id}>
                                    <td>{turno.fecha}</td>
                                    <td>{turno.horaInicio} - {turno.horaFin}</td>
                                    <td>{turno.Tutor?.nombre}</td>
                                    <td>{turno.tema}</td>
                                    <td>{turno.modalidad}</td>
                                    <td>
                                        <span className={`badge badge--${turno.estado}`}>
                                            {turno.estado}
                                        </span>
                                    </td>
                                    <td>
                                        <Link to={`/turnos/${turno.id}`} className="btn btn--sm btn--secondary">
                                            Ver
                                        </Link>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            )}

            {/* Paginación */}
            {totalPages > 1 && (
                <div className="pagination">
                    <button
                        onClick={() => setPagina(p => p - 1)}
                        disabled={pagina === 1}
                        className="btn btn--secondary btn--sm"
                    >
                        ← Anterior
                    </button>
                    <span>Página {pagina} / {totalPages}</span>
                    <button
                        onClick={() => setPagina(p => p + 1)}
                        disabled={pagina === totalPages}
                        className="btn btn--secondary btn--sm"
                    >
                        Siguiente →
                    </button>
                </div>
            )}
        </div>
    );
}

export default ListaTurnos;