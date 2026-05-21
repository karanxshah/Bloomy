import { useState, useRef } from "react";
import { FullBodyMascot } from "./MascotRoom";

const F = { h:"'Baloo 2', cursive", b:"'Poppins', sans-serif" };

const MASCOT_INTROS = {
  fox:   { greeting:"Hey there! I'm Finn! 🦊", line:"I'm a curious, adventurous fox and I'm SO excited you picked me as your buddy!" },
  bunny: { greeting:"Hi hi hi! I'm Blossom! 🐰", line:"I'm the bounciest happiest bunny around and I can't wait to go on this journey with you!" },
  bear:  { greeting:"Hey, I'm Bruno! 🐻", line:"I'm a big cosy bear who loves big feelings and even bigger adventures. Let's do this!" },
  owl:   { greeting:"Hoo hoo! I'm Ollie! 🦉", line:"I'm a wise little owl who loves learning new things, especially learning all about YOU!" },
  cat:   { greeting:"Heyyyy, I'm Luna! 🐱", line:"I'm a cool calm cat with lots of curiosity. I'm really glad we found each other!" },
  dog:   { greeting:"Woof! I'm Sunny! 🐶", line:"I'm the most loyal tail-wagging dog you'll ever meet and I'm your new best friend!" },
};

const buildSlides = (mascot, childName) => {
  const intro = MASCOT_INTROS[mascot.id] || MASCOT_INTROS.fox;
  const name  = mascot.name;
  return [
    { bg1:mascot.color+"55", bg2:mascot.bg, accent:mascot.color,
      title:intro.greeting, body:intro.line, tag:`Hi ${childName}! 👋` },
    { bg1:"#C5CAE9", bg2:"#EDE7F6", accent:"#7C4DFF",
      title:"Welcome to Bloomy!", tag:`${name} will be right here with you.`,
      body:`This is YOUR special place, ${childName}. Every day you can check in with your feelings, write in your journal, practise breathing, and grow our garden together!` },
    { bg1:"#FFE082", bg2:"#FFF9C4", accent:"#F9A825",
      title:"How are you feeling?", tag:`${name} always understands. 💛`,
      body:"Every day you tap a mood that matches how you feel inside. Happy, sad, worried, or anything in between — all feelings are welcome here!" },
    { bg1:"#B2EBF2", bg2:"#E0F7FA", accent:"#00ACC1",
      title:"Breathe with me", tag:`${name} will breathe with you. 🫧`,
      body:"When feelings get really big, our breathing exercise helps. Watch the bubble grow as you breathe in, pause when it holds, and shrink as you breathe out." },
    { bg1:"#B39DDB", bg2:"#EDE7F6", accent:"#7C4DFF",
      title:"Your secret journal", tag:`${name} loves your stories. 📓`,
      body:"Your journal is a safe place just for you. Happy thoughts, tricky days, funny stories — write anything! Your words are private." },
    { bg1:"#F48FB1", bg2:"#FCE4EC", accent:"#EC407A",
      title:"Kind words for you", tag:`${name} believes every single one. ⭐`,
      body:"Every day you get special affirmations — powerful, kind words about YOU. Swipe through them and feel how amazing you really are!" },
    { bg1:"#A5D6A7", bg2:"#E8F5E9", accent:"#43A047",
      title:"Earn seeds, grow your garden!", tag:`${name}'s garden grows when YOU grow! 🌿`,
      body:"Every time you log your mood, journal, breathe, or read affirmations you earn 🌱 Seeds! Seeds grow your garden from a tiny sprout to a magical Full Bloom!" },
    { bg1:"#FFD54F", bg2:"#FFF9C4", accent:"#F9A825",
      title:"Daily missions", tag:`${name} cheers you on every day! 🏆`,
      body:"Each day you get two special missions on your home screen. Finish them to earn bonus seeds! Look for the gold glow — that means you crushed it!" },
    { bg1:mascot.color+"44", bg2:mascot.bg, accent:mascot.color,
      title:`Let's go, ${childName}! 🎉`, tag:"Your adventure starts now!", isLast:true,
      body:`You and ${name} are officially a team. Check in every day, grow your garden, and remember — every feeling you have matters. ${name} is so excited to be your buddy!` },
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
        overflow:"hidden", // never scroll
      }}>

      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Baloo+2:wght@700;800;900&family=Poppins:wght@400;500;600;700&display=swap');
        @keyframes coInRight { from{opacity:0;transform:translateX(55px)} to{opacity:1;transform:translateX(0)} }
        @keyframes coInLeft  { from{opacity:0;transform:translateX(-55px)} to{opacity:1;transform:translateX(0)} }
        @keyframes coFloat   { 0%,100%{transform:translateY(0px)} 50%{transform:translateY(-10px)} }
        @keyframes coPulse   { 0%,100%{transform:scale(1)} 50%{transform:scale(1.05)} }
        @keyframes coFadeUp  { from{opacity:0;transform:translateY(16px)} to{opacity:1;transform:translateY(0)} }
      `}</style>

      {/* Progress dots */}
      <div style={{
        display:"flex", justifyContent:"center", gap:6,
        paddingTop:48, paddingBottom:0, flexShrink:0,
      }}>
        {slides.map((_,i) => (
          <div key={i} onClick={()=>goTo(i)} style={{
            width:i===step?24:7, height:7, borderRadius:50,
            background:i===step ? slide.accent : `${slide.accent}40`,
            cursor:"pointer",
            transition:"all 0.3s cubic-bezier(0.34,1.56,0.64,1)",
            boxShadow:i===step ? `0 2px 6px ${slide.accent}55` : "none",
          }}/>
        ))}
      </div>

      {/* Main content — fills all remaining space, no scroll */}
      <div
        key={animKey}
        style={{
          flex:1,
          display:"flex", flexDirection:"column",
          alignItems:"center", justifyContent:"space-between",
          padding:"8px 24px 28px",
          overflow:"hidden",
          animation:`${anim==="in-right"?"coInRight":"coInLeft"} 0.4s cubic-bezier(0.22,1,0.36,1) forwards`,
        }}>

        {/* Mascot — sized to fit without pushing content off */}
        <div style={{
          flexShrink:1, minHeight:0,
          display:"flex", alignItems:"center", justifyContent:"center",
          animation:"coFloat 3.2s ease-in-out infinite",
          filter:`drop-shadow(0 16px 30px ${mascot.color}55)`,
        }}>
          <FullBodyMascot id={mascot.id} size={170} stage={0}/>
        </div>

        {/* Text content */}
        <div style={{
          flexShrink:0,
          display:"flex", flexDirection:"column", alignItems:"center",
          width:"100%",
        }}>
          {/* Speech bubble */}
          <div style={{
            background:"rgba(255,255,255,0.82)",
            borderRadius:18, borderBottomLeftRadius:4,
            padding:"8px 18px", marginBottom:14,
            backdropFilter:"blur(10px)",
            boxShadow:"0 4px 16px rgba(0,0,0,0.07)",
            maxWidth:300,
            animation:"coFadeUp 0.35s 0.06s both",
          }}>
            <p style={{fontFamily:F.b, fontWeight:600, fontSize:13,
              color:slide.accent, margin:0, textAlign:"center", lineHeight:1.5}}>
              {slide.tag}
            </p>
          </div>

          {/* Title */}
          <h1 style={{
            fontFamily:F.h, fontWeight:900,
            fontSize:slide.title.length > 22 ? 22 : 26,
            color:"#2D2040", textAlign:"center",
            lineHeight:1.2, marginBottom:10, margin:"0 0 10px",
            animation:"coFadeUp 0.35s 0.1s both",
          }}>
            {slide.title}
          </h1>

          {/* Body */}
          <p style={{
            fontFamily:F.b, fontWeight:500, fontSize:14,
            color:"#2D2040", textAlign:"center",
            lineHeight:1.7, margin:"0 0 20px",
            maxWidth:310, opacity:0.82,
            animation:"coFadeUp 0.35s 0.14s both",
          }}>
            {slide.body}
          </p>

          {/* Swipe hint — first slide only */}
          {step === 0 && (
            <p style={{
              fontFamily:F.b, fontWeight:500, fontSize:12,
              color:`${slide.accent}88`, margin:"0 0 16px",
              animation:"coFadeUp 0.35s 0.22s both",
            }}>
              Swipe or tap Next to explore 👉
            </p>
          )}

          {/* Nav buttons — inline, part of the screen */}
          <div style={{
            display:"flex",
            justifyContent: step === 0 ? "center" : "space-between",
            alignItems:"center",
            width:"100%", maxWidth:340,
          }}>
            {step > 0 && (
              <button
                onClick={()=>navigate("prev")}
                style={{
                  background:"rgba(255,255,255,0.75)",
                  border:"1.5px solid rgba(0,0,0,0.07)",
                  borderRadius:50, padding:"11px 20px",
                  cursor:"pointer",
                  fontFamily:F.b, fontWeight:600, fontSize:14,
                  color:"#9B8DB5",
                  display:"flex", alignItems:"center", gap:5,
                  boxShadow:"0 2px 8px rgba(0,0,0,0.06)",
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

            <button
              onClick={()=>navigate("next")}
              style={{
                background: isLast
                  ? "linear-gradient(135deg,#43A047,#66BB6A)"
                  : `linear-gradient(135deg,${slide.accent},${slide.accent}cc)`,
                border:"none", borderRadius:50,
                padding: isLast ? "13px 26px" : "13px 26px",
                cursor:"pointer",
                fontFamily:F.h, fontWeight:900,
                fontSize: 15,
                color:"#fff",
                boxShadow: isLast
                  ? "0 8px 24px rgba(67,160,71,0.45)"
                  : `0 6px 18px ${slide.accent}44`,
                display:"flex", alignItems:"center", gap:8,
                animation: isLast ? "coPulse 1.6s ease-in-out infinite" : "none",
                transition:"transform 0.15s",
              }}
              onMouseDown={e=>e.currentTarget.style.transform="scale(0.96)"}
              onMouseUp={e=>e.currentTarget.style.transform="scale(1)"}>
              {isLast ? (
                <>Start Blooming</>
              ) : (
                <>Next
                  <svg viewBox="0 0 24 24" width={14} height={14} fill="none"
                    stroke="#fff" strokeWidth="2.5" strokeLinecap="round">
                    <path d="M5 12h14M12 5l7 7-7 7"/>
                  </svg>
                </>
              )}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
