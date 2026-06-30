// Comprehensive rule-based knowledge base for Ebenezer Tours & Travels / Savari King.
// Covers FAQs, destination info, travel tips, policies, and company info.
// No LLM — pure pattern matching. <10ms lookup.

const WHATSAPP = "https://wa.me/919952703765";

// ── FAQ entries ─────────────────────────────────────────────────────────────
// Each entry: id, patterns[], answer (markdown-like), optional cta
const FAQ = [
  {
    id: "booking",
    patterns: [
      "how to book", "how do i book", "booking process", "how can i book",
      "reserve", "make booking", "steps to book", "want to book", "get a quote",
    ],
    answer:
      "Booking is simple — entirely on WhatsApp:\n\n" +
      "1. Message us your travel dates, group size & preferred package\n" +
      "2. We reply with a custom quote within 30 minutes (8am–10pm IST)\n" +
      "3. Pay 30% deposit to confirm — balance paid on arrival\n\n" +
      "No online forms, no portals. Just a quick message to Mr. Sundar.",
    cta: { label: "Start Booking on WhatsApp", link: WHATSAPP },
  },
  {
    id: "payment",
    patterns: [
      "payment", "how to pay", "payment method", "upi", "deposit",
      "advance payment", "bank transfer", "razorpay", "cash",
    ],
    answer:
      "We accept payment multiple ways:\n\n" +
      "• UPI (GPay, PhonePe, Paytm)\n" +
      "• Bank Transfer / NEFT\n" +
      "• Cash on arrival\n\n" +
      "Structure: 30% deposit upfront to confirm, 70% on the day of tour.\n" +
      "The quoted price is always the final price — no hidden charges.",
  },
  {
    id: "cancellation",
    patterns: [
      "cancel", "cancellation", "refund", "if i cancel", "cancel policy",
      "cancellation policy", "money back", "can i cancel",
    ],
    answer:
      "Our cancellation policy:\n\n" +
      "• 7+ days before: Full refund\n" +
      "• 3–6 days before: 50% refund on deposit\n" +
      "• Under 3 days: No refund on deposit\n\n" +
      "In case of natural disaster, medical emergency, or travel ban — we reschedule at no extra cost, no questions asked.",
  },
  {
    id: "vehicle",
    patterns: [
      "vehicle", "car", "cab", "innova", "what car", "transport",
      "which vehicle", "taxi", "which car", "what vehicle", "minivan",
    ],
    answer:
      "We use the Toyota Innova Crysta — the gold standard of South India private travel.\n\n" +
      "• Seats 6 comfortably with all luggage\n" +
      "• Fully air-conditioned\n" +
      "• Clean, well-maintained interior\n" +
      "• Experienced, licensed driver\n\n" +
      "For groups of 7–12: we arrange a Tempo Traveller. No extra booking hassle.",
  },
  {
    id: "included",
    patterns: [
      "what is included", "what's included", "whats included", "inclusions",
      "what do i get", "does it include", "what comes with",
    ],
    answer:
      "All packages include:\n\n" +
      "✓ Private Innova Crysta transport (your car, your schedule)\n" +
      "✓ Airport / railway station transfers\n" +
      "✓ 1 complimentary meal per day (Kerala sadya, seafood thali, or Tamil meals)\n" +
      "✓ English-speaking guide assistance\n" +
      "✓ Hotel check-in coordination\n" +
      "✓ WhatsApp support throughout your trip (8am–10pm IST)\n\n" +
      "Excludes: flights, personal expenses, optional entrance fees.",
  },
  {
    id: "excluded",
    patterns: [
      "not included", "whats not included", "exclusions", "extra cost",
      "additional cost", "what do i pay extra", "hidden fees",
    ],
    answer:
      "Not included in package price:\n\n" +
      "✗ Flights / train to starting point\n" +
      "✗ Personal shopping & expenses\n" +
      "✗ Optional entrance fees (e.g. Vivekananda Rock boat tickets, Nilgiri Railway)\n" +
      "✗ Travel insurance\n" +
      "✗ Tips for drivers & guides (optional, appreciated)\n\n" +
      "We always list exclusions clearly in your quote — no surprise reveals.",
  },
  {
    id: "customise",
    patterns: [
      "custom", "customise", "customize", "custom itinerary", "tailor",
      "personalise", "personalize", "flexible", "change the plan", "modify",
      "special request", "own plan", "build my own",
    ],
    answer:
      "Absolutely — we customise every itinerary to your needs.\n\n" +
      "Just tell us:\n" +
      "• Your travel dates & group size\n" +
      "• Interests (temples, beaches, hills, food, photography)\n" +
      "• Budget range (budget / comfort / premium)\n" +
      "• Any special needs (dietary, medical, accessibility, elderly parents)\n\n" +
      "Mr. Sundar will build a custom plan and send it within hours.",
    cta: { label: "Request Custom Itinerary", link: WHATSAPP },
  },
  {
    id: "airport-transfer",
    patterns: [
      "airport transfer", "airport pickup", "airport drop", "airport cab",
      "trivandrum airport", "pick me up from airport", "arrival transfer",
      "departure transfer", "flight pickup",
    ],
    answer:
      "Yes, we do airport transfers as a standalone service.\n\n" +
      "Trivandrum Airport (TRV):\n" +
      "• We track your flight — if delayed, we wait at no extra charge\n" +
      "• Driver meets you at arrivals with a name board\n" +
      "• Comfortable Innova, fixed pricing, no haggling\n\n" +
      "Starting from ₹1,500 (city) to ₹2,500 (Kanyakumari / Nagercoil).\n" +
      "WhatsApp your flight number for an exact quote.",
    cta: { label: "Book Airport Transfer", link: WHATSAPP },
  },
  {
    id: "solo-female",
    patterns: [
      "solo female", "solo woman", "safe for women", "woman alone", "female solo",
      "is it safe", "safety for women", "single woman", "woman travelling alone",
    ],
    answer:
      "Yes — we welcome many solo female travellers. Here is why it is safe:\n\n" +
      "• Verified, licensed drivers with years of experience\n" +
      "• WhatsApp check-in every few hours with our office if needed\n" +
      "• We know safe, reputable hotels in every destination\n" +
      "• Mr. Sundar is directly reachable at all times during your trip\n" +
      "• Clear English communication throughout\n\n" +
      "Sophie from Germany (guest review): \"I never felt unsafe. The team was professional and always reachable.\"",
  },
  {
    id: "best-time",
    patterns: [
      "best time", "when to visit", "best season", "good time to visit",
      "when should i go", "monsoon", "summer visit", "peak season",
      "is october good", "is december good", "is april good",
    ],
    answer:
      "Best time to visit South India:\n\n" +
      "October–February — IDEAL. Cool, dry weather. Perfect for beaches, temples, and all destinations.\n" +
      "December–January — Peak Season. Beautiful weather but 15–20% higher prices and more tourists.\n\n" +
      "March–May — Hot on the plains (35–40°C) but perfect for hill stations — Ooty & Kodaikanal are excellent.\n\n" +
      "June–September — Southwest Monsoon. Lush green landscape, backwaters at their best. Beach tours not ideal but temple tours work fine.\n\n" +
      "We operate year-round and tailor itineraries for every season.",
  },
  {
    id: "senior-friendly",
    patterns: [
      "elderly", "senior", "old age", "grandparents", "aged", "senior citizen",
      "wheelchair", "mobility issue", "health issue", "parents", "old parents",
    ],
    answer:
      "We frequently travel with elderly guests and have it well figured out:\n\n" +
      "• Innova Crysta has easy step-in height — no climbing\n" +
      "• We plan moderate pacing — no rushed schedules\n" +
      "• Hotels are pre-checked for elevator access and ground-floor rooms\n" +
      "• Visits to steep temple staircases are optional or skipped\n" +
      "• Driver assists with luggage at every stop\n\n" +
      "Just tell us when booking — we will plan accordingly.",
  },
  {
    id: "foreign-tourist",
    patterns: [
      "foreign", "foreigner", "international tourist", "visa", "nri", "tourist visa",
      "foreign currency", "dollars", "pounds", "euro", "usd", "gbp", "eur",
      "cash", "atm", "from uk", "from usa", "from germany", "from dubai",
    ],
    answer:
      "We love welcoming international guests. Key things to know:\n\n" +
      "Payments: We accept INR cash, UPI, or Razorpay. USD/GBP/EUR cash accepted at current rate.\n\n" +
      "Language: All coordination in clear English via WhatsApp — no language barrier.\n\n" +
      "Visa: Standard Indian e-Tourist visa required. We don't process visas but can suggest agencies.\n\n" +
      "ATMs: Available in Trivandrum, Kanyakumari, Madurai & Kochi. Carry some INR cash for temples.\n\n" +
      "SIM: We can help you get a local SIM card on arrival at Trivandrum Airport.",
  },
  {
    id: "group-discount",
    patterns: [
      "group discount", "discount for group", "large group", "group price",
      "group booking", "group tour", "discount", "cheaper for group",
    ],
    answer:
      "Yes — group discounts available:\n\n" +
      "• 5–8 people: 8% discount on total package\n" +
      "• 9–12 people: 12% discount + Tempo Traveller upgrade\n" +
      "• Corporate groups / wedding parties / school tours: Custom pricing\n\n" +
      "All group tours are still PRIVATE — your group, your schedule, your pace.",
    cta: { label: "Ask About Group Pricing", link: WHATSAPP },
  },
  {
    id: "hotel",
    patterns: [
      "hotel", "accommodation", "where to stay", "do you book hotels",
      "hotel booking", "stay", "guesthouse", "resort", "which hotel",
    ],
    answer:
      "Yes — we recommend and coordinate hotel bookings as part of every package.\n\n" +
      "Budget (₹1,500–2,500/night): Clean, AC, good location — ideal for pilgrimages\n" +
      "Comfort (₹2,500–5,000/night): Well-rated 3-star hotels, good restaurants\n" +
      "Premium (₹8,000–15,000+/night): The Leela Kovalam, Taj, beach resorts\n\n" +
      "All hotels are personally vetted by Mr. Sundar. You show up — we handle the rest.\n\n" +
      "Or bring your own hotel bookings — we handle transport only.",
  },
  {
    id: "food-diet",
    patterns: [
      "food", "meal", "vegetarian", "vegan", "halal", "diet", "dietary",
      "eating", "non-veg", "jain food", "gluten", "allergy", "what food",
    ],
    answer:
      "South India is paradise for vegetarians — most temple towns serve pure veg.\n\n" +
      "We accommodate:\n" +
      "• Vegetarian / Vegan — easy, every restaurant caters\n" +
      "• Halal — available in Trivandrum, Kochi, Madurai\n" +
      "• Jain food — available at specific restaurants we know\n\n" +
      "Our complimentary daily meal can be veg or non-veg — just tell us.\n" +
      "We guide you to the best local spots (not tourist-trap restaurants).",
  },
  {
    id: "response-time",
    patterns: [
      "how fast reply", "how quickly", "response time", "when will you reply",
      "quick response", "urgent booking", "last minute booking",
    ],
    answer:
      "We respond on WhatsApp within 30 minutes during 8am–10pm IST, 7 days a week.\n\n" +
      "For last-minute bookings (24–48 hours before) — WhatsApp us immediately. We accommodate most requests.\n\n" +
      "Messages after 10pm IST: replied first thing next morning.",
  },
  {
    id: "packages-list",
    patterns: [
      "what packages", "list of packages", "all packages", "available tours",
      "show me packages", "what tours do you have", "which packages", "all tours",
    ],
    answer:
      "We offer 11 curated packages:\n\n" +
      "Day Trips:\n" +
      "• Kanyakumari Sunrise Day Trip — 1 day, from ₹3,500\n" +
      "• Trivandrum Heritage Day — 1 day, from ₹4,000\n\n" +
      "Weekend / Short:\n" +
      "• Kanyakumari + Trivandrum — 2 days, from ₹10,000\n" +
      "• Madurai Temple Pilgrimage — 2 days, from ₹9,000\n" +
      "• Kodaikanal Getaway — 3 days, from ₹18,000\n\n" +
      "Multi-Day:\n" +
      "• Kerala Coastal Trail — 4 days, from ₹22,000\n" +
      "• Ooty Hill Escape — 4 days, from ₹24,000\n" +
      "• The Southern Crown — 6 days, from ₹28,000\n" +
      "• Tamil Nadu Heritage Trail — 7 days, from ₹48,000\n" +
      "• South to Spice Trail — 8 days, from ₹55,000\n" +
      "• Grand South India Tour — 12 days, from ₹88,000\n\n" +
      "All tours are private, in your own Innova, fully customisable.",
  },
  {
    id: "company-info",
    patterns: [
      "about you", "about your company", "who are you", "ebenezer", "sundar",
      "mr sundar", "how many years", "experience", "how old company", "since when",
      "savari king", "who runs", "who owns",
    ],
    answer:
      "Ebenezer Tours & Travels (brand: Savari King) has operated since 1999 — 25 years of South India travel expertise.\n\n" +
      "Founded by Mr. Sundar Mesiadhas, based in Marthandam, Tamil Nadu — right on the Kerala–Tamil Nadu border, making us the natural gateway to both states.\n\n" +
      "We specialise in private, personalised tours for families, couples, foreign tourists, NRIs, and pilgrims — with a focus on safety, honesty, and genuine South Indian hospitality.\n\n" +
      "Phone: +91 99527 03765 | WhatsApp available 8am–10pm IST",
  },
  {
    id: "photography",
    patterns: [
      "photography", "photo", "photoshoot", "camera", "instagram", "drone", "best photo spots",
    ],
    answer:
      "South India is incredibly photogenic. Our best spots:\n\n" +
      "• Kanyakumari sunrise — arrive 5:30am, three-seas light is magical\n" +
      "• Meenakshi Temple, Madurai — evening alankaram ceremony (7pm) is spectacular\n" +
      "• Kovalam Lighthouse Beach — golden hour at 6pm\n" +
      "• Ooty tea estates — misty mornings, endless green hills\n" +
      "• Fort Kochi Chinese Fishing Nets — sunset, 6pm\n\n" +
      "Camera fees apply at some temples (₹50–200). Photography inside the inner sanctum is not allowed.\n" +
      "Drone photography requires special permits — contact us in advance.",
  },
  {
    id: "temple-tips",
    patterns: [
      "temple etiquette", "temple rules", "dress code temple", "what to wear temple",
      "temple visit tips", "darshan", "can i enter temple", "temple timing",
    ],
    answer:
      "Temple visit guidelines:\n\n" +
      "Dress code: Shoulders and knees covered. Men may need to remove shirts at some Kerala temples. Dhotis available at the gate.\n\n" +
      "Shoes: Removed before entering temple premises. Paid shoe stands available.\n\n" +
      "Photography: Not allowed inside the inner sanctum. Usually allowed in outer areas.\n\n" +
      "Timing: Morning darshan (6–8am) and evening (6–8pm) are most atmospheric.\n\n" +
      "Non-Hindus: Some temples restrict entry to the inner sanctum. Our guide briefs you in advance.",
  },
  {
    id: "packing-tips",
    patterns: [
      "what to pack", "packing", "what to bring", "clothes", "what to wear",
      "luggage", "essentials", "what should i carry",
    ],
    answer:
      "Packing essentials for South India:\n\n" +
      "Clothing:\n" +
      "• Light cotton clothes (it's warm and humid on the coast)\n" +
      "• A light jacket for hill stations (Ooty, Kodaikanal can be cold)\n" +
      "• Modest clothing for temples (shoulders + knees covered)\n" +
      "• Comfortable walking shoes (removed at temples, so slip-ons help)\n\n" +
      "Essentials:\n" +
      "• Sunscreen and sunglasses\n" +
      "• Insect repellent (backwater areas)\n" +
      "• Small cash in INR for temples and markets\n" +
      "• Copy of passport (original safe in hotel)\n" +
      "• Download Google Translate offline for Tamil / Malayalam",
  },
];

