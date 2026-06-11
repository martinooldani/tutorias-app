function authorizeRole(...rolesPermitidos) {
    return (req, res, next) => {
        if (!rolesPermitidos.includes(req.user.rol)) {
            return res.status(403).json({ error: 'No tiene permisos para esta acción' });
        }
        next();
    };
}

export default authorizeRole;