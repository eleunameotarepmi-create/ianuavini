import { generateText } from './geminiService';
import { generateCompletion, OpenRouterModel } from './openRouterService';
import { generateCompletionOpenAI, OpenAIModel } from './openaiService';
import { Wine, Winery, MenuItem, GlossaryItem } from '../types';

export interface AgentAction {
  type: 'DRAFT_WINE' | 'DRAFT_MENU' | 'BULK_MENU' | 'DRAFT_WINERY' | 'TRANSLATE_PREVIEW' | 'LEARN_RULE' | 'UPDATE_WINES' | 'UPDATE_MENU' | 'ANALYSIS' | 'NONE';
  data?: any;
}

export interface AgentResponse {
  message: string;
  action: AgentAction;
}

export interface DatabaseContext {
  wines: Wine[];
  wineries: Winery[];
  menu: MenuItem[];
  glossary: GlossaryItem[];
}

// Simple in-memory storage for rules (in a real app, use Firestore)
export const getAgentRules = (): string[] => {
  try {
    const rules = localStorage.getItem('ianua_agent_rules');
    return rules ? JSON.parse(rules) : [];
  } catch {
    return [];
  }
}

export const saveAgentRule = (rule: string) => {
  const rules = getAgentRules();
  if (!rules.includes(rule)) {
    rules.push(rule);
    localStorage.setItem('ianua_agent_rules', JSON.stringify(rules));
  }
}

// Build a compact snapshot of the database for the AI to reason about
function buildDatabaseSnapshot(db: DatabaseContext): string {
  const wineryMap = new Map(db.wineries.map(w => [w.id, w.name]));

  // Compact wine list: name | winery | grapes | sensoryProfile (if exists) | description snippet
  const wineLines = db.wines
    .filter(w => !w.hidden)
    .map(w => {
      const winery = wineryMap.get(w.wineryId) || '?';
      const profile = w.sensoryProfile ? ` | Profilo: "${w.sensoryProfile}"` : ' | Profilo: MANCANTE';
      const desc = w.description ? ` | Desc: "${w.description.slice(0, 80)}..."` : '';
      const pairings = w.ianuaPairings?.length ? ` | Abbinamenti: ${w.ianuaPairings.length}` : ' | Abbinamenti: 0';
      return `  - [${w.id}] ${w.name} | ${winery} | ${w.grapes}${profile}${pairings}${desc}`;
    })
    .join('\n');

  const wineryLines = db.wineries
    .map(w => {
      const wineCount = db.wines.filter(wi => wi.wineryId === w.id && !wi.hidden).length;
      const hasDesc = w.description ? 'SÌ' : 'NO';
      return `  - [${w.id}] ${w.name} (${w.location}) | ${wineCount} vini | Descrizione: ${hasDesc}`;
    })
    .join('\n');

  const menuLines = db.menu
    .filter(m => !m.hidden)
    .map(m => `  - [${m.id}] ${m.name} (${m.category}) ${m.price}€`)
    .join('\n');

  return `
===== DATABASE ATTUALE =====
CANTINE (${db.wineries.length}):
${wineryLines}

VINI (${db.wines.filter(w => !w.hidden).length} visibili):
${wineLines}

MENU (${db.menu.filter(m => !m.hidden).length} piatti):
${menuLines}
===========================`;
}

