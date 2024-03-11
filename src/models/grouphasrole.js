"use strict";
const { Model, Op } = require("sequelize");

module.exports = (sequelize, DataTypes) => {
    class GroupHasRole extends Model {
        /**
         * Helper method for defining associations.
         * This method is not a part of Sequelize lifecycle.
         * The `models/index` file will call this method automatically.
         */
        static associate(models) {
            // define association here
        }
    }
    GroupHasRole.init(
        {
            schoolId: {
                type: DataTypes.BIGINT,
            },
            roleId: {
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
            modelName: "GroupHasRole",
            timestamps: true,
            underscored: false,
            hooks: {
                beforeValidate: (GroupHasRole) => {},
            },
        }
    );

    return GroupHasRole;
};
