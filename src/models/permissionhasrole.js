"use strict";
const { Model, Op } = require("sequelize");

module.exports = (sequelize, DataTypes) => {
    class PermissionHasRole extends Model {
        /**
         * Helper method for defining associations.
         * This method is not a part of Sequelize lifecycle.
         * The `models/index` file will call this method automatically.
         */
        static associate(models) {
            // define association here
        }
    }
    PermissionHasRole.init(
        {
            schoolId: {
                type: DataTypes.BIGINT,
            },
            permissionId: {
                type: DataTypes.BIGINT,
            },
            groupId: {
                type: DataTypes.BIGINT,
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
            modelName: "PermissionHasRole",
            timestamps: true,
            underscored: false,
            hooks: {
                beforeValidate: (PermissionHasRole) => {},
            },
        }
    );

    return PermissionHasRole;
};
