import { useEffect, useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import {
    ChevronDown,
    Phone,
    ShieldCheck,
    FileText,
    Headphones,
    User,
    Menu,
    X,
} from "lucide-react";
import { useAuth } from "../contexts/useAuth";
import { apiRequest } from "../utils/api";

const AGILE_LOGO_SRC = "/agile-insurance-logo.svg";

const Navbar = () => {
    const [activeDropdown, setActiveDropdown] = useState(null);
    const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
    const navigate = useNavigate();
    const { isAuthenticated, user } = useAuth();
    const [portalName, setPortalName] = useState("Agile Insurance");
    const [supportPhone, setSupportPhone] = useState("+91 98765 43210");
    const [policyForms, setPolicyForms] = useState({
        healthForm: true,
        motorForm: true,
        lifeForm: true,
        travelForm: true,
        businessForm: true,
    });

<<<<<<< HEAD
    useEffect(() => {
        const fetchSettings = async () => {
            try {
                const response = await apiRequest("/api/admin/settings");
                const settings = response?.data;
                setPortalName(settings?.general?.companyName || "Agile Insurance");
                setSupportPhone(settings?.general?.supportPhone || "+91 98765 43210");
            } catch (error) {
                console.error("Failed to load portal settings: ", error);
            }
        };
        fetchSettings();
    }, []);
=======
    useEffect(() =>{
        const fetchSettings = async () =>{
        try{
            const response = await apiRequest("/api/admin/settings");
            const settings = response?.data;

            setPortalName(
                settings?.general?.companyName || "Agile Insurance"
            );
            setSupportPhone(
                settings?.general?.supportPhone || "+91 98765 43210"
            );
            setPolicyForms(
                settings?.policyForms || {
                    healthForm: true,
                    motorForm: true,
                    lifeForm: true,
                    travelForm: true,
                    businessForm: true,
                }
            );
        }
        catch(error){
            console.error(
                "Failed to load portal settings: ",
                error
            );
        }

    };
    fetchSettings();
    },[]);
>>>>>>> raj

    const handleNav = (route) => {
        if (!route) return;
        navigate(route);
        setActiveDropdown(null);
        setMobileMenuOpen(false);
    };

    const toggleMobileMenu = () => {
        setMobileMenuOpen((prev) => !prev);
    };

    const resolveRoute = (label) => {
        const v = String(label || "").toLowerCase();
        if (v.includes("health")) return "/health-insurance";
        if (v.includes("car") || v.includes("vehicle") || v.includes("bike")) return "/car-insurance";
        if (v.includes("term")) return "/term-insurance";
        if (v.includes("life")) return "/life-insurance";
        if (v.includes("travel")) return "/travel-insurance";
        if (v.includes("business")) return "/business-insurance";
        if (v.includes("home")) return "/home-insurance";
        if (v.includes("renew")) return "/dashboard/renewals";
        if (v.includes("payment")) return "/dashboard/payments";
        if (v.includes("manage policies")) return "/dashboard/policies";
        if (v.includes("help") || v.includes("support") || v.includes("chat")) return "/dashboard/ai-support";
        if (v.includes("download policy")) return "/dashboard/documents";
        return null;
    };
  

    const insuranceDropdown = [
  policyForms.healthForm && "Health Insurance",
  policyForms.motorForm && "Car Insurance",
  policyForms.lifeForm && "Life Insurance",
  policyForms.travelForm && "Travel Insurance",
  policyForms.businessForm && "Business Insurance",
].filter(Boolean);

    // Modified navItems: Added 'path' for direct links like Claim
    const navItems = [
        {
<<<<<<< HEAD
            name: "Insurance Products",
            dropdown: [
                "Health Insurance",
                "Car Insurance",
                "Bike Insurance",
                "Life Insurance",
                "Travel Insurance",
                "Business Insurance",
            ],
        },
=======
    name: "Insurance Products",
    dropdown: insuranceDropdown,
  },
>>>>>>> raj
        {
            name: "Renew Your Policy",
            dropdown: [
                "Renew Health Policy",
                "Renew Vehicle Policy",
                "Renew Life Insurance",
                "Download Policy",
            ],
        },
        {
            name: "Claim",
            path: "/claim-process-know", // Direct link instead of dropdown
        },
        {
            name: "Support",
            dropdown: [
                "Track Payments",
                "Verify Advisor",
                "Manage Policies",
                "Communication Preferences",
                "Chat With Us",
                "Help Center",
            ],
        },
    ];

    return (
        <header className="w-full border-b border-gray-200 bg-white relative z-50">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 min-h-[60px] py-2 flex items-center justify-between gap-3">
                <div className="flex min-w-0 items-center gap-6 xl:gap-14">
                    <Link to="/" className="flex min-w-0 items-center gap-2 sm:gap-3 cursor-pointer">
                        <img src={AGILE_LOGO_SRC} alt="Agile Insurance logo" className="h-10 w-10 shrink-0 sm:h-11 sm:w-11" />
                        <div className="min-w-0">
                            <h1 className="truncate text-base sm:text-2xl font-bold text-[#111827] leading-none">{portalName}</h1>
                            <p className="hidden sm:block text-[11px] text-gray-500 mt-1 uppercase tracking-widest">Smart & Secure Protection</p>
                        </div>
                    </Link>

                    <nav className="hidden lg:flex items-center gap-10">
                        <button onClick={() => handleNav("/")} className="text-[15px] font-medium text-gray-700 hover:text-blue-600 transition">Home</button>

                        {navItems.map((item, index) => (
                            <div
                                key={index}
                                className="relative"
                                onMouseEnter={() => item.dropdown && setActiveDropdown(index)}
                                onMouseLeave={() => item.dropdown && setActiveDropdown(null)}
                            >
                                <button
                                    onClick={() => item.path && handleNav(item.path)}
                                    className="flex items-center gap-1 text-[15px] font-medium text-gray-700 hover:text-blue-600 transition"
                                >
                                    {item.name}
                                    {item.dropdown && <ChevronDown size={16} />}
                                </button>

                                {item.dropdown && activeDropdown === index && (
                                    <div className="absolute left-0 w-[260px] bg-white rounded-2xl shadow-2xl border border-gray-100 p-4">
                                        <div className="flex flex-col gap-2">
                                            {item.dropdown.map((option, i) => (
                                                <button
                                                    key={i}
                                                    onClick={() => handleNav(resolveRoute(option))}
                                                    className="text-left px-4 py-3 rounded-xl text-sm text-gray-700 hover:bg-blue-50 hover:text-blue-600 transition"
                                                >
                                                    {option}
                                                </button>
                                            ))}
                                        </div>
                                    </div>
                                )}
                            </div>
                        ))}
                    </nav>
                </div>

                <div className="flex shrink-0 items-center gap-2 sm:gap-3">
                    <button onClick={toggleMobileMenu} className="inline-flex lg:hidden items-center justify-center rounded-xl border border-gray-200 p-2 text-gray-700">
                        {mobileMenuOpen ? <X size={20} /> : <Menu size={20} />}
                    </button>

                    <Link to="/contact-us">
                        <button className="hidden md:flex items-center gap-2 border border-blue-600 text-blue-600 px-5 py-3 rounded-2xl font-medium hover:bg-blue-600 hover:text-white transition" title={supportPhone}>
                            <Phone size={18} /> Talk to Expert
                        </button>
                    </Link>

                    <button onClick={() => handleNav(isAuthenticated ? "/dashboard" : "/auth")} className="bg-blue-600 text-white px-3 py-2.5 sm:px-5 sm:py-3 rounded-2xl text-sm sm:text-base font-medium hover:bg-blue-700 transition flex items-center gap-2">
                        <User size={16} />
                        {isAuthenticated ? (user?.fullName?.split(" ")?.[0] ?? "Dashboard") : "Sign In"}
                    </button>

                    {!isAuthenticated && (
                        <button onClick={() => handleNav("/admin/dashboard")} className="flex items-center gap-2 border border-amber-300 bg-amber-50 px-3 py-2.5 sm:px-4 sm:py-3 rounded-2xl text-xs sm:text-sm font-semibold text-amber-700 transition">
                            <ShieldCheck size={16} /> <span>Admin</span>
                        </button>
                    )}
                </div>
            </div>

            {/* Mobile Menu */}
            {mobileMenuOpen && (
                <div className="border-t border-gray-100 bg-white lg:hidden">
                    <div className="max-w-7xl mx-auto px-4 sm:px-6 py-4 flex flex-col gap-4">
                        <button onClick={() => handleNav("/")} className="text-left rounded-xl px-4 py-3 text-sm font-semibold text-gray-800 hover:bg-blue-50 hover:text-blue-600">Home</button>

                        {navItems.map((item, index) => (
                            <div key={index} className="rounded-2xl border border-gray-100 bg-gray-50 p-4">
                                <button
                                    onClick={() => item.path && handleNav(item.path)}
                                    className={`w-full text-left text-[10px] font-bold uppercase tracking-[0.25em] ${item.path ? 'text-blue-600' : 'text-gray-500'} mb-1`}
                                >
                                    {item.name} {item.path && "→"}
                                </button>
                                {item.dropdown && (
                                    <div className="flex flex-col gap-2 mt-2">
                                        {item.dropdown.map((option, i) => (
                                            <button
                                                key={i}
                                                onClick={() => handleNav(resolveRoute(option))}
                                                className="text-left rounded-xl px-3 py-2 text-sm text-gray-700 hover:bg-white hover:text-blue-600"
                                            >
                                                {option}
                                            </button>
                                        ))}
                                    </div>
                                )}
                            </div>
                        ))}
                        {/* ... Rest of mobile buttons ... */}
                    </div>
                </div>
            )}

            {/* Desktop Trust Strip */}
            <div className="hidden xl:flex items-center justify-center gap-10 border-t border-gray-100 py-3 bg-[#f8fbff]">
                <div className="flex items-center gap-2 text-sm text-gray-600"><ShieldCheck size={18} className="text-blue-600" /> Trusted Insurance Protection</div>
                <div className="flex items-center gap-2 text-sm text-gray-600"><FileText size={18} className="text-blue-600" /> Fast Claim Processing</div>
                <div className="flex items-center gap-2 text-sm text-gray-600"><Headphones size={18} className="text-blue-600" /> 24/7 Customer Support</div>
            </div>
        </header>
    );
};

<<<<<<< HEAD
export default Navbar;
=======
    export default Navbar;
>>>>>>> raj
