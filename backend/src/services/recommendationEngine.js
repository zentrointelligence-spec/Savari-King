// Rule-based travel orchestrator — Ebenezer Tours & Travels / Savari King.
// 6-agent pipeline: Intent → FAQ/Destination Info → Extract → Score → Live Prices → WhatsApp
// No LLM. Zero token cost. Typical response time: <60ms (DB-backed) or <5ms (cached/fallback).

const db = require("../db");
const { classifyIntent, matchFAQ, matchDestinationInfo } = require("./knowledgeBase");

// ── Hardcoded price fallback (used when DB is unavailable) ──────────────────
const FALLBACK_PRICES = {
  "southern-crown":       { standard: 28000, comfort: 42000, premium: 68000 },
  "coastal-trail":        { standard: 22000 },
  "spice-trail":          { standard: 55000 },
  "kk-day-trip":          { standard: 3500, comfort: 4500 },
  "trivandrum-day":       { standard: 4000, comfort: 5500 },
  "kk-trivandrum-2d":     { standard: 10000, comfort: 16000, premium: 28000 },
  "madurai-pilgrimage":   { standard: 9000 },
  "ooty-escape":          { standard: 24000 },
  "kodaikanal-getaway":   { standard: 18000 },
  "tamil-heritage-trail": { standard: 48000 },
  "grand-south-india":    { standard: 88000 },
};

const PACKAGE_META = [
  {
    id: "southern-crown",
    name: "The Southern Crown",
    badge: "Flagship",
    duration: 6,
    durationLabel: "6 Days / 5 Nights",
    destinations: ["trivandrum", "kovalam", "kanniyakumari"],
    tripTypes: ["beach", "culture", "sightseeing", "family"],
  },
  {
    id: "coastal-trail",
    name: "Kerala Coastal Trail",
    badge: "Best Seller",
    duration: 4,
    durationLabel: "4 Days / 3 Nights",
    destinations: ["trivandrum", "kovalam", "backwaters"],
    tripTypes: ["beach", "backwaters", "relaxation", "couple"],
  },
  {
    id: "spice-trail",
    name: "South to Spice Trail",
    badge: "Most Complete",
    duration: 8,
    durationLabel: "8 Days / 7 Nights",
    destinations: ["trivandrum", "kovalam", "kanniyakumari", "kochi"],
    tripTypes: ["heritage", "culture", "backwaters", "family", "international"],
  },
  {
    id: "kk-day-trip",
    name: "Kanyakumari Sunrise Day Trip",
    badge: "Day Trip",
    duration: 1,
    durationLabel: "1 Day",
    destinations: ["kanniyakumari"],
    tripTypes: ["sightseeing", "pilgrimage", "quick"],
  },
  {
    id: "trivandrum-day",
    name: "Trivandrum Heritage Day",
    badge: "Day Trip",
    duration: 1,
    durationLabel: "1 Day",
    destinations: ["trivandrum"],
    tripTypes: ["heritage", "temple", "pilgrimage", "quick"],
  },
  {
    id: "kk-trivandrum-2d",
    name: "Kanyakumari + Trivandrum",
    badge: "Weekend",
    duration: 2,
    durationLabel: "2 Days / 1 Night",
    destinations: ["kanniyakumari", "trivandrum", "kovalam"],
    tripTypes: ["weekend", "couple", "family", "sightseeing"],
  },
  {
    id: "madurai-pilgrimage",
    name: "Madurai Temple Pilgrimage",
    badge: "Sacred",
    duration: 2,
    durationLabel: "2 Days / 1 Night",
    destinations: ["madurai"],
    tripTypes: ["pilgrimage", "temple", "religious", "heritage"],
  },
  {
    id: "ooty-escape",
    name: "Ooty Hill Escape",
    badge: "Hill Station",
    duration: 4,
    durationLabel: "4 Days / 3 Nights",
    destinations: ["ooty", "coonoor"],
    tripTypes: ["hills", "nature", "honeymoon", "couple", "family", "relaxation"],
  },
  {
    id: "kodaikanal-getaway",
    name: "Kodaikanal Getaway",
    badge: "Hill Station",
    duration: 3,
    durationLabel: "3 Days / 2 Nights",
    destinations: ["kodaikanal", "kodai"],
    tripTypes: ["hills", "nature", "honeymoon", "couple", "relaxation"],
  },
  {
    id: "tamil-heritage-trail",
    name: "Tamil Nadu Heritage Trail",
    badge: "Signature",
    duration: 7,
    durationLabel: "7 Days / 6 Nights",
    destinations: ["kanniyakumari", "madurai", "ooty", "kodaikanal"],
    tripTypes: ["heritage", "temple", "hills", "culture", "comprehensive"],
  },
  {
    id: "grand-south-india",
    name: "Grand South India Tour",
    badge: "Ultimate",
    duration: 12,
    durationLabel: "12 Days / 11 Nights",
    destinations: ["trivandrum", "kovalam", "kanniyakumari", "madurai", "ooty", "kodaikanal", "kochi"],
    tripTypes: ["comprehensive", "family", "complete", "international"],
  },
];

