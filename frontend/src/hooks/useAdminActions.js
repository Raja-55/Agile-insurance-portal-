// src/hooks/useAdminActions.js
/**
 * Central hook for all admin side-effect actions.
 * Keeps components lean — they call these instead of dispatching directly.
 */
import { useDispatch, useSelector } from "react-redux";
import { useNavigate } from "react-router-dom";
import { loginSuccess, logout, updateProfile } from "../store/slices/authSlice";
import { addLog } from "../store/slices/auditSlice";
import { setDetailPanel, setActivePage, clearEditingRecord } from "../store/slices/uiSlice";
import { approveClaim, rejectClaim, removeClaim, setClaims, addClaim } from "../store/slices/claimsSlice";
import { removeUser, setUsers } from "../store/slices/usersSlice";
import { removePolicy, approvePolicy, addPolicy } from "../store/slices/policiesSlice";
import { approveDocument, removeDocument, updateDocument } from "../store/slices/documentsSlice";
import { removeTicket, setChats } from "../store/slices/supportSlice";
import { mergeSettings, setSaving } from "../store/slices/settingsSlice";

import { apiRequest, getAdminToken } from "../utils/api";

export const useAdminActions = () => {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const selectedProfile = useSelector((s) => s.auth.selectedProfile);

  const log = (action, module = "admin") => {
    const entry = {
      id: `LOG-${Date.now().toString().slice(-6)}`,
      action,
      username: selectedProfile?.email || "system",
      initials: selectedProfile?.initials || "SYS",
      createdAt: new Date().toISOString(),
    };
    dispatch(addLog(entry));
    try {
      if (getAdminToken()) {
        apiRequest("/api/admin/audit-logs", {
          useAdminToken: true,
          method: "POST",
          body: JSON.stringify({ action, module, description: action }),
        }).catch(() => {});
      }
    } catch {}
  };

  const panel = (title, body, photo = "") =>
    dispatch(setDetailPanel({ title, body: typeof body === "object" ? JSON.stringify(body, null, 2) : body, photo }));

  const openPage = (page) => {
    const path = page === "dashboard" ? "/admin" : `/admin/${page}`;
    dispatch(setActivePage(page));
    navigate(path);
  };

  const handleLogin = async (profile, token) => {
    dispatch(loginSuccess({ profile, token }));
    log(`Authentication / Login successful as [${profile.role}]`);
    panel("Login successful", `${profile.name} signed in as ${profile.role}.`, profile.profilePhoto || "");
    navigate("/admin");
  };

  const handleLogout = () => {
    dispatch(logout());
    navigate("/admin");
  };

  const updateAdminProfile = (changes) => {
    dispatch(updateProfile(changes));
    log("/api/v4/profile/update -> Profile updated");
    panel("Profile updated", "Admin profile saved successfully.");
  };

  // Generic row mutations
  const mutateRow = async (kind, target, action) => {
    const key = target.id || target.name || target.user || target.type;

    if (kind === "users") {
      if (action === "delete") { dispatch(removeUser(key)); log(`/api/v4/users/delete -> ${key}`); }
    } else if (kind === "claims") {
      if (action === "approve") { dispatch(approveClaim(key)); log(`/api/v4/claims/approve -> ${key}`); }
      else if (action === "reject") { dispatch(rejectClaim(key)); log(`/api/v4/claims/reject -> ${key}`); }
      else if (action === "delete") { dispatch(removeClaim(key)); log(`/api/v4/claims/delete -> ${key}`); }
    } else if (kind === "policies") {
      if (action === "approve") { dispatch(approvePolicy(key)); log(`/api/v4/policies/approve -> ${key}`); }
      else if (action === "delete") { dispatch(removePolicy(key)); log(`/api/v4/policies/delete -> ${key}`); }
    } else if (kind === "documents") {
      if (action === "approve") { dispatch(approveDocument(key)); log(`/api/v4/documents/approve -> ${key}`); }
      else if (action === "delete") { dispatch(removeDocument(key)); log(`/api/v4/documents/delete -> ${key}`); }
    } else if (kind === "support") {
      if (action === "delete") { dispatch(removeTicket(key)); log(`/api/v4/support/delete -> ${key}`); }
    }

    panel(action === "delete" ? "Deleted" : "Approved", `${key} was ${action === "delete" ? "removed" : "approved"} by ${selectedProfile.name}.`);
  };

  // Backend data hydration
  const hydrateAllData = async () => {
    const token = getAdminToken();
<<<<<<< HEAD

=======
    
>>>>>>> raj
    if (!token) return;

    try {
      const [usersRes, claimsRes, policiesRes, supportRes, auditRes] = await Promise.all([
        apiRequest("/api/admin/users", { useAdminToken: true }),
        apiRequest("/api/admin/claims", { useAdminToken: true }),
        apiRequest("/api/admin/policies", { useAdminToken: true }),
        apiRequest("/api/admin/support-tickets", { useAdminToken: true }),
        apiRequest("/api/admin/audit-logs", { useAdminToken: true }),
      ]);

      const backendUsers = usersRes?.data?.users || usersRes?.data?.data || usersRes?.data || [];
      
      
      
      
      
      
      dispatch(
  setUsers(
    backendUsers.map((u) => ({
      id: u._id || u.id,
      name: u.fullName || u.fullName || u.name || "No Name",
      email: u.email || "",
      phone: u.phone || "Not Added",
      address: u.address || "Not Added",
      policies: u.policies?.length || u.policyCount || 0,
      status: u.status || (u.is_verified ? "Active" : "Inactive"),
      city: u.city || "Not Added",
    }))
  )
);

      const backendClaims = Array.isArray(claimsRes?.data) ? claimsRes.data : [];
      dispatch(setClaims(backendClaims.map((c) => ({
        id: c.claim_number || c._id,
<<<<<<< HEAD
        user: c.user?.fullName || c.user?.full_name || c.user?.name || "Unknown",
        policy: c.policy?.policyName || c.claim_type || "Insurance",
        amount: c.amount ? `INR ${Number(c.amount).toLocaleString("en-IN")}` : "INR 0",
        status: c.status ? (c.status.charAt(0).toUpperCase() + c.status.slice(1)) : "Pending",
        officer: c.assignedAdmin?.fullName || selectedProfile.name,
      }))));

      const backendTickets = Array.isArray(supportRes?.data) ? supportRes.data : [];
      dispatch(setChats(backendTickets.map((t) => ({
        ...t,
        id:        t._id || t.id,
        userName:  t.userName  || t.user?.fullName  || t.user?.name || "Unknown",
        userEmail: t.userEmail || t.user?.email || "",
        userPhone: t.userPhone || t.user?.phone || "",
        messages: (t.messages || []).map((m) => ({
          ...m,
          id:     m._id   || m.id,
          sender: m.senderRole === "admin" ? "Admin" : (t.user?.fullName || "User"),
          from:   m.senderRole || "user",
          text:   m.text || "",
        })),
      }))));
=======
        user: c.user?.fullName || "Unknown",
        policy: c.policy?.policyName || c.claim_type || "Insurance",
        amount: c.claim_amount ? `INR ${Number(c.amount).toLocaleString("en-IN")}` : "INR 0",
         status: c.status ? (c.status.charAt(0).toUpperCase() + c.status.slice(1)) : "Pending",
        officer: c.assignedAdmin?.fullName || selectedProfile.name,
      }))));

  
      const backendTickets = Array.isArray(supportRes?.data)
  ? supportRes.data
  : [];

