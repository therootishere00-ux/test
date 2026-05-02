"use client";

import { useEffect, useRef, useState, useMemo } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { ChatThread, type ChatMessage } from "@/components/chat-thread";
import { MenuDrawer } from "@/components/menu-drawer";

const PromptRow = ({ items, direction, speed, offset, onPick }: any) => {
  const scrollClass = direction === 'left' ? 'animate-marquee-left' : 'animate-marquee-right';
  return (
    <div className="flex overflow-hidden py-1.5 select-none w-full">
      <div className={`flex shrink-0 items-center gap-3 ${scrollClass}`} style={{ animationDuration: speed }}>
        {[...items, ...items].map((item: string, idx: number) => {
          const isGreen = (idx + offset) % 2 === 0;
          return (
            <button 
              key={idx} 
              onClick={() => onPick(item)}
              // Смягчил кнопки подсказок, чтобы они выглядели легче
              className={`whitespace-nowrap rounded-full px-5 py-2.5 text-[14px] transition-all duration-200 active:scale-[0.95] ${
                isGreen ? "bg-[#39704E]/10 text-[#39704E] font-medium" : "bg-white border border-[#E5E5DF]/50 text-[#171717]/70 shadow-sm"
              }`}
            >
              {item}
            </button>
          );
        })}
      </div>
    </div>
  );
};

