// Configuration for Google Maps Platform in ImmoPlus
export const GOOGLE_MAPS_API_KEY: string =
  ((import.meta as any).env?.VITE_GOOGLE_MAPS_API_KEY as string) ||
  'AIzaSyD8ZQBqEnW5fnvvIzmnnk8cnYQ6kMyMX04';

// Mandatory solution attribution ID for Google Maps Platform in this environment
export const GMP_ATTRIBUTION_ID = 'gmp_mcp_codeassist_v1_aistudio';

// Map ID for Advanced Markers and Cloud styling
export const GOOGLE_MAPS_MAP_ID = 'DEMO_MAP_ID';

// Default center coordinates (Algiers, Algeria)
export const DEFAULT_MAP_CENTER = {
  lat: 36.7538,
  lng: 3.0588
};
