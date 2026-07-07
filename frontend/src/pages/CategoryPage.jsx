import { useMemo, useState, useEffect } from "react";
import { Link, useNavigate, useParams, useSearchParams } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import {
  BadgeCheck,
  Bot,
  Filter,
  LineChart,
  RefreshCw,
  Scale,
  Search,
  ShieldCheck,
  Sparkles,
} from "lucide-react";
import { getCategoryBySlug, getPoliciesByCategory } from "../data/catalog";
import { useAuth } from "../contexts/useAuth";
import { apiRequest } from "../utils/api";
import { assets } from "../assets/assets";
import HealthcareImage from "../assets/Images/Healthcare.png";
import LifeInsuranceImage from "../assets/Images/lifeinsurance.png";
import CarInsuranceImage from "../assets/Images/carinsurance.png";
import TravelInsuranceImage from "../assets/Images/travelinsurance.png";
import BusinessInsuranceImage from "../assets/Images/buisnessinsurance.png";

// Custom Insurance Category Icons
const HealthIcon = ({ className }) => (
  <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className}>
    <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" />
    <path d="M8 12h8" />
    <path d="M12 8v8" />
  </svg>
);

const CarIcon = ({ className }) => (
  <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className}>
    <path d="M19 17h2c.6 0 1-.4 1-1v-3c0-.9-.7-1.7-1.5-1.9C18.7 10.6 16 10 16 10s-1.3-1.4-2.2-2.3c-.5-.4-1.1-.7-1.8-.7H5c-.6 0-1.1.4-1.4.9l-1.4 2.9A3.7 3.7 0 0 0 2 12v4c0 .6.4 1 1 1h2" />
    <circle cx="7" cy="17" r="2" />
    <circle cx="17" cy="17" r="2" />
    <path d="M5 17h7" />
  </svg>
);

const LifeIcon = ({ className }) => (
  <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className}>
    <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" />
    <path d="M8 11c0-2.2 1.8-4 4-4s4 1.8 4 4" />
    <circle cx="12" cy="11" r="2" />
  </svg>
);

const TravelIcon = ({ className }) => (
  <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className}>
    {/* Travel bag/suitcase */}
    <rect x="3" y="8" width="14" height="12" rx="2" />
    <path d="M6 8V6a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2" />
    <path d="M10 14h4" />
    {/* Little airplane visible on the bag */}
    <path d="M6 12l2 1" />
    <path d="M6 13l2-1" />
    <path d="M8 12.5h2" />
    <path d="M7 11.5l1-1" />
  </svg>
);

const BusinessIcon = ({ className }) => (
  <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className}>
    <rect x="2" y="7" width="20" height="14" rx="2" ry="2" />
    <path d="M16 21V5a2 2 0 0 0-2-2h-4a2 2 0 0 0-2 2v16" />
  </svg>
);

// Icon mapping for insurance categories
const getCategoryIcon = (categorySlug) => {
  if (categorySlug === "health-insurance") return HealthIcon;
  if (categorySlug === "car-insurance") return CarIcon;
  if (categorySlug === "life-insurance") return LifeIcon;
  if (categorySlug === "travel-insurance") return TravelIcon;
  if (categorySlug === "business-insurance") return BusinessIcon;
  return null;
};

// Listing page copy is mixed with catalog data; change product/category text in src/data/catalog.js first.
const clamp = (n, min, max) => Math.max(min, Math.min(max, n));

const formatInr = (n) => `₹${Number(n).toLocaleString("en-IN")}`;

const PolicyLogo = ({ brand }) => {
  if (brand?.logo) {
    return (
      <img
        src={brand.logo}
        alt={brand.initials}
        className="h-12 w-12 rounded-2xl object-cover border"
      />
    );
  }

  return (
    <div
      className={`h-12 w-12 rounded-2xl ${brand?.color} grid place-items-center text-white font-black`}
    >
      {brand?.initials}
    </div>
  );
};

const PolicyListingFooter = ({
  filteredCount,
  resetFilters,
  navigate,
  features,
}) => (
  <div className="rounded-3xl border border-slate-200 bg-gradient-to-br from-slate-900 via-slate-900 to-blue-950 p-4 text-white shadow-[0_18px_60px_rgba(2,6,23,0.16)] sm:p-5">
    <div className="grid grid-cols-1 gap-4 lg:grid-cols-[1fr_auto] lg:items-center">
      <div>
        <div className="inline-flex items-center gap-2 rounded-full bg-white/10 px-3 py-1.5 text-[11px] font-bold text-white/85">
          <Sparkles size={14} />
          {filteredCount} matching policies
        </div>
        {/* Bottom helper panel headline, description, and CTA labels. */}
        <h2 className="mt-2 text-lg font-black tracking-tight sm:text-xl">Need help choosing?</h2>
        <p className="mt-1 max-w-2xl text-xs font-medium text-white/70 sm:text-sm">
          Reset filters or ask Agile AI to shortlist the best options.
        </p>
      </div>

      <div className="grid grid-cols-1 gap-3 sm:grid-cols-3 lg:min-w-[460px]">
        <button
          type="button"
          onClick={resetFilters}
          className="inline-flex items-center justify-center gap-2 rounded-2xl border border-white/15 bg-white/10 px-4 py-2.5 text-sm font-black text-white transition hover:bg-white/15"
        >
          <RefreshCw size={17} />
          Reset
        </button>









       {features?.aiAssistant && (
  <button
    type="button"
    onClick={() =>
      window.dispatchEvent(
        new CustomEvent("agile-ai-prompt", {
          detail: {
            text: "Help me choose the best insurance policy from this listing.",
          },
        })
      )
    }
    className="inline-flex items-center justify-center gap-2 rounded-2xl border border-white/15 bg-white/10 px-4 py-2.5 text-sm font-black text-white transition hover:bg-white/15"
  >
    <Bot size={17} />
    Request support
  </button>
)}







        <button
          type="button"
          onClick={() => navigate("/dashboard")}
          className="inline-flex items-center justify-center gap-2 rounded-2xl bg-blue-600 px-4 py-2.5 text-sm font-black text-white transition hover:bg-blue-500"
        >
          <ShieldCheck size={17} />
          Dashboard
        </button>
      </div>
    </div>
  </div>
);


