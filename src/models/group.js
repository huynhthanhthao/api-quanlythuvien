"use strict";
const { Model, Op } = require("sequelize");

module.exports = (sequelize, DataTypes) => {
    class Group extends Model {
        /**
         * Helper method for defining associations.
         * This method is not a part of Sequelize lifecycle.
         * The `models/index` file will call this method automatically.
         */
        static associate(models) {
            // define association here
            Group.belongsToMany(models.Role, {
                through: "GroupHasRoles",
                foreignKey: "groupId",
            });
        }
    }
    Group.init(
        {
            schoolId: {
                type: DataTypes.BIGINT,
            },
            groupCode: {
                type: DataTypes.STRING,
            },
            groupName: {
                type: DataTypes.STRING,
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
            modelName: "Group",
            timestamps: true,
            underscored: false,
            hooks: {
                beforeValidate: (Group) => {},
            },
        }
    );

    return Group;
};
