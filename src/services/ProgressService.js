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
        .select('*')
        .eq('user_email', userEmail)
        .single();
      
      if (error) {
        // Якщо запис не знайдено - це нормально (новий користувач)
        if (error.code === 'PGRST116') {
          console.log('ℹ️ Прогрес не знайдено, створюємо новий профіль');
          return null;
        }
        throw error;
      }
      
      if (data && data.progress_data) {
        console.log('✅ Прогрес завантажено:', data.progress_data);
        return data.progress_data;
      }
      
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
      
      // Перевіряємо чи існує запис
      const { data: existing } = await supabase
        .from('user_progress')
        .select('id')
        .eq('user_email', userEmail)
        .single();
      
      if (existing) {
        // Оновлюємо існуючий запис
        const { error } = await supabase
          .from('user_progress')
          .update({
            progress_data: progressData,
            updated_at: new Date().toISOString()
          })
          .eq('user_email', userEmail);
        
        if (error) throw error;
        console.log('✅ Прогрес оновлено');
        
      } else {
        // Створюємо новий запис
        const { error } = await supabase
          .from('user_progress')
          .insert({
            user_email: userEmail,
            progress_data: progressData,
            created_at: new Date().toISOString(),
            updated_at: new Date().toISOString()
          });
        
        if (error) throw error;
        console.log('✅ Прогрес створено');
      }
      
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
