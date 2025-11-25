import { QueryTypes } from "sequelize";
import { users, questions, answers, sequelize } from "../model/index.js";
import { v2 as cloudinary } from "cloudinary";

export const renderAskQuestions = (req, res) => {
  res.render("questions/askQuestion");
};
export const askQuestion = async (req, res) => {
  const { title, description } = req.body;
  console.log(req.body);
  console.log(req.file);
  const userId = req.userId;
  const fileName = req.file.filename;
  // Upload to Cloudinary
  const result = await cloudinary.uploader.upload(req.file.path);
  // Cloudinary URL
  const imageUrl = result.secure_url;
  console.log(imageUrl);
  if (!title || !description) {
    res.send("Please provide Title and Description");
  }
  await questions.create({
    title,
    description,
    image: imageUrl,
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
  let likes;
  let count = 0;
  try {
    likes = await sequelize.query(`SELECT * FROM likes_${id}`, {
      type: QueryTypes.SELECT,
    });
    if (likes.length) {
      count = likes.length;
    }
  } catch (error) {
    console.log(error);
  }

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
  res.render("./questions/singleQuestion", {
    data,
    answers: answersData,
    likes: count,
  });
};
