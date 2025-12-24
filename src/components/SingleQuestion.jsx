// components/SingleQuestion.jsx
import React from 'react';
import { letters } from '../data/tests';

export default function SingleQuestion({ question, answers, onAnswer, isChecked }) {
  return (
    <div className="space-y-4">
      {question.options.map((opt, i) => {
        const sel = answers?.[0] === i;
        const corr = question.correct === i;
        let style = `w-full p-6 text-left rounded-2xl border-2 transition-all flex items-center gap-5 text-xl `;
        
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
