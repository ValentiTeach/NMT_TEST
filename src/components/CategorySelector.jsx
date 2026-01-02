// components/CategorySelector.jsx
import React from 'react';
import { ArrowRight, BookOpen } from 'lucide-react';

export default function CategorySelector({ categories, onSelectCategory, theme }) {
  return (
    <div className="max-w-4xl mx-auto">
      <h1 className="text-5xl font-black mb-4 text-center">Оберіть категорію</h1>
      <p className={`text-center ${theme.subtext} mb-16 text-xl`}>
        Виберіть напрямок для підготовки
      </p>

      <div className="grid gap-6">
        {categories.map((category) => {
          // Підрахунок загального прогресу по категорії
          const totalQuestions = category.tests.reduce((sum, test) => sum + test.questions.length, 0);
          
          return (
            <button
              key={category.id}
              onClick={() => onSelectCategory(category)}
              className={`${theme.card} p-10 rounded-3xl border-2 text-left transition-all hover:scale-[1.02] hover:shadow-xl group`}
            >
              <div className="flex items-start gap-6">
                <div className="text-7xl">{category.icon}</div>
                <div className="flex-1">
                  <h3 className="text-4xl font-black mb-3 group-hover:text-teal-600 transition-colors">
                    {category.title}
                  </h3>
                  <p className={`${theme.subtext} text-xl mb-4`}>{category.description}</p>
                  
                  <div className="flex items-center gap-3 text-lg">
                    <BookOpen size={24} className="text-teal-600" />
                    <span className={theme.subtext}>
                      {category.tests.length} {category.tests.length === 1 ? 'тест' : category.tests.length < 5 ? 'тести' : 'тестів'}
                    </span>
                    <span className={theme.subtext}>•</span>
                    <span className={theme.subtext}>
                      {totalQuestions} {totalQuestions === 1 ? 'питання' : totalQuestions < 5 ? 'питання' : 'питань'}
                    </span>
                  </div>
                </div>

                <ArrowRight 
                  className="text-teal-600 opacity-0 group-hover:opacity-100 transition-opacity self-center" 
                  size={40} 
                />
              </div>
            </button>
          );
        })}
      </div>
    </div>
  );
}
