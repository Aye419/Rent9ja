export interface Property {
  id: string;
  title: string;
  description: string;
  price: number;
  period: 'monthly' | 'yearly' | 'total';
  type: 'rent' | 'sale';
  propertyType: 'apartment' | 'duplex' | 'bungalow' | 'self-contain' | 'mini-flat' | 'shared' | 'student' | 'office' | 'shop' | 'warehouse' | 'land';
  state: string;
  city: string;
  area: string;
  bedrooms: number;
  bathrooms: number;
  squareMeters: number;
  furnished: boolean;
  verified: boolean;
  featured: boolean;
  images: string[];
  amenities: string[];
  nearbySchools: string[];
  nearbyHospitals: string[];
  nearbySupermarkets: string[];
  agent: {
    id: string;
    name: string;
    phone: string;
    whatsapp: string;
    email: string;
    verified: boolean;
    badge: 'standard' | 'verified' | 'premium';
    image: string;
  };
  ownerUid?: string;
  gps: {
    lat: number;
    lng: number;
  };
  views: number;
  leads: number;
  createdAt: string;
  approved: boolean;
  reported: boolean;
  reportReason?: string;
}

export interface Booking {
  id: string;
  propertyId: string;
  propertyTitle: string;
  propertyImage?: string;
  price: number;
  period: string;
  customerUid: string;
  customerName: string;
  customerEmail: string;
  customerPhone?: string;
  landlordUid: string;
  landlordName: string;
  landlordPhone?: string;
  startDate: string;
  durationMonths: number;
  totalAmount: number;
  status: 'pending' | 'approved' | 'rejected' | 'completed' | 'cancelled';
  createdAt: string;
  notes?: string;
}

export interface Message {
  id: string;
  listingId?: string;
  senderId: string;
  senderName: string;
  senderRole: 'user' | 'agent' | 'admin' | 'landlord' | 'customer';
  receiverId: string;
  content: string;
  timestamp: string;
}

export interface UserProfile {
  id: string;
  name: string;
  email: string;
  phone: string;
  role: 'landlord' | 'customer' | 'admin' | 'tenant' | 'buyer' | 'agent';
  verifiedEmail: boolean;
  verifiedPhone: boolean;
  verifiedAgent: boolean;
  badge: 'standard' | 'verified' | 'premium';
  avatar: string;
  companyName?: string;
  disabled?: boolean;
  createdAt?: string;
}

export interface SearchFilters {
  state: string;
  city: string;
  area: string;
  propertyType: string;
  type: 'all' | 'rent' | 'sale';
  minPrice: string;
  maxPrice: string;
  bedrooms: string;
  bathrooms: string;
  furnished: string;
}

export interface ReviewReport {
  id: string;
  listingId: string;
  propertyTitle: string;
  reporterName: string;
  reporterEmail: string;
  reason: string;
  details: string;
  status: 'pending' | 'resolved' | 'dismissed';
  createdAt: string;
}

export interface PriceAlert {
  id: string;
  email: string;
  propertyType: string;
  state: string;
  city: string;
  maxPrice: number;
}
