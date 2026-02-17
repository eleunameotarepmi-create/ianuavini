
import { RegionConfig } from './types';

export const toscana: RegionConfig = {
    id: 'toscana',
    label: "Toscana",
    description: "Il Cuore - Terra di Sangiovese",

    heroImage: "/assets/toscana/gateway.jpg",
    coverImage: "/assets/toscana/gateway.jpg",
    introTitle: "Il Cuore",
    introContent: "Dove il Sangiovese diventa poesia, tra colline di cipressi e storia millenaria.",

    details: {
        territory: {
            title: "Territorio e Colline",
            points: [
                "Colline ondulate tra Firenze e Siena, cuore pulsante del vino italiano",
                "Suoli di galestro e alberese che donano struttura e mineralità unica",
                "Clima mediterraneo temperato con escursioni termiche ideali",
                "Paesaggi patrimonio UNESCO, dove arte e vigna si fondono",
                "Altitudini variabili dai 250 ai 600 metri, perfette per il Sangiovese"
            ]
        },
        philosophy: {
            title: "Filosofie Toscane",
            points: [
                "Rispetto assoluto per il Sangiovese, vitigno identitario per eccellenza",
                "Tradizione secolare di blend nobili: Chianti, Brunello, Vino Nobile",
                "Innovazione dei SuperTuscan che hanno rivoluzionato il mondo del vino",
                "Biodinamica e biologico come scelta etica diffusa",
                "Invecchiamento in botti grandi di slavonia per i tradizionalisti, barrique per i modernisti"
            ]
        },
        varieties: {
            title: "Vitigni della Toscana",
            groups: [
                {
                    label: "I Re del Territorio",
                    items: ["Sangiovese", "Sangiovese Grosso (Brunello)", "Prugnolo Gentile", "Canaiolo Nero"]
                },
                {
                    label: "Bianchi Eleganti",
                    items: ["Vernaccia di San Gimignano", "Trebbiano Toscano", "Malvasia Bianca", "Vermentino"]
                },
                {
                    label: "Internazionali d'Adozione",
                    items: ["Cabernet Sauvignon", "Merlot", "Syrah", "Petit Verdot"]
                }
            ]
        }
    },

    zones: [
        { id: 'chianti-classico', label: 'Chianti Classico', minAlt: 250, targetId: 'chianti-classico' },
        { id: 'montalcino', label: 'Montalcino', minAlt: 300, targetId: 'montalcino' },
        { id: 'montepulciano', label: 'Montepulciano', minAlt: 250, targetId: 'montepulciano' },
        { id: 'bolgheri', label: 'Bolgheri', minAlt: 0, targetId: 'bolgheri' },
        { id: 'maremma', label: 'Maremma', minAlt: 0, targetId: 'maremma' }
    ],

    locationMap: {
        'chianti-classico': ['greve', 'castellina', 'radda', 'gaiole', 'panzano'],
        'montalcino': ['montalcino', 'sant\'antimo'],
        'montepulciano': ['montepulciano'],
        'bolgheri': ['bolgheri', 'castagneto carducci'],
        'maremma': ['scansano', 'pitigliano', 'morellino']
    }
};
