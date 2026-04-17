import mongoose from "mongoose";

const shopSchema = new mongoose.Schema({
    shopName: {
        type: String,
        required: true
    },
    owner: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "User"
    }
}, { timestamps: true });

export default mongoose.model("Shop", shopSchema);