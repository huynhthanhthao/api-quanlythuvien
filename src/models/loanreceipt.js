"use strict";
const { Model, Op } = require("sequelize");
const { checkForeignKey, isUnique } = require("../../utils/customer-validate");

module.exports = (sequelize, DataTypes) => {
    class LoanReceipt extends Model {
        /**
         * Helper method for defining associations.
         * This method is not a part of Sequelize lifecycle.
         * The `models/index` file will call this method automatically.
         */
        static associate(models) {
            // define association here
            LoanReceipt.belongsTo(models.User, {
                foreignKey: "userId",
                as: "user",
            });

            LoanReceipt.hasMany(models.ReceiptHasBook, {
                foreignKey: "loanReceiptId",
                as: "receiptHasBook",
            });

            LoanReceipt.hasMany(models.BookLostReport, {
                foreignKey: "loanReceiptId",
                as: "bookLostReport",
            });

            LoanReceipt.hasMany(models.ExtensionHistory, {
                foreignKey: "loanReceiptId",
                as: "extensionHistory",
            });
        }
    }
    LoanReceipt.init(
        {
            schoolId: {
                type: DataTypes.BIGINT,
            },
            userId: {
                type: DataTypes.BIGINT,
                allowNull: false,
                validate: {
                    async checkForeignKey(value) {
                        await checkForeignKey(value, sequelize.models.User, {
                            schoolId: this.schoolId,
                        });
                    },
                    notEmpty: true,
                },
            },
            receiptCode: {
                type: DataTypes.STRING,
                validate: {
                    len: {
                        args: [0, 50],
                    },
                    async isUnique(value) {
                        await isUnique({
                            id: this.id,
                            field: "receiptCode",
                            value,
                            model: sequelize.models.LoanReceipt,
                            extraConditions: { schoolId: this.schoolId },
                        });
                    },
                },
            },
            receiveDate: {
                type: DataTypes.DATE,
                // allowNull: false,
                // validate: {
                //     notEmpty: true,
                // },
            },
            returnDate: {
                type: DataTypes.DATE,
                allowNull: false,
                validate: {
                    notEmpty: true,
                },
            },
            receiptDes: {
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
            modelName: "LoanReceipt",
            timestamps: true,
            underscored: false,
            hooks: {
                beforeValidate: (LoanReceipt) => {},
            },
        }
    );

    return LoanReceipt;
};
