import React, { useState } from 'react';
import { FeedLayout } from '../layouts/SharedLayout';

export default function Messages() {
  const [contacts, setContacts] = useState([
    {
      id: 1,
      name: 'Mohamed Truki',
      phone: '+216 21 640 651',
      lastMessage: 'Lorem Ipsum est simplement un faux texte de l\'industrie...',
      time: '13:11',
      unread: 2,
      avatar: 'MT'
    },
    {
      id: 2,
      name: 'Malek Makki',
      phone: '+216 98 765 432',
      lastMessage: 'D\'accord, on fait l\'échange demain.',
      time: 'Hier',
      unread: 0,
      avatar: 'MM'
    },
    {
      id: 3,
      name: 'Sonia Ben Ali',
      phone: '+216 55 123 456',
      lastMessage: 'Est-ce que le livre est toujours disponible ?',
      time: 'Mardi',
      unread: 0,
      avatar: 'SA'
    }
  ]);

  const [activeContactId, setActiveContactId] = useState(1);
  const [typedMessage, setTypedMessage] = useState('');

  const [chatHistories, setChatHistories] = useState({
    1: [
      {
        id: 101,
        sender: 'other',
        time: '13:11 PM',
        text: 'Lorem Ipsum est simplement un faux texte de l\'industrie de l\'impression et de la composition. Le Lorem Ipsum est le texte factice standard de l\'industrie depuis les années 1500, lorsqu\'un imprimeur inconnu a pris une galère de caractères et l\'a brouillé pour en faire un livre de spécimens de caractères.',
        attachments: [
          '/images/694c9a85f499a9880071f476006a4730.png',
          '/images/e3049545b879d2927084c2fc641be246.png'
        ]
      },
      {
        id: 102,
        sender: 'me',
        time: '13:11 PM',
        text: 'Lorem Ipsum est simplement un faux texte de l\'industrie de l\'impression et de la composition. Le Lorem Ipsum est le texte factice standard de l\'industrie depuis les années 1500, lorsqu\'un imprimeur inconnu a pris une galère de caractères et l\'a brouillé.'
      }
    ],
    2: [
      { id: 201, sender: 'me', time: 'Hier', text: 'Bonjour Malek, êtes-vous intéressé par mes livres ?' },
      { id: 202, sender: 'other', time: 'Hier', text: 'Bonjour, oui tout à fait ! Quel est l\'état des livres ?' },
      { id: 203, sender: 'me', time: 'Hier', text: 'Pratiquement neufs. Pas d\'écritures ni de pages déchirées.' },
      { id: 204, sender: 'other', time: 'Hier', text: 'D\'accord, on fait l\'échange demain.' }
    ],
    3: [
      { id: 301, sender: 'other', time: 'Mardi', text: 'Est-ce que le livre est toujours disponible ?' }
    ]
  });

  const activeContact = contacts.find(c => c.id === activeContactId);
  const activeChat = chatHistories[activeContactId] || [];

  const handleSendMessage = (e) => {
    e.preventDefault();
    if (!typedMessage.trim()) return;

    const newMsg = {
      id: Date.now(),
      sender: 'me',
      time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      text: typedMessage
    };

    setChatHistories(prev => ({
      ...prev,
      [activeContactId]: [...(prev[activeContactId] || []), newMsg]
    }));

    // Update last message in contacts list
    setContacts(prev => prev.map(c => c.id === activeContactId ? { ...c, lastMessage: typedMessage, time: 'À l\'instant' } : c));

    setTypedMessage('');
  };

  return (
    <FeedLayout active="Mes contacts" title="Messages">
      <div className="bg-white rounded-3xl border border-gray-100 shadow-sm overflow-hidden h-[600px] flex">
        
        {/* Contacts Sidebar List (Left Panel) */}
        <div className="w-full md:w-80 border-r border-gray-100 flex flex-col flex-shrink-0">
          <div className="p-4 border-b border-gray-100">
            <div className="relative">
              <svg className="absolute left-3.5 top-3 h-4 w-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" /></svg>
              <input 
                type="text" 
                placeholder="Rechercher un contact..." 
                className="w-full pl-10 pr-4 py-2 bg-gray-50 border border-gray-200 rounded-2xl text-xs font-semibold outline-none focus:border-[#2777df] transition-all"
              />
            </div>
          </div>

          <div className="flex-1 overflow-y-auto divide-y divide-gray-50">
            {contacts.map(c => {
              const isActive = c.id === activeContactId;
              return (
                <button 
                  key={c.id} 
                  onClick={() => {
                    setActiveContactId(c.id);
                    // Clear unread count on click
                    setContacts(prev => prev.map(item => item.id === c.id ? { ...item, unread: 0 } : item));
                  }}
                  className={`w-full p-4 flex gap-3 text-left transition-colors relative hover:bg-gray-50/80
                    ${isActive ? 'bg-blue-50/50 border-l-4 border-[#2777df]' : ''}`}
                >
                  <div className="h-10 w-10 rounded-full bg-gradient-to-br from-[#2777df] to-[#fc4d16] text-white flex items-center justify-center font-black text-xs shadow-inner">
                    {c.avatar}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between">
                      <h4 className="text-sm font-black text-gray-900 truncate">{c.name}</h4>
                      <span className="text-[10px] font-bold text-gray-400">{c.time}</span>
                    </div>
                    <span className="text-[10px] font-semibold text-[#2777df] block mb-0.5">{c.phone}</span>
                    <p className="text-xs text-gray-400 truncate leading-snug">{c.lastMessage}</p>
                  </div>

                  {c.unread > 0 && (
                    <span className="absolute right-4 bottom-4 h-5 w-5 bg-[#fc4d16] text-white rounded-full text-[10px] font-black flex items-center justify-center">
                      {c.unread}
                    </span>
                  )}
                </button>
              );
            })}
          </div>
        </div>

        {/* Chat Window Details (Right Panel) */}
        <div className="hidden md:flex flex-col flex-1 bg-slate-50/30">
          {activeContact ? (
            <>
              {/* Header info */}
              <div className="p-4 bg-white border-b border-gray-100 flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="h-10 w-10 rounded-full bg-blue-100 text-[#2777df] font-black text-xs flex items-center justify-center">
                    {activeContact.avatar}
                  </div>
                  <div>
                    <h3 className="text-sm font-black text-gray-900">{activeContact.name}</h3>
                    <p className="text-[10px] font-semibold text-[#2777df]">{activeContact.phone}</p>
                  </div>
                </div>

                <div className="flex items-center gap-2">
                  <button className="p-2 text-gray-400 hover:text-gray-600 rounded-xl hover:bg-gray-100 transition-colors">
                    <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 5a2 2 0 012-2h3.28a1 1 0 01.94.725l.548 2.2a1 1 0 01-.321.988l-1.305.98a10.582 10.582 0 004.872 4.872l.98-1.305a1 1 0 01.988-.321l2.2.548a1 1 0 01.725.94V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" /></svg>
                  </button>
                  <button className="p-2 text-gray-400 hover:text-[#fc4d16] rounded-xl hover:bg-red-50 transition-colors">
                    <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" /></svg>
                  </button>
                </div>
              </div>

              {/* Message scroll container */}
              <div className="flex-1 overflow-y-auto p-4 space-y-4">
                {activeChat.map(msg => {
                  const isMe = msg.sender === 'me';
                  return (
                    <div key={msg.id} className={`flex gap-3 max-w-[85%] ${isMe ? 'ml-auto flex-row-reverse' : ''}`}>
                      <div className={`h-8 w-8 rounded-full text-[10px] font-black flex items-center justify-center flex-shrink-0
                        ${isMe ? 'bg-orange-100 text-[#fc4d16]' : 'bg-blue-100 text-[#2777df]'}`}>
                        {isMe ? 'MO' : activeContact.avatar}
                      </div>

                      <div className="space-y-1">
                        <div className={`rounded-3xl p-4 text-xs leading-relaxed shadow-sm
                          ${isMe ? 'bg-[#2777df] text-white rounded-tr-none' : 'bg-white text-gray-800 rounded-tl-none border border-gray-100'}`}>
                          {msg.text}

                          {/* Render Attachments if present */}
                          {msg.attachments && msg.attachments.length > 0 && (
                            <div className="flex gap-2 mt-3 pt-3 border-t border-gray-100/50">
                              {msg.attachments.map((img, i) => (
                                <div key={i} className="h-16 w-16 bg-slate-50 border border-gray-200 rounded-xl overflow-hidden p-1 flex items-center justify-center">
                                  <img 
                                    src={img} 
                                    className="max-h-full max-w-full object-contain rounded-lg" 
                                    alt="Pièce jointe"
                                    onError={(e) => {
                                      e.target.onerror = null;
                                      e.target.src = '/images/9daa051ce6458b314a567b7df7c447a2.jpg';
                                    }}
                                  />
                                </div>
                              ))}
                            </div>
                          )}
                        </div>
                        <span className={`block text-[9px] font-semibold text-gray-400 ${isMe ? 'text-right' : ''}`}>
                          {msg.time}
                        </span>
                      </div>
                    </div>
                  );
                })}
              </div>

              {/* Chat Input form */}
              <form onSubmit={handleSendMessage} className="p-4 bg-white border-t border-gray-100 flex items-center gap-3">
                <button type="button" className="p-2 text-gray-400 hover:text-blue-500 rounded-xl transition-colors">
                  <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15.172 7l-6.586 6.586a2 2 0 102.828 2.828l6.414-6.586a4 4 0 00-5.656-5.656l-6.415 6.585a6 6 0 108.486 8.486L20.5 13" /></svg>
                </button>
                <input 
                  type="text" 
                  value={typedMessage}
                  onChange={(e) => setTypedMessage(e.target.value)}
                  placeholder="Tapez votre message ici..." 
                  className="flex-1 bg-gray-50 border border-gray-200 rounded-2xl px-4 py-2.5 text-xs font-semibold outline-none focus:bg-white focus:border-[#2777df] transition-all"
                />
                <button 
                  type="submit" 
                  className="h-10 w-10 rounded-full bg-[#fc4d16] hover:bg-[#e03d0d] text-white flex items-center justify-center shadow-lg shadow-orange-500/20 active:scale-95 transition-all"
                >
                  <svg className="h-5 w-5 rotate-90" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 19l9 2-9-18-9 18 9-2zm0 0v-8" /></svg>
                </button>
              </form>
            </>
          ) : (
            <div className="flex flex-col items-center justify-center flex-1 text-gray-400 font-semibold p-8 text-center">
              <svg className="h-16 w-16 text-gray-300 mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" /></svg>
              Sélectionnez une discussion pour commencer à messager
            </div>
          )}
        </div>

      </div>
    </FeedLayout>
  );
}
