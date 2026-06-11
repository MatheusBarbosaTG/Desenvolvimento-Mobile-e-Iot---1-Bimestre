import React, { useState, useEffect, useRef } from "react";
import {
  View, Text, ScrollView, TextInput, TouchableOpacity, Modal,
  Dimensions, StatusBar, KeyboardAvoidingView,
  Platform, ActivityIndicator,
} from "react-native";
import { LinearGradient } from "expo-linear-gradient";
import MapView, { Marker } from "react-native-maps";
import { initializeApp } from "firebase/app";
import {
  getAuth, signInWithEmailAndPassword, createUserWithEmailAndPassword,
  updateProfile, signOut, GoogleAuthProvider, signInWithCredential,
} from "firebase/auth";
import * as AuthSession from "expo-auth-session";
import * as WebBrowser from "expo-web-browser";

WebBrowser.maybeCompleteAuthSession();

const { width: SW } = Dimensions.get("window");

// ─── FIREBASE ───────────────────────────────────────
const FIREBASE_CONFIG = {
  apiKey: "AIzaSyDThAKgFahPQPoxDGFYypbd8a9S2fOlwCc",
  authDomain: "bico-ce6ad.firebaseapp.com",
  projectId: "bico-ce6ad",
  storageBucket: "bico-ce6ad.firebasestorage.app",
  messagingSenderId: "296586870145",
  appId: "1:296586870145:web:ad4491fcca8c521d27bc80",
};

let fbApp, fbAuth;
try { fbApp = initializeApp(FIREBASE_CONFIG); fbAuth = getAuth(fbApp); } catch (e) { console.log("Firebase init:", e); }

// Google OAuth — trampoJá Expo Web Client ID
const GOOGLE_CLIENT_ID = "296586870145-mt2d0kh0r84biahbkj8un45g67vv5mkt.apps.googleusercontent.com";

const googleDiscovery = {
  authorizationEndpoint: "https://accounts.google.com/o/oauth2/v2/auth",
  tokenEndpoint: "https://oauth2.googleapis.com/token",
  revocationEndpoint: "https://oauth2.googleapis.com/revoke",
};

const googleRedirectUri = AuthSession.makeRedirectUri({ useProxy: true });

function useGoogleAuth(onSuccess, onError) {
  const [loading, setLoading] = useState(false);
  const [request, response, promptAsync] = AuthSession.useAuthRequest(
    {
      clientId: GOOGLE_CLIENT_ID,
      redirectUri: googleRedirectUri,
      scopes: ["openid", "profile", "email"],
      responseType: AuthSession.ResponseType.IdToken,
    },
    googleDiscovery
  );

  useEffect(() => {
    if (response?.type === "success") {
      setLoading(true);
      const idToken = response.params.id_token;
      const credential = GoogleAuthProvider.credential(idToken);
      signInWithCredential(fbAuth, credential)
        .then(result => {
          const u = result.user;
          const initials = (u.displayName || "U").split(" ").map(w => w[0]).slice(0, 2).join("").toUpperCase();
          onSuccess({ email: u.email, name: u.displayName || u.email, avatar: initials, photoURL: u.photoURL, uid: u.uid, provider: "google" });
        })
        .catch(err => onError(`Erro Google: ${err.message}`))
        .finally(() => setLoading(false));
    } else if (response?.type === "error") {
      onError("Erro ao entrar com Google. Tente novamente.");
    }
  }, [response]);

  const trigger = () => promptAsync({ useProxy: true });
  return { trigger, loading, ready: !!request };
}

// ─── THEME ──────────────────────────────────────────
const C = {
  navy: "#1a1a2e", navyMid: "#16213e", navyDeep: "#0f3460",
  gold: "#f7c948", goldLight: "#f6ad55",
  green: "#48bb78", greenDark: "#38a169",
  red: "#e53e3e", redLight: "#fc8181",
  blue: "#4299e1", purple: "#9f7aea",
  white: "#fff", bg: "#f5f5f5",
  text: "#1a1a2e", textMuted: "#999", textSec: "#666",
  border: "#e8e8e8", borderLight: "#f0f0f0",
  cardBg: "#fff",
};

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
  { id: "churrasqueiro", label: "Churrasqueiro", icon: "🔥" },
  { id: "carreto", label: "Carreto", icon: "🚚" },
  { id: "manicure", label: "Manicure", icon: "💅" },
  { id: "cabelereiro", label: "Cabelereiro", icon: "💇" },
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
];

const MOCK_REVIEWS = [
  { id: 1, from: "Ana Carolina", avatar: "AC", rating: 5, text: "Excelente profissional! Pontual, trabalho impecável.", date: "12/03/2026", service: "Jardinagem" },
  { id: 2, from: "Marcos Oliveira", avatar: "MO", rating: 5, text: "Fez além do combinado. Muito caprichoso e educado.", date: "08/03/2026", service: "Limpeza" },
  { id: 3, from: "Fernanda Souza", avatar: "FS", rating: 4, text: "Bom trabalho, demorou um pouco mais que o previsto.", date: "01/03/2026", service: "Montagem" },
  { id: 4, from: "Juliana Matos", avatar: "JM", rating: 5, text: "Perfeito! Instalou tudo rápido e deu dicas de segurança.", date: "25/02/2026", service: "Elétrica" },
];

const MOCK_SERVICES = [
  { id: 1, category: "jardinagem", title: "Poda de árvores e limpeza", description: "Preciso podar 3 árvores de médio porte e limpeza geral do jardim.", budget: 250, duration: "4 horas", location: "Centro, Araxá", locIdx: 0, postedBy: { name: "Ana Carolina", avatar: "AC", rating: 4.8 }, postedAt: "2h atrás", applicants: 3, urgent: false },
  { id: 2, category: "encanador", title: "Vazamento na cozinha urgente", description: "Torneira vazando bastante, registro com problema.", budget: 180, duration: "2 horas", location: "Bauxita, Araxá", locIdx: 1, postedBy: { name: "Roberto Lima", avatar: "RL", rating: 4.5 }, postedAt: "45min", applicants: 7, urgent: true },
  { id: 3, category: "montador", title: "Montagem guarda-roupa e cômoda", description: "Guarda-roupa 6 portas e cômoda 5 gavetas Madesa.", budget: 300, duration: "5 horas", location: "São Geraldo, Araxá", locIdx: 2, postedBy: { name: "Fernanda Souza", avatar: "FS", rating: 4.9 }, postedAt: "1h", applicants: 5, urgent: false },
  { id: 4, category: "faxina", title: "Limpeza pós-obra 70m²", description: "Apartamento reformado, limpeza pesada. Materiais fornecidos.", budget: 350, duration: "6 horas", location: "Boa Vista, Araxá", locIdx: 3, postedBy: { name: "Marcos Oliveira", avatar: "MO", rating: 4.7 }, postedAt: "3h", applicants: 4, urgent: false },
  { id: 5, category: "eletricista", title: "Instalar 4 luminárias + 2 ventiladores", description: "Fiação pronta, só conexões e fixação.", budget: 280, duration: "3 horas", location: "Santa Rita, Araxá", locIdx: 4, postedBy: { name: "Juliana Matos", avatar: "JM", rating: 5.0 }, postedAt: "30min", applicants: 2, urgent: false },
  { id: 6, category: "churrasqueiro", title: "Churrasqueiro festa 30 pessoas", description: "Aniversário sábado. Carne e material comprados.", budget: 400, duration: "5 horas", location: "Jd. Natália, Araxá", locIdx: 5, postedBy: { name: "Diego Santos", avatar: "DS", rating: 4.6 }, postedAt: "5h", applicants: 8, urgent: false },
  { id: 7, category: "carreto", title: "Mudança sofá + geladeira + caixas", description: "Distância curta dentro de Araxá. Ambos térreo.", budget: 350, duration: "3 horas", location: "Vila Silvéria, Araxá", locIdx: 6, postedBy: { name: "Patrícia Nunes", avatar: "PN", rating: 4.3 }, postedAt: "1h", applicants: 6, urgent: true },
  { id: 8, category: "pintor", title: "Pintura 2 quartos + corredor", description: "Paredes lixadas. Tinta comprada. Trazer rolos e lonas.", budget: 500, duration: "2 dias", location: "Alvorada, Araxá", locIdx: 7, postedBy: { name: "Carlos Eduardo", avatar: "CE", rating: 4.8 }, postedAt: "4h", applicants: 3, urgent: false },
];

const MOCK_APPLICANTS = [
  { id: 1, name: "José Pereira", avatar: "JP", rating: 4.9, jobs: 127, specialty: "Jardinagem e paisagismo", price: "R$ 230", message: "Tenho 8 anos de experiência e trago todas as ferramentas.", reviews: MOCK_REVIEWS },
  { id: 2, name: "Antônio Silva", avatar: "AS", rating: 4.6, jobs: 84, specialty: "Jardinagem geral", price: "R$ 250", message: "Posso fazer amanhã cedo. Trabalho rápido e limpo.", reviews: MOCK_REVIEWS.slice(0, 2) },
  { id: 3, name: "Wagner Costa", avatar: "WC", rating: 4.7, jobs: 56, specialty: "Poda e limpeza", price: "R$ 270", message: "Especialista em poda. Certificação de arborista.", reviews: MOCK_REVIEWS.slice(1, 3) },
];

