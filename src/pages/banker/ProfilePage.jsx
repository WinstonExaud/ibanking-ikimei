import { useState, useRef, useCallback } from 'react';
import {
  Camera, User, Mail, Lock, Eye, EyeOff, Save, CheckCircle2,
  Shield, Clock, Activity, AlertTriangle, Loader2, Pencil, X,
  LogOut, ChevronRight, Smartphone, Globe
} from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { useToast } from '../../context/ToastContext';
import {
  updateProfile, updateEmail, updatePassword,
  reauthenticateWithCredential, EmailAuthProvider
} from 'firebase/auth';
import { doc, updateDoc } from 'firebase/firestore';
import { ref, uploadBytes, getDownloadURL } from 'firebase/storage';
import { auth, db, storage } from '../../services/firebase';

// ─── helpers ──────────────────────────────────────────────────────────────────
const gradients = {
  banker:  'linear-gradient(135deg,#1D4ED8 0%,#7C3AED 100%)',
  account: 'linear-gradient(135deg,#0891B2 0%,#2563EB 100%)',
  client:  'linear-gradient(135deg,#059669 0%,#0891B2 100%)',
};

function initials(name = '') {
  return name.split(' ').map(w => w[0]).slice(0, 2).join('').toUpperCase() || 'U';
}

// ─── Avatar ───────────────────────────────────────────────────────────────────
function AvatarUpload({ userDoc, onUploaded }) {
  const [uploading, setUploading] = useState(false);
  const [preview,   setPreview]   = useState(userDoc?.photoURL || null);
  const inputRef = useRef(null);
  const { addToast } = useToast();

  const handleFile = useCallback(async (file) => {
    if (!file) return;
    if (file.size > 5 * 1024 * 1024) {
      addToast({ type: 'error', title: 'File too large', message: 'Max 5MB allowed.' });
      return;
    }
    // Instant preview
    const url = URL.createObjectURL(file);
    setPreview(url);
    setUploading(true);
    try {
      const storageRef = ref(storage, `avatars/${auth.currentUser.uid}`);
      await uploadBytes(storageRef, file);
      const downloadURL = await getDownloadURL(storageRef);
      await updateProfile(auth.currentUser, { photoURL: downloadURL });
      await updateDoc(doc(db, 'users', auth.currentUser.uid), { photoURL: downloadURL });
      setPreview(downloadURL);
      onUploaded?.(downloadURL);
      addToast({ type: 'success', title: 'Photo updated', message: 'Profile picture saved.' });
    } catch (err) {
      addToast({ type: 'error', title: 'Upload failed', message: err.message });
      setPreview(userDoc?.photoURL || null);
    } finally {
      setUploading(false);
    }
  }, [userDoc, addToast, onUploaded]);

  return (
    <div className="relative inline-block">
      {/* Avatar circle */}
      <div
        className="w-28 h-28 rounded-full ring-4 ring-white shadow-2xl flex items-center justify-center overflow-hidden flex-shrink-0 select-none"
        style={{ background: preview ? undefined : (gradients[userDoc?.role] || gradients.banker) }}
      >
        {preview
          ? <img src={preview} alt="avatar" className="w-full h-full object-cover" />
          : <span className="text-white font-black text-3xl font-poppins">{initials(userDoc?.name)}</span>
        }
        {uploading && (
          <div className="absolute inset-0 bg-black/40 flex items-center justify-center rounded-full">
            <Loader2 size={28} className="text-white animate-spin" />
          </div>
        )}
      </div>

      {/* Camera button */}
      <button
        onClick={() => inputRef.current?.click()}
        disabled={uploading}
        className="absolute bottom-1 right-1 w-9 h-9 bg-primary-500 hover:bg-primary-600 text-white rounded-full flex items-center justify-center shadow-lg transition-all active:scale-90 border-2 border-white disabled:opacity-50"
        title="Change photo"
      >
        <Camera size={15} />
      </button>

      <input
        ref={inputRef}
        type="file"
        accept="image/*"
        className="hidden"
        onChange={e => handleFile(e.target.files?.[0])}
      />
    </div>
  );
}

