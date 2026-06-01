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
  { id:0, name:"Seedling",    minScore:0,   desc:"Your journey begins! 10 garden items are ready to plant.", color:"#A5D6A7", bg:"#E8F5E9",  accessory:"none",   unlockCount:10 },
  { id:1, name:"Sprouting",   minScore:15,  desc:"You're growing! 10 new garden items are now in the shop.", color:"#4DB6AC", bg:"#E0F2F1",  accessory:"leaf",   unlockCount:10 },
  { id:2, name:"Blooming",    minScore:35,  desc:"Beautiful! 10 more items have bloomed in your shop.",      color:"#7C4DFF", bg:"#EDE7F6",  accessory:"crown",  unlockCount:10 },
  { id:3, name:"Flourishing", minScore:70,  desc:"Wow! 10 exciting new items are waiting for you.",          color:"#FF7043", bg:"#FFF3E0",  accessory:"double", unlockCount:10 },
  { id:4, name:"Thriving",    minScore:120, desc:"Amazing! 10 rare garden items have been unlocked.",        color:"#F9A825", bg:"#FFF9C4",  accessory:"glow",   unlockCount:10 },
  { id:5, name:"Blossoming",  minScore:180, desc:"Magic! 10 enchanted items are now in your shop.",          color:"#EC407A", bg:"#FCE4EC",  accessory:"halo",   unlockCount:10 },
  { id:6, name:"Full Bloom",  minScore:260, desc:"Legendary! 10 ultimate garden items have been unlocked!",  color:"#FFD54F", bg:"#FFFDE7",  accessory:"legend", unlockCount:10 },
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
export const GrowthMascot = ({ id, size = 64, stage = 0, energyTier = 0 }) => {
  const s = size;
  const vb = "0 0 80 80";

  /* ──────────────────────────────────────────────
     EXPRESSION SYSTEM
     energyTier: 0 = happy (full), 1 = content,
                 2 = tired, 3 = sad/hungry (empty)
     Eyes, brows and mouth all change together so the
     face reads as one coherent emotion at every level.
  ────────────────────────────────────────────── */

  /* Eyes — pass each eye centre, sclera radius, and the colour behind the
     eye (used to draw eyelids). owl=true tunes proportions for big eyes.  */
  const Eyes = ({ lx, rx, ey, sr, behind, iris, irisR, owl }) => {
    const pcol = iris || "#1a1a2e";
    const pr   = iris ? irisR : sr * 0.5;
    const hl   = pr * 0.42 + 0.3;
    const browW = owl ? sr * 0.7 : sr * 1.15;
    const browTop = owl ? ey - sr + 1 : ey - sr - 0.5; // keep owl brows clear of ear tufts

    if (energyTier === 0) {
      // HAPPY — wide bright eyes, big sparkle
      return (
        <g>
          <circle cx={lx} cy={ey} r={sr} fill="#fff"/>
          <circle cx={rx} cy={ey} r={sr} fill="#fff"/>
          <circle cx={lx} cy={ey + 0.4} r={pr} fill={pcol}/>
          <circle cx={rx} cy={ey + 0.4} r={pr} fill={pcol}/>
          <circle cx={lx + pr * 0.45} cy={ey - pr * 0.5} r={hl + 0.4} fill="#fff"/>
          <circle cx={rx + pr * 0.45} cy={ey - pr * 0.5} r={hl + 0.4} fill="#fff"/>
        </g>
      );
    }
    if (energyTier === 1) {
      // CONTENT — calm open eyes, smaller highlight
      return (
        <g>
          <circle cx={lx} cy={ey} r={sr} fill="#fff"/>
          <circle cx={rx} cy={ey} r={sr} fill="#fff"/>
          <circle cx={lx} cy={ey + 0.4} r={pr} fill={pcol}/>
          <circle cx={rx} cy={ey + 0.4} r={pr} fill={pcol}/>
          <circle cx={lx + pr * 0.45} cy={ey - pr * 0.5} r={hl} fill="#fff"/>
          <circle cx={rx + pr * 0.45} cy={ey - pr * 0.5} r={hl} fill="#fff"/>
        </g>
      );
    }
    if (energyTier === 2) {
      // TIRED — heavy upper eyelids in the skin/feather colour, pupils low
      const lidDrop = owl ? sr * 0.55 : 0.4; // how far down the lid covers
      return (
        <g>
          <circle cx={lx} cy={ey} r={sr} fill="#fff"/>
          <circle cx={rx} cy={ey} r={sr} fill="#fff"/>
          <circle cx={lx} cy={ey + sr * 0.42} r={pr * (owl ? 0.85 : 1)} fill={pcol}/>
          <circle cx={rx} cy={ey + sr * 0.42} r={pr * (owl ? 0.85 : 1)} fill={pcol}/>
          {/* eyelid */}
          <path d={`M ${lx - sr - 0.6} ${ey + lidDrop} A ${sr + 0.6} ${sr + 0.6} 0 0 1 ${lx + sr + 0.6} ${ey + lidDrop} L ${lx + sr + 0.6} ${ey - sr - 1.5} L ${lx - sr - 0.6} ${ey - sr - 1.5} Z`} fill={behind}/>
          <path d={`M ${rx - sr - 0.6} ${ey + lidDrop} A ${sr + 0.6} ${sr + 0.6} 0 0 1 ${rx + sr + 0.6} ${ey + lidDrop} L ${rx + sr + 0.6} ${ey - sr - 1.5} L ${rx - sr - 0.6} ${ey - sr - 1.5} Z`} fill={behind}/>
          {/* lid edge */}
          <path d={`M ${lx - sr} ${ey + lidDrop} A ${sr} ${sr} 0 0 1 ${lx + sr} ${ey + lidDrop}`} stroke="#333" strokeWidth="1.3" fill="none" strokeLinecap="round"/>
          <path d={`M ${rx - sr} ${ey + lidDrop} A ${sr} ${sr} 0 0 1 ${rx + sr} ${ey + lidDrop}`} stroke="#333" strokeWidth="1.3" fill="none" strokeLinecap="round"/>
        </g>
      );
    }
    // TIER 3 — SAD/HUNGRY: smaller downcast eyes, worried brows, tear
    const esr = owl ? sr * 0.62 : sr * 0.82;
    const epr = owl ? pr * 0.7 : pr * 0.92;
    return (
      <g>
        <circle cx={lx} cy={ey + 1} r={esr} fill="#fff"/>
        <circle cx={rx} cy={ey + 1} r={esr} fill="#fff"/>
        <circle cx={lx} cy={ey + 1 + esr * 0.55} r={epr} fill={pcol}/>
        <circle cx={rx} cy={ey + 1 + esr * 0.55} r={epr} fill={pcol}/>
        {/* worried brows — inner ends raised (classic sad/pleading) */}
        <path d={`M ${lx - browW} ${browTop} Q ${lx} ${browTop - 2.5} ${lx + browW} ${browTop - 3.5}`} stroke="#333" strokeWidth="1.5" fill="none" strokeLinecap="round"/>
        <path d={`M ${rx + browW} ${browTop} Q ${rx} ${browTop - 2.5} ${rx - browW} ${browTop - 3.5}`} stroke="#333" strokeWidth="1.5" fill="none" strokeLinecap="round"/>
        {/* tear under the right eye */}
        <path d={`M ${rx} ${ey + esr + 1} q -1.7 2.6 0 4.4 q 1.7 -1.8 0 -4.4 Z`} fill="#4FC3F7"/>
      </g>
    );
  };

  /* Mouth — symmetric around cx. In SVG (y grows downward) a smile is a
     U: corners up (smaller y), middle down (larger y) → control point BELOW.
     A frown is the reverse → control point ABOVE.                          */
  const Mouth = ({ cx, cy, color = "#333" }) => {
    const r = 7;
    if (energyTier === 0) {
      // Big happy smile
      return <path d={`M ${cx-r} ${cy-2} Q ${cx} ${cy+6} ${cx+r} ${cy-2}`} stroke={color} strokeWidth="2.2" fill="none" strokeLinecap="round"/>;
    } else if (energyTier === 1) {
      // Gentle smile
      return <path d={`M ${cx-r} ${cy-1} Q ${cx} ${cy+3} ${cx+r} ${cy-1}`} stroke={color} strokeWidth="2" fill="none" strokeLinecap="round"/>;
    } else if (energyTier === 2) {
      // Slight frown (tired)
      return <path d={`M ${cx-r} ${cy+0.5} Q ${cx} ${cy-1.5} ${cx+r} ${cy+0.5}`} stroke={color} strokeWidth="2" fill="none" strokeLinecap="round"/>;
    } else {
      // Deep sad frown
      return <path d={`M ${cx-r} ${cy+2} Q ${cx} ${cy-6} ${cx+r} ${cy+2}`} stroke={color} strokeWidth="2.2" fill="none" strokeLinecap="round"/>;
    }
  };

  const bases = {
    fox: <>
      <ellipse cx="40" cy="46" rx="28" ry="24" fill="#FF8A65"/>
      <polygon points="13,18 26,44 38,24" fill="#FF7043"/>
      <polygon points="67,18 54,44 42,24" fill="#FF7043"/>
      <ellipse cx="40" cy="50" rx="16" ry="11" fill="#FFCCBC"/>
      <Eyes lx={30} rx={50} ey={41} sr={5} behind="#FF8A65"/>
      <ellipse cx="40" cy="53" rx="5" ry="3.5" fill="#EF5350"/>
      <Mouth cx={40} cy={58} color="#333"/>
    </>,
    bunny: <>
      <ellipse cx="27" cy="20" rx="7" ry="17" fill="#F8BBD0"/>
      <ellipse cx="53" cy="20" rx="7" ry="17" fill="#F8BBD0"/>
      <ellipse cx="40" cy="50" rx="26" ry="22" fill="#FCE4EC"/>
      <ellipse cx="40" cy="55" rx="14" ry="10" fill="#F8BBD0"/>
      <Eyes lx={30} rx={50} ey={46} sr={5} behind="#FCE4EC"/>
      <ellipse cx="40" cy="57" rx="5" ry="3" fill="#F48FB1"/>
      <Mouth cx={40} cy={62} color="#333"/>
    </>,
    bear: <>
      <circle cx="20" cy="25" r="13" fill="#A1887F"/><circle cx="60" cy="25" r="13" fill="#A1887F"/>
      <ellipse cx="40" cy="50" rx="27" ry="23" fill="#8D6E63"/>
      <ellipse cx="40" cy="56" rx="16" ry="11" fill="#BCAAA4"/>
      <Eyes lx={29} rx={51} ey={45} sr={5.5} behind="#8D6E63"/>
      <ellipse cx="40" cy="58" rx="5" ry="3.5" fill="#795548"/>
      <Mouth cx={40} cy={63} color="#333"/>
    </>,
    owl: <>
      <ellipse cx="40" cy="48" rx="26" ry="26" fill="#7E57C2"/>
      <ellipse cx="40" cy="52" rx="18" ry="18" fill="#B39DDB"/>
      <ellipse cx="22" cy="24" rx="7" ry="9" fill="#7E57C2"/>
      <ellipse cx="58" cy="24" rx="7" ry="9" fill="#7E57C2"/>
      <Eyes lx={29} rx={51} ey={43} sr={9} behind="#7E57C2" iris="#4527A0" irisR={5} owl/>
      <polygon points="40,51 37,56 43,56" fill="#FFA726"/>
      <Mouth cx={40} cy={61} color="#333"/>
    </>,
    cat: <>
      <polygon points="17,30 12,10 30,26" fill="#26A69A"/>
      <polygon points="63,30 68,10 50,26" fill="#26A69A"/>
      <ellipse cx="40" cy="50" rx="26" ry="23" fill="#4DB6AC"/>
      <ellipse cx="40" cy="55" rx="15" ry="11" fill="#B2DFDB"/>
      <Eyes lx={29} rx={51} ey={45} sr={5.5} behind="#4DB6AC"/>
      <ellipse cx="40" cy="57" rx="5" ry="3" fill="#FF8A80"/>
      <Mouth cx={40} cy={62} color="#333"/>
    </>,
    dog: <>
      <ellipse cx="16" cy="36" rx="9" ry="16" fill="#FFA726" transform="rotate(-20 16 36)"/>
      <ellipse cx="64" cy="36" rx="9" ry="16" fill="#FFA726" transform="rotate(20 64 36)"/>
      <ellipse cx="40" cy="50" rx="27" ry="23" fill="#FFB74D"/>
      <ellipse cx="40" cy="56" rx="17" ry="12" fill="#FFE0B2"/>
      <Eyes lx={29} rx={51} ey={45} sr={5.5} behind="#FFB74D"/>
      <ellipse cx="40" cy="58" rx="6" ry="4" fill="#FF7043"/>
      <Mouth cx={40} cy={63} color="#333"/>
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
   GARDEN ITEM SVG RENDERERS
   Each renderer receives (cx, groundY, scale, w, h, animSuffix)
   cx        = centre x of the item
   groundY   = y of the ground horizon
   scale     = size multiplier (0.6–1.4)
   animSuffix= unique string for animation/gradient IDs
══════════════════════════════════════════════ */
export const GardenItemSVG = ({ id, cx, groundY, scale=1, w, h, idx }) => {
  const s = scale;
  const gY = groundY;
  const suf = `gi_${id}_${idx}`;

  /* Variant IDs map to the closest base renderer */
  const BASE_ID = {
    g_cherry2:"g_cherry",  g_cherry3:"g_cherry",  g_cherry4:"g_cherry",  g_cherry5:"g_cherry",
    g_rose2:"g_rose",      g_rose3:"g_rose",      g_rose4:"g_rose",      g_rose5:"g_rose",    g_rose6:"g_rose",
    g_tulip2:"g_tulip",
    g_daisy2:"g_daisy",    g_daisy3:"g_daisy",
    g_bluebell2:"g_bluebell",
    g_bamboo2:"g_bamboo",  g_bamboo3:"g_bamboo",
    g_fern2:"g_fern",      g_fern3:"g_fern",
    g_cactus2:"g_cactus",
    g_mushroom2:"g_mushroom",g_mushroom3:"g_mushroom",g_mushroom4:"g_mushroom",g_mushroom5:"g_bamboo",
    g_sunflower2:"g_sunflower",g_sunflower3:"g_sunflower",
    g_ladybug2:"g_ladybug",g_ladybug3:"g_ladybug",
    g_butterfly2:"g_butterfly",g_butterfly3:"g_butterfly",g_butterfly4:"g_butterfly",
    g_butterfly5:"g_butterfly",g_butterfly6:"g_butterfly",
    g_beehive2:"g_cherry",  g_beehive3:"g_beehive", // beehive2 = flower arch → cherry blossom shape
    g_birdbath2:"g_birdbath",
    g_gnome2:"g_ladybug",   g_gnome3:"g_gnome",    g_gnome4:"g_gnome",    g_gnome5:"g_gnome",
    g_treehouse2:"g_treehouse",g_treehouse3:"g_treehouse",
    g_windmill2:"g_windmill",  g_windmill3:"g_windmill",
    g_fountain2:"g_fountain",  g_fountain3:"g_fountain",  g_fountain4:"g_fountain",
    g_rainbow2:"g_rainbow",    g_rainbow3:"g_rainbow",    g_rainbow4:"g_rainbow",
    g_fireflies2:"g_beehive",  g_fireflies3:"g_fireflies",
  };
  const resolvedId = BASE_ID[id] || id;

  const items = {

    /* ── Flowers ── */
    g_sunflower: () => {
      const stemTop = gY - h*0.28*s;
      return (
        <g key={suf}>
          {/* Stem */}
          <line x1={cx} y1={gY} x2={cx} y2={stemTop} stroke="#43A047" strokeWidth={3.5*s} strokeLinecap="round"/>
          {/* Leaf */}
          <ellipse cx={cx-7*s} cy={gY-h*0.14*s} rx={8*s} ry={4*s} fill="#66BB6A"
            transform={`rotate(-35 ${cx-7*s} ${gY-h*0.14*s})`}/>
          {/* Petals */}
          {[0,40,80,120,160,200,240,280,320].map((a,i)=>{
            const r=a*Math.PI/180;
            return <ellipse key={i}
              cx={cx+Math.cos(r)*13*s} cy={stemTop+Math.sin(r)*13*s}
              rx={7*s} ry={4*s} fill="#FFD54F" opacity="0.95"
              transform={`rotate(${a} ${cx+Math.cos(r)*13*s} ${stemTop+Math.sin(r)*13*s})`}/>;
          })}
          <circle cx={cx} cy={stemTop} r={9*s} fill="#8D4E00"/>
          <circle cx={cx} cy={stemTop} r={5*s} fill="#5D3A00"/>
          {/* Seed dots */}
          {[0,60,120,180,240,300].map((a,i)=>{
            const r=a*Math.PI/180;
            return <circle key={i} cx={cx+Math.cos(r)*3.5*s} cy={stemTop+Math.sin(r)*3.5*s}
              r={1.2*s} fill="#FFD54F" opacity="0.7"/>;
          })}
        </g>
      );
    },

    g_rose: () => {
      const stemTop = gY - h*0.22*s;
      return (
        <g key={suf}>
          <line x1={cx} y1={gY} x2={cx} y2={stemTop} stroke="#2E7D32" strokeWidth={3*s} strokeLinecap="round"/>
          {/* Thorns */}
          <line x1={cx} y1={gY-h*0.08*s} x2={cx+6*s} y2={gY-h*0.1*s} stroke="#2E7D32" strokeWidth={1.5*s} strokeLinecap="round"/>
          <ellipse cx={cx+7*s} cy={stemTop-h*0.03*s} rx={6*s} ry={4.5*s} fill="#66BB6A"
            transform={`rotate(25 ${cx+7*s} ${stemTop-h*0.03*s})`}/>
          {/* Rose petals — layered circles */}
          <circle cx={cx} cy={stemTop} r={10*s} fill="#E53935" opacity="0.9"/>
          <circle cx={cx-4*s} cy={stemTop-2*s} r={7*s} fill="#EF5350"/>
          <circle cx={cx+3*s} cy={stemTop-3*s} r={7*s} fill="#E53935"/>
          <circle cx={cx} cy={stemTop-5*s} r={6*s} fill="#EF9A9A"/>
          <circle cx={cx} cy={stemTop-2*s} r={3.5*s} fill="#B71C1C" opacity="0.8"/>
        </g>
      );
    },

    g_tulip: () => {
      const stemTop = gY - h*0.24*s;
      return (
        <g key={suf}>
          <line x1={cx} y1={gY} x2={cx} y2={stemTop} stroke="#388E3C" strokeWidth={3*s} strokeLinecap="round"/>
          <ellipse cx={cx-8*s} cy={gY-h*0.1*s} rx={9*s} ry={4*s} fill="#66BB6A"
            transform={`rotate(-30 ${cx-8*s} ${gY-h*0.1*s})`}/>
          {/* Cup petals */}
          <ellipse cx={cx-6*s} cy={stemTop-4*s} rx={6*s} ry={11*s} fill="#CE93D8"
            transform={`rotate(-12 ${cx-6*s} ${stemTop-4*s})`}/>
          <ellipse cx={cx+6*s} cy={stemTop-4*s} rx={6*s} ry={11*s} fill="#BA68C8"
            transform={`rotate(12 ${cx+6*s} ${stemTop-4*s})`}/>
          <ellipse cx={cx} cy={stemTop-5*s} rx={5.5*s} ry={11*s} fill="#CE93D8"/>
          <ellipse cx={cx} cy={stemTop+2*s} rx={8*s} ry={5*s} fill="#AB47BC" opacity="0.5"/>
        </g>
      );
    },

    g_daisy: () => {
      // Three small daisies in a cluster
      const offsets = [-10*s, 0, 9*s];
      const tops    = [gY-h*0.15*s, gY-h*0.18*s, gY-h*0.14*s];
      return (
        <g key={suf}>
          {offsets.map((ox, di)=>{
            const fx = cx+ox; const ft = tops[di];
            return (
              <g key={di}>
                <line x1={fx} y1={gY} x2={fx} y2={ft} stroke="#43A047" strokeWidth={2.2*s} strokeLinecap="round"/>
                {[0,45,90,135,180,225,270,315].map((a,pi)=>{
                  const r=a*Math.PI/180;
                  return <ellipse key={pi} cx={fx+Math.cos(r)*6*s} cy={ft+Math.sin(r)*6*s}
                    rx={3.5*s} ry={2*s} fill="white" opacity="0.95"
                    transform={`rotate(${a} ${fx+Math.cos(r)*6*s} ${ft+Math.sin(r)*6*s})`}/>;
                })}
                <circle cx={fx} cy={ft} r={3.5*s} fill="#FFD54F"/>
              </g>
            );
          })}
        </g>
      );
    },

    g_bluebell: () => {
      // Two nodding bluebells
      const stems = [{ox:-7*s,ht:h*0.2*s,tilt:-18},{ox:5*s,ht:h*0.17*s,tilt:8}];
      return (
        <g key={suf}>
          {stems.map((st, si)=>{
            const fx = cx+st.ox; const ft = gY-st.ht;
            const bx = fx + Math.sin(st.tilt*Math.PI/180)*10*s;
            const by = ft + 8*s;
            return (
              <g key={si}>
                <path d={`M${fx},${gY} C${fx},${gY-st.ht*0.6} ${bx},${ft} ${bx},${by}`}
                  stroke="#388E3C" strokeWidth={2.5*s} fill="none" strokeLinecap="round"/>
                {/* Bell shape */}
                <path d={`M${bx-7*s},${by} Q${bx-9*s},${by+10*s} ${bx},${by+13*s} Q${bx+9*s},${by+10*s} ${bx+7*s},${by}`}
                  fill="#4FC3F7" opacity="0.9"/>
                <path d={`M${bx-5*s},${by} Q${bx},${by-4*s} ${bx+5*s},${by}`}
                  fill="#29B6F6" opacity="0.7"/>
                {/* Stamen */}
                <line x1={bx} y1={by+2*s} x2={bx} y2={by+11*s} stroke="#FFF9C4" strokeWidth={1.2*s} strokeLinecap="round"/>
                <circle cx={bx} cy={by+11*s} r={1.5*s} fill="#FFD54F"/>
              </g>
            );
          })}
        </g>
      );
    },

    g_cherry: () => {
      // Cherry blossom tree — trunk, branches, blossoms
      const trunkH = h*0.38*s;
      const trunkTop = gY - trunkH;
      return (
        <g key={suf}>
          {/* Trunk */}
          <path d={`M${cx-4*s},${gY} C${cx-3*s},${gY-trunkH*0.5} ${cx+2*s},${gY-trunkH*0.7} ${cx},${trunkTop}`}
            stroke="#795548" strokeWidth={7*s} fill="none" strokeLinecap="round"/>
          {/* Main branches */}
          <path d={`M${cx},${trunkTop} C${cx-15*s},${trunkTop-8*s} ${cx-28*s},${trunkTop+2*s} ${cx-32*s},${trunkTop-5*s}`}
            stroke="#795548" strokeWidth={4*s} fill="none" strokeLinecap="round"/>
          <path d={`M${cx},${trunkTop} C${cx+12*s},${trunkTop-10*s} ${cx+25*s},${trunkTop+4*s} ${cx+30*s},${trunkTop-8*s}`}
            stroke="#795548" strokeWidth={4*s} fill="none" strokeLinecap="round"/>
          <path d={`M${cx},${trunkTop} C${cx-5*s},${trunkTop-14*s} ${cx+8*s},${trunkTop-22*s} ${cx},${trunkTop-26*s}`}
            stroke="#795548" strokeWidth={3.5*s} fill="none" strokeLinecap="round"/>
          {/* Blossom clouds */}
          {[
            {ox:0,  oy:-28*s, r:22*s},
            {ox:-28*s,oy:-6*s,  r:16*s},
            {ox:26*s, oy:-10*s, r:17*s},
            {ox:-14*s,oy:-20*s, r:15*s},
            {ox:14*s, oy:-22*s, r:14*s},
          ].map((b, bi)=>(
            <circle key={bi} cx={cx+b.ox} cy={trunkTop+b.oy} r={b.r}
              fill="#F48FB1" opacity={0.78+bi*0.02}/>
          ))}
          {/* Individual petals scattered */}
          {[{ox:-18*s,oy:-12*s},{ox:22*s,oy:-8*s},{ox:-6*s,oy:-32*s},{ox:8*s,oy:-26*s},{ox:-26*s,oy:0},{ox:28*s,oy:-2*s}].map((p,pi)=>(
            <circle key={pi} cx={cx+p.ox} cy={trunkTop+p.oy} r={4*s} fill="#FCE4EC" opacity="0.9"/>
          ))}
        </g>
      );
    },

    /* ── Plants ── */
    g_cactus: () => {
      const baseH = h*0.26*s;
      return (
        <g key={suf}>
          {/* Main trunk */}
          <rect x={cx-5*s} y={gY-baseH} width={10*s} height={baseH} rx={5*s} fill="#66BB6A"/>
          {/* Left arm */}
          <rect x={cx-14*s} y={gY-baseH*0.65} width={9*s} height={6*s} rx={3*s} fill="#66BB6A"/>
          <rect x={cx-16*s} y={gY-baseH*0.65-14*s} width={6*s} height={16*s} rx={3*s} fill="#66BB6A"/>
          {/* Right arm */}
          <rect x={cx+5*s} y={gY-baseH*0.55} width={9*s} height={6*s} rx={3*s} fill="#66BB6A"/>
          <rect x={cx+8*s} y={gY-baseH*0.55-12*s} width={6*s} height={14*s} rx={3*s} fill="#66BB6A"/>
          {/* Spines */}
          {[0.3,0.55,0.78].map((t,i)=>(
            <g key={i}>
              <line x1={cx-5*s} y1={gY-baseH*t} x2={cx-10*s} y2={gY-baseH*t-2*s} stroke="#A5D6A7" strokeWidth={1.2*s}/>
              <line x1={cx+5*s} y1={gY-baseH*t} x2={cx+10*s} y2={gY-baseH*t-2*s} stroke="#A5D6A7" strokeWidth={1.2*s}/>
            </g>
          ))}
          {/* Top flower */}
          {[0,72,144,216,288].map((a,i)=>{
            const r=a*Math.PI/180;
            return <circle key={i} cx={cx+Math.cos(r)*5*s} cy={gY-baseH+Math.sin(r)*5*s}
              r={3*s} fill="#F48FB1"/>;
          })}
          <circle cx={cx} cy={gY-baseH} r={3*s} fill="#FFD54F"/>
        </g>
      );
    },

    g_bamboo: () => {
      const stalks = [{ox:-9*s,ht:h*0.42*s},{ox:0,ht:h*0.5*s},{ox:9*s,ht:h*0.38*s}];
      return (
        <g key={suf}>
          {stalks.map((st, si) => {
            const segments = 4;
            const segH = st.ht / segments;
            return (
              <g key={si}>
                {Array.from({length:segments},(_,i)=>(
                  <g key={i}>
                    <rect x={cx+st.ox-3.5*s} y={gY-st.ht+segH*i} width={7*s} height={segH-2}
                      rx={3*s} fill={i%2===0?"#66BB6A":"#81C784"}/>
                    {/* Node ring */}
                    <rect x={cx+st.ox-4*s} y={gY-st.ht+segH*(i+1)-3} width={8*s} height={4}
                      rx={2*s} fill="#43A047" opacity="0.7"/>
                  </g>
                ))}
                {/* Leaves at top */}
                <ellipse cx={cx+st.ox-10*s} cy={gY-st.ht-4*s} rx={11*s} ry={4*s} fill="#4CAF50"
                  transform={`rotate(-28 ${cx+st.ox-10*s} ${gY-st.ht-4*s})`}/>
                <ellipse cx={cx+st.ox+10*s} cy={gY-st.ht-2*s} rx={11*s} ry={4*s} fill="#66BB6A"
                  transform={`rotate(22 ${cx+st.ox+10*s} ${gY-st.ht-2*s})`}/>
              </g>
            );
          })}
        </g>
      );
    },

    g_mushroom: () => {
      // Two mushrooms side by side
      const shrooms = [{ox:-8*s,ht:h*0.14*s,cap:12*s,cc:"#EF5350"},{ox:7*s,ht:h*0.1*s,cap:9*s,cc:"#E53935"}];
      return (
        <g key={suf}>
          {shrooms.map((sh,si)=>{
            const fx=cx+sh.ox; const ft=gY-sh.ht;
            return (
              <g key={si}>
                {/* Stem */}
                <rect x={fx-sh.cap*0.35} y={ft} width={sh.cap*0.7} height={sh.ht} rx={sh.cap*0.3} fill="#FFF9C4"/>
                {/* Cap */}
                <ellipse cx={fx} cy={ft} rx={sh.cap} ry={sh.cap*0.55} fill={sh.cc}/>
                <path d={`M${fx-sh.cap},${ft} Q${fx},${ft-sh.cap*0.9} ${fx+sh.cap},${ft}`}
                  fill={sh.cc} opacity="0.95"/>
                {/* Spots */}
                <circle cx={fx-sh.cap*0.35} cy={ft-sh.cap*0.25} r={sh.cap*0.18} fill="white" opacity="0.85"/>
                <circle cx={fx+sh.cap*0.3} cy={ft-sh.cap*0.18} r={sh.cap*0.14} fill="white" opacity="0.85"/>
                <circle cx={fx} cy={ft-sh.cap*0.45} r={sh.cap*0.12} fill="white" opacity="0.8"/>
              </g>
            );
          })}
        </g>
      );
    },

    g_fern: () => {
      // Arching fern fronds
      const fronds = [
        {angle:-55, len:h*0.22*s},
        {angle:-25, len:h*0.26*s},
        {angle:5,   len:h*0.25*s},
        {angle:35,  len:h*0.21*s},
        {angle:60,  len:h*0.17*s},
      ];
      return (
        <g key={suf}>
          {fronds.map((fr, fi)=>{
            const rad = fr.angle*Math.PI/180;
            const ex = cx + Math.sin(rad)*fr.len;
            const ey = gY - Math.cos(rad)*fr.len;
            const mx = cx + Math.sin(rad)*fr.len*0.55;
            const my = gY - Math.cos(rad)*fr.len*0.55;
            const leafCount = 5;
            return (
              <g key={fi}>
                <path d={`M${cx},${gY} Q${mx},${my} ${ex},${ey}`}
                  stroke="#388E3C" strokeWidth={2.2*s} fill="none" strokeLinecap="round"/>
                {Array.from({length:leafCount},(_,li)=>{
                  const t=(li+1)/(leafCount+1);
                  const lx=cx+(ex-cx)*t; const ly=gY+(ey-gY)*t;
                  const perpRad=(fr.angle+85)*Math.PI/180;
                  const lsize=(6+li*1.5)*s*(1-t*0.4);
                  return (
                    <ellipse key={li}
                      cx={lx+Math.sin(perpRad)*lsize*0.5} cy={ly-Math.cos(perpRad)*lsize*0.5}
                      rx={lsize} ry={lsize*0.38}
                      fill="#4CAF50" opacity="0.85"
                      transform={`rotate(${fr.angle+85} ${lx+Math.sin(perpRad)*lsize*0.5} ${ly-Math.cos(perpRad)*lsize*0.5})`}/>
                  );
                })}
              </g>
            );
          })}
        </g>
      );
    },

    /* ── Decorations ── */
    g_butterfly: () => {
      const bx = cx; const by = gY - h*0.3*s;
      return (
        <g key={suf} style={{animation:"gFloat 3.5s ease-in-out infinite"}}>
          <ellipse cx={bx-12*s} cy={by-6*s} rx={13*s} ry={9*s} fill="#CE93D8" opacity="0.92"
            transform={`rotate(-22 ${bx-12*s} ${by-6*s})`}/>
          <ellipse cx={bx+12*s} cy={by-6*s} rx={13*s} ry={9*s} fill="#BA68C8" opacity="0.92"
            transform={`rotate(22 ${bx+12*s} ${by-6*s})`}/>
          <ellipse cx={bx-8*s}  cy={by+7*s}  rx={9*s}  ry={6*s}  fill="#CE93D8" opacity="0.72"
            transform={`rotate(28 ${bx-8*s} ${by+7*s})`}/>
          <ellipse cx={bx+8*s}  cy={by+7*s}  rx={9*s}  ry={6*s}  fill="#BA68C8" opacity="0.72"
            transform={`rotate(-28 ${bx+8*s} ${by+7*s})`}/>
          {/* Body */}
          <ellipse cx={bx} cy={by} rx={2.5*s} ry={10*s} fill="#4A148C" opacity="0.8"/>
          {/* Antennae */}
          <line x1={bx} y1={by-9*s} x2={bx-8*s} y2={by-18*s} stroke="#4A148C" strokeWidth={1.2*s} opacity="0.7"/>
          <line x1={bx} y1={by-9*s} x2={bx+8*s}  y2={by-18*s} stroke="#4A148C" strokeWidth={1.2*s} opacity="0.7"/>
          <circle cx={bx-8*s} cy={by-18*s} r={2.2*s} fill="#CE93D8"/>
          <circle cx={bx+8*s}  cy={by-18*s} r={2.2*s} fill="#CE93D8"/>
          {/* Wing patterns */}
          <circle cx={bx-10*s} cy={by-4*s} r={3*s} fill="#E1BEE7" opacity="0.6"/>
          <circle cx={bx+10*s} cy={by-4*s} r={3*s} fill="#E1BEE7" opacity="0.6"/>
        </g>
      );
    },

    g_ladybug: () => {
      const lx=cx; const ly=gY-11*s;
      return (
        <g key={suf}>
          {/* Leaf perch */}
          <ellipse cx={lx} cy={gY-4*s} rx={14*s} ry={5*s} fill="#66BB6A" opacity="0.8"
            transform={`rotate(-8 ${lx} ${gY-4*s})`}/>
          {/* Body — dome */}
          <ellipse cx={lx} cy={ly} rx={10*s} ry={8*s} fill="#E53935"/>
          {/* Head */}
          <circle cx={lx} cy={ly-9*s} r={5.5*s} fill="#1a1a1a"/>
          {/* White eyes */}
          <circle cx={lx-2.8*s} cy={ly-10.5*s} r={2*s} fill="white"/>
          <circle cx={lx+2.8*s} cy={ly-10.5*s} r={2*s} fill="white"/>
          {/* Centre line */}
          <line x1={lx} y1={ly-7*s} x2={lx} y2={ly+7*s} stroke="#1a1a1a" strokeWidth={1.5*s} opacity="0.7"/>
          {/* Spots */}
          <circle cx={lx-4.5*s} cy={ly-3*s} r={2.5*s} fill="#1a1a1a"/>
          <circle cx={lx+4.5*s} cy={ly-3*s} r={2.5*s} fill="#1a1a1a"/>
          <circle cx={lx-4*s}   cy={ly+3*s} r={2*s}   fill="#1a1a1a"/>
          <circle cx={lx+4*s}   cy={ly+3*s} r={2*s}   fill="#1a1a1a"/>
          {/* Antennae */}
          <line x1={lx-2*s} y1={ly-14*s} x2={lx-7*s} y2={ly-20*s} stroke="#1a1a1a" strokeWidth={1.2*s}/>
          <line x1={lx+2*s} y1={ly-14*s} x2={lx+7*s}  y2={ly-20*s} stroke="#1a1a1a" strokeWidth={1.2*s}/>
          <circle cx={lx-7*s} cy={ly-20*s} r={2*s} fill="#1a1a1a"/>
          <circle cx={lx+7*s}  cy={ly-20*s} r={2*s} fill="#1a1a1a"/>
        </g>
      );
    },

    g_beehive: () => {
      const hx=cx; const hy=gY-h*0.22*s;
      const stripes = 4;
      return (
        <g key={suf}>
          {/* Branch it hangs on */}
          <line x1={hx-18*s} y1={gY-h*0.28*s} x2={hx+18*s} y2={gY-h*0.28*s}
            stroke="#795548" strokeWidth={3.5*s} strokeLinecap="round"/>
          <line x1={hx} y1={gY-h*0.28*s} x2={hx} y2={hy}
            stroke="#A1887F" strokeWidth={2*s} strokeLinecap="round"/>
          {/* Hive body — stacked ellipses */}
          {Array.from({length:stripes},(_,i)=>{
            const t = i/stripes; const bRx=(16-i*1.5)*s; const bRy=8*s;
            const by = hy + (i/(stripes-1))*(h*0.16*s);
            return <ellipse key={i} cx={hx} cy={by} rx={bRx} ry={bRy}
              fill={i%2===0?"#FFD54F":"#FFA726"} opacity="0.95"/>;
          })}
          {/* Entrance hole */}
          <ellipse cx={hx} cy={gY-h*0.07*s} rx={5*s} ry={3.5*s} fill="#5D4037"/>
          {/* Bees */}
          {[{ox:22*s,oy:-h*0.18*s},{ox:-20*s,oy:-h*0.24*s}].map((b,bi)=>(
            <g key={bi} style={{animation:`gFloat ${3+bi}s ease-in-out infinite`, animationDelay:`${bi*0.8}s`}}>
              <ellipse cx={hx+b.ox} cy={gY+b.oy} rx={5*s} ry={3.5*s} fill="#FFD54F"/>
              <line x1={hx+b.ox-5*s} y1={gY+b.oy} x2={hx+b.ox+5*s} y2={gY+b.oy}
                stroke="#5D4037" strokeWidth={1.5*s} opacity="0.6"/>
              <ellipse cx={hx+b.ox-3*s} cy={gY+b.oy-3*s} rx={4*s} ry={2.5*s} fill="rgba(255,255,255,0.55)"/>
              <ellipse cx={hx+b.ox+3*s} cy={gY+b.oy-3*s} rx={4*s} ry={2.5*s} fill="rgba(255,255,255,0.55)"/>
            </g>
          ))}
        </g>
      );
    },

    g_birdbath: () => {
      const bx=cx;
      return (
        <g key={suf}>
          {/* Pedestal */}
          <rect x={bx-4*s} y={gY-h*0.22*s} width={8*s} height={h*0.22*s} rx={4*s} fill="#B0BEC5"/>
          <ellipse cx={bx} cy={gY} rx={10*s} ry={4*s} fill="#90A4AE"/>
          {/* Basin */}
          <ellipse cx={bx} cy={gY-h*0.22*s} rx={20*s} ry={7*s} fill="#90A4AE"/>
          <ellipse cx={bx} cy={gY-h*0.22*s} rx={17*s} ry={5.5*s} fill="#4FC3F7" opacity="0.85"/>
          {/* Water ripple */}
          <ellipse cx={bx} cy={gY-h*0.22*s} rx={10*s} ry={3*s} fill="none"
            stroke="rgba(255,255,255,0.5)" strokeWidth={1.5*s}/>
          {/* Bird */}
          <g style={{animation:"gFloat 2.8s ease-in-out infinite"}}>
            <ellipse cx={bx+6*s} cy={gY-h*0.26*s} rx={7*s} ry={4*s} fill="#FF7043"/>
            <circle cx={bx+10*s} cy={gY-h*0.27*s} r={3.5*s} fill="#FF8A65"/>
            <ellipse cx={bx+6*s} cy={gY-h*0.3*s} rx={9*s} ry={3*s} fill="#FF7043" opacity="0.8"/>
            <ellipse cx={bx+5*s} cy={gY-h*0.22*s} rx={4*s} ry={2*s} fill="#E64A19" opacity="0.7"/>
            <circle cx={bx+13*s} cy={gY-h*0.272*s} r={1.5*s} fill="#1a1a1a"/>
            <path d={`M${bx+13.5*s},${gY-h*0.257*s} l${3*s},0`} stroke="#FFD54F" strokeWidth={1.5*s} strokeLinecap="round"/>
          </g>
        </g>
      );
    },

    g_rainbow: () => {
      const rx=cx; const ry=gY-h*0.12*s;
      const colors=["#EF5350","#FF7043","#FFD54F","#66BB6A","#4FC3F7","#CE93D8"];
      return (
        <g key={suf}>
          {colors.map((c,ci)=>{
            const r=(22+ci*5)*s;
            return <path key={ci}
              d={`M${rx-r},${ry} A${r},${r} 0 0,1 ${rx+r},${ry}`}
              fill="none" stroke={c} strokeWidth={4*s} opacity={0.82-ci*0.04} strokeLinecap="round"/>;
          })}
          {/* Cloud ends */}
          {[-1,1].map(side=>(
            <g key={side}>
              <circle cx={cx+side*(22+5*5)*s} cy={ry} r={8*s} fill="white" opacity="0.85"/>
              <circle cx={cx+side*(22+5*5+7)*s} cy={ry+2*s} r={6*s} fill="white" opacity="0.8"/>
              <circle cx={cx+side*(22+5*5-6)*s} cy={ry+3*s} r={6*s} fill="white" opacity="0.8"/>
            </g>
          ))}
        </g>
      );
    },

    g_gnome: () => {
      const gx=cx; const baseY=gY;
      return (
        <g key={suf}>
          {/* Feet */}
          <ellipse cx={gx-5*s} cy={baseY-3*s} rx={6*s} ry={4*s} fill="#795548"/>
          <ellipse cx={gx+5*s} cy={baseY-3*s} rx={6*s} ry={4*s} fill="#795548"/>
          {/* Body */}
          <ellipse cx={gx} cy={baseY-h*0.12*s} rx={10*s} ry={h*0.1*s} fill="#E53935"/>
          {/* Arms out */}
          <ellipse cx={gx-13*s} cy={baseY-h*0.12*s} rx={5*s} ry={3*s} fill="#FFCCBC"
            transform={`rotate(-20 ${gx-13*s} ${baseY-h*0.12*s})`}/>
          <ellipse cx={gx+13*s} cy={baseY-h*0.12*s} rx={5*s} ry={3*s} fill="#FFCCBC"
            transform={`rotate(20 ${gx+13*s} ${baseY-h*0.12*s})`}/>
          {/* Belt */}
          <rect x={gx-10*s} y={baseY-h*0.155*s} width={20*s} height={4*s} rx={2*s} fill="#5D4037"/>
          <circle cx={gx} cy={baseY-h*0.145*s} r={2.5*s} fill="#FFD54F"/>
          {/* Head */}
          <circle cx={gx} cy={baseY-h*0.25*s} r={9*s} fill="#FFCCBC"/>
          {/* Beard */}
          <ellipse cx={gx} cy={baseY-h*0.2*s} rx={8*s} ry={6*s} fill="white" opacity="0.92"/>
          {/* Eyes */}
          <circle cx={gx-3.5*s} cy={baseY-h*0.26*s} r={1.8*s} fill="#1a1a2e"/>
          <circle cx={gx+3.5*s} cy={baseY-h*0.26*s} r={1.8*s} fill="#1a1a2e"/>
          {/* Nose */}
          <circle cx={gx} cy={baseY-h*0.24*s} r={2.5*s} fill="#FFAB91"/>
          {/* Hat */}
          <ellipse cx={gx} cy={baseY-h*0.31*s} rx={11*s} ry={3.5*s} fill="#E53935"/>
          <path d={`M${gx-8*s},${baseY-h*0.32*s} L${gx},${baseY-h*0.48*s} L${gx+8*s},${baseY-h*0.32*s}`}
            fill="#E53935"/>
          <circle cx={gx} cy={baseY-h*0.49*s} r={2.5*s} fill="white"/>
        </g>
      );
    },

    /* ── Special ── */
    g_fountain: () => {
      const fx=cx;
      return (
        <g key={suf}>
          {/* Base pedestal */}
          <ellipse cx={fx} cy={gY} rx={18*s} ry={5*s} fill="#90A4AE"/>
          <rect x={fx-6*s} y={gY-h*0.18*s} width={12*s} height={h*0.18*s} rx={5*s} fill="#B0BEC5"/>
          {/* Lower basin */}
          <ellipse cx={fx} cy={gY-h*0.18*s} rx={20*s} ry={7*s} fill="#90A4AE"/>
          <ellipse cx={fx} cy={gY-h*0.18*s} rx={17*s} ry={5*s} fill="#4FC3F7" opacity="0.8"/>
          {/* Upper pedestal */}
          <rect x={fx-4*s} y={gY-h*0.32*s} width={8*s} height={h*0.14*s} rx={4*s} fill="#B0BEC5"/>
          {/* Upper basin */}
          <ellipse cx={fx} cy={gY-h*0.32*s} rx={13*s} ry={5*s} fill="#90A4AE"/>
          <ellipse cx={fx} cy={gY-h*0.32*s} rx={11*s} ry={3.5*s} fill="#81D4FA" opacity="0.85"/>
          {/* Water streams */}
          {[-18*s, -9*s, 0, 9*s, 18*s].map((ox,wi)=>(
            <path key={wi}
              d={`M${fx},${gY-h*0.34*s} Q${fx+ox*0.6},${gY-h*0.38*s} ${fx+ox},${gY-h*0.21*s}`}
              fill="none" stroke="#81D4FA" strokeWidth={2*s} opacity="0.7" strokeLinecap="round">
              <animate attributeName="opacity" values="0.4;0.8;0.4" dur={`${1.5+wi*0.2}s`} repeatCount="indefinite"/>
            </path>
          ))}
          {/* Splash droplets */}
          {[-14*s,0,14*s].map((ox,di)=>(
            <circle key={di} cx={fx+ox} cy={gY-h*0.2*s} r={2.5*s} fill="#B3E5FC" opacity="0.7">
              <animate attributeName="opacity" values="0;0.8;0" dur="1.8s" begin={`${di*0.4}s`} repeatCount="indefinite"/>
            </circle>
          ))}
        </g>
      );
    },

    g_windmill: () => {
      const wx=cx; const baseTop=gY-h*0.38*s;
      return (
        <g key={suf}>
          {/* Tower */}
          <path d={`M${wx-7*s},${gY} L${wx-4*s},${baseTop} L${wx+4*s},${baseTop} L${wx+7*s},${gY} Z`}
            fill="#CE93D8"/>
          {/* Door */}
          <rect x={wx-4*s} y={gY-h*0.1*s} width={8*s} height={h*0.1*s} rx={3*s} fill="#7B1FA2" opacity="0.6"/>
          {/* Windows */}
          <circle cx={wx} cy={gY-h*0.2*s} r={3.5*s} fill="#E1BEE7"/>
          <circle cx={wx} cy={gY-h*0.3*s} r={3*s} fill="#E1BEE7"/>
          {/* Cap */}
          <ellipse cx={wx} cy={baseTop} rx={9*s} ry={4*s} fill="#AB47BC"/>
          <path d={`M${wx-8*s},${baseTop} L${wx},${baseTop-10*s} L${wx+8*s},${baseTop} Z`} fill="#AB47BC"/>
          {/* Hub */}
          <circle cx={wx} cy={baseTop} r={4*s} fill="#FFD54F"/>
          {/* Blades — animated rotation */}
          <g style={{animation:"gSpin 4s linear infinite", transformOrigin:`${wx}px ${baseTop}px`}}>
            {[0,90,180,270].map((a,bi)=>{
              const r=a*Math.PI/180;
              return (
                <g key={bi} transform={`rotate(${a} ${wx} ${baseTop})`}>
                  <path d={`M${wx},${baseTop} L${wx-5*s},${baseTop-22*s} L${wx+5*s},${baseTop-22*s} Z`}
                    fill="#F3E5F5" stroke="#CE93D8" strokeWidth={1*s} opacity="0.9"/>
                </g>
              );
            })}
          </g>
        </g>
      );
    },

    g_treehouse: () => {
      const tx=cx; const trunkTop=gY-h*0.3*s;
      return (
        <g key={suf}>
          {/* Trunk */}
          <rect x={tx-8*s} y={gY-h*0.3*s} width={16*s} height={h*0.3*s} rx={7*s} fill="#795548"/>
          {/* Foliage */}
          <circle cx={tx} cy={trunkTop-14*s} r={26*s} fill="#43A047" opacity="0.9"/>
          <circle cx={tx-16*s} cy={trunkTop-8*s} r={18*s} fill="#388E3C" opacity="0.88"/>
          <circle cx={tx+16*s} cy={trunkTop-8*s} r={18*s} fill="#388E3C" opacity="0.88"/>
          {/* House platform */}
          <rect x={tx-18*s} y={trunkTop-3*s} width={36*s} height={5*s} rx={2*s} fill="#8D6E63"/>
          {/* House body */}
          <rect x={tx-14*s} y={trunkTop-18*s} width={28*s} height={15*s} rx={3*s} fill="#FFCCBC"/>
          {/* Roof */}
          <path d={`M${tx-17*s},${trunkTop-18*s} L${tx},${trunkTop-30*s} L${tx+17*s},${trunkTop-18*s} Z`}
            fill="#E53935"/>
          {/* Door */}
          <rect x={tx-4*s} y={trunkTop-11*s} width={8*s} height={8*s} rx={3*s} fill="#795548"/>
          {/* Window */}
          <rect x={tx+5*s} y={trunkTop-16*s} width={6*s} height={6*s} rx={1.5*s} fill="#B3E5FC"/>
          <rect x={tx-11*s} y={trunkTop-16*s} width={6*s} height={6*s} rx={1.5*s} fill="#B3E5FC"/>
          {/* Ladder */}
          <line x1={tx-2*s} y1={gY} x2={tx-2*s} y2={trunkTop} stroke="#8D6E63" strokeWidth={2*s}/>
          <line x1={tx+2*s} y1={gY} x2={tx+2*s} y2={trunkTop} stroke="#8D6E63" strokeWidth={2*s}/>
          {[0.25,0.5,0.75].map((t,li)=>(
            <line key={li} x1={tx-3*s} y1={gY+(trunkTop-gY)*t}
              x2={tx+3*s} y2={gY+(trunkTop-gY)*t} stroke="#8D6E63" strokeWidth={1.5*s}/>
          ))}
        </g>
      );
    },

    g_fireflies: () => {
      // A glowing lantern jar sitting on ground with fireflies floating out
      const jx=cx; const jy=gY-h*0.14*s;
      return (
        <g key={suf}>
          {/* Jar body */}
          <rect x={jx-8*s} y={jy-h*0.12*s} width={16*s} height={h*0.12*s} rx={5*s} fill="#E8F5E9" opacity="0.9"
            stroke="#A5D6A7" strokeWidth={1.5*s}/>
          {/* Jar neck */}
          <rect x={jx-5*s} y={jy-h*0.15*s} width={10*s} height={h*0.04*s} rx={2*s} fill="#C8E6C9" stroke="#A5D6A7" strokeWidth={1.5*s}/>
          {/* Lid */}
          <rect x={jx-6*s} y={jy-h*0.165*s} width={12*s} height={4*s} rx={2*s} fill="#8D6E63"/>
          {/* Glow inside */}
          <ellipse cx={jx} cy={jy-h*0.07*s} rx={7*s} ry={5*s} fill="#FFD54F" opacity="0.35"/>
          {/* Fireflies floating out */}
          {[
            {ox:-18*s,oy:-h*0.3*s,dur:"2.4s",del:"0s"},
            {ox:14*s, oy:-h*0.38*s,dur:"3.1s",del:"0.6s"},
            {ox:-8*s, oy:-h*0.5*s, dur:"2.8s",del:"1.2s"},
            {ox:22*s, oy:-h*0.25*s,dur:"3.5s",del:"0.3s"},
          ].map((f,fi)=>(
            <circle key={fi} cx={jx+f.ox} cy={gY+f.oy} r={3.5*s} fill="#FFE082">
              <animate attributeName="opacity" values="0.1;1;0.1" dur={f.dur} begin={f.del} repeatCount="indefinite"/>
              <animate attributeName="r" values={`${2*s};${4.5*s};${2*s}`} dur={f.dur} begin={f.del} repeatCount="indefinite"/>
            </circle>
          ))}
        </g>
      );
    },
  };

  const renderer = items[resolvedId];
  if (!renderer) return null;
  return renderer();
};

/* ══════════════════════════════════════════════
   ANIMATED GARDEN SCENE — mascot composited inside
   Backdrop is fixed — a single cheerful daytime garden.
   What changes is only what the child has planted via the shop.
══════════════════════════════════════════════ */
export const GardenScene = ({ stage, mascotId, size = 280, dark, showMascot = false, mascotStageId = 0, gardenItems = [] }) => {
  const w = size;
  const h = Math.round(size * 1.05);
  // stageId kept for mascot accessory callers but NOT used for backdrop
  const stageId = typeof stage === "object" ? stage.id : stage;

  /* ── Fixed backdrop colours ── */
  const skyTop  = dark ? "#0d1a2e" : "#B9F0C2";
  const skyBot  = dark ? "#1a2e40" : "#DCF5E0";
  const grass   = ["#43A047","#66BB6A","#81C784","#A5D6A7"];

  const groundY = h * 0.62;

  /* Grass blades — fixed density, fixed colour */
  const blades = Array.from({length:28}, (_,i) => ({
    x: (i/27) * w,
    stemH: h*(0.12 + (i%5)*0.04),
    width: 3 + (i%3)*1.5,
    sway: i%2===0 ? "gSwayL" : "gSwayR",
    delay: `${(i*0.14%2.5).toFixed(2)}s`,
    color: grass[i%grass.length],
    opacity: 0.55 + (i%4)*0.1,
  }));

  /* Mascot body colours — unchanged */
  const mascotColors = {
    fox:   {body:"#FF8A65",belly:"#FFCCBC",ear:"#FF7043",eye:"#1a1a2e"},
    bunny: {body:"#FCE4EC",belly:"#F8BBD0",ear:"#F8BBD0",eye:"#1a1a2e"},
    bear:  {body:"#8D6E63",belly:"#A1887F",ear:"#795548",eye:"#1a1a2e"},
    owl:   {body:"#7E57C2",belly:"#B39DDB",ear:"#5E35B1",eye:"#311B92"},
    cat:   {body:"#4DB6AC",belly:"#80CBC4",ear:"#00897B",eye:"#1a1a2e"},
    dog:   {body:"#FFB74D",belly:"#FFCC80",ear:"#FFA726",eye:"#1a1a2e"},
  };
  const mc = mascotColors[mascotId] || mascotColors.fox;
  const mw = w * 0.22;
  const mh = mw * 1.5;
  const mGroundY = groundY - h*0.01;
  const myBase   = mGroundY - mh;

  const animId = `gs_fixed${showMascot?'m':''}`;

  return (
    <div style={{position:"relative",width:"100%",height:h,display:"block",overflow:"hidden"}}>
      <style>{`
        @keyframes gSwayL{0%,100%{transform:rotate(0deg)}50%{transform:rotate(-7deg)}}
        @keyframes gSwayR{0%,100%{transform:rotate(0deg)}50%{transform:rotate(7deg)}}
        @keyframes gFloat{0%,100%{transform:translateY(0px)}50%{transform:translateY(-7px)}}
        @keyframes gPulse{0%,100%{opacity:0.25}50%{opacity:1}}
        @keyframes gCloud{0%{transform:translateX(0)}100%{transform:translateX(40px)}}
        @keyframes gBounce{0%,100%{transform:translateY(0) rotate(-1deg)}50%{transform:translateY(-12px) rotate(1deg)}}
        @keyframes gSpin{from{transform:rotate(0deg)}to{transform:rotate(360deg)}}
      `}</style>
      <svg viewBox={`0 0 ${w} ${h}`} width="100%" height={h} style={{display:"block"}}>
        <defs>
          <linearGradient id={`sky_${animId}`} x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor={skyTop}/>
            <stop offset="100%" stopColor={skyBot}/>
          </linearGradient>
          <linearGradient id={`gnd_${animId}`} x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor={grass[1]}/>
            <stop offset="100%" stopColor={grass[0]}/>
          </linearGradient>
          <radialGradient id={`sun_${animId}`} cx="50%" cy="50%" r="50%">
            <stop offset="0%" stopColor="#FFFDE7" stopOpacity="0.9"/>
            <stop offset="100%" stopColor="#FFD54F" stopOpacity="0"/>
          </radialGradient>
          <clipPath id={`clip_${animId}`}>
            <rect width={w} height={h}/>
          </clipPath>
        </defs>

        <g clipPath={`url(#clip_${animId})`}>

        {/* Sky — always the same fresh daytime blue-green */}
        <rect width={w} height={h} fill={`url(#sky_${animId})`}/>

        {/* Sun — always present, gently pulsing */}
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

        {/* Two drifting clouds */}
        {[{x:0.04,y:0.14,s:0.9,dur:"20s"},{x:0.52,y:0.08,s:1.1,dur:"28s"}].map((cl,i)=>(
          <g key={i} style={{animation:`gCloud ${cl.dur} ease-in-out infinite alternate`}}>
            <g transform={`translate(${w*cl.x},${h*cl.y}) scale(${cl.s})`}>
              <ellipse cx="32" cy="0" rx="32" ry="15" fill="white" opacity="0.82"/>
              <ellipse cx="14" cy="6"  rx="22" ry="13" fill="white" opacity="0.72"/>
              <ellipse cx="54" cy="7"  rx="24" ry="12" fill="white" opacity="0.72"/>
            </g>
          </g>
        ))}

        {/* Ground — gently rolling hill */}
        <path d={`M0,${groundY+h*0.02}
          C${w*0.15},${groundY-h*0.05} ${w*0.3},${groundY+h*0.02} ${w*0.5},${groundY-h*0.02}
          C${w*0.7},${groundY-h*0.06} ${w*0.85},${groundY+h*0.03} ${w},${groundY}
          L${w},${h} L0,${h} Z`}
          fill={`url(#gnd_${animId})`}/>
        <path d={`M0,${groundY+h*0.02}
          C${w*0.15},${groundY-h*0.05} ${w*0.3},${groundY+h*0.02} ${w*0.5},${groundY-h*0.02}
          C${w*0.7},${groundY-h*0.06} ${w*0.85},${groundY+h*0.03} ${w},${groundY}`}
          fill="none" stroke="rgba(255,255,255,0.35)" strokeWidth="3"/>

        {/* Grass blades */}
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

        {/* Mascot composited at ground level */}
        {showMascot && mascotId && (
          <g style={{animation:"gBounce 3.2s ease-in-out infinite"}}>
            <ellipse cx={w/2} cy={mGroundY+h*0.008} rx={mw*0.42} ry={h*0.018}
              fill="rgba(0,0,0,0.12)"/>
            <ellipse cx={w/2} cy={myBase+mh*0.65} rx={mw*0.38} ry={mh*0.32} fill={mc.body}/>
            <ellipse cx={w/2} cy={myBase+mh*0.68} rx={mw*0.22} ry={mh*0.22} fill={mc.belly}/>
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
            <ellipse cx={w/2} cy={myBase+mh*0.26} rx={mw*0.3} ry={mh*0.24} fill={mc.body}/>
            <circle cx={w/2-mw*0.1} cy={myBase+mh*0.24} r={mw*0.065} fill="white"/>
            <circle cx={w/2+mw*0.1} cy={myBase+mh*0.24} r={mw*0.065} fill="white"/>
            <circle cx={w/2-mw*0.09} cy={myBase+mh*0.25} r={mw*0.034} fill={mc.eye}/>
            <circle cx={w/2+mw*0.11} cy={myBase+mh*0.25} r={mw*0.034} fill={mc.eye}/>
            <circle cx={w/2-mw*0.075} cy={myBase+mh*0.23} r={mw*0.014} fill="white"/>
            <circle cx={w/2+mw*0.125} cy={myBase+mh*0.23} r={mw*0.014} fill="white"/>
            <path d={`M${w/2-mw*0.1},${myBase+mh*0.32} Q${w/2},${myBase+mh*0.38} ${w/2+mw*0.1},${myBase+mh*0.32}`}
              fill="none" stroke={mc.eye} strokeWidth="2.5" strokeLinecap="round"/>
            <ellipse cx={w/2-mw*0.42} cy={myBase+mh*0.58} rx={mw*0.1} ry={mh*0.16}
              fill={mc.body} transform={`rotate(-22 ${w/2-mw*0.42} ${myBase+mh*0.58})`}/>
            <ellipse cx={w/2+mw*0.42} cy={myBase+mh*0.58} rx={mw*0.1} ry={mh*0.16}
              fill={mc.body} transform={`rotate(22 ${w/2+mw*0.42} ${myBase+mh*0.58})`}/>
            <ellipse cx={w/2-mw*0.15} cy={mGroundY-h*0.02} rx={mw*0.12} ry={mh*0.1} fill={mc.body}/>
            <ellipse cx={w/2+mw*0.15} cy={mGroundY-h*0.02} rx={mw*0.12} ry={mh*0.1} fill={mc.body}/>
          </g>
        )}

        {/* ── Purchased garden items — the only thing that changes ── */}
        {gardenItems.length > 0 && (() => {
          const ITEM_POSITIONS = [
            0.08, 0.18, 0.78, 0.88,
            0.12, 0.82,
            0.24, 0.72,
            0.30, 0.68,
            0.06, 0.92,
            0.20, 0.76,
            0.15, 0.85,
            0.35, 0.65,
            0.10, 0.90,
          ];
          const sizeOrder = { xl:0, lg:1, md:2, sm:3 };
          const ITEM_SIZES = {
            g_cherry:"xl",g_cherry2:"xl",g_cherry3:"xl",g_cherry4:"xl",g_cherry5:"xl",
            g_treehouse:"xl",g_treehouse2:"xl",g_treehouse3:"xl",
            g_windmill:"xl",g_windmill2:"xl",g_windmill3:"xl",
            g_fountain:"xl",g_fountain2:"xl",g_fountain3:"xl",g_fountain4:"xl",
            g_fern3:"xl",g_bamboo3:"xl",g_rainbow2:"xl",g_rainbow3:"xl",g_rainbow4:"xl",
            g_gnome5:"xl",g_mushroom5:"xl",g_butterfly6:"xl",g_rose6:"xl",
            g_bamboo:"lg",g_bamboo2:"lg",g_sunflower:"lg",g_sunflower2:"lg",g_sunflower3:"lg",
            g_rainbow:"lg",g_rose3:"lg",g_rose4:"lg",g_rose5:"lg",
            g_beehive2:"lg",g_mushroom3:"lg",g_fireflies2:"lg",g_butterfly4:"lg",g_gnome2:"lg",
            g_rose:"md",g_tulip:"md",g_tulip2:"md",g_cactus:"md",g_cactus2:"md",
            g_fern:"md",g_fern2:"md",g_birdbath:"md",g_birdbath2:"md",
            g_beehive:"md",g_gnome:"md",g_gnome3:"md",g_gnome4:"md",
            g_mushroom4:"md",g_butterfly5:"md",g_beehive3:"sm",
            g_daisy:"sm",g_daisy2:"sm",g_daisy3:"sm",
            g_bluebell:"sm",g_bluebell2:"sm",
            g_mushroom:"sm",g_mushroom2:"sm",
            g_ladybug:"sm",g_ladybug2:"sm",g_ladybug3:"sm",
            g_butterfly:"sm",g_butterfly2:"sm",g_butterfly3:"sm",
            g_fireflies:"sm",g_fireflies3:"lg",
          };
          const ITEM_SCALES = { xl:1.0, lg:0.85, md:0.72, sm:0.62 };

          const sorted = [...gardenItems].sort((a,b)=>
            (sizeOrder[ITEM_SIZES[a]]||2) - (sizeOrder[ITEM_SIZES[b]]||2)
          );

          return sorted.map((id, i) => {
            const posIdx = i % ITEM_POSITIONS.length;
            let xFrac = ITEM_POSITIONS[posIdx];
            if (showMascot && xFrac > 0.38 && xFrac < 0.62) {
              xFrac = xFrac < 0.5 ? xFrac - 0.1 : xFrac + 0.1;
            }
            const itemCx = w * xFrac;
            const sz = ITEM_SIZES[id] || "md";
            const scale = ITEM_SCALES[sz];
            return (
              <GardenItemSVG key={`${id}_${i}`} id={id} cx={itemCx}
                groundY={groundY} scale={scale} w={w} h={h} idx={i}/>
            );
          });
        })()}

        {/* Front grass fringe — always on top */}
        {Array.from({length:16},(_,i)=>({x:(i/15)*w, bh:h*0.08+Math.sin(i*1.3)*h*0.05})).map((b,i)=>(
          <g key={i} style={{animation:`${i%2===0?"gSwayL":"gSwayR"} ${1.8+i*0.1}s ease-in-out infinite`,
            animationDelay:`${(i*0.13%2).toFixed(2)}s`, transformOrigin:`${b.x}px ${groundY+h*0.12}px`}}>
            <path d={`M${b.x},${groundY+h*0.14}
              C${b.x-4},${groundY+h*0.14-b.bh*0.55}
               ${b.x+3},${groundY+h*0.14-b.bh*0.82}
               ${b.x+3},${groundY+h*0.14-b.bh}`}
              stroke={grass[0]} strokeWidth="3.5" fill="none" strokeLinecap="round" opacity="0.85"/>
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
/* ── SVG seed icon — matches berry art style ── */
const SeedIcon = ({ size = 22 }) => (
  <svg width={size} height={size} viewBox="0 0 32 32" fill="none">
    <defs>
      <radialGradient id="seedGrad" cx="38%" cy="32%" r="62%">
        <stop offset="0%" stopColor="#D4A574"/>
        <stop offset="100%" stopColor="#8B5E3C"/>
      </radialGradient>
    </defs>
    {/* Seed body — upright oval, pointed bottom */}
    <ellipse cx="16" cy="17" rx="7" ry="9.5" fill="url(#seedGrad)"/>
    {/* Ridge line down the centre */}
    <path d="M16 8 Q17 17 16 26"
      stroke="rgba(255,255,255,0.18)" strokeWidth="1.2"
      strokeLinecap="round" fill="none"/>
    {/* Highlight */}
    <ellipse cx="13" cy="13" rx="2" ry="3.2"
      fill="rgba(255,255,255,0.3)" transform="rotate(-18 13 13)"/>
    <circle cx="13.5" cy="12" r="1" fill="rgba(255,255,255,0.45)"/>
    {/* Subtle texture dots */}
    <circle cx="19" cy="18" r="0.9" fill="rgba(0,0,0,0.08)"/>
    <circle cx="14" cy="21" r="0.8" fill="rgba(0,0,0,0.08)"/>
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
            <SeedIcon size={16}/>
            <SeedIcon size={16}/>
            <SeedIcon size={16}/>
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
          boxShadow:"0 4px 14px rgba(139,94,60,0.28)"}}>
          <SeedIcon size={18}/>
          <p style={{fontFamily:F.b,fontWeight:800,fontSize:14,
            color:"#8B5E3C",margin:0}}>
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
            {next?`${next.minScore-score} seeds to unlock ${next.name} items`:"All garden items unlocked!"}
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
            🛒 Garden Shop Unlocked
          </p>
          <p style={{fontFamily:"'Poppins',sans-serif",fontSize:14,fontWeight:500,
            color:"#2D2040",margin:"0 0 6px",lineHeight:1.5}}>
            <strong>10 new garden items</strong> are now available in the shop!
          </p>
          <p style={{fontFamily:"'Poppins',sans-serif",fontSize:13,fontWeight:500,
            color:"#9B8DB5",margin:0,lineHeight:1.5}}>
            {newStage===1&&"Flowers, plants and critters to start building your garden!"}
            {newStage===2&&"Colourful blooms and fun decorations have arrived!"}
            {newStage===3&&"Trees, magical creatures and special items to explore!"}
            {newStage===4&&"Rare plants and enchanted decorations are waiting for you!"}
            {newStage===5&&"Legendary items and magical centrepieces are now available!"}
            {newStage===6&&"The ultimate garden items are yours to collect!"}
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
