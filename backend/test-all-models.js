import dotenv from "dotenv";
dotenv.config();

import { GoogleGenerativeAI } from "@google/generative-ai";

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);

const modelsToTry = [
    "gemini-pro",
    "gemini-1.0-pro",
    "gemini-1.5-pro",
    "gemini-1.5-flash",
    "gemini-1.5-pro-latest",
    "gemini-1.5-flash-latest",
    "models/gemini-pro",
    "models/gemini-1.0-pro",
    "models/gemini-1.5-pro",
    "models/gemini-1.5-flash",
];

async function testAllModels() {
    console.log("Testing API Key:", process.env.GEMINI_API_KEY?.substring(0, 20) + "...\n");

    for (const modelName of modelsToTry) {
        try {
            console.log(`Testing: ${modelName}...`);
            const model = genAI.getGenerativeModel({ model: modelName });
            const result = await model.generateContent("Say hi");
            console.log(`✅ SUCCESS: ${modelName} WORKS!`);
            console.log(`Response: ${result.response.text()}\n`);
            return; // Stop after first success
        } catch (error) {
            console.log(`❌ FAILED: ${error.message}\n`);
        }
    }

    console.log("\n🚨 ALL MODELS FAILED!");
    console.log("Your API key is likely:");
    console.log("1. Invalid or expired");
    console.log("2. For a different Google service (PaLM instead of Gemini)");
    console.log("3. Not enabled for Generative Language API");
    console.log("\nSolution: Create a NEW API key at https://aistudio.google.com/app/apikey");
}

testAllModels();