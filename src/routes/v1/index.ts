import { Router, type Router as ExpressRouter } from "express";

const router: ExpressRouter = Router();

router.get("/health", (_req, res) => {
  res.json({ ok: true, version: "v1" });
});

export default router;
