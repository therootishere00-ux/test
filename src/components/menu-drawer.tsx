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
        className={`absolute inset-0 z-30 bg-[#171717]/8 backdrop-blur-[4px] transition-all duration-200 ${
          open ? "opacity-100" : "pointer-events-none opacity-0"
        }`}
      />

      <aside
        className={`absolute left-0 top-0 z-40 h-dvh w-[84%] max-w-[340px] bg-[#F5F5F0] shadow-2xl transition-transform duration-300 ease-[0.23,1,0.32,1] flex flex-col ${
          open ? "translate-x-0" : "-translate-x-full"
        }`}
      >
        {/* Верхний блок: Шапка (без линии) */}
        <div className="flex items-center justify-between px-6 py-5">
          <div className="flex items-center gap-3">
            <img
              src="/icons/applogo.PNG"
              alt=""
              aria-hidden="true"
              className="h-7 w-7 object-contain"
            />
            <span
              className="text-[22px] font-bold italic tracking-[-0.04em] text-[#305327]"
              style={{ fontFamily: "var(--font-menu, sans-serif)" }}
            >
              swgoh<span className="opacity-70">.ai</span>
            </span>
          </div>

          <button
            type="button"
            aria-label="Закрыть меню"
            onClick={onClose}
            className="flex items-center transition-transform active:scale-90"
          >
            <img 
              src="/icons/cross.PNG" 
              alt="" 
              aria-hidden="true" 
              className="h-5 w-5 object-contain opacity-80" 
            />
          </button>
        </div>

        {/* Центральный блок: Контент */}
        <div className="flex flex-1 flex-col items-center justify-center px-6 text-center">
          <img 
            src="/icons/empty.PNG" 
            alt="" 
            className="h-24 w-24 object-contain mb-4 opacity-40"
          />
          <p className="text-[15px] font-medium text-[#171717]/60">
            Чатов нет
          </p>
          <p className="mt-1.5 text-[13px] text-[#171717]/40 font-medium">
            Самое время начать болтать!
          </p>
        </div>

        {/* Нижний блок: Рекламный баннер и Профиль */}
        <div className="mt-auto flex flex-col">
          
          {/* Баннер из фото */}
          <div className="mx-4 mb-5 flex items-center justify-between bg-[#E9EDE7] rounded-[20px] p-4 pr-3 cursor-pointer active:scale-[0.98] transition-transform group">
            <div className="flex flex-col flex-1 pr-2">
              <span className="text-[15px] font-bold text-[#171717] leading-tight mb-1">
                Не знаешь с чего начать?
              </span>
              <span className="text-[12px] font-medium text-[#171717]/60 leading-snug">
                Вот несколько популярных тем, которые могут быть полезны.
              </span>
            </div>
            <div className="flex items-center gap-2">
              <img 
                src="/icons/suggestion.PNG" 
                alt="" 
                className="h-12 w-12 object-contain" 
              />
              <img 
                src="/icons/right.PNG" 
                alt="" 
                className="h-3 w-3 object-contain opacity-30 group-hover:opacity-50 transition-opacity" 
              />
            </div>
          </div>

          {/* Блок Юзера */}
          <div className="border-t border-[#E5E5DF] px-6 py-5 flex items-center justify-between transition-colors active:bg-black/5 cursor-pointer">
            <div className="flex items-center gap-3">
              <div className="h-10 w-10 rounded-full bg-[#E5E5DF] overflow-hidden flex-shrink-0">
                {/* Место для аватарки */}
              </div>
              <div className="flex flex-col">
                <span className="text-[15px] font-bold text-[#171717]/85 leading-tight">
                  Юзер
                </span>
                <span className="text-[12px] font-medium text-[#171717]/40">
                  @user
                </span>
              </div>
            </div>
            <img 
              src="/icons/right.PNG" 
              alt="" 
              className="h-4 w-4 object-contain opacity-30" 
            />
          </div>
        </div>
      </aside>
    </>
  );
}
