
const fs = require('fs');
const path = require('path');

// Read db.json to get wineries
const dbPath = path.join(__dirname, 'db.json');
try {
    const db = JSON.parse(fs.readFileSync(dbPath, 'utf8'));
    const wineries = db.wineries || [];

    // Mock relevant parts of constants.tsx logic
    const REGIONS_MAP = {
        BASSA: ['ponte-saint-martin', 'donnas', 'perloz', 'bard', 'hône', 'arnad', 'issogne', 'champoluc', 'challand', 'montjovet', 'champdepraz', 'verrès', 'chambave', 'pontey', 'fenis', 'saint-vincent', 'chatillon'],
        NUS_QUART: ['nus', 'quart'],
        LA_PLAINE: ['saint-christophe', 'pollein', 'charvensod', 'gignod', 'aosta'],
        PLAINE_TO_VALDIGNE: ['sarre', 'saint-pierre', 'jovençan', 'villeneuve', 'aymavilles', 'introd', 'arvier', 'avise', 'saint-nicolas', 'gressan'],
        VALDIGNE: ['la salle', 'morgex', 'pré-saint-didier', 'courmayeur']
    };

    const PIEMONTE_MAP = {
        ALTO_PIEMONTE: ['gattinara', 'boca', 'lessona', 'ghemme', 'fara', 'biella', 'brusnengo'],
        CANAVESE: ['caluso', 'canavese', 'carema', 'ivrea', 'san giorgio'],
        LANGHE: ['barolo', 'barbaresco', 'la morra', 'serralunga', 'monforte', 'neive', 'alba', 'dogliani', 'verduno', 'cherasco', 'castiglione falletto'],
        ROERO: ['canale', 'guarene', 'roero'],
        MONFERRATO: ['asti', 'nizza', 'acqui', 'calamandrana', 'vignale', 'castagnole'],
        TORTONESE: ['tortona', 'colli tortonesi', 'castellania']
    };

    const LOCATION_ALTITUDES = {
        'donnas': 320,
        'pont-saint-martin': 300,
        'perloz': 310,
        'bard': 340,
        'hône': 345,
        'arnad': 350,
        'issogne': 390,
        'champoluc': 1500,
        'challand': 600,
        'montjovet': 450,
        'champdepraz': 400,
        'verrès': 390,
        'chambave': 500,
        'pontey': 500,
        'fenis': 540,
        'saint-vincent': 575,
        'chatillon': 550,
        'nus': 550,
        'quart': 600,
        'saint-christophe': 620,
        'pollein': 550,
        'charvensod': 750,
        'gignod': 900,
        'aosta': 580,
        'sarre': 630,
        'saint-pierre': 730,
        'jovençan': 630,
        'villeneuve': 670,
        'aymavilles': 650,
        'introd': 880,
        'arvier': 750,
        'avise': 775,
        'saint-nicolas': 1200,
        'la salle': 1000,
        'morgex': 1100,
        'courmayeur': 1200,
        'pré-saint-didier': 1000
    };

    const getAltitude = (location) => {
        // Basic lookup or fallback
        const key = Object.keys(LOCATION_ALTITUDES).find(k => location.toLowerCase().includes(k.replace(/_/g, ' ')));
        if (key) return LOCATION_ALTITUDES[key];
        return 0;
    };

    const getWineryRegion = (winery) => {
        if (!winery) return 'unknown';
        const loc = (winery.location || "").toLowerCase();
        const region = (winery.region || "").toLowerCase();

        if (region.includes("alto piemonte")) return 'alto-piemonte';
        if (region.includes("canavese")) return 'canavese';
        if (region.includes("monferrato")) return 'monferrato';
        if (region.includes("tortonese") || region.includes("tortona")) return 'tortonese';
        if (region.includes("roero")) return 'roero';
        if (region.includes("langhe")) return 'langhe';

        if (PIEMONTE_MAP.ALTO_PIEMONTE.some(r => loc.includes(r))) return 'alto-piemonte';
        if (PIEMONTE_MAP.CANAVESE.some(r => loc.includes(r))) return 'canavese';
        if (PIEMONTE_MAP.LANGHE.some(r => loc.includes(r))) return 'langhe';
        if (PIEMONTE_MAP.ROERO.some(r => loc.includes(r))) return 'roero';
        if (PIEMONTE_MAP.MONFERRATO.some(r => loc.includes(r))) return 'monferrato';
        if (PIEMONTE_MAP.TORTONESE.some(r => loc.includes(r))) return 'tortonese';

        if (REGIONS_MAP.BASSA.some(r => loc.includes(r))) return 'bassa';
        if (REGIONS_MAP.NUS_QUART.some(r => loc.includes(r))) return 'nus-quart';
        if (REGIONS_MAP.LA_PLAINE.some(r => loc.includes(r))) return 'la-plaine';
        if (REGIONS_MAP.PLAINE_TO_VALDIGNE.some(r => loc.includes(r))) return 'plaine-to-valdigne';
        if (REGIONS_MAP.VALDIGNE.some(r => loc.includes(r))) return 'valdigne';

        return 'unknown';
    };

    const problematicWineries = wineries.map(w => {
        const calculatedRegion = getWineryRegion(w);
        const calculatedAltitude = getAltitude(w.location || "");

        return {
            name: w.name,
            location: w.location,
            manualRegion: w.region,
            calculatedRegion: calculatedRegion,
            calculatedAltitude: calculatedAltitude
        };
    }).filter(w => !['alto-piemonte', 'canavese', 'monferrato', 'tortonese', 'roero', 'langhe'].includes(w.calculatedRegion));

    let output = "=== WINERIES ANALYSIS ===\n";
    problematicWineries.forEach(w => {
        if (w.calculatedRegion === 'unknown' || w.calculatedAltitude === 0 || (w.manualRegion && w.manualRegion.toLowerCase() !== w.calculatedRegion)) {
            output += `\nName: ${w.name}\n`;
            output += `Location: ${w.location}\n`;
            output += `Manual Region (DB): ${w.manualRegion}\n`;
            output += `Calculated Region: ${w.calculatedRegion}\n`;
            output += `Calculated Altitude: ${w.calculatedAltitude}\n`;
        }
    });
    fs.writeFileSync('debug_output.txt', output);
    console.log("Output written to debug_output.txt");

} catch (err) {
    console.error("Error:", err);
}
