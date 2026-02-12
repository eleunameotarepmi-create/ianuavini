import React from 'react';
import { Play, Wine } from 'lucide-react';

interface HowToOpenWineProps {
    language: 'it' | 'en' | 'fr';
}

export const HowToOpenWine: React.FC<HowToOpenWineProps> = ({ language }) => {
    const content = {
        it: {
            title: 'Come Aprire una Bottiglia di Vino',
            subtitle: 'L\'Arte del Sommelier',
            intro: 'Scopri la tecnica professionale per aprire una bottiglia di vino con eleganza e precisione.',
            keyPoints: [
                { title: 'La Capsula', desc: 'Due tagli sulla seconda sporgenza, sezione a C' },
                { title: 'Il Cavatappi', desc: 'Inserimento leggermente decentrato' },
                { title: 'La Leva', desc: 'Primo e secondo livello di estrazione' },
                { title: 'La Pulizia', desc: 'Pulire il bordo con un tovagliolo pulito' }
            ]
        },
        en: {
            title: 'How to Open a Wine Bottle',
            subtitle: 'The Art of the Sommelier',
            intro: 'Discover the professional technique to open a wine bottle with elegance and precision.',
            keyPoints: [
                { title: 'The Foil', desc: 'Two cuts on the second lip, C-section' },
                { title: 'The Corkscrew', desc: 'Slightly off-center insertion' },
                { title: 'The Lever', desc: 'First and second level extraction' },
                { title: 'The Wipe', desc: 'Clean the rim with a clean napkin' }
            ]
        },
        fr: {
            title: 'Comment Ouvrir une Bouteille de Vin',
            subtitle: 'L\'Art du Sommelier',
            intro: 'Découvrez la technique professionnelle pour ouvrir une bouteille de vin avec élégance et précision.',
            keyPoints: [
                { title: 'La Capsule', desc: 'Deux coupes sur la deuxième lèvre, section en C' },
                { title: 'Le Tire-bouchon', desc: 'Insertion légèrement décentrée' },
                { title: 'Le Levier', desc: 'Premier et deuxième niveau d\'extraction' },
                { title: 'Le Nettoyage', desc: 'Nettoyer le bord avec une serviette propre' }
            ]
        }
    };

    const t = content[language];

    return (
        <div className="min-h-screen bg-[#fcfbf9] animate-in fade-in duration-1000">
            {/* Hero Section */}
            <div className="relative min-h-[40vh] flex flex-col items-center justify-center text-center px-4 py-16 bg-gradient-to-b from-white to-[#fcfbf9]">
                <div className="absolute inset-0 opacity-5 pointer-events-none">
                    <div className="absolute inset-0 bg-[radial-gradient(circle_at_50%_50%,_#D4AF37_1px,_transparent_1px)] bg-[length:24px_24px]" />
                </div>

                <div className="relative z-10 max-w-3xl space-y-6">
                    <div className="flex items-center justify-center gap-3 mb-4">
                        <div className="w-12 h-12 rounded-full bg-[#D4AF37]/10 flex items-center justify-center">
                            <Wine className="text-[#D4AF37]" size={24} />
                        </div>
                    </div>

                    <h1 className="text-4xl md:text-5xl font-serif text-stone-800 uppercase tracking-[0.2em] leading-tight">
                        {t.title}
                    </h1>

                    <div className="w-16 h-[2px] bg-[#D4AF37] mx-auto" />

                    <p className="text-sm font-sans font-bold text-[#D4AF37] uppercase tracking-[0.3em]">
                        {t.subtitle}
                    </p>

                    <p className="text-xl font-serif italic text-stone-600 leading-relaxed max-w-2xl mx-auto">
                        {t.intro}
                    </p>
                </div>
            </div>

            {/* Video Section */}
            <div className="max-w-5xl mx-auto px-4 py-12">
                <div className="relative bg-white rounded-3xl shadow-2xl overflow-hidden border-2 border-[#D4AF37]/20">
                    {/* Decorative corners */}
                    <div className="absolute top-0 left-0 w-16 h-16 border-t-4 border-l-4 border-[#D4AF37] rounded-tl-3xl" />
                    <div className="absolute top-0 right-0 w-16 h-16 border-t-4 border-r-4 border-[#D4AF37] rounded-tr-3xl" />
                    <div className="absolute bottom-0 left-0 w-16 h-16 border-b-4 border-l-4 border-[#D4AF37] rounded-bl-3xl" />
                    <div className="absolute bottom-0 right-0 w-16 h-16 border-b-4 border-r-4 border-[#D4AF37] rounded-br-3xl" />

                    {/* Video Container */}
                    <div className="relative p-4 md:p-8">
                        <div className="relative w-full" style={{ paddingBottom: '56.25%' }}>
                            <iframe
                                className="absolute top-0 left-0 w-full h-full rounded-2xl"
                                src="https://www.youtube.com/embed/hxf8HLSugrw"
                                title="How to Open a Wine Bottle"
                                frameBorder="0"
                                allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                                allowFullScreen
                            />
                        </div>
                    </div>
                </div>
            </div>

            {/* Key Points Section */}
            <div className="max-w-4xl mx-auto px-4 py-16 pb-32">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    {t.keyPoints.map((point, idx) => (
                        <div
                            key={idx}
                            className="bg-white rounded-2xl p-6 border border-[#D4AF37]/20 shadow-md hover:shadow-xl transition-all duration-300 group"
                        >
                            <div className="flex items-start gap-4">
                                <div className="w-10 h-10 rounded-full bg-[#D4AF37]/10 flex items-center justify-center flex-shrink-0 group-hover:bg-[#D4AF37]/20 transition-colors">
                                    <span className="font-serif font-bold text-[#D4AF37]">{idx + 1}</span>
                                </div>
                                <div className="flex-1">
                                    <h3 className="font-serif font-bold text-stone-800 uppercase tracking-wider text-sm mb-2">
                                        {point.title}
                                    </h3>
                                    <p className="font-sans text-stone-600 text-sm leading-relaxed">
                                        {point.desc}
                                    </p>
                                </div>
                            </div>
                        </div>
                    ))}
                </div>
            </div>
        </div>
    );
};
