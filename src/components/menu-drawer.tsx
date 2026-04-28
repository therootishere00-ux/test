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
        className={`absolute left-0 top-0 z-40 h-dvh w-[84%] max-w-[340px] border-r border-[#E6E0D7] bg-[#F5F3EE] px-5 pb-6 pt-4 transition-transform duration-200 ${
          open ? "translate-x-0" : "-translate-x-full"
        }`}
      >
        <div className="flex h-full flex-col">
          <div className="flex items-start justify-between">
            <div className="flex items-center gap-3 pt-1">
              <img
                src="/icons/applogo.PNG"
                alt=""
                aria-hidden="true"
                className="h-7 w-7 object-contain"
              />
              <span className="text-[24px] font-semibold tracking-[-0.04em] text-[#39704E]">swgoh.ai</span>
            </div>

            <button
              type="button"
              aria-label="Закрыть меню"
              onClick={onClose}
              className="grid h-9 w-9 place-items-center rounded-[12px] border border-[#E4DED4] bg-[#FFFFFF]"
            >
              <img src="/icons/close.PNG" alt="" aria-hidden="true" className="h-[14px] w-[14px]" />
            </button>
          </div>

          <div className="pt-8">
            <div className="space-y-2.5">
              <button
                type="button"
                className="flex h-11 w-full items-center rounded-[14px] border border-[#E6E0D7] bg-[#FFFFFF] px-3.5 text-left text-[13px] font-medium text-[#232323]"
              >
                <span className="flex items-center gap-3">
                  <span className="h-5 w-5 rounded-[7px] border border-[#D8D1C7] bg-[#F3EFE8]" />
                  <span>Аккаунт</span>
                </span>
              </button>

              <button
                type="button"
                className="flex h-11 w-full items-center rounded-[14px] border border-[#E6E0D7] bg-[#FFFFFF] px-3.5 text-left text-[13px] font-medium text-[#232323]"
              >
                <span className="flex items-center gap-3">
                  <img
                    src="/icons/settings.PNG"
                    alt=""
                    aria-hidden="true"
                    className="h-[16px] w-[16px]"
                  />
                  <span>Настройки</span>
                </span>
              </button>
            </div>
          </div>

          <div className="flex flex-1 items-center justify-center">
            <p className="text-sm font-medium text-[#9A948A]">Чатов нет</p>
          </div>
        </div>
      </aside>
    </>
  );
}
