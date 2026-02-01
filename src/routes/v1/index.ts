import { Router, type Router as ExpressRouter } from "express";
import authRoutes from "./auth.routes.js";
import documentsRoutes from "./documents.routes.js";
import searchRoutes from "./search.routes.js";

const router: ExpressRouter = Router();

router.use("/auth", authRoutes);
router.use("/documents", documentsRoutes);
router.use("/search", searchRoutes);

export default router;
