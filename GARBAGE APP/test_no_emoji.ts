
import { extractWineryDataFromText } from './services/geminiService';
import * as dotenv from 'dotenv';
dotenv.config();

const PLAIN_TEXT = `
Pierre Philippe QUINSON – (Quart) Cantina di Ayas

Fondata nel 2005 da Pierre Philippe Quinson, questa piccola realtà artigianale sorge nei dintorni di Aosta.

Valle d’Aosta Torrette Supérieur “Le Soldat” – D.O.C.
Rosso secco – Petit Rouge 75%, Fumin 15%, Cornalin 10%
Il vino simbolo della cantina.
Gradazione alcolica: 13,5% vol.

Beato Emerico Rosé – Vallée d’Aoste D.O.C.
Rosato secco – Gamay 60%, Mayolet 30%, Merlot 10%
Un rosé delicato e raffinato.
Gradazione alcolica: 12,5% vol.
`;

async function runTest() {
    console.log("Testing Pure AI Extraction on PLAIN TEXT (No Emojis)...");
    try {
        const data = await extractWineryDataFromText(PLAIN_TEXT);

        console.log("Winery:", data.winery.name);
        console.log("Wines Found:", data.wines.length);
        data.wines.forEach(w => console.log(`- ${w.name} (${w.grapes})`));

        if (data.wines.length === 2) {
            console.log("✅ SUCCESS: Found both wines without emoji delimiters.");
        } else {
            console.error(`❌ FAILED: Expected 2 wines, found ${data.wines.length}`);
        }

    } catch (error) {
        console.error("Test Error:", error);
    }
}

runTest();
