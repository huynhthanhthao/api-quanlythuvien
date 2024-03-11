"use strict";
const { Model, Op } = require("sequelize");

module.exports = (sequelize, DataTypes) => {
    class DetailPenaltyTicket extends Model {
        /**
         * Helper method for defining associations.
         * This method is not a part of Sequelize lifecycle.
         * The `models/index` file will call this method automatically.
         */
        static associate(models) {
            // define association here
            DetailPenaltyTicket.belongsTo(models.PenaltyTicket, {
                foreignKey: "ticketId",
                as: "penaltyTicket",
            });

            DetailPenaltyTicket.belongsTo(models.Book, {
                foreignKey: "bookId",
                as: "book",
            });

            DetailPenaltyTicket.belongsTo(models.FinePolicy, {
                foreignKey: "finePolicyId",
                as: "finePolicy",
            });
        }
    }
    DetailPenaltyTicket.init(
        {
            schoolId: {
                type: DataTypes.BIGINT,
            },
            realityDayLate: {
                type: DataTypes.INTEGER,
            },
            ticketId: {
                type: DataTypes.BIGINT,
            },
            bookId: {
                type: DataTypes.BIGINT,
            },
            finePolicyId: {
                type: DataTypes.BIGINT,
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
            modelName: "DetailPenaltyTicket",
            timestamps: true,
            underscored: false,
            hooks: {
                beforeValidate: (DetailPenaltyTicket) => {},
            },
        }
    );

    return DetailPenaltyTicket;
};
