"use strict";
const { Model, Op } = require("sequelize");
const { SETTING_STATUS } = require("../../enums/common");

module.exports = (sequelize, DataTypes) => {
    class UserHasEffect extends Model {
        /**
         * Helper method for defining associations.
         * This method is not a part of Sequelize lifecycle.
         * The `models/index` file will call this method automatically.
         */
        static associate(models) {
            // define association here
        }
    }
    UserHasEffect.init(
        {
            schoolId: {
                type: DataTypes.BIGINT,
            },
            userId: {
                type: DataTypes.BIGINT,
                references: {
                    model: "Users",
                    key: "id",
                },
                onDelete: "SET NULL",
                onUpdate: "CASCADE",
            },
            startDay: {
                type: "TIMESTAMP",
            },
            endDay: {
                type: "TIMESTAMP",
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
            modelName: "UserHasEffect",
            timestamps: true,
            underscored: false,
            hooks: {
                beforeValidate: (UserHasEffect) => {},
            },
        }
    );

    return UserHasEffect;
};
