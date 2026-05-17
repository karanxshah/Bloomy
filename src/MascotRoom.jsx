import { useState, useEffect, useRef, useCallback } from "react";
import { GrowthMascot, calcGrowthScore, getStage, STAGES } from "./MascotGrowth";

const C = {
  purple:"#7C4DFF", pink:"#F06292", yellow:"#FFD54F",
  mint:"#4DB6AC", sky:"#4FC3F7", coral:"#FF7043",
  bg:"#F7F4FF", text:"#2D2040", muted:"#9B8DB5", border:"#EEE9FF",
};
const F = { h:"'Baloo 2', cursive", b:"'Poppins', sans-serif" };

const FontLoader = () => (
  <style>{`
    @import url('https://fonts.googleapis.com/css2?family=Baloo+2:wght@700;800;900&family=Poppins:wght@400;500;600;700&display=swap');
    @keyframes floatMascot { 0%,100%{transform:translateY(0) rotate(-1deg)} 50%{transform:translateY(-14px) rotate(1deg)} }
    @keyframes bounce      { 0%,100%{transform:scale(1) translateY(0)} 30%{transform:scale(1.18) translateY(-16px)} 60%{transform:scale(0.95) translateY(0)} }
    @keyframes wiggle      { 0%,100%{transform:rotate(0deg)} 25%{transform:rotate(-12deg)} 75%{transform:rotate(12deg)} }
    @keyframes sparkleIn   { 0%{opacity:0;transform:scale(0) rotate(0deg)} 60%{opacity:1;transform:scale(1.3) rotate(180deg)} 100%{opacity:0;transform:scale(0) rotate(360deg)} }
    @keyframes fadeInUp    { from{opacity:0;transform:translateY(16px)} to{opacity:1;transform:translateY(0)} }
    @keyframes scaleIn     { from{opacity:0;transform:scale(0.88)} to{opacity:1;transform:scale(1)} }
    @keyframes bubblePop   { 0%{opacity:0;transform:scale(0.7) translateY(10px)} 70%{transform:scale(1.05) translateY(-2px)} 100%{opacity:1;transform:scale(1) translateY(0)} }
    @keyframes pulse       { 0%,100%{opacity:1} 50%{opacity:0.4} }
    @keyframes droop       { 0%,100%{transform:translateY(0)} 50%{transform:translateY(6px)} }
  `}</style>
);

/* ── Helpers ── */
const todayStr = () => new Date().toISOString().split("T")[0];
const randomFrom = (arr) => arr[Math.floor(Math.random() * arr.length)];
const daysSince = (dateStr) => {
  if (!dateStr) return 999;
  const diff = new Date(todayStr()) - new Date(dateStr);
  return Math.floor(diff / (1000 * 60 * 60 * 24));
};
const getMascotState = (lastMoodDate, lastMood) => {
  const days = daysSince(lastMoodDate);
  if (days === 0) {
    if (lastMood === "Sad") return "sad";
    if (lastMood === "Worried") return "worried";
    if (lastMood === "Angry") return "angry";
    return "happy";
  }
  if (days <= 1) return "away";
  return "droopy";
};
const getEnergyLevel = (child, moodLog, journals) => {
  const lastDate = moodLog?.slice(-1)[0]?.date;
  const days = daysSince(lastDate);
  const base = Math.min(100, calcGrowthScore(child, moodLog, journals) * 2);
  const decay = Math.min(base, days * 15);
  return Math.max(0, base - decay);
};

/* ── Personalities ── */
const PERSONALITIES = {
  fox:   { trait:"Adventurous and brave",  loves:"Exploring new feelings",   color:"#FF7043" },
  bunny: { trait:"Kind and gentle",        loves:"Making others smile",       color:"#EC407A" },
  bear:  { trait:"Calm and dependable",    loves:"Cosy breathing moments",    color:"#8D6E63" },
  owl:   { trait:"Wise and thoughtful",    loves:"Journaling deep thoughts",  color:"#7E57C2" },
  cat:   { trait:"Creative and curious",   loves:"Discovering new moods",     color:"#26A69A" },
  dog:   { trait:"Loyal and enthusiastic", loves:"Celebrating every win",     color:"#FFA726" },
};