const MOCK_MESSAGES = [
  { id: 1, from: "worker", text: "Oi! Vi seu serviço e tenho interesse. Trabalho há 8 anos.", time: "14:02" },
  { id: 2, from: "client", text: "Ótimo! Você tem motosserra? Árvores de porte médio.", time: "14:05" },
  { id: 3, from: "worker", text: "Tenho sim! Motosserra Stihl. Posso ir amanhã 8h?", time: "14:06" },
  { id: 4, from: "client", text: "Perfeito! Mando o endereço por aqui.", time: "14:08" },
];

const MOCK_NOTIFICATIONS = [
  { id: 1, type: "applicant", title: "Novo candidato!", body: "José Pereira se candidatou para 'Poda de árvores'", time: "5min", read: false, icon: "👤" },
  { id: 2, type: "message", title: "Nova mensagem", body: "Antônio: 'Posso ir amanhã cedo...'", time: "12min", read: false, icon: "💬" },
  { id: 3, type: "rating", title: "Nova avaliação ⭐", body: "Ana Carolina te avaliou com 5 estrelas!", time: "1h", read: false, icon: "⭐" },
  { id: 4, type: "accepted", title: "Proposta aceita!", body: "Serviço 'Montagem de móveis' aceito", time: "2h", read: true, icon: "✅" },
  { id: 5, type: "reminder", title: "Lembrete", body: "Serviço 'Pintura' é amanhã às 8h", time: "5h", read: true, icon: "🔔" },
];

const DEMO_USERS = [{ email: "demo@trampoja.com", password: "demo123", name: "Usuário Demo", avatar: "UD" }];

const fmt = v => `R$ ${v}`;
const catColor = cat => ({ jardinagem: C.green, encanador: C.blue, eletricista: C.goldLight, montador: C.purple, pintor: C.redLight, faxina: "#68d391", churrasqueiro: "#f56565", carreto: "#ed8936" }[cat] || C.gold);

// ─── SHARED COMPONENTS ──────────────────────────────
function Ava({ initials, size = 40, colors = [C.navy, C.navyDeep], textColor = C.gold }) {
  return <LinearGradient colors={colors} style={{ width: size, height: size, borderRadius: size * 0.3, alignItems: "center", justifyContent: "center" }}><Text style={{ color: textColor, fontSize: size * 0.3, fontWeight: "800" }}>{initials}</Text></LinearGradient>;
}

function GradientHeader({ children }) {
  return <LinearGradient colors={[C.navy, C.navyMid, C.navyDeep]} start={{ x: 0, y: 0 }} end={{ x: 1, y: 1 }} style={{ paddingTop: 50, paddingHorizontal: 20, paddingBottom: 24 }}>{children}</LinearGradient>;
}

function BackButton({ onPress, label = "Voltar" }) {
  return <TouchableOpacity onPress={onPress} style={{ backgroundColor: "rgba(255,255,255,0.1)", borderRadius: 10, paddingVertical: 8, paddingHorizontal: 14, alignSelf: "flex-start", marginBottom: 12, flexDirection: "row", alignItems: "center" }}><Text style={{ color: C.white, fontSize: 13 }}>← {label}</Text></TouchableOpacity>;
}

function Card({ children, style, onPress }) {
  const Wrap = onPress ? TouchableOpacity : View;
  return <Wrap onPress={onPress} activeOpacity={0.7} style={[{ backgroundColor: C.cardBg, borderRadius: 16, padding: 18, borderWidth: 1, borderColor: C.border, shadowColor: "#000", shadowOpacity: 0.04, shadowRadius: 8, shadowOffset: { width: 0, height: 2 }, elevation: 2 }, style]}>{children}</Wrap>;
}

function BadgeIcon({ count }) { if (!count) return null; return <View style={{ position: "absolute", top: -5, right: -5, minWidth: 18, height: 18, borderRadius: 9, backgroundColor: C.red, alignItems: "center", justifyContent: "center", paddingHorizontal: 4, zIndex: 2 }}><Text style={{ color: C.white, fontSize: 10, fontWeight: "700" }}>{count}</Text></View>; }

function Stars({ rating, size = 16, interactive, onSelect }) {
  return <View style={{ flexDirection: "row", gap: 2 }}>{[1, 2, 3, 4, 5].map(i => <TouchableOpacity key={i} disabled={!interactive} onPress={() => onSelect?.(i)}><Text style={{ fontSize: size, opacity: (rating || 0) >= i ? 1 : 0.25 }}>⭐</Text></TouchableOpacity>)}</View>;
}

function ToastBanner({ message }) {
  if (!message) return null;
  return <View style={{ position: "absolute", top: 50, left: 20, right: 20, zIndex: 200 }}><LinearGradient colors={[C.navy, C.navyDeep]} style={{ paddingVertical: 14, paddingHorizontal: 24, borderRadius: 14, alignItems: "center", shadowColor: "#000", shadowOpacity: 0.3, shadowRadius: 16, elevation: 10 }}><Text style={{ color: C.white, fontSize: 14, fontWeight: "600", textAlign: "center" }}>{message}</Text></LinearGradient></View>;
}

function GoogleButton({ onPress, loading }) {
  return (
    <TouchableOpacity onPress={onPress} disabled={loading} activeOpacity={0.7} style={{ width: "100%", paddingVertical: 16, paddingHorizontal: 18, borderRadius: 14, borderWidth: 2, borderColor: "rgba(255,255,255,0.12)", backgroundColor: "rgba(255,255,255,0.06)", flexDirection: "row", alignItems: "center", justifyContent: "center", gap: 12, marginBottom: 16, opacity: loading ? 0.6 : 1 }}>
      {loading ? <ActivityIndicator size="small" color={C.white} /> : <Text style={{ fontSize: 20 }}>🔵</Text>}
      <Text style={{ fontSize: 15, fontWeight: "700", color: C.white }}>{loading ? "Conectando..." : "Continuar com Google"}</Text>
    </TouchableOpacity>
  );
}

function Divider({ text }) {
  return <View style={{ flexDirection: "row", alignItems: "center", gap: 14, marginBottom: 20 }}><View style={{ flex: 1, height: 1, backgroundColor: "rgba(255,255,255,0.1)" }} /><Text style={{ fontSize: 12, color: "rgba(255,255,255,0.3)" }}>{text}</Text><View style={{ flex: 1, height: 1, backgroundColor: "rgba(255,255,255,0.1)" }} /></View>;
}

// ─── RATING MODAL ───────────────────────────────────
function RatingModal({ visible, worker, onClose, onSubmit }) {
  const [rating, setRating] = useState(0);
  const [text, setText] = useState("");
  const handleSubmit = () => { if (rating) { onSubmit({ rating, text }); setRating(0); setText(""); } };
  const tags = rating >= 4 ? ["Pontual", "Caprichoso", "Educado", "Rápido", "Ótimo preço"] : rating > 0 ? ["Atrasou", "Pode melhorar", "OK"] : [];

  return (
    <Modal visible={visible} animationType="slide" transparent>
      <View style={{ flex: 1, justifyContent: "flex-end", backgroundColor: "rgba(0,0,0,0.6)" }}>
        <TouchableOpacity style={{ flex: 1 }} onPress={onClose} activeOpacity={1} />
        <View style={{ backgroundColor: C.cardBg, borderTopLeftRadius: 24, borderTopRightRadius: 24, padding: 24, paddingBottom: 36 }}>
          <View style={{ width: 40, height: 4, borderRadius: 2, backgroundColor: C.border, alignSelf: "center", marginBottom: 20 }} />
          <View style={{ alignItems: "center", marginBottom: 20 }}>
            <Ava initials={worker?.avatar || "JP"} size={56} colors={[C.green, C.greenDark]} textColor={C.white} />
            <Text style={{ fontSize: 18, fontWeight: "900", color: C.text, marginTop: 12 }}>Avaliar {worker?.name || "Profissional"}</Text>
            <Text style={{ fontSize: 13, color: C.textMuted, marginTop: 4 }}>Como foi a experiência?</Text>
          </View>
          <View style={{ alignItems: "center", marginBottom: 20 }}><Stars rating={rating} size={36} interactive onSelect={setRating} /></View>
          {rating > 0 && (
            <View style={{ marginBottom: 16 }}>
              <View style={{ flexDirection: "row", flexWrap: "wrap", justifyContent: "center", gap: 8, marginBottom: 14 }}>
                {tags.map(tag => <TouchableOpacity key={tag} onPress={() => setText(p => p ? p + ", " + tag.toLowerCase() : tag)} style={{ paddingVertical: 6, paddingHorizontal: 12, borderRadius: 20, borderWidth: 1, borderColor: C.border, backgroundColor: C.cardBg }}><Text style={{ fontSize: 12, color: C.text }}>{tag}</Text></TouchableOpacity>)}
              </View>
              <TextInput value={text} onChangeText={setText} placeholder="Conte como foi..." placeholderTextColor={C.textMuted} multiline numberOfLines={3} textAlignVertical="top" style={{ padding: 12, borderRadius: 12, borderWidth: 1, borderColor: C.border, fontSize: 14, backgroundColor: "#f7fafc", color: C.text, minHeight: 80 }} />
            </View>
          )}
          <TouchableOpacity onPress={handleSubmit} activeOpacity={0.8}><LinearGradient colors={rating ? [C.gold, C.goldLight] : ["#e2e8f0", "#e2e8f0"]} style={{ paddingVertical: 16, borderRadius: 14, alignItems: "center" }}><Text style={{ color: rating ? C.navy : "#a0aec0", fontSize: 16, fontWeight: "800" }}>{rating ? `Enviar avaliação (${rating}★)` : "Selecione uma nota"}</Text></LinearGradient></TouchableOpacity>
        </View>
      </View>
    </Modal>
  );
}

