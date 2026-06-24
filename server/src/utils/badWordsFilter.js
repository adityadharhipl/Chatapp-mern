// ============================================
// Bad Words Filter — Hindi + English
// Add more words to the arrays as needed
// ============================================

const BAD_WORDS_EN = [
  "fuck", "shit", "bitch", "asshole", "bastard", "dick", "pussy",
  "damn", "cunt", "whore", "slut", "nigger", "faggot", "retard",
  "motherfucker", "bullshit", "ass", "douche", "jackass", "cock",
  "prick", "wanker", "twat", "moron", "idiot", "stupid",
  "dumbass", "shut up", "kill yourself", "kys", "stfu", "gtfo"
];

const BAD_WORDS_HI = [
  "madarchod", "behenchod", "chutiya", "bhosdi", "bhosadike",
  "gandu", "lodu", "lund", "randi", "harami", "kamina",
  "kutta", "kutti", "gaand", "jhatu", "tatti", "ullu",
  "bhosdiwala", "mc", "bc", "bkl", "bsdk", "lode",
  "chut", "saala", "saali", "haramkhor", "gadha"
];

// Combine all bad words
const ALL_BAD_WORDS = [...BAD_WORDS_EN, ...BAD_WORDS_HI];

/**
 * Check if a message contains bad words
 * @param {string} message - The message text to check
 * @returns {boolean} - true if message contains bad words
 */
export const containsBadWords = (message) => {
  if (!message || typeof message !== "string") return false;
  const lowerMsg = message.toLowerCase().replace(/[^a-z0-9\s]/gi, ""); // remove special chars
  
  return ALL_BAD_WORDS.some((word) => {
    // Match whole word using regex with word boundaries
    const regex = new RegExp(`\\b${word}\\b`, "i");
    return regex.test(lowerMsg);
  });
};

/**
 * Censor bad words in a message (replace with ***)
 * @param {string} message - The message text
 * @returns {string} - Censored message
 */
export const censorMessage = (message) => {
  if (!message || typeof message !== "string") return message;
  let censored = message;
  
  ALL_BAD_WORDS.forEach((word) => {
    const regex = new RegExp(`\\b${word}\\b`, "gi");
    censored = censored.replace(regex, "*".repeat(word.length));
  });
  
  return censored;
};

/**
 * Get warning message for the user
 */
export const WARNING_MESSAGE = "⚠️ Your message was blocked. Abusive language is not allowed in the chat room. Please be respectful.";

export default { containsBadWords, censorMessage, WARNING_MESSAGE };
