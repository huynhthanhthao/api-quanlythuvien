"use strict";

module.exports = {
    up: async (queryInterface, Sequelize) => {
        await queryInterface.createTable("BookGroups", {
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
            publisherId: {
                type: Sequelize.BIGINT,
                references: {
                    model: "Publishers",
                    key: "id",
                },
                onDelete: "SET NULL",
                onUpdate: "CASCADE",
            },
            categoryId: {
                type: Sequelize.BIGINT,
                references: {
                    model: "Categories",
                    key: "id",
                },
                onDelete: "SET NULL",
                onUpdate: "CASCADE",
            },
            languageId: {
                type: Sequelize.BIGINT,
                references: {
                    model: "Languages",
                    key: "id",
                },
                onDelete: "SET NULL",
                onUpdate: "CASCADE",
            },
            penaltyApplied: {
                type: Sequelize.BOOLEAN,
            },
            bookName: {
                type: Sequelize.TEXT,
            },
            bookDes: {
                type: Sequelize.TEXT,
            },
            slug: {
                type: Sequelize.STRING,
            },
            otherName: {
                type: Sequelize.TEXT,
            },
            author: {
                type: Sequelize.STRING,
            },
            pages: {
                type: Sequelize.INTEGER,
            },
            yearPublication: {
                type: Sequelize.INTEGER,
            },
            rePublic: {
                type: Sequelize.INTEGER,
            },
            price: {
                type: Sequelize.DOUBLE,
            },
            photoURL: {
                type: Sequelize.TEXT,
            },
            active: {
                type: Sequelize.BOOLEAN,
            },
            loanFee: {
                type: Sequelize.DOUBLE,
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
        await queryInterface.dropTable("BookGroups");
    },
};