// ─── WORKER PROFILE ─────────────────────────────────
function WorkerProfile({ worker, onBack, onChat, onRate }) {
  const reviews = worker.reviews || MOCK_REVIEWS;
  const avg = reviews.length ? (reviews.reduce((a, r) => a + r.rating, 0) / reviews.length).toFixed(1) : "Novo";
  const dist = [5, 4, 3, 2, 1].map(s => ({ star: s, count: reviews.filter(r => r.rating === s).length }));
  const maxC = Math.max(...dist.map(d => d.count), 1);

  return (
    <View style={{ flex: 1, backgroundColor: C.bg }}>
      <GradientHeader>
        <BackButton onPress={onBack} />
        <View style={{ flexDirection: "row", alignItems: "center", gap: 14 }}>
          <Ava initials={worker.avatar} size={56} colors={[C.green, C.greenDark]} textColor={C.white} />
          <View style={{ flex: 1 }}><Text style={{ fontSize: 20, fontWeight: "900", color: C.white }}>{worker.name}</Text><Text style={{ fontSize: 13, color: "rgba(255,255,255,0.5)", marginTop: 4 }}>{worker.specialty} · {worker.jobs} serviços</Text></View>
        </View>
      </GradientHeader>
      <ScrollView contentContainerStyle={{ padding: 20, paddingBottom: 100 }}>
        <Card style={{ marginBottom: 16 }}>
          <View style={{ flexDirection: "row", gap: 20, alignItems: "center" }}>
            <View style={{ alignItems: "center", minWidth: 70 }}>
              <Text style={{ fontSize: 42, fontWeight: "900", color: C.gold, lineHeight: 46 }}>{avg}</Text>
              <Stars rating={Math.round(Number(avg))} size={14} />
              <Text style={{ fontSize: 11, color: C.textMuted, marginTop: 4 }}>{reviews.length} avaliações</Text>
            </View>
            <View style={{ flex: 1 }}>
              {dist.map(d => (
                <View key={d.star} style={{ flexDirection: "row", alignItems: "center", gap: 8, marginBottom: 5 }}>
                  <Text style={{ fontSize: 11, color: C.textMuted, width: 14, textAlign: "right" }}>{d.star}</Text>
                  <View style={{ flex: 1, height: 8, borderRadius: 4, backgroundColor: "#eee", overflow: "hidden" }}><View style={{ height: "100%", borderRadius: 4, backgroundColor: C.gold, width: `${(d.count / maxC) * 100}%` }} /></View>
                  <Text style={{ fontSize: 11, color: C.textMuted, width: 16 }}>{d.count}</Text>
                </View>
              ))}
            </View>
          </View>
        </Card>
        <View style={{ flexDirection: "row", gap: 10, marginBottom: 20 }}>
          {[{ l: "Serviços", v: worker.jobs, c: C.green }, { l: "Nota média", v: avg, c: C.gold }, { l: "Resposta", v: "~15min", c: C.blue }].map((s, i) => (
            <View key={i} style={{ flex: 1, backgroundColor: C.cardBg, borderWidth: 1, borderColor: C.border, borderRadius: 14, padding: 14, alignItems: "center" }}><Text style={{ fontSize: 11, color: C.textMuted, marginBottom: 4 }}>{s.l}</Text><Text style={{ fontSize: 18, fontWeight: "900", color: s.c }}>{s.v}</Text></View>
          ))}
        </View>
        <Text style={{ fontSize: 16, fontWeight: "900", color: C.text, marginBottom: 12 }}>Avaliações</Text>
        {reviews.map(r => (
          <Card key={r.id} style={{ marginBottom: 10 }}>
            <View style={{ flexDirection: "row", justifyContent: "space-between", alignItems: "center", marginBottom: 8 }}>
              <View style={{ flexDirection: "row", alignItems: "center", gap: 8 }}><Ava initials={r.avatar} size={32} /><View><Text style={{ fontWeight: "700", fontSize: 13, color: C.text }}>{r.from}</Text><Text style={{ fontSize: 11, color: C.textMuted }}>{r.service} · {r.date}</Text></View></View>
              <Stars rating={r.rating} size={12} />
            </View>
            <Text style={{ fontSize: 13, color: C.textSec, fontStyle: "italic", lineHeight: 20 }}>"{r.text}"</Text>
          </Card>
        ))}
      </ScrollView>
      <View style={{ paddingHorizontal: 20, paddingVertical: 14, backgroundColor: "rgba(255,255,255,0.95)", borderTopWidth: 1, borderTopColor: C.border, flexDirection: "row", gap: 10 }}>
        <TouchableOpacity onPress={onRate} style={{ flex: 1, paddingVertical: 14, borderRadius: 12, borderWidth: 2, borderColor: C.gold, alignItems: "center" }}><Text style={{ color: C.gold, fontSize: 14, fontWeight: "700" }}>⭐ Avaliar</Text></TouchableOpacity>
        <TouchableOpacity onPress={onChat} style={{ flex: 1 }}><LinearGradient colors={[C.navy, C.navyDeep]} style={{ paddingVertical: 14, borderRadius: 12, alignItems: "center" }}><Text style={{ color: C.gold, fontSize: 14, fontWeight: "700" }}>💬 Conversar</Text></LinearGradient></TouchableOpacity>
      </View>
    </View>
  );
}

