import {
  signInWithEmailAndPassword,
  createUserWithEmailAndPassword,
  updateProfile,
  signOut,
} from "firebase/auth";
import {
  auth,
  createOrGetSession,
  googleLogin,
  useHealthCheck,
} from "@workspace/api-client-react";

import { useState, useEffect, useRef, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  Lock, Copy, ChevronDown, ChevronUp, Download, Mail, Zap, Clock,
  CheckCircle, CreditCard, History, LogOut, Check, Play, MessageCircle,
  X, Send, Eye, EyeOff, User, Sparkles, BookOpen, Upload, RefreshCw,
  Image as ImageIcon,
} from "lucide-react";
import JSZip from "jszip";
import { IMAGE_THEMES, VIDEO_THEMES } from "@/lib/themes";
import {
  useGenerateImage, useGenerateVideo, useCreatePayment,
  useGetPaymentHistory, useGetSession,
} from "@workspace/api-client-react";

const PAYONEER_ACCOUNT_ID = "74660788";
const PAYONEER_EMAIL = "kaleemji788@gmail.com";
const CONTACT_EMAIL = "cine.genesis.studio@gmail.com";
const SESSION_KEY = "creepyzone_session_id";
const USERNAME_KEY = "creepyzone_username";
const BASE_URL = import.meta.env.BASE_URL || "";

const MASTER_PROMPT = `MASTER PROMPT — CONSISTENT STREAM PACK GENERATOR

Use the provided reference image as the MASTER REFERENCE. The character, environment, lighting, color palette, camera angle, and art style must remain 100% consistent across all generations.

STRICT CONSISTENCY RULES:
• The SAME character must appear in every image (same face, outfit, colors, proportions)
• The SAME environment must remain unchanged (same room, background, layout, lighting)
• The SAME artistic style must be preserved across all images
• DO NOT redesign or reinterpret the character or environment
• ONLY change character pose, action, and slight camera framing

GENERATE THE FOLLOWING 6 SCENES:
1. STARTING SOON — Character preparing to start stream, calm idle pose
2. BE RIGHT BACK — Character on short break, relaxed natural action
3. STREAM ENDING — Character waving goodbye, closing action
4. WEBCAM OVERLAY — Frame composition, character around central empty area
5. CHAT BOX — Vertical layout, character interacting with chat
6. ALERT BOX — Character reacting to new follower with excitement

STYLE: Ultra high quality · Cinematic lighting · Professional Twitch overlay design`;

const THEME_PROMPTS: Record<string, string> = {
  "Hellfire": "demonic fire lord in a volcanic hell dimension, rivers of lava, skull pillars, ember flames, molten rock throne room, intense orange-red fire lighting",
  "Dark Witch": "dark sorceress in gothic castle tower, purple arcane magic swirling, ancient spell books, gargoyle statues, candlelit stone walls, mystical purple atmosphere",
  "Blood Moon": "cursed warrior under a blood red moon, crimson mist, ancient battlefield ruins, dark red sky with dramatic moon, horror gothic atmosphere",
  "Shadow Reaper": "grim reaper shadow figure in darkness, scythe glowing, shadows swirling, dark mist, gravestones visible in fog, death realm environment",
  "Demon Lord": "powerful demon overlord in a dark obsidian throne room, glowing red eyes, spikes and chains, hellfire torches, dark fortress architecture",
  "Volcanic Ash": "ash-covered warrior in volcanic wasteland, grey volcanic rocks, ash falling like snow, dark orange sky with smoke clouds, post-apocalyptic atmosphere",
  "Cursed Flame": "cursed mage engulfed in eerie green cursed flames, dark forest clearing, twisted black trees, green glowing ground runes, ominous moonlight",
  "Death's Glow": "death knight in dark castle armory, blood red glowing armor, skull decorations, torchlight casting red glow, medieval dark fantasy",
  "Neon City": "cyberpunk character in futuristic neon city, pink and cyan neon signs, rain-slicked streets, holographic ads, night city skyline",
  "Cyber Punk": "cyber-enhanced fighter in industrial punk city, yellow neon accents, mechanical implants visible, graffiti walls, electric atmosphere",
  "Electric Blue": "electric powers user in blue energy chamber, crackling lightning, blue plasma orbs, dark tech lab environment, electric particles floating",
  "Toxic Green": "toxic mutant in abandoned chemical plant, green glowing waste, broken pipes, toxic fog, industrial decay with neon green lighting",
  "UV Rave": "rave character in UV nightclub, purple UV lighting, fluorescent outfit details, laser beams, smoke machines, nightclub atmosphere",
  "Neon Pink": "pop idol in pink neon dressing room, mirror lights, pink glow everywhere, vanity lights, pop star aesthetic, vibrant pink atmosphere",
  "Laser Grid": "hacker in cyan laser security room, laser grid lines crossing, digital interface panels, dark room with tech glow, sci-fi security vault",
  "Synthwave": "80s synth character in retro-futuristic landscape, orange and purple sunset grid, palm trees, retrowave aesthetic, geometric sun on horizon",
  "Jump Scare": "horror monster emerging from darkness, white flash highlight, shadows everywhere, stark black and white contrast, extreme tension atmosphere",
  "Ghost House": "ghost hunter in abandoned haunted house, grey misty atmosphere, broken furniture, dusty rooms, flickering candles, paranormal investigation gear",
  "Vampire Castle": "vampire lord in dark Romanian castle, crimson drapes, coffin visible, bat silhouettes, moonlit arched windows, gothic architecture",
  "Zombie Horde": "survivor in post-apocalyptic zombie world, military green atmosphere, ruined urban environment, fog and decay, survival gear",
  "Creepy Clown": "sinister clown in abandoned carnival, red and yellow color scheme, rusted ferris wheel, fog, broken rides, uncanny valley horror",
  "Haunted Mansion": "paranormal investigator in Victorian haunted mansion, grey stone walls, spider webs, portrait paintings with following eyes, candelabras",
  "Slender Man": "mysterious tall figure in dark forest, white mask, black suit, bare white trees, dense fog, night forest at midnight",
  "Witch Brew": "witch brewing potions in cauldron room, purple and green smoke, potion bottles everywhere, grimoire open, stone cottage kitchen",
  "Martial Arts": "martial arts master in traditional dojo, red and white color scheme, wooden training dummies, paper lanterns, cherry blossom visible through window",
  "Street Fighter": "street brawler in urban back alley, dramatic fighting pose, orange neon signs, graffiti walls, rain puddles reflecting city lights",
  "Samurai": "samurai warrior in ancient Japanese shrine, red and dark contrast, cherry blossoms falling, stone lanterns, moonlit Japanese garden",
  "Gladiator": "gladiator warrior in Roman colosseum arena, gold and earth tones, sand floor, crowd cheering, torchlight, ancient Rome atmosphere",
  "Battle Royale": "battle royale soldier in crisis zone, blue and red team colors, urban warfare ruins, supply drops falling, storm circle closing in",
  "War Zone": "military soldier in active war zone, military green, destroyed buildings, smoke and fire, armored vehicles, combat atmosphere",
  "Military Ops": "special forces operative in dark tactical environment, military black and grey, night vision goggles, stealth mission atmosphere",
  "Ninja Assassin": "ninja assassin on rooftop at night, black outfit, katana ready, city lights below, moon visible, shadows everywhere",
  "Alien Invasion": "alien invasion survivor in devastated city, green alien energy beams, crashed UFOs, panic atmosphere, alien ships in sky",
  "Space Station": "space commander on futuristic space station, silver and blue, stars visible through viewport, zero gravity equipment, tech panels",
  "Galaxy Far Away": "sci-fi explorer in alien galaxy landscape, twin moons visible, exotic alien flora, distant nebulae, deep space atmosphere",
  "Cybernetic": "cybernetic human in chrome tech lab, cyan circuit patterns, cybernetic implants, holographic displays, sterile futuristic environment",
  "Android": "android robot awakening in factory, grey metallic colors with cyan highlights, assembly line, robotic arms, industrial tech environment",
  "Wormhole": "space traveler at cosmic wormhole, purple space tunnel, stars being pulled in, cosmic energy, deep space galaxy background",
  "Star Command": "starship captain on bridge, blue and gold uniform, star map displays, crew stations, space battle visible through viewscreen",
  "Quantum": "quantum physicist in experimental lab, pink and cyan quantum effects, particle collisions visible, scientific equipment, energy fields",
  "Dragon Rider": "dragon rider on cliff edge, red and gold dragon scales, mountain landscape, sunset horizon, epic fantasy world view",
  "Dark Elf": "dark elf in underground elven city, purple bioluminescence, crystal formations, ancient ruins, otherworldly underground landscape",
  "Wizard Tower": "arcane wizard in magical tower study, blue and purple magic circles, floating spell books, telescope, magical artifacts collection",
  "Crystal Cave": "crystal mage in underground crystal cave, cyan crystal formations, crystal reflections everywhere, magical ice atmosphere",
  "Elven Forest": "elven warrior in ancient magical forest, green bioluminescent trees, ancient elven architecture, forest spirits, magical nature atmosphere",
  "Orc Warlord": "orc warlord in war camp, earth tones, primitive fortress, battle flags, weapon racks, tribal fire pits, warrior atmosphere",
  "Dungeon Boss": "dungeon boss in final boss chamber, dark stone walls, treasure chests, magical barriers, intimidating throne, guardian creature visible",
  "Ancient Rune": "rune mage in ancient library, golden rune inscriptions on walls, stone tablets, ancient knowledge, candlelight, archaeological atmosphere",
  "Sweet Romance": "romantic character in pink cherry blossom garden, soft pink lighting, flower petals floating, pastel colors, dreamy soft atmosphere",
  "Kissing Rain": "dramatic romance in blue rain, city lights blurred in rain, soft blue tones, cinematic rain atmosphere, romantic drama",
  "Love Letter": "romantic character in vintage red room, roses everywhere, love letter being written, warm candlelight, classic romantic atmosphere",
  "Marvel Hero": "superhero in destroyed city, red and blue costume, dramatic clouds, lightning backdrop, hero landing pose, comic book style",
  "Power Surge": "energy-powered hero in power chamber, blue energy waves, lightning strikes, electrical arcs, power generation facility",
};

