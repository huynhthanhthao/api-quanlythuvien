"use strict";
const { Model, Op } = require("sequelize");
const { isUnique } = require("../../utils/customer-validate");

module.exports = (sequelize, DataTypes) => {
    class DetailFinePolicy extends Model {
        /**
         * Helper method for defining associations.
         * This method is not a part of Sequelize lifecycle.
         * The `models/index` file will call this method automatically.
         */
        static associate(models) {
            // define association here
        }
    }
    DetailFinePolicy.init(
        {
            schoolId: {
                type: DataTypes.BIGINT,
            },
            finePolicyId: {
                type: DataTypes.BIGINT,
            },
            dayLate: {
                allowNull: false,
                type: DataTypes.INTEGER,
                validate: {
                    isNumeric: true,
                    notEmpty: true,
                },
            },
            fineAmount: {
                allowNull: false,
                type: DataTypes.DOUBLE,
                validate: {
                    notEmpty: true,
                    isNumeric: true,
                },
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
            modelName: "DetailFinePolicy",
            timestamps: true,
            underscored: false,
        }
    );

    return DetailFinePolicy;
};
