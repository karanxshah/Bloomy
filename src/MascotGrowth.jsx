import { useState, useEffect } from "react";

const C = {
  purple:"#7C4DFF", pink:"#F06292", yellow:"#FFD54F",
  mint:"#4DB6AC", sky:"#4FC3F7", coral:"#FF7043",
  bg:"#F7F4FF", text:"#2D2040", muted:"#9B8DB5", border:"#EEE9FF",
};
const F = { h:"'Baloo 2', cursive", b:"'Poppins', sans-serif" };

/* ══════════════════════════════════════════════
   7 GARDEN STAGES — seeds based
══════════════════════════════════════════════ */
export const STAGES = [
  { id:0, name:"Seedling",    minScore:0,   desc:"Your garden journey begins!",          color:"#A5D6A7", bg:"#E8F5E9",  accessory:"none"   },
  { id:1, name:"Sprouting",   minScore:15,  desc:"Little shoots are appearing!",         color:"#4DB6AC", bg:"#E0F2F1",  accessory:"leaf"   },
  { id:2, name:"Blooming",    minScore:35,  desc:"Your first flowers are blooming!",     color:"#7C4DFF", bg:"#EDE7F6",  accessory:"crown"  },
  { id:3, name:"Flourishing", minScore:70,  desc:"Your garden is full of life!",         color:"#FF7043", bg:"#FFF3E0",  accessory:"double" },
  { id:4, name:"Thriving",    minScore:120, desc:"A lush garden surrounds you!",         color:"#F9A825", bg:"#FFF9C4",  accessory:"glow"   },
  { id:5, name:"Blossoming",  minScore:180, desc:"Magic fills your enchanted garden!",   color:"#EC407A", bg:"#FCE4EC",  accessory:"halo"   },
  { id:6, name:"Full Bloom",  minScore:260, desc:"Your garden has reached its peak!",    color:"#FFD54F", bg:"#FFFDE7",  accessory:"legend" },
];

/* ── Seed calculator ── */
export const calcGrowthScore = (child, moodLog, journals, gratitudes) => {
  const moodSeeds      = (moodLog?.length || 0) * 1;
  const journalSeeds   = (journals?.length || 0) * 2;
  const breathSeeds    = (child?.breath_sessions || 0) * 2;
  const affirmSeeds    = Math.floor((child?.affirm_count || 0) * 0.5);
  const gratitudeSeeds = (gratitudes?.length || 0) * 1;
  const streakBonus    = calcStreak(moodLog) >= 7 ? 5 : 0;
  const missionBonus   = (child?.missions_completed || 0) * 3;
  return moodSeeds + journalSeeds + breathSeeds + affirmSeeds + gratitudeSeeds + streakBonus + missionBonus;
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
  for (const s of STAGES) { if (score >= s.minScore) stage = s; }
  return stage;
};

const nextStage = (score) => {
  for (const s of STAGES) { if (score < s.minScore) return s; }
  return null;
};

