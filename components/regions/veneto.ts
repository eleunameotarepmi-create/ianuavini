
import { RegionConfig } from './types';

export const veneto: RegionConfig = {
    id: 'veneto',
    label: "Veneto",
    description: "La Serenissima - Terre di Vini e Bellezza",

    heroImage: "/assets/veneto/gateway.jpg",
    coverImage: "/assets/veneto/gateway.jpg",
    introTitle: "La Serenissima",
    introContent: "Dalla Valpolicella al Prosecco, un viaggio tra tradizione e innovazione.",

    details: {
        territory: {
            title: "Territorio e Diversità",
            points: [
                "Dalle colline prealpine del Prosecco alla pianura del Soave",
                "La Valpolicella con i suoi terrazzamenti e la tecnica dell'appassimento",
                "Suoli vulcanici, morenici e alluvionali che cambiano vino dopo vino",
                "Clima continentale mitigato dal Lago di Garda a ovest e dall'Adriatico a est",
                "Patrimonio UNESCO delle colline del Prosecco di Conegliano e Valdobbiadene"
            ]
        },
        philosophy: {
            title: "Filosofie Venete",
            points: [
                "Maestria nell'appassimento: Amarone, Recioto, Ripasso — tecniche uniche al mondo",
                "Prosecco come ambasciatore dell'allegria italiana nel mondo",
                "Soave e Custoza: bianchi di eleganza cristallina da vitigni autoctoni",
                "Cura maniacale nella selezione delle uve per l'appassimento",
                "Equilibrio tra volume produttivo e ricerca dell'eccellenza"
            ]
        },
        varieties: {
            title: "Vitigni del Veneto",
            groups: [
                {
                    label: "I Pilastri del Rosso",
                    items: ["Corvina Veronese", "Corvinone", "Rondinella", "Molinara", "Oseleta"]
                },
                {
                    label: "Bianchi Brillanti",
                    items: ["Glera (Prosecco)", "Garganega (Soave)", "Trebbiano di Soave", "Durella"]
                },
                {
                    label: "Gemme Rare",
                    items: ["Raboso Piave", "Tai Rosso", "Vespaiola", "Bianchetta Trevigiana"]
                }
            ]
        }
    },

    zones: [
        { id: 'valpolicella', label: 'Valpolicella', minAlt: 100, targetId: 'valpolicella' },
        { id: 'soave', label: 'Soave', minAlt: 50, targetId: 'soave' },
        { id: 'prosecco', label: 'Prosecco DOCG', minAlt: 100, targetId: 'prosecco' },
        { id: 'custoza', label: 'Custoza', minAlt: 50, targetId: 'custoza' },
        { id: 'bardolino', label: 'Bardolino', minAlt: 50, targetId: 'bardolino' }
    ],

    locationMap: {
        'valpolicella': ['negrar', 'fumane', 'marano', 'san pietro in cariano', 'sant\'ambrogio'],
        'soave': ['soave', 'monteforte d\'alpone'],
        'prosecco': ['valdobbiadene', 'conegliano', 'asolo'],
        'custoza': ['sommacampagna', 'villafranca', 'valeggio'],
        'bardolino': ['bardolino', 'lazise', 'affi']
    }
};