// ─── LOGIN SCREEN ───────────────────────────────────
function LoginScreen({ onLogin, onGoRegister }) {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [errors, setErrors] = useState({});
  const [loading, setLoading] = useState(false);
  const [showPw, setShowPw] = useState(false);

  const google = useGoogleAuth(
    user => onLogin(user),
    msg => setErrors({ general: msg })
  );

  const validate = () => { const e = {}; if (!email.trim()) e.email = "Informe seu e-mail"; else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) e.email = "E-mail inválido"; if (!password) e.password = "Informe sua senha"; else if (password.length < 6) e.password = "Mínimo 6 caracteres"; setErrors(e); return Object.keys(e).length === 0; };

  const handleLogin = async () => {
    if (!validate()) return; setLoading(true); setErrors({});
    if (fbAuth) {
      try { const result = await signInWithEmailAndPassword(fbAuth, email.trim(), password); const u = result.user; const initials = (u.displayName || u.email).split(/[\s@]/).map(w => w[0]).slice(0, 2).join("").toUpperCase(); onLogin({ email: u.email, name: u.displayName || u.email.split("@")[0], avatar: initials, uid: u.uid, provider: "email" }); }
      catch (err) { const msgs = { "auth/invalid-credential": "E-mail ou senha incorretos.", "auth/user-not-found": "Nenhuma conta com este e-mail.", "auth/too-many-requests": "Muitas tentativas. Aguarde." }; setErrors({ general: msgs[err.code] || `Erro: ${err.message}` }); }
    } else { await new Promise(r => setTimeout(r, 800)); const user = DEMO_USERS.find(u => u.email.toLowerCase() === email.toLowerCase().trim() && u.password === password); if (user) onLogin(user); else setErrors({ general: "Incorretos. Demo: demo@trampoja.com / demo123" }); }
    setLoading(false);
  };

  const inputStyle = hasError => ({ width: "100%", padding: 16, borderRadius: 14, fontSize: 15, borderWidth: 2, borderColor: hasError ? C.red : "rgba(255,255,255,0.12)", backgroundColor: "rgba(255,255,255,0.06)", color: C.white });

  return (
    <LinearGradient colors={[C.navy, C.navyMid, C.navyDeep]} style={{ flex: 1 }}>
      <KeyboardAvoidingView behavior={Platform.OS === "ios" ? "padding" : "height"} style={{ flex: 1 }}>
        <ScrollView contentContainerStyle={{ flexGrow: 1, paddingHorizontal: 24 }} keyboardShouldPersistTaps="handled">
          <View style={{ flex: 1, justifyContent: "center", alignItems: "center", paddingTop: 80 }}>
            <LinearGradient colors={[C.gold, C.goldLight]} style={{ width: 80, height: 80, borderRadius: 24, alignItems: "center", justifyContent: "center", marginBottom: 20 }}><Text style={{ fontSize: 36 }}>🔧</Text></LinearGradient>
            <Text style={{ fontSize: 32, fontWeight: "900", color: C.white, letterSpacing: -1 }}>trampo<Text style={{ color: C.gold }}>já</Text></Text>
            <Text style={{ fontSize: 14, color: "rgba(255,255,255,0.45)", marginTop: 6 }}>Serviços na palma da mão · Araxá, MG</Text>
          </View>
          <View style={{ paddingBottom: 40 }}>
            {errors.general && <View style={{ backgroundColor: "rgba(229,62,62,0.15)", borderWidth: 1, borderColor: "rgba(229,62,62,0.3)", borderRadius: 12, padding: 14, marginBottom: 16 }}><Text style={{ fontSize: 13, color: C.redLight, lineHeight: 20 }}>⚠️ {errors.general}</Text></View>}
            <GoogleButton onPress={google.trigger} loading={google.loading} />
            <Divider text="ou entre com e-mail" />
            <Text style={{ fontSize: 13, fontWeight: "600", color: "rgba(255,255,255,0.6)", marginBottom: 8 }}>E-mail</Text>
            <TextInput value={email} onChangeText={t => { setEmail(t); setErrors(p => ({ ...p, email: undefined, general: undefined })); }} placeholder="seu@email.com" placeholderTextColor="rgba(255,255,255,0.25)" keyboardType="email-address" autoCapitalize="none" style={inputStyle(errors.email)} />
            {errors.email && <Text style={{ fontSize: 12, color: C.redLight, marginTop: 6, marginLeft: 4 }}>{errors.email}</Text>}
            <Text style={{ fontSize: 13, fontWeight: "600", color: "rgba(255,255,255,0.6)", marginBottom: 8, marginTop: 16 }}>Senha</Text>
            <View><TextInput value={password} onChangeText={t => { setPassword(t); setErrors(p => ({ ...p, password: undefined, general: undefined })); }} placeholder="Mínimo 6 caracteres" placeholderTextColor="rgba(255,255,255,0.25)" secureTextEntry={!showPw} style={[inputStyle(errors.password), { paddingRight: 50 }]} /><TouchableOpacity onPress={() => setShowPw(!showPw)} style={{ position: "absolute", right: 14, top: 14 }}><Text style={{ fontSize: 18 }}>{showPw ? "🙈" : "👁️"}</Text></TouchableOpacity></View>
            {errors.password && <Text style={{ fontSize: 12, color: C.redLight, marginTop: 6, marginLeft: 4 }}>{errors.password}</Text>}
            <TouchableOpacity onPress={handleLogin} disabled={loading} activeOpacity={0.8} style={{ marginTop: 24 }}><LinearGradient colors={loading ? ["rgba(247,201,72,0.5)", "rgba(247,201,72,0.5)"] : [C.gold, C.goldLight]} style={{ paddingVertical: 18, borderRadius: 14, alignItems: "center", flexDirection: "row", justifyContent: "center", gap: 10 }}>{loading && <ActivityIndicator size="small" color={C.navy} />}<Text style={{ color: C.navy, fontSize: 17, fontWeight: "800" }}>{loading ? "Entrando..." : "Entrar"}</Text></LinearGradient></TouchableOpacity>
            <View style={{ flexDirection: "row", justifyContent: "center", marginTop: 20 }}><Text style={{ fontSize: 14, color: "rgba(255,255,255,0.4)" }}>Não tem conta? </Text><TouchableOpacity onPress={onGoRegister}><Text style={{ fontSize: 14, color: C.gold, fontWeight: "700", textDecorationLine: "underline" }}>Criar conta</Text></TouchableOpacity></View>
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
    </LinearGradient>
  );
}

// ─── REGISTER SCREEN ────────────────────────────────
function RegisterScreen({ onRegister, onGoLogin }) {
  const [form, setForm] = useState({ name: "", email: "", password: "", confirm: "" });
  const [userType, setUserType] = useState("");
  const [errors, setErrors] = useState({});
  const [loading, setLoading] = useState(false);
  const upd = (k, v) => { setForm(p => ({ ...p, [k]: v })); setErrors(p => ({ ...p, [k]: undefined, general: undefined })); };

  const google = useGoogleAuth(
    user => { if (!userType) { setErrors({ userType: "Selecione perfil primeiro" }); return; } onRegister({ ...user, userType }); },
    msg => setErrors({ general: msg })
  );

  const validate = () => { const e = {}; if (!form.name.trim()) e.name = "Informe nome"; if (!form.email.trim()) e.email = "Informe e-mail"; else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.email)) e.email = "E-mail inválido"; if (!form.password) e.password = "Informe senha"; else if (form.password.length < 6) e.password = "Mín. 6 caracteres"; if (form.password !== form.confirm) e.confirm = "Senhas não conferem"; if (!userType) e.userType = "Selecione perfil"; setErrors(e); return Object.keys(e).length === 0; };

  const handleRegister = async () => {
    if (!validate()) return; setLoading(true); setErrors({});
    if (fbAuth) {
      try { const result = await createUserWithEmailAndPassword(fbAuth, form.email.trim(), form.password); await updateProfile(result.user, { displayName: form.name.trim() }); const initials = form.name.trim().split(" ").map(w => w[0]).slice(0, 2).join("").toUpperCase(); onRegister({ email: result.user.email, name: form.name.trim(), avatar: initials, uid: result.user.uid, userType, provider: "email" }); }
      catch (err) { const msgs = { "auth/email-already-in-use": "E-mail já cadastrado.", "auth/weak-password": "Senha fraca." }; setErrors({ general: msgs[err.code] || `Erro: ${err.message}` }); }
    } else { await new Promise(r => setTimeout(r, 800)); const initials = form.name.trim().split(" ").map(w => w[0]).slice(0, 2).join("").toUpperCase(); onRegister({ email: form.email, name: form.name.trim(), avatar: initials, userType }); }
    setLoading(false);
  };

  const inputStyle = hasError => ({ width: "100%", padding: 16, borderRadius: 14, fontSize: 15, borderWidth: 2, borderColor: hasError ? C.red : "rgba(255,255,255,0.12)", backgroundColor: "rgba(255,255,255,0.06)", color: C.white, marginBottom: 4 });

  return (
    <LinearGradient colors={[C.navy, C.navyMid, C.navyDeep]} style={{ flex: 1 }}>
      <KeyboardAvoidingView behavior={Platform.OS === "ios" ? "padding" : "height"} style={{ flex: 1 }}>
        <ScrollView contentContainerStyle={{ paddingHorizontal: 24, paddingTop: 50, paddingBottom: 40 }} keyboardShouldPersistTaps="handled">
          <BackButton onPress={onGoLogin} label="Voltar ao login" />
          <Text style={{ fontSize: 26, fontWeight: "900", color: C.white, marginBottom: 6 }}>Criar <Text style={{ color: C.gold }}>conta</Text></Text>
          <Text style={{ fontSize: 14, color: "rgba(255,255,255,0.45)", marginBottom: 24 }}>Junte-se ao trampoJá em Araxá</Text>
          {errors.general && <View style={{ backgroundColor: "rgba(229,62,62,0.15)", borderRadius: 12, padding: 14, marginBottom: 16 }}><Text style={{ fontSize: 13, color: C.redLight }}>⚠️ {errors.general}</Text></View>}
          <Text style={{ fontSize: 13, fontWeight: "600", color: "rgba(255,255,255,0.6)", marginBottom: 10 }}>Eu quero... {errors.userType ? <Text style={{ color: C.redLight }}>({errors.userType})</Text> : ""}</Text>
          <View style={{ flexDirection: "row", gap: 10, marginBottom: 20 }}>
            {[{ id: "client", icon: "📋", desc: "Sou cliente" }, { id: "worker", icon: "🔧", desc: "Sou profissional" }].map(t => (
              <TouchableOpacity key={t.id} onPress={() => { setUserType(t.id); setErrors(p => ({ ...p, userType: undefined })); }} style={{ flex: 1, padding: 16, borderRadius: 14, borderWidth: 2, borderColor: userType === t.id ? C.gold : "rgba(255,255,255,0.1)", backgroundColor: userType === t.id ? "rgba(247,201,72,0.1)" : "rgba(255,255,255,0.03)", alignItems: "center" }}><Text style={{ fontSize: 28, marginBottom: 6 }}>{t.icon}</Text><Text style={{ fontSize: 13, fontWeight: "700", color: userType === t.id ? C.gold : C.white }}>{t.desc}</Text></TouchableOpacity>
            ))}
          </View>
          <GoogleButton onPress={google.trigger} loading={google.loading} />
          <Divider text="ou preencha abaixo" />
          {[{ k: "name", label: "Nome completo", ph: "Seu nome" }, { k: "email", label: "E-mail", ph: "seu@email.com", kb: "email-address" }, { k: "password", label: "Senha", ph: "Mínimo 6 caracteres", secure: true }, { k: "confirm", label: "Confirmar senha", ph: "Repita a senha", secure: true }].map(f => (
            <View key={f.k} style={{ marginBottom: 10 }}><Text style={{ fontSize: 13, fontWeight: "600", color: "rgba(255,255,255,0.6)", marginBottom: 8 }}>{f.label}</Text><TextInput value={form[f.k]} onChangeText={t => upd(f.k, t)} placeholder={f.ph} placeholderTextColor="rgba(255,255,255,0.25)" keyboardType={f.kb || "default"} secureTextEntry={f.secure} autoCapitalize={f.kb === "email-address" ? "none" : "words"} style={inputStyle(errors[f.k])} />{errors[f.k] && <Text style={{ fontSize: 12, color: C.redLight, marginLeft: 4 }}>{errors[f.k]}</Text>}</View>
          ))}
          <TouchableOpacity onPress={handleRegister} disabled={loading} activeOpacity={0.8} style={{ marginTop: 10 }}><LinearGradient colors={loading ? ["rgba(247,201,72,0.5)", "rgba(247,201,72,0.5)"] : [C.gold, C.goldLight]} style={{ paddingVertical: 18, borderRadius: 14, alignItems: "center", flexDirection: "row", justifyContent: "center", gap: 10 }}>{loading && <ActivityIndicator size="small" color={C.navy} />}<Text style={{ color: C.navy, fontSize: 17, fontWeight: "800" }}>{loading ? "Criando..." : "Criar conta"}</Text></LinearGradient></TouchableOpacity>
        </ScrollView>
      </KeyboardAvoidingView>
    </LinearGradient>
  );
}

