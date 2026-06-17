import React, { useState, useEffect, useRef, useCallback } from 'react';
import { FeedLayout } from '../layouts/SharedLayout';
import { chatAPI, getUser } from '../services/api';

export default function Messages() {
  const currentUser = getUser();
  const [conversations, setConversations] = useState([]);
  const [activeConversationId, setActiveConversationId] = useState(null);
  const [messages, setMessages] = useState([]);
  const [typedMessage, setTypedMessage] = useState('');
  const [loading, setLoading] = useState(true);
  const [loadingMessages, setLoadingMessages] = useState(false);
  const messagesEndRef = useRef(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  const fetchConversations = useCallback(async () => {
    try {
      const res = await chatAPI.getConversations();
      if (res.success) {
        setConversations(res.data);
      }
    } catch (err) {
      console.error('Error fetching conversations:', err);
    } finally {
      setLoading(false);
    }
  }, []);

  const fetchMessages = useCallback(async (id) => {
    if (!id) return;
    setLoadingMessages(true);
    try {
      const res = await chatAPI.getMessages(id);
      if (res.success) {
        setMessages(res.data);
      }
    } catch (err) {
      console.error('Error fetching messages:', err);
    } finally {
      setLoadingMessages(false);
      setTimeout(scrollToBottom, 100);
    }
  }, []);

  useEffect(() => {
    fetchConversations();
    const interval = setInterval(fetchConversations, 10000); // Poll conversations every 10s
    return () => clearInterval(interval);
  }, [fetchConversations]);

  useEffect(() => {
    if (activeConversationId) {
      fetchMessages(activeConversationId);
      const interval = setInterval(() => fetchMessages(activeConversationId), 5000); // Poll messages every 5s
      return () => clearInterval(interval);
    }
  }, [activeConversationId, fetchMessages]);

  const activeConversation = conversations.find(c => c._id === activeConversationId);
  const otherParticipant = activeConversation?.participants.find(p => String(p._id) !== String(currentUser?.id));

  const handleSendMessage = async (e) => {
    e.preventDefault();
    if (!typedMessage.trim() || !activeConversationId) return;

    const textToSend = typedMessage;
    setTypedMessage(''); // Clear input immediately for UX

    try {
      const res = await chatAPI.sendMessage({
        conversationId: activeConversationId,
        text: textToSend
      });
      if (res.success) {
        setMessages(prev => [...prev, res.data]);
        fetchConversations(); // Update last message in sidebar
        setTimeout(scrollToBottom, 50);
      }
    } catch (err) {
      console.error('Error sending message:', err);
      alert('Erreur lors de l\'envoi du message');
    }
  };

  const formatTime = (dateStr) => {
    const date = new Date(dateStr);
    const now = new Date();
    const isToday = date.toDateString() === now.toDateString();
    
    if (isToday) {
      return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
    } else {
      const diffDays = Math.floor((now - date) / (1000 * 60 * 60 * 24));
      if (diffDays === 1) return 'Hier';
      if (diffDays < 7) return date.toLocaleDateString([], { weekday: 'short' });
      return date.toLocaleDateString([], { day: 'numeric', month: 'short' });
    }
  };

  const getInitials = (name) => {
    return name?.split(' ').map(n => n[0]).join('').substring(0, 2).toUpperCase() || '?';
  };

  return (
    <FeedLayout active="Mes contacts" title="Messages">
      <div className="bg-white rounded-3xl border border-gray-100 shadow-sm overflow-hidden h-[850px] flex">
        
        {/* Contacts Sidebar List (Left Panel) */}
        <div className="w-full md:w-80 border-r border-gray-100 flex flex-col flex-shrink-0 bg-white">
          <div className="p-4 border-b border-gray-100">
            <div className="relative">
              <svg className="absolute left-3.5 top-3 h-4 w-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
              </svg>
              <input 
                type="text" 
                placeholder="Rechercher un contact..." 
                className="w-full pl-10 pr-4 py-2.5 bg-slate-50 border border-gray-200 rounded-2xl text-xs font-semibold outline-none focus:border-[#2777df] focus:bg-white transition-all"
              />
            </div>
          </div>

          <div className="flex-1 overflow-y-auto divide-y divide-gray-50">
            {loading ? (
              <div className="p-8 text-center text-gray-400 text-xs font-bold">Chargement...</div>
            ) : conversations.length === 0 ? (
              <div className="p-8 text-center text-gray-400 text-xs font-bold">Aucune conversation</div>
            ) : conversations.map(c => {
              const other = c.participants.find(p => String(p._id) !== String(currentUser?.id));
              const isActive = c._id === activeConversationId;
              const unread = c.unreadCounts?.[currentUser?.id] || 0;
              
              return (
                <button 
                  key={c._id} 
                  onClick={() => setActiveConversationId(c._id)}
                  className={`w-full p-4 flex gap-3 text-left transition-colors relative hover:bg-gray-50
                    ${isActive ? 'bg-blue-50/50 border-l-4 border-[#2777df]' : ''}`}
                >
                  <div className="h-12 w-12 rounded-full bg-gradient-to-br from-[#2777df] to-[#fc4d16] text-white flex items-center justify-center font-black text-sm shadow-inner flex-shrink-0 overflow-hidden">
                    {other?.avatar ? <img src={other.avatar} className="h-full w-full object-cover" alt="" /> : getInitials(other?.name)}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between">
                      <h4 className="text-[13px] font-black text-gray-900 truncate">{other?.name || 'Utilisateur'}</h4>
                      <span className="text-[10px] font-bold text-gray-400">
                        {c.lastMessage?.createdAt ? formatTime(c.lastMessage.createdAt) : ''}
                      </span>
                    </div>
                    <span className="text-[10px] font-semibold text-[#2777df] block mb-0.5">{other?.phone || ''}</span>
                    <p className="text-[11px] text-gray-400 truncate leading-snug">
                      {String(c.lastMessage?.sender) === String(currentUser?.id) ? 'Moi: ' : ''}
                      {c.lastMessage?.text || 'Commencer une discussion'}
                    </p>
                  </div>

                  {unread > 0 && (
                    <span className="absolute right-4 bottom-4 h-5 w-5 bg-[#fc4d16] text-white rounded-full text-[10px] font-black flex items-center justify-center shadow-sm">
                      {unread}
                    </span>
                  )}
                </button>
              );
            })}
          </div>
        </div>

        {/* Chat Window Details (Right Panel) */}
        <div className="hidden md:flex flex-col flex-1 bg-white">
          {activeConversationId ? (
            <>
              {/* Header info */}
              <div className="p-4 bg-white border-b border-gray-100 flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="h-10 w-10 rounded-full bg-blue-100 text-[#2777df] font-black text-xs flex items-center justify-center overflow-hidden">
                    {otherParticipant?.avatar ? <img src={otherParticipant.avatar} className="h-full w-full object-cover" alt="" /> : getInitials(otherParticipant?.name)}
                  </div>
                  <div>
                    <h3 className="text-sm font-black text-gray-900">{otherParticipant?.name}</h3>
                    <p className="text-[10px] font-semibold text-[#2777df]">{otherParticipant?.phone}</p>
                  </div>
                </div>

                <div className="flex items-center gap-2">
                  <button className="p-2 text-gray-400 hover:text-gray-600 rounded-xl hover:bg-gray-100 transition-colors">
                    <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 5a2 2 0 012-2h3.28a1 1 0 01.94.725l.548 2.2a1 1 0 01-.321.988l-1.305.98a10.582 10.582 0 004.872 4.872l.98-1.305a1 1 0 01.988-.321l2.2.548a1 1 0 01.725.94V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" />
                    </svg>
                  </button>
                  <button className="p-2 text-gray-400 hover:text-red-500 rounded-xl hover:bg-red-50 transition-colors">
                    <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                    </svg>
                  </button>
                </div>
              </div>

              {/* Message scroll container */}
              <div className="flex-1 overflow-y-auto p-6 space-y-6 bg-slate-50/30">
                {loadingMessages && messages.length === 0 ? (
                  <div className="text-center py-10 text-gray-400 text-xs font-bold uppercase tracking-widest">Chargement des messages...</div>
                ) : messages.length === 0 ? (
                  <div className="text-center py-10 text-gray-400 text-xs font-bold">Dites bonjour à {otherParticipant?.name} !</div>
                ) : messages.map(msg => {
                  const isMe = String(msg.sender?._id || msg.sender) === String(currentUser?.id);
                  return (
                    <div key={msg._id} className={`flex gap-3 max-w-[85%] ${isMe ? 'ml-auto flex-row-reverse' : ''}`}>
                      <div className={`h-8 w-8 rounded-full text-[10px] font-black flex items-center justify-center flex-shrink-0 shadow-sm overflow-hidden
                        ${isMe ? 'bg-orange-100 text-[#fc4d16]' : 'bg-blue-100 text-[#2777df]'}`}>
                        {isMe ? (currentUser?.avatar ? <img src={currentUser.avatar} className="h-full w-full object-cover" /> : getInitials(currentUser?.name)) : (otherParticipant?.avatar ? <img src={otherParticipant.avatar} className="h-full w-full object-cover" /> : getInitials(otherParticipant?.name))}
                      </div>

                      <div className="space-y-1.5">
                        <div className={`rounded-3xl p-4 text-[12px] leading-relaxed shadow-sm
                          ${isMe ? 'bg-[#2777df] text-white rounded-tr-none' : 'bg-white text-gray-800 rounded-tl-none border border-gray-100'}`}>
                          {msg.text}

                          {/* Render Attachments */}
                          {msg.attachments && msg.attachments.length > 0 && (
                            <div className="flex gap-2 mt-4 pt-4 border-t border-gray-100/50">
                              {msg.attachments.map((img, i) => (
                                <div key={i} className="h-20 w-20 bg-white border border-gray-200 rounded-2xl overflow-hidden p-1 flex items-center justify-center shadow-sm">
                                  <img 
                                    src={img} 
                                    className="max-h-full max-w-full object-cover rounded-xl" 
                                    alt="Pièce jointe"
                                  />
                                </div>
                              ))}
                            </div>
                          )}
                        </div>
                        <span className={`block text-[10px] font-bold text-gray-400 ${isMe ? 'text-right' : ''}`}>
                          {formatTime(msg.createdAt)}
                        </span>
                      </div>
                    </div>
                  );
                })}
                <div ref={messagesEndRef} />
              </div>

              {/* Chat Input form */}
              <form onSubmit={handleSendMessage} className="p-4 bg-white border-t border-gray-100 flex items-center gap-3">
                <button type="button" className="p-2 text-gray-400 hover:text-[#2777df] rounded-xl transition-colors">
                  <svg className="h-6 w-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15.172 7l-6.586 6.586a2 2 0 102.828 2.828l6.414-6.586a4 4 0 00-5.656-5.656l-6.415 6.585a6 6 0 108.486 8.486L20.5 13" />
                  </svg>
                </button>
                <input 
                  type="text" 
                  value={typedMessage}
                  onChange={(e) => setTypedMessage(e.target.value)}
                  placeholder="Tapez votre message ici..." 
                  className="flex-1 bg-slate-50 border border-gray-200 rounded-2xl px-5 py-3 text-xs font-semibold outline-none focus:bg-white focus:border-[#2777df] transition-all"
                />
                <button 
                  type="submit" 
                  disabled={!typedMessage.trim()}
                  className="h-11 w-11 rounded-full bg-[#fc4d16] hover:bg-[#e03d0d] disabled:bg-gray-200 text-white flex items-center justify-center shadow-lg shadow-orange-500/30 active:scale-95 transition-all flex-shrink-0"
                >
                  <svg className="h-6 w-6 rotate-90" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 19l9 2-9-18-9 18 9-2zm0 0v-8" />
                  </svg>
                </button>
              </form>
            </>
          ) : (
            <div className="flex flex-col items-center justify-center flex-1 text-gray-400 font-semibold p-8 text-center bg-slate-50/10">
              <div className="h-20 w-20 bg-blue-50 text-[#2777df] rounded-full flex items-center justify-center mb-6">
                <svg className="h-10 w-10" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
                </svg>
              </div>
              <h3 className="text-gray-900 font-black mb-1">Vos messages</h3>
              <p className="text-xs text-gray-400">Sélectionnez une discussion pour commencer à messager</p>
            </div>
          )}
        </div>

      </div>
    </FeedLayout>
  );
}
