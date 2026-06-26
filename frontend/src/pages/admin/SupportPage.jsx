// src/components/pages/SupportPage.jsx
import { useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { Headphones, Send, CheckCircle2 } from "lucide-react";
import { SectionTitle } from "../../components/admin/shared";
import { setChats, updateChat, setSelectedChatId } from "../../store/slices/supportSlice";
import { useAdminActions } from "../../hooks/useAdminActions";
import { apiRequest } from "../../utils/api";
import { statusClass } from "../../utils/helpers";

const SupportPage = () => {
  const dispatch = useDispatch();
  const { panel, log } = useAdminActions();
  const { chats, selectedChatId } = useSelector((s) => s.support);
  const [adminReply, setAdminReply] = useState("");

  const selectedChat = chats.find((c) => c.id === selectedChatId) || null;
// console.log(selectedChat);
// console.log(selectedChat.id);
// console.log(selectedChat._id);
  const handleReply = async () => {
    if (!selectedChat || !adminReply.trim()) return;
    try {
      const res = await apiRequest(`/api/admin/support-tickets/${selectedChat.id}/messages`, {
        useAdminToken: true, method: "POST", body: JSON.stringify({ message: adminReply }),
      });
      if (res?.data) {
        dispatch(updateChat({ id: selectedChat.id, changes: res.data }));
        log(`/api/v4/support/reply -> ${selectedChat.userName}`);
        panel("Reply sent", `Admin response sent to ${selectedChat.userName}.`);
      }
    } catch (err) { panel("Error", `Failed to send reply: ${err.message}`); }
    setAdminReply("");
  };

  const resolveChat = async () => {
    if (!selectedChat) return;
    try {
      const res = await apiRequest(`/api/admin/support-tickets/${selectedChat.id}`, {
        useAdminToken: true, method: "PATCH", body: JSON.stringify({ status: "Resolved" }),
      });
      if (res?.data) dispatch(updateChat({ id: selectedChat.id, changes: res.data }));
    } catch {}
    dispatch(updateChat({ id: selectedChat.id, changes: { status: "Resolved" } }));
    log(`/api/v4/support/resolve -> ${selectedChat.userName}`);
    dispatch(setSelectedChatId(null));
    panel("Chat resolved", `Ticket for ${selectedChat.userName} marked as resolved.`);
  };

  return (
    <section className="rounded-lg border border-slate-200 bg-white p-5 shadow-sm">
      <SectionTitle icon={Headphones} title="Support Center - User Chats" />
      <div className="mt-5 grid gap-4 xl:grid-cols-[300px_1fr]">
        {/* Chat list */}
        <div className="max-h-[600px] space-y-2 overflow-y-auto rounded-lg border border-slate-200 bg-slate-50 p-4">
          {chats.length === 0
            ? <div className="text-sm font-semibold text-slate-500">No support chats yet.</div>
            : chats.map((chat) => (
              <button
                key={chat.id}
                onClick={() => { dispatch(setSelectedChatId(chat.id)); panel(`Chat: ${chat.id}`, { user: chat.userName, subject: chat.subject, status: chat.status }); }}
                className={`w-full rounded-lg border p-3 text-left transition ${selectedChatId === chat.id ? "border-blue-400 bg-blue-50" : "border-slate-200 bg-white hover:border-blue-300"}`}
              >
                <div className="text-sm font-bold text-slate-900">{chat.userName}</div>
                <div className="text-xs text-slate-500">{chat.subject}</div>
                <div className="mt-2 flex items-center justify-between">
                  <span className={`rounded px-2 py-1 text-xs font-bold ${statusClass(chat.status)}`}>{chat.status}</span>
                  <span className="text-xs text-slate-500">{chat.messages?.length || 0} msg</span>
                </div>
              </button>
            ))}
        </div>

        {/* Chat detail */}
        <div className="rounded-lg border border-slate-200">
          {!selectedChat
            ? <div className="flex h-[600px] items-center justify-center text-slate-500"><p>Select a chat to view messages</p></div>
            : (
              <div className="flex h-[600px] flex-col">
                <div className="border-b border-slate-200 p-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <div className="text-sm font-bold text-slate-900">{selectedChat.userName}</div>
                      <div className="text-xs text-slate-500">{selectedChat.userEmail}</div>
                      <div className="mt-1 text-xs font-semibold text-slate-600">{selectedChat.subject}</div>
                    </div>
                    <span className={`rounded-lg px-3 py-1 text-xs font-bold ${statusClass(selectedChat.status)}`}>{selectedChat.status}</span>
                  </div>
                </div>

                <div className="flex-1 space-y-3 overflow-y-auto p-4">
                  {(selectedChat.messages || []).map((msg) => (
                    <div key={msg.id}>
                      <div className="text-xs font-bold uppercase text-slate-500">{msg.senderRole === "admin" ? "Admin" : selectedChat.userName}</div>
                      <div className={`mt-1 rounded-lg px-4 py-3 text-sm font-semibold ${msg.senderRole === "admin" ? "bg-blue-50 text-blue-900" : "bg-slate-100 text-slate-700"}`}>
                        {msg.text}
                      </div>
                    </div>
                  ))}
                </div>

                {selectedChat.status !== "Resolved" && (
                  <div className="border-t border-slate-200 p-4 space-y-3">
                    <input
                      value={adminReply}
                      onChange={(e) => setAdminReply(e.target.value)}
                      onKeyDown={(e) => e.key === "Enter" && handleReply()}
                      placeholder="Type your reply..."
                      className="h-12 w-full rounded-lg border border-slate-200 bg-slate-50 px-4 text-sm font-semibold outline-none focus:border-blue-500"
                    />
                    <div className="flex gap-2">
                      <button onClick={handleReply} className="flex-1 inline-flex items-center justify-center gap-2 rounded-lg bg-blue-600 px-4 py-3 text-sm font-black text-white hover:bg-blue-700">
                        <Send size={16} />Send Reply
                      </button>
                      <button onClick={resolveChat} className="inline-flex items-center justify-center gap-2 rounded-lg bg-emerald-600 px-4 py-3 text-sm font-black text-white hover:bg-emerald-700">
                        <CheckCircle2 size={16} />Resolve
                      </button>
                    </div>
                  </div>
                )}
              </div>
            )}
        </div>
      </div>
    </section>
  );
};

export default SupportPage;
