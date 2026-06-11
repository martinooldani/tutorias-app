import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext.jsx';

function Navbar() {
    const { usuario, logout } = useAuth();
    const navigate = useNavigate();

    async function handleLogout() {
        await logout();
        navigate('/login', { replace: true });
    }

    return (
        <nav style={styles.nav}>
            <div style={styles.brand}>
                <Link to="/turnos" style={styles.link}>📚 Tutorías DDS</Link>
            </div>
            <div style={styles.links}>
                <Link to="/turnos" style={styles.link}>Turnos</Link>
                {usuario?.rol === 'estudiante' && (
                    <Link to="/turnos/nuevo" style={styles.link}>Solicitar turno</Link>
                )}
                {usuario?.rol === 'admin' && (
                    <Link to="/admin/resumen" style={styles.link}>Resumen</Link>
                )}
                <span style={styles.usuario}>
                    {usuario?.nombre} ({usuario?.rol})
                </span>
                <button onClick={handleLogout} style={styles.boton}>
                    Cerrar sesión
                </button>
            </div>
        </nav>
    );
}

const styles = {
    nav: {
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        padding: '12px 24px',
        backgroundColor: '#1a1a2e',
        color: 'white'
    },
    brand: { fontSize: '1.2rem', fontWeight: 'bold' },
    links: { display: 'flex', alignItems: 'center', gap: '16px' },
    link: { color: 'white', textDecoration: 'none' },
    usuario: { color: '#a0aec0', fontSize: '0.9rem' },
    boton: {
        padding: '6px 12px',
        backgroundColor: '#e53e3e',
        color: 'white',
        border: 'none',
        borderRadius: '4px',
        cursor: 'pointer'
    }
};

export default Navbar;