// services/CalendarService.js
import { supabase } from '../config/supabase';

/**
 * Сервіс для роботи з календарем уроків
 */
class CalendarService {
  
  /**
   * Завантаження всіх уроків
   * @returns {Promise<Array>} Масив уроків
   */
  async loadLessons() {
    try {
      console.log('📅 Завантаження уроків з календаря...');
      
      const { data, error } = await supabase
        .from('calendar_lessons')
        .select('*')
        .order('date', { ascending: true });
      
      if (error) {
        console.error('❌ Помилка при завантаженні уроків:', error);
        throw error;
      }
      
      console.log('✅ Уроки завантажено:', data?.length || 0);
      return data || [];
      
    } catch (error) {
      console.error('❌ Помилка завантаження уроків:', error);
      return [];
    }
  }

  /**
   * Додавання нового уроку
   * @param {Object} lesson - Дані уроку
   * @returns {Promise<Object|null>} Створений урок або null
   */
  async addLesson(lesson) {
    try {
      console.log('➕ Додавання нового уроку:', lesson);
      
      const { data, error } = await supabase
        .from('calendar_lessons')
        .insert([{
          id: lesson.id,
          title: lesson.title,
          student_email: lesson.studentEmail,
          date: lesson.date,
          time: lesson.time,
          notes: lesson.notes || '',
          created_by: lesson.createdBy,
          created_at: lesson.createdAt
        }])
        .select()
        .single();
      
      if (error) {
        console.error('❌ Помилка при додаванні уроку:', error);
        throw error;
      }
      
      console.log('✅ Урок успішно додано');
      return data;
      
    } catch (error) {
      console.error('❌ Помилка додавання уроку:', error);
      return null;
    }
  }

  /**
   * Оновлення уроку
   * @param {string} lessonId - ID уроку
   * @param {Object} updates - Оновлені дані
   * @returns {Promise<boolean>} Успішність операції
   */
  async updateLesson(lessonId, updates) {
    try {
      console.log('📝 Оновлення уроку:', lessonId);
      
      const { error } = await supabase
        .from('calendar_lessons')
        .update({
          title: updates.title,
          student_email: updates.studentEmail,
          date: updates.date,
          time: updates.time,
          notes: updates.notes
        })
        .eq('id', lessonId);
      
      if (error) throw error;
      
      console.log('✅ Урок оновлено');
      return true;
      
    } catch (error) {
      console.error('❌ Помилка оновлення уроку:', error);
      return false;
    }
  }

  /**
   * Видалення уроку
   * @param {string} lessonId - ID уроку
   * @returns {Promise<boolean>} Успішність операції
   */
  async deleteLesson(lessonId) {
    try {
      console.log('🗑️ Видалення уроку:', lessonId);
      
      const { error } = await supabase
        .from('calendar_lessons')
        .delete()
        .eq('id', lessonId);
      
      if (error) throw error;
      
      console.log('✅ Урок видалено');
      return true;
      
    } catch (error) {
      console.error('❌ Помилка видалення уроку:', error);
      return false;
    }
  }

  /**
   * Отримання уроків для конкретного учня
   * @param {string} studentEmail - Email учня
   * @returns {Promise<Array>} Масив уроків учня
   */
  async getLessonsByStudent(studentEmail) {
    try {
      const { data, error } = await supabase
        .from('calendar_lessons')
        .select('*')
        .eq('student_email', studentEmail)
        .order('date', { ascending: true });
      
      if (error) throw error;
      
      return data || [];
      
    } catch (error) {
      console.error('❌ Помилка отримання уроків учня:', error);
      return [];
    }
  }

  /**
   * Отримання уроків за період
   * @param {string} startDate - Початкова дата (YYYY-MM-DD)
   * @param {string} endDate - Кінцева дата (YYYY-MM-DD)
   * @returns {Promise<Array>} Масив уроків
   */
  async getLessonsByDateRange(startDate, endDate) {
    try {
      const { data, error } = await supabase
        .from('calendar_lessons')
        .select('*')
        .gte('date', startDate)
        .lte('date', endDate)
        .order('date', { ascending: true });
      
      if (error) throw error;
      
      return data || [];
      
    } catch (error) {
      console.error('❌ Помилка отримання уроків за період:', error);
      return [];
    }
  }
}

const calendarService = new CalendarService();
export default calendarService;
