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
  onEditSubmit: (id: string, newContent: string) => void;
  onRedo: (id: string) => void;
};

function AnimatedAIResponse({ text, onComplete }: { text: string; onComplete: () => void }) {
  const words = useMemo(() => text.split(" "), [text]);
  
  const wordAnim = {
    hidden: { opacity: 0 },
    visible: (i: number) => ({
      opacity: 1, 
      transition: { delay: Math.floor(i / 5) * 0.1, duration: 0.2, ease: "easeOut" }
    })
  };

  return (
    <motion.div 
      initial="hidden" 
      animate="visible"
      onAnimationComplete={onComplete}
      className="text-[#F2F1ED] text-[16px] leading-[1.65] font-serif"
    >
      {words.map((word, index) => (
        <motion.span key={index} custom={index} variants={wordAnim} className="inline-block mr-[0.25em]">
          {word}
        </motion.span>
      ))}
    </motion.div>
  );
}

export function ChatThread({ messages, onNewChat, onOpenMenu, onEditSubmit, onRedo }: ChatThreadProps) {
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
      <div className="w-full flex items-center justify-between px-8 py-3 shrink-0 bg-[#252422] z-10">
        <button onClick={onOpenMenu} className="p-1 active:scale-95 transition-transform">
          <img src="/icons/menu.svg" alt="Menu" className="w-[22px] h-[22px] opacity-60 hover:opacity-100 invert transition-opacity" />
        </button>
        <span className="text-[15px] text-[#F2F1ED] font-sans font-medium">
          Новый чат
        </span>
        <button onClick={onNewChat} className="p-1 active:scale-95 transition-transform">
          <img src="/icons/newchat.svg" alt="New Chat" className="w-[22px] h-[22px] opacity-60 hover:opacity-100 invert transition-opacity" />
        </button>
      </div>

      <div ref={scrollRef} className="flex-1 overflow-y-auto overflow-x-hidden hide-scrollbar space-y-12 pb-24 pt-6 px-8">
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

function MessageItem({ message, onEditSubmit, onRedo }: { message: ChatMessage, onEditSubmit: any, onRedo: any }) {
  const isUser = message.role === "user";
  const [feedback, setFeedback] = useState<'like' | 'dislike' | null>(null);
  const [isTypingComplete, setIsTypingComplete] = useState(false);
  const [copied, setCopied] = useState(false);
  
  const [isEditing, setIsEditing] = useState(false);
  const [editContent, setEditContent] = useState(message.content);

  const handleCopy = () => {
    navigator.clipboard.writeText(message.content);
    setCopied(true);
    setTimeout(() => setCopied(false), 1700);
  };

  const submitEdit = () => {
    if (editContent.trim() === message.content || editContent.trim().length === 0) {
      setIsEditing(false);
      return;
    }
    onEditSubmit(message.id, editContent);
    setIsEditing(false);
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      className={`flex w-full ${isUser ? "justify-end" : "justify-start"}`}
    >
      <div className={`flex flex-col ${isUser ? "items-end w-full max-w-[85%]" : "items-start w-full"}`}>
        {isUser ? (
          <div className="flex flex-col w-full items-end">
            {isEditing ? (
              <div className="w-full flex flex-col gap-2">
                <textarea
                  value={editContent}
                  onChange={(e) => setEditContent(e.target.value)}
                  className="w-full bg-[#2D2C2A] text-[#F2F1ED] font-serif text-[16px] leading-relaxed p-4 rounded-[16px] border border-white/[0.1] outline-none resize-none min-h-[100px] hide-scrollbar"
                  autoFocus
                />
                <div className="flex w-full gap-2">
                  <button 
                    onClick={() => { setIsEditing(false); setEditContent(message.content); }}
                    className="flex-1 py-2.5 rounded-[12px] bg-[#3E3D3A] text-[14px] text-white font-medium active:scale-95 transition-all"
                  >
                    Отмена
                  </button>
                  <button 
                    onClick={submitEdit}
                    className="flex-1 py-2.5 rounded-[12px] bg-[#5FA86D] text-[14px] text-white font-medium active:scale-95 transition-all"
                  >
                    Отправить
                  </button>
                </div>
              </div>
            ) : (
              <>
                <p className="text-[16px] leading-relaxed font-serif text-[#F2F1ED] text-right break-words">
                  {message.content}
                </p>
                <div className="flex justify-end gap-4 mt-2 pr-2 opacity-60 hover:opacity-100 transition-opacity">
                  <button onClick={() => setIsEditing(true)} className="active:scale-95 transition-transform">
                    <img src="/icons/edit.svg" alt="Edit" className="w-[18px] h-[18px] invert" />
                  </button>
                  <button onClick={handleCopy} className="active:scale-95 transition-transform">
                    <img src={copied ? "/icons/tick.svg" : "/icons/copy.svg"} alt="Copy" className="w-[18px] h-[18px] invert" />
                  </button>
                </div>
              </>
            )}
          </div>
        ) : (
          <div className="flex flex-col w-full space-y-4 min-h-[100px]">
            <div className="relative w-7 h-7">
               <AnimatePresence mode="wait">
                {!isTypingComplete && !message.isPlaceholder ? (
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
                      <div className="flex items-center gap-4 opacity-60 hover:opacity-100 transition-opacity">
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
                        style={{ opacity: feedback === 'like' ? 1 : 0.6 }}
                      >
                        <img 
                          src="/icons/like.svg" 
                          className="w-[18px] h-[18px]"
                          style={{ filter: feedback === 'like' ? 'invert(58%) sepia(13%) saturate(1067%) hue-rotate(82deg) brightness(96%) contrast(87%)' : 'invert(1)' }}
                        />
                      </button>
                      <button 
                        onClick={() => setFeedback(feedback === 'dislike' ? null : 'dislike')} 
                        className="active:scale-95 transition-transform"
                        style={{ opacity: feedback === 'dislike' ? 1 : 0.6 }}
                      >
                        <img 
                          src="/icons/dislike.svg" 
                          className="w-[18px] h-[18px]"
                          style={{ filter: feedback === 'dislike' ? 'invert(58%) sepia(13%) saturate(1067%) hue-rotate(82deg) brightness(96%) contrast(87%)' : 'invert(1)' }}
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
