import { Link } from 'react-router-dom';

function Error404() {
    return (
        <div className="notfound">
            <span className="notfound__code">404</span>
            <p className="notfound__message">Página no encontrada</p>
            <Link to="/turnos" className="btn btn--primary">Volver al inicio</Link>
        </div>
    );
}

export default Error404;