import { useState, useEffect, useCallback } from "react";
import { createClient } from "@supabase/supabase-js";

const SUPABASE_URL = "https://ymfvezvezzmckcdwjvzm.supabase.co";
const SUPABASE_KEY = "sb_publishable_5CR_k4TEBUYXhqm3AuN7bQ_Csiafdcs";
const supabase = createClient(SUPABASE_URL, SUPABASE_KEY);

const FontLoader = () => (
  <style>{`
    @import url('https://fonts.googleapis.com/css2?family=Baloo+2:wght@700;800;900&family=Poppins:wght@400;500;600;700&display=swap');
    *, *::before, *::after { box-sizing: border-box; margin: 0; padding: 0; }
    @keyframes floatUp { 0%,100%{transform:translateY(0)} 50%{transform:translateY(-10px)} }
    @keyframes pulse   { 0%,100%{transform:scale(1)}      50%{transform:scale(1.13)} }
    @keyframes fadeIn  { from{opacity:0;transform:translateY(10px)} to{opacity:1;transform:translateY(0)} }
    @keyframes scaleIn { from{opacity:0;transform:scale(0.92)} to{opacity:1;transform:scale(1)} }
    textarea:focus, input:focus { outline: none; }
    ::-webkit-scrollbar { width: 4px; }
    ::-webkit-scrollbar-thumb { background: #ddd; border-radius: 2px; }
  `}</style>
);

const C = {
  purple:"#7C4DFF", pink:"#F06292", yellow:"#FFD54F",
  mint:"#4DB6AC", sky:"#4FC3F7", coral:"#FF7043",
  bg:"#F7F4FF", text:"#2D2040", muted:"#9B8DB5", border:"#EEE9FF",
};
const F = { h:"'Baloo 2', cursive", b:"'Poppins', sans-serif" };

const Icon = ({ name, size=24, color=C.purple, style: st }) => {
  const s = { width:size, height:size, display:"block", flexShrink:0, ...st };
  const p = { stroke:color, strokeWidth:"2.2", strokeLinecap:"round", strokeLinejoin:"round", fill:"none" };
  const map = {
    home:    <svg viewBox="0 0 24 24" style={s}><path d="M3 12L12 4l9 8" {...p}/><path d="M5 10v9a1 1 0 001 1h4v-4h4v4h4a1 1 0 001-1v-9" {...p}/></svg>,
    mood:    <svg viewBox="0 0 24 24" style={s}><circle cx="12" cy="12" r="9" {...p}/><circle cx="9" cy="10" r="1.2" fill={color}/><circle cx="15" cy="10" r="1.2" fill={color}/><path d="M8.5 14.5c1 1.5 5.5 1.5 7 0" {...p}/></svg>,
    star:    <svg viewBox="0 0 24 24" style={s}><path d="M12 2l2.9 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l7.1-1.01L12 2z" stroke={color} strokeWidth="2" strokeLinejoin="round" fill={color} fillOpacity="0.15"/></svg>,
    wind:    <svg viewBox="0 0 24 24" style={s}><path d="M9.59 4.59A2 2 0 1 1 11 8H2" {...p}/><path d="M12.59 19.41A2 2 0 1 0 14 16H2" {...p}/><path d="M6 12h14.59a2 2 0 1 1-1.59 3.18" {...p}/></svg>,
    book:    <svg viewBox="0 0 24 24" style={s}><path d="M4 19.5A2.5 2.5 0 016.5 17H20" {...p}/><path d="M6.5 2H20v20H6.5A2.5 2.5 0 014 19.5v-15A2.5 2.5 0 016.5 2z" {...p}/><path d="M9 7h6M9 11h4" {...p}/></svg>,
    heart:   <svg viewBox="0 0 24 24" style={s}><path d="M20.84 4.61a5.5 5.5 0 00-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 00-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 000-7.78z" stroke={color} strokeWidth="2" fill={color} fillOpacity="0.15"/></svg>,
    trophy:  <svg viewBox="0 0 24 24" style={s}><path d="M8 21h8M12 17v4" {...p}/><path d="M5 3h14v6a7 7 0 01-14 0V3z" {...p}/><path d="M5 5H2v2a4 4 0 004 4M19 5h3v2a4 4 0 01-4 4" {...p}/></svg>,
    back:    <svg viewBox="0 0 24 24" style={s}><path d="M19 12H5M12 5l-7 7 7 7" {...p}/></svg>,
    check:   <svg viewBox="0 0 24 24" style={s}><path d="M20 6L9 17l-5-5" {...p}/></svg>,
    next:    <svg viewBox="0 0 24 24" style={s}><path d="M5 12h14M12 5l7 7-7 7" {...p}/></svg>,
    refresh: <svg viewBox="0 0 24 24" style={s}><path d="M23 4v6h-6" {...p}/><path d="M20.49 15a9 9 0 11-2.12-9.36L23 10" {...p}/></svg>,
    fire:    <svg viewBox="0 0 24 24" style={s}><path d="M12 22c-4.97 0-9-3.58-9-8 0-3 1.5-5.5 4-7-.5 2 .5 4 2 5 .5-2 2-4 4-5-1 2-.5 4.5 1 6 .5-1 1.5-2 1.5-3.5C17.5 12 18 14 18 16c0 3.31-2.69 6-6 6z" stroke={color} strokeWidth="2" fill={color} fillOpacity="0.18"/></svg>,
    flower:  <svg viewBox="0 0 24 24" style={s}><circle cx="12" cy="12" r="3" fill={color} fillOpacity="0.3" stroke={color} strokeWidth="1.5"/><ellipse cx="12" cy="5.5" rx="2.2" ry="3.2" fill={color} fillOpacity="0.18" stroke={color} strokeWidth="1.5"/><ellipse cx="12" cy="18.5" rx="2.2" ry="3.2" fill={color} fillOpacity="0.18" stroke={color} strokeWidth="1.5"/><ellipse cx="5.5" cy="12" rx="3.2" ry="2.2" fill={color} fillOpacity="0.18" stroke={color} strokeWidth="1.5"/><ellipse cx="18.5" cy="12" rx="3.2" ry="2.2" fill={color} fillOpacity="0.18" stroke={color} strokeWidth="1.5"/></svg>,
    plus:    <svg viewBox="0 0 24 24" style={s}><path d="M12 5v14M5 12h14" {...p}/></svg>,
    logout:  <svg viewBox="0 0 24 24" style={s}><path d="M9 21H5a2 2 0 01-2-2V5a2 2 0 012-2h4M16 17l5-5-5-5M21 12H9" {...p}/></svg>,
    trash:   <svg viewBox="0 0 24 24" style={s}><polyline points="3 6 5 6 21 6" {...p}/><path d="M19 6l-1 14a2 2 0 01-2 2H8a2 2 0 01-2-2L5 6M10 11v6M14 11v6M9 6V4a1 1 0 011-1h4a1 1 0 011 1v2" {...p}/></svg>,
  };
  return map[name] || null;
};

