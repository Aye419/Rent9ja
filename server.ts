import express from 'express';
import path from 'path';
import { createServer as createViteServer } from 'vite';
import { GoogleGenAI } from '@google/genai';
import dotenv from 'dotenv';
import { initialProperties } from './src/mockData';
import { Property, Message, UserProfile, ReviewReport, PriceAlert } from './src/types';

dotenv.config();

const app = express();
const PORT = 3000;

app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Server-side State
let properties: Property[] = [...initialProperties];
let messages: Message[] = [
  {
    id: 'msg-1',
    listingId: 'prop-1',
    senderId: 'buyer-1',
    senderName: 'Tunde Adebayo',
    senderRole: 'user',
    receiverId: 'agent-1',
    content: 'Hello, is this Lekki 4-bedroom duplex still available for yearly rent? I would like to schedule an inspection.',
    timestamp: new Date(Date.now() - 3600000 * 2).toISOString()
  },
  {
    id: 'msg-2',
    listingId: 'prop-1',
    senderId: 'agent-1',
    senderName: 'Chinedu Okafor',
    senderRole: 'agent',
    receiverId: 'buyer-1',
    content: 'Hello Tunde! Yes, it is very much available. We are doing inspections tomorrow (Tuesday) by 10 AM. Will you be available to come down?',
    timestamp: new Date(Date.now() - 3600000).toISOString()
  }
];

let reports: ReviewReport[] = [
  {
    id: 'rep-1',
    listingId: 'prop-4',
    propertyTitle: 'Executive 3 Bedroom Bungalow with Boys Quarters',
    reporterName: 'Segun Alao',
    reporterEmail: 'segun@gmail.com',
    reason: 'Incorrect price details',
    details: 'The listing states 32m but agent mentioned 38m when I called.',
    status: 'pending',
    createdAt: new Date(Date.now() - 86400000 * 3).toISOString()
  }
];

let priceAlerts: PriceAlert[] = [];
let userProfiles: UserProfile[] = [
  {
    id: 'buyer-1',
    name: 'Tunde Adebayo',
    email: 'tunde@gmail.com',
    phone: '+234 809 111 2222',
    role: 'buyer',
    verifiedEmail: true,
    verifiedPhone: true,
    verifiedAgent: false,
    badge: 'standard',
    avatar: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?auto=format&fit=crop&w=400&h=400&q=80'
  },
  {
    id: 'agent-1',
    name: 'Chinedu Okafor',
    email: 'chinedu.okafor@rentnaija.com',
    phone: '+234 812 345 6789',
    role: 'agent',
    verifiedEmail: true,
    verifiedPhone: true,
    verifiedAgent: true,
    badge: 'premium',
    avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&w=400&h=400&q=80',
    companyName: 'Chinedu Okafor & Partners'
  },
  {
    id: 'agent-2',
    name: 'Amina Yusuf',
    email: 'amina.yusuf@rentnaija.com',
    phone: '+234 905 111 2222',
    role: 'agent',
    verifiedEmail: true,
    verifiedPhone: true,
    verifiedAgent: true,
    badge: 'verified',
    avatar: 'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?auto=format&fit=crop&w=400&h=400&q=80',
    companyName: 'Amina Properties Ltd'
  }
];

// Initialize Gemini SDK
let ai: GoogleGenAI | null = null;
if (process.env.GEMINI_API_KEY) {
  try {
    ai = new GoogleGenAI({
      apiKey: process.env.GEMINI_API_KEY,
      httpOptions: {
        headers: {
          'User-Agent': 'aistudio-build',
        }
      }
    });
    console.log('Gemini AI initialized successfully!');
  } catch (err) {
    console.error('Error initializing Gemini AI:', err);
  }
} else {
  console.log('No GEMINI_API_KEY environment variable found. Falling back to simulated AI helper.');
}

// ================== API ROUTES ==================

