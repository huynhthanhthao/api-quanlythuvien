"use strict";
const { Model, Op } = require("sequelize");

module.exports = (sequelize, DataTypes) => {
    class Permission extends Model {
        /**
         * Helper method for defining associations.
         * This method is not a part of Sequelize lifecycle.
         * The `models/index` file will call this method automatically.
         */
        static associate(models) {
            // define association here
        }
    }
    Permission.init(
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
            modelName: "Permission",
            timestamps: true,
            underscored: false,
            hooks: {
                beforeValidate: (Permission) => {},
            },
        }
    );

    return Permission;
};
