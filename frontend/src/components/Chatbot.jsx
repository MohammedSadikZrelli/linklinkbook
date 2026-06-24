import React, { useState, useRef, useEffect } from 'react';
import { chatAPI, assetURL } from '../services/api';

const SUGGESTIONS = [
  { label: '🔍 Rechercher un livre', text: 'Je cherche un livre' },
  { label: '🏷️ Vendre un livre', text: 'Je veux vendre un livre' },
  { label: '💰 Recharger solde', text: 'Comment recharger mon solde ?' }
];

export default function Chatbot() {
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState([
    { 
      sender: 'bot', 
      text: "Bonjour 👋 ! Je suis votre assistant LinkBook. Posez-moi vos questions !" 
    }
  ]);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const messagesEndRef = useRef(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => { scrollToBottom(); }, [messages, isOpen]);

  const sendMessage = async (e, text) => {
    const userMsg = text || input.trim();
    if (!userMsg) return;

    if (e) e.preventDefault();
    setMessages(prev => [...prev, { sender: 'user', text: userMsg }]);
    setInput('');
    setLoading(true);

    try {
      // Simplified: We just pass the message and a short history, no complex param tracking
      const history = messages.slice(-4).map(m => ({
        role: m.sender === 'user' ? 'user' : 'assistant',
        content: m.text
      }));

      const data = await chatAPI.askAI({
        message: userMsg,
        context: { history, params: {} } // Always clean params for simplicity
      });

      setMessages(prev => [...prev, {
        sender: 'bot',
        text: data.reply || "Je n'ai pas bien compris, pouvez-vous reformuler ?",
        books: data.books || [],
        action: data.action || null
      }]);
    } catch (err) {
      setMessages(prev => [...prev, { sender: 'bot', text: "Erreur de connexion avec le serveur." }]);
    } finally {
      setLoading(false);
    }
  };

  const isInitial = messages.length === 1 && messages[0].sender === 'bot';

  return (
    <>
      {/* Floating Toggle Button */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        className={`fixed bottom-6 right-6 h-14 w-14 rounded-full shadow-2xl flex items-center justify-center transition-all duration-300 hover:scale-110 active:scale-95 z-50 bg-gradient-to-tr from-[#2777df] via-[#3a8ef6] to-[#fc4d16] text-white ${
          isOpen ? 'rotate-90 opacity-0 pointer-events-none scale-75' : 'rotate-0 opacity-100 scale-100'
        }`}
      >
        <div className="absolute inset-0 rounded-full bg-blue-500/35 animate-ping opacity-75" />
        <svg className="h-6 w-6 relative z-10" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M8 10h.01M12 10h.01M16 10h.01M9 16H5a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v8a2 2 0 01-2 2h-5l-5 5v-5z" />
        </svg>
      </button>

      {/* Chat Window */}
      <div
        className={`fixed bottom-6 right-6 w-[340px] sm:w-[380px] bg-white/95 backdrop-blur-md rounded-2xl shadow-[0_20px_50px_rgba(0,0,0,0.15)] border border-white/20 flex flex-col overflow-hidden z-50 h-[500px] max-h-[85vh] transition-all duration-300 transform origin-bottom-right ${
          isOpen ? 'opacity-100 translate-y-0 scale-100' : 'opacity-0 translate-y-10 scale-75 pointer-events-none'
        }`}
      >
        {/* Header */}
        <div className="bg-gradient-to-r from-[#2777df] to-[#fc4d16] p-4 flex justify-between items-center text-white flex-shrink-0">
          <div className="flex items-center gap-2.5">
            <div className="bg-white/25 p-2 rounded-xl backdrop-blur-sm">
              <svg className="h-5 w-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M13 10V3L4 14h7v7l9-11h-7z" />
              </svg>
            </div>
            <div>
              <h3 className="font-extrabold text-sm tracking-wide">Assistant LinkBook</h3>
              <span className="text-[10px] font-bold text-white/90">Mode Simple</span>
            </div>
          </div>
          <button onClick={() => setIsOpen(false)} className="bg-white/10 hover:bg-white/20 p-1.5 rounded-lg text-white">
            <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        {/* Messages */}
        <div className="flex-1 overflow-y-auto p-4 space-y-4 bg-gray-50/50">
          {messages.map((msg, i) => (
            <div key={i} className={`flex flex-col ${msg.sender === 'user' ? 'items-end' : 'items-start'} animate-in fade-in slide-in-from-bottom-2 duration-200`}>
              <div className={`max-w-[88%] rounded-2xl px-4 py-3 text-sm leading-relaxed shadow-sm ${
                msg.sender === 'user' 
                  ? 'bg-gradient-to-tr from-[#2777df] to-[#3a8ef6] text-white rounded-br-none' 
                  : 'bg-white border border-gray-100/80 text-gray-800 rounded-bl-none'
              }`}>
                <p className="whitespace-pre-wrap">{msg.text}</p>

                {msg.action === 'create-offer' && (
                  <div className="mt-3">
                    <button
                      onClick={() => { window.location.href = '/create-offer'; setIsOpen(false); }}
                      className="w-full py-2 bg-gradient-to-r from-[#2777df] to-[#fc4d16] text-white text-xs font-bold rounded-xl shadow-md hover:shadow-lg transition-all flex items-center justify-center gap-1.5"
                    >
                      <svg className="h-3.5 w-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" /></svg>
                      Créer une offre
                    </button>
                  </div>
                )}
              </div>

              {/* Books Search Results Cards */}
              {msg.books && msg.books.length > 0 && (
                <div className="mt-2.5 space-y-2.5 w-[88%] animate-in fade-in duration-200">
                  {msg.books.map(book => (
                    <div
                      key={book._id}
                      onClick={() => { window.location.hash = `#offer-detail?id=${book._id}`; setIsOpen(false); }}
                      className="bg-white border border-gray-100 rounded-xl overflow-hidden shadow-sm hover:shadow-md hover:border-[#2777df]/30 transition-all duration-200 cursor-pointer flex gap-3 group"
                    >
                      <div className="w-16 h-24 bg-gray-50 flex-shrink-0">
                        <img
                          src={book.images?.[0] || assetURL('9daa051ce6458b314a567b7df7c447a2.jpg')}
                          alt=""
                          className="w-full h-full object-cover group-hover:scale-105 transition-transform"
                          onError={(e) => { e.target.src = assetURL('9daa051ce6458b314a567b7df7c447a2.jpg'); }}
                        />
                      </div>
                      <div className="flex-1 py-2 pr-3 flex flex-col justify-between min-w-0">
                        <div>
                          <h4 className="text-xs font-bold text-gray-900 truncate">{book.title}</h4>
                          <p className="text-[10px] text-gray-500 truncate mt-0.5">{book.subject} — {book.level}</p>
                        </div>
                        <span className="text-[11px] font-black text-[#2777df] mt-1">
                          {book.price ? `${book.price} DT` : book.type === 'don' ? 'Gratuit' : 'Échange'}
                        </span>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          ))}

          {/* Typing Indicator */}
          {loading && (
            <div className="flex items-start animate-pulse">
              <div className="bg-white border border-gray-100 shadow-sm rounded-2xl rounded-bl-none px-4.5 py-3 flex gap-1 items-center">
                <div className="w-1.5 h-1.5 bg-gray-400 rounded-full animate-bounce" style={{ animationDuration: '1s' }} />
                <div className="w-1.5 h-1.5 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '0.2s', animationDuration: '1s' }} />
                <div className="w-1.5 h-1.5 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '0.4s', animationDuration: '1s' }} />
              </div>
            </div>
          )}
          <div ref={messagesEndRef} />
        </div>

        {/* Welcome Suggestions */}
        {isInitial && !loading && (
          <div className="px-4 pb-3 pt-1 bg-gradient-to-b from-transparent to-gray-50/50 flex-shrink-0">
            <div className="flex flex-wrap gap-2">
              {SUGGESTIONS.map(s => (
                <button
                  key={s.label}
                  onClick={() => sendMessage(null, s.text)}
                  className="text-xs font-bold text-gray-600 bg-white border border-gray-200/80 hover:border-[#2777df] hover:text-[#2777df] rounded-full px-3 py-1.5 transition-all shadow-sm"
                >
                  {s.label}
                </button>
              ))}
            </div>
          </div>
        )}

        {/* Input Form */}
        <div className="p-3 bg-white border-t border-gray-100 flex-shrink-0">
          <form onSubmit={sendMessage} className="flex gap-2 relative">
            <input
              type="text"
              value={input}
              onChange={(e) => setInput(e.target.value)}
              placeholder="Écrivez un message..."
              className="flex-1 bg-gray-50 border border-gray-200 rounded-full pl-4 pr-11 py-2.5 text-sm focus:outline-none focus:border-[#2777df] focus:ring-1 focus:ring-blue-100"
              disabled={loading}
            />
            <button
              type="submit"
              disabled={!input.trim() || loading}
              className="absolute right-1 top-1 bottom-1 aspect-square bg-[#2777df] text-white rounded-full flex items-center justify-center disabled:bg-gray-200 disabled:text-gray-400 hover:bg-[#185db4] transition-all"
            >
              <svg className="h-4 w-4 ml-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M12 19l9 2-9-18-9 18 9-2zm0 0v-8" />
              </svg>
            </button>
          </form>
        </div>
      </div>
    </>
  );
}