// 1. Properties
app.get('/api/properties', (req, res) => {
  const {
    state,
    city,
    area,
    propertyType,
    type,
    minPrice,
    maxPrice,
    bedrooms,
    bathrooms,
    furnished,
    featured,
    search,
    category
  } = req.query;

  let filtered = properties.filter(p => p.approved);

  if (category && category !== 'All') {
    filtered = filtered.filter(p => p.propertyType?.toLowerCase() === (category as string).toLowerCase());
  }

  if (featured === 'true') {
    filtered = filtered.filter(p => p.featured);
  }

  if (state && state !== 'All') {
    filtered = filtered.filter(p => p.state.toLowerCase() === (state as string).toLowerCase());
  }

  if (city && city !== 'All') {
    filtered = filtered.filter(p => p.city.toLowerCase() === (city as string).toLowerCase());
  }

  if (area && area !== 'All') {
    filtered = filtered.filter(p => p.area.toLowerCase().includes((area as string).toLowerCase()));
  }

  if (propertyType && propertyType !== 'All') {
    filtered = filtered.filter(p => p.propertyType === propertyType);
  }

  if (type && type !== 'all') {
    filtered = filtered.filter(p => p.type === type);
  }

  if (minPrice) {
    filtered = filtered.filter(p => p.price >= Number(minPrice));
  }

  if (maxPrice) {
    filtered = filtered.filter(p => p.price <= Number(maxPrice));
  }

  if (bedrooms && bedrooms !== 'Any') {
    filtered = filtered.filter(p => p.bedrooms >= Number(bedrooms));
  }

  if (bathrooms && bathrooms !== 'Any') {
    filtered = filtered.filter(p => p.bathrooms >= Number(bathrooms));
  }

  if (furnished && furnished !== 'Any') {
    const isFurnished = furnished === 'Yes';
    filtered = filtered.filter(p => p.furnished === isFurnished);
  }

  if (search) {
    const term = (search as string).toLowerCase();
    filtered = filtered.filter(p => 
      p.title.toLowerCase().includes(term) ||
      p.description.toLowerCase().includes(term) ||
      p.city.toLowerCase().includes(term) ||
      p.area.toLowerCase().includes(term)
    );
  }

  // Sort by featured first, then newest
  filtered.sort((a, b) => {
    if (a.featured && !b.featured) return -1;
    if (!a.featured && b.featured) return 1;
    return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
  });

  res.json(filtered);
});

// GET single property
app.get('/api/properties/:id', (req, res) => {
  const prop = properties.find(p => p.id === req.params.id);
  if (!prop) {
    return res.status(404).json({ message: 'Property not found' });
  }
  // Increment view count dynamically
  prop.views += 1;
  res.json(prop);
});

// POST create listing (instant database updates)
app.post('/api/properties', (req, res) => {
  const body = req.body;
  
  const newProperty: Property = {
    id: `prop-${Date.now()}`,
    title: body.title || 'Untitled Property',
    description: body.description || 'No description provided.',
    price: Number(body.price) || 0,
    period: body.period || 'yearly',
    type: body.type || 'rent',
    propertyType: body.propertyType || 'apartment',
    state: body.state || 'Lagos',
    city: body.city || 'Lekki',
    area: body.area || 'Phase 1',
    bedrooms: Number(body.bedrooms) || 0,
    bathrooms: Number(body.bathrooms) || 0,
    squareMeters: Number(body.squareMeters) || 100,
    furnished: body.furnished === true || body.furnished === 'true',
    verified: false,
    featured: body.featured === true || body.featured === 'true',
    images: body.images && body.images.length > 0 ? body.images : [
      'https://images.unsplash.com/photo-1580587771525-78b9dba3b914?auto=format&fit=crop&w=1200&q=80'
    ],
    amenities: body.amenities || ['Prepaid Meter', 'Water Supply'],
    nearbySchools: body.nearbySchools || ['Local Primary School'],
    nearbyHospitals: body.nearbyHospitals || ['Community Health Clinic'],
    nearbySupermarkets: body.nearbySupermarkets || ['Supermarket'],
    agent: body.agent || {
      id: 'agent-1',
      name: 'Chinedu Okafor',
      phone: '+234 812 345 6789',
      whatsapp: '2348123456789',
      email: 'chinedu.okafor@rentnaija.com',
      verified: true,
      badge: 'premium',
      image: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&w=400&h=400&q=80'
    },
    gps: body.gps || { lat: 6.5244, lng: 3.3792 },
    views: 0,
    leads: 0,
    createdAt: new Date().toISOString(),
    approved: true, // Auto-approve for seamless user experience, but admin can remove
    reported: false
  };

  properties.unshift(newProperty);
  res.status(201).json(newProperty);
});

