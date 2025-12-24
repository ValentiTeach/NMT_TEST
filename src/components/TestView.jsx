// components/TestView.jsx
import React from 'react';
import { Layout, HelpCircle, ArrowRight } from 'lucide-react';
import SingleQuestion from './SingleQuestion';
import MatchingQuestion from './MatchingQuestion';

// Видалено: import { tests } from '../data/tests';

export default function TestView({ 
  currentQuestion, 
  setCurrentQuestion, 
  answers, 
  setAnswers, 
  checkedQuestions, 
  setCheckedQuestions,
  theme,
  activeTestData // Додано пропс із даними обраного тесту
}) {
  // Використовуємо питання з обраного тесту
  const questions = activeTestData.questions;
  const q = questions[currentQuestion];
  const isChecked = checkedQuestions[currentQuestion];

  const handleAnswer = (newAnswer) => {
    setAnswers({ ...answers, [currentQuestion]: newAnswer });
  };

  const handleCheck = () => {
    setCheckedQuestions({ ...checkedQuestions, [currentQuestion]: true });
  };

  const handleNext = () => {
    // Циклічне перемикання базуючись на довжині поточного тесту
    setCurrentQuestion((p) => (p + 1) % questions.length);
  };

  return (
    <div className="animate-fadeIn">
      {/* Панель питань - тепер адаптована під кількість питань у поточному тесті */}
      <div className="flex gap-2 mb-10 overflow-x-auto pb-4 scrollbar-hide">
        {questions.map((_, i) => (
          <button
            key={i}
            onClick={() => setCurrentQuestion(i)}
            className={`min-w-[54px] h-[54px] rounded-2xl font-black transition-all border-2 ${
              currentQuestion === i
                ? 'bg-teal-600 border-teal-600 text-white shadow-lg shadow-teal-600/30'
                : checkedQuestions[i]
                ? 'bg-zinc-800 text-white border-zinc-700'
                : 'border-zinc-500/20'
            }`}
          >
            {i + 1}
          </button>
        ))}
      </div>

      <div className={`${theme.card} p-12 rounded-[3.5rem] border shadow-sm`}>
        {/* Заголовок питання */}
        <div className="mb-10">
          <div className="flex items-center gap-2 text-teal-600 font-black text-sm tracking-widest uppercase mb-4">
            <Layout size={18} /> Питання {currentQuestion + 1}
          </div>
          <h2 className="text-3xl font-medium leading-[1.4] mb-8">{q.question}</h2>
        </div>

        {/* Зображення */}
        {q.images && (
          <div className="flex justify-center mb-10 bg-white/5 p-4 rounded-3xl border border-white/10 shadow-inner">
            <img src={q.images[0]} alt="Historical" className="max-h-[300px] rounded-2xl shadow-lg" />
          </div>
        )}

        {/* Рендер питання залежно від типу */}
        {q.type === 'single' && (
          <SingleQuestion
            question={q}
            answers={answers[currentQuestion]}
            onAnswer={handleAnswer}
            isChecked={isChecked}
          />
        )}

        {(q.type === 'matching' || q.type === 'sequence') && (
          <MatchingQuestion
            question={q}
            answers={answers[currentQuestion]}
            onAnswer={handleAnswer}
            isChecked={isChecked}
          />
        )}

        {/* Пояснення */}
        {isChecked && (
          <div className="mt-12 p-10 bg-teal-600/5 rounded-[2.5rem] border border-teal-600/10 animate-slideIn">
            <div className="flex items-center gap-2 mb-4 font-black text-teal-600 text-sm tracking-wider uppercase">
              <HelpCircle /> Коментар викладача:
            </div>
            <p className="text-2xl leading-[1.6] opacity-90">{q.explanation}</p>
          </div>
        )}

        {/* Кнопки */}
        <div className="mt-16 flex gap-4">
          {!isChecked ? (
            <button
              onClick={handleCheck}
              disabled={!answers[currentQuestion]}
              className="w-full bg-teal-600 text-white p-7 rounded-3xl font-black text-2xl uppercase tracking-[0.2em] shadow-2xl hover:bg-teal-700 active:scale-95 transition-all disabled:opacity-20 shadow-teal-600/30"
            >
              Перевірити
            </button>
          ) : (
            <button
              onClick={handleNext}
              className="w-full bg-slate-900 dark:bg-white dark:text-black text-white p-7 rounded-3xl font-black text-2xl uppercase tracking-[0.2em] flex justify-center items-center gap-4 transition-all hover:opacity-80"
            >
              Наступне <ArrowRight size={32} />
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
