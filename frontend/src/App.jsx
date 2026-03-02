import { useState, useCallback } from "react";

const styles = `
  @import url('https://fonts.googleapis.com/css2?family=Lora:ital,wght@0,400;0,600;0,700;1,400&family=DM+Sans:wght@300;400;500;600&display=swap');

  * { box-sizing: border-box; margin: 0; padding: 0; }

  :root {
    --ink: #1a1a2e; --paper: #f7f3ed; --amber: #e8a020; --amber-light: #fdf3e0;
    --sage: #4a7c59; --sage-light: #e8f0eb; --muted: #8a8070; --surface: white;
    --border: rgba(26,26,46,0.10);
    --card-shadow: 0 4px 24px rgba(26,26,46,0.10), 0 1px 4px rgba(26,26,46,0.07);
    --card-shadow-hover: 0 12px 40px rgba(26,26,46,0.16), 0 2px 8px rgba(26,26,46,0.10);
  }
  .dark {
    --ink: #e8e4dc; --paper: #12111a; --amber: #f0b030; --amber-light: #2a2010;
    --sage: #6aad80; --sage-light: #0e2018; --muted: #7a7570; --surface: #1e1c2a;
    --border: rgba(232,228,220,0.10);
    --card-shadow: 0 4px 24px rgba(0,0,0,0.30), 0 1px 4px rgba(0,0,0,0.20);
    --card-shadow-hover: 0 12px 40px rgba(0,0,0,0.40), 0 2px 8px rgba(0,0,0,0.25);
  }

  body { background: var(--paper); font-family: 'DM Sans', sans-serif; color: var(--ink); transition: background 0.3s, color 0.3s; }
  .app { min-height: 100vh; background: var(--paper); background-image: radial-gradient(ellipse at 20% 0%, rgba(232,160,32,0.08) 0%, transparent 60%), radial-gradient(ellipse at 80% 100%, rgba(74,124,89,0.07) 0%, transparent 60%); transition: background 0.3s; }

  .header { padding: 28px 40px 20px; display: flex; align-items: center; justify-content: space-between; border-bottom: 1px solid var(--border); }
  .logo { display: flex; align-items: center; gap: 10px; }
  .logo-icon { width: 36px; height: 36px; background: var(--ink); border-radius: 8px; display: flex; align-items: center; justify-content: center; font-size: 18px; }
  .logo-text { font-family: 'Lora', serif; font-size: 20px; font-weight: 700; color: var(--ink); }
  .logo-text span { color: var(--amber); }
  .header-right { display: flex; align-items: center; gap: 16px; }
  .header-tagline { font-size: 13px; color: var(--muted); }
  .dark-toggle { width: 44px; height: 24px; background: var(--border); border-radius: 100px; border: 1.5px solid var(--border); cursor: pointer; position: relative; transition: background 0.3s; flex-shrink: 0; outline: none; }
  .dark-toggle.on { background: var(--amber); border-color: var(--amber); }
  .dark-toggle-thumb { position: absolute; top: 2px; left: 2px; width: 16px; height: 16px; background: white; border-radius: 50%; transition: transform 0.25s cubic-bezier(0.4,0,0.2,1); display: flex; align-items: center; justify-content: center; font-size: 10px; }
  .dark-toggle.on .dark-toggle-thumb { transform: translateX(20px); }

  .main { max-width: 860px; margin: 0 auto; padding: 48px 24px 80px; }

  /* UPLOAD */
  .upload-section { text-align: center; padding: 20px 0 40px; }
  .upload-headline { font-family: 'Lora', serif; font-size: 38px; font-weight: 700; color: var(--ink); line-height: 1.2; margin-bottom: 12px; letter-spacing: -0.5px; }
  .upload-headline em { font-style: italic; color: var(--amber); }
  .upload-sub { font-size: 16px; color: var(--muted); margin-bottom: 36px; }
  .dropzone { border: 2px dashed var(--border); border-radius: 20px; padding: 56px 40px; background: var(--surface); cursor: pointer; transition: all 0.2s ease; position: relative; }
  .dropzone:hover, .dropzone.drag-over { border-color: var(--amber); background: var(--amber-light); transform: translateY(-2px); box-shadow: var(--card-shadow-hover); }
  .dropzone input { position: absolute; inset: 0; opacity: 0; cursor: pointer; width: 100%; height: 100%; }
  .dropzone-icon { font-size: 48px; margin-bottom: 16px; }
  .dropzone-title { font-size: 18px; font-weight: 600; color: var(--ink); margin-bottom: 8px; }
  .dropzone-sub { font-size: 14px; color: var(--muted); }
  .file-badge { display: inline-flex; align-items: center; gap: 8px; background: var(--sage-light); border: 1px solid rgba(74,124,89,0.25); border-radius: 100px; padding: 8px 16px; font-size: 14px; color: var(--sage); font-weight: 500; margin-top: 16px; }

  /* ANALYZE LOADING */
  .analyze-loading { text-align: center; padding: 48px 20px; background: var(--surface); border-radius: 20px; box-shadow: var(--card-shadow); margin-top: 24px; }
  .analyze-spinner { width: 36px; height: 36px; border: 3px solid var(--border); border-top-color: var(--amber); border-radius: 50%; animation: spin 0.8s linear infinite; margin: 0 auto 16px; }
  @keyframes spin { to { transform: rotate(360deg); } }

  /* TOPICS */
  .topics-section { background: var(--surface); border-radius: 20px; padding: 28px; box-shadow: var(--card-shadow); margin-top: 24px; }
  .topics-header { display: flex; align-items: center; justify-content: space-between; margin-bottom: 8px; flex-wrap: wrap; gap: 10px; }
  .topics-title { font-family: 'Lora', serif; font-size: 20px; font-weight: 700; color: var(--ink); }
  .topics-sub { font-size: 13px; color: var(--muted); margin-bottom: 20px; }
  .topics-actions { display: flex; gap: 8px; }
  .btn-topic-action { background: transparent; border: 1.5px solid var(--border); border-radius: 8px; padding: 5px 12px; font-size: 12px; color: var(--muted); font-family: 'DM Sans', sans-serif; cursor: pointer; transition: all 0.2s; }
  .btn-topic-action:hover { border-color: var(--amber); color: var(--amber); }

  .topics-grid { display: grid; grid-template-columns: repeat(auto-fill, minmax(200px, 1fr)); gap: 10px; margin-bottom: 24px; }
  .topic-card { border: 1.5px solid var(--border); border-radius: 14px; padding: 14px 16px; cursor: pointer; transition: all 0.2s ease; background: var(--paper); }
  .topic-card:hover { border-color: var(--amber); transform: translateY(-1px); }
  .topic-card.selected { border-color: var(--amber); background: var(--amber-light); }
  .topic-card-top { display: flex; align-items: center; gap: 8px; margin-bottom: 6px; }
  .topic-emoji { font-size: 20px; }
  .topic-title { font-size: 14px; font-weight: 600; color: var(--ink); line-height: 1.3; }
  .topic-desc { font-size: 12px; color: var(--muted); line-height: 1.4; }
  .topic-check { width: 18px; height: 18px; border-radius: 50%; border: 2px solid var(--border); margin-left: auto; flex-shrink: 0; display: flex; align-items: center; justify-content: center; font-size: 10px; transition: all 0.2s; }
  .topic-card.selected .topic-check { background: var(--amber); border-color: var(--amber); color: white; }

  .topics-note { font-size: 12px; color: var(--muted); text-align: center; margin-bottom: 20px; font-style: italic; }

  /* CONTROLS */
  .controls { display: flex; gap: 12px; align-items: flex-end; margin-top: 0; background: transparent; border-radius: 0; padding: 0; box-shadow: none; flex-wrap: wrap; border-top: 1px solid var(--border); padding-top: 20px; }
  .control-group { display: flex; flex-direction: column; gap: 6px; flex: 1; min-width: 130px; }
  .control-label { font-size: 12px; font-weight: 600; text-transform: uppercase; letter-spacing: 0.5px; color: var(--muted); }
  .control-select, .control-input { border: 1.5px solid var(--border); border-radius: 10px; padding: 10px 14px; font-size: 15px; font-family: 'DM Sans', sans-serif; color: var(--ink); background: var(--paper); outline: none; transition: border-color 0.2s; width: 100%; }
  .control-select:focus, .control-input:focus { border-color: var(--amber); }

  .btn-generate { background: var(--ink); color: var(--paper); border: none; border-radius: 12px; padding: 12px 28px; font-size: 15px; font-weight: 600; font-family: 'DM Sans', sans-serif; cursor: pointer; transition: all 0.2s ease; white-space: nowrap; display: flex; align-items: center; gap: 8px; align-self: flex-end; }
  .btn-generate:hover:not(:disabled) { opacity: 0.85; transform: translateY(-1px); box-shadow: 0 8px 20px rgba(26,26,46,0.25); }
  .btn-generate:disabled { opacity: 0.5; cursor: not-allowed; transform: none; }
  .btn-secondary { background: var(--surface); color: var(--ink); border: 1.5px solid var(--border); border-radius: 10px; padding: 9px 18px; font-size: 14px; font-weight: 500; font-family: 'DM Sans', sans-serif; cursor: pointer; transition: all 0.2s; }
  .btn-secondary:hover { border-color: var(--ink); }

  /* LOADING */
  .loading-state { text-align: center; padding: 60px 20px; }
  .loading-spinner { width: 48px; height: 48px; border: 3px solid var(--border); border-top-color: var(--amber); border-radius: 50%; animation: spin 0.8s linear infinite; margin: 0 auto 20px; }
  .loading-text { font-size: 18px; font-weight: 600; color: var(--ink); margin-bottom: 8px; }
  .loading-sub { font-size: 14px; color: var(--muted); }
  .loading-steps { display: flex; flex-direction: column; gap: 8px; margin-top: 24px; align-items: center; }
  .loading-step { font-size: 13px; color: var(--muted); display: flex; align-items: center; gap: 8px; }
  .loading-step.active { color: var(--sage); font-weight: 500; }
  .step-dot { width: 6px; height: 6px; border-radius: 50%; background: currentColor; }

  /* RESULTS */
  .results-header { display: flex; align-items: center; justify-content: space-between; margin-bottom: 32px; flex-wrap: wrap; gap: 16px; }
  .results-title { font-family: 'Lora', serif; font-size: 28px; font-weight: 700; color: var(--ink); }
  .results-meta { font-size: 14px; color: var(--muted); margin-top: 4px; }
  .view-tabs { display: flex; gap: 4px; background: var(--border); border-radius: 12px; padding: 4px; }
  .tab { padding: 7px 16px; border-radius: 9px; font-size: 13px; font-weight: 500; cursor: pointer; border: none; background: transparent; color: var(--muted); font-family: 'DM Sans', sans-serif; transition: all 0.2s; }
  .tab.active { background: var(--surface); color: var(--ink); box-shadow: 0 1px 4px rgba(0,0,0,0.12); }

  /* STUDY */
  .study-mode { margin-bottom: 40px; }
  .study-progress { display: flex; align-items: center; gap: 16px; margin-bottom: 24px; }
  .progress-bar-wrap { flex: 1; height: 6px; background: var(--border); border-radius: 100px; overflow: hidden; }
  .progress-bar { height: 100%; background: var(--amber); border-radius: 100px; transition: width 0.4s ease; }
  .progress-label { font-size: 13px; color: var(--muted); font-weight: 500; white-space: nowrap; }

  .flip-card-wrap { perspective: 1200px; height: 320px; margin-bottom: 20px; cursor: pointer; }
  .flip-card { width: 100%; height: 100%; position: relative; transform-style: preserve-3d; transition: transform 0.55s cubic-bezier(0.4, 0.2, 0.2, 1); }
  .flip-card.flipped { transform: rotateY(180deg); }
  .card-face { position: absolute; inset: 0; border-radius: 20px; backface-visibility: hidden; display: flex; flex-direction: column; align-items: center; justify-content: center; padding: 40px 48px; box-shadow: var(--card-shadow); }
  .card-front { background: var(--surface); border: 1.5px solid var(--border); }
  .card-back { background: var(--ink); transform: rotateY(180deg); }
  .card-tag { position: absolute; top: 20px; left: 24px; font-size: 11px; font-weight: 600; text-transform: uppercase; letter-spacing: 1px; opacity: 0.4; }
  .card-front .card-tag { color: var(--ink); }
  .card-back .card-tag { color: var(--paper); }
  .card-tema { position: absolute; top: 20px; right: 24px; font-size: 11px; color: var(--amber); font-weight: 600; background: var(--amber-light); border-radius: 6px; padding: 3px 8px; max-width: 140px; overflow: hidden; text-overflow: ellipsis; white-space: nowrap; }
  .card-emoji { font-size: 36px; margin-bottom: 16px; }
  .card-text { font-family: 'Lora', serif; font-size: 22px; font-weight: 600; text-align: center; line-height: 1.4; }
  .card-front .card-text { color: var(--ink); }
  .card-back .card-text { color: var(--paper); }
  .card-hint { position: absolute; bottom: 18px; font-size: 12px; opacity: 0.35; display: flex; align-items: center; gap: 4px; }
  .card-front .card-hint { color: var(--ink); }
  .card-back .card-hint { color: var(--paper); }

  .study-controls { display: flex; justify-content: center; gap: 12px; margin-bottom: 12px; }
  .btn-know { background: var(--sage-light); color: var(--sage); border: 1.5px solid rgba(74,124,89,0.25); border-radius: 12px; padding: 12px 28px; font-size: 15px; font-weight: 600; font-family: 'DM Sans', sans-serif; cursor: pointer; transition: all 0.2s; }
  .btn-know:hover { opacity: 0.85; transform: translateY(-1px); }
  .btn-dontknow { background: #fde8e8; color: #c0392b; border: 1.5px solid rgba(192,57,43,0.2); border-radius: 12px; padding: 12px 28px; font-size: 15px; font-weight: 600; font-family: 'DM Sans', sans-serif; cursor: pointer; transition: all 0.2s; }
  .dark .btn-dontknow { background: #2a1010; color: #e07070; }
  .btn-dontknow:hover { opacity: 0.85; transform: translateY(-1px); }
  .btn-flip-study { background: var(--surface); color: var(--ink); border: 1.5px solid var(--border); border-radius: 12px; padding: 12px 20px; font-size: 15px; font-family: 'DM Sans', sans-serif; cursor: pointer; transition: all 0.2s; font-weight: 500; }
  .btn-flip-study:hover { border-color: var(--amber); }

  /* SESSION DONE */
  .session-done { text-align: center; padding: 48px 20px; background: var(--surface); border-radius: 20px; box-shadow: var(--card-shadow); }
  .session-emoji { font-size: 56px; margin-bottom: 16px; }
  .session-title { font-family: 'Lora', serif; font-size: 28px; font-weight: 700; margin-bottom: 8px; color: var(--ink); }
  .session-stats { display: flex; gap: 32px; justify-content: center; margin: 24px 0; }
  .stat { text-align: center; }
  .stat-num { font-size: 32px; font-weight: 700; font-family: 'Lora', serif; }
  .stat-label { font-size: 13px; color: var(--muted); font-weight: 500; }
  .stat-num.green { color: var(--sage); }
  .stat-num.red { color: #e07070; }
  .more-cards-section { margin-top: 28px; padding-top: 28px; border-top: 1px solid var(--border); }
  .more-cards-title { font-size: 14px; color: var(--muted); margin-bottom: 14px; }
  .more-cards-controls { display: flex; gap: 10px; justify-content: center; align-items: center; flex-wrap: wrap; }
  .more-cards-input { width: 70px; border: 1.5px solid var(--border); border-radius: 10px; padding: 10px 12px; font-size: 15px; font-family: 'DM Sans', sans-serif; color: var(--ink); background: var(--paper); outline: none; text-align: center; }
  .btn-more { background: var(--amber-light); color: var(--amber); border: 1.5px solid rgba(232,160,32,0.3); border-radius: 12px; padding: 12px 24px; font-size: 15px; font-weight: 600; font-family: 'DM Sans', sans-serif; cursor: pointer; transition: all 0.2s; display: flex; align-items: center; gap: 8px; }
  .btn-more:hover:not(:disabled) { opacity: 0.85; transform: translateY(-1px); }
  .btn-more:disabled { opacity: 0.5; cursor: not-allowed; }

  /* GRID */
  .cards-grid { display: grid; grid-template-columns: repeat(auto-fill, minmax(260px, 1fr)); gap: 16px; }
  .grid-card { background: var(--surface); border-radius: 16px; padding: 24px; box-shadow: var(--card-shadow); border: 1.5px solid var(--border); transition: all 0.2s ease; }
  .grid-card:hover { transform: translateY(-3px); box-shadow: var(--card-shadow-hover); }
  .grid-card-tema { font-size: 11px; color: var(--amber); font-weight: 600; background: var(--amber-light); border-radius: 6px; padding: 2px 7px; display: inline-block; margin-bottom: 10px; }
  .grid-card-q { font-family: 'Lora', serif; font-size: 15px; font-weight: 600; color: var(--ink); margin-bottom: 12px; line-height: 1.4; }
  .grid-card-divider { height: 1px; background: var(--border); margin-bottom: 12px; }
  .grid-card-a { font-size: 13px; color: var(--muted); line-height: 1.5; }

  .error-box { background: #fff0f0; border: 1.5px solid rgba(192,57,43,0.2); border-radius: 14px; padding: 20px 24px; color: #c0392b; font-size: 14px; margin-top: 20px; display: flex; align-items: flex-start; gap: 10px; }
  .dark .error-box { background: #2a1010; color: #e07070; }

  @media (max-width: 600px) {
    .header { padding: 20px; } .main { padding: 32px 16px 60px; }
    .upload-headline { font-size: 28px; } .controls { flex-direction: column; }
    .card-text { font-size: 18px; } .flip-card-wrap { height: 280px; }
    .card-face { padding: 28px 24px; } .session-stats { gap: 16px; }
    .header-tagline { display: none; } .topics-grid { grid-template-columns: 1fr 1fr; }
  }
`;

