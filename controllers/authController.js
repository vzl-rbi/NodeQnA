import { questions, users } from "../model/index.js";
import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";
import { sendEmail } from "../utils/sendEmail.js";

// Pages
export const renderHomePage = async (req, res) => {
  const data = await questions.findAll({
    include: [
      {
        model: users,
      },
    ],
  });
  // console.log(data);
  const success = req.flash("success");
  res.render("home.ejs", { data, success });
};

export const renderRegisterPage = (req, res) => {
  const errors = req.flash("error");
  res.render("auth/register", { errors });
};

export const renderLoginPage = (req, res) => {
  const success = req.flash("success");
  const errors = req.flash("error");
  res.render("auth/login", { errors, success });
};

// Register
export const handleRegister = async (req, res) => {
  const { username, email, password } = req.body;

  if (!username || !email || !password) {
    return res.send("All fields are required.");
  }
  const exists = await users.findOne({ where: { email } });

  if (exists) {
    // return res.send("Email already registered.");
    req.flash("error", "Email already registered.");
    return res.redirect("/register");
  } else {
    await sendEmail({
      email: email,
      text: "Thank You for registering!!",
      subject: "Welcome to Node.js Project",
    });
  }
  const hashPassword = await bcrypt.hash(password, 10);
  await users.create({
    username,
    email,
    password: hashPassword,
  });

  return res.redirect("/login");
  //below code is in trycatch. Handled by errorCatch.js from utils
  /*
  try {
    const exists = await users.findOne({ where: { email } });

    if (exists) {
      // return res.send("Email already registered.");
      req.flash("error", "Email already registered.");
      return res.redirect("/register");
    } else {
      await sendEmail({
        email: email,
        text: "Thank You for registering!!",
        subject: "Welcome to Node.js Project",
      });
    }
    const hashPassword = await bcrypt.hash(password, 10);
    await users.create({
      username,
      email,
      password: hashPassword,
    });

    return res.redirect("/login");
  } catch (err) {
    console.error("DB ERROR:", err);
    return res.send("Something went wrong.");
  }
    */
};

// Login
export const handlerLogin = async (req, res) => {
  const { email, password } = req.body;

  if (!email || !password) {
    return res.send("All fields are required.");
  }
  const user = await users.findOne({ where: { email } });

  if (!user) {
    // return res.send("Invalid credentials.");
    req.flash("error", "Invalid Email or Password!!");
    return res.redirect("/login");
  }

  const isMatched = await bcrypt.compare(password, user.password);

  if (!isMatched) {
    // return res.send("Invalid password!!");
    req.flash("error", "Invalid Password!!");
    return res.redirect("/login");
  }

  const token = jwt.sign(
    { id: user.id },
    process.env.JWT_SECRET || "superweak-secret",
    {
      expiresIn: "30d",
    }
  );

  res.cookie("jwtToken", token, { httpOnly: true });

  // return res.redirect("/");
  req.flash("success", "Logged in Successfully");
  return res.redirect("/");

  /*
  try {
    const user = await users.findOne({ where: { email } });

    if (!user) {
      // return res.send("Invalid credentials.");
      req.flash("error", "Invalid Email or Password!!");
      return res.redirect("/login");
    }

    const isMatched = await bcrypt.compare(password, user.password);

    if (!isMatched) {
      // return res.send("Invalid credentials.");
      req.flash("error", "Invalid Password!!");
      return res.redirect("/login");
    }

    const token = jwt.sign(
      { id: user.id },
      process.env.JWT_SECRET || "superweak-secret",
      {
        expiresIn: "30d",
      }
    );

    res.cookie("jwtToken", token, { httpOnly: true });

    // return res.redirect("/askquestion");
    req.flash("success", "Logged in Successfully");
    return res.redirect("/");
  } catch (err) {
    console.error("DB ERROR:", err);
    return res.send("Something went wrong.");
  }
  */
};

export const renderForgotPasswordPage = (req, res) => {
  res.render("./auth/forgotPassword");
};
export const handleForgotPassword = async (req, res) => {
  const { email } = req.body;
  const data = await users.findAll({
    where: {
      email: email,
    },
  });
  if (data.length === 0) return res.send("No user registred with that email");
  // Generate 4-digit OTP
  const otp = Math.floor(Math.random() * 1000) + 9999;
  // Send OTP via email
  await sendEmail({
    email: email,
    subject: "Your Reset password OTP",
    text: ` your OTP is ${otp}.It will expire in 2 minutes.`,
  });
  data[0].otp = otp;
  data[0].otpGeneratedTime = Date.now();
  await data[0].save();
  res.redirect("/verifyOtp?email=" + email);
};
export const renderVerifyOtpPage = (req, res) => {
  const email = req.query.email;
  res.render("./auth/verifyOtp", { email: email });
};

export const verifyOtp = async (req, res) => {
  const { otp } = req.body;
  const email = req.params.id;
  const data = await users.findAll({
    where: {
      otp: otp,
      email: email,
    },
  });
  if (data.length === 0) {
    return res.send("Invalid OTP");
  }
  const currentTime = Date.now();
  const otpGeneratedTime = data[0].otpGeneratedTime;
  if (currentTime - otpGeneratedTime <= 120000) {
    res.redirect(`/resetPassword?email=${email}&otp=${otp}`);
  } else {
    res.send("Expired OTP");
  }
};
export const renderResetPassword = (req, res) => {
  const { email, otp } = req.query;
  if (!email || !otp) {
    res.send("Please provide email and otp for query");
  }
  res.render("./auth/resetPassword", { email, otp });
};
export const handleResetPassword = async (req, res) => {
  const { email, otp } = req.params;
  const { newPassword, passwordConfirm } = req.body;
  if (!email || !otp || !newPassword || !passwordConfirm) {
    return res.send(
      "Please provide email, otp, newpassword, and Confirm password"
    );
  }
  if (newPassword !== passwordConfirm) {
    return res.send("New password did not matched with Confirm password");
  }
  const userData = await users.findAll({
    where: {
      email,
      otp,
    },
  });
  const currentTime = Date.now();
  const otpGeneratedTime = userData[0].otpGeneratedTime;
  if (currentTime - otpGeneratedTime <= 120000) {
    await users.update(
      {
        password: await bcrypt.hash(newPassword, 10),
      },
      {
        where: {
          email: email,
        },
      }
    );
    res.redirect("/login");
  } else {
    res.send("OTP Expired");
  }
};
export const logout = (req, res) => {
  res.clearCookie("jwtToken");
  req.flash("success", "Logged Out Successfully");
  res.redirect("/login");
};
