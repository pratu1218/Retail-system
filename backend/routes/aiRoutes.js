import express from "express";
import {
  getRestockSuggestions, getSlowMoving
} from "../controllers/aiController.js";
import { protect } from "../middleware/authMiddleware.js";

const router = express.Router();
router.get("/restock-suggestions", protect, getRestockSuggestions);
router.get("/slow-moving", protect, getSlowMoving);

export default router;