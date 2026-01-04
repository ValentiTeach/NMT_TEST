// services/UserPermissionsService.js
import { supabase } from '../config/supabase';

/**
 * Сервіс для роботи з персональними дозволами користувачів
 */
class UserPermissionsService {
  
  /**
   * Завантаження дозволів користувача
   * @param {string} userEmail - Email користувача
   * @returns {Promise<Array>} Масив дозволених категорій
   */
  async loadPermissions(userEmail) {
    try {
      console.log('🔐 Завантаження дозволів для:', userEmail);
      
      const { data, error } = await supabase
        .from('user_permissions')
        .select('allowed_categories')
        .eq('user_email', userEmail)
        .maybeSingle();
      
      if (error && error.code !== 'PGRST116') {
        throw error;
      }
      
      if (data && data.allowed_categories) {
        console.log('✅ Дозволи завантажено:', data.allowed_categories);
        return data.allowed_categories;
      }
      
      console.log('ℹ️ Дозволи не знайдено, використовуємо стандартні');
      return null;
      
    } catch (error) {
      console.error('❌ Помилка завантаження дозволів:', error);
      return null;
    }
  }

  /**
   * Збереження дозволів користувача
   * @param {string} userEmail - Email користувача
   * @param {Array} allowedCategories - Масив дозволених категорій
   * @returns {Promise<boolean>} Успішність операції
   */
  async savePermissions(userEmail, allowedCategories) {
    try {
      console.log('💾 Збереження дозволів для:', userEmail, allowedCategories);
      
      const { error } = await supabase
        .from('user_permissions')
        .upsert(
          {
            user_email: userEmail,
            allowed_categories: allowedCategories,
            updated_at: new Date().toISOString()
          },
          {
            onConflict: 'user_email'
          }
        );
      
      if (error) throw error;
      
      console.log('✅ Дозволи збережено');
      return true;
      
    } catch (error) {
      console.error('❌ Помилка збереження дозволів:', error);
      return false;
    }
  }

  /**
   * Отримання всіх користувачів з їх дозволами
   * @returns {Promise<Array>} Масив користувачів з дозволами
   */
  async getAllUsersPermissions() {
    try {
      const { data, error } = await supabase
        .from('user_permissions')
        .select('*')
        .order('user_email');
      
      if (error) throw error;
      
      return data || [];
      
    } catch (error) {
      console.error('❌ Помилка отримання дозволів:', error);
      return [];
    }
  }

  /**
   * Видалення дозволів користувача
   * @param {string} userEmail - Email користувача
   * @returns {Promise<boolean>} Успішність операції
   */
  async deletePermissions(userEmail) {
    try {
      const { error } = await supabase
        .from('user_permissions')
        .delete()
        .eq('user_email', userEmail);
      
      if (error) throw error;
      
      console.log('✅ Дозволи видалено');
      return true;
      
    } catch (error) {
      console.error('❌ Помилка видалення дозволів:', error);
      return false;
    }
  }
}

const userPermissionsService = new UserPermissionsService();
export default userPermissionsService;
