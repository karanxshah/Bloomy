import { useState, useRef } from "react";
import { FullBodyMascot } from "./MascotRoom";

const F = { h:"'Baloo 2', cursive", b:"'Poppins', sans-serif" };

const MASCOT_INTROS = {
  fox:   { greeting:"Hey there! I'm Finn! 🦊", line:"I'm a curious, adventurous fox and I'm SO excited you picked me!" },
  bunny: { greeting:"Hi hi hi! I'm Blossom! 🐰", line:"I'm the bounciest happiest bunny and I can't wait to go on this journey with you!" },
  bear:  { greeting:"Hey, I'm Bruno! 🐻", line:"I'm a big cosy bear who loves big feelings and even bigger adventures!" },
  owl:   { greeting:"Hoo hoo! I'm Ollie! 🦉", line:"I'm a wise little owl who loves learning — especially learning all about YOU!" },
  cat:   { greeting:"Heyyyy, I'm Luna! 🐱", line:"I'm a cool calm cat with lots of curiosity. I'm so glad we found each other!" },
  dog:   { greeting:"Woof! I'm Sunny! 🐶", line:"I'm the most loyal dog you'll ever meet — and I'm your new best friend!" },
};

/* ── SVG inline icons used inside slide bodies ── */
const SeedSVG = () => (
  <svg width="16" height="16" viewBox="0 0 32 32" fill="none" style={{display:"inline",verticalAlign:"middle",margin:"0 2px"}}>
    <defs><radialGradient id="obSeed" cx="38%" cy="32%" r="62%"><stop offset="0%" stopColor="#D4A574"/><stop offset="100%" stopColor="#8B5E3C"/></radialGradient></defs>
    <ellipse cx="16" cy="17" rx="7" ry="9.5" fill="url(#obSeed)"/>
    <path d="M16 8 Q17 17 16 26" stroke="rgba(255,255,255,0.18)" strokeWidth="1.2" strokeLinecap="round" fill="none"/>
    <ellipse cx="13" cy="13" rx="2" ry="3.2" fill="rgba(255,255,255,0.3)" transform="rotate(-18 13 13)"/>
  </svg>
);

const BerrySVGSmall = () => (
  <svg width="16" height="16" viewBox="0 0 32 32" fill="none" style={{display:"inline",verticalAlign:"middle",margin:"0 2px"}}>
    <defs><radialGradient id="obBerry" cx="40%" cy="35%" r="60%"><stop offset="0%" stopColor="#9575CD"/><stop offset="100%" stopColor="#512DA8"/></radialGradient></defs>
    <ellipse cx="16" cy="7" rx="4" ry="3" fill="#66BB6A" transform="rotate(-15 16 7)"/>
    <circle cx="16" cy="20" r="9" fill="url(#obBerry)"/>
    <ellipse cx="12.5" cy="16" rx="2" ry="3" fill="rgba(255,255,255,0.28)" transform="rotate(-20 12.5 16)"/>
    <circle cx="13" cy="15" r="1" fill="rgba(255,255,255,0.45)"/>
  </svg>
);

/* ── Highlight a word in bold accent colour ── */
const Hi = ({ children, color }) => (
  <span style={{fontWeight:800, color: color || "#7C4DFF"}}>{children}</span>
);