// ─── STEPS: upload → topics → study ───────────────────────────────────────
const STEP_UPLOAD = "upload";
const STEP_TOPICS = "topics";
const STEP_STUDY  = "study";

export default function App() {
  const [darkMode, setDarkMode] = useState(true);
  const [step, setStep] = useState(STEP_UPLOAD);

  // upload
  const [file, setFile] = useState(null);
  const [dragOver, setDragOver] = useState(false);
  const [analyzing, setAnalyzing] = useState(false);

  // topics
  const [topics, setTopics] = useState([]);
  const [selectedTopics, setSelectedTopics] = useState([]);

  // config
  const [numCards, setNumCards] = useState(10);
  const [difficulty, setDifficulty] = useState("medium");
  const [language, setLanguage] = useState("auto");

  // study
  const [cards, setCards] = useState([]);
  const [allAskedQuestions, setAllAskedQuestions] = useState([]);
  const [loading, setLoading] = useState(false);
  const [loadingStep, setLoadingStep] = useState(0);
  const [view, setView] = useState("study");
  const [currentIdx, setCurrentIdx] = useState(0);
  const [flipped, setFlipped] = useState(false);
  const [known, setKnown] = useState([]);
  const [unknown, setUnknown] = useState([]);
  const [sessionDone, setSessionDone] = useState(false);
  const [moreCount, setMoreCount] = useState(5);
  const [error, setError] = useState(null);

  // ── FILE ──────────────────────────────────────────────────────────────────
  const handleFile = useCallback((f) => {
    if (!f || f.type !== "application/pdf") { setError("Por favor sube un archivo PDF válido."); return; }
    setFile(f); setError(null);
  }, []);
  const onDrop = useCallback((e) => { e.preventDefault(); setDragOver(false); handleFile(e.dataTransfer.files[0]); }, [handleFile]);

  // ── ANALYZE ───────────────────────────────────────────────────────────────
  const analyzeFile = async () => {
    if (!file) return;
    setAnalyzing(true); setError(null);
    try {
      const formData = new FormData();
      formData.append("pdf", file);
      const apiBase = import.meta.env.VITE_API_URL || ""; 
      const res = await fetch("${apiBase}/api/analyze", { method: "POST", body: formData });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Error al analizar el documento");
      setTopics(data.topics);
      setSelectedTopics(data.topics.map(t => t.titulo)); // todos seleccionados por defecto
      setStep(STEP_TOPICS);
    } catch (err) {
      setError(err.message);
    } finally {
      setAnalyzing(false);
    }
  };

  // ── TOGGLE TOPIC ──────────────────────────────────────────────────────────
  const toggleTopic = (titulo) => {
    setSelectedTopics(prev =>
      prev.includes(titulo) ? prev.filter(t => t !== titulo) : [...prev, titulo]
    );
  };

  // ── GENERATE ──────────────────────────────────────────────────────────────
  const callGenerate = async ({ fileToUse, num, diff, lang, selTopics, existingQuestions = [] }) => {
    setLoading(true); setError(null); setLoadingStep(0);
    setSessionDone(false); setCurrentIdx(0); setFlipped(false);
    setKnown([]); setUnknown([]);

    const timers = [0,1,2].map((_, i) => setTimeout(() => setLoadingStep(i+1), i * 1800));
    try {
      const formData = new FormData();
      formData.append("pdf", fileToUse);
      formData.append("numCards", num);
      formData.append("difficulty", diff);
      formData.append("language", lang);
      formData.append("selectedTopics", JSON.stringify(selTopics));
      if (existingQuestions.length > 0) formData.append("existingQuestions", JSON.stringify(existingQuestions));

      const apiBase = import.meta.env.VITE_API_URL || "";
      const res = await fetch("${apiBase}/api/generate", { method: "POST", body: formData });
      timers.forEach(clearTimeout); setLoadingStep(3);
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Error del servidor");
      if (!Array.isArray(data.cards) || data.cards.length === 0) throw new Error("No se generaron tarjetas.");

      await new Promise(r => setTimeout(r, 400));
      setAllAskedQuestions(prev => [...prev, ...data.cards.map(c => c.q)]);
      setCards(data.cards);
      setView("study");
      setStep(STEP_STUDY);
    } catch (err) {
      timers.forEach(clearTimeout);
      setError(err.message);
    } finally {
      setLoading(false); setLoadingStep(0);
    }
  };

  const generateCards = () => {
    setAllAskedQuestions([]);
    callGenerate({ fileToUse: file, num: numCards, diff: difficulty, lang: language, selTopics: selectedTopics });
  };
  const generateMoreCards = () => callGenerate({ fileToUse: file, num: moreCount, diff: difficulty, lang: language, selTopics: selectedTopics, existingQuestions: allAskedQuestions });

  const flipCard = () => setFlipped(f => !f);
  const handleKnow = () => { setKnown(k => [...k, currentIdx]); nextCard(); };
  const handleDontKnow = () => { setUnknown(u => [...u, currentIdx]); nextCard(); };
  const nextCard = () => {
    setFlipped(false);
    setTimeout(() => {
      if (currentIdx + 1 >= cards.length) setSessionDone(true);
      else setCurrentIdx(i => i + 1);
    }, 200);
  };
  const restartSession = () => { setCurrentIdx(0); setFlipped(false); setKnown([]); setUnknown([]); setSessionDone(false); };
  const resetAll = () => { setFile(null); setCards([]); setError(null); setSessionDone(false); setAllAskedQuestions([]); setTopics([]); setSelectedTopics([]); setStep(STEP_UPLOAD); };

  const loadingStepLabels = ["Enviando el documento...", "Identificando conceptos clave...", "Generando las tarjetas...", "Casi listo..."];

  return (
    <>
      <style>{styles}</style>
      <div className={`app${darkMode ? " dark" : ""}`}>
        <header className="header">
          <div className="logo">
            <div className="logo-icon">🃏</div>
            <div className="logo-text">flash<span>notas</span></div>
          </div>
          <div className="header-right">
            <div className="header-tagline">Convierte cualquier PDF en tarjetas de estudio</div>
            <button className={`dark-toggle${darkMode ? " on" : ""}`} onClick={() => setDarkMode(d => !d)} title={darkMode ? "Modo claro" : "Modo oscuro"}>
              <div className="dark-toggle-thumb">{darkMode ? "🌙" : "☀️"}</div>
            </button>
          </div>
        </header>

        <main className="main">

          {/* ── STEP 1: UPLOAD ── */}
          {step === STEP_UPLOAD && (
            <div className="upload-section">
              <h1 className="upload-headline">Estudia <em>más inteligente</em>,<br />no más duro</h1>
              <p className="upload-sub">Sube tus apuntes o cualquier PDF y en segundos tendrás tarjetas listas para memorizar.</p>

              <div
                className={`dropzone ${dragOver ? "drag-over" : ""}`}
                onDragOver={(e) => { e.preventDefault(); setDragOver(true); }}
                onDragLeave={() => setDragOver(false)}
                onDrop={onDrop}
                onClick={() => !file && document.getElementById("pdf-input").click()}
              >
                <input id="pdf-input" type="file" accept="application/pdf" onChange={e => handleFile(e.target.files[0])} />
                {!file ? (
                  <><div className="dropzone-icon">📄</div><div className="dropzone-title">Arrastra tu PDF aquí</div><div className="dropzone-sub">o haz clic para buscarlo en tu ordenador</div></>
                ) : (
                  <><div className="dropzone-icon">✅</div><div className="dropzone-title">Archivo cargado</div><div className="file-badge">📄 {file.name}</div></>
                )}
              </div>

              {file && !analyzing && (
                <div style={{ marginTop: 20 }}>
                  <button className="btn-generate" style={{ margin: "0 auto" }} onClick={analyzeFile}>
                    🔍 Analizar documento
                  </button>
                </div>
              )}

              {analyzing && (
                <div className="analyze-loading">
                  <div className="analyze-spinner" />
                  <div style={{ fontSize: 15, fontWeight: 600, color: "var(--ink)" }}>Analizando los temas del documento...</div>
                  <div style={{ fontSize: 13, color: "var(--muted)", marginTop: 6 }}>Esto tarda unos segundos</div>
                </div>
              )}

              {error && <div className="error-box">⚠️ <span>{error}</span></div>}
            </div>
          )}

          {/* ── STEP 2: TOPICS ── */}
          {step === STEP_TOPICS && (
            <div>
              <div style={{ display: "flex", alignItems: "center", gap: 12, marginBottom: 24 }}>
                <button className="btn-secondary" onClick={() => setStep(STEP_UPLOAD)}>← Volver</button>
                <div>
                  <div style={{ fontFamily: "'Lora', serif", fontSize: 22, fontWeight: 700, color: "var(--ink)" }}>Elige los temas</div>
                  <div style={{ fontSize: 13, color: "var(--muted)" }}>{file?.name}</div>
                </div>
              </div>

              <div className="topics-section">
                <div className="topics-header">
                  <div>
                    <div className="topics-title">📚 Temas detectados</div>
                  </div>
                  <div className="topics-actions">
                    <button className="btn-topic-action" onClick={() => setSelectedTopics(topics.map(t => t.titulo))}>Todos</button>
                    <button className="btn-topic-action" onClick={() => setSelectedTopics([])}>Ninguno</button>
                  </div>
                </div>
                <div className="topics-sub">Selecciona los temas sobre los que quieres estudiar. Las tarjetas se distribuirán equitativamente entre ellos.</div>

                <div className="topics-grid">
                  {topics.map(t => (
                    <div
                      key={t.id}
                      className={`topic-card ${selectedTopics.includes(t.titulo) ? "selected" : ""}`}
                      onClick={() => toggleTopic(t.titulo)}
                    >
                      <div className="topic-card-top">
                        <span className="topic-emoji">{t.emoji}</span>
                        <span className="topic-title">{t.titulo}</span>
                        <div className="topic-check">{selectedTopics.includes(t.titulo) ? "✓" : ""}</div>
                      </div>
                      <div className="topic-desc">{t.descripcion}</div>
                    </div>
                  ))}
                </div>

                {selectedTopics.length === 0 && (
                  <div className="topics-note">⚠️ Sin temas seleccionados, se usarán todos los del documento.</div>
                )}
                {selectedTopics.length > 0 && selectedTopics.length < topics.length && (
                  <div className="topics-note">✓ {selectedTopics.length} de {topics.length} temas seleccionados</div>
                )}
                {selectedTopics.length === topics.length && (
                  <div className="topics-note">✓ Todos los temas seleccionados — las preguntas se distribuirán entre ellos</div>
                )}

                <div className="controls">
                  <div className="control-group">
                    <label className="control-label">Nº de tarjetas</label>
                    <input type="number" className="control-input" min="5" max="30" value={numCards} onChange={e => setNumCards(Math.min(30, Math.max(5, +e.target.value)))} />
                  </div>
                  <div className="control-group">
                    <label className="control-label">Dificultad</label>
                    <select className="control-select" value={difficulty} onChange={e => setDifficulty(e.target.value)}>
                      <option value="basic">Básica</option>
                      <option value="medium">Media</option>
                      <option value="advanced">Avanzada</option>
                    </select>
                  </div>
                  <div className="control-group">
                    <label className="control-label">Idioma</label>
                    <select className="control-select" value={language} onChange={e => setLanguage(e.target.value)}>
                      <option value="auto">🌐 Del documento</option>
                      <option value="es">🇪🇸 Español</option>
                      <option value="en">🇬🇧 English</option>
                    </select>
                  </div>
                  <button className="btn-generate" onClick={generateCards} disabled={loading}>
                    ✨ Generar tarjetas
                  </button>
                </div>

                {error && <div className="error-box" style={{ marginTop: 16 }}>⚠️ <span>{error}</span></div>}
              </div>
            </div>
          )}

          {/* ── LOADING ── */}
          {loading && (
            <div className="loading-state">
              <div className="loading-spinner" />
              <div className="loading-text">Generando tus tarjetas de estudio...</div>
              <div className="loading-sub">Analizando tu documento...</div>
              <div className="loading-steps">
                {loadingStepLabels.map((label, i) => (
                  <div key={i} className={`loading-step ${loadingStep > i ? "active" : ""}`}><div className="step-dot" />{label}</div>
                ))}
              </div>
            </div>
          )}

          {/* ── STEP 3: STUDY ── */}
          {step === STEP_STUDY && !loading && cards.length > 0 && (
            <>
              <div className="results-header">
                <div>
                  <h2 className="results-title">Tus tarjetas</h2>
                  <div className="results-meta">{cards.length} tarjetas · {selectedTopics.length} temas · {file?.name}</div>
                </div>
                <div style={{ display: "flex", gap: "12px", alignItems: "center" }}>
                  <div className="view-tabs">
                    <button className={`tab ${view === "study" ? "active" : ""}`} onClick={() => setView("study")}>📖 Estudiar</button>
                    <button className={`tab ${view === "grid" ? "active" : ""}`} onClick={() => setView("grid")}>🗂 Ver todas</button>
                  </div>
                  <button className="btn-secondary" onClick={() => setStep(STEP_TOPICS)}>← Temas</button>
                  <button className="btn-secondary" onClick={resetAll}>+ Nuevo PDF</button>
                </div>
              </div>

              {view === "study" && (
                <div className="study-mode">
                  {!sessionDone ? (
                    <>
                      <div className="study-progress">
                        <div className="progress-bar-wrap"><div className="progress-bar" style={{ width: `${(currentIdx / cards.length) * 100}%` }} /></div>
                        <div className="progress-label">{currentIdx + 1} / {cards.length}</div>
                      </div>
                      <div className="flip-card-wrap" onClick={flipCard}>
                        <div className={`flip-card ${flipped ? "flipped" : ""}`}>
                          <div className="card-face card-front">
                            <div className="card-tag">Pregunta</div>
                            {cards[currentIdx]?.tema && <div className="card-tema">{cards[currentIdx].tema}</div>}
                            <div className="card-emoji">{cards[currentIdx]?.emoji || "❓"}</div>
                            <div className="card-text">{cards[currentIdx]?.q}</div>
                            <div className="card-hint">👆 Haz clic para ver la respuesta</div>
                          </div>
                          <div className="card-face card-back">
                            <div className="card-tag">Respuesta</div>
                            <div className="card-text">{cards[currentIdx]?.a}</div>
                            <div className="card-hint">👆 Haz clic para girar</div>
                          </div>
                        </div>
                      </div>
                      <div className="study-controls">
                        <button className="btn-flip-study" onClick={flipCard}>🔄 Girar</button>
                        {flipped && (<><button className="btn-dontknow" onClick={handleDontKnow}>✗ No lo sabía</button><button className="btn-know" onClick={handleKnow}>✓ Lo sabía</button></>)}
                      </div>
                    </>
                  ) : (
                    <div className="session-done">
                      <div className="session-emoji">{known.length === cards.length ? "🎉" : known.length > cards.length / 2 ? "💪" : "📚"}</div>
                      <div className="session-title">{known.length === cards.length ? "¡Perfecto! Las sabes todas" : known.length > cards.length / 2 ? "¡Buen trabajo!" : "Sigue practicando"}</div>
                      <div style={{ color: "var(--muted)", fontSize: 15 }}>Sesión completada · {allAskedQuestions.length} preguntas vistas en total</div>
                      <div className="session-stats">
                        <div className="stat"><div className="stat-num green">{known.length}</div><div className="stat-label">Sabidas ✓</div></div>
                        <div className="stat"><div className="stat-num red">{unknown.length}</div><div className="stat-label">A repasar ✗</div></div>
                        <div className="stat"><div className="stat-num" style={{color: "var(--amber)"}}>{Math.round((known.length / cards.length) * 100)}%</div><div className="stat-label">Dominadas</div></div>                      </div>
                      <div style={{ display: "flex", gap: 12, justifyContent: "center", flexWrap: "wrap" }}>
                        <button className="btn-generate" onClick={restartSession}>🔁 Repetir sesión</button>
                        {unknown.length > 0 && (
                          <button className="btn-secondary" onClick={() => {
                            setCards(cards.filter((_, i) => unknown.includes(i)));
                            setCurrentIdx(0); setFlipped(false); setKnown([]); setUnknown([]); setSessionDone(false);
                          }}>📌 Solo las falladas ({unknown.length})</button>
                        )}
                      </div>
                      <div className="more-cards-section">
                        <div className="more-cards-title">¿Quieres practicar más? Genera nuevas preguntas sobre los mismos temas</div>
                        <div className="more-cards-controls">
                          <input type="number" className="more-cards-input" min="3" max="20" value={moreCount} onChange={e => setMoreCount(Math.min(20, Math.max(3, +e.target.value)))} />
                          <button className="btn-more" onClick={generateMoreCards}>✨ Generar {moreCount} preguntas nuevas</button>
                        </div>
                      </div>
                    </div>
                  )}
                </div>
              )}

              {view === "grid" && (
                <div className="cards-grid">
                  {cards.map((card, i) => (
                    <div key={i} className="grid-card">
                      {card.tema && <div className="grid-card-tema">{card.tema}</div>}
                      <div className="grid-card-q">{card.emoji} {card.q}</div>
                      <div className="grid-card-divider" />
                      <div className="grid-card-a">{card.a}</div>
                    </div>
                  ))}
                </div>
              )}
            </>
          )}
        </main>
      </div>
    </>
  );
}