// DELETE property listing
app.delete('/api/properties/:id', (req, res) => {
  const id = req.params.id;
  const index = properties.findIndex(p => p.id === id);
  if (index !== -1) {
    properties.splice(index, 1);
    return res.json({ success: true, message: 'Property listing deleted successfully' });
  }
  res.status(404).json({ message: 'Property not found' });
});

// POST report property (Option A: /api/properties/:id/report)
app.post('/api/properties/:id/report', (req, res) => {
  const { reason, details, reporterName, reporterEmail } = req.body;
  const prop = properties.find(p => p.id === req.params.id);
  
  if (!prop) {
    return res.status(404).json({ message: 'Property not found' });
  }

  prop.reported = true;
  prop.reportReason = reason;

  const newReport: ReviewReport = {
    id: `rep-${Date.now()}`,
    listingId: prop.id,
    propertyTitle: prop.title,
    reporterName: reporterName || 'Anonymous User',
    reporterEmail: reporterEmail || 'email@gmail.com',
    reason: reason || 'Suspicious listing',
    details: details || 'No additional details provided.',
    status: 'pending',
    createdAt: new Date().toISOString()
  };

  reports.unshift(newReport);
  res.json({ success: true, report: newReport });
});

// POST trigger lead performance update (contact clicking)
app.post('/api/properties/:id/lead', (req, res) => {
  const prop = properties.find(p => p.id === req.params.id);
  if (prop) {
    prop.leads += 1;
    return res.json({ success: true, leads: prop.leads });
  }
  res.status(404).json({ message: 'Property not found' });
});

// 2. Chat & Messaging (Instant Updates)
app.get('/api/messages', (req, res) => {
  const { senderId, receiverId, listingId } = req.query;

  let filtered = messages;
  if (senderId && receiverId) {
    filtered = messages.filter(m => 
      (m.senderId === senderId && m.receiverId === receiverId) ||
      (m.senderId === receiverId && m.receiverId === senderId)
    );
  } else if (senderId) {
    filtered = messages.filter(m => m.senderId === senderId || m.receiverId === senderId);
  }

  res.json(filtered);
});

app.post('/api/messages', (req, res) => {
  const { listingId, senderId, senderName, senderRole, receiverId, content } = req.body;
  
  const newMsg: Message = {
    id: `msg-${Date.now()}`,
    listingId,
    senderId,
    senderName: senderName || 'User',
    senderRole: senderRole || 'user',
    receiverId,
    content,
    timestamp: new Date().toISOString()
  };

  messages.push(newMsg);

  // Synthesize agent reply synchronously so it can be returned in response for high reliability
  let replyMsg: Message | undefined;
  if (senderRole === 'user' || !senderRole) {
    const responses = [
      "Thank you for reaching out! I would be happy to show you this property. What time tomorrow works best for you?",
      "Hello! Yes, the property is still available. It has standard 24/7 power and security. When can we meet?",
      "Thanks for your inquiry. Let's chat on WhatsApp (+234 812 345 6789) for faster coordination and a video walk-through!",
      "Greetings! I have received your request. The landlord is currently accepting offers. Would you like to schedule an inspection?"
    ];
    const randomReply = responses[Math.floor(Math.random() * responses.length)];
    
    replyMsg = {
      id: `msg-${Date.now() + 1}`,
      listingId,
      senderId: receiverId || 'agent-1',
      senderName: 'RentNaija Agent',
      senderRole: 'agent',
      receiverId: senderId,
      content: randomReply,
      timestamp: new Date().toISOString()
    };
    messages.push(replyMsg);
  }

  // Return the expected payload for App.tsx
  res.status(201).json({
    sentMessage: newMsg,
    replyMessage: replyMsg
  });
});

