const { transformer, convertDate } = require("../../utils/server");
const UserService = require("../services/user.service");
const db = require("../models");
const { isBirthday, isDate } = require("../../utils/customer-validate");
const { CatchException } = require("../../utils/api-error");
const { errorCodes } = require("../../enums/error-code");

class UserController {
    static async getUsers(req) {
        return transformer(await UserService.getUsers(req.query, req.account), "Lấy danh sách thành công.");
    }

    static async getUserByIdOrCode(req) {
        const { keyword } = req.params;
        const type = req.query?.type || 0;

        return transformer(
            await UserService.getUserByIdOrCode({ keyword, type }, req.account),
            "Lấy chi tiết thành công."
        );
    }

    static async createUser(req) {
        const photoURL = req.file?.path;
        let { birthday, cardDate, classId } = req.body;

        if (!isDate(cardDate) && cardDate) {
            throw new CatchException("Dữ liệu ngày tháng năm không hợp lệ.", errorCodes.DATA_INCORRECT_FORMAT, {
                field: "cardDate",
            });
        }

        if (!isBirthday(birthday))
            throw new CatchException("Dữ liệu ngày tháng năm không hợp lệ.", errorCodes.DATA_INCORRECT_FORMAT, {
                field: "birthday",
            });

        cardDate = convertDate(cardDate);
        birthday = convertDate(birthday);

        return transformer(
            await UserService.createUser({ ...req.body, cardDate, birthday, photoURL }, req.account),
            "Đã thêm dữ liệu người dùng mới."
        );
    }

    static async updateUserById(req) {
        const { id } = req.params;
        const newPhotoURL = req.file?.path;
        let { birthday, cardDate } = req.body;

        if (!isBirthday(cardDate) && cardDate) {
            throw new CatchException("Dữ liệu ngày tháng năm không hợp lệ!", errorCodes.DATA_INCORRECT_FORMAT, {
                field: "cardDate",
            });
        }

        if (!isBirthday(birthday)) {
            throw new CatchException("Dữ liệu ngày tháng năm không hợp lệ!", errorCodes.DATA_INCORRECT_FORMAT, {
                field: "birthday",
            });
        }

        cardDate = convertDate(cardDate);
        birthday = convertDate(birthday);

        return transformer(
            await UserService.updateUserById({ ...req.body, newPhotoURL, cardDate, birthday, id }, req.account),
            "Cập nhật thành công."
        );
    }

    static async deleteUserByIds(req) {
        const { ids } = req.body;

        return transformer(await UserService.deleteUserByIds(ids, req.account), "Cập nhật thành công.");
    }
}

module.exports = UserController;
