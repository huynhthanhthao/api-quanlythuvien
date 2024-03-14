"use strict";

module.exports = {
    up: async (queryInterface, Sequelize) => {
        await queryInterface.createTable("Roles", {
            id: {
                allowNull: false,
                autoIncrement: true,
                primaryKey: true,
                type: Sequelize.BIGINT,
            },
            roleName: {
                type: Sequelize.STRING,
            },
            roleCode: {
                type: Sequelize.STRING,
            },
            groupId: {
                type: Sequelize.BIGINT,
                references: {
                    model: "GroupRoles",
                    key: "id",
                },
                onDelete: "SET NULL",
                onUpdate: "CASCADE",
            },
            active: {
                type: Sequelize.BOOLEAN,
            },
            createdBy: {
                type: Sequelize.BIGINT,
            },
            updatedBy: {
                type: Sequelize.BIGINT,
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
        await queryInterface.dropTable("Roles");
    },
};
