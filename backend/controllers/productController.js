import asyncHandler from "express-async-handler";
import Product from "../models/Product.js";

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