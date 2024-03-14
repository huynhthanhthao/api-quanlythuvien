"use strict";
const { Model, Op } = require("sequelize");

module.exports = (sequelize, DataTypes) => {
    class GroupRole extends Model {
        /**
         * Helper method for defining associations.
         * This method is not a part of Sequelize lifecycle.
         * The `models/index` file will call this method automatically.
         */
        static associate(models) {
            // define association here
            GroupRole.hasMany(models.Role, {
                foreignKey: "groupId",
                as: "roleList",
            });
        }
    }
    GroupRole.init(
        {
            schoolId: {
                type: DataTypes.BIGINT,
            },
            perName: {
                type: DataTypes.STRING,
            },
            perDes: {
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
            modelName: "GroupRole",
            timestamps: true,
            underscored: false,
            hooks: {
                beforeValidate: (GroupRole) => {},
            },
        }
    );

    return GroupRole;
};
