import React, { useState, useEffect } from 'react';
import { 
  User, Settings, Heart, MessageSquare, TrendingUp, ShieldCheck, Trash2, 
  CheckCircle, PlusCircle, CreditCard, BarChart2, ShieldAlert, BadgeHelp, Check, Sparkles, Home, Key, Users, Clock, CheckCircle2, XCircle, AlertCircle
} from 'lucide-react';
import { Property, Message, UserProfile, ReviewReport, Booking } from '../types';
import { 
  fetchBookingsFromFirestore, 
  updateBookingStatusInFirestore, 
  deleteBookingInFirestore,
  updateUserRoleInFirestore,
  toggleUserStatusInFirestore,
  deleteUserFromFirestore,
  deletePropertyInFirestore,
  SUPER_ADMIN_EMAIL
} from '../lib/firebaseService';

interface AccountDashboardProps {
  currentUser: UserProfile | null;
  onUpdateProfile: (updatedData: Partial<UserProfile>) => void;
  properties: Property[];
  favorites: string[];
  onToggleFavorite: (id: string) => void;
  onViewListing: (id: string) => void;
  onDeleteListing: (id: string) => void;
  messages: Message[];
  reports: ReviewReport[];
  onResolveReport: (id: string, status: 'resolved' | 'dismissed') => void;
  onVerifyAgent: (userId: string, badge: 'standard' | 'verified' | 'premium', verified: boolean) => void;
  allUsers: UserProfile[];
  onOpenPaymentModal: (purpose: 'premium' | 'featured', listingId?: string, amount?: number) => void;
  onRefreshData?: () => void;
}

