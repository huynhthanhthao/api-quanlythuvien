"use strict";
const { Model, Op } = require("sequelize");
const { isUnique } = require("../../utils/customer-validate");

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
                allowNull: false,
                validate: {
                    len: {
                        args: [0, 255],
                    },
                    notEmpty: true,
                },
            },
            fieldCode: {
                type: DataTypes.STRING,
                allowNull: false,
                validate: {
                    len: {
                        args: [0, 50],
                    },
                    async isUnique(value) {
                        await isUnique({
                            id: this.id,
                            field: "fieldCode",
                            value,
                            model: sequelize.models.Field,
                            extraConditions: { schoolId: this.schoolId },
                        });
                    },
                    notEmpty: true,
                },
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
