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

// Verified Unsplash photo IDs for South India (each confirmed to resolve to a
// scenic Kerala / Tamil Nadu scene — sunrise, beaches, backwaters, Kochi).
export const HERO_SLIDES = [
  {
    id: "kanyakumari-sunrise",
    src: "https://images.unsplash.com/photo-1609067641058-77305f0158f7?auto=format&fit=crop&w=1920&q=85",
    alt: "Sunrise over the sea at Kanniyakumari — India's southern tip",
  },
  {
    id: "bekal-sunset",
    src: "https://images.unsplash.com/photo-1735552611817-6e6c988a923e?auto=format&fit=crop&w=1920&q=85",
    alt: "Kerala beach sunset at Bekal, Kasaragod",
  },
  {
    id: "poovar-sunset",
    src: "https://images.unsplash.com/photo-1668078415471-bc8d98b843d5?auto=format&fit=crop&w=1920&q=85",
    alt: "Golden sunset over Poovar beach, Kerala",
  },
  {
    id: "fort-kochi-sunset",
    src: "https://images.unsplash.com/photo-1571980844080-5568fbce49f7?auto=format&fit=crop&w=1920&q=85",
    alt: "Fort Kochi waterfront at sunset, Kerala",
  },
  {
    id: "kanyakumari-ocean",
    src: "https://images.unsplash.com/photo-1640874098092-f685a53bdac1?auto=format&fit=crop&w=1920&q=85",
    alt: "Sun setting over the ocean at Kanniyakumari",
  },
];

