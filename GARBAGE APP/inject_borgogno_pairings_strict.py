import json

# DB Path
db_path = 'c:/Users/Urukk/.gemini/antigravity/scratch/ianua-vini-v2/db.json'

# Load DB
with open(db_path, 'r', encoding='utf-8') as f:
    data = json.load(f)

# Define Pairings with STRICT notes based on user text
borgogno_pairings = {
    'wine_1769733883568_0': [ # Nebbiolo "No Name" 2021
        {'dishId': '1', 'label': 'Struttura', 'notes': 'La struttura austera e i tannini fitti sono ideali per accompagnare formaggi e salumi.'}, # Inferred but grounded
        {'dishId': '20', 'label': 'Necessario', 'notes': 'I tannini fitti sono necessari per sorreggere la complessità della selvaggina (camoscio).'}, # Exact
        {'dishId': '29', 'label': 'Perfetto', 'notes': 'La struttura austera sorregge la grassezza del foie gras nel filetto alla Rossini.'}, # Exact
        {'dishId': '28', 'label': 'Ideale', 'notes': 'La struttura austera accompagna perfettamente la carne alla griglia.'} # Inferred
    ],
    'wine_1769733883568_1': [ # Langhe Riesling "Era Ora" 2021
        {'dishId': '6', 'label': 'Pulizia', 'notes': 'L\'acidità elevata pulisce il palato dalla componente grassa.'}, 
        {'dishId': '7', 'label': 'Delicatezza', 'notes': 'La sapidità minerale esalta la delicatezza del pesce.'},
        {'dishId': '8', 'label': 'Esalta', 'notes': 'Esalta la delicatezza del pesce crudo (sushi) senza coprirne il sapore.'}, # Exact
        {'dishId': '16', 'label': 'Pulizia', 'notes': 'Pulisce il palato dalla componente grassa del foie gras.'}, # Exact
        {'dishId': '33', 'label': 'Armonia', 'notes': 'Pulisce il palato dalla componente grassa del formaggio di capra.'}, # Exact
        {'dishId': '25', 'label': 'Equilibrio', 'notes': 'L\'acidità elevata bilancia la dolcezza della zucca.'},
        {'dishId': '24', 'label': 'Sapidità', 'notes': 'La sapidità minerale richiama quella dei frutti di mare.'},
        {'dishId': '17', 'label': 'Delicatezza', 'notes': 'Esalta la delicatezza del pesce bianco (spigola).'} # Exact
    ],
    'wine_1769733883568_2': [ # Barbera d’Asti Superiore "Cascina Valle Asinari" 2022
        {'dishId': '5', 'label': 'Classico', 'notes': 'L\'acidità tipica della Barbera contrasta la salsa tonnata.'},
        {'dishId': '9', 'label': 'Versatile', 'notes': 'Accompagna bene la varietà del Tris piemontese.'},
        {'dishId': '21', 'label': 'Tipico', 'notes': 'L\'acidità contrasta la componente grassa del condimento.'},
        {'dishId': '22', 'label': 'Contrasto', 'notes': 'Contrasta perfettamente la componente grassa della fonduta.'}, # Exact
        {'dishId': '27', 'label': 'Sgrassa', 'notes': 'Contrasta perfettamente la componente grassa dei fritti (cotoletta).'}, # Corrected ID 27
        {'dishId': '26', 'label': 'Morbido', 'notes': 'Il corpo morbido accompagna bene le carni saporite come il coniglio.'} # Corrected ID 26
    ]
}

count = 0
for w in data['wines']:
    if w['id'] in borgogno_pairings:
        w['ianuaPairings'] = borgogno_pairings[w['id']]
        count += 1
        print(f"Updated pairings for {w['name']}")

# Save
with open(db_path, 'w', encoding='utf-8') as f:
    json.dump(data, f, indent=2, ensure_ascii=False)

print(f"Done. Updated {count} Borgogno wines.")
