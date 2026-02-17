import React, { useRef, useEffect, useState } from 'react';
import { Send, Sparkles, BookOpen, Feather, X } from 'lucide-react';

interface ChatMessage {
    role: 'user' | 'ai';
    text: string;
}

interface MobileSommelierProps {
    chatHistory: ChatMessage[];
    chatInput: string;
    setChatInput: (input: string) => void;
    handleSendChat: (mode: 'poeta' | 'tecnico') => void;
    isTyping: boolean;
    language: 'it' | 'en' | 'fr';
    onClose?: () => void;
}

// Strip markdown bold/italic markers from text
const stripMarkdown = (text: string): string => {
    return text
        .replace(/\*\*\*(.*?)\*\*\*/g, '$1')  // ***bold italic***
        .replace(/\*\*(.*?)\*\*/g, '$1')        // **bold**
        .replace(/\*(.*?)\*/g, '$1')            // *italic*
        .replace(/__(.*?)__/g, '$1')            // __underline__
        .replace(/_(.*?)_/g, '$1')              // _italic_
        .replace(/^[-*] /gm, '• ')             // bullet points
        .replace(/^#{1,6}\s+/gm, '');           // headings
};

export const MobileSommelier: React.FC<MobileSommelierProps> = ({
    chatHistory,
    chatInput,
    setChatInput,
    handleSendChat,
    isTyping,
    language,
    onClose
}) => {
    const messagesEndRef = useRef<HTMLDivElement>(null);
    const inputBarRef = useRef<HTMLDivElement>(null);
    const [mode, setMode] = useState<'poeta' | 'tecnico'>('poeta');
    const [keyboardOffset, setKeyboardOffset] = useState(0);

    const scrollToBottom = () => {
        messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
    };

    useEffect(() => {
        scrollToBottom();
    }, [chatHistory, isTyping]);

    // Keyboard-aware positioning using visualViewport API
    useEffect(() => {
        const viewport = window.visualViewport;
        if (!viewport) return;

        const handleResize = () => {
            // Calculate how much the keyboard is covering
            const offsetFromBottom = window.innerHeight - (viewport.height + viewport.offsetTop);
            setKeyboardOffset(Math.max(0, offsetFromBottom));
        };

        viewport.addEventListener('resize', handleResize);
        viewport.addEventListener('scroll', handleResize);

        return () => {
            viewport.removeEventListener('resize', handleResize);
            viewport.removeEventListener('scroll', handleResize);
        };
    }, []);

    // Scroll to bottom when keyboard opens
    useEffect(() => {
        if (keyboardOffset > 0) {
            setTimeout(scrollToBottom, 100);
        }
    }, [keyboardOffset]);

    const onSend = () => {
        handleSendChat(mode);
    };

    const modeLabels = {
        poeta: { it: 'Poeta', en: 'Poet', fr: 'Poète' },
        tecnico: { it: 'Tecnico', en: 'Technical', fr: 'Technique' }
    };

    return (
        <div className="h-full flex flex-col bg-stone-950 relative">
            {/* Header with mode selector */}
            <div className="p-3 border-b border-stone-800 bg-stone-900/50 backdrop-blur-sm sticky top-0 z-10">
                <div className="flex items-center justify-center gap-2 mb-2 relative">
                    <Sparkles className="text-[#D4AF37]" size={14} />
                    <h2 className="text-[#D4AF37] text-xs font-bold uppercase tracking-[0.2em]">Ianua Sommelier</h2>
                    {onClose && (
                        <button
                            onClick={onClose}
                            className="absolute right-0 top-1/2 -translate-y-1/2 p-2 rounded-full bg-stone-800/80 text-stone-400 hover:text-white active:scale-90 transition-all border border-stone-700/50"
                        >
                            <X size={16} />
                        </button>
                    )}
                </div>
                {/* Mode toggle */}
                <div className="flex justify-center gap-1">
                    <button
                        onClick={() => setMode('poeta')}
                        className={`flex items-center gap-1.5 px-4 py-1.5 rounded-full text-[11px] font-bold tracking-wide transition-all ${mode === 'poeta'
                            ? 'bg-[#D4AF37]/20 text-[#D4AF37] border border-[#D4AF37]/40'
                            : 'bg-stone-800/50 text-stone-500 border border-stone-700/50'
                            }`}
                    >
                        <Feather size={10} />
                        {modeLabels.poeta[language]}
                    </button>
                    <button
                        onClick={() => setMode('tecnico')}
                        className={`flex items-center gap-1.5 px-4 py-1.5 rounded-full text-[11px] font-bold tracking-wide transition-all ${mode === 'tecnico'
                            ? 'bg-[#D4AF37]/20 text-[#D4AF37] border border-[#D4AF37]/40'
                            : 'bg-stone-800/50 text-stone-500 border border-stone-700/50'
                            }`}
                    >
                        <BookOpen size={10} />
                        {modeLabels.tecnico[language]}
                    </button>
                </div>
            </div>

            <div className="flex-1 overflow-y-auto px-4 py-6 space-y-6 scrollbar-hide pb-4">
                {chatHistory.length === 0 && (
                    <div className="flex flex-col items-center justify-center h-[60vh] text-stone-600 space-y-4 opacity-50 px-8 text-center">
                        <Sparkles size={48} strokeWidth={1} />
                        <p className="font-serif italic text-lg">
                            {language === 'it' ? '"Chiedimi un consiglio..."' : language === 'fr' ? '"Demandez-moi un conseil..."' : '"Ask me for advice..."'}
                        </p>
                        <p className="text-xs text-stone-600">
                            {mode === 'poeta'
                                ? (language === 'it' ? 'Modalità poetica — risposte evocative' : language === 'fr' ? 'Mode poétique' : 'Poetic mode — evocative answers')
                                : (language === 'it' ? 'Modalità tecnica — risposte analitiche' : language === 'fr' ? 'Mode technique' : 'Technical mode — analytical answers')
                            }
                        </p>
                    </div>
                )}

                {chatHistory.map((msg, i) => (
                    <div
                        key={i}
                        className={`max-w-[85%] p-4 rounded-2xl leading-relaxed shadow-lg animate-in fade-in slide-in-from-bottom-2 duration-300 ${msg.role === 'user'
                            ? 'bg-stone-800 text-white self-end ml-auto rounded-br-none font-sans text-sm'
                            : 'bg-stone-900 border border-[#D4AF37]/30 text-stone-200 self-start mr-auto rounded-bl-none text-[18.5px] font-extralight font-sans'
                            }`}
                    >
                        {msg.role === 'ai' && <div className="text-[#D4AF37] mb-2 text-[10px] uppercase tracking-widest font-bold flex items-center gap-1"><Sparkles size={10} /> Ianua AI</div>}
                        {(() => {
                            const lines = stripMarkdown(msg.text).split('\n');
                            return lines.map((line, idx) => {
                                const trimmed = line.trim();
                                const isHeader = /^\d+\.\s/.test(trimmed);
                                const prevIsHeader = idx > 0 && /^\d+\.\s/.test(lines[idx - 1]?.trim());
                                const isWineName = prevIsHeader && trimmed.length > 0 && !trimmed.startsWith('•');
                                return <p key={idx} className={`mb-2 last:mb-0 ${isHeader ? 'text-[#D4AF37] font-semibold mt-4 first:mt-0' :
                                    isWineName ? 'pb-2 mb-3 border-b border-[#D4AF37]/30' : ''
                                    }`}>{line}</p>;
                            });
                        })()}
                    </div>
                ))}

                {isTyping && (
                    <div className="bg-stone-900 border border-[#D4AF37]/20 p-4 rounded-2xl rounded-bl-none shadow-sm flex items-center gap-2 w-fit animate-pulse">
                        <div className="w-1.5 h-1.5 bg-[#D4AF37] rounded-full animate-bounce" />
                        <div className="w-1.5 h-1.5 bg-[#D4AF37] rounded-full animate-bounce [animation-delay:0.2s]" />
                        <div className="w-1.5 h-1.5 bg-[#D4AF37] rounded-full animate-bounce [animation-delay:0.4s]" />
                    </div>
                )}
                <div ref={messagesEndRef} />
            </div>

            {/* Input bar — sticky at bottom of chat */}
            <div
                ref={inputBarRef}
                className="p-4 bg-stone-900/95 backdrop-blur-md border-t border-stone-800 sticky bottom-0 z-[60]"
            >
                <div className="flex gap-2 relative max-w-md mx-auto">
                    <input
                        value={chatInput}
                        onChange={(e) => setChatInput(e.target.value)}
                        onKeyDown={(e) => e.key === 'Enter' && onSend()}
                        placeholder={language === 'it' ? "Scrivi qui..." : language === 'fr' ? "Écrivez ici..." : "Write here..."}
                        className="flex-1 bg-stone-950 rounded-full px-6 py-3.5 text-white border border-stone-800 focus:border-[#D4AF37] outline-none placeholder:text-stone-600 shadow-inner text-sm font-sans"
                    />
                    <button
                        onClick={onSend}
                        disabled={!chatInput.trim() || isTyping}
                        className="bg-[#D4AF37] text-stone-900 p-3.5 rounded-full hover:scale-105 active:scale-95 transition-transform disabled:opacity-50 disabled:cursor-not-allowed shadow-lg shadow-[#D4AF37]/20"
                    >
                        <Send size={20} className="ml-0.5" />
                    </button>
                </div>
            </div>
        </div>
    );
};
