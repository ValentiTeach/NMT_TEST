/**
 * UserDataService.js
 * 
 * Service for managing user data persistence using Versal storage API
 * Provides methods for storing, retrieving, and managing user data
 * 
 * Created: 2025-12-27 08:28:17 UTC
 * Author: ValentiTeach
 */

class UserDataService {
  constructor() {
    this.storageKey = 'user_data';
    this.initialized = false;
    this.versalStorage = null;
  }

  /**
   * Initialize the service with Versal storage API
   * @param {Object} versalStorage - Versal storage instance
   * @returns {Promise<boolean>} True if initialization successful
   */
  async initialize(versalStorage) {
    try {
      this.versalStorage = versalStorage;
      this.initialized = true;
      console.log('UserDataService initialized successfully');
      return true;
    } catch (error) {
      console.error('Failed to initialize UserDataService:', error);
      return false;
    }
  }

  /**
   * Save user data to Versal storage
   * @param {string} userId - User identifier
   * @param {Object} userData - User data object to persist
   * @returns {Promise<boolean>} True if save successful
   */
  async saveUserData(userId, userData) {
    if (!this.initialized || !this.versalStorage) {
      throw new Error('UserDataService not initialized');
    }

    try {
      const key = `${this.storageKey}:${userId}`;
      const dataWithTimestamp = {
        ...userData,
        lastModified: new Date().toISOString(),
        userId: userId
      };

      await this.versalStorage.setObject(key, dataWithTimestamp);
      console.log(`User data saved for user: ${userId}`);
      return true;
    } catch (error) {
      console.error(`Error saving user data for ${userId}:`, error);
      throw error;
    }
  }

  /**
   * Retrieve user data from Versal storage
   * @param {string} userId - User identifier
   * @returns {Promise<Object|null>} User data object or null if not found
   */
  async getUserData(userId) {
    if (!this.initialized || !this.versalStorage) {
      throw new Error('UserDataService not initialized');
    }

    try {
      const key = `${this.storageKey}:${userId}`;
      const userData = await this.versalStorage.getObject(key);
      
      if (userData) {
        console.log(`User data retrieved for user: ${userId}`);
        return userData;
      }
      
      console.log(`No data found for user: ${userId}`);
      return null;
    } catch (error) {
      console.error(`Error retrieving user data for ${userId}:`, error);
      throw error;
    }
  }

  /**
   * Update specific fields in user data
   * @param {string} userId - User identifier
   * @param {Object} updates - Fields to update
   * @returns {Promise<Object>} Updated user data
   */
  async updateUserData(userId, updates) {
    if (!this.initialized || !this.versalStorage) {
      throw new Error('UserDataService not initialized');
    }

    try {
      const existingData = await this.getUserData(userId);
      const mergedData = {
        ...(existingData || {}),
        ...updates,
        lastModified: new Date().toISOString(),
        userId: userId
      };

      await this.saveUserData(userId, mergedData);
      return mergedData;
    } catch (error) {
      console.error(`Error updating user data for ${userId}:`, error);
      throw error;
    }
  }

  /**
   * Delete user data from Versal storage
   * @param {string} userId - User identifier
   * @returns {Promise<boolean>} True if deletion successful
   */
  async deleteUserData(userId) {
    if (!this.initialized || !this.versalStorage) {
      throw new Error('UserDataService not initialized');
    }

    try {
      const key = `${this.storageKey}:${userId}`;
      await this.versalStorage.remove(key);
      console.log(`User data deleted for user: ${userId}`);
      return true;
    } catch (error) {
      console.error(`Error deleting user data for ${userId}:`, error);
      throw error;
    }
  }

  /**
   * Clear all user data for a given user
   * @param {string} userId - User identifier
   * @returns {Promise<boolean>} True if clear successful
   */
  async clearUserData(userId) {
    return this.deleteUserData(userId);
  }

  /**
   * Check if user data exists
   * @param {string} userId - User identifier
   * @returns {Promise<boolean>} True if user data exists
   */
  async userDataExists(userId) {
    try {
      const userData = await this.getUserData(userId);
      return userData !== null;
    } catch (error) {
      console.error(`Error checking user data existence for ${userId}:`, error);
      return false;
    }
  }

  /**
   * Get all keys for a user (pattern matching)
   * @param {string} userIdPattern - User identifier pattern
   * @returns {Promise<Array>} Array of matching keys
   */
  async getUserDataKeys(userIdPattern = '') {
    if (!this.initialized || !this.versalStorage) {
      throw new Error('UserDataService not initialized');
    }

    try {
      const pattern = userIdPattern 
        ? `${this.storageKey}:${userIdPattern}*`
        : `${this.storageKey}:*`;
      
      const keys = await this.versalStorage.getKeys(pattern);
      return keys || [];
    } catch (error) {
      console.error('Error retrieving user data keys:', error);
      throw error;
    }
  }

  /**
   * Bulk save multiple users' data
   * @param {Array<{userId: string, data: Object}>} usersData - Array of user data objects
   * @returns {Promise<Array>} Array of results
   */
  async bulkSaveUserData(usersData) {
    if (!this.initialized || !this.versalStorage) {
      throw new Error('UserDataService not initialized');
    }

    try {
      const results = await Promise.all(
        usersData.map(({ userId, data }) => 
          this.saveUserData(userId, data).catch(error => ({
            userId,
            success: false,
            error: error.message
          }))
        )
      );
      
      console.log(`Bulk save completed for ${usersData.length} users`);
      return results;
    } catch (error) {
      console.error('Error in bulk save operation:', error);
      throw error;
    }
  }

  /**
   * Bulk retrieve multiple users' data
   * @param {Array<string>} userIds - Array of user identifiers
   * @returns {Promise<Object>} Object mapping userIds to their data
   */
  async bulkGetUserData(userIds) {
    if (!this.initialized || !this.versalStorage) {
      throw new Error('UserDataService not initialized');
    }

    try {
      const results = {};
      
      const data = await Promise.all(
        userIds.map(userId => 
          this.getUserData(userId).catch(error => ({
            error: error.message
          }))
        )
      );

      userIds.forEach((userId, index) => {
        results[userId] = data[index];
      });

      console.log(`Bulk retrieval completed for ${userIds.length} users`);
      return results;
    } catch (error) {
      console.error('Error in bulk retrieval operation:', error);
      throw error;
    }
  }

  /**
   * Export user data as JSON
   * @param {string} userId - User identifier
   * @returns {Promise<string>} JSON string of user data
   */
  async exportUserDataAsJson(userId) {
    try {
      const userData = await this.getUserData(userId);
      if (userData) {
        return JSON.stringify(userData, null, 2);
      }
      return null;
    } catch (error) {
      console.error(`Error exporting user data for ${userId}:`, error);
      throw error;
    }
  }

  /**
   * Import user data from JSON
   * @param {string} userId - User identifier
   * @param {string} jsonData - JSON string of user data
   * @returns {Promise<Object>} Imported user data
   */
  async importUserDataFromJson(userId, jsonData) {
    try {
      const userData = JSON.parse(jsonData);
      await this.saveUserData(userId, userData);
      return userData;
    } catch (error) {
      console.error(`Error importing user data for ${userId}:`, error);
      throw error;
    }
  }

  /**
   * Get service initialization status
   * @returns {boolean} Initialization status
   */
  isInitialized() {
    return this.initialized;
  }

  /**
   * Reset the service
   * @returns {void}
   */
  reset() {
    this.versalStorage = null;
    this.initialized = false;
    console.log('UserDataService reset');
  }
}

// Export as singleton or class
module.exports = UserDataService;