/* ── Per-slide rich body renderer ── */
const SlideBody = ({ slideIndex, accent, mascotName, childName }) => {
  const s = { fontFamily:F.b, fontWeight:500, fontSize:15, color:"#2D2040",
    textAlign:"center", lineHeight:1.85, margin:"0 0 16px", maxWidth:300, opacity:0.88 };

  const bodies = [
    /* 0 intro */       <p style={s}>I'll be your buddy inside <Hi color={accent}>Bloomy</Hi> — a special place just for <Hi color={accent}>you!</Hi></p>,
    /* 1 welcome */     <p style={s}>Every day you can <Hi color={accent}>check in</Hi> with how you feel, <Hi color={accent}>write</Hi> in your journal, <Hi color={accent}>breathe</Hi>, and grow our garden together!</p>,
    /* 2 mood */        <p style={s}>Tap a face that matches how you feel — <Hi color="#F9A825">happy</Hi>, <Hi color="#7C4DFF">worried</Hi>, <Hi color="#43A047">calm</Hi>, or anything else. <Hi color={accent}>All feelings are welcome here!</Hi></p>,
    /* 3 breathing */   <p style={s}>Watch the <Hi color={accent}>bubble grow</Hi> as you breathe in 🫧 Pause when it holds, then <Hi color={accent}>breathe out</Hi> slowly. You'll also earn a <BerrySVGSmall/>berry!</p>,
    /* 4 journal */     <p style={s}>Write <Hi color={accent}>anything</Hi> on your mind — happy thoughts, tricky days, funny stories. Your words are <Hi color={accent}>just for you.</Hi> Writing earns a <BerrySVGSmall/>berry!</p>,
    /* 5 gratitude */   <p style={s}>Write <Hi color={accent}>one thing</Hi> you're grateful for each day — a friend, your pet, a sunny day. Noticing the good stuff makes your heart feel <Hi color={accent}>warm</Hi> and earns a <BerrySVGSmall/>berry!</p>,
    /* 6 affirmations */ <p style={s}>Every day you get <Hi color={accent}>kind words</Hi> written just for you. Swipe through them and let them remind you how <Hi color={accent}>amazing</Hi> you really are! ⭐</p>,
    /* 7 seeds */       <p style={s}>Every activity earns you <SeedSVG/><Hi color="#8B5E3C">Seeds!</Hi> Seeds grow your garden — from a tiny <Hi color="#43A047">sprout</Hi> all the way to a magical <Hi color="#F9A825">Full Bloom!</Hi> 🌸</p>,
    /* 8 berries */     <p style={s}>Journaling, breathing, and gratitude earn <BerrySVGSmall/><Hi color={accent}>berries!</Hi> Tap the <Hi color={accent}>basket 🧺</Hi> in the top corner to see how many you have.</p>,
    /* 9 energy */      <p style={s}>{mascotName} has an <Hi color={accent}>energy bar.</Hi> It goes down a little each day — but feeding them <BerrySVGSmall/>berries brings it <Hi color={accent}>back up!</Hi> Take care of them every day 💜</p>,
    /* 10 missions */   <p style={s}>Each day you get <Hi color="#F9A825">2 special missions</Hi> on your home screen. Finish them to earn <Hi color="#F9A825">bonus</Hi> <SeedSVG/><Hi color="#8B5E3C">seeds!</Hi> Look for the <Hi color="#F9A825">gold glow</Hi> ✨</p>,
    /* 11 last */       <p style={s}>Check in every day, grow your garden, feed {mascotName} berries, and remember — <Hi color={accent}>every feeling you have matters.</Hi> {mascotName} is SO excited! 🎉</p>,
  ];

  return bodies[slideIndex] || null;
};

const buildSlides = (mascot, childName) => {
  const intro = MASCOT_INTROS[mascot.id] || MASCOT_INTROS.fox;
  const name  = mascot.name;
  return [
    { bg1:mascot.color+"55", bg2:mascot.bg, accent:mascot.color, title:intro.greeting, tag:`Hi ${childName}! 👋` },
    { bg1:"#C5CAE9", bg2:"#EDE7F6", accent:"#7C4DFF", title:"Welcome to Bloomy!", tag:`${name} will be right here with you.` },
    { bg1:"#FFE082", bg2:"#FFF9C4", accent:"#F9A825", title:"How are you feeling?", tag:`${name} always understands. 💛` },
    { bg1:"#B2EBF2", bg2:"#E0F7FA", accent:"#00ACC1", title:"Breathe with me", tag:`${name} will breathe with you. 🫧` },
    { bg1:"#B39DDB", bg2:"#EDE7F6", accent:"#7C4DFF", title:"Your secret journal", tag:`${name} loves your stories. 📓` },
    { bg1:"#A5D6A7", bg2:"#E8F5E9", accent:"#43A047", title:"Grateful moments", tag:`${name} is grateful for YOU. 🙏` },
    { bg1:"#F48FB1", bg2:"#FCE4EC", accent:"#EC407A", title:"Kind words for you", tag:`${name} believes every single one. ⭐` },
    { bg1:"#D4A574", bg2:"#F5E6D3", accent:"#8B5E3C", title:"Earn seeds, grow your garden!", tag:`${name}'s garden grows when YOU grow!` },
    { bg1:"#CE93D8", bg2:"#F3E5F5", accent:"#8E24AA", title:"Your berry basket 🧺", tag:`${name} loves when you share berries!` },
    { bg1:mascot.color+"44", bg2:mascot.bg, accent:mascot.color, title:`Keep ${name} happy!`, tag:`${name} needs you every day! 💜` },
    { bg1:"#FFD54F", bg2:"#FFF9C4", accent:"#F9A825", title:"Daily missions", tag:`${name} cheers you on every day! 🏆` },
    { bg1:mascot.color+"55", bg2:mascot.bg, accent:mascot.color, title:`Let's go, ${childName}! 🎉`, tag:"Your adventure starts now!", isLast:true },
  ];
};

