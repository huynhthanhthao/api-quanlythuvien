"use strict";
const { Model } = require("sequelize");
const { checkForeignKey, checkEmptyForeignKey } = require("../../utils/customer-validate");

module.exports = (sequelize, DataTypes) => {
    class ClassHasUser extends Model {
        /**
         * Helper method for defining associations.
         * This method is not a part of Sequelize lifecycle.
         * The `models/index` file will call this method automatically.
         */
        static associate(models) {
            // define association here
            ClassHasUser.belongsTo(models.Class, {
                foreignKey: "classId",
                as: "class",
            });

            ClassHasUser.belongsTo(models.User, {
                foreignKey: "userId",
                as: "user",
            });
        }
    }
    ClassHasUser.init(
        {
            schoolId: {
                type: DataTypes.BIGINT,
            },
            classId: {
                type: DataTypes.BIGINT,
                validate: {
                    notEmpty: true,
                    async checkEmptyForeignKey(value) {
                        await checkEmptyForeignKey(value, sequelize.models.Class, {
                            schoolId: this.schoolId,
                        });
                    },
                },
            },
            userId: {
                type: DataTypes.BIGINT,
                async checkForeignKey(value) {
                    await checkForeignKey(value, sequelize.models.User, {
                        schoolId: this.schoolId,
                    });
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
            modelName: "ClassHasUser",
            timestamps: true,
            underscored: false,
            hooks: {
                beforeValidate: (ClassHasUser) => {},
            },
        }
    );

    return ClassHasUser;
};
