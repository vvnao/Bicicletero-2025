// config/initGuardsDb.js - GUARDIAS PARA LUNES-SÁBADO
'use strict';
import { AppDataSource } from './configDb.js';
import { GuardEntity } from '../entities/GuardEntity.js';
import { UserEntity } from '../entities/UserEntity.js';
import bcrypt from 'bcryptjs';

export async function createDefaultGuards() {
  try {
    const guardRepository = AppDataSource.getRepository(GuardEntity);
    const userRepository = AppDataSource.getRepository(UserEntity);

    const count = await guardRepository.count();
    if (count > 0) {
      console.log('⚠️  Ya existen guardias en la base de datos');
      return;
    }

    console.log('🛡️  Creando 5 guardias para horario Lunes-Sábado...');

    const usersToCreate = [
      {
        role: 'guardia',
        names: 'Carlos',
        lastName: 'Mendoza',
        rut: '16.543.210-5',
        email: 'carlos.guardia@ubiobio.cl',
        password: await bcrypt.hash('guardia123', 10),
        contact: '+56987651234',
        typePerson: 'funcionario',
        requestStatus: 'aprobado',
        isActive: true
      },
      {
        role: 'guardia',
        names: 'Ana',
        lastName: 'Silva',
        rut: '17.654.321-6',
        email: 'ana.guardia@ubiobio.cl',
        password: await bcrypt.hash('guardia456', 10),
        contact: '+56987652345',
        typePerson: 'estudiante',
        requestStatus: 'aprobado',
        isActive: true
      },
      {
        role: 'guardia',
        names: 'Pedro',
        lastName: 'Rojas',
        rut: '18.765.432-7',
        email: 'pedro.guardia@ubiobio.cl',
        password: await bcrypt.hash('guardia789', 10),
        contact: '+56987653456',
        typePerson: 'externo',
        requestStatus: 'aprobado',
        isActive: true
      },
      {
        role: 'guardia',
        names: 'María',
        lastName: 'González',
        rut: '19.876.543-8',
        email: 'maria.guardia@ubiobio.cl',
        password: await bcrypt.hash('guardia012', 10),
        contact: '+56987654567',
        typePerson: 'funcionario',
        requestStatus: 'aprobado',
        isActive: true
      },
      {
        role: 'guardia',
        names: 'Luis',
        lastName: 'Torres',
        rut: '20.987.654-9',
        email: 'luis.guardia@ubiobio.cl',
        password: await bcrypt.hash('guardia345', 10),
        contact: '+56987655678',
        typePerson: 'estudiante',
        requestStatus: 'aprobado',
        isActive: true
      }
    ];

    const createdUsers = [];
    for (const userData of usersToCreate) {
      const user = userRepository.create(userData);
      const savedUser = await userRepository.save(user);
      createdUsers.push(savedUser);
      console.log(`✅ Usuario guardia creado: ${userData.names} ${userData.lastName}`);
    }

    // ====================
    // PERFILES CON HORARIO LUNES-SÁBADO
    // ====================
    const guardsToCreate = [
      {
        userId: createdUsers[0].id,
        guardNumber: 1001,
        phone: '+56987651234',
        address: 'Campus Concepción, Edificio Central',
        emergencyContact: 'María Mendoza',
        emergencyPhone: '+56912345678',
        schedule: '08:00-17:00',
        workDays: 'lunes,martes,miércoles,jueves,viernes,sábado',
        maxHoursPerWeek: 48, // 8h x 6 días
        rating: 4.5,
        isAvailable: true,
        notes: 'Encargado Bicicletero Central - Lunes a Sábado'
      },
      {
        userId: createdUsers[1].id,
        guardNumber: 1002,
        phone: '+56987652345',
        address: 'Campus Concepción, Edificio Norte',
        emergencyContact: 'Juan Silva',
        emergencyPhone: '+56923456789',
        schedule: '12:00-20:00',
        workDays: 'lunes,martes,miércoles,jueves,viernes,sábado',
        maxHoursPerWeek: 48,
        rating: 4.8,
        isAvailable: true,
        notes: 'Encargado Bicicletero Norte - Lunes a Sábado'
      },
      {
        userId: createdUsers[2].id,
        guardNumber: 1003,
        phone: '+56987653456',
        address: 'Campus Concepción, Edificio Sur',
        emergencyContact: 'Laura Rojas',
        emergencyPhone: '+56934567890',
        schedule: '06:00-14:00',
        workDays: 'lunes,martes,miércoles,jueves,viernes,sábado',
        maxHoursPerWeek: 48,
        rating: 4.2,
        isAvailable: true,
        notes: 'Encargado Bicicletero Sur - Lunes a Sábado'
      },
      {
        userId: createdUsers[3].id,
        guardNumber: 1004,
        phone: '+56987654567',
        address: 'Campus Concepción, Edificio Este',
        emergencyContact: 'Carlos González',
        emergencyPhone: '+56945678901',
        schedule: '14:00-22:00',
        workDays: 'lunes,martes,miércoles,jueves,viernes,sábado',
        maxHoursPerWeek: 48,
        rating: 4.7,
        isAvailable: true,
        notes: 'Encargado Bicicletero Este - Lunes a Sábado'
      },
      {
        userId: createdUsers[4].id,
        guardNumber: 1005,
        phone: '+56987655678',
        address: 'Campus Concepción, Edificio Administrativo',
        emergencyContact: 'Ana Torres',
        emergencyPhone: '+56956789012',
        schedule: 'Flexible',
        workDays: 'lunes,martes,miércoles,jueves,viernes,sábado',
        maxHoursPerWeek: 36,
        rating: 4.0,
        isAvailable: true,
        notes: 'Guardia de apoyo - Cubre descansos y ausencias'
      }
    ];

    let guardNumber = 1001;
    for (const guardData of guardsToCreate) {
      const guard = guardRepository.create({
        ...guardData,
        guardNumber: guardNumber++
      });
      await guardRepository.save(guard);
      console.log(`✅ Guardia #${guard.guardNumber} creado: ${createdUsers[guardNumber-1002].names}`);
    }

    console.log('🎉 5 Guardias creados para horario Lunes-Sábado!');

  } catch (error) {
    console.error('❌ Error al crear guardias por defecto:', error);
  }
}