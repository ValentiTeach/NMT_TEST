import React, { useState } from 'react';
import { FileText, Moon, Sun, User, Info, Layout, LogOut, X, Check, ArrowRight, HelpCircle, ImageIcon } from 'lucide-react';

const tests = [
  {
    id: 1,
    type: 'single',
    question: 'Уривок джерела, у якому схарактеризовано часи Голодомору «Урожай у нас був хороший, але радянська влада, "заготовляючи" наш хліб...», можна використати для пояснення його:',
    options: ['передумов', 'масштабу', 'жертв', 'мети'],
    correct: 3,
    explanation: 'Відповідь: Мети. Уривок прямо вказує на те, що голод був наслідком свідомої державної політики хлібозаготівель.'
  },
  {
    id: 2,
    type: 'single',
    question: "Гетьманів, зображених на портретах, об'єднує укладення воєнних договорів:",
    images: ['https://examen.com.ua/media/images/32143241.width-800.jpg'],
    options: ['з Кримським ханством', 'з Османською імперією', 'зі Шведським королівством', 'з Молдавським князівством'],
    correct: 2,
    explanation: 'Відповідь: Шведським королівством. Богдан Хмельницький (1657) та Іван Мазепа (1708) шукали союзів саме зі Швецією.'
  },
  {
    id: 3,
    type: 'matching',
    question: 'Поєднайте назву організації з іменем історичної особи, яка була її членом.',
    left: ['Братство тарасівців', 'Кирило-Мефодіївське братство', 'Південно-Західний відділ РГО', 'Наукове товариство ім. Т. Шевченка'],
    right: ['Микола Гулак', 'Михайло Грушевський', 'Дмитро Донцов', 'Павло Чубинський', 'Микола Міхновський'],
    correctMatching: { 0: 4, 1: 0, 2: 3, 3: 1 },
    explanation: 'Братство тарасівців — М. Міхновський; КМ братство — М. Гулак; ПЗ відділ РГО — П. Чубинський; НТШ — М. Грушевський.'
  },
  {
    id: 4,
    type: 'single',
    question: '«Український народ не хоче й не буде своєю кров\'ю рятувати Німеччину... Ми боремося за Українську державу, а не за чужий імперіалізм.» Таку позицію у роки Другої світової війни проголосив:',
    options: ['Провід ОУН (Б)', 'уряд Української РСР', 'очільник рейхскомісаріату «Україна»', 'керівник Українського штабу партизанського руху'],
    correct: 0,
    explanation: 'Відповідь: Провід ОУН (Б). У 1943 році організація офіційно проголосила боротьбу проти обох імперіалізмів — німецького та радянського.'
  },
  {
    id: 5,
    type: 'single',
    question: 'Який пам\'ятник, що увічнює одну з подій історії України, було створено в радянську епоху?',
    options: ['Пам\'ятник Дюку де Рішельє в Одесі', 'Пам\'ятник Богдану Хмельницькому в Києві', 'Пам\'ятник засновникам Києва (Либідь)', 'Пам\'ятник Володимиру Великому в Києві'],
    correct: 2,
    explanation: 'Відповідь: Пам\'ятник засновникам Києва (пам’ятний знак 1982 року). Інші пам\'ятники належать до періоду Російської імперії (XIX ст.).'
  },
  {
    id: 6,
    type: 'single',
    question: '«Спасибі вам і за ласкаве слово про дітей моїх "Гайдамаків"... Пустив я їх у люди...» Автором цитованого листа є:',
    options: ['П. Куліш', 'Т. Шевченко', 'М. Максимович', 'М. Шашкевич'],
    correct: 1,
    explanation: 'Відповідь: Т. Шевченко. Поема «Гайдамаки» — один з найбільших творів Кобзаря.'
  },
  {
    id: 7,
    type: 'sequence',
    question: 'Установіть послідовність подій XVII–XVIII ст.',
    left: ['Руїна', 'Паліївщина', 'Коліївщина', 'Хмельниччина'],
    correctSequence: { 0: 1, 1: 2, 2: 3, 3: 0 },
    explanation: '1. Хмельниччина (1648); 2. Руїна (1657+); 3. Паліївщина (1702); 4. Коліївщина (1768).'
  },
  {
    id: 8,
    type: 'matching',
    question: 'Узгодьте дату з подією Першої світової та Української революції.',
    left: ['січень 1918 р.', 'квітень 1918 р.', 'січень 1919 р.', 'листопад 1921 р.'],
    right: ['Листопадовий зрив', 'переворот Скоропадського', 'Другий «Зимовий похід»', 'бій під Крутами', 'Акт Злуки'],
    correctMatching: { 0: 3, 1: 1, 2: 4, 3: 2 },
    explanation: 'Бій під Крутами — 01.1918; Гетьманський переворот — 04.1918; Акт Злуки — 01.1919; Зимовий похід — 11.1921.'
  },
  {
    id: 9,
    type: 'single',
    question: 'Ухвалення якого Універсалу УЦР дало поштовх до створення Генерального секретаріату?',
    options: ['Першого', 'Другого', 'Третього', 'Четвертого'],
    correct: 0,
    explanation: 'Відповідь: Першого Універсалу. Одразу після проголошення автономії був створений перший уряд — Генеральний Секретаріат.'
  },
  {
    id: 10,
    type: 'single',
    question: '«Галицько-Буковинське генерал-губернаторство» – це одиниця, створена:',
    options: ['Російською імперією для окупованих земель', 'Австро-Угорщиною для допомоги УСС', 'Німеччиною в 1918 році', 'Польщею після війни'],
    correct: 0,
    explanation: 'Відповідь: Російською імперією. Створене в 1914 році на землях Галичини та Буковини, що потрапили під російську окупацію.'
  }
];

