// entities/ReportEntity.js - VERSIÓN CORREGIDA
'use strict';
import { EntitySchema } from 'typeorm';

export const ReportEntity = new EntitySchema({
    name: 'Report',
    tableName: 'reports',
    columns: {
        id: {
            primary: true,
            type: 'int',
            generated: 'increment',
        },
        reportType: {
            type: 'varchar',
            length: 50,
            nullable: false,
            name: 'report_type'
        },
        reportSubType: {
            type: 'varchar',
            length: 50,
            nullable: true,
            name: 'report_sub_type'
        },
        title: {
            type: 'varchar',
            length: 255,
            nullable: false,
        },
        description: {
            type: 'text',
            nullable: true,
        },
        periodStart: {
            type: 'date',
            nullable: false,
            name: 'period_start'
        },
        periodEnd: {
            type: 'date',
            nullable: false,
            name: 'period_end'
        },
        data: {
            type: 'json',
            nullable: false,
        },
        status: {
            type: 'enum',
            enum: ['generated', 'reviewed', 'approved', 'executed', 'archived'],
            default: 'generated'
        },
        generatedBy: {
            type: 'int',
            nullable: false,
            name: 'generated_by'
        },
        reviewedBy: {
            type: 'int',
            nullable: true,
            name: 'reviewed_by'
        },
        executedBy: {
            type: 'int',
            nullable: true,
            name: 'executed_by'
        },
        executionDetails: {
            type: 'json',
            nullable: true,
            name: 'execution_details'
        },
        notes: {
            type: 'text',
            nullable: true,
        },
        bikerackId: {
            type: 'int',
            nullable: true,
            name: 'bikerack_id'
        },
        createdAt: {
            type: 'timestamp',
            createDate: true,
            default: () => 'CURRENT_TIMESTAMP',
            name: 'created_at'
        },
        updatedAt: {
            type: 'timestamp',
            updateDate: true,
            default: () => 'CURRENT_TIMESTAMP',
            name: 'updated_at'
        }
    },
    relations: {
        generatedByUser: {
            target: 'User',
            type: 'many-to-one',
            joinColumn: { 
                name: 'generated_by'
                // NO PONGAS referencedColumnName aquí - por defecto es 'id'
            },
            nullable: false,
            eager: false
        },
        reviewedByUser: {
            target: 'User',
            type: 'many-to-one',
            joinColumn: { 
                name: 'reviewed_by'
                // NO PONGAS referencedColumnName aquí
            },
            nullable: true,
            eager: false
        },
        executedByUser: {
            target: 'User',
            type: 'many-to-one',
            joinColumn: { 
                name: 'executed_by'
                // NO PONGAS referencedColumnName aquí
            },
            nullable: true,
            eager: false
        },
        bikerack: {
            target: 'Bikerack',
            type: 'many-to-one',
            joinColumn: { 
                name: 'bikerack_id'
                // NO PONGAS referencedColumnName aquí
            },
            nullable: true,
            eager: false
        }
    }
});

export default ReportEntity;