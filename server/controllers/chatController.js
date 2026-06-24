const axios = require('axios');
const jwt = require('jsonwebtoken');
const Book = require('../models/Book');
const Conversation = require('../models/Conversation');
const Message = require('../models/Message');
const { sanitize } = require('../utils/sanitize');

exports.askChatbot = async (req, res) => {
  try {
    const { message, context } = req.body;
    if (!message) {
      return res.status(400).json({ success: false, message: "Le message est vide." });
    }

    let user = null;
    try {
      const authHeader = req.headers.authorization;
      if (authHeader && authHeader.startsWith('Bearer ')) {
        const token = authHeader.split(' ')[1];
        const secret = process.env.JWT_SECRET;
        if (secret) {
          const decoded = jwt.verify(token, secret);
          const User = require('../models/User');
          user = await User.findById(decoded.id).select('-password');
        }
      }
    } catch (e) {}

    const history = context?.history?.slice(-6) || [];
    const currentParams = context?.params || {};

    let parsed = null;

    try {
      const NVIDIA_API_KEY = process.env.NVIDIA_API_KEY;
      if (NVIDIA_API_KEY) {
        const systemInstruction = `Tu es l'assistant de LinkBook, une plateforme de livres d'occasion en Tunisie.

REGLES:
1. Reponds toujours en francais.
2. Analyse ce que tu sais et ce qu'il manque. Ne pose qu'UNE SEULE question a la fois.
3. Declenche la recherche des que sujet + niveau sont connus.
4. NE JAMAIS INVENTER de livres. Tu definis seulement les criteres de recherche.
5. Si l'utilisateur veut VENDRE, PUBLIER, CREER, DONNER un livre → intent "action" avec actionType "create-offer".

Format de reponse STRICT (JSON uniquement):
{
  "intent": "search" | "ask_info" | "chat" | "action",
  "actionType": "create-offer" | null,
  "reply": "Ta reponse en francais, naturelle et concise",
  "searchParams": {
    "subject": null,
    "level": null,
    "location": null,
    "type": null,
    "priceMin": null,
    "priceMax": null,
    "condition": null,
    "keyword": null
  },
  "missingFields": []
}

Exemples:
"Je cherche un livre de maths" → intent: ask_info, reply: "Pour quel niveau ?"
"Je cherche maths 3eme" → intent: search, reply: "Je cherche des livres de maths pour la 3eme..."
"Bonjour" → intent: chat, reply: "Bonjour ! Je suis l'assistant LinkBook..."
"Je veux vendre un livre" → intent: action, actionType: "create-offer", reply: "Pour creer une offre..."
"Sfax" (contexte: sujet=maths, niveau=3eme) → intent: search`;


        const model = process.env.NVIDIA_MODEL || "meta/llama-3.2-3b-instruct";

        const prompt = buildPrompt(message, currentParams, history);

        const messages = [
          { role: "user", content: systemInstruction + "\n\n" + prompt }
        ];

        const response = await axios.post(
          "https://integrate.api.nvidia.com/v1/chat/completions",
          {
            model,
            messages,
            max_tokens: 2048,
            temperature: 0.60,
            top_p: 0.95,
            stream: false
          },
          {
            headers: {
              "Authorization": `Bearer ${NVIDIA_API_KEY}`,
              "Accept": "application/json"
            },
            timeout: 60000
          }
        );

        let content = response.data.choices[0].message.content;

        const codeBlock = content.match(/```(?:json)?\s*([\s\S]*?)\s*```/);
        if (codeBlock) content = codeBlock[1];

        const start = content.indexOf('{');
        if (start === -1) throw new Error("No JSON object in response");

        let depth = 0, inString = false, escaped = false, end = -1;
        for (let i = start; i < content.length; i++) {
          const ch = content[i];
          if (escaped) { escaped = false; continue; }
          if (ch === '\\' && inString) { escaped = true; continue; }
          if (ch === '"') { inString = !inString; continue; }
          if (!inString) {
            if (ch === '{') depth++;
            if (ch === '}') { depth--; if (depth === 0) { end = i + 1; break; } }
          }
        }
        if (end === -1) throw new Error("Unterminated JSON object");

        parsed = JSON.parse(content.slice(start, end));
      } else {
        throw new Error("NVIDIA_API_KEY not set");
      }
    } catch (e) {
      console.error("[CHATBOT] AI failed:", e.message);
      parsed = {
        intent: 'chat',
        reply: "Désolé, mon assistant IA est momentanément indisponible. Réessayez plus tard.",
        searchParams: {},
        missingFields: []
      };
    }

    const mergedParams = { ...currentParams };
    if (parsed.searchParams) {
      for (const key of Object.keys(parsed.searchParams)) {
        const val = parsed.searchParams[key];
        if (val !== null && val !== undefined && val !== '') {
          mergedParams[key] = val;
        }
      }
    }

    if (parsed.intent === 'search') {
      const filter = buildBookFilter(mergedParams);
      let books = await Book.find(filter)
        .populate('user', 'name phone email wilaya location')
        .limit(10)
        .lean();

      let reply = parsed.reply || '';
      if (user && reply && reply.includes('Bonjour')) {
        reply = reply.replace(/Bonjour/gi, `Bonjour ${user.name || ''}`);
      }
      if (!reply) {
        reply = books.length > 0
          ? `J'ai trouvé ${books.length} offre(s) :`
          : "Désolé, je n'ai rien trouvé avec ces critères. Essayez d'élargir votre recherche.";
      }

      return res.json({ success: true, reply, books, params: mergedParams });
    } else if (parsed.intent === 'action') {
      return res.json({
        success: true,
        reply: parsed.reply || "Bien sûr ! Rendez-vous sur la page de création d'offre.",
        books: [],
        params: mergedParams,
        action: parsed.actionType || 'create-offer'
      });
    } else if (parsed.intent === 'ask_info') {
      return res.json({
        success: true,
        reply: parsed.reply || "Pouvez-vous préciser ?",
        books: [],
        params: mergedParams,
        missingFields: parsed.missingFields || []
      });
    } else {
      return res.json({
        success: true,
        reply: parsed.reply || "Comment puis-je vous aider ?",
        books: [],
        params: mergedParams
      });
    }

  } catch (error) {
    console.error("Chatbot Error:", error);
    res.status(500).json({ success: false, message: "Erreur lors de la communication avec l'assistant." });
  }
};

