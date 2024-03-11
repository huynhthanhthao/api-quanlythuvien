"use strict";
const { Model } = require("sequelize");
const { checkForeignKey } = require("../../utils/customer-validate");

module.exports = (sequelize, DataTypes) => {
    class BookHasStatus extends Model {
        /**
         * Helper method for defining associations.
         * This method is not a part of Sequelize lifecycle.
         * The `models/index` file will call this method automatically.
         */
        static associate(models) {
            // define association here
            BookHasStatus.belongsTo(models.Book, {
                foreignKey: "bookId",
                as: "book",
            });

            BookHasStatus.belongsTo(models.BookStatus, {
                foreignKey: "statusId",
                as: "status",
            });
        }
    }
    BookHasStatus.init(
        {
            schoolId: {
                type: DataTypes.BIGINT,
            },
            statusId: {
                type: DataTypes.BIGINT,
                allowNull: false,
                validate: {
                    notEmpty: true,
                    isNumeric: true,
                    async checkForeignKey(value) {
                        await checkForeignKey(value, sequelize.models.BookStatus, {
                            schoolId: this.schoolId,
                        });
                    },
                },
            },
            bookId: {
                type: DataTypes.BIGINT,
                allowNull: false,
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
            quantity: {
                type: DataTypes.INTEGER,
                validate: {
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
            modelName: "BookHasStatus",
            timestamps: true,
            underscored: false,
        }
    );

    return BookHasStatus;
};
