import { where } from "sequelize";
import { users, questions, answers } from "../model/index.js";

export const renderAskQuestions = (req, res) => {
  res.render("questions/askQuestion");
};
export const askQuestion = async (req, res) => {
  const { title, description } = req.body;
  console.log(req.body);
  console.log(req.file);
  const userId = req.userId;
  const fileName = req.file.filename;
  if (!title || !description) {
    res.send("Please provide Title and Description");
  }
  await questions.create({
    title,
    description,
    image: fileName,
    userId,
  });
  res.redirect("/");
};
export const getAllQuestion = async (req, res) => {
  const data = await questions.findAll({
    include: [
      {
        model: users,
      },
    ],
  });
};

export const renderSingleQuestionPage = async (req, res) => {
  const { id } = req.params;
  const data = await questions.findAll({
    where: { id: id },
    include: [
      {
        model: users,
        attributes: ["username"],
      },
    ],
  });
  const answersData = await answers.findAll({
    where: {
      questionId: id,
    },
    include: [
      {
        model: users,
        attributes: ["username"],
      },
    ],
  });
  res.render("./questions/singleQuestion", { data, answers: answersData });
};
