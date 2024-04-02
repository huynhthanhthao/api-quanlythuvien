"use strict";

const { SchoolYear } = require("../models"); // Import model SchoolYear

module.exports = {
    up: async (queryInterface, Sequelize) => {
        await SchoolYear.bulkCreate([
            {
                schoolId: 1,
                year: 2022,
                schoolYearDes: "Năm học 2022-2023",
                createdBy: 1,
                updatedBy: 1,
                createdAt: new Date(),
                updatedAt: new Date(),
            },
            {
                schoolId: 1,
                year: 2023,
                schoolYearDes: "Năm học 2023-2024",
                createdBy: 1,
                updatedBy: 1,
                createdAt: new Date(),
                updatedAt: new Date(),
            },
        ]);
    },

    down: async (queryInterface, Sequelize) => {
        await queryInterface.bulkDelete("SchoolYear", null, {});
    },
};
