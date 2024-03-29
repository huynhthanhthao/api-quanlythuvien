"use strict";
const { Model, Op } = require("sequelize");
const { checkForeignKey } = require("../../utils/customer-validate");

module.exports = (sequelize, DataTypes) => {
    class FieldHasBook extends Model {
        /**
         * Helper method for defining associations.
         * This method is not a part of Sequelize lifecycle.
         * The `models/index` file will call this method automatically.
         */
        static associate(models) {
            // define association here
            FieldHasBook.belongsTo(models.BookGroup, {
                foreignKey: "bookGroupId",
                as: "bookList",
            });

            FieldHasBook.belongsTo(models.Field, {
                foreignKey: "fieldId",
                as: "field",
            });
        }
    }
    FieldHasBook.init(
        {
            schoolId: {
                type: DataTypes.BIGINT,
            },
            fieldId: {
                type: DataTypes.BIGINT,
                validate: {
                    notEmpty: true,
                    isNumeric: true,
                    async checkForeignKey(value) {
                        await checkForeignKey(value, sequelize.models.Field, {
                            schoolId: this.schoolId,
                        });
                    },
                },
            },
            bookGroupId: {
                type: DataTypes.BIGINT,
                validate: {
                    notEmpty: true,
                    isNumeric: true,
                    async checkForeignKey(value) {
                        await checkForeignKey(value, sequelize.models.BookGroup, {
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
            modelName: "FieldHasBook",
            timestamps: true,
            underscored: false,
            hooks: {
                beforeValidate: (FieldHasBook) => {},
            },
        }
    );

    return FieldHasBook;
};
