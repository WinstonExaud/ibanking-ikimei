import { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { Eye, EyeOff, ArrowRight, Shield, Zap, Globe, ChevronLeft, ChevronRight } from 'lucide-react';
import { loginUser, getUserDoc, logoutUser } from '../services/bankingService';
import { useToast } from '../context/ToastContext';
import { playSound } from '../utils/sounds';
import logo from '../assets/ikm-icon512.png';

// ─── Slide data ───────────────────────────────────────────────────────────────
// Slide 1 = default animated brand panel (no image needed)
// Add your images from /public/assets/ below
const SLIDES = [
  { type: 'brand' },
  { type: 'image', src: '/assets/slide1.jpg',  caption: 'Secure. Fast. Reliable.'                   },
  { type: 'image', src: '/assets/slide2.jpg',  caption: 'Banking built for modern businesses.'      },
  // { type: 'image', src: '/assets/slide3.jpg', caption: 'Your caption here.' },
];

const SLIDE_DURATION = 5000;

// ─── Abstract blobs ───────────────────────────────────────────────────────────
function Blobs() {
  return (
    <svg className="absolute inset-0 w-full h-full pointer-events-none" viewBox="0 0 600 800"
      preserveAspectRatio="xMidYMid slice" fill="none">
      <ellipse cx="520" cy="100"  rx="280" ry="230" fill="white"   fillOpacity="0.05" transform="rotate(-20 520 100)"  />
      <ellipse cx="480" cy="380"  rx="190" ry="150" fill="#38BDF8" fillOpacity="0.10" transform="rotate(30 480 380)"   />
      <ellipse cx="60"  cy="640"  rx="230" ry="190" fill="white"   fillOpacity="0.05" transform="rotate(-10 60 640)"   />
      <rect    x="160"  y="220"   width="400" height="16" rx="8"   fill="white"   fillOpacity="0.07" transform="rotate(-38 160 220)" />
      <rect    x="200"  y="260"   width="280" height="9"  rx="4"   fill="#60A5FA" fillOpacity="0.16" transform="rotate(-38 200 260)" />
      <circle cx="80"   cy="160"  r="40"  fill="white"   fillOpacity="0.06" />
      <circle cx="510"  cy="600"  r="66"  fill="#1D4ED8" fillOpacity="0.22" />
      <circle cx="300"  cy="700"  r="26"  fill="#3B82F6" fillOpacity="0.18" />
      <circle cx="555"  cy="220"  r="16"  fill="white"   fillOpacity="0.14" />
    </svg>
  );
}

// ─── Brand slide ──────────────────────────────────────────────────────────────
function BrandSlide() {
  return (
    <div className="relative z-10 flex flex-col justify-between h-full p-10 xl:p-14">
      <div className="flex items-center gap-3">
  
  {/* FULL LOGO */}
  <img 
    src={logo}
    alt="iKIMEI Logo"
    className="h-12 w-auto object-contain"
  />

  {/* TEXT (optional) */}
  <div>
    <p className="text-white font-bold text-lg font-poppins leading-none">
      iKIMEI Banking
    </p>
    <p className="text-blue-200 text-xs font-inter mt-0.5">
      Secure Internal Platform
    </p>
  </div>

</div>

      <div>
        <p className="text-blue-200 text-xs font-inter font-semibold mb-4 tracking-[0.2em] uppercase">Welcome back</p>
        <h1 className="text-4xl xl:text-5xl font-black text-white font-poppins leading-[1.1] mb-5">
          Manage your<br />
          <span className="text-transparent" style={{ WebkitTextStroke: '2px rgba(255,255,255,0.45)' }}>
            finances
          </span><br />
          with confidence.
        </h1>
        <p className="text-blue-100/75 font-inter text-sm leading-relaxed max-w-xs">
          Real-time balances, instant transfers, and complete transaction history — all in one place.
        </p>
        <div className="mt-8 flex flex-col gap-3">
          {[
            { icon: Shield, label: 'Bank-grade Security' },
            { icon: Zap,    label: 'Instant Transfers'   },
            { icon: Globe,  label: 'Real-time Updates'   },
          ].map(({ icon: Icon, label }) => (
            <div key={label} className="flex items-center gap-3">
              <div className="w-8 h-8 rounded-xl bg-white/10 border border-white/10 flex items-center justify-center">
                <Icon size={14} className="text-white" />
              </div>
              <span className="text-white/80 font-inter text-sm">{label}</span>
            </div>
          ))}
        </div>
      </div>

      <div className="grid grid-cols-2 gap-3">
        {[
          { label: 'Total Transactions', value: '24,580+' },
          { label: 'Active Accounts',    value: '120+'    },
        ].map(item => (
          <div key={item.label} className="bg-white/10 backdrop-blur border border-white/10 rounded-2xl p-4">
            <p className="text-white font-bold text-xl font-poppins">{item.value}</p>
            <p className="text-blue-200 text-xs font-inter mt-1">{item.label}</p>
          </div>
        ))}
      </div>
    </div>
  );
}

// ─── Image slide ──────────────────────────────────────────────────────────────
function ImageSlide({ src, caption }) {
  return (
    <div className="relative h-full w-full">
      
      {/* TOP BRAND */}
      <div className="absolute top-10 left-10 xl:top-14 xl:left-14 flex items-center gap-3 z-20">
        
        <img
          src={logo}
          alt="iKIMEI Logo"
          className="h-10 w-auto object-contain drop-shadow-lg"
        />

        <p className="text-white font-bold text-lg font-poppins drop-shadow">
          iKIMEI Banking
        </p>

      </div>

      {/* IMAGE */}
      <img
        src={src}
        alt={caption}
        className="absolute inset-0 w-full h-full object-cover"
        onError={e => {
          e.currentTarget.style.display = 'none';
        }}
      />

      {/* OVERLAY */}
      <div className="absolute inset-0 bg-gradient-to-t from-[#0F2A7F]/95 via-[#1D4ED8]/30 to-transparent" />

      {/* CAPTION */}
      <div className="absolute bottom-16 left-10 xl:left-14 right-10 z-20">
        <p className="text-white font-black text-2xl font-poppins leading-snug drop-shadow-xl">
          {caption}
        </p>
      </div>

    </div>
  );
}

// ─── Main ─────────────────────────────────────────────────────────────────────
export default function LoginPage() {
  const [email,    setEmail]    = useState('');
  const [password, setPassword] = useState('');
  const [showPass, setShowPass] = useState(false);
  const [loading,  setLoading]  = useState(false);
  const [slide,    setSlide]    = useState(0);
  const [fading,   setFading]   = useState(false);
  const timerRef = useRef(null);
  const navigate = useNavigate();
  const { addToast } = useToast();

  const goTo = (idx) => {
    setFading(true);
    setTimeout(() => { setSlide(idx); setFading(false); }, 380);
  };

  const startTimer = () => {
    clearInterval(timerRef.current);
    timerRef.current = setInterval(() => {
      setSlide(prev => {
        const next = (prev + 1) % SLIDES.length;
        goTo(next);
        return prev;
      });
    }, SLIDE_DURATION);
  };

  useEffect(() => { startTimer(); return () => clearInterval(timerRef.current); }, []);

  const handleNav = (dir) => {
    const next = (slide + dir + SLIDES.length) % SLIDES.length;
    goTo(next);
    startTimer();
  };

  const handleLogin = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      const cred    = await loginUser(email, password);
      const userDoc = await getUserDoc(cred.user.uid);
      if (!userDoc) {
        addToast({ type: 'error', title: 'Account not configured', message: 'No user profile found. Ask your banker to set up your account in Firestore.' });
        await logoutUser();
        setLoading(false);
        return;
      }
      playSound('login');
      addToast({ type: 'success', title: 'Welcome back!', message: `Logged in as ${userDoc.name || email}` });
      navigate(userDoc.role === 'banker' ? '/banker' : '/account');
    } catch (err) {
      addToast({ type: 'error', title: 'Login failed', message: err.code === 'auth/invalid-credential' ? 'Invalid email or password' : err.message });
    } finally {
      setLoading(false);
    }
  };

  const current = SLIDES[slide];

  return (
    <div className="min-h-screen flex bg-[#EEF2FF]">

      {/* ══ LEFT — Login Form ══════════════════════════════════ */}
      <div className="w-full lg:w-1/2 flex items-center justify-center p-6 sm:p-10">
        <div className="w-full max-w-md">

          {/* Mobile logo */}
          <div className="flex items-center gap-3 mb-8 lg:hidden">
              {/* FULL LOGO */}
  <img 
    src={logo}
    alt="iKIMEI Logo"
    className="h-12 w-auto object-contain"
  />

  {/* TEXT (optional) */}
  <div>
    <p className="text-white font-bold text-lg font-poppins leading-none">
      iKIMEI Banking
    </p>
    <p className="text-blue-200 text-xs font-inter mt-0.5">
      Secure Internal Platform
    </p>
  </div>
            <span className="text-gray-800 font-bold text-xl font-poppins">iKIMEI Banking</span>
          </div>

          {/* Desktop logo above card */}
          <div className="hidden lg:flex items-center gap-3 mb-7">
            <div className="hidden lg:flex items-center mb-7">
  <img 
    src={logo}
    alt="iKIMEI Logo"
    className="h-12 w-auto object-contain"
  />
</div>
            <div>
              <p className="text-gray-900 font-bold text-base font-poppins leading-none">iKIMEI Banking</p>
              <p className="text-gray-400 text-xs font-inter">Secure Internal Platform</p>
            </div>
          </div>

          {/* Card */}
          <div className="bg-white rounded-3xl p-8 sm:p-10"
            style={{ boxShadow: '0 8px 48px rgba(37,99,235,0.10), 0 2px 12px rgba(0,0,0,0.05)' }}>

            <div className="mb-7">
              <h2 className="text-2xl font-black text-gray-900 font-poppins leading-tight">
                Welcome back 👋
              </h2>
              <p className="text-gray-400 font-inter text-sm mt-1.5">
                Sign in to your account to continue
              </p>
            </div>

            <form onSubmit={handleLogin} className="space-y-5">
              <div>
                <label className="block text-[11px] font-bold text-gray-400 font-inter mb-1.5 tracking-widest uppercase">
                  Email address
                </label>
                <input
                  type="email"
                  value={email}
                  onChange={e => setEmail(e.target.value)}
                  className="w-full px-4 py-3 rounded-xl border-2 border-gray-100 bg-gray-50 text-gray-900 text-sm font-inter placeholder-gray-300 outline-none transition-all focus:border-blue-500 focus:bg-white"
                  placeholder="you@ikimei.com"
                  required
                  autoComplete="email"
                />
              </div>

              <div>
                <label className="block text-[11px] font-bold text-gray-400 font-inter mb-1.5 tracking-widest uppercase">
                  Password
                </label>
                <div className="relative">
                  <input
                    type={showPass ? 'text' : 'password'}
                    value={password}
                    onChange={e => setPassword(e.target.value)}
                    className="w-full px-4 py-3 pr-12 rounded-xl border-2 border-gray-100 bg-gray-50 text-gray-900 text-sm font-inter placeholder-gray-300 outline-none transition-all focus:border-blue-500 focus:bg-white"
                    placeholder="••••••••"
                    required
                    autoComplete="current-password"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPass(!showPass)}
                    className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-300 hover:text-gray-500 transition-colors"
                  >
                    {showPass ? <EyeOff size={17} /> : <Eye size={17} />}
                  </button>
                </div>
              </div>

              <button
                type="submit"
                disabled={loading}
                className="w-full flex items-center justify-center gap-2.5 py-3.5 rounded-xl font-bold text-sm font-inter text-white transition-all active:scale-[0.98] disabled:opacity-70 mt-2"
                style={{ background: 'linear-gradient(135deg,#1D4ED8 0%,#3B82F6 100%)', boxShadow: '0 4px 20px rgba(37,99,235,0.32)' }}
              >
                {loading
                  ? <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                  : <><span>Sign In</span><ArrowRight size={17} /></>
                }
              </button>
            </form>

            <div className="flex items-center gap-3 mt-6 mb-5">
              <div className="flex-1 h-px bg-gray-100" />
              <span className="text-[10px] text-gray-300 font-inter tracking-wide">SECURED BY iKIMEI v2.0</span>
              <div className="flex-1 h-px bg-gray-100" />
            </div>

            <div className="grid grid-cols-3 gap-2">
              {[
                { icon: Shield, label: 'Banker',  sub: 'Full access', color: '#1D4ED8', bg: '#EFF6FF' },
                { icon: Zap,    label: 'Account', sub: 'Business',    color: '#0891B2', bg: '#ECFEFF' },
                { icon: Globe,  label: 'Client',  sub: 'View only',   color: '#059669', bg: '#ECFDF5' },
              ].map(({ icon: Icon, label, sub, color, bg }) => (
                <div key={label} className="rounded-xl p-3 text-center border border-gray-100 bg-gray-50">
                  <div className="w-7 h-7 rounded-lg flex items-center justify-center mx-auto mb-1.5"
                    style={{ background: bg }}>
                    <Icon size={13} style={{ color }} />
                  </div>
                  <p className="text-[11px] font-bold text-gray-700 font-poppins">{label}</p>
                  <p className="text-[9px] text-gray-400 font-inter mt-0.5">{sub}</p>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* ══ RIGHT — Sliding Panel ══════════════════════════════ */}
      <div
        className="hidden lg:flex lg:w-1/2 relative overflow-hidden rounded-l-[40px]"
        style={{ background: 'linear-gradient(145deg,#0F2A7F 0%,#1D4ED8 45%,#2563EB 70%,#3B82F6 100%)' }}
      >
        <Blobs />

        {/* Slide content with fade */}
        <div
          className="absolute inset-0 transition-opacity duration-[380ms]"
          style={{ opacity: fading ? 0 : 1 }}
        >
          {current.type === 'brand'
            ? <BrandSlide />
            : <ImageSlide src={current.src} caption={current.caption} />
          }
        </div>

        {/* Dot indicators */}
        <div className="absolute bottom-8 left-1/2 -translate-x-1/2 flex items-center gap-2 z-30">
          {SLIDES.map((_, i) => (
            <button
              key={i}
              onClick={() => { goTo(i); startTimer(); }}
              className="rounded-full transition-all duration-300"
              style={{
                width:      i === slide ? 24 : 10,
                height:     10,
                background: i === slide ? 'white' : 'rgba(255,255,255,0.35)',
              }}
            />
          ))}
        </div>

        {/* Arrow nav */}
        {SLIDES.length > 1 && (
          <>
            <button onClick={() => handleNav(-1)}
              className="absolute left-4 top-1/2 -translate-y-1/2 z-30 w-9 h-9 rounded-full bg-white/10 hover:bg-white/25 border border-white/20 flex items-center justify-center text-white transition-all">
              <ChevronLeft size={18} />
            </button>
            <button onClick={() => handleNav(1)}
              className="absolute right-4 top-1/2 -translate-y-1/2 z-30 w-9 h-9 rounded-full bg-white/10 hover:bg-white/25 border border-white/20 flex items-center justify-center text-white transition-all">
              <ChevronRight size={18} />
            </button>
          </>
        )}
      </div>

    </div>
  );
}