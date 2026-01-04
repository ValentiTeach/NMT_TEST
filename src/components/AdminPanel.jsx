// components/AdminPanel.jsx - Адмін-панель
import React, { useState, useEffect } from 'react';
import { Users, Settings, Eye, EyeOff, TrendingUp, Award, CheckCircle, UserCog, Shield } from 'lucide-react';
import progressService from '../services/ProgressService';
import userPermissionsService from '../services/UserPermissionsService';
import { users } from '../data/users';

export default function AdminPanel({ 
  theme, 
  testCategories, 
  enabledCategories, 
  onToggleCategory,
  allTests 
}) {
  const [activeAdminTab, setActiveAdminTab] = useState('categories');
  const [usersStats, setUsersStats] = useState([]);
  const [userPermissions, setUserPermissions] = useState({});
  const [isLoading, setIsLoading] = useState(false);
  const [resetConfirmDialog, setResetConfirmDialog] = useState({ show: false, userEmail: null, userName: null });

  // Завантаження статистики користувачів
  useEffect(() => {
    if (activeAdminTab === 'users') {
      loadUsersStatistics();
    } else if (activeAdminTab === 'permissions') {
      loadUserPermissions();
    }
  }, [activeAdminTab]);

  const loadUserPermissions = async () => {
    setIsLoading(true);
    try {
      const allPermissions = await userPermissionsService.getAllUsersPermissions();
      
      // Створюємо об'єкт з дозволами
      const permissionsMap = {};
      allPermissions.forEach(perm => {
        permissionsMap[perm.user_email] = perm.allowed_categories || [];
      });
      
      // Додаємо стандартні дозволи для користувачів без записів
      users.filter(u => u.role === 'student').forEach(user => {
        if (!permissionsMap[user.email]) {
          permissionsMap[user.email] = user.allowedCategories || ['nmt', 'grade9'];
        }
      });
      
      console.log('✅ Дозволи завантажено:', permissionsMap);
      setUserPermissions(permissionsMap);
    } catch (error) {
      console.error('❌ Помилка завантаження дозволів:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const toggleUserPermission = async (userEmail, categoryId) => {
    const currentPermissions = userPermissions[userEmail] || [];
    let newPermissions;
    
    if (currentPermissions.includes(categoryId)) {
      // Видаляємо доступ
      newPermissions = currentPermissions.filter(id => id !== categoryId);
    } else {
      // Додаємо доступ
      newPermissions = [...currentPermissions, categoryId];
    }
    
    // Оновлюємо локально
    setUserPermissions(prev => ({
      ...prev,
      [userEmail]: newPermissions
    }));
    
    // Зберігаємо в базу
    const success = await userPermissionsService.savePermissions(userEmail, newPermissions);
    if (success) {
      console.log('✅ Дозволи оновлено для', userEmail);
    } else {
      console.error('❌ Не вдалося оновити дозволи');
      // Відкат змін
      await loadUserPermissions();
    }
  };

  const handleResetProgressClick = (userEmail, userName) => {
    // Знаходимо користувача за email щоб отримати правильне ім'я
    const user = users.find(u => u.email === userEmail);
    const displayName = user ? user.name : userName;
    
    setResetConfirmDialog({
      show: true,
      userEmail,
      userName: displayName
    });
  };

  const handleResetProgressConfirm = async () => {
    const { userEmail } = resetConfirmDialog;
    
    // Створюємо початковий (пустий) прогрес
    const initialProgress = {
      test1: { completed: 0, total: allTests[0].questions.length, correctAnswers: {} },
      test2: { completed: 0, total: allTests[1].questions.length, correctAnswers: {} },
      test3: { completed: 0, total: allTests[2].questions.length, correctAnswers: {} },
      test4: { completed: 0, total: allTests[3].questions.length, correctAnswers: {} }
    };
    
    console.log('🔄 Анулювання прогресу для:', userEmail);
    
    const success = await progressService.resetProgress(userEmail, initialProgress);
    
    if (success) {
      console.log('✅ Прогрес успішно анульовано');
      // Оновлюємо статистику
      await loadUsersStatistics();
      alert(`✅ Прогрес користувача ${resetConfirmDialog.userName} успішно анульовано!`);
    } else {
      console.error('❌ Не вдалося анулювати прогрес');
      alert('❌ Помилка! Не вдалося анулювати прогрес.');
    }
    
    // Закриваємо діалог
    setResetConfirmDialog({ show: false, userEmail: null, userName: null });
  };

  const handleResetProgressCancel = () => {
    setResetConfirmDialog({ show: false, userEmail: null, userName: null });
  };

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
          Глобальні категорії
        </button>
        
        <button
          onClick={() => setActiveAdminTab('permissions')}
          className={`px-6 py-3 rounded-xl font-bold transition flex items-center gap-2 ${
            activeAdminTab === 'permissions'
              ? 'bg-amber-600 text-white shadow-lg'
              : `${theme.card} border opacity-60 hover:opacity-100`
          }`}
        >
          <UserCog size={20} />
          Керування доступом
        </button>
        
        <button
          onClick={() => setActiveAdminTab('users')}
          className={`px-6 py-3 rounded-xl font-bold transition flex items-center gap-2 ${
            activeAdminTab === 'users'
              ? 'bg-blue-600 text-white shadow-lg'
              : `${theme.card} border opacity-60 hover:opacity-100`
          }`}
        >
          <Users size={20} />
          Статистика
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

      {/* Керування персональними дозволами */}
      {activeAdminTab === 'permissions' && (
        <div>
          <div className="flex items-center justify-between mb-6">
            <div>
              <h2 className="text-2xl font-black">Персональні дозволи</h2>
              <p className={`${theme.subtext} text-sm mt-1`}>
                Надайте або заберіть доступ до категорій для окремих учнів
              </p>
            </div>
            <button
              onClick={loadUserPermissions}
              disabled={isLoading}
              className="px-4 py-2 bg-amber-600 text-white rounded-xl font-bold hover:bg-amber-700 transition disabled:opacity-50"
            >
              {isLoading ? 'Завантаження...' : '🔄 Оновити'}
            </button>
          </div>

          {isLoading ? (
            <div className="text-center py-12">
              <div className="text-6xl mb-4 animate-pulse">🔐</div>
              <p className={theme.subtext}>Завантаження налаштувань...</p>
            </div>
          ) : (
            <div className="space-y-4">
              {users.filter(u => u.role === 'student').map(user => {
                const permissions = userPermissions[user.email] || user.allowedCategories || [];
                
                return (
                  <div
                    key={user.email}
                    className={`${theme.card} p-6 rounded-2xl border transition-all`}
                  >
                    <div className="flex items-center justify-between mb-4">
                      <div className="flex items-center gap-4">
                        <div className="text-4xl">{user.avatar}</div>
                        <div>
                          <div className="font-bold text-xl">{user.name}</div>
                          <div className={`${theme.subtext} text-sm`}>{user.email}</div>
                        </div>
                      </div>
                      
                      <div className="flex items-center gap-2">
                        <Shield className="text-amber-600" size={20} />
                        <span className={theme.subtext}>
                          {permissions.length} {permissions.length === 1 ? 'категорія' : 'категорії'}
                        </span>
                      </div>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                      {testCategories.map(category => {
                        const hasAccess = permissions.includes(category.id);
                        
                        return (
                          <button
                            key={category.id}
                            onClick={() => toggleUserPermission(user.email, category.id)}
                            className={`p-4 rounded-xl border-2 transition-all text-left ${
                              hasAccess
                                ? 'border-teal-500 bg-teal-500/10 hover:bg-teal-500/20'
                                : 'border-gray-500/20 bg-gray-500/5 hover:bg-gray-500/10 opacity-50'
                            }`}
                          >
                            <div className="flex items-center justify-between">
                              <div className="flex items-center gap-3">
                                <div className="text-3xl">{category.icon}</div>
                                <div>
                                  <div className="font-bold">{category.title}</div>
                                  <div className={`${theme.subtext} text-xs`}>
                                    {category.tests.length} {category.tests.length === 1 ? 'тест' : 'тести'}
                                  </div>
                                </div>
                              </div>
                              
                              {hasAccess ? (
                                <Eye className="text-teal-600" size={24} />
                              ) : (
                                <EyeOff className="text-gray-400" size={24} />
                              )}
                            </div>
                          </button>
                        );
                      })}
                    </div>

                    {permissions.length === 0 && (
                      <div className="mt-4 p-3 bg-red-500/10 border border-red-500/30 rounded-xl text-center">
                        <span className="text-red-600 font-bold">⚠️ Немає доступу до жодної категорії</span>
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          )}
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
                      
                      <div className="flex items-center gap-4">
                        <div className="text-right">
                          <div className="text-3xl font-black text-teal-600">
                            {user.percentage}%
                          </div>
                          <div className={`${theme.subtext} text-sm`}>
                            {user.totalCompleted} / {user.totalQuestions}
                          </div>
                        </div>
                        
                        {/* Кнопка анулювання прогресу */}
                        <button
                          onClick={() => {
                            const userName = users.find(u => u.email === user.email)?.name || user.email;
                            handleResetProgressClick(user.email, userName);
                          }}
                          className="px-4 py-2 bg-red-500/10 hover:bg-red-500/20 text-red-600 rounded-xl font-bold transition flex items-center gap-2 border border-red-500/30"
                          title="Анулювати прогрес"
                        >
                          <span className="text-xl">🔄</span>
                          Скинути
                        </button>
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

      {/* Діалог підтвердження анулювання прогресу */}
      {resetConfirmDialog.show && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className={`${theme.card} rounded-3xl p-8 max-w-md w-full border-2 border-red-500/30 shadow-2xl`}>
            <div className="text-center">
              <div className="text-6xl mb-4">⚠️</div>
              <h3 className="text-2xl font-black mb-4 text-red-600">
                УВАГА! Незворотна дія!
              </h3>
              <p className="text-lg mb-2">
                Ви впевнені що хочете <strong>анулювати весь прогрес</strong> користувача:
              </p>
              <p className="text-xl font-bold mb-6 text-teal-600">
                {resetConfirmDialog.userName}
              </p>
              <div className={`${theme.subtext} text-sm mb-6 p-4 bg-red-500/10 rounded-xl border border-red-500/30`}>
                <p className="mb-2">🔄 Весь прогрес буде скинуто до 0%</p>
                <p className="mb-2">📝 Всі відповіді будуть видалені</p>
                <p className="font-bold text-red-600">⚠️ Цю дію НЕМОЖЛИВО відмінити!</p>
              </div>
              
              <div className="flex gap-4">
                <button
                  onClick={handleResetProgressCancel}
                  className="flex-1 px-6 py-3 bg-gray-500 text-white rounded-xl font-bold hover:bg-gray-600 transition"
                >
                  ❌ Скасувати
                </button>
                <button
                  onClick={handleResetProgressConfirm}
                  className="flex-1 px-6 py-3 bg-red-600 text-white rounded-xl font-bold hover:bg-red-700 transition"
                >
                  ✅ Так, анулювати
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
