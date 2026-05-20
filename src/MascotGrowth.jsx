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
export const GardenScene = ({ stage, mascotId, size = 280, dark }) => {
  const w = size;
  const h = size * 0.75;
  const stageId = typeof stage === "object" ? stage.id : stage;

  /* Sky gradient per stage */
  const skies = [
    ["#E8F5E9","#F1F8E9"],   // Seedling — pale green
    ["#E0F7FA","#E8F5E9"],   // Sprouting — light teal
    ["#EDE7F6","#E3F2FD"],   // Blooming — soft purple
    ["#FFF3E0","#FFFDE7"],   // Flourishing — warm orange
    ["#FFF9C4","#FFFDE7"],   // Thriving — golden
    ["#FCE4EC","#F3E5F5"],   // Blossoming — pink magic
    ["#FFFDE7","#FFF8E1"],   // Full Bloom — golden enchanted
  ];
  const [skyTop, skyBot] = skies[stageId] || skies[0];

  /* Flower colors per stage */
  const flowerPalettes = [
    [],
    ["#A5D6A7"],
    ["#CE93D8","#81D4FA"],
    ["#FF8A65","#FFD54F","#CE93D8"],
    ["#FF8A65","#FFD54F","#CE93D8","#81C784"],
    ["#F48FB1","#CE93D8","#FFD54F","#81D4FA","#FF8A65"],
    ["#FFD54F","#F48FB1","#CE93D8","#81D4FA","#FF8A65","#A5D6A7"],
  ];
  const flowers = flowerPalettes[stageId] || [];

  /* Flower positions */
  const flowerPos = [
    {x:0.12,y:0.72},{x:0.25,y:0.78},{x:0.42,y:0.74},
    {x:0.58,y:0.76},{x:0.72,y:0.73},{x:0.88,y:0.75},
    {x:0.18,y:0.68},{x:0.65,y:0.7},{x:0.35,y:0.8},
    {x:0.8,y:0.68},{x:0.5,y:0.82},{x:0.92,y:0.8},
  ].slice(0, Math.min(flowers.length * 2, 12));

  return (
    <svg viewBox={`0 0 ${w} ${h}`} width={w} height={h}
      style={{borderRadius:24,overflow:"hidden",display:"block"}}>
      <defs>
        <linearGradient id="skyGrad" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor={dark?"#1a1030":skyTop}/>
          <stop offset="100%" stopColor={dark?"#261840":skyBot}/>
        </linearGradient>
        {stageId >= 5 && (
          <radialGradient id="magicGlow" cx="50%" cy="60%" r="40%">
            <stop offset="0%" stopColor="#FFD54F" stopOpacity="0.3"/>
            <stop offset="100%" stopColor="#FFD54F" stopOpacity="0"/>
          </radialGradient>
        )}
      </defs>

      {/* Sky */}
      <rect width={w} height={h} fill="url(#skyGrad)"/>

      {/* Magic glow for high stages */}
      {stageId >= 5 && <rect width={w} height={h} fill="url(#magicGlow)"/>}

      {/* Stars falling for Full Bloom */}
      {stageId === 6 && [
        {x:0.15,y:0.1},{x:0.35,y:0.05},{x:0.6,y:0.12},{x:0.82,y:0.08},{x:0.5,y:0.2},
      ].map((p,i)=>(
        <g key={i}>
          <circle cx={w*p.x} cy={h*p.y} r={3} fill="#FFD54F" opacity="0.9"/>
          <line x1={w*p.x} y1={h*p.y-5} x2={w*p.x} y2={h*p.y+5}
            stroke="#FFD54F" strokeWidth="1" opacity="0.6"/>
          <line x1={w*p.x-5} y1={h*p.y} x2={w*p.x+5} y2={h*p.y}
            stroke="#FFD54F" strokeWidth="1" opacity="0.6"/>
        </g>
      ))}

      {/* Fireflies for Blossoming+ */}
      {stageId >= 5 && [
        {x:0.1,y:0.4},{x:0.85,y:0.35},{x:0.2,y:0.6},{x:0.75,y:0.55},
      ].map((p,i)=>(
        <circle key={i} cx={w*p.x} cy={h*p.y} r={3}
          fill="#FFD54F" opacity="0.7"/>
      ))}

      {/* Clouds for Thriving+ */}
      {stageId >= 4 && [
        {x:0.15,y:0.18,s:0.7},{x:0.7,y:0.12,s:0.9},
      ].map((cl,i)=>(
        <g key={i} transform={`translate(${w*cl.x},${h*cl.y}) scale(${cl.s})`}>
          <ellipse cx="0" cy="0" rx="28" ry="14" fill="white" opacity="0.6"/>
          <ellipse cx="-15" cy="4" rx="18" ry="12" fill="white" opacity="0.5"/>
          <ellipse cx="15" cy="5" rx="20" ry="12" fill="white" opacity="0.5"/>
        </g>
      ))}

      {/* Ground */}
      <ellipse cx={w/2} cy={h*0.88} rx={w*0.52} ry={h*0.16}
        fill={dark?"#1a2e1a":stageId>=2?"#81C784":"#A5D6A7"} opacity="0.5"/>
      <ellipse cx={w/2} cy={h*0.9} rx={w*0.48} ry={h*0.12}
        fill={dark?"#1f381f":stageId>=2?"#66BB6A":"#A5D6A7"}/>

      {/* Dirt patch for seedling */}
      {stageId === 0 && (
        <ellipse cx={w/2} cy={h*0.87} rx={w*0.22} ry={h*0.06} fill="#8D6E63"/>
      )}

      {/* Tiny sprout for Seedling */}
      {stageId === 0 && (
        <g>
          <line x1={w*0.5} y1={h*0.87} x2={w*0.5} y2={h*0.68}
            stroke="#66BB6A" strokeWidth="3" strokeLinecap="round"/>
          <ellipse cx={w*0.44} cy={h*0.73} rx={w*0.04} ry={h*0.03}
            fill="#81C784" transform={`rotate(-30 ${w*0.44} ${h*0.73})`}/>
          <ellipse cx={w*0.56} cy={h*0.75} rx={w*0.04} ry={h*0.03}
            fill="#81C784" transform={`rotate(30 ${w*0.56} ${h*0.75})`}/>
        </g>
      )}

      {/* Flowers */}
      {flowerPos.map((p,i)=>{
        const color = flowers[i % flowers.length];
        const fx = w * p.x;
        const fy = h * p.y;
        const fs = 6 + (i % 3) * 2;
        return (
          <g key={i}>
            <line x1={fx} y1={fy} x2={fx} y2={fy+fs*2.5}
              stroke="#66BB6A" strokeWidth="2" strokeLinecap="round"/>
            {[-1,1].map(dx=>(
              <ellipse key={dx} cx={fx+dx*fs*0.7} cy={fy+fs*1.2}
                rx={fs*0.5} ry={fs*0.3} fill="#81C784"
                transform={`rotate(${dx*25} ${fx+dx*fs*0.7} ${fy+fs*1.2})`}/>
            ))}
            {[0,60,120,180,240,300].map((angle,pi)=>{
              const rad = (angle * Math.PI) / 180;
              return (
                <ellipse key={pi}
                  cx={fx + Math.cos(rad) * fs * 0.9}
                  cy={fy + Math.sin(rad) * fs * 0.9}
                  rx={fs*0.55} ry={fs*0.35}
                  fill={color} opacity="0.9"
                  transform={`rotate(${angle} ${fx+Math.cos(rad)*fs*0.9} ${fy+Math.sin(rad)*fs*0.9})`}/>
              );
            })}
            <circle cx={fx} cy={fy} r={fs*0.4} fill="#FFD54F"/>
          </g>
        );
      })}

      {/* Butterflies for Flourishing+ */}
      {stageId >= 3 && [{x:0.22,y:0.5},{x:0.78,y:0.45}].map((b,i)=>(
        <g key={i} transform={`translate(${w*b.x},${h*b.y})`}>
          <ellipse cx="-8" cy="-4" rx="10" ry="6"
            fill={["#F48FB1","#CE93D8"][i]} opacity="0.85" transform="rotate(-20 -8 -4)"/>
          <ellipse cx="8" cy="-4" rx="10" ry="6"
            fill={["#F48FB1","#CE93D8"][i]} opacity="0.85" transform="rotate(20 8 -4)"/>
          <ellipse cx="-5" cy="4" rx="6" ry="4"
            fill={["#F48FB1","#CE93D8"][i]} opacity="0.7" transform="rotate(20 -5 4)"/>
          <ellipse cx="5" cy="4" rx="6" ry="4"
            fill={["#F48FB1","#CE93D8"][i]} opacity="0.7" transform="rotate(-20 5 4)"/>
          <line x1="0" y1="-8" x2="0" y2="8" stroke="#555" strokeWidth="1"/>
        </g>
      ))}

      {/* Mascot face centered */}
      <g transform={`translate(${w/2-40},${h*0.3})`}>
        <GrowthMascot id={mascotId} size={80} stage={stageId}/>
      </g>

      {/* Stage label */}
      <rect x={w*0.3} y={h*0.04} width={w*0.4} height={h*0.1} rx={8}
        fill="rgba(255,255,255,0.5)"/>
      <text x={w/2} y={h*0.1} textAnchor="middle"
        fontFamily={F.b} fontSize="11" fontWeight="700"
        fill={dark?"#2D2040":"#2D2040"}>
        {STAGES[stageId]?.name || "Seedling"}
      </text>
    </svg>
  );
};

