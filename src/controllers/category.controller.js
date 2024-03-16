const { transformer } = require("../../utils/server");
const CategoryService = require("../services/category.service");
const db = require("../models");

class CategoryController {
    static async getCategories(req) {
        return transformer(await CategoryService.getCategories(req.query, req.account), "Lấy danh sách thành công.");
    }

    static async getCategoryById(req) {
        const { id } = req.params;

        return transformer(await CategoryService.getCategoryById(id, req.account), "Lấy chi tiết thành công.");
    }

    static async createCategory(req) {
        return transformer(
            await CategoryService.createCategory(req.body, req.account),
            "Đã thêm dữ liệu danh mục sách mới."
        );
    }

    static async updateCategoryById(req) {
        const { id } = req.params;
        return transformer(
            await CategoryService.updateCategoryById({ ...req.body, id }, req.account),
            "Cập nhật thành công."
        );
    }

    static async deleteCategoryByIds(req) {
        const { ids } = req.body;

        return transformer(await CategoryService.deleteCategoryByIds(ids, req.account), "Cập nhật thành công.");
    }
}

module.exports = CategoryController;
