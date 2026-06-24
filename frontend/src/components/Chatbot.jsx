import React, { useState, useRef, useEffect } from 'react';
import { chatAPI, assetURL } from '../services/api';

const SUGGESTIONS = [
  { label: '🔍 Je cherche un livre...', text: 'Je cherche un livre' },
  { label: '📚 Aide-moi à trouver mon manuel', text: 'Aide-moi à trouver un manuel scolaire' },
  { label: '❓ Comment ça marche ?', text: 'Comment ça marche ?' },
  { label: '🏷️ Je veux vendre un livre', text: 'Je veux vendre un livre' },
];

export default function Chatbot() {
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState([
    { sender: 'bot', text: 'Bonjour 👋 ! Je suis votre assistant LinkBook. Que recherchez-vous ?' }
  ]);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const [context, setContext] = useState({ params: {}, history: [] });
  const messagesEndRef = useRef(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => { scrollToBottom(); }, [messages, isOpen]);

  const collectedChips = Object.entries(context.params)
    .filter(([, v]) => v && v !== '' && v !== null)
    .map(([k, v]) => ({ key: k, value: v }));

  const labelMap = {
    subject: '📚', level: '📖', location: '📍',
    type: '🏷️', priceMin: '💰', priceMax: '💰', condition: '⭐', keyword: '🔍'
  };

  const sendMessage = async (e, text) => {
    const userMsg = text || input.trim();
    if (!userMsg) return;

    if (e) e.preventDefault();
    setMessages(prev => [...prev, { sender: 'user', text: userMsg }]);
    setInput('');
    setLoading(true);

    try {
      const data = await chatAPI.askAI({
        message: userMsg,
        context: {
          params: context.params,
          history: context.history.slice(-6)
        }
      });

      if (data.params) {
        setContext(prev => ({
          params: { ...prev.params, ...data.params },
          history: [...prev.history.slice(-10), { role: 'user', content: userMsg }, { role: 'assistant', content: data.reply }]
        }));
      }

      setMessages(prev => [...prev, {
        sender: 'bot',
        text: data.reply || "Désolé, je n'ai pas pu traiter votre demande.",
        books: data.books || [],
        action: data.action || null
      }]);
    } catch (err) {
      setMessages(prev => [...prev, { sender: 'bot', text: "Erreur de connexion avec le serveur." }]);
    } finally {
      setLoading(false);
    }
  };

  const resetConversation = () => {
    setContext({ params: {}, history: [] });
    setMessages([
      { sender: 'bot', text: 'Bonjour 👋 ! Je suis votre assistant LinkBook. Que recherchez-vous ?' }
    ]);
  };

  if (!isOpen) {
    return (
      <button
        onClick={() => setIsOpen(true)}
        className="fixed bottom-6 right-6 h-14 w-14 bg-gradient-to-r from-[#2777df] to-[#fc4d16] text-white rounded-full shadow-lg shadow-blue-500/30 flex items-center justify-center hover:scale-105 transition-transform z-50"
      >
        <svg className="h-6 w-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M8 10h.01M12 10h.01M16 10h.01M9 16H5a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v8a2 2 0 01-2 2h-5l-5 5v-5z" /></svg>
      </button>
    );
  }

  const isInitial = messages.length === 1 && messages[0].sender === 'bot';

  return (
    <div className="fixed bottom-6 right-6 w-80 sm:w-96 bg-white rounded-2xl shadow-2xl border border-gray-100 flex flex-col overflow-hidden z-50 h-[540px] max-h-[80vh]">
      {/* Header */}
      <div className="bg-gradient-to-r from-[#2777df] to-[#fc4d16] p-4 flex justify-between items-center text-white flex-shrink-0">
        <div className="flex items-center gap-2">
          <div className="bg-white/20 p-1.5 rounded-lg">
            <svg className="h-5 w-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" /></svg>
          </div>
          <div>
            <h3 className="font-bold text-sm">Assistant LinkBook</h3>
            <span className="text-[10px] text-white/80">En ligne</span>
          </div>
        </div>
        <div className="flex items-center gap-1">
          {collectedChips.length > 0 && (
            <button onClick={resetConversation} className="text-white/70 hover:text-white transition-colors p-1" title="Nouvelle recherche">
              <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" /></svg>
            </button>
          )}
          <button onClick={() => setIsOpen(false)} className="text-white/80 hover:text-white transition-colors">
            <svg className="h-6 w-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" /></svg>
          </button>
        </div>
      </div>

      {/* Context Chips */}
      {collectedChips.length > 0 && (
        <div className="px-4 py-2 bg-blue-50/30 border-b border-blue-100/50 flex flex-wrap gap-1.5 flex-shrink-0">
          {collectedChips.map(chip => (
            <span key={chip.key} className="text-[10px] font-bold bg-white border border-blue-100 text-gray-700 px-2 py-0.5 rounded-full">
              {labelMap[chip.key] || '•'} {chip.value}
            </span>
          ))}
          <button onClick={resetConversation} className="text-[10px] font-bold text-red-400 hover:text-red-500 ml-auto">✕</button>
        </div>
      )}

      {/* Messages */}
      <div className="flex-1 overflow-y-auto p-4 space-y-4 bg-gray-50/50">
        {messages.map((msg, i) => (
          <div key={i} className={`flex flex-col ${msg.sender === 'user' ? 'items-end' : 'items-start'}`}>
            <div className={`max-w-[88%] rounded-2xl px-4 py-2.5 text-sm ${msg.sender === 'user' ? 'bg-[#2777df] text-white rounded-br-none' : 'bg-white border border-gray-100 text-gray-800 shadow-sm rounded-bl-none'}`}>
              <p className="whitespace-pre-wrap leading-relaxed">{msg.text}</p>
            </div>

            {msg.action && (
              <div className="mt-2 w-[88%]">
                <button
                  onClick={() => { window.location.hash = '#create-offer'; setIsOpen(false); }}
                  className="w-full py-2.5 bg-gradient-to-r from-[#2777df] to-[#fc4d16] text-white text-xs font-bold rounded-xl shadow-md hover:shadow-lg transition-all flex items-center justify-center gap-2"
                >
                  <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" /></svg>
                  Créer une offre
                </button>
              </div>
            )}
            {msg.books && msg.books.length > 0 && (
              <div className="mt-2 space-y-2 w-[88%]">
                {msg.books.map(book => (
                  <div
                    key={book._id}
                    onClick={() => window.location.hash = `#offer-detail?id=${book._id}`}
                    className="bg-white border border-gray-100 rounded-xl overflow-hidden shadow-sm hover:shadow-md hover:border-[#2777df]/30 transition-all cursor-pointer flex gap-3"
                  >
                    <div className="w-16 h-20 bg-gray-100 flex-shrink-0 overflow-hidden">
                      <img
                        src={book.images?.[0] || assetURL('9daa051ce6458b314a567b7df7c447a2.jpg')}
                        alt=""
                        className="w-full h-full object-cover"
                        onError={(e) => { e.target.src = assetURL('9daa051ce6458b314a567b7df7c447a2.jpg'); }}
                      />
                    </div>
                    <div className="flex-1 min-w-0 py-2 pr-3">
                      <h4 className="text-xs font-bold text-gray-900 truncate">{book.title}</h4>
                      <p className="text-[10px] text-gray-500 truncate mt-0.5">{book.subject}{book.level ? ` — ${book.level}` : ''}</p>
                      <div className="flex items-center justify-between mt-2">
                        <span className="text-[11px] font-black text-[#2777df]">
                          {book.price ? `${book.price} DT` : book.type === 'don' ? 'Gratuit' : 'Échange'}
                        </span>
                        {book.location && (
                          <span className="text-[9px] text-gray-400 bg-gray-100 px-1.5 py-0.5 rounded-full truncate max-w-[80px]">
                            📍 {book.location}
                          </span>
                        )}
                      </div>
                      <span className={`inline-block mt-1 text-[9px] font-bold px-1.5 py-0.5 rounded-full ${
                        book.type === 'vente' ? 'bg-blue-50 text-blue-600' :
                        book.type === 'échange' ? 'bg-orange-50 text-orange-500' :
                        'bg-green-50 text-green-600'
                      }`}>
                        {book.type === 'vente' ? 'Vente' : book.type === 'échange' ? 'Échange' : 'Don'}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        ))}
        {loading && (
          <div className="flex items-start">
            <div className="bg-white border border-gray-100 shadow-sm rounded-2xl rounded-bl-none px-4 py-3 flex gap-1">
              <div className="w-1.5 h-1.5 bg-gray-300 rounded-full animate-bounce" />
              <div className="w-1.5 h-1.5 bg-gray-300 rounded-full animate-bounce" style={{ animationDelay: '0.1s' }} />
              <div className="w-1.5 h-1.5 bg-gray-300 rounded-full animate-bounce" style={{ animationDelay: '0.2s' }} />
            </div>
          </div>
        )}
        <div ref={messagesEndRef} />
      </div>

      {/* Welcome Suggestions */}
      {isInitial && !loading && (
        <div className="px-4 pb-2 bg-gray-50/50 flex-shrink-0">
          <div className="flex flex-wrap gap-2">
            {SUGGESTIONS.map(s => (
              <button
                key={s.label}
                onClick={() => sendMessage(null, s.text)}
                className="text-xs font-bold text-gray-600 bg-white border border-gray-200 hover:border-[#2777df] hover:text-[#2777df] hover:bg-blue-50/30 rounded-full px-3 py-1.5 transition-all shadow-sm"
              >
                {s.label}
              </button>
            ))}
          </div>
        </div>
      )}

      {/* Input */}
      <div className="p-3 bg-white border-t border-gray-100 flex-shrink-0">
        <form onSubmit={sendMessage} className="flex gap-2 relative">
          <input
            type="text"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            placeholder="Posez votre question..."
            className="flex-1 bg-gray-50 border border-gray-200 rounded-full pl-4 pr-10 py-2.5 text-sm focus:outline-none focus:border-[#2777df] focus:ring-2 focus:ring-blue-100 transition-all"
            disabled={loading}
          />
          <button
            type="submit"
            disabled={!input.trim() || loading}
            className="absolute right-1 top-1 bottom-1 aspect-square bg-[#2777df] text-white rounded-full flex items-center justify-center disabled:bg-gray-300 disabled:cursor-not-allowed hover:bg-[#185db4] transition-colors"
          >
            <svg className="h-4 w-4 ml-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 19l9 2-9-18-9 18 9-2zm0 0v-8" /></svg>
          </button>
        </form>
      </div>
    </div>
  );
}
