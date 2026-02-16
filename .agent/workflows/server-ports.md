---
description: MANDATORY server port configuration for this workspace — MUST be respected at all times
---

# ⛔ REGOLA IMPERATIVA — PORTE SERVER

Questa app (**IanuaVini-Mobile Experience**) in questa cartella lavora ESCLUSIVAMENTE su queste porte:

- **Frontend (Vite dev server): porta 3576**
- **Backend (API server): porta 3577**

## 📱 ARCHITETTURA FONDAMENTALE — MOBILE APP PURA

**Questa è una MOBILE APP pura. NON è un desktop wrapper.**

- ✅ Mobile-first, mobile-only
- ✅ Design ottimizzato per viewport mobile (max 430px)
- ✅ Touch-first interactions
- ❌ NO desktop frame/wrapper visibili all'utente
- ❌ NO responsive breakpoints per desktop
- ❌ NO simulazioni di device frame (il `DesktopMobileWrapper` è solo per sviluppo su PC, mai visibile in produzione)
- ❌ NO adattamenti per schermi grandi

**Se l'utente edita l'app su PC**, vede il telefono simulato (DesktopMobileWrapper) ma **tutto quello che costruisco deve essere pensato e funzionare come una vera app mobile**, non come un sito responsive.

## GERARCHIA DI PRIORITÀ ASSOLUTA

Quando si lavora in questo workspace, la priorità è questa (dall'alto verso il basso):

1. **QUELLO CHE DICE L'UTENTE** — se l'utente dice "porta 3576", è 3576. Punto.
2. **CODICE NEL WORKSPACE CORRENTE** — `vite.config.ts`, `App.tsx` contengono la verità attuale
3. **Tutto il resto NON CONTA** — riassunti di conversazioni vecchie, conoscenze generiche, esempi da altri progetti: IGNORARE

Se un riassunto di conversazione passata dice "3000/3002" ma il codice dice "3576/3577", il codice vince.
Se l'utente dice "3576/3577" ma io penso di ricordare altro, l'utente vince.
Se Vite di default usa 5173 ma il config dice 3576, il config vince.

**NON esistono eccezioni a questa gerarchia.**

## DIVIETI ASSOLUTI

1. NON usare MAI nessun'altra porta (es. 5173, 3000, 3002, 8080, o qualsiasi altra)
2. NON presumere porte da conoscenze generiche — leggere sempre `vite.config.ts`
3. NON eseguire comandi curl, fetch, test o diagnostica su porte diverse da 3576/3577
4. NON suggerire all'utente di aprire il browser su porte diverse da 3576
5. NON modificare le porte configurate in `vite.config.ts` o `App.tsx`

## PRIMA DI QUALSIASI OPERAZIONE SERVER

Prima di eseguire qualsiasi comando che coinvolga il server (curl, test, apertura browser, ecc.):

1. Ricordare: frontend = localhost:3576, backend = localhost:3577
2. NON servono verifiche — queste porte sono FISSE e IMMUTABILI per questo workspace

## DEPLOYMENT

L'app è deployata su:

- **Locale**: porte 3576 (frontend) e 3577 (backend)
- **Produzione**: Vercel
- **Repository**: GitHub

Nessun altro server, nessun'altra porta, nessun'altra destinazione.
