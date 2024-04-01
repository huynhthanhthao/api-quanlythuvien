"use strict";
const { Model, Op } = require("sequelize");
const { isEmail } = require("../../utils/customer-validate");

module.exports = (sequelize, DataTypes) => {
    class SchoolEmailSMTP extends Model {
        /**
         * Helper method for defining associations.
         * This method is not a part of Sequelize lifecycle.
         * The `models/index` file will call this method automatically.
         */
        static associate(models) {
            // define association here
        }
    }
    SchoolEmailSMTP.init(
        {
            email: {
                type: DataTypes.STRING,
                validate: {
                    len: {
                        args: [0, 255],
                    },
                    isEmail(value) {
                        isEmail(value);
                    },
                },
            },
            password: {
                type: DataTypes.STRING,
                validate: {
                    len: {
                        args: [0, 255],
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
            modelName: "SchoolEmailSMTP",
            timestamps: true,
            underscored: false,
        }
    );

    return SchoolEmailSMTP;
};
