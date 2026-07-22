import { useState, useEffect } from "react";
import { UserCog } from "lucide-react";
import { SectionTitle } from "../../components/admin/shared";
import { fileToDataUrl } from "../../utils/helpers";
import { apiRequest } from "../../utils/api";

const getPasswordStrength = (pass) => {
  if (!pass) return { score: 0, text: "", color: "bg-slate-200" };
  let score = 0;
  if (pass.length >= 8) score++;
  if (/[A-Z]/.test(pass)) score++;
  if (/[0-9]/.test(pass)) score++;
  if (/[^A-Za-z0-9]/.test(pass)) score++;

  if (score <= 1) return { score, text: "Weak", color: "bg-rose-500", textClass: "text-rose-500" };
  if (score === 2 || score === 3) return { score, text: "Medium", color: "bg-amber-500", textClass: "text-amber-500" };
  return { score, text: "Strong", color: "bg-emerald-500", textClass: "text-emerald-500" };
};

const AdminProfilePage = () => {
  const [profile, setProfile] = useState(null);
  const [nameDraft, setNameDraft] = useState("");

  const [showPwd, setShowPwd] = useState(false);

  const [pwdDraft, setPwdDraft] = useState({
    old: "",
    next: "",
    confirm: "",
  });

  const [pwdMsg, setPwdMsg] = useState("");

  useEffect(() => {
    fetchProfile();
  }, []);

  const fetchProfile = async () => {
    try {
      const res = await apiRequest("/api/admin/profile", {
        useAdminToken: true,
      });
      // console.log(res);
      setProfile(res.data);
      setNameDraft(res.data.fullName);
    } catch (err) {
      console.log(err);
    }
  };


  const saveName = async () => {
    try {
      await apiRequest("/api/admin/profile", {
        method: "PATCH",
        useAdminToken: true,
        body: JSON.stringify({
          fullName: nameDraft,
          phone: profile.phone,
          email: profile.email,
          profilePhoto: profile.profilePhoto,
        }),
      });

      alert("Profile Updated");

      fetchProfile();
    } catch (err) {
      console.log(err);
    }
  };
  const savePassword = async () => {

    if (pwdDraft.next !== pwdDraft.confirm) {
      setPwdMsg("Passwords do not match.");
      return;
    }

    try {

      const res = await apiRequest("/api/admin/profile/password", {
        method: "PATCH",
        useAdminToken: true,
        body: JSON.stringify({
          oldPassword: pwdDraft.old,
          newPassword: pwdDraft.next,
        }),
      });

      setPwdMsg(res.message || "Password Changed");

      setPwdDraft({
        old: "",
        next: "",
        confirm: "",
      });

    } catch (err) {
      setPwdMsg(err.message);
    }

  };

  const onPhotoUpload = (file) => {

    fileToDataUrl(file, async (profilePhoto) => {

      try {

        await apiRequest("/api/admin/profile", {
          method: "PATCH",
          useAdminToken: true,
          body: JSON.stringify({
            fullName: profile.fullName,
            phone: profile.phone,
            profilePhoto,
          }),
        });

        fetchProfile();

      } catch (err) {
        console.log(err);
      }

    });

  };
  const removePhoto = async () => {

    try {

      await apiRequest("/api/admin/profile", {
        method: "PATCH",
        useAdminToken: true,
        body: JSON.stringify({
          fullName: profile.fullName,
          phone: profile.phone,
          profilePhoto: "",
        }),
      });

      fetchProfile();

    } catch (err) {
      console.log(err);
    }

  };


  if (!profile) {
    return <div className="p-5">Loading...</div>;
  }
  // return (
  //     <section className="rounded-xl border border-slate-200 bg-white p-6 shadow-sm"> <SectionTitle icon={UserCog} title="Admin Profile" /> <div className="mt-6 grid gap-6 xl:grid-cols-[340px_1fr]"> {/* ================= LEFT PROFILE CARD ================= */} <div className="rounded-xl border border-slate-200 bg-slate-50 p-6"> <div className="flex flex-col items-center"> {profile.profilePhoto ? ( <img src={profile.profilePhoto} alt={profile.fullName} className="h-28 w-28 rounded-full border-4 border-white object-cover shadow" /> ) : ( <div className="flex h-28 w-28 items-center justify-center rounded-full bg-blue-600 text-3xl font-bold text-white shadow"> {profile.fullName ?.split(" ") .map((n) => n[0]) .join("") .slice(0, 2) .toUpperCase()} </div> )} <h2 className="mt-5 text-2xl font-bold text-slate-900"> {profile.fullName} </h2> <p className="text-sm font-medium text-slate-500"> {profile.role} </p> </div> <div className="mt-6 space-y-3"> <div className="rounded-lg bg-white p-3 shadow-sm"> <p className="text-xs uppercase text-slate-500">Email</p> <p className="font-semibold">{profile.email}</p> </div> <div className="rounded-lg bg-white p-3 shadow-sm"> <p className="text-xs uppercase text-slate-500"> Phone Number </p> <p className="font-semibold">{profile.phone}</p> </div> <div className="rounded-lg bg-white p-3 shadow-sm"> <p className="text-xs uppercase text-slate-500">Role</p> <p className="font-semibold">{profile.role}</p> </div> </div> <div className="mt-6 flex gap-3"> <label className="flex-1 cursor-pointer rounded-lg border border-slate-200 bg-white py-3 text-center text-sm font-semibold hover:bg-slate-100"> Upload <input type="file" hidden accept="image/*" onChange={(e) => onPhotoUpload(e.target.files?.[0])} /> </label> {profile.profilePhoto && ( <button onClick={removePhoto} className="flex-1 rounded-lg bg-red-50 py-3 text-sm font-semibold text-red-600 hover:bg-red-100" > Remove </button> )} </div> </div> {/* ================= RIGHT SECTION ================= */} <div className="space-y-6"> {/* Edit Profile */} <div className="rounded-xl border border-slate-200 p-6"> <h3 className="text-lg font-bold text-slate-900"> Edit Admin Details </h3> <div className="mt-6 grid grid-cols-1 gap-5 lg:grid-cols-12"> <div className="lg:col-span-5"> <label className="text-xs font-bold uppercase text-slate-500"> Admin Name </label> <input className="mt-2 h-12 w-full rounded-lg border border-slate-200 px-4 font-semibold outline-none focus:border-blue-500" value={nameDraft} onChange={(e) => setNameDraft(e.target.value)} /> </div> <div className="lg:col-span-4"> <label className="text-xs font-bold uppercase text-slate-500"> Email </label> <input type="email" className="mt-2 h-12 w-full rounded-lg border border-slate-200 px-4 font-semibold outline-none focus:border-blue-500" value={profile.email} onChange={(e) => setProfile({ ...profile, email: e.target.value, }) } /> </div> <div className="lg:col-span-3"> <label className="text-xs font-bold uppercase text-slate-500"> Phone </label> <input className="mt-2 h-12 w-full rounded-lg border border-slate-200 px-4 font-semibold outline-none focus:border-blue-500" value={profile.phone} onChange={(e) => setProfile({ ...profile, phone: e.target.value, }) } /> </div> </div> <button onClick={saveName} className="mt-6 rounded-lg bg-blue-600 px-6 py-3 font-semibold text-white hover:bg-blue-700" > Save Changes </button> </div> {/* Change Password */} <div className="rounded-xl border border-slate-200 p-6"> <h3 className="text-lg font-bold text-slate-900"> Change Password </h3> <div className="mt-6 grid grid-cols-1 gap-5 lg:grid-cols-3"> {[ ["Old Password", "old"], ["New Password", "next"], ["Confirm Password", "confirm"], ].map(([label, key]) => ( <div key={key}> <label className="text-xs font-bold uppercase text-slate-500"> {label} </label> <input type={showPwd ? "text" : "password"} value={pwdDraft[key]} onChange={(e) => setPwdDraft({ ...pwdDraft, [key]: e.target.value, }) } className="mt-2 h-12 w-full rounded-lg border border-slate-200 px-4 font-semibold outline-none focus:border-blue-500" /> </div> ))} </div> <div className="mt-6 flex flex-wrap gap-3"> <button onClick={() => setShowPwd(!showPwd)} className="rounded-lg border border-slate-200 px-5 py-3 font-semibold hover:bg-slate-100" > {showPwd ? "Hide" : "Show"} Password </button> <button onClick={savePassword} className="rounded-lg bg-blue-600 px-6 py-3 font-semibold text-white hover:bg-blue-700" > Update Password </button> </div> {pwdMsg && ( <div className="mt-4 rounded-lg bg-green-50 p-3 font-medium text-green-700"> {pwdMsg} </div> )} </div> </div> </div> </section>

  // );
  return (
    <section className="rounded-xl border border-slate-200 bg-white p-6 shadow-sm">
      <SectionTitle icon={UserCog} title="Admin Profile" />

      <div className="mt-6 flex flex-col gap-5">

        {/* Top layout: avatar card + stacked sections */}
        <div className="grid gap-5" style={{ gridTemplateColumns: "240px 1fr" }}>

          {/* Left: Avatar Card */}
          <div className="flex flex-col items-center rounded-xl border border-slate-200 bg-slate-50 p-6 text-center">

            {/* Avatar */}
            {profile.profilePhoto ? (
              <img
                src={profile.profilePhoto}
                alt={profile.fullName}
                className="h-20 w-20 rounded-full border-4 border-white object-cover shadow"
              />
            ) : (
              <div className="flex h-20 w-20 items-center justify-center rounded-full bg-blue-600 text-2xl font-bold text-white shadow">
                {profile.fullName
                  ?.split(" ")
                  .map((n) => n[0])
                  .join("")
                  .slice(0, 2)
                  .toUpperCase()}
              </div>
            )}

            <h2 className="mt-3 text-base font-bold text-slate-900">{profile.fullName}</h2>
            <p className="text-xs font-medium text-slate-500">{profile.role}</p>

            <hr className="my-4 w-full border-slate-200" />

            {/* Meta info */}
            <div className="flex w-full flex-col gap-2">
              <div className="rounded-lg bg-white p-2.5 text-left shadow-sm">
                <p className="text-[10px] uppercase tracking-wide text-slate-400">Email</p>
                <p className="text-sm font-semibold text-slate-800">{profile.email}</p>
              </div>
              <div className="rounded-lg bg-white p-2.5 text-left shadow-sm">
                <p className="text-[10px] uppercase tracking-wide text-slate-400">Phone</p>
                <p className="text-sm font-semibold text-slate-800">{profile.phone}</p>
              </div>
              <div className="rounded-lg bg-white p-2.5 text-left shadow-sm">
                <p className="text-[10px] uppercase tracking-wide text-slate-400">Role</p>
                <p className="text-sm font-semibold text-slate-800">{profile.role}</p>
              </div>
            </div>

            <hr className="my-4 w-full border-slate-200" />

            {/* Photo actions */}
            <div className="flex w-full gap-2">
              <label className="flex flex-1 cursor-pointer items-center justify-center gap-1.5 rounded-lg border border-slate-200 bg-white py-2 text-sm font-semibold text-slate-700 hover:bg-slate-100">
                Upload
                <input
                  type="file"
                  hidden
                  accept="image/*"
                  onChange={(e) => onPhotoUpload(e.target.files?.[0])}
                />
              </label>
              {profile.profilePhoto && (
                <button
                  onClick={removePhoto}
                  className="flex flex-1 items-center justify-center gap-1.5 rounded-lg bg-red-50 py-2 text-sm font-semibold text-red-600 hover:bg-red-100"
                >
                  Remove
                </button>
              )}
            </div>
          </div>

          {/* Right: Stacked form sections */}
          <div className="flex flex-col gap-5">

            {/* Section 1: Personal Details */}
            <div className="rounded-xl border border-slate-200 bg-white p-6">
              <h3 className="text-base font-bold text-slate-900">Personal details</h3>

              <div className="mt-5 grid grid-cols-3 gap-4">
                <div>
                  <label className="text-[11px] font-bold uppercase tracking-wide text-slate-500">
                    Full name
                  </label>
                  <input
                    value={nameDraft}
                    onChange={(e) => setNameDraft(e.target.value)}
                    placeholder="Full name"
                    className="mt-2 h-10 w-full rounded-lg border border-slate-200 px-3 text-sm font-semibold text-slate-800 outline-none focus:border-blue-500"
                  />
                </div>

                <div>
                  <label className="text-[11px] font-bold uppercase tracking-wide text-slate-500">
                    Email address
                  </label>
                  <input
                    type="email"
                    value={profile.email}
                    onChange={(e) => setProfile({ ...profile, email: e.target.value })}
                    placeholder="Email"
                    className="mt-2 h-10 w-full rounded-lg border border-slate-200 px-3 text-sm font-semibold text-slate-800 outline-none focus:border-blue-500"
                  />
                </div>

                <div>
                  <label className="text-[11px] font-bold uppercase tracking-wide text-slate-500">
                    Phone number
                  </label>
                  <input
                    type="tel"
                    value={profile.phone}
                    onChange={(e) => setProfile({ ...profile, phone: e.target.value })}
                    placeholder="Phone"
                    className="mt-2 h-10 w-full rounded-lg border border-slate-200 px-3 text-sm font-semibold text-slate-800 outline-none focus:border-blue-500"
                  />
                </div>
              </div>

              <div className="mt-5 flex justify-end">
                <button
                  onClick={saveName}
                  className="rounded-lg bg-blue-600 px-5 py-2.5 text-sm font-semibold text-white hover:bg-blue-700"
                >
                  Save details
                </button>
              </div>
            </div>

            {/* Section 2: Change Password */}
            <div className="rounded-xl border border-slate-200 bg-white p-6">
              <h3 className="text-base font-bold text-slate-900">Change password</h3>

              <div className="mt-5 grid grid-cols-1 md:grid-cols-3 gap-4">
                <div>
                  <label className="text-[11px] font-bold uppercase tracking-wide text-slate-500">
                    Current password
                  </label>
                  <input
                    type={showPwd ? "text" : "password"}
                    value={pwdDraft.old}
                    onChange={(e) => setPwdDraft({ ...pwdDraft, old: e.target.value })}
                    placeholder="••••••••"
                    className="mt-2 h-10 w-full rounded-lg border border-slate-200 px-3 text-sm font-semibold text-slate-800 outline-none focus:border-blue-500"
                  />
                </div>

                <div>
                  <label className="text-[11px] font-bold uppercase tracking-wide text-slate-500">
                    New password
                  </label>
                  <input
                    type={showPwd ? "text" : "password"}
                    value={pwdDraft.next}
                    onChange={(e) => setPwdDraft({ ...pwdDraft, next: e.target.value })}
                    placeholder="••••••••"
                    className="mt-2 h-10 w-full rounded-lg border border-slate-200 px-3 text-sm font-semibold text-slate-800 outline-none focus:border-blue-500"
                  />
                  {pwdDraft.next && (
                    <div className="mt-1 space-y-1 px-1">
                      <div className="flex justify-between items-center text-[10px]">
                        <span className="text-slate-400">Strength:</span>
                        <span className={`font-black ${getPasswordStrength(pwdDraft.next).textClass}`}>{getPasswordStrength(pwdDraft.next).text}</span>
                      </div>
                      <div className="h-1 w-full rounded-full bg-slate-100 overflow-hidden">
                        <div
                          className={`h-full rounded-full transition-all duration-300 ${getPasswordStrength(pwdDraft.next).color}`}
                          style={{ width: `${(getPasswordStrength(pwdDraft.next).score / 4) * 100}%` }}
                        />
                      </div>
                    </div>
                  )}
                </div>

                <div>
                  <label className="text-[11px] font-bold uppercase tracking-wide text-slate-500">
                    Confirm password
                  </label>
                  <input
                    type={showPwd ? "text" : "password"}
                    value={pwdDraft.confirm}
                    onChange={(e) => setPwdDraft({ ...pwdDraft, confirm: e.target.value })}
                    placeholder="••••••••"
                    className="mt-2 h-10 w-full rounded-lg border border-slate-200 px-3 text-sm font-semibold text-slate-800 outline-none focus:border-blue-500"
                  />
                </div>
              </div>

              <div className="mt-5 flex items-center justify-between gap-3 flex-wrap">
                <button
                  onClick={() => setShowPwd(!showPwd)}
                  className="rounded-lg border border-slate-200 px-4 py-2.5 text-sm font-semibold text-slate-700 hover:bg-slate-100"
                >
                  {showPwd ? "Hide" : "Show"} passwords
                </button>

                <button
                  onClick={savePassword}
                  className="rounded-lg bg-blue-600 px-5 py-2.5 text-sm font-semibold text-white hover:bg-blue-700"
                >
                  Update password
                </button>
              </div>

              {pwdMsg && (
                <div className="mt-4 rounded-lg bg-green-50 p-3 text-sm font-medium text-green-700">
                  {pwdMsg}
                </div>
              )}
            </div>

            {/* Section 3: Two-Factor Authentication */}
            <div className="rounded-xl border border-slate-200 bg-white p-6">
              <h3 className="text-base font-bold text-slate-900">Two-Factor Authentication (2FA)</h3>
              <p className="mt-1 text-xs text-slate-500 font-semibold">
                Increase your admin account security by requiring a 6-digit email verification code upon login.
              </p>
              <div className="mt-4 flex items-center justify-between rounded-lg bg-slate-50 p-4 border border-slate-100">
                <div>
                  <div className="text-sm font-bold text-slate-800">2FA Login Requirement</div>
                  <div className="text-[11px] font-semibold text-slate-500 mt-0.5">
                    Status: <span className={profile.twoFactorEnabled ? "text-emerald-600 font-bold" : "text-slate-500"}>{profile.twoFactorEnabled ? "Enabled" : "Disabled"}</span>
                  </div>
                </div>
                <button
                  onClick={async () => {
                    try {
                      const targetState = !profile.twoFactorEnabled;
                      const res = await apiRequest("/api/admin/profile", {
                        method: "PATCH",
                        useAdminToken: true,
                        body: JSON.stringify({ twoFactorEnabled: targetState }),
                      });
                      if (res?.success) {
                        alert(`2FA has been ${targetState ? "enabled" : "disabled"} for your admin account.`);
                        fetchProfile();
                      }
                    } catch (err) {
                      alert(err.message || "Failed to toggle 2FA.");
                    }
                  }}
                  className={`rounded-lg px-4 py-2 text-xs font-bold text-white transition ${profile.twoFactorEnabled ? "bg-emerald-600 hover:bg-emerald-505" : "bg-blue-600 hover:bg-blue-500"
                    }`}
                >
                  {profile.twoFactorEnabled ? "Disable" : "Enable"}
                </button>
              </div>
            </div>

          </div>
        </div>
      </div>
    </section>
  );





};

export default AdminProfilePage;
