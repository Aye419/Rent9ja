import React, { useState, useRef, useEffect } from 'react';
import { MessageSquare, Sparkles, X, Send, Loader2, Bot, HelpCircle } from 'lucide-react';

interface ChatMessage {
  id: string;
  sender: 'user' | 'bot';
  text: string;
  timestamp: string;
}

interface ChatbotProps {
  propertyId?: string;
}

export default function Chatbot({ propertyId }: ChatbotProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [message, setMessage] = useState('');
  const [chatHistory, setChatHistory] = useState<ChatMessage[]>([
    {
      id: 'welcome',
      sender: 'bot',
      text: "Welcome! I am **NaijaProp AI**, your expert Nigerian Real Estate advisor on RentNaija.\n\nAsk me anything about: \n*   Average rent prices in Lagos or Abuja 🏢\n*   How to use our Rent Affordability calculator 📊\n*   Land document titles like **C of O** and **Deed of Assignment** 📜",
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
    }
  ]);
  const [isLoading, setIsLoading] = useState(false);
  const chatEndRef = useRef<HTMLDivElement>(null);

  const suggestedQuestions = [
    'What is average rent in Lekki?',
    'What documents are needed to buy land?',
    'How do I calculate rent affordability?',
    'Explain Caution and Agency Fees'
  ];

  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [chatHistory, isOpen]);

  const handleSendMessage = async (textToSend: string) => {
    if (!textToSend.trim() || isLoading) return;

    const userMsg: ChatMessage = {
      id: `usr-${Date.now()}`,
      sender: 'user',
      text: textToSend,
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
    };

    setChatHistory(prev => [...prev, userMsg]);
    setMessage('');
    setIsLoading(true);

    try {
      // Compile history formatted for Express API
      const historyPayload = chatHistory.slice(-5).map(m => ({
        sender: m.sender === 'user' ? 'user' : 'model',
        text: m.text
      }));

      const res = await fetch('/api/ai/chat', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          message: textToSend,
          history: historyPayload,
          propertyId
        })
      });

      if (!res.ok) {
        throw new Error('API request failed');
      }

      const data = await res.json();
      
      const botMsg: ChatMessage = {
        id: `bot-${Date.now()}`,
        sender: 'bot',
        text: data.text,
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
      };
      
      setChatHistory(prev => [...prev, botMsg]);
    } catch (err) {
      console.error('Chat error:', err);
      // Fallback
      const fallbackMsg: ChatMessage = {
        id: `bot-${Date.now()}`,
        sender: 'bot',
        text: "Ah, I apologize! I encountered a connection issue. Please make sure your network is stable or retry in a bit. \n\nI can still answer general real estate questions if you type again!",
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
      };
      setChatHistory(prev => [...prev, fallbackMsg]);
    } finally {
      setIsLoading(false);
    }
  };

  const handleQuickQuestionClick = (q: string) => {
    handleSendMessage(q);
  };

  // Safe and super clean Markdown Parser using React elements to avoid third party dependencies
  const renderFormattedText = (raw: string) => {
    const lines = raw.split('\n');
    return lines.map((line, lineIdx) => {
      let content: React.ReactNode = line;
      
      // Check for bullet list item
      let isBullet = false;
      if (line.trim().startsWith('* ') || line.trim().startsWith('- ')) {
        isBullet = true;
        content = line.trim().substring(2);
      }

      // Check for bold notation **
      if (typeof content === 'string') {
        const parts = content.split('**');
        if (parts.length > 1) {
          content = parts.map((part, idx) => {
            if (idx % 2 === 1) {
              return <strong key={idx} className="font-bold text-emerald-800">{part}</strong>;
            }
            return part;
          });
        }
      }

      // Check for headers like ###
      if (line.startsWith('### ')) {
        return (
          <h4 key={lineIdx} className="font-display font-bold text-sm text-emerald-700 mt-2 mb-1">
            {line.substring(4)}
          </h4>
        );
      }

      if (isBullet) {
        return (
          <li key={lineIdx} className="ml-4 list-disc text-xs text-slate-600 mb-1 leading-relaxed">
            {content}
          </li>
        );
      }

      return (
        <p key={lineIdx} className="text-xs text-slate-600 leading-relaxed mb-1.5 font-light">
          {content}
        </p>
      );
    });
  };

  return (
    <div id="ai-chatbot-wrapper" className="fixed bottom-20 right-4 sm:bottom-6 sm:right-6 z-50">
      
      {/* Floating Launcher Action Icon */}
      {!isOpen && (
        <button
          id="chatbot-launcher-btn"
          onClick={() => setIsOpen(true)}
          className="h-14 w-14 rounded-full bg-slate-900 text-white shadow-2xl hover:bg-emerald-600 active:scale-95 transition-all flex items-center justify-center relative cursor-pointer"
        >
          <Bot className="h-6 w-6 animate-pulse" />
          <span className="absolute -top-1 -right-1 flex h-3 w-3">
            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
            <span className="relative inline-flex rounded-full h-3 w-3 bg-emerald-500"></span>
          </span>
        </button>
      )}

      {/* Main Drawer Container */}
      {isOpen && (
        <div id="chatbot-drawer" className="w-[320px] sm:w-[380px] h-[480px] bg-white rounded-2xl shadow-2xl border border-slate-100 flex flex-col overflow-hidden animate-in fade-in slide-in-from-bottom-6 duration-300">
          
          {/* Header Panel */}
          <div className="bg-slate-900 text-white p-4 flex items-center justify-between">
            <div className="flex items-center space-x-2">
              <div className="bg-emerald-600 p-1.5 rounded-lg flex items-center justify-center">
                <Sparkles className="h-4 w-4 text-white animate-spin-slow" />
              </div>
              <div>
                <h3 className="font-display font-bold text-xs">NaijaProp AI Advisor</h3>
                <p className="text-[9px] text-emerald-400 font-bold uppercase tracking-wider flex items-center gap-1">● Real-time AI online</p>
              </div>
            </div>
            <button
              onClick={() => setIsOpen(false)}
              className="text-slate-400 hover:text-white transition-colors cursor-pointer"
            >
              <X className="h-4 w-4" />
            </button>
          </div>

          {/* Messages Log Scroller */}
          <div className="flex-1 overflow-y-auto p-4 space-y-4 bg-slate-50">
            {chatHistory.map((m) => (
              <div
                key={m.id}
                className={`flex ${m.sender === 'user' ? 'justify-end' : 'justify-start'}`}
              >
                <div
                  className={`max-w-[85%] rounded-2xl p-3 shadow-sm ${
                    m.sender === 'user'
                      ? 'bg-slate-900 text-white rounded-tr-none'
                      : 'bg-white text-slate-800 rounded-tl-none border border-slate-100'
                  }`}
                >
                  <div className="space-y-1">
                    {m.sender === 'user' ? (
                      <p className="text-xs leading-relaxed font-light">{m.text}</p>
                    ) : (
                      renderFormattedText(m.text)
                    )}
                    <span className={`text-[8px] block text-right mt-1 ${
                      m.sender === 'user' ? 'text-slate-400' : 'text-slate-400'
                    }`}>
                      {m.timestamp}
                    </span>
                  </div>
                </div>
              </div>
            ))}
            
            {isLoading && (
              <div className="flex justify-start">
                <div className="bg-white rounded-2xl p-3 border border-slate-100 flex items-center space-x-2 shadow-sm rounded-tl-none">
                  <Loader2 className="h-4 w-4 animate-spin text-emerald-600" />
                  <span className="text-[10px] text-slate-400 font-medium">NaijaProp is drafting advice...</span>
                </div>
              </div>
            )}
            <div ref={chatEndRef} />
          </div>

          {/* Quick Suggestions Drawer */}
          {chatHistory.length < 3 && !isLoading && (
            <div className="px-4 py-2 bg-white border-t border-slate-100">
              <p className="text-[9px] font-bold text-slate-400 uppercase tracking-wider mb-2 flex items-center gap-1">
                <HelpCircle className="h-3 w-3 text-slate-400" /> Suggested questions
              </p>
              <div className="flex flex-wrap gap-1.5">
                {suggestedQuestions.map((q, idx) => (
                  <button
                    key={idx}
                    onClick={() => handleQuickQuestionClick(q)}
                    className="text-[10px] bg-slate-50 hover:bg-emerald-50 border border-slate-200 text-slate-700 hover:text-emerald-700 hover:border-emerald-200 px-2.5 py-1 rounded-full cursor-pointer transition-all"
                  >
                    {q}
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* Chat Form Footer */}
          <form
            onSubmit={(e) => {
              e.preventDefault();
              handleSendMessage(message);
            }}
            className="p-3 bg-white border-t border-slate-100 flex items-center space-x-2"
          >
            <input
              type="text"
              value={message}
              onChange={(e) => setMessage(e.target.value)}
              placeholder="Ask about Lekki rent, C of O, or pricing..."
              className="flex-1 bg-slate-50 border border-slate-200 rounded-xl px-3 h-10 text-xs text-slate-800 focus:outline-none focus:ring-2 focus:ring-emerald-500"
            />
            <button
              type="submit"
              disabled={!message.trim() || isLoading}
              className="h-10 w-10 bg-emerald-600 hover:bg-emerald-700 disabled:opacity-40 text-white rounded-xl flex items-center justify-center shadow-md transition-all cursor-pointer"
            >
              <Send className="h-4 w-4" />
            </button>
          </form>

        </div>
      )}

    </div>
  );
}
