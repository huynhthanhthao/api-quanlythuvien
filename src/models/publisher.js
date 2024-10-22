"use strict";
const { Model, Op } = require("sequelize");
const { isUnique, isPhone, isEmail } = require("../../utils/customer-validate");

module.exports = (sequelize, DataTypes) => {
    class Publisher extends Model {
        /**
         * Helper method for defining associations.
         * This method is not a part of Sequelize lifecycle.
         * The `models/index` file will call this method automatically.
         */
        static associate(models) {
            // define association here
        }
    }
    Publisher.init(
        {
            schoolId: {
                type: DataTypes.BIGINT,
            },
            pubName: {
                type: DataTypes.STRING,
                allowNull: false,
                validate: {
                    len: {
                        args: [0, 255],
                    },
                    notEmpty: true,
                },
            },
            pubCode: {
                type: DataTypes.STRING,
                allowNull: false,
                validate: {
                    len: {
                        args: [0, 50],
                    },
                    async isUnique(value) {
                        await isUnique({
                            id: this.id,
                            field: "pubCode",
                            value,
                            model: sequelize.models.Publisher,
                            extraConditions: { schoolId: this.schoolId },
                        });
                    },
                    notEmpty: true,
                },
            },
            pubDes: {
                type: DataTypes.TEXT,
            },
            phone: {
                type: DataTypes.STRING,
                allowNull: false,
                validate: {
                    isPhone(value) {
                        isPhone(value);
                    },
                    notEmpty: true,
                },
            },
            address: {
                type: DataTypes.TEXT,
            },
            email: {
                type: DataTypes.STRING,
                validate: {
                    len: {
                        args: [0, 255],
                    },
                    isEmail(value) {
                        isEmail(value);
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
            modelName: "Publisher",
            timestamps: true,
            underscored: false,
            hooks: {
                beforeValidate: (Publisher) => {},
            },
        }
    );

    return Publisher;
};
