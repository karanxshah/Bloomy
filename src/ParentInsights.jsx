import { useState, useEffect } from "react";

/* ── Font loader — same as main app ── */
const FontLoader = () => (
  <style>{`
    @import url('https://fonts.googleapis.com/css2?family=Baloo+2:wght@700;800;900&family=Poppins:wght@400;500;600;700&display=swap');
    @keyframes shake { 0%,100%{transform:translateX(0)} 20%,60%{transform:translateX(-8px)} 40%,80%{transform:translateX(8px)} }
    @keyframes fadeIn { from{opacity:0;transform:translateY(10px)} to{opacity:1;transform:translateY(0)} }
  `}</style>
);

const C = {
  purple:"#7C4DFF", pink:"#F06292", yellow:"#FFD54F",
  mint:"#4DB6AC", sky:"#4FC3F7", coral:"#FF7043",
  bg:"#F7F4FF", text:"#2D2040", muted:"#9B8DB5", border:"#EEE9FF",
};
const F = { h:"'Baloo 2', cursive", b:"'Poppins', sans-serif" };

const MOOD_COLORS = {Amazing:"#F9A825",Good:"#43A047",Okay:"#1E88E5",Sad:"#7B1FA2",Angry:"#E53935",Worried:"#E64A19"};
const MOOD_BG     = {Amazing:"#FFF9C4",Good:"#E8F5E9",Okay:"#E3F2FD",Sad:"#EDE7F6",Angry:"#FFEBEE",Worried:"#FBE9E7"};

const MASCOTS = [
  {id:"fox",   name:"Finn",    color:"#FF7043", bg:"#FFF3E0"},
  {id:"bunny", name:"Blossom", color:"#EC407A", bg:"#FCE4EC"},
  {id:"bear",  name:"Bruno",   color:"#8D6E63", bg:"#EFEBE9"},
  {id:"owl",   name:"Ollie",   color:"#7E57C2", bg:"#EDE7F6"},
  {id:"cat",   name:"Luna",    color:"#26A69A", bg:"#E0F2F1"},
  {id:"dog",   name:"Sunny",   color:"#FFA726", bg:"#FFF8E1"},
];

const STAGES = [
  {id:0, name:"Seedling",    color:"#A5D6A7", bg:"#E8F5E9",  minScore:0},
  {id:1, name:"Sprouting",   color:"#4DB6AC", bg:"#E0F2F1",  minScore:15},
  {id:2, name:"Blooming",    color:"#7C4DFF", bg:"#EDE7F6",  minScore:35},
  {id:3, name:"Flourishing", color:"#FF7043", bg:"#FFF3E0",  minScore:70},
  {id:4, name:"Thriving",    color:"#F9A825", bg:"#FFF9C4",  minScore:120},
  {id:5, name:"Blossoming",  color:"#EC407A", bg:"#FCE4EC",  minScore:180},
  {id:6, name:"Full Bloom",  color:"#FFD54F", bg:"#FFFDE7",  minScore:260},
];

const calcGrowthScore = (child, moodLog, journals, gratitudes) => {
  const moodSeeds      = (moodLog?.length || 0) * 1;
  const journalSeeds   = (journals?.length || 0) * 2;
  const breathSeeds    = (child?.breath_sessions || 0) * 2;
  const affirmSeeds    = Math.floor((child?.affirm_count || 0) * 0.5);
  const gratitudeSeeds = (gratitudes?.length || 0) * 1;
  const streakBonus    = getStreak(moodLog) >= 7 ? 5 : 0;
  const missionBonus   = (child?.missions_completed || 0) * 3;
  return moodSeeds + journalSeeds + breathSeeds + affirmSeeds + gratitudeSeeds + streakBonus + missionBonus;
};

const getStage = (score) => {
  let stage = STAGES[0];
  for (const s of STAGES) { if (score >= s.minScore) stage = s; }
  return stage;
};

const today = () => new Date().toISOString().split("T")[0];

const getStreak = (moodLog) => {
  if (!moodLog||moodLog.length===0) return 0;
  const dates=[...new Set(moodLog.map(e=>e.date))].sort().reverse();
  let streak=0; const d=new Date();
  for (let i=0;i<100;i++) {
    const s=d.toISOString().split("T")[0];
    if (dates.includes(s)) streak++; else if (i>0) break;
    d.setDate(d.getDate()-1);
  }
  return streak;
};

const last7Days = () => {
  const days=["Sun","Mon","Tue","Wed","Thu","Fri","Sat"];
  return Array.from({length:7},(_,i)=>{
    const d=new Date(); d.setDate(d.getDate()-6+i);
    return {date:d.toISOString().split("T")[0],label:days[d.getDay()]};
  });
};

