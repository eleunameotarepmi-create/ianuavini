
import { RegionConfig } from './types';

export const francia: RegionConfig = {
    id: 'francia',
    label: "Francia",
    description: "L'Oltralpe - I Grandi Classici",

    heroImage: "/assets/francia/gateway.jpg",
    coverImage: "/assets/francia/gateway.jpg",
    introTitle: "L'Oltralpe",
    introContent: "Borgogna, Bordeaux, Champagne: i modelli che hanno ispirato il mondo.",

    details: {
        territory: {
            title: "Territorio e Terroir",
            points: [
                "Il concetto stesso di terroir nasce qui, dove ogni parcella racconta un vino diverso",
                "Borgogna: climat e cru classificati da secoli, suoli calcarei e marnosi",
                "Bordeaux: ghiaie, argille e calcari sulla riva sinistra e destra della Gironda",
                "Champagne: crayères di gesso che donano mineralità cristallina",
                "Valle del Rodano: granito al nord, galets roulés al sud"
            ]
        },
        philosophy: {
            title: "Filosofie Francesi",
            points: [
                "Il terroir prima di tutto: il vino è espressione del luogo, non dell'enologo",
                "Classificazioni storiche (1855, AOC) che definiscono il valore per generazioni",
                "Borgogna: Pinot Nero e Chardonnay in purezza, senza compromessi",
                "Champagne: l'arte dell'assemblage e della seconda fermentazione in bottiglia",
                "Naturale evoluzione verso il biologico e biodinamico nelle migliori maison"
            ]
        },
        varieties: {
            title: "Vitigni di Francia",
            groups: [
                {
                    label: "I Nobili Universali",
                    items: ["Pinot Noir", "Chardonnay", "Cabernet Sauvignon", "Merlot", "Syrah"]
                },
                {
                    label: "Bianchi d'Eccellenza",
                    items: ["Sauvignon Blanc", "Chenin Blanc", "Viognier", "Riesling d'Alsace", "Melon de Bourgogne"]
                },
                {
                    label: "Tesori del Sud",
                    items: ["Grenache", "Mourvèdre", "Cinsault", "Carignan", "Marsanne"]
                }
            ]
        }
    },

    zones: [
        { id: 'borgogna', label: 'Borgogna', minAlt: 200, targetId: 'borgogna' },
        { id: 'bordeaux', label: 'Bordeaux', minAlt: 0, targetId: 'bordeaux' },
        { id: 'champagne', label: 'Champagne', minAlt: 100, targetId: 'champagne' },
        { id: 'rodano', label: 'Valle del Rodano', minAlt: 100, targetId: 'rodano' },
        { id: 'loira', label: 'Valle della Loira', minAlt: 50, targetId: 'loira' }
    ],

    locationMap: {
        'borgogna': ['beaune', 'nuits-saint-georges', 'gevrey-chambertin', 'meursault', 'puligny-montrachet'],
        'bordeaux': ['pauillac', 'margaux', 'saint-émilion', 'pomerol', 'sauternes'],
        'champagne': ['reims', 'épernay', 'aÿ', 'bouzy'],
        'rodano': ['hermitage', 'côte-rôtie', 'châteauneuf-du-pape', 'gigondas'],
        'loira': ['sancerre', 'vouvray', 'muscadet', 'chinon']
    }
};
