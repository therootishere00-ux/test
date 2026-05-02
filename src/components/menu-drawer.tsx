"use client";

type MenuDrawerProps = {
  open: boolean;
  onClose: () => void;
};

export function MenuDrawer({ open, onClose }: MenuDrawerProps) {
  return (
    <>
      <button
        type="button"
        aria-label="Закрыть меню"
        onClick={onClose}
        className={`fixed inset-0 z-[60] bg-[#171717]/20 backdrop-blur-[4px] transition-all duration-500 ease-out ${
          open ? "opacity-100" : "pointer-events-none opacity-0"
        }`}
        style={{ willChange: "opacity, backdrop-filter" }}
      />

      <aside
        className={`fixed left-0 top-0 z-[70] h-dvh w-[84%] max-w-[340px] bg-[#FCFCFA] shadow-[4px_0_24px_rgba(0,0,0,0.04)] flex flex-col transition-transform duration-500 ease-[cubic-bezier(0.34,1.56,0.64,1)] ${
          open ? "translate-x-0" : "-translate-x-full"
        }`}
        style={{ willChange: "transform" }}
      >
        {/* Шапка */}
        <div className="flex items-center justify-between px-6 py-6">
          <div className="flex items-center gap-3">
            <img
              src="/icons/applogo.PNG"
              alt=""
              className="h-7 w-7 object-contain"
            />
            {/* Serif для логотипа, выглядит более "книжно" */}
            <span
              className="text-[24px] font-serif font-bold tracking-tight text-[#305327]"
            >
              swgoh<span className="opacity-60 italic">.ai</span>
            </span>
          </div>

          <button 
            onClick={onClose} 
            className="flex h-8 w-8 items-center justify-center rounded-full bg-black/5 transition-all duration-200 active:scale-[0.9] active:bg-black/10"
          >
            <img src="/icons/cross.PNG" alt="" className="h-4 w-4 object-contain opacity-70" />
          </button>
        </div>

        {/* Центральный блок */}
        <div className="flex flex-1 flex-col items-center justify-center px-6 text-center">
          <img 
            src="/icons/empty.PNG" 
            alt="" 
            className="h-28 w-28 object-contain mb-6 opacity-40 transition-transform duration-700 hover:scale-105" 
          />
          <p className="text-[16px] font-serif font-medium text-[#171717]/80">
            Здесь пока пусто
          </p>
          <p className="mt-2 text-[14px] text-[#171717]/40">
            Самое время начать диалог.
          </p>
        </div>

        {/* Низ: Реклама и Юзер (теперь в стиле чистого списка) */}
        <div className="mt-auto px-3 pb-5 flex flex-col gap-1">
          {/* Баннер-подсказка */}
          <button className="flex items-center justify-between w-full rounded-2xl px-4 py-3.5 transition-all duration-200 hover:bg-[#F0F0EB] active:scale-[0.98] active:bg-[#EBEBE5] group text-left">
            <div className="flex flex-col flex-1 pr-4">
              <span className="text-[15px] font-serif font-bold text-[#171717] leading-tight mb-1">
                Подсказки
              </span>
              <span className="text-[13px] text-[#171717]/50 leading-snug">
                Популярные темы для старта
              </span>
            </div>
            <img 
              src="/icons/right.PNG" 
              alt="" 
              className="h-3.5 w-3.5 object-contain opacity-30 transition-transform duration-300 group-hover:translate-x-1" 
            />
          </button>

          {/* Блок Юзера */}
          <button className="flex items-center justify-between w-full rounded-2xl px-4 py-3.5 transition-all duration-200 hover:bg-[#F0F0EB] active:scale-[0.98] active:bg-[#EBEBE5] text-left">
            <div className="flex items-center gap-3.5">
              <div className="h-10 w-10 rounded-full bg-[#E5E5DF] flex items-center justify-center overflow-hidden flex-shrink-0">
                 <img src="/icons/profile.PNG" alt="" className="h-5 w-5 opacity-40" />
              </div>
              <div className="flex flex-col">
                <span className="text-[15px] font-bold text-[#171717]/90 leading-tight">
                  Юзер
                </span>
                <span className="text-[13px] text-[#171717]/40">
                  @user
                </span>
              </div>
            </div>
            <img 
              src="/icons/dots.PNG" 
              alt="" 
              className="h-5 w-5 object-contain opacity-40" 
            />
          </button>
        </div>
      </aside>
    </>
  );
}
