"use strict";

module.exports = {
    up: async (queryInterface, Sequelize) => {
        await queryInterface.bulkInsert("Users", [
            {
                schoolId: 1,
                fullName: "John Doe",
                birthday: new Date("1990-01-01"),
                gender: 1,
                phone: "0987888777",
                email: "john.doe@example.com",
                photoURL: null,
                type: 1,
                active: true,
                createdBy: null,
                updatedBy: null,
                createdAt: new Date(),
                updatedAt: new Date(),
            },
            {
                schoolId: 2,
                fullName: "Jane Smith",
                birthday: new Date("1995-05-05"),
                gender: 2,
                phone: "0987789789",
                email: "jane.smith@example.com",
                photoURL: null,
                type: 1,
                active: true,
                createdBy: null,
                updatedBy: null,
                createdAt: new Date(),
                updatedAt: new Date(),
            },
        ]);
    },

    down: async (queryInterface, Sequelize) => {
        await queryInterface.bulkDelete("Users", null, {});
    },
};
