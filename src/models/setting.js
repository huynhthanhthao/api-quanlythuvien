"use strict";
const { Model, Op } = require("sequelize");
const { SETTING_STATUS } = require("../../enums/common");

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
            },
            valueLoanFee: {
                type: DataTypes.DOUBLE,
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
