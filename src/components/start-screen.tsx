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
      .catch(() => setAllPrompts(["Гайд на Гранд-мастера Йоду", "Лучшие модули для Вейдера"]));
  }, []);

  const rows = useMemo(() => {
    if (allPrompts.length === 0) return [];
    return [
      { items: allPrompts.slice(0, 10), dir: 'left', speed: '100s' },
      { items: allPrompts.slice(10, 20), dir: 'right', speed: '90s' },
    ];
  }, [allPrompts]);

  const onSend = (text?: string) => {
    const content = text || message;
    if (content.trim().length < 2) return;
    
    const userMsg: ChatMessage = { id: Date.now().toString(), role: "user", content: content.trim() };
    const placeholderAi: ChatMessage = { id: "loading", role: "assistant", content: "", isLoading: true };
    
    setMessages([userMsg, placeholderAi]);
    setChatStarted(true);
    setMessage("");

    // Имитация ответа
    setTimeout(() => {
      setMessages([
        userMsg,
        { 
          id: (Date.now() + 1).toString(), 
          role: "assistant", 
          content: "Конечно! Вот актуальная информация по твоему запросу. Для достижения максимальной эффективности советую обратить внимание на скорость и критический урон в модулях. Это база для большинства персонажей в текущей мете SWGOH." 
        }
      ]);
    }, 1000);
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

      <MenuDrawer open={isMenuOpen} onClose={() => setIsMenuOpen(false)} />

      <AnimatePresence mode="popLayout">
        {!chatStarted ? (
          <motion.div 
            key="start-screen"
            initial={{ y: "-100%", opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            exit={{ y: "-100%", opacity: 0 }}
            transition={{ duration: 0.5, ease: [0.22, 1, 0.36, 1] }}
            className="absolute inset-0 flex flex-col items-center justify-center pb-[10vh] bg-[#252422] z-40"
          >
            {/* Menu Icon Only on Start */}
            <div className="absolute top-8 left-8">
              <button onClick={() => setIsMenuOpen(true)} className="p-1 active:scale-90 transition-transform">
                <img src="/icons/menu.svg" className="w-6 h-6 opacity-40 invert" alt="M" />
              </button>
            </div>

            <div className="w-full max-w-[600px] px-8 mb-8">
              <img src="/icons/logo.PNG" alt="Logo" className="w-10 h-10 mb-6 opacity-90" />
              <div className="space-y-0.5">
                <h2 className="text-[28px] font-serif text-[#F2F1ED]">Привет, <span className="text-[#5FA86D]">юзер</span></h2>
                <h1 className="text-[28px] font-serif text-[#6A6965]">Как помочь тебе сегодня?</h1>
              </div>
            </div>

            <div className="w-full space-y-1 mb-8 opacity-60">
              {rows.map((row, i) => (
                <PromptRow key={i} items={row.items} direction={row.dir} speed={row.speed} onPick={(t:string) => setMessage(t)} />
              ))}
            </div>

            <div className="w-full max-w-[600px] px-8">
               <div className="relative flex w-full flex-col bg-[#2D2C2A] rounded-[20px] border border-white/[0.04] p-3 shadow-sm">
                 <textarea
                    ref={textareaRef}
                    value={message}
                    onChange={(e) => setMessage(e.target.value)}
                    placeholder="Спросить что-нибудь..."
                    className="hide-scrollbar w-full h-[24px] bg-transparent px-2 text-[15px] text-[#E8E6E3] outline-none placeholder:text-[#6A6965] resize-none"
                  />
                  <div className="flex items-center justify-end mt-2">
                    <button onClick={() => onSend()} className="flex h-[36px] w-[36px] items-center justify-center rounded-[10px] bg-[#5FA86D] active:scale-95">
                      <img src="/icons/send.svg" className="w-[16px] h-[16px] invert" alt="S" />
                    </button>
                  </div>
               </div>
            </div>
          </motion.div>
        ) : (
          <motion.div 
            key="chat-screen"
            initial={{ y: "100%" }}
            animate={{ y: 0 }}
            exit={{ y: "100%" }}
            transition={{ duration: 0.5, ease: [0.22, 1, 0.36, 1] }}
            className="absolute inset-0 flex flex-col z-50 bg-[#252422]"
          >
            <ChatThread 
              messages={messages} 
              onNewChat={() => setChatStarted(false)} 
              onOpenMenu={() => setIsMenuOpen(true)}
              onSendMessage={(txt) => onSend(txt)}
            />
          </motion.div>
        )}
      </AnimatePresence>
    </main>
  );
}
