/**
 * OpenAI Service - Direct OpenAI API integration
 * Uses the OpenAI Chat Completions API
 */

// Available OpenAI models
export const OPENAI_MODELS = {
    'gpt-4o': { name: 'GPT-4o' },
    'gpt-4o-mini': { name: 'GPT-4o Mini' },
    'gpt-4-turbo': { name: 'GPT-4 Turbo' },
    'gpt-3.5-turbo': { name: 'GPT-3.5 Turbo' },
    'o1': { name: 'o1' },
    'o1-mini': { name: 'o1 Mini' },
    'o3-mini': { name: 'o3 Mini' },
} as const;

export type OpenAIModel = keyof typeof OPENAI_MODELS;

const getOpenAIApiKey = (): string => {
    // Check localStorage first (set via admin panel), then env
    try {
        const stored = localStorage.getItem('ianua_openai_api_key');
        if (stored) return stored;
    } catch { /* ignore */ }
    // @ts-ignore
    return import.meta.env?.VITE_OPENAI_API_KEY || '';
};

interface OpenAIResponse {
    choices: {
        message: {
            content: string;
        };
    }[];
}

/**
 * Call OpenAI Chat Completions API
 */
export async function callOpenAI(
    prompt: string,
    model: OpenAIModel = 'gpt-4o-mini',
    systemPrompt?: string
): Promise<string> {
    const apiKey = getOpenAIApiKey();

    if (!apiKey) {
        throw new Error('OpenAI API key not found. Set it in the Admin Panel settings.');
    }

    const messages: { role: 'system' | 'user'; content: string }[] = [];

    if (systemPrompt) {
        messages.push({ role: 'system', content: systemPrompt });
    }

    messages.push({ role: 'user', content: prompt });

    const response = await fetch('https://api.openai.com/v1/chat/completions', {
        method: 'POST',
        headers: {
            'Authorization': `Bearer ${apiKey}`,
            'Content-Type': 'application/json',
        },
        body: JSON.stringify({
            model,
            messages,
            temperature: 0.3,
        })
    });

    if (!response.ok) {
        const error = await response.text();
        throw new Error(`OpenAI API error: ${error}`);
    }

    const data: OpenAIResponse = await response.json();
    return data.choices[0]?.message?.content || '';
}

export const generateCompletionOpenAI = callOpenAI;

/**
 * Translate text using OpenAI
 */
export async function translateWithOpenAI(
    italianText: string,
    context: string = 'winery/wine content',
    model: OpenAIModel = 'gpt-4o-mini'
): Promise<{ en: string; fr: string }> {
    if (!italianText || italianText.trim().length === 0) {
        return { en: '', fr: '' };
    }

    const prompt = `
    Translate the following Italian text about ${context} into English and French.
    Keep the same tone and style. Be accurate and natural.
    
    ITALIAN TEXT:
    "${italianText}"
    
    Return ONLY a valid JSON object with "en" and "fr" keys, no markdown:
    {"en": "...", "fr": "..."}
  `;

    try {
        console.log(`[OpenAI] Translating... Model: ${model}, Context: ${context}`);
        const result = await callOpenAI(prompt, model);
        console.log('[OpenAI] Raw Response:', result);

        // Parse JSON from response (handle potential markdown wrapping)
        let jsonStr = result.trim();
        if (jsonStr.startsWith('```')) {
            jsonStr = jsonStr.replace(/```json?\n?/g, '').replace(/```/g, '').trim();
        }

        const parsed = JSON.parse(jsonStr);
        console.log('[OpenAI] Parsed:', parsed);

        return {
            en: parsed.en || '',
            fr: parsed.fr || ''
        };
    } catch (e) {
        console.error('OpenAI translation error:', e);
        return { en: '', fr: '' };
    }
}
