import React, { useState, useEffect } from 'react';
import { Wine, Winery, AppView, MenuItem, GlossaryItem, AiInstruction } from './types';
import { io } from 'socket.io-client';
// Data Provider & Switcher
import { MobileApp } from './components/mobile/MobileApp';
import { DesktopMobileWrapper } from './components/mobile/DesktopMobileWrapper';

const API_TOKEN = 'ianua2024';
const API_URL = window.location.hostname === 'localhost'
  ? 'http://localhost:3577'
  : '';

const socket = io(API_URL);

const STORAGE_KEY = 'ianua_app_db_v_final';

const App: React.FC = () => {
  // Global State
  const [view, setView] = useState<AppView>('landing');
  const [language, setLanguage] = useState<'it' | 'en' | 'fr'>('it');
  const [isAuthenticated, setIsAuthenticated] = useState(false);

  // Data State
  const [wines, setWines] = useState<Wine[]>([]);
  const [wineries, setWineries] = useState<Winery[]>([]);
  const [menu, setMenu] = useState<MenuItem[]>([]);
  const [glossary, setGlossary] = useState<GlossaryItem[]>([]);
  const [aiInstructions, setAiInstructions] = useState<AiInstruction[]>([]);

  // Data Fetching & Sync
  useEffect(() => {
    const savedAuth = localStorage.getItem('ianua_admin_auth');
    if (savedAuth === 'true') setIsAuthenticated(true);

    const fetchAllData = async () => {
      try {
        const res = await fetch(`${API_URL}/api/db`);
        const data = await res.json();
        if (data) {
          setWines(data.wines || []);
          setWineries(data.wineries || []);
          setMenu(data.menu || []);
          setGlossary(data.glossary || []);
          setAiInstructions(data.ai_instructions || []);
        }
      } catch (err) {
        console.error("Failed to fetch data:", err);
      }
    };

    fetchAllData();

    socket.on('db_updated', (data) => {
      setWines(data.wines || []);
      setWineries(data.wineries || []);
      setMenu(data.menu || []);
      setGlossary(data.glossary || []);
      setAiInstructions(data.ai_instructions || []);
    });

    return () => {
      socket.off('db_updated');
    };
  }, []);

  // Auth Handlers
  const handleLoginSuccess = () => {
    setIsAuthenticated(true);
    localStorage.setItem('ianua_admin_auth', 'true');
  };

  const handleLogout = () => {
    setIsAuthenticated(false);
    localStorage.removeItem('ianua_admin_auth');
    setView('landing');
  };

  // Data Persistence Helper
  const saveToLocal = async (updatedData: any) => {
    try {
      const res = await fetch(`${API_URL}/api/db`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          token: API_TOKEN,
          data: updatedData
        })
      });
      if (!res.ok) throw new Error("Save failed");
    } catch (err) {
      console.error(err);
      alert("Errore salvataggio server locale");
    }
  };

  // Data Actions (Passed to children)
  const handlers = {
    onAddWine: async (w: Wine) => {
      if (!isAuthenticated) return alert("Non autorizzato");
      await saveToLocal({ wines: [...wines, w], wineries, menu, glossary, ai_instructions: aiInstructions });
    },
    onUpdateWine: async (w: Wine) => {
      if (!isAuthenticated) return alert("Non autorizzato");
      await saveToLocal({ wines: wines.map(xw => xw.id === w.id ? w : xw), wineries, menu, glossary, ai_instructions: aiInstructions });
    },
    onBatchUpdateWines: async (updates: Partial<Wine>[]) => {
      if (!isAuthenticated) return alert("Non autorizzato");
      let updated = [...wines];
      for (const upd of updates) {
        if (!upd.id) continue;
        const idx = updated.findIndex(w => w.id === upd.id);
        if (idx >= 0) {
          updated[idx] = { ...updated[idx], ...upd };
        }
      }
      await saveToLocal({ wines: updated, wineries, menu, glossary, ai_instructions: aiInstructions });
    },
    onDeleteWine: async (id: string) => {
      if (!isAuthenticated) return alert("Non autorizzato");
      await saveToLocal({ wines: wines.filter(w => w.id !== id), wineries, menu, glossary, ai_instructions: aiInstructions });
    },
    onAddWinery: async (w: Winery) => {
      if (!isAuthenticated) return alert("Non autorizzato");
      await saveToLocal({ wines, wineries: [...wineries, w], menu, glossary, ai_instructions: aiInstructions });
    },
    onUpdateWinery: async (w: Winery) => {
      if (!isAuthenticated) return alert("Non autorizzato");
      await saveToLocal({ wines, wineries: wineries.map(xw => xw.id === w.id ? w : xw), menu, glossary, ai_instructions: aiInstructions });
    },
    onDeleteWinery: async (id: string) => {
      if (!isAuthenticated) return alert("Non autorizzato");
      // Check constraints logic here if needed, simplified for split
      if (confirm(`Eliminare cantina e vini associati?`)) {
        await saveToLocal({ wines: wines.filter(w => w.wineryId !== id), wineries: wineries.filter(w => w.id !== id), menu, glossary, ai_instructions: aiInstructions });
      }
    },
    onUpdateMenu: async (items: MenuItem[]) => {
      if (!isAuthenticated) return;
      await saveToLocal({ wines, wineries, menu: items, glossary, ai_instructions: aiInstructions });
    },
    onUpdateGlossary: async (items: GlossaryItem[]) => {
      if (!isAuthenticated) return;
      await saveToLocal({ wines, wineries, menu, glossary: items, ai_instructions: aiInstructions });
    },
    onResetGlossary: async (items: GlossaryItem[]) => {
      if (!isAuthenticated) return;
      await saveToLocal({ wines, wineries, menu, glossary: items, ai_instructions: aiInstructions });
    },
    onDeleteGlossaryItem: async (term: string) => {
      if (!isAuthenticated) return;
      await saveToLocal({ wines, wineries, menu, glossary: glossary.filter(g => g.term !== term), ai_instructions: aiInstructions });
    },
    onAddAiInstruction: async (i: AiInstruction) => {
      if (!isAuthenticated) return alert("Non autorizzato");
      await saveToLocal({ wines, wineries, menu, glossary, ai_instructions: [...aiInstructions, i] });
    },
    onUpdateAiInstruction: async (i: AiInstruction) => {
      if (!isAuthenticated) return alert("Non autorizzato");
      await saveToLocal({ wines, wineries, menu, glossary, ai_instructions: aiInstructions.map(ai => ai.id === i.id ? i : ai) });
    },
    onDeleteAiInstruction: async (id: string) => {
      if (!isAuthenticated) return alert("Non autorizzato");
      await saveToLocal({ wines, wineries, menu, glossary, ai_instructions: aiInstructions.filter(ai => ai.id !== id) });
    },
    onWipeData: async () => {
      if (!isAuthenticated) return alert("Non autorizzato");
      if (confirm("CANCELLARE TUTTO?")) await saveToLocal({ wines: [], wineries: [], menu: [], glossary: [], ai_instructions: [] });
    },
    onWipeWines: async () => {
      if (!isAuthenticated) return alert("Non autorizzato");
      if (confirm("Cancellare tutti i vini?")) await saveToLocal({ wines: [], wineries, menu, glossary, ai_instructions: aiInstructions });
    },
    onWipeWineries: async () => {
      if (!isAuthenticated) return alert("Non autorizzato");
      if (confirm("Cancellare cantine e vini?")) await saveToLocal({ wines: [], wineries, menu, glossary, ai_instructions: aiInstructions });
    },
    onWipeMenu: async () => {
      if (!isAuthenticated) return alert("Non autorizzato");
      if (confirm("Cancellare menu?")) await saveToLocal({ wines, wineries, menu: [], glossary, ai_instructions: aiInstructions });
    },
    onWipeGlossary: async () => {
      if (!isAuthenticated) return alert("Non autorizzato");
      if (confirm("Cancellare glossario?")) await saveToLocal({ wines, wineries, menu, glossary: [], ai_instructions: aiInstructions });
    },
    onBulkUpdate: async (data: any) => {
      if (!isAuthenticated) return alert("Non autorizzato");
      await saveToLocal({ ...data, ai_instructions: aiInstructions }); // Preserve AI instructions if not in bulk
    },
    onExportBackup: async () => {
      if (!isAuthenticated) return alert("Non autorizzato");
      try {
        const response = await fetch(`${API_URL}/api/admin/backup/export`);
        if (!response.ok) throw new Error("Export failed");
        const blob = await response.blob();
        const url = window.URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `ianua_backup_${new Date().toISOString().slice(0, 10)}.json`;
        document.body.appendChild(a);
        a.click();
        window.URL.revokeObjectURL(url);
        a.remove();
      } catch (err: any) {
        console.error(err);
        alert("Errore Export: " + err.message);
      }
    },
    onImportBackup: (event: React.ChangeEvent<HTMLInputElement>) => {
      if (!isAuthenticated) return alert("Non autorizzato");
      const file = event.target.files?.[0];
      if (!file) return;

      const reader = new FileReader();
      reader.onload = async (e) => {
        const content = e.target?.result;
        if (typeof content === 'string') {
          try {
            const parsed = JSON.parse(content);
            if (confirm(`Importare backup?`)) {
              try {
                const res = await fetch(`${API_URL}/api/admin/backup/import`, {
                  method: 'POST',
                  headers: { 'Content-Type': 'application/json' },
                  body: JSON.stringify({ token: API_TOKEN, data: parsed })
                });

                const result = await res.json();

                if (!res.ok) {
                  throw new Error(result.error || "Import failed on server");
                }

                alert("Import completato con successo!");
                window.location.reload();
              } catch (err: any) {
                console.error(err);
                alert("ERRORE IMPORT SERVER: " + err.message);
              }
            }
          } catch (err: any) {
            console.error(err);
            alert("ERRORE LETTURA FILE JSON: " + err.message);
          }
        }
      };
      reader.readAsText(file);
      event.target.value = '';
    }
  };

  return (
    <DesktopMobileWrapper>
      <MobileApp
        view={view}
        setView={setView}
        language={language}
        setLanguage={setLanguage}
        wines={wines} wineries={wineries} menu={menu} aiInstructions={aiInstructions} isAuthenticated={isAuthenticated}
        onLoginSuccess={handleLoginSuccess}
        onLogout={handleLogout}
        {...handlers}
      />
    </DesktopMobileWrapper>
  );
};

export default App;