import React, { useState, useRef, useEffect } from 'react';
import { Send, Bot, User, Sparkles, Loader2, Database, Globe, Trash2, Store, RefreshCw, BarChart3, Wine as WineIcon, RotateCcw } from 'lucide-react';
import { processUserIntent, AgentAction, DatabaseContext } from '../services/aiAgentService';
import { Wine, Winery, MenuItem, GlossaryItem } from '../types';

// Types for Chat
interface ChatMessage {
    id: string;
    role: 'user' | 'assistant';
    content: string;
    action?: AgentAction;
    timestamp: number;
}

interface AdminAIChatProps {
    provider: 'gemini' | 'openrouter' | 'openai';
    model: string;
    onExecuteAction: (action: AgentAction) => void;
    wines: Wine[];
    wineries: Winery[];
    menu: MenuItem[];
    glossary: GlossaryItem[];
}

export const AdminAIChat: React.FC<AdminAIChatProps> = ({ provider, model, onExecuteAction, wines, wineries, menu, glossary }) => {
    const [messages, setMessages] = useState<ChatMessage[]>(() => {
        try {
            const saved = localStorage.getItem('ianua_admin_chat_history');
            return saved ? JSON.parse(saved) : [{
                id: 'welcome',
                role: 'assistant',
                content: `🧠 Centrale Operativa attiva. Ho accesso completo al database: ${wineries.length} cantine, ${wines.filter(w => !w.hidden).length} vini, ${menu.filter(m => !m.hidden).length} piatti. Chiedimi qualsiasi cosa — analisi, modifiche batch, profili sensoriali, traduzioni, abbinamenti.`,
                timestamp: Date.now()
            }];
        } catch {
            return [{
                id: 'welcome',
                role: 'assistant',
                content: "🧠 Centrale Operativa pronta.",
                timestamp: Date.now()
            }];
        }
    });

    // Persist messages
    useEffect(() => {
        localStorage.setItem('ianua_admin_chat_history', JSON.stringify(messages));
    }, [messages]);

    const handleClearChat = () => {
        if (confirm('Vuoi davvero cancellare tutta la cronologia della chat?')) {
            const newHistory: ChatMessage[] = [{
                id: Date.now().toString(),
                role: 'assistant',
                content: `Chat resettata. Database attuale: ${wineries.length} cantine, ${wines.filter(w => !w.hidden).length} vini, ${menu.filter(m => !m.hidden).length} piatti. Sono pronto.`,
                timestamp: Date.now()
            }];
            setMessages(newHistory);
            localStorage.setItem('ianua_admin_chat_history', JSON.stringify(newHistory));
        }
    };

    // Recovery: extract all UPDATE_WINES from chat history and re-apply them in one batch
    const handleRecoverUpdates = () => {
        const updateActions = messages.filter(m => m.action?.type === 'UPDATE_WINES');
        if (updateActions.length === 0) {
            alert('Nessuna modifica UPDATE_WINES trovata nella cronologia.');
            return;
        }

        // Merge all updates into one big array, later duplicates override earlier ones per wine ID
        const mergedMap = new Map<string, any>();
        for (const msg of updateActions) {
            const updates = Array.isArray(msg.action!.data) ? msg.action!.data : [];
            for (const u of updates) {
                if (u.id) {
                    mergedMap.set(u.id, { ...(mergedMap.get(u.id) || {}), ...u });
                }
            }
        }

        const merged = Array.from(mergedMap.values());
        if (confirm(`Trovate ${merged.length} modifiche vini da ${updateActions.length} azioni AI. Applicare tutte?`)) {
            onExecuteAction({ type: 'UPDATE_WINES', data: merged });
        }
    };

    const [input, setInput] = useState('');
    const [isTyping, setIsTyping] = useState(false);
    const scrollRef = useRef<HTMLDivElement>(null);

    // Auto-scroll to bottom
    useEffect(() => {
        if (scrollRef.current) {
            scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
        }
    }, [messages]);

    const handleSend = async () => {
        if (!input.trim()) return;

        const userMsg: ChatMessage = {
            id: Date.now().toString(),
            role: 'user',
            content: input,
            timestamp: Date.now()
        };

        const newHistory = [...messages, userMsg];
        setMessages(newHistory);
        setInput('');
        setIsTyping(true);

        try {
            const historyForService = newHistory.map(m => ({ role: m.role, content: m.content }));

            // Pass full database context to the AI
            const dbContext: DatabaseContext = { wines, wineries, menu, glossary };
            const response = await processUserIntent(input, provider, model, historyForService, dbContext);

            const aiMsg: ChatMessage = {
                id: (Date.now() + 1).toString(),
                role: 'assistant',
                content: response.message,
                action: response.action.type !== 'NONE' ? response.action : undefined,
                timestamp: Date.now()
            };

            setMessages(prev => [...prev, aiMsg]);
        } catch (error) {
            setMessages(prev => [...prev, {
                id: Date.now().toString(),
                role: 'assistant',
                content: "Errore nel contattare il cervello dell'IA. Riprova tra poco.",
                timestamp: Date.now()
            }]);
        } finally {
            setIsTyping(false);
        }
    };

    const renderActionPreview = (action: AgentAction) => {
        if (!action) return null;

        // ===========================
        // UPDATE_WINES — Batch wine updates
        // ===========================
        if (action.type === 'UPDATE_WINES') {
            const updates = Array.isArray(action.data) ? action.data : [];
            return (
                <div className="mt-3 bg-white border border-amber-200 rounded-xl p-4 shadow-sm">
                    <div className="flex items-center gap-2 mb-3 text-amber-700 text-xs font-bold tracking-widest uppercase">
                        <RefreshCw size={12} /> Aggiornamento {updates.length} Vini
                    </div>
                    <div className="max-h-56 overflow-y-auto space-y-2 mb-3">
                        {updates.map((update: any, idx: number) => {
                            const wine = wines.find(w => w.id === update.id);
                            const fields = Object.keys(update).filter(k => k !== 'id');
                            return (
                                <div key={idx} className="border-b border-stone-100 pb-2 last:border-0 last:pb-0">
                                    <div className="font-serif text-stone-800 font-bold text-sm">
                                        {wine?.name || update.id}
                                    </div>
                                    {fields.map(field => (
                                        <div key={field} className="mt-1">
                                            <span className="text-[9px] uppercase text-amber-600 font-bold tracking-wider">{field}</span>
                                            <p className="text-xs text-stone-600 italic border-l-2 border-amber-300 pl-2 mt-0.5">
                                                {typeof update[field] === 'string' ? update[field].slice(0, 200) : JSON.stringify(update[field]).slice(0, 200)}
                                                {typeof update[field] === 'string' && update[field].length > 200 ? '...' : ''}
                                            </p>
                                        </div>
                                    ))}
                                </div>
                            );
                        })}
                    </div>
                    <button
                        onClick={() => onExecuteAction(action)}
                        className="w-full py-3 bg-amber-600 text-white text-xs font-bold uppercase tracking-wider rounded-lg hover:bg-amber-700 transition-colors"
                    >
                        ✨ Applica Modifiche ({updates.length} vini)
                    </button>
                </div>
            );
        }

        // ===========================
        // UPDATE_MENU — Batch menu updates
        // ===========================
        if (action.type === 'UPDATE_MENU') {
            const updates = Array.isArray(action.data) ? action.data : [];
            return (
                <div className="mt-3 bg-white border border-emerald-200 rounded-xl p-4 shadow-sm">
                    <div className="flex items-center gap-2 mb-3 text-emerald-700 text-xs font-bold tracking-widest uppercase">
                        <RefreshCw size={12} /> Aggiornamento {updates.length} Piatti
                    </div>
                    <div className="max-h-48 overflow-y-auto space-y-2 mb-3">
                        {updates.map((update: any, idx: number) => {
                            const item = menu.find(m => m.id === update.id);
                            return (
                                <div key={idx} className="flex justify-between items-center py-1 border-b border-stone-100 last:border-0">
                                    <span className="font-serif text-stone-800 text-sm">{item?.name || update.id}</span>
                                    <span className="text-[9px] uppercase text-emerald-600">{Object.keys(update).filter(k => k !== 'id').join(', ')}</span>
                                </div>
                            );
                        })}
                    </div>
                    <button
                        onClick={() => onExecuteAction(action)}
                        className="w-full py-3 bg-emerald-600 text-white text-xs font-bold uppercase tracking-wider rounded-lg hover:bg-emerald-700 transition-colors"
                    >
                        ✨ Applica Modifiche ({updates.length} piatti)
                    </button>
                </div>
            );
        }

        // ===========================
        // ANALYSIS — Just show a stats badge
        // ===========================
        if (action.type === 'ANALYSIS') {
            return (
                <div className="mt-3 bg-stone-50 border border-stone-200 rounded-xl p-3 shadow-sm">
                    <div className="flex items-center gap-2 text-stone-500 text-xs font-bold tracking-widest uppercase">
                        <BarChart3 size={12} /> Analisi Completata
                    </div>
                </div>
            );
        }

        // ===========================
        // DRAFT_WINE
        // ===========================
        if (action.type === 'DRAFT_WINE') {
            const wine = action.data;
            return (
                <div className="mt-3 bg-white border border-stone-200 rounded-xl p-4 shadow-sm">
                    <div className="flex items-center gap-2 mb-2 text-stone-500 text-xs font-bold tracking-widest uppercase">
                        <Database size={12} /> Anteprima Vino
                    </div>
                    <div className="font-serif text-lg text-stone-800 font-bold">{wine.name}</div>
                    <div className="text-sm text-stone-600 mb-2">{wine.winery} • {wine.year} • {wine.grapes}</div>
                    <div className="text-xs text-stone-500 italic border-l-2 border-[#D4AF37] pl-2 mb-3">
                        {wine.description}
                    </div>
                    <div className="flex gap-2">
                        <button
                            onClick={() => onExecuteAction(action)}
                            className="flex-1 py-2 bg-stone-900 text-[#D4AF37] text-xs font-bold uppercase tracking-wider rounded-lg hover:bg-black transition-colors"
                        >
                            Salva nel Database
                        </button>
                        <button className="px-3 py-2 bg-stone-100 text-stone-500 text-xs font-bold uppercase tracking-wider rounded-lg hover:bg-stone-200">
                            Modifica
                        </button>
                    </div>
                </div>
            );
        }

        // ===========================
        // DRAFT_WINERY
        // ===========================
        if (action.type === 'DRAFT_WINERY') {
            const winery = action.data;
            return (
                <div className="mt-3 bg-white border border-stone-200 rounded-xl p-4 shadow-sm">
                    <div className="flex items-center gap-2 mb-2 text-stone-500 text-xs font-bold tracking-widest uppercase">
                        <Store size={12} /> Anteprima Cantina
                    </div>
                    <div className="font-serif text-lg text-stone-800 font-bold">{winery.name}</div>
                    <div className="text-sm text-stone-600 mb-2">{winery.location}</div>
                    <div className="text-xs text-stone-500 italic border-l-2 border-[#D4AF37] pl-2 mb-3 max-h-32 overflow-y-auto">
                        {winery.description}
                        {winery.wines && winery.wines.length > 0 && (
                            <div className="mt-2 text-[#D4AF37] font-bold not-italic">
                                + {winery.wines.length} Vini inclusi
                            </div>
                        )}
                        {winery.glossary && winery.glossary.length > 0 && (
                            <div className="mt-1 text-stone-400 font-bold not-italic text-[10px]">
                                + {winery.glossary.length} Termini Glossario
                            </div>
                        )}
                    </div>
                    <div className="flex gap-2">
                        <button
                            onClick={() => onExecuteAction(action)}
                            className="flex-1 py-2 bg-stone-900 text-[#D4AF37] text-xs font-bold uppercase tracking-wider rounded-lg hover:bg-black transition-colors"
                        >
                            Salva Cantina
                        </button>
                    </div>
                </div>
            );
        }

        // ===========================
        // DRAFT_MENU
        // ===========================
        if (action.type === 'DRAFT_MENU') {
            const item = action.data;
            return (
                <div className="mt-3 bg-white border border-stone-200 rounded-xl p-4 shadow-sm">
                    <div className="flex items-center gap-2 mb-2 text-stone-500 text-xs font-bold tracking-widest uppercase">
                        <Database size={12} /> Anteprima Piatto
                    </div>
                    <div className="flex justify-between items-baseline">
                        <div className="font-serif text-lg text-stone-800 font-bold">{item.name}</div>
                        <div className="font-serif text-[#D4AF37] font-bold">{item.price}€</div>
                    </div>
                    <div className="text-xs text-stone-500 italic border-l-2 border-[#D4AF37] pl-2 mb-3 mt-1">
                        {item.description}
                    </div>
                    <div className="flex gap-2">
                        <button
                            onClick={() => onExecuteAction(action)}
                            className="flex-1 py-2 bg-stone-900 text-[#D4AF37] text-xs font-bold uppercase tracking-wider rounded-lg hover:bg-black transition-colors"
                        >
                            Aggiungi al Menu
                        </button>
                        <button className="px-3 py-2 bg-stone-100 text-stone-500 text-xs font-bold uppercase tracking-wider rounded-lg hover:bg-stone-200">
                            Modifica
                        </button>
                    </div>
                </div>
            )
        }

        // ===========================
        // BULK_MENU
        // ===========================
        if (action.type === 'BULK_MENU') {
            const rawData = action.data as any;
            const items = Array.isArray(rawData) ? rawData : (rawData.items || []);
            const detectedLang = !Array.isArray(rawData) ? rawData.detected_language : null;

            if (!Array.isArray(items)) return null;

            return (
                <div className="mt-3 bg-white border border-stone-200 rounded-xl p-4 shadow-sm">
                    <div className="flex items-center gap-2 mb-3 text-stone-500 text-xs font-bold tracking-widest uppercase">
                        <Database size={12} /> Menu Completo ({items.length} piatti)
                        {detectedLang && <span className="ml-auto bg-stone-100 px-2 py-0.5 rounded text-[9px] text-stone-600">Lingua: {detectedLang.toUpperCase()}</span>}
                    </div>
                    <div className="max-h-48 overflow-y-auto space-y-2 mb-3">
                        {items.map((item: any, idx: number) => (
                            <div key={idx} className="flex justify-between items-center py-1.5 border-b border-stone-100 last:border-0">
                                <div>
                                    <span className="font-serif text-stone-800">{item.name}</span>
                                    <span className="ml-2 text-[9px] uppercase text-stone-400">{item.category}</span>
                                </div>
                                <span className="font-serif text-[#D4AF37] font-bold">{item.price}€</span>
                            </div>
                        ))}
                    </div>
                    <button
                        onClick={() => onExecuteAction(action)}
                        className="w-full py-3 bg-stone-900 text-[#D4AF37] text-xs font-bold uppercase tracking-wider rounded-lg hover:bg-black transition-colors"
                    >
                        ✨ Inserisci Tutto ({items.length} piatti)
                    </button>
                </div>
            )
        }

        // ===========================
        // TRANSLATE_PREVIEW
        // ===========================
        if (action.type === 'TRANSLATE_PREVIEW') {
            return (
                <div className="mt-3 bg-white border border-stone-200 rounded-xl p-4 shadow-sm">
                    <div className="flex items-center gap-2 mb-2 text-stone-500 text-xs font-bold tracking-widest uppercase">
                        <Globe size={12} /> Anteprima Traduzione
                    </div>
                    <div className="space-y-2">
                        <div>
                            <span className="text-[10px] uppercase text-stone-400">English</span>
                            <p className="text-sm font-serif text-stone-800">{action.data.en}</p>
                        </div>
                        <div>
                            <span className="text-[10px] uppercase text-stone-400">Français</span>
                            <p className="text-sm font-serif text-stone-800">{action.data.fr}</p>
                        </div>
                    </div>
                    <div className="mt-3 flex gap-2">
                        <button
                            onClick={() => onExecuteAction(action)}
                            className="flex-1 py-2 bg-stone-900 text-[#D4AF37] text-xs font-bold uppercase tracking-wider rounded-lg hover:bg-black transition-colors"
                        >
                            Applica Traduzioni
                        </button>
                    </div>
                </div>
            );
        }

        return null;
    };

    return (
        <div className="flex flex-col h-[calc(100vh-220px)] bg-white rounded-2xl shadow-sm border border-stone-100 overflow-hidden">
            {/* Header / Info Bar */}
            <div className="bg-stone-50 px-6 py-3 border-b border-stone-100 flex items-center justify-between">
                <div className="flex items-center gap-2">
                    <Sparkles size={16} className="text-[#D4AF37]" />
                    <span className="text-xs font-bold uppercase tracking-wider text-stone-500">
                        Agente Attivo: <span className="text-stone-800">{provider === 'gemini' ? 'Google Gemini' : provider === 'openai' ? 'OpenAI' : 'OpenRouter'}</span>
                    </span>
                </div>
                <div className="flex items-center gap-2">
                    <div className="text-[10px] text-stone-400 font-mono mr-2">
                        {model} • {wines.filter(w => !w.hidden).length}🍷 {wineries.length}🏠
                    </div>
                    <button
                        onClick={handleRecoverUpdates}
                        className="p-1.5 text-stone-400 hover:text-green-600 hover:bg-stone-100 rounded-lg transition-colors"
                        title="Recupera e ri-applica tutte le modifiche dalla cronologia"
                    >
                        <RotateCcw size={14} />
                    </button>
                    <button
                        onClick={handleClearChat}
                        className="p-1.5 text-stone-400 hover:text-red-600 hover:bg-stone-100 rounded-lg transition-colors"
                        title="Cancella Cronologia Chat"
                    >
                        <Trash2 size={14} />
                    </button>
                </div>
            </div>

            {/* Messages Area */}
            <div ref={scrollRef} className="flex-1 overflow-y-auto p-6 space-y-6 bg-stone-50/30">
                {messages.map(msg => (
                    <div key={msg.id} className={`flex gap-4 ${msg.role === 'user' ? 'flex-row-reverse' : ''}`}>
                        {/* Avatar */}
                        <div className={`w-8 h-8 rounded-full flex items-center justify-center shrink-0 ${msg.role === 'assistant' ? 'bg-stone-800 text-[#D4AF37]' : 'bg-stone-200 text-stone-600'}`}>
                            {msg.role === 'assistant' ? <Bot size={16} /> : <User size={16} />}
                        </div>

                        {/* Bubble */}
                        <div className={`max-w-[80%]`}>
                            <div className={`rounded-2xl px-5 py-3 text-sm leading-relaxed shadow-sm ${msg.role === 'user'
                                ? 'bg-white text-stone-800 border border-stone-100 rounded-tr-none'
                                : 'bg-stone-800 text-stone-100 rounded-tl-none'
                                }`}>
                                {msg.content}
                            </div>

                            {/* Action Preview Card */}
                            {msg.role === 'assistant' && msg.action && renderActionPreview(msg.action)}
                        </div>
                    </div>
                ))}

                {isTyping && (
                    <div className="flex gap-4">
                        <div className="w-8 h-8 rounded-full bg-stone-800 text-[#D4AF37] flex items-center justify-center shrink-0">
                            <Loader2 size={16} className="animate-spin" />
                        </div>
                        <div className="bg-stone-800/50 rounded-2xl px-4 py-3 rounded-tl-none">
                            <div className="flex gap-1">
                                <span className="w-1.5 h-1.5 bg-[#D4AF37] rounded-full animate-bounce" style={{ animationDelay: '0ms' }} />
                                <span className="w-1.5 h-1.5 bg-[#D4AF37] rounded-full animate-bounce" style={{ animationDelay: '150ms' }} />
                                <span className="w-1.5 h-1.5 bg-[#D4AF37] rounded-full animate-bounce" style={{ animationDelay: '300ms' }} />
                            </div>
                        </div>
                    </div>
                )}
            </div>

            {/* Input Area */}
            <div className="p-4 bg-white border-t border-stone-100">
                <div className="relative">
                    <textarea
                        value={input}
                        onChange={(e) => setInput(e.target.value)}
                        onKeyDown={(e) => {
                            if (e.key === 'Enter' && !e.shiftKey) {
                                e.preventDefault();
                                handleSend();
                            }
                        }}
                        placeholder="Analizza dati, genera profili, aggiorna abbinamenti, importa menu..."
                        className="w-full bg-stone-50 border border-stone-200 rounded-xl pl-4 pr-12 py-4 text-sm text-stone-800 focus:outline-none focus:ring-2 focus:ring-[#D4AF37]/20 focus:border-[#D4AF37] resize-none h-14 max-h-32 transition-all placeholder:text-stone-400"
                        style={{ minHeight: '60px' }}
                    />
                    <button
                        onClick={handleSend}
                        disabled={!input.trim() || isTyping}
                        className="absolute right-2 top-2 p-2 bg-[#D4AF37] text-white rounded-lg hover:bg-stone-800 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                        <Send size={18} />
                    </button>
                </div>
                <p className="text-[10px] text-center text-stone-400 mt-2">
                    🧠 Accesso completo al database. Verifica sempre i dati prima di applicare.
                </p>
            </div>
        </div>
    );
};
