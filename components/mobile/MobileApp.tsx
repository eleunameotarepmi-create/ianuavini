import React, { useState, useRef, useCallback } from 'react';
import { Wine, Winery, AppView, MenuItem, AiInstruction } from '../../types';
import { MobileLayout } from './MobileLayout';
import { MobileRegionSelector } from './MobileRegionSelector';
import { MobileWineList } from './MobileWineList';
import { MobileSommelier } from './MobileSommelier';
import { MobileLanding } from './MobileLanding';
import { MenuView } from '../MenuView';
import { WineDetailModal } from '../WineDetailModal';
import { WineryDetailModal } from '../WineryDetailModal';
import { AdminPanel } from '../AdminPanel';
import { GroupMenusModal } from '../GroupMenusModal';
import { LoginView } from '../LoginView';
import { getWineAdvice, identifyWineFromImage } from '../../services/geminiService';
import { Camera, Aperture, RotateCcw, Wine as WineIcon, Loader2 } from 'lucide-react';
import { t } from '../../translations';
import { determineWineryRegion } from '../regions/registry';
import { MobileGlossary } from './MobileGlossary';
import { MobileCoverPlayground } from './MobileCoverPlayground';

interface MobileAppProps {
    view: AppView;
    setView: (v: AppView) => void;
    language: 'it' | 'en' | 'fr';
    setLanguage: (l: 'it' | 'en' | 'fr') => void;

    wines: Wine[];
    wineries: Winery[];
    menu: MenuItem[];
    aiInstructions: AiInstruction[];
    isAuthenticated: boolean;
    onLoginSuccess: () => void;
    onLogout: () => void;

    // Data Handlers
    onAddWine: (w: Wine) => Promise<void>;
    onUpdateWine: (w: Wine) => Promise<void>;
    onBatchUpdateWines: (updates: Partial<Wine>[]) => Promise<void>;
    onDeleteWine: (id: string) => Promise<void>;
    onAddWinery: (w: Winery) => Promise<void>;
    onUpdateWinery: (w: Winery) => Promise<void>;
    onDeleteWinery: (id: string) => Promise<void>;
    onUpdateMenu: (items: MenuItem[]) => Promise<void>;
    onUpdateGlossary: (items: any[]) => Promise<void>;
    onResetGlossary: (items: any[]) => Promise<void>;
    onDeleteGlossaryItem: (term: string) => Promise<void>;
    onAddAiInstruction: (i: AiInstruction) => Promise<void>;
    onUpdateAiInstruction: (i: AiInstruction) => Promise<void>;
    onDeleteAiInstruction: (id: string) => Promise<void>;
    onWipeData: () => Promise<void>;
    onWipeWines: () => Promise<void>;
    onWipeWineries: () => Promise<void>;
    onWipeMenu: () => Promise<void>;
    onWipeGlossary: () => Promise<void>;
    onBulkUpdate: (data: any) => Promise<void>;
    onExportBackup: () => Promise<void>;
    onImportBackup: (e: React.ChangeEvent<HTMLInputElement>) => void;
    glossary: any[];
}

