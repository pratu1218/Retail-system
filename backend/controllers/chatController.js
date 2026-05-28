import dotenv from "dotenv";
dotenv.config();

import asyncHandler from "express-async-handler";
import Product from "../models/Product.js";
import Transaction from "../models/Transaction.js";
import Groq from "groq-sdk";

const groq = new Groq({ apiKey: process.env.GROQ_API_KEY });
const DEFAULT_GROQ_MODEL = "llama-3.3-70b-versatile";


const detectContext = (message) => {
    const lower = message.toLowerCase().trim();


    const storeKeywords = [
        'stock', 'product', 'sale', 'order', 'inventory', 'customer', 'revenue',
        'low stock', 'top selling', 'price', 'transaction', 'profit', 'buy/sell',
        'winter', 'seasonal', 'restock', 'today'
    ];

    const noStoreKeywords = [
        'car', 'house', 'weather', 'recipe', 'joke', 'movie', 'travel',
        'salary', 'family', 'health', 'fitness', 'personal'
    ];

    const storeScore = storeKeywords.filter(k => lower.includes(k)).length;
    const noStoreScore = noStoreKeywords.filter(k => lower.includes(k)).length;

    const isStore = storeScore > 0;
    const isPersonal = noStoreScore > 0;

    const mode = isStore ? 'STORE_ONLY' : isPersonal ? 'PERSONAL_ONLY' : 'GENERAL';

    console.log(`🔍 "${message}" → STORE:${storeScore} PERSONAL:${noStoreScore} → ${mode}`);

    return { isStore, isPersonal, mode };
};


const fetchStoreData = async (shopId) => {
    // Parallel queries
    const [products, transactions] = await Promise.all([
        Product.find({ shopId }).lean(),
        Transaction.find({ shopId }).sort({ createdAt: -1 }).limit(50).lean()
    ]);

    // Today’s sales
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const todayTransactions = transactions.filter(t => new Date(t.createdAt) >= today);
    const todaySales = todayTransactions.reduce((sum, t) => sum + Number(t.totalAmount || 0), 0);

    // Low stock
    const lowStock = products.filter(p => {
        const qty = Number(p.quantity || 0);
        return qty > 0 && qty <= (p.lowStockThreshold || 5);
    });

    // Top products
    const productSales = {};
    transactions.slice(0, 30).forEach(t => {  // Recent focus
        t.items?.forEach(item => {
            const name = item.productName || item.product || 'Unknown';
            productSales[name] = (productSales[name] || 0) + Number(item.quantity || 1);
        });
    });

    const topProducts = Object.entries(productSales)
        .sort(([, a], [, b]) => b - a)
        .slice(0, 6);

    const storeData = {
        timestamp: new Date().toLocaleString(),
        totalProducts: products.length,
        todaySales: todaySales,
        todayOrders: todayTransactions.length,
        totalSales: transactions.reduce((sum, t) => sum + Number(t.totalAmount || 0), 0),
        lowStockCount: lowStock.length,
        lowStock: lowStock.slice(0, 8).map(p => ({
            name: p.name || p.title || 'Unnamed',
            quantity: p.quantity,
            price: p.price
        })),
        topProducts: topProducts.map(([name, qty]) => ({ name, quantity: qty.toString() })),
        categories: [...new Set(products.map(p => p.category || p.name.split(' ')[0]))].slice(0, 5)
    };

    console.log(`📈 Store: ${storeData.totalProducts}p | Today: $${storeData.todaySales} | Low: ${storeData.lowStockCount}`);
    return storeData;
};

// 🔥 DUAL MODE PERFECTION
const generateDualResponse = async (message, shopId, stream = false) => {
    const context = detectContext(message);

    if (context.isStore) {
        // STORE MODE - FACTS ONLY
        const storeData = await fetchStoreData(shopId);

        const systemPrompt = `GROCERY STORE MANAGER AI

📊 EXACT STORE DATA:
TODAY: $${storeData.todaySales} (${storeData.todayOrders} orders)
TOTAL: $${storeData.totalSales} (${storeData.totalOrders || 0} orders ever)
PRODUCTS: ${storeData.totalProducts}
LOW STOCK: ${storeData.lowStockCount}

LOW STOCK ITEMS:
${storeData.lowStock.map(p => `• ${p.name}: ${p.quantity} left ($${p.price})`).join('\\n') || 'None'}

TOP SELLING:
${storeData.topProducts.map(p => `• ${p.name}: ${p.quantity} sold`).join('\\n') || 'No sales data'}

MANDATORY RULES:
1. Use EXACT numbers/names above
2. "Today's sales" = $${storeData.todaySales} precisely
3. No vague "checking" - direct facts
4. Professional store manager
5. Numbers MUST match data

${message}`;

        return groq.chat.completions.create({
            messages: [
                { role: "system", content: systemPrompt },
                { role: "user", content: `Data: ${JSON.stringify(storeData)} Answer directly.` }
            ],
            model: DEFAULT_GROQ_MODEL,
            temperature: 0.1,  // FACTS ONLY
            stream
        });

    } else {
        // PERSONAL/GENERAL - PURE AI
        const systemPrompt = `Friendly personal AI assistant.

Personal life, weather, recipes, general questions: Answer naturally.

STRICT: NO STORE MENTION unless store question.
Conversational, helpful, fun.

${message}`;

        return groq.chat.completions.create({
            messages: [
                { role: "system", content: systemPrompt },
                { role: "user", content: message }
            ],
            model: DEFAULT_GROQ_MODEL,
            temperature: 0.8,  // Natural conversation
            stream
        });
    }
};

// Controllers
export const chat = asyncHandler(async (req, res) => {
    const { message } = req.body;
    const shopId = req.user.shopId;

    const response = await generateDualResponse(message, shopId);
    res.json({ reply: response.choices[0].message.content });
});

export const chatStream = asyncHandler(async (req, res) => {
    const { message } = req.body;
    const shopId = req.user.shopId;

    const stream = await generateDualResponse(message, shopId, true);

    res.setHeader("Content-Type", "text/plain; charset=utf-8");

    for await (const chunk of stream) {
        const content = chunk.choices?.[0]?.delta?.content;
        if (content) res.write(content);
    }
    res.end();
});