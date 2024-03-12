"use strict";
const { Model, Op } = require("sequelize");

module.exports = (sequelize, DataTypes) => {
    class Field extends Model {
        /**
         * Helper method for defining associations.
         * This method is not a part of Sequelize lifecycle.
         * The `models/index` file will call this method automatically.
         */
        static associate(models) {
            // define association here
            Field.hasMany(models.FieldHasBook, {
                foreignKey: "fieldId",
                as: "fieldHasBook",
            });
        }
    }
    Field.init(
        {
            schoolId: {
                type: DataTypes.BIGINT,
            },
            fieldName: {
                type: DataTypes.STRING,
            },
            fieldCode: {
                type: DataTypes.STRING,
            },
            fieldDes: {
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
            modelName: "Field",
            timestamps: true,
            underscored: false,
            hooks: {
                beforeValidate: (Field) => {},
            },
        }
    );

    return Field;
};
