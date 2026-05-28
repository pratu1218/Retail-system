import mongoose from "mongoose";

const transactionItemSchema = new mongoose.Schema({
  product: { type: mongoose.Schema.Types.ObjectId, ref: "Product", required: true },
  productName: { type: String, required: true },
  quantity: { type: Number, required: true },
  unitPrice: { type: Number, required: true },
  subtotal: { type: Number, required: true }
});

const transactionSchema = new mongoose.Schema({
  items: [transactionItemSchema],

  totalAmount: {
    type: Number,
    required: true
  },

  paymentMethod: {
    type: String,
    enum: ["cash", "card", "upi"],
    default: "cash"
  },

  servedBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User"
  },


  shopId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Shop",
    required: true
  }

}, { timestamps: true });

export default mongoose.model("Transaction", transactionSchema);