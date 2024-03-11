"use strict";
const { Model, Op } = require("sequelize");
const { checkForeignKey } = require("../../utils/customer-validate");

module.exports = (sequelize, DataTypes) => {
    class FinePolicyHasBook extends Model {
        /**
         * Helper method for defining associations.
         * This method is not a part of Sequelize lifecycle.
         * The `models/index` file will call this method automatically.
         */
        static associate(models) {
            // define association here
            FinePolicyHasBook.belongsTo(models.Book, {
                foreignKey: "bookId",
                as: "book",
            });

            FinePolicyHasBook.belongsTo(models.FinePolicy, {
                foreignKey: "finePolicyId",
                as: "finePolicy",
            });
        }
    }
    FinePolicyHasBook.init(
        {
            schoolId: {
                type: DataTypes.BIGINT,
            },
            bookId: {
                type: DataTypes.BIGINT,
                validate: {
                    notEmpty: true,
                    isNumeric: true,
                    async checkForeignKey(value) {
                        await checkForeignKey(value, sequelize.models.Book, {
                            schoolId: this.schoolId,
                        });
                    },
                },
            },
            finePolicyId: {
                type: DataTypes.BIGINT,
                validate: {
                    notEmpty: true,
                    isNumeric: true,
                    async checkForeignKey(value) {
                        await checkForeignKey(value, sequelize.models.FinePolicy, {
                            schoolId: this.schoolId,
                        });
                    },
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
            modelName: "FinePolicyHasBook",
            timestamps: true,
            underscored: false,
            hooks: {
                beforeValidate: (FinePolicyHasBook) => {},
            },
        }
    );

    return FinePolicyHasBook;
};
