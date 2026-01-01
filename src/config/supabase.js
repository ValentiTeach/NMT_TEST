// src/config/supabase.js
import { createClient } from '@supabase/supabase-js';

// Отримання змінних оточення
const supabaseUrl = process.env.REACT_APP_SUPABASE_URL;
const supabaseAnonKey = process.env.REACT_APP_SUPABASE_ANON_KEY;

// Перевірка наявності ключів
if (!supabaseUrl || !supabaseAnonKey) {
  console.error('❌ Supabase credentials are missing!');
  console.error('Please check your .env file and make sure it contains:');
  console.error('- REACT_APP_SUPABASE_URL');
  console.error('- REACT_APP_SUPABASE_ANON_KEY');
}

// Створення клієнта Supabase
export const supabase = createClient(supabaseUrl, supabaseAnonKey, {
  auth: {
    persistSession: true,
    autoRefreshToken: true,
  },
  db: {
    schema: 'public'
  },
  global: {
    headers: {
      'x-application-name': 'nmt-test'
    }
  }
});

// Функція для перевірки з'єднання
export const testConnection = async () => {
  try {
    console.log('🔍 Перевірка підключення до Supabase...');
    console.log('📍 URL:', supabaseUrl);
    console.log('🔑 Key (перші 20 символів):', supabaseAnonKey?.substring(0, 20) + '...');
    
    const { data, error } = await supabase
      .from('user_progress')
      .select('id')
      .limit(1);
    
    if (error) {
      console.error('❌ Supabase connection error:', error);
      console.error('Error details:', {
        message: error.message,
        details: error.details,
        hint: error.hint,
        code: error.code
      });
      return false;
    }
    
    console.log('✅ Supabase connected successfully!');
    console.log('📊 Test query result:', data);
    return true;
  } catch (error) {
    console.error('❌ Supabase connection failed:', error);
    console.error('Exception details:', error.message);
    return false;
  }
};

// Експорт для використання в компонентах
export default supabase;