/* ══════════════════════════════════════════════
   GARDEN SCENE — evolves per stage
══════════════════════════════════════════════ */
export const GrowthMascot = ({ id, size = 64, stage = 0 }) => {
  const s = size;
  const vb = "0 0 80 80";

  const bases = {
    fox: <>
      <ellipse cx="40" cy="46" rx="28" ry="24" fill="#FF8A65"/>
      <polygon points="13,18 26,44 38,24" fill="#FF7043"/>
      <polygon points="67,18 54,44 42,24" fill="#FF7043"/>
      <ellipse cx="40" cy="50" rx="16" ry="11" fill="#FFCCBC"/>
      <circle cx="30" cy="41" r="5" fill="#fff"/><circle cx="50" cy="41" r="5" fill="#fff"/>
      <circle cx="31" cy="42" r="2.5" fill="#1a1a2e"/><circle cx="51" cy="42" r="2.5" fill="#1a1a2e"/>
      <circle cx="32" cy="41" r="1" fill="#fff"/><circle cx="52" cy="41" r="1" fill="#fff"/>
      <ellipse cx="40" cy="53" rx="5" ry="3.5" fill="#EF5350"/>
      {stage>=1?<path d="M34 57 Q40 63 46 57" stroke="#333" strokeWidth="2" fill="none" strokeLinecap="round"/>
               :<path d="M36 56 Q40 60 44 56" stroke="#555" strokeWidth="1.8" fill="none" strokeLinecap="round"/>}
    </>,
    bunny: <>
      <ellipse cx="27" cy="20" rx="7" ry="17" fill="#F8BBD0"/>
      <ellipse cx="53" cy="20" rx="7" ry="17" fill="#F8BBD0"/>
      <ellipse cx="40" cy="50" rx="26" ry="22" fill="#FCE4EC"/>
      <ellipse cx="40" cy="55" rx="14" ry="10" fill="#F8BBD0"/>
      <circle cx="30" cy="46" r="5" fill="#fff"/><circle cx="50" cy="46" r="5" fill="#fff"/>
      <circle cx="31" cy="47" r="2.5" fill="#1a1a2e"/><circle cx="51" cy="47" r="2.5" fill="#1a1a2e"/>
      <circle cx="32" cy="46" r="1" fill="#fff"/><circle cx="52" cy="46" r="1" fill="#fff"/>
      <ellipse cx="40" cy="57" rx="5" ry="3" fill="#F48FB1"/>
      {stage>=1?<path d="M34 61 Q40 67 46 61" stroke="#333" strokeWidth="2" fill="none" strokeLinecap="round"/>
               :<path d="M36 60 Q40 64 44 60" stroke="#555" strokeWidth="1.8" fill="none" strokeLinecap="round"/>}
    </>,
    bear: <>
      <circle cx="20" cy="25" r="13" fill="#A1887F"/><circle cx="60" cy="25" r="13" fill="#A1887F"/>
      <ellipse cx="40" cy="50" rx="27" ry="23" fill="#8D6E63"/>
      <ellipse cx="40" cy="56" rx="16" ry="11" fill="#BCAAA4"/>
      <circle cx="29" cy="45" r="5.5" fill="#fff"/><circle cx="51" cy="45" r="5.5" fill="#fff"/>
      <circle cx="30" cy="46" r="2.8" fill="#1a1a2e"/><circle cx="52" cy="46" r="2.8" fill="#1a1a2e"/>
      <circle cx="31" cy="45" r="1.1" fill="#fff"/><circle cx="53" cy="45" r="1.1" fill="#fff"/>
      <ellipse cx="40" cy="58" rx="5" ry="3.5" fill="#795548"/>
      {stage>=1?<path d="M34 62 Q40 68 46 62" stroke="#333" strokeWidth="2" fill="none" strokeLinecap="round"/>
               :<path d="M36 61 Q40 65 44 61" stroke="#555" strokeWidth="1.8" fill="none" strokeLinecap="round"/>}
    </>,
    owl: <>
      <ellipse cx="40" cy="48" rx="26" ry="26" fill="#7E57C2"/>
      <ellipse cx="40" cy="52" rx="18" ry="18" fill="#B39DDB"/>
      <ellipse cx="22" cy="24" rx="7" ry="9" fill="#7E57C2"/>
      <ellipse cx="58" cy="24" rx="7" ry="9" fill="#7E57C2"/>
      <circle cx="29" cy="43" r="9" fill="#fff"/><circle cx="51" cy="43" r="9" fill="#fff"/>
      <circle cx="29" cy="44" r="5" fill="#4527A0"/><circle cx="51" cy="44" r="5" fill="#4527A0"/>
      <circle cx="30" cy="43" r="2" fill="#fff"/><circle cx="52" cy="43" r="2" fill="#fff"/>
      <polygon points="40,51 37,56 43,56" fill="#FFA726"/>
      {stage>=1&&<path d="M34 60 Q40 65 46 60" stroke="#333" strokeWidth="2" fill="none" strokeLinecap="round"/>}
    </>,
    cat: <>
      <polygon points="17,30 12,10 30,26" fill="#26A69A"/>
      <polygon points="63,30 68,10 50,26" fill="#26A69A"/>
      <ellipse cx="40" cy="50" rx="26" ry="23" fill="#4DB6AC"/>
      <ellipse cx="40" cy="55" rx="15" ry="11" fill="#B2DFDB"/>
      <circle cx="29" cy="45" r="5.5" fill="#fff"/><circle cx="51" cy="45" r="5.5" fill="#fff"/>
      <circle cx="30" cy="46" r="2.8" fill="#1a1a2e"/><circle cx="52" cy="46" r="2.8" fill="#1a1a2e"/>
      <circle cx="31" cy="45" r="1.1" fill="#fff"/><circle cx="53" cy="45" r="1.1" fill="#fff"/>
      <ellipse cx="40" cy="57" rx="5" ry="3" fill="#FF8A80"/>
      {stage>=1?<path d="M34 61 Q40 67 46 61" stroke="#333" strokeWidth="2" fill="none" strokeLinecap="round"/>
               :<path d="M36 60 Q40 64 44 60" stroke="#555" strokeWidth="1.8" fill="none" strokeLinecap="round"/>}
    </>,
    dog: <>
      <ellipse cx="16" cy="36" rx="9" ry="16" fill="#FFA726" transform="rotate(-20 16 36)"/>
      <ellipse cx="64" cy="36" rx="9" ry="16" fill="#FFA726" transform="rotate(20 64 36)"/>
      <ellipse cx="40" cy="50" rx="27" ry="23" fill="#FFB74D"/>
      <ellipse cx="40" cy="56" rx="17" ry="12" fill="#FFE0B2"/>
      <circle cx="29" cy="45" r="5.5" fill="#fff"/><circle cx="51" cy="45" r="5.5" fill="#fff"/>
      <circle cx="30" cy="46" r="2.8" fill="#1a1a2e"/><circle cx="52" cy="46" r="2.8" fill="#1a1a2e"/>
      <circle cx="31" cy="45" r="1.1" fill="#fff"/><circle cx="53" cy="45" r="1.1" fill="#fff"/>
      <ellipse cx="40" cy="58" rx="6" ry="4" fill="#FF7043"/>
      {stage>=1?<path d="M34 63 Q40 69 46 63" stroke="#333" strokeWidth="2" fill="none" strokeLinecap="round"/>
               :<path d="M36 62 Q40 66 44 62" stroke="#555" strokeWidth="1.8" fill="none" strokeLinecap="round"/>}
    </>,
  };

  const LeafCrown = () => (
    <g>
      {[-20,-10,0,10,20].map((x,i)=>(
        <ellipse key={i} cx={40+x} cy={14} rx={5} ry={8}
          fill="#66BB6A" transform={`rotate(${x*1.5} ${40+x} 14)`} opacity="0.9"/>
      ))}
    </g>
  );

  const FlowerCrown = () => (
    <g>
      <ellipse cx="40" cy="16" rx="22" ry="4" fill="#CE93D8" opacity="0.5"/>
      {[20,30,40,50,60].map((x,i)=>(
        <g key={i}>
          <circle cx={x} cy={13} r={4} fill={["#F48FB1","#FFD54F","#A5D6A7","#F48FB1","#FFD54F"][i]}/>
          <circle cx={x} cy={13} r={2} fill="#fff" opacity="0.6"/>
        </g>
      ))}
    </g>
  );

  const GlowEffect = () => (
    <g>
      <circle cx="40" cy="42" r="38" fill="none" stroke="#FFD54F" strokeWidth="2" opacity="0.3"/>
      {[{x:8,y:10},{x:72,y:10},{x:5,y:50},{x:75,y:50},{x:20,y:76},{x:60,y:76}].map((p,i)=>(
        <g key={i}>
          <line x1={p.x} y1={p.y-4} x2={p.x} y2={p.y+4} stroke="#FFD54F" strokeWidth="1.5" opacity="0.8"/>
          <line x1={p.x-4} y1={p.y} x2={p.x+4} y2={p.y} stroke="#FFD54F" strokeWidth="1.5" opacity="0.8"/>
        </g>
      ))}
    </g>
  );

  const RainbowHalo = () => (
    <g>
      {["#FF7043","#FFD54F","#66BB6A","#4FC3F7","#7C4DFF","#F48FB1"].map((c,i)=>(
        <circle key={i} cx="40" cy="42" r={36+i*2} fill="none"
          stroke={c} strokeWidth="1.5" opacity={0.2-i*0.02}/>
      ))}
      <polygon points="40,2 42,10 50,10 44,15 46,23 40,18 34,23 36,15 30,10 38,10"
        fill="#FFD54F" opacity="0.9"/>
    </g>
  );

  const LegendaryCrown = () => (
    <g>
      {["#FF7043","#FFD54F","#66BB6A","#4FC3F7","#7C4DFF","#F48FB1"].map((c,i)=>(
        <circle key={i} cx="40" cy="42" r={36+i*2.5} fill="none"
          stroke={c} strokeWidth="2" opacity={0.25-i*0.03}/>
      ))}
      <polygon points="40,0 43,9 52,9 45,14 48,23 40,17 32,23 35,14 28,9 37,9"
        fill="#FFD54F"/>
      {[-14,0,14].map((x,i)=>(
        <circle key={i} cx={40+x} cy={6} r={3}
          fill={["#FF7043","#fff","#4FC3F7"][i]}/>
      ))}
    </g>
  );

  return (
    <svg width={s} height={s} viewBox={vb}>
      {stage>=6&&<LegendaryCrown/>}
      {stage===5&&<RainbowHalo/>}
      {stage>=4&&stage<5&&<GlowEffect/>}
      {bases[id]||bases.fox}
      {stage===1&&<LeafCrown/>}
      {(stage===2||stage===3)&&<FlowerCrown/>}
      {stage>=4&&stage<5&&<FlowerCrown/>}
      {stage>=5&&<FlowerCrown/>}
    </svg>
  );
};

