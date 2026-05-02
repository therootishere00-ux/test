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

  // Автоскролл при новых сообщениях
  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTo({
        top: scrollRef.current.scrollHeight,
        behavior: "smooth",
      });
    }
  }, [messages]);

  return (
    <div className="flex flex-col h-full w-full max-w-[600px] mx-auto relative">
      {/* Header чата */}
      <div className="flex items-center justify-between py-4 mb-4 border-b border-white/[0.05]">
        <span className="text-[13px] text-[#6A6965] font-medium tracking-wider uppercase">Чат сессия</span>
        <button 
          onClick={onNewChat}
          className="p-2 -mr-2 active:scale-90 transition-transform"
        >
          <img src="/icons/newchat.svg" alt="New Chat" className="w-5 h-5 opacity-40" />
        </button>
      </div>

      {/* Контейнер сообщений */}
      <div 
        ref={scrollRef}
        className="flex-1 overflow-y-auto hide-scrollbar space-y-8 pb-10"
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
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      className={`flex w-full ${isUser ? "justify-end" : "justify-start"}`}
    >
      <div className={`flex flex-col ${isUser ? "items-end max-w-[85%]" : "items-start w-full"}`}>
        
        {isUser ? (
          /* Блок пользователя */
          <div className="bg-[#5FA86D] text-[#1A1A18] px-4 py-2.5 rounded-[18px] rounded-tr-[4px] shadow-sm">
            <p className="text-[15px] leading-relaxed whitespace-pre-wrap">{message.content}</p>
          </div>
        ) : (
          /* Блок ИИ */
          <div className="flex flex-col w-full space-y-4">
            <div className="text-[#E8E6E3] text-[15px] leading-[1.6] whitespace-pre-wrap">
              {message.content}
            </div>
            
            {/* Панель инструментов под ответом */}
            <div className="flex items-center gap-4 ml-0.5">
              <button className="active:scale-90 transition-transform opacity-30 hover:opacity-60">
                <img src="/icons/redo.svg" alt="Redo" className="w-4 h-4" />
              </button>
              
              <div className="flex items-center gap-3">
                <button 
                  onClick={() => setFeedback(feedback === 'like' ? null : 'like')}
                  className="active:scale-90 transition-transform"
                >
                  <img 
                    src="/icons/like.svg" 
                    alt="Like" 
                    className={`w-4 h-4 transition-colors ${feedback === 'like' ? 'brightness-100' : 'opacity-30'}`}
                    style={feedback === 'like' ? { filter: 'invert(58%) sepia(13%) saturate(1067%) hue-rotate(82deg) brightness(96%) contrast(87%)' } : {}}
                  />
                </button>
                <button 
                  onClick={() => setFeedback(feedback === 'dislike' ? null : 'dislike')}
                  className="active:scale-90 transition-transform"
                >
                  <img 
                    src="/icons/dislike.svg" 
                    alt="Dislike" 
                    className={`w-4 h-4 transition-colors ${feedback === 'dislike' ? 'brightness-100' : 'opacity-30'}`}
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
