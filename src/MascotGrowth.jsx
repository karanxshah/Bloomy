import { useState, useEffect, useId } from "react";

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
/* ══════════════════════════════════════════════
   GARDEN ITEM ART — SINGLE SOURCE OF TRUTH
   Every shop item has its OWN renderer (no aliasing),
   its own size class, and its own placement layer:
     • ground — sits on the grass (flowers, trees, ponds…)
     • air    — floats just above the grass (butterflies, moths…)
     • sky     — lives up in the sky (rainbows, aurora, palaces…)
   Renderers draw their art UPWARD from the baseline (cx, gY).
   GardenScene chooses the baseline per layer so a Koi Pond lands
   on the ground and a Sky Palace floats in the clouds.
══════════════════════════════════════════════ */
export const GARDEN_RENDER_META = {
  /* Stage 0 — Seedling */
  g_daisy:{size:"sm",layer:"ground"},      g_bluebell:{size:"sm",layer:"ground"},
  g_mushroom:{size:"sm",layer:"ground"},   g_fern:{size:"md",layer:"ground"},
  g_ladybug:{size:"sm",layer:"ground"},    g_rose:{size:"md",layer:"ground"},
  g_tulip:{size:"md",layer:"ground"},      g_cactus:{size:"md",layer:"ground"},
  g_butterfly:{size:"sm",layer:"air"},     g_sunflower:{size:"lg",layer:"ground"},
  /* Stage 1 — Sprouting */
  g_bluebell2:{size:"sm",layer:"ground"},  g_daisy2:{size:"sm",layer:"ground"},
  g_bamboo:{size:"lg",layer:"ground"},     g_fern2:{size:"md",layer:"ground"},
  g_birdbath:{size:"md",layer:"ground"},   g_ladybug2:{size:"sm",layer:"ground"},
  g_beehive:{size:"md",layer:"ground"},    g_tulip2:{size:"md",layer:"ground"},
  g_sunflower2:{size:"lg",layer:"ground"}, g_gnome:{size:"md",layer:"ground"},
  /* Stage 2 — Blooming */
  g_rose2:{size:"md",layer:"ground"},      g_daisy3:{size:"sm",layer:"ground"},
  g_cherry:{size:"xl",layer:"ground"},     g_bamboo2:{size:"lg",layer:"ground"},
  g_butterfly2:{size:"sm",layer:"air"},    g_mushroom2:{size:"sm",layer:"ground"},
  g_gnome2:{size:"sm",layer:"ground"},     g_beehive2:{size:"lg",layer:"ground"},
  g_rainbow:{size:"lg",layer:"sky"},       g_cactus2:{size:"md",layer:"ground"},
  /* Stage 3 — Flourishing */
  g_cherry2:{size:"xl",layer:"ground"},    g_rose3:{size:"lg",layer:"ground"},
  g_fountain:{size:"xl",layer:"ground"},   g_fern3:{size:"xl",layer:"ground"},
  g_birdbath2:{size:"md",layer:"ground"},  g_butterfly3:{size:"md",layer:"air"},
  g_sunflower3:{size:"lg",layer:"ground"}, g_mushroom3:{size:"lg",layer:"ground"},
  g_ladybug3:{size:"sm",layer:"ground"},   g_beehive3:{size:"sm",layer:"air"},
  /* Stage 4 — Thriving */
  g_treehouse:{size:"xl",layer:"ground"},  g_cherry3:{size:"xl",layer:"ground"},
  g_windmill:{size:"xl",layer:"ground"},   g_rose4:{size:"lg",layer:"ground"},
  g_fountain2:{size:"xl",layer:"ground"},  g_fireflies:{size:"sm",layer:"ground"},
  g_butterfly4:{size:"lg",layer:"ground"}, g_bamboo3:{size:"xl",layer:"ground"},
  g_gnome3:{size:"md",layer:"ground"},     g_rainbow2:{size:"xl",layer:"sky"},
  /* Stage 5 — Blossoming */
  g_cherry4:{size:"xl",layer:"ground"},    g_fountain3:{size:"xl",layer:"ground"},
  g_windmill2:{size:"xl",layer:"ground"},  g_rose5:{size:"lg",layer:"ground"},
  g_mushroom4:{size:"md",layer:"ground"},  g_fireflies2:{size:"lg",layer:"ground"},
  g_butterfly5:{size:"md",layer:"air"},    g_treehouse2:{size:"xl",layer:"sky"},
  g_gnome4:{size:"md",layer:"ground"},     g_rainbow3:{size:"xl",layer:"sky"},
  /* Stage 6 — Full Bloom */
  g_treehouse3:{size:"xl",layer:"sky"},    g_fountain4:{size:"xl",layer:"ground"},
  g_cherry5:{size:"xl",layer:"ground"},    g_windmill3:{size:"xl",layer:"ground"},
  g_rose6:{size:"xl",layer:"ground"},      g_fireflies3:{size:"lg",layer:"ground"},
  g_butterfly6:{size:"xl",layer:"sky"},    g_rainbow4:{size:"lg",layer:"sky"},
  g_gnome5:{size:"xl",layer:"ground"},     g_mushroom5:{size:"xl",layer:"ground"},
};

