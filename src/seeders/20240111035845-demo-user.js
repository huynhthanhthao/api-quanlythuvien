"use strict";

module.exports = {
    up: async (queryInterface, Sequelize) => {
        await queryInterface.bulkInsert("Users", [
            {
                schoolId: 1,
                fullName: "John Doe",
                birthday: new Date("1990-01-01"),
                gender: 1,
                phone: "123456789",
                email: "john.doe@example.com",
                photoURL: "photoURL_url_here",
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
                phone: "987654321",
                email: "jane.smith@example.com",
                photoURL: "photoURL_url_here",
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
