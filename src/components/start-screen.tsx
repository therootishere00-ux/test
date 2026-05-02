"use client";

import { useEffect, useRef, useState, useMemo } from "react";
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
      <div className={`flex shrink-0 items-center gap-2 ${scrollClass}`} style={{ animationDuration: speed }}>
        {[...items, ...items].map((item: string, idx: number) => (
          <button 
            key={idx} 
            onClick={() => onPick(item)}
            className="whitespace-nowrap rounded-xl border border-white/5 bg-transparent px-4 py-2 text-[13px] text-[#9A9894] transition-all duration-200 hover:bg-white/5 hover:text-[#C5C4C0] active:scale-95"
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
      .catch(() => setAllPrompts(["Как прокачать Фениксов?", "Лучшие модули для Вейдера", "Гайд на Гранд-мастера Йоду"]));
  }, []);

  const rows = useMemo(() => {
    if (allPrompts.length === 0) return [];
    return [
      { items: allPrompts.slice(0, 10), dir: 'left', speed: '80s' },
      { items: allPrompts.slice(10, 20), dir: 'right', speed: '70s' },
    ];
  }, [allPrompts]);

  useEffect(() => {
    const textarea = textareaRef.current;
    if (textarea) {
      textarea.style.height = 'auto';
      textarea.style.height = `${Math.max(Math.min(textarea.scrollHeight, 150), 40)}px`;
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
      `}</style>

      <div className={`flex h-full flex-col transition-all duration-500 ${isMenuOpen ? 'blur-md scale-[0.98] opacity-50' : ''}`}>
        
        {/* Шапка */}
        <div className="absolute left-0 right-0 top-0 z-50 flex items-center px-6 py-6">
          <button onClick={() => setIsMenuOpen(true)} className="opacity-60 hover:opacity-100 transition-opacity">
            <img src="/icons/menu.PNG" className="h-5 w-5 invert" alt="Menu" />
          </button>
        </div>

        {!chatStarted ? (
          <div className="flex h-full flex-col items-center justify-center">
            
            <div className="mb-10 flex flex-col items-center gap-4 text-center px-4">
              <SparkleIcon />
              <h1 className="text-[32px] leading-tight font-serif text-[#F2F1ED] tracking-tight">
                С чем помочь тебе,<br />хм?
              </h1>
            </div>

            {/* Бегущие строки */}
            <div className="w-full space-y-1 mb-8 opacity-80">
              {rows.map((row, i) => (
                <PromptRow key={i} items={row.items} direction={row.dir} speed={row.speed} onPick={(t:string) => setMessage(t)} />
              ))}
            </div>

            <div className="w-full max-w-[600px] px-6">
              <div className="relative flex w-full flex-col bg-[#2D2C2A] rounded-[22px] border border-white/5 focus-within:border-white/10 transition-all">
                <div className="flex flex-col p-3 min-h-[85px]">
                  <textarea
                    ref={textareaRef}
                    value={message}
                    onChange={(e) => setMessage(e.target.value)}
                    placeholder="Спросить что-нибудь..."
                    className="hide-scrollbar w-full flex-1 bg-transparent px-2 pt-1 text-[16px] leading-relaxed text-[#E8E6E3] outline-none placeholder:text-[#7A7975] resize-none"
                    onKeyDown={(e) => { if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); onSend(); } }}
                  />

                  <div className="flex items-center justify-between mt-2">
                    {/* Плашка "Думай дольше" - залитая, шрифт как в заголовке */}
                    <button className="flex items-center gap-2 px-3 py-1.5 rounded-lg bg-white/5 hover:bg-white/10 transition-colors active:scale-95">
                      <img src="/icons/bulb.svg" className="w-3.5 h-3.5 opacity-60" style={{ filter: 'brightness(0) saturate(100%) invert(73%) sepia(5%) saturate(148%) hue-rotate(5deg) brightness(89%) contrast(83%)' }} alt="" />
                      <span className="text-[13px] text-[#A3A29D] font-serif font-medium">Думай дольше</span>
                    </button>

                    {/* Квадратная кнопка отправки - крупнее и скруглена под стиль ввода */}
                    <button
                      onClick={() => onSend()}
                      disabled={message.trim().length < 2}
                      className="flex h-9 w-9 items-center justify-center rounded-[14px] bg-[#5FA86D] transition-all hover:bg-[#6FBD7E] disabled:opacity-20 active:scale-90"
                    >
                      <img src="/icons/send.svg" className="w-[18px] h-[18px]" alt="Send" />
                    </button>
                  </div>
                </div>
              </div>
            </div>
          </div>
        ) : (
          <div className="h-full w-full pt-16">
            <ChatThread messages={messages} />
          </div>
        )}
      </div>

      <MenuDrawer open={isMenuOpen} onClose={() => setIsMenuOpen(false)} />
    </main>
  );
}
