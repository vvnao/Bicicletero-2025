import 'dotenv/config';
import express from 'express';
import morgan from 'morgan';
import { AppDataSource, connectDB } from './config/configDb.js';
import { routerApi } from './routes/index.routes.js';
import cors from 'cors';
import { createBikeracks } from './config/initBikeracksDb.js';
import { createSpaces } from './config/initSpacesDb.js';
import { createDefaultUsers } from './config/defaultUsers.js';
import { createBicycles } from './config/initBicyclesDb.js';
//import { createReservations } from './config/initReservationsDb.js';
import { startMonitoringJobs } from './jobs/monitor.job.js';
import 'dotenv/config';

const app = express();
app.use(
  cors({
    credentials: true,
    origin: true,
  })
);
app.use(express.json());
app.use(morgan('dev'));
// Ruta principal de bienvenida
app.get('/', (req, res) => {
  res.send('¡Bienvenido a mi API REST con TypeORM!');
});
// Inicializa la conexión a la base de datos
connectDB()
  .then(async () => {
    await createBikeracks();
    await createSpaces();
    await createDefaultUsers();
    await createBicycles();
    //await createReservations();

    //! Inicia los jobs de monitoreo automático
    startMonitoringJobs();
    console.log('Jobs de monitoreo automático iniciados');

    // Carga todas las rutas de la aplicación
    routerApi(app);

    // Levanta el servidor Express
    const PORT = process.env.PORT || 3000;
    app.listen(PORT, () => {
      console.log(`Servidor iniciado en http://localhost:${PORT}`);
    });
  })
  .catch((error) => {
    console.log('Error al conectar con la base de datos:', error);
    process.exit(1);
  });