const THEME_GLOWS: Record<string, string> = {
  "Hellfire": "rgba(255,69,0,0.25)", "Blood Moon": "rgba(138,3,3,0.3)", "Demon Lord": "rgba(92,0,0,0.3)",
  "Dark Witch": "rgba(75,0,130,0.3)", "Cursed Flame": "rgba(0,255,0,0.2)", "Volcanic Ash": "rgba(255,107,53,0.2)",
  "Death's Glow": "rgba(204,34,34,0.3)", "Shadow Reaper": "rgba(40,40,40,0.4)",
  "Neon City": "rgba(255,0,255,0.25)", "Cyber Punk": "rgba(255,255,0,0.2)", "Electric Blue": "rgba(0,0,255,0.25)",
  "Toxic Green": "rgba(57,255,20,0.2)", "UV Rave": "rgba(138,43,226,0.3)", "Neon Pink": "rgba(255,102,204,0.25)",
  "Laser Grid": "rgba(0,255,204,0.25)", "Synthwave": "rgba(255,153,51,0.2)",
  "Jump Scare": "rgba(255,0,0,0.25)", "Ghost House": "rgba(170,170,170,0.15)", "Vampire Castle": "rgba(128,0,0,0.3)",
  "Zombie Horde": "rgba(77,77,0,0.25)", "Creepy Clown": "rgba(255,0,0,0.2)", "Witch Brew": "rgba(128,0,128,0.25)",
  "Dragon Rider": "rgba(204,0,0,0.25)", "Wizard Tower": "rgba(0,0,204,0.25)", "Crystal Cave": "rgba(0,255,255,0.2)",
  "Marvel Hero": "rgba(204,0,0,0.25)", "Power Surge": "rgba(0,255,255,0.25)",
};

function getThemeGlow(theme: string): string {
  return THEME_GLOWS[theme] || "rgba(204,34,34,0.15)";
}

async function apiCall(path: string, opts?: RequestInit) {
  const res = await fetch(`${BASE_URL}api/${path}`, {
    headers: { "Content-Type": "application/json" },
    ...opts,
  });
  const data = await res.json();
  if (!res.ok) throw new Error(data.error || "Request failed");
  return data;
}

function FireParticles() {
  return (
    <div className="absolute inset-0 overflow-hidden pointer-events-none">
      {[...Array(22)].map((_, i) => (
        <motion.div
          key={i}
          className="absolute rounded-full"
          style={{
            left: `${(i * 4.5) % 100}%`,
            bottom: 0,
            width: `${2 + (i % 3)}px`,
            height: `${20 + (i % 6) * 15}px`,
            background: `linear-gradient(to top, #ff6b35, transparent)`,
          }}
          animate={{ y: [0, -(180 + (i % 4) * 80)], opacity: [0, 0.55, 0], scaleX: [1, 0.4, 0.1] }}
          transition={{ repeat: Infinity, duration: 2 + (i % 5) * 0.4, delay: (i * 0.28) % 3.5, ease: "easeOut" }}
        />
      ))}
    </div>
  );
}

