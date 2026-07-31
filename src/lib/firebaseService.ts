import { 
  createUserWithEmailAndPassword, 
  signInWithEmailAndPassword, 
  signOut, 
  onAuthStateChanged,
  User as FirebaseUser
} from 'firebase/auth';
import { 
  collection, 
  doc, 
  setDoc, 
  getDoc, 
  getDocs, 
  updateDoc, 
  deleteDoc, 
  query, 
  where,
  orderBy 
} from 'firebase/firestore';
import { auth, db } from './firebase';
import { Property, UserProfile, Booking } from '../types';
import { initialProperties } from '../mockData';

export const SUPER_ADMIN_EMAIL = 'aaronayemusa@gmail.com';

// ================= USER AUTH & FIRESTORE CRUD =================

export async function registerWithFirebase(
  name: string,
  email: string,
  phone: string,
  password: string,
  roleSelection: 'landlord' | 'customer'
): Promise<UserProfile> {
  const normalizedEmail = email.trim().toLowerCase();
  
  // Super admin check
  const finalRole: 'admin' | 'landlord' | 'customer' = 
    normalizedEmail === SUPER_ADMIN_EMAIL ? 'admin' : roleSelection;

  // 1. Create Auth user
  const userCredential = await createUserWithEmailAndPassword(auth, normalizedEmail, password);
  const user = userCredential.user;

  // 2. Prepare user profile document
  const userProfile: UserProfile = {
    id: user.uid,
    name: name.trim(),
    email: normalizedEmail,
    phone: phone.trim(),
    role: finalRole,
    verifiedEmail: true,
    verifiedPhone: true,
    verifiedAgent: finalRole === 'landlord' || finalRole === 'admin',
    badge: finalRole === 'admin' ? 'premium' : finalRole === 'landlord' ? 'verified' : 'standard',
    avatar: '',
    createdAt: new Date().toISOString()
  };

  // 3. Save to Firestore users collection
  await setDoc(doc(db, 'users', user.uid), userProfile);

  return userProfile;
}

export async function loginWithFirebase(email: string, password: string): Promise<UserProfile> {
  const normalizedEmail = email.trim().toLowerCase();
  const userCredential = await signInWithEmailAndPassword(auth, normalizedEmail, password);
  const user = userCredential.user;

  // Fetch Firestore profile
  const userDocRef = doc(db, 'users', user.uid);
  const userSnap = await getDoc(userDocRef);

  let profile: UserProfile;

  if (userSnap.exists()) {
    profile = userSnap.data() as UserProfile;
    
    // Auto grant super admin if email matches
    if (normalizedEmail === SUPER_ADMIN_EMAIL && profile.role !== 'admin') {
      profile.role = 'admin';
      profile.badge = 'premium';
      await updateDoc(userDocRef, { role: 'admin', badge: 'premium' });
    }
  } else {
    // Fallback profile creation if absent in Firestore
    const isSuperAdmin = normalizedEmail === SUPER_ADMIN_EMAIL;
    profile = {
      id: user.uid,
      name: user.displayName || normalizedEmail.split('@')[0],
      email: normalizedEmail,
      phone: '+234 800 000 0000',
      role: isSuperAdmin ? 'admin' : 'customer',
      verifiedEmail: true,
      verifiedPhone: true,
      verifiedAgent: isSuperAdmin,
      badge: isSuperAdmin ? 'premium' : 'standard',
      avatar: '',
      createdAt: new Date().toISOString()
    };
    await setDoc(userDocRef, profile);
  }

  if (profile.disabled) {
    await signOut(auth);
    throw new Error('Your account has been deactivated by the system administrator.');
  }

  return profile;
}

export async function logoutFirebase(): Promise<void> {
  await signOut(auth);
}

export async function fetchUserProfile(uid: string): Promise<UserProfile | null> {
  try {
    const userSnap = await getDoc(doc(db, 'users', uid));
    if (userSnap.exists()) {
      return userSnap.data() as UserProfile;
    }
    return null;
  } catch (err) {
    console.error('Error fetching user profile from Firestore:', err);
    return null;
  }
}

