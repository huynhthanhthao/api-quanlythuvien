"use strict";

module.exports = {
    up: async (queryInterface, Sequelize) => {
        await queryInterface.bulkInsert("ReaderGroups", [
            {
                schoolId: 1,
                groupName: "Giảng viên",
                groupCode: "NBD00001",
                quantityLimit: 10,
                timeLimit: 30,
                maxBookingQuantity: 3,
                groupDes: "Nhóm bạn đọc là giảng viên",
                active: true,
                createdBy: 1,
                updatedBy: 1,
                createdAt: new Date(),
                updatedAt: new Date(),
            },
            {
                schoolId: 1,
                groupName: "Sinh viên",
                groupCode: "NBD00002",
                quantityLimit: 15,
                timeLimit: 45,
                maxBookingQuantity: 5,
                groupDes: "Nhóm bạn đọc là sinh viên",
                active: true,
                createdBy: 1,
                updatedBy: 1,
                createdAt: new Date(),
                updatedAt: new Date(),
            },
        ]);
    },

    down: async (queryInterface, Sequelize) => {
        await queryInterface.bulkDelete("ReaderGroups", null, {});
    },
};