/* ══════════════════════════════════════════════
   GROWTH MASCOT (face only — used in small contexts)
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
   SEED EARNING POPUP
══════════════════════════════════════════════ */
export const SeedPopup = ({ amount, visible }) => {
  if (!visible) return null;
  return (
    <div style={{
      position:"fixed", top:"30%", left:"50%",
      transform:"translateX(-50%)",
      background:"linear-gradient(135deg,#66BB6A,#4DB6AC)",
      borderRadius:50, padding:"10px 24px",
      display:"flex", alignItems:"center", gap:8,
      boxShadow:"0 6px 24px rgba(76,175,80,0.4)",
      zIndex:9999, pointerEvents:"none",
      animation:"seedPop 0.8s ease forwards",
    }}>
      <style>{`@keyframes seedPop{0%{opacity:0;transform:translateX(-50%) translateY(0) scale(0.7)}30%{opacity:1;transform:translateX(-50%) translateY(-20px) scale(1.1)}70%{opacity:1;transform:translateX(-50%) translateY(-30px) scale(1)}100%{opacity:0;transform:translateX(-50%) translateY(-50px) scale(0.9)}}`}</style>
      <span style={{fontSize:18}}>🌱</span>
      <p style={{fontFamily:F.b,fontWeight:800,fontSize:16,color:"#fff",margin:0}}>
        +{amount} {amount===1?"seed":"seeds"}
      </p>
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
