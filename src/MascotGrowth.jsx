import { useState, useEffect } from "react";

/* ══════════════════════════════════════════════
   BLOOMY — MASCOT GROWTH SYSTEM
══════════════════════════════════════════════ */

const C = {
  purple:"#7C4DFF", pink:"#F06292", yellow:"#FFD54F",
  mint:"#4DB6AC", sky:"#4FC3F7", coral:"#FF7043",
  bg:"#F7F4FF", text:"#2D2040", muted:"#9B8DB5", border:"#EEE9FF",
};
const F = { h:"'Baloo 2', cursive", b:"'Poppins', sans-serif" };

/* ── Growth stages ── */
export const STAGES = [
  {
    id: 0, name: "Seedling", minScore: 0,
    desc: "Just starting to bloom!",
    color: "#A5D6A7", bg: "#E8F5E9",
    accessory: "none",
  },
  {
    id: 1, name: "Sprouting", minScore: 10,
    desc: "Growing stronger every day!",
    color: "#4DB6AC", bg: "#E0F2F1",
    accessory: "scarf",
  },
  {
    id: 2, name: "Blooming", minScore: 30,
    desc: "Confidence is blossoming!",
    color: "#7C4DFF", bg: "#EDE7F6",
    accessory: "crown",
  },
  {
    id: 3, name: "Thriving", minScore: 75,
    desc: "Truly shining inside and out!",
    color: "#F9A825", bg: "#FFF9C4",
    accessory: "glow",
  },
];

/* ── Score calculator ── */
export const calcGrowthScore = (child, moodLog, journals) => {
  const moodPoints      = (moodLog?.length || 0) * 1;
  const journalPoints   = (journals?.length || 0) * 2;
  const breathPoints    = (child?.breath_sessions || 0) * 2;
  const affirmPoints    = Math.floor((child?.affirm_count || 0) * 0.5);
  const streakBonus     = calcStreak(moodLog) >= 7 ? 5 : 0;
  return moodPoints + journalPoints + breathPoints + affirmPoints + streakBonus;
};

const calcStreak = (moodLog) => {
  if (!moodLog || moodLog.length === 0) return 0;
  const dates = [...new Set(moodLog.map(e => e.date))].sort().reverse();
  let streak = 0;
  const d = new Date();
  for (let i = 0; i < 100; i++) {
    const s = d.toISOString().split("T")[0];
    if (dates.includes(s)) streak++;
    else if (i > 0) break;
    d.setDate(d.getDate() - 1);
  }
  return streak;
};

export const getStage = (score) => {
  let stage = STAGES[0];
  for (const s of STAGES) {
    if (score >= s.minScore) stage = s;
  }
  return stage;
};

const nextStage = (score) => {
  for (const s of STAGES) {
    if (score < s.minScore) return s;
  }
  return null;
};

