"use strict";

module.exports = {
    up: async (queryInterface, Sequelize) => {
        await queryInterface.bulkInsert("Schools", [
            {
                id: 1,
                schoolName: "Đại học Cần Thơ",
                address: "Đường 3/2, P.Hưng Lợi, Q.Ninh Kiều, Cần Thơ",
                phone: "0988322233",
                schoolEmailSMTPId: 1,
                email: "hotline@ctu.edu.vn",
                representative: "Nguyễn Văn A",
                representativePhone: "0939888777",
                active: true,
                createdAt: new Date(),
                updatedAt: new Date(),
            },
            {
                id: 2,
                schoolName: "Đại học FPT Cần Thơ",
                address: "Nguyễn Văn Cừ, P.Ninh Kiều, Q.Ninh Kiều, Cần Thơ",
                phone: "0939666777",
                email: "hotline@fpt.edu.vn",
                representative: "Nguyễn Văn B",
                representativePhone: "0939999888",
                active: true,
                createdAt: new Date(),
                updatedAt: new Date(),
            },
        ]);
    },

    down: async (queryInterface, Sequelize) => {
        await queryInterface.bulkDelete("Schools", null, {});
    },
};