export default function ChildOnboarding({ child, mascot, onFinish }) {
  const [step, setStep]       = useState(0);
  const [anim, setAnim]       = useState("in-right");
  const [animKey, setAnimKey] = useState(0);
  const touchX = useRef(null);
  const touchY = useRef(null);

  const slides = buildSlides(mascot, child.name);
  const slide  = slides[step];
  const isLast = !!slide.isLast;

  const navigate = (dir) => {
    if (dir === "next") {
      if (isLast) { onFinish(); return; }
      setAnim("in-right"); setAnimKey(k=>k+1); setStep(s=>s+1);
    } else {
      if (step === 0) return;
      setAnim("in-left"); setAnimKey(k=>k+1); setStep(s=>s-1);
    }
  };

  const goTo = (i) => {
    setAnim(i > step ? "in-right" : "in-left");
    setAnimKey(k=>k+1); setStep(i);
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
      }}>

      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Baloo+2:wght@700;800;900&family=Poppins:wght@400;500;600;700&display=swap');
        @keyframes coInRight { from{opacity:0;transform:translateX(55px)} to{opacity:1;transform:translateX(0)} }
        @keyframes coInLeft  { from{opacity:0;transform:translateX(-55px)} to{opacity:1;transform:translateX(0)} }
        @keyframes coFloat   { 0%,100%{transform:translateY(0px)} 50%{transform:translateY(-10px)} }
        @keyframes coPulse   { 0%,100%{transform:scale(1)} 50%{transform:scale(1.05)} }
        @keyframes coFadeUp  { from{opacity:0;transform:translateY(14px)} to{opacity:1;transform:translateY(0)} }
      `}</style>

      {/* Progress dots — compact row at top */}
      <div style={{display:"flex",justifyContent:"center",gap:5,paddingTop:44,flexShrink:0}}>
        {slides.map((_,i) => (
          <div key={i} onClick={()=>goTo(i)} style={{
            width:i===step?22:6, height:6, borderRadius:50,
            background:i===step ? slide.accent : `${slide.accent}38`,
            cursor:"pointer",
            transition:"all 0.3s cubic-bezier(0.34,1.56,0.64,1)",
            boxShadow:i===step ? `0 2px 6px ${slide.accent}55` : "none",
          }}/>
        ))}
      </div>

      {/* Mascot zone — fixed height, always visible, never clipped */}
      <div style={{
        height:"38vh", flexShrink:0,
        display:"flex", alignItems:"center", justifyContent:"center",
        animation:"coFloat 3.2s ease-in-out infinite",
        filter:`drop-shadow(0 18px 32px ${mascot.color}55)`,
      }}>
        <FullBodyMascot id={mascot.id} size={Math.min(200, window.innerHeight * 0.28)} stage={0}/>
      </div>

      {/* Text + nav zone — takes remaining space */}
      <div
        key={animKey}
        style={{
          flex:1,
          display:"flex", flexDirection:"column",
          alignItems:"center", justifyContent:"flex-start",
          padding:"0 24px 24px",
          overflow:"hidden",
          animation:`${anim==="in-right"?"coInRight":"coInLeft"} 0.4s cubic-bezier(0.22,1,0.36,1) forwards`,
        }}>

        {/* Speech bubble */}
        <div style={{
          background:"rgba(255,255,255,0.84)",
          borderRadius:18, borderBottomLeftRadius:4,
          padding:"7px 16px", marginBottom:10,
          backdropFilter:"blur(10px)",
          boxShadow:"0 4px 14px rgba(0,0,0,0.07)",
          maxWidth:290,
          animation:"coFadeUp 0.3s 0.05s both",
        }}>
          <p style={{fontFamily:F.b, fontWeight:600, fontSize:13,
            color:slide.accent, margin:0, textAlign:"center", lineHeight:1.4}}>
            {slide.tag}
          </p>
        </div>

        {/* Title */}
        <h1 style={{
          fontFamily:F.h, fontWeight:900,
          fontSize: slide.title.length > 20 ? 21 : 25,
          color:"#2D2040", textAlign:"center",
          lineHeight:1.2, margin:"0 0 8px",
          animation:"coFadeUp 0.3s 0.09s both",
        }}>
          {slide.title}
        </h1>

        {/* Rich body with highlighted words and inline SVG icons */}
        <div style={{animation:"coFadeUp 0.3s 0.13s both", textAlign:"center"}}>
          <SlideBody
            slideIndex={step}
            accent={slide.accent}
            mascotName={mascot.name}
            childName={child.name}
          />
        </div>

        {/* Swipe hint — first slide only */}
        {step === 0 && (
          <p style={{fontFamily:F.b,fontWeight:500,fontSize:12,
            color:`${slide.accent}88`,margin:"0 0 12px",
            animation:"coFadeUp 0.3s 0.2s both"}}>
            Swipe or tap Next to explore 👉
          </p>
        )}

        {/* Nav buttons */}
        <div style={{
          display:"flex",
          justifyContent: step === 0 ? "center" : "space-between",
          alignItems:"center",
          width:"100%", maxWidth:320, marginTop:"auto",
        }}>
          {step > 0 && (
            <button onClick={()=>navigate("prev")} style={{
              background:"rgba(255,255,255,0.78)",
              border:"1.5px solid rgba(0,0,0,0.07)",
              borderRadius:50, padding:"10px 20px",
              cursor:"pointer",
              fontFamily:F.b, fontWeight:600, fontSize:14,
              color:"#9B8DB5",
              display:"flex", alignItems:"center", gap:5,
              backdropFilter:"blur(8px)",
              transition:"transform 0.15s",
            }}
            onMouseDown={e=>e.currentTarget.style.transform="scale(0.96)"}
            onMouseUp={e=>e.currentTarget.style.transform="scale(1)"}>
              <svg viewBox="0 0 24 24" width={14} height={14} fill="none"
                stroke="#9B8DB5" strokeWidth="2.5" strokeLinecap="round">
                <path d="M19 12H5M12 5l-7 7 7 7"/>
              </svg>
              Back
            </button>
          )}

          <button onClick={()=>navigate("next")} style={{
            background: isLast
              ? "linear-gradient(135deg,#43A047,#66BB6A)"
              : `linear-gradient(135deg,${slide.accent},${slide.accent}cc)`,
            border:"none", borderRadius:50,
            padding:"12px 28px",
            cursor:"pointer",
            fontFamily:F.h, fontWeight:900, fontSize:15,
            color:"#fff",
            boxShadow: isLast
              ? "0 6px 22px rgba(67,160,71,0.4)"
              : `0 5px 18px ${slide.accent}44`,
            display:"flex", alignItems:"center", gap:7,
            animation: isLast ? "coPulse 1.6s ease-in-out infinite" : "none",
            transition:"transform 0.15s",
          }}
          onMouseDown={e=>e.currentTarget.style.transform="scale(0.96)"}
          onMouseUp={e=>e.currentTarget.style.transform="scale(1)"}>
            {isLast ? "Start Blooming" : (
              <>Next
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
