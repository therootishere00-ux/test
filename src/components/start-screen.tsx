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
  
  const [chats, setChats] = useState<ChatSession[]>([]);
  const [currentChatId, setCurrentChatId] = useState<string | null>(null);
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  
  const [allPrompts, setAllPrompts] = useState<string[]>([]);
  const [firstName, setFirstName] = useState("юзер");
  const [userHandle, setUserHandle] = useState("");
  const [isGenerating, setIsGenerating] = useState(false);
  
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const abortCtrl = useRef<AbortController | null>(null);

  // Получаем активный заголовок для синхронизации с ChatThread
  const activeChat = chats.find(c => c.id === currentChatId);
  const currentTitle = activeChat?.title || "swgoh.ai";

  useEffect(() => {
    if (typeof window !== 'undefined' && (window as any).Telegram?.WebApp) {
      const webApp = (window as any).Telegram.WebApp;
      webApp.ready();
      webApp.setHeaderColor('#252422');
      webApp.setBackgroundColor('#252422');
      
      const user = webApp.initDataUnsafe?.user;
      if (user?.first_name) setFirstName(user.first_name);
      if (user?.username) setUserHandle(`@${user.username}`);
    }

    const savedChats = localStorage.getItem('swgoh-chats');
    if (savedChats) {
      try { setChats(JSON.parse(savedChats)); } catch (e) {}
    }
  }, []);

  const saveChatsToStorage = (updatedChats: ChatSession[]) => {
    setChats(updatedChats);
    localStorage.setItem('swgoh-chats', JSON.stringify(updatedChats));
  };

  const updateCurrentChat = (chatId: string, newMessages: ChatMessage[], isNew: boolean, content?: string) => {
    let updatedChats = [...chats];
    if (isNew) {
      const newChat: ChatSession = {
        id: chatId,
        title: content ? content.slice(0, 24) + (content.length > 24 ? '...' : '') : 'Новый чат',
        messages: newMessages
      };
      updatedChats = [newChat, ...updatedChats];
    } else {
      updatedChats = updatedChats.map(c => c.id === chatId ? { ...c, messages: newMessages } : c);
    }
    saveChatsToStorage(updatedChats);
  };

  useEffect(() => {
    fetch('/slovar.txt')
      .then(res => res.text())
      .then(data => {
        const lines = data.split(/\r?\n/).filter(line => line.trim().length > 0);
        setAllPrompts(lines.sort(() => Math.random() - 0.5));
      })
      .catch(() => setAllPrompts(["Гайд на Гранд-мастера Йоду", "Модули для Вейдера"]));
  }, []);

  const rows = useMemo(() => {
    if (allPrompts.length === 0) return [];
    return [
      { items: allPrompts.slice(0, 10), dir: 'left', speed: '100s' },
      { items: allPrompts.slice(10, 20), dir: 'right', speed: '90s' },
    ];
  }, [allPrompts]);

  useEffect(() => {
    const ta = textareaRef.current;
    if (!ta) return;
    ta.style.height = '24px';
    ta.style.height = `${Math.min(ta.scrollHeight, 44)}px`;
  }, [message]);

  const fetchAI = async (currentMessages: ChatMessage[], assistantMsgId: string, targetChatId: string, isNew: boolean, firstMsg?: string) => {
    abortCtrl.current = new AbortController();
    setIsGenerating(true);

    try {
      const res = await fetch('/api/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ messages: currentMessages.filter(m => !m.isPlaceholder).map(m => ({ role: m.role, content: m.content })) }),
        signal: abortCtrl.current.signal
      });

      if (!res.ok) throw new Error();

      const data = await res.json();
      
      setMessages(prev => {
        const updated = prev.map(msg => msg.id === assistantMsgId ? { ...msg, content: data.content || "Ошибка", isPlaceholder: false } : msg);
        updateCurrentChat(targetChatId, updated, isNew, firstMsg);
        return updated;
      });
    } catch (e) {
      setMessages(prev => {
        const updated = prev.map(msg => msg.id === assistantMsgId ? { ...msg, content: "Прости, но сервер загружен. Приходи позже!", isPlaceholder: false } : msg);
        updateCurrentChat(targetChatId, updated, isNew, firstMsg);
        return updated;
      });
    } finally {
      setIsGenerating(false);
    }
  };

  const onSend = (text?: string) => {
    if (isGenerating) return;
    const content = text || message;
    if (content.trim().length < 2) return;
    
    const isNew = !currentChatId;
    const activeId = currentChatId || Date.now().toString();
    if (isNew) setCurrentChatId(activeId);

    const assistantMsgId = (Date.now() + 1).toString();
    const newHistory: ChatMessage[] = [
      ...messages, 
      { id: Date.now().toString(), role: "user", content: content.trim() },
      { id: assistantMsgId, role: "assistant", content: "", isPlaceholder: true }
    ];

    setMessages(newHistory);
    setChatStarted(true);
    setMessage("");
    updateCurrentChat(activeId, newHistory, isNew, content.trim());
    fetchAI(newHistory, assistantMsgId, activeId, isNew, content.trim());
  };

  const handleNewChatClick = () => {
    if (abortCtrl.current) abortCtrl.current.abort();
    setChatStarted(false);
    setMessages([]);
    setCurrentChatId(null);
  };

  const deleteChat = (id: string) => {
    const updated = chats.filter(c => c.id !== id);
    saveChatsToStorage(updated);
    if (currentChatId === id) handleNewChatClick();
    setIsMenuOpen(false);
  };

  const inputArea = (
    <div className={`w-full max-w-[600px] mx-auto px-8 ${chatStarted ? 'pb-4' : 'pb-6'}`}>
      <div className="relative flex w-full flex-col bg-[#2D2C2A] rounded-[22px] border border-white/[0.04] p-3 shadow-sm">
        <textarea
          ref={textareaRef}
          value={message}
          onChange={(e) => setMessage(e.target.value)}
          placeholder="Спросить что-нибудь..."
          className="hide-scrollbar w-full bg-transparent px-2 text-[15px] text-[#E8E6E3] outline-none placeholder:text-[#6A6965] resize-none"
          style={{ lineHeight: '20px', minHeight: '24px' }}
        />
        <div className="flex justify-end mt-1">
          <button
            onClick={() => isGenerating ? abortCtrl.current?.abort() : onSend()}
            disabled={!isGenerating && message.trim().length < 2}
            className="flex h-9 w-9 items-center justify-center rounded-xl bg-[#5FA86D] disabled:opacity-20 active:scale-95 transition-transform"
          >
            <img src={isGenerating ? "/icons/stop.svg" : "/icons/send.svg"} className="w-4 h-4 invert brightness-0" alt="" />
          </button>
        </div>
      </div>
    </div>
  );

  return (
    <main className="relative h-dvh w-full bg-[#252422] font-sans antialiased overflow-hidden text-[#E8E6E3]">
      <style jsx global>{`
        @keyframes marquee-left { from { transform: translateX(0); } to { transform: translateX(-50%); } }
        @keyframes marquee-right { from { transform: translateX(-50%); } to { transform: translateX(0); } }
        .animate-marquee-left { animation: marquee-left linear infinite; }
        .animate-marquee-right { animation: marquee-right linear infinite; }
        .hide-scrollbar::-webkit-scrollbar { display: none; }
      `}</style>

      {/* Шапка ТОЛЬКО для стартового экрана */}
      {!chatStarted && (
        <div className="absolute top-0 left-0 right-0 pt-4 px-8 flex items-center z-[100] max-w-[600px] mx-auto w-full">
          <button onClick={() => setIsMenuOpen(true)} className="p-1 opacity-40 active:scale-95">
            <img src="/icons/menu.svg" alt="" className="w-[22px] h-[22px] invert" />
          </button>
        </div>
      )}

      <MenuDrawer 
        open={isMenuOpen} 
        onClose={() => setIsMenuOpen(false)} 
        chats={chats}
        currentChatId={currentChatId}
        onSelectChat={(id) => {
          const c = chats.find(x => x.id === id);
          if (c) { setCurrentChatId(id); setMessages(c.messages); setChatStarted(true); setIsMenuOpen(false); }
        }}
        onDeleteChat={deleteChat}
        onOpenPlanner={() => { setIsMenuOpen(false); setIsPlannerOpen(true); }}
      />

      <AnimatePresence mode="wait">
        {!chatStarted ? (
          <motion.div 
            key="start" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0, y: -20 }}
            className="absolute inset-0 flex flex-col items-center justify-center z-40"
          >
            <div className="w-full max-w-[600px] flex flex-col -mt-[5vh]">
              <div className="px-8 mb-8">
                <img src="/icons/logo.PNG" className="w-10 h-10 mb-6 opacity-90" alt="" />
                <h2 className="text-[28px] font-serif text-[#F2F1ED] leading-tight tracking-tight">Привет, <span className="text-[#5FA86D]">{firstName}</span></h2>
                <h1 className="text-[28px] font-serif text-[#6A6965] leading-tight tracking-tight">Как помочь тебе сегодня?</h1>
              </div>
              <div className="space-y-1 mb-8 opacity-60">
                {rows.map((row, i) => (
                  <PromptRow key={i} items={row.items} direction={row.dir} speed={row.speed} onPick={setMessage} />
                ))}
              </div>
              {inputArea}
            </div>
          </motion.div>
        ) : (
          <motion.div 
            key="chat" initial={{ opacity: 0 }} animate={{ opacity: 1 }}
            className="absolute inset-0 flex flex-col z-50 bg-[#252422]"
          >
            <ChatThread 
              messages={messages} 
              onNewChat={handleNewChatClick} 
              onOpenMenu={() => setIsMenuOpen(true)}
              onEditSubmit={(id, text) => { /* логика из fetchAI */ }}
              onRedo={(id) => { /* логика из fetchAI */ }}
              activeChatTitle={currentTitle}
              currentUserHandle={userHandle}
            />
            <div className="bg-[#252422] shrink-0">{inputArea}</div>
          </motion.div>
        )}
      </AnimatePresence>

      {isPlannerOpen && <StartBoard onClose={() => setIsPlannerOpen(false)} />}
    </main>
  );
}
