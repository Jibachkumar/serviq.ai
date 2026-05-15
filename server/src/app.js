import dotenv from "dotenv";
import express from "express";
import cors from "cors";
import cookieParser from "cookie-parser";
import helmet from "helmet";
import http from "http";
import { socket } from "./sockets/socket.js";
import session from "express-session";

dotenv.config({
  path: "./.env",
});

const app = express();

// config helmet
app.use(
  helmet({
    xPoweredBy: false,
    contentSecurityPolicy: false,
    crossOriginEmbedderPolicy: false,
  }),
);

app.use(helmet.frameguard({ action: "deny" }));
app.use(helmet.noSniff());
app.use(helmet.referrerPolicy({ policy: "no-referrer" }));
// forces browsers to use HTTPS (expire in 2 years)
app.use(
  helmet.hsts({ maxAge: 63072000, includeSubDomains: true, preload: true }),
);

// config cors
app.use(
  cors({
    origin: process.env.CORS_ORIGIN,
    credentials: true,
  }),
);

/* ================= SESSION ================= */

const sessionMiddleware = session({
  secret: process.env.SESSION_SECRET,
  resave: false,
  saveUninitialized: true, // 🔥 allows anonymous sessions
  cookie: {
    httpOnly: true,
    secure: false, // true in production (HTTPS)
    maxAge: 1000 * 60 * 60 * 24, // 1 day
  },
});
app.use(sessionMiddleware);

// express config
app.use(express.json());
app.use(cookieParser());
app.use(express.urlencoded({ extended: true, limit: "16kb" }));
app.use(express.static("public"));

// routes declaration
import { userRouter } from "./routers/user.routers.js";
import { businessRouter } from "./routers/business.routers.js";
import { serviceRouter } from "./routers/service.routes.js";
import { agentRouter } from "./routers/AIConfig.routers.js";

app.use("/api/v1/users", userRouter);
app.use("/api/v1/business", businessRouter);
app.use("/api/v1/business", serviceRouter);
app.use("/api/v1/agent", agentRouter);

// error
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(err.statusCode || 500).json({
    message: err.message || "Internal Server Error",
  });
});

// socket config
const server = http.createServer(app);
socket(server, sessionMiddleware);

export { app, server };
