"use strict";

const { Class } = require("../models"); // Import model Class

module.exports = {
    up: async (queryInterface, Sequelize) => {
        await Class.bulkCreate([
            {
                schoolId: 1,
                schoolYearId: 1,
                classCode: "CSE101",
                className: "Introduction to Computer Science",
                classDes: "This class introduces basic concepts of computer science.",
                createdBy: 1,
                updatedBy: 1,
                createdAt: new Date(),
                updatedAt: new Date(),
            },
            {
                schoolId: 1,
                schoolYearId: 1,
                classCode: "MATH101",
                className: "Calculus I",
                classDes: "This class covers fundamental concepts of calculus.",
                createdBy: 1,
                updatedBy: 1,
                createdAt: new Date(),
                updatedAt: new Date(),
            },
        ]);
    },

    down: async (queryInterface, Sequelize) => {
        await queryInterface.bulkDelete("Class", null, {});
    },
};
