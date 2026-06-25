import { useLocation, Link } from "react-router-dom";
import { ChevronLeft, Info, Check, Zap } from "lucide-react";

// Information pages for footer navigation - displays details about insurance products and company info
// Each section contains real content to educate users about insurance options
const InfoPage = () => {
  const location = useLocation();
  const pathname = location.pathname.substring(1);

  // Map of all footer pages with detailed content
  // Edit content here to update information displayed across the site
  const pages = {
    "general-insurance": {
      title: "General Insurance",
      description: "Comprehensive coverage for property, liability, and other general insurance needs.",
      features: [
        "Property damage coverage",
        "Third-party liability protection",
        "Fire and theft protection",
        "Accidental damage coverage",
      ],
      content: "General insurance protects your assets against unexpected events. Our policies cover property damage, theft, fire, and liability claims with quick settlement.",
    },
    "life-insurance": {
      title: "Life Insurance",
      description: "Protect your family's future with our comprehensive life insurance plans.",
      features: [
        "Death benefit protection",
        "Family financial security",
        "Term and whole life options",
        "Flexible coverage amounts",
      ],
      content: "Life insurance ensures your family is financially secure if something happens to you. Choose from term life for affordability or whole life for lifelong protection.",
    },
    "term-insurance": {
      title: "Term Insurance",
      description: "Affordable term life insurance for maximum coverage at minimum cost.",
      features: [
        "Lowest premiums",
        "High coverage amounts",
        "Simple claims process",
        "Coverage up to 99 years",
      ],
      content: "Term insurance is the most affordable form of life insurance. Get maximum coverage for a fixed period at a fraction of other insurance costs.",
    },
    "investment": {
      title: "Investment Plans",
      description: "Grow your wealth with our investment-linked insurance plans.",
      features: [
        "Insurance + Investment combined",
        "Market-linked returns",
        "Flexible withdrawal options",
        "Tax benefits",
      ],
      content: "Our investment plans combine insurance protection with wealth creation. Build your savings while ensuring your family's security.",
    },
    "health-insurance": {
      title: "Health Insurance",
      description: "Comprehensive health coverage for you and your family.",
      features: [
        "Hospitalization coverage",
        "Pre and post-hospitalization",
        "Maternity benefits",
        "Cashless treatment",
      ],
      content: "Protect yourself and your family from rising healthcare costs. Get immediate access to quality healthcare with our comprehensive health plans.",
    },
    "other-insurance": {
      title: "Other Insurance Products",
      description: "Explore our complete range of specialized insurance solutions.",
      features: [
        "Travel insurance",
        "Home insurance",
        "Vehicle insurance",
        "Business insurance",
      ],
      content: "Beyond standard policies, we offer specialized coverage for unique needs. Explore our range of tailored insurance solutions.",
    },
    "articles": {
      title: "Insurance Articles",
      description: "Read informative articles about insurance and financial planning.",
      features: [
        "Expert insurance tips",
        "Financial planning guides",
        "Insurance FAQs",
        "Industry updates",
      ],
      content: "Learn everything you need to know about insurance. Our article library covers everything from policy selection to claims management.",
    },
    "reviews": {
      title: "Customer Reviews",
      description: "See what our satisfied customers have to say.",
      features: [
        "4.8/5 star rating",
        "10,000+ verified reviews",
        "Transparent feedback",
        "Real customer experiences",
      ],
      content: "Don't just take our word for it. Read honest reviews from thousands of satisfied customers who trust Agile Claim for their insurance needs.",
    },
    "companies": {
      title: "Partner Insurance Companies",
      description: "Discover the trusted insurance companies we partner with.",
      features: [
        "Top-rated providers",
        "Government regulated",
        "Fast claim settlement",
        "24/7 customer support",
      ],
      content: "We partner with India's most trusted and regulated insurance companies to ensure you get the best coverage and service.",
    },
    "newsroom": {
      title: "Newsroom",
      description: "Latest news and updates from Agile Claim.",
      features: [
        "Press releases",
        "Industry news",
        "Company milestones",
        "Customer stories",
      ],
      content: "Stay updated with the latest from Agile Claim. Follow our press releases and news for industry insights and company updates.",
    },
    "awards": {
      title: "Awards & Recognition",
      description: "Recognition and awards received by Agile Claim.",
      features: [
        "Industry awards",
        "Customer service excellence",
        "Innovation recognition",
        "Trusted brand status",
      ],
      content: "Our commitment to excellence has been recognized by industry bodies and customers. We're proud to be among India's most trusted insurance brokers.",
    },
    "about-us": {
      title: "About Agile Claim",
      description: "Learn more about Agile Claim and our mission.",
      features: [
        "10+ years of experience",
        "50,000+ customers served",
        "Expert team",
        "Mission-driven approach",
      ],
      content: "Founded in 2014, Agile Claim is on a mission to make insurance simple, transparent, and accessible to everyone. We believe in empowering Indians with the right insurance protection.",
    },
    "careers": {
      title: "Join Our Team",
      description: "Build a career with India's fastest-growing insurance broker.",
      features: [
        "Exciting opportunities",
        "Competitive compensation",
        "Growth potential",
        "Supportive culture",
      ],
      content: "If you're passionate about insurance and customer service, we'd love to have you on our team. Explore career opportunities at Agile Claim.",
    },
    "legal-policies": {
      title: "Legal & Administrative Policies",
      description: "Review our legal, privacy, and administrative policies.",
      features: [
        "Privacy policy",
        "Terms of service",
        "Disclaimer",
        "Data protection",
      ],
      content: "We take your privacy and data security seriously. Review our policies to understand how we protect your information and serve you.",
    },
    "contact": {
      title: "Contact Us",
      description: "Get in touch with our support team.",
      features: [
        "24/7 customer support",
        "Phone support",
        "Email support",
        "Office locations",
      ],
      content: "Have questions? Our support team is ready to help. Contact us via phone, email, or visit our office.",
    },
  };

  const currentPage = pages[pathname] || {
    title: "Page Not Found",
    description: "The page you're looking for doesn't exist.",
    features: [],
    content: "Sorry, we couldn't find the page you're looking for.",
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-slate-50 to-white dark:from-[#070B14] dark:to-[#070B14]">
      <div className="max-w-4xl mx-auto px-4 py-12">
        {/* Back button */}
        <Link to="/" className="inline-flex items-center gap-2 text-blue-600 hover:text-blue-700 mb-8 font-semibold dark:text-blue-300 dark:hover:text-blue-200">
          <ChevronLeft size={20} />
          Back to Home
        </Link>

        {/* Main content card */}
        <div className="rounded-3xl border border-slate-200 bg-white p-8 shadow-sm dark:border-white/10 dark:bg-white/5">
          <div className="flex items-start gap-4">
            <div className="grid h-14 w-14 place-items-center rounded-xl bg-blue-50 dark:bg-blue-500/10">
              <Info className="text-blue-600 dark:text-blue-300" size={24} />
            </div>
            <div className="flex-1">
              <h1 className="text-3xl font-black text-slate-900 dark:text-white">{currentPage.title}</h1>
              <p className="mt-2 text-lg text-slate-600 dark:text-slate-300">{currentPage.description}</p>
            </div>
          </div>

          {/* Content section */}
          <div className="mt-8 rounded-lg border border-slate-200 bg-slate-50 p-6 dark:border-white/10 dark:bg-white/5">
            <p className="text-slate-700 leading-relaxed dark:text-slate-200">{currentPage.content}</p>
          </div>

          {/* Features grid */}
          {currentPage.features.length > 0 && (
            <div className="mt-8">
              <h2 className="text-xl font-bold text-slate-900 mb-4 dark:text-white">Key Benefits</h2>
              <div className="grid gap-4 md:grid-cols-2">
                {currentPage.features.map((feature) => (
                  <div key={feature} className="flex items-start gap-3 rounded-lg border border-slate-200 bg-white p-4 dark:border-white/10 dark:bg-white/5">
                    <Check className="text-emerald-600 shrink-0 mt-1" size={20} />
                    <span className="font-semibold text-slate-700 dark:text-slate-200">{feature}</span>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* CTA section */}
          <div className="mt-8 grid gap-4 md:grid-cols-2">
            <div className="rounded-lg border border-blue-200 bg-blue-50 p-6 dark:border-blue-400/20 dark:bg-blue-500/10">
              <h3 className="text-lg font-bold text-slate-900 dark:text-white">Need Personalized Advice?</h3>
              <p className="mt-2 text-sm text-slate-600 dark:text-slate-300">
                Our insurance experts are ready to help you find the perfect plan for your needs.
              </p>
              <Link
                to="/dashboard/contact"
                className="mt-4 inline-flex items-center gap-2 rounded-lg bg-blue-600 px-4 py-2 text-sm font-bold text-white hover:bg-blue-700"
              >
                <Zap size={16} />
                Contact Support
              </Link>
            </div>

            <div className="rounded-lg border border-slate-200 bg-white p-6 dark:border-white/10 dark:bg-white/5">
              <h3 className="text-lg font-bold text-slate-900 dark:text-white">Quick Comparison</h3>
              <p className="mt-2 text-sm text-slate-600 dark:text-slate-300">
                Compare our plans with competitors and find the best coverage at the best price.
              </p>
              <Link
                to="/"
                className="mt-4 inline-flex items-center gap-2 rounded-lg border border-slate-200 px-4 py-2 text-sm font-bold text-slate-700 hover:bg-slate-50 dark:border-white/10 dark:text-slate-100 dark:hover:bg-white/10"
              >
                <ChevronLeft size={16} />
                Explore Plans
              </Link>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default InfoPage;