// ─── HOME SCREEN ────────────────────────────────────
function HomeScreen({ services, selectedCategory, setSelectedCategory, onViewService, onPost, onOpenChat, onNotifications, onMap, unreadNotifs, user, onLogout }) {
  const filtered = selectedCategory === "all" ? services : services.filter(s => s.category === selectedCategory);
  const [menuOpen, setMenuOpen] = useState(false);
  return (
    <View style={{ flex: 1, backgroundColor: C.bg }}>
      <LinearGradient colors={[C.navy, C.navyMid, C.navyDeep]} style={{ paddingTop: 50, paddingHorizontal: 20, paddingBottom: 20 }}>
        <View style={{ flexDirection: "row", justifyContent: "space-between", alignItems: "center", marginBottom: 16 }}>
          <View><Text style={{ fontSize: 22, fontWeight: "900", color: C.white }}>trampo<Text style={{ color: C.gold }}>já</Text></Text><Text style={{ fontSize: 12, color: "rgba(255,255,255,0.5)", marginTop: 2 }}>Olá, {user?.name?.split(" ")[0] || "Usuário"}!</Text></View>
          <View style={{ flexDirection: "row", gap: 8, alignItems: "center" }}>
            {[{ icon: "📍", action: onMap }, { icon: "🔔", action: onNotifications, badge: unreadNotifs }, { icon: "💬", action: onOpenChat, badge: 3 }].map((b, i) => <TouchableOpacity key={i} onPress={b.action} style={{ width: 40, height: 40, borderRadius: 12, borderWidth: 1, borderColor: "rgba(255,255,255,0.15)", backgroundColor: "rgba(255,255,255,0.08)", alignItems: "center", justifyContent: "center" }}><Text style={{ fontSize: 18 }}>{b.icon}</Text><BadgeIcon count={b.badge} /></TouchableOpacity>)}
            <TouchableOpacity onPress={() => setMenuOpen(!menuOpen)}><LinearGradient colors={[C.gold, C.goldLight]} style={{ width: 40, height: 40, borderRadius: 12, alignItems: "center", justifyContent: "center" }}><Text style={{ fontSize: 14, fontWeight: "800", color: C.navy }}>{user?.avatar || "EU"}</Text></LinearGradient></TouchableOpacity>
          </View>
        </View>
        <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={{ gap: 8 }}>{CATEGORIES.map(c => <TouchableOpacity key={c.id} onPress={() => setSelectedCategory(c.id)} style={{ flexDirection: "row", alignItems: "center", gap: 6, paddingVertical: 8, paddingHorizontal: 14, borderRadius: 20, backgroundColor: selectedCategory === c.id ? C.gold : "rgba(255,255,255,0.06)", borderWidth: selectedCategory === c.id ? 0 : 1, borderColor: "rgba(255,255,255,0.15)" }}><Text style={{ fontSize: 14 }}>{c.icon}</Text><Text style={{ fontSize: 13, fontWeight: selectedCategory === c.id ? "700" : "500", color: selectedCategory === c.id ? C.navy : "rgba(255,255,255,0.7)" }}>{c.label}</Text></TouchableOpacity>)}</ScrollView>
      </LinearGradient>
      {menuOpen && <View style={{ position: "absolute", top: 100, right: 20, zIndex: 100, backgroundColor: C.cardBg, borderRadius: 12, shadowColor: "#000", shadowOpacity: 0.2, shadowRadius: 16, elevation: 10, overflow: "hidden", minWidth: 180, borderWidth: 1, borderColor: C.border }}><View style={{ padding: 14, borderBottomWidth: 1, borderBottomColor: C.borderLight }}><Text style={{ fontWeight: "700", fontSize: 14, color: C.text }}>{user?.name}</Text><Text style={{ fontSize: 12, color: C.textMuted }}>{user?.email}</Text></View><TouchableOpacity onPress={() => { setMenuOpen(false); onLogout(); }} style={{ padding: 12, paddingHorizontal: 16 }}><Text style={{ fontSize: 14, color: C.red, fontWeight: "600" }}>🚪 Sair da conta</Text></TouchableOpacity></View>}
      <ScrollView contentContainerStyle={{ paddingBottom: 100 }}>
        <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={{ padding: 16, gap: 12 }}>{[{ n: "142", l: "serviços ativos", c: C.green }, { n: "38", l: "fechados hoje", c: C.gold }, { n: "4.7★", l: "satisfação", c: "#ed8936" }].map((s, i) => <View key={i} style={{ padding: 12, paddingHorizontal: 16, borderRadius: 14, backgroundColor: C.cardBg, borderWidth: 1, borderColor: C.border, minWidth: 110 }}><Text style={{ fontSize: 20, fontWeight: "900", color: s.c }}>{s.n}</Text><Text style={{ fontSize: 11, color: C.textMuted, marginTop: 2 }}>{s.l}</Text></View>)}</ScrollView>
        <View style={{ paddingHorizontal: 20 }}>
          <View style={{ flexDirection: "row", justifyContent: "space-between", marginBottom: 12 }}><Text style={{ fontSize: 16, fontWeight: "900", color: C.text }}>{selectedCategory === "all" ? "Todos os serviços" : CATEGORIES.find(c => c.id === selectedCategory)?.label}</Text><Text style={{ fontSize: 12, color: C.textMuted }}>{filtered.length} disponíveis</Text></View>
          {filtered.map(s => (
            <Card key={s.id} onPress={() => onViewService(s)} style={{ marginBottom: 12, overflow: "hidden" }}>
              {s.urgent && <View style={{ position: "absolute", top: 14, right: 14, paddingVertical: 4, paddingHorizontal: 10, borderRadius: 8, backgroundColor: "#fed7d7" }}><Text style={{ fontSize: 11, fontWeight: "700", color: "#c53030" }}>URGENTE</Text></View>}
              <View style={{ flexDirection: "row", gap: 12, marginBottom: 12 }}><View style={{ width: 44, height: 44, borderRadius: 12, backgroundColor: "#edf2f7", alignItems: "center", justifyContent: "center" }}><Text style={{ fontSize: 22 }}>{CATEGORIES.find(c => c.id === s.category)?.icon}</Text></View><View style={{ flex: 1 }}><Text style={{ fontWeight: "700", fontSize: 15, color: C.text, lineHeight: 20 }}>{s.title}</Text><Text style={{ fontSize: 12, color: C.textMuted, marginTop: 4 }}>📍 {s.location} · ⏱ {s.duration}</Text></View></View>
              <Text numberOfLines={2} style={{ fontSize: 13, color: C.textSec, lineHeight: 20, marginBottom: 14 }}>{s.description}</Text>
              <View style={{ borderTopWidth: 1, borderTopColor: C.borderLight, paddingTop: 12, flexDirection: "row", justifyContent: "space-between", alignItems: "center" }}><View style={{ flexDirection: "row", alignItems: "center", gap: 8 }}><Ava initials={s.postedBy.avatar} size={28} /><View><Text style={{ fontSize: 12, fontWeight: "600", color: C.text }}>{s.postedBy.name}</Text><Text style={{ fontSize: 10, color: C.textMuted }}>⭐ {s.postedBy.rating} · {s.postedAt}</Text></View></View><View style={{ alignItems: "flex-end" }}><Text style={{ fontSize: 18, fontWeight: "900", color: C.green }}>{fmt(s.budget)}</Text><Text style={{ fontSize: 10, color: C.textMuted }}>{s.applicants} interessados</Text></View></View>
            </Card>
          ))}
        </View>
      </ScrollView>
      <TouchableOpacity onPress={onPost} activeOpacity={0.8} style={{ position: "absolute", bottom: 24, right: 24, zIndex: 30 }}><LinearGradient colors={[C.gold, C.goldLight]} style={{ width: 60, height: 60, borderRadius: 18, alignItems: "center", justifyContent: "center", shadowColor: C.gold, shadowOpacity: 0.4, shadowRadius: 12, elevation: 8 }}><Text style={{ fontSize: 28, color: C.navy }}>+</Text></LinearGradient></TouchableOpacity>
    </View>
  );
}

