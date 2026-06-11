function errorHandler(err, req, res, next) {
    console.error(err.stack);

    // Errores de negocio que lanzamos nosotros con statusCode
    if (err.statusCode) {
        return res.status(err.statusCode).json({ error: err.message });
    }

    // Error genérico de servidor
    res.status(500).json({ error: 'Error interno del servidor' });
}

export default errorHandler;