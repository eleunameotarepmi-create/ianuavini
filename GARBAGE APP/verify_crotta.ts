
import { extractWineryDataFromText } from './services/geminiService';
import * as dotenv from 'dotenv';
dotenv.config();

const CROTTA_TEXT = `
LA CROTTA DI VEGNERON – CHAMBAVE

“Pendio, sole, pietra, vento” non è solo un motto, ma l’essenza stessa della filosofia produttiva della Crotta: una viticoltura di montagna che vive in armonia con l’ambiente.
Fondata nel 1980 da 25 viticoltori, oggi La Crotta di Vegneron riunisce 53 famiglie di soci e produce mediamente 200.000 bottiglie all’anno.
Le uve provengono da due aree storiche della Valle d’Aosta:
la zona di Chambave, che include i comuni di Châtillon, Pontey, Saint-Vincent, Saint-Denis e Verrayes; 
la zona di Nus, comprendente Quart e Fénis.
Le vigne, tra i 450 e i 750 metri s.l.m., si estendono su terreni morenici sabbiosi in forte pendenza, dove la vite cresce su suoli drenanti e ricchi di minerali.
La Crotta è prima di tutto una storia di persone: generazioni di viticulteurs che portano avanti la tradizione dei campagnards, ricercando nell’unione tra vitigni autoctoni e territorio la propria forza identitaria.

 Curiosità: “Vegneron” in patois valdostano significa viticoltore — un termine che celebra il lavoro umano, la fatica e la sapienza tramandata nel tempo.

Vini proposti da Ianua:

Chambave Muscat – Vallée d’Aoste D.O.C.
Bianco aromatico – 100% Moscato Bianco
`;

async function runTest() {
    console.log("Testing text extraction for 'La Crotta di Vegneron'...");
    try {
        const data = await extractWineryDataFromText(CROTTA_TEXT);

        console.log("---------------------------------------------------");
        console.log("NAME:", data.winery.name);
        console.log("DESCRIPTION:", data.winery.description ? data.winery.description.substring(0, 50) + "..." : "MISSING");
        console.log("CURIOSITY:", data.winery.curiosity ? data.winery.curiosity.substring(0, 50) + "..." : "MISSING");
        console.log("WINES FOUND:", data.wines.length);
        console.log("---------------------------------------------------");

        if (!data.winery.description) console.error("❌ FAILED: Description missing.");
        if (!data.winery.curiosity) console.error("❌ FAILED: Curiosity missing.");

    } catch (error) {
        console.error("Test Error:", error);
    }
}

runTest();