// ─── SERVICE DETAIL ─────────────────────────────────
function DetailScreen({ service, onBack, onChat, onViewWorker }) {
  const [applied, setApplied] = useState(false);
  const cat = CATEGORIES.find(c => c.id === service.category);
  return (
    <View style={{ flex: 1, backgroundColor: C.bg }}>
      <GradientHeader><BackButton onPress={onBack} /><View style={{ flexDirection: "row", alignItems: "center", gap: 12 }}><View style={{ width: 50, height: 50, borderRadius: 14, backgroundColor: "rgba(255,255,255,0.1)", alignItems: "center", justifyContent: "center" }}><Text style={{ fontSize: 26 }}>{cat?.icon}</Text></View><View style={{ flex: 1 }}><Text style={{ fontSize: 11, color: C.gold, fontWeight: "700", textTransform: "uppercase", letterSpacing: 1 }}>{cat?.label}</Text><Text style={{ fontSize: 20, fontWeight: "900", color: C.white }}>{service.title}</Text></View></View>{service.urgent && <View style={{ marginTop: 10, backgroundColor: "rgba(229,62,62,0.2)", paddingVertical: 5, paddingHorizontal: 12, borderRadius: 8, alignSelf: "flex-start" }}><Text style={{ fontSize: 12, fontWeight: "700", color: C.redLight }}>⚡ URGENTE</Text></View>}</GradientHeader>
      <ScrollView contentContainerStyle={{ padding: 20, paddingBottom: 100 }}>
        <View style={{ flexDirection: "row", gap: 10, marginBottom: 20 }}>{[{ l: "Valor", v: fmt(service.budget), c: C.green }, { l: "Duração", v: service.duration, c: C.gold }, { l: "Interessados", v: `${service.applicants}`, c: "#ed8936" }].map((it, i) => <View key={i} style={{ flex: 1, backgroundColor: C.cardBg, borderWidth: 1, borderColor: C.border, borderRadius: 14, padding: 14, alignItems: "center" }}><Text style={{ fontSize: 11, color: C.textMuted, marginBottom: 4 }}>{it.l}</Text><Text style={{ fontSize: 16, fontWeight: "900", color: it.c }}>{it.v}</Text></View>)}</View>
        <Card style={{ marginBottom: 16 }}><Text style={{ fontWeight: "700", fontSize: 14, color: C.text, marginBottom: 10 }}>Descrição</Text><Text style={{ fontSize: 14, color: C.textSec, lineHeight: 22 }}>{service.description}</Text></Card>
        <Card style={{ marginBottom: 20 }}><Text style={{ fontWeight: "700", fontSize: 14, color: C.text, marginBottom: 12 }}>Publicado por</Text><View style={{ flexDirection: "row", alignItems: "center", gap: 12 }}><Ava initials={service.postedBy.avatar} size={48} /><View><Text style={{ fontWeight: "700", fontSize: 15, color: C.text }}>{service.postedBy.name}</Text><Text style={{ fontSize: 12, color: C.textMuted }}>⭐ {service.postedBy.rating}</Text></View></View></Card>
        <Text style={{ fontSize: 16, fontWeight: "900", color: C.text, marginBottom: 12 }}>Candidatos</Text>
        {MOCK_APPLICANTS.map(a => (
          <Card key={a.id} style={{ marginBottom: 10 }}>
            <View style={{ flexDirection: "row", justifyContent: "space-between", alignItems: "center", marginBottom: 10 }}>
              <TouchableOpacity onPress={() => onViewWorker(a)} style={{ flexDirection: "row", alignItems: "center", gap: 10 }}><Ava initials={a.avatar} size={40} colors={[C.green, C.greenDark]} textColor={C.white} /><View><Text style={{ fontWeight: "700", fontSize: 14, color: C.text, textDecorationLine: "underline" }}>{a.name}</Text><Text style={{ fontSize: 11, color: C.textMuted }}>⭐ {a.rating} · {a.jobs} serviços</Text></View></TouchableOpacity>
              <Text style={{ fontSize: 15, fontWeight: "900", color: C.green }}>{a.price}</Text>
            </View>
            <View style={{ backgroundColor: "#f7fafc", padding: 10, borderRadius: 10, marginBottom: 12 }}><Text style={{ fontSize: 13, color: C.textSec, fontStyle: "italic" }}>"{a.message}"</Text></View>
            <View style={{ flexDirection: "row", gap: 8 }}>
              <TouchableOpacity onPress={() => onChat(a)} style={{ flex: 1 }}><LinearGradient colors={[C.navy, C.navyDeep]} style={{ paddingVertical: 10, borderRadius: 10, alignItems: "center" }}><Text style={{ color: C.gold, fontSize: 13, fontWeight: "700" }}>💬 Conversar</Text></LinearGradient></TouchableOpacity>
              <TouchableOpacity style={{ flex: 1, paddingVertical: 10, borderRadius: 10, borderWidth: 2, borderColor: C.green, alignItems: "center" }}><Text style={{ color: C.green, fontSize: 13, fontWeight: "700" }}>✓ Aceitar</Text></TouchableOpacity>
            </View>
          </Card>
        ))}
      </ScrollView>
      <View style={{ paddingHorizontal: 20, paddingVertical: 16, backgroundColor: "rgba(255,255,255,0.95)", borderTopWidth: 1, borderTopColor: C.border }}>
        {!applied ? <TouchableOpacity onPress={() => setApplied(true)} activeOpacity={0.8}><LinearGradient colors={[C.gold, C.goldLight]} style={{ paddingVertical: 16, borderRadius: 14, alignItems: "center" }}><Text style={{ color: C.navy, fontSize: 16, fontWeight: "800" }}>Tenho interesse nesse trampo!</Text></LinearGradient></TouchableOpacity>
          : <View style={{ alignItems: "center" }}><Text style={{ color: C.green, fontSize: 16, fontWeight: "900" }}>✅ Candidatura enviada!</Text><Text style={{ fontSize: 12, color: C.textMuted, marginTop: 4 }}>Aguarde o contato</Text></View>}
      </View>
    </View>
  );
}

// ─── CHAT ───────────────────────────────────────────
function ChatScreen({ onBack, worker }) {
  const [messages, setMessages] = useState(MOCK_MESSAGES);
  const [input, setInput] = useState("");
  const scrollRef = useRef(null);
  const send = () => { if (!input.trim()) return; setMessages(p => [...p, { id: Date.now(), from: "client", text: input.trim(), time: new Date().toLocaleTimeString("pt-BR", { hour: "2-digit", minute: "2-digit" }) }]); setInput(""); };
  useEffect(() => { setTimeout(() => scrollRef.current?.scrollToEnd({ animated: true }), 100); }, [messages]);
  return (
    <View style={{ flex: 1, backgroundColor: C.bg }}>
      <LinearGradient colors={[C.navy, C.navyDeep]} style={{ paddingTop: 50, paddingHorizontal: 20, paddingBottom: 16, flexDirection: "row", alignItems: "center", gap: 12 }}><TouchableOpacity onPress={onBack} style={{ backgroundColor: "rgba(255,255,255,0.1)", borderRadius: 10, padding: 8 }}><Text style={{ color: C.white, fontSize: 14 }}>←</Text></TouchableOpacity><Ava initials={worker?.avatar || "JP"} size={40} colors={[C.green, C.greenDark]} textColor={C.white} /><View><Text style={{ fontWeight: "700", fontSize: 15, color: C.white }}>{worker?.name || "José Pereira"}</Text><Text style={{ fontSize: 11, color: "rgba(255,255,255,0.5)" }}>⭐ {worker?.rating || "4.9"} · Online</Text></View></LinearGradient>
      <ScrollView ref={scrollRef} contentContainerStyle={{ padding: 20, gap: 10 }} style={{ flex: 1, backgroundColor: "#f8f9fa" }}>
        <View style={{ alignSelf: "center", paddingVertical: 6, paddingHorizontal: 14, borderRadius: 20, backgroundColor: C.cardBg, borderWidth: 1, borderColor: C.border }}><Text style={{ fontSize: 11, color: C.textMuted }}>Hoje</Text></View>
        {messages.map(m => <View key={m.id} style={{ alignSelf: m.from === "client" ? "flex-end" : "flex-start", maxWidth: "80%" }}><LinearGradient colors={m.from === "client" ? [C.navy, C.navyDeep] : [C.cardBg, C.cardBg]} style={{ padding: 12, paddingHorizontal: 16, borderRadius: 16, borderBottomRightRadius: m.from === "client" ? 4 : 16, borderBottomLeftRadius: m.from === "worker" ? 4 : 16, borderWidth: m.from === "worker" ? 1 : 0, borderColor: C.border }}><Text style={{ fontSize: 14, color: m.from === "client" ? C.white : C.text, lineHeight: 20 }}>{m.text}</Text></LinearGradient><Text style={{ fontSize: 10, color: C.textMuted, marginTop: 4, textAlign: m.from === "client" ? "right" : "left" }}>{m.time}</Text></View>)}
      </ScrollView>
      <KeyboardAvoidingView behavior={Platform.OS === "ios" ? "padding" : undefined}><View style={{ padding: 12, paddingHorizontal: 16, backgroundColor: C.cardBg, borderTopWidth: 1, borderTopColor: C.border, flexDirection: "row", gap: 10 }}><TextInput value={input} onChangeText={setInput} onSubmitEditing={send} placeholder="Digite sua mensagem..." placeholderTextColor={C.textMuted} style={{ flex: 1, padding: 12, paddingHorizontal: 16, borderRadius: 12, borderWidth: 1, borderColor: "#e2e8f0", fontSize: 14, backgroundColor: "#f7fafc", color: C.text }} /><TouchableOpacity onPress={send} activeOpacity={0.7}><LinearGradient colors={input.trim() ? [C.gold, C.goldLight] : ["#e2e8f0", "#e2e8f0"]} style={{ width: 48, height: 48, borderRadius: 12, alignItems: "center", justifyContent: "center" }}><Text style={{ fontSize: 20, color: input.trim() ? C.navy : "#a0aec0" }}>↑</Text></LinearGradient></TouchableOpacity></View></KeyboardAvoidingView>
    </View>
  );
}

