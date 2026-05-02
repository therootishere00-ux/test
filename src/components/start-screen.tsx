"use client";

import { useEffect, useRef, useState, useMemo } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { ChatThread, type ChatMessage } from "@/components/chat-thread";
import { MenuDrawer } from "@/components/menu-drawer";

const SparkleIcon = () => (
  <svg 
    width="32" 
    height="32" 
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
            className="whitespace-nowrap rounded-xl border border-white/5 bg-white/[0.02] px-4 py-2 text-[13px] text-[#9A9894] transition-all duration-200 hover:bg-white/5 hover:text-[#C5C4C0] active:scale-95"
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
        setAllPrompts(shuffled(lines));
      })
      .catch(() => setAllPrompts(["Ошибка загрузки"]));
  }, []);

  const shuffled = (arr: any[]) => [...arr].sort(() => Math.random() - 0.5);

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
      // Ограничение высоты: ~24px на строку, макс 3 строки (72px)
      const scrollHeight = textarea.scrollHeight;
      textarea.style.height = `${Math.min(scrollHeight, 72)}px`;
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

      <div 
        className={`flex h-full flex-col transition-all duration-500 ease-[cubic-bezier(0.34,1.56,0.64,1)] ${
          isMenuOpen ? 'blur-[8px] scale-[0.97] opacity-40' : 'blur-0 scale-100 opacity-100'
        }`}
      >
        {/* Панель управления */}
        <div className="absolute left-0 right-0 top-0 z-50 flex items-center justify-between px-6 py-6">
          <button onClick={() => setIsMenuOpen(true)} className="opacity-40 hover:opacity-100 transition-opacity active:scale-90">
            <img src="/icons/menu.PNG" className="h-5 w-5 invert" alt="" />
          </button>
          <button className="opacity-40 hover:opacity-100 transition-opacity active:scale-90">
            <img src="/icons/profile.PNG" className="h-5 w-5 invert" alt="" />
          </button>
        </div>

        {!chatStarted ? (
          <div className="flex h-full flex-col items-center justify-center px-6">
            
            <div className="mb-8 flex flex-col items-center gap-4 text-center">
              <SparkleIcon />
              <h1 className="text-[32px] font-serif italic text-[#F2F1ED]">
                О чем думаешь, хм?
              </h1>
            </div>

            <div className="w-full mb-8 space-y-1">
              {rows.map((row, i) => (
                <PromptRow key={i} {...row} onPick={handlePick} />
              ))}
            </div>

            <div className="w-full max-w-[600px]">
              {/* Поле ввода с новым цветом фона и квадратной кнопкой */}
              <div className="relative flex w-full flex-col bg-[#32312F] rounded-[22px] border border-white/10 transition-all duration-300 focus-within:border-white/20">
                <div className="relative flex items-end p-2.5">
                  <textarea
                    ref={textareaRef}
                    value={message}
                    onChange={(e) => setMessage(e.target.value)}
                    placeholder={isAnimating ? "" : "Спросить что-нибудь..."}
                    className="hide-scrollbar w-full bg-transparent px-3 py-2 text-[16px] leading-[1.4] text-[#E8E6E3] outline-none placeholder:text-[#7A7975] resize-none"
                    onKeyDown={(e) => { if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); onSend(); } }}
                  />

                  <button
                    onClick={() => onSend()}
                    disabled={message.trim().length < 2 || isAnimating}
                    className="flex h-11 w-11 shrink-0 items-center justify-center rounded-[14px] bg-[#5FA86D] transition-all duration-200 active:scale-90 hover:bg-[#6FBD7E] disabled:opacity-20"
                  >
                    <img src="/icons/send.PNG" className="h-5 w-5 invert brightness-0" alt="" />
                  </button>
                </div>
              </div>

              {/* Текст под строкой */}
              <p className="mt-4 text-center text-[13px] font-medium text-[#7A7975] italic tracking-tight">
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
