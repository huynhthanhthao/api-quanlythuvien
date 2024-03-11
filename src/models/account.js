"use strict";
const { Model, Op } = require("sequelize");
const { isNumericOrEmpty, isDateOrEmpty } = require("../../utils/server");

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
        }
    }
    Account.init(
        {
            schoolId: {
                type: DataTypes.BIGINT,
            },
            userId: {
                type: DataTypes.BIGINT,
            },
            groupId: {
                type: DataTypes.BIGINT,
            },
            username: {
                type: DataTypes.STRING,
            },
            password: {
                type: DataTypes.STRING,
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
