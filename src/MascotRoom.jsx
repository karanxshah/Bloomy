import { useState, useEffect, useRef, useCallback } from "react";
import { GrowthMascot, GardenScene, GardenItemSVG, calcGrowthScore, getStage, STAGES } from "./MascotGrowth";

/* ── Activity-based expression tier ─────────────────────────────────
   Driven by days with ANY activity in the last 7 days.
   Uses moodLog dates (logged per activity day) as the primary signal.
   Falls back to last_activity_date for same-day freshness.
   0 = thriving (5-7 days) → happy
   1 = good     (3-4 days) → content
   2 = low      (1-2 days) → tired
   3 = missing  (0 days)   → sad                                     */
export const getActivityTier = (moodLog, activeChild) => {
  const todayStr = new Date().toISOString().split("T")[0];
  const sevenAgo = new Date();
  sevenAgo.setDate(sevenAgo.getDate() - 7);

  // Count unique active days from mood log
  const activeDaysSet = new Set(
    (moodLog||[]).filter(e => new Date(e.date) >= sevenAgo).map(e => e.date)
  );

  // If child was active today (via journal/breathe/gratitude) but hasn't logged mood,
  // last_activity_date ensures today still counts
  if (activeChild?.last_activity_date) {
    const lad = activeChild.last_activity_date;
    if (new Date(lad) >= sevenAgo) activeDaysSet.add(lad);
  }

  const activeDays = activeDaysSet.size;
  if (activeDays >= 5) return 0;
  if (activeDays >= 3) return 1;
  if (activeDays >= 1) return 2;
  return 3;
};

const C = {
  purple:"#7C4DFF", pink:"#F06292", yellow:"#FFD54F",
  mint:"#4DB6AC", sky:"#4FC3F7", coral:"#FF7043",
  bg:"#F7F4FF", text:"#2D2040", muted:"#9B8DB5", border:"#EEE9FF",
};
const F = { h:"'Baloo 2', cursive", b:"'Poppins', sans-serif" };

const FontLoader = () => (
  <style>{`
    @import url('https://fonts.googleapis.com/css2?family=Baloo+2:wght@700;800;900&family=Poppins:wght@400;500;600;700&display=swap');
    @keyframes floatMascot { 0%,100%{transform:translateY(0) rotate(-1deg)} 50%{transform:translateY(-18px) rotate(1deg)} }
    @keyframes bounce      { 0%{transform:scale(1) translateY(0)} 20%{transform:scale(1.18) translateY(-28px)} 50%{transform:scale(0.92) translateY(4px)} 70%{transform:scale(1.06) translateY(-8px)} 100%{transform:scale(1) translateY(0)} }
    @keyframes wiggle      { 0%,100%{transform:rotate(0deg) scale(1)} 20%{transform:rotate(-16deg) scale(1.05)} 40%{transform:rotate(16deg) scale(1.05)} 60%{transform:rotate(-10deg)} 80%{transform:rotate(8deg)} }
    @keyframes spin        { 0%{transform:rotate(0deg) scale(1)} 40%{transform:rotate(200deg) scale(1.15)} 80%{transform:rotate(345deg) scale(0.95)} 100%{transform:rotate(360deg) scale(1)} }
    @keyframes cheer       { 0%{transform:translateY(0) scale(1)} 25%{transform:translateY(-30px) scale(1.2)} 50%{transform:translateY(-10px) scale(1.1)} 75%{transform:translateY(-22px) scale(1.15)} 100%{transform:translateY(0) scale(1)} }
    @keyframes dance       { 0%,100%{transform:rotate(-4deg) scale(1)} 25%{transform:rotate(6deg) scale(1.08) translateY(-12px)} 50%{transform:rotate(-6deg) scale(1.05) translateY(-6px)} 75%{transform:rotate(5deg) scale(1.1) translateY(-18px)} }
    @keyframes heartPop    { 0%{transform:translateY(0) scale(0)} 30%{transform:translateY(-20px) scale(1.3)} 100%{transform:translateY(-80px) scale(0);opacity:0} }
    @keyframes superBounce { 0%{transform:scale(1) translateY(0)} 15%{transform:scale(1.25) translateY(-42px)} 35%{transform:scale(0.88) translateY(6px)} 55%{transform:scale(1.12) translateY(-18px)} 75%{transform:scale(0.95) translateY(2px)} 100%{transform:scale(1) translateY(0)} }
    @keyframes shimmy      { 0%,100%{transform:translateX(0) rotate(0deg)} 20%{transform:translateX(-14px) rotate(-8deg)} 40%{transform:translateX(14px) rotate(8deg)} 60%{transform:translateX(-10px) rotate(-5deg)} 80%{transform:translateX(10px) rotate(5deg)} }
    @keyframes sparkleIn   { 0%{opacity:0;transform:scale(0) rotate(0deg)} 60%{opacity:1;transform:scale(1.3) rotate(180deg)} 100%{opacity:0;transform:scale(0) rotate(360deg)} }
    @keyframes heartFloat  { 0%{opacity:1;transform:scale(0.5) translateY(0)} 50%{opacity:0.9;transform:scale(1.1) translateY(-40px)} 100%{opacity:0;transform:scale(0.7) translateY(-90px)} }
    @keyframes starBurst   { 0%{opacity:0;transform:scale(0)} 40%{opacity:1;transform:scale(1.5)} 100%{opacity:0;transform:scale(0.2) translateY(-60px)} }
    @keyframes fadeInUp    { from{opacity:0;transform:translateY(16px)} to{opacity:1;transform:translateY(0)} }
    @keyframes scaleIn     { from{opacity:0;transform:scale(0.9)} to{opacity:1;transform:scale(1)} }
    @keyframes bubblePop   { 0%{opacity:0;transform:scale(0.7) translateY(8px)} 70%{transform:scale(1.05)} 100%{opacity:1;transform:scale(1) translateY(0)} }
    @keyframes pulse       { 0%,100%{opacity:1} 50%{opacity:0.4} }
    @keyframes droop       { 0%,100%{transform:translateY(0)} 50%{transform:translateY(8px)} }
    @keyframes groundShadow { 0%,100%{transform:scaleX(1);opacity:0.18} 50%{transform:scaleX(0.7);opacity:0.08} }
    @keyframes shopGlow    { 0%,100%{box-shadow:0 8px 28px rgba(124,77,255,0.45),0 2px 8px rgba(124,77,255,0.2)} 50%{box-shadow:0 12px 36px rgba(124,77,255,0.65),0 4px 16px rgba(240,98,146,0.3)} }
    @keyframes canSlideIn  { 0%{transform:translateX(120%);opacity:0} 18%{opacity:1;transform:translateX(0%)} 75%{transform:translateX(0%)} 100%{transform:translateX(120%);opacity:0} }
    @keyframes canTilt     { 0%,18%{transform:rotate(0deg)} 32%,72%{transform:rotate(-48deg)} 86%,100%{transform:rotate(0deg)} }
    @keyframes dropFall    { 0%{opacity:0;transform:translateY(-4px)} 15%{opacity:1} 85%{opacity:0.7} 100%{opacity:0;transform:translateY(0)} }
    @keyframes splashRing  { 0%{r:4;opacity:0.9} 100%{r:18;opacity:0} }
    @keyframes grassGlow   { 0%,100%{opacity:0} 40%,70%{opacity:1} }
  `}</style>
);

/* ── Helpers ── */
const todayStr = () => new Date().toISOString().split("T")[0];
const randomFrom = (arr) => arr[Math.floor(Math.random() * arr.length)];
const daysSince = (dateStr) => {
  if (!dateStr) return 999;
  return Math.floor((new Date(todayStr()) - new Date(dateStr)) / (1000*60*60*24));
};
const getMascotState = (lastMoodDate, lastMood) => {
  const days = daysSince(lastMoodDate);
  if (days === 0) {
    if (lastMood==="Sad")     return "sad";
    if (lastMood==="Worried") return "worried";
    if (lastMood==="Angry")   return "angry";
    return "happy";
  }
  if (days <= 1) return "away";
  return "droopy";
};
/* ── Personalities ── */
const PERSONALITIES = {
  fox:   { trait:"Adventurous and brave",  loves:"Exploring new feelings",  color:"#FF7043" },
  bunny: { trait:"Kind and gentle",        loves:"Making others smile",      color:"#EC407A" },
  bear:  { trait:"Calm and dependable",    loves:"Cosy breathing moments",   color:"#8D6E63" },
  owl:   { trait:"Wise and thoughtful",    loves:"Journaling deep thoughts", color:"#7E57C2" },
  cat:   { trait:"Creative and curious",   loves:"Discovering new moods",    color:"#26A69A" },
  dog:   { trait:"Loyal and enthusiastic", loves:"Celebrating every win",    color:"#FFA726" },
};

/* ── Speech pools ── */
const SPEECH = {
  happy:   ["You are doing so amazing!","I love spending time with you!","You make me so happy!","You are braver than you know.","Every day with you is special.","You have the biggest heart!","I am so proud of everything you do.","You light up the whole room!","Being your buddy is my favourite thing.","You can do anything you set your mind to!"],
  sad:     ["I am right here with you.","It is okay to feel sad sometimes.","I care about you so much.","You are never alone — I am always here.","Even on hard days, you are wonderful.","Let us take a deep breath together.","Your feelings matter to me.","I will always be your buddy, no matter what."],
  worried: ["You are safe. I am right here.","Let us breathe together — in and out.","Worries are like clouds — they pass.","You are stronger than you feel right now.","I believe in you completely.","One small step at a time."],
  angry:   ["It is okay to feel angry.","Let us take a big breath together.","Your feelings are always valid.","I am here, no matter how you feel.","Even when things are hard, I am with you."],
  away:    ["I missed you so much!","You are back! I am so happy!","I was thinking about you!","Welcome back — I saved your spot!","Every time you come back makes me so happy!"],
  general: ["Tap me again! I like it!","Did you know you are amazing?","You are growing so much!","I am so lucky to be your buddy.","Keep going — you are doing great!","Every check-in makes us both grow!","You are my favourite person!"],
  funny3:  "Okay okay, you found my tickle spot!",
  funny6:  "Stop it! You are making me laugh too much!",
};

