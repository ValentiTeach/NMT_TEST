/**
 * StorageManager.js
 * Provides dual-storage mechanism (Versal + localStorage fallback)
 * for persistent user data management.
 * 
 * @module StorageManager
 * @description Manages persistent storage with primary support for Versal
 * and automatic fallback to localStorage if Versal is unavailable.
 */

class StorageManager {
  constructor() {
    this.versal = window.VERSAL || null;
    this.useVersal = this._isVersalAvailable();
    this.storageKey = 'nmt_user_data';
    this.cacheExpiry = 24 * 60 * 60 * 1000; // 24 hours in milliseconds
  }

  /**
   * Check if Versal is available and accessible
   * @private
   * @returns {boolean} True if Versal is available, false otherwise
   */
  _isVersalAvailable() {
    try {
      return (
        typeof window !== 'undefined' &&
        window.VERSAL &&
        typeof window.VERSAL.userData !== 'undefined'
      );
    } catch (error) {
      console.warn('Versal availability check failed:', error);
      return false;
    }
  }

  /**
   * Set a value in storage (Versal or localStorage)
   * @param {string} key - The key to store
   * @param {*} value - The value to store (will be stringified if necessary)
   * @param {Object} options - Optional configuration
   * @param {boolean} options.useCache - Whether to cache the value locally
   * @returns {Promise<boolean>} True if successful, false otherwise
   */
  async set(key, value, options = {}) {
    const { useCache = true } = options;
    const data = {
      value,
      timestamp: new Date().getTime(),
      expiry: new Date().getTime() + this.cacheExpiry
    };

    try {
      if (this.useVersal) {
        return await this._setVersal(key, data);
      } else {
        return this._setLocalStorage(key, data);
      }
    } catch (error) {
      console.error(`Failed to set value for key "${key}":`, error);
      // Fallback to localStorage if Versal fails
      if (this.useVersal) {
        try {
          return this._setLocalStorage(key, data);
        } catch (fallbackError) {
          console.error('Fallback storage also failed:', fallbackError);
          return false;
        }
      }
      return false;
    }
  }

  /**
   * Get a value from storage (Versal or localStorage)
   * @param {string} key - The key to retrieve
   * @param {Object} options - Optional configuration
   * @param {boolean} options.checkExpiry - Whether to check if value is expired
   * @returns {Promise<*>} The stored value or null if not found/expired
   */
  async get(key, options = {}) {
    const { checkExpiry = true } = options;

    try {
      let data;
      if (this.useVersal) {
        data = await this._getVersal(key);
      } else {
        data = this._getLocalStorage(key);
      }

      if (!data) {
        return null;
      }

      // Check if data has expired
      if (checkExpiry && data.expiry && data.expiry < new Date().getTime()) {
        await this.remove(key);
        return null;
      }

      return data.value;
    } catch (error) {
      console.error(`Failed to get value for key "${key}":`, error);
      // Fallback to localStorage if Versal fails
      if (this.useVersal) {
        try {
          const data = this._getLocalStorage(key);
          if (data && (!checkExpiry || !data.expiry || data.expiry >= new Date().getTime())) {
            return data.value;
          }
        } catch (fallbackError) {
          console.error('Fallback retrieval also failed:', fallbackError);
        }
      }
      return null;
    }
  }

  /**
   * Remove a value from storage
   * @param {string} key - The key to remove
   * @returns {Promise<boolean>} True if successful, false otherwise
   */
  async remove(key) {
    try {
      if (this.useVersal) {
        return await this._removeVersal(key);
      } else {
        return this._removeLocalStorage(key);
      }
    } catch (error) {
      console.error(`Failed to remove key "${key}":`, error);
      // Attempt fallback removal
      if (this.useVersal) {
        try {
          return this._removeLocalStorage(key);
        } catch (fallbackError) {
          console.error('Fallback removal also failed:', fallbackError);
          return false;
        }
      }
      return false;
    }
  }