export const GardenItemSVG = ({ id, cx, groundY, scale=1, w, h, idx=0 }) => {
  const s   = scale;
  const gY  = groundY;
  const rid = useId().replace(/[:]/g, "");
  const suf = `gi_${id}_${idx}_${rid}`;
  const uid = (n) => `${suf}_${n}`;

  /* small shared helpers (kept tiny so every item stays distinct) */
  const ring = (n, fn) => Array.from({length:n}, (_,i)=>fn(i));

  const items = {

  /* ════════════════════════════════════════════
     STAGE 0 — SEEDLING  (simple & sweet)
  ════════════════════════════════════════════ */
  g_daisy: () => {                                   // Daisy Patch — 3 white daisies
    const cl=[{ox:-10*s,t:0.15},{ox:0,t:0.19},{ox:9*s,t:0.14}];
    return <g key={suf}>
      {cl.map((f,di)=>{ const fx=cx+f.ox, ft=gY-h*f.t*s; return <g key={di}>
        <line x1={fx} y1={gY} x2={fx} y2={ft} stroke="#43A047" strokeWidth={2.2*s} strokeLinecap="round"/>
        {ring(8,pi=>{const r=pi*45*Math.PI/180; return <ellipse key={pi}
          cx={fx+Math.cos(r)*6*s} cy={ft+Math.sin(r)*6*s} rx={3.5*s} ry={2*s} fill="#fff"
          transform={`rotate(${pi*45} ${fx+Math.cos(r)*6*s} ${ft+Math.sin(r)*6*s})`}/>;})}
        <circle cx={fx} cy={ft} r={3.5*s} fill="#FFD54F"/>
      </g>;})}
    </g>;
  },

  g_bluebell: () => {                                // Bluebells — 2 nodding bells
    const st=[{ox:-7*s,ht:0.2,tilt:-18},{ox:5*s,ht:0.17,tilt:8}];
    return <g key={suf}>
      {st.map((b,si)=>{const fx=cx+b.ox, ft=gY-h*b.ht*s, bx=fx+Math.sin(b.tilt*Math.PI/180)*10*s, by=ft+8*s;
        return <g key={si}>
          <path d={`M${fx},${gY} C${fx},${gY-h*b.ht*0.6*s} ${bx},${ft} ${bx},${by}`} stroke="#388E3C" strokeWidth={2.5*s} fill="none" strokeLinecap="round"/>
          <path d={`M${bx-7*s},${by} Q${bx-9*s},${by+10*s} ${bx},${by+13*s} Q${bx+9*s},${by+10*s} ${bx+7*s},${by}`} fill="#4FC3F7"/>
          <path d={`M${bx-5*s},${by} Q${bx},${by-4*s} ${bx+5*s},${by}`} fill="#29B6F6" opacity="0.8"/>
          <circle cx={bx} cy={by+12*s} r={1.5*s} fill="#FFD54F"/>
        </g>;})}
    </g>;
  },

  g_mushroom: () => {                                // Magic Mushrooms — 2 red caps
    const sh=[{ox:-8*s,ht:0.14,cap:12*s,cc:"#EF5350"},{ox:7*s,ht:0.1,cap:9*s,cc:"#E53935"}];
    return <g key={suf}>
      {sh.map((m,si)=>{const fx=cx+m.ox, ft=gY-h*m.ht*s; return <g key={si}>
        <rect x={fx-m.cap*0.35} y={ft} width={m.cap*0.7} height={h*m.ht*s} rx={m.cap*0.3} fill="#FFF9C4"/>
        <path d={`M${fx-m.cap},${ft} Q${fx},${ft-m.cap*0.95} ${fx+m.cap},${ft} Z`} fill={m.cc}/>
        <circle cx={fx-m.cap*0.35} cy={ft-m.cap*0.25} r={m.cap*0.18} fill="#fff" opacity="0.9"/>
        <circle cx={fx+m.cap*0.3} cy={ft-m.cap*0.2} r={m.cap*0.14} fill="#fff" opacity="0.9"/>
      </g>;})}
    </g>;
  },

  g_fern: () => {                                    // Curly Fern — arching fronds
    const fr=[{a:-55,l:0.22},{a:-25,l:0.26},{a:5,l:0.25},{a:35,l:0.21},{a:60,l:0.17}];
    return <g key={suf}>
      {fr.map((f,fi)=>{const rad=f.a*Math.PI/180, L=h*f.l*s, ex=cx+Math.sin(rad)*L, ey=gY-Math.cos(rad)*L, mx=cx+Math.sin(rad)*L*0.55, my=gY-Math.cos(rad)*L*0.55;
        return <g key={fi}>
          <path d={`M${cx},${gY} Q${mx},${my} ${ex},${ey}`} stroke="#388E3C" strokeWidth={2.2*s} fill="none" strokeLinecap="round"/>
          {ring(5,li=>{const t=(li+1)/6, lx=cx+(ex-cx)*t, ly=gY+(ey-gY)*t, lsz=(6+li*1.4)*s*(1-t*0.4);
            return <ellipse key={li} cx={lx} cy={ly} rx={lsz} ry={lsz*0.36} fill="#4CAF50" opacity="0.85" transform={`rotate(${f.a+85} ${lx} ${ly})`}/>;})}
        </g>;})}
    </g>;
  },

  g_ladybug: () => {                                 // Ladybug on a leaf
    const lx=cx, ly=gY-11*s;
    return <g key={suf}>
      <ellipse cx={lx} cy={gY-4*s} rx={14*s} ry={5*s} fill="#66BB6A" transform={`rotate(-8 ${lx} ${gY-4*s})`}/>
      <ellipse cx={lx} cy={ly} rx={10*s} ry={8*s} fill="#E53935"/>
      <line x1={lx} y1={ly-7*s} x2={lx} y2={ly+7*s} stroke="#1a1a1a" strokeWidth={1.5*s} opacity="0.7"/>
      {[[-4.5,-3],[4.5,-3],[-4,3],[4,3]].map(([dx,dy],i)=><circle key={i} cx={lx+dx*s} cy={ly+dy*s} r={2.3*s} fill="#1a1a1a"/>)}
      <circle cx={lx} cy={ly-9*s} r={5.5*s} fill="#1a1a1a"/>
      <circle cx={lx-2.8*s} cy={ly-10.5*s} r={2*s} fill="#fff"/><circle cx={lx+2.8*s} cy={ly-10.5*s} r={2*s} fill="#fff"/>
    </g>;
  },

  g_rose: () => {                                    // Red Rose — single classic rose
    const tT=gY-h*0.22*s;
    return <g key={suf}>
      <line x1={cx} y1={gY} x2={cx} y2={tT} stroke="#2E7D32" strokeWidth={3*s} strokeLinecap="round"/>
      <ellipse cx={cx+7*s} cy={tT+h*0.06*s} rx={6*s} ry={4.5*s} fill="#66BB6A" transform={`rotate(25 ${cx+7*s} ${tT+h*0.06*s})`}/>
      <circle cx={cx} cy={tT} r={10*s} fill="#E53935"/>
      <circle cx={cx-4*s} cy={tT-2*s} r={7*s} fill="#EF5350"/><circle cx={cx+3*s} cy={tT-3*s} r={7*s} fill="#E53935"/>
      <circle cx={cx} cy={tT-5*s} r={6*s} fill="#EF9A9A"/><circle cx={cx} cy={tT-2*s} r={3.5*s} fill="#B71C1C" opacity="0.8"/>
    </g>;
  },

  g_tulip: () => {                                   // Purple Tulip
    const tT=gY-h*0.24*s;
    return <g key={suf}>
      <line x1={cx} y1={gY} x2={cx} y2={tT} stroke="#388E3C" strokeWidth={3*s} strokeLinecap="round"/>
      <ellipse cx={cx-8*s} cy={gY-h*0.1*s} rx={9*s} ry={4*s} fill="#66BB6A" transform={`rotate(-30 ${cx-8*s} ${gY-h*0.1*s})`}/>
      <ellipse cx={cx-6*s} cy={tT-4*s} rx={6*s} ry={11*s} fill="#CE93D8" transform={`rotate(-12 ${cx-6*s} ${tT-4*s})`}/>
      <ellipse cx={cx+6*s} cy={tT-4*s} rx={6*s} ry={11*s} fill="#BA68C8" transform={`rotate(12 ${cx+6*s} ${tT-4*s})`}/>
      <ellipse cx={cx} cy={tT-5*s} rx={5.5*s} ry={11*s} fill="#CE93D8"/>
    </g>;
  },

  g_cactus: () => {                                  // Friendly Cactus
    const bH=h*0.26*s;
    return <g key={suf}>
      <rect x={cx-5*s} y={gY-bH} width={10*s} height={bH} rx={5*s} fill="#66BB6A"/>
      <rect x={cx-14*s} y={gY-bH*0.65} width={9*s} height={6*s} rx={3*s} fill="#66BB6A"/>
      <rect x={cx-16*s} y={gY-bH*0.65-14*s} width={6*s} height={16*s} rx={3*s} fill="#66BB6A"/>
      <rect x={cx+5*s} y={gY-bH*0.55} width={9*s} height={6*s} rx={3*s} fill="#66BB6A"/>
      <rect x={cx+8*s} y={gY-bH*0.55-12*s} width={6*s} height={14*s} rx={3*s} fill="#66BB6A"/>
      {ring(5,i=>{const r=i*72*Math.PI/180; return <circle key={i} cx={cx+Math.cos(r)*5*s} cy={gY-bH+Math.sin(r)*5*s} r={3*s} fill="#F48FB1"/>;})}
      <circle cx={cx} cy={gY-bH} r={3*s} fill="#FFD54F"/>
    </g>;
  },

  g_butterfly: () => {                               // Butterfly (purple) — floats
    const bx=cx, by=gY-h*0.28*s;
    return <g key={suf}>
      <animateTransform attributeName="transform" type="translate" values="0,0; 0,-6; 0,0" dur="3.4s" repeatCount="indefinite"/>
      <ellipse cx={bx-12*s} cy={by-6*s} rx={13*s} ry={9*s} fill="#CE93D8" transform={`rotate(-22 ${bx-12*s} ${by-6*s})`}/>
      <ellipse cx={bx+12*s} cy={by-6*s} rx={13*s} ry={9*s} fill="#BA68C8" transform={`rotate(22 ${bx+12*s} ${by-6*s})`}/>
      <ellipse cx={bx-8*s} cy={by+7*s} rx={9*s} ry={6*s} fill="#CE93D8" opacity="0.75" transform={`rotate(28 ${bx-8*s} ${by+7*s})`}/>
      <ellipse cx={bx+8*s} cy={by+7*s} rx={9*s} ry={6*s} fill="#BA68C8" opacity="0.75" transform={`rotate(-28 ${bx+8*s} ${by+7*s})`}/>
      <ellipse cx={bx} cy={by} rx={2.5*s} ry={10*s} fill="#4A148C"/>
      <line x1={bx} y1={by-9*s} x2={bx-8*s} y2={by-18*s} stroke="#4A148C" strokeWidth={1.2*s}/>
      <line x1={bx} y1={by-9*s} x2={bx+8*s} y2={by-18*s} stroke="#4A148C" strokeWidth={1.2*s}/>
      <circle cx={bx-10*s} cy={by-4*s} r={3*s} fill="#E1BEE7" opacity="0.7"/><circle cx={bx+10*s} cy={by-4*s} r={3*s} fill="#E1BEE7" opacity="0.7"/>
    </g>;
  },

  g_sunflower: () => {                               // Sunflower — big cheerful bloom
    const tT=gY-h*0.28*s;
    return <g key={suf}>
      <line x1={cx} y1={gY} x2={cx} y2={tT} stroke="#43A047" strokeWidth={3.5*s} strokeLinecap="round"/>
      <ellipse cx={cx-7*s} cy={gY-h*0.14*s} rx={8*s} ry={4*s} fill="#66BB6A" transform={`rotate(-35 ${cx-7*s} ${gY-h*0.14*s})`}/>
      {ring(9,i=>{const a=i*40, r=a*Math.PI/180; return <ellipse key={i} cx={cx+Math.cos(r)*13*s} cy={tT+Math.sin(r)*13*s} rx={7*s} ry={4*s} fill="#FFD54F" transform={`rotate(${a} ${cx+Math.cos(r)*13*s} ${tT+Math.sin(r)*13*s})`}/>;})}
      <circle cx={cx} cy={tT} r={9*s} fill="#8D4E00"/><circle cx={cx} cy={tT} r={5*s} fill="#5D3A00"/>
    </g>;
  },

  /* ════════════════════════════════════════════
     STAGE 1 — SPROUTING
  ════════════════════════════════════════════ */
  g_bluebell2: () => {                               // Pink Blossoms — soft clusters
    const st=[{ox:-9*s,ht:0.18},{ox:2*s,ht:0.22},{ox:11*s,ht:0.16}];
    return <g key={suf}>
      {st.map((b,si)=>{const fx=cx+b.ox, ft=gY-h*b.ht*s; return <g key={si}>
        <line x1={fx} y1={gY} x2={fx} y2={ft} stroke="#558B2F" strokeWidth={2*s} strokeLinecap="round"/>
        {ring(5,p=>{const r=p*72*Math.PI/180; return <circle key={p} cx={fx+Math.cos(r)*4.5*s} cy={ft+Math.sin(r)*4.5*s} r={3.2*s} fill={p%2?"#F8BBD0":"#F48FB1"}/>;})}
        <circle cx={fx} cy={ft} r={2*s} fill="#FFF9C4"/>
      </g>;})}
    </g>;
  },

  g_daisy2: () => {                                  // Yellow Daisies
    const cl=[{ox:-9*s,t:0.16},{ox:2*s,t:0.2},{ox:11*s,t:0.15}];
    return <g key={suf}>
      {cl.map((f,di)=>{const fx=cx+f.ox, ft=gY-h*f.t*s; return <g key={di}>
        <line x1={fx} y1={gY} x2={fx} y2={ft} stroke="#43A047" strokeWidth={2.2*s} strokeLinecap="round"/>
        {ring(8,pi=>{const r=pi*45*Math.PI/180; return <ellipse key={pi} cx={fx+Math.cos(r)*6*s} cy={ft+Math.sin(r)*6*s} rx={3.6*s} ry={2.1*s} fill="#FFD54F" transform={`rotate(${pi*45} ${fx+Math.cos(r)*6*s} ${ft+Math.sin(r)*6*s})`}/>;})}
        <circle cx={fx} cy={ft} r={3.4*s} fill="#F9A825"/>
      </g>;})}
    </g>;
  },

  g_bamboo: () => {                                  // Bamboo Stalks
    const stalks=[{ox:-9*s,ht:0.42},{ox:0,ht:0.5},{ox:9*s,ht:0.38}];
    return <g key={suf}>
      {stalks.map((st,si)=>{const H=h*st.ht*s, seg=4, segH=H/seg; return <g key={si}>
        {ring(seg,i=><g key={i}>
          <rect x={cx+st.ox-3.5*s} y={gY-H+segH*i} width={7*s} height={segH-2} rx={3*s} fill={i%2?"#81C784":"#66BB6A"}/>
          <rect x={cx+st.ox-4*s} y={gY-H+segH*(i+1)-3} width={8*s} height={4} rx={2*s} fill="#43A047" opacity="0.7"/>
        </g>)}
        <ellipse cx={cx+st.ox-10*s} cy={gY-H-4*s} rx={11*s} ry={4*s} fill="#4CAF50" transform={`rotate(-28 ${cx+st.ox-10*s} ${gY-H-4*s})`}/>
        <ellipse cx={cx+st.ox+10*s} cy={gY-H-2*s} rx={11*s} ry={4*s} fill="#66BB6A" transform={`rotate(22 ${cx+st.ox+10*s} ${gY-H-2*s})`}/>
      </g>;})}
    </g>;
  },

  g_fern2: () => {                                   // Bushy Fern — fuller, darker
    const fr=[{a:-65,l:0.2},{a:-40,l:0.26},{a:-15,l:0.29},{a:10,l:0.29},{a:35,l:0.26},{a:62,l:0.2}];
    return <g key={suf}>
      {fr.map((f,fi)=>{const rad=f.a*Math.PI/180, L=h*f.l*s, ex=cx+Math.sin(rad)*L, ey=gY-Math.cos(rad)*L, mx=cx+Math.sin(rad)*L*0.5, my=gY-Math.cos(rad)*L*0.5;
        return <g key={fi}>
          <path d={`M${cx},${gY} Q${mx},${my} ${ex},${ey}`} stroke="#2E7D32" strokeWidth={2.4*s} fill="none" strokeLinecap="round"/>
          {ring(6,li=>{const t=(li+1)/7, lx=cx+(ex-cx)*t, ly=gY+(ey-gY)*t, lsz=(6+li*1.3)*s*(1-t*0.35);
            return <ellipse key={li} cx={lx} cy={ly} rx={lsz} ry={lsz*0.34} fill="#388E3C" opacity="0.9" transform={`rotate(${f.a+85} ${lx} ${ly})`}/>;})}
        </g>;})}
    </g>;
  },

  g_birdbath: () => {                                // Bird Bath
    const bx=cx;
    return <g key={suf}>
      <rect x={bx-4*s} y={gY-h*0.22*s} width={8*s} height={h*0.22*s} rx={4*s} fill="#B0BEC5"/>
      <ellipse cx={bx} cy={gY} rx={10*s} ry={4*s} fill="#90A4AE"/>
      <ellipse cx={bx} cy={gY-h*0.22*s} rx={20*s} ry={7*s} fill="#90A4AE"/>
      <ellipse cx={bx} cy={gY-h*0.22*s} rx={17*s} ry={5.5*s} fill="#4FC3F7" opacity="0.85"/>
      <ellipse cx={bx} cy={gY-h*0.22*s} rx={10*s} ry={3*s} fill="none" stroke="rgba(255,255,255,0.5)" strokeWidth={1.5*s}/>
      <g><animateTransform attributeName="transform" type="translate" values="0,0;0,-4;0,0" dur="2.6s" repeatCount="indefinite"/>
        <ellipse cx={bx+6*s} cy={gY-h*0.26*s} rx={7*s} ry={4*s} fill="#FF7043"/>
        <circle cx={bx+10*s} cy={gY-h*0.27*s} r={3.5*s} fill="#FF8A65"/>
        <ellipse cx={bx+6*s} cy={gY-h*0.3*s} rx={9*s} ry={3*s} fill="#FF7043" opacity="0.8"/>
        <circle cx={bx+12.5*s} cy={gY-h*0.272*s} r={1.4*s} fill="#1a1a1a"/>
        <path d={`M${bx+13.5*s},${gY-h*0.257*s} l${3*s},0`} stroke="#FFD54F" strokeWidth={1.5*s} strokeLinecap="round"/>
      </g>
    </g>;
  },

  g_ladybug2: () => {                                // Snail
    const sx=cx, sy=gY;
    return <g key={suf}>
      <ellipse cx={sx-2*s} cy={gY} rx={16*s} ry={4*s} fill="#A1887F" opacity="0.5"/>
      <path d={`M${sx-12*s},${sy} q${-3*s},${-9*s} ${8*s},${-10*s} q${10*s},${0} ${9*s},${9*s}`} stroke="#90A4AE" strokeWidth={3*s} fill="#CFD8DC" strokeLinecap="round"/>
      <g><animate attributeName="opacity" values="1;1" dur="1s"/>
        {/* spiral shell */}
        <circle cx={sx+3*s} cy={sy-6*s} r={10*s} fill="#FFB74D" stroke="#F57C00" strokeWidth={1.6*s}/>
        <path d={`M${sx+3*s},${sy-6*s} m0,0 a3,3 0 1,1 3,3 a6,6 0 1,1 -6,6 a9,9 0 1,1 9,-9`} fill="none" stroke="#E65100" strokeWidth={1.4*s}/>
      </g>
      <circle cx={sx-12*s} cy={sy-3*s} r={3.5*s} fill="#BCAAA4"/>
      <line x1={sx-13*s} y1={sy-6*s} x2={sx-15*s} y2={sy-12*s} stroke="#BCAAA4" strokeWidth={1.2*s} strokeLinecap="round"/>
      <line x1={sx-11*s} y1={sy-6*s} x2={sx-9*s} y2={sy-12*s} stroke="#BCAAA4" strokeWidth={1.2*s} strokeLinecap="round"/>
      <circle cx={sx-15*s} cy={sy-12*s} r={1.6*s} fill="#5D4037"/><circle cx={sx-9*s} cy={sy-12*s} r={1.6*s} fill="#5D4037"/>
    </g>;
  },

  g_beehive: () => {                                 // Beehive
    const hx=cx, hy=gY-h*0.22*s, stripes=4;
    return <g key={suf}>
      <line x1={hx-18*s} y1={gY-h*0.28*s} x2={hx+18*s} y2={gY-h*0.28*s} stroke="#795548" strokeWidth={3.5*s} strokeLinecap="round"/>
      <line x1={hx} y1={gY-h*0.28*s} x2={hx} y2={hy} stroke="#A1887F" strokeWidth={2*s}/>
      {ring(stripes,i=>{const by=hy+(i/(stripes-1))*(h*0.16*s); return <ellipse key={i} cx={hx} cy={by} rx={(16-i*1.5)*s} ry={8*s} fill={i%2?"#FFA726":"#FFD54F"}/>;})}
      <ellipse cx={hx} cy={gY-h*0.07*s} rx={5*s} ry={3.5*s} fill="#5D4037"/>
      {[{ox:22*s,oy:-0.18},{ox:-20*s,oy:-0.24}].map((b,bi)=><g key={bi}>
        <animateTransform attributeName="transform" type="translate" values="0,0;0,-5;0,0" dur={`${3+bi}s`} repeatCount="indefinite"/>
        <ellipse cx={hx+b.ox} cy={gY+h*b.oy*s} rx={5*s} ry={3.5*s} fill="#FFD54F"/>
        <line x1={hx+b.ox-5*s} y1={gY+h*b.oy*s} x2={hx+b.ox+5*s} y2={gY+h*b.oy*s} stroke="#5D4037" strokeWidth={1.5*s}/>
      </g>)}
    </g>;
  },

  g_tulip2: () => {                                  // Orange Tulip — open, two-tone
    const tT=gY-h*0.26*s;
    return <g key={suf}>
      <line x1={cx} y1={gY} x2={cx} y2={tT} stroke="#388E3C" strokeWidth={3*s} strokeLinecap="round"/>
      <ellipse cx={cx+8*s} cy={gY-h*0.12*s} rx={9*s} ry={4*s} fill="#66BB6A" transform={`rotate(30 ${cx+8*s} ${gY-h*0.12*s})`}/>
      <path d={`M${cx-8*s},${tT+2*s} Q${cx-11*s},${tT-12*s} ${cx-4*s},${tT-10*s} Z`} fill="#FB8C00"/>
      <path d={`M${cx+8*s},${tT+2*s} Q${cx+11*s},${tT-12*s} ${cx+4*s},${tT-10*s} Z`} fill="#FB8C00"/>
      <path d={`M${cx-6*s},${tT+3*s} Q${cx},${tT-16*s} ${cx+6*s},${tT+3*s} Q${cx},${tT-4*s} ${cx-6*s},${tT+3*s} Z`} fill="#FF7043"/>
      <path d={`M${cx},${tT-12*s} Q${cx-2*s},${tT-2*s} ${cx},${tT+2*s}`} stroke="#FFCCBC" strokeWidth={1.4*s} fill="none"/>
    </g>;
  },

  g_sunflower2: () => {                              // Giant Sunflower — twin blooms
    const tA=gY-h*0.34*s, tB=gY-h*0.22*s;
    const bloom=(bx,by,r)=> <g>
      {ring(10,i=>{const a=i*36, rad=a*Math.PI/180; return <ellipse key={i} cx={bx+Math.cos(rad)*r} cy={by+Math.sin(rad)*r} rx={r*0.5} ry={r*0.28} fill="#F9A825" transform={`rotate(${a} ${bx+Math.cos(rad)*r} ${by+Math.sin(rad)*r})`}/>;})}
      <circle cx={bx} cy={by} r={r*0.6} fill="#6D4C00"/><circle cx={bx} cy={by} r={r*0.34} fill="#4E3500"/>
    </g>;
    return <g key={suf}>
      <line x1={cx} y1={gY} x2={cx-2*s} y2={tA} stroke="#43A047" strokeWidth={4*s} strokeLinecap="round"/>
      <line x1={cx+1*s} y1={gY-h*0.1*s} x2={cx+10*s} y2={tB} stroke="#43A047" strokeWidth={3*s} strokeLinecap="round"/>
      <ellipse cx={cx-9*s} cy={gY-h*0.16*s} rx={9*s} ry={4.5*s} fill="#66BB6A" transform={`rotate(-35 ${cx-9*s} ${gY-h*0.16*s})`}/>
      {bloom(cx+10*s,tB,9*s)}
      {bloom(cx-2*s,tA,12*s)}
    </g>;
  },

  g_gnome: () => {                                   // Garden Gnome
    const gx=cx, b=gY;
    return <g key={suf}>
      <ellipse cx={gx-5*s} cy={b-3*s} rx={6*s} ry={4*s} fill="#795548"/><ellipse cx={gx+5*s} cy={b-3*s} rx={6*s} ry={4*s} fill="#795548"/>
      <ellipse cx={gx} cy={b-h*0.12*s} rx={10*s} ry={h*0.1*s} fill="#1976D2"/>
      <rect x={gx-10*s} y={b-h*0.155*s} width={20*s} height={4*s} rx={2*s} fill="#5D4037"/>
      <circle cx={gx} cy={b-h*0.25*s} r={9*s} fill="#FFCCBC"/>
      <ellipse cx={gx} cy={b-h*0.2*s} rx={8*s} ry={6*s} fill="#fff" opacity="0.92"/>
      <circle cx={gx-3.5*s} cy={b-h*0.26*s} r={1.8*s} fill="#1a1a2e"/><circle cx={gx+3.5*s} cy={b-h*0.26*s} r={1.8*s} fill="#1a1a2e"/>
      <circle cx={gx} cy={b-h*0.24*s} r={2.5*s} fill="#FFAB91"/>
      <ellipse cx={gx} cy={b-h*0.31*s} rx={11*s} ry={3.5*s} fill="#E53935"/>
      <path d={`M${gx-8*s},${b-h*0.32*s} L${gx},${b-h*0.48*s} L${gx+8*s},${b-h*0.32*s}`} fill="#E53935"/>
      <circle cx={gx} cy={b-h*0.49*s} r={2.5*s} fill="#fff"/>
    </g>;
  },

  /* ════════════════════════════════════════════
     STAGE 2 — BLOOMING
  ════════════════════════════════════════════ */
  g_rose2: () => {                                   // Pink Rose Bush
    const bh=h*0.28*s;
    return <g key={suf}>
      <ellipse cx={cx} cy={gY-bh*0.4} rx={20*s} ry={bh*0.7} fill="#2E7D32"/>
      <ellipse cx={cx-10*s} cy={gY-bh*0.3} rx={11*s} ry={bh*0.5} fill="#388E3C"/>
      <ellipse cx={cx+10*s} cy={gY-bh*0.3} rx={11*s} ry={bh*0.5} fill="#43A047"/>
      {[[-9,-0.55],[8,-0.6],[0,-0.85],[-13,-0.85],[12,-0.8]].map(([dx,dy],i)=><g key={i}>
        <circle cx={cx+dx*s} cy={gY+bh*dy} r={5.5*s} fill="#F06292"/>
        <circle cx={cx+dx*s-1.5*s} cy={gY+bh*dy-1*s} r={3*s} fill="#F8BBD0"/>
        <circle cx={cx+dx*s} cy={gY+bh*dy} r={1.4*s} fill="#AD1457"/>
      </g>)}
    </g>;
  },

  g_daisy3: () => {                                  // Wild Flowers — mixed meadow
    const fl=[{ox:-12*s,t:0.16,c:"#CE93D8"},{ox:-3*s,t:0.21,c:"#FFD54F"},{ox:6*s,t:0.15,c:"#EF5350"},{ox:13*s,t:0.19,c:"#4FC3F7"}];
    return <g key={suf}>
      {fl.map((f,i)=>{const fx=cx+f.ox, ft=gY-h*f.t*s; return <g key={i}>
        <line x1={fx} y1={gY} x2={fx} y2={ft} stroke="#43A047" strokeWidth={1.8*s} strokeLinecap="round"/>
        {ring(6,p=>{const r=p*60*Math.PI/180; return <ellipse key={p} cx={fx+Math.cos(r)*4.5*s} cy={ft+Math.sin(r)*4.5*s} rx={3*s} ry={1.8*s} fill={f.c} transform={`rotate(${p*60} ${fx+Math.cos(r)*4.5*s} ${ft+Math.sin(r)*4.5*s})`}/>;})}
        <circle cx={fx} cy={ft} r={2.4*s} fill="#FFF59D"/>
      </g>;})}
    </g>;
  },

  g_cherry: () => {                                  // Cherry Blossom tree
    const tH=h*0.38*s, tT=gY-tH;
    return <g key={suf}>
      <path d={`M${cx-4*s},${gY} C${cx-3*s},${gY-tH*0.5} ${cx+2*s},${gY-tH*0.7} ${cx},${tT}`} stroke="#795548" strokeWidth={7*s} fill="none" strokeLinecap="round"/>
      <path d={`M${cx},${tT} C${cx-15*s},${tT-8*s} ${cx-28*s},${tT+2*s} ${cx-32*s},${tT-5*s}`} stroke="#795548" strokeWidth={4*s} fill="none" strokeLinecap="round"/>
      <path d={`M${cx},${tT} C${cx+12*s},${tT-10*s} ${cx+25*s},${tT+4*s} ${cx+30*s},${tT-8*s}`} stroke="#795548" strokeWidth={4*s} fill="none" strokeLinecap="round"/>
      {[{ox:0,oy:-28,r:22},{ox:-28,oy:-6,r:16},{ox:26,oy:-10,r:17},{ox:-14,oy:-20,r:15},{ox:14,oy:-22,r:14}].map((b,bi)=><circle key={bi} cx={cx+b.ox*s} cy={tT+b.oy*s} r={b.r*s} fill="#F48FB1" opacity={0.8+bi*0.02}/>)}
      {[[-18,-12],[22,-8],[-6,-32],[8,-26],[-26,0],[28,-2]].map(([dx,dy],i)=><circle key={i} cx={cx+dx*s} cy={tT+dy*s} r={4*s} fill="#FCE4EC"/>)}
    </g>;
  },

  g_bamboo2: () => {                                 // Tall Bamboo grove (denser)
    const stalks=[{ox:-13*s,ht:0.4},{ox:-5*s,ht:0.52},{ox:3*s,ht:0.46},{ox:12*s,ht:0.36}];
    return <g key={suf}>
      {stalks.map((st,si)=>{const H=h*st.ht*s, seg=5, segH=H/seg; return <g key={si}>
        {ring(seg,i=><g key={i}>
          <rect x={cx+st.ox-3*s} y={gY-H+segH*i} width={6*s} height={segH-2} rx={2.5*s} fill={i%2?"#81C784":"#66BB6A"}/>
          <rect x={cx+st.ox-3.6*s} y={gY-H+segH*(i+1)-3} width={7.2*s} height={3.4} rx={1.6*s} fill="#388E3C" opacity="0.7"/>
        </g>)}
        <ellipse cx={cx+st.ox-9*s} cy={gY-H-3*s} rx={10*s} ry={3.4*s} fill="#4CAF50" transform={`rotate(-30 ${cx+st.ox-9*s} ${gY-H-3*s})`}/>
        <ellipse cx={cx+st.ox+9*s} cy={gY-H-1*s} rx={10*s} ry={3.4*s} fill="#66BB6A" transform={`rotate(24 ${cx+st.ox+9*s} ${gY-H-1*s})`}/>
      </g>;})}
    </g>;
  },

  g_butterfly2: () => {                              // Blue Butterfly — spotted wings
    const bx=cx, by=gY-h*0.28*s;
    return <g key={suf}>
      <animateTransform attributeName="transform" type="translate" values="0,0;3,-7;0,0;-3,-5;0,0" dur="4s" repeatCount="indefinite"/>
      <ellipse cx={bx-12*s} cy={by-6*s} rx={13*s} ry={9*s} fill="#42A5F5" transform={`rotate(-22 ${bx-12*s} ${by-6*s})`}/>
      <ellipse cx={bx+12*s} cy={by-6*s} rx={13*s} ry={9*s} fill="#1E88E5" transform={`rotate(22 ${bx+12*s} ${by-6*s})`}/>
      <ellipse cx={bx-8*s} cy={by+7*s} rx={9*s} ry={6*s} fill="#64B5F6" opacity="0.8" transform={`rotate(28 ${bx-8*s} ${by+7*s})`}/>
      <ellipse cx={bx+8*s} cy={by+7*s} rx={9*s} ry={6*s} fill="#42A5F5" opacity="0.8" transform={`rotate(-28 ${bx+8*s} ${by+7*s})`}/>
      <circle cx={bx-12*s} cy={by-6*s} r={3*s} fill="#FFF59D"/><circle cx={bx+12*s} cy={by-6*s} r={3*s} fill="#FFF59D"/>
      <ellipse cx={bx} cy={by} rx={2.5*s} ry={10*s} fill="#0D47A1"/>
      <line x1={bx} y1={by-9*s} x2={bx-8*s} y2={by-18*s} stroke="#0D47A1" strokeWidth={1.2*s}/>
      <line x1={bx} y1={by-9*s} x2={bx+8*s} y2={by-18*s} stroke="#0D47A1" strokeWidth={1.2*s}/>
    </g>;
  },

  g_mushroom2: () => {                               // Fairy Ring — circle of toadstools
    return <g key={suf}>
      <ellipse cx={cx} cy={gY-2*s} rx={22*s} ry={7*s} fill="#7E57C2" opacity="0.12"/>
      {ring(6,i=>{const a=i*60*Math.PI/180, mx=cx+Math.cos(a)*18*s, my=gY-3*s+Math.sin(a)*5*s, cap=4.5*s;
        return <g key={i}>
          <rect x={mx-cap*0.3} y={my-6*s} width={cap*0.6} height={6*s} rx={cap*0.3} fill="#FFF9C4"/>
          <path d={`M${mx-cap},${my-6*s} Q${mx},${my-6*s-cap} ${mx+cap},${my-6*s} Z`} fill="#CE93D8"/>
          <circle cx={mx} cy={my-7.5*s} r={1*s} fill="#fff" opacity="0.9"/>
        </g>;})}
    </g>;
  },

  g_gnome2: () => {                                  // Fairy Door — tiny door in a mound
    const dx=cx;
    return <g key={suf}>
      <ellipse cx={dx} cy={gY-2*s} rx={20*s} ry={8*s} fill="#5D4037"/>
      <path d={`M${dx-13*s},${gY-2*s} Q${dx-13*s},${gY-h*0.2*s} ${dx},${gY-h*0.22*s} Q${dx+13*s},${gY-h*0.2*s} ${dx+13*s},${gY-2*s} Z`} fill="#6D4C41"/>
      <path d={`M${dx-9*s},${gY-2*s} L${dx-9*s},${gY-h*0.15*s} Q${dx-9*s},${gY-h*0.2*s} ${dx},${gY-h*0.21*s} Q${dx+9*s},${gY-h*0.2*s} ${dx+9*s},${gY-h*0.15*s} L${dx+9*s},${gY-2*s} Z`} fill="#A1672A" stroke="#7B4A1E" strokeWidth={1.5*s}/>
      {ring(4,i=><line key={i} x1={dx-9*s+i*6*s} y1={gY-2*s} x2={dx-9*s+i*6*s} y2={gY-h*0.16*s} stroke="#7B4A1E" strokeWidth={0.8*s}/>)}
      <circle cx={dx+5*s} cy={gY-h*0.1*s} r={1.6*s} fill="#FFD54F"/>
      <circle cx={dx-15*s} cy={gY-h*0.08*s} r={2*s} fill="#F48FB1"/><circle cx={dx+15*s} cy={gY-h*0.06*s} r={2*s} fill="#CE93D8"/>
    </g>;
  },

  g_beehive2: () => {                                // Flower Arch — floral archway
    const aw=22*s, aT=gY-h*0.42*s;
    return <g key={suf}>
      <path d={`M${cx-aw},${gY} L${cx-aw},${aT+10*s} Q${cx},${aT-14*s} ${cx+aw},${aT+10*s} L${cx+aw},${gY}`} fill="none" stroke="#8D6E63" strokeWidth={5*s} strokeLinecap="round"/>
      <path d={`M${cx-aw},${aT+10*s} Q${cx},${aT-14*s} ${cx+aw},${aT+10*s}`} fill="none" stroke="#43A047" strokeWidth={7*s} strokeLinecap="round" opacity="0.85"/>
      {ring(9,i=>{const t=i/8, ax=cx-aw+t*2*aw, ay=aT+10*s-Math.sin(t*Math.PI)*24*s;
        return <circle key={i} cx={ax} cy={ay} r={3.4*s} fill={["#F48FB1","#CE93D8","#FFD54F","#F06292"][i%4]}/>;})}
      {[[-aw,0.55],[aw,0.55]].map(([ox,ht],i)=><g key={i}>
        <circle cx={cx+ox} cy={gY-h*0.18*s} r={3*s} fill="#F48FB1"/><circle cx={cx+ox} cy={gY-h*0.1*s} r={3*s} fill="#CE93D8"/>
      </g>)}
    </g>;
  },

  g_rainbow: () => {                                 // Mini Rainbow (sky)
    const rx=cx, ry=gY;
    const cols=["#EF5350","#FF7043","#FFD54F","#66BB6A","#4FC3F7","#CE93D8"];
    return <g key={suf}>
      {cols.map((c,ci)=>{const r=(16+ci*4.5)*s; return <path key={ci} d={`M${rx-r},${ry} A${r},${r} 0 0,1 ${rx+r},${ry}`} fill="none" stroke={c} strokeWidth={3.6*s} opacity={0.85-ci*0.04} strokeLinecap="round"/>;})}
      {[-1,1].map(side=><g key={side}>
        <circle cx={rx+side*(16+5*4.5)*s} cy={ry} r={7*s} fill="#fff" opacity="0.88"/>
        <circle cx={rx+side*(16+5*4.5+6)*s} cy={ry+2*s} r={5*s} fill="#fff" opacity="0.82"/>
      </g>)}
    </g>;
  },

  g_cactus2: () => {                                 // Succulent Patch — rosettes
    const ro=[{ox:-11*s,r:8*s,c:"#81C784"},{ox:3*s,r:10*s,c:"#66BB6A"},{ox:14*s,r:7*s,c:"#A5D6A7"}];
    return <g key={suf}>
      <ellipse cx={cx} cy={gY-2*s} rx={24*s} ry={6*s} fill="#8D6E63" opacity="0.4"/>
      {ro.map((p,i)=>{const px=cx+p.ox, py=gY-p.r*0.6; return <g key={i}>
        {ring(8,k=>{const a=k*45*Math.PI/180; return <ellipse key={k} cx={px+Math.cos(a)*p.r*0.5} cy={py+Math.sin(a)*p.r*0.4} rx={p.r*0.5} ry={p.r*0.25} fill={p.c} stroke="#388E3C" strokeWidth={0.5*s} transform={`rotate(${k*45} ${px+Math.cos(a)*p.r*0.5} ${py+Math.sin(a)*p.r*0.4})`}/>;})}
        <circle cx={px} cy={py} r={p.r*0.3} fill="#C5E1A5"/>
      </g>;})}
    </g>;
  },

  /* ════════════════════════════════════════════
     STAGE 3 — FLOURISHING
  ════════════════════════════════════════════ */
  g_cherry2: () => {                                 // Apple Tree
    const tH=h*0.34*s, tT=gY-tH;
    return <g key={suf}>
      <rect x={cx-5*s} y={gY-tH} width={10*s} height={tH} rx={4*s} fill="#795548"/>
      <circle cx={cx} cy={tT-12*s} r={24*s} fill="#43A047"/>
      <circle cx={cx-18*s} cy={tT-4*s} r={15*s} fill="#388E3C"/><circle cx={cx+18*s} cy={tT-4*s} r={15*s} fill="#4CAF50"/>
      {[[-12,-6],[10,-10],[0,-18],[-20,-2],[18,-3],[6,-2]].map(([dx,dy],i)=><g key={i}>
        <circle cx={cx+dx*s} cy={tT+dy*s} r={3.6*s} fill="#E53935"/>
        <circle cx={cx+dx*s-1*s} cy={tT+dy*s-1*s} r={1.2*s} fill="#FFCDD2" opacity="0.8"/>
      </g>)}
    </g>;
  },

  g_rose3: () => {                                   // Climbing Roses — trellis
    const tw=20*s, tT=gY-h*0.4*s;
    return <g key={suf}>
      {ring(4,i=><line key={`v${i}`} x1={cx-tw+i*(2*tw/3)} y1={gY} x2={cx-tw+i*(2*tw/3)} y2={tT} stroke="#A1887F" strokeWidth={2*s}/>)}
      {ring(4,i=><line key={`h${i}`} x1={cx-tw} y1={gY-i*(gY-tT)/3} x2={cx+tw} y2={gY-i*(gY-tT)/3} stroke="#A1887F" strokeWidth={2*s}/>)}
      {ring(7,i=>{const gx=cx-tw+(i*2*tw/6), gy=gY-((i*53)%((gY-tT)));
        const yy=tT+((i*7)%(gY-tT)); return <g key={i}>
        <circle cx={gx} cy={yy} r={4*s} fill="#EC407A"/><circle cx={gx-1*s} cy={yy-1*s} r={2*s} fill="#F8BBD0"/>
      </g>;})}
      {ring(6,i=><ellipse key={`l${i}`} cx={cx-tw+i*(2*tw/5)} cy={tT+ (i*9)%(gY-tT) } rx={4*s} ry={2*s} fill="#66BB6A" transform={`rotate(${i*30} ${cx-tw+i*(2*tw/5)} ${tT})`}/>)}
    </g>;
  },

  g_fountain: () => {                                // Wishing Fountain
    const fx=cx;
    return <g key={suf}>
      <ellipse cx={fx} cy={gY} rx={18*s} ry={5*s} fill="#90A4AE"/>
      <rect x={fx-6*s} y={gY-h*0.18*s} width={12*s} height={h*0.18*s} rx={5*s} fill="#B0BEC5"/>
      <ellipse cx={fx} cy={gY-h*0.18*s} rx={20*s} ry={7*s} fill="#90A4AE"/>
      <ellipse cx={fx} cy={gY-h*0.18*s} rx={17*s} ry={5*s} fill="#4FC3F7" opacity="0.8"/>
      <rect x={fx-4*s} y={gY-h*0.32*s} width={8*s} height={h*0.14*s} rx={4*s} fill="#B0BEC5"/>
      <ellipse cx={fx} cy={gY-h*0.32*s} rx={13*s} ry={5*s} fill="#90A4AE"/>
      <ellipse cx={fx} cy={gY-h*0.32*s} rx={11*s} ry={3.5*s} fill="#81D4FA" opacity="0.85"/>
      {[-18,-9,0,9,18].map((ox,wi)=><path key={wi} d={`M${fx},${gY-h*0.34*s} Q${fx+ox*0.6*s},${gY-h*0.38*s} ${fx+ox*s},${gY-h*0.21*s}`} fill="none" stroke="#81D4FA" strokeWidth={2*s} strokeLinecap="round">
        <animate attributeName="opacity" values="0.4;0.85;0.4" dur={`${1.5+wi*0.2}s`} repeatCount="indefinite"/></path>)}
    </g>;
  },

  g_fern3: () => {                                   // Willow Tree — weeping
    const tH=h*0.32*s, tT=gY-tH;
    return <g key={suf}>
      <path d={`M${cx-4*s},${gY} Q${cx},${gY-tH*0.6} ${cx},${tT}`} stroke="#6D4C41" strokeWidth={6*s} fill="none" strokeLinecap="round"/>
      <ellipse cx={cx} cy={tT-6*s} rx={26*s} ry={12*s} fill="#558B2F" opacity="0.9"/>
      {ring(9,i=>{const ox=(-22+i*5.5)*s, len=(14+Math.sin(i)*8)*s;
        return <path key={i} d={`M${cx+ox},${tT-4*s} q${4*s},${len*0.6} ${1*s},${len}`} stroke="#7CB342" strokeWidth={2*s} fill="none" strokeLinecap="round" opacity="0.85">
          <animate attributeName="d" values={`M${cx+ox},${tT-4*s} q${4*s},${len*0.6} ${1*s},${len};M${cx+ox},${tT-4*s} q${-2*s},${len*0.6} ${-2*s},${len};M${cx+ox},${tT-4*s} q${4*s},${len*0.6} ${1*s},${len}`} dur={`${3+i*0.2}s`} repeatCount="indefinite"/>
        </path>;})}
    </g>;
  },

  g_birdbath2: () => {                               // Garden Swing
    const fx=cx, top=gY-h*0.4*s;
    return <g key={suf}>
      <path d={`M${cx-18*s},${gY} L${cx-10*s},${top}`} stroke="#8D6E63" strokeWidth={4*s} strokeLinecap="round"/>
      <path d={`M${cx+18*s},${gY} L${cx+10*s},${top}`} stroke="#8D6E63" strokeWidth={4*s} strokeLinecap="round"/>
      <line x1={cx-12*s} y1={top} x2={cx+12*s} y2={top} stroke="#6D4C41" strokeWidth={4*s} strokeLinecap="round"/>
      <g><animateTransform attributeName="transform" type="rotate" values={`-7 ${cx} ${top};7 ${cx} ${top};-7 ${cx} ${top}`} dur="3.2s" repeatCount="indefinite"/>
        <line x1={cx-6*s} y1={top} x2={cx-6*s} y2={gY-h*0.12*s} stroke="#A1887F" strokeWidth={1.6*s}/>
        <line x1={cx+6*s} y1={top} x2={cx+6*s} y2={gY-h*0.12*s} stroke="#A1887F" strokeWidth={1.6*s}/>
        <rect x={cx-9*s} y={gY-h*0.12*s} width={18*s} height={3.5*s} rx={1.6*s} fill="#8D6E63"/>
      </g>
    </g>;
  },

  g_butterfly3: () => {                              // Butterfly Garden — trio (air)
    const wing=(bx,by,c1,c2,rot)=> <g transform={`rotate(${rot} ${bx} ${by})`}>
      <ellipse cx={bx-7*s} cy={by-3*s} rx={7*s} ry={5*s} fill={c1} transform={`rotate(-22 ${bx-7*s} ${by-3*s})`}/>
      <ellipse cx={bx+7*s} cy={by-3*s} rx={7*s} ry={5*s} fill={c2} transform={`rotate(22 ${bx+7*s} ${by-3*s})`}/>
      <ellipse cx={bx-5*s} cy={by+4*s} rx={5*s} ry={3.5*s} fill={c1} opacity="0.8"/><ellipse cx={bx+5*s} cy={by+4*s} rx={5*s} ry={3.5*s} fill={c2} opacity="0.8"/>
      <ellipse cx={bx} cy={by} rx={1.6*s} ry={6*s} fill="#4A148C"/>
    </g>;
    return <g key={suf}>
      <g><animateTransform attributeName="transform" type="translate" values="0,0;4,-6;0,0" dur="3s" repeatCount="indefinite"/>{wing(cx-14*s,gY-h*0.34*s,"#F48FB1","#EC407A",-8)}</g>
      <g><animateTransform attributeName="transform" type="translate" values="0,0;-3,-7;0,0" dur="3.6s" repeatCount="indefinite"/>{wing(cx+12*s,gY-h*0.28*s,"#FFD54F","#FB8C00",6)}</g>
      <g><animateTransform attributeName="transform" type="translate" values="0,0;2,-5;0,0" dur="4.2s" repeatCount="indefinite"/>{wing(cx,gY-h*0.42*s,"#CE93D8","#7E57C2",0)}</g>
    </g>;
  },

  g_sunflower3: () => {                              // Sunflower Field — row of blooms
    const xs=[-16,-5,6,16];
    const bloom=(bx,by,r)=> <g>
      {ring(9,i=>{const a=i*40,rad=a*Math.PI/180; return <ellipse key={i} cx={bx+Math.cos(rad)*r} cy={by+Math.sin(rad)*r} rx={r*0.55} ry={r*0.3} fill="#FFD54F" transform={`rotate(${a} ${bx+Math.cos(rad)*r} ${by+Math.sin(rad)*r})`}/>;})}
      <circle cx={bx} cy={by} r={r*0.6} fill="#6D4C00"/>
    </g>;
    return <g key={suf}>
      {xs.map((ox,i)=>{const bx=cx+ox*s, top=gY-h*(0.24+ (i%2)*0.05)*s; return <g key={i}>
        <line x1={bx} y1={gY} x2={bx} y2={top} stroke="#43A047" strokeWidth={2.6*s} strokeLinecap="round"/>
        {bloom(bx,top,7*s)}
      </g>;})}
    </g>;
  },

  g_mushroom3: () => {                               // Giant Mushroom — toadstool house
    const mx=cx, capY=gY-h*0.3*s, cap=22*s;
    return <g key={suf}>
      <rect x={mx-7*s} y={capY} width={14*s} height={h*0.3*s} rx={6*s} fill="#FFF3E0"/>
      <ellipse cx={mx-1*s} cy={gY-h*0.12*s} rx={3.5*s} ry={5*s} fill="#A1887F" opacity="0.6"/>
      <path d={`M${mx-cap},${capY} Q${mx},${capY-cap*0.95} ${mx+cap},${capY} Z`} fill="#D32F2F"/>
      <path d={`M${mx-cap},${capY} Q${mx},${capY-cap*0.95} ${mx+cap},${capY}`} fill="none" stroke="#B71C1C" strokeWidth={1.5*s}/>
      {[[-12,-4,4],[8,-7,3.5],[0,-13,3],[-4,-2,2.5],[14,-2,3]].map(([dx,dy,r],i)=><circle key={i} cx={mx+dx*s} cy={capY+dy*s} r={r*s} fill="#fff" opacity="0.92"/>)}
    </g>;
  },

  g_ladybug3: () => {                                // Frog on Lily Pad
    const px=cx;
    return <g key={suf}>
      <ellipse cx={px} cy={gY-3*s} rx={20*s} ry={6*s} fill="#4FC3F7" opacity="0.4"/>
      <path d={`M${px-15*s},${gY-4*s} A15,5 0 1,0 ${px+15*s},${gY-4*s} L${px+3*s},${gY-4*s} Z`} fill="#66BB6A"/>
      <ellipse cx={px} cy={gY-4*s} rx={15*s} ry={5*s} fill="#81C784" opacity="0.5"/>
      <ellipse cx={px} cy={gY-h*0.13*s} rx={9*s} ry={7*s} fill="#43A047"/>
      <circle cx={px-4*s} cy={gY-h*0.2*s} r={3.5*s} fill="#66BB6A"/><circle cx={px+4*s} cy={gY-h*0.2*s} r={3.5*s} fill="#66BB6A"/>
      <circle cx={px-4*s} cy={gY-h*0.205*s} r={1.6*s} fill="#1a1a1a"/><circle cx={px+4*s} cy={gY-h*0.205*s} r={1.6*s} fill="#1a1a1a"/>
      <path d={`M${px-4*s},${gY-h*0.1*s} Q${px},${gY-h*0.08*s} ${px+4*s},${gY-h*0.1*s}`} stroke="#1B5E20" strokeWidth={1.4*s} fill="none" strokeLinecap="round"/>
    </g>;
  },

  g_beehive3: () => {                                // Wind Chimes (air)
    const top=gY;
    return <g key={suf}>
      <ellipse cx={cx} cy={top} rx={14*s} ry={3*s} fill="#8D6E63"/>
      {[-9,-3,3,9].map((ox,i)=>{const len=(12+ (i%2)*6)*s; return <g key={i}>
        <line x1={cx+ox*s} y1={top} x2={cx+ox*s} y2={top+len} stroke="#B0BEC5" strokeWidth={0.8*s}/>
        <rect x={cx+ox*s-1.6*s} y={top+len} width={3.2*s} height={9*s} rx={1.6*s} fill={["#FFD54F","#4FC3F7","#F48FB1","#81C784"][i]}>
          <animateTransform attributeName="transform" type="rotate" values={`-6 ${cx+ox*s} ${top};6 ${cx+ox*s} ${top};-6 ${cx+ox*s} ${top}`} dur={`${2+i*0.3}s`} repeatCount="indefinite"/>
        </rect>
      </g>;})}
      <circle cx={cx} cy={top+20*s} r={3*s} fill="#FF7043">
        <animateTransform attributeName="transform" type="rotate" values={`-5 ${cx} ${top};5 ${cx} ${top};-5 ${cx} ${top}`} dur="2.4s" repeatCount="indefinite"/>
      </circle>
    </g>;
  },

  /* ════════════════════════════════════════════
     STAGE 4 — THRIVING
  ════════════════════════════════════════════ */
  g_treehouse: () => {                               // Tree House
    const tx=cx, tT=gY-h*0.3*s;
    return <g key={suf}>
      <rect x={tx-8*s} y={gY-h*0.3*s} width={16*s} height={h*0.3*s} rx={7*s} fill="#795548"/>
      <circle cx={tx} cy={tT-14*s} r={26*s} fill="#43A047"/><circle cx={tx-16*s} cy={tT-8*s} r={18*s} fill="#388E3C"/><circle cx={tx+16*s} cy={tT-8*s} r={18*s} fill="#388E3C"/>
      <rect x={tx-18*s} y={tT-3*s} width={36*s} height={5*s} rx={2*s} fill="#8D6E63"/>
      <rect x={tx-14*s} y={tT-18*s} width={28*s} height={15*s} rx={3*s} fill="#FFCCBC"/>
      <path d={`M${tx-17*s},${tT-18*s} L${tx},${tT-30*s} L${tx+17*s},${tT-18*s} Z`} fill="#E53935"/>
      <rect x={tx-4*s} y={tT-11*s} width={8*s} height={8*s} rx={3*s} fill="#795548"/>
      <rect x={tx+5*s} y={tT-16*s} width={6*s} height={6*s} rx={1.5*s} fill="#B3E5FC"/><rect x={tx-11*s} y={tT-16*s} width={6*s} height={6*s} rx={1.5*s} fill="#B3E5FC"/>
      {[0.3,0.55,0.8].map((t,i)=><line key={i} x1={tx-3*s} y1={gY+(tT-gY)*t} x2={tx+3*s} y2={gY+(tT-gY)*t} stroke="#8D6E63" strokeWidth={1.5*s}/>)}
    </g>;
  },

  g_cherry3: () => {                                 // Maple Tree — autumn
    const tH=h*0.34*s, tT=gY-tH;
    return <g key={suf}>
      <path d={`M${cx-4*s},${gY} Q${cx+3*s},${gY-tH*0.6} ${cx},${tT}`} stroke="#5D4037" strokeWidth={6*s} fill="none" strokeLinecap="round"/>
      <circle cx={cx} cy={tT-12*s} r={22*s} fill="#FB8C00"/>
      <circle cx={cx-16*s} cy={tT-2*s} r={14*s} fill="#F4511E"/><circle cx={cx+16*s} cy={tT-2*s} r={14*s} fill="#FF7043"/>
      <circle cx={cx-4*s} cy={tT-20*s} r={12*s} fill="#FFA726"/>
      {[[-20,2],[18,4],[24,-6],[-24,-4]].map(([dx,dy],i)=><path key={i} d={`M${cx+dx*s},${tT+dy*s} l${-2*s},${4*s} l${4*s},0 Z`} fill="#E64A19"/>)}
    </g>;
  },

  g_windmill: () => {                                // Windmill
    const wx=cx, bT=gY-h*0.38*s;
    return <g key={suf}>
      <path d={`M${wx-7*s},${gY} L${wx-4*s},${bT} L${wx+4*s},${bT} L${wx+7*s},${gY} Z`} fill="#CE93D8"/>
      <rect x={wx-4*s} y={gY-h*0.1*s} width={8*s} height={h*0.1*s} rx={3*s} fill="#7B1FA2" opacity="0.6"/>
      <circle cx={wx} cy={gY-h*0.22*s} r={3.4*s} fill="#E1BEE7"/>
      <ellipse cx={wx} cy={bT} rx={9*s} ry={4*s} fill="#AB47BC"/>
      <path d={`M${wx-8*s},${bT} L${wx},${bT-10*s} L${wx+8*s},${bT} Z`} fill="#AB47BC"/>
      <g><animateTransform attributeName="transform" type="rotate" values={`0 ${wx} ${bT};360 ${wx} ${bT}`} dur="6s" repeatCount="indefinite"/>
        {[0,90,180,270].map((a,i)=><path key={i} d={`M${wx},${bT} L${wx-5*s},${bT-22*s} L${wx+5*s},${bT-22*s} Z`} fill="#F3E5F5" stroke="#CE93D8" strokeWidth={s} transform={`rotate(${a} ${wx} ${bT})`}/>)}
      </g>
      <circle cx={wx} cy={bT} r={4*s} fill="#FFD54F"/>
    </g>;
  },

  g_rose4: () => {                                   // Rainbow Roses
    const tT=gY-h*0.24*s;
    const cols=["#E53935","#FB8C00","#FDD835","#43A047","#1E88E5","#8E24AA"];
    return <g key={suf}>
      {cols.map((c,i)=>{const ox=(-15+i*6)*s, ht=(0.18+ (i%2)*0.05); const ft=gY-h*ht*s;
        return <g key={i}>
          <line x1={cx+ox} y1={gY} x2={cx+ox} y2={ft} stroke="#2E7D32" strokeWidth={2*s} strokeLinecap="round"/>
          <circle cx={cx+ox} cy={ft} r={5*s} fill={c}/><circle cx={cx+ox-1*s} cy={ft-1*s} r={2.6*s} fill="#fff" opacity="0.5"/>
        </g>;})}
    </g>;
  },

  g_fountain2: () => {                               // KOI POND — flat on the ground!
    const rw=30*s, rh=11*s, px=cx, py=gY-rh*0.45;   // pond is set INTO the ground
    return <g key={suf}>
      <defs><radialGradient id={uid('w')} cx="50%" cy="40%" r="70%"><stop offset="0%" stopColor="#B3E5FC"/><stop offset="100%" stopColor="#0288D1"/></radialGradient></defs>
      {ring(11,i=>{const a=i*32.7*Math.PI/180; return <ellipse key={i} cx={px+Math.cos(a)*rw} cy={py+Math.sin(a)*rh} rx={4*s} ry={3*s} fill="#90A4AE"/>;})}
      <ellipse cx={px} cy={py} rx={rw} ry={rh} fill={`url(#${uid('w')})`}/>
      <ellipse cx={px} cy={py-1*s} rx={rw*0.6} ry={rh*0.5} fill="none" stroke="#fff" strokeWidth={s} opacity="0.5">
        <animate attributeName="rx" values={`${rw*0.3};${rw*0.85};${rw*0.3}`} dur="3.5s" repeatCount="indefinite"/>
        <animate attributeName="opacity" values="0.6;0;0.6" dur="3.5s" repeatCount="indefinite"/>
      </ellipse>
      {/* lily pads */}
      <ellipse cx={px-13*s} cy={py+2*s} rx={7*s} ry={3.4*s} fill="#43A047"/><circle cx={px-15*s} cy={py+1*s} r={2*s} fill="#F48FB1"/>
      <ellipse cx={px+15*s} cy={py-2*s} rx={6*s} ry={3*s} fill="#66BB6A"/>
      {/* koi */}
      {[{ox:-6,oy:1,c:"#FF7043",d:"4s"},{ox:9,oy:3,c:"#FFB74D",d:"5s"},{ox:0,oy:-3,c:"#FFFFFF",d:"4.5s"}].map((k,i)=><g key={i}>
        <animateTransform attributeName="transform" type="translate" values={`-6,0;6,0;-6,0`} dur={k.d} repeatCount="indefinite"/>
        <ellipse cx={px+k.ox*s} cy={py+k.oy*s} rx={5*s} ry={2.4*s} fill={k.c}/>
        <path d={`M${px+k.ox*s-5*s},${py+k.oy*s} l${-3*s},${-2*s} l0,${4*s} Z`} fill={k.c}/>
        {k.c!=="#FFFFFF"&&<circle cx={px+k.ox*s+1*s} cy={py+k.oy*s-0.5*s} r={1*s} fill="#fff"/>}
      </g>)}
    </g>;
  },

  g_fireflies: () => {                               // Firefly Jar
    const jx=cx, jy=gY;
    return <g key={suf}>
      <ellipse cx={jx} cy={jy} rx={9*s} ry={3*s} fill="#000" opacity="0.1"/>
      <rect x={jx-8*s} y={jy-h*0.12*s} width={16*s} height={h*0.12*s} rx={5*s} fill="#E8F5E9" opacity="0.9" stroke="#A5D6A7" strokeWidth={1.5*s}/>
      <rect x={jx-5*s} y={jy-h*0.15*s} width={10*s} height={h*0.04*s} rx={2*s} fill="#C8E6C9" stroke="#A5D6A7" strokeWidth={1.5*s}/>
      <rect x={jx-6*s} y={jy-h*0.165*s} width={12*s} height={4*s} rx={2*s} fill="#8D6E63"/>
      <ellipse cx={jx} cy={jy-h*0.07*s} rx={7*s} ry={5*s} fill="#FFD54F" opacity="0.35"/>
      {[{ox:-18,oy:-0.3,d:"2.4s"},{ox:14,oy:-0.38,d:"3.1s"},{ox:-8,oy:-0.5,d:"2.8s"},{ox:22,oy:-0.25,d:"3.5s"}].map((f,i)=><circle key={i} cx={jx+f.ox*s} cy={gY+h*f.oy*s} r={3*s} fill="#FFE082">
        <animate attributeName="opacity" values="0.1;1;0.1" dur={f.d} repeatCount="indefinite"/>
      </circle>)}
    </g>;
  },

  g_butterfly4: () => {                              // Butterfly Tower — topiary + butterflies
    const tT=gY-h*0.4*s;
    return <g key={suf}>
      <rect x={cx-4*s} y={gY-h*0.12*s} width={8*s} height={h*0.12*s} rx={3*s} fill="#8D6E63"/>
      <ellipse cx={cx} cy={gY-h*0.12*s} rx={12*s} ry={5*s} fill="#6D4C41"/>
      {[0.18,0.27,0.36].map((t,i)=><circle key={i} cx={cx} cy={gY-h*(t+0.06)*s} r={(13-i*2.5)*s} fill={i%2?"#66BB6A":"#43A047"}/>)}
      {[[-13,0.26,"#F48FB1"],[12,0.32,"#CE93D8"],[3,0.46,"#FFD54F"]].map(([dx,t,c],i)=><g key={i}>
        <animateTransform attributeName="transform" type="translate" values="0,0;3,-5;0,0" dur={`${3+i}s`} repeatCount="indefinite"/>
        <ellipse cx={cx+dx*s-3*s} cy={gY-h*t*s} rx={4*s} ry={2.8*s} fill={c} transform={`rotate(-20 ${cx+dx*s-3*s} ${gY-h*t*s})`}/>
        <ellipse cx={cx+dx*s+3*s} cy={gY-h*t*s} rx={4*s} ry={2.8*s} fill={c} transform={`rotate(20 ${cx+dx*s+3*s} ${gY-h*t*s})`}/>
      </g>)}
    </g>;
  },

  g_bamboo3: () => {                                 // Bamboo Forest — dense
    const stalks=[-16,-10,-4,2,8,14].map((ox,i)=>({ox:ox*s,ht:0.4+(i%3)*0.06}));
    return <g key={suf}>
      {stalks.map((st,si)=>{const H=h*st.ht*s, seg=5, segH=H/seg; return <g key={si}>
        {ring(seg,i=><rect key={i} x={cx+st.ox-2.6*s} y={gY-H+segH*i} width={5.2*s} height={segH-2} rx={2.2*s} fill={si%2?"#66BB6A":"#558B2F"}/>)}
        <ellipse cx={cx+st.ox-7*s} cy={gY-H-2*s} rx={8*s} ry={2.8*s} fill="#7CB342" transform={`rotate(-30 ${cx+st.ox-7*s} ${gY-H-2*s})`}/>
      </g>;})}
    </g>;
  },

  g_gnome3: () => {                                  // Stone Lantern (glowing)
    const lx=cx;
    return <g key={suf}>
      <ellipse cx={lx} cy={gY} rx={12*s} ry={4*s} fill="#78909C"/>
      <rect x={lx-7*s} y={gY-h*0.14*s} width={14*s} height={h*0.14*s} rx={2*s} fill="#90A4AE"/>
      <rect x={lx-10*s} y={gY-h*0.18*s} width={20*s} height={h*0.05*s} rx={2*s} fill="#B0BEC5"/>
      <rect x={lx-9*s} y={gY-h*0.3*s} width={18*s} height={h*0.12*s} rx={2*s} fill="#CFD8DC"/>
      <rect x={lx-6*s} y={gY-h*0.28*s} width={12*s} height={h*0.08*s} rx={1.5*s} fill="#FFE082"><animate attributeName="opacity" values="0.6;1;0.6" dur="2.4s" repeatCount="indefinite"/></rect>
      <path d={`M${lx-11*s},${gY-h*0.3*s} L${lx},${gY-h*0.4*s} L${lx+11*s},${gY-h*0.3*s} Z`} fill="#90A4AE"/>
      <circle cx={lx} cy={gY-h*0.41*s} r={2.4*s} fill="#78909C"/>
    </g>;
  },

  g_rainbow2: () => {                                // Double Rainbow (sky)
    const rx=cx, ry=gY;
    const cols=["#EF5350","#FF7043","#FFD54F","#66BB6A","#4FC3F7","#CE93D8"];
    return <g key={suf}>
      {cols.map((c,ci)=>{const r=(16+ci*4)*s; return <path key={`a${ci}`} d={`M${rx-r},${ry} A${r},${r} 0 0,1 ${rx+r},${ry}`} fill="none" stroke={c} strokeWidth={3.2*s} opacity={0.9-ci*0.05} strokeLinecap="round"/>;})}
      {cols.slice().reverse().map((c,ci)=>{const r=(48+ci*3.4)*s; return <path key={`b${ci}`} d={`M${rx-r},${ry} A${r},${r} 0 0,1 ${rx+r},${ry}`} fill="none" stroke={c} strokeWidth={2.4*s} opacity={0.45-ci*0.03} strokeLinecap="round"/>;})}
      {[-1,1].map(side=><circle key={side} cx={rx+side*(16+5*4)*s} cy={ry} r={6*s} fill="#fff" opacity="0.85"/>)}
    </g>;
  },

  /* ════════════════════════════════════════════
     STAGE 5 — BLOSSOMING  (magical / glowing)
  ════════════════════════════════════════════ */
  g_cherry4: () => {                                 // Magic Tree — glows at night
    const tH=h*0.34*s, tT=gY-tH;
    return <g key={suf}>
      <defs><radialGradient id={uid('g')} cx="50%" cy="40%" r="60%"><stop offset="0%" stopColor="#E1BEE7"/><stop offset="100%" stopColor="#7E57C2"/></radialGradient></defs>
      <path d={`M${cx-4*s},${gY} Q${cx+2*s},${gY-tH*0.6} ${cx},${tT}`} stroke="#4E342E" strokeWidth={6*s} fill="none" strokeLinecap="round"/>
      <circle cx={cx} cy={tT-12*s} r={24*s} fill={`url(#${uid('g')})`}><animate attributeName="r" values={`${22*s};${25*s};${22*s}`} dur="4s" repeatCount="indefinite"/></circle>
      <circle cx={cx-16*s} cy={tT-2*s} r={14*s} fill="#9575CD" opacity="0.9"/><circle cx={cx+16*s} cy={tT-2*s} r={14*s} fill="#9575CD" opacity="0.9"/>
      {ring(8,i=>{const a=i*45*Math.PI/180, r=18*s; return <g key={i}><circle cx={cx+Math.cos(a)*r} cy={tT-10*s+Math.sin(a)*r} r={1.6*s} fill="#FFF59D"><animate attributeName="opacity" values="0.2;1;0.2" dur={`${2+i*0.2}s`} repeatCount="indefinite"/></circle></g>;})}
    </g>;
  },

  g_fountain3: () => {                               // Crystal Fountain
    const fx=cx;
    return <g key={suf}>
      <defs><linearGradient id={uid('c')} x1="0" y1="0" x2="0" y2="1"><stop offset="0%" stopColor="#E1F5FE"/><stop offset="100%" stopColor="#4FC3F7"/></linearGradient></defs>
      <ellipse cx={fx} cy={gY} rx={15*s} ry={5*s} fill="#90A4AE"/>
      <rect x={fx-5*s} y={gY-h*0.16*s} width={10*s} height={h*0.16*s} rx={3*s} fill="#B0BEC5"/>
      <ellipse cx={fx} cy={gY-h*0.16*s} rx={20*s} ry={7*s} fill="#B3E5FC"/>
      <ellipse cx={fx} cy={gY-h*0.16*s} rx={17*s} ry={5*s} fill="#81D4FA"/>
      <path d={`M${fx-5*s},${gY-h*0.16*s} L${fx-3*s},${gY-h*0.34*s} L${fx+3*s},${gY-h*0.34*s} L${fx+5*s},${gY-h*0.16*s} Z`} fill={`url(#${uid('c')})`} stroke="#fff" strokeWidth={s} opacity="0.9"/>
      <path d={`M${fx-8*s},${gY-h*0.34*s} L${fx},${gY-h*0.46*s} L${fx+8*s},${gY-h*0.34*s} Z`} fill="#E1F5FE" stroke="#81D4FA" strokeWidth={s}/>
      {[-12,0,12].map((ox,i)=><path key={i} d={`M${fx},${gY-h*0.44*s} Q${fx+ox*0.6*s},${gY-h*0.5*s} ${fx+ox*s},${gY-h*0.2*s}`} fill="none" stroke="#B3E5FC" strokeWidth={2*s} strokeLinecap="round"><animate attributeName="opacity" values="0.3;0.9;0.3" dur={`${1.6+i*0.3}s`} repeatCount="indefinite"/></path>)}
      {ring(4,i=><circle key={i} cx={fx+(-9+i*6)*s} cy={gY-h*0.46*s} r={1.4*s} fill="#fff"><animate attributeName="opacity" values="0;1;0" dur="2s" begin={`${i*0.3}s`} repeatCount="indefinite"/></circle>)}
    </g>;
  },

  g_windmill2: () => {                               // Fairy Windmill — lit blades
    const wx=cx, bT=gY-h*0.34*s;
    return <g key={suf}>
      <path d={`M${wx-6*s},${gY} L${wx-3.5*s},${bT} L${wx+3.5*s},${bT} L${wx+6*s},${gY} Z`} fill="#F48FB1"/>
      <ellipse cx={wx} cy={bT} rx={7*s} ry={3*s} fill="#EC407A"/>
      <path d={`M${wx-6*s},${bT} L${wx},${bT-8*s} L${wx+6*s},${bT} Z`} fill="#EC407A"/>
      <g><animateTransform attributeName="transform" type="rotate" values={`0 ${wx} ${bT};360 ${wx} ${bT}`} dur="7s" repeatCount="indefinite"/>
        {[0,90,180,270].map((a,i)=><g key={i} transform={`rotate(${a} ${wx} ${bT})`}>
          <path d={`M${wx},${bT} L${wx-4*s},${bT-20*s} L${wx+4*s},${bT-20*s} Z`} fill="#FCE4EC" stroke="#F48FB1" strokeWidth={s}/>
          <circle cx={wx} cy={bT-18*s} r={1.4*s} fill="#FFF59D"/>
        </g>)}
      </g>
      <circle cx={wx} cy={bT} r={3*s} fill="#FFF59D"/>
      {ring(3,i=><circle key={i} cx={wx+(-8+i*8)*s} cy={gY-h*0.1*s} r={1.2*s} fill="#FFF59D"><animate attributeName="opacity" values="0.2;1;0.2" dur={`${1.5+i*0.4}s`} repeatCount="indefinite"/></circle>)}
    </g>;
  },

  g_rose5: () => {                                   // Enchanted Roses — sparkling
    const tT=gY-h*0.24*s;
    return <g key={suf}>
      {[-10,2,11].map((ox,i)=>{const ft=gY-h*(0.18+ (i%2)*0.06)*s; return <g key={i}>
        <line x1={cx+ox*s} y1={gY} x2={cx+ox*s} y2={ft} stroke="#4A148C" strokeWidth={2.2*s} strokeLinecap="round"/>
        <circle cx={cx+ox*s} cy={ft} r={6*s} fill="#7E57C2"/><circle cx={cx+ox*s-1.5*s} cy={ft-1.5*s} r={3.2*s} fill="#B39DDB"/>
        <circle cx={cx+ox*s} cy={ft} r={1.6*s} fill="#fff" opacity="0.8"/>
        {ring(3,k=><circle key={k} cx={cx+ox*s+(-5+k*5)*s} cy={ft-7*s} r={0.9*s} fill="#fff"><animate attributeName="opacity" values="0;1;0" dur="1.8s" begin={`${k*0.4}s`} repeatCount="indefinite"/></circle>)}
      </g>;})}
    </g>;
  },

  g_mushroom4: () => {                               // Glowing Fungi
    const sh=[{ox:-9*s,ht:0.16,cap:10*s},{ox:4*s,ht:0.22,cap:8*s},{ox:13*s,ht:0.13,cap:7*s}];
    return <g key={suf}>
      {sh.map((m,i)=>{const fx=cx+m.ox, ft=gY-h*m.ht*s; return <g key={i}>
        <ellipse cx={fx} cy={gY-2*s} rx={m.cap*1.2} ry={3*s} fill="#4DD0E1" opacity="0.25"/>
        <rect x={fx-m.cap*0.28} y={ft} width={m.cap*0.56} height={h*m.ht*s} rx={m.cap*0.28} fill="#B2EBF2"/>
        <path d={`M${fx-m.cap},${ft} Q${fx},${ft-m.cap*0.95} ${fx+m.cap},${ft} Z`} fill="#26C6DA"><animate attributeName="opacity" values="0.7;1;0.7" dur={`${2+i*0.4}s`} repeatCount="indefinite"/></path>
        <circle cx={fx} cy={ft-m.cap*0.4} r={m.cap*0.18} fill="#E0F7FA"/>
      </g>;})}
    </g>;
  },

  g_fireflies2: () => {                              // Lantern Grove — string of lanterns
    const top=gY-h*0.34*s;
    return <g key={suf}>
      <path d={`M${cx-22*s},${top} Q${cx},${top+8*s} ${cx+22*s},${top}`} fill="none" stroke="#5D4037" strokeWidth={1.6*s}/>
      {[-18,-9,0,9,18].map((ox,i)=>{const t=(ox+22)/44, ly=top+Math.sin(t*Math.PI)*8*s+8*s, c=["#FF7043","#FFD54F","#F48FB1","#4FC3F7","#81C784"][i];
        return <g key={i}>
          <line x1={cx+ox*s} y1={top+Math.sin(t*Math.PI)*8*s} x2={cx+ox*s} y2={ly-6*s} stroke="#5D4037" strokeWidth={0.8*s}/>
          <ellipse cx={cx+ox*s} cy={ly} rx={5*s} ry={6*s} fill={c} opacity="0.92"><animate attributeName="opacity" values="0.6;1;0.6" dur={`${2+i*0.3}s`} repeatCount="indefinite"/></ellipse>
          <rect x={cx+ox*s-3*s} y={ly-7*s} width={6*s} height={2*s} fill="#5D4037"/>
        </g>;})}
      {[-22,22].map((ox,i)=><line key={i} x1={cx+ox*s} y1={gY} x2={cx+ox*s} y2={top} stroke="#6D4C41" strokeWidth={2.4*s} strokeLinecap="round"/>)}
    </g>;
  },

  g_butterfly5: () => {                              // Moon Moths (air, luminous)
    const moth=(bx,by,d)=> <g><animateTransform attributeName="transform" type="translate" values="0,0;2,-6;0,0;-2,-4;0,0" dur={d} repeatCount="indefinite"/>
      <ellipse cx={bx-8*s} cy={by-2*s} rx={9*s} ry={7*s} fill="#E1BEE7" opacity="0.9" transform={`rotate(-18 ${bx-8*s} ${by-2*s})`}/>
      <ellipse cx={bx+8*s} cy={by-2*s} rx={9*s} ry={7*s} fill="#D1C4E9" opacity="0.9" transform={`rotate(18 ${bx+8*s} ${by-2*s})`}/>
      <ellipse cx={bx-6*s} cy={by+6*s} rx={6*s} ry={4*s} fill="#E1BEE7" opacity="0.7"/><ellipse cx={bx+6*s} cy={by+6*s} rx={6*s} ry={4*s} fill="#D1C4E9" opacity="0.7"/>
      <circle cx={bx-8*s} cy={by-2*s} r={2*s} fill="#FFF59D"/><circle cx={bx+8*s} cy={by-2*s} r={2*s} fill="#FFF59D"/>
      <ellipse cx={bx} cy={by} rx={2*s} ry={8*s} fill="#9575CD"/></g>;
    return <g key={suf}>
      {moth(cx-11*s,gY-h*0.3*s,"4s")}
      {moth(cx+11*s,gY-h*0.4*s,"5s")}
    </g>;
  },

  g_treehouse2: () => {                              // Cloud Castle (sky)
    const cy=gY;
    return <g key={suf}>
      <defs><linearGradient id={uid('t')} x1="0" y1="0" x2="0" y2="1"><stop offset="0%" stopColor="#F3E5F5"/><stop offset="100%" stopColor="#CE93D8"/></linearGradient></defs>
      <g><animateTransform attributeName="transform" type="translate" values="0,0;0,-4;0,0" dur="5s" repeatCount="indefinite"/>
        <ellipse cx={cx} cy={cy} rx={28*s} ry={9*s} fill="#fff" opacity="0.95"/>
        <ellipse cx={cx-16*s} cy={cy+1*s} rx={12*s} ry={6*s} fill="#fff" opacity="0.9"/><ellipse cx={cx+16*s} cy={cy+1*s} rx={12*s} ry={6*s} fill="#fff" opacity="0.9"/>
        {[-12,0,12].map((ox,i)=><rect key={i} x={cx+ox*s-5*s} y={cy-h*(0.16+(i===1?0.04:0))*s} width={10*s} height={h*(0.16+(i===1?0.04:0))*s} rx={2*s} fill={`url(#${uid('t')})`}/>)}
        {[-12,0,12].map((ox,i)=><path key={i} d={`M${cx+ox*s-6*s},${cy-h*(0.16+(i===1?0.04:0))*s} L${cx+ox*s},${cy-h*(0.16+(i===1?0.04:0)+0.05)*s} L${cx+ox*s+6*s},${cy-h*(0.16+(i===1?0.04:0))*s} Z`} fill="#AB47BC"/>)}
        <rect x={cx-2.5*s} y={cy-h*0.12*s} width={5*s} height={h*0.12*s} rx={2*s} fill="#7B1FA2" opacity="0.7"/>
        {[-12,12].map((ox,i)=><circle key={i} cx={cx+ox*s} cy={cy-h*0.1*s} r={1.6*s} fill="#FFF59D"/>)}
      </g>
    </g>;
  },

  g_gnome4: () => {                                  // Star Gazer — gnome + telescope
    const gx=cx-4*s, b=gY;
    return <g key={suf}>
      <ellipse cx={gx} cy={b-h*0.1*s} rx={9*s} ry={h*0.09*s} fill="#1976D2"/>
      <circle cx={gx} cy={b-h*0.2*s} r={7*s} fill="#FFCCBC"/>
      <ellipse cx={gx} cy={b-h*0.17*s} rx={6*s} ry={4.5*s} fill="#fff" opacity="0.9"/>
      <ellipse cx={gx} cy={b-h*0.25*s} rx={8.5*s} ry={3*s} fill="#7E57C2"/>
      <path d={`M${gx-6*s},${b-h*0.26*s} L${gx},${b-h*0.4*s} L${gx+6*s},${b-h*0.26*s}`} fill="#7E57C2"/>
      <circle cx={gx} cy={b-h*0.41*s} r={2*s} fill="#FFF59D"/>
      {/* telescope */}
      <line x1={cx+5*s} y1={b-h*0.04*s} x2={cx+14*s} y2={b-h*0.26*s} stroke="#455A64" strokeWidth={3.4*s} strokeLinecap="round"/>
      <circle cx={cx+14*s} cy={b-h*0.26*s} r={3*s} fill="#90A4AE"/>
      <line x1={cx+9*s} y1={b} x2={cx+9*s} y2={b-h*0.12*s} stroke="#5D4037" strokeWidth={2*s}/>
      {[[18,-0.34],[22,-0.28],[15,-0.42]].map(([dx,dy],i)=><path key={i} d={`M${cx+dx*s},${b+h*dy*s} l${1.2*s},${1.2*s} l${1.4*s},${-0.4*s} l${-1*s},${1.2*s} l${0.3*s},${1.5*s} l${-1.3*s},${-0.7*s} l${-1.3*s},${0.7*s} l${0.3*s},${-1.5*s} l${-1*s},${-1.2*s} l${1.4*s},${0.4*s} Z`} fill="#FFF59D"><animate attributeName="opacity" values="0.3;1;0.3" dur={`${2+i*0.5}s`} repeatCount="indefinite"/></path>)}
    </g>;
  },

  g_rainbow3: () => {                                // Aurora (sky)
    const ay=gY;
    const cols=["#69F0AE","#18FFFF","#B388FF","#80D8FF"];
    return <g key={suf}>
      {cols.map((c,i)=><path key={i} d={`M${cx-26*s},${ay} Q${cx-13*s},${ay-(26-i*4)*s} ${cx},${ay-(8-i*1)*s} Q${cx+13*s},${ay+(6-i*2)*s} ${cx+26*s},${ay-(20-i*4)*s}`} fill="none" stroke={c} strokeWidth={(7-i)*s} opacity={0.5-i*0.08} strokeLinecap="round">
        <animate attributeName="opacity" values={`${0.3-i*0.05};${0.6-i*0.08};${0.3-i*0.05}`} dur={`${3+i}s`} repeatCount="indefinite"/></path>)}
      {ring(6,i=><circle key={i} cx={cx+(-22+i*9)*s} cy={ay-(10+ (i%3)*6)*s} r={0.9*s} fill="#fff"><animate attributeName="opacity" values="0.2;1;0.2" dur={`${2+i*0.3}s`} repeatCount="indefinite"/></circle>)}
    </g>;
  },

  /* ════════════════════════════════════════════
     STAGE 6 — FULL BLOOM  (legendary)
  ════════════════════════════════════════════ */
  g_treehouse3: () => {                              // Sky Palace (sky)
    const cy=gY;
    return <g key={suf}>
      <defs><linearGradient id={uid('p')} x1="0" y1="0" x2="0" y2="1"><stop offset="0%" stopColor="#FFF9C4"/><stop offset="100%" stopColor="#FFB300"/></linearGradient></defs>
      <g><animateTransform attributeName="transform" type="translate" values="0,0;0,-5;0,0" dur="6s" repeatCount="indefinite"/>
        <ellipse cx={cx} cy={cy} rx={30*s} ry={9*s} fill="#fff" opacity="0.95"/>
        <ellipse cx={cx-18*s} cy={cy+1*s} rx={12*s} ry={6*s} fill="#fff" opacity="0.9"/><ellipse cx={cx+18*s} cy={cy+1*s} rx={12*s} ry={6*s} fill="#fff" opacity="0.9"/>
        <rect x={cx-20*s} y={cy-h*0.16*s} width={40*s} height={h*0.16*s} rx={2*s} fill={`url(#${uid('p')})`}/>
        {[-16,0,16].map((ox,i)=><g key={i}>
          <rect x={cx+ox*s-5*s} y={cy-h*(0.26+(i===1?0.06:0))*s} width={10*s} height={h*(0.1+(i===1?0.06:0))*s} fill={`url(#${uid('p')})`}/>
          <path d={`M${cx+ox*s-7*s},${cy-h*(0.26+(i===1?0.06:0))*s} L${cx+ox*s},${cy-h*(0.26+(i===1?0.06:0)+0.07)*s} L${cx+ox*s+7*s},${cy-h*(0.26+(i===1?0.06:0))*s} Z`} fill="#FF8F00"/>
          <circle cx={cx+ox*s} cy={cy-h*(0.26+(i===1?0.06:0)+0.08)*s} r={1.6*s} fill="#FFF59D"/>
        </g>)}
        <path d={`M${cx-5*s},${cy-h*0.04*s} Q${cx},${cy-h*0.14*s} ${cx+5*s},${cy-h*0.04*s}`} fill="#FF6F00"/>
        {ring(5,i=><circle key={i} cx={cx+(-20+i*10)*s} cy={cy-h*0.34*s} r={0.9*s} fill="#FFF59D"><animate attributeName="opacity" values="0.2;1;0.2" dur={`${1.6+i*0.3}s`} repeatCount="indefinite"/></circle>)}
      </g>
    </g>;
  },

  g_fountain4: () => {                               // Rainbow Fountain
    const fx=cx;
    const cols=["#EF5350","#FFD54F","#66BB6A","#4FC3F7","#CE93D8"];
    return <g key={suf}>
      <ellipse cx={fx} cy={gY} rx={15*s} ry={5*s} fill="#90A4AE"/>
      <rect x={fx-5*s} y={gY-h*0.16*s} width={10*s} height={h*0.16*s} rx={3*s} fill="#B0BEC5"/>
      <ellipse cx={fx} cy={gY-h*0.16*s} rx={20*s} ry={7*s} fill="#B0BEC5"/>
      <ellipse cx={fx} cy={gY-h*0.16*s} rx={17*s} ry={5*s} fill="#E1F5FE"/>
      <rect x={fx-4*s} y={gY-h*0.32*s} width={8*s} height={h*0.16*s} rx={3*s} fill="#CFD8DC"/>
      <ellipse cx={fx} cy={gY-h*0.32*s} rx={11*s} ry={4*s} fill="#B0BEC5"/>
      {cols.map((c,i)=>{const ox=(-16+i*8); return <path key={i} d={`M${fx},${gY-h*0.34*s} Q${fx+ox*0.5*s},${gY-h*0.5*s} ${fx+ox*s},${gY-h*0.18*s}`} fill="none" stroke={c} strokeWidth={2.4*s} strokeLinecap="round" opacity="0.85"><animate attributeName="opacity" values="0.5;1;0.5" dur={`${1.6+i*0.2}s`} repeatCount="indefinite"/></path>;})}
      {ring(5,i=><circle key={i} cx={fx+(-12+i*6)*s} cy={gY-h*0.46*s} r={1.3*s} fill={cols[i]}><animate attributeName="cy" values={`${gY-h*0.46*s};${gY-h*0.5*s};${gY-h*0.46*s}`} dur="2s" repeatCount="indefinite"/></circle>)}
    </g>;
  },

  g_cherry5: () => {                                 // Golden Tree
    const tH=h*0.36*s, tT=gY-tH;
    return <g key={suf}>
      <defs><radialGradient id={uid('go')} cx="50%" cy="40%" r="60%"><stop offset="0%" stopColor="#FFF59D"/><stop offset="100%" stopColor="#FFB300"/></radialGradient></defs>
      <path d={`M${cx-4*s},${gY} Q${cx+2*s},${gY-tH*0.6} ${cx},${tT}`} stroke="#8D6E00" strokeWidth={6*s} fill="none" strokeLinecap="round"/>
      <circle cx={cx} cy={tT-12*s} r={24*s} fill={`url(#${uid('go')})`}/>
      <circle cx={cx-16*s} cy={tT-2*s} r={14*s} fill="#FFCA28"/><circle cx={cx+16*s} cy={tT-2*s} r={14*s} fill="#FFD54F"/>
      {ring(7,i=>{const a=i*51*Math.PI/180, r=16*s; return <path key={i} d={`M${cx+Math.cos(a)*r},${tT-10*s+Math.sin(a)*r} l${1.6*s},${1.6*s} l${-1.6*s},${1.6*s} l${-1.6*s},${-1.6*s} Z`} fill="#FFFDE7"><animate attributeName="opacity" values="0.3;1;0.3" dur={`${1.8+i*0.2}s`} repeatCount="indefinite"/></path>;})}
    </g>;
  },

  g_windmill3: () => {                               // Star Mill — starlight blades
    const wx=cx, bT=gY-h*0.36*s;
    return <g key={suf}>
      <defs><linearGradient id={uid('sm')} x1="0" y1="0" x2="0" y2="1"><stop offset="0%" stopColor="#B388FF"/><stop offset="100%" stopColor="#7C4DFF"/></linearGradient></defs>
      <path d={`M${wx-6*s},${gY} L${wx-3.5*s},${bT} L${wx+3.5*s},${bT} L${wx+6*s},${gY} Z`} fill={`url(#${uid('sm')})`}/>
      <ellipse cx={wx} cy={bT} rx={7*s} ry={3*s} fill="#5E35B1"/>
      <g><animateTransform attributeName="transform" type="rotate" values={`0 ${wx} ${bT};360 ${wx} ${bT}`} dur="8s" repeatCount="indefinite"/>
        {[0,72,144,216,288].map((a,i)=><g key={i} transform={`rotate(${a} ${wx} ${bT})`}>
          <path d={`M${wx},${bT} L${wx-4*s},${bT-20*s} L${wx},${bT-24*s} L${wx+4*s},${bT-20*s} Z`} fill="#D1C4E9"/>
          <circle cx={wx} cy={bT-20*s} r={1.6*s} fill="#FFF59D"/>
        </g>)}
      </g>
      <circle cx={wx} cy={bT} r={3*s} fill="#FFF59D"/>
      {ring(4,i=><path key={i} d={`M${wx+(-14+i*9)*s},${gY-h*(0.12+(i%2)*0.05)*s} l${1*s},${1*s} l${-1*s},${1*s} l${-1*s},${-1*s} Z`} fill="#B388FF"><animate attributeName="opacity" values="0.2;1;0.2" dur={`${2+i*0.4}s`} repeatCount="indefinite"/></path>)}
    </g>;
  },

  g_rose6: () => {                                   // Legend Rose — one radiant bloom
    const tT=gY-h*0.3*s;
    return <g key={suf}>
      <defs><radialGradient id={uid('lr')} cx="42%" cy="38%" r="62%"><stop offset="0%" stopColor="#FFF176"/><stop offset="55%" stopColor="#FFB300"/><stop offset="100%" stopColor="#FF6F00"/></radialGradient></defs>
      <line x1={cx} y1={gY} x2={cx} y2={tT} stroke="#2E7D32" strokeWidth={3.4*s} strokeLinecap="round"/>
      <ellipse cx={cx-9*s} cy={gY-h*0.14*s} rx={9*s} ry={5*s} fill="#66BB6A" transform={`rotate(-30 ${cx-9*s} ${gY-h*0.14*s})`}/>
      <ellipse cx={cx+9*s} cy={gY-h*0.2*s} rx={9*s} ry={5*s} fill="#43A047" transform={`rotate(30 ${cx+9*s} ${gY-h*0.2*s})`}/>
      {ring(8,i=>{const a=i*45*Math.PI/180; return <ellipse key={i} cx={cx+Math.cos(a)*9*s} cy={tT+Math.sin(a)*9*s} rx={6*s} ry={4*s} fill={`url(#${uid('lr')})`} transform={`rotate(${i*45} ${cx+Math.cos(a)*9*s} ${tT+Math.sin(a)*9*s})`}/>;})}
      <circle cx={cx} cy={tT} r={8*s} fill={`url(#${uid('lr')})`}/>
      <circle cx={cx} cy={tT} r={3.4*s} fill="#FFFDE7"/>
      {ring(6,i=>{const a=i*60*Math.PI/180; return <path key={i} d={`M${cx+Math.cos(a)*16*s},${tT+Math.sin(a)*16*s} l${1.4*s},${1.4*s} l${-1.4*s},${1.4*s} l${-1.4*s},${-1.4*s} Z`} fill="#FFF59D"><animate attributeName="opacity" values="0.2;1;0.2" dur={`${1.8+i*0.2}s`} repeatCount="indefinite"/></path>;})}
    </g>;
  },

  g_fireflies3: () => {                              // Galaxy Jar
    const jx=cx, jy=gY-16*s;                          // jar bottom rests on the ground line
    return <g key={suf}>
      <ellipse cx={jx} cy={gY} rx={12*s} ry={3*s} fill="#000" opacity="0.12"/>
      <defs><radialGradient id={uid('gx')} cx="50%" cy="45%" r="55%"><stop offset="0%" stopColor="#7C4DFF"/><stop offset="60%" stopColor="#311B92"/><stop offset="100%" stopColor="#1A0E3D"/></radialGradient></defs>
      <ellipse cx={jx} cy={jy} rx={13*s} ry={16*s} fill={`url(#${uid('gx')})`} stroke="#B39DDB" strokeWidth={1.6*s}/>
      <path d={`M${jx-11*s},${jy+2*s} Q${jx},${jy-4*s} ${jx+11*s},${jy+6*s}`} fill="none" stroke="#B388FF" strokeWidth={2.4*s} opacity="0.6"/>
      {ring(9,i=>{const a=i*40*Math.PI/180, r=(4+(i%3)*3)*s; return <circle key={i} cx={jx+Math.cos(a)*r} cy={jy+Math.sin(a)*r*1.1} r={(0.8+(i%2)*0.6)*s} fill="#fff"><animate attributeName="opacity" values="0.2;1;0.2" dur={`${1.6+i*0.2}s`} repeatCount="indefinite"/></circle>;})}
      <rect x={jx-5*s} y={jy-17*s} width={10*s} height={h*0.04*s} rx={2*s} fill="#9575CD"/>
      <rect x={jx-6*s} y={jy-h*0.04*s-18*s} width={12*s} height={4*s} rx={2*s} fill="#5E35B1"/>
    </g>;
  },

  g_butterfly6: () => {                              // Phoenix Bird (sky)
    const bx=cx, by=gY-h*0.08*s;
    return <g key={suf}>
      <defs><linearGradient id={uid('ph')} x1="0" y1="0" x2="0" y2="1"><stop offset="0%" stopColor="#FFD54F"/><stop offset="55%" stopColor="#FF7043"/><stop offset="100%" stopColor="#E53935"/></linearGradient></defs>
      <g><animateTransform attributeName="transform" type="translate" values="0,0;0,-6;0,0" dur="3.4s" repeatCount="indefinite"/>
        {/* tail flames */}
        {[-6,0,6].map((ox,i)=><path key={i} d={`M${bx+ox*s},${by+4*s} Q${bx+ox*s-3*s},${by+18*s} ${bx+ox*s},${by+26*s} Q${bx+ox*s+3*s},${by+18*s} ${bx+ox*s},${by+4*s} Z`} fill={`url(#${uid('ph')})`} opacity={0.7+i*0.1}/>)}
        {/* wings */}
        <path d={`M${bx},${by} Q${bx-22*s},${by-18*s} ${bx-30*s},${by-6*s} Q${bx-20*s},${by-2*s} ${bx},${by+2*s} Z`} fill={`url(#${uid('ph')})`}/>
        <path d={`M${bx},${by} Q${bx+22*s},${by-18*s} ${bx+30*s},${by-6*s} Q${bx+20*s},${by-2*s} ${bx},${by+2*s} Z`} fill={`url(#${uid('ph')})`}/>
        {/* body + head */}
        <ellipse cx={bx} cy={by} rx={5*s} ry={9*s} fill="#FF8F00"/>
        <circle cx={bx} cy={by-10*s} r={4.5*s} fill="#FFB300"/>
        <path d={`M${bx},${by-16*s} L${bx-3*s},${by-22*s} L${bx},${by-20*s} L${bx+3*s},${by-22*s} Z`} fill="#FFD54F"/>
        <path d={`M${bx+4*s},${by-10*s} l${4*s},${1*s} l${-4*s},${2*s} Z`} fill="#FF6F00"/>
        <circle cx={bx+1.5*s} cy={by-11*s} r={1*s} fill="#4E342E"/>
      </g>
    </g>;
  },

  g_rainbow4: () => {                                // Shooting Stars (sky)
    return <g key={suf}>
      {[{x:-22,y:-2,len:14,d:"2.4s"},{x:6,y:-14,len:18,d:"3s"},{x:18,y:4,len:12,d:"2.8s"}].map((st,i)=><g key={i}>
        <line x1={cx+st.x*s} y1={gY+st.y*s} x2={cx+(st.x-st.len)*s} y2={gY+(st.y+st.len*0.5)*s} stroke="#FFF59D" strokeWidth={2*s} strokeLinecap="round" opacity="0.7">
          <animate attributeName="opacity" values="0;0.9;0" dur={st.d} repeatCount="indefinite"/></line>
        <path d={`M${cx+st.x*s},${gY+st.y*s} l${1.4*s},${1.4*s} l${1.6*s},${-0.4*s} l${-1.2*s},${1.4*s} l${0.4*s},${1.6*s} l${-1.6*s},${-0.8*s} l${-1.6*s},${0.8*s} l${0.4*s},${-1.6*s} l${-1.2*s},${-1.4*s} l${1.6*s},${0.4*s} Z`} fill="#FFEB3B">
          <animate attributeName="opacity" values="0.3;1;0.3" dur={st.d} repeatCount="indefinite"/></path>
      </g>)}
    </g>;
  },

  g_gnome5: () => {                                  // Dragon Friend
    const dx=cx, b=gY;
    return <g key={suf}>
      <ellipse cx={dx} cy={b-2*s} rx={18*s} ry={5*s} fill="#1B5E20" opacity="0.25"/>
      {/* tail */}
      <path d={`M${dx+10*s},${b-h*0.1*s} Q${dx+22*s},${b-h*0.05*s} ${dx+24*s},${b-h*0.18*s}`} stroke="#66BB6A" strokeWidth={4*s} fill="none" strokeLinecap="round"/>
      {/* body */}
      <ellipse cx={dx} cy={b-h*0.12*s} rx={12*s} ry={h*0.11*s} fill="#43A047"/>
      <ellipse cx={dx} cy={b-h*0.1*s} rx={7*s} ry={h*0.07*s} fill="#A5D6A7"/>
      {/* wings */}
      <path d={`M${dx-2*s},${b-h*0.2*s} Q${dx-16*s},${b-h*0.34*s} ${dx-18*s},${b-h*0.18*s} Q${dx-10*s},${b-h*0.18*s} ${dx-2*s},${b-h*0.16*s} Z`} fill="#81C784"/>
      {/* neck + head */}
      <path d={`M${dx-6*s},${b-h*0.2*s} Q${dx-12*s},${b-h*0.32*s} ${dx-10*s},${b-h*0.36*s}`} stroke="#43A047" strokeWidth={6*s} fill="none" strokeLinecap="round"/>
      <ellipse cx={dx-10*s} cy={b-h*0.38*s} rx={7*s} ry={6*s} fill="#66BB6A"/>
      <circle cx={dx-13*s} cy={b-h*0.4*s} r={1.6*s} fill="#1a1a1a"/>
      {/* horns + spikes */}
      <path d={`M${dx-9*s},${b-h*0.43*s} l${-1*s},${-4*s} l${2*s},${3*s} Z`} fill="#2E7D32"/>
      {ring(4,i=><path key={i} d={`M${dx-4*s+i*5*s},${b-h*0.23*s} l${-1.4*s},${-4*s} l${2.8*s},0 Z`} fill="#2E7D32"/>)}
      {/* little flame */}
      <path d={`M${dx-16*s},${b-h*0.38*s} q${-4*s},${-1*s} ${-6*s},${1*s} q${3*s},${1*s} ${6*s},${0}`} fill="#FF7043"><animate attributeName="opacity" values="0.4;1;0.4" dur="1.4s" repeatCount="indefinite"/></path>
    </g>;
  },

  g_mushroom5: () => {                               // World Tree — enormous
    const tH=h*0.42*s, tT=gY-tH;
    return <g key={suf}>
      <defs><radialGradient id={uid('wt')} cx="50%" cy="42%" r="58%"><stop offset="0%" stopColor="#81C784"/><stop offset="100%" stopColor="#2E7D32"/></radialGradient></defs>
      {/* roots */}
      {[-10,-4,4,10].map((ox,i)=><path key={i} d={`M${cx},${gY-tH*0.1} Q${cx+ox*1.5*s},${gY-4*s} ${cx+ox*2.4*s},${gY}`} stroke="#5D4037" strokeWidth={3*s} fill="none" strokeLinecap="round"/>)}
      {/* trunk */}
      <path d={`M${cx-8*s},${gY} Q${cx-5*s},${gY-tH*0.6} ${cx-4*s},${tT} L${cx+4*s},${tT} Q${cx+5*s},${gY-tH*0.6} ${cx+8*s},${gY} Z`} fill="#6D4C41"/>
      <line x1={cx-2*s} y1={gY-tH*0.3} x2={cx-2*s} y2={tT} stroke="#4E342E" strokeWidth={1.4*s} opacity="0.6"/>
      {/* canopy */}
      <circle cx={cx} cy={tT-14*s} r={30*s} fill={`url(#${uid('wt')})`}/>
      <circle cx={cx-22*s} cy={tT-2*s} r={17*s} fill="#388E3C"/><circle cx={cx+22*s} cy={tT-2*s} r={17*s} fill="#43A047"/>
      <circle cx={cx-10*s} cy={tT-26*s} r={14*s} fill="#66BB6A"/><circle cx={cx+12*s} cy={tT-24*s} r={13*s} fill="#4CAF50"/>
      {ring(6,i=>{const a=i*60*Math.PI/180, r=20*s; return <circle key={i} cx={cx+Math.cos(a)*r} cy={tT-12*s+Math.sin(a)*r} r={2*s} fill="#FFF59D"><animate attributeName="opacity" values="0.3;1;0.3" dur={`${2.4+i*0.3}s`} repeatCount="indefinite"/></circle>;})}
    </g>;
  },

  };

  const renderer = items[id];
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

  const groundY = h * 0.56;

  /* Grass blades — fixed density, fixed colour. Kept short so they
     carpet the ground without towering over the planted items. */
  const blades = Array.from({length:34}, (_,i) => ({
    x: (i/33) * w,
    stemH: h*(0.028 + (i%4)*0.011),
    width: 2.5 + (i%3)*1,
    sway: i%2===0 ? "gSwayL" : "gSwayR",
    delay: `${(i*0.14%2.5).toFixed(2)}s`,
    color: grass[i%grass.length],
    opacity: 0.5 + (i%4)*0.1,
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

        {/* ── Purchased garden items — placed to FRAME the mascot ──
             The mascot stands centred in front of the scene, so every item is
             positioned in the visible left/right side zones (never the centre
             column) and on the ground line / sky band that stays on-screen on
             phones. Nothing is hidden behind the mascot or clipped off-screen. */}
        {gardenItems.length > 0 && (() => {
          const SCALES = { xl:1.0, lg:0.85, md:0.72, sm:0.62 };
          const sizeOrder = { xl:0, lg:1, md:2, sm:3 };
          const metaOf = (id) => GARDEN_RENDER_META[id] || { size:"md", layer:"ground" };

          // Side zones that frame the centred mascot — the centre (~0.30–0.70) stays clear.
          // t=0 is the OUTER edge, t=1 borders the mascot, so the biggest items sit outermost.
          const LZONE = [0.07, 0.30], RZONE = [0.70, 0.93];
          const sideX = (i, n) => {
            const onLeft = i % 2 === 0;
            const k = Math.floor(i / 2);
            const count = onLeft ? Math.ceil(n / 2) : Math.floor(n / 2);
            const t = count > 1 ? k / (count - 1) : 0.5;
            const [a, b] = onLeft ? LZONE : RZONE;
            return onLeft ? a + t * (b - a) : b - t * (b - a);
          };
          const bySize = (arr) => [...arr].sort((a,b) => sizeOrder[metaOf(a).size] - sizeOrder[metaOf(b).size]);

          // Give every planted item its OWN column (biggest outermost), so no two items
          // share an x and nothing hides behind another. Layer decides the height band.
          const ordered = bySize(gardenItems);
          const xOf = {};
          ordered.forEach((id, gi) => { xOf[id] = w * sideX(gi, ordered.length); });
          const baseYOf = (id) => { const l = metaOf(id).layer;
            return l === "sky" ? h*0.33 : l === "air" ? groundY - h*0.14 : groundY; };
          const scaleOf = (id) => { const l = metaOf(id).layer; const sc = SCALES[metaOf(id).size];
            return l === "sky" ? sc*0.8 : sc; };

          // Draw far→near (sky behind ground behind air) for correct depth.
          const sky = [], ground = [], air = [];
          ordered.forEach(id => { const l = metaOf(id).layer; (l==="sky"?sky:l==="air"?air:ground).push(id); });
          return [...sky, ...ground, ...air].map((id, di) => (
            <GardenItemSVG key={`it_${id}`} id={id} cx={xOf[id]} groundY={baseYOf(id)}
              scale={scaleOf(id)} w={w} h={h} idx={di}/>
          ));
        })()}

        {/* Front grass fringe — always on top, kept low */}
        {Array.from({length:20},(_,i)=>({x:(i/19)*w, bh:h*0.03+Math.sin(i*1.3)*h*0.014})).map((b,i)=>(
          <g key={i} style={{animation:`${i%2===0?"gSwayL":"gSwayR"} ${1.8+i*0.1}s ease-in-out infinite`,
            animationDelay:`${(i*0.13%2).toFixed(2)}s`, transformOrigin:`${b.x}px ${groundY+h*0.12}px`}}>
            <path d={`M${b.x},${groundY+h*0.14}
              C${b.x-3},${groundY+h*0.14-b.bh*0.55}
               ${b.x+2},${groundY+h*0.14-b.bh*0.82}
               ${b.x+2},${groundY+h*0.14-b.bh}`}
              stroke={grass[0]} strokeWidth="3" fill="none" strokeLinecap="round" opacity="0.8"/>
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