/* ══════════════════════════════════════════════
   FULL BODY MASCOT ILLUSTRATIONS
══════════════════════════════════════════════ */
export const FullBodyMascot = ({ id, size = 220, stage = 0, energyTier = 0 }) => {
  const VW = 200, VH = 256;
  const w = size, h = size * (VH / VW);

  const SPECS = {
    fox:   { body:"#FF8A5E", line:"#E0673D", belly:"#FFE0CC", inner:"#F2785080", nose:"#4A3328", iris:"#2C2C40", foot:"#E0673D" },
    bunny: { body:"#F7C5D6", line:"#E193AC", belly:"#FFEAF1", inner:"#F0A8C080", nose:"#D26A88", iris:"#2C2C40", foot:"#E193AC" },
    bear:  { body:"#B68A66", line:"#8F6948", belly:"#E3D0B8", inner:"#C9AC8C80", nose:"#4A3328", iris:"#2C2C40", foot:"#8F6948" },
    owl:   { body:"#9476CC", line:"#6F52A6", belly:"#D6C9EC", inner:"#B7A4DE80", nose:"#FF9E3D", iris:"#2E2150", foot:"#FF9E3D" },
    cat:   { body:"#56C7BB", line:"#37A498", belly:"#C9ECE7", inner:"#8FD9D080", nose:"#F2887E", iris:"#2C2C40", foot:"#37A498" },
    dog:   { body:"#FFC069", line:"#E09B41", belly:"#FFE8C7", inner:"#F5CB8E80", nose:"#4A3328", iris:"#2C2C40", foot:"#E09B41" },
  };
  const P = SPECS[id] || SPECS.fox;
  const SW = 3;

  /* ── Eyes ── */
  const Eyes = ({ lx, rx, ey, sr, behind, iris, irisR, owl }) => {
    const pcol = iris || P.iris;
    const pr   = iris ? irisR : sr * 0.52;
    const hl   = pr * 0.4 + 2;
    const browW = owl ? sr * 0.66 : sr * 1.05;
    const browTop = owl ? ey - sr + 2 : ey - sr - 3;
    const clipL = `fbl-${id}-l`, clipR = `fbl-${id}-r`;

    if (energyTier === 0) {
      return (
        <g>
          <circle cx={lx} cy={ey} r={sr} fill="#fff" stroke={P.line} strokeWidth={SW*0.5}/>
          <circle cx={rx} cy={ey} r={sr} fill="#fff" stroke={P.line} strokeWidth={SW*0.5}/>
          <circle cx={lx} cy={ey + sr*0.12} r={pr} fill={pcol}/>
          <circle cx={rx} cy={ey + sr*0.12} r={pr} fill={pcol}/>
          <circle cx={lx + pr*0.42} cy={ey - pr*0.5} r={hl} fill="#fff"/>
          <circle cx={rx + pr*0.42} cy={ey - pr*0.5} r={hl} fill="#fff"/>
        </g>
      );
    }
    if (energyTier === 1) {
      return (
        <g>
          <circle cx={lx} cy={ey} r={sr} fill="#fff" stroke={P.line} strokeWidth={SW*0.5}/>
          <circle cx={rx} cy={ey} r={sr} fill="#fff" stroke={P.line} strokeWidth={SW*0.5}/>
          <circle cx={lx} cy={ey + sr*0.12} r={pr} fill={pcol}/>
          <circle cx={rx} cy={ey + sr*0.12} r={pr} fill={pcol}/>
          <circle cx={lx + pr*0.42} cy={ey - pr*0.5} r={hl*0.7} fill="#fff"/>
          <circle cx={rx + pr*0.42} cy={ey - pr*0.5} r={hl*0.7} fill="#fff"/>
        </g>
      );
    }
    if (energyTier === 2) {
      const lidMidY = ey - sr*0.22;
      const lidSideY = ey + sr*0.2;
      const cw = sr*0.92;
      return (
        <g>
          <defs>
            <clipPath id={clipL}><circle cx={lx} cy={ey} r={sr}/></clipPath>
            <clipPath id={clipR}><circle cx={rx} cy={ey} r={sr}/></clipPath>
          </defs>
          <circle cx={lx} cy={ey} r={sr} fill="#fff" stroke={P.line} strokeWidth={SW*0.5}/>
          <circle cx={rx} cy={ey} r={sr} fill="#fff" stroke={P.line} strokeWidth={SW*0.5}/>
          <circle cx={lx} cy={ey + sr*0.5} r={pr*0.82} fill={pcol}/>
          <circle cx={rx} cy={ey + sr*0.5} r={pr*0.82} fill={pcol}/>
          <g clipPath={`url(#${clipL})`}>
            <path d={`M ${lx-sr-2} ${lidSideY} Q ${lx} ${lidMidY} ${lx+sr+2} ${lidSideY} L ${lx+sr+2} ${ey-sr-3} L ${lx-sr-2} ${ey-sr-3} Z`} fill={behind}/>
          </g>
          <g clipPath={`url(#${clipR})`}>
            <path d={`M ${rx-sr-2} ${lidSideY} Q ${rx} ${lidMidY} ${rx+sr+2} ${lidSideY} L ${rx+sr+2} ${ey-sr-3} L ${rx-sr-2} ${ey-sr-3} Z`} fill={behind}/>
          </g>
          <path d={`M ${lx-cw} ${lidSideY-1} Q ${lx} ${lidMidY-1} ${lx+cw} ${lidSideY-1}`} stroke={P.iris} strokeWidth="2.2" fill="none" strokeLinecap="round"/>
          <path d={`M ${rx-cw} ${lidSideY-1} Q ${rx} ${lidMidY-1} ${rx+cw} ${lidSideY-1}`} stroke={P.iris} strokeWidth="2.2" fill="none" strokeLinecap="round"/>
        </g>
      );
    }
    const esr = owl ? sr*0.66 : sr*0.8, epr = owl ? pr*0.72 : pr*0.9;
    return (
      <g>
        <circle cx={lx} cy={ey+2} r={esr} fill="#fff" stroke={P.line} strokeWidth={SW*0.5}/>
        <circle cx={rx} cy={ey+2} r={esr} fill="#fff" stroke={P.line} strokeWidth={SW*0.5}/>
        <circle cx={lx} cy={ey+2+esr*0.5} r={epr} fill={pcol}/>
        <circle cx={rx} cy={ey+2+esr*0.5} r={epr} fill={pcol}/>
        <circle cx={lx+epr*0.35} cy={ey+2+esr*0.5-epr*0.4} r={epr*0.3} fill="#fff"/>
        <circle cx={rx+epr*0.35} cy={ey+2+esr*0.5-epr*0.4} r={epr*0.3} fill="#fff"/>
        <path d={`M ${lx-browW} ${browTop} Q ${lx} ${browTop-5} ${lx+browW} ${browTop-7}`} stroke={P.iris} strokeWidth="2.6" fill="none" strokeLinecap="round"/>
        <path d={`M ${rx+browW} ${browTop} Q ${rx} ${browTop-5} ${rx-browW} ${browTop-7}`} stroke={P.iris} strokeWidth="2.6" fill="none" strokeLinecap="round"/>
        <path d={`M ${rx+esr*0.5} ${ey+esr+2} q -3 5 0 8 q 3 -3 0 -8 Z`} fill="#5BC8F5" stroke="#3BA3D8" strokeWidth="0.8"/>
      </g>
    );
  };

  /* ── Mouth ── */
  const Mouth = ({ cx, cy }) => {
    const r = 13;
    if (energyTier === 0)      return <path d={`M ${cx-r} ${cy-3} Q ${cx} ${cy+11} ${cx+r} ${cy-3}`} stroke={P.iris} strokeWidth="2.8" fill="none" strokeLinecap="round"/>;
    else if (energyTier === 1) return <path d={`M ${cx-r} ${cy-2} Q ${cx} ${cy+6} ${cx+r} ${cy-2}`} stroke={P.iris} strokeWidth="2.6" fill="none" strokeLinecap="round"/>;
    else if (energyTier === 2) return <path d={`M ${cx-r*0.8} ${cy+1} Q ${cx} ${cy-3} ${cx+r*0.8} ${cy+1}`} stroke={P.iris} strokeWidth="2.6" fill="none" strokeLinecap="round"/>;
    else                       return <path d={`M ${cx-r} ${cy+3} Q ${cx} ${cy-10} ${cx+r} ${cy+3}`} stroke={P.iris} strokeWidth="2.8" fill="none" strokeLinecap="round"/>;
  };

  const Cheeks = ({ lx, rx, ly }) => energyTier <= 1 ? (
    <g opacity="0.5">
      <ellipse cx={lx} cy={ly} rx="9" ry="6" fill="#FF8FA0"/>
      <ellipse cx={rx} cy={ly} rx="9" ry="6" fill="#FF8FA0"/>
    </g>
  ) : null;

  const Limbs = () => (
    <g>
      <ellipse cx="46" cy="178" rx="15" ry="26" fill={P.body} stroke={P.line} strokeWidth={SW} transform="rotate(-16 46 178)"/>
      <ellipse cx="154" cy="178" rx="15" ry="26" fill={P.body} stroke={P.line} strokeWidth={SW} transform="rotate(16 154 178)"/>
      <ellipse cx="74" cy="240" rx="22" ry="13" fill={P.foot} stroke={P.line} strokeWidth={SW}/>
      <ellipse cx="126" cy="240" rx="22" ry="13" fill={P.foot} stroke={P.line} strokeWidth={SW}/>
    </g>
  );

  const Body = () => (
    <g>
      <ellipse cx="100" cy="196" rx="56" ry="52" fill={P.body} stroke={P.line} strokeWidth={SW}/>
      <ellipse cx="100" cy="202" rx="36" ry="40" fill={P.belly}/>
    </g>
  );

  const Scarf = () => stage >= 1 ? (
    <g>
      <path d="M 60 150 Q 100 168 140 150 L 140 162 Q 100 180 60 162 Z" fill="#5BB8E8" stroke="#3D97C9" strokeWidth={SW}/>
      <path d="M 128 158 L 142 196 L 120 196 L 116 160 Z" fill="#4AA6D6" stroke="#3D97C9" strokeWidth={SW}/>
    </g>
  ) : null;

  const FlowerCrown = () => (stage === 2 || stage === 3) ? (
    <g>
      {[-44,-22,0,22,44].map((dx,i)=>(
        <g key={i}>
          {[0,72,144,216,288].map(a=>(
            <ellipse key={a} cx={100+dx} cy={20} rx="6" ry="3.5"
              fill={["#F7A8C4","#FFD66B","#A8E0A0","#F7A8C4","#FFD66B"][i]}
              transform={`rotate(${a} ${100+dx} 20)`}/>
          ))}
          <circle cx={100+dx} cy={20} r="3.5" fill="#FFF3C4"/>
        </g>
      ))}
    </g>
  ) : null;

  const Glow = () => stage === 3 ? (
    <g opacity="0.5">
      <circle cx="100" cy="120" r="96" fill="none" stroke="#FFD66B" strokeWidth="3"/>
      <circle cx="100" cy="120" r="88" fill="none" stroke="#FFC23D" strokeWidth="2"/>
    </g>
  ) : null;

  const bodies = {
    fox: (
      <svg width={w} height={h} viewBox={`0 0 ${VW} ${VH}`}>
        <Glow/>
        <path d="M 150 210 Q 196 196 184 150 Q 176 120 150 128 Q 168 160 150 210 Z" fill={P.body} stroke={P.line} strokeWidth={SW}/>
        <Limbs/>
        <Body/>
        <path d="M 56 70 L 40 18 L 86 52 Z" fill={P.body} stroke={P.line} strokeWidth={SW} strokeLinejoin="round"/>
        <path d="M 144 70 L 160 18 L 114 52 Z" fill={P.body} stroke={P.line} strokeWidth={SW} strokeLinejoin="round"/>
        <path d="M 60 60 L 50 30 L 78 52 Z" fill={P.inner}/>
        <path d="M 140 60 L 150 30 L 122 52 Z" fill={P.inner}/>
        <ellipse cx="100" cy="90" rx="60" ry="55" fill={P.body} stroke={P.line} strokeWidth={SW}/>
        <ellipse cx="100" cy="78" rx="38" ry="26" fill={P.belly} opacity="0.45"/>
        <Cheeks lx={64} rx={136} ly={104}/>
        <Eyes lx={78} rx={122} ey={84} sr={15} behind={P.body}/>
        <ellipse cx="100" cy="108" rx="8" ry="6" fill={P.nose}/>
        <Mouth cx={100} cy={122}/>
        <Scarf/>
        <FlowerCrown/>
      </svg>
    ),
    bunny: (
      <svg width={w} height={h} viewBox={`0 0 ${VW} ${VH}`}>
        <Glow/>
        <ellipse cx="76" cy="46" rx="15" ry="38" fill={P.body} stroke={P.line} strokeWidth={SW} transform="rotate(-8 76 46)"/>
        <ellipse cx="124" cy="46" rx="15" ry="38" fill={P.body} stroke={P.line} strokeWidth={SW} transform="rotate(8 124 46)"/>
        <ellipse cx="76" cy="48" rx="7" ry="26" fill={P.inner} transform="rotate(-8 76 48)"/>
        <ellipse cx="124" cy="48" rx="7" ry="26" fill={P.inner} transform="rotate(8 124 48)"/>
        <circle cx="150" cy="200" r="14" fill="#fff" stroke={P.line} strokeWidth={SW}/>
        <ellipse cx="46" cy="172" rx="14" ry="24" fill={P.body} stroke={P.line} strokeWidth={SW} transform="rotate(-16 46 172)"/>
        <ellipse cx="154" cy="172" rx="14" ry="24" fill={P.body} stroke={P.line} strokeWidth={SW} transform="rotate(16 154 172)"/>
        <ellipse cx="74" cy="234" rx="21" ry="12" fill={P.foot} stroke={P.line} strokeWidth={SW}/>
        <ellipse cx="126" cy="234" rx="21" ry="12" fill={P.foot} stroke={P.line} strokeWidth={SW}/>
        <ellipse cx="100" cy="190" rx="54" ry="50" fill={P.body} stroke={P.line} strokeWidth={SW}/>
        <ellipse cx="100" cy="196" rx="34" ry="38" fill={P.belly}/>
        <ellipse cx="100" cy="100" rx="54" ry="50" fill={P.body} stroke={P.line} strokeWidth={SW}/>
        <ellipse cx="100" cy="108" rx="32" ry="28" fill={P.belly} opacity="0.6"/>
        <Cheeks lx={64} rx={136} ly={114}/>
        <Eyes lx={78} rx={122} ey={94} sr={15} behind={P.body}/>
        <ellipse cx="100" cy="118" rx="7" ry="5" fill={P.nose}/>
        <Mouth cx={100} cy={132}/>
        <Scarf/>
        <FlowerCrown/>
      </svg>
    ),
    bear: (
      <svg width={w} height={h} viewBox={`0 0 ${VW} ${VH}`}>
        <Glow/>
        <circle cx="58" cy="44" r="22" fill={P.body} stroke={P.line} strokeWidth={SW}/>
        <circle cx="142" cy="44" r="22" fill={P.body} stroke={P.line} strokeWidth={SW}/>
        <circle cx="58" cy="44" r="11" fill={P.inner}/>
        <circle cx="142" cy="44" r="11" fill={P.inner}/>
        <Limbs/>
        <Body/>
        <ellipse cx="100" cy="90" rx="58" ry="53" fill={P.body} stroke={P.line} strokeWidth={SW}/>
        <ellipse cx="100" cy="106" rx="32" ry="26" fill={P.belly}/>
        <Cheeks lx={62} rx={138} ly={104}/>
        <Eyes lx={78} rx={122} ey={82} sr={15} behind={P.body}/>
        <ellipse cx="100" cy="104" rx="9" ry="7" fill={P.nose}/>
        <Mouth cx={100} cy={120}/>
        <Scarf/>
        <FlowerCrown/>
      </svg>
    ),
    owl: (
      <svg width={w} height={h} viewBox={`0 0 ${VW} ${VH}`}>
        <Glow/>
        <path d="M 54 128 Q 10 126 4 160 Q 3 170 17 165 Q 11 184 27 180 Q 23 198 43 194 Q 51 194 53 178 Q 47 152 60 130 Z" fill={P.line} stroke={P.iris} strokeWidth="1.4" strokeLinejoin="round"/>
        <path d="M 146 128 Q 190 126 196 160 Q 197 170 183 165 Q 189 184 173 180 Q 177 198 157 194 Q 149 194 147 178 Q 153 152 140 130 Z" fill={P.line} stroke={P.iris} strokeWidth="1.4" strokeLinejoin="round"/>
        <g stroke={P.body} strokeWidth="1.6" fill="none" opacity="0.55" strokeLinecap="round">
          <path d="M 18 150 Q 24 170 40 184"/><path d="M 28 140 Q 32 162 46 180"/>
          <path d="M 182 150 Q 176 170 160 184"/><path d="M 172 140 Q 168 162 154 180"/>
        </g>
        <ellipse cx="80" cy="242" rx="15" ry="9" fill={P.nose} stroke={P.line} strokeWidth={SW*0.7}/>
        <ellipse cx="120" cy="242" rx="15" ry="9" fill={P.nose} stroke={P.line} strokeWidth={SW*0.7}/>
        <ellipse cx="100" cy="190" rx="52" ry="58" fill={P.body} stroke={P.line} strokeWidth={SW}/>
        <ellipse cx="100" cy="198" rx="34" ry="46" fill={P.belly}/>
        <path d="M 58 50 L 48 18 L 82 46 Z" fill={P.body} stroke={P.line} strokeWidth={SW} strokeLinejoin="round"/>
        <path d="M 142 50 L 152 18 L 118 46 Z" fill={P.body} stroke={P.line} strokeWidth={SW} strokeLinejoin="round"/>
        <ellipse cx="100" cy="86" rx="60" ry="54" fill={P.body} stroke={P.line} strokeWidth={SW}/>
        <circle cx="73" cy="110" r="37" fill={P.belly} stroke={P.line} strokeWidth={SW*0.6}/>
        <circle cx="127" cy="110" r="37" fill={P.belly} stroke={P.line} strokeWidth={SW*0.6}/>
        <Eyes lx={73} rx={127} ey={110} sr={19} behind={P.body} iris={P.iris} irisR={14} owl/>
        <path d="M 90 116 L 110 116 L 100 134 Z" fill={P.nose} stroke={P.line} strokeWidth={SW*0.6} strokeLinejoin="round"/>
        <Scarf/>
        <FlowerCrown/>
      </svg>
    ),
    cat: (
      <svg width={w} height={h} viewBox={`0 0 ${VW} ${VH}`}>
        <Glow/>
        <path d="M 150 220 Q 192 200 182 158 Q 178 138 162 144 Q 174 178 150 210 Z" fill={P.body} stroke={P.line} strokeWidth={SW}/>
        <Limbs/>
        <Body/>
        <path d="M 56 64 L 46 22 L 88 50 Z" fill={P.body} stroke={P.line} strokeWidth={SW} strokeLinejoin="round"/>
        <path d="M 144 64 L 154 22 L 112 50 Z" fill={P.body} stroke={P.line} strokeWidth={SW} strokeLinejoin="round"/>
        <path d="M 60 56 L 54 32 L 80 50 Z" fill={P.inner}/>
        <path d="M 140 56 L 146 32 L 120 50 Z" fill={P.inner}/>
        <ellipse cx="100" cy="90" rx="56" ry="51" fill={P.body} stroke={P.line} strokeWidth={SW}/>
        <ellipse cx="100" cy="104" rx="30" ry="24" fill={P.belly} opacity="0.55"/>
        <Cheeks lx={62} rx={138} ly={104}/>
        <Eyes lx={78} rx={122} ey={84} sr={15} behind={P.body}/>
        <ellipse cx="100" cy="106" rx="7" ry="5" fill={P.nose}/>
        <Mouth cx={100} cy={120}/>
        <g stroke={P.line} strokeWidth="2" strokeLinecap="round" opacity="0.7">
          <line x1="50" y1="104" x2="80" y2="108"/>
          <line x1="48" y1="114" x2="80" y2="114"/>
          <line x1="150" y1="104" x2="120" y2="108"/>
          <line x1="152" y1="114" x2="120" y2="114"/>
        </g>
        <Scarf/>
        <FlowerCrown/>
      </svg>
    ),
    dog: (
      <svg width={w} height={h} viewBox={`0 0 ${VW} ${VH}`}>
        <Glow/>
        <path d="M 150 198 Q 188 186 192 152 Q 193 137 181 139 Q 181 166 148 184 Z" fill={P.body} stroke={P.line} strokeWidth={SW} strokeLinejoin="round"/>
        <Limbs/>
        <Body/>
        <ellipse cx="100" cy="92" rx="56" ry="51" fill={P.body} stroke={P.line} strokeWidth={SW}/>
        <path d="M 82 42 C 50 36 24 70 28 110 C 30 134 50 144 62 126 C 72 100 60 60 86 50 Z" fill={P.body} stroke={P.line} strokeWidth={SW} strokeLinejoin="round"/>
        <path d="M 118 42 C 150 36 176 70 172 110 C 170 134 150 144 138 126 C 128 100 140 60 114 50 Z" fill={P.body} stroke={P.line} strokeWidth={SW} strokeLinejoin="round"/>
        <ellipse cx="46" cy="92" rx="9" ry="27" fill={P.line} opacity="0.28" transform="rotate(15 46 92)"/>
        <ellipse cx="154" cy="92" rx="9" ry="27" fill={P.line} opacity="0.28" transform="rotate(-15 154 92)"/>
        <path d="M 100 46 Q 87 72 92 104 Q 100 110 108 104 Q 113 72 100 46 Z" fill={P.belly}/>
        <ellipse cx="100" cy="110" rx="34" ry="26" fill={P.belly}/>
        <Cheeks lx={64} rx={136} ly={104}/>
        <Eyes lx={80} rx={120} ey={82} sr={15} behind={P.body}/>
        <ellipse cx="100" cy="108" rx="10" ry="7" fill={P.nose}/>
        <Mouth cx={100} cy={124}/>
        <Scarf/>
        <FlowerCrown/>
      </svg>
    ),
  };

  return bodies[id] || bodies.fox;
};

