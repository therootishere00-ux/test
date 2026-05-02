"use client";

import { useEffect, useRef, useState, useMemo } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { ChatThread, type ChatMessage } from "@/components/chat-thread";
import { MenuDrawer } from "@/components/menu-drawer";

const SparkleIcon = () => (
  <svg width="36" height="36" viewBox="0 0 24 24" fill="none" className="text-[#5FA86D]">
    <path d="M12 2L12.8 8.5L19 7L14.5 11.5L20 16L13.5 14.5L12 21L10.5 14.5L4 16L9.5 11.5L5 7L11.2 8.5L12 2Z" fill="currentColor"/>
  </svg>
);

const PromptRow = ({ items, direction, speed, onPick }: any) => {
  const scrollClass = direction === 'left' ? 'animate-marquee-left' : 'animate-marquee-right';
  return (
    <div className="flex overflow-hidden py-1.5 select-none w-full">
      <div className={`flex shrink-0 items-center gap-2.5 ${scrollClass}`} style={{ animationDuration: speed }}>
        {[...items, ...items].map((item: string, idx: number) => (
          <button 
            key={idx} 
            onClick={() => onPick(item)}
            className="whitespace-nowrap rounded-xl border border-white/5 bg-[#333230] px-4 py-2 text-[14px] text-[#9A9894] transition-all duration-200 hover:text-[#C5C4C0] active:scale-95"
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
      .catch(() => setAllPrompts(["Ошибка"]));
  }, []);

  const rows = useMemo(() => {
    if (allPrompts.length === 0) return [];
    return [
      { items: allPrompts.slice(0, 12), dir: 'left', speed: '65s' },
      { items: allPrompts.slice(12, 24), dir: 'right', speed: '55s' },
    ];
  }, [allPrompts]);

  useEffect(() => {
    const textarea = textareaRef.current;
    if (textarea) {
      textarea.style.height = 'auto';
      textarea.style.height = `${Math.max(Math.min(textarea.scrollHeight, 80), 24)}px`;
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

      <div className={`flex h-full flex-col transition-all duration-500 ${isMenuOpen ? 'blur-[8px] scale-[0.96] opacity-40' : ''}`}>
        
        <div className="absolute left-4 top-4 z-50">
          <button onClick={() => setIsMenuOpen(true)} className="p-2 opacity-60 hover:opacity-100">
            <img src="/icons/menu.PNG" className="h-5 w-5 invert brightness-0" alt="" />
          </button>
        </div>

        {!chatStarted ? (
          <div className="flex h-full flex-col items-center justify-center">
            
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="mb-6 flex flex-col items-center gap-5">
              <SparkleIcon />
              <h1 className="text-[36px] leading-[1.1] font-serif text-[#F2F1ED] text-center">
                О чем думаешь,<br />хм?
              </h1>
            </motion.div>

            <div className="w-full mb-6">
              {rows.map((row, i) => (
                <PromptRow key={i} items={row.items} direction={row.dir} speed={row.speed} onPick={handlePick} />
              ))}
            </div>

            <div className="w-full max-w-[650px] px-[20px] flex flex-col items-center">
              
              {/* Та самая плашка с фото */}
              <div className="relative w-full bg-[#333230] rounded-[32px] p-5 border border-white/5 transition-all focus-within:border-white/10">
                <div className="relative flex flex-col min-h-[100px]">
                  
                  <textarea
                    ref={textareaRef}
                    value={message}
                    onChange={(e) => setMessage(e.target.value)}
                    placeholder="Спросить что-нибудь..."
                    className="hide-scrollbar w-full bg-transparent text-[17px] leading-[1.5] text-[#E8E6E3] outline-none placeholder:text-[#7A7975] resize-none"
                    onKeyDown={(e) => { if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); onSend(); } }}
                  />

                  <div className="flex items-center justify-end mt-4">
                    <button
                      onClick={() => onSend()}
                      disabled={message.trim().length < 2}
                      className="flex h-10 w-10 items-center justify-center rounded-[16px] bg-[#5FA86D] transition-all active:scale-90 disabled:opacity-20"
                    >
                      <img src="/icons/send.PNG" className="h-4.5 w-4.5 brightness-0" alt="" />
                    </button>
                  </div>
                </div>
              </div>

              <p className="mt-4 text-[13px] text-[#7A7975] font-medium opacity-80">
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