/* ── Icons ── */
const Icon = ({ name, size=24, color=C.purple, style:st }) => {
  const s={width:size,height:size,display:"block",flexShrink:0,...st};
  const p={stroke:color,strokeWidth:"2.2",strokeLinecap:"round",strokeLinejoin:"round",fill:"none"};
  const map = {
    back:    <svg viewBox="0 0 24 24" style={s}><path d="M19 12H5M12 5l-7 7 7 7" {...p}/></svg>,
    lock:    <svg viewBox="0 0 24 24" style={s}><rect x="3" y="11" width="18" height="11" rx="2" {...p}/><path d="M7 11V7a5 5 0 0110 0v4" {...p}/><circle cx="12" cy="16" r="1.5" fill={color}/></svg>,
    check:   <svg viewBox="0 0 24 24" style={s}><path d="M20 6L9 17l-5-5" {...p}/></svg>,
    mood:    <svg viewBox="0 0 24 24" style={s}><circle cx="12" cy="12" r="9" {...p}/><circle cx="9" cy="10" r="1.2" fill={color}/><circle cx="15" cy="10" r="1.2" fill={color}/><path d="M8.5 14.5c1 1.5 5.5 1.5 7 0" {...p}/></svg>,
    star:    <svg viewBox="0 0 24 24" style={s}><path d="M12 2l2.9 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l7.1-1.01L12 2z" stroke={color} strokeWidth="2" fill={color} fillOpacity="0.15"/></svg>,
    heart:   <svg viewBox="0 0 24 24" style={s}><path d="M20.84 4.61a5.5 5.5 0 00-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 00-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 000-7.78z" stroke={color} strokeWidth="2" fill={color} fillOpacity="0.15"/></svg>,
    fire:    <svg viewBox="0 0 24 24" style={s}><path d="M12 22c-4.97 0-9-3.58-9-8 0-3 1.5-5.5 4-7-.5 2 .5 4 2 5 .5-2 2-4 4-5-1 2-.5 4.5 1 6 .5-1 1.5-2 1.5-3.5C17.5 12 18 14 18 16c0 3.31-2.69 6-6 6z" stroke={color} strokeWidth="2" fill={color} fillOpacity="0.18"/></svg>,
    trophy:  <svg viewBox="0 0 24 24" style={s}><path d="M8 21h8M12 17v4" {...p}/><path d="M5 3h14v6a7 7 0 01-14 0V3z" {...p}/><path d="M5 5H2v2a4 4 0 004 4M19 5h3v2a4 4 0 01-4 4" {...p}/></svg>,
    wind:    <svg viewBox="0 0 24 24" style={s}><path d="M9.59 4.59A2 2 0 1 1 11 8H2" {...p}/><path d="M12.59 19.41A2 2 0 1 0 14 16H2" {...p}/><path d="M6 12h14.59a2 2 0 1 1-1.59 3.18" {...p}/></svg>,
    book:    <svg viewBox="0 0 24 24" style={s}><path d="M4 19.5A2.5 2.5 0 016.5 17H20" {...p}/><path d="M6.5 2H20v20H6.5A2.5 2.5 0 014 19.5v-15A2.5 2.5 0 016.5 2z" {...p}/><path d="M9 7h6M9 11h4" {...p}/></svg>,
    alert:   <svg viewBox="0 0 24 24" style={s}><path d="M10.29 3.86L1.82 18a2 2 0 001.71 3h16.94a2 2 0 001.71-3L13.71 3.86a2 2 0 00-3.42 0z" {...p}/><line x1="12" y1="9" x2="12" y2="13" {...p}/><circle cx="12" cy="17" r="1" fill={color}/></svg>,
    settings:<svg viewBox="0 0 24 24" style={s}><circle cx="12" cy="12" r="3" {...p}/><path d="M19.4 15a1.65 1.65 0 00.33 1.82l.06.06a2 2 0 010 2.83 2 2 0 01-2.83 0l-.06-.06a1.65 1.65 0 00-1.82-.33 1.65 1.65 0 00-1 1.51V21a2 2 0 01-4 0v-.09A1.65 1.65 0 009 19.4a1.65 1.65 0 00-1.82.33l-.06.06a2 2 0 01-2.83-2.83l.06-.06A1.65 1.65 0 004.68 15a1.65 1.65 0 00-1.51-1H3a2 2 0 010-4h.09A1.65 1.65 0 004.6 9a1.65 1.65 0 00-.33-1.82l-.06-.06a2 2 0 012.83-2.83l.06.06A1.65 1.65 0 009 4.68a1.65 1.65 0 001-1.51V3a2 2 0 014 0v.09a1.65 1.65 0 001 1.51 1.65 1.65 0 001.82-.33l.06-.06a2 2 0 012.83 2.83l-.06.06A1.65 1.65 0 0019.4 9a1.65 1.65 0 001.51 1H21a2 2 0 010 4h-.09a1.65 1.65 0 00-1.51 1z" {...p}/></svg>,
    seed:    <svg viewBox="0 0 24 24" style={s}><path d="M12 22V12M12 12C12 7 7 3 2 3c0 5 4 9 10 9zM12 12c0-5 5-9 10-9-1 5-5 9-10 9" {...p}/></svg>,
    target:  <svg viewBox="0 0 24 24" style={s}><circle cx="12" cy="12" r="10" {...p}/><circle cx="12" cy="12" r="6" {...p}/><circle cx="12" cy="12" r="2" {...p}/></svg>,
    gratitude:<svg viewBox="0 0 24 24" style={s}><path d="M12 21.593c-5.63-5.539-11-10.297-11-14.402 0-3.791 3.068-5.191 5.281-5.191 1.312 0 4.151.501 5.719 4.457 1.59-3.968 4.464-4.447 5.726-4.447 2.54 0 5.274 1.621 5.274 5.181 0 4.069-5.136 8.625-11 14.402z" stroke={color} strokeWidth="2" fill={color} fillOpacity="0.15"/></svg>,
  };
  return map[name]||null;
};

/* ── Mood face ── */
const MoodFace = ({ type, size=32 }) => {
  const cfg={
    Amazing:{bg:"#FFF9C4",c:"#F9A825"},Good:{bg:"#E8F5E9",c:"#43A047"},
    Okay:{bg:"#E3F2FD",c:"#1E88E5"},Sad:{bg:"#EDE7F6",c:"#7B1FA2"},
    Angry:{bg:"#FFEBEE",c:"#E53935"},Worried:{bg:"#FBE9E7",c:"#E64A19"},
  };
  const {bg,c}=cfg[type]||cfg.Okay;
  const mouths={
    Amazing:<path d="M14 20 Q20 27 26 20" stroke={c} strokeWidth="2.2" fill="none" strokeLinecap="round"/>,
    Good:   <path d="M14 19 Q20 24 26 19" stroke={c} strokeWidth="2.2" fill="none" strokeLinecap="round"/>,
    Okay:   <line x1="14" y1="21" x2="26" y2="21" stroke={c} strokeWidth="2.2" strokeLinecap="round"/>,
    Sad:    <path d="M14 23 Q20 17 26 23" stroke={c} strokeWidth="2.2" fill="none" strokeLinecap="round"/>,
    Angry:  <path d="M14 23 Q20 18 26 23" stroke={c} strokeWidth="2.2" fill="none" strokeLinecap="round"/>,
    Worried:<path d="M14 22 Q17 19 20 22 Q23 25 26 22" stroke={c} strokeWidth="2.2" fill="none" strokeLinecap="round"/>,
  };
  return (
    <svg width={size} height={size} viewBox="0 0 40 40">
      <circle cx="20" cy="20" r="18" fill={bg} stroke={c} strokeWidth="2"/>
      <circle cx="14" cy="17" r="2.4" fill={c}/><circle cx="26" cy="17" r="2.4" fill={c}/>
      {mouths[type]}
    </svg>
  );
};

