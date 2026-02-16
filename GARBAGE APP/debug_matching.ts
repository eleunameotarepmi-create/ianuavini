
import * as fs from 'fs';

const rawText = `BONIN DINO (Arnad)
Arnad Montjovet (Rosso) | 2023 - € 22

CANTINA PELLISSIER (Saint-Pierre)
Syrah (Rosso) | 2023 - € 46

Torrette Supérieur (Rosso) | 2022 - € 46

CAVE DES DONNAS (Donnas)
Donnas (Rosso) | 2019 / 2020 - € 36

Donnas Barmet (Rosso) | 2023 - € 23

Donnas Vieilles Vignes (Rosso) | 2017 - € 46

Nebbiolo Donnas (Rosso) | Piccolina 0.375 L - € 20

CAVE GARGANTUA (Gressan)
Gewurtztraminer Vin de la fée (Bianco) | 2023 - € 34

Impasse (Rosso) | 2021 - € 62

Pinot Noir Pierre (Rosso) | 2022 - € 76

CAVE MONT BLANC (Morgex)
Blanc de Morgex et de La Salle (Bianco) | 2023 - € 30

Blanc de Morgex et de La Salle (Bianco) | Piccolina 0.375 L - € 15

CAVE ONZE COMMUNES (Aymavilles)
Muller Thurgau (Bianco) | Piccolina 0.375 L - € 16

Torrette (Rosso) | Piccolina 0.375 L - € 10

Mayolet (Rosso) | 2023 - € 24

Muscat Petit Grain Flétry (Dolce) | 0.375 L - € 30

CHÂTEAU FEUILLET (Saint-Pierre)
Petite Arvine (Bianco) | 2024 - € 36

Rosé Petit Rouge (Rosato) | 2023 - € 30

Torrette (Rosso) | 2023 - € 32

Torrette (Rosso) | Piccolina 0.375 L - € 19

CHEMIN (Aosta)
Nevecrino (Bollicine - Metodo Classico Extra Brut) - € 75

COENFER (Arvier)
Triskell (Bollicine - Metodo Classico Rosato) - € 42

Petit Rouge Enfer d'Arvier (Rosso) | 2020 - € 45

CROTTA DE LA MEURDZIE / VEVEY MARZIANO (Morgex)
Vevey (Bollicine - Metodo Classico Brut) - € 46

Blanc de Morgex et de La Salle (Bianco) | 2023 - € 30

CROTTA DI PRADO (Jovençan)
Gamay (Rosso) | 2024 - € 29

Torrette (Rosso) | 2023 - € 26

CUNÉAZ NADIR (Gressan)
Fumin L'Entso (Rosso) | 2024 - € 30

Pinot Noir Grandgosier (Rosso) | 2023 - € 32

Moscato Passito Gargamelle (Dolce) | 0.5 L - € 40

DANILO THOMAIN (Arvier)
Enfer d'Arvier (Rosso) | 2023 - € 42

Enfer d'Arvier Maurice (Rosso) - € 48

DI BARRÒ (Saint-Pierre)
Chardonnay (Bianco) | 2024 - € 27

Fumin (Rosso) | 2023 - € 34

Torrette Supérieur (Rosso) | 2023 - € 34

Fumin (Rosso) | Magnum 1.5 L (2016) - € 80

DI FRANCESCO GASPERI (Saint-Pierre)
Petite Arvine (Bianco) | 2023 - € 45

Fumin (Rosso) | 2020 - € 57

Torrette Planchette (Rosso) | 2022 - € 43

DIEGO CURTAZ (Gressan)
Daphne (Bianco) | 2021 - € 55

Chardonnay Di noutro (Bianco) | 2024 - € 30

Pinot Gris (Bianco) | 2021 - € 38

Syrah (Rosso) | 2023 - € 29

EDOARDO BRAGA (Jovençan)
Scaccomatto (Rosso) - € 73

Gamay (Rosso) | 2023 - € 32

FEUDO DI SAN MAURIZIO (Sarre)
Gewurztraminer Grapillon (Bianco) | 2024 - € 27

Juillermin (Rosso) | 2022 - € 44

Torrette (Rosso) | 2023 - € 44

Saro Djablo (Rosso) - € 29

GIULIO MORLONDO (Quart)
Vino rosso Baltéo (Rosso) - € 53

Vino rosso Lo Rej (Rosso) - € 67

GROSJEAN VINS (Quart)
Forcé 1968 (Bollicine - Spumante Extra Dry) - € 30

Chardonnay (Bianco) | 2023 - € 30

Pinot Gris (Bianco) | 2023 - € 39

Pinot Noir (Rosso) | 2023 - € 34

Gamay (Rosso) | 2024 - € 26

LA CROTTA DE VEGNERON (Chambave)
Chambave Muscat (Bianco) | 2023 - € 32

Chambave Muscat (Bianco) | Piccolina 0.375 L - € 20

Syrah Crème (Rosso) | 2020 - € 36

Fumin Esprit Follet (Rosso) | 2021 - € 44

Fumin (Rosso) | Piccolina 0.375 L - € 26

LA KIUVA (Arnad)
Seigneurs de la Vallaise (Bollicine - Metodo Classico Brut) - € 29

Merlot (Rosso) | 2019 - € 22

LA SOURCE (Saint-Pierre)
Torrette Supérieur (Rosso) | 2020 - € 29

Cornalin (Rosso) | 2019 - € 26

LES CRÊTES (Aymavilles)
Cuvée Bois Chardonnay (Bianco) | 2020 / 2022 - € 70

Cuvée Bois Chardonnay (Bianco) | 2016 - € 80

La Sabla (Rosso) - € 26

Syrah (Rosso) | 2021 - € 41

LES GRANGES (Nus)
Nus Malvoisie (Bianco) | 2022 - € 28

Nus (Rosso) | 2022 - € 28

Cornalin Survivant (Rosso) | 2020 - € 55

Fumin (Rosso) | 2022 - € 37

Nus Malvoisie Flétri (Dolce) | 0.375 L - € 43

LES PETITS RIENS (Aosta)
Si (Rosso) | 2021 - [ND] (Prezzo non disponibile in carta)

Entre Terre et Ciel (Rosso) | 2018 - € 470 (Verificare se errore di stampa sulla carta, cifra estratta)

LO TRIOLET (Introd)
Pinot Gris (Bianco) | 2023 - € 35

Fumin (Rosso) | 2020 - € 49

Coteau Barrage (Rosso) | 2022 - € 49

Heritage (Rosso) | 2022 - € 95

MAISON ANSELMET (Villeneuve)
Petite Arvine (Bianco) | 2024 - € 30

Riesling Nix nivis (Bianco) | 2022 - € 44

Les deux petits coeurs (Rosato) | 2023 - € 43

Le Prisonnier (Rosso) | 2022 / 2023 - € 160

Syrah Henry (Rosso) | 2023 - € 70

Pinot Noir Semel Pater (Rosso) | 2023 - € 110

MAISON MAURICE CRETAZ (Sarre)
Nebbiolo Bos (Rosso) | 2018 - € 56

MAISON VAGNEUR (Saint-Nicolas)
Muscat Petit Grain (Bianco) | 2022 - € 37

Syrah (Rosso) | 2022 - € 37

NOUSSAN FRANCO (Saint-Christophe)
Pinot Gris (Bianco) | 2021 - € 38

Fumin (Rosso) | 2023 - € 43

Torrette Supérieur (Rosso) | 2021 - € 33

PIANTAGROSSA (Donnas)
Erbaluce Biancone (Bianco) | 2022 - € 44

Nebbiolo 396 Aesculus (Rosso) | 2022 - € 30

Nebbiolo Dessus (Rosso) | 2021 - € 50

PRIOD FABRIZIO (Issogne)
Bocoueil Rouge (Rosso) - € 50

Tonen Rouge (Rosso) | 2015 / 2016 - € 66

Tonen Rouge (Rosso) | 2018 - € 62

Merlot Rouge Tonen (Rosso) | Magnum 1.5 L (2016/17/18) - € 130

QUINSON (Ayas)
Beato Emerico (Rosato) | 2023 - € 29

Torrette Soldat (Rosso) | 2022 - € 29

ROSSET TERROIR (Quart)
Petite Arvine (Bianco) | 2022 - € 37`;

