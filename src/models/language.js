"use strict";
const { Model, Op } = require("sequelize");

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
            },
            lanCode: {
                type: DataTypes.STRING,
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
