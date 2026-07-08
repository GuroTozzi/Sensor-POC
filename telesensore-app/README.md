# Telesensore — Prototipo interattivo

Prototipo cliccabile in localhost di un'app tablet dark mode per la
visualizzazione dati di un telesensore a tracciamento speckle. Dati e stati
sono interamente mockati lato client: non c'è alcun backend reale.

## Avvio

```bash
npm install
npm run dev
```

Il progetto parte su `http://localhost:5173` (Vite sceglie automaticamente
un'altra porta libera se occupata). Funziona sia in finestra tablet landscape
(~1366×1024) sia in un browser desktop per demo.

Altri comandi utili:

```bash
npm run build    # build di produzione (tsc + vite build)
npm run preview  # serve la build di produzione in locale
```

## Flusso da far provare a un utente

1. **Connessione → Non raggiungibile** (`/connection/unreachable`, schermata
   iniziale): badge rosso, diagramma tablet/sensore con linea interrotta.
   Click su **Riprova** → passa a "In avvio".
2. **Connessione → In avvio** (`/connection/starting`): badge ambra,
   inizializzazione animata. Dopo 4s passa automaticamente a "Pronto", oppure
   si può forzare subito con **Simula sensore pronto**.
3. **Connessione → Pronto** (`/connection/ready`): badge verde. Da qui la
   sidebar sblocca *Visualizzazione* e *Configurazione*.
4. **Visualizzazione → Vista Grafici** (`/visualization/graphs`): grafico
   "Qualità della correlazione" e "Oscillazione" (Recharts), con finestra
   temporale configurabile, toggle FFT e picchi correlazione.
5. **Visualizzazione → Vista 3D** (`/visualization/3d`): solido oscillante
   (Cubo/Parallelepipedo/Sfera) su un reticolo tecnico, camera fissa con solo
   zoom/pan/reset, stato dato (valido/inaffidabile/mancante — il solido si
   congela sull'ultima posizione valida).
6. **Configurazione** (`/configuration`): parametri sensore, parametri
   visualizzazione, dati e sessione. **Avvia acquisizione** blocca i
   parametri sensore e propaga lo stato `acquiring` a tutta l'app (grafici
   live, durata, pacchetti). **Salva configurazione** mostra un loading di
   1s e un toast di conferma.

La voce sidebar *Connessione* riflette sempre lo stato corrente del sensore;
*Acquisizione, Sensori, Allarmi, Report, Impostazioni* sono presenti nel menu
come da riferimento visivo ma non sono incluse in questo prototipo (mostrano
un toast informativo al click).

## Dati mockati

`src/data/mockSensorData.ts` genera deterministicamente le serie temporali
(correlazione, oscillazione X/Y, FFT) con buchi/drop ricorrenti — i dati
mancanti restano visibili come interruzioni nei grafici, non vengono
interpolati. Il "tempo simulato" globale (`simulatedTime` in
`AppStateContext`) avanza solo mentre l'acquisizione è attiva; a riposo i
grafici mostrano comunque una finestra statica di storico.

## Struttura

```
src/
  components/           componenti UI riutilizzabili
  pages/                schermate (Connessione, Visualizzazione, Configurazione)
  state/AppStateContext.tsx   stato globale: stato sensore, acquisizione, config, toast
  data/mockSensorData.ts      generatori dati mock + costanti
  styles/tokens.css, globals.css   palette dark mode e stili globali
```

## Note implementative

- Grafici 2D: **Recharts** (`CorrelationChart`, `OscillationChart`, `FFTChart`).
- Vista 3D: **React Three Fiber** + **drei**, camera ortografica fissa
  (nessun `OrbitControls`, nessuna rotazione/tilt); zoom e pan sono stato
  React puro, "Reset vista" riporta ai valori iniziali.
- Micro-interazioni e toast: **Framer Motion**.
- Icone: **lucide-react**.