function ThemeGrid({ themes, selected, onSelect }: {
  themes: typeof IMAGE_THEMES; selected: string; onSelect: (n: string) => void;
}) {
  const [openGroups, setOpenGroups] = useState<Record<string, boolean>>({ [themes[0].group]: true });
  const toggle = (g: string) => setOpenGroups((p) => ({ ...p, [g]: !p[g] }));
  return (
    <div className="space-y-1.5">
      {themes.map((group) => (
        <div key={group.group} className="border border-[#222] rounded-lg overflow-hidden">
          <button onClick={() => toggle(group.group)} className="w-full flex items-center justify-between px-4 py-2 bg-[#111] hover:bg-[#181818] transition-colors">
            <span className="text-xs font-bold tracking-widest text-white/50">{group.group}</span>
            {openGroups[group.group] ? <ChevronUp className="w-3.5 h-3.5 text-red-400" /> : <ChevronDown className="w-3.5 h-3.5 text-red-400" />}
          </button>
          <AnimatePresence>
            {openGroups[group.group] && (
              <motion.div initial={{ height: 0, opacity: 0 }} animate={{ height: "auto", opacity: 1 }} exit={{ height: 0, opacity: 0 }} transition={{ duration: 0.18 }} className="overflow-hidden">
                <div className="grid grid-cols-4 gap-1.5 p-2.5 bg-[#0a0a0a]">
                  {group.themes.map((theme) => (
                    <button key={theme.name} onClick={() => onSelect(theme.name)}
                      className={`rounded-lg p-1 transition-all border-2 ${selected === theme.name ? "border-red-500 shadow-[0_0_10px_rgba(204,34,34,0.5)]" : "border-transparent hover:border-[#333]"}`}>
                      <div className="h-6 rounded w-full mb-0.5" style={{ background: `linear-gradient(135deg, ${theme.colors[0]} 50%, ${theme.colors[1]} 100%)` }} />
                      <span className="text-[8px] font-bold text-white/50 text-center block leading-tight">{theme.name}</span>
                    </button>
                  ))}
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      ))}
    </div>
  );
}

function ProgressBar({ progress, messages, label }: { progress: number; messages: string[]; label: string }) {
  const [idx, setIdx] = useState(0);
  useEffect(() => {
    const t = setInterval(() => setIdx((i) => (i + 1) % messages.length), 1100);
    return () => clearInterval(t);
  }, [messages.length]);
  return (
    <div className="space-y-2 py-5">
      <div className="flex items-center justify-between">
        <span className="text-red-400 text-xs font-bold tracking-wider animate-pulse">{messages[idx]}</span>
        <span className="text-white font-black text-xl tabular-nums">{progress}%</span>
      </div>
      <div className="relative w-full bg-[#1a1a1a] rounded-full h-6 overflow-hidden border border-[#2a2a2a]">
        <motion.div className="h-full rounded-full" style={{ background: "linear-gradient(90deg,#7b0000,#cc2222,#e05a2b)", boxShadow: "0 0 20px rgba(204,34,34,0.8)" }} animate={{ width: `${progress}%` }} transition={{ duration: 0.4 }} />
        <span className="absolute inset-0 flex items-center justify-center text-xs font-black text-white drop-shadow">{label} — {progress}% COMPLETE</span>
      </div>
      <p className="text-center text-[10px] text-white/20 tracking-wider">REAL AI IS WORKING — 30–90 SECONDS</p>
    </div>
  );
}

function CountdownBar({ trialEndsAt }: { trialEndsAt: string }) {
  const [remaining, setRemaining] = useState(0);
  const total = 24 * 60 * 60 * 1000;
  useEffect(() => {
    const update = () => setRemaining(Math.max(0, new Date(trialEndsAt).getTime() - Date.now()));
    update(); const t = setInterval(update, 1000); return () => clearInterval(t);
  }, [trialEndsAt]);
  const pct = Math.min(100, (remaining / total) * 100);
  const h = Math.floor(remaining / 3600000), m = Math.floor((remaining % 3600000) / 60000), s = Math.floor((remaining % 60000) / 1000);
  const fmt = (n: number) => String(n).padStart(2, "0");
  if (remaining <= 0) return (
    <div className="w-full bg-red-900/30 border-b border-red-500/30 px-5 py-2 flex items-center gap-3">
      <Lock className="w-4 h-4 text-red-400 shrink-0" />
      <span className="text-red-400 text-xs font-bold tracking-wider">FREE TRIAL ENDED — SUBSCRIBE TO CONTINUE</span>
    </div>
  );
  return (
    <div className="w-full bg-[#080808] border-b border-red-900/20 px-5 py-2 flex items-center gap-3">
      <Clock className="w-4 h-4 text-orange-400 shrink-0" />
      <span className="text-orange-300 text-xs font-bold tracking-wider shrink-0">FREE TRIAL — {fmt(h)}:{fmt(m)}:{fmt(s)} LEFT</span>
      <div className="flex-1 bg-[#222] rounded-full h-1.5 overflow-hidden"><div className="h-full rounded-full transition-all duration-1000" style={{ background: "linear-gradient(90deg,#cc2222,#e05a2b)", width: `${pct}%` }} /></div>
    </div>
  );
}

function LockOverlay({ onUnlock }: { onUnlock: () => void }) {
  return (
    <div className="absolute inset-0 bg-black/80 backdrop-blur-sm rounded-xl z-10 flex flex-col items-center justify-center gap-4">
      <motion.div animate={{ y: [0, -8, 0], boxShadow: ["0 0 20px rgba(204,34,34,0.3)", "0 0 50px rgba(204,34,34,0.8)", "0 0 20px rgba(204,34,34,0.3)"] }} transition={{ repeat: Infinity, duration: 2 }} className="rounded-full bg-[#1a1a1a] p-5 border-2 border-red-500">
        <Lock className="w-9 h-9 text-red-400" />
      </motion.div>
      <p className="text-red-300 font-bold tracking-widest text-sm">TRIAL EXPIRED</p>
      <button onClick={onUnlock} className="px-6 py-2.5 rounded-lg font-bold text-white text-sm tracking-wider transition-all hover:scale-105" style={{ background: "linear-gradient(135deg,#7b0000,#cc2222)" }}>UNLOCK WITH PAYONEER</button>
    </div>
  );
}

function PayoneerModal({ plan, onClose, sessionId, onSuccess }: { plan: "weekly" | "monthly"; onClose: () => void; sessionId: string; onSuccess: () => void }) {
  const [txId, setTxId] = useState(""), [email, setEmail] = useState(""), [copied, setCopied] = useState<"id" | "email" | null>(null), [success, setSuccess] = useState(false);
  const createPayment = useCreatePayment();
  const amount = plan === "weekly" ? 5 : 15;
  const copy = (text: string, type: "id" | "email") => { navigator.clipboard.writeText(text); setCopied(type); setTimeout(() => setCopied(null), 2000); };
  const handleConfirm = async () => {
    if (!txId || !email) return;
    try {
      await createPayment.mutateAsync({ data: { sessionId, plan, payoneerTransactionId: txId, amount } });
      setSuccess(true); setTimeout(() => { onSuccess(); onClose(); }, 2000);
    } catch {}
  };
  return (
    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm p-4">
      <motion.div initial={{ scale: 0.9, y: 20 }} animate={{ scale: 1, y: 0 }} className="bg-[#0d0d0d] border border-orange-500/30 rounded-2xl p-6 w-full max-w-md shadow-[0_0_60px_rgba(204,34,34,0.2)]">
        <div className="flex items-center justify-between mb-5">
          <div><h3 className="text-lg font-black text-white tracking-wider">PAYONEER PAYMENT</h3><p className="text-xs text-white/40">{plan.toUpperCase()} PLAN — ${amount}</p></div>
          <button onClick={onClose} className="text-white/30 hover:text-white/60"><X className="w-5 h-5" /></button>
        </div>
        {success ? (
          <div className="text-center py-6"><CheckCircle className="w-16 h-16 text-green-400 mx-auto mb-3" /><p className="text-green-400 font-black text-lg tracking-wider">PAYMENT CONFIRMED!</p><p className="text-white/50 text-sm mt-1">Unlocking your account…</p></div>
        ) : (
          <div className="space-y-4">
            <div className="bg-[#0a0a0a] rounded-xl p-4 border border-[#222] space-y-3">
              <p className="text-xs text-orange-400 font-bold tracking-widest">STEP 1 — SEND ${amount} TO:</p>
              {[["PAYONEER ID", PAYONEER_ACCOUNT_ID, "id" as const], ["PAYONEER EMAIL", PAYONEER_EMAIL, "email" as const]].map(([label, value, type]) => (
                <div key={String(type)} className="flex items-center gap-2">
                  <div className="flex-1 bg-[#151515] rounded-lg p-2.5 border border-[#222]">
                    <p className="text-[10px] text-white/25 mb-0.5">{label}</p>
                    <p className={`font-black text-orange-400 ${type === "id" ? "text-xl tracking-widest" : "text-sm"}`}>{value}</p>
                  </div>
                  <button onClick={() => copy(String(value), type as "id" | "email")} className="p-2.5 border border-[#222] rounded-lg hover:border-orange-500/40 transition-colors">
                    {copied === type ? <Check className="w-4 h-4 text-green-400" /> : <Copy className="w-4 h-4 text-white/40" />}
                  </button>
                </div>
              ))}
            </div>
            <div className="space-y-2">
              <p className="text-xs text-orange-400 font-bold tracking-widest">STEP 2 — CONFIRM:</p>
              <input type="email" placeholder="Your email address" value={email} onChange={(e) => setEmail(e.target.value)} className="w-full px-4 py-2.5 bg-[#080808] border border-[#222] rounded-lg text-white placeholder:text-white/20 focus:outline-none focus:border-orange-500 text-sm" />
              <input type="text" placeholder="Payoneer Transaction ID" value={txId} onChange={(e) => setTxId(e.target.value)} className="w-full px-4 py-2.5 bg-[#080808] border border-[#222] rounded-lg text-white placeholder:text-white/20 focus:outline-none focus:border-orange-500 text-sm font-mono" />
            </div>
            <button onClick={handleConfirm} disabled={!txId || !email || createPayment.isPending} className="w-full py-3.5 rounded-xl font-black tracking-wider text-white flex items-center justify-center gap-2 disabled:opacity-40 transition-all hover:scale-[1.01]" style={{ background: "linear-gradient(135deg,#7b0000,#cc2222,#e05a2b)" }}>
              <CheckCircle className="w-5 h-5" />{createPayment.isPending ? "CONFIRMING…" : "CONFIRM MY PAYMENT"}
            </button>
          </div>
        )}
      </motion.div>
    </motion.div>
  );
}

function FloatingChat() {
  const [open, setOpen] = useState(false);
  const [messages, setMessages] = useState<{ role: "user" | "bot"; text: string }[]>([
    { role: "bot", text: "Hey! 👻 I'm your Creepy Zone AI assistant. Ask me about generating images, animation, payment, or downloads!" },
  ]);
  const [input, setInput] = useState(""), [loading, setLoading] = useState(false);
  const bottomRef = useRef<HTMLDivElement>(null);
  useEffect(() => { bottomRef.current?.scrollIntoView({ behavior: "smooth" }); }, [messages]);
  const send = async () => {
    if (!input.trim() || loading) return;
    const msg = input.trim(); setInput(""); setMessages((p) => [...p, { role: "user", text: msg }]); setLoading(true);
    try {
      const data = await apiCall("generate/chat", { method: "POST", body: JSON.stringify({ message: msg }) });
      setMessages((p) => [...p, { role: "bot", text: data.reply }]);
    } catch { setMessages((p) => [...p, { role: "bot", text: "Something went wrong. Try again?" }]); }
    finally { setLoading(false); }
  };
  return (
    <>
      <AnimatePresence>
        {open && (
          <motion.div initial={{ opacity: 0, scale: 0.85, y: 20 }} animate={{ opacity: 1, scale: 1, y: 0 }} exit={{ opacity: 0, scale: 0.85, y: 20 }} className="fixed bottom-24 right-4 z-50 w-80 bg-[#0d0d0d] border border-red-500/30 rounded-2xl overflow-hidden shadow-[0_0_40px_rgba(204,34,34,0.2)]">
            <div className="bg-[#111] border-b border-[#222] px-4 py-3 flex items-center gap-3">
              <div className="w-8 h-8 rounded-full overflow-hidden border border-red-500/50 shrink-0"><img src="/creepy-zone-banner.png" alt="AI" className="w-full h-full object-cover object-top" /></div>
              <div className="flex-1"><p className="text-sm font-bold text-white tracking-wider">ZONE AI HELPER</p><p className="text-[10px] text-green-400">● Online</p></div>
              <button onClick={() => setOpen(false)} className="text-white/30 hover:text-white/60"><X className="w-4 h-4" /></button>
            </div>
            <div className="h-64 overflow-y-auto p-4 space-y-3">
              {messages.map((m, i) => (
                <div key={i} className={`flex ${m.role === "user" ? "justify-end" : "justify-start"}`}>
                  <div className={`max-w-[85%] px-3 py-2 rounded-xl text-sm ${m.role === "user" ? "bg-red-800/60 text-white" : "bg-[#1a1a1a] text-white/80 border border-[#222]"}`}>{m.text}</div>
                </div>
              ))}
              {loading && <div className="flex justify-start"><div className="bg-[#1a1a1a] border border-[#222] px-3 py-2 rounded-xl flex gap-1">{[0,1,2].map((i) => (<motion.div key={i} className="w-1.5 h-1.5 rounded-full bg-red-400" animate={{ y: [0,-4,0] }} transition={{ repeat: Infinity, duration: 0.6, delay: i * 0.15 }} />))}</div></div>}
              <div ref={bottomRef} />
            </div>
            <div className="border-t border-[#222] p-3 flex gap-2">
              <input value={input} onChange={(e) => setInput(e.target.value)} onKeyDown={(e) => e.key === "Enter" && send()} placeholder="Ask anything…" className="flex-1 px-3 py-2 bg-[#0a0a0a] border border-[#222] rounded-lg text-sm text-white placeholder:text-white/20 focus:outline-none focus:border-red-500" />
              <button onClick={send} disabled={!input.trim() || loading} className="p-2 rounded-lg bg-red-700 hover:bg-red-600 transition-colors disabled:opacity-40"><Send className="w-4 h-4 text-white" /></button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
      <motion.button onClick={() => setOpen((o) => !o)} className="fixed bottom-5 right-4 z-50 w-14 h-14 rounded-full overflow-hidden border-2 border-red-500" animate={{ y: [0,-5,0], boxShadow: ["0 0 20px rgba(204,34,34,0.4)","0 0 40px rgba(204,34,34,0.8)","0 0 20px rgba(204,34,34,0.4)"] }} transition={{ repeat: Infinity, duration: 2.5 }} whileHover={{ scale: 1.1 }} whileTap={{ scale: 0.95 }}>
        {open ? <div className="w-full h-full bg-[#151515] flex items-center justify-center"><X className="w-6 h-6 text-white" /></div> : <img src="/creepy-zone-banner.png" alt="Chat" className="w-full h-full object-cover object-top" />}
      </motion.button>
    </>
  );
}

export default function Home() {
  const [phase, setPhase] = useState<"splash" | "auth" | "app">("splash");
  const [authMode, setAuthMode] = useState<"login" | "register">("login");
  const [email, setEmail] = useState(""), [password, setPassword] = useState(""), [displayName, setDisplayName] = useState(""), [showPw, setShowPw] = useState(false), [authError, setAuthError] = useState(""), [authLoading, setAuthLoading] = useState(false);
  const [sessionId, setSessionId] = useState<string | null>(null), [username, setUsername] = useState("");

  const [prompt, setPrompt] = useState("");
  const [selectedImageTheme, setSelectedImageTheme] = useState("Hellfire");
  const [selectedVideoTheme, setSelectedVideoTheme] = useState("Epic Reveal");
  const [imageProgress, setImageProgress] = useState(0), [videoProgress, setVideoProgress] = useState(0);
  const [isGeneratingImage, setIsGeneratingImage] = useState(false), [isGeneratingVideo, setIsGeneratingVideo] = useState(false);
  const [regeneratingIndex, setRegeneratingIndex] = useState<number | null>(null);
  const [generatedImages, setGeneratedImages] = useState<{ url: string; label: string; tag: string; dim: string }[]>([]);
  const [generatedVideoUrl, setGeneratedVideoUrl] = useState<string | null>(null);
  const [selectedImageForVideo, setSelectedImageForVideo] = useState<string | null>(null);
  const [selectedImageLabelForVideo, setSelectedImageLabelForVideo] = useState<string | null>(null);
  const [videoPrompt, setVideoPrompt] = useState("");
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [isDownloadingZip, setIsDownloadingZip] = useState(false);
  const [copyMasterPrompt, setCopyMasterPrompt] = useState(false), [showMasterPrompt, setShowMasterPrompt] = useState(false);
  const [payoneerPlan, setPayoneerPlan] = useState<"weekly" | "monthly" | null>(null);

  const [masterImageUrl, setMasterImageUrl] = useState<string | null>(null);
  const [masterImageName, setMasterImageName] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const [mousePos, setMousePos] = useState({ x: 0, y: 0 });

  const { data: sessionData, refetch: refetchSession } = useGetSession(sessionId ?? "", {
    query: { enabled: !!sessionId, queryKey: [`/api/auth/session/${sessionId}`], refetchInterval: 30000 },
  });
  const generateImage = useGenerateImage();
  const generateVideo = useGenerateVideo();
  const { data: paymentHistory, refetch: refetchPayments } = useGetPaymentHistory(sessionId ?? "", {
    query: { enabled: !!sessionId, queryKey: [`/api/payments/history/${sessionId}`] },
  });

  useEffect(() => {
    const sid = localStorage.getItem(SESSION_KEY), uname = localStorage.getItem(USERNAME_KEY);
    if (sid && uname) { setSessionId(sid); setUsername(uname); setPhase("app"); }
  }, []);

  useEffect(() => {
    const handleMouseMove = (e: MouseEvent) => setMousePos({ x: e.clientX / window.innerWidth - 0.5, y: e.clientY / window.innerHeight - 0.5 });
    window.addEventListener("mousemove", handleMouseMove);
    return () => window.removeEventListener("mousemove", handleMouseMove);
  }, []);

  const handleThemeSelect = (theme: string) => {
    setSelectedImageTheme(theme);
    if (!prompt.trim()) {
      setPrompt(
        THEME_PROMPTS[theme] ??
          `${theme} streamer character, cinematic background, detailed lighting, professional stream overlay style`,
      );
    }
  };

  const isLocked = sessionData ? !sessionData.isTrialActive && !sessionData.isPlanActive : false;
  const { error: healthError } = useHealthCheck({
    query: { retry: false, refetchOnWindowFocus: false },
  });
  const backendUnavailable = Boolean(healthError);

 

const handleAuth = async () => {
  if (!email || !password) {
    setAuthError("Email aur password required hai");
    return;
  }

  setAuthLoading(true);
  setAuthError("");

  try {
    let credUser;
    if (authMode === "login") {
      const cred = await signInWithEmailAndPassword(auth, email, password);
      credUser = cred.user;
    } else {
      const cred = await createUserWithEmailAndPassword(auth, email, password);
      credUser = cred.user;
      if (displayName.trim()) {
        await updateProfile(credUser, { displayName: displayName.trim() });
      }
    }

    const uname =
      authMode === "register" && displayName.trim()
        ? displayName.trim()
        : credUser.displayName?.trim() ||
          credUser.email?.split("@")[0] ||
          "user";

    const session = await createOrGetSession({
      username: uname,
      fingerprint: `firebase:${credUser.uid}`,
    });

    localStorage.setItem(SESSION_KEY, session.sessionId);
    localStorage.setItem(USERNAME_KEY, session.username);
    setSessionId(session.sessionId);
    setUsername(session.username);
    setPhase("app");
  } catch (err: unknown) {
    setAuthError(err instanceof Error ? err.message : "Authentication failed");
  } finally {
    setAuthLoading(false);
  }
};

const handleGoogleAuth = async () => {
  setAuthLoading(true);
  setAuthError("");
  try {
    const user = await googleLogin();
    const uname =
      user.displayName?.trim() ||
      user.email?.split("@")[0] ||
      "user";
    const session = await createOrGetSession({
      username: uname,
      fingerprint: `firebase:${user.uid}`,
    });
    localStorage.setItem(SESSION_KEY, session.sessionId);
    localStorage.setItem(USERNAME_KEY, session.username);
    setSessionId(session.sessionId);
    setUsername(session.username);
    setPhase("app");
  } catch (err: unknown) {
    setAuthError(
      err instanceof Error ? err.message : "Google sign-in failed",
    );
  } finally {
    setAuthLoading(false);
  }
};

  const simulateProgress = (setter: (v: number) => void, durationMs: number) =>
    new Promise<void>((resolve) => {
      let pct = 0;
      const t = setInterval(() => { pct = Math.min(97, pct + 1); setter(pct); if (pct >= 97) { clearInterval(t); resolve(); } }, durationMs / 97);
    });

  const handleUploadImage = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = (ev) => {
      const dataUrl = ev.target?.result as string;
      setMasterImageUrl(dataUrl);
      setMasterImageName(file.name);
      if (!prompt.trim() && THEME_PROMPTS[selectedImageTheme]) setPrompt(THEME_PROMPTS[selectedImageTheme]);
    };
    reader.readAsDataURL(file);
    if (fileInputRef.current) fileInputRef.current.value = "";
  };

  const handleGenerateImages = async () => {
    if (!sessionId || !prompt.trim() || isLocked) return;
    setIsGeneratingImage(true); setImageProgress(0); setGeneratedImages([]); setErrorMsg(null);
    try {
      const [, result] = await Promise.all([
        simulateProgress(setImageProgress, 55000),
        generateImage.mutateAsync({ data: { sessionId, prompt, aesthetic: selectedImageTheme } }),
      ]);
      setImageProgress(100);
      const TAGS = ["STARTING SOON","BRB","ENDING","WEBCAM OVERLAY","CHAT BOX","ALERT BOX"];
      const DIMS = ["1920x1080px","1920x1080px","1920x1080px","400x300px","340x500px","600x160px"];
      setGeneratedImages(result.images.map((img, i) => ({
        url: img.url, label: img.label, tag: TAGS[i] ?? img.label.toUpperCase(), dim: DIMS[i] ?? "1024x1024px",
      })));
    } catch (err: unknown) { setImageProgress(0); setErrorMsg(err instanceof Error ? err.message : "Generation failed."); }
    finally { setIsGeneratingImage(false); }
  };

  const handleRegenerateScene = async (index: number) => {
    if (!sessionId || isLocked) return;
    setRegeneratingIndex(index); setErrorMsg(null);
    try {
      const data = await apiCall("generate/scene", {
        method: "POST",
        body: JSON.stringify({ sessionId, prompt, aesthetic: selectedImageTheme, sceneIndex: index, masterImageUrl: masterImageUrl ?? undefined }),
      });
      setGeneratedImages((prev) => prev.map((img, i) => i === index ? { url: data.url, label: data.label, tag: data.tag, dim: data.dimensions } : img));
    } catch (err: unknown) { setErrorMsg(err instanceof Error ? err.message : "Regeneration failed."); }
    finally { setRegeneratingIndex(null); }
  };

  const handleGenerateVideo = async () => {
    if (!sessionId || isLocked) return;
    setIsGeneratingVideo(true); setVideoProgress(0); setGeneratedVideoUrl(null); setErrorMsg(null);
    try {
      const [, result] = await Promise.all([
        simulateProgress(setVideoProgress, 45000),
        generateVideo.mutateAsync({ data: { sessionId, prompt: videoPrompt || prompt || "Dark creepy streaming intro animation", style: selectedVideoTheme, sourceImageUrl: selectedImageForVideo ?? undefined } }),
      ]);
      setVideoProgress(100); setGeneratedVideoUrl(result.videoUrl);
    } catch (err: unknown) { setVideoProgress(0); setErrorMsg(err instanceof Error ? err.message : "Video generation failed."); }
    finally { setIsGeneratingVideo(false); }
  };

  const handleDownloadSingle = useCallback((url: string, label: string) => {
    const a = document.createElement("a"); a.href = url; a.download = `creepy-zone-${label.replace(/ /g,"_").toLowerCase()}.png`;
    document.body.appendChild(a); a.click(); document.body.removeChild(a);
  }, []);

  const handleDownloadZip = async () => {
    if (!generatedImages.length) return;
    setIsDownloadingZip(true);
    try {
      const zip = new JSZip(); const folder = zip.folder("creepy-zone-stream-pack");
      for (const img of generatedImages) { const res = await fetch(img.url); const blob = await res.blob(); folder?.file(`${img.label.replace(/ /g,"_").toLowerCase()}.png`, blob); }
      if (generatedVideoUrl) { const res = await fetch(generatedVideoUrl); const blob = await res.blob(); folder?.file("intro_animation.png", blob); }
      const content = await zip.generateAsync({ type: "blob" });
      const url = URL.createObjectURL(content); const a = document.createElement("a"); a.href = url; a.download = "creepy-zone-stream-pack.zip";
      document.body.appendChild(a); a.click(); document.body.removeChild(a); URL.revokeObjectURL(url);
    } finally { setIsDownloadingZip(false); }
  };

  const copyMaster = () => { navigator.clipboard.writeText(MASTER_PROMPT); setCopyMasterPrompt(true); setTimeout(() => setCopyMasterPrompt(false), 2500); };
  const logout = async () => {
    try {
      await signOut(auth);
    } catch {
      /* ignore */
    }
    localStorage.removeItem(SESSION_KEY);
    localStorage.removeItem(USERNAME_KEY);
    setPhase("splash");
    setSessionId(null);
    setUsername("");
  };

  const themeGlow = getThemeGlow(selectedImageTheme);

  if (phase === "splash" || phase === "auth") {
    return (
      <div className="min-h-screen bg-[#050505] flex flex-col relative overflow-hidden">
        {/* Intro Video */}
        <div className="relative w-full" style={{ minHeight: phase === "splash" ? "100vh" : "40vh" }}>
          <video
            className="absolute inset-0 w-full h-full object-cover"
            src="/creepzone-intro.mp4"
            autoPlay muted loop playsInline
          />
          <div className="absolute inset-0 bg-gradient-to-b from-black/40 via-black/30 to-[#050505]" />
          <FireParticles />
          {backendUnavailable && (
            <div className="relative z-20 mx-auto mt-4 max-w-4xl px-4">
              <div className="rounded-xl border border-amber-500/40 bg-amber-950/50 px-4 py-3 text-xs text-amber-200">
                API backend is not reachable. Set `VITE_API_BASE_URL` to your deployed API server URL
                so login sessions, image generation, and video generation work.
              </div>
            </div>
          )}

          {phase === "splash" ? (
            <div className="relative z-10 flex flex-col items-center justify-center min-h-screen px-4 py-16 gap-8">
              {/* Hero text */}
              <motion.div className="text-center" initial={{ opacity: 0, y: -30 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.3 }}>
                <motion.h1 className="text-5xl sm:text-7xl font-black tracking-widest text-white mb-3" style={{ textShadow: "0 0 50px rgba(204,34,34,0.9)" }} animate={{ textShadow: ["0 0 30px rgba(204,34,34,0.5)","0 0 80px rgba(204,34,34,1)","0 0 30px rgba(204,34,34,0.5)"] }} transition={{ repeat: Infinity, duration: 3 }}>
                  CREEPY <span className="text-red-500">ZONE</span>
                </motion.h1>
                <p className="text-lg sm:text-2xl font-black tracking-widest text-white/80 mb-2">Create AI Stream Packs Instantly</p>
                <p className="text-sm text-white/40 tracking-wider">6 CONSISTENT ASSETS · OVERLAYS · ALERTS · WEBCAM FRAMES</p>
              </motion.div>

              <motion.div
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ delay: 0.5 }}
                className="bg-[#0d0d0d]/90 border border-[#2a2a2a] rounded-2xl p-7 w-full max-w-sm shadow-[0_0_80px_rgba(204,34,34,0.2)] backdrop-blur-md"
              >
                <motion.div animate={{ boxShadow: ["0 0 30px rgba(204,34,34,0.4)","0 0 70px rgba(204,34,34,0.9)","0 0 30px rgba(204,34,34,0.4)"] }} transition={{ repeat: Infinity, duration: 2.5 }} className="w-20 h-20 rounded-full mx-auto mb-4 overflow-hidden border-2 border-red-600">
                  <img src="/creepy-zone-banner.png" alt="CZ" className="w-full h-full object-cover object-top" />
                </motion.div>
                <h2 className="text-2xl font-black tracking-widest text-white mb-1 text-center" style={{ textShadow: "0 0 20px rgba(204,34,34,0.7)" }}>CREEPY <span className="text-red-500">ZONE</span></h2>
                <p className="text-[9px] tracking-[0.3em] text-white/30 mb-5 text-center">AI STREAM ASSET GENERATOR</p>
                <motion.button whileHover={{ scale: 1.03, boxShadow: "0 0 40px rgba(204,34,34,0.7)" }} whileTap={{ scale: 0.97 }} onClick={() => setPhase("auth")} className="w-full py-4 rounded-xl font-black tracking-widest text-white flex items-center justify-center gap-2 mb-3" style={{ background: "linear-gradient(135deg,#7b0000,#cc2222)" }}>
                  <Zap className="w-5 h-5" />ENTER THE CREEPY ZONE
                </motion.button>
                <p className="text-center text-[11px] text-green-400/80 font-bold tracking-wider">✓ COMPLETELY FREE FOR 24 HOURS</p>
                <p className="text-center text-[10px] text-white/20 mt-0.5">NO CREDIT CARD · $5/WEEK OR $15/MONTH AFTER</p>
              </motion.div>
            </div>
          ) : (
            <div className="relative z-10 flex flex-col items-center justify-center min-h-screen px-4 py-8">
              <motion.div initial={{ scale: 0.9, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} className="bg-[#0d0d0d]/92 border border-[#2a2a2a] rounded-2xl p-7 w-full max-w-sm shadow-[0_0_80px_rgba(204,34,34,0.2)] backdrop-blur-md">
                <motion.div animate={{ boxShadow: ["0 0 30px rgba(204,34,34,0.4)","0 0 70px rgba(204,34,34,0.9)","0 0 30px rgba(204,34,34,0.4)"] }} transition={{ repeat: Infinity, duration: 2.5 }} className="w-20 h-20 rounded-full mx-auto mb-4 overflow-hidden border-2 border-red-600">
                  <img src="/creepy-zone-banner.png" alt="CZ" className="w-full h-full object-cover object-top" />
                </motion.div>
                <h2 className="text-2xl font-black tracking-widest text-white text-center mb-5" style={{ textShadow: "0 0 20px rgba(204,34,34,0.7)" }}>CREEPY <span className="text-red-500">ZONE</span></h2>
                <div className="space-y-3">
                  <div className="flex gap-1 mb-1">
                    {(["login","register"] as const).map((m) => (
                      <button key={m} onClick={() => { setAuthMode(m); setAuthError(""); }} className={`flex-1 py-2 rounded-lg text-sm font-bold tracking-wider transition-all ${authMode === m ? "bg-red-700 text-white" : "bg-[#1a1a1a] text-white/40 hover:text-white/70"}`}>{m === "login" ? "LOGIN" : "REGISTER"}</button>
                    ))}
                  </div>
                  {authMode === "register" && (
                    <div className="relative"><User className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-white/20" />
                      <input type="text" placeholder="Display name (optional)" value={displayName} onChange={(e) => setDisplayName(e.target.value)} className="w-full pl-9 pr-4 py-2.5 bg-[#0a0a0a] border border-[#222] rounded-lg text-white placeholder:text-white/20 focus:outline-none focus:border-red-500 text-sm" /></div>
                  )}
                  <div className="relative"><Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-white/20" />
                    <input type="email" placeholder="Email address" value={email} onChange={(e) => setEmail(e.target.value)} className="w-full pl-9 pr-4 py-2.5 bg-[#0a0a0a] border border-[#222] rounded-lg text-white placeholder:text-white/20 focus:outline-none focus:border-red-500 text-sm" /></div>
                  <div className="relative"><Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-white/20" />
                    <input type={showPw ? "text" : "password"} placeholder="Password (min 6 chars)" value={password} onChange={(e) => setPassword(e.target.value)} onKeyDown={(e) => e.key === "Enter" && handleAuth()} className="w-full pl-9 pr-10 py-2.5 bg-[#0a0a0a] border border-[#222] rounded-lg text-white placeholder:text-white/20 focus:outline-none focus:border-red-500 text-sm" />
                    <button onClick={() => setShowPw((p) => !p)} className="absolute right-3 top-1/2 -translate-y-1/2 text-white/20 hover:text-white/50">{showPw ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}</button>
                  </div>
                  {authError && <p className="text-red-400 text-xs px-1">{authError}</p>}
                  <motion.button whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }} onClick={handleAuth} disabled={authLoading} className="w-full py-3 rounded-xl font-black tracking-widest text-white disabled:opacity-50" style={{ background: "linear-gradient(135deg,#7b0000,#cc2222)" }}>
                    {authLoading ? "LOADING…" : authMode === "login" ? "LOGIN & ENTER" : "CREATE ACCOUNT"}
                  </motion.button>
                  <div className="relative flex items-center gap-3 py-1"><div className="flex-1 h-px bg-[#222]" /><span className="text-xs text-white/20">OR</span><div className="flex-1 h-px bg-[#222]" /></div>
                  <button
                    type="button"
                    onClick={() => void handleGoogleAuth()}
                    disabled={authLoading}
                    className="w-full py-2.5 rounded-xl font-bold tracking-wider text-white/60 border border-[#222] hover:border-[#333] hover:text-white/80 transition-colors flex items-center justify-center gap-2 text-sm disabled:opacity-50"
                  >
                    <svg className="w-4 h-4" viewBox="0 0 24 24"><path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4"/><path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853"/><path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" fill="#FBBC05"/><path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335"/></svg>
                    Continue with Google
                  </button>
                  <p className="text-center text-[10px] text-white/20">✓ FREE 24H TRIAL · NO CARD NEEDED</p>
                </div>
              </motion.div>
            </div>
          )}
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#050505] text-white">
      {/* Theme-reactive background glow that follows mouse */}
      <div
        className="fixed inset-0 pointer-events-none transition-all duration-700"
        style={{
          background: `radial-gradient(ellipse at ${50 + mousePos.x * 20}% ${50 + mousePos.y * 20}%, ${themeGlow} 0%, transparent 70%)`,
          zIndex: 0,
        }}
      />
      <div className="fixed inset-0 bg-cover bg-center opacity-[0.04] pointer-events-none" style={{ backgroundImage: "url('/creepy-zone-banner.png')", transform: `translate(${mousePos.x * 12}px, ${mousePos.y * 12}px)`, transition: "transform 0.3s ease-out" }} />

      {/* NAVBAR */}
      <nav className="bg-[#0a0a0a]/95 border-b border-[#1a1a1a] px-5 py-3 flex items-center justify-between sticky top-0 z-40 backdrop-blur-sm">
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 rounded-full overflow-hidden border border-red-600/50 shrink-0"><img src="/creepy-zone-banner.png" alt="CZ" className="w-full h-full object-cover object-top" /></div>
          <div><span className="text-lg font-black tracking-widest text-white">CREEPY <span className="text-red-500">ZONE</span></span><p className="text-[8px] text-white/25 tracking-wider hidden sm:block">AI STREAM ASSET GENERATOR</p></div>
        </div>
        <div className="flex items-center gap-3">
          {isLocked && <button onClick={() => setPayoneerPlan("weekly")} className="px-3 py-1.5 rounded text-xs font-bold bg-red-500/20 text-red-400 border border-red-500/40 hover:bg-red-500/30 transition-colors tracking-wider">UPGRADE</button>}
          <div className="w-8 h-8 rounded-full bg-red-800 border border-red-600/40 flex items-center justify-center font-black text-sm shrink-0">{username[0]?.toUpperCase()}</div>
          <span className="text-sm text-white/60 font-bold tracking-wider hidden sm:block">{username}</span>
          <button onClick={logout} className="text-white/25 hover:text-white/50 transition-colors"><LogOut className="w-4 h-4" /></button>
        </div>
      </nav>

      {backendUnavailable && (
        <div className="mx-auto mt-3 max-w-5xl px-4">
          <div className="rounded-xl border border-amber-500/40 bg-amber-950/50 px-4 py-3 text-xs text-amber-200">
            API backend is not reachable from this frontend domain. Configure `VITE_API_BASE_URL` to
            your deployed API service and redeploy.
          </div>
        </div>
      )}

      {sessionData && <CountdownBar trialEndsAt={sessionData.trialEndsAt} />}

      <div className="max-w-5xl mx-auto px-4 py-8 space-y-7 relative z-10">
        {isLocked && (
          <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }} className="bg-red-900/25 border border-red-500/35 rounded-xl p-4 flex items-center gap-4">
            <Lock className="w-6 h-6 text-red-400 shrink-0" />
            <div className="flex-1"><p className="font-bold text-red-300 tracking-wider">TRIAL ENDED</p><p className="text-sm text-red-400/50">Subscribe via Payoneer to continue.</p></div>
            <button onClick={() => setPayoneerPlan("weekly")} className="px-4 py-2 rounded-lg font-bold text-white text-sm tracking-wider shrink-0" style={{ background: "linear-gradient(135deg,#7b0000,#cc2222)" }}>UNLOCK</button>
          </motion.div>
        )}

        {errorMsg && (
          <div className="bg-red-900/20 border border-red-500/30 rounded-xl p-4 text-red-300 text-sm flex items-start gap-3">
            <span className="text-red-400 shrink-0">⚠</span>
            <div className="flex-1">{errorMsg}</div>
            <button onClick={() => setErrorMsg(null)} className="text-white/30 hover:text-white/60"><X className="w-4 h-4" /></button>
          </div>
        )}

        {/* MASTER PROMPT */}
        <section className="bg-[#0d0d0d] border border-orange-500/20 rounded-xl overflow-hidden">
          <button onClick={() => setShowMasterPrompt((p) => !p)} className="w-full flex items-center justify-between px-5 py-4 hover:bg-[#111] transition-colors">
            <div className="flex items-center gap-3"><BookOpen className="w-5 h-5 text-orange-400" /><div className="text-left"><p className="font-black text-white tracking-wider">MASTER PROMPT</p><p className="text-xs text-white/30">Copy this for consistent character across all 6 assets</p></div></div>
            {showMasterPrompt ? <ChevronUp className="w-5 h-5 text-orange-400" /> : <ChevronDown className="w-5 h-5 text-orange-400" />}
          </button>
          <AnimatePresence>
            {showMasterPrompt && (
              <motion.div initial={{ height: 0, opacity: 0 }} animate={{ height: "auto", opacity: 1 }} exit={{ height: 0, opacity: 0 }} transition={{ duration: 0.2 }} className="overflow-hidden">
                <div className="px-5 pb-5">
                  <div className="relative">
                    <pre className="bg-[#080808] border border-[#222] rounded-xl p-4 text-xs text-white/60 whitespace-pre-wrap font-mono overflow-auto max-h-60">{MASTER_PROMPT}</pre>
                    <button onClick={copyMaster} className="absolute top-3 right-3 flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-orange-500/20 border border-orange-500/40 text-orange-400 text-xs font-bold tracking-wider hover:bg-orange-500/30 transition-colors">
                      {copyMasterPrompt ? <><Check className="w-3 h-3" />COPIED!</> : <><Copy className="w-3 h-3" />COPY PROMPT</>}
                    </button>
                  </div>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </section>

        {/* IMAGE GENERATOR */}
        <section className="bg-[#0d0d0d] border border-[#1a1a1a] rounded-xl p-6 relative overflow-hidden" style={{ boxShadow: `0 0 30px ${themeGlow}` }}>
          {isLocked && <LockOverlay onUnlock={() => setPayoneerPlan("weekly")} />}
          <div className="mb-5"><h2 className="text-xl font-black tracking-widest text-white flex items-center gap-2"><Sparkles className="w-5 h-5 text-red-400" />AI STREAM PACK GENERATOR</h2><p className="text-xs text-white/25 tracking-wider mt-1">GENERATES 6 CONSISTENT ASSETS · STARTING SOON · BRB · ENDING · WEBCAM · CHAT · ALERTS</p></div>
          <div className="space-y-5">

            {/* UPLOAD + MASTER IMAGE */}
            <div>
              <div className="flex items-center gap-2 mb-2">
                <span className="w-5 h-5 rounded-full bg-red-700 text-white text-[10px] font-black flex items-center justify-center">1</span>
                <label className="text-sm font-bold tracking-widest text-orange-400">MASTER CHARACTER REFERENCE</label>
              </div>
              <input ref={fileInputRef} type="file" accept="image/*" onChange={handleUploadImage} className="hidden" />
              {masterImageUrl ? (
                <div className="flex items-center gap-3 p-3 bg-orange-500/10 border border-orange-500/25 rounded-xl">
                  <img src={masterImageUrl} alt="Master" className="w-20 h-14 object-cover rounded-lg border border-orange-500/30" />
                  <div className="flex-1">
                    <p className="text-xs text-orange-400 font-bold tracking-wider">✓ MASTER CHARACTER LOCKED</p>
                    <p className="text-xs text-white/35 mt-0.5">{masterImageName}</p>
                    <p className="text-[10px] text-white/20 mt-0.5">AI will maintain this character across all 6 assets</p>
                  </div>
                  <button onClick={() => { setMasterImageUrl(null); setMasterImageName(null); }} className="text-white/25 hover:text-red-400 transition-colors"><X className="w-4 h-4" /></button>
                </div>
              ) : (
                <div className="flex gap-3">
                  <button onClick={() => fileInputRef.current?.click()} className="flex-1 py-3 rounded-xl border-2 border-dashed border-[#333] hover:border-orange-500/50 transition-colors flex items-center justify-center gap-2 text-sm font-bold text-white/40 hover:text-orange-400">
                    <Upload className="w-4 h-4" />UPLOAD YOUR CHARACTER IMAGE
                  </button>
                  <div className="flex items-center px-3 text-xs text-white/20">OR</div>
                  <div className="flex-1 flex items-center px-4 py-3 rounded-xl border border-[#222] bg-[#080808]">
                    <ImageIcon className="w-4 h-4 text-white/20 mr-2 shrink-0" />
                    <p className="text-xs text-white/25">Describe your character below to generate reference</p>
                  </div>
                </div>
              )}
            </div>

            {/* PROMPT */}
            <div>
              <div className="flex items-center gap-2 mb-2">
                <span className="w-5 h-5 rounded-full bg-red-700 text-white text-[10px] font-black flex items-center justify-center">2</span>
                <label className="text-sm font-bold tracking-widest text-orange-400">CHARACTER & SCENE DESCRIPTION</label>
              </div>
              <textarea value={prompt} onChange={(e) => setPrompt(e.target.value)} placeholder="e.g. hooded dark figure in gothic castle throne room, blood red robes, glowing purple eyes, ancient stone walls…" className="w-full px-4 py-3 bg-[#080808] border border-[#222] rounded-xl text-white placeholder:text-white/20 focus:outline-none focus:border-red-500 h-24 resize-none text-sm transition-colors" />
              <p className="text-[10px] text-white/20 mt-1 ml-1">💡 Select a theme below — it auto-loads a prompt for that theme</p>
            </div>

            {/* THEMES */}
            <div>
              <div className="flex items-center justify-between mb-2">
                <div className="flex items-center gap-2">
                  <span className="w-5 h-5 rounded-full bg-red-700 text-white text-[10px] font-black flex items-center justify-center">3</span>
                  <label className="text-sm font-bold tracking-widest text-orange-400">AESTHETIC THEME</label>
                </div>
                <span className="text-xs text-white/30">SELECTED: <span className="text-orange-400 font-bold">{selectedImageTheme}</span></span>
              </div>
              <ThemeGrid themes={IMAGE_THEMES} selected={selectedImageTheme} onSelect={handleThemeSelect} />
            </div>

            {isGeneratingImage ? (
              <ProgressBar progress={imageProgress} messages={["AI GENERATING STREAM PACK…","CREATING STARTING SOON…","BUILDING BE RIGHT BACK…","CRAFTING STREAM ENDING…","DESIGNING WEBCAM OVERLAY…","GENERATING CHAT BOX…","FINALIZING ALERT BOX…","APPLYING CONSISTENCY…","ALMOST THERE…"]} label="GENERATING" />
            ) : (
              <motion.button whileHover={{ scale: 1.01, boxShadow: "0 0 40px rgba(204,34,34,0.5)" }} whileTap={{ scale: 0.99 }} onClick={handleGenerateImages} disabled={!prompt.trim()} className="w-full py-5 rounded-xl font-black tracking-widest text-white text-lg flex items-center justify-center gap-3 disabled:opacity-35 disabled:cursor-not-allowed transition-all" style={{ background: "linear-gradient(135deg,#7b0000,#cc2222,#e05a2b)" }}>
                <Zap className="w-6 h-6" />GENERATE STREAM PACK WITH AI
              </motion.button>
            )}
          </div>
        </section>

        {/* GENERATED IMAGES */}
        {generatedImages.length > 0 && (
          <section>
            <div className="flex items-center justify-between mb-5">
              <div><h2 className="text-xl font-black tracking-widest">YOUR STREAM PACK</h2><p className="text-xs text-white/25 mt-0.5">CLICK IMAGE TO SELECT FOR VIDEO · REGENERATE INDIVIDUALLY</p></div>
              <motion.button whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }} onClick={handleDownloadZip} disabled={isDownloadingZip} className="px-4 py-2 rounded-lg font-bold text-white text-sm flex items-center gap-2 tracking-wider disabled:opacity-50" style={{ background: "linear-gradient(135deg,#7b0000,#cc2222)" }}>
                <Download className="w-4 h-4" />{isDownloadingZip ? "PACKING…" : "DOWNLOAD ALL (ZIP)"}
              </motion.button>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
              {generatedImages.map((img, i) => (
                <motion.div key={i} initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.07 }}
                  onClick={() => { setSelectedImageForVideo(img.url); setSelectedImageLabelForVideo(img.label); }}
                  className={`bg-[#0d0d0d] border rounded-xl overflow-hidden cursor-pointer transition-all relative ${selectedImageForVideo === img.url ? "border-orange-500 shadow-[0_0_20px_rgba(224,90,43,0.35)]" : "border-[#1a1a1a] hover:border-red-500/40"}`}>
                  <div className="relative aspect-video overflow-hidden bg-[#080808]">
                    <img src={img.url} alt={img.label} className="w-full h-full object-cover" />
                    {regeneratingIndex === i && (
                      <div className="absolute inset-0 bg-black/70 flex items-center justify-center"><motion.div animate={{ rotate: 360 }} transition={{ repeat: Infinity, duration: 1, ease: "linear" }}><RefreshCw className="w-8 h-8 text-orange-400" /></motion.div></div>
                    )}
                    {selectedImageForVideo === img.url && <div className="absolute top-2 right-2 w-6 h-6 rounded-full bg-orange-500 flex items-center justify-center"><Check className="w-4 h-4 text-white" /></div>}
                  </div>
                  <div className="p-3">
                    <div className="flex items-center justify-between mb-1">
                      <span className="font-bold text-sm text-white">{img.label}</span>
                      <span className="text-[9px] px-1.5 py-0.5 rounded bg-red-500/20 text-red-400 border border-red-500/25 font-bold tracking-wider">{img.tag}</span>
                    </div>
                    <p className="text-xs text-white/25 mb-3">{img.dim}</p>
                    <div className="flex gap-2">
                      <button onClick={(e) => { e.stopPropagation(); handleDownloadSingle(img.url, img.label); }} className="flex-1 py-1.5 rounded-lg text-xs font-bold text-white/40 border border-[#222] hover:border-orange-500/50 hover:text-orange-400 transition-colors tracking-wider flex items-center justify-center gap-1">
                        <Download className="w-3 h-3" />DOWNLOAD
                      </button>
                      <button onClick={(e) => { e.stopPropagation(); handleRegenerateScene(i); }} disabled={regeneratingIndex !== null} className="px-3 py-1.5 rounded-lg text-xs font-bold text-white/40 border border-[#222] hover:border-red-500/50 hover:text-red-400 transition-colors disabled:opacity-40" title="Regenerate this scene">
                        <RefreshCw className="w-3 h-3" />
                      </button>
                    </div>
                  </div>
                </motion.div>
              ))}
            </div>
          </section>
        )}

        {/* VIDEO ANIMATION */}
        <section className="bg-[#0d0d0d] border border-[#1a1a1a] rounded-xl p-6 relative overflow-hidden" style={{ boxShadow: `0 0 25px ${themeGlow}` }}>
          {isLocked && <LockOverlay onUnlock={() => setPayoneerPlan("weekly")} />}
          <div className="mb-4"><h2 className="text-xl font-black tracking-widest flex items-center gap-2"><Play className="w-5 h-5 text-red-400" />INTRO ANIMATION GENERATOR</h2><p className="text-xs text-white/25 tracking-wider mt-1">AI GENERATES CINEMATIC ANIMATED INTRO FOR YOUR STREAM</p></div>

          {selectedImageForVideo ? (
            <motion.div initial={{ opacity: 0, x: -10 }} animate={{ opacity: 1, x: 0 }} className="mb-4 p-3 bg-orange-500/10 border border-orange-500/25 rounded-xl flex items-center gap-3">
              <img src={selectedImageForVideo} alt="selected" className="w-16 h-10 object-cover rounded-lg" />
              <div className="flex-1"><p className="text-xs text-orange-400 font-bold tracking-wider">✓ IMAGE SELECTED FOR ANIMATION</p><p className="text-xs text-white/35">{selectedImageLabelForVideo}</p></div>
              <button onClick={() => { setSelectedImageForVideo(null); setSelectedImageLabelForVideo(null); }} className="text-white/25 hover:text-white/50"><X className="w-4 h-4" /></button>
            </motion.div>
          ) : generatedImages.length > 0 ? (
            <div className="mb-4 p-3 bg-[#111] border border-[#222] rounded-xl">
              <p className="text-xs text-white/35 mb-2 tracking-wider">SELECT AN IMAGE TO ANIMATE:</p>
              <div className="flex gap-2 overflow-x-auto pb-1">
                {generatedImages.map((img, i) => (
                  <button key={i} onClick={() => { setSelectedImageForVideo(img.url); setSelectedImageLabelForVideo(img.label); }} className="shrink-0 rounded-lg overflow-hidden border-2 border-[#222] hover:border-red-500 transition-colors">
                    <img src={img.url} alt={img.label} className="w-20 h-12 object-cover" />
                    <p className="text-[8px] text-white/40 px-1 py-0.5 text-center">{img.label}</p>
                  </button>
                ))}
              </div>
            </div>
          ) : null}

          <div className="space-y-4">
            <div>
              <div className="flex items-center justify-between mb-2">
                <div className="flex items-center gap-2">
                  <span className="w-5 h-5 rounded-full bg-red-700 text-white text-[10px] font-black flex items-center justify-center">1</span>
                  <label className="text-sm font-bold tracking-widest text-orange-400">ANIMATION STYLE</label>
                </div>
                <span className="text-xs text-white/30">SELECTED: <span className="text-orange-400 font-bold">{selectedVideoTheme}</span></span>
              </div>
              <ThemeGrid themes={VIDEO_THEMES} selected={selectedVideoTheme} onSelect={setSelectedVideoTheme} />
            </div>
            <div>
              <div className="flex items-center gap-2 mb-2">
                <span className="w-5 h-5 rounded-full bg-red-700 text-white text-[10px] font-black flex items-center justify-center">2</span>
                <label className="text-sm font-bold tracking-widest text-orange-400">ANIMATION DESCRIPTION <span className="text-white/25">(OPTIONAL)</span></label>
              </div>
              <input type="text" value={videoPrompt} onChange={(e) => setVideoPrompt(e.target.value)} placeholder="e.g. epic reveal with fire particles, cinematic slow zoom, dramatic lighting…" className="w-full px-4 py-2.5 bg-[#080808] border border-[#222] rounded-xl text-white placeholder:text-white/20 focus:outline-none focus:border-red-500 text-sm" />
            </div>
            {isGeneratingVideo ? (
              <ProgressBar progress={videoProgress} messages={["AI CREATING ANIMATION…","COMPOSING CINEMATIC SEQUENCE…","APPLYING DRAMATIC EFFECTS…","ADDING MOTION & PARTICLES…","RENDERING FINAL FRAME…","ALMOST READY…"]} label="ANIMATING" />
            ) : (
              <motion.button whileHover={{ scale: 1.01, boxShadow: "0 0 35px rgba(204,34,34,0.5)" }} whileTap={{ scale: 0.99 }} onClick={handleGenerateVideo} className="w-full py-4 rounded-xl font-black tracking-widest text-white text-base flex items-center justify-center gap-3 transition-all" style={{ background: "linear-gradient(135deg,#7b0000,#cc2222,#e05a2b)" }}>
                <Play className="w-5 h-5" />GENERATE ANIMATION INTRO
              </motion.button>
            )}
          </div>

          {generatedVideoUrl && (
            <motion.div initial={{ opacity: 0, y: 15 }} animate={{ opacity: 1, y: 0 }} className="mt-5">
              <p className="text-xs text-white/25 tracking-wider mb-2">ANIMATED PREVIEW — ADD TO OBS AS BROWSER SOURCE</p>
              <div className="relative rounded-xl overflow-hidden border border-orange-500/25">
                <motion.img src={generatedVideoUrl} alt="Animation" className="w-full" animate={{ scale: [1,1.04,1.01,1.05,1], filter: ["brightness(1)","brightness(1.2)","brightness(0.95)","brightness(1.15)","brightness(1)"] }} transition={{ repeat: Infinity, duration: 3, ease: "easeInOut" }} />
                <motion.div className="absolute inset-0" style={{ background: "linear-gradient(45deg,rgba(204,34,34,0.08),transparent,rgba(224,90,43,0.08))" }} animate={{ opacity: [0.3,0.8,0.3] }} transition={{ repeat: Infinity, duration: 2 }} />
                <div className="absolute bottom-0 inset-x-0 bg-gradient-to-t from-black/70 to-transparent p-4">
                  <p className="text-white font-bold text-sm tracking-wider">▶ LIVE ANIMATED PREVIEW</p>
                </div>
              </div>
              <div className="flex gap-2 mt-3">
                <button onClick={() => handleDownloadSingle(generatedVideoUrl, "intro_animation")} className="flex-1 py-2.5 rounded-xl font-bold text-white/50 border border-[#222] hover:border-orange-500/50 hover:text-orange-400 transition-colors text-sm tracking-wider flex items-center justify-center gap-2">
                  <Download className="w-4 h-4" />DOWNLOAD ANIMATION FRAME
                </button>
                <button onClick={handleGenerateVideo} className="px-4 py-2.5 rounded-xl font-bold text-white/40 border border-[#222] hover:border-red-500/50 hover:text-red-400 transition-colors text-sm flex items-center justify-center gap-1.5">
                  <RefreshCw className="w-4 h-4" />REGENERATE
                </button>
              </div>
            </motion.div>
          )}
        </section>

        {/* PAYMENT PLANS */}
        <section className="bg-[#0d0d0d] border border-[#1a1a1a] rounded-xl p-6">
          <div className="flex items-center gap-3 mb-5"><CreditCard className="w-5 h-5 text-orange-400" /><div><h2 className="text-lg font-black tracking-widest">UNLOCK FULL ACCESS</h2><p className="text-xs text-white/30">PAY VIA PAYONEER AFTER FREE TRIAL</p></div></div>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {[{ plan: "weekly", price: 5, label: "WEEKLY PLAN", sub: "7 days · unlimited generations" } as const,
              { plan: "monthly", price: 15, label: "MONTHLY PLAN", sub: "30 days · best value ⭐", best: true } as const].map(({ plan, price, label, sub, best }) => (
              <motion.button key={plan} whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }} onClick={() => setPayoneerPlan(plan)} className={`p-5 rounded-xl border-2 transition-all text-left relative overflow-hidden ${best ? "border-orange-500/30 hover:border-orange-500/70" : "border-[#222] hover:border-orange-500/60"}`}>
                {best && <div className="absolute top-3 right-3 bg-orange-500 text-white text-[9px] font-black px-2 py-0.5 rounded-full tracking-wider">BEST VALUE</div>}
                <p className="text-xs text-white/40 tracking-widest mb-1">{label}</p>
                <p className="text-4xl font-black text-orange-400" style={{ textShadow: "0 0 20px rgba(224,90,43,0.5)" }}>${price}</p>
                <p className="text-xs text-white/30 mt-2">{sub}</p>
                <div className="mt-3 px-4 py-2 rounded-lg bg-orange-500/15 text-orange-400 font-bold text-xs tracking-wider text-center">PAY WITH PAYONEER →</div>
              </motion.button>
            ))}
          </div>
        </section>

        {paymentHistory && paymentHistory.payments.length > 0 && (
          <section className="bg-[#0d0d0d] border border-[#1a1a1a] rounded-xl p-5">
            <div className="flex items-center gap-3 mb-4"><History className="w-5 h-5 text-white/40" /><h2 className="text-base font-black tracking-widest">PAYMENT HISTORY</h2></div>
            <div className="space-y-2">
              {paymentHistory.payments.map((p) => {
                const active = p.expiresAt ? new Date(p.expiresAt) > new Date() : false;
                return (
                  <div key={p.id} className="flex items-center gap-4 p-3 bg-[#0a0a0a] rounded-lg border border-[#1a1a1a]">
                    <div className="flex-1"><p className="text-sm font-bold text-white tracking-wider">{p.plan.toUpperCase()} · ${p.amount}</p><p className="text-xs text-white/25 mt-0.5">{new Date(p.createdAt).toLocaleDateString()} · expires {new Date(p.expiresAt).toLocaleDateString()}</p></div>
                    <span className={`text-xs font-bold px-2 py-1 rounded-lg border tracking-wider ${active ? "bg-green-500/20 text-green-400 border-green-500/30" : "bg-[#1a1a1a] text-white/25 border-[#222]"}`}>{active ? "ACTIVE" : "EXPIRED"}</span>
                  </div>
                );
              })}
            </div>
          </section>
        )}

        <section className="bg-[#0d0d0d] border border-[#1a1a1a] rounded-xl p-7 text-center relative overflow-hidden">
          <div className="absolute inset-0 bg-cover bg-center opacity-[0.06]" style={{ backgroundImage: "url('/creepy-zone-banner.png')" }} />
          <div className="absolute inset-0 bg-gradient-to-b from-[#0d0d0d]/90 to-[#0d0d0d]/95" />
          <div className="relative z-10">
            <h2 className="text-2xl font-black tracking-widest mb-2">SUPPORT THE CREATOR</h2>
            <p className="text-white/40 text-sm mb-6 max-w-lg mx-auto leading-relaxed">Creepy Zone is <span className="text-green-400 font-bold">completely FREE for 24 hours</span> — no credit card, no signup fee. After your trial, subscribe via Payoneer.</p>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 max-w-md mx-auto mb-6">
              <div className="bg-[#0a0a0a] border border-[#222] rounded-xl p-4"><CreditCard className="w-7 h-7 text-orange-400 mx-auto mb-2" /><p className="text-[10px] text-white/30 tracking-widest mb-1">PAYONEER ID</p><p className="text-xl font-black text-orange-400 tracking-widest">{PAYONEER_ACCOUNT_ID}</p><p className="text-xs text-orange-300/70 mt-1">{PAYONEER_EMAIL}</p></div>
              <div className="bg-[#0a0a0a] border border-[#222] rounded-xl p-4"><Mail className="w-7 h-7 text-orange-400 mx-auto mb-2" /><p className="text-[10px] text-white/30 tracking-widest mb-1">CONTACT</p><p className="text-xs text-white/60 font-medium">{CONTACT_EMAIL}</p></div>
            </div>
            <div className="flex flex-col sm:flex-row gap-3 justify-center">
              <button onClick={() => setPayoneerPlan("weekly")} className="px-7 py-3 rounded-xl font-black tracking-widest text-white transition-all hover:scale-105" style={{ background: "linear-gradient(135deg,#7b0000,#cc2222)" }}>WEEKLY — $5</button>
              <button onClick={() => setPayoneerPlan("monthly")} className="px-7 py-3 rounded-xl font-black tracking-widest text-white/80 border border-orange-500/40 hover:bg-orange-500/10 transition-all hover:scale-105">MONTHLY — $15 ⭐</button>
            </div>
          </div>
        </section>

        <footer className="text-center pb-8 space-y-1">
          <p className="text-white/15 text-xs tracking-wider">CREEPY ZONE © 2026 · AI STREAM ASSET GENERATOR</p>
          <p className="text-white/10 text-xs tracking-wider">FIRST 24 HOURS FREE · NO CREDIT CARD REQUIRED</p>
          <p className="text-white/10 text-[11px]">{CONTACT_EMAIL}</p>
        </footer>
      </div>

      <FloatingChat />

      <AnimatePresence>
        {payoneerPlan && sessionId && (
          <PayoneerModal plan={payoneerPlan} sessionId={sessionId} onClose={() => setPayoneerPlan(null)} onSuccess={() => { setPayoneerPlan(null); refetchSession(); refetchPayments(); }} />
        )}
      </AnimatePresence>
    </div>
  );
}
