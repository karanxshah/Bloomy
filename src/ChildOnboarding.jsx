import { useState, useRef } from "react";
import { FullBodyMascot } from "./MascotRoom";

const F = { h:"'Baloo 2', cursive", b:"'Poppins', sans-serif" };

const MASCOT_INTROS = {
  fox:   { greeting:"Hey there! I'm Finn! 🦊" },
  bunny: { greeting:"Hi hi hi! I'm Blossom! 🐰" },
  bear:  { greeting:"Hey, I'm Bruno! 🐻" },
  owl:   { greeting:"Hoo hoo! I'm Ollie! 🦉" },
  cat:   { greeting:"Heyyyy, I'm Luna! 🐱" },
  dog:   { greeting:"Woof! I'm Sunny! 🐶" },
};

const Hi = ({ children, color }) => (
  <span style={{ fontWeight:800, color: color || "#7C4DFF" }}>{children}</span>
);

const SeedIcon = () => (
  <svg width="14" height="14" viewBox="0 0 32 32" fill="none"
    style={{ display:"inline", verticalAlign:"middle", margin:"0 2px" }}>
    <defs>
      <radialGradient id="obSeedG" cx="38%" cy="32%" r="62%">
        <stop offset="0%" stopColor="#D4A574"/>
        <stop offset="100%" stopColor="#8B5E3C"/>
      </radialGradient>
    </defs>
    <ellipse cx="16" cy="17" rx="7" ry="9.5" fill="url(#obSeedG)"/>
    <ellipse cx="13" cy="13" rx="2" ry="3.2" fill="rgba(255,255,255,0.3)"
      transform="rotate(-18 13 13)"/>
  </svg>
);

/* ── Slide content ── */
const SLIDES = (mascot, childName) => {
  const name = mascot.name;
  const a = mascot.color; // accent shorthand
  const base = {
    fontFamily:F.b, fontWeight:500, fontSize:15, color:"#2D2040",
    textAlign:"center", lineHeight:1.8, margin:0, maxWidth:300, opacity:0.9,
  };

  return [
    {
      bg1: mascot.color+"55", bg2: mascot.bg, accent: mascot.color,
      title: MASCOT_INTROS[mascot.id]?.greeting || `Hi! I'm ${name}!`,
      tag: `Hi ${childName}! 👋`,
      body: <p style={base}>I'll be your <Hi color={a}>buddy</Hi> inside Bloomy — a special place just for you where we'll grow together every single day! 🌱</p>,
    },
    {
      bg1:"#FFE082", bg2:"#FFF9C4", accent:"#F9A825",
      title: "Check in daily 😊",
      tag: `${name} always understands.`,
      body: <p style={base}>Each day, <Hi color="#F9A825">tap a face</Hi> that matches how you feel. Then take a breath, write in your journal, or add a gratitude — every activity earns you <SeedIcon/><Hi color="#8B5E3C">seeds!</Hi></p>,
    },
    {
      bg1:"#B2EBF2", bg2:"#E0F7FA", accent:"#00ACC1",
      title: "Breathe & journal 📓",
      tag: `${name} loves your stories.`,
      body: <p style={base}>When feelings get big, <Hi color="#00ACC1">breathe with me</Hi> — watch the bubble grow and shrink. Then write anything in your <Hi color="#00ACC1">private journal.</Hi> There are no wrong answers! ✏️</p>,
    },
    {
      bg1:"#A5D6A7", bg2:"#E8F5E9", accent:"#43A047",
      title: "Gratitude & affirmations 🙏",
      tag: `${name} is grateful for YOU.`,
      body: <p style={base}>Write <Hi color="#43A047">one thing you're grateful for</Hi> each day. Then swipe through your <Hi color="#43A047">daily affirmations</Hi> — kind words that remind you how amazing you really are! ⭐</p>,
    },
    {
      bg1:"#D4A574", bg2:"#F5E6D3", accent:"#8B5E3C",
      title: "Grow your garden! 🌸",
      tag: `${name}'s garden grows when YOU grow!`,
      body: <p style={base}>Every activity earns <SeedIcon/><Hi color="#8B5E3C">seeds</Hi> that grow your garden — from a tiny <Hi color="#43A047">Seedling</Hi> all the way to <Hi color="#FFD54F">Full Bloom!</Hi> Tap {name} on the home screen to visit 🌻</p>,
    },
    {
      bg1:"#FFD54F", bg2:"#FFF9C4", accent:"#F9A825",
      title: "Missions & shop 🛍️",
      tag: `${name} cheers you on every day!`,
      body: <p style={base}>Complete your <Hi color="#F9A825">2 daily missions</Hi> for bonus seeds ⭐ Then spend them in the <Hi color="#F9A825">Mascot Shop</Hi> to unlock new room backgrounds and jar colours — swap them any time!</p>,
    },
    {
      bg1: mascot.color+"55", bg2: mascot.bg, accent: mascot.color,
      title: `Let's go, ${childName}! 🎉`,
      tag: "Your adventure starts NOW!",
      body: <p style={base}>Check in every day, grow your garden, and remember — <Hi color={a}>every feeling you have matters.</Hi> {name} is SO excited to start! 💜</p>,
      isLast: true,
    },
  ];
};