// 3. User & Authentication
app.get('/api/users', (req, res) => {
  res.json(userProfiles);
});

app.post('/api/auth/register', (req, res) => {
  const { name, email, phone, role, companyName } = req.body;
  
  const existing = userProfiles.find(u => u.email.toLowerCase() === email.toLowerCase());
  if (existing) {
    return res.status(400).json({ message: 'User with this email already exists' });
  }

  const newUser: UserProfile = {
    id: `usr-${Date.now()}`,
    name,
    email,
    phone,
    role: role || 'buyer',
    verifiedEmail: true, // Simulation
    verifiedPhone: true, // Simulation
    verifiedAgent: role === 'agent',
    badge: role === 'agent' ? 'verified' : 'standard',
    avatar: '',
    companyName: companyName || undefined
  };

  userProfiles.push(newUser);
  res.status(201).json({ user: newUser, ...newUser });
});

app.post('/api/auth/login', (req, res) => {
  const { email } = req.body;
  const user = userProfiles.find(u => u.email.toLowerCase() === email.toLowerCase());
  
  if (!user) {
    return res.status(404).json({ message: 'User not found. Try registering first!' });
  }

  res.json({ user, ...user });
});

app.put('/api/auth/profile', (req, res) => {
  const { id, name, phone, companyName, avatar } = req.body;
  const user = userProfiles.find(u => u.id === id);
  
  if (!user) {
    return res.status(404).json({ message: 'User not found' });
  }

  user.name = name || user.name;
  user.phone = phone || user.phone;
  if (companyName) user.companyName = companyName;
  if (avatar) user.avatar = avatar;

  // Sync to properties where this agent is owner
  properties.forEach(p => {
    if (p.agent.id === id) {
      p.agent.name = user.name;
      p.agent.phone = user.phone;
      if (avatar) p.agent.image = avatar;
    }
  });

  res.json({ user, ...user });
});

// 4. Admin Management APIs
app.get('/api/admin/reports', (req, res) => {
  res.json(reports);
});

// POST report listing (Option B: /api/admin/reports as called in App.tsx)
app.post('/api/admin/reports', (req, res) => {
  const { propertyId, reporterName, reporterEmail, reason, details } = req.body;
  const prop = properties.find(p => p.id === propertyId);
  
  if (prop) {
    prop.reported = true;
    prop.reportReason = reason;
  }

  const newReport: ReviewReport = {
    id: `rep-${Date.now()}`,
    listingId: propertyId || 'unknown',
    propertyTitle: prop ? prop.title : 'Unknown Property',
    reporterName: reporterName || 'Anonymous User',
    reporterEmail: reporterEmail || 'email@gmail.com',
    reason: reason || 'Suspicious listing',
    details: details || 'No additional details provided.',
    status: 'pending',
    createdAt: new Date().toISOString()
  };

  reports.unshift(newReport);
  res.status(201).json({ success: true, report: newReport });
});

app.put('/api/admin/reports/:id', (req, res) => {
  const { status } = req.body;
  const rep = reports.find(r => r.id === req.params.id);
  if (!rep) return res.status(404).json({ message: 'Report not found' });

  rep.status = status;
  
  // If report resolved and suspicious, remove listing
  if (status === 'resolved') {
    const prop = properties.find(p => p.id === rep.listingId);
    if (prop) {
      prop.approved = false; // Hide it
    }
  }
  res.json(rep);
});

