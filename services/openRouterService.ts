/**
 * OpenRouter Service - Allows using multiple AI models through OpenRouter
 * Supports: Gemini 3, Claude 4, GPT-5, DeepSeek, Mistral, etc.
 */

// Available models on OpenRouter
export const OPENROUTER_MODELS = {
    'google/gemini-3-flash-preview': { name: 'Gemini 3 Flash', free: true },
    'google/gemini-3-pro-preview': { name: 'Gemini 3 Pro', free: true },
    'google/gemini-2.5-flash': { name: 'Gemini 2.5 Flash', free: true },
    'anthropic/claude-sonnet-4': { name: 'Claude Sonnet 4', free: false },
    'anthropic/claude-opus-4.5': { name: 'Claude Opus 4.5', free: false },
    'anthropic/claude-opus-4.6': { name: 'Claude Opus 4.6', free: false },
    'openai/gpt-5.2': { name: 'GPT-5.2', free: false },
    'openai/gpt-5.2-chat': { name: 'GPT-5.2 Chat', free: false },
    'openai/gpt-5.3-codex': { name: 'GPT-5.3 Codex', free: false },
    'deepseek/v3.2': { name: 'DeepSeek V3.2', free: false },
    'deepseek/v3.2:free': { name: 'DeepSeek V3.2 (Free)', free: true },
    'deepseek/v3.1-nex-n1-free': { name: 'DeepSeek V3.1 Nex (Free)', free: true },
    'mistral/large-3-2512': { name: 'Mistral Large 3', free: false },
    'mistral/devstral-2-2512:free': { name: 'Devstral 2 (Free)', free: true },
    'nvidia/nemotron-3-nano-free': { name: 'Nemotron 3 Nano (Free)', free: true },
    'moonshot/kimi-k2.5': { name: 'Kimi K2.5', free: false },
} as const;

export type OpenRouterModel = keyof typeof OPENROUTER_MODELS;

const getOpenRouterApiKey = () => {
    // @ts-ignore
    return import.meta.env?.VITE_OPENROUTER_API_KEY || process.env.VITE_OPENROUTER_API_KEY;
};

interface OpenRouterMessage {
    role: 'user' | 'assistant' | 'system';
    content: string | Array<{ type: string; text?: string; image_url?: { url: string } }>;
}

interface OpenRouterResponse {
    choices: {
        message: {
            content: string;
        };
    }[];
}

/**
 * Call OpenRouter API with any supported model
 */
export async function callOpenRouter(
    prompt: string,
    model: OpenRouterModel = 'google/gemini-3-flash-preview',
    systemPrompt?: string
): Promise<string> {
    const apiKey = getOpenRouterApiKey();

    if (!apiKey) {
        throw new Error('OpenRouter API key not found. Add VITE_OPENROUTER_API_KEY to .env');
    }

    const messages: OpenRouterMessage[] = [];

    if (systemPrompt) {
        messages.push({ role: 'system', content: systemPrompt });
    }

    messages.push({ role: 'user', content: prompt });

    const response = await fetch('https://openrouter.ai/api/v1/chat/completions', {
        method: 'POST',
        headers: {
            'Authorization': `Bearer ${apiKey}`,
            'Content-Type': 'application/json',
            'HTTP-Referer': window.location.origin,
            'X-Title': 'Ianua Vini App'
        },
        body: JSON.stringify({
            model,
            messages,
            temperature: 0.3,
        })
    });

    if (!response.ok) {
        const error = await response.text();
        throw new Error(`OpenRouter API error: ${error}`);
    }

    const data: OpenRouterResponse = await response.json();
    return data.choices[0]?.message?.content || '';
}

export const generateCompletion = callOpenRouter;

/**
 * Call OpenRouter API with an image (for vision/scan tasks)
 */
export async function callOpenRouterWithImage(
    prompt: string,
    imageBase64: string,
    model: OpenRouterModel = 'google/gemini-3-flash-preview',
    systemPrompt?: string
): Promise<string> {
    const apiKey = getOpenRouterApiKey();
    if (!apiKey) {
        throw new Error('OpenRouter API key not found.');
    }

    const messages: OpenRouterMessage[] = [];
    if (systemPrompt) {
        messages.push({ role: 'system', content: systemPrompt });
    }

    // Ensure proper data URL format
    const imageUrl = imageBase64.startsWith('data:') ? imageBase64 : `data:image/jpeg;base64,${imageBase64}`;

    messages.push({
        role: 'user',
        content: [
            { type: 'image_url', image_url: { url: imageUrl } },
            { type: 'text', text: prompt }
        ]
    });

    const response = await fetch('https://openrouter.ai/api/v1/chat/completions', {
        method: 'POST',
        headers: {
            'Authorization': `Bearer ${apiKey}`,
            'Content-Type': 'application/json',
            'HTTP-Referer': window.location.origin,
            'X-Title': 'Ianua Vini App'
        },
        body: JSON.stringify({
            model,
            messages,
            temperature: 0.1,
        })
    });

    if (!response.ok) {
        const error = await response.text();
        throw new Error(`OpenRouter Vision API error: ${error}`);
    }

    const data: OpenRouterResponse = await response.json();
    return data.choices[0]?.message?.content || '';
}

/**
 * Translate text using OpenRouter with selected model
 */
export async function translateWithOpenRouter(
    italianText: string,
    context: string = 'winery/wine content',
    model: OpenRouterModel = 'google/gemini-3-flash-preview'
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
        console.log(`[OpenRouter] Translating... Model: ${model}, Context: ${context}`);
        const result = await callOpenRouter(prompt, model);
        console.log('[OpenRouter] Raw Response:', result);

        // Parse JSON from response (handle potential markdown wrapping)
        let jsonStr = result.trim();
        if (jsonStr.startsWith('```')) {
            jsonStr = jsonStr.replace(/```json?\n?/g, '').replace(/```/g, '').trim();
        }

        const parsed = JSON.parse(jsonStr);
        console.log('[OpenRouter] Parsed:', parsed);

        return {
            en: parsed.en || '',
            fr: parsed.fr || ''
        };
    } catch (e) {
        console.error('OpenRouter translation error:', e);
        return { en: '', fr: '' };
    }
}
