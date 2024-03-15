"use strict";
const { Model, Op } = require("sequelize");
const {
    checkForeignKey,
    checkEmptyForeignKey,
    isUnique,
    isInEnum,
    isPhone,
    isEmail,
} = require("../../utils/customer-validate");
const { GENDER, AVATAR_URL_DEFAULT, USER_TYPE } = require("../../enums/common");

module.exports = (sequelize, DataTypes) => {
    class User extends Model {
        /**
         * Helper method for defining associations.
         * This method is not a part of Sequelize lifecycle.
         * The `models/index` file will call this method automatically.
         */
        static associate(models) {
            // define association here
            User.belongsTo(models.ReaderGroup, {
                foreignKey: "groupId",
                as: "readerGroup",
            });

            User.hasMany(models.ClassHasUser, {
                foreignKey: "userId",
                as: "classHasUser",
            });

            User.hasMany(models.LoanReceipt, {
                foreignKey: "userId",
                as: "loanReceiptList",
            });
        }
    }
    User.init(
        {
            schoolId: {
                type: DataTypes.BIGINT,
            },
            groupId: {
                type: DataTypes.BIGINT,
                validate: {
                    notEmpty: true,
                    async checkEmptyForeignKey(value) {
                        await checkEmptyForeignKey(value, sequelize.models.ReaderGroup, {
                            schoolId: this.schoolId,
                        });
                    },
                },
            },
            fullName: {
                type: DataTypes.STRING,
                allowNull: false,
                validate: {
                    len: {
                        args: [0, 255],
                    },
                    notEmpty: true,
                },
            },
            readerCode: {
                type: DataTypes.STRING,
                validate: {
                    len: {
                        args: [0, 50],
                    },
                    async isUnique(value) {
                        await isUnique({
                            id: this.id,
                            field: "readerCode",
                            value,
                            model: sequelize.models.User,
                            extraConditions: { schoolId: this.schoolId },
                        });
                    },
                },
            },
            photoURL: {
                type: DataTypes.TEXT,
            },
            phone: {
                type: DataTypes.STRING,
                validate: {
                    async isUnique(value) {
                        await isUnique({
                            field: "phone",
                            value,
                            model: sequelize.models.User,
                            extraConditions: {
                                schoolId: this.schoolId,
                                id: {
                                    [Op.not]: this.id,
                                },
                            },
                        });
                    },
                    isPhone(value) {
                        isPhone(value);
                    },
                },
            },
            birthday: {
                type: DataTypes.DATE,
                allowNull: false,
                validate: {
                    notEmpty: true,
                },
            },
            gender: {
                type: DataTypes.INTEGER,
                validate: {
                    isInEnum: (value) => {
                        isInEnum(value, [GENDER.FEMALE, GENDER.MALE, GENDER.OTHER]);
                    },
                },
            },
            address: {
                type: DataTypes.TEXT,
                allowNull: false,
                validate: {
                    notEmpty: true,
                },
            },
            email: {
                type: DataTypes.STRING,
                validate: {
                    len: {
                        args: [0, 255],
                    },
                    async isUnique(value) {
                        await isUnique({
                            id: this.id,
                            field: "email",
                            value,
                            model: sequelize.models.User,
                            extraConditions: {
                                schoolId: this.schoolId,
                                id: {
                                    [Op.not]: this.id,
                                },
                            },
                        });
                    },
                    isEmail(value) {
                        isEmail(value);
                    },
                },
            },
            readerDes: {
                type: DataTypes.TEXT,
            },
            cardId: {
                type: DataTypes.STRING,
                validate: {
                    len: {
                        args: [0, 50],
                    },
                    async isUnique(value) {
                        await isUnique({
                            id: this.id,
                            field: "cardId",
                            value,
                            model: sequelize.models.User,
                            extraConditions: {
                                schoolId: this.schoolId,
                                id: {
                                    [Op.not]: this.id,
                                },
                            },
                        });
                    },
                },
            },
            cardDate: {
                type: DataTypes.DATE,
                allowNull: true,
                validate: {
                    notEmpty: false,
                },
            },
            cardAddress: {
                type: DataTypes.TEXT,
            },
            type: {
                type: DataTypes.INTEGER,
                defaultValue: USER_TYPE.READER,
                validate: {
                    isInEnum: (value) => {
                        isInEnum(value, [USER_TYPE.READER, USER_TYPE.SYSTEM_USER]);
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
            modelName: "User",
            timestamps: true,
            underscored: false,
            hooks: {
                beforeValidate: (reader) => {},
            },
        }
    );

    return User;
};
