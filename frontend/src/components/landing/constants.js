export const BRAND = {
  name: "Ebenezer Tours & Travels",
  tagline: "Where the Continent Ends. Where Your Journey Begins.",
  domain: "savariking.com",
  email: "info@savariking.com",
  address: "Trivandrum–Nagercoil Highway, Tamil Nadu, India",
  mapLink: "https://maps.app.goo.gl/y7LNjKduYsYuUmQf6",
  phone: import.meta.env.VITE_WHATSAPP_NUMBER || "919952703765",
  phoneDisplay: "+91 99527 03765",
  responseTime: "Within 30 minutes, 8am–10pm IST",
};

export const WHATSAPP_DEFAULT_MESSAGE =
  "Hi, I'm interested in a South India tour. Please send me details.";

export const buildWhatsAppLink = (message = WHATSAPP_DEFAULT_MESSAGE) =>
  `https://wa.me/${BRAND.phone}?text=${encodeURIComponent(message)}`;

export const buildInquiryMessage = (form) => {
  const lines = [
    "Hi, I'm interested in a South India tour.",
    "",
    `Name: ${form.name}`,
    `Country: ${form.country}`,
    `Travel Dates: ${form.dates}`,
    `Group Size: ${form.groupSize}`,
    `Interested Tour: ${form.tour}`,
    form.message ? `Message: ${form.message}` : "",
  ].filter(Boolean);
  return lines.join("\n");
};

export const unsplash = (photoId, width = 1200) =>
  `https://images.unsplash.com/photo-${photoId}?auto=format&fit=crop&w=${width}&q=80`;

// Verified working Unsplash image IDs for South India
export const HERO_SLIDES = [
  {
    id: "kanyakumari",
    src: "https://images.unsplash.com/photo-1516815231560-8f41ec531527?auto=format&fit=crop&w=1920&q=85",
    alt: "Kanniyakumari sunrise — three seas meet",
  },
  {
    id: "kovalam",
    src: "https://images.unsplash.com/photo-1507525428034-b723cf961d3e?auto=format&fit=crop&w=1920&q=85",
    alt: "Kovalam golden beach at sunset",
  },
  {
    id: "backwaters",
    src: "https://images.unsplash.com/photo-1530587191325-3db32d826c18?auto=format&fit=crop&w=1920&q=85",
    alt: "Kerala backwaters — serene boat journey",
  },
  {
    id: "temple",
    src: "https://images.unsplash.com/photo-1565021253083-33d22a872f89?auto=format&fit=crop&w=1920&q=85",
    alt: "South India ancient temple architecture",
  },
  {
    id: "nature",
    src: "https://images.unsplash.com/photo-1469474968028-56623f02e42e?auto=format&fit=crop&w=1920&q=85",
    alt: "Lush South India natural landscape",
  },
];

