import { F } from "../constants.js";

export const FontLoader = () => (
  <style>{`
    @import url('https://fonts.googleapis.com/css2?family=Baloo+2:wght@700;800;900&family=Poppins:wght@400;500;600;700&display=swap');
    *, *::before, *::after { box-sizing: border-box; margin: 0; padding: 0; }
    @keyframes floatUp    { 0%,100%{transform:translateY(0)}   50%{transform:translateY(-10px)} }
    @keyframes pulse      { 0%,100%{transform:scale(1)}         50%{transform:scale(1.13)} }
    @keyframes fadeIn     { from{opacity:0;transform:translateY(10px)} to{opacity:1;transform:translateY(0)} }
    @keyframes scaleIn    { from{opacity:0;transform:scale(0.92)} to{opacity:1;transform:scale(1)} }
    @keyframes slideInUp  { from{opacity:0;transform:translateY(40px)} to{opacity:1;transform:translateY(0)} }
    @keyframes swipeLeft  { 0%{opacity:1;transform:translateX(0) rotate(0deg) scale(1)} 100%{opacity:0;transform:translateX(-140px) rotate(-12deg) scale(0.9)} }
    @keyframes slideRight { 0%{opacity:0;transform:translateX(100px) rotate(8deg) scale(0.95)} 100%{opacity:1;transform:translateX(0) rotate(0deg) scale(1)} }
    @keyframes tooltipIn  { from{opacity:0;transform:translateY(8px) scale(0.95)} to{opacity:1;transform:translateY(0) scale(1)} }
    @keyframes basketBounce { 0%{transform:scale(1)} 40%{transform:scale(1.25) rotate(-8deg)} 70%{transform:scale(0.95) rotate(4deg)} 100%{transform:scale(1) rotate(0deg)} }
    ::-webkit-scrollbar { width: 4px; }
    ::-webkit-scrollbar-thumb { background: #ddd; border-radius: 2px; }
  `}</style>
);

export const Icon = ({ name, size=24, color="#7C4DFF", style: st }) => {
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
    sparkle: <svg viewBox="0 0 24 24" style={s}><path d="M12 2v4M12 18v4M4.93 4.93l2.83 2.83M16.24 16.24l2.83 2.83M2 12h4M18 12h4M4.93 19.07l2.83-2.83M16.24 7.76l2.83-2.83" {...p}/></svg>,
    shield:  <svg viewBox="0 0 24 24" style={s}><path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" {...p}/></svg>,
    growth:  <svg viewBox="0 0 24 24" style={s}><polyline points="23 6 13.5 15.5 8.5 10.5 1 18" {...p}/><polyline points="17 6 23 6 23 12" {...p}/></svg>,
    mail:    <svg viewBox="0 0 24 24" style={s}><path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z" {...p}/><polyline points="22,6 12,13 2,6" {...p}/></svg>,
    lock:    <svg viewBox="0 0 24 24" style={s}><rect x="3" y="11" width="18" height="11" rx="2" ry="2" {...p}/><path d="M7 11V7a5 5 0 0110 0v4" {...p}/></svg>,
    settings:<svg viewBox="0 0 24 24" style={s}><circle cx="12" cy="12" r="3" {...p}/><path d="M19.4 15a1.65 1.65 0 00.33 1.82l.06.06a2 2 0 010 2.83 2 2 0 01-2.83 0l-.06-.06a1.65 1.65 0 00-1.82-.33 1.65 1.65 0 00-1 1.51V21a2 2 0 01-2 2 2 2 0 01-2-2v-.09A1.65 1.65 0 009 19.4a1.65 1.65 0 00-1.82.33l-.06.06a2 2 0 01-2.83 0 2 2 0 010-2.83l.06-.06A1.65 1.65 0 004.68 15a1.65 1.65 0 00-1.51-1H3a2 2 0 01-2-2 2 2 0 012-2h.09A1.65 1.65 0 004.6 9a1.65 1.65 0 00-.33-1.82l-.06-.06a2 2 0 010-2.83 2 2 0 012.83 0l.06.06A1.65 1.65 0 009 4.68a1.65 1.65 0 001-1.51V3a2 2 0 012-2 2 2 0 012 2v.09a1.65 1.65 0 001 1.51 1.65 1.65 0 001.82-.33l.06-.06a2 2 0 012.83 0 2 2 0 010 2.83l-.06.06A1.65 1.65 0 0019.4 9a1.65 1.65 0 001.51 1H21a2 2 0 012 2 2 2 0 01-2 2h-.09a1.65 1.65 0 00-1.51 1z" {...p}/></svg>,
  };
  return map[name] || null;
};

