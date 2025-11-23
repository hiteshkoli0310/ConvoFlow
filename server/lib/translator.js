import axios from 'axios';

/**
 * Translate text using MyMemory API (Free - 10k words/day)
 * @param {string} text - Text to translate
 * @param {string} targetLang - Target language code (e.g., 'es', 'fr')
 * @param {string} sourceLang - Source language code (default: auto-detect)
 */
export async function translateText(text, targetLang, sourceLang = 'auto') {
  try {
    // Validate input
    if (!text || text.trim().length === 0) {
      throw new Error('Text cannot be empty');
    }

    if (!targetLang) {
      throw new Error('Target language is required');
    }

    let detectedSourceLang = sourceLang;
    
    // If auto-detection is requested, detect the language using heuristics
    if (sourceLang === 'auto') {
      detectedSourceLang = detectLanguageSync(text);
    }

    // Build language pair with detected/specified source language
    const langPair = `${detectedSourceLang}|${targetLang}`;
    
    // MyMemory API endpoint
    const url = 'https://api.mymemory.translated.net/get';
    
    const response = await axios.get(url, {
      params: {
        q: text,
        langpair: langPair,
      },
      timeout: 10000, // 10 second timeout
    });

    // Extract translation from response
    const translatedText = response.data?.responseData?.translatedText;

    if (!translatedText) {
      throw new Error('Translation failed');
    }

    return {
      success: true,
      translatedText,
      detectedSourceLang,
      targetLang,
    };
  } catch (error) {
    console.error('Translation error:', error.message);
    
    // Handle specific errors
    if (error.code === 'ECONNABORTED') {
      return {
        success: false,
        error: 'Translation service timeout. Please try again.',
      };
    }

    return {
      success: false,
      error: error.response?.data?.message || error.message || 'Translation failed',
    };
  }
}

/**
 * Detect language of text using a simple heuristic approach (synchronous)
 * @param {string} text - Text to detect language
 * @returns {string} - Detected language code
 */
