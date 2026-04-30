"use client";

import { useEffect, useRef, useState, useMemo } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { ChatThread, type ChatMessage } from "@/components/chat-thread";

const PromptRow = ({ items, direction, speed, offset, onPick }: any) => {
  const scrollClass = direction === 'left' ? 'animate-marquee-left' : 'animate-marquee-right';
  return (
    <div className="flex overflow-hidden py-1.5 select-none w-full">
      <div className={`flex shrink-0 items-center gap-4 ${scrollClass}`} style={{ animationDuration: speed }}>
        {[...items, ...items].map((item: string, idx: number) => {
          const isGreen = (idx + offset) % 2 === 0;
          return (
            <button 
              key={idx} 
              onClick={() => onPick(item)}
              className={`whitespace-nowrap rounded-full px-6 py-3 text-[15px] font-medium transition-all active:scale-95 ${
                isGreen ? "bg-[#39704E]/10 text-[#39704E]" : "border border-[#E5E5DF] text-[#171717]/60"
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
      textarea.style.height = `${Math.max(Math.min(scrollHeight, 150), 56)}px`;
    }
  }, [message]);

  const handlePick = (text: string) => {
    setIsAnimating(true);
    setMessage(text);
    setTimeout(() => {
      setIsAnimating(false);
      textareaRef.current?.focus();
    }, 200);
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

      {!chatStarted ? (
        <div className="flex h-full flex-col items-center justify-center">
          <div className="mb-8 flex items-center gap-4">
            <img src="/icons/applogo.PNG" className="h-10 w-10 object-contain" alt="" />
            <h1 className="text-[28px] font-medium tracking-tight">Чем помочь тебе, хм?</h1>
          </div>

          <div className="w-full space-y-1 opacity-90">
            {rows.map((row, i) => (
              <PromptRow key={i} items={row.items} direction={row.dir} speed={row.speed} offset={row.off} onPick={handlePick} />
            ))}
          </div>

          <div className="mt-14 w-full px-6 max-w-[600px] relative">
            {/* Задняя плашка (энергия) */}
            <div className="absolute -top-[28px] left-6 right-6 h-[60px] bg-[#212121]/85 rounded-[28px] z-0 flex items-start pt-2 px-5">
              <div className="flex items-center gap-2">
                <img src="/icons/energy.PNG" className="h-3.5 w-3.5 object-contain" alt="" />
                <span className="text-[12px] font-medium text-white/70 leading-none">
                  Йода умеет анализировать аккаунты. Достаточно отправить свой код союзника
                </span>
              </div>
            </div>

            {/* Основная строка */}
            <div className="relative flex w-full flex-col bg-[#212121] rounded-[28px] p-2 z-10 shadow-lg">
              <div className="relative flex items-end min-h-[56px]">
                <AnimatePresence mode="wait">
                  {isAnimating && (
                    <motion.div
                      key="animating-text"
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      exit={{ opacity: 0 }}
                      transition={{ duration: 0.15 }}
                      className="absolute left-0 top-0 w-full py-[14px] pl-5 pr-14 text-[17px] leading-relaxed text-white/90 pointer-events-none"
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
                  className={`hide-scrollbar w-full bg-transparent py-[14px] pl-5 pr-14 text-[17px] leading-relaxed text-white outline-none placeholder:text-white/30 resize-none transition-opacity duration-200 ${isAnimating ? 'opacity-0' : 'opacity-100'}`}
                  onKeyDown={(e) => { if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); onSend(); } }}
                />

                <div className="absolute right-2 bottom-2">
                  <button
                    onClick={() => onSend()}
                    disabled={message.trim().length < 2 || isAnimating}
                    className="flex h-11 w-11 items-center justify-center rounded-full bg-white transition-transform active:scale-90 disabled:opacity-20"
                  >
                    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                      <path d="M12 19V5M12 5L5 12M12 5L19 12" stroke="black" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"/>
                    </svg>
                  </button>
                </div>
              </div>
            </div>
            
            <p className="mt-5 text-center text-[13px] font-medium text-[#171717]/40 tracking-tight">
              Это ИИ. Он может ошибаться
            </p>
          </div>
        </div>
      ) : (
        <div className="h-full w-full pt-12">
          <ChatThread messages={messages} />
        </div>
      )}
    </main>
  );
}
