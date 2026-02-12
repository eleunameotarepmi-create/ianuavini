/**
 * DeepL Translation Service
 * Uses DeepL API via Vite proxy to avoid CORS issues
 */

const getDeepLApiKey = () => {
    // @ts-ignore
    return import.meta.env?.VITE_DEEPL_API_KEY || process.env.VITE_DEEPL_API_KEY;
};

// In dev: use Vite proxy (/deepl-proxy -> api-free.deepl.com)
// In prod: use server.js proxy (/api/deepl -> api-free.deepl.com)
const getBaseUrl = () => '/deepl-proxy/v2';

interface DeepLResponse {
    translations: { detected_source_language: string; text: string }[];
}

/**
 * Translate Italian text to both English and French
 */
export async function translateWithDeepLBoth(
    italianText: string,
    _context?: string
): Promise<{ en: string; fr: string }> {
    if (!italianText || italianText.trim().length === 0) {
        return { en: '', fr: '' };
    }

    const apiKey = getDeepLApiKey();
    if (!apiKey) throw new Error('DeepL API key not found. Add VITE_DEEPL_API_KEY to .env');

    try {
        const [enRes, frRes] = await Promise.all([
            fetch(`${getBaseUrl()}/translate`, {
                method: 'POST',
                headers: {
                    'Authorization': `DeepL-Auth-Key ${apiKey}`,
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    text: [italianText],
                    source_lang: 'IT',
                    target_lang: 'EN-US',
                }),
            }),
            fetch(`${getBaseUrl()}/translate`, {
                method: 'POST',
                headers: {
                    'Authorization': `DeepL-Auth-Key ${apiKey}`,
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    text: [italianText],
                    source_lang: 'IT',
                    target_lang: 'FR',
                }),
            }),
        ]);

        if (!enRes.ok) throw new Error(`DeepL EN error: ${enRes.status} ${await enRes.text()}`);
        if (!frRes.ok) throw new Error(`DeepL FR error: ${frRes.status} ${await frRes.text()}`);

        const enData: DeepLResponse = await enRes.json();
        const frData: DeepLResponse = await frRes.json();

        return {
            en: enData.translations[0]?.text || '',
            fr: frData.translations[0]?.text || '',
        };
    } catch (e: any) {
        console.error('DeepL translation error:', e);
        throw e;
    }
}

/**
 * Check DeepL API usage/quota
 */
export async function getDeepLUsage(): Promise<{ character_count: number; character_limit: number }> {
    const apiKey = getDeepLApiKey();
    if (!apiKey) throw new Error('No DeepL API key');

    const response = await fetch(`${getBaseUrl()}/usage`, {
        headers: { 'Authorization': `DeepL-Auth-Key ${apiKey}` },
    });

    if (!response.ok) throw new Error('Failed to check DeepL usage');
    return response.json();
}
