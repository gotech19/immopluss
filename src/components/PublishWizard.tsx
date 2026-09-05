import React, { useState } from 'react';
import { useApp } from '../context/AppContext';
import { useAuth } from '../context/AuthContext';
import { 
  TransactionType, 
  RentPeriod, 
  PropertyCategory, 
  PropertyCondition, 
  LocationData, 
  LocationPrivacy,
  PropertyImage
} from '../types';
import { InteractiveMap } from './InteractiveMap';
import { 
  Plus, 
  Trash2, 
  Upload, 
  Camera, 
  Check, 
  ArrowRight, 
  ArrowLeft, 
  Sparkles, 
  MapPin, 
  Navigation, 
  CheckCircle,
  AlertCircle
} from 'lucide-react';

export const PublishWizard: React.FC = () => {
  const { t, addProperty, setActiveTab, requestUserLocation, locationLoading } = useApp();
  const { userProfile } = useAuth();

  const [currentStep, setCurrentStep] = useState<number>(1);
  const [submitting, setSubmitting] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);

  // Form State
  const [transactionType, setTransactionType] = useState<TransactionType>('sale');
  const [rentPeriod, setRentPeriod] = useState<RentPeriod>('monthly');
  const [propertyType, setPropertyType] = useState<PropertyCategory>('apartment');
  
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [isAiGenerating, setIsAiGenerating] = useState(false);
  const [price, setPrice] = useState<number>(15000000);
  const [currency, setCurrency] = useState('DA');
  const [surface, setSurface] = useState<number>(120);
  const [landSurface, setLandSurface] = useState<number>(0);
  const [bedrooms, setBedrooms] = useState<number>(3);
  const [bathrooms, setBathrooms] = useState<number>(1);
  const [floor, setFloor] = useState<number>(2);
  const [totalFloors, setTotalFloors] = useState<number>(5);
  const [yearBuilt, setYearBuilt] = useState<number>(2022);
  const [condition, setCondition] = useState<PropertyCondition>('excellent');
  
  const [amenities, setAmenities] = useState<string[]>([
    'Parking', 'Climatisation', 'Chauffage', 'Balcon', 'Ascenseur'
  ]);

  // Photos state
  const [images, setImages] = useState<PropertyImage[]>([
    {
      id: 'img-pub-1',
      url: 'https://images.unsplash.com/photo-1600585154340-be6161a56a0c?auto=format&fit=crop&w=1200&q=80',
      isMain: true
    },
    {
      id: 'img-pub-2',
      url: 'https://images.unsplash.com/photo-1600596542815-ffad4c1539a9?auto=format&fit=crop&w=1200&q=80'
    }
  ]);

  // Location state
  const [location, setLocation] = useState<LocationData>({
    country: 'Algérie',
    region: 'Sétif',
    city: 'Sétif',
    district: 'Centre Ville',
    address: 'Avenue de la Liberté, Sétif',
    lat: 36.1906,
    lng: 5.4137
  });
  const [locationPrivacy, setLocationPrivacy] = useState<LocationPrivacy>('approximate');
  const [addressSearchQuery, setAddressSearchQuery] = useState('');
  const [searchingAddress, setSearchingAddress] = useState(false);

  // Available amenities by property type
  const availableAmenities = [
    'Parking', 'Garage', 'Jardin', 'Piscine', 'Balcon', 'Terrasse', 
    'Ascenseur', 'Climatisation', 'Chauffage central', 'Cuisine équipée',
    'Interphone', 'Sécurité 24/7', 'Forage d’eau', 'Bâche à eau',
    'Électricité triphasée', 'Quai de déchargement', 'Accès PMR', 'Acte notarié & Livret foncier'
  ];

  const toggleAmenity = (item: string) => {
    setAmenities(prev => 
      prev.includes(item) ? prev.filter(a => a !== item) : [...prev, item]
    );
  };

  // Image Upload handler
  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files || files.length === 0) return;

    const newImages: PropertyImage[] = [];
    Array.from(files).forEach((file, index) => {
      const reader = new FileReader();
      reader.onload = (event) => {
        if (event.target?.result) {
          setImages(prev => [
            ...prev,
            {
              id: `img-${Date.now()}-${index}`,
              url: event.target?.result as string,
              isMain: prev.length === 0 && index === 0
            }
          ]);
        }
      };
      reader.readAsDataURL(file as Blob);
    });
  };

  const removeImage = (id: string) => {
    setImages(prev => {
      const filtered = prev.filter(img => img.id !== id);
      if (filtered.length > 0 && !filtered.some(img => img.isMain)) {
        filtered[0].isMain = true;
      }
      return filtered;
    });
  };

  const setMainImage = (id: string) => {
    setImages(prev => prev.map(img => ({ ...img, isMain: img.id === id })));
  };

  // Geolocation method A
  const handleUseCurrentLocation = async () => {
    const coords = await requestUserLocation();
    if (coords) {
      reverseGeocode(coords.lat, coords.lng);
    }
  };

  // Reverse geocoding via OpenStreetMap Nominatim
  const reverseGeocode = async (lat: number, lng: number) => {
    try {
      const res = await fetch(`https://nominatim.openstreetmap.org/reverse?format=json&lat=${lat}&lon=${lng}&zoom=14&addressdetails=1`);
      if (res.ok) {
        const data = await res.json();
        const city = data.address?.city || data.address?.town || data.address?.state_district || 'Ville';
        const region = data.address?.state || city;
        const country = data.address?.country || 'Algérie';
        const address = data.display_name?.split(',').slice(0, 3).join(',') || '';

        setLocation({
          country,
          region,
          city,
          address,
          lat,
          lng
        });
      }
    } catch {
      setLocation(prev => ({ ...prev, lat, lng }));
    }
  };

  // Address search Method B
  const handleAddressSearch = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!addressSearchQuery.trim()) return;
    setSearchingAddress(true);
    try {
      const res = await fetch(`https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(addressSearchQuery)}&limit=1`);
      if (res.ok) {
        const data = await res.json();
        if (data.length > 0) {
          const item = data[0];
          const lat = parseFloat(item.lat);
          const lng = parseFloat(item.lon);
          await reverseGeocode(lat, lng);
        }
      }
    } catch (err) {
      console.warn('Geocoding search failed:', err);
    } finally {
      setSearchingAddress(false);
    }
  };

  // AI Description Generator Feature (ImmoPlus AI assistant)
  const handleGenerateAiDescription = () => {
    setIsAiGenerating(true);
    setTimeout(() => {
      const typeLabel = propertyType === 'apartment' ? 'Appartement' : propertyType === 'house_villa' ? 'Villa' : 'Bien immobilier';
      const actionLabel = transactionType === 'sale' ? 'à vendre' : 'à louer';
      const generated = `Opportunité exceptionnelle : Charmant(e) ${typeLabel} ${actionLabel} idéalement situé(e) à ${location.city} (${location.region}). 
Offrant une belle surface de ${surface} m² avec ${bedrooms} pièces et ${bathrooms} salle(s) de bain, ce bien se distingue par sa luminosité naturelle, son agencement optimisé et ses prestations de qualité.
Commodités incluses : ${amenities.slice(0, 5).join(', ')}.
Proche des axes principaux, commerces et écoles. Dossier complet et visite disponible sur rendez-vous.`;
      
      setDescription(generated);
      if (!title) {
        setTitle(`${typeLabel} de standing ${surface} m² - ${location.city}`);
      }
      setIsAiGenerating(false);
    }, 900);
  };

  // Final Submit handler
  const handleSubmit = async () => {
    setSubmitting(true);
    try {
      await addProperty({
        ownerId: userProfile?.uid || 'user-default',
        ownerName: userProfile?.displayName || 'Oussama Guesmia',
        ownerPhone: userProfile?.phone || '+213 555 12 34 56',
        ownerWhatsapp: userProfile?.whatsapp || '213555123456',
        ownerEmail: userProfile?.email || 'o.guesmia@gmail.com',
        ownerPhoto: userProfile?.photoURL,
        ownerType: userProfile?.accountType || 'private_owner',
        ownerVerified: true,
        transactionType,
        rentPeriod: transactionType === 'rent' ? rentPeriod : undefined,
        propertyType,
        title: title || `${propertyType === 'apartment' ? 'Appartement' : 'Bien'} à ${location.city}`,
        description: description || 'Magnifique bien immobilier vérifié sur ImmoPlus.',
        price,
        currency,
        surface,
        landSurface: landSurface > 0 ? landSurface : undefined,
        bedrooms,
        bathrooms,
        floor,
        totalFloors,
        yearBuilt,
        condition,
        amenities,
        images: images.length > 0 ? images : [{ id: 'img-def', url: 'https://images.unsplash.com/photo-1600585154340-be6161a56a0c?auto=format&fit=crop&w=1200&q=80', isMain: true }],
        location,
        locationPrivacy,
        status: 'pending', // Per section 57: Initial status is Pending review!
        verified: false,
        featured: false
      });

      setIsSuccess(true);
    } catch (err) {
      console.error(err);
    } finally {
      setSubmitting(false);
    }
  };

  if (isSuccess) {
    return (
      <div className="max-w-2xl mx-auto px-4 py-16 text-center">
        <div className="w-16 h-16 bg-emerald-100 dark:bg-emerald-900/40 text-emerald-600 rounded-full flex items-center justify-center mx-auto mb-4">
          <CheckCircle className="w-10 h-10" />
        </div>
        <h2 className="text-2xl font-black text-slate-900 dark:text-white mb-2">
          {t('submissionSuccessTitle')}
        </h2>
        <p className="text-sm text-slate-600 dark:text-slate-300 max-w-lg mx-auto mb-6">
          {t('submissionSuccessDesc')}
        </p>
        <div className="flex justify-center gap-3">
          <button
            onClick={() => setActiveTab('dashboard')}
            className="px-6 py-2.5 rounded-xl bg-[#0B3D91] text-white font-bold text-sm shadow-md hover:bg-[#082E6E]"
          >
            Voir mes annonces
          </button>
          <button
            onClick={() => setActiveTab('home')}
            className="px-6 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-200 font-bold text-sm hover:bg-slate-100"
          >
            Retour à l'accueil
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 py-8">
      
      {/* Wizard Header */}
      <div className="mb-8 text-center sm:text-left rtl:sm:text-right">
        <h1 className="font-serif text-2xl sm:text-3xl font-medium text-white">
          {t('wizardTitle')}
        </h1>
        <p className="text-sm text-[#888888] mt-1">
          Étape {currentStep} sur 6
        </p>

        {/* Stepper Progress Bar */}
        <div className="flex items-center gap-1.5 mt-4">
          {[1, 2, 3, 4, 5, 6].map((s) => (
            <div
              key={s}
              className={`h-1.5 flex-1 rounded-full transition-all ${
                s <= currentStep ? 'bg-[#c5a36c]' : 'bg-white/10'
              }`}
            />
          ))}
        </div>
      </div>

      <div className="bg-[#0f0f0f] text-[#e5e5e5] rounded-3xl border border-white/10 p-6 sm:p-8 shadow-2xl">
        
        {/* STEP 1: TRANSACTION */}
        {currentStep === 1 && (
          <div className="space-y-6">
            <h2 className="font-serif text-lg font-medium text-white">{t('chooseTransaction')}</h2>
            
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <button
                type="button"
                onClick={() => setTransactionType('sale')}
                className={`p-6 rounded-2xl border text-center transition-all cursor-pointer ${
                  transactionType === 'sale'
                    ? 'border-[#c5a36c] bg-[#c5a36c]/10 text-white shadow-lg'
                    : 'border-white/10 bg-[#161616] text-[#888888] hover:border-white/20 hover:text-white'
                }`}
              >
                <span className="text-3xl mb-2 block">🏷️</span>
                <span className="font-serif text-lg font-medium text-white block">{t('forSale')}</span>
                <span className="text-xs text-[#888888] mt-1 block">Vous souhaitez vendre un bien immobilier</span>
              </button>

              <button
                type="button"
                onClick={() => setTransactionType('rent')}
                className={`p-6 rounded-2xl border text-center transition-all cursor-pointer ${
                  transactionType === 'rent'
                    ? 'border-[#c5a36c] bg-[#c5a36c]/10 text-white shadow-lg'
                    : 'border-white/10 bg-[#161616] text-[#888888] hover:border-white/20 hover:text-white'
                }`}
              >
                <span className="text-3xl mb-2 block">🔑</span>
                <span className="font-serif text-lg font-medium text-white block">{t('forRent')}</span>
                <span className="text-xs text-[#888888] mt-1 block">Vous proposez un bien à la location</span>
              </button>
            </div>

            {transactionType === 'rent' && (
              <div className="pt-4 border-t border-white/10 space-y-2">
                <label className="block text-xs font-medium text-[#999999]">{t('choosePeriod')}</label>
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                  {[
                    { id: 'monthly', label: t('monthly') },
                    { id: 'weekly', label: t('weekly') },
                    { id: 'daily', label: t('daily') },
                    { id: 'yearly', label: t('yearly') }
                  ].map((p) => (
                    <button
                      key={p.id}
                      type="button"
                      onClick={() => setRentPeriod(p.id as RentPeriod)}
                      className={`py-2.5 px-3 rounded-xl text-xs font-semibold border transition-colors cursor-pointer ${
                        rentPeriod === p.id 
                          ? 'border-[#c5a36c] bg-[#c5a36c] text-[#0a0a0a] font-bold shadow-xs'
                          : 'border-white/10 bg-[#161616] text-[#888888] hover:text-white'
                      }`}
                    >
                      {p.label}
                    </button>
                  ))}
                </div>
              </div>
            )}
          </div>
        )}

        {/* STEP 2: PROPERTY TYPE */}
        {currentStep === 2 && (
          <div className="space-y-6">
            <h2 className="font-serif text-lg font-medium text-white">{t('propertyType')}</h2>
            
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
              {[
                { id: 'apartment', label: t('catApartments'), emoji: '🏢' },
                { id: 'house_villa', label: t('catHouses'), emoji: '🏡' },
                { id: 'land', label: t('catLand'), emoji: '📐' },
                { id: 'agricultural_land', label: t('catAgriLand'), emoji: '🌾' },
                { id: 'commercial', label: t('catCommercial'), emoji: '🏪' },
                { id: 'warehouse', label: t('catWarehouse'), emoji: '🏭' },
                { id: 'duplex_studio', label: t('catDuplex'), emoji: '🏙️' },
              ].map((c) => (
                <button
                  key={c.id}
                  type="button"
                  onClick={() => setPropertyType(c.id as PropertyCategory)}
                  className={`p-4 rounded-2xl border text-center transition-all cursor-pointer ${
                    propertyType === c.id
                      ? 'border-[#c5a36c] bg-[#c5a36c]/10 text-[#c5a36c] font-bold shadow-sm'
                      : 'border-white/10 bg-[#161616] text-[#888888] hover:border-white/20 hover:text-white'
                  }`}
                >
                  <span className="text-2xl mb-1 block">{c.emoji}</span>
                  <span className="text-xs sm:text-sm">{c.label}</span>
                </button>
              ))}
            </div>
          </div>
        )}

        {/* STEP 3: INFORMATION & SPECS */}
        {currentStep === 3 && (
          <div className="space-y-5">
            <div>
              <label className="block text-xs font-medium text-[#999999] mb-1">{t('titleLabel')} *</label>
              <input
                type="text"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                placeholder={t('titlePlaceholder')}
                className="w-full p-3 rounded-xl border border-white/10 bg-[#161616] text-white placeholder-[#666666] text-sm focus:border-[#c5a36c]/60"
              />
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              <div className="sm:col-span-2">
                <label className="block text-xs font-medium text-[#999999] mb-1">{t('priceLabel')} *</label>
                <input
                  type="number"
                  value={price}
                  onChange={(e) => setPrice(Number(e.target.value))}
                  className="w-full p-3 rounded-xl border border-white/10 bg-[#161616] text-white text-sm font-serif font-medium focus:border-[#c5a36c]/60"
                />
              </div>
              <div>
                <label className="block text-xs font-medium text-[#999999] mb-1">{t('currencyLabel')}</label>
                <select
                  value={currency}
                  onChange={(e) => setCurrency(e.target.value)}
                  className="w-full p-3 rounded-xl border border-white/10 bg-[#161616] text-white text-sm font-semibold focus:border-[#c5a36c]/60"
                >
                  <option value="DA" className="bg-[#161616] text-white">DA (Dinar Algérien)</option>
                  <option value="EUR" className="bg-[#161616] text-white">EUR (€)</option>
                  <option value="USD" className="bg-[#161616] text-white">USD ($)</option>
                  <option value="QAR" className="bg-[#161616] text-white">QAR (Riyal Qatari)</option>
                  <option value="AED" className="bg-[#161616] text-white">AED (Dirham)</option>
                  <option value="SAR" className="bg-[#161616] text-white">SAR (Riyal Saoudien)</option>
                </select>
              </div>
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
              <div>
                <label className="block text-xs font-medium text-[#999999] mb-1">{t('surfaceLabel')} *</label>
                <input
                  type="number"
                  value={surface}
                  onChange={(e) => setSurface(Number(e.target.value))}
                  className="w-full p-3 rounded-xl border border-white/10 bg-[#161616] text-white text-sm focus:border-[#c5a36c]/60"
                />
              </div>

              {propertyType !== 'land' && propertyType !== 'agricultural_land' && propertyType !== 'warehouse' && (
                <>
                  <div>
                    <label className="block text-xs font-medium text-[#999999] mb-1">{t('bedrooms')}</label>
                    <input
                      type="number"
                      value={bedrooms}
                      onChange={(e) => setBedrooms(Number(e.target.value))}
                      className="w-full p-3 rounded-xl border border-white/10 bg-[#161616] text-white text-sm focus:border-[#c5a36c]/60"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-medium text-[#999999] mb-1">{t('bathrooms')}</label>
                    <input
                      type="number"
                      value={bathrooms}
                      onChange={(e) => setBathrooms(Number(e.target.value))}
                      className="w-full p-3 rounded-xl border border-white/10 bg-[#161616] text-white text-sm focus:border-[#c5a36c]/60"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-medium text-[#999999] mb-1">{t('floor')}</label>
                    <input
                      type="number"
                      value={floor}
                      onChange={(e) => setFloor(Number(e.target.value))}
                      className="w-full p-3 rounded-xl border border-white/10 bg-[#161616] text-white text-sm focus:border-[#c5a36c]/60"
                    />
                  </div>
                </>
              )}
            </div>

            {/* Description with AI generation button */}
            <div>
              <div className="flex items-center justify-between mb-1">
                <label className="text-xs font-medium text-[#999999]">{t('descriptionLabel')} *</label>
                <button
                  type="button"
                  onClick={handleGenerateAiDescription}
                  disabled={isAiGenerating}
                  className="inline-flex items-center gap-1.5 text-xs font-semibold text-[#c5a36c] bg-[#c5a36c]/10 border border-[#c5a36c]/30 px-2.5 py-1 rounded-lg transition-colors cursor-pointer hover:bg-[#c5a36c]/20"
                >
                  <Sparkles className={`w-3.5 h-3.5 text-[#c5a36c] ${isAiGenerating ? 'animate-spin' : ''}`} />
                  <span>{isAiGenerating ? t('aiGenerating') : t('aiGenerateDesc')}</span>
                </button>
              </div>
              <textarea
                rows={4}
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                placeholder={t('descriptionPlaceholder')}
                className="w-full p-3 rounded-xl border border-white/10 bg-[#161616] text-white placeholder-[#666666] text-sm leading-relaxed focus:border-[#c5a36c]/60"
              />
            </div>

            {/* Amenities selection */}
            <div>
              <label className="block text-xs font-medium text-[#999999] mb-2">{t('amenities')}</label>
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
                {availableAmenities.map((item) => {
                  const isChecked = amenities.includes(item);
                  return (
                    <button
                      key={item}
                      type="button"
                      onClick={() => toggleAmenity(item)}
                      className={`p-2.5 rounded-xl border text-xs font-medium flex items-center gap-2 transition-colors cursor-pointer ${
                        isChecked
                          ? 'border-[#c5a36c] bg-[#c5a36c]/10 text-white'
                          : 'border-white/10 bg-[#161616] text-[#888888] hover:text-white'
                      }`}
                    >
                      <div className={`w-4 h-4 rounded-md flex items-center justify-center border ${
                        isChecked ? 'bg-[#c5a36c] border-[#c5a36c] text-[#0a0a0a]' : 'border-white/20'
                      }`}>
                        {isChecked && <Check className="w-3 h-3" />}
                      </div>
                      <span className="truncate">{item}</span>
                    </button>
                  );
                })}
              </div>
            </div>
          </div>
        )}

        {/* STEP 4: PHOTOS */}
        {currentStep === 4 && (
          <div className="space-y-5">
            <div>
              <h2 className="font-serif text-lg font-medium text-white">{t('stepPhotos')}</h2>
              <p className="text-xs text-[#888888] mt-0.5">{t('maxPhotosNotice')}</p>
            </div>

            {/* Upload Area */}
            <div className="border border-dashed border-white/20 rounded-2xl p-6 text-center hover:border-[#c5a36c]/60 transition-colors bg-[#161616]">
              <Upload className="w-10 h-10 text-[#c5a36c] mx-auto mb-2" />
              <p className="font-serif text-sm font-medium text-white">{t('dragPhotosHere')}</p>
              <p className="text-xs text-[#888888] mb-4">{t('orClickToUpload')}</p>
              
              <div className="flex flex-wrap items-center justify-center gap-2">
                <label className="px-4 py-2 bg-[#c5a36c] hover:bg-[#d4b57e] text-[#0a0a0a] text-xs font-bold uppercase tracking-wider rounded-xl cursor-pointer shadow-md">
                  <span>Parcourir les fichiers</span>
                  <input
                    type="file"
                    multiple
                    accept="image/jpeg,image/png,image/webp"
                    onChange={handleFileUpload}
                    className="hidden"
                  />
                </label>

                <label className="px-4 py-2 bg-[#1f1f1f] hover:bg-[#252525] text-white border border-white/10 text-xs font-semibold rounded-xl cursor-pointer inline-flex items-center gap-1.5">
                  <Camera className="w-4 h-4 text-[#c5a36c]" />
                  <span>{t('useCamera')}</span>
                  <input
                    type="file"
                    accept="image/*"
                    capture="environment"
                    onChange={handleFileUpload}
                    className="hidden"
                  />
                </label>
              </div>
            </div>

            {/* Photos Preview Grid */}
            {images.length > 0 && (
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 pt-2">
                {images.map((img, idx) => (
                  <div 
                    key={img.id}
                    className={`relative group rounded-xl overflow-hidden aspect-4/3 border ${
                      img.isMain ? 'border-[#c5a36c] ring-2 ring-[#c5a36c]/40' : 'border-white/10'
                    }`}
                  >
                    <img src={img.url} alt="" className="w-full h-full object-cover" />
                    
                    {img.isMain && (
                      <span className="absolute top-2 left-2 bg-[#c5a36c] text-[#0a0a0a] font-bold text-[10px] px-2 py-0.5 rounded-md shadow-md uppercase tracking-wider">
                        Couverture
                      </span>
                    )}

                    <div className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-2">
                      {!img.isMain && (
                        <button
                          type="button"
                          onClick={() => setMainImage(img.id)}
                          className="px-2 py-1 bg-white text-[#0a0a0a] text-[10px] font-bold rounded-md cursor-pointer"
                        >
                          Définir principale
                        </button>
                      )}
                      <button
                        type="button"
                        onClick={() => removeImage(img.id)}
                        className="p-1.5 bg-rose-600 text-white rounded-md hover:bg-rose-700 cursor-pointer"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {/* STEP 5: LOCATION */}
        {currentStep === 5 && (
          <div className="space-y-5">
            <div>
              <h2 className="font-serif text-lg font-medium text-white">{t('stepLocation')}</h2>
              <p className="text-xs text-[#888888] mt-0.5">Indiquez précisément la localisation de votre bien</p>
            </div>

            {/* 3 Methods Bar */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              
              {/* Method A: GPS */}
              <button
                type="button"
                onClick={handleUseCurrentLocation}
                disabled={locationLoading}
                className="p-3 rounded-xl border border-white/10 bg-[#161616] text-[#e5e5e5] hover:text-white hover:border-[#c5a36c]/40 flex items-center gap-2.5 text-xs font-semibold transition-colors cursor-pointer"
              >
                <Navigation className={`w-4 h-4 text-[#c5a36c] ${locationLoading ? 'animate-spin' : ''}`} />
                <span>{locationLoading ? 'Détection en cours...' : t('locationMethodA')}</span>
              </button>

              {/* Method B: Search input */}
              <form onSubmit={handleAddressSearch} className="flex gap-1.5">
                <input
                  type="text"
                  value={addressSearchQuery}
                  onChange={(e) => setAddressSearchQuery(e.target.value)}
                  placeholder="Rechercher une ville, rue..."
                  className="flex-1 px-3 py-2 rounded-xl border border-white/10 bg-[#161616] text-white placeholder-[#666666] text-xs focus:border-[#c5a36c]/60"
                />
                <button
                  type="submit"
                  disabled={searchingAddress}
                  className="px-3.5 py-2 rounded-xl bg-[#c5a36c] hover:bg-[#d4b57e] text-[#0a0a0a] text-xs font-bold uppercase tracking-wider cursor-pointer"
                >
                  {searchingAddress ? '...' : 'Chercher'}
                </button>
              </form>
            </div>

            {/* Coordinates and Address preview */}
            <div className="p-3 bg-[#161616] rounded-xl text-xs flex flex-wrap items-center justify-between gap-2 border border-white/10">
              <div className="flex items-center gap-2">
                <MapPin className="w-4 h-4 text-[#c5a36c] shrink-0" />
                <span className="font-semibold text-white">
                  {location.address || `${location.city}, ${location.region}, ${location.country}`}
                </span>
              </div>
              <span className="font-mono text-[#888888]">
                {location.lat.toFixed(4)}, {location.lng.toFixed(4)}
              </span>
            </div>

            {/* Interactive Leaflet Map Picker */}
            <InteractiveMap
              isPickerMode={true}
              pickerCoordinates={{ lat: location.lat, lng: location.lng }}
              onCoordinatesChange={(coords) => reverseGeocode(coords.lat, coords.lng)}
              className="h-64 sm:h-80 rounded-2xl overflow-hidden border border-white/10"
            />

            {/* Location Privacy Options */}
            <div className="space-y-2 pt-2 border-t border-white/10">
              <label className="block text-xs font-medium text-[#999999]">Confidentialité de la localisation</label>
              <div className="space-y-2">
                <label className="flex items-center gap-2.5 p-2.5 rounded-xl border border-white/10 bg-[#161616] cursor-pointer text-xs">
                  <input
                    type="radio"
                    name="locationPrivacy"
                    checked={locationPrivacy === 'approximate'}
                    onChange={() => setLocationPrivacy('approximate')}
                    className="accent-[#c5a36c]"
                  />
                  <div>
                    <span className="font-medium text-white">{t('locationPrivacyApprox')}</span>
                    <p className="text-[#888888] text-[11px]">Protège l'adresse exacte en affichant un rayon approximatif sur la carte publique.</p>
                  </div>
                </label>

                <label className="flex items-center gap-2.5 p-2.5 rounded-xl border border-white/10 bg-[#161616] cursor-pointer text-xs">
                  <input
                    type="radio"
                    name="locationPrivacy"
                    checked={locationPrivacy === 'exact'}
                    onChange={() => setLocationPrivacy('exact')}
                    className="accent-[#c5a36c]"
                  />
                  <div>
                    <span className="font-medium text-white">{t('locationPrivacyExact')}</span>
                    <p className="text-[#888888] text-[11px]">Idéal pour les locaux commerciaux, hangars ou terrains visibles depuis la rue.</p>
                  </div>
                </label>
              </div>
            </div>
          </div>
        )}

        {/* STEP 6: PREVIEW */}
        {currentStep === 6 && (
          <div className="space-y-6">
            <div>
              <h2 className="font-serif text-lg font-medium text-white">{t('stepPreview')}</h2>
              <p className="text-xs text-[#888888] mt-0.5">{t('previewNotice')}</p>
            </div>

            {/* Summary Box */}
            <div className="border border-white/10 rounded-2xl overflow-hidden bg-[#161616]">
              <div className="aspect-16/9 relative bg-[#0a0a0a]">
                <img src={images[0]?.url} alt="" className="w-full h-full object-cover" />
                <div className="absolute top-3 left-3 bg-[#c5a36c] text-[#0a0a0a] font-bold text-xs uppercase tracking-wider px-2.5 py-1 rounded-md shadow-md">
                  {transactionType === 'sale' ? t('forSale') : t('forRent')}
                </div>
                <div className="absolute bottom-3 left-3 text-white font-serif text-2xl font-medium drop-shadow-md">
                  {new Intl.NumberFormat('fr-FR').format(price)} {currency} {transactionType === 'rent' ? `/${rentPeriod}` : ''}
                </div>
              </div>

              <div className="p-4 space-y-3">
                <h3 className="font-serif text-lg font-medium text-white">{title || 'Sans titre'}</h3>
                <p className="text-xs text-[#888888] flex items-center gap-1">
                  <MapPin className="w-3.5 h-3.5 text-[#c5a36c]" />
                  <span>{location.address || `${location.city}, ${location.country}`}</span>
                </p>

                <div className="grid grid-cols-3 gap-2 text-xs font-medium text-[#888888] py-2 border-y border-white/10">
                  <div>Surface : <span className="text-white font-semibold">{surface} m²</span></div>
                  <div>Chambres : <span className="text-white font-semibold">{bedrooms}</span></div>
                  <div>Bains : <span className="text-white font-semibold">{bathrooms}</span></div>
                </div>

                <p className="text-xs text-[#bbbbbb] line-clamp-3 leading-relaxed">
                  {description}
                </p>
              </div>
            </div>

            <div className="p-4 bg-[#181818] border border-white/10 rounded-2xl flex items-start gap-3 text-xs text-[#e5e5e5]">
              <AlertCircle className="w-5 h-5 shrink-0 text-[#c5a36c] mt-0.5" />
              <div>
                <span className="font-bold text-white">Modération préalable ImmoPlus :</span>
                <p className="mt-0.5 text-[#888888]">Toutes les annonces sont soumises à vérification administrative pour garantir la sécurité des acheteurs et locataires.</p>
              </div>
            </div>
          </div>
        )}

        {/* Wizard Navigation Footer */}
        <div className="flex items-center justify-between pt-6 mt-6 border-t border-white/10">
          {currentStep > 1 ? (
            <button
              type="button"
              onClick={() => setCurrentStep(prev => prev - 1)}
              className="px-4 py-2.5 rounded-xl border border-white/10 text-xs font-semibold text-[#888888] hover:text-white hover:border-white/20 flex items-center gap-1.5 cursor-pointer transition-colors"
            >
              <ArrowLeft className="w-4 h-4" />
              <span>{t('previous')}</span>
            </button>
          ) : <div />}

          {currentStep < 6 ? (
            <button
              type="button"
              onClick={() => setCurrentStep(prev => prev + 1)}
              className="px-6 py-2.5 rounded-xl bg-[#c5a36c] hover:bg-[#d4b57e] text-[#0a0a0a] text-xs font-bold uppercase tracking-wider flex items-center gap-1.5 shadow-md cursor-pointer transition-all"
            >
              <span>{t('next')}</span>
              <ArrowRight className="w-4 h-4" />
            </button>
          ) : (
            <button
              type="button"
              onClick={handleSubmit}
              disabled={submitting}
              className="px-6 py-3 rounded-xl bg-[#c5a36c] hover:bg-[#d4b57e] text-[#0a0a0a] text-xs font-bold uppercase tracking-wider flex items-center gap-2 shadow-lg active:scale-95 transition-all cursor-pointer"
            >
              <CheckCircle className="w-4 h-4" />
              <span>{submitting ? 'Publication en cours...' : t('submitListingBtn')}</span>
            </button>
          )}
        </div>

      </div>

    </div>
  );
};
