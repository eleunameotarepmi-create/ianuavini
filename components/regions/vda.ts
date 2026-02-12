
import { RegionConfig } from './types';
import { getBassaValleIntro } from '../../contentTranslations';

export const vda: RegionConfig = {
    id: 'vda',
    label: "Valle d'Aosta",
    description: "L'Ascesa - Viticoltura Eroica",

    heroImage: "/assets/vda-zones/vda-gateway.jpg",
    coverImage: "/assets/vda-zones/vda-gateway.jpg",
    introTitle: "",
    introContent: "",

    details: {
        territory: {
            title: "Territorio e Altitudine",
            points: [
                "Vigneti tra i 450 e i 1.200 m s.l.m., tra i più alti d'Europa",
                "Suoli morenici e sabbiosi, poveri di sostanza organica ma ricchi di minerali",
                "Terrazze a secco e pendenze estreme, dove ogni metro è frutto di lavoro manuale",
                "Esposizioni variabili: nord per finezza e freschezza, sud per calore e struttura",
                "Forti escursioni termiche, che esaltano profumi e acidità naturali"
            ]
        },
        philosophy: {
            title: "Filosofie Produttive",
            points: [
                "Vendemmie manuali e rese contenute",
                "Vinificazioni attente, spesso con fermentazioni spontanee",
                "Uso calibrato del legno (barrique, tonneaux o botti grandi, secondo tradizione)",
                "Sperimentazioni tecniche come criomacerazione e bâtonnage",
                "Sostenibilità diffusa: biologico, lotta integrata, energia rinnovabile"
            ]
        },
        varieties: {
            title: "Vitigni della Valle d'Aosta",
            groups: [
                {
                    label: "Autoctoni Principali",
                    items: ["Petit Rouge", "Fumin", "Cornalin", "Mayolet", "Prié Blanc", "Vien de Nus", "Vuillermin", "Premetta", "Neyret", "Moscato Bianco"]
                },
                {
                    label: "Tradizionali e Storici",
                    items: ["Nebbiolo (Picotendro)", "Barbera", "Gamay", "Freisa"]
                },
                {
                    label: "Internazionali Reinterpretati",
                    items: ["Pinot Noir", "Merlot", "Chardonnay", "Riesling", "Müller Thurgau", "Syrah", "Gewürztraminer", "Petite Arvine", "Pinot Gris"]
                }
            ]
        }
    },

    zones: [
        { id: 'bassa', label: 'Bassa Valle', minAlt: 300, targetId: 'bassa-valle', image: '/assets/vda-zones/strada-consolare-donnas.jpg' },
        { id: 'nus-quart', label: 'Nus-Quart', minAlt: 550, targetId: 'nus-quart', image: '/assets/vda-zones/nus-quart.jpg' },
        { id: 'la-plaine', label: 'La Plaine', minAlt: 600, targetId: 'la-plaine', image: '/assets/vda-zones/la-plaine.jpg' },
        { id: 'plaine-to-valdigne', label: 'Media Valle', minAlt: 700, targetId: 'plaine-to-valdigne', image: '/assets/vda-zones/media-valle.jpg' },
        { id: 'valdigne', label: 'Valdigne', minAlt: 1000, targetId: 'valdigne', image: '/assets/vda-zones/valdigne.jpg' },
    ],

    locationMap: {
        'bassa': ['ponte-saint-martin', 'donnas', 'perloz', 'bard', 'hône', 'arnad', 'issogne', 'champoluc', 'challand', 'montjovet', 'champdepraz', 'verrès', 'chambave', 'pontey', 'fenis', 'saint-vincent', 'chatillon'],
        'nus-quart': ['nus', 'quart'],
        'la-plaine': ['saint-christophe', 'pollein', 'charvensod', 'gignod', 'aosta'],
        'plaine-to-valdigne': ['sarre', 'saint-pierre', 'jovençan', 'villeneuve', 'aymavilles', 'introd', 'arvier', 'avise', 'saint-nicolas', 'gressan'],
        'valdigne': ['la salle', 'morgex', 'pré-saint-didier', 'courmayeur']
    },

    locationAltitudes: {
        'donnas': 320,
        'pont-saint-martin': 300,
        'perloz': 310,
        'bard': 340,
        'hône': 345,
        'arnad': 350,
        'issogne': 390,
        'champoluc': 1500,
        'challand': 600,
        'montjovet': 450,
        'champdepraz': 400,
        'verrès': 390,
        'chambave': 500,
        'pontey': 500,
        'fenis': 540,
        'saint-vincent': 575,
        'chatillon': 550,
        'nus': 550,
        'quart': 600,
        'saint-christophe': 620,
        'pollein': 550,
        'charvensod': 750,
        'gignod': 900,
        'aosta': 580,
        'sarre': 630,
        'saint-pierre': 730,
        'jovençan': 630,
        'villeneuve': 670,
        'aymavilles': 650,
        'introd': 880,
        'arvier': 750,
        'avise': 775,
        'saint-nicolas': 1200,
        'la salle': 1000,
        'morgex': 1100,
        'courmayeur': 1200,
        'pré-saint-didier': 1000,
        'gressan': 600
    }
};
