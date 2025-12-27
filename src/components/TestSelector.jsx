// components/TestSelector.jsx
import React from 'react';
import { ArrowRight, CheckCircle, Home } from 'lucide-react';

export default function TestSelector({ tests, onSelectTest, onBack, progress, theme }) {
  return (
    <div className="max-w-4xl mx-auto">
      {/* Кнопка назад */}
      {onBack && (
        <button
          onClick={onBack}
          className={`${theme.card} px-6 py-3 rounded-xl border-2 font-bold hover:scale-105 transition-all flex items-center gap-2 mb-8`}
        >
          <Home size={20} /> Назад до категорій
        </button>
      )}

      <h1 className="text-5xl font-black mb-4 text-center">Оберіть тест</h1>
      <p className={`text-center ${theme.subtext} mb-16 text-xl`}>
        Виберіть напрямок для підготовки до НМТ
      </p>

      <div className="grid gap-6">
        {tests.map((test) => {
          const testProgress = progress[test.id] || { completed: 0, total: test.questions.length };
          const percentage = Math.round((testProgress.completed / testProgress.total) * 100);

          return (
            <button
              key={test.id}
              onClick={() => onSelectTest(test)}
              className={`${theme.card} p-8 rounded-3xl border-2 text-left transition-all hover:scale-[1.02] hover:shadow-xl group`}
            >
              <div className="flex items-start gap-6">
                <div className="text-6xl">{test.icon}</div>
                <div className="flex-1">
                  <h3 className="text-3xl font-black mb-2 group-hover:text-teal-600 transition-colors">
                    {test.title}
                  </h3>
                  <p className={`${theme.subtext} text-lg mb-4`}>{test.description}</p>
                  
                  {/* Прогрес */}
                  <div className="flex items-center gap-4">
                    <div className="flex-1 bg-zinc-500/10 rounded-full h-3 overflow-hidden">
                      <div
                        className="bg-teal-600 h-full transition-all duration-500 rounded-full"
                        style={{ width: `${percentage}%` }}
                      />
                    </div>
                    <span className="font-black text-sm text-teal-600 min-w-[60px]">
                      {percentage}%
                    </span>
                    {percentage === 100 && <CheckCircle className="text-teal-600" size={24} />}
                  </div>

                  <div className={`${theme.subtext} text-sm mt-2`}>
                    {testProgress.completed} з {testProgress.total} питань
                  </div>
                </div>

                <ArrowRight className="text-teal-600 opacity-0 group-hover:opacity-100 transition-opacity" size={32} />
              </div>
            </button>
          );
        })}
      </div>
    </div>
  );
}
