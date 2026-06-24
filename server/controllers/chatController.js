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
        const systemInstruction = `Tu es l'assistant LinkBook, specialiste des livres scolaires et series d'examens en Tunisie.

VOCABULAIRE EXACT (utilise ces valeurs, jamais de variantes):
Matières: Anglais, Arabe, Chimie, Français, Géographie, Histoire, Informatique, Mathématiques, Philosophie, Physique, SVT, Sciences, Technologie, Autre
Niveaux: Primaire, Collège, Lycée, Bac, Supérieur, 3ème année, 2ème année, 1ère année, Secondaire — 1ère année, Secondaire — 4ème année (BAC), Autre
Séries d'examens: Bac, 9ème, Brevet, Concours
Localisations: Sfax, Nabeul, Bizerte, Ariana, Tunis, Monastir, La Manouba, Sousse, Gabès, Le Kef

REGLES:
1. Reponds toujours en francais. Sois chaleureux et naturel comme un libraire tunisien.
2. Analyse ce qu'il manque. Ne pose qu'UNE question a la fois (d'abord niveau, puis wilaya si necessaire).
3. Des que sujet + niveau sont connus → intent "search". Meme si la wilaya manque, lance la recherche.
4. NE JAMAIS INVENTER de livres. Tu fournis seulement les criteres de recherche.
5. Si l'utilisateur veut VENDRE, PUBLIER, CREER, DONNER → intent "action", actionType "create-offer".
6. Pour les series d'examens (Bac, 9eme, concours), mappe vers le niveau approprie.
7. Inclus toujours la ou les wilaya(s) dans ta reponse si trouvee(s).

FORMAT DE REPONSE (JSON uniquement):
{
  "intent": "search" | "ask_info" | "chat" | "action",
  "actionType": "create-offer" | null,
  "reply": "Ta reponse naturelle en francais",
  "searchParams": {
    "subject": null | "Mathématiques" | "Physique" | ...,
    "level": null | "3ème année" | "Bac" | ...,
    "location": null | "Sfax" | "Tunis" | ...,
    "type": null,
    "priceMin": null,
    "priceMax": null,
    "condition": null,
    "keyword": null
  },
  "missingFields": []
}

EXEMPLES (mappe vers les valeurs EXACTES ci-dessus):
"math 3eme" → search, subject: "Mathématiques", level: "3ème année"
"maths 3eme annee primaire" → search, subject: "Mathématiques", level: "3ème année"
"physique bac" → search, subject: "Physique", level: "Bac"
"francais 9eme" → search, subject: "Français", level: "Collège"
"anglais 1ere annee secondaire" → search, subject: "Anglais", level: "Secondaire — 1ère année"
"livre maths sfax" → search, subject: "Mathématiques", location: "Sfax"
"Je cherche maths 3eme a sfax" → search, subject: "Mathématiques", level: "3ème année", location: "Sfax"
"3eme" → ask_info, searchParams: { level: "3ème année" }, reply: "Quelle matiere cherchez-vous pour la 3eme annee ?"
"Je veux un livre de maths" → ask_info, searchParams: { subject: "Mathématiques" }, reply: "Pour quel niveau ?"
"je veux vendre un livre" → action, actionType: "create-offer"
"Bonjour" → chat, reply: "Bonjour ! Je suis l'assistant LinkBook. Je vous aide a trouver des livres scolaires en Tunisie. Dites-moi ce que vous cherchez (matiere, niveau, ville)."
"J'ai besoin du livre de maths pour la 3eme annee primaire a sfax" → search, subject: "Mathématiques", level: "3ème année", location: "Sfax"
"serie bac maths" → search, subject: "Mathématiques", level: "Bac"
"math bac" → search, subject: "Mathématiques", level: "Bac"
"livre svt" → ask_info, searchParams: { subject: "SVT" }, reply: "Pour quel niveau voulez-vous un livre de SVT ?"`;


        const model = process.env.NVIDIA_MODEL || "meta/llama-3.1-8b-instruct";

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
      const fallbackReply = extractFallbackParams(message);
      if (fallbackReply) {
        parsed = fallbackReply;
      } else {
        parsed = {
          intent: 'chat',
          reply: "Désolé, mon assistant IA est momentanément indisponible. Réessayez plus tard ou contactez-nous directement.",
          searchParams: {},
          missingFields: []
        };
      }
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

    const normalizedParams = normalizeSearchParams(mergedParams);
    Object.assign(mergedParams, normalizedParams);

    if (parsed.intent === 'search') {
      const hasSearchCriteria = mergedParams.subject || mergedParams.level || mergedParams.keyword;
      if (!hasSearchCriteria) {
        const fb = extractFallbackParams(message);
        if (fb && (fb.searchParams.subject || fb.searchParams.level)) {
          Object.assign(mergedParams, fb.searchParams);
          parsed.reply = fb.reply;
          parsed.missingFields = fb.missingFields || [];
        } else {
          return res.json({
            success: true,
            reply: "Je peux vous aider a trouver des livres scolaires en Tunisie ! Dites-moi la matiere (Maths, Physique, Francais...) et le niveau qui vous interesse.",
            books: [],
            params: mergedParams
          });
        }
      }

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

function normalizeSearchParams(params) {
  const result = { ...params };

  const subjectMap = {
    'math': 'Mathématiques', 'maths': 'Mathématiques', 'mathematique': 'Mathématiques', 'mathematiques': 'Mathématiques',
    'physique': 'Physique', 'phys': 'Physique',
    'chimie': 'Chimie', 'ch': 'Chimie',
    'francais': 'Français', 'français': 'Français', 'fr': 'Français',
    'anglais': 'Anglais', 'angl': 'Anglais', 'en': 'Anglais',
    'histoire': 'Histoire', 'hist': 'Histoire',
    'geographie': 'Géographie', 'geo': 'Géographie', 'geog': 'Géographie',
    'svt': 'SVT', 'science de la vie': 'SVT',
    'sciences': 'Sciences', 'science': 'Sciences',
    'technologie': 'Technologie', 'tech': 'Technologie',
    'philosophie': 'Philosophie', 'philo': 'Philosophie',
    'informatique': 'Informatique', 'info': 'Informatique', 'pc': 'Informatique',
    'arabe': 'Arabe',
  };

  const levelMap = {
    '3eme': '3ème année', '3eme annee': '3ème année', '3ème': '3ème année', '3ème année': '3ème année',
    '2eme': '2ème année', '2eme annee': '2ème année', '2ème': '2ème année', '2ème année': '2ème année',
    '1ere': '1ère année', '1ere annee': '1ère année', '1ère': '1ère année', '1ère année': '1ère année',
    'primaire': 'Primaire', 'prim': 'Primaire',
    'college': 'Collège', 'colleg': 'Collège',
    'lycee': 'Lycée', 'lycée': 'Lycée', 'secondaire': 'Lycée',
    'bac': 'Bac', 'baccalaureat': 'Bac', 'baccalauréat': 'Bac',
    'bac info': 'Bac', 'bac maths': 'Bac',
    'superieur': 'Supérieur', 'sup': 'Supérieur', 'universite': 'Supérieur', 'université': 'Supérieur',
    '1ere annee secondaire': 'Secondaire — 1ère année', '1ère année secondaire': 'Secondaire — 1ère année',
    '4eme annee': 'Secondaire — 4ème année (BAC)', '4ème année': 'Secondaire — 4ème année (BAC)',
    '4eme': 'Secondaire — 4ème année (BAC)', '4ème': 'Secondaire — 4ème année (BAC)',
    '9eme': 'Collège', '9ème': 'Collège',
    'concours': 'Autre',
  };

  const locationMap = {
    'sfax': 'Sfax', 'sfax ville': 'Sfax',
    'tunis': 'Tunis', 'tunis ville': 'Tunis',
    'nabeul': 'Nabeul',
    'bizerte': 'Bizerte',
    'ariana': 'Ariana',
    'monastir': 'Monastir',
    'sousse': 'Sousse',
    'gabes': 'Gabès', 'gabès': 'Gabès',
    'le kef': 'Le Kef', 'kef': 'Le Kef',
    'la manouba': 'La Manouba', 'manouba': 'La Manouba',
  };

  if (result.subject) {
    const key = result.subject.toLowerCase().trim();
    if (subjectMap[key]) result.subject = subjectMap[key];
  }
  if (result.level) {
    const key = result.level.toLowerCase().trim();
    if (levelMap[key]) result.level = levelMap[key];
  }
  if (result.location) {
    const key = result.location.toLowerCase().trim();
    if (locationMap[key]) result.location = locationMap[key];
  }

  return result;
}

function escapeRegex(str) {
  return str.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
}

function buildBookFilter(params) {
  const filter = { status: 'Disponible' };
  if (params.subject) filter.subject = { $regex: `^${escapeRegex(params.subject)}$`, $options: 'i' };
  if (params.level) filter.level = { $regex: `^${escapeRegex(params.level)}$`, $options: 'i' };
  if (params.location) filter.location = { $regex: `^${escapeRegex(params.location)}$`, $options: 'i' };
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

function extractFallbackParams(message) {
  const msg = message.toLowerCase().trim();

  const subjectPatterns = {
    'Mathématiques': /math[eé]matiques?|maths?\b/,
    'Physique': /physique/,
    'Chimie': /chimie/,
    'Français': /fran[cç]ais?\b/,
    'Anglais': /anglais/,
    'Histoire': /histoire/,
    'Géographie': /g[ée]ographie/,
    'SVT': /\bsvt\b/,
    'Sciences': /sciences?\b/,
    'Technologie': /technologie/,
    'Philosophie': /philosophie/,
    'Informatique': /informatique/,
    'Arabe': /arabe/,
  };

  const levelPatterns = {
    '3ème année': /3(?:eme|ème)\s*(?:ann[eé]e)?(?:\s*primaire)?/,
    '2ème année': /2(?:eme|ème)\s*(?:ann[eé]e)?/,
    '1ère année': /1(?:ere|ère)\s*(?:ann[eé]e)?/,
    'Primaire': /primaire/,
    'Collège': /college|collège|9(?:eme|ème)/,
    'Lycée': /lycee|lycée|secondaire/,
    'Bac': /\bbac(?:calaureat|calauréat)?\b/,
    'Supérieur': /sup[ée]rieur|universit[ée]/,
    'Secondaire — 1ère année': /1(?:ere|ère)\s*(?:ann[eé]e)?\s*secondaire/,
    'Secondaire — 4ème année (BAC)': /4(?:eme|ème)\s*(?:ann[eé]e)?/,
  };

  const locationPatterns = {
    'Sfax': /sfax/,
    'Tunis': /tunis/,
    'Nabeul': /nabeul/,
    'Bizerte': /bizerte/,
    'Ariana': /ariana/,
    'Monastir': /monastir/,
    'Sousse': /sousse/,
    'Gabès': /gab[eè]s/,
    'Le Kef': /kef/,
    'La Manouba': /manouba/,
  };

  const wantsSell = /vendre|publier|cr[ée]er.*offre|donner/;
  const wantsSearch = /cherche|besoin|livre|trouver|offre|avoir|veux|recommand/;

  let subject = null, level = null, location = null;

  for (const [val, pattern] of Object.entries(subjectPatterns)) {
    if (pattern.test(msg)) { subject = val; break; }
  }
  for (const [val, pattern] of Object.entries(levelPatterns)) {
    if (pattern.test(msg)) { level = val; break; }
  }
  for (const [val, pattern] of Object.entries(locationPatterns)) {
    if (pattern.test(msg)) { location = val; break; }
  }

  if (wantsSell.test(msg)) {
    return {
      intent: 'action',
      actionType: 'create-offer',
      reply: "Je vois que vous souhaitez proposer un livre. Cliquez sur le bouton ci-dessous pour creer votre offre !",
      searchParams: { subject, level, location },
      missingFields: []
    };
  }

  if (subject && level) {
    return {
      intent: 'search',
      reply: `Je cherche des ${subject} pour ${level}${location ? ' a ' + location : ''}...`,
      searchParams: { subject, level, location },
      missingFields: []
    };
  }

  if (subject) {
    return {
      intent: 'ask_info',
      reply: "Pour quel niveau cherchez-vous ce livre ?",
      searchParams: { subject, level: null, location },
      missingFields: ['level']
    };
  }

  if (level && location) {
    return {
      intent: 'ask_info',
      reply: `Quelle matiere cherchez-vous pour le niveau ${level} a ${location} ?`,
      searchParams: { subject: null, level, location },
      missingFields: ['subject']
    };
  }

  if (level) {
    return {
      intent: 'ask_info',
      reply: `Quelle matiere cherchez-vous pour le niveau ${level} ?`,
      searchParams: { subject: null, level, location },
      missingFields: ['subject']
    };
  }

  if (wantsSearch.test(msg)) {
    return {
      intent: 'ask_info',
      reply: "Je peux vous aider a trouver des livres scolaires en Tunisie ! Dites-moi la matiere (Maths, Physique, Francais...) et le niveau qui vous interesse.",
      searchParams: {},
      missingFields: ['subject', 'level']
    };
  }

  return null;
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
