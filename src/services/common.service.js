const db = require("../models");

class CommonService {
    static async getDateNow() {
        return new Date();
    }

    static async backup(account) {
        // delete db.sequelize.models.School;
        const tables = Object.keys(db.sequelize.models).filter(
            (table) => table != "School" && table != "Role" && table != "GroupRole" && table != "SchoolEmailSMTP"
        );

        const queryPromises = tables.map(async (table) => {
            const data = await db[table].findAll({
                where: {
                    schoolId: account.schoolId,
                },
            });
            return { table, data: data.map((entry) => entry.toJSON()) };
        });

        const backupResults = await Promise.all(queryPromises);

        const backupData = {};
        backupResults.forEach(({ table, data }) => {
            backupData[table] = data;
        });

        return backupData;
    }
}

module.exports = CommonService;
