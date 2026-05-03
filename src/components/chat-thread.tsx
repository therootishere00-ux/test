"use client";

import { useEffect, useRef, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";

export type ChatMessage = {
  id: string;
  role: "user" | "assistant";
  content: string;
  isGenerating?: boolean;
};

// Анимация: появление группами слов на месте (fade-in)
function AnimatedWords({ text, onComplete }: { text: string; onComplete: () => void }) {
  const words = text.split(" ");
  const [visibleCount, setVisibleCount] = useState(0);
  const step = 5; // По 5 слов за раз

  useEffect(() => {
    const interval = setInterval(() => {
      setVisibleCount(prev => {
        if (prev + step >= words.length) {
          clearInterval(interval);
          onComplete();
          return words.length;
        }
        return prev + step;
      });
    }, 150); // Скорость появления групп
    return () => clearInterval(interval);
  }, [words.length]);

  return (
    <div className="text-[#E8E6E3] text-[17px] leading-[1.6] font-serif">
      {words.map((word, i) => (
        <motion.span
          key={i}
          initial={{ opacity: 0 }}
          animate={{ opacity: i < visibleCount ? 1 : 0 }}
          transition={{ duration: 0.3 }}
          className="inline-block mr-1.5"
        >
          {word}
        </motion.span>
      ))}
    </div>
  );
}

export function ChatThread({ messages, onNewChat, onOpenMenu }: any) {
  const scrollRef = useRef<HTMLDivElement>(null);

  // При каждом новом сообщении (даже пустом) заранее опускаем скролл
  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTo({ top: scrollRef.current.scrollHeight, behavior: "smooth" });
    }
  }, [messages]);

  return (
    <div className="flex flex-col h-full w-full max-w-[600px] mx-auto px-6 relative">
      <div className="w-full flex items-center justify-between py-4 bg-[#252422] z-10">
        <button onClick={onOpenMenu} className="p-1"><img src="/icons/menu.svg" className="w-6 h-6 invert opacity-40" alt="" /></button>
        <span className="text-[14px] font-sans text-[#F2F1ED] opacity-80">Новый чат</span>
        <button onClick={onNewChat} className="p-1"><img src="/icons/newchat.svg" className="w-6 h-6 invert opacity-40" alt="" /></button>
      </div>

      <div ref={scrollRef} className="flex-1 overflow-y-auto hide-scrollbar space-y-12 pb-10 pt-4">
        {messages.map((msg: ChatMessage, idx: number) => (
          <MessageBlock key={msg.id} message={msg} />
        ))}
      </div>
    </div>
  );
}

function MessageBlock({ message }: { message: ChatMessage }) {
  const isUser = message.role === "user";
  const [isDone, setIsDone] = useState(!message.isGenerating);

  return (
    <div className={`flex w-full ${isUser ? "justify-end" : "justify-start"}`}>
      <div className={`flex flex-col ${isUser ? "max-w-[90%]" : "w-full"}`}>
        {isUser ? (
          <p className="text-[17px] font-serif text-[#F2F1ED] opacity-90 text-right">{message.content}</p>
        ) : (
          <div className="flex flex-col space-y-4">
            {/* Смена логотипа: GIF пока печатает, потом плавно PNG */}
            <div className="h-8 w-8 relative">
              <AnimatePresence mode="wait">
                {!isDone ? (
                  <motion.img 
                    key="gif" 
                    src="/icons/logo.GIF" 
                    initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
                    className="absolute inset-0 w-8 h-8"
                  />
                ) : (
                  <motion.img 
                    key="png" 
                    src="/icons/logo.PNG" 
                    initial={{ opacity: 0 }} animate={{ opacity: 1 }}
                    className="absolute inset-0 w-8 h-8"
                  />
                )}
              </AnimatePresence>
            </div>

            <AnimatedWords text={message.content} onComplete={() => setIsDone(true)} />

            {isDone && (
              <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="flex gap-4 pt-2">
                <img src="/icons/redo.svg" className="w-4 h-4 invert opacity-30" alt="" />
                <img src="/icons/like.svg" className="w-4 h-4 invert opacity-30" alt="" />
                <img src="/icons/dislike.svg" className="w-4 h-4 invert opacity-30" alt="" />
              </motion.div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
