export type Language = 'fr' | 'en' | 'ar';
export type Direction = 'ltr' | 'rtl';
export type Theme = 'light' | 'dark' | 'system';

export type TransactionType = 'sale' | 'rent';
export type RentPeriod = 'monthly' | 'weekly' | 'daily' | 'yearly';

export type PropertyCategory = 
  | 'house_villa'
  | 'apartment'
  | 'land'
  | 'agricultural_land'
  | 'commercial'
  | 'warehouse'
  | 'office'
  | 'duplex_studio'
  | 'other';

export type PropertyCondition = 'new' | 'excellent' | 'good' | 'to_renovate';

export type PropertyStatus = 
  | 'draft'
  | 'pending'
  | 'published'
  | 'rejected'
  | 'suspended'
  | 'sold'
  | 'rented'
  | 'archived';

export type AccountType = 
  | 'private_owner'
  | 'agent'
  | 'agency'
  | 'promoter'
  | 'professional_advertiser';

export type UserRole = 'user' | 'agent' | 'admin';

export type LocationPrivacy = 'exact' | 'approximate';

export interface LocationData {
  country: string;
  region: string; // e.g. Wilaya / Department / State
  city: string;
  district?: string;
  neighborhood?: string;
  address?: string;
  lat: number;
  lng: number;
  placeId?: string;
}

export interface PropertyImage {
  id: string;
  url: string;
  isMain?: boolean;
  caption?: string;
}

export interface Property {
  id: string;
  referenceNumber: string;
  ownerId: string;
  ownerName: string;
  ownerPhone: string;
  ownerWhatsapp?: string;
  ownerEmail: string;
  ownerPhoto?: string;
  ownerType: AccountType;
  ownerVerified?: boolean;
  
  transactionType: TransactionType;
  rentPeriod?: RentPeriod;
  propertyType: PropertyCategory;
  title: string;
  description: string;
  price: number;
  currency: string;
  
  surface: number; // m²
  landSurface?: number; // m² or hectares
  bedrooms?: number;
  bathrooms?: number;
  floor?: number;
  totalFloors?: number;
  yearBuilt?: number;
  condition?: PropertyCondition;
  
  amenities: string[];
  images: PropertyImage[];
  location: LocationData;
  locationPrivacy: LocationPrivacy;
  
  status: PropertyStatus;
  verified: boolean;
  featured?: boolean;
  viewsCount: number;
  favoritesCount: number;
  
  createdAt: string;
  updatedAt: string;
  publishedAt?: string;
  isDemo?: boolean;
}

export interface UserProfile {
  uid: string;
  email: string;
  firstName: string;
  lastName: string;
  displayName: string;
  phone: string;
  whatsapp?: string;
  accountType: AccountType;
  role: 'user' | 'admin';
  isVerified: boolean;
  preferredLanguage: Language;
  photoURL?: string;
  city?: string;
  bio?: string;
  createdAt: string;
}

export interface FavoriteItem {
  id: string;
  userId: string;
  propertyId: string;
  createdAt: string;
}

export interface MessageItem {
  id: string;
  conversationId: string;
  senderId: string;
  senderName: string;
  text: string;
  createdAt: string;
  read: boolean;
}

export interface ConversationItem {
  id: string;
  propertyId: string;
  propertyTitle: string;
  propertyImage?: string;
  propertyPrice?: number;
  propertyCurrency?: string;
  participantIds: string[];
  participantNames: Record<string, string>;
  lastMessage: string;
  lastMessageTime: string;
  unreadCount: Record<string, number>;
}

export interface AppNotification {
  id: string;
  userId: string;
  title: string;
  message: string;
  type: 'message' | 'approval' | 'rejection' | 'favorite' | 'system';
  link?: string;
  read: boolean;
  createdAt: string;
}

export interface PropertyReport {
  id: string;
  propertyId: string;
  propertyTitle: string;
  reporterId: string;
  reason: 'fake' | 'scam' | 'duplicate' | 'wrong_info' | 'wrong_location' | 'inappropriate' | 'other';
  details: string;
  status: 'pending' | 'reviewed' | 'dismissed' | 'action_taken';
  createdAt: string;
}

export interface SearchFilterState {
  keyword: string;
  transactionType: TransactionType | 'all';
  propertyType: PropertyCategory | 'all';
  city: string;
  minPrice?: number;
  maxPrice?: number;
  currency: string;
  minSurface?: number;
  maxSurface?: number;
  bedrooms?: number | 'all';
  bathrooms?: number | 'all';
  amenities: string[];
  verifiedOnly: boolean;
  sortBy: 'relevant' | 'newest' | 'price_asc' | 'price_desc' | 'surface_desc';
}
