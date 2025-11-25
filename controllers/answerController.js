import { QueryTypes } from "sequelize";
import { answers, sequelize } from "../model/index.js";

export const handleAnswer = async (req, res) => {
  try {
    const userId = req.userId;
    const { answer } = req.body;
    const { id: questionId } = req.params;

    const data = await answers.create({
      answerText: answer,
      userId,
      questionId,
    });
    await sequelize.query(
      `CREATE TABLE IF NOT EXISTS likes_${data.id} (
    id INT NOT NULL PRIMARY KEY AUTO_INCREMENT,
    userId INT NOT NULL REFERENCES users(id) ON DELETE CASCADE ON UPDATE CASCADE
  )`,
      {
        type: QueryTypes.CREATE, // Fixed: Changed CREATE to RAW
      }
    );

    res.redirect(`/question/${questionId}`);
  } catch (error) {
    console.error("Error creating answer:", error);
    res.status(500).send("Error creating answer");
  }
};
