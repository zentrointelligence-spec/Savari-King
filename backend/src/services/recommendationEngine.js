// Rule-based travel package recommendation orchestrator.
// No LLM — pure keyword matching + scoring. Zero token cost, <50ms response.

const PACKAGES = [
  {
    id: "southern-crown",
    name: "The Southern Crown",
    badge: "Flagship",
    duration: 6,
    durationLabel: "6 Days / 5 Nights",
    destinations: ["trivandrum", "kovalam", "kanniyakumari"],
    tripTypes: ["beach", "culture", "sightseeing", "family"],
    priceINR: { standard: 28000, comfort: 42000, premium: 68000 },
    hasTiers: true,
  },
  {
    id: "coastal-trail",
    name: "Kerala Coastal Trail",
    badge: "Best Seller",
    duration: 4,
    durationLabel: "4 Days / 3 Nights",
    destinations: ["trivandrum", "kovalam", "backwaters"],
    tripTypes: ["beach", "backwaters", "relaxation", "couple"],
    priceINR: { standard: 22000 },
    hasTiers: false,
  },
  {
    id: "spice-trail",
    name: "South to Spice Trail",
    badge: "Most Complete",
    duration: 8,
    durationLabel: "8 Days / 7 Nights",
    destinations: ["trivandrum", "kovalam", "kanniyakumari", "kochi"],
    tripTypes: ["heritage", "culture", "backwaters", "family", "international"],
    priceINR: { standard: 55000 },
    hasTiers: false,
  },
  {
    id: "kk-day-trip",
    name: "Kanyakumari Sunrise Day Trip",
    badge: "Day Trip",
    duration: 1,
    durationLabel: "1 Day",
    destinations: ["kanniyakumari"],
    tripTypes: ["sightseeing", "pilgrimage", "quick"],
    priceINR: { standard: 3500, comfort: 4500 },
    hasTiers: true,
  },
  {
    id: "trivandrum-day",
    name: "Trivandrum Heritage Day",
    badge: "Day Trip",
    duration: 1,
    durationLabel: "1 Day",
    destinations: ["trivandrum"],
    tripTypes: ["heritage", "temple", "pilgrimage", "quick"],
    priceINR: { standard: 4000, comfort: 5500 },
    hasTiers: true,
  },
  {
    id: "kk-trivandrum-2d",
    name: "Kanyakumari + Trivandrum",
    badge: "Weekend",
    duration: 2,
    durationLabel: "2 Days / 1 Night",
    destinations: ["kanniyakumari", "trivandrum", "kovalam"],
    tripTypes: ["weekend", "couple", "family", "sightseeing"],
    priceINR: { standard: 10000, comfort: 16000, premium: 28000 },
    hasTiers: true,
  },
  {
    id: "madurai-pilgrimage",
    name: "Madurai Temple Pilgrimage",
    badge: "Sacred",
    duration: 2,
    durationLabel: "2 Days / 1 Night",
    destinations: ["madurai"],
    tripTypes: ["pilgrimage", "temple", "religious", "heritage"],
    priceINR: { standard: 9000 },
    hasTiers: false,
  },
  {
    id: "ooty-escape",
    name: "Ooty Hill Escape",
    badge: "Hill Station",
    duration: 4,
    durationLabel: "4 Days / 3 Nights",
    destinations: ["ooty", "coonoor"],
    tripTypes: ["hills", "nature", "honeymoon", "couple", "family", "relaxation"],
    priceINR: { standard: 24000 },
    hasTiers: false,
  },
  {
    id: "kodaikanal-getaway",
    name: "Kodaikanal Getaway",
    badge: "Hill Station",
    duration: 3,
    durationLabel: "3 Days / 2 Nights",
    destinations: ["kodaikanal", "kodai"],
    tripTypes: ["hills", "nature", "honeymoon", "couple", "relaxation"],
    priceINR: { standard: 18000 },
    hasTiers: false,
  },
  {
    id: "tamil-heritage-trail",
    name: "Tamil Nadu Heritage Trail",
    badge: "Signature",
    duration: 7,
    durationLabel: "7 Days / 6 Nights",
    destinations: ["kanniyakumari", "madurai", "ooty", "kodaikanal"],
    tripTypes: ["heritage", "temple", "hills", "culture", "comprehensive"],
    priceINR: { standard: 48000 },
    hasTiers: false,
  },
  {
    id: "grand-south-india",
    name: "Grand South India Tour",
    badge: "Ultimate",
    duration: 12,
    durationLabel: "12 Days / 11 Nights",
    destinations: ["trivandrum", "kovalam", "kanniyakumari", "madurai", "ooty", "kodaikanal", "kochi"],
    tripTypes: ["comprehensive", "family", "complete", "international"],
    priceINR: { standard: 88000 },
    hasTiers: false,
  },
];

