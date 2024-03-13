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

            Book.belongsTo(models.Publisher, {
                foreignKey: "publisherId",
                as: "publisher",
            });

            Book.belongsTo(models.Category, {
                foreignKey: "categoryId",
                as: "category",
            });

            Book.belongsTo(models.Language, {
                foreignKey: "languageId",
                as: "language",
            });

            Book.hasMany(models.FieldHasBook, {
                foreignKey: "bookId",
                as: "fieldHasBook",
            });

            Book.hasMany(models.BookHasStatus, {
                foreignKey: "bookId",
                as: "bookHasStatus",
            });

            Book.hasMany(models.ReceiptHasBook, {
                foreignKey: "bookId",
                as: "receiptHasBook",
            });
        }
    }
    Book.init(
        {
            schoolId: {
                type: DataTypes.BIGINT,
            },
            positionId: {
                type: DataTypes.BIGINT,
                validate: {
                    async checkEmptyForeignKey(value) {
                        await checkEmptyForeignKey(value, sequelize.models.Position, {
                            schoolId: this.schoolId,
                        });
                    },
                },
            },
            publisherId: {
                type: DataTypes.BIGINT,
                allowNull: false,
                validate: {
                    notEmpty: true,
                    isNumeric: true,
                    async checkForeignKey(value) {
                        await checkForeignKey(value, sequelize.models.Publisher, {
                            schoolId: this.schoolId,
                        });
                    },
                },
            },
            categoryId: {
                type: DataTypes.BIGINT,
                allowNull: false,
                validate: {
                    notEmpty: true,
                    isNumeric: true,
                    async checkForeignKey(value) {
                        await checkForeignKey(value, sequelize.models.Category, {
                            schoolId: this.schoolId,
                        });
                    },
                },
            },
            languageId: {
                type: DataTypes.BIGINT,
                allowNull: false,
                validate: {
                    notEmpty: true,
                    isNumeric: true,
                    async checkForeignKey(value) {
                        await checkForeignKey(value, sequelize.models.Language, {
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
            bookName: {
                type: DataTypes.TEXT,
                allowNull: false,
                validate: {
                    len: {
                        args: [0, 255],
                    },
                    notEmpty: true,
                },
            },
            bookDes: {
                type: DataTypes.TEXT,
            },
            otherName: {
                type: DataTypes.TEXT,
                validate: {
                    len: {
                        args: [0, 255],
                    },
                },
            },
            author: {
                type: DataTypes.STRING,
                allowNull: false,
                validate: {
                    len: {
                        args: [0, 255],
                    },
                    notEmpty: true,
                },
            },
            pages: {
                type: DataTypes.INTEGER,
                validate: {
                    isNumeric: true,
                },
            },
            yearPublication: {
                type: DataTypes.INTEGER,
                validate: {
                    isNumeric: true,
                },
            },
            rePublic: {
                type: DataTypes.INTEGER,
                validate: {
                    isNumeric: true,
                },
            },
            price: {
                type: DataTypes.DOUBLE,
                validate: {
                    isNumeric: true,
                },
            },
            photoURL: {
                type: DataTypes.TEXT,
                defaultValue: BOOK_URL_DEFAULT,
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
