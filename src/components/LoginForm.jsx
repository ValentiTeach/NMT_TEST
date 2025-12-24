// components/LoginForm.jsx
import React from 'react';

export default function LoginForm({ email, setEmail, password, setPassword, onLogin, theme, isDarkMode }) {
  return (
    <div className={`min-h-screen ${theme.bg} flex items-center justify-center p-6`}>
      <form onSubmit={onLogin} className={`${theme.card} p-12 rounded-[2.5rem] border w-full max-w-md shadow-2xl animate-fadeIn`}>
        <h2 className={`text-4xl font-black mb-8 text-center ${theme.text} tracking-tight`}>Вхід</h2>
        <input 
          className={`w-full p-5 border rounded-2xl mb-4 outline-none transition-all ${isDarkMode ? 'bg-zinc-800 border-zinc-700 text-white' : 'bg-slate-50 border-slate-200'}`}
          placeholder="Email"
          value={email}
          onChange={e => setEmail(e.target.value)}
          required
        />
        <input 
          className={`w-full p-5 border rounded-2xl mb-6 outline-none transition-all ${isDarkMode ? 'bg-zinc-800 border-zinc-700 text-white' : 'bg-slate-50 border-slate-200'}`}
          type="password"
          placeholder="Пароль"
          value={password}
          onChange={e => setPassword(e.target.value)}
          required
        />
        <button className="w-full bg-teal-600 text-white py-5 rounded-2xl font-black text-xl hover:bg-teal-700 transition-all shadow-xl shadow-teal-500/20 uppercase tracking-widest">
          Увійти
        </button>
      </form>
    </div>
  );
}
