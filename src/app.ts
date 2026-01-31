import express, { type Express } from "express";
import cors from "cors";
import cookieParser from "cookie-parser";
import apiRoutes from "./routes/index.js";
import { errorMiddleware } from "./middlewares/error.middleware.js";

export function createApp(): Express {
  const app = express();

  app.use(cors({ origin: process.env.CORS_ORIGIN, credentials: true }));
  app.use(cookieParser());
  app.use(express.json({ limit: "2mb" }));

  app.use("/api", apiRoutes);

  app.use(errorMiddleware);

  return app;
}
