// components/LoginForm.jsx
import React from 'react';
import MainLogo from '../images/MainLogo1.png';

export default function LoginForm({ email, setEmail, password, setPassword, onLogin, theme, isDarkMode }) {
  return (
    <div className={`min-h-screen ${theme.bg} flex items-center justify-center p-6 relative overflow-hidden`}>
      {/* Фонові елементи */}
      <div className="absolute inset-0 opacity-5">
        <div className="absolute top-10 left-10 text-9xl animate-float">📜</div>
        <div className="absolute bottom-20 right-20 text-9xl animate-float-delayed">⚔️</div>
      </div>

      {/* Центральна форма */}
      <div className="relative z-10 w-full max-w-md">
        {/* ЛОГОТИП */}
        <div className="text-center mb-8 animate-fade-in-down">
          <div className="mb-6 flex justify-center">
            <div className="relative">
              {/* Світіння */}
              <div className="absolute inset-0 bg-teal-500/20 blur-3xl rounded-full animate-pulse"></div>
              
              {/* Лого */}
              <img 
                src={MainLogo}
                alt="НМТ Експрес" 
                className="relative w-40 h-40 object-contain drop-shadow-2xl animate-glow transition-transform hover:scale-110 duration-300"
              />
            </div>
          </div>
          
          <div className="h-1 w-32 mx-auto bg-gradient-to-r from-transparent via-teal-500 to-transparent animate-expand"></div>
        </div>

        {/* Форма */}
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

        {/* Орнамент */}
        <div className="mt-8 flex justify-center gap-2 animate-fade-in-late">
          <div className={`w-2 h-2 rounded-full ${isDarkMode ? 'bg-teal-500/20' : 'bg-teal-500/30'} animate-pulse`}></div>
          <div className={`w-2 h-2 rounded-full ${isDarkMode ? 'bg-teal-500/40' : 'bg-teal-500/50'} animate-pulse`} style={{animationDelay: '0.2s'}}></div>
          <div className={`w-2 h-2 rounded-full ${isDarkMode ? 'bg-teal-500/60' : 'bg-teal-500/70'} animate-pulse`} style={{animationDelay: '0.4s'}}></div>
        </div>
      </div>

      <style>{`
        @keyframes float { 0%, 100% { transform: translateY(0px); } 50% { transform: translateY(-20px); } }
        @keyframes float-delayed { 0%, 100% { transform: translateY(0px); } 50% { transform: translateY(-30px); } }
        @keyframes fade-in-down { from { opacity: 0; transform: translateY(-30px); } to { opacity: 1; transform: translateY(0); } }
        @keyframes fade-in-up { from { opacity: 0; transform: translateY(30px); } to { opacity: 1; transform: translateY(0); } }
        @keyframes fade-in { from { opacity: 0; } to { opacity: 1; } }
        @keyframes fade-in-delayed { from { opacity: 0; } to { opacity: 1; } }
        @keyframes slide-in { from { opacity: 0; transform: translateX(-20px); } to { opacity: 1; transform: translateX(0); } }
        @keyframes slide-in-delayed { from { opacity: 0; transform: translateX(-20px); } to { opacity: 1; transform: translateX(0); } }
        @keyframes slide-in-late { from { opacity: 0; transform: translateY(20px); } to { opacity: 1; transform: translateY(0); } }
        @keyframes fade-in-late { from { opacity: 0; } to { opacity: 1; } }
        @keyframes expand { from { transform: scaleX(0); } to { transform: scaleX(1); } }
        @keyframes glow { 0%, 100% { filter: drop-shadow(0 0 30px rgba(20, 184, 166, 0.4)); } 50% { filter: drop-shadow(0 0 50px rgba(20, 184, 166, 0.6)); } }

        .animate-float { animation: float 6s ease-in-out infinite; }
        .animate-float-delayed { animation: float-delayed 8s ease-in-out infinite; }
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
      `}</style>
    </div>
  );
}
