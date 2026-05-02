"use client";

import { useEffect, useRef, useState, useMemo } from "react";
import { ChatThread, type ChatMessage } from "@/components/chat-thread";

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
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [allPrompts, setAllPrompts] = useState<string[]>([]);
  const [isFocused, setIsFocused] = useState(false);
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
      textarea.style.height = 'auto';
      textarea.style.height = `${Math.max(Math.min(textarea.scrollHeight, 120), 24)}px`;
    }
  }, [message]);

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
        
        @keyframes border-shimmer {
          0% { border-color: rgba(255, 255, 255, 0.05); }
          50% { border-color: #5FA86D; }
          100% { border-color: rgba(255, 255, 255, 0.05); }
        }
        .animate-shimmer {
          animation: border-shimmer 2s infinite ease-in-out;
        }
      `}</style>

      <div className="flex h-full flex-col">
        {!chatStarted ? (
          <div className="flex h-full flex-col items-center justify-center">
            
            {/* Блок приветствия */}
            <div className="w-full max-w-[600px] px-8 mb-8 flex flex-col items-start">
              <img src="/icons/logo.svg" alt="Logo" className="w-10 h-10 mb-6" />
              
              <div className="space-y-0.5">
                <h2 className="text-[28px] leading-tight font-serif text-[#A3A29D] tracking-tight">
                  Привет, <span className="text-[#5FA86D]">юзер</span>
                </h2>
                <h1 className="text-[28px] leading-tight font-serif text-[#F2F1ED] tracking-tight">
                  Как помочь тебе сегодня?
                </h1>
              </div>
            </div>

            {/* Подсказки (не трогаем по просьбе) */}
            <div className="w-full space-y-1 mb-8 opacity-60">
              {rows.map((row, i) => (
                <PromptRow key={i} items={row.items} direction={row.dir} speed={row.speed} onPick={(t:string) => setMessage(t)} />
              ))}
            </div>

            {/* Строка ввода */}
            <div className="w-full max-w-[600px] px-6">
              <div 
                className={`relative flex w-full flex-col bg-[#2D2C2A] rounded-[20px] border transition-all duration-500 ${
                  isFocused ? 'animate-shimmer border-[#5FA86D]' : 'border-white/5'
                }`}
              >
                <div className="flex flex-col p-3"> 
                  <textarea
                    ref={textareaRef}
                    value={message}
                    onFocus={() => setIsFocused(true)}
                    onBlur={() => setIsFocused(false)}
                    onChange={(e) => setMessage(e.target.value)}
                    placeholder="Спросить что-нибудь..."
                    className="hide-scrollbar w-full flex-1 bg-transparent px-2 text-[15px] leading-snug text-[#E8E6E3] outline-none placeholder:text-[#6A6965] resize-none"
                    onKeyDown={(e) => { if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); onSend(); } }}
                    rows={1}
                  />

                  <div className="flex items-center justify-end mt-3">
                    <button
                      onClick={() => onSend()}
                      disabled={message.trim().length < 2}
                      className="flex h-9 w-9 items-center justify-center rounded-[10px] bg-[#5FA86D] transition-all hover:bg-[#6FBD7E] disabled:opacity-10 active:scale-90"
                    >
                      <img 
                        src="/icons/send.svg" 
                        className="w-4.5 h-4.5" 
                        style={{ filter: 'brightness(0) saturate(100%) invert(11%) sepia(4%) saturate(842%) hue-rotate(3deg) brightness(96%) contrast(89%)' }} 
                        alt="Send" 
                      />
                    </button>
                  </div>
                </div>
              </div>
            </div>
          </div>
        ) : (
          <div className="h-full w-full pt-8">
            <ChatThread messages={messages} />
          </div>
        )}
      </div>
    </main>
  );
}