export const MascotFace = ({ id, size=64 }) => {
  const faces = {
    fox:   <svg width={size} height={size} viewBox="0 0 80 80" role="img" aria-label="Fox mascot face"><title>Fox</title><ellipse cx="40" cy="46" rx="28" ry="24" fill="#FF8A65"/><polygon points="13,18 26,44 38,24" fill="#FF7043"/><polygon points="67,18 54,44 42,24" fill="#FF7043"/><ellipse cx="40" cy="50" rx="16" ry="11" fill="#FFCCBC"/><circle cx="30" cy="41" r="5" fill="#fff"/><circle cx="50" cy="41" r="5" fill="#fff"/><circle cx="31" cy="42" r="2.5" fill="#1a1a2e"/><circle cx="51" cy="42" r="2.5" fill="#1a1a2e"/><circle cx="32" cy="41" r="1" fill="#fff"/><circle cx="52" cy="41" r="1" fill="#fff"/><ellipse cx="40" cy="53" rx="5" ry="3.5" fill="#EF5350"/><path d="M36 56 Q40 60 44 56" stroke="#555" strokeWidth="1.8" fill="none" strokeLinecap="round"/></svg>,
    bunny: <svg width={size} height={size} viewBox="0 0 80 80" role="img" aria-label="Bunny mascot face"><title>Bunny</title><ellipse cx="27" cy="20" rx="7" ry="17" fill="#F8BBD0"/><ellipse cx="53" cy="20" rx="7" ry="17" fill="#F8BBD0"/><ellipse cx="40" cy="50" rx="26" ry="22" fill="#FCE4EC"/><ellipse cx="40" cy="55" rx="14" ry="10" fill="#F8BBD0"/><circle cx="30" cy="46" r="5" fill="#fff"/><circle cx="50" cy="46" r="5" fill="#fff"/><circle cx="31" cy="47" r="2.5" fill="#1a1a2e"/><circle cx="51" cy="47" r="2.5" fill="#1a1a2e"/><circle cx="32" cy="46" r="1" fill="#fff"/><circle cx="52" cy="46" r="1" fill="#fff"/><ellipse cx="40" cy="57" rx="5" ry="3" fill="#F48FB1"/><path d="M36 60 Q40 64 44 60" stroke="#555" strokeWidth="1.8" fill="none" strokeLinecap="round"/></svg>,
    bear:  <svg width={size} height={size} viewBox="0 0 80 80" role="img" aria-label="Bear mascot face"><title>Bear</title><circle cx="20" cy="25" r="13" fill="#A1887F"/><circle cx="60" cy="25" r="13" fill="#A1887F"/><ellipse cx="40" cy="50" rx="27" ry="23" fill="#8D6E63"/><ellipse cx="40" cy="56" rx="16" ry="11" fill="#BCAAA4"/><circle cx="29" cy="45" r="5.5" fill="#fff"/><circle cx="51" cy="45" r="5.5" fill="#fff"/><circle cx="30" cy="46" r="2.8" fill="#1a1a2e"/><circle cx="52" cy="46" r="2.8" fill="#1a1a2e"/><circle cx="31" cy="45" r="1.1" fill="#fff"/><circle cx="53" cy="45" r="1.1" fill="#fff"/><ellipse cx="40" cy="58" rx="5" ry="3.5" fill="#795548"/><path d="M36 61 Q40 65 44 61" stroke="#555" strokeWidth="1.8" fill="none" strokeLinecap="round"/></svg>,
    owl:   <svg width={size} height={size} viewBox="0 0 80 80" role="img" aria-label="Owl mascot face"><title>Owl</title><ellipse cx="40" cy="48" rx="26" ry="26" fill="#7E57C2"/><ellipse cx="40" cy="52" rx="18" ry="18" fill="#B39DDB"/><ellipse cx="22" cy="24" rx="7" ry="9" fill="#7E57C2"/><ellipse cx="58" cy="24" rx="7" ry="9" fill="#7E57C2"/><circle cx="29" cy="43" r="9" fill="#fff"/><circle cx="51" cy="43" r="9" fill="#fff"/><circle cx="29" cy="44" r="5" fill="#4527A0"/><circle cx="51" cy="44" r="5" fill="#4527A0"/><circle cx="30" cy="43" r="2" fill="#fff"/><circle cx="52" cy="43" r="2" fill="#fff"/><polygon points="40,51 37,56 43,56" fill="#FFA726"/></svg>,
    cat:   <svg width={size} height={size} viewBox="0 0 80 80" role="img" aria-label="Cat mascot face"><title>Cat</title><polygon points="17,30 12,10 30,26" fill="#26A69A"/><polygon points="63,30 68,10 50,26" fill="#26A69A"/><ellipse cx="40" cy="50" rx="26" ry="23" fill="#4DB6AC"/><ellipse cx="40" cy="55" rx="15" ry="11" fill="#B2DFDB"/><circle cx="29" cy="45" r="5.5" fill="#fff"/><circle cx="51" cy="45" r="5.5" fill="#fff"/><circle cx="30" cy="46" r="2.8" fill="#1a1a2e"/><circle cx="52" cy="46" r="2.8" fill="#1a1a2e"/><circle cx="31" cy="45" r="1.1" fill="#fff"/><circle cx="53" cy="45" r="1.1" fill="#fff"/><ellipse cx="40" cy="57" rx="5" ry="3" fill="#FF8A80"/><path d="M36 60 Q40 64 44 60" stroke="#555" strokeWidth="1.8" fill="none" strokeLinecap="round"/></svg>,
    dog:   <svg width={size} height={size} viewBox="0 0 80 80" role="img" aria-label="Dog mascot face"><title>Dog</title><ellipse cx="16" cy="36" rx="9" ry="16" fill="#FFA726" transform="rotate(-20 16 36)"/><ellipse cx="64" cy="36" rx="9" ry="16" fill="#FFA726" transform="rotate(20 64 36)"/><ellipse cx="40" cy="50" rx="27" ry="23" fill="#FFB74D"/><ellipse cx="40" cy="56" rx="17" ry="12" fill="#FFE0B2"/><circle cx="29" cy="45" r="5.5" fill="#fff"/><circle cx="51" cy="45" r="5.5" fill="#fff"/><circle cx="30" cy="46" r="2.8" fill="#1a1a2e"/><circle cx="52" cy="46" r="2.8" fill="#1a1a2e"/><circle cx="31" cy="45" r="1.1" fill="#fff"/><circle cx="53" cy="45" r="1.1" fill="#fff"/><ellipse cx="40" cy="58" rx="6" ry="4" fill="#FF7043"/><path d="M36 62 Q40 66 44 62" stroke="#555" strokeWidth="1.8" fill="none" strokeLinecap="round"/></svg>,
  };
  return faces[id] || faces.fox;
};

