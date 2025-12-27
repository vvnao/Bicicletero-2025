import 'dotenv/config';
import express from 'express';
import dotenv from 'dotenv';
import morgan from 'morgan';
import path from 'path';
import { AppDataSource, connectDB } from './config/configDb.js';
import { routerApi } from './routes/index.routes.js';
import cors from 'cors';

// ✅ SOLO ESTA IMPORTACIÓN
import { forceResetAndCreate } from './config/initCompleteSystem.js';

import 'dotenv/config';
console.log('=== CONFIGURACIÓN DE ENV ===');
console.log(' JWT_SECRET:', process.env.JWT_SECRET ? 'PRESENTE' : 'AUSENTE');

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
  
// Ruta principal
app.get('/', (req, res) => {
  res.send('¡Bienvenido a mi API REST con TypeORM!');
});

// Inicializa la conexión a la base de datos
connectDB()
  .then(async () => {
    console.log('🔄 Inicializando sistema...');
    
  await forceResetAndCreate();
    
    // Carga rutas
    routerApi(app);

    // Inicia servidor
    const PORT = process.env.PORT || 3000;
    app.listen(PORT, () => {
      console.log(`🎉 Servidor en: http://localhost:${PORT}`);
      console.log('==========================================');
    });
  })
  .catch((error) => {
    console.log('❌ Error al conectar con la base de datos:', error);
    process.exit(1);
  });