const MascotFace = ({ id, size=64 }) => {
  const faces = {
    fox:   <svg width={size} height={size} viewBox="0 0 80 80"><ellipse cx="40" cy="46" rx="28" ry="24" fill="#FF8A65"/><polygon points="13,18 26,44 38,24" fill="#FF7043"/><polygon points="67,18 54,44 42,24" fill="#FF7043"/><ellipse cx="40" cy="50" rx="16" ry="11" fill="#FFCCBC"/><circle cx="30" cy="41" r="5" fill="#fff"/><circle cx="50" cy="41" r="5" fill="#fff"/><circle cx="31" cy="42" r="2.5" fill="#1a1a2e"/><circle cx="51" cy="42" r="2.5" fill="#1a1a2e"/><circle cx="32" cy="41" r="1" fill="#fff"/><circle cx="52" cy="41" r="1" fill="#fff"/><ellipse cx="40" cy="53" rx="5" ry="3.5" fill="#EF5350"/><path d="M36 56 Q40 60 44 56" stroke="#555" strokeWidth="1.8" fill="none" strokeLinecap="round"/></svg>,
    bunny: <svg width={size} height={size} viewBox="0 0 80 80"><ellipse cx="27" cy="20" rx="7" ry="17" fill="#F8BBD0"/><ellipse cx="53" cy="20" rx="7" ry="17" fill="#F8BBD0"/><ellipse cx="40" cy="50" rx="26" ry="22" fill="#FCE4EC"/><ellipse cx="40" cy="55" rx="14" ry="10" fill="#F8BBD0"/><circle cx="30" cy="46" r="5" fill="#fff"/><circle cx="50" cy="46" r="5" fill="#fff"/><circle cx="31" cy="47" r="2.5" fill="#1a1a2e"/><circle cx="51" cy="47" r="2.5" fill="#1a1a2e"/><circle cx="32" cy="46" r="1" fill="#fff"/><circle cx="52" cy="46" r="1" fill="#fff"/><ellipse cx="40" cy="57" rx="5" ry="3" fill="#F48FB1"/><path d="M36 60 Q40 64 44 60" stroke="#555" strokeWidth="1.8" fill="none" strokeLinecap="round"/></svg>,
    bear:  <svg width={size} height={size} viewBox="0 0 80 80"><circle cx="20" cy="25" r="13" fill="#A1887F"/><circle cx="60" cy="25" r="13" fill="#A1887F"/><ellipse cx="40" cy="50" rx="27" ry="23" fill="#8D6E63"/><ellipse cx="40" cy="56" rx="16" ry="11" fill="#BCAAA4"/><circle cx="29" cy="45" r="5.5" fill="#fff"/><circle cx="51" cy="45" r="5.5" fill="#fff"/><circle cx="30" cy="46" r="2.8" fill="#1a1a2e"/><circle cx="52" cy="46" r="2.8" fill="#1a1a2e"/><circle cx="31" cy="45" r="1.1" fill="#fff"/><circle cx="53" cy="45" r="1.1" fill="#fff"/><ellipse cx="40" cy="58" rx="5" ry="3.5" fill="#795548"/><path d="M36 61 Q40 65 44 61" stroke="#555" strokeWidth="1.8" fill="none" strokeLinecap="round"/></svg>,
    owl:   <svg width={size} height={size} viewBox="0 0 80 80"><ellipse cx="40" cy="48" rx="26" ry="26" fill="#7E57C2"/><ellipse cx="40" cy="52" rx="18" ry="18" fill="#B39DDB"/><ellipse cx="22" cy="24" rx="7" ry="9" fill="#7E57C2"/><ellipse cx="58" cy="24" rx="7" ry="9" fill="#7E57C2"/><circle cx="29" cy="43" r="9" fill="#fff"/><circle cx="51" cy="43" r="9" fill="#fff"/><circle cx="29" cy="44" r="5" fill="#4527A0"/><circle cx="51" cy="44" r="5" fill="#4527A0"/><circle cx="30" cy="43" r="2" fill="#fff"/><circle cx="52" cy="43" r="2" fill="#fff"/><polygon points="40,51 37,56 43,56" fill="#FFA726"/></svg>,
    cat:   <svg width={size} height={size} viewBox="0 0 80 80"><polygon points="17,30 12,10 30,26" fill="#26A69A"/><polygon points="63,30 68,10 50,26" fill="#26A69A"/><ellipse cx="40" cy="50" rx="26" ry="23" fill="#4DB6AC"/><ellipse cx="40" cy="55" rx="15" ry="11" fill="#B2DFDB"/><circle cx="29" cy="45" r="5.5" fill="#fff"/><circle cx="51" cy="45" r="5.5" fill="#fff"/><circle cx="30" cy="46" r="2.8" fill="#1a1a2e"/><circle cx="52" cy="46" r="2.8" fill="#1a1a2e"/><circle cx="31" cy="45" r="1.1" fill="#fff"/><circle cx="53" cy="45" r="1.1" fill="#fff"/><ellipse cx="40" cy="57" rx="5" ry="3" fill="#FF8A80"/><path d="M36 60 Q40 64 44 60" stroke="#555" strokeWidth="1.8" fill="none" strokeLinecap="round"/></svg>,
    dog:   <svg width={size} height={size} viewBox="0 0 80 80"><ellipse cx="16" cy="36" rx="9" ry="16" fill="#FFA726" transform="rotate(-20 16 36)"/><ellipse cx="64" cy="36" rx="9" ry="16" fill="#FFA726" transform="rotate(20 64 36)"/><ellipse cx="40" cy="50" rx="27" ry="23" fill="#FFB74D"/><ellipse cx="40" cy="56" rx="17" ry="12" fill="#FFE0B2"/><circle cx="29" cy="45" r="5.5" fill="#fff"/><circle cx="51" cy="45" r="5.5" fill="#fff"/><circle cx="30" cy="46" r="2.8" fill="#1a1a2e"/><circle cx="52" cy="46" r="2.8" fill="#1a1a2e"/><circle cx="31" cy="45" r="1.1" fill="#fff"/><circle cx="53" cy="45" r="1.1" fill="#fff"/><ellipse cx="40" cy="58" rx="6" ry="4" fill="#FF7043"/><path d="M36 62 Q40 66 44 62" stroke="#555" strokeWidth="1.8" fill="none" strokeLinecap="round"/></svg>,
  };
  return faces[id] || faces.fox;
};

const MoodFace = ({ type, size=44, active }) => {
  const cfg = {
    Amazing:{bg:"#FFF9C4",c:"#F9A825"}, Good:{bg:"#E8F5E9",c:"#43A047"},
    Okay:{bg:"#E3F2FD",c:"#1E88E5"},   Sad:{bg:"#EDE7F6",c:"#7B1FA2"},
    Angry:{bg:"#FFEBEE",c:"#E53935"},  Worried:{bg:"#FBE9E7",c:"#E64A19"},
  };
  const {bg,c} = cfg[type] || cfg.Okay;
  const fc = active ? "#fff" : c;
  const mouths = {
    Amazing:<path d="M14 20 Q20 27 26 20" stroke={fc} strokeWidth="2.2" fill="none" strokeLinecap="round"/>,
    Good:   <path d="M14 19 Q20 24 26 19" stroke={fc} strokeWidth="2.2" fill="none" strokeLinecap="round"/>,
    Okay:   <line x1="14" y1="21" x2="26" y2="21" stroke={fc} strokeWidth="2.2" strokeLinecap="round"/>,
    Sad:    <path d="M14 23 Q20 17 26 23" stroke={fc} strokeWidth="2.2" fill="none" strokeLinecap="round"/>,
    Angry:  <path d="M14 23 Q20 18 26 23" stroke={fc} strokeWidth="2.2" fill="none" strokeLinecap="round"/>,
    Worried:<path d="M14 22 Q17 19 20 22 Q23 25 26 22" stroke={fc} strokeWidth="2.2" fill="none" strokeLinecap="round"/>,
  };
  const brows = {
    Angry:  <><line x1="12" y1="13" x2="18" y2="15" stroke={fc} strokeWidth="2" strokeLinecap="round"/><line x1="22" y1="15" x2="28" y2="13" stroke={fc} strokeWidth="2" strokeLinecap="round"/></>,
    Worried:<><path d="M12 14 Q15 12 18 14" stroke={fc} strokeWidth="2" fill="none" strokeLinecap="round"/><path d="M22 14 Q25 12 28 14" stroke={fc} strokeWidth="2" fill="none" strokeLinecap="round"/></>,
    Sad:    <><path d="M12 14 Q15 12 18 14" stroke={fc} strokeWidth="1.8" fill="none" strokeLinecap="round"/><path d="M22 14 Q25 12 28 14" stroke={fc} strokeWidth="1.8" fill="none" strokeLinecap="round"/></>,
  };
  return (
    <svg width={size} height={size} viewBox="0 0 40 40">
      <circle cx="20" cy="20" r="18" fill={active?c:bg} stroke={c} strokeWidth="2"/>
      {brows[type]}
      <circle cx="14" cy="17" r="2.4" fill={fc}/>
      <circle cx="26" cy="17" r="2.4" fill={fc}/>
      {mouths[type]}
    </svg>
  );
};

