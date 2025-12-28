// src/config/initGuardAssignments.js
'use strict';

import { AppDataSource } from './configDb.js';
import { GuardAssignmentEntity } from '../entities/GuardAssignmentEntity.js';

export async function assignGuardsToBikeracks() {
  try {
    const assignmentRepo = AppDataSource.getRepository(GuardAssignmentEntity);
    const guardRepo = AppDataSource.getRepository('Guard');
    const bikerackRepo = AppDataSource.getRepository('Bikerack');
    
    const count = await assignmentRepo.count();
    if (count > 0) {
      console.log('✅ Ya existen asignaciones de guardias');
      return;
    }
    
    console.log('👮 Asignando guardias a bicicleteros...');
    
    const guards = await guardRepo.find({
      relations: ['user'],
      order: { guardNumber: 'ASC' },
      take: 5
    });
    
    const bikeracks = await bikerackRepo.find({
      order: { id: 'ASC' }
    });
    
    if (guards.length < 3 || bikeracks.length === 0) {
      console.log('⚠️  No hay suficientes guardias o bicicleteros');
      return;
    }
    
    const assignments = [];
    
    // Asignación principal: cada bicicletero tiene un guardia principal
    bikeracks.forEach((bikerack, index) => {
      const guard = guards[index % guards.length];
      
      assignments.push({
        guardId: guard.id,
        bikerackId: bikerack.id,
        assignmentType: 'principal',
        schedule: 'Lunes a Sábado 08:00-17:00',
        startDate: new Date(),
        endDate: null, // Asignación permanente
        status: 'active',
        assignedBy: 1, // ID del administrador
        notes: `Guardia principal asignado por administrador`,
        createdAt: new Date()
      });
    });
    
    // Asignaciones de respaldo
    assignments.push({
      guardId: guards[guards.length - 1].id, // Último guardia
      bikerackId: bikeracks[0].id, // Bicicletero Central
      assignmentType: 'respaldo',
      schedule: 'Lunes a Viernes 12:00-14:00',
      startDate: new Date(),
      endDate: null,
      status: 'active',
      assignedBy: 1,
      notes: 'Guardia de respaldo para horas peak',
      createdAt: new Date()
    });
    
    // Guardar asignaciones
    for (const assignmentData of assignments) {
      const assignment = assignmentRepo.create(assignmentData);
      await assignmentRepo.save(assignment);
    }
    
    console.log(`✅ ${assignments.length} asignaciones creadas`);
    console.log('\n📋 RESUMEN DE ASIGNACIONES:');
    console.log('='.repeat(40));
    
    assignments.forEach((assignment, index) => {
      const bikerack = bikeracks.find(b => b.id === assignment.bikerackId);
      const guard = guards.find(g => g.id === assignment.guardId);
      if (bikerack && guard && guard.user) {
        console.log(`• ${bikerack.name}: ${guard.user.names} (${assignment.schedule})`);
      }
    });
    
  } catch (error) {
    console.error('❌ Error asignando guardias:', error);
  }
}