/* ── Speech pools ── */
const SPEECH = {
  happy: [
    "You are doing so amazing!",
    "I love spending time with you!",
    "You make me so happy!",
    "You are braver than you know.",
    "Every day with you is special.",
    "You have the biggest heart!",
    "I am so proud of everything you do.",
    "You light up the whole room!",
    "Being your buddy is my favourite thing.",
    "You can do anything you set your mind to!",
  ],
  sad: [
    "I am right here with you.",
    "It is okay to feel sad sometimes.",
    "I care about you so much.",
    "You are never alone — I am always here.",
    "Even on hard days, you are wonderful.",
    "Let us take a deep breath together.",
    "Your feelings matter to me.",
    "I will always be your buddy, no matter what.",
  ],
  worried: [
    "You are safe. I am right here.",
    "Let us breathe together — in and out.",
    "Worries are like clouds — they pass.",
    "You are stronger than you feel right now.",
    "I believe in you completely.",
    "One small step at a time.",
  ],
  angry: [
    "It is okay to feel angry.",
    "Let us take a big breath together.",
    "Your feelings are always valid.",
    "I am here, no matter how you feel.",
    "Even when things are hard, I am with you.",
  ],
  away: [
    "I missed you so much!",
    "You are back! I am so happy!",
    "I was thinking about you!",
    "Welcome back — I saved your spot!",
    "Every time you come back makes me so happy!",
  ],
  general: [
    "Tap me again! I like it!",
    "Did you know you are amazing?",
    "Want to check your mood today?",
    "You are growing so much!",
    "I am so lucky to be your buddy.",
    "Keep going — you are doing great!",
    "Every check-in makes us both grow!",
    "You are my favourite person!",
  ],
  /* ── Changed to tap 3 and tap 6 ── */
  funny3:  "Okay okay, you found my tickle spot!",
  funny6:  "Stop it! You are making me laugh too much!",
};

/* ── Sparkle particle ── */
const Sparkle = ({ x, y, color, delay }) => (
  <div style={{
    position:"absolute", left:x, top:y,
    width:10, height:10, pointerEvents:"none",
    animation:`sparkleIn 0.7s ${delay}s ease-out forwards`,
    opacity:0, zIndex:20,
  }}>
    <svg viewBox="0 0 20 20" width={10} height={10}>
      <path d="M10 0 L11.5 8.5 L20 10 L11.5 11.5 L10 20 L8.5 11.5 L0 10 L8.5 8.5 Z" fill={color}/>
    </svg>
  </div>
);

/* ── Speech bubble ── */
const SpeechBubble = ({ text, onDone }) => {
  useEffect(()=>{
    const t = setTimeout(onDone, 3400);
    return ()=>clearTimeout(t);
  },[onDone]);

  return (
    <div style={{
      position:"absolute",
      bottom:"100%",
      left:"50%",
      transform:"translateX(-50%)",
      background:"#fff", borderRadius:20, padding:"13px 18px",
      boxShadow:"0 4px 24px rgba(124,77,255,0.18)",
      border:`2px solid ${C.border}`,
      minWidth:200, maxWidth:260, textAlign:"center",
      animation:"bubblePop 0.35s ease forwards",
      zIndex:30, marginBottom:12,
      whiteSpace:"normal",
    }}>
      <p style={{fontFamily:F.b,fontWeight:600,fontSize:14,
        color:C.text,margin:0,lineHeight:1.5}}>{text}</p>
      {/* Tail pointing down toward mascot */}
      <div style={{
        position:"absolute", bottom:-11, left:"50%",
        transform:"translateX(-50%)",
        width:0, height:0,
        borderLeft:"10px solid transparent",
        borderRight:"10px solid transparent",
        borderTop:`11px solid ${C.border}`,
      }}/>
      <div style={{
        position:"absolute", bottom:-8, left:"50%",
        transform:"translateX(-50%)",
        width:0, height:0,
        borderLeft:"8px solid transparent",
        borderRight:"8px solid transparent",
        borderTop:"8px solid #fff",
      }}/>
    </div>
  );
};