/* ══════════════════════════════════════════════
   ANIMATED GARDEN SCENE — mascot composited inside
══════════════════════════════════════════════ */
export const GardenScene = ({ stage, mascotId, size = 280, dark, showMascot = false, mascotStageId = 0 }) => {
  const w = size;
  const h = Math.round(size * 1.05); // taller — square-ish, feels immersive
  const stageId = typeof stage === "object" ? stage.id : stage;

  const skies = [
    ["#B9F0C2","#DCF5E0"],
    ["#A0E8F0","#D0F5F9"],
    ["#C4B0F5","#E8E0FF"],
    ["#FFD4A8","#FFE8CC"],
    ["#FFED9A","#FFFACC"],
    ["#FFB0D0","#FFD6E8"],
    ["#FFE066","#FFF5B0"],
  ];
  const [skyTop, skyBot] = skies[stageId] || skies[0];

  const grassColors = [
    ["#43A047","#66BB6A","#81C784","#A5D6A7"],
    ["#388E3C","#43A047","#66BB6A","#81C784"],
    ["#2E7D32","#388E3C","#43A047","#66BB6A"],
    ["#33691E","#558B2F","#689F38","#8BC34A"],
    ["#1B5E20","#2E7D32","#388E3C","#43A047"],
    ["#1B5E20","#2E7D32","#388E3C","#43A047"],
    ["#1B5E20","#2E7D32","#43A047","#66BB6A"],
  ][stageId] || ["#43A047","#66BB6A","#81C784","#A5D6A7"];

  const flowerData = [
    { colors:[], count:0 },
    { colors:["#A5D6A7","#C8E6C9"], count:4 },
    { colors:["#CE93D8","#81D4FA","#B39DDB","#E1BEE7"], count:7 },
    { colors:["#FF8A65","#FFD54F","#CE93D8","#81C784","#FFAB91"], count:10 },
    { colors:["#FF7043","#FFD54F","#CE93D8","#81C784","#F48FB1","#FF8A65"], count:13 },
    { colors:["#F48FB1","#CE93D8","#FFD54F","#81D4FA","#FF7043","#A5D6A7","#F8BBD0"], count:16 },
    { colors:["#FFD54F","#F48FB1","#CE93D8","#FF7043","#81D4FA","#A5D6A7","#FFE082","#CE93D8"], count:20 },
  ][stageId] || { colors:[], count:0 };

  // Ground horizon Y — lower in scene to leave sky room
  const groundY = h * 0.62;

  // Flowers: avoid centre zone (where mascot stands) for showMascot mode
  const allPositions = Array.from({length: flowerData.count}, (_,i) => {
    const raw = 0.03 + (i / Math.max(flowerData.count-1,1)) * 0.94;
    // skip centre for mascot
    if (showMascot && raw > 0.35 && raw < 0.65) {
      return raw < 0.5 ? raw - 0.14 : raw + 0.14;
    }
    return raw;
  }).map((x,i) => ({
    x,
    groundOffset: (Math.sin(x * Math.PI * 2.3 + i) * 0.04),
    size: 7 + (i % 5) * 2.2,
    sway: i % 2 === 0 ? "gSwayL" : "gSwayR",
    delay: `${(i * 0.22 % 2).toFixed(2)}s`,
    color: flowerData.colors[i % flowerData.colors.length],
  }));

  // Grass blades — dense, full width
  const blades = Array.from({length:28}, (_,i) => ({
    x: (i/27) * w,
    stemH: h*(0.12 + (i%5)*0.04),
    width: 3 + (i%3)*1.5,
    sway: i%2===0 ? "gSwayL" : "gSwayR",
    delay: `${(i*0.14%2.5).toFixed(2)}s`,
    color: grassColors[i%grassColors.length],
    opacity: 0.55 + (i%4)*0.1,
  }));

  // Mascot body SVG for the specific animal (simplified upright figure at ground)
  const mascotColors = {
    fox:   {body:"#FF8A65",belly:"#FFCCBC",ear:"#FF7043",eye:"#1a1a2e"},
    bunny: {body:"#FCE4EC",belly:"#F8BBD0",ear:"#F8BBD0",eye:"#1a1a2e"},
    bear:  {body:"#8D6E63",belly:"#A1887F",ear:"#795548",eye:"#1a1a2e"},
    owl:   {body:"#7E57C2",belly:"#B39DDB",ear:"#5E35B1",eye:"#311B92"},
    cat:   {body:"#4DB6AC",belly:"#80CBC4",ear:"#00897B",eye:"#1a1a2e"},
    dog:   {body:"#FFB74D",belly:"#FFCC80",ear:"#FFA726",eye:"#1a1a2e"},
  };
  const mc = mascotColors[mascotId] || mascotColors.fox;
  const mw = w * 0.22; // mascot width
  const mh = mw * 1.5; // mascot height
  const mx = w/2 - mw/2; // centre x
  const mGroundY = groundY - h*0.01;
  const myBase = mGroundY - mh; // mascot top y

  const animId = `gs${stageId}${showMascot?'m':''}`;

  return (
    <div style={{position:"relative",width:"100%",height:h,display:"block",overflow:"hidden"}}>
      <style>{`
        @keyframes gSwayL{0%,100%{transform:rotate(0deg)}50%{transform:rotate(-7deg)}}
        @keyframes gSwayR{0%,100%{transform:rotate(0deg)}50%{transform:rotate(7deg)}}
        @keyframes gFloat{0%,100%{transform:translateY(0px)}50%{transform:translateY(-7px)}}
        @keyframes gPulse{0%,100%{opacity:0.25}50%{opacity:1}}
        @keyframes gCloud{0%{transform:translateX(0)}100%{transform:translateX(40px)}}
        @keyframes gBounce{0%,100%{transform:translateY(0) rotate(-1deg)}50%{transform:translateY(-12px) rotate(1deg)}}
      `}</style>
      <svg viewBox={`0 0 ${w} ${h}`} width="100%" height={h}
        style={{display:"block"}}>
        <defs>
          <linearGradient id={`sky_${animId}`} x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor={dark?"#0d1a2e":skyTop}/>
            <stop offset="100%" stopColor={dark?"#1a2e40":skyBot}/>
          </linearGradient>
          <linearGradient id={`gnd_${animId}`} x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor={grassColors[1]}/>
            <stop offset="100%" stopColor={grassColors[0]}/>
          </linearGradient>
          <radialGradient id={`sun_${animId}`} cx="50%" cy="50%" r="50%">
            <stop offset="0%" stopColor="#FFFDE7" stopOpacity="0.9"/>
            <stop offset="100%" stopColor="#FFD54F" stopOpacity="0"/>
          </radialGradient>
          {stageId >= 4 && (
            <radialGradient id={`mglow_${animId}`} cx="50%" cy="65%" r="55%">
              <stop offset="0%" stopColor={stageId>=5?"#F48FB1":"#FFD54F"} stopOpacity="0.28"/>
              <stop offset="100%" stopColor="transparent" stopOpacity="0"/>
            </radialGradient>
          )}
          <clipPath id={`clip_${animId}`}>
            <rect width={w} height={h}/>
          </clipPath>
        </defs>

        <g clipPath={`url(#clip_${animId})`}>

        {/* Sky */}
        <rect width={w} height={h} fill={`url(#sky_${animId})`}/>
        {stageId>=4 && <rect width={w} height={h} fill={`url(#mglow_${animId})`}/>}

        {/* Sun */}
        {stageId<=4 && <>
          <circle cx={w*0.84} cy={h*0.13} r={w*0.072} fill="#FFD54F" opacity="0.95">
            <animate attributeName="r" values={`${w*0.068};${w*0.082};${w*0.068}`} dur="4s" repeatCount="indefinite"/>
          </circle>
          <circle cx={w*0.84} cy={h*0.13} r={w*0.115} fill={`url(#sun_${animId})`}/>
          {[0,45,90,135,180,225,270,315].map((a,i)=>{
            const r=a*Math.PI/180;
            return <line key={i}
              x1={w*0.84+Math.cos(r)*w*0.092} y1={h*0.13+Math.sin(r)*w*0.092}
              x2={w*0.84+Math.cos(r)*w*0.13}  y2={h*0.13+Math.sin(r)*w*0.13}
              stroke="#FFD54F" strokeWidth="2.5" opacity="0.55" strokeLinecap="round"/>;
          })}
        </>}

        {/* Moon for dark stages */}
        {stageId>=5 && <>
          <circle cx={w*0.82} cy={h*0.12} r={w*0.07} fill="#FFFDE7" opacity="0.9"/>
          <circle cx={w*0.87} cy={h*0.1}  r={w*0.055} fill={skyTop} />
          {[{x:0.65,y:0.07},{x:0.72,y:0.19},{x:0.9,y:0.17}].map((s,i)=>(
            <circle key={i} cx={w*s.x} cy={h*s.y} r="2.5" fill="#FFF9C4">
              <animate attributeName="opacity" values="0.2;1;0.2" dur={`${1.5+i*0.6}s`} repeatCount="indefinite"/>
            </circle>
          ))}
        </>}

        {/* Stars */}
        {stageId>=5 && [
          {x:0.08,y:0.06,d:"0s"},{x:0.25,y:0.03,d:"0.5s"},{x:0.45,y:0.09,d:"1s"},
          {x:0.6,y:0.04,d:"0.3s"},{x:0.35,y:0.16,d:"0.8s"},{x:0.15,y:0.2,d:"1.3s"},
        ].map((s,i)=>(
          <circle key={i} cx={w*s.x} cy={h*s.y} r="2.8" fill="#FFE082">
            <animate attributeName="opacity" values="0.1;0.9;0.1" dur="2.2s" begin={s.d} repeatCount="indefinite"/>
          </circle>
        ))}

        {/* Rainbow — stage 6 */}
        {stageId===6 && ["#FF7043","#FFD54F","#66BB6A","#4FC3F7","#CE93D8"].map((c,i)=>(
          <path key={i}
            d={`M${w*0.02},${h*0.55} Q${w*0.5},${h*(0.05-i*0.04)} ${w*0.98},${h*0.55}`}
            fill="none" stroke={c} strokeWidth="6" opacity={0.45-i*0.05} strokeLinecap="round"/>
        ))}

        {/* Clouds */}
        {stageId>=1 && [{x:0.04,y:0.14,s:0.9,dur:"20s"},{x:0.52,y:0.08,s:1.1,dur:"28s"}].map((cl,i)=>(
          <g key={i} style={{animation:`gCloud ${cl.dur} ease-in-out infinite alternate`}}>
            <g transform={`translate(${w*cl.x},${h*cl.y}) scale(${cl.s})`}>
              <ellipse cx="32" cy="0" rx="32" ry="15" fill="white" opacity={dark?0.12:0.8}/>
              <ellipse cx="14" cy="6"  rx="22" ry="13" fill="white" opacity={dark?0.1:0.7}/>
              <ellipse cx="54" cy="7"  rx="24" ry="12" fill="white" opacity={dark?0.1:0.7}/>
            </g>
          </g>
        ))}

        {/* Ground — gently rolling hill fills bottom 38% */}
        <path d={`M0,${groundY+h*0.02}
          C${w*0.15},${groundY-h*0.05} ${w*0.3},${groundY+h*0.02} ${w*0.5},${groundY-h*0.02}
          C${w*0.7},${groundY-h*0.06} ${w*0.85},${groundY+h*0.03} ${w},${groundY}
          L${w},${h} L0,${h} Z`}
          fill={`url(#gnd_${animId})`}/>
        {/* Highlight edge */}
        <path d={`M0,${groundY+h*0.02}
          C${w*0.15},${groundY-h*0.05} ${w*0.3},${groundY+h*0.02} ${w*0.5},${groundY-h*0.02}
          C${w*0.7},${groundY-h*0.06} ${w*0.85},${groundY+h*0.03} ${w},${groundY}`}
          fill="none" stroke="rgba(255,255,255,0.35)" strokeWidth="3"/>

        {/* Back grass blades — behind flowers */}
        {blades.map((b,i)=>(
          <g key={i} style={{animation:`${b.sway} ${2.2+i*0.12}s ease-in-out infinite`,
            animationDelay:b.delay, transformOrigin:`${b.x}px ${groundY}px`}}>
            <path d={`M${b.x},${groundY}
              C${b.x-b.width*1.5},${groundY-b.stemH*0.45}
               ${b.x+b.width},${groundY-b.stemH*0.75}
               ${b.x+b.width*0.4},${groundY-b.stemH}`}
              stroke={b.color} strokeWidth={b.width} fill="none"
              strokeLinecap="round" opacity={b.opacity}/>
          </g>
        ))}

        {/* Dirt patch — seedling only */}
        {stageId===0 && <>
          <ellipse cx={w*0.5} cy={groundY+h*0.02} rx={w*0.2} ry={h*0.05}
            fill="#8D6E63" opacity="0.85"/>
          <ellipse cx={w*0.5} cy={groundY} rx={w*0.13} ry={h*0.03}
            fill="#A1887F" opacity="0.5"/>
        </>}

        {/* Single sprout — seedling */}
        {stageId===0 && (
          <g style={{animation:"gSwayL 3.5s ease-in-out infinite",
            transformOrigin:`${w*0.5}px ${groundY}px`}}>
            <line x1={w*0.5} y1={groundY} x2={w*0.5} y2={groundY-h*0.22}
              stroke="#43A047" strokeWidth="5" strokeLinecap="round"/>
            <ellipse cx={w*0.43} cy={groundY-h*0.13} rx={w*0.065} ry={h*0.04}
              fill="#66BB6A" transform={`rotate(-38 ${w*0.43} ${groundY-h*0.13})`}/>
            <ellipse cx={w*0.57} cy={groundY-h*0.16} rx={w*0.065} ry={h*0.04}
              fill="#81C784" transform={`rotate(38 ${w*0.57} ${groundY-h*0.16})`}/>
            <ellipse cx={w*0.5} cy={groundY-h*0.22} rx={w*0.04} ry={h*0.03} fill="#A5D6A7"/>
          </g>
        )}

        {/* Flowers — both sides of mascot */}
        {allPositions.map((p,i)=>{
          const fx = w * p.x;
          const gy = groundY + p.groundOffset*h;
          const stemH = p.size * 5;
          const fy = gy - stemH;
          return (
            <g key={i} style={{animation:`${p.sway} ${2+i*0.18}s ease-in-out infinite`,
              animationDelay:p.delay, transformOrigin:`${fx}px ${gy}px`}}>
              <path d={`M${fx},${gy} C${fx-2},${gy-stemH*0.4} ${fx+3},${gy-stemH*0.7} ${fx},${fy}`}
                stroke="#43A047" strokeWidth="2.8" fill="none" strokeLinecap="round"/>
              <ellipse cx={fx-p.size*0.9} cy={gy-stemH*0.42}
                rx={p.size} ry={p.size*0.38} fill="#66BB6A" opacity="0.88"
                transform={`rotate(-32 ${fx-p.size*0.9} ${gy-stemH*0.42})`}/>
              {i%2===0 && <ellipse cx={fx+p.size*0.9} cy={gy-stemH*0.6}
                rx={p.size*0.85} ry={p.size*0.33} fill="#81C784" opacity="0.82"
                transform={`rotate(32 ${fx+p.size*0.9} ${gy-stemH*0.6})`}/>}
              {[0,51.4,102.8,154.2,205.6,257,308.4].map((ang,pi)=>{
                const rad=ang*Math.PI/180;
                return <ellipse key={pi}
                  cx={fx+Math.cos(rad)*p.size*1.08} cy={fy+Math.sin(rad)*p.size*1.08}
                  rx={p.size*0.68} ry={p.size*0.44}
                  fill={p.color} opacity="0.95"
                  transform={`rotate(${ang} ${fx+Math.cos(rad)*p.size*1.08} ${fy+Math.sin(rad)*p.size*1.08})`}/>;
              })}
              <circle cx={fx} cy={fy} r={p.size*0.45} fill="#FFD54F"/>
              <circle cx={fx} cy={fy} r={p.size*0.22} fill="#F9A825"/>
            </g>
          );
        })}

        {/* Mascot composited at ground level */}
        {showMascot && mascotId && (
          <g style={{animation:"gBounce 3.2s ease-in-out infinite"}}>
            {/* Shadow */}
            <ellipse cx={w/2} cy={mGroundY+h*0.008} rx={mw*0.42} ry={h*0.018}
              fill="rgba(0,0,0,0.12)"/>
            {/* Body */}
            <ellipse cx={w/2} cy={myBase+mh*0.65} rx={mw*0.38} ry={mh*0.32} fill={mc.body}/>
            {/* Belly */}
            <ellipse cx={w/2} cy={myBase+mh*0.68} rx={mw*0.22} ry={mh*0.22} fill={mc.belly}/>
            {/* Ears / head features */}
            {mascotId==="fox"&&<>
              <polygon points={`${w/2-mw*0.22},${myBase+mh*0.18} ${w/2-mw*0.32},${myBase} ${w/2-mw*0.1},${myBase+0.15*mh}`} fill={mc.ear}/>
              <polygon points={`${w/2+mw*0.22},${myBase+mh*0.18} ${w/2+mw*0.32},${myBase} ${w/2+mw*0.1},${myBase+0.15*mh}`} fill={mc.ear}/>
            </>}
            {mascotId==="bunny"&&<>
              <ellipse cx={w/2-mw*0.15} cy={myBase+mh*0.08} rx={mw*0.07} ry={mh*0.15} fill={mc.ear}/>
              <ellipse cx={w/2+mw*0.15} cy={myBase+mh*0.08} rx={mw*0.07} ry={mh*0.15} fill={mc.ear}/>
            </>}
            {mascotId==="bear"&&<>
              <circle cx={w/2-mw*0.22} cy={myBase+mh*0.12} r={mw*0.1} fill={mc.ear}/>
              <circle cx={w/2+mw*0.22} cy={myBase+mh*0.12} r={mw*0.1} fill={mc.ear}/>
            </>}
            {mascotId==="cat"&&<>
              <polygon points={`${w/2-mw*0.18},${myBase+mh*0.2} ${w/2-mw*0.28},${myBase+mh*0.04} ${w/2-mw*0.06},${myBase+mh*0.18}`} fill={mc.ear}/>
              <polygon points={`${w/2+mw*0.18},${myBase+mh*0.2} ${w/2+mw*0.28},${myBase+mh*0.04} ${w/2+mw*0.06},${myBase+mh*0.18}`} fill={mc.ear}/>
            </>}
            {(mascotId==="owl"||mascotId==="dog")&&<>
              <ellipse cx={w/2-mw*0.2} cy={myBase+mh*0.1} rx={mw*0.1} ry={mw*0.14} fill={mc.ear}/>
              <ellipse cx={w/2+mw*0.2} cy={myBase+mh*0.1} rx={mw*0.1} ry={mw*0.14} fill={mc.ear}/>
            </>}
            {/* Head */}
            <ellipse cx={w/2} cy={myBase+mh*0.26} rx={mw*0.3} ry={mh*0.24} fill={mc.body}/>
            {/* Eyes */}
            <circle cx={w/2-mw*0.1} cy={myBase+mh*0.24} r={mw*0.065} fill="white"/>
            <circle cx={w/2+mw*0.1} cy={myBase+mh*0.24} r={mw*0.065} fill="white"/>
            <circle cx={w/2-mw*0.09} cy={myBase+mh*0.25} r={mw*0.034} fill={mc.eye}/>
            <circle cx={w/2+mw*0.11} cy={myBase+mh*0.25} r={mw*0.034} fill={mc.eye}/>
            {/* Shine dots */}
            <circle cx={w/2-mw*0.075} cy={myBase+mh*0.23} r={mw*0.014} fill="white"/>
            <circle cx={w/2+mw*0.125} cy={myBase+mh*0.23} r={mw*0.014} fill="white"/>
            {/* Smile */}
            <path d={`M${w/2-mw*0.1},${myBase+mh*0.32} Q${w/2},${myBase+mh*0.38} ${w/2+mw*0.1},${myBase+mh*0.32}`}
              fill="none" stroke={mc.eye} strokeWidth="2.5" strokeLinecap="round"/>
            {/* Arms */}
            <ellipse cx={w/2-mw*0.42} cy={myBase+mh*0.58} rx={mw*0.1} ry={mh*0.16}
              fill={mc.body} transform={`rotate(-22 ${w/2-mw*0.42} ${myBase+mh*0.58})`}/>
            <ellipse cx={w/2+mw*0.42} cy={myBase+mh*0.58} rx={mw*0.1} ry={mh*0.16}
              fill={mc.body} transform={`rotate(22 ${w/2+mw*0.42} ${myBase+mh*0.58})`}/>
            {/* Legs */}
            <ellipse cx={w/2-mw*0.15} cy={mGroundY-h*0.02} rx={mw*0.12} ry={mh*0.1} fill={mc.body}/>
            <ellipse cx={w/2+mw*0.15} cy={mGroundY-h*0.02} rx={mw*0.12} ry={mh*0.1} fill={mc.body}/>
          </g>
        )}

        {/* Butterflies — stage 3+ */}
        {stageId>=3 && [
          {x:0.15,y:0.42,c:"#F48FB1",d:"0s",dur:"4.5s"},
          {x:0.82,y:0.38,c:"#CE93D8",d:"1.4s",dur:"5.5s"},
          ...(stageId>=5?[{x:0.5,y:0.3,c:"#81D4FA",d:"0.7s",dur:"3.8s"}]:[]),
        ].map((b,i)=>(
          <g key={i} style={{animation:`gFloat ${b.dur} ease-in-out infinite`,animationDelay:b.d}}>
            <g transform={`translate(${w*b.x},${h*b.y})`}>
              <ellipse cx="-10" cy="-5" rx="12" ry="8" fill={b.c} opacity="0.92" transform="rotate(-22 -10 -5)"/>
              <ellipse cx="10"  cy="-5" rx="12" ry="8" fill={b.c} opacity="0.92" transform="rotate(22 10 -5)"/>
              <ellipse cx="-7"  cy="6"  rx="8"  ry="5" fill={b.c} opacity="0.72" transform="rotate(28 -7 6)"/>
              <ellipse cx="7"   cy="6"  rx="8"  ry="5" fill={b.c} opacity="0.72" transform="rotate(-28 7 6)"/>
              <ellipse cx="0" cy="0" rx="2.2" ry="9" fill="#5D4037" opacity="0.75"/>
              <line x1="0" y1="-9" x2="-7" y2="-16" stroke="#5D4037" strokeWidth="1.2" opacity="0.7"/>
              <line x1="0" y1="-9" x2="7"  y2="-16" stroke="#5D4037" strokeWidth="1.2" opacity="0.7"/>
              <circle cx="-7" cy="-16" r="2" fill={b.c}/>
              <circle cx="7"  cy="-16" r="2" fill={b.c}/>
            </g>
          </g>
        ))}

        {/* Fireflies — stage 5+ */}
        {stageId>=5 && [
          {x:0.1,y:0.5,d:"0s"},{x:0.9,y:0.45,d:"0.8s"},
          {x:0.3,y:0.38,d:"1.5s"},{x:0.72,y:0.55,d:"0.4s"},
          ...(stageId===6?[{x:0.5,y:0.32,d:"1.1s"},{x:0.2,y:0.58,d:"1.9s"}]:[]),
        ].map((f,i)=>(
          <circle key={i} cx={w*f.x} cy={h*f.y} r="4" fill="#FFE082">
            <animate attributeName="opacity" values="0.1;1;0.1"
              dur="2s" begin={f.d} repeatCount="indefinite"/>
            <animate attributeName="r" values="2;5;2"
              dur="2s" begin={f.d} repeatCount="indefinite"/>
          </circle>
        ))}

        {/* Front grass fringe — over everything */}
        {Array.from({length:16},(_,i)=>({x:(i/15)*w, bh:h*0.08+Math.sin(i*1.3)*h*0.05})).map((b,i)=>(
          <g key={i} style={{animation:`${i%2===0?"gSwayL":"gSwayR"} ${1.8+i*0.1}s ease-in-out infinite`,
            animationDelay:`${(i*0.13%2).toFixed(2)}s`, transformOrigin:`${b.x}px ${groundY+h*0.12}px`}}>
            <path d={`M${b.x},${groundY+h*0.14}
              C${b.x-4},${groundY+h*0.14-b.bh*0.55}
               ${b.x+3},${groundY+h*0.14-b.bh*0.82}
               ${b.x+3},${groundY+h*0.14-b.bh}`}
              stroke={grassColors[0]} strokeWidth="3.5" fill="none" strokeLinecap="round" opacity="0.85"/>
          </g>
        ))}

        </g>
      </svg>
    </div>
  );
};
/* ══════════════════════════════════════════════
   GROWTH MASCOT (face only — used in small contexts)
══════════════════════════════════════════════ */
/* ── SVG seed icon ── */
const SeedIcon = ({ size=22, color="#43A047" }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none">
    <path d="M12 21C12 21 5 15 5 9a7 7 0 0114 0c0 6-7 12-7 12z"
      fill={color} opacity="0.9"/>
    <path d="M12 21C12 21 5 15 5 9a7 7 0 0114 0c0 6-7 12-7 12z"
      fill="none" stroke={color} strokeWidth="1.2" strokeLinejoin="round"/>
    <ellipse cx="9.5" cy="8.5" rx="1.5" ry="2"
      fill="rgba(255,255,255,0.35)" transform="rotate(-20 9.5 8.5)"/>
  </svg>
);