// POST resolve reports (as called in App.tsx)
app.post('/api/admin/reports/:id/resolve', (req, res) => {
  const { status } = req.body;
  const rep = reports.find(r => r.id === req.params.id);
  if (!rep) return res.status(404).json({ message: 'Report not found' });

  rep.status = status;
  
  if (status === 'resolved') {
    const prop = properties.find(p => p.id === rep.listingId);
    if (prop) {
      prop.approved = false; // Hide it
    }
  }
  res.json(rep);
});

app.get('/api/admin/users', (req, res) => {
  res.json(userProfiles);
});

app.put('/api/admin/users/:id/verify', (req, res) => {
  const { badge, verifiedAgent } = req.body;
  const user = userProfiles.find(u => u.id === req.params.id);
  if (!user) return res.status(404).json({ message: 'User not found' });

  if (badge) user.badge = badge;
  if (verifiedAgent !== undefined) user.verifiedAgent = verifiedAgent;

  // Update properties of this agent
  properties.forEach(p => {
    if (p.agent.id === user.id) {
      p.agent.verified = user.verifiedAgent;
      p.agent.badge = user.badge;
    }
  });

  res.json(user);
});

// POST verify agent (as called in App.tsx)
app.post('/api/admin/verify-agent', (req, res) => {
  const { userId, badge, verified } = req.body;
  const user = userProfiles.find(u => u.id === userId);
  if (!user) return res.status(404).json({ message: 'User not found' });

  if (badge) user.badge = badge;
  if (verified !== undefined) user.verifiedAgent = verified;

  // Update properties of this agent
  properties.forEach(p => {
    if (p.agent.id === user.id) {
      p.agent.verified = user.verifiedAgent;
      p.agent.badge = user.badge;
    }
  });

  res.json(user);
});

