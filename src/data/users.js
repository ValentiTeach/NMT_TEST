// data/users.js - Тестові акаунти
export const users = [
  {
    email: 'test@example.com',
    password: '123456',
    name: 'Тарас Шевченко',
    avatar: '📚',
    role: 'student',
    allowedCategories: ['nmt', 'grade9'] // Доступ до всіх категорій
  },
  {
    email: 'marichka25@nmt.ua',
    password: 'make21d',
    name: 'Марічка',
    avatar: '🎓',
    role: 'student',
    allowedCategories: ['nmt'] // Тільки підготовка до НМТ
  },
  {
    email: 'khrystha14@nmt.ua',
    password: 'der8Lk',
    name: 'Христя',
    avatar: '⭐',
    role: 'student',
    allowedCategories: ['nmt', 'grade9'] // Доступ до всіх
  },
  {
    email: 'romaNa34@nmt.ua',
    password: 'uder212',
    name: 'Романа',
    avatar: '🏛️',
    role: 'student',
    allowedCategories: ['grade9'] // Тільки 9 клас
  },
  {
    email: 'admin@nmt.ua',
    password: 'Historic_up',
    name: 'Адміністратор',
    avatar: '👑',
    role: 'admin',
    allowedCategories: ['nmt', 'grade9'] // Адмін бачить все
  }
];
