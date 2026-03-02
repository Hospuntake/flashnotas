const express = require("express");
const cors = require("cors");
const multer = require("multer");
const dotenv = require("dotenv");
const pdfParse = require("pdf-parse");
const fs = require("fs");
const path = require("path");

dotenv.config();

const app = express();
const PORT = process.env.PORT || 3001;
const GROQ_API_KEY = process.env.GROQ_API_KEY;
const GROQ_MODEL = "llama-3.3-70b-versatile";

const upload = multer({
  storage: multer.memoryStorage(),
  limits: { fileSize: 50 * 1024 * 1024 },
  fileFilter: (req, file, cb) => {
    if (file.mimetype === "application/pdf") cb(null, true);
    else cb(new Error("Solo se permiten archivos PDF"));
  },
});

app.use(cors({ origin: "http://localhost:5173" }));
app.use(express.json());

app.get("/api/health", (req, res) => {
  res.json({ ok: true, groq: !!GROQ_API_KEY });
});

// ── ANALIZAR temas del PDF ─────────────────────────────────────────────────
app.post("/api/analyze", (req, res, next) => {
  upload.single("pdf")(req, res, (err) => {
    if (err) return res.status(400).json({ error: "Archivo demasiado grande. Máximo 50MB." });
    next();
  });
}, async (req, res) => {
  try {
    if (!GROQ_API_KEY) return res.status(500).json({ error: "GROQ_API_KEY no configurada." });
    if (!req.file) return res.status(400).json({ error: "No se recibió ningún PDF." });

    console.log("🔍 Analizando temas del PDF...");
    const pdfData = await pdfParse(req.file.buffer);
    const pdfText = pdfData.text?.trim();

    if (!pdfText || pdfText.length < 50) {
      return res.status(400).json({ error: "No se pudo extraer texto del PDF." });
    }

    const truncatedText = pdfText.length > 12000 ? pdfText.slice(0, 12000) : pdfText;

    const prompt = `Analiza el siguiente documento y extrae los temas o bloques temáticos principales que contiene.

Devuelve ÚNICAMENTE un array JSON con los temas. Cada tema debe tener:
- "id": número único empezando por 1
- "titulo": nombre corto del tema (máximo 6 palabras)
- "descripcion": una frase breve de qué contiene (máximo 15 palabras)
- "emoji": un emoji representativo

Entre 4 y 10 temas máximo. Sin explicaciones, sin markdown, solo el JSON.

Ejemplo:
[{"id":1,"titulo":"Fotosíntesis","descripcion":"Proceso de conversión de luz solar en energía química","emoji":"🌿"}]

TEXTO DEL DOCUMENTO:
${truncatedText}`;

    const groqRes = await fetch("https://api.groq.com/openai/v1/chat/completions", {
      method: "POST",
      headers: { "Content-Type": "application/json", "Authorization": `Bearer ${GROQ_API_KEY}` },
      body: JSON.stringify({
        model: GROQ_MODEL, max_tokens: 1000, temperature: 0.3,
        messages: [{ role: "user", content: prompt }],
      }),
    });

    const data = await groqRes.json();
    if (data.error) return res.status(500).json({ error: data.error.message });

    const text = data.choices?.[0]?.message?.content || "";
    const clean = text.replace(/```json|```/g, "").trim();
    const topics = JSON.parse(clean);

    console.log(`✅ ${topics.length} temas detectados`);
    res.json({ topics, pdfLength: pdfText.length });

  } catch (err) {
    console.error("Error en /api/analyze:", err);
    res.status(500).json({ error: err.message });
  }
});