export const DESTINATIONS = [
  {
    id: "kanniyakumari",
    name: "Kanniyakumari",
    hook: "Stand where the Arabian Sea, Bay of Bengal & Indian Ocean meet at the southernmost tip of India. Watch the sunrise paint three waters at once.",
    image: "https://images.unsplash.com/photo-1516815231560-8f41ec531527?auto=format&fit=crop&w=900&q=80",
    highlights: [
      "Vivekananda Rock Memorial",
      "Thiruvalluvar Statue",
      "Sunrise Point",
      "Kumari Amman Temple",
      "Sunset Point",
      "Gandhi Memorial",
    ],
    span: "lg:col-span-2 lg:row-span-2",
  },
  {
    id: "trivandrum-kovalam",
    name: "Trivandrum & Kovalam",
    hook: "Explore ancient palace culture by day, unwind on crescent beaches by evening. Kerala's capital city holds 2,000 years of history.",
    image: "https://images.unsplash.com/photo-1507525428034-b723cf961d3e?auto=format&fit=crop&w=900&q=80",
    highlights: [
      "Padmanabhaswamy Temple",
      "Napier Museum",
      "Kovalam Beach",
      "Lighthouse Beach",
      "Attukal Temple",
      "Poovar Island Backwaters",
    ],
    span: "lg:col-span-1 lg:row-span-1",
  },
  {
    id: "kochi",
    name: "Kochi (Cochin)",
    hook: "A port city shaped by Dutch, Portuguese and British rule. Fort Kochi's streets are an open-air museum of colonial spice-trade history.",
    image: "https://images.unsplash.com/photo-1530587191325-3db32d826c18?auto=format&fit=crop&w=900&q=80",
    highlights: [
      "Fort Kochi",
      "Chinese Fishing Nets",
      "Mattancherry Palace",
      "Jewish Synagogue",
      "Spice Markets",
      "Marine Drive",
    ],
    span: "lg:col-span-1 lg:row-span-1",
  },
  {
    id: "madurai",
    name: "Madurai",
    hook: "The Temple City never sleeps. Meenakshi Amman Temple's 14 towering gopurams glow at night — a living 2,500-year-old city of faith, colour and jasmine.",
    image: "https://images.unsplash.com/photo-1582510003544-4d00b7f74220?auto=format&fit=crop&w=900&q=80",
    highlights: [
      "Meenakshi Amman Temple",
      "Thirumalai Nayakkar Palace",
      "Gandhi Memorial Museum",
      "Alagar Koil",
      "Vandiyur Mariamman Teppakulam",
      "Madurai Night Market",
    ],
    span: "lg:col-span-1 lg:row-span-1",
  },
  {
    id: "ooty",
    name: "Ooty (Udhagamandalam)",
    hook: "The Queen of Hill Stations sits at 2,240 metres. Nilgiri Mountain Railway, colonial bungalows, rose gardens and misty tea estates — a world apart from the plains.",
    image: "https://images.unsplash.com/photo-1590050752117-238cb0fb12b1?auto=format&fit=crop&w=900&q=80",
    highlights: [
      "Nilgiri Mountain Railway (UNESCO)",
      "Ooty Botanical Gardens",
      "Doddabetta Peak",
      "Ooty Lake Boating",
      "Rose Garden",
      "Tea Factory Tour",
    ],
    span: "lg:col-span-1 lg:row-span-1",
  },
  {
    id: "kodaikanal",
    name: "Kodaikanal",
    hook: "The Princess of Hill Stations. Star-shaped Kodai Lake, Pillar Rocks disappearing into cloud, Silver Cascade waterfalls — nature at its most dramatic.",
    image: "https://images.unsplash.com/photo-1605649487212-47bdab064df7?auto=format&fit=crop&w=900&q=80",
    highlights: [
      "Kodai Lake",
      "Pillar Rocks",
      "Coakers Walk",
      "Silver Cascade Falls",
      "Bear Shola Falls",
      "Green Valley View",
    ],
    span: "lg:col-span-1 lg:row-span-1",
  },
];

