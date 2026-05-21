import { useState } from "react";
import { GrowthMascot } from "./MascotGrowth";

const F = { h:"'Baloo 2', cursive", b:"'Poppins', sans-serif" };
const C = {
  purple:"#7C4DFF", pink:"#F06292", mint:"#4DB6AC",
  sky:"#4FC3F7", coral:"#FF7043", yellow:"#FFD54F",
  text:"#2D2040", muted:"#9B8DB5",
};

/* ── Per-mascot intro lines ── */
const MASCOT_INTROS = {
  fox:   { greeting:"Hey there! I'm Finn! 🦊", line:"I'm a curious, adventurous fox — and I'm SO excited you picked me as your buddy!" },
  bunny: { greeting:"Hi hi hi! I'm Blossom! 🐰", line:"I'm the bounciest, happiest bunny around — and I can't wait to go on this journey with you!" },
  bear:  { greeting:"Hey, I'm Bruno! 🐻", line:"I'm a big, cosy bear who loves big feelings and even bigger adventures. Let's do this!" },
  owl:   { greeting:"Hoo hoo! I'm Ollie! 🦉", line:"I'm a wise little owl who loves learning new things — especially learning all about YOU!" },
  cat:   { greeting:"Heyyyy, I'm Luna! 🐱", line:"I'm a cool, calm cat with lots of curiosity. I'm really glad we found each other!" },
  dog:   { greeting:"Woof! I'm Sunny! 🐶", line:"I'm the most loyal, tail-wagging dog you'll ever meet — and I'm your new best friend!" },
};

/* ── Slide definitions ── */
const buildSlides = (mascot, childName) => {
  const intro = MASCOT_INTROS[mascot.id] || MASCOT_INTROS.fox;
  const name  = mascot.name;

  return [
    /* 0 — Mascot intro */
    {
      bg:       `linear-gradient(160deg, ${mascot.color}33, ${mascot.bg} 80%)`,
      accent:   mascot.color,
      icon:     null,
      bigMascot:true,
      title:    intro.greeting,
      body:     intro.line,
      sub:      `Ready to start your adventure, ${childName}?`,
    },
    /* 1 — What is Bloomy */
    {
      bg:       "linear-gradient(160deg,#EDE7F6,#F7F4FF 80%)",
      accent:   C.purple,
      emoji:    "🌸",
      title:    "Welcome to Bloomy!",
      body:     `This is YOUR special place, ${childName}. Every day you can check in with how you're feeling, write in your journal, practise breathing, and grow our garden together!`,
      sub:      `${name} will be right here with you every step of the way.`,
    },
    /* 2 — Mood check-in */
    {
      bg:       "linear-gradient(160deg,#FFF9C4,#FFF3E0 80%)",
      accent:   "#F9A825",
      emoji:    "😊",
      title:    "How are you feeling?",
      body:     "Every day you'll tap a mood that matches how you're feeling inside. It's totally okay to feel any emotion — happy, sad, worried, or anything in between. No feelings are wrong here!",
      sub:      `${name} will always understand how you feel.`,
    },
    /* 3 — Breathing */
    {
      bg:       "linear-gradient(160deg,#E0F7FA,#E8F5E9 80%)",
      accent:   C.mint,
      emoji:    "🫧",
      title:    "Breathe with me",
      body:     "When you feel big emotions, our breathing exercise helps you calm down. Breathe IN as the bubble gets bigger, HOLD when it pauses, and breathe OUT as it shrinks. Three steps to feeling better!",
      sub:      `${name} will breathe right along with you.`,
    },
    /* 4 — Journal */
    {
      bg:       "linear-gradient(160deg,#E8EAF6,#EDE7F6 80%)",
      accent:   C.purple,
      emoji:    "📓",
      title:    "Your secret journal",
      body:     "Your journal is a safe place to write whatever is on your mind. Happy thoughts, tricky days, funny stories — anything goes! Your words are private and just for you.",
      sub:      `${name} loves hearing your stories.`,
    },
    /* 5 — Affirmations */
    {
      bg:       "linear-gradient(160deg,#FCE4EC,#FFF3E0 80%)",
      accent:   C.pink,
      emoji:    "⭐",
      title:    "Kind words for you",
      body:     "Every day you'll get special affirmations — these are kind, powerful words about YOU. Swipe through them and let them remind you how amazing and special you really are!",
      sub:      `${name} believes every single one of them.`,
    },
    /* 6 — Gratitude */
    {
      bg:       "linear-gradient(160deg,#E8F5E9,#F1F8E9 80%)",
      accent:   "#43A047",
      emoji:    "🙏",
      title:    "Grateful moments",
      body:     "Each day you can write one thing you're grateful for. It could be your pet, your favourite food, a friend, or even a sunny day. Noticing the good stuff makes your heart feel warm!",
      sub:      `${name} is grateful for YOU.`,
    },
    /* 7 — Seeds & garden */
    {
      bg:       "linear-gradient(160deg,#E8F5E9,#FFFDE7 80%)",
      accent:   "#43A047",
      emoji:    "🌱",
      title:    "Earn seeds, grow your garden!",
      body:     "Every time you check in, journal, breathe, or read affirmations, you earn 🌱 Seeds! Seeds help your garden grow from a tiny sprout all the way to a magical Full Bloom garden with butterflies and fireflies!",
      sub:      `${name}'s garden grows when YOU grow!`,
    },
    /* 8 — Mascot room */
    {
      bg:       `linear-gradient(160deg, ${mascot.color}22, ${mascot.bg} 80%)`,
      accent:   mascot.color,
      emoji:    "🏡",
      title:    `${name}'s Garden Room`,
      body:     `Tap the garden button anytime to visit ${name} in their garden room. You can tap ${name} to say hi, watch your garden grow, and see all the stages your garden can reach. The more you use the app, the more beautiful it gets!`,
      sub:      `${name} is always happy to see you there.`,
    },
    /* 9 — Daily missions */
    {
      bg:       "linear-gradient(160deg,#FFF9C4,#FFF3E0 80%)",
      accent:   "#F9A825",
      emoji:    "🎯",
      title:    "Daily missions",
      body:     "Every day you'll get two special missions on your home screen. Complete them to earn bonus seeds! Missions change every day so there's always something fun to do. Check for the gold glow — that means you've crushed it!",
      sub:      `${name} will cheer you on every single day!`,
    },
    /* 10 — Let's go */
    {
      bg:       `linear-gradient(160deg, ${mascot.color}33, ${mascot.bg} 80%)`,
      accent:   mascot.color,
      bigMascot:true,
      emoji:    null,
      title:    `Let's go, ${childName}! 🎉`,
      body:     `You and ${name} are officially a team. Check in every day, grow your garden, and remember — every feeling you have matters. ${name} is so excited to be your buddy!`,
      sub:      "Tap the button below to start your first day!",
      isLast:   true,
    },
  ];
};

