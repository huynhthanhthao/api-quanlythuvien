"use strict";
const { Model, Op } = require("sequelize");
const { isUnique } = require("../../utils/customer-validate");

module.exports = (sequelize, DataTypes) => {
    class ReaderGroup extends Model {
        /**
         * Helper method for defining associations.
         * This method is not a part of Sequelize lifecycle.
         * The `models/index` file will call this method automatically.
         */
        static associate(models) {
            // define association here
            ReaderGroup.hasMany(models.User, {
                foreignKey: "groupId",
                as: "userList",
            });
        }
    }
    ReaderGroup.init(
        {
            schoolId: {
                type: DataTypes.BIGINT,
            },
            groupName: {
                type: DataTypes.STRING,
                allowNull: false,
                validate: {
                    len: {
                        args: [0, 255],
                    },
                    notEmpty: true,
                },
            },
            groupCode: {
                type: DataTypes.STRING,
                allowNull: false,
                validate: {
                    len: {
                        args: [0, 50],
                    },
                    async isUnique(value) {
                        await isUnique({
                            id: this.id,
                            field: "groupCode",
                            value,
                            model: sequelize.models.ReaderGroup,
                            extraConditions: { schoolId: this.schoolId },
                        });
                    },
                    notEmpty: true,
                },
            },
            quantityLimit: {
                type: DataTypes.INTEGER,
                allowNull: false,
                validate: {
                    isNumeric: true,
                    notEmpty: true,
                    min: {
                        args: [1],
                    },
                },
            },
            timeLimit: {
                type: DataTypes.INTEGER,
                allowNull: false,
                validate: {
                    isNumeric: true,
                    notEmpty: true,
                    min: {
                        args: [1],
                    },
                },
            },
            groupDes: {
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
            modelName: "ReaderGroup",
            timestamps: true,
            underscored: false,
            hooks: {
                beforeValidate: (ReaderGroup) => {},
            },
        }
    );

    return ReaderGroup;
};
