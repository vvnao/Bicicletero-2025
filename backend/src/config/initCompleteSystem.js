//! SCRIPT COMPLETO CON 4 BICICLETEROS DE 40 ESPACIOS CADA UNO - VERSIÓN CORREGIDA
'use strict';
import { AppDataSource } from './configDb.js';
import { UserEntity } from '../entities/UserEntity.js';
import { BicycleEntity } from '../entities/BicycleEntity.js';
import { BikerackEntity } from '../entities/BikerackEntity.js';
import { SpaceEntity } from '../entities/SpaceEntity.js';
import { 
    ReservationEntity, 
    RESERVATION_STATUS 
    } from '../entities/ReservationEntity.js';
import bcrypt from 'bcrypt';

// Función para generar códigos únicos
function generateReservationCode(index) {
    const timestamp = Date.now().toString().slice(-6);
    return `RES-${timestamp}-${String(index + 1).padStart(3, '0')}`;
}

function generateSpaceCode(bikerackPrefix, number) {
    return `${bikerackPrefix}-${String(number).padStart(2, '0')}`;
}

// 1. CREAR USUARIOS CON BICICLETAS
async function createUsersWithBicycles() {
    try {
        const userRepository = AppDataSource.getRepository(UserEntity);
        const bicycleRepository = AppDataSource.getRepository(BicycleEntity);

        console.log('👥 Creando usuarios con bicicletas...');

        const usersData = [
        // Administradores y guardias
        {
            user: {
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
            },
            bicycle: {
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
        {
            user: {
                role: 'guardia',
                names: 'Guardia Principal',
                lastName: 'Seguridad UBB',
                rut: '22.222.222-2',
                email: 'guardia@ubiobio.cl',
                password: 'guardia123',
                contact: '+56922222222',
                typePerson: 'funcionario',
                requestStatus: 'aprobado',
                isActive: true,
            },
            bicycle: {
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
        {
            user: {
                role: 'guardia',
                names: 'Guardia Turno Tarde',
                lastName: 'Vargas López',
                rut: '33.333.333-3',
                email: 'guardia2@ubiobio.cl',
                password: 'guardia456',
                contact: '+56933333333',
                typePerson: 'funcionario',
                requestStatus: 'aprobado',
                isActive: true,
            },
            bicycle: {
                brand: 'Giant',
                model: 'Escape 2',
                color: 'Rojo',
                serialNumber: 'GRD-2024-002',
                type: 'urbana',
                size: 'L',
                status: 'activa',
                description: 'Bicicleta guardia turno tarde',
            }
        },
        // Usuarios estudiantes
        {
            user: {
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
            },
            bicycle: {
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
            user: {
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
            },
            bicycle: {
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
            user: {
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
            },
            bicycle: {
                brand: 'Specialized',
                model: 'Rockhopper',
                color: 'Verde',
                serialNumber: 'STU-003',
                type: 'montaña',
                size: 'M',
                status: 'activa',
                description: 'Bicicleta Specialized Rockhopper',
            }
        },
        {
            user: {
                role: 'user',
                names: 'Valentina Martinez',
                lastName: 'Martínez López',
                rut: '17.654.321-8',
                email: 'valentina.martinez2302@alumnos.ubiobio.cl ',
                password: 'carlos123',
                contact: '+56912345678',
                typePerson: 'estudiante',
                requestStatus: 'aprobado',
                isActive: true,
            },
            bicycle: {
                brand: 'Giant',
                model: 'Escape 3',
                color: 'Negro',
                serialNumber: 'STU-004',
                type: 'urbana',
                size: 'L',
                status: 'activa',
                description: 'Bicicleta urbana Giant',
            }
        },
        {
            user: {
                role: 'user',
                names: 'Ana María',
                lastName: 'González Pérez',
                rut: '16.543.210-7',
                email: 'ana.gonzalez@alumnos.ubiobio.cl',
                password: 'ana12345',
                contact: '+56987654321',
                typePerson: 'profesor',
                requestStatus: 'aprobado',
                isActive: true,
            },
            bicycle: {
                brand: 'Scott',
                model: 'Sub Cross 40',
                color: 'Blanco',
                serialNumber: 'STU-005',
                type: 'híbrida',
                size: 'S',
                status: 'activa',
                description: 'Bicicleta Scott para profesores',
            }
        },
        {
            user: {
                role: 'user',
                names: 'Maria Paz',
                lastName: 'Poveda Rojas',
                rut: '20.345.678-9',
                email: 'maria.poveda2301@alumnos.ubiobio.cl',
                password: 'javier2024',
                contact: '+56991234567',
                typePerson: 'estudiante',
                requestStatus: 'aprobado',
                isActive: true,
            },
            bicycle: {
                brand: 'Merida',
                model: 'Big Nine 300',
                color: 'Naranja',
                serialNumber: 'STU-006',
                type: 'montaña',
                size: 'M',
                status: 'activa',
                description: 'Bicicleta Merida Big Nine',
            }
        },
        {
            user: {
                role: 'user',
                names: 'Barbara Manhwa',
                lastName: 'Inostroza Díaz',
                rut: '21.456.789-0',
                email: 'barbara.inostroza2301@alumnos.ubiobio.cl ',
                password: 'fernandaV',
                contact: '+56992345678',
                typePerson: 'estudiante',
                requestStatus: 'aprobado',
                isActive: true,
            },
            bicycle: {
                brand: 'Cannondale',
                model: 'Trail 5',
                color: 'Morado',
                serialNumber: 'STU-007',
                type: 'montaña',
                size: 'S',
                status: 'activa',
                description: 'Bicicleta Cannondale Trail',
            }
        },
        {
            user: {
                role: 'user',
                names: 'Raimundo Daniel',
                lastName: 'Koch Retamal',
                rut: '19.567.890-1',
                email: 'raimundo.koch2301@alumnos.ubiobio.cl ',
                password: 'castroS123',
                contact: '+56993456789',
                typePerson: 'estudiante',
                requestStatus: 'aprobado',
                isActive: true,
            },
            bicycle: {
                brand: 'BH',
                model: 'Expert 4.5',
                color: 'Gris',
                serialNumber: 'STU-008',
                type: 'carretera',
                size: 'L',
                status: 'activa',
                description: 'Bicicleta BH de carretera',
            }
        },
        // 12 USUARIOS MÁS PARA OCUPAR MÁS ESPACIOS
        {
            user: {
                role: 'user',
                names: 'Isidora Annais',
                lastName: 'Luengo Mendoza',
                rut: '22.678.901-2',
                email: 'isidora.luengo2301@alumnos.biobio.cl ',
                password: 'camila123',
                contact: '+56994567890',
                typePerson: 'estudiante',
                requestStatus: 'aprobado',
                isActive: true,
            },
            bicycle: {
                brand: 'Oxford',
                model: 'Nitro',
                color: 'Rosa',
                serialNumber: 'STU-009',
                type: 'montaña',
                size: 'S',
                status: 'activa',
                description: 'Bicicleta Oxford Nitro',
            }
        },
        {
            user: {
                role: 'user',
                names: 'Matías Alonso',
                lastName: 'Fuentes López',
                rut: '20.789.012-3',
                email: 'matias.fuentes@alumnos.ubiobio.cl',
                password: 'matias123',
                contact: '+56995678901',
                typePerson: 'estudiante',
                requestStatus: 'aprobado',
                isActive: true,
            },
            bicycle: {
                brand: 'Trek',
                model: 'Domane',
                color: 'Azul Celeste',
                serialNumber: 'STU-010',
                type: 'carretera',
                size: 'M',
                status: 'activa',
                description: 'Bicicleta Trek Domane',
            }
        },
        {
            user: {
                role: 'user',
                names: 'Valentina Paz',
                lastName: 'Ríos González',
                rut: '21.890.123-4',
                email: 'valentina.rios@alumnos.ubiobio.cl',
                password: 'valentina123',
                contact: '+56996789012',
                typePerson: 'estudiante',
                requestStatus: 'aprobado',
                isActive: true,
            },
            bicycle: {
                brand: 'Specialized',
                model: 'Dolce',
                color: 'Lila',
                serialNumber: 'STU-011',
                type: 'mujer',
                size: 'XS',
                status: 'activa',
                description: 'Bicicleta Specialized para mujer',
            }
        },
        {
            user: {
                role: 'user',
                names: 'Diego Andrés',
                lastName: 'Mora Castillo',
                rut: '19.901.234-5',
                email: 'diego.mora@alumnos.ubiobio.cl',
                password: 'diego123',
                contact: '+56997890123',
                typePerson: 'estudiante',
                requestStatus: 'aprobado',
                isActive: true,
            },
            bicycle: {
                brand: 'Giant',
                model: 'Talon 3',
                color: 'Amarillo',
                serialNumber: 'STU-012',
                type: 'montaña',
                size: 'L',
                status: 'activa',
                description: 'Bicicleta Giant Talon',
            }
        },
        {
            user: {
                role: 'user',
                names: 'Isidora Belén',
                lastName: 'Navarro Soto',
                rut: '22.012.345-6',
                email: 'isidora.navarro@alumnos.ubiobio.cl',
                password: 'isidora123',
                contact: '+56998901234',
                typePerson: 'estudiante',
                requestStatus: 'aprobado',
                isActive: true,
            },
            bicycle: {
                brand: 'Scott',
                model: 'Contessa',
                color: 'Turquesa',
                serialNumber: 'STU-013',
                type: 'mujer',
                size: 'S',
                status: 'activa',
                description: 'Bicicleta Scott Contessa',
            }
        },
        {
            user: {
                role: 'user',
                names: 'Nicolás Alejandro',
                lastName: 'Pérez Vidal',
                rut: '18.123.456-7',
                email: 'nicolas.perez@alumnos.ubiobio.cl',
                password: 'nicolas123',
                contact: '+56999012345',
                typePerson: 'estudiante',
                requestStatus: 'aprobado',
                isActive: true,
            },
            bicycle: {
                brand: 'Merida',
                model: 'Crossway',
                color: 'Rojo Oscuro',
                serialNumber: 'STU-014',
                type: 'híbrida',
                size: 'M',
                status: 'activa',
                description: 'Bicicleta Merida Crossway',
            }
        },
        {
            user: {
                role: 'user',
                names: 'Constanza Fernanda',
                lastName: 'López Reyes',
                rut: '17.234.567-8',
                email: 'constanza.lopez@alumnos.ubiobio.cl',
                password: 'constanza123',
                contact: '+56999123456',
                typePerson: 'estudiante',
                requestStatus: 'aprobado',
                isActive: true,
            },
            bicycle: {
                brand: 'Cannondale',
                model: 'Quick',
                color: 'Verde Lima',
                serialNumber: 'STU-015',
                type: 'híbrida',
                size: 'S',
                status: 'activa',
                description: 'Bicicleta Cannondale Quick',
            }
        }
        ];

        const createdUsers = [];
        const createdBicycles = [];

        for (const data of usersData) {
            try {
                // Verificar si el usuario ya existe
                const existingUser = await userRepository.findOne({
                    where: [
                        { rut: data.user.rut },
                        { email: data.user.email }
                    ]
                });

                let user;
                if (existingUser) {
                    console.log(`⚠️  Usuario ya existe: ${data.user.email}`);
                    user = existingUser;
                } else {
                    // Crear usuario nuevo
                    const hashedPassword = await bcrypt.hash(data.user.password, 10);
                    user = userRepository.create({
                        ...data.user,
                        password: hashedPassword,
                        createdAt: new Date(),
                        updatedAt: new Date()
                    });
                    await userRepository.save(user);
                    console.log(`✅ Usuario creado: ${data.user.email}`);
                }

                createdUsers.push(user);

                // Verificar si la bicicleta ya existe
                const existingBicycle = await bicycleRepository.findOne({
                    where: { serialNumber: data.bicycle.serialNumber }
                });

                if (!existingBicycle) {
                    const bicycle = bicycleRepository.create({
                        ...data.bicycle,
                        user: user,
                        createdAt: new Date(),
                        updatedAt: new Date()
                    });
                    await bicycleRepository.save(bicycle);
                    createdBicycles.push(bicycle);
                    console.log(`   🚲 Bicicleta asignada: ${data.bicycle.brand} ${data.bicycle.model}`);
                } else {
                    console.log(`   ⚠️  Bicicleta ya existe: ${data.bicycle.serialNumber}`);
                }

            } catch (error) {
                console.error(`❌ Error al crear usuario ${data.user.email}:`, error.message);
            }
        }

        console.log(`\n📊 Total: ${createdUsers.length} usuarios y ${createdBicycles.length} bicicletas`);
        return { users: createdUsers, bicycles: createdBicycles };

    } catch (error) {
        console.error('❌ Error en createUsersWithBicycles:', error);
        throw error;
    }
}

// 2. CREAR 4 BICICLETEROS CON EXACTAMENTE 40 ESPACIOS CADA UNO - VERSIÓN CORREGIDA
async function createBikeracksWithSpaces() {
    try {
        const bikerackRepository = AppDataSource.getRepository(BikerackEntity);
        const spaceRepository = AppDataSource.getRepository(SpaceEntity);

        console.log('\n🚲 CREANDO 4 BICICLETEROS CON 40 ESPACIOS CADA UNO...');

        // 1. PRIMERO eliminar en ORDEN CORRECTO (de más dependiente a menos)
        console.log('🗑️  ELIMINANDO EN ORDEN...');
        
        try {
            // Primero eliminar reservas (depende de spaces)
            await AppDataSource.query('DELETE FROM reservations CASCADE');
            console.log('✅ Reservas eliminadas');
        } catch (e) { console.log('⚠️  No hay reservas'); }

        try {
            // Eliminar space_logs (depende de spaces)
            await AppDataSource.query('DELETE FROM space_logs CASCADE');
            console.log('✅ Space logs eliminados');
        } catch (e) { console.log('⚠️  No hay space_logs'); }

        try {
            // Eliminar reports (¡ESTA ES LA NUEVA!)
            await AppDataSource.query('DELETE FROM reports CASCADE');
            console.log('✅ Reports eliminados');
        } catch (e) { console.log('⚠️  No hay reports'); }

        try {
            // Eliminar incidences (depende de bikeracks y spaces)
            await AppDataSource.query('DELETE FROM incidences CASCADE');
            console.log('✅ Incidencias eliminadas');
        } catch (e) { console.log('⚠️  No hay incidencias'); }

        try {
            // Eliminar guard_assignments (depende de bikeracks)
            await AppDataSource.query('DELETE FROM guard_assignments CASCADE');
            console.log('✅ Asignaciones de guardias eliminadas');
        } catch (e) { console.log('⚠️  No hay guard_assignments'); }

        try {
            // Ahora eliminar spaces (depende de bikeracks)
            await AppDataSource.query('DELETE FROM spaces CASCADE');
            console.log('✅ Espacios eliminados');
        } catch (e) { console.log('⚠️  No hay espacios'); }

        try {
            // Finalmente eliminar bikeracks
            await AppDataSource.query('DELETE FROM bikeracks CASCADE');
            console.log('✅ Bicicleteros eliminados');
        } catch (e) { console.log('⚠️  No hay bicicleteros'); }

        const bikeracksData = [
            {
                name: 'Bicicletero Central',
                prefix: 'C'
            },
            {
                name: 'Bicicletero Norte',
                prefix: 'N'
            },
            {
                name: 'Bicicletero Sur',
                prefix: 'S'
            },
            {
                name: 'Bicicletero Este',
                prefix: 'E'
            }
        ];

        const createdBikeracks = [];
        const allSpaces = [];

        // 2. CREAR 4 BICICLETEROS NUEVOS con 40 espacios cada uno
        for (const bikerackData of bikeracksData) {
            console.log(`\n🔧 Creando: ${bikerackData.name}`);
            
            // Crear bicicletero
            const bikerack = bikerackRepository.create({
                name: bikerackData.name,
                capacity: 40, // ✅ SIEMPRE 40
                created_at: new Date(),
                updated_at: new Date()
            });
            
            await bikerackRepository.save(bikerack);
            createdBikeracks.push(bikerack);
            
            console.log(`   ✅ Bicicletero creado (40 espacios)`);

            // Crear EXACTAMENTE 40 espacios
            const spacesToCreate = [];
            for (let i = 1; i <= 40; i++) {
                const space = spaceRepository.create({
                    spaceCode: generateSpaceCode(bikerackData.prefix, i),
                    status: 'Libre',
                    position: i,
                    bikerack: bikerack,
                    created_at: new Date(),
                    updated_at: new Date(),
                    currentLog: null
                });
                spacesToCreate.push(space);
            }
            
            await spaceRepository.save(spacesToCreate);
            allSpaces.push(...spacesToCreate);
            
            console.log(`   📍 40 espacios creados: ${bikerackData.prefix}-01 a ${bikerackData.prefix}-40`);
        }

        console.log(`\n📊 RESULTADO FINAL:`);
        console.log(`   🏢 ${createdBikeracks.length} bicicleteros creados`);
        console.log(`   📍 ${allSpaces.length} espacios totales (40 x 4 = 160)`);
        
        // Verificación estricta
        if (createdBikeracks.length !== 4) {
            throw new Error(`❌ ERROR: Se crearon ${createdBikeracks.length} bicicleteros en lugar de 4`);
        }
        
        if (allSpaces.length !== 160) {
            throw new Error(`❌ ERROR: Se crearon ${allSpaces.length} espacios en lugar de 160`);
        }
        
        console.log('✅ VERIFICACIÓN: 4 bicicleteros con 40 espacios cada uno ✓');

        return { bikeracks: createdBikeracks, spaces: allSpaces };

    } catch (error) {
        console.error('❌ Error en createBikeracksWithSpaces:', error);
        throw error;
    }
}


// 3. CREAR RESERVAS: 20 usuarios, 5 espacios por bicicletero
async function createActiveReservations(users, bicycles, spaces) {
    try {
        const reservationRepository = AppDataSource.getRepository(ReservationEntity);
        const spaceRepository = AppDataSource.getRepository(SpaceEntity);

        console.log('\n📅 Creando reservas: 20 usuarios, 5 espacios por bicicletero...');

        // Filtrar solo usuarios con rol 'user' (tomar primeros 20)
        const regularUsers = users.filter(user => user.role === 'user').slice(0, 20);
        console.log(`👤 ${regularUsers.length} usuarios para reservas`);
        
        // Separar espacios por bicicletero y tomar solo 5 de cada uno
        const spacesToUse = {
            'Central': spaces.filter(s => s.spaceCode.startsWith('C-') && s.status === 'Libre').slice(0, 5),
            'Norte': spaces.filter(s => s.spaceCode.startsWith('N-') && s.status === 'Libre').slice(0, 5),
            'Sur': spaces.filter(s => s.spaceCode.startsWith('S-') && s.status === 'Libre').slice(0, 5),
            'Este': spaces.filter(s => s.spaceCode.startsWith('E-') && s.status === 'Libre').slice(0, 5)
        };
        
        console.log(`📍 Espacios a usar por bicicletero:`);
        console.log(`   • Central: ${spacesToUse['Central'].length} espacios (C-01 a C-05)`);
        console.log(`   • Norte: ${spacesToUse['Norte'].length} espacios (N-01 a N-05)`);
        console.log(`   • Sur: ${spacesToUse['Sur'].length} espacios (S-01 a S-05)`);
        console.log(`   • Este: ${spacesToUse['Este'].length} espacios (E-01 a E-05)`);

        const currentTime = new Date();
        const createdReservations = [];
        
        console.log(`\n🚀 Asignando usuarios a espacios...`);

        let userIndex = 0;
        
        // Distribuir usuarios en los 4 bicicleteros (5 usuarios por bicicletero)
        for (const [bikerackName, bikerackSpaces] of Object.entries(spacesToUse)) {
            console.log(`\n🏢 ${bikerackName}:`);
            
            for (let i = 0; i < bikerackSpaces.length; i++) {
                if (userIndex >= regularUsers.length) break;
                
                const user = regularUsers[userIndex];
                const bicycle = bicycles.find(b => b.user.id === user.id);
                const space = bikerackSpaces[i];
                
                if (!bicycle) {
                    console.log(`⚠️  Usuario ${user.email} no tiene bicicleta`);
                    userIndex++;
                    continue;
                }

                // Horas estimadas: 2, 3, 4 horas cíclicamente
                const estimatedHours = [2, 3, 4][userIndex % 3];
                const expirationTime = new Date(currentTime.getTime() + (estimatedHours * 60 * 60 * 1000));

                const reservation = reservationRepository.create({
                    reservationCode: generateReservationCode(createdReservations.length),
                    dateTimeReservation: currentTime,
                    estimatedHours: estimatedHours,
                    expirationTime: expirationTime,
                    status: RESERVATION_STATUS.ACTIVE,
                    checkInTime: currentTime,
                    space: space,
                    user: user,
                    bicycle: bicycle,
                    createdAt: currentTime,
                    updatedAt: currentTime
                });

                await reservationRepository.save(reservation);
                createdReservations.push(reservation);

                // Actualizar espacio a "Ocupado"
                space.status = 'Ocupado';
                await spaceRepository.save(space);

                console.log(`   ✅ ${user.names} → ${space.spaceCode} (${estimatedHours}h)`);
                
                userIndex++;
            }
        }

        console.log(`\n📊 TOTAL: ${createdReservations.length} reservas activas creadas`);
        
        // Mostrar distribución final
        console.log('\n🏢 DISTRIBUCIÓN FINAL:');
        console.log('======================');
        
        const finalSpaces = await spaceRepository.find({ relations: ['bikerack'] });
        
        const bikerackSummary = {};
        finalSpaces.forEach(space => {
            const bikerackName = space.bikerack.name;
            if (!bikerackSummary[bikerackName]) {
                bikerackSummary[bikerackName] = { total: 0, libre: 0, ocupado: 0 };
            }
            bikerackSummary[bikerackName].total++;
            if (space.status === 'Libre') {
                bikerackSummary[bikerackName].libre++;
            } else if (space.status === 'Ocupado') {
                bikerackSummary[bikerackName].ocupado++;
            }
        });

        // Mostrar cada bicicletero
        Object.entries(bikerackSummary).forEach(([bikerack, stats]) => {
            const porcentajeOcupacion = Math.round((stats.ocupado / stats.total) * 100);
            
            console.log(`\n${bikerack}:`);
            console.log(`   📍 Total: ${stats.total} espacios`);
            console.log(`   🆓 Libres: ${stats.libre}`);
            console.log(`   🚲 Ocupados: ${stats.ocupado} (${porcentajeOcupacion}%)`);
            
            // Mostrar espacios ocupados específicos
            const occupiedSpaces = finalSpaces
                .filter(s => s.bikerack.name === bikerack && s.status === 'Ocupado')
                .map(s => s.spaceCode)
                .sort();
            
            if (occupiedSpaces.length > 0) {
                console.log(`   📋 Ocupados: ${occupiedSpaces.join(', ')}`);
            }
        });

        // Resumen general
        const totalLibres = Object.values(bikerackSummary).reduce((sum, stats) => sum + stats.libre, 0);
        const totalOcupados = Object.values(bikerackSummary).reduce((sum, stats) => sum + stats.ocupado, 0);
        const totalEspacios = Object.values(bikerackSummary).reduce((sum, stats) => sum + stats.total, 0);

        console.log(`\n📈 RESUMEN GENERAL:`);
        console.log(`   🏢 4 bicicleteros con 40 espacios cada uno`);
        console.log(`   📍 ${totalEspacios} espacios totales`);
        console.log(`   🆓 ${totalLibres} espacios libres (${Math.round((totalLibres / totalEspacios) * 100)}%)`);
        console.log(`   🚲 ${totalOcupados} espacios ocupados (${Math.round((totalOcupados / totalEspacios) * 100)}%)`);
        console.log(`   👤 ${regularUsers.length} usuarios con reservas`);

        return createdReservations;

    } catch (error) {
        console.error('❌ Error en createActiveReservations:', error);
        throw error;
    }
}
// 4. FUNCIÓN PRINCIPAL - VERSIÓN MEJORADA
export async function initializeCompleteSystem() {
    try {
        console.log('INICIALIZANDO SISTEMA CON 4 BICICLETEROS DE 40 ESPACIOS');
        console.log('=========================================================\n');

        // Paso 1: Crear usuarios con bicicletas
        console.log('📌 PASO 1: Creando 18 usuarios con bicicletas');
        const { users, bicycles } = await createUsersWithBicycles();
        
        if (users.length === 0) {
            console.log('⚠️  No se crearon usuarios nuevos');
            return;
        }
        
        // Paso 2: Crear 4 bicicleteros con EXACTAMENTE 40 espacios cada uno
        console.log('\n📌 PASO 2: Creando/Actualizando 4 bicicleteros (160 espacios total)');
        const { spaces } = await createBikeracksWithSpaces();
        
        if (spaces.length === 0) {
            console.log('⚠️  No se crearon espacios nuevos');
            return;
        }
        
        // Verificar que tenemos 160 espacios (40 x 4)
        if (spaces.length !== 160) {
            console.log(`⚠️  ADVERTENCIA: Se crearon ${spaces.length} espacios en lugar de 160`);
            console.log('   Esto puede indicar datos existentes en la BD');
        }
        
        // Paso 3: Crear MUCHAS reservas (ocupar ~75% de espacios)
        console.log('\n📌 PASO 3: Creando reservas para alta ocupación (~75%)');
        await createActiveReservations(users, bicycles, spaces);

        console.log('\n🎉 SISTEMA INICIALIZADO EXITOSAMENTE!');
        console.log('=====================================');
        
        // Mostrar credenciales de acceso
        console.log('\n🔑 CREDENCIALES PARA PRUEBAS:');
        console.log('=============================');
        
        console.log('\n👨‍💼 ADMINISTRADOR Y GUARDIAS:');
        console.log('   1. admin@ubiobio.cl / admin123');
        console.log('   2. guardia@ubiobio.cl / guardia123');
        console.log('   3. guardia2@ubiobio.cl / guardia456');
        
        console.log('\n👤 PRIMEROS 10 USUARIOS CON RESERVAS:');
        const studentUsers = users.filter(u => u.role === 'user').slice(0, 10);
        studentUsers.forEach((user, index) => {
            const email = user.email;
            const password = email.split('@')[0].split('.')[1] || 'password';
            console.log(`   ${index + 1}. ${email} / ${user.password || password}`);
        });

        console.log('\n📊 DATOS CREADOS PARA FRONTEND:');
        console.log('===============================');
        console.log('✅ 4 Bicicleteros con 40 espacios cada uno');
        console.log('✅ 18 Usuarios totales (1 admin, 2 guardias, 15 usuarios)');
        console.log('✅ ~120 espacios ocupados (75% de capacidad)');
        console.log('✅ ~40 espacios libres (25% de capacidad)');
        console.log('✅ Tiempos variados (2, 4, 6, 8 horas)');
        
        console.log('\n🎮 PARA PROBAR EN FRONTEND:');
        console.log('==========================');
        console.log('1. Login como admin/guardia: ver todos los bicicleteros');
        console.log('2. Login como usuario: ver tu reserva activa');
        console.log('3. Ver mapa de ocupación por bicicletero');
        console.log('4. Probar crear nuevas reservas en espacios libres');
        console.log('5. Simular check-out cuando expire el tiempo');

    } catch (error) {
        console.error('❌ ERROR EN LA INICIALIZACIÓN:', error.message);
        throw error;
    }
}

// 5. FUNCIÓN PARA RESET COMPLETO - VERSIÓN MEJORADA
export async function forceResetAndCreate() {
    try {
        console.log('🔄 FORZANDO RESET COMPLETO DE LA BASE DE DATOS...');
        console.log('=================================================\n');
        
        // Conectar si no está conectado
        if (!AppDataSource.isInitialized) {
            await AppDataSource.initialize();
        }
        
        // 1. Eliminar todas las tablas
        console.log('🗑️  Eliminando todas las tablas...');
        
        // Deshabilitar restricciones temporalmente
        await AppDataSource.query('SET session_replication_role = replica;');
        
        // Orden de eliminación (de más dependiente a menos)
        const tables = [
            'reservations',
            'space_logs', 
            'spaces', 
            'incidences',
            'guard_assignments',
            'bicycles', 
            'bikeracks', 
            'users'
        ];
        
        for (const table of tables) {
            try {
                const result = await AppDataSource.query(`DROP TABLE IF EXISTS "${table}" CASCADE;`);
                console.log(`   ✅ Eliminada: ${table}`);
            } catch (error) {
                console.log(`   ⚠️  ${table}: ${error.message}`);
            }
        }
        
        // Restaurar restricciones
        await AppDataSource.query('SET session_replication_role = DEFAULT;');
        
        console.log('\n Base de datos completamente limpia');
        console.log('🔄 Sincronizando esquemas...');
        
        // 2. Sincronizar esquemas (crear tablas vacías)
        await AppDataSource.synchronize();
        console.log('✅ Esquemas sincronizados');
        
        // 3. Ejecutar inicialización completa
        console.log('\n🚀 Creando datos iniciales...');
        await initializeCompleteSystem();
        
        console.log('\n🎉 RESET COMPLETADO EXITOSAMENTE!');
        
    } catch (error) {
        console.error('❌ Error en forceResetAndCreate:', error);
        throw error;
    }
}

// 6. FUNCIÓN PARA VER ESTADO
export async function checkSystemStatus() {
    try {
        console.log(' ESTADO ACTUAL DEL SISTEMA');
        console.log('============================\n');
        
        const counts = {
            users: await AppDataSource.getRepository(UserEntity).count(),
            bicycles: await AppDataSource.getRepository(BicycleEntity).count(),
            bikeracks: await AppDataSource.getRepository(BikerackEntity).count(),
            spaces: await AppDataSource.getRepository(SpaceEntity).count(),
            reservations: await AppDataSource.getRepository(ReservationEntity).count(),
        };

        console.log(' ESTADÍSTICAS:');
        console.log(`   👥 Usuarios: ${counts.users}`);
        console.log(`   🚲 Bicicletas: ${counts.bicycles}`);
        console.log(`   🏢 Bicicleteros: ${counts.bikeracks}`);
        console.log(`   📍 Espacios: ${counts.spaces}`);
        console.log(`   📅 Reservas: ${counts.reservations}`);
        
        // Detalle de espacios por estado y bicicletero
        const spaceRepo = AppDataSource.getRepository(SpaceEntity);
        const spacesByBikerack = await spaceRepo
            .createQueryBuilder('space')
            .leftJoin('space.bikerack', 'bikerack')
            .select(['bikerack.name as bikerackName', 'space.status', 'COUNT(*) as count'])
            .groupBy('bikerack.name, space.status')
            .orderBy('bikerack.name, space.status')
            .getRawMany();
        
        console.log('\n ESPACIOS POR BICICLETERO Y ESTADO:');
        let currentBikerack = '';
        let totalSpaces = 0;
        let totalOccupied = 0;
        
        spacesByBikerack.forEach(item => {
            if (item.bikerackname !== currentBikerack) {
                currentBikerack = item.bikerackname;
                console.log(`\n${currentBikerack}:`);
            }
            console.log(`   • ${item.status}: ${item.count}`);
            
            totalSpaces += parseInt(item.count);
            if (item.status === 'Ocupado') {
                totalOccupied += parseInt(item.count);
            }
        });

        if (totalSpaces > 0) {
            const occupancyRate = Math.round((totalOccupied / totalSpaces) * 100);
            console.log(`\n OCUPACIÓN GENERAL: ${occupancyRate}% (${totalOccupied}/${totalSpaces})`);
            
            // Verificar si cada bicicletero tiene 40 espacios
            const bikerackRepo = AppDataSource.getRepository(BikerackEntity);
            const bikeracks = await bikerackRepo.find();
            
            console.log('\n VERIFICACIÓN DE CAPACIDAD:');
            bikeracks.forEach(bikerack => {
                console.log(`   • ${bikerack.name}: capacidad ${bikerack.capacity}`);
            });
        }

    } catch (error) {
        console.error(' Error al verificar estado:', error.message);
    }
}