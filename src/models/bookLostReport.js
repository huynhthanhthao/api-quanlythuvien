"use strict";
const { Model } = require("sequelize");
const { checkForeignKey } = require("../../utils/customer-validate");

module.exports = (sequelize, DataTypes) => {
    class BookLostReport extends Model {
        /**
         * Helper method for defining associations.
         * This method is not a part of Sequelize lifecycle.
         * The `models/index` file will call this method automatically.
         */
        static associate(models) {
            // define association here

            BookLostReport.hasMany(models.LostReportHasBook, {
                foreignKey: "lostReportId",
                as: "lostReportHasBook",
            });

            BookLostReport.belongsTo(models.LoanReceipt, {
                foreignKey: "loanReceiptId",
                as: "loanReceipt",
            });
        }
    }
    BookLostReport.init(
        {
            schoolId: {
                type: DataTypes.BIGINT,
            },
            loanReceiptId: {
                type: DataTypes.BIGINT,
                allowNull: false,
                validate: {
                    notEmpty: true,
                    isNumeric: true,
                    async checkForeignKey(value) {
                        await checkForeignKey(value, sequelize.models.LoanReceipt, {
                            schoolId: this.schoolId,
                        });
                    },
                },
            },
            reportDes: {
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
            modelName: "BookLostReport",
            timestamps: true,
            underscored: false,
        }
    );

    return BookLostReport;
};
