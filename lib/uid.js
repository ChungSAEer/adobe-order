import md5 from 'md5';

/**
 * Generate a short unique UID based on timestamp + type
 * @param {'1m'|'3m'} type
 * @returns {string} 12-char hex string
 */
export function generateUID(type) {
  const raw = `${Date.now()}link${type}`;
  return md5(raw).slice(0, 12);
}
