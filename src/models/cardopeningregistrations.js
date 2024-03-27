"use strict";
const { Model, Op } = require("sequelize");
const { SETTING_STATUS } = require("../../enums/common");

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
            },
            fullName: {
                type: DataTypes.STRING,
            },
            cardId: {
                type: DataTypes.STRING,
            },
            email: {
                type: DataTypes.STRING,
            },
            phone: {
                type: DataTypes.STRING,
            },
            photo3x4: {
                type: DataTypes.TEXT,
            },
            cardFrontPhoto: {
                type: DataTypes.TEXT,
            },
            cardBackPhoto: {
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
