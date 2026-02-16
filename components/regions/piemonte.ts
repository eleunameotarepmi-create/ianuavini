
import { RegionConfig } from './types';

export const piemonte: RegionConfig = {
    id: 'piemonte',
    label: "Piemonte",
    description: "La Discesa - Mare di Colline",

    heroImage: "/assets/images/piemonte/Langhe.jpg",
    coverImage: "/assets/images/piemonte/piemonte-gateway.jpg",
    introTitle: "La Discesa",
    introContent: "Un mosaico di vigne pettinate dal vento, dove la terra racconta storie di nebbia e tartufi.",

    details: {
        territory: {
            title: "Territorio e Colline",
            points: [
                "Un paesaggio vitivinicolo unico, Patrimonio Mondiale dell'Umanità UNESCO",
                "Suoli eterogenei: dalle Marne di Sant'Agata alle Sabbie dell'Astiano",
                "Clima continentale con influenze alpine, ideale per vitigni a maturazione tardiva",
                "Colline pettinate e versanti scoscesi che esigono una viticoltura di precisione",
                "Biodiversità tutelata tra boschi, noccioleti e vigne storiche"
            ]
        },
        philosophy: {
            title: "Filosofie Produttive",
            points: [
                "Rispetto dei tempi della natura e lunghi affinamenti in botte",
                "Valorizzazione della singola vigna e dei prestigiosi 'MGA'",
                "Vinificazioni tradizionali che esaltano il legame indissolubile con il terroir",
                "Integrazione di tecniche moderne per la massima pulizia varietale",
                "Impegno costante verso una viticoltura sostenibile e consapevole"
            ]
        },
        varieties: {
            title: "Vitigni del Piemonte",
            groups: [
                {
                    label: "I Grandi Autoctoni",
                    items: ["Nebbiolo", "Barbera", "Dolcetto", "Arneis", "Cortese", "Pelaverga", "Nascetta", "Grignolino", "Ruché", "Freisa"]
                },
                {
                    label: "Tradizioni Locali",
                    items: ["Moscato Bianco", "Erbaluce", "Brachetto", "Timorasso", "Vespolina", "Croatina"]
                },
                {
                    label: "Interpretazioni d'Eccellenza",
                    items: ["Pinot Nero", "Chardonnay", "Riesling", "Sauvignon Blanc", "Merlot", "Cabernet Sauvignon"]
                }
            ]
        }
    },

    zones: [
        { id: 'canavese', label: 'Canavese', minAlt: 250, targetId: 'canavese', image: "/assets/images/piemonte/Canavese immagine.jpg" },
        { id: 'alto-piemonte', label: 'Alto Piemonte', minAlt: 300, targetId: 'alto-piemonte', image: "/assets/images/piemonte/alto piemonte vigne.jpg" },
        { id: 'roero', label: 'Roero', minAlt: 280, targetId: 'roero', image: "/assets/images/piemonte/Rocche_Roero_cover.jpg" },
        { id: 'langhe', label: 'Langhe', minAlt: 200, targetId: 'langhe', image: "/assets/images/piemonte/Langhe.jpg" },
        { id: 'monferrato', label: 'Monferrato', minAlt: 250, targetId: 'monferrato', image: "/assets/images/piemonte/Monferrato.jpg" },
        { id: 'tortonese', label: 'Colli Tortonesi', minAlt: 250, targetId: 'tortonese', image: "/assets/images/piemonte/Colli_Tortonesi.webp" }
    ],

    locationMap: {
        'alto-piemonte': ['gattinara', 'boca', 'lessona', 'ghemme', 'fara', 'biella', 'brusnengo'],
        'canavese': ['caluso', 'canavese', 'carema', 'ivrea', 'san giorgio'],
        'langhe': ['barolo', 'barbaresco', 'la morra', 'serralunga', 'monforte', 'neive', 'alba', 'dogliani', 'verduno', 'cherasco', 'castiglione falletto', 'fontanafredda'],
        'roero': ['canale', 'guarene', 'roero'],
        'monferrato': ['asti', 'nizza', 'acqui', 'calamandrana', 'vignale', 'castagnole'],
        'tortonese': ['tortona', 'colli tortonesi', 'castellania']
    },
    locationAltitudes: {
        'barolo': 301,
        'la morra': 513,
        'serralunga': 414,
        'castiglione falletto': 350,
        'monforte': 480,
        'verduno': 381,
        'novello': 471,
        'grinzane cavour': 195,
        'diano d\'alba': 496,
        'rodod': 285,
        'cherasco': 288,
        'barbaresco': 274,
        'neive': 308,
        'treiso': 410,
        'alba': 172,
        'canale': 193,
        'guarene': 360,
        'santo stefano belbo': 170,
        'dogliani': 295,
        'asti': 123,
        'nizza monferrato': 138,
        'acqui terme': 156,
        'ovada': 186,
        'gavi': 233,
        'tortona': 122,
        'gattinara': 263,
        'ghemme': 241,
        'boca': 389,
        'bramaterra': 300,
        'lessona': 360,
        'carema': 349,
        'caluso': 303,
        'ivrea': 253
    }
};
