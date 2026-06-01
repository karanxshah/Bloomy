import { useState, useEffect, useRef, useCallback } from "react";
import { GrowthMascot, GardenScene, calcGrowthScore, getStage, STAGES } from "./MascotGrowth";

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
    @keyframes bounce      { 0%,100%{transform:scale(1) translateY(0)} 30%{transform:scale(1.15) translateY(-20px)} 60%{transform:scale(0.95) translateY(0)} }
    @keyframes wiggle      { 0%,100%{transform:rotate(0deg)} 25%{transform:rotate(-14deg)} 75%{transform:rotate(14deg)} }
    @keyframes sparkleIn   { 0%{opacity:0;transform:scale(0) rotate(0deg)} 60%{opacity:1;transform:scale(1.3) rotate(180deg)} 100%{opacity:0;transform:scale(0) rotate(360deg)} }
    @keyframes fadeInUp    { from{opacity:0;transform:translateY(16px)} to{opacity:1;transform:translateY(0)} }
    @keyframes scaleIn     { from{opacity:0;transform:scale(0.9)} to{opacity:1;transform:scale(1)} }
    @keyframes bubblePop   { 0%{opacity:0;transform:scale(0.7) translateY(8px)} 70%{transform:scale(1.05)} 100%{opacity:1;transform:scale(1) translateY(0)} }
    @keyframes pulse       { 0%,100%{opacity:1} 50%{opacity:0.4} }
    @keyframes droop       { 0%,100%{transform:translateY(0)} 50%{transform:translateY(8px)} }
    @keyframes groundShadow { 0%,100%{transform:scaleX(1);opacity:0.18} 50%{transform:scaleX(0.7);opacity:0.08} }
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

/* ── Garden items — plants and decorations the child places in their garden ── */
const GARDEN_ITEMS = [
  /* Flowers */
  { id:"g_sunflower",  type:"flower",  label:"Sunflower",        cost:8,  emoji:"🌻", desc:"A big cheerful sunflower",       color:"#FFD54F", size:"lg" },
  { id:"g_rose",       type:"flower",  label:"Red Rose",         cost:8,  emoji:"🌹", desc:"A classic ruby-red rose",        color:"#E53935", size:"md" },
  { id:"g_tulip",      type:"flower",  label:"Purple Tulip",     cost:10, emoji:"🌷", desc:"A tall elegant tulip",           color:"#CE93D8", size:"md" },
  { id:"g_daisy",      type:"flower",  label:"Daisy Patch",      cost:10, emoji:"🌼", desc:"Three daisies side by side",     color:"#FFF9C4", size:"sm" },
  { id:"g_bluebell",   type:"flower",  label:"Bluebells",        cost:12, emoji:"💙", desc:"Delicate nodding bluebells",     color:"#4FC3F7", size:"sm" },
  { id:"g_cherry",     type:"tree",    label:"Cherry Blossom",   cost:20, emoji:"🌸", desc:"A beautiful flowering tree",     color:"#F8BBD0", size:"xl" },
  /* Trees & plants */
  { id:"g_cactus",     type:"plant",   label:"Friendly Cactus",  cost:12, emoji:"🌵", desc:"A cute little cactus",           color:"#66BB6A", size:"md" },
  { id:"g_bamboo",     type:"plant",   label:"Bamboo Stalks",    cost:15, emoji:"🎋", desc:"Tall swaying bamboo",            color:"#43A047", size:"lg" },
  { id:"g_mushroom",   type:"plant",   label:"Magic Mushrooms",  cost:12, emoji:"🍄", desc:"Red-cap mushroom friends",       color:"#EF5350", size:"sm" },
  { id:"g_fern",       type:"plant",   label:"Curly Fern",       cost:10, emoji:"🌿", desc:"A lush green fern",              color:"#388E3C", size:"md" },
  /* Decorations */
  { id:"g_butterfly",  type:"deco",    label:"Butterfly",        cost:15, emoji:"🦋", desc:"A colourful visiting butterfly",  color:"#CE93D8", size:"sm" },
  { id:"g_ladybug",    type:"deco",    label:"Ladybug",          cost:12, emoji:"🐞", desc:"A lucky little ladybug",         color:"#E53935", size:"sm" },
  { id:"g_beehive",    type:"deco",    label:"Beehive",          cost:18, emoji:"🐝", desc:"A busy golden beehive",          color:"#FFD54F", size:"md" },
  { id:"g_birdbath",   type:"deco",    label:"Bird Bath",        cost:20, emoji:"🐦", desc:"Birds love to splash here!",     color:"#4FC3F7", size:"md" },
  { id:"g_rainbow",    type:"deco",    label:"Mini Rainbow",     cost:25, emoji:"🌈", desc:"A little arc of colour",         color:"#FF7043", size:"lg" },
  { id:"g_gnome",      type:"deco",    label:"Garden Gnome",     cost:20, emoji:"🧙", desc:"A cheerful garden keeper",       color:"#FF7043", size:"md" },
  /* Special */
  { id:"g_fountain",   type:"special", label:"Wishing Fountain", cost:30, emoji:"⛲", desc:"A magical wishing fountain",     color:"#4FC3F7", size:"xl" },
  { id:"g_windmill",   type:"special", label:"Windmill",         cost:35, emoji:"🌀", desc:"A spinning pastel windmill",     color:"#CE93D8", size:"xl" },
  { id:"g_treehouse",  type:"special", label:"Tree House",       cost:40, emoji:"🏡", desc:"A cosy home in the treetops",    color:"#8D6E63", size:"xl" },
  { id:"g_fireflies",  type:"special", label:"Firefly Jar",      cost:30, emoji:"✨", desc:"Tiny glowing lights at dusk",    color:"#FFD54F", size:"sm" },
];

