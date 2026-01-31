import { Router, type Router as ExpressRouter } from "express";
import authRoutes from "./auth.routes.js";

const router: ExpressRouter = Router();

router.get("/health", (_req, res) => {
  res.json({ ok: true, version: "v1" });
});
router.use("/auth", authRoutes);

export default router;
