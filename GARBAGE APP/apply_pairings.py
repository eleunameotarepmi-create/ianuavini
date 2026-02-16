
import json
import sys

try:
    print("Loading db.json...")
    with open('db.json', 'r', encoding='utf-8') as f:
        data = json.load(f)
    print("db.json loaded.")

    # Check if Oberto wines exist
    oberto_nebbiolo_id = 'andrea_oberto_nebbiolo_2023'
    oberto_barolo_id = 'andrea_oberto_barolo_2019'
    
    wine_ids = {w['id'] for w in data.get('wines', [])}
    
    if oberto_nebbiolo_id not in wine_ids:
        print(f"WARNING: Wine {oberto_nebbiolo_id} NOT FOUND in db.json! Pairings might be broken.")
    else:
        print(f"Wine {oberto_nebbiolo_id} found.")
        
    if oberto_barolo_id not in wine_ids:
        print(f"WARNING: Wine {oberto_barolo_id} NOT FOUND in db.json! Pairings might be broken.")
    else:
        print(f"Wine {oberto_barolo_id} found.")

    # Define updates
    # Structure: menu_id -> pairing_object
    updates = {
        "8": { # Sushi valdôtèn
            "wineId": oberto_nebbiolo_id,
            "justification": "Il Nebbiolo giovane pulisce bene la bocca dalla texture della carne cruda e dei suoi condimenti.",
            "label": "Scelta della Casa",
            "score": 100,
            "technicalDetail": "Pulizia del palato e freschezza."
        },
        "5": { # Vitello tonnato
            "wineId": oberto_nebbiolo_id,
            "justification": "L'acidità del vino bilancia la ricchezza della salsa tonnata.",
            "label": "Scelta della Casa",
            "score": 100,
            "technicalDetail": "Bilanciamento grassi/acidità."
        },
        "3": { # Entrée valdostana
            "wineId": oberto_nebbiolo_id,
            "justification": "La spalla acida del Nebbiolo sposa il lardo, le castagne e la mocetta.",
            "label": "Scelta della Casa",
            "score": 100,
            "technicalDetail": "Abbinamento territoriale classico."
        },
        "9": { # Tris del Piemonte
            "wineId": oberto_nebbiolo_id,
            "justification": "Un abbinamento classico territoriale per piatti di media struttura.",
            "label": "Scelta della Casa",
            "score": 100,
            "technicalDetail": "Concordanza regionale."
        },
        "16": { # Bucatini
            "wineId": oberto_nebbiolo_id,
            "justification": "Il sugo rosso e il grasso della pancetta richiedono un rosso fresco e non troppo tannico come questo.",
            "label": "Scelta della Casa",
            "score": 100,
            "technicalDetail": "Sgrassante ma non invasivo."
        },
        "20": { # Le polente
            "wineId": oberto_barolo_id,
            "justification": "La potenza e la persistenza del Barolo sono necessarie per reggere il sapore intenso della selvaggina (camoscio).",
            "label": "Scelta della Casa",
            "score": 100,
            "technicalDetail": "Struttura e persistenza."
        },
        "29": { # Filetto Rossini/Wellington
            "wineId": oberto_barolo_id,
            "justification": "La complessità del vino (note di cacao, liquirizia e rosa) dialoga con il foie gras e la crosta della Wellington.",
            "label": "Scelta della Casa",
            "score": 100,
            "technicalDetail": "Complessità aromatica e corpo."
        },
        "27": { # Cotoletta valdostana
            "wineId": oberto_barolo_id,
            "justification": "La doppia panatura di grissini e la ricchezza del formaggio richiedono la pulizia tannica del Barolo.",
            "label": "Scelta della Casa",
            "score": 100,
            "technicalDetail": "Tannino sgrassante."
        },
        "23": { # Rognoncino
            "wineId": oberto_barolo_id,
            "justification": "I sentori evoluti del vino (cuoio, grafite) si sposano con la nota ferrosa e la riduzione al Porto.",
            "label": "Scelta della Casa",
            "score": 100,
            "technicalDetail": "Armonia di sapori intensi."
        },
        "1": { # Selezione formaggi
            "wineId": oberto_barolo_id,
            "justification": "Ideale per i formaggi valdostani più stagionati presenti nel vostro tagliere.",
            "label": "Scelta della Casa",
            "score": 100,
            "technicalDetail": "Abbinamento per stagionatura e struttura."
        }
    }

    # Apply updates
    count = 0
    if 'menu' in data:
        for item in data['menu']:
            if item['id'] in updates:
                new_pairing = updates[item['id']]
                
                # Retrieve existing pairings or create new list
                current_pairings = item.get('verifiedPairings')
                if current_pairings is None:
                    current_pairings = []
                
                # Prepend the new pairing (so it is default)
                # Check if it already exists to avoid duplicates?
                # We'll just filter out any existing pairing with same wineId to be clean
                current_pairings = [p for p in current_pairings if p.get('wineId') != new_pairing['wineId']]
                
                current_pairings.insert(0, new_pairing)
                
                item['verifiedPairings'] = current_pairings
                print(f"Updated menu item {item['id']} ({item.get('name')}) with wine {new_pairing['wineId']}")
                count += 1
    
    print(f"Total updated: {count}")
    
    if count > 0:
        with open('db.json', 'w', encoding='utf-8') as f:
            json.dump(data, f, indent=2, ensure_ascii=False)
        print("db.json saved successfully.")
    else:
        print("No updates made.")

except Exception as e:
    print(f"Error: {e}")
    sys.exit(1)
