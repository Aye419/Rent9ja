import React, { useState, useEffect, useRef } from 'react';
import { MessageSquare, Send, User, MapPin, Loader2, Sparkles, AlertCircle } from 'lucide-react';
import { Message, UserProfile, Property } from '../types';

interface MessagesInboxProps {
  currentUser: UserProfile | null;
  messages: Message[];
  properties: Property[];
  onSendMessage: (listingId: string, agentId: string, content: string) => void;
  onSelectTab: (tab: 'home' | 'dashboard' | 'messages') => void;
  onOpenLogin: () => void;
}

export default function MessagesInbox({
  currentUser,
  messages,
  properties,
  onSendMessage,
  onSelectTab,
  onOpenLogin
}: MessagesInboxProps) {
  const [activeChannelIdx, setActiveChannelIdx] = useState<number>(0);
  const [replyText, setReplyText] = useState('');
  const [isReplying, setIsReplying] = useState(false);
  const messageLogRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    messageLogRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, activeChannelIdx]);

  if (!currentUser) {
    return (
      <div id="inbox-unauth" className="max-w-md mx-auto px-4 py-16 text-center space-y-4">
        <MessageSquare className="h-12 w-12 text-slate-300 mx-auto" />
        <h2 className="text-lg font-bold font-display text-slate-800">Please Log In to View Inbox</h2>
        <p className="text-xs text-slate-500 font-light">Your direct conversations, inspection schedules, and rent negotiations are safely saved.</p>
        <button
          onClick={onOpenLogin}
          className="px-6 py-2 bg-emerald-600 hover:bg-emerald-700 text-white font-bold rounded-xl text-xs cursor-pointer"
        >
          Sign In
        </button>
      </div>
    );
  }

  // Group messages into channels by listing ID and either user ID or agent ID
  // In a real database we have channels, let's group dynamically by listingId.
  const channelsMap: { [key: string]: { property: Property; channelMessages: Message[] } } = {};
  
  messages.forEach(msg => {
    const prop = properties.find(p => p.id === msg.listingId);
    if (prop) {
      if (!channelsMap[msg.listingId]) {
        channelsMap[msg.listingId] = {
          property: prop,
          channelMessages: []
        };
      }
      channelsMap[msg.listingId].channelMessages.push(msg);
    }
  });

  const channelsList = Object.values(channelsMap);

  if (channelsList.length === 0) {
    return (
      <div id="inbox-empty" className="max-w-md mx-auto px-4 py-16 text-center space-y-3">
        <MessageSquare className="h-12 w-12 text-slate-300 mx-auto" />
        <h2 className="text-sm font-bold font-display text-slate-800">Your Inbox is Empty</h2>
        <p className="text-xs text-slate-400 font-light leading-relaxed">
          Start browsing the properties catalogue. When you submit a direct inquiry, schedule an inspection, or ask a question, the conversation channels will list here.
        </p>
        <button
          onClick={() => onSelectTab('home')}
          className="px-4 py-2 bg-emerald-600 text-white text-xs font-bold rounded-lg cursor-pointer"
        >
          Browse Verified Listings
        </button>
      </div>
    );
  }

  // Ensure selected index remains in bounds
  const currentIdx = activeChannelIdx < channelsList.length ? activeChannelIdx : 0;
  const currentChannel = channelsList[currentIdx];
  const currentProp = currentChannel.property;
  const currentChatLogs = currentChannel.channelMessages.sort((a,b) => new Date(a.timestamp).getTime() - new Date(b.timestamp).getTime());

  const handleReplySubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!replyText.trim() || isReplying) return;

    setIsReplying(true);
    const content = replyText;
    setReplyText('');

    // Send via API
    onSendMessage(currentProp.id, currentProp.agent.id, content);
    
    // Simulate real-time response from agent after 1.5 seconds!
    setTimeout(() => {
      setIsReplying(false);
    }, 1500);
  };

  const formatPrice = (price: number) => {
    return new Intl.NumberFormat('en-NG', {
      style: 'currency',
      currency: 'NGN',
      maximumFractionDigits: 0
    }).format(price);
  };

  return (
    <div id="messages-inbox-root" className="max-w-6xl mx-auto px-4 py-6">
      
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 bg-white rounded-3xl border border-slate-100 overflow-hidden shadow-xl h-[600px]">
        
        {/* Left Side: Conversation channels lists */}
        <div className="md:col-span-1 border-r border-slate-100 flex flex-col h-full bg-slate-50/50">
          <div className="p-4 border-b border-slate-100 bg-white">
            <h3 className="font-display font-bold text-sm text-slate-900">Your Negotiations ({channelsList.length})</h3>
            <p className="text-[10px] text-slate-400 font-light">Direct threads with property owners.</p>
          </div>

          <div className="flex-1 overflow-y-auto divide-y divide-slate-100">
            {channelsList.map((ch, idx) => {
              const lastMsg = ch.channelMessages[ch.channelMessages.length - 1];
              return (
                <button
                  key={idx}
                  onClick={() => setActiveChannelIdx(idx)}
                  className={`w-full p-4 text-left flex items-start space-x-3 transition-colors cursor-pointer ${
                    currentIdx === idx ? 'bg-white border-l-4 border-emerald-600' : 'hover:bg-slate-50'
                  }`}
                >
                  <img
                    src={ch.property.images[0]}
                    alt=""
                    className="h-10 w-10 rounded object-cover shrink-0"
                    referrerPolicy="no-referrer"
                  />
                  <div className="flex-1 min-w-0">
                    <h4 className="text-xs font-bold text-slate-800 truncate">{ch.property.title}</h4>
                    <p className="text-[10px] text-emerald-600 font-bold mt-0.5">{ch.property.agent.name}</p>
                    {lastMsg && (
                      <p className="text-[10px] text-slate-400 truncate mt-1 font-light">&quot;{lastMsg.content}&quot;</p>
                    )}
                  </div>
                </button>
              );
            })}
          </div>
        </div>

        {/* Right Side: Active Chat threads */}
        <div className="md:col-span-2 flex flex-col h-full bg-white">
          
          {/* Header Panel detailing the Property info */}
          <div className="p-4 border-b border-slate-100 bg-white flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <img
                src={currentProp.images[0]}
                alt=""
                className="h-11 w-11 rounded-lg object-cover"
                referrerPolicy="no-referrer"
              />
              <div>
                <h4 className="text-xs font-bold text-slate-800 line-clamp-1">{currentProp.title}</h4>
                <div className="flex items-center space-x-1.5 text-[10px] text-slate-400 font-light mt-0.5">
                  <span className="font-bold text-emerald-600">{formatPrice(currentProp.price)}</span>
                  <span>•</span>
                  <span>Agent: {currentProp.agent.name}</span>
                </div>
              </div>
            </div>

            <button
              onClick={() => onSelectTab('home')}
              className="text-emerald-600 hover:text-emerald-800 text-[10px] font-bold underline cursor-pointer"
            >
              Details
            </button>
          </div>

          {/* Active messages log container */}
          <div className="flex-1 overflow-y-auto p-4 bg-slate-50 space-y-4">
            {currentChatLogs.map((msg, i) => {
              const isMe = msg.senderId === currentUser.id;
              return (
                <div
                  key={msg.id || i}
                  className={`flex ${isMe ? 'justify-end' : 'justify-start'}`}
                >
                  <div
                    className={`max-w-[75%] rounded-2xl p-3 shadow-sm ${
                      isMe 
                        ? 'bg-slate-900 text-white rounded-tr-none' 
                        : 'bg-white text-slate-800 rounded-tl-none border border-slate-100'
                    }`}
                  >
                    <p className="text-xs font-light leading-relaxed whitespace-pre-line">{msg.content}</p>
                    <span className="text-[8px] block text-right text-slate-400 mt-1">
                      {new Date(msg.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                    </span>
                  </div>
                </div>
              );
            })}
            
            {isReplying && (
              <div className="flex justify-start">
                <div className="bg-white rounded-2xl p-3 border border-slate-100 flex items-center space-x-2 shadow-sm rounded-tl-none">
                  <Loader2 className="h-4 w-4 animate-spin text-emerald-600" />
                  <span className="text-[10px] text-slate-400 font-medium">{currentProp.agent.name} is typing...</span>
                </div>
              </div>
            )}
            <div ref={messageLogRef} />
          </div>

          {/* Bottom Chat Editor Footer Form */}
          <form
            onSubmit={handleReplySubmit}
            className="p-3 bg-white border-t border-slate-100 flex items-center space-x-2"
          >
            <input
              required
              type="text"
              value={replyText}
              onChange={(e) => setReplyText(e.target.value)}
              placeholder={`Send message to ${currentProp.agent.name}...`}
              className="flex-1 bg-slate-50 border border-slate-200 rounded-xl px-3 h-10 text-xs text-slate-800 focus:outline-none focus:ring-2 focus:ring-emerald-500"
            />
            <button
              type="submit"
              disabled={!replyText.trim() || isReplying}
              className="h-10 w-10 bg-emerald-600 hover:bg-emerald-700 disabled:opacity-40 text-white rounded-xl flex items-center justify-center shadow-md transition-all cursor-pointer"
            >
              <Send className="h-4 w-4" />
            </button>
          </form>

        </div>

      </div>

    </div>
  );
}
