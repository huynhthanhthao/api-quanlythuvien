"use strict";
const { Model, Op } = require("sequelize");
const { SETTING_STATUS } = require("../../enums/common");
const { checkForeignKey, isEmail, isUnique, isPhone } = require("../../utils/customer-validate");

module.exports = (sequelize, DataTypes) => {
    class CardOpeningRegistration extends Model {
        /**
         * Helper method for defining associations.
         * This method is not a part of Sequelize lifecycle.
         * The `models/index` file will call this method automatically.
         */
        static associate(models) {
            // define association here
        }
    }
    CardOpeningRegistration.init(
        {
            schoolId: {
                type: DataTypes.BIGINT,
            },
            feeId: {
                type: DataTypes.BIGINT,
                allowNull: false,
                validate: {
                    notEmpty: true,
                    isNumeric: true,
                    async checkForeignKey(value) {
                        await checkForeignKey(value, sequelize.models.CardOpeningFee, {
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
            cardId: {
                type: DataTypes.STRING,
                allowNull: false,
                validate: {
                    len: {
                        args: [0, 255],
                    },
                    notEmpty: true,
                },
            },
            email: {
                type: DataTypes.STRING,
                allowNull: false,
                validate: {
                    len: {
                        args: [0, 255],
                    },
                    async isUnique(value) {
                        await isUnique({
                            id: this.id,
                            field: "email",
                            value,
                            model: sequelize.models.CardOpeningRegistration,
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
                    notEmpty: true,
                },
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
            photo3x4: {
                type: DataTypes.TEXT,
                allowNull: false,
                validate: {
                    notEmpty: true,
                },
            },
            cardFrontPhoto: {
                type: DataTypes.TEXT,
                allowNull: false,
                validate: {
                    notEmpty: true,
                },
            },
            cardBackPhoto: {
                type: DataTypes.TEXT,
                allowNull: false,
                validate: {
                    notEmpty: true,
                },
            },
            isConfirmed: {
                type: DataTypes.BOOLEAN,
                defaultValue: false,
            },
            active: {
                type: DataTypes.BOOLEAN,
                defaultValue: true,
            },
            updatedBy: {
                type: DataTypes.BIGINT,
            },
        },
        {
            sequelize,
            modelName: "CardOpeningRegistration",
            timestamps: true,
            underscored: false,
            hooks: {
                beforeValidate: (CardOpeningRegistration) => {},
            },
        }
    );

    return CardOpeningRegistration;
};
