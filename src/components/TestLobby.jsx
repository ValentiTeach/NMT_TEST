import React from 'react';
import { BookOpen, Zap } from 'lucide-react';
import { testsList } from '../data/tests';

export default function TestLobby({ onSelectTest, theme }) {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-6 animate-fadeIn">
      {testsList.map((test) => (
        <button
          key={test.id}
          onClick={() => onSelectTest(test)}
          className={`${theme.card} p-8 rounded-[2.5rem] text-left border-b-8 border-transparent hover:border-teal-500 transition-all hover:scale-[1.02] group shadow-xl`}
        >
          <div className="flex justify-between items-start mb-6">
            <div className="p-4 bg-teal-500/10 rounded-2xl text-teal-500 group-hover:bg-teal-500 group-hover:text-white transition-colors">
              <BookOpen size={32} />
            </div>
            <span className="flex items-center gap-1 text-xs font-black uppercase opacity-40">
              <Zap size={14} /> {test.questions.length} питань
            </span>
          </div>
          
          <h3 className="text-2xl font-black mb-3 group-hover:text-teal-500 transition-colors">
            {test.title}
          </h3>
          <p className={`text-sm opacity-60 leading-relaxed mb-6`}>
            {test.description}
          </p>
          
          <div className="flex items-center text-teal-500 font-bold text-sm uppercase tracking-wider">
            Почати тест →
          </div>
        </button>
      ))}
    </div>
  );
}
