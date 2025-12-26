import { EntitySchema } from "typeorm";

export const UserReviewEntity = new EntitySchema({
    name: "UserReview",
    tableName: "user_reviews",
    columns: {
        id: {
            primary: true,
            type: "int",
            generated: "increment",
        },
        action: {
            type: "enum",
            enum: ["aprobado", "rechazado"],
            nullable: false,
        },
        comment: {
            type: "text",
            nullable: true,
        },
        created_at: {
            type: "timestamp",
            createDate: true,
            default: () => "CURRENT_TIMESTAMP",
        },
    },
    relations: {
        user: {
            target: "User",
            type: "many-to-one",
            joinColumn: { name: "userId" },
            nullable: false,
            onDelete: "CASCADE",
            inverseSide: "reviews",   
        },
        guard: {
            target: "User",
            type: "many-to-one",
            joinColumn: { name: "guardId" },
            nullable: true,
            onDelete: "SET NULL", // Si el guardia se elimina, mantener el registro de la revisión
            inverseSide: "guardReviews", 
        },
    },
});

export default UserReviewEntity;