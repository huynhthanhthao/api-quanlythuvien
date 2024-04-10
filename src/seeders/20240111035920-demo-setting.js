"use strict";

module.exports = {
    up: async (queryInterface, Sequelize) => {
        // Tạo một số dữ liệu mẫu cho bảng "Settings"
        await queryInterface.bulkInsert("Settings", [
            {
                schoolId: 1,
                hasFineFee: false,
                noSpecialPenalties: false,
                hasLoanFee: false,
                typeLoanFee: 1,
                individualBookFee: false,
                valueLoanFee: 0,
                borrowTime: 14,
                active: true,
                createdAt: "2024-04-02T11:48:45.457Z",
                updatedAt: "2024-04-02T11:48:45.457Z",
            },
            {
                schoolId: 2,
                hasFineFee: false,
                noSpecialPenalties: false,
                hasLoanFee: false,
                typeLoanFee: 1,
                individualBookFee: false,
                valueLoanFee: 0,
                borrowTime: 14,
                active: true,
                createdAt: "2024-04-02T11:48:45.457Z",
                updatedAt: "2024-04-02T11:48:45.457Z",
            },
        ]);
    },

    down: async (queryInterface, Sequelize) => {
        // Xóa toàn bộ dữ liệu từ bảng "Settings"
        await queryInterface.bulkDelete("Settings", null, {});
    },
};
