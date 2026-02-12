
import React, { useState, useRef, useEffect } from 'react';
import { Wine, Winery, MenuItem, GlossaryItem, AiInstruction } from '../types';
import { WINE_REGIONS, PIEMONTE_REGIONS, getWineryRegion, getAltitude } from '../constants';
import { Plus, Edit2, Trash2, Wine as WineIcon, Store, UtensilsCrossed, Globe, Loader2, Image as ImageIcon, Download, Upload, Trash, FileText, BookOpen, Sparkles, Eye, EyeOff, Search, LogOut, FileJson, Bot } from 'lucide-react';
import { parseMenuWithAi, extractWineryData, extractWineryDataFromText, generateGlossaryFromWines, extractGlossaryFromText, translateToLanguages } from '../services/geminiService';
import { translateWithOpenRouter } from '../services/openRouterService';
import { translateWithDeepLBoth, getDeepLUsage } from '../services/deeplService';
import { AgentAction } from '../services/aiAgentService';
import { AdminAIChat } from './AdminAIChat';
import { useTheme, THEMES, ThemeId } from '../context/ThemeContext';
import { Palette } from 'lucide-react';

// Utility to compress images to avoid LocalStorage overflow
// Utility to compress images to avoid LocalStorage overflow
const compressImage = (file: File): Promise<string> => {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.readAsDataURL(file);
    reader.onload = (event) => {
      const img = new Image();
      img.src = event.target?.result as string;
      img.onload = () => {
        const canvas = document.createElement('canvas');
        const MAX_WIDTH = 800;
        const scaleSize = MAX_WIDTH / img.width;
        canvas.width = MAX_WIDTH;
        canvas.height = img.height * scaleSize;
        const ctx = canvas.getContext('2d');
        if (ctx) {
          ctx.clearRect(0, 0, canvas.width, canvas.height); // Ensure transparent background
          ctx.drawImage(img, 0, 0, canvas.width, canvas.height);
          // Use WebP for transparency support (PNG is too big, JPEG has no alpha)
          // If the file is PNG or WebP, keep transparency using image/webp
          // Otherwise use JPEG for better compression
          const outputType = (file.type === 'image/png' || file.type === 'image/webp') ? 'image/webp' : 'image/jpeg';
          resolve(canvas.toDataURL(outputType, 0.7));
        } else {
          reject(new Error("Canvas context failed"));
        }
      };
      img.onerror = (err) => reject(err);
    };
    reader.onerror = (err) => reject(err);
  });
};

interface AdminPanelProps {
  wines: Wine[];
  wineries: Winery[];
  menu: MenuItem[];
  glossary: GlossaryItem[];
  aiInstructions: AiInstruction[];
  onAddWine: (wine: Wine) => void;
  onUpdateWine: (wine: Wine) => void;
  onBatchUpdateWines: (updates: Partial<Wine>[]) => void;
  onDeleteWine: (id: string) => void;
  onAddWinery: (winery: Winery) => void;
  onUpdateWinery: (winery: Winery) => void;
  onDeleteWinery: (id: string) => void;
  onUpdateMenu: (menu: MenuItem[]) => void;
  onUpdateGlossary: (items: GlossaryItem[]) => void;
  onResetGlossary?: (items: GlossaryItem[]) => void; // New full reset cap
  onDeleteGlossaryItem?: (term: string) => void;
  onAddAiInstruction: (instruction: AiInstruction) => void;
  onUpdateAiInstruction: (instruction: AiInstruction) => void;
  onDeleteAiInstruction: (id: string) => void;
  onWipeData: () => void;
  onSeedData: () => void;
  onExportBackup: () => void;
  onImportBackup: (event: React.ChangeEvent<HTMLInputElement>) => void;
  onLogout: () => void;

  onWipeWines: () => void;
  onWipeWineries: () => void;
  onWipeMenu: () => void;
  onWipeGlossary: () => void;
  defaultRegion?: 'vda' | 'piemonte';
  onBulkUpdate: (data: { wines: Wine[], wineries: Winery[], glossary?: GlossaryItem[], menu?: MenuItem[] }) => void;
}

type AdminTab = 'wines' | 'wineries' | 'menu' | 'glossary' | 'settings' | 'ai_instructions' | 'themes';

