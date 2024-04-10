"use strict";
const { Model, Op } = require("sequelize");
const { checkForeignKey } = require("../../utils/customer-validate");

module.exports = (sequelize, DataTypes) => {
    class PermissionHasRole extends Model {
        /**
         * Helper method for defining associations.
         * This method is not a part of Sequelize lifecycle.
         * The `models/index` file will call this method automatically.
         */
        static associate(models) {
            // define association here
            PermissionHasRole.belongsTo(models.Role, {
                foreignKey: "roleId",
                as: "role",
            });
        }
    }
    PermissionHasRole.init(
        {
            schoolId: {
                type: DataTypes.BIGINT,
            },
            permissionId: {
                type: DataTypes.BIGINT,
                allowNull: false,
                validate: {
                    notEmpty: true,
                    isNumeric: true,
                    async checkForeignKey(value) {
                        await checkForeignKey(value, sequelize.models.Permission);
                    },
                },
            },
            roleId: {
                type: DataTypes.BIGINT,
                allowNull: false,
                validate: {
                    notEmpty: true,
                    isNumeric: true,
                    async checkForeignKey(value) {
                        await checkForeignKey(value, sequelize.models.Role);
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
