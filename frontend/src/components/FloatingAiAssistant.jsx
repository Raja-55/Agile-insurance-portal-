import { useCallback, useEffect, useRef, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { Bot, SendHorizonal, Sparkles, X } from "lucide-react";
import { openAiChat } from "../utils/api";
import { buildAssistantKnowledge } from "../utils/assistantKnowledge";
import {apiRequest} from "../utils/api";
// Floating AI widget copy and OpenAI chat handoff live here.
const makeId = (prefix) => `${prefix}_${Date.now()}_${Math.random().toString(16).slice(2)}`;

const FloatingAiAssistant = ({ contextLabel = "Agile AI", prompt = null }) => {
  const [open, setOpen] = useState(false);
  const [text, setText] = useState("");
  const [busy, setBusy] = useState(false);
  const messagesEndRef = useRef(null);
  const [messages, setMessages] = useState(() => [
    {
      id: "m1",
      role: "ai",
      text: `Hi! I'm ${contextLabel}. Ask me about insurance plans, claims, payments, documents, login, or how to use this portal.`,
    },
  ]);
  const [features, setFeatures] = useState(null);

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




  const lastPrompt = useRef("");

  const sendMessage = useCallback(async (value) => {
    const cleanValue = value.trim();
    if (!cleanValue || busy) return;

    const userMsg = { id: makeId("u"), role: "user", text: cleanValue };
    setMessages((current) => [...current, userMsg]);
    setText("");
    setBusy(true);

    try {
      const reply = await openAiChat({
        message: cleanValue,
        contextLabel,
        systemContext: buildAssistantKnowledge(),
        history: messages.map(({ role, text: messageText }) => ({ role, text: messageText })),
      });
      setMessages((current) => [
        ...current,
        { id: makeId("a"), role: "ai", text: reply || "I could not produce an answer. Please try again." },
      ]);
    } catch (err) {
      setMessages((current) => [
        ...current,
        {
          id: makeId("e"),
          role: "ai",
          text: err?.message || "I could not reach OpenAI support right now. Please try again.",
        },
      ]);
    } finally {
      setBusy(false);
    }
  }, [busy, messages]);

  useEffect(() => {
    const cleanPrompt = String(prompt?.text || "").trim();
    const promptKey = `${prompt?.id || ""}:${cleanPrompt}`;
    if (!cleanPrompt || promptKey === lastPrompt.current) return;
    lastPrompt.current = promptKey;
    setOpen(true);
    sendMessage(cleanPrompt);
  }, [prompt, sendMessage]);

  useEffect(() => {
    const handlePrompt = (event) => {
      const cleanPrompt = String(event.detail?.text || "").trim();
      if (!cleanPrompt) return;
      setOpen(true);
      sendMessage(cleanPrompt);
    };

    window.addEventListener("agile-ai-prompt", handlePrompt);
    return () => window.removeEventListener("agile-ai-prompt", handlePrompt);
  }, [sendMessage]);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth", block: "end" });
  }, [messages, busy, open]);


if (!features) return null;

if (!features.aiAssistant) {
  return null;
}

return (
  <>
    <div className="fixed bottom-6 right-4 z-50 sm:right-6">
      <button
        onClick={() => setOpen((v) => !v)}
        className="group inline-flex items-center gap-3 rounded-2xl bg-gradient-to-r from-blue-600 to-indigo-600 px-4 py-3 text-sm font-black text-white shadow-[0_22px_90px_rgba(37,99,235,0.35)] hover:opacity-95 sm:px-5 sm:py-4"
      >
        <span className="grid h-10 w-10 place-items-center rounded-2xl bg-white/15">
          <Bot size={18} />
        </span>
        <span className="hidden sm:inline">AI Support</span>
        <span className="hidden text-white/80 sm:inline">-</span>
        <span className="hidden text-xs font-semibold text-white/85 sm:inline">
          OpenAI powered
        </span>
      </button>
    </div>

      <AnimatePresence>
        {open ? (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 20 }}
            transition={{ duration: 0.25 }}
            className="fixed bottom-24 right-4 z-50 w-[calc(100vw-2rem)] max-w-[360px] overflow-hidden rounded-3xl border border-slate-200 bg-white shadow-[0_32px_90px_rgba(2,6,23,0.2)] dark:border-white/10 dark:bg-[#0B1020] sm:right-6"
          >
            <div className="flex items-center justify-between gap-3 bg-gradient-to-r from-slate-900 via-slate-900 to-blue-950 px-4 py-3 text-white">
              <div className="flex items-center gap-2.5">
                <span className="grid h-9 w-9 place-items-center rounded-2xl bg-white/10">
                  <Sparkles size={16} />
                </span>
                <div className="min-w-0">
                  <div className="truncate text-sm font-black">Agile AI Assistant</div>
                  <div className="truncate text-xs text-white/70">Insurance, portal, payments, claims</div>
                </div>
              </div>
              <button onClick={() => setOpen(false)} className="rounded-xl bg-white/10 p-2 hover:bg-white/15">
                <X size={16} />
              </button>
            </div>

            <div className="max-h-[300px] space-y-2.5 overflow-auto p-4">
              {messages.map((m) => (
                <div
                  key={m.id}
                  className={[
                    "rounded-2xl px-3.5 py-2.5 text-xs font-semibold leading-relaxed",
                    m.role === "user"
                      ? "ml-6 bg-blue-600 text-white"
                      : "mr-6 whitespace-pre-line bg-slate-50 text-slate-800 dark:bg-white/10 dark:text-slate-100",
                  ].join(" ")}
                >
                  {m.text}
                </div>
              ))}
              {busy && (
                <div className="mr-6 rounded-2xl bg-slate-50 px-3.5 py-2.5 text-xs font-semibold text-slate-700 dark:bg-white/10 dark:text-slate-100">
                  Thinking...
                </div>
              )}
              <div ref={messagesEndRef} />
            </div>

            <div className="border-t border-slate-200 p-3 dark:border-white/10">
              <div className="flex items-center gap-2">
                <input
                  value={text}
                  onChange={(e) => setText(e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === "Enter") sendMessage(text);
                  }}
                  placeholder="Ask about payment, claim, document..."
                  className="w-full rounded-2xl border border-slate-200 bg-white px-3.5 py-2.5 text-xs font-semibold text-slate-800 outline-none focus:border-blue-500 dark:border-white/10 dark:bg-white/5 dark:text-slate-100"
                />
                <button
                  onClick={() => sendMessage(text)}
                  disabled={busy}
                  className="inline-flex items-center justify-center rounded-2xl bg-gradient-to-r from-blue-600 to-indigo-600 px-3.5 py-2.5 text-white shadow-sm hover:opacity-95 disabled:opacity-60"
                >
                  <SendHorizonal size={16} />
                </button>
              </div>
            </div>
          </motion.div>
        ) : null}
      </AnimatePresence>
    </>
  );
};

export default FloatingAiAssistant;
