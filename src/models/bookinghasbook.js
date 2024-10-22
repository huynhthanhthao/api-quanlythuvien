"use strict";
const { Model, Op } = require("sequelize");
const { checkForeignKey } = require("../../utils/customer-validate");

module.exports = (sequelize, DataTypes) => {
    class BookingHasBook extends Model {
        /**
         * Helper method for defining associations.
         * This method is not a part of DataTypes lifecycle.
         * The `models/index` file will call this method automatically.
         */
        static associate(models) {
            // define association here
            BookingHasBook.belongsTo(models.Book, {
                foreignKey: "bookId",
                as: "book",
            });

            BookingHasBook.belongsTo(models.BookingBorrowForm, {
                foreignKey: "formId",
                as: "bookingForm",
            });
        }
    }
    BookingHasBook.init(
        {
            schoolId: {
                type: DataTypes.BIGINT,
            },
            formId: {
                type: DataTypes.BIGINT,
                allowNull: false,
                validate: {
                    notEmpty: true,
                    isNumeric: true,
                    async checkForeignKey(value) {
                        await checkForeignKey(value, sequelize.models.BookingBorrowForm, {
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
            active: {
                type: DataTypes.BOOLEAN,
                defaultValue: true,
            },
        },
        {
            sequelize,
            modelName: "BookingHasBook",
            timestamps: true,
            underscored: false,
            hooks: {
                beforeValidate: (BookingHasBook) => {},
            },
        }
    );

    return BookingHasBook;
};
