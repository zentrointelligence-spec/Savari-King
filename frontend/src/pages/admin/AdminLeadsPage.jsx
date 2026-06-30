import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  MessageCircle,
  Phone,
  Globe,
  Users,
  TrendingUp,
  Clock,
  CheckCircle,
  XCircle,
  Download,
  RefreshCw,
  Zap,
  Eye,
} from "lucide-react";

// Simulated lead data matching sources from the landing page
const MOCK_LEADS = [
  {
    id: 1,
    name: "James & Rachel",
    country: "UK",
    flag: "🇬🇧",
    email: "james.rachel@gmail.com",
    phone: "+44 7700 900123",
    source: "Hero CTA — Book Your Journey",
    tour: "The Southern Crown (6 Days)",
    dates: "Aug 15 – Aug 21, 2026",
    groupSize: "2",
    status: "confirmed",
    currency: "GBP",
    value: 680,
    createdAt: "2026-06-28 09:14",
    lastContact: "2026-06-29",
    aiSummary: "Couple from UK interested in 6-day package. High intent — provided exact dates. Budget tier: Comfort. Follow-up: confirm hotel choice.",
    whatsappDraft: "Hi James & Rachel! Thank you for your interest in The Southern Crown package. I've noted your dates Aug 15–21. I'll send you the Comfort tier hotel options and full itinerary shortly. — Sundar, Ebenezer Tours",
    notes: "Requested sea-facing room in Kovalam.",
  },
  {
    id: 2,
    name: "Ahmed Al-Rashid",
    country: "UAE",
    flag: "🇦🇪",
    email: "ahmed.alrashid@outlook.com",
    phone: "+971 50 123 4567",
    source: "Package Card — The Southern Crown",
    tour: "The Southern Crown (6 Days)",
    dates: "Sep 5 – Sep 11, 2026",
    groupSize: "4",
    status: "new",
    currency: "AED",
    value: 1200,
    createdAt: "2026-06-30 11:02",
    lastContact: null,
    aiSummary: "Family of 4 from Dubai. High-value lead. Needs halal food options. Interested in premium tier. Fast responder.",
    whatsappDraft: "Hello Ahmed! Welcome to Ebenezer Tours & Travels. Thank you for your inquiry about our Southern Crown package. For a group of 4, I have some great Premium tier options. Also wanted to confirm — we can arrange halal meals during your stay. When is a good time to call? — Sundar",
    notes: "",
  },
  {
    id: 3,
    name: "Sophie Müller",
    country: "Germany",
    flag: "🇩🇪",
    email: "sophie.muller@web.de",
    phone: "+49 170 1234567",
    source: "Contact Form — Website",
    tour: "Custom Itinerary",
    dates: "Oct 10 – Oct 18, 2026",
    groupSize: "1",
    status: "quoted",
    currency: "EUR",
    value: 420,
    createdAt: "2026-06-25 14:30",
    lastContact: "2026-06-27",
    aiSummary: "Solo female traveller. Safety is priority. 8-day custom request. Quote sent. Awaiting confirmation. Mention security protocols.",
    whatsappDraft: "Hi Sophie! Just following up on the custom 8-day itinerary I sent. Do let me know if you have any questions. Our vehicles are GPS-tracked and I personally accompany guests on key legs. — Sundar",
    notes: "Sent quote on Jun 27. Waiting for reply.",
  },
  {
    id: 4,
    name: "Ramesh & Family",
    country: "India",
    flag: "🇮🇳",
    email: "ramesh.k@yahoo.in",
    phone: "+91 98401 23456",
    source: "WhatsApp Direct",
    tour: "Kanyakumari One-Day Sightseeing",
    dates: "Jul 4, 2026",
    groupSize: "6",
    status: "confirmed",
    currency: "INR",
    value: 12000,
    createdAt: "2026-06-28 16:45",
    lastContact: "2026-06-29",
    aiSummary: "Local family with elderly parents and children. One-day Kanyakumari trip. Confirmed. Need comfortable stops and early morning departure.",
    whatsappDraft: "Namaste Ramesh ji! Your Kanyakumari one-day trip on Jul 4 is confirmed. Driver will reach your address by 4:30 AM for the sunrise. I'll send the full itinerary tonight. — Sundar",
    notes: "Elderly parents — need rest stops every 2 hours.",
  },
  {
    id: 5,
    name: "Priya Nair",
    country: "India",
    flag: "🇮🇳",
    email: "priya.nair@gmail.com",
    phone: "+91 94470 56789",
    source: "Sticky WhatsApp Button",
    tour: "Kerala Coastal Trail (4 Days)",
    dates: "Jul 12 – Jul 15, 2026",
    groupSize: "2",
    status: "new",
    currency: "INR",
    value: 28000,
    createdAt: "2026-06-30 08:22",
    lastContact: null,
    aiSummary: "Local traveller from Trivandrum. Short trip request. Good upsell opportunity to Southern Crown. Flexible on dates.",
    whatsappDraft: "Hi Priya! Thank you for reaching out. The 4-day Kerala Coastal Trail sounds perfect for your July dates. I have availability and can also show you an upgraded 6-day option that includes Kanyakumari — many local guests love it. Shall I send both options? — Sundar",
    notes: "",
  },
  {
    id: 6,
    name: "Arjun Krishnamurthy",
    country: "India",
    flag: "🇮🇳",
    email: "arjun.k@hotmail.com",
    phone: "+91 96000 78901",
    source: "Destination Card: Kochi",
    tour: "South to Spice Trail (8 Days)",
    dates: "Aug 1 – Aug 9, 2026",
    groupSize: "3",
    status: "lost",
    currency: "INR",
    value: 0,
    createdAt: "2026-06-20 10:00",
    lastContact: "2026-06-22",
    aiSummary: "Budget concern — found cheaper self-drive option. Could re-engage with a Kanyakumari + Trivandrum 3-day package offer.",
    whatsappDraft: "Hi Arjun, hope your trip went well! We're running a special discount on our 3-day Kanyakumari package this August. Interested? — Sundar",
    notes: "Said price was too high. Competing with self-drive.",
  },
];

