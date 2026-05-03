"use client";

import { useEffect, useRef, useState, useMemo } from "react";
import { ChatThread, type ChatMessage } from "@/components/chat-thread";
import { MenuDrawer } from "@/components/menu-drawer";
import { motion, AnimatePresence } from "framer-motion";

const PromptRow = ({ items, direction, speed, onPick }: any) => {
  const scrollClass = direction === 'left' ? 'animate-marquee-left' : 'animate-marquee-right';
  return (
    <div className="flex overflow-hidden py-1 select-none w-full">
      <div className={`flex shrink-0 items-center gap-2 ${scrollClass}`} style={{ animationDuration: speed }}>
        {[...items, ...items].map((item: string, idx: number) => (
          <button 
            key={idx} 
            onClick={() => onPick(item)}
            className="whitespace-nowrap rounded-lg border border-white/5 bg-transparent px-3 py-1.5 text-[13px] text-[#9A9894] transition-all duration-200 hover:bg-white/5 hover:text-[#C5C4C0] active:scale-95"
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
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [allPrompts, setAllPrompts] = useState<string[]>([]);
  const textareaRef = useRef<HTMLTextAreaElement>(null);

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
    const textarea = textareaRef.current;
    if (textarea) {
      textarea.style.height = '24px'; 
      const scrollHeight = textarea.scrollHeight;
      textarea.style.height = scrollHeight > 50 ? '50px' : `${scrollHeight}px`;
    }
  }, [message]);

  const onSend = (text?: string) => {
    const content = text || message;
    if (content.trim().length < 2) return;
    
    // Не сохраняем начальный запрос в истории, если чат только начинается, 
    // либо сохраняем, но очищаем инпут. По ТЗ: "запрос в начальном сообщении не сохраняем"
    if (chatStarted) {
      setMessages(prev => [...prev, { id: Date.now().toString(), role: "user", content: content.trim() }]);
    }
    
    setChatStarted(true);
    setMessage("");

    setTimeout(() => {
      setMessages(prev => [...prev, { 
        id: (Date.now() + 1).toString(), 
        role: "assistant", 
        content: "Это демонстрационный ответ. В будущем здесь будет логика вашего ИИ." 
      }]);
    }, 600);
  };

  const InputArea = () => (
    <div className={`w-full max-w-[600px] mx-auto px-8 ${chatStarted ? 'pb-6 pt-4' : ''}`}>
      <div className={`relative flex w-full flex-col rounded-[22px] border border-white/[0.04] transition-all focus-within:border-white/10 shadow-sm ${chatStarted ? 'bg-transparent backdrop-blur-xl' : 'bg-[#2D2C2A]'}`}>
        <div className="flex flex-col p-3"> 
          <textarea
            ref={textareaRef}
            value={message}
            onChange={(e) => setMessage(e.target.value)}
            placeholder="Спросить что-нибудь..."
            className="hide-scrollbar w-full flex-1 bg-transparent px-2 text-[15px] leading-[24px] text-[#E8E6E3] outline-none placeholder:text-[#6A6965] resize-none overflow-y-auto"
            onKeyDown={(e) => { 
              if (e.key === 'Enter' && !e.shiftKey) { 
                e.preventDefault(); 
                onSend(); 
              } 
            }}
          />
          <div className="flex items-center justify-end mt-2">
            <button
              onClick={() => onSend()}
              disabled={message.trim().length < 2}
              className="flex h-[38px] w-[38px] items-center justify-center rounded-[12px] bg-[#5FA86D] transition-all hover:bg-[#6FBD7E] disabled:opacity-20 active:scale-95"
            >
              <img 
                src="/icons/send.svg" 
                className="w-[18px] h-[18px]" 
                style={{ filter: 'brightness(0) saturate(100%) invert(11%) sepia(4%) saturate(842%) hue-rotate(3deg) brightness(96%) contrast(89%)' }} 
                alt="Send" 
              />
            </button>
          </div>
        </div>
      </div>
      {!chatStarted && (
        <p className="mt-4 text-center text-[11px] leading-normal text-[#6A6965] px-4">
          Хотя мы стараемся сделать ваш опыт общения лучше, это ИИ и он может ошибаться
        </p>
      )}
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

      {/* Кнопка меню поверх всего */}
      <div className="absolute top-8 left-8 z-[100]">
        <button 
          onClick={() => setIsMenuOpen(true)}
          className="p-1 active:scale-90 transition-transform"
        >
          <img src="/icons/menu.svg" alt="Menu" className="w-6 h-6 opacity-40 hover:opacity-80 invert" />
        </button>
      </div>

      <MenuDrawer open={isMenuOpen} onClose={() => setIsMenuOpen(false)} />

      <AnimatePresence mode="wait">
        {!chatStarted ? (
          <motion.div 
            key="start-screen"
            exit={{ y: "-100%", opacity: 0 }}
            transition={{ duration: 0.5, ease: [0.22, 1, 0.36, 1] }}
            className="absolute inset-0 flex flex-col items-center justify-center pb-[10vh] bg-[#252422] z-40"
          >
            <div className="w-full max-w-[600px] px-8 mb-8 flex flex-col items-start">
              <img src="/icons/logo.PNG" alt="Logo" className="w-10 h-10 mb-6 opacity-90" />
              <div className="space-y-0.5">
                <h2 className="text-[28px] leading-tight font-serif text-[#F2F1ED] tracking-tight">
                  Привет, <span className="text-[#5FA86D]">юзер</span>
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

            <InputArea />
          </motion.div>
        ) : (
          <motion.div 
            key="chat-screen"
            initial={{ opacity: 0, scale: 0.98 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.5, ease: [0.22, 1, 0.36, 1], delay: 0.1 }}
            className="absolute inset-0 flex flex-col z-0"
          >
            <div className="flex-1 overflow-hidden flex flex-col px-8 relative">
              <ChatThread messages={messages} onNewChat={() => { setChatStarted(false); setMessages([]); }} />
            </div>
            
            {/* Футер с блюром */}
            <div className="absolute bottom-0 w-full z-20">
              <InputArea />
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </main>
  );
}
