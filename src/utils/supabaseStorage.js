// src/utils/supabaseStorage.js
import { supabase } from '../config/supabase'

class SupabaseStorage {
  constructor() {
    this.useSupabase = supabase !== null
    if (this.useSupabase) {
      console.log('🗄️ Using Supabase storage')
    } else {
      console.log('📦 Using localStorage fallback')
    }
  }

  async saveProgress(userEmail, progressData) {
    if (!this.useSupabase) {
      // Fallback до localStorage
      localStorage.setItem(`progress:${userEmail}`, JSON.stringify(progressData))
      return { success: true }
    }

    try {
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
      return { success: true, data }
    } catch (error) {
      console.error('❌ Error saving to Supabase, using localStorage:', error)
      localStorage.setItem(`progress:${userEmail}`, JSON.stringify(progressData))
      return { success: true }
    }
  }

  async loadProgress(userEmail) {
    if (!this.useSupabase) {
      // Fallback до localStorage
      const data = localStorage.getItem(`progress:${userEmail}`)
      return { success: true, data: data ? JSON.parse(data) : null }
    }

    try {
      const { data, error } = await supabase
        .from('user_progress')
        .select('progress')
        .eq('user_email', userEmail)
        .single()

      if (error) {
        if (error.code === 'PGRST116') {
          return { success: true, data: null }
        }
        throw error
      }

      return { success: true, data: data.progress }
    } catch (error) {
      console.error('❌ Error loading from Supabase, using localStorage:', error)
      const data = localStorage.getItem(`progress:${userEmail}`)
      return { success: true, data: data ? JSON.parse(data) : null }
    }
  }

  async saveSession(sessionKey, sessionData) {
    if (!this.useSupabase) {
      localStorage.setItem(`session:${sessionKey}`, JSON.stringify(sessionData))
      return { success: true }
    }

    try {
      const { data, error } = await supabase
        .from('user_sessions')
        .upsert({
          user_email: sessionKey,
          session_data: sessionData,
          updated_at: new Date().toISOString()
        }, {
          onConflict: 'user_email'
        })
        .select()

      if (error) throw error
      return { success: true, data }
    } catch (error) {
      console.error('❌ Error saving session, using localStorage:', error)
      localStorage.setItem(`session:${sessionKey}`, JSON.stringify(sessionData))
      return { success: true }
    }
  }

  async loadSession(sessionKey) {
    if (!this.useSupabase) {
      const data = localStorage.getItem(`session:${sessionKey}`)
      return { success: true, data: data ? JSON.parse(data) : null }
    }

    try {
      const { data, error } = await supabase
        .from('user_sessions')
        .select('session_data')
        .eq('user_email', sessionKey)
        .single()

      if (error) {
        if (error.code === 'PGRST116') {
          return { success: true, data: null }
        }
        throw error
      }

      return { success: true, data: data.session_data }
    } catch (error) {
      console.error('❌ Error loading session, using localStorage:', error)
      const data = localStorage.getItem(`session:${sessionKey}`)
      return { success: true, data: data ? JSON.parse(data) : null }
    }
  }

  async deleteSession(sessionKey) {
    if (!this.useSupabase) {
      localStorage.removeItem(`session:${sessionKey}`)
      return { success: true }
    }

    try {
      const { error } = await supabase
        .from('user_sessions')
        .delete()
        .eq('user_email', sessionKey)

      if (error) throw error
      return { success: true }
    } catch (error) {
      console.error('❌ Error deleting session, using localStorage:', error)
      localStorage.removeItem(`session:${sessionKey}`)
      return { success: true }
    }
  }

  async saveTheme(isDarkMode) {
    localStorage.setItem('theme-mode', JSON.stringify({ isDarkMode }))
    return { success: true }
  }

  async loadTheme() {
    try {
      const theme = localStorage.getItem('theme-mode')
      return { success: true, data: theme ? JSON.parse(theme) : null }
    } catch (error) {
      return { success: false, data: null }
    }
  }

  async testConnection() {
    if (!this.useSupabase) {
      return { success: false, connected: false }
    }

    try {
      const { error } = await supabase
        .from('user_progress')
        .select('count')
        .limit(1)

      if (error) throw error
      return { success: true, connected: true }
    } catch (error) {
      return { success: false, connected: false, error: error.message }
    }
  }

  async migrateFromLocalStorage(userEmail) {
    return { success: true, migrated: false }
  }
}

const supabaseStorage = new SupabaseStorage()
export default supabaseStorage
