"use strict";
const { Model, Op } = require("sequelize");
const { checkForeignKey, isUnique } = require("../../utils/customer-validate");

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

            Class.hasMany(models.ClassHasUser, {
                foreignKey: "classId",
                as: "classHasUser",
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
                allowNull: false,
                validate: {
                    notEmpty: true,
                    isNumeric: true,
                    async checkForeignKey(value) {
                        await checkForeignKey(value, sequelize.models.SchoolYear, {
                            schoolId: this.schoolId,
                        });
                    },
                },
            },
            classCode: {
                type: DataTypes.STRING,
                allowNull: false,
                validate: {
                    len: {
                        args: [0, 50],
                    },
                    async isUnique(value) {
                        await isUnique({
                            id: this.id,
                            field: "classCode",
                            value,
                            model: sequelize.models.Class,
                            extraConditions: { schoolId: this.schoolId },
                        });
                    },
                    notEmpty: true,
                },
            },
            className: {
                type: DataTypes.STRING,
                allowNull: false,
                validate: {
                    len: {
                        args: [0, 255],
                    },
                    notEmpty: true,
                },
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
