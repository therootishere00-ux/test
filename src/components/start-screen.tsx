"use client";

import { useEffect, useRef, useState, useMemo } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { ChatThread, type ChatMessage } from "@/components/chat-thread";
import { MenuDrawer } from "@/components/menu-drawer";

// Вспомогательный компонент для бегущих строк (без изменений)
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
  
  // Реф для инпута, чтобы управлять высотой напрямую без перерендеров «захлопывания»
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  // Загрузка словаря
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
      { items: allPrompts.slice(0, 10), dir: 'left', speed: '120s' },
      { items: allPrompts.slice(10, 20), dir: 'right', speed: '110s' },
    ];
  }, [allPrompts]);

  // Фикс высоты строки: высота фиксированная, если текста мало, и расширяется до предела
  const handleInput = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    setMessage(e.target.value);
    if (textareaRef.current) {
      textareaRef.current.style.height = '24px';
      const newHeight = Math.min(e.target.scrollHeight, 80);
      textareaRef.current.style.height = `${newHeight}px`;
    }
  };

  const onSend = (overrideText?: string) => {
    const content = overrideText || message;
    if (content.trim().length < 2) return;

    // Сразу добавляем сообщение пользователя (теперь оно сохраняется!)
    const userMsg: ChatMessage = { 
      id: Date.now().toString(), 
      role: "user", 
      content: content.trim() 
    };
    
    setMessages(prev => [...prev, userMsg]);
    setChatStarted(true);
    setMessage("");
    
    // Сбрасываем высоту инпута
    if (textareaRef.current) textareaRef.current.style.height = '24px';

    // Имитация ответа ИИ с задержкой (подготовка «блока»)
    setTimeout(() => {
      const aiMsg: ChatMessage = { 
        id: (Date.now() + 1).toString(), 
        role: "assistant", 
        content: "Это демонстрационный ответ. В SWGOH модули на скорость решают всё, особенно для Дарта Вейдера и Рекса. Попробуй сфокусироваться на сетах эффективности и критического урона." 
      };
      setMessages(prev => [...prev, aiMsg]);
    }, 1000);
  };

  const handleNewChat = () => {
    setChatStarted(false);
    setMessages([]);
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
        .hide-scrollbar { scrollbar-width: none; -ms-overflow-style: none; }
      `}</style>

      {/* Меню вызывается из любого экрана */}
      <MenuDrawer open={isMenuOpen} onClose={() => setIsMenuOpen(false)} />

      {/* Основная логика переходов */}
      <AnimatePresence mode="popLayout" initial={false}>
        {!chatStarted ? (
          <motion.div 
            key="start"
            initial={{ y: "-100%", opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            exit={{ y: "-100%", opacity: 0 }}
            transition={{ duration: 0.4, ease: [0.22, 1, 0.36, 1] }}
            className="absolute inset-0 flex flex-col items-center justify-center pb-[5dvh] bg-[#252422] z-40"
          >
            {/* Меню на старте */}
            <div className="absolute top-8 left-8">
              <button onClick={() => setIsMenuOpen(true)} className="p-1 active:scale-90 transition-transform">
                <img src="/icons/menu.svg" alt="Menu" className="w-6 h-6 opacity-40 hover:opacity-80 invert" />
              </button>
            </div>

            <div className="w-full max-w-[600px] px-8 mb-8 flex flex-col items-start">
              <img src="/icons/logo.PNG" alt="Logo" className="w-10 h-10 mb-6 opacity-90" />
              <div className="space-y-0.5">
                <h2 className="text-[28px] leading-tight font-serif text-[#F2F1ED] tracking-tight">
                  Привет, <span className="text-[#5FA86D]">юзер</span>
                </h2>
                <h1 className="text-[28px] leading-tight font-serif text-[#6A6965] tracking-tight">
                  Как помочь тебе сегодня?
                </h1>
              </div>
            </div>

            <div className="w-full space-y-1 mb-8 opacity-60">
              {rows.map((row, i) => (
                <PromptRow key={i} items={row.items} direction={row.dir} speed={row.speed} onPick={(t:string) => onSend(t)} />
              ))}
            </div>

            {/* Поле ввода для старта */}
            <div className="w-full max-w-[600px] px-8">
              <div className="relative flex w-full flex-col bg-[#2D2C2A] rounded-[22px] border border-white/[0.04] p-3">
                <textarea
                  ref={textareaRef}
                  value={message}
                  onChange={handleInput}
                  placeholder="Спросить что-нибудь..."
                  className="hide-scrollbar w-full bg-transparent px-2 text-[15px] leading-[24px] text-[#E8E6E3] outline-none placeholder:text-[#6A6965] resize-none overflow-y-auto min-h-[24px]"
                />
                <div className="flex items-center justify-end mt-2">
                  <button
                    onClick={() => onSend()}
                    disabled={message.trim().length < 2}
                    className="flex h-[36px] w-[36px] items-center justify-center rounded-[12px] bg-[#5FA86D] transition-all hover:bg-[#6FBD7E] disabled:opacity-20 active:scale-95"
                  >
                    <img src="/icons/send.svg" className="w-[18px] h-[18px] invert brightness-50" alt="Send" />
                  </button>
                </div>
              </div>
              <p className="mt-4 text-center text-[11px] text-[#6A6965] px-4">
                Это ИИ, он может ошибаться.
              </p>
            </div>
          </motion.div>
        ) : (
          <motion.div 
            key="chat"
            initial={{ y: "100%", opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            exit={{ y: "100%", opacity: 0 }}
            transition={{ duration: 0.4, ease: [0.22, 1, 0.36, 1] }}
            className="absolute inset-0 flex flex-col bg-[#252422] z-50"
          >
            {/* Чат-поток */}
            <div className="flex-1 overflow-hidden relative">
              <ChatThread 
                messages={messages} 
                onNewChat={handleNewChat} 
                onOpenMenu={() => setIsMenuOpen(true)} 
              />
            </div>
            
            {/* Компактная строка ввода в чате */}
            <div className="w-full max-w-[600px] mx-auto px-8 pb-8 pt-2">
              <div className="relative flex w-full flex-col bg-[#2D2C2A] rounded-[20px] border border-white/[0.04] p-3">
                {/* Иконка расширения */}
                <button className="absolute top-2 right-2 p-1 opacity-20 hover:opacity-50 transition-opacity">
                  <img src="/icons/arrows.svg" alt="Expand" className="w-3.5 h-3.5 invert" />
                </button>

                <textarea
                  ref={textareaRef}
                  value={message}
                  onChange={handleInput}
                  placeholder="Сообщение..."
                  className="hide-scrollbar w-full bg-transparent px-2 text-[15px] leading-[24px] text-[#E8E6E3] outline-none placeholder:text-[#6A6965] resize-none overflow-y-auto min-h-[24px] pr-8"
                />
                <div className="flex items-center justify-end mt-1">
                  <button
                    onClick={() => onSend()}
                    disabled={message.trim().length < 2}
                    className="flex h-[32px] w-[32px] items-center justify-center rounded-[10px] bg-[#5FA86D] transition-all hover:bg-[#6FBD7E] disabled:opacity-20 active:scale-95"
                  >
                    <img src="/icons/send.svg" className="w-4 h-4 invert brightness-50" alt="Send" />
                  </button>
                </div>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </main>
  );
}
