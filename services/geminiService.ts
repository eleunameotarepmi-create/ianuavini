
import { GoogleGenAI, Type } from "@google/genai";
import { Wine, MenuItem, Winery, GlossaryItem } from "../types";
import { AIS_PAIRING_RULES } from "./ais_rules";

// Note: To follow guidelines, we instantiate GoogleGenAI inside each function 
// to ensure the most up-to-date API key from the environment/dialog is used.

// Helper to get API Key safely in both Browser (Vite) and Node (Test)
const getApiKey = () => {
  // @ts-ignore
  return import.meta.env?.VITE_GOOGLE_AI_API_KEY || import.meta.env?.VITE_API_KEY || process.env.API_KEY || process.env.VITE_GOOGLE_AI_API_KEY;
};

// Read selected Gemini model from Admin panel (stored in localStorage)
const getSelectedGeminiModel = () => {
  try {
    return localStorage.getItem('ianua_gemini_model') || 'gemini-2.5-flash';
  } catch {
    return 'gemini-2.5-flash';
  }
};

// Per-function AI provider getters (each reads its own localStorage key)
type AiProvider = 'gemini' | 'openrouter' | 'openai';
const getProviderFor = (key: string): AiProvider => {
  try {
    return (localStorage.getItem(key) as AiProvider) || 'gemini';
  } catch {
    return 'gemini';
  }
};

export const getChatProvider = () => getProviderFor('ianua_chat_provider');
export const getScanProvider = () => getProviderFor('ianua_scan_provider');
export const getPairingProvider = () => getProviderFor('ianua_pairing_provider');
export const getImportProvider = () => getProviderFor('ianua_import_provider');
export const getAdminChatProvider = () => getProviderFor('ianua_admin_chat_provider');
// Legacy alias for backward compatibility
export const getAiProvider = getChatProvider;

export async function getWineAdvice(query: string, wines: Wine[], menu: MenuItem[] = [], mode: 'poeta' | 'tecnico' = 'poeta', wineries: import('../types').Winery[] = []) {
  const wineContext = wines.map(w => {
    const winery = wineries.find(win => win.id === w.wineryId);
    return `• ${w.name} (${winery?.name || 'Cantina sconosciuta'}) - Vitigno: ${w.grapes}${w.description ? ` - ${w.description}` : ''}${w.pairing ? ` - Abbinamenti Generali: ${w.pairing}` : ''}${w.ianuaPairings?.length ? ` - Abbinamenti IANUA: ${w.ianuaPairings.map(p => p.dishId).join(', ')}` : ''}${w.temperature ? ` - Temp: ${w.temperature}` : ''}`;
  }).join('\n');

  const wineryContext = wineries.map(w =>
    `• ${w.name} (${w.location || 'Valle d\'Aosta'})${w.description ? `: ${w.description}` : ''}${w.curiosity ? ` | Curiosità: ${w.curiosity}` : ''}`
  ).join('\n');

  const menuContext = menu.map(m =>
    `• ${m.name} (${m.category}) - ${m.description || ''}${m.price ? ` - €${m.price}` : ''}`
  ).join('\n');

  const fullContext = `
=== LA NOSTRA CARTA DEI VINI ===
${wineContext || 'Nessun vino in carta al momento.'}

=== LE NOSTRE CANTINE ===
${wineryContext || 'Nessuna cantina registrata.'}

=== IL NOSTRO MENU ===
${menuContext || 'Menu non disponibile.'}
`;

  const systemInstructions = {
    poeta: `You are the Master Sommelier of IANUA Restaurant in the Aosta Valley, Italy.
      The restaurant features an exceptional wine selection from both Valle d'Aosta and Piemonte.

      CRITICAL - LANGUAGE DETECTION:
      - Detect the language of the user's message (Italian, English, or French).
      - ALWAYS respond in THE SAME LANGUAGE the user wrote in.

      YOUR KNOWLEDGE BASE:
      ${fullContext}

      PAIRING RULES (STRICTLY FOLLOW THE "AIS METHOD"):
      ${AIS_PAIRING_RULES}

      BOTTLE SIZE KNOWLEDGE (CRITICAL):
      - 0.375L (Mezza): Evolution Rapide, Tasting, Intimate.
      - 0.75L (Standard): Perfect Balance.
      - 1.5L (Magnum): Slow Evolution, Thermal Inertia, Celebration.

      RESPONSE RULES:
      - When the user asks about a DISH: recommend at least 3 wines from your knowledge base and explain WHY each pairs well with that specific dish (acidity, structure, aromas, contrast/concordance).
      - Focus on the pairing reasoning for the dish asked — do NOT list other dishes those wines go with.
      - When the user asks about a WINE: describe it and suggest what dishes from the menu pair well.
      - Always recommend wines that are actually in your knowledge base.

      YOUR STYLE:
      - You are a POET of wine. Speak with passion, culture, and sensory imagery.
      - Describe wines as if telling a story: the terroir, the winemaker's philosophy, the emotion in the glass.
      - Use evocative, literary language — paint pictures with colors, aromas, textures, and memories.
      - Connect each wine to its land, its history, its soul.
      - Prefer flowing, narrative prose over technical bullet-point lists.
      - Keep the tone warm, intimate, and deeply knowledgeable.`,
    tecnico: `You are the Technical Sommelier of IANUA Restaurant in the Aosta Valley, Italy.
      The restaurant features wines from both Valle d'Aosta and Piemonte.

      CRITICAL - LANGUAGE DETECTION:
      - Detect the language of the user's message (Italian, English, or French).
      - ALWAYS respond in THE SAME LANGUAGE the user wrote in.

      YOUR KNOWLEDGE BASE:
      ${fullContext}

      PAIRING RULES (STRICTLY FOLLOW THE "AIS METHOD"):
      ${AIS_PAIRING_RULES}

      RESPONSE RULES:
      - When the user asks about a DISH: recommend at least 3 wines from your knowledge base and explain WHY each pairs well with that specific dish (acidity, structure, aromas, contrast/concordance).
      - Focus on the pairing reasoning for the dish asked — do NOT list other dishes those wines go with.
      - When the user asks about a WINE: describe it and suggest what dishes from the menu pair well.
      - Always recommend wines that are actually in your knowledge base.

      YOUR STYLE:
      - Be precise, informative, and data-driven.
      - Cover wines from both Valle d'Aosta and Piemonte when relevant.
      - Always include: grape variety, ideal temperature, recommended pairing.`
  };

  const provider = getChatProvider();

  // Route through OpenRouter if selected
  if (provider === 'openrouter') {
    const { callOpenRouter } = await import('./openRouterService');
    const selectedModel = localStorage.getItem('ianua_openrouter_model') || 'google/gemini-3-flash-preview';
    return callOpenRouter(query, selectedModel as any, systemInstructions[mode]);
  }

  // Route through OpenAI if selected
  if (provider === 'openai') {
    const { generateCompletionOpenAI } = await import('./openaiService');
    const selectedModel = localStorage.getItem('ianua_openai_model') || 'gpt-4o-mini';
    return generateCompletionOpenAI(query, selectedModel as any, systemInstructions[mode]);
  }

  // Default: Gemini
  const ai = new GoogleGenAI({ apiKey: getApiKey() });
  const response = await ai.models.generateContent({
    model: getSelectedGeminiModel(),
    contents: query,
    config: {
      systemInstruction: systemInstructions[mode],
      temperature: mode === 'poeta' ? 0.7 : 0.3,
    }
  });

  return response.text;
}

