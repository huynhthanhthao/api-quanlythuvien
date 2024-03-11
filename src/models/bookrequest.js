"use strict";
const { Model, Op } = require("sequelize");
const { checkForeignKey, checkEmptyForeignKey, isUnique } = require("../../utils/customer-validate");
const { BOOK_URL_DEFAULT, DEFAULT_YEAR_PUBLICATION } = require("../../enums/common");

module.exports = (sequelize, DataTypes) => {
    class BookRequest extends Model {
        /**
         * Helper method for defining associations.
         * This method is not a part of Sequelize lifecycle.
         * The `models/index` file will call this method automatically.
         */
        static associate(models) {
            // define association here
            BookRequest.belongsTo(models.Publisher, {
                foreignKey: "publisherId",
                as: "publisher",
            });

            BookRequest.belongsTo(models.Category, {
                foreignKey: "categoryId",
                as: "category",
            });

            BookRequest.belongsTo(models.Language, {
                foreignKey: "languageId",
                as: "language",
            });
        }
    }
    BookRequest.init(
        {
            schoolId: {
                type: DataTypes.BIGINT,
            },
            languageId: {
                type: DataTypes.BIGINT,
                allowNull: true,
                validate: {
                    isNumeric: true,
                    async checkEmptyForeignKey(value) {
                        await checkEmptyForeignKey(value, sequelize.models.Language, {
                            schoolId: this.schoolId,
                        });
                    },
                },
            },
            publisherId: {
                type: DataTypes.BIGINT,
                allowNull: true,
                validate: {
                    isNumeric: true,
                    async checkEmptyForeignKey(value) {
                        await checkEmptyForeignKey(value, sequelize.models.Publisher, {
                            schoolId: this.schoolId,
                        });
                    },
                },
            },
            categoryId: {
                type: DataTypes.BIGINT,
                allowNull: true,
                validate: {
                    isNumeric: true,
                    async checkEmptyForeignKey(value) {
                        await checkEmptyForeignKey(value, sequelize.models.Category, {
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
                            model: sequelize.models.BookRequest,
                            extraConditions: { schoolId: this.schoolId },
                        });
                    },
                },
            },
            requestDate: {
                type: DataTypes.DATE,
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
            otherName: {
                type: DataTypes.TEXT,
                validate: {
                    len: {
                        args: [0, 255],
                    },
                },
            },
            bookDes: {
                type: DataTypes.TEXT,
            },
            author: {
                type: DataTypes.STRING,
                validate: {
                    len: {
                        args: [0, 255],
                    },
                },
            },
            photoURL: {
                type: DataTypes.TEXT,
                defaultValue: BOOK_URL_DEFAULT,
            },
            rePublic: {
                type: DataTypes.INTEGER,
                validate: {
                    isNumeric: true,
                },
                defaultValue: DEFAULT_YEAR_PUBLICATION,
            },
            yearPublication: {
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
            modelName: "BookRequest",
            timestamps: true,
            underscored: false,
            hooks: {
                beforeValidate: (BookRequest) => {},
            },
        }
    );

    return BookRequest;
};
