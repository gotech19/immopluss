import React, { createContext, useContext, useState, useEffect, useMemo } from 'react';
import { 
  Language, 
  Direction, 
  Theme, 
  Property, 
  SearchFilterState, 
  ConversationItem, 
  MessageItem, 
  AppNotification, 
  PropertyReport,
  PropertyCategory
} from '../types';
import { translations } from '../i18n/translations';
import { initialProperties } from '../data/mockData';
import { db } from '../firebase/config';
import { viderUndefined } from '../utils/cleanFirestore';
import { 
  collection, 
  getDocs, 
  addDoc, 
  updateDoc, 
  deleteDoc, 
  doc, 
  query, 
  where, 
  onSnapshot 
} from 'firebase/firestore';
import { useAuth } from './AuthContext';

interface AppContextType {
  lang: Language;
  dir: Direction;
  setLang: (l: Language) => void;
  t: (key: keyof typeof translations['fr']) => string;
  
  theme: Theme;
  setTheme: (t: Theme) => void;
  toggleTheme: () => void;
  
  activeTab: string;
  setActiveTab: (tab: string) => void;
  
  selectedProperty: Property | null;
  setSelectedProperty: (p: Property | null) => void;
  
  properties: Property[];
  filteredProperties: Property[];
  loadingProperties: boolean;
  addProperty: (p: Omit<Property, 'id' | 'createdAt' | 'updatedAt' | 'viewsCount' | 'favoritesCount' | 'referenceNumber'>) => Promise<string>;
  updatePropertyStatus: (id: string, status: Property['status']) => Promise<void>;
  deleteProperty: (id: string) => Promise<void>;
  clearAllProperties: () => Promise<void>;
  
  filters: SearchFilterState;
  setFilters: React.Dispatch<React.SetStateAction<SearchFilterState>>;
  resetFilters: () => void;
  
  favorites: string[];
  toggleFavorite: (propertyId: string) => void;
  isFavorite: (propertyId: string) => boolean;
  
  conversations: ConversationItem[];
  activeConversation: ConversationItem | null;
  setActiveConversation: (c: ConversationItem | null) => void;
  messages: MessageItem[];
  sendMessage: (convId: string, text: string) => Promise<void>;
  startConversationWithSeller: (property: Property) => void;
  
  notifications: AppNotification[];
  unreadNotificationsCount: number;
  markNotificationAsRead: (id: string) => void;
  
  reports: PropertyReport[];
  submitReport: (propertyId: string, propertyTitle: string, reason: PropertyReport['reason'], details: string) => Promise<void>;
  
  userLocation: { lat: number; lng: number } | null;
  requestUserLocation: () => Promise<{ lat: number; lng: number } | null>;
  locationLoading: boolean;

  // Modals
  authModalOpen: boolean;
  setAuthModalOpen: (open: boolean) => void;
  authModalMode: 'login' | 'register';
  setAuthModalMode: (mode: 'login' | 'register') => void;
  dbDiagnosticOpen: boolean;
  setDbDiagnosticOpen: (open: boolean) => void;
  contactModalOpen: boolean;
  setContactModalOpen: (open: boolean) => void;
}

const defaultFilters: SearchFilterState = {
  keyword: '',
  transactionType: 'all',
  propertyType: 'all',
  city: '',
  currency: 'DA',
  amenities: [],
  verifiedOnly: false,
  sortBy: 'newest'
};

const AppContext = createContext<AppContextType | undefined>(undefined);

