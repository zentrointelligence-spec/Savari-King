import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  Compass, X, MapPin, Calendar, ChevronRight, MessageCircle,
  Loader, HelpCircle, Info, CheckCircle, AlertCircle, Clock,
} from "lucide-react";

const WHATSAPP = "https://wa.me/919952703765";

const QUICK_CHIPS = [
  { label: "Day Trip",        query: "day trip to Kanyakumari" },
  { label: "Family Tour",     query: "family tour South India 6 days" },
  { label: "Honeymoon",       query: "romantic honeymoon Ooty hills" },
  { label: "Pilgrimage",      query: "Madurai temple pilgrimage" },
  { label: "Hill Station",    query: "Ooty Kodaikanal hills 4 days" },
  { label: "Grand Tour",      query: "complete South India 12 days" },
  { label: "What's included?", query: "what is included in the package" },
  { label: "Best time?",      query: "best time to visit South India" },
  { label: "How to book?",    query: "how to book a tour" },
  { label: "About Ooty",      query: "tell me about Ooty" },
  { label: "About Madurai",   query: "tell me about Madurai" },
  { label: "Group discount",  query: "group discount" },
];

// ── Availability badge ──────────────────────────────────────────────────────
const AvailabilityBadge = ({ avail }) => {
  const icons = { green: CheckCircle, orange: AlertCircle, red: X, blue: Info };
  const colors = {
    green:  "text-emerald-600 dark:text-emerald-400 bg-emerald-50 dark:bg-emerald-950/40 border-emerald-200 dark:border-emerald-800",
    orange: "text-amber-600  dark:text-amber-400  bg-amber-50  dark:bg-amber-950/40  border-amber-200  dark:border-amber-800",
    red:    "text-red-600    dark:text-red-400    bg-red-50    dark:bg-red-950/40    border-red-200    dark:border-red-800",
    blue:   "text-blue-600   dark:text-blue-400   bg-blue-50   dark:bg-blue-950/40   border-blue-200   dark:border-blue-800",
  };
  const Icon = icons[avail.color] || CheckCircle;
  return (
    <span className={`inline-flex items-center gap-1 text-[10px] font-body font-medium px-1.5 py-0.5 rounded-sm border ${colors[avail.color]}`}>
      <Icon size={9} />
      {avail.label}
    </span>
  );
};

// ── Season badge ────────────────────────────────────────────────────────────
const SeasonBadge = ({ season }) => {
  if (!season?.note) return null;
  return (
    <div className="flex items-center gap-1.5 text-[11px] font-body text-amber-700 dark:text-amber-400 bg-amber-50 dark:bg-amber-950/30 border border-amber-200 dark:border-amber-700 rounded-sm px-2 py-1.5 mb-3">
      <Clock size={11} className="shrink-0" />
      <span>{season.label}: {season.note}</span>
    </div>
  );
};

// ── Package card ────────────────────────────────────────────────────────────
const PackageCard = ({ pkg }) => (
  <div className="bg-ivory/60 dark:bg-[#0D160D] border border-charcoal/10 dark:border-ivory/10 rounded-sm p-4 hover:border-gold/50 transition-all">
    <div className="flex items-start justify-between mb-2">
      <div className="flex items-center gap-2 flex-wrap">
        <span className="font-accent text-[10px] tracking-[0.2em] uppercase bg-gold text-forest px-2 py-0.5 rounded-sm">
          {pkg.badge}
        </span>
        {pkg.availability && <AvailabilityBadge avail={pkg.availability} />}
        {pkg.priceIsLive && (
          <span className="font-body text-[9px] text-emerald-600 dark:text-emerald-400 border border-emerald-200 dark:border-emerald-800 px-1.5 py-0.5 rounded-sm">
            LIVE PRICE
          </span>
        )}
      </div>
      <span className="font-body text-xs text-charcoal/50 dark:text-ivory/40 flex items-center gap-1 shrink-0 ml-2">
        <Calendar size={11} /> {pkg.duration}
      </span>
    </div>

    <h4 className="font-display text-lg text-forest dark:text-ivory font-semibold mt-2 mb-1">
      {pkg.name}
    </h4>

    <div className="flex flex-wrap gap-1 mb-3">
      {pkg.destinations.slice(0, 4).map((d) => (
        <span key={d} className="inline-flex items-center gap-0.5 font-body text-[11px] text-charcoal/60 dark:text-ivory/50 border border-charcoal/10 dark:border-ivory/10 px-1.5 py-0.5 rounded-sm">
          <MapPin size={9} className="text-gold" />
          {d.charAt(0).toUpperCase() + d.slice(1)}
        </span>
      ))}
    </div>

    {pkg.availability?.note && (
      <p className="font-body text-[10px] text-amber-600 dark:text-amber-400 mb-2">
        {pkg.availability.note}
      </p>
    )}

    <div className="flex items-end justify-between">
      <div>
        <p className="font-body text-[11px] text-charcoal/50 dark:text-ivory/40">
          From ({pkg.pricing.tier})
        </p>
        <p className="font-display text-xl text-forest dark:text-gold font-semibold">
          ₹{pkg.pricing.perPerson.toLocaleString("en-IN")}
          <span className="font-body text-xs text-charcoal/40 dark:text-ivory/30 font-normal"> /person</span>
        </p>
        {pkg.pricing.note && (
          <p className="font-body text-[10px] text-gold mt-0.5">{pkg.pricing.note}</p>
        )}
      </div>
      <a
        href={pkg.whatsappLink}
        target="_blank"
        rel="noopener noreferrer"
        onClick={() => console.log(`Lead Source Tracker -> Source: Travel Advisor → ${pkg.name}`)}
        className="flex items-center gap-1.5 font-body text-xs font-semibold bg-forest dark:bg-gold text-ivory dark:text-forest px-3 py-2 rounded-sm hover:bg-charcoal dark:hover:bg-gold/80 transition-all shrink-0"
      >
        <MessageCircle size={13} />
        Book Now
      </a>
    </div>
  </div>
);