const lines = rawText.split('\n');
const mappedWines: any[] = [];
let currentWinery = "";


function normalize(s: string) {
    return s.toLowerCase()
        .normalize("NFD").replace(/[\u0300-\u036f]/g, "") // Remove accents
        .replace(/[’'’´`]/g, "'")
        .replace(/[^a-z0-9]/g, '');
}

function hasSize(s: string) {
    return s.includes('375') || s.includes('0.375') || s.includes('0.5') || s.toLowerCase().includes('piccolina') || s.toLowerCase().includes('magnum') || s.includes('1.5');
}

lines.forEach(line => {
    const l = line.trim();
    if (!l) return;

    if (l.includes('(') && !l.includes('- €') && !l.includes('Bianco') && !l.includes('Rosso') && !l.includes('Rosato') && !l.includes('Bollicine')) {
        currentWinery = l.split('(')[0].trim().toLowerCase();
        return;
    }

    const priceMatch = l.match(/- €\s*(\d+)/);
    if (priceMatch || l.includes('€') || l.includes('[ND]')) {
        const price = priceMatch ? priceMatch[1] : (l.includes('[ND]') ? "ND" : "0");

        let type = 'red';
        if (l.includes('(Bianco)')) type = 'white';
        if (l.includes('(Rosato)')) type = 'rose';
        if (l.includes('(Bollicine') || l.includes('Bollicine')) type = 'sparkling';
        if (l.includes('(Dolce)')) type = 'dessert';

        let name = l.split('(')[0].split('|')[0].trim();

        // Check for special sizes in the middle part
        if (l.includes('|')) {
            const middle = l.split('|')[1].split('- €')[0].toLowerCase();
            if (hasSize(middle)) {
                // If special size found, append to name for better matching
                if (middle.includes('0.375') || middle.includes('375') || middle.includes('piccolina')) name += " 375";
                if (middle.includes('0.5')) name += " 500";
                if (middle.includes('1.5') || middle.includes('magnum')) name += " Magnum";
            }
        }

        mappedWines.push({
            name,
            wineryHint: currentWinery,
            type,
            price: price === "ND" ? "ND" : `${price}€`
        });
    }
});

const liveData = JSON.parse(fs.readFileSync('live_data_backup.json', 'utf-8'));
const dbWines = liveData.wines || [];
const dbWineries = liveData.wineries || [];

const updateEntries: any[] = [];
let matchCount = 0;

mappedWines.forEach(mw => {
    let logOutput = "";
    const normInputName = normalize(mw.name);
    const normWineryHint = normalize(mw.wineryHint);
    const isSmall = hasSize(mw.name);


    // Helper to check if winery matches (handles "Bonin Dino" vs "Dino Bonin" and "Cantina X" vs "X")
    const wineryMatches = (dbWineryName: string) => {
        const normDb = normalize(dbWineryName);
        if (!normWineryHint || normDb.includes(normWineryHint) || normWineryHint.includes(normDb)) return true;

        // Check parts with stopwords removed
        const stopwords = ['cantina', 'azienda', 'agricola', 'cave', 'caves', 'societa', 'cooperativa', 'vini', 'viticulteurs', 'encaveurs', 'domaine', 'maison', 'ferme', 'di', 'de', 'des', 'du', 'la', 'le', 'les', 'valle', 'vallee', 'calle'];
        const rawHint = mw.wineryHint.toLowerCase().replace(/[^a-z0-9\s]/g, '');
        const parts = rawHint.split(/\s+/).filter(p => p.length > 2 && !stopwords.includes(p));

        if (parts.length >= 1) {
            // Check if all significant parts of the hint are present in the DB name
            const allPartsPresent = parts.every(p => normDb.includes(p));
            if (allPartsPresent) return true;
        }
        return false;
    };

    // Helper for fuzzy wine name matching
    const wineMatches = (dbWineName: string) => {
        const normDb = normalize(dbWineName);
        // Direct containment
        if (normDb.includes(normInputName) || normInputName.includes(normDb)) return true;

        // Token intersection check
        const inputTokens = mw.name.toLowerCase().replace(/[^a-z0-9\s]/g, '').split(/\s+/).filter(t => t.length > 2);
        const dbTokens = dbWineName.toLowerCase().replace(/[^a-z0-9\s]/g, '').split(/\s+/).filter(t => t.length > 2);

        const intersection = inputTokens.filter(t => dbTokens.some(dt => dt.includes(t) || t.includes(dt)));
        // If we match a significant portion of the input tokens (e.g. "Arnad" and "Monjovet")
        return intersection.length >= Math.min(inputTokens.length, 2);
    };

    // Find ALL matches
    const candidates = dbWines.filter(dw => {
        const winery = dbWineries.find(w => w.id === dw.wineryId);
        const dbWineryName = winery?.name || '';
        const dbWineName = dw.name;

        return wineMatches(dbWineName) && wineryMatches(dbWineryName);
    });

    let match = null;

    if (candidates.length === 1) {
        match = candidates[0];
    } else if (candidates.length > 1) {
        // Disambiguate by size
        const sizeMatches = candidates.filter(c => hasSize(c.name) === isSmall);
        if (sizeMatches.length === 1) {
            match = sizeMatches[0];
        } else if (sizeMatches.length > 1) {
            // If multiple matches even with size check, try to find exact name match?
            match = sizeMatches[0];
            console.log(`AMBIGUOUS: [${mw.name}] matches multiple: ${sizeMatches.map(m => m.name).join(', ')}. Picked: ${match.name}`);
        } else {
            // No matches with same size status? 
            match = candidates[0];
            logOutput += `[SIZE MISMATCH] Input: "${mw.name}" (Small=${isSmall}) matched [${match.name}]\n`;
        }
    }

    if (match) {
        logOutput += `[MATCH] Input: "${mw.name}" (${mw.wineryHint}) -> DB: "${match.name}" (ID: ${match.id})\n`;
        logOutput += `        Price Update: ${mw.price}\n`;
        updateEntries.push({
            ...match,
            // type: mw.type, // Don't override type blindly
            price: mw.price,
        });
        matchCount++;
    } else {
        logOutput += `[NO MATCH] Input: "${mw.name}" (${mw.wineryHint})\n`;
        logOutput += `           Candidates from winery:\n`;
        const wineryCandidates = dbWines.filter(dw => {
            const winery = dbWineries.find(w => w.id === dw.wineryId);
            const dbWineryName = winery?.name || '';
            return wineryMatches(dbWineryName);
        });

        if (wineryCandidates.length > 0) {
            wineryCandidates.forEach(c => {
                logOutput += `             - "${c.name}" (ID: ${c.id})\n`;
            });
        } else {
            logOutput += `             (No wines found for winery match of "${mw.wineryHint}")\n`;
            // Debug winery matching
            logOutput += `             Debug Winery Search for "${mw.wineryHint}":\n`;
            dbWineries.forEach(w => {
                if (w.name.toLowerCase().includes(mw.wineryHint.split(' ')[0]) || mw.wineryHint.toLowerCase().includes(w.name.split(' ')[0].toLowerCase())) {
                    logOutput += `               ? "${w.name}" (ID: ${w.id}) - Match? ${wineryMatches(w.name)}\n`;
                }
            });
        }
    }
    logOutput += "---------------------------------------------------\n";
    fs.appendFileSync('matching_report.txt', logOutput);
});

const output = {
    wines: updateEntries
};

fs.writeFileSync('UPDATED_PRICES_ONLY.json', JSON.stringify(output, null, 2));
fs.appendFileSync('matching_report.txt', `\nTotal Inputs: ${mappedWines.length}\nMatched: ${matchCount}\nUnmatched: ${mappedWines.length - matchCount}\n`, { flag: 'a' });
console.log("\n--- Debugging Winery Inventories ---");
// Wineries to inspect
const targetWineries = [
    "donnas", "gargantua", "vevey", "marziano", "meur", "cuneaz", "nadir",
    "gasperi", "curtaz", "feudo", "anselmet", "cretaz", "piantagrossa", "priod"
];

targetWineries.forEach(wTerm => {
    fs.appendFileSync('matching_report.txt', `\n>>> Searching Winery: ${wTerm}\n`);
    const wineries = dbWineries.filter(w => w.name.toLowerCase().includes(wTerm));

    wineries.forEach(winery => {
        fs.appendFileSync('matching_report.txt', `   Winery: "${winery.name}" (ID: ${winery.id})\n`);
        const wines = dbWines.filter(w => w.wineryId === winery.id);
        wines.forEach(w => {
            fs.appendFileSync('matching_report.txt', `      - "${w.name}" (ID: ${w.id})\n`);
        });
    });
});

console.log("Report generated in matching_report.txt");
