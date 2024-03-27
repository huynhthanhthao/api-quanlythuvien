"use strict";

module.exports = {
    up: async (queryInterface, Sequelize) => {
        await queryInterface.createTable("CardOpeningFees", {
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
            fee: {
                type: Sequelize.DOUBLE,
            },
            effect: {
                type: Sequelize.INTEGER,
            },
            active: {
                type: Sequelize.BOOLEAN,
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
        await queryInterface.dropTable("CardOpeningFees");
    },
};
