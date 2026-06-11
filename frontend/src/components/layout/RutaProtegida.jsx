import { Navigate, useLocation } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext.jsx';

function RutaProtegida({ children, roles }) {
    const { usuario } = useAuth();
    const location = useLocation();

    if (!usuario) {
        return <Navigate to="/login" state={{ from: location }} replace />;
    }

    if (roles && !roles.includes(usuario.rol)) {
        return <Navigate to="/turnos" replace />;
    }

    return children;
}

export default RutaProtegida;