/* ══════════════════════════════════════════════
   MASCOT WITH GROWTH ACCESSORIES
   Usage: <GrowthMascot id="fox" size={64} stage={2} />
══════════════════════════════════════════════ */
export const GrowthMascot = ({ id, size = 64, stage = 0 }) => {
  const s = size;
  const vb = "0 0 80 80";

  /* ── Base mascot paths ── */
  const bases = {
    fox: <>
      <ellipse cx="40" cy="46" rx="28" ry="24" fill="#FF8A65"/>
      <polygon points="13,18 26,44 38,24" fill="#FF7043"/>
      <polygon points="67,18 54,44 42,24" fill="#FF7043"/>
      <ellipse cx="40" cy="50" rx="16" ry="11" fill="#FFCCBC"/>
      <circle cx="30" cy="41" r="5" fill="#fff"/>
      <circle cx="50" cy="41" r="5" fill="#fff"/>
      <circle cx="31" cy="42" r="2.5" fill="#1a1a2e"/>
      <circle cx="51" cy="42" r="2.5" fill="#1a1a2e"/>
      <circle cx="32" cy="41" r="1" fill="#fff"/>
      <circle cx="52" cy="41" r="1" fill="#fff"/>
      <ellipse cx="40" cy="53" rx="5" ry="3.5" fill="#EF5350"/>
      {stage >= 1
        ? <path d="M34 57 Q40 63 46 57" stroke="#333" strokeWidth="2" fill="none" strokeLinecap="round"/>
        : <path d="M36 56 Q40 60 44 56" stroke="#555" strokeWidth="1.8" fill="none" strokeLinecap="round"/>}
    </>,
    bunny: <>
      <ellipse cx="27" cy="20" rx="7" ry="17" fill="#F8BBD0"/>
      <ellipse cx="53" cy="20" rx="7" ry="17" fill="#F8BBD0"/>
      <ellipse cx="40" cy="50" rx="26" ry="22" fill="#FCE4EC"/>
      <ellipse cx="40" cy="55" rx="14" ry="10" fill="#F8BBD0"/>
      <circle cx="30" cy="46" r="5" fill="#fff"/>
      <circle cx="50" cy="46" r="5" fill="#fff"/>
      <circle cx="31" cy="47" r="2.5" fill="#1a1a2e"/>
      <circle cx="51" cy="47" r="2.5" fill="#1a1a2e"/>
      <circle cx="32" cy="46" r="1" fill="#fff"/>
      <circle cx="52" cy="46" r="1" fill="#fff"/>
      <ellipse cx="40" cy="57" rx="5" ry="3" fill="#F48FB1"/>
      {stage >= 1
        ? <path d="M34 61 Q40 67 46 61" stroke="#333" strokeWidth="2" fill="none" strokeLinecap="round"/>
        : <path d="M36 60 Q40 64 44 60" stroke="#555" strokeWidth="1.8" fill="none" strokeLinecap="round"/>}
    </>,
    bear: <>
      <circle cx="20" cy="25" r="13" fill="#A1887F"/>
      <circle cx="60" cy="25" r="13" fill="#A1887F"/>
      <ellipse cx="40" cy="50" rx="27" ry="23" fill="#8D6E63"/>
      <ellipse cx="40" cy="56" rx="16" ry="11" fill="#BCAAA4"/>
      <circle cx="29" cy="45" r="5.5" fill="#fff"/>
      <circle cx="51" cy="45" r="5.5" fill="#fff"/>
      <circle cx="30" cy="46" r="2.8" fill="#1a1a2e"/>
      <circle cx="52" cy="46" r="2.8" fill="#1a1a2e"/>
      <circle cx="31" cy="45" r="1.1" fill="#fff"/>
      <circle cx="53" cy="45" r="1.1" fill="#fff"/>
      <ellipse cx="40" cy="58" rx="5" ry="3.5" fill="#795548"/>
      {stage >= 1
        ? <path d="M34 62 Q40 68 46 62" stroke="#333" strokeWidth="2" fill="none" strokeLinecap="round"/>
        : <path d="M36 61 Q40 65 44 61" stroke="#555" strokeWidth="1.8" fill="none" strokeLinecap="round"/>}
    </>,
    owl: <>
      <ellipse cx="40" cy="48" rx="26" ry="26" fill="#7E57C2"/>
      <ellipse cx="40" cy="52" rx="18" ry="18" fill="#B39DDB"/>
      <ellipse cx="22" cy="24" rx="7" ry="9" fill="#7E57C2"/>
      <ellipse cx="58" cy="24" rx="7" ry="9" fill="#7E57C2"/>
      <circle cx="29" cy="43" r="9" fill="#fff"/>
      <circle cx="51" cy="43" r="9" fill="#fff"/>
      <circle cx="29" cy="44" r="5" fill="#4527A0"/>
      <circle cx="51" cy="44" r="5" fill="#4527A0"/>
      <circle cx="30" cy="43" r="2" fill="#fff"/>
      <circle cx="52" cy="43" r="2" fill="#fff"/>
      <polygon points="40,51 37,56 43,56" fill="#FFA726"/>
      {stage >= 1 && <path d="M34 60 Q40 65 46 60" stroke="#333" strokeWidth="2" fill="none" strokeLinecap="round"/>}
    </>,
    cat: <>
      <polygon points="17,30 12,10 30,26" fill="#26A69A"/>
      <polygon points="63,30 68,10 50,26" fill="#26A69A"/>
      <ellipse cx="40" cy="50" rx="26" ry="23" fill="#4DB6AC"/>
      <ellipse cx="40" cy="55" rx="15" ry="11" fill="#B2DFDB"/>
      <circle cx="29" cy="45" r="5.5" fill="#fff"/>
      <circle cx="51" cy="45" r="5.5" fill="#fff"/>
      <circle cx="30" cy="46" r="2.8" fill="#1a1a2e"/>
      <circle cx="52" cy="46" r="2.8" fill="#1a1a2e"/>
      <circle cx="31" cy="45" r="1.1" fill="#fff"/>
      <circle cx="53" cy="45" r="1.1" fill="#fff"/>
      <ellipse cx="40" cy="57" rx="5" ry="3" fill="#FF8A80"/>
      {stage >= 1
        ? <path d="M34 61 Q40 67 46 61" stroke="#333" strokeWidth="2" fill="none" strokeLinecap="round"/>
        : <path d="M36 60 Q40 64 44 60" stroke="#555" strokeWidth="1.8" fill="none" strokeLinecap="round"/>}
    </>,
    dog: <>
      <ellipse cx="16" cy="36" rx="9" ry="16" fill="#FFA726" transform="rotate(-20 16 36)"/>
      <ellipse cx="64" cy="36" rx="9" ry="16" fill="#FFA726" transform="rotate(20 64 36)"/>
      <ellipse cx="40" cy="50" rx="27" ry="23" fill="#FFB74D"/>
      <ellipse cx="40" cy="56" rx="17" ry="12" fill="#FFE0B2"/>
      <circle cx="29" cy="45" r="5.5" fill="#fff"/>
      <circle cx="51" cy="45" r="5.5" fill="#fff"/>
      <circle cx="30" cy="46" r="2.8" fill="#1a1a2e"/>
      <circle cx="52" cy="46" r="2.8" fill="#1a1a2e"/>
      <circle cx="31" cy="45" r="1.1" fill="#fff"/>
      <circle cx="53" cy="45" r="1.1" fill="#fff"/>
      <ellipse cx="40" cy="58" rx="6" ry="4" fill="#FF7043"/>
      {stage >= 1
        ? <path d="M34 63 Q40 69 46 63" stroke="#333" strokeWidth="2" fill="none" strokeLinecap="round"/>
        : <path d="M36 62 Q40 66 44 62" stroke="#555" strokeWidth="1.8" fill="none" strokeLinecap="round"/>}
    </>,
  };

  /* ── Stage accessories ── */
  const Scarf = () => (
    <g>
      <ellipse cx="40" cy="68" rx="20" ry="5" fill="#4FC3F7" opacity="0.9"/>
      <ellipse cx="40" cy="66" rx="20" ry="5" fill="#4FC3F7"/>
      <ellipse cx="52" cy="70" rx="5" ry="3" fill="#29B6F6"/>
      <ellipse cx="54" cy="73" rx="4" ry="2.5" fill="#29B6F6"/>
    </g>
  );

  const FlowerCrown = () => (
    <g>
      {/* Crown base */}
      <ellipse cx="40" cy="16" rx="22" ry="4" fill="#CE93D8" opacity="0.5"/>
      {/* Flowers */}
      {[20, 30, 40, 50, 60].map((x, i) => (
        <g key={i}>
          <circle cx={x} cy="13" r="4" fill={["#F48FB1","#FFD54F","#A5D6A7","#F48FB1","#FFD54F"][i]}/>
          <circle cx={x} cy="13" r="2" fill="#fff" opacity="0.6"/>
        </g>
      ))}
      {/* Leaves */}
      <ellipse cx="14" cy="16" rx="5" ry="3" fill="#81C784" transform="rotate(-30 14 16)"/>
      <ellipse cx="66" cy="16" rx="5" ry="3" fill="#81C784" transform="rotate(30 66 16)"/>
    </g>
  );

  const GlowEffect = () => (
    <g>
      {/* Outer glow rings */}
      <circle cx="40" cy="42" r="38" fill="none" stroke="#FFD54F" strokeWidth="2" opacity="0.3"/>
      <circle cx="40" cy="42" r="35" fill="none" stroke="#F9A825" strokeWidth="1.5" opacity="0.2"/>
      {/* Star sparkles */}
      {[
        {x:8,  y:10}, {x:72, y:10}, {x:5,  y:50},
        {x:75, y:50}, {x:20, y:76}, {x:60, y:76},
      ].map((p,i) => (
        <g key={i}>
          <line x1={p.x} y1={p.y-4} x2={p.x} y2={p.y+4} stroke="#FFD54F" strokeWidth="1.5" opacity="0.8"/>
          <line x1={p.x-4} y1={p.y} x2={p.x+4} y2={p.y} stroke="#FFD54F" strokeWidth="1.5" opacity="0.8"/>
        </g>
      ))}
      {/* Crown at top */}
      <polygon points="28,8 32,2 36,8 40,1 44,8 48,2 52,8" fill="#FFD54F" opacity="0.9"/>
    </g>
  );

  return (
    <svg width={s} height={s} viewBox={vb}>
      {stage === 3 && <GlowEffect/>}
      {bases[id] || bases.fox}
      {stage === 1 && <Scarf/>}
      {stage === 2 && <FlowerCrown/>}
      {stage === 3 && <FlowerCrown/>}
    </svg>
  );
};

