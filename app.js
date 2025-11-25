import express from "express";
import cookieParser from "cookie-parser";
import { authRouter } from "./routes/authRoute.js";
import { questionRouter } from "./routes/questionRoute.js";
import { renderHomePage } from "./controllers/authController.js";
import { promisify } from "util";
import jwt from "jsonwebtoken";
import { answerRouter } from "./routes/answerRoute.js";
import session from "express-session";
import flash from "connect-flash";
import { catchError } from "./utils/catchError.js";
import { Server } from "socket.io";
import { answers, sequelize } from "./model/index.js";
import { QueryTypes } from "sequelize";
import dotenv from "dotenv";
dotenv.config();

const app = express();
const PORT = 8000;

// ----------------------
// VIEW + STATIC
// ----------------------
app.set("view engine", "ejs");

app.use(express.static("public/css/"));
app.use(express.static("./storage"));

// ----------------------
// BODY PARSING
// ----------------------
app.use(express.urlencoded({ extended: true }));
app.use(express.json());
app.use(cookieParser());

// ----------------------
// SESSION + FLASH
// ----------------------
app.use(
  session({
    secret: "thisissecretforsession",
    resave: false,
    saveUninitialized: false,
  })
);
app.use(flash());

// ----------------------
// AUTH TOKEN CHECK
// ----------------------
app.use(async (req, res, next) => {
  const token = req.cookies.jwtToken;

  if (!token) {
    res.locals.authenticatedToken = false;
    return next();
  }

  try {
    const decoded = await promisify(jwt.verify)(
      token,
      process.env.JWT_SECRET || "superweak-secret"
    );

    res.locals.authenticatedToken = !!decoded;
  } catch {
    res.locals.authenticatedToken = false;
  }

  next();
});

// ----------------------
// ROUTES
// ----------------------
app.get("/", catchError(renderHomePage));
app.use("/", authRouter);
app.use("/", questionRouter);
app.use("/answer", answerRouter);

app.use((req, res) => {
  res.status(404).send("Route not found");
});

// ----------------------
// SERVER + SOCKET
// ----------------------
const server = app.listen(PORT, () =>
  console.log(`Server running at http://localhost:${PORT}`)
);

const io = new Server(server, {
  cors: {
    origin: "*",
  },
});

// ----------------------
// LIKE SYSTEM
// ----------------------
io.on("connection", (socket) => {
  socket.on("like", async ({ answerId, cookie }) => {
    const answer = await answers.findByPk(answerId);

    if (answer && cookie) {
      const decoded = await promisify(jwt.verify)(
        cookie,
        process.env.JWT_SECRET || "superweak-secret"
      );

      if (decoded) {
        const user = await sequelize.query(
          `SELECT * FROM likes_${answerId} WHERE userID=${decoded.id}`,
          {
            type: QueryTypes.SELECT,
          }
        );
        if (user.length === 0) {
          await sequelize.query(
            `INSERT INTO likes_${answerId} (userId) VALUES(${decoded.id})`,
            {
              type: QueryTypes.INSERT,
            }
          );
        }
      }

      const likes = await sequelize.query(`SELECT * FROM likes_${answerId}`, {
        type: QueryTypes.SELECT,
      });
      const likesCount = likes.length;
      await answers.update(
        {
          likes: likesCount,
        },
        {
          where: {
            id: answerId,
          },
        }
      );

      console.log(likesCount);
      socket.emit("likeUpdate", { likesCount, answerId });
    }
  });
});
