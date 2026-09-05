import React, { useState } from 'react';
import { useApp } from '../context/AppContext';
import { useAuth } from '../context/AuthContext';
import { 
  Send, 
  Phone, 
  MessageSquare, 
  MapPin, 
  Check, 
  Clock, 
  ChevronLeft,
  Search
} from 'lucide-react';

export const MessagingView: React.FC = () => {
  const { 
    conversations, 
    activeConversationId, 
    setActiveConversationId, 
    sendMessage,
    setSelectedProperty,
    t
  } = useApp();
  const { userProfile } = useAuth();

  const [inputMessage, setInputMessage] = useState('');
  const [searchQuery, setSearchQuery] = useState('');

  const activeConv = conversations.find(c => c.id === activeConversationId) || conversations[0];

  const handleSend = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!inputMessage.trim() || !activeConv) return;

    await sendMessage(activeConv.id, inputMessage.trim());
    setInputMessage('');
  };

  const filteredConversations = conversations.filter(c => 
    c.propertyTitle.toLowerCase().includes(searchQuery.toLowerCase()) ||
    c.participantNames[0]?.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="max-w-6xl mx-auto px-4 sm:px-6 py-6 h-[calc(100vh-160px)] min-h-[550px] flex flex-col">
      
      {/* Header */}
      <div className="mb-4 flex items-center justify-between">
        <div>
          <h1 className="font-serif text-2xl font-medium text-white flex items-center gap-2.5">
            <MessageSquare className="w-6 h-6 text-[#c5a36c]" />
            <span>{t('messagingTitle')}</span>
          </h1>
          <p className="text-xs text-[#888888] mt-0.5">Échangez directement et en toute sécurité avec les propriétaires et agences</p>
        </div>
      </div>

      <div className="flex-1 bg-[#0f0f0f] rounded-3xl border border-white/10 shadow-2xl overflow-hidden flex flex-col md:flex-row">
        
        {/* Left: Conversation List */}
        <div className={`w-full md:w-80 lg:w-96 border-r rtl:border-r-0 rtl:border-l border-white/10 bg-[#0f0f0f] flex flex-col ${
          activeConversationId ? 'hidden md:flex' : 'flex'
        }`}>
          {/* Search inbox */}
          <div className="p-3 border-b border-white/10">
            <div className="relative">
              <Search className="w-4 h-4 text-[#777777] absolute left-3 top-2.5" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Rechercher une conversation..."
                className="w-full pl-9 pr-3 py-2 text-xs rounded-xl border border-white/10 bg-[#161616] text-white placeholder-[#666666] focus:border-[#c5a36c]/60"
              />
            </div>
          </div>

          {/* List items */}
          <div className="flex-1 overflow-y-auto divide-y divide-white/[0.06]">
            {filteredConversations.length === 0 ? (
              <div className="p-8 text-center text-xs text-[#777777]">
                {t('noConversations')}
              </div>
            ) : (
              filteredConversations.map((conv) => {
                const isActive = conv.id === activeConv?.id;
                const otherUserName = conv.participantNames.find(n => n !== userProfile?.displayName) || conv.participantNames[0];

                return (
                  <div
                    key={conv.id}
                    onClick={() => setActiveConversationId(conv.id)}
                    className={`p-3.5 flex items-start gap-3 cursor-pointer transition-colors ${
                      isActive
                        ? 'bg-[#181818] border-l-4 rtl:border-l-0 rtl:border-r-4 border-[#c5a36c]'
                        : 'hover:bg-[#141414]'
                    }`}
                  >
                    <img 
                      src={conv.propertyImage || 'https://images.unsplash.com/photo-1600585154340-be6161a56a0c?auto=format&fit=crop&w=120&q=80'} 
                      alt="" 
                      className="w-12 h-12 rounded-xl object-cover shrink-0 border border-white/10"
                    />

                    <div className="flex-1 min-w-0">
                      <div className="flex items-center justify-between mb-0.5">
                        <h4 className="text-xs font-bold text-white truncate">
                          {otherUserName}
                        </h4>
                        <span className="text-[10px] text-[#777777]">
                          {conv.unreadCount > 0 ? (
                            <span className="w-2 h-2 rounded-full bg-[#c5a36c] inline-block" />
                          ) : 'Actif'}
                        </span>
                      </div>
                      <p className="text-xs font-semibold text-[#c5a36c] truncate">
                        {conv.propertyTitle}
                      </p>
                      <p className="text-[11px] text-[#999999] truncate mt-0.5">
                        {conv.lastMessage || 'Nouvelle conversation'}
                      </p>
                    </div>
                  </div>
                );
              })
            )}
          </div>
        </div>

        {/* Right: Active Chat Area */}
        {activeConv ? (
          <div className="flex-1 flex flex-col bg-[#0a0a0a]">
            
            {/* Chat Header */}
            <div className="p-3 sm:p-4 bg-[#0f0f0f] border-b border-white/10 flex items-center justify-between">
              <div className="flex items-center gap-2.5">
                <button
                  onClick={() => setActiveConversationId(null)}
                  className="md:hidden p-1 text-[#888888] hover:text-white"
                >
                  <ChevronLeft className="w-5 h-5" />
                </button>
                <img 
                  src={activeConv.propertyImage || 'https://images.unsplash.com/photo-1600585154340-be6161a56a0c?auto=format&fit=crop&w=120&q=80'} 
                  alt="" 
                  className="w-10 h-10 rounded-xl object-cover shrink-0 border border-white/10"
                />
                <div>
                  <h3 className="font-serif text-xs sm:text-sm font-medium text-white truncate max-w-[200px] sm:max-w-xs">
                    {activeConv.propertyTitle}
                  </h3>
                  <p className="text-[11px] text-[#888888]">
                    Interlocuteur : {activeConv.participantNames.find(n => n !== userProfile?.displayName) || activeConv.participantNames[0]}
                  </p>
                </div>
              </div>

              {/* Quick Action: Call */}
              <div className="flex items-center gap-1.5">
                <a
                  href="tel:+213555123456"
                  className="p-2 rounded-xl bg-[#181818] hover:bg-[#222222] border border-white/10 text-white transition-colors"
                  title="Appeler directement"
                >
                  <Phone className="w-4 h-4 text-[#c5a36c]" />
                </a>
              </div>
            </div>

            {/* Messages Stream */}
            <div className="flex-1 overflow-y-auto p-4 space-y-3">
              {activeConv.messages.map((msg) => {
                const isMe = msg.senderId === (userProfile?.uid || 'user-default');

                return (
                  <div
                    key={msg.id}
                    className={`flex flex-col ${isMe ? 'items-end' : 'items-start'}`}
                  >
                    <div className={`max-w-[75%] sm:max-w-md p-3.5 rounded-2xl text-xs leading-relaxed ${
                      isMe 
                        ? 'bg-[#c5a36c] text-[#0a0a0a] font-medium rounded-tr-xs shadow-md' 
                        : 'bg-[#161616] text-[#e5e5e5] border border-white/10 rounded-tl-xs shadow-md'
                    }`}>
                      <p className="whitespace-pre-line">{msg.text}</p>
                    </div>
                    <span className="text-[10px] text-[#777777] mt-1 px-1 flex items-center gap-1">
                      <span>{new Date(msg.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</span>
                      {isMe && <Check className="w-3 h-3 text-[#0a0a0a]" />}
                    </span>
                  </div>
                );
              })}
            </div>

            {/* Input Bar */}
            <form onSubmit={handleSend} className="p-3 bg-[#0f0f0f] border-t border-white/10 flex items-center gap-2">
              <input
                type="text"
                value={inputMessage}
                onChange={(e) => setInputMessage(e.target.value)}
                placeholder={t('typeMessagePlaceholder')}
                className="flex-1 p-2.5 rounded-xl border border-white/10 bg-[#161616] text-white placeholder-[#666666] text-xs focus:border-[#c5a36c]/60"
              />
              <button
                type="submit"
                className="p-2.5 rounded-xl bg-[#c5a36c] hover:bg-[#d4b57e] text-[#0a0a0a] font-bold transition-all shadow-md cursor-pointer"
              >
                <Send className="w-4 h-4" />
              </button>
            </form>

          </div>
        ) : (
          <div className="flex-1 flex items-center justify-center p-8 text-center text-[#777777]">
            <div>
              <MessageSquare className="w-12 h-12 text-[#444444] mx-auto mb-2" />
              <p className="text-sm font-semibold">{t('selectConversation')}</p>
            </div>
          </div>
        )}

      </div>

    </div>
  );
};