function buildPrompt(message, currentParams, history) {
  let prompt = '';
  if (history.length > 0) {
    prompt += 'Historique de la conversation:\n';
    for (const h of history) {
      prompt += `${h.role === 'user' ? 'Utilisateur' : 'Assistant'}: ${h.content}\n`;
    }
    prompt += '\n';
  }
  if (Object.keys(currentParams).length > 0) {
    prompt += `Contexte déjà collecté: ${JSON.stringify(currentParams)}\n\n`;
  }
  prompt += `Message: ${message}`;
  return prompt;
}

function buildBookFilter(params) {
  const filter = { status: 'Disponible' };
  if (params.subject) filter.subject = { $regex: params.subject, $options: 'i' };
  if (params.level) filter.level = { $regex: params.level, $options: 'i' };
  if (params.location) filter.location = { $regex: params.location, $options: 'i' };
  if (params.type) filter.type = params.type;
  if (params.condition) filter.condition = { $regex: params.condition, $options: 'i' };
  if (params.priceMin || params.priceMax) {
    filter.price = {};
    if (params.priceMin) filter.price.$gte = Number(params.priceMin);
    if (params.priceMax) filter.price.$lte = Number(params.priceMax);
  }
  if (params.keyword) {
    filter.$or = [
      { title: { $regex: params.keyword, $options: 'i' } },
      { subject: { $regex: params.keyword, $options: 'i' } },
      { description: { $regex: params.keyword, $options: 'i' } },
    ];
  }
  return filter;
}

exports.getConversations = async (req, res, next) => {
  try {
    const conversations = await Conversation.find({
      participants: req.user._id
    })
    .populate('participants', 'name avatar email phone')
    .sort({ updatedAt: -1 });

    res.status(200).json({ success: true, data: conversations });
  } catch (error) {
    next(error);
  }
};

exports.getMessages = async (req, res, next) => {
  try {
    const conversation = await Conversation.findById(req.params.id);
    if (!conversation) return res.status(404).json({ success: false, message: "Discussion non trouvée" });

    if (!conversation.participants.includes(req.user._id)) {
      return res.status(401).json({ success: false, message: "Non autorisé" });
    }

    const messages = await Message.find({ conversation: req.params.id })
      .populate('sender', 'name avatar')
      .sort({ createdAt: 1 });

    const unreadKey = `unreadCounts.${req.user._id}`;
    await Conversation.findByIdAndUpdate(req.params.id, { $set: { [unreadKey]: 0 } });

    res.status(200).json({ success: true, data: messages });
  } catch (error) {
    next(error);
  }
};

exports.sendMessage = async (req, res, next) => {
  try {
    let { conversationId, text, attachments } = req.body;
    if (text) text = sanitize(text);

    const conversation = await Conversation.findById(conversationId);
    if (!conversation) return res.status(404).json({ success: false, message: "Discussion non trouvée" });

    if (!conversation.participants.includes(req.user._id)) {
      return res.status(401).json({ success: false, message: "Non autorisé" });
    }

    const message = await Message.create({
      conversation: conversationId,
      sender: req.user._id,
      text,
      attachments
    });

    const update = {
      lastMessage: {
        text: text || "Image",
        sender: req.user._id,
        createdAt: new Date()
      }
    };

    const participants = conversation.participants.filter(p => p.toString() !== req.user._id.toString());
    participants.forEach(p => {
      const key = `unreadCounts.${p}`;
      update['$inc'] = { [key]: 1 };
    });

    await Conversation.findByIdAndUpdate(conversationId, update);

    const populatedMessage = await message.populate('sender', 'name avatar');
    res.status(201).json({ success: true, data: populatedMessage });
  } catch (error) {
    next(error);
  }
};

exports.startConversation = async (req, res, next) => {
  try {
    const { participantId } = req.body;
    if (!participantId) return res.status(400).json({ success: false, message: "ID du destinataire requis" });

    if (participantId === req.user._id.toString()) {
      return res.status(400).json({ success: false, message: "Vous ne pouvez pas discuter avec vous-même" });
    }

    let conversation = await Conversation.findOne({
      participants: { $all: [req.user._id, participantId] }
    }).populate('participants', 'name avatar email phone');

    if (!conversation) {
      conversation = await Conversation.create({
        participants: [req.user._id, participantId]
      });
      conversation = await conversation.populate('participants', 'name avatar email phone');
    }

    res.status(200).json({ success: true, data: conversation });
  } catch (error) {
    next(error);
  }
};
