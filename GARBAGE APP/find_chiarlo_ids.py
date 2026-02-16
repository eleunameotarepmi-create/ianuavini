import json
import re

# Load DB
with open('c:/Users/Urukk/.gemini/antigravity/scratch/ianua-vini-v2/db.json', 'r', encoding='utf-8') as f:
    db = json.load(f)

# Helper to normalize strings for search
def normalize(text):
    return re.sub(r'[^a-zA-Z0-9]', '', text.lower())

# Target Wines
target_wines = ['No Name', 'Era Ora', 'Cascina Valle Asinari'] # "Valle Asinari" key part
found_wines = []

print("--- WINES ---")
for w in db['wines']:
    w_name_norm = normalize(w['name'])
    for t in target_wines:
        t_norm = normalize(t)
        if t_norm in w_name_norm:
            print(f"FOUND WINE: {w['name']} (ID: {w['id']})")
            found_wines.append({'id': w['id'], 'name': w['name'], 'target': t})

# Target Dishes
target_dishes = [
    'Selezione di formaggi', 'salumi', # Combined in user text, probably "Tagliere"
    'Polente', 'Camoscio',
    'Filetto', 'Garronese', 'Rossini', 'Wellington',
    'Sottofiletto', 'Griglia',
    'Prosciutto di tonno', 'Stracciatella',
    'Zuppetta', 'Pesce',
    'Sushi', 'Vald', # Valdostana/Valdoten
    'Scaloppa', 'Foie', 'Nocciola',
    'Chèvre',
    'Risotto', 'Amaretto', 'Zucca',
    'Spaghetti', 'Scoglio',
    'Spigola', 'Acqua pazza', 'Ratatouille',
    'Vitello tonnato',
    'Tris', 'Vol au vent', 'Porcini', 'Sformato', 'Verza', 'Insalata russa', # Tris components
    'Bucatini', 'Amatriciana',
    'Fonduta',
    'Cotoletta', 'Grissini',
    'Coniglio', 'Ligure'
]
# Clean logic: I'll dump ALL menu items with IDs to manually pick, 
# but specifically highlighting matches.
print("\n--- DISH CANDIDATES ---")
for m in db['menu']:
    print(f"{m['id']}: {m['name']} ({m['category']})")

print("\n--- SPECIFICS ---")
# Let's try to map strictly what we need to automate the next step
# No Name
# - Selezione formaggi e salumi -> Likely "Tagliere" (ID 1?)
# - Polente con camoscio -> "Polenta e Camoscio" (ID 20?)
# - Filetto Rossini/Wellington -> ID 29?
# - Sottofiletto griglia -> ID 28?

# Era Ora
# - Prosciutto tonno stracciatella -> ?
# - Zuppetta pesce -> ?
# - Sushi valdoten -> ID 8?
# - Scaloppa foie gras -> ID ?
# - Chevre chaud -> ?
# - Risotto amaretto zucca -> ?
# - Spaghetti scoglio -> ?
# - Spigola -> ?

# Barbera
# - Vitello tonnato -> ID 5?
# - Tris -> ID ?
# - Bucatini -> ?
# - Fonduta -> ?
# - Cotoletta -> ?
# - Coniglio -> ?