function detectLanguageSync(text) {
  try {
    if (!text || text.trim().length === 0) {
      return 'en';
    }

    // Simple heuristic detection based on character patterns
    const text_sample = text.slice(0, 100).toLowerCase();
    
    // Check for common patterns
    if (/[\u4e00-\u9fa5]/.test(text_sample)) return 'zh'; // Chinese
    if (/[\u0600-\u06FF]/.test(text_sample)) return 'ar'; // Arabic
    if (/[\u0400-\u04FF]/.test(text_sample)) return 'ru'; // Russian
    if (/[\u0900-\u097F]/.test(text_sample)) return 'hi'; // Hindi
    if (/[\u3040-\u309F]/.test(text_sample)) return 'ja'; // Japanese (Hiragana)
    if (/[\u30A0-\u30FF]/.test(text_sample)) return 'ja'; // Japanese (Katakana)
    if (/[\uAC00-\uD7AF]/.test(text_sample)) return 'ko'; // Korean
    if (/[\u0E00-\u0E7F]/.test(text_sample)) return 'th'; // Thai
    if (/[\u0590-\u05FF]/.test(text_sample)) return 'he'; // Hebrew
    if (/[\u0370-\u03FF]/.test(text_sample)) return 'el'; // Greek
    
    // For Latin-based languages, check common words
    const commonSpanish = /\b(el|la|de|que|y|a|en|un|ser|se|no|haber|por|con|su|para|como|estar|tener|le|lo|todo|pero|más|hacer|o|poder|decir|este|ir|otro|ese|la|si|me|ya|ver|porque|dar|cuando|él|muy|sin|vez|mucho|saber|qué|sobre|mi|alguno|mismo|yo|también|hasta|año|dos|querer|entre|así|primero|desde|grande|eso|ni|nos|llegar|pasar|tiempo|ella|sí|día|uno|bien|poco|deber|entonces|poner|cosa|tanto|hombre|parecer|nuestro|tan|donde|ahora|parte|después|vida|quedar|siempre|creer|hablar|llevar|dejar|nada|cada|seguir|menos|nuevo|encontrar|algo|solo|decir|casa|mundo|país|último|momento|caso|mujer|ello|mal|pesar|pensar|tratar|venir|mismo|gente|bueno|tres|propio|cuenta|misma|medio|manera|tal)\b/i;
    const commonFrench = /\b(le|de|un|être|et|à|il|avoir|ne|je|son|que|se|qui|ce|dans|en|du|elle|au|pour|pas|que|vous|par|sur|faire|plus|dire|me|on|mon|lui|nous|comme|mais|pouvoir|avec|tout|y|aller|voir|en|bien|où|sans|tu|ou|leur|homme|si|deux|même|autre|vouloir|tout|aussi|bien|grand|chose|femme|trois|jour|fois|moins|aimer|ni|rien|pays|vie|tant|elle|très|temps|nouveau|jamais|long|quatre|monde|possible|déjà|jeune|entre|suivre|toute|petit)\b/i;
    const commonGerman = /\b(der|die|und|in|den|von|zu|das|mit|sich|des|auf|für|ist|im|dem|nicht|ein|eine|als|auch|es|an|werden|aus|er|hat|dass|sie|nach|wird|bei|einer|um|am|sind|noch|wie|einem|über|einen|so|zum|war|haben|nur|oder|aber|vor|zur|bis|mehr|durch|man|sein|wurde|sei|in|prozent|hatte|kann|gegen|vom|können|schon|wenn|habe|seine|mark|ihre|dann|unter|wir|soll|ich|eines|es|jahr|zwei|jahren|diese|dieser|wieder|keine|seinen|wo|machen|viel|kein|deutschland|aller|wurde|allen|zwischen|immer|etwas|ganz|deutschland|allerdings|alle)\b/i;
    const commonItalian = /\b(il|di|e|la|che|per|un|a|da|in|del|nel|al|le|con|non|alla|si|dei|gli|ha|più|su|delle|dalla|questa|della|può|nelle|ai|nel|anche|dalla|sono|essere|tra|tutti|se|fra|nelle|nelle|cosa|oltre|dall|allo|questi|tutto|altro|altri|dopo|nei|quindi|sempre|sia|molto|tre|prima|solo|anni|oggi|due|fatto|altro|come|anno|così|tra|senza|ancora|già|fare|grande|mai|mentre|modo|primo|vita|volta)\b/i;
    const commonPortuguese = /\b(o|a|de|que|e|do|da|em|um|para|é|com|não|uma|os|no|se|na|por|mais|as|dos|como|mas|foi|ao|ele|das|tem|à|seu|sua|ou|ser|quando|muito|há|nos|já|está|eu|também|só|pelo|pela|até|isso|ela|entre|era|depois|sem|mesmo|aos|ter|seus|quem|nas|me|esse|eles|estão|você|tinha|foram|essa|num|nem|suas|meu|às|minha|têm|numa|pelos|elas|havia|seja|qual|será|nós|tenho|lhe|deles|essas|esses|pelas|este|fosse|dele)\b/i;
    
    if (commonSpanish.test(text_sample)) return 'es';
    if (commonFrench.test(text_sample)) return 'fr';
    if (commonGerman.test(text_sample)) return 'de';
    if (commonItalian.test(text_sample)) return 'it';
    if (commonPortuguese.test(text_sample)) return 'pt';
    
    // Default to English if no specific language detected
    return 'en';
  } catch (error) {
    return 'en'; // Fallback to English
  }
}

/**
 * Detect language of text (async wrapper for compatibility)
 * @param {string} text - Text to detect language
 */
export async function detectLanguage(text) {
  try {
    const detectedLang = detectLanguageSync(text);
    return {
      success: true,
      detectedLanguage: detectedLang,
    };
  } catch (error) {
    return {
      success: false,
      error: 'Language detection failed',
      detectedLanguage: 'en',
    };
  }
}
