// components/AdminPanel.jsx - Адмін-панель з аналізом помилок
import React, { useState, useEffect } from 'react';
import { Users, Settings, Eye, EyeOff, TrendingUp, Award, CheckCircle, UserCog, Shield, XCircle, ChevronDown, ChevronUp, BarChart3 } from 'lucide-react';
import progressService from '../services/ProgressService';
import userPermissionsService from '../services/UserPermissionsService';
import { users } from '../data/users';
import { letters } from '../data/constants';

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
  
  // Стан для перегляду помилок
  const [selectedUserForErrors, setSelectedUserForErrors] = useState(null);
  const [expandedTests, setExpandedTests] = useState({});
  const [expandedQuestions, setExpandedQuestions] = useState({});

  // Завантаження статистики користувачів
  useEffect(() => {
    if (activeAdminTab === 'users' || activeAdminTab === 'errors') {
      loadUsersStatistics();
    } else if (activeAdminTab === 'permissions') {
      loadUserPermissions();
    }
  }, [activeAdminTab]);

  const loadUserPermissions = async () => {
    setIsLoading(true);
    try {
      const allPermissions = await userPermissionsService.getAllUsersPermissions();
      
      const permissionsMap = {};
      allPermissions.forEach(perm => {
        permissionsMap[perm.user_email] = perm.allowed_categories || [];
      });
      
      users.filter(u => u.role === 'student').forEach(user => {
        if (!permissionsMap[user.email]) {
          permissionsMap[user.email] = user.allowedCategories || ['nmt', 'grade9'];
        }
      });
      
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
      newPermissions = currentPermissions.filter(id => id !== categoryId);
    } else {
      newPermissions = [...currentPermissions, categoryId];
    }
    
    setUserPermissions(prev => ({
      ...prev,
      [userEmail]: newPermissions
    }));
    
    const success = await userPermissionsService.savePermissions(userEmail, newPermissions);
    if (!success) {
      await loadUserPermissions();
    }
  };

  const handleResetProgressClick = (userEmail, userName) => {
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
    
    const initialProgress = {};
    allTests.forEach(test => {
      initialProgress[test.id] = { 
        completed: 0, 
        total: test.questions.length, 
        correctAnswers: {},
        answersHistory: [],
        attempts: []
      };
    });
    
    const success = await progressService.resetProgress(userEmail, initialProgress);
    
    if (success) {
      await loadUsersStatistics();
      alert(`✅ Прогрес користувача ${resetConfirmDialog.userName} успішно анульовано!`);
    } else {
      alert('❌ Помилка! Не вдалося анулювати прогрес.');
    }
    
    setResetConfirmDialog({ show: false, userEmail: null, userName: null });
  };

  const handleResetProgressCancel = () => {
    setResetConfirmDialog({ show: false, userEmail: null, userName: null });
  };

  const loadUsersStatistics = async () => {
    setIsLoading(true);
    try {
      const allProgress = await progressService.getAllUsersProgress();
      
      const progressMap = new Map();
      allProgress.forEach(userProgress => {
        progressMap.set(userProgress.user_email, userProgress.progress_data || {});
      });
      
      const studentUsers = users.filter(u => u.role === 'student');
      
      const stats = studentUsers.map(user => {
        const progressData = progressMap.get(user.email) || {};
        
        let totalCompleted = 0;
        let totalQuestions = 0;
        let totalWrong = 0;
        
        // Детальна статистика по тестах
        const testsDetails = allTests.map(test => {
          const testProgress = progressData[test.id] || { 
            completed: 0, 
            total: test.questions.length,
            correctAnswers: {},
            answersHistory: [],
            attempts: []
          };
          
          totalCompleted += testProgress.completed || 0;
          totalQuestions += testProgress.total || test.questions.length;
          
          // Аналіз помилок
          const wrongAnswers = [];
          const answersHistory = testProgress.answersHistory || [];
          const lastAttempt = testProgress.lastAttempt;
          
          if (lastAttempt && lastAttempt.results) {
            lastAttempt.results.forEach(result => {
              if (result.wasAnswered && !result.isCorrect) {
                wrongAnswers.push({
                  questionIndex: result.questionIndex,
                  userAnswer: result.userAnswer,
                  question: test.questions[result.questionIndex]
                });
              }
            });
          } else {
            // Fallback: аналізуємо answersHistory
            answersHistory.forEach(answer => {
              if (!answer.isCorrect) {
                wrongAnswers.push({
                  questionIndex: answer.questionIndex,
                  userAnswer: answer.userAnswer,
                  question: test.questions[answer.questionIndex]
                });
              }
            });
          }
          
          totalWrong += wrongAnswers.length;
          
          return {
            testId: test.id,
            testTitle: test.title,
            testIcon: test.icon,
            completed: testProgress.completed || 0,
            total: testProgress.total || test.questions.length,
            percentage: Math.round(((testProgress.completed || 0) / (testProgress.total || test.questions.length)) * 100),
            wrongAnswers,
            attempts: testProgress.attempts || [],
            lastAttempt
          };
        });
        
        const percentage = totalQuestions > 0 
          ? Math.round((totalCompleted / totalQuestions) * 100) 
          : 0;
        
        const dbRecord = allProgress.find(p => p.user_email === user.email);
        const lastUpdate = dbRecord 
          ? new Date(dbRecord.updated_at).toLocaleString('uk-UA')
          : 'Ще не розпочато';
        
        return {
          email: user.email,
          name: user.name,
          avatar: user.avatar,
          progressData: progressData,
          testsDetails,
          totalCompleted,
          totalQuestions,
          totalWrong,
          percentage,
          lastUpdate
        };
      });
      
      stats.sort((a, b) => b.percentage - a.percentage);
      
      setUsersStats(stats);
    } catch (error) {
      console.error('❌ Помилка завантаження статистики:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const toggleTestExpand = (testId) => {
    setExpandedTests(prev => ({
      ...prev,
      [testId]: !prev[testId]
    }));
  };

  const toggleQuestionExpand = (key) => {
    setExpandedQuestions(prev => ({
      ...prev,
      [key]: !prev[key]
    }));
  };

  // Функція для відображення відповіді
  const renderAnswer = (question, userAnswer, isCorrect) => {
    if (!userAnswer) return <span className="text-gray-400 italic">Не відповідено</span>;
    
    if (question.type === 'single') {
      const answerIndex = userAnswer[0];
      return (
        <div className={`p-2 rounded-lg ${isCorrect ? 'bg-teal-500/20' : 'bg-red-500/20'}`}>
          <span className="font-bold">{letters[answerIndex]}</span>: {question.options[answerIndex]}
        </div>
      );
    }
    
    if (question.type === 'matching' || question.type === 'sequence') {
      const correctAnswers = question.correctMatching || question.correctSequence;
      return (
        <div className="space-y-1">
          {Object.entries(userAnswer).map(([row, col]) => {
            const isRowCorrect = correctAnswers[row] === col;
            return (
              <div key={row} className={`text-sm p-1 rounded ${isRowCorrect ? 'bg-teal-500/20' : 'bg-red-500/20'}`}>
                {parseInt(row) + 1} → {letters[col]} {isRowCorrect ? '✓' : '✗'}
              </div>
            );
          })}
        </div>
      );
    }
    
    return null;
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
      <div className="flex gap-4 mb-8 overflow-x-auto pb-2">
        <button
          onClick={() => setActiveAdminTab('categories')}
          className={`px-6 py-3 rounded-xl font-bold transition flex items-center gap-2 whitespace-nowrap ${
            activeAdminTab === 'categories'
              ? 'bg-teal-600 text-white shadow-lg'
              : `${theme.card} border opacity-60 hover:opacity-100`
          }`}
        >
          <Settings size={20} />
          Категорії
        </button>
        
        <button
          onClick={() => setActiveAdminTab('permissions')}
          className={`px-6 py-3 rounded-xl font-bold transition flex items-center gap-2 whitespace-nowrap ${
            activeAdminTab === 'permissions'
              ? 'bg-amber-600 text-white shadow-lg'
              : `${theme.card} border opacity-60 hover:opacity-100`
          }`}
        >
          <UserCog size={20} />
          Доступ
        </button>
        
        <button
          onClick={() => setActiveAdminTab('users')}
          className={`px-6 py-3 rounded-xl font-bold transition flex items-center gap-2 whitespace-nowrap ${
            activeAdminTab === 'users'
              ? 'bg-blue-600 text-white shadow-lg'
              : `${theme.card} border opacity-60 hover:opacity-100`
          }`}
        >
          <Users size={20} />
          Статистика
        </button>
        
        <button
          onClick={() => setActiveAdminTab('errors')}
          className={`px-6 py-3 rounded-xl font-bold transition flex items-center gap-2 whitespace-nowrap ${
            activeAdminTab === 'errors'
              ? 'bg-red-600 text-white shadow-lg'
              : `${theme.card} border opacity-60 hover:opacity-100`
          }`}
        >
          <BarChart3 size={20} />
          Аналіз помилок
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
                          {index === 0 ? '🥇' : index === 1 ? '🥈' : index === 2 ? '🥉' : user.avatar || '👤'}
                        </div>
                        <div>
                          <div className="font-bold text-lg">{user.name}</div>
                          <div className={`${theme.subtext} text-sm`}>{user.email}</div>
                          <div className={`${theme.subtext} text-xs`}>
                            Оновлено: {user.lastUpdate}
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
                        
                        <button
                          onClick={() => handleResetProgressClick(user.email, user.name)}
                          className="px-4 py-2 bg-red-500/10 hover:bg-red-500/20 text-red-600 rounded-xl font-bold transition flex items-center gap-2 border border-red-500/30"
                          title="Анулювати прогрес"
                        >
                          🔄 Скинути
                        </button>
                      </div>
                    </div>

                    <div className="bg-zinc-500/10 rounded-full h-3 overflow-hidden mb-4">
                      <div
                        className="bg-gradient-to-r from-teal-500 to-teal-600 h-full transition-all duration-500 rounded-full"
                        style={{ width: `${user.percentage}%` }}
                      />
                    </div>

                    <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-3">
                      {user.testsDetails.map(testDetail => (
                        <div
                          key={testDetail.testId}
                          className="bg-zinc-500/5 rounded-lg p-3 text-center"
                        >
                          <div className="text-2xl mb-1">{testDetail.testIcon}</div>
                          <div className="font-bold text-sm mb-1">
                            {testDetail.percentage}%
                          </div>
                          <div className={`${theme.subtext} text-xs`}>
                            {testDetail.completed}/{testDetail.total}
                          </div>
                          {testDetail.percentage === 100 && (
                            <CheckCircle className="mx-auto mt-1 text-teal-600" size={16} />
                          )}
                        </div>
                      ))}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      )}

      {/* АНАЛІЗ ПОМИЛОК */}
      {activeAdminTab === 'errors' && (
        <div>
          <div className="flex items-center justify-between mb-6">
            <div>
              <h2 className="text-2xl font-black">Аналіз помилок учнів</h2>
              <p className={`${theme.subtext} text-sm mt-1`}>
                Перегляньте неправильні відповіді та визначте проблемні теми
              </p>
            </div>
            <button
              onClick={loadUsersStatistics}
              disabled={isLoading}
              className="px-4 py-2 bg-red-600 text-white rounded-xl font-bold hover:bg-red-700 transition disabled:opacity-50"
            >
              {isLoading ? 'Завантаження...' : '🔄 Оновити'}
            </button>
          </div>

          {isLoading ? (
            <div className="text-center py-12">
              <div className="text-6xl mb-4 animate-pulse">🔍</div>
              <p className={theme.subtext}>Аналіз даних...</p>
            </div>
          ) : (
            <div className="space-y-6">
              {/* Загальна статистика помилок */}
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
                <div className={`${theme.card} p-4 rounded-2xl border text-center`}>
                  <div className="text-4xl font-black text-red-500">
                    {usersStats.reduce((sum, u) => sum + u.totalWrong, 0)}
                  </div>
                  <div className={`${theme.subtext} text-sm`}>Всього помилок</div>
                </div>
                
                <div className={`${theme.card} p-4 rounded-2xl border text-center`}>
                  <div className="text-4xl font-black text-amber-500">
                    {usersStats.filter(u => u.totalWrong > 0).length}
                  </div>
                  <div className={`${theme.subtext} text-sm`}>Учнів з помилками</div>
                </div>
                
                <div className={`${theme.card} p-4 rounded-2xl border text-center`}>
                  <div className="text-4xl font-black text-blue-500">
                    {usersStats.length > 0 
                      ? Math.round(usersStats.reduce((sum, u) => sum + u.totalWrong, 0) / usersStats.length)
                      : 0}
                  </div>
                  <div className={`${theme.subtext} text-sm`}>Середньо на учня</div>
                </div>
                
                <div className={`${theme.card} p-4 rounded-2xl border text-center`}>
                  <div className="text-4xl font-black text-teal-500">
                    {usersStats.filter(u => u.totalWrong === 0 && u.totalCompleted > 0).length}
                  </div>
                  <div className={`${theme.subtext} text-sm`}>Без помилок</div>
                </div>
              </div>

              {/* Список учнів з помилками */}
              {usersStats.filter(u => u.totalWrong > 0).length === 0 ? (
                <div className={`${theme.card} p-12 rounded-2xl border text-center`}>
                  <div className="text-6xl mb-4">🎉</div>
                  <h3 className="text-2xl font-black mb-2">Помилок не знайдено!</h3>
                  <p className={theme.subtext}>Всі учні відповідають правильно</p>
                </div>
              ) : (
                usersStats
                  .filter(u => u.totalWrong > 0)
                  .sort((a, b) => b.totalWrong - a.totalWrong)
                  .map(user => (
                    <div
                      key={user.email}
                      className={`${theme.card} rounded-2xl border overflow-hidden`}
                    >
                      {/* Заголовок учня */}
                      <button
                        onClick={() => setSelectedUserForErrors(
                          selectedUserForErrors === user.email ? null : user.email
                        )}
                        className="w-full p-6 text-left flex items-center justify-between hover:bg-zinc-500/5 transition"
                      >
                        <div className="flex items-center gap-4">
                          <div className="text-4xl">{user.avatar || '👤'}</div>
                          <div>
                            <div className="font-bold text-xl">{user.name}</div>
                            <div className={`${theme.subtext} text-sm`}>{user.email}</div>
                          </div>
                        </div>
                        
                        <div className="flex items-center gap-6">
                          <div className="text-right">
                            <div className="text-2xl font-black text-red-500">
                              {user.totalWrong} помилок
                            </div>
                            <div className={`${theme.subtext} text-sm`}>
                              у {user.testsDetails.filter(t => t.wrongAnswers.length > 0).length} тестах
                            </div>
                          </div>
                          
                          {selectedUserForErrors === user.email ? (
                            <ChevronUp size={24} />
                          ) : (
                            <ChevronDown size={24} />
                          )}
                        </div>
                      </button>

                      {/* Розгорнута інформація */}
                      {selectedUserForErrors === user.email && (
                        <div className="px-6 pb-6 border-t border-zinc-500/10">
                          <div className="mt-4 space-y-4">
                            {user.testsDetails
                              .filter(testDetail => testDetail.wrongAnswers.length > 0)
                              .map(testDetail => (
                                <div key={testDetail.testId} className="bg-zinc-500/5 rounded-xl overflow-hidden">
                                  {/* Заголовок тесту */}
                                  <button
                                    onClick={() => toggleTestExpand(`${user.email}-${testDetail.testId}`)}
                                    className="w-full p-4 text-left flex items-center justify-between hover:bg-zinc-500/5 transition"
                                  >
                                    <div className="flex items-center gap-3">
                                      <span className="text-3xl">{testDetail.testIcon}</span>
                                      <div>
                                        <div className="font-bold">{testDetail.testTitle}</div>
                                        <div className={`${theme.subtext} text-sm`}>
                                          {testDetail.wrongAnswers.length} неправильних відповідей
                                        </div>
                                      </div>
                                    </div>
                                    
                                    {expandedTests[`${user.email}-${testDetail.testId}`] ? (
                                      <ChevronUp size={20} />
                                    ) : (
                                      <ChevronDown size={20} />
                                    )}
                                  </button>

                                  {/* Список помилок */}
                                  {expandedTests[`${user.email}-${testDetail.testId}`] && (
                                    <div className="px-4 pb-4 space-y-3">
                                      {testDetail.wrongAnswers.map((wrong, idx) => {
                                        const questionKey = `${user.email}-${testDetail.testId}-${wrong.questionIndex}`;
                                        const isExpanded = expandedQuestions[questionKey];
                                        
                                        return (
                                          <div
                                            key={idx}
                                            className="bg-red-500/5 border border-red-500/20 rounded-xl overflow-hidden"
                                          >
                                            <button
                                              onClick={() => toggleQuestionExpand(questionKey)}
                                              className="w-full p-4 text-left flex items-start gap-3"
                                            >
                                              <XCircle className="text-red-500 mt-1 shrink-0" size={20} />
                                              <div className="flex-1">
                                                <div className="font-bold text-sm text-red-600">
                                                  Питання {wrong.questionIndex + 1}
                                                </div>
                                                <p className={`${theme.subtext} text-sm line-clamp-2`}>
                                                  {wrong.question?.question}
                                                </p>
                                              </div>
                                              {isExpanded ? <ChevronUp size={18} /> : <ChevronDown size={18} />}
                                            </button>

                                            {isExpanded && wrong.question && (
                                              <div className="px-4 pb-4 border-t border-red-500/10">
                                                <div className="mt-4 space-y-4">
                                                  {/* Повний текст питання */}
                                                  <div>
                                                    <h5 className="font-bold text-sm mb-2">Питання:</h5>
                                                    <p>{wrong.question.question}</p>
                                                  </div>

                                                  {/* Зображення */}
                                                  {wrong.question.images && (
                                                    <img 
                                                      src={wrong.question.images[0]} 
                                                      alt="" 
                                                      className="max-h-32 rounded-lg"
                                                    />
                                                  )}

                                                  {/* Відповідь учня */}
                                                  <div>
                                                    <h5 className="font-bold text-sm mb-2 text-red-600">
                                                      Відповідь учня:
                                                    </h5>
                                                    {renderAnswer(wrong.question, wrong.userAnswer, false)}
                                                  </div>

                                                  {/* Правильна відповідь */}
                                                  <div>
                                                    <h5 className="font-bold text-sm mb-2 text-teal-600">
                                                      Правильна відповідь:
                                                    </h5>
                                                    {wrong.question.type === 'single' && (
                                                      <div className="p-2 rounded-lg bg-teal-500/20">
                                                        <span className="font-bold">{letters[wrong.question.correct]}</span>: {wrong.question.options[wrong.question.correct]}
                                                      </div>
                                                    )}
                                                    {(wrong.question.type === 'matching' || wrong.question.type === 'sequence') && (
                                                      <div className="space-y-1">
                                                        {Object.entries(wrong.question.correctMatching || wrong.question.correctSequence || {}).map(([row, col]) => (
                                                          <div key={row} className="text-sm p-1 rounded bg-teal-500/20">
                                                            {parseInt(row) + 1} → {letters[col]}
                                                          </div>
                                                        ))}
                                                      </div>
                                                    )}
                                                  </div>

                                                  {/* Пояснення */}
                                                  {wrong.question.explanation && (
                                                    <div className="p-3 bg-blue-500/10 rounded-lg border border-blue-500/20">
                                                      <h5 className="font-bold text-sm mb-1 text-blue-600">💡 Пояснення:</h5>
                                                      <p className="text-sm">{wrong.question.explanation}</p>
                                                    </div>
                                                  )}
                                                </div>
                                              </div>
                                            )}
                                          </div>
                                        );
                                      })}
                                    </div>
                                  )}
                                </div>
                              ))}
                          </div>
                        </div>
                      )}
                    </div>
                  ))
              )}
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
