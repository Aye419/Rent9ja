import React from 'react';
import { Home, User, MessageSquare, ShieldCheck } from 'lucide-react';
import { UserProfile } from '../types';

interface NavbarProps {
  activeTab: 'home' | 'dashboard' | 'messages';
  setActiveTab: (tab: 'home' | 'dashboard' | 'messages') => void;
  currentUser: UserProfile | null;
  onLogout: () => void;
  onOpenLogin: () => void;
}

export default function Navbar({
  activeTab,
  setActiveTab,
  currentUser,
  onLogout,
  onOpenLogin
}: NavbarProps) {
  return (
    <header id="app-navbar" className="sticky top-0 z-50 w-full glass-card border-b border-gray-200/80 bg-white/75 backdrop-blur-md">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
        {/* Logo */}
        <div 
          id="nav-logo-container" 
          className="flex items-center space-x-2 cursor-pointer"
          onClick={() => setActiveTab('home')}
        >
          <div className="bg-emerald-600 text-white p-2 rounded-xl flex items-center justify-center shadow-md shadow-emerald-600/20">
            <Home id="logo-icon" className="h-6 w-6" />
          </div>
          <div>
            <span id="logo-text-primary" className="text-xl font-bold font-display tracking-tight text-emerald-700">Rent</span>
            <span id="logo-text-secondary" className="text-xl font-bold font-display tracking-tight text-slate-800">Naija</span>
          </div>
        </div>

        {/* Desktop Navigation */}
        <nav id="desktop-nav" className="hidden md:flex items-center space-x-1 lg:space-x-4">
          <button
            id="nav-home-btn"
            onClick={() => setActiveTab('home')}
            className={`px-3 py-2 rounded-lg text-sm font-medium transition-all duration-200 flex items-center space-x-1.5 ${
              activeTab === 'home' 
                ? 'bg-emerald-50 text-emerald-700' 
                : 'text-slate-600 hover:text-emerald-600 hover:bg-slate-50'
            }`}
          >
            <Home className="h-4 w-4" />
            <span>Marketplace</span>
          </button>

          {currentUser && (
            <button
              id="nav-messages-btn"
              onClick={() => setActiveTab('messages')}
              className={`px-3 py-2 rounded-lg text-sm font-medium transition-all duration-200 flex items-center space-x-1.5 ${
                activeTab === 'messages' 
                  ? 'bg-emerald-50 text-emerald-700' 
                  : 'text-slate-600 hover:text-emerald-600 hover:bg-slate-50'
              }`}
            >
              <MessageSquare className="h-4 w-4" />
              <span>Inquiries</span>
            </button>
          )}
        </nav>

        {/* User Account / CTA */}
        <div id="nav-actions" className="flex items-center space-x-2.5 sm:space-x-3">
          {currentUser ? (
            <div id="nav-user-logged-in" className="flex items-center space-x-2 sm:space-x-3">
              <button
                id="nav-dashboard-btn"
                onClick={() => setActiveTab('dashboard')}
                className={`flex items-center space-x-2 p-1 px-2.5 sm:px-3 rounded-full border transition-all ${
                  activeTab === 'dashboard'
                    ? 'border-emerald-600 bg-emerald-50 text-emerald-700'
                    : 'border-slate-200 hover:bg-slate-50 text-slate-700'
                }`}
              >
                {currentUser.avatar ? (
                  <img 
                    id="nav-avatar-img"
                    src={currentUser.avatar} 
                    alt={currentUser.name} 
                    className="h-7 w-7 rounded-full object-cover border border-emerald-200"
                    referrerPolicy="no-referrer"
                  />
                ) : (
                  <div className="h-7 w-7 rounded-full bg-slate-100 text-slate-500 flex items-center justify-center border border-slate-300 shrink-0">
                    <User className="h-4 w-4 text-slate-500" />
                  </div>
                )}
                <span id="nav-username" className="text-sm font-medium hidden sm:inline max-w-[120px] truncate">
                  {currentUser.name.split(' ')[0]}
                </span>
                {currentUser.role === 'agent' && (
                  <ShieldCheck className="h-3.5 w-3.5 text-emerald-600" />
                )}
              </button>
              <button
                id="nav-logout-btn"
                onClick={onLogout}
                className="text-xs text-slate-500 hover:text-red-600 font-medium hidden md:inline cursor-pointer"
              >
                Sign Out
              </button>
            </div>
          ) : (
            <button
              id="nav-login-trigger"
              onClick={onOpenLogin}
              className="px-4 py-2 rounded-xl text-sm font-medium bg-slate-900 text-white hover:bg-emerald-600 hover:shadow-lg hover:shadow-emerald-600/10 transition-all duration-200 flex items-center space-x-1"
            >
              <User className="h-4 w-4" />
              <span>Join RentNaija</span>
            </button>
          )}
        </div>
      </div>

      {/* Mobile Navigation (Floating Bottom Bar) */}
      <div id="mobile-nav-bar" className="md:hidden fixed bottom-0 left-0 right-0 z-50 bg-white/95 border-t border-slate-100 px-4 py-2 flex justify-around items-center shadow-lg backdrop-blur-lg">
        <button
          id="mob-nav-home"
          onClick={() => setActiveTab('home')}
          className={`flex flex-col items-center justify-center p-1.5 transition-all ${
            activeTab === 'home' ? 'text-emerald-600' : 'text-slate-400'
          }`}
        >
          <Home className="h-5 w-5" />
          <span className="text-[10px] mt-0.5 font-medium">Market</span>
        </button>

        {currentUser && (
          <button
            id="mob-nav-messages"
            onClick={() => setActiveTab('messages')}
            className={`flex flex-col items-center justify-center p-1.5 transition-all ${
              activeTab === 'messages' ? 'text-emerald-600' : 'text-slate-400'
            }`}
          >
            <MessageSquare className="h-5 w-5" />
            <span className="text-[10px] mt-0.5 font-medium">Chat</span>
          </button>
        )}

        <button
          id="mob-nav-user"
          onClick={() => {
            if (currentUser) {
              setActiveTab('dashboard');
            } else {
              onOpenLogin();
            }
          }}
          className={`flex flex-col items-center justify-center p-1.5 transition-all ${
            activeTab === 'dashboard' ? 'text-emerald-600' : 'text-slate-400'
          }`}
        >
          <User className="h-5 w-5" />
          <span className="text-[10px] mt-0.5 font-medium">Account</span>
        </button>
      </div>
    </header>
  );
}