// ── Destination information ─────────────────────────────────────────────────
const DESTINATION_INFO = {
  kanniyakumari: {
    name: "Kanyakumari",
    tagline: "Where three seas meet at the tip of India",
    mustSee: [
      "Vivekananda Rock Memorial",
      "Thiruvalluvar Statue (boat required)",
      "Kumari Amman Temple",
      "Sunrise Point (Confederation of three seas)",
      "Gandhi Memorial Museum",
      "Wax Museum",
      "Sunset Point",
    ],
    bestTime: "October to March",
    distance: "25 km from Marthandam (45 min)",
    tip: "Arrive by 5:30am for the sunrise. Take the first morning boat to Vivekananda Rock — queues build fast after 8am.",
    overview:
      "Kanyakumari is the southernmost tip of mainland India where the Arabian Sea, Bay of Bengal, and Indian Ocean converge. At sunrise the three waters glow in different colours — one of India's most iconic sights.",
  },
  trivandrum: {
    name: "Trivandrum (Thiruvananthapuram)",
    tagline: "Kerala's ancient royal capital",
    mustSee: [
      "Padmanabhaswamy Temple (one of India's wealthiest)",
      "Napier Museum",
      "Kuthiramalika Palace Museum",
      "Attukal Bhagavathy Temple",
      "Chalai Bazaar",
      "Kovalam Beach (30 min away)",
    ],
    bestTime: "November to February",
    distance: "60 km from Marthandam (1.5 hours)",
    tip: "Padmanabhaswamy Temple requires traditional dress — dhotis provided for men. Non-Hindus cannot enter the inner sanctum but the outer courtyard is open.",
    overview:
      "Kerala's capital holds 2,000 years of royal history. Padmanabhaswamy Temple — famous for its underground vaults holding billions in gold — sits in the heart of the city alongside palaces and colonial museums.",
  },
  kovalam: {
    name: "Kovalam",
    tagline: "Kerala's most famous crescent beach",
    mustSee: [
      "Lighthouse Beach (main beach)",
      "Hawah Beach",
      "Leela Beach",
      "Kovalam Lighthouse viewpoint climb (₹10)",
      "Sunset from the lighthouse (6pm)",
      "Ayurvedic spa centres",
    ],
    bestTime: "November to February (sea calm for swimming)",
    distance: "68 km from Marthandam (1.75 hours)",
    tip: "The lighthouse climb gives a panoramic view of all three beaches — best at golden hour. Swim in the central Lighthouse Beach only (flag system — red flag means no swimming).",
    overview:
      "Three crescent beaches in a sheltered bay. Kovalam has calm, safe swimming, fresh seafood restaurants right on the sand, and some of Kerala's finest Ayurvedic centres.",
  },
  madurai: {
    name: "Madurai",
    tagline: "The eternal temple city — 2,500 years of living history",
    mustSee: [
      "Meenakshi Amman Temple (14 towering gopurams)",
      "Thirumalai Nayakkar Palace",
      "Gandhi Memorial Museum",
      "Alagar Koil (14 km away)",
      "Madurai Jasmine Market (dawn)",
      "Authentic Chettinad dinner",
    ],
    bestTime: "October to March",
    distance: "150 km from Marthandam (3 hours)",
    tip: "The evening alankaram ceremony at Meenakshi Temple (7pm) is the most spectacular religious ceremony in Tamil Nadu. Go Friday evening for the procession of Sundareswarar — extraordinary.",
    overview:
      "Madurai is one of the oldest continuously inhabited cities in the world. The Meenakshi Amman Temple's 14 gopurams are covered in thousands of hand-painted deities, lit in gold at night. The city never sleeps.",
  },
  ooty: {
    name: "Ooty (Udhagamandalam)",
    tagline: "Queen of Hill Stations at 2,240 metres",
    mustSee: [
      "Nilgiri Mountain Railway (UNESCO World Heritage — toy train)",
      "Doddabetta Peak (2,637 m — highest in Nilgiris)",
      "Ooty Botanical Gardens & Rose Garden",
      "Ooty Lake boating",
      "Coonoor tea estate walk",
      "Chocolate & tea factory visits",
    ],
    bestTime: "April–June (cool escape from plains heat) or October–February (misty, romantic)",
    distance: "200 km from Marthandam (4.5 hours)",
    tip: "Book Nilgiri Mountain Railway (toy train) tickets 2 months ahead in peak season — they fill very fast. We handle this booking for you.",
    overview:
      "At 2,240 metres, Ooty offers cool air, colonial-era bungalows, tea estates stretching to the horizon, and a UNESCO heritage toy train that winds through the hills. A complete change from coastal South India.",
  },
  kodaikanal: {
    name: "Kodaikanal",
    tagline: "Princess of Hill Stations — lakes, pillars, and waterfalls",
    mustSee: [
      "Star-shaped Kodai Lake (cycling, boating)",
      "Pillar Rocks (dramatic granite formations disappearing into cloud)",
      "Coakers Walk at sunrise (6:30am)",
      "Silver Cascade Waterfalls",
      "Bear Shola Falls",
      "Green Valley View",
      "Homemade chocolate shops",
    ],
    bestTime: "April–June or October–December",
    distance: "210 km from Marthandam (5 hours)",
    tip: "Coakers Walk at 6:30am gives the most dramatic mist views over the valley. Pack a light jacket — Kodaikanal stays cool year-round (15–25°C).",
    overview:
      "Kodaikanal sits at 2,133 metres and is known for its star-shaped lake, misty Pillar Rocks, and quiet walking paths. Less crowded than Ooty, more romantic and contemplative.",
  },
  kochi: {
    name: "Kochi (Cochin)",
    tagline: "The Queen of the Arabian Sea — 500 years of colonial heritage",
    mustSee: [
      "Fort Kochi heritage walk",
      "Chinese Fishing Nets at sunset (6pm)",
      "Mattancherry Palace (Dutch Palace)",
      "Jewish Synagogue (Paradesi Synagogue)",
      "Kathakali performance (6pm, Fort Kochi)",
      "Marine Drive promenade",
      "Spice markets in Mattancherry",
    ],
    bestTime: "October to February",
    distance: "180 km from Marthandam (4 hours)",
    tip: "Chinese Fishing Nets at sunset is the most photographed scene in Kerala. Arrive by 5:30pm. The Kathakali performance at 6pm in Fort Kochi is a must — book a day ahead.",
    overview:
      "India's finest natural harbour, shaped by 500 years of Portuguese, Dutch, and British influence. Fort Kochi feels like a European city dropped into Kerala — whitewashed churches, spice warehouses, and Chinese fishing nets.",
  },
};