// ── FAQ / text answer card ──────────────────────────────────────────────────
const AnswerCard = ({ answer, cta }) => (
  <div className="bg-ivory/80 dark:bg-[#0D160D] border border-charcoal/10 dark:border-ivory/10 rounded-sm p-4">
    <div className="flex items-center gap-2 mb-3">
      <HelpCircle size={15} className="text-gold shrink-0" />
      <span className="font-accent text-[10px] tracking-[0.2em] uppercase text-charcoal/50 dark:text-ivory/40">
        Answer
      </span>
    </div>
    <div className="font-body text-sm text-charcoal/80 dark:text-ivory/80 leading-relaxed whitespace-pre-line">
      {answer}
    </div>
    {cta && (
      <a
        href={cta.link}
        target="_blank"
        rel="noopener noreferrer"
        onClick={() => console.log(`Lead Source Tracker -> Source: Travel Advisor FAQ CTA → ${cta.label}`)}
        className="mt-4 inline-flex items-center gap-2 font-body text-sm font-semibold bg-forest dark:bg-gold text-ivory dark:text-forest px-4 py-2.5 rounded-sm hover:bg-charcoal dark:hover:bg-gold/80 transition-all"
      >
        <MessageCircle size={14} />
        {cta.label}
      </a>
    )}
  </div>
);

// ── Destination info card ───────────────────────────────────────────────────
const DestinationCard = ({ dest }) => (
  <div className="bg-ivory/80 dark:bg-[#0D160D] border border-charcoal/10 dark:border-ivory/10 rounded-sm overflow-hidden">
    <div className="bg-forest px-4 py-3">
      <div className="flex items-center gap-2">
        <Info size={15} className="text-gold shrink-0" />
        <div>
          <p className="font-display text-base text-ivory font-semibold">{dest.name}</p>
          <p className="font-body text-xs text-ivory/60">{dest.tagline}</p>
        </div>
      </div>
    </div>
    <div className="p-4 space-y-3">
      <p className="font-body text-sm text-charcoal/80 dark:text-ivory/80 leading-relaxed">
        {dest.overview}
      </p>

      <div>
        <p className="font-accent text-[10px] tracking-[0.18em] uppercase text-charcoal/40 dark:text-ivory/30 mb-1.5">
          Must See
        </p>
        <ul className="space-y-1">
          {dest.mustSee.slice(0, 5).map((item) => (
            <li key={item} className="flex items-start gap-1.5 font-body text-xs text-charcoal/70 dark:text-ivory/70">
              <MapPin size={10} className="text-gold mt-0.5 shrink-0" />
              {item}
            </li>
          ))}
        </ul>
      </div>

      <div className="grid grid-cols-2 gap-3 text-xs font-body">
        <div>
          <p className="text-charcoal/40 dark:text-ivory/30 text-[10px] uppercase tracking-wider mb-0.5">Best Time</p>
          <p className="text-charcoal/80 dark:text-ivory/80">{dest.bestTime}</p>
        </div>
        <div>
          <p className="text-charcoal/40 dark:text-ivory/30 text-[10px] uppercase tracking-wider mb-0.5">Distance</p>
          <p className="text-charcoal/80 dark:text-ivory/80">{dest.distance}</p>
        </div>
      </div>

      {dest.tip && (
        <div className="bg-gold/10 border border-gold/30 rounded-sm px-3 py-2">
          <p className="font-body text-[11px] text-charcoal/80 dark:text-ivory/80">
            <span className="font-semibold text-gold">Tip: </span>{dest.tip}
          </p>
        </div>
      )}

      <a
        href={WHATSAPP}
        target="_blank"
        rel="noopener noreferrer"
        onClick={() => console.log(`Lead Source Tracker -> Source: Travel Advisor Destination → ${dest.name}`)}
        className="flex items-center justify-center gap-2 font-body text-sm font-semibold bg-forest dark:bg-gold text-ivory dark:text-forest px-4 py-2.5 rounded-sm hover:bg-charcoal dark:hover:bg-gold/80 transition-all w-full mt-1"
      >
        <MessageCircle size={14} />
        Book a Trip to {dest.name}
      </a>
    </div>
  </div>
);

