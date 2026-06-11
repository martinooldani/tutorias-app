import 'dotenv/config';
import app from './app.js';
import { sequelize } from './models/index.js';

const PORT = process.env.PORT || 3000;

async function iniciar() {
    await sequelize.sync();
    app.listen(PORT, () => {
        console.log(`Servidor corriendo en http://localhost:${PORT}`);
    });
}

iniciar().catch((err) => {
    console.error('Error al iniciar el servidor:', err);
    process.exit(1);
});