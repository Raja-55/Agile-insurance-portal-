import { useMemo, useState, useEffect } from "react";
import {
  Clock3,
  Mail,
  MapPin,
  MessageCircle,
  PhoneCall,
  Send,
  ShieldCheck,
} from "lucide-react";
import { FaWhatsapp } from "react-icons/fa";
import { useAuth } from "../../contexts/useAuth";
import { apiRequest } from "../../utils/api";

const SUPPORT_CHAT_KEY = "agile_insurance_support_chats_v1";

const safeJsonParse = (value, fallback) => {
  try {
    return JSON.parse(value);
  } catch {
    return fallback;
  }
};

const readChats = () => {
  const chats = safeJsonParse(
    localStorage.getItem(SUPPORT_CHAT_KEY),
    []
  );

  return Array.isArray(chats) ? chats : [];
};

const saveChats = (chats) => {
  localStorage.setItem(
    SUPPORT_CHAT_KEY,
    JSON.stringify(chats)
  );
};

const DashboardContact = () => {
  const { user } = useAuth();

  const [chats, setChats] = useState(() => readChats());
  const [subject, setSubject] = useState("Policy support");
  const [message, setMessage] = useState("");

  const [supportEmail, setSupportEmail] = useState(
    "contact@kshetrapati.com"
  );

  const [supportPhone, setSupportPhone] = useState(
    "+91 79726 57424"
  );

  useEffect(() => {
    const fetchSettings = async () => {
      try {
        const response = await apiRequest("/api/admin/settings");

        const settings =
          response?.data?.data ||
          response?.data ||
          {};

        setSupportEmail(
          settings.supportEmail ||
            "contact@kshetrapati.com"
        );

        setSupportPhone(
          settings.supportPhone ||
            "+91 79726 57424"
        );
      } catch (error) {
        console.error(
          "Failed to fetch system settings:",
          error
        );
      }
    };

    fetchSettings();
  }, []);

  const contactDetails = [
    {
      label: "Mobile number",
      value: supportPhone,
      helper:
        "Available for policy, claim, renewal, and account support.",
      icon: PhoneCall,
      href: `tel:${supportPhone.replace(/\s/g, "")}`,
    },
    {
      label: "Email address",
      value: supportEmail,
      helper:
        "Send documents, payment issues, or service requests anytime.",
      icon: Mail,
      href: `mailto:${supportEmail}`,
    },
    {
      label: "WhatsApp support",
      value: supportPhone,
      helper:
        "Chat with support for quick claim, payment, and renewal updates.",
      icon: FaWhatsapp,
      href: `https://wa.me/${supportPhone.replace(
        /\D/g,
        ""
      )}`,
    },
  ];

  const userThread = useMemo(
    () =>
      chats.filter(
        (chat) => chat.userEmail === user?.email
      ),
    [chats, user?.email]
  );

  const sendMessage = () => {
    const text = message.trim();

    if (!text) return;

    const nextMessage = {
      id: `msg_${Date.now()}`,
      from: "user",
      sender: user?.fullName || "Customer",
      text,
      createdAt: new Date().toISOString(),
    };

    const existing = chats.find(
      (chat) =>
        chat.userEmail === user?.email &&
        chat.status !== "Resolved"
    );

    const nextChats = existing
      ? chats.map((chat) =>
          chat.id === existing.id
            ? {
                ...chat,
                subject,
                status: "Open",
                messages: [
                  ...chat.messages,
                  nextMessage,
                ],
                updatedAt:
                  new Date().toISOString(),
              }
            : chat
        )
      : [
          {
            id: `chat_${Date.now()}`,
            userId: user?.id,
            userName:
              user?.fullName || "Customer",
            userEmail:
              user?.email ||
              "guest@agile.insurance",
            subject,
            priority: "Medium",
            status: "Open",
            createdAt:
              new Date().toISOString(),
            updatedAt:
              new Date().toISOString(),
            messages: [nextMessage],
          },
          ...chats,
        ];

    setChats(nextChats);
    saveChats(nextChats);
    setMessage("");
  };



  return (
    <div className="space-y-8">
      <section className="rounded-3xl border border-slate-200 bg-white p-5 shadow-sm dark:border-white/10 dark:bg-white/5 sm:p-8">
        <div className="flex flex-col gap-6 lg:flex-row lg:items-center lg:justify-between">
          <div className="max-w-2xl">
            <div className="inline-flex items-center gap-2 rounded-full border border-slate-200 bg-white px-4 py-2 text-xs font-semibold text-slate-700 dark:border-white/10 dark:bg-white/5 dark:text-slate-200">
              <ShieldCheck size={16} className="text-blue-600 dark:text-blue-400" />
              Customer support
            </div>
            <h1 className="mt-6 text-2xl font-black tracking-tight text-slate-900 dark:text-white sm:text-3xl">
              Contact Us
            </h1>
            <p className="mt-2 text-slate-600 dark:text-slate-300">
              Reach Agile Claim support for policy purchases, active claims, renewals, payments, and account help.
            </p>
          </div>

          <a
  href={`https://wa.me/${supportPhone.replace(
    /\D/g,
    ""
  )}?text=Hi%20Support%2C%20I%20need%20help%20with%20my%20insurance%20account.`}
  target="_blank"
  rel="noreferrer"
  className="inline-flex items-center justify-center gap-2 rounded-2xl bg-gradient-to-r from-blue-600 to-indigo-600 px-6 py-4 text-sm font-black text-white shadow-sm hover:opacity-95"
>
  <FaWhatsapp size={18} />
  Start chat on WhatsApp
</a>
        </div>
      </section>

      <section className="grid grid-cols-1 gap-6 lg:grid-cols-3">
        {contactDetails.map((item) => {
          const Icon = item.icon;
          return (
            <a
              key={item.label}
              href={item.href}
              target={item.href.startsWith("https://wa.me") ? "_blank" : undefined}
              rel={item.href.startsWith("https://wa.me") ? "noreferrer" : undefined}
              className="rounded-3xl border border-slate-200 bg-white p-5 shadow-sm transition hover:-translate-y-0.5 hover:shadow-md dark:border-white/10 dark:bg-white/5 sm:p-8"
            >
              <div className="flex items-start gap-4">
                <span className="grid h-14 w-14 shrink-0 place-items-center rounded-2xl bg-blue-50 text-blue-600 dark:bg-blue-500/10 dark:text-blue-300">
                  <Icon size={22} />
                </span>
                <div className="min-w-0">
                  <div className="text-xs font-bold uppercase tracking-wide text-slate-500 dark:text-slate-400">
                    {item.label}
                  </div>
                  <div className="mt-2 break-words text-xl font-black text-slate-900 dark:text-white sm:text-2xl">
                    {item.value}
                  </div>
                  <p className="mt-2 text-sm font-medium text-slate-600 dark:text-slate-300">{item.helper}</p>
                </div>
              </div>
            </a>
          );
        })}
      </section>

      <section className="grid grid-cols-1 gap-6 lg:grid-cols-3">
        {[
          { title: "Working hours", value: "Mon-Sat, 9:00 AM - 7:00 PM", icon: Clock3 },
          { title: "Quick message", value: "Reply within 24 working hours", icon: MessageCircle },
          { title: "Office", value: "Office 101 & 102, Tower B1, Vishwakarma Business Centre, Wagholi, Pune - 412207", icon: MapPin },
        ].map((item) => {
          const Icon = item.icon;
          return (
            <div
              key={item.title}
              className="rounded-3xl border border-slate-200 bg-slate-50 p-5 dark:border-white/10 dark:bg-white/5 sm:p-6"
            >
              <div className="flex items-center gap-3">
                <span className="grid h-11 w-11 place-items-center rounded-2xl bg-white text-blue-600 shadow-sm dark:bg-white/10 dark:text-blue-300">
                  <Icon size={18} />
                </span>
                <div>
                  <div className="text-sm font-black text-slate-900 dark:text-white">{item.title}</div>
                  <div className="mt-1 text-sm font-medium text-slate-600 dark:text-slate-300">{item.value}</div>
                </div>
              </div>
            </div>
          );
        })}
      </section>

      <section className="grid grid-cols-1 gap-6 lg:grid-cols-[1fr_340px]">
        {/* Chat input area - professional messaging interface */}
        <div className="rounded-3xl border border-slate-200 bg-white p-5 shadow-sm dark:border-white/10 dark:bg-white/5 sm:p-8">
          <div className="flex items-center gap-2 text-sm font-black text-slate-900 dark:text-white mb-5">
            <MessageCircle size={18} className="text-blue-600 dark:text-blue-400" />
            Chat with Admin Support Team
          </div>
          {/* Subject and message input row */}
          <div className="grid gap-4 sm:grid-cols-[200px_1fr_auto]">
            {/* Subject dropdown - categorize support inquiries */}
            <select
              value={subject}
              onChange={(event) => setSubject(event.target.value)}
              className="rounded-2xl border border-slate-200 bg-white px-4 py-3 text-sm font-bold outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-200 dark:border-white/10 dark:bg-white/5 dark:text-white transition"
            >
              {["Policy support", "Claim issue", "Payment issue", "Document verification", "Complaint"].map((item) => (
                <option key={item}>{item}</option>
              ))}
            </select>
            {/* Message input field - type your query here */}
            <input
              value={message}
              onChange={(event) => setMessage(event.target.value)}
              onKeyDown={(event) => {
                if (event.key === "Enter" && !event.shiftKey) {
                  event.preventDefault();
                  sendMessage();
                }
              }}
              className="rounded-2xl border border-slate-200 bg-white px-4 py-3 text-sm font-semibold outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-200 placeholder:text-slate-400 dark:border-white/10 dark:bg-white/5 dark:text-white dark:placeholder:text-slate-500 transition"
              placeholder="Type your query and press Enter to send..."
            />
            {/* Send button - submit your message to admin */}
            <button
              onClick={sendMessage}
              disabled={!message.trim()}
              className="inline-flex cursor-pointer items-center justify-center gap-2 rounded-2xl bg-blue-600 px-5 py-3 text-sm font-black text-white transition hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed"
              title="Send message to support admin"
            >
              <Send size={16} />
              Send
            </button>
          </div>
        </div>

        {/* Chat message display - read messages from support thread */}
        <div className="rounded-3xl border border-slate-200 bg-white p-5 shadow-sm dark:border-white/10 dark:bg-white/5 sm:p-6">
          <div className="text-sm font-black text-slate-900 dark:text-white mb-4">Your Support Thread</div>
          {/* Messages container with auto-scroll */}
          <div className="max-h-[400px] space-y-3 overflow-y-auto pr-2">
            {!userThread.length ? (
              <div className="rounded-2xl bg-slate-50 p-5 text-sm font-semibold text-slate-600 dark:bg-white/5 dark:text-slate-300 text-center">
                <MessageCircle size={24} className="mx-auto mb-2 opacity-50" />
                No messages yet. Send your first query to get support.
              </div>
            ) : (
              userThread.flatMap((chat) =>
                chat.messages.map((item) => (
                  <div
                    key={item.id}
                    className={`rounded-2xl px-4 py-3 text-sm font-semibold animate-in fade-in ${
                      item.from === "admin"
                        ? "bg-blue-50 text-blue-900 border-l-4 border-blue-600 dark:bg-blue-500/10 dark:text-blue-200 dark:border-blue-400"
                        : "bg-slate-100 text-slate-700 border-l-4 border-slate-400 dark:bg-white/5 dark:text-slate-200 dark:border-slate-500"
                    }`}
                  >
                    <div className="text-xs font-black uppercase tracking-wide opacity-70 mb-1">{item.sender}</div>
                    <div className="leading-relaxed">{item.text}</div>
                  </div>
                )),
              )
            )}
          </div>
        </div>
      </section>
    </div>
  );
};

export default DashboardContact;
