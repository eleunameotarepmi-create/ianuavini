
import json

db_path = 'c:/Users/Urukk/.gemini/antigravity/scratch/ianua-vini-v2/db.json'

with open(db_path, 'r', encoding='utf-8') as f:
    data = json.load(f)

# ANDREA OBERTO MAPS

# 1. Langhe Nebbiolo DOC 2022 (wine_1769631559580_0)
nebbiolo_pairings = [
    {"dishId": "8", "label": "Ottimo", "notes": "Il Nebbiolo giovane pulisce bene la bocca dalla texture della carne cruda e dei suoi condimenti."}, # Sushi
    {"dishId": "5", "label": "Equilibrato", "notes": "L'acidità del vino bilancia la ricchezza della salsa tonnata."}, # Vitello
    {"dishId": "3", "label": "Territoriale", "notes": "La spalla acida del Nebbiolo sposa il lardo, le castagne e la mocetta."}, # Entrée
    {"dishId": "9", "label": "Classico", "notes": "Un abbinamento classico territoriale per piatti di media struttura."}, # Tris
    {"dishId": "16", "label": "Ideale", "notes": "Il sugo rosso e il grasso della pancetta richiedono un rosso fresco e non troppo tannico come questo."} # Bucatini
]

# 2. Barolo DOCG del Comune di La Morra 2019 (wine_1769631559580_1)
barolo_pairings = [
    {"dishId": "20", "label": "TOP", "notes": "La potenza e la persistenza del Barolo sono necessarie per reggere il sapore intenso della selvaggina."}, # Polente Camoscio
    {"dishId": "29", "label": "Complesso", "notes": "La complessità del vino (note di cacao, liquirizia e rosa) dialoga con il foie gras e la crosta della Wellington."}, # Rossini/Wellington
    {"dishId": "27", "label": "Perfetto", "notes": "La doppia panatura di grissini e la ricchezza del formaggio richiedono la pulizia tannica del Barolo."}, # Cotoletta
    {"dishId": "23", "label": "Evoluto", "notes": "I sentori evoluti del vino (cuoio, grafite) si sposano con la nota ferrosa e la riduzione al Porto."}, # Rognoncino
    {"dishId": "1", "label": "Ideale", "notes": "Ideale per i formaggi valdostani più stagionati presenti nel vostro tagliere."} # Formaggi
]

# Apply to DB
updated_count = 0
for w in data['wines']:
    if w['id'] == 'wine_1769631559580_0':
        w['ianuaPairings'] = nebbiolo_pairings
        updated_count += 1
    elif w['id'] == 'wine_1769631559580_1':
        w['ianuaPairings'] = barolo_pairings
        updated_count += 1

with open(db_path, 'w', encoding='utf-8') as f:
    json.dump(data, f, indent=2, ensure_ascii=False)

print(f"Updated {updated_count} Andrea Oberto wines with Ianua Pairings.")