const MASCOTS = [
  {id:"fox",   name:"Finn",    color:"#FF7043", bg:"#FFF3E0"},
  {id:"bunny", name:"Blossom", color:"#EC407A", bg:"#FCE4EC"},
  {id:"bear",  name:"Bruno",   color:"#8D6E63", bg:"#EFEBE9"},
  {id:"owl",   name:"Ollie",   color:"#7E57C2", bg:"#EDE7F6"},
  {id:"cat",   name:"Luna",    color:"#26A69A", bg:"#E0F2F1"},
  {id:"dog",   name:"Sunny",   color:"#FFA726", bg:"#FFF8E1"},
];
const MOODS = ["Amazing","Good","Okay","Sad","Angry","Worried"];
const MOOD_COLORS = {Amazing:"#F9A825",Good:"#43A047",Okay:"#1E88E5",Sad:"#7B1FA2",Angry:"#E53935",Worried:"#E64A19"};
const MOOD_BG = {Amazing:"#FFF9C4",Good:"#E8F5E9",Okay:"#E3F2FD",Sad:"#EDE7F6",Angry:"#FFEBEE",Worried:"#FBE9E7"};
const AFFIRMATIONS = [
  {text:"I am brave and strong.",   color:"#FF7043"},
  {text:"I am loved just as I am.", color:"#EC407A"},
  {text:"My feelings are valid.",   color:"#7E57C2"},
  {text:"I can do hard things.",    color:"#1E88E5"},
  {text:"I am kind and caring.",    color:"#43A047"},
  {text:"I believe in myself.",     color:"#FF7043"},
  {text:"Today is a great day.",    color:"#F9A825"},
  {text:"I am enough.",             color:"#EC407A"},
];
const BREATHING = [
  {phase:"Breathe In",  duration:4, color:C.sky},
  {phase:"Hold",        duration:2, color:C.purple},
  {phase:"Breathe Out", duration:4, color:C.mint},
];
const JOURNAL_PROMPTS = [
  "What made you smile today?",
  "What is something you are proud of?",
  "Who is someone you love and why?",
  "What is your favourite thing about yourself?",
  "What made you feel brave today?",
];
const BADGE_DEFS = [
  {id:"first_checkin", icon:"star",   label:"First Check-in",  check: (ml,j,b,a) => ml.length >= 1},
  {id:"mood_explorer", icon:"mood",   label:"Mood Explorer",   check: (ml,j,b,a) => new Set(ml.map(e=>e.mood)).size >= 6},
  {id:"brave_heart",   icon:"heart",  label:"Brave Heart",     check: (ml,j,b,a) => j.length >= 5},
  {id:"week_streak",   icon:"fire",   label:"7-Day Streak",    check: (ml,j,b,a) => getStreak(ml) >= 7},
  {id:"affirm_pro",    icon:"trophy", label:"Affirmation Pro", check: (ml,j,b,a) => a >= 20},
  {id:"calm_champ",    icon:"wind",   label:"Calm Champion",   check: (ml,j,b,a) => b >= 5},
];

const today = () => new Date().toISOString().split("T")[0];

const getStreak = (moodLog) => {
  if (!moodLog || moodLog.length === 0) return 0;
  const dates = [...new Set(moodLog.map(e => e.date))].sort().reverse();
  let streak = 0;
  const d = new Date();
  for (let i = 0; i < 100; i++) {
    const s = d.toISOString().split("T")[0];
    if (dates.includes(s)) { streak++; }
    else if (i > 0) break;
    d.setDate(d.getDate() - 1);
  }
  return streak;
};

const last7Days = () => {
  const days = ["Sun","Mon","Tue","Wed","Thu","Fri","Sat"];
  return Array.from({length:7}, (_,i) => {
    const d = new Date(); d.setDate(d.getDate()-6+i);
    return { date: d.toISOString().split("T")[0], label: days[d.getDay()] };
  });
};

const Card = ({children, style}) => (
  <div style={{background:"#fff",borderRadius:20,padding:"22px 20px",
    boxShadow:"0 2px 18px rgba(124,77,255,0.09)",marginBottom:14,...style}}>
    {children}
  </div>
);

const Btn = ({children, onClick, color, textColor, style, small, icon, disabled, loading}) => (
  <button onClick={onClick} disabled={!!disabled||!!loading} style={{
    background: disabled||loading ? "#e0e0e0" : (color||C.purple),
    color: disabled||loading ? "#aaa" : (textColor||"#fff"),
    border:"none", borderRadius:50,
    padding: small ? "10px 22px" : "15px 34px",
    fontSize: small ? 14 : 16,
    fontWeight:700, fontFamily:F.b,
    cursor: disabled||loading ? "not-allowed" : "pointer",
    boxShadow: disabled||loading ? "none" : `0 4px 14px ${color||C.purple}44`,
    transition:"transform 0.12s",
    display:"inline-flex", alignItems:"center", gap:8, letterSpacing:0.2, ...style,
  }}
    onMouseDown={e=>{ if(!disabled&&!loading) e.currentTarget.style.transform="scale(0.95)"; }}
    onMouseUp={e=>{ e.currentTarget.style.transform="scale(1)"; }}
  >
    {icon && !loading && <Icon name={icon} size={18} color={disabled||loading?"#aaa":(textColor||"#fff")}/>}
    {loading ? "Loading..." : children}
  </button>
);

const Label = ({children}) => (
  <p style={{fontFamily:F.b,fontWeight:700,fontSize:12,color:C.muted,
    letterSpacing:1.3,textTransform:"uppercase",marginBottom:10}}>
    {children}
  </p>
);

const TextInput = ({value, onChange, placeholder, type="text", style}) => (
  <input value={value} onChange={onChange} placeholder={placeholder} type={type}
    style={{width:"100%",padding:"13px 18px",borderRadius:50,
      border:`2px solid ${C.border}`,fontSize:16,fontFamily:F.b,
      fontWeight:500,color:C.text,background:"#fff",...style}}
    onFocus={e=>e.target.style.border=`2px solid ${C.purple}`}
    onBlur={e=>e.target.style.border=`2px solid ${C.border}`}
  />
);

const Shell = ({children}) => (
  <div style={{minHeight:"100vh",background:C.bg,fontFamily:F.b,
    display:"flex",flexDirection:"column",alignItems:"center",
    padding:"0 0 92px",position:"relative",overflowX:"hidden"}}>
    <FontLoader/>
    <div style={{position:"fixed",top:-90,right:-90,width:280,height:280,
      borderRadius:"50%",background:"rgba(124,77,255,0.06)",pointerEvents:"none",zIndex:0}}/>
    <div style={{position:"fixed",bottom:-90,left:-90,width:320,height:320,
      borderRadius:"50%",background:"rgba(240,98,146,0.06)",pointerEvents:"none",zIndex:0}}/>
    <div style={{position:"relative",zIndex:1,width:"100%",maxWidth:430,padding:"0 20px"}}>
      {children}
    </div>
  </div>
);

