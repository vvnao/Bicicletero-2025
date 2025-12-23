// entities/GuardEntity.js
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
         userId: {
            type: 'int',
            nullable: false,
        },
        max_hours_per_week: { // Cambié a snake_case
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
        is_available: { // Cambié a snake_case
            type: 'boolean',
            default: true,
            name: 'is_available'
        },
        created_at: { // Cambié a snake_case
            type: 'timestamp',
            createDate: true,
            name: 'created_at'
        },
        updated_at: { // Cambié a snake_case
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
                name: 'user_id',
                referencedColumnName: 'id'
            },
            inverseSide: 'guard',
        },
        assignments: {
            target: 'GuardAssignment',
            type: 'one-to-many',
            inverseSide: 'guard', // Debe coincidir con GuardAssignmentEntity
        },
    },
});