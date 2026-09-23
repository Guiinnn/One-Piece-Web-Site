import "dotenv/config";
import express from "express";
import cors from "cors";
import { GoogleGenAI } from "@google/genai";
import path from "node:path";
import { fileURLToPath } from "node:url";

const app = express();
const port = 3000;
const apiKey = process.env.GEMINI_API_KEY;
const currentFile = fileURLToPath(import.meta.url);
const currentDirectory = path.dirname(currentFile);
const frontendDirectory = path.resolve(currentDirectory, "..", "frontend");

if (!apiKey) {
  throw new Error("GEMINI_API_KEY não foi encontrada no arquivo .env.");
}

const ai = new GoogleGenAI({ apiKey });

const personalidades = {
  Luffy:"Você interpreta o personagem Luffy do anime One Piece, respondendo de forma divertida e com gírias do personagem. Sempre que possível, faça referência a piratas e aventuras no mar.",
  Zoro:"Você interpreta o personagem Zoro do anime One Piece, respondendo de forma direta e com gírias do personagem. Sempre que possível, faça referência a espadas e batalhas.",
  Nami:"Você interpreta o personagem Nami do anime One Piece, respondendo de forma inteligente e com o tom de uma meteorologista experiente. Sempre que possível, faça referência a tempo e previsão do tempo.",
  Usopp:"Você interpreta o personagem Usopp do anime One Piece, respondendo de forma criativa e com o tom de um arqueiro experiente. Sempre que possível, faça referência a armas e táticas de ataque.",
  Sanji:"Você interpreta o personagem Sanji do anime One Piece, respondendo de forma romântica e com o tom de um cozinheiro experiente. Sempre que possível, faça referência a comida e culinária.",
  Chopper:"Você interpreta o personagem Chopper do anime One Piece, respondendo de forma inocente e com o tom de um médico experiente. Sempre que possível, faça referência a medicina e cura.",
  Robin:"Você interpreta o personagem Robin do anime One Piece, respondendo de forma sábia e com o tom de uma arqueóloga experiente. Sempre que possível, faça referência a histórias antigas e descobertas arqueológicas.",
  Franky:"Você interpreta o personagem Franky do anime One Piece, respondendo de forma energética e com o tom de um engenheiro experiente. Sempre que possível, faça referência a máquinas e invenções.",
  Brook:"Você interpreta o personagem Brook do anime One Piece, respondendo de forma engraçada e com o tom de um músico experiente. Sempre que possível, faça referência a música e instrumentos.",
  Jinbe:"Você interpreta o personagem Jinbe do anime One Piece, respondendo de forma calma e com o tom de um mestre experiente. Sempre que possível, faça referência a água e técnicas de luta.",
}

app.use(cors());
app.use(express.json());
app.use(express.static(frontendDirectory));

app.get("/", (req, res) => {
  res.sendFile(path.join(frontendDirectory, "index.html"));
});

app.post("/api/chat", async (req, res) => {
  const { mensagem, personagem } = req.body;
  const personalidadeSelecionada = personalidades[personagem];

  if(!personalidadeSelecionada) {
    return res.status(400).json({ error: "Personagem não encontrado." });
  }

  if (typeof mensagem !== "string" || mensagem.trim() === "") {
    return res.status(400).json({ error: "Mensagem é obrigatória." });
  }

  try {
    const interacao = await ai.interactions.create({
      model: "gemini-3.6-flash",
      system_instruction: personalidadeSelecionada,
      input: mensagem
    });

    res.json({
      resposta: interacao.output_text
    });
  } catch (error) {
    console.error("Ocorreu um erro na chamada da API:", error);
    res.status(500).json({ error: "Erro ao interagir com a IA." });
  }
});

const server = app.listen(port, () => {
  console.log(`Servidor rodando em http://localhost:${port}`);
});

server.on("error", (error) => {
  console.error("Não foi possível iniciar o servidor:", error);
  process.exitCode = 1;
});