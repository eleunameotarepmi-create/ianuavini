
import { extractWineryDataFromText } from './services/geminiService';
import * as dotenv from 'dotenv';
dotenv.config();

const testText = `
🍇 PRIOD – VIGNAIOLI DI ISSOGNE

🥂 Patri Meo Rosé – Vin de Table
Rosato secco

> Un rosé naturale...
Le uve vengono pressate...
Colore: arancione chiaro.
Profumo: fruttato.
Abbinamenti: pesce.

🍷 Bocoueil – Vin de Table
Rosso secco

> Il Bocoueil è l’espressione più tradizionale...
Colore: rosso rubino.
Abbinamenti: formaggi.

💡 Curiosità: “Bocoueil” significa boccone.

📍 Priod è una delle voci più pure...

Glossario e Analisi dei Vini – PRIOD
| Termine | Definizione |
| Macerazione | Lungo contatto... |
`;

async function runDebug() {
    console.log("--- START DEBUG ---");
    try {
        const result = await extractWineryDataFromText(testText);
        console.log("WINERY:", result.winery.name);
        result.wines.forEach((w, i) => {
            console.log(`\n[WINE ${i + 1}] ${w.name}`);
            console.log("DESC:", w.description);
            // Check if description contains 'Glossario'
            if (w.description && (w.description.includes("Glossario") || w.description.includes("Priod è una delle voci"))) {
                console.error("FAIL: Description contains Footer/Glossary!");
            } else {
                console.log("SUCCESS: Description is clean.");
            }
        });
    } catch (e) {
        console.error("CRASH:", e);
    }
    console.log("--- END DEBUG ---");
}

runDebug();