export async function getPerfectPairing(dish: MenuItem, wines: Wine[], wineries: Winery[], language: 'it' | 'en' | 'fr' = 'it') {
  const dishName = language === 'en' ? dish.name_en || dish.name : language === 'fr' ? dish.name_fr || dish.name : dish.name;
  const dishDesc = language === 'en' ? dish.description_en || dish.description : language === 'fr' ? dish.description_fr || dish.description : dish.description;

  // STABILITY: Sort context alphabetically by ID to ensure identical prompt for identical data
  const sortedWines = [...wines].sort((a, b) => a.id.localeCompare(b.id));
  const sortedWineries = [...wineries].sort((a, b) => a.id.localeCompare(b.id));

  const wineContext = sortedWines.map(w => {
    const winery = sortedWineries.find(win => win.id === w.wineryId);
    // CRITICAL: Restore Pairing field for Producer Match
    return `ID: ${w.id} | Nome: ${w.name} | Cantina: ${winery?.name || 'Sconosciuta'} | Vitigni: ${w.grapes} | Tipo: ${w.type} | Alcol: ${w.alcohol || 'N/A'} | Altitudine: ${w.altitude ? w.altitude + 'm' : 'N/A'} | Temp: ${w.temperature || 'N/A'} | Abbinamenti Produttore: ${w.pairing || 'NESSUNO'} | Abbinamenti IANUA (IDs): ${w.ianuaPairings?.map(p => p.dishId).join(', ') || 'NESSUNO'} | Descrizione: ${w.description || 'NESSUNA'} | Curiosità: ${w.curiosity || 'Nessuna'}`;
  }).join('\n');

  const prompt = `
    AGISCI COME MASTER SOMMELIER IANUA (AIS-RE-2026).
    IL TUO OBIETTIVO: 100% di precisione basata ESCLUSIVAMENTE sui dati forniti.

    DISH: "${dishName}"
    DESCRIZIONE: ${dishDesc || 'Nessuna descrizione disponibile.'}
    CATEGORIA: ${dish.category}

    WINE LIST (1000+ ETICHETTE):
    ${wineContext}

    MANUALE TECNICO (PRINCIPI CHIMICI):
    ${AIS_PAIRING_RULES}

    REGOLE DI ABBINAMENTO (PRIORITÀ ASSOLUTA ALLE SCHEDE):
    1. MATCH DIRETTO IANUA (SUPREMO): Se l'id del piatto è presente in "Abbinamenti IANUA (IDs)", questo vino è la scelta PRIORITARIA (Score 100). Indica nella justification che è un abbinamento approvato IANUA.
    2. MATCH PRODUTTORE (ALTO): Se il campo "Abbinamenti Produttore" del vino cita il piatto (es. "Lardo", "Fontina"), questo vino è un'ottima scelta (Score 95).
    3. MATCH PER CATEGORIA (LOGICA):
       - "Lardo" = "Salumi/Affettati".
       - "Cervo/Camoscio" = "Selvaggina".
       - "Carbonada" = "Carni Rosse/Brasati".
       - Se il produttore dice "Salumi", e il piatto è "Lardo", è un MATCH (Score 90).
    3. SEGNALAZIONE DATI MANCANTI (OBBLIGATORIO): 
       - Scansiona TUTTI i vini. Se un vino ha "Abbinamenti Produttore: NESSUNO" O "Descrizione: NESSUNA", DEVI inserirlo nella lista in fondo.
       - Assegna Label: "DATI MANCANTI".
       - Score: 0.
       - TechnicalDetail: "ATTENZIONE: Scheda tecnica incompleta (Mancano abbinamenti/descrizione). Verificare DB."

    FORMATO JSON (RIGOROSO - ORDINE: MATCH DIRETTI -> CATEGORIA -> DATI MANCANTI):
    [
      {
        "wineId": "string",
        "score": number, 
        "label": "Produttore" | "Sommelier" | "DATI MANCANTI",
        "justification": "Match diretto 'Lardo' trovato nella scheda." OR "Mancano dati abbinamento.",
        "technicalDetail": "Esempio: Il produttore consiglia specificamente questo vino." OR "Scheda parziale."
      }
    ]
  `;

  const provider = getPairingProvider();

  // Route through OpenRouter if selected
  if (provider === 'openrouter') {
    const { callOpenRouter } = await import('./openRouterService');
    const selectedModel = localStorage.getItem('ianua_openrouter_model') || 'google/gemini-3-flash-preview';
    try {
      const text = await callOpenRouter(prompt, selectedModel as any);
      const clean = text.trim().replace(/^```json\s*/, '').replace(/^```\s*/, '').replace(/\s*```$/, '');
      return JSON.parse(clean);
    } catch (e) { console.error('OpenRouter pairing error:', e); return []; }
  }

  // Route through OpenAI if selected
  if (provider === 'openai') {
    const { callOpenAI } = await import('./openaiService');
    const selectedModel = localStorage.getItem('ianua_openai_model') || 'gpt-4o-mini';
    try {
      const text = await callOpenAI(prompt, selectedModel as any);
      const clean = text.trim().replace(/^```json\s*/, '').replace(/^```\s*/, '').replace(/\s*```$/, '');
      return JSON.parse(clean);
    } catch (e) { console.error('OpenAI pairing error:', e); return []; }
  }

  // Default: Gemini
  const ai = new GoogleGenAI({ apiKey: getApiKey() });
  const response = await ai.models.generateContent({
    model: getSelectedGeminiModel(),
    contents: prompt,
    config: {
      temperature: 0.0,
      responseMimeType: 'application/json'
    }
  });

  try {
    const text = response.text || '[]';
    let clean = text.trim();
    clean = clean.replace(/^```json\s*/, '').replace(/^```\s*/, '').replace(/\s*```$/, '');
    return JSON.parse(clean) as { wineId: string, justification: string, score: number, label: string, technicalDetail: string }[];
  } catch (e) {
    console.error("Perfect Pairing Parse Error:", e);
    return [];
  }
}

export async function generateText(prompt: string, model: string): Promise<string> {
  const ai = new GoogleGenAI({ apiKey: getApiKey() });
  const response = await ai.models.generateContent({
    model: model,
    contents: prompt,
    config: {
      temperature: 0.7,
    }
  });

  return response.text || "";
}

export async function extractWineryData(fileBase64: string, mimeType: string): Promise<{ winery: Partial<Winery>, wines: Partial<Wine>[], glossary: GlossaryItem[] }> {
  const ai = new GoogleGenAI({ apiKey: getApiKey() });
  const response = await ai.models.generateContent({
    model: getSelectedGeminiModel(),
    contents: [
      {
        inlineData: {
          data: fileBase64.split(',')[1],
          mimeType: mimeType,
        },
      },
      {
        text: `
        Analyze this document and extract winery data into JSON format.
        
        Task:
        1. Identify the Winery Name (usually at the top).
        2. Extract Wines (name, grapes, description, price, etc.).
        3. Extract Glossary terms if present.
        
        Guidelines:
        - Be smart: infer the structure from the layout.
        - Clean Output: Do not include emojis (🍇, 🍷) in the text fields.
        - Language: Keep the original language of the text (Italian).
        `
      },
    ],
    config: {
      temperature: 0.2, // Bassa creatività, alta fedeltà
      responseMimeType: "application/json",
      responseSchema: {
        type: Type.OBJECT,
        properties: {
          winery: {
            type: Type.OBJECT,
            properties: {
              name: { type: Type.STRING },
              location: { type: Type.STRING },
              description: { type: Type.STRING },
              website: { type: Type.STRING },
              curiosity: { type: Type.STRING }
            },
            required: ['name']
          },
          wines: {
            type: Type.ARRAY,
            items: {
              type: Type.OBJECT,
              properties: {
                name: { type: Type.STRING },
                grapes: { type: Type.STRING },
                alcohol: { type: Type.STRING },
                pairing: { type: Type.STRING },
                temperature: { type: Type.STRING },
                description: { type: Type.STRING },
                altitude: { type: Type.NUMBER },
                priceRange: { type: Type.STRING }
              },
              required: ['name'] // REMOVED 'grapes' from required to prevent hallucinations
            }
          },
          glossary: {
            type: Type.ARRAY,
            items: {
              type: Type.OBJECT,
              properties: {
                term: { type: Type.STRING },
                definition: { type: Type.STRING },
                category: { type: Type.STRING, enum: ['Vitigno', 'Tecnica', 'Territorio'] }
              },
              required: ['term', 'definition', 'category']
            }
          }
        },
        required: ['winery', 'wines']
      }
    }
  });

  const text = response.text;
  console.log("RAW AI RESPONSE:", text);
  if (!text) throw new Error("Nessun dato estratto.");

  try {
    return cleanAndParseJson(text); // cleanAndParseJson applies the regex cleaning
  } catch (e) {
    console.error("JSON PARSE ERROR:", e);
    throw new Error("Errore lettura dati.");
  }
}

export async function parseMenuWithAi(text: string): Promise<MenuItem[]> {
  const ai = new GoogleGenAI({ apiKey: getApiKey() });
  const response = await ai.models.generateContent({
    model: getSelectedGeminiModel(),
    contents: `
    COMPITO: Estrai i piatti da questo menu in formato JSON, separando le lingue.
    
    REGOLE:
    1. Se il menu contiene testo in più lingue (Italiano, Inglese, Francese), separalo nei campi appropriati.
    2. Se manca una lingua, lasciala vuota. NON TRADURRE se il testo non è presente nel menu.
    3. Copia i testi ESATTAMENTE come scritti.
    4. NON INVENTARE PIATTI.
    
    MENU:
    ---
    ${text}
    ---
    `,
    config: {
      temperature: 0.1,
      responseMimeType: "application/json",
      responseSchema: {
        type: Type.ARRAY,
        items: {
          type: Type.OBJECT,
          properties: {
            id: { type: Type.STRING },
            category: { type: Type.STRING, enum: ['Antipasti', 'Primi', 'Secondi', 'Dolci', 'Fuori Menu'] },
            price: { type: Type.STRING },

            // Italiano (Default)
            name: { type: Type.STRING },
            description: { type: Type.STRING },

            // English
            name_en: { type: Type.STRING },
            description_en: { type: Type.STRING },

            // French
            name_fr: { type: Type.STRING },
            description_fr: { type: Type.STRING }
          },
          required: ['id', 'name', 'category', 'price']
        }
      }
    }
  });
  return JSON.parse(response.text || '[]');
}

export async function generateGlossaryFromWines(wines: Wine[], wineries: Winery[]): Promise<GlossaryItem[]> {
  const ai = new GoogleGenAI({ apiKey: getApiKey() });

  // Costruiamo un contesto ricco per l'AI
  const contextData = `
    VINI DEL TERRITORIO:
    ${wines.map(w => `- ${w.name} (${w.grapes}): ${w.description}`).join('\n')}
    
    CANTINE E LUOGHI:
    ${wineries.map(w => `- ${w.name} (${w.location}): ${w.description} - Curiosità: ${w.curiosity}`).join('\n')}
  `;

  const response = await ai.models.generateContent({
    model: getSelectedGeminiModel(),
    contents: [
      {
        text: `AGISCI COME UN GLOSSARIO TECNICO.
        Estrai e definisci i termini tecnici presenti ESPLICITAMENTE nel testo fornito.
        
        NON INVENTARE NULLA. Se il termine non è spiegato o deducibile chiaramente, IGNORALO.
        
        DATI:
        ${contextData}`
      }
    ],
    config: {
      temperature: 0.2,
      responseMimeType: "application/json",
      responseSchema: {
        type: Type.ARRAY,
        items: {
          type: Type.OBJECT,
          properties: {
            term: { type: Type.STRING },
            definition: { type: Type.STRING },
            category: { type: Type.STRING, enum: ['Vitigno', 'Tecnica', 'Territorio'] }
          },
          required: ['term', 'definition', 'category']
        }
      }
    }
  });

  const text = response.text || '[]';
  try {
    // Custom parsing for Array response (cleanAndParseJson is for Objects)
    let clean = text.trim();
    clean = clean.replace(/^```json\s*/, '').replace(/^```\s*/, '').replace(/\s*```$/, '');
    const parsed = JSON.parse(clean);
    return Array.isArray(parsed) ? parsed : [];
  } catch (e) {
    console.error("Glossary Generation Parse Error:", e);
    return [];
  }
}

