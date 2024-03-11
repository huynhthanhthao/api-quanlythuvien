"use strict";
const { Model, Op } = require("sequelize");

module.exports = (sequelize, DataTypes) => {
    class Class extends Model {
        /**
         * Helper method for defining associations.
         * This method is not a part of Sequelize lifecycle.
         * The `models/index` file will call this method automatically.
         */
        static associate(models) {
            // define association here
            Class.belongsTo(models.SchoolYear, {
                foreignKey: "schoolYearId",
                as: "schoolYear",
            });
        }
    }
    Class.init(
        {
            schoolId: {
                type: DataTypes.BIGINT,
            },
            schoolYearId: {
                type: DataTypes.BIGINT,
            },
            classCode: {
                type: DataTypes.STRING,
            },
            className: {
                type: DataTypes.STRING,
            },
            classDes: {
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
            modelName: "Class",
            timestamps: true,
            underscored: false,
            hooks: {
                beforeValidate: (Class) => {},
            },
        }
    );

    return Class;
};
