// App.jsx - Головний компонент
import React, { useState, useEffect } from 'react';
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
import { test4 } from './data/test4';


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
    test4: { completed: 0, total: test4.questions.length, correctAnswers: {} }
  });
  const [isLoadingProgress, setIsLoadingProgress] = useState(false);

  const theme = getTheme(isDarkMode);

  // Автоматичне збереження прогресу кожні 30 секунд
  useEffect(() => {
    if (isLoggedIn && currentUser) {
      const interval = setInterval(() => {
        saveUserProgress(currentUser.email, progress);
      }, 30000); // Кожні 30 секунд

      return () => clearInterval(interval);
    }
  }, [isLoggedIn, currentUser, progress]);

  // Збереження при закритті вкладки
  useEffect(() => {
    const handleBeforeUnload = () => {
      if (isLoggedIn && currentUser) {
        saveUserProgress(currentUser.email, progress);
      }
    };

    window.addEventListener('beforeunload', handleBeforeUnload);
    return () => window.removeEventListener('beforeunload', handleBeforeUnload);
  }, [isLoggedIn, currentUser, progress]);

  // Завантаження прогресу користувача
  const loadUserProgress = async (userEmail) => {
    setIsLoadingProgress(true);
    try {
      const result = await window.storage.get(`progress:${userEmail}`);
      if (result && result.value) {
        const savedProgress = JSON.parse(result.value);
        setProgress(savedProgress);
      }
    } catch (error) {
      console.log('Прогрес не знайдено, використовуємо початковий');
    } finally {
      setIsLoadingProgress(false);
    }
  };

  // Збереження прогресу користувача
  const saveUserProgress = async (userEmail, progressData) => {
    try {
      await window.storage.set(`progress:${userEmail}`, JSON.stringify(progressData));
    } catch (error) {
      console.error('Помилка збереження прогресу:', error);
    }
  };

  const handleLogin = async (e) => {
    e.preventDefault();
    const user = users.find(u => u.email === email && u.password === password);
    
    if (user) {
      setIsLoggedIn(true);
      setCurrentUser(user);
      // Завантажуємо прогрес користувача
      await loadUserProgress(user.email);
    } else {
      alert('Невірний логін або пароль!\n\nЗверніться до адміністратора для отримання доступу.');
    }
  };

  const handleLogout = async () => {
    // Зберігаємо прогрес перед виходом
    if (currentUser) {
      await saveUserProgress(currentUser.email, progress);
    }
    setIsLoggedIn(false);
    setCurrentUser(null);
    setEmail('');
    setPassword('');
    setSelectedTest(null);
    setCurrentQuestion(0);
    setAnswers({});
    setCheckedQuestions({});
  };

  const handleSelectTest = (test) => {
    setSelectedTest(test);
    setCurrentQuestion(0);
    setAnswers({});
    setCheckedQuestions({});
  };

  const handleBackToTests = () => {
    setSelectedTest(null);
    setCurrentQuestion(0);
    setAnswers({});
    setCheckedQuestions({});
  };

  const handleUpdateProgress = async (testId, questionIndex, isCorrect) => {
    const newProgress = { ...progress };
    const testProgress = newProgress[testId];
    const newCorrectAnswers = { ...testProgress.correctAnswers };
    
    if (isCorrect) {
      newCorrectAnswers[questionIndex] = true;
    } else {
      delete newCorrectAnswers[questionIndex];
    }
    
    const completed = Object.keys(newCorrectAnswers).length;
    
    newProgress[testId] = {
      ...testProgress,
      completed,
      correctAnswers: newCorrectAnswers
    };
    
    setProgress(newProgress);
    
    // Автоматично зберігаємо прогрес
    if (currentUser) {
      await saveUserProgress(currentUser.email, newProgress);
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
        isLoading={isLoadingProgress}
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
        onLogout={handleLogout}
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