/* ── Mascot face ── */
const MascotFace = ({ id, size=48 }) => {
  const faces={
    fox:   <svg width={size} height={size} viewBox="0 0 80 80"><ellipse cx="40" cy="46" rx="28" ry="24" fill="#FF8A65"/><polygon points="13,18 26,44 38,24" fill="#FF7043"/><polygon points="67,18 54,44 42,24" fill="#FF7043"/><ellipse cx="40" cy="50" rx="16" ry="11" fill="#FFCCBC"/><circle cx="30" cy="41" r="5" fill="#fff"/><circle cx="50" cy="41" r="5" fill="#fff"/><circle cx="31" cy="42" r="2.5" fill="#1a1a2e"/><circle cx="51" cy="42" r="2.5" fill="#1a1a2e"/></svg>,
    bunny: <svg width={size} height={size} viewBox="0 0 80 80"><ellipse cx="27" cy="20" rx="7" ry="17" fill="#F8BBD0"/><ellipse cx="53" cy="20" rx="7" ry="17" fill="#F8BBD0"/><ellipse cx="40" cy="50" rx="26" ry="22" fill="#FCE4EC"/><circle cx="30" cy="46" r="5" fill="#fff"/><circle cx="50" cy="46" r="5" fill="#fff"/><circle cx="31" cy="47" r="2.5" fill="#1a1a2e"/><circle cx="51" cy="47" r="2.5" fill="#1a1a2e"/></svg>,
    bear:  <svg width={size} height={size} viewBox="0 0 80 80"><circle cx="20" cy="25" r="13" fill="#A1887F"/><circle cx="60" cy="25" r="13" fill="#A1887F"/><ellipse cx="40" cy="50" rx="27" ry="23" fill="#8D6E63"/><circle cx="29" cy="45" r="5.5" fill="#fff"/><circle cx="51" cy="45" r="5.5" fill="#fff"/><circle cx="30" cy="46" r="2.8" fill="#1a1a2e"/><circle cx="52" cy="46" r="2.8" fill="#1a1a2e"/></svg>,
    owl:   <svg width={size} height={size} viewBox="0 0 80 80"><ellipse cx="40" cy="48" rx="26" ry="26" fill="#7E57C2"/><ellipse cx="22" cy="24" rx="7" ry="9" fill="#7E57C2"/><ellipse cx="58" cy="24" rx="7" ry="9" fill="#7E57C2"/><circle cx="29" cy="43" r="9" fill="#fff"/><circle cx="51" cy="43" r="9" fill="#fff"/><circle cx="29" cy="44" r="5" fill="#4527A0"/><circle cx="51" cy="44" r="5" fill="#4527A0"/></svg>,
    cat:   <svg width={size} height={size} viewBox="0 0 80 80"><polygon points="17,30 12,10 30,26" fill="#26A69A"/><polygon points="63,30 68,10 50,26" fill="#26A69A"/><ellipse cx="40" cy="50" rx="26" ry="23" fill="#4DB6AC"/><circle cx="29" cy="45" r="5.5" fill="#fff"/><circle cx="51" cy="45" r="5.5" fill="#fff"/><circle cx="30" cy="46" r="2.8" fill="#1a1a2e"/><circle cx="52" cy="46" r="2.8" fill="#1a1a2e"/></svg>,
    dog:   <svg width={size} height={size} viewBox="0 0 80 80"><ellipse cx="16" cy="36" rx="9" ry="16" fill="#FFA726" transform="rotate(-20 16 36)"/><ellipse cx="64" cy="36" rx="9" ry="16" fill="#FFA726" transform="rotate(20 64 36)"/><ellipse cx="40" cy="50" rx="27" ry="23" fill="#FFB74D"/><circle cx="29" cy="45" r="5.5" fill="#fff"/><circle cx="51" cy="45" r="5.5" fill="#fff"/><circle cx="30" cy="46" r="2.8" fill="#1a1a2e"/><circle cx="52" cy="46" r="2.8" fill="#1a1a2e"/></svg>,
  };
  return faces[id]||faces.fox;
};

/* ── Primitives ── */
const Card = ({children,style}) => (
  <div style={{background:"#fff",borderRadius:20,padding:"20px",
    boxShadow:"0 2px 18px rgba(124,77,255,0.09)",marginBottom:14,...style}}>
    {children}
  </div>
);

const Label = ({children,color}) => (
  <p style={{fontFamily:F.b,fontWeight:700,fontSize:12,color:color||C.muted,
    letterSpacing:1.3,textTransform:"uppercase",marginBottom:10,margin:"0 0 10px"}}>
    {children}
  </p>
);

const BackBtn = ({onClick,label="Back"}) => (
  <button onClick={onClick} style={{background:"none",border:"none",cursor:"pointer",
    display:"flex",alignItems:"center",gap:6,paddingTop:32,paddingBottom:12,
    color:C.muted,fontFamily:F.b,fontWeight:600,fontSize:15}}>
    <Icon name="back" size={18} color={C.muted}/> {label}
  </button>
);