export const DESTINATIONS = [
  {
    id: "kanniyakumari",
    name: "Kanniyakumari",
    region: "Tamil Nadu · Southern Tip",
    priceFrom: 3500,
    hook: "Stand where the Arabian Sea, Bay of Bengal & Indian Ocean meet at the southernmost tip of India. Watch the sunrise paint three waters at once.",
    image: "https://images.unsplash.com/photo-1609067641058-77305f0158f7?auto=format&fit=crop&w=900&q=80",
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
    region: "Kerala · Capital Coast",
    priceFrom: 4000,
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
    region: "Kerala · Spice Port",
    priceFrom: 12000,
    hook: "A port city shaped by Dutch, Portuguese and British rule. Fort Kochi's streets are an open-air museum of colonial spice-trade history.",
    image: "https://images.unsplash.com/photo-1571980844080-5568fbce49f7?auto=format&fit=crop&w=900&q=80",
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
    region: "Tamil Nadu · Temple City",
    priceFrom: 9000,
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
    region: "Tamil Nadu · Nilgiri Hills",
    priceFrom: 24000,
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
    region: "Tamil Nadu · Palani Hills",
    priceFrom: 18000,
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
  {
    id: "munnar",
    name: "Munnar",
    region: "Kerala · Western Ghats",
    priceFrom: 24000,
    hook: "Rolling tea-carpeted hills shrouded in morning mist. Munnar is the Western Ghats at their most cinematic — spice plantations, lakes and rare wildlife.",
    image: "https://images.unsplash.com/photo-1764012393710-be2d33971ac0?auto=format&fit=crop&w=900&q=80",
    highlights: [
      "Eravikulam National Park",
      "Tea Museum & Estates",
      "Mattupetty Dam & Echo Point",
      "Top Station Viewpoint",
      "Spice Plantation Walk",
      "Attukal Waterfalls",
    ],
    span: "lg:col-span-1 lg:row-span-1",
  },
  {
    id: "alleppey",
    name: "Alleppey (Alappuzha)",
    region: "Kerala · Backwaters",
    priceFrom: 14000,
    hook: "The Venice of the East. Glide through palm-fringed canals on a private houseboat, watch the sun melt into the backwaters — Kerala's signature experience.",
    image: "https://images.unsplash.com/photo-1766051224978-a57732014f9a?auto=format&fit=crop&w=900&q=80",
    highlights: [
      "Overnight Houseboat",
      "Backwater Canal Cruise",
      "Marari Beach",
      "Snake Boat Race View",
      "Coir Village Walk",
      "Sunset on Vembanad Lake",
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
    pricingTiers: [
      { tier: "Standard", price: 22000, note: "Budget AC hotels, 1 meal/day" },
      { tier: "Comfort", price: 33000, note: "3-star hotels, better meals" },
      { tier: "Premium", price: 52000, note: "Beach resort, premium houseboat" },
    ],
    hasTiers: true,
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
    pricingTiers: [
      { tier: "Standard", price: 52000, note: "Budget AC hotels throughout" },
      { tier: "Comfort", price: 78000, note: "3-star + premium houseboat night" },
      { tier: "Premium", price: 125000, note: "5-star heritage stays" },
    ],
    hasTiers: true,
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
    pricingTiers: [
      { tier: "Standard", price: 9000, note: "Budget AC hotel, 1 meal" },
      { tier: "Comfort", price: 14000, note: "3-star hotel + guide + Chettinad meal" },
      { tier: "Premium", price: 22000, note: "Heritage hotel, special darshan" },
    ],
    hasTiers: true,
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
    pricingTiers: [
      { tier: "Standard", price: 24000, note: "Budget AC hotel, 1 meal/day" },
      { tier: "Comfort", price: 36000, note: "3-star hill hotel + toy train tickets" },
      { tier: "Premium", price: 58000, note: "Heritage colonial bungalow stay" },
    ],
    hasTiers: true,
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
    pricingTiers: [
      { tier: "Standard", price: 18000, note: "Budget AC hotel, 1 meal/day" },
      { tier: "Comfort", price: 27000, note: "3-star hill hotel + lake-view room" },
      { tier: "Premium", price: 42000, note: "Cliff-side resort, fireplace suites" },
    ],
    hasTiers: true,
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
    pricingTiers: [
      { tier: "Standard", price: 48000, note: "Budget AC hotels throughout" },
      { tier: "Comfort", price: 72000, note: "3-star + toy train + Chettinad meals" },
      { tier: "Premium", price: 115000, note: "Heritage & hill-station luxury" },
    ],
    hasTiers: true,
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
    pricingTiers: [
      { tier: "Standard", price: 88000, note: "Budget AC hotels throughout" },
      { tier: "Comfort", price: 135000, note: "3-star + premium houseboat night" },
      { tier: "Premium", price: 210000, note: "5-star & heritage stays end-to-end" },
    ],
    hasTiers: true,
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

  // ── Sacred / Religious ─────────────────────────────────────────────────────
  {
    id: "sacred-south-pilgrimage",
    name: "Sacred South Pilgrimage Circuit",
    badge: "Sacred",
    duration: "5 Days / 4 Nights",
    destinations: ["Madurai", "Kanniyakumari", "Suchindram", "Trivandrum"],
    tagline: "Temples, a three-sea sunrise and 2,500 years of faith across two states",
    pricingTiers: [
      { tier: "Standard", price: 30000, note: "Budget AC hotels, 1 meal/day" },
      { tier: "Comfort", price: 45000, note: "3-star hotels + guide + special darshan help" },
      { tier: "Premium", price: 68000, note: "Heritage temple-side hotels, VIP darshan" },
    ],
    hasTiers: true,
    itinerary: [
      "Day 1: Arrive Madurai → Meenakshi Amman Temple evening Alankaram ceremony → jasmine market",
      "Day 2: Thirumalai Nayakkar Palace → Alagar Koil → drive to Kanniyakumari → sunset point",
      "Day 3: Sunrise at the three-seas confluence → Kumari Amman Temple → Vivekananda Rock → Suchindram Thanumalayan Temple",
      "Day 4: Nagaraja Temple (Nagercoil) → drive to Trivandrum → Attukal Bhagavathy Temple",
      "Day 5: Padmanabhaswamy Temple morning darshan → departure drop",
    ],
    includes: [
      "All transport in Innova",
      "Temple darshan timing guidance",
      "1 meal/day (vegetarian available)",
      "English guide assistance",
      "Airport/station transfers",
    ],
    excludes: ["Flights", "Special-pooja donations", "Personal expenses", "Camera fees at temples"],
  },

  // ── Advance / Signature (differentiated — no local competitor bundles these) ──
  {
    id: "southern-tip-private-charter",
    name: "Southern Tip Private Charter",
    badge: "Signature",
    duration: "3 Days / 2 Nights",
    destinations: ["Trivandrum", "Poovar", "Kanniyakumari"],
    tagline: "Charter-grade concierge: 4 AM private sunrise boat, on-trip photographer & beach dinner",
    pricingTiers: [
      { tier: "Standard", price: 45000, note: "AC hotel + photographer + private sunrise boat" },
      { tier: "Comfort", price: 75000, note: "3-star beach resort + candlelight dinner" },
      { tier: "Premium", price: 125000, note: "5-star resort, butler-driver, edited photo album" },
    ],
    hasTiers: true,
    itinerary: [
      "Day 1: Airport pickup → Poovar island backwater cruise → check-in → welcome dinner",
      "Day 2: 4:00 AM private boat to the exact three-seas confluence for sunrise (photographer on board) → late breakfast → Kovalam lighthouse beach → candlelight seafood dinner",
      "Day 3: Leisurely morning → Padmanabhaswamy Temple → curated gift hamper → airport drop",
    ],
    includes: [
      "Private Innova + butler-grade driver",
      "On-trip photographer (200+ edited photos)",
      "Private 4 AM sunrise boat to confluence point",
      "Candlelight beach dinner for two",
      "Dedicated trip concierge on WhatsApp",
      "Curated welcome gift hamper",
      "1 meal/day + welcome dinner",
    ],
    excludes: ["Flights", "Personal expenses", "Optional spa/ayurveda"],
  },

  // ── Munnar Highlands ───────────────────────────────────────────────────────
  {
    id: "munnar-highlands",
    name: "Munnar Tea Highlands",
    badge: "Hill Station",
    duration: "4 Days / 3 Nights",
    destinations: ["Munnar", "Thekkady"],
    tagline: "Mist-clad tea estates, spice plantations & Western Ghats wilderness",
    pricingTiers: [
      { tier: "Standard", price: 24000, note: "Budget AC hotel, 1 meal/day" },
      { tier: "Comfort", price: 38000, note: "3-star tea-garden resort" },
      { tier: "Premium", price: 58000, note: "Premium mountain-view resort" },
    ],
    hasTiers: true,
    itinerary: [
      "Day 1: Trivandrum/Kochi pickup → drive to Munnar → Cheeyappara & Valara waterfalls → check-in",
      "Day 2: Eravikulam National Park (Rajamalai) → Tea Museum → Mattupetty Dam & Echo Point",
      "Day 3: Top Station viewpoint → Kundala Lake → drive to Thekkady → spice plantation walk",
      "Day 4: Periyar Wildlife Sanctuary boat safari → departure drop",
    ],
    includes: [
      "Private Innova transport",
      "3 nights hotel",
      "1 meal/day",
      "English guide",
      "All entry permits",
    ],
    excludes: ["Flights", "Personal expenses", "Optional elephant safari / kathakali show"],
  },

  // ── Alleppey Backwater Weekend ─────────────────────────────────────────────
  {
    id: "alleppey-backwater-weekend",
    name: "Alleppey Backwater Weekend",
    badge: "Weekend",
    duration: "2 Days / 1 Night",
    destinations: ["Alleppey", "Marari"],
    tagline: "Overnight houseboat through Kerala's famous backwaters + beach stay",
    pricingTiers: [
      { tier: "Standard", price: 14000, note: "Standard houseboat, 1 night" },
      { tier: "Comfort", price: 22000, note: "Premium houseboat + AC bedroom" },
      { tier: "Premium", price: 38000, note: "Luxury houseboat + Marari beach resort" },
    ],
    hasTiers: true,
    itinerary: [
      "Day 1: Alleppey pickup → board private houseboat → backwater cruise → sunset on the lake → onboard dinner",
      "Day 2: Morning cruise → disembark → Marari beach lunch → departure drop",
    ],
    includes: [
      "Private houseboat overnight",
      "All meals on board (lunch, dinner, breakfast)",
      "Private Innova transfers",
      "Marari beach visit",
    ],
    excludes: ["Flights/train to Alleppey", "Personal expenses", "Optional canoe ride"],
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
  { src: "https://images.unsplash.com/photo-1609067641058-77305f0158f7?auto=format&fit=crop&w=600&q=80", alt: "Kanyakumari sunrise — three seas meeting", tall: true },
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
  { label: "About Us", href: "/about-us" },
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
  AUD: { symbol: "A$", rate: 0.018, label: "AUD" },
  CAD: { symbol: "C$", rate: 0.016, label: "CAD" },
  CHF: { symbol: "CHF", rate: 0.010, label: "CHF" },
  JPY: { symbol: "¥", rate: 1.8, label: "JPY" },
  CNY: { symbol: "¥", rate: 0.086, label: "CNY" },
  MYR: { symbol: "RM", rate: 0.056, label: "MYR" },
  SGD: { symbol: "S$", rate: 0.016, label: "SGD" },
  SAR: { symbol: "SAR", rate: 0.045, label: "SAR" },
  OMR: { symbol: "OMR", rate: 0.0046, label: "OMR" },
  KWD: { symbol: "KD", rate: 0.0037, label: "KWD" },
  QAR: { symbol: "QAR", rate: 0.044, label: "QAR" },
  BHD: { symbol: "BHD", rate: 0.0045, label: "BHD" },
  NZD: { symbol: "NZ$", rate: 0.020, label: "NZD" },
  ZAR: { symbol: "R", rate: 0.22, label: "ZAR" },
  RUB: { symbol: "₽", rate: 1.1, label: "RUB" },
  SEK: { symbol: "kr", rate: 0.13, label: "SEK" },
  THB: { symbol: "฿", rate: 0.40, label: "THB" },
  IDR: { symbol: "Rp", rate: 195, label: "IDR" },
  PHP: { symbol: "₱", rate: 0.70, label: "PHP" },
  LKR: { symbol: "Rs", rate: 3.6, label: "LKR" },
  BDT: { symbol: "৳", rate: 1.45, label: "BDT" },
  NPR: { symbol: "Rs", rate: 1.6, label: "NPR" },
  PKR: { symbol: "Rs", rate: 3.4, label: "PKR" },
};

// Map ISO-3166 country codes (from IP geolocation) to a supported currency.
export const COUNTRY_CURRENCY = {
  IN: "INR", US: "USD", GB: "GBP", DE: "EUR", FR: "EUR", IT: "EUR",
  ES: "EUR", NL: "EUR", BE: "EUR", AT: "EUR", IE: "EUR", PT: "EUR",
  FI: "EUR", GR: "EUR", LU: "EUR", SK: "EUR", SI: "EUR", EE: "EUR",
  LV: "EUR", LT: "EUR", CY: "EUR", MT: "EUR",
  AE: "AED", SA: "SAR", OM: "OMR", KW: "KWD", QA: "QAR", BH: "BHD",
  AU: "AUD", CA: "CAD", CH: "CHF", JP: "JPY", CN: "CNY",
  MY: "MYR", SG: "SGD", TH: "THB", ID: "IDR", PH: "PHP",
  NZ: "NZD", ZA: "ZAR", RU: "RUB", SE: "SEK",
  LK: "LKR", BD: "BDT", NP: "NPR", PK: "PKR",
};

const CURRENCY_CACHE_KEY = "sk_detected_currency";
const CURRENCY_CHOICE_KEY = "sk_currency_choice";

// Resolve a supported currency code, falling back to INR.
const resolveCurrency = (code) => {
  if (code && CURRENCY_RATES[code]) return code;
  return "INR";
};

// IP-based geolocation → country → currency. Free, no user permission needed.
// Falls back to timezone/locale heuristics, then INR.
export const detectCurrencyByLocation = async () => {
  // 1) Honour an explicit prior user choice above everything.
  const savedChoice = localStorage.getItem(CURRENCY_CHOICE_KEY);
  if (savedChoice && CURRENCY_RATES[savedChoice]) return savedChoice;

  // 2) Cached detection from a previous visit (within 7 days).
  const cached = localStorage.getItem(CURRENCY_CACHE_KEY);
  if (cached) {
    try {
      const { currency, ts } = JSON.parse(cached);
      if (currency && Date.now() - ts < 7 * 24 * 60 * 60 * 1000) {
        return resolveCurrency(currency);
      }
    } catch (_) {}
  }

  // 3) IP geolocation.
  try {
    const res = await fetch("https://ipapi.co/json/", {
      signal: AbortSignal.timeout(4000),
    });
    if (res.ok) {
      const data = await res.json();
      const country = data && data.country_code;
      const currency = country && COUNTRY_CURRENCY[country];
      if (currency) {
        localStorage.setItem(
          CURRENCY_CACHE_KEY,
          JSON.stringify({ currency, ts: Date.now() })
        );
        return resolveCurrency(currency);
      }
    }
  } catch (_) {}

  // 4) Timezone / locale fallback.
  const tzCurrency = detectCurrency();
  localStorage.setItem(
    CURRENCY_CACHE_KEY,
    JSON.stringify({ currency: tzCurrency, ts: Date.now() })
  );
  return resolveCurrency(tzCurrency);
};

// Remember an explicit user selection so detection never overrides it again.
export const rememberCurrencyChoice = (code) => {
  if (code && CURRENCY_RATES[code]) {
    localStorage.setItem(CURRENCY_CHOICE_KEY, code);
  }
};

export const formatPrice = (amountINR, currency = "INR") => {
  const c = CURRENCY_RATES[currency] || CURRENCY_RATES.INR;
  const converted = amountINR * c.rate;
  // Letter-based symbols need a space after them; glyph symbols don't.
  const letterSymbol = /^[A-Za-z]/.test(c.symbol);
  const sep = letterSymbol ? " " : "";
  // Whole-unit currencies (no subdivision in practice for these price points).
  const noDecimals = currency === "INR" || currency === "JPY" || currency === "IDR";
  // Use 2 decimals only when the converted value is small (e.g. a day trip in USD).
  const useDecimals = !noDecimals && converted < 100;
  const rounded = useDecimals
    ? converted.toFixed(2)
    : Math.round(converted).toLocaleString(
        currency === "INR" ? "en-IN" : "en-US"
      );
  return `${c.symbol}${sep}${rounded}`;
};
