import express from "express";
import cors from "cors";
import dotenv from "dotenv";
import OpenAI from "openai";
import fs from "fs";

const conocimiento = fs.readFileSync("info.txt", "utf-8");

dotenv.config();

const app = express();
app.use(cors());
app.use(express.json());

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
- Si no está en el documento, responde que no tienes información.

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
    console.error(error);
    res.status(500).json({ error: "Error en IA" });
  }
});

app.listen(3000, () => {
  console.log("Servidor corriendo en http://localhost:3000");
});