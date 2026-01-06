// components/Header.jsx - З вкладкою Календар
import React from 'react';
import { Moon, Sun } from 'lucide-react';

export default function Header({ activeTab, setActiveTab, isDarkMode, setIsDarkMode, onLogout, theme, currentUser }) {
  // Визначаємо які вкладки показувати
  const tabs = ['tests', 'calendar', 'profile', 'about'];
  
  // Якщо користувач - адмін, додаємо вкладку "Адмін"
  if (currentUser?.role === 'admin') {
    tabs.push('admin');
  }

  const tabLabels = {
    tests: 'Тести',
    calendar: '📅 Календар',
    profile: 'Профіль',
    about: 'Про сайт',
    admin: '👑 Адмін'
  };

  return (
    <header className={`${theme.card} border-b py-5 px-8 sticky top-0 z-50`}>
      <div className="max-w-6xl mx-auto flex justify-between items-center">
        <div className="flex gap-4">
          {tabs.map(tab => (
            <button
              key={tab}
              onClick={() => setActiveTab(tab)}
              className={`font-black text-sm uppercase tracking-wider px-4 py-2 rounded-xl transition ${
                activeTab === tab
                  ? tab === 'admin'
                    ? 'bg-amber-500 text-white shadow-lg shadow-amber-500/30'
                    : tab === 'calendar'
                    ? 'bg-blue-500 text-white shadow-lg shadow-blue-500/30'
                    : 'bg-teal-500 text-white shadow-lg shadow-teal-500/30'
                  : 'opacity-40 hover:opacity-100'
              }`}
            >
              {tabLabels[tab]}
            </button>
          ))}
        </div>
        <div className="flex items-center gap-4">
          <button
            onClick={() => setIsDarkMode(!isDarkMode)}
            className="p-3 bg-zinc-500/10 rounded-full"
          >
            {isDarkMode ? <Sun size={24} className="text-yellow-400" /> : <Moon size={24} />}
          </button>
          <button
            onClick={onLogout}
            className="text-red-400 font-bold hover:scale-105 transition uppercase text-xs"
          >
            Вихід
          </button>
        </div>
      </div>
    </header>
  );
}
