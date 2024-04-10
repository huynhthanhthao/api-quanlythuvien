"use strict";
const { Model, Op } = require("sequelize");
const { checkForeignKey, checkEmptyForeignKey, isUnique } = require("../../utils/customer-validate");
const { BOOK_URL_DEFAULT } = require("../../enums/common");

module.exports = (sequelize, DataTypes) => {
    class BookGroup extends Model {
        /**
         * Helper method for defining associations.
         * This method is not a part of Sequelize lifecycle.
         * The `models/index` file will call this method automatically.
         */
        static associate(models) {
            // define association here

            BookGroup.belongsTo(models.Publisher, {
                foreignKey: "publisherId",
                as: "publisher",
            });

            BookGroup.belongsTo(models.Category, {
                foreignKey: "categoryId",
                as: "category",
            });

            BookGroup.belongsTo(models.Language, {
                foreignKey: "languageId",
                as: "language",
            });
            BookGroup.hasMany(models.FieldHasBook, {
                foreignKey: "bookGroupId",
                as: "fieldHasBook",
            });
            BookGroup.hasMany(models.Attachment, {
                foreignKey: "bookGroupId",
                as: "attachFiles",
            });

            BookGroup.hasMany(models.Book, {
                foreignKey: "bookGroupId",
                as: "detailBooks",
            });
        }
    }
    BookGroup.init(
        {
            schoolId: {
                type: DataTypes.BIGINT,
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
            bookName: {
                type: DataTypes.TEXT,
                allowNull: false,
                validate: {
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
            loanFee: {
                type: DataTypes.DOUBLE,
            },
            penaltyApplied: {
                type: DataTypes.BOOLEAN,
                defaultValue: true,
            },
            borrowFeeApplied: {
                type: DataTypes.BOOLEAN,
                defaultValue: false,
            },
            photoURL: {
                type: DataTypes.TEXT,
                defaultValue: BOOK_URL_DEFAULT,
            },
            slug: {
                type: DataTypes.STRING,
                allowNull: false,
                validate: {
                    len: {
                        args: [0, 255],
                    },
                    notEmpty: true,
                    async isUnique(value) {
                        await isUnique({
                            id: this.id,
                            field: "slug",
                            value,
                            model: sequelize.models.BookGroup,
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
            modelName: "BookGroup",
            timestamps: true,
            underscored: false,
            hooks: {
                beforeValidate: (BookGroup) => {},
            },
        }
    );

    return BookGroup;
};
