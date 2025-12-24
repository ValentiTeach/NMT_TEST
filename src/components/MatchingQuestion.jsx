// components/MatchingQuestion.jsx
import React from 'react';
import { X } from 'lucide-react';
import { letters } from '../data/constants';

export default function MatchingQuestion({ question, answers, onAnswer, isChecked }) {
  const handleClick = (row, col) => {
    if (!isChecked) {
      onAnswer({ ...(answers || {}), [row]: col });
    }
  };

  return (
    <div className="mt-8 flex flex-col items-center">
      {/* Списки */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 w-full mb-12 text-lg lg:text-xl font-medium leading-relaxed">
        <div className="space-y-4">
          {question.left.map((t, i) => (
            <div
              key={i}
              className="flex gap-4 p-3 rounded-xl bg-teal-500/5 border border-teal-500/10 shadow-sm"
            >
              <span className="text-teal-600 font-black shrink-0">{i + 1}.</span>
              <span>{t}</span>
            </div>
          ))}
        </div>
        <div className="space-y-4">
          {(question.right || letters.slice(0, 4).map(l => 'Подія ' + l)).map((t, i) => (
            <div
              key={i}
              className="flex gap-4 p-3 rounded-xl bg-slate-500/5 border border-slate-500/10 shadow-sm"
            >
              <span className="text-slate-500 font-black shrink-0">{letters[i]}.</span>
              <span>{t}</span>
            </div>
          ))}
        </div>
      </div>

      {/* Сітка вибору */}
      <div className="inline-block">
        <div className="flex gap-3 ml-[52px] mb-4">
          {letters.map(l => (
            <div key={l} className="w-16 text-center font-black text-2xl opacity-50">
              {l}
            </div>
          ))}
        </div>
        {question.left.map((_, row) => (
          <div key={row} className="flex items-center gap-3 mb-3">
            <div className="w-10 font-black text-2xl text-teal-600 text-center">{row + 1}</div>
            {letters.map((_, col) => {
              const sel = answers?.[row] === col;
              const corr = question.correctMatching?.[row] === col || question.correctSequence?.[row] === col;
              let box = `w-16 h-16 border-2 rounded-2xl flex items-center justify-center transition-all cursor-pointer `;
              
              if (!isChecked) {
                box += sel
                  ? 'border-teal-600 shadow-md ring-4 ring-teal-500/10 bg-white dark:bg-zinc-800'
                  : 'border-zinc-500/20';
              } else if (corr) {
                box += 'bg-teal-600 border-teal-600';
              } else if (sel) {
                box += 'bg-red-500 border-red-500 opacity-40';
              } else {
                box += 'border-zinc-500/10 opacity-10';
              }

              return (
                <div key={col} onClick={() => handleClick(row, col)} className={box}>
                  {(sel || (isChecked && corr)) && (
                    <X
                      size={44}
                      strokeWidth={4}
                      className={isChecked ? 'text-white' : 'text-teal-600'}
                    />
                  )}
                </div>
              );
            })}
          </div>
        ))}
      </div>
    </div>
  );
}
