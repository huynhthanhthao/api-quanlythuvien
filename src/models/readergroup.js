"use strict";
const { Model, Op } = require("sequelize");

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
            },
            groupCode: {
                type: DataTypes.STRING,
            },
            quantityLimit: {
                type: DataTypes.INTEGER,
            },
            timeLimit: {
                type: DataTypes.INTEGER,
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