export function StartScreen() {
  const [message, setMessage] = useState("");
  const [isAnimating, setIsAnimating] = useState(false);
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
      .catch(() => setAllPrompts(["Ошибка загрузки"]));
  }, []);

  const rows = useMemo(() => {
    if (allPrompts.length === 0) return [];
    return [
      { items: allPrompts.slice(0, 12), dir: 'left', speed: '65s', off: 0 },
      { items: allPrompts.slice(12, 24), dir: 'right', speed: '55s', off: 1 },
      { items: allPrompts.slice(24, 36), dir: 'left', speed: '75s', off: 0 },
    ];
  }, [allPrompts]);

  useEffect(() => {
    const textarea = textareaRef.current;
    if (textarea) {
      textarea.style.height = 'auto';
      const scrollHeight = textarea.scrollHeight;
      textarea.style.height = `${(Math.max(Math.min(scrollHeight, 120), 56))}px`;
    }
  }, [message]);

  const handlePick = (text: string) => {
    setIsAnimating(true);
    setMessage(text);
    setTimeout(() => setIsAnimating(false), 300);
  };

  const onSend = (text?: string) => {
    const content = text || message;
    if (content.trim().length < 2) return;
    setMessages([{ id: Date.now().toString(), role: "user", content: content.trim() }]);
    setChatStarted(true);
    setMessage("");
  };

  return (
    <main className="relative h-dvh w-full bg-[#F5F5F0] font-sans antialiased overflow-hidden text-[#171717]">
      <style jsx global>{`
        @keyframes marquee-left { from { transform: translateX(0); } to { transform: translateX(-50%); } }
        @keyframes marquee-right { from { transform: translateX(-50%); } to { transform: translateX(0); } }
        .animate-marquee-left { animation: marquee-left linear infinite; }
        .animate-marquee-right { animation: marquee-right linear infinite; }
        .hide-scrollbar::-webkit-scrollbar { display: none; }
      `}</style>

      {/* Обертка для размытия с мультяшным scale */}
      <div 
        className={`flex h-full flex-col transition-all duration-500 ease-[cubic-bezier(0.22,1,0.36,1)] origin-center ${
          isMenuOpen ? 'blur-[6px] scale-[0.97] opacity-60' : 'blur-0 scale-100 opacity-100'
        }`}
        style={{ willChange: "transform, filter, opacity" }}
      >
        
        {/* Верхняя панель */}
        <div className="absolute left-0 right-0 top-0 z-50 flex items-center justify-between px-7 py-6">
          <button 
            onClick={() => setIsMenuOpen(true)} 
            className="flex h-10 w-10 items-center justify-center rounded-full bg-white/50 backdrop-blur-md shadow-sm border border-white/20 transition-all duration-200 active:scale-[0.85]"
          >
            <img src="/icons/menu.PNG" className="h-4 w-4 object-contain opacity-80" alt="Menu" />
          </button>
          <button className="flex h-10 w-10 items-center justify-center rounded-full bg-white/50 backdrop-blur-md shadow-sm border border-white/20 transition-all duration-200 active:scale-[0.85]">
            <img src="/icons/profile.PNG" className="h-4 w-4 object-contain opacity-80" alt="Profile" />
          </button>
        </div>

        {!chatStarted ? (
          <div className="flex h-full flex-col items-center justify-center">
            {/* Заголовок (Шрифт с засечками) */}
            <div className="mb-8 flex flex-col items-center gap-3">
              <img src="/icons/applogo.PNG" className="h-10 w-10 object-contain drop-shadow-sm" alt="" />
              <h1 className="text-[32px] font-serif italic text-[#2C2C2C]">
                Чем помочь тебе, хм?
              </h1>
            </div>

            {/* Подсказки */}
            <div className="min-h-[120px] w-full flex flex-col justify-center">
              {rows.length > 0 && (
                <motion.div 
                  initial={{ opacity: 0, y: 15 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.7, ease: [0.22, 1, 0.36, 1] }}
                  className="w-full space-y-1.5 opacity-95"
                >
                  {rows.map((row, i) => (
                    <PromptRow key={i} items={row.items} direction={row.dir} speed={row.speed} offset={row.off} onPick={handlePick} />
                  ))}
                </motion.div>
              )}
            </div>

            <div className="mt-14 w-full px-[25px] max-w-[650px]">
              <div className="relative w-full">
                
                {/* Плашка с мультяшным spring-эффектом */}
                <motion.div 
                  initial={{ scaleY: 0, opacity: 0 }}
                  animate={{ scaleY: 1, opacity: 1 }}
                  transition={{ 
                    type: "spring", 
                    stiffness: 300, 
                    damping: 20, 
                    delay: 0.15 
                  }}
                  style={{ transformOrigin: "bottom" }}
                  className="absolute -top-[38px] left-0 right-0 bottom-0 bg-[#212121] rounded-[28px] z-0 flex items-start pt-3 px-6 shadow-md"
                >
                  <div className="flex items-center gap-2.5">
                    <img 
                      src="/icons/energy.PNG" 
                      className="h-4 w-4 object-contain brightness-0 invert opacity-80" 
                      alt="" 
                    />
                    <span className="text-[13px] font-medium text-white/80">
                      Нашел баг? Пиши нам:{" "}
                      <span className="text-white underline underline-offset-4 decoration-white/30 hover:decoration-white transition-colors">@swgohai_request</span>
                    </span>
                  </div>
                </motion.div>

                {/* Поле ввода */}
                <div className="relative flex w-full flex-col bg-[#212121] rounded-[28px] z-10 shadow-lg transition-transform duration-300 focus-within:scale-[1.02] focus-within:-translate-y-1">
                  <div className="relative flex items-center min-h-[60px]">
                    <AnimatePresence mode="wait">
                      {isAnimating && (
                        <motion.div
                          key="animating-text"
                          initial={{ opacity: 0, y: 5 }}
                          animate={{ opacity: 1, y: 0 }}
                          exit={{ opacity: 0, scale: 0.98 }}
                          transition={{ duration: 0.2 }}
                          className="absolute left-0 top-0 w-full py-[18px] pl-6 pr-14 text-[16px] leading-[1.5] text-white/90 pointer-events-none font-serif"
                        >
                          {message}
                        </motion.div>
                      )}
                    </AnimatePresence>

                    <textarea
                      ref={textareaRef}
                      value={message}
                      onChange={(e) => setMessage(e.target.value)}
                      placeholder={isAnimating ? "" : "Спросить что-нибудь…"}
                      className={`hide-scrollbar w-full bg-transparent py-[18px] pl-6 pr-14 text-[16px] leading-[1.5] text-white outline-none placeholder:text-white/30 resize-none transition-opacity duration-200 ${isAnimating ? 'opacity-0' : 'opacity-100'}`}
                      onKeyDown={(e) => { if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); onSend(); } }}
                    />

                    <div className="absolute right-2.5 bottom-2.5">
                      <button
                        onClick={() => onSend()}
                        disabled={message.trim().length < 2 || isAnimating}
                        className="flex h-10 w-10 items-center justify-center rounded-full bg-white transition-all duration-300 active:scale-[0.85] hover:scale-105 disabled:opacity-15 disabled:hover:scale-100"
                      >
                        <img src="/icons/send.PNG" className="h-4 w-4 brightness-0" alt="" />
                      </button>
                    </div>
                  </div>
                </div>
              </div>

              <p className="mt-4 text-center text-[12px] font-medium text-[#171717]/30">
                AI может допускать ошибки. Проверяйте информацию.
              </p>
            </div>
          </div>
        ) : (
          <div className="h-full w-full pt-12">
            <ChatThread messages={messages} />
          </div>
        )}
      </div>

      <MenuDrawer open={isMenuOpen} onClose={() => setIsMenuOpen(false)} />
    </main>
  );
}
