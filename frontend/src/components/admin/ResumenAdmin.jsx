import { useState, useEffect } from 'react';
import { turnosService } from '../../services/turnos.service.js';

function ResumenAdmin() {
    const [resumen, setResumen] = useState(null);
    const [error, setError] = useState(null);

    useEffect(() => {
        async function cargar() {
            try {
                const data = await turnosService.BuscarResumen();
                setResumen(data);
            } catch (error) {
                setError('Error al cargar el resumen');
            }
        }
        cargar();
    }, []);

    if (error) return <p className="alert alert--error">{error}</p>;
    if (!resumen) return <p className="empty-state">Cargando resumen...</p>;

    return (
        <div>
            <h2>Panel de administración</h2>

            <div className="stats-grid">
                <div className="stat-card">
                    <p className="stat-card__label">Turnos hoy</p>
                    <p className="stat-card__value">{String(resumen.turnosHoy).padStart(2, '0')}</p>
                </div>
                <div className="stat-card">
                    <p className="stat-card__label">Pendientes de confirmación</p>
                    <p className="stat-card__value">{String(resumen.turnosPendientesConfirmacion).padStart(2, '0')}</p>
                </div>
            </div>

            <div className="section panel">
                <h3>Turnos por tutor</h3>
                <div className="table-wrap">
                    <table className="table">
                        <thead>
                            <tr>
                                <th>Tutor</th>
                                <th>Cantidad</th>
                            </tr>
                        </thead>
                        <tbody>
                            {Object.entries(resumen.turnosPorTutor).map(([tutor, cantidad]) => (
                                <tr key={tutor}>
                                    <td>{tutor}</td>
                                    <td>{cantidad}</td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            </div>

            <div className="section panel">
                <h3>Temas más solicitados</h3>
                <div className="table-wrap">
                    <table className="table">
                        <thead>
                            <tr>
                                <th>Tema</th>
                                <th>Veces solicitado</th>
                            </tr>
                        </thead>
                        <tbody>
                            {resumen.temasMasSolicitados.map(({ tema, cantidad }) => (
                                <tr key={tema}>
                                    <td>{tema}</td>
                                    <td>{cantidad}</td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            </div>
        </div>
    );
}

export default ResumenAdmin;