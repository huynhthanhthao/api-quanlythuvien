const Sequelize = require("sequelize");

class DatabaseConnection {
    static async connect() {
        const databaseName = process.env.DB_NAME;
        const username = process.env.DB_USERNAME;
        const password = process.env.DB_PASSWORD;
        const options = {
            host: process.env.DB_HOST,
            dialect: "postgres",
            logging: false,
        };

        const sequelize = new Sequelize(databaseName, username, password, options);

        try {
            await sequelize.authenticate();
            console.log(`Connection has been established successfully`);
        } catch (error) {
            console.error("Unable to connect to the database:", error);
        }
    }
}

module.exports = DatabaseConnection;
