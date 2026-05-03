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
  const [inputText, setInputText] = useState("");
  const [isExpanded, setIsExpanded] = useState(false);

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

      {/* Messages Area */}
      <div ref={scrollRef} className="flex-1 overflow-y-auto overflow-x-hidden hide-scrollbar space-y-10 pb-[140px] pt-6 px-4">
        <AnimatePresence initial={false}>
          {messages.map((msg) => (
            <MessageItem key={msg.id} message={msg} />
          ))}
        </AnimatePresence>
      </div>

      {/* Input Area с функцией расширения */}
      <div className="absolute bottom-6 left-4 right-4 z-20">
        <div className="bg-[#2D2C2A] rounded-[22px] p-2 flex flex-col transition-all duration-300 ease-[0.22, 1, 0.36, 1]">
          <motion.textarea
            value={inputText}
            onChange={(e) => setInputText(e.target.value)}
            animate={{ height: isExpanded ? 150 : 44 }}
            placeholder="Спроси что-нибудь..."
            className="w-full bg-transparent border-none focus:ring-0 text-[#F2F1ED] text-[16px] px-3 py-2.5 resize-none hide-scrollbar font-sans"
          />
          <div className="flex items-center justify-between px-2 pb-1">
            <button 
              onClick={() => setIsExpanded(!isExpanded)}
              className={`p-2 active:scale-90 transition-all ${isExpanded ? 'rotate-180 opacity-100' : 'opacity-40'}`}
            >
              <img src="/icons/more.svg" alt="More" className="w-5 h-5 invert" />
            </button>
            <button 
              className={`p-2 rounded-full transition-all ${inputText ? 'bg-[#5FA86D] opacity-100' : 'bg-white/5 opacity-20'}`}
            >
              <img src="/icons/send.svg" alt="Send" className="w-5 h-5 invert" />
            </button>
          </div>
        </div>
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

  // Константа для зеленого фильтра
  const greenFilter = 'invert(58%) sepia(13%) saturate(1067%) hue-rotate(82deg) brightness(96%) contrast(87%)';

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
              <div className="bg-[#2D2C2A] rounded-[20px] px-4 py-3 w-full shadow-sm border border-white/[0.02]">
                <div className="relative w-full">
                  <p className={`text-[16px] leading-relaxed whitespace-pre-wrap font-serif text-[#F2F1ED] opacity-90 text-left ${isLong ? 'max-h-[105px] overflow-hidden' : ''}`}>
                    {message.content}
                  </p>
                  {isLong && (
                    <div className="absolute bottom-0 left-0 right-0 h-[40px] bg-gradient-to-t from-[#2D2C2A] to-transparent pointer-events-none" />
                  )}
                </div>
              </div>
              
              <div className="flex justify-end mt-2 pr-1 items-center gap-4 h-8">
                {isLong ? (
                  <button 
                    onClick={() => setIsModalOpen(true)}
                    className="flex items-center gap-1.5 active:scale-95 opacity-40"
                  >
                    <span className="text-[13px] font-sans text-[#F2F1ED]">Больше</span>
                    <img src="/icons/more.svg" alt="More" className="w-[16px] h-[16px] invert" />
                  </button>
                ) : (
                  <div className="flex items-center gap-4 opacity-40">
                    <button className="active:scale-95">
                      <img src="/icons/edit.svg" alt="Edit" className="w-[18px] h-[18px] invert" />
                    </button>
                    <button onClick={handleCopy} className="active:scale-95">
                      <img src={copied ? "/icons/tick.svg" : "/icons/copy.svg"} alt="Copy" className="w-[18px] h-[18px] invert" />
                    </button>
                  </div>
                )}
              </div>
            </div>
          ) : (
            <div className="flex flex-col w-full space-y-4 min-h-[100px]">
              <div className="relative w-7 h-7">
                 <AnimatePresence mode="wait">
                  {!isTypingComplete ? (
                    <motion.img key="gif" initial={{ opacity: 0 }} animate={{ opacity: 0.9 }} exit={{ opacity: 0 }}
                      src="/icons/logo.GIF" className="absolute inset-0 w-7 h-7" 
                    />
                  ) : (
                    <motion.img key="png" initial={{ opacity: 0 }} animate={{ opacity: 0.9 }}
                      src="/icons/logo.PNG" className="absolute inset-0 w-7 h-7" 
                    />
                  )}
                 </AnimatePresence>
              </div>
              
              <div className="w-full">
                {message.isPlaceholder ? (
                  <div className="flex gap-1.5 pt-2">
                    <div className="w-1.5 h-1.5 bg-white/20 rounded-full animate-bounce" style={{ animationDelay: '0ms' }} />
                    <div className="w-1.5 h-1.5 bg-white/20 rounded-full animate-bounce" style={{ animationDelay: '150ms' }} />
                    <div className="w-1.5 h-1.5 bg-white/20 rounded-full animate-bounce" style={{ animationDelay: '300ms' }} />
                  </div>
                ) : (
                  <>
                    <AnimatedAIResponse text={message.content} onComplete={() => setIsTypingComplete(true)} />
                    
                    {isTypingComplete && (
                      <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="flex items-center gap-4 pt-4 h-8">
                        <div className="flex items-center gap-4">
                          <button className="active:scale-95 opacity-40">
                            <img src="/icons/redo.svg" alt="Redo" className="w-[18px] h-[18px] invert" />
                          </button>
                          <button onClick={handleCopy} className="active:scale-95 opacity-40">
                            <img src={copied ? "/icons/tick.svg" : "/icons/copy.svg"} alt="Copy" className="w-[18px] h-[18px] invert" />
                          </button>
                          
                          {/* Лайк */}
                          <button 
                            onClick={() => setFeedback(feedback === 'like' ? null : 'like')} 
                            className="active:scale-95 transition-all"
                          >
                            <img 
                              src="/icons/like.svg" 
                              className="w-[18px] h-[18px]"
                              style={{ 
                                filter: feedback === 'like' ? greenFilter : 'invert(1)',
                                opacity: feedback === 'like' ? 1 : 0.4
                              }}
                            />
                          </button>

                          {/* Дизлайк */}
                          <button 
                            onClick={() => {
                              if (feedback === 'dislike') setFeedback(null);
                              else {
                                setFeedback('dislike');
                                window.open('https://t.me/swgohbugbot', '_blank');
                              }
                            }} 
                            className="active:scale-95 transition-all"
                          >
                            <img 
                              src="/icons/dislike.svg" 
                              className="w-[18px] h-[18px]"
                              style={{ 
                                filter: feedback === 'dislike' ? greenFilter : 'invert(1)',
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
            </div>
          )}
        </div>
      </motion.div>
    </>
  );
}
