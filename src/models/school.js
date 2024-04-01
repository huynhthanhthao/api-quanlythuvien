"use strict";
const { Model, Op } = require("sequelize");

module.exports = (sequelize, DataTypes) => {
    class School extends Model {
        /**
         * Helper method for defining associations.
         * This method is not a part of Sequelize lifecycle.
         * The `models/index` file will call this method automatically.
         */
        static associate(models) {
            // define association here
        }
    }
    School.init(
        {
            schoolName: {
                type: DataTypes.STRING,
                allowNull: false,
                validate: {
                    len: {
                        args: [0, 255],
                    },
                    notEmpty: true,
                },
            },
            logo: {
                type: DataTypes.TEXT,
            },
            address: {
                type: DataTypes.TEXT,
            },
            phone: {
                type: DataTypes.STRING,
            },
            email: {
                type: DataTypes.STRING,
            },
            representative: {
                type: DataTypes.STRING,
            },
            representativePhone: {
                type: DataTypes.STRING,
            },
            schoolEmailSMTPId: {
                type: DataTypes.BIGINT,
                allowNull: false,
                validate: {
                    notEmpty: true,
                },
            },
            active: {
                type: DataTypes.BOOLEAN,
                defaultValue: true,
            },
        },
        {
            sequelize,
            modelName: "School",
            timestamps: true,
            underscored: false,
            hooks: {
                beforeValidate: (School) => {},
            },
        }
    );

    return School;
};
