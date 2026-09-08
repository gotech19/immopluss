/**
 * Nettoie récursivement un objet pour supprimer toutes les valeurs `undefined`.
 * Firestore rejette toute écriture (addDoc, setDoc, updateDoc) contenant des champs `undefined`
 * avec l'erreur : "Function addDoc() called with invalid data. Unsupported field value: undefined".
 */
export const viderUndefined = <T extends Record<string, any>>(obj: T): T => {
  if (!obj || typeof obj !== 'object') {
    return obj;
  }

  if (Array.isArray(obj)) {
    return obj
      .filter((item) => item !== undefined)
      .map((item) => (item !== null && typeof item === 'object' ? viderUndefined(item) : item)) as unknown as T;
  }

  const cleaned: Record<string, any> = {};
  Object.keys(obj).forEach((key) => {
    const value = obj[key];
    if (value === undefined) {
      return; // Exclusion des valeurs undefined
    }
    if (value !== null && typeof value === 'object' && !(value instanceof Date)) {
      cleaned[key] = viderUndefined(value);
    } else {
      cleaned[key] = value;
    }
  });

  return cleaned as T;
};