export const PACKAGES = [
  {
    id: "southern-crown",
    name: "The Southern Crown",
    badge: "Flagship",
    duration: "6 Days / 5 Nights",
    destinations: ["Trivandrum", "Kovalam", "Kanniyakumari"],
    tagline: "The complete southern tip experience",
    pricingTiers: [
      { tier: "Standard", price: 28000, note: "Budget hotels, AC rooms" },
      { tier: "Comfort", price: 42000, note: "3-star hotels" },
      { tier: "Premium", price: 68000, note: "The Leela / Taj class" },
    ],
    hasTiers: true,
    itinerary: [
      "Day 1: Arrive Trivandrum Airport → Innova pickup → Hotel check-in → Padmanabhaswamy Temple evening darshan → Welcome dinner",
      "Day 2: Trivandrum city tour — Napier Museum, Zoo, Kuthiramalika Palace, Attukal Temple → Evening Kovalam Beach",
      "Day 3: Full day Kovalam — Lighthouse Beach, Hawah Beach, Ayurvedic spa option, seafood lunch (complimentary)",
      "Day 4: Drive to Kanniyakumari (2.5 hrs) — Sunset Point, Kumari Amman Temple, Vivekananda Rock boat ride, Thiruvalluvar Statue",
      "Day 5: Sunrise at Confluence Point (MUST-SEE) → Gandhi Memorial → Wax Museum → drive back → Poovar Island backwaters boat ride",
      "Day 6: Checkout → Airport drop → Departure",
    ],
    includes: [
      "All transport in Innova",
      "Airport transfers",
      "1 meal/day",
      "Hotel check-in help",
      "English guide assistance",
    ],
    excludes: ["Flights", "Personal expenses", "Optional activities"],
  },
  {
    id: "coastal-trail",
    name: "Kerala Coastal Trail",
    badge: "Best Seller",
    duration: "4 Days / 3 Nights",
    destinations: ["Trivandrum", "Kovalam", "Backwaters"],
    tagline: "Beaches, backwaters and temple culture",
    priceFrom: 22000,
    highlights: [
      "Padmanabhaswamy Temple",
      "Kovalam Lighthouse Beach",
      "Poovar Island",
      "Backwater houseboat experience",
      "Local market walk",
    ],
    includes: [
      "Private Innova transport",
      "Airport transfers",
      "1 meal/day",
      "English-speaking guide",
    ],
    excludes: ["Flights", "Personal expenses", "Optional spa activities"],
  },
  {
    id: "spice-trail",
    name: "South to Spice Trail",
    badge: "Most Complete",
    duration: "8 Days / 7 Nights",
    destinations: ["Trivandrum", "Kovalam", "Kanniyakumari", "Kochi"],
    tagline: "From the southernmost tip to the spice capital",
    priceFrom: 55000,
    highlights: [
      "All Southern Crown experiences",
      "Alleppey backwaters en route to Kochi",
      "Fort Kochi colonial heritage walk",
      "Chinese fishing nets at sunset",
      "Kochi Airport drop on final day",
    ],
    includes: [
      "All transport in Innova",
      "Airport transfers",
      "1 meal/day",
      "Hotel check-in help",
      "English guide assistance",
    ],
    excludes: ["Flights", "Personal expenses", "Optional activities"],
  },

  // ── Day Trips ──────────────────────────────────────────────────────────────
  {
    id: "kk-day-trip",
    name: "Kanyakumari Sunrise Day Trip",
    badge: "Day Trip",
    duration: "1 Day",
    destinations: ["Kanniyakumari"],
    tagline: "India's most iconic sunrise — start to finish in one day",
    pricingTiers: [
      { tier: "Standard", price: 3500, note: "Private Innova, pickup & drop" },
      { tier: "Comfort", price: 4500, note: "Includes guide & complimentary lunch" },
    ],
    hasTiers: true,
    itinerary: [
      "4:30 AM: Pickup from Marthandam / Trivandrum / Nagercoil",
      "5:30 AM: Arrive Kanyakumari — Sunrise at the Confluence Point (three seas)",
      "Morning: Vivekananda Rock Memorial & Thiruvalluvar Statue boat ride",
      "Midday: Kumari Amman Temple darshan · Gandhi Memorial",
      "Afternoon: Wax Museum · Sunset Point",
      "Evening: Return drop to starting point",
    ],
    includes: ["Private Innova transport", "Pickup & drop", "Entrance fee guidance"],
    excludes: ["Boat tickets (₹50–100)", "Meals (Comfort tier includes lunch)", "Personal expenses"],
  },
  {
    id: "trivandrum-day",
    name: "Trivandrum Heritage Day",
    badge: "Day Trip",
    duration: "1 Day",
    destinations: ["Trivandrum"],
    tagline: "Kerala's ancient capital in a single immersive day",
    pricingTiers: [
      { tier: "Standard", price: 4000, note: "Private Innova, all sights" },
      { tier: "Comfort", price: 5500, note: "Includes guide & complimentary meal" },
    ],
    hasTiers: true,
    itinerary: [
      "Morning: Padmanabhaswamy Temple darshan (one of India's wealthiest temples)",
      "Mid-morning: Napier Museum & Natural History Museum",
      "Noon: Kuthiramalika Palace Museum",
      "Afternoon: Attukal Bhagavathy Temple · Chalai Bazaar",
      "Evening: Kovalam Beach sunset",
      "Return drop",
    ],
    includes: ["Private Innova transport", "Pickup & drop"],
    excludes: ["Entry fees", "Meals (Comfort tier includes one meal)", "Personal expenses"],
  },
  {
    id: "kk-trivandrum-2d",
    name: "Kanyakumari + Trivandrum",
    badge: "Weekend",
    duration: "2 Days / 1 Night",
    destinations: ["Kanniyakumari", "Trivandrum", "Kovalam"],
    tagline: "The perfect 2-day escape from anywhere in South India",
    pricingTiers: [
      { tier: "Standard", price: 10000, note: "Budget hotel, AC rooms" },
      { tier: "Comfort", price: 16000, note: "3-star hotel" },
      { tier: "Premium", price: 28000, note: "5-star / beach resort" },
    ],
    hasTiers: true,
    itinerary: [
      "Day 1 AM: Trivandrum city tour — Padmanabhaswamy Temple, Napier Museum, Kuthiramalika",
      "Day 1 PM: Drive to Kovalam — Lighthouse Beach, seafood dinner",
      "Day 2 Early: Drive to Kanyakumari — Sunrise at three-seas confluence",
      "Day 2 AM: Vivekananda Rock, Thiruvalluvar Statue, Kumari Amman Temple",
      "Day 2 PM: Gandhi Memorial, Wax Museum, return drop",
    ],
    includes: ["All transport in Innova", "1 night hotel", "Airport/station transfers", "1 meal/day"],
    excludes: ["Flights/train to starting point", "Personal expenses", "Optional activities"],
  },

  // ── Tamil Nadu Hills ───────────────────────────────────────────────────────
  {
    id: "madurai-pilgrimage",
    name: "Madurai Temple Pilgrimage",
    badge: "Sacred",
    duration: "2 Days / 1 Night",
    destinations: ["Madurai"],
    tagline: "The living temple city — 2,500 years of faith and colour",
    priceFrom: 9000,
    highlights: [
      "Meenakshi Amman Temple — Evening Alankaram ceremony",
      "Thirumalai Nayakkar Palace light & sound show",
      "Gandhi Memorial Museum",
      "Alagar Koil temple excursion",
      "Madurai Jasmine market at dawn",
      "Authentic Chettinad meal",
    ],
    includes: ["Private Innova transport", "1 night hotel", "1 meal/day", "English guide assistance"],
    excludes: ["Flights", "Personal expenses", "Camera fees at temples"],
  },
  {
    id: "ooty-escape",
    name: "Ooty Hill Escape",
    badge: "Hill Station",
    duration: "4 Days / 3 Nights",
    destinations: ["Ooty", "Coonoor"],
    tagline: "Nilgiris mist, colonial charm and a UNESCO mountain railway",
    priceFrom: 24000,
    highlights: [
      "Nilgiri Mountain Railway (UNESCO World Heritage)",
      "Ooty Botanical Gardens & Rose Garden",
      "Doddabetta Peak — highest in Nilgiris",
      "Coonoor tea estate walk",
      "Ooty Lake boat ride",
      "Chocolate & tea factory visits",
    ],
    includes: ["Private Innova transport", "3 nights hotel", "1 meal/day", "English guide"],
    excludes: ["Train tickets (booked by us)", "Flights", "Personal expenses"],
  },
  {
    id: "kodaikanal-getaway",
    name: "Kodaikanal Getaway",
    badge: "Hill Station",
    duration: "3 Days / 2 Nights",
    destinations: ["Kodaikanal"],
    tagline: "The Princess of Hill Stations — lakes, pillars and waterfalls",
    priceFrom: 18000,
    highlights: [
      "Star-shaped Kodai Lake — cycling & boating",
      "Pillar Rocks & Green Valley View",
      "Coakers Walk at sunrise",
      "Silver Cascade & Bear Shola Falls",
      "Bryant Park",
      "Homemade chocolate tasting",
    ],
    includes: ["Private Innova transport", "2 nights hotel", "1 meal/day", "English guide"],
    excludes: ["Flights", "Personal expenses", "Optional activities"],
  },
  {
    id: "tamil-heritage-trail",
    name: "Tamil Nadu Heritage Trail",
    badge: "Signature",
    duration: "7 Days / 6 Nights",
    destinations: ["Kanniyakumari", "Madurai", "Ooty", "Kodaikanal"],
    tagline: "Temples, hill stations and three-sea sunrises — the full Tamil Nadu story",
    priceFrom: 48000,
    highlights: [
      "Kanyakumari sunrise & confluence of three seas",
      "Meenakshi Amman Temple evening ceremony",
      "Nilgiri Mountain Railway (UNESCO)",
      "Doddabetta Peak & Ooty tea estates",
      "Kodai Lake & Pillar Rocks",
      "Authentic Chettinad cuisine throughout",
    ],
    includes: [
      "All transport in Innova",
      "6 nights hotels",
      "Airport/station transfers",
      "1 meal/day",
      "English guide assistance",
    ],
    excludes: ["Flights", "Personal expenses", "Optional train tickets"],
  },
  {
    id: "grand-south-india",
    name: "Grand South India Tour",
    badge: "Ultimate",
    duration: "12 Days / 11 Nights",
    destinations: ["Trivandrum", "Kovalam", "Kanniyakumari", "Madurai", "Ooty", "Kodaikanal", "Kochi"],
    tagline: "Two states, six destinations, one unforgettable journey",
    priceFrom: 88000,
    highlights: [
      "All Southern Crown & Tamil Nadu Heritage Trail experiences",
      "Kovalam beach & Poovar backwaters",
      "Complete Kerala + Tamil Nadu coverage",
      "Alleppey houseboat experience",
      "Fort Kochi heritage walk",
      "Kochi Airport drop on final day",
    ],
    includes: [
      "All transport in Innova throughout",
      "11 nights hotels",
      "Airport/station transfers",
      "1 meal/day",
      "Hotel check-in help",
      "English guide assistance",
    ],
    excludes: ["Flights", "Personal expenses", "Optional activities"],
  },
];

