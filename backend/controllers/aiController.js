import asyncHandler from "express-async-handler";
import Product from "../models/Product.js";
import Transaction from "../models/Transaction.js";

export const getRestockSuggestions = asyncHandler(async (req, res) => {
  const products = await Product.find({ shopId: req.user.shopId });

  const thirtyDaysAgo = new Date(Date.now() - 30 * 24 * 60 * 60 * 1000);

  const salesData = await Transaction.aggregate([
    {
      $match: {
        shopId: req.user.shopId,
        createdAt: { $gte: thirtyDaysAgo }
      }
    },
    { $unwind: "$items" },
    {
      $group: {
        _id: "$items.product",
        totalSold: { $sum: "$items.quantity" }
      }
    }
  ]);

  const salesMap = {};
  salesData.forEach(s => {
    salesMap[s._id.toString()] = s.totalSold;
  });

  const suggestions = [];

  for (const p of products) {
    const sold = salesMap[p._id.toString()] || 0;
    const dailyAvg = sold / 30;
    const daysLeft =
      dailyAvg > 0 ? Math.floor(p.quantity / dailyAvg) : 999;

    const urgency =
      p.quantity <= p.lowStockThreshold
        ? "critical"
        : daysLeft <= 7
          ? "soon"
          : "ok";

    if (urgency !== "ok") {
      suggestions.push({
        productId: p._id,
        productName: p.name,
        currentStock: p.quantity,
        dailyAvgSales: parseFloat(dailyAvg.toFixed(2)),
        daysOfStockLeft:
          daysLeft === 999 ? "No sales data" : daysLeft,
        urgency,
        suggestedRestockQty: Math.max(
          Math.ceil(dailyAvg * 30),
          p.lowStockThreshold * 3
        )
      });
    }
  }

  suggestions.sort((a, b) =>
    a.urgency === "critical" ? -1 : 1
  );

  res.json(suggestions);
});

export const getSlowMoving = asyncHandler(async (req, res) => {
  const products = await Product.find({
    shopId: req.user.shopId
  });

  const salesData = await Transaction.aggregate([
    { $match: { shopId: req.user.shopId } },
    { $unwind: "$items" },
    {
      $group: {
        _id: "$items.product",
        totalSold: { $sum: "$items.quantity" }
      }
    }
  ]);

  const salesMap = {};
  salesData.forEach(s => {
    salesMap[s._id.toString()] = s.totalSold;
  });

  const result = products
    .filter(p => (salesMap[p._id.toString()] || 0) < 5)
    .map(p => ({
      productId: p._id,
      productName: p.name,
      totalSold: salesMap[p._id.toString()] || 0,
      currentStock: p.quantity,
      recommendation: "Consider discount or promotion"
    }));

  res.json(result);
});