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
        {/* Верхний блок: Шапка */}
        <div className="relative flex items-center justify-between px-6 py-5 border-b border-[#E5E5DF]">
          <img
            src="/icons/applogo.PNG"
            alt=""
            aria-hidden="true"
            className="relative z-10 h-7 w-7 object-contain"
          />

          <span
            className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 text-[22px] font-bold tracking-[-0.04em] text-[#305327]"
            style={{ fontFamily: "var(--font-menu, sans-serif)" }}
          >
            swgoh<span className="opacity-70">.ai</span>
          </span>

          <button
            type="button"
            aria-label="Закрыть меню"
            onClick={onClose}
            className="relative z-10 flex items-center justify-end transition-transform active:scale-90"
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
          <p className="text-[15px] font-medium text-[#171717]/60">
            Чатов нет
          </p>
          <p className="mt-1.5 text-[13px] text-[#171717]/40 font-medium">
            Самое время начать болтать!
          </p>
        </div>

        {/* Нижний блок: Профиль */}
        <div className="border-t border-[#E5E5DF] px-6 py-5 flex items-center gap-3 transition-colors active:bg-black/5 cursor-pointer">
          <div className="h-9 w-9 rounded-full bg-[#E5E5DF] overflow-hidden flex-shrink-0">
            {/* В будущем здесь будет аватарка, пока просто серый круг */}
          </div>
          <span className="text-[15px] font-semibold text-[#171717]/85 tracking-tight">
            Юзер
          </span>
        </div>
      </aside>
    </>
  );
}
