"use strict";

module.exports = {
    up: async (queryInterface, Sequelize) => {
        await queryInterface.bulkInsert("Positions", [
            {
                schoolId: 1,
                positionCode: "KS0001",
                positionName: "Kệ sách tầng 1",
                positionDes: "Vị trí đặt sách trên kệ sách tầng 1, thuận tiện cho việc tìm kiếm và tiếp cận.",
                active: true,
                createdBy: 1,
                updatedBy: 1,
                createdAt: new Date(),
                updatedAt: new Date(),
            },
            {
                schoolId: 1,
                positionCode: "KS0002",
                positionName: "Giá sách phòng đọc",
                positionDes:
                    "Vị trí đặt sách trên giá sách trong phòng đọc, đảm bảo sự tiện lợi và dễ dàng truy cập cho độc giả.",
                active: true,
                createdBy: 1,
                updatedBy: 1,
                createdAt: new Date(),
                updatedAt: new Date(),
            },
        ]);
    },

    down: async (queryInterface, Sequelize) => {
        await queryInterface.bulkDelete("Positions", null, {});
    },
};
