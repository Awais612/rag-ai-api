import { Router } from "express";
import { asyncHandler } from "../../utils/asyncHandler.js";
import * as authController from "../../controllers/auth.controller.js";
import { requireAuth } from "../../middlewares/auth.middleware.js";

const router = Router();
router.post("/signup", asyncHandler(authController.signup));
router.post("/login", asyncHandler(authController.login));
router.post("/logout", asyncHandler(authController.logout));
router.post("/refresh", asyncHandler(authController.refresh));

export default router;
