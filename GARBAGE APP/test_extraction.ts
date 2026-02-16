
import { extractWineryDataFromText } from './services/geminiService';
import * as dotenv from 'dotenv';
dotenv.config();

const sampleText = `
🍇 PRIOD – VIGNAIOLI DI ISSOGNE

L’azienda Priod nasce nel 1995 per volontà della famiglia Priod, che ha scelto di recuperare e coltivare le antiche vigne di famiglia sui pendii assolati di Issogne, nel cuore della Bassa Valle.
I vigneti si trovano tra Arnad e Montjovet, a circa 400–500 metri d’altitudine, con esposizione sud e sud-est.
Le rese sono volutamente contenute — circa 1 kg per pianta — per privilegiare la concentrazione e la purezza del frutto.
La filosofia produttiva è artigianale e naturale: fermentazioni spontanee con lieviti indigeni, nessun diserbante, nessun insetticida, interventi minimi in vigna e in cantina.
La produzione annuale si mantiene intorno alle 5.000 bottiglie, ciascuna espressione autentica della microzona e dell’annata.

💡 Curiosità: Priod è tra i pochi produttori valdostani a praticare una vinificazione completamente naturale, senza additivi e con uso minimo di solfiti, preservando l’integrità originaria del vino.


Vini proposti da Ianua:

🍷 Rouge Tonen – Vin de Table
Rosso secco – 100% Merlot (clone francese)

> Un Merlot valdostano di grande eleganza, vinificato in purezza secondo una filosofia naturale.
Le uve vengono diraspate e fermentano spontaneamente, con una macerazione di 12–14 giorni a 20–23 °C e malolattica entro novembre.
L’affinamento prevede 18 mesi in acciaio e 12 mesi in bottiglia.
Colore: rosso rubino intenso.
Profumo: vinoso, erbaceo e lievemente speziato.
Gusto: asciutto, elegante, con tannino ben integrato e ottima persistenza.
Gradazione alcolica: 14% vol.
Temperatura di servizio: 18–20 °C (decantare 30 minuti).
Abbinamenti: primi piatti saporiti, funghi porcini, carni alla griglia, selvaggina e arrosti.

💡 Curiosità: il nome Tonen in patois richiama un’antica espressione che significa “forte, deciso”, un riferimento al carattere del vino e del vitigno.

🥂 Patri Meo Rosé – Vin de Table
Rosato secco – 100% Merlot (clone francese)

> Un rosé naturale, fruttato e fresco, prodotto in quantità limitatissime.
Le uve vengono pressate a grappolo intero per 5–8 minuti, seguite da decantazione di 24 ore e fermentazione di 15 giorni a temperatura controllata.
L’affinamento avviene per 4 mesi in acciaio, mantenendo integra la fragranza aromatica del frutto.
Produzione: circa 700 bottiglie e 100 magnum (vendemmia 2023).
Colore: arancione chiaro con sfumature salmone.
Profumo: delicatamente fruttato e floreale.
Gusto: asciutto, elegante, con piacevole freschezza e un lieve tannino che gli dona struttura.
Gradazione alcolica: 12,5% vol.
Temperatura di servizio: 5–8 °C.
Abbinamenti: perfetto con pesce, crostacei, carni bianche delicate, antipasti e aperitivi.

💡 Curiosità: il nome Patri Meo è un omaggio familiare, ispirato alla figura del padre (in latino Pater Meus), simbolo delle radici e della continuità della tradizione viticola.

🍷 Bocoueil – Vin de Table
Rosso secco – Nebbiolo 35%, Barbera 31%, Merlot 25%, vitigni autoctoni 9%

> Il Bocoueil è l’espressione più tradizionale e territoriale della cantina, un blend che racconta la complessità dei vigneti di Issogne.
Le uve vengono fermentate in tino di legno, con macerazione di 12–14 giorni a 20–23 °C e malolattica entro novembre.
L’affinamento avviene per 18 mesi in acciaio e 12 mesi in bottiglia.
Colore: rosso rubino intenso.
Profumo: elegante e complesso, con sentori di mandorla, prugna e frutta rossa matura.
Gusto: corposo, armonico e persistente, con un finale leggermente amarognolo.
Gradazione alcolica: 14,5% vol.
Temperatura di servizio: 18–20 °C (decantare 30 minuti).
Abbinamenti: formaggi stagionati, salumi valdostani, lardo di Arnad, capretto al forno, selvaggina, zuppe locali.

💡 Curiosità: “Bocoueil” in dialetto locale significa “boccone” o “bocconata”, un termine conviviale che rimanda al piacere di bere un vino da tavola genuino e saporito.

📍 Priod è una delle voci più pure e indipendenti della viticoltura valdostana: piccola produzione, rispetto totale per la natura e vini che raccontano la verità della terra senza filtri né artifici.

Glossario e Analisi dei Vini – PRIOD / Tecniche di Produzione
I. Terminologia e Tecniche di Produzione 🛠️
| Patois Valdostano | Il dialetto franco-provenzale parlato in Valle d'Aosta. Nomi come Bocoueil (boccone) o Dessus (sopra) derivano da questa lingua. |
| Filosofia Naturale/Artigianale | Approccio produttivo che prevede interventi minimi in vigna e in cantina, senza diserbanti, insetticidi e con un uso minimo di solfiti. Cerca di preservare l'integrità originale del vino. |
| Rese Contenute | Una scelta colturale volta a limitare volontariamente la produzione di uva per singola pianta (circa 1 kg per pianta) per concentrare gli estratti e privilegiare la purezza del frutto. |
`;

async function runTest() {
    console.log("Starting extraction test...");
    try {
        const result = await extractWineryDataFromText(sampleText);
        console.log("Extraction Result:");
        console.log(JSON.stringify(result, null, 2));
    } catch (error) {
        console.error("Test failed:", error);
    }
}

runTest();
