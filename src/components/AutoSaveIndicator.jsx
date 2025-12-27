import React, { useState, useEffect } from 'react';
import './AutoSaveIndicator.css';

/**
 * AutoSaveIndicator Component
 * Displays a visual indicator for the auto-save status of the application.
 * 
 * States:
 * - idle: No auto-save activity
 * - saving: Currently saving changes
 * - saved: Changes have been successfully saved
 * - error: An error occurred during saving
 */
const AutoSaveIndicator = ({ isSaving = false, hasError = false, lastSaved = null }) => {
  const [status, setStatus] = useState('idle');
  const [displayMessage, setDisplayMessage] = useState('');

  useEffect(() => {
    if (hasError) {
      setStatus('error');
      setDisplayMessage('Auto-save failed');
    } else if (isSaving) {
      setStatus('saving');
      setDisplayMessage('Auto-saving...');
    } else if (lastSaved) {
      setStatus('saved');
      setDisplayMessage('All changes saved');
      
      // Reset to idle after 3 seconds
      const timer = setTimeout(() => {
        setStatus('idle');
        setDisplayMessage('');
      }, 3000);
      
      return () => clearTimeout(timer);
    } else {
      setStatus('idle');
      setDisplayMessage('');
    }
  }, [isSaving, hasError, lastSaved]);

  const getStatusIcon = () => {
    switch (status) {
      case 'saving':
        return (
          <svg className="auto-save-icon spinner" viewBox="0 0 24 24" fill="none" stroke="currentColor">
            <circle cx="12" cy="12" r="10" strokeWidth="2" />
            <path d="M12 2a10 10 0 0 1 10 10" strokeWidth="2" strokeLinecap="round" />
          </svg>
        );
      case 'saved':
        return (
          <svg className="auto-save-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor">
            <polyline points="20 6 9 17 4 12" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
          </svg>
        );
      case 'error':
        return (
          <svg className="auto-save-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor">
            <circle cx="12" cy="12" r="10" strokeWidth="2" />
            <line x1="15" y1="9" x2="9" y2="15" strokeWidth="2" strokeLinecap="round" />
            <line x1="9" y1="9" x2="15" y2="15" strokeWidth="2" strokeLinecap="round" />
          </svg>
        );
      default:
        return null;
    }
  };

  const getLastSavedTime = () => {
    if (!lastSaved) return '';
    
    const now = new Date();
    const diff = Math.floor((now - new Date(lastSaved)) / 1000);
    
    if (diff < 60) {
      return 'just now';
    } else if (diff < 3600) {
      const minutes = Math.floor(diff / 60);
      return `${minutes} minute${minutes > 1 ? 's' : ''} ago`;
    } else if (diff < 86400) {
      const hours = Math.floor(diff / 3600);
      return `${hours} hour${hours > 1 ? 's' : ''} ago`;
    } else {
      return new Date(lastSaved).toLocaleDateString();
    }
  };

  if (!displayMessage && status === 'idle') {
    return null;
  }

  return (
    <div className={`auto-save-indicator auto-save-${status}`}>
      <div className="auto-save-content">
        {getStatusIcon()}
        <div className="auto-save-text">
          <span className="auto-save-message">{displayMessage}</span>
          {lastSaved && status !== 'saving' && (
            <span className="auto-save-timestamp">{getLastSavedTime()}</span>
          )}
        </div>
      </div>
    </div>
  );
};

export default AutoSaveIndicator;
