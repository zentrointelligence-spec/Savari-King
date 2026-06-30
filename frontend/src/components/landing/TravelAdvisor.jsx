import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Compass, X, MapPin, Calendar, ChevronRight, MessageCircle, Loader } from "lucide-react";

const QUICK_CHIPS = [
  { label: "Day Trip", query: "day trip to Kanyakumari" },
  { label: "Family Tour", query: "family tour South India 6 days" },
  { label: "Honeymoon", query: "romantic honeymoon hills" },
  { label: "Pilgrimage", query: "temple pilgrimage Madurai" },
  { label: "Hill Station", query: "Ooty Kodaikanal hills 4 days" },
  { label: "Grand Tour", query: "complete South India grand tour" },
];

const PackageCard = ({ pkg }) => (
  <div className="bg-ivory/60 dark:bg-[#0D160D] border border-charcoal/10 dark:border-ivory/10 rounded-sm p-4 hover:border-gold/50 transition-all">
    <div className="flex items-start justify-between mb-2">
      <span className="font-accent text-[10px] tracking-[0.2em] uppercase bg-gold text-forest px-2 py-1 rounded-sm">
        {pkg.badge}
      </span>
      <span className="font-body text-xs text-charcoal/50 dark:text-ivory/40 flex items-center gap-1">
        <Calendar size={11} /> {pkg.duration}
      </span>
    </div>
    <h4 className="font-display text-lg text-forest dark:text-ivory font-semibold mt-2 mb-1">
      {pkg.name}
    </h4>
    <div className="flex flex-wrap gap-1 mb-3">
      {pkg.destinations.slice(0, 3).map((d) => (
        <span key={d} className="inline-flex items-center gap-0.5 font-body text-[11px] text-charcoal/60 dark:text-ivory/50 border border-charcoal/10 dark:border-ivory/10 px-1.5 py-0.5 rounded-sm">
          <MapPin size={9} className="text-gold" />
          {d.charAt(0).toUpperCase() + d.slice(1)}
        </span>
      ))}
    </div>
    <div className="flex items-center justify-between">
      <div>
        <p className="font-body text-[11px] text-charcoal/50 dark:text-ivory/40">From ({pkg.pricing.tier})</p>
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
        className="flex items-center gap-1.5 font-body text-xs font-semibold bg-forest dark:bg-gold text-ivory dark:text-forest px-3 py-2 rounded-sm hover:bg-charcoal dark:hover:bg-gold/80 transition-all"
      >
        <MessageCircle size={13} />
        Book
      </a>
    </div>
  </div>
);

const TravelAdvisor = () => {
  const [open, setOpen] = useState(false);
  const [query, setQuery] = useState("");
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState(null);
  const [error, setError] = useState(null);

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
      setResult(data);
    } catch {
      setError("Couldn't fetch recommendations. Please WhatsApp us directly!");
    } finally {
      setLoading(false);
    }
  };

  const handleChip = (chip) => {
    setQuery(chip.query);
    search(chip.query);
  };

  return (
    <>
      {/* Floating trigger button — desktop bottom-right, mobile above sticky bar */}
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
            {/* Backdrop */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 0.5 }}
              exit={{ opacity: 0 }}
              onClick={() => setOpen(false)}
              className="fixed inset-0 bg-black z-40"
            />

            {/* Panel */}
            <motion.div
              initial={{ opacity: 0, y: 60 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: 60 }}
              transition={{ type: "spring", damping: 28, stiffness: 300 }}
              className="fixed bottom-0 md:bottom-8 right-0 md:right-6 z-50 w-full md:w-[420px] max-h-[90vh] bg-ivory dark:bg-[#162016] rounded-t-2xl md:rounded-sm shadow-2xl flex flex-col overflow-hidden border border-charcoal/10 dark:border-ivory/10"
            >
              {/* Header */}
              <div className="flex items-center justify-between p-5 border-b border-charcoal/10 dark:border-ivory/10 bg-forest">
                <div className="flex items-center gap-3">
                  <Compass size={20} className="text-gold" />
                  <div>
                    <p className="font-display text-lg text-ivory font-semibold">Tour Finder</p>
                    <p className="font-body text-xs text-ivory/60">Tell us what you're looking for</p>
                  </div>
                </div>
                <button
                  onClick={() => setOpen(false)}
                  className="text-ivory/60 hover:text-gold transition-colors p-1"
                >
                  <X size={20} />
                </button>
              </div>

              {/* Scrollable body */}
              <div className="flex-1 overflow-y-auto p-5 space-y-5">
                {/* Quick chips */}
                <div>
                  <p className="font-accent text-[10px] tracking-[0.2em] uppercase text-charcoal/40 dark:text-ivory/30 mb-2">
                    Quick Select
                  </p>
                  <div className="flex flex-wrap gap-2">
                    {QUICK_CHIPS.map((chip) => (
                      <button
                        key={chip.label}
                        onClick={() => handleChip(chip)}
                        className="font-body text-xs border border-charcoal/15 dark:border-ivory/15 text-charcoal/70 dark:text-ivory/70 px-3 py-1.5 rounded-sm hover:border-gold hover:text-gold transition-all"
                      >
                        {chip.label}
                      </button>
                    ))}
                  </div>
                </div>

                {/* Search input */}
                <div>
                  <p className="font-accent text-[10px] tracking-[0.2em] uppercase text-charcoal/40 dark:text-ivory/30 mb-2">
                    Describe Your Trip
                  </p>
                  <div className="flex gap-2">
                    <input
                      value={query}
                      onChange={(e) => setQuery(e.target.value)}
                      onKeyDown={(e) => e.key === "Enter" && search()}
                      placeholder="e.g. Ooty for 4 days, family of 4, mid budget"
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

                {/* Results */}
                {loading && (
                  <div className="text-center py-8">
                    <Loader size={28} className="animate-spin text-gold mx-auto mb-3" />
                    <p className="font-body text-sm text-charcoal/50 dark:text-ivory/40">Finding best packages…</p>
                  </div>
                )}

                {error && (
                  <div className="bg-red-50 dark:bg-red-950/30 border border-red-200 dark:border-red-800 rounded-sm p-4">
                    <p className="font-body text-sm text-red-700 dark:text-red-400">{error}</p>
                  </div>
                )}

                {result && (
                  <div className="space-y-3">
                    <p className="font-body text-sm text-charcoal/70 dark:text-ivory/60">{result.summary}</p>
                    {result.packages.map((pkg) => (
                      <PackageCard key={pkg.id} pkg={pkg} />
                    ))}
                    <p className="font-body text-xs text-center text-charcoal/40 dark:text-ivory/30 pt-2">
                      Want something different?{" "}
                      <a
                        href="https://wa.me/919952703765"
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-gold hover:underline"
                      >
                        WhatsApp Mr. Sundar directly
                      </a>
                    </p>
                  </div>
                )}

                {!loading && !result && !error && (
                  <div className="text-center py-6">
                    <Compass size={36} className="text-gold/30 mx-auto mb-3" />
                    <p className="font-body text-sm text-charcoal/40 dark:text-ivory/30">
                      Pick a quick option above or describe your ideal trip
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
