import mongoose from "mongoose";

const productSchema = new mongoose.Schema({

  name: {
    type: String,
    required: true,
    trim: true
  },

  category: {
    type: String,
    trim: true
  },

  price: {
    type: Number,
    required: true,
    min: 0
  },

  // NEW (for profit calculation)
  costPrice: {
    type: Number,
    default: 0
  },

  quantity: {
    type: Number,
    required: true,
    default: 0,
    min: 0
  },

  lowStockThreshold: {
    type: Number,
    default: 10
  },

  // NEW (smart reorder)
  reorderLevel: {
    type: Number,
    default: 5
  },

  barcode: {
    type: String,
    unique: true,
    sparse: true
  },

  description: {
    type: String
  },

  // NEW (supplier tracking)
  supplier: {
    type: String
  },

  // NEW (last restock date)
  lastRestocked: {
    type: Date
  },

  // NEW (AI demand score)
  demandScore: {
    type: Number,
    default: 0
  },

  // Multi-tenant
  shopId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Shop",
    required: true
  }

}, { timestamps: true });


// Low Stock Virtual
productSchema.virtual("isLowStock").get(function () {
  return this.quantity <= this.lowStockThreshold;
});


// Profit Margin Virtual
productSchema.virtual("profitMargin").get(function () {
  return this.price - this.costPrice;
});


productSchema.set("toJSON", { virtuals: true });

export default mongoose.model("Product", productSchema);