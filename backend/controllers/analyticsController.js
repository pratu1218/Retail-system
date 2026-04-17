import asyncHandler from "express-async-handler";
import Transaction from "../models/Transaction.js";

export const getSummary = asyncHandler(async (req, res) => {
  const { period = "today" } = req.query;
  const now = new Date();
  let startDate;

  if (period === "today") {
    startDate = new Date(now.getFullYear(), now.getMonth(), now.getDate());
  } else if (period === "week") {
    startDate = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000);
  } else if (period === "month") {
    startDate = new Date(Date.now() - 30 * 24 * 60 * 60 * 1000);
  }

  const transactions = await Transaction.find({
    shopId: req.user.shopId,
    createdAt: { $gte: startDate }
  });

  const totalSales = transactions.reduce(
    (sum, t) => sum + t.totalAmount,
    0
  );

  const totalOrders = transactions.length;

  res.json({
    period,
    totalSales: parseFloat(totalSales.toFixed(2)),
    totalOrders,
    averageOrderValue: totalOrders
      ? parseFloat((totalSales / totalOrders).toFixed(2))
      : 0
  });
});

export const getTopProducts = asyncHandler(async (req, res) => {
  const result = await Transaction.aggregate([
    { $match: { shopId: req.user.shopId } },
    { $unwind: "$items" },
    {
      $group: {
        _id: "$items.productName",
        totalSold: { $sum: "$items.quantity" },
        totalRevenue: { $sum: "$items.subtotal" }
      }
    },
    { $sort: { totalSold: -1 } },
    { $limit: 10 }
  ]);

  res.json(result);
});

export const getDailySales = asyncHandler(async (req, res) => {
  const result = await Transaction.aggregate([
    { $match: { shopId: req.user.shopId } },
    {
      $group: {
        _id: {
          $dateToString: {
            format: "%Y-%m-%d",
            date: "$createdAt"
          }
        },
        total: { $sum: "$totalAmount" },
        orders: { $sum: 1 }
      }
    },
    { $sort: { _id: -1 } },
    { $limit: 30 }
  ]);

  res.json(result);
});