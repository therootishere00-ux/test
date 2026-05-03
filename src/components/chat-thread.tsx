"use client";

import { useEffect, useRef, useState, useMemo } from "react";
import { motion, AnimatePresence } from "framer-motion";

export type ChatMessage = {
  id: string;
  role: "user" | "assistant";
  content: string;
};

// Анимация появления ГРУППАМИ слов
function AnimatedAIResponse({ text, onComplete }: { text: string, onComplete: () => void }) {
  // Разбиваем текст на группы по 4-6 слов
  const groups = useMemo(() => {
    const words = text.split(" ");
    const result = [];
    for (let i = 0; i < words.length; i += 5) {
      result.push(words.slice(i, i + 5).join(" "));
    }
    return result;
  }, [text]);

  const container = {
    hidden: { opacity: 1 },
    visible: {
      opacity: 1,
      transition: { staggerChildren: 0.12 } // Скорость появления групп
    }
  };

  const groupAnim = {
    hidden: { opacity: 0 },
    visible: { 
      opacity: 1, 
      transition: { duration: 0.3, ease: "linear" }
    }
  };

  return (
    <motion.div 
      variants={container} 
      initial="hidden" 
      animate="visible"
      onAnimationComplete={onComplete}
      className="text-[#E8E6E3] text-[16px] leading-[1.65] font-serif"
    >
      {groups.map((group, index) => (
        <motion.span key={index} variants={groupAnim} className="inline mr-1.5">
          {group}{" "}
        </motion.span>
      ))}
    </motion.div>
  );
}

export function ChatThread({ messages, onNewChat, onOpenMenu }: any) {
  const scrollRef = useRef<HTMLDivElement>(null);

  // Скролл при каждом изменении сообщений
  useEffect(() => {
    if (scrollRef.current) {
      const scroll = scrollRef.current;
      scroll.scrollTo({ top: scroll.scrollHeight, behavior: "smooth" });
    }
  }, [messages]);

  return (
    <div className="flex flex-col h-full w-full max-w-[600px] mx-auto relative pt-4">
      <div className="w-full flex items-center justify-between py-2 z-10 bg-[#252422]">
        <button onClick={onOpenMenu} className="p-1 active:scale-90 transition-transform">
          <img src="/icons/menu.svg" alt="Menu" className="w-[22px] h-[22px] opacity-40 hover:opacity-80 invert" />
        </button>
        <span className="text-[14px] text-[#F2F1ED] font-sans">Новый чат</span>
        <button onClick={onNewChat} className="p-1 active:scale-90 transition-transform">
          <img src="/icons/newchat.svg" alt="New Chat" className="w-[22px] h-[22px] opacity-40 hover:opacity-80 invert" />
        </button>
      </div>

      <div ref={scrollRef} className="flex-1 overflow-y-auto hide-scrollbar space-y-10 pb-20 pt-6">
        <AnimatePresence initial={false}>
          {messages.map((msg: ChatMessage) => (
            <MessageItem key={msg.id} message={msg} />
          ))}
        </AnimatePresence>
        
        {/* "Блок-заполнитель" — если последнее сообщение от пользователя, резервируем место под ответ */}
        {messages[messages.length - 1]?.role === "user" && (
          <div className="h-[200px] w-full" /> 
        )}
      </div>
    </div>
  );
}

function MessageItem({ message }: { message: ChatMessage }) {
  const isUser = message.role === "user";
  const [feedback, setFeedback] = useState<'like' | 'dislike' | null>(null);
  const [isTyping, setIsTyping] = useState(!isUser);

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      className={`flex w-full ${isUser ? "justify-end" : "justify-start"}`}
    >
      <div className={`flex flex-col ${isUser ? "items-end max-w-[85%]" : "items-start w-full"}`}>
        {isUser ? (
          <div className="px-2 py-1">
            <p className="text-[17px] leading-relaxed whitespace-pre-wrap font-serif text-[#F2F1ED] opacity-90">{message.content}</p>
          </div>
        ) : (
          <div className="flex flex-col w-full space-y-3">
            {/* Смена GIF на PNG */}
            <div className="relative w-7 h-7 mb-1">
              <AnimatePresence mode="wait">
                {isTyping ? (
                  <motion.img 
                    key="gif"
                    src="/icons/logo.GIF" 
                    initial={{ opacity: 0 }} animate={{ opacity: 0.9 }} exit={{ opacity: 0 }}
                    transition={{ duration: 0.3 }}
                    className="absolute inset-0 w-7 h-7" 
                  />
                ) : (
                  <motion.img 
                    key="png"
                    src="/icons/logo.PNG" 
                    initial={{ opacity: 0, scale: 0.8 }} animate={{ opacity: 0.9, scale: 1 }}
                    transition={{ duration: 0.3 }}
                    className="absolute inset-0 w-7 h-7" 
                  />
                )}
              </AnimatePresence>
            </div>
            
            <AnimatedAIResponse 
              text={message.content} 
              onComplete={() => setIsTyping(false)} 
            />
            
            {!isTyping && (
              <motion.div 
                initial={{ opacity: 0 }} 
                animate={{ opacity: 1 }}
                className="flex items-center gap-4 ml-1 pt-2"
              >
                <button className="active:scale-90 transition-all opacity-40 hover:opacity-80">
                  <img src="/icons/redo.svg" alt="Redo" className="w-[18px] h-[18px] invert" />
                </button>
                
                <div className="flex items-center gap-3">
                  <button onClick={() => setFeedback(feedback === 'like' ? null : 'like')} className="active:scale-90">
                    <img 
                      src="/icons/like.svg" 
                      className={`w-[18px] h-[18px] ${feedback === 'like' ? 'opacity-100' : 'opacity-40 invert'}`}
                      style={feedback === 'like' ? { filter: 'invert(58%) sepia(13%) saturate(1067%) hue-rotate(82deg) brightness(96%) contrast(87%)' } : {}}
                    />
                  </button>
                  <button onClick={() => setFeedback(feedback === 'dislike' ? null : 'dislike')} className="active:scale-90">
                    <img 
                      src="/icons/dislike.svg" 
                      className={`w-[18px] h-[18px] ${feedback === 'dislike' ? 'opacity-100' : 'opacity-40 invert'}`}
                      style={feedback === 'dislike' ? { filter: 'invert(58%) sepia(13%) saturate(1067%) hue-rotate(82deg) brightness(96%) contrast(87%)' } : {}}
                    />
                  </button>
                </div>
              </motion.div>
            )}
          </div>
        )}
      </div>
    </motion.div>
  );
}
