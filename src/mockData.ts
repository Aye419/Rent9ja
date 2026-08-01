import { Property } from './types';

export const initialProperties: Property[] = [];

export const statesAndCities: Record<string, string[]> = {
  'Abia': ['Umuahia', 'Aba', 'Ohafia'],
  'Abuja': ['Maitama', 'Asokoro', 'Wuse II', 'Gwarinpa', 'Garki', 'Apo', 'Jabi', 'Utako', 'Lugbe', 'Kubwa', 'Kuje', 'Dawaki', 'Guzape'],
  'Adamawa': ['Yola', 'Mubi', 'Jimeta'],
  'Akwa Ibom': ['Uyo', 'Eket', 'Ikot Ekpene'],
  'Anambra': ['Awka', 'Onitsha', 'Nnewi', 'Ekwulobia'],
  'Bauchi': ['Bauchi', 'Azare', 'Misau'],
  'Bayelsa': ['Yenagoa', 'Ogbia', 'Sagbama'],
  'Benue': ['Makurdi', 'Gboko', 'Otukpo'],
  'Borno': ['Maiduguri', 'Biu', 'Bama'],
  'Cross River': ['Calabar', 'Ikom', 'Ogoja'],
  'Delta': ['Asaba', 'Warri', 'Ughelli', 'Sapele', 'Agbor'],
  'Ebonyi': ['Abakaliki', 'Afikpo', 'Onueke'],
  'Edo': ['Benin City', 'Auchi', 'Ekpoma', 'Uromi'],
  'Ekiti': ['Ado Ekiti', 'Ikole', 'Ijero Ekiti'],
  'Enugu': ['Enugu', 'Nsukka', 'Agbani'],
  'Gombe': ['Gombe', 'Kaltungo', 'Dukku'],
  'Imo': ['Owerri', 'Orlu', 'Okigwe', 'Mbaise'],
  'Jigawa': ['Dutse', 'Hadejia', 'Gumel'],
  'Kaduna': ['Kaduna', 'Zaria', 'Kafanchan'],
  'Kano': ['Kano', 'Gwale', 'Bichi', 'Dala'],
  'Katsina': ['Katsina', 'Daura', 'Funtua'],
  'Kebbi': ['Birnin Kebbi', 'Argungu', 'Yauri'],
  'Kogi': ['Lokoja', 'Okene', 'Idah', 'Kabba'],
  'Kwara': ['Ilorin', 'Offa', 'Omu-Aran'],
  'Lagos': ['Lekki', 'Victoria Island', 'Ikoyi', 'Ikeja', 'Surulere', 'Yaba', 'Ibeju Lekki', 'Gbagada', 'Epe', 'Badagry', 'Ajah', 'Maryland', 'Festac'],
  'Nasarawa': ['Lafia', 'Karu', 'Keffi', 'Akwanga'],
  'Niger': ['Minna', 'Bida', 'Suleja', 'Kontagora'],
  'Ogun': ['Abeokuta', 'Ijebu Ode', 'Ota', 'Sango Ota', 'Sagamu'],
  'Ondo': ['Akure', 'Ondo', 'Owo', 'Ikare'],
  'Osun': ['Osogbo', 'Ile-Ife', 'Ilesa', 'Ede'],
  'Oyo': ['Ibadan', 'Ogbomosho', 'Oyo', 'Iseyin'],
  'Plateau': ['Jos', 'Bukuru', 'Pankshin'],
  'Rivers': ['Port Harcourt', 'Obio-Akpor', 'Aluu', 'Eleme', 'Bonny'],
  'Sokoto': ['Sokoto', 'Tambuwal', 'Wamako'],
  'Taraba': ['Jalingo', 'Wukari', 'Bali'],
  'Yobe': ['Damaturu', 'Gashua', 'Nguru'],
  'Zamfara': ['Gusau', 'Kaura Namoda', 'Talata Mafara']
};

export const categories = [
  { id: 'apartment', name: 'Apartments', count: 0, icon: 'Home' },
  { id: 'duplex', name: 'Duplexes', count: 0, icon: 'Building' },
  { id: 'bungalow', name: 'Bungalows', count: 0, icon: 'Home' },
  { id: 'self-contain', name: 'Self-Contain', count: 0, icon: 'Inbox' }
];
