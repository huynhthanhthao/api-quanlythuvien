"use strict";
const { Model, Op } = require("sequelize");
const { checkForeignKey, isUnique } = require("../../utils/customer-validate");

module.exports = (sequelize, DataTypes) => {
    class BookingBorrowForm extends Model {
        /**
         * Helper method for defining associations.
         * This method is not a part of DataTypes lifecycle.
         * The `models/index` file will call this method automatically.
         */
        static associate(models) {
            // define association here
            BookingBorrowForm.hasMany(models.BookingHasBook, {
                foreignKey: "formId",
                as: "bookingHasBook",
            });

            BookingBorrowForm.belongsTo(models.User, {
                foreignKey: "userId",
                as: "user",
            });
        }
    }
    BookingBorrowForm.init(
        {
            schoolId: {
                type: DataTypes.BIGINT,
            },
            userId: {
                type: DataTypes.BIGINT,
                allowNull: false,
                validate: {
                    notEmpty: true,
                    isNumeric: true,
                    async checkForeignKey(value) {
                        await checkForeignKey(value, sequelize.models.User, {
                            schoolId: this.schoolId,
                        });
                    },
                },
            },
            formCode: {
                type: DataTypes.STRING,
                validate: {
                    len: {
                        args: [0, 50],
                    },
                    async isUnique(value) {
                        await isUnique({
                            id: this.id,
                            field: "formCode",
                            value,
                            model: sequelize.models.BookingBorrowForm,
                            extraConditions: { schoolId: this.schoolId },
                        });
                    },
                },
            },
            receiveDate: {
                type: DataTypes.DATE,
            },
            isConfirmed: {
                type: DataTypes.BOOLEAN,
                defaultValue: false,
            },
            bookingDes: {
                type: DataTypes.TEXT,
            },
            token: {
                type: DataTypes.TEXT,
            },
            active: {
                type: DataTypes.BOOLEAN,
                defaultValue: true,
            },
        },
        {
            sequelize,
            modelName: "BookingBorrowForm",
            timestamps: true,
            underscored: false,
            hooks: {
                beforeValidate: (BookingBorrowForm) => {},
            },
        }
    );

    return BookingBorrowForm;
};
