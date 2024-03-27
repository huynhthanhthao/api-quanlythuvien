"use strict";
const { Model, Op } = require("sequelize");
const { SETTING_STATUS } = require("../../enums/common");

module.exports = (sequelize, DataTypes) => {
    class Attachment extends Model {
        /**
         * Helper method for defining associations.
         * This method is not a part of Sequelize lifecycle.
         * The `models/index` file will call this method automatically.
         */
        static associate(models) {
            // define association here
        }
    }
    Attachment.init(
        {
            schoolId: {
                type: DataTypes.BIGINT,
            },
            bookId: {
                type: DataTypes.BIGINT,
            },
            fileName: {
                type: DataTypes.STRING,
            },
            fileType: {
                type: DataTypes.STRING,
            },
            fileURL: {
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
            modelName: "Attachment",
            timestamps: true,
            underscored: false,
            hooks: {
                beforeValidate: (Attachment) => {},
            },
        }
    );

    return Attachment;
};
