import dotenv from "dotenv";
dotenv.config();

import { GoogleGenerativeAI } from "@google/generative-ai";

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);

async function testAPI() {
    console.log("Testing API Key...");
    console.log("Key:", process.env.GEMINI_API_KEY?.substring(0, 20) + "...");

    try {
        // Test with gemini-1.5-pro
        console.log("\n1. Testing gemini-1.5-pro...");
        const model1 = genAI.getGenerativeModel({ model: "gemini-1.5-pro" });
        const result1 = await model1.generateContent("Say hello");
        console.log("✅ gemini-1.5-pro WORKS!");
        console.log("Response:", result1.response.text());
        return;
    } catch (e) {
        console.log("❌ gemini-1.5-pro failed:", e.message);
    }

    try {
        // Test with gemini-1.5-flash
        console.log("\n2. Testing gemini-1.5-flash...");
        const model2 = genAI.getGenerativeModel({ model: "gemini-1.5-flash" });
        const result2 = await model2.generateContent("Say hello");
        console.log("✅ gemini-1.5-flash WORKS!");
        console.log("Response:", result2.response.text());
        return;
    } catch (e) {
        console.log("❌ gemini-1.5-flash failed:", e.message);
    }

    try {
        // Test with gemini-1.0-pro
        console.log("\n3. Testing gemini-1.0-pro...");
        const model3 = genAI.getGenerativeModel({ model: "gemini-1.0-pro" });
        const result3 = await model3.generateContent("Say hello");
        console.log("✅ gemini-1.0-pro WORKS!");
        console.log("Response:", result3.response.text());
        return;
    } catch (e) {
        console.log("❌ gemini-1.0-pro failed:", e.message);
    }

    console.log("\n❌ ALL MODELS FAILED - Your API key is invalid!");
}

testAPI();