// ── Simple in-memory cache (5-minute TTL) ───────────────────────────────────
const cache = { prices: null, status: null, loadedAt: 0 };
const CACHE_TTL_MS = 5 * 60 * 1000;

async function loadLiveData() {
  if (Date.now() - cache.loadedAt < CACHE_TTL_MS) return cache;

  try {
    const [priceRows, statusRows] = await Promise.all([
      db.query("SELECT package_id, tier, price_inr FROM package_prices WHERE is_active = true"),
      db.query("SELECT package_id, status, status_note, availability_pct FROM package_status"),
    ]);

    // Build prices map: { packageId: { standard: N, comfort: N, ... } }
    const prices = {};
    for (const row of priceRows.rows) {
      if (!prices[row.package_id]) prices[row.package_id] = {};
      prices[row.package_id][row.tier] = row.price_inr;
    }

    // Build status map: { packageId: { status, note, pct } }
    const status = {};
    for (const row of statusRows.rows) {
      status[row.package_id] = {
        status: row.status,
        note: row.status_note,
        pct: row.availability_pct,
      };
    }

    cache.prices = prices;
    cache.status = status;
    cache.loadedAt = Date.now();
  } catch {
    // DB unavailable — fall back to hardcoded prices + assume all available
    cache.prices = cache.prices || null;
    cache.status = cache.status || null;
    cache.loadedAt = Date.now() - CACHE_TTL_MS + 10000; // retry in 10s
  }

  return cache;
}

// ── Agent 1: Keyword / Intent Extractor ─────────────────────────────────────

const DESTINATION_KEYWORDS = {
  kanniyakumari: ["kanniyakumari", "kanyakumari", "kk", "cape comorin", "three seas", "sunrise", "southernmost"],
  trivandrum:   ["trivandrum", "thiruvananthapuram", "tvm", "padmanabha", "napier"],
  kovalam:      ["kovalam", "lighthouse beach", "kerala beach"],
  kochi:        ["kochi", "cochin", "fort kochi", "ernakulam", "spice"],
  backwaters:   ["backwaters", "houseboat", "alleppey", "alappuzha", "boat"],
  madurai:      ["madurai", "meenakshi", "temple city", "meenakshi amman"],
  ooty:         ["ooty", "ootacamund", "udhagamandalam", "nilgiri", "hill station", "mountain railway", "tea estate"],
  kodaikanal:   ["kodaikanal", "kodai", "kodai lake", "pillar rocks", "coakers walk", "princess of hills"],
};

const DURATION_KEYWORDS = {
  1:  ["day trip", "one day", "1 day", "single day", "quick visit"],
  2:  ["2 days", "two days", "weekend", "2 nights", "short trip"],
  3:  ["3 days", "three days", "3 nights"],
  4:  ["4 days", "four days", "4 nights"],
  6:  ["6 days", "six days", "5 nights"],
  7:  ["7 days", "seven days", "one week", "6 nights"],
  8:  ["8 days", "eight days", "7 nights"],
  12: ["12 days", "two weeks", "grand tour", "complete tour", "everything"],
};

const TRIP_TYPE_KEYWORDS = {
  pilgrimage:  ["temple", "pilgrimage", "religious", "darshan", "devotional", "spiritual", "sacred"],
  honeymoon:   ["honeymoon", "romantic", "couple", "anniversary", "romance"],
  family:      ["family", "kids", "children", "parents", "elderly"],
  hills:       ["hill", "hills", "mountain", "cool", "misty", "ooty", "kodai", "nilgiri", "cold weather"],
  beach:       ["beach", "sea", "ocean", "coastal", "swimming"],
  heritage:    ["heritage", "history", "museum", "palace", "fort", "colonial"],
  nature:      ["nature", "trekking", "wildlife", "green", "forest", "scenic"],
  relaxation:  ["relax", "leisure", "slow", "peaceful", "quiet"],
};

