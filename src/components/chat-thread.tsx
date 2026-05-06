"use client";

import { useEffect, useRef, useState, useMemo } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { MoreModal } from "@/components/more";
import { AdminConsole } from "@/components/admin-console";

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
  onEditSubmit: (id: string, newContent: string) => void;
  onRedo: (id: string) => void;
  activeChatTitle?: string;
  currentUserHandle?: string;
};

function AnimatedAIResponse({ text, onComplete }: { text: string; onComplete: () => void }) {
  const words = useMemo(() => text.split(" "), [text]);
  
  const wordAnim = {
    hidden: { opacity: 0 },
    visible: (i: number) => ({
      opacity: 1, 
      transition: { delay: Math.floor(i / 5) * 0.05, duration: 0.2, ease: "easeOut" }
    })
  };

  return (
    <motion.div 
      initial="hidden" 
      animate="visible"
      onAnimationComplete={onComplete}
      className="text-[#E8E6E3] text-[14px] leading-relaxed font-sans"
    >
      {words.map((word, index) => (
        <motion.span 
          key={index} 
          custom={index}
          variants={wordAnim} 
          className="inline-block mr-[0.25em]"
        >
          {word}
        </motion.span>
      ))}
    </motion.div>
  );
}

export function ChatThread({ 
  messages, 
  onNewChat, 
  onOpenMenu, 
  onEditSubmit, 
  onRedo, 
  activeChatTitle,
  currentUserHandle = "@ya_admin7"
}: ChatThreadProps) {
  const scrollRef = useRef<HTMLDivElement>(null);
  const [chatTitle, setChatTitle] = useState("swgoh.ai");
  const [isEditingTitle, setIsEditingTitle] = useState(false);
  const [isConsoleOpen, setIsConsoleOpen] = useState(false);

  const isAdmin = currentUserHandle === "@ya_admin7";

  useEffect(() => {
    if (activeChatTitle) setChatTitle(activeChatTitle);
  }, [activeChatTitle]);

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTo({
        top: scrollRef.current.scrollHeight,
        behavior: "smooth",
      });
    }
  }, [messages]);

  return (
    <div className="flex flex-col h-full w-full max-w-[600px] mx-auto relative pt-2 select-none touch-none overflow-hidden font-sans">
      {isAdmin && (
        <button 
          onClick={() => setIsConsoleOpen(true)}
          className="fixed bottom-24 right-6 z-50 w-9 h-9 bg-white/5 backdrop-blur-md border border-white/5 rounded-full flex items-center justify-center active:scale-90 transition-transform"
        >
          <img src="/icons/console.svg" className="w-4 h-4 opacity-50 invert" alt="" />
        </button>
      )}

      <AdminConsole isOpen={isConsoleOpen} onClose={() => setIsConsoleOpen(false)} />

      <div className="w-full flex items-center justify-between px-6 py-2 z-10 bg-[#252422]">
        <button onClick={onOpenMenu} className="p-1 active:scale-95 transition-transform opacity-30">
          <img src="/icons/menu.svg" alt="" className="w-5 h-5 invert" />
        </button>

        <div className="flex-1 flex items-center justify-center gap-2 px-2">
          <img src="/icons/logo.PNG" className="w-5 h-5 opacity-80" alt="" />
          {isEditingTitle ? (
            <input
              autoFocus
              value={chatTitle}
              onChange={(e) => setChatTitle(e.target.value)}
              onBlur={() => setIsEditingTitle(false)}
              onKeyDown={(e) => e.key === "Enter" && setIsEditingTitle(false)}
              className="bg-[#1c1c1e] text-[13px] text-[#F2F1ED] font-bold text-center border-none outline-none rounded-lg px-2 py-1 w-full max-w-[120px]"
            />
          ) : (
            <span 
              onClick={() => setIsEditingTitle(true)}
              className="text-[13px] text-[#F2F1ED] font-bold truncate cursor-pointer opacity-80"
            >
              {chatTitle}
            </span>
          )}
        </div>

        <button onClick={onNewChat} className="p-1 active:scale-95 transition-transform opacity-30">
          <img src="/icons/newchat.svg" alt="" className="w-5 h-5 invert" />
        </button>
      </div>

      <div ref={scrollRef} className="flex-1 overflow-y-auto overflow-x-hidden hide-scrollbar space-y-8 pb-10 pt-4 px-6">
        <AnimatePresence initial={false}>
          {messages.map((msg) => (
            <MessageItem 
              key={msg.id} 
              message={msg} 
              onEditSubmit={onEditSubmit}
              onRedo={onRedo}
            />
          ))}
        </AnimatePresence>
      </div>
    </div>
  );
}

