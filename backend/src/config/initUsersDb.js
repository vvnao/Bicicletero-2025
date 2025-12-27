// src/config/initUsersDb.js - CON TIPOS CORRECTOS DEL HISTORIAL
'use strict';

import { AppDataSource } from './configDb.js';
import { UserEntity } from '../entities/UserEntity.js';
import { BicycleEntity } from '../entities/BicycleEntity.js';
import bcrypt from 'bcrypt';
import { createHistoryEvent } from '../helpers/historyHelper.js';

export async function createDefaultUsers() {
  try {
    const userRepository = AppDataSource.getRepository(UserEntity);
    const bicycleRepository = AppDataSource.getRepository(BicycleEntity);

    // Verificar si ya hay usuarios
    const userCount = await userRepository.count();
    if (userCount > 5) {
      console.log('✅ Ya existen usuarios en el sistema');
      return { success: true, message: 'Usuarios ya existen' };
    }

    console.log('\n👥 CREANDO USUARIOS Y BICICLETAS...');
    console.log('='.repeat(50));

    const usersData = [
      // ADMINISTRADOR
      {
        role: 'admin',
        names: 'Administrador General',
        lastName: 'UBB',
        rut: '11.111.111-1',
        email: 'admin@ubiobio.cl',
        password: 'admin123',
        contact: '+56911111111',
        typePerson: 'funcionario',
        requestStatus: 'aprobado',
        isActive: true,
        bicycleData: {
          brand: 'Specialized',
          model: 'Sirrus X 3.0',
          color: 'Negro',
          serialNumber: 'ADM-2024-001',
          type: 'híbrida',
          size: 'L',
          status: 'activa',
          description: 'Bicicleta del administrador',
        }
      },
      // GUARDIA (para login básico)
      {
        role: 'guardia',
        names: 'Guardia General',
        lastName: 'UBB',
        rut: '22.222.222-2',
        email: 'guardia@ubiobio.cl',
        password: 'guardia123',
        contact: '+56922222222',
        typePerson: 'funcionario',
        requestStatus: 'aprobado',
        isActive: true,
        bicycleData: {
          brand: 'Trek',
          model: 'FX 3 Disc',
          color: 'Azul',
          serialNumber: 'GRD-2024-001',
          type: 'urbana',
          size: 'XL',
          status: 'activa',
          description: 'Bicicleta del guardia de seguridad',
        }
      },
      // ESTUDIANTES
      {
        role: 'user',
        names: 'Silvana Alejandra',
        lastName: 'Araya Contreras',
        rut: '19.157.881-3',
        email: 'silvana.araya2301@alumnos.ubiobio.cl',
        password: 'silvana1234',
        contact: '+56981919004',
        typePerson: 'estudiante',
        requestStatus: 'aprobado',
        isActive: true,
        bicycleData: {
          brand: 'Oxford',
          model: 'ARO 29',
          color: 'Azul Marino',
          serialNumber: 'STU-001',
          type: 'montaña',
          size: 'M',
          status: 'activa',
          description: 'Bicicleta Oxford ARO 29',
        }
      },
      {
        role: 'user',
        names: 'Sayen Belén',
        lastName: 'Barra Rojas',
        rut: '19.157.881-4',
        email: 'sayen.barra2301@alumnos.ubiobio.cl',
        password: 'sayen1234',
        contact: '+56981919034',
        typePerson: 'estudiante',
        requestStatus: 'aprobado',
        isActive: true,
        bicycleData: {
          brand: 'Trek',
          model: 'Marlin 5',
          color: 'Rojo',
          serialNumber: 'STU-002',
          type: 'montaña',
          size: 'S',
          status: 'activa',
          description: 'Bicicleta Trek Marlin 5',
        }
      },
      {
        role: 'user',
        names: 'Erika Annais',
        lastName: 'Mellao Jara',
        rut: '21.799.899-9',
        email: 'erika.mellao2301@alumnos.ubiobio.cl',
        password: 'ErikaMellao',
        contact: '+56981919001',
        typePerson: 'estudiante',
        requestStatus: 'aprobado',
        isActive: true,
        bicycleData: {
          brand: 'Specialized',
          model: 'Rockhopper',
          color: 'Verde',
          serialNumber: 'STU-003',
          type: 'montaña',
          size: 'M',
          status: 'activa',
          description: 'Bicicleta Specialized Rockhopper',
        }
      }
    ];

    const createdUsers = [];
    const createdBicycles = [];

    for (const data of usersData) {
      try {
        // Verificar si el usuario ya existe
        const existingUser = await userRepository.findOne({
          where: [{ email: data.email }, { rut: data.rut }]
        });

        if (existingUser) {
          console.log(`   ⏭️  Usuario ya existe: ${data.email}`);
          createdUsers.push(existingUser);
          continue;
        }

        // Crear nuevo usuario
        console.log(`   🆕 Creando usuario: ${data.email}`);
        const hashedPassword = await bcrypt.hash(data.password, 10);
        
        const user = userRepository.create({
          role: data.role,
          names: data.names,
          lastName: data.lastName,
          rut: data.rut,
          email: data.email,
          password: hashedPassword,
          contact: data.contact,
          typePerson: data.typePerson,
          requestStatus: data.requestStatus,
          isActive: data.isActive,
          createdAt: new Date(),
          updatedAt: new Date()
        });
        
        const savedUser = await userRepository.save(user);
        createdUsers.push(savedUser);

        // Crear evento de historial para el usuario (usando tipos correctos)
        try {
          // Para el admin y guardia, usar 'admin_action', para usuarios 'user_registration_request'
          const historyType = data.role === 'admin' || data.role === 'guardia' 
            ? 'admin_action' 
            : 'user_registration_request';
            
          await createHistoryEvent({
            historyType: historyType,
            description: `👤 ${savedUser.names} ${savedUser.lastName} ${data.role === 'admin' ? 'creado' : 'registrado'}`,
            details: { 
              email: savedUser.email, 
              role: savedUser.role,
              requestStatus: savedUser.requestStatus 
            },
            userId: savedUser.id,
            actionBy: 1, // ID del admin que crea estos usuarios
            timestamp: new Date()
          });
        } catch (historyError) {
          console.log(`   ⚠️  No se pudo crear historial para ${savedUser.email}:`, historyError.message);
        }

        // Crear bicicleta asociada
        if (data.bicycleData) {
          console.log(`   🚲 Creando bicicleta: ${data.bicycleData.serialNumber}`);
          const bicycle = bicycleRepository.create({
            ...data.bicycleData,
            user: savedUser,
            createdAt: new Date(),
            updatedAt: new Date()
          });
          
          const savedBicycle = await bicycleRepository.save(bicycle);
          createdBicycles.push(savedBicycle);
          
          // Crear evento de historial para la bicicleta (tipo CORRECTO)
          try {
            await createHistoryEvent({
              historyType: 'bicycle_registration', // ← ESTE es el tipo CORRECTO según tu ENUM
              description: `🚲 ${savedUser.names} registró bicicleta ${savedBicycle.brand} ${savedBicycle.model}`,
              details: { 
                brand: savedBicycle.brand, 
                model: savedBicycle.model,
                serialNumber: savedBicycle.serialNumber,
                color: savedBicycle.color
              },
              userId: savedUser.id,
              bicycleId: savedBicycle.id,
              timestamp: new Date()
            });
          } catch (historyError) {
            console.log(`   ⚠️  No se pudo crear historial para bicicleta:`, historyError.message);
          }
        }
        
      } catch (error) {
        console.error(`   ❌ Error con ${data.email}:`, error.message);
      }
    }

    console.log(`\n📊 RESULTADO:`);
    console.log(`   ✅ Usuarios creados: ${createdUsers.length}`);
    console.log(`   🚲 Bicicletas creadas: ${createdBicycles.length}`);
    
    return { users: createdUsers, bicycles: createdBicycles };
    
  } catch (error) {
    console.error('❌ Error en createDefaultUsers:', error.message);
    return { users: [], bicycles: [] };
  }
}