// Helper function to robustly parse JSON AND CLEAN EMOJIS
function cleanAndParseJson(text: string): any {
  let cleanText = text.trim();
  // Remove markdown code blocks if present
  cleanText = cleanText.replace(/^```json\s*/, '').replace(/^```\s*/, '').replace(/\s*```$/, '');

  // Robust extraction: find the first '{' (or '[') and the last '}' (or ']')
  const firstOpenBrace = cleanText.indexOf('{');
  const firstOpenBracket = cleanText.indexOf('[');
  const firstOpen = (firstOpenBrace === -1) ? firstOpenBracket : (firstOpenBracket === -1) ? firstOpenBrace : Math.min(firstOpenBrace, firstOpenBracket);

  const lastCloseBrace = cleanText.lastIndexOf('}');
  const lastCloseBracket = cleanText.lastIndexOf(']');
  const lastClose = Math.max(lastCloseBrace, lastCloseBracket);

  if (firstOpen !== -1 && lastClose !== -1) {
    cleanText = cleanText.substring(firstOpen, lastClose + 1);
  }

  const parsed = JSON.parse(cleanText);

  // GLOBAL EMOJI CLEANER FUNCTION
  const stripEmojis = (str: string) => {
    if (typeof str !== 'string') return str; // Ensure it's a string before processing
    // Covers standard emojis, symbols, and pictographs
    return str.replace(/([\u2700-\u27BF]|[\uE000-\uF8FF]|\uD83C[\uDC00-\uDFFF]|\uD83D[\uDC00-\uDFFF]|[\u2011-\u26FF]|\uD83E[\uDD10-\uDDFF])/g, '').trim();
  };

  let wineryData = parsed.winery || parsed.cantina;
  // Fix: If AI returns a string for winery, convert to object
  if (typeof wineryData === 'string') {
    wineryData = { name: wineryData };
  } else if (typeof wineryData !== 'object' || wineryData === null) {
    wineryData = {};
  }

  // NORMALIZE: Ensure the structure has winery, wines, glossary
  const normalized = {
    winery: wineryData,
    wines: parsed.wines || parsed.vini || [],
    glossary: parsed.glossary || parsed.glossario || []
  };

  // POST-PROCESSING: Sanitize winery fields and clean emojis
  if (normalized.winery) {
    if (normalized.winery.name) {
      normalized.winery.name = stripEmojis(String(normalized.winery.name)).split('\n')[0].substring(0, 100);
    }
    if (normalized.winery.location) {
      normalized.winery.location = stripEmojis(String(normalized.winery.location)).split('\n')[0].substring(0, 50);
    }
    // Description might keep emojis if they are relevant, but usually better to clean
    // normalized.winery.description = stripEmojis(normalized.winery.description); 
  }

  // CLEAN WINES
  if (Array.isArray(normalized.wines)) {
    normalized.wines.forEach((w: any) => {
      if (w.name) w.name = stripEmojis(w.name);
      if (w.grapes) w.grapes = stripEmojis(w.grapes);
      if (w.pairing) w.pairing = stripEmojis(w.pairing);
    });
  }

  return normalized;
}

// NEW: Extract winery data from plain text (user-pasted content)
// REFACTORED: PURE AI APPROACH (Split into Parallel Requests) to avoid token limits
export async function extractWineryDataFromText(rawText: string): Promise<{ winery: Partial<Winery>, wines: Partial<Wine>[], glossary: GlossaryItem[] }> {
  console.log("Starting AI Extraction (Parallel Pure Mode)...");

  try {
    const ai = new GoogleGenAI({ apiKey: getApiKey() });
    const model = getSelectedGeminiModel();
    const config = {
      temperature: 0.1,
      maxOutputTokens: 8192,
      responseMimeType: "application/json"
    };

    // Parallel Request 1: Core Data (Winery + Wines)
    // We ignore glossary here to save output tokens
    const corePromise = ai.models.generateContent({
      model,
      contents: [{
        text: `
          Analyze this text and extract winery data into JSON format.
          IGNORE glossary terms for now, focus on Winery and Wines.
          
          Text:
          ---
          ${rawText}
          ---
          
          Task:
          1. WINERY NAME: Identify it. If missing, use "Sconosciuto".
          2. DESCRIPTION: Extract text between title and wines. This is the winery description.
          3. CURIOSITY: Look for "Curiosità:" regarding the winery.
          4. WINES (CRITICAL): Search for the section "Vini proposti da Ianua".
             For EACH wine listed there, you MUST extract:
             - Name (e.g. "Chambave Muscat")
             - Grapes (Value after "Vitigno:" or "100%...")
             - Description (The block of text starting with ">" or italicized notes under the wine name)
             - Pairing (Value after "Abbinamenti:")
             - Temperature (Value after "Temperatura di servizio:")
             - Altitude (Value after "Zona di produzione:" or in the text)
          
          Guidelines:
          - EXTRACT ALL DETAILS. Do not skip fields.
          - "Olfatto" + "Gusto" -> can be combined into 'description' if specific description is missing.
          - Clean Output: No emojis.
          - Language: Italian.
      `}],
      config: {
        ...config,
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            winery: {
              type: Type.OBJECT,
              properties: {
                name: { type: Type.STRING },
                location: { type: Type.STRING },
                description: { type: Type.STRING },
                website: { type: Type.STRING },
                curiosity: { type: Type.STRING }
              }
            },
            wines: {
              type: Type.ARRAY,
              items: {
                type: Type.OBJECT,
                properties: {
                  name: { type: Type.STRING },
                  grapes: { type: Type.STRING },
                  alcohol: { type: Type.STRING },
                  pairing: { type: Type.STRING },
                  temperature: { type: Type.STRING },
                  description: { type: Type.STRING },
                  altitude: { type: Type.NUMBER },
                  priceRange: { type: Type.STRING }
                },
                required: ['name', 'grapes', 'description', 'pairing'] // ENFORCE EXTRACTION
              }
            }
          },
          required: ['winery', 'wines']
        }
      }
    });

    // Parallel Request 2: Glossary Only
    // We extract ONLY glossary here, ignoring wine details
    const glossaryPromise = ai.models.generateContent({
      model,
      contents: [{
        text: `
          Analyze this text and extract ONLY Glossary terms.
          Ignore wines and winery details.
          
          Text:
          ---
          ${rawText}
          ---
          
          Task:
          1. Extract Glossary terms (definitions, tables, technical terms).
      `}],
      config: {
        ...config,
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            glossary: {
              type: Type.ARRAY,
              items: {
                type: Type.OBJECT,
                properties: {
                  term: { type: Type.STRING },
                  definition: { type: Type.STRING },
                  category: { type: Type.STRING, enum: ['Vitigno', 'Tecnica', 'Territorio'] }
                }
              }
            }
          },
          required: ['glossary']
        }
      }
    });

    // Wait for both with individual error handling (Safe Mode)
    const [coreResult, glossaryResult] = await Promise.allSettled([corePromise, glossaryPromise]);

    let merged = {
      winery: { name: "Sconosciuto" },
      wines: [] as Partial<Wine>[],
      glossary: [] as GlossaryItem[]
    };

    // Handle Core Result
    if (coreResult.status === 'fulfilled') {
      try {
        const coreResponse = coreResult.value;
        // In @google/genai, usually .text is valid on GenerateContentResponse
        // BUT relying on property access avoids linter/transpiler issues with getter invocations
        const coreText = coreResponse.text || "";

        console.log("Core RAW Text Length:", coreText?.length);
        console.log("FULL CORE RESPONSE:", coreText); // DEBUGGING
        const coreParsed = cleanAndParseJson(coreText);
        merged.winery = coreParsed.winery || { name: "Sconosciuto" };
        merged.wines = coreParsed.wines || [];
        console.log("✅ Core Data Extracted:", merged.winery.name, merged.wines.length + " wines");
      } catch (err) {
        console.error("❌ Core Parse Error:", err);
        // Don't throw yet, try to salvage glossary? No, if core fails, we likely have nothing useful.
      }
    } else {
      console.error("❌ Core Promise Rejected:", coreResult.reason);
    }

    // Handle Glossary Result
    if (glossaryResult.status === 'fulfilled') {
      try {
        const glossaryResponse = glossaryResult.value;
        const glossaryText = glossaryResponse.text || "";

        console.log("Glossary RAW Text Length:", glossaryText?.length);
        const glossaryParsed = cleanAndParseJson(glossaryText);
        merged.glossary = glossaryParsed.glossary || [];
        console.log("✅ Glossary Data Extracted:", merged.glossary.length + " terms");
      } catch (err) {
        console.error("⚠️ Glossary Parse Error (Non-fatal):", err);
      }
    } else {
      // Log but allow to continue - glossary is optional
      console.warn("⚠️ Glossary Promise Rejected (Non-fatal):", glossaryResult.reason);
    }

    // Final Safety Checks & Normalization
    if (!merged.winery) merged.winery = { name: "Sconosciuto" };
    if (!merged.winery.name) merged.winery.name = "Sconosciuto";

    // Iterate over wines to ensure no nulls in critical fields
    if (merged.wines) {
      merged.wines.forEach(w => {
        if (!w.name) w.name = "Vino Sconosciuto";
        if (typeof w.altitude === 'string') {
          const altNum = parseInt(w.altitude);
          if (!isNaN(altNum)) w.altitude = altNum;
        }
      });
    }

    // If Core failed completely (rejected or parse error resulted in empty wines/winery), we throw.
    // But if Core succeeded and just found 0 wines (valid), we let it pass but maybe warn.
    if (coreResult.status === 'rejected' && (!merged.wines || merged.wines.length === 0)) {
      throw new Error("Estrazione Core fallita. Impossibile importare.");
    }

    return merged;

  } catch (e: any) {
    console.error("AI Extraction Failed (Top Level):", e);
    throw new Error(`AI Error: ${e.message || "Unknown error"}`);
  }
}

// NEW: Extract glossary terms from plain text
export async function extractGlossaryFromText(rawText: string): Promise<GlossaryItem[]> {
  const ai = new GoogleGenAI({ apiKey: getApiKey() }); // Use safe helper
  const response = await ai.models.generateContent({
    model: getSelectedGeminiModel(),
    contents: [
      {
        text: `
        COMPITO: Estrai termini di glossario tecnicamente validi dal testo.
        NON INVENTARE DEFINIZIONI. Usa quelle presenti nel testo.
        
        INPUT:
        ---
        ${rawText}
        ---
        `
      }
    ],
    config: {
      temperature: 0.1,
      responseMimeType: "application/json",
      responseSchema: {
        type: Type.ARRAY,
        items: {
          type: Type.OBJECT,
          properties: {
            term: { type: Type.STRING },
            definition: { type: Type.STRING },
            category: { type: Type.STRING, enum: ['Vitigno', 'Tecnica', 'Territorio'] }
          },
          required: ['term', 'definition', 'category']
        }
      }
    }
  });

  return cleanAndParseJson(response.text || '[]');
}

// NEW: Identify wine from bottle photo using Gemini Vision
export async function identifyWineFromImage(
  imageBase64: string,
  wines: Wine[],
  wineries: Winery[]
): Promise<{ wineId: string; confidence: number; wineName: string; reasoning: string } | null> {

  // Build wine list grouped by winery for better readability
  const wineryGroups = new Map<string, { wineryName: string; items: { id: string; name: string; grapes: string }[] }>();
  wines.forEach(w => {
    const winery = wineries.find(win => win.id === w.wineryId);
    const wineryName = winery?.name || 'Sconosciuta';
    if (!wineryGroups.has(wineryName)) {
      wineryGroups.set(wineryName, { wineryName, items: [] });
    }
    wineryGroups.get(wineryName)!.items.push({ id: w.id, name: w.name, grapes: w.grapes });
  });

  let wineList = '';
  wineryGroups.forEach(group => {
    wineList += `\nCANTINA: ${group.wineryName}\n`;
    group.items.forEach(w => {
      wineList += `  - ID:"${w.id}" | "${w.name}" | ${w.grapes}\n`;
    });
  });

  const provider = getScanProvider();
  let geminiModel = getSelectedGeminiModel();
  const apiKey = getApiKey();

  // CRITICAL: Image-generation models (Imagen) cannot analyze images.
  // Force a vision-capable model for scan.
  const imageGenModels = ['gemini-3-pro-image-preview', 'imagen-3.0-generate-001', 'imagen-4.0-generate-preview'];
  if (imageGenModels.includes(geminiModel)) {
    console.warn(`⚠️ SCAN: Model "${geminiModel}" is image-generation only, not vision. Switching to gemini-2.5-flash for scan.`);
    geminiModel = 'gemini-2.5-flash';
  }

  console.log('🔍 SCAN CONFIG:', { provider, geminiModel, hasApiKey: !!apiKey, wineCount: wines.length, imageSize: imageBase64.length });

  // If OpenRouter selected, route scan through OpenRouter with image
  if (provider === 'openrouter') {
    const { callOpenRouterWithImage } = await import('./openRouterService');
    const selectedModel = localStorage.getItem('ianua_openrouter_model') || 'google/gemini-3-flash-preview';
    const prompt = `COMPITO: Identifica la bottiglia di vino in questa foto.

STEP 1 — LEGGI L'ETICHETTA:
Osserva attentamente la foto. Cerca di leggere: nome del vino, cantina/produttore, vitigno, denominazione, annata.

STEP 2 — CONFRONTA CON LA NOSTRA CARTA:
${wineList}

STEP 3 — RISPONDI in JSON:
{"wineId": "...", "wineName": "nome dalla nostra carta", "confidence": 0-100, "reasoning": "cosa ho letto e perché ho scelto questo match"}
- confidence 80+ se nome e produttore matchano, 50-79 se solo uno, 0 se non è una bottiglia.`;
    try {
      console.log('🔍 SCAN: Sending image to OpenRouter...', selectedModel);
      const text = await callOpenRouterWithImage(prompt, imageBase64, selectedModel as any);
      console.log('🔍 SCAN OpenRouter response:', text);
      const result = JSON.parse(text.replace(/```json?\n?/g, '').replace(/```/g, '').trim());
      if (result.confidence >= 20 && result.wineId) {
        const matchedWine = wines.find(w => w.id === result.wineId);
        if (matchedWine) return { wineId: result.wineId, wineName: result.wineName || matchedWine.name, confidence: result.confidence, reasoning: result.reasoning || '' };
      }
      console.log('❌ SCAN OpenRouter: No match. Confidence:', result.confidence);
      return null;
    } catch (e: any) {
      console.error('❌ OpenRouter scan error:', e);
      throw new Error(`OpenRouter scan: ${e.message}`);
    }
  }

  // Default: Gemini with vision
  if (!apiKey) {
    throw new Error('Gemini API key mancante. Controlla .env');
  }

  console.log('🔍 SCAN: Sending image to Gemini...', geminiModel, wines.length, 'wines from', wineryGroups.size, 'wineries');

  try {
    const ai = new GoogleGenAI({ apiKey });

    const response = await ai.models.generateContent({
      model: geminiModel,
      contents: [
        {
          inlineData: {
            data: imageBase64.includes(',') ? imageBase64.split(',')[1] : imageBase64,
            mimeType: 'image/jpeg',
          },
        },
        {
          text: `COMPITO: Identifica la bottiglia di vino in questa foto.

STEP 1 — LEGGI L'ETICHETTA:
Osserva attentamente la foto. Cerca di leggere:
- Nome del vino (spesso in grande sull'etichetta)
- Nome della cantina/produttore
- Vitigno o denominazione (DOC, DOCG, AOC, ecc.)
- Annata (anno)

STEP 2 — CONFRONTA CON LA NOSTRA CARTA:
${wineList}

STEP 3 — RISPONDI:
- Se trovi un match nella carta, anche parziale (es. stesso produttore + tipo simile), indica il wineId.
- "confidence": 80+ se nome e produttore matchano. 50-79 se solo uno matcha. 30-49 se incerto. 0 se non è una bottiglia o non si legge.
- Nel "reasoning", spiega COSA hai letto nell'etichetta e perché hai scelto quel match.
- In "wineName", metti il nome come appare NELLA NOSTRA CARTA (non quello letto dall'etichetta).`
        },
      ],
      config: {
        temperature: 0.1,
        responseMimeType: 'application/json',
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            wineId: { type: Type.STRING },
            wineName: { type: Type.STRING },
            confidence: { type: Type.NUMBER },
            reasoning: { type: Type.STRING }
          },
          required: ['wineId', 'wineName', 'confidence', 'reasoning']
        }
      }
    });

    const text = response.text || '{}';
    console.log('🔍 SCAN RAW RESPONSE:', text);
    const result = JSON.parse(text);
    console.log('🔍 SCAN PARSED:', { wineId: result.wineId, wineName: result.wineName, confidence: result.confidence, reasoning: result.reasoning?.substring(0, 150) });

    if (result.confidence >= 20 && result.wineId) {
      const matchedWine = wines.find(w => w.id === result.wineId);
      if (matchedWine) {
        console.log('✅ SCAN MATCH:', matchedWine.name, 'confidence:', result.confidence);
        return {
          wineId: result.wineId,
          wineName: result.wineName || matchedWine.name,
          confidence: result.confidence,
          reasoning: result.reasoning || ''
        };
      } else {
        console.warn('⚠️ SCAN: wineId not found in DB:', result.wineId);
      }
    } else {
      console.log('❌ SCAN: No match. Confidence:', result.confidence, 'Reasoning:', result.reasoning);
    }
    return null;
  } catch (e: any) {
    console.error('❌ Gemini scan error:', e);
    throw new Error(`Gemini scan (${geminiModel}): ${e.message || e}`);
  }
}

// NEW: Translate Italian text to English and French
export async function translateToLanguages(
  italianText: string,
  context: string = 'winery/wine content',
  model: string = 'gemini-2.5-flash-preview-05-20'
): Promise<{ en: string, fr: string }> {
  if (!italianText || italianText.trim().length === 0) {
    return { en: '', fr: '' };
  }

  const ai = new GoogleGenAI({ apiKey: getApiKey() });
  const response = await ai.models.generateContent({
    model: model,
    contents: `
      Translate the following Italian text about ${context} into English and French.
      Keep the same tone and style. Be accurate and natural.
      
      ITALIAN TEXT:
      "${italianText}"
      
      Return ONLY a JSON object with "en" and "fr" keys.
    `,
    config: {
      temperature: 0.3,
      responseMimeType: 'application/json',
      responseSchema: {
        type: Type.OBJECT,
        properties: {
          en: { type: Type.STRING },
          fr: { type: Type.STRING }
        },
        required: ['en', 'fr']
      }
    }
  });

  try {
    const result = JSON.parse(response.text || '{}');
    return {
      en: result.en || '',
      fr: result.fr || ''
    };
  } catch (e) {
    console.error('Translation parse error:', e);
    return { en: '', fr: '' };
  }
}