// ================= PROPERTY CRUD OPERATIONS =================

export async function fetchPropertiesFromFirestore(): Promise<Property[]> {
  try {
    const querySnap = await getDocs(collection(db, 'properties'));
    if (querySnap.empty) {
      // Seed Firestore with initial properties on first run
      console.log('Seeding initial properties into Firestore...');
      const seeded: Property[] = [];
      for (const prop of initialProperties) {
        const propRef = doc(db, 'properties', prop.id);
        const propData = { ...prop, ownerUid: prop.agent.id || 'system-landlord' };
        await setDoc(propRef, propData);
        seeded.push(propData);
      }
      return seeded;
    }

    const propertiesList: Property[] = [];
    querySnap.forEach((docSnap) => {
      propertiesList.push(docSnap.data() as Property);
    });

    return propertiesList.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
  } catch (err) {
    console.error('Error fetching properties from Firestore:', err);
    return initialProperties;
  }
}

export async function createPropertyInFirestore(
  propertyData: Partial<Property>,
  currentUser: UserProfile
): Promise<Property> {
  if (currentUser.role !== 'landlord' && currentUser.role !== 'admin' && currentUser.role !== 'agent') {
    throw new Error('Unauthorized: Only Landlords and Admins can post property listings.');
  }

  const newId = `prop-${Date.now()}`;
  const fullProperty: Property = {
    id: newId,
    title: propertyData.title || 'Untitled Property',
    description: propertyData.description || '',
    price: Number(propertyData.price) || 0,
    period: propertyData.period || 'yearly',
    type: propertyData.type || 'rent',
    propertyType: propertyData.propertyType || 'apartment',
    state: propertyData.state || 'Lagos',
    city: propertyData.city || 'Lekki',
    area: propertyData.area || 'Phase 1',
    bedrooms: Number(propertyData.bedrooms) || 1,
    bathrooms: Number(propertyData.bathrooms) || 1,
    squareMeters: Number(propertyData.squareMeters) || 100,
    furnished: Boolean(propertyData.furnished),
    verified: currentUser.verifiedAgent || currentUser.role === 'admin',
    featured: currentUser.role === 'admin',
    images: propertyData.images && propertyData.images.length > 0 
      ? propertyData.images 
      : ['https://images.unsplash.com/photo-1560448204-e02f11c3d0e2?auto=format&fit=crop&w=1200&q=80'],
    amenities: propertyData.amenities || ['24/7 Security', 'Borehole Water', 'Prepaid Meter'],
    nearbySchools: propertyData.nearbySchools || ['Lekki British School'],
    nearbyHospitals: propertyData.nearbyHospitals || ['Redington Hospital'],
    nearbySupermarkets: propertyData.nearbySupermarkets || ['Shoprite Mall'],
    agent: {
      id: currentUser.id,
      name: currentUser.name,
      phone: currentUser.phone,
      whatsapp: currentUser.phone.replace(/[^0-9]/g, ''),
      email: currentUser.email,
      verified: currentUser.verifiedAgent || true,
      badge: currentUser.badge || 'verified',
      image: currentUser.avatar || ''
    },
    ownerUid: currentUser.id,
    gps: propertyData.gps || { lat: 6.4531, lng: 3.4678 },
    views: 1,
    leads: 0,
    createdAt: new Date().toISOString(),
    approved: true,
    reported: false
  };

  await setDoc(doc(db, 'properties', newId), fullProperty);
  return fullProperty;
}

export async function updatePropertyInFirestore(
  propertyId: string, 
  updates: Partial<Property>
): Promise<void> {
  const propRef = doc(db, 'properties', propertyId);
  await updateDoc(propRef, updates);
}

export async function deletePropertyInFirestore(propertyId: string): Promise<void> {
  await deleteDoc(doc(db, 'properties', propertyId));
}

