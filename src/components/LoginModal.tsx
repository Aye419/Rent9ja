import React, { useState } from 'react';
import { X, Mail, Lock, User, Briefcase, KeyRound, ShieldAlert, ShieldCheck } from 'lucide-react';
import { registerWithFirebase, loginWithFirebase, SUPER_ADMIN_EMAIL } from '../lib/firebaseService';

interface LoginModalProps {
  isOpen: boolean;
  onClose: () => void;
  onLoginSuccess: (user: any) => void;
}

export default function LoginModal({
  isOpen,
  onClose,
  onLoginSuccess
}: LoginModalProps) {
  const [isSignUp, setIsSignUp] = useState(false);
  const [role, setRole] = useState<'landlord' | 'customer'>('customer');
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [password, setPassword] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');

  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    setErrorMsg('');

    try {
      let userProfile;
      if (isSignUp) {
        userProfile = await registerWithFirebase(name, email, phone, password, role);
      } else {
        userProfile = await loginWithFirebase(email, password);
      }

      setIsSubmitting(false);
      onLoginSuccess(userProfile);
      onClose();
    } catch (err: any) {
      console.error('Firebase Auth error:', err);
      setIsSubmitting(false);
      
      // Fallback for demo mode if Firebase auth credentials fail or network error occurs
      if (err.code === 'auth/user-not-found' || err.code === 'auth/invalid-credential' || err.message?.includes('auth/')) {
        setErrorMsg(err.message || 'Invalid login credentials. Please check your email and password.');
      } else {
        // Try fallback demo backend auth or friendly message
        try {
          const endpoint = isSignUp ? '/api/auth/register' : '/api/auth/login';
          const payload = isSignUp ? { name, email, phone, password, role } : { email, password };
          const res = await fetch(endpoint, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(payload)
          });
          const data = await res.json();
          if (res.ok && data.user) {
            onLoginSuccess(data.user);
            onClose();
            return;
          }
        } catch (_) {}
        setErrorMsg(err.message || 'Authentication error. Please try again.');
      }
    }
  };

  const handleQuickLogin = (emailPreset: string) => {
    setEmail(emailPreset);
    setPassword('password123');
    setIsSignUp(false);
  };

  return (
    <div id="login-modal-overlay" className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-sm flex items-center justify-center p-4">
      <div className="bg-white rounded-3xl w-full max-w-md overflow-hidden shadow-2xl relative border border-slate-100 flex flex-col animate-in zoom-in-95 duration-200">
        
        {/* Close Button */}
        <button 
          onClick={onClose}
          className="absolute top-4 right-4 text-slate-400 hover:text-slate-600 p-1 rounded-full cursor-pointer"
        >
          <X className="h-5 w-5" />
        </button>

        {/* Header Visual */}
        <div className="bg-slate-900 text-white p-6 space-y-1">
          <span className="text-[10px] text-emerald-400 font-extrabold uppercase tracking-widest block">AUTHENTICATION & FIRESTORE CRUD</span>
          <h3 className="font-display font-bold text-lg text-white">
            {isSignUp ? 'Create Account Profile' : 'Welcome Back'}
          </h3>
          <p className="text-xs text-slate-400 font-light">Sign in or register to manage properties and bookings in Firebase.</p>
        </div>

        {/* Content Body */}
        <div className="p-6 space-y-5">
          
          <form onSubmit={handleSubmit} className="space-y-4">
            
            {/* Role selector on Signup */}
            {isSignUp && (
              <div className="space-y-1.5">
                <label className="text-[10px] font-bold text-slate-500 uppercase tracking-wider block">Choose Account Role</label>
                <div className="grid grid-cols-2 gap-2">
                  <button
                    type="button"
                    onClick={() => setRole('customer')}
                    className={`py-2.5 px-3 rounded-xl text-xs font-bold border transition-all cursor-pointer flex flex-col items-center justify-center space-y-0.5 ${
                      role === 'customer' 
                        ? 'border-emerald-600 bg-emerald-50 text-emerald-800 shadow-xs' 
                        : 'border-slate-200 text-slate-500 hover:border-slate-300'
                    }`}
                  >
                    <User className="h-4 w-4" />
                    <span>Customer / Tenant</span>
                    <span className="text-[9px] font-normal text-slate-500">Book & Rent Houses</span>
                  </button>

                  <button
                    type="button"
                    onClick={() => setRole('landlord')}
                    className={`py-2.5 px-3 rounded-xl text-xs font-bold border transition-all cursor-pointer flex flex-col items-center justify-center space-y-0.5 ${
                      role === 'landlord' 
                        ? 'border-emerald-600 bg-emerald-50 text-emerald-800 shadow-xs' 
                        : 'border-slate-200 text-slate-500 hover:border-slate-300'
                    }`}
                  >
                    <Briefcase className="h-4 w-4" />
                    <span>Landlord</span>
                    <span className="text-[9px] font-normal text-slate-500">Create & Manage Listings</span>
                  </button>
                </div>
              </div>
            )}

            {/* Form Inputs */}
            <div className="space-y-3">
              
              {isSignUp && (
                <div>
                  <label className="text-[10px] font-bold text-slate-500 uppercase tracking-wider block mb-1">Full Name</label>
                  <div className="relative">
                    <User className="absolute left-3 top-3 h-4 w-4 text-slate-400" />
                    <input
                      required
                      type="text"
                      placeholder="e.g. Aaron Ayemusa"
                      value={name}
                      onChange={(e) => setName(e.target.value)}
                      className="w-full bg-slate-50 border border-slate-200 rounded-xl pl-9 pr-3 h-10 text-xs text-slate-800 focus:outline-none focus:ring-2 focus:ring-emerald-500"
                    />
                  </div>
                </div>
              )}

              <div>
                <label className="text-[10px] font-bold text-slate-500 uppercase tracking-wider block mb-1">Email Address</label>
                <div className="relative">
                  <Mail className="absolute left-3 top-3 h-4 w-4 text-slate-400" />
                  <input
                    required
                    type="email"
                    placeholder="e.g. aaronayemusa@gmail.com"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl pl-9 pr-3 h-10 text-xs text-slate-800 focus:outline-none focus:ring-2 focus:ring-emerald-500"
                  />
                </div>
              </div>

              {isSignUp && (
                <div>
                  <label className="text-[10px] font-bold text-slate-500 uppercase tracking-wider block mb-1">Phone Number</label>
                  <input
                    required
                    type="text"
                    placeholder="e.g. +234 812 345 6789"
                    value={phone}
                    onChange={(e) => setPhone(e.target.value)}
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 h-10 text-xs text-slate-800 focus:outline-none focus:ring-2 focus:ring-emerald-500"
                  />
                </div>
              )}

              <div>
                <label className="text-[10px] font-bold text-slate-500 uppercase tracking-wider block mb-1">Password</label>
                <div className="relative">
                  <Lock className="absolute left-3 top-3 h-4 w-4 text-slate-400" />
                  <input
                    required
                    type="password"
                    placeholder="Min 6 characters..."
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl pl-9 pr-3 h-10 text-xs text-slate-800 focus:outline-none focus:ring-2 focus:ring-emerald-500"
                  />
                </div>
              </div>

            </div>

            {errorMsg && (
              <div className="p-2.5 bg-red-50 border border-red-100 rounded-xl text-red-600 text-[11px] font-medium flex items-center gap-1.5">
                <ShieldAlert className="h-4 w-4 shrink-0" />
                <span>{errorMsg}</span>
              </div>
            )}

            <button
              type="submit"
              disabled={isSubmitting}
              className="w-full h-11 bg-emerald-600 hover:bg-emerald-700 disabled:opacity-50 text-white font-display font-bold text-xs rounded-xl shadow-lg transition-all cursor-pointer"
            >
              {isSubmitting ? 'Connecting to Firebase...' : isSignUp ? 'Create Firebase Account' : 'Sign In'}
            </button>

          </form>

          {/* Quick toggle link */}
          <div className="text-center">
            <button
              type="button"
              onClick={() => setIsSignUp(!isSignUp)}
              className="text-xs font-semibold text-slate-500 hover:text-emerald-600 transition-colors cursor-pointer"
            >
              {isSignUp ? 'Already have an account? Sign In' : 'New to RentNaija? Create account'}
            </button>
          </div>

          {/* Demo Presets */}
          <div className="border-t border-slate-100 pt-3 space-y-2">
            <span className="text-[9px] font-bold text-slate-400 uppercase tracking-wider block text-center">Quick Preset Logins</span>
            
            <div className="grid grid-cols-2 gap-2 text-[10px]">
              <button
                type="button"
                onClick={() => handleQuickLogin('agent@rentnaija.ng')}
                className="p-2 bg-emerald-50 hover:bg-emerald-100 border border-emerald-200 rounded-lg text-emerald-900 text-center truncate font-bold cursor-pointer"
              >
                Landlord
              </button>
              <button
                type="button"
                onClick={() => handleQuickLogin('tunde@gmail.com')}
                className="p-2 bg-blue-50 hover:bg-blue-100 border border-blue-200 rounded-lg text-blue-900 text-center truncate font-bold cursor-pointer"
              >
                Customer
              </button>
            </div>
          </div>

        </div>

      </div>
    </div>
  );
}
