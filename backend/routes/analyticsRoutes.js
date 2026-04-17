import express from "express";
import {
  getSummary, getTopProducts, getDailySales
} from "../controllers/analyticsController.js";
import { protect } from "../middleware/authMiddleware.js";

const router = express.Router();
router.get("/summary", protect, getSummary);
router.get("/top-products", protect, getTopProducts);
router.get("/daily-sales", protect, getDailySales);

export default router;