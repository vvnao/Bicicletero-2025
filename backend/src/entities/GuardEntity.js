import { EntitySchema } from 'typeorm';

export const GuardEntity = new EntitySchema({
    name: 'Guard',
    tableName: 'guards',
    columns: {
        id: {
            primary: true,
            type: 'int',
            generated: 'increment',
        },
        // ❌ ELIMINAR userId - la relación lo crea automáticamente
        // userId: {
        //     type: 'int',
        //     nullable: false,
        //     name: 'user_id'
        // },
        guardNumber: {
            type: 'int',
            unique: true,
            nullable: true,
            name: 'guard_number'
        },
        phone: {
            type: 'varchar',
            length: 20,
            nullable: true,
        },
        address: {
            type: 'text',
            nullable: true,
        },
        emergencyContact: {
            type: 'varchar',
            length: 255,
            nullable: true,
            name: 'emergency_contact'
        },
        emergencyPhone: {
            type: 'varchar',
            length: 20,
            nullable: true,
            name: 'emergency_phone'
        },
        schedule: {
            type: 'varchar',
            length: 100,
            nullable: true,
        },
        workDays: {
            type: 'varchar',
            length: 255,
            nullable: true,
            name: 'work_days'
        },
        maxHoursPerWeek: {
            type: 'int',
            default: 40,
            name: 'max_hours_per_week'
        },
        rating: {
            type: 'decimal',
            precision: 3,
            scale: 2,
            default: 0,
        },
        isAvailable: {
            type: 'boolean',
            default: true,
            name: 'is_available'
        },
        createdAt: {
            type: 'timestamp',
            createDate: true,
            name: 'created_at'
        },
        updatedAt: {
            type: 'timestamp',
            updateDate: true,
            name: 'updated_at'
        },
    },
    relations: {
        user: {
            target: 'User',
            type: 'many-to-one',
            joinColumn: { 
                name: 'user_id',  // ✅ TypeORM creará esta columna
                referencedColumnName: 'id'
            },
            inverseSide: 'guard',
            nullable: false
        },
        assignments: {
            target: 'GuardAssignment',
            type: 'one-to-many',
            inverseSide: 'guard',
        },
    },
});