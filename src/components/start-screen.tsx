"use client";

import { useEffect, useRef, useState, useMemo } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { ChatThread, type ChatMessage } from "@/components/chat-thread";
import { MenuDrawer } from "@/components/menu-drawer";

const SparkleIcon = () => (
  <svg 
    width="36" 
    height="36" 
    viewBox="0 0 24 24" 
    fill="none" 
    xmlns="http://www.w3.org/2000/svg"
    className="text-[#5FA86D]"
  >
    <path d="M12 2L12.8 8.5L19 7L14.5 11.5L20 16L13.5 14.5L12 21L10.5 14.5L4 16L9.5 11.5L5 7L11.2 8.5L12 2Z" fill="currentColor"/>
  </svg>
);

const PromptRow = ({ items, direction, speed, onPick }: any) => {
  const scrollClass = direction === 'left' ? 'animate-marquee-left' : 'animate-marquee-right';
  return (
    <div className="flex overflow-hidden py-1 select-none w-full">
      <div className={`flex shrink-0 items-center gap-2.5 ${scrollClass}`} style={{ animationDuration: speed }}>
        {[...items, ...items].map((item: string, idx: number) => (
          <button 
            key={idx} 
            onClick={() => onPick(item)}
            className="whitespace-nowrap rounded-xl border border-white/5 bg-[#2D2C2A]/50 px-4 py-2 text-[14px] text-[#9A9894] transition-all duration-200 hover:bg-white/5 hover:text-[#C5C4C0] active:scale-95"
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
      { items: allPrompts.slice(0, 12), dir: 'left', speed: '70s' },
      { items: allPrompts.slice(12, 24), dir: 'right', speed: '60s' },
    ];
  }, [allPrompts]);

  useEffect(() => {
    const textarea = textareaRef.current;
    if (textarea) {
      textarea.style.height = 'auto';
      // Ограничение высоты: ~80px это примерно 3 строки текста
      textarea.style.height = `${Math.min(textarea.scrollHeight, 80)}px`;
    }
  }, [message]);

  const handlePick = (text: string) => {
    setIsAnimating(true);
    setMessage(text);
    setTimeout(() => setIsAnimating(false), 200);
  };

  const onSend = (text?: string) => {
    const content = text || message;
    if (content.trim().length < 2) return;
    setMessages([{ id: Date.now().toString(), role: "user", content: content.trim() }]);
    setChatStarted(true);
    setMessage("");
  };

  return (
    <main className="relative h-dvh w-full bg-[#252422] font-sans antialiased overflow-hidden text-[#E8E6E3]">
      <style jsx global>{`
        @keyframes marquee-left { from { transform: translateX(0); } to { transform: translateX(-50%); } }
        @keyframes marquee-right { from { transform: translateX(-50%); } to { transform: translateX(0); } }
        .animate-marquee-left { animation: marquee-left linear infinite; }
        .animate-marquee-right { animation: marquee-right linear infinite; }
        .hide-scrollbar::-webkit-scrollbar { display: none; }
      `}</style>

      <div className={`flex h-full flex-col transition-all duration-500 ease-[cubic-bezier(0.34,1.56,0.64,1)] origin-center ${
          isMenuOpen ? 'blur-[8px] scale-[0.96] opacity-40' : 'blur-0 scale-100 opacity-100'
        }`}>
        
        {/* Верхняя панель */}
        <div className="absolute left-0 right-0 top-0 z-50 flex items-center justify-between px-6 py-6">
          <button onClick={() => setIsMenuOpen(true)} className="flex h-10 w-10 items-center justify-center opacity-60 active:scale-90 transition-transform">
            <img src="/icons/menu.PNG" className="h-5 w-5 invert" alt="Menu" />
          </button>
          <button className="flex h-10 w-10 items-center justify-center opacity-60 active:scale-90 transition-transform">
            <img src="/icons/profile.PNG" className="h-5 w-5 invert" alt="Profile" />
          </button>
        </div>

        {!chatStarted ? (
          <div className="flex h-full flex-col items-center justify-center">
            
            <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="mb-10 flex flex-col items-center gap-5 text-center">
              <SparkleIcon />
              <h1 className="text-[32px] leading-[1.1] font-serif tracking-tight text-[#F2F1ED]">
                О чем думаешь,<br />хм?
              </h1>
            </motion.div>

            {/* Бегущие строки */}
            <div className="min-h-[100px] w-full flex flex-col justify-center mb-10">
              {rows.length > 0 && (
                <div className="w-full space-y-1.5 opacity-80">
                  {rows.map((row, i) => (
                    <PromptRow key={i} items={row.items} direction={row.dir} speed={row.speed} onPick={handlePick} />
                  ))}
                </div>
              )}
            </div>

            <div className="w-full max-w-[650px] px-6">
              <div className="relative flex w-full items-end gap-3 bg-[#2D2C2A] rounded-[22px] border border-white/5 p-2 transition-all focus-within:border-white/15">
                <textarea
                  ref={textareaRef}
                  value={message}
                  onChange={(e) => setMessage(e.target.value)}
                  placeholder="Спросить что-нибудь..."
                  className="hide-scrollbar w-full flex-1 bg-transparent pl-4 py-3 text-[16px] leading-[1.4] text-[#E8E6E3] outline-none placeholder:text-[#7A7975] resize-none"
                  onKeyDown={(e) => { if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); onSend(); } }}
                />

                <button
                  onClick={() => onSend()}
                  disabled={message.trim().length < 2}
                  className="flex h-11 w-11 shrink-0 items-center justify-center rounded-[18px] bg-[#5FA86D] transition-all active:scale-90 disabled:opacity-20"
                >
                  <img src="/icons/send.PNG" className="h-5 w-5 brightness-0" alt="Send" />
                </button>
              </div>
              
              {/* Текст под строкой */}
              <p className="mt-4 text-center text-[13px] font-medium text-[#7A7975] opacity-60">
                Ии это. Он ошибаться может
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
