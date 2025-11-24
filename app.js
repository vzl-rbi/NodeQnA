import express from "express";
import cookieParser from "cookie-parser";
import { authRouter } from "./routes/authRoute.js";
import { questionRouter } from "./routes/questionRoute.js";
import { renderHomePage } from "./controllers/authController.js";
import { promisify } from "util";
import jwt from "jsonwebtoken";
import { answerRouter } from "./routes/answerRoute.js";
const app = express();
const PORT = 8000;
import session from "express-session";
import flash from "connect-flash";
import { catchError } from "./utils/catchError.js";
import { Server } from "socket.io";
import { answers } from "./model/index.js";
// View Engine
app.set("view engine", "ejs");

// Static files
app.use(express.static("public/css/"));
app.use(express.static("./storage"));

// Parsing middleware
app.use(express.urlencoded({ extended: true }));
app.use(express.json());
app.use(cookieParser());
app.use(
  session({
    secret: "thisissecretforsession",
    resave: false,
    saveUninitialized: false,
  })
);
app.use(flash());

app.use(async (req, res, next) => {
  const token = req.cookies.jwtToken;
  try {
    const decoded = await promisify(jwt.verify)(
      token,
      process.env.JWT_SECRET || "superweak-secret"
    );
    if (decoded) {
      res.locals.authenticatedToken = true;
    } else {
      res.locals.authenticatedToken = false;
    }
  } catch (err) {
    res.locals.authenticatedToken = false;
  }

  // console.log("Token :", token);
  next();
});

// Routes
app.get("/", catchError(renderHomePage));
app.use("/", authRouter);
app.use("/", questionRouter);
app.use("/answer", answerRouter);

// 404 handler
app.use((req, res) => {
  res.status(404).send("Route not found");
});

// Server
const server = app.listen(PORT, () =>
  console.log(`Server running at http://localhost:${PORT}`)
);
const io = new Server(server, {
  cors: {
    origin: "*",
  },
});

io.on("connection", (socket) => {
  socket.on("like", async (id) => {
    const answer = await answers.findByPk(id);
    if (answer) {
      answer.likes += 1;
      await answer.save();

      socket.emit("likeUpdate", answer.likes);
    }
  });
});
