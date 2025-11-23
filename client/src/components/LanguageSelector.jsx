import React, { useState } from 'react';
import { getLanguageOptions } from '../../lib/languages';

const LanguageSelector = ({ onSelect, onClose, currentLang = 'en' }) => {
  const [searchQuery, setSearchQuery] = useState('');
  const languages = getLanguageOptions();

  // Filter languages based on search
  const filteredLanguages = languages.filter((lang) =>
    lang.name.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const handleSelect = (langCode) => {
    onSelect(langCode);
    onClose();
  };

  return (
    <div 
      className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50"
      onClick={onClose}
    >
      <div
        className="glass-morphism-strong rounded-2xl p-6 max-w-md w-full mx-4 border shadow-2xl"
        style={{ borderColor: 'var(--border-subtle)' }}
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-semibold" style={{ color: 'var(--text-primary)' }}>
            Translate to...
          </h3>
          <button
            onClick={onClose}
            className="p-2 rounded-lg hover:bg-[var(--bg-secondary)] transition-all duration-200"
          >
            <svg className="w-5 h-5" style={{ color: 'var(--text-muted)' }} fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        {/* Search Input */}
        <input
          type="text"
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          placeholder="Search languages..."
          className="w-full px-4 py-2 rounded-lg border-2 mb-4 transition-all duration-300"
          style={{
            background: 'var(--bg-secondary)',
            borderColor: 'var(--border-subtle)',
            color: 'var(--text-primary)',
          }}
          autoFocus
        />

        {/* Language List */}
        <div className="max-h-80 overflow-y-auto scrollbar-thin space-y-1">
          {filteredLanguages.length > 0 ? (
            filteredLanguages.map((lang) => (
              <button
                key={lang.code}
                onClick={() => handleSelect(lang.code)}
                className={`w-full text-left px-4 py-3 rounded-lg transition-all duration-200 hover:bg-[var(--bg-secondary)] ${
                  currentLang === lang.code ? 'bg-[var(--bg-secondary)]' : ''
                }`}
                style={{ color: 'var(--text-primary)' }}
              >
                <div className="flex items-center justify-between">
                  <span>{lang.name}</span>
                  {currentLang === lang.code && (
                    <svg className="w-5 h-5" style={{ color: 'var(--accent-primary)' }} fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                    </svg>
                  )}
                </div>
              </button>
            ))
          ) : (
            <p className="text-center py-8 opacity-60" style={{ color: 'var(--text-muted)' }}>
              No languages found
            </p>
          )}
        </div>
      </div>
    </div>
  );
};

export default LanguageSelector;
