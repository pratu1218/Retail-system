import asyncHandler from "express-async-handler";
import Product from "../models/Product.js";
import Transaction from "../models/Transaction.js";

const getShopId = (req, res) => {
  if (!req.user || !req.user.shopId) {
    res.status(401);
    throw new Error("User shop not found. Please login again.");
  }
  return req.user.shopId;
};

export const getProducts = asyncHandler(async (req, res) => {
  const { category, search } = req.query;
  const shopId = getShopId(req, res);

  const filter = { shopId };

  if (category) filter.category = category;
  if (search) filter.name = { $regex: search, $options: "i" };

  const products = await Product.find(filter).sort({ createdAt: -1 });
  res.json(products);
});

export const getProductById = asyncHandler(async (req, res) => {
  const shopId = getShopId(req, res);

  const product = await Product.findOne({
    _id: req.params.id,
    shopId
  });

  if (!product) {
    res.status(404);
    throw new Error("Product not found");
  }

  res.json(product);
});

export const getProductByBarcode = asyncHandler(async (req, res) => {
  const shopId = getShopId(req, res);

  const product = await Product.findOne({
    barcode: req.params.barcode,
    shopId
  });

  if (!product) {
    res.status(404);
    throw new Error("Product not found");
  }

  res.json(product);
});

export const createProduct = asyncHandler(async (req, res) => {
  const shopId = getShopId(req, res);

  const { name, category, price, quantity, lowStockThreshold, barcode, description } = req.body;

  if (!name || !price) {
    res.status(400);
    throw new Error("Name and price are required");
  }

  const product = await Product.create({
    name,
    category,
    price,
    quantity,
    lowStockThreshold,
    barcode,
    description,
    shopId
  });

  res.status(201).json(product);
});

export const updateProduct = asyncHandler(async (req, res) => {
  const shopId = getShopId(req, res);

  const product = await Product.findOneAndUpdate(
    {
      _id: req.params.id,
      shopId
    },
    req.body,
    { new: true, runValidators: true }
  );

  if (!product) {
    res.status(404);
    throw new Error("Product not found");
  }

  res.json(product);
});

export const deleteProduct = asyncHandler(async (req, res) => {
  const shopId = getShopId(req, res);

  const product = await Product.findOneAndDelete({
    _id: req.params.id,
    shopId
  });

  if (!product) {
    res.status(404);
    throw new Error("Product not found");
  }

  res.json({ message: "Product deleted successfully" });
});

export const getLowStockProducts = asyncHandler(async (req, res) => {
  const shopId = getShopId(req, res);

  const products = await Product.find({
    shopId,
    $expr: { $lte: ["$quantity", "$lowStockThreshold"] }
  });

  res.json(products);
});

export const getTransactions = asyncHandler(async (req, res) => {
  const { period } = req.query;
  const now = new Date();
  let startDate;

  if (period === "today") {
    startDate = new Date(now.getFullYear(), now.getMonth(), now.getDate());
  } else if (period === "week") {
    startDate = new Date(now);
    startDate.setDate(now.getDate() - 7);
  } else if (period === "month") {
    startDate = new Date(now.getFullYear(), now.getMonth(), 1);
  }

  const shopId = getShopId(req, res);
  const query = { shopId };
  if (startDate) query.createdAt = { $gte: startDate };

  const transactions = await Transaction.find(query)
    .populate("items.product", "name price")
    .populate("servedBy", "name email")
    .sort({ createdAt: -1 });

  res.json(transactions);
});

export const getTransactionById = asyncHandler(async (req, res) => {
  const shopId = getShopId(req, res);

  const transaction = await Transaction.findOne({
    _id: req.params.id,
    shopId
  })
    .populate("items.product", "name price")
    .populate("servedBy", "name email");

  if (!transaction) {
    res.status(404);
    throw new Error("Transaction not found");
  }

  res.json(transaction);
});