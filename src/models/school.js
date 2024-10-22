"use strict";
const { Model, Op } = require("sequelize");
const { isPhone, isEmail, isUnique } = require("../../utils/customer-validate");

module.exports = (sequelize, DataTypes) => {
    class School extends Model {
        /**
         * Helper method for defining associations.
         * This method is not a part of Sequelize lifecycle.
         * The `models/index` file will call this method automatically.
         */
        static associate(models) {
            // define association here
            School.belongsTo(models.SchoolEmailSMTP, {
                foreignKey: "schoolEmailSMTPId",
                as: "schoolEmailSMTP",
            });
        }
    }
    School.init(
        {
            schoolName: {
                type: DataTypes.STRING,
                allowNull: false,
                validate: {
                    len: {
                        args: [0, 255],
                    },
                    notEmpty: true,
                },
            },
            schoolDomain: {
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
                            field: "schoolDomain",
                            value,
                            model: sequelize.models.School,
                        });
                    },
                },
            },
            logo: {
                type: DataTypes.TEXT,
            },
            address: {
                type: DataTypes.TEXT,
            },
            phone: {
                type: DataTypes.STRING,
                validate: {
                    isPhone(value) {
                        isPhone(value);
                    },
                    len: {
                        args: [0, 255],
                    },
                },
            },
            email: {
                type: DataTypes.STRING,
                validate: {
                    isEmail(value) {
                        isEmail(value);
                    },
                    len: {
                        args: [0, 255],
                    },
                },
            },
            representative: {
                type: DataTypes.STRING,
                validate: {
                    len: {
                        args: [0, 255],
                    },
                },
            },
            representativePhone: {
                type: DataTypes.STRING,
                validate: {
                    isPhone(value) {
                        isPhone(value);
                    },
                    len: {
                        args: [0, 255],
                    },
                },
            },
            schoolEmailSMTPId: {
                type: DataTypes.BIGINT,
                allowNull: false,
                validate: {
                    notEmpty: true,
                },
            },
            active: {
                type: DataTypes.BOOLEAN,
                defaultValue: true,
            },
        },
        {
            sequelize,
            modelName: "School",
            timestamps: true,
            underscored: false,
            hooks: {
                beforeValidate: (School) => {},
            },
        }
    );

    return School;
};
