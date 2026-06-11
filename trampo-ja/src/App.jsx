import { useState, useEffect, useRef, useCallback } from "react";

// ─── DATA ───────────────────────────────────────────
const CATEGORIES = [
  { id: "all", label: "Todos", icon: "🔍" },
  { id: "jardinagem", label: "Jardinagem", icon: "🌿" },
  { id: "pedreiro", label: "Pedreiro", icon: "🧱" },
  { id: "encanador", label: "Encanador", icon: "🔧" },
  { id: "eletricista", label: "Eletricista", icon: "⚡" },
  { id: "montador", label: "Montador", icon: "🪑" },
  { id: "pintor", label: "Pintor", icon: "🎨" },
  { id: "faxina", label: "Faxina", icon: "🧹" },
  { id: "estofados", label: "Estofados", icon: "🛋️" },
  { id: "passeador", label: "Passeador", icon: "🐕" },
  { id: "petsitter", label: "Pet Sitter", icon: "🐾" },
  { id: "banhotosa", label: "Banho e Tosa", icon: "✂️" },
  { id: "churrasqueiro", label: "Churrasqueiro", icon: "🔥" },
  { id: "garcom", label: "Garçom", icon: "🍽️" },
  { id: "animador", label: "Animador", icon: "🎈" },
  { id: "manicure", label: "Manicure", icon: "💅" },
  { id: "cabelereiro", label: "Cabelereiro", icon: "💇" },
  { id: "carreto", label: "Carreto", icon: "🚚" },
];

const ARAXA_LOCATIONS = [
  { name: "Centro", lat: -19.5932, lng: -46.9406 },
  { name: "Bauxita", lat: -19.6020, lng: -46.9510 },
  { name: "São Geraldo", lat: -19.5850, lng: -46.9300 },
  { name: "Boa Vista", lat: -19.5790, lng: -46.9440 },
  { name: "Santa Rita", lat: -19.6010, lng: -46.9340 },
  { name: "Jd. Natália", lat: -19.5960, lng: -46.9230 },
  { name: "Vila Silvéria", lat: -19.5880, lng: -46.9530 },
  { name: "Alvorada", lat: -19.5770, lng: -46.9270 },
  { name: "São Domingos", lat: -19.5980, lng: -46.9570 },
  { name: "Urciano Lemos", lat: -19.5740, lng: -46.9390 },
  { name: "Ana Pinto", lat: -19.6100, lng: -46.9360 },
  { name: "Novo São Geraldo", lat: -19.5810, lng: -46.9190 },
];

const MOCK_SERVICES = [
  { id: 1, category: "jardinagem", title: "Poda de árvores e limpeza de jardim",
    description: "Preciso de alguém para podar 3 árvores de médio porte e fazer limpeza geral do jardim. Tenho ferramentas básicas mas precisa trazer motosserra pequena.",
    budget: 250, duration: "4 horas", location: "Centro, Araxá", locIdx: 0,
    postedBy: { name: "Ana Carolina", avatar: "AC", rating: 4.8, since: "2024" },
    postedAt: "2h atrás", applicants: 3, urgent: false, status: "open" },
  { id: 2, category: "encanador", title: "Vazamento na cozinha urgente",
    description: "Torneira da cozinha está vazando bastante, precisa de conserto urgente. Aparentemente o registro está com problema também.",
    budget: 180, duration: "2 horas", location: "Bauxita, Araxá", locIdx: 1,
    postedBy: { name: "Roberto Lima", avatar: "RL", rating: 4.5, since: "2023" },
    postedAt: "45min", applicants: 7, urgent: true, status: "open" },
  { id: 3, category: "montador", title: "Montagem de guarda-roupa e cômoda",
    description: "Comprei um guarda-roupa de 6 portas e cômoda de 5 gavetas, ambos da Madesa. Casa térrea, fácil acesso.",
    budget: 300, duration: "5 horas", location: "São Geraldo, Araxá", locIdx: 2,
    postedBy: { name: "Fernanda Souza", avatar: "FS", rating: 4.9, since: "2022" },
    postedAt: "1h atrás", applicants: 5, urgent: false, status: "open" },
  { id: 4, category: "faxina", title: "Limpeza pós-obra apartamento 70m²",
    description: "Apartamento recém reformado precisa de limpeza pesada pós-obra. Todos os materiais de limpeza serão fornecidos.",
    budget: 350, duration: "6 horas", location: "Boa Vista, Araxá", locIdx: 3,
    postedBy: { name: "Marcos Oliveira", avatar: "MO", rating: 4.7, since: "2023" },
    postedAt: "3h atrás", applicants: 4, urgent: false, status: "open" },
  { id: 5, category: "eletricista", title: "Instalação de 4 luminárias + 2 ventiladores",
    description: "Fiação já está pronta, só precisa fazer as conexões e fixação. Tenho escada.",
    budget: 280, duration: "3 horas", location: "Santa Rita, Araxá", locIdx: 4,
    postedBy: { name: "Juliana Matos", avatar: "JM", rating: 5.0, since: "2024" },
    postedAt: "30min", applicants: 2, urgent: false, status: "open" },
  { id: 6, category: "churrasqueiro", title: "Churrasqueiro para festa de 30 pessoas",
    description: "Aniversário no sábado. Toda a carne e material já comprados. Churrasqueira a carvão no local.",
    budget: 400, duration: "5 horas", location: "Jd. Natália, Araxá", locIdx: 5,
    postedBy: { name: "Diego Santos", avatar: "DS", rating: 4.6, since: "2023" },
    postedAt: "5h atrás", applicants: 8, urgent: false, status: "open" },
  { id: 7, category: "carreto", title: "Mudança pequena - sofá + geladeira + caixas",
    description: "Sofá de 3 lugares, geladeira e ~15 caixas. Distância curta dentro de Araxá. Ambos são térreo.",
    budget: 350, duration: "3 horas", location: "Vila Silvéria, Araxá", locIdx: 6,
    postedBy: { name: "Patrícia Nunes", avatar: "PN", rating: 4.3, since: "2024" },
    postedAt: "1h atrás", applicants: 6, urgent: true, status: "open" },
  { id: 8, category: "pintor", title: "Pintura de 2 quartos + corredor",
    description: "Dois quartos ~12m² cada e corredor ~8m². Paredes lixadas. Tinta já comprada. Precisa trazer rolos e lonas.",
    budget: 500, duration: "2 dias", location: "Alvorada, Araxá", locIdx: 7,
    postedBy: { name: "Carlos Eduardo", avatar: "CE", rating: 4.8, since: "2022" },
    postedAt: "4h atrás", applicants: 3, urgent: false, status: "open" },
];

const MOCK_REVIEWS = [
  { id: 1, from: "Ana Carolina", avatar: "AC", rating: 5, text: "Excelente profissional! Pontual, trabalho impecável. Super recomendo.", date: "12/03/2026", service: "Jardinagem" },
  { id: 2, from: "Marcos Oliveira", avatar: "MO", rating: 5, text: "Fez além do combinado. Muito caprichoso e educado.", date: "08/03/2026", service: "Limpeza" },
  { id: 3, from: "Fernanda Souza", avatar: "FS", rating: 4, text: "Bom trabalho, mas demorou um pouco mais que o previsto.", date: "01/03/2026", service: "Montagem" },
  { id: 4, from: "Juliana Matos", avatar: "JM", rating: 5, text: "Perfeito! Instalou tudo rapidinho e ainda deu dicas de segurança.", date: "25/02/2026", service: "Elétrica" },
];

const MOCK_NOTIFICATIONS = [
  { id: 1, type: "applicant", title: "Novo candidato!", body: "José Pereira se candidatou para 'Poda de árvores'", time: "5min", read: false, icon: "👤" },
  { id: 2, type: "message", title: "Nova mensagem", body: "Antônio Silva: 'Posso ir amanhã cedo...'", time: "12min", read: false, icon: "💬" },
  { id: 3, type: "rating", title: "Nova avaliação ⭐", body: "Ana Carolina te avaliou com 5 estrelas!", time: "1h", read: false, icon: "⭐" },
  { id: 4, type: "accepted", title: "Proposta aceita!", body: "Seu serviço 'Montagem de móveis' foi aceito", time: "2h", read: true, icon: "✅" },
  { id: 5, type: "applicant", title: "Novo candidato!", body: "Wagner Costa se candidatou para 'Encanamento'", time: "3h", read: true, icon: "👤" },
  { id: 6, type: "reminder", title: "Lembrete", body: "Serviço 'Pintura de quartos' é amanhã às 8h", time: "5h", read: true, icon: "🔔" },
  { id: 7, type: "message", title: "Nova mensagem", body: "Fernanda: 'Pode ser no sábado?'", time: "6h", read: true, icon: "💬" },
  { id: 8, type: "completed", title: "Serviço concluído", body: "'Limpeza pós-obra' marcado como concluído. Avalie!", time: "1d", read: true, icon: "🎉" },
];

const MOCK_APPLICANTS = [
  { id: 1, name: "José Pereira", avatar: "JP", rating: 4.9, jobs: 127, specialty: "Jardinagem e paisagismo", price: "R$ 230", message: "Tenho 8 anos de experiência e trago todas as ferramentas.", reviews: MOCK_REVIEWS },
  { id: 2, name: "Antônio Silva", avatar: "AS", rating: 4.6, jobs: 84, specialty: "Jardinagem geral", price: "R$ 250", message: "Posso fazer amanhã cedo. Trabalho rápido e limpo.", reviews: MOCK_REVIEWS.slice(0, 2) },
  { id: 3, name: "Wagner Costa", avatar: "WC", rating: 4.7, jobs: 56, specialty: "Poda e limpeza", price: "R$ 270", message: "Especialista em poda. Tenho certificação de arborista.", reviews: MOCK_REVIEWS.slice(1, 3) },
];

const MOCK_MESSAGES = [
  { id: 1, from: "worker", text: "Oi! Vi seu serviço e tenho interesse. Trabalho com jardinagem há 8 anos.", time: "14:02" },
  { id: 2, from: "client", text: "Ótimo! Você tem motosserra? As árvores são de porte médio.", time: "14:05" },
  { id: 3, from: "worker", text: "Tenho sim! Motosserra Stihl. Posso ir amanhã de manhã, às 8h. Serve?", time: "14:06" },
  { id: 4, from: "client", text: "Perfeito! Vou te mandar o endereço por aqui mesmo.", time: "14:08" },
];

const fmt = v => `R$ ${v.toLocaleString("pt-BR")}`;

// ─── SHARED COMPONENTS ──────────────────────────────
function FadeIn({ children, delay = 0 }) {
  const [v, setV] = useState(false);
  useEffect(() => { const t = setTimeout(() => setV(true), delay); return () => clearTimeout(t); }, [delay]);
  return <div style={{ opacity: v ? 1 : 0, transform: v ? "translateY(0)" : "translateY(14px)", transition: "all 0.45s cubic-bezier(0.22,1,0.36,1)" }}>{children}</div>;
}

function Stars({ rating, size = 16, interactive = false, onChange }) {
  const [hover, setHover] = useState(0);
  return (
    <div style={{ display: "flex", gap: 2 }}>
      {[1, 2, 3, 4, 5].map(i => (
        <span key={i} onClick={() => interactive && onChange?.(i)}
          onMouseEnter={() => interactive && setHover(i)} onMouseLeave={() => interactive && setHover(0)}
          style={{ fontSize: size, cursor: interactive ? "pointer" : "default", filter: (hover || rating) >= i ? "none" : "grayscale(1) opacity(0.3)", transition: "all 0.15s", transform: interactive && hover === i ? "scale(1.3)" : "scale(1)" }}>⭐</span>
      ))}
    </div>
  );
}

function BackBtn({ onClick, label = "Voltar" }) {
  return <button onClick={onClick} style={{ background: "rgba(255,255,255,0.1)", border: "none", color: "#fff", borderRadius: 10, padding: "8px 14px", cursor: "pointer", fontSize: 13, fontFamily: "'DM Sans',sans-serif", marginBottom: 12, display: "flex", alignItems: "center", gap: 6 }}>← {label}</button>;
}