/* ══════════════════════════════════════════════
   GROWTH PROGRESS BAR
   Shows on home screen below mascot card
══════════════════════════════════════════════ */
export const GrowthProgressBar = ({ score, onPress }) => {
  const stage    = getStage(score);
  const next     = nextStage(score);
  const progress = next
    ? Math.min(((score - stage.minScore) / (next.minScore - stage.minScore)) * 100, 100)
    : 100;

  return (
    <button onClick={onPress} style={{
      width:"100%", background:"#fff", borderRadius:20,
      padding:"16px 18px", border:`1.5px solid ${C.border}`,
      boxShadow:"0 2px 18px rgba(124,77,255,0.09)",
      marginBottom:14, cursor:"pointer", textAlign:"left",
      transition:"transform 0.15s",
    }}
      onMouseDown={e=>e.currentTarget.style.transform="scale(0.98)"}
      onMouseUp={e=>e.currentTarget.style.transform="scale(1)"}
    >
      <div style={{display:"flex",justifyContent:"space-between",
        alignItems:"center",marginBottom:10}}>
        <div>
          <p style={{fontFamily:F.h,fontWeight:800,fontSize:16,color:C.text,margin:0}}>
            {stage.name}
          </p>
          <p style={{fontFamily:F.b,fontWeight:500,fontSize:12,color:C.muted,margin:0}}>
            {next ? `${next.minScore - score} points to ${next.name}` : "Maximum stage reached!"}
          </p>
        </div>
        <div style={{background:stage.bg,borderRadius:50,padding:"4px 12px"}}>
          <p style={{fontFamily:F.b,fontWeight:700,fontSize:12,
            color:stage.color,margin:0}}>{score} pts</p>
        </div>
      </div>

      {/* Progress bar */}
      <div style={{background:"#F0EAFF",borderRadius:50,height:10,overflow:"hidden"}}>
        <div style={{
          height:"100%", borderRadius:50,
          background:`linear-gradient(90deg,${stage.color},${C.pink})`,
          width:`${progress}%`,
          transition:"width 0.6s ease",
        }}/>
      </div>

      {/* Stage dots */}
      <div style={{display:"flex",justifyContent:"space-between",marginTop:8}}>
        {STAGES.map(s=>(
          <div key={s.id} style={{display:"flex",flexDirection:"column",alignItems:"center",gap:3}}>
            <div style={{
              width:10,height:10,borderRadius:"50%",
              background:score>=s.minScore?s.color:"#ddd",
              border:`2px solid ${score>=s.minScore?s.color:"#eee"}`,
              transition:"all 0.3s",
            }}/>
            <p style={{fontFamily:F.b,fontSize:9,fontWeight:700,
              color:score>=s.minScore?s.color:C.muted,margin:0}}>
              {s.name}
            </p>
          </div>
        ))}
      </div>
    </button>
  );
};

