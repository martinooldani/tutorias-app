import { DataTypes } from 'sequelize';
import sequelize from '../config/database.js';

const HistorialTurno = sequelize.define('HistorialTurno', {
    id: {
        type: DataTypes.INTEGER,
        primaryKey: true,
        autoIncrement: true
    },
    turnoId: {
        type: DataTypes.INTEGER,
        allowNull: false
    },
    usuarioId: {
        type: DataTypes.INTEGER,
        allowNull: false
    },
    accion: {
        type: DataTypes.STRING,
        allowNull: false // creacion | edicion | confirmacion | cancelacion | realizacion
    },
    fechaHora: {
        type: DataTypes.STRING,
        allowNull: false
    },
    valorAnterior: {
        type: DataTypes.STRING,
        allowNull: true
    },
    valorNuevo: {
        type: DataTypes.STRING,
        allowNull: true
    }
});

export default HistorialTurno;