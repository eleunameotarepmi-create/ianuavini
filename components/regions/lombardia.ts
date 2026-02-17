
import { RegionConfig } from './types';

export const lombardia: RegionConfig = {
    id: 'lombardia',
    label: "Lombardia",
    description: "L'Eleganza - Bollicine e Nebbiolo d'Altura",

    heroImage: "/assets/lombardia/gateway.jpg",
    coverImage: "/assets/lombardia/gateway.jpg",
    introTitle: "L'Eleganza",
    introContent: "Franciacorta, Oltrepò e Valtellina: tre anime di un grande terroir.",

    details: {
        territory: {
            title: "Territorio e Contrasti",
            points: [
                "Franciacorta: colline moreniche a sud del Lago d'Iseo, perfette per le bollicine",
                "Valtellina: vigneti eroici sui terrazzamenti alpini, fino a 800 metri",
                "Oltrepò Pavese: colline dolci che guardano verso l'Appennino",
                "Suoli morenici, calcari e sabbiosi che variano radicalmente zona per zona",
                "Microclimi unici modellati dai grandi laghi prealpini"
            ]
        },
        philosophy: {
            title: "Filosofie Lombarde",
            points: [
                "Franciacorta: metodo classico portato all'eccellenza, dosaggi minimi",
                "Valtellina: Nebbiolo (Chiavennasca) d'altura con verticalità unica",
                "Sforzato: l'appassimento del Nebbiolo per vini potenti e avvolgenti",
                "Oltrepò: rivalutazione del Pinot Nero come grande rosso italiano",
                "Sostenibilità e tutela dei terrazzamenti storici come patrimonio culturale"
            ]
        },
        varieties: {
            title: "Vitigni della Lombardia",
            groups: [
                {
                    label: "Protagonisti Assoluti",
                    items: ["Nebbiolo (Chiavennasca)", "Pinot Nero", "Chardonnay", "Pinot Bianco"]
                },
                {
                    label: "Autoctoni Preziosi",
                    items: ["Croatina (Bonarda)", "Barbera", "Moscato di Scanzo", "Verdea"]
                },
                {
                    label: "Per le Bollicine",
                    items: ["Chardonnay", "Pinot Nero", "Pinot Bianco", "Erbamat"]
                }
            ]
        }
    },

    zones: [
        { id: 'franciacorta', label: 'Franciacorta', minAlt: 100, targetId: 'franciacorta' },
        { id: 'valtellina', label: 'Valtellina', minAlt: 300, targetId: 'valtellina' },
        { id: 'oltrepo', label: 'Oltrepò Pavese', minAlt: 100, targetId: 'oltrepo' },
        { id: 'lugana', label: 'Lugana', minAlt: 50, targetId: 'lugana' }
    ],

    locationMap: {
        'franciacorta': ['erbusco', 'corte franca', 'adro', 'provaglio', 'passirano'],
        'valtellina': ['sondrio', 'tirano', 'teglio', 'chiuro', 'ponte in valtellina'],
        'oltrepo': ['casteggio', 'santa maria della versa', 'canneto pavese'],
        'lugana': ['sirmione', 'desenzano', 'peschiera']
    }
};