// ── Agent 1: Keyword Extractor ──────────────────────────────────────────────

const DESTINATION_KEYWORDS = {
  "kanniyakumari": ["kanniyakumari", "kanyakumari", "kk", "cape comorin", "three seas", "sunrise", "southernmost"],
  "trivandrum": ["trivandrum", "thiruvananthapuram", "tvm", "padmanabha", "napier"],
  "kovalam": ["kovalam", "beach", "lighthouse beach", "kerala beach"],
  "kochi": ["kochi", "cochin", "fort kochi", "ernakulam", "spice"],
  "backwaters": ["backwaters", "houseboat", "alleppey", "alappuzha", "boat"],
  "madurai": ["madurai", "meenakshi", "temple city", "meenakshi amman"],
  "ooty": ["ooty", "ootacamund", "udhagamandalam", "nilgiri", "hill station", "mountain railway", "tea estate"],
  "kodaikanal": ["kodaikanal", "kodai", "kodai lake", "pillar rocks", "coakers walk", "princess of hills"],
};

const DURATION_KEYWORDS = {
  1: ["day trip", "one day", "1 day", "single day", "quick visit"],
  2: ["2 days", "two days", "weekend", "2 nights", "short trip"],
  3: ["3 days", "three days", "3 nights"],
  4: ["4 days", "four days", "4 nights"],
  6: ["6 days", "six days", "5 nights", "week"],
  7: ["7 days", "seven days", "one week", "6 nights"],
  8: ["8 days", "eight days", "7 nights"],
  12: ["12 days", "two weeks", "grand tour", "complete tour", "everything"],
};

const TRIP_TYPE_KEYWORDS = {
  "pilgrimage": ["temple", "pilgrimage", "religious", "darshan", "devotional", "spiritual", "sacred"],
  "honeymoon": ["honeymoon", "romantic", "couple", "anniversary", "romance"],
  "family": ["family", "kids", "children", "parents", "elderly"],
  "hills": ["hill", "hills", "mountain", "cool", "misty", "ooty", "kodai", "nilgiri"],
  "beach": ["beach", "sea", "ocean", "coastal", "swimming"],
  "heritage": ["heritage", "history", "museum", "palace", "fort", "colonial"],
  "nature": ["nature", "trekking", "wildlife", "green", "forest", "scenic"],
  "relaxation": ["relax", "leisure", "slow", "peaceful", "quiet"],
};

const BUDGET_KEYWORDS = {
  "standard": ["budget", "affordable", "cheap", "economy", "low cost", "inexpensive"],
  "comfort": ["mid-range", "mid range", "comfortable", "moderate", "standard hotel"],
  "premium": ["luxury", "premium", "5 star", "five star", "leela", "taj", "high end"],
};

function extractIntent(query) {
  const q = query.toLowerCase();

  // Destinations
  const destinations = [];
  for (const [dest, keywords] of Object.entries(DESTINATION_KEYWORDS)) {
    if (keywords.some((kw) => q.includes(kw))) destinations.push(dest);
  }

  // Duration
  let durationDays = null;
  for (const [days, keywords] of Object.entries(DURATION_KEYWORDS)) {
    if (keywords.some((kw) => q.includes(kw))) {
      durationDays = parseInt(days);
      break;
    }
  }
  // Extract raw number + "day" pattern (e.g. "4 days", "5 day")
  if (!durationDays) {
    const m = q.match(/(\d+)\s*day/);
    if (m) durationDays = parseInt(m[1]);
  }

  // Trip types
  const tripTypes = [];
  for (const [type, keywords] of Object.entries(TRIP_TYPE_KEYWORDS)) {
    if (keywords.some((kw) => q.includes(kw))) tripTypes.push(type);
  }

  // Budget tier
  let budgetTier = "comfort"; // default mid-range
  for (const [tier, keywords] of Object.entries(BUDGET_KEYWORDS)) {
    if (keywords.some((kw) => q.includes(kw))) {
      budgetTier = tier;
      break;
    }
  }

  // Group size
  let groupSize = 2;
  const groupMatch = q.match(/(\d+)\s*(people|person|pax|adult|member|travell)/);
  if (groupMatch) groupSize = parseInt(groupMatch[1]);
  else if (q.includes("solo") || q.includes("alone") || q.includes("myself")) groupSize = 1;
  else if (q.includes("couple") || q.includes("two of us") || q.includes("2 of us")) groupSize = 2;
  else if (q.includes("family of 3")) groupSize = 3;
  else if (q.includes("family of 4")) groupSize = 4;
  else if (q.includes("family of 5")) groupSize = 5;
  else if (q.includes("family of 6")) groupSize = 6;
  else if (q.includes("group")) groupSize = 6;

  return { destinations, durationDays, tripTypes, budgetTier, groupSize };
}