const letters = ['А', 'Б', 'В', 'Г', 'Д'];

export default function App() {
  const [isDarkMode, setIsDarkMode] = useState(false);
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [activeTab, setActiveTab] = useState('tests');
  const [currentQuestion, setCurrentQuestion] = useState(0);
  const [answers, setAnswers] = useState({});
  const [checkedQuestions, setCheckedQuestions] = useState({});

  const theme = {
    bg: isDarkMode ? 'bg-[#0A0A0B]' : 'bg-[#F9FAFB]',
    card: isDarkMode ? 'bg-[#151518] border-[#252529]' : 'bg-white border-slate-200',
    text: isDarkMode ? 'text-slate-100' : 'text-slate-900',
    subtext: isDarkMode ? 'text-slate-400' : 'text-slate-500'
  };

  const handleLogin = (e) => {
    e.preventDefault();
    if (email === 'test@example.com' && password === '123456') setIsLoggedIn(true);
    else alert('Спробуйте: test@example.com / 123456');
  };

  if (!isLoggedIn) return (
    <div className={`min-h-screen ${theme.bg} flex items-center justify-center p-6`}>
      <form onSubmit={handleLogin} className={`${theme.card} p-12 rounded-[2.5rem] border w-full max-w-md shadow-2xl animate-fadeIn`}>
        <h2 className={`text-4xl font-black mb-8 text-center ${theme.text} tracking-tight`}>Вхід</h2>
        <input className={`w-full p-5 border rounded-2xl mb-4 outline-none transition-all ${isDarkMode ? 'bg-zinc-800 border-zinc-700 text-white' : 'bg-slate-50 border-slate-200'}`} placeholder="Email" value={email} onChange={e => setEmail(e.target.value)} required />
        <input className={`w-full p-5 border rounded-2xl mb-6 outline-none transition-all ${isDarkMode ? 'bg-zinc-800 border-zinc-700 text-white' : 'bg-slate-50 border-slate-200'}`} type="password" placeholder="Пароль" value={password} onChange={e => setPassword(e.target.value)} required />
        <button className="w-full bg-teal-600 text-white py-5 rounded-2xl font-black text-xl hover:bg-teal-700 transition-all shadow-xl shadow-teal-500/20 uppercase tracking-widest">Увійти</button>
      </form>
    </div>
  );

  const q = tests[currentQuestion];
  const isChecked = checkedQuestions[currentQuestion];

  return (
    <div className={`min-h-screen ${theme.bg} ${theme.text} transition-colors pb-10 font-sans`}>
      <header className={`${theme.card} border-b py-5 px-8 sticky top-0 z-50`}>
        <div className="max-w-6xl mx-auto flex justify-between items-center">
          <div className="flex gap-4">
             {['tests', 'profile', 'about'].map(tab => (
               <button key={tab} onClick={() => setActiveTab(tab)} className={`font-black text-sm uppercase tracking-wider px-4 py-2 rounded-xl transition ${activeTab === tab ? 'bg-teal-500 text-white shadow-lg shadow-teal-500/30' : 'opacity-40 hover:opacity-100'}`}>
                 {tab === 'tests' ? 'Тести' : tab === 'profile' ? 'Профіль' : 'Про сайт'}
               </button>
             ))}
          </div>
          <div className="flex items-center gap-4">
            <button onClick={() => setIsDarkMode(!isDarkMode)} className="p-3 bg-zinc-500/10 rounded-full">{isDarkMode ? <Sun size={24} className="text-yellow-400" /> : <Moon size={24}/>}</button>
            <button onClick={() => setIsLoggedIn(false)} className="text-red-400 font-bold hover:scale-105 transition uppercase text-xs">Вихід</button>
          </div>
        </div>
      </header>

      <main className="max-w-5xl mx-auto px-6 mt-12">
        {activeTab === 'tests' && (
          <div className="animate-fadeIn">
            {/* Панель питань */}
            <div className="flex gap-2 mb-10 overflow-x-auto pb-4 scrollbar-hide">
              {tests.map((_, i) => (
                <button key={i} onClick={() => setCurrentQuestion(i)} className={`min-w-[54px] h-[54px] rounded-2xl font-black transition-all border-2 ${currentQuestion === i ? 'bg-teal-600 border-teal-600 text-white shadow-lg shadow-teal-600/30' : checkedQuestions[i] ? 'bg-zinc-800 text-white border-zinc-700' : 'border-zinc-500/20'}`}>
                  {i + 1}
                </button>
              ))}
            </div>

            <div className={`${theme.card} p-12 rounded-[3.5rem] border shadow-sm`}>
              <div className="mb-10">
                <div className="flex items-center gap-2 text-teal-600 font-black text-sm tracking-widest uppercase mb-4">
                  <Layout size={18} /> Питання {currentQuestion + 1}
                </div>
                <h2 className="text-3xl font-medium leading-[1.4] mb-8">{q.question}</h2>
              </div>

              {q.images && (
                <div className="flex justify-center mb-10 bg-white/5 p-4 rounded-3xl border border-white/10 shadow-inner">
                  <img src={q.images[0]} alt="Historical" className="max-h-[300px] rounded-2xl shadow-lg" />
                </div>
              )}

              {/* Ряди відповідей для SINGLE */}
              {q.type === 'single' && (
                <div className="space-y-4">
                  {q.options.map((opt, i) => {
                    const sel = answers[currentQuestion]?.[0] === i;
                    const corr = q.correct === i;
                    let style = `w-full p-6 text-left rounded-2xl border-2 transition-all flex items-center gap-5 text-xl `;
                    if (!isChecked) style += sel ? 'border-teal-500 bg-teal-500/10' : 'border-transparent bg-zinc-500/5 hover:bg-zinc-500/10';
                    else if (corr) style += 'bg-teal-600 border-teal-600 text-white scale-[1.01] shadow-xl';
                    else if (sel) style += 'bg-red-500 border-red-500 text-white opacity-40';
                    else style += 'opacity-10 grayscale';

                    return (
                      <button key={i} onClick={() => !isChecked && setAnswers({...answers, [currentQuestion]: {0: i}})} className={style}>
                        <span className={`w-12 h-12 flex items-center justify-center font-black rounded-xl ${sel || (isChecked && corr) ? 'bg-white/20' : 'bg-black/10'}`}>{letters[i]}</span>
                        <span className="font-semibold">{opt}</span>
                      </button>
                    );
                  })}
                </div>
              )}

              {/* Велика СІТКА для MATCHING / SEQUENCE */}
              {(q.type === 'matching' || q.type === 'sequence') && (
                <div className="mt-8 flex flex-col items-center">
                   {/* ЗБІЛЬШЕНІ ШРИФТИ ДЛЯ СПИСКІВ */}
                   <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 w-full mb-12 text-lg lg:text-xl font-medium leading-relaxed">
                      <div className="space-y-4">
                        {q.left.map((t, i) => <div key={i} className="flex gap-4 p-3 rounded-xl bg-teal-500/5 border border-teal-500/10 shadow-sm"><span className="text-teal-600 font-black shrink-0">{i+1}.</span> <span>{t}</span></div>)}
                      </div>
                      <div className="space-y-4">
                        {(q.right || letters.slice(0, 4).map(l => "Подія " + l)).map((t, i) => <div key={i} className="flex gap-4 p-3 rounded-xl bg-slate-500/5 border border-slate-500/10 shadow-sm"><span className="text-slate-500 font-black shrink-0">{letters[i]}.</span> <span>{t}</span></div>)}
                      </div>
                   </div>

                   {/* Клітинки вибору */}
                   <div className="inline-block">
                      <div className="flex ml-12 mb-4">
                        {letters.map(l => <div key={l} className="w-16 text-center font-black text-2xl opacity-50">{l}</div>)}
                      </div>
                      {q.left.map((_, row) => (
                        <div key={row} className="flex items-center gap-3 mb-3">
                           <div className="w-10 font-black text-2xl text-teal-600">{row+1}</div>
                           {letters.map((_, col) => {
                             const sel = answers[currentQuestion]?.[row] === col;
                             const corr = q.correctMatching?.[row] === col || q.correctSequence?.[row] === col;
                             let box = `w-16 h-16 border-2 rounded-2xl flex items-center justify-center transition-all cursor-pointer `;
                             if (!isChecked) box += sel ? 'border-teal-600 shadow-md ring-4 ring-teal-500/10 bg-white dark:bg-zinc-800' : 'border-zinc-500/20';
                             else if (corr) box += 'bg-teal-600 border-teal-600';
                             else if (sel) box += 'bg-red-500 border-red-500 opacity-40';
                             else box += 'border-zinc-500/10 opacity-10';

                             return (
                               <div key={col} onClick={() => !isChecked && setAnswers({...answers, [currentQuestion]: {...(answers[currentQuestion]||{}), [row]: col}})} className={box}>
                                 {(sel || (isChecked && corr)) && <X size={44} strokeWidth={4} className={isChecked ? 'text-white' : 'text-teal-600'} />}
                               </div>
                             );
                           })}
                        </div>
                      ))}
                   </div>
                </div>
              )}

              {/* РОЗБІР ПИТАННЯ */}
              {isChecked && (
                <div className="mt-12 p-10 bg-teal-600/5 rounded-[2.5rem] border border-teal-600/10 animate-slideIn">
                  <div className="flex items-center gap-2 mb-4 font-black text-teal-600 text-sm tracking-wider uppercase"><HelpCircle /> Коментар викладача:</div>
                  <p className="text-2xl leading-[1.6] opacity-90">{q.explanation}</p>
                </div>
              )}

              <div className="mt-16 flex gap-4">
                 {!isChecked ? (
                   <button onClick={() => setCheckedQuestions({...checkedQuestions, [currentQuestion]: true})} disabled={!answers[currentQuestion]} className="w-full bg-teal-600 text-white p-7 rounded-3xl font-black text-2xl uppercase tracking-[0.2em] shadow-2xl hover:bg-teal-700 active:scale-95 transition-all disabled:opacity-20 shadow-teal-600/30">Перевірити</button>
                 ) : (
                   <button onClick={() => setCurrentQuestion(p => (p + 1) % tests.length)} className="w-full bg-slate-900 dark:bg-white dark:text-black text-white p-7 rounded-3xl font-black text-2xl uppercase tracking-[0.2em] flex justify-center items-center gap-4 transition-all hover:opacity-80">
                     Наступне <ArrowRight size={32} />
                   </button>
                 )}
              </div>
            </div>
          </div>
        )}

        {activeTab === 'profile' && <div className="text-center mt-20 p-20 border-4 border-dashed rounded-[3rem] opacity-30 text-3xl font-black">Прогрес завантажується...</div>}
        {activeTab === 'about' && <div className="max-w-3xl mx-auto text-center animate-slideIn"><h1 className="text-5xl font-black mb-8 italic">НМТ ЕКСПРЕС 2025</h1><p className="text-2xl opacity-50">Найкращий симулятор тестів з історії. З кожним правильним хрестиком ти стаєш ближчим до 200 балів.</p></div>}
      </main>

      <style>{`
        @keyframes fadeIn { from { opacity: 0; transform: translateY(10px); } to { opacity: 1; transform: translateY(0); } }
        @keyframes slideIn { from { opacity: 0; transform: translateX(-10px); } to { opacity: 1; transform: translateX(0); } }
        .animate-fadeIn { animation: fadeIn 0.4s ease-out; }
        .animate-slideIn { animation: slideIn 0.5s cubic-bezier(0.16, 1, 0.3, 1) forwards; }
        .scrollbar-hide::-webkit-scrollbar { display: none; }
      `}</style>
    </div>
  );
}