export const MoodFace = ({ type, size=44, active }) => {
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
    <svg width={size} height={size} viewBox="0 0 40 40" role="img" aria-label={`${type} mood face`}>
      <title>{type}</title>
      <circle cx="20" cy="20" r="18" fill={active?c:bg} stroke={c} strokeWidth="2"/>
      {brows[type]}
      <circle cx="14" cy="17" r="2.4" fill={fc}/>
      <circle cx="26" cy="17" r="2.4" fill={fc}/>
      {mouths[type]}
    </svg>
  );
};

export const Card = ({children, style, bg, shadow}) => (
  <div style={{
    background: bg || "#fff",
    borderRadius:20, padding:"22px 20px",
    boxShadow: shadow || "0 2px 18px rgba(124,77,255,0.09)",
    marginBottom:14, ...style}}>
    {children}
  </div>
);

export const Btn = ({children,onClick,color,textColor,style,small,icon,disabled,loading}) => (
  <button onClick={onClick} disabled={!!disabled||!!loading} style={{
    background:disabled||loading?"#e0e0e0":(color||"#7C4DFF"),
    color:disabled||loading?"#aaa":(textColor||"#fff"),
    border:"none",borderRadius:50,
    padding:small?"10px 22px":"15px 34px",
    fontSize:small?14:16,fontWeight:700,fontFamily:F.b,
    cursor:disabled||loading?"not-allowed":"pointer",
    boxShadow:disabled||loading?"none":`0 4px 14px ${color||"#7C4DFF"}44`,
    transition:"transform 0.12s",
    display:"inline-flex",alignItems:"center",gap:8,letterSpacing:0.2,...style,
  }}
    onMouseDown={e=>{if(!disabled&&!loading)e.currentTarget.style.transform="scale(0.95)";}}
    onMouseUp={e=>{e.currentTarget.style.transform="scale(1)";}}
  >
    {icon&&!loading&&<Icon name={icon} size={18} color={disabled||loading?"#aaa":(textColor||"#fff")}/>}
    {loading?"Loading...":children}
  </button>
);

