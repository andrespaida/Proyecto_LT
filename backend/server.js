import express from "express";
import cors from "cors";
import dotenv from "dotenv";
import OpenAI from "openai";
import fs from "fs";

console.log("SERVIDOR VERSION NUEVA 1.1");

dotenv.config();

const app = express();

let conocimiento = "";
try {
  conocimiento = fs.readFileSync("info.txt", "utf-8");
} catch {
  console.log("info.txt no encontrado");
}

app.use(cors({
  origin: "https://proyecto-lt.vercel.app",
  methods: ["GET", "POST"],
  allowedHeaders: ["Content-Type"]
}));

app.options("*", cors());

app.use(express.json());

app.get("/", (req, res) => {
  res.send("Backend activo 🚀");
});

app.get("/test", (req, res) => {
  res.send("Backend funcionando OK");
});

const client = new OpenAI({
  apiKey: process.env.OPENROUTER_KEY,
  baseURL: "https://openrouter.ai/api/v1"
});

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

    res.json({ respuesta: completion.choices[0].message.content });

  } catch (error) {
    console.error("ERROR IA:", error);
    res.status(500).json({ error: "Error en IA" });
  }
});

const PORT = process.env.PORT || 3000;

app.listen(PORT, () => {
  console.log(`Servidor corriendo en puerto ${PORT}`);
});
