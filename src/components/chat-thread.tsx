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
      <div className="w-full flex items-center justify-between py-2 z-10 bg-[#252422]">
        <button onClick={onOpenMenu} className="p-1 active:scale-90 transition-transform">
          <img src="/icons/menu.svg" alt="Menu" className="w-[22px] h-[22px] opacity-40 invert" />
        </button>
        <span className="text-[14px] text-[#F2F1ED] font-sans">Новый чат</span>
        <button onClick={onNewChat} className="p-1 active:scale-90 transition-transform">
          <img src="/icons/newchat.svg" alt="New Chat" className="w-[22px] h-[22px] opacity-40 invert" />
        </button>
      </div>

      <div ref={scrollRef} className="flex-1 overflow-y-auto overflow-x-hidden hide-scrollbar space-y-8 pb-10 pt-6">
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
    setTimeout(() => setCopied(false), 1700); // Изменено на 1.7 сек
  };

  return (
    <>
      <MoreModal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} content={message.content} />

      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        className="flex w-full justify-start" // Все сообщения теперь слева
      >
        <div className={`flex flex-col items-start ${isUser ? "max-w-[75%]" : "w-full"}`}>
          {isUser ? (
            <div className="flex flex-col w-full">
              {/* Блок сообщения юзера с фоном и закруглениями как у инпута */}
              <div className="relative w-full bg-[#2D2C2A] border border-white/[0.04] rounded-[20px] px-4 py-3 shadow-sm">
                <div className="relative w-full">
                  <p className={`text-[15px] leading-relaxed whitespace-pre-wrap font-serif text-[#F2F1ED] opacity-90 ${isLong ? 'max-h-[100px] overflow-hidden' : ''}`}>
                    {message.content}
                  </p>
                  {isLong && (
                    <div className="absolute bottom-0 left-0 right-0 h-[40px] bg-gradient-to-t from-[#2D2C2A] to-transparent pointer-events-none" />
                  )}
                </div>
              </div>
              
              {/* Кнопки под блоком */}
              {isLong ? (
                <div className="flex justify-start mt-2 px-2">
                  <button 
                    onClick={() => setIsModalOpen(true)}
                    className="flex items-center gap-1.5 active:scale-95 opacity-60"
                  >
                    <span className="text-[13px] font-sans text-[#F2F1ED]">Больше</span>
                    <img src="/icons/more.svg" alt="More" className="w-[14px] h-[14px] invert" />
                  </button>
                </div>
              ) : (
                <div className="flex justify-start gap-4 mt-2 px-2 opacity-30">
                  <button className="active:scale-90 transition-transform">
                    <img src="/icons/edit.svg" alt="Edit" className="w-[15px] h-[15px] invert" />
                  </button>
                  <button onClick={handleCopy} className="active:scale-90 transition-transform">
                    <img src={copied ? "/icons/tick.svg" : "/icons/copy.svg"} alt="Copy" className="w-[15px] h-[15px] invert" />
                  </button>
                </div>
              )}
            </div>
          ) : (
            <div className="flex flex-col w-full space-y-4 min-h-[100px]">
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
                <div className="flex flex-col w-full">
                  <AnimatedAIResponse 
                    text={message.content} 
                    onComplete={() => setIsTypingComplete(true)} 
                  />
                  
                  {isTypingComplete && (
                    <motion.div 
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      className="flex items-center gap-5 pt-4 opacity-40"
                    >
                      <button className="active:scale-90 transition-transform">
                        <img src="/icons/redo.svg" alt="Redo" className="w-[18px] h-[18px] invert" />
                      </button>
                      <button onClick={handleCopy} className="active:scale-90 transition-transform">
                        <img src={copied ? "/icons/tick.svg" : "/icons/copy.svg"} alt="Copy" className="w-[18px] h-[18px] invert" />
                      </button>
                      <button onClick={() => setFeedback(feedback === 'like' ? null : 'like')} className="active:scale-90 transition-transform">
                        <img 
                          src="/icons/like.svg" 
                          className="w-[18px] h-[18px]"
                          style={feedback === 'like' ? { filter: 'invert(58%) sepia(13%) saturate(1067%) hue-rotate(82deg) brightness(96%) contrast(87%)', opacity: 1 } : { opacity: 1, filter: 'invert(100%)' }}
                        />
                      </button>
                      <button 
                        onClick={() => {
                          setFeedback('dislike');
                          window.open('https://t.me/swgohbugbot', '_blank');
                        }} 
                        className="active:scale-90 transition-transform"
                      >
                        <img 
                          src="/icons/dislike.svg" 
                          className="w-[18px] h-[18px]"
                          style={feedback === 'dislike' ? { filter: 'invert(58%) sepia(13%) saturate(1067%) hue-rotate(82deg) brightness(96%) contrast(87%)', opacity: 1 } : { opacity: 1, filter: 'invert(100%)' }}
                        />
                      </button>
                    </motion.div>
                  )}
                </div>
              )}
            </div>
          )}
        </div>
      </motion.div>
    </>
  );
}
