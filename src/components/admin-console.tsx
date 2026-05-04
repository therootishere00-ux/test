"use client";

import { useEffect, useState, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";

export function AdminConsole({ isOpen, onClose }: { isOpen: boolean; onClose: () => void }) {
  const [logs, setLogs] = useState<{ type: string; message: string; time: string }[]>([]);
  const scrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleLog = (type: string, args: any[]) => {
      const message = args.map(arg => typeof arg === 'object' ? JSON.stringify(arg) : String(arg)).join(' ');
      setLogs(prev => [...prev.slice(-50), { 
        type, 
        message, 
        time: new Date().toLocaleTimeString() 
      }]);
    };

    // Перехватываем стандартные логи
    const originalLog = console.log;
    const originalError = console.error;

    console.log = (...args) => {
      handleLog('log', args);
      originalLog(...args);
    };
    console.error = (...args) => {
      handleLog('error', args);
      originalError(...args);
    };

    return () => {
      console.log = originalLog;
      console.error = originalError;
    };
  }, []);

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [logs]);

  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          initial={{ opacity: 0, scale: 0.95, y: 20 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.95, y: 20 }}
          className="fixed inset-x-4 bottom-24 z-[100] max-h-[60vh] bg-[#1A1917]/90 backdrop-blur-xl border border-white/10 rounded-[24px] shadow-2xl flex flex-col overflow-hidden"
        >
          <div className="flex items-center justify-between px-6 py-4 border-b border-white/5">
            <span className="text-[12px] font-mono text-white/40 uppercase tracking-widest">System Console</span>
            <button onClick={onClose} className="p-1 opacity-40 hover:opacity-100 transition-opacity">
              <img src="/icons/close.svg" className="w-5 h-5 invert" alt="Close" />
            </button>
          </div>
          
          <div ref={scrollRef} className="flex-1 overflow-y-auto p-6 space-y-3 font-mono text-[13px] hide-scrollbar">
            {logs.length === 0 && <div className="text-white/20 italic">Ожидание логов...</div>}
            {logs.map((log, i) => (
              <div key={i} className="flex gap-3 border-b border-white/[0.02] pb-2">
                <span className="text-white/20 shrink-0">{log.time}</span>
                <span className={log.type === 'error' ? "text-red-400" : "text-emerald-400"}>
                  [{log.type.toUpperCase()}]
                </span>
                <span className="text-[#E8E6E3] break-all">{log.message}</span>
              </div>
            ))}
          </div>
          
          <div className="p-4 bg-white/[0.02] flex justify-center">
            <button 
              onClick={() => setLogs([])}
              className="text-[11px] text-white/30 hover:text-white/60 transition-colors uppercase"
            >
              Очистить консоль
            </button>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
