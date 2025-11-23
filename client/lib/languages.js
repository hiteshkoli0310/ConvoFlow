/**
 * Popular languages supported by MyMemory API
 * Format: { code: 'Language Name' }
 */
export const SUPPORTED_LANGUAGES = {
  'en': 'English',
  'es': 'Spanish',
  'fr': 'French',
  'de': 'German',
  'it': 'Italian',
  'pt': 'Portuguese',
  'ru': 'Russian',
  'ja': 'Japanese',
  'ko': 'Korean',
  'zh': 'Chinese (Simplified)',
  'ar': 'Arabic',
  'hi': 'Hindi',
  'tr': 'Turkish',
  'nl': 'Dutch',
  'pl': 'Polish',
  'sv': 'Swedish',
  'da': 'Danish',
  'fi': 'Finnish',
  'no': 'Norwegian',
  'cs': 'Czech',
  'el': 'Greek',
  'he': 'Hebrew',
  'id': 'Indonesian',
  'th': 'Thai',
  'vi': 'Vietnamese',
  'uk': 'Ukrainian',
  'ro': 'Romanian',
  'hu': 'Hungarian',
  'bg': 'Bulgarian',
  'fa': 'Persian',
};

/**
 * Get language name from code
 */
export function getLanguageName(code) {
  return SUPPORTED_LANGUAGES[code] || code.toUpperCase();
}

/**
 * Get sorted language array for dropdowns
 */
export function getLanguageOptions() {
  return Object.entries(SUPPORTED_LANGUAGES)
    .sort((a, b) => a[1].localeCompare(b[1]))
    .map(([code, name]) => ({ code, name }));
}
