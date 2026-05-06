"use client";

import { useEffect, useRef, useState, useMemo } from "react";
import { ChatThread, type ChatMessage } from "@/components/chat-thread";
import { MenuDrawer, type ChatSession } from "@/components/menu-drawer";
import { motion, AnimatePresence } from "framer-motion";
import StartBoard from "../planner/start-board"; // Импорт планировщика

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
  const [isGenerating, setIsGenerating] = useState(false);
  
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const abortCtrl = useRef<AbortController | null>(null);

  useEffect(() => {
    if (typeof window !== 'undefined' && (window as any).Telegram?.WebApp) {
      const webApp = (window as any).Telegram.WebApp;
      webApp.ready();
      webApp.setHeaderColor('#252422');
      webApp.setBackgroundColor('#252422');
      const user = webApp.initDataUnsafe?.user;
      if (user?.first_name) setFirstName(user.first_name);
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

  const updateCurrentChat = (chatId: string, newMessages: ChatMessage[], isNew: boolean, firstMessageContent?: string) => {
    let updatedChats = [...chats];
    if (isNew) {
      const newChat: ChatSession = {
        id: chatId,
        title: firstMessageContent ? firstMessageContent.slice(0, 20) + '...' : 'Новый чат',
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
      .catch(() => setAllPrompts(["Гайд на Гранд-мастера Йоду", "Лучшие модули для Вейдера", "Как пройти 7 уровень"]));
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
    const sh = ta.scrollHeight;
    ta.style.height = `${Math.min(sh, 44)}px`;
  }, [message]);

  const fetchAI = async (currentMessages: ChatMessage[], assistantMsgId: string, targetChatId: string, isNewChat: boolean, firstMessage?: string) => {
    abortCtrl.current = new AbortController();
    setIsGenerating(true);

    try {
      const apiMessages = currentMessages
        .filter(m => !m.isPlaceholder)
        .map(m => ({ role: m.role, content: m.content }));

      console.log(`[СЕТЬ] Инициирован запрос к /api/chat. Сообщений: ${apiMessages.length}`);

      const res = await fetch('/api/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ messages: apiMessages }),
        signal: abortCtrl.current.signal
      });

      console.log(`[СЕТЬ] Получен ответ от сервера. Статус: ${res.status}`);

      if (!res.ok) {
        const err = await res.json().catch(() => ({}));
        console.error(`[СЕТЬ ОШИБКА] Код: ${res.status}. Детали:`, err);
        throw new Error(`Ошибка: ${err.error || res.status}`);
      }

      const data = await res.json();
      console.log("[СЕТЬ] Данные ИИ успешно получены.");
      
      setMessages(prev => {
        const updated = prev.map(msg => 
          msg.id === assistantMsgId 
            ? { ...msg, content: data.content || "Пустой ответ", isPlaceholder: false }
            : msg
        );
        updateCurrentChat(targetChatId, updated, isNewChat, firstMessage);
        return updated;
      });
    } catch (error: any) {
      if (error.name === 'AbortError') {
        console.log("[СЕТЬ] Генерация была остановлена пользователем.");
        setMessages(prev => {
          const updated = prev.map(msg => msg.id === assistantMsgId ? { ...msg, content: "Генерация остановлена.", isPlaceholder: false } : msg);
          updateCurrentChat(targetChatId, updated, isNewChat, firstMessage);
          return updated;
        });
      } else {
        console.error("[СЕТЬ КРИТИЧЕСКАЯ ОШИБКА]:", error.message);
        setMessages(prev => {
          const updated = prev.map(msg => msg.id === assistantMsgId ? { ...msg, content: `Прости, но сейчас сервера загружены (${error.message})`, isPlaceholder: false } : msg);
          updateCurrentChat(targetChatId, updated, isNewChat, firstMessage);
          return updated;
        });
      }
    } finally {
      setIsGenerating(false);
      abortCtrl.current = null;
    }
  };

  const stopGeneration = () => {
    if (abortCtrl.current) {
      abortCtrl.current.abort();
    }
  };

  const onSend = (text?: string) => {
    if (isGenerating) return;
    const content = text || message;
    if (content.trim().length < 2) return;
    
    const isNewChat = !currentChatId;
    const activeChatId = currentChatId || Date.now().toString();
    
    if (isNewChat) setCurrentChatId(activeChatId);

    const userMsgId = Date.now().toString();
    const assistantMsgId = (Date.now() + 1).toString();

    const newHistory: ChatMessage[] = [
      ...messages, 
      { id: userMsgId, role: "user", content: content.trim() },
      { id: assistantMsgId, role: "assistant", content: "", isPlaceholder: true }
    ];

    setMessages(newHistory);
    setChatStarted(true);
    setMessage("");

    if (textareaRef.current) textareaRef.current.style.height = '24px';

    updateCurrentChat(activeChatId, newHistory, isNewChat, content.trim());
    fetchAI(newHistory.filter(m => m.id !== assistantMsgId), assistantMsgId, activeChatId, isNewChat, content.trim());
  };

  const handleEditMessage = (id: string, newContent: string) => {
    if (newContent.trim().length < 2 || !currentChatId) return;
    const index = messages.findIndex(m => m.id === id);
    if (index === -1) return;

    if (isGenerating) stopGeneration();

    const assistantMsgId = Date.now().toString();
    const newHistory: ChatMessage[] = [
      ...messages.slice(0, index),
      { ...messages[index], content: newContent },
      { id: assistantMsgId, role: "assistant", content: "", isPlaceholder: true }
    ];

    setMessages(newHistory);
    updateCurrentChat(currentChatId, newHistory, false);
    fetchAI(newHistory.filter(m => m.id !== assistantMsgId), assistantMsgId, currentChatId, false);
  };

  const handleRedoMessage = (id: string) => {
    if (!currentChatId) return;
    const index = messages.findIndex(m => m.id === id);
    if (index === -1) return;

    if (isGenerating) stopGeneration();

    const assistantMsgId = Date.now().toString();
    const newHistory: ChatMessage[] = [
      ...messages.slice(0, index),
      { id: assistantMsgId, role: "assistant", content: "", isPlaceholder: true }
    ];

    setMessages(newHistory);
    updateCurrentChat(currentChatId, newHistory, false);
    fetchAI(newHistory.filter(m => m.id !== assistantMsgId), assistantMsgId, currentChatId, false);
  };

  const handleNewChatClick = () => {
    if (isGenerating) stopGeneration();
    setChatStarted(false);
    setMessages([]);
    setCurrentChatId(null);
  };

  const selectChat = (id: string) => {
    if (isGenerating) stopGeneration();
    const target = chats.find(c => c.id === id);
    if (target) {
      setCurrentChatId(id);
      setMessages(target.messages);
      setChatStarted(true);
      setIsMenuOpen(false);
    }
  };

  const deleteChat = (id: string) => {
    const updated = chats.filter(c => c.id !== id);
    saveChatsToStorage(updated);
    if (currentChatId === id) {
      handleNewChatClick();
    }
  };

  const inputAreaContent = (
    <div className={`w-full max-w-[600px] mx-auto px-8 ${chatStarted ? 'pb-4 pt-2' : ''}`}>
      <div className="relative flex w-full flex-col bg-[#2D2C2A] rounded-[20px] border border-white/[0.04] transition-all focus-within:border-white/10 shadow-sm">
        <div className="flex flex-col p-3"> 
          <textarea
            ref={textareaRef}
            value={message}
            onChange={(e) => setMessage(e.target.value)}
            placeholder="Спросить что-нибудь..."
            className="hide-scrollbar w-full flex-1 bg-transparent px-2 text-[15px] text-[#E8E6E3] outline-none placeholder:text-[#6A6965] resize-none overflow-y-auto"
            style={{ lineHeight: '20px', minHeight: '24px' }}
          />
          <div className="flex items-center justify-end mt-2">
            <button
              onClick={() => isGenerating ? stopGeneration() : onSend()}
              disabled={!isGenerating && message.trim().length < 2}
              className="flex h-[36px] w-[36px] items-center justify-center rounded-[10px] bg-[#5FA86D] disabled:opacity-20 active:scale-95 transition-transform"
            >
              <img 
                src={isGenerating ? "/icons/stop.svg" : "/icons/send.svg"} 
                className="w-[16px] h-[16px]" 
                style={{ filter: 'brightness(0) saturate(100%) invert(11%) sepia(4%) saturate(842%) hue-rotate(3deg) brightness(96%) contrast(89%)' }} 
                alt={isGenerating ? "Stop" : "Send"} 
              />
            </button>
          </div>
        </div>
      </div>
      <p className="mt-3 text-center text-[11px] leading-normal text-[#6A6965] px-4">
        Хотя мы стараемся сделать ваш опыт общения лучше, это ИИ и он может ошибаться
      </p>
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
        .hide-scrollbar { scrollbar-width: none; -ms-overflow-style: none; }
      `}</style>

      {/* Позиция иконки меню на старте 1-в-1 как в чате */}
      {!chatStarted && (
        <div className="absolute top-0 left-0 right-0 pt-4 px-8 py-2 flex items-center z-[100] max-w-[600px] mx-auto w-full">
          <button 
            onClick={() => setIsMenuOpen(true)}
            className="p-1 active:scale-95 transition-transform opacity-40"
          >
            <img src="/icons/menu.svg" alt="Menu" className="w-[22px] h-[22px] invert" />
          </button>
        </div>
      )}

      <MenuDrawer 
        open={isMenuOpen} 
        onClose={() => setIsMenuOpen(false)} 
        chats={chats}
        currentChatId={currentChatId}
        onSelectChat={selectChat}
        onDeleteChat={deleteChat}
        onOpenPlanner={() => {
          setIsMenuOpen(false);
          setIsPlannerOpen(true);
        }}
      />

      <AnimatePresence mode="wait">
        {!chatStarted ? (
          <motion.div 
            key="start-screen"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0, y: -20 }}
            transition={{ duration: 0.4, ease: [0.22, 1, 0.36, 1] }}
            className="absolute inset-0 flex flex-col items-center justify-center bg-[#252422] z-40"
          >
            <div className="w-full max-w-[600px] mx-auto flex flex-col relative -mt-[4vh]">
              <div className="w-full px-8 mb-8 flex flex-col items-start">
                <img src="/icons/logo.PNG" alt="Logo" className="w-10 h-10 mb-6 opacity-90" />
                <div className="space-y-0.5">
                  <h2 className="text-[28px] leading-tight font-serif text-[#F2F1ED] tracking-tight">
                    Привет, <span className="text-[#5FA86D]">{firstName}</span>
                  </h2>
                  <h1 className="text-[28px] leading-tight font-serif text-[#6A6965] tracking-tight">
                    Как помочь тебе сегодня?
                  </h1>
                </div>
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
            key="chat-screen"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.4 }}
            className="absolute inset-0 flex flex-col z-50 bg-[#252422]"
          >
            <div className="flex-1 overflow-hidden flex flex-col relative">
              <ChatThread 
                messages={messages} 
                onNewChat={handleNewChatClick} 
                onOpenMenu={() => setIsMenuOpen(true)}
                onEditSubmit={handleEditMessage}
                onRedo={handleRedoMessage}
              />
            </div>
            
            <div className="w-full bg-[#252422] shrink-0">
              {inputAreaContent}
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Рендер планировщика поверх всего */}
      {isPlannerOpen && (
        <StartBoard onClose={() => setIsPlannerOpen(false)} />
      )}
    </main>
  );
}
