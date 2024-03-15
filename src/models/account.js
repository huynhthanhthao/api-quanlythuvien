"use strict";
const { Model, Op } = require("sequelize");
const { isNumericOrEmpty, isDateOrEmpty } = require("../../utils/server");
const { checkForeignKey, checkEmptyForeignKey, isUnique, isInEnum } = require("../../utils/customer-validate");
const { ACCOUNT_STATUS } = require("../../enums/common");

module.exports = (sequelize, DataTypes) => {
    class Account extends Model {
        /**
         * Helper method for defining associations.
         * This method is not a part of Sequelize lifecycle.
         * The `models/index` file will call this method automatically.
         */
        static associate(models) {
            // define association here
            Account.belongsTo(models.User, {
                foreignKey: "userId",
                as: "user",
            });

            Account.belongsTo(models.Permission, {
                foreignKey: "permissionId",
                as: "permission",
            });

            Account.hasMany(models.AccountHasRole, {
                foreignKey: "accountId",
                as: "accountHasRole",
            });
        }
    }
    Account.init(
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
            userId: {
                type: DataTypes.BIGINT,
                validate: {
                    notEmpty: true,
                    async checkEmptyForeignKey(value) {
                        await checkEmptyForeignKey(value, sequelize.models.User, {
                            schoolId: this.schoolId,
                        });
                    },
                },
            },
            permissionId: {
                type: DataTypes.BIGINT,
                allowNull: false,
                validate: {
                    notEmpty: true,
                    isNumeric: true,
                    async checkForeignKey(value) {
                        await checkForeignKey(value, sequelize.models.Permission, {
                            schoolId: this.schoolId,
                        });
                    },
                },
            },
            username: {
                type: DataTypes.STRING,
                allowNull: false,
                validate: {
                    len: {
                        args: [0, 255],
                    },
                    notEmpty: true,
                    async isUnique(value) {
                        await isUnique({
                            id: this.id,
                            field: "username",
                            value,
                            model: sequelize.models.Account,
                            extraConditions: { schoolId: this.schoolId },
                        });
                    },
                },
            },
            password: {
                type: DataTypes.STRING,
                allowNull: false,
                validate: {
                    len: {
                        args: [6, 255],
                    },
                    notEmpty: true,
                },
            },
            status: {
                type: DataTypes.INTEGER,
                defaultValue: ACCOUNT_STATUS.ACTIVE,
                validate: {
                    isInEnum: (value) => {
                        isInEnum(value, [ACCOUNT_STATUS.ACTIVE, ACCOUNT_STATUS.BLOCKED]);
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
            modelName: "Account",
            timestamps: true,
            underscored: false,
            hooks: {
                beforeValidate: (Account) => {},
            },
        }
    );

    return Account;
};
