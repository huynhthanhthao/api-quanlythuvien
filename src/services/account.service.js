const { CatchException } = require("../../utils/api-error");
const db = require("../models");
const HttpStatus = require("http-status-codes");
const jwt = require("jsonwebtoken");
const bcrypt = require("bcryptjs");
const { flattenObject } = require("../../utils/server");

class AccountService {
    static async createAccount(newAccount) {
        const hashedPassword = await bcrypt.hash(newAccount.password, 10);
        await db.Account.create({
            username: newAccount.username,
            password: hashedPassword,
        });
    }

    static async getByUsernameAndSchoolId(params) {
        const trimmedUsername = (params.username || "").trim();
        const schoolId = params.schoolId || 0;

        const account = await db.Account.findOne({
            where: { username: trimmedUsername, schoolId, active: true },
            attributes: ["username", "password", "active", "status"],
            include: [
                {
                    model: db.User,
                    as: "user",
                    required: false,
                    where: { active: true },
                    attributes: {
                        exclude: ["createdAt", "updatedAt", "createdBy", "updatedBy", "active", "schoolId"],
                    },
                },
            ],
            raw: true,
        });

        return flattenObject(account);
    }

    static async getRoleSchoolId(accountId) {
        const account = await db.Account.findOne({
            where: { id: accountId, active: true },
            attributes: ["id", "schoolId"],
        });

        return account;
    }
}

module.exports = AccountService;