dispatch(
  setChats(
    backendTickets.map((ticket) => ({
      id: ticket._id, // MongoDB id

      userId: ticket.user?._id,

      userName:
        ticket.user?.fullName ||
        ticket.user?.name ||
        "Unknown User",

      userEmail:
        ticket.user?.email || "",

      subject: ticket.subject,

      status: ticket.status,

      priority: ticket.priority,

      assignedAdmin: ticket.assignedAdmin,

      messages: ticket.messages || [],

      createdAt: ticket.createdAt,

      updatedAt: ticket.updatedAt,
    }))
  )
);
      
      dispatch(setChats(backendTickets));
>>>>>>> raj
    } catch (err) {
      console.warn("Backend sync unavailable, using local data.", err);
      if (String(err?.message || "").toLowerCase().includes("unauthorized")) {
        handleLogout();
      }
    }
  };

  const saveSetting = async (settingId, fields, systemSettings) => {
    dispatch(setSaving(true));
    try {
      const patch = {};
      fields.forEach((f) => {
        patch[f.name] = systemSettings?.modules?.[f.name] ?? f.defaultValue;
      });
      const res = await apiRequest("/api/admin/settings", {
        useAdminToken: true,
        method: "PATCH",
        body: JSON.stringify(patch),
      });
      if (res?.data) dispatch(mergeSettings(res.data));
      log(`/api/v4/settings/save -> ${settingId}`);
      panel("Settings saved", `${settingId} section saved.`);
    } catch {
      panel("Save failed", "Could not save to backend. Try again.");
    } finally {
      dispatch(setSaving(false));
    }
  };

  return { log, panel, openPage, handleLogin, handleLogout, updateAdminProfile, mutateRow, hydrateAllData, saveSetting };
};