export const AdminPanel: React.FC<AdminPanelProps> = ({
  wines, wineries, menu, glossary, aiInstructions,
  onAddWine, onUpdateWine, onBatchUpdateWines, onDeleteWine,
  onAddWinery, onUpdateWinery, onDeleteWinery,
  onUpdateMenu, onUpdateGlossary, onResetGlossary, onDeleteGlossaryItem, onAddAiInstruction, onUpdateAiInstruction, onDeleteAiInstruction, onWipeData, onExportBackup, onImportBackup, onLogout,
  onWipeWines, onWipeWineries, onWipeMenu, onWipeGlossary, defaultRegion, onBulkUpdate
}) => {
  const [activeTab, setActiveTab] = useState<AdminTab>('wines');
  const [adminRegion, setAdminRegion] = useState<'vda' | 'piemonte'>(defaultRegion || 'vda');
  const { currentTheme, setTheme } = useTheme();

  // REGION FILTERING LOGIC
  const currentRegionIds = (adminRegion === 'vda' ? WINE_REGIONS : PIEMONTE_REGIONS).map(r => r.id);

  const filteredWineries = wineries.filter(w => {
    const regionId = getWineryRegion(w);
    // Strict check: must match one of the IDs in the active region list OR be unknown (so new imports appear)
    return currentRegionIds.includes(regionId) || regionId === 'unknown';
  }).sort((a, b) => {
    // Journey order: sort by zone position, then altitude, then name
    const zoneOrderMap = new Map(currentRegionIds.map((id, i) => [id, i]));
    const zoneA = getWineryRegion(a);
    const zoneB = getWineryRegion(b);
    const orderA = zoneOrderMap.get(zoneA) ?? 999;
    const orderB = zoneOrderMap.get(zoneB) ?? 999;
    if (orderA !== orderB) return orderA - orderB;
    const altA = getAltitude(a.location || '');
    const altB = getAltitude(b.location || '');
    if (altA !== altB) return altA - altB;
    return a.name.localeCompare(b.name);
  });

  // Build winery order map for sorting wines consistently
  const wineryOrderMap = new Map(filteredWineries.map((w, i) => [w.id, i]));

  const filteredWines = wines.filter(w =>
    filteredWineries.some(winery => winery.id === w.wineryId)
  ).sort((a, b) => {
    const orderA = wineryOrderMap.get(a.wineryId) ?? 999;
    const orderB = wineryOrderMap.get(b.wineryId) ?? 999;
    if (orderA !== orderB) return orderA - orderB;
    return a.name.localeCompare(b.name);
  });
  const [editingId, setEditingId] = useState<string | null>(null);
  const [isAdding, setIsAdding] = useState(false);
  const [isLoadingAi, setIsLoadingAi] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const pdfInputRef = useRef<HTMLInputElement>(null);
  const [textImportContent, setTextImportContent] = useState('');
  const [showHiddenWines, setShowHiddenWines] = useState(false);
  const [menuSearchTerm, setMenuSearchTerm] = useState('');
  const [wineSearchTerm, setWineSearchTerm] = useState('');
  const [glossaryImportText, setGlossaryImportText] = useState(''); // New State for Glossary Import
  const [translatingWineryId, setTranslatingWineryId] = useState<string | null>(null); // Track which winery is being translated
  const [deeplProgress, setDeeplProgress] = useState<{ current: number; total: number; phase: string } | null>(null);

  // SCROLL PRESERVATION LOGIC
  const lastScrollPos = useRef<number>(0);

  // Restore scroll position when returning to list
  useEffect(() => {
    if (!editingId && !isAdding) {
      // Small timeout to allow DOM to re-render the list
      setTimeout(() => {
        if (lastScrollPos.current > 0) {
          window.scrollTo({ top: lastScrollPos.current, behavior: 'auto' });
        }
      }, 50);
    }
  }, [editingId, isAdding]);

  // Per-function AI Provider selection
  const [chatProvider, setChatProvider] = useState<'gemini' | 'openrouter' | 'openai'>(() =>
    (localStorage.getItem('ianua_chat_provider') as 'gemini' | 'openrouter' | 'openai') || 'gemini'
  );
  const [scanProvider, setScanProvider] = useState<'gemini' | 'openrouter'>(() =>
    (localStorage.getItem('ianua_scan_provider') as 'gemini' | 'openrouter') || 'gemini'
  );
  const [pairingProvider, setPairingProvider] = useState<'gemini' | 'openrouter' | 'openai'>(() =>
    (localStorage.getItem('ianua_pairing_provider') as 'gemini' | 'openrouter' | 'openai') || 'gemini'
  );
  const [importProvider, setImportProvider] = useState<'gemini' | 'openrouter'>(() =>
    (localStorage.getItem('ianua_import_provider') as 'gemini' | 'openrouter') || 'gemini'
  );
  const [adminChatProvider, setAdminChatProvider] = useState<'gemini' | 'openrouter' | 'openai'>(() =>
    (localStorage.getItem('ianua_admin_chat_provider') as 'gemini' | 'openrouter' | 'openai') || 'gemini'
  );
  // Legacy compatibility alias
  const selectedProvider = adminChatProvider;
  const [selectedGeminiModel, setSelectedGeminiModel] = useState(() =>
    localStorage.getItem('ianua_gemini_model') || 'gemini-2.5-flash'
  );
  const [selectedOpenRouterModel, setSelectedOpenRouterModel] = useState(() =>
    localStorage.getItem('ianua_openrouter_model') || 'google/gemini-3-flash-preview'
  );
  const [selectedOpenAIModel, setSelectedOpenAIModel] = useState(() =>
    localStorage.getItem('ianua_openai_model') || 'gpt-4o-mini'
  );
  const [openAIKey, setOpenAIKey] = useState(() =>
    localStorage.getItem('ianua_openai_api_key') || ''
  );

  // Persist per-function provider selections
  useEffect(() => {
    localStorage.setItem('ianua_chat_provider', chatProvider);
  }, [chatProvider]);
  useEffect(() => {
    localStorage.setItem('ianua_scan_provider', scanProvider);
  }, [scanProvider]);
  useEffect(() => {
    localStorage.setItem('ianua_pairing_provider', pairingProvider);
  }, [pairingProvider]);
  useEffect(() => {
    localStorage.setItem('ianua_import_provider', importProvider);
  }, [importProvider]);
  useEffect(() => {
    localStorage.setItem('ianua_admin_chat_provider', adminChatProvider);
  }, [adminChatProvider]);

  useEffect(() => {
    localStorage.setItem('ianua_gemini_model', selectedGeminiModel);
  }, [selectedGeminiModel]);

  useEffect(() => {
    localStorage.setItem('ianua_openrouter_model', selectedOpenRouterModel);
  }, [selectedOpenRouterModel]);

  useEffect(() => {
    localStorage.setItem('ianua_openai_model', selectedOpenAIModel);
  }, [selectedOpenAIModel]);

  useEffect(() => {
    localStorage.setItem('ianua_openai_api_key', openAIKey);
  }, [openAIKey]);

  const geminiModels = [
    { id: 'gemini-3-pro-preview', name: 'Gemini 3 Pro Preview' },
    { id: 'gemini-3-flash-preview', name: 'Gemini 3 Flash Preview' },
    { id: 'gemini-3-pro-image-preview', name: 'Gemini 3 Pro Image' },
    { id: 'gemini-2.5-pro', name: 'Gemini 2.5 Pro' },
    { id: 'gemini-2.5-flash', name: 'Gemini 2.5 Flash' },
    { id: 'gemini-2.5-flash-lite', name: 'Gemini 2.5 Flash Lite' },
    { id: 'gemini-2.0-flash', name: 'Gemini 2.0 Flash (Legacy)' },
  ];

  const openRouterModels = [
    { id: 'google/gemini-3-flash-preview', name: 'Gemini 3 Flash', free: true },
    { id: 'google/gemini-3-pro-preview', name: 'Gemini 3 Pro', free: true },
    { id: 'google/gemini-2.5-flash', name: 'Gemini 2.5 Flash', free: true },
    { id: 'anthropic/claude-sonnet-4', name: 'Claude Sonnet 4', free: false },
    { id: 'anthropic/claude-opus-4.5', name: 'Claude Opus 4.5', free: false },
    { id: 'openai/gpt-5.2', name: 'GPT-5.2', free: false },
    { id: 'openai/gpt-5.2-chat', name: 'GPT-5.2 Chat', free: false },
    { id: 'deepseek/v3.2', name: 'DeepSeek V3.2', free: false },
    { id: 'deepseek/v3.2:free', name: 'DeepSeek V3.2 (Free)', free: true },
    { id: 'mistral/large-3-2512', name: 'Mistral Large 3', free: false },
    { id: 'mistral/devstral-2-2512:free', name: 'Devstral 2 (Free)', free: true },
    { id: 'nvidia/nemotron-3-nano-free', name: 'Nemotron 3 Nano (Free)', free: true },
  ];

  const openAIModels = [
    { id: 'gpt-4o', name: 'GPT-4o' },
    { id: 'gpt-4o-mini', name: 'GPT-4o Mini' },
    { id: 'gpt-4-turbo', name: 'GPT-4 Turbo' },
    { id: 'gpt-3.5-turbo', name: 'GPT-3.5 Turbo' },
    { id: 'o1', name: 'o1' },
    { id: 'o1-mini', name: 'o1 Mini' },
    { id: 'o3-mini', name: 'o3 Mini' },
  ];

  // Get currently selected model based on provider
  const getCurrentModelInfo = () => {
    if (selectedProvider === 'gemini') {
      return { provider: 'Google Gemini', model: geminiModels.find(m => m.id === selectedGeminiModel)?.name || selectedGeminiModel };
    }
    if (selectedProvider === 'openai') {
      return { provider: 'OpenAI', model: openAIModels.find(m => m.id === selectedOpenAIModel)?.name || selectedOpenAIModel };
    }
    return { provider: 'OpenRouter', model: openRouterModels.find(m => m.id === selectedOpenRouterModel)?.name || selectedOpenRouterModel };
  };

  // ===== UNIFIED TRANSLATION: DeepL primary, Gemini fallback =====
  const translateWithFallback = async (text: string, context: string): Promise<{ en: string; fr: string }> => {
    if (!text || text.trim().length === 0) return { en: '', fr: '' };
    try {
      // Try DeepL first
      const result = await translateWithDeepLBoth(text, context);
      if (result.en || result.fr) return result;
      throw new Error('Empty DeepL result');
    } catch (deepLError) {
      console.warn('⚠️ DeepL failed, falling back to Gemini:', deepLError);
      // Fallback to Gemini
      return translateToLanguages(text, context, selectedGeminiModel);
    }
  };

  // Handler to translate a winery and its wines using DeepL (fallback Gemini)
  const handleTranslateWinery = async (winery: Winery) => {
    if (!winery.description) {
      alert('Questa cantina non ha una descrizione da tradurre.');
      return;
    }

    setTranslatingWineryId(winery.id);

    try {
      // Translate winery description
      const descTranslation = await translateWithFallback(winery.description, 'winery description');

      // Translate curiosity if exists
      let curiosityTranslation = { en: '', fr: '' };
      if (winery.curiosity) {
        curiosityTranslation = await translateWithFallback(winery.curiosity, 'winery fun fact');
      }

      // Update winery with translations
      // Update winery with translations
      console.log('Traduzioni ottenute:', { desc: descTranslation, curiosity: curiosityTranslation });

      const updatedWinery: Winery = {
        ...winery,
        description_en: descTranslation.en,
        description_fr: descTranslation.fr,
        curiosity_en: curiosityTranslation.en,
        curiosity_fr: curiosityTranslation.fr
      };

      onUpdateWinery(updatedWinery);

      // Now translate wines from this winery
      const wineryWines = wines.filter(w => w.wineryId === winery.id);
      for (const wine of wineryWines) {
        const wineDescTranslation = wine.description
          ? await translateWithFallback(wine.description, 'wine description')
          : { en: '', fr: '' };
        const winePairingTranslation = wine.pairing
          ? await translateWithFallback(wine.pairing, 'wine pairing')
          : { en: '', fr: '' };
        let wineCuriosityTranslation = { en: '', fr: '' };
        if (wine.curiosity) {
          wineCuriosityTranslation = await translateWithFallback(wine.curiosity, 'wine fun fact');
        }

        const updatedWine: Wine = {
          ...wine,
          description_en: wineDescTranslation.en,
          description_fr: wineDescTranslation.fr,
          pairing_en: winePairingTranslation.en,
          pairing_fr: winePairingTranslation.fr,
          curiosity_en: wineCuriosityTranslation.en,
          curiosity_fr: wineCuriosityTranslation.fr
        };
        onUpdateWine(updatedWine);
      }

      alert(`✅ Traduzione completata per "${winery.name}" e ${wineryWines.length} vini usando DeepL!`);
    } catch (err: any) {
      console.error('Translation error:', err);
      alert(`❌ Errore traduzione: ${err.message}`);
    } finally {
      setTranslatingWineryId(null);
    }
  };



  // Batch translate All Wineries (Logic restored)
  const handleTranslateAllWineries = async () => {
    if (!window.confirm(`Vuoi avviare la traduzione automatica per TUTTE le cantine e i vini mancanti?\n\nProvider: DeepL (fallback: Gemini)\n\nVerranno tradotti solo i campi vuoti (EN/FR).`)) return;

    setIsLoadingAi(true);
    let totalTranslatedWineries = 0;
    let totalTranslatedWines = 0;

    try {

      // Iterate all wineries (SCOPED TO ACTIVE REGION)
      for (const winery of filteredWineries) {
        let wineryUpdated = false;
        let newWinery = { ...winery };

        // 1. Translate Winery Fields if missing
        if (winery.description && (!winery.description_en || !winery.description_fr)) {
          try {
            const t = await translateWithFallback(winery.description, 'winery description');
            if (!newWinery.description_en) newWinery.description_en = t.en;
            if (!newWinery.description_fr) newWinery.description_fr = t.fr;
            wineryUpdated = true;
          } catch (e) { console.error("Error translating winery desc", e); }
        }

        if (winery.curiosity && (!winery.curiosity_en || !winery.curiosity_fr)) {
          try {
            const t = await translateWithFallback(winery.curiosity, 'winery fun fact');
            if (!newWinery.curiosity_en) newWinery.curiosity_en = t.en;
            if (!newWinery.curiosity_fr) newWinery.curiosity_fr = t.fr;
            wineryUpdated = true;
          } catch (e) { console.error("Error translating winery curiosity", e); }
        }

        if (wineryUpdated) {
          onUpdateWinery(newWinery);
          totalTranslatedWineries++;
        }

        // 2. Translate Wines for this winery
        const wineryWines = wines.filter(w => w.wineryId === winery.id);
        for (const wine of wineryWines) {
          let wineUpdated = false;
          let newWine = { ...wine };

          // Description
          if (wine.description && (!wine.description_en || !wine.description_fr)) {
            try {
              const t = await translateWithFallback(wine.description, 'wine description');
              if (!newWine.description_en) newWine.description_en = t.en;
              if (!newWine.description_fr) newWine.description_fr = t.fr;
              wineUpdated = true;
            } catch (e) { }
          }

          // Pairing
          if (wine.pairing && (!wine.pairing_en || !wine.pairing_fr)) {
            try {
              const t = await translateWithFallback(wine.pairing, 'wine pairing');
              if (!newWine.pairing_en) newWine.pairing_en = t.en;
              if (!newWine.pairing_fr) newWine.pairing_fr = t.fr;
              wineUpdated = true;
            } catch (e) { }
          }

          // Curiosity
          if (wine.curiosity && (!wine.curiosity_en || !wine.curiosity_fr)) {
            try {
              const t = await translateWithFallback(wine.curiosity, 'wine fun fact');
              if (!newWine.curiosity_en) newWine.curiosity_en = t.en;
              if (!newWine.curiosity_fr) newWine.curiosity_fr = t.fr;
              wineUpdated = true;
            } catch (e) { }
          }

          if (wineUpdated) {
            onUpdateWine(newWine);
            totalTranslatedWines++;
          }
        }
      }

      alert(`✅ Traduzione massiva completata!\n\nCantine aggiornate: ${totalTranslatedWineries}\nVini aggiornati: ${totalTranslatedWines}`);

    } catch (e: any) {
      alert(`❌ Errore durante la traduzione massiva: ${e.message}`);
    } finally {
      setIsLoadingAi(false);
    }
  };

  // Helper for menu translation
  const handleTranslateMenuItem = async (item: MenuItem) => {
    const confirmMsg = `Traduco "${item.name}" in Inglese e Francese con DeepL?`;

    if (!window.confirm(confirmMsg)) return;

    try {
      // Translate Name
      const nameTrans = await translateWithFallback(item.name, 'dish name on a menu');
      // Translate Description
      const descTrans = await translateWithFallback(item.description || item.name, 'dish description');

      const updatedItem: MenuItem = {
        ...item,
        name_en: nameTrans.en,
        name_fr: nameTrans.fr,
        description_en: descTrans.en,
        description_fr: descTrans.fr
      };

      onUpdateMenu(menu.map(m => m.id === item.id ? updatedItem : m));
      alert("✅ Piatto tradotto!");
    } catch (error) {
      console.error("Translation error:", error);
      alert("❌ Errore traduzione. Controlla la console.");
    }
  };

  // Helper for glossary translation
  const handleTranslateGlossaryItem = async (item: GlossaryItem) => {
    const confirmMsg = `Traduco "${item.term}" in Inglese e Francese con DeepL?`;

    if (!window.confirm(confirmMsg)) return;

    try {
      // Translate Definition
      const defTrans = await translateWithFallback(item.definition, `glossary definition for term "${item.term}"`);

      const updatedItem: GlossaryItem = {
        ...item,
        definition_en: defTrans.en,
        definition_fr: defTrans.fr
      };

      onUpdateGlossary(glossary.map(g => g.term === item.term ? updatedItem : g));
      alert("✅ Termine tradotto!");
    } catch (error) {
      console.error("Translation error:", error);
      alert("❌ Errore traduzione. Controlla la console.");
    }
  };

  // Batch translate Glossary
  const handleTranslateAllGlossary = async () => {
    // 1. Filter items needing translation (missing en or fr)
    const itemsToTranslate = glossary.filter(item => !item.definition_en || !item.definition_fr);

    if (itemsToTranslate.length === 0) {
      alert("🎉 Tutto il glossario è già tradotto!");
      return;
    }

    if (!window.confirm(`Trovati ${itemsToTranslate.length} termini da tradurre.\n\nVuoi procedere con la traduzione automatica usando DeepL?`)) return;

    setIsLoadingAi(true);
    let successCount = 0;
    let failCount = 0;

    // Helper process queue
    // Translate ONE by ONE sequentially to avoid rate limits and errors
    // Or in small batches. Let's do sequential for safety with visual feedback is better for now

    // We update local state progressively
    const newGlossary = [...glossary];

    try {
      for (const item of itemsToTranslate) {
        try {
          const defTrans = await translateWithFallback(item.definition, `glossary definition for term "${item.term}"`);

          // Update this item in our local copy
          const updatedItem = { ...item, definition_en: defTrans.en, definition_fr: defTrans.fr };
          const idx = newGlossary.findIndex(g => g.term === item.term);
          if (idx !== -1) newGlossary[idx] = updatedItem;

          successCount++;
        } catch (err) {
          console.error(`Failed to translate ${item.term}`, err);
          failCount++;
        }
      }

      onUpdateGlossary(newGlossary);
      alert(`✅ Traduzione completata!\n\nTradotti: ${successCount}\nFalliti: ${failCount}`);

    } catch (e: any) {
      alert("Errore durante il processo: " + e.message);
    } finally {
      setIsLoadingAi(false);
    }

  };

  // Optimize/Clean Glossary
  // Optimize/Clean Glossary
  const handleOptimizeGlossary = async () => {
    if (!confirm("Questa operazione:\n1. Pulirà i termini dai caratteri strani.\n2. Unirà i duplicati.\n3. Sovrascriverà l'intero database Glossario con una lista pulita.\n\nProcedere?")) return;

    setIsLoadingAi(true);

    try {
      const uniqueMap = new Map<string, GlossaryItem>();
      let duplicatesFound = 0;
      let garbageRemoved = 0;

      glossary.forEach(item => {
        // 1. Normalizzazione e Validazione ULTRA AGGRESSIVA
        if (!item.term) return;

        // Rimuove spazi normali, nbsp, zwnj, e altri caratteri invisibili
        const cleanTerm = item.term.replace(/[\u0009\u00a0\u2000-\u200b\u202f\u205f\u3000]/g, ' ').trim();

        if (cleanTerm.length < 2) {
          garbageRemoved++;
          return;
        }

        const key = cleanTerm.toLowerCase();

        if (uniqueMap.has(key)) {
          const existing = uniqueMap.get(key)!;

          // 2. Logica di Merge (Fusione)
          const bestTerm = existing.term[0] === existing.term[0].toUpperCase() ? existing.term : cleanTerm;

          const bestDef = (existing.definition?.length || 0) > (item.definition?.length || 0) ? existing.definition : item.definition;

          const merged: GlossaryItem = {
            term: bestTerm || key,
            category: existing.category || item.category || 'Territorio',
            definition: bestDef || '',
            definition_en: existing.definition_en || item.definition_en,
            definition_fr: existing.definition_fr || item.definition_fr
          };

          uniqueMap.set(key, merged);
          duplicatesFound++;
        } else {
          uniqueMap.set(key, { ...item, term: cleanTerm });
        }
      });

      const optimizedList = Array.from(uniqueMap.values());
      const sortedList = optimizedList.sort((a, b) => a.term.localeCompare(b.term));

      if (sortedList.length === 0) {
        alert("❌ Errore: La lista ottimizzata risulta vuota! Operazione annullata per evitare cancellazione dati.");
        return;
      }

      if (onResetGlossary) {
        await onResetGlossary(sortedList);
        alert(`✅ Glossario Ottimizzato!\n\nPrima: ${glossary.length} voci\nDopo: ${sortedList.length} voci\n\n🗑️ Duplicati uniti: ${duplicatesFound}\n🧹 Spazzatura rimossa: ${garbageRemoved}`);
      } else {
        onUpdateGlossary(sortedList);
        alert("Optimization done (fallback mode).");
      }

    } catch (err: any) {
      console.error("Optimization failed:", err);
      alert(`❌ Errore Ottimizzazione: ${err.message}`);
    } finally {
      setIsLoadingAi(false);
    }
  };


  const [wineForm, setWineForm] = useState<Partial<Wine>>({
    name: '', grapes: '', alcohol: '', pairing: '', temperature: '', description: '', altitude: 500,
    image: '',
    priceRange: '€',
    price: '',
    type: 'red',
    vintages: [],
    hidden: false,
    sensoryProfile: '', // Initialize new field
  });

  const [wineryForm, setWineryForm] = useState<Partial<Winery>>({
    name: '', location: '', description: '', website: '', curiosity: '', image: '', coordinates: { lat: 45, lng: 7 }
  });

  const [glossaryForm, setGlossaryForm] = useState<Partial<GlossaryItem>>({
    term: '', definition: '', category: 'Vitigno'
  });

  const [menuForm, setMenuForm] = useState<Partial<MenuItem>>({
    name: '', description: '', price: '', category: 'Antipasti', allergens: '', story: '', preparation: '', image: ''
  });

  const [aiInstructionForm, setAiInstructionForm] = useState<Partial<AiInstruction>>({
    content: ''
  });

  const handlePdfImport = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    setIsLoadingAi(true);
    const reader = new FileReader();

    reader.onload = async (e) => {
      const base64 = e.target?.result as string;
      try {
        const result = await extractWineryData(base64, file.type);
        const newWineryId = "winery_" + Date.now().toString();

        const newWinery: Winery = {
          id: newWineryId,
          name: result.winery.name || "Nuova Cantina",
          location: result.winery.location || "Valle d'Aosta",
          description: result.winery.description || "",
          website: result.winery.website || "",
          curiosity: result.winery.curiosity || "",
          image: "https://ianua.it/site/assets/files/1/img_20221021_204707_hdr.webp",
          coordinates: { lat: 45, lng: 7 }
        };

        const newWines: Wine[] = result.wines.map((w, idx) => ({
          id: "wine_" + (Date.now() + idx + 1).toString(),
          name: w.name || "Vino",
          wineryId: newWineryId,
          grapes: w.grapes || "Autoctono",
          alcohol: w.alcohol || "13%",
          pairing: w.pairing || "Piatti tipici locali",
          temperature: w.temperature || "16-18°C",
          description: w.description || "",
          altitude: w.altitude || 500,
          priceRange: (w.priceRange === '€' || w.priceRange === '€€' || w.priceRange === '€€€' ? w.priceRange : '€€') as any,
          image: "https://via.placeholder.com/150x400?text=" + encodeURIComponent(w.name || "VINO")
        }));

        // Aggiorniamo lo stato
        onAddWinery(newWinery);
        newWines.forEach(w => onAddWine(w));

        // Switch to wines tab to show results
        setActiveTab('wines');

        // GESTIONE GLOSSARIO ESTRATTO O GENERATO
        if (result.glossary && result.glossary.length > 0) {
          // CASO 1: Glossario trovato nel documento
          if (confirm(`✅ IMPORTAZIONE RIUSCITA!\n\n${result.winery.name} e ${newWines.length} vini aggiunti.\n\nAbbiamo anche trovato ${result.glossary.length} definizioni di Glossario nel documento (es. ${result.glossary[0].term}). Vuoi importarle?`)) {
            const currentTerms = new Set(glossary.map(g => g.term.toLowerCase()));
            const uniqueNewTerms = result.glossary.filter(t => !currentTerms.has(t.term.toLowerCase()));

            if (uniqueNewTerms.length > 0) {
              onUpdateGlossary([...glossary, ...uniqueNewTerms]);
              alert(`✨ Glossario aggiornato con ${uniqueNewTerms.length} nuovi termini dal documento!`);
            } else {
              alert("I termini trovati sono già presenti nel glossario.");
            }
          }
        } else {
          // CASO 2: Nessun glossario nel documento -> Chiediamo se generarlo
          if (confirm(`✅ IMPORTAZIONE RIUSCITA!\n\n${result.winery.name} e ${newWines.length} vini aggiunti.\n\nVuoi che l'IA analizzi questi dati per generare nuove voci del GLOSSARIO?`)) {
            const allWines = [...wines, ...newWines];
            const allWineries = [...wineries, newWinery];

            try {
              const newTerms = await generateGlossaryFromWines(allWines, allWineries);
              const currentTerms = new Set(glossary.map(g => g.term.toLowerCase()));
              const uniqueNewTerms = newTerms.filter(t => !currentTerms.has(t.term.toLowerCase()));

              if (uniqueNewTerms.length > 0) {
                onUpdateGlossary([...glossary, ...uniqueNewTerms]);
                alert(`✨ Glossario aggiornato con ${uniqueNewTerms.length} nuovi termini generati!`);
              } else {
                alert("L'IA ha analizzato i vini ma non ha trovato nuovi termini da aggiungere al glossario (o erano già presenti).");
              }
            } catch {
              alert("Errore generazione glossario.");
            }
          }
        }

      } catch (err: any) {
        alert(`❌ ERRORE: ${err.message || "Impossibile analizzare il documento."}`);
      } finally {
        setIsLoadingAi(false);
      }
    };
    reader.readAsDataURL(file);
    event.target.value = '';
  };

  const resetForms = () => {
    setIsAdding(false);
    setEditingId(null);
    setWineForm({ name: '', grapes: '', alcohol: '', pairing: '', temperature: '', description: '', altitude: 500, wineryId: wineries[0]?.id || '', priceRange: '€€', image: '', vintages: [] });
    setWineryForm({ name: '', location: '', region: '', description: '', website: '', curiosity: '', image: '', coordinates: { lat: 45, lng: 7 } });
    setGlossaryForm({ term: '', definition: '', category: 'Vitigno' });
    setMenuForm({ name: '', description: '', price: '', category: 'Antipasti', allergens: '', story: '', preparation: '', image: '', verifiedPairings: [] });
    setAiInstructionForm({ content: '' });
    if (fileInputRef.current) fileInputRef.current.value = "";
  };

  // === UTILITY: NORMALIZE SENSORY PROFILES ===
  const handleNormalizeSensoryProfiles = () => {
    if (!confirm("Vuoi generare automaticamente i Profili Sensoriali per i vini che ne sono privi, basandoti sulla loro descrizione?")) return;

    let updatedCount = 0;
    const keywords = ['fruttato', 'floreale', 'speziato', 'secco', 'tannico', 'minerale', 'fresco', 'persistente', 'armonico', 'equilibrato', 'pieno', 'intenso', 'vellutato', 'sapido', 'morbido', 'strutturato', 'amabile', 'delicato', 'elegante', 'complesso', 'austero'];

    wines.forEach(w => {
      if ((!w.sensoryProfile || w.sensoryProfile === '' || w.sensoryProfile === 'Equilibrato • Armonico') && w.description) {
        const desc = w.description.toLowerCase();

        const detailedKeywords = [
          'fruttato', 'frutta', 'floreale', 'fiori', 'speziato', 'spezie', 'pepe', 'cannella',
          'secco', 'dolce', 'amabile', 'assenzio', // sweetness/dryness
          'tannico', 'tannino', 'astringente', 'vellutato', // texture
          'minerale', 'sapidità', 'pietra', 'gesso', 'vulcanico',
          'fresco', 'acidità', 'citrino', 'agrumi', 'limone', 'pompelmo', 'arancia',
          'persistente', 'lungo', 'finale',
          'armonico', 'equilibrato', 'rotondo', 'morbido',
          'pieno', 'corpo', 'struttura', 'strutturato', 'intenso', 'potente',
          'elegante', 'raffinato', 'fine', 'complesso', 'austero',
          'vaniglia', 'tostato', 'legno', 'barrique', 'cioccolato', 'cacao', 'caffè', 'tabacco', 'cuoio',
          'balsamico', 'menta', 'eucalipto', 'pino', 'resina',
          'erbaceo', 'fieno', 'erba', 'peperone'
        ];

        // Deduplicate similar concepts (e.g. spezie -> speziato) mapping logic could be added here but keeping it simple string matching
        // Map detected keywords to a canonical set if needed? 
        // For now, let's accept all detections but unique them in the output

        const found = detailedKeywords.filter(k => desc.includes(k));

        let newProfile = '';
        if (found.length > 0) {
          // Capitalize and join. Deduplicate logic: use Set
          const uniqueFound = Array.from(new Set(found));
          // Limit to top 5-6 to avoid flooding? No, let user prune.
          // Actually let's map generic terms:
          // e.g. if 'frutta' -> 'Fruttato'
          const normalized = uniqueFound.map(k => {
            if (k === 'frutta') return 'Fruttato';
            if (k === 'fiori') return 'Floreale';
            if (k === 'spezie') return 'Speziato';
            if (k === 'tannino') return 'Tannico';
            if (k === 'acidità') return 'Fresco';
            return k.charAt(0).toUpperCase() + k.slice(1);
          });

          // Re-deduplicate after normalization
          newProfile = Array.from(new Set(normalized)).slice(0, 6).join(' • '); // Limit to 6 tags
        } else {
          newProfile = 'Equilibrato • Armonico';
        }

        // Only trigger if changes are meaningful
        if (w.sensoryProfile !== newProfile) {
          onUpdateWine({ ...w, sensoryProfile: newProfile });
          updatedCount++;
        }
      }
    });

    alert(`✅ Aggiornamento completato: ${updatedCount} vini aggiornati con profilo sensoriale generato.`);
  };

  const handleExportAllWineries = () => {
    const exportData = filteredWineries.map(winery => ({
      winery: winery,
      wines: filteredWines.filter(w => w.wineryId === winery.id)
    }));

    if (exportData.length === 0) {
      alert("Nessuna cantina da esportare.");
      return;
    }

    const dataStr = "data:text/json;charset=utf-8," + encodeURIComponent(JSON.stringify(exportData, null, 2));
    const downloadAnchorNode = document.createElement('a');
    downloadAnchorNode.setAttribute("href", dataStr);
    downloadAnchorNode.setAttribute("download", `all_wineries_export_${new Date().toISOString().split('T')[0]}.json`);
    document.body.appendChild(downloadAnchorNode);
    downloadAnchorNode.click();
    downloadAnchorNode.remove();
  };

  const handleExportWinesOnly = () => {
    if (wines.length === 0) {
      alert("Nessun vino da esportare.");
      return;
    }

    const dataStr = "data:text/json;charset=utf-8," + encodeURIComponent(JSON.stringify(filteredWines, null, 2));
    const downloadAnchorNode = document.createElement('a');
    downloadAnchorNode.setAttribute("href", dataStr);
    downloadAnchorNode.setAttribute("download", `wines_backup_${new Date().toISOString().split('T')[0]}.json`);
    document.body.appendChild(downloadAnchorNode);
    downloadAnchorNode.click();
    downloadAnchorNode.remove();
  };

  const handleIntegrativeImport = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    if (!confirm("ATTENZIONE: Stai per avviare un'importazione INTEGRATIVA.\n\nQuesto aggiornerà i dati dei vini esistenti (es. Tipologia, Descrizione) ma MANTERRÀ le immagini attuali se il file importato non ne ha.\n\nVuoi procedere?")) return;

    const reader = new FileReader();
    reader.onload = async (e) => {
      try {
        const text = e.target?.result as string;
        const data = JSON.parse(text);

        // Normalize input: can be array of wines OR object {wines: [...], ...}
        let winesToProcess: any[] = [];
        if (Array.isArray(data)) {
          // Assume array of wines if it looks like wines, or array of {winery, wines}
          if (data.length > 0 && data[0].wineryId) {
            winesToProcess = data;
          } else if (data.length > 0 && data[0].wines) {
            data.forEach((d: any) => { if (d.wines) winesToProcess.push(...d.wines); });
          }
        } else if (data.wines) {
          winesToProcess = data.wines;
        }

        if (winesToProcess.length === 0) {
          alert("Nessun vino trovato nel file per l'aggiornamento.");
          return;
        }

        let updatedCount = 0;
        let addedCount = 0;

        for (const importedWine of winesToProcess) {
          if (!importedWine.name) continue;

          // Find existing wine by ID or Fuzzy Name
          const existingWine = wines.find(w =>
            w.id === importedWine.id ||
            w.name.toLowerCase().trim() === importedWine.name.toLowerCase().trim()
          );

          if (existingWine) {
            // MERGE LOGIC
            // We update fields, but keep existing Image if imported is empty/placeholder
            const newImage = (importedWine.image && !importedWine.image.includes('placeholder'))
              ? importedWine.image
              : existingWine.image;

            const updatedWine: Wine = {
              ...existingWine,
              ...importedWine, // Overwrite with new data strings
              image: newImage, // Restore/Keep best image
              id: existingWine.id, // Keep existing ID strict
              sensoryProfile: importedWine.sensoryProfile || existingWine.sensoryProfile // Merge sensory profile if new one exists, else keep old
            };
            onUpdateWine(updatedWine);
            updatedCount++;
          } else {
            // NEW WINE
            // Add normally
            const newWine: Wine = {
              ...importedWine,
              id: importedWine.id || `wine_${Date.now()}_${Math.random().toString(36).substr(2, 5)}`,
              image: importedWine.image || "https://via.placeholder.com/150x400?text=" + encodeURIComponent(importedWine.name || "VINO")
            };
            // Ensure wineryId is linked if missing (fallback to first winery in list? No, unsafe. Assume JSON is correct or orphaned)
            if (!newWine.wineryId && data.winery && data.winery.id) {
              newWine.wineryId = data.winery.id;
            }

            onAddWine(newWine);
            addedCount++;
          }
        }

        // 3. Update Winery Data if present (Integrative Extra Feature)
        if (data.winery && data.winery.id) {
          const existingWinery = wineries.find(w => w.id === data.winery.id);
          if (existingWinery) {
            // Merge fields but preserve critical ones like image if not provided?
            // Actually user asked to fix wines, but useful to update text too
            const updatedWinery = { ...existingWinery, ...data.winery, image: (data.winery.image || existingWinery.image) };
            onUpdateWinery(updatedWinery);
          } else {
            // Winery doesn't exist? Create it? 
            // "Importa e Aggiorna" usually implies updating wines, but if the winery is missing we should probably create it to avoid orphans
            // But let's stick to the requested scope: fix wine linkage
            const newWinery = { ...data.winery, image: data.winery.image || "https://via.placeholder.com/150" };
            onAddWinery(newWinery);
          }
        }

        alert(`✅ FUSIONE COMPLETATA!\n\nVini Aggiornati: ${updatedCount}\nVini Aggiunti: ${addedCount}`);
        event.target.value = ''; // Reset input

      } catch (err: any) {
        alert("❌ Errore durante l'importazione integrativa: " + err.message);
      }
    };
    reader.readAsText(file);
  };

  // Handler for Single Winery Import
  const handleImportSingleWinery = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = async (e) => {
      try {
        const content = e.target?.result as string;
        const importedData = JSON.parse(content);

        // Validation: Check if it looks like a winery
        if (!importedData.id || !importedData.name || !importedData.location) {
          alert("Il file non sembra contenere una cantina valida (mancano id, name o location).");
          return;
        }

        // Context-aware Region Injection
        // Force the winery into the current Admin Region environment if stripped of region data
        if (!importedData.region) {
          // Default fallbacks to ensure visibility in the active tab
          if (adminRegion === 'piemonte') importedData.region = 'langhe';
          if (adminRegion === 'vda') importedData.region = 'bassa';
        }

        const winesToImport = Array.isArray(importedData.wines) ? importedData.wines : [];

        // Check if winery exists
        const existingIndex = wineries.findIndex(w => w.id === importedData.id);
        const confirmMsg = existingIndex >= 0
          ? `La cantina "${importedData.name}" esiste già. Vuoi sovrascriverla?${winesToImport.length > 0 ? `\n\nVerificati anche ${winesToImport.length} vini inclusi.` : ''}`
          : `Vuoi importare la cantina "${importedData.name}"?${winesToImport.length > 0 ? `\n\nInclude ${winesToImport.length} vini.` : ''}`;

        if (confirm(confirmMsg)) {
          // ATOMIC UPDATE: Create new state in memory to prevent race conditions
          let newWineries = [...wineries];
          let newWines = [...wines];

          // 1. Handle Winery
          const { wines: _, ...cleanWineryData } = importedData;
          if (existingIndex >= 0) {
            newWineries = newWineries.map(w => w.id === cleanWineryData.id ? cleanWineryData : w);
          } else {
            newWineries.push(cleanWineryData);
          }

          // 2. Handle Wines
          let winesUpdatedCount = 0;
          let winesAddedCount = 0;

          if (winesToImport.length > 0) {
            winesToImport.forEach((w: Wine) => {
              const existingWineIndex = newWines.findIndex(ew => ew.id === w.id);
              if (existingWineIndex >= 0) {
                newWines[existingWineIndex] = w;
                winesUpdatedCount++;
              } else {
                newWines.push(w);
                winesAddedCount++;
              }
            });
          }

          // 3. Single Save to Persistence via Prop
          onBulkUpdate({
            wines: newWines,
            wineries: newWineries
          });

          alert(`✅ Importazione Completata con Successo!\n\nCantina: ${cleanWineryData.name}\n${winesAddedCount > 0 ? `+ ${winesAddedCount} Nuovi Vini\n` : ''}${winesUpdatedCount > 0 ? `~ ${winesUpdatedCount} Vini Aggiornati` : ''}`);
        }
      } catch (err: any) {
        console.error(err);
        alert("Errore durante l'importazione: " + err.message);
      }
    };
    reader.readAsText(file);
    // Reset input
    event.target.value = '';
  };

  const handleJsonImport = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = async (e) => {
      try {
        const text = e.target?.result as string;
        const data = JSON.parse(text);

        let itemsToProcess = [];
        let importedGlossary: any[] = [];

        // Determine format: Single Import vs Bulk Import vs Full Backup Object
        if (Array.isArray(data)) {
          // Direct Array of Wineries
          itemsToProcess = data;
        } else if (data.wineries && Array.isArray(data.wineries)) {
          // Object Wrapper { wineries: [...], glossary: [...] }
          itemsToProcess = data.wineries;
          if (data.glossary && Array.isArray(data.glossary)) {
            importedGlossary = data.glossary;
          }
        } else if (data.winery && data.wines) {
          // Single Winery Object (Backup format)
          itemsToProcess = [data]; // data is { winery: {...}, wines: [...] }
          if (data.glossary && Array.isArray(data.glossary)) {
            importedGlossary = data.glossary;
          }
        } else if (data.id && data.name && data.location) {
          // Single Winery Object (Direct raw format, wines might be inside or separate)
          // Wrapper to normalize
          itemsToProcess = [{ winery: data, wines: data.wines || [] }];
        } else {
          throw new Error("Formato JSON non valido. Deve contenere un oggetto {winery, wines}, un array di cantine, o un oggetto {wineries: []}.");
        }

        // ATOMIC STATE ACCUMULATORS
        let newWineries = [...wineries];
        let newWines = [...wines];
        let newGlossary = [...glossary];

        let addedWineries = 0;
        let updatedWineries = 0;
        let addedWines = 0;
        let updatedWines = 0;
        let errors = 0;
        let lastImportedRegion = '';

        for (const item of itemsToProcess) {
          try {
            // item can be { winery: ..., wines: ... } OR just winery object if valid
            const wineryData = item.winery || item; // Fallback if item is just the winery
            const winesData = item.wines || (Array.isArray(item.wines) ? item.wines : []);

            if (!wineryData || !wineryData.name) continue;

            // 1. Process Winery
            let wineryId = wineryData.id;
            const existingWineryIndex = newWineries.findIndex(w =>
              w.id === wineryData.id ||
              w.name.toLowerCase().trim() === wineryData.name.toLowerCase().trim()
            );

            if (existingWineryIndex >= 0) {
              // UPDATE EXISTING
              const existing = newWineries[existingWineryIndex];
              wineryId = existing.id;

              const updatedWinery = {
                ...existing,
                ...wineryData,
                id: existing.id, // Preserve ID
                image: (wineryData.image && !wineryData.image.includes("placeholder")) ? wineryData.image : existing.image
              };

              newWineries[existingWineryIndex] = updatedWinery;
              updatedWineries++;
              lastImportedRegion = updatedWinery.region || '';
            } else {
              // CREATE NEW
              if (!wineryId || newWineries.some(w => w.id === wineryId)) {
                wineryId = "winery_" + Date.now().toString() + Math.random().toString(36).substr(2, 5);
              }

              const newWinery: Winery = {
                ...wineryData,
                id: wineryId,
                image: wineryData.image || "https://ianua.it/site/assets/files/1/img_20221021_204707_hdr.webp",
                coordinates: wineryData.coordinates || { lat: 45, lng: 7 }
              };
              newWineries.push(newWinery);
              addedWineries++;
              lastImportedRegion = newWinery.region || '';
            }

            // 2. Process Wines
            if (Array.isArray(winesData)) {
              winesData.forEach((w: any, idx: number) => {
                const existingWineIndex = newWines.findIndex(existing =>
                  existing.wineryId === wineryId &&
                  (existing.id === w.id || existing.name.toLowerCase().trim() === w.name.toLowerCase().trim())
                );

                if (existingWineIndex >= 0) {
                  // Update Wine
                  const existing = newWines[existingWineIndex];
                  newWines[existingWineIndex] = {
                    ...existing,
                    ...w,
                    id: existing.id,
                    wineryId: wineryId, // Ensure link
                    image: (w.image && !w.image.includes("placeholder")) ? w.image : existing.image
                  };
                  updatedWines++;
                } else {
                  // Add Wine
                  const newWineId = w.id && !newWines.some(nw => nw.id === w.id) ? w.id : "wine_" + (Date.now() + idx).toString() + Math.random().toString(36).substr(2, 5);

                  const newWine: Wine = {
                    ...w,
                    id: newWineId,
                    wineryId: wineryId,
                    image: w.image || "https://via.placeholder.com/150x400?text=" + encodeURIComponent(w.name || "VINO")
                  };
                  newWines.push(newWine);
                  addedWines++;
                }
              });
            }

          } catch (err) {
            console.error("Error processing item:", item, err);
            errors++;
          }
        }

        // Handle Glossary Import
        if (importedGlossary.length > 0) {
          const currentTerms = new Set(newGlossary.map(g => g.term.toLowerCase()));
          const uniqueNewTerms = importedGlossary.filter((g: any) => !currentTerms.has(g.term.toLowerCase()));
          if (uniqueNewTerms.length > 0) {
            newGlossary = [...newGlossary, ...uniqueNewTerms];
          }
        }

        // ATOMIC BULK UPDATE
        // We use the Accumulators to update everything at once, preventing race conditions
        onBulkUpdate({
          wines: newWines,
          wineries: newWineries,
          glossary: newGlossary
        });

        alert(`✅ IMPORTAZIONE COMPLETATA!\n\nCantine Aggiunte: ${addedWineries}\nCantine Aggiornate: ${updatedWineries}\nVini Aggiunti: ${addedWines}\nVini Aggiornati: ${updatedWines}\nTermini Glossario: ${importedGlossary.length}`);

        // Auto-switch Region if needed
        if (lastImportedRegion) {
          // Use the resolved region ID from the last added winery
          // We can't easily get the object here without searching, but we tracked lastImportedRegion
          // Actually, better to track the RESOLVED ID in the loop.
          // RETROACTIVE FIX: We will rely on what we have or improved logic below.
        }

        // Better Logic: Check the last added/updated winery's resolved region
        const lastWinery = newWineries[newWineries.length - 1]; // Or find the one we touched
        if (lastWinery) {
          const regionId = getWineryRegion(lastWinery);
          const isPiemonte = PIEMONTE_REGIONS.some(r => r.id === regionId);
          const isVda = WINE_REGIONS.some(r => r.id === regionId);

          if (isPiemonte) {
            setAdminRegion('piemonte');
          } else if (isVda) {
            setAdminRegion('vda');
          }
          // If 'unknown', stay.
        }

        setActiveTab('wineries');

      } catch (err: any) {
        alert("❌ Errore Importazione JSON: " + err.message);
      } finally {
        if (event.target) event.target.value = '';
      }
    };
    reader.readAsText(file);
  };

  const handleGenerateGlossary = async () => {
    if (wines.length === 0 && wineries.length === 0) {
      alert("Aggiungi prima vini o cantine per generare il glossario!");
      return;
    }

    if (!confirm("Questa operazione analizzerà tutti i vini e le cantine per generare nuovi termini. Vuoi procedere?")) return;

    setIsLoadingAi(true);
    try {
      const newTerms = await generateGlossaryFromWines(wines, wineries);
      // Evitiamo duplicati
      const currentTerms = new Set(glossary.map(g => g.term.toLowerCase()));
      const uniqueNewTerms = newTerms.filter(t => !currentTerms.has(t.term.toLowerCase()));

      if (uniqueNewTerms.length === 0) {
        alert("L'AI non ha trovato nuovi termini da aggiungere.");
      } else {
        onUpdateGlossary([...glossary, ...uniqueNewTerms]);
        alert(`✨ Generati ${uniqueNewTerms.length} nuovi termini nel glossario!`);
      }
    } catch (e) {
      alert("Errore durante la generazione del glossario.");
    } finally {
      setIsLoadingAi(false);
    }
  };

  const handleRestoreBackup = async () => {
    if (!confirm("Vuoi tentare di recuperare i dati dal backup di emergenza (Crotta)?")) return;

    const recoveryData: GlossaryItem[] = [
      { term: "Vegneron", definition: "Termine in dialetto valdostano che significa \"viticoltore\". Celebra il lavoro umano e la sapienza tramandata nel tempo.", category: "Territorio" },
      { term: "Viticoltura Eroica", definition: "Coltivazione della vite in ambienti estremi o difficili (forti pendenze, alta quota, terrazzamenti) che richiede lavoro interamente manuale.", category: "Territorio" },
      { term: "Terreni Morenici Sabbiosi", definition: "Terreni di origine glaciale (morena). Sono molto drenanti e magri, ideali per donare mineralità ed eleganza ai vini di montagna.", category: "Territorio" },
      { term: "Mosto", definition: "Il succo d'uva, non ancora fermentato o solo in parte, contenente bucce, semi e lieviti. È la materia prima da cui si ottiene il vino.", category: "Tecnica" },
      { term: "Fecce", definition: "Residuo solido che si deposita sul fondo del tino dopo la fermentazione, composto principalmente da lieviti esausti e altre particelle.", category: "Tecnica" },
      { term: "Composti Polifenolici", definition: "Vasta famiglia di composti chimici (tannini, antociani) presenti nella buccia e nei semi dell'uva. Influenzano colore e struttura.", category: "Tecnica" },
      { term: "Tannini", definition: "Polifenoli con sapore amarognolo e astringente. Provengono da bucce, semi e legno. Cruciali per la struttura dei vini rossi.", category: "Tecnica" },
      { term: "Pruina", definition: "Sostanza cerosa e biancastra che ricopre l'acino d'uva. Nel Fumin è intensa e bluastra (da cui il nome 'fumé').", category: "Vitigno" },
      { term: "Tostatura", definition: "Trattamento termico delle botti per sviluppare aromi (vaniglia, spezie).", category: "Tecnica" },
      { term: "Macerazione", definition: "Periodo di contatto tra mosto e bucce per estrarre colore e tannini.", category: "Tecnica" },
      { term: "Rimontaggio", definition: "Tecnica che preleva il mosto dal fondo per irrorare il cappello di vinaccia.", category: "Tecnica" },
      { term: "Bâtonnage", definition: "L'azione di rimettere in sospensione le fecce fini per dare morbidezza al vino.", category: "Tecnica" },
      { term: "Affinamento in Legno", definition: "Maturazione in botti di rovere per integrare struttura e aromi.", category: "Tecnica" },
      { term: "Affinamento in Acciaio", definition: "Maturazione in vasche inox per preservare freschezza e frutto.", category: "Tecnica" },
      { term: "Antociani", definition: "Polifenoli responsabili del colore rosso dei vini.", category: "Tecnica" },
      { term: "Moscato Bianco", definition: "Vitigno aromatico storico (Chambave Muscat). Sentori di salvia, timo, pesca.", category: "Vitigno" },
      { term: "Syrah", definition: "Vitigno internazionale che in Valle dà vini speziati e potenti.", category: "Vitigno" },
      { term: "Fumin", definition: "Vitigno autoctono valdostano. Buccia blu, vini strutturati e longevi.", category: "Vitigno" },
      { term: "Petit Rouge", definition: "Vitigno autoctono più diffuso. Base del Torrette e Chambave Rouge.", category: "Vitigno" },
      { term: "Gamay", definition: "Vitigno di origine borgognona, regala vini freschi e fruttati.", category: "Vitigno" },
      { term: "Pinot Noir", definition: "Il principe dei rossi internazionali, qui si esprime con eleganza alpina.", category: "Vitigno" },
      { term: "Prié Blanc", definition: "Vitigno autoctono della Valdigne, franco di piede, tra i più alti d'Europa.", category: "Vitigno" }
    ];

    const currentTerms = new Set(glossary.map(g => g.term.toLowerCase()));
    const uniqueRecovered = recoveryData.filter(t => !currentTerms.has(t.term.toLowerCase()));

    if (uniqueRecovered.length > 0) {
      onUpdateGlossary([...glossary, ...uniqueRecovered]);
      alert(`✅ Recuperate ${uniqueRecovered.length} voci dal backup di emergenza!`);
    } else {
      alert("Tutte le voci del backup sono già presenti.");
    }
  };

  // --- GLOSSARY SPECIFIC BACKUP ---
  const handleExportGlossaryOnly = () => {
    const dataStr = JSON.stringify(glossary, null, 2);
    const blob = new Blob([dataStr], { type: "application/json" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = `glossary_backup_${new Date().toISOString().split('T')[0]}.json`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const handleImportGlossaryOnly = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = async (e) => {
      try {
        const text = e.target?.result;
        if (typeof text !== "string") return;
        const imported = JSON.parse(text);

        if (!Array.isArray(imported)) {
          alert("❌ Il file non è valido. Deve contenere una lista di termini.");
          return;
        }

        const currentTerms = new Set(glossary.map(g => g.term.toLowerCase()));
        const newItems = imported.filter((item: GlossaryItem) =>
          item.term && !currentTerms.has(item.term.toLowerCase())
        );

        if (newItems.length > 0) {
          const merged = [...glossary, ...newItems];
          onUpdateGlossary(merged);
          alert(`✅ Importati con successo ${newItems.length} nuovi termini!`);
        } else {
          alert("⚠️ Nessun termine nuovo trovato. Erano tutti già presenti.");
        }
      } catch (err) {
        console.error(err);
        alert("❌ Errore durante la lettura del file.");
      }
    };
    reader.readAsText(file);
    // Reset input
    event.target.value = '';
  };

  // --- WINE SPECIFIC EXPORT/IMPORT START ---

  const handleExportWinesFull = () => {
    if (wines.length === 0) {
      alert("Nessun vino da esportare.");
      return;
    }
    const dataStr = "data:text/json;charset=utf-8," + encodeURIComponent(JSON.stringify(filteredWines, null, 2));
    const downloadAnchorNode = document.createElement('a');
    downloadAnchorNode.setAttribute("href", dataStr);
    downloadAnchorNode.setAttribute("download", `wines_full_${new Date().toISOString().split('T')[0]}.json`);
    document.body.appendChild(downloadAnchorNode);
    downloadAnchorNode.click();
    downloadAnchorNode.remove();
  };

  const handleExportWinesNoImages = () => {
    if (wines.length === 0) {
      alert("Nessun vino da esportare.");
      return;
    }
    // Create copy without images
    const winesNoImg = filteredWines.map(({ image, ...rest }) => rest);

    const dataStr = "data:text/json;charset=utf-8," + encodeURIComponent(JSON.stringify(winesNoImg, null, 2));
    const downloadAnchorNode = document.createElement('a');
    downloadAnchorNode.setAttribute("href", dataStr);
    downloadAnchorNode.setAttribute("download", `wines_no_img_${new Date().toISOString().split('T')[0]}.json`);
    document.body.appendChild(downloadAnchorNode);
    downloadAnchorNode.click();
    downloadAnchorNode.remove();
  };

  const handleImportWinesFull = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    if (!confirm("ATTENZIONE: Importazione Completa Vini.\n\nI vini nel file verranno aggiunti o sovrascritti (inclusi i dati delle immagini).\n\nProcedere?")) return;

    const reader = new FileReader();
    reader.onload = async (e) => {
      try {
        const text = e.target?.result as string;
        const data = JSON.parse(text);

        let winesToImport: Wine[] = [];
        if (Array.isArray(data)) winesToImport = data;
        else if (data.wines) winesToImport = data.wines;
        else { alert("Formato file non riconosciuto (atteso array di vini o oggetto {wines: []})."); return; }

        let updated = 0;
        let added = 0;

        winesToImport.forEach(w => {
          const existing = wines.find(ex => ex.id === w.id);
          if (existing) {
            onUpdateWine(w);
            updated++;
          } else {
            // Ensure basics
            if (!w.id) w.id = "wine_" + Date.now() + Math.random().toString(36).substr(2, 5);
            onAddWine(w);
            added++;
          }
        });
        alert(`✅ Importazione Completa Riuscita!\n\nAggiornati: ${updated}\nAggiunti: ${added}`);
      } catch (err: any) { alert("❌ Errore import: " + err.message); }
    };
    reader.readAsText(file);
    event.target.value = '';
  };

  const handleImportWinesNoImages = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    if (!confirm("ATTENZIONE: Importazione No Immagini.\n\nQuesto aggiornerà i dati dei vini (nomi, descrizioni, prezzi...) MA IGNORERÀ le immagini contenute nel file, preservando quelle già presenti nel database.\n\nProcedere?")) return;

    const reader = new FileReader();
    reader.onload = async (e) => {
      try {
        const text = e.target?.result as string;
        const data = JSON.parse(text);

        let winesToImport: any[] = [];
        if (Array.isArray(data)) winesToImport = data;
        else if (data.wines) winesToImport = data.wines;
        else { alert("Formato file non riconosciuto."); return; }

        let updated = 0;
        let added = 0;

        winesToImport.forEach(w => {
          // Strip image from imported data
          const { image, ...rest } = w;

          const existing = wines.find(ex => ex.id === w.id);
          if (existing) {
            // Update everything EXCEPT image (use existing image)
            onUpdateWine({ ...existing, ...rest });
            updated++;
          } else {
            // Add new, but without image (or placeholder if mandatory)
            const newWine = {
              ...rest,
              image: "https://via.placeholder.com/150x400?text=NO+IMG",
              id: w.id || "wine_" + Date.now() + Math.random().toString(36).substr(2, 5)
            } as Wine;
            onAddWine(newWine);
            added++;
          }
        });
        alert(`✅ Importazione (No Immagini) Riuscita!\n\nAggiornati: ${updated}\nAggiunti: ${added}`);
      } catch (err: any) { alert("❌ Errore import: " + err.message); }
    };
    reader.readAsText(file);
    event.target.value = '';
  };
  // --- WINE SPECIFIC EXPORT/IMPORT END ---

  const handleExecuteAction = (action: AgentAction) => {
    try {
      switch (action.type) {
        case 'UPDATE_WINES': {
          const updates = Array.isArray(action.data) ? action.data : [];
          // Use batch update to save ALL wine updates atomically
          onBatchUpdateWines(updates);
          alert(`✅ Aggiornati ${updates.length} vini!`);
          break;
        }
        case 'UPDATE_MENU': {
          const updates = Array.isArray(action.data) ? action.data : [];
          let updatedMenu = [...menu];
          let count = 0;
          for (const update of updates) {
            const idx = updatedMenu.findIndex(m => m.id === update.id);
            if (idx >= 0) {
              updatedMenu[idx] = { ...updatedMenu[idx], ...update };
              count++;
            }
          }
          onUpdateMenu(updatedMenu);
          alert(`✅ Aggiornati ${count} piatti del menu!`);
          break;
        }
        case 'DRAFT_WINE':
          let wId = action.data.wineryId || "";
          if (!wId && action.data.winery) {
            const found = wineries.find(w => w.name.toLowerCase().includes(action.data.winery.toLowerCase()));
            if (found) wId = found.id;
          }

          if (!wId) {
            alert(`⚠️ Attenzione: Cantina "${action.data.winery}" non trovata nel database. Il vino sarà salvato ma potrebbe non essere visibile finché non lo associ a una cantina.`);
          }

          const newWine: Wine = {
            ...action.data,
            id: action.data.id || `wine_${Date.now()}`,
            wineryId: wId,
            priceRange: action.data.priceRange || '€€',
            image: action.data.image || "https://via.placeholder.com/150x400?text=" + encodeURIComponent(action.data.name || "VINO")
          };
          onAddWine(newWine);
          alert(`✅ Vino "${newWine.name}" aggiunto con successo!`);
          break;

        case 'DRAFT_MENU':
          const newItem: MenuItem = {
            ...action.data,
            id: action.data.id || `menu_${Date.now()}`,
            image: action.data.image || "",
            allergens: action.data.allergens || ""
          };
          onUpdateMenu([...menu, newItem]);
          alert(`✅ Piatto "${newItem.name}" aggiunto al menu!`);
          break;

        case 'BULK_MENU':
          // Handle bulk menu import - action.data can be array or object { detected_language, items }
          const rawData = action.data as any;
          const bulkItems = Array.isArray(rawData) ? rawData : (rawData.items || []);

          if (!Array.isArray(bulkItems)) {
            alert("❌ Errore: i dati del menu non sono in formato corretto.");
            break;
          }

          const newItems: MenuItem[] = bulkItems.map((item: any, idx: number) => ({
            id: `menu_${Date.now()}_${idx}`,
            name: item.name || "Piatto",
            category: item.category || "Antipasti",
            price: String(item.price || "0"),
            description: item.description || "",
            allergens: item.allergens || "",
            story: item.story || "",
            preparation: item.preparation || "",
            image: item.image || "",

            // Multilanguage support
            name_en: item.name_en,
            description_en: item.description_en,
            name_fr: item.name_fr,
            description_fr: item.description_fr,
          }));

          onUpdateMenu([...menu, ...newItems]);
          alert(`✅ Aggiunti ${newItems.length} piatti al menu!\n\n${newItems.map(i => `• ${i.name} (${i.category}) - ${i.price}€`).join('\n')}`);
          break;

        case 'DRAFT_WINERY':
          const newWinery: Winery = {
            ...action.data,
            id: action.data.id || `winery_${Date.now()}`,
            coordinates: action.data.coordinates || { lat: 45, lng: 7 },
            image: action.data.image || "https://via.placeholder.com/800x600?text=" + encodeURIComponent(action.data.name || "Cantina")
          };
          onAddWinery(newWinery);

          // Handle attached wines if present
          let wineMsg = "";
          if (Array.isArray(action.data.wines) && action.data.wines.length > 0) {
            const newWines: Wine[] = action.data.wines.map((w: any, idx: number) => ({
              ...w,
              id: `wine_${Date.now()}_${idx}`,
              wineryId: newWinery.id,
              priceRange: w.priceRange || '€€',
              image: w.image || "https://via.placeholder.com/150x400?text=" + encodeURIComponent(w.name || "VINO")
            }));

            newWines.forEach(w => onAddWine(w));
            wineMsg = `\n\nSono stati aggiunti anche ${newWines.length} vini al catalogo.`;
          }

          // Handle attached glossary items if present
          let glossaryMsg = "";
          if (Array.isArray(action.data.glossary) && action.data.glossary.length > 0) {
            const currentTerms = new Set(glossary.map(g => g.term.toLowerCase()));
            const uniqueNewTerms = action.data.glossary.filter((g: any) => !currentTerms.has(g.term.toLowerCase()));

            if (uniqueNewTerms.length > 0) {
              onUpdateGlossary([...glossary, ...uniqueNewTerms]);
              glossaryMsg = `\n\n+ ${uniqueNewTerms.length} nuovi termini aggiunti al Glossario.`;
            }
          }

          alert(`✅ Cantina "${newWinery.name}" aggiunta con successo!${wineMsg}${glossaryMsg}`);
          break;

        case 'TRANSLATE_PREVIEW':
          alert("Per applicare le traduzioni, copia e incolla i testi manualmente per ora.");
          break;
      }
    } catch (e: any) {
      alert(`❌ Errore durante l'azione: ${e.message}`);
    }
  };

  return (
    <div className="p-4 pb-32 space-y-8 animate-in fade-in duration-500 bg-[#fcfbf9] min-h-screen">
      <div className="flex justify-between items-center px-1">
        <h1 className="text-lg font-serif font-bold text-stone-800">Admin Panel</h1>
        <button
          onClick={onLogout}
          className="flex items-center gap-2 px-3 py-1.5 bg-red-50 text-red-600 rounded-lg text-[10px] font-bold uppercase tracking-widest border border-red-100 hover:bg-red-100 transition-colors"
        >
          <LogOut size={14} /> Esci
        </button>
      </div>

      {/* REGION TOGGLE SWITCHER */}
      <div className="flex justify-center mb-6">
        <div className="bg-white p-1 rounded-xl shadow-sm border border-stone-200 flex gap-2">
          <button
            onClick={() => setAdminRegion('vda')}
            className={`px-6 py-2 rounded-lg font-bold uppercase tracking-widest text-[10px] transition-all flex items-center gap-2 ${adminRegion === 'vda' ? 'bg-stone-800 text-[#D4AF37] shadow-lg' : 'text-stone-400 hover:bg-stone-50'}`}
          >
            ⛰️ L'Ascesa (VDA)
          </button>
          <div className="w-px bg-stone-200 my-1"></div>
          <button
            onClick={() => setAdminRegion('piemonte')}
            className={`px-6 py-2 rounded-lg font-bold uppercase tracking-widest text-[10px] transition-all flex items-center gap-2 ${adminRegion === 'piemonte' ? 'bg-stone-800 text-[#D4AF37] shadow-lg' : 'text-stone-400 hover:bg-stone-50'}`}
          >
            🌫️ La Discesa (Piemonte)
          </button>
        </div>
      </div>

      <div className="flex bg-stone-100 p-1 rounded-2xl shadow-inner overflow-x-auto no-scrollbar">
        {[
          { id: 'wines', icon: WineIcon, label: 'Vini' },
          { id: 'wineries', icon: Store, label: 'Cantine' },
          { id: 'menu', icon: UtensilsCrossed, label: 'Menu' },
          { id: 'glossary', icon: BookOpen, label: 'Glossario' },
          { id: 'ai_instructions', icon: Bot, label: 'Centrale Operativa' },
          { id: 'settings', icon: Globe, label: 'Database' }
        ].map(tab => (
          <button
            key={tab.id}
            onClick={() => { setActiveTab(tab.id as AdminTab); resetForms(); lastScrollPos.current = 0; }}
            className={`flex-1 min-w-[70px] flex flex-col items-center justify-center gap-1 py-3 rounded-xl font-sans text-[8px] font-bold uppercase tracking-widest transition-all ${activeTab === tab.id ? 'bg-white text-stone-800 shadow-sm' : 'text-stone-400'}`}
          >
            <tab.icon size={16} className={activeTab === tab.id ? 'text-[#D4AF37]' : ''} /> {tab.label}
          </button>
        ))}
      </div>

      {activeTab === 'wines' && (
        <div className="space-y-6">
          {/* ... Wines Header ... */}
          <div className="flex justify-between items-center">
            <div className="flex items-center gap-3">
              <h2 className="text-xl font-serif font-bold text-stone-800 uppercase tracking-tighter">Catalogo Vini</h2>

              {/* WINE SEARCH BAR */}
              <div className="relative">
                <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-stone-400" />
                <input
                  type="text"
                  placeholder="Cerca vino..."
                  className="pl-9 pr-4 py-1.5 bg-white border border-stone-200 rounded-full text-xs focus:outline-none focus:ring-2 focus:ring-[#D4AF37]/20 w-48 transition-all"
                  value={wineSearchTerm}
                  onChange={(e) => setWineSearchTerm(e.target.value)}
                />
                {wineSearchTerm && (
                  <button
                    onClick={() => setWineSearchTerm('')}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-stone-300 hover:text-stone-500"
                  >
                    <Trash2 size={10} /> {/* Using Trash as clear icon or X if available, mostly X is better but using what I have imported or simple char */}
                  </button>
                )}
              </div>

              <button
                onClick={() => setShowHiddenWines(!showHiddenWines)}
                className={`text-[9px] px-3 py-1.5 rounded-full font-bold uppercase tracking-wider transition-all ${showHiddenWines ? 'bg-red-100 text-red-600' : 'bg-stone-100 text-stone-500'}`}
              >
                {showHiddenWines ? `Nascosti (${wines.filter(w => w.hidden).length})` : `Visibili (${wines.filter(w => !w.hidden).length})`}
              </button>
            </div>
            <div className="flex gap-2 items-center">
              {/* EXPORT GROUP */}
              <button onClick={handleExportWinesFull} className="p-2 bg-stone-100 text-stone-600 rounded-full shadow-lg hover:bg-stone-200" title="Esporta Vini (Completo)"><Download size={18} /></button>
              <button onClick={handleExportWinesNoImages} className="p-2 bg-stone-100 text-stone-400 rounded-full shadow-lg hover:bg-stone-200" title="Esporta Vini (No Foto)"><FileText size={18} /></button>

              <div className="h-4 w-px bg-stone-200 mx-1" />

              {/* IMPORT GROUP */}
              <label className="p-2 bg-stone-100 text-stone-600 rounded-full shadow-lg hover:bg-stone-200 cursor-pointer" title="Importa Vini (Completo)">
                <Upload size={18} />
                <input type="file" accept=".json" className="hidden" onChange={handleImportWinesFull} />
              </label>
              <label className="p-2 bg-purple-50 text-purple-600 rounded-full shadow-lg hover:bg-purple-100 cursor-pointer border border-purple-100" title="Importa Vini (No Foto - Mantiene Immagini Esistenti)">
                <Sparkles size={18} />
                <input type="file" accept=".json" className="hidden" onChange={handleImportWinesNoImages} />
              </label>

              <div className="h-4 w-px bg-stone-200 mx-1" />

              <button onClick={onWipeWines} className="p-2 bg-red-100 text-red-600 rounded-full shadow-lg hover:bg-red-200" title="Svuota Vini"><Trash size={18} /></button>
              <button onClick={() => setIsAdding(true)} className="p-2 bg-stone-800 text-[#D4AF37] rounded-full shadow-lg"><Plus /></button>
            </div>
          </div>

          {/* ... Wineries Header ... */}
          {/* ... (Actually I need to target specific blocks. Let's start with Wines Header lines 240-251) */}
          {isAdding || editingId ? (
            <div className="bg-white p-6 rounded-[2rem] border shadow-xl space-y-4">
              <input placeholder="Nome Vino (es. Donnas DOC 2020)" className="w-full bg-stone-50 border border-stone-300 rounded-lg px-4 py-2 text-sm focus:outline-none focus:border-[#D4AF37] text-stone-700 font-medium transition-colors" value={wineForm.name} onChange={e => setWineForm({ ...wineForm, name: e.target.value })} />
              <select className="w-full bg-stone-50 border border-stone-300 rounded-lg px-4 py-2 text-sm focus:outline-none focus:border-[#D4AF37] text-stone-700 font-medium transition-colors" value={wineForm.wineryId} onChange={e => setWineForm({ ...wineForm, wineryId: e.target.value })}>
                <option value="">Seleziona Cantina...</option>
                {filteredWineries.map(w => <option key={w.id} value={w.id}>{w.name}</option>)}
              </select>

              <select className="w-full bg-stone-50 border border-stone-300 rounded-lg px-4 py-2 text-sm focus:outline-none focus:border-[#D4AF37] text-stone-700 font-medium transition-colors" value={wineForm.type || ''} onChange={e => setWineForm({ ...wineForm, type: e.target.value as any })}>
                <option value="">Seleziona Tipologia (per Calice)...</option>
                <option value="red">Rosso</option>
                <option value="white">Bianco</option>
                <option value="rose">Rosato</option>
                <option value="sparkling_rose">Rosato Frizzante</option>
                <option value="sparkling">Bollicine / Spumante</option>
                <option value="dessert">Dolce / Passito</option>
              </select>

              <label className="text-[10px] uppercase font-bold text-stone-500 tracking-widest ml-1">VITIGNI & GRADAZIONE</label>
              <div className="grid grid-cols-2 gap-3">
                <input placeholder="Vitigni (es. Nebbiolo 100%)" className="w-full bg-stone-50 border border-stone-300 rounded-lg px-4 py-2 text-sm focus:outline-none focus:border-[#D4AF37] text-stone-700 font-medium transition-colors" value={wineForm.grapes} onChange={e => setWineForm({ ...wineForm, grapes: e.target.value })} />
                <input placeholder="Gradazione (es. 13.5%)" className="w-full bg-stone-50 border border-stone-300 rounded-lg px-4 py-2 text-sm focus:outline-none focus:border-[#D4AF37] text-stone-700 font-medium transition-colors" value={wineForm.alcohol} onChange={e => setWineForm({ ...wineForm, alcohol: e.target.value })} />
              </div>

              <label className="text-[10px] uppercase font-bold text-stone-500 tracking-widest ml-1">TEMPERATURA DI SERVIZIO</label>
              <div className="grid grid-cols-2 gap-3">
                <input placeholder="Temperatura (es. 16-18°C)" className="w-full bg-stone-50 border border-stone-300 rounded-lg px-4 py-2 text-sm focus:outline-none focus:border-[#D4AF37] text-stone-700 font-medium transition-colors" value={wineForm.temperature} onChange={e => setWineForm({ ...wineForm, temperature: e.target.value })} />
                {/* Altitude removed as per user request */}
              </div>

              <label className="text-[10px] uppercase font-bold text-stone-500 tracking-widest ml-1">ABBINAMENTI CONSIGLIATI</label>
              <input placeholder="Abbinamenti (es. Carni rosse, Fontina)" className="w-full bg-stone-50 border border-stone-300 rounded-lg px-4 py-2 text-sm focus:outline-none focus:border-[#D4AF37] text-stone-700 font-medium transition-colors" value={wineForm.pairing} onChange={e => setWineForm({ ...wineForm, pairing: e.target.value })} />

              <label className="text-[10px] uppercase font-bold text-stone-500 tracking-widest ml-1">DESCRIZIONE</label>
              <textarea placeholder="Descrivi il vino..." className="w-full bg-stone-50 border border-stone-300 rounded-lg px-4 py-2 text-sm focus:outline-none focus:border-[#D4AF37] text-stone-700 font-medium h-32 leading-relaxed p-4 transition-colors" value={wineForm.description} onChange={e => setWineForm({ ...wineForm, description: e.target.value })} />

              <label className="text-[10px] uppercase font-bold text-stone-500 tracking-widest ml-1">PROFILO SENSORIALE</label>
              <textarea placeholder="Descrivi il profilo sensoriale..." className="w-full bg-stone-50 border border-stone-300 rounded-lg px-4 py-2 text-sm focus:outline-none focus:border-[#D4AF37] text-stone-700 font-medium h-32 leading-relaxed p-4 transition-colors" value={wineForm.sensoryProfile || ''} onChange={e => setWineForm({ ...wineForm, sensoryProfile: e.target.value })} />

              <label className="text-[10px] uppercase font-bold text-stone-500 tracking-widest ml-1">CURIOSITÀ (LO SAPEVI CHE?)</label>
              <textarea placeholder="Aggiungi una curiosità o un aneddoto..." className="w-full bg-stone-50 border border-stone-300 rounded-lg px-4 py-2 text-sm focus:outline-none focus:border-[#D4AF37] text-stone-700 font-medium h-24 leading-relaxed p-4 transition-colors" value={wineForm.curiosity || ''} onChange={e => setWineForm({ ...wineForm, curiosity: e.target.value })} />



              <div className="flex items-end gap-2">
                <div className="flex-1">
                  <input
                    placeholder="Prezzo in Carta (es. 25 o 119 (2014); 125 (2013))"
                    className="w-full bg-stone-50 border border-stone-300 rounded-lg px-4 py-2 text-sm focus:outline-none focus:border-[#D4AF37] text-stone-700 font-medium transition-colors"
                    value={wineForm.price || ''}
                    onChange={e => setWineForm({ ...wineForm, price: e.target.value })}
                  />
                </div>
                <button
                  onClick={() => {
                    const raw = wineForm.price || "";
                    // Regex to find patterns like "119 (2014)" or "125(2013)"
                    // Matches: Price part (digits/dots/commas) + Space? + ( + Year (4 digits) + )
                    // Global match to find all
                    const regex = /([\d.,]+)\s*\(\s*(\d{4})\s*\)/g;
                    let match;
                    const newVintages = [];

                    while ((match = regex.exec(raw)) !== null) {
                      // match[1] is price, match[2] is year
                      newVintages.push({
                        price: match[1].trim(),
                        year: match[2].trim()
                      });
                    }

                    if (newVintages.length > 0) {
                      if (confirm(`Trovate ${newVintages.length} annate nel testo del prezzo. Vuoi generare la lista "Annate & Prezzi"?\n\n${newVintages.map(v => `${v.year}: €${v.price}`).join('\n')}`)) {
                        setWineForm(prev => ({
                          ...prev,
                          vintages: [...(prev.vintages || []), ...newVintages],
                          price: prev.price // Keep the text as is, or clear it? User usually wants one or other. Let's keep it as is for safety, or maybe just "Vedi lista annate"
                          // Actually, users often want the text "Price Range" if vintages exist.
                          // Let's just append invalidating nothing.
                        }));
                      }
                    } else {
                      alert("Nessun formato 'Prezzo (Anno)' trovato nel testo.\nUsa ad esempio: '119 (2014); 125 (2013)'");
                    }
                  }}
                  className="p-2 bg-purple-100 text-purple-600 rounded-lg hover:bg-purple-200 transition-colors mb-[1px]"
                  title="Estrai Annate dal Testo"
                >
                  <Sparkles size={18} />
                </button>
              </div>

              {/* GESTIONE ANNATE */}
              <div className="space-y-3 p-4 bg-stone-50 rounded-xl border border-dashed border-stone-300">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <span className="text-xs uppercase tracking-widest text-stone-600 font-bold">Annate & Prezzi</span>
                  </div>
                  <button
                    onClick={() => setWineForm({ ...wineForm, vintages: [...(wineForm.vintages || []), { year: '', price: '' }] })}
                    className="bg-stone-800 text-[#D4AF37] px-3 py-1 rounded-lg text-[9px] uppercase font-bold tracking-widest hover:bg-black transition-all flex items-center gap-1"
                  >
                    <Plus size={12} /> Aggiungi Annata
                  </button>
                </div>

                {(wineForm.vintages && wineForm.vintages.length > 0) ? (
                  <div className="grid gap-2">
                    {wineForm.vintages.map((v, idx) => (
                      <div key={idx} className="flex gap-2 items-center">
                        <input
                          placeholder="Annata (es. 2018)"
                          className="admin-input flex-1 bg-white min-w-[100px]"
                          value={v.year || ''}
                          onChange={e => {
                            const newVintages = [...(wineForm.vintages || [])];
                            newVintages[idx] = { ...newVintages[idx], year: e.target.value };
                            setWineForm({ ...wineForm, vintages: newVintages });
                          }}
                        />
                        <input
                          placeholder="Prezzo (€)"
                          className="admin-input w-24 bg-white min-w-[80px]"
                          value={v.price || ''}
                          onChange={e => {
                            const newVintages = [...(wineForm.vintages || [])];
                            newVintages[idx] = { ...newVintages[idx], price: e.target.value };
                            setWineForm({ ...wineForm, vintages: newVintages });
                          }}
                        />
                        <button
                          onClick={() => {
                            const newVintages = wineForm.vintages!.filter((_, i) => i !== idx);
                            setWineForm({ ...wineForm, vintages: newVintages });
                          }}
                          className="p-2 text-red-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                        >
                          <Trash2 size={16} />
                        </button>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="text-center py-2 text-stone-400 text-[10px] italic">
                    Nessuna annata specifica inserita (usa prezzo standard)
                  </div>
                )}
              </div>

              {/* CAMPO UPLOAD IMMAGINE VINO */}
              <div className="space-y-3 p-4 bg-stone-50 rounded-xl border border-dashed border-stone-300">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <ImageIcon size={18} className="text-[#D4AF37]" />
                    <span className="text-xs uppercase tracking-widest text-stone-600 font-bold">Foto Bottiglia</span>
                  </div>
                  <label className="cursor-pointer bg-stone-800 text-white px-4 py-2 rounded-lg text-[10px] uppercase font-bold tracking-widest hover:bg-black transition-all flex items-center gap-2">
                    <Upload size={14} /> Scegli File
                    <input
                      type="file"
                      className="hidden"
                      accept="image/*"
                      onChange={async (e) => {
                        const file = e.target.files?.[0];
                        if (file) {
                          try {
                            const compressed = await compressImage(file);
                            setWineForm({ ...wineForm, image: compressed });
                          } catch (err) {
                            alert("Errore caricamento immagine");
                          }
                        }
                      }}
                    />
                  </label>
                </div>
                {wineForm.image ? (
                  <div className="relative group">
                    <img src={wineForm.image} alt="Anteprima" className="w-full h-48 object-contain rounded-lg border bg-white" />
                    <button
                      onClick={() => setWineForm({ ...wineForm, image: '' })}
                      className="absolute top-2 right-2 bg-red-500 text-white p-2 rounded-full opacity-0 group-hover:opacity-100 transition-all shadow-lg"
                    >
                      <Trash2 size={14} />
                    </button>
                  </div>
                ) : (
                  <div className="h-24 flex items-center justify-center text-stone-300 text-xs uppercase tracking-widest">
                    Nessuna immagine selezionata
                  </div>
                )}
              </div>

              <div className="flex gap-2">
                <button onClick={() => {
                  if (isAdding) onAddWine({ ...wineForm, id: "wine_" + Date.now().toString() } as Wine);
                  else if (editingId) onUpdateWine({ ...wineForm, id: editingId } as Wine);
                  resetForms();
                }} className="flex-1 bg-stone-800 text-[#D4AF37] py-4 rounded-xl font-bold uppercase text-[10px] tracking-widest">Salva</button>
                <button onClick={resetForms} className="px-6 bg-stone-100 text-stone-500 rounded-xl font-bold uppercase text-[10px]">Annulla</button>
              </div>
            </div>
          ) : (
            <div className="grid gap-3">
              {filteredWines.filter(w => {
                const matchesVisibility = showHiddenWines ? w.hidden : !w.hidden;
                const matchesSearch = wineSearchTerm === '' ||
                  w.name.toLowerCase().includes(wineSearchTerm.toLowerCase()) ||
                  w.grapes?.toLowerCase().includes(wineSearchTerm.toLowerCase()) ||
                  w.type?.toLowerCase().includes(wineSearchTerm.toLowerCase());
                return matchesVisibility && matchesSearch;
              }).length === 0 ? (
                <div className="text-center py-10 text-stone-400 font-serif italic">
                  {wineSearchTerm ? 'Nessun vino trovato con questa ricerca' : (showHiddenWines ? 'Nessun vino nascosto' : `Nessun vino visibile in ${adminRegion === 'vda' ? 'Valle d\'Aosta' : 'Piemonte'}`)}
                </div>
              ) : filteredWines.filter(w => {
                const matchesVisibility = showHiddenWines ? w.hidden : !w.hidden;
                const matchesSearch = wineSearchTerm === '' ||
                  w.name.toLowerCase().includes(wineSearchTerm.toLowerCase()) ||
                  w.grapes?.toLowerCase().includes(wineSearchTerm.toLowerCase()) ||
                  w.type?.toLowerCase().includes(wineSearchTerm.toLowerCase());
                return matchesVisibility && matchesSearch;
              }).map(wine => (
                <div key={wine.id} className={`bg-white p-4 rounded-2xl flex items-center justify-between border shadow-sm ${wine.hidden ? 'bg-red-50 border-red-200' : ''}`}>
                  <div className="flex items-center gap-3">
                    {wine.image && <img src={wine.image} alt={wine.name} className="w-10 h-14 object-cover rounded" />}
                    <div>
                      <p className="font-serif font-bold text-stone-800">
                        {wine.name}
                      </p>
                      <p className="text-[9px] text-stone-400 uppercase">{wine.grapes}</p>
                    </div>
                  </div>
                  <div className="flex gap-1">
                    <button
                      onClick={() => onUpdateWine({ ...wine, hidden: !wine.hidden })}
                      className={`p-2 ${wine.hidden ? 'text-green-500 hover:bg-green-50' : 'text-red-400 hover:bg-red-50'} rounded-lg transition-colors`}
                      title={wine.hidden ? 'Rimetti in carta' : 'Togli dalla carta'}
                    >
                      {wine.hidden ? <Eye size={16} /> : <EyeOff size={16} />}
                    </button>
                    <button onClick={() => { setWineForm(wine); setEditingId(wine.id); lastScrollPos.current = window.scrollY; }} className="p-2 text-stone-300"><Edit2 size={16} /></button>
                    <button onClick={() => onDeleteWine(wine.id)} className="p-2 text-stone-300 hover:text-red-600"><Trash2 size={16} /></button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}


      {activeTab === 'wineries' && (
        <div className="space-y-6">
          <div className="flex justify-between items-center">
            <h2 className="text-xl font-serif font-bold text-stone-800 uppercase tracking-tighter">Cantine</h2>
            <div className="flex gap-2 items-center">
              {/* Pulsante TRADUCI TUTTO */}
              <button
                onClick={handleTranslateAllWineries}
                disabled={isLoadingAi}
                className="flex items-center gap-2 px-3 py-1.5 bg-blue-50 text-blue-600 rounded-full text-[10px] font-bold uppercase tracking-widest hover:bg-blue-100 transition-all border border-blue-100 shadow-sm"
                title="Traduci tutte le cantine e vini mancanti"
              >
                {isLoadingAi ? <Loader2 size={14} className="animate-spin" /> : <Globe size={14} />}
                Traduci Tutto
              </button>

              <div className="h-4 w-px bg-stone-200 mx-1" />

              {/* Pulsante UNIFORMA PROFILI SENSORIALI */}
              <button
                onClick={handleNormalizeSensoryProfiles}
                className="p-2 bg-amber-50 text-amber-600 rounded-full shadow-lg hover:bg-amber-100 transition-all border border-amber-100"
                title="Genera Profili Sensoriali mancanti (da Descrizione)"
              >
                <Sparkles size={18} />
              </button>

              <div className="h-4 w-px bg-stone-200 mx-1" />

              {/* Pulsante ESPORTA TUTTO */}
              <button
                onClick={handleExportAllWineries}
                className="p-2 bg-stone-100 text-stone-600 rounded-full shadow-lg hover:bg-stone-200"
                title="Esporta Tutto (Cantine + Vini)"
              >
                <Upload size={18} />
              </button>

              {/* Pulsante ESPORTA VINI (BACKUP) */}
              <button
                onClick={handleExportWinesOnly}
                className="p-2 bg-stone-800 text-[#D4AF37] rounded-full shadow-lg hover:bg-black transition-all border border-stone-700"
                title="Esporta JSON solo Vini (Backup)"
              >
                <WineIcon size={18} />
              </button>

              <div className="h-4 w-px bg-stone-200 mx-1" />

              {/* Pulsante IMPORTA JSON */}
              <label className="p-2 bg-stone-100 text-stone-600 rounded-full shadow-lg hover:bg-stone-200 cursor-pointer" title="Importa JSON Completo">
                <FileJson size={18} />
                <input type="file" accept=".json" className="hidden" onChange={handleJsonImport} />
              </label>

              {/* Pulsante IMPORTA CANTINA SINGOLA */}
              <label className="p-2 bg-emerald-50 text-emerald-600 rounded-full shadow-lg hover:bg-emerald-100 cursor-pointer flex items-center gap-1 border border-emerald-100" title="Importa Cantina Singola (.json)">
                <Store size={14} />
                <Upload size={14} />
                <input type="file" accept=".json" className="hidden" onChange={handleImportSingleWinery} />
              </label>

              {/* Pulsante IMPORTA INTEGRATIVO (FUSIONE) */}
              <label
                className="p-2 bg-purple-50 text-purple-600 rounded-full shadow-lg hover:bg-purple-100 cursor-pointer flex items-center gap-1 border border-purple-100"
                title="Importa e Aggiorna (Mantiene Immagini)"
              >
                <Sparkles size={12} />
                <Upload size={18} />
                <input type="file" accept=".json" className="hidden" onChange={handleIntegrativeImport} />
              </label>

              <button onClick={onWipeWineries} className="p-2 bg-red-100 text-red-600 rounded-full shadow-lg hover:bg-red-200" title="Svuota Cantine"><Trash size={18} /></button>
              <button onClick={() => { setIsAdding(true); lastScrollPos.current = window.scrollY; }} className="p-2 bg-stone-800 text-[#D4AF37] rounded-full shadow-lg"><Plus /></button>
            </div>
          </div>
          {isAdding || editingId ? (
            <div className="bg-white p-6 rounded-[2rem] border shadow-xl space-y-4">
              <input placeholder="Nome Cantina" className="admin-input" value={wineryForm.name} onChange={e => setWineryForm({ ...wineryForm, name: e.target.value })} />
              <input placeholder="Località (es. Donnas, AO)" className="admin-input" value={wineryForm.location} onChange={e => setWineryForm({ ...wineryForm, location: e.target.value })} />
              <div className="space-y-1">
                <label className="text-[10px] uppercase font-bold text-stone-500 tracking-widest ml-1">ZONA / SOTTOZONA</label>
                <select className="admin-input" value={wineryForm.region || ''} onChange={e => setWineryForm({ ...wineryForm, region: e.target.value })}>
                  <option value="">Seleziona Zona...</option>
                  {(adminRegion === 'vda' ? WINE_REGIONS : PIEMONTE_REGIONS).map(r => (
                    <option key={r.id} value={r.id}>{r.label}</option>
                  ))}
                </select>
              </div>
              <label className="text-[10px] uppercase font-bold text-stone-500 tracking-widest ml-1">Descrizione Cantina</label>
              <textarea placeholder="Descrizione / Storia della cantina" className="admin-input h-64 text-sm leading-relaxed p-4" value={wineryForm.description} onChange={e => setWineryForm({ ...wineryForm, description: e.target.value })} />
              <input placeholder="Sito Web (https://...)" className="admin-input" value={wineryForm.website} onChange={e => setWineryForm({ ...wineryForm, website: e.target.value })} />
              <textarea placeholder="Curiosità" className="admin-input h-16" value={wineryForm.curiosity || ''} onChange={e => setWineryForm({ ...wineryForm, curiosity: e.target.value })} />

              {/* CAMPO UPLOAD IMMAGINE CANTINA */}
              <div className="space-y-3 p-4 bg-stone-50 rounded-xl border border-dashed border-stone-300">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <ImageIcon size={18} className="text-[#D4AF37]" />
                    <span className="text-xs uppercase tracking-widest text-stone-600 font-bold">Foto Cantina</span>
                  </div>
                  <label className="cursor-pointer bg-stone-800 text-white px-4 py-2 rounded-lg text-[10px] uppercase font-bold tracking-widest hover:bg-black transition-all flex items-center gap-2">
                    <Upload size={14} /> Scegli File
                    <input
                      type="file"
                      className="hidden"
                      accept="image/*"
                      onChange={async (e) => {
                        const file = e.target.files?.[0];
                        if (file) {
                          try {
                            const compressed = await compressImage(file);
                            setWineryForm({ ...wineryForm, image: compressed });
                          } catch (err) {
                            alert("Errore caricamento immagine");
                          }
                        }
                      }}
                    />
                  </label>
                </div>
                {wineryForm.image ? (
                  <div className="relative group">
                    <img src={wineryForm.image} alt="Anteprima" className="w-full h-48 object-cover rounded-lg border" />
                    <button
                      onClick={() => setWineryForm({ ...wineryForm, image: '' })}
                      className="absolute top-2 right-2 bg-red-500 text-white p-2 rounded-full opacity-0 group-hover:opacity-100 transition-all shadow-lg"
                    >
                      <Trash2 size={14} />
                    </button>
                  </div>
                ) : (
                  <div className="h-24 flex items-center justify-center text-stone-300 text-xs uppercase tracking-widest">
                    Nessuna immagine selezionata
                  </div>
                )}
              </div>

              <div className="flex gap-2">
                <button onClick={() => {
                  const winery = { ...wineryForm, id: editingId || "winery_" + Date.now().toString(), coordinates: wineryForm.coordinates || { lat: 45, lng: 7 } } as Winery;
                  if (isAdding) onAddWinery(winery);
                  else if (editingId) onUpdateWinery(winery);
                  resetForms();
                }} className="flex-1 bg-stone-800 text-[#D4AF37] py-4 rounded-xl font-bold uppercase text-[10px] tracking-widest">Salva</button>
                <button onClick={resetForms} className="px-6 bg-stone-100 text-stone-500 rounded-xl font-bold uppercase text-[10px]">Annulla</button>
              </div>
            </div>
          ) : (
            <div className="grid gap-3">
              {filteredWineries.map(winery => (
                <div key={winery.id} className="bg-white p-4 rounded-2xl flex items-center justify-between border shadow-sm">
                  <div className="flex items-center gap-3">
                    {winery.image && <img src={winery.image} alt={winery.name} className="w-14 h-14 object-contain rounded-xl bg-stone-50 border border-stone-200 p-1" />}
                    <div>
                      <p className="font-serif font-bold text-stone-800">{winery.name}</p>
                      <p className="text-[9px] text-stone-400 uppercase">{winery.location}</p>
                    </div>
                  </div>
                  <div className="flex gap-1">
                    <button
                      onClick={() => {
                        const wineryWines = wines.filter(w => w.wineryId === winery.id);
                        const backupData = {
                          winery: winery,
                          wines: wineryWines
                          // Not adding glossary here as it's global, but user asked for "winery and bottles"
                        };
                        const dataStr = "data:text/json;charset=utf-8," + encodeURIComponent(JSON.stringify(backupData, null, 2));
                        const downloadAnchorNode = document.createElement('a');
                        downloadAnchorNode.setAttribute("href", dataStr);
                        downloadAnchorNode.setAttribute("download", `${winery.name.replace(/[^a-z0-9]/gi, '_').toLowerCase()}_backup.json`);
                        document.body.appendChild(downloadAnchorNode);
                        downloadAnchorNode.click();
                        downloadAnchorNode.remove();
                      }}
                      className="p-2 text-stone-300 hover:text-[#D4AF37]"
                      title="Backup JSON Cantina"
                    >
                      <Download size={16} />
                    </button>
                    <button
                      onClick={() => handleTranslateWinery(winery)}
                      disabled={translatingWineryId === winery.id}
                      className={`p-2 ${translatingWineryId === winery.id ? 'text-[#D4AF37] animate-pulse' : 'text-stone-300 hover:text-green-500'}`}
                      title="Traduci in EN/FR"
                    >
                      {translatingWineryId === winery.id ? <Loader2 size={16} className="animate-spin" /> : <Globe size={16} />}
                    </button>
                    <button onClick={() => { setWineryForm(winery); setEditingId(winery.id); lastScrollPos.current = window.scrollY; }} className="p-2 text-stone-300"><Edit2 size={16} /></button>
                    <button onClick={() => onDeleteWinery(winery.id)} className="p-2 text-stone-300 hover:text-red-600"><Trash2 size={16} /></button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )
      }

      {
        activeTab === 'glossary' && (
          <div className="space-y-6">
            <div className="flex justify-between items-center">
              <h2 className="text-xl font-serif font-bold text-stone-800 uppercase tracking-tighter">Manuale Glossario</h2>
              <div className="flex gap-2 items-center flex-wrap justify-end">
                {/* Traduzione */}
                <button
                  onClick={handleTranslateAllGlossary}
                  disabled={isLoadingAi}
                  className="flex items-center gap-2 px-3 py-1.5 bg-blue-50 text-blue-600 rounded-full text-[10px] font-bold uppercase tracking-widest hover:bg-blue-100 transition-all border border-blue-100"
                  title="Traduci tutti i termini mancanti"
                >
                  {isLoadingAi ? <Loader2 size={12} className="animate-spin" /> : <Globe size={12} />}
                  Traduci
                </button>

                <div className="h-4 w-px bg-stone-200 mx-1" />

                {/* Gestione Dati */}
                <button
                  onClick={handleExportGlossaryOnly}
                  className="flex items-center gap-1 px-3 py-1.5 bg-stone-100 text-stone-600 rounded-full text-[10px] font-bold uppercase tracking-widest hover:bg-stone-200 transition-all"
                  title="Esporta JSON"
                >
                  <Download size={12} /> Esporta
                </button>
                <label className="flex items-center gap-1 px-3 py-1.5 bg-stone-100 text-stone-600 rounded-full text-[10px] font-bold uppercase tracking-widest hover:bg-stone-200 transition-all cursor-pointer" title="Importa JSON">
                  <Upload size={12} /> Importa
                  <input type="file" accept=".json" className="hidden" onChange={handleImportGlossaryOnly} />
                </label>

                <button
                  onClick={handleGenerateGlossary}
                  disabled={isLoadingAi}
                  className="flex items-center gap-1 px-3 py-1.5 bg-[#D4AF37]/10 text-[#D4AF37] rounded-full text-[10px] font-bold uppercase tracking-widest hover:bg-[#D4AF37] hover:text-white transition-all ml-1"
                  title="Genera termini dai vini presenti"
                >
                  <Sparkles size={12} /> Genera
                </button>
                <button
                  onClick={handleOptimizeGlossary}
                  className="flex items-center gap-1 px-3 py-1.5 bg-green-50 text-green-600 rounded-full text-[10px] font-bold uppercase tracking-widest hover:bg-green-100 transition-all border border-green-100"
                  title="Unisci duplicati e pulisci"
                >
                  <Sparkles size={12} /> Ottimizza
                </button>
                <button
                  onClick={handleRestoreBackup}
                  className="flex items-center gap-1 px-3 py-1.5 bg-orange-50 text-orange-600 rounded-full text-[10px] font-bold uppercase tracking-widest hover:bg-orange-100 transition-all border border-orange-100"
                  title="Recupera 22 termini di base (Crotta)"
                >
                  🆘 Ripristina
                </button>

                <div className="h-4 w-px bg-stone-200 mx-1" />

                {/* Azioni Item */}
                <button onClick={onWipeGlossary} className="p-1.5 bg-red-50 text-red-500 rounded-full hover:bg-red-100 transition-colors" title="Svuota tutto"><Trash size={14} /></button>
                <button onClick={() => { setIsAdding(true); lastScrollPos.current = window.scrollY; }} className="p-1.5 bg-stone-800 text-[#D4AF37] rounded-full shadow-lg hover:scale-105 transition-transform" title="Aggiungi termine"><Plus size={14} /></button>
              </div>
            </div>


            {isAdding || editingId ? (
              <div className="bg-white p-6 rounded-[2rem] border shadow-xl space-y-4">
                <input placeholder="Termine (es. Fumin)" className="admin-input" value={glossaryForm.term} onChange={e => setGlossaryForm({ ...glossaryForm, term: e.target.value })} />
                <select className="admin-input" value={glossaryForm.category} onChange={e => setGlossaryForm({ ...glossaryForm, category: e.target.value as any })}>
                  <option value="Vitigno">Vitigno</option>
                  <option value="Territorio">Territorio</option>
                  <option value="Tecnica">Tecnica</option>
                </select>
                <textarea placeholder="Definizione..." className="admin-input h-24" value={glossaryForm.definition} onChange={e => setGlossaryForm({ ...glossaryForm, definition: e.target.value })} />

                <div className="space-y-3 pt-4 border-t border-stone-100">
                  <h4 className="text-sm font-bold text-stone-400 uppercase tracking-widest">Traduzioni (Opzionale)</h4>
                  <div className="grid grid-cols-2 gap-4">
                    <textarea
                      placeholder="🇬🇧 Definition (EN)"
                      className="admin-input h-24"
                      value={glossaryForm.definition_en || ''}
                      onChange={e => setGlossaryForm({ ...glossaryForm, definition_en: e.target.value })}
                    />
                    <textarea
                      placeholder="🇫🇷 Définition (FR)"
                      className="admin-input h-24"
                      value={glossaryForm.definition_fr || ''}
                      onChange={e => setGlossaryForm({ ...glossaryForm, definition_fr: e.target.value })}
                    />
                  </div>
                </div>
                <div className="flex gap-2">
                  <button onClick={() => {
                    if (isAdding) onUpdateGlossary([...glossary, glossaryForm as GlossaryItem]);
                    else if (editingId) onUpdateGlossary(glossary.map(g => g.term === editingId ? (glossaryForm as GlossaryItem) : g));
                    resetForms();
                  }} className="flex-1 bg-stone-800 text-[#D4AF37] py-4 rounded-xl font-bold uppercase text-[10px] tracking-widest">Salva</button>
                  <button onClick={resetForms} className="px-6 bg-stone-100 text-stone-500 rounded-xl font-bold uppercase text-[10px]">Annulla</button>
                </div>
              </div>
            ) : (
              <div className="grid gap-3">
                {glossary.map((item, idx) => (
                  <div key={`${item.term}_${idx}`} className="bg-white p-4 rounded-2xl flex items-center justify-between border shadow-sm">
                    <div>
                      <p className="font-serif font-bold text-stone-800">{item.term}</p>
                      <p className="text-[9px] uppercase tracking-widest text-[#D4AF37]">{item.category}</p>
                    </div>
                    <div className="flex gap-1">
                      <button onClick={() => handleTranslateGlossaryItem(item)} className="p-2 text-blue-400 hover:bg-blue-50 rounded-lg transition-colors" title="Traduci Termine"><Globe size={16} /></button>
                      <button onClick={() => {
                        console.log("Editing:", item.term);
                        setGlossaryForm(item);
                        setEditingId(item.term);
                        lastScrollPos.current = window.scrollY;
                      }} className="p-2 text-stone-500 hover:text-[#D4AF37] hover:bg-stone-50 rounded-lg transition-colors" title="Modifica"><Edit2 size={16} /></button>
                      <button onClick={() => {
                        if (confirm(`Eliminare "${item.term}"?`)) {
                          // Use explicit delete handler if available (for persistence)
                          if (onDeleteGlossaryItem) {
                            onDeleteGlossaryItem(item.term);
                          } else {
                            // Fallback (local update only, discouraged)
                            const newGlossary = [...glossary];
                            newGlossary.splice(idx, 1);
                            onUpdateGlossary(newGlossary);
                          }
                        }
                      }} className="p-2 text-red-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors" title="Elimina"><Trash2 size={16} /></button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )
      }

      {
        activeTab === 'menu' && (
          <div className="space-y-6">
            <div className="flex justify-between items-center">
              <div className="flex items-center gap-3">
                <h2 className="text-xl font-serif font-bold text-stone-800 uppercase tracking-tighter">Gestione Menu</h2>
                <button
                  onClick={() => setShowHiddenWines(!showHiddenWines)}
                  className={`text-[9px] px-3 py-1.5 rounded-full font-bold uppercase tracking-wider transition-all ${showHiddenWines ? 'bg-red-100 text-red-600' : 'bg-stone-100 text-stone-500'}`}
                >
                  {showHiddenWines ? `Nascosti (${menu.filter(m => m.hidden).length})` : `Visibili (${menu.filter(m => !m.hidden).length})`}
                </button>
              </div>
              <div className="flex gap-2">
                <button onClick={onWipeMenu} className="p-2 bg-red-100 text-red-600 rounded-full shadow-lg hover:bg-red-200" title="Svuota Menu"><Trash size={18} /></button>
                <button onClick={() => { setIsAdding(true); lastScrollPos.current = window.scrollY; }} className="p-2 bg-stone-800 text-[#D4AF37] rounded-full shadow-lg"><Plus /></button>
              </div>
            </div>

            {/* Add/Edit Form */}
            {(isAdding || editingId) && (
              <div className="bg-white p-6 rounded-[2rem] border shadow-xl space-y-4">
                <input
                  placeholder="Nome piatto (es. Cotoletta alla valdostana)"
                  className="admin-input"
                  value={menuForm.name || ''}
                  onChange={e => setMenuForm({ ...menuForm, name: e.target.value })}
                />
                <div className="grid grid-cols-2 gap-3">
                  <input
                    placeholder="Prezzo (es. 26)"
                    className="admin-input"
                    value={menuForm.price || ''}
                    onChange={e => setMenuForm({ ...menuForm, price: e.target.value })}
                  />
                  <input
                    placeholder="Allergeni (es. Glutine, Lattosio)"
                    className="admin-input"
                    value={menuForm.allergens || ''}
                    onChange={e => setMenuForm({ ...menuForm, allergens: e.target.value })}
                  />
                </div>

                <select
                  className="admin-input"
                  value={menuForm.category || 'Antipasti'}
                  onChange={e => setMenuForm({ ...menuForm, category: e.target.value as MenuItem['category'] })}
                >
                  <option value="Antipasti">Antipasti</option>
                  <option value="Primi">Primi</option>
                  <option value="Secondi">Secondi</option>
                  <option value="Dolci">Dolci</option>
                  <option value="Fuori Menu">Fuori Menu</option>
                </select>

                <textarea
                  placeholder="Descrizione piatto"
                  className="admin-input h-24"
                  value={menuForm.description || ''}
                  onChange={e => setMenuForm({ ...menuForm, description: e.target.value })}
                />

                {/* Multilanguage Tabs / Fields */}
                <div className="space-y-3 pt-4 border-t border-stone-100">
                  <h4 className="text-sm font-bold text-stone-400 uppercase tracking-widest">Traduzioni (Opzionale)</h4>

                  <div className="grid grid-cols-2 gap-4">
                    <input
                      placeholder="🇬🇧 Nome piatto (EN)"
                      className="admin-input"
                      value={(menuForm as any).name_en || ''}
                      onChange={e => setMenuForm({ ...menuForm, name_en: e.target.value } as any)}
                    />
                    <input
                      placeholder="🇫🇷 Nom du plat (FR)"
                      className="admin-input"
                      value={(menuForm as any).name_fr || ''}
                      onChange={e => setMenuForm({ ...menuForm, name_fr: e.target.value } as any)}
                    />
                  </div>
                </div>

                {/* Extra Details */}
                <div className="space-y-2 pt-4 border-t border-stone-100">
                  <h4 className="text-sm font-bold text-stone-400 uppercase tracking-widest">Dettagli Extra</h4>
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <textarea
                    placeholder="Storia del Piatto (Info)"
                    className="admin-input h-32"
                    value={menuForm.story || ''}
                    onChange={e => setMenuForm({ ...menuForm, story: e.target.value })}
                  />
                  <textarea
                    placeholder="Preparazione / Procedimento"
                    className="admin-input h-32"
                    value={menuForm.preparation || ''}
                    onChange={e => setMenuForm({ ...menuForm, preparation: e.target.value })}
                  />
                </div>

                {/* VINO SUGGERITO (MANUALE) */}
                <div className="space-y-2 pt-4 border-t border-stone-100">
                  <div className="flex items-center gap-2">
                    <WineIcon size={14} className="text-[#722F37]" />
                    <h4 className="text-sm font-bold text-stone-400 uppercase tracking-widest">Vino Consigliato (Opzionale)</h4>
                  </div>
                  <select
                    className="admin-input"
                    value={menuForm.verifiedPairings?.[0]?.wineId || ''}
                    onChange={(e) => {
                      const wineId = e.target.value;
                      if (!wineId) {
                        setMenuForm({ ...menuForm, verifiedPairings: [] });
                        return;
                      }

                      const selectedWine = wines.find(w => w.id === wineId);
                      const winery = wineries.find(w => w.id === selectedWine?.wineryId);

                      // Create a manual verified pairing
                      const newPairing = {
                        wineId: wineId,
                        justification: `Abbinamento consigliato con ${selectedWine?.name}.`,
                        score: 100,
                        label: "Scelta del Sommelier",
                        technicalDetail: "Selezione manuale dalla carta vini."
                      };

                      setMenuForm({ ...menuForm, verifiedPairings: [newPairing] });
                    }}
                  >
                    <option value="">-- Nessun abbinamento specifico --</option>
                    {wines
                      .filter(w => !w.hidden)
                      .sort((a, b) => a.name.localeCompare(b.name))
                      .map(w => {
                        const winery = wineries.find(win => win.id === w.wineryId);
                        return (
                          <option key={w.id} value={w.id}>
                            {w.name} ({winery?.name || 'Cantina Sconosciuta'})
                          </option>
                        );
                      })}
                  </select>
                  <p className="text-[10px] text-stone-400 italic">Selezionando un vino qui, apparirà con la stella "Consigliato" nel menu.</p>
                </div>

                {/* CAMPO UPLOAD IMMAGINE PIATTO */}
                <div className="space-y-3 p-4 bg-stone-50 rounded-xl border border-dashed border-stone-300">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <ImageIcon size={18} className="text-[#D4AF37]" />
                      <span className="text-xs uppercase tracking-widest text-stone-600 font-bold">Foto Piatto</span>
                    </div>
                    <label className="cursor-pointer bg-stone-800 text-white px-4 py-2 rounded-lg text-[10px] uppercase font-bold tracking-widest hover:bg-black transition-all flex items-center gap-2">
                      <Upload size={14} /> Scegli File
                      <input
                        type="file"
                        className="hidden"
                        accept="image/*"
                        onChange={async (e) => {
                          const file = e.target.files?.[0];
                          if (file) {
                            try {
                              const compressed = await compressImage(file);
                              setMenuForm({ ...menuForm, image: compressed });
                            } catch (err) {
                              alert("Errore caricamento immagine");
                            }
                          }
                        }}
                      />
                    </label>
                  </div>
                  {menuForm.image ? (
                    <div className="relative group">
                      <img src={menuForm.image} alt="Anteprima" className="w-full h-48 object-cover rounded-lg border" />
                      <button
                        onClick={() => setMenuForm({ ...menuForm, image: '' })}
                        className="absolute top-2 right-2 bg-red-500 text-white p-2 rounded-full opacity-0 group-hover:opacity-100 transition-all shadow-lg"
                      >
                        <Trash2 size={14} />
                      </button>
                    </div>
                  ) : (
                    <div className="h-24 flex items-center justify-center text-stone-300 text-xs uppercase tracking-widest">
                      Nessuna immagine selezionata
                    </div>
                  )}
                </div>

                <div className="flex gap-2">
                  <button onClick={() => {
                    const menuItem: MenuItem = {
                      id: editingId || `menu_${Date.now()}`,
                      name: String(menuForm.name || ''),
                      price: String(menuForm.price || ''),
                      category: menuForm.category || 'Antipasti',
                      description: String(menuForm.description || ''),
                      allergens: String(menuForm.allergens || ''),
                      story: String(menuForm.story || ''),
                      preparation: String(menuForm.preparation || ''),
                      image: String(menuForm.image || ''),
                      verifiedPairings: menuForm.verifiedPairings,
                      name_en: String((menuForm as any).name_en || ''),
                      name_fr: String((menuForm as any).name_fr || ''),
                      description_en: String((menuForm as any).description_en || ''),
                      description_fr: String((menuForm as any).description_fr || ''),
                      story_en: String((menuForm as any).story_en || ''),
                      story_fr: String((menuForm as any).story_fr || ''),
                      preparation_en: String((menuForm as any).preparation_en || ''),
                      preparation_fr: String((menuForm as any).preparation_fr || '')
                    };
                    if (isAdding) {
                      onUpdateMenu([...menu, menuItem]);
                    } else if (editingId) {
                      onUpdateMenu(menu.map(m => m.id === editingId ? menuItem : m));
                    }
                    resetForms();
                  }} className="flex-1 bg-stone-800 text-[#D4AF37] py-4 rounded-xl font-bold uppercase text-[10px] tracking-widest">Salva</button>
                  <button onClick={resetForms} className="px-6 bg-stone-100 text-stone-500 rounded-xl font-bold uppercase text-[10px]">Annulla</button>
                </div>
              </div>
            )}

            {/* Search Bar */}
            {!isAdding && !editingId && (
              <div className="relative">
                <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-stone-400" size={18} />
                <input
                  type="text"
                  placeholder="Cerca nel menu..."
                  value={menuSearchTerm}
                  onChange={(e) => setMenuSearchTerm(e.target.value)}
                  className="w-full bg-white border border-stone-200 rounded-xl py-3 pl-12 pr-4 text-sm focus:outline-none focus:border-[#D4AF37] transition-all shadow-sm"
                />
              </div>
            )}



            {/* Current Menu Items */}
            {!isAdding && !editingId && (
              <div className="grid gap-3">
                {menu
                  .filter(m => showHiddenWines ? m.hidden : !m.hidden)
                  .filter(m => (m.name || '').toLowerCase().includes(menuSearchTerm.toLowerCase()) || (m.category || '').toLowerCase().includes(menuSearchTerm.toLowerCase()))
                  .length === 0 ? (
                  <div className="text-center py-10 text-stone-400 font-serif italic border border-dashed border-stone-200 rounded-2xl">
                    {menuSearchTerm ? 'Nessun piatto trovato' : (showHiddenWines ? 'Nessun piatto nascosto' : 'Nessun piatto visibile. Usa + o import per aggiungerne.')}
                  </div>
                ) : (
                  menu
                    .filter(m => showHiddenWines ? m.hidden : !m.hidden)
                    .filter(m => (m.name || '').toLowerCase().includes(menuSearchTerm.toLowerCase()) || (m.category || '').toLowerCase().includes(menuSearchTerm.toLowerCase()))
                    .map(item => (
                      <div key={item.id} className={`bg-white p-4 rounded-2xl flex items-center justify-between border shadow-sm ${item.hidden ? 'bg-red-50 border-red-200' : ''}`}>
                        <div>
                          <p className="font-serif font-bold text-stone-800">{item.name}</p>
                          <p className="text-[9px] text-stone-400 uppercase">{item.category} • {item.price}</p>
                        </div>
                        <div className="flex gap-1">
                          <button
                            onClick={() => onUpdateMenu(menu.map(m => m.id === item.id ? { ...m, hidden: !m.hidden } : m))}
                            className={`p-2 ${item.hidden ? 'text-green-500 hover:bg-green-50' : 'text-red-400 hover:bg-red-50'} rounded-lg transition-colors`}
                            title={item.hidden ? 'Rimetti nel menu' : 'Nascondi'}
                          >
                            {item.hidden ? <Eye size={16} /> : <EyeOff size={16} />}
                          </button>
                          <button onClick={() => handleTranslateMenuItem(item)} className="p-2 text-blue-400 hover:bg-blue-50 rounded-lg transition-colors" title="Traduci Piatto"><Globe size={16} /></button>
                          <button onClick={() => {
                            setMenuForm({ ...item });
                            setEditingId(item.id);
                            lastScrollPos.current = window.scrollY;
                          }} className="p-2 text-stone-300"><Edit2 size={16} /></button>
                          <button onClick={() => onUpdateMenu(menu.filter(m => m.id !== item.id))} className="p-2 text-stone-300 hover:text-red-600"><Trash2 size={16} /></button>

                        </div>
                      </div>
                    ))
                )}
              </div>
            )}
          </div>
        )
      }

      {
        activeTab === 'ai_instructions' && (
          <div className="space-y-6">
            {/* Clean vertical function list */}
            <div className="bg-white rounded-[2rem] border border-stone-200 overflow-hidden shadow-sm">
              {/* Header */}
              <div className="px-6 py-4 bg-gradient-to-r from-stone-800 to-stone-700">
                <h3 className="text-sm font-serif font-bold text-[#D4AF37] uppercase tracking-[0.2em]">⚙️ Routing AI</h3>
                <p className="text-[10px] text-stone-400 mt-0.5">Provider per funzione</p>
              </div>

              {/* Function rows */}
              <div className="divide-y divide-stone-100">
                {/* Chat Sommelier */}
                <div className="px-6 py-4 flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <span className="text-lg">🤖</span>
                    <div>
                      <p className="text-sm font-bold text-stone-700">Sommelier</p>
                      <p className="text-[10px] text-stone-400">Chat consigli vini</p>
                    </div>
                  </div>
                  <div className="flex gap-1">
                    {(['gemini', 'openrouter', 'openai'] as const).map(p => (
                      <button key={p} onClick={() => setChatProvider(p)}
                        className={`px-3 py-1.5 rounded-full text-[10px] font-bold tracking-wide transition-all ${chatProvider === p ? 'bg-stone-800 text-[#D4AF37] shadow-sm' : 'bg-stone-100 text-stone-400 hover:bg-stone-200'}`}
                      >{p === 'gemini' ? 'Gemini' : p === 'openrouter' ? 'OR' : 'OpenAI'}</button>
                    ))}
                  </div>
                </div>

                {/* Scan Bottiglia */}
                <div className="px-6 py-4 flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <span className="text-lg">📷</span>
                    <div>
                      <p className="text-sm font-bold text-stone-700">Scan</p>
                      <p className="text-[10px] text-stone-400">Riconoscimento etichetta</p>
                    </div>
                  </div>
                  <div className="flex gap-1">
                    {(['gemini', 'openrouter'] as const).map(p => (
                      <button key={p} onClick={() => setScanProvider(p)}
                        className={`px-3 py-1.5 rounded-full text-[10px] font-bold tracking-wide transition-all ${scanProvider === p ? 'bg-stone-800 text-[#D4AF37] shadow-sm' : 'bg-stone-100 text-stone-400 hover:bg-stone-200'}`}
                      >{p === 'gemini' ? 'Gemini' : 'OpenRouter'}</button>
                    ))}
                  </div>
                </div>

                {/* Pairing */}
                <div className="px-6 py-4 flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <span className="text-lg">🍷</span>
                    <div>
                      <p className="text-sm font-bold text-stone-700">Pairing</p>
                      <p className="text-[10px] text-stone-400">Abbinamento vino-piatto</p>
                    </div>
                  </div>
                  <div className="flex gap-1">
                    {(['gemini', 'openrouter', 'openai'] as const).map(p => (
                      <button key={p} onClick={() => setPairingProvider(p)}
                        className={`px-3 py-1.5 rounded-full text-[10px] font-bold tracking-wide transition-all ${pairingProvider === p ? 'bg-stone-800 text-[#D4AF37] shadow-sm' : 'bg-stone-100 text-stone-400 hover:bg-stone-200'}`}
                      >{p === 'gemini' ? 'Gemini' : p === 'openrouter' ? 'OR' : 'OpenAI'}</button>
                    ))}
                  </div>
                </div>

                {/* Importazione */}
                <div className="px-6 py-4 flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <span className="text-lg">📄</span>
                    <div>
                      <p className="text-sm font-bold text-stone-700">Importazione</p>
                      <p className="text-[10px] text-stone-400">PDF / testo → dati</p>
                    </div>
                  </div>
                  <div className="flex gap-1">
                    {(['gemini', 'openrouter'] as const).map(p => (
                      <button key={p} onClick={() => setImportProvider(p)}
                        className={`px-3 py-1.5 rounded-full text-[10px] font-bold tracking-wide transition-all ${importProvider === p ? 'bg-stone-800 text-[#D4AF37] shadow-sm' : 'bg-stone-100 text-stone-400 hover:bg-stone-200'}`}
                      >{p === 'gemini' ? 'Gemini' : 'OpenRouter'}</button>
                    ))}
                  </div>
                </div>

                {/* Traduzioni — DeepL fisso */}
                <div className="px-6 py-4 flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <span className="text-lg">🔤</span>
                    <div>
                      <p className="text-sm font-bold text-stone-700">Traduzioni</p>
                      <p className="text-[10px] text-stone-400">IT → EN / FR · fallback Gemini</p>
                    </div>
                  </div>
                  <span className="px-4 py-1.5 rounded-full text-[10px] font-bold uppercase tracking-wide bg-sky-600 text-white">DeepL</span>
                </div>

                {/* Admin Chat */}
                <div className="px-6 py-4 flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <span className="text-lg">💬</span>
                    <div>
                      <p className="text-sm font-bold text-stone-700">Admin Chat</p>
                      <p className="text-[10px] text-stone-400">Assistente gestionale</p>
                    </div>
                  </div>
                  <div className="flex gap-1">
                    {(['gemini', 'openrouter', 'openai'] as const).map(p => (
                      <button key={p} onClick={() => setAdminChatProvider(p)}
                        className={`px-3 py-1.5 rounded-full text-[10px] font-bold tracking-wide transition-all ${adminChatProvider === p ? 'bg-stone-800 text-[#D4AF37] shadow-sm' : 'bg-stone-100 text-stone-400 hover:bg-stone-200'}`}
                      >{p === 'gemini' ? 'Gemini' : p === 'openrouter' ? 'OR' : 'OpenAI'}</button>
                    ))}
                  </div>
                </div>
              </div>

              {/* Model config footer */}
              <div className="px-6 py-4 bg-stone-50 border-t border-stone-200">
                <p className="text-[10px] font-bold text-stone-500 uppercase tracking-wider mb-3">Modelli attivi</p>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-2">
                  <select value={selectedGeminiModel} onChange={e => setSelectedGeminiModel(e.target.value)}
                    className="bg-white border border-stone-200 rounded-lg px-3 py-2 text-stone-600 text-xs font-bold">
                    {geminiModels.map(m => <option key={m.id} value={m.id}>🔮 {m.name}</option>)}
                  </select>
                  <select value={selectedOpenRouterModel} onChange={e => setSelectedOpenRouterModel(e.target.value)}
                    className="bg-white border border-stone-200 rounded-lg px-3 py-2 text-stone-600 text-xs font-bold">
                    {openRouterModels.map(m => <option key={m.id} value={m.id}>🌐 {m.name} {m.free ? '✓' : '💰'}</option>)}
                  </select>
                  <div className="space-y-1">
                    <select value={selectedOpenAIModel} onChange={e => setSelectedOpenAIModel(e.target.value)}
                      className="w-full bg-white border border-stone-200 rounded-lg px-3 py-2 text-stone-600 text-xs font-bold">
                      {openAIModels.map(m => <option key={m.id} value={m.id}>🤖 {m.name}</option>)}
                    </select>
                    <input type="password" value={openAIKey} onChange={e => setOpenAIKey(e.target.value)}
                      placeholder="OpenAI Key: sk-proj-..." className="w-full bg-white border border-stone-200 rounded-lg px-3 py-1.5 text-stone-500 font-mono text-[10px]" />
                  </div>
                </div>
              </div>
            </div>

            {/* AI Chat Interface */}
            <AdminAIChat
              provider={adminChatProvider}
              model={adminChatProvider === 'gemini' ? selectedGeminiModel : adminChatProvider === 'openai' ? selectedOpenAIModel : selectedOpenRouterModel}
              onExecuteAction={handleExecuteAction}
              wines={wines}
              wineries={wineries}
              menu={menu}
              glossary={glossary}
            />
          </div>
        )
      }

      {
        activeTab === 'settings' && (
          <div className="space-y-10 animate-in fade-in">


            <div className="text-center space-y-2">
              <h2 className="text-2xl font-serif font-bold text-stone-800 uppercase tracking-widest">Manutenzione Database</h2>
              <p className="text-xs text-stone-400 font-serif italic mb-4">Backup e Ripristino Totale</p>

              {/* Storage Usage Indicator */}
              {/* Storage Usage Indicator */}
              <div className="bg-stone-100 rounded-xl p-4 mb-6">
                <div className="flex justify-between text-[10px] uppercase font-bold tracking-widest text-stone-500 mb-2">
                  <span>Peso Dati (Memoria Attiva)</span>
                  <span>{(new Blob([JSON.stringify({ wines, wineries, menu, glossary })]).size / 1024 / 1024).toFixed(2)} MB / ~5.00 MB</span>
                </div>
                <div className="w-full bg-stone-200 rounded-full h-2 overflow-hidden">
                  <div
                    className="bg-[#D4AF37] h-full transition-all duration-1000"
                    style={{ width: `${Math.min(100, (new Blob([JSON.stringify({ wines, wineries, menu, glossary })]).size / 1024 / 1024 / 5) * 100)}%` }}
                  />
                </div>
                <p className="text-[9px] text-stone-400 mt-2 italic text-center">
                  Stima del peso dei dati attualmente caricati nell'app (inclusi testi e immagini).
                </p>
              </div>

              <button
                onClick={onLogout}
                className="w-full mb-8 py-3 bg-red-50 text-red-600 rounded-xl font-bold uppercase text-[10px] tracking-widest border border-red-100 hover:bg-red-100 transition-colors"
              >
                Esci (Logout)
              </button>
            </div>

            <div className="grid gap-4">
              <div className="relative">
                <input type="file" ref={pdfInputRef} onChange={handlePdfImport} accept=".pdf,image/*" className="hidden" />
                <button
                  onClick={() => pdfInputRef.current?.click()}
                  disabled={isLoadingAi}
                  className="w-full flex items-center gap-6 p-6 bg-stone-900 border border-stone-800 rounded-[2rem] hover:bg-black shadow-xl transition-all text-left group"
                >
                  <div className="w-14 h-14 bg-stone-800 rounded-full flex items-center justify-center text-[#D4AF37] group-hover:scale-110 transition-all">
                    {isLoadingAi ? <Loader2 className="animate-spin" size={24} /> : <FileText size={24} />}
                  </div>
                  <div>
                    <h4 className="font-serif font-bold text-[#D4AF37] uppercase tracking-widest text-sm">Carica Nuova Maison (IA)</h4>
                    <p className="text-[10px] text-stone-400 uppercase mt-1">Aggiunge una nuova cantina al percorso</p>
                  </div>
                </button>
              </div>



              {/* DeepL Translate All Button */}
              <button
                onClick={async () => {
                  if (!window.confirm('🌍 TRADUZIONE COMPLETA CON DEEPL\n\nQuesta operazione tradurrà TUTTO in Inglese e Francese:\n- Cantine (descrizione + curiosità)\n- Vini (descrizione + abbinamento + curiosità)\n- Menu (nome + descrizione)\n- Glossario\n\nVerranno tradotti SOLO i campi vuoti.\n\nProcedere?')) return;
                  setIsLoadingAi(true);
                  let translated = 0;
                  let errors = 0;
                  const totalItems = wineries.length + wines.length + menu.length + glossary.length;
                  setDeeplProgress({ current: 0, total: totalItems, phase: 'Cantine...' });
                  try {
                    // 1. WINERIES
                    for (const w of wineries) {
                      let updated = false;
                      const nw = { ...w };
                      if (w.description && (!w.description_en || !w.description_fr)) {
                        try {
                          const t = await translateWithDeepLBoth(w.description);
                          if (!nw.description_en) nw.description_en = t.en;
                          if (!nw.description_fr) nw.description_fr = t.fr;
                          updated = true;
                        } catch { errors++; }
                      }
                      if (w.curiosity && (!w.curiosity_en || !w.curiosity_fr)) {
                        try {
                          const t = await translateWithDeepLBoth(w.curiosity);
                          if (!nw.curiosity_en) nw.curiosity_en = t.en;
                          if (!nw.curiosity_fr) nw.curiosity_fr = t.fr;
                          updated = true;
                        } catch { errors++; }
                      }
                      if (updated) { onUpdateWinery(nw); translated++; }
                      setDeeplProgress(p => p ? { ...p, current: p.current + 1 } : null);
                    }
                    // 2. WINES
                    setDeeplProgress(p => p ? { ...p, phase: 'Vini...' } : null);
                    for (const w of wines) {
                      let updated = false;
                      const nw = { ...w };
                      if (w.description && (!w.description_en || !w.description_fr)) {
                        try {
                          const t = await translateWithDeepLBoth(w.description);
                          if (!nw.description_en) nw.description_en = t.en;
                          if (!nw.description_fr) nw.description_fr = t.fr;
                          updated = true;
                        } catch { errors++; }
                      }
                      if (w.pairing && (!w.pairing_en || !w.pairing_fr)) {
                        try {
                          const t = await translateWithDeepLBoth(w.pairing);
                          if (!nw.pairing_en) nw.pairing_en = t.en;
                          if (!nw.pairing_fr) nw.pairing_fr = t.fr;
                          updated = true;
                        } catch { errors++; }
                      }
                      if (w.curiosity && (!w.curiosity_en || !w.curiosity_fr)) {
                        try {
                          const t = await translateWithDeepLBoth(w.curiosity);
                          if (!nw.curiosity_en) nw.curiosity_en = t.en;
                          if (!nw.curiosity_fr) nw.curiosity_fr = t.fr;
                          updated = true;
                        } catch { errors++; }
                      }
                      if (w.sensoryProfile && (!w.sensoryProfile_en || !w.sensoryProfile_fr)) {
                        try {
                          const t = await translateWithDeepLBoth(w.sensoryProfile);
                          if (!nw.sensoryProfile_en) nw.sensoryProfile_en = t.en;
                          if (!nw.sensoryProfile_fr) nw.sensoryProfile_fr = t.fr;
                          updated = true;
                        } catch { errors++; }
                      }
                      if (updated) { onUpdateWine(nw); translated++; }
                      setDeeplProgress(p => p ? { ...p, current: p.current + 1 } : null);
                    }
                    // 3. MENU
                    setDeeplProgress(p => p ? { ...p, phase: 'Menu...' } : null);
                    const updatedMenu = [...menu];
                    for (let i = 0; i < menu.length; i++) {
                      const item = menu[i];
                      let updated = false;
                      const ni = { ...item };
                      if (item.name && (!item.name_en || !item.name_fr)) {
                        try {
                          const t = await translateWithDeepLBoth(item.name);
                          if (!ni.name_en) ni.name_en = t.en;
                          if (!ni.name_fr) ni.name_fr = t.fr;
                          updated = true;
                        } catch { errors++; }
                      }
                      if (item.description && (!item.description_en || !item.description_fr)) {
                        try {
                          const t = await translateWithDeepLBoth(item.description);
                          if (!ni.description_en) ni.description_en = t.en;
                          if (!ni.description_fr) ni.description_fr = t.fr;
                          updated = true;
                        } catch { errors++; }
                      }
                      if (updated) { updatedMenu[i] = ni; translated++; }
                      setDeeplProgress(p => p ? { ...p, current: p.current + 1 } : null);
                    }
                    onUpdateMenu(updatedMenu);
                    // 4. GLOSSARY
                    setDeeplProgress(p => p ? { ...p, phase: 'Glossario...' } : null);
                    const updatedGlossary = [...glossary];
                    for (let i = 0; i < glossary.length; i++) {
                      const item = glossary[i];
                      if (item.definition && (!item.definition_en || !item.definition_fr)) {
                        try {
                          const t = await translateWithDeepLBoth(item.definition);
                          updatedGlossary[i] = {
                            ...item,
                            definition_en: item.definition_en || t.en,
                            definition_fr: item.definition_fr || t.fr
                          };
                          translated++;
                        } catch { errors++; }
                      }
                      setDeeplProgress(p => p ? { ...p, current: p.current + 1 } : null);
                    }
                    onUpdateGlossary(updatedGlossary);
                    // Check usage
                    let usageMsg = '';
                    try {
                      const usage = await getDeepLUsage();
                      usageMsg = `\n\n📊 Uso API: ${(usage.character_count / 1000).toFixed(0)}k / ${(usage.character_limit / 1000).toFixed(0)}k caratteri`;
                    } catch { }
                    alert(`✅ Traduzione DeepL completata!\n\n🔄 Elementi tradotti: ${translated}\n${errors > 0 ? `❌ Errori: ${errors}` : ''}${usageMsg}`);
                  } catch (e: any) {
                    alert(`❌ Errore DeepL: ${e.message}`);
                  } finally {
                    setIsLoadingAi(false);
                    setDeeplProgress(null);
                  }
                }}
                disabled={isLoadingAi}
                className="w-full flex items-center gap-6 p-6 bg-gradient-to-r from-[#0037B3] to-[#0052FF] border border-blue-400/30 rounded-[2rem] hover:from-[#002E99] hover:to-[#0047E0] shadow-xl transition-all text-left group"
              >
                <div className="w-14 h-14 bg-white/20 rounded-full flex items-center justify-center text-white group-hover:scale-110 transition-all">
                  {isLoadingAi && deeplProgress ? <Loader2 className="animate-spin" size={24} /> : <Globe size={24} />}
                </div>
                <div className="flex-1">
                  <h4 className="font-serif font-bold text-white uppercase tracking-widest text-sm">🌍 Traduci Tutto (DeepL)</h4>
                  <p className="text-[10px] text-blue-100 uppercase mt-1">
                    {deeplProgress
                      ? `${deeplProgress.phase} ${deeplProgress.current}/${deeplProgress.total}`
                      : 'Traduce cantine, vini, menu e glossario in EN + FR'}
                  </p>
                </div>
              </button>

              <div className="h-px bg-stone-100 my-4" />

              <button onClick={onExportBackup} className="w-full flex items-center gap-6 p-6 bg-white border rounded-[2rem] hover:border-[#D4AF37]/40 shadow-sm transition-all text-left group">
                <div className="w-14 h-14 bg-stone-50 rounded-full flex items-center justify-center text-[#D4AF37] group-hover:bg-[#D4AF37] group-hover:text-white transition-all"><Download size={24} /></div>
                <div><h4 className="font-serif font-bold text-stone-800 uppercase tracking-widest text-sm">Esporta Backup</h4><p className="text-[10px] text-stone-400 uppercase mt-1">Salva tutto su file .json</p></div>
              </button>
              <div className="relative">
                <input type="file" ref={fileInputRef} onChange={onImportBackup} accept=".json" className="hidden" />
                <button onClick={() => fileInputRef.current?.click()} className="w-full flex items-center gap-6 p-6 bg-white border rounded-[2rem] hover:border-blue-300 shadow-sm transition-all text-left group">
                  <div className="w-14 h-14 bg-stone-50 rounded-full flex items-center justify-center text-blue-400 group-hover:bg-blue-400 group-hover:text-white transition-all"><Upload size={24} /></div>
                  <div><h4 className="font-serif font-bold text-stone-800 uppercase tracking-widest text-sm">Importa Backup</h4><p className="text-[10px] text-stone-400 uppercase mt-1">Carica file .json salvato</p></div>
                </button>
              </div>



              <button onClick={onWipeData} className="w-full flex items-center gap-6 p-6 bg-white border border-red-100 rounded-[2rem] hover:bg-red-50 shadow-sm transition-all text-left group">
                <div className="w-14 h-14 bg-red-50 rounded-full flex items-center justify-center text-red-500 group-hover:bg-red-500 group-hover:text-white transition-all"><Trash size={24} /></div>
                <div><h4 className="font-serif font-bold text-red-600 uppercase tracking-widest text-sm">Svuota App (Vergine)</h4><p className="text-[10px] text-stone-400 uppercase mt-1">Reset totale irreversibile.</p></div>
              </button>
            </div>
          </div>
        )
      }

      {
        activeTab === 'themes' && (
          <div className="space-y-10 animate-in fade-in pb-20">
            <div className="text-center space-y-2">
              <h2 className="text-2xl font-serif font-bold text-stone-800 uppercase tracking-widest">Tema Applicazione</h2>
              <p className="text-xs text-stone-400 font-serif italic">Seleziona lo stile visivo dell'esperienza mobile</p>
            </div>

            <div className="grid grid-cols-1 gap-6">
              {Object.values(THEMES).map((theme) => {
                const isActive = currentTheme === theme.id;
                return (
                  <button
                    key={theme.id}
                    onClick={() => setTheme(theme.id)}
                    className={`relative overflow-hidden rounded-[2rem] border-2 transition-all duration-300 text-left group ${isActive ? 'border-[#D4AF37] shadow-xl scale-[1.02]' : 'border-transparent hover:border-stone-200 shadow-sm bg-white'}`}
                  >
                    {/* Preview Header */}
                    <div className="h-24 w-full relative overflow-hidden">
                      <div className="absolute inset-0" style={{ backgroundColor: theme.colors.background }}></div>
                      <div className="absolute inset-x-0 bottom-0 h-1/2 bg-gradient-to-t from-black/20 to-transparent"></div>
                      <div className="relative z-10 p-6 flex justify-between items-center">
                        <span className={`text-2xl font-bold`} style={{ fontFamily: theme.fonts.heading, color: theme.colors.text }}>
                          {theme.name}
                        </span>
                        {isActive && (
                          <div className="bg-[#D4AF37] text-white p-2 rounded-full shadow-lg">
                            <Sparkles size={20} fill="white" />
                          </div>
                        )}
                      </div>
                    </div>

                    {/* Preview Body */}
                    <div className="p-6 space-y-4" style={{ backgroundColor: theme.colors.surface }}>
                      <p className="text-sm opacity-80" style={{ fontFamily: theme.fonts.body, color: theme.colors.text }}>
                        Un'esperienza visiva curata per esaltare i contenuti.
                        <br />
                        <span className="text-[10px] uppercase opacity-50 tracking-widest">
                          Font: {theme.fonts.heading.split(',')[0]} + {theme.fonts.body.split(',')[0]}
                        </span>
                      </p>

                      {/* Color Palette Preview */}
                      <div className="flex gap-2 pt-2">
                        <div className="w-8 h-8 rounded-full border border-black/10 shadow-sm" style={{ backgroundColor: theme.colors.background }} title="Background"></div>
                        <div className="w-8 h-8 rounded-full border border-black/10 shadow-sm" style={{ backgroundColor: theme.colors.surface }} title="Surface"></div>
                        <div className="w-8 h-8 rounded-full border border-black/10 shadow-sm" style={{ backgroundColor: theme.colors.text }} title="Text"></div>
                        <div className="w-8 h-8 rounded-full border border-black/10 shadow-sm" style={{ backgroundColor: theme.colors.accent }} title="Accent"></div>
                      </div>
                    </div>
                  </button>
                );
              })}
            </div>
          </div>
        )
      }

      <style>{`
        .admin-input {
          width: 100%;
          padding: 1.2rem 1.5rem;
          background: #fdfcf9;
          border: 1px solid #eee;
          border-radius: 1rem;
          font-family: 'Cormorant Garamond', serif;
          font-size: 1.1rem;
          outline: none;
        }
        .admin-input:focus { border-color: #D4AF37; }
      `}</style>
    </div >
  );
};
