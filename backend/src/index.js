import 'dotenv/config';
import express from 'express';
import dotenv from 'dotenv';
import morgan from 'morgan';
import path from 'path';
import { AppDataSource, connectDB } from './config/configDb.js';
import { routerApi } from './routes/index.routes.js';
import cors from 'cors';
import { createBikeracks } from './config/initBikeracksDb.js';
import { createSpaces } from './config/initSpacesDb.js';
import { createDefaultUsers } from './config/defaultUsers.js';
import { createBicycles } from './config/initBicyclesDb.js';
import { createReservations } from './config/initReservationsDb.js';
import { createDefaultGuards } from './config/initGuardsDb.js';
import { createDefaultGuardAssignments } from './config/initGuardAssignmentsDb.js';

import 'dotenv/config';
console.log('=== CONFIGURACIÓN DE ENV ===');
console.log(' JWT_SECRET:', process.env.JWT_SECRET ? 'PRESENTE' : 'AUSENTE');
console.log(' JWT_SECRET valor:', process.env.JWT_SECRET);
console.log(' Longitud:', process.env.JWT_SECRET?.length);

const app = express();
app.use(
  cors({
    credentials: true,
    origin: true,
  })
);
app.use(express.json());
app.use(morgan('dev'));
app.use(
  "/uploads",
  express.static(path.join(process.cwd(), "src/uploads")));
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
    await createDefaultGuards(); 
    await createDefaultGuardAssignments(); 
    await createReservations();

    await createBikeracks();
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
