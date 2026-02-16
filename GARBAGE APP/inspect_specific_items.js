const fs = require('fs');
const path = require('path');

const dbPath = path.join(__dirname, 'db.json');
const data = JSON.parse(fs.readFileSync(dbPath, 'utf8'));

// Find Dish
const dish = data.menu.find(m => m.name.toLowerCase().includes('valpellinentse') || m.name.toLowerCase().includes('vapelenentse'));
console.log("=== DISH ===");
console.log(dish);

// Find Wine
const wine = data.wines.find(w => w.name.toLowerCase().includes('malvoisie') && (w.name.toLowerCase().includes('flétri') || w.name.toLowerCase().includes('fletri')));
console.log("\n=== WINE ===");
console.log(wine);

// Test Logic
if (dish && wine) {
    console.log("\n=== TEST LOGIC ===");
    const isDessertWine = wine.type === 'dessert' ||
        wine.name.toLowerCase().includes('passito') ||
        wine.name.toLowerCase().includes('vendemmia tardiva') ||
        wine.name.toLowerCase().includes('flétri') ||
        wine.name.toLowerCase().includes('moscato');

    console.log("Is Dessert Wine:", isDessertWine);

    const isSavoryDish = ['Antipasti', 'Primi', 'Secondi'].includes(dish.category);
    console.log("Is Savory Dish:", isSavoryDish, `(Category: ${dish.category})`);

    const dishText = (dish.name + ' ' + (dish.description || '')).toLowerCase();
    const isException = dishText.includes('foie gras') ||
        dishText.includes('fegato') ||
        dishText.includes('erborinato') ||
        dishText.includes('gorgonzola') ||
        dishText.includes('bleu');
    console.log("Is Exception:", isException);

    const shouldExclude = isSavoryDish && isDessertWine && !isException;
    console.log("SHOULD EXCLUDE:", shouldExclude);
}
