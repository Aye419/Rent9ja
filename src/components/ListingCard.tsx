import React from 'react';
import { Heart, Share2, Eye, ShieldCheck, MapPin, Bed, Bath, Maximize } from 'lucide-react';
import { Property } from '../types';

interface ListingCardProps {
  key?: React.Key;
  property: Property;
  onViewDetails: (id: string) => void;
  isFavorite: boolean;
  onToggleFavorite: (id: string, e?: React.MouseEvent) => void;
  onShare: (property: Property, e?: React.MouseEvent) => void;
}

export default function ListingCard({
  property,
  onViewDetails,
  isFavorite,
  onToggleFavorite,
  onShare
}: ListingCardProps) {
  
  // Format price helper
  const formatPrice = (price: number) => {
    return new Intl.NumberFormat('en-NG', {
      style: 'currency',
      currency: 'NGN',
      maximumFractionDigits: 0
    }).format(price);
  };

  const getPropertyTypeLabel = (type: string) => {
    return type.split('-').map(word => word.charAt(0).toUpperCase() + word.slice(1)).join(' ');
  };

  return (
    <div
      id={`property-card-${property.id}`}
      onClick={() => onViewDetails(property.id)}
      className="group relative flex flex-col bg-white rounded-2xl border border-slate-100 overflow-hidden shadow-sm hover:shadow-xl hover:-translate-y-1 transition-all-300 cursor-pointer"
    >
      {/* Badges / Images Section */}
      <div id={`image-container-${property.id}`} className="relative h-48 sm:h-56 w-full overflow-hidden bg-slate-100">
        <img
          id={`property-image-${property.id}`}
          src={property.images[0]}
          alt={property.title}
          className="h-full w-full object-cover group-hover:scale-105 transition-all duration-500"
          referrerPolicy="no-referrer"
        />
        
        {/* Gradients */}
        <div className="absolute inset-0 bg-gradient-to-t from-slate-950/40 via-transparent to-transparent" />

        {/* Featured Tag */}
        {property.featured && (
          <div id={`featured-tag-${property.id}`} className="absolute top-3 left-3 px-2.5 py-1 rounded-lg text-[10px] font-bold bg-emerald-600 text-white shadow-md uppercase tracking-wider">
            Featured
          </div>
        )}

        {/* Property Type Pill */}
        <div id={`type-pill-${property.id}`} className="absolute bottom-3 left-3 px-2 py-0.5 rounded-md text-[10px] font-bold bg-slate-950/70 text-white backdrop-blur-sm">
          {getPropertyTypeLabel(property.propertyType)}
        </div>

        {/* Verified Badge */}
        {property.verified && (
          <div id={`verified-badge-${property.id}`} className="absolute top-3 right-12 flex items-center space-x-1 px-2.5 py-1 rounded-lg text-[10px] font-semibold bg-blue-600 text-white shadow-md">
            <ShieldCheck className="h-3 w-3" />
            <span>Verified</span>
          </div>
        )}

        {/* Favorite Trigger */}
        <button
          id={`favorite-btn-${property.id}`}
          onClick={(e) => onToggleFavorite(property.id, e)}
          className={`absolute top-3 right-3 h-8 w-8 rounded-lg flex items-center justify-center backdrop-blur-sm shadow-md transition-all ${
            isFavorite 
              ? 'bg-red-500 text-white hover:bg-red-600' 
              : 'bg-white/80 hover:bg-white text-slate-700 hover:text-red-500'
          }`}
        >
          <Heart className={`h-4.5 w-4.5 ${isFavorite ? 'fill-current' : ''}`} />
        </button>
      </div>

      {/* Content Details */}
      <div id={`content-details-${property.id}`} className="p-4 flex-1 flex flex-col justify-between">
        
        <div className="mb-3">
          {/* Price */}
          <div className="flex items-baseline mb-1">
            <span id={`property-price-${property.id}`} className="text-lg font-bold text-slate-900 font-display">
              {formatPrice(property.price)}
            </span>
            {property.type === 'rent' && (
              <span id={`property-period-${property.id}`} className="text-xs text-slate-500 ml-1">
                /{property.period === 'yearly' ? 'year' : 'month'}
              </span>
            )}
          </div>

          {/* Title */}
          <h3 id={`property-title-${property.id}`} className="font-display font-bold text-sm text-slate-800 line-clamp-1 group-hover:text-emerald-600 transition-colors">
            {property.title}
          </h3>

          {/* Location */}
          <div id={`property-location-${property.id}`} className="flex items-center text-slate-500 text-xs mt-1.5 space-x-1">
            <MapPin className="h-3.5 w-3.5 text-slate-400 shrink-0" />
            <span className="truncate">{property.area}, {property.city}</span>
          </div>
        </div>

        {/* Specs and action icons */}
        <div id={`property-specs-bar-${property.id}`} className="pt-3 border-t border-slate-100 flex items-center justify-between text-slate-600">
          
          {/* Specifications */}
          <div className="flex items-center space-x-3 text-[11px] font-semibold text-slate-500">
            {property.bedrooms > 0 && (
              <span id={`spec-beds-${property.id}`} className="flex items-center space-x-1">
                <Bed className="h-3.5 w-3.5 text-slate-400" />
                <span>{property.bedrooms} Beds</span>
              </span>
            )}
            
            {property.bathrooms > 0 && (
              <span id={`spec-baths-${property.id}`} className="flex items-center space-x-1">
                <Bath className="h-3.5 w-3.5 text-slate-400" />
                <span>{property.bathrooms} Baths</span>
              </span>
            )}

            {property.squareMeters > 0 && (
              <span id={`spec-sqm-${property.id}`} className="flex items-center space-x-1">
                <Maximize className="h-3.5 w-3.5 text-slate-400" />
                <span>{property.squareMeters} m²</span>
              </span>
            )}
          </div>

          {/* Action buttons (Share & View) */}
          <div className="flex items-center space-x-1">
            <button
              id={`share-btn-${property.id}`}
              onClick={(e) => onShare(property, e)}
              className="h-7 w-7 rounded-md hover:bg-slate-100 flex items-center justify-center text-slate-500 hover:text-emerald-600 transition-colors cursor-pointer"
              title="Share listing"
            >
              <Share2 className="h-4 w-4" />
            </button>
            <button
              id={`details-btn-${property.id}`}
              className="h-7 w-7 rounded-md hover:bg-slate-100 flex items-center justify-center text-slate-500 hover:text-emerald-600 transition-colors"
              title="View details"
            >
              <Eye className="h-4 w-4" />
            </button>
          </div>

        </div>

      </div>
    </div>
  );
}