function Header({ children, subtitle }) {
  return (
    <div style={{ background: "linear-gradient(135deg,#1a1a2e 0%,#16213e 50%,#0f3460 100%)", padding: "16px 20px 24px" }}>
      {children}
      {subtitle && <p style={{ fontSize: 13, color: "rgba(255,255,255,0.5)", fontFamily: "'DM Sans',sans-serif", margin: "6px 0 0" }}>{subtitle}</p>}
    </div>
  );
}

function Badge({ count, top = -5, right = -5 }) {
  if (!count) return null;
  return <span style={{ position: "absolute", top, right, minWidth: 18, height: 18, borderRadius: 9, background: "#e53e3e", color: "#fff", fontSize: 10, fontWeight: 700, display: "flex", alignItems: "center", justifyContent: "center", padding: "0 4px", zIndex: 2 }}>{count}</span>;
}

function IconBtn({ onClick, children, badge }) {
  return (
    <button onClick={onClick} style={{ width: 40, height: 40, borderRadius: 12, border: "1px solid rgba(255,255,255,0.15)", background: "rgba(255,255,255,0.08)", color: "#fff", fontSize: 18, cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center", position: "relative" }}>
      {children}<Badge count={badge} />
    </button>
  );
}

function Card({ children, style: s, onClick, hoverable = true }) {
  return (
    <div onClick={onClick} style={{ background: "var(--card-bg,#fff)", borderRadius: 16, padding: 18, border: "1px solid var(--border,#e8e8e8)", cursor: onClick ? "pointer" : "default", transition: "transform 0.15s ease, box-shadow 0.15s ease", boxShadow: "0 2px 8px rgba(0,0,0,0.04)", ...s }}
      onMouseEnter={e => { if (hoverable && onClick) { e.currentTarget.style.transform = "translateY(-2px)"; e.currentTarget.style.boxShadow = "0 8px 24px rgba(0,0,0,0.08)"; } }}
      onMouseLeave={e => { if (hoverable && onClick) { e.currentTarget.style.transform = ""; e.currentTarget.style.boxShadow = ""; } }}
    >{children}</div>
  );
}

function Avatar({ initials, size = 40, gradient = "linear-gradient(135deg,#1a1a2e,#0f3460)", color = "#f7c948" }) {
  return <div style={{ width: size, height: size, borderRadius: size * 0.3, background: gradient, display: "flex", alignItems: "center", justifyContent: "center", color, fontSize: size * 0.3, fontWeight: 800, fontFamily: "'DM Sans',sans-serif", flexShrink: 0 }}>{initials}</div>;
}

function InputField({ label, required, ...props }) {
  return (
    <div>
      <label style={{ fontSize: 13, fontWeight: 700, color: "var(--text,#1a1a2e)", fontFamily: "'DM Sans',sans-serif", marginBottom: 8, display: "block" }}>{label}{required && " *"}</label>
      <input {...props} style={{ width: "100%", padding: "14px 16px", borderRadius: 12, fontSize: 14, border: "1px solid var(--border,#e2e8f0)", fontFamily: "'DM Sans',sans-serif", outline: "none", boxSizing: "border-box", background: "var(--card-bg,#fff)", color: "var(--text,#1a1a2e)", ...props.style }} />
    </div>
  );
}

const catColor = cat => ({ jardinagem: "#48bb78", encanador: "#4299e1", eletricista: "#f6ad55", montador: "#9f7aea", pintor: "#fc8181", faxina: "#68d391", churrasqueiro: "#f56565", carreto: "#ed8936" }[cat] || "#f7c948");

// ─── FIREBASE CONFIG ────────────────────────────────
const FIREBASE_CONFIG = {
  apiKey: "AIzaSyDThAKgFahPQPoxDGFYypbd8a9S2fOlwCc",
  authDomain: "bico-ce6ad.firebaseapp.com",
  projectId: "bico-ce6ad",
  storageBucket: "bico-ce6ad.firebasestorage.app",
  messagingSenderId: "296586870145",
  appId: "1:296586870145:web:ad4491fcca8c521d27bc80",
};

const isFirebaseConfigured = () => FIREBASE_CONFIG.apiKey && FIREBASE_CONFIG.apiKey !== "YOUR-KEY-HERE";

// Demo credentials (fallback quando Firebase não está configurado)
const DEMO_USERS = [
  { email: "ana@email.com", password: "123456", name: "Ana Carolina", avatar: "AC" },
  { email: "demo@trampoja.com", password: "demo123", name: "Usuário Demo", avatar: "UD" },
];

// Firebase loader hook
function useFirebase() {
  const [fb, setFb] = useState({ ready: false, auth: null, googleProvider: null, app: null });

  useEffect(() => {
    if (!isFirebaseConfigured()) { setFb({ ready: true, auth: null, googleProvider: null, app: null }); return; }
    // Load Firebase SDK
    const loadScript = (src) => new Promise((res, rej) => {
      if (document.querySelector(`script[src="${src}"]`)) { res(); return; }
      const s = document.createElement("script"); s.src = src; s.onload = res; s.onerror = rej; document.head.appendChild(s);
    });

    Promise.all([
      loadScript("https://www.gstatic.com/firebasejs/10.12.0/firebase-app-compat.js"),
      loadScript("https://www.gstatic.com/firebasejs/10.12.0/firebase-auth-compat.js"),
    ]).then(() => {
      const firebase = window.firebase;
      if (!firebase.apps.length) firebase.initializeApp(FIREBASE_CONFIG);
      const auth = firebase.auth();
      const googleProvider = new firebase.auth.GoogleAuthProvider();
      googleProvider.addScope("profile");
      googleProvider.addScope("email");
      setFb({ ready: true, auth, googleProvider, app: firebase.apps[0] });
    }).catch(err => {
      console.error("Firebase load error:", err);
      setFb({ ready: true, auth: null, googleProvider: null, app: null });
    });
  }, []);

  return fb;
}

// ─── GOOGLE SIGN-IN BUTTON ──────────────────────────
function GoogleButton({ onClick, loading, disabled }) {
  return (
    <button onClick={onClick} disabled={disabled || loading} style={{
      width: "100%", padding: "16px 18px", borderRadius: 14, border: "2px solid rgba(255,255,255,0.12)",
      background: loading ? "rgba(255,255,255,0.04)" : "rgba(255,255,255,0.06)",
      cursor: disabled || loading ? "default" : "pointer", display: "flex", alignItems: "center",
      justifyContent: "center", gap: 12, transition: "all 0.2s", marginBottom: 16,
      opacity: disabled ? 0.4 : 1,
    }}>
      {loading ? (
        <span style={{ animation: "spin 0.8s linear infinite", display: "inline-block", fontSize: 20 }}>⏳</span>
      ) : (
        <svg width="20" height="20" viewBox="0 0 48 48"><path fill="#EA4335" d="M24 9.5c3.54 0 6.71 1.22 9.21 3.6l6.85-6.85C35.9 2.38 30.47 0 24 0 14.62 0 6.51 5.38 2.56 13.22l7.98 6.19C12.43 13.72 17.74 9.5 24 9.5z"/><path fill="#4285F4" d="M46.98 24.55c0-1.57-.15-3.09-.38-4.55H24v9.02h12.94c-.58 2.96-2.26 5.48-4.78 7.18l7.73 6c4.51-4.18 7.09-10.36 7.09-17.65z"/><path fill="#FBBC05" d="M10.53 28.59c-.48-1.45-.76-2.99-.76-4.59s.27-3.14.76-4.59l-7.98-6.19C.92 16.46 0 20.12 0 24c0 3.88.92 7.54 2.56 10.78l7.97-6.19z"/><path fill="#34A853" d="M24 48c6.48 0 11.93-2.13 15.89-5.81l-7.73-6c-2.15 1.45-4.92 2.3-8.16 2.3-6.26 0-11.57-4.22-13.47-9.91l-7.98 6.19C6.51 42.62 14.62 48 24 48z"/></svg>
      )}
      <span style={{ fontFamily: "'DM Sans',sans-serif", fontSize: 15, fontWeight: 700, color: "#fff" }}>
        {loading ? "Conectando..." : "Continuar com Google"}
      </span>
    </button>
  );
}

// ─── LOGIN SCREEN ───────────────────────────────────
function LoginScreen({ onLogin, onGoRegister }) {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [errors, setErrors] = useState({});
  const [loading, setLoading] = useState(false);
  const [googleLoading, setGoogleLoading] = useState(false);
  const [shake, setShake] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const firebase = useFirebase();
  const fbActive = firebase.ready && firebase.auth;

  const validate = () => {
    const e = {};
    if (!email.trim()) e.email = "Informe seu e-mail";
    else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) e.email = "E-mail inválido";
    if (!password) e.password = "Informe sua senha";
    else if (password.length < 6) e.password = "Mínimo 6 caracteres";
    setErrors(e);
    return Object.keys(e).length === 0;
  };

  // Google Sign-In
  const handleGoogleLogin = async () => {
    if (!fbActive) return;
    setGoogleLoading(true);
    setErrors({});
    try {
      const result = await firebase.auth.signInWithPopup(firebase.googleProvider);
      const u = result.user;
      const initials = (u.displayName || "U").split(" ").map(w => w[0]).slice(0, 2).join("").toUpperCase();
      onLogin({
        email: u.email, name: u.displayName || u.email,
        avatar: initials, photoURL: u.photoURL, uid: u.uid, provider: "google",
      });
    } catch (err) {
      console.error("Google sign-in error:", err);
      const msgs = {
        "auth/popup-closed-by-user": "Login cancelado. Tente novamente.",
        "auth/popup-blocked": "Popup bloqueado pelo navegador. Permita popups e tente novamente.",
        "auth/network-request-failed": "Sem conexão com a internet.",
        "auth/unauthorized-domain": "Domínio não autorizado no Firebase. Adicione este domínio nas configurações do projeto.",
      };
      setErrors({ general: msgs[err.code] || `Erro ao entrar com Google: ${err.message}` });
      setShake(true); setTimeout(() => setShake(false), 500);
    }
    setGoogleLoading(false);
  };

  // Email/Password Login
  const handleLogin = async () => {
    if (!validate()) { setShake(true); setTimeout(() => setShake(false), 500); return; }
    setLoading(true);
    setErrors({});

    if (fbActive) {
      // Firebase email/password auth
      try {
        const result = await firebase.auth.signInWithEmailAndPassword(email.trim(), password);
        const u = result.user;
        const initials = (u.displayName || u.email).split(/[\s@]/).map(w => w[0]).slice(0, 2).join("").toUpperCase();
        onLogin({
          email: u.email, name: u.displayName || u.email.split("@")[0],
          avatar: initials, photoURL: u.photoURL, uid: u.uid, provider: "email",
        });
      } catch (err) {
        const msgs = {
          "auth/user-not-found": "Nenhuma conta com este e-mail. Crie uma conta primeiro.",
          "auth/wrong-password": "Senha incorreta. Tente novamente.",
          "auth/invalid-credential": "E-mail ou senha incorretos.",
          "auth/too-many-requests": "Muitas tentativas. Aguarde um momento.",
          "auth/invalid-email": "E-mail inválido.",
          "auth/network-request-failed": "Sem conexão com a internet.",
        };
        setErrors({ general: msgs[err.code] || `Erro: ${err.message}` });
        setShake(true); setTimeout(() => setShake(false), 500);
      }
    } else {
      // Fallback demo login
      await new Promise(r => setTimeout(r, 800));
      const user = DEMO_USERS.find(u => u.email.toLowerCase() === email.toLowerCase().trim() && u.password === password);
      if (user) { onLogin(user); }
      else {
        setErrors({ general: "E-mail ou senha incorretos. Tente: demo@trampoja.com / demo123" });
        setShake(true); setTimeout(() => setShake(false), 500);
      }
    }
    setLoading(false);
  };

  const fieldStyle = (hasError) => ({
    width: "100%", padding: "16px 18px", borderRadius: 14, fontSize: 15,
    border: `2px solid ${hasError ? "#e53e3e" : "rgba(255,255,255,0.12)"}`,
    fontFamily: "'DM Sans',sans-serif", outline: "none", boxSizing: "border-box",
    background: "rgba(255,255,255,0.06)", color: "#fff",
    transition: "border-color 0.2s ease",
  });

  return (
    <div style={{
      minHeight: "100vh", display: "flex", flexDirection: "column",
      background: "linear-gradient(160deg, #1a1a2e 0%, #16213e 40%, #0f3460 100%)",
      padding: "0 24px",
    }}>
      {/* Logo area */}
      <div style={{ flex: 1, display: "flex", flexDirection: "column", justifyContent: "center", alignItems: "center", paddingTop: 60 }}>
        <div style={{
          width: 80, height: 80, borderRadius: 24,
          background: "linear-gradient(135deg, #f7c948, #f6ad55)",
          display: "flex", alignItems: "center", justifyContent: "center",
          fontSize: 36, marginBottom: 20, boxShadow: "0 12px 40px rgba(247,201,72,0.3)",
        }}>🔧</div>
        <div style={{ fontFamily: "'Archivo Black',sans-serif", fontSize: 32, color: "#fff", letterSpacing: -1, marginBottom: 6 }}>
          trampo<span style={{ color: "#f7c948" }}>já</span>
        </div>
        <p style={{ fontSize: 14, color: "rgba(255,255,255,0.45)", fontFamily: "'DM Sans',sans-serif", margin: 0 }}>
          Serviços na palma da mão · Araxá, MG
        </p>
      </div>

      {/* Form */}
      <div style={{ animation: shake ? "shakeX 0.4s ease" : "none", paddingBottom: 40 }}>
        {errors.general && (
          <div style={{
            background: "rgba(229,62,62,0.15)", border: "1px solid rgba(229,62,62,0.3)",
            borderRadius: 12, padding: "12px 16px", marginBottom: 16,
            fontSize: 13, color: "#fc8181", fontFamily: "'DM Sans',sans-serif", lineHeight: 1.5,
          }}>⚠️ {errors.general}</div>
        )}

        {/* Google Sign-In */}
        <GoogleButton onClick={handleGoogleLogin} loading={googleLoading} disabled={!fbActive} />

        {!fbActive && (
          <div style={{ textAlign: "center", marginBottom: 12 }}>
            <span style={{ fontSize: 11, color: "rgba(255,255,255,0.25)", fontFamily: "'DM Sans',sans-serif" }}>
              Google Sign-In requer configuração do Firebase
            </span>
          </div>
        )}

        {/* Divider */}
        <div style={{ display: "flex", alignItems: "center", gap: 14, marginBottom: 20 }}>
          <div style={{ flex: 1, height: 1, background: "rgba(255,255,255,0.1)" }} />
          <span style={{ fontSize: 12, color: "rgba(255,255,255,0.3)", fontFamily: "'DM Sans',sans-serif" }}>ou entre com e-mail</span>
          <div style={{ flex: 1, height: 1, background: "rgba(255,255,255,0.1)" }} />
        </div>

        <div style={{ marginBottom: 16 }}>
          <label style={{ fontSize: 13, fontWeight: 600, color: "rgba(255,255,255,0.6)", fontFamily: "'DM Sans',sans-serif", marginBottom: 8, display: "block" }}>E-mail</label>
          <input
            value={email} onChange={e => { setEmail(e.target.value); setErrors(p => ({ ...p, email: undefined, general: undefined })); }}
            onKeyDown={e => e.key === "Enter" && handleLogin()}
            placeholder="seu@email.com" type="email" autoComplete="email"
            style={fieldStyle(errors.email)}
          />
          {errors.email && <div style={{ fontSize: 12, color: "#fc8181", marginTop: 6, fontFamily: "'DM Sans',sans-serif", paddingLeft: 4 }}>{errors.email}</div>}
        </div>

        <div style={{ marginBottom: 24 }}>
          <label style={{ fontSize: 13, fontWeight: 600, color: "rgba(255,255,255,0.6)", fontFamily: "'DM Sans',sans-serif", marginBottom: 8, display: "block" }}>Senha</label>
          <div style={{ position: "relative" }}>
            <input
              value={password} onChange={e => { setPassword(e.target.value); setErrors(p => ({ ...p, password: undefined, general: undefined })); }}
              onKeyDown={e => e.key === "Enter" && handleLogin()}
              placeholder="Mínimo 6 caracteres" type={showPassword ? "text" : "password"} autoComplete="current-password"
              style={{ ...fieldStyle(errors.password), paddingRight: 50 }}
            />
            <button onClick={() => setShowPassword(!showPassword)} style={{
              position: "absolute", right: 14, top: "50%", transform: "translateY(-50%)",
              background: "none", border: "none", cursor: "pointer", fontSize: 18, padding: 0,
              color: "rgba(255,255,255,0.4)",
            }}>{showPassword ? "🙈" : "👁️"}</button>
          </div>
          {errors.password && <div style={{ fontSize: 12, color: "#fc8181", marginTop: 6, fontFamily: "'DM Sans',sans-serif", paddingLeft: 4 }}>{errors.password}</div>}
        </div>

        <button onClick={handleLogin} disabled={loading} style={{
          width: "100%", padding: "18px 0", borderRadius: 14, border: "none",
          background: loading ? "rgba(247,201,72,0.5)" : "linear-gradient(135deg, #f7c948, #f6ad55)",
          color: "#1a1a2e", fontSize: 17, fontWeight: 800,
          fontFamily: "'Archivo Black',sans-serif", cursor: loading ? "default" : "pointer",
          transition: "all 0.2s", boxShadow: "0 8px 24px rgba(247,201,72,0.3)",
          display: "flex", alignItems: "center", justifyContent: "center", gap: 10,
        }}>
          {loading ? (
            <><span style={{ animation: "spin 0.8s linear infinite", display: "inline-block" }}>⏳</span> Entrando...</>
          ) : "Entrar"}
        </button>

        <div style={{ textAlign: "center", marginTop: 20 }}>
          <span style={{ fontSize: 14, color: "rgba(255,255,255,0.4)", fontFamily: "'DM Sans',sans-serif" }}>Não tem conta? </span>
          <button onClick={onGoRegister} style={{
            background: "none", border: "none", color: "#f7c948", fontSize: 14,
            fontWeight: 700, fontFamily: "'DM Sans',sans-serif", cursor: "pointer",
            textDecoration: "underline", textUnderlineOffset: 3,
          }}>Criar conta</button>
        </div>

        {!fbActive && (
          <div style={{ textAlign: "center", marginTop: 28, padding: "16px 0", borderTop: "1px solid rgba(255,255,255,0.08)" }}>
            <p style={{ fontSize: 12, color: "rgba(255,255,255,0.25)", fontFamily: "'DM Sans',sans-serif", margin: 0 }}>
              Demo: demo@trampoja.com / demo123
            </p>
          </div>
        )}
      </div>

      <style>{`
        @keyframes shakeX { 0%,100% { transform:translateX(0) } 20%,60% { transform:translateX(-8px) } 40%,80% { transform:translateX(8px) } }
        @keyframes spin { to { transform:rotate(360deg) } }
      `}</style>
    </div>
  );
}

// ─── REGISTER SCREEN ────────────────────────────────
function RegisterScreen({ onRegister, onGoLogin }) {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [userType, setUserType] = useState("");
  const [errors, setErrors] = useState({});
  const [loading, setLoading] = useState(false);
  const [googleLoading, setGoogleLoading] = useState(false);
  const [shake, setShake] = useState(false);
  const firebase = useFirebase();
  const fbActive = firebase.ready && firebase.auth;

  const validate = () => {
    const e = {};
    if (!name.trim()) e.name = "Informe seu nome";
    if (!email.trim()) e.email = "Informe seu e-mail";
    else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) e.email = "E-mail inválido";
    if (!password) e.password = "Informe sua senha";
    else if (password.length < 6) e.password = "Mínimo 6 caracteres";
    if (password !== confirmPassword) e.confirmPassword = "Senhas não conferem";
    if (!userType) e.userType = "Selecione seu perfil";
    setErrors(e);
    return Object.keys(e).length === 0;
  };

  const handleGoogleRegister = async () => {
    if (!fbActive || !userType) {
      if (!userType) { setErrors({ userType: "Selecione seu perfil primeiro" }); setShake(true); setTimeout(() => setShake(false), 500); }
      return;
    }
    setGoogleLoading(true); setErrors({});
    try {
      const result = await firebase.auth.signInWithPopup(firebase.googleProvider);
      const u = result.user;
      const initials = (u.displayName || "U").split(" ").map(w => w[0]).slice(0, 2).join("").toUpperCase();
      onRegister({ email: u.email, name: u.displayName || u.email, avatar: initials, photoURL: u.photoURL, uid: u.uid, userType, provider: "google" });
    } catch (err) {
      setErrors({ general: err.code === "auth/popup-closed-by-user" ? "Cadastro cancelado." : `Erro: ${err.message}` });
      setShake(true); setTimeout(() => setShake(false), 500);
    }
    setGoogleLoading(false);
  };

  const handleRegister = async () => {
    if (!validate()) { setShake(true); setTimeout(() => setShake(false), 500); return; }
    setLoading(true); setErrors({});

    if (fbActive) {
      try {
        const result = await firebase.auth.createUserWithEmailAndPassword(email.trim(), password);
        await result.user.updateProfile({ displayName: name.trim() });
        const initials = name.trim().split(" ").map(w => w[0]).slice(0, 2).join("").toUpperCase();
        onRegister({ email: result.user.email, name: name.trim(), avatar: initials, uid: result.user.uid, userType, provider: "email" });
      } catch (err) {
        const msgs = {
          "auth/email-already-in-use": "Este e-mail já está cadastrado. Tente fazer login.",
          "auth/weak-password": "Senha muito fraca. Use pelo menos 6 caracteres.",
          "auth/invalid-email": "E-mail inválido.",
          "auth/network-request-failed": "Sem conexão com a internet.",
        };
        setErrors({ general: msgs[err.code] || `Erro: ${err.message}` });
        setShake(true); setTimeout(() => setShake(false), 500);
      }
    } else {
      await new Promise(r => setTimeout(r, 800));
      const initials = name.trim().split(" ").map(w => w[0]).slice(0, 2).join("").toUpperCase();
      onRegister({ email, name: name.trim(), avatar: initials, userType });
    }
    setLoading(false);
  };

  const fieldStyle = (hasError) => ({
    width: "100%", padding: "16px 18px", borderRadius: 14, fontSize: 15,
    border: `2px solid ${hasError ? "#e53e3e" : "rgba(255,255,255,0.12)"}`,
    fontFamily: "'DM Sans',sans-serif", outline: "none", boxSizing: "border-box",
    background: "rgba(255,255,255,0.06)", color: "#fff", transition: "border-color 0.2s",
  });

  return (
    <div style={{
      minHeight: "100vh", display: "flex", flexDirection: "column",
      background: "linear-gradient(160deg, #1a1a2e 0%, #16213e 40%, #0f3460 100%)",
      padding: "0 24px",
    }}>
      <div style={{ paddingTop: 50, paddingBottom: 20 }}>
        <button onClick={onGoLogin} style={{ background: "rgba(255,255,255,0.1)", border: "none", color: "#fff", borderRadius: 10, padding: "8px 14px", cursor: "pointer", fontSize: 13, fontFamily: "'DM Sans',sans-serif", marginBottom: 20 }}>← Voltar ao login</button>
        <div style={{ fontFamily: "'Archivo Black',sans-serif", fontSize: 26, color: "#fff", marginBottom: 6 }}>
          Criar <span style={{ color: "#f7c948" }}>conta</span>
        </div>
        <p style={{ fontSize: 14, color: "rgba(255,255,255,0.45)", fontFamily: "'DM Sans',sans-serif", margin: 0 }}>
          Junte-se ao trampoJá em Araxá
        </p>
      </div>

      <div style={{ animation: shake ? "shakeX 0.4s ease" : "none", paddingBottom: 40, flex: 1 }}>
        {errors.general && (
          <div style={{ background: "rgba(229,62,62,0.15)", border: "1px solid rgba(229,62,62,0.3)", borderRadius: 12, padding: "12px 16px", marginBottom: 16, fontSize: 13, color: "#fc8181", fontFamily: "'DM Sans',sans-serif", lineHeight: 1.5 }}>⚠️ {errors.general}</div>
        )}

        {/* User type selector */}
        <div style={{ marginBottom: 20 }}>
          <label style={{ fontSize: 13, fontWeight: 600, color: "rgba(255,255,255,0.6)", fontFamily: "'DM Sans',sans-serif", marginBottom: 10, display: "block" }}>Eu quero... {errors.userType ? <span style={{ color: "#fc8181" }}>({errors.userType})</span> : ""}</label>
          <div style={{ display: "flex", gap: 10 }}>
            {[
              { id: "client", label: "Contratar serviços", icon: "📋", desc: "Sou cliente" },
              { id: "worker", label: "Oferecer serviços", icon: "🔧", desc: "Sou profissional" },
            ].map(t => (
              <button key={t.id} onClick={() => { setUserType(t.id); setErrors(p => ({ ...p, userType: undefined })); }} style={{
                flex: 1, padding: "16px 12px", borderRadius: 14,
                border: `2px solid ${userType === t.id ? "#f7c948" : errors.userType ? "rgba(229,62,62,0.4)" : "rgba(255,255,255,0.1)"}`,
                background: userType === t.id ? "rgba(247,201,72,0.1)" : "rgba(255,255,255,0.03)",
                cursor: "pointer", textAlign: "center", transition: "all 0.2s",
              }}>
                <div style={{ fontSize: 28, marginBottom: 6 }}>{t.icon}</div>
                <div style={{ fontSize: 13, fontWeight: 700, color: userType === t.id ? "#f7c948" : "#fff", fontFamily: "'DM Sans',sans-serif" }}>{t.desc}</div>
                <div style={{ fontSize: 11, color: "rgba(255,255,255,0.4)", fontFamily: "'DM Sans',sans-serif", marginTop: 2 }}>{t.label}</div>
              </button>
            ))}
          </div>
        </div>

        {/* Google register button */}
        <GoogleButton onClick={handleGoogleRegister} loading={googleLoading} disabled={!fbActive} />
        <div style={{ display: "flex", alignItems: "center", gap: 14, marginBottom: 18 }}>
          <div style={{ flex: 1, height: 1, background: "rgba(255,255,255,0.1)" }} />
          <span style={{ fontSize: 12, color: "rgba(255,255,255,0.3)", fontFamily: "'DM Sans',sans-serif" }}>ou preencha abaixo</span>
          <div style={{ flex: 1, height: 1, background: "rgba(255,255,255,0.1)" }} />
        </div>

        {[
          { label: "Nome completo", value: name, set: setName, key: "name", ph: "Seu nome", type: "text" },
          { label: "E-mail", value: email, set: setEmail, key: "email", ph: "seu@email.com", type: "email" },
          { label: "Senha", value: password, set: setPassword, key: "password", ph: "Mínimo 6 caracteres", type: "password" },
          { label: "Confirmar senha", value: confirmPassword, set: setConfirmPassword, key: "confirmPassword", ph: "Repita a senha", type: "password" },
        ].map(f => (
          <div key={f.key} style={{ marginBottom: 14 }}>
            <label style={{ fontSize: 13, fontWeight: 600, color: "rgba(255,255,255,0.6)", fontFamily: "'DM Sans',sans-serif", marginBottom: 8, display: "block" }}>{f.label}</label>
            <input value={f.value} onChange={e => { f.set(e.target.value); setErrors(p => ({ ...p, [f.key]: undefined })); }}
              placeholder={f.ph} type={f.type} style={fieldStyle(errors[f.key])} />
            {errors[f.key] && <div style={{ fontSize: 12, color: "#fc8181", marginTop: 6, fontFamily: "'DM Sans',sans-serif", paddingLeft: 4 }}>{errors[f.key]}</div>}
          </div>
        ))}

        <button onClick={handleRegister} disabled={loading} style={{
          width: "100%", padding: "18px 0", borderRadius: 14, border: "none",
          background: loading ? "rgba(247,201,72,0.5)" : "linear-gradient(135deg, #f7c948, #f6ad55)",
          color: "#1a1a2e", fontSize: 17, fontWeight: 800, marginTop: 10,
          fontFamily: "'Archivo Black',sans-serif", cursor: loading ? "default" : "pointer",
          boxShadow: "0 8px 24px rgba(247,201,72,0.3)",
          display: "flex", alignItems: "center", justifyContent: "center", gap: 10,
        }}>
          {loading ? <><span style={{ animation: "spin 0.8s linear infinite", display: "inline-block" }}>⏳</span> Criando conta...</> : "Criar conta"}
        </button>
      </div>

      <style>{`@keyframes shakeX { 0%,100% { transform:translateX(0) } 20%,60% { transform:translateX(-8px) } 40%,80% { transform:translateX(8px) } }`}</style>
    </div>
  );
}

