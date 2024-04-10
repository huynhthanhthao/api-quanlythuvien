"use strict";

module.exports = {
    up: async (queryInterface, Sequelize) => {
        // Tạo một số dữ liệu mẫu cho bảng "SchoolEmailSMTPs"
        await queryInterface.bulkInsert("SchoolEmailSMTPs", [
            {
                email: "",
                password: "",
                active: true,
                createdAt: "2024-04-02T11:48:45.457Z",
                updatedAt: "2024-04-02T11:48:45.457Z",
            },
        ]);
    },

    down: async (queryInterface, Sequelize) => {
        // Xóa toàn bộ dữ liệu từ bảng "SchoolEmailSMTPs"
        await queryInterface.bulkDelete("SchoolEmailSMTPs", null, {});
    },
};