const Shell = ({children}) => (
  <div style={{minHeight:"100vh",background:C.bg,fontFamily:F.b,
    display:"flex",flexDirection:"column",alignItems:"center",
    padding:"0 0 60px",overflowX:"hidden"}}>
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

/* ══════════════════════════════════════════
   PIN PAD
══════════════════════════════════════════ */
const PinPad = ({ onSuccess, onCancel, existingPin, mode }) => {
  const [input,setInput]   = useState("");
  const [step,setStep]     = useState(mode==="set"?"enter":"verify");
  const [first,setFirst]   = useState("");
  const [error,setError]   = useState("");
  const [shake,setShake]   = useState(false);

  const triggerShake = (msg) => {
    setShake(true);
    setTimeout(()=>setShake(false),500);
    setInput("");
    setError(msg||"Incorrect PIN. Try again.");
  };

  const handleDigit = (d) => {
    if (input.length>=4) return;
    const next=input+d;
    setInput(next);
    setError("");
    if (next.length===4) {
      setTimeout(()=>{
        if (mode==="verify") {
          if (next===existingPin) onSuccess();
          else triggerShake("Incorrect PIN. Try again.");
        } else {
          if (step==="enter") { setFirst(next); setInput(""); setStep("confirm"); }
          else {
            if (next===first) onSuccess(next);
            else { setFirst(""); setStep("enter"); triggerShake("PINs didn't match. Try again."); }
          }
        }
      },150);
    }
  };

  const handleDelete = () => setInput(i=>i.slice(0,-1));

  const prompt = mode==="verify"
    ? "Enter your parent PIN"
    : step==="enter" ? "Create a 4-digit PIN" : "Confirm your PIN";

  return (
    <div style={{display:"flex",flexDirection:"column",alignItems:"center",
      padding:"20px 24px 32px",animation:"fadeIn 0.3s ease"}}>

      <div style={{background:"#EDE7F6",borderRadius:"50%",padding:18,marginBottom:20}}>
        <Icon name="lock" size={36} color={C.purple}/>
      </div>

      <h2 style={{fontFamily:F.h,fontSize:26,fontWeight:800,color:C.text,
        marginBottom:6,textAlign:"center"}}>
        {prompt}
      </h2>

      <p style={{fontFamily:F.b,fontWeight:500,fontSize:14,color:C.muted,
        marginBottom:4,textAlign:"center",lineHeight:1.5}}>
        {mode==="set"
          ? step==="enter" ? "Choose 4 digits to protect your parent area." : "Enter the same PIN again to confirm."
          : "This keeps your children's data private."}
      </p>

      {error && (
        <p style={{fontFamily:F.b,color:"#E53935",fontSize:14,
          fontWeight:600,marginTop:8,marginBottom:0}}>{error}</p>
      )}

      {/* Dots */}
      <div style={{display:"flex",gap:16,margin:"24px 0",
        animation:shake?"shake 0.4s ease":"none"}}>
        {Array.from({length:4},(_,i)=>(
          <div key={i} style={{width:16,height:16,borderRadius:"50%",
            background:i<input.length?C.purple:"transparent",
            border:`2.5px solid ${i<input.length?C.purple:C.border}`,
            transition:"all 0.15s"}}/>
        ))}
      </div>

      {/* Number pad */}
      <div style={{display:"grid",gridTemplateColumns:"repeat(3,1fr)",
        gap:12,marginBottom:20,width:"100%",maxWidth:300}}>
        {[1,2,3,4,5,6,7,8,9,"",0,"⌫"].map((d,i)=>(
          <button key={i}
            onClick={()=>d==="⌫"?handleDelete():d!==""&&handleDigit(String(d))}
            style={{
              background:d===""?"transparent":d==="⌫"?"#FFF3E0":"#fff",
              border:d===""?"none":`1.5px solid ${C.border}`,
              borderRadius:16,padding:"18px 0",
              fontSize:22,fontWeight:700,fontFamily:F.b,
              color:d==="⌫"?C.coral:C.text,
              cursor:d===""?"default":"pointer",
              boxShadow:d===""?"none":"0 2px 8px rgba(0,0,0,0.06)",
              transition:"transform 0.1s",
            }}
            onMouseDown={e=>{if(d!=="")e.currentTarget.style.transform="scale(0.93)";}}
            onMouseUp={e=>e.currentTarget.style.transform="scale(1)"}>
            {d}
          </button>
        ))}
      </div>

      <button onClick={onCancel} style={{background:"none",border:"none",
        color:C.muted,fontSize:14,fontWeight:600,fontFamily:F.b,cursor:"pointer"}}>
        Cancel
      </button>
    </div>
  );
};

/* ══════════════════════════════════════════
   MAIN EXPORT
══════════════════════════════════════════ */

/* ── Mood Heatmap ── */
const HEATMAP_COLORS = {
  Amazing: "#F9A825",
  Good:    "#43A047",
  Okay:    "#1E88E5",
  Worried: "#E64A19",
  Sad:     "#7B1FA2",
  Angry:   "#E53935",
};

const MoodHeatmap = ({ moodLog }) => {
  const [range, setRange] = useState(30);
  const [tooltip, setTooltip] = useState(null);

  const getDays = (n) => {
    const days = [];
    for (let i = n - 1; i >= 0; i--) {
      const d = new Date();
      d.setDate(d.getDate() - i);
      const dateStr = d.toISOString().split("T")[0];
      const entry = [...moodLog].reverse().find(e => e.date === dateStr);
      days.push({ date: dateStr, entry });
    }
    return days;
  };

  const days = getDays(range);

  // Split into rows of 7
  const weeks = [];
  for (let i = 0; i < days.length; i += 7) {
    weeks.push(days.slice(i, i + 7));
  }

  const cellSize = range === 30 ? 36 : 28;
  const cellGap = 5;
  const dayLabels = ["S","M","T","W","T","F","S"];

  // Figure out what day of week the first day falls on
  const firstDayOfWeek = new Date(days[0].date + "T12:00:00").getDay();

  // Build a padded grid — pad start so day 1 lands on correct column
  const padded = [...Array(firstDayOfWeek).fill(null), ...days];
  const paddedWeeks = [];
  for (let i = 0; i < padded.length; i += 7) {
    paddedWeeks.push(padded.slice(i, i + 7));
  }

  const hasData = days.some(d => d.entry);

  return (
    <div style={{ background:"#fff", borderRadius:20, padding:"20px", marginBottom:14, boxShadow:"0 2px 18px rgba(124,77,255,0.09)" }}>

      {/* Header */}
      <div style={{ display:"flex", justifyContent:"space-between", alignItems:"center", marginBottom:16 }}>
        <div>
          <p style={{ fontFamily:F.h, fontWeight:800, fontSize:17, color:C.text, margin:0 }}>Mood Heatmap</p>
          <p style={{ fontFamily:F.b, fontWeight:500, fontSize:12, color:C.muted, margin:0 }}>
            Each square is one day
          </p>
        </div>
        <div style={{ display:"flex", gap:6 }}>
          {[30, 60].map(n => (
            <button key={n} onClick={() => setRange(n)} style={{
              background: range===n ? C.purple : "#F0EAFF",
              color: range===n ? "#fff" : C.muted,
              border:"none", borderRadius:50, padding:"5px 14px",
              fontSize:12, fontWeight:700, fontFamily:F.b, cursor:"pointer",
              transition:"all 0.18s",
            }}>{n} days</button>
          ))}
        </div>
      </div>

      {/* Day of week labels */}
      <div style={{ display:"flex", gap:cellGap, marginBottom:4, paddingLeft:2 }}>
        {dayLabels.map((d, i) => (
          <div key={i} style={{
            width:cellSize, textAlign:"center",
            fontFamily:F.b, fontSize:10, fontWeight:700, color:C.muted,
          }}>{d}</div>
        ))}
      </div>

      {/* Grid */}
      <div style={{ display:"flex", flexDirection:"column", gap:cellGap }}>
        {paddedWeeks.map((week, wi) => (
          <div key={wi} style={{ display:"flex", gap:cellGap }}>
            {Array.from({length:7}).map((_, di) => {
              const day = week[di];
              if (!day) return (
                <div key={di} style={{ width:cellSize, height:cellSize }}/>
              );
              const color = day.entry ? HEATMAP_COLORS[day.entry.mood] : "#EEE9FF";
              const isToday = day.date === new Date().toISOString().split("T")[0];
              const dateLabel = new Date(day.date + "T12:00:00").toLocaleDateString("en",{month:"short",day:"numeric"});
              return (
                <div
                  key={di}
                  onClick={() => setTooltip(tooltip?.date === day.date ? null : { date:day.date, mood:day.entry?.mood, label:dateLabel })}
                  style={{
                    width:cellSize, height:cellSize,
                    borderRadius: range===30 ? 10 : 8,
                    background: color,
                    border: isToday ? `2px solid ${C.purple}` : "2px solid transparent",
                    cursor: day.entry ? "pointer" : "default",
                    transition:"transform 0.12s",
                    position:"relative",
                    flexShrink:0,
                  }}
                  onMouseEnter={e=>{ if(day.entry) e.currentTarget.style.transform="scale(1.15)"; }}
                  onMouseLeave={e=>e.currentTarget.style.transform="scale(1)"}
                >
                  {/* Date number */}
                  <span style={{
                    position:"absolute", bottom:3, right:4,
                    fontSize:9, fontWeight:700, fontFamily:F.b,
                    color: day.entry ? "rgba(255,255,255,0.7)" : "#C5B8E8",
                    lineHeight:1,
                  }}>
                    {new Date(day.date + "T12:00:00").getDate()}
                  </span>
                </div>
              );
            })}
          </div>
        ))}
      </div>

      {/* Tooltip */}
      {tooltip && (
        <div style={{
          marginTop:14, background:C.bg, borderRadius:14,
          padding:"10px 14px", display:"flex", alignItems:"center", gap:10,
          animation:"fadeIn 0.2s ease",
        }}>
          <div style={{ width:14, height:14, borderRadius:4, background:HEATMAP_COLORS[tooltip.mood], flexShrink:0 }}/>
          <p style={{ fontFamily:F.b, fontWeight:600, fontSize:13, color:C.text, margin:0 }}>
            {tooltip.label} — <span style={{ color:HEATMAP_COLORS[tooltip.mood] }}>{tooltip.mood}</span>
          </p>
        </div>
      )}

      {/* Empty state */}
      {!hasData && (
        <p style={{ fontFamily:F.b, fontWeight:500, fontSize:13, color:C.muted, textAlign:"center", margin:"16px 0 0" }}>
          No mood data yet. Check back once your child starts logging!
        </p>
      )}

      {/* Legend */}
      <div style={{ display:"flex", flexWrap:"wrap", gap:"8px 14px", marginTop:16 }}>
        {Object.entries(HEATMAP_COLORS).map(([mood, color]) => (
          <div key={mood} style={{ display:"flex", alignItems:"center", gap:5 }}>
            <div style={{ width:10, height:10, borderRadius:3, background:color }}/>
            <span style={{ fontFamily:F.b, fontSize:11, color:C.muted, fontWeight:600 }}>{mood}</span>
          </div>
        ))}
        <div style={{ display:"flex", alignItems:"center", gap:5 }}>
          <div style={{ width:10, height:10, borderRadius:3, background:"#EEE9FF" }}/>
          <span style={{ fontFamily:F.b, fontSize:11, color:C.muted, fontWeight:600 }}>No entry</span>
        </div>
      </div>
    </div>
  );
};

export default function ParentInsights({ supabase, session, children, onClose }) {
  const [pinState,setPinState]           = useState("check");
  const [savedPin,setSavedPin]           = useState(null);
  const [selectedChild,setSelectedChild] = useState(null);
  const [moodLog,setMoodLog]             = useState([]);
  const [journals,setJournals]           = useState([]);
  const [gratitudes,setGratitudes]       = useState([]);
  const [dataLoading,setDataLoading]     = useState(false);
  const [changingPin,setChangingPin]     = useState(false);
  const [insightTab,setInsightTab]       = useState("overview");

  useEffect(()=>{
    const pin=session?.user?.user_metadata?.parent_pin;
    if (pin) { setSavedPin(pin); setPinState("unlock"); }
    else { setPinState("set"); }
  },[session]);

  const savePin = async (pin) => {
    await supabase.auth.updateUser({data:{parent_pin:pin}});
    setSavedPin(pin);
    setPinState("unlocked");
    setChangingPin(false);
  };

  const loadChildData = async (child) => {
    setDataLoading(true);
    setSelectedChild(child);
    const [moodRes,journalRes,gratitudeRes] = await Promise.all([
      supabase.from("mood_logs").select("*").eq("child_id",child.id).order("created_at",{ascending:true}),
      supabase.from("journal_entries").select("*").eq("child_id",child.id).order("created_at",{ascending:false}),
      supabase.from("gratitudes").select("*").eq("child_id",child.id).order("created_at",{ascending:false}),
    ]);
    if (!moodRes.error) setMoodLog(moodRes.data||[]);
    if (!journalRes.error) setJournals(journalRes.data||[]);
    if (!gratitudeRes.error) setGratitudes(gratitudeRes.data||[]);
    setDataLoading(false);
  };

  const week=last7Days();

  /* ── Set PIN screen ── */
  if (pinState==="set"||changingPin) return (
    <Shell>
      <BackBtn onClick={()=>{setChangingPin(false);if(!savedPin)onClose();else setPinState("unlocked");}}
        label={savedPin?"Back":"Back to Dashboard"}/>
      <PinPad mode="set" onSuccess={savePin}
        onCancel={()=>{setChangingPin(false);if(!savedPin)onClose();else setPinState("unlocked");}}/>
    </Shell>
  );

  /* ── Unlock screen ── */
  if (pinState==="unlock") return (
    <Shell>
      <BackBtn onClick={onClose} label="Back to Dashboard"/>
      <PinPad mode="verify" existingPin={savedPin}
        onSuccess={()=>setPinState("unlocked")}
        onCancel={onClose}/>
    </Shell>
  );

  /* ── Child list ── */
  if (pinState==="unlocked"&&!selectedChild) return (
    <Shell>
      <div style={{paddingTop:36}}>
        <div style={{display:"flex",justifyContent:"space-between",
          alignItems:"center",marginBottom:24}}>
          <div>
            <button onClick={onClose} style={{background:"none",border:"none",cursor:"pointer",
              display:"flex",alignItems:"center",gap:5,marginBottom:6,
              color:C.muted,fontFamily:F.b,fontWeight:600,fontSize:14}}>
              <Icon name="back" size={16} color={C.muted}/> Dashboard
            </button>
            <h2 style={{fontFamily:F.h,fontSize:28,fontWeight:900,color:C.text,margin:0}}>
              Parent Insights
            </h2>
          </div>
          <button onClick={()=>setChangingPin(true)} style={{
            background:"#EDE7F6",border:"none",borderRadius:50,padding:"8px 14px",
            cursor:"pointer",display:"flex",alignItems:"center",gap:6,
            color:C.purple,fontFamily:F.b,fontWeight:600,fontSize:13}}>
            <Icon name="settings" size={15} color={C.purple}/> PIN
          </button>
        </div>

        <Card style={{background:`linear-gradient(135deg,${C.purple},${C.pink})`,padding:"20px 22px"}}>
          <p style={{fontFamily:F.b,color:"rgba(255,255,255,0.8)",fontSize:12,fontWeight:700,
            letterSpacing:1,textTransform:"uppercase",marginBottom:6}}>
            Select a child to view
          </p>
          <p style={{fontFamily:F.b,color:"#fff",fontSize:16,fontWeight:500,lineHeight:1.5,margin:0}}>
            Tap a profile below to see their full activity, mood history, and journal entries.
          </p>
        </Card>

        {children.length===0 && (
          <Card style={{textAlign:"center",padding:"32px 20px"}}>
            <Icon name="mood" size={40} color={C.muted} style={{margin:"0 auto 12px"}}/>
            <p style={{fontFamily:F.b,color:C.muted,fontWeight:500,fontSize:15,margin:0}}>
              No child profiles yet. Add one from the dashboard!
            </p>
          </Card>
        )}

        {children.map(child=>{
          const m=MASCOTS.find(x=>x.id===child.mascot_id)||MASCOTS[0];
          const seedScore = Math.floor(
            (child.affirm_count||0) * 0.5 +
            (child.breath_sessions||0) * 2 +
            (child.missions_completed||0) * 3
          );
          const stage = getStage(seedScore);
          return (
            <button key={child.id} onClick={()=>loadChildData(child)} style={{
              width:"100%",background:"#fff",borderRadius:20,padding:"18px 20px",
              border:`1.5px solid ${C.border}`,marginBottom:12,cursor:"pointer",
              display:"flex",alignItems:"center",gap:14,textAlign:"left",
              boxShadow:"0 2px 18px rgba(124,77,255,0.08)",transition:"transform 0.15s"}}
              onMouseDown={e=>e.currentTarget.style.transform="scale(0.98)"}
              onMouseUp={e=>e.currentTarget.style.transform="scale(1)"}>
              <div style={{background:m.bg,borderRadius:14,padding:10,flexShrink:0}}>
                <MascotFace id={m.id} size={44}/>
              </div>
              <div style={{flex:1}}>
                <p style={{fontFamily:F.h,fontWeight:800,fontSize:20,color:C.text,margin:0}}>
                  {child.name}
                </p>
                <p style={{fontFamily:F.b,color:C.muted,fontSize:13,fontWeight:500,margin:"2px 0 0"}}>
                  {m.name} · {stage.name}
                </p>
              </div>
              <div style={{textAlign:"right"}}>
                <div style={{display:"flex",alignItems:"center",gap:4,
                  background:stage.bg,borderRadius:50,padding:"4px 10px"}}>
                  <span style={{fontSize:12}}>🌱</span>
                  <p style={{fontFamily:F.b,fontWeight:700,fontSize:12,
                    color:stage.color,margin:0}}>
                    {Math.round(seedScore)} seeds
                  </p>
                </div>
              </div>
            </button>
          );
        })}
      </div>
    </Shell>
  );

  /* ── Child detail ── */
  if (pinState==="unlocked"&&selectedChild) {
    const m=MASCOTS.find(x=>x.id===selectedChild.mascot_id)||MASCOTS[0];
    const streak=getStreak(moodLog);
    const score=calcGrowthScore(selectedChild,moodLog,journals,gratitudes);
    const stage=getStage(score);
    const todayMood=moodLog.slice().reverse().find(e=>e.date===today());
    const moodCounts=moodLog.reduce((acc,e)=>({...acc,[e.mood]:(acc[e.mood]||0)+1}),{});
    const topMood=Object.entries(moodCounts).sort((a,b)=>b[1]-a[1])[0];
    const thisWeekMoods=moodLog.filter(e=>{
      const d=new Date(); d.setDate(d.getDate()-6);
      return new Date(e.date)>=d;
    });
    const concernMoods=thisWeekMoods.filter(e=>["Sad","Angry","Worried"].includes(e.mood));
    const showAlert=concernMoods.length>=3;

    return (
      <Shell>
        <div style={{paddingTop:36}}>

          {/* Header */}
          <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:16}}>
            <button onClick={()=>{setSelectedChild(null);setMoodLog([]);setJournals([]);setGratitudes([]);setInsightTab("overview");}}
              style={{background:"none",border:"none",cursor:"pointer",
                display:"flex",alignItems:"center",gap:5,
                color:C.muted,fontFamily:F.b,fontWeight:600,fontSize:14}}>
              <Icon name="back" size={16} color={C.muted}/> All children
            </button>
            <span style={{fontFamily:F.h,fontWeight:800,fontSize:18,color:C.text}}>
              {selectedChild.name}
            </span>
            <div style={{width:80}}/>
          </div>

          {/* Identity card — always visible */}
          <Card style={{background:`linear-gradient(135deg,${m.color},${C.pink})`,padding:"20px 22px",marginBottom:14}}>
            <div style={{display:"flex",alignItems:"center",gap:14}}>
              <div style={{background:"rgba(255,255,255,0.2)",borderRadius:16,padding:10}}>
                <MascotFace id={m.id} size={52}/>
              </div>
              <div style={{flex:1}}>
                <p style={{fontFamily:F.h,fontWeight:900,fontSize:22,color:"#fff",margin:0}}>
                  {selectedChild.name}
                </p>
                <p style={{fontFamily:F.b,color:"rgba(255,255,255,0.85)",fontSize:14,fontWeight:500,margin:0}}>
                  {m.name} · {streak>0?`${streak}-day streak`:"No streak yet"}
                </p>
              </div>
              <div style={{textAlign:"right"}}>
                <div style={{background:"rgba(255,255,255,0.25)",borderRadius:12,padding:"6px 12px",marginBottom:4}}>
                  <p style={{fontFamily:F.h,fontWeight:900,fontSize:18,color:"#fff",margin:0}}>🌱 {score}</p>
                </div>
                <p style={{fontFamily:F.b,fontWeight:700,fontSize:11,color:"rgba(255,255,255,0.8)",margin:0}}>{stage.name}</p>
              </div>
            </div>
          </Card>

          {/* Tabs */}
          <div style={{display:"flex",gap:8,marginBottom:16}}>
            {[
              {id:"overview", label:"Overview"},
              {id:"journal",  label:`Journal (${journals.length})`},
              {id:"gratitude",label:`Gratitude (${gratitudes.length})`},
            ].map(t=>(
              <button key={t.id} onClick={()=>setInsightTab(t.id)} style={{
                flex:1, padding:"10px 8px",
                background:insightTab===t.id?C.purple:"#fff",
                color:insightTab===t.id?"#fff":C.muted,
                border:`1.5px solid ${insightTab===t.id?C.purple:C.border}`,
                borderRadius:50, cursor:"pointer",
                fontFamily:F.b, fontWeight:700, fontSize:13,
                transition:"all 0.18s",
              }}>{t.label}</button>
            ))}
          </div>

          {dataLoading ? (
            <Card style={{textAlign:"center",padding:"40px 20px"}}>
              <p style={{fontFamily:F.b,color:C.muted,fontWeight:500,fontSize:15,margin:0}}>
                Loading {selectedChild.name}'s data...
              </p>
            </Card>
          ) : (
            <div style={{animation:"fadeIn 0.4s ease"}}>

              {/* OVERVIEW TAB */}
              {insightTab==="overview" && (
                <>
                  {showAlert && (
                    <Card style={{background:"#FFF3E0",border:"1.5px solid #FFB74D",padding:"16px 18px"}}>
                      <div style={{display:"flex",gap:12,alignItems:"flex-start"}}>
                        <Icon name="alert" size={24} color="#F57C00" style={{flexShrink:0,marginTop:2}}/>
                        <div>
                          <p style={{fontFamily:F.h,fontWeight:800,fontSize:16,color:"#E65100",margin:"0 0 4px"}}>
                            Worth checking in on
                          </p>
                          <p style={{fontFamily:F.b,color:"#BF360C",fontSize:14,fontWeight:500,margin:0,lineHeight:1.6}}>
                            {selectedChild.name} has logged difficult emotions {concernMoods.length} times this week. A gentle conversation can make a big difference.
                          </p>
                        </div>
                      </div>
                    </Card>
                  )}

                  <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:10,marginBottom:14}}>
                    {[
                      {label:"Day streak",    value:`${streak}d`,                        color:C.coral,  bg:"#FFF3E0"},
                      {label:"Seeds",         value:`🌱 ${score}`,                       color:"#43A047",bg:"#E8F5E9"},
                      {label:"Mood logs",     value:moodLog.length,                      color:C.purple, bg:"#EDE7F6"},
                      {label:"Missions done", value:selectedChild.missions_completed||0, color:"#F9A825",bg:"#FFF9C4"},
                    ].map(s=>(
                      <div key={s.label} style={{background:s.bg,borderRadius:16,padding:"14px 12px",textAlign:"center"}}>
                        <p style={{fontFamily:F.h,fontWeight:900,fontSize:22,color:s.color,margin:0}}>{s.value}</p>
                        <p style={{fontFamily:F.b,color:s.color,fontSize:11,fontWeight:700,margin:0,marginTop:2}}>{s.label}</p>
                      </div>
                    ))}
                  </div>

                  <Card>
                    <Label>Today's Mood</Label>
                    {todayMood ? (
                      <div style={{display:"flex",alignItems:"center",gap:12}}>
                        <MoodFace type={todayMood.mood} size={44}/>
                        <div>
                          <p style={{fontFamily:F.h,fontWeight:800,fontSize:18,color:MOOD_COLORS[todayMood.mood],margin:0}}>{todayMood.mood}</p>
                          {todayMood.note && (
                            <p style={{fontFamily:F.b,fontSize:13,fontWeight:500,color:C.muted,margin:"4px 0 0",fontStyle:"italic"}}>
                              "{todayMood.note}"
                            </p>
                          )}
                          <p style={{fontFamily:F.b,color:C.muted,fontSize:12,fontWeight:500,margin:"2px 0 0"}}>Logged today</p>
                        </div>
                      </div>
                    ) : (
                      <p style={{fontFamily:F.b,color:C.muted,fontSize:15,fontWeight:500,margin:0}}>
                        {selectedChild.name} hasn't logged a mood today yet.
                      </p>
                    )}
                  </Card>

                  <MoodHeatmap moodLog={moodLog}/>

                  {topMood && (
                    <Card style={{display:"flex",alignItems:"center",gap:14,padding:"16px 20px"}}>
                      <MoodFace type={topMood[0]} size={44}/>
                      <div>
                        <Label>Most Common Mood</Label>
                        <p style={{fontFamily:F.h,fontWeight:800,fontSize:18,color:MOOD_COLORS[topMood[0]],margin:0}}>
                          {topMood[0]} — {topMood[1]} time{topMood[1]>1?"s":""}
                        </p>
                      </div>
                    </Card>
                  )}
                </>
              )}

              {/* JOURNAL TAB */}
              {insightTab==="journal" && (
                <>
                  {journals.length===0 ? (
                    <Card style={{textAlign:"center",padding:"40px 20px"}}>
                      <Icon name="book" size={40} color={C.muted} style={{margin:"0 auto 12px"}}/>
                      <p style={{fontFamily:F.b,color:C.muted,fontWeight:500,fontSize:15,margin:0}}>
                        {selectedChild.name} hasn't written any journal entries yet.
                      </p>
                    </Card>
                  ) : (
                    <Card>
                      <Label>Journal Entries ({journals.length})</Label>
                      {journals.map((j,i)=>(
                        <div key={j.id} style={{padding:"14px 0",borderBottom:i<journals.length-1?`1px solid ${C.border}`:"none"}}>
                          <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:6}}>
                            <p style={{fontFamily:F.b,fontWeight:700,fontSize:12,color:C.purple,margin:0}}>{j.prompt}</p>
                            <span style={{fontFamily:F.b,fontSize:11,color:C.muted,flexShrink:0,marginLeft:8}}>
                              {j.date===today()?"Today":j.date}
                            </span>
                          </div>
                          <p style={{fontFamily:F.b,fontWeight:500,fontSize:14,color:C.text,margin:0,lineHeight:1.7}}>
                            {j.text}
                          </p>
                        </div>
                      ))}
                    </Card>
                  )}
                </>
              )}

              {/* GRATITUDE TAB */}
              {insightTab==="gratitude" && (
                <>
                  {gratitudes.length===0 ? (
                    <Card style={{textAlign:"center",padding:"40px 20px"}}>
                      <Icon name="heart" size={40} color={C.muted} style={{margin:"0 auto 12px"}}/>
                      <p style={{fontFamily:F.b,color:C.muted,fontWeight:500,fontSize:15,margin:0}}>
                        {selectedChild.name} hasn't added any gratitudes yet.
                      </p>
                    </Card>
                  ) : (
                    <Card>
                      <Label>Gratitudes ({gratitudes.length})</Label>
                      {gratitudes.map((g,i)=>(
                        <div key={g.id||i} style={{display:"flex",alignItems:"flex-start",gap:12,padding:"12px 0",borderBottom:i<gratitudes.length-1?`1px solid ${C.border}`:"none"}}>
                          <div style={{width:10,height:10,borderRadius:"50%",flexShrink:0,marginTop:5,
                            background:["#FFD54F","#F06292","#7C4DFF","#4DB6AC","#FF7043","#4FC3F7"][i%6]}}/>
                          <div style={{flex:1}}>
                            <p style={{fontFamily:F.b,fontWeight:600,fontSize:14,color:C.text,margin:0,lineHeight:1.6}}>{g.text}</p>
                            <p style={{fontFamily:F.b,fontSize:11,color:C.muted,margin:"2px 0 0"}}>
                              {g.date===today()?"Today":g.date}
                            </p>
                          </div>
                        </div>
                      ))}
                    </Card>
                  )}
                </>
              )}

            </div>
          )}
        </div>
      </Shell>
    );
  }

  return null;
}
