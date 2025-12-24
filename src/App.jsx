// App.jsx - Головний компонент
import React, { useState } from 'react';
import LoginForm from './components/LoginForm';
import Header from './components/Header';
import TestView from './components/TestView';
import { getTheme } from './config/theme';

export default function App() {
  const [isDarkMode, setIsDarkMode] = useState(false);
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [activeTab, setActiveTab] = useState('tests');
  const [currentQuestion, setCurrentQuestion] = useState(0);
  const [answers, setAnswers] = useState({});
  const [checkedQuestions, setCheckedQuestions] = useState({});

  const theme = getTheme(isDarkMode);

  const handleLogin = (e) => {
    e.preventDefault();
    if (email === 'test@example.com' && password === '123456') {
      setIsLoggedIn(true);
    } else {
      alert('Спробуйте: test@example.com / 123456');
    }
  };

  if (!isLoggedIn) {
    return (
      <LoginForm
        email={email}
        setEmail={setEmail}
        password={password}
        setPassword={setPassword}
        onLogin={handleLogin}
        theme={theme}
        isDarkMode={isDarkMode}
      />
    );
  }

  return (
    <div className={`min-h-screen ${theme.bg} ${theme.text} transition-colors pb-10 font-sans`}>
      <Header
        activeTab={activeTab}
        setActiveTab={setActiveTab}
        isDarkMode={isDarkMode}
        setIsDarkMode={setIsDarkMode}
        onLogout={() => setIsLoggedIn(false)}
        theme={theme}
      />

      <main className="max-w-5xl mx-auto px-6 mt-12">
        {activeTab === 'tests' && (
          <TestView
            currentQuestion={currentQuestion}
            setCurrentQuestion={setCurrentQuestion}
            answers={answers}
            setAnswers={setAnswers}
            checkedQuestions={checkedQuestions}
            setCheckedQuestions={setCheckedQuestions}
            theme={theme}
          />
        )}

        {activeTab === 'profile' && (
          <div className="text-center mt-20 p-20 border-4 border-dashed rounded-[3rem] opacity-30 text-3xl font-black">
            Прогрес завантажується...
          </div>
        )}

        {activeTab === 'about' && (
          <div className="max-w-3xl mx-auto text-center animate-slideIn">
            <h1 className="text-5xl font-black mb-8 italic">НМТ ЕКСПРЕС 2025</h1>
            <p className="text-2xl opacity-50">
              Найкращий симулятор тестів з історії. З кожним правильним хрестиком ти стаєш ближчим до 200 балів.
            </p>
          </div>
        )}
      </main>

      <style>{`
        @keyframes fadeIn { from { opacity: 0; transform: translateY(10px); } to { opacity: 1; transform: translateY(0); } }
        @keyframes slideIn { from { opacity: 0; transform: translateX(-10px); } to { opacity: 1; transform: translateX(0); } }
        .animate-fadeIn { animation: fadeIn 0.4s ease-out; }
        .animate-slideIn { animation: slideIn 0.5s cubic-bezier(0.16, 1, 0.3, 1) forwards; }
        .scrollbar-hide::-webkit-scrollbar { display: none; }
      `}</style>
    </div>
  );
}
