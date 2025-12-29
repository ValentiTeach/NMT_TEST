// src/utils/supabaseStorage.js
/**
 * Supabase Storage Adapter
 * Заміна для storageAdapter.js з підтримкою cloud бази даних
 */

import { supabase } from '../config/supabase'

class SupabaseStorage {
  constructor() {
    console.log('🗄️ Supabase Storage initialized')
  }

  /**
   * Зберегти прогрес користувача
   */
  async saveProgress(userEmail, progressData) {
    try {
      console.log('💾 Saving progress for:', userEmail)
      
      const { data, error } = await supabase
        .from('user_progress')
        .upsert({
          user_email: userEmail,
          progress: progressData,
          updated_at: new Date().toISOString()
        }, {
          onConflict: 'user_email'
        })
        .select()

      if (error) throw error

      console.log('✅ Progress saved successfully:', data)
      return { success: true, data }
    } catch (error) {
      console.error('❌ Error saving progress:', error)
      return { success: false, error: error.message }
    }
  }

  /**
   * Завантажити прогрес користувача
   */
  async loadProgress(userEmail) {
    try {
      console.log('📥 Loading progress for:', userEmail)
      
      const { data, error } = await supabase
        .from('user_progress')
        .select('progress')
        .eq('user_email', userEmail)
        .single()

      if (error) {
        if (error.code === 'PGRST116') {
          // Користувача не знайдено - це нормально для нових користувачів
          console.log('ℹ️ No progress found for new user:', userEmail)
          return { success: true, data: null }
        }
        throw error
      }

      console.log('✅ Progress loaded successfully:', data)
      return { success: true, data: data.progress }
    } catch (error) {
      console.error('❌ Error loading progress:', error)
      return { success: false, error: error.message, data: null }
    }
  }

  /**
   * Зберегти сесію користувача
   */
  async saveSession(userEmail, sessionData) {
    try {
      console.log('💾 Saving session for:', userEmail)
      
      const { data, error } = await supabase
        .from('user_sessions')
        .upsert({
          user_email: userEmail,
          session_data: sessionData,
          updated_at: new Date().toISOString()
        }, {
          onConflict: 'user_email'
        })
        .select()

      if (error) throw error

      console.log('✅ Session saved successfully')
      return { success: true, data }
    } catch (error) {
      console.error('❌ Error saving session:', error)
      return { success: false, error: error.message }
    }
  }

  /**
   * Завантажити сесію користувача
   */
  async loadSession(userEmail) {
    try {
      console.log('📥 Loading session for:', userEmail)
      
      const { data, error } = await supabase
        .from('user_sessions')
        .select('session_data')
        .eq('user_email', userEmail)
        .single()

      if (error) {
        if (error.code === 'PGRST116') {
          console.log('ℹ️ No session found for user:', userEmail)
          return { success: true, data: null }
        }
        throw error
      }

      console.log('✅ Session loaded successfully')
      return { success: true, data: data.session_data }
    } catch (error) {
      console.error('❌ Error loading session:', error)
      return { success: false, error: error.message, data: null }
    }
  }

  /**
   * Видалити сесію користувача (logout)
   */
  async deleteSession(userEmail) {
    try {
      console.log('🗑️ Deleting session for:', userEmail)
      
      const { error } = await supabase
        .from('user_sessions')
        .delete()
        .eq('user_email', userEmail)

      if (error) throw error

      console.log('✅ Session deleted successfully')
      return { success: true }
    } catch (error) {
      console.error('❌ Error deleting session:', error)
      return { success: false, error: error.message }
    }
  }

  /**
   * Зберегти налаштування теми
   */
  async saveTheme(isDarkMode) {
    try {
      // Зберігаємо тему в localStorage (не потребує БД)
      localStorage.setItem('theme-mode', JSON.stringify({ isDarkMode }))
      return { success: true }
    } catch (error) {
      console.error('❌ Error saving theme:', error)
      return { success: false }
    }
  }

  /**
   * Завантажити налаштування теми
   */
  async loadTheme() {
    try {
      const theme = localStorage.getItem('theme-mode')
      if (theme) {
        return { success: true, data: JSON.parse(theme) }
      }
      return { success: true, data: null }
    } catch (error) {
      console.error('❌ Error loading theme:', error)
      return { success: false, data: null }
    }
  }

  /**
   * Перевірка з'єднання з Supabase
   */
  async testConnection() {
    try {
      const { data, error } = await supabase
        .from('user_progress')
        .select('count')
        .limit(1)

      if (error) throw error

      console.log('✅ Supabase connection OK')
      return { success: true, connected: true }
    } catch (error) {
      console.error('❌ Supabase connection failed:', error)
      return { success: false, connected: false, error: error.message }
    }
  }

  /**
   * Міграція даних з localStorage до Supabase
   */
  async migrateFromLocalStorage(userEmail) {
    try {
      console.log('🔄 Starting migration from localStorage for:', userEmail)
      
      // Спробувати знайти старі дані в localStorage
      const oldProgressKey = `progress:${userEmail}`
      const oldProgress = localStorage.getItem(oldProgressKey)

      if (oldProgress) {
        const progressData = JSON.parse(oldProgress)
        console.log('📦 Found old progress data:', progressData)

        // Зберегти в Supabase
        const result = await this.saveProgress(userEmail, progressData)
        
        if (result.success) {
          // Видалити старі дані з localStorage
          localStorage.removeItem(oldProgressKey)
          console.log('✅ Migration completed successfully')
          return { success: true, migrated: true }
        }
      }

      console.log('ℹ️ No old data to migrate')
      return { success: true, migrated: false }
    } catch (error) {
      console.error('❌ Migration error:', error)
      return { success: false, error: error.message }
    }
  }

  /**
   * Отримати всю статистику користувача
   */
  async getUserStats(userEmail) {
    try {
      const { data, error } = await supabase
        .from('user_progress')
        .select('progress, created_at, updated_at')
        .eq('user_email', userEmail)
        .single()

      if (error) throw error

      return {
        success: true,
        stats: {
          progress: data.progress,
          createdAt: data.created_at,
          updatedAt: data.updated_at
        }
      }
    } catch (error) {
      console.error('❌ Error getting stats:', error)
      return { success: false, error: error.message }
    }
  }
}

// Export singleton
const supabaseStorage = new SupabaseStorage()
export default supabaseStorage
