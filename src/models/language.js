"use strict";
const { Model } = require("sequelize");
const { isUnique } = require("../../utils/customer-validate");

module.exports = (sequelize, DataTypes) => {
    class Language extends Model {
        /**
         * Helper method for defining associations.
         * This method is not a part of Sequelize lifecycle.
         * The `models/index` file will call this method automatically.
         */
        static associate(models) {
            // define association here
        }
    }
    Language.init(
        {
            schoolId: {
                type: DataTypes.BIGINT,
            },
            lanName: {
                type: DataTypes.STRING,
                validate: {
                    len: {
                        args: [0, 255],
                    },
                    notEmpty: true,
                },
            },
            lanCode: {
                type: DataTypes.STRING,
                validate: {
                    len: {
                        args: [0, 50],
                    },
                    async isUnique(value) {
                        await isUnique({
                            id: this.id,
                            field: "lanCode",
                            value,
                            model: sequelize.models.Language,
                            extraConditions: { schoolId: this.schoolId },
                        });
                    },
                },
            },
            lanDes: {
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
            modelName: "Language",
            timestamps: true,
            underscored: false,
            hooks: {
                beforeValidate: (Language) => {},
            },
        }
    );

    return Language;
};