const FiltersPanel = ({
  search,
  setSearch,
  premiumMin,
  premiumMax,
  premiumRange,
  setPremiumRange,
  coverageMin,
  coverageMax,
  coverageRange,
  setCoverageRange,
  claimMin,
  setClaimMin,
  policyType,
  setPolicyType,
  policyTypes,
  sortBy,
  setSortBy,
  emiOnly,
  setEmiOnly,
  familyOnly,
  setFamilyOnly,
  resetFilters,
  onClose,
}) => {
  return (
    <div className="space-y-5">
      {/* Filter labels/placeholders/sort options are visible UI copy. */}
      <div className="flex items-start justify-between gap-4">
        <div>
          <div className="text-sm font-black text-slate-900">Plan Filters</div>
          <div className="text-xs font-semibold text-slate-500">Compare plans by premium, coverage, and claim ratio</div>
        </div>
        {onClose ? (
          <button onClick={onClose} className="rounded-xl border border-slate-200 bg-white px-3 py-2 text-xs font-bold text-slate-700">
            Close
          </button>
        ) : null}
      </div>

      <label className="block space-y-2">
        <span className="text-xs font-semibold text-slate-700">Search company</span>
        <div className="relative">
          <Search size={18} className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" />
          <input
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="e.g. HDFC, LIC, ICICI…"
            className="w-full rounded-2xl border border-slate-200 bg-white px-12 py-3 text-sm font-semibold text-slate-800 shadow-sm outline-none focus:border-blue-500"
            />
        </div>
      </label>

      <div className="rounded-3xl border border-slate-200 bg-white p-4 shadow-sm">
        <div className="flex items-center justify-between">
          <div className="text-xs font-bold text-slate-700">Premium range</div>
          <div className="text-xs font-black text-slate-900">
            {formatInr(premiumRange[0])}–{formatInr(premiumRange[1])}
          </div>
        </div>
        <div className="mt-4 space-y-3">
          <input
            type="range"
            min={premiumMin}
            max={premiumMax}
            value={premiumRange[0]}
            onChange={(e) =>
              setPremiumRange((prev) => [clamp(Number(e.target.value), premiumMin, prev[1]), prev[1]])
            }
            className="w-full"
            />
          <input
            type="range"
            min={premiumMin}
            max={premiumMax}
            value={premiumRange[1]}
            onChange={(e) =>
              setPremiumRange((prev) => [prev[0], clamp(Number(e.target.value), prev[0], premiumMax)])
            }
            className="w-full"
            />
        </div>
      </div>

      <div className="rounded-3xl border border-slate-200 bg-white p-4 shadow-sm">
        <div className="flex items-center justify-between">
          <div className="text-xs font-bold text-slate-700">Coverage range</div>
          <div className="text-xs font-black text-slate-900">
            {formatInr(coverageRange[0])}–{formatInr(coverageRange[1])}
          </div>
        </div>
        <div className="mt-4 space-y-3">
          <input
            type="range"
            min={coverageMin}
            max={coverageMax}
            step={50000}
            value={coverageRange[0]}
            onChange={(e) =>
              setCoverageRange((prev) => [clamp(Number(e.target.value), coverageMin, prev[1]), prev[1]])
            }
            className="w-full"
            />
          <input
            type="range"
            min={coverageMin}
            max={coverageMax}
            step={50000}
            value={coverageRange[1]}
            onChange={(e) =>
              setCoverageRange((prev) => [prev[0], clamp(Number(e.target.value), prev[0], coverageMax)])
            }
            className="w-full"
            />
        </div>
      </div>

      <label className="block space-y-2">
        <span className="text-xs font-semibold text-slate-700">Claim settlement ratio</span>
        <div className="flex items-center gap-3">
          <input
            type="range"
            min={85}
            max={99}
            value={claimMin}
            onChange={(e) => setClaimMin(Number(e.target.value))}
            className="w-full"
            />
          <div className="w-16 rounded-xl border border-slate-200 bg-white px-3 py-2 text-center text-xs font-black text-slate-900 shadow-sm">
            {claimMin}%
          </div>
        </div>
      </label>

      <label className="block space-y-2">
        <span className="text-xs font-semibold text-slate-700">Policy type</span>
        <select
          value={policyType}
          onChange={(e) => setPolicyType(e.target.value)}
          className="w-full rounded-2xl border border-slate-200 bg-white px-4 py-3 text-sm font-semibold text-slate-800 shadow-sm outline-none focus:border-blue-500"
          >
          {policyTypes.map((t) => (
            <option key={t} value={t}>
              {t}
            </option>
          ))}
        </select>
      </label>

      <label className="block space-y-2">
        <span className="text-xs font-semibold text-slate-700">Sort</span>
        <select
          value={sortBy}
          onChange={(e) => setSortBy(e.target.value)}
          className="w-full rounded-2xl border border-slate-200 bg-white px-4 py-3 text-sm font-semibold text-slate-800 shadow-sm outline-none focus:border-blue-500"
          >
          <option value="low-premium">Low premium</option>
          <option value="high-coverage">High coverage</option>
          <option value="best-rating">Best rating</option>
        </select>
      </label>

      <div className="grid grid-cols-2 gap-3">
        <button
          type="button"
          onClick={() => setEmiOnly((v) => !v)}
          className={[
            "rounded-2xl border px-4 py-3 text-sm font-bold shadow-sm transition",
            emiOnly ? "border-blue-600 bg-blue-600 text-white" : "border-slate-200 bg-white text-slate-800 hover:bg-slate-50",
          ].join(" ")}
          >
          EMI {emiOnly ? "On" : "Off"}
        </button>
        <button
          type="button"
          onClick={() => setFamilyOnly((v) => !v)}
          className={[
            "rounded-2xl border px-4 py-3 text-sm font-bold shadow-sm transition",
            familyOnly
            ? "border-blue-600 bg-blue-600 text-white"
            : "border-slate-200 bg-white text-slate-800 hover:bg-slate-50",
          ].join(" ")}
          >
          Family {familyOnly ? "On" : "Off"}
        </button>
      </div>

      <div className="flex items-center gap-3">
        <button
          type="button"
          onClick={resetFilters}
          className="inline-flex flex-1 items-center justify-center gap-2 rounded-2xl border border-slate-200 bg-white px-4 py-3 text-sm font-bold text-slate-800 shadow-sm hover:bg-slate-50"
          >
          <RefreshCw size={18} />
          Reset filters
        </button> 
      </div>
    </div>
  );
};