const STATUS_CONFIG = {
  new: { label: "New", color: "bg-blue-100 text-blue-700 border-blue-200", dot: "bg-blue-500" },
  quoted: { label: "Quote Sent", color: "bg-yellow-100 text-yellow-700 border-yellow-200", dot: "bg-yellow-500" },
  confirmed: { label: "Confirmed", color: "bg-green-100 text-green-700 border-green-200", dot: "bg-green-500" },
  lost: { label: "Lost", color: "bg-red-100 text-red-600 border-red-200", dot: "bg-red-400" },
};

const SOURCE_COLORS = {
  "Hero": "bg-purple-100 text-purple-700",
  "Package": "bg-blue-100 text-blue-700",
  "Contact": "bg-teal-100 text-teal-700",
  "WhatsApp": "bg-green-100 text-green-700",
  "Destination": "bg-orange-100 text-orange-700",
  "Sticky": "bg-pink-100 text-pink-700",
};

const getSourceColor = (source) => {
  for (const [key, cls] of Object.entries(SOURCE_COLORS)) {
    if (source.includes(key)) return cls;
  }
  return "bg-gray-100 text-gray-700";
};

const WHATSAPP_NUMBER = "919952703765";

const LeadDetailPanel = ({ lead, onClose, onStatusChange }) => {
  const [showAI, setShowAI] = useState(false);
  const [copied, setCopied] = useState(false);

  const copyDraft = () => {
    navigator.clipboard.writeText(lead.whatsappDraft);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const openWhatsApp = () => {
    window.open(`https://wa.me/${lead.phone.replace(/\D/g, "")}?text=${encodeURIComponent(lead.whatsappDraft)}`, "_blank");
  };

  return (
    <motion.div
      initial={{ opacity: 0, x: 40 }}
      animate={{ opacity: 1, x: 0 }}
      exit={{ opacity: 0, x: 40 }}
      className="fixed inset-y-0 right-0 w-full max-w-lg bg-white shadow-2xl z-50 flex flex-col overflow-hidden"
    >
      <div className="flex items-center justify-between p-5 border-b border-gray-100 bg-gray-50">
        <div className="flex items-center gap-3">
          <span className="text-2xl">{lead.flag}</span>
          <div>
            <h3 className="font-semibold text-gray-900">{lead.name}</h3>
            <p className="text-xs text-gray-500">{lead.country} · Added {lead.createdAt}</p>
          </div>
        </div>
        <button onClick={onClose} className="p-2 hover:bg-gray-200 rounded-lg text-gray-500 transition-colors">
          <XCircle size={18} />
        </button>
      </div>

      <div className="flex-1 overflow-y-auto p-5 space-y-5">
        {/* Status */}
        <div className="flex items-center gap-3 flex-wrap">
          {Object.entries(STATUS_CONFIG).map(([key, cfg]) => (
            <button
              key={key}
              onClick={() => onStatusChange(lead.id, key)}
              className={`text-xs px-3 py-1.5 rounded-full border font-medium transition-all ${
                lead.status === key ? cfg.color + " ring-2 ring-offset-1 ring-current" : "bg-gray-50 text-gray-500 border-gray-200 hover:bg-gray-100"
              }`}
            >
              {cfg.label}
            </button>
          ))}
        </div>

        {/* Contact Info */}
        <div className="bg-gray-50 rounded-xl p-4 space-y-2.5">
          <p className="text-xs font-semibold text-gray-400 uppercase tracking-wider">Contact</p>
          <div className="flex items-center gap-2 text-sm text-gray-700">
            <Phone size={14} className="text-gray-400" />
            <a href={`tel:${lead.phone}`} className="hover:text-green-600">{lead.phone}</a>
          </div>
          <div className="flex items-center gap-2 text-sm text-gray-700">
            <Globe size={14} className="text-gray-400" />
            <a href={`mailto:${lead.email}`} className="hover:text-blue-600">{lead.email}</a>
          </div>
        </div>

        {/* Trip Details */}
        <div className="bg-gray-50 rounded-xl p-4 space-y-2.5">
          <p className="text-xs font-semibold text-gray-400 uppercase tracking-wider">Trip Details</p>
          <div className="grid grid-cols-2 gap-3 text-sm">
            <div>
              <p className="text-gray-400 text-xs">Tour</p>
              <p className="text-gray-800 font-medium">{lead.tour}</p>
            </div>
            <div>
              <p className="text-gray-400 text-xs">Group Size</p>
              <p className="text-gray-800 font-medium">{lead.groupSize} pax</p>
            </div>
            <div>
              <p className="text-gray-400 text-xs">Travel Dates</p>
              <p className="text-gray-800 font-medium">{lead.dates}</p>
            </div>
            <div>
              <p className="text-gray-400 text-xs">Est. Value</p>
              <p className="text-gray-800 font-medium">
                {lead.currency} {lead.value.toLocaleString()}
              </p>
            </div>
          </div>
        </div>

        {/* Source */}
        <div className="flex items-center gap-2">
          <span className="text-xs text-gray-500">Lead source:</span>
          <span className={`text-xs px-2 py-1 rounded-full ${getSourceColor(lead.source)}`}>
            {lead.source}
          </span>
        </div>

        {/* Notes */}
        {lead.notes && (
          <div className="bg-yellow-50 border border-yellow-200 rounded-xl p-4">
            <p className="text-xs font-semibold text-yellow-600 mb-1">Notes</p>
            <p className="text-sm text-yellow-800">{lead.notes}</p>
          </div>
        )}

        {/* AI Assistant */}
        <div className="border border-purple-200 rounded-xl overflow-hidden">
          <button
            onClick={() => setShowAI((v) => !v)}
            className="w-full flex items-center justify-between p-4 bg-purple-50 hover:bg-purple-100 transition-colors"
          >
            <div className="flex items-center gap-2">
              <Zap size={16} className="text-purple-600" />
              <span className="text-sm font-semibold text-purple-800">AI Lead Assistant</span>
            </div>
            <span className="text-xs text-purple-500">{showAI ? "Hide" : "Show"}</span>
          </button>

          {showAI && (
            <div className="p-4 space-y-4 bg-white">
              <div>
                <p className="text-xs font-semibold text-gray-500 mb-2">Lead Summary</p>
                <p className="text-sm text-gray-700 leading-relaxed bg-gray-50 rounded-lg p-3">
                  {lead.aiSummary}
                </p>
              </div>
              <div>
                <p className="text-xs font-semibold text-gray-500 mb-2">Suggested WhatsApp Reply</p>
                <p className="text-sm text-gray-700 leading-relaxed bg-green-50 rounded-lg p-3 border border-green-100">
                  {lead.whatsappDraft}
                </p>
                <div className="flex gap-2 mt-3">
                  <button
                    onClick={copyDraft}
                    className="flex-1 text-xs py-2 rounded-lg border border-gray-200 hover:bg-gray-50 text-gray-600 transition-colors"
                  >
                    {copied ? "Copied!" : "Copy Draft"}
                  </button>
                  <button
                    onClick={openWhatsApp}
                    className="flex-1 text-xs py-2 rounded-lg bg-green-600 hover:bg-green-700 text-white font-semibold transition-colors flex items-center justify-center gap-1.5"
                  >
                    <MessageCircle size={13} />
                    Send via WhatsApp
                  </button>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Quick Actions Footer */}
      <div className="p-4 border-t border-gray-100 flex gap-3">
        <a
          href={`https://wa.me/${WHATSAPP_NUMBER}?text=${encodeURIComponent(`Lead: ${lead.name} | Tour: ${lead.tour}`)}`}
          target="_blank"
          rel="noopener noreferrer"
          className="flex-1 flex items-center justify-center gap-2 bg-green-600 hover:bg-green-700 text-white text-sm py-2.5 rounded-xl font-semibold transition-colors"
        >
          <MessageCircle size={16} />
          WhatsApp
        </a>
        <a
          href={`mailto:${lead.email}`}
          className="flex-1 flex items-center justify-center gap-2 bg-blue-600 hover:bg-blue-700 text-white text-sm py-2.5 rounded-xl font-semibold transition-colors"
        >
          <Globe size={16} />
          Email
        </a>
      </div>
    </motion.div>
  );
};

const AdminLeadsPage = () => {
  const [leads, setLeads] = useState(MOCK_LEADS);
  const [statusFilter, setStatusFilter] = useState("all");
  const [sourceFilter, setSourceFilter] = useState("all");
  const [search, setSearch] = useState("");
  const [selectedLead, setSelectedLead] = useState(null);
  const [isRefreshing, setIsRefreshing] = useState(false);

  const handleRefresh = () => {
    setIsRefreshing(true);
    setTimeout(() => setIsRefreshing(false), 1200);
  };

  const handleStatusChange = (id, newStatus) => {
    setLeads((prev) =>
      prev.map((l) => (l.id === id ? { ...l, status: newStatus } : l))
    );
    if (selectedLead?.id === id) {
      setSelectedLead((prev) => ({ ...prev, status: newStatus }));
    }
  };

  const filtered = leads.filter((l) => {
    const matchStatus = statusFilter === "all" || l.status === statusFilter;
    const matchSource = sourceFilter === "all" || l.source.toLowerCase().includes(sourceFilter.toLowerCase());
    const matchSearch =
      !search ||
      l.name.toLowerCase().includes(search.toLowerCase()) ||
      l.country.toLowerCase().includes(search.toLowerCase()) ||
      l.tour.toLowerCase().includes(search.toLowerCase()) ||
      l.email.toLowerCase().includes(search.toLowerCase());
    return matchStatus && matchSource && matchSearch;
  });

  const stats = {
    total: leads.length,
    new: leads.filter((l) => l.status === "new").length,
    confirmed: leads.filter((l) => l.status === "confirmed").length,
    totalValue: leads.filter((l) => l.currency === "INR").reduce((s, l) => s + l.value, 0),
  };

  const sources = [...new Set(leads.map((l) => l.source.split("—")[0].trim()))];

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white border-b border-gray-200 px-6 py-5">
        <div className="flex items-center justify-between flex-wrap gap-4">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">Lead Management</h1>
            <p className="text-sm text-gray-500 mt-0.5">All inquiries from website, WhatsApp, and referrals</p>
          </div>
          <div className="flex items-center gap-3">
            <button
              onClick={handleRefresh}
              className="flex items-center gap-2 text-sm text-gray-600 bg-gray-100 hover:bg-gray-200 px-3 py-2 rounded-lg transition-colors"
            >
              <RefreshCw size={14} className={isRefreshing ? "animate-spin" : ""} />
              Refresh
            </button>
            <button className="flex items-center gap-2 text-sm text-white bg-green-600 hover:bg-green-700 px-4 py-2 rounded-lg font-semibold transition-colors">
              <Download size={14} />
              Export CSV
            </button>
          </div>
        </div>
      </div>

      {/* Stats Strip */}
      <div className="px-6 py-4 grid grid-cols-2 sm:grid-cols-4 gap-4">
        {[
          { label: "Total Leads", value: stats.total, icon: Users, color: "text-blue-600 bg-blue-50" },
          { label: "New / Unread", value: stats.new, icon: Clock, color: "text-yellow-600 bg-yellow-50" },
          { label: "Confirmed", value: stats.confirmed, icon: CheckCircle, color: "text-green-600 bg-green-50" },
          { label: "Pipeline (INR)", value: `₹${stats.totalValue.toLocaleString("en-IN")}`, icon: TrendingUp, color: "text-purple-600 bg-purple-50" },
        ].map((s) => (
          <div key={s.label} className="bg-white rounded-xl p-4 border border-gray-100 flex items-center gap-4">
            <div className={`w-10 h-10 rounded-lg flex items-center justify-center ${s.color}`}>
              <s.icon size={18} />
            </div>
            <div>
              <p className="text-2xl font-bold text-gray-900">{s.value}</p>
              <p className="text-xs text-gray-500">{s.label}</p>
            </div>
          </div>
        ))}
      </div>

      {/* Filters */}
      <div className="px-6 pb-4 flex flex-wrap items-center gap-3">
        <input
          type="text"
          placeholder="Search name, country, tour…"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="border border-gray-200 rounded-lg px-3 py-2 text-sm text-gray-700 focus:outline-none focus:border-green-400 w-60"
        />
        <select
          value={statusFilter}
          onChange={(e) => setStatusFilter(e.target.value)}
          className="border border-gray-200 rounded-lg px-3 py-2 text-sm text-gray-700 focus:outline-none focus:border-green-400"
        >
          <option value="all">All Statuses</option>
          {Object.entries(STATUS_CONFIG).map(([key, cfg]) => (
            <option key={key} value={key}>{cfg.label}</option>
          ))}
        </select>
        <select
          value={sourceFilter}
          onChange={(e) => setSourceFilter(e.target.value)}
          className="border border-gray-200 rounded-lg px-3 py-2 text-sm text-gray-700 focus:outline-none focus:border-green-400"
        >
          <option value="all">All Sources</option>
          {sources.map((s) => (
            <option key={s} value={s}>{s}</option>
          ))}
        </select>
        <span className="text-xs text-gray-400">{filtered.length} of {leads.length} leads</span>
      </div>

      {/* Leads Table */}
      <div className="px-6 pb-8">
        <div className="bg-white rounded-2xl border border-gray-100 overflow-hidden shadow-sm">
          {/* Column Headers */}
          <div className="grid grid-cols-12 gap-3 px-5 py-3 bg-gray-50 border-b border-gray-100 text-xs font-semibold text-gray-400 uppercase tracking-wider">
            <div className="col-span-3">Name / Country</div>
            <div className="col-span-3">Tour</div>
            <div className="col-span-2">Source</div>
            <div className="col-span-2">Status</div>
            <div className="col-span-1">Value</div>
            <div className="col-span-1">Action</div>
          </div>

          <AnimatePresence>
            {filtered.length === 0 ? (
              <div className="py-16 text-center text-gray-400">
                <Users size={32} className="mx-auto mb-3 opacity-40" />
                <p className="text-sm">No leads match your filters.</p>
              </div>
            ) : (
              filtered.map((lead, i) => {
                const sc = STATUS_CONFIG[lead.status];
                return (
                  <motion.div
                    key={lead.id}
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: i * 0.04 }}
                    onClick={() => setSelectedLead(lead)}
                    className="grid grid-cols-12 gap-3 items-center px-5 py-4 border-b border-gray-50 hover:bg-green-50/40 cursor-pointer transition-colors group"
                  >
                    <div className="col-span-3 flex items-center gap-3 min-w-0">
                      <span className="text-xl flex-shrink-0">{lead.flag}</span>
                      <div className="min-w-0">
                        <p className="text-sm font-semibold text-gray-900 truncate">{lead.name}</p>
                        <p className="text-xs text-gray-400 truncate">{lead.country} · {lead.createdAt.split(" ")[0]}</p>
                      </div>
                    </div>
                    <div className="col-span-3 min-w-0">
                      <p className="text-sm text-gray-700 truncate">{lead.tour}</p>
                      <p className="text-xs text-gray-400">{lead.dates}</p>
                    </div>
                    <div className="col-span-2">
                      <span className={`text-xs px-2 py-1 rounded-full ${getSourceColor(lead.source)}`}>
                        {lead.source.split("—")[0].trim()}
                      </span>
                    </div>
                    <div className="col-span-2">
                      <span className={`inline-flex items-center gap-1.5 text-xs px-2.5 py-1 rounded-full border font-medium ${sc.color}`}>
                        <span className={`w-1.5 h-1.5 rounded-full ${sc.dot}`} />
                        {sc.label}
                      </span>
                    </div>
                    <div className="col-span-1 text-sm font-semibold text-gray-700">
                      {lead.value > 0 ? `${lead.currency} ${lead.value.toLocaleString()}` : <span className="text-gray-300">—</span>}
                    </div>
                    <div className="col-span-1">
                      <button className="p-1.5 rounded-lg text-gray-400 hover:text-green-600 hover:bg-green-50 transition-colors group-hover:opacity-100 opacity-0">
                        <Eye size={16} />
                      </button>
                    </div>
                  </motion.div>
                );
              })
            )}
          </AnimatePresence>
        </div>
      </div>

      {/* Detail Side Panel */}
      <AnimatePresence>
        {selectedLead && (
          <>
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 0.4 }}
              exit={{ opacity: 0 }}
              onClick={() => setSelectedLead(null)}
              className="fixed inset-0 bg-black z-40"
            />
            <LeadDetailPanel
              lead={selectedLead}
              onClose={() => setSelectedLead(null)}
              onStatusChange={handleStatusChange}
            />
          </>
        )}
      </AnimatePresence>
    </div>
  );
};

export default AdminLeadsPage;
