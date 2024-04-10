"use strict";

module.exports = {
    up: async (queryInterface, Sequelize) => {
        await queryInterface.bulkInsert("GroupRoles", [
            {
                id: "1",
                groupName: "Quản lý bạn đọc",
                createdAt: "2024-03-14T07:55:49.856Z",
                updatedAt: "2024-03-14T07:55:49.856Z",
            },
            {
                id: "2",
                groupName: "Quản lý tài khoản",
                createdAt: "2024-03-14T07:57:24.588Z",
                updatedAt: "2024-03-14T07:57:24.588Z",
            },
            {
                id: "3",
                groupName: "Quản lý ấn phẩm yêu cầu bổ sung",
                createdAt: "2024-03-14T07:57:24.588Z",
                updatedAt: "2024-03-14T07:57:24.588Z",
            },
            {
                id: "4",
                groupName: "Quản lý vị trí đặt ấn phẩm",
                createdAt: "2024-03-14T07:57:30.150Z",
                updatedAt: "2024-03-14T07:57:30.150Z",
            },
            {
                id: "5",
                groupName: "Quản lý danh mục ấn phẩm",
                createdAt: "2024-03-14T07:57:36.057Z",
                updatedAt: "2024-03-14T07:57:36.057Z",
            },
            {
                id: "6",
                groupName: "Quản lý phí phạt / chính sách phạt",
                createdAt: "2024-03-14T07:57:43.000Z",
                updatedAt: "2024-03-14T07:57:43.000Z",
            },
            {
                id: "7",
                groupName: "Quản lý mượn trả",
                createdAt: "2024-03-14T07:57:48.400Z",
                updatedAt: "2024-03-14T07:57:48.400Z",
            },
            {
                id: "8",
                groupName: "Quản lý phiếu phạt",
                createdAt: "2024-03-14T07:57:52.722Z",
                updatedAt: "2024-03-14T07:57:52.722Z",
            },
            {
                id: "10",
                groupName: "Quản lý lĩnh vực",
                createdAt: "2024-03-14T07:58:21.570Z",
                updatedAt: "2024-03-14T07:58:21.570Z",
            },
            {
                id: "11",
                groupName: "Quản lý ngôn ngữ của ấn phẩm",
                createdAt: "2024-03-14T07:58:28.054Z",
                updatedAt: "2024-03-14T07:58:28.054Z",
            },
            {
                id: "12",
                groupName: "Quản lý nhà xuất bản",
                createdAt: "2024-03-14T07:58:32.768Z",
                updatedAt: "2024-03-14T07:58:32.768Z",
            },
            {
                id: "14",
                groupName: "Quản lý lớp học",
                createdAt: "2024-03-14T07:58:42.888Z",
                updatedAt: "2024-03-14T07:58:42.888Z",
            },
            {
                id: "15",
                groupName: "Quản lý tình trạng ấn phẩm",
                createdAt: "2024-03-14T07:58:47.843Z",
                updatedAt: "2024-03-14T07:58:47.843Z",
            },
            {
                id: "9",
                groupName: "Quản lý thông tin mất ấn phẩm",
                createdAt: "2024-03-14T07:58:54.342Z",
                updatedAt: "2024-03-14T07:58:54.342Z",
            },
            {
                id: "16",
                groupName: "Quản lý ấn phẩm",
                createdAt: "2024-03-14T07:57:17.109Z",
                updatedAt: "2024-03-14T07:57:17.109Z",
            },
            {
                id: "18",
                groupName: "Quản lý nhật ký hệ thống",
                createdAt: "2024-03-14T07:57:58.981Z",
                updatedAt: "2024-03-14T07:57:58.981Z",
            },
            {
                id: "19",
                groupName: "Quản lý cài đặt",
                createdAt: "2024-03-14T07:57:58.981Z",
                updatedAt: "2024-03-14T07:57:58.981Z",
            },
            {
                id: "20",
                groupName: "Quản lý phí mở thẻ",
                createdAt: "2024-03-14T07:57:58.981Z",
                updatedAt: "2024-03-14T07:57:58.981Z",
            },
            {
                id: "21",
                groupName: "Quản lý đơn đăng kí mở thẻ",
                createdAt: "2024-03-14T07:57:58.981Z",
                updatedAt: "2024-03-14T07:57:58.981Z",
            },
            {
                id: "22",
                groupName: "Nhóm bạn đọc",
                createdAt: "2024-03-14T07:57:58.981Z",
                updatedAt: "2024-03-14T07:57:58.981Z",
            },
            {
                id: "23",
                groupName: "Quản lý thông tin trường học",
                createdAt: "2024-03-14T07:57:58.981Z",
                updatedAt: "2024-03-14T07:57:58.981Z",
            },
        ]);
    },

    down: async (queryInterface, Sequelize) => {
        await queryInterface.bulkDelete("GroupRoles", null, {});
    },
};
