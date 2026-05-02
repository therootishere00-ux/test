"use client";

import { useEffect, useRef, useState, useMemo } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { ChatThread, type ChatMessage } from "@/components/chat-thread";
import { MenuDrawer } from "@/components/menu-drawer";

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
      { items: allPrompts.slice(0, 10), dir: 'left', speed: '120s' },
      { items: allPrompts.slice(10, 20), dir: 'right', speed: '110s' },
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
    
    const newUserMsg: ChatMessage = { id: Date.now().toString(), role: "user", content: content.trim() };
    setMessages(prev => [...prev, newUserMsg]);
    setChatStarted(true);
    setMessage(""); // Запрос не сохраняем в инпуте

    setTimeout(() => {
      const aiResponse: ChatMessage = { 
        id: (Date.now() + 1).toString(), 
        role: "assistant", 
        content: "Это демонстрационный ответ из базы данных повстанцев. Да прибудет с тобой сила!" 
      };
      setMessages(prev => [...prev, aiResponse]);
    }, 800);
  };

  const handleNewChat = () => {
    setChatStarted(false);
    setMessages([]);
  };

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

      {/* Кнопка меню — теперь доступна всегда через портал или общее условие */}
      <button 
        onClick={() => setIsMenuOpen(true)}
        className="absolute top-8 left-8 z-[100] p-1 active:scale-90 transition-transform"
      >
        <img src="/icons/menu.png" alt="Menu" className="w-6 h-6 opacity-40 invert brightness-200" />
      </button>

      <MenuDrawer open={isMenuOpen} onClose={() => setIsMenuOpen(false)} />

      <AnimatePresence mode="wait">
        {!chatStarted ? (
          /* --- START VIEW --- */
          <motion.div 
            key="start"
            initial={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -100, scale: 0.95 }}
            transition={{ duration: 0.5, ease: [0.22, 1, 0.36, 1] }}
            className="absolute inset-0 flex flex-col items-center justify-center z-10"
          >
            <div className="w-full max-w-[600px] px-8 mb-8 flex flex-col items-start">
              <img src="/icons/logo.png" alt="Logo" className="w-10 h-10 mb-6 opacity-90" />
              <div className="space-y-0.5">
                <h2 className="text-[28px] leading-tight font-serif text-[#F2F1ED] tracking-tight">
                  Привет, <span className="text-[#5FA86D]">юзер</span>
                </h2>
                <h1 className="text-[28px] leading-tight font-serif text-[#6A6965] tracking-tight">
                  Как помочь тебе сегодня?
                </h1>
              </div>
            </div>

            <div className="w-full space-y-1 mb-8 opacity-40">
              {rows.map((row, i) => (
                <PromptRow key={i} items={row.items} direction={row.dir} speed={row.speed} onPick={(t:string) => onSend(t)} />
              ))}
            </div>

            {/* Input Area (Start) */}
            <div className="w-full max-w-[600px] px-8">
               <InputBox message={message} setMessage={setMessage} onSend={onSend} textareaRef={textareaRef} />
               <p className="mt-4 text-center text-[11px] text-[#6A6965] opacity-50">
                ИИ может ошибаться. Проверяйте важную информацию.
               </p>
            </div>
          </motion.div>
        ) : (
          /* --- CHAT VIEW --- */
          <motion.div 
            key="chat"
            initial={{ opacity: 0, y: 50 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 50 }}
            transition={{ duration: 0.5, ease: [0.22, 1, 0.36, 1] }}
            className="absolute inset-0 flex flex-col z-0"
          >
            <div className="flex-1 overflow-hidden">
              <ChatThread messages={messages} onNewChat={handleNewChat} />
            </div>

            {/* Bottom Blur Area */}
            <div className="relative z-50 w-full pt-2 pb-8 px-8 backdrop-blur-xl bg-transparent border-t border-white/[0.02]">
               <div className="max-w-[600px] mx-auto">
                 <InputBox message={message} setMessage={setMessage} onSend={onSend} textareaRef={textareaRef} />
               </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </main>
  );
}

// Вынесенный компонент инпута для чистоты
function InputBox({ message, setMessage, onSend, textareaRef }: any) {
  return (
    <div className="relative flex w-full flex-col bg-white/[0.03] backdrop-blur-md rounded-[24px] border border-white/[0.05] transition-all focus-within:border-white/10 shadow-2xl">
      <div className="flex flex-col p-3.5"> 
        <textarea
          ref={textareaRef}
          value={message}
          onChange={(e) => setMessage(e.target.value)}
          placeholder="Спросить..."
          className="hide-scrollbar w-full flex-1 bg-transparent px-2 text-[15px] leading-[24px] text-[#E8E6E3] outline-none placeholder:text-[#6A6965] resize-none overflow-y-auto font-serif"
          onKeyDown={(e) => { if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); onSend(); } }}
        />
        <div className="flex items-center justify-end mt-2">
          <button
            onClick={() => onSend()}
            disabled={message.trim().length < 2}
            className="flex h-[40px] w-[40px] items-center justify-center rounded-[14px] bg-[#5FA86D] transition-all hover:bg-[#6FBD7E] disabled:opacity-10 active:scale-90"
          >
            <img 
              src="/icons/send.png" 
              className="w-[18px] h-[18px] invert" 
              alt="Send" 
            />
          </button>
        </div>
      </div>
    </div>
  );
}
