
export interface GlassDefinition {
    id: string;
    name: string;
    shortDescription: string;
    fullDescription: string;
    technicalDetails: string;
    usage: string;
}

// Centralized mapping from glass definition IDs to wine types
export const GLASS_TYPE_MAP: Record<string, string> = {
    'flute': 'sparkling',
    'renano': 'white',
    'borgogna': 'borgogna',
    'borgogna_red': 'borgogna_red',
    'borgogna_rose': 'borgogna_rose',
    'balloon': 'red',
    'barbaresco': 'red_premium',
    'marsala': 'dessert',
    'white': 'white',
    'red': 'red',
    'dessert': 'dessert',
    'rose': 'rose',
    'flute_rose': 'flute_rose',
    'tulipano_white_complex': 'sparkling_complex',
    'tulipano_rose_complex': 'sparkling_rose_complex'
};


export const GLASS_DEFINITIONS: Record<string, GlassDefinition> = {
    'flute_rose': {
        id: 'flute_rose',
        name: 'Flûte Rosé',
        shortDescription: 'Freschezza per rosati frizzanti leggeri',
        fullDescription: 'Il Flûte Rosé è pensato per esaltare la vivacità e il colore dei vini rosati frizzanti giovani. La forma slanciata preserva il perlage fine e persistente, mentre l\'apertura leggermente più ampia rispetto al flute classico permette ai delicati aromi fruttati di esprimersi al meglio.',
        technicalDetails: 'Cristallo trasparente per apprezzare le sfumature rosa. Gambo lungo per mantenere la temperatura fresca (6-8°C).',
        usage: 'Ideale per Rosé frizzanti, Prosecco Rosé, Spumanti Charmat Rosé.'
    },
    'flute': {
        id: 'flute',
        name: 'Flûte Classica',
        shortDescription: 'Perlage persistente e aromi fini',
        fullDescription: 'Tradizionalmente, lo spumante viene servito nella flûte, il bicchiere alto e stretto pensato per enfatizzare il perlage e ridurre la dispersione dell\'anidride carbonica. Se da un lato la flûte preserva l\'effervescenza, dall\'altro penalizza la complessità aromatica, specialmente nei metodo classico e negli spumanti di lungo affinamento. Per un Prosecco giovane e floreale, una flûte slanciata è ancora adeguata.',
        technicalDetails: 'Il corpo stretto favorisce la risalita delle bollicine, mentre la leggera apertura in alto dirige il vino verso la punta della lingua, esaltandone la freschezza e la mineralità. Il materiale ideale è cristallo sottile con punto di perlage sul fondo. Il gambo lungo resta essenziale per evitare di riscaldare il vino con la mano.',
        usage: 'Perfetto per Prosecco, Spumanti Charmat, Champagne non millesimati, rosé frizzanti e tutti i vini dove la vivacità e la freschezza sono protagoniste.'
    },
    'tulipano_white_complex': {
        id: 'tulipano_white_complex',
        name: 'Tulipano Bianco Frizzante Complesso',
        shortDescription: 'Complessità aromatica per bollicine bianche evolute',
        fullDescription: 'Il Tulipano per frizzanti bianchi complessi è pensato per esaltare la ricchezza aromatica di spumanti metodo classico e Champagne. La forma più ampia rispetto al flute permette una maggiore espressione dei profumi complessi, mantenendo una buona valorizzazione del perlage.',
        technicalDetails: 'Calice con punto di perlage inciso sul fondo per favorire la formazione continua delle bollicine. Gambo lungo per evitare di riscaldare il vino. Cristallo sottile per apprezzare le sfumature.',
        usage: 'Ideale per Franciacorta, Trento DOC, Champagne millesimato, spumanti metodo classico dove si vuole apprezzare la complessità olfattiva.'
    },
    'tulipano_rose_complex': {
        id: 'tulipano_rose_complex',
        name: 'Tulipano Rosé Frizzante Complesso',
        shortDescription: 'Eleganza per rosé frizzanti strutturati',
        fullDescription: 'Il Tulipano per rosé frizzanti complessi valorizza la struttura e la complessità aromatica di spumanti rosé metodo classico. La forma permette di apprezzare sia il perlage fine che i profumi evoluti di frutti rossi e spezie.',
        technicalDetails: 'Calice con punto di perlage inciso sul fondo. Cristallo trasparente per apprezzare le sfumature rosa. Gambo lungo per mantenere la temperatura fresca (6-8°C).',
        usage: 'Perfetto per Franciacorta Rosé, Champagne Rosé millesimato, spumanti rosé metodo classico strutturati e complessi.'
    },
    'renano': {
        id: 'renano',
        name: 'Renano / Calice da Bianco Leggero',
        shortDescription: 'Eleganza per vini freschi e aromatici',
        fullDescription: 'Per i vini bianchi leggeri, freschi e aromatici, il bicchiere ideale ha una coppa medio-piccola, affusolata verso l\'alto, con una bocca stretta che concentra i profumi e limita l\'eccessiva ossigenazione. Questa struttura favorisce la percezione delle note floreali, fruttate o erbacee e guida il vino verso la parte anteriore del palato, dove si colgono al meglio le sue componenti più fresche e aromatiche.',
        technicalDetails: 'L\'apertura stretta guida il vino verso la parte anteriore della bocca, dove si percepiscono meglio acidità e sapidità. Il gambo lungo è fondamentale per evitare che il calore della mano influisca sulla temperatura di servizio, che per questi vini dovrebbe restare tra gli 8 e i 12°C. Per esaltare le qualità visive e tattili del vino, il calice ideale dovrebbe essere in vetro sottile o in cristallo senza piombo.',
        usage: 'Ideale per Vermentino, Sauvignon Blanc, Pinot Grigio, Müller-Thurgau, Petite Arvine, rosé fermi leggeri e vini bianchi giovani e beverini.'
    },
    'borgogna': {
        id: 'borgogna',
        name: 'Borgogna',
        shortDescription: 'Ampiezza per vini bianchi strutturati',
        fullDescription: 'Per valorizzare le caratteristiche di un vino bianco strutturato, il bicchiere deve avere una coppa ampia e una bocca leggermente richiusa. Questa forma consente una buona ossigenazione, favorendo l\'apertura dei profumi complessi e stratificati, spesso dominati da note di frutta matura, spezie, fiori appassiti, burro, miele o vaniglia. A differenza dei bianchi leggeri, questi vini beneficiano di un maggior contatto con l\'aria, che aiuta a rivelarne l\'evoluzione aromatica e la profondità.',
        technicalDetails: 'Il vino viene guidato verso il centro del palato, permettendo una percezione equilibrata tra struttura, accoglienza alcolica e persistenza. Un bicchiere in cristallo fine o vetro soffiato di alta qualità garantisce trasparenza e leggerezza, permettendo di osservare al meglio il colore dorato o ambrato. La forma sottile del bordo consente un sorso preciso.',
        usage: 'Per Chardonnay affinato in barrique, bianchi complessi, rosé strutturati e vini bianchi con affinamento importante.'
    },
    'borgogna_red': {
        id: 'borgogna_red',
        name: 'Borgogna',
        shortDescription: 'Ampiezza per rossi complessi e strutturati',
        fullDescription: 'Il calice Borgogna per vini rossi ha una coppa ampia e panciuta con bocca larga, pensata per ossigenare rossi complessi e di grande struttura. La forma generosa permette al vino di esprimersi pienamente, liberando aromi terziari di spezie, cuoio, tabacco e frutti maturi. L\'ampio diametro della coppa favorisce una superficie di contatto con l\'aria maggiore rispetto ai calici tradizionali.',
        technicalDetails: 'La coppa larga e arrotondata dirige il vino verso il centro della lingua, bilanciando tannini morbidi e acidità. Il cristallo sottile garantisce trasparenza per apprezzare le sfumature granato e aranciato dei rossi evoluti. Temperatura di servizio ideale: 16-18°C.',
        usage: 'Per Barolo, Barbaresco, Pinot Nero di grande struttura, Borgogna francesi, e rossi di lungo invecchiamento.'
    },
    'borgogna_rose': {
        id: 'borgogna_rose',
        name: 'Borgogna',
        shortDescription: 'Ampiezza per rosati strutturati e complessi',
        fullDescription: 'Il calice Borgogna per rosati strutturati consente una buona ossigenazione dei profumi complessi tipici dei rosé di corpo. La coppa ampia permette di apprezzare le note fruttate mature, floreali e speziate, mantenendo la freschezza caratteristica del rosato.',
        technicalDetails: 'La coppa arrotondata dirige il vino verso il centro del palato, bilanciando struttura e freschezza. Il cristallo sottile esalta le sfumature di colore dal corallo al cerasuolo. Temperatura di servizio ideale: 10-14°C.',
        usage: 'Per rosati strutturati, Cerasuolo d\'Abruzzo, Tavel, Chiaretto di Bardolino riserva e rosé con affinamento.'
    },

    'balloon': {
        id: 'balloon',
        name: 'Balloon',
        shortDescription: 'Versatilità per rossi giovani e di medio corpo',
        fullDescription: 'Il calice ideale per un vino rosso giovane o di struttura leggera ha una coppa di media ampiezza, leggermente arrotondata e con imboccatura non troppo chiusa. Questa forma consente una buona aerazione del vino, necessaria per ammorbidire eventuali spigolosità, senza disperdere i profumi primari come frutti rossi, viole, spezie dolci o leggere note erbacee. Il vino viene indirizzato verso il centro e i lati della lingua, mettendo in risalto la componente fruttata e la leggera trama tannica.',
        technicalDetails: 'Si prediligono materiali trasparenti e leggeri, come il cristallo soffiato o il vetro sottile, che garantiscono una visione nitida del colore – dal rubino brillante al porpora acceso. Il gambo di media lunghezza consente una buona presa evitando il contatto diretto con la coppa, fondamentale per mantenere la corretta temperatura di servizio, in genere tra i 14 e i 16°C.',
        usage: 'Perfetto per Chianti giovani, Dolcetto, Barbera, Valpolicella, Torrette, Gamay, Montepulciano d\'Abruzzo e rossi che puntano su immediatezza e bevibilità.'
    },
    'barbaresco': {
        id: 'barbaresco',
        name: 'Barbaresco',
        shortDescription: 'Ossigenazione per grandi rossi da invecchiamento',
        fullDescription: 'Il calice perfetto per un rosso strutturato e di lungo affinamento è ampio, con coppa grande e ben arrotondata, spesso a forma di grande tulipano o addirittura "a palla". L\'ampiezza favorisce una generosa ossigenazione del vino, necessaria per far emergere le note terziarie – cuoio, tabacco, spezie, sottobosco, goudron – insieme ai residui di frutto e alle sfumature evolute. La bocca leggermente richiusa concentra gli aromi verso il naso, permettendo una lettura olfattiva stratificata.',
        technicalDetails: 'Il bicchiere deve essere realizzato in cristallo fine o vetro soffiato di alta qualità, capaci di garantire estrema trasparenza e sottigliezza del bordo, favorendo una percezione pulita e precisa del sorso. L\'ampia superficie interna permette al vino di svilupparsi lentamente nel bicchiere. Il gambo lungo evita il contatto con la coppa, aiutando a mantenere la corretta temperatura di servizio – tra 16 e 18°C.',
        usage: 'Ideale per Barolo, Barbaresco, Brunello di Montalcino, Amarone, Sagrantino, Chianti Classico Riserva, grandi Bordeaux, Cabernet Sauvignon e Syrah invecchiati.'
    },
    'marsala': {
        id: 'marsala',
        name: 'Marsala / Calice da Passito',
        shortDescription: 'Piccolo scrigno per aromi concentrati',
        fullDescription: 'Il bicchiere ideale per i vini passiti è piccolo, con coppa raccolta e bocca chiusa, studiato per concentrare i profumi intensi senza disperderli. La struttura del calice ricorda quella dei bicchieri da liquorosi o da vini fortificati, ma con maggiore grazia: la forma a tulipano, leggermente panciuta alla base e stretta all\'imboccatura, guida i sentori di frutta disidratata, miele, spezie dolci, canditi, resine o fiori appassiti verso il naso, amplificandone la complessità. La dimensione ridotta aiuta a dosare il sorso, rendendo l\'assaggio più meditato e controllato.',
        technicalDetails: 'Per questa tipologia di vino si prediligono calici in vetro sottile o cristallo fine, in grado di esaltare il colore profondo e brillante – dal dorato carico all\'ambra, fino al rame e al topazio. Il gambo lungo protegge il vino dal calore della mano, mantenendolo alla giusta temperatura di servizio, solitamente tra i 10 e i 14°C. La forma e la dimensione aiutano anche a evitare la sensazione di eccessiva dolcezza.',
        usage: 'Indispensabile per Passiti, Vendemmie Tardive, Vin Santo, Recioto, vini liquorosi o da meditazione.'
    }
};

