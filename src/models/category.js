"use strict";
const { Model, Op } = require("sequelize");
const { isUnique } = require("../../utils/customer-validate");

module.exports = (sequelize, DataTypes) => {
    class Category extends Model {
        /**
         * Helper method for defining associations.
         * This method is not a part of Sequelize lifecycle.
         * The `models/index` file will call this method automatically.
         */
        static associate(models) {
            // define association here
            Category.hasMany(models.BookGroup, {
                foreignKey: "categoryId",
                as: "bookList",
            });
        }
    }
    Category.init(
        {
            schoolId: {
                type: DataTypes.BIGINT,
            },
            categoryCode: {
                type: DataTypes.STRING,
                validate: {
                    len: {
                        args: [0, 50],
                    },
                    async isUnique(value) {
                        await isUnique({
                            id: this.id,
                            field: "categoryCode",
                            value,
                            model: sequelize.models.Category,
                            extraConditions: { schoolId: this.schoolId },
                        });
                    },
                },
            },
            categoryName: {
                type: DataTypes.STRING,
                allowNull: false,
                validate: {
                    len: {
                        args: [0, 255],
                    },
                    notEmpty: true,
                },
            },
            categoryDes: {
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
            modelName: "Category",
            timestamps: true,
            underscored: false,
            hooks: {
                beforeValidate: (Category) => {},
            },
        }
    );

    return Category;
};
