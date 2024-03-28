"use strict";
const { Model, Op } = require("sequelize");
const { SETTING_STATUS } = require("../../enums/common");

module.exports = (sequelize, DataTypes) => {
    class CardOpeningFee extends Model {
        /**
         * Helper method for defining associations.
         * This method is not a part of Sequelize lifecycle.
         * The `models/index` file will call this method automatically.
         */
        static associate(models) {
            // define association here
        }
    }
    CardOpeningFee.init(
        {
            schoolId: {
                type: DataTypes.BIGINT,
            },
            fee: {
                type: DataTypes.DOUBLE,
                allowNull: false,
                validate: {
                    isNumeric: true,
                    notEmpty: false,
                },
            },
            effect: {
                type: DataTypes.INTEGER,
                allowNull: false,
                validate: {
                    isNumeric: true,
                    notEmpty: false,
                },
            },
            feeDes: {
                type: DataTypes.TEXT,
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
            modelName: "CardOpeningFee",
            timestamps: true,
            underscored: false,
            hooks: {
                beforeValidate: (CardOpeningFee) => {},
            },
        }
    );

    return CardOpeningFee;
};
