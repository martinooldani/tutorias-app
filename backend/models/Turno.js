import { DataTypes } from 'sequelize';
import sequelize from '../config/database.js';

const Turno = sequelize.define('Turno', {
    id: {
        type: DataTypes.INTEGER,
        primaryKey: true,
        autoIncrement: true
    },
    tutorId: {
        type: DataTypes.INTEGER,
        allowNull: false
    },
    estudianteId: {
        type: DataTypes.INTEGER,
        allowNull: false
    },
    fecha: {
        type: DataTypes.STRING, // '2026-06-18'
        allowNull: false
    },
    horaInicio: {
        type: DataTypes.STRING, // '10:00'
        allowNull: false
    },
    horaFin: {
        type: DataTypes.STRING, // '10:30'
        allowNull: false
    },
    tema: {
        type: DataTypes.STRING,
        allowNull: false
    },
    modalidad: {
        type: DataTypes.STRING,
        allowNull: false // 'presencial' | 'virtual'
    },
    estado: {
        type: DataTypes.STRING,
        allowNull: false,
        defaultValue: 'solicitado' // solicitado | confirmado | cancelado | realizado
    },
    observaciones: {
        type: DataTypes.STRING,
        allowNull: true
    }
});

export default Turno;