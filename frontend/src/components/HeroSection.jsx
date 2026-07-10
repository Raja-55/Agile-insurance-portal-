// Homepage hero, service cards, partner names, CTA text, and inline hero animation live in this component.
import {assets} from "../assets/assets";
import { Link } from "react-router-dom";
import { useEffect, useState } from "react";
import { apiRequest } from "../utils/api";
import { useAuth } from "../contexts/useAuth";



const LandingPage = () => {
  const { isAuthenticated } = useAuth();
  const [policyForms, setPolicyForms] = useState({
  healthForm: true,
  motorForm: true,
  lifeForm: true,
  travelForm: true,
  businessForm: true,
});
useEffect(() => {
  const fetchSettings = async () => {
    try {
      const response = await apiRequest("/api/admin/settings");
      setPolicyForms(
        response?.data?.policyForms || {
          healthForm: true,
          motorForm: true,
          lifeForm: true,
          travelForm: true,
          businessForm: true,
        }
      );

    } catch (error) {
      console.error(error);
    }
  };

  fetchSettings();
}, []);
  // Change service card titles, descriptions, routes, images, and badges from this array.
  const services = [
  policyForms.healthForm && {
    title: "Health Insurance",
    desc: "Comprehensive medical coverage with AI-driven wellness tracking.",
    route: "/health-insurance",
    image: assets.InsuranceHealth,
    // icon: ...
  },

  policyForms.motorForm && {
    title: "Vehicle Insurance",
    desc: "Smart appraisals and instant roadside assistance.",
    route: "/car-insurance",
    image: assets.InsuranceCar,
    // icon: ...
  },

  policyForms.lifeForm && {
    title: "Life Insurance",
    desc: "Secure your family's future with flexible premium plans.",
    route: "/life-insurance",
    image: assets.InsuranceLife,
    // icon: ...
  },

  policyForms.travelForm && {
    title: "Travel Insurance",
    desc: "Global coverage for emergencies and lost baggage.",
    route: "/travel-insurance",
    image: assets.InsuranceTravel,
    // icon: ...
  },

  // Home Insurance is not controlled by admin settings,
  // so keep it always visible.
  {
    title: "Home Insurance",
    desc: "Protection for your sanctuary against disasters.",
    route: "/home-insurance",
    image: assets.InsuranceHome,
    // icon: ...
  },

  policyForms.businessForm && {
    title: "Business Insurance",
    desc: "Liability and asset protection for modern enterprises.",
    route: "/business-insurance",
    image: assets.InsuranceBusiness,
    // icon: ...
  },
].filter(Boolean);



  // Update this list to change the scrolling partner logo strip.
  const trustedPartners = [
    {
      name: "Solera",
      logo: "https://commons.wikimedia.org/wiki/Special:Redirect/file/Solera_Logo_CMYK-master.svg",
    },
    {
      name: "SBI General Insurance",
      logo: "https://commons.wikimedia.org/wiki/Special:Redirect/file/State%20Bank%20of%20India.svg",
    },
    {
      name: "Policybazaar",
      logo: "https://commons.wikimedia.org/wiki/Special:Redirect/file/Policybazaar%20Logo.gif",
    },
    {
      name: "HDFC ERGO",
      logo: "https://upload.wikimedia.org/wikipedia/en/thumb/5/56/HDFC_ERGO_Logo_2025.png/250px-HDFC_ERGO_Logo_2025.png",
    },
    {
      name: "Bajaj Allianz",
      logo: "https://pnghdpro.com/wp-content/themes/pnghdpro/download/social-media-and-brands/bajaj-allianz-logo.png",
      logoClass: "h-14 w-38",
    },
    {
      name: "ICICI Lombard",
      logo: "https://upload.wikimedia.org/wikipedia/en/thumb/0/05/ICICI_Lombard.svg/250px-ICICI_Lombard.svg.png",
    },
    {
      name: "Tata AIG",
      logo: "https://commons.wikimedia.org/wiki/Special:Redirect/file/TATA_AIG_logo.png",
    },
    {
      name: "New India Assurance",
      logo: "https://commons.wikimedia.org/wiki/Special:Redirect/file/New%20India%20Assurance.svg",
    },
    {
      name: "Reliance General",
      logo: "https://www.reliancegeneral.co.in/siteassets/rgiclassets/images/logo.png",
    },
    {
      name: "Bharat Financial",
      logo: "https://media.fortuneindia.com/fortune-india/import/company/logos/Bharat%20Financial%20Inclusion%20Ltd.png?w=260&q=90",
      logoClass: "h-14 w-38",
    }
  ];

  return (
    <div className="w-full bg-white font-sans">
      
      {/* SECTION 1: HERO SECTION */}
      <section className="relative w-full min-h-[auto] lg:min-h-screen flex items-center px-4 py-10 sm:px-6 lg:px-24 lg:pb-18 lg:pt-0 overflow-hidden">
        <div className="container mx-auto grid grid-cols-1 lg:grid-cols-2 gap-8 lg:gap-16 items-center">
          
          {/* IMAGE CONTENT (Shifted to Left and Made Bigger) */}
          <div className="order-2 lg:order-1"> {/* CHANGED: Swapped order */}
            <img
              src={assets.HeroSectionImage}
              alt="Hero Section Illustration"
              className="w-full max-w-sm sm:max-w-lg lg:max-w-2xl mx-auto animate-bounce-slow" // CHANGED: Increased from max-w-lg to max-w-2xl
            />
          </div>

          {/* RIGHT CONTENT (Text shifted to Right) */}
          <div className="flex flex-col items-center space-y-5 text-center z-10 order-1 lg:order-2 lg:items-start lg:space-y-8 lg:text-left"> {/* CHANGED: Swapped order */}
            {/* Main homepage headline and highlighted phrase. */}
            <h1 className="text-3xl sm:text-4xl lg:text-5xl font-extrabold text-slate-900 leading-[1.1] tracking-tight">
              Claim Smarter, <br />
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-600 to-indigo-600">Not Harder!</span>
            </h1>
            
            {/* Short hero description under the headline. */}
            <p className="text-slate-500 text-base sm:text-lg max-w-lg leading-relaxed">
              Experience the future of insurance. Report vehicle claims in seconds with our AI-driven appraisal system. Simpler, faster, better.
            </p>
            
            <Link
              to={isAuthenticated ? "/dashboard" : "/auth"}
              className="flex w-full flex-col gap-2 sm:w-auto sm:flex-row"
            >
              {/* Primary CTA labels for signed-in and signed-out visitors. */}
              <button className="w-full px-8 py-4 bg-blue-500 text-white cursor-pointer font-bold rounded-2xl shadow-xl hover:bg-blue-600 transition-all duration-500 transform hover:-translate-y-1 sm:w-auto">
                {isAuthenticated ? "Open Dashboard" : "Get Started"}
              </button>
            </Link>

            {/* Partner Logos */}
            <div className="w-full border-t border-slate-100 pb-6 pt-5 sm:pb-12">
              <p className="text-slate-400 font-bold mb-4 text-xs uppercase tracking-[0.2em]">Trusted Partners</p>
              <div className="relative overflow-hidden">
                <div className="partner-strip flex w-max items-center gap-8 py-2">
                  {[...trustedPartners, ...trustedPartners].map((partner, index) => (
                    <span
                      key={`${partner.name}-${index}`}
                      className="inline-flex h-16 w-40 items-center justify-center rounded-full border border-blue-200 bg-white px-2 py-1 shadow-sm transition-all duration-500 hover:-translate-y-0.5 hover:border-blue-300 hover:shadow-lg"
                      title={partner.name}
                      aria-label={`${partner.name} logo`}
                    >
                      <img
                        src={partner.logo}
                        alt={`${partner.name} logo`}
                        className={`${partner.logoClass || "h-10 w-28"} object-contain`}
                        loading="lazy"
                      />
                    </span>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>


      <div className="relative z-40 px-4 sm:px-6 lg:px-12 lg:-mt-44">
      <div className="container mx-auto bg-gradient-to-br from-slate-900 via-slate-900 to-blue-950 rounded-3xl p-5 sm:p-8 lg:rounded-[4rem] lg:p-20 shadow-[0_40px_100px_rgba(0,0,0,0.4)] border border-white/5 overflow-hidden relative">

        {/* Background Glow */}
        <div className="absolute -top-24 -right-24 w-72 h-72 bg-blue-500/10 rounded-full blur-[100px]" />

        <div className="absolute bottom-0 left-0 w-72 h-72 bg-indigo-500/10 rounded-full blur-[100px]" />

        {/* Header */}
        <div className="flex flex-col lg:flex-row justify-between items-start lg:items-end mb-10 lg:mb-20 gap-6 lg:gap-8 relative z-10">
          <div className="max-w-2xl">
            {/* Service section eyebrow, heading, and supporting paragraph. */}
            <span className="text-blue-400 font-bold tracking-widest text-xs uppercase mb-4 block">
              Our Insurance Services
            </span>

            <h2 className="text-2xl sm:text-3xl font-extrabold text-white leading-tight">
              Smart Insurance Solutions <br />
              Made <span className="text-blue-500">Simple & Secure</span>
            </h2>
          </div>

          <p className="text-slate-400 text-sm sm:text-md max-w-sm border-slate-800 lg:border-l lg:pl-8 lg:pb-2">
            AI-powered insurance platform helping users manage policies,
            claims, security, and support faster than ever.
          </p>
        </div>

        {/* Services Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-7 relative z-10">

          {services.map((service, index) => (
            <Link
              to={service.route}
              key={index}
              className="group relative overflow-hidden rounded-[2rem] bg-white border border-slate-200 hover:border-blue-500 transition-all duration-500 hover:-translate-y-2 hover:shadow-[0_20px_60px_rgba(59,130,246,0.15)]"
            >

              {/* Top Image */}
              <div className="relative h-[190px] sm:h-[220px] overflow-hidden">

                <img
                  src={service.image}
                  alt={service.title}
                  className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110"
                />

                {/* Overlay */}
                <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/10 to-transparent" />

                {/* Floating Icon
                <div className="absolute top-5 left-5 w-14 h-14 rounded-2xl bg-white flex items-center justify-center shadow-lg">
                  {service.icon}
                </div> */}

                {/* Small Badge */}
                <div className="absolute top-5 right-5 px-4 py-2 rounded-full bg-blue-600 text-white text-[10px] font-bold tracking-widest uppercase">
                  Secure
                </div>

                {/* Bottom Title */}
                <div className="absolute bottom-5 left-5 right-5">
                  <h3 className="text-white text-xl sm:text-2xl font-bold">
                    {service.title}
                  </h3>
                </div>
              </div>

              {/* Content */}
              <div className="p-5 sm:p-7">

                <p className="text-slate-500 leading-relaxed text-sm">
                  {service.desc}
                </p>

                {/* Learn More */}
                <div className="mt-7 flex items-center justify-between">

                  <button className="flex items-center gap-2 text-blue-600 font-semibold text-sm group-hover:gap-4 transition-all duration-300">
                    Learn More
                    <span>→</span>
                  </button>

                  <div className="w-10 h-10 rounded-full bg-blue-50 flex items-center justify-center group-hover:bg-blue-600 transition-all duration-300">
                    <span className="text-blue-600 group-hover:text-white transition-all duration-300">
                      ↗
                    </span>
                  </div>

                </div>
              </div>

            </Link>
          ))}

        </div>
      </div>
    </div>

      {/* Footer Spacer */}
      <div className="h-32 bg-white"></div>
      
      {/* Global Style for the bounce animation */}
      <style dangerouslySetInnerHTML={{ __html: `
        @keyframes bounce-slow {
          0%, 100% { transform: translateY(0); }
          50% { transform: translateY(-15px); }
        }
        @keyframes scroll-partners {
          from { transform: translateX(0); }
          to { transform: translateX(-50%); }
        }
        .animate-bounce-slow {
          animation: bounce-slow 4s ease-in-out infinite;
        }
        .partner-strip {
          animation: scroll-partners 28s linear infinite;
        }
        .partner-strip:hover {
          animation-play-state: paused;
        }
      `}} />

    </div>
  );
};

export default LandingPage;
