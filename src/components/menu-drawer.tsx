"use client";

type MenuDrawerProps = {
  open: boolean;
  onClose: () => void;
};

const menuItems = ["История", "Настройки", "Профиль", "Выход"];

export function MenuDrawer({ open, onClose }: MenuDrawerProps) {
  return (
    <>
      <button
        type="button"
        aria-label="Закрыть меню"
        onClick={onClose}
        className={`absolute inset-0 z-30 bg-[#171717]/10 transition-opacity duration-200 ${
          open ? "opacity-100" : "pointer-events-none opacity-0"
        }`}
      />

      <aside
        className={`absolute left-0 top-0 z-40 h-dvh w-[82%] max-w-[320px] border-r border-[#E4DED4] bg-[#FBFAF7] px-4 pb-6 pt-5 transition-transform duration-200 ${
          open ? "translate-x-0" : "-translate-x-full"
        }`}
      >
        <div className="flex items-center justify-center gap-3 pb-6">
          <img
            src="/icons/applogo.PNG"
            alt=""
            aria-hidden="true"
            className="h-8 w-8 rounded-[10px] object-cover"
          />
          <span className="text-lg font-semibold tracking-[-0.03em] text-[#39704E]">swgoh.ai</span>
        </div>

        <div className="space-y-3">
          {menuItems.map((item) => (
            <button
              key={item}
              type="button"
              className="flex h-12 w-full items-center rounded-[14px] border border-[#E6E0D7] bg-[#FFFFFF] px-4 text-left text-sm font-medium text-[#222222]"
            >
              {item}
            </button>
          ))}
        </div>
      </aside>
    </>
  );
}
