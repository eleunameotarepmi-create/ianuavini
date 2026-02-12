
import { RegionConfig } from './types';

export const sardegna: RegionConfig = {
    id: 'sardegna',
    label: "Sardegna",
    description: "L'Isola - Vento e Granito",

    heroImage: "/assets/sardegna/gateway.jpg",
    coverImage: "/assets/sardegna/cover.jpg",
    introTitle: "L'Isola",
    introContent: "Vigne antiche su terra di granito.",

    details: {
        territory: {
            title: "Territorio e Vento",
            points: [
                "Un'isola antica scolpita dal Maestrale e baciata dal Mediterraneo",
                "Terreni granitici, calcarei e vulcanici che confermano forza ai vini",
                "Ampia varietà climatica: dalla costa rinfrescata al cuore aspro dell'interno",
                "Tradizione millenaria di alberelli che sfidano il sole e il vento",
                "Biodiversità selvaggia tra macchia mediterranea, sugherete e saline"
            ]
        },
        philosophy: {
            title: "Filosofie Ancestrali",
            points: [
                "Rispetto dei cicli biologici in un ecosistema naturalmente protetto",
                "Lavorazioni che fondono sapienza contadina e moderne visioni enologiche",
                "Vinificazioni atte a estrarre il calore del sole e la freschezza del mare",
                "Valorizzazione della longevità e della struttura identitaria dei vini",
                "Impegno nella tutela delle cultivar varietali uniche al mondo"
            ]
        },
        varieties: {
            title: "Vitigni della Sardegna",
            groups: [
                {
                    label: "L'Anima Sarda",
                    items: ["Cannonau", "Vermentino", "Carignano", "Vernaccia di Oristano", "Monica"]
                },
                {
                    label: "Eredità Storiche",
                    items: ["Bovale", "Cagnulari", "Nasco", "Nuragus", "Malvasia di Bosa"]
                },
                {
                    label: "Tesori da Scoprire",
                    items: ["Torbato", "Semidano", "Nieddera", "Girò", "Moscato di Sorso-Sennori"]
                }
            ]
        }
    },

    zones: [
        { id: 'gallura', label: 'Gallura', minAlt: 300, targetId: 'gallura' },
        { id: 'barbagia', label: 'Barbagia', minAlt: 600, targetId: 'barbagia' },
        { id: 'sulcis', label: 'Sulcis', minAlt: 50, targetId: 'sulcis' },
        { id: 'oristano', label: 'Oristano', minAlt: 10, targetId: 'oristano' },
        { id: 'cagliari', label: 'Cagliari', minAlt: 50, targetId: 'cagliari' }
    ],

    locationMap: {
        'gallura': ['tempio pausania', 'arzachena', 'olbia', 'berchidda'],
        'barbagia': ['mamoiada', 'orgosolo', 'nuoro', 'oliena'],
        'sulcis': ['santadi', 'carbonia', 'iglesias'],
        'oristano': ['oristano', 'cabras'],
        'cagliari': ['cagliari', 'serdiana', 'dolianova']
    }
};