// ── GENERAR tarjetas ───────────────────────────────────────────────────────
app.post("/api/generate", (req, res, next) => {
  upload.single("pdf")(req, res, (err) => {
    if (err) return res.status(400).json({ error: "Archivo demasiado grande. Máximo 50MB." });
    next();
  });
}, async (req, res) => {
  try {
    if (!GROQ_API_KEY) return res.status(500).json({ error: "GROQ_API_KEY no configurada." });
    if (!req.file) return res.status(400).json({ error: "No se recibió ningún PDF." });

    const numCards = parseInt(req.body.numCards) || 10;
    const difficulty = req.body.difficulty || "medium";
    const language = req.body.language || "auto";
    const selectedTopics = req.body.selectedTopics ? JSON.parse(req.body.selectedTopics) : [];
    const existingQuestions = req.body.existingQuestions ? JSON.parse(req.body.existingQuestions) : [];

    const difficultyMap = {
      basic: "Genera tarjetas simples con respuestas cortas y claras.",
      medium: "Genera tarjetas con respuestas moderadamente detalladas.",
      advanced: "Genera tarjetas detalladas con respuestas completas y matizadas.",
    };

    const languageMap = {
      auto: "Detecta el idioma del documento y genera las tarjetas en ese mismo idioma.",
      es: "Genera todas las preguntas y respuestas en español.",
      en: "Generate all questions and answers in English.",
    };

    console.log("📄 Extrayendo texto del PDF...");
    const pdfData = await pdfParse(req.file.buffer);
    const pdfText = pdfData.text?.trim();

    if (!pdfText || pdfText.length < 50) {
      return res.status(400).json({ error: "No se pudo extraer texto del PDF." });
    }

    const truncatedText = pdfText.length > 12000 ? pdfText.slice(0, 12000) + "\n\n[Texto truncado]" : pdfText;

    console.log(`✅ Texto extraído: ${pdfText.length} caracteres`);
    console.log(`🤖 Generando exactamente ${numCards} tarjetas...`);

    const topicsSection = selectedTopics.length > 0
      ? `\nTEMAS SELECCIONADOS (distribuye las tarjetas equitativamente entre ellos):\n${selectedTopics.map((t, i) => `${i + 1}. ${t}`).join("\n")}\n`
      : "\nDISTRIBUCIÓN: Distribuye las preguntas equitativamente entre todos los temas del documento.\n";

    const avoidSection = existingQuestions.length > 0
      ? `\nPREGUNTAS YA GENERADAS (NO las repitas):\n${existingQuestions.map((q, i) => `${i + 1}. ${q}`).join("\n")}\n`
      : "";

    const prompt = `Eres un experto en crear tarjetas de memorización para estudiantes.
GENERA EXACTAMENTE ${numCards} FLASHCARDS. Ni una más, ni una menos. El array JSON debe tener EXACTAMENTE ${numCards} elementos.

IDIOMA: ${languageMap[language]}
${topicsSection}${avoidSection}
Instrucciones:
- ${difficultyMap[difficulty]}
- Cada pregunta debe cubrir un concepto DIFERENTE y ÚNICO
- Las preguntas deben evaluar comprensión real, no solo memorización
- Añade un emoji representativo para cada concepto
- Responde ÚNICAMENTE con un array JSON válido, sin explicaciones ni markdown

Formato exacto (EXACTAMENTE ${numCards} elementos):
[{"q": "pregunta", "a": "respuesta", "emoji": "emoji", "tema": "nombre del tema"}, ...]

TEXTO DEL DOCUMENTO:
${truncatedText}`;

    const groqRes = await fetch("https://api.groq.com/openai/v1/chat/completions", {
      method: "POST",
      headers: { "Content-Type": "application/json", "Authorization": `Bearer ${GROQ_API_KEY}` },
      body: JSON.stringify({
        model: GROQ_MODEL, max_tokens: 4000, temperature: 0.5,
        messages: [{ role: "user", content: prompt }],
      }),
    });

    const data = await groqRes.json();
    if (data.error) return res.status(500).json({ error: data.error.message });

    const text = data.choices?.[0]?.message?.content || "";
    const clean = text.replace(/```json|```/g, "").trim();
    const cards = JSON.parse(clean);

    if (!Array.isArray(cards) || cards.length === 0) {
      return res.status(500).json({ error: "No se generaron tarjetas válidas." });
    }

    // Recortar siempre al número exacto pedido
    if (cards.length > numCards) {
      cards.length = numCards;
      console.log(`✂️ Recortado a ${numCards} tarjetas`);
    }

    console.log(`✅ ${cards.length} tarjetas generadas`);

    // Historial
    const historialPath = path.join(__dirname, "historial_preguntas.json");
    let historial = [];
    if (fs.existsSync(historialPath)) historial = JSON.parse(fs.readFileSync(historialPath, "utf-8"));
    historial.push({
      fecha: new Date().toISOString(),
      archivo: req.file.originalname,
      dificultad: difficulty,
      idioma: language,
      temasSeleccionados: selectedTopics,
      preguntas: cards.map(c => ({ pregunta: c.q, respuesta: c.a, tema: c.tema }))
    });
    fs.writeFileSync(historialPath, JSON.stringify(historial, null, 2), "utf-8");

    res.json({ cards });

  } catch (err) {
    console.error("Error en /api/generate:", err);
    res.status(500).json({ error: err.message || "Error interno del servidor" });
  }
});

app.listen(PORT, () => {
  console.log(`\n🚀 Servidor FlashNotas corriendo en http://localhost:${PORT}`);
  if (!GROQ_API_KEY) console.warn("⚠️  ATENCIÓN: No has configurado GROQ_API_KEY en el archivo .env");
  else console.log("✅ API Key de Groq cargada correctamente");
});