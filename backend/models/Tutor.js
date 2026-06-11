import { DataTypes } from 'sequelize';
import sequelize from '../config/database.js';

const Tutor = sequelize.define('Tutor', {
    id: {
        type: DataTypes.INTEGER,
        primaryKey: true,
        autoIncrement: true
    },
    usuarioId: {
        type: DataTypes.INTEGER,
        allowNull: false
    },
    nombre: {
        type: DataTypes.STRING,
        allowNull: false
    },
    email: {
        type: DataTypes.STRING,
        allowNull: false
    },
    especialidad: {
        type: DataTypes.STRING,
        allowNull: false
    },
    diasDisponibles: {
        type: DataTypes.STRING, // guardamos como JSON string: '["lunes","miércoles"]'
        allowNull: false,
        get() {
            const val = this.getDataValue('diasDisponibles');
            return val ? JSON.parse(val) : [];
        },
        set(val) {
            this.setDataValue('diasDisponibles', JSON.stringify(val));
        }
    },
    activo: {
        type: DataTypes.BOOLEAN,
        allowNull: false,
        defaultValue: true
    }
});

export default Tutor;