export const SeedPopup = ({ amount, visible, gold=false }) => {
  if (!visible) return null;
  return (
    <div style={{
      position:"fixed", top:"22%", left:"50%",
      zIndex:9999, pointerEvents:"none",
      animation:"seedPop 2s ease forwards",
      display:"flex", alignItems:"center", gap:6,
    }}>
      <style>{`@keyframes seedPop{
        0%  {opacity:0;transform:translateX(-50%) translateY(0) scale(0.5)}
        20% {opacity:1;transform:translateX(-50%) translateY(-22px) scale(1.1)}
        70% {opacity:1;transform:translateX(-50%) translateY(-30px) scale(1)}
        100%{opacity:0;transform:translateX(-50%) translateY(-54px) scale(0.8)}
      }`}</style>

      {gold ? (
        /* Bonus — 3 seed icons stacked with Bonus +3 */
        <div style={{display:"flex",alignItems:"center",gap:5,
          background:"rgba(255,255,255,0.92)",borderRadius:50,
          padding:"6px 14px",
          boxShadow:"0 4px 18px rgba(249,168,37,0.45)"}}>
          <div style={{display:"flex",gap:1}}>
            <SeedIcon size={16} color="#F9A825"/>
            <SeedIcon size={16} color="#F9A825"/>
            <SeedIcon size={16} color="#F9A825"/>
          </div>
          <p style={{fontFamily:F.b,fontWeight:800,fontSize:14,
            color:"#F9A825",margin:0,letterSpacing:0.3}}>
            Bonus +3
          </p>
        </div>
      ) : (
        /* Regular — single seed icon + amount */
        <div style={{display:"flex",alignItems:"center",gap:5,
          background:"rgba(255,255,255,0.92)",borderRadius:50,
          padding:"6px 12px",
          boxShadow:"0 4px 14px rgba(67,160,71,0.3)"}}>
          <SeedIcon size={18} color="#43A047"/>
          <p style={{fontFamily:F.b,fontWeight:800,fontSize:14,
            color:"#43A047",margin:0}}>
            +{amount}
          </p>
        </div>
      )}
    </div>
  );
};

