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

    if (error) return <p style={{ color: '#e53e3e' }}>{error}</p>;
    if (!resumen) return <p>Cargando resumen...</p>;

    return (
        <div>
            <h2>Panel de administración</h2>

            <div style={styles.grid}>
                <div style={styles.card}>
                    <h3 style={styles.cardTitulo}>Turnos hoy</h3>
                    <p style={styles.numero}>{resumen.turnosHoy}</p>
                </div>
                <div style={styles.card}>
                    <h3 style={styles.cardTitulo}>Pendientes de confirmación</h3>
                    <p style={styles.numero}>{resumen.turnosPendientesConfirmacion}</p>
                </div>
            </div>

            <div style={styles.seccion}>
                <h3>Turnos por tutor</h3>
                <table style={styles.tabla}>
                    <thead>
                        <tr style={styles.thead}>
                            <th style={styles.th}>Tutor</th>
                            <th style={styles.th}>Cantidad</th>
                        </tr>
                    </thead>
                    <tbody>
                        {Object.entries(resumen.turnosPorTutor).map(([tutor, cantidad]) => (
                            <tr key={tutor} style={styles.fila}>
                                <td style={styles.td}>{tutor}</td>
                                <td style={styles.td}>{cantidad}</td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>

            <div style={styles.seccion}>
                <h3>Temas más solicitados</h3>
                <table style={styles.tabla}>
                    <thead>
                        <tr style={styles.thead}>
                            <th style={styles.th}>Tema</th>
                            <th style={styles.th}>Veces solicitado</th>
                        </tr>
                    </thead>
                    <tbody>
                        {resumen.temasMasSolicitados.map(({ tema, cantidad }) => (
                            <tr key={tema} style={styles.fila}>
                                <td style={styles.td}>{tema}</td>
                                <td style={styles.td}>{cantidad}</td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>
        </div>
    );
}

const styles = {
    grid: { display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: '16px', marginBottom: '32px' },
    card: { backgroundColor: 'white', padding: '24px', borderRadius: '8px', boxShadow: '0 1px 4px rgba(0,0,0,0.1)', textAlign: 'center' },
    cardTitulo: { color: '#4a5568', marginBottom: '8px' },
    numero: { fontSize: '3rem', fontWeight: 'bold', color: '#3182ce', margin: 0 },
    seccion: { backgroundColor: 'white', padding: '24px', borderRadius: '8px', boxShadow: '0 1px 4px rgba(0,0,0,0.1)', marginBottom: '20px' },
    tabla: { width: '100%', borderCollapse: 'collapse', marginTop: '12px' },
    thead: { backgroundColor: '#2d3748', color: 'white' },
    th: { padding: '10px 16px', textAlign: 'left' },
    fila: { borderBottom: '1px solid #e2e8f0' },
    td: { padding: '10px 16px' }
};

export default ResumenAdmin;