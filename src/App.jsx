import React, { useState } from 'react';
import LoginForm from './components/LoginForm';
import Header from './components/Header';
import TestView from './components/TestView';
import TestLobby from './components/TestLobby'; // <--- ВАЖЛИВО: додано імпорт
import { getTheme } from './config/theme';

export default function App() {
  const [isDarkMode, setIsDarkMode] = useState(false);
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [activeTab, setActiveTab] = useState('tests');
  
  // Стани для тестів
  const [selectedTest, setSelectedTest] = useState(null); // Який тест зараз вибрано
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

  const handleTabChange = (tab) => {
    if (tab === 'tests') {
      setSelectedTest(null); // Скидаємо вибір тесту при переключенні на вкладку "Тести"
    }
    setActiveTab(tab);
  };

  if (!isLoggedIn) {
    return (
      <LoginForm
        email={email} setEmail={setEmail}
        password={password} setPassword={setPassword}
        onLogin={handleLogin} theme={theme} isDarkMode={isDarkMode}
      />
    );
  }

  return (
    <div className={`min-h-screen ${theme.bg} ${theme.text} transition-colors pb-10 font-sans`}>
      <Header
        activeTab={activeTab}
        setActiveTab={handleTabChange}
        isDarkMode={isDarkMode}
        setIsDarkMode={setIsDarkMode}
        onLogout={() => setIsLoggedIn(false)}
        theme={theme}
      />

      <main className="max-w-5xl mx-auto px-6 mt-12">
        {activeTab === 'tests' && (
          !selectedTest ? (
            <div className="animate-fadeIn">
              <h2 className="text-4xl font-black mb-10 italic uppercase tracking-tighter">Обери свій виклик</h2>
              <TestLobby onSelectTest={setSelectedTest} theme={theme} />
            </div>
          ) : (
            <div className="animate-fadeIn">
              <button 
                onClick={() => setSelectedTest(null)}
                className="mb-6 opacity-40 hover:opacity-100 flex items-center gap-2 font-bold uppercase text-xs transition"
              >
                ← Повернутися до вибору
              </button>
              <TestView
                activeTestData={selectedTest}
                currentQuestion={currentQuestion}
                setCurrentQuestion={setCurrentQuestion}
                answers={answers}
                setAnswers={setAnswers}
                checkedQuestions={checkedQuestions}
                setCheckedQuestions={setCheckedQuestions}
                theme={theme}
              />
            </div>
          )
        )}

        {activeTab === 'profile' && (
          <div className="text-center mt-20 p-20 border-4 border-dashed rounded-[3rem] opacity-30 text-3xl font-black">
            Прогрес завантажується...
          </div>
        )}

        {activeTab === 'about' && (
          <div className="max-w-3xl mx-auto text-center animate-slideIn">
            <h1 className="text-5xl font-black mb-8 italic">НМТ ЕКСПРЕС 2025</h1>
            <p className="text-2xl opacity-50">Найкращий симулятор тестів.</p>
          </div>
        )}
      </main>
      
      {/* Стилі без змін */}
      <style>{`.animate-fadeIn { animation: fadeIn 0.4s ease-out; } @keyframes fadeIn { from { opacity: 0; transform: translateY(10px); } to { opacity: 1; transform: translateY(0); } }`}</style>
    </div>
  );
}