/* ── Main component ── */
export default function ChildOnboarding({ child, mascot, onFinish }) {
  const [step, setStep]       = useState(0);
  const [anim, setAnim]       = useState("in-right");
  const [animKey, setAnimKey] = useState(0);
  const touchX = useRef(null);
  const touchY = useRef(null);

  const slides  = SLIDES(mascot, child.name);
  const slide   = slides[step];
  const isLast  = !!slide.isLast;
  const total   = slides.length;

  const navigate = (dir) => {
    if (dir === "next") {
      if (isLast) { onFinish(); return; }
      setAnim("in-right"); setAnimKey(k => k+1); setStep(s => s+1);
    } else {
      if (step === 0) return;
      setAnim("in-left"); setAnimKey(k => k+1); setStep(s => s-1);
    }
  };

  const goTo = (i) => {
    if (i === step) return;
    setAnim(i > step ? "in-right" : "in-left");
    setAnimKey(k => k+1);
    setStep(i);
  };

  const onTouchStart = (e) => {
    touchX.current = e.touches[0].clientX;
    touchY.current = e.touches[0].clientY;
  };
  const onTouchEnd = (e) => {
    if (touchX.current === null) return;
    const dx = e.changedTouches[0].clientX - touchX.current;
    const dy = Math.abs(e.changedTouches[0].clientY - touchY.current);
    if (Math.abs(dx) > 50 && dy < 80) dx < 0 ? navigate("next") : navigate("prev");
    touchX.current = null;
  };

  const mascotSize = Math.min(190, typeof window !== "undefined" ? window.innerHeight * 0.26 : 190);

  return (
    <div
      onTouchStart={onTouchStart}
      onTouchEnd={onTouchEnd}
      style={{
        position:"fixed", inset:0, zIndex:9999,
        fontFamily:F.b,
        background:`linear-gradient(160deg, ${slide.bg1} 0%, ${slide.bg2} 100%)`,
        transition:"background 0.55s ease",
        display:"flex", flexDirection:"column",
        overflow:"hidden",
      }}
    >
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Baloo+2:wght@700;800;900&family=Poppins:wght@400;500;600;700&display=swap');
        @keyframes coInRight { from{opacity:0;transform:translateX(55px)} to{opacity:1;transform:translateX(0)} }
        @keyframes coInLeft  { from{opacity:0;transform:translateX(-55px)} to{opacity:1;transform:translateX(0)} }
        @keyframes coFloat   { 0%,100%{transform:translateY(0)} 50%{transform:translateY(-10px)} }
        @keyframes coPulse   { 0%,100%{transform:scale(1)} 50%{transform:scale(1.05)} }
        @keyframes coFadeUp  { from{opacity:0;transform:translateY(14px)} to{opacity:1;transform:translateY(0)} }
      `}</style>

      {/* Progress dots */}
      <div style={{ display:"flex", justifyContent:"center", gap:6, paddingTop:48, flexShrink:0 }}>
        {slides.map((_, i) => (
          <div
            key={i}
            onClick={() => goTo(i)}
            style={{
              width: i === step ? 22 : 7, height:7, borderRadius:50,
              background: i === step ? slide.accent : `${slide.accent}38`,
              cursor:"pointer",
              transition:"all 0.3s cubic-bezier(0.34,1.56,0.64,1)",
              boxShadow: i === step ? `0 2px 6px ${slide.accent}55` : "none",
            }}
          />
        ))}
      </div>

      {/* Mascot */}
      <div style={{
        height:"36vh", flexShrink:0,
        display:"flex", alignItems:"center", justifyContent:"center",
        animation:"coFloat 3.2s ease-in-out infinite",
        filter:`drop-shadow(0 18px 32px ${mascot.color}55)`,
      }}>
        <FullBodyMascot id={mascot.id} size={mascotSize} stage={0}/>
      </div>

      {/* Slide content */}
      <div
        key={animKey}
        style={{
          flex:1,
          display:"flex", flexDirection:"column",
          alignItems:"center", justifyContent:"flex-start",
          padding:"0 24px 28px",
          overflow:"hidden",
          animation:`${anim === "in-right" ? "coInRight" : "coInLeft"} 0.4s cubic-bezier(0.22,1,0.36,1) forwards`,
        }}
      >
        {/* Speech bubble tag */}
        <div style={{
          background:"rgba(255,255,255,0.84)",
          borderRadius:18, borderBottomLeftRadius:4,
          padding:"7px 16px", marginBottom:10,
          backdropFilter:"blur(10px)",
          boxShadow:"0 4px 14px rgba(0,0,0,0.07)",
          maxWidth:290,
          animation:"coFadeUp 0.3s 0.05s both",
        }}>
          <p style={{ fontFamily:F.b, fontWeight:600, fontSize:13, color:slide.accent, margin:0, textAlign:"center", lineHeight:1.4 }}>
            {slide.tag}
          </p>
        </div>

        {/* Title */}
        <h1 style={{
          fontFamily:F.h, fontWeight:900,
          fontSize: slide.title.length > 22 ? 20 : 24,
          color:"#2D2040", textAlign:"center",
          lineHeight:1.2, margin:"0 0 10px",
          animation:"coFadeUp 0.3s 0.09s both",
        }}>
          {slide.title}
        </h1>

        {/* Body */}
        <div style={{ animation:"coFadeUp 0.3s 0.13s both", textAlign:"center", marginBottom:8 }}>
          {slide.body}
        </div>

        {/* Swipe hint — first slide only */}
        {step === 0 && (
          <p style={{
            fontFamily:F.b, fontWeight:500, fontSize:12,
            color:`${slide.accent}99`, margin:"0 0 10px",
            animation:"coFadeUp 0.3s 0.2s both",
          }}>
            Swipe or tap Next to explore 👉
          </p>
        )}

        {/* Step counter */}
        {step > 0 && !isLast && (
          <p style={{ fontFamily:F.b, fontWeight:600, fontSize:11, color:`${slide.accent}77`, margin:"0 0 8px" }}>
            {step + 1} of {total}
          </p>
        )}

        {/* Nav */}
        <div style={{
          display:"flex",
          justifyContent: step === 0 ? "center" : "space-between",
          alignItems:"center",
          width:"100%", maxWidth:320, marginTop:"auto",
        }}>
          {step > 0 && (
            <button
              onClick={() => navigate("prev")}
              style={{
                background:"rgba(255,255,255,0.78)",
                border:"1.5px solid rgba(0,0,0,0.07)",
                borderRadius:50, padding:"10px 20px",
                cursor:"pointer",
                fontFamily:F.b, fontWeight:600, fontSize:14, color:"#9B8DB5",
                display:"flex", alignItems:"center", gap:5,
                backdropFilter:"blur(8px)",
                transition:"transform 0.15s",
              }}
              onMouseDown={e => e.currentTarget.style.transform = "scale(0.96)"}
              onMouseUp={e => e.currentTarget.style.transform = "scale(1)"}
            >
              <svg viewBox="0 0 24 24" width={14} height={14} fill="none"
                stroke="#9B8DB5" strokeWidth="2.5" strokeLinecap="round">
                <path d="M19 12H5M12 5l-7 7 7 7"/>
              </svg>
              Back
            </button>
          )}

          <button
            onClick={() => navigate("next")}
            style={{
              background: isLast
                ? "linear-gradient(135deg,#43A047,#66BB6A)"
                : `linear-gradient(135deg,${slide.accent},${slide.accent}cc)`,
              border:"none", borderRadius:50,
              padding:"12px 28px", cursor:"pointer",
              fontFamily:F.h, fontWeight:900, fontSize:15, color:"#fff",
              boxShadow: isLast ? "0 6px 22px rgba(67,160,71,0.4)" : `0 5px 18px ${slide.accent}44`,
              display:"flex", alignItems:"center", gap:7,
              animation: isLast ? "coPulse 1.6s ease-in-out infinite" : "none",
              transition:"transform 0.15s",
            }}
            onMouseDown={e => e.currentTarget.style.transform = "scale(0.96)"}
            onMouseUp={e => e.currentTarget.style.transform = "scale(1)"}
          >
            {isLast ? "Start Blooming 🌸" : (
              <>
                Next
                <svg viewBox="0 0 24 24" width={13} height={13} fill="none"
                  stroke="#fff" strokeWidth="2.5" strokeLinecap="round">
                  <path d="M5 12h14M12 5l7 7-7 7"/>
                </svg>
              </>
            )}
          </button>
        </div>
      </div>
    </div>
  );
}