/* ── Main component ── */
export default function ChildOnboarding({ child, mascot, onFinish }) {
  const [step, setStep]             = useState(0);
  const [animKey, setAnimKey]       = useState(0);
  const [direction, setDirection]   = useState("forward");

  const slides = buildSlides(mascot, child.name);
  const slide  = slides[step];
  const isLast = !!slide.isLast;

  const go = (dir) => {
    setDirection(dir);
    setAnimKey(k => k + 1);
    if (dir === "forward") {
      if (isLast) { onFinish(); return; }
      setStep(s => s + 1);
    } else {
      setStep(s => Math.max(0, s - 1));
    }
  };

  const progress = (step / (slides.length - 1)) * 100;

  return (
    <div style={{
      position:"fixed", inset:0, zIndex:9999,
      background:slide.bg,
      display:"flex", flexDirection:"column",
      fontFamily:F.b,
      transition:"background 0.5s ease",
      overflowY:"auto",
    }}>
      <style>{`
        @keyframes coSlideIn  { from{opacity:0;transform:translateY(28px)} to{opacity:1;transform:translateY(0)} }
        @keyframes coSlideOut { from{opacity:1;transform:translateY(0)} to{opacity:0;transform:translateY(-20px)} }
        @keyframes coFloatMascot { 0%,100%{transform:translateY(0px)} 50%{transform:translateY(-12px)} }
        @keyframes coPopIn { from{opacity:0;transform:scale(0.85)} to{opacity:1;transform:scale(1)} }
        @keyframes coPulse { 0%,100%{transform:scale(1)} 50%{transform:scale(1.07)} }
      `}</style>

      {/* Progress bar */}
      <div style={{
        position:"absolute", top:0, left:0, right:0, height:4,
        background:"rgba(0,0,0,0.08)", zIndex:10,
      }}>
        <div style={{
          height:"100%", borderRadius:2,
          background:slide.accent,
          width:`${progress}%`,
          transition:"width 0.4s ease",
        }}/>
      </div>

      {/* Step counter */}
      <div style={{
        position:"absolute", top:16, right:20, zIndex:10,
        fontFamily:F.b, fontWeight:600, fontSize:12, color:"rgba(0,0,0,0.35)",
      }}>
        {step + 1} / {slides.length}
      </div>

      {/* Main content */}
      <div
        key={animKey}
        style={{
          flex:1, display:"flex", flexDirection:"column",
          alignItems:"center", justifyContent:"center",
          padding:"60px 28px 120px",
          animation:"coSlideIn 0.45s cubic-bezier(0.22,1,0.36,1) forwards",
        }}>

        {/* Mascot — big floating version on intro/outro slides */}
        {slide.bigMascot && (
          <div style={{
            marginBottom:24,
            animation:"coFloatMascot 3s ease-in-out infinite",
            filter:`drop-shadow(0 16px 32px ${mascot.color}55)`,
          }}>
            <div style={{
              width:160, height:160, borderRadius:"50%",
              background:`radial-gradient(circle at 40% 35%, ${mascot.color}30, ${mascot.bg})`,
              display:"flex", alignItems:"center", justifyContent:"center",
              boxShadow:`0 8px 32px ${mascot.color}44`,
            }}>
              <GrowthMascot id={mascot.id} size={110} stage={0}/>
            </div>
          </div>
        )}

        {/* Emoji icon for non-mascot slides */}
        {slide.emoji && (
          <div style={{
            fontSize:72, marginBottom:20, lineHeight:1,
            animation:"coPopIn 0.5s cubic-bezier(0.34,1.56,0.64,1) forwards",
            filter:"drop-shadow(0 4px 12px rgba(0,0,0,0.1))",
          }}>
            {slide.emoji}
          </div>
        )}

        {/* Title */}
        <h1 style={{
          fontFamily:F.h, fontWeight:900, fontSize:28,
          color:C.text, textAlign:"center",
          marginBottom:16, lineHeight:1.2,
          animation:"coSlideIn 0.5s 0.05s both",
        }}>
          {slide.title}
        </h1>

        {/* Body */}
        <p style={{
          fontFamily:F.b, fontWeight:500, fontSize:16,
          color:C.text, textAlign:"center",
          lineHeight:1.75, marginBottom:20,
          maxWidth:340,
          animation:"coSlideIn 0.5s 0.1s both",
          opacity:0.85,
        }}>
          {slide.body}
        </p>

        {/* Sub line — mascot quote */}
        <div style={{
          background:"rgba(255,255,255,0.72)",
          borderRadius:50, padding:"8px 20px",
          backdropFilter:"blur(8px)",
          display:"flex", alignItems:"center", gap:8,
          animation:"coSlideIn 0.5s 0.15s both",
          boxShadow:"0 2px 12px rgba(0,0,0,0.06)",
          maxWidth:320,
        }}>
          {/* Small mascot face */}
          <div style={{
            width:32, height:32, borderRadius:"50%",
            background:mascot.bg, flexShrink:0,
            display:"flex", alignItems:"center", justifyContent:"center",
          }}>
            <GrowthMascot id={mascot.id} size={24} stage={0}/>
          </div>
          <p style={{
            fontFamily:F.b, fontWeight:600, fontSize:13,
            color:slide.accent, margin:0, lineHeight:1.4,
          }}>
            {slide.sub}
          </p>
        </div>

        {/* Dot indicators */}
        <div style={{
          display:"flex", gap:6, marginTop:32,
          animation:"coSlideIn 0.5s 0.2s both",
        }}>
          {slides.map((_,i) => (
            <div key={i} onClick={()=>{setAnimKey(k=>k+1);setStep(i);}} style={{
              width: i===step ? 24 : 7,
              height:7, borderRadius:50,
              background: i===step ? slide.accent : `${slide.accent}44`,
              cursor:"pointer",
              transition:"all 0.3s ease",
            }}/>
          ))}
        </div>
      </div>

      {/* Bottom nav */}
      <div style={{
        position:"fixed", bottom:0, left:0, right:0,
        padding:"16px 24px 36px",
        display:"flex", justifyContent:"space-between", alignItems:"center",
        background:"rgba(255,255,255,0.65)",
        backdropFilter:"blur(12px)",
        borderTop:"1px solid rgba(255,255,255,0.5)",
      }}>

        {/* Back button */}
        <button
          onClick={()=>go("back")}
          style={{
            background: step===0 ? "transparent" : "rgba(255,255,255,0.8)",
            border: step===0 ? "none" : "1.5px solid rgba(0,0,0,0.08)",
            borderRadius:50, padding:"12px 20px",
            cursor: step===0 ? "default" : "pointer",
            fontFamily:F.b, fontWeight:600, fontSize:14,
            color: step===0 ? "transparent" : C.muted,
            display:"flex", alignItems:"center", gap:6,
            transition:"all 0.2s",
            pointerEvents: step===0 ? "none" : "auto",
          }}>
          <svg viewBox="0 0 24 24" width={16} height={16} fill="none"
            stroke={C.muted} strokeWidth="2.2" strokeLinecap="round">
            <path d="M19 12H5M12 5l-7 7 7 7"/>
          </svg>
          Back
        </button>

        {/* Next / Let's Go button */}
        <button
          onClick={()=>go("forward")}
          style={{
            background:`linear-gradient(135deg, ${slide.accent}, ${slide.accent}cc)`,
            border:"none", borderRadius:50,
            padding:"14px 32px",
            cursor:"pointer",
            fontFamily:F.h, fontWeight:800, fontSize:17,
            color:"#fff",
            boxShadow:`0 6px 24px ${slide.accent}55`,
            display:"flex", alignItems:"center", gap:8,
            animation: isLast ? "coPulse 1.8s ease-in-out infinite" : "none",
            transition:"transform 0.15s",
          }}
          onMouseDown={e=>e.currentTarget.style.transform="scale(0.97)"}
          onMouseUp={e=>e.currentTarget.style.transform="scale(1)"}>
          {isLast ? `Start with ${mascot.name}! 🌱` : "Next"}
          {!isLast && (
            <svg viewBox="0 0 24 24" width={16} height={16} fill="none"
              stroke="#fff" strokeWidth="2.5" strokeLinecap="round">
              <path d="M5 12h14M12 5l7 7-7 7"/>
            </svg>
          )}
        </button>
      </div>
    </div>
  );
}
