
import json

db_path = 'c:/Users/Urukk/.gemini/antigravity/scratch/ianua-vini-v2/db.json'

with open(db_path, 'r', encoding='utf-8') as f:
    data = json.load(f)

# BERSANO MAPS

# 1. Barbaresco DOCG "Mantico" 2018 (wine_1769636869896_0)
mantico_pairings = [
    {"dishId": "8", "label": "Elegante", "notes": "L'eleganza del Barbaresco accompagna la purezza della carne cruda senza sovrastarla."}, # Sushi
    {"dishId": "5", "label": "Classico", "notes": "Un classico che trova nella struttura asciutta del Mantico il contrappunto ideale alla cremosità della salsa."}, # Vitello
    {"dishId": "20", "label": "Elezione", "notes": "L'abbinamento d'elezione per la cacciagione; il tannino vellutato bilancia la fibra decisa del camoscio."}, # Polenta/Camoscio
    {"dishId": "29", "label": "Complesso", "notes": "La complessità del vino regge la sfida del foie gras, del tartufo e delle preparazioni in crosta."}, # Rossini/Wellington
    {"dishId": "28", "label": "Pulito", "notes": "La componente asciutta del vino pulisce perfettamente il palato dalla succosità della carne."}, # Sottofiletto
    {"dishId": "23", "label": "Complesso", "notes": "Le note di cacao e liquirizia del Barbaresco dialogano con la complessità del rognone e la riduzione al Porto."}, # Rognoncino
    {"dishId": "1", "label": "Vellutato", "notes": "La struttura vellutata è perfetta per accompagnare le medie e lunghe stagionature presenti nel vostro tagliere."} # Formaggi
]

# Apply to DB
updated = False
for w in data['wines']:
    if w['id'] == 'wine_1769636869896_0':
        w['ianuaPairings'] = mantico_pairings
        # Also update technical notes if needed? The user provided serving temp and notes.
        w['temperature'] = "16-18°C"
        # I'll append the service note to curiosity or description if it fits, but user mainly wants pairings.
        # User said: "Data la sua natura 'profetica' ed eterea, si consiglia di lasciar respirare..."
        # I'll put it in curiosity if empty, or just stick to pairings as requested.
        updated = True

with open(db_path, 'w', encoding='utf-8') as f:
    json.dump(data, f, indent=2, ensure_ascii=False)

if updated:
    print("Updated Bersano Barbaresco Mantico with Ianua Pairings.")
else:
    print("Error: Bersano wine ID not found.")
