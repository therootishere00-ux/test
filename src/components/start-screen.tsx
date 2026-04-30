"use client";

import { useEffect, useRef, useState, useMemo } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { ChatThread, type ChatMessage } from "@/components/chat-thread";
import { MenuDrawer } from "@/components/menu-drawer";

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
              className={`whitespace-nowrap rounded-full px-5 py-2.5 text-[14px] font-medium transition-all active:scale-95 ${
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
  const [isLarge, setIsLarge] = useState(false);
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
      .catch(() => setAllPrompts(["Ошибка загрузки словарика"]));
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
      const newHeight = Math.min(scrollHeight, 120);
      textarea.style.height = `${Math.max(newHeight, 56)}px`;
      setIsLarge(newHeight > 64);
    }
  }, [message]);

  const handlePick = (text: string) => {
    setIsAnimating(true);
    setMessage(text);
    // Длительность анимации
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

      {!chatStarted ? (
        <div className="flex h-full flex-col items-center justify-center">
          <div className="mb-6 flex items-center gap-4">
            <img src="/icons/applogo.PNG" className="h-9 w-9 object-contain" alt="" />
            <h1 className="text-[26px] font-medium tracking-tight">Чем помочь тебе, хм?</h1>
          </div>

          <div className="w-full space-y-1 opacity-90">
            {rows.map((row, i) => (
              <PromptRow key={i} items={row.items} direction={row.dir} speed={row.speed} offset={row.off} onPick={handlePick} />
            ))}
          </div>

          <div className="mt-8 w-full px-[25px]">
            <motion.div 
              animate={{ borderRadius: isLarge ? "24px" : "32px" }}
              transition={{ type: "spring", stiffness: 300, damping: 25 }}
              className="relative flex w-full flex-col bg-[#262626] shadow-2xl"
            >
              <div className="relative flex items-center min-h-[56px]">
                <AnimatePresence mode="wait">
                  {isAnimating && (
                    <motion.div
                      key="animating-text"
                      initial={{ opacity: 0, y: 12, rotateX: 12, scale: 0.97 }}
                      animate={{ opacity: 1, y: 0, rotateX: 0, scale: 1 }}
                      exit={{ opacity: 0 }}
                      transition={{ duration: 0.25, ease: [0.16, 1, 0.3, 1] }}
                      className="absolute left-0 top-0 w-full py-[16px] pl-6 pr-14 text-[16px] leading-[1.5] text-white/90 pointer-events-none"
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
                  className={`hide-scrollbar w-full bg-transparent py-[16px] pl-6 pr-14 text-[16px] leading-[1.5] text-white outline-none placeholder:text-white/20 resize-none transition-opacity duration-150 ${isAnimating ? 'opacity-0' : 'opacity-100'}`}
                  onKeyDown={(e) => { if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); onSend(); } }}
                />

                <div className="absolute right-2 bottom-2">
                  <button
                    onClick={() => onSend()}
                    disabled={message.trim().length < 2 || isAnimating}
                    className="flex h-10 w-10 items-center justify-center rounded-full bg-[#F5F5F0] transition-all active:scale-90 disabled:opacity-10"
                  >
                    <img src="/icons/send.PNG" className="h-4 w-4 brightness-0" alt="" />
                  </button>
                </div>
              </div>
            </motion.div>
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
