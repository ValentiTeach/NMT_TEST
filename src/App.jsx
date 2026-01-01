// App.jsx - Головний компонент з Supabase інтеграцією
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
import progressService from './services/ProgressService';
import { testConnection } from './config/supabase';

const allTests = [test1, test2, test3, test4];

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
    test3: { completed: 0, total: test3.questions.length, correctAnswers: {} },
    test4: { completed: 0, total: test4.questions.length, correctAnswers: {} }
  });
  const [isLoadingProgress, setIsLoadingProgress] = useState(false);
  const [isCheckingSession, setIsCheckingSession] = useState(true);
  const [supabaseConnected, setSupabaseConnected] = useState(false);

  const theme = getTheme(isDarkMode);

  // Перевірка з'єднання з Supabase при завантаженні
  useEffect(() => {
    const checkSupabaseConnection = async () => {
      console.log('🔍 Перевірка з\'єднання з Supabase...');
      const connected = await testConnection();
      setSupabaseConnected(connected);
      
      if (!connected) {
        console.warn('⚠️ Supabase недоступний. Використовуємо localStorage як fallback.');
      }
    };
    
    checkSupabaseConnection();
  }, []);

  // Завантаження прогресу користувача з Supabase
  const loadUserProgress = async (userEmail) => {
    setIsLoadingProgress(true);
    console.log('📥 Завантаження прогресу для:', userEmail);
    
    try {
      // Спроба завантажити з Supabase
      if (supabaseConnected) {
        const savedProgress = await progressService.loadProgress(userEmail);
        
        if (savedProgress) {
          // Мерджимо збережений прогрес з початковим (для нових тестів)
          const mergedProgress = {
            test1: savedProgress.test1 || { completed: 0, total: test1.questions.length, correctAnswers: {} },
            test2: savedProgress.test2 || { completed: 0, total: test2.questions.length, correctAnswers: {} },
            test3: savedProgress.test3 || { completed: 0, total: test3.questions.length, correctAnswers: {} },
            test4: savedProgress.test4 || { completed: 0, total: test4.questions.length, correctAnswers: {} }
          };
          
          console.log('✅ Прогрес завантажено з Supabase:', mergedProgress);
          setProgress(mergedProgress);
        } else {
          console.log('ℹ️ Прогрес не знайдено в Supabase, використовуємо початковий');
        }
      } else {
        // Fallback на localStorage
        console.log('⚠️ Використовуємо localStorage як fallback');
        const localProgress = localStorage.getItem(`progress:${userEmail}`);
        if (localProgress) {
          const savedProgress = JSON.parse(localProgress);
          const mergedProgress = {
            test1: savedProgress.test1 || { completed: 0, total: test1.questions.length, correctAnswers: {} },
            test2: savedProgress.test2 || { completed: 0, total: test2.questions.length, correctAnswers: {} },
            test3: savedProgress.test3 || { completed: 0, total: test3.questions.length, correctAnswers: {} },
            test4: savedProgress.test4 || { completed: 0, total: test4.questions.length, correctAnswers: {} }
          };
          console.log('✅ Прогрес завантажено з localStorage:', mergedProgress);
          setProgress(mergedProgress);
        }
      }
    } catch (error) {
      console.error('❌ Помилка завантаження прогресу:', error);
    } finally {
      setIsLoadingProgress(false);
    }
  };

  // Збереження прогресу користувача в Supabase
  const saveUserProgress = async (userEmail, progressData) => {
    try {
      if (supabaseConnected) {
        // Зберігаємо в Supabase
        const success = await progressService.saveProgress(userEmail, progressData);
        if (success) {
          console.log('✅ Прогрес збережено в Supabase для:', userEmail);
        } else {
          console.error('❌ Помилка збереження в Supabase, використовуємо localStorage');
          localStorage.setItem(`progress:${userEmail}`, JSON.stringify(progressData));
        }
      } else {
        // Fallback на localStorage
        localStorage.setItem(`progress:${userEmail}`, JSON.stringify(progressData));
        console.log('✅ Прогрес збережено в localStorage для:', userEmail);
      }
    } catch (error) {
      console.error('❌ Помилка збереження прогресу:', error);
      // Аварійне збереження в localStorage
      try {
        localStorage.setItem(`progress:${userEmail}`, JSON.stringify(progressData));
        console.log('✅ Аварійне збереження в localStorage');
      } catch (localError) {
        console.error('❌ Навіть localStorage не працює:', localError);
      }
    }
  };

  // Перевірка сесії при завантаженні
  useEffect(() => {
    const checkSession = async () => {
      console.log('🔍 Перевірка сесії при завантаженні...');
      
      try {
        // Перевіряємо localStorage для сесії
        const sessionData = localStorage.getItem('current-session');
        
        if (sessionData) {
          console.log('✅ Сесія знайдена!');
          const session = JSON.parse(sessionData);
          console.log('👤 Email з сесії:', session.email);
          
          const user = users.find(u => u.email === session.email);
          if (user) {
            console.log('✅ Користувач знайдений:', user.name);
            setCurrentUser(user);
            setIsLoggedIn(true);
            await loadUserProgress(user.email);
          } else {
            console.log('❌ Користувача не знайдено в базі');
          }
        } else {
          console.log('ℹ️ Сесія не знайдена - потрібен новий логін');
        }
      } catch (error) {
        console.error('❌ Помилка перевірки сесії:', error);
      } finally {
        console.log('✅ Перевірка сесії завершена');
        setIsCheckingSession(false);
      }
    };
    
    checkSession();
  }, [supabaseConnected]);

  // Автоматичне збереження прогресу кожні 30 секунд
  useEffect(() => {
    if (isLoggedIn && currentUser) {
      const interval = setInterval(() => {
        saveUserProgress(currentUser.email, progress);
      }, 30000); // 30 секунд
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

  const handleLogin = async (e) => {
    e.preventDefault();
    console.log('🔐 Спроба входу для:', email);
    const user = users.find(u => u.email === email && u.password === password);
    
    if (user) {
      console.log('✅ Логін успішний для:', user.name);
      setIsLoggedIn(true);
      setCurrentUser(user);
      
      // Зберігаємо сесію в localStorage
      try {
        localStorage.setItem('current-session', JSON.stringify({ email: user.email }));
        console.log('✅ Сесія збережена для:', user.email);
      } catch (error) {
        console.error('❌ Помилка збереження сесії:', error);
      }
      
      // Завантажуємо прогрес користувача
      await loadUserProgress(user.email);
    } else {
      console.log('❌ Невірний логін або пароль');
      alert('Невірний логін або пароль!\n\nЗверніться до адміністратора для отримання доступу.');
    }
  };

  const handleLogout = async () => {
    console.log('🚪 Вихід з акаунту:', currentUser?.email);
    // Зберігаємо прогрес перед виходом
    if (currentUser) {
      await saveUserProgress(currentUser.email, progress);
    }
    // Видаляємо сесію
    try {
      localStorage.removeItem('current-session');
      console.log('✅ Сесія видалена');
    } catch (error) {
      console.error('❌ Помилка видалення сесії:', error);
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

  if (isCheckingSession) {
    return (
      <div className={`min-h-screen ${theme.bg} flex items-center justify-center`}>
        <div className="text-center">
          <div className="text-8xl mb-4 animate-pulse">⛵</div>
          <div className="text-2xl font-black text-teal-600">Завантаження...</div>
          {!supabaseConnected && (
            <div className="text-sm text-amber-600 mt-2">
              ⚠️ Підключення до бази даних...
            </div>
          )}
        </div>
      </div>
    );
  }

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

      {/* Індикатор статусу підключення */}
      {!supabaseConnected && (
        <div className="max-w-5xl mx-auto px-6 mt-4">
          <div className="bg-amber-500/10 border border-amber-500/30 rounded-xl p-3 text-center text-sm">
            ⚠️ Режим офлайн: дані зберігаються локально
          </div>
        </div>
      )}

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
            {supabaseConnected && (
              <p className="text-sm text-teal-600 mt-4">
                ✅ Підключено до хмарної бази даних
              </p>
            )}
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
