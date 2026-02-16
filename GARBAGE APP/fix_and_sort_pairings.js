
import fs from 'fs';

const DB_PATH = './db.json';

// Defined Order for Categories
const CATEGORY_ORDER = ['Antipasti', 'Primi', 'Secondi', 'Dolci'];

// Dolcetto New Pairings (Missing ones found from previous steps)
// ID 1: Savoia
// ID 3: Entrée valdostana
// ID 5: Vitello tonnato
// ID 9: Tris del Piemonte
// ID 13: Pasta e fagioli
// ID 50: Pansoti (using the salsa noci one as more appropriate for Dolcetto than butter/thyme)
// ID 22: La tartiflette
// ID 25: Petto d'anatra
// ID 26: Coniglio alla ligure
// ID 27: Cotoletta
// "Le polente" wasn't found in the txt output clearly, but ID 20 (Polenta concia) was found in Step 1588. Let's add ID 20.

const DOLCETTO_ID = "casa-e-di-mirafiore-dolcetto-dalba-doc";
const DOLCETTO_PAIRINGS = [
    { dishId: "1", label: "Sapidità", description: "Il tannino morbido e il frutto vinoso del Dolcetto si sposano alla perfezione con la rusticità dei salumi e la grassezza dei formaggi." },
    { dishId: "3", label: "Sapidità", description: "Un abbinamento territoriale che esalta la sapidità dei salumi e la dolcezza del miele." },
    { dishId: "5", label: "Eleganza", description: "La freschezza del vino pulisce il palato dalla salsa tonnata, rispettando la delicatezza della carne." },
    { dishId: "9", label: "Terroso", description: "Un rosso di corpo medio che non sovrasta le verdure ma accompagna con piacevolezza la componente terrosa dei funghi." },
    { dishId: "13", label: "Umami", description: "La componente vinosa e la morbidezza del Dolcetto accompagnano la texture dei fagioli e la sapidità della pasta." },
    { dishId: "50", label: "Umami", description: "La pulizia del Dolcetto e la sua beva agile bilanciano la dolcezza dei pansoti e la cremosità della salsa alle noci." },
    { dishId: "20", label: "Struttura", description: "Struttura moderata e frutto croccante sono ideali per accompagnare la polenta senza appesantire il piatto." },
    { dishId: "22", label: "Grassezza", description: "L'acidità moderata e il tannino gentile sgrassano la ricchezza della Tartiflette, creando un equilibrio goloso." },
    { dishId: "25", label: "Dolce-salato", description: "La succulenza dell'anatra e la nota dolce del sidro trovano un piacevole contrasto nel frutto croccante del Dolcetto." },
    { dishId: "26", label: "Aromaticità", description: "Le note di erbe e la beva agile del Dolcetto rispettano la carne bianca del coniglio, pulendo il palato dagli aromi liguri." },
    { dishId: "27", label: "Grassezza", description: "Un classico abbinamento: il frutto rosso e la freschezza del vino ripuliscono dalla panatura fritta." }
];

const NASCETTA_ID = "casa-e-di-mirafiore-langhe-nascetta-doc";

try {
    const db = JSON.parse(fs.readFileSync(DB_PATH, 'utf8'));
    const menu = db.menu || [];

    // Helper to get category rank
    const getRank = (dishId) => {
        const dish = menu.find(d => d.id === dishId);
        if (!dish) return 99;
        const idx = CATEGORY_ORDER.indexOf(dish.category);
        return idx === -1 ? 99 : idx;
    };

    // 1. Fix Dolcetto Pairings
    const dolcetto = db.wines.find(w => w.id === DOLCETTO_ID);
    if (dolcetto) {
        console.log("Updating Dolcetto pairings...");
        // Merge logic: ensure we don't duplicate but update descriptions if missing
        if (!dolcetto.ianuaPairings) dolcetto.ianuaPairings = [];

        DOLCETTO_PAIRINGS.forEach(newPair => {
            const existingIdx = dolcetto.ianuaPairings.findIndex(p => p.dishId === newPair.dishId);
            if (existingIdx >= 0) {
                // Update existing
                dolcetto.ianuaPairings[existingIdx] = { ...dolcetto.ianuaPairings[existingIdx], ...newPair };
            } else {
                // Add new
                dolcetto.ianuaPairings.push(newPair);
            }
        });

        // SORT Dolcetto
        dolcetto.ianuaPairings.sort((a, b) => getRank(a.dishId) - getRank(b.dishId));
        console.log(`Dolcetto sorted. Total: ${dolcetto.ianuaPairings.length}`);
    }

    // 2. Sort Nascetta Pairings (already missing ones were added in prev step)
    const nascetta = db.wines.find(w => w.id === NASCETTA_ID);
    if (nascetta && nascetta.ianuaPairings) {
        console.log("Sorting Nascetta pairings...");
        nascetta.ianuaPairings.sort((a, b) => getRank(a.dishId) - getRank(b.dishId));
        console.log(`Nascetta sorted. Total: ${nascetta.ianuaPairings.length}`);
    }

    fs.writeFileSync(DB_PATH, JSON.stringify(db, null, 2), 'utf8');
    console.log("Database updated successfully.");

} catch (error) {
    console.error("Error updating DB:", error);
}
