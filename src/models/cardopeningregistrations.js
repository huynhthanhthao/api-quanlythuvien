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
            CardOpeningRegistration.belongsTo(models.CardOpeningFee, {
                foreignKey: "feeId",
                as: "cardOpeningFee",
            });
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
                    isEmail(value) {
                        isEmail(value);
                    },
                    notEmpty: true,
                },
            },
            phone: {
                type: DataTypes.STRING,
                validate: {
                    len: {
                        args: [0, 255],
                    },
                    isPhone(value) {
                        isPhone(value);
                    },
                    notEmpty: true,
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
