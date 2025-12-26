// config/initGuardAssignmentsDb.js - LUNES A SÁBADO
'use strict';
import { AppDataSource } from './configDb.js';
import { GuardAssignmentEntity } from '../entities/GuardAssignmentEntity.js';
import { GuardEntity } from '../entities/GuardEntity.js';
import { BikerackEntity } from '../entities/BikerackEntity.js';

export async function createDefaultGuardAssignments() {
  try {
    const assignmentRepository = AppDataSource.getRepository(GuardAssignmentEntity);
    const guardRepository = AppDataSource.getRepository(GuardEntity);
    const bikerackRepository = AppDataSource.getRepository(BikerackEntity);

    const count = await assignmentRepository.count();
    if (count > 0) {
      console.log('- Ya existen asignaciones en la base de datos');
      return;
    }

    console.log('- Creando asignaciones para horario Lunes-Sábado...');

    const guards = await guardRepository.find({ 
      relations: ['user'],
      order: { guardNumber: 'ASC' }
    });
    
    const bikeracks = await bikerackRepository.find({
      order: { id: 'ASC' },
      take: 4
    });

    if (guards.length < 5) {
      console.log(`- Se necesitan 5 guardias`);
      return;
    }

    if (bikeracks.length < 4) {
      console.log(`- Se necesitan 4 bicicleteros`);
      return;
    }

    console.log(`- Encontrados ${guards.length} guardias y ${bikeracks.length} bicicleteros`);

    const assignments = [];

    // ============================================
    // ASIGNACIONES DE LUNES A SÁBADO (6 DÍAS)
    // ============================================
    
    // BICICLETERO CENTRAL (#1001 - Carlos)
    // Lunes a Sábado: 08:00-17:00 (con descanso)
    for (let day = 1; day <= 6; day++) { // Lunes=1 a Sábado=6
      // Turno mañana 08:00-12:00
      assignments.push({
        guardId: guards[0].id,
        bikerackId: bikeracks[0].id,
        dayOfWeek: day,
        startTime: '08:00',
        endTime: '12:00',
        schedule: '08:00-12:00',
        workDays: getDayName(day),
        status: 'activo',
        assignedBy: 1,
        effectiveFrom: new Date(),
        effectiveUntil: null,
        notes: 'Turno matutino'
      });

      // Turno tarde 13:00-17:00
      assignments.push({
        guardId: guards[0].id,
        bikerackId: bikeracks[0].id,
        dayOfWeek: day,
        startTime: '13:00',
        endTime: '17:00',
        schedule: '13:00-17:00',
        workDays: getDayName(day),
        status: 'activo',
        assignedBy: 1,
        notes: 'Turno vespertino'
      });
    }

    // BICICLETERO NORTE (#1002 - Ana)
    // Lunes a Sábado: 12:00-20:00 (turno partido)
    for (let day = 1; day <= 6; day++) {
      // Primera parte 12:00-16:00
      assignments.push({
        guardId: guards[1].id,
        bikerackId: bikeracks[1].id,
        dayOfWeek: day,
        startTime: '12:00',
        endTime: '16:00',
        schedule: '12:00-16:00',
        workDays: getDayName(day),
        status: 'activo',
        assignedBy: 1,
        notes: 'Turno tarde'
      });

      // Segunda parte 16:00-20:00
      assignments.push({
        guardId: guards[1].id,
        bikerackId: bikeracks[1].id,
        dayOfWeek: day,
        startTime: '16:00',
        endTime: '20:00',
        schedule: '16:00-20:00',
        workDays: getDayName(day),
        status: 'activo',
        assignedBy: 1,
        notes: 'Turno noche'
      });
    }

    // BICICLETERO SUR (#1003 - Pedro)
    // Lunes a Sábado: 06:00-14:00 (turno partido)
    for (let day = 1; day <= 6; day++) {
      // Madrugada 06:00-10:00
      assignments.push({
        guardId: guards[2].id,
        bikerackId: bikeracks[2].id,
        dayOfWeek: day,
        startTime: '06:00',
        endTime: '10:00',
        schedule: '06:00-10:00',
        workDays: getDayName(day),
        status: 'activo',
        assignedBy: 1,
        notes: 'Turno madrugada'
      });

      // Mañana 10:00-14:00
      assignments.push({
        guardId: guards[2].id,
        bikerackId: bikeracks[2].id,
        dayOfWeek: day,
        startTime: '10:00',
        endTime: '14:00',
        schedule: '10:00-14:00',
        workDays: getDayName(day),
        status: 'activo',
        assignedBy: 1,
        notes: 'Turno mañana'
      });
    }

    // BICICLETERO ESTE (#1004 - María)
    // Lunes a Sábado: 14:00-22:00 (turno partido)
    for (let day = 1; day <= 6; day++) {
      // Tarde 14:00-18:00
      assignments.push({
        guardId: guards[3].id,
        bikerackId: bikeracks[3].id,
        dayOfWeek: day,
        startTime: '14:00',
        endTime: '18:00',
        schedule: '14:00-18:00',
        workDays: getDayName(day),
        status: 'activo',
        assignedBy: 1,
        notes: 'Turno tarde'
      });

      // Noche 18:00-22:00
      assignments.push({
        guardId: guards[3].id,
        bikerackId: bikeracks[3].id,
        dayOfWeek: day,
        startTime: '18:00',
        endTime: '22:00',
        schedule: '18:00-22:00',
        workDays: getDayName(day),
        status: 'activo',
        assignedBy: 1,
        notes: 'Turno noche'
      });
    }

    // ============================================
    // GUARDIA DE APOYO (#1005 - Luis)
    // ============================================
    
    // Lunes a Viernes: Cubre descansos de 1 hora para cada guardia principal
    for (let day = 1; day <= 5; day++) { // Solo Lunes-Viernes
      // Descanso Bicicletero Central (12:00-13:00)
      assignments.push({
        guardId: guards[4].id,
        bikerackId: bikeracks[0].id,
        dayOfWeek: day,
        startTime: '12:00',
        endTime: '13:00',
        schedule: '12:00-13:00',
        workDays: getDayName(day),
        status: 'activo',
        assignedBy: 1,
        notes: 'Cubre descanso de Carlos'
      });

      // Descanso Bicicletero Norte (16:00-17:00)
      assignments.push({
        guardId: guards[4].id,
        bikerackId: bikeracks[1].id,
        dayOfWeek: day,
        startTime: '16:00',
        endTime: '17:00',
        schedule: '16:00-17:00',
        workDays: getDayName(day),
        status: 'activo',
        assignedBy: 1,
        notes: 'Cubre descanso de Ana'
      });

      // Descanso Bicicletero Sur (10:00-11:00)
      assignments.push({
        guardId: guards[4].id,
        bikerackId: bikeracks[2].id,
        dayOfWeek: day,
        startTime: '10:00',
        endTime: '11:00',
        schedule: '10:00-11:00',
        workDays: getDayName(day),
        status: 'activo',
        assignedBy: 1,
        notes: 'Cubre descanso de Pedro'
      });

      // Descanso Bicicletero Este (18:00-19:00)
      assignments.push({
        guardId: guards[4].id,
        bikerackId: bikeracks[3].id,
        dayOfWeek: day,
        startTime: '18:00',
        endTime: '19:00',
        schedule: '18:00-19:00',
        workDays: getDayName(day),
        status: 'activo',
        assignedBy: 1,
        notes: 'Cubre descanso de María'
      });
    }

    // Sábados: Guardia de apoyo cubre medio turno en cada bicicletero
    const saturday = 6;
    for (let bikerackIndex = 0; bikerackIndex < 4; bikerackIndex++) {
      assignments.push({
        guardId: guards[4].id,
        bikerackId: bikeracks[bikerackIndex].id,
        dayOfWeek: saturday,
        startTime: '09:00',
        endTime: '13:00',
        schedule: '09:00-13:00',
        workDays: 'sábado',
        status: 'activo',
        assignedBy: 1,
        notes: `Sábados - Apoyo ${bikeracks[bikerackIndex].name}`
      });
    }

    // ============================================
    // GUARDAR ASIGNACIONES
    // ============================================
    
    let createdCount = 0;
    for (const assignmentData of assignments) {
      try {
        const assignment = assignmentRepository.create(assignmentData);
        await assignmentRepository.save(assignment);
        createdCount++;
      } catch (error) {
        console.error(` Error creando asignación: ${error.message}`);
      }
    }

    console.log(`🎉 ${createdCount} asignaciones creadas para Lunes-Sábado!`);
    
    // RESUMEN DETALLADO
    console.log('\n ==== HORARIOS POR BICICLETERO (Lunes a Sábado): =======');
    console.log('=' .repeat(50));
    
    // Bicicletero Central
    console.log(`\n  ${bikeracks[0].name}:`);
    console.log(`   Guardia: #${guards[0].guardNumber} - ${guards[0].user.names} ${guards[0].user.lastName}`);
    console.log(`   Horario: 08:00-12:00 y 13:00-17:00 (8h diarias)`);
    console.log(`   Descanso: 12:00-13:00 (cubierto por guardia de apoyo)`);
    
    // Bicicletero Norte
    console.log(`\n  ${bikeracks[1].name}:`);
    console.log(`   Guardia: #${guards[1].guardNumber} - ${guards[1].user.names} ${guards[1].user.lastName}`);
    console.log(`   Horario: 12:00-16:00 y 16:00-20:00 (8h diarias)`);
    console.log(`   Descanso: 16:00-17:00 (cubierto por guardia de apoyo)`);
    
    // Bicicletero Sur
    console.log(`\n ${bikeracks[2].name}:`);
    console.log(`   Guardia: #${guards[2].guardNumber} - ${guards[2].user.names} ${guards[2].user.lastName}`);
    console.log(`   Horario: 06:00-10:00 y 10:00-14:00 (8h diarias)`);
    console.log(`   Descanso: 10:00-11:00 (cubierto por guardia de apoyo)`);
    
    // Bicicletero Este
    console.log(`\n  ${bikeracks[3].name}:`);
    console.log(`   Guardia: #${guards[3].guardNumber} - ${guards[3].user.names} ${guards[3].user.lastName}`);
    console.log(`   Horario: 14:00-18:00 y 18:00-22:00 (8h diarias)`);
    console.log(`   Descanso: 18:00-19:00 (cubierto por guardia de apoyo)`);
    
    // Guardia de apoyo
    console.log(`\n- Guardia de Apoyo:`);
    console.log(`   Guardia: #${guards[4].guardNumber} - ${guards[4].user.names} ${guards[4].user.lastName}`);
    console.log(`   Lunes-Viernes: Cubre descansos de 1h (12-13, 16-17, 10-11, 18-19h)`);
    console.log(`   Sábados: Apoya en todos los bicicleteros (09:00-13:00)`);

    // ESTADÍSTICAS
    console.log('\n--ESTADÍSTICAS--');
    console.log('=' .repeat(30));
    console.log(`   Total asignaciones: ${createdCount}`);
    console.log(`   Horas semanales por guardia principal: 48h (8h x 6 días)`);
    console.log(`   Horas semanales guardia apoyo: ~36h`);
    console.log(`   Días de operación: Lunes a Sábado`);
    console.log(`   Domingo: CERRADO`);

  } catch (error) {
    console.error(' Error al crear asignaciones:', error);
  }
}

// Funciones auxiliares
function getDayName(dayIndex) {
  const days = ['domingo', 'lunes', 'martes', 'miércoles', 'jueves', 'viernes', 'sábado'];
  return days[dayIndex] || `día-${dayIndex}`;
}

export { getDayName };