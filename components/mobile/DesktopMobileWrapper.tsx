import React, { useEffect, useState } from 'react';

/**
 * DesktopMobileWrapper
 * 
 * This component forces a mobile-like presentation when the app is viewed on a large screen (Desktop).
 * It centers the content in a phone-sized frame.
 */
export const DesktopMobileWrapper: React.FC<{ children: React.ReactNode }> = ({ children }) => {
    const [isDesktop, setIsDesktop] = useState(false);

    useEffect(() => {
        const checkScreen = () => {
            // Check if width is greater than typical mobile breakpoint (e.g. tablet/desktop)
            setIsDesktop(window.innerWidth > 768);
        };

        checkScreen();
        window.addEventListener('resize', checkScreen);
        return () => window.removeEventListener('resize', checkScreen);
    }, []);

    if (!isDesktop) {
        return <>{children}</>;
    }

    return (
        <div className="min-h-screen w-full bg-stone-900 flex items-center justify-center p-4">
            <div className="relative w-full max-w-[430px] h-[90vh] max-h-[932px] bg-black shadow-2xl rounded-[3rem] overflow-hidden border-8 border-stone-800 ring-1 ring-white/10">
                {/* iPhone Dynamic Island Simulation (Optional aesthetic) */}
                <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[120px] h-[35px] bg-black z-50 rounded-b-3xl transform transition-all duration-300 hover:w-[150px] hover:h-[40px]"></div>

                {/* Content Container */}
                <div className="w-full h-full overflow-y-auto bg-stone-950 no-scrollbar">
                    {children}
                </div>
            </div>

            {/* Desktop Branding — gold text */}
            <div className="fixed bottom-8 text-[#D4AF37] text-sm tracking-[0.3em] hidden md:block z-10" style={{ fontFamily: "'Cinzel', serif", textShadow: '0 0 20px rgba(212,175,55,0.3)' }}>
                IANUA VINI MOBILE EXPERIENCE
            </div>
        </div>
    );
};
