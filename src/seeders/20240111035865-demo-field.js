"use strict";

module.exports = {
    up: async (queryInterface, Sequelize) => {
        await queryInterface.bulkInsert("Fields", [
            {
                schoolId: 1,
                fieldName: "Tài chính",
                fieldCode: "LV1835",
                fieldDes:
                    "Chuyên ngành tài chính tập trung vào việc quản lý và phân tích về tiền bạc, đầu tư, và tài chính cá nhân hoặc doanh nghiệp.",
                active: true,
                createdBy: 1,
                updatedBy: 1,
                createdAt: new Date(),
                updatedAt: new Date(),
            },
            {
                schoolId: 1,
                fieldName: "Kế toán",
                fieldCode: "LV7131",
                fieldDes:
                    "Chuyên ngành kế toán tập trung vào việc thu thập, phân loại, và phân tích thông tin tài chính của cá nhân hoặc tổ chức.",
                active: true,
                createdBy: 1,
                updatedBy: 1,
                createdAt: new Date(),
                updatedAt: new Date(),
            },
            {
                schoolId: 1,
                fieldName: "Ngoại giao",
                fieldCode: "LV4821",
                fieldDes:
                    "Chuyên ngành ngoại giao nghiên cứu và thực hiện các mối quan hệ quốc tế, đàm phán, và giao tiếp với các quốc gia khác nhau.",
                active: true,
                createdBy: 1,
                updatedBy: 1,
                createdAt: new Date(),
                updatedAt: new Date(),
            },
            {
                schoolId: 1,
                fieldName: "Thiết kế",
                fieldCode: "LV9291",
                fieldDes:
                    "Chuyên ngành thiết kế tập trung vào việc tạo ra các sản phẩm hoặc trải nghiệm người dùng thông qua việc áp dụng nguyên lý thiết kế sáng tạo.",
                active: true,
                createdBy: 1,
                updatedBy: 1,
                createdAt: new Date(),
                updatedAt: new Date(),
            },
            {
                schoolId: 1,
                fieldName: "Thuật toán",
                fieldCode: "LV9540",
                fieldDes:
                    "Chuyên ngành thuật toán nghiên cứu và phát triển các thuật toán và kỹ thuật tính toán để giải quyết các vấn đề phức tạp.",
                active: true,
                createdBy: 1,
                updatedBy: 1,
                createdAt: new Date(),
                updatedAt: new Date(),
            },
            {
                schoolId: 1,
                fieldName: "Phần mềm",
                fieldCode: "LV7253",
                fieldDes:
                    "Chuyên ngành phần mềm tập trung vào việc phát triển và duy trì phần mềm máy tính và ứng dụng di động.",
                active: true,
                createdBy: 1,
                updatedBy: 1,
                createdAt: new Date(),
                updatedAt: new Date(),
            },
            {
                schoolId: 1,
                fieldName: "Kiến trúc",
                fieldCode: "LV4340",
                fieldDes:
                    "Chuyên ngành kiến trúc tập trung vào việc thiết kế và xây dựng các công trình kiến trúc và không gian sống.",
                active: true,
                createdBy: 1,
                updatedBy: 1,
                createdAt: new Date(),
                updatedAt: new Date(),
            },
            {
                schoolId: 1,
                fieldName: "Toán học",
                fieldCode: "LV4725",
                fieldDes:
                    "Chuyên ngành toán học nghiên cứu và áp dụng các khái niệm và phương pháp toán học để giải quyết các vấn đề trong khoa học và công nghệ.",
                active: true,
                createdBy: 1,
                updatedBy: 1,
                createdAt: new Date(),
                updatedAt: new Date(),
            },
            {
                schoolId: 1,
                fieldName: "Văn học",
                fieldCode: "LV5617",
                fieldDes:
                    "Chuyên ngành văn học nghiên cứu và phân tích các tác phẩm văn học và văn hóa để hiểu sâu hơn về con người và xã hội.",
                active: true,
                createdBy: 1,
                updatedBy: 1,
                createdAt: new Date(),
                updatedAt: new Date(),
            },
        ]);
    },

    down: async (queryInterface, Sequelize) => {
        await queryInterface.bulkDelete("Fields", null, {});
    },
};
