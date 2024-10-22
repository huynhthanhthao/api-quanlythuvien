"use strict";

const { Class } = require("../models"); // Import model Class

module.exports = {
    up: async (queryInterface, Sequelize) => {
        await Class.bulkCreate([
            {
                schoolId: 1,
                schoolYearId: 1,
                classCode: "LH00001",
                className: "Lớp 1",
                classDes: "This class introduces basic concepts of computer science.",
                createdBy: 1,
                updatedBy: 1,
                createdAt: new Date(),
                updatedAt: new Date(),
            },
            {
                schoolId: 1,
                schoolYearId: 1,
                classCode: "LH00002",
                className: "Lớp 2",
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
