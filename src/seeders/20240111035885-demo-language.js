"use strict";

module.exports = {
    up: async (queryInterface, Sequelize) => {
        await queryInterface.bulkInsert("Languages", [
            {
                schoolId: 1,
                lanName: "Tiếng Việt",
                lanCode: "vi",
                lanDes: "Tiếng Việt.",
                active: true,
                createdBy: 1,
                updatedBy: 1,
                createdAt: new Date(),
                updatedAt: new Date(),
            },
            {
                schoolId: 1,
                lanName: "English",
                lanCode: "en",
                lanDes: "English is a West Germanic language that was first spoken in early medieval England and eventually became a global lingua franca.",
                active: true,
                createdBy: 1,
                updatedBy: 1,
                createdAt: new Date(),
                updatedAt: new Date(),
            },
            {
                schoolId: 1,
                lanName: "Spanish",
                lanCode: "es",
                lanDes: "Spanish is a Romance language that originated in the Iberian Peninsula of Europe. It is the official language in 20 countries.",
                active: true,
                createdBy: 1,
                updatedBy: 1,
                createdAt: new Date(),
                updatedAt: new Date(),
            },
        ]);
    },

    down: async (queryInterface, Sequelize) => {
        await queryInterface.bulkDelete("Languages", null, {});
    },
};
