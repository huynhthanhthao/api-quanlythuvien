"use strict";

module.exports = {
    up: async (queryInterface, Sequelize) => {
        await queryInterface.createTable("Settings", {
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
            hasFineFee: {
                type: Sequelize.BOOLEAN,
            },
            noSpecialPenalties: {
                type: Sequelize.BOOLEAN,
            },
            hasLoanFee: {
                type: Sequelize.BOOLEAN,
            },
            typeLoanFee: {
                type: Sequelize.INTEGER,
            },
            individualBookFee: {
                type: Sequelize.BOOLEAN,
            },
            valueLoanFee: {
                type: Sequelize.DOUBLE,
            },
            borrowTime: {
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
        await queryInterface.dropTable("Settings");
    },
};
