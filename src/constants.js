/* ── Fonts ── */
export const F = { h:"'Baloo 2', cursive", b:"'Poppins', sans-serif" };

/* ── Design tokens ──────────────────────────────────────────────
   Single source of truth for the system. Values below MATCH the
   numbers already used across the app, so swapping a literal for a
   token is a pure refactor (no visual change). Tune in a later pass.
   Migrate magic numbers to these over time. */

/* 4-based spacing scale */
export const SPACE = { xs:4, sm:8, md:12, lg:16, xl:20, xxl:24, xxxl:32 };

/* Radius scale (retire stray 14/18 over time → md/lg) */
export const RADIUS = { sm:12, md:16, lg:20, xl:24, pill:999 };

/* Elevation — named shadows. e1 == the card shadow used everywhere today. */
export const SHADOW = {
  e1: "0 2px 18px rgba(124,77,255,0.09)",   // resting cards
  e2: "0 10px 36px rgba(124,77,255,0.16)",  // sheets, pressed/active lift
};

/* Type scale — names for the sizes already in use */
export const TYPE = {
  display: { fontFamily:"'Baloo 2', cursive",   fontSize:28, fontWeight:800 },
  title:   { fontFamily:"'Baloo 2', cursive",   fontSize:20, fontWeight:800 },
  body:    { fontFamily:"'Poppins', sans-serif", fontSize:15, fontWeight:500 },
  caption: { fontFamily:"'Poppins', sans-serif", fontSize:13, fontWeight:500 },
  label:   { fontFamily:"'Poppins', sans-serif", fontSize:12, fontWeight:700,
             letterSpacing:1.2, textTransform:"uppercase" },
};

/* Motion — the only two curves the app should use */
export const EASE = {
  smooth: "cubic-bezier(0.22,1,0.36,1)",   // entrances, calm transitions
  pop:    "cubic-bezier(0.34,1.56,0.64,1)", // reward / select feedback
};

/* Content palette — saturated hues that carry WHITE text.
   These are deliberately separate from the pastel brand/surface
   tokens in LIGHT/DARK (which sit behind dark text / as tints).
   Affirmations + gratitude jar draw from here. */
export const CONTENT = {
  amber:  "#F9A825",
  rose:   "#EC407A",
  violet: "#7E57C2",
  blue:   "#1E88E5",
  green:  "#43A047",
  teal:   "#4DB6AC",
  coral:  "#FF7043",
  sky:    "#4FC3F7",
};

/* Canonical breathing phase colors — referenced by BreatheTab's
   techniques so the bubble, ring and labels never drift. */
export const BREATH_COLORS = { in:"#4FC3F7", hold:"#CE93D8", out:"#81C784" };

/* Gratitude jar/list colors — ONE array + ONE hash helper used by both
   the jar SVG and the recent list, so a gratitude is the same color in
   both places. */
export const GRAT_COLORS = ["#FFD54F","#F06292","#CE93D8","#4DB6AC","#FF8A65","#4FC3F7","#A5D6A7","#FF7043"];
export const gratColor = (key) => {
  const hash = String(key).split("").reduce((a,c)=>a+c.charCodeAt(0),0);
  return GRAT_COLORS[hash % GRAT_COLORS.length];
};

/* ── Themes ── */
export const LIGHT = {
  purple:"#7C4DFF", pink:"#F06292", yellow:"#FFD54F",
  mint:"#4DB6AC", sky:"#4FC3F7", coral:"#FF7043",
  bg:"#F7F4FF", text:"#2D2040", muted:"#9B8DB5", border:"#EEE9FF",
  card:"#ffffff", navBg:"#ffffff", navBorder:"#EEE9FF",
};
export const DARK = {
  purple:"#A78BFA", pink:"#F9A8D4", yellow:"#FDE68A",
  mint:"#6EE7B7", sky:"#7DD3FC", coral:"#FCA5A5",
  bg:"#0F0A1E", text:"#F3F0FF", muted:"#A78BFA",
  border:"#2E1F5E", card:"#1A1133", navBg:"#130D27", navBorder:"#2E1F5E",
};

/* ── Data ── */
export const MASCOTS = [
  {id:"fox",   name:"Finn",    color:"#FF7043", bg:"#FFF3E0"},
  {id:"bunny", name:"Blossom", color:"#EC407A", bg:"#FCE4EC"},
  {id:"bear",  name:"Bruno",   color:"#8D6E63", bg:"#EFEBE9"},
  {id:"owl",   name:"Ollie",   color:"#7E57C2", bg:"#EDE7F6"},
  {id:"cat",   name:"Luna",    color:"#26A69A", bg:"#E0F2F1"},
  {id:"dog",   name:"Sunny",   color:"#FFA726", bg:"#FFF8E1"},
];