// ─── Input field ──────────────────────────────────────────────────────────────
function Field({ label, icon: Icon, type = 'text', value, onChange, placeholder, disabled, suffix }) {
  const [show, setShow] = useState(false);
  const isPass = type === 'password';

  return (
    <div>
      <label className="block text-[11px] font-bold text-gray-400 uppercase tracking-widest mb-1.5 font-inter">
        {label}
      </label>
      <div className="relative flex items-center">
        {Icon && (
          <div className="absolute left-3.5 flex items-center justify-center pointer-events-none">
            <Icon size={15} className="text-gray-400" />
          </div>
        )}
        <input
          type={isPass && show ? 'text' : type}
          value={value}
          onChange={onChange}
          placeholder={placeholder}
          disabled={disabled}
          className={`
            w-full rounded-xl border-2 text-sm font-inter text-gray-800 placeholder-gray-300
            transition-all outline-none
            ${Icon ? 'pl-10' : 'pl-4'} pr-${isPass || suffix ? '11' : '4'} py-3
            ${disabled
              ? 'bg-gray-50 border-gray-100 text-gray-400 cursor-not-allowed'
              : 'bg-white border-gray-200 focus:border-primary-400 focus:shadow-[0_0_0_3px_rgba(37,99,235,0.08)]'
            }
          `}
        />
        {isPass && (
          <button
            type="button"
            onClick={() => setShow(!show)}
            className="absolute right-3.5 text-gray-300 hover:text-gray-500 transition-colors"
          >
            {show ? <EyeOff size={15} /> : <Eye size={15} />}
          </button>
        )}
        {suffix && !isPass && (
          <span className="absolute right-3.5 text-xs text-gray-400 font-inter">{suffix}</span>
        )}
      </div>
    </div>
  );
}

// ─── Section card ─────────────────────────────────────────────────────────────
function SectionCard({ title, description, icon: Icon, iconColor = 'text-primary-500', iconBg = 'bg-primary-50', children }) {
  return (
    <div className="bg-white rounded-2xl border border-gray-100 overflow-hidden"
      style={{ boxShadow: '0 2px 12px rgba(0,0,0,0.04)' }}>
      <div className="flex items-center gap-3 px-6 py-4 border-b border-gray-100 bg-gray-50/60">
        <div className={`w-8 h-8 ${iconBg} rounded-lg flex items-center justify-center flex-shrink-0`}>
          <Icon size={15} className={iconColor} />
        </div>
        <div>
          <h3 className="text-sm font-bold text-gray-900 font-poppins leading-none">{title}</h3>
          {description && <p className="text-[11px] text-gray-400 font-inter mt-0.5">{description}</p>}
        </div>
      </div>
      <div className="px-6 py-5">{children}</div>
    </div>
  );
}

// ─── Stat badge ───────────────────────────────────────────────────────────────
function StatBadge({ label, value, color = 'text-primary-600', bg = 'bg-primary-50' }) {
  return (
    <div className={`${bg} rounded-xl px-4 py-3 text-center`}>
      <p className={`text-lg font-black font-poppins ${color}`}>{value}</p>
      <p className="text-[10px] font-semibold text-gray-400 font-inter uppercase tracking-wide mt-0.5">{label}</p>
    </div>
  );
}

