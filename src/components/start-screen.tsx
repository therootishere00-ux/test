"use client";

import { useEffect, useRef, useState, useMemo } from "react";
import { ChatThread, type ChatMessage } from "@/components/chat-thread";
import { motion, AnimatePresence } from "framer-motion";
import StartBoard from "../planner/start-board"; // Импорт планировщика

// Компонент бегущих строк с подсказками
const PromptRow = ({ items, direction, speed, onPick }: any) => {
  const scrollClass = direction === 'left' ? 'animate-marquee-left' : 'animate-marquee-right';
  return (
    <div className="flex overflow-hidden py-1 select-none w-full">
      <div className={`flex shrink-0 items-center gap-2 ${scrollClass}`} style={{ animationDuration: speed }}>
        {[...items, ...items].map((item: string, idx: number) => (
          <button 
            key={idx} 
            onClick={() => onPick(item)}
            className="whitespace-nowrap rounded-lg border border-white/5 bg-transparent px-3 py-1.5 text-[13px] text-[#9A9894] transition-transform duration-200 active:scale-95 hover:bg-white/[0.02]"
          >
            {item}
          </button>
        ))}
      </div>
    </div>
  );
};

export function StartScreen() {
  // --- Состояния ---
  const [message, setMessage] = useState("");
  const [chatStarted, setChatStarted] = useState(false);
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [isPlannerOpen, setIsPlannerOpen] = useState(false);
  
  // Данные пользователя из Telegram
  const [tgUser, setTgUser] = useState<{ first_name?: string; username?: string; photo_url?: string } | null>(null);

  const abortCtrl = useRef<AbortController | null>(null);

  // --- Инициализация TMA ---
  useEffect(() => {
    if (typeof window !== "undefined" && window.Telegram?.WebApp) {
      const webapp = window.Telegram.WebApp;
      webapp.ready();
      webapp.expand();
      
      // Устанавливаем цвет заголовка в тон фона
      webapp.setHeaderColor('#252422');

      if (webapp.initDataUnsafe?.user) {
        setTgUser(webapp.initDataUnsafe.user);
        console.log("TMA: Данные пользователя получены", webapp.initDataUnsafe.user);
      }
    }
  }, []);

  // --- Логика AI запроса ---
  const fetchAI = async (currentMessages: ChatMessage[]) => {
    console.log("System: Подготовка запроса к AI...");
    
    abortCtrl.current = new AbortController();
    
    try {
      console.log("System: Отправка POST на /api/chat");
      const res = await fetch('/api/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ 
          messages: currentMessages.map(m => ({ role: m.role, content: m.content })) 
        }),
        signal: abortCtrl.current.signal
      });

      console.log(`System: Ответ сервера получен, статус: ${res.status}`);

      if (!res.ok) {
        const errorData = await res.json();
        throw new Error(errorData.error || `Ошибка ${res.status}`);
      }

      const data = await res.json();
      console.log("System: Ответ успешно обработан");

      setMessages(prev => {
        const last = prev[prev.length - 1];
        if (last && last.role === 'assistant' && last.isPlaceholder) {
          return [...prev.slice(0, -1), { 
            id: Date.now().toString(), 
            role: 'assistant', 
            content: data.content 
          }];
        }
        return prev;
      });

    } catch (err: any) {
      if (err.name === 'AbortError') {
        console.log("System: Запрос отменен пользователем");
        return;
      }
      console.error("System Error:", err.message);
      
      setMessages(prev => {
        const filtered = prev.filter(m => !m.isPlaceholder);
        return [...filtered, { 
          id: 'err-' + Date.now(), 
          role: 'assistant', 
          content: `Прости, но сейчас сервера загружены (${err.message})` 
        }];
      });
    }
  };

  // --- Обработчики ---
  const handleSend = async () => {
    const text = message.trim();
    if (!text) return;

    console.log("User: Отправка сообщения:", text);
    
    const userMsg: ChatMessage = { id: Date.now().toString(), role: 'user', content: text };
    const placeholderMsg: ChatMessage = { id: 'loading', role: 'assistant', content: '', isPlaceholder: true };
    
    const newMessages = [...messages, userMsg];
    setMessages([...newMessages, placeholderMsg]);
    setMessage("");
    setChatStarted(true);

    await fetchAI(newMessages);
  };

  const handleNewChatClick = () => {
    console.log("System: Сброс чата");
    setMessages([]);
    setChatStarted(false);
    setMessage("");
  };

  // Подсказки для главного экрана
  const rows = [
    { items: ["Какой флот сейчас в мете?", "Как пройти 7 категорию события?", "Лучшие модули для Вейдера"], dir: 'left', speed: '40s' },
    { items: ["Гайд на Гранд-инквизитора", "Сколько нужно реликтов для Леи?", "Сборка отряда Феникс"], dir: 'right', speed: '50s' }
  ];

  // --- UI Компоненты ---
  const inputAreaContent = (
    <div className="px-6 pb-8 pt-4">
      <div className="relative max-w-[600px] mx-auto">
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
          className="w-full bg-white/[0.03] border border-white/5 rounded-[22px] px-5 py-4 pr-14 text-[16px] text-[#F2F1ED] placeholder:text-white/20 focus:outline-none focus:border-white/10 transition-colors resize-none min-h-[56px] max-h-[200px]"
          rows={1}
        />
        <button 
          onClick={handleSend}
          disabled={!message.trim()}
          className="absolute right-2 bottom-2 p-2 rounded-full bg-white/5 disabled:opacity-20 transition-all active:scale-90"
        >
          <img src="/icons/send.svg" className="w-6 h-6 invert" alt="Send" />
        </button>
      </div>
    </div>
  );

  return (
    <main className="fixed inset-0 bg-[#252422] text-[#F2F1ED] flex flex-col overflow-hidden font-sans">
      <AnimatePresence mode="wait">
        {!chatStarted ? (
          <motion.div 
            key="start"
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.98 }}
            className="flex-1 flex flex-col"
          >
            {/* Хедер стартового экрана */}
            <div className="flex items-center justify-between px-6 py-4">
              <button onClick={() => setIsMenuOpen(true)} className="p-2 -ml-2 active:scale-90 transition-transform">
                <img src="/icons/menu.svg" className="w-6 h-6 invert" alt="Menu" />
              </button>
              <button onClick={handleNewChatClick} className="p-2 -mr-2 active:scale-90 transition-transform">
                <img src="/icons/newchat.svg" className="w-6 h-6 invert" alt="New Chat" />
              </button>
            </div>

            <div className="flex-1 flex flex-col items-center justify-center">
              <div className="mb-8 flex flex-col items-center">
                <motion.img 
                  src="/icons/applogo.png" 
                  className="w-20 h-20 mb-6"
                  initial={{ rotate: -10, opacity: 0 }}
                  animate={{ rotate: 0, opacity: 1 }}
                />
                <h1 className="text-[24px] font-medium tracking-tight text-center px-10">
                  Привет, {tgUser?.first_name || 'Герой'}! <br/>
                  <span className="opacity-40">Как помочь тебе сегодня?</span>
                </h1>
              </div>

              {/* Бегущие строки */}
              <div className="w-full space-y-2 mb-12">
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
            className="flex-1 flex flex-col"
          >
            <div className="flex-1 overflow-hidden relative">
              <ChatThread 
                messages={messages} 
                onNewChat={handleNewChatClick} 
                onOpenMenu={() => setIsMenuOpen(true)}
                currentUserHandle={tgUser?.username ? `@${tgUser.username}` : undefined}
                onEditSubmit={(id, content) => {
                  console.log("System: Редактирование сообщения", id);
                  // Здесь логика замены сообщения
                }}
                onRedo={(id) => {
                  console.log("System: Перегенерация для", id);
                  // Здесь логика Redo
                }}
              />
            </div>
            
            <div className="bg-[#252422] border-t border-white/[0.02]">
              {inputAreaContent}
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Модалки */}
      {isPlannerOpen && <StartBoard onClose={() => setIsPlannerOpen(false)} />}
    </main>
  );
}
