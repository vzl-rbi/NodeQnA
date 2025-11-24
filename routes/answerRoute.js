import express from "express";
import { isAuthenticated } from "../middleware/isAuthenticated.js";
import { handleAnswer } from "../controllers/answerController.js";
export const answerRouter = express.Router();
answerRouter.route("/:id").post(isAuthenticated, handleAnswer);
