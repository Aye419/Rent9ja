import React, { useState, useEffect } from 'react';
import { 
  Search, MapPin, Home, SlidersHorizontal, ChevronLeft, ChevronRight, 
  Pause, Play, Eye, ShieldCheck, Bed, Bath, Sparkles, ArrowRight 
} from 'lucide-react';
import { SearchFilters, Property } from '../types';
import { statesAndCities, initialProperties } from '../mockData';

interface HeroProps {
  onSearch: (filters: SearchFilters) => void;
  categoriesList: Array<{ id: string; name: string; count: number; icon: string }>;
  activeCategory: string;
  onSelectCategory: (id: string) => void;
  properties?: Property[];
  onSelectProperty?: (id: string) => void;
}

export default function Hero({ 
  onSearch, 
  categoriesList, 
  activeCategory, 
  onSelectCategory,
  properties,
  onSelectProperty
}: HeroProps) {
  const [state, setState] = useState('All');
  const [city, setCity] = useState('All');
  const [area, setArea] = useState('');
  const [propertyType, setPropertyType] = useState('All');
  const [type, setType] = useState<'all' | 'rent' | 'sale'>('all');
  const [minPrice, setMinPrice] = useState('');
  const [maxPrice, setMaxPrice] = useState('');
  const [bedrooms, setBedrooms] = useState('Any');
  const [bathrooms, setBathrooms] = useState('Any');
  const [furnished, setFurnished] = useState('Any');
  const [showAdvanced, setShowAdvanced] = useState(false);

  const [availableCities, setAvailableCities] = useState<string[]>([]);

  // Sliding Photo Showcase state
  const slideProperties = (properties && properties.length > 0) ? properties : initialProperties;
  const [slideIndex, setSlideIndex] = useState(0);
  const [activeImageSubIndex, setActiveImageSubIndex] = useState(0);
  const [isAutoPlay, setIsAutoPlay] = useState(true);

  // Auto-play sliding interval
  useEffect(() => {
    if (!isAutoPlay || slideProperties.length <= 1) return;
    const timer = setInterval(() => {
      setSlideIndex((prev) => (prev + 1) % slideProperties.length);
      setActiveImageSubIndex(0);
    }, 4500);
    return () => clearInterval(timer);
  }, [isAutoPlay, slideProperties.length]);

  const handleNextSlide = () => {
    setSlideIndex((prev) => (prev + 1) % slideProperties.length);
    setActiveImageSubIndex(0);
  };

  const handlePrevSlide = () => {
    setSlideIndex((prev) => (prev - 1 + slideProperties.length) % slideProperties.length);
    setActiveImageSubIndex(0);
  };

  const formatPrice = (price: number) => {
    return new Intl.NumberFormat('en-NG', {
      style: 'currency',
      currency: 'NGN',
      maximumFractionDigits: 0
    }).format(price);
  };

  // Update cities when state changes
  useEffect(() => {
    if (state && state !== 'All') {
      setAvailableCities(statesAndCities[state] || []);
    } else {
      setAvailableCities([]);
    }
    setCity('All');
  }, [state]);

  const handleSearchClick = (e: React.FormEvent) => {
    e.preventDefault();
    onSearch({
      state,
      city,
      area,
      propertyType,
      type,
      minPrice,
      maxPrice,
      bedrooms,
      bathrooms,
      furnished
    });
  };

  const handleQuickTypeSelect = (selectedType: 'all' | 'rent' | 'sale') => {
    setType(selectedType);
  };

  const handleCategoryClick = (catId: string) => {
    onSelectCategory(catId);
    setTimeout(() => {
      document.getElementById('listings-section')?.scrollIntoView({ behavior: 'smooth' });
    }, 100);
  };

  const currentSlideProp = slideProperties[slideIndex] || slideProperties[0];

  return (
    <section id="hero-section" className="relative bg-slate-900 overflow-hidden pt-8 pb-16 md:py-20">
      {/* Background decoration */}
      <div className="absolute inset-0 bg-[url('https://images.unsplash.com/photo-1513694203232-719a280e022f?auto=format&fit=crop&w=1920&q=80')] bg-cover bg-center opacity-20 mix-blend-multiply" />
      <div className="absolute inset-0 bg-gradient-to-b from-slate-900/60 via-slate-900/85 to-slate-900" />
      
      {/* Visual glowing orb */}
      <div className="absolute -top-40 -right-40 w-96 h-96 bg-emerald-500/20 rounded-full blur-3xl" />
      <div className="absolute bottom-10 left-10 w-80 h-80 bg-emerald-700/10 rounded-full blur-3xl" />

      <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
        {/* Badge */}
        <div id="hero-badge-container" className="inline-flex items-center space-x-1.5 px-3 py-1.5 rounded-full bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 text-xs font-semibold tracking-wide mb-4">
          <span className="flex h-2 w-2 relative">
            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
            <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500"></span>
          </span>
          <span>NIGERIA&apos;S PREMIER PROPERTY NETWORK</span>
        </div>

        {/* Title */}
        <h1 id="hero-headline" className="text-3xl sm:text-5xl lg:text-6xl font-bold font-display tracking-tight text-white mb-3">
          Find Your Perfect Home <br className="hidden sm:inline" />
          <span className="text-emerald-400 bg-gradient-to-r from-emerald-400 to-teal-300 bg-clip-text text-transparent">Anywhere in Nigeria</span>
        </h1>
        
        {/* Subtitle */}
        <p id="hero-subheadline" className="max-w-2xl mx-auto text-sm sm:text-base text-slate-300 mb-8 font-light">
          Search thousands of verified apartments, luxury duplexes, secure lands, and commercial office spaces across Lagos, Abuja, and more.
        </p>

        {/* Sliding Photo Showcase Carousel of Posted Available Houses */}
        {currentSlideProp && (
          <div id="hero-sliding-showcase" className="w-full max-w-7xl mx-auto mb-10 text-left">
            {/* Header bar of the showcase */}
            <div className="flex items-center justify-between mb-3 px-1">
              <div className="flex items-center space-x-2">
                <span className="flex h-2.5 w-2.5 relative">
                  <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
                  <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-emerald-500"></span>
                </span>
                <h2 className="text-xs sm:text-sm font-bold text-white tracking-wide uppercase font-display flex items-center gap-1.5">
                  <Sparkles className="h-4 w-4 text-emerald-400" />
                  Featured Nigeria Property Showcase
                </h2>
              </div>
              
              <div className="flex items-center space-x-2 text-xs text-slate-400">
                <button
                  type="button"
                  onClick={() => setIsAutoPlay(!isAutoPlay)}
                  className="px-2.5 py-1 rounded-lg bg-slate-800/80 hover:bg-slate-700 text-slate-300 flex items-center space-x-1.5 transition-colors cursor-pointer border border-white/10"
                  title={isAutoPlay ? 'Pause auto-slide' : 'Start auto-slide'}
                >
                  {isAutoPlay ? <Pause className="h-3 w-3 text-emerald-400" /> : <Play className="h-3 w-3 text-emerald-400" />}
                  <span className="text-[10px] hidden sm:inline">{isAutoPlay ? 'Auto-Sliding' : 'Paused'}</span>
                </button>
                <span className="font-mono text-[11px] bg-slate-800 border border-white/10 px-2 py-0.5 rounded-md text-slate-300">
                  {slideIndex + 1} / {slideProperties.length}
                </span>
              </div>
            </div>

            {/* Sliding Image Stage */}
            <div className="relative rounded-2xl sm:rounded-3xl overflow-hidden shadow-2xl border border-white/15 group bg-slate-950">
              <div className="relative h-80 sm:h-[460px] md:h-[540px] lg:h-[600px] w-full transition-all duration-700 ease-in-out">
                {/* Main Background Photo */}
                <img
                  src={currentSlideProp.images[activeImageSubIndex] || currentSlideProp.images[0]}
                  alt={currentSlideProp.title}
                  className="w-full h-full object-cover object-center transform transition-transform duration-1000 group-hover:scale-105"
                  referrerPolicy="no-referrer"
                />

                {/* Gradient Overlay */}
                <div className="absolute inset-0 bg-gradient-to-t from-slate-950 via-slate-950/40 to-transparent" />

                {/* Top Badges */}
                <div className="absolute top-4 left-4 right-4 flex items-center justify-between z-10">
                  <div className="flex items-center space-x-2">
                    <span className={`px-3 py-1 rounded-full text-[10px] sm:text-xs font-bold uppercase tracking-wider shadow-lg ${
                      currentSlideProp.type === 'rent' ? 'bg-emerald-600 text-white' : 'bg-blue-600 text-white'
                    }`}>
                      For {currentSlideProp.type === 'rent' ? 'Rent' : 'Sale'}
                    </span>
                    {currentSlideProp.verified && (
                      <span className="px-2.5 py-1 rounded-full text-[10px] sm:text-xs font-semibold bg-slate-900/80 text-emerald-400 border border-emerald-500/30 backdrop-blur-md flex items-center space-x-1">
                        <ShieldCheck className="h-3.5 w-3.5 text-emerald-400" />
                        <span className="hidden sm:inline">Verified Property</span>
                      </span>
                    )}
                  </div>

                  <div className="px-3 py-1 rounded-full bg-slate-900/80 backdrop-blur-md text-white text-[10px] sm:text-xs font-medium border border-white/10">
                    {currentSlideProp.city}, {currentSlideProp.state}
                  </div>
                </div>

                {/* Sliding Nav Controls (Left / Right Arrow Overlay) */}
                <button
                  type="button"
                  onClick={handlePrevSlide}
                  className="absolute left-3 top-1/2 -translate-y-1/2 h-10 w-10 sm:h-12 sm:w-12 rounded-full bg-slate-950/70 hover:bg-emerald-600 text-white backdrop-blur-md border border-white/20 flex items-center justify-center transition-all cursor-pointer opacity-90 hover:scale-110 z-20 shadow-2xl"
                  aria-label="Previous House Photo"
                >
                  <ChevronLeft className="h-6 w-6" />
                </button>
                <button
                  type="button"
                  onClick={handleNextSlide}
                  className="absolute right-3 top-1/2 -translate-y-1/2 h-10 w-10 sm:h-12 sm:w-12 rounded-full bg-slate-950/70 hover:bg-emerald-600 text-white backdrop-blur-md border border-white/20 flex items-center justify-center transition-all cursor-pointer opacity-90 hover:scale-110 z-20 shadow-2xl"
                  aria-label="Next House Photo"
                >
                  <ChevronRight className="h-6 w-6" />
                </button>

                {/* Bottom Property Info Overlay */}
                <div className="absolute bottom-0 inset-x-0 p-4 sm:p-6 text-white z-10 flex flex-col md:flex-row md:items-end justify-between gap-4">
                  <div className="max-w-xl space-y-1.5">
                    <div className="flex items-baseline space-x-2">
                      <span className="text-2xl sm:text-3xl font-extrabold font-display text-emerald-400 tracking-tight">
                        {formatPrice(currentSlideProp.price)}
                      </span>
                      {currentSlideProp.type === 'rent' && (
                        <span className="text-xs sm:text-sm text-slate-300 font-light">
                          /{currentSlideProp.period === 'yearly' ? 'yr' : 'mo'}
                        </span>
                      )}
                    </div>

                    <h3 className="text-base sm:text-2xl font-bold font-display text-white line-clamp-1">
                      {currentSlideProp.title}
                    </h3>

                    <div className="flex flex-wrap items-center gap-2.5 text-xs text-slate-300 font-light">
                      <span className="flex items-center space-x-1">
                        <MapPin className="h-3.5 w-3.5 text-emerald-400 shrink-0" />
                        <span>{currentSlideProp.area}, {currentSlideProp.city}, {currentSlideProp.state}</span>
                      </span>
                      {currentSlideProp.bedrooms > 0 && (
                        <span className="flex items-center space-x-1 bg-white/10 px-2 py-0.5 rounded-md">
                          <Bed className="h-3.5 w-3.5 text-emerald-400" />
                          <span>{currentSlideProp.bedrooms} Beds</span>
                        </span>
                      )}
                      {currentSlideProp.bathrooms > 0 && (
                        <span className="flex items-center space-x-1 bg-white/10 px-2 py-0.5 rounded-md">
                          <Bath className="h-3.5 w-3.5 text-emerald-400" />
                          <span>{currentSlideProp.bathrooms} Baths</span>
                        </span>
                      )}
                    </div>
                  </div>

                  <div className="flex items-center space-x-3 shrink-0">
                    {/* Multiple images sub-thumbnails selector */}
                    {currentSlideProp.images.length > 1 && (
                      <div className="hidden sm:flex items-center space-x-1 bg-slate-900/80 backdrop-blur-md p-1 rounded-xl border border-white/10">
                        {currentSlideProp.images.map((img, imgIdx) => (
                          <button
                            key={imgIdx}
                            type="button"
                            onClick={(e) => {
                              e.stopPropagation();
                              setActiveImageSubIndex(imgIdx);
                            }}
                            className={`h-7 w-10 rounded overflow-hidden border transition-all cursor-pointer ${
                              activeImageSubIndex === imgIdx ? 'border-emerald-400 ring-2 ring-emerald-400/50 scale-105' : 'border-transparent opacity-60 hover:opacity-100'
                            }`}
                          >
                            <img src={img} alt="" className="h-full w-full object-cover" referrerPolicy="no-referrer" />
                          </button>
                        ))}
                      </div>
                    )}

                    <button
                      type="button"
                      onClick={() => onSelectProperty && onSelectProperty(currentSlideProp.id)}
                      className="px-5 py-3 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white text-xs sm:text-sm font-bold shadow-lg shadow-emerald-600/30 flex items-center space-x-2 transition-all transform hover:-translate-y-0.5 cursor-pointer"
                    >
                      <Eye className="h-4 w-4" />
                      <span>Inspect House</span>
                      <ArrowRight className="h-4 w-4" />
                    </button>
                  </div>
                </div>
              </div>

              {/* Horizontal Thumbnail Slider Row */}
              <div className="p-3 bg-slate-900/90 border-t border-white/10 flex items-center space-x-2 overflow-x-auto no-scrollbar">
                {slideProperties.map((prop, idx) => (
                  <button
                    key={prop.id}
                    type="button"
                    onClick={() => {
                      setSlideIndex(idx);
                      setActiveImageSubIndex(0);
                    }}
                    className={`shrink-0 flex items-center space-x-2.5 p-1.5 pr-3 rounded-xl transition-all cursor-pointer border ${
                      slideIndex === idx 
                        ? 'bg-emerald-950/80 border-emerald-500/60 ring-1 ring-emerald-500' 
                        : 'bg-slate-800/50 border-white/5 hover:bg-slate-800 text-slate-400'
                    }`}
                  >
                    <img
                      src={prop.images[0]}
                      alt=""
                      className="h-10 w-12 rounded-lg object-cover"
                      referrerPolicy="no-referrer"
                    />
                    <div className="text-left min-w-[120px] max-w-[160px]">
                      <p className={`text-[11px] font-bold line-clamp-1 ${slideIndex === idx ? 'text-white' : 'text-slate-300'}`}>
                        {prop.title}
                      </p>
                      <p className="text-[10px] text-emerald-400 font-semibold mt-0.5">
                        {formatPrice(prop.price)}
                      </p>
                    </div>
                  </button>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* Search Engine Card */}
        <div id="hero-search-container" className="max-w-5xl mx-auto bg-white/95 backdrop-blur-md p-4 sm:p-5 rounded-2xl sm:rounded-3xl shadow-2xl shadow-slate-950/60 border border-white/30 text-left">
          
          {/* Rent/Buy Toggle Tabs & Quick Indicator */}
          <div className="flex flex-wrap items-center justify-between gap-2 mb-3 border-b border-slate-100 pb-2.5">
            <div className="flex space-x-1.5">
              <button
                id="search-tab-all"
                type="button"
                onClick={() => handleQuickTypeSelect('all')}
                className={`px-3.5 py-1.5 rounded-full text-xs font-bold transition-all cursor-pointer ${
                  type === 'all'
                    ? 'bg-slate-900 text-white shadow-sm'
                    : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
                }`}
              >
                All Properties
              </button>
              <button
                id="search-tab-rent"
                type="button"
                onClick={() => handleQuickTypeSelect('rent')}
                className={`px-3.5 py-1.5 rounded-full text-xs font-bold transition-all cursor-pointer ${
                  type === 'rent'
                    ? 'bg-emerald-600 text-white shadow-sm'
                    : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
                }`}
              >
                For Rent
              </button>
              <button
                id="search-tab-buy"
                type="button"
                onClick={() => handleQuickTypeSelect('sale')}
                className={`px-3.5 py-1.5 rounded-full text-xs font-bold transition-all cursor-pointer ${
                  type === 'sale'
                    ? 'bg-emerald-600 text-white shadow-sm'
                    : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
                }`}
              >
                For Sale
              </button>
            </div>

            <button
              id="btn-toggle-advanced"
              type="button"
              onClick={() => setShowAdvanced(!showAdvanced)}
              className="text-xs font-semibold text-emerald-700 hover:text-emerald-800 flex items-center space-x-1 cursor-pointer bg-emerald-50 hover:bg-emerald-100/80 px-2.5 py-1 rounded-lg transition-colors"
            >
              <SlidersHorizontal className="h-3.5 w-3.5" />
              <span>{showAdvanced ? 'Hide Filters' : 'Filters'}</span>
            </button>
          </div>

          {/* Sleek Search Bar */}
          <form id="hero-search-form" onSubmit={handleSearchClick} className="space-y-3">
            <div className="bg-slate-50 border border-slate-200/90 rounded-2xl p-2 sm:p-2.5 flex flex-col md:flex-row items-stretch md:items-center gap-2 shadow-inner">
              
              {/* Keyword / Area Search Bar Input */}
              <div id="input-group-area" className="flex-1 flex items-center bg-white border border-slate-200 rounded-xl px-3.5 h-12 focus-within:ring-2 focus-within:ring-emerald-500 transition-all">
                <Search className="h-4.5 w-4.5 text-slate-400 shrink-0 mr-2.5" />
                <input
                  id="input-area"
                  type="text"
                  placeholder="Search location, area, or neighborhood (e.g. Lekki, VI, Ikeja)..."
                  value={area}
                  onChange={(e) => setArea(e.target.value)}
                  className="w-full bg-transparent text-xs sm:text-sm font-medium text-slate-800 placeholder:text-slate-400 focus:outline-none"
                />
              </div>

              {/* State Select */}
              <div id="input-group-state" className="w-full md:w-44 bg-white border border-slate-200 rounded-xl px-3 h-12 flex items-center focus-within:ring-2 focus-within:ring-emerald-500 transition-all">
                <MapPin className="h-4 w-4 text-emerald-600 shrink-0 mr-1.5" />
                <select
                  id="select-state"
                  value={state}
                  onChange={(e) => setState(e.target.value)}
                  className="w-full bg-transparent text-xs font-semibold text-slate-800 focus:outline-none cursor-pointer"
                >
                  <option value="All">All Nigeria States</option>
                  {Object.keys(statesAndCities).map((s) => (
                    <option key={s} value={s}>{s}</option>
                  ))}
                </select>
              </div>

              {/* City Select (Visible when State selected or active) */}
              {state !== 'All' && (
                <div id="input-group-city" className="w-full md:w-36 bg-white border border-slate-200 rounded-xl px-3 h-12 flex items-center focus-within:ring-2 focus-within:ring-emerald-500 transition-all">
                  <select
                    id="select-city"
                    value={city}
                    onChange={(e) => setCity(e.target.value)}
                    className="w-full bg-transparent text-xs font-semibold text-slate-800 focus:outline-none cursor-pointer"
                  >
                    <option value="All">All Cities</option>
                    {availableCities.map((c) => (
                      <option key={c} value={c}>{c}</option>
                    ))}
                  </select>
                </div>
              )}

              {/* Property Type Select */}
              <div id="input-group-type" className="w-full md:w-48 bg-white border border-slate-200 rounded-xl px-3 h-12 flex items-center focus-within:ring-2 focus-within:ring-emerald-500 transition-all">
                <Home className="h-4 w-4 text-emerald-600 shrink-0 mr-1.5" />
                <select
                  id="select-property-type"
                  value={propertyType}
                  onChange={(e) => setPropertyType(e.target.value)}
                  className="w-full bg-transparent text-xs font-semibold text-slate-800 focus:outline-none cursor-pointer"
                >
                  <option value="All">All Property Types</option>
                  <option value="apartment">Apartment</option>
                  <option value="duplex">Duplex</option>
                  <option value="bungalow">Bungalow</option>
                  <option value="self-contain">Self-Contain (Sef Contain)</option>
                </select>
              </div>

              {/* Big Primary Search Button */}
              <button
                id="btn-execute-search"
                type="submit"
                className="w-full md:w-auto bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-700 hover:to-teal-700 text-white font-display font-bold text-xs sm:text-sm h-12 px-6 rounded-xl shadow-md hover:shadow-lg hover:shadow-emerald-600/20 active:scale-[0.98] transition-all flex items-center justify-center space-x-2 shrink-0 cursor-pointer"
              >
                <Search className="h-4.5 w-4.5" />
                <span>Search</span>
              </button>
            </div>

            {/* Advanced Filters Expandable Panel */}
            {showAdvanced && (
              <div id="advanced-filters-panel" className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-5 gap-3 p-4 bg-slate-50 rounded-xl border border-slate-200/80 transition-all duration-300">
                
                {/* Min Price */}
                <div id="adv-min-price" className="flex flex-col">
                  <label className="text-[10px] font-semibold text-slate-500 mb-1">Min Price (₦)</label>
                  <input
                    id="input-min-price"
                    type="number"
                    placeholder="e.g. 500000"
                    value={minPrice}
                    onChange={(e) => setMinPrice(e.target.value)}
                    className="bg-white border border-slate-200 rounded-xl px-3 h-10 text-xs font-medium text-slate-800 focus:outline-none focus:ring-2 focus:ring-emerald-500"
                  />
                </div>

                {/* Max Price */}
                <div id="adv-max-price" className="flex flex-col">
                  <label className="text-[10px] font-semibold text-slate-500 mb-1">Max Price (₦)</label>
                  <input
                    id="input-max-price"
                    type="number"
                    placeholder="e.g. 15000000"
                    value={maxPrice}
                    onChange={(e) => setMaxPrice(e.target.value)}
                    className="bg-white border border-slate-200 rounded-xl px-3 h-10 text-xs font-medium text-slate-800 focus:outline-none focus:ring-2 focus:ring-emerald-500"
                  />
                </div>

                {/* Bedrooms */}
                <div id="adv-bedrooms" className="flex flex-col">
                  <label className="text-[10px] font-semibold text-slate-500 mb-1">Bedrooms</label>
                  <select
                    id="select-bedrooms"
                    value={bedrooms}
                    onChange={(e) => setBedrooms(e.target.value)}
                    className="bg-white border border-slate-200 rounded-xl px-3 h-10 text-xs font-medium text-slate-800 focus:outline-none focus:ring-2 focus:ring-emerald-500 cursor-pointer"
                  >
                    <option value="Any">Any Beds</option>
                    <option value="1">1 Bed</option>
                    <option value="2">2 Beds</option>
                    <option value="3">3 Beds</option>
                    <option value="4">4 Beds</option>
                    <option value="5">5+ Beds</option>
                  </select>
                </div>

                {/* Bathrooms */}
                <div id="adv-bathrooms" className="flex flex-col">
                  <label className="text-[10px] font-semibold text-slate-500 mb-1">Bathrooms</label>
                  <select
                    id="select-bathrooms"
                    value={bathrooms}
                    onChange={(e) => setBathrooms(e.target.value)}
                    className="bg-white border border-slate-200 rounded-xl px-3 h-10 text-xs font-medium text-slate-800 focus:outline-none focus:ring-2 focus:ring-emerald-500 cursor-pointer"
                  >
                    <option value="Any">Any Baths</option>
                    <option value="1">1 Bath</option>
                    <option value="2">2 Baths</option>
                    <option value="3">3 Baths</option>
                    <option value="4">4 Baths</option>
                    <option value="5">5+ Baths</option>
                  </select>
                </div>

                {/* Furnished */}
                <div id="adv-furnished" className="flex flex-col">
                  <label className="text-[10px] font-semibold text-slate-500 mb-1">Furnished</label>
                  <select
                    id="select-furnished"
                    value={furnished}
                    onChange={(e) => setFurnished(e.target.value)}
                    className="bg-white border border-slate-200 rounded-xl px-3 h-10 text-xs font-medium text-slate-800 focus:outline-none focus:ring-2 focus:ring-emerald-500 cursor-pointer"
                  >
                    <option value="Any">Any status</option>
                    <option value="Yes">Fully Furnished</option>
                    <option value="No">Unfurnished</option>
                  </select>
                </div>

              </div>
            )}
          </form>
        </div>

        {/* Quick Categories Bar */}
        <div id="quick-categories-scroller" className="mt-12 text-left max-w-5xl mx-auto">
          <p id="categories-heading" className="text-xs font-semibold text-slate-400 uppercase tracking-widest mb-4 text-center">
            Or browse by specialized real estate categories
          </p>
          <div id="categories-list" className="flex items-center space-x-3 overflow-x-auto pb-4 no-scrollbar">
            <button
              id="category-pill-all"
              onClick={() => handleCategoryClick('All')}
              className={`px-4 py-2.5 rounded-full text-xs font-semibold whitespace-nowrap transition-all duration-200 cursor-pointer ${
                activeCategory === 'All'
                  ? 'bg-emerald-500 text-white shadow-md shadow-emerald-500/10'
                  : 'bg-white/5 border border-white/10 text-slate-300 hover:bg-white/10 hover:border-white/20'
              }`}
            >
              All Categories
            </button>
            {categoriesList.map((cat) => (
              <button
                key={cat.id}
                id={`category-pill-${cat.id}`}
                onClick={() => handleCategoryClick(cat.id)}
                className={`px-4 py-2.5 rounded-full text-xs font-semibold whitespace-nowrap transition-all duration-200 flex items-center space-x-2 cursor-pointer ${
                  activeCategory === cat.id
                    ? 'bg-emerald-500 text-white shadow-md shadow-emerald-500/10'
                    : 'bg-white/5 border border-white/10 text-slate-300 hover:bg-white/10 hover:border-white/20'
                }`}
              >
                <span>{cat.name}</span>
                <span className={`text-[10px] px-1.5 py-0.5 rounded-full ${
                  activeCategory === cat.id ? 'bg-emerald-600 text-white' : 'bg-slate-800 text-slate-400'
                }`}>{cat.count}</span>
              </button>
            ))}
          </div>
        </div>

      </div>
    </section>
  );
}
