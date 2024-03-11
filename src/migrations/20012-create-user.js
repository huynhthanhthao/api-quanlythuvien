"use strict";

module.exports = {
    up: async (queryInterface, Sequelize) => {
        await queryInterface.createTable("Users", {
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
            groupId: {
                type: Sequelize.BIGINT,
                references: {
                    model: "ReaderGroups",
                    key: "id",
                },
                onDelete: "SET NULL",
                onUpdate: "CASCADE",
            },
            fullName: {
                type: Sequelize.STRING,
            },
            readerCode: {
                type: Sequelize.STRING,
            },
            photoURL: {
                type: Sequelize.TEXT,
            },
            phone: {
                type: Sequelize.STRING,
            },
            birthday: {
                type: "TIMESTAMP",
                defaultValue: Sequelize.literal("CURRENT_TIMESTAMP"),
            },
            gender: {
                type: Sequelize.INTEGER,
            },
            address: {
                type: Sequelize.TEXT,
            },
            email: {
                type: Sequelize.STRING,
            },
            readerDes: {
                type: Sequelize.TEXT,
            },
            cardId: {
                type: Sequelize.STRING,
            },
            cardDate: {
                type: "TIMESTAMP",
                defaultValue: Sequelize.literal("CURRENT_TIMESTAMP"),
            },
            cardAddress: {
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
        await queryInterface.dropTable("Users");
    },
};
