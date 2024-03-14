"use strict";

module.exports = {
    up: async (queryInterface, Sequelize) => {
        await queryInterface.createTable("GroupRoles", {
            id: {
                allowNull: false,
                autoIncrement: true,
                primaryKey: true,
                type: Sequelize.BIGINT,
            },
            groupName: {
                type: Sequelize.STRING,
            },
            groupDes: {
                type: Sequelize.TEXT,
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
        await queryInterface.dropTable("GroupRoles");
    },
};
