const inr = (value) => `₹${Number(value).toLocaleString("en-IN")}`;

// Change category slugs, titles, subtitles, gradients, and company lists here to update homepage cards and listing pages.
export const categories = [
  {
    slug: "health-insurance",
    title: "Health Insurance",
    subtitle: "AI-guided health coverage with seamless claims and premium care.",
    theme: { from: "from-blue-600", to: "to-indigo-600" },
    companies: ["Star Health", "HDFC Ergo", "ICICI Lombard", "Niva Bupa", "Care Health"],
  },
  {
    slug: "term-insurance",
    title: "Term Insurance",
    subtitle: "Future-ready protection plans with high claim confidence.",
    theme: { from: "from-indigo-600", to: "to-blue-700" },
    companies: ["LIC", "Max Life", "Tata AIA", "HDFC Life", "SBI Life"],
  },
  {
    slug: "car-insurance",
    title: "Car Insurance",
    subtitle: "Instant appraisal + smart roadside assistance with AI risk scoring.",
    theme: { from: "from-sky-600", to: "to-blue-800" },
    companies: ["ICICI Lombard", "HDFC Ergo", "Bajaj Allianz", "Tata AIG", "Reliance General"],
  },
  {
    slug: "life-insurance",
    title: "Life Insurance",
    subtitle: "Premium savings + protection with transparent benefits.",
    theme: { from: "from-blue-700", to: "to-indigo-700" },
    companies: ["LIC", "HDFC Life", "Max Life", "ICICI Prudential", "Tata AIA"],
  },
  {
    slug: "travel-insurance",
    title: "Travel Insurance",
    subtitle: "Global protection for trips, delays, health events, and baggage.",
    theme: { from: "from-cyan-600", to: "to-blue-700" },
    companies: ["Tata AIG", "HDFC Ergo", "ICICI Lombard", "Care", "Reliance General"],
  },
  {
    slug: "home-insurance",
    title: "Home Insurance",
    subtitle: "Safeguard your home with disaster-ready coverage and add-ons.",
    theme: { from: "from-blue-600", to: "to-slate-900" },
    companies: ["HDFC Ergo", "Bajaj Allianz", "Tata AIG", "ICICI Lombard", "New India Assurance"],
  },
  {
    slug: "business-insurance",
    title: "Business Insurance",
    subtitle: "Enterprise-grade liability, asset, and cyber protection.",
    theme: { from: "from-indigo-700", to: "to-slate-900" },
    companies: ["Tata AIG", "HDFC Ergo", "ICICI Lombard", "Bajaj Allianz", "New India Assurance"],
  },
];

// Company initials and Tailwind color classes control the circular company badges in policy cards.
const companyLogos = {
  "Star Health": { initials: "SH", color: "bg-emerald-500" },
  "HDFC Ergo": { initials: "HE", color: "bg-blue-600" },
  "ICICI Lombard": { initials: "IL", color: "bg-orange-500" },
  "Niva Bupa": { initials: "NB", color: "bg-sky-500" },
  "Care Health": { initials: "CH", color: "bg-indigo-600" },
  LIC: { initials: "LIC", color: "bg-blue-700" },
  "Max Life": { initials: "ML", color: "bg-violet-600" },
  "Tata AIA": { initials: "TA", color: "bg-slate-900" },
  "HDFC Life": { initials: "HL", color: "bg-blue-700" },
  "SBI Life": { initials: "SL", color: "bg-sky-700" },
  "Bajaj Allianz": { initials: "BA", color: "bg-amber-500" },
  "Tata AIG": { initials: "TG", color: "bg-slate-800" },
  "Reliance General": { initials: "RG", color: "bg-rose-600" },
  "ICICI Prudential": { initials: "IP", color: "bg-red-600" },
  "New India Assurance": { initials: "NIA", color: "bg-indigo-700" },
  Care: { initials: "CARE", color: "bg-indigo-600" },
};

// These benefit texts are reused by generated policies. Keep each item short so cards stay clean on mobile.
const benefitSets = {
  health: [
    "Cashless hospital network",
    "AI wellness scoring & reminders",
    "Pre/post hospitalization cover",
    "Daycare procedures covered",
    "No-claim bonus benefits",
  ],
  term: [
    "High claim settlement confidence",
    "Flexible payout options",
    "Critical illness add-on",
    "Premium waiver on disability",
    "AI risk-fit recommendation",
  ],
  car: [
    "Zero depreciation add-on",
    "Instant claim photo appraisal",
    "Roadside assistance",
    "Cashless garage network",
    "Engine protect cover",
  ],
  travel: [
    "Trip delay & cancellation cover",
    "Emergency medical cover abroad",
    "Baggage loss protection",
    "24×7 global assistance",
    "Smart alerts for risk zones",
  ],
  home: [
    "Fire & natural calamities cover",
    "Theft and burglary protection",
    "Personal accident add-on",
    "Home contents coverage",
    "Smart disaster readiness tips",
  ],
  business: [
    "Liability + asset protection",
    "Cyber incident response cover",
    "Employee coverage add-ons",
    "Business interruption cover",
    "AI compliance & risk analysis",
  ],
};

