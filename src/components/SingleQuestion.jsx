// components/SingleQuestion.jsx
import React from 'react';
import { letters } from '../data/constants';

export default function SingleQuestion({ question, answers, onAnswer, isChecked }) {
  // Перевірка чи є варіанти у вигляді зображень
  const hasOptionImages = question.optionImages && question.optionImages.length > 0;

  if (hasOptionImages) {
    // Відображення варіантів з зображеннями (сітка 2x2)
    return (
      <div className="grid grid-cols-2 gap-6">
        {question.options.map((opt, i) => {
          const sel = answers?.[0] === i;
          const corr = question.correct === i;
          let style = `p-4 rounded-2xl border-2 transition-all text-center cursor-pointer `;
          
          if (!isChecked) {
            style += sel ? 'border-teal-500 bg-teal-500/10 ring-4 ring-teal-500/20' : 'border-zinc-500/20 hover:border-teal-500/50';
          } else if (corr) {
            style += 'bg-teal-600 border-teal-600 ring-4 ring-teal-600/30';
          } else if (sel) {
            style += 'bg-red-500 border-red-500 opacity-40';
          } else {
            style += 'opacity-30 grayscale';
          }

          return (
            <button
              key={i}
              onClick={() => !isChecked && onAnswer({ 0: i })}
              className={style}
              disabled={isChecked}
            >
              <div className={`font-black text-2xl mb-3 ${isChecked && corr ? 'text-white' : ''}`}>
                {opt}
              </div>
              <img 
                src={question.optionImages[i]} 
                alt={`Варіант ${opt}`} 
                className="w-full h-48 object-cover rounded-lg"
                onError={(e) => {
                  e.target.style.display = 'none';
                  e.target.nextElementSibling.style.display = 'flex';
                }}
              />
              {/* Fallback якщо зображення не завантажилось */}
              <div className="hidden w-full h-48 items-center justify-center bg-zinc-500/10 rounded-lg">
                <span className="text-6xl opacity-20">🖼️</span>
              </div>
            </button>
          );
        })}
      </div>
    );
  }

  // Звичайні текстові варіанти
  return (
    <div className="space-y-4">
      {question.options.map((opt, i) => {
        const sel = answers?.[0] === i;
        const corr = question.correct === i;
        let style = `w-full p-6 text-left rounded-2xl border-2 transition-all flex items-center gap-5 text-xl cursor-pointer `;
        
        if (!isChecked) {
          style += sel
            ? 'border-teal-500 bg-teal-500/10'
            : 'border-transparent bg-zinc-500/5 hover:bg-zinc-500/10';
        } else if (corr) {
          style += 'bg-teal-600 border-teal-600 text-white scale-[1.01] shadow-xl';
        } else if (sel) {
          style += 'bg-red-500 border-red-500 text-white opacity-40';
        } else {
          style += 'opacity-10 grayscale';
        }

        return (
          <button
            key={i}
            onClick={() => !isChecked && onAnswer({ 0: i })}
            className={style}
            disabled={isChecked}
          >
            <span
              className={`w-12 h-12 flex items-center justify-center font-black rounded-xl ${
                sel || (isChecked && corr) ? 'bg-white/20' : 'bg-black/10'
              }`}
            >
              {letters[i]}
            </span>
            <span className="font-semibold">{opt}</span>
          </button>
        );
      })}
    </div>
  );
}