export const WHY_CHOOSE_US = [
  {
    icon: "car",
    title: "Private Innova Crysta",
    description:
      "Your car, your schedule. Never share a cab with strangers. Toyota Innova with AC, luggage space, and a reliable driver.",
  },
  {
    icon: "plane",
    title: "Airport Zero-Wait Promise",
    description:
      "We track your flight. If it's delayed, we wait. No extra charge. Your first impression of India will be smooth.",
  },
  {
    icon: "utensils",
    title: "Complimentary Daily Meal",
    description:
      "One authentic meal per day included — Kerala sadya, seafood thali, or Tamil meals. Real local food, not tourist-trap restaurants.",
  },
  {
    icon: "shield",
    title: "Transparent Fixed Pricing",
    description:
      "Quote you get is the price you pay. No surprise fees at checkout. No 'season surcharge' reveals at the hotel.",
  },
  {
    icon: "languages",
    title: "English Communication Guarantee",
    description:
      "All trip coordination in clear English via WhatsApp. Instant responses within 30 minutes, 8am–10pm IST.",
  },
  {
    icon: "sliders",
    title: "Customise Anything",
    description:
      "Religious tour? Adventure trip? Family with elderly parents? We adapt every itinerary to your actual needs.",
  },
];

export const HOW_IT_WORKS = [
  {
    step: 1,
    title: "Contact Us on WhatsApp",
    description:
      "Share your travel dates, group size and interests. We reply within 30 minutes with a custom quote.",
  },
  {
    step: 2,
    title: "Confirm & Pay Deposit",
    description:
      "Pay 30% deposit to confirm. Balance on arrival. Secure payment via Razorpay or bank transfer.",
  },
  {
    step: 3,
    title: "Arrive & Explore",
    description:
      "We meet you at the airport with a name board. Your private Innova is ready. Your South India adventure begins.",
  },
];

