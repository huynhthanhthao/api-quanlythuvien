"use strict";

module.exports = {
    up: async (queryInterface, Sequelize) => {
        await queryInterface.createTable("BookingBorrowForms", {
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
            formCode: {
                type: Sequelize.STRING,
            },
            receiveDate: {
                type: Sequelize.DATE,
            },
            isConfirmed: {
                type: Sequelize.BOOLEAN,
            },
            bookingDes: {
                type: Sequelize.TEXT,
            },
            token: {
                type: Sequelize.TEXT,
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
        await queryInterface.dropTable("BookingBorrowForms");
    },
};
