
import { RegionConfig } from './types';

export const liguria: RegionConfig = {
    id: 'liguria',
    label: "Liguria",
    description: "L'Arco - Tra Mare e Cielo",

    heroImage: "/assets/liguria/gateway.jpg",
    coverImage: "/assets/liguria/cover.jpg",
    introTitle: "L'Arco",
    introContent: "Viticoltura eroica a picco sul mare.",

    details: {
        territory: {
            title: "Territorio e Salsedine",
            points: [
                "Un fazzoletto di terra stretto tra le rocce e il Mar Ligure",
                "Muretti a secco millenari, simbolo di una viticoltura di resistenza",
                "Suoli poveri, minerali e ricchi di scheletro, lavorati interamente a mano",
                "Esposizioni solari intense mitigate dalla brezza marina costante",
                "Vigneti 'pieds dans l'eau' che catturano il sale e la luce del mare"
            ]
        },
        philosophy: {
            title: "Filosofie Marine",
            points: [
                "Produzioni limitate per salvaguardare l'integrità del paesaggio",
                "Vendemmie faticose, spesso facilitate dall'uso di cremagliere storiche",
                "Vinificazioni che ricercano la massima freschezza e sapinità",
                "Valorizzazione dei vitigni locali capaci di sfidare il vento e la siccità",
                "Sostenibilità orientata alla difesa attiva del delicato equilibrio costiero"
            ]
        },
        varieties: {
            title: "Vitigni della Liguria",
            groups: [
                {
                    label: "I Protagonisti del Mare",
                    items: ["Vermentino", "Pigato", "Rossese di Dolceacqua", "Albarola", "Bosco"]
                },
                {
                    label: "Tradizioni dalle Rocce",
                    items: ["Ormeasco di Pornassio", "Ciliegiolo", "Granaccia", "Lumassina", "Bianchetta Genovese"]
                },
                {
                    label: "Rarità Preziose",
                    items: ["Picchiato", "Moscatello di Taggia", "Buzzetto", "Scimiscià"]
                }
            ]
        }
    },

    zones: [
        { id: 'cinque-terre', label: 'Cinque Terre', minAlt: 0, targetId: 'cinque-terre' },
        { id: 'riviera-ponente', label: 'Riviera di Ponente', minAlt: 0, targetId: 'riviera-ponente' },
        { id: 'riviera-levante', label: 'Riviera di Levante', minAlt: 0, targetId: 'riviera-levante' },
        { id: 'colli-luni', label: 'Colli di Luni', minAlt: 50, targetId: 'colli-luni' }
    ],

    locationMap: {
        'cinque-terre': ['riomaggiore', 'manarola', 'corniglia', 'vernazza', 'monterosso'],
        'riviera-ponente': ['albenga', 'imperia', 'sanremo', 'dolceacqua'],
        'riviera-levante': ['portofino', 'sestri levante', 'chiavari'],
        'colli-luni': ['sarzana', 'luni', 'castelnuovo magra']
    }
};
