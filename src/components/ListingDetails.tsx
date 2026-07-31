import React, { useState } from 'react';
import { 
  ArrowLeft, Share2, Heart, ShieldCheck, MapPin, Bed, Bath, Maximize, 
  Phone, Mail, Calendar, Flag, MessageSquare, Check, School, Subtitles, 
  Map, Eye, Compass, Info, AlertTriangle, MessageCircle, Sparkles, User, Key, CheckCircle2, Clock
} from 'lucide-react';
import { Property, UserProfile } from '../types';
import { createBookingInFirestore } from '../lib/firebaseService';

interface ListingDetailsProps {
  property: Property;
  onBack: () => void;
  isFavorite: boolean;
  onToggleFavorite: (id: string) => void;
  onShare: (property: Property) => void;
  currentUser: UserProfile | null;
  onOpenLogin: () => void;
  onSendMessage: (listingId: string, agentId: string, content: string) => void;
  onContactLead: (id: string) => void;
  onReport: (id: string, reason: string, details: string) => void;
  onBookingCreated?: () => void;
}

export default function ListingDetails({
  property,
  onBack,
  isFavorite,
  onToggleFavorite,
  onShare,
  currentUser,
  onOpenLogin,
  onSendMessage,
  onContactLead,
  onReport,
  onBookingCreated
}: ListingDetailsProps) {
  const [activeImageIdx, setActiveImageIdx] = useState(0);
  const [showZoomModal, setShowZoomModal] = useState(false);
  const [messageText, setMessageText] = useState('');
  const [isSendingMsg, setIsSendingMsg] = useState(false);
  const [msgSuccess, setMsgSuccess] = useState(false);

  // Booking Modal States
  const [showBookingModal, setShowBookingModal] = useState(false);
  const [bookingStartDate, setBookingStartDate] = useState(new Date().toISOString().split('T')[0]);
  const [bookingDurationMonths, setBookingDurationMonths] = useState(property.period === 'monthly' ? 1 : 12);
  const [bookingNotes, setBookingNotes] = useState('');
  const [isBookingSubmitting, setIsBookingSubmitting] = useState(false);
  const [bookingSuccess, setBookingSuccess] = useState(false);
  
  // Inspection Scheduler State
  const [inspectionDate, setInspectionDate] = useState('');
  const [inspectionTime, setInspectionTime] = useState('10:00');
  const [isScheduling, setIsScheduling] = useState(false);
  const [scheduleSuccess, setScheduleSuccess] = useState(false);

  // Reporting State
  const [showReportModal, setShowReportModal] = useState(false);
  const [reportReason, setReportReason] = useState('Incorrect price details');
  const [reportDetails, setReportDetails] = useState('');
  const [reportSuccess, setReportSuccess] = useState(false);

  // Map view tab
  const [mapTab, setMapTab] = useState<'map' | 'street'>('map');

  const formatPrice = (price: number) => {
    return new Intl.NumberFormat('en-NG', {
      style: 'currency',
      currency: 'NGN',
      maximumFractionDigits: 0
    }).format(price);
  };

  const handleInquirySubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!currentUser) {
      onOpenLogin();
      return;
    }
    if (!messageText.trim()) return;

    setIsSendingMsg(true);
    // Track Lead activity
    onContactLead(property.id);

    setTimeout(() => {
      onSendMessage(property.id, property.agent.id, messageText);
      setMessageText('');
      setIsSendingMsg(false);
      setMsgSuccess(true);
      setTimeout(() => setMsgSuccess(false), 4000);
    }, 1000);
  };

  const handleScheduleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!currentUser) {
      onOpenLogin();
      return;
    }
    if (!inspectionDate) return;

    setIsScheduling(true);
    onContactLead(property.id);

    setTimeout(() => {
      const formattedContent = `📅 Auto Inspection Schedule Request:\n* Date: ${inspectionDate}\n* Time: ${inspectionTime}\nI would like to verify the details in person. Please confirm my appointment!`;
      onSendMessage(property.id, property.agent.id, formattedContent);
      setIsScheduling(false);
      setScheduleSuccess(true);
      setTimeout(() => setScheduleSuccess(false), 4000);
    }, 1200);
  };

  const handleReportSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onReport(property.id, reportReason, reportDetails);
    setReportSuccess(true);
    setTimeout(() => {
      setReportSuccess(false);
      setShowReportModal(false);
      setReportDetails('');
    }, 2000);
  };

  const handleLeadAction = (type: 'whatsapp' | 'call' | 'email') => {
    onContactLead(property.id);
    if (type === 'whatsapp') {
      window.open(`https://wa.me/${property.agent.whatsapp}?text=Hello%20${property.agent.name},%20I%20am%20interested%20in%20your%20listing%20"${property.title}"%20on%20RentNaija.`, '_blank');
    } else if (type === 'call') {
      window.open(`tel:${property.agent.phone}`);
    } else if (type === 'email') {
      window.open(`mailto:${property.agent.email}?subject=Inquiry%20about%20${property.title}`);
    }
  };

  const handleConfirmBookingSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!currentUser) {
      onOpenLogin();
      return;
    }

    setIsBookingSubmitting(true);
    try {
      await createBookingInFirestore(
        {
          propertyId: property.id,
          propertyTitle: property.title,
          propertyImage: property.images[0] || '',
          price: property.price,
          period: property.period,
          landlordUid: property.agent.id || property.ownerUid || 'landlord-1',
          landlordName: property.agent.name || 'Property Owner',
          landlordPhone: property.agent.phone,
          startDate: bookingStartDate,
          durationMonths: Number(bookingDurationMonths),
          notes: bookingNotes
        },
        currentUser
      );

      setIsBookingSubmitting(false);
      setBookingSuccess(true);
      if (onBookingCreated) onBookingCreated();

      setTimeout(() => {
        setBookingSuccess(false);
        setShowBookingModal(false);
      }, 2500);
    } catch (err) {
      console.error('Booking submission error:', err);
      setIsBookingSubmitting(false);
      alert('Failed to submit rental booking. Please try again.');
    }
  };

  return (
    <div id="listing-details-root" className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 pb-24">
      {/* Back Button */}
      <div id="details-back-bar" className="flex items-center justify-between mb-6">
        <button
          id="btn-back-to-results"
          onClick={onBack}
          className="flex items-center space-x-2 text-slate-600 hover:text-emerald-600 font-semibold text-sm cursor-pointer"
        >
          <ArrowLeft className="h-4 w-4" />
          <span>Back to properties</span>
        </button>

        <div className="flex items-center space-x-3">
          <button
            id="btn-toggle-favorite-details"
            onClick={() => onToggleFavorite(property.id)}
            className={`h-9 px-3.5 rounded-xl flex items-center space-x-1.5 text-xs font-semibold shadow-sm transition-all cursor-pointer ${
              isFavorite 
                ? 'bg-red-50 border border-red-200 text-red-600' 
                : 'bg-white border border-slate-200 text-slate-600 hover:bg-slate-50'
            }`}
          >
            <Heart className={`h-4 w-4 ${isFavorite ? 'fill-current' : ''}`} />
            <span>{isFavorite ? 'Saved' : 'Save'}</span>
          </button>

          <button
            id="btn-share-details"
            onClick={() => onShare(property)}
            className="h-9 px-3.5 rounded-xl flex items-center space-x-1.5 text-xs font-semibold bg-white border border-slate-200 text-slate-600 hover:bg-slate-50 shadow-sm cursor-pointer"
          >
            <Share2 className="h-4 w-4" />
            <span>Share</span>
          </button>
        </div>
      </div>

      {/* Grid Layout: Main info / Gallery (Left) & Sidebar Action Panels (Right) */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        
        {/* Left column: Property Gallery & Content */}
        <div className="lg:col-span-2 space-y-6">
          
          {/* Main Visual Image & Gallery Slider */}
          <div id="details-gallery" className="space-y-3">
            <div 
              id="main-photo-viewport" 
              className="relative h-64 sm:h-96 w-full rounded-2xl overflow-hidden bg-slate-100 cursor-zoom-in"
              onClick={() => setShowZoomModal(true)}
            >
              <img
                id="main-gallery-image"
                src={property.images[activeImageIdx]}
                alt={property.title}
                className="h-full w-full object-cover"
                referrerPolicy="no-referrer"
              />
              <div className="absolute top-3 right-3 px-3 py-1 bg-slate-900/70 text-white backdrop-blur-sm text-[10px] font-bold rounded-lg uppercase">
                {activeImageIdx + 1} of {property.images.length} Photos
              </div>
            </div>

            {/* Thumbnail Selection Bar */}
            {property.images.length > 1 && (
              <div id="gallery-thumbnails" className="flex items-center space-x-2 overflow-x-auto pb-1 no-scrollbar">
                {property.images.map((img, idx) => (
                  <button
                    key={idx}
                    id={`thumb-btn-${idx}`}
                    onClick={() => setActiveImageIdx(idx)}
                    className={`relative h-16 w-24 rounded-lg overflow-hidden border-2 shrink-0 ${
                      activeImageIdx === idx ? 'border-emerald-500 shadow-md' : 'border-transparent'
                    }`}
                  >
                    <img src={img} alt="" className="h-full w-full object-cover" referrerPolicy="no-referrer" />
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* Heading Details */}
          <div id="details-header" className="bg-white p-6 rounded-2xl border border-slate-100 space-y-4 shadow-sm">
            
            <div className="flex flex-wrap items-center justify-between gap-3">
              {/* Price Tag */}
              <div>
                <span id="details-price" className="text-2xl sm:text-3xl font-bold font-display text-slate-950">
                  {formatPrice(property.price)}
                </span>
                {property.type === 'rent' && (
                  <span className="text-sm font-semibold text-slate-500 ml-1">
                    per {property.period === 'yearly' ? 'year' : 'month'}
                  </span>
                )}
              </div>

              {/* Badges */}
              <div className="flex items-center space-x-2">
                {property.featured && (
                  <span className="px-3 py-1 rounded-full text-xs font-bold bg-emerald-100 text-emerald-800">
                    Featured property
                  </span>
                )}
                {property.verified && (
                  <span className="flex items-center space-x-1 px-3 py-1 rounded-full text-xs font-bold bg-blue-50 border border-blue-100 text-blue-700">
                    <ShieldCheck className="h-4 w-4 text-blue-600" />
                    <span>Verified Owner</span>
                  </span>
                )}
              </div>
            </div>

            {/* Title */}
            <h1 id="details-title" className="text-xl sm:text-2xl font-bold font-display text-slate-900 leading-tight">
              {property.title}
            </h1>

            {/* Address */}
            <div id="details-address" className="flex items-center text-slate-600 text-sm space-x-1.5">
              <MapPin className="h-4 w-4 text-emerald-600 shrink-0" />
              <span>{property.area}, {property.city}, {property.state} State, Nigeria</span>
            </div>

            {/* Core Specs metrics */}
            <div id="details-specs-grid" className="grid grid-cols-3 gap-4 pt-4 border-t border-slate-50 text-center">
              
              <div className="bg-slate-50 p-3 rounded-xl">
                <div className="flex items-center justify-center space-x-1.5 text-slate-500 text-xs mb-1">
                  <Bed className="h-4 w-4" />
                  <span className="font-semibold">Bedrooms</span>
                </div>
                <span className="font-bold text-slate-800 text-sm">{property.bedrooms || '—'}</span>
              </div>

              <div className="bg-slate-50 p-3 rounded-xl">
                <div className="flex items-center justify-center space-x-1.5 text-slate-500 text-xs mb-1">
                  <Bath className="h-4 w-4" />
                  <span className="font-semibold">Bathrooms</span>
                </div>
                <span className="font-bold text-slate-800 text-sm">{property.bathrooms || '—'}</span>
              </div>

              <div className="bg-slate-50 p-3 rounded-xl">
                <div className="flex items-center justify-center space-x-1.5 text-slate-500 text-xs mb-1">
                  <Maximize className="h-4 w-4" />
                  <span className="font-semibold">Sqr Meters</span>
                </div>
                <span className="font-bold text-slate-800 text-sm">{property.squareMeters} m²</span>
              </div>

            </div>

          </div>

          {/* Description Block */}
          <div id="details-description" className="bg-white p-6 rounded-2xl border border-slate-100 shadow-sm space-y-3">
            <h2 className="text-base font-bold font-display text-slate-900">Property Description</h2>
            <p className="text-slate-600 text-sm leading-relaxed whitespace-pre-line font-light">
              {property.description}
            </p>
          </div>

          {/* Amenities checklist */}
          <div id="details-amenities" className="bg-white p-6 rounded-2xl border border-slate-100 shadow-sm space-y-4">
            <h2 className="text-base font-bold font-display text-slate-900">Premium Amenities</h2>
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
              {property.amenities.map((amenity, idx) => (
                <div key={idx} className="flex items-center space-x-2 text-slate-600 text-sm">
                  <div className="bg-emerald-50 text-emerald-600 p-1 rounded-full shrink-0">
                    <Check className="h-3.5 w-3.5" />
                  </div>
                  <span className="font-medium text-xs text-slate-700">{amenity}</span>
                </div>
              ))}
            </div>
          </div>

          {/* Nearby Proximity Hub (Schools, Hospitals, Supermarkets) */}
          <div id="details-proximity" className="bg-white p-6 rounded-2xl border border-slate-100 shadow-sm space-y-4">
            <h2 className="text-base font-bold font-display text-slate-900">Local Proximity & Neighbourhood</h2>
            
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              
              {/* Schools */}
              <div className="space-y-2">
                <h3 className="text-xs font-bold uppercase text-emerald-700 tracking-wider flex items-center space-x-1">
                  <School className="h-4 w-4" />
                  <span>Nearby Schools</span>
                </h3>
                <ul className="space-y-1.5 text-xs text-slate-600">
                  {property.nearbySchools.map((item, i) => (
                    <li key={i} className="flex items-start space-x-1">• <span className="ml-1">{item}</span></li>
                  ))}
                </ul>
              </div>

              {/* Hospitals */}
              <div className="space-y-2">
                <h3 className="text-xs font-bold uppercase text-red-700 tracking-wider flex items-center space-x-1">
                  <Heart className="h-4 w-4 text-red-600" />
                  <span>Healthcare / Hospitals</span>
                </h3>
                <ul className="space-y-1.5 text-xs text-slate-600">
                  {property.nearbyHospitals.map((item, i) => (
                    <li key={i} className="flex items-start space-x-1">• <span className="ml-1">{item}</span></li>
                  ))}
                </ul>
              </div>

              {/* Supermarkets */}
              <div className="space-y-2">
                <h3 className="text-xs font-bold uppercase text-blue-700 tracking-wider flex items-center space-x-1">
                  <Maximize className="h-4 w-4 text-blue-600" />
                  <span>Supermarkets & Malls</span>
                </h3>
                <ul className="space-y-1.5 text-xs text-slate-600">
                  {property.nearbySupermarkets.map((item, i) => (
                    <li key={i} className="flex items-start space-x-1">• <span className="ml-1">{item}</span></li>
                  ))}
                </ul>
              </div>

            </div>
          </div>

          {/* Simulated Interactive Map & Street View */}
          <div id="details-map-container" className="bg-white p-6 rounded-2xl border border-slate-100 shadow-sm space-y-4">
            <div className="flex items-center justify-between">
              <h2 className="text-base font-bold font-display text-slate-900 flex items-center space-x-1.5">
                <Map className="h-5 w-5 text-emerald-600" />
                <span>Geographical Location</span>
              </h2>
              <div className="flex space-x-1 bg-slate-100 p-1 rounded-lg">
                <button
                  onClick={() => setMapTab('map')}
                  className={`px-3 py-1 rounded-md text-[10px] font-bold cursor-pointer ${
                    mapTab === 'map' ? 'bg-white text-slate-800 shadow-sm' : 'text-slate-500'
                  }`}
                >
                  Satellite Map
                </button>
                <button
                  onClick={() => setMapTab('street')}
                  className={`px-3 py-1 rounded-md text-[10px] font-bold cursor-pointer ${
                    mapTab === 'street' ? 'bg-white text-slate-800 shadow-sm' : 'text-slate-500'
                  }`}
                >
                  Simulated 3D View
                </button>
              </div>
            </div>

            {/* Real GPS simulation block */}
            <div className="relative h-60 w-full rounded-xl overflow-hidden bg-slate-100 border border-slate-200">
              {mapTab === 'map' ? (
                /* Satellite map visual design representation */
                <div className="absolute inset-0 bg-[#e5e9f0] p-4 flex flex-col justify-between overflow-hidden">
                  {/* Grid Lines and street layout drawing */}
                  <div className="absolute inset-0 opacity-20 pointer-events-none" style={{ backgroundImage: 'radial-gradient(#2d3748 1px, transparent 1px)', backgroundSize: '24px 24px' }} />
                  <div className="absolute top-[25%] left-0 w-full h-8 bg-white border-y border-slate-300 transform -rotate-6 flex items-center px-8 text-[9px] uppercase tracking-wider font-semibold text-slate-400">
                    Naija Bypass Road
                  </div>
                  <div className="absolute left-[35%] top-0 h-full w-8 bg-white border-x border-slate-300 transform rotate-12 flex justify-center pt-8 text-[9px] uppercase tracking-wider font-semibold text-slate-400">
                    {property.city} Expressway
                  </div>

                  {/* Marker Pin */}
                  <div className="absolute top-[45%] left-[45%] -translate-x-1/2 -translate-y-1/2 flex flex-col items-center z-10">
                    <div className="bg-emerald-600 text-white p-2 rounded-full shadow-lg border-2 border-white flex items-center justify-center animate-bounce">
                      <MapPin className="h-5 w-5" />
                    </div>
                    <div className="bg-slate-900 text-white px-2.5 py-1 rounded-lg text-[10px] font-bold mt-1 shadow-md whitespace-nowrap">
                      {property.title} (GPS: {property.gps.lat}, {property.gps.lng})
                    </div>
                  </div>

                  {/* UI Coordinates HUD panel */}
                  <div className="absolute bottom-3 left-3 bg-white/90 backdrop-blur-sm p-2 rounded-lg border border-slate-200 text-[10px] font-mono text-slate-600 z-10 flex flex-col">
                    <span>GPS LAT: {property.gps.lat}</span>
                    <span>GPS LNG: {property.gps.lng}</span>
                    <span>STATE: {property.state.toUpperCase()}</span>
                  </div>

                  {/* Map Controls */}
                  <div className="absolute top-3 right-3 flex flex-col space-y-1 bg-white p-1 rounded-lg border border-slate-200 z-10">
                    <button className="h-6 w-6 font-bold text-xs bg-slate-50 hover:bg-slate-200 rounded text-slate-600">+</button>
                    <button className="h-6 w-6 font-bold text-xs bg-slate-50 hover:bg-slate-200 rounded text-slate-600">-</button>
                  </div>
                </div>
              ) : (
                /* Street View visual design representation */
                <div className="absolute inset-0 bg-slate-800 flex items-center justify-center overflow-hidden">
                  <img
                    src={property.images[0]}
                    alt="Street View"
                    className="h-full w-full object-cover blur-[1px] opacity-40 scale-110"
                    referrerPolicy="no-referrer"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-slate-950 via-transparent to-slate-950/60" />
                  
                  {/* Floating compass HUD */}
                  <div className="absolute top-4 left-4 flex items-center space-x-2 bg-black/50 backdrop-blur-sm px-3 py-1.5 rounded-lg border border-white/10 text-white text-xs">
                    <Compass className="h-4 w-4 animate-spin-slow text-emerald-400" />
                    <span className="font-semibold tracking-wide">360° Virtual Street Panorama</span>
                  </div>

                  <div className="text-center z-10 px-4 space-y-3">
                    <div className="inline-flex bg-emerald-600/95 text-white p-3 rounded-full shadow-lg">
                      <Sparkles className="h-6 w-6 animate-pulse" />
                    </div>
                    <h3 className="text-sm font-bold text-white tracking-wide">Take Simulated Virtual Tour</h3>
                    <p className="text-xs text-slate-300 font-light max-w-sm mx-auto leading-relaxed">
                      Click below to view the interactive walk-through recorded by Chinedu Okafor on-site. Verified RentNaija tour.
                    </p>
                    <button 
                      onClick={() => handleLeadAction('whatsapp')}
                      className="px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-semibold rounded-lg shadow-md transition-all cursor-pointer"
                    >
                      Request Virtual Tour via WhatsApp
                    </button>
                  </div>
                </div>
              )}
            </div>
          </div>

        </div>

        {/* Right column: Action Panel & Landlord/Agent card */}
        <div className="space-y-6">
          
          {/* Main Inquiry & Contact Card */}
          <div id="details-agent-card" className="bg-slate-900 text-white p-6 rounded-2xl shadow-xl border border-slate-800 space-y-6">
            
            {/* Agent profile intro */}
            <div className="flex items-center space-x-4">
              {property.agent.image ? (
                <img
                  id="agent-avatar"
                  src={property.agent.image}
                  alt={property.agent.name}
                  className="h-14 w-14 rounded-full object-cover border-2 border-emerald-500 shrink-0"
                  referrerPolicy="no-referrer"
                />
              ) : (
                <div id="agent-avatar" className="h-14 w-14 rounded-full bg-slate-800 text-slate-400 flex items-center justify-center border-2 border-emerald-500 shrink-0">
                  <User className="h-7 w-7 text-slate-400" />
                </div>
              )}
              <div className="space-y-1">
                <span className="text-[10px] text-emerald-400 font-extrabold uppercase tracking-widest flex items-center gap-1">
                  <ShieldCheck className="h-3.5 w-3.5" /> LISTING OWNER / LANDLORD
                </span>
                <h4 id="agent-name" className="font-display font-bold text-base text-white">{property.agent.name}</h4>
                <p className="text-xs text-slate-400">RentNaija verified property host</p>
              </div>
            </div>

            {/* Primary Action: Rent / Book House */}
            <div className="pt-2">
              <button
                type="button"
                onClick={() => {
                  if (!currentUser) {
                    onOpenLogin();
                  } else {
                    setShowBookingModal(true);
                  }
                }}
                className="w-full py-3.5 px-4 bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 text-white font-display font-bold text-sm rounded-xl shadow-lg shadow-emerald-900/40 transition-all cursor-pointer flex items-center justify-center space-x-2"
              >
                <Key className="h-5 w-5" />
                <span>Rent / Book This House</span>
              </button>
              <p className="text-[10px] text-slate-400 text-center mt-1.5">Directly logs booking request to Firebase Firestore</p>
            </div>

            {/* Quick action buttons */}
            <div id="agent-quick-comms" className="grid grid-cols-3 gap-2">
              
              <button
                onClick={() => handleLeadAction('whatsapp')}
                className="flex flex-col items-center justify-center p-2 rounded-xl bg-[#25D366] hover:bg-[#20ba59] text-white transition-all cursor-pointer"
              >
                <MessageCircle className="h-5 w-5 mb-1" />
                <span className="text-[10px] font-semibold">WhatsApp</span>
              </button>

              <button
                onClick={() => handleLeadAction('call')}
                className="flex flex-col items-center justify-center p-2 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white transition-all cursor-pointer"
              >
                <Phone className="h-5 w-5 mb-1" />
                <span className="text-[10px] font-semibold">Call Agent</span>
              </button>

              <button
                onClick={() => handleLeadAction('email')}
                className="flex flex-col items-center justify-center p-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-white border border-slate-700 transition-all cursor-pointer"
              >
                <Mail className="h-5 w-5 mb-1" />
                <span className="text-[10px] font-semibold">Email</span>
              </button>

            </div>

            {/* Live Message Form */}
            <form id="details-message-form" onSubmit={handleInquirySubmit} className="space-y-3 pt-3 border-t border-slate-800">
              <label className="text-xs font-semibold text-slate-300 block">Direct Inquiry Thread</label>
              <textarea
                id="message-textarea"
                value={messageText}
                onChange={(e) => setMessageText(e.target.value)}
                placeholder="Hi, is this available? I am ready for inspections..."
                rows={3}
                className="w-full bg-slate-950 border border-slate-800 rounded-xl p-3 text-xs font-medium text-slate-100 focus:outline-none focus:ring-2 focus:ring-emerald-500 placeholder:text-slate-600"
              />
              
              <button
                id="btn-send-message"
                type="submit"
                disabled={isSendingMsg}
                className="w-full h-11 bg-emerald-600 text-white text-xs font-bold rounded-xl hover:bg-emerald-700 active:scale-[0.98] transition-all flex items-center justify-center space-x-2 disabled:opacity-50 cursor-pointer"
              >
                <MessageSquare className="h-4 w-4" />
                <span>{isSendingMsg ? 'Sending Inquest...' : 'Send Message'}</span>
              </button>

              {msgSuccess && (
                <div id="msg-success-alert" className="p-2.5 rounded-lg bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 text-xs font-medium text-center">
                  Message submitted! Simulated Agent is replying soon.
                </div>
              )}
            </form>

          </div>

          {/* Inspection Scheduler Panel */}
          <div id="details-scheduler" className="bg-white p-6 rounded-2xl border border-slate-100 shadow-sm space-y-4">
            <h3 className="text-sm font-bold font-display text-slate-900 flex items-center space-x-1.5">
              <Calendar className="h-4.5 w-4.5 text-emerald-600" />
              <span>Schedule Inspection Visit</span>
            </h3>
            
            <form onSubmit={handleScheduleSubmit} className="space-y-3">
              <div className="grid grid-cols-2 gap-2">
                <div className="flex flex-col">
                  <label className="text-[9px] font-bold text-slate-500 uppercase tracking-wide mb-1">Select Date</label>
                  <input
                    type="date"
                    required
                    value={inspectionDate}
                    onChange={(e) => setInspectionDate(e.target.value)}
                    className="border border-slate-200 rounded-lg p-2 text-xs focus:ring-2 focus:ring-emerald-500 text-slate-800 bg-slate-50"
                  />
                </div>
                <div className="flex flex-col">
                  <label className="text-[9px] font-bold text-slate-500 uppercase tracking-wide mb-1">Select Time</label>
                  <input
                    type="time"
                    required
                    value={inspectionTime}
                    onChange={(e) => setInspectionTime(e.target.value)}
                    className="border border-slate-200 rounded-lg p-2 text-xs focus:ring-2 focus:ring-emerald-500 text-slate-800 bg-slate-50"
                  />
                </div>
              </div>

              <button
                type="submit"
                disabled={isScheduling}
                className="w-full h-10 bg-slate-900 hover:bg-slate-800 text-white text-xs font-bold rounded-lg transition-all flex items-center justify-center space-x-1.5 cursor-pointer"
              >
                <span>Book Free Inspection Slot</span>
              </button>

              {scheduleSuccess && (
                <div className="p-2 bg-emerald-50 border border-emerald-100 text-emerald-700 text-xs text-center rounded-lg font-medium">
                  Booking submitted! Request logged to your dashboard inbox.
                </div>
              )}
            </form>
          </div>

          {/* Flag / Report Trigger */}
          <div id="details-flag-area" className="text-center">
            <button
              onClick={() => setShowReportModal(true)}
              className="text-xs font-semibold text-slate-400 hover:text-red-500 inline-flex items-center space-x-1.5 transition-colors cursor-pointer"
            >
              <Flag className="h-3.5 w-3.5" />
              <span>Report this listing as Fake / Scam</span>
            </button>
          </div>

        </div>

      </div>

      {/* Image Zoom Modal */}
      {showZoomModal && (
        <div id="zoom-modal" className="fixed inset-0 z-50 bg-black/95 flex flex-col justify-center items-center p-4">
          <button 
            onClick={() => setShowZoomModal(false)}
            className="absolute top-4 right-4 bg-white/10 hover:bg-white/20 text-white p-2 rounded-full cursor-pointer"
          >
            ✕
          </button>
          <img 
            src={property.images[activeImageIdx]} 
            alt={property.title} 
            className="max-h-[80vh] max-w-full object-contain rounded-lg"
            referrerPolicy="no-referrer"
          />
          <p className="text-white text-xs mt-4 font-medium px-4 text-center">{property.title}</p>
        </div>
      )}

      {/* Report Listing Modal Dialog */}
      {showReportModal && (
        <div id="report-modal" className="fixed inset-0 z-50 bg-black/60 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl w-full max-w-md p-6 shadow-2xl relative">
            <button 
              onClick={() => setShowReportModal(false)}
              className="absolute top-4 right-4 text-slate-400 hover:text-slate-600 text-lg cursor-pointer"
            >
              ✕
            </button>
            
            <div className="flex items-center space-x-2 text-red-600 mb-4">
              <AlertTriangle className="h-5 w-5" />
              <h3 className="font-display font-bold text-base">Report suspicious Listing</h3>
            </div>

            <form onSubmit={handleReportSubmit} className="space-y-4">
              <div>
                <label className="text-xs font-semibold text-slate-500 block mb-1">Reason for report</label>
                <select
                  value={reportReason}
                  onChange={(e) => setReportReason(e.target.value)}
                  className="w-full border border-slate-200 bg-slate-50 rounded-xl p-2.5 text-xs text-slate-800"
                >
                  <option value="Incorrect price details">Incorrect price details</option>
                  <option value="Fake photos or misleading description">Fake photos or misleading description</option>
                  <option value="Suspected agent scammer / duplicate account">Suspected agent scammer</option>
                  <option value="Property already rented or sold">Property already rented or sold</option>
                  <option value="Other complaints">Other complaints</option>
                </select>
              </div>

              <div>
                <label className="text-xs font-semibold text-slate-500 block mb-1">Elaborated details</label>
                <textarea
                  required
                  placeholder="Provide more information so our Admin review panel can investigate..."
                  value={reportDetails}
                  onChange={(e) => setReportDetails(e.target.value)}
                  rows={4}
                  className="w-full border border-slate-200 rounded-xl p-2.5 text-xs text-slate-800 focus:ring-2 focus:ring-emerald-500"
                />
              </div>

              <div className="flex space-x-2 pt-2">
                <button
                  type="button"
                  onClick={() => setShowReportModal(false)}
                  className="flex-1 py-2 rounded-xl text-xs font-bold bg-slate-100 hover:bg-slate-200 text-slate-700 cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="flex-1 py-2 rounded-xl text-xs font-bold bg-red-600 hover:bg-red-700 text-white transition-all cursor-pointer"
                >
                  Submit Investigation
                </button>
              </div>

              {reportSuccess && (
                <div className="p-2 bg-emerald-50 border border-emerald-100 text-emerald-700 text-xs text-center rounded-lg font-medium">
                  Report logged successfully! Our admins will inspect.
                </div>
              )}
            </form>
          </div>
        </div>
      )}

      {/* Rent / Book Property Firestore Modal */}
      {showBookingModal && (
        <div id="booking-modal-overlay" className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl w-full max-w-md overflow-hidden shadow-2xl relative border border-slate-100 flex flex-col animate-in zoom-in-95 duration-200">
            
            <button 
              onClick={() => setShowBookingModal(false)}
              className="absolute top-4 right-4 text-slate-400 hover:text-slate-600 p-1 rounded-full cursor-pointer"
            >
              ✕
            </button>

            <div className="bg-slate-900 text-white p-6 space-y-1">
              <span className="text-[10px] text-emerald-400 font-extrabold uppercase tracking-widest block">FIRESTORE RENTAL BOOKING</span>
              <h3 className="font-display font-bold text-lg text-white">
                Rent / Book This Property
              </h3>
              <p className="text-xs text-slate-400 font-light truncate">{property.title}</p>
            </div>

            <div className="p-6 space-y-4">
              {bookingSuccess ? (
                <div className="py-8 text-center space-y-3">
                  <div className="h-14 w-14 bg-emerald-100 text-emerald-600 rounded-full flex items-center justify-center mx-auto">
                    <CheckCircle2 className="h-8 w-8" />
                  </div>
                  <h4 className="text-base font-bold text-slate-900">Rental Booking Submitted!</h4>
                  <p className="text-xs text-slate-500 max-w-xs mx-auto">
                    Your request has been recorded in Firestore database. The landlord ({property.agent.name}) can review it in their dashboard.
                  </p>
                </div>
              ) : (
                <form onSubmit={handleConfirmBookingSubmit} className="space-y-4">
                  
                  <div className="bg-slate-50 p-3.5 rounded-2xl border border-slate-200 flex items-center justify-between">
                    <div>
                      <span className="text-[10px] text-slate-400 uppercase font-bold block">Rental Price</span>
                      <span className="text-base font-bold text-slate-900">{formatPrice(property.price)}</span>
                      <span className="text-xs text-slate-500 font-normal"> / {property.period}</span>
                    </div>
                    <div className="text-right">
                      <span className="text-[10px] text-slate-400 uppercase font-bold block">Landlord</span>
                      <span className="text-xs font-bold text-emerald-700">{property.agent.name}</span>
                    </div>
                  </div>

                  <div>
                    <label className="text-[10px] font-bold text-slate-500 uppercase tracking-wider block mb-1">Desired Move-in Start Date</label>
                    <input
                      required
                      type="date"
                      value={bookingStartDate}
                      onChange={(e) => setBookingStartDate(e.target.value)}
                      className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 h-10 text-xs text-slate-800 focus:outline-none focus:ring-2 focus:ring-emerald-500"
                    />
                  </div>

                  <div>
                    <label className="text-[10px] font-bold text-slate-500 uppercase tracking-wider block mb-1">Lease / Rental Duration (Months)</label>
                    <select
                      value={bookingDurationMonths}
                      onChange={(e) => setBookingDurationMonths(Number(e.target.value))}
                      className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 h-10 text-xs text-slate-800 focus:outline-none focus:ring-2 focus:ring-emerald-500"
                    >
                      <option value={1}>1 Month (Short-let)</option>
                      <option value={3}>3 Months</option>
                      <option value={6}>6 Months</option>
                      <option value={12}>12 Months (1 Year Standard)</option>
                      <option value={24}>24 Months (2 Years)</option>
                    </select>
                  </div>

                  <div>
                    <label className="text-[10px] font-bold text-slate-500 uppercase tracking-wider block mb-1">Notes / Special Requests (Optional)</label>
                    <textarea
                      placeholder="e.g. Preferred inspection times, family size, or move-in logistics..."
                      value={bookingNotes}
                      onChange={(e) => setBookingNotes(e.target.value)}
                      rows={3}
                      className="w-full bg-slate-50 border border-slate-200 rounded-xl p-3 text-xs text-slate-800 focus:outline-none focus:ring-2 focus:ring-emerald-500"
                    />
                  </div>

                  <button
                    type="submit"
                    disabled={isBookingSubmitting}
                    className="w-full h-11 bg-emerald-600 hover:bg-emerald-700 disabled:opacity-50 text-white font-display font-bold text-xs rounded-xl shadow-lg transition-all cursor-pointer flex items-center justify-center space-x-2"
                  >
                    <Key className="h-4 w-4" />
                    <span>{isBookingSubmitting ? 'Recording to Firestore...' : 'Confirm Rental Booking Request'}</span>
                  </button>

                </form>
              )}
            </div>

          </div>
        </div>
      )}

    </div>
  );
}
