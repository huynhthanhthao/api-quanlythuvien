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
            shoolName: {
                type: DataTypes.STRING,
            },
            schoolCode: {
                type: DataTypes.STRING,
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
            active: {
                type: DataTypes.BOOLEAN,
                defaultValue: true,
            },
            createdBy: {
                type: DataTypes.BIGINT,

                // references: {
                //     model: "Accounts",
                //     key: "id",
                // },
                // onDelete: "SET NULL",
                // onUpdate: "CASCADE",
            },
            updatedBy: {
                type: DataTypes.BIGINT,

                // references: {
                //     model: "Accounts",
                //     key: "id",
                // },
                // onDelete: "SET NULL",
                // onUpdate: "CASCADE",
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
