const fs = require('fs');
const path = require('path');

// Use live_db.json which contains the Valpellinentse
const dbPath = path.join(__dirname, 'live_db.json');
const data = JSON.parse(fs.readFileSync(dbPath, 'utf8'));

// Find Dish by exact string match from grep result
const dish = data.menu.find(m => m.name.includes("Valpellinentse"));
console.log("=== DISH ===");
console.log(dish);

// Find Wine
const wine = data.wines.find(w => w.name.toLowerCase().includes('flétri') && w.name.toLowerCase().includes('malvoisie'));
console.log("\n=== WINE ===");
console.log(wine);

// Test Logic exactly as in MenuView.tsx
if (dish && wine) {
    console.log("\n=== FRONTEND LOGIC SIMULATION ===");

    // SAFEGUARD: Sweet/Dessert wines ONLY for Dolci (UNLESS Foie Gras or Blue Cheese)
    const isDessertWine = (wine.type === 'dessert') ||
        wine.name.toLowerCase().includes('passito') ||
        wine.name.toLowerCase().includes('vendemmia tardiva') ||
        wine.name.toLowerCase().includes('flétri') ||
        wine.name.toLowerCase().includes('moscato');

    const isSavoryDish = ['Antipasti', 'Primi', 'Secondi'].includes(dish.category);

    // Exceptions for Sweet Wine + Savory
    const dishText = (dish.name + ' ' + (dish.description || '')).toLowerCase();
    const isException = dishText.includes('foie gras') ||
        dishText.includes('fegato') ||
        dishText.includes('erborinato') ||
        dishText.includes('gorgonzola') ||
        dishText.includes('bleu');

    console.log(`isDessertWine: ${isDessertWine}`);
    console.log(`isSavoryDish: ${isSavoryDish} (Category: '${dish.category}')`);
    console.log(`isException: ${isException} (Text: '${dishText}')`);

    if (isSavoryDish && isDessertWine && !isException) {
        console.log("RESULT: BLOCKED (Correct)");
    } else {
        console.log("RESULT: ALLOWED (Failure)");
        if (!isSavoryDish) console.log(" -> Reason: Dish is not considered Savory.");
        if (!isDessertWine) console.log(" -> Reason: Wine is not considered Dessert.");
        if (isException) console.log(" -> Reason: Dish is an exception.");
    }
} else {
    console.log("Could not find items in live_db.json");
}
