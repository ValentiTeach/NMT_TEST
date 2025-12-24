// components/Profile.jsx
import React from 'react';
import { Award, TrendingUp, Target, Zap } from 'lucide-react';

export default function Profile({ user, tests, progress, theme }) {
  // Загальна статистика
  const totalQuestions = tests.reduce((sum, test) => sum + test.questions.length, 0);
  const completedQuestions = Object.values(progress).reduce((sum, p) => sum + p.completed, 0);
  const overallPercentage = Math.round((completedQuestions / totalQuestions) * 100);

  return (
    <div className="max-w-4xl mx-auto animate-fadeIn">
      {/* Заголовок профілю */}
      <div className={`${theme.card} p-10 rounded-[3rem] border mb-8 text-center`}>
        <div className="text-7xl mb-4">{user.avatar}</div>
        <h1 className="text-4xl font-black mb-2">{user.name}</h1>
        <p className={`${theme.subtext} text-lg`}>{user.email}</p>
      </div>

      {/* Загальна статистика */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
        <div className={`${theme.card} p-6 rounded-2xl border text-center`}>
          <Target className="mx-auto mb-2 text-teal-600" size={32} />
          <div className="text-3xl font-black mb-1">{overallPercentage}%</div>
          <div className={`${theme.subtext} text-sm`}>Загальний прогрес</div>
        </div>
        
        <div className={`${theme.card} p-6 rounded-2xl border text-center`}>
          <Zap className="mx-auto mb-2 text-yellow-500" size={32} />
          <div className="text-3xl font-black mb-1">{completedQuestions}</div>
          <div className={`${theme.subtext} text-sm`}>Виконано</div>
        </div>
        
        <div className={`${theme.card} p-6 rounded-2xl border text-center`}>
          <TrendingUp className="mx-auto mb-2 text-blue-500" size={32} />
          <div className="text-3xl font-black mb-1">{totalQuestions}</div>
          <div className={`${theme.subtext} text-sm`}>Всього питань</div>
        </div>
        
        <div className={`${theme.card} p-6 rounded-2xl border text-center`}>
          <Award className="mx-auto mb-2 text-purple-500" size={32} />
          <div className="text-3xl font-black mb-1">{tests.length}</div>
          <div className={`${theme.subtext} text-sm`}>Тестів</div>
        </div>
      </div>

      {/* Прогрес по тестах */}
      <h2 className="text-3xl font-black mb-6">Прогрес по тестах</h2>
      <div className="space-y-4">
        {tests.map((test) => {
          const testProgress = progress[test.id] || { completed: 0, total: test.questions.length };
          const percentage = Math.round((testProgress.completed / testProgress.total) * 100);

          return (
            <div key={test.id} className={`${theme.card} p-6 rounded-2xl border`}>
              <div className="flex items-center gap-4 mb-4">
                <div className="text-4xl">{test.icon}</div>
                <div className="flex-1">
                  <h3 className="text-xl font-black">{test.title}</h3>
                  <p className={`${theme.subtext} text-sm`}>{test.description}</p>
                </div>
                <div className="text-right">
                  <div className="text-3xl font-black text-teal-600">{percentage}%</div>
                  <div className={`${theme.subtext} text-xs`}>
                    {testProgress.completed}/{testProgress.total}
                  </div>
                </div>
              </div>

              {/* Прогрес-бар */}
              <div className="bg-zinc-500/10 rounded-full h-4 overflow-hidden">
                <div
                  className="bg-gradient-to-r from-teal-500 to-teal-600 h-full transition-all duration-500 rounded-full"
                  style={{ width: `${percentage}%` }}
                />
              </div>
            </div>
          );
        })}
      </div>

      {/* Досягнення */}
      {overallPercentage === 100 && (
        <div className="mt-8 p-8 bg-gradient-to-r from-teal-500 to-emerald-500 rounded-3xl text-white text-center animate-slideIn">
          <div className="text-6xl mb-4">🏆</div>
          <h3 className="text-3xl font-black mb-2">Вітаємо!</h3>
          <p className="text-xl">Ви завершили всі тести! Ви готові до НМТ на 200 балів!</p>
        </div>
      )}
    </div>
  );
}