/* ══════════════════════════════════════════════
   SEED PROGRESS BAR
══════════════════════════════════════════════ */
export const GrowthProgressBar = ({ score, onPress }) => {
  const stage    = getStage(score);
  const next     = nextStage(score);
  const progress = next
    ? Math.min(((score-stage.minScore)/(next.minScore-stage.minScore))*100,100)
    : 100;

  return (
    <button onClick={onPress} style={{
      width:"100%", background:"#fff", borderRadius:20,
      padding:"14px 18px", border:"1.5px solid #EEE9FF",
      boxShadow:"0 2px 18px rgba(124,77,255,0.09)",
      marginBottom:14, cursor:"pointer", textAlign:"left",
      transition:"transform 0.15s",
    }}
      onMouseDown={e=>e.currentTarget.style.transform="scale(0.98)"}
      onMouseUp={e=>e.currentTarget.style.transform="scale(1)"}
    >
      <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:8}}>
        <div>
          <p style={{fontFamily:F.h,fontWeight:800,fontSize:16,color:"#2D2040",margin:0}}>
            {stage.name}
          </p>
          <p style={{fontFamily:F.b,fontWeight:500,fontSize:12,color:"#9B8DB5",margin:0}}>
            {next?`${next.minScore-score} seeds to ${next.name}`:"Maximum stage reached!"}
          </p>
        </div>
        <div style={{background:stage.bg,borderRadius:50,padding:"4px 12px",
          display:"flex",alignItems:"center",gap:5}}>
          <span style={{fontSize:14}}>🌱</span>
          <p style={{fontFamily:F.b,fontWeight:700,fontSize:12,color:stage.color,margin:0}}>
            {score} seeds
          </p>
        </div>
      </div>
      <div style={{background:"#F0EAFF",borderRadius:50,height:10,overflow:"hidden"}}>
        <div style={{height:"100%",borderRadius:50,
          background:`linear-gradient(90deg,${stage.color},#F06292)`,
          width:`${progress}%`,transition:"width 0.8s ease"}}/>
      </div>
      <div style={{display:"flex",justifyContent:"space-between",marginTop:8}}>
        {STAGES.map(s=>(
          <div key={s.id} style={{display:"flex",flexDirection:"column",alignItems:"center",gap:2}}>
            <div style={{width:8,height:8,borderRadius:"50%",
              background:score>=s.minScore?s.color:"#ddd",
              border:`2px solid ${score>=s.minScore?s.color:"#eee"}`,
              transition:"all 0.3s"}}/>
            <p style={{fontFamily:F.b,fontSize:8,fontWeight:700,
              color:score>=s.minScore?s.color:"#9B8DB5",margin:0,
              display:s.id%2===0?"block":"none"}}>
              {s.name.split(" ")[0]}
            </p>
          </div>
        ))}
      </div>
    </button>
  );
};

