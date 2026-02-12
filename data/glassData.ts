
export interface GlassDefinition {
    id: string;
    name: string;
    shortDescription: string;
    fullDescription: string;
    technicalDetails: string;
    usage: string;
}

export const GLASS_DEFINITIONS: Record<string, GlassDefinition> = {
    'flute': {
        id: 'flute',
        name: 'Flûte / Calice da Spumante',
        shortDescription: 'Perlage persistente e aromi fini',
        fullDescription: 'Tradizionalmente, lo spumante viene servito nella flûte, il bicchiere alto e stretto pensato per enfatizzare il perlage e ridurre la dispersione dell’anidride carbonica. Tuttavia, per gli spumanti più complessi o Metodo Classico millesimati, si preferisce oggi un calice leggermente più ampio e panciuto, che permette una migliore espressione dei profumi senza sacrificare le bollicine.',
        technicalDetails: 'Il corpo stretto favorisce la risalita delle bollicine, mentre la leggera apertura in alto dirige il vino verso la punta della lingua, esaltandone la freschezza e la mineralità. Il materiale ideale è cristallo sottile con punto di perlage sul fondo.',
        usage: 'Perfetto per Prosecco, Spumanti Charmat, Champagne non millesimati e tutti i vini dove la vivacità e la freschezza sono protagoniste.'
    },
    'white': {
        id: 'white',
        name: 'Tulipano / Calice da Bianco',
        shortDescription: 'Eleganza per vini freschi e aromatici',
        fullDescription: 'Per i vini bianchi leggeri, freschi e aromatici, il bicchiere ideale ha una coppa medio-piccola e affusolata verso l’alto. Questa forma a tulipano concentra i profumi delicati (fiori, frutta fresca, agrumi) e limita l’ossigenazione eccessiva che potrebbe disperderli.',
        technicalDetails: 'L’apertura stretta guida il vino verso la parte anteriore della bocca, dove si percepiscono meglio acidità e sapidità. Il gambo lungo è essenziale per tenere il calice senza scaldare il vino con la mano.',
        usage: 'Ideale per Vermentino, Sauvignon Blanc, Pinot Grigio, Müller-Thurgau e vini bianchi giovani e beverini.'
    },
    'red': {
        id: 'red',
        name: 'Calice Ampio / Balloon',
        shortDescription: 'Ossigenazione per rossi strutturati',
        fullDescription: 'Un calice dalla forma rotondeggiante e ampia, pensato per vini rossi di media struttura. La coppa larga aumenta la superficie di contatto con l’aria, favorendo l’ossigenazione che "apre" il vino, ammorbidendo tannini spigolosi e liberando profumi complessi di frutta rossa, spezie e note terziarie.',
        technicalDetails: 'La forma sferica concentra gli aromi verso il naso, mentre l’imboccatura leggermente più stretta evita che si disperdano troppo velocemente. Permette al vino di dirigersi verso il centro e il retro della lingua, esaltando corpo e persistenza.',
        usage: 'Perfetto per Chianti, Barbera, Dolcetto, Valpolicella, Torrette e rossi che necessitano di respirare per esprimersi al meglio.'
    },
    'dessert': {
        id: 'dessert',
        name: 'Calice da Passito / Tulipano Piccolo',
        shortDescription: 'Piccolo scrigno per aromi concentrati',
        fullDescription: 'Il bicchiere ideale per i vini passiti è un piccolo gioiello: coppa raccolta e bocca chiusa, studiata per concentrare i profumi intensi (miele, frutta secca, albicocca) senza disperderli. La dimensione ridotta invita a sorseggiare piccole quantità, adatte all’elevata concentrazione zuccherina e alcolica.',
        technicalDetails: 'La forma a piccolo tulipano dirige il flusso del vino verso la punta della lingua, enfatizzando la dolcezza ma bilanciandola con l’acidità. Il vetro sottile esalta i colori brillanti e ambrati tipici di questi vini.',
        usage: 'Indispensabile per Passiti, Vendemmie Tardive, vini liquorosi o da meditazione.'
    },
    'rose': {
        id: 'rose',
        name: 'Tulipano Aperto / Calice da Rosato',
        shortDescription: 'Freschezza e profumi floreali',
        fullDescription: 'Per i vini rosati, che uniscono la freschezza dei bianchi alla struttura leggera dei rossi, si utilizza un calice a tulipano con una coppa leggermente più aperta rispetto a quella dei bianchi. Questo permette una rapida ossigenazione che libera i profumi floreali e di piccoli frutti rossi tipici della categoria.',
        technicalDetails: 'L’apertura svasata dirige il liquido sulla punta della lingua, esaltando la freschezza e la sapidità, bilanciando l’eventuale leggera tannicità. Il gambo lungo preserva la temperatura di servizio fresca.',
        usage: 'Ideale per Rosati fermi, Cerasuolo, Chiaretto e vini di media struttura serviti freschi.'
    },
    'universal': {
        id: 'universal',
        name: 'Calice Universale',
        shortDescription: 'Equilibrio perfetto',
        fullDescription: 'Un calice versatile progettato per degustare diverse tipologie di vino con ottimi risultati. La forma bilanciata, né troppo ampia né troppo stretta, permette una corretta espressione sia dei bianchi strutturati che dei rossi giovani.',
        technicalDetails: 'Progettato per essere il "passe-partout" della degustazione, unisce le caratteristiche di concentrazione degli aromi del tulipano con la capacità di ossigenazione del balloon.',
        usage: 'Ottimo per chi cerca un unico bicchiere di alta qualità adatto a quasi tutte le occasioni.'
    }
};

export const getGlassTypeFromWine = (type: string | undefined): GlassDefinition => {
    if (!type) return GLASS_DEFINITIONS['universal'];
    if (['sparkling', 'champagne', 'sparkling_rose'].includes(type)) return GLASS_DEFINITIONS['flute'];
    if (['red', 'red_structured'].includes(type)) return GLASS_DEFINITIONS['red'];
    if (['white', 'white_complex'].includes(type)) return GLASS_DEFINITIONS['white'];
    if (['dessert', 'fortified'].includes(type)) return GLASS_DEFINITIONS['dessert'];
    if (['rose'].includes(type)) return GLASS_DEFINITIONS['rose'];
    return GLASS_DEFINITIONS['universal'];
};
