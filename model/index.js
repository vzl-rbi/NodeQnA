import { dbConfig } from "../config/dbConfig.js";
import { Sequelize, DataTypes } from "sequelize";

import { userModel } from "./userModel.js";
import { questionModel } from "./questionModel.js";
import { answerModel } from "./answerModel.js";

// Create sequelize connection
const sequelize = new Sequelize(dbConfig.DB, dbConfig.USER, dbConfig.PASSWORD, {
  host: dbConfig.HOST,
  dialect: dbConfig.dialect,
  port: 53799, // mysql-> setting -> switchyard.proxy.rlwy.net:53799// railway
  pool: dbConfig.pool,
  logging: false,
});

// Connect DB
(async () => {
  try {
    await sequelize.authenticate();
    console.log("DB connected");
  } catch (error) {
    console.error("DB connection failed:", error);
  }
})();

// Initialize models
export const users = userModel(sequelize, DataTypes);
export const questions = questionModel(sequelize, DataTypes);
export const answers = answerModel(sequelize, DataTypes);

// Model Associations
users.hasMany(questions, { foreignKey: "userId" });
questions.belongsTo(users, { foreignKey: "userId" });

questions.hasMany(answers, { foreignKey: "questionId" });
answers.belongsTo(questions, { foreignKey: "questionId" });

users.hasMany(answers, { foreignKey: "userId" });
answers.belongsTo(users, { foreignKey: "userId" });

// Sync Database
(async () => {
  try {
    await sequelize.sync({ force: false });
    console.log("Database synced");
  } catch (error) {
    console.error("Sync error:", error);
  }
})();

export { sequelize, Sequelize };
