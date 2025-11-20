import express from "express";
import { isAuthenticated } from "../middleware/isAuthenticated.js";
import { handleAnswer } from "../controllers/answerController.js";
import { catchError } from "../utils/catchError.js";
export const answerRouter = express.Router();
answerRouter
  .route("/:id")
  .post(catchError(isAuthenticated), catchError(handleAnswer));
