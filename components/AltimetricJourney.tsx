import React, { useMemo, useState } from 'react';
import { Wine, Winery } from '../types';
import { getAltitude } from '../constants';

interface AltimetricJourneyProps {
    wines: Wine[];
    wineries: Winery[];
    onSelectWinery: (wineryId: string) => void;
}

export const AltimetricJourney: React.FC<AltimetricJourneyProps> = ({ wines, wineries, onSelectWinery }) => {
    const [activeId, setActiveId] = useState<string | null>(null);
    const [hoveredId, setHoveredId] = useState<string | null>(null);

    const mapData = useMemo(() => {
        const activeWineries = wineries.filter(w => wines.some(wine => wine.wineryId === w.id));
        const sorted = activeWineries.map(w => {
            const alt = getAltitude(w.location) || 500;
            return { ...w, altitude: alt };
        }).sort((a, b) => a.altitude - b.altitude);

        const count = sorted.length;
        if (count === 0) return [];

        // Position wineries along the sinuous path matching the clean PNG
        // Image is square-ish, centered in container - need tighter positioning
        return sorted.map((w, index) => {
            const t = count > 1 ? index / (count - 1) : 0.5;

            // The path goes from right (low altitude) to left (high altitude)
            // Keep nodes within the valley - adjusted for the new image
            const baseX = 72 - (t * 48); // 72% -> 24%

            // Y follows the sinuous curve through the valley center
            // Adjusted for the new image proportions
            const curveY = 48 + Math.sin(t * Math.PI * 1.2) * 8 - (t * 4);

            return {
                winery: w,
                x: baseX,
                y: curveY,
                altitude: w.altitude
            };
        });
    }, [wines, wineries]);

    const handleNodeClick = (id: string) => {
        setActiveId(id);
        onSelectWinery(id);
    };

    return (
        <div className="w-full flex justify-center py-6 select-none">
            <div
                className="relative w-full max-w-4xl mx-4 rounded-2xl overflow-hidden"
                style={{
                    backgroundColor: '#1a1a1a',
                    aspectRatio: '16/10'
                }}
            >
                {/* Background PNG map - provides accurate VdA outline (clean, no labels) */}
                <img
                    src="/vda-map-clean.png"
                    alt="Valle d'Aosta"
                    className="absolute inset-0 w-full h-full object-contain"
                    style={{ opacity: 1 }}
                />

                {/* Interactive nodes overlay */}
                <div className="absolute inset-0">
                    {mapData.map((node) => {
                        const isActive = activeId === node.winery.id;
                        const isHovered = hoveredId === node.winery.id;
                        const showLabel = isActive || isHovered;

                        return (
                            <div
                                key={node.winery.id}
                                onClick={() => handleNodeClick(node.winery.id)}
                                onMouseEnter={() => setHoveredId(node.winery.id)}
                                onMouseLeave={() => setHoveredId(null)}
                                className="absolute cursor-pointer transform -translate-x-1/2 -translate-y-1/2 transition-all duration-200 z-10"
                                style={{
                                    left: `${node.x}%`,
                                    top: `${node.y}%`,
                                }}
                            >
                                {/* Outer glow ring */}
                                <div
                                    className="absolute rounded-full transition-all duration-200 pointer-events-none"
                                    style={{
                                        width: '28px',
                                        height: '28px',
                                        left: '-6px',
                                        top: '-6px',
                                        backgroundColor: '#D4AF37',
                                        filter: 'blur(8px)',
                                        opacity: isActive || isHovered ? 0.6 : 0.25
                                    }}
                                />

                                {/* Main node */}
                                <div
                                    className="relative rounded-full border-2 border-[#D4AF37] transition-all duration-200"
                                    style={{
                                        width: isActive || isHovered ? '18px' : '14px',
                                        height: isActive || isHovered ? '18px' : '14px',
                                        backgroundColor: isActive ? '#D4AF37' : '#F5E6C8',
                                        boxShadow: isActive || isHovered
                                            ? '0 0 15px rgba(212, 175, 55, 0.6)'
                                            : '0 0 8px rgba(212, 175, 55, 0.4)',
                                    }}
                                />

                                {/* Label - only on hover/active */}
                                {showLabel && (
                                    <div
                                        className="absolute whitespace-nowrap text-center pointer-events-none animate-in fade-in duration-200"
                                        style={{
                                            left: '50%',
                                            bottom: '100%',
                                            marginBottom: '10px',
                                            transform: 'translateX(-50%)',
                                            backgroundColor: 'rgba(0,0,0,0.9)',
                                            padding: '8px 14px',
                                            borderRadius: '10px',
                                            border: '1px solid rgba(212,175,55,0.4)',
                                            boxShadow: '0 4px 20px rgba(0,0,0,0.5)',
                                        }}
                                    >
                                        <span
                                            style={{
                                                color: '#D4AF37',
                                                fontSize: '13px',
                                                fontFamily: 'serif',
                                                fontWeight: 'bold',
                                            }}
                                        >
                                            {node.winery.name}
                                        </span>
                                        <span
                                            style={{
                                                display: 'block',
                                                color: '#888',
                                                fontSize: '11px',
                                                marginTop: '3px',
                                            }}
                                        >
                                            {node.altitude} m s.l.m.
                                        </span>
                                    </div>
                                )}
                            </div>
                        );
                    })}
                </div>
            </div>
        </div>
    );
};
