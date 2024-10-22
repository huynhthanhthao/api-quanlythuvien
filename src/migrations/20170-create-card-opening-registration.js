"use strict";

module.exports = {
    up: async (queryInterface, Sequelize) => {
        await queryInterface.createTable("CardOpeningRegistrations", {
            id: {
                allowNull: false,
                autoIncrement: true,
                primaryKey: true,
                type: Sequelize.BIGINT,
            },
            schoolId: {
                type: Sequelize.BIGINT,
                references: {
                    model: "Schools",
                    key: "id",
                },
                onDelete: "SET NULL",
                onUpdate: "CASCADE",
            },
            feeId: {
                type: Sequelize.BIGINT,
                references: {
                    model: "CardOpeningFees",
                    key: "id",
                },
                onDelete: "SET NULL",
                onUpdate: "CASCADE",
            },
            fullName: {
                type: Sequelize.STRING,
            },
            cardId: {
                type: Sequelize.STRING,
            },
            email: {
                type: Sequelize.STRING,
            },
            phone: {
                type: Sequelize.STRING,
            },
            photo3x4: {
                type: Sequelize.TEXT,
            },
            cardFrontPhoto: {
                type: Sequelize.TEXT,
            },
            cardBackPhoto: {
                type: Sequelize.TEXT,
            },
            formPhoto: {
                type: Sequelize.TEXT,
            },
            isConfirmed: {
                type: Sequelize.BOOLEAN,
            },
            active: {
                type: Sequelize.BOOLEAN,
            },
            updatedBy: {
                type: Sequelize.BIGINT,
                references: {
                    model: "Accounts",
                    key: "id",
                },
                onDelete: "SET NULL",
                onUpdate: "CASCADE",
            },
            createdAt: {
                allowNull: false,
                type: "TIMESTAMP",
                defaultValue: Sequelize.literal("CURRENT_TIMESTAMP"),
            },
            updatedAt: {
                allowNull: false,
                type: "TIMESTAMP",
                defaultValue: Sequelize.literal("CURRENT_TIMESTAMP"),
            },
        });
    },

    down: async (queryInterface, Sequelize) => {
        await queryInterface.dropTable("CardOpeningRegistrations");
    },
};
