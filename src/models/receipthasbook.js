"use strict";
const { Model, Op } = require("sequelize");
const { checkForeignKey, checkEmptyForeignKey } = require("../../utils/customer-validate");
const { LOAN_STATUS } = require("../../enums/common");

module.exports = (sequelize, DataTypes) => {
    class ReceiptHasBook extends Model {
        /**
         * Helper method for defining associations.
         * This method is not a part of Sequelize lifecycle.
         * The `models/index` file will call this method automatically.
         */
        static associate(models) {
            // define association here
            ReceiptHasBook.belongsTo(models.LoanReceipt, {
                foreignKey: "loanReceiptId",
                as: "loanReceipt",
            });

            ReceiptHasBook.belongsTo(models.Book, {
                foreignKey: "bookId",
                as: "book",
            });

            ReceiptHasBook.belongsTo(models.BookStatus, {
                foreignKey: "bookStatusId",
                as: "bookStatus",
            });
        }
    }
    ReceiptHasBook.init(
        {
            schoolId: {
                type: DataTypes.BIGINT,
            },
            bookId: {
                type: DataTypes.BIGINT,
                allowNull: false,
                validate: {
                    async checkForeignKey(value) {
                        await checkForeignKey(value, sequelize.models.Book, {
                            schoolId: this.schoolId,
                        });
                    },
                    notEmpty: true,
                },
            },
            loanReceiptId: {
                type: DataTypes.BIGINT,
                allowNull: false,
                validate: {
                    async checkForeignKey(value) {
                        await checkForeignKey(value, sequelize.models.LoanReceipt, {
                            schoolId: this.schoolId,
                        });
                    },
                    notEmpty: true,
                },
            },
            bookStatusId: {
                type: DataTypes.BIGINT,
                validate: {
                    notEmpty: true,
                    async checkEmptyForeignKey(value) {
                        await checkEmptyForeignKey(value, sequelize.models.BookStatus, {
                            schoolId: this.schoolId,
                        });
                    },
                },
            },
            type: {
                type: DataTypes.INTEGER,
                defaultValue: LOAN_STATUS.BORROWING,
            },
            loanFee: {
                type: DataTypes.DOUBLE,
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
            modelName: "ReceiptHasBook",
            timestamps: true,
            underscored: false,
            hooks: {
                beforeValidate: (ReceiptHasBook) => {},
            },
        }
    );

    return ReceiptHasBook;
};
