"use strict";
const { Model, Op } = require("sequelize");
const { isUnique } = require("../../utils/customer-validate");

module.exports = (sequelize, DataTypes) => {
    class SchoolYear extends Model {
        /**
         * Helper method for defining associations.
         * This method is not a part of Sequelize lifecycle.
         * The `models/index` file will call this method automatically.
         */
        static associate(models) {
            // define association here
            SchoolYear.hasMany(models.Class, {
                foreignKey: "schoolYearId",
                as: "classList",
            });
        }
    }
    SchoolYear.init(
        {
            schoolId: {
                type: DataTypes.BIGINT,
            },
            year: {
                type: DataTypes.INTEGER,
                allowNull: false,
                validate: {
                    isNumeric: true,
                    notEmpty: true,
                },
            },
            schoolYearDes: {
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
            modelName: "SchoolYear",
            timestamps: true,
            underscored: false,
            hooks: {
                beforeValidate: (SchoolYear) => {},
            },
        }
    );

    return SchoolYear;
};