/* ── Energy bar ── */
const EnergyBar = ({ level }) => {
  const color = level > 60 ? C.mint : level > 30 ? C.yellow : C.coral;
  const label = level > 60 ? "Feeling great!" : level > 30 ? "Could use a check-in!" : "Needs some love!";
  return (
    <div>
      <div style={{display:"flex",justifyContent:"space-between",
        alignItems:"center",marginBottom:6}}>
        <p style={{fontFamily:F.b,fontWeight:700,fontSize:12,color:C.muted,
          letterSpacing:1.2,textTransform:"uppercase",margin:0}}>
          Emotional Energy
        </p>
        <p style={{fontFamily:F.b,fontWeight:700,fontSize:12,color,margin:0}}>{label}</p>
      </div>
      <div style={{background:"#F0EAFF",borderRadius:50,height:12,overflow:"hidden"}}>
        <div style={{
          height:"100%",borderRadius:50,
          background:`linear-gradient(90deg,${color},${C.pink})`,
          width:`${level}%`,
          transition:"width 1.2s ease",
        }}/>
      </div>
      <div style={{display:"flex",gap:4,marginTop:6}}>
        {Array.from({length:5},(_,i)=>(
          <div key={i} style={{flex:1,height:4,borderRadius:50,
            background:i < Math.ceil(level/20) ? color : "#EEE9FF",
            transition:"background 0.5s"}}/>
        ))}
      </div>
    </div>
  );
};

/* ── Stage evolution ── */
const StageEvolution = ({ currentScore, mascotId }) => (
  <div style={{background:"#fff",borderRadius:20,padding:"20px",
    boxShadow:"0 2px 18px rgba(124,77,255,0.09)",marginBottom:14}}>
    <p style={{fontFamily:F.b,fontWeight:700,fontSize:12,color:C.muted,
      letterSpacing:1.2,textTransform:"uppercase",margin:"0 0 16px"}}>
      Growth Journey
    </p>
    <div style={{display:"flex",justifyContent:"space-between",alignItems:"flex-end",gap:8}}>
      {STAGES.map((stage,i)=>{
        const unlocked = currentScore >= stage.minScore;
        return (
          <div key={stage.id} style={{flex:1,textAlign:"center",
            opacity:unlocked?1:0.35,transition:"opacity 0.4s"}}>
            <div style={{
              background:unlocked?stage.bg:"#f5f5f5",
              borderRadius:16,padding:"10px 4px",
              border:`2px solid ${unlocked?stage.color:"#eee"}`,
              marginBottom:6,
            }}>
              <GrowthMascot id={mascotId} size={44} stage={i}/>
            </div>
            <p style={{fontFamily:F.h,fontWeight:800,fontSize:11,
              color:unlocked?stage.color:C.muted,margin:0}}>
              {stage.name}
            </p>
            {!unlocked && (
              <p style={{fontFamily:F.b,fontWeight:500,fontSize:10,
                color:C.muted,margin:0}}>{stage.minScore} pts</p>
            )}
            {unlocked && (
              <div style={{width:8,height:8,borderRadius:"50%",
                background:stage.color,margin:"4px auto 0"}}/>
            )}
          </div>
        );
      })}
    </div>
  </div>
);

