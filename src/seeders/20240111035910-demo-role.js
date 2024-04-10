"use strict";

module.exports = {
    up: async (queryInterface, Sequelize) => {
        await queryInterface.bulkInsert("Roles", [
            {
                roleName: "Mở thẻ bạn đọc",
                roleCode: "USER_CREATE",
                groupId: "1",
                createdAt: "2024-03-14T08:43:44.963Z",
                updatedAt: "2024-03-14T08:43:44.963Z",
            },
            {
                roleName: "Cập nhật thông tin bạn đọc",
                roleCode: "USER_UPDATE",
                groupId: "1",
                createdAt: "2024-03-14T08:44:47.447Z",
                updatedAt: "2024-03-14T08:44:47.447Z",
            },
            {
                roleName: "Xóa bạn đọc",
                roleCode: "USER_DELETE",
                groupId: "1",
                createdAt: "2024-03-14T08:44:55.962Z",
                updatedAt: "2024-03-14T08:44:55.962Z",
            },
            {
                roleName: "Xem thông tin bạn đọc",
                roleCode: "USER_VIEW",
                groupId: "1",
                createdAt: "2024-03-14T08:45:07.786Z",
                updatedAt: "2024-03-14T08:45:07.786Z",
            },
            {
                roleName: "Thêm ấn phẩm",
                roleCode: "BOOK_CREATE",
                groupId: "16",
                createdAt: "2024-03-14T08:46:04.702Z",
                updatedAt: "2024-03-14T08:46:04.702Z",
            },
            {
                roleName: "Cập nhật thông tin ấn phẩm",
                roleCode: "BOOK_UPDATE",
                groupId: "16",
                createdAt: "2024-03-14T08:46:16.386Z",
                updatedAt: "2024-03-14T08:46:16.386Z",
            },
            {
                roleName: "Xóa ấn phẩm",
                roleCode: "BOOK_DELETE",
                groupId: "16",
                createdAt: "2024-03-14T08:46:26.361Z",
                updatedAt: "2024-03-14T08:46:26.361Z",
            },
            {
                roleName: "Xem thông tin ấn phẩm",
                roleCode: "BOOK_VIEW",
                groupId: "16",
                createdAt: "2024-03-14T08:46:37.190Z",
                updatedAt: "2024-03-14T08:46:37.190Z",
            },
            {
                roleName: "Thêm ấn phẩm bổ sung",
                roleCode: "BOOK_REQUEST_CREATE",
                groupId: "3",
                createdAt: "2024-03-14T08:55:58.202Z",
                updatedAt: "2024-03-14T08:55:58.202Z",
            },
            {
                roleName: "Cập nhật ấn phẩm bổ sung",
                roleCode: "BOOK_REQUEST_UPDATE",
                groupId: "3",
                createdAt: "2024-03-14T08:56:10.127Z",
                updatedAt: "2024-03-14T08:56:10.127Z",
            },
            {
                roleName: "Xóa ấn phẩm bổ sung",
                roleCode: "BOOK_REQUEST_DELETE",
                groupId: "3",
                createdAt: "2024-03-14T08:56:19.424Z",
                updatedAt: "2024-03-14T08:56:19.424Z",
            },
            {
                roleName: "Xem thông tin ấn phẩm bổ sung  ",
                roleCode: "BOOK_REQUEST_VIEW",
                groupId: "3",
                createdAt: "2024-03-14T08:56:30.888Z",
                updatedAt: "2024-03-14T08:56:30.888Z",
            },
            {
                roleName: "Tạo vị trí đặt ấn phẩm",
                roleCode: "POSITION_CREATE",
                groupId: "4",
                createdAt: "2024-03-14T08:56:47.796Z",
                updatedAt: "2024-03-14T08:56:47.796Z",
            },
            {
                roleName: "Cập nhật vị trí đặt ấn phẩm",
                roleCode: "POSITION_UPDATE",
                groupId: "4",
                createdAt: "2024-03-14T08:56:57.749Z",
                updatedAt: "2024-03-14T08:56:57.749Z",
            },
            {
                roleName: "Xóa vị trí đặt ấn phẩm",
                roleCode: "POSITION_DELETE",
                groupId: "4",
                createdAt: "2024-03-14T08:57:09.724Z",
                updatedAt: "2024-03-14T08:57:09.724Z",
            },
            {
                roleName: "Xem thông tin vị trí đặt ấn phẩm",
                roleCode: "POSITION_VIEW",
                groupId: "4",
                createdAt: "2024-03-14T08:57:17.503Z",
                updatedAt: "2024-03-14T08:57:17.503Z",
            },
            {
                roleName: "Tạo danh mục ấn phẩm",
                roleCode: "CATEGORY_CREATE",
                groupId: "5",
                createdAt: "2024-03-14T08:57:33.766Z",
                updatedAt: "2024-03-14T08:57:33.766Z",
            },
            {
                roleName: "Cập nhật danh mục ấn phẩm",
                roleCode: "CATEGORY_UPDATE",
                groupId: "5",
                createdAt: "2024-03-14T08:57:42.780Z",
                updatedAt: "2024-03-14T08:57:42.780Z",
            },
            {
                roleName: "Xóa danh mục ấn phẩm",
                roleCode: "CATEGORY_DELETE",
                groupId: "5",
                createdAt: "2024-03-14T08:57:50.609Z",
                updatedAt: "2024-03-14T08:57:50.609Z",
            },
            {
                roleName: "Xem thông tin danh mục ấn phẩm",
                roleCode: "CATEGORY_VIEW",
                groupId: "5",
                createdAt: "2024-03-14T08:57:58.639Z",
                updatedAt: "2024-03-14T08:57:58.639Z",
            },
            {
                roleName: "Tạo phí phạt",
                roleCode: "FINE_POLICY_CREATE",
                groupId: "6",
                createdAt: "2024-03-14T08:58:12.527Z",
                updatedAt: "2024-03-14T08:58:12.527Z",
            },
            {
                roleName: "Cập nhật phí phạt",
                roleCode: "FINE_POLICY_UPDATE",
                groupId: "6",
                createdAt: "2024-03-14T08:58:21.098Z",
                updatedAt: "2024-03-14T08:58:21.098Z",
            },
            {
                roleName: "Xóa phí phạt",
                roleCode: "FINE_POLICY_DELETE",
                groupId: "6",
                createdAt: "2024-03-14T08:58:30.484Z",
                updatedAt: "2024-03-14T08:58:30.484Z",
            },
            {
                roleName: "Xem thông tin phí phạt",
                roleCode: "FINE_POLICY_VIEW",
                groupId: "6",
                createdAt: "2024-03-14T08:58:39.846Z",
                updatedAt: "2024-03-14T08:58:39.846Z",
            },
            {
                roleName: "Tạo phiếu mượn",
                roleCode: "LOAN_RECEIPT_CREATE",
                groupId: "7",
                createdAt: "2024-03-14T08:59:04.685Z",
                updatedAt: "2024-03-14T08:59:04.685Z",
            },
            {
                roleName: "Cập nhật phiếu mượn",
                roleCode: "LOAN_RECEIPT_UPDATE",
                groupId: "7",
                createdAt: "2024-03-14T08:59:12.956Z",
                updatedAt: "2024-03-14T08:59:12.956Z",
            },
            {
                roleName: "Xóa phiếu mượn",
                roleCode: "LOAN_RECEIPT_DELETE",
                groupId: "7",
                createdAt: "2024-03-14T08:59:21.318Z",
                updatedAt: "2024-03-14T08:59:21.318Z",
            },
            {
                roleName: "Xem thông tin phiếu mượn",
                roleCode: "LOAN_RECEIPT_VIEW",
                groupId: "7",
                createdAt: "2024-03-14T08:59:37.372Z",
                updatedAt: "2024-03-14T08:59:37.372Z",
            },
            {
                roleName: "Cập nhật phiếu phạt",
                roleCode: "PENALTY_TICKET_UPDATE",
                groupId: "8",
                createdAt: "2024-03-14T09:00:34.904Z",
                updatedAt: "2024-03-14T09:00:34.904Z",
            },
            {
                roleName: "Xóa phiếu phạt",
                roleCode: "PENALTY_TICKET_DELETE",
                groupId: "8",
                createdAt: "2024-03-14T09:00:44.733Z",
                updatedAt: "2024-03-14T09:00:44.733Z",
            },
            {
                roleName: "Cập nhật thông tin thanh toán",
                roleCode: "PENALTY_TICKET_PAY",
                groupId: "8",
                createdAt: "2024-03-14T09:00:52.397Z",
                updatedAt: "2024-03-14T09:00:52.397Z",
            },
            {
                roleName: "Xem thông tin phiếu phạt",
                roleCode: "PENALTY_TICKET_VIEW",
                groupId: "8",
                createdAt: "2024-03-14T09:00:59.552Z",
                updatedAt: "2024-03-14T09:00:59.552Z",
            },
            {
                roleName: "Tạo thông tin báo mất ấn phẩm",
                roleCode: "BOOK_LOST_CREATE",
                groupId: "9",
                createdAt: "2024-03-14T09:01:11.246Z",
                updatedAt: "2024-03-14T09:01:11.246Z",
            },
            {
                roleName: "Cập nhật thông tin báo mất ấn phẩm",
                roleCode: "BOOK_LOST_UPDATE",
                groupId: "9",
                createdAt: "2024-03-14T09:01:26.361Z",
                updatedAt: "2024-03-14T09:01:26.361Z",
            },
            {
                roleName: "Xóa thông tin báo mất ấn phẩm",
                roleCode: "BOOK_LOST_DELETE",
                groupId: "9",
                createdAt: "2024-03-14T09:01:36.563Z",
                updatedAt: "2024-03-14T09:01:36.563Z",
            },
            {
                roleName: "Xem thông tin báo mất ấn phẩm",
                roleCode: "BOOK_LOST_VIEW",
                groupId: "9",
                createdAt: "2024-03-14T09:01:46.055Z",
                updatedAt: "2024-03-14T09:01:46.055Z",
            },
            {
                roleName: "Tạo lĩnh vực ấn phẩm",
                roleCode: "FIELD_CREATE",
                groupId: "10",
                createdAt: "2024-03-14T09:02:02.664Z",
                updatedAt: "2024-03-14T09:02:02.664Z",
            },
            {
                roleName: "Cập nhật lĩnh vực ấn phẩm",
                roleCode: "FIELD_UPDATE",
                groupId: "10",
                createdAt: "2024-03-14T09:02:11.665Z",
                updatedAt: "2024-03-14T09:02:11.665Z",
            },
            {
                roleName: "Xóa lĩnh vực ấn phẩm",
                roleCode: "FIELD_DELETE",
                groupId: "10",
                createdAt: "2024-03-14T09:02:23.261Z",
                updatedAt: "2024-03-14T09:02:23.261Z",
            },
            {
                roleName: "Xem thông tin lĩnh vực ấn phẩm",
                roleCode: "FIELD_VIEW",
                groupId: "10",
                createdAt: "2024-03-14T09:02:30.878Z",
                updatedAt: "2024-03-14T09:02:30.878Z",
            },
            {
                roleName: "Tạo ngôn ngữ của ấn phẩm",
                roleCode: "LANGUAGE_CREATE",
                groupId: "11",
                createdAt: "2024-03-14T09:02:46.514Z",
                updatedAt: "2024-03-14T09:02:46.514Z",
            },
            {
                roleName: "Cập nhật lĩnh vực ấn phẩm",
                roleCode: "LANGUAGE_UPDATE",
                groupId: "11",
                createdAt: "2024-03-14T09:03:16.748Z",
                updatedAt: "2024-03-14T09:03:16.748Z",
            },
            {
                roleName: "Xóa lĩnh vực ấn phẩm",
                roleCode: "LANGUAGE_DELETE",
                groupId: "11",
                createdAt: "2024-03-14T09:03:31.923Z",
                updatedAt: "2024-03-14T09:03:31.923Z",
            },
            {
                roleName: "Xem thông tin lĩnh vực ấn phẩm",
                roleCode: "LANGUAGE_VIEW",
                groupId: "11",
                createdAt: "2024-03-14T09:03:38.520Z",
                updatedAt: "2024-03-14T09:03:38.520Z",
            },
            {
                roleName: "Tạo nhà xuất bản",
                roleCode: "PUBLISHER_CREATE",
                groupId: "12",
                createdAt: "2024-03-14T09:03:51.672Z",
                updatedAt: "2024-03-14T09:03:51.672Z",
            },
            {
                roleName: "Cập nhật nhà xuất bản",
                roleCode: "PUBLISHER_UPDATE",
                groupId: "12",
                createdAt: "2024-03-14T09:03:59.612Z",
                updatedAt: "2024-03-14T09:03:59.612Z",
            },
            {
                roleName: "Xóa nhà xuất bản",
                roleCode: "PUBLISHER_DELETE",
                groupId: "12",
                createdAt: "2024-03-14T09:04:09.306Z",
                updatedAt: "2024-03-14T09:04:09.306Z",
            },
            {
                roleName: "Xem thông tin nhà xuất bản",
                roleCode: "PUBLISHER_VIEW",
                groupId: "12",
                createdAt: "2024-03-14T09:04:18.140Z",
                updatedAt: "2024-03-14T09:04:18.140Z",
            },
            {
                roleName: "Tạo lớp học",
                roleCode: "CLASS_CREATE",
                groupId: "14",
                createdAt: "2024-03-14T09:05:14.509Z",
                updatedAt: "2024-03-14T09:05:14.509Z",
            },
            {
                roleName: "Cập nhật thông tin lớp học",
                roleCode: "CLASS_UPDATE",
                groupId: "14",
                createdAt: "2024-03-14T09:05:43.153Z",
                updatedAt: "2024-03-14T09:05:43.153Z",
            },
            {
                roleName: "Xóa thông tin lớp học",
                roleCode: "CLASS_DELETE",
                groupId: "14",
                createdAt: "2024-03-14T09:05:52.410Z",
                updatedAt: "2024-03-14T09:05:52.410Z",
            },
            {
                roleName: "Xem thông tin lớp học",
                roleCode: "CLASS_VIEW",
                groupId: "14",
                createdAt: "2024-03-14T09:06:01.340Z",
                updatedAt: "2024-03-14T09:06:01.340Z",
            },
            {
                roleName: "Tạo tình trạng ấn phẩm",
                roleCode: "BOOK_STATUS_CREATE",
                groupId: "15",
                createdAt: "2024-03-14T09:06:20.340Z",
                updatedAt: "2024-03-14T09:06:20.340Z",
            },
            {
                roleName: "Cập nhật thông tin tình trạng",
                roleCode: "BOOK_STATUS_UPDATE",
                groupId: "15",
                createdAt: "2024-03-14T09:06:34.976Z",
                updatedAt: "2024-03-14T09:06:34.976Z",
            },
            {
                roleName: "Xóa trạng thái",
                roleCode: "BOOK_STATUS_DELETE",
                groupId: "15",
                createdAt: "2024-03-14T09:06:55.606Z",
                updatedAt: "2024-03-14T09:06:55.606Z",
            },
            {
                roleName: "Xem thông tin tình trạng",
                roleCode: "BOOK_STATUS_VIEW",
                groupId: "15",
                createdAt: "2024-03-14T09:07:07.798Z",
                updatedAt: "2024-03-14T09:07:07.798Z",
            },
            {
                roleName: "Quản lý cài đặt",
                roleCode: "SETTING_UPDATE",
                groupId: "19",
                createdAt: "2024-03-14T09:07:55.283Z",
                updatedAt: "2024-03-14T09:07:55.283Z",
            },
            {
                roleName: "Xem thông tin cài đặt",
                roleCode: "SETTING_VIEW",
                groupId: "19",
                createdAt: "2024-03-14T09:08:05.484Z",
                updatedAt: "2024-03-14T09:08:05.484Z",
            },
            {
                roleName: "Xem nhật ký hệ thống",
                roleCode: "ACTIVITY_LOG_VIEW",
                groupId: "18",
                createdAt: "2024-03-14T09:08:18.890Z",
                updatedAt: "2024-03-14T09:08:18.890Z",
            },
            {
                roleName: "Tạo tài khoản",
                roleCode: "ACCOUNT_CREATE",
                groupId: "2",
                createdAt: "2024-03-14T09:08:18.890Z",
                updatedAt: "2024-03-14T09:08:18.890Z",
            },
            {
                roleName: "Cập nhật tài khoản",
                roleCode: "ACCOUNT_UPDATE",
                groupId: "2",
                createdAt: "2024-03-14T09:08:18.890Z",
                updatedAt: "2024-03-14T09:08:18.890Z",
            },
            {
                roleName: "Xóa tài khoản",
                roleCode: "ACCOUNT_DELETE",
                groupId: "2",
                createdAt: "2024-03-14T09:08:18.890Z",
                updatedAt: "2024-03-14T09:08:18.890Z",
            },
            {
                roleName: "Xem thông tin tài khoản",
                roleCode: "ACCOUNT_VIEW",
                groupId: "2",
                createdAt: "2024-03-14T09:08:18.890Z",
                updatedAt: "2024-03-14T09:08:18.890Z",
            },
            {
                roleName: "Gia hạn phiếu mượn",
                roleCode: "LOAN_RECEIPT_EXTEND",
                groupId: "7",
                createdAt: "2024-03-14T09:08:18.890Z",
                updatedAt: "2024-03-14T09:08:18.890Z",
            },
            {
                roleName: "Gia hạn phiếu mượn",
                roleCode: "LOAN_RECEIPT_EXTEND",
                groupId: "7",
                createdAt: "2024-03-14T09:08:18.890Z",
                updatedAt: "2024-03-14T09:08:18.890Z",
            },
            {
                roleName: "Tạo phí mở thẻ",
                roleCode: "CARD_OPENING_FEE_CREATE",
                groupId: "20",
                createdAt: "2024-03-14T09:08:18.890Z",
                updatedAt: "2024-03-14T09:08:18.890Z",
            },
            {
                roleName: "Xóa phí mở thẻ",
                roleCode: "CARD_OPENING_FEE_DELETE",
                groupId: "20",
                createdAt: "2024-03-14T09:08:18.890Z",
                updatedAt: "2024-03-14T09:08:18.890Z",
            },
            {
                roleName: "Cập nhật phí mở thẻ",
                roleCode: "CARD_OPENING_FEE_UPDATE",
                groupId: "20",
                createdAt: "2024-03-14T09:08:18.890Z",
                updatedAt: "2024-03-14T09:08:18.890Z",
            },
            {
                roleName: "Xác nhận đơn đăng ký",
                roleCode: "FORM_REGISTER_CONFIRM",
                groupId: "21",
                createdAt: "2024-03-14T09:08:18.890Z",
                updatedAt: "2024-03-14T09:08:18.890Z",
            },
            {
                roleName: "Xóa đơn đăng ký",
                roleCode: "FORM_REGISTER_DELETE",
                groupId: "21",
                createdAt: "2024-03-14T09:08:18.890Z",
                updatedAt: "2024-03-14T09:08:18.890Z",
            },
            {
                roleName: "Xem thông tin đăng ký mở thẻ",
                roleCode: "FORM_REGISTER_VIEW",
                groupId: "21",
                createdAt: "2024-03-14T09:08:18.890Z",
                updatedAt: "2024-03-14T09:08:18.890Z",
            },
            {
                roleName: "Tạo nhóm bạn đọc",
                roleCode: "READER_GROUP_CREATE",
                groupId: "22",
                createdAt: "2024-03-14T09:08:18.890Z",
                updatedAt: "2024-03-14T09:08:18.890Z",
            },
            {
                roleName: "Cập nhật nhóm bạn đọc",
                roleCode: "READER_GROUP_UPDATE",
                groupId: "22",
                createdAt: "2024-03-14T09:08:18.890Z",
                updatedAt: "2024-03-14T09:08:18.890Z",
            },
            {
                roleName: "Xóa nhóm bạn đọc",
                roleCode: "READER_GROUP_DELETE",
                groupId: "22",
                createdAt: "2024-03-14T09:08:18.890Z",
                updatedAt: "2024-03-14T09:08:18.890Z",
            },
            {
                roleName: "Xem thông tin nhóm bạn đọc",
                roleCode: "READER_GROUP_VIEW",
                groupId: "22",
                createdAt: "2024-03-14T09:08:18.890Z",
                updatedAt: "2024-03-14T09:08:18.890Z",
            },
            {
                roleName: "Xem thông tin trường",
                roleCode: "SCHOOL_VIEW",
                groupId: "23",
                createdAt: "2024-03-14T09:08:18.890Z",
                updatedAt: "2024-03-14T09:08:18.890Z",
            },
            {
                roleName: "Cập nhật thông tin trường",
                roleCode: "SCHOOL_UPDATE",
                groupId: "23",
                createdAt: "2024-03-14T09:08:18.890Z",
                updatedAt: "2024-03-14T09:08:18.890Z",
            },
        ]);
    },

    down: async (queryInterface, Sequelize) => {
        await queryInterface.bulkDelete("Roles", null, {});
    },
};
