"use strict";

module.exports = {
    up: async (queryInterface, Sequelize) => {
        await queryInterface.bulkInsert("BookStatuses", [
            {
                schoolId: 1,
                statusName: "Mới",
                statusDes: "Sách mới, chưa sử dụng.",
                active: true,
                createdBy: 1,
                updatedBy: 1,
                createdAt: new Date(),
                updatedAt: new Date(),
            },
            {
                schoolId: 1,
                statusName: "Như mới",
                statusDes: "Sách đã qua sử dụng, nhưng còn như mới.",
                active: true,
                createdBy: 1,
                updatedBy: 1,
                createdAt: new Date(),
                updatedAt: new Date(),
            },
            {
                schoolId: 1,
                statusName: "Đã qua sử dụng",
                statusDes: "Sách đã qua sử dụng, nhưng vẫn còn tốt.",
                active: true,
                createdBy: 1,
                updatedBy: 1,
                createdAt: new Date(),
                updatedAt: new Date(),
            },
            {
                schoolId: 1,
                statusName: "Cũ",
                statusDes: "Sách đã cũ.",
                active: true,
                createdBy: 1,
                updatedBy: 1,
                createdAt: new Date(),
                updatedAt: new Date(),
            },
            {
                schoolId: 1,
                statusName: "Hỏng",
                statusDes: "Sách bị hỏng nặng, không sử dụng được.",
                active: true,
                createdBy: 1,
                updatedBy: 1,
                createdAt: new Date(),
                updatedAt: new Date(),
            },
        ]);
    },

    down: async (queryInterface, Sequelize) => {
        await queryInterface.bulkDelete("BookStatuses", null, {});
    },
};
