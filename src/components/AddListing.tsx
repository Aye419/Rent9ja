import React, { useState, useEffect } from 'react';
import { Upload, Home, MapPin, DollarSign, Plus, Check, Trash2, ShieldCheck, Sparkles, User, Lock, ShieldAlert } from 'lucide-react';
import { statesAndCities } from '../mockData';
import { Property, UserProfile } from '../types';

interface AddListingProps {
  currentUser: UserProfile | null;
  onOpenLogin: () => void;
  onPublish: (propertyData: Partial<Property>) => void;
  onSelectTab: (tab: 'home' | 'dashboard') => void;
}

export default function AddListing({
  currentUser,
  onOpenLogin,
  onPublish,
  onSelectTab
}: AddListingProps) {
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [price, setPrice] = useState('');
  const [period, setPeriod] = useState<'monthly' | 'yearly' | 'total'>('yearly');
  const [type, setType] = useState<'rent' | 'sale'>('rent');
  const [propertyType, setPropertyType] = useState('apartment');
  const [state, setState] = useState('Lagos');
  const [city, setCity] = useState('Lekki');
  const [area, setArea] = useState('');
  const [bedrooms, setBedrooms] = useState('2');
  const [bathrooms, setBathrooms] = useState('2');
  const [squareMeters, setSquareMeters] = useState('150');
  const [furnished, setFurnished] = useState(false);
  const [amenitiesInput, setAmenitiesInput] = useState('');
  const [amenities, setAmenities] = useState<string[]>([
    '24/7 Power Supply', 'Water Supply', 'Security Patrols', 'POP Ceilings'
  ]);
  
  // Custom Images
  const [imageUrls, setImageUrls] = useState<string[]>([
    'https://images.unsplash.com/photo-1600585154340-be6161a56a0c?auto=format&fit=crop&w=1200&q=80'
  ]);
  const [newImageUrl, setNewImageUrl] = useState('');
  const [publishSuccess, setPublishSuccess] = useState(false);

  const [availableCities, setAvailableCities] = useState<string[]>([]);

  // Track cities depending on State
  useEffect(() => {
    if (state) {
      const cities = statesAndCities[state] || [];
      setAvailableCities(cities);
      if (cities.length > 0) {
        setCity(cities[0]);
      }
    }
  }, [state]);

  const handleAddAmenity = (e: React.FormEvent) => {
    e.preventDefault();
    if (amenitiesInput.trim() && !amenities.includes(amenitiesInput.trim())) {
      setAmenities([...amenities, amenitiesInput.trim()]);
      setAmenitiesInput('');
    }
  };

  const handleRemoveAmenity = (item: string) => {
    setAmenities(amenities.filter(a => a !== item));
  };

  const handleAddImageUrl = (e: React.FormEvent) => {
    e.preventDefault();
    if (newImageUrl.trim() && !imageUrls.includes(newImageUrl.trim())) {
      setImageUrls([...imageUrls, newImageUrl.trim()]);
      setNewImageUrl('');
    }
  };

  const handleRemoveImageUrl = (url: string) => {
    setImageUrls(imageUrls.filter(img => img !== url));
  };

  const handlePublishSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!currentUser) {
      onOpenLogin();
      return;
    }

    const compiledData: Partial<Property> = {
      title,
      description,
      price: Number(price) || 1200000,
      period: type === 'sale' ? 'total' : period,
      type,
      propertyType: propertyType as any,
      state,
      city,
      area: area || 'Phase 1',
      bedrooms: Number(bedrooms) || 0,
      bathrooms: Number(bathrooms) || 0,
      squareMeters: Number(squareMeters) || 100,
      furnished,
      images: imageUrls.length > 0 ? imageUrls : [
        'https://images.unsplash.com/photo-1580587771525-78b9dba3b914?auto=format&fit=crop&w=1200&q=80'
      ],
      amenities,
      agent: {
        id: currentUser.id,
        name: currentUser.name,
        phone: currentUser.phone,
        whatsapp: currentUser.phone.replace(/[^0-9]/g, ''),
        email: currentUser.email,
        verified: currentUser.verifiedAgent,
        badge: currentUser.badge,
        image: currentUser.avatar
      },
      gps: {
        lat: state === 'Lagos' ? 6.4281 : state === 'Abuja' ? 9.0765 : 4.8156,
        lng: state === 'Lagos' ? 3.4219 : state === 'Abuja' ? 7.4984 : 7.0498
      }
    };

    onPublish(compiledData);
    setPublishSuccess(true);
    
    // Clear state
    setTitle('');
    setDescription('');
    setPrice('');
    setArea('');
    
    setTimeout(() => {
      setPublishSuccess(false);
      onSelectTab('home'); // Redirect to search results
    }, 2000);
  };

  return (
    <div id="add-listing-root" className="max-w-4xl mx-auto px-4 py-8 pb-24">
      {/* Header section */}
      <div className="mb-8 space-y-2 text-center sm:text-left">
        <h1 id="publish-heading" className="text-2xl sm:text-3xl font-bold font-display text-slate-900 tracking-tight flex items-center justify-center sm:justify-start space-x-2">
          <Sparkles className="h-6 w-6 text-emerald-600 animate-pulse" />
          <span>Publish Property to RentNaija</span>
        </h1>
        <p className="text-slate-500 text-sm font-light">
          Your property listing is updated on our platform database instantly. Grow inquiries by filling all attributes accurately.
        </p>
      </div>

      {!currentUser ? (
        <div id="add-listing-unauthenticated" className="bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 text-white p-8 sm:p-10 rounded-3xl text-center space-y-5 shadow-2xl border border-white/10 my-4 relative overflow-hidden">
          <div className="absolute top-0 right-0 w-64 h-64 bg-emerald-500/10 rounded-full blur-3xl pointer-events-none" />
          
          <div className="bg-emerald-500/20 text-emerald-400 p-4 rounded-2xl w-16 h-16 mx-auto flex items-center justify-center border border-emerald-500/30">
            <Lock className="h-8 w-8 text-emerald-400" />
          </div>

          <div className="space-y-2 max-w-lg mx-auto">
            <span className="text-[10px] font-extrabold uppercase tracking-widest text-emerald-400 bg-emerald-500/10 px-3 py-1 rounded-full border border-emerald-500/20 inline-block">
              Landlord Account Required to Post
            </span>
            <h2 className="text-xl sm:text-2xl font-bold font-display text-white">
              A Landlord Profile is Required Before Posting
            </h2>
            <p className="text-sm text-slate-300 font-light leading-relaxed">
              To keep RentNaija safe, only registered Landlords or Admins can create and manage property records. Customers can browse and book houses.
            </p>
          </div>

          <div className="pt-2 flex flex-col sm:flex-row items-center justify-center gap-3">
            <button
              type="button"
              onClick={onOpenLogin}
              className="w-full sm:w-auto px-8 py-3.5 rounded-xl text-xs font-bold bg-emerald-600 hover:bg-emerald-500 text-white shadow-xl shadow-emerald-600/30 transition-all cursor-pointer flex items-center justify-center space-x-2"
            >
              <User className="h-4 w-4" />
              <span>Create Landlord Account / Sign In</span>
            </button>
          </div>
        </div>
      ) : (currentUser.role === 'customer' || currentUser.role === 'tenant' || currentUser.role === 'buyer') ? (
        <div id="add-listing-customer-blocked" className="bg-amber-50 border border-amber-200 text-amber-900 p-8 rounded-3xl text-center space-y-4 my-4 shadow-sm">
          <div className="bg-amber-100 text-amber-700 p-3 rounded-2xl w-14 h-14 mx-auto flex items-center justify-center border border-amber-300">
            <ShieldAlert className="h-7 w-7 text-amber-700" />
          </div>
          <div className="space-y-1 max-w-md mx-auto">
            <h3 className="text-lg font-bold font-display text-amber-950">Landlord Account Required</h3>
            <p className="text-xs text-amber-800 font-light leading-relaxed">
              Your current account role is <strong className="font-bold uppercase">{currentUser.role}</strong>. Customers cannot post new property listings. Only Landlords and Admins can create property records.
            </p>
          </div>
          <button
            type="button"
            onClick={onOpenLogin}
            className="px-6 py-2.5 rounded-xl text-xs font-bold bg-amber-700 hover:bg-amber-800 text-white shadow-md transition-all cursor-pointer"
          >
            Switch to a Landlord Account
          </button>
        </div>
      ) : (
        <form id="publish-listing-form" onSubmit={handlePublishSubmit} className="space-y-6">
          
          {/* Active Account Profile Info Banner */}
          <div className="bg-emerald-50/80 border border-emerald-200/80 rounded-2xl p-4 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 shadow-xs">
            <div className="flex items-center space-x-3">
              {currentUser.avatar ? (
                <img
                  src={currentUser.avatar}
                  alt=""
                  className="h-10 w-10 rounded-full object-cover border border-emerald-400 shrink-0"
                />
              ) : (
                <div className="h-10 w-10 rounded-full bg-emerald-100 text-emerald-700 flex items-center justify-center border border-emerald-400 shrink-0">
                  <User className="h-5 w-5" />
                </div>
              )}
              <div>
                <div className="flex items-center space-x-2">
                  <span className="text-[10px] font-extrabold text-emerald-800 uppercase tracking-wider">Posting As Registered Profile:</span>
                  <span className="text-[10px] font-bold text-emerald-700 bg-emerald-100 px-2 py-0.5 rounded-md capitalize">
                    {currentUser.role}
                  </span>
                </div>
                <h4 className="text-xs font-bold text-slate-900">{currentUser.name}</h4>
                <p className="text-[11px] text-slate-600 font-light">{currentUser.email} • {currentUser.phone}</p>
              </div>
            </div>
            <div className="flex items-center space-x-2">
              <span className="text-[10px] font-bold text-emerald-700 bg-white border border-emerald-300 px-3 py-1.5 rounded-full shadow-2xs flex items-center space-x-1">
                <ShieldCheck className="h-3.5 w-3.5 text-emerald-600" />
                <span>Verified Account Profile</span>
              </span>
            </div>
          </div>
          
          {/* Section 1: Listing Category & Type */}
          <div className="bg-white p-6 rounded-2xl border border-slate-100 shadow-sm space-y-4">
            <h3 className="text-sm font-bold uppercase tracking-wider text-emerald-700 font-display">1. Property Categorization</h3>
            
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              
              {/* Type Toggle */}
              <div>
                <label className="text-xs font-semibold text-slate-600 block mb-1">Listing Type</label>
                <select
                  value={type}
                  onChange={(e) => setType(e.target.value as 'rent' | 'sale')}
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 h-11 text-xs font-medium text-slate-800 focus:outline-none focus:ring-2 focus:ring-emerald-500"
                >
                  <option value="rent">For Rent</option>
                  <option value="sale">For Sale</option>
                </select>
              </div>

              {/* Property Type */}
              <div>
                <label className="text-xs font-semibold text-slate-600 block mb-1">Property Type</label>
                <select
                  value={propertyType}
                  onChange={(e) => setPropertyType(e.target.value)}
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 h-11 text-xs font-medium text-slate-800 focus:outline-none focus:ring-2 focus:ring-emerald-500"
                >
                  <option value="apartment">Apartment</option>
                  <option value="duplex">Duplex</option>
                  <option value="bungalow">Bungalow</option>
                  <option value="self-contain">Self-Contain (Sef Contain)</option>
                </select>
              </div>

              {/* Furnishing */}
              <div>
                <label className="text-xs font-semibold text-slate-600 block mb-1">Furnishing Status</label>
                <select
                  value={furnished ? 'yes' : 'no'}
                  onChange={(e) => setFurnished(e.target.value === 'yes')}
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 h-11 text-xs font-medium text-slate-800 focus:outline-none focus:ring-2 focus:ring-emerald-500"
                >
                  <option value="no">Unfurnished</option>
                  <option value="yes">Fully Furnished</option>
                </select>
              </div>

            </div>
          </div>

          {/* Section 2: Core Details */}
          <div className="bg-white p-6 rounded-2xl border border-slate-100 shadow-sm space-y-4">
            <h3 className="text-sm font-bold uppercase tracking-wider text-emerald-700 font-display">2. Primary Listing Information</h3>
            
            <div className="space-y-4">
              {/* Title */}
              <div>
                <label className="text-xs font-semibold text-slate-600 block mb-1">Listing Title</label>
                <input
                  required
                  type="text"
                  placeholder="e.g. Serviced 3 Bedroom Apartment with Swimming Pool"
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 h-11 text-xs font-medium text-slate-800 focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:bg-white"
                />
              </div>

              {/* Description */}
              <div>
                <label className="text-xs font-semibold text-slate-600 block mb-1">Property Description</label>
                <textarea
                  required
                  placeholder="Tell potential tenants/buyers what makes your property unique. Include security, water treatment, electricity, and any restrictions (e.g., student only)."
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  rows={4}
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl p-3 text-xs font-medium text-slate-800 focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:bg-white"
                />
              </div>

              {/* Pricing & size metrics */}
              <div className="grid grid-cols-1 sm:grid-cols-4 gap-4">
                
                {/* Price */}
                <div className="sm:col-span-2">
                  <label className="text-xs font-semibold text-slate-600 block mb-1">Price (₦ Naira)</label>
                  <div className="relative">
                    <span className="absolute left-3 top-3 text-slate-400 font-bold text-xs">₦</span>
                    <input
                      required
                      type="number"
                      placeholder="e.g. 1500000"
                      value={price}
                      onChange={(e) => setPrice(e.target.value)}
                      className="w-full bg-slate-50 border border-slate-200 rounded-xl pl-8 pr-3 h-11 text-xs font-semibold text-slate-800 focus:outline-none focus:ring-2 focus:ring-emerald-500"
                    />
                  </div>
                </div>

                {/* Period (for Rent only) */}
                {type === 'rent' && (
                  <div>
                    <label className="text-xs font-semibold text-slate-600 block mb-1">Payment Interval</label>
                    <select
                      value={period}
                      onChange={(e) => setPeriod(e.target.value as any)}
                      className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 h-11 text-xs font-medium text-slate-800 focus:outline-none focus:ring-2 focus:ring-emerald-500"
                    >
                      <option value="yearly">per Year</option>
                      <option value="monthly">per Month</option>
                    </select>
                  </div>
                )}

                {/* Size SQM */}
                <div>
                  <label className="text-xs font-semibold text-slate-600 block mb-1">Total Area (m²)</label>
                  <input
                    type="number"
                    placeholder="e.g. 180"
                    value={squareMeters}
                    onChange={(e) => setSquareMeters(e.target.value)}
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 h-11 text-xs font-medium text-slate-800 focus:outline-none focus:ring-2 focus:ring-emerald-500"
                  />
                </div>

              </div>

              {/* Bedrooms & Bathrooms */}
              {propertyType !== 'land' && (
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="text-xs font-semibold text-slate-600 block mb-1">Bedrooms</label>
                    <select
                      value={bedrooms}
                      onChange={(e) => setBedrooms(e.target.value)}
                      className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 h-11 text-xs font-medium text-slate-800"
                    >
                      {[0, 1, 2, 3, 4, 5, 6].map(n => (
                        <option key={n} value={n}>{n} Bedroom{n !== 1 ? 's' : ''}</option>
                      ))}
                    </select>
                  </div>
                  <div>
                    <label className="text-xs font-semibold text-slate-600 block mb-1">Bathrooms</label>
                    <select
                      value={bathrooms}
                      onChange={(e) => setBathrooms(e.target.value)}
                      className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 h-11 text-xs font-medium text-slate-800"
                    >
                      {[1, 2, 3, 4, 5, 6].map(n => (
                        <option key={n} value={n}>{n} Bathroom{n !== 1 ? 's' : ''}</option>
                      ))}
                    </select>
                  </div>
                </div>
              )}

            </div>
          </div>

          {/* Section 3: State & City Location */}
          <div className="bg-white p-6 rounded-2xl border border-slate-100 shadow-sm space-y-4">
            <h3 className="text-sm font-bold uppercase tracking-wider text-emerald-700 font-display">3. Location Details</h3>
            
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              
              {/* State */}
              <div>
                <label className="text-xs font-semibold text-slate-600 block mb-1">State</label>
                <select
                  value={state}
                  onChange={(e) => setState(e.target.value)}
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 h-11 text-xs font-medium text-slate-800 focus:outline-none focus:ring-2 focus:ring-emerald-500"
                >
                  {Object.keys(statesAndCities).map(s => (
                    <option key={s} value={s}>{s}</option>
                  ))}
                </select>
              </div>

              {/* City */}
              <div>
                <label className="text-xs font-semibold text-slate-600 block mb-1">City Hub</label>
                <select
                  value={city}
                  onChange={(e) => setCity(e.target.value)}
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 h-11 text-xs font-medium text-slate-800 focus:outline-none focus:ring-2 focus:ring-emerald-500"
                >
                  {availableCities.map(c => (
                    <option key={c} value={c}>{c}</option>
                  ))}
                </select>
              </div>

              {/* Specific Area */}
              <div>
                <label className="text-xs font-semibold text-slate-600 block mb-1">Area / Estate Name</label>
                <input
                  required
                  type="text"
                  placeholder="e.g. Adeniran Ogunsanya"
                  value={area}
                  onChange={(e) => setArea(e.target.value)}
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 h-11 text-xs font-medium text-slate-800 focus:outline-none focus:ring-2 focus:ring-emerald-500"
                />
              </div>

            </div>
          </div>

          {/* Section 4: Photo Gallery manager */}
          <div className="bg-white p-6 rounded-2xl border border-slate-100 shadow-sm space-y-4">
            <h3 className="text-sm font-bold uppercase tracking-wider text-emerald-700 font-display">4. Photos & Virtual Tour URL</h3>
            
            <div className="space-y-4">
              
              {/* Add custom URL form */}
              <div className="flex space-x-2">
                <input
                  type="url"
                  placeholder="Paste free Unsplash image link or standard photo URL..."
                  value={newImageUrl}
                  onChange={(e) => setNewImageUrl(e.target.value)}
                  className="flex-1 bg-slate-50 border border-slate-200 rounded-xl px-3 h-11 text-xs text-slate-800"
                />
                <button
                  type="button"
                  onClick={handleAddImageUrl}
                  className="px-4 bg-slate-900 hover:bg-slate-800 text-white text-xs font-bold rounded-xl cursor-pointer"
                >
                  Add Link
                </button>
              </div>

              {/* Drag/Drop Simulator Zone */}
              <div className="border-2 border-dashed border-slate-200 hover:border-emerald-500 rounded-2xl p-6 text-center cursor-pointer transition-all bg-slate-50">
                <Upload className="h-8 w-8 text-slate-400 mx-auto mb-2 animate-bounce" />
                <h4 className="text-xs font-bold text-slate-700">Drag & Drop Local Photos</h4>
                <p className="text-[10px] text-slate-400 mt-1 font-light">Supported: PNG, JPEG, MP4 tours. Simulator converts file locally.</p>
                <input 
                  type="file" 
                  multiple 
                  accept="image/*"
                  onChange={(e) => {
                    const files = e.target.files;
                    if (files) {
                      const simulatedUrls: string[] = [];
                      for (let i = 0; i < files.length; i++) {
                        // Create fake preview object URL
                        simulatedUrls.push(URL.createObjectURL(files[i]));
                      }
                      setImageUrls([...imageUrls, ...simulatedUrls]);
                    }
                  }}
                  className="hidden" 
                  id="file-selector-hidden" 
                />
                <label htmlFor="file-selector-hidden" className="mt-2 inline-block px-3 py-1 bg-white border border-slate-200 rounded-lg text-[10px] font-bold text-slate-600 hover:bg-slate-50 cursor-pointer">
                  Browse Files
                </label>
              </div>

              {/* Image Previews List */}
              {imageUrls.length > 0 && (
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5">
                  {imageUrls.map((url, idx) => (
                    <div key={idx} className="relative group h-24 rounded-lg overflow-hidden border border-slate-100">
                      <img src={url} alt="" className="h-full w-full object-cover" referrerPolicy="no-referrer" />
                      <button
                        type="button"
                        onClick={() => handleRemoveImageUrl(url)}
                        className="absolute top-1 right-1 h-6 w-6 rounded-md bg-red-600 text-white flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity cursor-pointer"
                      >
                        <Trash2 className="h-3.5 w-3.5" />
                      </button>
                    </div>
                  ))}
                </div>
              )}

            </div>
          </div>

          {/* Section 5: Amenities */}
          <div className="bg-white p-6 rounded-2xl border border-slate-100 shadow-sm space-y-4">
            <h3 className="text-sm font-bold uppercase tracking-wider text-emerald-700 font-display">5. Custom Amenities checklist</h3>
            
            <div className="space-y-3">
              <div className="flex space-x-2">
                <input
                  type="text"
                  placeholder="e.g. Armed Guards, Central Aircon, Water Treatment..."
                  value={amenitiesInput}
                  onChange={(e) => setAmenitiesInput(e.target.value)}
                  className="flex-1 bg-slate-50 border border-slate-200 rounded-xl px-3 h-11 text-xs text-slate-800"
                />
                <button
                  type="button"
                  onClick={handleAddAmenity}
                  className="px-4 bg-slate-950 text-white text-xs font-bold rounded-xl cursor-pointer"
                >
                  Add Custom Tag
                </button>
              </div>

              {/* Badges List */}
              <div className="flex flex-wrap gap-1.5">
                {amenities.map((item, idx) => (
                  <div key={idx} className="flex items-center bg-emerald-50 border border-emerald-100 text-emerald-800 px-3 py-1 rounded-full text-xs font-semibold">
                    <span>{item}</span>
                    <button
                      type="button"
                      onClick={() => handleRemoveAmenity(item)}
                      className="ml-1.5 text-emerald-600 hover:text-emerald-900 font-bold shrink-0 cursor-pointer"
                    >
                      ✕
                    </button>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Publishing Alert & Submit CTA */}
          <div className="text-center pt-4 space-y-4">
            <div className="p-3 bg-slate-50 border border-slate-200 rounded-xl text-left flex items-start space-x-2.5">
              <ShieldCheck className="h-5 w-5 text-emerald-600 shrink-0 mt-0.5" />
              <div className="text-xs text-slate-500 font-light">
                <span className="font-bold text-slate-700">Safety Verification Guard:</span> By clicking publish, you declare this listing complies with RentNaija anti-scam procedures. Properties are continuously monitored by Admin. Fake prices or duplicate locations will lead to account restrictions.
              </div>
            </div>

            <button
              id="btn-confirm-publish"
              type="submit"
              className="px-8 py-3 bg-emerald-600 hover:bg-emerald-700 text-white font-display font-bold text-sm rounded-xl shadow-lg shadow-emerald-600/15 active:scale-[0.98] transition-all cursor-pointer"
            >
              Verify & Publish Listing
            </button>

            {publishSuccess && (
              <div className="p-3.5 bg-emerald-500/10 border border-emerald-500/20 text-emerald-600 rounded-xl text-sm font-semibold max-w-sm mx-auto">
                🎉 Property listed on database successfully! Redirecting...
              </div>
            )}
          </div>

        </form>
      )}

    </div>
  );
}
