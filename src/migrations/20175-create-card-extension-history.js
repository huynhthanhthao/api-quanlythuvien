"use strict";

module.exports = {
    up: async (queryInterface, Sequelize) => {
        await queryInterface.createTable("ExtensionHistories", {
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
            loanReceiptId: {
                type: Sequelize.BIGINT,
                references: {
                    model: "LoanReceipts",
                    key: "id",
                },
                onDelete: "SET NULL",
                onUpdate: "CASCADE",
            },
            returnDate: {
                type: Sequelize.DATE,
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
            createdBy: {
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
        await queryInterface.dropTable("ExtensionHistories");
    },
};
