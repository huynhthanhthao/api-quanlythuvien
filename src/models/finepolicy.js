"use strict";
const { Model, Op } = require("sequelize");
const { isUnique } = require("../../utils/customer-validate");

module.exports = (sequelize, DataTypes) => {
    class FinePolicy extends Model {
        /**
         * Helper method for defining associations.
         * This method is not a part of Sequelize lifecycle.
         * The `models/index` file will call this method automatically.
         */
        static associate(models) {
            // define association here
            FinePolicy.hasMany(models.FinePolicyHasBook, {
                foreignKey: "finePolicyId",
                as: "finePolicyHasBook",
            });

            FinePolicy.hasMany(models.DetailFinePolicy, {
                foreignKey: "finePolicyId",
                as: "detailFinePolicy",
            });
        }
    }
    FinePolicy.init(
        {
            schoolId: {
                type: DataTypes.BIGINT,
            },
            policyCode: {
                type: DataTypes.STRING,
                validate: {
                    len: {
                        args: [0, 50],
                    },
                    async isUnique(value) {
                        await isUnique({
                            id: this.id,
                            field: "policyCode",
                            value,
                            model: sequelize.models.FinePolicy,
                            extraConditions: { schoolId: this.schoolId },
                        });
                    },
                },
            },
            policyName: {
                type: DataTypes.STRING,
                allowNull: false,
                validate: {
                    len: {
                        args: [0, 255],
                    },
                    notEmpty: true,
                },
            },
            policyDes: {
                type: DataTypes.TEXT,
            },
            isDefault: {
                type: DataTypes.BOOLEAN,
                defaultValue: false,
            },
            overdueFine: {
                type: DataTypes.DOUBLE,
                validate: {
                    isNumeric: true,
                },
                defaultValue: 0,
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
            modelName: "FinePolicy",
            timestamps: true,
            underscored: false,
            hooks: {
                beforeValidate: (FinePolicy) => {},
            },
        }
    );

    return FinePolicy;
};
