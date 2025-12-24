// config/theme.js - Налаштування теми
export const getTheme = (isDarkMode) => ({
  bg: isDarkMode ? 'bg-[#0A0A0B]' : 'bg-[#F9FAFB]',
  card: isDarkMode ? 'bg-[#151518] border-[#252529]' : 'bg-white border-slate-200',
  text: isDarkMode ? 'text-slate-100' : 'text-slate-900',
  subtext: isDarkMode ? 'text-slate-400' : 'text-slate-500'
});
