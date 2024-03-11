"use strict";
const { Model, Op } = require("sequelize");
const { PENALTY_TICKET_STATUS } = require("../../enums/common");

module.exports = (sequelize, DataTypes) => {
    class PenaltyTicket extends Model {
        /**
         * Helper method for defining associations.
         * This method is not a part of Sequelize lifecycle.
         * The `models/index` file will call this method automatically.
         */
        static associate(models) {
            // define association here
            PenaltyTicket.belongsTo(models.User, {
                foreignKey: "userId",
                as: "user",
            });

            PenaltyTicket.hasMany(models.DetailPenaltyTicket, {
                foreignKey: "ticketId",
                as: "detailPenaltyTicket",
            });
        }
    }
    PenaltyTicket.init(
        {
            schoolId: {
                type: DataTypes.BIGINT,
            },
            ticketCode: {
                type: DataTypes.STRING,
            },
            userId: {
                type: DataTypes.BIGINT,
            },

            status: {
                type: DataTypes.INTEGER,
                defaultValue: PENALTY_TICKET_STATUS.UNPAID,
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
            modelName: "PenaltyTicket",
            timestamps: true,
            underscored: false,
            hooks: {
                beforeValidate: (PenaltyTicket) => {},
            },
        }
    );

    return PenaltyTicket;
};