  /**
   * Clear all stored data
   * @returns {Promise<boolean>} True if successful, false otherwise
   */
  async clear() {
    try {
      if (this.useVersal) {
        return await this._clearVersal();
      } else {
        return this._clearLocalStorage();
      }
    } catch (error) {
      console.error('Failed to clear storage:', error);
      if (this.useVersal) {
        try {
          return this._clearLocalStorage();
        } catch (fallbackError) {
          console.error('Fallback clear also failed:', fallbackError);
          return false;
        }
      }
      return false;
    }
  }

  /**
   * Get all stored keys
   * @returns {Promise<string[]>} Array of stored keys
   */
  async keys() {
    try {
      if (this.useVersal) {
        return await this._getVersalKeys();
      } else {
        return this._getLocalStorageKeys();
      }
    } catch (error) {
      console.error('Failed to retrieve keys:', error);
      return [];
    }
  }

  // ============= VERSAL METHODS =============

  /**
   * Set value in Versal storage
   * @private
   */
  async _setVersal(key, data) {
    return new Promise((resolve) => {
      try {
        window.VERSAL.userData.set(
          this._buildVersalKey(key),
          JSON.stringify(data),
          () => resolve(true)
        );
      } catch (error) {
        console.error('Versal set error:', error);
        resolve(false);
      }
    });
  }

  /**
   * Get value from Versal storage
   * @private
   */
  async _getVersal(key) {
    return new Promise((resolve) => {
      try {
        window.VERSAL.userData.get(this._buildVersalKey(key), (value) => {
          if (value) {
            try {
              resolve(JSON.parse(value));
            } catch (parseError) {
              console.error('Versal parse error:', parseError);
              resolve(null);
            }
          } else {
            resolve(null);
          }
        });
      } catch (error) {
        console.error('Versal get error:', error);
        resolve(null);
      }
    });
  }

  /**
   * Remove value from Versal storage
   * @private
   */
  async _removeVersal(key) {
    return new Promise((resolve) => {
      try {
        window.VERSAL.userData.remove(this._buildVersalKey(key), () => resolve(true));
      } catch (error) {
        console.error('Versal remove error:', error);
        resolve(false);
      }
    });
  }

  /**
   * Clear all Versal storage
   * @private
   */
  async _clearVersal() {
    try {
      const keys = await this._getVersalKeys();
      for (const key of keys) {
        await this._removeVersal(key);
      }
      return true;
    } catch (error) {
      console.error('Versal clear error:', error);
      return false;
    }
  }

  /**
   * Get all keys from Versal
   * @private
   */
  async _getVersalKeys() {
    return new Promise((resolve) => {
      try {
        // Versal doesn't provide a direct keys method, so we track them manually
        const keys = JSON.parse(localStorage.getItem('_nmt_versal_keys') || '[]');
        resolve(keys);
      } catch (error) {
        console.error('Versal keys retrieval error:', error);
        resolve([]);
      }
    });
  }

  /**
   * Build properly namespaced key for Versal
   * @private
   */
  _buildVersalKey(key) {
    return `${this.storageKey}_${key}`;
  }

  // ============= LOCALSTORAGE METHODS =============

  /**
   * Set value in localStorage
   * @private
   */
  _setLocalStorage(key, data) {
    try {
      localStorage.setItem(
        this._buildLocalStorageKey(key),
        JSON.stringify(data)
      );
      // Track keys for easy retrieval
      this._trackLocalStorageKey(key);
      return true;
    } catch (error) {
      console.error('localStorage set error:', error);
      return false;
    }
  }

  /**
   * Get value from localStorage
   * @private
   */
  _getLocalStorage(key) {
    try {
      const value = localStorage.getItem(this._buildLocalStorageKey(key));
      return value ? JSON.parse(value) : null;
    } catch (error) {
      console.error('localStorage get error:', error);
      return null;
    }
  }

