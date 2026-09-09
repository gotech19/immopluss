import { Property } from '../types';

/**
 * Empty initial properties collection.
 * The application starts completely blank (vierge).
 * New properties are created dynamically by users via the "Publier une annonce" wizard
 * and stored in Firebase Firestore and local persistence.
 */
export const initialProperties: Property[] = [];