/* ── Sparkle ── */
const Sparkle = ({ x, y, color, delay }) => (
  <div style={{position:"absolute",left:x,top:y,width:12,height:12,
    pointerEvents:"none",animation:`sparkleIn 0.75s ${delay}s ease-out forwards`,
    opacity:0,zIndex:20}}>
    <svg viewBox="0 0 20 20" width={12} height={12}>
      <path d="M10 0 L11.5 8.5 L20 10 L11.5 11.5 L10 20 L8.5 11.5 L0 10 L8.5 8.5 Z" fill={color}/>
    </svg>
  </div>
);

/* ── Speech bubble ── */
const SpeechBubble = ({ text, onDone }) => {
  useEffect(()=>{
    const t = setTimeout(onDone, 3600);
    return ()=>clearTimeout(t);
  },[onDone]);
  return (
    <div style={{
      position:"absolute",bottom:"calc(100% + 16px)",left:"50%",
      transform:"translateX(-50%)",
      background:"#fff",borderRadius:20,padding:"13px 20px",
      boxShadow:"0 6px 28px rgba(124,77,255,0.18)",
      border:`2px solid ${C.border}`,
      minWidth:200,maxWidth:270,textAlign:"center",
      animation:"bubblePop 0.35s ease forwards",
      zIndex:30,
    }}>
      <p style={{fontFamily:F.b,fontWeight:600,fontSize:14,
        color:C.text,margin:0,lineHeight:1.55}}>{text}</p>
      <div style={{position:"absolute",bottom:-11,left:"50%",
        transform:"translateX(-50%)",width:0,height:0,
        borderLeft:"10px solid transparent",borderRight:"10px solid transparent",
        borderTop:`11px solid ${C.border}`}}/>
      <div style={{position:"absolute",bottom:-8,left:"50%",
        transform:"translateX(-50%)",width:0,height:0,
        borderLeft:"8px solid transparent",borderRight:"8px solid transparent",
        borderTop:"8px solid #fff"}}/>
    </div>
  );
};

/* ── Energy bar ── */
/* ── Watering Can SVG ── */
const WateringCanSVG = ({ size=48, watering=false }) => (
  <svg width={size} height={size} viewBox="0 0 64 64" fill="none"
    style={{ animation: watering ? "waterWiggle 0.5s ease" : "none" }}>
    <ellipse cx="22" cy="36" rx="16" ry="12" fill="#4DB6AC" stroke="#37A498" strokeWidth="2.5"/>
    <path d="M 6 36 Q 4 52 10 54 L 34 54 Q 40 52 38 36" fill="#56C7BB" stroke="#37A498" strokeWidth="2"/>
    <path d="M 38 32 Q 52 26 58 22" stroke="#37A498" strokeWidth="3.5" strokeLinecap="round"/>
    <circle cx="58" cy="21" r="4" fill="#81C784" stroke="#43A047" strokeWidth="2"/>
    <path d="M 22 24 Q 16 10 22 4" stroke="#37A498" strokeWidth="3" strokeLinecap="round" fill="none"/>
    <ellipse cx="22" cy="4" rx="5" ry="3" fill="#37A498"/>
    {watering && <>
      <path d="M 50 28 Q 52 34 49 38" stroke="#4FC3F7" strokeWidth="2" strokeLinecap="round" fill="none" opacity="0.8"/>
      <path d="M 54 26 Q 57 32 54 37" stroke="#4FC3F7" strokeWidth="2" strokeLinecap="round" fill="none" opacity="0.6"/>
      <path d="M 58 25 Q 61 31 59 36" stroke="#4FC3F7" strokeWidth="2" strokeLinecap="round" fill="none" opacity="0.4"/>
    </>}
  </svg>
);

/* ── Garden items — 10 per growth stage, unlocked progressively ── */
const GARDEN_ITEMS = [
  /* ── Stage 0 — Seedling (available from the start) ── */
  { id:"g_daisy",      stageUnlock:0, type:"flower",  label:"Daisy Patch",      cost:8,  color:"#FFF9C4", size:"sm", desc:"Sweet little daisies" },
  { id:"g_bluebell",   stageUnlock:0, type:"flower",  label:"Bluebells",        cost:8,  color:"#4FC3F7", size:"sm", desc:"Nodding blue bells" },
  { id:"g_mushroom",   stageUnlock:0, type:"plant",   label:"Magic Mushrooms",  cost:10, color:"#EF5350", size:"sm", desc:"Red-cap mushroom friends" },
  { id:"g_fern",       stageUnlock:0, type:"plant",   label:"Curly Fern",       cost:10, color:"#388E3C", size:"md", desc:"A lush green fern" },
  { id:"g_ladybug",    stageUnlock:0, type:"deco",    label:"Ladybug",          cost:10, color:"#E53935", size:"sm", desc:"A lucky little ladybug" },
  { id:"g_rose",       stageUnlock:0, type:"flower",  label:"Red Rose",         cost:12, color:"#E53935", size:"md", desc:"A classic ruby-red rose" },
  { id:"g_tulip",      stageUnlock:0, type:"flower",  label:"Purple Tulip",     cost:12, color:"#CE93D8", size:"md", desc:"A tall elegant tulip" },
  { id:"g_cactus",     stageUnlock:0, type:"plant",   label:"Friendly Cactus",  cost:12, color:"#66BB6A", size:"md", desc:"A cute little cactus" },
  { id:"g_butterfly",  stageUnlock:0, type:"deco",    label:"Butterfly",        cost:15, color:"#CE93D8", size:"sm", desc:"A colourful butterfly" },
  { id:"g_sunflower",  stageUnlock:0, type:"flower",  label:"Sunflower",        cost:15, color:"#FFD54F", size:"lg", desc:"A big cheerful sunflower" },

  /* ── Stage 1 — Sprouting ── */
  { id:"g_bluebell2",  stageUnlock:1, type:"flower",  label:"Pink Blossoms",    cost:14, color:"#F8BBD0", size:"sm", desc:"Soft pink blossom clusters" },
  { id:"g_daisy2",     stageUnlock:1, type:"flower",  label:"Yellow Daisies",   cost:14, color:"#FFD54F", size:"sm", desc:"Cheerful yellow daisy patch" },
  { id:"g_bamboo",     stageUnlock:1, type:"plant",   label:"Bamboo Stalks",    cost:16, color:"#43A047", size:"lg", desc:"Tall swaying bamboo" },
  { id:"g_fern2",      stageUnlock:1, type:"plant",   label:"Bushy Fern",       cost:16, color:"#2E7D32", size:"md", desc:"A fuller, bushier fern" },
  { id:"g_birdbath",   stageUnlock:1, type:"deco",    label:"Bird Bath",        cost:18, color:"#4FC3F7", size:"md", desc:"Birds love to splash here!" },
  { id:"g_ladybug2",   stageUnlock:1, type:"deco",    label:"Snail",            cost:18, color:"#FF8A65", size:"sm", desc:"A slow and happy snail" },
  { id:"g_beehive",    stageUnlock:1, type:"deco",    label:"Beehive",          cost:20, color:"#FFD54F", size:"md", desc:"A busy golden beehive" },
  { id:"g_tulip2",     stageUnlock:1, type:"flower",  label:"Orange Tulip",     cost:20, color:"#FF7043", size:"md", desc:"A bright orange tulip" },
  { id:"g_sunflower2", stageUnlock:1, type:"flower",  label:"Giant Sunflower",  cost:22, color:"#F9A825", size:"lg", desc:"An extra-tall sunflower" },
  { id:"g_gnome",      stageUnlock:1, type:"deco",    label:"Garden Gnome",     cost:22, color:"#FF7043", size:"md", desc:"A cheerful garden keeper" },

  /* ── Stage 2 — Blooming ── */
  { id:"g_rose2",      stageUnlock:2, type:"flower",  label:"Pink Rose Bush",   cost:20, color:"#F06292", size:"md", desc:"A full pink rose bush" },
  { id:"g_daisy3",     stageUnlock:2, type:"flower",  label:"Wild Flowers",     cost:20, color:"#CE93D8", size:"sm", desc:"A mix of wild meadow flowers" },
  { id:"g_cherry",     stageUnlock:2, type:"tree",    label:"Cherry Blossom",   cost:24, color:"#F8BBD0", size:"xl", desc:"A beautiful flowering tree" },
  { id:"g_bamboo2",    stageUnlock:2, type:"plant",   label:"Tall Bamboo",      cost:24, color:"#388E3C", size:"lg", desc:"A fuller bamboo grove" },
  { id:"g_butterfly2", stageUnlock:2, type:"deco",    label:"Blue Butterfly",   cost:24, color:"#4FC3F7", size:"sm", desc:"A stunning blue butterfly" },
  { id:"g_mushroom2",  stageUnlock:2, type:"plant",   label:"Fairy Ring",       cost:26, color:"#CE93D8", size:"sm", desc:"A magical ring of mushrooms" },
  { id:"g_gnome2",     stageUnlock:2, type:"deco",    label:"Fairy Door",       cost:26, color:"#FF7043", size:"sm", desc:"A tiny magical fairy door" },
  { id:"g_beehive2",   stageUnlock:2, type:"deco",    label:"Flower Arch",      cost:28, color:"#F48FB1", size:"lg", desc:"A pretty floral archway" },
  { id:"g_rainbow",    stageUnlock:2, type:"deco",    label:"Mini Rainbow",     cost:28, color:"#FF7043", size:"lg", desc:"A little arc of colour" },
  { id:"g_cactus2",    stageUnlock:2, type:"plant",   label:"Succulent Patch",  cost:30, color:"#81C784", size:"md", desc:"A cluster of cute succulents" },

  /* ── Stage 3 — Flourishing ── */
  { id:"g_cherry2",    stageUnlock:3, type:"tree",    label:"Apple Tree",       cost:28, color:"#EF5350", size:"xl", desc:"A tree full of red apples" },
  { id:"g_rose3",      stageUnlock:3, type:"flower",  label:"Climbing Roses",   cost:28, color:"#EC407A", size:"lg", desc:"Roses climbing a trellis" },
  { id:"g_fountain",   stageUnlock:3, type:"special", label:"Wishing Fountain", cost:30, color:"#4FC3F7", size:"xl", desc:"A magical wishing fountain" },
  { id:"g_fern3",      stageUnlock:3, type:"plant",   label:"Willow Tree",      cost:30, color:"#66BB6A", size:"xl", desc:"A graceful weeping willow" },
  { id:"g_birdbath2",  stageUnlock:3, type:"deco",    label:"Garden Swing",     cost:32, color:"#8D6E63", size:"md", desc:"A wooden garden swing" },
  { id:"g_butterfly3", stageUnlock:3, type:"deco",    label:"Butterfly Garden", cost:32, color:"#F48FB1", size:"md", desc:"A trio of dancing butterflies" },
  { id:"g_sunflower3", stageUnlock:3, type:"flower",  label:"Sunflower Field",  cost:34, color:"#FFD54F", size:"lg", desc:"A whole row of sunflowers" },
  { id:"g_mushroom3",  stageUnlock:3, type:"plant",   label:"Giant Mushroom",   cost:34, color:"#7E57C2", size:"lg", desc:"A magical oversized mushroom" },
  { id:"g_ladybug3",   stageUnlock:3, type:"deco",    label:"Frog on Lily",     cost:36, color:"#66BB6A", size:"sm", desc:"A happy frog on a lily pad" },
  { id:"g_beehive3",   stageUnlock:3, type:"deco",    label:"Wind Chimes",      cost:36, color:"#4FC3F7", size:"sm", desc:"Musical garden wind chimes" },

  /* ── Stage 4 — Thriving ── */
  { id:"g_treehouse",  stageUnlock:4, type:"special", label:"Tree House",       cost:38, color:"#8D6E63", size:"xl", desc:"A cosy home in the treetops" },
  { id:"g_cherry3",    stageUnlock:4, type:"tree",    label:"Maple Tree",       cost:38, color:"#FF7043", size:"xl", desc:"A tall autumn maple tree" },
  { id:"g_windmill",   stageUnlock:4, type:"special", label:"Windmill",         cost:40, color:"#CE93D8", size:"xl", desc:"A spinning pastel windmill" },
  { id:"g_rose4",      stageUnlock:4, type:"flower",  label:"Rainbow Roses",    cost:40, color:"#F06292", size:"lg", desc:"Roses in every colour" },
  { id:"g_fountain2",  stageUnlock:4, type:"special", label:"Koi Pond",         cost:42, color:"#4FC3F7", size:"xl", desc:"A peaceful pond with koi fish" },
  { id:"g_fireflies",  stageUnlock:4, type:"special", label:"Firefly Jar",      cost:42, color:"#FFD54F", size:"sm", desc:"Tiny glowing lights at dusk" },
  { id:"g_butterfly4", stageUnlock:4, type:"deco",    label:"Butterfly Tower",  cost:44, color:"#7E57C2", size:"lg", desc:"A tall tower covered in butterflies" },
  { id:"g_bamboo3",    stageUnlock:4, type:"plant",   label:"Bamboo Forest",    cost:44, color:"#2E7D32", size:"xl", desc:"A dense bamboo forest" },
  { id:"g_gnome3",     stageUnlock:4, type:"deco",    label:"Stone Lantern",    cost:46, color:"#90A4AE", size:"md", desc:"A glowing stone garden lantern" },
  { id:"g_rainbow2",   stageUnlock:4, type:"deco",    label:"Double Rainbow",   cost:46, color:"#7E57C2", size:"xl", desc:"Two full rainbows arc across the sky" },

  /* ── Stage 5 — Blossoming ── */
  { id:"g_cherry4",    stageUnlock:5, type:"tree",    label:"Magic Tree",       cost:50, color:"#CE93D8", size:"xl", desc:"A tree that glows at night" },
  { id:"g_fountain3",  stageUnlock:5, type:"special", label:"Crystal Fountain", cost:50, color:"#B3E5FC", size:"xl", desc:"A fountain of sparkling crystal" },
  { id:"g_windmill2",  stageUnlock:5, type:"special", label:"Fairy Windmill",   cost:52, color:"#F48FB1", size:"xl", desc:"A tiny windmill dusted in fairy light" },
  { id:"g_rose5",      stageUnlock:5, type:"flower",  label:"Enchanted Roses",  cost:52, color:"#7E57C2", size:"lg", desc:"Roses that sparkle in the moonlight" },
  { id:"g_mushroom4",  stageUnlock:5, type:"plant",   label:"Glowing Fungi",    cost:54, color:"#4FC3F7", size:"md", desc:"Softly glowing mushrooms" },
  { id:"g_fireflies2", stageUnlock:5, type:"special", label:"Lantern Grove",    cost:54, color:"#FFE082", size:"lg", desc:"Rows of glowing paper lanterns" },
  { id:"g_butterfly5", stageUnlock:5, type:"deco",    label:"Moon Moths",       cost:56, color:"#E1BEE7", size:"md", desc:"Beautiful moon moths in flight" },
  { id:"g_treehouse2", stageUnlock:5, type:"special", label:"Cloud Castle",     cost:56, color:"#E3F2FD", size:"xl", desc:"A little castle floating in the clouds" },
  { id:"g_gnome4",     stageUnlock:5, type:"deco",    label:"Star Gazer",       cost:58, color:"#7C4DFF", size:"md", desc:"A gnome gazing at the stars" },
  { id:"g_rainbow3",   stageUnlock:5, type:"deco",    label:"Aurora",           cost:58, color:"#4FC3F7", size:"xl", desc:"Northern lights shimmer overhead" },

  /* ── Stage 6 — Full Bloom ── */
  { id:"g_treehouse3", stageUnlock:6, type:"special", label:"Sky Palace",       cost:60, color:"#FFD54F", size:"xl", desc:"A golden palace above the clouds" },
  { id:"g_fountain4",  stageUnlock:6, type:"special", label:"Rainbow Fountain", cost:60, color:"#F48FB1", size:"xl", desc:"A fountain that sprays rainbows" },
  { id:"g_cherry5",    stageUnlock:6, type:"tree",    label:"Golden Tree",      cost:62, color:"#FFD54F", size:"xl", desc:"An ancient tree of pure gold" },
  { id:"g_windmill3",  stageUnlock:6, type:"special", label:"Star Mill",        cost:62, color:"#FFE082", size:"xl", desc:"A windmill powered by starlight" },
  { id:"g_rose6",      stageUnlock:6, type:"flower",  label:"Legend Rose",      cost:64, color:"#FFD54F", size:"xl", desc:"The rarest rose in the world" },
  { id:"g_fireflies3", stageUnlock:6, type:"special", label:"Galaxy Jar",       cost:64, color:"#7C4DFF", size:"lg", desc:"A jar holding an entire galaxy" },
  { id:"g_butterfly6", stageUnlock:6, type:"deco",    label:"Phoenix Bird",     cost:66, color:"#FF7043", size:"xl", desc:"A legendary phoenix taking flight" },
  { id:"g_rainbow4",   stageUnlock:6, type:"deco",    label:"Shooting Stars",   cost:66, color:"#FFE082", size:"lg", desc:"Stars streak across the garden sky" },
  { id:"g_gnome5",     stageUnlock:6, type:"deco",    label:"Dragon Friend",    cost:68, color:"#66BB6A", size:"xl", desc:"A friendly little dragon" },
  { id:"g_mushroom5",  stageUnlock:6, type:"plant",   label:"World Tree",       cost:68, color:"#43A047", size:"xl", desc:"The tree that holds the whole world" },
];