const BUDGET_KEYWORDS = {
  standard: ["budget", "affordable", "cheap", "economy", "low cost", "inexpensive", "backpacker"],
  comfort:  ["mid-range", "mid range", "comfortable", "moderate", "standard hotel", "3 star"],
  premium:  ["luxury", "premium", "5 star", "five star", "leela", "taj", "high end", "lavish"],
};

function extractIntent(query) {
  const q = query.toLowerCase();

  const destinations = [];
  for (const [dest, kws] of Object.entries(DESTINATION_KEYWORDS)) {
    if (kws.some((kw) => q.includes(kw))) destinations.push(dest);
  }

  let durationDays = null;
  for (const [days, kws] of Object.entries(DURATION_KEYWORDS)) {
    if (kws.some((kw) => q.includes(kw))) { durationDays = parseInt(days); break; }
  }
  if (!durationDays) {
    const m = q.match(/(\d+)\s*day/);
    if (m) durationDays = parseInt(m[1]);
  }

  const tripTypes = [];
  for (const [type, kws] of Object.entries(TRIP_TYPE_KEYWORDS)) {
    if (kws.some((kw) => q.includes(kw))) tripTypes.push(type);
  }

  let budgetTier = "comfort";
  for (const [tier, kws] of Object.entries(BUDGET_KEYWORDS)) {
    if (kws.some((kw) => q.includes(kw))) { budgetTier = tier; break; }
  }

  let groupSize = 2;
  const gm = q.match(/(\d+)\s*(people|person|pax|adult|member|travell)/);
  if (gm) groupSize = parseInt(gm[1]);
  else if (q.includes("solo") || q.includes("alone") || q.includes("myself")) groupSize = 1;
  else if (q.includes("couple") || q.includes("two of us")) groupSize = 2;
  else if (q.match(/family of (\d)/)) groupSize = parseInt(q.match(/family of (\d)/)[1]);
  else if (q.includes("group")) groupSize = 6;

  return { destinations, durationDays, tripTypes, budgetTier, groupSize };
}

// ── Agent 2: Package Scorer ──────────────────────────────────────────────────

function scorePackage(pkg, intent) {
  let score = 0;

  // Destination match (40 pts)
  if (intent.destinations.length > 0) {
    const matched = intent.destinations.filter((d) =>
      pkg.destinations.some((pd) => pd.includes(d) || d.includes(pd))
    ).length;
    score += (matched / intent.destinations.length) * 40;
  } else {
    score += 20;
  }

  // Duration match (30 pts)
  if (intent.durationDays) {
    const diff = Math.abs(pkg.duration - intent.durationDays);
    if (diff === 0) score += 30;
    else if (diff <= 1) score += 22;
    else if (diff <= 2) score += 14;
    else if (diff <= 3) score += 6;
  } else {
    score += 15;
  }

  // Trip type match (20 pts)
  if (intent.tripTypes.length > 0) {
    const matched = intent.tripTypes.filter((t) => pkg.tripTypes.includes(t)).length;
    score += (matched / intent.tripTypes.length) * 20;
  } else {
    score += 10;
  }

  // Group size fit (10 pts)
  score += intent.groupSize <= 6 ? 10 : intent.groupSize <= 9 ? 5 : 0;

  return score;
}

// ── Agent 3: Seasonal Pricing ────────────────────────────────────────────────

function getSeasonInfo(travelDateStr) {
  const d = travelDateStr ? new Date(travelDateStr) : new Date();
  const m = d.getMonth() + 1; // 1-12
  if (m === 12 || m === 1)
    return { multiplier: 1.20, label: "Peak Season", note: "20% peak season surcharge (Dec–Jan)" };
  if (m === 2 || m === 10 || m === 11)
    return { multiplier: 1.00, label: "Best Season", note: null };
  if (m >= 3 && m <= 5)
    return { multiplier: 0.92, label: "Summer Deal", note: "8% summer discount applied" };
  if (m >= 6 && m <= 9)
    return { multiplier: 0.85, label: "Monsoon Offer", note: "15% off-season discount applied" };
  return { multiplier: 1.00, label: "Standard Season", note: null };
}

// ── Agent 4: Price Calculator (with live DB prices) ──────────────────────────