/* ══════════════════════════════════════════════
   CELEBRATION SCREEN
   Show when child reaches a new stage
══════════════════════════════════════════════ */
export const GrowthCelebration = ({ mascotId, newStage, childName, onDismiss }) => {
  const stage = STAGES[newStage] || STAGES[0];
  const [show, setShow] = useState(false);

  useEffect(()=>{
    setTimeout(()=>setShow(true), 50);
  },[]);

  return (
    <div style={{
      position:"fixed",top:0,left:0,right:0,bottom:0,
      background:"rgba(0,0,0,0.6)",
      display:"flex",alignItems:"center",justifyContent:"center",
      zIndex:1000,padding:24,
      backdropFilter:"blur(4px)",
    }}>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Baloo+2:wght@700;800;900&family=Poppins:wght@400;500;600;700&display=swap');
        @keyframes popIn { from{opacity:0;transform:scale(0.7)} to{opacity:1;transform:scale(1)} }
        @keyframes floatStar { 0%,100%{transform:translateY(0) rotate(0deg)} 50%{transform:translateY(-12px) rotate(10deg)} }
        @keyframes confetti0 { 0%{transform:translateY(0) rotate(0deg);opacity:1} 100%{transform:translateY(300px) rotate(720deg);opacity:0} }
        @keyframes confetti1 { 0%{transform:translateY(0) rotate(45deg);opacity:1} 100%{transform:translateY(280px) rotate(-540deg);opacity:0} }
        @keyframes confetti2 { 0%{transform:translateY(0) rotate(90deg);opacity:1} 100%{transform:translateY(320px) rotate(630deg);opacity:0} }
      `}</style>

      <div style={{
        background:"#fff",borderRadius:28,padding:"36px 28px",
        textAlign:"center",maxWidth:360,width:"100%",
        animation:show?"popIn 0.4s cubic-bezier(0.34,1.56,0.64,1) forwards":"none",
        position:"relative",overflow:"hidden",
      }}>
        {/* Confetti */}
        {Array.from({length:16},(_,i)=>(
          <div key={i} style={{
            position:"absolute",
            top:-10,
            left:`${(i/16)*100}%`,
            width:8,height:8,
            borderRadius:i%2===0?"50%":2,
            background:["#FFD54F","#F06292","#7C4DFF","#4DB6AC","#FF7043"][i%5],
            animation:`confetti${i%3} ${1.5+Math.random()}s ${Math.random()*0.5}s ease-in forwards`,
          }}/>
        ))}

        {/* Stage badge */}
        <div style={{
          background:stage.bg,borderRadius:50,
          padding:"6px 18px",display:"inline-block",marginBottom:16,
        }}>
          <p style={{fontFamily:F.b,fontWeight:700,fontSize:12,
            color:stage.color,margin:0,letterSpacing:1,textTransform:"uppercase"}}>
            New Stage Unlocked!
          </p>
        </div>

        {/* Mascot */}
        <div style={{
          margin:"0 auto 20px",
          animation:"floatStar 2s ease-in-out infinite",
          display:"inline-block",
        }}>
          <GrowthMascot id={mascotId} size={100} stage={newStage}/>
        </div>

        <h2 style={{fontFamily:F.h,fontSize:30,fontWeight:900,
          color:stage.color,marginBottom:8}}>
          {stage.name}!
        </h2>

        <p style={{fontFamily:F.b,fontSize:17,fontWeight:600,
          color:"#2D2040",marginBottom:6}}>
          Amazing work, {childName}!
        </p>

        <p style={{fontFamily:F.b,fontSize:14,fontWeight:500,
          color:"#9B8DB5",marginBottom:24,lineHeight:1.6}}>
          {stage.desc} Your {mascotId} has grown — keep going!
        </p>

        {/* What changed */}
        <div style={{background:stage.bg,borderRadius:16,
          padding:"12px 16px",marginBottom:24,textAlign:"left"}}>
          <p style={{fontFamily:F.b,fontWeight:700,fontSize:12,
            color:stage.color,letterSpacing:1,textTransform:"uppercase",
            marginBottom:6}}>
            What's new
          </p>
          <p style={{fontFamily:F.b,fontSize:14,fontWeight:500,
            color:"#2D2040",margin:0}}>
            {newStage===1 && "Your buddy is now wearing a cozy scarf! Keep checking in to unlock more."}
            {newStage===2 && "Your buddy earned a beautiful flower crown! You should be so proud."}
            {newStage===3 && "Your buddy is glowing with a golden crown and sparkles! You reached the top!"}
          </p>
        </div>

        <button onClick={onDismiss} style={{
          background:`linear-gradient(135deg,${stage.color},${C.pink})`,
          border:"none",borderRadius:50,padding:"15px 40px",
          fontSize:16,fontWeight:700,fontFamily:F.b,
          color:"#fff",cursor:"pointer",
          boxShadow:`0 4px 20px ${stage.color}55`,
          width:"100%",
        }}>
          Keep Blooming!
        </button>
      </div>
    </div>
  );
};

export default { GrowthMascot, GrowthProgressBar, GrowthCelebration, calcGrowthScore, getStage, STAGES };
