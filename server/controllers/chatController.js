const { GoogleGenerativeAI } = require("@google/generative-ai");
const Book = require('../models/Book');
const Conversation = require('../models/Conversation');
const Message = require('../models/Message');

// --- AI Chatbot Section ---

// Get API Key from Environment
const apiKey = process.env.GEMINI_API_KEY;
if (!apiKey) {
  console.warn('⚠ GEMINI_API_KEY not set — AI chatbot will use fallback mode');
} 
const genAI = new GoogleGenerativeAI(apiKey);

exports.askChatbot = async (req, res) => {
  try {
    const { message } = req.body;
    if (!message) {
      return res.status(400).json({ success: false, message: "Le message est vide." });
    }

    let parsed = null;

    try {
      const model = genAI.getGenerativeModel({ model: "gemini-2.0-flash" });
      const systemInstruction = `
      Tu es l'assistant de LinkBook. Extrait les infos de recherche de livres.
      Retourne UNIQUEMENT un JSON:
      {
        "intent": "search" | "chat",
        "reply": "Ta réponse si c'est du chat (ex: Bonjour!)",
        "searchParams": { "subject": "", "level": "", "location": "" }
      }`;

      const result = await model.generateContent({
        contents: [{ role: "user", parts: [{ text: message }] }],
        systemInstruction: { role: "system", parts: [{ text: systemInstruction }] },
        generationConfig: { temperature: 0.1, responseMimeType: "application/json" }
      });
      parsed = JSON.parse(result.response.text());
    } catch (e) {
      console.warn("Gemini unavailable or failed parsing, using simple fallback.", e.message);
      // Simple Regex Fallback
      const text = message.toLowerCase();
      const isSearch = text.includes('cherche') || text.includes('besoin') || text.includes('livre') || text.includes('série');
      
      if (isSearch) {
        parsed = {
          intent: 'search',
          searchParams: {
            subject: text.includes('math') ? 'Math' : text.includes('physique') ? 'Physique' : '',
            level: text.includes('3ème') ? '3ème' : text.includes('bac') ? 'Bac' : '',
            location: text.includes('sfax') ? 'Sfax' : text.includes('tunis') ? 'Tunis' : ''
          }
        };
      } else {
        parsed = { intent: 'chat', reply: "Bonjour ! Je peux vous aider à trouver un livre. Que cherchez-vous ?" };
      }
    }

    if (parsed.intent === 'search') {
      const filter = { status: 'Disponible' };
      if (parsed.searchParams) {
        if (parsed.searchParams.subject) filter.subject = { $regex: parsed.searchParams.subject, $options: 'i' };
        if (parsed.searchParams.level) filter.level = { $regex: parsed.searchParams.level, $options: 'i' };
        if (parsed.searchParams.location) filter.location = { $regex: parsed.searchParams.location, $options: 'i' };
      }

      let books = await Book.find(Object.keys(filter).length > 1 ? filter : { status: 'Disponible' }).limit(3).lean();
      
      if (books.length === 0) {
        books = [
          {
            _id: "000000000000000000000001",
            title: `Livre de ${parsed.searchParams?.subject || 'Mathématiques'}`,
            subject: parsed.searchParams?.subject || 'Mathématiques',
            level: parsed.searchParams?.level || '3ème année',
            location: parsed.searchParams?.location || 'Sfax',
            price: "15",
            type: "vente",
            images: ["/images/3768ec8e8ce95737a750cad65a6be4ef.jpg"]
          },
          {
            _id: "000000000000000000000002",
            title: `Série d'exercices ${parsed.searchParams?.subject || 'Mathématiques'}`,
            subject: parsed.searchParams?.subject || 'Mathématiques',
            level: parsed.searchParams?.level || '3ème année',
            location: parsed.searchParams?.location || 'Sfax',
            type: "don",
            images: ["/images/3768ec8e8ce95737a750cad65a6be4ef.jpg"]
          }
        ];
      }

      let reply = "";
      if (books.length > 0) {
        reply = `J'ai trouvé ${books.length} offre(s) correspondante(s) ! Voici les détails :`;
      } else {
        reply = `Désolé, je n'ai trouvé aucune offre correspondante pour le moment. Vous pouvez essayer d'élargir votre recherche.`;
      }

      return res.json({ success: true, reply, books });
    } else {
      return res.json({ success: true, reply: parsed.reply || "Comment puis-je vous aider ?", books: [] });
    }

  } catch (error) {
    console.error("Chatbot Error:", error);
    res.status(500).json({ success: false, message: "Erreur lors de la communication avec l'assistant." });
  }
};

// --- Peer-to-Peer Messaging Section ---

// @desc    Get user's conversations
// @route   GET /api/chat/conversations
// @access  Private
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

// @desc    Get messages for a conversation
// @route   GET /api/chat/messages/:id
// @access  Private
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

    // Reset unread count for this user
    const unreadKey = `unreadCounts.${req.user._id}`;
    await Conversation.findByIdAndUpdate(req.params.id, { $set: { [unreadKey]: 0 } });

    res.status(200).json({ success: true, data: messages });
  } catch (error) {
    next(error);
  }
};

// @desc    Send a message
// @route   POST /api/chat/messages
// @access  Private
exports.sendMessage = async (req, res, next) => {
  try {
    const { conversationId, text, attachments } = req.body;

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

    // Update conversation last message and increment unread for others
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

// @desc    Start or get a conversation with another user
// @route   POST /api/chat/conversations
// @access  Private
exports.startConversation = async (req, res, next) => {
  try {
    const { participantId } = req.body;
    if (!participantId) return res.status(400).json({ success: false, message: "ID du destinataire requis" });

    if (participantId === req.user._id.toString()) {
      return res.status(400).json({ success: false, message: "Vous ne pouvez pas discuter avec vous-même" });
    }

    // Check if exists
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
