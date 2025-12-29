'use strict';

import { EntitySchema } from 'typeorm';

export const NotificationEntity = new EntitySchema({
    name: 'Notification',
    tableName: 'notifications',
    columns: {
        id: {
            primary: true,
            type: 'int',
            generated: 'increment',
        },
        type: {
            type: 'varchar',
            length: 50,
            nullable: false,
        },
        title: {
            type: 'varchar',
            length: 255,
            nullable: false,
        },
        message: {
            type: 'text',
            nullable: false,
        },
        data: {
            type: 'json',
            nullable: true,
        },
        isRead: {
            type: 'boolean',
            default: false,
            name: 'is_read'
        },
        readAt: {
            type: 'timestamp',
            nullable: true,
            name: 'read_at'
        },
        priority: {
            type: 'varchar',
            length: 20,
            default: 'normal'
        },
        createdAt: {
            type: 'timestamp',
            createDate: true,
            default: () => 'CURRENT_TIMESTAMP',
            name: 'created_at'
        }
    },
    relations: {
        user: {
            target: 'User',
            type: 'many-to-one',
            joinColumn: { 
                name: 'user_id'
            },
            nullable: false,
            eager: false
        }
    }
});

export default NotificationEntity;