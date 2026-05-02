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
    <div className="flex flex-col h-full w-full max-w-[600px] mx-auto relative">
      {/* Header */}
      <div className="flex items-center justify-between py-6 mb-2 border-b border-white/[0.04]">
        <span className="text-[12px] text-[#6A6965] font-medium tracking-widest uppercase">Чат сессия</span>
        <button 
          onClick={onNewChat}
          className="p-1 active:scale-90 transition-transform hover:bg-white/5 rounded-lg"
        >
          <img src="/icons/newchat.svg" alt="New Chat" className="w-[22px] h-[22px] opacity-70" />
        </button>
      </div>

      {/* Messages */}
      <div 
        ref={scrollRef}
        className="flex-1 overflow-y-auto hide-scrollbar space-y-8 pb-10 pt-4"
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
          <div className="bg-[#5FA86D] text-[#1A1A18] px-4 py-2.5 rounded-[18px] rounded-tr-[4px] shadow-sm">
            <p className="text-[15px] leading-relaxed whitespace-pre-wrap">{message.content}</p>
          </div>
        ) : (
          <div className="flex flex-col w-full space-y-3">
            <div className="text-[#E8E6E3] text-[15px] leading-[1.65] whitespace-pre-wrap">
              {message.content}
            </div>
            
            {/* Feedback Toolbar */}
            <div className="flex items-center gap-4 ml-1">
              <button className="active:scale-90 transition-all opacity-50 hover:opacity-100">
                <img src="/icons/redo.svg" alt="Redo" className="w-[18px] h-[18px]" />
              </button>
              
              <div className="flex items-center gap-3">
                <button 
                  onClick={() => setFeedback(feedback === 'like' ? null : 'like')}
                  className="active:scale-90 transition-all"
                >
                  <img 
                    src="/icons/like.svg" 
                    alt="Like" 
                    className={`w-[18px] h-[18px] transition-all ${feedback === 'like' ? 'brightness-100 opacity-100' : 'opacity-50 hover:opacity-100'}`}
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
                    className={`w-[18px] h-[18px] transition-all ${feedback === 'dislike' ? 'brightness-100 opacity-100' : 'opacity-50 hover:opacity-100'}`}
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
