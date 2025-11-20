import express from "express";
import {
  handleForgotPassword,
  handleRegister,
  handleResetPassword,
  handlerLogin,
  logout,
  renderForgotPasswordPage,
  renderLoginPage,
  renderRegisterPage,
  renderResetPassword,
  renderVerifyOtpPage,
  verifyOtp,
} from "../controllers/authController.js";
export const authRouter = express.Router();
authRouter.route("/register").get(renderRegisterPage).post(handleRegister);
authRouter.route("/login").get(renderLoginPage).post(handlerLogin);
authRouter.route("/logout").get(logout);
authRouter
  .route("/forgotPassword")
  .get(renderForgotPasswordPage)
  .post(handleForgotPassword);
authRouter.route("/verifyOtp").get(renderVerifyOtpPage);
authRouter.route("/verifyOtp/:id").post(verifyOtp);
authRouter.route("/resetPassword").get(renderResetPassword);
authRouter.route("/resetPassword/:email/:otp").post(handleResetPassword);