const CategoryPage = () => {
  const { categorySlug } = useParams();
  const navigate = useNavigate();
  const { isAuthenticated } = useAuth();
  
  const category = getCategoryBySlug(categorySlug);
  const [allPolicies, setAllPolicies] = useState([]);
  const [loadingPolicies, setLoadingPolicies] = useState(false);
  const [policiesError, setPoliciesError] = useState(null);

  // Map frontend slug to backend category param
  const mapSlugToCategory = (slug) => {
    if (!slug) return slug;
    if (slug.includes("health")) return "health";
    if (slug.includes("term")) return "term";
    if (slug.includes("car") || slug.includes("vehicle")) return "auto";
    if (slug.includes("life")) return "life";
    if (slug.includes("travel")) return "travel";
    if (slug.includes("home")) return "home";
    if (slug.includes("business")) return "business";
    return slug.replace(/-insurance$/i, "");
  };

  // Normalize backend policy object to frontend shape used by this page
 const normalizePolicy = (p) => {
  const company = p.companyName || "Unknown";
  const policyName = p.policyName || "Policy";

  const premiumMonthly =
    p.monthlyPremium ??
    p.premiumAmount ??
    0;

  const coverageAmount =
    p.coverageAmount ?? 0;

  return {
    id: p._id,
    company,

    companyBrand: {
      logo: p.companyLogo || "",
      initials: company.substring(0, 2).toUpperCase(),
      color: "bg-blue-600",
    },

    policyName,

    premiumMonthly,
    premiumLabel: formatInr(premiumMonthly),

    coverageAmount,
    coverageLabel: formatInr(coverageAmount),

    claimSettlementRatio: p.claimRatio,

    validityYears: p.validityYears,

    emiAvailable: p.emiAvailable,

    policyType: p.policyType,

    rating: p.rating,

    keyBenefits: p.features || [],

    description: p.description,

    category: p.category,

    status: p.status,

    isActive: p.isActive,

    aiBadge: null,

    familyCoverage: false,
  };
};

  const [searchParams] = useSearchParams();
  const [mobileFiltersOpen, setMobileFiltersOpen] = useState(false);
  const [compareIds, setCompareIds] = useState([]);

  useEffect(() => {
    if (!categorySlug) return;
    setAllPolicies(getPoliciesByCategory(categorySlug));
  }, [categorySlug]);

  const premiumMin = useMemo(() => {
    if (!allPolicies || !allPolicies.length) return 0;
    return Math.min(...allPolicies.map((p) => p.premiumMonthly || 0));
  }, [allPolicies]);
  const premiumMax = useMemo(() => {
    if (!allPolicies || !allPolicies.length) return 1000;
    return Math.max(...allPolicies.map((p) => p.premiumMonthly || 0));
  }, [allPolicies]);
  const coverageMin = useMemo(() => {
    if (!allPolicies || !allPolicies.length) return 0;
    return Math.min(...allPolicies.map((p) => p.coverageAmount || 0));
  }, [allPolicies]);
  const coverageMax = useMemo(() => {
    if (!allPolicies || !allPolicies.length) return 1000000;
    return Math.max(...allPolicies.map((p) => p.coverageAmount || 0));
  }, [allPolicies]);



  const [search, setSearch] = useState("");
  const [premiumRange, setPremiumRange] = useState([premiumMin, premiumMax]);
  useEffect(() => {
  if (allPolicies.length) {
    setPremiumRange([premiumMin, premiumMax]);
    setCoverageRange([coverageMin, coverageMax]);
  }
}, [
  allPolicies,
  premiumMin,
  premiumMax,
  coverageMin,
  coverageMax,
]);
  const [coverageRange, setCoverageRange] = useState([coverageMin, coverageMax]);
  const [claimMin, setClaimMin] = useState(90);
  const [policyType, setPolicyType] = useState("All");
  const [sortBy, setSortBy] = useState("best-rating");
  const [emiOnly, setEmiOnly] = useState(false);
  const [familyOnly, setFamilyOnly] = useState(false);
  const [features, setFeatures] = useState({
      aiAssistant: true,    
    policyCompare: true,
    });
  
    useEffect(() => {
  const fetchSettings = async () => {
    try {
      const response = await apiRequest("/api/admin/settings");
      const settings = response?.data;

      setFeatures(settings?.features || {});
    } catch (error) {
      console.error("Failed to load features:", error);
    }
  };

  fetchSettings();
}, []);


  const policyTypes = useMemo(() => {
    const unique = new Set(allPolicies.map((p) => p.policyType));
    return ["All", ...Array.from(unique)];
  }, [allPolicies]);

  useEffect(() => {
    const requestedPolicyType = searchParams.get("policyType");
    const requestedSortBy = searchParams.get("sortBy");

    if (requestedPolicyType && policyTypes.includes(requestedPolicyType)) {
      setPolicyType(requestedPolicyType);
    }
    if (requestedSortBy && ["low-premium", "high-coverage", "best-rating"].includes(requestedSortBy)) {
      setSortBy(requestedSortBy);
    }
  }, [policyTypes, searchParams]);

  const filtered = useMemo(() => {
    const s = search.trim().toLowerCase();
    let list = allPolicies.filter((p) => {
      if (s && !`${p.company} ${p.policyName}`.toLowerCase().includes(s)) return false;
      if (p.premiumMonthly < premiumRange[0] || p.premiumMonthly > premiumRange[1]) return false;
      if (p.coverageAmount < coverageRange[0] || p.coverageAmount > coverageRange[1]) return false;
      if (p.claimSettlementRatio < claimMin) return false;
      if (policyType !== "All" && p.policyType !== policyType) return false;
      if (emiOnly && !p.emiAvailable) return false;
      if (familyOnly && !p.familyCoverage) return false;
      return true;
    });

    if (sortBy === "low-premium") list = [...list].sort((a, b) => a.premiumMonthly - b.premiumMonthly);
    if (sortBy === "high-coverage") list = [...list].sort((a, b) => b.coverageAmount - a.coverageAmount);
    if (sortBy === "best-rating") list = [...list].sort((a, b) => b.rating - a.rating);
    return list;
  }, [allPolicies, search, premiumRange, coverageRange, claimMin, policyType, sortBy, emiOnly, familyOnly]);

  const activeTags = useMemo(() => {
    const tags = [];
    if (search.trim()) tags.push(`Search: ${search.trim()}`);
    if (premiumRange[0] !== premiumMin || premiumRange[1] !== premiumMax)
      tags.push(`Premium: ${formatInr(premiumRange[0])}–${formatInr(premiumRange[1])}`);
    if (coverageRange[0] !== coverageMin || coverageRange[1] !== coverageMax)
      tags.push(`Coverage: ${formatInr(coverageRange[0])}–${formatInr(coverageRange[1])}`);
    if (claimMin !== 90) tags.push(`CSR ≥ ${claimMin}%`);
    if (policyType !== "All") tags.push(`Type: ${policyType}`);
    if (emiOnly) tags.push("EMI only");
    if (familyOnly) tags.push("Family coverage");
    if (sortBy === "low-premium") tags.push("Sort: Low premium");
    if (sortBy === "high-coverage") tags.push("Sort: High coverage");
    if (sortBy === "best-rating") tags.push("Sort: Best rating");
    return tags;
  }, [search, premiumRange, premiumMin, premiumMax, coverageRange, coverageMin, coverageMax, claimMin, policyType, emiOnly, familyOnly, sortBy]);

  const resetFilters = () => {
    setSearch("");
    setPremiumRange([premiumMin, premiumMax]);
    setCoverageRange([coverageMin, coverageMax]);
    setClaimMin(90);
    setPolicyType("All");
    setSortBy("best-rating");
    setEmiOnly(false);
    setFamilyOnly(false);
  };

  const toggleCompare = (id) => {
    setCompareIds((prev) => {
      if (prev.includes(id)) return prev.filter((x) => x !== id);
      if (prev.length >= 3) return prev;
      return [...prev, id];
    });
  };

  const onBuy = (policyId) => {
    if (!isAuthenticated) {
      navigate(`/auth?returnTo=${encodeURIComponent(`/checkout/${policyId}`)}`);
      return;
    }
    navigate(`/checkout/${policyId}`);
  };

  if (!category) {
    return (
      <div className="min-h-[70vh] bg-white px-4 py-16 sm:px-6 sm:py-20">
        <div className="mx-auto max-w-4xl rounded-3xl border border-slate-200 bg-gradient-to-br from-white to-slate-50 p-6 shadow-sm sm:rounded-[2.5rem] sm:p-10">
          <h1 className="text-2xl font-black text-slate-900 sm:text-3xl">Category not found</h1>
          <p className="mt-2 text-slate-600">Try one of the supported categories from the homepage service cards.</p>
          <div className="mt-8 flex flex-wrap gap-3">
            <Link to="/health-insurance" className="rounded-2xl bg-blue-600 px-5 py-3 text-sm font-semibold text-white">
              Health
            </Link>
            <Link to="/term-insurance" className="rounded-2xl border border-slate-200 bg-white px-5 py-3 text-sm font-semibold text-slate-800">
              Term
            </Link>
            <Link to="/car-insurance" className="rounded-2xl border border-slate-200 bg-white px-5 py-3 text-sm font-semibold text-slate-800">
              Car
            </Link>
          </div>
        </div>
      </div>
    );
  }

  if (loadingPolicies) {
    return (
      <div className="min-h-[60vh] flex items-center justify-center bg-white px-4 py-16 dark:bg-[#070B14]">
        <div className="text-center">
          <div className="text-xl font-black text-slate-900 dark:text-white">Loading policies…</div>
          <div className="mt-2 text-sm text-slate-600 dark:text-slate-300">Fetching available plans from the server.</div>
        </div>
      </div>
    );
  }

  if (policiesError) {
    return (
      <div className="min-h-[60vh] flex items-center justify-center bg-white px-4 py-16 dark:bg-[#070B14]">
        <div className="text-center">
          <div className="text-xl font-black text-red-600">Failed to load policies</div>
          <div className="mt-2 text-sm text-slate-600 dark:text-slate-300">{policiesError}</div>
        </div>
      </div>
    );
  }



  return (
    <div className="insurance-category-page bg-slate-50">
      {/* Hero Section - JioHotstar Cinematic Banner */}
      <div className="relative h-[320px] sm:h-[380px] lg:h-[460px] overflow-hidden">
        {/* Light Mode - Subtle cinematic base */}
        <div className="absolute inset-0 bg-gradient-to-br from-slate-100/80 via-slate-50/60 to-slate-200/70 dark:hidden pointer-events-none" />

        {/* Dark Mode - Deep cinematic base */}
        <div className="absolute inset-0 bg-gradient-to-br from-slate-950 via-slate-900 to-slate-950 hidden dark:block pointer-events-none" />

        {/* Subtle Cinematic Background - Image Color Extension */}
        <div className="absolute inset-0 pointer-events-none">
          {/* Health Insurance - Soft Blue Medical Tones */}
          {categorySlug === "health-insurance" && (
            <>
              {/* Subtle radial glow from image area */}
              <div className="absolute inset-0 bg-[radial-gradient(ellipse_120%_100%_at_75%_50%,_rgba(59,130,246,0.15)_0%,_rgba(6,182,212,0.10)_30%,_rgba(59,130,246,0.05)_60%,_transparent_100%)] dark:bg-[radial-gradient(ellipse_120%_100%_at_75%_50%,_rgba(37,99,235,0.20)_0%,_rgba(8,145,178,0.15)_30%,_rgba(37,99,235,0.08)_60%,_transparent_100%)]" />
              
              {/* Soft linear gradient extending left */}
              <div className="absolute inset-0 bg-gradient-to-l from-blue-400/20 via-blue-300/12 via-blue-200/8 to-transparent dark:from-blue-500/25 dark:via-blue-400/15 dark:via-blue-300/10" />
              
              {/* Subtle top fade */}
              <div className="absolute inset-0 bg-gradient-to-b from-blue-300/12 via-blue-200/8 to-transparent dark:from-blue-400/15 dark:via-blue-300/10" />
              
              {/* Subtle bottom fade */}
              <div className="absolute inset-0 bg-gradient-to-t from-cyan-300/12 via-cyan-200/8 to-transparent dark:from-cyan-400/15 dark:via-cyan-300/10" />
              
              {/* Soft ambient glow */}
              <div className="absolute top-1/2 right-[-100px] -translate-y-1/2 w-[800px] h-[800px] bg-blue-400/12 rounded-full blur-[200px] dark:bg-blue-500/18" />
            </>
          )}

          {/* Life Insurance - Warm Family Sunset Tones */}
          {categorySlug === "life-insurance" && (
            <>
              <div className="absolute inset-0 bg-[radial-gradient(ellipse_120%_100%_at_75%_50%,_rgba(251,146,60,0.15)_0%,_rgba(244,63,94,0.10)_30%,_rgba(251,146,60,0.05)_60%,_transparent_100%)] dark:bg-[radial-gradient(ellipse_120%_100%_at_75%_50%,_rgba(249,115,22,0.20)_0%,_rgba(225,29,72,0.15)_30%,_rgba(249,115,22,0.08)_60%,_transparent_100%)]" />
              
              <div className="absolute inset-0 bg-gradient-to-l from-orange-400/20 via-amber-300/12 via-orange-200/8 to-transparent dark:from-orange-500/25 dark:via-amber-400/15 dark:via-orange-300/10" />
              
              <div className="absolute inset-0 bg-gradient-to-b from-orange-300/12 via-orange-200/8 to-transparent dark:from-orange-400/15 dark:via-orange-300/10" />
              
              <div className="absolute inset-0 bg-gradient-to-t from-rose-300/12 via-rose-200/8 to-transparent dark:from-rose-400/15 dark:via-rose-300/10" />
              
              <div className="absolute top-1/2 right-[-100px] -translate-y-1/2 w-[800px] h-[800px] bg-orange-400/12 rounded-full blur-[200px] dark:bg-orange-500/18" />
            </>
          )}

          {/* Car Insurance - Neon Blue + Road Reflections */}
          {categorySlug === "car-insurance" && (
            <>
              <div className="absolute inset-0 bg-[radial-gradient(ellipse_120%_100%_at_75%_50%,_rgba(59,130,246,0.16)_0%,_rgba(99,102,241,0.11)_30%,_rgba(59,130,246,0.06)_60%,_transparent_100%)] dark:bg-[radial-gradient(ellipse_120%_100%_at_75%_50%,_rgba(37,99,235,0.21)_0%,_rgba(79,70,229,0.16)_30%,_rgba(37,99,235,0.09)_60%,_transparent_100%)]" />
              
              <div className="absolute inset-0 bg-gradient-to-l from-blue-500/22 via-indigo-400/14 via-blue-300/10 to-transparent dark:from-blue-600/28 dark:via-indigo-500/18 dark:via-blue-400/12" />
              
              <div className="absolute inset-0 bg-gradient-to-b from-blue-400/14 via-blue-300/10 to-transparent dark:from-blue-500/18 dark:via-blue-400/12" />
              
              <div className="absolute inset-0 bg-gradient-to-t from-indigo-300/14 via-indigo-200/10 to-transparent dark:from-indigo-400/18 dark:via-indigo-300/12" />
              
              <div className="absolute top-1/2 right-[-100px] -translate-y-1/2 w-[800px] h-[800px] bg-blue-500/14 rounded-full blur-[200px] dark:bg-blue-600/20" />
            </>
          )}

          {/* Travel Insurance - Sunset + Sky Blue Gradients */}
          {categorySlug === "travel-insurance" && (
            <>
              <div className="absolute inset-0 bg-[radial-gradient(ellipse_120%_100%_at_75%_50%,_rgba(14,165,233,0.15)_0%,_rgba(139,92,246,0.10)_30%,_rgba(14,165,233,0.05)_60%,_transparent_100%)] dark:bg-[radial-gradient(ellipse_120%_100%_at_75%_50%,_rgba(2,132,199,0.20)_0%,_rgba(124,58,237,0.15)_30%,_rgba(2,132,199,0.08)_60%,_transparent_100%)]" />
              
              <div className="absolute inset-0 bg-gradient-to-l from-sky-400/20 via-violet-300/12 via-sky-200/8 to-transparent dark:from-sky-500/25 dark:via-violet-400/15 dark:via-sky-300/10" />
              
              <div className="absolute inset-0 bg-gradient-to-b from-sky-300/12 via-sky-200/8 to-transparent dark:from-sky-400/15 dark:via-sky-300/10" />
              
              <div className="absolute inset-0 bg-gradient-to-t from-pink-300/12 via-pink-200/8 to-transparent dark:from-pink-400/15 dark:via-pink-300/10" />
              
              <div className="absolute top-1/2 right-[-100px] -translate-y-1/2 w-[800px] h-[800px] bg-sky-400/12 rounded-full blur-[200px] dark:bg-sky-500/18" />
            </>
          )}

          {/* Business Insurance - Dark Corporate Blue + Golden Glow */}
          {categorySlug === "business-insurance" && (
            <>
              <div className="absolute inset-0 bg-[radial-gradient(ellipse_120%_100%_at_75%_50%,_rgba(37,99,235,0.14)_0%,_rgba(99,102,241,0.10)_30%,_rgba(37,99,235,0.05)_60%,_transparent_100%)] dark:bg-[radial-gradient(ellipse_120%_100%_at_75%_50%,_rgba(30,58,138,0.19)_0%,_rgba(67,56,202,0.14)_30%,_rgba(30,58,138,0.08)_60%,_transparent_100%)]" />
              
              <div className="absolute inset-0 bg-gradient-to-l from-blue-600/20 via-indigo-500/14 via-blue-400/10 to-transparent dark:from-blue-700/26 dark:via-indigo-600/18 dark:via-blue-500/12" />
              
              <div className="absolute inset-0 bg-gradient-to-b from-blue-500/14 via-blue-400/10 to-transparent dark:from-blue-600/18 dark:via-blue-500/12" />
              
              <div className="absolute inset-0 bg-gradient-to-t from-orange-400/14 via-orange-300/10 to-transparent dark:from-orange-500/18 dark:via-orange-400/12" />
              
              <div className="absolute top-1/2 right-[-100px] -translate-y-1/2 w-[800px] h-[800px] bg-blue-500/12 rounded-full blur-[200px] dark:bg-blue-600/18" />
            </>
          )}
        </div>

        {/* JioHotstar Style Left-to-Right Dark Gradient Overlay */}
        <div className="absolute inset-0 bg-gradient-to-r from-slate-900/85 via-slate-900/60 via-slate-900/30 to-transparent dark:from-slate-950/90 dark:via-slate-950/70 dark:via-slate-950/40 pointer-events-none" />

        {/* Cinematic Shadow Overlay - Top */}
        <div className="absolute inset-0 bg-gradient-to-b from-slate-900/40 via-transparent to-transparent dark:from-slate-950/60 pointer-events-none" />

        {/* Cinematic Shadow Overlay - Bottom */}
        <div className="absolute inset-0 bg-gradient-to-t from-slate-900/50 via-transparent to-transparent dark:from-slate-950/70 pointer-events-none" />

        {/* Soft Vignette Effect */}
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_70%_70%_at_50%_50%,_transparent_0%,_rgba(15,23,42,0.3)_100%)] dark:bg-[radial-gradient(ellipse_70%_70%_at_50%_50%,_transparent_0%,_rgba(2,6,23,0.5)_100%)] pointer-events-none" />

        {/* Image Layer - Right Side with Cinematic Blending */}
        {categorySlug === "health-insurance" && (
          <div className="absolute top-0 right-0 bottom-0 w-full sm:w-4/5 lg:w-3/5 pointer-events-none overflow-hidden">
            <img 
              src={HealthcareImage}
              alt="Healthcare Insurance"
              className="h-full w-full object-contain object-center"
              style={{
                maskImage: `
                  linear-gradient(to left, 
                    rgba(0,0,0,1) 0%, 
                    rgba(0,0,0,0.98) 5%,
                    rgba(0,0,0,0.92) 12%,
                    rgba(0,0,0,0.78) 22%,
                    rgba(0,0,0,0.55) 38%,
                    rgba(0,0,0,0.30) 55%,
                    rgba(0,0,0,0.12) 72%,
                    rgba(0,0,0,0.03) 88%,
                    rgba(0,0,0,0) 100%
                  ),
                  linear-gradient(to top,
                    rgba(0,0,0,1) 0%,
                    rgba(0,0,0,0.96) 8%,
                    rgba(0,0,0,0.85) 20%,
                    rgba(0,0,0,0.60) 40%,
                    rgba(0,0,0,0.30) 65%,
                    rgba(0,0,0,0.08) 85%,
                    rgba(0,0,0,0) 100%
                  ),
                  linear-gradient(to bottom,
                    rgba(0,0,0,1) 0%,
                    rgba(0,0,0,0.96) 8%,
                    rgba(0,0,0,0.85) 20%,
                    rgba(0,0,0,0.60) 40%,
                    rgba(0,0,0,0.30) 65%,
                    rgba(0,0,0,0.08) 85%,
                    rgba(0,0,0,0) 100%
                  ),
                  radial-gradient(ellipse 140% 100% at 100% 50%,
                    rgba(0,0,0,1) 0%,
                    rgba(0,0,0,0.94) 12%,
                    rgba(0,0,0,0.78) 28%,
                    rgba(0,0,0,0.50) 50%,
                    rgba(0,0,0,0.22) 72%,
                    rgba(0,0,0,0.05) 90%,
                    rgba(0,0,0,0) 100%
                  )
                `,
                WebkitMaskImage: `
                  linear-gradient(to left, 
                    rgba(0,0,0,1) 0%, 
                    rgba(0,0,0,0.98) 5%,
                    rgba(0,0,0,0.92) 12%,
                    rgba(0,0,0,0.78) 22%,
                    rgba(0,0,0,0.55) 38%,
                    rgba(0,0,0,0.30) 55%,
                    rgba(0,0,0,0.12) 72%,
                    rgba(0,0,0,0.03) 88%,
                    rgba(0,0,0,0) 100%
                  ),
                  linear-gradient(to top,
                    rgba(0,0,0,1) 0%,
                    rgba(0,0,0,0.96) 8%,
                    rgba(0,0,0,0.85) 20%,
                    rgba(0,0,0,0.60) 40%,
                    rgba(0,0,0,0.30) 65%,
                    rgba(0,0,0,0.08) 85%,
                    rgba(0,0,0,0) 100%
                  ),
                  linear-gradient(to bottom,
                    rgba(0,0,0,1) 0%,
                    rgba(0,0,0,0.96) 8%,
                    rgba(0,0,0,0.85) 20%,
                    rgba(0,0,0,0.60) 40%,
                    rgba(0,0,0,0.30) 65%,
                    rgba(0,0,0,0.08) 85%,
                    rgba(0,0,0,0) 100%
                  ),
                  radial-gradient(ellipse 140% 100% at 100% 50%,
                    rgba(0,0,0,1) 0%,
                    rgba(0,0,0,0.94) 12%,
                    rgba(0,0,0,0.78) 28%,
                    rgba(0,0,0,0.50) 50%,
                    rgba(0,0,0,0.22) 72%,
                    rgba(0,0,0,0.05) 90%,
                    rgba(0,0,0,0) 100%
                  )
                `,
                filter: 'drop-shadow(-8px 0 20px rgba(0,0,0,0.12))',
              }}
            />
          </div>
        )}

        {categorySlug === "life-insurance" && (
          <div className="absolute top-0 right-0 bottom-0 w-full sm:w-4/5 lg:w-3/5 pointer-events-none overflow-hidden">
            <img 
              src={LifeInsuranceImage}
              alt="Life Insurance"
              className="h-full w-full object-contain object-center"
              style={{
                maskImage: `
                  linear-gradient(to left, 
                    rgba(0,0,0,1) 0%, 
                    rgba(0,0,0,0.98) 5%,
                    rgba(0,0,0,0.92) 12%,
                    rgba(0,0,0,0.78) 22%,
                    rgba(0,0,0,0.55) 38%,
                    rgba(0,0,0,0.30) 55%,
                    rgba(0,0,0,0.12) 72%,
                    rgba(0,0,0,0.03) 88%,
                    rgba(0,0,0,0) 100%
                  ),
                  linear-gradient(to top,
                    rgba(0,0,0,1) 0%,
                    rgba(0,0,0,0.96) 8%,
                    rgba(0,0,0,0.85) 20%,
                    rgba(0,0,0,0.60) 40%,
                    rgba(0,0,0,0.30) 65%,
                    rgba(0,0,0,0.08) 85%,
                    rgba(0,0,0,0) 100%
                  ),
                  linear-gradient(to bottom,
                    rgba(0,0,0,1) 0%,
                    rgba(0,0,0,0.96) 8%,
                    rgba(0,0,0,0.85) 20%,
                    rgba(0,0,0,0.60) 40%,
                    rgba(0,0,0,0.30) 65%,
                    rgba(0,0,0,0.08) 85%,
                    rgba(0,0,0,0) 100%
                  ),
                  radial-gradient(ellipse 140% 100% at 100% 50%,
                    rgba(0,0,0,1) 0%,
                    rgba(0,0,0,0.94) 12%,
                    rgba(0,0,0,0.78) 28%,
                    rgba(0,0,0,0.50) 50%,
                    rgba(0,0,0,0.22) 72%,
                    rgba(0,0,0,0.05) 90%,
                    rgba(0,0,0,0) 100%
                  )
                `,
                WebkitMaskImage: `
                  linear-gradient(to left, 
                    rgba(0,0,0,1) 0%, 
                    rgba(0,0,0,0.98) 5%,
                    rgba(0,0,0,0.92) 12%,
                    rgba(0,0,0,0.78) 22%,
                    rgba(0,0,0,0.55) 38%,
                    rgba(0,0,0,0.30) 55%,
                    rgba(0,0,0,0.12) 72%,
                    rgba(0,0,0,0.03) 88%,
                    rgba(0,0,0,0) 100%
                  ),
                  linear-gradient(to top,
                    rgba(0,0,0,1) 0%,
                    rgba(0,0,0,0.96) 8%,
                    rgba(0,0,0,0.85) 20%,
                    rgba(0,0,0,0.60) 40%,
                    rgba(0,0,0,0.30) 65%,
                    rgba(0,0,0,0.08) 85%,
                    rgba(0,0,0,0) 100%
                  ),
                  linear-gradient(to bottom,
                    rgba(0,0,0,1) 0%,
                    rgba(0,0,0,0.96) 8%,
                    rgba(0,0,0,0.85) 20%,
                    rgba(0,0,0,0.60) 40%,
                    rgba(0,0,0,0.30) 65%,
                    rgba(0,0,0,0.08) 85%,
                    rgba(0,0,0,0) 100%
                  ),
                  radial-gradient(ellipse 140% 100% at 100% 50%,
                    rgba(0,0,0,1) 0%,
                    rgba(0,0,0,0.94) 12%,
                    rgba(0,0,0,0.78) 28%,
                    rgba(0,0,0,0.50) 50%,
                    rgba(0,0,0,0.22) 72%,
                    rgba(0,0,0,0.05) 90%,
                    rgba(0,0,0,0) 100%
                  )
                `,
                filter: 'drop-shadow(-8px 0 20px rgba(0,0,0,0.12))',
              }}
            />
          </div>
        )}

        {categorySlug === "car-insurance" && (
          <div className="absolute top-0 right-0 bottom-0 w-full sm:w-4/5 lg:w-3/5 pointer-events-none overflow-hidden">
            <img 
              src={CarInsuranceImage}
              alt="Car Insurance"
              className="h-full w-full object-contain object-center"
              style={{
                maskImage: `
                  linear-gradient(to left, 
                    rgba(0,0,0,1) 0%, 
                    rgba(0,0,0,0.98) 5%,
                    rgba(0,0,0,0.92) 12%,
                    rgba(0,0,0,0.78) 22%,
                    rgba(0,0,0,0.55) 38%,
                    rgba(0,0,0,0.30) 55%,
                    rgba(0,0,0,0.12) 72%,
                    rgba(0,0,0,0.03) 88%,
                    rgba(0,0,0,0) 100%
                  ),
                  linear-gradient(to top,
                    rgba(0,0,0,1) 0%,
                    rgba(0,0,0,0.96) 8%,
                    rgba(0,0,0,0.85) 20%,
                    rgba(0,0,0,0.60) 40%,
                    rgba(0,0,0,0.30) 65%,
                    rgba(0,0,0,0.08) 85%,
                    rgba(0,0,0,0) 100%
                  ),
                  linear-gradient(to bottom,
                    rgba(0,0,0,1) 0%,
                    rgba(0,0,0,0.96) 8%,
                    rgba(0,0,0,0.85) 20%,
                    rgba(0,0,0,0.60) 40%,
                    rgba(0,0,0,0.30) 65%,
                    rgba(0,0,0,0.08) 85%,
                    rgba(0,0,0,0) 100%
                  ),
                  radial-gradient(ellipse 140% 100% at 100% 50%,
                    rgba(0,0,0,1) 0%,
                    rgba(0,0,0,0.94) 12%,
                    rgba(0,0,0,0.78) 28%,
                    rgba(0,0,0,0.50) 50%,
                    rgba(0,0,0,0.22) 72%,
                    rgba(0,0,0,0.05) 90%,
                    rgba(0,0,0,0) 100%
                  )
                `,
                WebkitMaskImage: `
                  linear-gradient(to left, 
                    rgba(0,0,0,1) 0%, 
                    rgba(0,0,0,0.98) 5%,
                    rgba(0,0,0,0.92) 12%,
                    rgba(0,0,0,0.78) 22%,
                    rgba(0,0,0,0.55) 38%,
                    rgba(0,0,0,0.30) 55%,
                    rgba(0,0,0,0.12) 72%,
                    rgba(0,0,0,0.03) 88%,
                    rgba(0,0,0,0) 100%
                  ),
                  linear-gradient(to top,
                    rgba(0,0,0,1) 0%,
                    rgba(0,0,0,0.96) 8%,
                    rgba(0,0,0,0.85) 20%,
                    rgba(0,0,0,0.60) 40%,
                    rgba(0,0,0,0.30) 65%,
                    rgba(0,0,0,0.08) 85%,
                    rgba(0,0,0,0) 100%
                  ),
                  linear-gradient(to bottom,
                    rgba(0,0,0,1) 0%,
                    rgba(0,0,0,0.96) 8%,
                    rgba(0,0,0,0.85) 20%,
                    rgba(0,0,0,0.60) 40%,
                    rgba(0,0,0,0.30) 65%,
                    rgba(0,0,0,0.08) 85%,
                    rgba(0,0,0,0) 100%
                  ),
                  radial-gradient(ellipse 140% 100% at 100% 50%,
                    rgba(0,0,0,1) 0%,
                    rgba(0,0,0,0.94) 12%,
                    rgba(0,0,0,0.78) 28%,
                    rgba(0,0,0,0.50) 50%,
                    rgba(0,0,0,0.22) 72%,
                    rgba(0,0,0,0.05) 90%,
                    rgba(0,0,0,0) 100%
                  )
                `,
                filter: 'drop-shadow(-8px 0 20px rgba(0,0,0,0.12))',
              }}
            />
          </div>
        )}

        {categorySlug === "travel-insurance" && (
          <div className="absolute top-0 right-0 bottom-0 w-full sm:w-4/5 lg:w-3/5 pointer-events-none overflow-hidden">
            <img 
              src={TravelInsuranceImage}
              alt="Travel Insurance"
              className="h-full w-full object-contain object-center"
              style={{
                maskImage: `
                  linear-gradient(to left, 
                    rgba(0,0,0,1) 0%, 
                    rgba(0,0,0,0.98) 5%,
                    rgba(0,0,0,0.92) 12%,
                    rgba(0,0,0,0.78) 22%,
                    rgba(0,0,0,0.55) 38%,
                    rgba(0,0,0,0.30) 55%,
                    rgba(0,0,0,0.12) 72%,
                    rgba(0,0,0,0.03) 88%,
                    rgba(0,0,0,0) 100%
                  ),
                  linear-gradient(to top,
                    rgba(0,0,0,1) 0%,
                    rgba(0,0,0,0.96) 8%,
                    rgba(0,0,0,0.85) 20%,
                    rgba(0,0,0,0.60) 40%,
                    rgba(0,0,0,0.30) 65%,
                    rgba(0,0,0,0.08) 85%,
                    rgba(0,0,0,0) 100%
                  ),
                  linear-gradient(to bottom,
                    rgba(0,0,0,1) 0%,
                    rgba(0,0,0,0.96) 8%,
                    rgba(0,0,0,0.85) 20%,
                    rgba(0,0,0,0.60) 40%,
                    rgba(0,0,0,0.30) 65%,
                    rgba(0,0,0,0.08) 85%,
                    rgba(0,0,0,0) 100%
                  ),
                  radial-gradient(ellipse 140% 100% at 100% 50%,
                    rgba(0,0,0,1) 0%,
                    rgba(0,0,0,0.94) 12%,
                    rgba(0,0,0,0.78) 28%,
                    rgba(0,0,0,0.50) 50%,
                    rgba(0,0,0,0.22) 72%,
                    rgba(0,0,0,0.05) 90%,
                    rgba(0,0,0,0) 100%
                  )
                `,
                WebkitMaskImage: `
                  linear-gradient(to left, 
                    rgba(0,0,0,1) 0%, 
                    rgba(0,0,0,0.98) 5%,
                    rgba(0,0,0,0.92) 12%,
                    rgba(0,0,0,0.78) 22%,
                    rgba(0,0,0,0.55) 38%,
                    rgba(0,0,0,0.30) 55%,
                    rgba(0,0,0,0.12) 72%,
                    rgba(0,0,0,0.03) 88%,
                    rgba(0,0,0,0) 100%
                  ),
                  linear-gradient(to top,
                    rgba(0,0,0,1) 0%,
                    rgba(0,0,0,0.96) 8%,
                    rgba(0,0,0,0.85) 20%,
                    rgba(0,0,0,0.60) 40%,
                    rgba(0,0,0,0.30) 65%,
                    rgba(0,0,0,0.08) 85%,
                    rgba(0,0,0,0) 100%
                  ),
                  linear-gradient(to bottom,
                    rgba(0,0,0,1) 0%,
                    rgba(0,0,0,0.96) 8%,
                    rgba(0,0,0,0.85) 20%,
                    rgba(0,0,0,0.60) 40%,
                    rgba(0,0,0,0.30) 65%,
                    rgba(0,0,0,0.08) 85%,
                    rgba(0,0,0,0) 100%
                  ),
                  radial-gradient(ellipse 140% 100% at 100% 50%,
                    rgba(0,0,0,1) 0%,
                    rgba(0,0,0,0.94) 12%,
                    rgba(0,0,0,0.78) 28%,
                    rgba(0,0,0,0.50) 50%,
                    rgba(0,0,0,0.22) 72%,
                    rgba(0,0,0,0.05) 90%,
                    rgba(0,0,0,0) 100%
                  )
                `,
                filter: 'drop-shadow(-8px 0 20px rgba(0,0,0,0.12))',
              }}
            />
          </div>
        )}

        {categorySlug === "business-insurance" && (
          <div className="absolute top-0 right-0 bottom-0 w-full sm:w-4/5 lg:w-3/5 pointer-events-none overflow-hidden">
            <img 
              src={BusinessInsuranceImage}
              alt="Business Insurance"
              className="h-full w-full object-contain object-center"
              style={{
                maskImage: `
                  linear-gradient(to left, 
                    rgba(0,0,0,1) 0%, 
                    rgba(0,0,0,0.98) 5%,
                    rgba(0,0,0,0.92) 12%,
                    rgba(0,0,0,0.78) 22%,
                    rgba(0,0,0,0.55) 38%,
                    rgba(0,0,0,0.30) 55%,
                    rgba(0,0,0,0.12) 72%,
                    rgba(0,0,0,0.03) 88%,
                    rgba(0,0,0,0) 100%
                  ),
                  linear-gradient(to top,
                    rgba(0,0,0,1) 0%,
                    rgba(0,0,0,0.96) 8%,
                    rgba(0,0,0,0.85) 20%,
                    rgba(0,0,0,0.60) 40%,
                    rgba(0,0,0,0.30) 65%,
                    rgba(0,0,0,0.08) 85%,
                    rgba(0,0,0,0) 100%
                  ),
                  linear-gradient(to bottom,
                    rgba(0,0,0,1) 0%,
                    rgba(0,0,0,0.96) 8%,
                    rgba(0,0,0,0.85) 20%,
                    rgba(0,0,0,0.60) 40%,
                    rgba(0,0,0,0.30) 65%,
                    rgba(0,0,0,0.08) 85%,
                    rgba(0,0,0,0) 100%
                  ),
                  radial-gradient(ellipse 140% 100% at 100% 50%,
                    rgba(0,0,0,1) 0%,
                    rgba(0,0,0,0.94) 12%,
                    rgba(0,0,0,0.78) 28%,
                    rgba(0,0,0,0.50) 50%,
                    rgba(0,0,0,0.22) 72%,
                    rgba(0,0,0,0.05) 90%,
                    rgba(0,0,0,0) 100%
                  )
                `,
                WebkitMaskImage: `
                  linear-gradient(to left, 
                    rgba(0,0,black,1) 0%, 
                    rgba(0,0,0,0.98) 5%,
                    rgba(0,0,0,0.92) 12%,
                    rgba(0,0,0,0.78) 22%,
                    rgba(0,0,0,0.55) 38%,
                    rgba(0,0,0,0.30) 55%,
                    rgba(0,0,0,0.12) 72%,
                    rgba(0,0,0,0.03) 88%,
                    rgba(0,0,0,0) 100%
                  ),
                  linear-gradient(to top,
                    rgba(0,0,0,1) 0%,
                    rgba(0,0,0,0.96) 8%,
                    rgba(0,0,0,0.85) 20%,
                    rgba(0,0,0,0.60) 40%,
                    rgba(0,0,0,0.30) 65%,
                    rgba(0,0,0,0.08) 85%,
                    rgba(0,0,0,0) 100%
                  ),
                  linear-gradient(to bottom,
                    rgba(0,0,0,1) 0%,
                    rgba(0,0,0,0.96) 8%,
                    rgba(0,0,0,0.85) 20%,
                    rgba(0,0,0,0.60) 40%,
                    rgba(0,0,0,0.30) 65%,
                    rgba(0,0,0,0.08) 85%,
                    rgba(0,0,0,0) 100%
                  ),
                  radial-gradient(ellipse 140% 100% at 100% 50%,
                    rgba(0,0,0,1) 0%,
                    rgba(0,0,0,0.94) 12%,
                    rgba(0,0,0,0.78) 28%,
                    rgba(0,0,0,0.50) 50%,
                    rgba(0,0,0,0.22) 72%,
                    rgba(0,0,0,0.05) 90%,
                    rgba(0,0,0,0) 100%
                  )
                `,
                filter: 'drop-shadow(-8px 0 20px rgba(0,0,0,0.12))',
              }}
            />
          </div>
        )}


        {/* Content Container - Left Side */}
        <div className="relative z-10 h-full mx-auto max-w-7xl px-4 sm:px-6">
          <div className="flex h-full flex-col justify-center">
            {/* Left Content - Text */}
            <motion.div 
              className="max-w-2xl"
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8, ease: "easeOut" }}
            >
              {/* Premium Badge - Compact */}
              <motion.div 
                className="w-fit inline-flex items-center gap-2 rounded-full border border-blue-500/60 dark:border-blue-400/50 bg-blue-500/20 dark:bg-blue-500/15 backdrop-blur-md px-3 py-1.5 text-xs font-semibold text-blue-900 dark:text-blue-100 shadow-lg hover:bg-blue-500/30 dark:hover:bg-blue-500/20 transition"
                whileHover={{ scale: 1.05 }}
              >
                <ShieldCheck size={13} className="text-blue-700 dark:text-blue-300" />
                Featured plans • Compare & buy with confidence
              </motion.div>

              {/* Main Title - Strong Contrast with Icon */}
              <div className="flex items-center gap-3 mt-4">
                {(() => {
                  const IconComponent = getCategoryIcon(categorySlug);
                  return IconComponent ? (
                    <IconComponent className="w-8 h-8 sm:w-10 sm:h-10 text-blue-600 dark:text-blue-400 flex-shrink-0" />
                  ) : null;
                })()}
                <h1 className="text-3xl sm:text-4xl lg:text-5xl font-black tracking-tight text-slate-900 dark:text-white leading-[1.2] drop-shadow-sm">
                  {category.title}
                </h1>
              </div>

              {/* Subtitle - Readable */}
              <p className="mt-2 text-sm sm:text-base lg:text-lg text-slate-800 dark:text-slate-100 max-w-xl leading-relaxed font-semibold line-clamp-2">
                {category.subtitle}
              </p>

              {/* CTA Buttons - Compact Content-Width */}
              <motion.div 
                className="flex flex-col sm:flex-row gap-2.5 mt-6 w-fit"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.8, delay: 0.2, ease: "easeOut" }}
              >
                {/* Primary Button - Compact */}
                <motion.button
                  onClick={() => navigate("/dashboard")}
                  whileHover={{ scale: 1.05, y: -2 }}
                  whileTap={{ scale: 0.98 }}
                  className="w-fit inline-flex items-center justify-center gap-1.5 rounded-xl bg-gradient-to-br from-blue-600 via-blue-600 to-indigo-600 hover:from-blue-700 hover:via-blue-700 hover:to-indigo-700 px-4 py-2 text-xs font-bold text-white shadow-lg hover:shadow-xl transition backdrop-blur-sm border border-white/20 dark:border-blue-400/20"
                >
                  <Bot size={15} />
                  <span className="hidden sm:inline">Open Dashboard</span>
                  <span className="sm:hidden">Dashboard</span>
                </motion.button>

                {/* Secondary Button - Filters (Mobile) */}
                <motion.button
                  onClick={() => setMobileFiltersOpen(true)}
                  whileHover={{ scale: 1.05, y: -2 }}
                  whileTap={{ scale: 0.98 }}
                  className="w-fit inline-flex lg:hidden items-center justify-center gap-1.5 rounded-xl border border-slate-400/40 dark:border-slate-600/40 backdrop-blur-md bg-white/15 dark:bg-slate-800/25 hover:bg-white/25 dark:hover:bg-slate-800/35 px-4 py-2 text-xs font-bold text-slate-800 dark:text-slate-100 shadow-lg transition"
                >
                  <Filter size={15} />
                  Filters
                </motion.button>

                {/* Plans Counter Card - Compact */}
                <motion.div 
                  whileHover={{ scale: 1.05, y: -2 }}
                  className="hidden lg:inline-flex w-fit items-center justify-center rounded-xl border border-slate-400/40 dark:border-slate-600/40 backdrop-blur-md bg-white/15 dark:bg-slate-800/25 hover:bg-white/25 dark:hover:bg-slate-800/35 px-4 py-2 text-xs font-bold text-slate-800 dark:text-slate-100 shadow-lg transition"
                >
                  <LineChart size={15} className="text-blue-600 dark:text-blue-400 mr-1" />
                  <span className="font-black text-slate-900 dark:text-white">{filtered.length}</span>
                  <span className="ml-1">plans matched</span>
                </motion.div>
              </motion.div>
            </motion.div>
          </div>
        </div>
      </div>

      <div className="mx-auto mb-32 grid max-w-7xl grid-cols-1 gap-8 px-4 py-8 sm:px-6 sm:py-10 lg:mb-54 lg:h-[calc(100vh-8rem)] lg:min-h-[700px] lg:grid-cols-[360px_1fr]">
        <aside className="hidden lg:block lg:h-full">
          <div className="sticky top-28 h-full rounded-[2.2rem] border border-slate-200 bg-white p-6 shadow-sm">
            <FiltersPanel
              search={search}
              setSearch={setSearch}
              premiumMin={premiumMin}
              premiumMax={premiumMax}
              premiumRange={premiumRange}
              setPremiumRange={setPremiumRange}
              coverageMin={coverageMin}
              coverageMax={coverageMax}
              coverageRange={coverageRange}
              setCoverageRange={setCoverageRange}
              claimMin={claimMin}
              setClaimMin={setClaimMin}
              policyType={policyType}
              setPolicyType={setPolicyType}
              policyTypes={policyTypes}
              sortBy={sortBy}
              setSortBy={setSortBy}
              emiOnly={emiOnly}
              setEmiOnly={setEmiOnly}
              familyOnly={familyOnly}
              setFamilyOnly={setFamilyOnly}
              resetFilters={resetFilters}
            />
          </div>
        </aside>

        <section className="space-y-6 lg:flex lg:h-full lg:min-w-0 lg:flex-col lg:overflow-hidden">
          <div className="scrollbar-none space-y-6 lg:min-h-0 lg:flex-1 lg:overflow-y-auto lg:pr-2">
            <div className="grid grid-cols-1 gap-5 md:grid-cols-2">
              {filtered.map((p) => (
              <motion.div
                key={p.id}
                initial={{ opacity: 0, y: 12 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.25 }}
                className="group min-w-0 overflow-hidden rounded-3xl border border-slate-200 bg-white shadow-sm transition hover:-translate-y-1 hover:shadow-[0_24px_80px_rgba(2,6,23,0.10)] sm:rounded-[2.2rem]"
              >
                <div className="p-4 sm:p-6">
                  <div className="flex min-w-0 items-start justify-between gap-3">
                    <div className="flex min-w-0 items-center gap-3">
                      <PolicyLogo brand={p.companyBrand} />
                      <div className="min-w-0">
                        <div className="truncate text-sm font-black text-slate-900">{p.company}</div>
                        <div className="truncate text-xs font-semibold text-slate-500">{p.policyName}</div>
                      </div>
                    </div>
                    {p.aiBadge ? (
                      <span className="max-w-[8.5rem] shrink-0 rounded-full bg-blue-600/10 px-3 py-2 text-center text-[11px] font-black leading-tight text-blue-700">
                        {p.aiBadge}
                      </span>
                    ) : null}
                  </div>

                  {/* Policy card metric labels and CTA button labels. Values come from src/data/catalog.js. */}
                  <div className="mt-5 grid grid-cols-2 gap-3">
                    <div className="min-w-0 rounded-2xl bg-slate-50 p-4">
                      <div className="text-[11px] font-bold text-slate-500">Monthly</div>
                      <div className="mt-1 break-words text-base font-black leading-tight text-slate-900 sm:text-lg">{formatInr(p.premiumMonthly)}</div>
                    </div>
                    <div className="min-w-0 rounded-2xl bg-slate-50 p-4">
                      <div className="text-[11px] font-bold text-slate-500">Coverage</div>
                      <div className="mt-1 break-words text-base font-black leading-tight text-slate-900 sm:text-lg">{p.coverageLabel}</div>
                    </div>
                    <div className="min-w-0 rounded-2xl bg-slate-50 p-4">
                      <div className="text-[11px] font-bold text-slate-500">Claim Ratio</div>
                      <div className="mt-1 break-words text-base font-black leading-tight text-slate-900 sm:text-lg">{p.claimSettlementRatio}%</div>
                    </div>
                    <div className="min-w-0 rounded-2xl bg-slate-50 p-4">
                      <div className="text-[11px] font-bold text-slate-500">Validity</div>
                      <div className="mt-1 break-words text-base font-black leading-tight text-slate-900 sm:text-lg">{p.validityYears} yr</div>
                    </div>
                  </div>

                  <div className="mt-5 flex flex-wrap items-center gap-2">
                    <span className="rounded-full border border-slate-200 bg-white px-3 py-2 text-[11px] font-bold text-slate-700">
                      {p.policyType}
                    </span>
                    <span className="rounded-full border border-slate-200 bg-white px-3 py-2 text-[11px] font-bold text-slate-700">
                      Rating {p.rating.toFixed(1)}
                    </span>
                    {p.emiAvailable ? (
                      <span className="rounded-full border border-emerald-200 bg-emerald-50 px-3 py-2 text-[11px] font-black text-emerald-700">
                        EMI Available
                      </span>
                    ) : null}
                    {p.familyCoverage ? (
                      <span className="rounded-full border border-indigo-200 bg-indigo-50 px-3 py-2 text-[11px] font-black text-indigo-700">
                        Family
                      </span>
                    ) : null}
                  </div>

                  <ul className="mt-5 space-y-2">
                    {p.keyBenefits.slice(0, 3).map((b) => (
                      <li key={b} className="flex min-w-0 items-center gap-2 text-sm font-semibold text-slate-600">
                        <BadgeCheck size={16} className="shrink-0 text-blue-600" />
                        <span className="min-w-0 truncate">{b}</span>
                      </li>
                    ))}
                  </ul>

                  <div className="mt-6 grid grid-cols-1 gap-3 sm:grid-cols-3">
                   
                   
                   
                    {features?.policyCompare && (
  <button
    onClick={() => toggleCompare(p.id)}
    className={[
      "inline-flex min-w-0 items-center justify-center gap-2 rounded-2xl border px-3 py-3 text-sm font-black shadow-sm transition",
      compareIds.includes(p.id)
        ? "border-blue-600 bg-blue-600 text-white"
        : "border-slate-200 bg-white text-slate-800 hover:bg-slate-50",
    ].join(" ")}
  >
    <Scale size={16} className="shrink-0" />
    <span className="truncate">Compare</span>
  </button>
)}



                    <Link
                      to={`/policies/${p.id}`}
                      className="inline-flex min-w-0 items-center justify-center rounded-2xl border border-slate-200 bg-white px-3 py-3 text-sm font-black text-slate-800 shadow-sm hover:bg-slate-50"
                    >
                      <span className="truncate">Details</span>
                    </Link>
                    <button
                      onClick={() => onBuy(p.id)}
                      className="inline-flex min-w-0 items-center justify-center rounded-2xl bg-gradient-to-r from-blue-600 to-indigo-600 px-3 py-3 text-sm font-black text-white shadow-sm hover:opacity-95"
                    >
                      <span className="truncate">Buy Now</span>
                    </button>
                  </div>
                </div>
              </motion.div>
              ))}
            </div>

          {features?.policyCompare && compareIds.length ? (
            <div className="sticky bottom-5 z-20 rounded-3xl border border-slate-200 bg-white/90 p-4 shadow-[0_24px_80px_rgba(2,6,23,0.12)] backdrop-blur-xl sm:rounded-[2.2rem] sm:p-5">
              <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
                <div>
                  <div className="text-sm font-black text-slate-900">Compare selected plans</div>
                  <div className="mt-1 text-xs font-semibold text-slate-500">Up to 3 plans • {compareIds.length} selected</div>
                </div>
                <div className="grid grid-cols-1 gap-3 sm:flex">
                  <button
                    onClick={() => setCompareIds([])}
                    className="rounded-2xl border border-slate-200 bg-white px-5 py-3 text-sm font-bold text-slate-800 shadow-sm hover:bg-slate-50"
                  >
                    Clear
                  </button>
                  <button
                    onClick={() => navigate(`/policies/${compareIds[0]}?compare=${encodeURIComponent(compareIds.join(","))}`)}
                    className="rounded-2xl bg-gradient-to-r from-blue-600 to-indigo-600 px-6 py-3 text-sm font-black text-white shadow-sm hover:opacity-95"
                  >
                    View Comparison
                  </button>
                </div>
              </div>
            </div>
            ) : null}
          </div>

          <PolicyListingFooter
  filteredCount={filtered.length}
  resetFilters={resetFilters}
  navigate={navigate}
  features={features}
