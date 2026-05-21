import { useState, useEffect, useCallback, useRef } from "react";
import { createClient } from "@supabase/supabase-js";
import ParentInsights from "./ParentInsights";
import { GrowthMascot, GardenScene, GrowthProgressBar, GrowthCelebration, SeedPopup, calcGrowthScore, getStage, STAGES } from "./MascotGrowth";
import MascotRoom from "./MascotRoom";

const SUPABASE_URL = "https://ymfvezvezzmckcdwjvzm.supabase.co";
const SUPABASE_KEY = "sb_publishable_5CR_k4TEBUYXhqm3AuN7bQ_Csiafdcs";
const supabase = createClient(SUPABASE_URL, SUPABASE_KEY);

const FontLoader = ({ dark }) => (
  <style>{`
    @import url('https://fonts.googleapis.com/css2?family=Baloo+2:wght@700;800;900&family=Poppins:wght@400;500;600;700&display=swap');
    *, *::before, *::after { box-sizing: border-box; margin: 0; padding: 0; }
    @keyframes floatUp    { 0%,100%{transform:translateY(0)}   50%{transform:translateY(-10px)} }
    @keyframes pulse      { 0%,100%{transform:scale(1)}         50%{transform:scale(1.13)} }
    @keyframes fadeIn     { from{opacity:0;transform:translateY(10px)} to{opacity:1;transform:translateY(0)} }
    @keyframes scaleIn    { from{opacity:0;transform:scale(0.92)} to{opacity:1;transform:scale(1)} }
    @keyframes slideInUp  { from{opacity:0;transform:translateY(40px)} to{opacity:1;transform:translateY(0)} }
    @keyframes swipeLeft  { 0%{opacity:1;transform:translateX(0) rotate(0deg) scale(1)}
                            100%{opacity:0;transform:translateX(-140px) rotate(-12deg) scale(0.9)} }
    @keyframes slideRight { 0%{opacity:0;transform:translateX(100px) rotate(8deg) scale(0.95)}
                            100%{opacity:1;transform:translateX(0) rotate(0deg) scale(1)} }
    @keyframes bgShift    { 0%{opacity:0.6} 50%{opacity:1} 100%{opacity:0.6} }
    @keyframes tooltipIn  { from{opacity:0;transform:translateY(8px) scale(0.95)} to{opacity:1;transform:translateY(0) scale(1)} }
    ::-webkit-scrollbar { width: 4px; }
    ::-webkit-scrollbar-thumb { background: #ddd; border-radius: 2px; }
  `}</style>
);

const LIGHT = {
  purple:"#7C4DFF", pink:"#F06292", yellow:"#FFD54F",
  mint:"#4DB6AC", sky:"#4FC3F7", coral:"#FF7043",
  bg:"#F7F4FF", text:"#2D2040", muted:"#9B8DB5", border:"#EEE9FF",
  card:"#ffffff", navBg:"#ffffff", navBorder:"#EEE9FF",
};
const DARK = {
  purple:"#A78BFA", pink:"#F9A8D4", yellow:"#FDE68A",
  mint:"#6EE7B7", sky:"#7DD3FC", coral:"#FCA5A5",
  bg:"#0F0A1E", text:"#F3F0FF", muted:"#A78BFA",
  border:"#2E1F5E", card:"#1A1133", navBg:"#130D27", navBorder:"#2E1F5E",
};
const F = { h:"'Baloo 2', cursive", b:"'Poppins', sans-serif" };

/* Static C for components defined outside main function */
const C = LIGHT;

/* Stage-based animated backgrounds for home screen */
const STAGE_BGSANIM = [
  "linear-gradient(160deg,#A5D6A744 0%,#E8F5E944 50%,#F7F4FF 100%)",   // Seedling - soft green
  "linear-gradient(160deg,#4DB6AC44 0%,#E0F2F144 50%,#F7F4FF 100%)",   // Sprouting - teal
  "linear-gradient(160deg,#7C4DFF33 0%,#EDE7F644 50%,#F7F4FF 100%)",   // Blooming - purple
  "linear-gradient(160deg,#FFD54F44 0%,#FFF9C444 50%,#F7F4FF 100%)",   // Thriving - golden
];

/* Sound utility — uses Web Audio API, no external libs needed */
const playSound = (type, enabled) => {
  if (!enabled) return;
  try {
    const ctx = new (window.AudioContext || window.webkitAudioContext)();
    const gain = ctx.createGain();
    gain.connect(ctx.destination);

    if (type === "whoosh") {
      // Proper whoosh — noise burst with falling frequency envelope
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
      source.connect(filter);
      filter.connect(gain);
      gain.gain.setValueAtTime(0.18, ctx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.32);
      source.start(ctx.currentTime);
      source.stop(ctx.currentTime + 0.35);
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
      s.freq.forEach((f, i) => {
        osc.frequency.setValueAtTime(f, ctx.currentTime + i * s.dur);
      });
      gain.gain.setValueAtTime(s.vol, ctx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + s.freq.length * s.dur + 0.1);
      osc.start(ctx.currentTime);
      osc.stop(ctx.currentTime + s.freq.length * s.dur + 0.15);
    }
  } catch(e) { /* audio not supported */ }
};

/* ── Icons ── */
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
    sparkle: <svg viewBox="0 0 24 24" style={s}><path d="M12 2v4M12 18v4M4.93 4.93l2.83 2.83M16.24 16.24l2.83 2.83M2 12h4M18 12h4M4.93 19.07l2.83-2.83M16.24 7.76l2.83-2.83" {...p}/></svg>,
    shield:  <svg viewBox="0 0 24 24" style={s}><path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" {...p}/></svg>,
    growth:  <svg viewBox="0 0 24 24" style={s}><polyline points="23 6 13.5 15.5 8.5 10.5 1 18" {...p}/><polyline points="17 6 23 6 23 12" {...p}/></svg>,
  };
  return map[name] || null;
};

/* ── Mascot Faces ── */
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

/* ── Mood Faces ── */
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

/* ── Data ── */
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

/* ── Emotion-specific messages (fix #4) ── */
const MOOD_MESSAGES = {
  Amazing: { title:"You are absolutely glowing today!", sub:"That energy is contagious — keep shining!" },
  Good:    { title:"It feels great to feel good!", sub:"Hold onto that feeling — you deserve it." },
  Okay:    { title:"Okay days are perfectly normal.", sub:"Every day doesn't need to be amazing. You're doing great." },
  Sad:     { title:"It's okay to feel sad sometimes.", sub:"Your feelings are valid. Be gentle with yourself today." },
  Angry:   { title:"Feeling angry is completely normal.", sub:"Take a deep breath — let's work through it together." },
  Worried: { title:"It's okay to feel worried.", sub:"You are safe and supported. One breath at a time." },
};

