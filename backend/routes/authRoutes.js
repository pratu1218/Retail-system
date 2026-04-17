import express from "express";
import asyncHandler from "express-async-handler";
import jwt from "jsonwebtoken";
import User from "../models/User.js";
import Shop from "../models/Shop.js";
import { protect, adminOnly } from "../middleware/authMiddleware.js";

const router = express.Router();

const generateToken = (id) => {
  return jwt.sign({ id }, process.env.JWT_SECRET, { expiresIn: "7d" });
};

// Register
router.post("/register", asyncHandler(async (req, res) => {
  const { name, email, password, role, shopName } = req.body;

  const exists = await User.findOne({ email });
  if (exists) {
    res.status(400);
    throw new Error("User already exists");
  }

  if (role === "cashier") {
    res.status(400);
    throw new Error("Cashier must be created by admin");
  }

  const user = await User.create({
    name,
    email,
    password,
    role
  });

  if (role === "admin") {

    if (!shopName) {
      res.status(400);
      throw new Error("Shop name is required");
    }

    const shop = await Shop.create({
      shopName: shopName,
      owner: user._id
    });

    user.shopId = shop._id;
    await user.save();
  }

  res.status(201).json({
    _id: user._id,
    name: user.name,
    email: user.email,
    role: user.role,
    shopId: user.shopId,
    token: generateToken(user._id)
  });

}));

// Create Cashier
router.post("/create-cashier",
  protect,
  adminOnly,
  asyncHandler(async (req, res) => {

    const { name, email, password } = req.body;

    const exists = await User.findOne({ email });

    if (exists) {
      res.status(400);
      throw new Error("User already exists");
    }

    const user = await User.create({
      name,
      email,
      password,
      role: "cashier",
      shopId: req.user.shopId
    });

    res.status(201).json({
      _id: user._id,
      name: user.name,
      email: user.email,
      role: user.role
    });

  })
);

// Login
router.post("/login", asyncHandler(async (req, res) => {

  const { email, password } = req.body;

  const user = await User.findOne({ email });

  if (user && await user.matchPassword(password)) {

    const shop = await Shop.findById(user.shopId);

    res.json({
      _id: user._id,
      name: user.name,
      email: user.email,
      role: user.role,
      shopId: user.shopId,
      shopName: shop ? shop.shopName : "",
      token: generateToken(user._id)
    });

  } else {
    res.status(401);
    throw new Error("Invalid email or password");
  }

}));

export default router;