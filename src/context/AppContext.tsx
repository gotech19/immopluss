import React, { createContext, useContext, useState, useEffect } from 'react';
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
  loadingProperties: boolean;
  addProperty: (p: Omit<Property, 'id' | 'createdAt' | 'updatedAt' | 'viewsCount' | 'favoritesCount' | 'referenceNumber'>) => Promise<string>;
  updatePropertyStatus: (id: string, status: Property['status']) => Promise<void>;
  deleteProperty: (id: string) => Promise<void>;
  
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

  // Auth Modal
  const [authModalOpen, setAuthModalOpen] = useState(false);
  const [authModalMode, setAuthModalMode] = useState<'login' | 'register'>('login');

  // Properties list state - Starts completely clean / blank
  const [properties, setProperties] = useState<Property[]>(() => {
    const localProps = localStorage.getItem('immoplus_custom_properties');
    if (localProps) {
      try {
        const parsed = JSON.parse(localProps);
        if (Array.isArray(parsed)) {
          // Exclude any legacy demo properties
          const userOnly = parsed.filter((p: any) => p && !p.id?.startsWith('prop-') && !p.isDemo);
          localStorage.setItem('immoplus_custom_properties', JSON.stringify(userOnly));
          return userOnly;
        }
      } catch {
        return [];
      }
    }
    return [];
  });
  const [loadingProperties, setLoadingProperties] = useState(false);

  // Sync with Firestore properties
  useEffect(() => {
    let unsubscribe = () => {};
    try {
      const q = collection(db, 'properties');
      unsubscribe = onSnapshot(q, (snapshot) => {
        const remoteList: Property[] = [];
        snapshot.forEach((doc) => {
          const data = doc.data() as any;
          if (!doc.id.startsWith('prop-') && !data.isDemo) {
            remoteList.push({ id: doc.id, ...data });
          }
        });
        setProperties(remoteList);
      }, (err) => {
        console.log('Using local/cached property store:', err.message);
      });
    } catch (err) {
      console.log('Firestore listener fallback:', err);
    }
    return () => unsubscribe();
  }, []);

  const addProperty = async (
    propData: Omit<Property, 'id' | 'createdAt' | 'updatedAt' | 'viewsCount' | 'favoritesCount' | 'referenceNumber'>
  ): Promise<string> => {
    const id = `prop-${Date.now()}`;
    const refNum = `IMMO-${Math.floor(100000 + Math.random() * 900000)}`;
    const newProp: Property = {
      ...propData,
      id,
      referenceNumber: refNum,
      viewsCount: 1,
      favoritesCount: 0,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      publishedAt: propData.status === 'published' ? new Date().toISOString() : undefined
    };

    try {
      await addDoc(collection(db, 'properties'), newProp);
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

    return id;
  };

  const updatePropertyStatus = async (id: string, status: Property['status']) => {
    setProperties(prev => prev.map(p => p.id === id ? { ...p, status } : p));
    try {
      await updateDoc(doc(db, 'properties', id), { status, updatedAt: new Date().toISOString() });
    } catch (err) {
      // Local fallback update
      const existing = JSON.parse(localStorage.getItem('immoplus_custom_properties') || '[]');
      const updated = existing.map((p: Property) => p.id === id ? { ...p, status } : p);
      localStorage.setItem('immoplus_custom_properties', JSON.stringify(updated));
    }
  };

  const deleteProperty = async (id: string) => {
    setProperties(prev => prev.filter(p => p.id !== id));
    try {
      await deleteDoc(doc(db, 'properties', id));
    } catch (err) {
      const existing = JSON.parse(localStorage.getItem('immoplus_custom_properties') || '[]');
      const filtered = existing.filter((p: Property) => p.id !== id);
      localStorage.setItem('immoplus_custom_properties', JSON.stringify(filtered));
    }
  };

  // Filters
  const [filters, setFilters] = useState<SearchFilterState>(defaultFilters);
  const resetFilters = () => setFilters(defaultFilters);

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
      loadingProperties,
      addProperty,
      updatePropertyStatus,
      deleteProperty,
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
      setAuthModalMode
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
