"use strict";
const { Model } = require("sequelize");
const { checkForeignKey } = require("../../utils/customer-validate");

module.exports = (sequelize, DataTypes) => {
    class LostReportHasBook extends Model {
        /**
         * Helper method for defining associations.
         * This method is not a part of Sequelize lifecycle.
         * The `models/index` file will call this method automatically.
         */
        static associate(models) {
            // define association here
            LostReportHasBook.belongsTo(models.Book, {
                foreignKey: "bookId",
                as: "book",
            });
        }
    }
    LostReportHasBook.init(
        {
            schoolId: {
                type: DataTypes.BIGINT,
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
            lostReportId: {
                type: DataTypes.BIGINT,
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
            modelName: "LostReportHasBook",
            timestamps: true,
            underscored: false,
        }
    );

    return LostReportHasBook;
};
