// App.jsx - Головний компонент
import React, { useState } from 'react';
import LoginForm from './components/LoginForm';
import Header from './components/Header';
import TestSelector from './components/TestSelector';
import TestView from './components/TestView';
import Profile from './components/Profile';
import { getTheme } from './config/theme';
import { users } from './data/users';
import { test1 } from './data/test1';
import { test2 } from './data/test2';
import { test3 } from './data/test3';

const allTests = [test1, test2, test3];

export default function App() {
  const [isDarkMode, setIsDarkMode] = useState(false);
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [currentUser, setCurrentUser] = useState(null);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [activeTab, setActiveTab] = useState('tests');
  const [selectedTest, setSelectedTest] = useState(null);
  const [currentQuestion, setCurrentQuestion] = useState(0);
  const [answers, setAnswers] = useState({});
  const [checkedQuestions, setCheckedQuestions] = useState({});
  const [progress, setProgress] = useState({
    test1: { completed: 0, total: test1.questions.length, correctAnswers: {} },
    test2: { completed: 0, total: test2.questions.length, correctAnswers: {} },
    test3: { completed: 0, total: test3.questions.length, correctAnswers: {} }
  });

  const theme = getTheme(isDarkMode);

  const handleLogin = (e) => {
    e.preventDefault();
    const user = users.find(u => u.email === email && u.password === password);
    
    if (user) {
      setIsLoggedIn(true);
      setCurrentUser(user);
    } else {
      alert('Невірний логін або пароль!\n\nТестові акаунти:\ntest@example.com / 123456\nstudent@nmt.ua / nmt2025\nvip@history.com / ukraine\ndemo@test.com / demo123');
    }
  };

  const handleSelectTest = (test) => {
    setSelectedTest(test);
    setCurrentQuestion(0);
    setAnswers({});
    setCheckedQuestions({});
  };

  const handleBackToTests = () => {
    setSelectedTest(null);
  };

  const handleUpdateProgress = (testId, questionIndex) => {
    setProgress(prev => {
      const testProgress = prev[testId];
      const newCorrectAnswers = { ...testProgress.correctAnswers, [questionIndex]: true };
      const completed = Object.keys(newCorrectAnswers).length;
      
      return {
        ...prev,
        [testId]: {
          ...testProgress,
          completed,
          correctAnswers: newCorrectAnswers
        }
      };
    });
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
        {activeTab === 'tests' && !selectedTest && (
          <TestSelector
            tests={allTests}
            onSelectTest={handleSelectTest}
            progress={progress}
            theme={theme}
          />
        )}

        {activeTab === 'tests' && selectedTest && (
          <TestView
            currentTest={selectedTest}
            currentQuestion={currentQuestion}
            setCurrentQuestion={setCurrentQuestion}
            answers={answers}
            setAnswers={setAnswers}
            checkedQuestions={checkedQuestions}
            setCheckedQuestions={setCheckedQuestions}
            onUpdateProgress={handleUpdateProgress}
            onBackToTests={handleBackToTests}
            theme={theme}
          />
        )}

        {activeTab === 'profile' && (
          <Profile
            user={currentUser}
            tests={allTests}
            progress={progress}
            theme={theme}
          />
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
