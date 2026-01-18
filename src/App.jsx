// App.jsx - Головний компонент з календарем та збереженням теми
import React, { useState, useEffect } from 'react';
import LoginForm from './components/LoginForm';
import Header from './components/Header';
import CategorySelector from './components/CategorySelector';
import TestSelector from './components/TestSelector';
import TestView from './components/TestView';
import Profile from './components/Profile';
import AdminPanel from './components/AdminPanel';
import Calendar from './components/Calendar';
import { getTheme } from './config/theme';
import { users } from './data/users';
import { test1 } from './data/test1';
import { test2 } from './data/test2';
import { test3 } from './data/test3';
import { test4 } from './data/test4';
import { test5 } from './data/test5';
import { test6 } from './data/test6';
import progressService from './services/ProgressService';
import userPermissionsService from './services/UserPermissionsService';
import calendarService from './services/CalendarService';
import { testConnection } from './config/supabase';

const allTests = [test1, test2, test3, test4, test5, test6];

// Категорії тестів
const testCategories = [
  {
    id: 'nmt',
    title: 'Підготовка до НМТ',
    description: 'Повторення всіх тем для НМТ з Історії України',
    icon: '🎓',
    tests: [test1, test2, test3, test5, test6]
  },
  {
    id: 'grade9',
    title: '9 клас',
    description: 'Матеріали для учнів 9 класу',
    icon: '📚',
    tests: [test4]
  }
];

