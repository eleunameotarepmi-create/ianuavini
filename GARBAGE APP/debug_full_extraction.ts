
import { extractWineryDataFromText } from './services/geminiService';
import * as dotenv from 'dotenv';
// dotenv.config({ path: '.env.local' }); // Skip file loading, use direct key
process.env.API_KEY = "AIzaSyDYlrZwOyJAoVv6hKCmqAl52mXFY5PQSl4";

const CROTTA_TEXT = `
LA CROTTA DI VEGNERON – CHAMBAVE

“Pendio, sole, pietra, vento” non è solo un motto, ma l’essenza stessa della filosofia produttiva della Crotta: una viticoltura di montagna che vive in armonia con l’ambiente.
Fondata nel 1980 da 25 viticoltori, oggi La Crotta di Vegneron riunisce 53 famiglie di soci e produce mediamente 200.000 bottiglie all’anno.
Le uve provengono da due aree storiche della Valle d’Aosta:
la zona di Chambave, che include i comuni di Châtillon, Pontey, Saint-Vincent, Saint-Denis e Verray inserisci tu perfavorees;
la zona di Nus, comprendente Quart e Fénis.
Le vigne, tra i 450 e i 750 metri s.l.m., si estendono su terreni morenici sabbiosi in forte pendenza, dove la vite cresce su suoli drenanti e ricchi di minerali.
La Crotta è prima di tutto una storia di persone: generazioni di viticulteurs che portano avanti la tradizione dei campagnards, ricercando nell’unione tra vitigni autoctoni e territorio la propria forza identitaria.

 Curiosità: “Vegneron” in patois valdostano significa viticoltore — un termine che celebra il lavoro umano, la fatica e la sapienza tramandata nel tempo.






Vini proposti da Ianua:





Chambave Muscat – Vallée d’Aoste D.O.C.
Bianco aromatico – 100% Moscato Bianco

> Nei vigneti di Chambave, le uve di Moscato Bianco esprimono la purezza del vitigno e l’aromaticità alpina che lo contraddistingue.
È un vino secco ed elegante, capace di raccontare la tradizione di un territorio unico.
Vitigno: 100% Moscato Bianco
Zona di produzione: Chambave, Saint-Denis, Châtillon, Verrayes (450–750 m s.l.m.)
Terreno: morenico, sabbioso, in forte pendenza
Forma di allevamento: Guyot, alberello, cordone speronato
Vinificazione: macerazione pellicolare a freddo (12–18 h), fermentazione a 12–16 °C
Affinamento: in acciaio con bâtonnage sulle fecce fini
Vista: giallo paglierino con riflessi verdolini
Olfatto: salvia, timo, pesca bianca, litchi
Gusto: secco, aromatico, minerale, con piacevole acidità e persistenza
Temperatura di servizio: 10 °C
Abbinamenti: aperitivo, crostacei, trota alle erbe, formaggi di media stagionatura

Curiosità: lo Chambave Muscat è uno dei pochi Moscati secchi d’Italia. Dalla stessa base nasce anche la versione Flétri, un prezioso passito di rara eleganza.









Syrah “Crème” – Vallée d’Aoste D.O.C.
Rosso secco – 100% Syrah

> Le uve di Syrah, coltivate sui pendii esposti a sud tra Nus e Chambave, si trasformano in un rosso elegante e potente, emblema dell’adattamento del vitigno internazionale alle condizioni alpine.
Vitigno: 100% Syrah
Zona di produzione: Nus, Quart, Saint-Denis, Chambave, Châtillon (450–550 m s.l.m.)
Terreno: morenico, sabbioso, in forte pendenza
Forma di allevamento: Guyot
Vinificazione: macerazione di 20 giorni a 25 °C
Affinamento: 12 mesi sur lies, con almeno 50% in legno piccolo
Vista: rosso rubino con riflessi granati
Olfatto: frutta rossa matura, spezie e note balsamiche
Gusto: caldo, pieno, voluminoso, con tannini eleganti e lunga persistenza
Temperatura di servizio: 18 °C
Abbinamenti: mocetta, selvaggina, arrosti

💡 Curiosità: il nome Crème rimanda alla rotondità e alla morbidezza del vino, risultato di una lunga maturazione sui lieviti fini.










 Fumin “Esprit Follet” – Vallée d’Aoste D.O.C.
Rosso autoctono – 100% Fumin

> Il Fumin è un antico vitigno valdostano dalla buccia blu intensa, simbolo del carattere più autentico dei rossi di montagna.
Vinificato in acciaio e affinato in legni di diverse dimensioni, rappresenta un connubio di forza, eleganza e territorialità.
Vitigno: 100% Fumin
Zona di produzione: Nus, Fénis, Chambave, Verrayes, Saint-Denis, Châtillon (450–550 m s.l.m.)
Terreno: morenico, sabbioso, in media pendenza
Forma di allevamento: Guyot, cordone speronato
Vinificazione: fermentazione in acciaio a 28–30 °C per 20 giorni con rimontaggi
Affinamento: 12 mesi in legni diversi (grandi e piccoli) + 5 mesi in vetro
Vista: rosso rubino intenso con riflessi malvacei
Olfatto: vaniglia, pepe bianco, ciliegia, amarena, liquirizia
Gusto: secco, caldo, minerale, con tannini eleganti e lunga persistenza
Temperatura di servizio: 18 °C
Abbinamenti: carni rosse succulente, piatti alla brace, formaggi stagionati

 Curiosità: Esprit Follet, letteralmente “spirito birichino”, richiama la vivacità del vitigno Fumin e la sua capacità di sorprendere per complessità e freschezza.


 La Crotta di Vegneron è una delle voci più emblematiche della Valle d’Aosta: un collettivo di vignaioli che unisce radici e innovazione, tradizione e tecnica, custodendo la vera anima del vino valdostano.

Refrain: 
VINS D'ALTITUDE 
I vigneti scelti per la produzione sono i più vocati a produrre uve bianche dalla grande complessità 
aromatica e minerale. Le forme di allevamento ripercorrono gli schemi tradizionali di coltivazione 
legati ai territori di provenienza. In cantina il pool tecnico ha come unico obiettivo quello di trasferire 
ogni elemento caratterizzante della zona in un vino dalla grande complessità aromatica ed una 
incomparabile fragranza che sono, ancora una volta, sintesi dell'ambiente alpino che lo circonda. 
Qualifica 
Vino spumante Refrain dry 
Zona di produzione 
Vigneti in esposizione sud, dalla quota altimetrica 
di 450 m s.l.m. a 750 m s.l.m. 
Terreno 
Posizionati su svariate tipologie di terreno, i vigneti 
sono i più vocati a produrre uve bianche dalla 
grande complessità aromatica e minerale ed uve 
rosse fortemente legate al territorio di montagna. 
Vitigni 
A bacca bianca aromatica 
Numero ceppi per ettaro 
6.500/7000 
Forma di allevamento 
Pergola bassa, Guyot, Goblet, cordone speronato 
Resa per ettaro 
8000 kg 
Vendemmia 
Scalare dall'ultima settimana di agosto alla terza 
decade di settembre 
Vinificazione e presa di spuma 
In acciaio con macerazione pre-fermentativa a 
freddo. La presa di spuma viene effettuata 
secondo il Metodo Charmat 
ul 
Vista 
Giallo paglierino con leggeri riflessi ramati, perlage 
fine e persistente 
Olfatto 
Risulta subito di buona intensità, fragrante nei 
sentori floreali bianchi prima, poi di salvia, timo e 
lavanda. | toni fruttati sono delicati e fini nei 
riconoscimenti di pesca, pompelmo rosa, mela 
renetta 
Gusto 
Nel centro dell’assaggio la mineralità prende, 
seppur con delicatezza, il sopravvento 
riproponendo in finale una netta sensazione di 
agrumi 
Temperatura di servizio 
8/12 C 
Abbinamenti 
Vino da aperitivo da provare con verdurine fritte 
in pastella, salamella lessata


Glossario e Analisi dei Vitigni: 
I. Terminologia e Tecniche Enologiche
| Vegneron (Patois Valdostano) | Termine in dialetto valdostano che significa "viticoltore". Celebra il lavoro umano e la sapienza tramandata nel tempo. |
| Viticoltura Eroica | Coltivazione della vite in ambienti estremi o difficili (forti pendenze, alta quota, terrazzamenti) che richiede lavoro interamente manuale. |
| Terreni Morenici Sabbiosi | Terreni di origine glaciale (morena). Sono molto drenanti e magri, ideali per donare mineralità ed eleganza ai vini di montagna. |
| Mosto | Il succo d'uva, non ancora fermentato o solo in parte, contenente bucce, semi e lieviti. È la materia prima da cui si ottiene il vino. |
| Fecce | Residuo solido che si deposita sul fondo del tino dopo la fermentazione, composto principalmente da lieviti esausti e altre particelle. Si distinguono in grosse o fini. |
| Composti Polifenolici (Polifenoli) | Vasta famiglia di composti chimici (tra cui Tannini e Antociani) presenti nella buccia e nei semi dell'uva. Sono estratti durante la macerazione e influenzano colore e struttura. |
| Tannini | Specifici polifenoli con sapore amarognolo e astringente. Provengono da bucce, semi e legno. Sono cruciali per la struttura (corpo) e la longevità dei vini rossi. |
| Pruina | Sostanza cerosa e biancastra che ricopre l'acino d'uva. Nel Fumin, è intensa e bluastra, dando origine al nome del vitigno ("affumicato" / fumé). |
| Tostatura del Legno | Trattamento termico applicato all'interno delle botti (leggera, media o forte) per sviluppare e cedere al vino composti aromatici (vaniglia, spezie). |
| Macerazione | Il periodo in cui il mosto rimane a contatto con le bucce, fondamentale per l'estrazione di polifenoli (colore e tannini). |
| Rimontaggio (Spostare mosto dal fondo al cappello di vinaccia) | Tecnica che preleva il mosto dal fondo del tino per irrorare il "cappello" (strato di bucce galleggianti). Favorisce l'estrazione dei polifenoli. |
| Rimettere in sospensione le fecce fini | Azione fisica (ottenuta tramite Bâtonnage) per agitare il vino, facendo tornare i sedimenti di lieviti in circolo e conferendo morbidezza e complessità. |
| Bâtonnage | Tecnica che sfrutta l'azione di rimettere in sospensione le fecce fini per arricchire il vino durante l'affinamento. |
| Affinamento in Legni Diversi | L'uso di botti di rovere di diverse dimensioni, età e tostature per integrare al vino struttura, tannini nobili e note aromatiche. |
| Affinamento in Acciaio | L'uso di vasche di acciaio inox, mirato a preservare la fragranza aromatica, la freschezza e l'acidità tipiche del vitigno. |
| Antociani | Specifici polifenoli responsabili del colore rosso, blu o viola dei vini e delle bucce. Vengono estratti durante la macerazione insieme ai tannini. |
II. Analisi e Caratteristiche dei Vitigni (Uve)
| Moscato Bianco (100% in Chambave Muscat) | Internazionale / Storico (dal latino muscum). | Aromatico, ricco di sentori di salvia, timo, pesca bianca e litchi. Utilizzato per un vino bianco secco di ottima struttura. |
| Syrah (100% in Syrah “Crème”) | Internazionale (Francia, Valle del Rodano). | Fornisce un vino di corpo, con sentori di frutta rossa matura e note speziate. |
| Fumin (100% in Fumin “Esprit Follet”) | Autoctono Valdostano. Il nome significa "affumicato" (fumé). | Apporta struttura, mineralità e tannini eleganti. Aromi tipici: vaniglia, pepe bianco, ciliegia, amarena e liquirizia. |
| Petit Rouge (Minimo 70% in Chambave Rouge) | Autoctono Valdostano. È il più coltivato in Valle d'Aosta. | Costituisce la base dello Chambave Rouge D.O.C. Fornisce freschezza, sentori fruttati e floreali. |
| Gamay | Vitigno tradizionale di origine Borgognona (Francia). | Contribuisce al blend con leggerezza, freschezza e intensi aromi fruttati (fragola, lampone). |
| Pinot Noir | Vitigno di fama internazionale, originario della Borgogna. | Apporta al vino eleganza, finezza aromatica (note di sottobosco, violetta) e una struttura tannica setosa. |
`;

async function runTest() {
    console.log(">>> SCRIPT START");
    console.log("Checking API Key:", process.env.API_KEY ? "EXISTS (" + process.env.API_KEY.substring(0, 5) + "...)" : "MISSING");

    if (!process.env.API_KEY) {
        console.error("❌ CRITICAL: API_KEY is missing from env!");
        return;
    }

    console.log("Invoking extractWineryDataFromText...");
    try {
        const data = await extractWineryDataFromText(CROTTA_TEXT);

        console.log("<<< EXTRACTION RETURNED");
        if (data) {
            console.log("✅ SUCCESS!");
            console.log("Winery:", data.winery?.name);
            console.log("Desc Length:", data.winery?.description?.length);
            console.log("Wines Count:", data.wines?.length);
            console.log("Glossary Count:", data.glossary?.length);
        } else {
            console.error("❌ ERROR: Returned null/undefined data");
        }

    } catch (error) {
        console.error("❌ CRITICAL EXCEPTION:", error);
        if (error instanceof Error) {
            console.error("Msg:", error.message);
            console.error("Stack:", error.stack);
        }
    }
    console.log(">>> SCRIPT END");
}

runTest();
