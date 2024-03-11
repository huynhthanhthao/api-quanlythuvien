"use strict";
const { Model, Op } = require("sequelize");

module.exports = (sequelize, DataTypes) => {
    class Publisher extends Model {
        /**
         * Helper method for defining associations.
         * This method is not a part of Sequelize lifecycle.
         * The `models/index` file will call this method automatically.
         */
        static associate(models) {
            // define association here
        }
    }
    Publisher.init(
        {
            schoolId: {
                type: DataTypes.BIGINT,
            },
            pubName: {
                type: DataTypes.STRING,
            },
            pubCode: {
                type: DataTypes.STRING,
            },
            pubDes: {
                type: DataTypes.TEXT,
            },
            phone: {
                type: DataTypes.STRING,
            },
            address: {
                type: DataTypes.TEXT,
            },
            email: {
                type: DataTypes.STRING,
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
            modelName: "Publisher",
            timestamps: true,
            underscored: false,
            hooks: {
                beforeValidate: (Publisher) => {},
            },
        }
    );

    return Publisher;
};
