import { Router } from "express";
import { asyncHandler } from "../../utils/asyncHandler.js";
import { requireAuth } from "../../middlewares/auth.middleware.js";
import * as documentsController from "../../controllers/documents.controller.js";

const router = Router();

router.post("/", requireAuth, asyncHandler(documentsController.create));
router.post(
  "/:id/ingest",
  requireAuth,
  asyncHandler(documentsController.ingest),
);
router.get("/", requireAuth, asyncHandler(documentsController.list));

export default router;