function MessageItem({ message, onEditSubmit, onRedo }: { message: ChatMessage, onEditSubmit: (id: string, text: string) => void, onRedo: (id: string) => void }) {
  const isUser = message.role === "user";
  const [feedback, setFeedback] = useState<'like' | 'dislike' | null>(null);
  const [isTypingComplete, setIsTypingComplete] = useState(false);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [copied, setCopied] = useState(false);
  
  const [isEditingMode, setIsEditingMode] = useState(false);
  const [editValue, setEditValue] = useState(message.content);

  const handleCopy = () => {
    navigator.clipboard.writeText(message.content);
    setCopied(true);
    setTimeout(() => setCopied(false), 1500);
  };

  const handleEditConfirm = () => {
    setIsEditingMode(false);
    onEditSubmit(message.id, editValue);
  };

  return (
    <>
      <MoreModal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} content={message.content} />

      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        className={`flex w-full ${isUser ? "justify-end" : "justify-start"}`}
      >
        <div className={`flex flex-col ${isUser ? "items-end max-w-[90%]" : "items-start w-full"}`}>
          {isUser ? (
            <div className="flex flex-col w-full items-end">
              {isEditingMode ? (
                <div className="flex flex-col w-full">
                  <textarea
                    value={editValue}
                    onChange={(e) => setEditValue(e.target.value)}
                    className="bg-[#2a2c31] rounded-[24px] px-4 py-3 w-full text-[14px] leading-relaxed text-[#F2F1ED] outline-none resize-none min-h-[100px] border border-white/5"
                    autoFocus
                  />
                  <div className="flex gap-2 w-full mt-2">
                    <button 
                      onClick={() => { setIsEditingMode(false); setEditValue(message.content); }} 
                      className="flex-1 bg-[#2a2c31] text-[#F2F1ED] py-2 rounded-[18px] text-[12px] font-bold active:scale-95 transition-transform"
                    >
                      Отмена
                    </button>
                    <button 
                      onClick={handleEditConfirm} 
                      className="flex-1 bg-[#5FA86D] text-[#252422] py-2 rounded-[18px] text-[12px] font-bold active:scale-95 transition-transform"
                    >
                      Готово
                    </button>
                  </div>
                </div>
              ) : (
                <>
                  <div className="bg-[#2a2c31] rounded-[24px] px-4 py-2.5 w-auto">
                    <p className="text-[14px] leading-relaxed text-[#F2F1ED] opacity-90 text-left">
                      {message.content}
                    </p>
                  </div>
                  
                  <div className="flex justify-end gap-3 mt-1.5 pr-2 opacity-20">
                    <button onClick={() => setIsEditingMode(true)} className="active:scale-95 transition-transform">
                      <img src="/icons/edit.svg" alt="" className="w-3.5 h-3.5 invert" />
                    </button>
                    <button onClick={handleCopy} className="active:scale-95 transition-transform">
                      <img src={copied ? "/icons/tick.svg" : "/icons/copy.svg"} alt="" className="w-3.5 h-3.5 invert" />
                    </button>
                  </div>
                </>
              )}
            </div>
          ) : (
            <div className="flex flex-col w-full space-y-3">
              <div className="relative w-5 h-5">
                 <AnimatePresence mode="wait">
                  {!isTypingComplete ? (
                    <motion.img 
                      key="gif"
                      initial={{ opacity: 0 }} animate={{ opacity: 0.7 }} exit={{ opacity: 0 }}
                      src="/icons/logo.GIF" 
                      className="absolute inset-0 w-5 h-5" 
                    />
                  ) : (
                    <motion.img 
                      key="png"
                      initial={{ opacity: 0 }} animate={{ opacity: 0.7 }}
                      src="/icons/logo.PNG" 
                      className="absolute inset-0 w-5 h-5" 
                    />
                  )}
                 </AnimatePresence>
              </div>
              
              {message.isPlaceholder ? (
                <div className="flex gap-1 pt-1">
                  <div className="w-1 h-1 bg-white/10 rounded-full animate-bounce" style={{ animationDelay: '0ms' }} />
                  <div className="w-1 h-1 bg-white/10 rounded-full animate-bounce" style={{ animationDelay: '150ms' }} />
                  <div className="w-1 h-1 bg-white/10 rounded-full animate-bounce" style={{ animationDelay: '300ms' }} />
                </div>
              ) : (
                <>
                  <div className="w-full">
                    <AnimatedAIResponse 
                      text={message.content} 
                      onComplete={() => setIsTypingComplete(true)} 
                    />
                  </div>
                  
                  {isTypingComplete && (
                    <motion.div 
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      className="flex items-center gap-3 pt-1 opacity-20"
                    >
                      <button onClick={() => onRedo(message.id)} className="active:scale-95 transition-transform">
                        <img src="/icons/redo.svg" alt="" className="w-3.5 h-3.5 invert" />
                      </button>
                      <button onClick={handleCopy} className="active:scale-95 transition-transform">
                        <img src={copied ? "/icons/tick.svg" : "/icons/copy.svg"} alt="" className="w-3.5 h-3.5 invert" />
                      </button>
                      <button 
                        onClick={() => setFeedback(feedback === 'like' ? null : 'like')} 
                        className="active:scale-95 transition-transform"
                      >
                        <img 
                          src="/icons/like.svg" 
                          className="w-3.5 h-3.5"
                          style={{ 
                              filter: feedback === 'like' ? 'invert(58%) sepia(13%) saturate(1067%) hue-rotate(82deg) brightness(96%) contrast(87%)' : 'invert(1)',
                              opacity: feedback === 'like' ? 1 : 1
                          }}
                        />
                      </button>
                    </motion.div>
                  )}
                </>
              )}
            </div>
          )}
        </div>
      </motion.div>
    </>
  );
}
