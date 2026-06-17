import React, { useState, useRef, useEffect } from 'react';

export default function Chatbot() {
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState([
    { sender: 'bot', text: 'Bonjour 👋! Je suis votre assistant LinkBook. Que recherchez-vous aujourd\'hui ? (ex: "J\'ai besoin du livre de Maths pour la 3ème année à Sfax")' }
  ]);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const messagesEndRef = useRef(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages, isOpen]);

  const sendMessage = async (e) => {
    e.preventDefault();
    if (!input.trim()) return;

    const userMessage = { sender: 'user', text: input };
    setMessages(prev => [...prev, userMessage]);
    setInput('');
    setLoading(true);

    try {
      const res = await fetch('http://localhost:5000/api/chat/ask', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ message: userMessage.text })
      });
      const data = await res.json();
      
      setMessages(prev => [...prev, {
        sender: 'bot',
        text: data.reply || "Désolé, je n'ai pas pu traiter votre demande.",
        books: data.books || []
      }]);
    } catch (err) {
      setMessages(prev => [...prev, { sender: 'bot', text: "Erreur de connexion avec le serveur." }]);
    } finally {
      setLoading(false);
    }
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

  return (
    <div className="fixed bottom-6 right-6 w-80 sm:w-96 bg-white rounded-2xl shadow-2xl border border-gray-100 flex flex-col overflow-hidden z-50 h-[500px] max-h-[80vh]">
      {/* Header */}
      <div className="bg-gradient-to-r from-[#2777df] to-[#fc4d16] p-4 flex justify-between items-center text-white">
        <div className="flex items-center gap-2">
          <div className="bg-white/20 p-1.5 rounded-lg">
            <svg className="h-5 w-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" /></svg>
          </div>
          <div>
            <h3 className="font-bold text-sm">Assistant LinkBook</h3>
            <span className="text-[10px] text-white/80">En ligne</span>
          </div>
        </div>
        <button onClick={() => setIsOpen(false)} className="text-white/80 hover:text-white transition-colors">
          <svg className="h-6 w-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" /></svg>
        </button>
      </div>

      {/* Messages */}
      <div className="flex-1 overflow-y-auto p-4 space-y-4 bg-gray-50/50">
        {messages.map((msg, i) => (
          <div key={i} className={`flex flex-col ${msg.sender === 'user' ? 'items-end' : 'items-start'}`}>
            <div className={`max-w-[85%] rounded-2xl px-4 py-2.5 text-sm ${msg.sender === 'user' ? 'bg-[#2777df] text-white rounded-br-none' : 'bg-white border border-gray-100 text-gray-800 shadow-sm rounded-bl-none'}`}>
              <p className="whitespace-pre-wrap">{msg.text}</p>
            </div>
            
            {msg.books && msg.books.length > 0 && (
              <div className="mt-2 space-y-2 w-[85%]">
                {msg.books.map(book => (
                  <div key={book._id} className="bg-white border border-gray-100 rounded-xl p-2 shadow-sm flex gap-3 cursor-pointer hover:border-[#2777df] transition-colors" onClick={() => window.location.hash = `#offer-detail?id=${book._id}`}>
                    <img src={book.images?.[0] || '/images/3768ec8e8ce95737a750cad65a6be4ef.jpg'} alt="" className="h-16 w-12 object-cover rounded-lg bg-gray-100" />
                    <div className="flex-1 min-w-0">
                      <h4 className="text-xs font-bold text-gray-900 truncate">{book.title}</h4>
                      <p className="text-[10px] text-gray-500 truncate">{book.subject} {book.level && `- ${book.level}`}</p>
                      <div className="flex items-center justify-between mt-1.5">
                        <span className="text-[10px] font-bold text-[#2777df]">{book.price ? `${book.price} DT` : book.type === 'don' ? 'Gratuit' : 'Échange'}</span>
                        {book.location && <span className="text-[9px] text-gray-400 bg-gray-100 px-1.5 py-0.5 rounded-full">{book.location}</span>}
                      </div>
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
              <div className="w-1.5 h-1.5 bg-gray-300 rounded-full animate-bounce"></div>
              <div className="w-1.5 h-1.5 bg-gray-300 rounded-full animate-bounce" style={{ animationDelay: '0.1s' }}></div>
              <div className="w-1.5 h-1.5 bg-gray-300 rounded-full animate-bounce" style={{ animationDelay: '0.2s' }}></div>
            </div>
          </div>
        )}
        <div ref={messagesEndRef} />
      </div>

      {/* Input */}
      <div className="p-3 bg-white border-t border-gray-100">
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
