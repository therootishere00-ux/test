"use client";

import { useEffect, useRef, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { ChatThread, type ChatMessage } from "@/components/chat-thread";
import { MenuDrawer } from "@/components/menu-drawer";

// Иконка-звездочка в стиле Claude
const SparkleIcon = () => (
  <svg 
    width="36" 
    height="36" 
    viewBox="0 0 24 24" 
    fill="none" 
    xmlns="http://www.w3.org/2000/svg"
    className="text-[#D46B53] drop-shadow-sm"
  >
    <path d="M12 2L12.8 8.5L19 7L14.5 11.5L20 16L13.5 14.5L12 21L10.5 14.5L4 16L9.5 11.5L5 7L11.2 8.5L12 2Z" fill="currentColor"/>
  </svg>
);

export function StartScreen() {
  const [message, setMessage] = useState("");
  const [isAnimating, setIsAnimating] = useState(false);
  const [chatStarted, setChatStarted] = useState(false);
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  
  // Храним 5 случайных подсказок для сетки
  const [displayPrompts, setDisplayPrompts] = useState<string[]>([]);
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  useEffect(() => {
    fetch('/slovar.txt')
      .then(res => res.text())
      .then(data => {
        const lines = data.split(/\r?\n/).filter(line => line.trim().length > 0);
        const shuffled = lines.sort(() => Math.random() - 0.5);
        setDisplayPrompts(shuffled.slice(0, 5)); // Берем только 5 штук для красивой сетки
      })
      .catch(() => setDisplayPrompts(["Как собрать отряд?", "Кого качать первым?", "Тактики на ВГ"]));
  }, []);

  useEffect(() => {
    const textarea = textareaRef.current;
    if (textarea) {
      textarea.style.height = 'auto';
      const scrollHeight = textarea.scrollHeight;
      textarea.style.height = `${Math.max(Math.min(scrollHeight, 120), 24)}px`;
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
        .hide-scrollbar::-webkit-scrollbar { display: none; }
      `}</style>

      <div 
        className={`flex h-full flex-col transition-all duration-500 ease-[cubic-bezier(0.34,1.56,0.64,1)] origin-center ${
          isMenuOpen ? 'blur-[8px] scale-[0.96] opacity-40' : 'blur-0 scale-100 opacity-100'
        }`}
        style={{ willChange: "transform, filter, opacity" }}
      >
        
        {/* Верхняя панель (минималистичная) */}
        <div className="absolute left-0 right-0 top-0 z-50 flex items-center justify-between px-6 py-6">
          <button 
            onClick={() => setIsMenuOpen(true)} 
            className="flex h-10 w-10 items-center justify-center transition-transform duration-200 active:scale-[0.85] opacity-60 hover:opacity-100"
          >
            <img src="/icons/menu.PNG" className="h-5 w-5 object-contain invert brightness-0" alt="Menu" />
          </button>
          <button className="flex h-10 w-10 items-center justify-center transition-transform duration-200 active:scale-[0.85] opacity-60 hover:opacity-100">
            <img src="/icons/profile.PNG" className="h-5 w-5 object-contain invert brightness-0" alt="Profile" />
          </button>
        </div>

        {!chatStarted ? (
          <div className="flex h-full flex-col items-center justify-center px-5">
            
            {/* Заголовок со звездой */}
            <motion.div 
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8, ease: "easeOut" }}
              className="mb-10 flex flex-col items-center gap-5 text-center"
            >
              <SparkleIcon />
              <h1 className="text-[36px] leading-[1.1] font-serif tracking-tight text-[#F2F1ED]">
                О чем думаешь,<br />хм?
              </h1>
            </motion.div>

            {/* Блок ввода и подсказок */}
            <div className="w-full max-w-[650px] flex flex-col items-center gap-5">
              
              {/* Поле ввода (в стиле Claude) */}
              <motion.div 
                initial={{ opacity: 0, y: 15 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.7, delay: 0.1, ease: [0.22, 1, 0.36, 1] }}
                className="relative flex w-full flex-col bg-[#2D2C2A] rounded-[24px] border border-white/5 z-10 shadow-lg transition-colors duration-300 focus-within:border-white/10 focus-within:bg-[#302F2D]"
              >
                <div className="relative flex flex-col min-h-[100px] p-3">
                  <AnimatePresence mode="wait">
                    {isAnimating && (
                      <motion.div
                        key="animating-text"
                        initial={{ opacity: 0, y: 4 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0 }}
                        transition={{ duration: 0.15 }}
                        className="absolute left-4 top-4 w-[calc(100%-32px)] text-[16px] leading-[1.5] text-[#E8E6E3] pointer-events-none"
                      >
                        {message}
                      </motion.div>
                    )}
                  </AnimatePresence>

                  <textarea
                    ref={textareaRef}
                    value={message}
                    onChange={(e) => setMessage(e.target.value)}
                    placeholder={isAnimating ? "" : "Спросить что-нибудь..."}
                    className={`hide-scrollbar w-full flex-1 bg-transparent px-1 pt-1 pb-4 text-[16px] leading-[1.5] text-[#E8E6E3] outline-none placeholder:text-[#7A7975] resize-none transition-opacity duration-150 ${isAnimating ? 'opacity-0' : 'opacity-100'}`}
                    onKeyDown={(e) => { if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); onSend(); } }}
                  />

                  {/* Нижняя панелька в поле ввода */}
                  <div className="flex items-center justify-between mt-auto">
                    <div className="flex items-center gap-2 pl-1">
                      {/* Декоративная кнопка плюса (как на скрине) */}
                      <button className="flex h-8 w-8 items-center justify-center rounded-[10px] border border-white/10 transition-colors hover:bg-white/5 active:scale-95">
                        <span className="text-[#A3A29D] text-lg font-light leading-none">+</span>
                      </button>
                    </div>

                    <button
                      onClick={() => onSend()}
                      disabled={message.trim().length < 2 || isAnimating}
                      className="flex h-8 w-10 items-center justify-center rounded-[10px] bg-[#D46B53] transition-all duration-200 active:scale-90 hover:bg-[#E37A62] disabled:opacity-30 disabled:hover:bg-[#D46B53] disabled:active:scale-100"
                    >
                      <svg width="16" height="16" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" className="text-[#252422]">
                        <path d="M12 20L12 4M12 4L6 10M12 4L18 10" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"/>
                      </svg>
                    </button>
                  </div>
                </div>
              </motion.div>

              {/* Сетка подсказок (вместо бегущей строки) */}
              {displayPrompts.length > 0 && (
                <motion.div 
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ duration: 0.8, delay: 0.3 }}
                  className="flex flex-wrap items-center justify-center gap-2.5 px-2"
                >
                  {displayPrompts.map((item, idx) => (
                    <button 
                      key={idx} 
                      onClick={() => handlePick(item)}
                      className="flex items-center gap-2 rounded-xl border border-[#403E3B] bg-transparent px-4 py-2 text-[14px] text-[#9A9894] transition-all duration-200 hover:bg-[#32312F] hover:text-[#C5C4C0] active:scale-95"
                    >
                      {item}
                    </button>
                  ))}
                </motion.div>
              )}

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
