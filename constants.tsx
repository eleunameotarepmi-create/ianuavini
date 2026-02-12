
import { Wine, Winery, MenuItem, GlossaryItem } from './types';

// ============ LIST OF REGIONS in logical order (Bottom -> Up -> Piemonte) ============
// Note: IDs must match what is returned by getRegionIndex/getWineryRegion logic roughly
import { determineWineryRegion, getGlobalAltitude, ALL_REGIONS, getRegionById } from './components/regions/registry';

// ============ LEGACY EXPORTS (Forwarded to Registry) ============
export const WINE_REGIONS = getRegionById('vda')?.zones || [];
export const PIEMONTE_REGIONS = getRegionById('piemonte')?.zones || [];

export const getAltitude = getGlobalAltitude;
export const getWineryRegion = determineWineryRegion;

// Re-export specific maps if needed by other components (or deprecate them)
// For now, we keep the consumers happy by providing expected exports but powered by the registry logic internally if possible,
// OR simply leave them as empty/legacy if no one uses them directly.
// Checking usages: constants.tsx was the logical core. App.tsx uses getWineryRegion.
// WineriesView uses WINE_REGIONS/PIEMONTE_REGIONS.

// We don't need to export REGIONS_MAP or PIEMONTE_MAP if we replace logic inside `getWineryRegion` (which we did in registry.ts).
// So we can remove the hardcoded maps from here entirely to avoid confusion.

export const LOCATION_ALTITUDES: Record<string, number> = {}; // Deprecated in favor of helper
export const REGIONS_MAP = {}; // Deprecated
export const PIEMONTE_MAP = {}; // Deprecated


// Initial Data Placeholders
export const INITIAL_WINES: Wine[] = [];
export const INITIAL_WINERIES: Winery[] = [];
export const INITIAL_MENU: MenuItem[] = [];
export const GLOSSARY_DATA: GlossaryItem[] = [
  { term: "Grassezza", definition: "Sensazione palatale patinosa e vellutata data da grassi solidi (es. lardo, burro, formaggi fusi). Si combatte con acidità (freschezza) o effervescenza.", category: "Tecnica" },
  { term: "Succulenza", definition: "Presenza di liquido in bocca (es. carne al sangue, cotture umide). Richiede alcolicità o tannino per 'asciugare' il palato.", category: "Tecnica" },
  { term: "Sapidità", definition: "Sensazione di salinità. Può collidere con i tannini creando un retrogusto metallico; si bilancia bene con acidità o morbidezza.", category: "Tecnica" },
  { term: "Tendenza Dolce", definition: "Sensazione pastosa data da carboidrati o grassi (es. pane, patate, latte). Richiede acidità o bollicine per ravvivare il palato.", category: "Tecnica" },
  { term: "Tendenza Acida", definition: "Sensazione di pungenza data da pomodoro, limone o aceto. Richiede un vino con acidità pari o superiore per non apparire piatto.", category: "Tecnica" },
  { term: "Persistenza Gusto-Olfattiva (PGO)", definition: "La durata dei sapori e dei profumi in bocca dopo la deglutizione. Piatti complessi richiedono vini con PGO lunga.", category: "Tecnica" },
  { term: "Struttura", definition: "Il 'corpo' del piatto o del vino. L'abbinamento deve avvenire per analogia di peso: piatto strutturato con vino di corpo.", category: "Tecnica" }
];

// Text Constants (Fallbacks if contentTranslations not used or for types)
export const BASSA_VALLE_INTRO = { title: "Ianua", content: "Viaggio..." };
export const HOME_INTRO = { title: "Home", content: "..." };
export const ALTITUDE_QUOTES = ["La montagna insegna il silenzio.", "Più in alto, più l'aria è sottile."];

// === RECOVERED PRIORITY ORDER === (From overwritten file)
export const PRIORITY_ORDER = [
  'societa_agricola_roccia_rossa',
  'orsolani',
  'bersano_vini',
  'michele_chiarlo',
  'marco_canato',
  'gianni_doglia',
  'vigne_marina_coppi',
  'pierfrancesco_gatto',
  'cascina_chicco',
  'fontanafredda',
  'giacomo_borgogno',
  'curto',
  'renato_ratti',
  'vite_colte',
  'casa_e_mirafiore',
  'andrea_oberto',
  'cascina_fontana',
  'giovanni_sordo',
  'agricola_brandini_bio',
  'fracassi_ratti_mentone',
  'scarzello',
  'viglione',
  'principiano_ferdinando',
];