const ALL_AFFIRMATIONS = [
  /* Uplifting — shown first when Amazing or Good */
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
  /* Comforting — shown first when Sad, Worried or Angry */
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
  /* Growth — shown when Okay or no mood logged */
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

/* Sort affirmations by mood context */
const getSortedAffirmations = (lastMood) => {
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

const AFFIRMATIONS = ALL_AFFIRMATIONS; // keep for home card
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
  {id:"first_checkin", icon:"star",   label:"First Check-in",  check:(ml,j,b,a)=>ml.length>=1},
  {id:"mood_explorer", icon:"mood",   label:"Mood Explorer",   check:(ml,j,b,a)=>new Set(ml.map(e=>e.mood)).size>=6},
  {id:"brave_heart",   icon:"heart",  label:"Brave Heart",     check:(ml,j,b,a)=>j.length>=5},
  {id:"week_streak",   icon:"fire",   label:"7-Day Streak",    check:(ml,j,b,a)=>getStreak(ml)>=7},
  {id:"affirm_pro",    icon:"trophy", label:"Affirmation Pro", check:(ml,j,b,a)=>a>=20},
  {id:"calm_champ",    icon:"wind",   label:"Calm Champion",   check:(ml,j,b,a)=>b>=5},
];

const today = () => new Date().toISOString().split("T")[0];
const getStreak = (moodLog) => {
  if (!moodLog||moodLog.length===0) return 0;
  const dates = [...new Set(moodLog.map(e=>e.date))].sort().reverse();
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

/* ── Primitives ── */
const Card = ({children, style, bg, shadow}) => (
  <div style={{
    background: bg || "#fff",
    borderRadius:20, padding:"22px 20px",
    boxShadow: shadow || "0 2px 18px rgba(124,77,255,0.09)",
    marginBottom:14, ...style}}>
    {children}
  </div>
);
const Btn = ({children,onClick,color,textColor,style,small,icon,disabled,loading}) => (
  <button onClick={onClick} disabled={!!disabled||!!loading} style={{
    background:disabled||loading?"#e0e0e0":(color||C.purple),
    color:disabled||loading?"#aaa":(textColor||"#fff"),
    border:"none",borderRadius:50,
    padding:small?"10px 22px":"15px 34px",
    fontSize:small?14:16,fontWeight:700,fontFamily:F.b,
    cursor:disabled||loading?"not-allowed":"pointer",
    boxShadow:disabled||loading?"none":`0 4px 14px ${color||C.purple}44`,
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
const Label = ({children, color}) => (
  <p style={{fontFamily:F.b,fontWeight:700,fontSize:12,color:color||"#9B8DB5",
    letterSpacing:1.3,textTransform:"uppercase",marginBottom:10}}>{children}</p>
);
const TextInput = ({value,onChange,placeholder,type="text",style}) => (
  <input value={value} onChange={onChange} placeholder={placeholder} type={type}
    style={{width:"100%",padding:"13px 18px",borderRadius:50,
      border:"2px solid #EEE9FF",fontSize:16,fontFamily:F.b,
      fontWeight:500,color:"#2D2040",background:"#fff",...style}}
    onFocus={e=>e.target.style.border="2px solid #7C4DFF"}
    onBlur={e=>e.target.style.border="2px solid #EEE9FF"}
  />
);
const Shell = ({children, stageBg, dark}) => (
  <div style={{minHeight:"100vh",background:stageBg||(dark?'#0F0A1E':LIGHT.bg),fontFamily:F.b,
    display:"flex",flexDirection:"column",alignItems:"center",
    padding:"0 0 92px",position:"relative",overflowX:"hidden",
    transition:"background 1.5s ease"}}>
    <FontLoader dark={dark}/>
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

/* ── Tooltip component ── */
const Tooltip = ({ text, seen, onDismiss, C }) => {
  if (seen) return null;
  const bg = C && C.card ? C.card : "#fff";
  const purple = C && C.purple ? C.purple : "#7C4DFF";
  const textColor = C && C.text ? C.text : "#2D2040";
  return (
    <div style={{
      background: bg,
      border: `2px solid ${purple}`,
      borderRadius: 16, padding: "12px 16px",
      marginBottom: 12, position: "relative",
      animation: "tooltipIn 0.35s ease forwards",
      boxShadow: `0 4px 20px ${purple}33`,
    }}>
      <div style={{display:"flex",justifyContent:"space-between",alignItems:"flex-start",gap:12}}>
        <p style={{fontFamily:F.b,fontWeight:600,fontSize:14,
          color:textColor,margin:0,lineHeight:1.6}}>{text}</p>
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

/* ── Settings panel ── */
const SettingsPanel = ({ darkMode, setDarkMode, soundOn, setSoundOn, onClose, C }) => (
  <div style={{
    position:"fixed",top:0,left:0,right:0,bottom:0,
    background:"rgba(0,0,0,0.5)",zIndex:800,
    display:"flex",alignItems:"flex-end",justifyContent:"center",
    backdropFilter:"blur(4px)",
  }} onClick={onClose}>
    <div onClick={e=>e.stopPropagation()} style={{
      background:darkMode?"#261840":"#fff",
      borderRadius:"24px 24px 0 0",padding:"28px 24px 48px",
      width:"100%",maxWidth:430,
      animation:"slideInUp 0.3s ease",
      boxShadow:"0 -8px 40px rgba(0,0,0,0.2)",
    }}>
      <div style={{width:40,height:4,borderRadius:50,
        background:darkMode?"#4a3a6a":"#ddd",
        margin:"0 auto 24px"}}/>
      <h3 style={{fontFamily:F.h,fontWeight:900,fontSize:24,
        color:darkMode?"#EEE9FF":"#2D2040",marginBottom:24}}>
        Settings
      </h3>

      {/* Dark mode toggle */}
      <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",
        padding:"16px 0",borderBottom:`1px solid ${darkMode?"#2d2050":"#F0EAFF"}`}}>
        <div>
          <p style={{fontFamily:F.b,fontWeight:700,fontSize:16,
            color:darkMode?"#EEE9FF":"#2D2040",margin:0}}>Dark Mode</p>
          <p style={{fontFamily:F.b,fontWeight:500,fontSize:13,
            color:darkMode?"#9B8DB5":"#9B8DB5",margin:0}}>
            Easier on the eyes at night
          </p>
        </div>
        <button onClick={()=>setDarkMode(d=>!d)} style={{
          width:52,height:30,borderRadius:50,border:"none",cursor:"pointer",
          background:darkMode?"#7C4DFF":"#ddd",
          position:"relative",transition:"background 0.3s",
          flexShrink:0,
        }}>
          <div style={{
            position:"absolute",top:3,
            left:darkMode?24:3,
            width:24,height:24,borderRadius:"50%",
            background:"#fff",transition:"left 0.3s",
            boxShadow:"0 2px 6px rgba(0,0,0,0.2)",
          }}/>
        </button>
      </div>

      {/* Sound toggle */}
      <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",
        padding:"16px 0",borderBottom:`1px solid ${darkMode?"#2d2050":"#F0EAFF"}`}}>
        <div>
          <p style={{fontFamily:F.b,fontWeight:700,fontSize:16,
            color:darkMode?"#EEE9FF":"#2D2040",margin:0}}>Sound Effects</p>
          <p style={{fontFamily:F.b,fontWeight:500,fontSize:13,
            color:"#9B8DB5",margin:0}}>Soft chimes and whooshes</p>
        </div>
        <button onClick={()=>setSoundOn(s=>!s)} style={{
          width:52,height:30,borderRadius:50,border:"none",cursor:"pointer",
          background:soundOn?"#7C4DFF":"#ddd",
          position:"relative",transition:"background 0.3s",flexShrink:0,
        }}>
          <div style={{
            position:"absolute",top:3,
            left:soundOn?24:3,
            width:24,height:24,borderRadius:"50%",
            background:"#fff",transition:"left 0.3s",
            boxShadow:"0 2px 6px rgba(0,0,0,0.2)",
          }}/>
        </button>
      </div>

      <button onClick={onClose} style={{
        width:"100%",marginTop:24,
        background:"linear-gradient(135deg,#7C4DFF,#F06292)",
        border:"none",borderRadius:50,padding:"15px",
        color:"#fff",fontSize:16,fontWeight:700,fontFamily:F.b,
        cursor:"pointer",boxShadow:"0 4px 16px rgba(124,77,255,0.4)",
      }}>
        Done
      </button>
    </div>
  </div>
);

/* ══════════════════════════════════════════════
   MAIN APP
══════════════════════════════════════════════ */
export default function BloomyApp() {
  const [session,setSession]                 = useState(null);
  const [loading,setLoading]                 = useState(true);
  const [screen,setScreen]                   = useState("landing");
  const [email,setEmail]                     = useState("");
  const [password,setPassword]               = useState("");
  const [name,setName]                       = useState("");
  const [authError,setAuthError]             = useState("");
  const [authLoading,setAuthLoading]         = useState(false);
  const [children,setChildren]               = useState([]);
  const [childrenLoading,setChildrenLoading] = useState(false);
  const [activeChild,setActiveChild]         = useState(null);
  const [moodLog,setMoodLog]                 = useState([]);
  const [journals,setJournals]               = useState([]);
  const [addingChild,setAddingChild]         = useState(false);
  const [newChildName,setNewChildName]       = useState("");
  const [newChildMascot,setNewChildMascot]   = useState(null);
  const [addStep,setAddStep]                 = useState(1);
  const [addLoading,setAddLoading]           = useState(false);
  const [tab,setTab]                         = useState("home");
  const [selectedMood,setSelectedMood]       = useState(null);
  const [moodLogged,setMoodLogged]           = useState(false);
  const [moodNote,setMoodNote]               = useState("");
  const [moodNoteStep,setMoodNoteStep]       = useState("log"); // log | note | done
  const [savingNote,setSavingNote]           = useState(false);
  const [gratitudes,setGratitudes]           = useState([]);
  const [gratitudeText,setGratitudeText]     = useState("");
  const [gratitudeSaved,setGratitudeSaved]   = useState(false);
  const [affirmIdx,setAffirmIdx]             = useState(0);
  const [affirmAnim,setAffirmAnim]           = useState("idle"); // idle | swiping | entering
  const [breathPhase,setBreathPhase]         = useState(0);
  const [breathActive,setBreathActive]       = useState(false);
  const [breathCount,setBreathCount]         = useState(0);
  const [journalText,setJournalText]         = useState("");
  const [journalSaved,setJournalSaved]       = useState(false);
  const [promptIdx,setPromptIdx]             = useState(0);
  const [saveLoading,setSaveLoading]         = useState(false);
  const [showInsights,setShowInsights]       = useState(false);
  const [celebration,setCelebration]         = useState(null);
  const [showMascotRoom,setShowMascotRoom]   = useState(false);
  const [onboardStep,setOnboardStep]         = useState(0);
  const [darkMode,setDarkMode]               = useState(false);
  const [soundOn,setSoundOn]                 = useState(true);
  const [seenTooltips,setSeenTooltips]       = useState({});
  const [showSettings,setShowSettings]       = useState(false);
  const [dailyMissions,setDailyMissions]     = useState([]);
  const [seedPopup,setSeedPopup]             = useState({visible:false,amount:0});
  const [streakShield,setStreakShield]       = useState(false);
  const [showAllAffirm,setShowAllAffirm]    = useState(false);
  const touchStartX                          = useRef(null);
  const touchStartY                          = useRef(null);

  /* ── Seed popup helper ── */
  const showSeedPopup = (amount) => {
    setSeedPopup({visible:true, amount});
    setTimeout(()=>setSeedPopup({visible:false, amount:0}), 1800);
  };

  /* ── Mark a daily mission as done (turns it gold + shows seed bonus popup) ── */
  const completeMission = (id) => {
    setDailyMissions(prev => {
      const updated = prev.map(m => m.id === id ? {...m, done:true} : m);
      const mission = updated.find(m => m.id === id);
      if (mission && !prev.find(m => m.id === id)?.done) {
        // Small delay so it fires after the action's own seed popup clears
        setTimeout(() => showSeedPopup(mission.seeds), 2000);
      }
      return updated;
    });
  };

  /* ── Derive colour palette from dark mode ── */
  const theme = darkMode ? DARK : LIGHT;

  /* ── Auth ── */
  useEffect(()=>{
    supabase.auth.getSession().then(({data:{session}})=>{
      setSession(session); setLoading(false);
      if (session) setScreen("dashboard");
    });
    const {data:{subscription}} = supabase.auth.onAuthStateChange((_,session)=>{
      setSession(session);
      if (session){setScreen("dashboard");loadChildren(session.user.id);}
      else {setScreen("landing");setChildren([]);setActiveChild(null);}
    });
    return ()=>subscription.unsubscribe();
  },[]);

  const loadChildren = async (userId)=>{
    setChildrenLoading(true);
    const {data,error} = await supabase.from("children").select("*")
      .eq("parent_id",userId).order("created_at",{ascending:true});
    if (!error&&data) setChildren(data);
    setChildrenLoading(false);
  };

  useEffect(()=>{if(session)loadChildren(session.user.id);},[session]);

  const loadChildData = async (child)=>{
    const [moodRes,journalRes] = await Promise.all([
      supabase.from("mood_logs").select("*").eq("child_id",child.id).order("created_at",{ascending:true}),
      supabase.from("journal_entries").select("*").eq("child_id",child.id).order("created_at",{ascending:false}),
    ]);
    if (!moodRes.error) setMoodLog(moodRes.data||[]);
    if (!journalRes.error) setJournals(journalRes.data||[]);
  };

  /* ── Breathing ── */
  useEffect(()=>{
    if (!breathActive) return;
    const t = setTimeout(async()=>{
      const next=(breathPhase+1)%BREATHING.length;
      setBreathPhase(next);
      if (next===0){
        setBreathCount(c=>c+1);
        showSeedPopup(2);
        completeMission("breathe");
        if (activeChild){
          const newCount=(activeChild.breath_sessions||0)+1;
          await supabase.from("children").update({breath_sessions:newCount}).eq("id",activeChild.id);
          const updatedChild = {...activeChild,breath_sessions:newCount};
          setActiveChild(updatedChild);
          setChildren(prev=>prev.map(c=>c.id===activeChild.id?updatedChild:c));
          checkGrowthStageUp(moodLog, journals, updatedChild);
        }
      }
    },BREATHING[breathPhase].duration*1000);
    return ()=>clearTimeout(t);
  },[breathActive,breathPhase]);

  /* ── Affirmation card deck animation (fix #5) ── */
  const nextAffirm = async ()=>{
    if (affirmAnim!=="idle") return;
    setAffirmAnim("swiping");
    playSound("whoosh", soundOn);
    setTimeout(()=>{
      setAffirmIdx(i=>(i+1)%AFFIRMATIONS.length);
      setAffirmAnim("entering");
      setTimeout(()=>setAffirmAnim("idle"),400);
    },350);
    if (activeChild){
      const newCount=(activeChild.affirm_count||0)+1;
      await supabase.from("children").update({affirm_count:newCount}).eq("id",activeChild.id);
      const updatedChild = {...activeChild,affirm_count:newCount};
      setActiveChild(updatedChild);
      setChildren(prev=>prev.map(c=>c.id===activeChild.id?updatedChild:c));
      showSeedPopup(1);
      if (newCount % 3 === 0) completeMission("affirm");
      checkGrowthStageUp(moodLog, journals, updatedChild);
    }
  };

  /* ── Auth handlers ── */
  const handleSignup = async ()=>{
    if (!name.trim()||!email.trim()||!password.trim()){setAuthError("Please fill in all fields.");return;}
    if (password.length<6){setAuthError("Password must be at least 6 characters.");return;}
    setAuthLoading(true);setAuthError("");
    const {error} = await supabase.auth.signUp({email:email.trim(),password,
      options:{data:{name:name.trim()}}});
    if (error) setAuthError(error.message);
    setAuthLoading(false);
  };
  const handleLogin = async ()=>{
    if (!email.trim()||!password.trim()){setAuthError("Please fill in all fields.");return;}
    setAuthLoading(true);setAuthError("");
    const {error} = await supabase.auth.signInWithPassword({email:email.trim(),password});
    if (error) setAuthError("Incorrect email or password.");
    setAuthLoading(false);
  };
  const handleLogout = async ()=>{
    await supabase.auth.signOut();
    setBreathActive(false);setActiveChild(null);setMoodLog([]);setJournals([]);
  };

  /* ── Add / delete child ── */
  const handleAddChild = async ()=>{
    if (!newChildName.trim()||!newChildMascot||!session) return;
    setAddLoading(true);
    const {data,error} = await supabase.from("children").insert({
      parent_id:session.user.id, name:newChildName.trim(),
      mascot_id:newChildMascot.id, mascot_name:newChildMascot.name,
      mascot_color:newChildMascot.color, mascot_bg:newChildMascot.bg,
      affirm_count:0, breath_sessions:0,
    }).select().single();
    if (!error&&data){
      setChildren(prev=>[...prev,data]);
      setActiveChild(data);setMoodLog([]);setJournals([]);setTab("home");
    }
    setAddingChild(false);setNewChildName("");setNewChildMascot(null);setAddStep(1);
    setAddLoading(false);
  };
  const handleDeleteChild = async (childId)=>{
    await supabase.from("children").delete().eq("id",childId);
    setChildren(prev=>prev.filter(c=>c.id!==childId));
    if (activeChild?.id===childId){setActiveChild(null);setMoodLog([]);setJournals([]);}
  };

  /* ── App actions ── */
  const logMood = async (mood)=>{
    if (!activeChild) return;
    const {data,error} = await supabase.from("mood_logs")
      .insert({child_id:activeChild.id,mood,date:today()}).select().single();
    if (error) { console.error("logMood error:", error); return; }
    if (data){
      const newLog = [...moodLog, data];
      setMoodLog(newLog);
      setMoodLogged(true);
      setMoodNoteStep("note");
      setMoodNote("");
      playSound("chime", soundOn);
      showSeedPopup(1);
      completeMission("mood");
      checkGrowthStageUp(newLog, journals);
    }
  };

  const saveMoodNote = async ()=>{
    if (!moodNote.trim()) { setMoodNoteStep("done"); return; }
    setSavingNote(true);
    const lastEntry = moodLog[moodLog.length-1];
    if (lastEntry) {
      await supabase.from("mood_logs").update({note:moodNote.trim()}).eq("id",lastEntry.id);
      const updated = moodLog.map((e,i)=>i===moodLog.length-1?{...e,note:moodNote.trim()}:e);
      setMoodLog(updated);
    }
    setSavingNote(false);
    setMoodNoteStep("done");
  };
  const checkGrowthStageUp = (newMoodLog, newJournals, updatedChild) => {
    const child = updatedChild || activeChild;
    if (!child) return;
    const oldScore = calcGrowthScore(activeChild, moodLog, journals);
    const newScore = calcGrowthScore(child, newMoodLog, newJournals);
    const oldStage = getStage(oldScore);
    const newStage = getStage(newScore);
    if (newStage.id > oldStage.id) {
      setCelebration(newStage.id);
      playSound("levelup", soundOn);
    }
  };

  const saveJournal = async ()=>{
    if (!journalText.trim()||!activeChild) return;
    setSaveLoading(true);
    const {data,error} = await supabase.from("journal_entries")
      .insert({child_id:activeChild.id,text:journalText,
        prompt:JOURNAL_PROMPTS[promptIdx],date:today()}).select().single();
    if (!error&&data){
      const newJournals = [data, ...journals];
      setJournals(newJournals);
      setJournalSaved(true);
      playSound("chime", soundOn);
      showSeedPopup(2);
      completeMission("journal");
      checkGrowthStageUp(moodLog, newJournals);
    }
    setSaveLoading(false);
  };
  const saveGratitude = async ()=>{
    if (!gratitudeText.trim()||!activeChild) {
      console.log("saveGratitude blocked:", {hasText:!!gratitudeText.trim(), hasChild:!!activeChild});
      return;
    }
    const {data,error} = await supabase.from("gratitudes")
      .insert({child_id:activeChild.id,text:gratitudeText.trim(),date:today()})
      .select().single();
    if (error) { console.error("Gratitude save error:", error); return; }
    if (data){
      setGratitudes(prev=>[data,...prev]);
      setGratitudeText("");
      setGratitudeSaved(true);
      playSound("chime",soundOn);
      showSeedPopup(1);
      completeMission("gratitude");
      setTimeout(()=>setGratitudeSaved(false),2000);
    }
  };

  const loadGratitudes = async (childId)=>{
    const {data,error} = await supabase.from("gratitudes")
      .select("*").eq("child_id",childId).order("created_at",{ascending:false});
    if (!error&&data) setGratitudes(data);
  };

  const openChild = async (child)=>{
    setActiveChild(child);setTab("home");
    setMoodLogged(false);setJournalSaved(false);setJournalText("");
    setBreathActive(false);setBreathPhase(0);setBreathCount(0);
    setSeenTooltips(child.seen_tooltips || {});
    // Generate daily missions
    const today = new Date().toISOString().split("T")[0];
    const all = [
      {id:"mood",      label:"Log your mood today",          seeds:1, icon:"mood",  done:false},
      {id:"journal",   label:"Write a journal entry",        seeds:2, icon:"book",  done:false},
      {id:"breathe",   label:"Complete a breathing session", seeds:2, icon:"wind",  done:false},
      {id:"affirm",    label:"Read 3 affirmations",          seeds:1, icon:"star",  done:false},
      {id:"gratitude", label:"Add a gratitude",              seeds:1, icon:"heart", done:false},
    ];
    const shuffled = [...all].sort(()=>Math.random()-0.5).slice(0,2);
    setDailyMissions(shuffled);
    // Check streak shield (resets weekly)
    const lastShieldDate = child.last_shield_date || "";
    const weekAgo = new Date(); weekAgo.setDate(weekAgo.getDate()-7);
    setStreakShield(new Date(lastShieldDate) < weekAgo);
    setGratitudes([]);
    await loadChildData(child);
    await loadGratitudes(child.id);
  };

  /* ── Computed ── */
  const growthScore  = activeChild ? calcGrowthScore(activeChild, moodLog, journals, gratitudes) : 0;
  const currentStage = getStage(growthScore);
  const streak = getStreak(moodLog);
  const week   = last7Days();
  const todayEntry = moodLog.slice().reverse().find(e=>e.date===today());
  const lastMood = moodLog.length>0 ? moodLog[moodLog.length-1].mood : null;
  const badges = activeChild
    ? Object.fromEntries(BADGE_DEFS.map(b=>[b.id,b.check(moodLog,journals,
        activeChild.breath_sessions||0,activeChild.affirm_count||0)]))
    : {};
  const cm = activeChild
    ? {id:activeChild.mascot_id,name:activeChild.mascot_name,
       color:activeChild.mascot_color,bg:activeChild.mascot_bg}
    : MASCOTS[0];
  const parentName = session?.user?.user_metadata?.name||session?.user?.email||"there";

  /* ── Loading splash ── */
  if (loading) return (
    <div style={{minHeight:"100vh",
      background:"linear-gradient(148deg,#A78BFA 0%,#F06292 60%,#FFD54F 100%)",
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

  /* ════════════════════════════════════════
     ONBOARDING SLIDES
  ════════════════════════════════════════ */
  const ONBOARD_SLIDES = [
    {
      grad:"linear-gradient(148deg,#A78BFA 0%,#7C4DFF 100%)",
      icon:"flower", iconColor:"#fff",
      tag:"Welcome to Bloomy",
      title:"Where little feelings grow into big strengths.",
      sub:"A safe, joyful space built just for children ages 5 to 11.",
      mascots:["fox","bunny","bear"],
    },
    {
      grad:"linear-gradient(148deg,#F06292 0%,#FF7043 100%)",
      icon:"mood", iconColor:"#fff",
      tag:"Check in every day",
      title:"How are you feeling today?",
      sub:"Children log their mood with friendly faces. Parents see patterns over time to better understand their child.",
      mascots:["owl","cat","dog"],
    },
    {
      grad:"linear-gradient(148deg,#4DB6AC 0%,#4FC3F7 100%)",
      icon:"star", iconColor:"#fff",
      tag:"Grow and shine",
      title:"Affirmations, journaling, breathing and more.",
      sub:"Every tool your child needs to build confidence, calm big emotions, and express themselves freely.",
      mascots:["fox","owl","cat"],
    },
    {
      grad:"linear-gradient(148deg,#FFD54F 0%,#F06292 100%)",
      icon:"shield", iconColor:"#fff",
      tag:"Safe for your family",
      title:"No ads. No tracking. Always free to start.",
      sub:"Bloomy is built with child safety first. Parents stay in control with a private dashboard and PIN protection.",
      mascots:["bunny","bear","dog"],
      isCTA: true,
    },
  ];

  if (screen==="landing") {
    const slide = ONBOARD_SLIDES[onboardStep];
    const isLast = onboardStep === ONBOARD_SLIDES.length - 1;

    /* ── Swipe handlers ── */
    const handleTouchStart = (e) => {
      touchStartX.current = e.touches[0].clientX;
      touchStartY.current = e.touches[0].clientY;
    };

    const handleTouchEnd = (e) => {
      if (touchStartX.current === null) return;
      const dx = e.changedTouches[0].clientX - touchStartX.current;
      const dy = e.changedTouches[0].clientY - touchStartY.current;
      // Only trigger if horizontal swipe is dominant
      if (Math.abs(dx) < 40 || Math.abs(dx) < Math.abs(dy)) return;
      if (dx < 0) {
        // swipe left → next slide
        if (!isLast) setOnboardStep(s => s + 1);
        else setScreen("signup");
      } else {
        // swipe right → previous slide
        if (onboardStep > 0) setOnboardStep(s => s - 1);
      }
      touchStartX.current = null;
    };

    return (
      <div
        onTouchStart={handleTouchStart}
        onTouchEnd={handleTouchEnd}
        style={{minHeight:"100vh",background:slide.grad,fontFamily:F.b,
          display:"flex",flexDirection:"column",position:"relative",overflow:"hidden",
          transition:"background 0.5s ease",userSelect:"none"}}>
        <FontLoader/>

        {/* Decorative blobs */}
        <div style={{position:"absolute",top:-80,right:-80,width:240,height:240,
          borderRadius:"50%",background:"rgba(255,255,255,0.1)",pointerEvents:"none"}}/>
        <div style={{position:"absolute",bottom:-60,left:-60,width:200,height:200,
          borderRadius:"50%",background:"rgba(255,255,255,0.08)",pointerEvents:"none"}}/>

        {/* Skip button */}
        {!isLast && (
          <button onClick={()=>setScreen("signup")} style={{
            position:"absolute",top:24,right:24,
            background:"rgba(255,255,255,0.2)",border:"none",
            color:"#fff",borderRadius:50,padding:"8px 18px",
            fontSize:13,fontWeight:600,fontFamily:F.b,cursor:"pointer",zIndex:10}}>
            Skip
          </button>
        )}

        {/* Sign in link top left */}
        <button onClick={()=>setScreen("login")} style={{
          position:"absolute",top:24,left:24,
          background:"none",border:"none",
          color:"rgba(255,255,255,0.7)",
          fontSize:13,fontWeight:600,fontFamily:F.b,cursor:"pointer",zIndex:10}}>
          Sign in
        </button>

        {/* Main content */}
        <div style={{flex:1,display:"flex",flexDirection:"column",alignItems:"center",
          justifyContent:"center",padding:"80px 32px 40px",textAlign:"center",
          animation:"fadeIn 0.5s ease"}}>

          {/* Mascot row */}
          <div style={{display:"flex",gap:12,justifyContent:"center",marginBottom:28}}>
            {slide.mascots.map((m,i)=>(
              <div key={m+i} style={{
                background:"rgba(255,255,255,0.2)",borderRadius:20,padding:10,
                animation:`floatUp ${2+i*0.4}s ease-in-out infinite`,
                animationDelay:`${i*0.3}s`}}>
                <MascotFace id={m} size={56}/>
              </div>
            ))}
          </div>

          {/* Tag */}
          <div style={{background:"rgba(255,255,255,0.2)",borderRadius:50,
            padding:"6px 18px",marginBottom:18,display:"inline-block"}}>
            <p style={{color:"#fff",fontSize:12,fontWeight:700,
              letterSpacing:1.2,textTransform:"uppercase",margin:0}}>
              {slide.tag}
            </p>
          </div>

          {/* Title */}
          <h1 style={{fontFamily:F.h,fontSize:32,fontWeight:900,color:"#fff",
            marginBottom:16,lineHeight:1.25,textShadow:"0 2px 12px rgba(0,0,0,0.15)"}}>
            {slide.title}
          </h1>

          {/* Subtitle */}
          <p style={{fontSize:16,color:"rgba(255,255,255,0.88)",
            fontWeight:500,lineHeight:1.7,maxWidth:320,margin:"0 auto"}}>
            {slide.sub}
          </p>

          {/* Swipe hint on first slide */}
          {onboardStep===0 && (
            <p style={{color:"rgba(255,255,255,0.5)",fontSize:12,
              fontWeight:500,marginTop:24}}>
              Swipe to explore
            </p>
          )}
        </div>

        {/* Bottom controls */}
        <div style={{padding:"0 32px 52px",display:"flex",
          flexDirection:"column",alignItems:"center",gap:16}}>

          {/* Dot indicators */}
          <div style={{display:"flex",gap:8,justifyContent:"center"}}>
            {ONBOARD_SLIDES.map((_,i)=>(
              <div key={i} onClick={()=>setOnboardStep(i)} style={{
                width:i===onboardStep?24:8,height:8,borderRadius:50,
                background:i===onboardStep?"#fff":"rgba(255,255,255,0.4)",
                transition:"all 0.3s",cursor:"pointer"}}/>
            ))}
          </div>

          {/* CTA button */}
          {isLast ? (
            <div style={{width:"100%",maxWidth:340,display:"flex",flexDirection:"column",gap:10}}>
              <Btn onClick={()=>setScreen("signup")} color="#fff" textColor={theme.purple}
                style={{fontSize:18,padding:"17px 0",width:"100%",justifyContent:"center"}}>
                Create Free Account
              </Btn>
              <button onClick={()=>setScreen("login")} style={{
                background:"rgba(255,255,255,0.18)",border:"2px solid rgba(255,255,255,0.5)",
                color:"#fff",borderRadius:50,padding:"13px 0",fontSize:15,
                fontWeight:600,fontFamily:F.b,cursor:"pointer",width:"100%"}}>
                I already have an account
              </button>
              <p style={{color:"rgba(255,255,255,0.6)",fontSize:12,
                fontWeight:500,textAlign:"center",margin:0}}>
                Free forever. No credit card needed.
              </p>
            </div>
          ) : (
            <div style={{width:"100%",maxWidth:340}}>
              <Btn onClick={()=>setOnboardStep(s=>s+1)} color="#fff" textColor={theme.purple}
                style={{fontSize:17,padding:"16px 0",width:"100%",justifyContent:"center"}}
                icon="next">
                Next
              </Btn>
            </div>
          )}
        </div>
      </div>
    );
  }

  /* ════════════════════════════
     SIGN UP
  ════════════════════════════ */
  if (screen==="signup") return (
    <Shell>
      <div style={{paddingTop:52}}>
        <button onClick={()=>setScreen("landing")} style={{background:"none",border:"none",
          cursor:"pointer",display:"flex",alignItems:"center",gap:6,marginBottom:24,
          color:theme.muted,fontFamily:F.b,fontWeight:600,fontSize:15}}>
          <Icon name="back" size={20} color={theme.muted}/> Back
        </button>
        <Icon name="flower" size={48} color={theme.purple} style={{marginBottom:16}}/>
        <h2 style={{fontFamily:F.h,fontSize:32,fontWeight:800,color:theme.text,marginBottom:4}}>
          Create your account
        </h2>
        <p style={{color:theme.muted,fontSize:15,marginBottom:28,fontWeight:500}}>
          Free forever. No credit card needed.
        </p>
        <div style={{display:"flex",flexDirection:"column",gap:12,marginBottom:20}}>
          <TextInput value={name} onChange={e=>setName(e.target.value)} placeholder="Your name"/>
          <TextInput value={email} onChange={e=>setEmail(e.target.value)} placeholder="Email address" type="email"/>
          <TextInput value={password} onChange={e=>setPassword(e.target.value)} placeholder="Password (min 6 characters)" type="password"/>
        </div>
        {authError&&<p style={{color:"#E53935",fontSize:14,marginBottom:12,fontWeight:500}}>{authError}</p>}
        <Btn onClick={handleSignup} style={{width:"100%"}} icon="next" loading={authLoading}>
          Create Account
        </Btn>
        <p style={{textAlign:"center",marginTop:20,color:theme.muted,fontSize:14,fontWeight:500}}>
          Already have an account?{" "}
          <span onClick={()=>{setScreen("login");setAuthError("");}}
            style={{color:theme.purple,cursor:"pointer",fontWeight:700}}>Sign in</span>
        </p>
      </div>
    </Shell>
  );

  /* ════════════════════════════
     LOGIN
  ════════════════════════════ */
  if (screen==="login") return (
    <Shell>
      <div style={{paddingTop:52}}>
        <button onClick={()=>setScreen("landing")} style={{background:"none",border:"none",
          cursor:"pointer",display:"flex",alignItems:"center",gap:6,marginBottom:24,
          color:theme.muted,fontFamily:F.b,fontWeight:600,fontSize:15}}>
          <Icon name="back" size={20} color={theme.muted}/> Back
        </button>
        <Icon name="heart" size={48} color={theme.pink} style={{marginBottom:16}}/>
        <h2 style={{fontFamily:F.h,fontSize:32,fontWeight:800,color:theme.text,marginBottom:4}}>
          Welcome back
        </h2>
        <p style={{color:theme.muted,fontSize:15,marginBottom:28,fontWeight:500}}>
          Sign in to your Bloomy account.
        </p>
        <div style={{display:"flex",flexDirection:"column",gap:12,marginBottom:20}}>
          <TextInput value={email} onChange={e=>setEmail(e.target.value)} placeholder="Email address" type="email"/>
          <TextInput value={password} onChange={e=>setPassword(e.target.value)} placeholder="Password" type="password"/>
        </div>
        {authError&&<p style={{color:"#E53935",fontSize:14,marginBottom:12,fontWeight:500}}>{authError}</p>}
        <Btn onClick={handleLogin} style={{width:"100%"}} icon="next" loading={authLoading}>Sign In</Btn>
        <p style={{textAlign:"center",marginTop:20,color:theme.muted,fontSize:14,fontWeight:500}}>
          No account yet?{" "}
          <span onClick={()=>{setScreen("signup");setAuthError("");}}
            style={{color:theme.purple,cursor:"pointer",fontWeight:700}}>Sign up free</span>
        </p>
      </div>
    </Shell>
  );

  /* Show parent insights overlay */
  if (showInsights) return (
    <ParentInsights
      session={session}
      children={children}
      onClose={()=>setShowInsights(false)}
    />
  );

  /* ════════════════════════════
     PARENT DASHBOARD
  ════════════════════════════ */
  if (!activeChild) return (
    <Shell>
      <div style={{paddingTop:36}}>
        <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:28}}>
          <div>
            <p style={{color:theme.muted,fontWeight:600,fontSize:13,marginBottom:2}}>Welcome back</p>
            <h2 style={{fontFamily:F.h,fontSize:28,fontWeight:900,color:theme.text}}>{parentName}</h2>
          </div>
          <button onClick={handleLogout} style={{background:"none",border:`1.5px solid ${theme.border}`,
            borderRadius:50,padding:"8px 14px",cursor:"pointer",
            display:"flex",alignItems:"center",gap:6,
            color:theme.muted,fontFamily:F.b,fontWeight:600,fontSize:13}}>
            <Icon name="logout" size={16} color={theme.muted}/> Sign out
          </button>
        </div>

        <Card style={{background:`linear-gradient(135deg,${theme.purple},${theme.pink})`,padding:"22px"}}>
          <p style={{color:"rgba(255,255,255,0.8)",fontSize:12,fontWeight:700,
            letterSpacing:1,textTransform:"uppercase",marginBottom:6}}>Children's Profiles</p>
          <p style={{color:"#fff",fontSize:17,fontWeight:600,lineHeight:1.5,margin:0}}>
            {childrenLoading?"Loading...":children.length===0
              ?"Add your first child profile to get started."
              :`You have ${children.length} child profile${children.length>1?"s":""}.`}
          </p>
        </Card>

        {children.map(child=>{
          const m=MASCOTS.find(x=>x.id===child.mascot_id)||MASCOTS[0];
          return (
            <Card key={child.id} style={{padding:"18px 20px"}}>
              <div style={{display:"flex",alignItems:"center",gap:14,marginBottom:14}}>
                <div style={{background:m.bg,borderRadius:14,padding:8,flexShrink:0}}>
                  <MascotFace id={m.id} size={44}/>
                </div>
                <div style={{flex:1}}>
                  <h3 style={{fontFamily:F.h,fontSize:20,fontWeight:800,color:theme.text,marginBottom:2}}>
                    {child.name}
                  </h3>
                  <p style={{color:theme.muted,fontSize:13,fontWeight:500,margin:0}}>
                    {child.mascot_name} · joined {child.created_at?.split("T")[0]}
                  </p>
                </div>
              </div>
              <div style={{display:"flex",gap:8}}>
                <Btn small style={{flex:1}} onClick={()=>openChild(child)}>Open Profile</Btn>
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
            color="#EEE9FF" textColor={theme.purple} style={{width:"100%",marginTop:4}}>
            Add Child Profile
          </Btn>
        ) : (
          <Card style={{border:`2px solid ${theme.purple}22`}}>
            {addStep===1&&(
              <>
                <h3 style={{fontFamily:F.h,fontSize:20,fontWeight:800,color:theme.text,marginBottom:8}}>
                  What's your child's name?
                </h3>
                <TextInput value={newChildName} onChange={e=>setNewChildName(e.target.value)}
                  placeholder="Child's name" style={{marginBottom:16}}/>
                <div style={{display:"flex",gap:8}}>
                  <Btn small onClick={()=>{if(newChildName.trim())setAddStep(2);}}>Next</Btn>
                  <Btn small color="#f5f5f5" textColor={theme.muted}
                    onClick={()=>{setAddingChild(false);setNewChildName("");}}>Cancel</Btn>
                </div>
              </>
            )}
            {addStep===2&&(
              <>
                <h3 style={{fontFamily:F.h,fontSize:20,fontWeight:800,color:theme.text,marginBottom:8}}>
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
                  <Btn small color="#f5f5f5" textColor={theme.muted} onClick={()=>setAddStep(1)}>Back</Btn>
                </div>
              </>
            )}
          </Card>
        )}

        {/* Parent Insights button */}
        <button onClick={()=>setShowInsights(true)} style={{
          width:"100%",background:"#fff",border:`1.5px solid ${theme.border}`,
          borderRadius:20,padding:"18px 20px",cursor:"pointer",marginTop:8,
          display:"flex",alignItems:"center",gap:14,
          boxShadow:"0 2px 18px rgba(124,77,255,0.07)",
          transition:"transform 0.15s"}}
          onMouseDown={e=>e.currentTarget.style.transform="scale(0.98)"}
          onMouseUp={e=>e.currentTarget.style.transform="scale(1)"}>
          <div style={{background:"#EDE7F6",borderRadius:14,padding:10,flexShrink:0}}>
            <Icon name="lock" size={24} color={theme.purple}/>
          </div>
          <div style={{flex:1,textAlign:"left"}}>
            <p style={{fontFamily:F.h,fontWeight:800,fontSize:17,color:theme.text,margin:0}}>
              Parent Insights
            </p>
            <p style={{color:theme.muted,fontSize:13,fontWeight:500,margin:0}}>
              View activity, mood history and journals
            </p>
          </div>
          <Icon name="back" size={20} color={theme.muted} style={{transform:"rotate(180deg)"}}/>
        </button>
      </div>
    </Shell>
  );

  /* ════════════════════════════
     CHILD APP
  ════════════════════════════ */
  const NavBar = ()=>(
    <div style={{position:"fixed",bottom:0,left:0,right:0,
      background:darkMode?"#1e1438":"#fff",
      borderTop:`1.5px solid ${theme.border}`,display:"flex",justifyContent:"space-around",
      alignItems:"center",padding:"10px 0 20px",zIndex:100,
      boxShadow:darkMode?"0 -4px 20px rgba(0,0,0,0.3)":"0 -4px 20px rgba(124,77,255,0.07)"}}>
      {[
        {id:"home",      icon:"home",  label:"Home"},
        {id:"mood",      icon:"mood",  label:"Mood"},
        {id:"affirm",    icon:"star",  label:"Affirm"},
        {id:"breathe",   icon:"wind",  label:"Breathe"},
        {id:"gratitude", icon:"heart", label:"Grateful"},
      ].map(t=>(
        <button key={t.id} onClick={()=>setTab(t.id)} style={{
          background:"none",border:"none",cursor:"pointer",
          display:"flex",flexDirection:"column",alignItems:"center",gap:3,
          opacity:tab===t.id?1:0.35,
          transform:tab===t.id?"scale(1.12)":"scale(1)",
          transition:"all 0.18s"}}>
          <Icon name={t.icon} size={24} color={tab===t.id?theme.purple:theme.muted}/>
          <span style={{fontSize:11,fontWeight:700,fontFamily:F.b,
            color:tab===t.id?theme.purple:theme.muted}}>{t.label}</span>
        </button>
      ))}
      <button onClick={()=>setShowSettings(true)} style={{
        background:"none",border:"none",cursor:"pointer",
        display:"flex",flexDirection:"column",alignItems:"center",gap:3,
        opacity:0.35,transition:"all 0.18s"}}
        onMouseEnter={e=>e.currentTarget.style.opacity="0.7"}
        onMouseLeave={e=>e.currentTarget.style.opacity="0.35"}>
        <Icon name="settings" size={24} color={theme.muted}/>
        <span style={{fontSize:11,fontWeight:700,fontFamily:F.b,color:theme.muted}}>Settings</span>
      </button>
    </div>
  );

  if (showMascotRoom) return (
    <MascotRoom
      activeChild={activeChild}
      moodLog={moodLog}
      journals={journals}
      onClose={()=>setShowMascotRoom(false)}
    />
  );

  const stageBg = STAGE_BGSANIM[currentStage.id] || STAGE_BGSANIM[0];
  return (
    <Shell stageBg={darkMode ? undefined : stageBg} dark={darkMode}>

      {showSettings && (
        <SettingsPanel
          darkMode={darkMode} setDarkMode={setDarkMode}
          soundOn={soundOn} setSoundOn={setSoundOn}
          onClose={()=>setShowSettings(false)} C={theme}
        />
      )}
      <SeedPopup visible={seedPopup.visible} amount={seedPopup.amount}/>
      <NavBar/>
      {celebration !== null && (
        <GrowthCelebration
          mascotId={cm.id}
          newStage={celebration}
          childName={activeChild.name}
          onDismiss={()=>setCelebration(null)}
        />
      )}
      <div style={{paddingTop:18,display:"flex",justifyContent:"space-between",
        alignItems:"center",marginBottom:4}}>
        {tab!=="home" ? (
          /* Sub-tabs: back arrow returns to child home only */
          <button onClick={()=>setTab("home")} style={{
            background:"none",border:"none",cursor:"pointer",
            display:"flex",alignItems:"center",gap:5,
            color:theme.muted,fontFamily:F.b,fontWeight:600,fontSize:13}}>
            <Icon name="back" size={18} color={theme.muted}/> Home
          </button>
        ) : (
          /* Child home: back arrow goes to parent profiles */
          <button onClick={()=>{setActiveChild(null);setBreathActive(false);}} style={{
            background:"none",border:"none",cursor:"pointer",
            display:"flex",alignItems:"center",gap:5,
            color:theme.muted,fontFamily:F.b,fontWeight:600,fontSize:13}}>
            <Icon name="back" size={18} color={theme.muted}/> Profiles
          </button>
        )}
        <span style={{fontSize:13,fontWeight:700,color:theme.muted,fontFamily:F.b}}>
          {activeChild.name}
        </span>
        <div style={{width:64}}/>
      </div>

      {/* ── HOME ── */}
      {tab==="home"&&(
        <div style={{paddingTop:12,animation:"fadeIn 0.4s ease"}}>

          {/* Hero — garden scene */}
          <div style={{textAlign:"center",marginBottom:16}}>
            <p style={{color:theme.muted,fontWeight:600,fontSize:13,marginBottom:2}}>
              Good morning
            </p>
            <h2 style={{fontFamily:F.h,fontSize:30,fontWeight:900,
              color:theme.text,marginBottom:12}}>{activeChild.name}</h2>
            <button onClick={()=>setShowMascotRoom(true)} style={{
              border:"none",background:"none",cursor:"pointer",
              transition:"transform 0.15s",display:"block",margin:"0 auto",
            }}
              onMouseDown={e=>e.currentTarget.style.transform="scale(0.97)"}
              onMouseUp={e=>e.currentTarget.style.transform="scale(1)"}>
              <GardenScene stage={currentStage.id} mascotId={cm.id} size={320} dark={darkMode}/>
              <div style={{display:"inline-flex",alignItems:"center",gap:6,
                background:currentStage.color,borderRadius:50,padding:"5px 16px",marginTop:8}}>
                <span style={{fontSize:14}}>🌱</span>
                <p style={{fontFamily:F.b,fontWeight:700,fontSize:12,
                  color:"#fff",margin:0}}>
                  {currentStage.name} · {growthScore} seeds · Tap to visit
                </p>
              </div>
            </button>
          </div>

          {/* Daily missions */}
          {dailyMissions.length>0&&(
            <div style={{background:theme.card,borderRadius:20,padding:"16px 18px",
              marginBottom:14,boxShadow:"0 2px 18px rgba(124,77,255,0.09)"}}>
              <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:12}}>
                <p style={{fontFamily:F.h,fontWeight:800,fontSize:16,color:theme.text,margin:0}}>
                  Today's Missions
                </p>
                <div style={{background:"#E8F5E9",borderRadius:50,padding:"3px 10px"}}>
                  <p style={{fontFamily:F.b,fontWeight:700,fontSize:11,color:"#43A047",margin:0}}>
                    +3 seeds if completed
                  </p>
                </div>
              </div>
              {dailyMissions.map((m,i)=>(
                <button key={m.id} onClick={()=>!m.done && setTab(m.id)} style={{
                  display:"flex",alignItems:"center",gap:12,
                  padding:"10px 12px",
                  borderBottom:i<dailyMissions.length-1?`1px solid ${m.done?"#F9A82555":theme.border}`:"none",
                  background:m.done?"linear-gradient(135deg,#F9A825,#FFB300)":theme.bg,
                  border:"none",width:"100%",textAlign:"left",cursor:m.done?"default":"pointer",
                  borderRadius:12,marginBottom:i<dailyMissions.length-1?2:0,
                  transition:"all 0.4s ease",
                  boxShadow:m.done?"0 2px 12px rgba(249,168,37,0.35)":"none"}}
                  onMouseEnter={e=>{if(!m.done)e.currentTarget.style.background=theme.border;}}
                  onMouseLeave={e=>e.currentTarget.style.background=m.done?"linear-gradient(135deg,#F9A825,#FFB300)":theme.bg}>
                  <div style={{width:22,height:22,borderRadius:"50%",flexShrink:0,
                    background:m.done?"rgba(255,255,255,0.3)":"#f0f0f0",
                    border:`2px solid ${m.done?"rgba(255,255,255,0.6)":theme.border}`,
                    display:"flex",alignItems:"center",justifyContent:"center"}}>
                    {m.done&&<svg viewBox="0 0 24 24" width={14} height={14} fill="none"
                      stroke="#fff" strokeWidth="2.5" strokeLinecap="round">
                      <path d="M20 6L9 17l-5-5"/>
                    </svg>}
                  </div>
                  <p style={{fontFamily:F.b,fontWeight:m.done?700:600,fontSize:14,
                    color:m.done?"#fff":theme.text,margin:0,flex:1}}>
                    {m.label}
                  </p>
                  <div style={{
                    background:m.done?"rgba(255,255,255,0.25)":"#E8F5E9",
                    borderRadius:50,padding:"2px 8px",
                    display:"flex",alignItems:"center",gap:3}}>
                    <span style={{fontSize:10}}>🌱</span>
                    <p style={{fontFamily:F.b,fontWeight:700,fontSize:11,
                      color:m.done?"#fff":"#43A047",margin:0}}>+{m.seeds}</p>
                  </div>
                  {!m.done&&<Icon name="next" size={14} color={theme.muted}/>}
                  {m.done&&<span style={{fontSize:14}}>⭐</span>}
                </button>
              ))}
            </div>
          )}

          {/* Growth progress bar */}
          <GrowthProgressBar score={growthScore}/>

          {/* Mood — hero action */}
          <button onClick={()=>setTab("mood")} style={{
            width:"100%",display:"flex",alignItems:"center",gap:14,
            padding:"18px 20px",borderRadius:20,marginBottom:14,
            border:todayEntry?"none":`2px dashed ${theme.purple}`,
            background:todayEntry?MOOD_BG[todayEntry.mood]:theme.card,
            boxShadow:todayEntry?"0 2px 18px rgba(124,77,255,0.09)":"none",
            cursor:"pointer",textAlign:"left",transition:"transform 0.15s",
          }}
            onMouseDown={e=>e.currentTarget.style.transform="scale(0.98)"}
            onMouseUp={e=>e.currentTarget.style.transform="scale(1)"}
            onMouseLeave={e=>e.currentTarget.style.transform="scale(1)"}>
            {todayEntry?(
              <>
                <MoodFace type={todayEntry.mood} size={48}/>
                <div style={{flex:1}}>
                  <p style={{fontFamily:F.h,fontWeight:800,fontSize:17,
                    color:MOOD_COLORS[todayEntry.mood],margin:0}}>
                    Feeling {todayEntry.mood} today
                  </p>
                  <p style={{color:theme.muted,fontSize:13,fontWeight:500,margin:0}}>
                    Tap to update your mood
                  </p>
                </div>
                <Icon name="next" size={18} color={MOOD_COLORS[todayEntry.mood]}/>
              </>
            ):(
              <>
                <div style={{background:theme.purple+"22",borderRadius:"50%",
                  padding:12,flexShrink:0}}>
                  <Icon name="mood" size={32} color={theme.purple}/>
                </div>
                <div style={{flex:1}}>
                  <p style={{fontFamily:F.h,fontWeight:800,fontSize:17,
                    color:theme.text,margin:0}}>
                    How are you feeling?
                  </p>
                  <p style={{color:theme.purple,fontSize:13,fontWeight:600,margin:0}}>
                    Tap to log today's mood
                  </p>
                </div>
                <Icon name="next" size={18} color={theme.purple}/>
              </>
            )}
          </button>

          {/* Affirmation of the day */}
          <div style={{background:`linear-gradient(135deg,${cm.color},${theme.pink})`,
            borderRadius:20,padding:"18px 20px",marginBottom:14,cursor:"pointer"}}
            onClick={()=>setTab("affirm")}>
            <p style={{color:"rgba(255,255,255,0.75)",fontSize:11,fontWeight:700,
              letterSpacing:1,textTransform:"uppercase",margin:"0 0 6px"}}>
              {cm.name}'s affirmation for you
            </p>
            <p style={{color:"#fff",fontSize:17,fontWeight:700,fontFamily:F.h,
              lineHeight:1.4,margin:"0 0 10px"}}>
              "{getSortedAffirmations(lastMood)[affirmIdx % 30].text}"
            </p>
            <p style={{color:"rgba(255,255,255,0.65)",fontSize:12,
              fontWeight:600,margin:0}}>Tap to see more →</p>
          </div>

          {/* Quick actions — 3 clean tiles */}
          <div style={{display:"grid",gridTemplateColumns:"1fr 1fr 1fr",gap:10,marginBottom:14}}>
            {[
              {label:"Breathe",   icon:"wind",   color:theme.sky,  bg:"#E1F5FE", action:()=>setTab("breathe")},
              {label:"Journal",   icon:"book",   color:theme.pink, bg:"#FCE4EC", action:()=>setTab("journal")},
              {label:"Grateful",  icon:"heart",  color:"#43A047",  bg:"#E8F5E9", action:()=>setTab("gratitude")},
            ].map(item=>(
              <button key={item.label} onClick={item.action} style={{
                background:item.bg,border:`1.5px solid ${item.color}22`,
                borderRadius:18,padding:"16px 10px",cursor:"pointer",textAlign:"center",
                transition:"transform 0.15s"}}
                onMouseDown={e=>e.currentTarget.style.transform="scale(0.95)"}
                onMouseUp={e=>e.currentTarget.style.transform="scale(1)"}>
                <Icon name={item.icon} size={26} color={item.color}
                  style={{margin:"0 auto 8px"}}/>
                <div style={{fontSize:13,fontWeight:700,color:item.color,
                  fontFamily:F.b}}>{item.label}</div>
              </button>
            ))}
          </div>

          {/* Streak + shield */}
          {streak>0&&(
            <div style={{background:"linear-gradient(135deg,#FFD54F,#FF7043)",
              borderRadius:20,display:"flex",alignItems:"center",gap:14,
              padding:"16px 20px",marginBottom:14}}>
              <Icon name="fire" size={32} color="#fff"/>
              <div style={{flex:1}}>
                <p style={{color:"#fff",fontFamily:F.h,fontWeight:800,fontSize:19,margin:0}}>
                  {streak}-Day Streak!
                </p>
                <p style={{color:"rgba(255,255,255,0.85)",fontSize:13,
                  fontWeight:500,margin:0}}>Keep it up — you are doing great!</p>
              </div>
              {streakShield&&(
                <div style={{background:"rgba(255,255,255,0.25)",borderRadius:50,
                  padding:"6px 12px",display:"flex",alignItems:"center",gap:4}}>
                  <svg viewBox="0 0 24 24" width={16} height={16} fill="none"
                    stroke="#fff" strokeWidth="2" strokeLinecap="round">
                    <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/>
                  </svg>
                  <p style={{fontFamily:F.b,fontWeight:700,fontSize:11,
                    color:"#fff",margin:0}}>Shield</p>
                </div>
              )}
            </div>
          )}
        </div>
      )}

      {/* ── MOOD ── */}
      {tab==="mood"&&(
        <div style={{paddingTop:12,animation:"fadeIn 0.4s ease"}}>
          <h2 style={{fontFamily:F.h,fontSize:28,fontWeight:800,color:theme.text,marginBottom:4}}>
            How are you feeling?
          </h2>
          <p style={{color:theme.muted,fontSize:15,marginBottom:12,fontWeight:500}}>
            Tap the one that feels right.
          </p>
          <Tooltip text="Tap a face that matches how you feel right now. You can log your mood every day!"
            seen={seenTooltips.mood} C={theme}
            onDismiss={async()=>{
              const updated={...seenTooltips,mood:true};
              setSeenTooltips(updated);
              if(activeChild){
                await supabase.from("children").update({seen_tooltips:updated}).eq("id",activeChild.id);
                setActiveChild(prev=>({...prev,seen_tooltips:updated}));
                setChildren(prev=>prev.map(c=>c.id===activeChild.id?{...c,seen_tooltips:updated}:c));
              }
            }}/>
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

          {/* Fix #4 — emotion-specific messages */}
          {selectedMood&&!moodLogged&&(
            <Card style={{background:MOOD_BG[selectedMood],textAlign:"center",animation:"scaleIn 0.3s ease"}}>
              <div style={{display:"flex",justifyContent:"center",marginBottom:12}}>
                <MoodFace type={selectedMood} size={64}/>
              </div>
              <p style={{fontFamily:F.h,fontWeight:800,fontSize:20,
                color:MOOD_COLORS[selectedMood],marginBottom:6}}>
                {MOOD_MESSAGES[selectedMood].title}
              </p>
              <p style={{color:theme.muted,marginBottom:18,fontSize:14,fontWeight:500}}>
                {MOOD_MESSAGES[selectedMood].sub}
              </p>
              <Btn onClick={()=>logMood(selectedMood)} color={MOOD_COLORS[selectedMood]} icon="check">
                Log My Mood
              </Btn>
            </Card>
          )}

          {moodLogged&&moodNoteStep==="note"&&(
            <Card style={{animation:"scaleIn 0.3s ease",background:MOOD_BG[selectedMood]}}>
              <p style={{fontFamily:F.h,fontWeight:800,fontSize:20,
                color:MOOD_COLORS[selectedMood],marginBottom:4}}>
                Want to share why?
              </p>
              <p style={{fontFamily:F.b,fontWeight:500,fontSize:14,
                color:theme.muted,marginBottom:14,lineHeight:1.6}}>
                You can write a little note about how you are feeling.
                Only you and your parent can see this.
              </p>
              <textarea
                value={moodNote}
                onChange={e=>setMoodNote(e.target.value)}
                placeholder="I feel this way because..."
                maxLength={200}
                style={{width:"100%",minHeight:90,border:`2px solid ${MOOD_COLORS[selectedMood]}44`,
                  borderRadius:16,padding:"12px 14px",fontSize:15,fontFamily:F.b,
                  fontWeight:500,color:theme.text,background:"rgba(255,255,255,0.7)",
                  lineHeight:1.7,resize:"none",outline:"none",display:"block",marginBottom:12}}
                onFocus={e=>e.target.style.border=`2px solid ${MOOD_COLORS[selectedMood]}`}
                onBlur={e=>e.target.style.border=`2px solid ${MOOD_COLORS[selectedMood]}44`}
              />
              <div style={{display:"flex",gap:10}}>
                <Btn onClick={saveMoodNote} loading={savingNote}
                  color={MOOD_COLORS[selectedMood]} style={{flex:1}} icon="check">
                  Save Note
                </Btn>
                <Btn onClick={()=>setMoodNoteStep("done")}
                  color="#fff" textColor={theme.muted}
                  style={{flex:1,border:`1.5px solid ${theme.border}`}} small>
                  Skip
                </Btn>
              </div>
            </Card>
          )}

          {moodLogged&&moodNoteStep==="done"&&(
            <Card style={{textAlign:"center",animation:"scaleIn 0.3s ease"}}>
              <div style={{background:"#E0F2F1",borderRadius:"50%",width:68,height:68,
                display:"flex",alignItems:"center",justifyContent:"center",margin:"0 auto 14px"}}>
                <Icon name="check" size={36} color={theme.mint}/>
              </div>
              <p style={{fontFamily:F.h,fontWeight:800,fontSize:22,color:theme.text,marginBottom:4}}>
                Mood logged!
              </p>
              <p style={{color:theme.muted,marginBottom:16,fontSize:14,fontWeight:500}}>
                Great job checking in today.
              </p>
              <Btn onClick={()=>{setMoodLogged(false);setSelectedMood(null);setMoodNoteStep('log');setMoodNote('');}}
                color="#F7F4FF" textColor={theme.purple} small icon="refresh">
                Check in again
              </Btn>
            </Card>
          )}

          <Card>
            <Label>This Week</Label>
            <div style={{display:"flex",justifyContent:"space-between",alignItems:"flex-end"}}>
              {week.map(d=>{
                const entry=moodLog.slice().reverse().find(e=>e.date===d.date);
                return (
                  <div key={d.date} style={{textAlign:"center",display:"flex",
                    flexDirection:"column",alignItems:"center",gap:5}}>
                    {entry
                      ?<MoodFace type={entry.mood} size={30}/>
                      :<div style={{width:30,height:30,borderRadius:"50%",
                          background:"#f0f0f0",border:"1.5px dashed #ddd"}}/>}
                    <span style={{fontSize:11,color:theme.muted,fontWeight:700,fontFamily:F.b}}>{d.label}</span>
                  </div>
                );
              })}
            </div>
          </Card>

          {moodLog.length>0&&(
            <Card>
              <Label>Recent Moods</Label>
              {[...moodLog].reverse().slice(0,5).map((e,i)=>(
                <div key={e.id} style={{
                  padding:"10px 0",borderBottom:i<4?`1px solid ${theme.border}`:"none"}}>
                  <div style={{display:"flex",alignItems:"center",gap:12}}>
                    <MoodFace type={e.mood} size={32}/>
                    <span style={{flex:1,fontWeight:700,color:MOOD_COLORS[e.mood],fontSize:14,fontFamily:F.b}}>
                      {e.mood}
                    </span>
                    <span style={{fontSize:12,color:theme.muted,fontFamily:F.b}}>
                      {e.date===today()?"Today":e.date}
                    </span>
                  </div>
                  {e.note&&(
                    <p style={{fontFamily:F.b,fontSize:13,fontWeight:500,
                      color:theme.muted,margin:"6px 0 0 44px",
                      fontStyle:"italic",lineHeight:1.5}}>
                      "{e.note}"
                    </p>
                  )}
                </div>
              ))}
            </Card>
          )}
        </div>
      )}

      {/* ── AFFIRMATIONS (Fix #5 — card deck animation) ── */}
      {tab==="affirm"&&(
        <div style={{paddingTop:12,animation:"fadeIn 0.4s ease"}}>
          <h2 style={{fontFamily:F.h,fontSize:28,fontWeight:800,color:theme.text,marginBottom:4}}>
            Daily Affirmations
          </h2>
          <p style={{color:theme.muted,fontSize:15,marginBottom:12,fontWeight:500}}>
            Tap the card to flip to the next one.
          </p>
          <Tooltip text="Each card has a positive message just for you. Tap to flip through them and earn points!"
            seen={seenTooltips.affirm} C={theme}
            onDismiss={async()=>{
              const updated={...seenTooltips,affirm:true};
              setSeenTooltips(updated);
              if(activeChild){
                await supabase.from("children").update({seen_tooltips:updated}).eq("id",activeChild.id);
                setActiveChild(prev=>({...prev,seen_tooltips:updated}));
                setChildren(prev=>prev.map(c=>c.id===activeChild.id?{...c,seen_tooltips:updated}:c));
              }
            }}/>

          {/* Card deck stack */}
          <div style={{position:"relative",height:260,marginBottom:20,cursor:"pointer"}}
            onClick={nextAffirm}>
            {/* Background stack cards */}
            <div style={{position:"absolute",top:8,left:"4%",right:"4%",bottom:0,
              background:`${AFFIRMATIONS[(affirmIdx+2)%AFFIRMATIONS.length].color}55`,
              borderRadius:24,transform:"rotate(-2deg)"}}/>
            <div style={{position:"absolute",top:4,left:"2%",right:"2%",bottom:0,
              background:`${AFFIRMATIONS[(affirmIdx+1)%AFFIRMATIONS.length].color}88`,
              borderRadius:24,transform:"rotate(-1deg)"}}/>

            {/* Active card */}
            <div style={{
              position:"absolute",top:0,left:0,right:0,bottom:0,
              background:`linear-gradient(135deg,${getSortedAffirmations(lastMood)[affirmIdx%30].color},${theme.pink})`,
              borderRadius:24,padding:"36px 28px",
              display:"flex",flexDirection:"column",alignItems:"center",justifyContent:"center",
              boxShadow:`0 10px 36px ${AFFIRMATIONS[affirmIdx].color}44`,
              animation: affirmAnim==="swiping"
                ? "swipeLeft 0.35s ease-in forwards"
                : affirmAnim==="entering"
                ? "slideRight 0.4s ease-out forwards"
                : "none",
              textAlign:"center",
            }}>
              <Icon name="star" size={40} color="rgba(255,255,255,0.6)" style={{marginBottom:16}}/>
              <p style={{color:"#fff",fontSize:24,fontWeight:800,fontFamily:F.h,
                lineHeight:1.35,margin:"0 0 16px"}}>
                {getSortedAffirmations(lastMood)[affirmIdx%30].text}
              </p>
              <div style={{display:"flex",alignItems:"center",gap:6,
                color:"rgba(255,255,255,0.65)",fontSize:13,fontWeight:600}}>
                <Icon name="next" size={14} color="rgba(255,255,255,0.65)"/> Tap to flip
              </div>
            </div>
          </div>

          {/* Dot indicators */}
          <div style={{display:"flex",gap:6,justifyContent:"center",marginBottom:20}}>
            {Array.from({length:10},(_,i)=>(
              <div key={i} onClick={()=>setAffirmIdx(i)} style={{
                width:i===(affirmIdx%10)?22:7,height:7,borderRadius:50,
                background:i===(affirmIdx%10)?theme.purple:"#DDD",
                transition:"all 0.3s",cursor:"pointer"}}/>
            ))}
          </div>

          <Card style={{display:"flex",alignItems:"center",gap:14,padding:"16px 20px",
            background:"linear-gradient(135deg,#F7F4FF,#FCE4EC)"}}>
            <div style={{background:"#EDE7F6",borderRadius:50,padding:10,flexShrink:0}}>
              <Icon name="star" size={22} color={theme.purple}/>
            </div>
            <div>
              <p style={{fontFamily:F.h,fontWeight:800,fontSize:16,color:theme.text,margin:0}}>
                {activeChild.affirm_count||0} affirmations read
              </p>
              <p style={{color:theme.muted,fontSize:13,fontWeight:500,margin:0}}>
                {(activeChild.affirm_count||0)>=20
                  ?"Affirmation Pro badge earned!"
                  :`${20-(activeChild.affirm_count||0)} more for the badge`}
              </p>
            </div>
          </Card>

          <Card bg={theme.card} shadow={darkMode?"0 2px 18px rgba(0,0,0,0.3)":undefined}>
            <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:10}}>
              <Label color={theme.muted} style={{margin:0}}>All Affirmations</Label>
              <button onClick={()=>setShowAllAffirm(s=>!s)} style={{
                background:theme.purple+"18",border:"none",borderRadius:50,
                padding:"4px 12px",cursor:"pointer",
                color:theme.purple,fontFamily:F.b,fontWeight:700,fontSize:12}}>
                {showAllAffirm?"Show less":"See all 30"}
              </button>
            </div>
            {getSortedAffirmations(lastMood).slice(0, showAllAffirm?30:5).map((a,i)=>(
              <div key={i} onClick={()=>setAffirmIdx(i)} style={{
                display:"flex",alignItems:"center",gap:14,padding:"11px 0",
                borderBottom:i<(showAllAffirm?29:4)?`1px solid ${theme.border}`:"none",
                cursor:"pointer",opacity:(affirmIdx%30)===i?1:0.5,transition:"opacity 0.2s"}}>
                <div style={{width:8,height:8,borderRadius:"50%",background:a.color,flexShrink:0}}/>
                <span style={{fontWeight:600,color:theme.text,fontSize:15,fontFamily:F.b}}>{a.text}</span>
              </div>
            ))}
            {!showAllAffirm&&(
              <button onClick={()=>setShowAllAffirm(true)} style={{
                width:"100%",marginTop:8,background:theme.purple+"10",
                border:`1.5px dashed ${theme.purple}44`,borderRadius:12,
                padding:"10px",cursor:"pointer",
                color:theme.purple,fontFamily:F.b,fontWeight:700,fontSize:13}}>
                + Show 25 more affirmations
              </button>
            )}
          </Card>
        </div>
      )}

      {/* ── BREATHE ── */}
      {tab==="breathe"&&(
        <div style={{paddingTop:12,animation:"fadeIn 0.4s ease"}}>
          <h2 style={{fontFamily:F.h,fontSize:28,fontWeight:800,color:theme.text,marginBottom:4,textAlign:"center"}}>
            Breathe With Me
          </h2>
          <p style={{color:theme.muted,fontSize:15,marginBottom:16,fontWeight:500,textAlign:"center"}}>
            Let's calm down together.
          </p>
          <div style={{textAlign:"left"}}>
            <Tooltip text="Press Start and follow along — breathe in, hold, and breathe out. Each full cycle earns you points!"
              seen={seenTooltips.breathe} C={theme}
              onDismiss={async()=>{
              const updated={...seenTooltips,breathe:true};
              setSeenTooltips(updated);
              if(activeChild){
                await supabase.from("children").update({seen_tooltips:updated}).eq("id",activeChild.id);
                setActiveChild(prev=>({...prev,seen_tooltips:updated}));
                setChildren(prev=>prev.map(c=>c.id===activeChild.id?{...c,seen_tooltips:updated}:c));
              }
            }}/>
          </div>

          {/* Phase labels row */}
          <div style={{display:"flex",gap:8,justifyContent:"center",marginBottom:20}}>
            {BREATHING.map((b,i)=>(
              <div key={b.phase} style={{
                background:breathPhase===i&&breathActive?b.color:"#EEE9FF",
                color:breathPhase===i&&breathActive?"#fff":theme.muted,
                borderRadius:50,padding:"8px 16px",fontSize:13,fontWeight:700,
                fontFamily:F.b,transition:"all 0.6s"}}>{b.phase}</div>
            ))}
          </div>

          {/* Breathing circle — contained, no overflow */}
          <div style={{display:"flex",flexDirection:"column",alignItems:"center",marginBottom:24}}>
            <div style={{position:"relative",width:220,height:220,
              display:"flex",alignItems:"center",justifyContent:"center"}}>
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
                <GrowthMascot id={cm.id} size={62} stage={currentStage.id} />
                <p style={{fontFamily:F.h,fontWeight:800,fontSize:16,
                  color:BREATHING[breathPhase].color,marginTop:6,marginBottom:0}}>
                  {breathActive?BREATHING[breathPhase].phase:"Ready"}
                </p>
                {breathActive&&(
                  <p style={{color:theme.muted,fontSize:13,fontWeight:600,marginBottom:0}}>
                    {BREATHING[breathPhase].duration}s
                  </p>
                )}
              </div>
            </div>
          </div>

          {/* Start/Stop button */}
          <div style={{display:"flex",justifyContent:"center",marginBottom:20}}>
            <Btn onClick={()=>{
              setBreathActive(!breathActive);
              if(!breathActive){setBreathPhase(0);setBreathCount(0);}
            }} color={breathActive?"#EF5350":theme.mint}>
              {breathActive?"Stop":"Start Breathing"}
            </Btn>
          </div>

          {breathCount>0&&(
            <p style={{color:theme.purple,fontWeight:700,fontSize:16,fontFamily:F.b,
              textAlign:"center",marginBottom:16}}>
              {breathCount} breath{breathCount>1?"s":""} complete — well done!
            </p>
          )}
          <Card style={{marginTop:4,textAlign:"left"}}>
            <Label>Sessions completed</Label>
            <p style={{fontFamily:F.h,fontWeight:800,fontSize:28,color:theme.purple,margin:0}}>
              {activeChild.breath_sessions||0}
            </p>
            <p style={{color:theme.muted,fontSize:14,fontWeight:500,marginTop:4}}>
              {(activeChild.breath_sessions||0)>=5
                ?"Calm Champion badge earned!"
                :`${5-(activeChild.breath_sessions||0)} more for the Calm Champion badge`}
            </p>
          </Card>
        </div>
      )}

      {/* ── JOURNAL (Fix #2 — no black glitch, cohesive styling) ── */}
      {tab==="journal"&&(
        <div style={{paddingTop:12,animation:"fadeIn 0.4s ease"}}>
          <h2 style={{fontFamily:F.h,fontSize:28,fontWeight:800,color:theme.text,marginBottom:4}}>
            My Journal
          </h2>
          <p style={{color:theme.muted,fontSize:15,marginBottom:12,fontWeight:500}}>
            Your thoughts are safe here.
          </p>
          <Tooltip text="Read the prompt and write whatever comes to mind. There are no wrong answers — your thoughts are private!"
            seen={seenTooltips.journal} C={theme}
            onDismiss={async()=>{
              const updated={...seenTooltips,journal:true};
              setSeenTooltips(updated);
              if(activeChild){
                await supabase.from("children").update({seen_tooltips:updated}).eq("id",activeChild.id);
                setActiveChild(prev=>({...prev,seen_tooltips:updated}));
                setChildren(prev=>prev.map(c=>c.id===activeChild.id?{...c,seen_tooltips:updated}:c));
              }
            }}/>

          <Card style={{background:`linear-gradient(135deg,${theme.pink},${theme.purple})`,marginBottom:14}}>
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

          {/* Fix #2 — textarea with explicit stable styling, no black glitch */}
          <div style={{background:"#fff",borderRadius:20,marginBottom:14,
            boxShadow:"0 2px 18px rgba(124,77,255,0.09)",overflow:"hidden"}}>
            <div style={{padding:"20px 20px 0"}}>
              <p style={{fontFamily:F.b,fontWeight:700,fontSize:12,color:theme.muted,
                letterSpacing:1.3,textTransform:"uppercase",marginBottom:12}}>
                Write here
              </p>
              <textarea
                value={journalText}
                onChange={e=>{setJournalText(e.target.value);setJournalSaved(false);}}
                placeholder="Write anything you want — there are no wrong answers."
                style={{
                  width:"100%", minHeight:150,
                  border:"2px solid #EEE9FF",
                  borderRadius:16,
                  padding:"14px 16px",
                  fontSize:16, fontFamily:F.b, fontWeight:500,
                  color:"#2D2040",
                  background:"#F7F4FF",
                  lineHeight:1.8, resize:"none",
                  outline:"none",
                  display:"block",
                  WebkitAppearance:"none",
                  MozAppearance:"none",
                }}
                onFocus={e=>{e.target.style.border=`2px solid ${theme.purple}`;e.target.style.background="#fff";}}
                onBlur={e=>{e.target.style.border="2px solid #EEE9FF";e.target.style.background="#F7F4FF";}}
              />
            </div>
            <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",
              padding:"12px 20px",borderTop:`1px solid ${theme.border}`,marginTop:12}}>
              <span style={{color:theme.muted,fontSize:13,fontFamily:F.b,fontWeight:500}}>
                {journalText.length} characters
              </span>
              <Btn onClick={saveJournal} disabled={!journalText.trim()||journalSaved}
                loading={saveLoading} small color={journalSaved?theme.mint:theme.pink}
                icon={journalSaved?"check":null}>
                {journalSaved?"Saved":"Save Entry"}
              </Btn>
            </div>
          </div>

          {journalSaved&&(
            <Card style={{textAlign:"center",background:"#E8F5E9",animation:"scaleIn 0.3s ease"}}>
              <div style={{background:"#C8E6C9",borderRadius:"50%",width:64,height:64,
                display:"flex",alignItems:"center",justifyContent:"center",margin:"0 auto 12px"}}>
                <Icon name="check" size={34} color="#2E7D32"/>
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

          {journals.length>0&&(
            <Card>
              <Label>Past Entries ({journals.length})</Label>
              {journals.slice(0,5).map((j,i)=>(
                <div key={j.id} style={{padding:"12px 0",
                  borderBottom:i<Math.min(4,journals.length-1)?"1px solid #F0EAFF":"none"}}>
                  <div style={{display:"flex",justifyContent:"space-between",
                    alignItems:"center",marginBottom:4}}>
                    <span style={{fontSize:12,fontWeight:700,color:theme.purple,fontFamily:F.b}}>
                      {j.prompt}
                    </span>
                    <span style={{fontSize:11,color:theme.muted,fontFamily:F.b,flexShrink:0,marginLeft:8}}>
                      {j.date===today()?"Today":j.date}
                    </span>
                  </div>
                  <p style={{color:theme.text,fontSize:14,lineHeight:1.6,fontWeight:500,margin:0,
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

      {/* ── GRATITUDE JAR ── */}
      {tab==="gratitude"&&(
        <div style={{paddingTop:12,animation:"fadeIn 0.4s ease"}}>
          <h2 style={{fontFamily:F.h,fontSize:28,fontWeight:800,color:theme.text,marginBottom:4}}>
            Gratitude Jar
          </h2>
          <p style={{color:theme.muted,fontSize:15,marginBottom:18,fontWeight:500}}>
            What are you grateful for today?
          </p>

          {/* SVG Gratitude Jar */}
          <div style={{textAlign:"center",marginBottom:20}}>
            <svg viewBox="0 0 260 280" width="220" height="240"
              style={{overflow:"visible",display:"block",margin:"0 auto"}}>

              {/* Jar shadow */}
              <ellipse cx="130" cy="268" rx="70" ry="8" fill="rgba(0,0,0,0.08)"/>

              {/* Jar body */}
              <path d="M 60 100 Q 55 100 52 105 L 40 240 Q 38 260 60 265 L 200 265 Q 222 260 220 240 L 208 105 Q 205 100 200 100 Z"
                fill={darkMode?"#2a1f4a":"#E8F5E9"} stroke={darkMode?"#4DB6AC":"#4DB6AC"} strokeWidth="3"/>

              {/* Jar shine */}
              <path d="M 75 115 Q 72 130 74 155" stroke="rgba(255,255,255,0.5)" strokeWidth="4"
                fill="none" strokeLinecap="round"/>

              {/* Jar neck */}
              <rect x="75" y="80" width="110" height="24" rx="6"
                fill={darkMode?"#2a1f4a":"#C8E6C9"} stroke="#4DB6AC" strokeWidth="3"/>

              {/* Lid base */}
              <rect x="65" y="58" width="130" height="28" rx="8"
                fill="#4DB6AC"/>
              {/* Lid top */}
              <rect x="80" y="44" width="100" height="20" rx="6"
                fill="#26A69A"/>
              {/* Lid knob */}
              <rect x="112" y="34" width="36" height="14" rx="7"
                fill="#00897B"/>

              {/* Gratitude slips inside jar */}
              {gratitudes.length===0?(
                <text x="130" y="190" textAnchor="middle"
                  fontFamily={F.b} fontSize="12" fill={darkMode?"#9B8DB5":"#9B8DB5"}>
                  Add your first gratitude!
                </text>
              ):(
                gratitudes.slice(0,8).map((g,i)=>{
                  const colors=["#FFD54F","#F06292","#CE93D8","#4DB6AC","#FF8A65","#4FC3F7","#A5D6A7","#FFD54F"];
                  const xPos = 70 + (i%3)*50 + (i%2)*8;
                  const yPos = 130 + Math.floor(i/3)*40 + (i%2)*12;
                  const rot = (i%2===0?-1:1)*(i*3%8+2);
                  return (
                    <g key={g.id||i} transform={`translate(${xPos},${yPos}) rotate(${rot})`}>
                      <rect x="-28" y="-10" width="56" height="22" rx="4"
                        fill={colors[i%colors.length]} opacity="0.95"/>
                      <text x="0" y="6" textAnchor="middle"
                        fontFamily={F.b} fontSize="9" fontWeight="700" fill="#fff">
                        {g.text.length>10?g.text.slice(0,10)+"…":g.text}
                      </text>
                    </g>
                  );
                })
              )}

              {/* Jar shine overlay — keeps shine on top of slips */}
              <path d="M 75 115 Q 72 130 74 155" stroke="rgba(255,255,255,0.4)" strokeWidth="4"
                fill="none" strokeLinecap="round"/>
            </svg>

            <p style={{fontFamily:F.b,fontWeight:600,fontSize:13,
              color:theme.muted,marginTop:4}}>
              {gratitudes.length} gratitude{gratitudes.length!==1?"s":""} in your jar
            </p>
          </div>

          {/* Add new gratitude */}
          <div style={{background:theme.card,borderRadius:20,padding:"20px",
            boxShadow:"0 2px 18px rgba(124,77,255,0.09)",marginBottom:14}}>
            <p style={{fontFamily:F.h,fontWeight:800,fontSize:17,
              color:theme.text,margin:"0 0 12px"}}>
              Add to your jar
            </p>
            <textarea
              value={gratitudeText}
              onChange={e=>setGratitudeText(e.target.value)}
              placeholder="I am grateful for..."
              maxLength={150}
              style={{width:"100%",minHeight:80,border:`2px solid ${theme.border}`,
                borderRadius:16,padding:"12px 14px",fontSize:15,fontFamily:F.b,
                fontWeight:500,color:theme.text,background:theme.bg,
                lineHeight:1.7,resize:"none",outline:"none",display:"block",
                marginBottom:12}}
              onFocus={e=>e.target.style.border=`2px solid ${theme.mint}`}
              onBlur={e=>e.target.style.border=`2px solid ${theme.border}`}
            />
            <Btn onClick={saveGratitude} disabled={!gratitudeText.trim()}
              color={gratitudeSaved?theme.mint:"#43A047"}
              style={{width:"100%",justifyContent:"center"}}
              icon={gratitudeSaved?"check":"plus"}>
              {gratitudeSaved?"Added to your jar!":"Add to Jar"}
            </Btn>
          </div>

          {/* Past gratitudes */}
          {gratitudes.length>0&&(
            <div style={{background:theme.card,borderRadius:20,padding:"20px",
              boxShadow:"0 2px 18px rgba(124,77,255,0.09)"}}>
              <Label color={theme.muted}>Recent Gratitudes</Label>
              {gratitudes.slice(0,8).map((g,i)=>(
                <div key={g.id||i} style={{
                  display:"flex",alignItems:"flex-start",gap:12,
                  padding:"10px 0",
                  borderBottom:i<Math.min(7,gratitudes.length-1)?`1px solid ${theme.border}`:"none"}}>
                  <div style={{
                    width:10,height:10,borderRadius:"50%",flexShrink:0,marginTop:5,
                    background:["#FFD54F","#F06292","#7C4DFF","#4DB6AC","#FF7043","#4FC3F7"][i%6],
                  }}/>
                  <div style={{flex:1}}>
                    <p style={{fontFamily:F.b,fontWeight:600,fontSize:14,
                      color:theme.text,margin:0,lineHeight:1.6}}>{g.text}</p>
                    <p style={{fontFamily:F.b,fontWeight:500,fontSize:11,
                      color:theme.muted,margin:"2px 0 0"}}>
                      {g.date===today()?"Today":g.date}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}
    </Shell>
  );
}