export const TESTIMONIALS = [
  {
    quote:
      "We did the 6-day Southern Crown package and it was flawless. The driver was always on time, the hotel picks were excellent, and Kanniyakumari sunrise was worth the whole trip.",
    author: "James & Rachel",
    location: "London, UK",
    flag: "🇬🇧",
    rating: 5,
  },
  {
    quote:
      "Booked 3 days before arrival — they organized everything within hours. The complimentary meal was a highlight. Best decision of our India trip.",
    author: "Ahmed Al-Rashid",
    location: "Dubai, UAE",
    flag: "🇦🇪",
    rating: 5,
  },
  {
    quote:
      "As a solo female traveller I was nervous. The team was professional, always reachable on WhatsApp, and I never felt unsafe. Would book again immediately.",
    author: "Sophie Müller",
    location: "Germany",
    flag: "🇩🇪",
    rating: 5,
  },
  {
    quote:
      "Kanyakumari trip with family was perfect. Mr. Sundar knew every temple and every viewpoint. Even our elderly parents loved the comfortable Innova ride.",
    author: "Ramesh & Family",
    location: "Chennai, Tamil Nadu",
    flag: "🇮🇳",
    rating: 5,
  },
  {
    quote:
      "Weekend trip from Trivandrum to Kovalam and Poovar. Everything was arranged within hours. The backwater boat ride was magical. Highly recommend!",
    author: "Priya Nair",
    location: "Trivandrum, Kerala",
    flag: "🇮🇳",
    rating: 5,
  },
  {
    quote:
      "Took the Kanyakumari one-day sightseeing. Very punctual driver, clean vehicle, and the complimentary lunch was a genuine South Indian meal — not a tourist trap.",
    author: "Arjun Krishnamurthy",
    location: "Bengaluru, Karnataka",
    flag: "🇮🇳",
    rating: 5,
  },
];