// ─── MAP SCREEN ─────────────────────────────────────
function MapScreen({ services, onBack, onViewService }) {
  const [selectedPin, setSelectedPin] = useState(null);
  const [mapReady, setMapReady] = useState(false);
  const mapContainer = useRef(null);
  const mapInstance = useRef(null);
  const markersRef = useRef([]);

  const pins = services.map(s => ({ ...s, loc: ARAXA_LOCATIONS[s.locIdx] || ARAXA_LOCATIONS[0] }));

  // Load Leaflet
  useEffect(() => {
    if (window.L) { setMapReady(true); return; }
    const css = document.createElement("link");
    css.rel = "stylesheet";
    css.href = "https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/leaflet.min.css";
    document.head.appendChild(css);
    const js = document.createElement("script");
    js.src = "https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/leaflet.min.js";
    js.onload = () => setMapReady(true);
    document.head.appendChild(js);
    return () => { document.head.removeChild(css); document.head.removeChild(js); };
  }, []);

  // Init map
  useEffect(() => {
    if (!mapReady || !mapContainer.current || mapInstance.current) return;
    const L = window.L;
    const map = L.map(mapContainer.current, {
      center: [-19.5932, -46.9406],
      zoom: 14,
      zoomControl: false,
      attributionControl: false,
    });
    // Google Maps tile layer (roadmap style)
    L.tileLayer("https://mt1.google.com/vt/lyrs=m&x={x}&y={y}&z={z}", {
      maxZoom: 20,
    }).addTo(map);
    // Custom zoom control position
    L.control.zoom({ position: "bottomright" }).addTo(map);
    // Attribution
    L.control.attribution({ position: "bottomleft", prefix: false })
      .addAttribution('Map data © Google')
      .addTo(map);
    mapInstance.current = map;
    // Force resize after render
    setTimeout(() => map.invalidateSize(), 200);
  }, [mapReady]);

  // Add/update markers
  useEffect(() => {
    if (!mapReady || !mapInstance.current) return;
    const L = window.L;
    const map = mapInstance.current;
    // Clear old markers
    markersRef.current.forEach(m => map.removeLayer(m));
    markersRef.current = [];

    pins.forEach(pin => {
      const color = catColor(pin.category);
      const icon = CATEGORIES.find(c => c.id === pin.category)?.icon || "📍";
      const isUrgent = pin.urgent;

      const markerIcon = L.divIcon({
        className: "",
        html: `<div style="
          position:relative; display:flex; flex-direction:column; align-items:center;
        ">
          ${isUrgent ? `<div style="
            position:absolute; top:50%; left:50%; width:48px; height:48px; border-radius:50%;
            transform:translate(-50%,-50%); border:2px solid ${color};
            animation:leafPulse 2s infinite; pointer-events:none;
          "></div>` : ""}
          <div style="
            width:36px; height:36px; border-radius:50%; background:${color};
            border:3px solid #fff; box-shadow:0 2px 12px ${color}88, 0 2px 6px rgba(0,0,0,0.3);
            display:flex; align-items:center; justify-content:center;
            font-size:18px; cursor:pointer; position:relative; z-index:2;
          ">${icon}</div>
          <div style="
            margin-top:4px; background:rgba(26,26,46,0.9); backdrop-filter:blur(8px);
            padding:3px 8px; border-radius:6px; font-size:11px; font-weight:700;
            color:#fff; font-family:'DM Sans',sans-serif; white-space:nowrap;
            box-shadow:0 2px 8px rgba(0,0,0,0.2);
          ">${fmt(pin.budget)}</div>
        </div>`,
        iconSize: [48, 56],
        iconAnchor: [24, 28],
      });

      const marker = L.marker([pin.loc.lat, pin.loc.lng], { icon: markerIcon })
        .addTo(map)
        .on("click", () => setSelectedPin(prev => prev?.id === pin.id ? null : pin));

      markersRef.current.push(marker);
    });
  }, [mapReady, pins.length]);

  // Pan to selected pin
  useEffect(() => {
    if (!selectedPin || !mapInstance.current) return;
    mapInstance.current.flyTo([selectedPin.loc.lat, selectedPin.loc.lng], 16, { duration: 0.5 });
  }, [selectedPin]);

  return (
    <div style={{ height: "100vh", display: "flex", flexDirection: "column", background: "#0d1b2a" }}>
      <Header>
        <BackBtn onClick={onBack} />
        <h1 style={{ fontFamily: "'Archivo Black',sans-serif", fontSize: 20, color: "#fff", margin: 0 }}>Mapa de <span style={{ color: "#f7c948" }}>serviços</span></h1>
        <p style={{ fontSize: 12, color: "rgba(255,255,255,0.4)", fontFamily: "'DM Sans',sans-serif", margin: "4px 0 0" }}>{services.length} serviços na região de Araxá</p>
      </Header>

      <div style={{ flex: 1, position: "relative" }}>
        {/* Map container */}
        <div ref={mapContainer} style={{ width: "100%", height: "100%" }} />

        {/* Loading state */}
        {!mapReady && (
          <div style={{ position: "absolute", inset: 0, display: "flex", alignItems: "center", justifyContent: "center", background: "#0d1b2a" }}>
            <div style={{ textAlign: "center" }}>
              <div style={{ fontSize: 32, marginBottom: 12, animation: "spin 1s linear infinite" }}>📍</div>
              <div style={{ color: "rgba(255,255,255,0.5)", fontFamily: "'DM Sans',sans-serif", fontSize: 14 }}>Carregando mapa...</div>
            </div>
          </div>
        )}

        {/* Legend */}
        <div style={{ position: "absolute", top: 12, left: 12, display: "flex", flexWrap: "wrap", gap: 6, zIndex: 1000, maxWidth: "70%" }}>
          {[...new Set(services.map(s => s.category))].map(cat => (
            <div key={cat} style={{ display: "flex", alignItems: "center", gap: 4, padding: "4px 10px", borderRadius: 8, background: "rgba(255,255,255,0.92)", backdropFilter: "blur(8px)", fontSize: 10, color: "#1a1a2e", fontFamily: "'DM Sans',sans-serif", fontWeight: 600, boxShadow: "0 2px 8px rgba(0,0,0,0.15)" }}>
              <span style={{ width: 8, height: 8, borderRadius: 4, background: catColor(cat) }} />
              {CATEGORIES.find(c => c.id === cat)?.label}
            </div>
          ))}
        </div>

        {/* Selected card */}
        {selectedPin && (
          <div style={{ position: "absolute", bottom: 0, left: 0, right: 0, zIndex: 1000, padding: 16, background: "linear-gradient(to top, rgba(255,255,255,0.98) 80%, transparent)" }}>
            <Card onClick={() => onViewService(selectedPin)} style={{ boxShadow: "0 -4px 24px rgba(0,0,0,0.12)" }}>
              <div style={{ display: "flex", gap: 12 }}>
                <div style={{ width: 50, height: 50, borderRadius: 14, background: catColor(selectedPin.category) + "22", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 24, flexShrink: 0 }}>{CATEGORIES.find(c => c.id === selectedPin.category)?.icon}</div>
                <div style={{ flex: 1, minWidth: 0 }}>
                  <h3 style={{ fontFamily: "'DM Sans',sans-serif", fontWeight: 700, fontSize: 15, color: "var(--text,#1a1a2e)", margin: 0 }}>{selectedPin.title}</h3>
                  <div style={{ fontSize: 12, color: "var(--text-muted,#999)", marginTop: 4, fontFamily: "'DM Sans',sans-serif" }}>📍 {selectedPin.location} · ⏱ {selectedPin.duration}</div>
                  <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginTop: 10 }}>
                    <span style={{ fontFamily: "'Archivo Black',sans-serif", fontSize: 18, color: "#48bb78" }}>{fmt(selectedPin.budget)}</span>
                    <span style={{ fontSize: 11, color: "var(--text-muted,#999)", fontFamily: "'DM Sans',sans-serif" }}>{selectedPin.applicants} interessados · {selectedPin.postedAt}</span>
                  </div>
                </div>
              </div>
            </Card>
          </div>
        )}
      </div>
      <style>{`
        @keyframes leafPulse { 0% { transform:translate(-50%,-50%) scale(1); opacity:0.5 } 50% { transform:translate(-50%,-50%) scale(1.8); opacity:0 } 100% { transform:translate(-50%,-50%) scale(1); opacity:0 } }
        @keyframes spin { to { transform: rotate(360deg) } }
        .leaflet-control-zoom a { background: rgba(26,26,46,0.9) !important; color: #f7c948 !important; border: none !important; border-radius: 10px !important; width: 36px !important; height: 36px !important; line-height: 36px !important; font-size: 18px !important; margin-bottom: 4px !important; box-shadow: 0 2px 8px rgba(0,0,0,0.2) !important; }
        .leaflet-control-zoom { border: none !important; border-radius: 12px !important; overflow: visible !important; }
        .leaflet-control-attribution { font-size: 10px !important; background: rgba(255,255,255,0.7) !important; padding: 2px 6px !important; border-radius: 4px !important; }
      `}</style>
    </div>
  );
}

// ─── NOTIFICATIONS ──────────────────────────────────
function NotificationsScreen({ onBack, notifications, setNotifications }) {
  const unread = notifications.filter(n => !n.read).length;
  const typeColor = { applicant: "#4299e1", message: "#48bb78", rating: "#f7c948", accepted: "#48bb78", reminder: "#ed8936", completed: "#9f7aea" };

  return (
    <div>
      <Header subtitle={`${unread} não lida${unread !== 1 ? "s" : ""}`}>
        <BackBtn onClick={onBack} />
        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
          <h1 style={{ fontFamily: "'Archivo Black',sans-serif", fontSize: 20, color: "#fff", margin: 0 }}>Notificações</h1>
          {unread > 0 && <button onClick={() => setNotifications(p => p.map(n => ({ ...n, read: true })))} style={{ background: "rgba(255,255,255,0.1)", border: "none", color: "#f7c948", borderRadius: 8, padding: "6px 12px", cursor: "pointer", fontSize: 12, fontWeight: 600, fontFamily: "'DM Sans',sans-serif" }}>Marcar todas como lidas</button>}
        </div>
      </Header>
      <div style={{ padding: "8px 16px" }}>
        {notifications.map((n, i) => (
          <FadeIn key={n.id} delay={i * 50}>
            <div onClick={() => setNotifications(p => p.map(x => x.id === n.id ? { ...x, read: true } : x))}
              style={{ display: "flex", gap: 12, padding: "16px 8px", borderBottom: "1px solid var(--border,#f0f0f0)", background: n.read ? "transparent" : "rgba(247,201,72,0.04)", cursor: "pointer", borderRadius: 8 }}>
              <div style={{ width: 44, height: 44, borderRadius: 12, flexShrink: 0, background: (typeColor[n.type] || "#f7c948") + "18", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 20 }}>{n.icon}</div>
              <div style={{ flex: 1, minWidth: 0 }}>
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                  <span style={{ fontFamily: "'DM Sans',sans-serif", fontWeight: 700, fontSize: 14, color: "var(--text,#1a1a2e)" }}>{n.title}</span>
                  <span style={{ fontSize: 11, color: "var(--text-muted,#999)", fontFamily: "'DM Sans',sans-serif", flexShrink: 0 }}>{n.time}</span>
                </div>
                <p style={{ fontSize: 13, color: "var(--text-secondary,#666)", margin: "4px 0 0", fontFamily: "'DM Sans',sans-serif", lineHeight: 1.4 }}>{n.body}</p>
              </div>
              {!n.read && <div style={{ width: 8, height: 8, borderRadius: 4, background: "#f7c948", flexShrink: 0, marginTop: 6 }} />}
            </div>
          </FadeIn>
        ))}
      </div>
    </div>
  );
}

// ─── RATING MODAL ───────────────────────────────────
function RatingModal({ worker, onClose, onSubmit }) {
  const [rating, setRating] = useState(0);
  const [text, setText] = useState("");

  return (
    <div style={{ position: "fixed", inset: 0, zIndex: 100, display: "flex", alignItems: "flex-end", justifyContent: "center" }}>
      <div onClick={onClose} style={{ position: "absolute", inset: 0, background: "rgba(0,0,0,0.6)", backdropFilter: "blur(4px)" }} />
      <div style={{ position: "relative", width: "100%", maxWidth: 480, background: "var(--card-bg,#fff)", borderRadius: "24px 24px 0 0", padding: "28px 24px 32px", zIndex: 2, animation: "slideUp 0.35s cubic-bezier(0.22,1,0.36,1)" }}>
        <div style={{ width: 40, height: 4, borderRadius: 2, background: "var(--border,#ddd)", margin: "0 auto 20px" }} />
        <div style={{ textAlign: "center", marginBottom: 20 }}>
          <Avatar initials={worker?.avatar || "JP"} size={56} gradient="linear-gradient(135deg,#48bb78,#38a169)" color="#fff" />
          <h3 style={{ fontFamily: "'Archivo Black',sans-serif", fontSize: 18, color: "var(--text,#1a1a2e)", margin: "12px 0 4px" }}>Avaliar {worker?.name || "Profissional"}</h3>
          <p style={{ fontSize: 13, color: "var(--text-muted,#999)", fontFamily: "'DM Sans',sans-serif", margin: 0 }}>Como foi a experiência?</p>
        </div>
        <div style={{ display: "flex", justifyContent: "center", marginBottom: 20 }}>
          <Stars rating={rating} size={32} interactive onChange={setRating} />
        </div>
        {rating > 0 && (
          <div style={{ marginBottom: 20, animation: "fadeIn 0.3s ease" }}>
            <div style={{ display: "flex", justifyContent: "center", gap: 8, marginBottom: 14, flexWrap: "wrap" }}>
              {(rating >= 4 ? ["Pontual", "Caprichoso", "Educado", "Rápido", "Ótimo preço"] : ["Atrasou", "Pode melhorar", "OK"]).map(tag => (
                <button key={tag} onClick={() => setText(p => p ? p + ", " + tag.toLowerCase() : tag)}
                  style={{ padding: "6px 12px", borderRadius: 20, border: "1px solid var(--border,#e2e8f0)", background: "var(--card-bg,#fff)", fontSize: 12, fontFamily: "'DM Sans',sans-serif", cursor: "pointer", color: "var(--text,#1a1a2e)" }}>{tag}</button>
              ))}
            </div>
            <textarea value={text} onChange={e => setText(e.target.value)} rows={3} placeholder="Conte como foi a experiência..."
              style={{ width: "100%", padding: "12px 14px", borderRadius: 12, border: "1px solid var(--border,#e2e8f0)", fontSize: 14, fontFamily: "'DM Sans',sans-serif", outline: "none", resize: "none", boxSizing: "border-box", background: "var(--bg-secondary,#f7fafc)", color: "var(--text,#1a1a2e)" }} />
          </div>
        )}
        <button onClick={() => { if (rating) onSubmit({ rating, text }); }}
          style={{ width: "100%", padding: "16px 0", borderRadius: 14, border: "none", background: rating ? "linear-gradient(135deg,#f7c948,#f6ad55)" : "#e2e8f0", color: rating ? "#1a1a2e" : "#a0aec0", fontSize: 16, fontWeight: 800, fontFamily: "'Archivo Black',sans-serif", cursor: rating ? "pointer" : "default" }}>
          {rating ? `Enviar avaliação (${rating}★)` : "Selecione uma nota"}
        </button>
      </div>
      <style>{`@keyframes slideUp { from { transform:translateY(100%) } to { transform:translateY(0) } } @keyframes fadeIn { from { opacity:0; transform:translateY(8px) } to { opacity:1; transform:translateY(0) } }`}</style>
    </div>
  );
}

// ─── WORKER PROFILE ─────────────────────────────────
function WorkerProfile({ worker, onBack, onChat, onRate }) {
  const avg = worker.reviews.length ? (worker.reviews.reduce((a, r) => a + r.rating, 0) / worker.reviews.length).toFixed(1) : "Novo";
  const dist = [5, 4, 3, 2, 1].map(s => ({ star: s, count: worker.reviews.filter(r => r.rating === s).length }));
  const maxC = Math.max(...dist.map(d => d.count), 1);

  return (
    <div style={{ paddingBottom: 100 }}>
      <Header>
        <BackBtn onClick={onBack} />
        <div style={{ display: "flex", alignItems: "center", gap: 14 }}>
          <Avatar initials={worker.avatar} size={56} gradient="linear-gradient(135deg,#48bb78,#38a169)" color="#fff" />
          <div>
            <h1 style={{ fontFamily: "'Archivo Black',sans-serif", fontSize: 20, color: "#fff", margin: 0 }}>{worker.name}</h1>
            <div style={{ fontSize: 13, color: "rgba(255,255,255,0.5)", fontFamily: "'DM Sans',sans-serif", marginTop: 4 }}>{worker.specialty} · {worker.jobs} serviços</div>
          </div>
        </div>
      </Header>

      <div style={{ padding: 20 }}>
        <Card style={{ marginBottom: 16 }} hoverable={false}>
          <div style={{ display: "flex", gap: 20, alignItems: "center" }}>
            <div style={{ textAlign: "center" }}>
              <div style={{ fontFamily: "'Archivo Black',sans-serif", fontSize: 42, color: "#f7c948", lineHeight: 1 }}>{avg}</div>
              <Stars rating={Math.round(Number(avg))} size={14} />
              <div style={{ fontSize: 11, color: "var(--text-muted,#999)", marginTop: 4, fontFamily: "'DM Sans',sans-serif" }}>{worker.reviews.length} avaliações</div>
            </div>
            <div style={{ flex: 1 }}>
              {dist.map(d => (
                <div key={d.star} style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 4 }}>
                  <span style={{ fontSize: 11, color: "var(--text-muted,#999)", width: 14, textAlign: "right", fontFamily: "'DM Sans',sans-serif" }}>{d.star}</span>
                  <div style={{ flex: 1, height: 8, borderRadius: 4, background: "var(--border,#eee)", overflow: "hidden" }}>
                    <div style={{ height: "100%", borderRadius: 4, background: "#f7c948", width: `${(d.count / maxC) * 100}%`, transition: "width 0.6s ease" }} />
                  </div>
                  <span style={{ fontSize: 11, color: "var(--text-muted,#999)", width: 16, fontFamily: "'DM Sans',sans-serif" }}>{d.count}</span>
                </div>
              ))}
            </div>
          </div>
        </Card>

        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: 10, marginBottom: 20 }}>
          {[{ l: "Serviços", v: worker.jobs, c: "#48bb78" }, { l: "Nota média", v: avg, c: "#f7c948" }, { l: "Resposta", v: "~15min", c: "#4299e1" }].map((s, i) => (
            <div key={i} style={{ background: "var(--card-bg,#fff)", border: "1px solid var(--border,#e8e8e8)", borderRadius: 14, padding: "14px 12px", textAlign: "center" }}>
              <div style={{ fontSize: 11, color: "var(--text-muted,#999)", fontFamily: "'DM Sans',sans-serif", marginBottom: 4 }}>{s.l}</div>
              <div style={{ fontFamily: "'Archivo Black',sans-serif", fontSize: 18, color: s.c }}>{s.v}</div>
            </div>
          ))}
        </div>

        <h3 style={{ fontFamily: "'Archivo Black',sans-serif", fontSize: 16, color: "var(--text,#1a1a2e)", margin: "0 0 12px" }}>Avaliações</h3>
        <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
          {worker.reviews.map((r, i) => (
            <FadeIn key={r.id} delay={i * 70}>
              <Card hoverable={false}>
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 8 }}>
                  <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                    <Avatar initials={r.avatar} size={32} />
                    <div>
                      <div style={{ fontFamily: "'DM Sans',sans-serif", fontWeight: 700, fontSize: 13, color: "var(--text,#1a1a2e)" }}>{r.from}</div>
                      <div style={{ fontSize: 11, color: "var(--text-muted,#999)", fontFamily: "'DM Sans',sans-serif" }}>{r.service} · {r.date}</div>
                    </div>
                  </div>
                  <Stars rating={r.rating} size={12} />
                </div>
                <p style={{ fontSize: 13, color: "var(--text-secondary,#666)", margin: 0, fontFamily: "'DM Sans',sans-serif", lineHeight: 1.5, fontStyle: "italic" }}>"{r.text}"</p>
              </Card>
            </FadeIn>
          ))}
        </div>
      </div>

      <div style={{ position: "fixed", bottom: 0, left: 0, right: 0, padding: "14px 20px", background: "var(--card-bg,rgba(255,255,255,0.95))", backdropFilter: "blur(10px)", borderTop: "1px solid var(--border,#e8e8e8)", display: "flex", gap: 10, zIndex: 20, maxWidth: 480, margin: "0 auto", boxSizing: "border-box" }}>
        <button onClick={onRate} style={{ flex: 1, padding: "14px 0", borderRadius: 12, border: "2px solid #f7c948", background: "transparent", color: "#f7c948", fontSize: 14, fontWeight: 700, fontFamily: "'DM Sans',sans-serif", cursor: "pointer" }}>⭐ Avaliar</button>
        <button onClick={onChat} style={{ flex: 1, padding: "14px 0", borderRadius: 12, border: "none", background: "linear-gradient(135deg,#1a1a2e,#0f3460)", color: "#f7c948", fontSize: 14, fontWeight: 700, fontFamily: "'DM Sans',sans-serif", cursor: "pointer" }}>💬 Conversar</button>
      </div>
    </div>
  );
}

// ─── HOME ───────────────────────────────────────────
function HomeScreen({ services, selectedCategory, setSelectedCategory, onViewService, onPost, onOpenChat, onNotifications, onMap, unreadNotifs, myApplications, user, onLogout }) {
  const filtered = selectedCategory === "all" ? services : services.filter(s => s.category === selectedCategory);
  const [showMenu, setShowMenu] = useState(false);

  return (
    <div style={{ paddingBottom: 90 }}>
      <div style={{ background: "linear-gradient(135deg,#1a1a2e 0%,#16213e 50%,#0f3460 100%)", padding: "20px 20px 24px", position: "sticky", top: 0, zIndex: 20 }}>
        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 16 }}>
          <div>
            <div style={{ fontFamily: "'Archivo Black',sans-serif", fontSize: 22, color: "#fff", letterSpacing: -0.5 }}>trampo<span style={{ color: "#f7c948" }}>já</span></div>
            <div style={{ fontSize: 12, color: "rgba(255,255,255,0.5)", fontFamily: "'DM Sans',sans-serif", marginTop: 2 }}>Olá, {user?.name?.split(" ")[0] || "Usuário"}!</div>
          </div>
          <div style={{ display: "flex", gap: 8, alignItems: "center" }}>
            <IconBtn onClick={onMap}>📍</IconBtn>
            <IconBtn onClick={onNotifications} badge={unreadNotifs}>🔔</IconBtn>
            <IconBtn onClick={onOpenChat} badge={myApplications}>💬</IconBtn>
            <div style={{ position: "relative" }}>
              <div onClick={() => setShowMenu(!showMenu)} style={{ width: 40, height: 40, borderRadius: 12, background: "linear-gradient(135deg,#f7c948,#f6ad55)", display: "flex", alignItems: "center", justifyContent: "center", fontFamily: "'Archivo Black',sans-serif", fontSize: 14, color: "#1a1a2e", cursor: "pointer" }}>{user?.avatar || "EU"}</div>
              {showMenu && (
                <div style={{ position: "absolute", top: 48, right: 0, background: "var(--card-bg,#fff)", borderRadius: 12, boxShadow: "0 8px 32px rgba(0,0,0,0.2)", overflow: "hidden", zIndex: 100, minWidth: 180, border: "1px solid var(--border,#e8e8e8)" }}>
                  <div style={{ padding: "14px 16px", borderBottom: "1px solid var(--border,#f0f0f0)" }}>
                    <div style={{ fontWeight: 700, fontSize: 14, color: "var(--text,#1a1a2e)", fontFamily: "'DM Sans',sans-serif" }}>{user?.name}</div>
                    <div style={{ fontSize: 12, color: "var(--text-muted,#999)", fontFamily: "'DM Sans',sans-serif" }}>{user?.email}</div>
                  </div>
                  <button onClick={() => { setShowMenu(false); onLogout(); }} style={{ width: "100%", padding: "12px 16px", border: "none", background: "none", cursor: "pointer", textAlign: "left", fontSize: 14, color: "#e53e3e", fontFamily: "'DM Sans',sans-serif", fontWeight: 600 }}>
                    🚪 Sair da conta
                  </button>
                </div>
              )}
            </div>
          </div>
        </div>
        <div style={{ display: "flex", gap: 8, overflowX: "auto", paddingBottom: 4, scrollbarWidth: "none" }}>
          {CATEGORIES.map(c => (
            <button key={c.id} onClick={() => setSelectedCategory(c.id)} style={{
              flexShrink: 0, padding: "8px 14px", borderRadius: 20,
              border: selectedCategory === c.id ? "none" : "1px solid rgba(255,255,255,0.15)",
              background: selectedCategory === c.id ? "#f7c948" : "rgba(255,255,255,0.06)",
              color: selectedCategory === c.id ? "#1a1a2e" : "rgba(255,255,255,0.7)",
              fontSize: 13, fontFamily: "'DM Sans',sans-serif", fontWeight: selectedCategory === c.id ? 700 : 500,
              cursor: "pointer", display: "flex", alignItems: "center", gap: 6, transition: "all 0.2s",
            }}><span style={{ fontSize: 14 }}>{c.icon}</span>{c.label}</button>
          ))}
        </div>
      </div>

      <div style={{ display: "flex", gap: 12, padding: "16px 20px", overflowX: "auto" }}>
        {[{ n: "142", l: "serviços ativos", c: "#48bb78" }, { n: "38", l: "fechados hoje", c: "#f7c948" }, { n: "4.7★", l: "satisfação média", c: "#ed8936" }].map((s, i) => (
          <div key={i} style={{ flexShrink: 0, padding: "12px 16px", borderRadius: 14, background: "var(--card-bg,#fff)", border: "1px solid var(--border,#e8e8e8)", minWidth: 110 }}>
            <div style={{ fontFamily: "'Archivo Black',sans-serif", fontSize: 20, color: s.c }}>{s.n}</div>
            <div style={{ fontSize: 11, color: "var(--text-muted,#999)", fontFamily: "'DM Sans',sans-serif", marginTop: 2 }}>{s.l}</div>
          </div>
        ))}
      </div>

      <div style={{ padding: "0 20px" }}>
        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 12 }}>
          <h2 style={{ fontFamily: "'Archivo Black',sans-serif", fontSize: 16, color: "var(--text,#1a1a2e)", margin: 0 }}>
            {selectedCategory === "all" ? "Todos os serviços" : CATEGORIES.find(c => c.id === selectedCategory)?.label}
          </h2>
          <span style={{ fontSize: 12, color: "var(--text-muted,#999)", fontFamily: "'DM Sans',sans-serif" }}>{filtered.length} disponíveis</span>
        </div>
        <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
          {filtered.map((s, i) => (
            <FadeIn key={s.id} delay={i * 60}>
              <Card onClick={() => onViewService(s)} style={{ position: "relative", overflow: "hidden" }}>
                {s.urgent && <div style={{ position: "absolute", top: 14, right: 14, padding: "4px 10px", borderRadius: 8, background: "#fed7d7", color: "#c53030", fontSize: 11, fontWeight: 700, fontFamily: "'DM Sans',sans-serif" }}>URGENTE</div>}
                <div style={{ display: "flex", gap: 12, marginBottom: 12 }}>
                  <div style={{ width: 44, height: 44, borderRadius: 12, flexShrink: 0, background: "linear-gradient(135deg,#edf2f7,#e2e8f0)", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 22 }}>{CATEGORIES.find(c => c.id === s.category)?.icon}</div>
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <h3 style={{ fontFamily: "'DM Sans',sans-serif", fontWeight: 700, fontSize: 15, color: "var(--text,#1a1a2e)", margin: 0, lineHeight: 1.3 }}>{s.title}</h3>
                    <div style={{ fontSize: 12, color: "var(--text-muted,#999)", marginTop: 4, fontFamily: "'DM Sans',sans-serif" }}>📍 {s.location} · ⏱ {s.duration}</div>
                  </div>
                </div>
                <p style={{ fontSize: 13, color: "var(--text-secondary,#666)", margin: "0 0 14px", fontFamily: "'DM Sans',sans-serif", lineHeight: 1.5, display: "-webkit-box", WebkitLineClamp: 2, WebkitBoxOrient: "vertical", overflow: "hidden" }}>{s.description}</p>
                <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", borderTop: "1px solid var(--border,#f0f0f0)", paddingTop: 12 }}>
                  <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                    <Avatar initials={s.postedBy.avatar} size={28} />
                    <div>
                      <div style={{ fontSize: 12, fontWeight: 600, color: "var(--text,#1a1a2e)", fontFamily: "'DM Sans',sans-serif" }}>{s.postedBy.name}</div>
                      <div style={{ fontSize: 10, color: "var(--text-muted,#999)" }}>⭐ {s.postedBy.rating} · {s.postedAt}</div>
                    </div>
                  </div>
                  <div style={{ textAlign: "right" }}>
                    <div style={{ fontFamily: "'Archivo Black',sans-serif", fontSize: 18, color: "#48bb78" }}>{fmt(s.budget)}</div>
                    <div style={{ fontSize: 10, color: "var(--text-muted,#999)", fontFamily: "'DM Sans',sans-serif" }}>{s.applicants} interessados</div>
                  </div>
                </div>
              </Card>
            </FadeIn>
          ))}
        </div>
      </div>

      <button onClick={onPost} style={{ position: "fixed", bottom: 24, right: 24, width: 60, height: 60, borderRadius: 18, background: "linear-gradient(135deg,#f7c948,#f6ad55)", border: "none", boxShadow: "0 8px 24px rgba(247,201,72,0.4)", cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 28, color: "#1a1a2e", zIndex: 30, transition: "transform 0.2s" }}
        onMouseEnter={e => e.currentTarget.style.transform = "scale(1.1) rotate(90deg)"}
        onMouseLeave={e => e.currentTarget.style.transform = ""}
      >+</button>
    </div>
  );
}

// ─── SERVICE DETAIL ─────────────────────────────────
function ServiceDetailScreen({ service, onBack, onChat, onViewWorker }) {
  const [applied, setApplied] = useState(false);
  const cat = CATEGORIES.find(c => c.id === service.category);
  return (
    <div style={{ paddingBottom: 100 }}>
      <Header>
        <BackBtn onClick={onBack} />
        <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
          <div style={{ width: 50, height: 50, borderRadius: 14, background: "rgba(255,255,255,0.1)", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 26 }}>{cat?.icon}</div>
          <div>
            <div style={{ fontSize: 11, color: "#f7c948", fontFamily: "'DM Sans',sans-serif", fontWeight: 700, textTransform: "uppercase", letterSpacing: 1 }}>{cat?.label}</div>
            <h1 style={{ fontFamily: "'Archivo Black',sans-serif", fontSize: 20, color: "#fff", margin: 0 }}>{service.title}</h1>
          </div>
        </div>
        {service.urgent && <div style={{ display: "inline-block", padding: "5px 12px", borderRadius: 8, background: "rgba(229,62,62,0.2)", color: "#fc8181", fontSize: 12, fontWeight: 700, fontFamily: "'DM Sans',sans-serif", marginTop: 10 }}>⚡ URGENTE</div>}
      </Header>
      <div style={{ padding: 20 }}>
        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: 10, marginBottom: 20 }}>
          {[{ l: "Valor", v: fmt(service.budget), c: "#48bb78" }, { l: "Duração", v: service.duration, c: "#f7c948" }, { l: "Interessados", v: `${service.applicants}`, c: "#ed8936" }].map((it, i) => (
            <div key={i} style={{ background: "var(--card-bg,#fff)", border: "1px solid var(--border,#e8e8e8)", borderRadius: 14, padding: "14px 12px", textAlign: "center" }}>
              <div style={{ fontSize: 11, color: "var(--text-muted,#999)", fontFamily: "'DM Sans',sans-serif", marginBottom: 4 }}>{it.l}</div>
              <div style={{ fontFamily: "'Archivo Black',sans-serif", fontSize: 16, color: it.c }}>{it.v}</div>
            </div>
          ))}
        </div>
        <Card style={{ marginBottom: 16 }} hoverable={false}>
          <h3 style={{ fontFamily: "'DM Sans',sans-serif", fontWeight: 700, fontSize: 14, color: "var(--text,#1a1a2e)", margin: "0 0 10px" }}>Descrição</h3>
          <p style={{ fontSize: 14, color: "var(--text-secondary,#555)", lineHeight: 1.7, margin: 0, fontFamily: "'DM Sans',sans-serif" }}>{service.description}</p>
          <div style={{ marginTop: 14, display: "flex", gap: 8, flexWrap: "wrap" }}>
            {[`📍 ${service.location}`, `⏱ ${service.duration}`, `📅 ${service.postedAt}`].map((t, i) => <span key={i} style={{ padding: "5px 10px", borderRadius: 8, background: "#edf2f7", fontSize: 12, color: "#4a5568", fontFamily: "'DM Sans',sans-serif" }}>{t}</span>)}
          </div>
        </Card>
        <Card style={{ marginBottom: 20 }} hoverable={false}>
          <h3 style={{ fontFamily: "'DM Sans',sans-serif", fontWeight: 700, fontSize: 14, color: "var(--text,#1a1a2e)", margin: "0 0 12px" }}>Publicado por</h3>
          <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
            <Avatar initials={service.postedBy.avatar} size={48} />
            <div>
              <div style={{ fontFamily: "'DM Sans',sans-serif", fontWeight: 700, fontSize: 15, color: "var(--text,#1a1a2e)" }}>{service.postedBy.name}</div>
              <div style={{ fontSize: 12, color: "var(--text-muted,#999)", fontFamily: "'DM Sans',sans-serif" }}>⭐ {service.postedBy.rating} · Membro desde {service.postedBy.since}</div>
            </div>
          </div>
        </Card>
        <h3 style={{ fontFamily: "'Archivo Black',sans-serif", fontSize: 16, color: "var(--text,#1a1a2e)", margin: "0 0 12px" }}>Candidatos</h3>
        <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
          {MOCK_APPLICANTS.map((a, i) => (
            <FadeIn key={a.id} delay={i * 80}>
              <Card hoverable={false}>
                <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 10 }}>
                  <div onClick={() => onViewWorker(a)} style={{ display: "flex", alignItems: "center", gap: 10, cursor: "pointer" }}>
                    <Avatar initials={a.avatar} size={40} gradient="linear-gradient(135deg,#48bb78,#38a169)" color="#fff" />
                    <div>
                      <div style={{ fontFamily: "'DM Sans',sans-serif", fontWeight: 700, fontSize: 14, color: "var(--text,#1a1a2e)", textDecoration: "underline", textDecorationColor: "rgba(0,0,0,0.1)", textUnderlineOffset: 2 }}>{a.name}</div>
                      <div style={{ fontSize: 11, color: "var(--text-muted,#999)", fontFamily: "'DM Sans',sans-serif" }}>⭐ {a.rating} · {a.jobs} serviços</div>
                    </div>
                  </div>
                  <div style={{ fontFamily: "'Archivo Black',sans-serif", fontSize: 15, color: "#48bb78" }}>{a.price}</div>
                </div>
                <p style={{ fontSize: 13, color: "var(--text-secondary,#666)", margin: "0 0 12px", fontFamily: "'DM Sans',sans-serif", lineHeight: 1.5, background: "#f7fafc", padding: "10px 12px", borderRadius: 10 }}>"{a.message}"</p>
                <div style={{ display: "flex", gap: 8 }}>
                  <button onClick={() => onChat(a)} style={{ flex: 1, padding: "10px 0", borderRadius: 10, border: "none", background: "linear-gradient(135deg,#1a1a2e,#0f3460)", color: "#f7c948", fontSize: 13, fontWeight: 700, fontFamily: "'DM Sans',sans-serif", cursor: "pointer" }}>💬 Conversar</button>
                  <button style={{ flex: 1, padding: "10px 0", borderRadius: 10, border: "2px solid #48bb78", background: "transparent", color: "#48bb78", fontSize: 13, fontWeight: 700, fontFamily: "'DM Sans',sans-serif", cursor: "pointer" }}>✓ Aceitar</button>
                </div>
              </Card>
            </FadeIn>
          ))}
        </div>
      </div>
      <div style={{ position: "fixed", bottom: 0, left: 0, right: 0, padding: "16px 20px", background: "var(--card-bg,rgba(255,255,255,0.95))", backdropFilter: "blur(10px)", borderTop: "1px solid var(--border,#e8e8e8)", zIndex: 20, maxWidth: 480, margin: "0 auto", boxSizing: "border-box" }}>
        {!applied ? <button onClick={() => setApplied(true)} style={{ width: "100%", padding: "16px 0", borderRadius: 14, border: "none", background: "linear-gradient(135deg,#f7c948,#f6ad55)", color: "#1a1a2e", fontSize: 16, fontWeight: 800, fontFamily: "'Archivo Black',sans-serif", cursor: "pointer" }}>Tenho interesse nesse trampo!</button>
          : <div style={{ textAlign: "center" }}><div style={{ color: "#48bb78", fontFamily: "'Archivo Black',sans-serif", fontSize: 16 }}>✅ Candidatura enviada!</div><div style={{ fontSize: 12, color: "var(--text-muted,#999)", fontFamily: "'DM Sans',sans-serif", marginTop: 4 }}>Aguarde o contato do cliente</div></div>}
      </div>
    </div>
  );
}

// ─── CHAT ───────────────────────────────────────────
function ChatScreen({ onBack, worker }) {
  const [messages, setMessages] = useState(MOCK_MESSAGES);
  const [input, setInput] = useState("");
  const bottom = useRef(null);
  useEffect(() => { bottom.current?.scrollIntoView({ behavior: "smooth" }); }, [messages]);
  const send = () => { if (!input.trim()) return; setMessages(p => [...p, { id: Date.now(), from: "client", text: input.trim(), time: new Date().toLocaleTimeString("pt-BR", { hour: "2-digit", minute: "2-digit" }) }]); setInput(""); };

  return (
    <div style={{ display: "flex", flexDirection: "column", height: "100vh" }}>
      <div style={{ background: "linear-gradient(135deg,#1a1a2e,#0f3460)", padding: "16px 20px", display: "flex", alignItems: "center", gap: 12, flexShrink: 0 }}>
        <button onClick={onBack} style={{ background: "rgba(255,255,255,0.1)", border: "none", color: "#fff", borderRadius: 10, padding: "8px 12px", cursor: "pointer", fontSize: 14 }}>←</button>
        <Avatar initials={worker?.avatar || "JP"} size={40} gradient="linear-gradient(135deg,#48bb78,#38a169)" color="#fff" />
        <div>
          <div style={{ fontFamily: "'DM Sans',sans-serif", fontWeight: 700, fontSize: 15, color: "#fff" }}>{worker?.name || "José Pereira"}</div>
          <div style={{ fontSize: 11, color: "rgba(255,255,255,0.5)", fontFamily: "'DM Sans',sans-serif" }}>⭐ {worker?.rating || "4.9"} · Online agora</div>
        </div>
      </div>
      <div style={{ flex: 1, overflowY: "auto", padding: 20, display: "flex", flexDirection: "column", gap: 10, background: "var(--bg-secondary,#f8f9fa)" }}>
        <div style={{ alignSelf: "center", padding: "6px 14px", borderRadius: 20, background: "var(--card-bg,#fff)", border: "1px solid var(--border,#e8e8e8)", fontSize: 11, color: "var(--text-muted,#999)", fontFamily: "'DM Sans',sans-serif" }}>Hoje</div>
        {messages.map(m => (
          <div key={m.id} style={{ alignSelf: m.from === "client" ? "flex-end" : "flex-start", maxWidth: "80%" }}>
            <div style={{ padding: "12px 16px", borderRadius: 16, borderBottomRightRadius: m.from === "client" ? 4 : 16, borderBottomLeftRadius: m.from === "worker" ? 4 : 16, background: m.from === "client" ? "linear-gradient(135deg,#1a1a2e,#0f3460)" : "var(--card-bg,#fff)", color: m.from === "client" ? "#fff" : "var(--text,#1a1a2e)", fontSize: 14, fontFamily: "'DM Sans',sans-serif", lineHeight: 1.5, border: m.from === "worker" ? "1px solid var(--border,#e8e8e8)" : "none", boxShadow: "0 2px 6px rgba(0,0,0,0.06)" }}>{m.text}</div>
            <div style={{ fontSize: 10, color: "var(--text-muted,#999)", marginTop: 4, textAlign: m.from === "client" ? "right" : "left", fontFamily: "'DM Sans',sans-serif" }}>{m.time}</div>
          </div>
        ))}
        <div ref={bottom} />
      </div>
      <div style={{ padding: "12px 16px", background: "var(--card-bg,#fff)", borderTop: "1px solid var(--border,#e8e8e8)", display: "flex", gap: 10, flexShrink: 0 }}>
        <input value={input} onChange={e => setInput(e.target.value)} onKeyDown={e => e.key === "Enter" && send()} placeholder="Digite sua mensagem..." style={{ flex: 1, padding: "12px 16px", borderRadius: 12, border: "1px solid var(--border,#e2e8f0)", fontSize: 14, fontFamily: "'DM Sans',sans-serif", outline: "none", background: "var(--bg-secondary,#f7fafc)", color: "var(--text,#1a1a2e)" }} />
        <button onClick={send} style={{ width: 48, height: 48, borderRadius: 12, border: "none", background: input.trim() ? "linear-gradient(135deg,#f7c948,#f6ad55)" : "#e2e8f0", color: input.trim() ? "#1a1a2e" : "#a0aec0", fontSize: 20, cursor: input.trim() ? "pointer" : "default", display: "flex", alignItems: "center", justifyContent: "center", transition: "all 0.2s" }}>↑</button>
      </div>
    </div>
  );
}

// ─── POST ───────────────────────────────────────────
function PostScreen({ onBack, onSubmit, user }) {
  const [f, setF] = useState({ title: "", category: "", description: "", budget: "", duration: "", location: "" });
  const upd = (k, v) => setF(p => ({ ...p, [k]: v }));
  const valid = f.title && f.category && f.description && f.budget;

  return (
    <div style={{ paddingBottom: 40 }}>
      <Header subtitle="Descreva o serviço que você precisa">
        <BackBtn onClick={onBack} />
        <h1 style={{ fontFamily: "'Archivo Black',sans-serif", fontSize: 22, color: "#fff", margin: 0 }}>Publicar <span style={{ color: "#f7c948" }}>trampo</span></h1>
      </Header>
      <div style={{ padding: 20, display: "flex", flexDirection: "column", gap: 16 }}>
        <div>
          <label style={{ fontSize: 13, fontWeight: 700, color: "var(--text,#1a1a2e)", fontFamily: "'DM Sans',sans-serif", marginBottom: 8, display: "block" }}>Categoria *</label>
          <div style={{ display: "flex", flexWrap: "wrap", gap: 8 }}>
            {CATEGORIES.filter(c => c.id !== "all").map(c => (
              <button key={c.id} onClick={() => upd("category", c.id)} style={{ padding: "8px 12px", borderRadius: 10, border: f.category === c.id ? "2px solid #f7c948" : "1px solid var(--border,#e2e8f0)", background: f.category === c.id ? "#fffdf0" : "var(--card-bg,#fff)", fontSize: 12, fontFamily: "'DM Sans',sans-serif", cursor: "pointer", display: "flex", alignItems: "center", gap: 6, color: "var(--text,#1a1a2e)", fontWeight: f.category === c.id ? 700 : 400 }}><span>{c.icon}</span>{c.label}</button>
            ))}
          </div>
        </div>
        <InputField label="Título" required value={f.title} onChange={e => upd("title", e.target.value)} placeholder="Ex: Montagem de guarda-roupa de 6 portas" />
        <div>
          <label style={{ fontSize: 13, fontWeight: 700, color: "var(--text,#1a1a2e)", fontFamily: "'DM Sans',sans-serif", marginBottom: 8, display: "block" }}>Descrição *</label>
          <textarea value={f.description} onChange={e => upd("description", e.target.value)} rows={4} placeholder="Descreva o serviço com detalhes..." style={{ width: "100%", padding: "14px 16px", borderRadius: 12, fontSize: 14, border: "1px solid var(--border,#e2e8f0)", fontFamily: "'DM Sans',sans-serif", outline: "none", resize: "vertical", boxSizing: "border-box", lineHeight: 1.6, background: "var(--card-bg,#fff)", color: "var(--text,#1a1a2e)" }} />
        </div>
        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12 }}>
          <InputField label="Valor (R$)" required value={f.budget} onChange={e => upd("budget", e.target.value)} placeholder="250" type="number" />
          <InputField label="Duração" value={f.duration} onChange={e => upd("duration", e.target.value)} placeholder="4 horas" />
        </div>
        <InputField label="Local" value={f.location} onChange={e => upd("location", e.target.value)} placeholder="Bairro, Cidade" />
        <button onClick={() => { if (!valid) return; onSubmit({ id: Date.now(), category: f.category, title: f.title, description: f.description, budget: Number(f.budget), duration: f.duration || "A combinar", location: f.location || "A combinar", locIdx: Math.floor(Math.random() * ARAXA_LOCATIONS.length), postedBy: { name: user?.name || "Você", avatar: user?.avatar || "EU", rating: "Novo", since: "2026" }, postedAt: "Agora", applicants: 0, urgent: false, status: "open" }); }}
          style={{ width: "100%", padding: "16px 0", borderRadius: 14, border: "none", background: valid ? "linear-gradient(135deg,#f7c948,#f6ad55)" : "#e2e8f0", color: valid ? "#1a1a2e" : "#a0aec0", fontSize: 16, fontWeight: 800, fontFamily: "'Archivo Black',sans-serif", cursor: valid ? "pointer" : "default", marginTop: 8 }}>Publicar serviço</button>
      </div>
    </div>
  );
}

// ─── CHATS LIST ─────────────────────────────────────
function ChatsListScreen({ onBack, onOpenChat }) {
  const chats = [
    { id: 1, worker: MOCK_APPLICANTS[0], lastMsg: "Posso ir amanhã de manhã, às 8h. Serve?", time: "14:06", unread: 1, service: "Poda de árvores" },
    { id: 2, worker: MOCK_APPLICANTS[1], lastMsg: "Combinado! Levo minhas ferramentas.", time: "12:30", unread: 0, service: "Pintura de quartos" },
    { id: 3, worker: MOCK_APPLICANTS[2], lastMsg: "Qual o endereço exato?", time: "Ontem", unread: 2, service: "Montagem de móveis" },
  ];
  return (
    <div>
      <Header subtitle={`${chats.length} conversas ativas`}>
        <BackBtn onClick={onBack} />
        <h1 style={{ fontFamily: "'Archivo Black',sans-serif", fontSize: 22, color: "#fff", margin: 0 }}>Conversas</h1>
      </Header>
      <div style={{ padding: "8px 16px" }}>
        {chats.map((c, i) => (
          <FadeIn key={c.id} delay={i * 60}>
            <div onClick={() => onOpenChat(c.worker)} style={{ display: "flex", alignItems: "center", gap: 12, padding: "14px 4px", borderBottom: "1px solid var(--border,#f0f0f0)", cursor: "pointer" }}>
              <Avatar initials={c.worker.avatar} size={48} gradient="linear-gradient(135deg,#48bb78,#38a169)" color="#fff" />
              <div style={{ flex: 1, minWidth: 0 }}>
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 3 }}>
                  <span style={{ fontFamily: "'DM Sans',sans-serif", fontWeight: 700, fontSize: 14, color: "var(--text,#1a1a2e)" }}>{c.worker.name}</span>
                  <span style={{ fontSize: 11, color: "var(--text-muted,#999)", fontFamily: "'DM Sans',sans-serif" }}>{c.time}</span>
                </div>
                <div style={{ fontSize: 12, color: "#f7c948", fontWeight: 600, fontFamily: "'DM Sans',sans-serif", marginBottom: 2 }}>{c.service}</div>
                <div style={{ fontSize: 13, color: "var(--text-muted,#999)", fontFamily: "'DM Sans',sans-serif", whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>{c.lastMsg}</div>
              </div>
              {c.unread > 0 && <div style={{ width: 22, height: 22, borderRadius: 11, flexShrink: 0, background: "#e53e3e", color: "#fff", fontSize: 11, fontWeight: 700, display: "flex", alignItems: "center", justifyContent: "center" }}>{c.unread}</div>}
            </div>
          </FadeIn>
        ))}
      </div>
    </div>
  );
}

// ─── MAIN APP ───────────────────────────────────────
export default function TrampoJa() {
  const [screen, setScreen] = useState("login");
  const [user, setUser] = useState(null);
  const [selectedCategory, setSelectedCategory] = useState("all");
  const [selectedService, setSelectedService] = useState(null);
  const [chatWorker, setChatWorker] = useState(null);
  const [selectedWorker, setSelectedWorker] = useState(null);
  const [services, setServices] = useState(MOCK_SERVICES);
  const [notifications, setNotifications] = useState(MOCK_NOTIFICATIONS);
  const [showRating, setShowRating] = useState(false);
  const [ratingTarget, setRatingTarget] = useState(null);
  const [toast, setToast] = useState(null);
  const [history, setHistory] = useState([]);

  const unreadNotifs = notifications.filter(n => !n.read).length;
  const nav = s => { setHistory(p => [...p, screen]); setScreen(s); };
  const back = () => { if (history.length) { setScreen(history[history.length - 1]); setHistory(p => p.slice(0, -1)); } else setScreen("home"); };
  const showT = msg => { setToast(msg); setTimeout(() => setToast(null), 3000); };

  const handleLogin = (u) => {
    setUser(u);
    setScreen("home");
    setHistory([]);
    showT(`Bem-vindo(a), ${u.name.split(" ")[0]}! 👋`);
  };

  const handleRegister = (u) => {
    setUser(u);
    setScreen("home");
    setHistory([]);
    showT(`Conta criada com sucesso! Bem-vindo(a), ${u.name.split(" ")[0]}! 🎉`);
  };

  const handleLogout = () => {
    // Sign out of Firebase if active
    if (window.firebase?.auth) {
      try { window.firebase.auth().signOut(); } catch(e) {}
    }
    setUser(null);
    setScreen("login");
    setHistory([]);
    setSelectedCategory("all");
    setSelectedService(null);
  };

  return (
    <div style={{ maxWidth: 480, margin: "0 auto", minHeight: "100vh", fontFamily: "'DM Sans',sans-serif", background: "var(--bg,#f5f5f5)", color: "var(--text,#1a1a2e)", position: "relative", overflow: "hidden" }}>
      <link href="https://fonts.googleapis.com/css2?family=Archivo+Black&family=DM+Sans:wght@400;500;600;700;800&display=swap" rel="stylesheet" />

      {screen === "login" && <LoginScreen onLogin={handleLogin} onGoRegister={() => setScreen("register")} />}
      {screen === "register" && <RegisterScreen onRegister={handleRegister} onGoLogin={() => setScreen("login")} />}

      {screen === "home" && <HomeScreen services={services} selectedCategory={selectedCategory} setSelectedCategory={setSelectedCategory} onViewService={s => { setSelectedService(s); nav("detail"); }} onPost={() => nav("post")} onOpenChat={() => nav("chats")} onNotifications={() => nav("notifications")} onMap={() => nav("map")} unreadNotifs={unreadNotifs} myApplications={3} user={user} onLogout={handleLogout} />}
      {screen === "detail" && selectedService && <ServiceDetailScreen service={selectedService} onBack={back} onChat={w => { setChatWorker(w); nav("chat"); }} onViewWorker={w => { setSelectedWorker(w); nav("worker"); }} />}
      {screen === "chat" && <ChatScreen onBack={back} worker={chatWorker} />}
      {screen === "post" && <PostScreen onBack={back} user={user} onSubmit={s => { setServices(p => [s, ...p]); showT("Serviço publicado com sucesso! 🎉"); setScreen("home"); setHistory([]); }} />}
      {screen === "chats" && <ChatsListScreen onBack={back} onOpenChat={w => { setChatWorker(w); nav("chat"); }} />}
      {screen === "notifications" && <NotificationsScreen onBack={back} notifications={notifications} setNotifications={setNotifications} />}
      {screen === "map" && <MapScreen services={services} onBack={back} onViewService={s => { setSelectedService(s); nav("detail"); }} />}
      {screen === "worker" && selectedWorker && <WorkerProfile worker={selectedWorker} onBack={back} onChat={() => { setChatWorker(selectedWorker); nav("chat"); }} onRate={() => { setRatingTarget(selectedWorker); setShowRating(true); }} />}

      {showRating && <RatingModal worker={ratingTarget} onClose={() => setShowRating(false)} onSubmit={({ rating, text }) => { setShowRating(false); showT(`Avaliação de ${rating}★ enviada! Obrigado 🙏`); setNotifications(p => [{ id: Date.now(), type: "rating", title: "Avaliação enviada", body: `Você avaliou ${ratingTarget?.name} com ${rating} estrelas`, time: "Agora", read: true, icon: "⭐" }, ...p]); }} />}

      {toast && <div style={{ position: "fixed", top: 20, left: "50%", transform: "translateX(-50%)", background: "linear-gradient(135deg,#1a1a2e,#0f3460)", color: "#fff", padding: "14px 24px", borderRadius: 14, zIndex: 200, boxShadow: "0 8px 32px rgba(0,0,0,0.3)", fontFamily: "'DM Sans',sans-serif", fontSize: 14, fontWeight: 600, animation: "slideDown 0.3s ease", maxWidth: "90%", textAlign: "center" }}>{toast}</div>}

      <style>{`@keyframes slideDown { from { opacity:0; transform:translateX(-50%) translateY(-20px) } to { opacity:1; transform:translateX(-50%) translateY(0) } } * { -webkit-tap-highlight-color:transparent } ::-webkit-scrollbar { width:0; height:0 }`}</style>
    </div>
  );
}