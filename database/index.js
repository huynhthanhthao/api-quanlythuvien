const Sequelize = require("sequelize");

class DatabaseConnection {
    static async connect() {
        const databaseName = process.env.POSTGRES_DATABASE;
        const username = process.env.POSTGRES_USER;
        const password = process.env.POSTGRES_PASSWORD;
        const options = {
            host: process.env.POSTGRES_HOST,
            dialect: "postgres",
            logging: false,
            // dialectOptions: {
            //     ssl: {
            //         require: true,
            //     },
            // },
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
