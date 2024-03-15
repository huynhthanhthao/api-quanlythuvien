"use strict";
const { Model, Op } = require("sequelize");

module.exports = (sequelize, DataTypes) => {
    class Role extends Model {
        /**
         * Helper method for defining associations.
         * This method is not a part of Sequelize lifecycle.
         * The `models/index` file will call this method automatically.
         */
        static associate(models) {
            // define association here
            Role.belongsTo(models.GroupRole, {
                foreignKey: "groupId",
                as: "group",
            });

            Role.hasMany(models.PermissionHasRole, {
                foreignKey: "roleId",
                as: "permissionHasRole",
            });

            Role.hasMany(models.AccountHasRole, {
                foreignKey: "roleId",
                as: "accountHasRole",
            });
        }
    }
    Role.init(
        {
            roleName: {
                type: DataTypes.STRING,
            },
            roleCode: {
                type: DataTypes.STRING,
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
            modelName: "Role",
            timestamps: true,
            underscored: false,
            hooks: {
                beforeValidate: (Role) => {},
            },
        }
    );

    return Role;
};