  /**
   * Remove value from localStorage
   * @private
   */
  _removeLocalStorage(key) {
    try {
      localStorage.removeItem(this._buildLocalStorageKey(key));
      this._untrackLocalStorageKey(key);
      return true;
    } catch (error) {
      console.error('localStorage remove error:', error);
      return false;
    }
  }

  /**
   * Clear all localStorage data
   * @private
   */
  _clearLocalStorage() {
    try {
      const keys = this._getLocalStorageKeys();
      for (const key of keys) {
        localStorage.removeItem(this._buildLocalStorageKey(key));
      }
      localStorage.removeItem('_nmt_storage_keys');
      return true;
    } catch (error) {
      console.error('localStorage clear error:', error);
      return false;
    }
  }

  /**
   * Get all keys from localStorage
   * @private
   */
  _getLocalStorageKeys() {
    try {
      const keys = JSON.parse(localStorage.getItem('_nmt_storage_keys') || '[]');
      return keys;
    } catch (error) {
      console.error('localStorage keys retrieval error:', error);
      return [];
    }
  }

  /**
   * Track key in localStorage key registry
   * @private
   */
  _trackLocalStorageKey(key) {
    try {
      const keys = this._getLocalStorageKeys();
      if (!keys.includes(key)) {
        keys.push(key);
        localStorage.setItem('_nmt_storage_keys', JSON.stringify(keys));
      }
    } catch (error) {
      console.error('Error tracking key:', error);
    }
  }

  /**
   * Untrack key from localStorage key registry
   * @private
   */
  _untrackLocalStorageKey(key) {
    try {
      const keys = this._getLocalStorageKeys();
      const index = keys.indexOf(key);
      if (index > -1) {
        keys.splice(index, 1);
        localStorage.setItem('_nmt_storage_keys', JSON.stringify(keys));
      }
    } catch (error) {
      console.error('Error untracking key:', error);
    }
  }

  /**
   * Build properly namespaced key for localStorage
   * @private
   */
  _buildLocalStorageKey(key) {
    return `${this.storageKey}_${key}`;
  }

  // ============= UTILITY METHODS =============

  /**
   * Get storage status (which backend is being used)
   * @returns {Object} Storage status information
   */
  getStatus() {
    return {
      backend: this.useVersal ? 'Versal' : 'localStorage',
      versalAvailable: this._isVersalAvailable(),
      localStorageAvailable: this._isLocalStorageAvailable(),
      timestamp: new Date().toISOString()
    };
  }

  /**
   * Check if localStorage is available
   * @private
   */
  _isLocalStorageAvailable() {
    try {
      const testKey = '__nmt_storage_test__';
      localStorage.setItem(testKey, 'test');
      localStorage.removeItem(testKey);
      return true;
    } catch (error) {
      return false;
    }
  }

  /**
   * Set user profile data
   * @param {Object} profile - User profile object
   * @returns {Promise<boolean>} Success status
   */
  async setUserProfile(profile) {
    return this.set('user_profile', profile);
  }

  /**
   * Get user profile data
   * @returns {Promise<Object|null>} User profile or null
   */
  async getUserProfile() {
    return this.get('user_profile');
  }

  /**
   * Set user preferences
   * @param {Object} preferences - User preferences object
   * @returns {Promise<boolean>} Success status
   */
  async setUserPreferences(preferences) {
    return this.set('user_preferences', preferences);
  }

  /**
   * Get user preferences
   * @returns {Promise<Object|null>} User preferences or null
   */
  async getUserPreferences() {
    return this.get('user_preferences');
  }

  /**
   * Set session data
   * @param {Object} session - Session data object
   * @returns {Promise<boolean>} Success status
   */
  async setSessionData(session) {
    return this.set('session_data', session);
  }

  /**
   * Get session data
   * @returns {Promise<Object|null>} Session data or null
   */
  async getSessionData() {
    return this.get('session_data');
  }
}

// Export as singleton instance
const storageManager = new StorageManager();

export default storageManager;

// Named export for class definition
export { StorageManager };
