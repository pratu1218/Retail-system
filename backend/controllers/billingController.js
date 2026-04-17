import asyncHandler from "express-async-handler";
import Transaction from "../models/Transaction.js";
import Product from "../models/Product.js";

export const checkout = asyncHandler(async (req, res) => {
  const { items, paymentMethod } = req.body;

  if (!items || items.length === 0) {
    res.status(400);
    throw new Error("No items in bill");
  }

  let totalAmount = 0;
  const resolvedItems = [];

  for (const item of items) {

    // 🔴 Filter product by shopId
    const product = await Product.findOne({
      _id: item.productId,
      shopId: req.user.shopId
    });

    if (!product) {
      res.status(404);
      throw new Error(`Product not found`);
    }

    if (product.quantity < item.quantity) {
      res.status(400);
      throw new Error(`Insufficient stock for ${product.name}`);
    }

    const subtotal = product.price * item.quantity;
    totalAmount += subtotal;

    resolvedItems.push({
      product: product._id,
      productName: product.name,
      quantity: item.quantity,
      unitPrice: product.price,
      subtotal
    });
  }

  // 🔴 Save shopId in transaction
  const transaction = await Transaction.create({
    items: resolvedItems,
    totalAmount,
    paymentMethod: paymentMethod || "cash",
    servedBy: req.user?._id,
    shopId: req.user.shopId
  });

  for (const item of resolvedItems) {
    await Product.findOneAndUpdate(
      { _id: item.product, shopId: req.user.shopId },
      { $inc: { quantity: -item.quantity } }
    );
  }

  res.status(201).json(transaction);
});

export const getTransactions = asyncHandler(async (req, res) => {

  // 🔴 Filter by shopId
  const transactions = await Transaction.find({
    shopId: req.user.shopId
  })
    .sort({ createdAt: -1 })
    .limit(50)
    .populate("servedBy", "name");

  res.json(transactions);
});

export const getTransactionById = asyncHandler(async (req, res) => {

  // 🔴 Filter by shopId
  const transaction = await Transaction.findOne({
    _id: req.params.id,
    shopId: req.user.shopId
  }).populate("servedBy", "name");

  if (!transaction) {
    res.status(404);
    throw new Error("Transaction not found");
  }

  res.json(transaction);
});