import express from "express";
import {
  askQuestion,
  renderAskQuestions,
  renderSingleQuestionPage,
} from "../controllers/questionController.js";
// import multer from "multer";
// import { storage } from "../middleware/multerConfig.js";
import { isAuthenticated } from "../middleware/isAuthenticated.js";
import { storage } from "../claudinary/index.js";
import multer from "multer";
const upload = multer({ storage: storage });

export const questionRouter = express.Router();
questionRouter
  .route("/askquestion")
  .get(isAuthenticated, renderAskQuestions)
  .post(isAuthenticated, upload.single("image"), askQuestion);
questionRouter.route("/question/:id").get(renderSingleQuestionPage);