// ─── POST, MAP, NOTIFICATIONS, CHATS ────────────────
function PostScreen({ onBack, onSubmit, user }) {
  const [f, setF] = useState({ title: "", category: "", description: "", budget: "", duration: "", location: "" });
  const upd = (k, v) => setF(p => ({ ...p, [k]: v })); const valid = f.title && f.category && f.description && f.budget;
  return (
    <View style={{ flex: 1, backgroundColor: C.bg }}><GradientHeader><BackButton onPress={onBack} /><Text style={{ fontSize: 22, fontWeight: "900", color: C.white }}>Publicar <Text style={{ color: C.gold }}>trampo</Text></Text><Text style={{ fontSize: 13, color: "rgba(255,255,255,0.5)", marginTop: 6 }}>Descreva o serviço que você precisa</Text></GradientHeader>
      <KeyboardAvoidingView behavior={Platform.OS === "ios" ? "padding" : undefined} style={{ flex: 1 }}><ScrollView contentContainerStyle={{ padding: 20, gap: 16, paddingBottom: 40 }} keyboardShouldPersistTaps="handled">
        <View><Text style={{ fontSize: 13, fontWeight: "700", color: C.text, marginBottom: 8 }}>Categoria *</Text><View style={{ flexDirection: "row", flexWrap: "wrap", gap: 8 }}>{CATEGORIES.filter(c => c.id !== "all").map(c => <TouchableOpacity key={c.id} onPress={() => upd("category", c.id)} style={{ flexDirection: "row", alignItems: "center", gap: 6, paddingVertical: 8, paddingHorizontal: 12, borderRadius: 10, borderWidth: f.category === c.id ? 2 : 1, borderColor: f.category === c.id ? C.gold : "#e2e8f0", backgroundColor: f.category === c.id ? "#fffdf0" : C.cardBg }}><Text>{c.icon}</Text><Text style={{ fontSize: 12, fontWeight: f.category === c.id ? "700" : "400", color: C.text }}>{c.label}</Text></TouchableOpacity>)}</View></View>
        {[{ k: "title", l: "Título *", ph: "Ex: Montagem de guarda-roupa" }, { k: "location", l: "Local", ph: "Bairro, Araxá" }].map(field => <View key={field.k}><Text style={{ fontSize: 13, fontWeight: "700", color: C.text, marginBottom: 8 }}>{field.l}</Text><TextInput value={f[field.k]} onChangeText={t => upd(field.k, t)} placeholder={field.ph} placeholderTextColor={C.textMuted} style={{ padding: 14, borderRadius: 12, borderWidth: 1, borderColor: "#e2e8f0", fontSize: 14, backgroundColor: C.cardBg, color: C.text }} /></View>)}
        <View><Text style={{ fontSize: 13, fontWeight: "700", color: C.text, marginBottom: 8 }}>Descrição *</Text><TextInput value={f.description} onChangeText={t => upd("description", t)} placeholder="Descreva o serviço..." placeholderTextColor={C.textMuted} multiline numberOfLines={4} textAlignVertical="top" style={{ padding: 14, borderRadius: 12, borderWidth: 1, borderColor: "#e2e8f0", fontSize: 14, backgroundColor: C.cardBg, color: C.text, minHeight: 100 }} /></View>
        <View style={{ flexDirection: "row", gap: 12 }}>{[{ k: "budget", l: "Valor (R$) *", ph: "250", kb: "numeric" }, { k: "duration", l: "Duração", ph: "4 horas" }].map(field => <View key={field.k} style={{ flex: 1 }}><Text style={{ fontSize: 13, fontWeight: "700", color: C.text, marginBottom: 8 }}>{field.l}</Text><TextInput value={f[field.k]} onChangeText={t => upd(field.k, t)} placeholder={field.ph} placeholderTextColor={C.textMuted} keyboardType={field.kb || "default"} style={{ padding: 14, borderRadius: 12, borderWidth: 1, borderColor: "#e2e8f0", fontSize: 14, backgroundColor: C.cardBg, color: C.text }} /></View>)}</View>
        <TouchableOpacity onPress={() => { if (!valid) return; onSubmit({ id: Date.now(), category: f.category, title: f.title, description: f.description, budget: Number(f.budget), duration: f.duration || "A combinar", location: f.location || "A combinar", locIdx: Math.floor(Math.random() * ARAXA_LOCATIONS.length), postedBy: { name: user?.name || "Você", avatar: user?.avatar || "EU", rating: "Novo" }, postedAt: "Agora", applicants: 0, urgent: false }); }} activeOpacity={0.8}><LinearGradient colors={valid ? [C.gold, C.goldLight] : ["#e2e8f0", "#e2e8f0"]} style={{ paddingVertical: 16, borderRadius: 14, alignItems: "center", marginTop: 8 }}><Text style={{ color: valid ? C.navy : "#a0aec0", fontSize: 16, fontWeight: "800" }}>Publicar serviço</Text></LinearGradient></TouchableOpacity>
      </ScrollView></KeyboardAvoidingView></View>
  );
}

function MapScreen({ services, onBack, onViewService }) {
  const [selected, setSelected] = useState(null); const mapRef = useRef(null);
  const pins = services.map(s => ({ ...s, loc: ARAXA_LOCATIONS[s.locIdx] || ARAXA_LOCATIONS[0] }));
  return (
    <View style={{ flex: 1 }}><GradientHeader><BackButton onPress={onBack} /><Text style={{ fontSize: 20, fontWeight: "900", color: C.white }}>Mapa de <Text style={{ color: C.gold }}>serviços</Text></Text><Text style={{ fontSize: 12, color: "rgba(255,255,255,0.4)", marginTop: 4 }}>{services.length} serviços em Araxá</Text></GradientHeader>
      <MapView ref={mapRef} style={{ flex: 1 }} initialRegion={{ latitude: -19.5932, longitude: -46.9406, latitudeDelta: 0.04, longitudeDelta: 0.04 }}>
        {pins.map(pin => <Marker key={pin.id} coordinate={{ latitude: pin.loc.lat, longitude: pin.loc.lng }} onPress={() => { setSelected(pin); mapRef.current?.animateToRegion({ latitude: pin.loc.lat, longitude: pin.loc.lng, latitudeDelta: 0.015, longitudeDelta: 0.015 }, 500); }}><View style={{ alignItems: "center" }}><View style={{ width: 36, height: 36, borderRadius: 18, backgroundColor: catColor(pin.category), borderWidth: 3, borderColor: C.white, alignItems: "center", justifyContent: "center", shadowColor: "#000", shadowOpacity: 0.3, shadowRadius: 6, elevation: 5 }}><Text style={{ fontSize: 16 }}>{CATEGORIES.find(c => c.id === pin.category)?.icon}</Text></View><View style={{ marginTop: 4, backgroundColor: "rgba(0,0,0,0.75)", paddingVertical: 2, paddingHorizontal: 8, borderRadius: 6 }}><Text style={{ fontSize: 10, fontWeight: "700", color: C.white }}>{fmt(pin.budget)}</Text></View></View></Marker>)}
      </MapView>
      {selected && <View style={{ position: "absolute", bottom: 0, left: 0, right: 0, padding: 16 }}><Card onPress={() => onViewService(selected)} style={{ shadowColor: "#000", shadowOpacity: 0.12, shadowRadius: 12, elevation: 8 }}><View style={{ flexDirection: "row", gap: 12 }}><View style={{ width: 50, height: 50, borderRadius: 14, backgroundColor: catColor(selected.category) + "22", alignItems: "center", justifyContent: "center" }}><Text style={{ fontSize: 24 }}>{CATEGORIES.find(c => c.id === selected.category)?.icon}</Text></View><View style={{ flex: 1 }}><Text style={{ fontWeight: "700", fontSize: 15, color: C.text }}>{selected.title}</Text><Text style={{ fontSize: 12, color: C.textMuted, marginTop: 4 }}>📍 {selected.location}</Text><View style={{ flexDirection: "row", justifyContent: "space-between", alignItems: "center", marginTop: 10 }}><Text style={{ fontSize: 18, fontWeight: "900", color: C.green }}>{fmt(selected.budget)}</Text><Text style={{ fontSize: 11, color: C.textMuted }}>{selected.applicants} interessados</Text></View></View></View></Card></View>}
    </View>
  );
}

