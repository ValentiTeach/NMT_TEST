// components/LoginForm.jsx - З кастомним логотипом
import React from 'react';

export default function LoginForm({ email, setEmail, password, setPassword, onLogin, theme, isDarkMode }) {
  return (
    <div className={`min-h-screen ${theme.bg} flex items-center justify-center p-6 relative overflow-hidden`}>
      {/* Фонові історичні елементи */}
      <div className="absolute inset-0 opacity-5">
        <div className="absolute top-10 left-10 text-9xl animate-float">📜</div>
        <div className="absolute bottom-20 right-20 text-9xl animate-float-delayed">⚔️</div>
        <div className="absolute top-1/3 right-1/4 text-7xl animate-float-slow">🏛️</div>
        <div className="absolute bottom-1/3 left-1/4 text-7xl animate-float-delayed">🛡️</div>
      </div>

      {/* Декоративні лінії */}
      <div className="absolute inset-0 pointer-events-none">
        <div className="absolute top-0 left-1/4 w-px h-full bg-gradient-to-b from-transparent via-teal-500/10 to-transparent animate-line-grow"></div>
        <div className="absolute top-0 right-1/4 w-px h-full bg-gradient-to-b from-transparent via-teal-500/10 to-transparent animate-line-grow-delayed"></div>
      </div>

      {/* Центральна форма */}
      <div className="relative z-10 w-full max-w-md">
        {/* КАСТОМНИЙ ЛОГОТИП */}
        <div className="text-center mb-8 animate-fade-in-down">
          <div className="mb-4 flex justify-center">
            {/* Твоя іконка MainLogo */}
            <img 
              src="/images/MainLogo.png"
              alt="НМТ Логотип" 
              className="w-32 h-32 object-contain filter drop-shadow-2xl animate-glow"
              onError={(e) => {
                // Fallback на емодзі якщо зображення не завантажилось
                e.target.style.display = 'none';
                e.target.nextElementSibling.style.display = 'block';
              }}
            />
            {/* Fallback емодзі (якщо іконка не завантажиться) */}
            <div className="text-8xl hidden">⛵</div>
          </div>
          <div className="h-1 w-32 mx-auto bg-gradient-to-r from-transparent via-teal-500 to-transparent animate-expand"></div>
        </div>

        {/* Форма входу */}
        <form onSubmit={onLogin} className={`${theme.card} p-12 rounded-[2.5rem] border-2 shadow-2xl backdrop-blur-sm animate-fade-in-up`}>
          <h2 className={`text-4xl font-black mb-3 text-center ${theme.text} tracking-tight animate-fade-in`}>
            НМТ ІСТОРІЯ
          </h2>
          <p className={`text-center ${theme.subtext} mb-8 text-sm animate-fade-in-delayed`}>
            Увійдіть до системи підготовки
          </p>

          <div className="space-y-4">
            <div className="animate-slide-in">
              <label className={`block text-xs font-bold mb-2 ${theme.subtext} uppercase tracking-wider`}>
                Email
              </label>
              <input 
                className={`w-full p-5 border-2 rounded-2xl outline-none transition-all ${
                  isDarkMode 
                    ? 'bg-zinc-800/50 border-zinc-700 text-white focus:border-teal-500' 
                    : 'bg-slate-50 border-slate-200 focus:border-teal-500'
                } focus:ring-4 focus:ring-teal-500/10`}
                placeholder="your@email.com"
                value={email}
                onChange={e => setEmail(e.target.value)}
                required
              />
            </div>

            <div className="animate-slide-in-delayed">
              <label className={`block text-xs font-bold mb-2 ${theme.subtext} uppercase tracking-wider`}>
                Пароль
              </label>
              <input 
                className={`w-full p-5 border-2 rounded-2xl outline-none transition-all ${
                  isDarkMode 
                    ? 'bg-zinc-800/50 border-zinc-700 text-white focus:border-teal-500' 
                    : 'bg-slate-50 border-slate-200 focus:border-teal-500'
                } focus:ring-4 focus:ring-teal-500/10`}
                type="password"
                placeholder="••••••"
                value={password}
                onChange={e => setPassword(e.target.value)}
                required
              />
            </div>
          </div>

          <button className="w-full mt-8 bg-gradient-to-r from-teal-600 to-teal-500 text-white py-5 rounded-2xl font-black text-xl hover:shadow-2xl hover:shadow-teal-500/30 transition-all shadow-xl active:scale-95 uppercase tracking-widest animate-slide-in-late">
            Увійти
          </button>
        </form>

        {/* Декоративний орнамент знизу */}
        <div className="mt-8 flex justify-center gap-2 animate-fade-in-late">
          <div className={`w-2 h-2 rounded-full ${isDarkMode ? 'bg-teal-500/20' : 'bg-teal-500/30'} animate-pulse`}></div>
          <div className={`w-2 h-2 rounded-full ${isDarkMode ? 'bg-teal-500/40' : 'bg-teal-500/50'} animate-pulse`} style={{animationDelay: '0.2s'}}></div>
          <div className={`w-2 h-2 rounded-full ${isDarkMode ? 'bg-teal-500/60' : 'bg-teal-500/70'} animate-pulse`} style={{animationDelay: '0.4s'}}></div>
        </div>
      </div>

      <style>{`
        @keyframes float {
          0%, 100% { transform: translateY(0px); }
          50% { transform: translateY(-20px); }
        }
        @keyframes float-delayed {
          0%, 100% { transform: translateY(0px); }
          50% { transform: translateY(-30px); }
        }
        @keyframes float-slow {
          0%, 100% { transform: translateY(0px) rotate(0deg); }
          50% { transform: translateY(-15px) rotate(5deg); }
        }
        @keyframes fade-in-down {
          from { opacity: 0; transform: translateY(-30px); }
          to { opacity: 1; transform: translateY(0); }
        }
        @keyframes fade-in-up {
          from { opacity: 0; transform: translateY(30px); }
          to { opacity: 1; transform: translateY(0); }
        }
        @keyframes fade-in {
          from { opacity: 0; }
          to { opacity: 1; }
        }
        @keyframes fade-in-delayed {
          from { opacity: 0; }
          to { opacity: 1; }
        }
        @keyframes slide-in {
          from { opacity: 0; transform: translateX(-20px); }
          to { opacity: 1; transform: translateX(0); }
        }
        @keyframes slide-in-delayed {
          from { opacity: 0; transform: translateX(-20px); }
          to { opacity: 1; transform: translateX(0); }
        }
        @keyframes slide-in-late {
          from { opacity: 0; transform: translateY(20px); }
          to { opacity: 1; transform: translateY(0); }
        }
        @keyframes fade-in-late {
          from { opacity: 0; }
          to { opacity: 1; }
        }
        @keyframes expand {
          from { transform: scaleX(0); }
          to { transform: scaleX(1); }
        }
        @keyframes glow {
          0%, 100% { filter: drop-shadow(0 0 20px rgba(20, 184, 166, 0.3)); }
          50% { filter: drop-shadow(0 0 30px rgba(20, 184, 166, 0.5)); }
        }
        @keyframes line-grow {
          from { transform: scaleY(0); opacity: 0; }
          to { transform: scaleY(1); opacity: 1; }
        }
        @keyframes line-grow-delayed {
          from { transform: scaleY(0); opacity: 0; }
          to { transform: scaleY(1); opacity: 1; }
        }

        .animate-float { animation: float 6s ease-in-out infinite; }
        .animate-float-delayed { animation: float-delayed 8s ease-in-out infinite; }
        .animate-float-slow { animation: float-slow 10s ease-in-out infinite; }
        .animate-fade-in-down { animation: fade-in-down 0.8s ease-out; }
        .animate-fade-in-up { animation: fade-in-up 1s ease-out 0.2s both; }
        .animate-fade-in { animation: fade-in 1s ease-out 0.4s both; }
        .animate-fade-in-delayed { animation: fade-in-delayed 1s ease-out 0.6s both; }
        .animate-slide-in { animation: slide-in 0.6s ease-out 0.8s both; }
        .animate-slide-in-delayed { animation: slide-in-delayed 0.6s ease-out 1s both; }
        .animate-slide-in-late { animation: slide-in-late 0.6s ease-out 1.2s both; }
        .animate-fade-in-late { animation: fade-in-late 0.8s ease-out 1.4s both; }
        .animate-expand { animation: expand 1.2s ease-out 0.6s both; }
        .animate-glow { animation: glow 3s ease-in-out infinite; }
        .animate-line-grow { animation: line-grow 2s ease-out; }
        .animate-line-grow-delayed { animation: line-grow-delayed 2s ease-out 0.3s; }
      `}</style>
    </div>
  );
}
