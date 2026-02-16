
import { extractWineryDataFromText } from './services/geminiService.ts';
import dotenv from 'dotenv';
dotenv.config({ path: '.env.local' });

console.log("Starting test...");
async function run() {
    try {
        const text = "Cantina Test - Vini buoni. Vino Rosso 13% Nebbiolo.";
        console.log("Calling Gemini...");
        const result = await extractWineryDataFromText(text);
        console.log("Result:", JSON.stringify(result, null, 2));
    } catch (e) {
        console.error("Error:", e);
    }
}
run();