/>
        
        
        
        </section>
      </div>

      <AnimatePresence>
        {mobileFiltersOpen ? (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 bg-black/40 p-3 sm:p-4 lg:hidden"
            onClick={() => setMobileFiltersOpen(false)}
          >
            <motion.div
              initial={{ y: 20, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              exit={{ y: 20, opacity: 0 }}
              transition={{ duration: 0.25 }}
              className="mx-auto max-h-[calc(100vh-1.5rem)] max-w-lg overflow-auto rounded-3xl border border-slate-200 bg-white p-4 shadow-xl sm:max-h-[calc(100vh-2rem)] sm:rounded-[2.2rem] sm:p-6"
              onClick={(e) => e.stopPropagation()}
            >
              <FiltersPanel
                onClose={() => setMobileFiltersOpen(false)}
                search={search}
                setSearch={setSearch}
                premiumMin={premiumMin}
                premiumMax={premiumMax}
                premiumRange={premiumRange}
                setPremiumRange={setPremiumRange}
                coverageMin={coverageMin}
                coverageMax={coverageMax}
                coverageRange={coverageRange}
                setCoverageRange={setCoverageRange}
                claimMin={claimMin}
                setClaimMin={setClaimMin}
                policyType={policyType}
                setPolicyType={setPolicyType}
                policyTypes={policyTypes}
                sortBy={sortBy}
                setSortBy={setSortBy}
                emiOnly={emiOnly}
                setEmiOnly={setEmiOnly}
                familyOnly={familyOnly}
                setFamilyOnly={setFamilyOnly}
                resetFilters={resetFilters}
              />
            </motion.div>
          </motion.div>
        ) : null}
      </AnimatePresence>
    </div>
  );
};

export default CategoryPage;