export default function AccountDashboard({
  currentUser,
  onUpdateProfile,
  properties,
  favorites,
  onToggleFavorite,
  onViewListing,
  onDeleteListing,
  messages,
  reports,
  onResolveReport,
  onVerifyAgent,
  allUsers,
  onOpenPaymentModal,
  onRefreshData
}: AccountDashboardProps) {
  const [activeSubTab, setActiveSubTab] = useState<'profile' | 'favorites' | 'listings' | 'analytics' | 'bookings' | 'admin-reports' | 'admin-agents' | 'admin-users'>('profile');
  
  // Profile Form States
  const [name, setName] = useState(currentUser?.name || '');
  const [phone, setPhone] = useState(currentUser?.phone || '');
  const [companyName, setCompanyName] = useState(currentUser?.companyName || '');
  const [avatar, setAvatar] = useState(currentUser?.avatar || '');
  const [updateSuccess, setUpdateSuccess] = useState(false);

  // Firestore Bookings State
  const [firestoreBookings, setFirestoreBookings] = useState<Booking[]>([]);
  const [loadingBookings, setLoadingBookings] = useState(false);
  
  // Firestore Users state for Admin CRUD
  const [firestoreUsers, setFirestoreUsers] = useState<UserProfile[]>(allUsers);
  const [userSearchTerm, setUserSearchTerm] = useState('');

  // Sync firestore users prop
  useEffect(() => {
    setFirestoreUsers(allUsers);
  }, [allUsers]);

  // Fetch Firestore bookings on active tab change
  useEffect(() => {
    if (activeSubTab === 'bookings' && currentUser) {
      loadBookings();
    }
  }, [activeSubTab, currentUser]);

  const loadBookings = async () => {
    setLoadingBookings(true);
    try {
      const data = await fetchBookingsFromFirestore(currentUser);
      setFirestoreBookings(data);
    } catch (err) {
      console.error('Error loading bookings:', err);
    } finally {
      setLoadingBookings(false);
    }
  };

  const handleUpdateBookingStatus = async (bookingId: string, status: 'pending' | 'approved' | 'rejected' | 'completed' | 'cancelled') => {
    try {
      await updateBookingStatusInFirestore(bookingId, status);
      setFirestoreBookings(prev => prev.map(b => b.id === bookingId ? { ...b, status } : b));
    } catch (err) {
      console.error('Failed to update booking status:', err);
      alert('Error updating booking status');
    }
  };

  const handleDeleteBooking = async (bookingId: string) => {
    if (!window.confirm('Delete this booking record from Firestore?')) return;
    try {
      await deleteBookingInFirestore(bookingId);
      setFirestoreBookings(prev => prev.filter(b => b.id !== bookingId));
    } catch (err) {
      console.error('Failed to delete booking:', err);
    }
  };

  const handleAdminChangeUserRole = async (uid: string, newRole: 'landlord' | 'customer' | 'admin') => {
    try {
      await updateUserRoleInFirestore(uid, newRole);
      setFirestoreUsers(prev => prev.map(u => u.id === uid ? { ...u, role: newRole } : u));
      if (onRefreshData) onRefreshData();
    } catch (err) {
      console.error('Failed to update user role:', err);
      alert('Error updating user role');
    }
  };

  const handleAdminToggleUserStatus = async (uid: string, currentDisabled?: boolean) => {
    const nextDisabled = !currentDisabled;
    try {
      await toggleUserStatusInFirestore(uid, nextDisabled);
      setFirestoreUsers(prev => prev.map(u => u.id === uid ? { ...u, disabled: nextDisabled } : u));
      if (onRefreshData) onRefreshData();
    } catch (err) {
      console.error('Failed to toggle user status:', err);
    }
  };

  const handleAdminDeleteUser = async (uid: string, userEmail: string) => {
    if (userEmail.toLowerCase() === SUPER_ADMIN_EMAIL) {
      alert('Super Admin user cannot be deleted!');
      return;
    }
    if (!window.confirm(`Are you sure you want to delete user ${userEmail} from Firestore?`)) return;
    try {
      await deleteUserFromFirestore(uid);
      setFirestoreUsers(prev => prev.filter(u => u.id !== uid));
      if (onRefreshData) onRefreshData();
    } catch (err) {
      console.error('Failed to delete user:', err);
    }
  };

  const handleProfileSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onUpdateProfile({ name, phone, companyName, avatar });
    setUpdateSuccess(true);
    setTimeout(() => setUpdateSuccess(false), 3000);
  };

  const formatPrice = (price: number) => {
    return new Intl.NumberFormat('en-NG', {
      style: 'currency',
      currency: 'NGN',
      maximumFractionDigits: 0
    }).format(price);
  };

  if (!currentUser) {
    return (
      <div id="dashboard-empty-state" className="max-w-4xl mx-auto px-4 py-12 text-center space-y-4">
        <User className="h-16 w-16 text-slate-300 mx-auto" />
        <h2 className="text-xl font-bold text-slate-800 font-display">Dashboard requires login</h2>
        <p className="text-slate-500 font-light max-w-sm mx-auto text-sm">
          Join RentNaija as a tenant, buyer, landlord, or verified estate agent to manage your profile and properties.
        </p>
      </div>
    );
  }

  // Filter listings owned by this user
  const userListings = properties.filter(p => p.agent.id === currentUser.id);
  const favoriteProperties = properties.filter(p => favorites.includes(p.id));

  // Compute stats for analytics
  const totalViews = userListings.reduce((sum, p) => sum + p.views, 0);
  const totalLeads = userListings.reduce((sum, p) => sum + p.leads, 0);
  const conversionRate = totalViews > 0 ? ((totalLeads / totalViews) * 100).toFixed(1) : '0.0';

  return (
    <div id="dashboard-root" className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 pb-24">
      {/* Upper grid container */}
      <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
        
        {/* Left Side: Navigation Links & Profile summary */}
        <div className="lg:col-span-1 space-y-6">
          
          {/* Miniature card */}
          <div className="bg-white p-6 rounded-2xl border border-slate-100 shadow-sm text-center space-y-3">
            <div className="relative inline-block">
              {currentUser.avatar ? (
                <img
                  src={currentUser.avatar}
                  alt={currentUser.name}
                  className="h-20 w-20 rounded-full object-cover border-4 border-emerald-500/10 mx-auto"
                  referrerPolicy="no-referrer"
                />
              ) : (
                <div className="h-20 w-20 rounded-full bg-slate-100 text-slate-400 flex items-center justify-center border-4 border-emerald-500/10 mx-auto">
                  <User className="h-10 w-10 text-slate-400" />
                </div>
              )}
              {currentUser.verifiedAgent && (
                <ShieldCheck className="h-5 w-5 text-emerald-600 bg-white rounded-full absolute bottom-0 right-0 p-0.5 shadow" />
              )}
            </div>
            <div>
              <h3 className="font-display font-bold text-slate-900 leading-tight">{currentUser.name}</h3>
              <p className="text-xs text-slate-400 mt-0.5 font-mono capitalize">{currentUser.role} Account</p>
            </div>

            {/* Premium Badging status */}
            <div className="pt-2">
              {currentUser.badge === 'premium' ? (
                <span className="inline-flex items-center space-x-1 px-3 py-1 rounded-full text-[10px] font-extrabold bg-emerald-100 border border-emerald-200 text-emerald-800 uppercase tracking-widest">
                  <Sparkles className="h-3 w-3" />
                  <span>Premium Agent</span>
                </span>
              ) : currentUser.badge === 'verified' ? (
                <span className="inline-flex items-center space-x-1 px-3 py-1 rounded-full text-[10px] font-extrabold bg-blue-50 border border-blue-100 text-blue-700 uppercase tracking-widest">
                  <ShieldCheck className="h-3 w-3" />
                  <span>Verified Partner</span>
                </span>
              ) : (
                <button
                  onClick={() => onOpenPaymentModal('premium', undefined, 15000)}
                  className="px-4 py-1.5 rounded-full text-[10px] font-bold bg-gradient-to-r from-emerald-600 to-teal-500 hover:from-emerald-700 hover:to-teal-600 text-white shadow-md transition-all cursor-pointer uppercase tracking-wider"
                >
                  Upgrade to Premium
                </button>
              )}
            </div>
          </div>

          {/* Tab Selection Navigation */}
          <div className="bg-white rounded-2xl border border-slate-100 shadow-sm overflow-hidden">
            <nav className="flex flex-col text-sm font-medium">
              
              <button
                onClick={() => setActiveSubTab('profile')}
                className={`p-3.5 text-left border-l-4 flex items-center space-x-2.5 transition-all cursor-pointer ${
                  activeSubTab === 'profile'
                    ? 'border-emerald-600 bg-emerald-50 text-emerald-700'
                    : 'border-transparent text-slate-600 hover:bg-slate-50'
                }`}
              >
                <Settings className="h-4.5 w-4.5 text-slate-400" />
                <span>Account Profile</span>
              </button>

              <button
                onClick={() => setActiveSubTab('favorites')}
                className={`p-3.5 text-left border-l-4 flex items-center space-x-2.5 transition-all cursor-pointer ${
                  activeSubTab === 'favorites'
                    ? 'border-emerald-600 bg-emerald-50 text-emerald-700'
                    : 'border-transparent text-slate-600 hover:bg-slate-50'
                }`}
              >
                <Heart className="h-4.5 w-4.5 text-slate-400" />
                <span>Saved Favorites ({favorites.length})</span>
              </button>

              <button
                onClick={() => setActiveSubTab('bookings')}
                className={`p-3.5 text-left border-l-4 flex items-center space-x-2.5 transition-all cursor-pointer ${
                  activeSubTab === 'bookings'
                    ? 'border-emerald-600 bg-emerald-50 text-emerald-700'
                    : 'border-transparent text-slate-600 hover:bg-slate-50'
                }`}
              >
                <Key className="h-4.5 w-4.5 text-emerald-600" />
                <span>Rental Bookings ({firestoreBookings.length})</span>
              </button>

              {(currentUser.role === 'agent' || currentUser.role === 'landlord' || currentUser.role === 'admin') && (
                <>
                  <button
                    onClick={() => setActiveSubTab('listings')}
                    className={`p-3.5 text-left border-l-4 flex items-center space-x-2.5 transition-all cursor-pointer ${
                      activeSubTab === 'listings'
                        ? 'border-emerald-600 bg-emerald-50 text-emerald-700'
                        : 'border-transparent text-slate-600 hover:bg-slate-50'
                    }`}
                  >
                    <PlusCircle className="h-4.5 w-4.5 text-slate-400" />
                    <span>My Properties ({userListings.length})</span>
                  </button>

                  <button
                    onClick={() => setActiveSubTab('analytics')}
                    className={`p-3.5 text-left border-l-4 flex items-center space-x-2.5 transition-all cursor-pointer ${
                      activeSubTab === 'analytics'
                        ? 'border-emerald-600 bg-emerald-50 text-emerald-700'
                        : 'border-transparent text-slate-600 hover:bg-slate-50'
                    }`}
                  >
                    <TrendingUp className="h-4.5 w-4.5 text-slate-400" />
                    <span>Performance Stats</span>
                  </button>
                </>
              )}

              {/* Admin specific panels */}
              {currentUser.role === 'admin' && (
                <>
                  <div className="bg-slate-50 px-4 py-2 text-[10px] font-bold text-slate-400 uppercase tracking-widest border-t border-slate-100">
                    Super Admin Controls
                  </div>

                  <button
                    onClick={() => setActiveSubTab('admin-users')}
                    className={`p-3.5 text-left border-l-4 flex items-center space-x-2.5 transition-all cursor-pointer ${
                      activeSubTab === 'admin-users'
                        ? 'border-purple-600 bg-purple-50 text-purple-700'
                        : 'border-transparent text-slate-600 hover:bg-slate-50'
                    }`}
                  >
                    <Users className="h-4.5 w-4.5 text-purple-600" />
                    <span>User Accounts CRUD ({firestoreUsers.length})</span>
                  </button>
                  
                  <button
                    onClick={() => setActiveSubTab('admin-reports')}
                    className={`p-3.5 text-left border-l-4 flex items-center space-x-2.5 transition-all cursor-pointer ${
                      activeSubTab === 'admin-reports'
                        ? 'border-red-600 bg-red-50 text-red-700'
                        : 'border-transparent text-slate-600 hover:bg-slate-50'
                    }`}
                  >
                    <ShieldAlert className="h-4.5 w-4.5 text-red-500" />
                    <span>Reported Scams ({reports.length})</span>
                  </button>

                  <button
                    onClick={() => setActiveSubTab('admin-agents')}
                    className={`p-3.5 text-left border-l-4 flex items-center space-x-2.5 transition-all cursor-pointer ${
                      activeSubTab === 'admin-agents'
                        ? 'border-emerald-600 bg-emerald-50 text-emerald-700'
                        : 'border-transparent text-slate-600 hover:bg-slate-50'
                    }`}
                  >
                    <ShieldCheck className="h-4.5 w-4.5 text-emerald-600" />
                    <span>Verify Agents / Partners</span>
                  </button>
                </>
              )}

            </nav>
          </div>

        </div>

        {/* Right Side: Main Detail Tabs contents */}
        <div className="lg:col-span-3">
          
          {/* 1. PROFILE SUBTAB */}
          {activeSubTab === 'profile' && (
            <div className="bg-white p-6 rounded-2xl border border-slate-100 shadow-sm space-y-6">
              <div className="border-b border-slate-100 pb-3">
                <h2 className="text-lg font-bold font-display text-slate-900">Manage Account Credentials</h2>
                <p className="text-xs text-slate-400 font-light">Edit user details registered on RentNaija.</p>
              </div>

              <form onSubmit={handleProfileSubmit} className="space-y-4">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="text-xs font-semibold text-slate-600 block mb-1">Full Legal Name</label>
                    <input
                      required
                      type="text"
                      value={name}
                      onChange={(e) => setName(e.target.value)}
                      className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 h-11 text-xs text-slate-800 focus:outline-none focus:ring-2 focus:ring-emerald-500"
                    />
                  </div>

                  <div>
                    <label className="text-xs font-semibold text-slate-600 block mb-1">WhatsApp/Phone Number</label>
                    <input
                      required
                      type="text"
                      value={phone}
                      onChange={(e) => setPhone(e.target.value)}
                      className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 h-11 text-xs text-slate-800 focus:outline-none focus:ring-2 focus:ring-emerald-500"
                    />
                  </div>

                  {currentUser.role === 'agent' && (
                    <div className="sm:col-span-2">
                      <label className="text-xs font-semibold text-slate-600 block mb-1">Agency Company Name</label>
                      <input
                        type="text"
                        placeholder="e.g. Chinedu Okafor & Partners Real Estate"
                        value={companyName}
                        onChange={(e) => setCompanyName(e.target.value)}
                        className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 h-11 text-xs text-slate-800 focus:outline-none focus:ring-2 focus:ring-emerald-500"
                      />
                    </div>
                  )}

                  <div className="sm:col-span-2">
                    <label className="text-xs font-semibold text-slate-600 block mb-1">Avatar Image link</label>
                    <input
                      type="url"
                      value={avatar}
                      onChange={(e) => setAvatar(e.target.value)}
                      className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 h-11 text-xs text-slate-800 focus:outline-none focus:ring-2 focus:ring-emerald-500"
                    />
                  </div>
                </div>

                <div className="pt-2">
                  <button
                    type="submit"
                    className="px-6 py-2.5 rounded-xl bg-slate-900 hover:bg-slate-800 text-white text-xs font-bold transition-all cursor-pointer"
                  >
                    Save Profile Settings
                  </button>
                </div>

                {updateSuccess && (
                  <div className="p-3 bg-emerald-50 border border-emerald-100 text-emerald-700 text-xs rounded-xl font-medium">
                    Profile successfully updated across RentNaija database!
                  </div>
                )}
              </form>
            </div>
          )}

          {/* 2. FAVORITES SUBTAB */}
          {activeSubTab === 'favorites' && (
            <div className="bg-white p-6 rounded-2xl border border-slate-100 shadow-sm space-y-4">
              <div className="border-b border-slate-100 pb-3">
                <h2 className="text-lg font-bold font-display text-slate-900">Your Saved Listings</h2>
                <p className="text-xs text-slate-400 font-light">Properties bookmarked for easy inspection booking.</p>
              </div>

              {favoriteProperties.length === 0 ? (
                <div className="text-center py-8 text-slate-400 space-y-2">
                  <Heart className="h-10 w-10 text-slate-200 mx-auto" />
                  <p className="text-xs font-light">No properties saved yet.</p>
                </div>
              ) : (
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  {favoriteProperties.map(p => (
                    <div key={p.id} className="p-3.5 border border-slate-100 rounded-xl flex items-center space-x-3 hover:bg-slate-50 transition-all">
                      <img src={p.images[0]} alt="" className="h-14 w-14 rounded-lg object-cover" referrerPolicy="no-referrer" />
                      <div className="flex-1 min-w-0">
                        <h4 className="text-xs font-bold text-slate-800 truncate">{p.title}</h4>
                        <p className="text-[10px] font-mono text-emerald-600 font-bold mt-0.5">{formatPrice(p.price)}</p>
                        <p className="text-[10px] text-slate-400 truncate">{p.area}, {p.city}</p>
                      </div>
                      <div className="flex flex-col space-y-1">
                        <button
                          onClick={() => onViewListing(p.id)}
                          className="px-2.5 py-1 text-[9px] bg-emerald-600 hover:bg-emerald-700 text-white font-bold rounded cursor-pointer"
                        >
                          View
                        </button>
                        <button
                          onClick={() => onToggleFavorite(p.id)}
                          className="px-2.5 py-1 text-[9px] bg-red-50 hover:bg-red-100 text-red-600 font-semibold rounded cursor-pointer"
                        >
                          Remove
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}

          {/* 3. LISTINGS MANAGEMENT SUBTAB */}
          {activeSubTab === 'listings' && (
            <div className="bg-white p-6 rounded-2xl border border-slate-100 shadow-sm space-y-4">
              <div className="border-b border-slate-100 pb-3">
                <h2 className="text-lg font-bold font-display text-slate-900">Your Active Property Catalog</h2>
                <p className="text-xs text-slate-400 font-light font-light">Properties listed under your agency name.</p>
              </div>

              {userListings.length === 0 ? (
                <div className="text-center py-8 text-slate-400 space-y-2">
                  <Home className="h-10 w-10 text-slate-200 mx-auto" />
                  <p className="text-xs font-light">You have not created any listings yet.</p>
                </div>
              ) : (
                <div className="overflow-x-auto no-scrollbar">
                  <table className="w-full text-left border-collapse text-xs">
                    <thead>
                      <tr className="border-b border-slate-100 text-slate-400 font-semibold bg-slate-50/50">
                        <th className="p-3">Property</th>
                        <th className="p-3">Rent / Price</th>
                        <th className="p-3 text-center">Views</th>
                        <th className="p-3 text-center">Leads</th>
                        <th className="p-3 text-center">Featured</th>
                        <th className="p-3 text-right">Actions</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-50 font-medium">
                      {userListings.map(p => (
                        <tr key={p.id} className="hover:bg-slate-50/40">
                          <td className="p-3">
                            <div className="flex items-center space-x-3 max-w-[240px]">
                              <img src={p.images[0]} alt="" className="h-10 w-10 rounded object-cover shrink-0" referrerPolicy="no-referrer" />
                              <span className="truncate block font-bold text-slate-800">{p.title}</span>
                            </div>
                          </td>
                          <td className="p-3 font-semibold text-slate-700">{formatPrice(p.price)}</td>
                          <td className="p-3 text-center text-slate-500 font-mono">{p.views}</td>
                          <td className="p-3 text-center text-slate-500 font-mono">{p.leads}</td>
                          <td className="p-3 text-center">
                            {p.featured ? (
                              <span className="bg-emerald-100 text-emerald-800 text-[9px] px-2 py-0.5 rounded font-bold uppercase">Yes</span>
                            ) : (
                              <button
                                onClick={() => onOpenPaymentModal('featured', p.id, 5000)}
                                className="text-emerald-600 hover:text-emerald-800 text-[10px] font-bold underline cursor-pointer"
                              >
                                Boost Listing
                              </button>
                            )}
                          </td>
                          <td className="p-3 text-right">
                            <div className="flex items-center justify-end space-x-2">
                              <button
                                onClick={() => onViewListing(p.id)}
                                className="text-slate-600 hover:text-emerald-600 font-bold"
                              >
                                View
                              </button>
                              <button
                                onClick={() => onDeleteListing(p.id)}
                                className="text-red-500 hover:text-red-700 font-bold"
                              >
                                Delete
                              </button>
                            </div>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </div>
          )}

          {/* 4. PERFORMANCE STATS SUBTAB */}
          {activeSubTab === 'analytics' && (
            <div className="space-y-6">
              
              {/* Counter Grid */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                
                <div className="bg-white p-5 rounded-2xl border border-slate-100 shadow-sm flex items-center space-x-4">
                  <div className="p-3 bg-blue-50 text-blue-600 rounded-xl">
                    <BarChart2 className="h-6 w-6" />
                  </div>
                  <div>
                    <p className="text-[10px] text-slate-400 font-bold uppercase">Properties Views</p>
                    <h3 className="text-xl font-bold text-slate-800 font-mono">{totalViews}</h3>
                  </div>
                </div>

                <div className="bg-white p-5 rounded-2xl border border-slate-100 shadow-sm flex items-center space-x-4">
                  <div className="p-3 bg-emerald-50 text-emerald-600 rounded-xl">
                    <TrendingUp className="h-6 w-6" />
                  </div>
                  <div>
                    <p className="text-[10px] text-slate-400 font-bold uppercase">Leads Contacted</p>
                    <h3 className="text-xl font-bold text-slate-800 font-mono">{totalLeads}</h3>
                  </div>
                </div>

                <div className="bg-white p-5 rounded-2xl border border-slate-100 shadow-sm flex items-center space-x-4">
                  <div className="p-3 bg-indigo-50 text-indigo-600 rounded-xl">
                    <CheckCircle className="h-6 w-6" />
                  </div>
                  <div>
                    <p className="text-[10px] text-slate-400 font-bold uppercase">Conversion Rate</p>
                    <h3 className="text-xl font-bold text-slate-800 font-mono">{conversionRate}%</h3>
                  </div>
                </div>

              </div>

              {/* Graphic Trend Chart mockup inside card */}
              <div className="bg-white p-6 rounded-2xl border border-slate-100 shadow-sm space-y-4">
                <div>
                  <h3 className="text-sm font-bold font-display text-slate-900">Weekly Inquiries Flow Trend</h3>
                  <p className="text-slate-400 text-xs font-light">Real-time performance tracked via RentNaija server gateways.</p>
                </div>

                {/* Custom responsive premium SVG line chart */}
                <div className="relative h-48 w-full bg-slate-50 rounded-xl border border-slate-100 p-2 flex flex-col justify-between overflow-hidden">
                  
                  {/* Background Grid Lines */}
                  <div className="absolute inset-x-0 top-1/4 border-b border-slate-200/50" />
                  <div className="absolute inset-x-0 top-2/4 border-b border-slate-200/50" />
                  <div className="absolute inset-x-0 top-3/4 border-b border-slate-200/50" />

                  {/* SVG Chart paths */}
                  <svg className="absolute inset-0 h-full w-full pointer-events-none" viewBox="0 0 100 100" preserveAspectRatio="none">
                    <defs>
                      <linearGradient id="chartGrad" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="0%" stopColor="#059669" stopOpacity="0.2"/>
                        <stop offset="100%" stopColor="#059669" stopOpacity="0"/>
                      </linearGradient>
                    </defs>
                    <path 
                      d="M 5 80 Q 20 60 35 45 T 65 30 T 95 15" 
                      fill="none" 
                      stroke="#059669" 
                      strokeWidth="2"
                    />
                    <path 
                      d="M 5 80 Q 20 60 35 45 T 65 30 T 95 15 L 95 100 L 5 100 Z" 
                      fill="url(#chartGrad)"
                    />
                    {/* Dots */}
                    <circle cx="35" cy="45" r="1.5" fill="#059669" />
                    <circle cx="65" cy="30" r="1.5" fill="#059669" />
                    <circle cx="95" cy="15" r="1.5" fill="#059669" />
                  </svg>

                  {/* UI Axes labels */}
                  <div className="flex justify-between text-[9px] font-bold text-slate-400 z-10 font-mono mt-auto">
                    <span>MON</span>
                    <span>TUE</span>
                    <span>WED</span>
                    <span>THU</span>
                    <span>FRI</span>
                    <span>SAT</span>
                    <span>SUN</span>
                  </div>
                </div>

                {/* Business recommendation */}
                <div className="p-3.5 bg-emerald-50 border border-emerald-100 rounded-xl text-xs text-emerald-800 font-medium">
                  💡 <span className="font-bold">NaijaProp Tip:</span> Properties in Lekki Phase 1 with more than 5 high-resolution photos receive up to **85% more inquiries** than typical Mainland listings. Fill all nearby supermarket and proximity details!
                </div>
              </div>

            </div>
          )}

          {/* 5. ADMIN SUBTAB - SCAM REPORTS */}
          {activeSubTab === 'admin-reports' && (
            <div className="bg-white p-6 rounded-2xl border border-slate-100 shadow-sm space-y-4">
              <div className="border-b border-slate-100 pb-3">
                <h2 className="text-lg font-bold font-display text-slate-900 text-red-600">Reported Suspicious Listings</h2>
                <p className="text-xs text-slate-400 font-light font-light">Properties marked as scam or duplicate by users.</p>
              </div>

              {reports.length === 0 ? (
                <div className="text-center py-8 text-slate-400">
                  <CheckCircle className="h-10 w-10 text-emerald-500 mx-auto mb-2" />
                  <p className="text-xs font-light">Zero pending reports. Platform is safe!</p>
                </div>
              ) : (
                <div className="space-y-3">
                  {reports.map(r => (
                    <div key={r.id} className="p-4 bg-slate-50 rounded-xl border border-slate-100 space-y-3">
                      <div className="flex items-start justify-between">
                        <div>
                          <span className="text-[10px] font-bold uppercase tracking-wider text-red-600">{r.reason}</span>
                          <h4 className="text-xs font-bold text-slate-800">{r.propertyTitle}</h4>
                          <p className="text-[10px] text-slate-500 mt-0.5">Reporter: {r.reporterName} ({r.reporterEmail})</p>
                        </div>
                        <span className={`text-[9px] px-2 py-0.5 rounded font-extrabold uppercase ${
                          r.status === 'pending' ? 'bg-amber-100 text-amber-800' : 'bg-slate-200 text-slate-600'
                        }`}>{r.status}</span>
                      </div>

                      <p className="text-xs text-slate-600 font-light bg-white p-2 rounded border border-slate-100">
                        &quot;{r.details}&quot;
                      </p>

                      {r.status === 'pending' && (
                        <div className="flex space-x-2">
                          <button
                            onClick={() => onResolveReport(r.id, 'resolved')}
                            className="px-3 py-1.5 bg-red-600 hover:bg-red-700 text-white text-[10px] font-bold rounded cursor-pointer"
                          >
                            Resolve (Remove Listing)
                          </button>
                          <button
                            onClick={() => onResolveReport(r.id, 'dismissed')}
                            className="px-3 py-1.5 bg-slate-200 hover:bg-slate-300 text-slate-700 text-[10px] font-bold rounded cursor-pointer"
                          >
                            Dismiss Report
                          </button>
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}

          {/* 6. ADMIN SUBTAB - VERIFY PARTNERS */}
          {activeSubTab === 'admin-agents' && (
            <div className="bg-white p-6 rounded-2xl border border-slate-100 shadow-sm space-y-4">
              <div className="border-b border-slate-100 pb-3">
                <h2 className="text-lg font-bold font-display text-slate-900">Verify Registered Agents</h2>
                <p className="text-xs text-slate-400 font-light font-light">Moderate agency badges and partner authentications.</p>
              </div>

              <div className="space-y-3">
                {allUsers.filter(u => u.role === 'agent' || u.role === 'landlord').map(u => (
                  <div key={u.id} className="p-4 border border-slate-100 rounded-xl flex items-center justify-between hover:bg-slate-50 transition-all">
                    <div className="flex items-center space-x-3">
                      {u.avatar ? (
                        <img src={u.avatar} alt="" className="h-11 w-11 rounded-full object-cover" referrerPolicy="no-referrer" />
                      ) : (
                        <div className="h-11 w-11 rounded-full bg-slate-100 text-slate-400 flex items-center justify-center border border-slate-200 shrink-0">
                          <User className="h-6 w-6 text-slate-400" />
                        </div>
                      )}
                      <div>
                        <h4 className="text-xs font-bold text-slate-800 flex items-center gap-1">
                          <span>{u.name}</span>
                          {u.verifiedAgent && <ShieldCheck className="h-3.5 w-3.5 text-emerald-600" />}
                        </h4>
                        <p className="text-[10px] text-slate-400">{u.email} • {u.phone}</p>
                        <span className="text-[9px] px-2 py-0.5 rounded font-extrabold bg-slate-100 text-slate-600 uppercase mt-1 inline-block">
                          Badge: {u.badge}
                        </span>
                      </div>
                    </div>

                    <div className="flex space-x-1.5">
                      <button
                        onClick={() => onVerifyAgent(u.id, 'verified', true)}
                        className="px-2.5 py-1.5 bg-blue-600 hover:bg-blue-700 text-white text-[10px] font-bold rounded cursor-pointer"
                      >
                        Verify Partner
                      </button>
                      <button
                        onClick={() => onVerifyAgent(u.id, 'premium', true)}
                        className="px-2.5 py-1.5 bg-emerald-600 hover:bg-emerald-700 text-white text-[10px] font-bold rounded cursor-pointer"
                      >
                        Set Premium
                      </button>
                      {u.verifiedAgent && (
                        <button
                          onClick={() => onVerifyAgent(u.id, 'standard', false)}
                          className="px-2.5 py-1.5 bg-red-50 hover:bg-red-100 text-red-600 text-[10px] font-bold rounded cursor-pointer"
                        >
                          Revoke
                        </button>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* 7. BOOKINGS & RENTAL REQUESTS SUBTAB */}
          {activeSubTab === 'bookings' && (
            <div className="bg-white p-6 rounded-2xl border border-slate-100 shadow-sm space-y-4">
              <div className="border-b border-slate-100 pb-3 flex items-center justify-between">
                <div>
                  <h2 className="text-lg font-bold font-display text-slate-900 flex items-center space-x-2">
                    <Key className="h-5 w-5 text-emerald-600" />
                    <span>Rental Bookings & House Requests</span>
                  </h2>
                  <p className="text-xs text-slate-400 font-light">
                    {currentUser.role === 'customer' 
                      ? 'Houses you have requested or booked.' 
                      : currentUser.role === 'landlord'
                      ? 'Rental applications submitted by prospective tenants.'
                      : 'All system-wide house rental requests in Firestore.'}
                  </p>
                </div>
                <button
                  onClick={loadBookings}
                  className="px-3 py-1.5 bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-bold rounded-xl cursor-pointer"
                >
                  Refresh
                </button>
              </div>

              {loadingBookings ? (
                <div className="text-center py-12 text-slate-400">
                  <Clock className="h-8 w-8 animate-spin mx-auto mb-2 text-emerald-500" />
                  <p className="text-xs">Fetching bookings from Firestore...</p>
                </div>
              ) : firestoreBookings.length === 0 ? (
                <div className="text-center py-12 text-slate-400 space-y-2">
                  <Key className="h-12 w-12 text-slate-300 mx-auto" />
                  <h3 className="text-sm font-bold text-slate-700">No rental bookings recorded yet</h3>
                  <p className="text-xs text-slate-400 max-w-xs mx-auto">
                    {currentUser.role === 'customer' 
                      ? 'Browse verified properties on the home page and click "Rent / Book This House".' 
                      : 'When tenants submit booking requests on your listings, they will appear here.'}
                  </p>
                </div>
              ) : (
                <div className="space-y-4">
                  {firestoreBookings.map(b => (
                    <div key={b.id} className="p-4 bg-slate-50 border border-slate-200/70 rounded-2xl flex flex-col md:flex-row md:items-center justify-between gap-4">
                      
                      <div className="flex items-start space-x-4">
                        {b.propertyImage ? (
                          <img src={b.propertyImage} alt="" className="h-16 w-20 rounded-xl object-cover shrink-0 border border-slate-200" />
                        ) : (
                          <div className="h-16 w-20 rounded-xl bg-slate-200 text-slate-400 flex items-center justify-center shrink-0">
                            <Home className="h-6 w-6" />
                          </div>
                        )}

                        <div className="space-y-1">
                          <div className="flex items-center space-x-2">
                            <h4 className="text-sm font-bold text-slate-900">{b.propertyTitle}</h4>
                            <span className={`text-[9px] px-2 py-0.5 rounded-md font-extrabold uppercase ${
                              b.status === 'approved' ? 'bg-emerald-100 text-emerald-800 border border-emerald-200' :
                              b.status === 'rejected' ? 'bg-red-100 text-red-800 border border-red-200' :
                              b.status === 'completed' ? 'bg-blue-100 text-blue-800 border border-blue-200' :
                              b.status === 'cancelled' ? 'bg-slate-200 text-slate-700' :
                              'bg-amber-100 text-amber-800 border border-amber-200'
                            }`}>
                              {b.status}
                            </span>
                          </div>

                          <div className="text-xs text-slate-600 space-x-3">
                            <span>Rent: <strong>{formatPrice(b.price)}</strong> / {b.period}</span>
                            <span>Duration: <strong>{b.durationMonths} Months</strong></span>
                            <span>Move-in: <strong>{b.startDate}</strong></span>
                          </div>

                          <div className="text-[11px] text-slate-500 pt-1 flex flex-wrap gap-x-4">
                            <span>Tenant: <strong>{b.customerName}</strong> ({b.customerEmail} • {b.customerPhone})</span>
                            <span>Landlord: <strong>{b.landlordName}</strong> ({b.landlordPhone})</span>
                          </div>

                          {b.notes && (
                            <p className="text-[11px] text-slate-600 bg-white p-2 rounded-lg border border-slate-200/80 italic mt-1">
                              &quot;{b.notes}&quot;
                            </p>
                          )}
                        </div>
                      </div>

                      {/* Action buttons */}
                      <div className="flex flex-wrap items-center gap-2 border-t md:border-t-0 pt-3 md:pt-0 border-slate-200">
                        {(currentUser.role === 'landlord' || currentUser.role === 'admin') && b.status === 'pending' && (
                          <>
                            <button
                              onClick={() => handleUpdateBookingStatus(b.id, 'approved')}
                              className="px-3 py-1.5 bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold rounded-xl cursor-pointer flex items-center space-x-1"
                            >
                              <CheckCircle2 className="h-3.5 w-3.5" />
                              <span>Approve</span>
                            </button>
                            <button
                              onClick={() => handleUpdateBookingStatus(b.id, 'rejected')}
                              className="px-3 py-1.5 bg-red-100 hover:bg-red-200 text-red-700 text-xs font-bold rounded-xl cursor-pointer flex items-center space-x-1"
                            >
                              <XCircle className="h-3.5 w-3.5" />
                              <span>Reject</span>
                            </button>
                          </>
                        )}

                        {currentUser.role === 'customer' && b.status === 'pending' && (
                          <button
                            onClick={() => handleUpdateBookingStatus(b.id, 'cancelled')}
                            className="px-3 py-1.5 bg-slate-200 hover:bg-slate-300 text-slate-700 text-xs font-bold rounded-xl cursor-pointer"
                          >
                            Cancel Request
                          </button>
                        )}

                        {(currentUser.role === 'admin' || b.customerUid === currentUser.id || b.landlordUid === currentUser.id) && (
                          <button
                            onClick={() => handleDeleteBooking(b.id)}
                            className="p-1.5 text-slate-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-all cursor-pointer"
                            title="Delete Booking Record"
                          >
                            <Trash2 className="h-4 w-4" />
                          </button>
                        )}
                      </div>

                    </div>
                  ))}
                </div>
              )}
            </div>
          )}

          {/* 8. SUPER ADMIN SUBTAB - USER ACCOUNTS CRUD */}
          {activeSubTab === 'admin-users' && currentUser.role === 'admin' && (
            <div className="bg-white p-6 rounded-2xl border border-slate-100 shadow-sm space-y-6">
              
              <div className="border-b border-slate-100 pb-3 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                <div>
                  <h2 className="text-lg font-bold font-display text-slate-900 flex items-center space-x-2">
                    <Users className="h-5 w-5 text-purple-600" />
                    <span>Firestore User Accounts Management (CRUD)</span>
                  </h2>
                  <p className="text-xs text-slate-400 font-light">
                    Super Admin controls for <strong className="font-bold text-slate-700">{SUPER_ADMIN_EMAIL}</strong>. Create, read, update role, toggle status, and delete user profiles in Firestore.
                  </p>
                </div>

                <div className="w-full sm:w-64">
                  <input
                    type="text"
                    placeholder="Search users by name or email..."
                    value={userSearchTerm}
                    onChange={(e) => setUserSearchTerm(e.target.value)}
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-1.5 text-xs text-slate-800 focus:outline-none focus:ring-2 focus:ring-purple-500"
                  />
                </div>
              </div>

              {/* User List Table / Cards */}
              <div className="space-y-3">
                {firestoreUsers
                  .filter(u => 
                    !userSearchTerm || 
                    u.name.toLowerCase().includes(userSearchTerm.toLowerCase()) || 
                    u.email.toLowerCase().includes(userSearchTerm.toLowerCase())
                  )
                  .map(u => (
                    <div key={u.id} className="p-4 bg-slate-50 border border-slate-200/70 rounded-2xl flex flex-col md:flex-row md:items-center justify-between gap-4">
                      
                      <div className="flex items-center space-x-3">
                        {u.avatar ? (
                          <img src={u.avatar} alt="" className="h-11 w-11 rounded-full object-cover border border-slate-300 shrink-0" referrerPolicy="no-referrer" />
                        ) : (
                          <div className="h-11 w-11 rounded-full bg-slate-200 text-slate-500 flex items-center justify-center border border-slate-300 shrink-0 font-bold text-sm">
                            {u.name ? u.name[0].toUpperCase() : 'U'}
                          </div>
                        )}

                        <div className="space-y-0.5">
                          <div className="flex items-center space-x-2">
                            <h4 className="text-xs font-bold text-slate-900">{u.name}</h4>
                            {u.email.toLowerCase() === SUPER_ADMIN_EMAIL && (
                              <span className="text-[9px] px-2 py-0.5 rounded-full font-extrabold bg-purple-100 text-purple-800 border border-purple-300">
                                SUPER ADMIN
                              </span>
                            )}
                            {u.disabled && (
                              <span className="text-[9px] px-2 py-0.5 rounded-full font-extrabold bg-red-100 text-red-800 border border-red-300">
                                SUSPENDED
                              </span>
                            )}
                          </div>

                          <p className="text-[11px] text-slate-500 font-mono">{u.email} • {u.phone || 'No phone'}</p>

                          <div className="flex items-center space-x-2 pt-0.5">
                            <span className="text-[10px] text-slate-400">UID: {u.id.substring(0, 10)}...</span>
                            <span className="text-[10px] font-bold text-slate-600">Created: {u.createdAt ? new Date(u.createdAt).toLocaleDateString() : 'N/A'}</span>
                          </div>
                        </div>
                      </div>

                      {/* Admin CRUD Actions */}
                      <div className="flex items-center space-x-2 border-t md:border-t-0 pt-3 md:pt-0 border-slate-200">
                        
                        {/* Change Role Selector */}
                        <div className="flex items-center space-x-1">
                          <label className="text-[10px] font-bold text-slate-400">Role:</label>
                          <select
                            value={u.role || 'customer'}
                            onChange={(e) => handleAdminChangeUserRole(u.id, e.target.value as any)}
                            disabled={u.email.toLowerCase() === SUPER_ADMIN_EMAIL}
                            className="bg-white border border-slate-300 text-slate-800 text-xs font-bold rounded-lg px-2 py-1 focus:ring-2 focus:ring-purple-500"
                          >
                            <option value="customer">Customer</option>
                            <option value="landlord">Landlord</option>
                            <option value="admin">Admin</option>
                          </select>
                        </div>

                        {/* Toggle Account Status */}
                        {u.email.toLowerCase() !== SUPER_ADMIN_EMAIL && (
                          <button
                            onClick={() => handleAdminToggleUserStatus(u.id, u.disabled)}
                            className={`px-3 py-1 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                              u.disabled 
                                ? 'bg-emerald-100 text-emerald-800 hover:bg-emerald-200' 
                                : 'bg-amber-100 text-amber-800 hover:bg-amber-200'
                            }`}
                          >
                            {u.disabled ? 'Activate' : 'Suspend'}
                          </button>
                        )}

                        {/* Delete User from Firestore */}
                        {u.email.toLowerCase() !== SUPER_ADMIN_EMAIL && (
                          <button
                            onClick={() => handleAdminDeleteUser(u.id, u.email)}
                            className="p-1.5 text-red-500 hover:text-red-700 hover:bg-red-50 rounded-lg transition-all cursor-pointer"
                            title="Delete User from Firestore"
                          >
                            <Trash2 className="h-4 w-4" />
                          </button>
                        )}

                      </div>

                    </div>
                  ))}
              </div>

            </div>
          )}

        </div>

      </div>
    </div>
  );
}
