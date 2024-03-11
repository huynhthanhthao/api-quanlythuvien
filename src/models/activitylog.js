"use strict";
const { Model, Op } = require("sequelize");

module.exports = (sequelize, DataTypes) => {
    class ActivityLog extends Model {
        /**
         * Helper method for defining associations.
         * This method is not a part of Sequelize lifecycle.
         * The `models/index` file will call this method automatically.
         */
        static associate(models) {
            // define association here
        }
    }
    ActivityLog.init(
        {
            schoolId: {
                type: DataTypes.BIGINT,
            },
            activityName: {
                type: DataTypes.BOOLEAN,
            },
            action: {
                type: DataTypes.INTEGER,
            },
            accountId: {
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
            modelName: "ActivityLog",
            timestamps: true,
            underscored: false,
            hooks: {
                beforeValidate: (ActivityLog) => {},
            },
        }
    );

    return ActivityLog;
};