// 5. Smart Features - AI Chatbot Advisor (Knowledge Grounded in Nigeria Property)
app.post('/api/ai/chat', async (req, res) => {
  const { message, history, propertyId } = req.body;

  let referenceProperty: Property | undefined;
  if (propertyId) {
    referenceProperty = properties.find(p => p.id === propertyId);
  }

  const systemInstruction = `You are "NaijaProp AI", a friendly, world-class Nigerian real estate chatbot advisor built by RentNaija.
  Your goal is to guide tenants, buyers, estate agents, and landlords with professional, highly accurate advice on renting, buying, selling, and leasing properties in Nigeria.
  
  You possess comprehensive knowledge of the local property markets:
  - Lagos (Lekki, Ikoyi, Victoria Island: luxury, expensive, high service charges; Ikeja, Yaba, Surulere: medium-range, highly sought-after, popular for professionals/students; Mainland versus Island rent trends).
  - Abuja (Maitama, Asokoro: elite, high security, foreign currency pricing common; Gwarinpa, Garki, Wuse II: mixed, residential corporate).
  - Rivers/Port Harcourt (GRA, Peter Odili: high security; Aluu, Choba: student housing UNIPORT).
  - Oyo/Ibadan (Bodija, Oluyole: tranquil, large compounds, relatively affordable).
  
  Key legal and transactional concepts in Nigeria:
  - "Caution Fee": Deposit for potential damages.
  - "Agency and Agreement Fees": Typically 10% each of the annual rent.
  - "C of O": Certificate of Occupancy, the primary land title issued by state governments.
  - "Deed of Assignment": The legal document transferring land ownership.
  - "Governor's Consent": Necessary step to make land sales completely legally binding.
  
  Style: Conversational, warm, using mild Nigerian expressions like "Welcome!", "Naira (₦)", and "Ah," but remaining deeply professional, objective, and accurate. Avoid cheesy marketing pitches. Respond in clear markdown with paragraphs and bullet points.
  
  ${referenceProperty ? `The user is currently viewing this property listing:
  - Title: ${referenceProperty.title}
  - Price: ₦${referenceProperty.price.toLocaleString()} (${referenceProperty.period})
  - Location: ${referenceProperty.area}, ${referenceProperty.city}, ${referenceProperty.state} State
  - Details: ${referenceProperty.bedrooms} bedrooms, ${referenceProperty.bathrooms} bathrooms, ${referenceProperty.squareMeters} SQM
  - Amenities: ${referenceProperty.amenities.join(', ')}
  - Description: ${referenceProperty.description}
  Use this listing information to answer questions about it directly.` : ''}`;

  if (ai) {
    try {
      // Build contents array supporting chat history
      const contents = [];
      if (history && Array.isArray(history)) {
        for (const turn of history) {
          contents.push({
            role: turn.sender === 'user' ? 'user' : 'model',
            parts: [{ text: turn.text }]
          });
        }
      }
      contents.push({
        role: 'user',
        parts: [{ text: message }]
      });

      const response = await ai.models.generateContent({
        model: 'gemini-3.5-flash',
        contents,
        config: {
          systemInstruction
        }
      });

      const text = response.text || 'Ah, I apologize. I could not synthesize a response. Can you ask that again?';
      return res.json({ text });
    } catch (err: any) {
      console.error('Gemini API request failed:', err);
      // Fallback to simulated advice
    }
  }

  // Simulated fallback responses based on keywords when GEMINI_API_KEY is not defined
  const lowMessage = message.toLowerCase();
  let reply = '';

  if (lowMessage.includes('lekki') || lowMessage.includes('lagos')) {
    reply = `### Hello there! Welcome to RentNaija Advisory. 

If you're looking at **Lekki Phase 1 or surrounding areas**, here is what you need to know:
*   **Average Rent**: Modern 3-4 bedroom duplexes range between **₦10,000,000 to ₦18,000,000** annually. Mini flats are about **₦2,000,000 to ₦4,500,000** depending on services.
*   **Caution Fees & Service Charges**: Mainland estates often include utilities in service charges. In Lekki/VI, service charges can add another **₦1,500,000 to ₦3,500,000** yearly for diesel power and armed security.
*   **Legal Tip**: Always request the *Deed of Assignment* and confirm the landlord's *Governor's Consent* status if you are buying land or buildings.

Would you like to explore verified apartments in Lekki or Surulere?`;
  } else if (lowMessage.includes('calculator') || lowMessage.includes('affordability') || lowMessage.includes('rent')) {
    reply = `### How to Calculate Your Rent Affordability in Nigeria:

The **Rent Affordability Rule of Thumb** states that your annual rent should not exceed **30% to 35% of your annual gross income**.

For example:
*   If your monthly salary is **₦500,000**, your annual gross is **₦6,000,000**.
*   Your maximum comfortable yearly rent is **₦1,800,000** (₦150,000/month equivalent).
*   Don't forget to budget an extra **20%** for **Agency (10%)**, **Agreement (10%)**, and **Caution Fees**!

Our Rent Affordability Calculator on the dashboard is calibrated exactly to these rates to keep you safe from financial stress. Let me know if you want me to help calculate for a specific property!`;
  } else if (lowMessage.includes('c of o') || lowMessage.includes('land') || lowMessage.includes('deed')) {
    reply = `### Crucial Land Titles and Purchases in Nigeria:

Purchasing land in places like Ibeju-Lekki, Epe, or Abuja requires extreme caution. Here are the 3 critical documents you must verify:
1.  **Certificate of Occupancy (C of O)**: The highest form of land document in Nigeria, issued by the state governor. It grants rights for 99 years.
2.  **Governor's Consent**: Needed for any subsequent transaction on land that already has a C of O. Without Governor's Consent, the transfer is legally incomplete!
3.  **Survey Plan**: Crucial to check that the land coordinates do not fall into government-acquired or agricultural conservation zones.

Always hire a registered surveyor and a property lawyer to conduct a search at the State Land Registry before making any bank transfers!`;
  } else {
    reply = `### Hello! I am NaijaProp AI, your trusted Nigeria Real Estate Advisor. 

I can assist you with:
*   Standard rental rates in **Lekki, Gwarinpa, Bodija, and Port Harcourt**.
*   Explaining **Agency fees, Agreement fees, and Caution deposits** so agents do not overcharge you.
*   Verifying property titles like **C of O, Governor's Consent, and Gazette**.
*   Finding the best **mortgage affordability and calculations**.

${referenceProperty ? `Regarding the property **"${referenceProperty.title}"** you are viewing: it is located in **${referenceProperty.area}, ${referenceProperty.city}**, listed at **₦${referenceProperty.price.toLocaleString()} per ${referenceProperty.period === 'yearly' ? 'year' : 'total'}**. This is highly competitive for the region!` : 'Ask me anything about Nigerian properties! How can I help you today?'}`;
  }

  res.json({ text: reply, simulated: true });
});

