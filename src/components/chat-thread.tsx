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
};

export function ChatThread({ messages, onNewChat }: ChatThreadProps) {
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
    <div className="flex flex-col h-full w-full max-w-[600px] mx-auto relative pt-8">
      {/* Хедер с блюром */}
      <div className="absolute top-0 left-0 w-full flex items-center justify-between py-6 z-10 bg-transparent backdrop-blur-xl border-b border-white/[0.02]">
        <span className="text-[12px] text-[#6A6965] font-medium tracking-widest uppercase ml-12">Чат сессия</span>
        <button 
          onClick={onNewChat}
          className="p-1 active:scale-90 transition-transform hover:bg-white/5 rounded-lg"
        >
          <img src="/icons/newchat.svg" alt="New Chat" className="w-[22px] h-[22px] opacity-40 hover:opacity-80 invert" />
        </button>
      </div>

      {/* Messages */}
      <div 
        ref={scrollRef}
        className="flex-1 overflow-y-auto hide-scrollbar space-y-10 pb-[120px] pt-20"
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
          /* Сообщение пользователя: без фона, font-serif */
          <div className="px-2 py-1">
            <p className="text-[16px] leading-relaxed whitespace-pre-wrap font-serif text-[#F2F1ED] opacity-90">{message.content}</p>
          </div>
        ) : (
          <div className="flex flex-col w-full space-y-3">
            {/* Анимация logo.GIF над ответом ИИ */}
            <img src="/icons/logo.GIF" alt="AI" className="w-7 h-7 mb-1 opacity-90" />
            
            <div className="text-[#E8E6E3] text-[16px] leading-[1.65] whitespace-pre-wrap font-serif">
              {message.content}
            </div>
            
            {/* Feedback Toolbar */}
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
