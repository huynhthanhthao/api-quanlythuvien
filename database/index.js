const Sequelize = require("sequelize");
const { POSTGRES_DATABASE, POSTGRES_USER, POSTGRES_PASSWORD, POSTGRES_HOST, POSTGRES_PORT } = require("../enums/setup");

class DatabaseConnection {
  static async connect() {
    const databaseName = POSTGRES_DATABASE;
    const username = POSTGRES_USER;
    const password = POSTGRES_PASSWORD;
    const options = {
      host: POSTGRES_HOST,
      dialect: "postgres",
      logging: false,
      port: POSTGRES_PORT,
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
