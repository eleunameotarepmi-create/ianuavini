
import json

db_path = 'c:/Users/Urukk/.gemini/antigravity/scratch/ianua-vini-v2/db.json'

with open(db_path, 'r', encoding='utf-8') as f:
    data = json.load(f)

# Helper to find dish ID by name fragment
def find_dish(keyword):
    for m in data.get('menu', []):
        if keyword.lower() in m.get('name', '').lower():
            return m['id']
    return None

# Resolve Dynamic IDs
id_polenta = find_dish("polent") # Detect "Le polente" etc.
id_scaloppa = find_dish("scaloppa")
id_tris = find_dish("tris")
id_formaggi = find_dish("formaggi")
id_entree = find_dish("entrée") # Might be same as formaggi or diff
if not id_entree: id_entree = id_formaggi # Fallback

# BRANDINI PAIRINGS

# 1. Viognier "Rebelle" (wine_1769609456737_0)
rebelle_pairings = [
    {"dishId": "19", "label": "Perfetto", "notes": "La grassezza del vino sposa la fontina"}, # Fonduta
    {"dishId": "4", "label": "Perfetto", "notes": "Stesso principio, piatto ricco"}, # Uovo
    {"dishId": id_formaggi, "label": "Ideale", "notes": "con quelli più stagionati"},
    {"dishId": id_entree, "label": "Top", "notes": "lardo e mocetta vogliono un bianco con spalla"},
    {"dishId": id_scaloppa, "label": "Audace", "notes": "l'opulenza del Viognier regge il fegato grasso"},
    {"dishId": "24", "label": "Ottimo", "notes": "struttura del vino per pesce saporito"}, # Spigola
    {"dishId": "7", "label": "Ottimo", "notes": "stessa logica"}, # Zuppetta
    {"dishId": "26", "label": "Ottimo", "notes": "carni bianche saporite"}, # Coniglio
    {"dishId": "18", "label": "Territoriale", "notes": "erbe e prescinseua, abbinamento ligure-piemontese"} # Pansoti
]

# 2. Barolo "Annunziata" 2014 (wine_1769609456737_1)
annunziata_pairings = [
    {"dishId": "8", "label": "Elegante", "notes": "l'eleganza non copre albese, tartare e carne salada"}, # Sushi
    {"dishId": "5", "label": "Classico", "notes": "classico piemontese su classico piemontese"}, # Vitello
    {"dishId": "25", "label": "Setoso", "notes": "setosità con setosità"}, # Anatra
    {"dishId": "27", "label": "Territoriale", "notes": "carne e fontina, un Barolo di La Morra"}, # Cotoletta
    {"dishId": "28", "label": "Puro", "notes": "carne pura, senza sovrastrutture"}, # Sottofiletto
    # Rognoncino missing ID? Let's try find
    {"dishId": find_dish("rognoncino"), "label": "Dialogo", "notes": "il Porto nel piatto dialoga col Barolo"},
    {"dishId": id_tris, "label": "Territoriale", "notes": "vol-au-vent, sformato, insalata russa: territorio"}
]

# 3. Barolo "Resa 56" (wine_1769609456737_2)
resa_pairings = [
    {"dishId": id_polenta, "label": "TOP", "notes": "selvaggina e Barolo austero"},
    {"dishId": "29", "label": "Potente", "notes": "foie gras + tartufo esigono un Barolo potente"}, # Rossini
    {"dishId": "29", "label": "Struttura", "notes": "crosta, carne, funghi: serve struttura"}, # Wellington (Shared ID usually)
    {"dishId": "28", "label": "Importante", "notes": "la carne importante vuole il vino importante"}, # Sottofiletto
    {"dishId": id_scaloppa, "label": "Serio", "notes": "alternativa 'seria' al Viognier"},
    {"dishId": "22", "label": "Montagna", "notes": "patate, pancetta, Reblochon: piatto di montagna"} # Tartiflette
]

# Cleanup Nones
def clean_list(lst):
    return [p for p in lst if p['dishId'] is not None]

# Apply to DB
for w in data['wines']:
    if w['id'] == 'wine_1769609456737_0':
        w['ianuaPairings'] = clean_list(rebelle_pairings)
    elif w['id'] == 'wine_1769609456737_1':
        w['ianuaPairings'] = clean_list(annunziata_pairings)
    elif w['id'] == 'wine_1769609456737_2':
        w['ianuaPairings'] = clean_list(resa_pairings)

with open(db_path, 'w', encoding='utf-8') as f:
    json.dump(data, f, indent=2, ensure_ascii=False)

print("Updated Brandini with FULL pairings.")