function NotificationsScreen({ onBack, notifications, setNotifications }) {
  const unread = notifications.filter(n => !n.read).length;
  return (
    <View style={{ flex: 1, backgroundColor: C.bg }}><GradientHeader><BackButton onPress={onBack} /><View style={{ flexDirection: "row", justifyContent: "space-between", alignItems: "center" }}><Text style={{ fontSize: 20, fontWeight: "900", color: C.white }}>Notificações</Text>{unread > 0 && <TouchableOpacity onPress={() => setNotifications(p => p.map(n => ({ ...n, read: true })))} style={{ backgroundColor: "rgba(255,255,255,0.1)", borderRadius: 8, paddingVertical: 6, paddingHorizontal: 12 }}><Text style={{ fontSize: 12, fontWeight: "600", color: C.gold }}>Marcar lidas</Text></TouchableOpacity>}</View><Text style={{ fontSize: 13, color: "rgba(255,255,255,0.5)", marginTop: 6 }}>{unread} não lida{unread !== 1 ? "s" : ""}</Text></GradientHeader>
      <ScrollView contentContainerStyle={{ padding: 16 }}>{notifications.map(n => <TouchableOpacity key={n.id} onPress={() => setNotifications(p => p.map(x => x.id === n.id ? { ...x, read: true } : x))} style={{ flexDirection: "row", gap: 12, paddingVertical: 16, paddingHorizontal: 8, borderBottomWidth: 1, borderBottomColor: C.borderLight, backgroundColor: n.read ? "transparent" : "rgba(247,201,72,0.04)" }}><View style={{ width: 44, height: 44, borderRadius: 12, backgroundColor: "rgba(247,201,72,0.1)", alignItems: "center", justifyContent: "center" }}><Text style={{ fontSize: 20 }}>{n.icon}</Text></View><View style={{ flex: 1 }}><View style={{ flexDirection: "row", justifyContent: "space-between" }}><Text style={{ fontWeight: "700", fontSize: 14, color: C.text }}>{n.title}</Text><Text style={{ fontSize: 11, color: C.textMuted }}>{n.time}</Text></View><Text style={{ fontSize: 13, color: C.textSec, marginTop: 4, lineHeight: 18 }}>{n.body}</Text></View>{!n.read && <View style={{ width: 8, height: 8, borderRadius: 4, backgroundColor: C.gold, marginTop: 6 }} />}</TouchableOpacity>)}</ScrollView>
    </View>
  );
}

function ChatsListScreen({ onBack, onOpenChat }) {
  const chats = [{ id: 1, worker: MOCK_APPLICANTS[0], lastMsg: "Posso ir amanhã 8h?", time: "14:06", unread: 1, service: "Poda de árvores" }, { id: 2, worker: MOCK_APPLICANTS[1], lastMsg: "Combinado! Levo ferramentas.", time: "12:30", unread: 0, service: "Pintura" }, { id: 3, worker: MOCK_APPLICANTS[2], lastMsg: "Qual o endereço?", time: "Ontem", unread: 2, service: "Montagem" }];
  return (
    <View style={{ flex: 1, backgroundColor: C.bg }}><GradientHeader><BackButton onPress={onBack} /><Text style={{ fontSize: 22, fontWeight: "900", color: C.white }}>Conversas</Text><Text style={{ fontSize: 13, color: "rgba(255,255,255,0.5)", marginTop: 6 }}>{chats.length} conversas ativas</Text></GradientHeader>
      <ScrollView contentContainerStyle={{ padding: 16 }}>{chats.map(c => <TouchableOpacity key={c.id} onPress={() => onOpenChat(c.worker)} style={{ flexDirection: "row", alignItems: "center", gap: 12, paddingVertical: 14, borderBottomWidth: 1, borderBottomColor: C.borderLight }}><Ava initials={c.worker.avatar} size={48} colors={[C.green, C.greenDark]} textColor={C.white} /><View style={{ flex: 1 }}><View style={{ flexDirection: "row", justifyContent: "space-between", marginBottom: 3 }}><Text style={{ fontWeight: "700", fontSize: 14, color: C.text }}>{c.worker.name}</Text><Text style={{ fontSize: 11, color: C.textMuted }}>{c.time}</Text></View><Text style={{ fontSize: 12, color: C.gold, fontWeight: "600", marginBottom: 2 }}>{c.service}</Text><Text numberOfLines={1} style={{ fontSize: 13, color: C.textMuted }}>{c.lastMsg}</Text></View>{c.unread > 0 && <View style={{ width: 22, height: 22, borderRadius: 11, backgroundColor: C.red, alignItems: "center", justifyContent: "center" }}><Text style={{ color: C.white, fontSize: 11, fontWeight: "700" }}>{c.unread}</Text></View>}</TouchableOpacity>)}</ScrollView>
    </View>
  );
}

// ─── MAIN APP ───────────────────────────────────────
export default function App() {
  const [screen, setScreen] = useState("login");
  const [user, setUser] = useState(null);
  const [selectedCategory, setSelectedCategory] = useState("all");
  const [selectedService, setSelectedService] = useState(null);
  const [chatWorker, setChatWorker] = useState(null);
  const [selectedWorker, setSelectedWorker] = useState(null);
  const [services, setServices] = useState(MOCK_SERVICES);
  const [notifications, setNotifications] = useState(MOCK_NOTIFICATIONS);
  const [toast, setToast] = useState(null);
  const [history, setHistory] = useState([]);
  const [showRating, setShowRating] = useState(false);
  const [ratingTarget, setRatingTarget] = useState(null);

  const unreadNotifs = notifications.filter(n => !n.read).length;
  const nav = s => { setHistory(p => [...p, screen]); setScreen(s); };
  const back = () => { if (history.length) { setScreen(history[history.length - 1]); setHistory(p => p.slice(0, -1)); } else setScreen("home"); };
  const showT = msg => { setToast(msg); setTimeout(() => setToast(null), 3000); };

  const handleLogin = u => { setUser(u); setScreen("home"); setHistory([]); showT(`Bem-vindo(a), ${u.name.split(" ")[0]}! 👋`); };
  const handleRegister = u => { setUser(u); setScreen("home"); setHistory([]); showT(`Conta criada! Bem-vindo(a)! 🎉`); };
  const handleLogout = () => { if (fbAuth) signOut(fbAuth).catch(() => {}); setUser(null); setScreen("login"); setHistory([]); };

  return (
    <View style={{ flex: 1 }}>
      <StatusBar barStyle="light-content" />
      {screen === "login" && <LoginScreen onLogin={handleLogin} onGoRegister={() => setScreen("register")} />}
      {screen === "register" && <RegisterScreen onRegister={handleRegister} onGoLogin={() => setScreen("login")} />}
      {screen === "home" && <HomeScreen services={services} selectedCategory={selectedCategory} setSelectedCategory={setSelectedCategory} onViewService={s => { setSelectedService(s); nav("detail"); }} onPost={() => nav("post")} onOpenChat={() => nav("chats")} onNotifications={() => nav("notifications")} onMap={() => nav("map")} unreadNotifs={unreadNotifs} user={user} onLogout={handleLogout} />}
      {screen === "detail" && selectedService && <DetailScreen service={selectedService} onBack={back} onChat={w => { setChatWorker(w); nav("chat"); }} onViewWorker={w => { setSelectedWorker(w); nav("worker"); }} />}
      {screen === "worker" && selectedWorker && <WorkerProfile worker={selectedWorker} onBack={back} onChat={() => { setChatWorker(selectedWorker); nav("chat"); }} onRate={() => { setRatingTarget(selectedWorker); setShowRating(true); }} />}
      {screen === "chat" && <ChatScreen onBack={back} worker={chatWorker} />}
      {screen === "post" && <PostScreen onBack={back} user={user} onSubmit={s => { setServices(p => [s, ...p]); showT("Serviço publicado! 🎉"); setScreen("home"); setHistory([]); }} />}
      {screen === "chats" && <ChatsListScreen onBack={back} onOpenChat={w => { setChatWorker(w); nav("chat"); }} />}
      {screen === "notifications" && <NotificationsScreen onBack={back} notifications={notifications} setNotifications={setNotifications} />}
      {screen === "map" && <MapScreen services={services} onBack={back} onViewService={s => { setSelectedService(s); nav("detail"); }} />}
      <RatingModal visible={showRating} worker={ratingTarget} onClose={() => setShowRating(false)} onSubmit={({ rating, text }) => { setShowRating(false); showT(`Avaliação de ${rating}★ enviada! 🙏`); setNotifications(p => [{ id: Date.now(), type: "rating", title: "Avaliação enviada", body: `Você avaliou ${ratingTarget?.name} com ${rating}★`, time: "Agora", read: true, icon: "⭐" }, ...p]); }} />
      <ToastBanner message={toast} />
    </View>
  );
}