export default function BloomyApp() {
  const [session, setSession]             = useState(null);
  const [loading, setLoading]             = useState(true);
  const [screen, setScreen]               = useState("landing");
  const [email, setEmail]                 = useState("");
  const [password, setPassword]           = useState("");
  const [name, setName]                   = useState("");
  const [authError, setAuthError]         = useState("");
  const [authLoading, setAuthLoading]     = useState(false);
  const [children, setChildren]           = useState([]);
  const [childrenLoading, setChildrenLoading] = useState(false);
  const [activeChild, setActiveChild]     = useState(null);
  const [moodLog, setMoodLog]             = useState([]);
  const [journals, setJournals]           = useState([]);
  const [addingChild, setAddingChild]     = useState(false);
  const [newChildName, setNewChildName]   = useState("");
  const [newChildMascot, setNewChildMascot] = useState(null);
  const [addStep, setAddStep]             = useState(1);
  const [addLoading, setAddLoading]       = useState(false);
  const [tab, setTab]                     = useState("home");
  const [selectedMood, setSelectedMood]   = useState(null);
  const [moodLogged, setMoodLogged]       = useState(false);
  const [affirmIdx, setAffirmIdx]         = useState(0);
  const [breathPhase, setBreathPhase]     = useState(0);
  const [breathActive, setBreathActive]   = useState(false);
  const [breathCount, setBreathCount]     = useState(0);
  const [journalText, setJournalText]     = useState("");
  const [journalSaved, setJournalSaved]   = useState(false);
  const [promptIdx, setPromptIdx]         = useState(0);
  const [saveLoading, setSaveLoading]     = useState(false);

  /* ── Auth listener ── */
  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      setSession(session);
      setLoading(false);
      if (session) setScreen("dashboard");
    });
    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      setSession(session);
      if (session) { setScreen("dashboard"); loadChildren(session.user.id); }
      else { setScreen("landing"); setChildren([]); setActiveChild(null); }
    });
    return () => subscription.unsubscribe();
  }, []);

  /* ── Load children ── */
  const loadChildren = async (userId) => {
    setChildrenLoading(true);
    const { data, error } = await supabase
      .from("children")
      .select("*")
      .eq("parent_id", userId)
      .order("created_at", {ascending: true});
    if (!error && data) setChildren(data);
    setChildrenLoading(false);
  };

  useEffect(() => {
    if (session) loadChildren(session.user.id);
  }, [session]);

  /* ── Load child data ── */
  const loadChildData = async (child) => {
    const [moodRes, journalRes] = await Promise.all([
      supabase.from("mood_logs").select("*").eq("child_id", child.id).order("created_at", {ascending:true}),
      supabase.from("journal_entries").select("*").eq("child_id", child.id).order("created_at", {ascending:false}),
    ]);
    if (!moodRes.error) setMoodLog(moodRes.data || []);
    if (!journalRes.error) setJournals(journalRes.data || []);
  };

  /* ── Breathing ── */
  useEffect(() => {
    if (!breathActive) return;
    const t = setTimeout(async () => {
      const next = (breathPhase+1) % BREATHING.length;
      setBreathPhase(next);
      if (next === 0) {
        setBreathCount(c => c+1);
        if (activeChild) {
          const newCount = (activeChild.breath_sessions||0)+1;
          await supabase.from("children").update({breath_sessions:newCount}).eq("id",activeChild.id);
          setActiveChild(prev => ({...prev, breath_sessions:newCount}));
          setChildren(prev => prev.map(c => c.id===activeChild.id ? {...c,breath_sessions:newCount} : c));
        }
      }
    }, BREATHING[breathPhase].duration * 1000);
    return () => clearTimeout(t);
  }, [breathActive, breathPhase]);

  /* ── Sign up ── */
  const handleSignup = async () => {
    if (!name.trim()||!email.trim()||!password.trim()) { setAuthError("Please fill in all fields."); return; }
    if (password.length < 6) { setAuthError("Password must be at least 6 characters."); return; }
    setAuthLoading(true); setAuthError("");
    const { error } = await supabase.auth.signUp({
      email: email.trim(),
      password,
      options: { data: { name: name.trim() } }
    });
    if (error) setAuthError(error.message);
    setAuthLoading(false);
  };

  /* ── Sign in ── */
  const handleLogin = async () => {
    if (!email.trim()||!password.trim()) { setAuthError("Please fill in all fields."); return; }
    setAuthLoading(true); setAuthError("");
    const { error } = await supabase.auth.signInWithPassword({ email: email.trim(), password });
    if (error) setAuthError("Incorrect email or password.");
    setAuthLoading(false);
  };

  /* ── Sign out ── */
  const handleLogout = async () => {
    await supabase.auth.signOut();
    setBreathActive(false);
    setActiveChild(null);
    setMoodLog([]); setJournals([]);
  };

  /* ── Add child ── */
  const handleAddChild = async () => {
    if (!newChildName.trim()||!newChildMascot||!session) return;
    setAddLoading(true);
    const { data, error } = await supabase.from("children").insert({
      parent_id: session.user.id,
      name: newChildName.trim(),
      mascot_id: newChildMascot.id,
      mascot_name: newChildMascot.name,
      mascot_color: newChildMascot.color,
      mascot_bg: newChildMascot.bg,
      affirm_count: 0,
      breath_sessions: 0,
    }).select().single();
    if (!error && data) {
      setChildren(prev => [...prev, data]);
      setActiveChild(data);
      setMoodLog([]); setJournals([]);
      setTab("home");
    }
    setAddingChild(false); setNewChildName(""); setNewChildMascot(null); setAddStep(1);
    setAddLoading(false);
  };

  /* ── Delete child ── */
  const handleDeleteChild = async (childId) => {
    await supabase.from("children").delete().eq("id", childId);
    setChildren(prev => prev.filter(c => c.id !== childId));
    if (activeChild?.id === childId) { setActiveChild(null); setMoodLog([]); setJournals([]); }
  };

  /* ── Log mood ── */
  const logMood = async (mood) => {
    if (!activeChild) return;
    const entry = { child_id: activeChild.id, mood, date: today() };
    const { data, error } = await supabase.from("mood_logs").insert(entry).select().single();
    if (!error && data) { setMoodLog(prev => [...prev, data]); setMoodLogged(true); }
  };

  /* ── Save journal ── */
  const saveJournal = async () => {
    if (!journalText.trim()||!activeChild) return;
    setSaveLoading(true);
    const entry = { child_id:activeChild.id, text:journalText, prompt:JOURNAL_PROMPTS[promptIdx], date:today() };
    const { data, error } = await supabase.from("journal_entries").insert(entry).select().single();
    if (!error && data) { setJournals(prev => [data, ...prev]); setJournalSaved(true); }
    setSaveLoading(false);
  };

  /* ── Next affirmation ── */
  const nextAffirm = async () => {
    setAffirmIdx(i => (i+1) % AFFIRMATIONS.length);
    if (activeChild) {
      const newCount = (activeChild.affirm_count||0)+1;
      await supabase.from("children").update({affirm_count:newCount}).eq("id",activeChild.id);
      setActiveChild(prev => ({...prev, affirm_count:newCount}));
      setChildren(prev => prev.map(c => c.id===activeChild.id ? {...c,affirm_count:newCount} : c));
    }
  };

  const openChild = async (child) => {
    setActiveChild(child); setTab("home");
    setMoodLogged(false); setJournalSaved(false); setJournalText("");
    setBreathActive(false); setBreathPhase(0); setBreathCount(0);
    await loadChildData(child);
  };

  /* ── Computed ── */
  const streak = getStreak(moodLog);
  const week = last7Days();
  const todayEntry = moodLog.slice().reverse().find(e=>e.date===today());
  const badges = activeChild
    ? Object.fromEntries(BADGE_DEFS.map(b=>[b.id, b.check(moodLog,journals,activeChild.breath_sessions||0,activeChild.affirm_count||0)]))
    : {};
  const cm = activeChild
    ? { id:activeChild.mascot_id, name:activeChild.mascot_name, color:activeChild.mascot_color, bg:activeChild.mascot_bg }
    : MASCOTS[0];
  const parentName = session?.user?.user_metadata?.name || session?.user?.email || "there";

  if (loading) return (
    <div style={{minHeight:"100vh",background:"linear-gradient(148deg,#A78BFA 0%,#F06292 60%,#FFD54F 100%)",
      display:"flex",alignItems:"center",justifyContent:"center"}}>
      <FontLoader/>
      <div style={{textAlign:"center"}}>
        <div style={{animation:"floatUp 2s ease-in-out infinite",marginBottom:16}}>
          <Icon name="flower" size={64} color="#fff"/>
        </div>
        <p style={{color:"#fff",fontFamily:F.h,fontSize:24,fontWeight:800}}>Bloomy</p>
      </div>
    </div>
  );

  /* ── LANDING ── */
  if (screen==="landing") return (
    <div style={{minHeight:"100vh",
      background:"linear-gradient(148deg,#A78BFA 0%,#F06292 60%,#FFD54F 100%)",
      display:"flex",flexDirection:"column",alignItems:"center",
      justifyContent:"center",padding:28,textAlign:"center",fontFamily:F.b}}>
      <FontLoader/>
      <div style={{animation:"floatUp 3s ease-in-out infinite",marginBottom:20}}>
        <Icon name="flower" size={84} color="#fff"/>
      </div>
      <h1 style={{fontFamily:F.h,fontSize:52,fontWeight:900,color:"#fff",
        marginBottom:8,letterSpacing:-1,textShadow:"0 4px 20px rgba(0,0,0,0.18)"}}>
        Bloomy
      </h1>
      <p style={{fontSize:17,color:"rgba(255,255,255,0.92)",marginBottom:48,
        fontWeight:500,lineHeight:1.6,maxWidth:280}}>
        A safe, joyful space for children to grow, feel, and shine.
      </p>
      <Btn onClick={()=>setScreen("signup")} color="#fff" textColor={C.purple}
        style={{fontSize:18,padding:"17px 48px",marginBottom:14}}>
        Create Free Account
      </Btn>
      <button onClick={()=>setScreen("login")} style={{
        background:"rgba(255,255,255,0.2)",border:"2px solid rgba(255,255,255,0.5)",
        color:"#fff",borderRadius:50,padding:"11px 28px",fontSize:15,
        fontWeight:600,fontFamily:F.b,cursor:"pointer"}}>
        Sign In
      </button>
    </div>
  );

  /* ── SIGN UP ── */
  if (screen==="signup") return (
    <Shell>
      <div style={{paddingTop:52}}>
        <button onClick={()=>setScreen("landing")} style={{background:"none",border:"none",cursor:"pointer",
          display:"flex",alignItems:"center",gap:6,marginBottom:24,
          color:C.muted,fontFamily:F.b,fontWeight:600,fontSize:15}}>
          <Icon name="back" size={20} color={C.muted}/> Back
        </button>
        <Icon name="flower" size={48} color={C.purple} style={{marginBottom:16}}/>
        <h2 style={{fontFamily:F.h,fontSize:32,fontWeight:800,color:C.text,marginBottom:4}}>
          Create your account
        </h2>
        <p style={{color:C.muted,fontSize:15,marginBottom:28,fontWeight:500}}>
          Free forever. No credit card needed.
        </p>
        <div style={{display:"flex",flexDirection:"column",gap:12,marginBottom:20}}>
          <TextInput value={name} onChange={e=>setName(e.target.value)} placeholder="Your name"/>
          <TextInput value={email} onChange={e=>setEmail(e.target.value)} placeholder="Email address" type="email"/>
          <TextInput value={password} onChange={e=>setPassword(e.target.value)} placeholder="Password (min 6 characters)" type="password"/>
        </div>
        {authError && <p style={{color:"#E53935",fontSize:14,marginBottom:12,fontWeight:500}}>{authError}</p>}
        <Btn onClick={handleSignup} style={{width:"100%"}} icon="next" loading={authLoading}>
          Create Account
        </Btn>
        <p style={{textAlign:"center",marginTop:20,color:C.muted,fontSize:14,fontWeight:500}}>
          Already have an account?{" "}
          <span onClick={()=>{setScreen("login");setAuthError("");}}
            style={{color:C.purple,cursor:"pointer",fontWeight:700}}>Sign in</span>
        </p>
      </div>
    </Shell>
  );

  /* ── LOGIN ── */
  if (screen==="login") return (
    <Shell>
      <div style={{paddingTop:52}}>
        <button onClick={()=>setScreen("landing")} style={{background:"none",border:"none",cursor:"pointer",
          display:"flex",alignItems:"center",gap:6,marginBottom:24,
          color:C.muted,fontFamily:F.b,fontWeight:600,fontSize:15}}>
          <Icon name="back" size={20} color={C.muted}/> Back
        </button>
        <Icon name="heart" size={48} color={C.pink} style={{marginBottom:16}}/>
        <h2 style={{fontFamily:F.h,fontSize:32,fontWeight:800,color:C.text,marginBottom:4}}>
          Welcome back
        </h2>
        <p style={{color:C.muted,fontSize:15,marginBottom:28,fontWeight:500}}>
          Sign in to your Bloomy account.
        </p>
        <div style={{display:"flex",flexDirection:"column",gap:12,marginBottom:20}}>
          <TextInput value={email} onChange={e=>setEmail(e.target.value)} placeholder="Email address" type="email"/>
          <TextInput value={password} onChange={e=>setPassword(e.target.value)} placeholder="Password" type="password"/>
        </div>
        {authError && <p style={{color:"#E53935",fontSize:14,marginBottom:12,fontWeight:500}}>{authError}</p>}
        <Btn onClick={handleLogin} style={{width:"100%"}} icon="next" loading={authLoading}>
          Sign In
        </Btn>
        <p style={{textAlign:"center",marginTop:20,color:C.muted,fontSize:14,fontWeight:500}}>
          No account yet?{" "}
          <span onClick={()=>{setScreen("signup");setAuthError("");}}
            style={{color:C.purple,cursor:"pointer",fontWeight:700}}>Sign up free</span>
        </p>
      </div>
    </Shell>
  );

  /* ── PARENT DASHBOARD ── */
  if (!activeChild) return (
    <Shell>
      <div style={{paddingTop:36}}>
        <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:28}}>
          <div>
            <p style={{color:C.muted,fontWeight:600,fontSize:13,marginBottom:2}}>Welcome back</p>
            <h2 style={{fontFamily:F.h,fontSize:28,fontWeight:900,color:C.text}}>{parentName}</h2>
          </div>
          <button onClick={handleLogout} style={{background:"none",border:`1.5px solid ${C.border}`,
            borderRadius:50,padding:"8px 14px",cursor:"pointer",
            display:"flex",alignItems:"center",gap:6,
            color:C.muted,fontFamily:F.b,fontWeight:600,fontSize:13}}>
            <Icon name="logout" size={16} color={C.muted}/> Sign out
          </button>
        </div>

        <Card style={{background:`linear-gradient(135deg,${C.purple},${C.pink})`,padding:"22px 22px"}}>
          <p style={{color:"rgba(255,255,255,0.8)",fontSize:12,fontWeight:700,
            letterSpacing:1,textTransform:"uppercase",marginBottom:6}}>Children's Profiles</p>
          <p style={{color:"#fff",fontSize:17,fontWeight:600,lineHeight:1.5,margin:0}}>
            {childrenLoading ? "Loading..." : children.length === 0
              ? "Add your first child profile to get started."
              : `You have ${children.length} child profile${children.length>1?"s":""}.`}
          </p>
        </Card>

        {children.map(child => {
          const m = MASCOTS.find(x=>x.id===child.mascot_id)||MASCOTS[0];
          return (
            <Card key={child.id} style={{padding:"18px 20px"}}>
              <div style={{display:"flex",alignItems:"center",gap:14,marginBottom:14}}>
                <div style={{background:m.bg,borderRadius:14,padding:8,flexShrink:0}}>
                  <MascotFace id={m.id} size={44}/>
                </div>
                <div style={{flex:1}}>
                  <h3 style={{fontFamily:F.h,fontSize:20,fontWeight:800,color:C.text,marginBottom:2}}>
                    {child.name}
                  </h3>
                  <p style={{color:C.muted,fontSize:13,fontWeight:500,margin:0}}>
                    {child.mascot_name} · joined {child.created_at?.split("T")[0]}
                  </p>
                </div>
              </div>
              <div style={{display:"flex",gap:8}}>
                <Btn small style={{flex:1}} onClick={()=>openChild(child)}>
                  Open Profile
                </Btn>
                <button onClick={()=>handleDeleteChild(child.id)} style={{
                  background:"#FFF5F5",border:"1.5px solid #FFCDD2",borderRadius:50,
                  padding:"8px 14px",cursor:"pointer",display:"flex",alignItems:"center"}}>
                  <Icon name="trash" size={16} color="#E53935"/>
                </button>
              </div>
            </Card>
          );
        })}

        {!addingChild ? (
          <Btn onClick={()=>{setAddingChild(true);setAddStep(1);}} icon="plus"
            color="#EEE9FF" textColor={C.purple} style={{width:"100%",marginTop:4}}>
            Add Child Profile
          </Btn>
        ) : (
          <Card style={{border:`2px solid ${C.purple}22`}}>
            {addStep===1 && (
              <>
                <h3 style={{fontFamily:F.h,fontSize:20,fontWeight:800,color:C.text,marginBottom:8}}>
                  What's your child's name?
                </h3>
                <TextInput value={newChildName} onChange={e=>setNewChildName(e.target.value)}
                  placeholder="Child's name" style={{marginBottom:16}}/>
                <div style={{display:"flex",gap:8}}>
                  <Btn small onClick={()=>{if(newChildName.trim())setAddStep(2);}}>Next</Btn>
                  <Btn small color="#f5f5f5" textColor={C.muted}
                    onClick={()=>{setAddingChild(false);setNewChildName("");}}>Cancel</Btn>
                </div>
              </>
            )}
            {addStep===2 && (
              <>
                <h3 style={{fontFamily:F.h,fontSize:20,fontWeight:800,color:C.text,marginBottom:8}}>
                  Pick {newChildName}'s buddy
                </h3>
                <div style={{display:"grid",gridTemplateColumns:"repeat(3,1fr)",gap:10,marginBottom:16}}>
                  {MASCOTS.map(m=>(
                    <button key={m.id} onClick={()=>setNewChildMascot(m)} style={{
                      background:newChildMascot?.id===m.id?m.color:m.bg,
                      border:`2px solid ${newChildMascot?.id===m.id?m.color:"transparent"}`,
                      borderRadius:16,padding:"12px 6px",cursor:"pointer",
                      display:"flex",flexDirection:"column",alignItems:"center",gap:6,
                      transform:newChildMascot?.id===m.id?"scale(1.06)":"scale(1)",
                      transition:"all 0.18s"}}>
                      <MascotFace id={m.id} size={44}/>
                      <span style={{fontSize:12,fontWeight:700,fontFamily:F.b,
                        color:newChildMascot?.id===m.id?"#fff":m.color}}>{m.name}</span>
                    </button>
                  ))}
                </div>
                <div style={{display:"flex",gap:8}}>
                  <Btn small icon="check" disabled={!newChildMascot} loading={addLoading}
                    onClick={handleAddChild}>Create Profile</Btn>
                  <Btn small color="#f5f5f5" textColor={C.muted} onClick={()=>setAddStep(1)}>Back</Btn>
                </div>
              </>
            )}
          </Card>
        )}
      </div>
    </Shell>
  );

  /* ── CHILD APP ── */
  const NavBar = () => (
    <div style={{position:"fixed",bottom:0,left:0,right:0,background:"#fff",
      borderTop:`1.5px solid ${C.border}`,display:"flex",justifyContent:"space-around",
      alignItems:"center",padding:"10px 0 20px",zIndex:100,
      boxShadow:"0 -4px 20px rgba(124,77,255,0.07)"}}>
      {[
        {id:"home",   icon:"home",  label:"Home"},
        {id:"mood",   icon:"mood",  label:"Mood"},
        {id:"affirm", icon:"star",  label:"Affirm"},
        {id:"breathe",icon:"wind",  label:"Breathe"},
        {id:"journal",icon:"book",  label:"Journal"},
      ].map(t=>(
        <button key={t.id} onClick={()=>setTab(t.id)} style={{
          background:"none",border:"none",cursor:"pointer",
          display:"flex",flexDirection:"column",alignItems:"center",gap:3,
          opacity:tab===t.id?1:0.35,
          transform:tab===t.id?"scale(1.12)":"scale(1)",
          transition:"all 0.18s"}}>
          <Icon name={t.icon} size={24} color={tab===t.id?C.purple:C.muted}/>
          <span style={{fontSize:11,fontWeight:700,fontFamily:F.b,
            color:tab===t.id?C.purple:C.muted}}>{t.label}</span>
        </button>
      ))}
    </div>
  );

  return (
    <Shell>
      <NavBar/>
      <div style={{paddingTop:18,display:"flex",justifyContent:"space-between",
        alignItems:"center",marginBottom:4}}>
        <button onClick={()=>{setActiveChild(null);setBreathActive(false);}} style={{
          background:"none",border:"none",cursor:"pointer",
          display:"flex",alignItems:"center",gap:5,
          color:C.muted,fontFamily:F.b,fontWeight:600,fontSize:13}}>
          <Icon name="back" size={18} color={C.muted}/> Profiles
        </button>
        <span style={{fontSize:13,fontWeight:700,color:C.muted,fontFamily:F.b}}>
          {activeChild.name}
        </span>
        <div style={{width:64}}/>
      </div>

      {/* HOME */}
      {tab==="home" && (
        <div style={{paddingTop:12,animation:"fadeIn 0.4s ease"}}>
          <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:18}}>
            <div>
              <p style={{color:C.muted,fontWeight:600,fontSize:13,marginBottom:2}}>Good morning</p>
              <h2 style={{fontFamily:F.h,fontSize:30,fontWeight:900,color:C.text}}>{activeChild.name}</h2>
            </div>
            <div style={{background:cm.bg,borderRadius:16,padding:10}}>
              <MascotFace id={cm.id} size={52}/>
            </div>
          </div>

          <Card style={{background:`linear-gradient(135deg,${cm.color} 0%,${C.pink} 100%)`,padding:"24px 22px"}}>
            <p style={{color:"rgba(255,255,255,0.8)",fontSize:12,fontWeight:700,
              letterSpacing:1,textTransform:"uppercase",marginBottom:10}}>{cm.name} says</p>
            <p style={{color:"#fff",fontSize:21,fontWeight:700,fontFamily:F.h,lineHeight:1.4,margin:0}}>
              "{AFFIRMATIONS[affirmIdx].text}"
            </p>
          </Card>

          {todayEntry ? (
            <Card style={{display:"flex",alignItems:"center",gap:14,padding:"16px 20px",
              background:MOOD_BG[todayEntry.mood]}}>
              <MoodFace type={todayEntry.mood} size={44}/>
              <div>
                <p style={{fontFamily:F.h,fontWeight:800,fontSize:16,
                  color:MOOD_COLORS[todayEntry.mood],margin:0}}>
                  Feeling {todayEntry.mood} today
                </p>
                <p style={{color:C.muted,fontSize:13,fontWeight:500,margin:0}}>Mood logged!</p>
              </div>
            </Card>
          ) : (
            <Card onClick={()=>setTab("mood")} style={{display:"flex",alignItems:"center",gap:14,
              padding:"16px 20px",border:`2px dashed ${C.border}`,
              background:"transparent",boxShadow:"none",cursor:"pointer"}}>
              <Icon name="mood" size={36} color={C.purple}/>
              <div>
                <p style={{fontFamily:F.h,fontWeight:800,fontSize:16,color:C.text,margin:0}}>
                  How are you feeling?
                </p>
                <p style={{color:C.muted,fontSize:13,fontWeight:500,margin:0}}>Tap to log today's mood</p>
              </div>
            </Card>
          )}

          <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:12,marginBottom:14}}>
            {[
              {label:"Affirmations",icon:"star",  color:C.purple, bg:"#EDE7F6",action:()=>setTab("affirm")},
              {label:"Breathe",     icon:"wind",  color:C.sky,    bg:"#E1F5FE",action:()=>setTab("breathe")},
              {label:"My Journal",  icon:"book",  color:C.pink,   bg:"#FCE4EC",action:()=>setTab("journal")},
              {label:"My Mood",     icon:"mood",  color:"#43A047",bg:"#E8F5E9",action:()=>setTab("mood")},
            ].map(item=>(
              <button key={item.label} onClick={item.action} style={{
                background:item.bg,border:`1.5px solid ${item.color}22`,
                borderRadius:18,padding:"18px 14px",cursor:"pointer",textAlign:"left",
                transition:"transform 0.15s"}}
                onMouseDown={e=>e.currentTarget.style.transform="scale(0.95)"}
                onMouseUp={e=>e.currentTarget.style.transform="scale(1)"}>
                <Icon name={item.icon} size={28} color={item.color} style={{marginBottom:10}}/>
                <div style={{fontSize:14,fontWeight:700,color:item.color,fontFamily:F.b}}>{item.label}</div>
              </button>
            ))}
          </div>

          {streak > 0 && (
            <Card style={{background:"linear-gradient(135deg,#FFD54F,#FF7043)",
              display:"flex",alignItems:"center",gap:14,padding:"18px 20px"}}>
              <Icon name="fire" size={36} color="#fff"/>
              <div>
                <p style={{color:"#fff",fontFamily:F.h,fontWeight:800,fontSize:20,margin:0}}>
                  {streak}-Day Streak!
                </p>
                <p style={{color:"rgba(255,255,255,0.85)",fontSize:13,fontWeight:500,margin:0}}>
                  Keep it up — you are doing great!
                </p>
              </div>
            </Card>
          )}

          <Card>
            <Label>My Badges</Label>
            <div style={{display:"grid",gridTemplateColumns:"repeat(3,1fr)",gap:10}}>
              {BADGE_DEFS.map(b=>(
                <div key={b.id} style={{background:badges[b.id]?"#F7F4FF":"#fafafa",
                  borderRadius:14,padding:"14px 8px",textAlign:"center",opacity:badges[b.id]?1:0.3}}>
                  <Icon name={b.icon} size={26} color={badges[b.id]?C.purple:C.muted}
                    style={{margin:"0 auto 8px"}}/>
                  <div style={{fontSize:11,fontWeight:700,fontFamily:F.b,lineHeight:1.3,
                    color:badges[b.id]?C.purple:C.muted}}>{b.label}</div>
                </div>
              ))}
            </div>
          </Card>
        </div>
      )}

      {/* MOOD */}
      {tab==="mood" && (
        <div style={{paddingTop:12,animation:"fadeIn 0.4s ease"}}>
          <h2 style={{fontFamily:F.h,fontSize:28,fontWeight:800,color:C.text,marginBottom:4}}>
            How are you feeling?
          </h2>
          <p style={{color:C.muted,fontSize:15,marginBottom:18,fontWeight:500}}>
            Tap the one that feels right.
          </p>
          <div style={{display:"grid",gridTemplateColumns:"1fr 1fr 1fr",gap:12,marginBottom:18}}>
            {MOODS.map(m=>(
              <button key={m} onClick={()=>{setSelectedMood(m);setMoodLogged(false);}} style={{
                background:selectedMood===m?MOOD_COLORS[m]:MOOD_BG[m],
                border:`2px solid ${selectedMood===m?MOOD_COLORS[m]:"transparent"}`,
                borderRadius:18,padding:"16px 8px",cursor:"pointer",
                display:"flex",flexDirection:"column",alignItems:"center",gap:8,
                transform:selectedMood===m?"scale(1.07)":"scale(1)",transition:"all 0.18s",
                boxShadow:selectedMood===m?`0 6px 18px ${MOOD_COLORS[m]}44`:"none"}}>
                <MoodFace type={m} size={40} active={selectedMood===m}/>
                <span style={{fontSize:12,fontWeight:700,fontFamily:F.b,
                  color:selectedMood===m?"#fff":MOOD_COLORS[m]}}>{m}</span>
              </button>
            ))}
          </div>

          {selectedMood && !moodLogged && (
            <Card style={{background:MOOD_BG[selectedMood],textAlign:"center",animation:"scaleIn 0.3s ease"}}>
              <div style={{display:"flex",justifyContent:"center",marginBottom:12}}>
                <MoodFace type={selectedMood} size={64}/>
              </div>
              <p style={{fontFamily:F.h,fontWeight:800,fontSize:20,
                color:MOOD_COLORS[selectedMood],marginBottom:6}}>
                It's okay to feel {selectedMood.toLowerCase()}.
              </p>
              <p style={{color:C.muted,marginBottom:18,fontSize:14,fontWeight:500}}>
                {cm.name} is here with you.
              </p>
              <Btn onClick={()=>logMood(selectedMood)} color={MOOD_COLORS[selectedMood]} icon="check">
                Log My Mood
              </Btn>
            </Card>
          )}

          {moodLogged && (
            <Card style={{textAlign:"center",animation:"scaleIn 0.3s ease"}}>
              <div style={{background:"#E0F2F1",borderRadius:"50%",width:68,height:68,
                display:"flex",alignItems:"center",justifyContent:"center",margin:"0 auto 14px"}}>
                <Icon name="check" size={36} color={C.mint}/>
              </div>
              <p style={{fontFamily:F.h,fontWeight:800,fontSize:22,color:C.text,marginBottom:4}}>
                Mood logged!
              </p>
              <p style={{color:C.muted,marginBottom:16,fontSize:14,fontWeight:500}}>
                Great job checking in today.
              </p>
              <Btn onClick={()=>{setMoodLogged(false);setSelectedMood(null);}}
                color="#F7F4FF" textColor={C.purple} small icon="refresh">
                Check in again
              </Btn>
            </Card>
          )}

          <Card>
            <Label>This Week</Label>
            <div style={{display:"flex",justifyContent:"space-between",alignItems:"flex-end"}}>
              {week.map(d=>{
                const entry = moodLog.slice().reverse().find(e=>e.date===d.date);
                return (
                  <div key={d.date} style={{textAlign:"center",display:"flex",
                    flexDirection:"column",alignItems:"center",gap:5}}>
                    {entry
                      ? <MoodFace type={entry.mood} size={30}/>
                      : <div style={{width:30,height:30,borderRadius:"50%",
                          background:"#f0f0f0",border:"1.5px dashed #ddd"}}/>}
                    <span style={{fontSize:11,color:C.muted,fontWeight:700,fontFamily:F.b}}>{d.label}</span>
                  </div>
                );
              })}
            </div>
          </Card>

          {moodLog.length > 0 && (
            <Card>
              <Label>Recent Moods</Label>
              {[...moodLog].reverse().slice(0,5).map((e,i)=>(
                <div key={e.id} style={{display:"flex",alignItems:"center",gap:12,
                  padding:"10px 0",borderBottom:i<4?"1px solid #F0EAFF":"none"}}>
                  <MoodFace type={e.mood} size={32}/>
                  <span style={{flex:1,fontWeight:700,color:MOOD_COLORS[e.mood],fontSize:14,fontFamily:F.b}}>
                    {e.mood}
                  </span>
                  <span style={{fontSize:12,color:C.muted,fontFamily:F.b}}>
                    {e.date===today()?"Today":e.date}
                  </span>
                </div>
              ))}
            </Card>
          )}
        </div>
      )}

      {/* AFFIRMATIONS */}
      {tab==="affirm" && (
        <div style={{paddingTop:12,animation:"fadeIn 0.4s ease"}}>
          <h2 style={{fontFamily:F.h,fontSize:28,fontWeight:800,color:C.text,marginBottom:4}}>
            Daily Affirmations
          </h2>
          <p style={{color:C.muted,fontSize:15,marginBottom:20,fontWeight:500}}>
            Tap the card to see the next one.
          </p>
          <div onClick={nextAffirm} style={{
            background:`linear-gradient(135deg,${AFFIRMATIONS[affirmIdx].color},${C.pink})`,
            borderRadius:24,padding:"44px 28px",textAlign:"center",cursor:"pointer",
            boxShadow:`0 10px 36px ${AFFIRMATIONS[affirmIdx].color}44`,
            marginBottom:18,minHeight:200,
            display:"flex",flexDirection:"column",alignItems:"center",justifyContent:"center",
            transition:"box-shadow 0.3s"}}>
            <Icon name="star" size={44} color="rgba(255,255,255,0.6)" style={{marginBottom:18}}/>
            <p style={{color:"#fff",fontSize:24,fontWeight:800,fontFamily:F.h,
              lineHeight:1.35,margin:"0 0 14px"}}>
              {AFFIRMATIONS[affirmIdx].text}
            </p>
            <div style={{display:"flex",alignItems:"center",gap:6,
              color:"rgba(255,255,255,0.65)",fontSize:13,fontWeight:600}}>
              <Icon name="next" size={14} color="rgba(255,255,255,0.65)"/> Tap for next
            </div>
          </div>

          <div style={{display:"flex",gap:6,justifyContent:"center",marginBottom:20}}>
            {AFFIRMATIONS.map((_,i)=>(
              <div key={i} onClick={()=>setAffirmIdx(i)} style={{
                width:i===affirmIdx?22:7,height:7,borderRadius:50,
                background:i===affirmIdx?C.purple:"#DDD",
                transition:"all 0.3s",cursor:"pointer"}}/>
            ))}
          </div>

          <Card style={{display:"flex",alignItems:"center",gap:14,padding:"16px 20px",
            background:"linear-gradient(135deg,#F7F4FF,#FCE4EC)"}}>
            <div style={{background:"#EDE7F6",borderRadius:50,padding:10,flexShrink:0}}>
              <Icon name="star" size={22} color={C.purple}/>
            </div>
            <div>
              <p style={{fontFamily:F.h,fontWeight:800,fontSize:16,color:C.text,margin:0}}>
                {activeChild.affirm_count||0} affirmations read
              </p>
              <p style={{color:C.muted,fontSize:13,fontWeight:500,margin:0}}>
                {(activeChild.affirm_count||0)>=20
                  ? "Affirmation Pro badge earned!"
                  : `${20-(activeChild.affirm_count||0)} more for the badge`}
              </p>
            </div>
          </Card>

          <Card>
            <Label>All Affirmations</Label>
            {AFFIRMATIONS.map((a,i)=>(
              <div key={i} onClick={()=>setAffirmIdx(i)} style={{
                display:"flex",alignItems:"center",gap:14,padding:"11px 0",
                borderBottom:i<AFFIRMATIONS.length-1?"1px solid #F0EAFF":"none",
                cursor:"pointer",opacity:affirmIdx===i?1:0.5,transition:"opacity 0.2s"}}>
                <div style={{width:8,height:8,borderRadius:"50%",background:a.color,flexShrink:0}}/>
                <span style={{fontWeight:600,color:C.text,fontSize:15,fontFamily:F.b}}>{a.text}</span>
              </div>
            ))}
          </Card>
        </div>
      )}

      {/* BREATHE */}
      {tab==="breathe" && (
        <div style={{paddingTop:12,textAlign:"center",animation:"fadeIn 0.4s ease"}}>
          <h2 style={{fontFamily:F.h,fontSize:28,fontWeight:800,color:C.text,marginBottom:4}}>
            Breathe With Me
          </h2>
          <p style={{color:C.muted,fontSize:15,marginBottom:30,fontWeight:500}}>
            Let's calm down together.
          </p>

          <div style={{position:"relative",display:"inline-flex",
            alignItems:"center",justifyContent:"center",marginBottom:28}}>
            <div style={{width:220,height:220,borderRadius:"50%",position:"absolute",
              background:`radial-gradient(circle,${BREATHING[breathPhase].color}20,transparent 70%)`,
              border:`3px solid ${BREATHING[breathPhase].color}40`,
              animation:breathActive?"pulse 2s ease-in-out infinite":"none",
              transition:"all 1.2s ease"}}/>
            <div style={{width:160,height:160,borderRadius:"50%",
              background:`${BREATHING[breathPhase].color}16`,
              border:`2.5px solid ${BREATHING[breathPhase].color}80`,
              display:"flex",flexDirection:"column",alignItems:"center",justifyContent:"center",
              transition:"all 1.2s ease"}}>
              <MascotFace id={cm.id} size={62}/>
              <p style={{fontFamily:F.h,fontWeight:800,fontSize:16,
                color:BREATHING[breathPhase].color,marginTop:6,marginBottom:0}}>
                {breathActive?BREATHING[breathPhase].phase:"Ready"}
              </p>
              {breathActive && (
                <p style={{color:C.muted,fontSize:13,fontWeight:600,marginBottom:0}}>
                  {BREATHING[breathPhase].duration}s
                </p>
              )}
            </div>
          </div>

          <div style={{display:"flex",gap:8,justifyContent:"center",marginBottom:28}}>
            {BREATHING.map((b,i)=>(
              <div key={b.phase} style={{
                background:breathPhase===i&&breathActive?b.color:"#EEE9FF",
                color:breathPhase===i&&breathActive?"#fff":C.muted,
                borderRadius:50,padding:"8px 16px",fontSize:13,fontWeight:700,
                fontFamily:F.b,transition:"all 0.6s"}}>{b.phase}</div>
            ))}
          </div>

          <Btn onClick={()=>{
            setBreathActive(!breathActive);
            if(!breathActive){setBreathPhase(0);setBreathCount(0);}
          }} color={breathActive?"#EF5350":C.mint} style={{marginBottom:18}}>
            {breathActive?"Stop":"Start Breathing"}
          </Btn>

          {breathCount>0 && (
            <p style={{color:C.purple,fontWeight:700,fontSize:16,fontFamily:F.b}}>
              {breathCount} breath{breathCount>1?"s":""} complete — well done!
            </p>
          )}

          <Card style={{marginTop:20,textAlign:"left"}}>
            <Label>Sessions completed</Label>
            <p style={{fontFamily:F.h,fontWeight:800,fontSize:28,color:C.purple,margin:0}}>
              {activeChild.breath_sessions||0}
            </p>
            <p style={{color:C.muted,fontSize:14,fontWeight:500,marginTop:4}}>
              {(activeChild.breath_sessions||0)>=5
                ? "Calm Champion badge earned!"
                : `${5-(activeChild.breath_sessions||0)} more for the Calm Champion badge`}
            </p>
          </Card>
        </div>
      )}

      {/* JOURNAL */}
      {tab==="journal" && (
        <div style={{paddingTop:12,animation:"fadeIn 0.4s ease"}}>
          <h2 style={{fontFamily:F.h,fontSize:28,fontWeight:800,color:C.text,marginBottom:4}}>
            My Journal
          </h2>
          <p style={{color:C.muted,fontSize:15,marginBottom:16,fontWeight:500}}>
            Your thoughts are safe here.
          </p>

          <Card style={{background:`linear-gradient(135deg,${C.pink},${C.purple})`,marginBottom:14}}>
            <p style={{color:"rgba(255,255,255,0.8)",fontWeight:700,fontSize:12,
              letterSpacing:1,textTransform:"uppercase",marginBottom:8}}>Today's Prompt</p>
            <p style={{color:"#fff",fontSize:18,fontWeight:700,fontFamily:F.h,
              lineHeight:1.5,margin:"0 0 14px"}}>{JOURNAL_PROMPTS[promptIdx]}</p>
            <button onClick={()=>setPromptIdx(i=>(i+1)%JOURNAL_PROMPTS.length)} style={{
              background:"rgba(255,255,255,0.22)",border:"none",color:"#fff",
              borderRadius:50,padding:"7px 18px",cursor:"pointer",
              fontSize:13,fontWeight:600,fontFamily:F.b,
              display:"inline-flex",alignItems:"center",gap:6}}>
              <Icon name="refresh" size={14} color="#fff"/> Different prompt
            </button>
          </Card>

          <Card>
            <textarea value={journalText}
              onChange={e=>{setJournalText(e.target.value);setJournalSaved(false);}}
              placeholder="Write anything you want — there are no wrong answers."
              style={{width:"100%",minHeight:140,border:"none",outline:"none",
                fontSize:16,fontFamily:F.b,fontWeight:500,color:C.text,
                lineHeight:1.8,resize:"none"}}/>
            <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",
              marginTop:10,borderTop:`1px solid ${C.border}`,paddingTop:10}}>
              <span style={{color:"#ccc",fontSize:13,fontFamily:F.b}}>
                {journalText.length} characters
              </span>
              <Btn onClick={saveJournal} disabled={!journalText.trim()||journalSaved}
                loading={saveLoading} small color={journalSaved?C.mint:C.pink}
                icon={journalSaved?"check":null}>
                {journalSaved?"Saved":"Save Entry"}
              </Btn>
            </div>
          </Card>

          {journalSaved && (
            <Card style={{textAlign:"center",background:"#E8F5E9",animation:"scaleIn 0.3s ease"}}>
              <div style={{background:"#C8E6C9",borderRadius:"50%",width:64,height:64,
                display:"flex",alignItems:"center",justifyContent:"center",margin:"0 auto 12px"}}>
                <Icon name="star" size={34} color="#2E7D32"/>
              </div>
              <p style={{fontFamily:F.h,fontWeight:800,fontSize:20,color:"#2E7D32",marginBottom:4}}>
                Amazing job writing today!
              </p>
              <p style={{color:"#66BB6A",fontSize:14,fontWeight:500}}>{cm.name} is so proud of you.</p>
              <Btn small color="#fff" textColor="#43A047"
                style={{marginTop:12,border:"1.5px solid #A5D6A7"}}
                onClick={()=>{setJournalText("");setJournalSaved(false);
                  setPromptIdx(i=>(i+1)%JOURNAL_PROMPTS.length);}}>
                Write another
              </Btn>
            </Card>
          )}

          {journals.length > 0 && (
            <Card>
              <Label>Past Entries ({journals.length})</Label>
              {journals.slice(0,5).map((j,i)=>(
                <div key={j.id} style={{padding:"12px 0",
                  borderBottom:i<Math.min(4,journals.length-1)?"1px solid #F0EAFF":"none"}}>
                  <div style={{display:"flex",justifyContent:"space-between",
                    alignItems:"center",marginBottom:4}}>
                    <span style={{fontSize:12,fontWeight:700,color:C.purple,fontFamily:F.b}}>
                      {j.prompt}
                    </span>
                    <span style={{fontSize:11,color:C.muted,fontFamily:F.b,flexShrink:0,marginLeft:8}}>
                      {j.date===today()?"Today":j.date}
                    </span>
                  </div>
                  <p style={{color:C.text,fontSize:14,lineHeight:1.6,fontWeight:500,margin:0,
                    overflow:"hidden",textOverflow:"ellipsis",display:"-webkit-box",
                    WebkitLineClamp:2,WebkitBoxOrient:"vertical"}}>
                    {j.text}
                  </p>
                </div>
              ))}
            </Card>
          )}
        </div>
      )}
    </Shell>
  );
}
