const jwt = require('jsonwebtoken');
const Book = require('../models/Book');
const Conversation = require('../models/Conversation');
const Message = require('../models/Message');
const { sanitize } = require('../utils/sanitize');

let puter = null;
try {
  const { init } = require("@heyputer/puter.js/src/init.cjs");
  const token = process.env.PUTER_AUTH_TOKEN;
  if (token) {
    puter = init(token);
  } else {
    console.warn('⚠ PUTER_AUTH_TOKEN not set — AI chatbot will use fallback mode');
  }
} catch (e) {
  console.warn('⚠ Failed to init Puter.js — AI chatbot will use fallback mode', e.message);
}

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
      if (puter) {
        const systemInstruction = `Tu es l'assistant de LinkBook, une plateforme de livres d'occasion en Tunisie.

REGLES:
1. Reponds toujours en francais, meme si l'utilisateur te salue dans une autre langue (salem, hi, hello, nihao, etc).
2. POUR CHAQUE MESSAGE, analyse ce que tu sais et ce qu'il manque. Reflechis etape par etape.
3. Ne pose qu'UNE SEULE question a la fois. La priorite: sujet > niveau > type (vente/echange/don) > ville > prix > etat.
4. Declenche la recherche des que sujet + niveau sont connus (n'attends pas tout).
5. NE JAMAIS INVENTER de livres. Tu definis seulement les criteres de recherche (searchParams). Les vrais resultats viennent de la base de donnees.
6. Si l'utilisateur semble perdu, donne des exemples: "Par exemple: maths, francais, anglais, svt..."

Format de reponse STRICT (JSON uniquement):
{
  "intent": "search" | "ask_info" | "chat",
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

- "search": suffisamment d'infos (sujet + niveau minimum). Lance la recherche.
- "ask_info": il manque des infos. Demande UN SEUL champ.
- "chat": salutation, remerciement, hors-sujet.

Exemples:
Utilisateur: "Je cherche un livre de maths"
→ { "intent": "ask_info", "reply": "Pour quel niveau ? (ex: 3eme, Bac, College)", "searchParams": { "subject": "Mathematiques", ... } }

Utilisateur: "Je cherche maths 3eme"
→ { "intent": "search", "reply": "Je cherche des livres de maths pour la 3eme...", "searchParams": { "subject": "Mathematiques", "level": "3eme annee" } }

Utilisateur: "Sfax" (contexte: sujet=maths, niveau=3eme)
→ { "intent": "search", "reply": "Je cherche des livres de maths 3eme a Sfax...", "searchParams": { "location": "Sfax" } }

Utilisateur: "Bonjour" / "Salem" / "Hi" / "Nihao"
→ { "intent": "chat", "reply": "Bonjour ! Je suis l'assistant LinkBook. Je peux vous aider a trouver des livres. Que cherchez-vous ?", "searchParams": {} }

IMPORTANT: Ne reponds JAMAIS avec des informations inventees. Si tu ne sais pas, dis-le.`;

        const prompt = buildPrompt(message, currentParams, history);
        const model = "claude-sonnet-4";

        const response = await puter.ai.chat(prompt, {
          model,
          systemPrompt: systemInstruction,
        });

        parsed = JSON.parse(response);
      } else {
        throw new Error("Puter not initialized");
      }
    } catch (e) {
      console.warn("Puter unavailable, using fallback.", e.message);
      parsed = fallbackParse(message, currentParams);
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

function fallbackParse(message, currentParams) {
  const text = message.toLowerCase();
  const params = { ...currentParams };

  const subjectMap = {
    'math': 'Mathématiques', 'maths': 'Mathématiques',
    'physique': 'Physique', 'phys': 'Physique',
    'français': 'Français', 'francais': 'Français',
    'anglais': 'Anglais', 'english': 'Anglais',
    'sciences': 'Sciences', 'science': 'Sciences',
    'histoire': 'Histoire', 'géo': 'Géographie', 'geographie': 'Géographie',
    'arabe': 'Arabe',
    'philosophie': 'Philosophie', 'philo': 'Philosophie',
    'espagnol': 'Espagnol',
    'allemand': 'Allemand',
    'svt': 'SVT', 'biologie': 'SVT',
    'chimie': 'Chimie',
    'technologie': 'Technologie',
    'informatique': 'Informatique',
    'musique': 'Musique',
  };

  for (const [key, val] of Object.entries(subjectMap)) {
    if (text.includes(key)) {
      params.subject = val;
      break;
    }
  }

  const levelPatterns = [
    { regex: /\b(1ère|1ere|première)\b/, value: '1ère année' },
    { regex: /\b(2ème|2eme|deuxième)\b/, value: '2ème année' },
    { regex: /\b(3ème|3eme|troisième)\b/, value: '3ème année' },
    { regex: /\b(4ème|4eme|quatrième)\b/, value: '4ème année' },
    { regex: /\b(5ème|5eme|cinquième)\b/, value: '5ème année' },
    { regex: /\b(6ème|6eme|sixième)\b/, value: '6ème année' },
    { regex: /\b(bac)\b/, value: 'Bac' },
    { regex: /\b(primaire)\b/, value: 'Primaire' },
    { regex: /\b(collège|college|moyen)\b/, value: 'Collège' },
    { regex: /\b(lycée|lycee|secondaire)\b/, value: 'Lycée' },
    { regex: /\b(université|universite|fac|supérieur)\b/, value: 'Supérieur' },
  ];

  for (const { regex, value } of levelPatterns) {
    if (regex.test(text)) {
      params.level = value;
      break;
    }
  }

  if (text.includes('achète') || text.includes('acheter') || text.includes('vente') || text.includes('achat') || text.includes('payer') || text.includes('prix')) {
    params.type = 'vente';
  } else if (text.includes('échange') || text.includes('echange') || text.includes('troquer')) {
    params.type = 'échange';
  } else if (text.includes('don') || text.includes('gratuit') || text.includes('gratis')) {
    params.type = 'don';
  }

  const cities = ['tunis', 'sfax', 'sousse', 'nabeul', 'bizerte', 'béja', 'beja', 'jendouba',
    'kairouan', 'kasserine', 'kébili', 'kebili', 'gabès', 'gabes', 'gafsa', 'médenine', 'medenine',
    'monastir', 'mahdia', 'siliana', 'tataouine', 'tozeur', 'zaghouan', 'ben arous',
    'ariana', 'manouba'];
  for (const city of cities) {
    if (text.includes(city)) {
      params.location = city.charAt(0).toUpperCase() + city.slice(1);
      break;
    }
  }

  const priceMatch = text.match(/(\d+)\s*(dt|dinars?|euros?|€)/i);
  if (priceMatch) {
    params.priceMax = parseInt(priceMatch[1]);
  }

  const searchWords = ['cherche', 'besoin', 'livre', 'manuel', 'série', 'cours', 'exercice', 'bouquin'];
  const hasSearchIntent = searchWords.some(w => text.includes(w));
  const greetings = ['bonjour', 'salem', 'hi', 'hello', 'nihao', 'salam', 'hey', 'bonsoir', 'salut'];
  const isGreeting = greetings.some(w => text.includes(w)) && text.split(' ').length <= 3;

  let intent = 'chat';
  let reply = "Bonjour ! Je peux vous aider à trouver un livre. Que cherchez-vous ?";

  if (isGreeting) {
    // stays as chat
  } else if (hasSearchIntent || params.subject || params.level) {
    intent = params.subject && params.level ? 'search' : 'ask_info';
    if (intent === 'ask_info') {
      if (!params.subject) reply = "Quel sujet cherchez-vous ? (maths, français, anglais, etc.)";
      else if (!params.level) reply = `Pour quel niveau ? (ex: 3ème, Bac, Collège)`;
      else if (!params.type) reply = "Vous préférez acheter, échanger ou un don ?";
      else if (!params.location) reply = "Dans quelle région ?";
      else reply = "Quel est votre budget maximum ?";
    } else {
      reply = `Je cherche des livres${params.subject ? ' de ' + params.subject : ''}${params.level ? ' pour ' + params.level : ''}...`;
    }
  }

  return { intent, reply, searchParams: params, missingFields: [] };
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