export const GALLERY_IMAGES = [
  { src: "https://images.unsplash.com/photo-1516815231560-8f41ec531527?auto=format&fit=crop&w=600&q=80", alt: "Kanyakumari sunrise — three seas meeting", tall: true },
  { src: "https://images.unsplash.com/photo-1507525428034-b723cf961d3e?auto=format&fit=crop&w=600&q=80", alt: "Kovalam beach Kerala" },
  { src: "https://images.unsplash.com/photo-1530587191325-3db32d826c18?auto=format&fit=crop&w=600&q=80", alt: "Kerala backwaters boat journey" },
  { src: "https://images.unsplash.com/photo-1565021253083-33d22a872f89?auto=format&fit=crop&w=600&q=80", alt: "South India temple architecture", wide: true },
  { src: "https://images.unsplash.com/photo-1590050752117-238cb0fb12b1?auto=format&fit=crop&w=600&q=80", alt: "Ooty Nilgiri hills misty landscape", tall: true },
  { src: "https://images.unsplash.com/photo-1582510003544-4d00b7f74220?auto=format&fit=crop&w=600&q=80", alt: "Madurai Meenakshi temple gopuram" },
  { src: "https://images.unsplash.com/photo-1469474968028-56623f02e42e?auto=format&fit=crop&w=600&q=80", alt: "Lush South India nature" },
  { src: "https://images.unsplash.com/photo-1506197603052-3cc9c3a201bd?auto=format&fit=crop&w=600&q=80", alt: "Tropical beach sunset", tall: true },
  { src: "https://images.unsplash.com/photo-1605649487212-47bdab064df7?auto=format&fit=crop&w=600&q=80", alt: "Kodaikanal lake misty morning", wide: true },
  { src: "https://images.unsplash.com/photo-1606298855672-3efb63017be8?auto=format&fit=crop&w=600&q=80", alt: "Kerala fishing harbour" },
  { src: "https://images.unsplash.com/photo-1488646953014-85cb44e25828?auto=format&fit=crop&w=600&q=80", alt: "South India road trip family", wide: true },
  { src: "https://images.unsplash.com/photo-1601050690597-df0568f70950?auto=format&fit=crop&w=600&q=80", alt: "Kerala sadya banana leaf feast" },
  { src: "https://images.unsplash.com/photo-1476514525535-07fb3b4ae5f1?auto=format&fit=crop&w=600&q=80", alt: "Scenic coastal road South India" },
];

