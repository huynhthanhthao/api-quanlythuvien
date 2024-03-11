class SequelizeCustom {
    static async bulkUpdate(data, model, condition, account, transaction) {
        await model.update(
            { active: false, updatedBy: account.id },
            { where: { active: true, ...condition }, transaction }
        );

        await model.bulkCreate(data, { transaction });
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
