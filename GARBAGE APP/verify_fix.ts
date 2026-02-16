
import { extractWineryDataFromText } from './services/geminiService';
import * as dotenv from 'dotenv';
dotenv.config();

const QUINSON_TEXT = `
🍇 Pierre Philippe QUINSON – (Quart) Cantina di Ayas

Fondata nel 2005 da Pierre Philippe Quinson, questa piccola realtà artigianale sorge nei dintorni di Aosta, tra vigneti esposti a sud e terrazzamenti che guardano la Dora Baltea.
Con soli un ettaro di vigna e una produzione annua di circa 5.000–6.000 bottiglie, la cantina lavora con filosofia artigianale, sostenibile e di precisione, vinificando esclusivamente le proprie uve.
Le altitudini tra 600 e 700 metri s.l.m. e i terreni morenici sabbiosi regalano vini eleganti e di carattere, figli diretti di un microclima secco e ventilato che garantisce maturazioni lente e regolari.

💡 Curiosità: Quinson è un punto di riferimento per la microvinificazione valdostana: un approccio sartoriale che privilegia la cura del dettaglio e l’identità del vigneto, più che la quantità prodotta..  

Glossario Tecnico e Analisi dei Vitigni
I. Terminologia e Tecniche di Produzione
| Microvinificazione | Un approccio produttivo artigianale che gestisce pochissimo prodotto (circa 5.000–6.000 bottiglie annue) con estrema cura e attenzione al dettaglio (approccio sartoriale). |
| Approccio Sartoriale | Metodo che privilegia la cura maniacale del vigneto e l'identità unica della parcella, trattando ogni bottiglia come un pezzo unico. |
`;

async function runTest() {
    console.log("Running extraction test on Quinson text...");
    try {
        const data = await extractWineryDataFromText(QUINSON_TEXT);

        console.log("\n--- EXTRACTED DATA ---");
        console.log("Winery Name:", data.winery.name);
        console.log("Description:", data.winery.description);
        console.log("Glossary Count:", data.glossary.length);
        console.log("----------------------\n");

        if (data.winery.description?.includes('| Microvinificazione |')) {
            console.error("❌ FAILED: Description contains glossary table artifacts!");
        } else if (data.winery.description?.includes('Fondata nel 2005')) {
            console.log("✅ SUCCESS: Description is clean and contains the correct text.");
        } else {
            console.warn("⚠️ UNCERTAIN: Description extracted but verify content manually.");
        }

        if (data.glossary.length > 0) {
            console.log("✅ SUCCESS: Glossary terms extracted.");
        } else {
            console.error("❌ FAILED: No glossary terms extracted.");
        }

    } catch (error) {
        console.error("Test Error:", error);
    }
}

runTest();
