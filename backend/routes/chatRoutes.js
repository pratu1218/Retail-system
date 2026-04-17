import express from "express";
import { chat, chatStream } from "../controllers/chatController.js";
import { protect } from "../middleware/authMiddleware.js";

const router = express.Router();

router.post("/", protect, chat);
router.post("/stream", protect, chatStream);

// Optional route for models (temporary safe response)
router.get("/models", (req, res) => {
    res.json({
        models: [
            "llama3-70b-8192",
            "llama3-8b-8192",
            "mixtral-8x7b-32768"
        ]
    });
});

export default router;