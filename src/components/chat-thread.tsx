"use client";

import { useEffect, useRef, useState, useMemo } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { MoreModal } from "@/components/more";

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
};

function AnimatedAIResponse({ text, onComplete }: { text: string; onComplete: () => void }) {
  const words = useMemo(() => text.split(" "), [text]);
  
  const wordAnim = {
    hidden: { opacity: 0, filter: "blur(4px)" },
    visible: (i: number) => ({
      opacity: 1, 
      filter: "blur(0px)",
      transition: { delay: Math.floor(i / 4) * 0.08, duration: 0.3, ease: "easeOut" }
    })
  };

  return (
    <motion.div 
      initial="hidden" 
      animate="visible"
      onAnimationComplete={onComplete}
      className="text-[#E8E6E3] text-[16px] leading-[1.65] font-serif"
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

export function ChatThread({ messages, onNewChat, onOpenMenu, onEditSubmit, onRedo }: ChatThreadProps) {
  const scrollRef = useRef<HTMLDivElement>(null);
  const [chatTitle, setChatTitle] = useState("Новый чат");
  const [isEditingTitle, setIsEditingTitle] = useState(false);

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
      <div className="w-full flex items-center justify-between px-8 py-2 z-10 bg-[#252422]">
        <button onClick={onOpenMenu} className="p-1 active:scale-95 transition-transform opacity-40">
          <img src="/icons/menu.svg" alt="Menu" className="w-[22px] h-[22px] invert" />
        </button>

        <div className="flex-1 flex justify-center px-4">
          {isEditingTitle ? (
            <input
              autoFocus
              maxLength={15}
              value={chatTitle}
              onChange={(e) => setChatTitle(e.target.value)}
              onBlur={() => setIsEditingTitle(false)}
              onKeyDown={(e) => e.key === "Enter" && setIsEditingTitle(false)}
              className="bg-black/20 text-[14px] text-[#F2F1ED] font-sans text-center border-none outline-none rounded-md px-2 py-0.5 w-full max-w-[140px]"
            />
          ) : (
            <span 
              onClick={() => setIsEditingTitle(true)}
              className="text-[14px] text-[#F2F1ED] font-sans truncate cursor-pointer"
            >
              {chatTitle}
            </span>
          )}
        </div>

        <button onClick={onNewChat} className="p-1 active:scale-95 transition-transform opacity-40">
          <img src="/icons/newchat.svg" alt="New Chat" className="w-[22px] h-[22px] invert" />
        </button>
      </div>

      <div ref={scrollRef} className="flex-1 overflow-y-auto overflow-x-hidden hide-scrollbar space-y-10 pb-10 pt-6 px-8">
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
  
  // States for editing
  const [isEditingMode, setIsEditingMode] = useState(false);
  const [editValue, setEditValue] = useState(message.content);

  const isLong = isUser && message.content.length > 300;

  const handleCopy = () => {
    navigator.clipboard.writeText(message.content);
    setCopied(true);
    setTimeout(() => setCopied(false), 1700);
  };

  const handleEditConfirm = () => {
    setIsEditingMode(false);
    onEditSubmit(message.id, editValue);
  };

  return (
    <>
      <MoreModal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} content={message.content} />

      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        className={`flex w-full ${isUser ? "justify-end" : "justify-start"}`}
      >
        <div className={`flex flex-col ${isUser ? "items-end max-w-[85%]" : "items-start w-full"}`}>
          {isUser ? (
            <div className="flex flex-col w-full items-end">
              {isEditingMode ? (
                <div className="flex flex-col w-full animate-in fade-in zoom-in duration-200">
                  <textarea
                    value={editValue}
                    onChange={(e) => setEditValue(e.target.value)}
                    className="bg-[#2D2C2A] rounded-[20px] px-4 py-3 w-full shadow-sm text-[16px] leading-relaxed whitespace-pre-wrap font-serif text-[#F2F1ED] outline-none resize-none min-h-[120px] focus:border-white/10 border border-transparent"
                    autoFocus
                  />
                  <div className="flex gap-2 w-full mt-2">
                    <button 
                      onClick={() => { setIsEditingMode(false); setEditValue(message.content); }} 
                      className="flex-1 bg-[#2D2C2A] text-[#F2F1ED] opacity-80 py-2 rounded-[14px] text-[14px] font-sans active:scale-95 transition-transform"
                    >
                      Отмена
                    </button>
                    <button 
                      onClick={handleEditConfirm} 
                      className="flex-1 bg-[#5FA86D] text-[#252422] font-medium py-2 rounded-[14px] text-[14px] font-sans active:scale-95 transition-transform"
                    >
                      Отправить
                    </button>
                  </div>
                </div>
              ) : (
                <>
                  <div className="bg-[#2D2C2A] rounded-[20px] px-4 py-3 w-full shadow-sm">
                    <div className="relative w-full">
                      <p className={`text-[16px] leading-relaxed whitespace-pre-wrap font-serif text-[#F2F1ED] opacity-90 text-left ${isLong ? 'max-h-[105px] overflow-hidden' : ''}`}>
                        {message.content}
                      </p>
                      {isLong && (
                        <div className="absolute bottom-0 left-0 right-0 h-[40px] bg-gradient-to-t from-[#2D2C2A] to-transparent pointer-events-none" />
                      )}
                    </div>
                  </div>
                  
                  {isLong ? (
                    <div className="flex justify-end mt-2 pr-2">
                      <button 
                        onClick={() => setIsModalOpen(true)}
                        className="flex items-center gap-1.5 active:scale-95 opacity-40 transition-transform"
                      >
                        <span className="text-[13px] font-sans text-[#F2F1ED]">Больше</span>
                        <img src="/icons/more.svg" alt="More" className="w-[16px] h-[16px] invert" />
                      </button>
                    </div>
                  ) : (
                    <div className="flex justify-end gap-4 mt-2 pr-2 opacity-40">
                      <button onClick={() => setIsEditingMode(true)} className="active:scale-95 transition-transform">
                        <img src="/icons/edit.svg" alt="Edit" className="w-[18px] h-[18px] invert" />
                      </button>
                      <button onClick={handleCopy} className="active:scale-95 transition-transform">
                        <img src={copied ? "/icons/tick.svg" : "/icons/copy.svg"} alt="Copy" className="w-[18px] h-[18px] invert" />
                      </button>
                    </div>
                  )}
                </>
              )}
            </div>
          ) : (
            <div className="flex flex-col w-full space-y-4 min-h-[100px]">
              <div className="relative w-7 h-7">
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
                      className="flex items-center gap-4 pt-1"
                    >
                      <div className="flex items-center gap-4">
                        <div className="flex items-center gap-4 opacity-40">
                          <button onClick={() => onRedo(message.id)} className="active:scale-95 transition-transform">
                            <img src="/icons/redo.svg" alt="Redo" className="w-[18px] h-[18px] invert" />
                          </button>
                          <button onClick={handleCopy} className="active:scale-95 transition-transform">
                            <img src={copied ? "/icons/tick.svg" : "/icons/copy.svg"} alt="Copy" className="w-[18px] h-[18px] invert" />
                          </button>
                        </div>

                        <button 
                          onClick={() => setFeedback(feedback === 'like' ? null : 'like')} 
                          className="active:scale-95 transition-transform"
                          style={{ opacity: feedback === 'like' ? 1 : 0.4 }}
                        >
                          <img 
                            src="/icons/like.svg" 
                            className="w-[18px] h-[18px]"
                            style={{ 
                                filter: feedback === 'like' ? 'invert(58%) sepia(13%) saturate(1067%) hue-rotate(82deg) brightness(96%) contrast(87%)' : 'invert(1)'
                            }}
                          />
                        </button>
                        <button 
                          onClick={() => {
                            setFeedback('dislike');
                            window.open('https://t.me/swgohbugbot', '_blank');
                          }} 
                          className="active:scale-95 transition-transform"
                          style={{ opacity: feedback === 'dislike' ? 1 : 0.4 }}
                        >
                          <img 
                            src="/icons/dislike.svg" 
                            className="w-[18px] h-[18px]"
                            style={{ 
                                filter: feedback === 'dislike' ? 'invert(58%) sepia(13%) saturate(1067%) hue-rotate(82deg) brightness(96%) contrast(87%)' : 'invert(1)'
                            }}
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
    </>
  );
}
