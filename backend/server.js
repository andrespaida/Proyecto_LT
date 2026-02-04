import express from "express";
import cors from "cors";
import dotenv from "dotenv";
import OpenAI from "openai";
import fs from "fs";

dotenv.config();

const app = express();

// Leer archivo de conocimiento
const conocimiento = fs.readFileSync("info.txt", "utf-8");

// CORS BIEN CONFIGURADO
app.use(cors({
  origin: "https://proyecto-lt.vercel.app",
  methods: ["GET", "POST"],
  allowedHeaders: ["Content-Type"]
}));

app.use(express.json());

// Cliente OpenRouter
const client = new OpenAI({
  apiKey: process.env.OPENROUTER_KEY,
  baseURL: "https://openrouter.ai/api/v1"
});

// Ruta chat
app.post("/chat", async (req, res) => {
  try {
    const { mensaje } = req.body;

    const completion = await client.chat.completions.create({
      model: "stepfun/step-3.5-flash:free",
      messages: [
        {
          role: "system",
          content: `
Eres un asistente especializado en legislación digital.

INSTRUCCIONES OBLIGATORIAS:
- SOLO puedes responder usando la información proporcionada.
- NO inventes datos.
- Si la pregunta no está en la información, responde: "No tengo información sobre eso."
- No respondas temas fuera del documento.

INFORMACIÓN DISPONIBLE:
${conocimiento}
`
        },
        {
          role: "user",
          content: mensaje
        }
      ]
    });

    res.json({
      respuesta: completion.choices[0].message.content
    });

  } catch (error) {
    console.error("ERROR IA:", error);
    res.status(500).json({ error: "Error en IA" });
  }
});

// Puerto dinámico para Render
const PORT = process.env.PORT || 3000;

app.listen(PORT, () => {
  console.log(`Servidor corriendo en puerto ${PORT}`);
});