/* ══════════════════════════════════════════════
   STAGE CELEBRATION
══════════════════════════════════════════════ */
export const GrowthCelebration = ({ mascotId, newStage, childName, onDismiss }) => {
  const stage = STAGES[newStage]||STAGES[0];
  const [show,setShow] = useState(false);
  useEffect(()=>{setTimeout(()=>setShow(true),50);},[]);

  return (
    <div style={{position:"fixed",top:0,left:0,right:0,bottom:0,
      background:"rgba(0,0,0,0.6)",display:"flex",alignItems:"center",
      justifyContent:"center",zIndex:1000,padding:24,backdropFilter:"blur(4px)"}}>
      <style>{`@keyframes popIn{from{opacity:0;transform:scale(0.7)}to{opacity:1;transform:scale(1)}}@keyframes floatStar{0%,100%{transform:translateY(0) rotate(0deg)}50%{transform:translateY(-12px) rotate(10deg)}}@keyframes confetti0{0%{transform:translateY(0) rotate(0deg);opacity:1}100%{transform:translateY(300px) rotate(720deg);opacity:0}}@keyframes confetti1{0%{transform:translateY(0) rotate(45deg);opacity:1}100%{transform:translateY(280px) rotate(-540deg);opacity:0}}@keyframes confetti2{0%{transform:translateY(0) rotate(90deg);opacity:1}100%{transform:translateY(320px) rotate(630deg);opacity:0}}`}</style>
      <div style={{background:"#fff",borderRadius:28,padding:"32px 24px",
        textAlign:"center",maxWidth:360,width:"100%",
        animation:show?"popIn 0.4s cubic-bezier(0.34,1.56,0.64,1) forwards":"none",
        position:"relative",overflow:"hidden"}}>
        {Array.from({length:16},(_,i)=>(
          <div key={i} style={{position:"absolute",top:-10,left:`${(i/16)*100}%`,
            width:8,height:8,borderRadius:i%2===0?"50%":2,
            background:["#FFD54F","#F06292","#7C4DFF","#4DB6AC","#FF7043"][i%5],
            animation:`confetti${i%3} ${1.5+Math.random()}s ${Math.random()*0.5}s ease-in forwards`}}/>
        ))}
        <div style={{background:stage.bg,borderRadius:50,padding:"6px 18px",
          display:"inline-block",marginBottom:16}}>
          <p style={{fontFamily:"'Poppins',sans-serif",fontWeight:700,fontSize:12,
            color:stage.color,margin:0,letterSpacing:1,textTransform:"uppercase"}}>
            New Stage Unlocked!
          </p>
        </div>
        <div style={{margin:"0 auto 16px",animation:"floatStar 2s ease-in-out infinite",
          display:"inline-block"}}>
          <GrowthMascot id={mascotId} size={90} stage={newStage}/>
        </div>
        <h2 style={{fontFamily:"'Baloo 2',cursive",fontSize:28,fontWeight:900,
          color:stage.color,marginBottom:8}}>{stage.name}!</h2>
        <p style={{fontFamily:"'Poppins',sans-serif",fontSize:17,fontWeight:600,
          color:"#2D2040",marginBottom:6}}>Amazing work, {childName}!</p>
        <p style={{fontFamily:"'Poppins',sans-serif",fontSize:14,fontWeight:500,
          color:"#9B8DB5",marginBottom:20,lineHeight:1.6}}>{stage.desc}</p>
        <div style={{background:stage.bg,borderRadius:16,padding:"12px 16px",
          marginBottom:20,textAlign:"left"}}>
          <p style={{fontFamily:"'Poppins',sans-serif",fontWeight:700,fontSize:12,
            color:stage.color,letterSpacing:1,textTransform:"uppercase",marginBottom:6}}>
            Your garden
          </p>
          <p style={{fontFamily:"'Poppins',sans-serif",fontSize:14,fontWeight:500,
            color:"#2D2040",margin:0}}>
            {newStage===1&&"Tiny green shoots are sprouting in your garden!"}
            {newStage===2&&"Colourful flowers are blooming all around you!"}
            {newStage===3&&"Your garden is bursting with life and butterflies!"}
            {newStage===4&&"Glowing flowers fill your lush garden!"}
            {newStage===5&&"Magic fireflies dance in your enchanted garden!"}
            {newStage===6&&"Stars rain down on your Full Bloom garden!"}
          </p>
        </div>
        <button onClick={onDismiss} style={{
          background:`linear-gradient(135deg,${stage.color},#F06292)`,
          border:"none",borderRadius:50,padding:"15px 40px",
          fontSize:16,fontWeight:700,fontFamily:"'Poppins',sans-serif",
          color:"#fff",cursor:"pointer",
          boxShadow:`0 4px 20px ${stage.color}55`,width:"100%"}}>
          Keep Growing! 🌱
        </button>
      </div>
    </div>
  );
};

export default { GrowthMascot, GardenScene, GrowthProgressBar, GrowthCelebration, SeedPopup, calcGrowthScore, getStage, STAGES };
