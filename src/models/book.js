"use strict";
const { Model, Op } = require("sequelize");
const { checkForeignKey, checkEmptyForeignKey, isUnique } = require("../../utils/customer-validate");
const { BOOK_URL_DEFAULT } = require("../../enums/common");

module.exports = (sequelize, DataTypes) => {
    class Book extends Model {
        /**
         * Helper method for defining associations.
         * This method is not a part of Sequelize lifecycle.
         * The `models/index` file will call this method automatically.
         */
        static associate(models) {
            // define association here
            Book.belongsTo(models.Position, {
                foreignKey: "positionId",
                as: "position",
            });

            Book.belongsTo(models.BookStatus, {
                foreignKey: "statusId",
                as: "status",
            });

            Book.hasMany(models.ReceiptHasBook, {
                foreignKey: "bookId",
                as: "receiptHasBook",
            });

            Book.hasOne(models.FinePolicyHasBook, {
                foreignKey: "bookId",
                as: "finePolicyHasBook",
            });

            Book.hasMany(models.BookingHasBook, {
                foreignKey: "bookId",
                as: "bookingHasBook",
            });

            Book.belongsTo(models.BookGroup, {
                foreignKey: "bookGroupId",
                as: "bookGroup",
            });
        }
    }
    Book.init(
        {
            schoolId: {
                type: DataTypes.BIGINT,
            },
            bookGroupId: {
                type: DataTypes.BIGINT,
                allowNull: false,
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
            positionId: {
                type: DataTypes.BIGINT,
                validate: {
                    notEmpty: true,
                    async checkEmptyForeignKey(value) {
                        await checkEmptyForeignKey(value, sequelize.models.Position, {
                            schoolId: this.schoolId,
                        });
                    },
                },
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
            bookCode: {
                type: DataTypes.STRING,
                validate: {
                    len: {
                        args: [0, 50],
                    },
                    async isUnique(value) {
                        await isUnique({
                            id: this.id,
                            field: "bookCode",
                            value,
                            model: sequelize.models.Book,
                            extraConditions: { schoolId: this.schoolId },
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
            modelName: "Book",
            timestamps: true,
            underscored: false,
            hooks: {
                beforeValidate: (Book) => {},
            },
        }
    );

    return Book;
};
