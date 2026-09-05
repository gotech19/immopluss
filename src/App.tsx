import React from 'react';
import { AuthProvider } from './context/AuthContext';
import { AppProvider, useApp } from './context/AppContext';
import { Header } from './components/Header';
import { BottomNav } from './components/BottomNav';
import { Footer } from './components/Footer';
import { HomeView } from './components/HomeView';
import { PropertiesListView } from './components/PropertiesListView';
import { FullMapView } from './components/FullMapView';
import { PublishWizard } from './components/PublishWizard';
import { FavoritesView } from './components/FavoritesView';
import { MessagingView } from './components/MessagingView';
import { UserDashboard } from './components/UserDashboard';
import { AdminPanel } from './components/AdminPanel';
import { PropertyDetailsModal } from './components/PropertyDetailsModal';
import { AuthModal } from './components/AuthModal';

const AppContent: React.FC = () => {
  const { activeTab, selectedProperty, setSelectedProperty } = useApp();

  return (
    <div className="min-h-screen flex flex-col bg-[#0a0a0a] text-[#e5e5e5] transition-colors relative selection:bg-[#c5a36c] selection:text-[#0a0a0a]">
      {/* Primary Sticky Header */}
      <Header />

      {/* Main Routed View */}
      <main className="flex-1">
        {activeTab === 'home' && <HomeView />}
        {activeTab === 'properties' && <PropertiesListView />}
        {activeTab === 'map' && <FullMapView />}
        {activeTab === 'publish' && <PublishWizard />}
        {activeTab === 'favorites' && <FavoritesView />}
        {activeTab === 'messages' && <MessagingView />}
        {activeTab === 'dashboard' && <UserDashboard />}
        {activeTab === 'admin' && <AdminPanel />}
      </main>

      {/* Footer */}
      <Footer />

      {/* Mobile Bottom Bar */}
      <BottomNav />

      {/* Full Property Details Modal */}
      {selectedProperty && (
        <PropertyDetailsModal 
          property={selectedProperty} 
          onClose={() => setSelectedProperty(null)} 
        />
      )}

      {/* Authentication Modal */}
      <AuthModal />
    </div>
  );
};

export default function App() {
  return (
    <AuthProvider>
      <AppProvider>
        <AppContent />
      </AppProvider>
    </AuthProvider>
  );
}
