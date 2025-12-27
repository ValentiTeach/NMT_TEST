// App.jsx - Головний компонент (FIXED VERSION)
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
import storage from './utils/storageAdapter'; // ← НОВИЙ ІМПОРТ

const allTests = [test1, test2, test3, test4];

export default function App() {
  const [isDarkMode, setIsDarkMode] = useState(false);
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [currentUser, setCurrentUser] = useState(null);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [activeTab, setActiveTab] = useState('tests');
  const [selectedCategory, setSelectedCategory] = useState(null);
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

  const theme = getTheme(isDarkMode);

  // Завантаження теми при старті
  useEffect(() => {
    const loadTheme = async () => {
      try {
        const result = await storage.get('theme-mode');
        if (result && result.value) {
          const savedTheme = JSON.parse(result.value);
          setIsDarkMode(savedTheme.isDarkMode || false);
          console.log('✅ Тему завантажено:', savedTheme.isDarkMode ? 'темна' : 'світла');
        }
      } catch (error) {
        console.error('❌ Помилка завантаження теми:', error);
      }
    };
    loadTheme();
  }, []);

  // Збереження теми при зміні
  useEffect(() => {
    const saveTheme = async () => {
      try {
        await storage.set('theme-mode', JSON.stringify({ isDarkMode }));
        console.log('✅ Тему збережено:', isDarkMode ? 'темна' : 'світла');
      } catch (error) {
        console.error('❌ Помилка збереження теми:', error);
      }
    };
    saveTheme();
  }, [isDarkMode]);

  // Завантаження прогресу користувача
  const loadUserProgress = async (userEmail) => {
    setIsLoadingProgress(true);
    console.log('📥 Завантаження прогресу для:', userEmail);
    try {
      if (!storage.isAvailable()) {
        console.error('❌ Storage API недоступний');
        return;
      }
      const result = await storage.get(`progress:${userEmail}`, true);
      if (result && result.value) {
        const savedProgress = JSON.parse(result.value);
        console.log('✅ Прогрес завантажено:', savedProgress);
        
        // ВАЖЛИВО: Мерджимо збережений прогрес з початковим (для нових тестів)
        const mergedProgress = {
          test1: savedProgress.test1 || { completed: 0, total: test1.questions.length, correctAnswers: {} },
          test2: savedProgress.test2 || { completed: 0, total: test2.questions.length, correctAnswers: {} },
          test3: savedProgress.test3 || { completed: 0, total: test3.questions.length, correctAnswers: {} },
          test4: savedProgress.test4 || { completed: 0, total: test4.questions.length, correctAnswers: {} }
        };
        
        console.log('✅ Прогрес після мерджу:', mergedProgress);
        setProgress(mergedProgress);
      } else {
        console.log('ℹ️ Прогрес не знайдено, використовуємо початковий');
      }
    } catch (error) {
      console.error('❌ Помилка завантаження прогресу:', error);
    } finally {
      setIsLoadingProgress(false);
    }
  };

  // Збереження прогресу користувача
  const saveUserProgress = async (userEmail, progressData) => {
    try {
      if (!storage.isAvailable()) {
        console.error('❌ Storage API недоступний');
        return;
      }
      await storage.set(`progress:${userEmail}`, JSON.stringify(progressData), true);
      console.log('✅ Прогрес збережено для:', userEmail);
    } catch (error) {
      console.error('❌ Помилка збереження прогресу:', error);
    }
  };

  // Перевірка сесії при завантаженні
  useEffect(() => {
    const checkSession = async () => {
      console.log('🔍 Перевірка сесії при завантаженні...');
      try {
        if (!storage.isAvailable()) {
          console.error('❌ Storage API недоступний!');
          setIsCheckingSession(false);
          return;
        }
        console.log('✅ Storage API доступний:', storage.getType());
        
        const sessionResult = await storage.get('current-session', true);
        console.log('📦 Результат get сесії:', sessionResult);
        
        if (sessionResult && sessionResult.value) {
          console.log('✅ Сесія знайдена!');
          const session = JSON.parse(sessionResult.value);
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
  }, []);

  // Автоматичне збереження прогресу кожні 30 секунд
  useEffect(() => {
    if (isLoggedIn && currentUser) {
      const interval = setInterval(() => {
        saveUserProgress(currentUser.email, progress);
      }, 30000);
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
      
      // Зберігаємо сесію
      if (storage.isAvailable()) {
        try {
          await storage.set('current-session', JSON.stringify({ email: user.email }), true);
          console.log('✅ Сесія збережена для:', user.email);
          
          // Перевірка збереження
          const check = await storage.get('current-session', true);
          console.log('✅ Перевірка: сесія успішно збережена:', check);
        } catch (error) {
          console.error('❌ Помилка збереження сесії:', error);
        }
      } else {
        console.error('❌ Storage недоступний при логіні!');
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
    if (storage.isAvailable()) {
      try {
        await storage.delete('current-session', true);
        console.log('✅ Сесія видалена');
      } catch (error) {
        console.error('❌ Помилка видалення сесії:', error);
      }
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
    setSelectedCategory(null);
    setCurrentQuestion(0);
    setAnswers({});
    setCheckedQuestions({});
  };

  const handleBackToCategories = () => {
    setSelectedTest(null);
    setSelectedCategory(null);
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

      <main className="max-w-5xl mx-auto px-6 mt-12">
        {activeTab === 'tests' && !selectedCategory && !selectedTest && (
          <div className="max-w-4xl mx-auto">
            <h1 className="text-5xl font-black mb-4 text-center">Оберіть категорію</h1>
            <p className={`text-center ${theme.subtext} mb-16 text-xl`}>
              Виберіть рівень підготовки
            </p>

            <div className="grid gap-6">
              {/* НМТ Категорія */}
              <button
                onClick={() => setSelectedCategory('nmt')}
                className={`${theme.card} p-10 rounded-3xl border-2 text-left transition-all hover:scale-[1.02] hover:shadow-2xl group relative overflow-hidden`}
              >
                <div className="absolute top-0 right-0 w-32 h-32 bg-gradient-to-br from-teal-500/10 to-transparent rounded-full -mr-16 -mt-16"></div>
                <div className="relative flex items-start gap-6">
                  <div className="text-7xl">🎓</div>
                  <div className="flex-1">
                    <h3 className="text-4xl font-black mb-3 group-hover:text-teal-600 transition-colors">
                      ПІДГОТОВКА ДО НМТ
                    </h3>
                    <p className={`${theme.subtext} text-lg mb-4`}>
                      Повний курс підготовки до НМТ з Історії України
                    </p>
                    <div className="flex items-center gap-3">
                      <span className="px-4 py-2 bg-teal-500/10 rounded-xl text-teal-600 font-bold text-sm">
                        4 тести
                      </span>
                      <span className="px-4 py-2 bg-purple-500/10 rounded-xl text-purple-600 font-bold text-sm">
                        Рівень: Випускник
                      </span>
                    </div>
                  </div>
                  <div className="text-teal-600 opacity-0 group-hover:opacity-100 transition-opacity text-4xl">
                    →
                  </div>
                </div>
              </button>

              {/* 6 Клас Категорія */}
              <button
                onClick={() => setSelectedCategory('grade6')}
                className={`${theme.card} p-10 rounded-3xl border-2 text-left transition-all hover:scale-[1.02] hover:shadow-2xl group relative overflow-hidden`}
              >
                <div className="absolute top-0 right-0 w-32 h-32 bg-gradient-to-br from-blue-500/10 to-transparent rounded-full -mr-16 -mt-16"></div>
                <div className="relative flex items-start gap-6">
                  <div className="text-7xl">📚</div>
                  <div className="flex-1">
                    <h3 className="text-4xl font-black mb-3 group-hover:text-blue-600 transition-colors">
                      6 КЛАС
                    </h3>
                    <p className={`${theme.subtext} text-lg mb-4`}>
                      Історія України для учнів 6 класу
                    </p>
                    <div className="flex items-center gap-3">
                      <span className="px-4 py-2 bg-blue-500/10 rounded-xl text-blue-600 font-bold text-sm">
                        Скоро
                      </span>
                      <span className="px-4 py-2 bg-green-500/10 rounded-xl text-green-600 font-bold text-sm">
                        Рівень: Початковий
                      </span>
                    </div>
                  </div>
                  <div className="text-blue-600 opacity-0 group-hover:opacity-100 transition-opacity text-4xl">
                    →
                  </div>
                </div>
              </button>

              {/* 9 Клас Категорія */}
              <button
                onClick={() => setSelectedCategory('grade9')}
                className={`${theme.card} p-10 rounded-3xl border-2 text-left transition-all hover:scale-[1.02] hover:shadow-2xl group relative overflow-hidden`}
              >
                <div className="absolute top-0 right-0 w-32 h-32 bg-gradient-to-br from-orange-500/10 to-transparent rounded-full -mr-16 -mt-16"></div>
                <div className="relative flex items-start gap-6">
                  <div className="text-7xl">📖</div>
                  <div className="flex-1">
                    <h3 className="text-4xl font-black mb-3 group-hover:text-orange-600 transition-colors">
                      9 КЛАС
                    </h3>
                    <p className={`${theme.subtext} text-lg mb-4`}>
                      Історія України для учнів 9 класу
                    </p>
                    <div className="flex items-center gap-3">
                      <span className="px-4 py-2 bg-orange-500/10 rounded-xl text-orange-600 font-bold text-sm">
                        Скоро
                      </span>
                      <span className="px-4 py-2 bg-yellow-500/10 rounded-xl text-yellow-600 font-bold text-sm">
                        Рівень: Середній
                      </span>
                    </div>
                  </div>
                  <div className="text-orange-600 opacity-0 group-hover:opacity-100 transition-opacity text-4xl">
                    →
                  </div>
                </div>
              </button>
            </div>
          </div>
        )}

        {activeTab === 'tests' && selectedCategory === 'nmt' && !selectedTest && (
          <TestSelector
            tests={allTests}
            onSelectTest={handleSelectTest}
            onBack={handleBackToCategories}
            progress={progress}
            theme={theme}
          />
        )}

        {activeTab === 'tests' && selectedCategory === 'grade6' && !selectedTest && (
          <div className="max-w-3xl mx-auto text-center animate-fadeIn">
            <div className="text-8xl mb-6">🚧</div>
            <h2 className="text-4xl font-black mb-4">Розділ в розробці</h2>
            <p className={`${theme.subtext} text-xl mb-8`}>
              Тести для 6 класу скоро будуть додані
            </p>
            <button
              onClick={handleBackToCategories}
              className="px-8 py-4 bg-teal-600 text-white rounded-2xl font-bold text-lg hover:bg-teal-700 transition"
            >
              Повернутися до категорій
            </button>
          </div>
        )}

        {activeTab === 'tests' && selectedCategory === 'grade9' && !selectedTest && (
          <div className="max-w-3xl mx-auto text-center animate-fadeIn">
            <div className="text-8xl mb-6">🚧</div>
            <h2 className="text-4xl font-black mb-4">Розділ в розробці</h2>
            <p className={`${theme.subtext} text-xl mb-8`}>
              Тести для 9 класу скоро будуть додані
            </p>
            <button
              onClick={handleBackToCategories}
              className="px-8 py-4 bg-teal-600 text-white rounded-2xl font-bold text-lg hover:bg-teal-700 transition"
            >
              Повернутися до категорій
            </button>
          </div>
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