export const getGlassTypeFromWine = (type: string | undefined): GlassDefinition => {
    if (!type) return GLASS_DEFINITIONS['balloon'];
    // Sparkling
    if (['sparkling', 'champagne'].includes(type)) return GLASS_DEFINITIONS['tulipano'];
    if (['sparkling_rose', 'flute_rose'].includes(type)) return GLASS_DEFINITIONS['flute_rose'];
    // Reds
    if (['red'].includes(type)) return GLASS_DEFINITIONS['balloon'];
    if (['red_structured', 'barbaresco'].includes(type)) return GLASS_DEFINITIONS['barbaresco'];
    if (['borgogna_red', 'red_complex'].includes(type)) return GLASS_DEFINITIONS['borgogna_red'];
    // Whites
    if (['white'].includes(type)) return GLASS_DEFINITIONS['renano'];
    if (['white_complex', 'borgogna'].includes(type)) return GLASS_DEFINITIONS['borgogna'];
    // Dessert
    if (['dessert', 'fortified'].includes(type)) return GLASS_DEFINITIONS['marsala'];
    // Rosé
    if (['rose'].includes(type)) return GLASS_DEFINITIONS['renano'];
    if (['rose_structured', 'borgogna_rose'].includes(type)) return GLASS_DEFINITIONS['borgogna_rose'];
    return GLASS_DEFINITIONS['balloon'];
};
