
import fs from 'fs';

const DB_PATH = './db.json';

// Descriptions generated based on wine profile and dish characteristics
const MISSING_DESCRIPTIONS = {
    // Langhe Nascetta DOC (casa-e-di-mirafiore-langhe-nascetta-doc)
    "casa-e-di-mirafiore-langhe-nascetta-doc": {
        "8": "La sapidità e la freschezza della Nascetta puliscono il palato dalla succulenza della carne cruda, mentre le note di erbe aromatiche richiamano i condimenti del sushi valdostano.", // Sushi valdôtèn
        "12": "Il profilo semi-aromatico della Nascetta accompagna perfettamente la complessità vegetale e la nota lattica del formaggio di capra.", // Insalata Sur la place
        "9": "La struttura del vino sostiene la ricchezza del Tris, con la sapidità che bilancia la tendenza dolce dei porcini e della verza.", // Tris del Piemonte
        "19": "L'acidità vibrante della Nascetta contrasta la grassezza della fonduta e pulisce il palato dopo ogni boccone di uovo.", // Uovo poché
        "36": "Freschezza e sapidità sono ideali per sgrassare il palato dalla frittura della cotoletta, esaltandone la croccantezza.", // Cotoletta alla valdostana
        "37": "Le note di frutta bianca e la chiusura sapida si legano armoniosamente alla delicatezza della carne di coniglio e agli aromi liguri." // Coniglio alla ligure
    },
    // Dolcetto d’Alba DOC (casa-e-di-mirafiore-dolcetto-dalba-doc)
    "casa-e-di-mirafiore-dolcetto-dalba-doc": {
        "1": "Il tannino morbido e il frutto vinoso del Dolcetto si sposano alla perfezione con la rusticità dei salumi e la grassezza dei formaggi.", // Savoia (1) matches Salumi/Formaggi
        "2": "Il tannino morbido e il frutto vinoso del Dolcetto si sposano alla perfezione con la rusticità dei salumi e la grassezza dei formaggi.", // Savoia old ID? Keeping for safety
        "4": "Un rosso di corpo medio che accompagna la ricchezza della fonduta senza sovrastare la delicatezza dell'uovo.", // Uovo (4)
        "9": "Un rosso di corpo medio che non sovrasta le verdure ma accompagna con piacevolezza la componente terrosa dei funghi.", // Tris (9)
        "25": "La succulenza dell'anatra e la nota dolce del sidro trovano un piacevole contrasto nel frutto croccante del Dolcetto.", // Petto d'anatra (25)
        "26": "Le note di erbe e la beva agile del Dolcetto rispettano la carne bianca del coniglio, pulendo il palato dagli aromi liguri.", // Coniglio (26)
        "31": "Un abbinamento della tradizione: la freschezza del vino bilancia la dolcezza e la grassezza del cacao nel Bûnet.", // Bunet (31)
        "40": "La pulizia del Dolcetto e la sua beva agile bilanciano la dolcezza dei pansoti e la cremosità della salsa alle noci." // Pansoti (Keeping just in case)
    }
};

try {
    const db = JSON.parse(fs.readFileSync(DB_PATH, 'utf8'));
    let updatedCount = 0;

    db.wines.forEach(wine => {
        if (MISSING_DESCRIPTIONS[wine.id]) {
            // Debug: print all dish IDs for this wine to see what we have
            if (wine.id === "casa-e-di-mirafiore-dolcetto-dalba-doc" && wine.ianuaPairings) {
                console.log("Dolcetto Dish IDs:", wine.ianuaPairings.map(p => p.dishId));
            }

            if (wine.ianuaPairings) {
                wine.ianuaPairings.forEach(pair => {
                    if (MISSING_DESCRIPTIONS[wine.id][pair.dishId]) {
                        // Inject the description if missing or basic
                        if (!pair.description || pair.description.length < 50) { // arbitrary length check for "short tag" vs "description"
                            pair.description = MISSING_DESCRIPTIONS[wine.id][pair.dishId];
                            updatedCount++;
                            console.log(`Updated ${wine.name} -> Dish ${pair.dishId}`);
                        }
                    }
                });
            }
        }
    });

    if (updatedCount > 0) {
        fs.writeFileSync(DB_PATH, JSON.stringify(db, null, 2), 'utf8');
        console.log(`Successfully updated ${updatedCount} pairings in ${DB_PATH}`);
    } else {
        console.log("No pairings needed updating (descriptions might already exist).");
    }

} catch (error) {
    console.error("Error updating database:", error);
}
