"use client";

import { useEffect, useRef, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";

export type ChatMessage = {
  id: string;
  role: "user" | "assistant";
  content: string;
  isLoading?: boolean;
};

// Группировка слов для быстрого появления
function AnimatedWords({ text, onDone }: { text: string; onDone?: () => void }) {
  const words = text.split(" ");
  const step = 5; // по сколько слов выводим
  const chunks = [];
  for (let i = 0; i < words.length; i += step) {
    chunks.push(words.slice(i, i + step).join(" "));
  }

  return (
    <motion.div 
      initial="hidden" 
      animate="visible" 
      variants={{ visible: { transition: { staggerChildren: 0.08 } } }}
      className="text-[#E8E6E3] text-[16px] leading-[1.65] font-serif"
      onAnimationComplete={onDone}
    >
      {chunks.map((chunk, i) => (
        <motion.span 
          key={i} 
          variants={{ hidden: { opacity: 0 }, visible: { opacity: 1 } }}
          transition={{ duration: 0.2 }}
          className="inline-block mr-1.5"
        >
          {chunk}
        </motion.span>
      ))}
    </motion.div>
  );
}

export function ChatThread({ messages, onNewChat, onOpenMenu, onSendMessage }: any) {
  const [inputValue, setInputValue] = useState("");
  const scrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTo({ top: scrollRef.current.scrollHeight, behavior: "smooth" });
    }
  }, [messages]);

  return (
    <div className="flex flex-col h-full w-full max-w-[600px] mx-auto px-6">
      {/* Header */}
      <div className="flex items-center justify-between py-4 bg-[#252422]">
        <button onClick={onOpenMenu} className="p-1 opacity-40 invert"><img src="/icons/menu.svg" className="w-6 h-6" alt="M"/></button>
        <span className="text-[14px] font-sans text-[#F2F1ED]">Новый чат</span>
        <button onClick={onNewChat} className="p-1 opacity-40 invert"><img src="/icons/newchat.svg" className="w-6 h-6" alt="N"/></button>
      </div>

      {/* Messages List */}
      <div ref={scrollRef} className="flex-1 overflow-y-auto hide-scrollbar py-4 space-y-8">
        {messages.map((msg: ChatMessage) => (
          <MessageBlock key={msg.id} msg={msg} />
        ))}
      </div>

      {/* Input Area */}
      <div className="py-4 bg-[#252422]">
        <div className="relative flex flex-col bg-[#2D2C2A] rounded-[20px] p-3 border border-white/[0.04]">
          <button className="absolute top-3 right-3 opacity-20"><img src="/icons/arrows.svg" className="w-4 h-4 invert" alt="A"/></button>
          <textarea 
            value={inputValue}
            onChange={(e) => setInputValue(e.target.value)}
            placeholder="Спросить..."
            className="w-full h-[24px] bg-transparent text-[#E8E6E3] outline-none resize-none pr-8"
          />
          <div className="flex justify-end mt-2">
            <button 
              onClick={() => { onSendMessage(inputValue); setInputValue(""); }} 
              className="h-[36px] w-[36px] bg-[#5FA86D] rounded-[10px] flex items-center justify-center"
            >
              <img src="/icons/send.svg" className="w-[16px] h-[16px] invert" alt="S" />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

function MessageBlock({ msg }: { msg: ChatMessage }) {
  const [isDone, setIsDone] = useState(false);
  const isUser = msg.role === "user";

  return (
    <div className={`flex w-full ${isUser ? "justify-end" : "justify-start"}`}>
      <div className={`max-w-[90%] flex flex-col ${isUser ? "items-end" : "items-start w-full"}`}>
        {!isUser && (
          <div className="relative w-7 h-7 mb-3">
            <AnimatePresence mode="wait">
              {!isDone && !msg.isLoading ? (
                <motion.img 
                  key="gif" src="/icons/logo.GIF" 
                  exit={{ opacity: 0 }} transition={{ duration: 0.3 }}
                  className="absolute inset-0 w-full h-full" 
                />
              ) : (
                <motion.img 
                  key="png" src="/icons/logo.PNG" 
                  initial={{ opacity: 0 }} animate={{ opacity: 1 }}
                  className="absolute inset-0 w-full h-full" 
                />
              )}
            </AnimatePresence>
          </div>
        )}
        
        <div className={`font-serif text-[16px] ${isUser ? "text-[#F2F1ED] opacity-90" : "text-[#E8E6E3]"}`}>
          {isUser ? msg.content : (
            msg.isLoading ? <div className="animate-pulse text-[#6A6965]">Думаю...</div> :
            <AnimatedWords text={msg.content} onDone={() => setIsDone(true)} />
          )}
        </div>
      </div>
    </div>
  );
}