function calculatePrice(pkg, tier, groupSize, livePrice, season) {
  const prices = livePrice || FALLBACK_PRICES[pkg.id] || {};
  const resolvedTier = prices[tier] ? tier : Object.keys(prices)[0];
  let perPerson = Math.round((prices[resolvedTier] || 5000) * season.multiplier);
  let total = perPerson * groupSize;

  const notes = [];
  if (groupSize >= 5) { total = Math.round(total * 0.92); notes.push("8% group discount"); }
  if (season.note) notes.push(season.note);

  return {
    tier: resolvedTier.charAt(0).toUpperCase() + resolvedTier.slice(1),
    perPerson,
    total,
    note: notes.join(" · ") || null,
    isLive: !!livePrice,
  };
}

// ── Agent 5: Availability Status ─────────────────────────────────────────────

function getStatusBadge(statusData) {
  if (!statusData) return { status: "available", label: "Available", color: "green" };
  const map = {
    available:   { label: "Available",    color: "green"  },
    limited:     { label: "Filling Fast", color: "orange" },
    seasonal:    { label: "Seasonal",     color: "blue"   },
    unavailable: { label: "Unavailable",  color: "red"    },
    busy:        { label: "High Demand",  color: "orange" },
  };
  return { ...(map[statusData.status] || map.available), note: statusData.note, pct: statusData.pct };
}

// ── Agent 6: WhatsApp Message Builder ────────────────────────────────────────

function buildWhatsAppLink(pkg, pricing, groupSize, intent) {
  const destinations = pkg.destinations
    .map((d) => d.charAt(0).toUpperCase() + d.slice(1))
    .join(" + ");

  const budgetStr = pricing.tier !== "Standard" ? ` (${pricing.tier})` : "";
  const msg = encodeURIComponent(
    `Hi Mr. Sundar! I'm interested in "${pkg.name}" (${pkg.durationLabel})${budgetStr} for ${groupSize} person${groupSize > 1 ? "s" : ""}. ` +
    (intent.durationDays ? `Approx ${intent.durationDays} days. ` : "") +
    `Destinations: ${destinations}. Please confirm availability and share a full quote. Thank you!`
  );

  return `https://wa.me/919952703765?text=${msg}`;
}

// ── Main Orchestrator ─────────────────────────────────────────────────────────

async function recommend(query, travelDate) {
  // Load live data (cached, non-blocking fallback)
  const live = await loadLiveData();
  const season = getSeasonInfo(travelDate);

  // Agent 0: Intent classification
  const intentType = classifyIntent(query);

  // Handle FAQ intent
  if (intentType === "faq") {
    const faq = matchFAQ(query);
    if (faq) {
      return {
        intentType: "faq",
        answer: faq.answer,
        cta: faq.cta,
        packages: [],
        summary: null,
        season,
      };
    }
    // If no FAQ match, fall through to package search
  }

  // Handle destination info intent
  if (intentType === "destination_info") {
    const dest = matchDestinationInfo(query);
    if (dest) {
      return {
        intentType: "destination_info",
        destination: dest,
        answer: null,
        packages: [],
        summary: `Here is everything about ${dest.name}:`,
        season,
      };
    }
    // Fall through to package search
  }

  // Package booking intent
  const intent = extractIntent(query);

  const scored = PACKAGE_META
    .map((pkg) => ({ pkg, score: scorePackage(pkg, intent) }))
    .sort((a, b) => b.score - a.score)
    .slice(0, 3);

  const results = scored.map(({ pkg }) => {
    const livePrice = live.prices ? live.prices[pkg.id] : null;
    const statusData = live.status ? live.status[pkg.id] : null;
    const pricing = calculatePrice(pkg, intent.budgetTier, intent.groupSize, livePrice, season);
    const availability = getStatusBadge(statusData);
    const whatsappLink = buildWhatsAppLink(pkg, pricing, intent.groupSize, intent);

    return {
      id: pkg.id,
      name: pkg.name,
      badge: pkg.badge,
      duration: pkg.durationLabel,
      destinations: pkg.destinations,
      pricing,
      availability,
      whatsappLink,
      priceIsLive: pricing.isLive,
    };
  });

  const destNames = intent.destinations
    .map((d) => d.charAt(0).toUpperCase() + d.slice(1))
    .join(", ");

  const summary = intent.destinations.length
    ? `Best packages for ${destNames}${intent.durationDays ? ` · ${intent.durationDays} days` : ""}:`
    : "Top South India packages matching your trip:";

  return {
    intentType: "book",
    packages: results,
    answer: null,
    summary,
    season,
    intent,
  };
}

module.exports = { recommend };
