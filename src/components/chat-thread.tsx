"use client";

import { useEffect, useRef, useState, useMemo } from "react";
import { motion, AnimatePresence } from "framer-motion";

export type ChatMessage = {
  id: string;
  role: "user" | "assistant";
  content: string;
  isPlaceholder?: boolean;
};

type ChatThreadProps = {
  messages: ChatMessage[];
  onNewChat: () => void;
  onOpenMenu: () => void;
};

function AnimatedAIResponse({ text, onComplete }: { text: string; onComplete: () => void }) {
  const chunks = useMemo(() => {
    const words = text.split(" ");
    const result = [];
    for (let i = 0; i < words.length; i += 4) {
      result.push(words.slice(i, i + 4).join(" "));
    }
    return result;
  }, [text]);
  
  const container = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: { 
        staggerChildren: 0.12,
        onComplete: onComplete 
      }
    }
  };

  const chunkAnim = {
    hidden: { opacity: 0, filter: "blur(4px)" },
    visible: { 
      opacity: 1, 
      filter: "blur(0px)",
      transition: { duration: 0.3, ease: "easeOut" }
    }
  };

  return (
    <motion.div 
      variants={container} 
      initial="hidden" 
      animate="visible"
      className="text-[#E8E6E3] text-[16px] leading-[1.65] font-serif"
    >
      {chunks.map((chunk, index) => (
        <motion.span key={index} variants={chunkAnim} className="inline-block mr-1.5">
          {chunk}
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
      <div className="w-full flex items-center justify-between py-2 z-10 bg-[#252422]">
        <button onClick={onOpenMenu} className="p-1 active:scale-90 transition-transform">
          <img src="/icons/menu.svg" alt="Menu" className="w-[22px] h-[22px] opacity-40 hover:opacity-80 invert" />
        </button>
        <span className="text-[14px] text-[#F2F1ED] font-sans">Новый чат</span>
        <button onClick={onNewChat} className="p-1 active:scale-90 transition-transform">
          <img src="/icons/newchat.svg" alt="New Chat" className="w-[22px] h-[22px] opacity-40 hover:opacity-80 invert" />
        </button>
      </div>

      {/* Добавлен overflow-x-hidden для устранения горизонтального дребезжания */}
      <div ref={scrollRef} className="flex-1 overflow-y-auto overflow-x-hidden hide-scrollbar space-y-10 pb-10 pt-6">
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
  const [isTypingComplete, setIsTypingComplete] = useState(false);

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      className={`flex w-full ${isUser ? "justify-end" : "justify-start"}`}
    >
      <div className={`flex flex-col ${isUser ? "items-end max-w-[85%]" : "items-start w-full"}`}>
        {isUser ? (
          <div className="px-2 py-1">
            <p className="text-[16px] leading-relaxed whitespace-pre-wrap font-serif text-[#F2F1ED] opacity-90">
              {message.content}
            </p>
          </div>
        ) : (
          <div className="flex flex-col w-full space-y-3 min-h-[100px]">
            <div className="relative w-7 h-7 mb-1">
               <AnimatePresence mode="wait">
                {!isTypingComplete ? (
                  <motion.img 
                    key="gif"
                    initial={{ opacity: 0 }} animate={{ opacity: 0.9 }} exit={{ opacity: 0 }}
                    src="/icons/logo.GIF" 
                    className="absolute inset-0 w-7 h-7" 
                  />
                ) : (
                  <motion.img 
                    key="png"
                    initial={{ opacity: 0 }} animate={{ opacity: 0.9 }}
                    src="/icons/logo.PNG" 
                    className="absolute inset-0 w-7 h-7" 
                  />
                )}
               </AnimatePresence>
            </div>
            
            {message.isPlaceholder ? (
              <div className="flex gap-1.5 pt-2">
                <div className="w-1.5 h-1.5 bg-white/20 rounded-full animate-bounce" style={{ animationDelay: '0ms' }} />
                <div className="w-1.5 h-1.5 bg-white/20 rounded-full animate-bounce" style={{ animationDelay: '150ms' }} />
                <div className="w-1.5 h-1.5 bg-white/20 rounded-full animate-bounce" style={{ animationDelay: '300ms' }} />
              </div>
            ) : (
              <>
                <AnimatedAIResponse 
                  text={message.content} 
                  onComplete={() => setIsTypingComplete(true)} 
                />
                
                {isTypingComplete && (
                  <motion.div 
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    className="flex items-center gap-4 ml-1 pt-2"
                  >
                    <button className="active:scale-90 transition-all opacity-40 hover:opacity-80">
                      <img src="/icons/redo.svg" alt="Redo" className="w-[18px] h-[18px] invert" />
                    </button>
                    <div className="flex items-center gap-3">
                      <button onClick={() => setFeedback(feedback === 'like' ? null : 'like')} className="active:scale-90 transition-all">
                        <img 
                          src="/icons/like.svg" 
                          className={`w-[18px] h-[18px] transition-all ${feedback === 'like' ? '' : 'opacity-40 hover:opacity-80 invert'}`}
                          style={feedback === 'like' ? { filter: 'invert(58%) sepia(13%) saturate(1067%) hue-rotate(82deg) brightness(96%) contrast(87%)' } : {}}
                        />
                      </button>
                      
                      {/* Обновленная логика дизлайка с редиректом */}
                      <button 
                        onClick={() => {
                          setFeedback('dislike');
                          window.open('https://t.me/swgohbugbot', '_blank');
                        }} 
                        className="active:scale-90 transition-all"
                      >
                        <img 
                          src="/icons/dislike.svg" 
                          className={`w-[18px] h-[18px] transition-all ${feedback === 'dislike' ? '' : 'opacity-40 hover:opacity-80 invert'}`}
                          style={feedback === 'dislike' ? { filter: 'invert(58%) sepia(13%) saturate(1067%) hue-rotate(82deg) brightness(96%) contrast(87%)' } : {}}
                        />
                      </button>
                    </div>
                  </motion.div>
                )}
              </>
            )}
          </div>
        )}
      </div>
    </motion.div>
  );
}
