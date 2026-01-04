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
    email: 'student@nmt.ua',
    password: 'nmt2025',
    name: 'Іван Франко',
    avatar: '🎓',
    role: 'student',
    allowedCategories: ['nmt'] // Тільки підготовка до НМТ
  },
  {
    email: 'vip@history.com',
    password: 'ukraine',
    name: 'Леся Українка',
    avatar: '⭐',
    role: 'student',
    allowedCategories: ['nmt', 'grade9'] // Доступ до всіх
  },
  {
    email: 'demo@test.com',
    password: 'demo123',
    name: 'Михайло Грушевський',
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
