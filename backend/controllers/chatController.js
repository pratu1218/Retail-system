import dotenv from "dotenv";
dotenv.config();

import asyncHandler from "express-async-handler";
import Product from "../models/Product.js";
import Transaction from "../models/Transaction.js";
import Groq from "groq-sdk";

const groq = new Groq({
    apiKey: process.env.GROQ_API_KEY
});

const DEFAULT_GROQ_MODEL =
    process.env.GROQ_MODEL || "llama-3.3-70b-versatile";


// Helper
function safeStringifyTrim(obj, maxChars = 60000) {
    try {
        const s = JSON.stringify(obj);
        return s.length > maxChars ? s.slice(0, maxChars) + "...(trimmed)" : s;
    } catch (e) {
        return "(unserializable)";
    }
}


// Detect Business Question
const isBusinessQuestion = (message) => {

    const keywords = [
        "sales",
        "stock",
        "inventory",
        "product",
        "profit",
        "revenue",
        "order",
        "store",
        "shop",
        "customer",
        "transaction",
        "sell",
        "low stock",
        "top selling"
    ];

    return keywords.some(k =>
        message.toLowerCase().includes(k)
    );
};


// Build Summary
const buildBusinessSummary = (products, transactions) => {

    const totalProducts = products.length;

    const lowStock = products
        .filter(p => p.quantity <= (p.lowStockThreshold || 5))
        .slice(0, 5);

    const totalSales = transactions.reduce(
        (sum, t) => sum + (t.totalAmount || 0),
        0
    );

    const totalOrders = transactions.length;

    const topProducts = {};

    transactions.forEach(t => {
        t.items?.forEach(item => {
            topProducts[item.productName] =
                (topProducts[item.productName] || 0) + item.quantity;
        });
    });

    const topSelling = Object.entries(topProducts)
        .sort((a, b) => b[1] - a[1])
        .slice(0, 5);

    return {
        totalProducts,
        lowStock,
        totalSales,
        totalOrders,
        topSelling
    };
};


// Generate AI Response
const generateResponse = async ({
    message,
    products,
    transactions,
    summary,
    stream = false
}) => {

    const businessMode = isBusinessQuestion(message);

    let systemPrompt;

    // UPDATED PROMPT (FIXED CLEAN OUTPUT)
    if (businessMode) {
        systemPrompt = `
You are an intelligent retail AI assistant.

Respond ONLY in clean structured format:

Store Summary:
- point

Alerts:
- point

Insights:
- point

Recommendations:
- point

Rules:
- Use bullet points
- Keep short
- Avoid emojis
- Avoid long paragraphs
`;
    } else {
        systemPrompt = `
You are a helpful AI assistant.

Answer naturally and clearly.

Keep responses short and clean.
`;
    }

    const safeProducts = safeStringifyTrim(products);
    const safeTransactions = safeStringifyTrim(transactions);

    const prompt = `
BUSINESS SUMMARY:
${JSON.stringify(summary)}

PRODUCTS:
${safeProducts}

TRANSACTIONS:
${safeTransactions}

USER QUESTION:
${message}
`;

    return groq.chat.completions.create({
        messages: [
            { role: "system", content: systemPrompt },
            { role: "user", content: prompt }
        ],
        model: DEFAULT_GROQ_MODEL,
        stream,
        temperature: 0.3   // updated for cleaner responses
    });
};



// NORMAL CHAT
export const chat = asyncHandler(async (req, res) => {

    try {

        const { message } = req.body;
        const shopId = req.user.shopId;

        const products = await Product.find({ shopId }).limit(50);

        const transactions = await Transaction
            .find({ shopId })
            .sort({ createdAt: -1 })
            .limit(50);

        const summary = buildBusinessSummary(products, transactions);

        const response = await generateResponse({
            message,
            products,
            transactions,
            summary
        });

        res.json({
            reply: response.choices?.[0]?.message?.content ?? ""
        });

    } catch (error) {
        console.error(error);
        res.status(500).json({ error: "Chat failed" });
    }
});




// STREAM CHAT
export const chatStream = asyncHandler(async (req, res) => {

    try {

        const { message } = req.body;
        const shopId = req.user.shopId;

        const products = await Product.find({ shopId }).limit(50);

        const transactions = await Transaction
            .find({ shopId })
            .sort({ createdAt: -1 })
            .limit(50);

        const summary = buildBusinessSummary(products, transactions);

        const stream = await generateResponse({
            message,
            products,
            transactions,
            summary,
            stream: true
        });

        res.setHeader("Content-Type", "text/plain; charset=utf-8");

        for await (const chunk of stream) {
            res.write(chunk.choices?.[0]?.delta?.content || "");
        }

        res.end();

    } catch (error) {
        console.error(error);
        res.status(500).json({ error: "Stream failed" });
    }
});