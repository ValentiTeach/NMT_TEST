// components/AdminPanel.jsx - Адмін-панель
import React, { useState, useEffect } from 'react';
import { Users, Settings, Eye, EyeOff, TrendingUp, Award, CheckCircle } from 'lucide-react';
import progressService from '../services/ProgressService';

export default function AdminPanel({ 
  theme, 
  testCategories, 
  enabledCategories, 
  onToggleCategory,
  allTests 
}) {
  const [activeAdminTab, setActiveAdminTab] = useState('categories');
  const [usersStats, setUsersStats] = useState([]);
  const [isLoading, setIsLoading] = useState(false);

  // Завантаження статистики користувачів
  useEffect(() => {
    if (activeAdminTab === 'users') {
      loadUsersStatistics();
    }
  }, [activeAdminTab]);

  const loadUsersStatistics = async () => {
    setIsLoading(true);
    try {
      const allProgress = await progressService.getAllUsersProgress();
      
      // Обчислюємо статистику для кожного користувача
      const stats = allProgress.map(userProgress => {
        const progressData = userProgress.progress_data || {};
        
        // Підрахунок загального прогресу
        let totalCompleted = 0;
        let totalQuestions = 0;
        
        allTests.forEach(test => {
          const testProgress = progressData[test.id] || { completed: 0, total: test.questions.length };
          totalCompleted += testProgress.completed || 0;
          totalQuestions += testProgress.total || test.questions.length;
        });
        
        const percentage = totalQuestions > 0 
          ? Math.round((totalCompleted / totalQuestions) * 100) 
          : 0;
        
        return {
          email: userProgress.user_email,
          progressData: progressData,
          totalCompleted,
          totalQuestions,
          percentage,
          lastUpdate: new Date(userProgress.updated_at).toLocaleString('uk-UA')
        };
      });
      
      // Сортуємо за прогресом (найкращі зверху)
      stats.sort((a, b) => b.percentage - a.percentage);
      
      setUsersStats(stats);
    } catch (error) {
      console.error('❌ Помилка завантаження статистики:', error);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="max-w-6xl mx-auto">
      {/* Заголовок адмін-панелі */}
      <div className={`${theme.card} p-8 rounded-3xl border mb-8`}>
        <div className="flex items-center gap-4 mb-4">
          <div className="text-6xl">👑</div>
          <div>
            <h1 className="text-4xl font-black">Панель адміністратора</h1>
            <p className={`${theme.subtext} text-lg`}>Управління платформою НМТ Експрес</p>
          </div>
        </div>
      </div>

      {/* Вкладки адмін-панелі */}
      <div className="flex gap-4 mb-8">
        <button
          onClick={() => setActiveAdminTab('categories')}
          className={`px-6 py-3 rounded-xl font-bold transition flex items-center gap-2 ${
            activeAdminTab === 'categories'
              ? 'bg-teal-600 text-white shadow-lg'
              : `${theme.card} border opacity-60 hover:opacity-100`
          }`}
        >
          <Settings size={20} />
          Управління категоріями
        </button>
        
        <button
          onClick={() => setActiveAdminTab('users')}
          className={`px-6 py-3 rounded-xl font-bold transition flex items-center gap-2 ${
            activeAdminTab === 'users'
              ? 'bg-teal-600 text-white shadow-lg'
              : `${theme.card} border opacity-60 hover:opacity-100`
          }`}
        >
          <Users size={20} />
          Статистика користувачів
        </button>
      </div>

      {/* Управління категоріями */}
      {activeAdminTab === 'categories' && (
        <div className="space-y-4">
          <h2 className="text-2xl font-black mb-4">Видимість категорій</h2>
          <p className={`${theme.subtext} mb-6`}>
            Увімкніть або вимкніть доступ до категорій для учнів
          </p>
          
          {testCategories.map(category => {
            const isEnabled = enabledCategories.includes(category.id);
            
            return (
              <div
                key={category.id}
                className={`${theme.card} p-6 rounded-2xl border-2 transition-all ${
                  isEnabled ? 'border-teal-500/30 bg-teal-500/5' : 'opacity-50'
                }`}
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-4">
                    <div className="text-5xl">{category.icon}</div>
                    <div>
                      <h3 className="text-2xl font-black">{category.title}</h3>
                      <p className={theme.subtext}>{category.description}</p>
                      <div className="flex items-center gap-3 mt-2 text-sm">
                        <span className={theme.subtext}>
                          {category.tests.length} {category.tests.length === 1 ? 'тест' : 'тести'}
                        </span>
                        <span>•</span>
                        <span className={theme.subtext}>
                          {category.tests.reduce((sum, test) => sum + test.questions.length, 0)} питань
                        </span>
                      </div>
                    </div>
                  </div>
                  
                  <button
                    onClick={() => onToggleCategory(category.id)}
                    className={`px-6 py-3 rounded-xl font-bold transition-all flex items-center gap-2 ${
                      isEnabled
                        ? 'bg-teal-600 text-white hover:bg-teal-700'
                        : 'bg-gray-500 text-white hover:bg-gray-600'
                    }`}
                  >
                    {isEnabled ? (
                      <>
                        <Eye size={20} />
                        Відкрито
                      </>
                    ) : (
                      <>
                        <EyeOff size={20} />
                        Закрито
                      </>
                    )}
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Статистика користувачів */}
      {activeAdminTab === 'users' && (
        <div>
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-2xl font-black">Статистика користувачів</h2>
            <button
              onClick={loadUsersStatistics}
              disabled={isLoading}
              className="px-4 py-2 bg-teal-600 text-white rounded-xl font-bold hover:bg-teal-700 transition disabled:opacity-50"
            >
              {isLoading ? 'Завантаження...' : '🔄 Оновити'}
            </button>
          </div>

          {isLoading ? (
            <div className="text-center py-12">
              <div className="text-6xl mb-4 animate-pulse">📊</div>
              <p className={theme.subtext}>Завантаження статистики...</p>
            </div>
          ) : usersStats.length === 0 ? (
            <div className={`${theme.card} p-12 rounded-2xl border text-center`}>
              <div className="text-6xl mb-4">📭</div>
              <p className={theme.subtext}>Поки що немає даних про користувачів</p>
            </div>
          ) : (
            <div className="space-y-4">
              {/* Загальна статистика */}
              <div className="grid grid-cols-3 gap-4 mb-6">
                <div className={`${theme.card} p-6 rounded-2xl border text-center`}>
                  <Users className="mx-auto mb-2 text-teal-600" size={32} />
                  <div className="text-3xl font-black">{usersStats.length}</div>
                  <div className={`${theme.subtext} text-sm`}>Користувачів</div>
                </div>
                
                <div className={`${theme.card} p-6 rounded-2xl border text-center`}>
                  <TrendingUp className="mx-auto mb-2 text-blue-500" size={32} />
                  <div className="text-3xl font-black">
                    {Math.round(usersStats.reduce((sum, u) => sum + u.percentage, 0) / usersStats.length) || 0}%
                  </div>
                  <div className={`${theme.subtext} text-sm`}>Середній прогрес</div>
                </div>
                
                <div className={`${theme.card} p-6 rounded-2xl border text-center`}>
                  <Award className="mx-auto mb-2 text-yellow-500" size={32} />
                  <div className="text-3xl font-black">
                    {usersStats.filter(u => u.percentage === 100).length}
                  </div>
                  <div className={`${theme.subtext} text-sm`}>Завершили все</div>
                </div>
              </div>

              {/* Список користувачів */}
              <div className="space-y-3">
                {usersStats.map((user, index) => (
                  <div
                    key={user.email}
                    className={`${theme.card} p-6 rounded-2xl border transition-all hover:shadow-lg`}
                  >
                    <div className="flex items-center justify-between mb-4">
                      <div className="flex items-center gap-4">
                        <div className="text-3xl">
                          {index === 0 ? '🥇' : index === 1 ? '🥈' : index === 2 ? '🥉' : '👤'}
                        </div>
                        <div>
                          <div className="font-bold text-lg">{user.email}</div>
                          <div className={`${theme.subtext} text-sm`}>
                            Останнє оновлення: {user.lastUpdate}
                          </div>
                        </div>
                      </div>
                      
                      <div className="text-right">
                        <div className="text-3xl font-black text-teal-600">
                          {user.percentage}%
                        </div>
                        <div className={`${theme.subtext} text-sm`}>
                          {user.totalCompleted} / {user.totalQuestions}
                        </div>
                      </div>
                    </div>

                    {/* Прогрес-бар */}
                    <div className="bg-zinc-500/10 rounded-full h-3 overflow-hidden mb-4">
                      <div
                        className="bg-gradient-to-r from-teal-500 to-teal-600 h-full transition-all duration-500 rounded-full"
                        style={{ width: `${user.percentage}%` }}
                      />
                    </div>

                    {/* Детальний прогрес по тестах */}
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                      {allTests.map(test => {
                        const testProgress = user.progressData[test.id] || { 
                          completed: 0, 
                          total: test.questions.length 
                        };
                        const testPercentage = Math.round(
                          (testProgress.completed / testProgress.total) * 100
                        );
                        
                        return (
                          <div
                            key={test.id}
                            className="bg-zinc-500/5 rounded-lg p-3 text-center"
                          >
                            <div className="text-2xl mb-1">{test.icon}</div>
                            <div className="font-bold text-sm mb-1">
                              {testPercentage}%
                            </div>
                            <div className={`${theme.subtext} text-xs`}>
                              {testProgress.completed}/{testProgress.total}
                            </div>
                            {testPercentage === 100 && (
                              <CheckCircle className="mx-auto mt-1 text-teal-600" size={16} />
                            )}
                          </div>
                        );
                      })}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
