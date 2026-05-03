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
};

function AnimatedAIResponse({ text, onComplete }: { text: string; onComplete: () => void }) {
  const words = useMemo(() => text.split(" "), [text]);
  
  const wordAnim = {
    hidden: { opacity: 0, filter: "blur(4px)" },
    visible: (i: number) => ({
      opacity: 1, 
      filter: "blur(0px)",
      transition: { delay: Math.floor(i / 4) * 0.12, duration: 0.3, ease: "easeOut" }
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
      {/* Header */}
      <div className="w-full flex items-center justify-between py-2 z-10 bg-[#252422] px-4">
        <button onClick={onOpenMenu} className="p-1 active:scale-95 transition-transform">
          <img src="/icons/menu.svg" alt="Menu" className="w-[22px] h-[22px] opacity-40 invert" />
        </button>
        <span className="text-[14px] text-[#F2F1ED] font-sans">Новый чат</span>
        <button onClick={onNewChat} className="p-1 active:scale-95 transition-transform">
          <img src="/icons/newchat.svg" alt="New Chat" className="w-[22px] h-[22px] opacity-40 invert" />
        </button>
      </div>

      <div ref={scrollRef} className="flex-1 overflow-y-auto overflow-x-hidden hide-scrollbar space-y-10 pb-10 pt-6 px-4">
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
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [copied, setCopied] = useState(false);

  const isLong = isUser && message.content.length > 300;

  const handleCopy = () => {
    navigator.clipboard.writeText(message.content);
    setCopied(true);
    setTimeout(() => setCopied(false), 1700);
  };

  // Единый стиль для иконок под сообщениями
  const actionIconClass = "w-[18px] h-[18px] invert transition-all";
  const activeGreenFilter = "invert(58%) sepia(13%) saturate(1067%) hue-rotate(82deg) brightness(96%) contrast(87%)";

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
              
              <div className="flex justify-end gap-5 mt-3 pr-2">
                {isLong && (
                  <button 
                    onClick={() => setIsModalOpen(true)}
                    className="flex items-center gap-1.5 active:scale-95 opacity-40"
                  >
                    <span className="text-[13px] font-sans text-[#F2F1ED]">Больше</span>
                    <img src="/icons/more.svg" alt="More" className="w-[18px] h-[18px] invert" />
                  </button>
                )}
                <div className="flex items-center gap-5 opacity-40">
                  <button className="active:scale-95">
                    <img src="/icons/edit.svg" alt="Edit" className={actionIconClass} />
                  </button>
                  <button onClick={handleCopy} className="active:scale-95">
                    <img src={copied ? "/icons/tick.svg" : "/icons/copy.svg"} alt="Copy" className={actionIconClass} />
                  </button>
                </div>
              </div>
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
                      className="flex items-center gap-5 pt-1"
                    >
                      <div className="flex items-center gap-5">
                        <button className="active:scale-95 opacity-40">
                          <img src="/icons/redo.svg" alt="Redo" className={actionIconClass} />
                        </button>
                        <button onClick={handleCopy} className="active:scale-95 opacity-40">
                          <img src={copied ? "/icons/tick.svg" : "/icons/copy.svg"} alt="Copy" className={actionIconClass} />
                        </button>
                        
                        {/* Лайк */}
                        <button 
                          onClick={() => setFeedback(feedback === 'like' ? null : 'like')} 
                          className="active:scale-95"
                        >
                          <img 
                            src="/icons/like.svg" 
                            alt="Like"
                            className="w-[18px] h-[18px]"
                            style={{ 
                                filter: feedback === 'like' ? activeGreenFilter : 'invert(1)',
                                opacity: feedback === 'like' ? 1 : 0.4 
                            }}
                          />
                        </button>

                        {/* Дизлайк */}
                        <button 
                          onClick={() => {
                            if (feedback === 'dislike') {
                                setFeedback(null);
                            } else {
                                setFeedback('dislike');
                                window.open('https://t.me/swgohbugbot', '_blank');
                            }
                          }} 
                          className="active:scale-95"
                        >
                          <img 
                            src="/icons/dislike.svg" 
                            alt="Dislike"
                            className="w-[18px] h-[18px]"
                            style={{ 
                                filter: feedback === 'dislike' ? activeGreenFilter : 'invert(1)',
                                opacity: feedback === 'dislike' ? 1 : 0.4 
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