export const Label = ({children, color}) => (
  <p style={{fontFamily:F.b,fontWeight:700,fontSize:12,color:color||"#9B8DB5",
    letterSpacing:1.3,textTransform:"uppercase",marginBottom:10}}>{children}</p>
);

export const TextInput = ({value,onChange,placeholder,type="text",style}) => (
  <input value={value} onChange={onChange} placeholder={placeholder} type={type}
    style={{width:"100%",padding:"13px 18px",borderRadius:50,
      border:"2px solid #EEE9FF",fontSize:16,fontFamily:F.b,
      fontWeight:500,color:"#2D2040",background:"#fff",...style}}
    onFocus={e=>e.target.style.border="2px solid #7C4DFF"}
    onBlur={e=>e.target.style.border="2px solid #EEE9FF"}
  />
);

export const Shell = ({children, stageBg, dark}) => (
  <div style={{minHeight:"100vh",background:stageBg||(dark?"#0F0A1E":"#F7F4FF"),fontFamily:F.b,
    display:"flex",flexDirection:"column",alignItems:"center",
    padding:"0 0 92px",position:"relative",overflowX:"hidden",
    transition:"background 1.5s ease"}}>
    <FontLoader/>
    <div style={{position:"fixed",top:-90,right:-90,width:280,height:280,
      borderRadius:"50%",background:dark?"rgba(157,113,255,0.08)":"rgba(124,77,255,0.06)",
      pointerEvents:"none",zIndex:0}}/>
    <div style={{position:"fixed",bottom:-90,left:-90,width:320,height:320,
      borderRadius:"50%",background:dark?"rgba(244,143,177,0.07)":"rgba(240,98,146,0.06)",
      pointerEvents:"none",zIndex:0}}/>
    <div style={{position:"relative",zIndex:1,width:"100%",maxWidth:430,padding:"0 20px"}}>
      {children}
    </div>
  </div>
);

export const Tooltip = ({ text, seen, onDismiss, theme }) => {
  if (seen) return null;
  const C = theme || {};
  const bg = C.card || "#fff";
  const purple = C.purple || "#7C4DFF";
  const textColor = C.text || "#2D2040";
  return (
    <div style={{
      background: bg, border: `2px solid ${purple}`,
      borderRadius: 16, padding: "12px 16px",
      marginBottom: 12, position: "relative",
      animation: "tooltipIn 0.35s ease forwards",
      boxShadow: `0 4px 20px ${purple}33`,
    }}>
      <div style={{display:"flex",justifyContent:"space-between",alignItems:"flex-start",gap:12}}>
        <p style={{fontFamily:F.b,fontWeight:600,fontSize:14,color:textColor,margin:0,lineHeight:1.6}}>{text}</p>
        <button onClick={onDismiss} style={{
          background:purple,border:"none",borderRadius:50,
          width:24,height:24,cursor:"pointer",flexShrink:0,
          color:"#fff",fontSize:16,fontWeight:700,fontFamily:F.b,
          display:"flex",alignItems:"center",justifyContent:"center"}}>
          ×
        </button>
      </div>
      <div style={{position:"absolute",top:-8,left:20,width:0,height:0,
        borderLeft:"8px solid transparent",borderRight:"8px solid transparent",
        borderBottom:`8px solid ${purple}`}}/>
    </div>
  );
};

