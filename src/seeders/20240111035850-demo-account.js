"use strict";

module.exports = {
    up: async (queryInterface, Sequelize) => {
        // Tạo một số dữ liệu mẫu cho bảng "Accounts"
        await queryInterface.bulkInsert("Accounts", [
            {
                schoolId: 1,
                userId: 1,
                groupId: null,
                username: "admin1",
                password: "$2a$10$CezixM9l3eDxSlbRNw8HueqTpHGQaKJ23oSNSixZyEhofR/6iiqBW",
                active: true,
                createdBy: 1,
                updatedBy: 1,
                createdAt: new Date(),
                updatedAt: new Date(),
            },
            {
                schoolId: 2,
                userId: 2,
                groupId: null,
                username: "admin2",
                password: "$2a$10$CezixM9l3eDxSlbRNw8HueqTpHGQaKJ23oSNSixZyEhofR/6iiqBW",
                active: true,
                createdBy: 2,
                updatedBy: 2,
                createdAt: new Date(),
                updatedAt: new Date(),
            },
        ]);
    },

    down: async (queryInterface, Sequelize) => {
        // Xóa toàn bộ dữ liệu từ bảng "Accounts"
        await queryInterface.bulkDelete("Accounts", null, {});
    },
};
