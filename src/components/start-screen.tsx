"use client";

import { useEffect, useRef, useState, useMemo } from "react";
import { ChatThread, type ChatMessage } from "@/components/chat-thread";
import { MenuDrawer } from "@/components/menu-drawer";

const promptLibrary = [
  "Собери план прокачки с нуля", "Кого выбрать первой легендой?",
  "Как улучшить мой GAC рейтинг", "В чём я явно отстаю от других",
  "Какие герои дадут мне больше всего", "Как правильно расходовать ресурсы",
  "Что качать в первую очередь", "Подскажи по моему составу",
  "Как подготовиться к ТВ", "Что мне не хватает для флота",
  "Лучшие модули для Рей", "Приоритеты в магазине осколков"
];

const shuffle = (arr: string[]) => [...arr].sort(() => Math.random() - 0.5);

const PromptRow = ({ items, direction, speed, offset, onPick }: any) => {
  const scrollClass = direction === 'left' ? 'animate-marquee-left' : 'animate-marquee-right';
  return (
    <div className="flex overflow-hidden py-2 select-none w-full">
      <div className={`flex shrink-0 items-center gap-6 ${scrollClass} px-3`} style={{ animationDuration: speed }}>
        {[...items, ...items].map((item: string, idx: number) => {
          const isGreen = (idx + offset) % 2 === 0;
          return (
            <button 
              key={idx} 
              onClick={() => onPick(item)}
              className={`whitespace-nowrap rounded-full px-6 py-2.5 text-[14px] font-medium transition-transform active:scale-95 ${
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
  const [menuOpen, setMenuOpen] = useState(false);
  const [chatStarted, setChatStarted] = useState(false);
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  // Генерируем случайные ряды только один раз при загрузке
  const rows = useMemo(() => [
    { items: shuffle(promptLibrary).slice(0, 6), dir: 'left', speed: '50s', off: 0 },
    { items: shuffle(promptLibrary).slice(0, 6), dir: 'right', speed: '45s', off: 1 },
    { items: shuffle(promptLibrary).slice(0, 6), dir: 'left', speed: '55s', off: 0 },
  ], []);

  useEffect(() => {
    const textarea = textareaRef.current;
    if (textarea) {
      textarea.style.height = '48px';
      const scrollHeight = textarea.scrollHeight;
      textarea.style.height = `${Math.min(scrollHeight, 96)}px`;
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
    <main className="relative h-dvh w-full bg-[#F5F5F0] font-sans antialiased overflow-hidden text-[#171717]">
      <style jsx global>{`
        @keyframes marquee-left { from { transform: translateX(0); } to { transform: translateX(-50%); } }
        @keyframes marquee-right { from { transform: translateX(-50%); } to { transform: translateX(0); } }
        .animate-marquee-left { animation: marquee-left linear infinite; }
        .animate-marquee-right { animation: marquee-right linear infinite; }
        .hide-scrollbar::-webkit-scrollbar { display: none; }
      `}</style>

      <MenuDrawer open={menuOpen} onClose={() => setMenuOpen(false)} />

      {!chatStarted ? (
        <div className="flex h-full flex-col items-center justify-center">
          <div className="mb-6 flex items-center gap-4">
            <img src="/icons/applogo.PNG" className="h-9 w-9 object-contain" alt="" />
            <h1 className="text-[26px] font-medium tracking-tight">Чем помочь тебе, хм?</h1>
          </div>

          <div className="w-full space-y-1">
            {rows.map((row, i) => (
              <PromptRow key={i} items={row.items} direction={row.dir} speed={row.speed} offset={row.off} onPick={onSend} />
            ))}
          </div>

          <div className="mt-8 w-full px-[25px]">
            <div className="relative flex w-full flex-col bg-[#262626] rounded-[28px] transition-all duration-200 shadow-lg">
              <textarea
                ref={textareaRef}
                value={message}
                onChange={(e) => setMessage(e.target.value)}
                placeholder="Спросить что-нибудь…"
                className="hide-scrollbar w-full bg-transparent py-[14px] pl-5 pr-14 text-[16px] leading-[1.4] text-white outline-none placeholder:text-white/30 resize-none min-h-[52px]"
                onKeyDown={(e) => { if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); onSend(); } }}
              />
              
              {/* Кнопка в фиксированной сейф-зоне (справа внизу) */}
              <div className="absolute right-1.5 bottom-1.5">
                <button
                  onClick={() => onSend()}
                  disabled={message.trim().length < 2}
                  className="flex h-10 w-10 items-center justify-center rounded-full bg-[#F5F5F0] transition-all active:scale-90 disabled:opacity-10"
                >
                  <img src="/icons/send.PNG" className="h-4 w-4 brightness-0" alt="" />
                </button>
              </div>
            </div>
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
