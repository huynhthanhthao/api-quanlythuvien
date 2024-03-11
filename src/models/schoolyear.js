"use strict";
const { Model, Op } = require("sequelize");

module.exports = (sequelize, DataTypes) => {
    class SchoolYear extends Model {
        /**
         * Helper method for defining associations.
         * This method is not a part of Sequelize lifecycle.
         * The `models/index` file will call this method automatically.
         */
        static associate(models) {
            // define association here
        }
    }
    SchoolYear.init(
        {
            schoolId: {
                type: DataTypes.BIGINT,
            },
            year: {
                type: DataTypes.INTEGER,
            },
            schoolYearDes: {
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
            modelName: "SchoolYear",
            timestamps: true,
            underscored: false,
            hooks: {
                beforeValidate: (SchoolYear) => {},
            },
        }
    );

    return SchoolYear;
};