export const AppProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { userProfile } = useAuth();

  // Language state
  const [lang, setLangState] = useState<Language>(() => {
    const saved = localStorage.getItem('immoplus_lang') as Language;
    return saved || 'fr';
  });

  const dir: Direction = lang === 'ar' ? 'rtl' : 'ltr';

  const setLang = (newLang: Language) => {
    setLangState(newLang);
    localStorage.setItem('immoplus_lang', newLang);
    document.documentElement.lang = newLang;
    document.documentElement.dir = newLang === 'ar' ? 'rtl' : 'ltr';
  };

  useEffect(() => {
    document.documentElement.lang = lang;
    document.documentElement.dir = lang === 'ar' ? 'rtl' : 'ltr';
  }, [lang]);

  // Translation helper
  const t = (key: keyof typeof translations['fr']): string => {
    const dict = translations[lang] || translations.fr;
    return (dict[key] || translations.fr[key] || key) as string;
  };

  // Theme state
  const [theme, setThemeState] = useState<Theme>(() => {
    const saved = localStorage.getItem('immoplus_theme') as Theme;
    return saved || 'light';
  });

  const setTheme = (newTheme: Theme) => {
    setThemeState(newTheme);
    localStorage.setItem('immoplus_theme', newTheme);
    if (newTheme === 'dark') {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
  };

  const toggleTheme = () => {
    setTheme(theme === 'dark' ? 'light' : 'dark');
  };

  useEffect(() => {
    if (theme === 'dark') {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
  }, [theme]);

  // Navigation
  const [activeTab, setActiveTab] = useState<string>('home');
  const [selectedProperty, setSelectedProperty] = useState<Property | null>(null);

  // Auth, Diagnostic & Contact Modals
  const [authModalOpen, setAuthModalOpen] = useState(false);
  const [authModalMode, setAuthModalMode] = useState<'login' | 'register'>('login');
  const [dbDiagnosticOpen, setDbDiagnosticOpen] = useState(false);
  const [contactModalOpen, setContactModalOpen] = useState(false);

  // Demo / Example IDs to always purge from blank state
  const DEMO_EXAMPLE_IDS = [
    'prop-alger-bab-ezzouar',
    'prop-oran-akid-lotfi',
    'prop-alger-hydra',
    'prop-alger-centre-f3',
    'prop-setif-terrain',
    'prop-rouiba-hangar'
  ];

  // Properties list state - Initialized completely empty (Vierge)
  const [properties, setProperties] = useState<Property[]>(() => {
    const deletedIds: string[] = JSON.parse(localStorage.getItem('immoplus_deleted_properties') || '[]');
    const localProps = localStorage.getItem('immoplus_custom_properties');
    if (localProps) {
      try {
        const parsed = JSON.parse(localProps);
        if (Array.isArray(parsed) && parsed.length > 0) {
          const userOnly = parsed.filter((p: any) => 
            p && 
            !deletedIds.includes(p.id) &&
            !DEMO_EXAMPLE_IDS.includes(p.id) &&
            !p.isDemo
          );
          if (userOnly.length > 0) {
            return userOnly;
          }
        }
      } catch {
        // empty
      }
    }
    return [];
  });
  const [loadingProperties, setLoadingProperties] = useState(false);

  // Sync with Firestore properties in real-time via onSnapshot
  useEffect(() => {
    let unsubscribe = () => {};
    setLoadingProperties(true);
    try {
      const q = collection(db, 'properties');
      unsubscribe = onSnapshot(q, (snapshot) => {
        const deletedIds: string[] = JSON.parse(localStorage.getItem('immoplus_deleted_properties') || '[]');
        const remoteList: Property[] = [];
        snapshot.forEach((docSnap) => {
          const data = docSnap.data() as any;
          const propItem: Property = {
            ...data,
            id: docSnap.id,
          };
          if (
            !deletedIds.includes(docSnap.id) && 
            !deletedIds.includes(data.id) &&
            !DEMO_EXAMPLE_IDS.includes(docSnap.id) &&
            !DEMO_EXAMPLE_IDS.includes(data.id) &&
            !data.isDemo
          ) {
            remoteList.push(propItem);
          }
        });
        
        if (remoteList.length > 0) {
          setProperties(remoteList);
        } else {
          // If Firestore has no documents, check if user has created custom properties in local cache
          const localProps = localStorage.getItem('immoplus_custom_properties');
          if (localProps) {
            try {
              const parsed = JSON.parse(localProps);
              if (Array.isArray(parsed) && parsed.length > 0) {
                const userOnly = parsed.filter(p => 
                  p && 
                  !deletedIds.includes(p.id) && 
                  !DEMO_EXAMPLE_IDS.includes(p.id) && 
                  !p.isDemo
                );
                setProperties(userOnly);
                setLoadingProperties(false);
                return;
              }
            } catch {
              // ignore
            }
          }
          setProperties([]);
        }
        setLoadingProperties(false);
      }, (err) => {
        console.log('Using local/cached property store:', err.message);
        setLoadingProperties(false);
      });
    } catch (err) {
      console.log('Firestore listener fallback:', err);
      setLoadingProperties(false);
    }
    return () => unsubscribe();
  }, []);

  const addProperty = async (
    propData: Omit<Property, 'id' | 'createdAt' | 'updatedAt' | 'viewsCount' | 'favoritesCount' | 'referenceNumber'>
  ): Promise<string> => {
    const tempId = `prop-${Date.now()}`;
    const refNum = `IMMO-${Math.floor(100000 + Math.random() * 900000)}`;
    const newProp: Property = {
      ...propData,
      id: tempId,
      referenceNumber: refNum,
      viewsCount: 1,
      favoritesCount: 0,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      publishedAt: propData.status === 'published' ? new Date().toISOString() : undefined
    };

    // Nettoyage systématique des valeurs undefined pour éviter l'erreur Firestore
    // Note: on retire le champ `id` temporaire pour que Firestore stocke un document propre
    const { id: _, ...dataToSave } = newProp;
    const donneesNettoyees = viderUndefined(dataToSave);

    try {
      const docRef = await addDoc(collection(db, 'properties'), donneesNettoyees);
      newProp.id = docRef.id;
    } catch (err) {
      console.warn('Persisting locally:', err);
      // Persist in localStorage
      const existing = JSON.parse(localStorage.getItem('immoplus_custom_properties') || '[]');
      existing.unshift(newProp);
      localStorage.setItem('immoplus_custom_properties', JSON.stringify(existing));
    }

    setProperties(prev => [newProp, ...prev]);

    // Send admin notification
    setNotifications(prev => [
      {
        id: `notif-${Date.now()}`,
        userId: 'admin',
        title: 'Nouvelle annonce soumise',
        message: `L'annonce "${newProp.title}" (${newProp.referenceNumber}) est en attente de validation.`,
        type: 'system',
        read: false,
        createdAt: new Date().toISOString()
      },
      ...prev
    ]);

    return newProp.id;
  };

  const updatePropertyStatus = async (id: string, status: Property['status']) => {
    setProperties(prev => prev.map(p => p.id === id ? { ...p, status } : p));
    setSelectedProperty(prev => (prev?.id === id ? { ...prev, status } : prev));
    try {
      await updateDoc(doc(db, 'properties', id), { status, updatedAt: new Date().toISOString() });
    } catch (err) {
      try {
        const q = query(collection(db, 'properties'), where('id', '==', id));
        const snap = await getDocs(q);
        const updatePromises = snap.docs.map(d => updateDoc(d.ref, { status, updatedAt: new Date().toISOString() }));
        await Promise.all(updatePromises);
      } catch {
        // Fallback
      }
      // Local fallback update
      const existing = JSON.parse(localStorage.getItem('immoplus_custom_properties') || '[]');
      const updated = existing.map((p: Property) => p.id === id ? { ...p, status } : p);
      localStorage.setItem('immoplus_custom_properties', JSON.stringify(updated));
    }
  };

  const deleteProperty = async (id: string) => {
    // 1. Mise à jour immédiate de l'état React & fermeture de la fiche ouverte
    setProperties(prev => prev.filter(p => p.id !== id));
    setSelectedProperty(prev => (prev?.id === id ? null : prev));

    // 2. Ajout dans la liste noire des annonces supprimées (empêche onSnapshot de la réafficher)
    try {
      const deletedIds: string[] = JSON.parse(localStorage.getItem('immoplus_deleted_properties') || '[]');
      if (!deletedIds.includes(id)) {
        deletedIds.push(id);
        localStorage.setItem('immoplus_deleted_properties', JSON.stringify(deletedIds));
      }
    } catch (e) {
      console.warn('Error updating deleted ids:', e);
    }

    // 3. Suppression définitive du cache local
    try {
      const existing = JSON.parse(localStorage.getItem('immoplus_custom_properties') || '[]');
      const filtered = existing.filter((p: Property) => p.id !== id);
      localStorage.setItem('immoplus_custom_properties', JSON.stringify(filtered));
    } catch (e) {
      console.warn('Error clearing from localStorage:', e);
    }

    // 4. Suppression définitive dans Cloud Firestore par son doc ID
    try {
      await deleteDoc(doc(db, 'properties', id));
    } catch (err) {
      console.warn('Direct deleteDoc failed for id:', id, err);
    }

    // 5. Nettoyage si le document avait été enregistré avec un champ interne { id: id }
    try {
      const q = query(collection(db, 'properties'), where('id', '==', id));
      const snap = await getDocs(q);
      const deletePromises = snap.docs.map(d => deleteDoc(d.ref));
      await Promise.all(deletePromises);
    } catch (err) {
      // Ignorer si la recherche secondaire n'est pas requise
    }
  };

  // Vider totalement toutes les annonces et exemples (Mettre l'application vierge)
  const clearAllProperties = async () => {
    // 1. Reset React state immediately
    const currentIds = properties.map(p => p.id);
    setProperties([]);
    setSelectedProperty(null);

    // 2. Vider le stockage local
    try {
      localStorage.removeItem('immoplus_custom_properties');
      const deletedIds: string[] = JSON.parse(localStorage.getItem('immoplus_deleted_properties') || '[]');
      const allBlacklisted = Array.from(new Set([...deletedIds, ...currentIds, ...DEMO_EXAMPLE_IDS]));
      localStorage.setItem('immoplus_deleted_properties', JSON.stringify(allBlacklisted));
    } catch (e) {
      console.warn('Error clearing local storage:', e);
    }

    // 3. Vider Cloud Firestore
    try {
      const snap = await getDocs(collection(db, 'properties'));
      const deletePromises = snap.docs.map(d => deleteDoc(d.ref));
      await Promise.all(deletePromises);
    } catch (err) {
      console.warn('Firestore purge error:', err);
    }
  };

  // Filters
  const [filters, setFilters] = useState<SearchFilterState>(defaultFilters);
  const resetFilters = () => setFilters(defaultFilters);

  // Filtered Properties Computation
  const filteredProperties = useMemo(() => {
    return properties.filter(prop => {
      // 1. Transaction type
      if (filters.transactionType !== 'all' && prop.transactionType !== filters.transactionType) {
        return false;
      }
      // 2. Property category
      if (filters.propertyType !== 'all' && prop.propertyType !== filters.propertyType) {
        return false;
      }
      // 3. City / Region / Neighborhood / Zone
      if (filters.city && filters.city.trim()) {
        const queryCity = filters.city.toLowerCase().trim();
        const propCity = (prop.location?.city || '').toLowerCase();
        const propRegion = (prop.location?.region || '').toLowerCase();
        const propDistrict = (prop.location?.district || '').toLowerCase();
        const propNeighborhood = (prop.location?.neighborhood || '').toLowerCase();
        const propAddress = (prop.location?.address || '').toLowerCase();
        if (
          !propCity.includes(queryCity) && 
          !propRegion.includes(queryCity) && 
          !propDistrict.includes(queryCity) &&
          !propNeighborhood.includes(queryCity) &&
          !propAddress.includes(queryCity)
        ) {
          return false;
        }
      }
      // 4. Keyword
      if (filters.keyword && filters.keyword.trim()) {
        const q = filters.keyword.toLowerCase().trim();
        const titleMatch = (prop.title || '').toLowerCase().includes(q);
        const descMatch = (prop.description || '').toLowerCase().includes(q);
        const cityMatch = (prop.location?.city || '').toLowerCase().includes(q);
        const neighborhoodMatch = (prop.location?.neighborhood || '').toLowerCase().includes(q);
        const refMatch = (prop.referenceNumber || '').toLowerCase().includes(q);
        if (!titleMatch && !descMatch && !cityMatch && !neighborhoodMatch && !refMatch) {
          return false;
        }
      }
      // 5. Price range
      if (filters.minPrice !== undefined && filters.minPrice > 0 && prop.price < filters.minPrice) {
        return false;
      }
      if (filters.maxPrice !== undefined && filters.maxPrice > 0 && prop.price > filters.maxPrice) {
        return false;
      }
      // 6. Surface range
      if (filters.minSurface !== undefined && filters.minSurface > 0 && prop.surface < filters.minSurface) {
        return false;
      }
      if (filters.maxSurface !== undefined && filters.maxSurface > 0 && prop.surface > filters.maxSurface) {
        return false;
      }
      // 7. Bedrooms
      if (filters.bedrooms && filters.bedrooms !== 'all') {
        const requiredRooms = Number(filters.bedrooms);
        if (!isNaN(requiredRooms) && requiredRooms > 0) {
          if (!prop.bedrooms || prop.bedrooms < requiredRooms) {
            return false;
          }
        }
      }
      // 8. Verified only
      if (filters.verifiedOnly && !prop.verified) {
        return false;
      }
      return true;
    }).sort((a, b) => {
      if (filters.sortBy === 'price_asc') return a.price - b.price;
      if (filters.sortBy === 'price_desc') return b.price - a.price;
      if (filters.sortBy === 'surface_desc') return b.surface - a.surface;
      if (filters.sortBy === 'newest') return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
      return 0;
    });
  }, [properties, filters]);

  // Favorites - Starts blank
  const [favorites, setFavorites] = useState<string[]>(() => {
    const saved = localStorage.getItem('immoplus_favorites');
    if (saved) {
      try {
        const parsed = JSON.parse(saved);
        if (Array.isArray(parsed)) {
          const cleaned = parsed.filter((id: string) => !id.startsWith('prop-'));
          localStorage.setItem('immoplus_favorites', JSON.stringify(cleaned));
          return cleaned;
        }
      } catch {
        return [];
      }
    }
    return [];
  });

  const toggleFavorite = (propertyId: string) => {
    setFavorites(prev => {
      const next = prev.includes(propertyId)
        ? prev.filter(id => id !== propertyId)
        : [...prev, propertyId];
      localStorage.setItem('immoplus_favorites', JSON.stringify(next));
      return next;
    });
  };

  const isFavorite = (propertyId: string) => favorites.includes(propertyId);

  // Messaging state - blank initial state
  const [conversations, setConversations] = useState<ConversationItem[]>([]);
  const [activeConversation, setActiveConversation] = useState<ConversationItem | null>(null);
  const [messages, setMessages] = useState<MessageItem[]>([]);

  const sendMessage = async (convId: string, text: string) => {
    if (!text.trim()) return;
    const senderId = userProfile?.uid || 'user-guest';
    const senderName = userProfile?.displayName || 'Moi';
    const newMsg: MessageItem = {
      id: `msg-${Date.now()}`,
      conversationId: convId,
      senderId,
      senderName,
      text: text.trim(),
      createdAt: new Date().toISOString(),
      read: false
    };

    setMessages(prev => [...prev, newMsg]);

    setConversations(prev => prev.map(c => {
      if (c.id === convId) {
        return {
          ...c,
          lastMessage: text.trim(),
          lastMessageTime: new Date().toISOString()
        };
      }
      return c;
    }));
  };

  const startConversationWithSeller = (property: Property) => {
    // Find or create conversation
    let existing = conversations.find(c => c.propertyId === property.id);
    if (!existing) {
      existing = {
        id: `conv-${Date.now()}`,
        propertyId: property.id,
        propertyTitle: property.title,
        propertyImage: property.images[0]?.url,
        propertyPrice: property.price,
        propertyCurrency: property.currency,
        participantIds: [userProfile?.uid || 'guest', property.ownerId],
        participantNames: {
          [userProfile?.uid || 'guest']: userProfile?.displayName || 'Moi',
          [property.ownerId]: property.ownerName
        },
        lastMessage: 'Conversation démarrée',
        lastMessageTime: new Date().toISOString(),
        unreadCount: {}
      };
      setConversations(prev => [existing!, ...prev]);
    }
    setActiveConversation(existing);
    setActiveTab('messages');
  };

  // Notifications - blank initial state
  const [notifications, setNotifications] = useState<AppNotification[]>([]);

  const unreadNotificationsCount = notifications.filter(n => !n.read).length;

  const markNotificationAsRead = (id: string) => {
    setNotifications(prev => prev.map(n => n.id === id ? { ...n, read: true } : n));
  };

  // Reports - blank initial state
  const [reports, setReports] = useState<PropertyReport[]>([]);

  const submitReport = async (propertyId: string, propertyTitle: string, reason: PropertyReport['reason'], details: string) => {
    const newReport: PropertyReport = {
      id: `rep-${Date.now()}`,
      propertyId,
      propertyTitle,
      reporterId: userProfile?.uid || 'guest',
      reason,
      details,
      status: 'pending',
      createdAt: new Date().toISOString()
    };
    setReports(prev => [newReport, ...prev]);
  };

  // Geolocation
  const [userLocation, setUserLocation] = useState<{ lat: number; lng: number } | null>(null);
  const [locationLoading, setLocationLoading] = useState(false);

  const requestUserLocation = (): Promise<{ lat: number; lng: number } | null> => {
    return new Promise((resolve) => {
      if (!navigator.geolocation) {
        resolve(null);
        return;
      }
      setLocationLoading(true);
      navigator.geolocation.getCurrentPosition(
        (position) => {
          const loc = {
            lat: position.coords.latitude,
            lng: position.coords.longitude
          };
          setUserLocation(loc);
          setLocationLoading(false);
          resolve(loc);
        },
        (error) => {
          console.warn('Geolocation denied or error:', error.message);
          // Default to Algiers center if permission denied so user can still see map
          const fallback = { lat: 36.7538, lng: 3.0588 };
          setUserLocation(fallback);
          setLocationLoading(false);
          resolve(fallback);
        },
        { enableHighAccuracy: true, timeout: 8000 }
      );
    });
  };

  return (
    <AppContext.Provider value={{
      lang,
      dir,
      setLang,
      t,
      theme,
      setTheme,
      toggleTheme,
      activeTab,
      setActiveTab,
      selectedProperty,
      setSelectedProperty,
      properties,
      filteredProperties,
      loadingProperties,
      addProperty,
      updatePropertyStatus,
      deleteProperty,
      clearAllProperties,
      filters,
      setFilters,
      resetFilters,
      favorites,
      toggleFavorite,
      isFavorite,
      conversations,
      activeConversation,
      setActiveConversation,
      messages,
      sendMessage,
      startConversationWithSeller,
      notifications,
      unreadNotificationsCount,
      markNotificationAsRead,
      reports,
      submitReport,
      userLocation,
      requestUserLocation,
      locationLoading,
      authModalOpen,
      setAuthModalOpen,
      authModalMode,
      setAuthModalMode,
      dbDiagnosticOpen,
      setDbDiagnosticOpen,
      contactModalOpen,
      setContactModalOpen
    }}>
      {children}
    </AppContext.Provider>
  );
};

export const useApp = () => {
  const context = useContext(AppContext);
  if (!context) throw new Error('useApp must be used within an AppProvider');
  return context;
};
