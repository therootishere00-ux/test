"use client";

import { useEffect, useRef, useState, useMemo } from "react";
import { ChatThread, type ChatMessage } from "@/components/chat-thread";
import { MenuDrawer, type ChatSession } from "@/components/menu-drawer";
import { motion, AnimatePresence } from "framer-motion";
import StartBoard from "../planner/start-board";

const PromptRow = ({ items, direction, speed, onPick }: any) => {
  const scrollClass = direction === 'left' ? 'animate-marquee-left' : 'animate-marquee-right';
  return (
    <div className="flex overflow-hidden py-1 select-none w-full">
      <div className={`flex shrink-0 items-center gap-2 ${scrollClass}`} style={{ animationDuration: speed }}>
        {[...items, ...items].map((item: string, idx: number) => (
          <button 
            key={idx} 
            onClick={() => onPick(item)}
            className="whitespace-nowrap rounded-lg border border-white/5 bg-transparent px-3 py-1.5 text-[13px] text-[#9A9894] transition-transform duration-200 active:scale-95"
          >
            {item}
          </button>
        ))}
      </div>
    </div>
  );
};

export function StartScreen() {
  const [message, setMessage] = useState("");
  const [chatStarted, setChatStarted] = useState(false);
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [isPlannerOpen, setIsPlannerOpen] = useState(false);
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [tgUser, setTgUser] = useState<any>(null);
  
  const abortCtrl = useRef<AbortController | null>(null);

  // TMA: Инициализация и получение данных пользователя
  useEffect(() => {
    if (typeof window !== "undefined" && (window as any).Telegram?.WebApp) {
      const webapp = (window as any).Telegram.WebApp; // Добавлено (window as any) для фикса ошибки билда
      webapp.ready();
      webapp.expand();
      webapp.setHeaderColor('#252422'); 
      if (webapp.initDataUnsafe?.user) {
        setTgUser(webapp.initDataUnsafe.user);
      }
    }
  }, []);

  const fetchAI = async (currentMessages: ChatMessage[]) => {
    abortCtrl.current = new AbortController();
    
    try {
      const res = await fetch('/api/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ 
          messages: currentMessages.map(m => ({ role: m.role, content: m.content })) 
        }),
        signal: abortCtrl.current.signal
      });

      if (!res.ok) {
        const errData = await res.json();
        throw new Error(errData.error || res.status.toString());
      }

      const data = await res.json();
      
      setMessages(prev => {
        const last = prev[prev.length - 1];
        if (last && last.isPlaceholder) {
          return [...prev.slice(0, -1), { id: Date.now().toString(), role: 'assistant', content: data.content }];
        }
        return prev;
      });

    } catch (error: any) {
      if (error.name === 'AbortError') return;
      setMessages(prev => {
        const filtered = prev.filter(m => !m.isPlaceholder);
        return [...filtered, { 
          id: 'err', 
          role: 'assistant', 
          content: `Прости, но сейчас сервера загружены (${error.message})` 
        }];
      });
    }
  };

  const handleSend = async (customText?: string) => {
    const textToSend = customText || message;
    if (!textToSend.trim()) return;
    
    const userMsg: ChatMessage = { id: Date.now().toString(), role: 'user', content: textToSend };
    const placeholderMsg: ChatMessage = { id: 'loading', role: 'assistant', content: '...', isPlaceholder: true };
    
    const newMessages = [...messages, userMsg];
    setMessages([...newMessages, placeholderMsg]);
    setMessage("");
    setChatStarted(true);

    await fetchAI(newMessages);
  };

  const handleEditMessage = async (id: string, newContent: string) => {
    const index = messages.findIndex(m => m.id === id);
    if (index === -1) return;
    const updatedMessages = messages.slice(0, index);
    setMessages(updatedMessages);
    await handleSend(newContent);
  };

  const handleRedoMessage = async (id: string) => {
    const index = messages.findIndex(m => m.id === id);
    if (index === -1) return;
    const lastUserMsg = [...messages.slice(0, index)].reverse().find(m => m.role === 'user');
    if (lastUserMsg) {
      const updatedMessages = messages.slice(0, messages.indexOf(lastUserMsg));
      setMessages(updatedMessages);
      await handleSend(lastUserMsg.content);
    }
  };

  const handleNewChatClick = () => {
    setMessages([]);
    setChatStarted(false);
  };

  const rows = [
    { items: ["Гайд на Легенду", "Сквад для РАИДА", "Как пройти 5-й узел?", "Моды для Вейдера"], dir: 'left', speed: '25s' },
    { items: ["Лучшие бюджетные команды", "Когда будет событие?", "Тир-лист 2024", "Анализ аккаунта"], dir: 'right', speed: '30s' }
  ];

  const inputAreaContent = (
    <div className="max-w-[600px] mx-auto w-full px-5 pb-8">
      <div className="relative flex items-end gap-3 bg-[#2D2C2A] rounded-[24px] p-3 border border-white/5 shadow-2xl">
        <textarea
          value={message}
          onChange={(e) => setMessage(e.target.value)}
          onKeyDown={(e) => {
            if (e.key === 'Enter' && !e.shiftKey) {
              e.preventDefault();
              handleSend();
            }
          }}
          placeholder="Спроси о SWGOH..."
          className="flex-1 bg-transparent border-none focus:ring-0 text-[#F2F1ED] text-[16px] py-2 pl-2 resize-none max-h-[200px] placeholder-[#9A9894]/40"
          rows={1}
        />
        <button 
          onClick={() => handleSend()}
          className="bg-[#5FA86D] p-2.5 rounded-xl active:scale-90 transition-transform flex-shrink-0"
        >
          <img src="/icons/send.svg" className="w-5 h-5 invert" alt="Send" />
        </button>
      </div>
    </div>
  );

  return (
    <main className="fixed inset-0 bg-[#252422] flex flex-col overflow-hidden">
      <div className="flex items-center justify-between px-6 h-[64px] shrink-0 z-[60]">
        <button onClick={() => setIsMenuOpen(true)} className="p-2 -ml-2 active:scale-90 transition-transform">
          <img src="/icons/menu.svg" className="w-6 h-6 invert opacity-60" alt="Menu" />
        </button>
        <span className="text-[15px] font-medium text-[#F2F1ED]/90 tracking-tight">Новый чат</span>
        <button onClick={handleNewChatClick} className="p-2 -mr-2 active:scale-90 transition-transform">
          <img src="/icons/newchat.svg" className="w-6 h-6 invert opacity-60" alt="New Chat" />
        </button>
      </div>

      <AnimatePresence mode="wait">
        {!chatStarted ? (
          <motion.div 
            key="start"
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            className="flex-1 flex flex-col items-center justify-center"
          >
            <div className="w-full flex flex-col items-center px-6">
              <div className="mb-8 flex flex-col items-center">
                <div className="w-16 h-16 bg-[#5FA86D] rounded-[22px] flex items-center justify-center mb-6 shadow-lg">
                  <img src="/applogo.png" className="w-10 h-10 object-contain" alt="Logo" />
                </div>
                <h1 className="text-[24px] font-semibold text-[#F2F1ED] text-center leading-tight">
                  Привет, {tgUser?.first_name || 'юзер'}!<br />Чем помочь сегодня?
                </h1>
              </div>

              <div className="w-full space-y-1 mb-8 opacity-60">
                {rows.map((row, i) => (
                  <PromptRow key={i} items={row.items} direction={row.dir} speed={row.speed} onPick={(t:string) => setMessage(t)} />
                ))}
              </div>

              {inputAreaContent}
            </div>
          </motion.div>
        ) : (
          <motion.div 
            key="chat"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="flex-1 flex flex-col min-h-0 bg-[#252422]"
          >
            <div className="flex-1 overflow-hidden relative">
              <ChatThread 
                messages={messages} 
                onNewChat={handleNewChatClick} 
                onOpenMenu={() => setIsMenuOpen(true)}
                onEditSubmit={handleEditMessage}
                onRedo={handleRedoMessage}
              />
            </div>
            <div className="w-full bg-[#252422]">{inputAreaContent}</div>
          </motion.div>
        )}
      </AnimatePresence>

      <MenuDrawer 
        open={isMenuOpen} 
        onClose={() => setIsMenuOpen(false)} 
        chats={[]} 
        currentChatId={null} 
        onSelectChat={() => {}} 
        onDeleteChat={() => {}} 
        onOpenPlanner={() => setIsPlannerOpen(true)}
        tgUser={tgUser}
      />
      
      {isPlannerOpen && <StartBoard onClose={() => setIsPlannerOpen(false)} />}
    </main>
  );
}
