import json

# DB Path
db_path = 'c:/Users/Urukk/.gemini/antigravity/scratch/ianua-vini-v2/db.json'

# Load DB
with open(db_path, 'r', encoding='utf-8') as f:
    data = json.load(f)

# Define Pairings
borgogno_pairings = {
    'wine_1769733883568_0': [ # Nebbiolo "No Name" 2021
        {'dishId': '1', 'label': 'Struttura', 'notes': 'La struttura austera e i tannini fitti del Nebbiolo sono necessari per sorreggere la complessità dei salumi e formaggi.'},
        {'dishId': '20', 'label': 'Necessario', 'notes': 'I tannini fitti del Nebbiolo sono necessari per sorreggere la complessità della selvaggina (camoscio).'},
        {'dishId': '29', 'label': 'Perfetto', 'notes': 'La struttura austera sorregge la grassezza del foie gras nel filetto alla Rossini.'},
        {'dishId': '28', 'label': 'Ideale', 'notes': 'Accompagna perfettamente la carni rosse alla griglia grazie alla sua struttura.'}
    ],
    'wine_1769733883568_1': [ # Langhe Riesling "Era Ora" 2021
        {'dishId': '6', 'label': 'Pulizia', 'notes': 'L\'acidità elevata pulisce il palato dalla componente grassa del pesce conservato e della stracciatella.'},
        {'dishId': '7', 'label': 'Minerale', 'notes': 'La sapidità minerale esalta la delicatezza del pesce e dei crostacei della zuppetta.'},
        {'dishId': '8', 'label': 'Esalta', 'notes': 'Esalta la delicatezza del pesce crudo (sushi) senza coprirne il sapore.'},
        {'dishId': '16', 'label': 'Contrasto', 'notes': 'L\'acidità tagliente bilancia perfettamente la grassezza estrema del foie gras.'},
        {'dishId': '33', 'label': 'Armonia', 'notes': 'Pulisce il palato dalla componente grassa del formaggio di capra.'},
        {'dishId': '25', 'label': 'Equilibrio', 'notes': 'La freschezza del Riesling equilibra la dolcezza della zucca e del biscotto amaretto.'},
        {'dishId': '24', 'label': 'Sapidità', 'notes': 'La mineralità del vino richiama e sostiene la sapidità dei frutti di mare.'},
        {'dishId': '17', 'label': 'Delicatezza', 'notes': 'Rispetta ed esalta la delicatezza della spigola.'}
    ],
    'wine_1769733883568_2': [ # Barbera d’Asti Superiore "Cascina Valle Asinari" 2022
        {'dishId': '5', 'label': 'Classico', 'notes': 'L\'acidità tipica della Barbera "sgrassa" la maionese del vitello tonnato.'},
        {'dishId': '9', 'label': 'Versatile', 'notes': 'Il corpo morbido e l\'acidità vivace accompagnano bene la varietà del Tris piemontese.'},
        {'dishId': '21', 'label': 'Tipico', 'notes': 'Acidità e frutto perfetto per il sugo ricco e saporito dell\'amatriciana.'},
        {'dishId': '22', 'label': 'Contrasto', 'notes': 'L\'acidità della Barbera contrasta perfettamente la componente grassa della fonduta.'},
        {'dishId': '26', 'label': 'Sgrassa', 'notes': 'Pulisce perfettamente il palato dalla panatura fritta della cotoletta.'},
        {'dishId': '30', 'label': 'Morbido', 'notes': 'Il corpo morbido accompagna bene le carni saporite ma delicate come il coniglio.'}
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
