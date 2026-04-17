import express from "express";
import {
  checkout, getTransactions, getTransactionById
} from "../controllers/billingController.js";
import { protect } from "../middleware/authMiddleware.js";

const router = express.Router();
router.post("/checkout", protect, checkout);
router.get("/transactions", protect, getTransactions);
router.get("/transactions/:id", protect, getTransactionById);

export default router;