export const MOODS = ["Amazing","Good","Okay","Sad","Angry","Worried"];
export const MOOD_COLORS = {Amazing:"#F9A825",Good:"#43A047",Okay:"#1E88E5",Sad:"#7B1FA2",Angry:"#E53935",Worried:"#E64A19"};
export const MOOD_BG = {Amazing:"#FFF9C4",Good:"#E8F5E9",Okay:"#E3F2FD",Sad:"#EDE7F6",Angry:"#FFEBEE",Worried:"#FBE9E7"};
export const MOOD_MESSAGES = {
  Amazing: { title:"You are absolutely glowing today!", sub:"That energy is contagious — keep shining!" },
  Good:    { title:"It feels great to feel good!", sub:"Hold onto that feeling — you deserve it." },
  Okay:    { title:"Okay days are perfectly normal.", sub:"Every day doesn't need to be amazing. You're doing great." },
  Sad:     { title:"It's okay to feel sad sometimes.", sub:"Your feelings are valid. Be gentle with yourself today." },
  Angry:   { title:"Feeling angry is completely normal.", sub:"Take a deep breath — let's work through it together." },
  Worried: { title:"It's okay to feel worried.", sub:"You are safe and supported. One breath at a time." },
};

export const ALL_AFFIRMATIONS = [
  {text:"I am brave and strong.",            color:"#FF7043", mood:"uplifting"},
  {text:"Today is a great day.",             color:"#F9A825", mood:"uplifting"},
  {text:"I believe in myself.",              color:"#FF7043", mood:"uplifting"},
  {text:"I am capable of great things.",     color:"#F9A825", mood:"uplifting"},
  {text:"I spread joy wherever I go.",       color:"#43A047", mood:"uplifting"},
  {text:"My smile can light up a room.",     color:"#4FC3F7", mood:"uplifting"},
  {text:"I am full of energy and life.",     color:"#FF7043", mood:"uplifting"},
  {text:"Great things are coming my way.",   color:"#F9A825", mood:"uplifting"},
  {text:"I make the world better.",          color:"#43A047", mood:"uplifting"},
  {text:"I am proud of who I am.",           color:"#EC407A", mood:"uplifting"},
  {text:"I am loved just as I am.",          color:"#EC407A", mood:"comforting"},
  {text:"My feelings are valid.",            color:"#7E57C2", mood:"comforting"},
  {text:"I am enough.",                      color:"#EC407A", mood:"comforting"},
  {text:"It is okay to have hard days.",     color:"#7E57C2", mood:"comforting"},
  {text:"I am never alone.",                 color:"#4DB6AC", mood:"comforting"},
  {text:"I am safe and I am loved.",         color:"#EC407A", mood:"comforting"},
  {text:"I can ask for help anytime.",       color:"#7E57C2", mood:"comforting"},
  {text:"Hard feelings always pass.",        color:"#4DB6AC", mood:"comforting"},
  {text:"I am stronger than I think.",       color:"#7E57C2", mood:"comforting"},
  {text:"My heart is big and full of love.", color:"#EC407A", mood:"comforting"},
  {text:"I am kind and caring.",             color:"#43A047", mood:"growth"},
  {text:"I can do hard things.",             color:"#1E88E5", mood:"growth"},
  {text:"Every day I grow a little more.",   color:"#43A047", mood:"growth"},
  {text:"I learn something new every day.",  color:"#1E88E5", mood:"growth"},
  {text:"I am curious and creative.",        color:"#FF7043", mood:"growth"},
  {text:"Mistakes help me grow.",            color:"#4DB6AC", mood:"growth"},
  {text:"I keep going even when it is hard.",color:"#1E88E5", mood:"growth"},
  {text:"I am getting better every day.",    color:"#43A047", mood:"growth"},
  {text:"I choose to be kind today.",        color:"#4DB6AC", mood:"growth"},
  {text:"I am on my own special journey.",   color:"#F9A825", mood:"growth"},
];

export const BREATHING = [
  {phase:"Breathe In",  duration:4, color:BREATH_COLORS.in},
  {phase:"Hold",        duration:2, color:BREATH_COLORS.hold},
  {phase:"Breathe Out", duration:4, color:BREATH_COLORS.out},
];

export const JOURNAL_PROMPTS = [
  "What made you smile today?",
  "What is something you are proud of?",
  "Who is someone you love and why?",
  "What is your favourite thing about yourself?",
  "What made you feel brave today?",
];

export const BADGE_DEFS = [
  {id:"first_checkin", icon:"star",   label:"First Check-in",  check:(ml,j,b,a)=>ml.length>=1},
  {id:"mood_explorer", icon:"mood",   label:"Mood Explorer",   check:(ml,j,b,a)=>new Set(ml.map(e=>e.mood)).size>=6},
  {id:"brave_heart",   icon:"heart",  label:"Brave Heart",     check:(ml,j,b,a)=>j.length>=5},
  {id:"week_streak",   icon:"fire",   label:"7-Day Streak",    check:(ml,j,b,a)=>getStreak(ml)>=7},
  {id:"affirm_pro",    icon:"trophy", label:"Affirmation Pro", check:(ml,j,b,a)=>a>=20},
  {id:"calm_champ",    icon:"wind",   label:"Calm Champion",   check:(ml,j,b,a)=>b>=5},
];

