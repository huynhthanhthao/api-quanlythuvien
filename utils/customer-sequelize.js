const { Op } = require("sequelize");

class SequelizeCustom {
    static async bulkUpdate(data, model, condition, account, transaction) {
        const dataOld = data.filter((item) => item.id);
        const dataNew = data.filter((item) => !item.id);

        const dataOldIds = dataOld.map((item) => +item.id);

        await model.update(
            { active: false, updatedBy: account.id },
            { where: { active: true, ...condition, id: { [Op.notIn]: dataOldIds } }, transaction }
        );

        for (const item of dataOld) {
            await model.update({ ...item, updatedBy: account.Id }, { where: { active: true, id: item.id } });
        }

        await model.bulkCreate(dataNew, { transaction });
    }

    static getPagination(count, limit, page) {
        const totalPages = Math.ceil(count / limit);

        return {
            totalRecords: count,
            totalPages,
            currentPage: page,
            limit,
        };
    }
}

module.exports = SequelizeCustom;