/* ══════════════════════════════════════════════
   MAIN EXPORT
══════════════════════════════════════════════ */
export default function MascotRoom({ activeChild, moodLog, journals, onClose }) {
  /* ── Derived constants (stable, no hooks) ── */
  const cm = {
    id:    activeChild.mascot_id,
    name:  activeChild.mascot_name,
    color: activeChild.mascot_color,
    bg:    activeChild.mascot_bg,
  };
  const personality  = PERSONALITIES[cm.id] || PERSONALITIES.fox;
  const score        = calcGrowthScore(activeChild, moodLog, journals);
  const stage        = getStage(score);
  const energy       = getEnergyLevel(activeChild, moodLog, journals);
  const lastMoodEntry= moodLog?.length > 0 ? moodLog[moodLog.length - 1] : null;
  const lastMood     = lastMoodEntry?.mood || null;
  const lastMoodDate = lastMoodEntry?.date || null;
  const mascotState  = getMascotState(lastMoodDate, lastMood);
  const daysAway     = daysSince(lastMoodDate);
  const joinedDate   = activeChild.created_at?.split("T")[0] || null;
  const daysTogether = joinedDate
    ? Math.max(0, Math.floor((new Date(todayStr()) - new Date(joinedDate)) / (1000*60*60*24)))
    : 0;
  const topMood = moodLog.length > 0
    ? Object.entries(
        moodLog.reduce((acc,e)=>({...acc,[e.mood]:(acc[e.mood]||0)+1}),{})
      ).sort((a,b)=>b[1]-a[1])[0][0]
    : null;

  /* ── State ── */
  const [speech,setSpeech]             = useState(null);
  const [tapAnim,setTapAnim]           = useState("float");
  const [sparkles,setSparkles]         = useState([]);
  const [tapCount,setTapCount]         = useState(0);
  const [showStats,setShowStats]       = useState(false);
  const [showEvolution,setShowEvolution] = useState(false);
  const tapTimeout   = useRef(null);
  const animTimeout  = useRef(null);
  const sparkleTimeout = useRef(null);

  /* ── Cleanup on unmount ── */
  useEffect(()=>{
    return ()=>{
      if (tapTimeout.current)    clearTimeout(tapTimeout.current);
      if (animTimeout.current)   clearTimeout(animTimeout.current);
      if (sparkleTimeout.current) clearTimeout(sparkleTimeout.current);
    };
  },[]);

  /* ── Greeting on open ── */
  useEffect(()=>{
    const t = setTimeout(()=>{
      if (daysAway >= 2)           setSpeech(randomFrom(SPEECH.away));
      else if (lastMood==="Sad")   setSpeech(randomFrom(SPEECH.sad));
      else if (lastMood==="Worried") setSpeech(randomFrom(SPEECH.worried));
      else if (lastMood==="Angry") setSpeech(randomFrom(SPEECH.angry));
      else                         setSpeech(randomFrom(SPEECH.happy));
    }, 700);
    return ()=>clearTimeout(t);
  // eslint-disable-next-line react-hooks/exhaustive-deps
  },[]);

  /* ── Dismiss speech ── */
  const dismissSpeech = useCallback(()=>setSpeech(null),[]);

  /* ── Tap handler ── */
  const handleMascotTap = () => {
    const newCount = tapCount + 1;
    setTapCount(newCount);

    /* Animation */
    const anims = ["bounce","wiggle","bounce","wiggle","bounce"];
    setTapAnim(anims[newCount % anims.length]);
    if (animTimeout.current) clearTimeout(animTimeout.current);
    animTimeout.current = setTimeout(()=>setTapAnim("float"), 520);

    /* Sparkles */
    const newSparkles = Array.from({length:7},(_,i)=>({
      id: Date.now()+i,
      x: 40 + Math.random()*120,
      y: 10 + Math.random()*120,
      color:[C.purple,C.pink,C.yellow,C.mint,C.sky,C.coral,"#fff"][i],
      delay: i*0.055,
    }));
    setSparkles(newSparkles);
    if (sparkleTimeout.current) clearTimeout(sparkleTimeout.current);
    sparkleTimeout.current = setTimeout(()=>setSparkles([]),950);

    /* Speech — tap 3 and tap 6 are the special ones */
    if (tapTimeout.current) clearTimeout(tapTimeout.current);
    tapTimeout.current = setTimeout(()=>{
      if (newCount === 3) {
        setSpeech(SPEECH.funny3);
      } else if (newCount === 6) {
        setSpeech(SPEECH.funny6);
      } else if (lastMood==="Sad") {
        setSpeech(randomFrom(SPEECH.sad));
      } else if (lastMood==="Worried") {
        setSpeech(randomFrom(SPEECH.worried));
      } else if (lastMood==="Angry") {
        setSpeech(randomFrom(SPEECH.angry));
      } else {
        setSpeech(randomFrom([...SPEECH.happy,...SPEECH.general]));
      }
    }, 120);
  };

  /* ── Background by state ── */
  const bgGrad = {
    happy:   `linear-gradient(160deg,${cm.color}44 0%,${C.pink}22 100%)`,
    droopy:  `linear-gradient(160deg,#B0BEC555 0%,#CFD8DC33 100%)`,
    away:    `linear-gradient(160deg,${C.purple}22 0%,${C.mint}22 100%)`,
    sad:     `linear-gradient(160deg,#7B1FA222 0%,#9C27B022 100%)`,
    worried: `linear-gradient(160deg,#E64A1922 0%,#FF704322 100%)`,
    angry:   `linear-gradient(160deg,#E5393522 0%,#FF526222 100%)`,
  }[mascotState] || `linear-gradient(160deg,${cm.color}44 0%,${C.pink}22 100%)`;

  /* ── Mascot animation ── */
  const mascotAnim = {
    float:  "floatMascot 3s ease-in-out infinite",
    bounce: "bounce 0.5s ease forwards",
    wiggle: "wiggle 0.4s ease forwards",
    droop:  "droop 2.5s ease-in-out infinite",
  }[mascotState==="droopy" ? "droop" : tapAnim];

  return (
    <div style={{
      position:"fixed",top:0,left:0,right:0,bottom:0,
      background:bgGrad,zIndex:500,fontFamily:F.b,
      overflowY:"auto",WebkitOverflowScrolling:"touch",
    }}>
      <FontLoader/>

      {/* Sticky header */}
      <div style={{
        display:"flex",justifyContent:"space-between",alignItems:"center",
        padding:"52px 24px 14px",
        background:"rgba(255,255,255,0.65)",
        backdropFilter:"blur(10px)",
        position:"sticky",top:0,zIndex:20,
      }}>
        <button onClick={onClose} style={{
          background:"rgba(255,255,255,0.9)",border:`1.5px solid ${C.border}`,
          borderRadius:50,padding:"8px 16px",cursor:"pointer",
          display:"flex",alignItems:"center",gap:6,
          color:C.muted,fontFamily:F.b,fontWeight:600,fontSize:14}}>
          <svg viewBox="0 0 24 24" width={16} height={16} fill="none"
            stroke={C.muted} strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
            <path d="M19 12H5M12 5l-7 7 7 7"/>
          </svg>
          Back
        </button>
        <h2 style={{fontFamily:F.h,fontSize:22,fontWeight:900,color:C.text,margin:0}}>
          {cm.name}'s Room
        </h2>
        <div style={{width:70}}/>
      </div>

      <div style={{padding:"0 24px 48px",maxWidth:430,margin:"0 auto"}}>

        {/* Stage badge */}
        <div style={{textAlign:"center",marginTop:16,marginBottom:8}}>
          <div style={{background:stage.bg,borderRadius:50,
            padding:"5px 16px",display:"inline-block"}}>
            <p style={{fontFamily:F.b,fontWeight:700,fontSize:12,
              color:stage.color,margin:0,letterSpacing:1,textTransform:"uppercase"}}>
              {stage.name} · {score} pts
            </p>
          </div>
        </div>

        {/* Interactive mascot area */}
        <div style={{
          position:"relative",textAlign:"center",
          padding:"60px 0 16px",marginBottom:8,
          minHeight:220,
        }}>
          {/* Speech bubble — above the mascot */}
          {speech && (
            <SpeechBubble text={speech} onDone={dismissSpeech}/>
          )}

          {/* Mascot */}
          <div
            onClick={handleMascotTap}
            style={{
              display:"inline-block",cursor:"pointer",
              position:"relative",userSelect:"none",
              animation:mascotAnim,
            }}>
            <GrowthMascot id={cm.id} size={160} stage={stage.id}/>
            {/* Sparkles */}
            {sparkles.map(sp=>(
              <Sparkle key={sp.id} x={sp.x} y={sp.y} color={sp.color} delay={sp.delay}/>
            ))}
            {/* Droopy badge */}
            {mascotState==="droopy" && (
              <div style={{
                position:"absolute",top:4,right:-4,
                background:"#EEE9FF",borderRadius:50,padding:"4px 10px",
              }}>
                <p style={{fontFamily:F.b,fontSize:11,fontWeight:700,
                  color:C.purple,margin:0,animation:"pulse 2s infinite"}}>
                  Miss you!
                </p>
              </div>
            )}
          </div>

          <p style={{fontFamily:F.b,fontWeight:500,fontSize:13,
            color:C.muted,marginTop:14,margin:"14px 0 0"}}>
            Tap {cm.name} to say hi!
          </p>
        </div>

        {/* Droopy message */}
        {mascotState==="droopy" && (
          <div style={{background:"#EEE9FF",borderRadius:20,padding:"14px 18px",
            marginBottom:14,textAlign:"center",animation:"fadeInUp 0.4s ease"}}>
            <p style={{fontFamily:F.h,fontWeight:800,fontSize:16,
              color:C.purple,margin:"0 0 4px"}}>
              {cm.name} missed you!
            </p>
            <p style={{fontFamily:F.b,fontWeight:500,fontSize:14,
              color:C.muted,margin:0,lineHeight:1.6}}>
              You haven't checked in for {daysAway} day{daysAway!==1?"s":""}.
              Log your mood to restore {cm.name}'s energy!
            </p>
          </div>
        )}

        {/* Today's mood message */}
        {lastMood && lastMoodDate===todayStr() && (
          <div style={{
            background: lastMood==="Sad"||lastMood==="Worried"||lastMood==="Angry"
              ? "#EDE7F6" : "#E8F5E9",
            borderRadius:20,padding:"14px 18px",
            marginBottom:14,textAlign:"center",animation:"fadeInUp 0.4s ease",
          }}>
            <p style={{fontFamily:F.h,fontWeight:800,fontSize:16,
              color: lastMood==="Sad"||lastMood==="Worried"||lastMood==="Angry"
                ? C.purple : "#43A047",
              margin:"0 0 4px"}}>
              {cm.name} knows how you feel today!
            </p>
            <p style={{fontFamily:F.b,fontWeight:500,fontSize:14,
              color:"#555",margin:0,lineHeight:1.6}}>
              You logged feeling <strong>{lastMood}</strong>.{" "}
              {lastMood==="Sad"||lastMood==="Worried"||lastMood==="Angry"
                ? `${cm.name} is right here with you.`
                : `${cm.name} is so happy for you!`}
            </p>
          </div>
        )}

        {/* Energy bar */}
        <div style={{background:"#fff",borderRadius:20,padding:"18px 20px",
          boxShadow:"0 2px 18px rgba(124,77,255,0.09)",marginBottom:14}}>
          <EnergyBar level={energy}/>
          <p style={{fontFamily:F.b,fontWeight:500,fontSize:13,
            color:C.muted,margin:"12px 0 0",textAlign:"center",lineHeight:1.6}}>
            {energy < 30
              ? `Log a mood or journal entry to boost ${cm.name}'s energy!`
              : energy < 60
              ? `Keep checking in to keep ${cm.name} thriving!`
              : `${cm.name} is full of energy — keep it up!`}
          </p>
        </div>

        {/* Personality card */}
        <div style={{
          background:`linear-gradient(135deg,${cm.color},${C.pink})`,
          borderRadius:20,padding:"20px",marginBottom:14,
        }}>
          <p style={{fontFamily:F.b,fontWeight:700,fontSize:12,
            color:"rgba(255,255,255,0.7)",letterSpacing:1.2,
            textTransform:"uppercase",margin:"0 0 8px"}}>
            Personality
          </p>
          <p style={{fontFamily:F.h,fontWeight:800,fontSize:20,
            color:"#fff",margin:"0 0 4px"}}>{personality.trait}</p>
          <p style={{fontFamily:F.b,fontWeight:500,fontSize:14,
            color:"rgba(255,255,255,0.85)",margin:0}}>
            Loves: {personality.loves}
          </p>
        </div>

        {/* Our Journey accordion */}
        <button onClick={()=>setShowStats(s=>!s)} style={{
          width:"100%",background:"#fff",borderRadius:20,padding:"18px 20px",
          border:`1.5px solid ${C.border}`,marginBottom:showStats?0:14,cursor:"pointer",
          display:"flex",justifyContent:"space-between",alignItems:"center",
          boxShadow:"0 2px 18px rgba(124,77,255,0.09)",
          borderBottomLeftRadius:showStats?0:20,
          borderBottomRightRadius:showStats?0:20,
          transition:"border-radius 0.2s",
        }}>
          <p style={{fontFamily:F.h,fontWeight:800,fontSize:18,color:C.text,margin:0}}>
            Our Journey
          </p>
          <svg viewBox="0 0 24 24" width={20} height={20} fill="none"
            stroke={C.muted} strokeWidth="2.2" strokeLinecap="round"
            style={{transform:showStats?"rotate(180deg)":"rotate(0deg)",transition:"transform 0.3s"}}>
            <path d="M6 9l6 6 6-6"/>
          </svg>
        </button>

        {showStats && (
          <div style={{background:"#fff",borderRadius:"0 0 20px 20px",padding:"4px 20px 20px",
            boxShadow:"0 4px 18px rgba(124,77,255,0.09)",marginBottom:14,
            animation:"scaleIn 0.25s ease"}}>
            {[
              {label:"Days together",      value:`${daysTogether}d`,             color:C.purple},
              {label:"Mood check-ins",     value:moodLog.length,                 color:C.mint},
              {label:"Journal entries",    value:journals.length,                color:C.pink},
              {label:"Breathing sessions", value:activeChild.breath_sessions||0, color:C.sky},
              {label:"Affirmations read",  value:activeChild.affirm_count||0,    color:C.coral},
              {label:"Growth points",      value:score,                          color:C.yellow},
              {label:"Favourite mood",     value:topMood||"None yet",            color:C.purple},
            ].map((s,i,arr)=>(
              <div key={s.label} style={{
                display:"flex",justifyContent:"space-between",alignItems:"center",
                padding:"10px 0",
                borderBottom:i<arr.length-1?"1px solid #F0EAFF":"none",
              }}>
                <p style={{fontFamily:F.b,fontWeight:600,fontSize:15,
                  color:C.text,margin:0}}>{s.label}</p>
                <p style={{fontFamily:F.h,fontWeight:900,fontSize:20,
                  color:s.color,margin:0}}>{s.value}</p>
              </div>
            ))}
          </div>
        )}

        {/* Growth stages accordion */}
        <button onClick={()=>setShowEvolution(s=>!s)} style={{
          width:"100%",background:"#fff",borderRadius:20,padding:"18px 20px",
          border:`1.5px solid ${C.border}`,marginBottom:showEvolution?0:14,cursor:"pointer",
          display:"flex",justifyContent:"space-between",alignItems:"center",
          boxShadow:"0 2px 18px rgba(124,77,255,0.09)",
          borderBottomLeftRadius:showEvolution?0:20,
          borderBottomRightRadius:showEvolution?0:20,
          transition:"border-radius 0.2s",
        }}>
          <p style={{fontFamily:F.h,fontWeight:800,fontSize:18,color:C.text,margin:0}}>
            Growth Stages
          </p>
          <svg viewBox="0 0 24 24" width={20} height={20} fill="none"
            stroke={C.muted} strokeWidth="2.2" strokeLinecap="round"
            style={{transform:showEvolution?"rotate(180deg)":"rotate(0deg)",transition:"transform 0.3s"}}>
            <path d="M6 9l6 6 6-6"/>
          </svg>
        </button>

        {showEvolution && (
          <div style={{animation:"scaleIn 0.25s ease",marginBottom:14}}>
            <StageEvolution currentScore={score} mascotId={cm.id}/>
          </div>
        )}

        {/* Did you know */}
        <div style={{background:"#F7F4FF",borderRadius:20,padding:"18px 20px",
          border:`1.5px solid ${C.border}`}}>
          <p style={{fontFamily:F.b,fontWeight:700,fontSize:12,color:C.muted,
            letterSpacing:1.2,textTransform:"uppercase",margin:"0 0 8px"}}>
            Did you know?
          </p>
          <p style={{fontFamily:F.b,fontWeight:500,fontSize:14,
            color:C.text,margin:0,lineHeight:1.75}}>
            {cm.name} grows stronger every time you check in.
            The more you share your feelings, the more you both bloom together!
          </p>
        </div>

      </div>
    </div>
  );
}
