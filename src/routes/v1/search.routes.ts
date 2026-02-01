import { Router } from "express";
import { asyncHandler } from "../../utils/asyncHandler.js";
import { requireAuth } from "../../middlewares/auth.middleware.js";
import * as searchController from "../../controllers/search.controller.js";

const router = Router();

router.post("/", requireAuth, asyncHandler(searchController.search));

export default router;
