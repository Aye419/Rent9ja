import React, { useState, useEffect } from 'react';
import { 
  Heart, Share2, MapPin, Search, User, 
  MessageSquare, ShieldCheck, TrendingUp, Sparkles, Filter, Info, Bell 
} from 'lucide-react';
import Navbar from './components/Navbar';
import Hero from './components/Hero';
import ListingCard from './components/ListingCard';
import ListingDetails from './components/ListingDetails';
import AccountDashboard from './components/AccountDashboard';
import Chatbot from './components/Chatbot';
import PaymentsModal from './components/PaymentsModal';
import LoginModal from './components/LoginModal';
import MessagesInbox from './components/MessagesInbox';
import { Property, Message, UserProfile, ReviewReport, SearchFilters } from './types';
import { categories, initialProperties } from './mockData';
import { fetchAllUsersFromFirestore } from './lib/firebaseService';

export default function App() {
  const [activeTab, setActiveTab] = useState<'home' | 'dashboard' | 'messages'>('home');
  const [activePropertyId, setActivePropertyId] = useState<string | null>(null);
  
  // Primary database state
  const [properties, setProperties] = useState<Property[]>([]);
  const [filteredProperties, setFilteredProperties] = useState<Property[]>([]);
  const [allUsers, setAllUsers] = useState<UserProfile[]>([]);
  const [currentUser, setCurrentUser] = useState<UserProfile | null>(null);
  const [favorites, setFavorites] = useState<string[]>([]);
  const [messages, setMessages] = useState<Message[]>([]);
  const [reports, setReports] = useState<ReviewReport[]>([]);

  // Search parameters
  const [activeCategory, setActiveCategory] = useState<string>('All');
  const [searchFilters, setSearchFilters] = useState<SearchFilters>({
    state: 'All',
    city: 'All',
    area: '',
    propertyType: 'All',
    type: 'all',
    minPrice: '',
    maxPrice: '',
    bedrooms: 'Any',
    bathrooms: 'Any',
    furnished: 'Any'
  });

  // Modal Controllers
  const [showLoginModal, setShowLoginModal] = useState(false);
  const [paymentModalData, setPaymentModalData] = useState<{
    isOpen: boolean;
    purpose: 'premium' | 'featured';
    propertyId?: string;
    userId?: string;
    amount?: number;
  }>({
    isOpen: false,
    purpose: 'premium'
  });

  // Shared alerts panel
  const [appAlert, setAppAlert] = useState<{ type: 'success' | 'error' | 'info'; text: string } | null>(null);

  // 1. Fetch initial property listings on startup
  const fetchProperties = async (filtersObj?: SearchFilters, categoryId?: string) => {
    try {
      let queryParams = new URLSearchParams();
      const currentFilters = filtersObj || searchFilters;
      const currentCat = categoryId || activeCategory;

      if (currentFilters.state && currentFilters.state !== 'All') queryParams.append('state', currentFilters.state);
      if (currentFilters.city && currentFilters.city !== 'All') queryParams.append('city', currentFilters.city);
      if (currentFilters.area) queryParams.append('area', currentFilters.area);
      if (currentFilters.propertyType && currentFilters.propertyType !== 'All') queryParams.append('propertyType', currentFilters.propertyType);
      if (currentFilters.type && currentFilters.type !== 'all') queryParams.append('type', currentFilters.type);
      if (currentFilters.minPrice) queryParams.append('minPrice', currentFilters.minPrice);
      if (currentFilters.maxPrice) queryParams.append('maxPrice', currentFilters.maxPrice);
      if (currentFilters.bedrooms && currentFilters.bedrooms !== 'Any') queryParams.append('bedrooms', currentFilters.bedrooms);
      if (currentFilters.bathrooms && currentFilters.bathrooms !== 'Any') queryParams.append('bathrooms', currentFilters.bathrooms);
      if (currentFilters.furnished && currentFilters.furnished !== 'Any') queryParams.append('furnished', currentFilters.furnished);
      if (currentCat && currentCat !== 'All') queryParams.append('category', currentCat);

      const res = await fetch(`/api/properties?${queryParams.toString()}`);
      if (!res.ok) throw new Error('Failed to load listings');
      
      const data = await res.json();
      setFilteredProperties(data);
      if (!filtersObj && currentCat === 'All') {
        // First load set all properties locally
        setProperties(data);
      }
    } catch (err) {
      console.error('Fetch properties error:', err);
    }
  };

  // Fetch admin metadata, messages, users
  const fetchMetadata = async () => {
    try {
      // Fetch users from Firestore first, fallback to API
      const firestoreUsers = await fetchAllUsersFromFirestore();
      if (firestoreUsers.length > 0) {
        setAllUsers(firestoreUsers);
      } else {
        const uRes = await fetch('/api/users');
        if (uRes.ok) {
          const uData = await uRes.json();
          setAllUsers(uData);
        }
      }

      const mRes = await fetch('/api/messages');
      if (mRes.ok) {
        const mData = await mRes.json();
        setMessages(mData);
      }

      const rRes = await fetch('/api/admin/reports');
      if (rRes.ok) {
        const rData = await rRes.json();
        setReports(rData);
      }
    } catch (err) {
      console.error('Metadata fetching error:', err);
    }
  };

  useEffect(() => {
    fetchProperties();
    fetchMetadata();

    // Check localStorage for favorites and demo login
    const savedFavs = localStorage.getItem('rentnaija_favorites');
    if (savedFavs) {
      setFavorites(JSON.parse(savedFavs));
    }

    const savedUser = localStorage.getItem('rentnaija_currentuser');
    if (savedUser) {
      try {
        setCurrentUser(JSON.parse(savedUser));
      } catch (e) {
        setCurrentUser(null);
      }
    } else {
      setCurrentUser(null);
    }
  }, []);

  const triggerAlert = (type: 'success' | 'error' | 'info', text: string) => {
    setAppAlert({ type, text });
    setTimeout(() => setAppAlert(null), 4000);
  };

  // 2. Action Helpers
  const handleSearch = (filters: SearchFilters) => {
    setSearchFilters(filters);
    setActiveTab('home');
    setActivePropertyId(null);
    fetchProperties(filters, activeCategory);
  };

  const handleSelectCategory = (catId: string) => {
    setActiveCategory(catId);
    setActiveTab('home');
    setActivePropertyId(null);
    fetchProperties(searchFilters, catId);
  };

  const handleToggleFavorite = (id: string, e?: React.MouseEvent) => {
    if (e) e.stopPropagation();
    let updated: string[] = [];
    if (favorites.includes(id)) {
      updated = favorites.filter(fav => fav !== id);
      triggerAlert('info', 'Removed from Saved Favorites');
    } else {
      updated = [...favorites, id];
      triggerAlert('success', 'Added to Saved Favorites');
    }
    setFavorites(updated);
    localStorage.setItem('rentnaija_favorites', JSON.stringify(updated));
  };

  const handleShare = (property: Property, e?: React.MouseEvent) => {
    if (e) e.stopPropagation();
    const mockUrl = `${window.location.origin}/property/${property.id}`;
    navigator.clipboard.writeText(mockUrl);
    triggerAlert('success', `Listing URL copied: ${property.title}`);
  };

  const handleLoginSuccess = (user: UserProfile) => {
    setCurrentUser(user);
    localStorage.setItem('rentnaija_currentuser', JSON.stringify(user));
    triggerAlert('success', `Logged in successfully as ${user.name}`);
    fetchMetadata();
    setActiveTab('dashboard');
    setActivePropertyId(null);
  };

  const handleLogout = () => {
    setCurrentUser(null);
    localStorage.removeItem('rentnaija_currentuser');
    triggerAlert('info', 'Logged out successfully');
  };

  const handlePublishListing = async (propertyData: Partial<Property>) => {
    if (!currentUser) {
      setShowLoginModal(true);
      triggerAlert('error', 'An account profile is required before you can post a property listing.');
      return;
    }
    try {
      const res = await fetch('/api/properties', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(propertyData)
      });
      if (!res.ok) throw new Error('Publishing failed');
      const data = await res.json();
      triggerAlert('success', 'Property listing published successfully!');
      fetchProperties();
    } catch (err) {
      console.error('Publishing error:', err);
      triggerAlert('error', 'Failed to publish listing. Please try again.');
    }
  };

  const handleDeleteListing = async (id: string) => {
    if (!window.confirm('Are you sure you want to delete this listing?')) return;
    try {
      const res = await fetch(`/api/properties/${id}`, {
        method: 'DELETE'
      });
      if (!res.ok) throw new Error('Deletion failed');
      triggerAlert('info', 'Property listing deleted');
      fetchProperties();
    } catch (err) {
      console.error('Deletion error:', err);
    }
  };

  const handleSendMessage = async (listingId: string, agentId: string, content: string) => {
    if (!currentUser) {
      setShowLoginModal(true);
      return;
    }
    try {
      const res = await fetch('/api/messages', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          listingId,
          senderId: currentUser.id,
          recipientId: agentId,
          content
        })
      });
      if (!res.ok) throw new Error('Message delivery failed');
      const data = await res.json();
      
      // Update local message list
      setMessages(prev => [...prev, data.sentMessage]);

      if (data.replyMessage) {
        // Auto simulated agent response
        setTimeout(() => {
          setMessages(prev => [...prev, data.replyMessage]);
          triggerAlert('info', 'New inquiry response received!');
        }, 1200);
      }
    } catch (err) {
      console.error('Messaging error:', err);
    }
  };

  const handleContactLead = async (id: string) => {
    try {
      await fetch(`/api/properties/${id}/lead`, { method: 'POST' });
      // Update views/leads local counter
      setProperties(prev => prev.map(p => p.id === id ? { ...p, leads: p.leads + 1 } : p));
      setFilteredProperties(prev => prev.map(p => p.id === id ? { ...p, leads: p.leads + 1 } : p));
    } catch (err) {
      console.error(err);
    }
  };

  const handleReportListing = async (id: string, reason: string, details: string) => {
    if (!currentUser) return;
    try {
      const res = await fetch('/api/admin/reports', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          propertyId: id,
          reporterName: currentUser.name,
          reporterEmail: currentUser.email,
          reason,
          details
        })
      });
      if (res.ok) {
        triggerAlert('success', 'Report submitted to Admin review gateway.');
        fetchMetadata();
      }
    } catch (err) {
      console.error(err);
    }
  };

  const handleResolveReport = async (reportId: string, status: 'resolved' | 'dismissed') => {
    try {
      const res = await fetch(`/api/admin/reports/${reportId}/resolve`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ status })
      });
      if (res.ok) {
        triggerAlert('success', `Report ${status}`);
        fetchMetadata();
        fetchProperties();
      }
    } catch (err) {
      console.error(err);
    }
  };

  const handleVerifyAgent = async (userId: string, badge: 'standard' | 'verified' | 'premium', verified: boolean) => {
    try {
      const res = await fetch('/api/admin/verify-agent', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ userId, badge, verified })
      });
      if (res.ok) {
        triggerAlert('success', 'Agent credentials updated');
        fetchMetadata();
      }
    } catch (err) {
      console.error(err);
    }
  };

  const handlePaymentSuccess = (paymentData: any) => {
    triggerAlert('success', 'Billing transaction processed successfully!');
    if (paymentModalData.purpose === 'premium' && currentUser) {
      // Upgrade agent premium status locally
      const updatedUser = { ...currentUser, badge: 'premium', verifiedAgent: true };
      setCurrentUser(updatedUser as any);
      localStorage.setItem('rentnaija_currentuser', JSON.stringify(updatedUser));
    }
    fetchProperties();
    fetchMetadata();
  };

  const handleOpenPaymentModal = (purpose: 'premium' | 'featured', listingId?: string, amount?: number) => {
    setPaymentModalData({
      isOpen: true,
      purpose,
      propertyId: listingId,
      userId: currentUser?.id,
      amount: amount || (purpose === 'premium' ? 15000 : 5000)
    });
  };

  const handleUpdateProfile = (updatedData: Partial<UserProfile>) => {
    if (!currentUser) return;
    const updated = { ...currentUser, ...updatedData };
    setCurrentUser(updated);
    localStorage.setItem('rentnaija_currentuser', JSON.stringify(updated));
    triggerAlert('success', 'Profile updated');
  };

  const selectedProperty = properties.find(p => p.id === activePropertyId);

  return (
    <div id="rent-naija-app" className="min-h-screen bg-slate-50 flex flex-col font-sans text-slate-800">
      
      {/* Navbar header */}
      <Navbar
        activeTab={activePropertyId ? 'home' : activeTab}
        setActiveTab={(tab) => {
          setActiveTab(tab);
          setActivePropertyId(null);
        }}
        currentUser={currentUser}
        onLogout={handleLogout}
        onOpenLogin={() => setShowLoginModal(true)}
      />

      {/* Floating System alerts notification */}
      {appAlert && (
        <div id="system-top-alert" className="fixed top-20 right-4 z-50 max-w-sm p-4 rounded-xl bg-slate-900 border border-slate-800 text-white shadow-2xl flex items-start space-x-2.5 animate-in slide-in-from-right-6 duration-200">
          <Bell className="h-4.5 w-4.5 text-emerald-500 shrink-0 mt-0.5 animate-bounce" />
          <p className="text-xs font-medium">{appAlert.text}</p>
        </div>
      )}

      {/* Primary tab switcher screens */}
      <main className="flex-1">
        
        {/* TABS 1: MARKETPLACE HOME */}
        {activeTab === 'home' && (
          <div className="space-y-8">
            
            {!activePropertyId && (
              <Hero
                onSearch={handleSearch}
                categoriesList={categories.map(cat => {
                  const count = properties.filter(p => p.propertyType?.toLowerCase() === cat.id.toLowerCase()).length;
                  return { ...cat, count };
                })}
                activeCategory={activeCategory}
                onSelectCategory={handleSelectCategory}
                properties={properties}
                onSelectProperty={(id) => {
                  setActivePropertyId(id);
                  setActiveTab('home');
                }}
              />
            )}

            {/* Content Display Area */}
            {activePropertyId && selectedProperty ? (
              <ListingDetails
                property={selectedProperty}
                onBack={() => {
                  setActivePropertyId(null);
                  fetchProperties();
                }}
                isFavorite={favorites.includes(selectedProperty.id)}
                onToggleFavorite={(id) => handleToggleFavorite(id)}
                onShare={(prop) => handleShare(prop)}
                currentUser={currentUser}
                onOpenLogin={() => setShowLoginModal(true)}
                onSendMessage={handleSendMessage}
                onContactLead={handleContactLead}
                onReport={handleReportListing}
              />
            ) : (
              <div id="listings-section" className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pb-20">
                
                {/* Result count & filters feedback */}
                <div id="results-count-bar" className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 mb-6">
                  <div>
                    <h2 className="text-xl font-bold font-display text-slate-900 tracking-tight flex items-center space-x-2">
                      <Filter className="h-5 w-5 text-emerald-600" />
                      <span>Verified Properties Listings</span>
                    </h2>
                    <p className="text-slate-400 text-xs font-light mt-0.5">Showing {filteredProperties.length} active listings matching filter.</p>
                  </div>
                </div>

                {/* Properties grid listings layout */}
                {filteredProperties.length === 0 ? (
                  <div id="properties-empty-state" className="text-center py-16 bg-white border border-slate-100 rounded-3xl p-8 shadow-sm space-y-4">
                    <MapPin className="h-12 w-12 text-slate-300 mx-auto" />
                    {properties.length === 0 ? (
                      <>
                        <h3 className="font-display font-bold text-lg text-slate-800">No property listings posted yet</h3>
                        <p className="text-sm text-slate-500 font-light max-w-sm mx-auto">
                          Be the first agent or landlord to publish a verified property for rent or sale on RentNaija!
                        </p>
                        <button
                          onClick={() => {
                            if (!currentUser) {
                              setShowLoginModal(true);
                            } else {
                              setActiveTab('dashboard');
                            }
                          }}
                          className="px-6 py-2.5 rounded-xl text-xs font-bold bg-emerald-600 hover:bg-emerald-700 text-white shadow-md cursor-pointer transition-all inline-flex items-center space-x-2"
                        >
                          <Sparkles className="h-4 w-4" />
                          <span>Post First Property Listing</span>
                        </button>
                      </>
                    ) : (
                      <>
                        <h3 className="font-display font-bold text-lg text-slate-800">No properties match your filters</h3>
                        <p className="text-sm text-slate-500 font-light max-w-sm mx-auto">
                          Try expanding your price sliders or changing bedroom selections to locate general apartments across Lagos and Abuja.
                        </p>
                        <button
                          onClick={() => handleSearch({
                            state: 'All', city: 'All', area: '', propertyType: 'All',
                            type: 'all', minPrice: '', maxPrice: '', bedrooms: 'Any',
                            bathrooms: 'Any', furnished: 'Any'
                          })}
                          className="px-6 py-2 rounded-xl text-xs font-bold bg-emerald-600 hover:bg-emerald-700 text-white shadow-md cursor-pointer"
                        >
                          Reset All Filters
                        </button>
                      </>
                    )}
                  </div>
                ) : (
                  <div id="listings-grid-layout" className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                    {filteredProperties.map(p => (
                      <ListingCard
                        key={p.id}
                        property={p}
                        onViewDetails={(id) => {
                          setActivePropertyId(id);
                          // Trigger viewed tracker API
                          fetch(`/api/properties/${id}/view`, { method: 'POST' });
                        }}
                        isFavorite={favorites.includes(p.id)}
                        onToggleFavorite={handleToggleFavorite}
                        onShare={handleShare}
                      />
                    ))}
                  </div>
                )}

              </div>
            )}

          </div>
        )}

        {/* TABS 2: MESSAGES INBOX SCREEN */}
        {activeTab === 'messages' && (
          <MessagesInbox
            currentUser={currentUser}
            messages={messages}
            properties={properties}
            onSendMessage={handleSendMessage}
            onSelectTab={(tab) => {
              setActiveTab(tab as any);
              setActivePropertyId(null);
            }}
            onOpenLogin={() => setShowLoginModal(true)}
          />
        )}

        {/* TABS 5: USER ACCOUNT DASHBOARD SCREEN */}
        {activeTab === 'dashboard' && (
          <AccountDashboard
            currentUser={currentUser}
            onUpdateProfile={handleUpdateProfile}
            properties={properties}
            favorites={favorites}
            onToggleFavorite={(id) => handleToggleFavorite(id)}
            onViewListing={(id) => {
              setActivePropertyId(id);
              setActiveTab('home');
            }}
            onDeleteListing={handleDeleteListing}
            messages={messages}
            reports={reports}
            onResolveReport={handleResolveReport}
            onVerifyAgent={handleVerifyAgent}
            allUsers={allUsers}
            onOpenPaymentModal={handleOpenPaymentModal}
            onRefreshData={fetchMetadata}
            onNavigateTab={(tab) => {
              setActiveTab(tab as any);
              setActivePropertyId(null);
            }}
          />
        )}

      </main>

      {/* Floating Smart AI Advisor Assistant chatbot */}
      <Chatbot propertyId={activePropertyId || undefined} />

      {/* System Modals components */}
      <LoginModal
        isOpen={showLoginModal}
        onClose={() => setShowLoginModal(false)}
        onLoginSuccess={handleLoginSuccess}
      />

      <PaymentsModal
        isOpen={paymentModalData.isOpen}
        onClose={() => setPaymentModalData(prev => ({ ...prev, isOpen: false }))}
        purpose={paymentModalData.purpose}
        propertyId={paymentModalData.propertyId}
        userId={paymentModalData.userId}
        amount={paymentModalData.amount}
        onPaymentSuccess={handlePaymentSuccess}
      />

    </div>
  );
}
