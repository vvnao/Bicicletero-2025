// src/config/initSystem.js
/*'use strict';

import { AppDataSource, connectDB } from './configDb.js';

export async function initializeCompleteSystem() {
  console.log('🚀 INICIANDO INICIALIZACIÓN COMPLETA DEL SISTEMA');
  console.log('='.repeat(50));
  
  try {
    if (!AppDataSource.isInitialized) {
      await AppDataSource.initialize();
    }

    // Importar funciones de inicialización específicas
    console.log('\n📋 1. Creando usuarios base...');
    const { createDefaultUsers } = await import('./initUsersDb.js');
    await createDefaultUsers();
    
    console.log('\n🏢 2. Creando bicicleteros...');
    const { createBikeracks } = await import('./initBikeracksDb.js');
    await createBikeracks();
    
    console.log('\n📍 3. Creando espacios...');
    const { createSpaces } = await import('./initSpacesDb.js');
    await createSpaces();
    
    console.log('\n👮 4. Creando guardias...');
    const { createDefaultGuards } = await import('./initGuardsDb.js');
    await createDefaultGuards();
    
    console.log('\n🔗 5. Asignando guardias...');
    const { createDefaultGuardAssignments } = await import('./initGuardAssignmentsDb.js');
    await createDefaultGuardAssignments();
    
    console.log('\n🚲 6. Creando bicicletas...');
    const { createBicycles } = await import('./initBicyclesDb.js');
    await createBicycles();
    
    console.log('\n📅 7. Creando reservas...');
    const { createReservations } = await import('./initReservationsDb.js');
    await createReservations();
    
    console.log('\n📝 8. Creando historial inicial...');
    const { createInitialHistory } = await import('./initHistory.js');
    await createInitialHistory();
    
    console.log('\n📊 9. Creando reportes de muestra...');
    const { createSampleReports } = await import('./initReports.js');
    await createSampleReports();
    
    console.log('\n✅ SISTEMA INICIALIZADO EXITOSAMENTE');
    console.log('='.repeat(50));
    
    // Mostrar estadísticas
    await showSystemStats();
    
    return { success: true };
    
  } catch (error) {
    console.error('❌ Error en la inicialización:', error);
    return { success: false, error: error.message };
  }
}

async function showSystemStats() {
  try {
    console.log('\n📊 ESTADÍSTICAS DEL SISTEMA');
    console.log('='.repeat(40));
    
    const [
      users, guards, bikeracks, spaces, 
      bicycles, reservations, history
    ] = await Promise.all([
      AppDataSource.getRepository('User').count(),
      AppDataSource.getRepository('Guard').count(),
      AppDataSource.getRepository('Bikerack').count(),
      AppDataSource.getRepository('Space').count(),
      AppDataSource.getRepository('Bicycle').count(),
      AppDataSource.getRepository('Reservation').count(),
      AppDataSource.getRepository('History').count()
    ]);
    
    console.log('👥 Usuarios totales:', users);
    console.log('👮 Guardias:', guards);
    console.log('🏢 Bicicleteros:', bikeracks);
    console.log('📍 Espacios:', spaces);
    console.log('🚲 Bicicletas:', bicycles);
    console.log('📅 Reservas:', reservations);
    console.log('📝 Eventos de historial:', history);
    
  } catch (error) {
    console.error('⚠️  Error obteniendo estadísticas:', error.message);
  }
}*/