export const MobileApp: React.FC<MobileAppProps> = (props) => {
    const { view, setView, language, setLanguage, wines, wineries, menu, aiInstructions, isAuthenticated, onUpdateMenu, glossary } = props;

    const [mobileTab, setMobileTab] = useState<'home' | 'cellar' | 'sommelier' | 'scan' | 'menu' | 'glossary'>('home');
    const [selectedWine, setSelectedWine] = useState<Wine | null>(null);
    const [selectedWinery, setSelectedWinery] = useState<Winery | null>(null);
    const [showGruppiModal, setShowGruppiModal] = useState(false);
    const [showPlayground, setShowPlayground] = useState(false); // Default FALSE

    // Scan State
    const videoRef = useRef<HTMLVideoElement>(null);
    const canvasRef = useRef<HTMLCanvasElement>(null);
    const [scanState, setScanState] = useState<'camera' | 'analyzing' | 'found' | 'not-found'>('camera');
    const [scanResult, setScanResult] = useState<{ wineId: string; wineName: string; confidence: number; reasoning: string } | null>(null);
    const streamRef = useRef<MediaStream | null>(null);

    if (showPlayground) {
        return <MobileCoverPlayground onExit={() => setShowPlayground(false)} />;
    }

    // Sommelier State
    const [chatInput, setChatInput] = useState('');
    const [chatHistory, setChatHistory] = useState<{ role: 'user' | 'ai', text: string }[]>([]);
    const [isTyping, setIsTyping] = useState(false);

    // Search Handling
    const [searchTerm, setSearchTerm] = useState('');
    const [selectedRegion, setSelectedRegion] = useState<string | null>(null);
    const [focusSearch, setFocusSearch] = useState(false);

    const handleMobileTabChange = (tab: 'home' | 'cellar' | 'sommelier' | 'scan' | 'menu' | 'glossary') => {
        // Stop camera when leaving scan tab
        if (mobileTab === 'scan' && tab !== 'scan' && streamRef.current) {
            streamRef.current.getTracks().forEach(t => t.stop());
            streamRef.current = null;
        }
        setMobileTab(tab);
        if (tab === 'cellar') {
            setFocusSearch(true);
            // Reset after a tick so subsequent clicks still trigger
            setTimeout(() => setFocusSearch(false), 500);
        }
        if (tab === 'scan') {
            setScanState('camera');
            setScanResult(null);
        }
        if (tab === 'home') {
            setView('home');
            setSelectedRegion(null);
        }
    };

    // Camera setup callback
    const setupCamera = useCallback((video: HTMLVideoElement | null) => {
        if (video && !video.srcObject) {
            navigator.mediaDevices.getUserMedia({ video: { facingMode: 'environment', width: { ideal: 1920 }, height: { ideal: 1080 } } })
                .then(stream => {
                    video.srcObject = stream;
                    streamRef.current = stream;
                })
                .catch(e => console.error('Camera error:', e));
        }
        // @ts-ignore
        videoRef.current = video;
    }, []);

    // Capture frame and send to Gemini
    const [scanError, setScanError] = useState<string | null>(null);

    const handleScanCapture = async () => {
        const video = videoRef.current;
        const canvas = canvasRef.current;
        if (!video || !canvas) return;

        // Capture frame
        canvas.width = video.videoWidth;
        canvas.height = video.videoHeight;
        const ctx = canvas.getContext('2d');
        if (!ctx) return;
        ctx.drawImage(video, 0, 0);
        const imageBase64 = canvas.toDataURL('image/jpeg', 0.8);

        setScanState('analyzing');
        setScanError(null);

        try {
            const result = await identifyWineFromImage(imageBase64, wines, wineries);
            if (result) {
                setScanResult(result);
                setScanState('found');
            } else {
                setScanState('not-found');
                setScanError('Nessun match trovato (confidence troppo bassa)');
            }
        } catch (err: any) {
            console.error('Scan error:', err);
            setScanState('not-found');
            setScanError(err.message || 'Errore sconosciuto');
        }
    };

    const handleScanOpenWine = () => {
        if (scanResult) {
            const wine = wines.find(w => w.id === scanResult.wineId);
            if (wine) {
                setSelectedWine(wine);
                setScanState('camera');
                setScanResult(null);
            }
        }
    };

    const handleScanRetry = () => {
        setScanState('camera');
        setScanResult(null);
    };


    const handleSendChat = async (mode: 'poeta' | 'tecnico' = 'poeta') => {
        if (!chatInput.trim()) return;
        const userMsg = chatInput;
        setChatHistory(prev => [...prev, { role: 'user', text: userMsg }]);
        setChatInput('');
        setIsTyping(true);
        try {
            const response = await getWineAdvice(userMsg, wines, menu, mode, wineries);
            setChatHistory(prev => [...prev, { role: 'ai', text: response || "Il sommelier sta riflettendo..." }]);
        } catch (e) {
            setChatHistory(prev => [...prev, { role: 'ai', text: "Errore di connessione." }]);
        } finally {
            setIsTyping(false);
        }
    };

    // Filter Wines for Mobile List
    const filteredWines = wines.filter(w => !w.hidden).filter(w => {
        // 1. Search Filter
        const term = searchTerm.toLowerCase();
        const winery = wineries.find(win => win.id === w.wineryId);
        const wineryName = winery?.name?.toLowerCase() || '';
        const matchesSearch = w.name.toLowerCase().includes(term) || w.grapes.toLowerCase().includes(term) || wineryName.includes(term);

        // 2. Region Filter
        let matchesRegion = true;
        if (selectedRegion) {
            const winery = wineries.find(win => win.id === w.wineryId);
            const regionId = determineWineryRegion(winery);

            if (selectedRegion === 'vda') {
                // VDA Logic: Explicit Inclusion + Safety Exclusion
                const vdaZones = ['bassa', 'nus-quart', 'la-plaine', 'plaine-to-valdigne', 'valdigne'];
                const isVdaZone = vdaZones.includes(regionId);

                if (isVdaZone) {
                    matchesRegion = true;
                } else {
                    // STRICTER VDA Logic: Only allow if explicitly VDA or if we really can't place it but it's not a major other region
                    // The previous "exclude known" was too permissive for "Unknown" regions that were actually Piedmont
                    matchesRegion = (winery?.region === 'vda');
                }
            } else if (selectedRegion === 'piemonte') {
                // Piemonte Inclusion Logic
                const isPiemonteZone = ['langhe', 'roero', 'monferrato', 'alto-piemonte', 'canavese', 'tortonese'].includes(regionId);
                matchesRegion = isPiemonteZone || (winery?.region === 'piemonte');
            } else {
                // Generic logic for other regions
                matchesRegion = regionId === selectedRegion || winery?.region === selectedRegion;
            }
        }
        return matchesSearch && matchesRegion;
    });

    // Filter Wineries for Mobile List
    const filteredWineries = wineries.filter(w => {
        let matchesRegion = true;
        if (selectedRegion) {
            const regionId = determineWineryRegion(w);

            if (selectedRegion === 'vda') {
                // VDA Exclusion Logic
                const isPiemonteZone = ['langhe', 'roero', 'monferrato', 'alto-piemonte', 'canavese', 'tortonese'].includes(regionId);
                matchesRegion = !isPiemonteZone && (regionId !== 'liguria') && (regionId !== 'sardegna') && (w.region !== 'piemonte');
            } else if (selectedRegion === 'piemonte') {
                // Piemonte Inclusion Logic
                const isPiemonteZone = ['langhe', 'roero', 'monferrato', 'alto-piemonte', 'canavese', 'tortonese'].includes(regionId);
                matchesRegion = isPiemonteZone || (w.region === 'piemonte');
            } else {
                // Generic logic for other regions
                matchesRegion = regionId === selectedRegion || w.region === selectedRegion;
            }
        }
        return matchesRegion;
    });

    // RENDER

    // 1. Landing (Splash)
    if (view === 'landing') {
        return <MobileLanding
            onEnter={() => {
                setView('home');
                setMobileTab('home');
            }}
            language={language}
            setLanguage={setLanguage}
            onLogin={() => setView('admin')}
        />;
    }

    // 2. Admin View (Simple Mobile Wrapper)
    if (view === 'admin') {
        return (
            <div className="min-h-screen bg-stone-50 overflow-y-auto pb-safe">
                <div className="p-4 border-b border-stone-200 flex justify-between items-center bg-white sticky top-0 z-50">
                    <h1 className="text-xl font-serif font-bold">Admin</h1>
                    <button onClick={() => setView('landing')} className="text-sm text-stone-500">Esci</button>
                </div>
                {!isAuthenticated ? (
                    <LoginView onLoginSuccess={props.onLoginSuccess} />
                ) : (
                    <div className="pb-24">
                        <AdminPanel
                            wines={wines} wineries={wineries} menu={menu} glossary={[]} aiInstructions={aiInstructions}
                            onAddWine={props.onAddWine} onUpdateWine={props.onUpdateWine} onBatchUpdateWines={props.onBatchUpdateWines} onDeleteWine={props.onDeleteWine}
                            onAddWinery={props.onAddWinery} onUpdateWinery={props.onUpdateWinery} onDeleteWinery={props.onDeleteWinery}
                            onUpdateMenu={props.onUpdateMenu} onUpdateGlossary={props.onUpdateGlossary} onResetGlossary={props.onResetGlossary}
                            onDeleteGlossaryItem={props.onDeleteGlossaryItem} onAddAiInstruction={props.onAddAiInstruction}
                            onUpdateAiInstruction={props.onUpdateAiInstruction} onDeleteAiInstruction={props.onDeleteAiInstruction}
                            onWipeData={props.onWipeData} onWipeWines={props.onWipeWines} onWipeWineries={props.onWipeWineries}
                            onWipeMenu={props.onWipeMenu} onWipeGlossary={props.onWipeGlossary} defaultRegion="vda"
                            onBulkUpdate={props.onBulkUpdate} onSeedData={() => { }} onExportBackup={props.onExportBackup}
                            onImportBackup={props.onImportBackup} onLogout={() => { props.onLogout(); setView('landing'); }}
                        />
                    </div>
                )}
            </div>
        );
    }

    // 3. Main Mobile Layout
    return (
        <MobileLayout
            activeTab={mobileTab}
            onTabChange={handleMobileTabChange}
            isAuthenticated={isAuthenticated}
        >
            {mobileTab === 'home' && (
                <MobileRegionSelector
                    onSelectRegion={(id) => {
                        setSelectedRegion(id);
                        setMobileTab('cellar');
                    }}
                    onOpenGlossary={() => setMobileTab('glossary')}
                    onOpenAdmin={() => setView('admin')}
                    language={language}
                />
            )}

            {mobileTab === 'cellar' && (
                <MobileWineList
                    wines={wines.filter(w => !w.hidden)}
                    wineries={wineries}
                    initialRegion={selectedRegion}
                    onSelectWine={setSelectedWine}
                    onSelectWinery={setSelectedWinery}
                    searchTerm={searchTerm}
                    setSearchTerm={setSearchTerm}
                    language={language}
                    autoFocusSearch={focusSearch}
                />
            )}

            {mobileTab === 'menu' && (
                <div className="pt-4 pb-24">
                    <MenuView
                        menu={menu}
                        wines={wines}
                        wineries={wineries}
                        language={language}
                        onSelectWine={setSelectedWine}
                        onUpdateMenu={onUpdateMenu}
                        onOpenGruppi={() => setShowGruppiModal(true)}
                    />
                </div>
            )}

            <GroupMenusModal
                isOpen={showGruppiModal}
                onClose={() => setShowGruppiModal(false)}
                language={language}
            />

            {mobileTab === 'sommelier' && (
                <MobileSommelier
                    chatHistory={chatHistory}
                    chatInput={chatInput}
                    setChatInput={setChatInput}
                    handleSendChat={handleSendChat}
                    isTyping={isTyping}
                    language={language}
                />
            )}

            {mobileTab === 'scan' && (
                <div className="h-full bg-black relative overflow-hidden">
                    {/* Hidden canvas for frame capture */}
                    <canvas ref={canvasRef} className="hidden" />

                    {/* Camera feed — always rendered but dimmed during analysis */}
                    <video
                        autoPlay
                        muted
                        playsInline
                        className={`w-full h-full object-cover transition-all duration-500 ${scanState !== 'camera' ? 'blur-sm brightness-50 scale-105' : ''
                            }`}
                        ref={setupCamera}
                    />

                    {/* === CAMERA STATE: Viewfinder + Capture Button === */}
                    {scanState === 'camera' && (
                        <>
                            {/* Viewfinder overlay */}
                            <div className="absolute inset-0 flex items-center justify-center pointer-events-none z-10">
                                <div className="w-72 h-96 border border-[#D4AF37]/30 rounded-2xl relative">
                                    <div className="absolute -top-px -left-px w-8 h-8 border-t-2 border-l-2 border-[#D4AF37] rounded-tl-2xl" />
                                    <div className="absolute -top-px -right-px w-8 h-8 border-t-2 border-r-2 border-[#D4AF37] rounded-tr-2xl" />
                                    <div className="absolute -bottom-px -left-px w-8 h-8 border-b-2 border-l-2 border-[#D4AF37] rounded-bl-2xl" />
                                    <div className="absolute -bottom-px -right-px w-8 h-8 border-b-2 border-r-2 border-[#D4AF37] rounded-br-2xl" />
                                    {/* Scanning line animation */}
                                    <div className="absolute inset-x-4 h-px bg-gradient-to-r from-transparent via-[#D4AF37]/60 to-transparent animate-pulse" style={{ top: '50%' }} />
                                </div>
                            </div>

                            {/* Top hint */}
                            <div className="absolute top-8 w-full text-center z-20">
                                <p className="bg-black/50 text-white/80 px-5 py-2 rounded-full inline-block text-xs font-serif italic backdrop-blur-md border border-white/10">
                                    {language === 'it' ? 'Inquadra l\'etichetta della bottiglia' : language === 'fr' ? 'Cadrez l\'étiquette de la bouteille' : 'Frame the bottle label'}
                                </p>
                            </div>

                            {/* Capture button */}
                            <div className="absolute bottom-28 w-full flex justify-center z-20">
                                <button
                                    onClick={handleScanCapture}
                                    className="group relative"
                                >
                                    {/* Outer ring */}
                                    <div className="w-20 h-20 rounded-full border-4 border-white/80 flex items-center justify-center group-active:scale-90 transition-transform duration-150">
                                        {/* Inner filled circle */}
                                        <div className="w-16 h-16 rounded-full bg-gradient-to-b from-[#D4AF37] to-[#B8963A] flex items-center justify-center shadow-lg shadow-[#D4AF37]/30">
                                            <Aperture className="w-8 h-8 text-white" />
                                        </div>
                                    </div>
                                </button>
                            </div>
                        </>
                    )}

                    {/* === ANALYZING STATE: Premium loading === */}
                    {scanState === 'analyzing' && (
                        <div className="absolute inset-0 flex flex-col items-center justify-center z-20">
                            <div className="bg-black/70 backdrop-blur-xl rounded-3xl p-8 mx-8 border border-[#D4AF37]/30 shadow-2xl shadow-black/50 text-center">
                                {/* Wine glass spinner */}
                                <div className="relative w-20 h-20 mx-auto mb-6">
                                    <div className="absolute inset-0 rounded-full border-2 border-[#D4AF37]/20" />
                                    <div className="absolute inset-0 rounded-full border-2 border-transparent border-t-[#D4AF37] animate-spin" />
                                    <WineIcon className="absolute inset-0 m-auto w-8 h-8 text-[#D4AF37] animate-pulse" />
                                </div>
                                <h3 className="text-white font-serif text-lg mb-2">
                                    {language === 'it' ? 'Analisi in corso...' : language === 'fr' ? 'Analyse en cours...' : 'Analyzing...'}
                                </h3>
                                <p className="text-white/50 text-xs font-serif italic">
                                    {language === 'it' ? 'Il sommelier sta studiando l\'etichetta' : language === 'fr' ? 'Le sommelier étudie l\'étiquette' : 'The sommelier is studying the label'}
                                </p>
                            </div>
                        </div>
                    )}

                    {/* === FOUND STATE: Success with wine info === */}
                    {scanState === 'found' && scanResult && (
                        <div className="absolute inset-0 flex flex-col items-center justify-center z-20">
                            <div className="bg-black/80 backdrop-blur-xl rounded-3xl p-8 mx-6 border border-[#D4AF37]/40 shadow-2xl shadow-[#D4AF37]/10 text-center max-w-sm">
                                {/* Success icon */}
                                <div className="w-16 h-16 mx-auto mb-5 rounded-full bg-gradient-to-b from-[#D4AF37] to-[#B8963A] flex items-center justify-center shadow-lg shadow-[#D4AF37]/40">
                                    <WineIcon className="w-8 h-8 text-white" />
                                </div>

                                <h3 className="text-white font-serif text-xl mb-1">
                                    {language === 'it' ? 'Vino Riconosciuto!' : language === 'fr' ? 'Vin Reconnu!' : 'Wine Recognized!'}
                                </h3>

                                <p className="text-[#D4AF37] font-serif text-lg font-semibold mb-3">
                                    {scanResult.wineName}
                                </p>

                                {scanResult.reasoning && (
                                    <p className="text-white/50 text-xs font-serif italic mb-5 leading-relaxed">
                                        {scanResult.reasoning}
                                    </p>
                                )}

                                <div className="flex gap-3">
                                    <button
                                        onClick={handleScanRetry}
                                        className="flex-1 py-3 px-4 rounded-xl border border-white/20 text-white/70 text-sm font-medium flex items-center justify-center gap-2 active:bg-white/10 transition-colors"
                                    >
                                        <RotateCcw className="w-4 h-4" />
                                        {language === 'it' ? 'Riprova' : language === 'fr' ? 'Réessayer' : 'Retry'}
                                    </button>
                                    <button
                                        onClick={handleScanOpenWine}
                                        className="flex-1 py-3 px-4 rounded-xl bg-gradient-to-r from-[#D4AF37] to-[#B8963A] text-white text-sm font-semibold flex items-center justify-center gap-2 active:brightness-110 transition-all shadow-lg shadow-[#D4AF37]/30"
                                    >
                                        <WineIcon className="w-4 h-4" />
                                        {language === 'it' ? 'Vedi Scheda' : language === 'fr' ? 'Voir Fiche' : 'View'}
                                    </button>
                                </div>
                            </div>
                        </div>
                    )}

                    {/* === NOT FOUND STATE === */}
                    {scanState === 'not-found' && (
                        <div className="absolute inset-0 flex flex-col items-center justify-center z-20">
                            <div className="bg-black/80 backdrop-blur-xl rounded-3xl p-8 mx-6 border border-white/10 shadow-2xl text-center max-w-sm">
                                <div className="w-16 h-16 mx-auto mb-5 rounded-full bg-white/10 flex items-center justify-center">
                                    <Camera className="w-8 h-8 text-white/40" />
                                </div>

                                <h3 className="text-white font-serif text-lg mb-2">
                                    {language === 'it' ? 'Non riconosciuto' : language === 'fr' ? 'Non reconnu' : 'Not recognized'}
                                </h3>

                                <p className="text-white/40 text-xs font-serif italic mb-4 leading-relaxed">
                                    {language === 'it'
                                        ? 'Il vino non è stato trovato nella nostra carta. Prova da un\'altra angolazione o con più luce.'
                                        : language === 'fr'
                                            ? 'Le vin n\'a pas été trouvé dans notre carte. Essayez sous un autre angle.'
                                            : 'Wine not found in our list. Try from a different angle or with more light.'}
                                </p>

                                {scanError && (
                                    <p className="text-red-400/70 text-[10px] font-mono mb-4 bg-red-900/20 rounded-lg p-2 border border-red-900/30 break-all">
                                        ⚠ {scanError}
                                    </p>
                                )}

                                <button
                                    onClick={handleScanRetry}
                                    className="w-full py-3 px-6 rounded-xl border border-[#D4AF37]/50 text-[#D4AF37] text-sm font-medium flex items-center justify-center gap-2 active:bg-[#D4AF37]/10 transition-colors"
                                >
                                    <RotateCcw className="w-4 h-4" />
                                    {language === 'it' ? 'Riprova' : language === 'fr' ? 'Réessayer' : 'Try Again'}
                                </button>
                            </div>
                        </div>
                    )}
                </div>
            )}

            {mobileTab === 'glossary' && (
                <MobileGlossary
                    items={props.glossary || []}
                    language={language}
                />
            )}

            {selectedWine && (
                <div className="fixed inset-0 z-[100] bg-black/80 backdrop-blur-sm flex items-end sm:items-center justify-center p-0 sm:p-4">
                    <div className="bg-[#0c0c0c] w-full h-[90vh] sm:h-auto sm:max-w-2xl rounded-t-3xl sm:rounded-3xl overflow-hidden relative animate-in slide-in-from-bottom duration-300 text-stone-200 shadow-2xl shadow-black/80 border border-white/10">
                        <WineDetailModal
                            wine={selectedWine}
                            winery={wineries.find(w => w.id === selectedWine.wineryId)}
                            wines={wines}
                            menu={menu}
                            language={language}
                            onClose={() => setSelectedWine(null)}
                            onGoToWinery={(winery) => {
                                setSelectedWine(null);
                                setMobileTab('cellar'); // Ensure we are on the cellar tab
                                // We need to switch view mode to 'wineries'? 
                                // Actually MobileWineList manages viewMode internally. 
                                // We might need to pass an initial view mode or handle it via a prop if we want to force 'wineries' view.
                                // For now, just setting selectedWinery triggers the WineryDetailModal on top of whatever list.
                                setSelectedWinery(winery);
                            }}
                        />
                    </div>
                </div>
            )}

            {selectedWinery && (
                <WineryDetailModal
                    winery={selectedWinery}
                    wines={wines.filter(w => w.wineryId === selectedWinery.id)}
                    language={language}
                    onClose={() => setSelectedWinery(null)}
                    onSelectWine={(w) => {
                        setSelectedWinery(null);
                        setSelectedWine(w);
                    }}
                />
            )}
        </MobileLayout>
    );
};
