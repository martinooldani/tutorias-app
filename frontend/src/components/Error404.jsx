import { Link } from 'react-router-dom';

function Error404() {
    return (
        <div style={styles.container}>
            <h1 style={styles.codigo}>404</h1>
            <p style={styles.mensaje}>Página no encontrada</p>
            <Link to="/turnos" style={styles.link}>Volver al inicio</Link>
        </div>
    );
}

const styles = {
    container: { display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', minHeight: '100vh', gap: '16px' },
    codigo: { fontSize: '5rem', margin: 0, color: '#3182ce' },
    mensaje: { fontSize: '1.5rem', color: '#4a5568' },
    link: { color: '#3182ce', fontSize: '1rem' }
};

export default Error404;