import sequelize from '../config/database.js';
import Usuario from './Usuario.js';
import Tutor from './Tutor.js';
import Turno from './Turno.js';
import HistorialTurno from './HistorialTurno.js';

// Relaciones
Usuario.hasOne(Tutor, { foreignKey: 'usuarioId' });
Tutor.belongsTo(Usuario, { foreignKey: 'usuarioId' });

Tutor.hasMany(Turno, { foreignKey: 'tutorId' });
Turno.belongsTo(Tutor, { foreignKey: 'tutorId' });

Usuario.hasMany(Turno, { foreignKey: 'estudianteId' });
Turno.belongsTo(Usuario, { foreignKey: 'estudianteId', as: 'estudiante' });

Turno.hasMany(HistorialTurno, { foreignKey: 'turnoId' });
HistorialTurno.belongsTo(Turno, { foreignKey: 'turnoId' });

Usuario.hasMany(HistorialTurno, { foreignKey: 'usuarioId' });
HistorialTurno.belongsTo(Usuario, { foreignKey: 'usuarioId' });

export { sequelize, Usuario, Tutor, Turno, HistorialTurno };