/* ── Toast notification ── */
export const Toast = ({ message, type="error", visible }) => {
  if (!visible) return null;
  const bg = type==="error" ? "#E53935" : type==="success" ? "#43A047" : "#7C4DFF";
  return (
    <div style={{
      position:"fixed",top:24,left:"50%",transform:"translateX(-50%)",
      background:bg,color:"#fff",borderRadius:50,padding:"12px 20px",
      fontFamily:F.b,fontWeight:600,fontSize:14,zIndex:9999,
      boxShadow:"0 4px 20px rgba(0,0,0,0.25)",
      animation:"slideInUp 0.3s ease",whiteSpace:"nowrap",
    }}>
      {message}
    </div>
  );
};

export const SettingsPanel = ({ darkMode, setDarkMode, soundOn, setSoundOn, onClose, theme }) => {
  const C = theme || {};
  const dark = darkMode;
  return (
    <div style={{
      position:"fixed",top:0,left:0,right:0,bottom:0,
      background:"rgba(0,0,0,0.5)",zIndex:800,
      display:"flex",alignItems:"flex-end",justifyContent:"center",
      backdropFilter:"blur(4px)",
    }} onClick={onClose}>
      <div onClick={e=>e.stopPropagation()} style={{
        background:dark?"#261840":"#fff",
        borderRadius:"24px 24px 0 0",padding:"28px 24px 48px",
        width:"100%",maxWidth:430,
        animation:"slideInUp 0.3s ease",
        boxShadow:"0 -8px 40px rgba(0,0,0,0.2)",
      }}>
        <div style={{width:40,height:4,borderRadius:50,background:dark?"#4a3a6a":"#ddd",margin:"0 auto 24px"}}/>
        <h3 style={{fontFamily:F.h,fontWeight:900,fontSize:24,color:dark?"#EEE9FF":"#2D2040",marginBottom:24}}>
          Settings
        </h3>
        {[
          {label:"Dark Mode",sub:"Easier on the eyes at night",val:darkMode,set:setDarkMode},
          {label:"Sound Effects",sub:"Soft chimes and whooshes",val:soundOn,set:setSoundOn},
        ].map(({label,sub,val,set})=>(
          <div key={label} style={{display:"flex",justifyContent:"space-between",alignItems:"center",
            padding:"16px 0",borderBottom:`1px solid ${dark?"#2d2050":"#F0EAFF"}`}}>
            <div>
              <p style={{fontFamily:F.b,fontWeight:700,fontSize:16,color:dark?"#EEE9FF":"#2D2040",margin:0}}>{label}</p>
              <p style={{fontFamily:F.b,fontWeight:500,fontSize:13,color:"#9B8DB5",margin:0}}>{sub}</p>
            </div>
            <button onClick={()=>set(v=>!v)} style={{
              width:52,height:30,borderRadius:50,border:"none",cursor:"pointer",
              background:val?"#7C4DFF":"#ddd",position:"relative",transition:"background 0.3s",flexShrink:0,
            }}>
              <div style={{position:"absolute",top:3,left:val?24:3,width:24,height:24,borderRadius:"50%",
                background:"#fff",transition:"left 0.3s",boxShadow:"0 2px 6px rgba(0,0,0,0.2)"}}/>
            </button>
          </div>
        ))}
        <button onClick={onClose} style={{
          width:"100%",marginTop:24,
          background:"linear-gradient(135deg,#7C4DFF,#F06292)",
          border:"none",borderRadius:50,padding:"15px",
          color:"#fff",fontSize:16,fontWeight:700,fontFamily:F.b,
          cursor:"pointer",boxShadow:"0 4px 16px rgba(124,77,255,0.4)",
        }}>Done</button>
      </div>
    </div>
  );
};
