"use client";

import { useEffect, useRef, useState, useMemo } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { ChatThread, type ChatMessage } from "@/components/chat-thread";
import { MenuDrawer } from "@/components/menu-drawer";

const PromptRow = ({ items, direction, speed, onPick }: any) => {
  const scrollClass = direction === 'left' ? 'animate-marquee-left' : 'animate-marquee-right';
  return (
    <div className="flex overflow-hidden py-2 select-none w-full">
      <div className={`flex shrink-0 items-center gap-3 ${scrollClass}`} style={{ animationDuration: speed }}>
        {[...items, ...items].map((item: string, idx: number) => (
          <button 
            key={idx} 
            onClick={() => onPick(item)}
            className="whitespace-nowrap rounded-xl border border-white/5 bg-white/[0.02] px-4 py-2 text-[14px] text-[#9A9894] transition-all duration-200 hover:bg-white/5 hover:text-[#C5C4C0] active:scale-95"
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
      .catch(() => setAllPrompts(["Гайд на Гранд-мастера Йоду", "Лучшие модули для Вейдера", "Команды для Великой арены", "Как победить в Войне гильдий", "Приоритеты фарма 2024"]));
  }, []);

  const rows = useMemo(() => {
    if (allPrompts.length === 0) return [];
    return [
      { items: allPrompts.slice(0, 15), dir: 'left', speed: '140s' },
      { items: allPrompts.slice(15, 30), dir: 'right', speed: '130s' },
    ];
  }, [allPrompts]);

  const handleInput = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    setMessage(e.target.value);
    if (textareaRef.current) {
      textareaRef.current.style.height = '24px';
      const newHeight = Math.min(e.target.scrollHeight, 100);
      textareaRef.current.style.height = `${newHeight}px`;
    }
  };

  const onSend = (overrideText?: string) => {
    const content = overrideText || message;
    if (content.trim().length < 2) return;

    const userMsg: ChatMessage = { 
      id: Date.now().toString(), 
      role: "user", 
      content: content.trim() 
    };
    
    setMessages(prev => [...prev, userMsg]);
    setChatStarted(true);
    setMessage("");
    
    if (textareaRef.current) textareaRef.current.style.height = '24px';

    setTimeout(() => {
      const aiMsg: ChatMessage = { 
        id: (Date.now() + 1).toString(), 
        role: "assistant", 
        content: "Для Дарта Вейдера критически важна скорость и шанс критического удара. В идеале тебе нужно собрать сет на Скорость и Эффективность, чтобы он ходил первым и накладывал дебаффы. В допах ищи Скорость, Атаку и Шанс крита." 
      };
      setMessages(prev => [...prev, aiMsg]);
    }, 800);
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

      <MenuDrawer open={isMenuOpen} onClose={() => setIsMenuOpen(false)} />

      <AnimatePresence mode="popLayout" initial={false}>
        {!chatStarted ? (
          <motion.div 
            key="start"
            initial={{ y: "-100%", opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            exit={{ y: "-100%", opacity: 0 }}
            transition={{ duration: 0.5, ease: [0.22, 1, 0.36, 1] }}
            className="absolute inset-0 flex flex-col items-center justify-center pb-[8dvh] bg-[#252422] z-40"
          >
            <div className="absolute top-8 left-10">
              <button onClick={() => setIsMenuOpen(true)} className="p-1 active:scale-90 transition-transform">
                <img src="/icons/menu.svg" alt="Menu" className="w-7 h-7 opacity-40 hover:opacity-100 invert" />
              </button>
            </div>

            <div className="w-full max-w-[700px] px-10 mb-10 flex flex-col items-start">
              <img src="/icons/logo.PNG" alt="Logo" className="w-12 h-12 mb-6 opacity-90" />
              <div className="space-y-1">
                <h2 className="text-[32px] leading-tight font-serif text-[#F2F1ED] tracking-tight">
                  Привет, <span className="text-[#5FA86D]">юзер</span>
                </h2>
                <h1 className="text-[32px] leading-tight font-serif text-[#6A6965] tracking-tight">
                  Как помочь тебе сегодня?
                </h1>
              </div>
            </div>

            <div className="w-full space-y-2 mb-10 opacity-70">
              {rows.map((row, i) => (
                <PromptRow key={i} items={row.items} direction={row.dir} speed={row.speed} onPick={(t:string) => setMessage(t)} />
              ))}
            </div>

            <div className="w-full max-w-[700px] px-10">
              <div className="relative flex w-full flex-col bg-[#2D2C2A] rounded-[24px] border border-white/[0.04] p-4 shadow-xl">
                <textarea
                  ref={textareaRef}
                  value={message}
                  onChange={handleInput}
                  placeholder="Спросить что-нибудь..."
                  className="hide-scrollbar w-full bg-transparent px-2 text-[16px] leading-[24px] text-[#E8E6E3] outline-none placeholder:text-[#6A6965] resize-none overflow-y-auto min-h-[24px]"
                  onKeyDown={(e) => { if (e.key === 'Enter' && !e.shiftKey) e.preventDefault(); }}
                />
                <div className="flex items-center justify-end mt-3">
                  <button
                    onClick={() => onSend()}
                    disabled={message.trim().length < 2}
                    className="flex h-[40px] w-[40px] items-center justify-center rounded-[14px] bg-[#5FA86D] transition-all hover:bg-[#6FBD7E] disabled:opacity-20 active:scale-95"
                  >
                    <img src="/icons/send.svg" className="w-5 h-5 invert brightness-50" alt="Send" />
                  </button>
                </div>
              </div>
              <p className="mt-5 text-center text-[12px] leading-relaxed text-[#6A6965] px-6">
                Хотя мы стараемся сделать ваш опыт общения лучше, это ИИ и он может ошибаться
              </p>
            </div>
          </motion.div>
        ) : (
          <motion.div 
            key="chat"
            initial={{ y: "100%", opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            exit={{ y: "100%", opacity: 0 }}
            transition={{ duration: 0.5, ease: [0.22, 1, 0.36, 1] }}
            className="absolute inset-0 flex flex-col bg-[#252422] z-50"
          >
            <div className="flex-1 overflow-hidden relative">
              <ChatThread 
                messages={messages} 
                onNewChat={handleNewChat} 
                onOpenMenu={() => setIsMenuOpen(true)} 
              />
            </div>
            
            <div className="w-full max-w-[700px] mx-auto px-10 pb-10 pt-2">
              <div className="relative flex w-full flex-col bg-[#2D2C2A] rounded-[22px] border border-white/[0.04] p-4 shadow-lg">
                <button className="absolute top-3 right-3 p-1 opacity-20 hover:opacity-60 transition-opacity">
                  <img src="/icons/arrows.svg" alt="Expand" className="w-4 h-4 invert" />
                </button>

                <textarea
                  ref={textareaRef}
                  value={message}
                  onChange={handleInput}
                  placeholder="Сообщение..."
                  className="hide-scrollbar w-full bg-transparent px-2 text-[16px] leading-[24px] text-[#E8E6E3] outline-none placeholder:text-[#6A6965] resize-none overflow-y-auto min-h-[24px] pr-10"
                  onKeyDown={(e) => { if (e.key === 'Enter' && !e.shiftKey) e.preventDefault(); }}
                />
                <div className="flex items-center justify-end mt-2">
                  <button
                    onClick={() => onSend()}
                    disabled={message.trim().length < 2}
                    className="flex h-[36px] w-[36px] items-center justify-center rounded-[12px] bg-[#5FA86D] transition-all hover:bg-[#6FBD7E] disabled:opacity-20 active:scale-95"
                  >
                    <img src="/icons/send.svg" className="w-4.5 h-4.5 invert brightness-50" alt="Send" />
                  </button>
                </div>
              </div>
              <p className="mt-4 text-center text-[11px] text-[#6A6965] px-10">
                Хотя мы стараемся сделать ваш опыт общения лучше, это ИИ и он может ошибаться
              </p>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </main>
  );
}
