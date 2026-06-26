import { useEffect, useState } from "react";
import { ShieldCheck, User, Users, Plus, Trash2 } from "lucide-react";
import { useAuth } from "../../contexts/useAuth";
import { apiRequest } from "../../utils/api";

// Profile headings, family member labels, and relation options are controlled here.
const DashboardProfile = () => {
  const { user } = useAuth();
  const [profile, setProfile] = useState(null);
  const [members, setMembers] = useState([]);
  const [name, setName] = useState("");
  const [relation, setRelation] = useState("Spouse");
  const [profilePhoto, setProfilePhoto] = useState(() => user?.profilePhoto || "");
  const [loadingProfile, setLoadingProfile] = useState(true);
  const [statusMessage, setStatusMessage] = useState("");

  const updateStoredUser = (changes) => {
    const sessionKey = "agile_insurance_session_v1";
    const usersKey = "agile_insurance_users_v1";
    const session = JSON.parse(localStorage.getItem(sessionKey) || "null");
    const storedUsers = JSON.parse(localStorage.getItem(usersKey) || "[]");
    const nextSessionUser = { ...(session?.user || user || {}), ...changes };

    localStorage.setItem(sessionKey, JSON.stringify({ user: nextSessionUser }));
    if (Array.isArray(storedUsers)) {
      localStorage.setItem(
        usersKey,
        JSON.stringify(storedUsers.map((storedUser) => (storedUser.id === nextSessionUser.id ? { ...storedUser, ...changes } : storedUser))),
      );
    }
    window.dispatchEvent(new CustomEvent("agile-profile-updated", { detail: nextSessionUser }));
  };

  const uploadPhoto = (file) => {
    if (!file) return;
    const reader = new FileReader();
    reader.onload = () => {
      const nextPhoto = String(reader.result || "");
      setProfilePhoto(nextPhoto);
      updateStoredUser({ profilePhoto: nextPhoto });
    };
    reader.readAsDataURL(file);
  };

  useEffect(() => {
    let mounted = true;

    const loadProfile = async () => {
      if (!user?.email) {
        setMembers([]);
        setLoadingProfile(false);
        return;
      }

      try {
        setLoadingProfile(true);
        const response = await apiRequest("/api/profile/me");

        if (!mounted) return;

        const profileData = response?.data || null;
        setProfile(profileData);
        setMembers(Array.isArray(profileData?.familyMembers) ? profileData.familyMembers : []);
        setProfilePhoto(profileData?.profile_photo || user?.profilePhoto || "");
        setStatusMessage("");
      } catch (error) {
        if (mounted) {
          setStatusMessage(error.message || "Unable to load profile details right now.");
        }
      } finally {
        if (mounted) {
          setLoadingProfile(false);
        }
      }
    };

    loadProfile();

    return () => {
      mounted = false;
    };
  }, [user?.email]);

  const add = async () => {
    const n = name.trim();
    if (!n) return;

    try {
      const response = await apiRequest("/api/profile/family", {
        method: "POST",
        body: JSON.stringify({ name: n, relation }),
      });

      const nextProfile = response?.data || null;
      setProfile(nextProfile);
      setMembers(Array.isArray(nextProfile?.familyMembers) ? nextProfile.familyMembers : []);
      setName("");
      setStatusMessage("Family member added successfully.");
    } catch (error) {
      setStatusMessage(error.message || "Unable to add family member right now.");
    }
  };

  const remove = async (id) => {
    try {
      const response = await apiRequest(`/api/profile/family/${id}`, { method: "DELETE" });
      const nextProfile = response?.data || null;
      setProfile(nextProfile);
      setMembers(Array.isArray(nextProfile?.familyMembers) ? nextProfile.familyMembers : []);
      setStatusMessage("Family member removed successfully.");
    } catch (error) {
      setStatusMessage(error.message || "Unable to remove family member right now.");
    }
  };

  return (
    <div className="space-y-8">
      <div className="rounded-3xl border border-slate-200 bg-white p-5 shadow-sm dark:border-white/10 dark:bg-white/5 sm:rounded-[2.6rem] sm:p-8">
        <div className="flex flex-col gap-6 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <div className="inline-flex items-center gap-2 rounded-full border border-slate-200 bg-white px-4 py-2 text-xs font-semibold text-slate-700 dark:border-white/10 dark:bg-white/5 dark:text-slate-200">
              <ShieldCheck size={16} className="text-blue-600 dark:text-blue-400" />
              Profile settings • Family members • Nominee management
            </div>
            <h1 className="mt-6 text-3xl font-black tracking-tight text-slate-900 dark:text-white">Profile</h1>
            <p className="mt-2 text-slate-600 dark:text-slate-300">Manage user profile and connected family members.</p>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
        <div className="rounded-3xl border border-slate-200 bg-white p-5 shadow-sm dark:border-white/10 dark:bg-white/5 sm:rounded-[2.6rem] sm:p-8">
          <div className="flex items-center gap-2 text-sm font-black text-slate-900 dark:text-slate-100">
            <User size={18} className="text-blue-600 dark:text-blue-400" />
            User profile
          </div>
          <div className="mt-6 flex flex-col gap-4 rounded-3xl border border-slate-200 bg-slate-50 p-5 dark:border-white/10 dark:bg-white/5 sm:flex-row sm:items-center">
            {profilePhoto ? (
              <img src={profilePhoto} alt={user?.fullName ?? "User"} className="h-20 w-20 rounded-3xl object-cover" />
            ) : (
              <span className="grid h-20 w-20 place-items-center rounded-3xl bg-blue-600 text-xl font-black text-white">
                {(user?.fullName?.[0] || user?.email?.[0] || "U").toUpperCase()}
              </span>
            )}
            <div className="min-w-0 flex-1">
              <div className="text-sm font-black text-slate-900 dark:text-white">{profile?.fullName || user?.fullName || "Member"}</div>
              <div className="mt-1 truncate text-xs font-semibold text-slate-500 dark:text-slate-400">{profile?.email || user?.email}</div>
            </div>
            <label className="inline-flex cursor-pointer items-center justify-center rounded-2xl border border-slate-200 bg-white px-4 py-3 text-sm font-black text-slate-800 shadow-sm hover:bg-slate-50 dark:border-white/10 dark:bg-white/5 dark:text-slate-100 dark:hover:bg-white/10">
              Upload Photo
              <input type="file" accept="image/*" className="hidden" onChange={(event) => uploadPhoto(event.target.files?.[0])} />
            </label>
          </div>
          <div className="mt-6 grid grid-cols-1 gap-4 sm:grid-cols-2">
            {/* Developer note: profile summary fields mirror the verified user object from AuthContext. */}
            {[
              { label: "Full name", value: profile?.fullName || user?.fullName || "—" },
              { label: "Email", value: profile?.email || user?.email || "—" },
              { label: "Phone", value: profile?.phone || user?.phone || "—" },
              { label: "Address", value: profile?.address || user?.address || "—" },
              { label: "Member since", value: profile?.createdAt ? new Date(profile.createdAt).toLocaleDateString() : user?.createdAt ? new Date(user.createdAt).toLocaleDateString() : "—" },
            ].map((x) => (
              <div key={x.label} className="rounded-3xl border border-slate-200 bg-slate-50 p-5 dark:border-white/10 dark:bg-white/5">
                <div className="text-xs font-bold text-slate-500 dark:text-slate-400">{x.label}</div>
                <div className="mt-2 truncate text-sm font-black text-slate-900 dark:text-white">{x.value}</div>
              </div>
            ))}
          </div>
          <div className="mt-6 rounded-3xl border border-slate-200 bg-white p-5 text-sm font-semibold text-slate-600 dark:border-white/10 dark:bg-white/5 dark:text-slate-300">
            Profile changes are managed through the account verification workflow.
          </div>
        </div>

        <div className="rounded-3xl border border-slate-200 bg-white p-5 shadow-sm dark:border-white/10 dark:bg-white/5 sm:rounded-[2.6rem] sm:p-8">
          <div className="flex items-center gap-2 text-sm font-black text-slate-900 dark:text-slate-100">
            <Users size={18} className="text-blue-600 dark:text-blue-400" />
            Family member management
          </div>
          <div className="mt-6 grid grid-cols-1 gap-4 md:grid-cols-[1fr_180px_auto]">
            <input
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="rounded-2xl border border-slate-200 bg-white px-4 py-3 text-sm font-semibold text-slate-800 outline-none focus:border-blue-500 dark:border-white/10 dark:bg-white/5 dark:text-slate-100"
              placeholder="Member name"
            />
            <select
              value={relation}
              onChange={(e) => setRelation(e.target.value)}
              className="rounded-2xl border border-slate-200 bg-white px-4 py-3 text-sm font-semibold text-slate-800 outline-none focus:border-blue-500 dark:border-white/10 dark:bg-slate-800 dark:text-slate-100"
            >
              {["Spouse", "Parent", "Child", "Sibling", "Other"].map((r) => (
                <option key={r} value={r}>
                  {r}
                </option>
              ))}
            </select>
            <button
              onClick={add}
              className="inline-flex items-center justify-center gap-2 rounded-2xl bg-gradient-to-r from-blue-600 to-indigo-600 px-5 py-3 text-sm font-black text-white shadow-sm hover:opacity-95"
            >
              <Plus size={18} />
              Add
            </button>
          </div>

          {statusMessage ? <p className="mt-4 text-sm font-semibold text-slate-600 dark:text-slate-300">{statusMessage}</p> : null}

          <div className="mt-6 space-y-3">
            {loadingProfile ? (
              <div className="rounded-3xl border border-slate-200 bg-slate-50 p-8 text-center text-sm font-semibold text-slate-600 dark:border-white/10 dark:bg-white/5 dark:text-slate-300">
                Loading family details...
              </div>
            ) : !members.length ? (
              <div className="rounded-3xl border border-slate-200 bg-slate-50 p-8 text-center text-sm font-semibold text-slate-600 dark:border-white/10 dark:bg-white/5 dark:text-slate-300">
                No family members added yet.
              </div>
            ) : (
              members.map((m) => (
                <div
                  key={m.id}
                  className="flex flex-col gap-4 rounded-3xl border border-slate-200 bg-slate-50 px-5 py-4 dark:border-white/10 dark:bg-white/5 sm:flex-row sm:items-center sm:justify-between"
                >
                  <div className="min-w-0">
                    <div className="truncate text-sm font-black text-slate-900 dark:text-white">{m.name}</div>
                    <div className="mt-1 text-xs font-semibold text-slate-500 dark:text-slate-400">{m.relation}</div>
                    {m.phone ? <div className="mt-1 text-xs text-slate-500 dark:text-slate-400">{m.phone}</div> : null}
                  </div>
                  <button
                    onClick={() => remove(m._id || m.id)}
                    className="inline-flex w-full items-center justify-center gap-2 rounded-2xl border border-slate-200 bg-white px-4 py-3 text-sm font-black text-slate-800 shadow-sm hover:bg-slate-50 dark:border-white/10 dark:bg-white/5 dark:text-slate-100 dark:hover:bg-white/10 sm:w-auto"
                  >
                    <Trash2 size={16} />
                    Remove
                  </button>
                </div>
              ))
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default DashboardProfile;