// ── Agent 2: Package Scorer ─────────────────────────────────────────────────

function scorePackage(pkg, intent) {
  let score = 0;

  // Destination match (40 pts max)
  if (intent.destinations.length > 0) {
    const matched = intent.destinations.filter((d) =>
      pkg.destinations.some((pd) => pd.includes(d) || d.includes(pd))
    ).length;
    score += (matched / intent.destinations.length) * 40;
  } else {
    score += 20; // neutral when no destination specified
  }

  // Duration match (30 pts max)
  if (intent.durationDays) {
    const diff = Math.abs(pkg.duration - intent.durationDays);
    if (diff === 0) score += 30;
    else if (diff <= 1) score += 22;
    else if (diff <= 2) score += 14;
    else if (diff <= 3) score += 6;
  } else {
    score += 15; // neutral
  }

  // Trip type match (20 pts max)
  if (intent.tripTypes.length > 0) {
    const matched = intent.tripTypes.filter((t) => pkg.tripTypes.includes(t)).length;
    score += (matched / intent.tripTypes.length) * 20;
  } else {
    score += 10; // neutral
  }

  // Group size fit (10 pts)
  if (intent.groupSize <= 6) score += 10;
  else if (intent.groupSize <= 9) score += 5; // Innova fits 7 comfortably

  return score;
}

// ── Agent 3: Price Calculator ───────────────────────────────────────────────

function calculatePrice(pkg, tier, groupSize) {
  const prices = pkg.priceINR;
  const resolvedTier = prices[tier] ? tier : Object.keys(prices)[0];
  const perPerson = prices[resolvedTier];
  let total = perPerson * groupSize;

  // Group discount: 5+ pax get 8% off
  if (groupSize >= 5) total = Math.round(total * 0.92);

  return {
    tier: resolvedTier.charAt(0).toUpperCase() + resolvedTier.slice(1),
    perPerson,
    total,
    note: groupSize >= 5 ? "8% group discount applied" : null,
  };
}

// ── Agent 4: WhatsApp Message Builder ──────────────────────────────────────

function buildWhatsAppMessage(pkg, pricing, groupSize) {
  return encodeURIComponent(
    `Hi Mr. Sundar! I'm interested in "${pkg.name}" (${pkg.durationLabel}) for ${groupSize} person${groupSize > 1 ? "s" : ""}. Please share availability and full details. Thank you!`
  );
}

// ── Main Orchestrator ───────────────────────────────────────────────────────

function recommend(query) {
  const intent = extractIntent(query);

  const scored = PACKAGES.map((pkg) => ({
    pkg,
    score: scorePackage(pkg, intent),
  }))
    .sort((a, b) => b.score - a.score)
    .slice(0, 3);

  const results = scored.map(({ pkg }) => {
    const pricing = calculatePrice(pkg, intent.budgetTier, intent.groupSize);
    const waMsg = buildWhatsAppMessage(pkg, pricing, intent.groupSize);
    return {
      id: pkg.id,
      name: pkg.name,
      badge: pkg.badge,
      duration: pkg.durationLabel,
      destinations: pkg.destinations,
      pricing,
      whatsappLink: `https://wa.me/919952703765?text=${waMsg}`,
    };
  });

  const destinationNames = intent.destinations
    .map((d) => d.charAt(0).toUpperCase() + d.slice(1))
    .join(", ");

  const summary = intent.destinations.length
    ? `Here are the best packages for ${destinationNames}${intent.durationDays ? ` (${intent.durationDays} days)` : ""}:`
    : "Here are our most popular South India packages for you:";

  return { packages: results, summary, intent };
}

module.exports = { recommend };
