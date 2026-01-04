// src/services/ProgressService.js
import { supabase } from '../config/supabase';

/**
 * Сервіс для роботи з прогресом користувача
 */
class ProgressService {
  
  /**
   * Завантаження прогресу користувача з Supabase
   * @param {string} userEmail - Email користувача
   * @returns {Promise<Object|null>} Об'єкт прогресу або null
   */
  async loadProgress(userEmail) {
    try {
      console.log('📥 Завантаження прогресу для:', userEmail);
      
      const { data, error } = await supabase
        .from('user_progress')
        .select('progress_data')
        .eq('user_email', userEmail)
        .maybeSingle(); // Використовуємо maybeSingle замість single
      
      if (error) {
        console.error('❌ Помилка при завантаженні:', error);
        throw error;
      }
      
      if (data && data.progress_data) {
        console.log('✅ Прогрес завантажено для', userEmail, ':', data.progress_data);
        return data.progress_data;
      }
      
      console.log('ℹ️ Прогрес не знайдено для', userEmail, ', створюємо новий профіль');
      return null;
      
    } catch (error) {
      console.error('❌ Помилка завантаження прогресу:', error);
      return null;
    }
  }

  /**
   * Збереження прогресу користувача в Supabase
   * @param {string} userEmail - Email користувача
   * @param {Object} progressData - Дані прогресу
   * @returns {Promise<boolean>} Успішність операції
   */
  async saveProgress(userEmail, progressData) {
    try {
      console.log('💾 Збереження прогресу для:', userEmail);
      console.log('📊 Дані для збереження:', progressData);
      
      // Використовуємо upsert для автоматичного створення або оновлення
      const { data, error } = await supabase
        .from('user_progress')
        .upsert(
          {
            user_email: userEmail,
            progress_data: progressData,
            updated_at: new Date().toISOString()
          },
          {
            onConflict: 'user_email', // Оновлювати якщо email вже існує
            returning: 'minimal' // Не повертати дані для швидкості
          }
        );
      
      if (error) {
        console.error('❌ Помилка при збереженні:', error);
        throw error;
      }
      
      console.log('✅ Прогрес успішно збережено для:', userEmail);
      return true;
      
    } catch (error) {
      console.error('❌ Помилка збереження прогресу:', error);
      return false;
    }
  }

  /**
   * Видалення прогресу користувача
   * @param {string} userEmail - Email користувача
   * @returns {Promise<boolean>} Успішність операції
   */
  async deleteProgress(userEmail) {
    try {
      console.log('🗑️ Видалення прогресу для:', userEmail);
      
      const { error } = await supabase
        .from('user_progress')
        .delete()
        .eq('user_email', userEmail);
      
      if (error) throw error;
      
      console.log('✅ Прогрес видалено');
      return true;
      
    } catch (error) {
      console.error('❌ Помилка видалення прогресу:', error);
      return false;
    }
  }

  /**
   * Анулювання прогресу користувача (скидання до нуля)
   * @param {string} userEmail - Email користувача
   * @param {Object} initialProgress - Початковий прогрес (пустий)
   * @returns {Promise<boolean>} Успішність операції
   */
  async resetProgress(userEmail, initialProgress) {
    try {
      console.log('🔄 Анулювання прогресу для:', userEmail);
      
      // Встановлюємо пустий прогрес
      const { error } = await supabase
        .from('user_progress')
        .upsert(
          {
            user_email: userEmail,
            progress_data: initialProgress,
            updated_at: new Date().toISOString()
          },
          {
            onConflict: 'user_email'
          }
        );
      
      if (error) throw error;
      
      console.log('✅ Прогрес анульовано (скинуто до нуля)');
      return true;
      
    } catch (error) {
      console.error('❌ Помилка анулювання прогресу:', error);
      return false;
    }
  }

  /**
   * Отримання статистики всіх користувачів (для адміністратора)
   * @returns {Promise<Array>} Масив користувачів з прогресом
   */
  async getAllUsersProgress() {
    try {
      const { data, error } = await supabase
        .from('user_progress')
        .select('*')
        .order('updated_at', { ascending: false });
      
      if (error) throw error;
      
      return data || [];
      
    } catch (error) {
      console.error('❌ Помилка отримання статистики:', error);
      return [];
    }
  }

  /**
   * Перевірка чи існує прогрес для користувача
   * @param {string} userEmail - Email користувача
   * @returns {Promise<boolean>} Чи існує прогрес
   */
  async progressExists(userEmail) {
    try {
      const { data, error } = await supabase
        .from('user_progress')
        .select('id')
        .eq('user_email', userEmail)
        .single();
      
      return !error && data !== null;
      
    } catch (error) {
      return false;
    }
  }
}

// Експортуємо екземпляр сервісу
const progressService = new ProgressService();
export default progressService;