// Policy names, generated pricing, coverage, badges, exclusions, claim steps, FAQs, and reviews are assembled here.
const makePolicy = (categorySlug, company, index) => {
  const base = {
    id: `${categorySlug}_${company.toLowerCase().replace(/\s+/g, "-")}_${index}`,
    categorySlug,
    company,
    policyName: `${company} ${categorySlug.replace("-", " ").replace(/\b\w/g, (m) => m.toUpperCase())} Plan ${index}`,
    claimSettlementRatio: 92 + ((index * 3) % 7),
    validityYears: 1 + (index % 3),
    emiAvailable: index % 2 === 0,
    familyCoverage: categorySlug === "health-insurance" ? index % 2 === 1 : false,
    policyType:
      categorySlug === "health-insurance"
        ? index % 2 === 0
          ? "Individual"
          : "Family Floater"
        : categorySlug === "term-insurance"
          ? index % 2 === 0
            ? "Level Term"
            : "Increasing Term"
          : categorySlug === "car-insurance"
            ? index % 2 === 0
              ? "Comprehensive"
              : "Third Party"
            : "Standard",
    rating: 4.2 + ((index % 3) * 0.2),
  };

  const monthlyPremium =
    categorySlug === "term-insurance"
      ? 799 + index * 120
      : categorySlug === "car-insurance"
        ? 499 + index * 140
        : categorySlug === "travel-insurance"
          ? 349 + index * 110
          : categorySlug === "home-insurance"
            ? 599 + index * 130
            : categorySlug === "business-insurance"
              ? 1299 + index * 220
              : 899 + index * 160;

  const coverageAmount =
    categorySlug === "term-insurance"
      ? 5000000 + index * 2500000
      : categorySlug === "car-insurance"
        ? 300000 + index * 200000
        : categorySlug === "travel-insurance"
          ? 500000 + index * 300000
          : categorySlug === "business-insurance"
            ? 2500000 + index * 2000000
            : 700000 + index * 600000;

  const keyBenefits =
    categorySlug === "health-insurance"
      ? benefitSets.health
      : categorySlug === "term-insurance"
        ? benefitSets.term
        : categorySlug === "car-insurance"
          ? benefitSets.car
          : categorySlug === "travel-insurance"
            ? benefitSets.travel
            : categorySlug === "home-insurance"
              ? benefitSets.home
              : benefitSets.business;

  return {
    ...base,
    companyBrand: companyLogos[company] ?? { initials: company.slice(0, 2).toUpperCase(), color: "bg-blue-600" },
    premiumMonthly: monthlyPremium,
    premiumYearly: Math.round(monthlyPremium * 12 * 0.92),
    coverageAmount,
    coverageLabel: inr(coverageAmount),
    premiumLabel: inr(monthlyPremium),
    aiBadge: index === 1 ? "Recommended" : index === 3 ? "Best Value" : index === 4 ? "Low Premium" : null,
    keyBenefits,
    exclusions: [
      "Fraudulent or pre-disclosed false claims",
      "Intentional self-inflicted injuries/damages",
      "War, nuclear events, and illegal activities",
    ],
    claimProcess: [
      "Initiate claim via Agile AI Assistant",
      "Upload documents + smart verification",
      "Survey & review by claim team",
      "Approval with instant payout tracking",
    ],
    faqs: [
      { q: "How fast can claims be processed?", a: "Most claims are verified within 24–72 hours in this demo flow." },
      { q: "Is EMI available on this plan?", a: base.emiAvailable ? "Yes — monthly EMI is supported." : "This plan is pay-in-full only." },
      { q: "What affects the policy health score?", a: "Premium consistency, claim history, risk score, and coverage utilization." },
    ],
    reviews: [
      { name: "Riya Mehta", rating: 5, text: "Smooth checkout and super premium UI. Love the AI recommendations." },
      { name: "Aman Verma", rating: 4, text: "Claim timeline is clear. Filter + compare is very helpful." },
      { name: "Neha Kapoor", rating: 5, text: "Looks like a real enterprise portal. Feels trustworthy." },
    ],
  };
};

export const policies = categories.flatMap((c) =>
  c.companies.slice(0, 2).map((company, idx) => makePolicy(c.slug, company, idx + 1)),
);

export const getCategoryBySlug = (slug) => categories.find((c) => c.slug === slug);
export const getPoliciesByCategory = (slug) => policies.filter((p) => p.categorySlug === slug);
export const getPolicyById = (id) => policies.find((p) => p.id === id);