// ─── Main page ────────────────────────────────────────────────────────────────
export default function ProfilePage() {
  const { user, userDoc, refreshUserDoc } = useAuth();
  const { addToast } = useToast();

  // Profile form
  const [name,    setName]    = useState(userDoc?.name  || '');
  const [email,   setEmail]   = useState(user?.email    || '');
  const [saving,  setSaving]  = useState(false);
  const [saved,   setSaved]   = useState(false);

  // Password form
  const [currentPwd,  setCurrentPwd]  = useState('');
  const [newPwd,      setNewPwd]      = useState('');
  const [confirmPwd,  setConfirmPwd]  = useState('');
  const [pwdSaving,   setPwdSaving]   = useState(false);
  const [pwdStrength, setPwdStrength] = useState(0);

  // Password strength meter
  const checkStrength = (pwd) => {
    let score = 0;
    if (pwd.length >= 8)              score++;
    if (/[A-Z]/.test(pwd))            score++;
    if (/[0-9]/.test(pwd))            score++;
    if (/[^A-Za-z0-9]/.test(pwd))    score++;
    setPwdStrength(score);
  };

  const strengthLabel = ['', 'Weak', 'Fair', 'Good', 'Strong'];
  const strengthColor = ['', 'bg-red-400', 'bg-amber-400', 'bg-blue-400', 'bg-green-500'];
  const strengthText  = ['', 'text-red-500', 'text-amber-500', 'text-blue-500', 'text-green-600'];

  // Save profile
  const handleSaveProfile = async () => {
    if (!name.trim()) { addToast({ type: 'error', title: 'Name required' }); return; }
    setSaving(true);
    try {
      // Update Firebase Auth display name
      await updateProfile(auth.currentUser, { displayName: name.trim() });

      // Update email if changed
      if (email.trim() !== user.email) {
        await updateEmail(auth.currentUser, email.trim());
      }

      // Update Firestore user doc
      await updateDoc(doc(db, 'users', user.uid), {
        name:  name.trim(),
        email: email.trim(),
      });

      await refreshUserDoc();
      setSaved(true);
      setTimeout(() => setSaved(false), 3000);
      addToast({ type: 'success', title: 'Profile updated', message: 'Your changes have been saved.' });
    } catch (err) {
      // email-already-in-use, requires-recent-login, etc.
      const msg = err.code === 'auth/requires-recent-login'
        ? 'Please sign out and sign back in before changing your email.'
        : err.message;
      addToast({ type: 'error', title: 'Update failed', message: msg });
    } finally {
      setSaving(false);
    }
  };

  // Change password
  const handleChangePassword = async () => {
    if (!currentPwd) { addToast({ type: 'error', title: 'Enter current password' }); return; }
    if (newPwd.length < 8) { addToast({ type: 'error', title: 'Password too short', message: 'Minimum 8 characters.' }); return; }
    if (newPwd !== confirmPwd) { addToast({ type: 'error', title: 'Passwords do not match' }); return; }

    setPwdSaving(true);
    try {
      // Re-authenticate first
      const credential = EmailAuthProvider.credential(user.email, currentPwd);
      await reauthenticateWithCredential(auth.currentUser, credential);
      await updatePassword(auth.currentUser, newPwd);

      setCurrentPwd(''); setNewPwd(''); setConfirmPwd(''); setPwdStrength(0);
      addToast({ type: 'success', title: 'Password changed', message: 'Your new password is active.' });
    } catch (err) {
      const msg = err.code === 'auth/wrong-password'
        ? 'Current password is incorrect.'
        : err.message;
      addToast({ type: 'error', title: 'Failed', message: msg });
    } finally {
      setPwdSaving(false);
    }
  };

  const roleLabel = { banker: 'Banker · Full Access', account: 'Business Account', client: 'Client · View Only' };
  const roleBadge = { banker: 'bg-purple-100 text-purple-700', account: 'bg-blue-100 text-blue-700', client: 'bg-green-100 text-green-700' };

  return (
    <div className="p-5 lg:p-6 animate-fade-in">

      {/* ── Page header ── */}
      <div className="mb-7">
        <h2 className="text-2xl font-black text-gray-900 font-poppins">My Profile</h2>
        <p className="text-sm text-gray-400 font-inter mt-0.5">Manage your identity, credentials, and preferences</p>
      </div>

      <div className="max-w-3xl mx-auto space-y-5">

        {/* ── Hero card ── */}
        <div
          className="relative rounded-2xl overflow-hidden"
          style={{ background: 'linear-gradient(135deg,#0F2A7F 0%,#1D4ED8 50%,#3B82F6 100%)' }}
        >
          {/* Decorative blobs */}
          <svg className="absolute inset-0 w-full h-full pointer-events-none opacity-10" viewBox="0 0 700 200" preserveAspectRatio="xMidYMid slice">
            <ellipse cx="600" cy="40"  rx="220" ry="160" fill="white" transform="rotate(-20 600 40)" />
            <ellipse cx="80"  cy="180" rx="200" ry="140" fill="white" transform="rotate(10 80 180)"  />
            <circle  cx="350" cy="100" r="80" fill="white" fillOpacity="0.3" />
          </svg>

          <div className="relative z-10 flex flex-col sm:flex-row items-center sm:items-end gap-5 px-8 pt-8 pb-6">
            {/* Avatar */}
            <AvatarUpload userDoc={userDoc} onUploaded={() => refreshUserDoc()} />

            {/* Name + role */}
            <div className="text-center sm:text-left flex-1 pb-1">
              <h3 className="text-2xl font-black text-white font-poppins leading-tight">
                {userDoc?.name || 'Your Name'}
              </h3>
              <p className="text-blue-200 text-sm font-inter mt-0.5">{user?.email}</p>
              <span className={`inline-block text-xs font-bold px-3 py-1 rounded-full mt-2 ${roleBadge[userDoc?.role] || 'bg-white/20 text-white'}`}>
                {roleLabel[userDoc?.role] || userDoc?.role}
              </span>
            </div>

            {/* Stats */}
            <div className="grid grid-cols-3 gap-2 w-full sm:w-auto">
              <StatBadge label="Role"     value={userDoc?.role === 'banker' ? 'Admin' : 'User'} color="text-blue-700"   bg="bg-white/20" />
              <StatBadge label="Status"   value="Active"                                         color="text-green-600"  bg="bg-white/20" />
              <StatBadge label="Access"   value={userDoc?.role === 'client' ? 'R/O' : 'R/W'}    color="text-purple-700" bg="bg-white/20" />
            </div>
          </div>
        </div>

        {/* ── Personal info ── */}
        <SectionCard
          title="Personal Information"
          description="Update your name and email address"
          icon={User}
          iconColor="text-blue-600"
          iconBg="bg-blue-50"
        >
          <div className="space-y-4">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <Field
                label="Full Name"
                icon={User}
                value={name}
                onChange={e => setName(e.target.value)}
                placeholder="James Cement"
              />
              <Field
                label="Email Address"
                icon={Mail}
                type="email"
                value={email}
                onChange={e => setEmail(e.target.value)}
                placeholder="you@ikimei.com"
              />
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <Field
                label="Account ID"
                value={userDoc?.accountId || userDoc?.uid?.slice(0, 12) || '—'}
                disabled
                suffix="read-only"
              />
              <Field
                label="Role"
                value={userDoc?.role || '—'}
                disabled
                suffix="read-only"
              />
            </div>

            {/* Save button */}
            <div className="flex items-center justify-end gap-3 pt-1">
              {saved && (
                <div className="flex items-center gap-1.5 text-green-600 text-sm font-inter font-semibold">
                  <CheckCircle2 size={15} />
                  <span>Saved!</span>
                </div>
              )}
              <button
                onClick={handleSaveProfile}
                disabled={saving}
                className="flex items-center gap-2 px-5 py-2.5 rounded-xl text-sm font-bold font-inter text-white transition-all active:scale-95 disabled:opacity-60"
                style={{ background: 'linear-gradient(135deg,#1D4ED8,#3B82F6)', boxShadow: '0 4px 14px rgba(37,99,235,0.3)' }}
              >
                {saving
                  ? <Loader2 size={15} className="animate-spin" />
                  : <Save size={15} />
                }
                {saving ? 'Saving…' : 'Save Changes'}
              </button>
            </div>
          </div>
        </SectionCard>

        {/* ── Change password ── */}
        <SectionCard
          title="Change Password"
          description="Use a strong, unique password"
          icon={Lock}
          iconColor="text-purple-600"
          iconBg="bg-purple-50"
        >
          <div className="space-y-4">
            <Field
              label="Current Password"
              icon={Lock}
              type="password"
              value={currentPwd}
              onChange={e => setCurrentPwd(e.target.value)}
              placeholder="Your current password"
            />

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <Field
                  label="New Password"
                  icon={Lock}
                  type="password"
                  value={newPwd}
                  onChange={e => { setNewPwd(e.target.value); checkStrength(e.target.value); }}
                  placeholder="Min. 8 characters"
                />
                {/* Strength bar */}
                {newPwd && (
                  <div className="mt-2">
                    <div className="flex gap-1">
                      {[1,2,3,4].map(i => (
                        <div key={i} className={`h-1 flex-1 rounded-full transition-all duration-300 ${i <= pwdStrength ? strengthColor[pwdStrength] : 'bg-gray-200'}`} />
                      ))}
                    </div>
                    <p className={`text-[10px] font-semibold mt-1 font-inter ${strengthText[pwdStrength]}`}>
                      {strengthLabel[pwdStrength]}
                    </p>
                  </div>
                )}
              </div>

              <Field
                label="Confirm New Password"
                icon={Lock}
                type="password"
                value={confirmPwd}
                onChange={e => setConfirmPwd(e.target.value)}
                placeholder="Repeat new password"
              />
            </div>

            {/* Mismatch warning */}
            {confirmPwd && newPwd !== confirmPwd && (
              <div className="flex items-center gap-2 text-red-500 text-xs font-inter">
                <AlertTriangle size={13} />
                <span>Passwords do not match</span>
              </div>
            )}

            {/* Password rules */}
            <div className="bg-gray-50 border border-gray-100 rounded-xl p-3 grid grid-cols-2 gap-x-4 gap-y-1">
              {[
                { rule: 'At least 8 characters', pass: newPwd.length >= 8 },
                { rule: 'One uppercase letter',  pass: /[A-Z]/.test(newPwd) },
                { rule: 'One number',            pass: /[0-9]/.test(newPwd) },
                { rule: 'One special character', pass: /[^A-Za-z0-9]/.test(newPwd) },
              ].map(({ rule, pass }) => (
                <div key={rule} className={`flex items-center gap-1.5 text-[11px] font-inter ${pass ? 'text-green-600' : 'text-gray-400'}`}>
                  <div className={`w-1.5 h-1.5 rounded-full flex-shrink-0 ${pass ? 'bg-green-500' : 'bg-gray-300'}`} />
                  {rule}
                </div>
              ))}
            </div>

            <div className="flex justify-end pt-1">
              <button
                onClick={handleChangePassword}
                disabled={pwdSaving || !currentPwd || !newPwd || newPwd !== confirmPwd}
                className="flex items-center gap-2 px-5 py-2.5 rounded-xl text-sm font-bold font-inter text-white transition-all active:scale-95 disabled:opacity-40 disabled:cursor-not-allowed"
                style={{ background: 'linear-gradient(135deg,#7C3AED,#4F46E5)', boxShadow: '0 4px 14px rgba(124,58,237,0.25)' }}
              >
                {pwdSaving ? <Loader2 size={15} className="animate-spin" /> : <Shield size={15} />}
                {pwdSaving ? 'Updating…' : 'Update Password'}
              </button>
            </div>
          </div>
        </SectionCard>

        {/* ── Security info ── */}
        <SectionCard
          title="Security"
          description="Your account security overview"
          icon={Shield}
          iconColor="text-green-600"
          iconBg="bg-green-50"
        >
          <div className="space-y-1">
            {[
              {
                icon: Clock,
                label: 'Last sign-in',
                value: user?.metadata?.lastSignInTime
                  ? new Date(user.metadata.lastSignInTime).toLocaleString('en-US', { dateStyle: 'medium', timeStyle: 'short' })
                  : '—',
                bg: 'bg-blue-50', color: 'text-blue-500',
              },
              {
                icon: Globe,
                label: 'Authentication provider',
                value: user?.providerData?.[0]?.providerId === 'password' ? 'Email & Password' : 'Google SSO',
                bg: 'bg-gray-100', color: 'text-gray-500',
              },
              {
                icon: Activity,
                label: 'Account status',
                value: user?.emailVerified ? 'Email verified' : 'Email not verified',
                valueColor: user?.emailVerified ? 'text-green-600' : 'text-amber-500',
                bg: 'bg-green-50', color: 'text-green-600',
              },
              {
                icon: Smartphone,
                label: 'Two-factor authentication',
                value: '2FA not enabled',
                valueColor: 'text-amber-500',
                bg: 'bg-amber-50', color: 'text-amber-500',
              },
            ].map(({ icon: Icon, label, value, bg, color, valueColor }) => (
              <div key={label} className="flex items-center gap-3 py-3 border-b border-gray-100 last:border-0">
                <div className={`w-8 h-8 ${bg} rounded-lg flex items-center justify-center flex-shrink-0`}>
                  <Icon size={14} className={color} />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-xs text-gray-400 font-inter">{label}</p>
                  <p className={`text-sm font-semibold font-poppins truncate ${valueColor || 'text-gray-800'}`}>{value}</p>
                </div>
                <ChevronRight size={14} className="text-gray-200 flex-shrink-0" />
              </div>
            ))}
          </div>
        </SectionCard>

        {/* ── Danger zone ── */}
        <div className="bg-red-50 border border-red-200 rounded-2xl px-6 py-5">
          <p className="text-sm font-bold text-red-700 font-poppins mb-1 flex items-center gap-2">
            <AlertTriangle size={15} />
            Danger Zone
          </p>
          <p className="text-xs text-red-500 font-inter mb-4">
            These actions are irreversible. Proceed with caution.
          </p>
          <div className="flex flex-wrap gap-3">
            <button className="flex items-center gap-2 px-4 py-2 rounded-xl border border-red-300 text-red-600 text-xs font-bold font-inter hover:bg-red-100 transition-all">
              <LogOut size={13} />
              Sign out all devices
            </button>
            <button className="flex items-center gap-2 px-4 py-2 rounded-xl border border-red-300 text-red-600 text-xs font-bold font-inter hover:bg-red-100 transition-all">
              <X size={13} />
              Delete account
            </button>
          </div>
        </div>

      </div>
    </div>
  );
}