// ── Intent detection ────────────────────────────────────────────────────────

const DESTINATION_INFO_PATTERNS = [
  "tell me about", "what to see in", "what to do in", "info about",
  "information about", "places in", "highlights of", "things to do in",
  "what is there in", "best places in", "sightseeing in", "visit in",
  "tourist places", "attractions in", "guide to",
];

const FAQ_BOOKING_PATTERNS = FAQ.flatMap((f) => f.patterns);

/**
 * Classify query intent.
 * Returns: 'faq' | 'destination_info' | 'book'
 */
function classifyIntent(query) {
  const q = query.toLowerCase();

  // Check destination info patterns
  const isDestInfo = DESTINATION_INFO_PATTERNS.some((p) => q.includes(p));
  if (isDestInfo) return "destination_info";

  // Check FAQ patterns
  const isFaq = FAQ_BOOKING_PATTERNS.some((p) => q.includes(p));
  if (isFaq) return "faq";

  return "book";
}

/**
 * Find best matching FAQ answer for a query.
 * Returns { answer, cta } or null.
 */
function matchFAQ(query) {
  const q = query.toLowerCase();
  let best = null;
  let bestScore = 0;

  for (const entry of FAQ) {
    const score = entry.patterns.filter((p) => q.includes(p)).length;
    if (score > bestScore) {
      bestScore = score;
      best = entry;
    }
  }

  return best && bestScore > 0 ? { answer: best.answer, cta: best.cta || null } : null;
}

/**
 * Find destination info for a query.
 * Returns destination info object or null.
 */
function matchDestinationInfo(query) {
  const q = query.toLowerCase();

  const DEST_ALIASES = {
    kanniyakumari: ["kanyakumari", "kanniyakumari", "cape comorin", "kk", "three seas"],
    trivandrum: ["trivandrum", "thiruvananthapuram", "tvm"],
    kovalam: ["kovalam", "lighthouse beach", "kerala beach"],
    madurai: ["madurai", "meenakshi", "temple city"],
    ooty: ["ooty", "ootacamund", "udhagamandalam", "nilgiri", "queen of hills"],
    kodaikanal: ["kodaikanal", "kodai", "princess of hills"],
    kochi: ["kochi", "cochin", "fort kochi", "ernakulam"],
  };

  for (const [key, aliases] of Object.entries(DEST_ALIASES)) {
    if (aliases.some((alias) => q.includes(alias))) {
      return DESTINATION_INFO[key] || null;
    }
  }
  return null;
}

module.exports = { classifyIntent, matchFAQ, matchDestinationInfo, FAQ, DESTINATION_INFO };
