// components/Calendar.jsx - Інтерактивний календар для планування уроків
import React, { useState, useEffect } from 'react';
import { ChevronLeft, ChevronRight, Plus, X, Calendar as CalendarIcon, User, BookOpen } from 'lucide-react';
import { users } from '../data/users';

export default function Calendar({ theme, currentUser, lessons, onAddLesson, onDeleteLesson }) {
  const [currentDate, setCurrentDate] = useState(new Date());
  const [selectedDate, setSelectedDate] = useState(null);
  const [showAddDialog, setShowAddDialog] = useState(false);
  const [newLesson, setNewLesson] = useState({
    title: '',
    studentEmail: '',
    date: '',
    time: '14:00',
    notes: ''
  });

  const monthNames = [
    'Січень', 'Лютий', 'Березень', 'Квітень', 'Травень', 'Червень',
    'Липень', 'Серпень', 'Вересень', 'Жовтень', 'Листопад', 'Грудень'
  ];

  const weekDays = ['Пн', 'Вт', 'Ср', 'Чт', 'Пт', 'Сб', 'Нд'];

  // ===== РОБОТА З ДАТАМИ БЕЗ UTC КОНВЕРТАЦІЇ =====
  // Проблема: JavaScript Date.toISOString() конвертує в UTC, що призводить до зсуву дати
  // Рішення: Використовуємо локальні дати напряму без конвертації
  
  // Допоміжна функція для форматування дати в локальному часовому поясі
  // Формат: YYYY-MM-DD (без конвертації в UTC)
  const formatDateToLocal = (date) => {
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const day = String(date.getDate()).padStart(2, '0');
    return `${year}-${month}-${day}`;
  };

  // Допоміжна функція для парсингу дати з рядка без UTC конвертації
  // Парсить YYYY-MM-DD і створює локальну дату
  const parseDateFromString = (dateStr) => {
    const [year, month, day] = dateStr.split('-').map(Number);
    return new Date(year, month - 1, day);
  };

  // Отримуємо дні місяця
  const getDaysInMonth = (date) => {
    const year = date.getFullYear();
    const month = date.getMonth();
    const firstDay = new Date(year, month, 1);
    const lastDay = new Date(year, month + 1, 0);
    const daysInMonth = lastDay.getDate();
    
    // Отримуємо день тижня першого дня (0 = неділя, потрібно зробити 0 = понеділок)
    let startingDayOfWeek = firstDay.getDay();
    startingDayOfWeek = startingDayOfWeek === 0 ? 6 : startingDayOfWeek - 1;

    const days = [];
    
    // Додаємо пусті клітинки для вирівнювання
    for (let i = 0; i < startingDayOfWeek; i++) {
      days.push(null);
    }
    
    // Додаємо дні місяця
    for (let i = 1; i <= daysInMonth; i++) {
      days.push(new Date(year, month, i));
    }
    
    return days;
  };

  // Перевірка чи є уроки на конкретну дату
  const getLessonsForDate = (date) => {
    if (!date || !lessons) return [];
    
    const dateStr = formatDateToLocal(date);
    return lessons.filter(lesson => lesson.date === dateStr);
  };

  // Навігація по місяцях
  const previousMonth = () => {
    setCurrentDate(new Date(currentDate.getFullYear(), currentDate.getMonth() - 1, 1));
  };

  const nextMonth = () => {
    setCurrentDate(new Date(currentDate.getFullYear(), currentDate.getMonth() + 1, 1));
  };

  const goToToday = () => {
    setCurrentDate(new Date());
  };

  // Обробка вибору дати
  const handleDateClick = (date) => {
    if (!date) return;
    setSelectedDate(date);
    
    const localDateStr = formatDateToLocal(date);
    
    setNewLesson({
      ...newLesson,
      date: localDateStr
    });
    setShowAddDialog(true);
  };

  // Додавання нового уроку
  const handleAddLesson = () => {
    if (!newLesson.title || !newLesson.studentEmail || !newLesson.date) {
      alert('⚠️ Будь ласка, заповніть усі обов\'язкові поля!');
      return;
    }

    const lesson = {
      id: Date.now().toString(),
      ...newLesson,
      createdBy: currentUser.email,
      createdAt: new Date().toISOString()
    };

    onAddLesson(lesson);
    
    // Скидаємо форму
    setNewLesson({
      title: '',
      studentEmail: '',
      date: '',
      time: '14:00',
      notes: ''
    });
    setShowAddDialog(false);
  };

  const days = getDaysInMonth(currentDate);
  
  // Отримуємо сьогоднішню дату в локальному форматі (без часу)
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const todayStr = formatDateToLocal(today);

  // Фільтр учнів (без адміна)
  const students = users.filter(u => u.role === 'student');

  return (
    <div className="max-w-6xl mx-auto">
      {/* Заголовок */}
      <div className={`${theme.card} p-8 rounded-3xl border mb-8`}>
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4">
            <CalendarIcon size={48} className="text-teal-600" />
            <div>
              <h1 className="text-4xl font-black">Календар уроків</h1>
              <p className={`${theme.subtext} text-lg`}>Плануйте та відстежуйте заняття</p>
            </div>
          </div>
          
          <button
            onClick={goToToday}
            className="px-6 py-3 bg-teal-600 text-white rounded-xl font-bold hover:bg-teal-700 transition"
          >
            📅 Сьогодні
          </button>
        </div>
      </div>

      {/* Навігація по місяцях */}
      <div className={`${theme.card} p-6 rounded-2xl border mb-6`}>
        <div className="flex items-center justify-between">
          <button
            onClick={previousMonth}
            className="p-3 hover:bg-teal-500/10 rounded-xl transition"
          >
            <ChevronLeft size={24} />
          </button>
          
          <h2 className="text-3xl font-black">
            {monthNames[currentDate.getMonth()]} {currentDate.getFullYear()}
          </h2>
          
          <button
            onClick={nextMonth}
            className="p-3 hover:bg-teal-500/10 rounded-xl transition"
          >
            <ChevronRight size={24} />
          </button>
        </div>
      </div>

      {/* Календарна сітка */}
      <div className={`${theme.card} p-6 rounded-2xl border`}>
        {/* Дні тижня */}
        <div className="grid grid-cols-7 gap-2 mb-4">
          {weekDays.map(day => (
            <div key={day} className="text-center font-black text-sm opacity-50 py-2">
              {day}
            </div>
          ))}
        </div>

        {/* Дні місяця */}
        <div className="grid grid-cols-7 gap-2">
          {days.map((date, index) => {
            const isToday = date && formatDateToLocal(date) === todayStr;
            const dayLessons = date ? getLessonsForDate(date) : [];
            const hasLessons = dayLessons.length > 0;

            return (
              <div key={index} className="aspect-square">
                {date ? (
                  <button
                    onClick={() => handleDateClick(date)}
                    className={`w-full h-full rounded-xl border-2 p-2 transition-all hover:scale-105 relative ${
                      isToday
                        ? 'border-teal-600 bg-teal-500/10 shadow-lg'
                        : hasLessons
                        ? 'border-blue-500/30 bg-blue-500/5'
                        : 'border-transparent hover:border-teal-500/30'
                    }`}
                  >
                    <div className="flex flex-col items-center justify-center h-full">
                      <span className={`text-lg font-bold ${isToday ? 'text-teal-600' : ''}`}>
                        {date.getDate()}
                      </span>
                      {hasLessons && (
                        <div className="flex flex-wrap gap-1 mt-1 justify-center">
                          {dayLessons.slice(0, 3).map((lesson, i) => (
                            <div
                              key={i}
                              className="w-2 h-2 rounded-full bg-blue-500"
                              title={lesson.title}
                            />
                          ))}
                          {dayLessons.length > 3 && (
                            <span className="text-xs text-blue-600 font-bold">
                              +{dayLessons.length - 3}
                            </span>
                          )}
                        </div>
                      )}
                    </div>
                  </button>
                ) : (
                  <div className="w-full h-full" />
                )}
              </div>
            );
          })}
        </div>
      </div>

      {/* Список уроків на обрану дату */}
      {selectedDate && (
        <div className={`${theme.card} p-6 rounded-2xl border mt-6`}>
          <h3 className="text-2xl font-black mb-4">
            📚 Уроки на {selectedDate.toLocaleDateString('uk-UA', { 
              day: 'numeric', 
              month: 'long',
              year: 'numeric',
              timeZone: 'Europe/Kiev'
            })}
          </h3>
          
          {getLessonsForDate(selectedDate).length === 0 ? (
            <p className={`${theme.subtext} text-center py-8`}>
              Поки що немає запланованих уроків на цю дату
            </p>
          ) : (
            <div className="space-y-3">
              {getLessonsForDate(selectedDate).map(lesson => {
                const student = users.find(u => u.email === lesson.studentEmail);
                return (
                  <div
                    key={lesson.id}
                    className={`${theme.card} p-4 rounded-xl border flex items-start justify-between hover:shadow-lg transition`}
                  >
                    <div className="flex-1">
                      <div className="flex items-center gap-3 mb-2">
                        <BookOpen size={20} className="text-teal-600" />
                        <h4 className="font-bold text-lg">{lesson.title}</h4>
                      </div>
                      
                      <div className="flex items-center gap-4 text-sm">
                        <div className="flex items-center gap-2">
                          <User size={16} className="text-blue-500" />
                          <span>{student ? student.name : lesson.studentEmail}</span>
                        </div>
                        <span className="opacity-50">•</span>
                        <span className="font-mono font-bold text-teal-600">
                          ⏰ {lesson.time}
                        </span>
                      </div>
                      
                      {lesson.notes && (
                        <p className={`${theme.subtext} text-sm mt-2`}>
                          {lesson.notes}
                        </p>
                      )}
                    </div>
                    
                    {currentUser.role === 'admin' && (
                      <button
                        onClick={() => onDeleteLesson(lesson.id)}
                        className="p-2 text-red-500 hover:bg-red-500/10 rounded-lg transition"
                      >
                        <X size={20} />
                      </button>
                    )}
                  </div>
                );
              })}
            </div>
          )}
        </div>
      )}

      {/* Діалог додавання уроку */}
      {showAddDialog && currentUser.role === 'admin' && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className={`${theme.card} rounded-3xl p-8 max-w-md w-full border-2 shadow-2xl`}>
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-2xl font-black">➕ Новий урок</h3>
              <button
                onClick={() => setShowAddDialog(false)}
                className="p-2 hover:bg-red-500/10 text-red-500 rounded-lg transition"
              >
                <X size={24} />
              </button>
            </div>

            <div className="space-y-4">
              {/* Тема уроку */}
              <div>
                <label className="block font-bold mb-2">Тема уроку *</label>
                <input
                  type="text"
                  value={newLesson.title}
                  onChange={(e) => setNewLesson({ ...newLesson, title: e.target.value })}
                  placeholder="Наприклад: Козацька доба"
                  className={`w-full p-3 rounded-xl border-2 outline-none transition ${
                    theme.bg === 'bg-[#0A0A0B]'
                      ? 'bg-zinc-800/50 border-zinc-700 text-white'
                      : 'bg-slate-50 border-slate-200'
                  }`}
                />
              </div>

              {/* Учень */}
              <div>
                <label className="block font-bold mb-2">Учень *</label>
                <select
                  value={newLesson.studentEmail}
                  onChange={(e) => setNewLesson({ ...newLesson, studentEmail: e.target.value })}
                  className={`w-full p-3 rounded-xl border-2 outline-none transition ${
                    theme.bg === 'bg-[#0A0A0B]'
                      ? 'bg-zinc-800/50 border-zinc-700 text-white'
                      : 'bg-slate-50 border-slate-200'
                  }`}
                >
                  <option value="">Оберіть учня</option>
                  {students.map(student => (
                    <option key={student.email} value={student.email}>
                      {student.avatar} {student.name}
                    </option>
                  ))}
                </select>
              </div>

              {/* Дата */}
              <div>
                <label className="block font-bold mb-2">Дата *</label>
                <input
                  type="date"
                  value={newLesson.date}
                  onChange={(e) => setNewLesson({ ...newLesson, date: e.target.value })}
                  className={`w-full p-3 rounded-xl border-2 outline-none transition ${
                    theme.bg === 'bg-[#0A0A0B]'
                      ? 'bg-zinc-800/50 border-zinc-700 text-white'
                      : 'bg-slate-50 border-slate-200'
                  }`}
                />
              </div>

              {/* Час */}
              <div>
                <label className="block font-bold mb-2">Час</label>
                <input
                  type="time"
                  value={newLesson.time}
                  onChange={(e) => setNewLesson({ ...newLesson, time: e.target.value })}
                  className={`w-full p-3 rounded-xl border-2 outline-none transition ${
                    theme.bg === 'bg-[#0A0A0B]'
                      ? 'bg-zinc-800/50 border-zinc-700 text-white'
                      : 'bg-slate-50 border-slate-200'
                  }`}
                />
              </div>

              {/* Нотатки */}
              <div>
                <label className="block font-bold mb-2">Нотатки</label>
                <textarea
                  value={newLesson.notes}
                  onChange={(e) => setNewLesson({ ...newLesson, notes: e.target.value })}
                  placeholder="Додаткова інформація..."
                  rows={3}
                  className={`w-full p-3 rounded-xl border-2 outline-none transition resize-none ${
                    theme.bg === 'bg-[#0A0A0B]'
                      ? 'bg-zinc-800/50 border-zinc-700 text-white'
                      : 'bg-slate-50 border-slate-200'
                  }`}
                />
              </div>
            </div>

            <div className="flex gap-3 mt-6">
              <button
                onClick={() => setShowAddDialog(false)}
                className="flex-1 px-6 py-3 bg-gray-500 text-white rounded-xl font-bold hover:bg-gray-600 transition"
              >
                Скасувати
              </button>
              <button
                onClick={handleAddLesson}
                className="flex-1 px-6 py-3 bg-teal-600 text-white rounded-xl font-bold hover:bg-teal-700 transition"
              >
                ✅ Додати
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