export const NAV_LINKS = [
  { label: "Destinations", href: "#destinations" },
  { label: "Packages", href: "#packages" },
  { label: "Why Us", href: "#why-us" },
  { label: "Gallery", href: "#gallery" },
  { label: "Contact", href: "#contact" },
];

export const TOUR_OPTIONS = [
  "The Southern Crown (6 Days)",
  "Kerala Coastal Trail (4 Days)",
  "South to Spice Trail (8 Days)",
  "Kanyakumari Sunrise Day Trip (1 Day)",
  "Trivandrum Heritage Day (1 Day)",
  "Kanyakumari + Trivandrum (2 Days)",
  "Madurai Temple Pilgrimage (2 Days)",
  "Ooty Hill Escape (4 Days)",
  "Kodaikanal Getaway (3 Days)",
  "Tamil Nadu Heritage Trail (7 Days)",
  "Grand South India Tour (12 Days)",
  "Airport Transfer (Trivandrum)",
  "Custom Itinerary",
];

// Currency detection by browser locale / timezone
export const detectCurrency = () => {
  try {
    const tz = Intl.DateTimeFormat().resolvedOptions().timeZone || "";
    const locale = navigator.language || "";
    if (tz.startsWith("Asia/Kolkata") || tz.startsWith("Asia/Calcutta")) return "INR";
    if (tz.startsWith("Asia/Dubai") || tz.startsWith("Asia/Muscat") || locale.startsWith("ar")) return "AED";
    if (tz.startsWith("Europe/London") || locale.startsWith("en-GB")) return "GBP";
    if (tz.startsWith("Europe/") || locale.startsWith("de") || locale.startsWith("fr") || locale.startsWith("it")) return "EUR";
    if (tz.startsWith("America/") || locale.startsWith("en-US")) return "USD";
  } catch (_) {}
  return "INR";
};

export const CURRENCY_RATES = {
  INR: { symbol: "₹", rate: 1, label: "INR" },
  USD: { symbol: "$", rate: 0.012, label: "USD" },
  GBP: { symbol: "£", rate: 0.0095, label: "GBP" },
  EUR: { symbol: "€", rate: 0.011, label: "EUR" },
  AED: { symbol: "AED", rate: 0.044, label: "AED" },
};

export const formatPrice = (amountINR, currency = "INR") => {
  const c = CURRENCY_RATES[currency] || CURRENCY_RATES.INR;
  const converted = Math.round(amountINR * c.rate);
  if (currency === "INR") {
    return `₹${converted.toLocaleString("en-IN")}`;
  }
  return `${c.symbol}${converted.toLocaleString("en-US")}`;
};
