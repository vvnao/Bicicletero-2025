'use strict';
import { DataSource } from 'typeorm';
import { DATABASE, DB_USERNAME, HOST, PASSWORD, DB_PORT } from './configEnv.js';

export const AppDataSource = new DataSource({
  type: 'postgres',
  host: `${HOST}`,
  port: DB_PORT,
  username: `${DB_USERNAME}`,
  password: `${PASSWORD}`,
  database: `${DATABASE}`,
  entities: ['src/entities/**/*.js'],
  synchronize: true,
   logging: false,
});

export async function connectDB() {
  try {
    await AppDataSource.initialize();
    console.log('- Conexión exitosa a PostgreSQL!');
    
    // Verificar que las entidades se cargaron
    console.log('- Entidades cargadas:', AppDataSource.entityMetadatas.length);
    AppDataSource.entityMetadatas.forEach(entity => {
      console.log(`   • ${entity.name}`);
    });
    
  } catch (error) {
    console.error(' Error conectando a BD:', error.message);
    
    // Información adicional de debug
    console.log('\n- VERIFICANDO CONFIGURACIÓN:');
    console.log('Host:', HOST);
    console.log('Port:', DB_PORT);
    console.log('Database:', DATABASE);
    console.log('Username:', DB_USERNAME);
    console.log('Entities config:', 'Lista explícita');
    
    process.exit(1);
  }
}