export const STAGE_BGSANIM = [
  "linear-gradient(160deg,#A5D6A744 0%,#E8F5E944 50%,#F7F4FF 100%)",
  "linear-gradient(160deg,#4DB6AC44 0%,#E0F2F144 50%,#F7F4FF 100%)",
  "linear-gradient(160deg,#7C4DFF33 0%,#EDE7F644 50%,#F7F4FF 100%)",
  "linear-gradient(160deg,#FFD54F44 0%,#FFF9C444 50%,#F7F4FF 100%)",
];

/* ── Helpers ── */
/* Build a YYYY-MM-DD string from the device's LOCAL clock, not UTC.
   Using toISOString() (UTC) meant evenings in the Americas rolled over to the
   next day early, breaking "logged today", streaks, the weekly view, and mission
   resets. localDate() keeps the calendar day aligned with the user's real day. */
const pad2 = (n) => String(n).padStart(2, "0");
export const localDate = (d = new Date()) =>
  `${d.getFullYear()}-${pad2(d.getMonth() + 1)}-${pad2(d.getDate())}`;

export const today = () => localDate();

export const getStreak = (moodLog) => {
  if (!moodLog||moodLog.length===0) return 0;
  const dates = [...new Set(moodLog.map(e=>e.date))].sort().reverse();
  let streak=0; const d=new Date();
  for (let i=0;i<100;i++) {
    const s=localDate(d);
    if (dates.includes(s)) streak++; else if (i>0) break;
    d.setDate(d.getDate()-1);
  }
  return streak;
};

export const last7Days = () => {
  const days=["Sun","Mon","Tue","Wed","Thu","Fri","Sat"];
  return Array.from({length:7},(_,i)=>{
    const d=new Date(); d.setDate(d.getDate()-6+i);
    return {date:localDate(d),label:days[d.getDay()]};
  });
};

export const getSortedAffirmations = (lastMood) => {
  if (lastMood==="Amazing"||lastMood==="Good") {
    return [...ALL_AFFIRMATIONS.filter(a=>a.mood==="uplifting"),
            ...ALL_AFFIRMATIONS.filter(a=>a.mood!=="uplifting")];
  }
  if (lastMood==="Sad"||lastMood==="Worried"||lastMood==="Angry") {
    return [...ALL_AFFIRMATIONS.filter(a=>a.mood==="comforting"),
            ...ALL_AFFIRMATIONS.filter(a=>a.mood!=="comforting")];
  }
  return [...ALL_AFFIRMATIONS.filter(a=>a.mood==="growth"),
          ...ALL_AFFIRMATIONS.filter(a=>a.mood!=="growth")];
};

export const getTimeGreeting = () => {
  const h = new Date().getHours();
  if (h < 12) return "Good morning";
  if (h < 17) return "Good afternoon";
  return "Good evening";
};

/* ── Sound ── */
export const playSound = (type, enabled) => {
  if (!enabled) return;
  try {
    const ctx = new (window.AudioContext || window.webkitAudioContext)();
    const gain = ctx.createGain();
    gain.connect(ctx.destination);
    if (type === "whoosh") {
      const bufSize = ctx.sampleRate * 0.35;
      const buf = ctx.createBuffer(1, bufSize, ctx.sampleRate);
      const data = buf.getChannelData(0);
      for (let i = 0; i < bufSize; i++) data[i] = (Math.random() * 2 - 1);
      const source = ctx.createBufferSource();
      source.buffer = buf;
      const filter = ctx.createBiquadFilter();
      filter.type = "bandpass";
      filter.frequency.setValueAtTime(1200, ctx.currentTime);
      filter.frequency.exponentialRampToValueAtTime(200, ctx.currentTime + 0.3);
      filter.Q.value = 0.8;
      source.connect(filter); filter.connect(gain);
      gain.gain.setValueAtTime(0.18, ctx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.32);
      source.start(ctx.currentTime); source.stop(ctx.currentTime + 0.35);
    } else {
      const osc = ctx.createOscillator();
      osc.connect(gain);
      const sounds = {
        chime:   { freq:[523,659,784],      dur:0.1,  type:"sine", vol:0.13 },
        levelup: { freq:[523,659,784,1047], dur:0.12, type:"sine", vol:0.16 },
        tap:     { freq:[440],              dur:0.06, type:"sine", vol:0.07 },
      };
      const s = sounds[type] || sounds.chime;
      osc.type = s.type;
      s.freq.forEach((f, i) => { osc.frequency.setValueAtTime(f, ctx.currentTime + i * s.dur); });
      gain.gain.setValueAtTime(s.vol, ctx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + s.freq.length * s.dur + 0.1);
      osc.start(ctx.currentTime);
      osc.stop(ctx.currentTime + s.freq.length * s.dur + 0.15);
    }
  } catch(e) { /* audio not supported */ }
};

/* ── Haptics ── */
export const haptic = (ms = 10) => {
  try { if (navigator.vibrate) navigator.vibrate(ms); } catch(e) {}
};
