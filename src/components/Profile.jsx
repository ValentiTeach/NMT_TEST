// components/Profile.jsx
import React from 'react';
import { Award, TrendingUp, Target } from 'lucide-react';

export default function Profile({ user, tests, progress, theme, userAllowedCategories, testCategories }) {
  // Фільтруємо тести: показуємо тільки ті, до яких є доступ
  const getAccessibleTests = () => {
    if (!userAllowedCategories || userAllowedCategories.length === 0) {
      // Якщо немає дозволів, не показуємо жодних тестів
      return [];
    }

    // Знаходимо всі тести з дозволених категорій
    const accessibleTests = [];
    
    testCategories.forEach(category => {
      // Перевіряємо чи є доступ до цієї категорії
      if (userAllowedCategories.includes(category.id)) {
        // Додаємо всі тести з цієї категорії
        category.tests.forEach(test => {
          if (!accessibleTests.find(t => t.id === test.id)) {
            accessibleTests.push(test);
          }
        });
      }
    });

    return accessibleTests;
  };

  const accessibleTests = getAccessibleTests();

  // Підрахунок загального прогресу тільки по доступних тестах
  const totalQuestions = accessibleTests.reduce((sum, test) => {
    return sum + (progress[test.id]?.total || test.questions.length);
  }, 0);

  const completedQuestions = accessibleTests.reduce((sum, test) => {
    return sum + (progress[test.id]?.completed || 0);
  }, 0);

  const overallPercentage = totalQuestions > 0 
    ? Math.round((completedQuestions / totalQuestions) * 100) 
    : 0;

  // Підрахунок правильних відповідей
  const correctAnswers = accessibleTests.reduce((sum, test) => {
    const testProgress = progress[test.id];
    if (testProgress && testProgress.correctAnswers) {
      return sum + Object.values(testProgress.correctAnswers).filter(Boolean).length;
    }
    return sum;
  }, 0);

  const accuracy = completedQuestions > 0 
    ? Math.round((correctAnswers / completedQuestions) * 100) 
    : 0;

  return (
    <div className="max-w-4xl mx-auto">
      {/* Заголовок профілю */}
      <div className={`${theme.card} p-8 rounded-3xl border mb-8`}>
        <div className="flex items-center gap-6">
          <div className="text-8xl">{user.avatar}</div>
          <div className="flex-1">
            <h1 className="text-4xl font-black mb-2">{user.name}</h1>
            <p className={`${theme.subtext} text-lg mb-4`}>{user.email}</p>
            
            {/* Бейджі доступу */}
            <div className="flex flex-wrap gap-2">
              {userAllowedCategories && userAllowedCategories.length > 0 ? (
                userAllowedCategories.map(categoryId => {
                  const category = testCategories.find(c => c.id === categoryId);
                  return category ? (
                    <div
                      key={categoryId}
                      className="px-3 py-1 bg-teal-500/10 border border-teal-500/30 rounded-lg text-sm font-bold text-teal-600"
                    >
                      {category.icon} {category.title}
                    </div>
                  ) : null;
                })
              ) : (
                <div className="px-3 py-1 bg-red-500/10 border border-red-500/30 rounded-lg text-sm font-bold text-red-600">
                  ⚠️ Немає доступу до категорій
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      {accessibleTests.length === 0 ? (
        // Якщо немає доступних тестів
        <div className={`${theme.card} p-12 rounded-3xl border text-center`}>
          <div className="text-8xl mb-4">🔒</div>
          <h2 className="text-2xl font-black mb-4">Немає доступних тестів</h2>
          <p className={`${theme.subtext} text-lg`}>
            Зверніться до адміністратора для отримання доступу до категорій
          </p>
        </div>
      ) : (
        <>
          {/* Загальна статистика */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
            <div className={`${theme.card} p-6 rounded-2xl border text-center`}>
              <TrendingUp className="mx-auto mb-3 text-teal-600" size={40} />
              <div className="text-4xl font-black mb-2">{overallPercentage}%</div>
              <div className={`${theme.subtext} text-sm`}>Загальний прогрес</div>
            </div>

            <div className={`${theme.card} p-6 rounded-2xl border text-center`}>
              <Target className="mx-auto mb-3 text-blue-500" size={40} />
              <div className="text-4xl font-black mb-2">{completedQuestions}</div>
              <div className={`${theme.subtext} text-sm`}>Пройдено питань</div>
            </div>

            <div className={`${theme.card} p-6 rounded-2xl border text-center`}>
              <Award className="mx-auto mb-3 text-yellow-500" size={40} />
              <div className="text-4xl font-black mb-2">{accuracy}%</div>
              <div className={`${theme.subtext} text-sm`}>Точність</div>
            </div>
          </div>

          {/* Загальний прогрес-бар */}
          <div className={`${theme.card} p-6 rounded-2xl border mb-8`}>
            <div className="flex justify-between items-center mb-3">
              <h3 className="text-xl font-black">Загальний прогрес</h3>
              <span className="text-2xl font-black text-teal-600">{overallPercentage}%</span>
            </div>
            <div className="bg-zinc-500/10 rounded-full h-4 overflow-hidden">
              <div
                className="bg-gradient-to-r from-teal-500 to-teal-600 h-full transition-all duration-500 rounded-full"
                style={{ width: `${overallPercentage}%` }}
              />
            </div>
            <div className={`${theme.subtext} text-sm mt-2 text-center`}>
              {completedQuestions} з {totalQuestions} питань
            </div>
          </div>

          {/* Прогрес по кожному доступному тесту */}
          <h2 className="text-2xl font-black mb-6">Прогрес по тестах</h2>
          <div className="space-y-4">
            {accessibleTests.map(test => {
              const testProgress = progress[test.id] || { 
                completed: 0, 
                total: test.questions.length,
                correctAnswers: {} 
              };
              const percentage = Math.round((testProgress.completed / testProgress.total) * 100);
              const correct = testProgress.correctAnswers 
                ? Object.values(testProgress.correctAnswers).filter(Boolean).length 
                : 0;
              const testAccuracy = testProgress.completed > 0 
                ? Math.round((correct / testProgress.completed) * 100) 
                : 0;

              return (
                <div
                  key={test.id}
                  className={`${theme.card} p-6 rounded-2xl border transition-all hover:shadow-lg`}
                >
                  <div className="flex items-center gap-4 mb-4">
                    <div className="text-5xl">{test.icon}</div>
                    <div className="flex-1">
                      <h3 className="text-2xl font-black mb-1">{test.name}</h3>
                      <p className={`${theme.subtext} text-sm`}>{test.description}</p>
                    </div>
                    <div className="text-right">
                      <div className="text-3xl font-black text-teal-600">{percentage}%</div>
                      <div className={`${theme.subtext} text-sm`}>
                        {testProgress.completed}/{testProgress.total}
                      </div>
                    </div>
                  </div>

                  {/* Прогрес-бар тесту */}
                  <div className="bg-zinc-500/10 rounded-full h-3 overflow-hidden mb-3">
                    <div
                      className="bg-gradient-to-r from-teal-500 to-teal-600 h-full transition-all duration-500 rounded-full"
                      style={{ width: `${percentage}%` }}
                    />
                  </div>

                  {/* Статистика тесту */}
                  <div className="grid grid-cols-3 gap-4 text-center">
                    <div>
                      <div className="text-xl font-bold">{testProgress.completed}</div>
                      <div className={`${theme.subtext} text-xs`}>Пройдено</div>
                    </div>
                    <div>
                      <div className="text-xl font-bold text-teal-600">{correct}</div>
                      <div className={`${theme.subtext} text-xs`}>Правильно</div>
                    </div>
                    <div>
                      <div className="text-xl font-bold text-blue-500">{testAccuracy}%</div>
                      <div className={`${theme.subtext} text-xs`}>Точність</div>
                    </div>
                  </div>

                  {/* Бейдж завершення */}
                  {percentage === 100 && (
                    <div className="mt-4 p-3 bg-teal-500/10 border border-teal-500/30 rounded-xl text-center">
                      <span className="text-teal-600 font-bold">✅ Тест завершено!</span>
                    </div>
                  )}
                </div>
              );
            })}
          </div>

          {/* Мотиваційне повідомлення */}
          {overallPercentage === 100 ? (
            <div className={`${theme.card} p-8 rounded-3xl border mt-8 text-center bg-gradient-to-r from-teal-500/10 to-blue-500/10`}>
              <div className="text-6xl mb-4">🎉</div>
              <h3 className="text-3xl font-black mb-2">Вітаємо!</h3>
              <p className={`${theme.subtext} text-lg`}>
                Ви завершили всі доступні тести! Чудова робота!
              </p>
            </div>
          ) : overallPercentage >= 50 ? (
            <div className={`${theme.card} p-8 rounded-3xl border mt-8 text-center`}>
              <div className="text-6xl mb-4">💪</div>
              <h3 className="text-2xl font-black mb-2">Чудовий прогрес!</h3>
              <p className={`${theme.subtext} text-lg`}>
                Продовжуйте в тому ж дусі! Ви вже на половині шляху!
              </p>
            </div>
          ) : (
            <div className={`${theme.card} p-8 rounded-3xl border mt-8 text-center`}>
              <div className="text-6xl mb-4">🚀</div>
              <h3 className="text-2xl font-black mb-2">Розпочнімо!</h3>
              <p className={`${theme.subtext} text-lg`}>
                Вперед до знань! Кожне питання наближає вас до успіху!
              </p>
            </div>
          )}
        </>
      )}
    </div>
  );
}
