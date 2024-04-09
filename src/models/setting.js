"use strict";
const { Model, Op } = require("sequelize");
const { CatchException } = require("../../utils/api-error");
const { errorCodes } = require("../../enums/error-code");
const { TYPE_LOAN_FEES } = require("../../enums/common");
const { isInEnum } = require("../../utils/customer-validate");

module.exports = (sequelize, DataTypes) => {
    class Setting extends Model {
        /**
         * Helper method for defining associations.
         * This method is not a part of Sequelize lifecycle.
         * The `models/index` file will call this method automatically.
         */
        static associate(models) {
            // define association here
        }
    }
    Setting.init(
        {
            schoolId: {
                type: DataTypes.BIGINT,
            },
            hasFineFee: {
                type: DataTypes.BOOLEAN,
                defaultValue: false,
            },
            borrowTime: {
                type: DataTypes.INTEGER,
                defaultValue: 14,
            },
            noSpecialPenalties: {
                type: DataTypes.BOOLEAN,
                defaultValue: false,
            },
            hasLoanFee: {
                type: DataTypes.BOOLEAN,
                defaultValue: false,
            },
            typeLoanFee: {
                type: DataTypes.INTEGER,
                validate: {
                    isInEnum: (value) => {
                        isInEnum(value, [
                            TYPE_LOAN_FEES.BOOK_COVER_PERCENTAGE,
                            TYPE_LOAN_FEES.FIXED_PRICE,
                            TYPE_LOAN_FEES.INDIVIDUAL_BOOK_FEE,
                        ]);
                    },
                },
            },
            valueLoanFee: {
                type: DataTypes.DOUBLE,
                validate: {
                    isValid(value) {
                        if (this.hasLoanFee) {
                            if (value < 0 || (this.typeLoanFee == TYPE_LOAN_FEES.BOOK_COVER_PERCENTAGE && value > 100))
                                throw new CatchException("Phần trăm phải từ 0 đến 100.", errorCodes.INVALID_DATA, {
                                    field: "valueLoanFee",
                                });
                        }
                    },
                },
            },
            active: {
                type: DataTypes.BOOLEAN,
                defaultValue: true,
            },
        },
        {
            sequelize,
            modelName: "Setting",
            timestamps: true,
            underscored: false,
            hooks: {
                beforeValidate: (Setting) => {},
            },
        }
    );

    return Setting;
};
