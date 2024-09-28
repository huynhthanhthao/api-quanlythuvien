"use strict";

const { ACCOUNT_STATUS } = require("../../enums/common");
const { isUnique } = require("../../utils/customer-validate");

module.exports = {
    up: async (queryInterface, Sequelize) => {
        await queryInterface.createTable("Accounts", {
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
            userId: {
                type: Sequelize.BIGINT,
                references: {
                    model: "Users",
                    key: "id",
                },
                onDelete: "SET NULL",
                onUpdate: "CASCADE",
            },
            permissionId: {
                type: Sequelize.BIGINT,
                references: {
                    model: "Permissions",
                    key: "id",
                },
                onDelete: "SET NULL",
                onUpdate: "CASCADE",
            },
            username: {
                type: Sequelize.STRING,
                allowNull: false,
                unique: true,
            },
            password: {
                type: Sequelize.STRING,
            },
            status: {
                type: Sequelize.INTEGER,
            },
            active: {
                type: Sequelize.BOOLEAN,
            },
            createdBy: {
                type: Sequelize.BIGINT,
                references: {
                    model: "Accounts",
                    key: "id",
                },
                onDelete: "SET NULL",
                onUpdate: "CASCADE",
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
        await queryInterface.dropTable("Accounts");
    },
};