/* ══════════════════════════════════════════════
   WATERING CAN OVERLAY
   Single SVG fills the hero. Can drawn in local coords,
   positioned and animated with SVG animateTransform so
   translation and geometry are always in sync.
   The can matches the round-body style in the reference image.
   Duration: 3.2s — slides in, pours, slides out.
══════════════════════════════════════════════ */
const WateringOverlay = ({ active }) => {
  if (!active) return null;

  /*
    COORDINATE PLAN  (viewBox 0 0 400 300)
    ─────────────────────────────────────
    Can resting position:  centre of body at (300, 105)
    The can is already tilted ~30° (pouring pose).
    Nozzle tip in scene coords:  approx (168, 188)
    Water jets fan from (168,188) downward-left.
    Splash zone centre: (120, 258) — on the garden ground band (~62% of 300 = 186... 
      but the hero div is taller than the SVG; we put ground at y=258 which looks right
      for the lower third of a 300-tall scene).
  */

  // 12 water jets — lines radiating from nozzle tip, fanning downward-left
  // Each jet is a line from nozzleX,nozzleY to an endpoint
  const NX = 168; const NY = 188; // nozzle tip in scene coords
  const JETS = [
    // angle in degrees from nozzle (roughly 200°–260° = down-left fan)
    { ex:-62, ey:55,  delay:"0.62s", dur:"0.18s" },
    { ex:-52, ey:62,  delay:"0.64s", dur:"0.18s" },
    { ex:-42, ey:68,  delay:"0.66s", dur:"0.18s" },
    { ex:-30, ey:72,  delay:"0.68s", dur:"0.17s" },
    { ex:-18, ey:74,  delay:"0.70s", dur:"0.17s" },
    { ex:-5,  ey:73,  delay:"0.72s", dur:"0.17s" },
    { ex:-72, ey:46,  delay:"0.63s", dur:"0.19s" },
    { ex:-80, ey:34,  delay:"0.61s", dur:"0.19s" },
    { ex:-88, ey:20,  delay:"0.59s", dur:"0.20s" },
    { ex:-58, ey:58,  delay:"0.65s", dur:"0.18s" },
    { ex:-25, ey:70,  delay:"0.69s", dur:"0.17s" },
    { ex:-10, ey:72,  delay:"0.71s", dur:"0.17s" },
  ];

  return (
    <div style={{
      position:"absolute", inset:0, zIndex:4,
      pointerEvents:"none", overflow:"hidden",
    }}>
      <svg
        viewBox="0 0 400 300"
        width="100%" height="100%"
        preserveAspectRatio="xMidYMid slice"
        style={{position:"absolute",inset:0,display:"block"}}
      >
        <defs>
          <linearGradient id="wBody" x1="0" y1="0" x2="0.3" y2="1">
            <stop offset="0%" stopColor="#80DEEA"/>
            <stop offset="60%" stopColor="#4DD0E1"/>
            <stop offset="100%" stopColor="#26C6DA"/>
          </linearGradient>
          <linearGradient id="wBodySide" x1="1" y1="0" x2="0" y2="0">
            <stop offset="0%" stopColor="#0097A7"/>
            <stop offset="100%" stopColor="#26C6DA"/>
          </linearGradient>
          <clipPath id="wSceneClip"><rect width="400" height="300"/></clipPath>
        </defs>

        <g clipPath="url(#wSceneClip)">

          {/* ── Water jets (drawn first so they appear behind nozzle rim) ── */}
          <g opacity="0">
            {/* Group fades in when pouring starts, fades out at end */}
            <animate attributeName="opacity"
              values="0;0;1;1;1;0"
              keyTimes="0;0.22;0.30;0.68;0.78;1"
              dur="3.2s" repeatCount="1" fill="freeze"/>

            {JETS.map((j, i) => (
              <line key={i}
                x1={NX} y1={NY}
                x2={NX + j.ex} y2={NY + j.ey}
                stroke="#81D4FA" strokeWidth={i < 3 ? 2.2 : i < 7 ? 1.8 : 1.4}
                strokeLinecap="round" opacity="0">
                <animate attributeName="opacity"
                  values="0;0.9;0.9;0"
                  keyTimes="0;0.15;0.85;1"
                  dur={j.dur} begin={j.delay}
                  repeatCount="indefinite"/>
                {/* Animate stroke-dashoffset for a "growing" jet effect */}
                <animate attributeName="stroke-dasharray"
                  values={`0 ${Math.hypot(j.ex,j.ey)};${Math.hypot(j.ex,j.ey)} 0`}
                  keyTimes="0;1"
                  dur={j.dur} begin={j.delay}
                  repeatCount="indefinite"/>
              </line>
            ))}
          </g>

          {/* ── Ground splash / puddle ── */}
          <ellipse cx="128" cy="258" rx="0" ry="0" fill="#B2EBF2" opacity="0">
            <animate attributeName="opacity"
              values="0;0;0.5;0.5;0.3;0"
              keyTimes="0;0.28;0.36;0.7;0.82;1"
              dur="3.2s" repeatCount="1" fill="freeze"/>
            <animate attributeName="rx"
              values="0;0;34;34;34;34"
              keyTimes="0;0.28;0.36;0.7;0.82;1"
              dur="3.2s" repeatCount="1" fill="freeze"/>
            <animate attributeName="ry"
              values="0;0;7;7;7;7"
              keyTimes="0;0.28;0.36;0.7;0.82;1"
              dur="3.2s" repeatCount="1" fill="freeze"/>
          </ellipse>

          {/* Splash ring */}
          <ellipse cx="128" cy="258" rx="0" ry="0"
            fill="none" stroke="#4FC3F7" strokeWidth="1.8" opacity="0">
            <animate attributeName="opacity" values="0;0;0.8;0" keyTimes="0;0.3;0.42;0.55" dur="3.2s" fill="freeze"/>
            <animate attributeName="rx"    values="0;0;6;22"    keyTimes="0;0.3;0.34;0.55" dur="3.2s" fill="freeze"/>
            <animate attributeName="ry"    values="0;0;3;8"     keyTimes="0;0.3;0.34;0.55" dur="3.2s" fill="freeze"/>
          </ellipse>

          {/* ── WATERING CAN — slides in from right using animateTransform ──
              The can is drawn in LOCAL coords where the body centre = (0,0).
              A <g transform="translate(300,105) rotate(-32,0,0)"> positions it
              in scene space, already in the pouring tilt.
              An <animateTransform> on the outer group slides it in/out.
          ── */}

          {/* Outer group: handles the slide-in translate */}
          <g>
            <animateTransform
              attributeName="transform"
              type="translate"
              values="430,0; 0,0; 0,0; 430,0"
              keyTimes="0;0.18;0.80;1"
              dur="3.2s"
              calcMode="spline"
              keySplines="0.4 0 0.2 1; 0 0 1 1; 0.4 0 0.2 1"
              repeatCount="1" fill="freeze"/>

            {/* Inner group: positions can in scene + applies tilt */}
            {/* Body centre at scene (300,105), tilted -32° so spout aims lower-left */}
            <g transform="translate(300,105) rotate(-32)">

              {/*
                CAN in LOCAL coords (body centre = 0,0):
                Matching the reference image:
                - Large rounded oval body
                - Spout exits from left side (~x=-55,y=+15), curves forward to nozzle at (-115, +45)
                - Nozzle is a round disc, facing left
                - Handle is thick D-shape on the right side
                - Lid/opening on top
              */}

              {/* ── BODY — large rounded oval ── */}
              {/* Main fill */}
              <ellipse cx="0" cy="10" rx="62" ry="54"
                fill="url(#wBody)" stroke="#00838F" strokeWidth="3"/>
              {/* Shadow on right/bottom edge */}
              <ellipse cx="8" cy="16" rx="58" ry="50"
                fill="url(#wBodySide)" stroke="none" opacity="0.25"/>
              {/* Highlight reflection (upper-left) */}
              <ellipse cx="-18" cy="-8" rx="28" ry="20"
                fill="rgba(255,255,255,0.28)" stroke="none"/>
              {/* Subtle inner contour */}
              <ellipse cx="0" cy="10" rx="54" ry="47"
                fill="none" stroke="rgba(255,255,255,0.18)" strokeWidth="2"/>

              {/* ── SPOUT — tapered pipe from left body, curving to nozzle ── */}
              {/* The spout in the reference tapers: wide at root, narrow at tip */}
              {/* Root at body left: (-55,+18). Nozzle centre: (-115,+45) */}
              {/* Draw as a filled shape (two bezier paths top+bottom + close) */}
              <path d="
                M -48,5
                Q -80,18 -108,38
                Q -110,40 -112,43
                L -108,52
                Q -106,50 -104,47
                Q -78,30 -48,22
                Z
              " fill="url(#wBody)" stroke="#00838F" strokeWidth="2.5"/>
              {/* Spout highlight */}
              <path d="M -52,8 Q -82,20 -106,40" stroke="rgba(255,255,255,0.3)" strokeWidth="3" strokeLinecap="round" fill="none"/>

              {/* ── NOZZLE (rose head) — flat round disc, faces left ── */}
              {/* Centre at (-115,+46) in local coords */}
              <ellipse cx="-116" cy="46" rx="13" ry="17"
                fill="#26C6DA" stroke="#00838F" strokeWidth="2.5"
                transform="rotate(10 -116 46)"/>
              {/* Nozzle face (slightly lighter disc) */}
              <ellipse cx="-116" cy="46" rx="9" ry="13"
                fill="#80DEEA" stroke="#00838F" strokeWidth="1.5"
                transform="rotate(10 -116 46)"/>
              {/* Holes in grid pattern */}
              {[
                [-119,40],[-113,40],[-107,42],
                [-120,47],[-114,47],[-108,48],
                [-120,54],[-114,54],[-108,55],
              ].map(([hx,hy],i)=>(
                <circle key={i} cx={hx} cy={hy} r="1.6" fill="#006064" opacity="0.85"/>
              ))}

              {/* ── HANDLE — thick D-arc on the right ── */}
              {/* Attaches at body right: top attach ≈ (+50,-20), bottom ≈ (+50,+40) */}
              {/* Outer stroke = dark, inner = can colour */}
              <path d="M 50,-22 Q 95,-22 95,10 Q 95,44 50,42"
                fill="none" stroke="#00838F" strokeWidth="14" strokeLinecap="round"/>
              <path d="M 50,-22 Q 95,-22 95,10 Q 95,44 50,42"
                fill="none" stroke="#4DD0E1" strokeWidth="9" strokeLinecap="round"/>
              {/* Handle highlight */}
              <path d="M 52,-18 Q 88,-18 88,10 Q 88,40 52,38"
                fill="none" stroke="rgba(255,255,255,0.25)" strokeWidth="3" strokeLinecap="round"/>

              {/* ── LID / OPENING ON TOP ── */}
              {/* Oval opening tilted on top of body */}
              <ellipse cx="-10" cy="-50" rx="28" ry="10"
                fill="#00ACC1" stroke="#00838F" strokeWidth="2.5"
                transform="rotate(-8 -10 -50)"/>
              {/* Lid inner (open top) */}
              <ellipse cx="-10" cy="-50" rx="20" ry="7"
                fill="#0097A7" stroke="none"
                transform="rotate(-8 -10 -50)"/>
              {/* Lid rim highlight */}
              <ellipse cx="-16" cy="-53" rx="12" ry="4"
                fill="rgba(255,255,255,0.3)" stroke="none"
                transform="rotate(-8 -16 -53)"/>

            </g>{/* end tilt group */}
          </g>{/* end slide group */}

        </g>{/* end clip */}
      </svg>
    </div>
  );
};

/* ── Action Tabs — watering can + shop, side by side ── */
const ActionTabs = ({ mascotId, stageId, mascotName, moodLog, score, activityTier=0,
  activeChild, growthScore, supabase, setActiveChild, setChildren, onWater, mascotColor }) => {

  const [watering, setWatering]   = useState(false);
  const [msg, setMsg]             = useState(null);
  const [showShop, setShowShop]   = useState(false);

  const WATER_MESSAGES = [
    `${mascotName} loved that! 💧`,
    "Growing stronger! 🌱",
    "So refreshing! ✨",
    "Thank you! 🥰",
    "Keep it up! 🌿",
  ];

  const handleWater = () => {
    if (watering) return;
    setWatering(true);
    // Trigger the full garden watering scene
    onWater && onWater();
    // Show a message after a short delay
    setTimeout(() => {
      setMsg(WATER_MESSAGES[Math.floor(Math.random() * WATER_MESSAGES.length)]);
    }, 800);
    setTimeout(() => {
      setWatering(false);
      setTimeout(() => setMsg(null), 1200);
    }, 2900);
  };

  const vibe = activityTier===0 ? { label:"Thriving 🌟" }
             : activityTier===1 ? { label:"Doing well 🌿" }
             : activityTier===2 ? { label:"Could use love 💜" }
             :                    { label:"Missing you 🥺" };

  return (
    <>
      <style>{`
        @keyframes msgPop {
          0%{opacity:0;transform:translateY(6px) scale(0.9)}
          20%{opacity:1;transform:translateY(0) scale(1)}
          80%{opacity:1;}
          100%{opacity:0;}
        }
      `}</style>

      <div style={{display:"flex", gap:12, marginBottom:14}}>

        {/* ── Watering Can Tab ── */}
        <button
          onClick={handleWater}
          style={{
            flex:1, borderRadius:20, padding:"22px 12px", cursor: watering ? "default" : "pointer",
            border:"none", textAlign:"center", transition:"all 0.3s",
            background: watering
              ? "linear-gradient(135deg,#29B6F6,#0277BD)"
              : "linear-gradient(135deg,#4FC3F7,#039BE5)",
            boxShadow: watering
              ? "0 6px 24px rgba(2,119,189,0.6), inset 0 1px 0 rgba(255,255,255,0.2)"
              : "0 4px 16px rgba(79,195,247,0.4)",
            minHeight:150, display:"flex", flexDirection:"column",
            alignItems:"center", justifyContent:"center", gap:10,
            position:"relative", overflow:"hidden",
          }}
          onMouseDown={e=>{ if(!watering) e.currentTarget.style.transform="scale(0.97)"; }}
          onMouseUp={e=>e.currentTarget.style.transform="scale(1)"}>

          {/* Shimmer when active */}
          {watering && (
            <div style={{
              position:"absolute", inset:0,
              background:"linear-gradient(135deg,rgba(255,255,255,0.15) 0%,transparent 60%)",
              animation:"pulse 1s ease-in-out infinite",
              pointerEvents:"none",
            }}/>
          )}

          {msg && (
            <div style={{
              position:"absolute", top:10, left:"50%", transform:"translateX(-50%)",
              background:"rgba(255,255,255,0.25)", color:"#fff", borderRadius:50,
              padding:"4px 14px", whiteSpace:"nowrap",
              fontFamily:F.b, fontWeight:700, fontSize:12,
              animation:"msgPop 1.4s ease forwards", pointerEvents:"none",
              backdropFilter:"blur(4px)",
            }}>{msg}</div>
          )}

          {/* Watering can icon — round oval body matching reference style */}
          <svg width="68" height="58" viewBox="-10 -14 130 110" fill="none">
            <defs>
              <linearGradient id="btnCan" x1="0" y1="0" x2="0.3" y2="1">
                <stop offset="0%" stopColor="rgba(255,255,255,0.95)"/>
                <stop offset="60%" stopColor="rgba(255,255,255,0.80)"/>
                <stop offset="100%" stopColor="rgba(255,255,255,0.60)"/>
              </linearGradient>
            </defs>

            {/* Body — large oval */}
            <ellipse cx="62" cy="42" rx="52" ry="42" fill="url(#btnCan)" stroke="rgba(255,255,255,0.7)" strokeWidth="3"/>
            {/* Body highlight */}
            <ellipse cx="46" cy="28" rx="24" ry="16" fill="rgba(255,255,255,0.35)"/>

            {/* Handle — D-arc on right */}
            <path d="M 104,22 Q 128,22 128,42 Q 128,62 104,62"
              fill="none" stroke="rgba(255,255,255,0.9)" strokeWidth="10" strokeLinecap="round"/>
            <path d="M 104,22 Q 128,22 128,42 Q 128,62 104,62"
              fill="none" stroke="rgba(255,255,255,0.4)" strokeWidth="5" strokeLinecap="round"/>

            {/* Lid opening on top */}
            <ellipse cx="54" cy="2" rx="22" ry="8"
              fill="rgba(255,255,255,0.8)" stroke="rgba(255,255,255,0.6)" strokeWidth="2"
              transform="rotate(-5 54 2)"/>
            <ellipse cx="54" cy="2" rx="14" ry="5"
              fill="rgba(179,229,252,0.9)"
              transform="rotate(-5 54 2)"/>

            {/* Spout — long tapered pipe angling lower-left */}
            <path d="M 22,56 Q -4,62 -28,78 Q -30,80 -32,82 L -24,90 Q -22,88 -20,86 Q 4,72 26,68 Z"
              fill="rgba(255,255,255,0.82)" stroke="rgba(255,255,255,0.6)" strokeWidth="1.5"/>

            {/* Nozzle disc */}
            <ellipse cx="-32" cy="82" rx="11" ry="15"
              fill="rgba(179,229,252,0.95)" stroke="rgba(255,255,255,0.7)" strokeWidth="2"
              transform="rotate(12 -32 82)"/>
            <ellipse cx="-32" cy="82" rx="7" ry="10"
              fill="rgba(255,255,255,0.5)"
              transform="rotate(12 -32 82)"/>
            {/* Nozzle holes */}
            {[[-35,76],[-29,76],[-36,83],[-30,83],[-24,83],[-34,89],[-28,89]].map(([hx,hy],i)=>(
              <circle key={i} cx={hx} cy={hy} r="1.3" fill="rgba(2,136,209,0.7)"/>
            ))}

            {/* Water jets from nozzle */}
            {[
              {x2:-58,y2:90},{x2:-64,y2:98},{x2:-56,y2:100},
              {x2:-52,y2:88},{x2:-68,y2:94},{x2:-48,y2:96},
            ].map((j,i)=>(
              <line key={i} x1={-36} y1={86} x2={j.x2} y2={j.y2}
                stroke="rgba(179,229,252,0.85)" strokeWidth={i<2?2:1.4} strokeLinecap="round"/>
            ))}
          </svg>

          <p style={{fontFamily:F.h, fontWeight:800, fontSize:14, color:"#fff", margin:0}}>
            {watering ? "Watering… 💧" : `Water Garden`}
          </p>
          <div style={{display:"flex", alignItems:"center", gap:5,
            background:"rgba(255,255,255,0.2)", borderRadius:50, padding:"3px 10px"}}>
            <div style={{width:7, height:7, borderRadius:"50%", background:"#fff"}}/>
            <span style={{fontFamily:F.b, fontWeight:700, fontSize:11, color:"#fff"}}>
              {vibe.label}
            </span>
          </div>
        </button>

        {/* ── Garden Shop Tab ── */}
        <button
          onClick={()=>setShowShop(true)}
          style={{
            flex:1, borderRadius:20, padding:"22px 12px", cursor:"pointer",
            border:"none", textAlign:"center", transition:"transform 0.15s",
            background:"linear-gradient(135deg,#7C4DFF 0%,#B04DFF 50%,#F06292 100%)",
            boxShadow:"0 8px 28px rgba(124,77,255,0.45),0 2px 8px rgba(124,77,255,0.2)",
            animation:"shopGlow 3s ease-in-out infinite",
            minHeight:150, display:"flex", flexDirection:"column",
            alignItems:"center", justifyContent:"center", gap:8,
            position:"relative", overflow:"hidden",
          }}
          onMouseDown={e=>e.currentTarget.style.transform="scale(0.97)"}
          onMouseUp={e=>e.currentTarget.style.transform="scale(1)"}>

          {/* Shimmer overlay */}
          <div style={{
            position:"absolute",inset:0,
            background:"linear-gradient(135deg,rgba(255,255,255,0.12) 0%,transparent 50%,rgba(255,255,255,0.06) 100%)",
            pointerEvents:"none",
          }}/>

          {/* Decorative mini plants in corners */}
          <div style={{position:"absolute",top:10,left:10,opacity:0.35,fontSize:18,lineHeight:1}}>🌸</div>
          <div style={{position:"absolute",top:12,right:12,opacity:0.3,fontSize:14,lineHeight:1}}>✨</div>
          <div style={{position:"absolute",bottom:14,left:12,opacity:0.28,fontSize:13,lineHeight:1}}>🌿</div>
          <div style={{position:"absolute",bottom:12,right:10,opacity:0.3,fontSize:15,lineHeight:1}}>🌻</div>

          {/* Shop bag SVG icon */}
          <div style={{
            background:"rgba(255,255,255,0.2)",
            borderRadius:18, padding:10,
            backdropFilter:"blur(4px)",
            border:"1.5px solid rgba(255,255,255,0.3)",
          }}>
            <svg width="36" height="36" viewBox="0 0 64 64" fill="none">
              {/* Bag body */}
              <path d="M 10 24 Q 8 56 12 58 L 52 58 Q 56 56 54 24 Z"
                fill="rgba(255,255,255,0.92)"/>
              {/* Bag handle */}
              <path d="M 22 24 Q 22 10 32 10 Q 42 10 42 24"
                stroke="rgba(255,255,255,0.95)" strokeWidth="4.5"
                strokeLinecap="round" fill="none"/>
              {/* Flower inside bag */}
              {[0,60,120,180,240,300].map((a,i)=>{
                const r=a*Math.PI/180;
                return <ellipse key={i}
                  cx={32+Math.cos(r)*7} cy={41+Math.sin(r)*7}
                  rx={4.5} ry={3}
                  fill={["#FFD54F","#F06292","#CE93D8","#4FC3F7","#81C784","#FF7043"][i]}
                  opacity="0.9"
                  transform={`rotate(${a} ${32+Math.cos(r)*7} ${41+Math.sin(r)*7})`}/>;
              })}
              <circle cx={32} cy={41} r={4} fill="#FFD54F"/>
              <circle cx={32} cy={41} r={2} fill="#F9A825"/>
              {/* Sparkle dots on bag */}
              <circle cx="18" cy="34" r="2.5" fill="rgba(255,255,255,0.7)"/>
              <circle cx="46" cy="50" r="2" fill="rgba(255,255,255,0.6)"/>
            </svg>
          </div>

          {/* Title */}
          <p style={{fontFamily:F.h, fontWeight:900, fontSize:15, color:"#fff", margin:0,
            textShadow:"0 1px 6px rgba(0,0,0,0.2)"}}>
            Garden Shop
          </p>

          {/* Seed count pill */}
          <div style={{
            display:"flex", alignItems:"center", gap:5,
            background:"rgba(255,255,255,0.22)", borderRadius:50,
            padding:"4px 12px", border:"1px solid rgba(255,255,255,0.35)",
            backdropFilter:"blur(4px)",
          }}>
            <span style={{fontSize:12}}>🌱</span>
            <span style={{fontFamily:F.b, fontWeight:800, fontSize:12, color:"#fff"}}>
              {score} seeds
            </span>
          </div>

          {/* Unlocked items count */}
          {Object.keys(activeChild.seen_tooltips?.shop_unlocks||{}).length > 0 && (
            <p style={{fontFamily:F.b,fontWeight:600,fontSize:11,
              color:"rgba(255,255,255,0.8)",margin:0}}>
              {Object.keys(activeChild.seen_tooltips.shop_unlocks).length} planted 🌿
            </p>
          )}
        </button>
      </div>

      {showShop && (
        <ShopPanel
          activeChild={activeChild}
          growthScore={score}
          supabase={supabase}
          setActiveChild={setActiveChild}
          setChildren={setChildren}
          onClose={()=>setShowShop(false)}
        />
      )}
    </>
  );
};

/* ════════════════════════════════
   GARDEN SHOP PANEL
   Two tabs: "Shop" (browse & buy plants/deco) and "My Garden" (see what's planted)
   Items are permanently planted — no equip/unequip, just collect & grow.
════════════════════════════════ */

/* ── Stage metadata for shop display ── */
const STAGE_SHOP_META = [
  { id:0, name:"Seedling",    color:"#A5D6A7", bg:"#E8F5E9",  minScore:0   },
  { id:1, name:"Sprouting",   color:"#4DB6AC", bg:"#E0F2F1",  minScore:15  },
  { id:2, name:"Blooming",    color:"#7C4DFF", bg:"#EDE7F6",  minScore:35  },
  { id:3, name:"Flourishing", color:"#FF7043", bg:"#FFF3E0",  minScore:70  },
  { id:4, name:"Thriving",    color:"#F9A825", bg:"#FFF9C4",  minScore:120 },
  { id:5, name:"Blossoming",  color:"#EC407A", bg:"#FCE4EC",  minScore:180 },
  { id:6, name:"Full Bloom",  color:"#FFD54F", bg:"#FFFDE7",  minScore:260 },
];

/* ── Mini SVG garden preview ── */
const GardenPreview = ({ ownedIds, stageId }) => {
  const grassColors = [
    ["#66BB6A","#43A047"],["#43A047","#388E3C"],["#388E3C","#2E7D32"],
    ["#689F38","#558B2F"],["#388E3C","#2E7D32"],["#388E3C","#2E7D32"],["#43A047","#388E3C"],
  ][stageId] || ["#66BB6A","#43A047"];
  const skyColors = [
    ["#DCF5E0","#B9F0C2"],["#D0F5F9","#A0E8F0"],["#E8E0FF","#C4B0F5"],
    ["#FFE8CC","#FFD4A8"],["#FFFACC","#FFED9A"],["#FFD6E8","#FFB0D0"],["#FFF5B0","#FFE066"],
  ];
  const [skyBot, skyTop] = skyColors[stageId] || skyColors[0];
  const PW = 320; const PH = 100;
  const groundY = PH * 0.6;
  const POSITIONS = [0.08,0.18,0.78,0.88,0.12,0.82,0.24,0.72,0.30];
  const ITEM_SIZES_MAP = {
    g_cherry:"xl",g_cherry2:"xl",g_cherry3:"xl",g_cherry4:"xl",g_cherry5:"xl",
    g_treehouse:"xl",g_treehouse2:"xl",g_treehouse3:"xl",
    g_windmill:"xl",g_windmill2:"xl",g_windmill3:"xl",
    g_fountain:"xl",g_fountain2:"xl",g_fountain3:"xl",g_fountain4:"xl",
    g_fern3:"xl",g_bamboo3:"xl",g_rainbow2:"xl",g_rainbow3:"xl",g_rainbow4:"xl",
    g_butterfly4:"lg",g_gnome5:"xl",g_mushroom5:"xl",
    g_bamboo:"lg",g_bamboo2:"lg",g_sunflower:"lg",g_sunflower2:"lg",g_sunflower3:"lg",
    g_rainbow:"lg",g_rose3:"lg",g_rose4:"lg",g_rose5:"lg",g_rose6:"xl",
    g_beehive2:"lg",g_mushroom3:"lg",g_mushroom4:"md",g_fireflies2:"lg",
    g_butterfly5:"md",g_gnome4:"md",
  };
  const ITEM_SCALES_MAP = { xl:0.36, lg:0.30, md:0.26, sm:0.22 };
  const displayIds = ownedIds.slice(0,9);

  return (
    <div style={{borderRadius:14,overflow:"hidden",height:PH,marginBottom:14,
      border:"1.5px solid rgba(0,0,0,0.06)"}}>
      <svg viewBox={`0 0 ${PW} ${PH}`} width="100%" height={PH} style={{display:"block"}}>
        <defs>
          <linearGradient id="pvSky" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor={skyTop}/><stop offset="100%" stopColor={skyBot}/>
          </linearGradient>
          <linearGradient id="pvGnd" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor={grassColors[0]}/><stop offset="100%" stopColor={grassColors[1]}/>
          </linearGradient>
        </defs>
        <rect width={PW} height={PH} fill="url(#pvSky)"/>
        <path d={`M0,${groundY} C${PW*0.3},${groundY-5} ${PW*0.7},${groundY+4} ${PW},${groundY} L${PW},${PH} L0,${PH} Z`}
          fill="url(#pvGnd)"/>
        {displayIds.length === 0 ? (
          <text x={PW/2} y={PH*0.45} textAnchor="middle"
            fontFamily="'Poppins',sans-serif" fontSize="11" fill="#9B8DB5">
            Plant your first item to see your garden here!
          </text>
        ) : (
          displayIds.map((id, i) => {
            const sz = ITEM_SIZES_MAP[id] || "md";
            const scale = ITEM_SCALES_MAP[sz];
            const cx = PW * POSITIONS[i % POSITIONS.length];
            return <GardenItemSVG key={id} id={id} cx={cx} groundY={groundY}
              scale={scale} w={PW} h={PH} idx={i}/>;
          })
        )}
        {Array.from({length:12},(_,i)=>({x:(i/11)*PW,bh:PH*0.07+Math.sin(i*1.4)*PH*0.03})).map((b,i)=>(
          <path key={i}
            d={`M${b.x},${groundY+PH*0.12} C${b.x-3},${groundY+PH*0.12-b.bh*0.6} ${b.x+2},${groundY+PH*0.12-b.bh*0.85} ${b.x+2},${groundY+PH*0.12-b.bh}`}
            stroke={grassColors[0]} strokeWidth="2.5" fill="none" strokeLinecap="round" opacity="0.85"/>
        ))}
      </svg>
    </div>
  );
};

/* ══════════════════════════════════════════════
   GARDEN SHOP PANEL
   Items are gated by growth stage.
   Each of 7 stages unlocks 10 new items.
   Current stage items are purchasable; future stages show a lock.
══════════════════════════════════════════════ */
const ShopPanel = ({ activeChild, growthScore, supabase, setActiveChild, setChildren, onClose }) => {
  const unlocks        = activeChild.seen_tooltips?.shop_unlocks || {};
  const ownedIds       = Object.keys(unlocks);
  const spentSeeds     = Object.values(unlocks).reduce((a,v) => a + (v?.cost||0), 0);
  const availableSeeds = Math.max(0, growthScore - spentSeeds);

  /* Current growth stage (0–6) */
  const currentStageId = Math.min(6, STAGE_SHOP_META.reduce(
    (best, s) => growthScore >= s.minScore ? s.id : best, 0
  ));

  const [panelTab,   setPanelTab]   = useState("shop");
  const [selectedId, setSelectedId] = useState(null);
  const [buying,     setBuying]     = useState(false);
  const [successId,  setSuccessId]  = useState(null);

  const ownedItems   = GARDEN_ITEMS.filter(i => ownedIds.includes(i.id));
  const selected     = GARDEN_ITEMS.find(i => i.id === selectedId) || null;

  /* Group all items by their stageUnlock */
  const itemsByStage = STAGE_SHOP_META.map(sm => ({
    stage: sm,
    items: GARDEN_ITEMS.filter(i => i.stageUnlock === sm.id),
  }));

  /* How many affordable unowned items exist in unlocked stages */
  const affordableCount = GARDEN_ITEMS.filter(
    i => i.stageUnlock <= currentStageId && !ownedIds.includes(i.id) && availableSeeds >= i.cost
  ).length;

  const handleBuy = async () => {
    if (!selected || availableSeeds < selected.cost || buying) return;
    setBuying(true);
    const newUnlocks  = { ...unlocks, [selected.id]: { cost: selected.cost, at: Date.now() } };
    const newTooltips = { ...(activeChild.seen_tooltips||{}), shop_unlocks: newUnlocks };
    const { error } = await supabase.from("children").update({ seen_tooltips: newTooltips }).eq("id", activeChild.id);
    if (!error) {
      setActiveChild(prev => ({ ...prev, seen_tooltips: newTooltips }));
      setChildren(cs => cs.map(c => c.id===activeChild.id ? {...c, seen_tooltips: newTooltips} : c));
      setSuccessId(selected.id);
      setTimeout(() => setSuccessId(null), 2400);
    }
    setBuying(false);
    setSelectedId(null);
  };

  /* ── Item card for purchasable (unlocked stage) items ── */
  const ShopItemCard = ({ item }) => {
    const isSelected = selectedId === item.id;
    const canAfford  = availableSeeds >= item.cost;
    const isSuccess  = successId === item.id;
    return (
      <button
        onClick={() => { if (!canAfford) return; setSelectedId(p => p===item.id ? null : item.id); }}
        disabled={!canAfford}
        style={{
          background: isSuccess ? "#E8F5E9" : isSelected ? `${C.purple}12` : "#fff",
          border:`2px solid ${isSuccess ? C.mint : isSelected ? C.purple : canAfford ? C.border : "#e8e8e8"}`,
          borderRadius:16, padding:"12px 8px",
          cursor: canAfford ? "pointer" : "default",
          textAlign:"center", transition:"all 0.18s", position:"relative",
          opacity: !canAfford ? 0.48 : 1,
          boxShadow: isSelected ? `0 4px 14px ${C.purple}28` : "none",
          transform: isSelected ? "scale(1.03)" : "scale(1)",
        }}
      >
        {isSelected && (
          <div style={{position:"absolute",top:6,right:6,background:C.purple,
            borderRadius:"50%",width:17,height:17,display:"flex",alignItems:"center",justifyContent:"center"}}>
            <span style={{color:"#fff",fontSize:9,fontWeight:900}}>✓</span>
          </div>
        )}
        <div style={{height:72,display:"flex",alignItems:"flex-end",justifyContent:"center",marginBottom:4,overflow:"hidden"}}>
          <svg viewBox="0 0 80 76" width={80} height={76} style={{overflow:"visible"}}>
            <GardenItemSVG id={item.id} cx={40} groundY={64} scale={0.52} w={80} h={76} idx={0}/>
          </svg>
        </div>
        <p style={{fontFamily:"'Baloo 2',cursive",fontWeight:800,fontSize:11,
          color:C.text,margin:"0 0 2px",lineHeight:1.2}}>{item.label}</p>
        {isSuccess ? (
          <p style={{fontFamily:"'Poppins',sans-serif",fontWeight:700,fontSize:11,color:C.mint,margin:0}}>
            Planted! 🎉
          </p>
        ) : (
          <div style={{display:"inline-flex",alignItems:"center",gap:3,
            background:canAfford?"#EDE7F6":"#f3f3f3",borderRadius:50,padding:"2px 8px"}}>
            <span style={{fontSize:11}}>🌱</span>
            <span style={{fontFamily:"'Poppins',sans-serif",fontWeight:700,fontSize:11,
              color:canAfford?C.purple:"#bbb"}}>{item.cost}</span>
          </div>
        )}
      </button>
    );
  };

  /* ── Item card for owned items (My Garden tab) ── */
  const OwnedItemCard = ({ item }) => (
    <div style={{
      background:`${item.color}14`, border:`2px solid ${item.color}44`,
      borderRadius:16, padding:"12px 8px", textAlign:"center", position:"relative",
    }}>
      <div style={{position:"absolute",top:6,right:6,background:C.mint,
        borderRadius:"50%",width:17,height:17,display:"flex",alignItems:"center",justifyContent:"center"}}>
        <span style={{color:"#fff",fontSize:9,fontWeight:900}}>✓</span>
      </div>
      <div style={{height:72,display:"flex",alignItems:"flex-end",justifyContent:"center",marginBottom:4,overflow:"hidden"}}>
        <svg viewBox="0 0 80 76" width={80} height={76} style={{overflow:"visible"}}>
          <GardenItemSVG id={item.id} cx={40} groundY={64} scale={0.52} w={80} h={76} idx={0}/>
        </svg>
      </div>
      <p style={{fontFamily:"'Baloo 2',cursive",fontWeight:800,fontSize:11,
        color:C.text,margin:"0 0 2px",lineHeight:1.2}}>{item.label}</p>
      <p style={{fontFamily:"'Poppins',sans-serif",fontWeight:600,fontSize:10,color:C.mint,margin:0}}>
        Planted ✓
      </p>
    </div>
  );

  /* ── Locked stage teaser card ── */
  const LockedStageCard = ({ stage }) => {
    const seedsNeeded = stage.minScore - growthScore;
    return (
      <div style={{
        background:`${stage.color}08`,
        border:`2px dashed ${stage.color}44`,
        borderRadius:20, padding:"16px 20px", marginBottom:18,
        opacity:0.85,
      }}>
        <div style={{display:"flex",alignItems:"center",gap:12,marginBottom:10}}>
          <div style={{
            background:`${stage.color}22`, borderRadius:"50%",
            width:40, height:40, display:"flex", alignItems:"center", justifyContent:"center",
            fontSize:20, flexShrink:0,
          }}>
            🔒
          </div>
          <div style={{flex:1}}>
            <p style={{fontFamily:"'Baloo 2',cursive",fontWeight:900,fontSize:15,
              color:stage.color,margin:0}}>{stage.name} Stage</p>
            <p style={{fontFamily:"'Poppins',sans-serif",fontWeight:600,fontSize:12,
              color:C.muted,margin:0}}>
              {seedsNeeded} more seeds to unlock 10 items
            </p>
          </div>
          <div style={{
            background:stage.bg, borderRadius:50, padding:"4px 10px",
            flexShrink:0,
          }}>
            <p style={{fontFamily:"'Poppins',sans-serif",fontWeight:700,fontSize:11,
              color:stage.color,margin:0}}>🌱 {stage.minScore}</p>
          </div>
        </div>
        {/* Preview row — 5 mystery silhouettes */}
        <div style={{display:"flex",gap:6,justifyContent:"center"}}>
          {Array.from({length:10},(_,i)=>(
            <div key={i} style={{
              width:26, height:30, borderRadius:8,
              background:`${stage.color}18`,
              border:`1.5px dashed ${stage.color}33`,
              display:"flex",alignItems:"center",justifyContent:"center",
              fontSize:12,
            }}>?</div>
          ))}
        </div>
      </div>
    );
  };

  return (
    <div
      style={{position:"fixed",inset:0,zIndex:9990,background:"rgba(0,0,0,0.5)",
        display:"flex",alignItems:"center",justifyContent:"center",padding:"16px"}}
      onClick={onClose}
    >
      <div
        onClick={e=>e.stopPropagation()}
        style={{background:"#fff",borderRadius:28,width:"100%",maxWidth:460,
          maxHeight:"calc(100vh - 48px)",display:"flex",flexDirection:"column",
          boxShadow:"0 24px 64px rgba(0,0,0,0.22)",
          animation:"shopScaleIn 0.28s cubic-bezier(0.34,1.4,0.64,1)"}}
      >
        <style>{`@keyframes shopScaleIn{from{opacity:0;transform:scale(0.93)}to{opacity:1;transform:scale(1)}}`}</style>

        {/* ── Header ── */}
        <div style={{padding:"22px 20px 0",flexShrink:0}}>
          <div style={{display:"flex",alignItems:"center",justifyContent:"space-between",marginBottom:4}}>
            <div>
              <p style={{fontFamily:"'Baloo 2',cursive",fontWeight:900,fontSize:20,color:C.text,margin:0}}>
                Garden Shop 🪴
              </p>
              <div style={{display:"flex",alignItems:"center",gap:6,marginTop:2,flexWrap:"wrap"}}>
                <span style={{fontSize:13}}>🌱</span>
                <span style={{fontFamily:"'Poppins',sans-serif",fontWeight:700,fontSize:13,color:C.purple}}>
                  {availableSeeds} seeds
                </span>
                <span style={{fontFamily:"'Poppins',sans-serif",fontWeight:600,fontSize:12,color:C.muted}}>
                  · Stage {currentStageId}: {STAGE_SHOP_META[currentStageId].name}
                </span>
                {ownedIds.length > 0 && (
                  <span style={{fontFamily:"'Poppins',sans-serif",fontWeight:600,fontSize:12,color:C.mint}}>
                    · {ownedIds.length}/70 planted
                  </span>
                )}
              </div>
            </div>
            <button onClick={onClose}
              style={{background:"#f5f5f5",border:"none",borderRadius:"50%",
                width:34,height:34,cursor:"pointer",fontSize:17,
                display:"flex",alignItems:"center",justifyContent:"center",
                color:"#666",flexShrink:0}}>✕</button>
          </div>

          {/* Live garden preview */}
          <GardenPreview ownedIds={ownedIds} stageId={currentStageId}/>

          {/* Tab switcher */}
          <div style={{display:"flex",background:"#F0EBF8",borderRadius:14,padding:3,marginBottom:16}}>
            {[
              {id:"shop",   label:"🛒 Shop",     badge: affordableCount || null},
              {id:"garden", label:"🌻 My Garden", badge: ownedItems.length || null},
            ].map(t=>(
              <button key={t.id}
                onClick={()=>{ setPanelTab(t.id); setSelectedId(null); }}
                style={{
                  flex:1,border:"none",borderRadius:11,padding:"9px 6px",cursor:"pointer",
                  transition:"all 0.2s",
                  background:panelTab===t.id?"#fff":"transparent",
                  boxShadow:panelTab===t.id?"0 2px 8px rgba(124,77,255,0.14)":"none",
                  fontFamily:"'Poppins',sans-serif",fontWeight:700,fontSize:13,
                  color:panelTab===t.id?C.purple:C.muted,
                  display:"flex",alignItems:"center",justifyContent:"center",gap:6,
                }}>
                {t.label}
                {t.badge != null && t.badge > 0 && (
                  <span style={{background:panelTab===t.id?C.purple:C.muted,color:"#fff",
                    borderRadius:50,padding:"0 6px",fontSize:10,fontWeight:900,lineHeight:"16px"}}>
                    {t.badge}
                  </span>
                )}
              </button>
            ))}
          </div>
        </div>

        {/* ── Scrollable content ── */}
        <div style={{flex:1,overflowY:"auto",padding:"0 20px 110px"}}>

          {/* ── SHOP TAB ── */}
          {panelTab === "shop" && (
            <>
              {itemsByStage.map(({ stage, items }) => {
                const isLocked   = stage.id > currentStageId;
                const unownedItems = items.filter(i => !ownedIds.includes(i.id));
                if (unownedItems.length === 0 && !isLocked) return null; // all purchased, skip

                if (isLocked) {
                  return <LockedStageCard key={stage.id} stage={stage}/>;
                }

                return (
                  <div key={stage.id}>
                    {/* Stage header */}
                    <div style={{display:"flex",alignItems:"center",gap:8,marginBottom:10}}>
                      <div style={{
                        background:stage.bg, borderRadius:50, padding:"3px 12px",
                        display:"flex",alignItems:"center",gap:5,
                      }}>
                        <span style={{fontFamily:"'Poppins',sans-serif",fontWeight:700,
                          fontSize:11,color:stage.color}}>
                          ✦ {stage.name} items
                        </span>
                      </div>
                      {unownedItems.length < items.length && (
                        <span style={{fontFamily:"'Poppins',sans-serif",fontWeight:600,fontSize:11,color:C.mint}}>
                          {items.length - unownedItems.length}/{items.length} planted
                        </span>
                      )}
                    </div>
                    <div style={{display:"grid",gridTemplateColumns:"1fr 1fr 1fr",gap:8,marginBottom:20}}>
                      {unownedItems.map(item => <ShopItemCard key={item.id} item={item}/>)}
                    </div>
                  </div>
                );
              })}

              {/* All current items purchased */}
              {GARDEN_ITEMS.filter(i => i.stageUnlock <= currentStageId && !ownedIds.includes(i.id)).length === 0 && currentStageId < 6 && (
                <div style={{textAlign:"center",padding:"20px 20px 0"}}>
                  <p style={{fontSize:32,marginBottom:8}}>🌸</p>
                  <p style={{fontFamily:"'Baloo 2',cursive",fontWeight:800,fontSize:16,color:C.text,margin:"0 0 6px"}}>
                    All available items planted!
                  </p>
                  <p style={{fontFamily:"'Poppins',sans-serif",fontWeight:500,fontSize:13,color:C.muted,margin:0,lineHeight:1.6}}>
                    Keep earning seeds to reach {STAGE_SHOP_META[currentStageId+1].name} and unlock 10 more!
                  </p>
                </div>
              )}
              {GARDEN_ITEMS.filter(i => !ownedIds.includes(i.id)).length === 0 && (
                <div style={{textAlign:"center",padding:"20px 20px 0"}}>
                  <p style={{fontSize:40,marginBottom:8}}>🏆</p>
                  <p style={{fontFamily:"'Baloo 2',cursive",fontWeight:800,fontSize:18,color:C.text,margin:"0 0 6px"}}>
                    Garden complete!
                  </p>
                  <p style={{fontFamily:"'Poppins',sans-serif",fontWeight:500,fontSize:14,color:C.muted,margin:0,lineHeight:1.6}}>
                    You've collected all 70 garden items. Truly legendary! 🌟
                  </p>
                </div>
              )}
            </>
          )}

          {/* ── MY GARDEN TAB ── */}
          {panelTab === "garden" && (
            <>
              {ownedItems.length === 0 ? (
                <div style={{textAlign:"center",padding:"32px 20px"}}>
                  <p style={{fontSize:40,marginBottom:12}}>🌱</p>
                  <p style={{fontFamily:"'Baloo 2',cursive",fontWeight:800,fontSize:18,color:C.text,margin:"0 0 6px"}}>
                    Nothing planted yet!
                  </p>
                  <p style={{fontFamily:"'Poppins',sans-serif",fontWeight:500,fontSize:14,color:C.muted,margin:0,lineHeight:1.6}}>
                    Head to the Shop tab and spend your seeds to start building your garden!
                  </p>
                </div>
              ) : (
                <>
                  <p style={{fontFamily:"'Poppins',sans-serif",fontWeight:500,fontSize:13,color:C.muted,
                    margin:"0 0 14px",textAlign:"center",lineHeight:1.6}}>
                    {ownedItems.length} of 70 items planted in your garden 🌿
                  </p>
                  {/* Group by stage */}
                  {itemsByStage.map(({ stage, items }) => {
                    const planted = items.filter(i => ownedIds.includes(i.id));
                    if (planted.length === 0) return null;
                    return (
                      <div key={stage.id}>
                        <div style={{display:"flex",alignItems:"center",gap:8,marginBottom:10}}>
                          <div style={{background:stage.bg,borderRadius:50,padding:"3px 12px"}}>
                            <span style={{fontFamily:"'Poppins',sans-serif",fontWeight:700,fontSize:11,color:stage.color}}>
                              ✦ {stage.name}
                            </span>
                          </div>
                        </div>
                        <div style={{display:"grid",gridTemplateColumns:"1fr 1fr 1fr",gap:8,marginBottom:20}}>
                          {planted.map(item => <OwnedItemCard key={item.id} item={item}/>)}
                        </div>
                      </div>
                    );
                  })}
                </>
              )}
            </>
          )}
        </div>

        {/* ── Sticky buy confirm bar ── */}
        {panelTab === "shop" && selected && (
          <div style={{borderTop:`1.5px solid ${C.border}`,padding:"12px 20px 20px",
            flexShrink:0,background:"#fff",borderRadius:"0 0 28px 28px",
            boxShadow:"0 -4px 20px rgba(0,0,0,0.06)"}}>
            <p style={{fontFamily:"'Poppins',sans-serif",fontWeight:500,fontSize:11,
              color:C.muted,margin:"0 0 10px",textAlign:"center"}}>
              This will be permanently planted in your garden 🌱
            </p>
            <div style={{display:"flex",alignItems:"center",gap:14}}>
              <div style={{background:`${selected.color}18`,borderRadius:14,width:64,height:64,
                flexShrink:0,display:"flex",alignItems:"flex-end",justifyContent:"center",overflow:"hidden"}}>
                <svg viewBox="0 0 64 64" width={64} height={64} style={{overflow:"visible"}}>
                  <GardenItemSVG id={selected.id} cx={32} groundY={56} scale={0.44} w={64} h={64} idx={0}/>
                </svg>
              </div>
              <div style={{flex:1,minWidth:0}}>
                <p style={{fontFamily:"'Baloo 2',cursive",fontWeight:800,fontSize:16,
                  color:C.text,margin:0,lineHeight:1.2}}>{selected.label}</p>
                <p style={{fontFamily:"'Poppins',sans-serif",fontWeight:500,fontSize:12,
                  color:C.muted,margin:"2px 0 0"}}>{selected.desc}</p>
              </div>
              <button
                onClick={handleBuy}
                disabled={buying || availableSeeds < selected.cost}
                style={{background:buying?`${C.purple}88`:`linear-gradient(135deg,${C.purple},#9C6FFF)`,
                  border:"none",borderRadius:14,padding:"12px 18px",cursor:"pointer",
                  display:"flex",alignItems:"center",gap:7,
                  boxShadow:`0 4px 16px ${C.purple}40`,transition:"all 0.15s",flexShrink:0}}>
                {buying ? (
                  <span style={{fontFamily:"'Poppins',sans-serif",fontWeight:700,fontSize:13,color:"#fff"}}>
                    🌱 Planting…
                  </span>
                ) : (
                  <>
                    <span style={{fontSize:13}}>🌱</span>
                    <span style={{fontFamily:"'Baloo 2',cursive",fontWeight:900,fontSize:14,color:"#fff"}}>
                      Plant for {selected.cost}
                    </span>
                  </>
                )}
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

const StageEvolution = ({ currentScore, mascotId, stageId }) => {
  const topRow = STAGES.slice(0, 4);
  const botRow = STAGES.slice(4, 7);
  const StageCell = ({ stage, i }) => {
    const unlocked = currentScore >= stage.minScore;
    return (
      <div style={{flex:1,textAlign:"center",opacity:unlocked?1:0.35,transition:"opacity 0.4s"}}>
        <div style={{
          background:unlocked?stage.bg:"#f5f5f5",
          borderRadius:12,
          border:`2px solid ${unlocked?stage.color:"#eee"}`,
          marginBottom:4,
          aspectRatio:"1",
          display:"flex",alignItems:"center",justifyContent:"center",
          overflow:"hidden",
          position:"relative",
        }}>
          <div style={{overflow:"hidden", width:34, height:34, display:"flex", alignItems:"center", justifyContent:"center"}}>
            <FullBodyMascot id={mascotId} size={50} stage={stage.id} energyTier={0}/>
          </div>
          {unlocked&&(
            <div style={{position:"absolute",bottom:2,right:2,
              width:8,height:8,borderRadius:"50%",background:stage.color}}/>
          )}
        </div>
        <p style={{fontFamily:F.h,fontWeight:800,fontSize:8,
          color:unlocked?stage.color:C.muted,margin:0,lineHeight:1.2,
          whiteSpace:"nowrap",overflow:"hidden",textOverflow:"ellipsis"}}>
          {stage.name.split(" ")[0]}
        </p>
        {!unlocked&&<p style={{fontFamily:F.b,fontWeight:500,fontSize:7,
          color:C.muted,margin:0}}>{stage.minScore}🌱</p>}
      </div>
    );
  };
  return (
    <div style={{background:"#fff",borderRadius:20,padding:"18px 16px",
      boxShadow:"0 2px 18px rgba(124,77,255,0.09)",marginBottom:14}}>
      <p style={{fontFamily:F.b,fontWeight:700,fontSize:12,color:C.muted,
        letterSpacing:1.2,textTransform:"uppercase",margin:"0 0 14px"}}>Growth Journey</p>
      {/* Top row — 4 stages */}
      <div style={{display:"flex",gap:8,marginBottom:8}}>
        {topRow.map((stage,i)=><StageCell key={stage.id} stage={stage} i={i}/>)}
      </div>
      {/* Bottom row — 3 stages, centered */}
      <div style={{display:"flex",gap:8,justifyContent:"center"}}>
        {botRow.map((stage,i)=>(
          <div key={stage.id} style={{flex:"0 0 calc(25% - 6px)"}}>
            <StageCell stage={stage} i={i+4}/>
          </div>
        ))}
      </div>
    </div>
  );
};

/* ══════════════════════════════════════════════
   MAIN EXPORT — renders as a full page screen
   (not an overlay — parent controls navigation)
══════════════════════════════════════════════ */
export default function MascotRoom({ activeChild, moodLog, journals, gratitudes, growthScore, supabase, setActiveChild, setChildren, onClose }) {
  const cm = {
    id:    activeChild.mascot_id,
    name:  activeChild.mascot_name,
    color: activeChild.mascot_color,
    bg:    activeChild.mascot_bg,
  };
  const personality   = PERSONALITIES[cm.id]||PERSONALITIES.fox;
  const score         = growthScore || calcGrowthScore(activeChild, moodLog, journals);
  const stage         = getStage(score);
  const activityTier  = getActivityTier(moodLog, activeChild);
  const lastEntry     = moodLog?.length>0 ? moodLog[moodLog.length-1] : null;
  const lastMood      = lastEntry?.mood||null;
  const lastMoodDate  = lastEntry?.date||null;
  const mascotState   = getMascotState(lastMoodDate, lastMood);
  const daysAway      = daysSince(lastMoodDate);
  const joinedDate    = activeChild.created_at?.split("T")[0]||null;
  const daysTogether  = joinedDate
    ? Math.max(0,Math.floor((new Date(todayStr())-new Date(joinedDate))/(1000*60*60*24)))
    : 0;
  const topMood = moodLog.length>0
    ? Object.entries(moodLog.reduce((a,e)=>({...a,[e.mood]:(a[e.mood]||0)+1}),{}))
        .sort((a,b)=>b[1]-a[1])[0][0]
    : null;

  const [speech,setSpeech]           = useState(null);
  const [tapAnim,setTapAnim]         = useState("float");
  const [sparkles,setSparkles]       = useState([]);
  const [tapCount,setTapCount]       = useState(0);
  const [showStats,setShowStats]     = useState(false);
  const [showEvolution,setShowEvolution] = useState(false);
  const [wateringScene,setWateringScene] = useState(false); // controls garden watering overlay
  const tapT   = useRef(null);
  const animT  = useRef(null);
  const sparkT = useRef(null);

  useEffect(()=>()=>{
    clearTimeout(tapT.current);
    clearTimeout(animT.current);
    clearTimeout(sparkT.current);
  },[]);

  useEffect(()=>{
    const t = setTimeout(()=>{
      if (daysAway>=2)             setSpeech(randomFrom(SPEECH.away));
      else if (lastMood==="Sad")   setSpeech(randomFrom(SPEECH.sad));
      else if (lastMood==="Worried") setSpeech(randomFrom(SPEECH.worried));
      else if (lastMood==="Angry") setSpeech(randomFrom(SPEECH.angry));
      else                         setSpeech(randomFrom(SPEECH.happy));
    },700);
    return ()=>clearTimeout(t);
  // eslint-disable-next-line react-hooks/exhaustive-deps
  },[]);

  const dismissSpeech = useCallback(()=>setSpeech(null),[]);

  /* ── Tap milestone animation system ── */
  const [hearts, setHearts]       = useState([]);
  const [starBursts, setStarBursts] = useState([]);
  const [tapLabel, setTapLabel]   = useState(null);
  const heartsT = useRef(null);
  const starsT  = useRef(null);
  const labelT  = useRef(null);

  useEffect(()=>()=>{
    clearTimeout(tapT.current);
    clearTimeout(animT.current);
    clearTimeout(sparkT.current);
    clearTimeout(heartsT.current);
    clearTimeout(starsT.current);
    clearTimeout(labelT.current);
  },[]);

  const showHearts = (count=5) => {
    const h = Array.from({length:count},(_,i)=>({
      id:Date.now()+i,
      x:60+Math.random()*90,
      delay:i*0.12,
      color:["#F48FB1","#EC407A","#FF7043","#CE93D8","#FFD54F"][i%5],
    }));
    setHearts(h);
    clearTimeout(heartsT.current);
    heartsT.current = setTimeout(()=>setHearts([]),1400);
  };

  const showStars = (count=6) => {
    const s = Array.from({length:count},(_,i)=>({
      id:Date.now()+i+100,
      x:20+Math.random()*160,
      y:20+Math.random()*120,
      delay:i*0.08,
      color:["#FFD54F","#7C4DFF","#F06292","#4FC3F7","#66BB6A","#FF7043"][i%6],
    }));
    setStarBursts(s);
    clearTimeout(starsT.current);
    starsT.current = setTimeout(()=>setStarBursts([]),1200);
  };

  const showTapLabel = (text) => {
    setTapLabel(text);
    clearTimeout(labelT.current);
    labelT.current = setTimeout(()=>setTapLabel(null),1200);
  };

  const handleTap = () => {
    // Cycle resets after 8 so it stays fun without going too far
    const cycle = (tapCount % 8) + 1;
    setTapCount(tapCount + 1);

    /* One animation per tap in the cycle */
    const CYCLE_ANIMS = ["bounce","wiggle","spin","bounce","cheer","wiggle","spin","superBounce"];
    const anim = CYCLE_ANIMS[cycle - 1];
    setTapAnim(anim);
    clearTimeout(animT.current);
    const dur = anim === "superBounce" ? 900 : anim === "cheer" ? 700 : 580;
    animT.current = setTimeout(() => setTapAnim("float"), dur);

    /* Sparkles — scale with tap number in cycle */
    const sparkCount = cycle >= 8 ? 14 : cycle >= 5 ? 10 : 7;
    const sp = Array.from({length: sparkCount}, (_, i) => ({
      id: Date.now() + i,
      x: 20 + Math.random() * 160,
      y: 10 + Math.random() * 180,
      color: [C.purple,C.pink,C.yellow,C.mint,C.sky,C.coral,"#fff","#FFD54F","#CE93D8","#FF7043"][i % 10],
      delay: i * 0.04,
    }));
    setSparkles(sp);
    clearTimeout(sparkT.current);
    sparkT.current = setTimeout(() => setSparkles([]), 1100);

    /* Per-tap extras */
    if (cycle === 1) { showTapLabel(`Hi! 👋`); }
    if (cycle === 2) { showHearts(4); }
    if (cycle === 3) { showStars(5); showTapLabel("Wheee! 😄"); }
    if (cycle === 5) { showHearts(6); showStars(5); showTapLabel("You're the best! ⭐"); }
    if (cycle === 7) { showStars(6); }
    if (cycle === 8) { showHearts(8); showStars(8); showTapLabel("LEGENDARY! 👑✨"); }

    /* Speech */
    clearTimeout(tapT.current);
    tapT.current = setTimeout(() => {
      if      (cycle === 3) setSpeech(SPEECH.funny3);
      else if (cycle === 6) setSpeech(SPEECH.funny6);
      else if (cycle === 8) setSpeech("You're my absolute favourite person! 👑💜");
      else if (lastMood === "Sad")     setSpeech(randomFrom(SPEECH.sad));
      else if (lastMood === "Worried") setSpeech(randomFrom(SPEECH.worried));
      else if (lastMood === "Angry")   setSpeech(randomFrom(SPEECH.angry));
      else setSpeech(randomFrom([...SPEECH.happy, ...SPEECH.general]));
    }, 120);
  };

  /* ── Bg and animation by state ── */
  const bgGrad = {
    happy:   `linear-gradient(170deg,${cm.color}55 0%,${C.pink}22 60%,${C.bg} 100%)`,
    droopy:  `linear-gradient(170deg,#B0BEC544 0%,#CFD8DC22 60%,${C.bg} 100%)`,
    away:    `linear-gradient(170deg,${C.purple}33 0%,${C.mint}22 60%,${C.bg} 100%)`,
    sad:     `linear-gradient(170deg,#7B1FA233 0%,#9C27B022 60%,${C.bg} 100%)`,
    worried: `linear-gradient(170deg,#E64A1933 0%,#FF704322 60%,${C.bg} 100%)`,
    angry:   `linear-gradient(170deg,#E5393533 0%,#FF526222 60%,${C.bg} 100%)`,
  }[mascotState]||`linear-gradient(170deg,${cm.color}55 0%,${C.pink}22 60%,${C.bg} 100%)`;

  const mascotAnim = {
    float:       "floatMascot 3s ease-in-out infinite",
    bounce:      "bounce 0.55s cubic-bezier(0.34,1.4,0.64,1) forwards",
    wiggle:      "wiggle 0.5s ease forwards",
    spin:        "spin 0.65s ease forwards",
    cheer:       "cheer 0.7s ease forwards",
    dance:       "dance 0.9s ease-in-out forwards",
    superBounce: "superBounce 0.9s cubic-bezier(0.34,1.56,0.64,1) forwards",
    shimmy:      "shimmy 0.6s ease forwards",
    droop:       "droop 2.5s ease-in-out infinite",
  }[mascotState==="droopy" ? "droop" : tapAnim] || "floatMascot 3s ease-in-out infinite";

  /* ── This renders as a standard page, no fixed overlay ── */
  return (
    <div style={{
      minHeight:"100vh",
      background:C.bg,
      fontFamily:F.b,
      paddingBottom:80,
    }}>
      <FontLoader/>

      {/* ══ HERO SECTION — garden is the background, scrolls with content ══ */}
      <div style={{position:"relative", overflow:"hidden", paddingBottom:32}}>

        {/* Garden fills the hero section as background */}
        <div style={{
          position:"absolute", top:0, left:0, right:0, bottom:0, zIndex:1,
        }}>
          <GardenScene
            stage={stage.id}
            mascotId={null}
            size={500}
            dark={false}
            showMascot={false}
            gardenItems={Object.keys(activeChild.seen_tooltips?.shop_unlocks || {})}
          />
          {/* Fade to app bg at bottom so cards transition cleanly */}
          <div style={{
            position:"absolute", bottom:0, left:0, right:0, height:"50%",
            background:`linear-gradient(to bottom, transparent, ${C.bg} 100%)`,
          }}/>
        </div>

        {/* Watering can overlay — plays over garden when watering */}
        <WateringOverlay active={wateringScene}/>

        {/* Content sits above the garden */}
        {/* Fixed back button — always visible even when scrolled */}
        <button onClick={onClose} style={{
          position:"fixed", top:20, left:20, zIndex:999,
          background:"rgba(255,255,255,0.92)", border:`1.5px solid ${C.border}`,
          borderRadius:50, padding:"8px 16px", cursor:"pointer",
          display:"flex", alignItems:"center", gap:6,
          color:C.muted, fontFamily:F.b, fontWeight:600, fontSize:14,
          boxShadow:"0 2px 12px rgba(0,0,0,0.12)",
          backdropFilter:"blur(8px)",
        }}>
          <svg viewBox="0 0 24 24" width={16} height={16} fill="none"
            stroke={C.muted} strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
            <path d="M19 12H5M12 5l-7 7 7 7"/>
          </svg>
          Back
        </button>

        <div style={{position:"relative", zIndex:2}}>

          {/* Header */}
          <div style={{
            display:"flex",justifyContent:"space-between",alignItems:"center",
            padding:"52px 24px 16px",
          }}>
            <div style={{width:80}}/>
            <h2 style={{fontFamily:F.h,fontSize:22,fontWeight:900,color:C.text,margin:0,
              textShadow:"0 2px 8px rgba(255,255,255,0.9)"}}>
              {cm.name}'s Garden
            </h2>
            <div style={{display:"flex",alignItems:"center",gap:4,
              background:"rgba(255,255,255,0.88)",borderRadius:50,
              padding:"5px 12px",boxShadow:"0 2px 8px rgba(0,0,0,0.08)"}}>
              <span style={{fontSize:12}}>{["🌱","🌿","🌸","🦋","✨","🌠","👑"][stage.id]}</span>
              <p style={{fontFamily:F.b,fontWeight:700,fontSize:11,color:stage.color,margin:0}}>
                {score} seeds
              </p>
            </div>
          </div>

          {/* ── MASCOT — floats over garden ── */}
          <div style={{
            display:"flex",flexDirection:"column",alignItems:"center",
            paddingTop:8,paddingBottom:0,
            minHeight:300,
          }}>
            {speech && (
              <div style={{marginBottom:8,width:"80%",display:"flex",justifyContent:"center"}}>
                <SpeechBubble text={speech} onDone={dismissSpeech}/>
              </div>
            )}

            <div
              onClick={handleTap}
              style={{
                display:"inline-block",cursor:"pointer",
                userSelect:"none",animation:mascotAnim,
                filter:`drop-shadow(0 16px 32px ${cm.color}77)`,
                position:"relative",
              }}>
              <FullBodyMascot id={cm.id} size={210} stage={stage.id} energyTier={activityTier}/>
              {/* Regular sparkles */}
              {sparkles.map(sp=>(
                <Sparkle key={sp.id} x={sp.x} y={sp.y} color={sp.color} delay={sp.delay}/>
              ))}
              {/* Heart particles */}
              {hearts.map(h=>(
                <div key={h.id} style={{
                  position:"absolute", left:h.x, top:60,
                  animation:`heartFloat 1.3s ${h.delay}s ease-out forwards`,
                  pointerEvents:"none", fontSize:20, lineHeight:1,
                  filter:`drop-shadow(0 2px 4px ${h.color}88)`,
                }}>💜</div>
              ))}
              {/* Star bursts */}
              {starBursts.map(s=>(
                <div key={s.id} style={{
                  position:"absolute", left:s.x, top:s.y,
                  animation:`starBurst 1.1s ${s.delay}s ease-out forwards`,
                  pointerEvents:"none",
                }}>
                  <svg width="18" height="18" viewBox="0 0 24 24">
                    <polygon points="12,2 15,9 22,9 17,14 19,21 12,17 5,21 7,14 2,9 9,9"
                      fill={s.color} opacity="0.9"/>
                  </svg>
                </div>
              ))}
              {/* Milestone tap label */}
              {tapLabel && (
                <div style={{
                  position:"absolute", left:"50%", top:-24,
                  transform:"translateX(-50%)",
                  background:"rgba(255,255,255,0.95)",
                  borderRadius:50, padding:"5px 14px",
                  fontFamily:F.h, fontWeight:900, fontSize:14,
                  color:C.purple, whiteSpace:"nowrap",
                  boxShadow:`0 4px 16px ${C.purple}44`,
                  animation:"bubblePop 0.3s ease forwards",
                  pointerEvents:"none",
                }}>{tapLabel}</div>
              )}
            </div>

            <div style={{
              width:110,height:14,borderRadius:"50%",
              background:"rgba(0,0,0,0.1)",
              marginTop:-10,
              animation:"groundShadow 3s ease-in-out infinite",
            }}/>

            <div style={{marginTop:10}}>
              {mascotState==="droopy" ? (
                <div style={{background:"rgba(238,233,255,0.92)",borderRadius:50,
                  padding:"5px 16px",backdropFilter:"blur(4px)"}}>
                  <p style={{fontFamily:F.b,fontSize:12,fontWeight:700,
                    color:C.purple,margin:0,animation:"pulse 2s infinite"}}>
                    {cm.name} misses you — tap to say hi! 💜
                  </p>
                </div>
              ) : (
                <p style={{fontFamily:F.b,fontWeight:600,fontSize:12,
                  color:"rgba(60,40,80,0.85)",margin:0,
                  textShadow:"0 1px 4px rgba(255,255,255,0.7)"}}>
                  Tap {cm.name} to say hi! 👋
                </p>
              )}
            </div>
          </div>

        </div>{/* end zIndex:2 */}
      </div>{/* end hero section */}

      {/* ── Cards section — normal background, scrolls below hero ── */}
      <div style={{padding:"0 24px",maxWidth:430,margin:"0 auto"}}>

        {/* Stage strip */}
        <div style={{textAlign:"center",marginBottom:16,marginTop:4}}>
          <div style={{display:"inline-flex",alignItems:"center",gap:6,
            background:stage.bg,borderRadius:50,
            padding:"6px 18px",boxShadow:`0 2px 12px ${stage.color}33`}}>
            <span style={{fontSize:14}}>{["🌱","🌿","🌸","🦋","✨","🌠","👑"][stage.id]}</span>
            <p style={{fontFamily:F.b,fontWeight:700,fontSize:13,color:stage.color,margin:0}}>
              {stage.name}
            </p>
            <p style={{fontFamily:F.b,fontWeight:500,fontSize:12,color:C.muted,margin:0}}>
              {["Plant your first seed!","Keep checking in!","Flowers are blooming!",
                "Butterflies are visiting!","Your garden glows!","Fireflies are dancing!",
                "Full Bloom achieved!"][stage.id]}
            </p>
          </div>
        </div>

        {/* State / mood message */}
        {mascotState==="droopy"&&(
          <div style={{background:"#EEE9FF",borderRadius:20,padding:"14px 18px",
            marginBottom:14,textAlign:"center",animation:"fadeInUp 0.4s ease"}}>
            <p style={{fontFamily:F.h,fontWeight:800,fontSize:16,
              color:C.purple,margin:"0 0 4px"}}>{cm.name} missed you!</p>
            <p style={{fontFamily:F.b,fontWeight:500,fontSize:14,
              color:C.muted,margin:0,lineHeight:1.6}}>
              You haven't checked in for {daysAway} day{daysAway!==1?"s":""}. {cm.name} misses you!
            </p>
          </div>
        )}
        {lastMood&&lastMoodDate===todayStr()&&(
          <div style={{
            background:["Sad","Worried","Angry"].includes(lastMood)?"#EDE7F6":"#E8F5E9",
            borderRadius:20,padding:"14px 18px",marginBottom:14,
            textAlign:"center",animation:"fadeInUp 0.4s ease",
          }}>
            <p style={{fontFamily:F.h,fontWeight:800,fontSize:16,
              color:["Sad","Worried","Angry"].includes(lastMood)?C.purple:"#43A047",
              margin:"0 0 4px"}}>
              {cm.name} knows how you feel today!
            </p>
            <p style={{fontFamily:F.b,fontWeight:500,fontSize:14,
              color:"#555",margin:0,lineHeight:1.6}}>
              You logged feeling <strong>{lastMood}</strong>.{" "}
              {["Sad","Worried","Angry"].includes(lastMood)
                ?`${cm.name} is right here with you.`
                :`${cm.name} is so happy for you!`}
            </p>
          </div>
        )}

        {/* Action tabs — water + shop side by side */}
        <ActionTabs
          mascotId={cm.id}
          stageId={stage.id}
          mascotName={cm.name}
          mascotColor={cm.color}
          moodLog={moodLog}
          score={score}
          activityTier={activityTier}
          activeChild={activeChild}
          growthScore={score}
          supabase={supabase}
          setActiveChild={setActiveChild}
          setChildren={setChildren}
          onWater={()=>{
            if (wateringScene) return;
            setWateringScene(true);
            // Mascot does a happy cheer while being watered
            setTapAnim("cheer");
            setTimeout(()=>setTapAnim("float"), 700);
            setTimeout(()=>setWateringScene(false), 2900);
          }}
        />

        {/* Personality */}
        <div style={{background:`linear-gradient(135deg,${cm.color},${C.pink})`,
          borderRadius:20,padding:"20px",marginBottom:14}}>
          <p style={{fontFamily:F.b,fontWeight:700,fontSize:12,
            color:"rgba(255,255,255,0.7)",letterSpacing:1.2,
            textTransform:"uppercase",margin:"0 0 8px"}}>Personality</p>
          <p style={{fontFamily:F.h,fontWeight:800,fontSize:20,
            color:"#fff",margin:"0 0 4px"}}>{personality.trait}</p>
          <p style={{fontFamily:F.b,fontWeight:500,fontSize:14,
            color:"rgba(255,255,255,0.85)",margin:0}}>Loves: {personality.loves}</p>
        </div>
        <button onClick={()=>setShowStats(s=>!s)} style={{
          width:"100%",background:"#fff",
          borderRadius:showStats?"20px 20px 0 0":20,
          padding:"18px 20px",border:`1.5px solid ${C.border}`,
          marginBottom:0,cursor:"pointer",
          display:"flex",justifyContent:"space-between",alignItems:"center",
          boxShadow:"0 2px 18px rgba(124,77,255,0.09)",transition:"border-radius 0.2s",
        }}>
          <p style={{fontFamily:F.h,fontWeight:800,fontSize:18,color:C.text,margin:0}}>
            Our Journey
          </p>
          <svg viewBox="0 0 24 24" width={20} height={20} fill="none"
            stroke={C.muted} strokeWidth="2.2" strokeLinecap="round"
            style={{transform:showStats?"rotate(180deg)":"none",transition:"transform 0.3s"}}>
            <path d="M6 9l6 6 6-6"/>
          </svg>
        </button>

        {showStats&&(
          <div style={{background:"#fff",borderRadius:"0 0 20px 20px",
            padding:"4px 20px 20px",
            boxShadow:"0 4px 18px rgba(124,77,255,0.09)",
            marginBottom:14,animation:"scaleIn 0.25s ease"}}>
            {[
              {label:"Days together",      value:`${daysTogether}d`,             color:C.purple},
              {label:"Mood check-ins",     value:moodLog.length,                 color:C.mint},
              {label:"Journal entries",    value:journals.length,                color:C.pink},
              {label:"Breathing sessions", value:activeChild.breath_sessions||0, color:C.sky},
              {label:"Affirmations read",  value:activeChild.affirm_count||0,    color:C.coral},
              {label:"Growth points",      value:score,                          color:C.yellow},
              {label:"Favourite mood",     value:topMood||"None yet",            color:C.purple},
            ].map((s,i,arr)=>(
              <div key={s.label} style={{display:"flex",justifyContent:"space-between",
                alignItems:"center",padding:"10px 0",
                borderBottom:i<arr.length-1?"1px solid #F0EAFF":"none"}}>
                <p style={{fontFamily:F.b,fontWeight:600,fontSize:15,color:C.text,margin:0}}>
                  {s.label}
                </p>
                <p style={{fontFamily:F.h,fontWeight:900,fontSize:20,color:s.color,margin:0}}>
                  {s.value}
                </p>
              </div>
            ))}
          </div>
        )}

        {/* Growth Stages */}
        <button onClick={()=>setShowEvolution(s=>!s)} style={{
          width:"100%",background:"#fff",
          borderRadius:showEvolution?"20px 20px 0 0":20,
          padding:"18px 20px",border:`1.5px solid ${C.border}`,
          marginBottom:0,cursor:"pointer",marginTop:showStats?0:14,
          display:"flex",justifyContent:"space-between",alignItems:"center",
          boxShadow:"0 2px 18px rgba(124,77,255,0.09)",transition:"border-radius 0.2s",
        }}>
          <p style={{fontFamily:F.h,fontWeight:800,fontSize:18,color:C.text,margin:0}}>
            Growth Stages
          </p>
          <svg viewBox="0 0 24 24" width={20} height={20} fill="none"
            stroke={C.muted} strokeWidth="2.2" strokeLinecap="round"
            style={{transform:showEvolution?"rotate(180deg)":"none",transition:"transform 0.3s"}}>
            <path d="M6 9l6 6 6-6"/>
          </svg>
        </button>

        {showEvolution&&(
          <div style={{animation:"scaleIn 0.25s ease",marginBottom:14}}>
            <StageEvolution currentScore={score} mascotId={cm.id} stageId={stage.id}/>
          </div>
        )}

        {/* Did you know */}
        <div style={{background:"rgba(247,244,255,0.95)",borderRadius:20,padding:"18px 20px",
          border:`1.5px solid ${C.border}`,marginTop:14,
          backdropFilter:"blur(8px)"}}>
          <p style={{fontFamily:F.b,fontWeight:700,fontSize:12,color:C.muted,
            letterSpacing:1.2,textTransform:"uppercase",margin:"0 0 8px"}}>Did you know?</p>
          <p style={{fontFamily:F.b,fontWeight:500,fontSize:14,
            color:C.text,margin:0,lineHeight:1.75}}>
            {cm.name} grows stronger every time you check in.
            The more you share your feelings, the more you both bloom together!
          </p>
        </div>
      </div>{/* end cards padding div */}
    </div>
  );
}
