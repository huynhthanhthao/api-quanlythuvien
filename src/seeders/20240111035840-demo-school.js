"use strict";

module.exports = {
    up: async (queryInterface, Sequelize) => {
        await queryInterface.bulkInsert("Schools", [
            {
                schoolName: "Đại học Cần Thơ",
                schoolCode: "TH0001",
                address: "Đường 3/2, P.Hưng Lợi, Q.Ninh Kiều, Cần Thơ",
                phone: "0988322233",
                email: "hotline@ctu.edu.vn",
                representative: "Nguyễn Văn A",
                representativePhone: "0939888777",
                active: true,
                createdAt: new Date(),
                updatedAt: new Date(),
            },
            {
                schoolName: "Đại học FPT Cần Thơ",
                schoolCode: "TH0002",
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