/* ── Action Tabs — watering can + shop, side by side ── */
const ActionTabs = ({ mascotId, stageId, mascotName, moodLog, score, activityTier=0,
  activeChild, growthScore, supabase, setActiveChild, setChildren }) => {

  const [watering, setWatering]   = useState(false);
  const [drops, setDrops]         = useState([]);
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
    const newDrops = Array.from({ length: 6 }, (_, i) => ({
      id: Date.now() + i,
      x: 28 + i * 8,
      delay: i * 80,
    }));
    setTimeout(() => setDrops(newDrops), 100);
    setTimeout(() => setDrops([]), 900);
    setTimeout(() => {
      setMsg(WATER_MESSAGES[Math.floor(Math.random() * WATER_MESSAGES.length)]);
    }, 600);
    setTimeout(() => {
      setWatering(false);
      setTimeout(() => setMsg(null), 1200);
    }, 1500);
  };

  const vibe = activityTier===0 ? { label:"Thriving 🌟" }
             : activityTier===1 ? { label:"Doing well 🌿" }
             : activityTier===2 ? { label:"Could use love 💜" }
             :                    { label:"Missing you 🥺" };

  return (
    <>
      <style>{`
        @keyframes dropFall {
          0%   { opacity:1; transform:translateY(0) scaleY(1); }
          80%  { opacity:0.7; transform:translateY(28px) scaleY(1.2); }
          100% { opacity:0; transform:translateY(38px) scaleY(0.5); }
        }
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
            flex:1, borderRadius:20, padding:"22px 12px", cursor:"pointer",
            border:"none", textAlign:"center", transition:"transform 0.15s",
            background: watering
              ? "linear-gradient(135deg,#29B6F6,#0288D1)"
              : "linear-gradient(135deg,#4FC3F7,#039BE5)",
            boxShadow: watering
              ? "0 6px 20px rgba(2,136,209,0.5)"
              : "0 4px 16px rgba(79,195,247,0.4)",
            minHeight:150, display:"flex", flexDirection:"column",
            alignItems:"center", justifyContent:"center", gap:10,
            position:"relative", overflow:"hidden",
          }}
          onMouseDown={e=>e.currentTarget.style.transform="scale(0.97)"}
          onMouseUp={e=>e.currentTarget.style.transform="scale(1)"}>

          {drops.map(d=>(
            <div key={d.id} style={{
              position:"absolute", top:"30%", left: d.x+"%",
              animation:`dropFall 0.55s ease ${d.delay}ms forwards`,
              pointerEvents:"none",
            }}>
              <svg width="8" height="14" viewBox="0 0 8 14">
                <path d="M4 0 Q8 6 4 13 Q0 6 4 0Z" fill="rgba(255,255,255,0.7)"/>
              </svg>
            </div>
          ))}
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
          <svg width="52" height="52" viewBox="0 0 64 64" fill="none">
            <ellipse cx="22" cy="36" rx="16" ry="12" fill="rgba(255,255,255,0.92)" stroke="rgba(255,255,255,0.6)" strokeWidth="2"/>
            <path d="M 6 36 Q 4 52 10 54 L 34 54 Q 40 52 38 36" fill="rgba(255,255,255,0.75)" stroke="rgba(255,255,255,0.6)" strokeWidth="1.8"/>
            <path d="M 38 32 Q 52 26 58 22" stroke="rgba(255,255,255,0.9)" strokeWidth="3.5" strokeLinecap="round"/>
            <circle cx="58" cy="21" r="4" fill="#B3E5FC" stroke="rgba(255,255,255,0.8)" strokeWidth="1.5"/>
            <path d="M 22 24 Q 16 10 22 4" stroke="rgba(255,255,255,0.85)" strokeWidth="3" strokeLinecap="round"/>
            <ellipse cx="22" cy="4" rx="5" ry="3" fill="rgba(255,255,255,0.8)"/>
            <circle cx="54" cy="26" r="1.5" fill="#B3E5FC" opacity="0.9"/>
            <circle cx="57" cy="24" r="1.5" fill="#B3E5FC" opacity="0.9"/>
            <circle cx="60" cy="23" r="1.5" fill="#B3E5FC" opacity="0.9"/>
          </svg>
          <p style={{fontFamily:F.h, fontWeight:800, fontSize:14, color:"#fff", margin:0}}>
            Water {mascotName}
          </p>
          <div style={{display:"flex", alignItems:"center", gap:5,
            background:"rgba(255,255,255,0.2)", borderRadius:50, padding:"3px 10px"}}>
            <div style={{width:7, height:7, borderRadius:"50%", background:"#fff"}}/>
            <span style={{fontFamily:F.b, fontWeight:700, fontSize:11, color:"#fff"}}>
              {vibe.label}
            </span>
          </div>
        </button>

        {/* ── Shop Tab ── */}
        <button
          onClick={()=>setShowShop(true)}
          style={{
            flex:1, borderRadius:20, padding:"22px 12px", cursor:"pointer",
            border:`1.5px solid ${C.border}`, background:"#fff",
            display:"flex", flexDirection:"column", alignItems:"center",
            justifyContent:"center", gap:10, textAlign:"center",
            transition:"transform 0.15s", minHeight:150,
            boxShadow:"0 2px 18px rgba(124,77,255,0.08)",
          }}
          onMouseDown={e=>e.currentTarget.style.transform="scale(0.97)"}
          onMouseUp={e=>e.currentTarget.style.transform="scale(1)"}>
          <div style={{position:"relative", display:"inline-block"}}>
            {({
              fox:   <svg width="60" height="60" viewBox="0 0 80 80"><ellipse cx="40" cy="46" rx="28" ry="24" fill="#FF8A65"/><polygon points="13,18 26,44 38,24" fill="#FF7043"/><polygon points="67,18 54,44 42,24" fill="#FF7043"/><ellipse cx="40" cy="50" rx="16" ry="11" fill="#FFCCBC"/><circle cx="30" cy="41" r="5" fill="#fff"/><circle cx="50" cy="41" r="5" fill="#fff"/><circle cx="31" cy="42" r="2.5" fill="#1a1a2e"/><circle cx="51" cy="42" r="2.5" fill="#1a1a2e"/><circle cx="32" cy="40.5" r="1.2" fill="#fff"/><circle cx="52" cy="40.5" r="1.2" fill="#fff"/></svg>,
              bunny: <svg width="60" height="60" viewBox="0 0 80 80"><ellipse cx="27" cy="20" rx="7" ry="17" fill="#F8BBD0"/><ellipse cx="53" cy="20" rx="7" ry="17" fill="#F8BBD0"/><ellipse cx="40" cy="50" rx="26" ry="22" fill="#FCE4EC"/><circle cx="30" cy="46" r="5" fill="#fff"/><circle cx="50" cy="46" r="5" fill="#fff"/><circle cx="31" cy="47" r="2.5" fill="#1a1a2e"/><circle cx="51" cy="47" r="2.5" fill="#1a1a2e"/><circle cx="32" cy="45.5" r="1.2" fill="#fff"/><circle cx="52" cy="45.5" r="1.2" fill="#fff"/></svg>,
              bear:  <svg width="60" height="60" viewBox="0 0 80 80"><circle cx="20" cy="25" r="13" fill="#A1887F"/><circle cx="60" cy="25" r="13" fill="#A1887F"/><ellipse cx="40" cy="50" rx="27" ry="23" fill="#8D6E63"/><circle cx="29" cy="45" r="5.5" fill="#fff"/><circle cx="51" cy="45" r="5.5" fill="#fff"/><circle cx="30" cy="46" r="2.8" fill="#1a1a2e"/><circle cx="52" cy="46" r="2.8" fill="#1a1a2e"/><circle cx="31" cy="44.5" r="1.3" fill="#fff"/><circle cx="53" cy="44.5" r="1.3" fill="#fff"/></svg>,
              owl:   <svg width="60" height="60" viewBox="0 0 80 80"><ellipse cx="40" cy="48" rx="26" ry="26" fill="#7E57C2"/><ellipse cx="22" cy="24" rx="7" ry="9" fill="#7E57C2"/><ellipse cx="58" cy="24" rx="7" ry="9" fill="#7E57C2"/><circle cx="29" cy="43" r="9" fill="#D1C4E9"/><circle cx="51" cy="43" r="9" fill="#D1C4E9"/><circle cx="29" cy="44" r="5" fill="#4527A0"/><circle cx="51" cy="44" r="5" fill="#4527A0"/><circle cx="30" cy="42.5" r="2" fill="#fff"/><circle cx="52" cy="42.5" r="2" fill="#fff"/></svg>,
              cat:   <svg width="60" height="60" viewBox="0 0 80 80"><polygon points="17,30 12,10 30,26" fill="#26A69A"/><polygon points="63,30 68,10 50,26" fill="#26A69A"/><ellipse cx="40" cy="50" rx="26" ry="23" fill="#4DB6AC"/><circle cx="29" cy="45" r="5.5" fill="#fff"/><circle cx="51" cy="45" r="5.5" fill="#fff"/><circle cx="30" cy="46" r="2.8" fill="#1a1a2e"/><circle cx="52" cy="46" r="2.8" fill="#1a1a2e"/><circle cx="31" cy="44.5" r="1.3" fill="#fff"/><circle cx="53" cy="44.5" r="1.3" fill="#fff"/></svg>,
              dog:   <svg width="60" height="60" viewBox="0 0 80 80"><ellipse cx="16" cy="36" rx="9" ry="16" fill="#FFA726" transform="rotate(-20 16 36)"/><ellipse cx="64" cy="36" rx="9" ry="16" fill="#FFA726" transform="rotate(20 64 36)"/><ellipse cx="40" cy="50" rx="27" ry="23" fill="#FFB74D"/><circle cx="29" cy="45" r="5.5" fill="#fff"/><circle cx="51" cy="45" r="5.5" fill="#fff"/><circle cx="30" cy="46" r="2.8" fill="#1a1a2e"/><circle cx="52" cy="46" r="2.8" fill="#1a1a2e"/><circle cx="31" cy="44.5" r="1.3" fill="#fff"/><circle cx="53" cy="44.5" r="1.3" fill="#fff"/></svg>,
            })[mascotId] || null}
            <div style={{
              position:"absolute", bottom:-4, right:-8,
              background:`linear-gradient(135deg,${C.purple},#9C6FFF)`,
              borderRadius:"50%", width:26, height:26,
              display:"flex", alignItems:"center", justifyContent:"center",
              boxShadow:"0 2px 8px rgba(124,77,255,0.45)",
            }}>
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none"
                stroke="#fff" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                <path d="M6 2L3 6v14a2 2 0 002 2h14a2 2 0 002-2V6l-3-4z"/>
                <line x1="3" y1="6" x2="21" y2="6"/>
                <path d="M16 10a4 4 0 01-8 0"/>
              </svg>
            </div>
          </div>
          <div style={{display:"flex", alignItems:"center", gap:5,
            background:`${C.purple}15`, borderRadius:50, padding:"3px 10px"}}>
            <span style={{fontSize:12}}>🌱</span>
            <span style={{fontFamily:F.b, fontWeight:700, fontSize:11, color:C.purple}}>
              {score} seeds
            </span>
          </div>
          <p style={{fontFamily:F.h, fontWeight:800, fontSize:14, color:C.text, margin:0}}>
            Garden Shop
          </p>
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

/* ════════════════════════════════
   GARDEN SHOP PANEL
   Two tabs: "Shop" (browse & buy plants/deco) and "My Garden" (see what's planted)
   Items are permanently planted — no equip/unequip, just collect & grow.
════════════════════════════════ */
const CATEGORY_LABELS = {
  flower:  "🌸 Flowers",
  tree:    "🌳 Trees",
  plant:   "🌿 Plants",
  deco:    "🎀 Decorations",
  special: "⭐ Special",
};

/* Mini garden preview strip showing owned items as emoji */
const GardenPreview = ({ ownedIds, stageId }) => {
  const stageBgs = ["#E8F5E9","#E0F2F1","#EDE7F6","#FFF3E0","#FFF9C4","#FCE4EC","#FFFDE7"];
  const bg = stageBgs[stageId] || stageBgs[0];
  const items = GARDEN_ITEMS.filter(i => ownedIds.includes(i.id));

  const positions = items.map((item) => {
    const hash = item.id.split("").reduce((a,c)=>a+c.charCodeAt(0),0);
    const col  = hash % 7;
    const row  = Math.floor((hash * 13) % 3);
    return { left:`${5 + col * 13}%`, bottom:`${8 + row * 24}%` };
  });

  return (
    <div style={{
      background: bg,
      borderRadius:16, height:88, position:"relative",
      overflow:"hidden", border:"1.5px solid rgba(0,0,0,0.06)", marginBottom:14,
    }}>
      <div style={{position:"absolute",inset:0,
        background:"linear-gradient(to bottom,rgba(135,206,235,0.3) 0%,transparent 55%)"}}/>
      <div style={{position:"absolute",bottom:0,left:0,right:0,height:24,
        background:"linear-gradient(to top,#6DB96D,#81C784)",borderRadius:"0 0 14px 14px"}}/>
      {items.length === 0 ? (
        <div style={{position:"absolute",inset:0,display:"flex",
          alignItems:"center",justifyContent:"center"}}>
          <p style={{fontFamily:"'Poppins',sans-serif",fontWeight:600,fontSize:12,
            color:"#9B8DB5",margin:0}}>Your garden is waiting… 🌱</p>
        </div>
      ) : (
        positions.map((pos, i) => (
          <div key={items[i].id} style={{
            position:"absolute", left:pos.left, bottom:pos.bottom,
            fontSize: items[i].size==="xl" ? 22 : items[i].size==="lg" ? 18 : items[i].size==="sm" ? 13 : 16,
            lineHeight:1, filter:"drop-shadow(0 1px 2px rgba(0,0,0,0.12))",
          }}>
            {items[i].emoji}
          </div>
        ))
      )}
    </div>
  );
};

const ShopPanel = ({ activeChild, growthScore, supabase, setActiveChild, setChildren, onClose }) => {
  const unlocks        = activeChild.seen_tooltips?.shop_unlocks || {};
  const ownedIds       = Object.keys(unlocks);
  const spentSeeds     = Object.values(unlocks).reduce((a,v)=>a+(v?.cost||0), 0);
  const availableSeeds = Math.max(0, growthScore - spentSeeds);
  const stageId        = Math.min(6, [0,15,35,70,120,180,260].findLastIndex(m => growthScore >= m));

  const [panelTab,   setPanelTab]   = useState("shop");
  const [selectedId, setSelectedId] = useState(null);
  const [buying,     setBuying]     = useState(false);
  const [successId,  setSuccessId]  = useState(null);

  const ownedItems = GARDEN_ITEMS.filter(i => ownedIds.includes(i.id));
  const shopItems  = GARDEN_ITEMS.filter(i => !ownedIds.includes(i.id));
  const selected   = GARDEN_ITEMS.find(i => i.id === selectedId) || null;

  const handleBuy = async () => {
    if (!selected || availableSeeds < selected.cost || buying) return;
    setBuying(true);
    const newUnlocks  = { ...unlocks, [selected.id]: { cost: selected.cost, at: Date.now() } };
    const newTooltips = { ...(activeChild.seen_tooltips||{}), shop_unlocks: newUnlocks };
    const updates     = { seen_tooltips: newTooltips };
    const { error } = await supabase.from("children").update(updates).eq("id", activeChild.id);
    if (!error) {
      setActiveChild(prev => ({ ...prev, seen_tooltips: newTooltips }));
      setChildren(cs => cs.map(c => c.id===activeChild.id ? {...c, seen_tooltips: newTooltips} : c));
      setSuccessId(selected.id);
      setTimeout(() => setSuccessId(null), 2400);
    }
    setBuying(false);
    setSelectedId(null);
  };

  const categories = ["flower","tree","plant","deco","special"];

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
          borderRadius:16, padding:"14px 8px",
          cursor: canAfford ? "pointer" : "default",
          textAlign:"center", transition:"all 0.18s",
          position:"relative",
          opacity: !canAfford ? 0.46 : 1,
          boxShadow: isSelected ? `0 4px 14px ${C.purple}28` : "none",
          transform: isSelected ? "scale(1.03)" : "scale(1)",
        }}
      >
        {isSelected && (
          <div style={{position:"absolute",top:6,right:6,background:C.purple,
            borderRadius:"50%",width:17,height:17,display:"flex",
            alignItems:"center",justifyContent:"center"}}>
            <span style={{color:"#fff",fontSize:9,fontWeight:900}}>✓</span>
          </div>
        )}
        <div style={{fontSize:26,marginBottom:6,filter:`drop-shadow(0 2px 3px ${item.color}55)`}}>
          {item.emoji}
        </div>
        <p style={{fontFamily:"'Baloo 2',cursive",fontWeight:800,fontSize:11,
          color:C.text,margin:"0 0 2px",lineHeight:1.2}}>{item.label}</p>
        <p style={{fontFamily:"'Poppins',sans-serif",fontWeight:500,fontSize:10,
          color:C.muted,margin:"0 0 6px",lineHeight:1.3}}>{item.desc}</p>
        {isSuccess ? (
          <p style={{fontFamily:"'Poppins',sans-serif",fontWeight:700,fontSize:11,color:C.mint,margin:0}}>
            Planted! 🎉
          </p>
        ) : (
          <div style={{display:"inline-flex",alignItems:"center",gap:3,
            background:canAfford ? "#EDE7F6" : "#f3f3f3",borderRadius:50,padding:"2px 8px"}}>
            <span style={{fontSize:11}}>🌱</span>
            <span style={{fontFamily:"'Poppins',sans-serif",fontWeight:700,fontSize:11,
              color:canAfford ? C.purple : "#bbb"}}>{item.cost}</span>
          </div>
        )}
      </button>
    );
  };

  const OwnedItemCard = ({ item }) => (
    <div style={{
      background:`${item.color}14`,
      border:`2px solid ${item.color}44`,
      borderRadius:16, padding:"14px 8px", textAlign:"center", position:"relative",
    }}>
      <div style={{position:"absolute",top:6,right:6,background:C.mint,
        borderRadius:"50%",width:17,height:17,display:"flex",
        alignItems:"center",justifyContent:"center"}}>
        <span style={{color:"#fff",fontSize:9,fontWeight:900}}>✓</span>
      </div>
      <div style={{fontSize:26,marginBottom:6,filter:`drop-shadow(0 2px 3px ${item.color}55)`}}>
        {item.emoji}
      </div>
      <p style={{fontFamily:"'Baloo 2',cursive",fontWeight:800,fontSize:11,
        color:C.text,margin:"0 0 2px",lineHeight:1.2}}>{item.label}</p>
      <p style={{fontFamily:"'Poppins',sans-serif",fontWeight:600,fontSize:10,
        color:C.mint,margin:0}}>Planted ✓</p>
    </div>
  );

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

        {/* Header */}
        <div style={{padding:"22px 20px 0",flexShrink:0}}>
          <div style={{display:"flex",alignItems:"center",justifyContent:"space-between",marginBottom:4}}>
            <div>
              <p style={{fontFamily:"'Baloo 2',cursive",fontWeight:900,fontSize:20,color:C.text,margin:0}}>
                Garden Shop 🪴
              </p>
              <div style={{display:"flex",alignItems:"center",gap:6,marginTop:2}}>
                <span style={{fontSize:13}}>🌱</span>
                <span style={{fontFamily:"'Poppins',sans-serif",fontWeight:700,fontSize:13,color:C.purple}}>
                  {availableSeeds} seeds to spend
                </span>
                {ownedIds.length > 0 && (
                  <span style={{fontFamily:"'Poppins',sans-serif",fontWeight:600,fontSize:12,color:C.muted}}>
                    · {ownedIds.length} planted
                  </span>
                )}
              </div>
            </div>
            <button onClick={onClose}
              style={{background:"#f5f5f5",border:"none",borderRadius:"50%",
                width:34,height:34,cursor:"pointer",fontSize:17,
                display:"flex",alignItems:"center",justifyContent:"center",
                color:"#666",flexShrink:0}}>
              ✕
            </button>
          </div>

          {/* Live garden preview */}
          <GardenPreview ownedIds={ownedIds} stageId={stageId}/>

          {/* Tab switcher */}
          <div style={{display:"flex",background:"#F0EBF8",borderRadius:14,padding:3,marginBottom:16}}>
            {[
              {id:"shop",   label:"🛒 Shop",     badge: shopItems.filter(i=>availableSeeds>=i.cost).length || null},
              {id:"garden", label:"🌻 My Garden", badge: ownedItems.length || null},
            ].map(t=>(
              <button key={t.id}
                onClick={()=>{ setPanelTab(t.id); setSelectedId(null); }}
                style={{
                  flex:1, border:"none", borderRadius:11, padding:"9px 6px",
                  cursor:"pointer", transition:"all 0.2s",
                  background: panelTab===t.id ? "#fff" : "transparent",
                  boxShadow: panelTab===t.id ? "0 2px 8px rgba(124,77,255,0.14)" : "none",
                  fontFamily:"'Poppins',sans-serif", fontWeight:700, fontSize:13,
                  color: panelTab===t.id ? C.purple : C.muted,
                  display:"flex",alignItems:"center",justifyContent:"center",gap:6,
                }}>
                {t.label}
                {t.badge != null && t.badge > 0 && (
                  <span style={{background: panelTab===t.id ? C.purple : C.muted,
                    color:"#fff",borderRadius:50,padding:"0 6px",
                    fontSize:10,fontWeight:900,lineHeight:"16px"}}>{t.badge}</span>
                )}
              </button>
            ))}
          </div>
        </div>

        {/* Scrollable content */}
        <div style={{flex:1,overflowY:"auto",padding:"0 20px 110px"}}>

          {panelTab === "shop" && (
            <>
              {shopItems.length === 0 ? (
                <div style={{textAlign:"center",padding:"32px 20px"}}>
                  <p style={{fontSize:40,marginBottom:12}}>🌸</p>
                  <p style={{fontFamily:"'Baloo 2',cursive",fontWeight:800,fontSize:18,color:C.text,margin:"0 0 6px"}}>
                    Garden complete!
                  </p>
                  <p style={{fontFamily:"'Poppins',sans-serif",fontWeight:500,fontSize:14,color:C.muted,margin:0,lineHeight:1.6}}>
                    You've collected every plant and decoration. Your garden is truly magical! 🌟
                  </p>
                </div>
              ) : (
                categories.map(cat => {
                  const catItems = shopItems.filter(i => i.type === cat);
                  if (catItems.length === 0) return null;
                  return (
                    <div key={cat}>
                      <p style={{fontFamily:"'Poppins',sans-serif",fontWeight:700,fontSize:11,color:C.muted,
                        letterSpacing:1.2,textTransform:"uppercase",margin:"4px 0 10px"}}>
                        {CATEGORY_LABELS[cat]}
                      </p>
                      <div style={{display:"grid",gridTemplateColumns:"1fr 1fr 1fr",gap:8,marginBottom:18}}>
                        {catItems.map(item => <ShopItemCard key={item.id} item={item}/>)}
                      </div>
                    </div>
                  );
                })
              )}
            </>
          )}

          {panelTab === "garden" && (
            <>
              {ownedItems.length === 0 ? (
                <div style={{textAlign:"center",padding:"32px 20px"}}>
                  <p style={{fontSize:40,marginBottom:12}}>🌱</p>
                  <p style={{fontFamily:"'Baloo 2',cursive",fontWeight:800,fontSize:18,color:C.text,margin:"0 0 6px"}}>
                    Nothing planted yet!
                  </p>
                  <p style={{fontFamily:"'Poppins',sans-serif",fontWeight:500,fontSize:14,color:C.muted,margin:0,lineHeight:1.6}}>
                    Visit the Shop tab and spend your seeds to add plants and decorations to your garden!
                  </p>
                </div>
              ) : (
                <>
                  <p style={{fontFamily:"'Poppins',sans-serif",fontWeight:500,fontSize:13,color:C.muted,
                    margin:"0 0 14px",textAlign:"center",lineHeight:1.6}}>
                    Everything here lives in your garden above! 🌿
                  </p>
                  {categories.map(cat => {
                    const catItems = ownedItems.filter(i => i.type === cat);
                    if (catItems.length === 0) return null;
                    return (
                      <div key={cat}>
                        <p style={{fontFamily:"'Poppins',sans-serif",fontWeight:700,fontSize:11,color:C.muted,
                          letterSpacing:1.2,textTransform:"uppercase",margin:"4px 0 10px"}}>
                          {CATEGORY_LABELS[cat]}
                        </p>
                        <div style={{display:"grid",gridTemplateColumns:"1fr 1fr 1fr",gap:8,marginBottom:18}}>
                          {catItems.map(item => <OwnedItemCard key={item.id} item={item}/>)}
                        </div>
                      </div>
                    );
                  })}
                </>
              )}
            </>
          )}
        </div>

        {/* Sticky buy confirm bar */}
        {panelTab === "shop" && selected && (
          <div style={{borderTop:`1.5px solid ${C.border}`,
            padding:"12px 20px 20px",flexShrink:0,background:"#fff",
            borderRadius:"0 0 28px 28px",boxShadow:"0 -4px 20px rgba(0,0,0,0.06)"}}>
            <p style={{fontFamily:"'Poppins',sans-serif",fontWeight:500,fontSize:11,
              color:C.muted,margin:"0 0 10px",textAlign:"center"}}>
              This will be permanently planted in your garden 🌱
            </p>
            <div style={{display:"flex",alignItems:"center",gap:14}}>
              <div style={{background:`${selected.color}18`,borderRadius:14,width:52,height:52,
                flexShrink:0,display:"flex",alignItems:"center",justifyContent:"center",fontSize:26}}>
                {selected.emoji}
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
                style={{background: buying ? `${C.purple}88` : `linear-gradient(135deg,${C.purple},#9C6FFF)`,
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

/* ── Stage evolution ── */
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

  const handleTap = () => {
    const n = tapCount+1;
    setTapCount(n);
    const anims=["bounce","wiggle","bounce","wiggle","bounce"];
    setTapAnim(anims[n%anims.length]);
    clearTimeout(animT.current);
    animT.current = setTimeout(()=>setTapAnim("float"),520);
    const sp = Array.from({length:8},(_,i)=>({
      id:Date.now()+i,
      x:30+Math.random()*140,
      y:10+Math.random()*160,
      color:[C.purple,C.pink,C.yellow,C.mint,C.sky,C.coral,"#fff","#FFD54F"][i],
      delay:i*0.05,
    }));
    setSparkles(sp);
    clearTimeout(sparkT.current);
    sparkT.current = setTimeout(()=>setSparkles([]),1000);
    clearTimeout(tapT.current);
    tapT.current = setTimeout(()=>{
      if (n===3)            setSpeech(SPEECH.funny3);
      else if (n===6)       setSpeech(SPEECH.funny6);
      else if (lastMood==="Sad")     setSpeech(randomFrom(SPEECH.sad));
      else if (lastMood==="Worried") setSpeech(randomFrom(SPEECH.worried));
      else if (lastMood==="Angry")   setSpeech(randomFrom(SPEECH.angry));
      else setSpeech(randomFrom([...SPEECH.happy,...SPEECH.general]));
    },120);
  };

  /* ── Bg by state ── */
  const bgGrad = {
    happy:   `linear-gradient(170deg,${cm.color}55 0%,${C.pink}22 60%,${C.bg} 100%)`,
    droopy:  `linear-gradient(170deg,#B0BEC544 0%,#CFD8DC22 60%,${C.bg} 100%)`,
    away:    `linear-gradient(170deg,${C.purple}33 0%,${C.mint}22 60%,${C.bg} 100%)`,
    sad:     `linear-gradient(170deg,#7B1FA233 0%,#9C27B022 60%,${C.bg} 100%)`,
    worried: `linear-gradient(170deg,#E64A1933 0%,#FF704322 60%,${C.bg} 100%)`,
    angry:   `linear-gradient(170deg,#E5393533 0%,#FF526222 60%,${C.bg} 100%)`,
  }[mascotState]||`linear-gradient(170deg,${cm.color}55 0%,${C.pink}22 60%,${C.bg} 100%)`;

  const mascotAnim = {
    float:"floatMascot 3s ease-in-out infinite",
    bounce:"bounce 0.5s ease forwards",
    wiggle:"wiggle 0.4s ease forwards",
    droop:"droop 2.5s ease-in-out infinite",
  }[mascotState==="droopy"?"droop":tapAnim];

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
          />
          {/* Fade to app bg at bottom so cards transition cleanly */}
          <div style={{
            position:"absolute", bottom:0, left:0, right:0, height:"50%",
            background:`linear-gradient(to bottom, transparent, ${C.bg} 100%)`,
          }}/>
        </div>

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
              {sparkles.map(sp=>(
                <Sparkle key={sp.id} x={sp.x} y={sp.y} color={sp.color} delay={sp.delay}/>
              ))}
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
          moodLog={moodLog}
          score={score}
          activityTier={activityTier}
          activeChild={activeChild}
          growthScore={score}
          supabase={supabase}
          setActiveChild={setActiveChild}
          setChildren={setChildren}
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
