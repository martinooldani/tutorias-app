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
        <nav className="navbar">
            <Link to="/turnos" className="navbar__brand">Tutorías DDS</Link>

            <div className="navbar__links">
                <Link to="/turnos" className="navbar__link">Turnos</Link>

                {usuario?.rol === 'estudiante' && (
                    <Link to="/turnos/nuevo" className="navbar__link">Solicitar</Link>
                )}

                {usuario?.rol === 'admin' && (
                    <Link to="/admin/resumen" className="navbar__link">Resumen</Link>
                )}

                <span className="navbar__user">
                    {usuario?.nombre} · {usuario?.rol}
                </span>

                <button onClick={handleLogout} className="btn btn--sm btn--logout">
                    Salir
                </button>
            </div>
        </nav>
    );
}

export default Navbar;