// ── Main TravelAdvisor component ─────────────────────────────────────────────
const TravelAdvisor = () => {
  const [open, setOpen] = useState(false);
  const [query, setQuery] = useState("");
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState(null);
  const [error, setError] = useState(null);
  const [showAllChips, setShowAllChips] = useState(false);

  const search = async (searchQuery) => {
    const q = searchQuery || query;
    if (!q.trim()) return;
    setLoading(true);
    setError(null);
    setResult(null);
    try {
      const res = await fetch("/api/recommend", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ query: q }),
      });
      if (!res.ok) throw new Error("Server error");
      const data = await res.json();
      console.log(`Lead Source Tracker -> Source: Travel Advisor Query → "${q}"`);
      setResult(data);
    } catch {
      setError("Couldn't connect to the server. Please WhatsApp Mr. Sundar directly!");
    } finally {
      setLoading(false);
    }
  };

  const handleChip = (chip) => {
    setQuery(chip.query);
    search(chip.query);
  };

  const visibleChips = showAllChips ? QUICK_CHIPS : QUICK_CHIPS.slice(0, 6);

  return (
    <>
      {/* Floating trigger */}
      <button
        onClick={() => setOpen(true)}
        className="fixed bottom-20 md:bottom-8 right-4 md:right-6 z-40 flex items-center gap-2 bg-forest dark:bg-gold text-ivory dark:text-forest font-body font-semibold text-sm px-4 py-3 rounded-sm shadow-[0_8px_30px_rgba(26,46,26,0.4)] hover:bg-charcoal dark:hover:bg-gold/90 transition-all animate-cta-pulse"
        aria-label="Find my tour"
      >
        <Compass size={18} />
        Find My Tour
      </button>

      <AnimatePresence>
        {open && (
          <>
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 0.5 }}
              exit={{ opacity: 0 }}
              onClick={() => setOpen(false)}
              className="fixed inset-0 bg-black z-40"
            />

            <motion.div
              initial={{ opacity: 0, y: 60 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: 60 }}
              transition={{ type: "spring", damping: 28, stiffness: 300 }}
              className="fixed bottom-0 md:bottom-8 right-0 md:right-6 z-50 w-full md:w-[440px] max-h-[92vh] bg-ivory dark:bg-[#162016] rounded-t-2xl md:rounded-sm shadow-2xl flex flex-col overflow-hidden border border-charcoal/10 dark:border-ivory/10"
            >
              {/* Header */}
              <div className="flex items-center justify-between p-5 border-b border-charcoal/10 dark:border-ivory/10 bg-forest shrink-0">
                <div className="flex items-center gap-3">
                  <Compass size={20} className="text-gold" />
                  <div>
                    <p className="font-display text-lg text-ivory font-semibold">Tour Advisor</p>
                    <p className="font-body text-xs text-ivory/60">Ask anything — packages, places, pricing</p>
                  </div>
                </div>
                <button onClick={() => setOpen(false)} className="text-ivory/60 hover:text-gold transition-colors p-1">
                  <X size={20} />
                </button>
              </div>

              {/* Body */}
              <div className="flex-1 overflow-y-auto p-5 space-y-4">

                {/* Quick chips */}
                <div>
                  <p className="font-accent text-[10px] tracking-[0.2em] uppercase text-charcoal/40 dark:text-ivory/30 mb-2">
                    Quick Select
                  </p>
                  <div className="flex flex-wrap gap-1.5">
                    {visibleChips.map((chip) => (
                      <button
                        key={chip.label}
                        onClick={() => handleChip(chip)}
                        className="font-body text-xs border border-charcoal/15 dark:border-ivory/15 text-charcoal/70 dark:text-ivory/70 px-2.5 py-1.5 rounded-sm hover:border-gold hover:text-gold transition-all"
                      >
                        {chip.label}
                      </button>
                    ))}
                    <button
                      onClick={() => setShowAllChips(!showAllChips)}
                      className="font-body text-xs text-charcoal/40 dark:text-ivory/30 px-2.5 py-1.5 hover:text-gold transition-colors"
                    >
                      {showAllChips ? "Less" : "+ More"}
                    </button>
                  </div>
                </div>

                {/* Search input */}
                <div>
                  <p className="font-accent text-[10px] tracking-[0.2em] uppercase text-charcoal/40 dark:text-ivory/30 mb-2">
                    Ask Anything
                  </p>
                  <div className="flex gap-2">
                    <input
                      value={query}
                      onChange={(e) => setQuery(e.target.value)}
                      onKeyDown={(e) => e.key === "Enter" && search()}
                      placeholder={`e.g. "Ooty 4 days family" or "what is included?"`}
                      className="flex-1 font-body text-sm border border-charcoal/15 dark:border-ivory/15 rounded-sm px-3 py-2.5 focus:outline-none focus:border-gold bg-white dark:bg-[#0D160D] text-charcoal dark:text-ivory placeholder:text-charcoal/30 dark:placeholder:text-ivory/30"
                    />
                    <button
                      onClick={() => search()}
                      disabled={loading || !query.trim()}
                      className="flex items-center gap-1 font-body text-sm font-semibold bg-forest text-ivory px-4 py-2.5 rounded-sm hover:bg-charcoal disabled:opacity-40 transition-all"
                    >
                      {loading ? <Loader size={16} className="animate-spin" /> : <ChevronRight size={16} />}
                    </button>
                  </div>
                </div>

                {/* Loading */}
                {loading && (
                  <div className="text-center py-8">
                    <Loader size={28} className="animate-spin text-gold mx-auto mb-3" />
                    <p className="font-body text-sm text-charcoal/50 dark:text-ivory/40">Searching…</p>
                  </div>
                )}

                {/* Error */}
                {error && (
                  <div className="bg-red-50 dark:bg-red-950/30 border border-red-200 dark:border-red-800 rounded-sm p-4">
                    <p className="font-body text-sm text-red-700 dark:text-red-400 mb-3">{error}</p>
                    <a href={WHATSAPP} target="_blank" rel="noopener noreferrer"
                       className="inline-flex items-center gap-2 font-body text-sm font-semibold bg-forest text-ivory px-3 py-2 rounded-sm">
                      <MessageCircle size={13} /> WhatsApp Mr. Sundar
                    </a>
                  </div>
                )}

                {/* FAQ answer */}
                {result?.intentType === "faq" && (
                  <AnswerCard answer={result.answer} cta={result.cta} />
                )}

                {/* Destination info */}
                {result?.intentType === "destination_info" && result.destination && (
                  <DestinationCard dest={result.destination} />
                )}

                {/* Package results */}
                {result?.intentType === "book" && result.packages?.length > 0 && (
                  <div className="space-y-3">
                    {result.season && <SeasonBadge season={result.season} />}
                    <p className="font-body text-sm text-charcoal/70 dark:text-ivory/60">{result.summary}</p>
                    {result.packages.map((pkg) => (
                      <PackageCard key={pkg.id} pkg={pkg} />
                    ))}
                    <p className="font-body text-xs text-center text-charcoal/40 dark:text-ivory/30 pt-2">
                      Want something different?{" "}
                      <a href={WHATSAPP} target="_blank" rel="noopener noreferrer" className="text-gold hover:underline">
                        WhatsApp Mr. Sundar directly
                      </a>
                    </p>
                  </div>
                )}

                {/* Idle state */}
                {!loading && !result && !error && (
                  <div className="text-center py-6">
                    <Compass size={36} className="text-gold/30 mx-auto mb-3" />
                    <p className="font-body text-sm text-charcoal/50 dark:text-ivory/40 mb-1">
                      Ask about packages, destinations, or anything else
                    </p>
                    <p className="font-body text-xs text-charcoal/30 dark:text-ivory/25">
                      e.g. "Ooty 4 days family" · "What's included?" · "About Madurai"
                    </p>
                  </div>
                )}
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </>
  );
};

export default TravelAdvisor;