const BASE_SYSTEM_PROMPT = `
You are the "Centrale Operativa" (Admin Agent) for Ianua Vini, a luxury wine & food app.
You are an EXPERT SOMMELIER and DATABASE MANAGER with FULL ACCESS to the real data.
You are INTELLIGENT, TEACHABLE, and MEMORY-DRIVEN.
You can READ, ANALYZE, and MODIFY the entire wine database.

YOUR GOAL:
1.  **Analyze** the user's input AND the DATABASE provided to you.
2.  **Detect Intent**:
    *   **Bulk Menu Import**: When user pastes MULTIPLE menu items. Intent: 'BULK_MENU'.
    *   **Add/Draft Single Menu Item**: One dish. Intent: 'DRAFT_MENU'.
    *   **Add/Draft Wine**: Wine info. Intent: 'DRAFT_WINE'.
    *   **Add/Draft Winery**: Winery info. Intent: 'DRAFT_WINERY'.
    *   **Update Wines**: User asks to modify, fix, generate, or improve data for EXISTING wines (sensory profiles, descriptions, pairings, etc.). Intent: 'UPDATE_WINES'. Return the updated wine objects.
    *   **Update Menu**: User asks to modify existing menu items. Intent: 'UPDATE_MENU'. Return the updated menu items.
    *   **Analyze/Report**: User asks to analyze data, find problems, compare, report stats. Intent: 'ANALYSIS'. Return findings in message.
    *   **Translate**: ONLY when user EXPLICITLY asks to translate. Intent: 'TRANSLATE_PREVIEW'.
    *   **Learn Rule**: The user is teaching you a new rule. Intent: 'LEARN_RULE'.
    *   **Chat**: General question. Intent: 'NONE'.

3.  **Respond in JSON** format strictly.

**CRITICAL: JSON Schema:**
{
  "message": "A friendly, professional response in Italian. Be concise but informative.",
  "action": {
    "type": "UPDATE_WINES" | "UPDATE_MENU" | "ANALYSIS" | "BULK_MENU" | "DRAFT_MENU" | "DRAFT_WINE" | "DRAFT_WINERY" | "TRANSLATE_PREVIEW" | "LEARN_RULE" | "NONE",
    "data": { ...relevant data... }
  }
}

=== UPDATE_WINES ACTION ===
When the user asks to modify existing wines (add sensory profiles, update descriptions, fix pairings, etc.):
- data must be an ARRAY of partial wine updates: [{ "id": "existing_wine_id", ...fields to update... }]
- ONLY include the wine ID and the fields being changed
- Use REAL wine IDs from the database snapshot
- Write in Italian unless asked otherwise
- Be a wine EXPERT: sensory profiles should be technically accurate based on grape variety, region, altitude, winemaking style

Example: User says "genera i profili sensoriali dei vini di Caves Coopératives de Donnas"
{
  "message": "Ho generato i profili sensoriali per i 4 vini di Donnas...",
  "action": {
    "type": "UPDATE_WINES",
    "data": [
      { "id": "wine_123", "sensoryProfile": "Rubino con riflessi granato. Naso di viola, piccoli frutti rossi e spezie dolci. Palato elegante con tannini setosi, buona acidità e finale minerale persistente." },
      { "id": "wine_456", "sensoryProfile": "Paglierino intenso. Profumi di mela golden, fiori di campo e note minerali. Bocca fresca con buona struttura e chiusura sapida." }
    ]
  }
}

=== ANALYSIS ACTION ===
When analyzing data, return findings ONLY in the message. Action data can contain stats.
Example: "Quali vini non hanno profilo sensoriale?"
{
  "message": "Ci sono 45 vini senza profilo sensoriale su 199...",
  "action": { "type": "ANALYSIS", "data": { "missing_profiles": 45, "total": 199 } }
}

=== UPDATE_MENU ACTION ===
data is an array of partial menu item updates: [{ "id": "menu_id", ...fields to update... }]

=== MENU IMPORT (BULK_MENU / DRAFT_MENU) ===
**LANGUAGE DETECTION**: Detect if input is Italian, English, or French.
  - If **English**: 'name' and 'description' MUST be translated to ITALIAN. Originals go in name_en, description_en.
  - If **French**: Same but into name_fr, description_fr.
  - If **Italian**: Populate 'name', 'description' directly.

For BULK_MENU, data = { "detected_language": "it"|"en"|"fr", "items": [...] }
Each item: { name, category, price, description, name_en?, desc_en?, name_fr?, desc_fr? }

Categories: Antipasti, Primi, Secondi, Dolci, Fuori Menu.

=== RULES ===
- ALWAYS use the REAL wine/winery/menu IDs from the database
- Write sensory profiles as a professional sommelier would
- When generating profiles, consider: grape variety, altitude, territory, winemaking style
- Be proactive: if user says "sistema i profili" without specifying which wines, do ALL wines that are missing profiles
- Maximum 30 wines per UPDATE_WINES action to avoid token overflow
- ALWAYS respond in Italian unless explicitly asked otherwise
`;

export async function processUserIntent(
  userInput: string,
  provider: 'gemini' | 'openrouter' | 'openai',
  model: string,
  chatHistory: { role: 'user' | 'assistant', content: string }[] = [],
  dbContext?: DatabaseContext
): Promise<AgentResponse> {
  try {
    // 1. Fetch User Rules
    const userRules = getAgentRules();
    const rulesText = userRules.length > 0
      ? `\n\n**USER DESIGNED RULES (MUST FOLLOW):**\n${userRules.map((r, i) => `${i + 1}. ${r}`).join('\n')}`
      : "";

    // 2. Format History (Last 5 messages for context)
    const recentHistory = chatHistory.slice(-5).map(msg =>
      `${msg.role === 'user' ? 'User' : 'Agent'}: ${msg.content}`
    ).join('\n');

    const historyContext = recentHistory ? `\n\n**CONVERSATION HISTORY:**\n${recentHistory}` : "";

    // 3. Build database snapshot if available
    const dbSnapshot = dbContext ? buildDatabaseSnapshot(dbContext) : "\n(Nessun dato database disponibile)";

    const fullPrompt = `${BASE_SYSTEM_PROMPT}${rulesText}\n\n${dbSnapshot}${historyContext}\n\n**User Input:** "${userInput}"\n\n**Response (JSON):**`;

    let rawResponse = '';

    if (provider === 'gemini') {
      const result = await generateText(fullPrompt, model);
      rawResponse = result;
    } else if (provider === 'openai') {
      const result = await generateCompletionOpenAI(fullPrompt, model as OpenAIModel);
      rawResponse = result;
    } else {
      const result = await generateCompletion(fullPrompt, model as OpenRouterModel);
      rawResponse = result;
    }

    const jsonString = rawResponse.replace(/```json\n?|\n?```/g, '').trim();

    try {
      const parsed: AgentResponse = JSON.parse(jsonString);

      // If the AI detected a new rule to learn, save it immediately
      if (parsed.action.type === 'LEARN_RULE' && typeof parsed.action.data === 'string') {
        saveAgentRule(parsed.action.data);
        return {
          message: parsed.message,
          action: { type: 'NONE' }
        };
      }

      return parsed;
    } catch (e) {
      console.error("Failed to parse JSON from AI:", rawResponse);
      // Try to extract a message if JSON parsing failed
      const msgMatch = rawResponse.match(/"message"\s*:\s*"([^"]+)"/);
      return {
        message: msgMatch ? msgMatch[1] : "Non ho capito perfettamente. Puoi riformulare?",
        action: { type: 'NONE' }
      };
    }

  } catch (error) {
    console.error("AI Agent Error:", error);
    return {
      message: "Errore di connessione.",
      action: { type: 'NONE' }
    };
  }
}
