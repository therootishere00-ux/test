"use client";

import { useEffect, useRef, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";

export type ChatMessage = {
  id: string;
  role: "user" | "assistant";
  content: string;
};

type ChatThreadProps = {
  messages: ChatMessage[];
  onNewChat: () => void;
  onOpenMenu: () => void;
};

// Компонент для пословной анимации текста ИИ
function AnimatedAIResponse({ text }: { text: string }) {
  const words = text.split(" ");
  
  const container = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      // 0.16s задержка = ~6 слов в секунду
      transition: { staggerChildren: 0.16 }
    }
  };

  const wordAnim = {
    hidden: { opacity: 0, filter: "blur(4px)", y: 2 },
    visible: { 
      opacity: 1, 
      filter: "blur(0px)",
      y: 0,
      transition: { duration: 0.2, ease: "easeOut" }
    }
  };

  return (
    <motion.div 
      variants={container} 
      initial="hidden" 
      animate="visible"
      className="text-[#E8E6E3] text-[16px] leading-[1.65] font-serif"
    >
      {words.map((word, index) => (
        <motion.span key={index} variants={wordAnim} className="inline-block mr-1.5">
          {word}
        </motion.span>
      ))}
    </motion.div>
  );
}

export function ChatThread({ messages, onNewChat, onOpenMenu }: ChatThreadProps) {
  const scrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTo({
        top: scrollRef.current.scrollHeight,
        behavior: "smooth",
      });
    }
  }, [messages]);

  return (
    <div className="flex flex-col h-full w-full max-w-[600px] mx-auto relative pt-4">
      {/* Жесткая невысокая шапка без блюра */}
      <div className="w-full flex items-center justify-between py-2 z-10 bg-[#252422]">
        <button 
          onClick={onOpenMenu}
          className="p-1 active:scale-90 transition-transform"
        >
          <img src="/icons/menu.svg" alt="Menu" className="w-[22px] h-[22px] opacity-40 hover:opacity-80 invert" />
        </button>
        
        <span className="text-[14px] text-[#F2F1ED] font-sans">Новый чат</span>
        
        <button 
          onClick={onNewChat}
          className="p-1 active:scale-90 transition-transform"
        >
          <img src="/icons/newchat.svg" alt="New Chat" className="w-[22px] h-[22px] opacity-40 hover:opacity-80 invert" />
        </button>
      </div>

      {/* Messages */}
      <div 
        ref={scrollRef}
        className="flex-1 overflow-y-auto hide-scrollbar space-y-10 pb-6 pt-6"
      >
        <AnimatePresence initial={false}>
          {messages.map((msg) => (
            <MessageItem key={msg.id} message={msg} />
          ))}
        </AnimatePresence>
      </div>
    </div>
  );
}

function MessageItem({ message }: { message: ChatMessage }) {
  const isUser = message.role === "user";
  const [feedback, setFeedback] = useState<'like' | 'dislike' | null>(null);

  return (
    <motion.div
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.25, ease: [0.22, 1, 0.36, 1] }}
      className={`flex w-full ${isUser ? "justify-end" : "justify-start"}`}
    >
      <div className={`flex flex-col ${isUser ? "items-end max-w-[85%]" : "items-start w-full"}`}>
        {isUser ? (
          <div className="px-2 py-1">
            <p className="text-[16px] leading-relaxed whitespace-pre-wrap font-serif text-[#F2F1ED] opacity-90">{message.content}</p>
          </div>
        ) : (
          <div className="flex flex-col w-full space-y-3">
            <img src="/icons/logo.GIF" alt="AI" className="w-7 h-7 mb-1 opacity-90" />
            
            {/* Пословная анимация ответа ИИ */}
            <AnimatedAIResponse text={message.content} />
            
            <div className="flex items-center gap-4 ml-1 pt-2">
              <button className="active:scale-90 transition-all opacity-40 hover:opacity-80">
                <img src="/icons/redo.svg" alt="Redo" className="w-[18px] h-[18px] invert" />
              </button>
              
              <div className="flex items-center gap-3">
                <button 
                  onClick={() => setFeedback(feedback === 'like' ? null : 'like')}
                  className="active:scale-90 transition-all"
                >
                  <img 
                    src="/icons/like.svg" 
                    alt="Like" 
                    className={`w-[18px] h-[18px] transition-all ${feedback === 'like' ? 'brightness-100 opacity-100' : 'opacity-40 hover:opacity-80 invert'}`}
                    style={feedback === 'like' ? { filter: 'invert(58%) sepia(13%) saturate(1067%) hue-rotate(82deg) brightness(96%) contrast(87%)' } : {}}
                  />
                </button>
                <button 
                  onClick={() => setFeedback(feedback === 'dislike' ? null : 'dislike')}
                  className="active:scale-90 transition-all"
                >
                  <img 
                    src="/icons/dislike.svg" 
                    alt="Dislike" 
                    className={`w-[18px] h-[18px] transition-all ${feedback === 'dislike' ? 'brightness-100 opacity-100' : 'opacity-40 hover:opacity-80 invert'}`}
                    style={feedback === 'dislike' ? { filter: 'invert(58%) sepia(13%) saturate(1067%) hue-rotate(82deg) brightness(96%) contrast(87%)' } : {}}
                  />
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </motion.div>
  );
}