// 6. Payments Simulators (Paystack & Flutterwave)
app.post('/api/payments/paystack', (req, res) => {
  const { propertyId, userId, amount, purpose } = req.body;
  
  // Simulate successful payment transaction
  const txRef = `paystack-tx-${Date.now()}`;
  
  if (purpose === 'featured' && propertyId) {
    const prop = properties.find(p => p.id === propertyId);
    if (prop) {
      prop.featured = true;
      prop.verified = true; // Payments boost authenticity
    }
  } else if (purpose === 'premium' && userId) {
    const user = userProfiles.find(u => u.id === userId);
    if (user) {
      user.badge = 'premium';
      user.verifiedAgent = true;
    }
  }

  res.json({
    success: true,
    reference: txRef,
    amount,
    purpose,
    gateway: 'Paystack',
    message: 'Payment received successfully via simulated Paystack Gateway.'
  });
});

app.post('/api/payments/flutterwave', (req, res) => {
  const { propertyId, userId, amount, purpose } = req.body;
  const txRef = `flw-tx-${Date.now()}`;
  
  if (purpose === 'featured' && propertyId) {
    const prop = properties.find(p => p.id === propertyId);
    if (prop) {
      prop.featured = true;
      prop.verified = true;
    }
  } else if (purpose === 'premium' && userId) {
    const user = userProfiles.find(u => u.id === userId);
    if (user) {
      user.badge = 'premium';
      user.verifiedAgent = true;
    }
  }

  res.json({
    success: true,
    reference: txRef,
    amount,
    purpose,
    gateway: 'Flutterwave',
    message: 'Payment verified successfully via simulated Flutterwave secure API.'
  });
});

// 7. Price Alerts
app.post('/api/alerts', (req, res) => {
  const { email, propertyType, state, city, maxPrice } = req.body;
  
  const newAlert: PriceAlert = {
    id: `alt-${Date.now()}`,
    email,
    propertyType: propertyType || 'apartment',
    state: state || 'Lagos',
    city: city || 'Lekki',
    maxPrice: Number(maxPrice) || 5000000
  };

  priceAlerts.push(newAlert);
  res.status(201).json({ success: true, alert: newAlert });
});

// ================== VITE MIDDLEWARE SETUP ==================

async function startServer() {
  if (process.env.NODE_ENV !== 'production') {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), 'dist');
    app.use(express.static(distPath));
    app.get('*', (req, res) => {
      res.sendFile(path.join(distPath, 'index.html'));
    });
  }

  app.listen(PORT, '0.0.0.0', () => {
    console.log(`RentNaija full-stack dev server successfully running on port ${PORT}`);
  });
}

startServer();