// ================= BOOKING & RENTAL CRUD OPERATIONS =================

export async function createBookingInFirestore(
  bookingInput: {
    propertyId: string;
    propertyTitle: string;
    propertyImage?: string;
    price: number;
    period: string;
    landlordUid: string;
    landlordName: string;
    landlordPhone?: string;
    startDate: string;
    durationMonths: number;
    notes?: string;
  },
  currentUser: UserProfile
): Promise<Booking> {
  const bookingId = `book-${Date.now()}`;
  const totalAmount = bookingInput.period === 'monthly'
    ? bookingInput.price * bookingInput.durationMonths
    : bookingInput.price;

  const newBooking: Booking = {
    id: bookingId,
    propertyId: bookingInput.propertyId,
    propertyTitle: bookingInput.propertyTitle,
    propertyImage: bookingInput.propertyImage,
    price: bookingInput.price,
    period: bookingInput.period,
    customerUid: currentUser.id,
    customerName: currentUser.name,
    customerEmail: currentUser.email,
    customerPhone: currentUser.phone,
    landlordUid: bookingInput.landlordUid,
    landlordName: bookingInput.landlordName,
    landlordPhone: bookingInput.landlordPhone,
    startDate: bookingInput.startDate,
    durationMonths: bookingInput.durationMonths,
    totalAmount,
    status: 'pending',
    createdAt: new Date().toISOString(),
    notes: bookingInput.notes || ''
  };

  await setDoc(doc(db, 'bookings', bookingId), newBooking);
  return newBooking;
}

export async function fetchBookingsFromFirestore(currentUser?: UserProfile | null): Promise<Booking[]> {
  try {
    const querySnap = await getDocs(collection(db, 'bookings'));
    const allBookings: Booking[] = [];
    querySnap.forEach((docSnap) => {
      allBookings.push(docSnap.data() as Booking);
    });

    if (!currentUser) return [];

    if (currentUser.role === 'admin') {
      return allBookings.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
    } else if (currentUser.role === 'landlord') {
      return allBookings
        .filter(b => b.landlordUid === currentUser.id)
        .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
    } else {
      return allBookings
        .filter(b => b.customerUid === currentUser.id)
        .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
    }
  } catch (err) {
    console.error('Error fetching bookings from Firestore:', err);
    return [];
  }
}

export async function updateBookingStatusInFirestore(
  bookingId: string, 
  status: 'pending' | 'approved' | 'rejected' | 'completed' | 'cancelled'
): Promise<void> {
  await updateDoc(doc(db, 'bookings', bookingId), { status });
}

export async function deleteBookingInFirestore(bookingId: string): Promise<void> {
  await deleteDoc(doc(db, 'bookings', bookingId));
}

// ================= ADMIN USER MANAGEMENT CRUD =================

export async function fetchAllUsersFromFirestore(): Promise<UserProfile[]> {
  try {
    const querySnap = await getDocs(collection(db, 'users'));
    const usersList: UserProfile[] = [];
    querySnap.forEach((docSnap) => {
      usersList.push(docSnap.data() as UserProfile);
    });
    return usersList;
  } catch (err) {
    console.error('Error fetching all users from Firestore:', err);
    return [];
  }
}

export async function updateUserRoleInFirestore(
  uid: string, 
  newRole: 'landlord' | 'customer' | 'admin'
): Promise<void> {
  const userRef = doc(db, 'users', uid);
  await updateDoc(userRef, { 
    role: newRole,
    verifiedAgent: newRole === 'landlord' || newRole === 'admin',
    badge: newRole === 'admin' ? 'premium' : newRole === 'landlord' ? 'verified' : 'standard'
  });
}

export async function toggleUserStatusInFirestore(uid: string, disabled: boolean): Promise<void> {
  const userRef = doc(db, 'users', uid);
  await updateDoc(userRef, { disabled });
}

export async function deleteUserFromFirestore(uid: string): Promise<void> {
  await deleteDoc(doc(db, 'users', uid));
}
