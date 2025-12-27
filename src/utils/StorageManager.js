// src/utils/storageAdapter.js
/**
 * Universal Storage Adapter
 * Works with both Claude artifacts (window.storage) and real deployments (localStorage)
 */

class StorageAdapter {
  constructor() {
    // Detect which storage system is available
    this.isArtifact = typeof window !== 'undefined' && 
                      window.storage && 
                      typeof window.storage.get === 'function';
    
    console.log(`🔧 Storage mode: ${this.isArtifact ? 'Claude Artifact' : 'Browser localStorage'}`);
  }

  /**
   * Get value from storage
   */
  async get(key, shared = false) {
    try {
      if (this.isArtifact) {
        // Use Claude's window.storage
        return await window.storage.get(key, shared);
      } else {
        // Use localStorage
        const value = localStorage.getItem(key);
        return value ? { key, value, shared } : null;
      }
    } catch (error) {
      console.error(`❌ Storage get error for key "${key}":`, error);
      return null;
    }
  }

  /**
   * Set value in storage
   */
  async set(key, value, shared = false) {
    try {
      if (this.isArtifact) {
        // Use Claude's window.storage
        return await window.storage.set(key, value, shared);
      } else {
        // Use localStorage
        localStorage.setItem(key, value);
        return { key, value, shared };
      }
    } catch (error) {
      console.error(`❌ Storage set error for key "${key}":`, error);
      return null;
    }
  }

  /**
   * Delete value from storage
   */
  async delete(key, shared = false) {
    try {
      if (this.isArtifact) {
        // Use Claude's window.storage
        return await window.storage.delete(key, shared);
      } else {
        // Use localStorage
        localStorage.removeItem(key);
        return { key, deleted: true, shared };
      }
    } catch (error) {
      console.error(`❌ Storage delete error for key "${key}":`, error);
      return null;
    }
  }

  /**
   * List keys with optional prefix
   */
  async list(prefix = '', shared = false) {
    try {
      if (this.isArtifact) {
        // Use Claude's window.storage
        return await window.storage.list(prefix, shared);
      } else {
        // Use localStorage
        const keys = [];
        for (let i = 0; i < localStorage.length; i++) {
          const key = localStorage.key(i);
          if (!prefix || key.startsWith(prefix)) {
            keys.push(key);
          }
        }
        return { keys, prefix, shared };
      }
    } catch (error) {
      console.error(`❌ Storage list error:`, error);
      return { keys: [], prefix, shared };
    }
  }

  /**
   * Check if storage is available
   */
  isAvailable() {
    if (this.isArtifact) {
      return typeof window.storage !== 'undefined';
    } else {
      try {
        const test = '__storage_test__';
        localStorage.setItem(test, test);
        localStorage.removeItem(test);
        return true;
      } catch (e) {
        return false;
      }
    }
  }

  /**
   * Get storage type
   */
  getType() {
    return this.isArtifact ? 'artifact' : 'localStorage';
  }
}

// Export singleton instance
const storageInstance = new StorageAdapter();
export { storageInstance as storage };
export default storageInstance;
