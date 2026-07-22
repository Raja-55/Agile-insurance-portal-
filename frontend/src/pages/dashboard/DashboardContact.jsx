import { useEffect, useMemo, useState } from "react";

import { Clock3, Mail, MapPin, MessageCircle, PhoneCall, Send, ShieldCheck } from "lucide-react";
import { FaWhatsapp } from "react-icons/fa";
import { useAuth } from "../../contexts/useAuth";
import { apiRequest } from "../../utils/api";

// Edit these details to update phone, email, and support information across the app
const contactDetails = [
  {
    label: "Mobile number",
    value: "+91 79726 57424",
    helper: "Available for policy, claim, renewal, and account support.",
    icon: PhoneCall,
    href: "tel:+917972657424",
  },
  {
    label: "Email address",
    value: "contact@kshetrapati.com",
    helper: "Send documents, payment issues, or service requests anytime.",
    icon: Mail,
    href: "mailto:contact@kshetrapati.com",
  },
  {
    label: "WhatsApp support",
    value: "+91 79726 57424",
    helper: "Chat with support for quick claim, payment, and renewal updates.",
    icon: FaWhatsapp,
    href: "https://wa.me/917972657424?text=Hi%20Support%2C%20I%20need%20help%20with%20my%20insurance%20account.",
  },
];

// Main contact dashboard component - displays contact info and support chat interface
const DashboardContact = () => {
  const { user } = useAuth();
  // Load chats from localStorage on component mount
  // const [chats, setChats] = useState(() => readChats());
  const [subject, setSubject] = useState("Policy support");
  const [message, setMessage] = useState("");
const [loadingTickets, setLoadingTickets] = useState(true);

  const [statusMessage, setStatusMessage] = useState("");
  // const [isSending, setIsSending] = useState(false);
  // const supportPhone = contactDetails[0].value;
   const supportPhone = "+91 79726 57424";
   const [isSending, setIsSending] = useState(false);
  // Filter chats for current user thread
  // const userThread = useMemo(
  //   () => chats.filter((chat) => chat.userEmail === user?.email),
  //   [chats, user?.email],
  // );
  
const [tickets, setTickets] = useState([]);

useEffect(() => {
  loadTickets();
}, []);

const loadTickets = async () => {
  try {
    setLoadingTickets(true);

    const res = await apiRequest("/api/support/support-tickets");

    setTickets(res.data || []);
  } catch (err) {
    console.error(err);
  } finally {
    setLoadingTickets(false);
  }
};
  // Send message handler - creates new chat or adds to existing thread
const sendMessage = async () => {
  const text = message.trim();

  if (!text) return;

  setIsSending(true);
  setStatusMessage("");

  try {
    await apiRequest("/api/support/support-tickets", {
      method: "POST",
      body: JSON.stringify({
        subject,
        message: text,
      }),
    });

    await loadTickets();

    setMessage("");
    setStatusMessage("Message sent successfully.");
  } catch (err) {
    setStatusMessage(err.message);
  } finally {
    setIsSending(false);
  }
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
              onClick={(e) => {
                if (item.href.startsWith("mailto:")) {
                  e.preventDefault();
                  window.location.href = item.href;
                }
              }}
              target={item.href.startsWith("https://wa.me") ? "_blank" : undefined}
              rel={item.href.startsWith("https://wa.me") ? "noreferrer" : undefined}
              className="rounded-3xl border border-slate-200 bg-white p-5 shadow-sm transition hover:-translate-y-0.5 hover:shadow-md dark:border-white/10 dark:bg-white/5 sm:p-8 cursor-pointer"
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
              className="rounded-2xl border border-slate-200 bg-white px-4 py-3 text-sm font-bold outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-200 dark:border-white/10 dark:bg-slate-800 dark:text-white dark:focus:border-blue-400 transition"
            >
              {["Policy support", "Claim issue", "Payment issue", "Document verification", "Complaint"].map((item) => (
                <option key={item} value={item}>{item}</option>
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
              disabled={!message.trim() || isSending}
              className="inline-flex cursor-pointer items-center justify-center gap-2 rounded-2xl bg-blue-600 px-5 py-3 text-sm font-black text-white transition hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed"
              title="Send message to support admin"
            >
              <Send size={16} />
              {isSending ? "Sending..." : "Send"}
            </button>
          </div>
          {statusMessage ? (
            <p className="mt-3 text-sm font-medium text-slate-600 dark:text-slate-300">{statusMessage}</p>
          ) : null}
        </div>

        {/* Chat message display - read messages from support thread */}
        <div className="rounded-3xl border border-slate-200 bg-white p-5 shadow-sm dark:border-white/10 dark:bg-white/5 sm:p-6">
          <div className="text-sm font-black text-slate-900 dark:text-white mb-4">Your Support Thread</div>
          {/* Messages container with auto-scroll */}
          <div className="max-h-[400px] space-y-3 overflow-y-auto pr-2">
            {loadingTickets ? (
              <div className="rounded-2xl bg-slate-50 p-5 text-sm font-semibold text-slate-600 dark:bg-white/5 dark:text-slate-300 text-center">
                Loading your support history...
              </div>
            ) : !tickets.length ? (
              <div className="rounded-2xl bg-slate-50 p-5 text-sm font-semibold text-slate-600 dark:bg-white/5 dark:text-slate-300 text-center">
                <MessageCircle size={24} className="mx-auto mb-2 opacity-50" />
                No messages yet. Send your first query to get support.
              </div>
            ) : (
              tickets.map((ticket) => (
                <article
                  key={ticket._id || ticket.id}
                  className="rounded-2xl border border-slate-200 bg-slate-50 p-4 text-sm dark:border-white/10 dark:bg-white/5"
                >
                  <div className="flex items-center justify-between gap-3">
                    <div>
                      <div className="text-xs font-black uppercase tracking-wide text-slate-500 dark:text-slate-400">{ticket.subject}</div>
                      <div className="mt-1 text-sm font-semibold text-slate-900 dark:text-white">Status: {ticket.status || "Open"}</div>
                    </div>
                    <span className="rounded-full bg-blue-100 px-3 py-1 text-xs font-black uppercase tracking-wide text-blue-700 dark:bg-blue-500/10 dark:text-blue-200">
                      {ticket.priority || "Medium"}
                    </span>
                  </div>
                  <div className="mt-3 space-y-2">
                    {(ticket.messages || []).map((item) => (
                      <div
                        key={item._id || item.id || `${ticket._id || ticket.id}-${item.createdAt}`}
                        className={`rounded-2xl px-4 py-3 text-sm font-semibold ${
                          item.senderRole === "admin" || item.from === "admin"
                            ? "bg-blue-50 text-blue-900 border-l-4 border-blue-600 dark:bg-blue-500/10 dark:text-blue-100 dark:border-blue-400"
                            : "bg-white text-slate-700 border-l-4 border-slate-400 dark:bg-white/10 dark:text-slate-100 dark:border-slate-500"
                        }`}
                      >
                        <div className="mb-1 text-[11px] font-black uppercase tracking-wide opacity-75">
                          {item.senderRole === "admin" || item.from === "admin" ? "Admin" : "You"}
                        </div>
                        <div className="leading-relaxed">{item.text}</div>
                      </div>
                    ))}
                  </div>
                </article>
              ))
            )}
          </div>
        </div>
      </section>
    </div>
  );
};

export default DashboardContact;
