"use strict";
const { Model, Op } = require("sequelize");
const { isNumericOrEmpty, isDateOrEmpty } = require("../../utils/server");
const { checkForeignKey, checkEmptyForeignKey, isUnique } = require("../../utils/customer-validate");

module.exports = (sequelize, DataTypes) => {
    class AccountHasRole extends Model {
        /**
         * Helper method for defining associations.
         * This method is not a part of Sequelize lifecycle.
         * The `models/index` file will call this method automatically.
         */
        static associate(models) {
            // define association here
            AccountHasRole.belongsTo(models.Account, {
                foreignKey: "accountId",
                as: "account",
            });

            AccountHasRole.belongsTo(models.Role, {
                foreignKey: "roleId",
                as: "role",
            });
        }
    }
    AccountHasRole.init(
        {
            schoolId: {
                type: DataTypes.BIGINT,
                allowNull: false,
                validate: {
                    notEmpty: true,
                    isNumeric: true,
                    async checkForeignKey(value) {
                        await checkForeignKey(value, sequelize.models.School);
                    },
                },
            },
            accountId: {
                type: DataTypes.BIGINT,
                allowNull: false,
                validate: {
                    notEmpty: true,
                    isNumeric: true,
                    async checkForeignKey(value) {
                        await checkForeignKey(value, sequelize.models.Account);
                    },
                },
            },
            roleId: {
                type: DataTypes.BIGINT,
                allowNull: false,
                validate: {
                    notEmpty: true,
                    isNumeric: true,
                    async checkForeignKey(value) {
                        await checkForeignKey(value, sequelize.models.Role);
                    },
                },
            },
            active: {
                type: DataTypes.BOOLEAN,
                defaultValue: true,
            },
            createdBy: {
                type: DataTypes.BIGINT,
            },
            updatedBy: {
                type: DataTypes.BIGINT,
            },
        },
        {
            sequelize,
            modelName: "AccountHasRole",
            timestamps: true,
            underscored: false,
            hooks: {
                beforeValidate: (AccountHasRole) => {},
            },
        }
    );

    return AccountHasRole;
};