export default function App() {
  // ===== ТЕМА (з збереженням) =====
  const [isDarkMode, setIsDarkMode] = useState(() => {
    // Завантажуємо збережену тему
    const saved = localStorage.getItem('nmt-theme');
    return saved ? saved === 'dark' : false;
  });

  // Зберігаємо тему при зміні
  useEffect(() => {
    localStorage.setItem('nmt-theme', isDarkMode ? 'dark' : 'light');
    console.log('🎨 Тема збережена:', isDarkMode ? 'dark' : 'light');
  }, [isDarkMode]);

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
  const [enabledCategories, setEnabledCategories] = useState(['nmt', 'grade9']);
  const [userAllowedCategories, setUserAllowedCategories] = useState([]);
  const [progress, setProgress] = useState({
    test1: { completed: 0, total: test1.questions.length, correctAnswers: {} },
    test2: { completed: 0, total: test2.questions.length, correctAnswers: {} },
    test3: { completed: 0, total: test3.questions.length, correctAnswers: {} },
    test4: { completed: 0, total: test4.questions.length, correctAnswers: {} },
    test5: { completed: 0, total: test5.questions.length, correctAnswers: {} },
    test6: { completed: 0, total: test6.questions.length, correctAnswers: {} }
  });
  const [isLoadingProgress, setIsLoadingProgress] = useState(false);
  const [isCheckingSession, setIsCheckingSession] = useState(true);
  const [supabaseConnected, setSupabaseConnected] = useState(false);

  // ===== КАЛЕНДАР =====
  const [lessons, setLessons] = useState([]);
  const [isLoadingLessons, setIsLoadingLessons] = useState(false);

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

  // Завантаження уроків
  const loadLessons = async () => {
    if (!supabaseConnected) {
      console.log('⚠️ Supabase недоступний, завантажуємо з localStorage');
      try {
        const localLessons = JSON.parse(localStorage.getItem('calendar-lessons') || '[]');
        setLessons(localLessons);
        console.log('✅ Завантажено уроків з localStorage:', localLessons.length);
        return;
      } catch (error) {
        console.error('❌ Помилка завантаження з localStorage:', error);
        setLessons([]);
        return;
      }
    }
    
    setIsLoadingLessons(true);
    try {
      const data = await calendarService.loadLessons();
      
      // Конвертуємо формат з БД у формат компонента
      const formattedLessons = data.map(lesson => ({
        id: lesson.id,
        title: lesson.title,
        studentEmail: lesson.student_email,
        date: lesson.date,
        time: lesson.time,
        notes: lesson.notes || '',
        createdBy: lesson.created_by,
        createdAt: lesson.created_at
      }));
      
      setLessons(formattedLessons);
      console.log('✅ Завантажено уроків з Supabase:', formattedLessons.length);
      
      // Синхронізуємо з localStorage як backup
      try {
        localStorage.setItem('calendar-lessons', JSON.stringify(formattedLessons));
      } catch (error) {
        console.warn('⚠️ Не вдалося синхронізувати з localStorage:', error);
      }
    } catch (error) {
      console.error('❌ Помилка завантаження уроків:', error);
      // Спробуємо завантажити з localStorage як fallback
      try {
        const localLessons = JSON.parse(localStorage.getItem('calendar-lessons') || '[]');
        setLessons(localLessons);
        console.log('ℹ️ Завантажено з localStorage fallback:', localLessons.length);
      } catch (fallbackError) {
        console.error('❌ Fallback також не вдався:', fallbackError);
        setLessons([]);
      }
    } finally {
      setIsLoadingLessons(false);
    }
  };

  // Завантаження прогресу користувача з Supabase
  const loadUserProgress = async (userEmail) => {
    setIsLoadingProgress(true);
    console.log('📥 Завантаження прогресу для:', userEmail);
    
    try {
      if (supabaseConnected) {
        const savedProgress = await progressService.loadProgress(userEmail);
        
        if (savedProgress) {
          console.log('📦 Отримано прогрес з Supabase:', savedProgress);
          
          const mergedProgress = {
            test1: savedProgress.test1 || { completed: 0, total: test1.questions.length, correctAnswers: {} },
            test2: savedProgress.test2 || { completed: 0, total: test2.questions.length, correctAnswers: {} },
            test3: savedProgress.test3 || { completed: 0, total: test3.questions.length, correctAnswers: {} },
            test4: savedProgress.test4 || { completed: 0, total: test4.questions.length, correctAnswers: {} },
            test5: savedProgress.test5 || { completed: 0, total: test5.questions.length, correctAnswers: {} },
            test6: savedProgress.test6 || { completed: 0, total: test6.questions.length, correctAnswers: {} }
          };
          
          console.log('✅ Прогрес завантажено з Supabase для', userEmail);
          setProgress(mergedProgress);
        } else {
          console.log('ℹ️ Прогрес не знайдено в Supabase для', userEmail);
          const initialProgress = {
            test1: { completed: 0, total: test1.questions.length, correctAnswers: {} },
            test2: { completed: 0, total: test2.questions.length, correctAnswers: {} },
            test3: { completed: 0, total: test3.questions.length, correctAnswers: {} },
            test4: { completed: 0, total: test4.questions.length, correctAnswers: {} },
            test5: { completed: 0, total: test5.questions.length, correctAnswers: {} },
            test6: { completed: 0, total: test6.questions.length, correctAnswers: {} }
          };
          setProgress(initialProgress);
        }
      } else {
        // Fallback на localStorage
        const localProgress = localStorage.getItem(`progress:${userEmail}`);
        if (localProgress) {
          const savedProgress = JSON.parse(localProgress);
          const mergedProgress = {
            test1: savedProgress.test1 || { completed: 0, total: test1.questions.length, correctAnswers: {} },
            test2: savedProgress.test2 || { completed: 0, total: test2.questions.length, correctAnswers: {} },
            test3: savedProgress.test3 || { completed: 0, total: test3.questions.length, correctAnswers: {} },
            test4: savedProgress.test4 || { completed: 0, total: test4.questions.length, correctAnswers: {} },
            test5: savedProgress.test5 || { completed: 0, total: test5.questions.length, correctAnswers: {} },
            test6: savedProgress.test6 || { completed: 0, total: test6.questions.length, correctAnswers: {} }
          };
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
        const success = await progressService.saveProgress(userEmail, progressData);
        if (success) {
          console.log('✅ Прогрес збережено в Supabase для:', userEmail);
        } else {
          console.error('❌ Помилка збереження в Supabase, використовуємо localStorage');
          localStorage.setItem(`progress:${userEmail}`, JSON.stringify(progressData));
        }
      } else {
        localStorage.setItem(`progress:${userEmail}`, JSON.stringify(progressData));
        console.log('✅ Прогрес збережено в localStorage для:', userEmail);
      }
    } catch (error) {
      console.error('❌ Помилка збереження прогресу:', error);
      try {
        localStorage.setItem(`progress:${userEmail}`, JSON.stringify(progressData));
        console.log('✅ Аварійне збереження в localStorage');
      } catch (localError) {
        console.error('❌ Навіть localStorage не працює:', localError);
      }
    }
  };

  // Завантаження персональних дозволів користувача
  const loadUserPermissions = async (userEmail) => {
    try {
      console.log('🔐 Завантаження дозволів для:', userEmail);
      
      if (supabaseConnected) {
        const permissions = await userPermissionsService.loadPermissions(userEmail);
        
        if (permissions && permissions.length > 0) {
          console.log('✅ Персональні дозволи завантажено:', permissions);
          setUserAllowedCategories(permissions);
        } else {
          const user = users.find(u => u.email === userEmail);
          const defaultPermissions = user?.allowedCategories || ['nmt', 'grade9'];
          console.log('ℹ️ Використовуємо стандартні дозволи:', defaultPermissions);
          setUserAllowedCategories(defaultPermissions);
        }
      } else {
        const user = users.find(u => u.email === userEmail);
        const defaultPermissions = user?.allowedCategories || ['nmt', 'grade9'];
        console.log('⚠️ Offline: використовуємо стандартні дозволи:', defaultPermissions);
        setUserAllowedCategories(defaultPermissions);
      }
    } catch (error) {
      console.error('❌ Помилка завантаження дозволів:', error);
      const user = users.find(u => u.email === userEmail);
      setUserAllowedCategories(user?.allowedCategories || ['nmt', 'grade9']);
    }
  };

  // Перевірка сесії при завантаженні
  useEffect(() => {
    const checkSession = async () => {
      console.log('🔍 Перевірка сесії при завантаженні...');
      
      try {
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
            await loadUserPermissions(user.email);
            await loadLessons();
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
      
      setProgress({
        test1: { completed: 0, total: test1.questions.length, correctAnswers: {} },
        test2: { completed: 0, total: test2.questions.length, correctAnswers: {} },
        test3: { completed: 0, total: test3.questions.length, correctAnswers: {} },
        test4: { completed: 0, total: test4.questions.length, correctAnswers: {} },
        test5: { completed: 0, total: test5.questions.length, correctAnswers: {} },
        test6: { completed: 0, total: test6.questions.length, correctAnswers: {} }
      });
      setAnswers({});
      setCheckedQuestions({});
      setSelectedCategory(null);
      setSelectedTest(null);
      setCurrentQuestion(0);
      
      setCurrentUser(user);
      setIsLoggedIn(true);
      
      try {
        localStorage.setItem('current-session', JSON.stringify({ email: user.email }));
        console.log('✅ Сесія збережена для:', user.email);
      } catch (error) {
        console.error('❌ Помилка збереження сесії:', error);
      }
      
      await loadUserProgress(user.email);
      await loadUserPermissions(user.email);
      await loadLessons();
    } else {
      console.log('❌ Невірний логін або пароль');
      alert('Невірний логін або пароль!\n\nЗверніться до адміністратора для отримання доступу.');
    }
  };

  const handleLogout = async () => {
    console.log('🚪 Вихід з акаунту:', currentUser?.email);
    
    if (currentUser) {
      await saveUserProgress(currentUser.email, progress);
    }
    
    setIsLoggedIn(false);
    setCurrentUser(null);
    setEmail('');
    setPassword('');
    setSelectedCategory(null);
    setSelectedTest(null);
    setCurrentQuestion(0);
    setAnswers({});
    setCheckedQuestions({});
    setLessons([]);
    
    setProgress({
      test1: { completed: 0, total: test1.questions.length, correctAnswers: {} },
      test2: { completed: 0, total: test2.questions.length, correctAnswers: {} },
      test3: { completed: 0, total: test3.questions.length, correctAnswers: {} },
      test4: { completed: 0, total: test4.questions.length, correctAnswers: {} },
      test5: { completed: 0, total: test5.questions.length, correctAnswers: {} },
      test6: { completed: 0, total: test6.questions.length, correctAnswers: {} }
    });
    
    try {
      localStorage.removeItem('current-session');
      console.log('✅ Сесія видалена');
    } catch (error) {
      console.error('❌ Помилка видалення сесії:', error);
    }
  };

  const handleSelectCategory = (category) => {
    setSelectedCategory(category);
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

  const handleBackToCategories = () => {
    setSelectedCategory(null);
    setSelectedTest(null);
    setCurrentQuestion(0);
    setAnswers({});
    setCheckedQuestions({});
  };

  const handleToggleCategory = (categoryId) => {
    setEnabledCategories(prev => {
      if (prev.includes(categoryId)) {
        return prev.filter(id => id !== categoryId);
      } else {
        return [...prev, categoryId];
      }
    });
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
    
    if (currentUser) {
      await saveUserProgress(currentUser.email, newProgress);
    }
  };

  // ===== КАЛЕНДАР HANDLERS =====
  const handleAddLesson = async (lesson) => {
    console.log('➕ Додавання уроку:', lesson);
    
    // Додаємо локально (оптимістичне оновлення)
    setLessons(prev => [...prev, lesson]);
    
    // Зберігаємо в БД
    if (supabaseConnected) {
      const success = await calendarService.addLesson(lesson);
      if (!success) {
        console.error('❌ Не вдалося зберегти урок в БД');
        // Відкат змін
        setLessons(prev => prev.filter(l => l.id !== lesson.id));
        alert('❌ Помилка збереження уроку. Спробуйте ще раз.');
      } else {
        console.log('✅ Урок успішно збережено в БД');
      }
    } else {
      // Fallback на localStorage
      try {
        const localLessons = JSON.parse(localStorage.getItem('calendar-lessons') || '[]');
        localLessons.push(lesson);
        localStorage.setItem('calendar-lessons', JSON.stringify(localLessons));
        console.log('✅ Урок збережено в localStorage');
      } catch (error) {
        console.error('❌ Помилка збереження в localStorage:', error);
        setLessons(prev => prev.filter(l => l.id !== lesson.id));
        alert('❌ Помилка збереження уроку.');
      }
    }
  };

  const handleDeleteLesson = async (lessonId) => {
    console.log('🗑️ Видалення уроку:', lessonId);
    
    // Підтвердження видалення
    if (!window.confirm('Ви впевнені що хочете видалити цей урок?')) {
      return;
    }
    
    // Зберігаємо копію на випадок відкату
    const lessonsCopy = [...lessons];
    
    // Видаляємо локально (оптимістичне оновлення)
    setLessons(prev => prev.filter(l => l.id !== lessonId));
    console.log('👍 Урок видалено локально');
    
    // Видаляємо з БД
    if (supabaseConnected) {
      const success = await calendarService.deleteLesson(lessonId);
      if (!success) {
        console.error('❌ Не вдалося видалити урок з БД');
        // Відкат змін
        setLessons(lessonsCopy);
        alert('❌ Помилка видалення уроку з бази даних. Спробуйте ще раз.');
      } else {
        console.log('✅ Урок успішно видалено з БД');
        // Оновлюємо список з БД для синхронізації
        await loadLessons();
      }
    } else {
      // Fallback на localStorage
      try {
        const localLessons = JSON.parse(localStorage.getItem('calendar-lessons') || '[]');
        const filtered = localLessons.filter(l => l.id !== lessonId);
        localStorage.setItem('calendar-lessons', JSON.stringify(filtered));
        console.log('✅ Урок видалено з localStorage');
      } catch (error) {
        console.error('❌ Помилка видалення з localStorage:', error);
        setLessons(lessonsCopy);
        alert('❌ Помилка видалення уроку.');
      }
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
        currentUser={currentUser}
      />

      {!supabaseConnected && (
        <div className="max-w-5xl mx-auto px-6 mt-4">
          <div className="bg-amber-500/10 border border-amber-500/30 rounded-xl p-3 text-center text-sm">
            ⚠️ Режим офлайн: дані зберігаються локально
          </div>
        </div>
      )}

      <main className="max-w-5xl mx-auto px-6 mt-12">
        {/* АДМІН-ПАНЕЛЬ */}
        {activeTab === 'admin' && currentUser?.role === 'admin' && (
          <AdminPanel
            theme={theme}
            testCategories={testCategories}
            enabledCategories={enabledCategories}
            onToggleCategory={handleToggleCategory}
            allTests={allTests}
          />
        )}

        {/* КАЛЕНДАР */}
        {activeTab === 'calendar' && (
          <Calendar
            theme={theme}
            currentUser={currentUser}
            lessons={lessons}
            onAddLesson={handleAddLesson}
            onDeleteLesson={handleDeleteLesson}
          />
        )}

        {/* Вибір категорії */}
        {activeTab === 'tests' && !selectedCategory && !selectedTest && (
          <CategorySelector
            categories={testCategories.filter(cat => {
              if (currentUser?.role === 'admin') return true;
              return enabledCategories.includes(cat.id) && userAllowedCategories.includes(cat.id);
            })}
            onSelectCategory={handleSelectCategory}
            theme={theme}
          />
        )}

        {/* Вибір тесту в категорії */}
        {activeTab === 'tests' && selectedCategory && !selectedTest && (
          <TestSelector
            tests={selectedCategory.tests}
            onSelectTest={handleSelectTest}
            onBack={handleBackToCategories}
            progress={progress}
            theme={theme}
          />
        )}

        {/* Проходження тесту */}
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
            userAllowedCategories={userAllowedCategories}
            testCategories={testCategories}
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
