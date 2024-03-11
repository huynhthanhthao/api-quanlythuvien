"use strict";

module.exports = {
    up: async (queryInterface, Sequelize) => {
        await queryInterface.bulkInsert("ReaderGroups", [
            {
                schoolId: 1,
                groupName: "Giảng viên",
                groupCode: "RG00001",
                quantityLimit: 10,
                timeLimit: 30,
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
                groupCode: "RG00002",
                quantityLimit: 15,
                timeLimit: 45,
                groupDes: "Nhóm bạn đọc là sinh viên",
                active: true,
                createdBy: 1,
                updatedBy: 1,
                createdAt: new Date(),
                updatedAt: new Date(),
            },
            {
                schoolId: 2,
                groupName: "Người đi làm",
                groupCode: "RG00003",
                quantityLimit: 15,
                timeLimit: 45,
                groupDes: "Nhóm bạn đọc là người đi làm",
                active: true,
                createdBy: 2,
                updatedBy: 2,
                createdAt: new Date(),
                updatedAt: new Date(),
            },
        ]);
    },

    down: async (queryInterface, Sequelize) => {
        await queryInterface.bulkDelete("ReaderGroups", null, {});
    },
};
