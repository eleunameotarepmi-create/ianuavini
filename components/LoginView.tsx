import React, { useState } from 'react';
import { LogIn, Lock, Unlock, AlertCircle } from 'lucide-react';

interface LoginViewProps {
    onLoginSuccess: () => void;
}

export const LoginView: React.FC<LoginViewProps> = ({ onLoginSuccess }) => {
    const [password, setPassword] = useState('');
    const [error, setError] = useState(false);

    // SIMPLE HARDCODED PASSWORD (CLIENT-SIDE)
    // In a real banking app this is bad. For a wine list admin panel, it's practical.
    const SECRET_KEY = "Swamyburgher13";

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        if (password === SECRET_KEY) {
            onLoginSuccess();
            setError(false);
        } else {
            setError(true);
            setDebugMsg("Password errata. Riprova.");
        }
    };

    const [debugMsg, setDebugMsg] = useState("");

    return (
        <div className="flex flex-col items-center justify-center h-full p-8 text-center animate-in fade-in">
            <div className="bg-white/80 backdrop-blur-md p-10 rounded-2xl border border-stone-200 shadow-2xl max-w-sm w-full">
                <div className="flex justify-center mb-6">
                    <div className="w-16 h-16 bg-[#D4AF37]/10 rounded-full flex items-center justify-center">
                        <Lock className="w-8 h-8 text-[#D4AF37]" />
                    </div>
                </div>

                <h2 className="text-2xl font-serif text-stone-800 mb-2">Accesso Admin</h2>
                <p className="text-stone-500 mb-8 font-light italic text-sm">Inserisci la chiave di sicurezza.</p>

                <form onSubmit={handleSubmit} className="space-y-4">
                    <div>
                        <input
                            type="password"
                            value={password}
                            onChange={(e) => setPassword(e.target.value)}
                            placeholder="Password..."
                            className="w-full px-4 py-3 bg-[#fdfcf9] border border-stone-300 rounded-lg outline-none focus:border-[#D4AF37] focus:ring-1 focus:ring-[#D4AF37]transition-all font-serif text-center tracking-widest"
                            autoFocus
                        />
                    </div>

                    {error && (
                        <div className="flex items-center justify-center gap-2 text-red-600 text-xs animate-pulse">
                            <AlertCircle size={12} />
                            <span>Password non valida</span>
                        </div>
                    )}

                    <button
                        type="submit"
                        className="w-full flex items-center justify-center gap-2 px-6 py-3 bg-[#D4AF37] text-white font-medium rounded-full hover:bg-[#B5952F] transition-all transform hover:scale-[1.02] shadow-md"
                    >
                        <Unlock className="w-4 h-4" />
                        Sblocca
                    </button>
                    {debugMsg && <p className="text-[10px] text-stone-300 mt-2">{debugMsg}</p>}
                </form>

                <p className="mt-8 text-[10px] text-stone-400">
                    Solo personale autorizzato Ianua.
                </p>
            </div>
        </div>
    );
};
