import { useState, useEffect, useRef, useCallback } from "react";
import { GrowthMascot, GardenScene, calcGrowthScore, getStage, STAGES } from "./MascotGrowth";

/* ── Activity-based expression tier ─────────────────────────────────
   Replaces the old energy bar. Driven by days active in the last 7.
   0 = thriving (5-7 days) → happy
   1 = good     (3-4 days) → content
   2 = low      (1-2 days) → tired
   3 = missing  (0 days)   → sad                                     */
export const getActivityTier = (moodLog) => {
  if (!moodLog || moodLog.length === 0) return 3;
  const sevenAgo = new Date();
  sevenAgo.setDate(sevenAgo.getDate() - 7);
  const activeDays = new Set(
    moodLog.filter(e => new Date(e.date) >= sevenAgo).map(e => e.date)
  ).size;
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

/* ── Shop items ── */
const SHOP_ITEMS = [
  /* Room backgrounds */
  { id:"bg_sunset",   type:"bg",  label:"Sunset Garden",   cost:15, value:"linear-gradient(160deg,#FFB347,#FF6B9D,#C77DFF)", emoji:"🌅" },
  { id:"bg_ocean",    type:"bg",  label:"Ocean Breeze",    cost:20, value:"linear-gradient(160deg,#00B4DB,#0083B0,#48C9B0)", emoji:"🌊" },
  { id:"bg_midnight", type:"bg",  label:"Midnight Stars",  cost:30, value:"linear-gradient(160deg,#1a1a2e,#16213e,#533483)", emoji:"🌙" },
  { id:"bg_meadow",   type:"bg",  label:"Sunny Meadow",    cost:25, value:"linear-gradient(160deg,#56ab2f,#a8e063,#FFD54F)", emoji:"🌻" },
  /* Jar colours */
  { id:"jar_gold",    type:"jar", label:"Golden Jar",      cost:10, value:"#FFD700", emoji:"✨" },
  { id:"jar_rose",    type:"jar", label:"Rose Jar",        cost:10, value:"#F06292", emoji:"🌸" },
  { id:"jar_midnight",type:"jar", label:"Midnight Jar",    cost:15, value:"#7C4DFF", emoji:"💜" },
  { id:"jar_mint",    type:"jar", label:"Mint Jar",        cost:15, value:"#4DB6AC", emoji:"🌿" },
];

/* ── Action Tabs — watering can + shop, side by side ── */
const ActionTabs = ({ mascotId, stageId, mascotName, moodLog, score, activityTier=0,
  activeChild, growthScore, supabase, setActiveChild, setChildren }) => {

  /* ── Watering state ── */
  const [watering, setWatering]   = useState(false);
  const [drops, setDrops]         = useState([]);
  const [mascotBounce, setMascotBounce] = useState(false);
  const [msg, setMsg]             = useState(null);

  /* ── Shop state ── */
  const [showShop, setShowShop]   = useState(false);

  const WATER_MESSAGES = [
    `${mascotName} loved that! 💧`,
    "Growing stronger! 🌱",
    "So refreshing! ✨",
    `Thank you! 🥰`,
    "Keep it up! 🌿",
  ];

  const handleWater = () => {
    if (watering) return;
    setWatering(true);

    // Spawn drops over the mascot
    const newDrops = Array.from({ length: 6 }, (_, i) => ({
      id: Date.now() + i,
      x: 28 + i * 8,
      delay: i * 80,
    }));
    setTimeout(() => setDrops(newDrops), 100);
    setTimeout(() => setDrops([]), 900);

    // Mascot bounce
    setTimeout(() => setMascotBounce(true), 500);
    setTimeout(() => setMascotBounce(false), 1100);

    // Message
    setTimeout(() => {
      setMsg(WATER_MESSAGES[Math.floor(Math.random() * WATER_MESSAGES.length)]);
    }, 600);

    // Reset
    setTimeout(() => {
      setWatering(false);
      setTimeout(() => setMsg(null), 1200);
    }, 1500);
  };

  /* Activity vibe for watering tab */
  const recentDates = [...new Set((moodLog||[]).map(e=>e.date))];
  const sevenAgo = new Date(); sevenAgo.setDate(sevenAgo.getDate()-7);
  const activeDays = recentDates.filter(d=>new Date(d)>=sevenAgo).length;
  const vibe = activeDays>=5 ? { label:"Thriving 🌟", color:"#43A047" }
             : activeDays>=3 ? { label:"Doing well 🌿", color:"#4DB6AC" }
             : activeDays>=1 ? { label:"Could use love 💜", color:"#CE93D8" }
             :                 { label:"Missing you 🥺",   color:"#EF5350" };


  return (
    <>
      <style>{`
        @keyframes canSweep { from{opacity:0} to{opacity:1} }
        @keyframes dropFall {
          0%   { opacity:1; transform:translateY(0) scaleY(1); }
          80%  { opacity:0.7; transform:translateY(28px) scaleY(1.2); }
          100% { opacity:0; transform:translateY(38px) scaleY(0.5); }
        }
        @keyframes mascotPop {
          0%,100%{transform:scale(1) translateY(0)}
          35%{transform:scale(1.22) translateY(-8px)}
          65%{transform:scale(0.95) translateY(2px)}
        }
        @keyframes msgPop {
          0%{opacity:0;transform:translateY(6px) scale(0.9)}
          20%{opacity:1;transform:translateY(0) scale(1)}
          80%{opacity:1;}
          100%{opacity:0;}
        }
      `}</style>

      <div style={{display:"flex", gap:12, marginBottom:14}}>

        {/* ── Watering Can Tab — solid blue button, just the can SVG ── */}
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
            minHeight:160, display:"flex", flexDirection:"column",
            alignItems:"center", justifyContent:"center", gap:10,
            position:"relative", overflow:"hidden",
          }}
          onMouseDown={e=>e.currentTarget.style.transform="scale(0.97)"}
          onMouseUp={e=>e.currentTarget.style.transform="scale(1)"}>

          {/* Ripple water drops when tapped */}
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

          {/* Floating message */}
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

          {/* Watering can SVG in white/light-blue — app colour scheme */}
          <svg width="56" height="56" viewBox="0 0 64 64" fill="none">
            <ellipse cx="22" cy="36" rx="16" ry="12" fill="rgba(255,255,255,0.92)" stroke="rgba(255,255,255,0.6)" strokeWidth="2"/>
            <path d="M 6 36 Q 4 52 10 54 L 34 54 Q 40 52 38 36" fill="rgba(255,255,255,0.75)" stroke="rgba(255,255,255,0.6)" strokeWidth="1.8"/>
            <path d="M 38 32 Q 52 26 58 22" stroke="rgba(255,255,255,0.9)" strokeWidth="3.5" strokeLinecap="round"/>
            <circle cx="58" cy="21" r="4" fill="#B3E5FC" stroke="rgba(255,255,255,0.8)" strokeWidth="1.5"/>
            <path d="M 22 24 Q 16 10 22 4" stroke="rgba(255,255,255,0.85)" strokeWidth="3" strokeLinecap="round"/>
            <ellipse cx="22" cy="4" rx="5" ry="3" fill="rgba(255,255,255,0.8)"/>
            {/* spout holes */}
            <circle cx="54" cy="26" r="1.5" fill="#B3E5FC" opacity="0.9"/>
            <circle cx="57" cy="24" r="1.5" fill="#B3E5FC" opacity="0.9"/>
            <circle cx="60" cy="23" r="1.5" fill="#B3E5FC" opacity="0.9"/>
          </svg>

          <p style={{fontFamily:F.h, fontWeight:800, fontSize:14, color:"#fff", margin:0}}>
            Water {mascotName}
          </p>

          {/* Activity vibe pill */}
          <div style={{display:"flex", alignItems:"center", gap:5,
            background:"rgba(255,255,255,0.2)", borderRadius:50, padding:"3px 10px"}}>
            <div style={{width:7, height:7, borderRadius:"50%", background:"#fff"}}/>
            <span style={{fontFamily:F.b, fontWeight:700, fontSize:11, color:"#fff"}}>
              {vibe.label}
            </span>
          </div>
        </button>

        {/* ── Shop Tab — static MascotFace + shopping bag ── */}
        <button
          onClick={()=>setShowShop(true)}
          style={{
            flex:1, borderRadius:20, padding:"22px 12px", cursor:"pointer",
            border:`1.5px solid ${C.border}`, background:"#fff",
            display:"flex", flexDirection:"column", alignItems:"center",
            justifyContent:"center", gap:10, textAlign:"center",
            transition:"transform 0.15s", minHeight:160,
            boxShadow:"0 2px 18px rgba(124,77,255,0.08)",
          }}
          onMouseDown={e=>e.currentTarget.style.transform="scale(0.97)"}
          onMouseUp={e=>e.currentTarget.style.transform="scale(1)"}>

          {/* Static MascotFace — always happy tier 0, simple face SVG */}
          <div style={{position:"relative", display:"inline-block"}}>
            {({
              fox:   <svg width="60" height="60" viewBox="0 0 80 80"><ellipse cx="40" cy="46" rx="28" ry="24" fill="#FF8A65"/><polygon points="13,18 26,44 38,24" fill="#FF7043"/><polygon points="67,18 54,44 42,24" fill="#FF7043"/><ellipse cx="40" cy="50" rx="16" ry="11" fill="#FFCCBC"/><circle cx="30" cy="41" r="5" fill="#fff"/><circle cx="50" cy="41" r="5" fill="#fff"/><circle cx="31" cy="42" r="2.5" fill="#1a1a2e"/><circle cx="51" cy="42" r="2.5" fill="#1a1a2e"/><circle cx="32" cy="40.5" r="1.2" fill="#fff"/><circle cx="52" cy="40.5" r="1.2" fill="#fff"/></svg>,
              bunny: <svg width="60" height="60" viewBox="0 0 80 80"><ellipse cx="27" cy="20" rx="7" ry="17" fill="#F8BBD0"/><ellipse cx="53" cy="20" rx="7" ry="17" fill="#F8BBD0"/><ellipse cx="40" cy="50" rx="26" ry="22" fill="#FCE4EC"/><circle cx="30" cy="46" r="5" fill="#fff"/><circle cx="50" cy="46" r="5" fill="#fff"/><circle cx="31" cy="47" r="2.5" fill="#1a1a2e"/><circle cx="51" cy="47" r="2.5" fill="#1a1a2e"/><circle cx="32" cy="45.5" r="1.2" fill="#fff"/><circle cx="52" cy="45.5" r="1.2" fill="#fff"/></svg>,
              bear:  <svg width="60" height="60" viewBox="0 0 80 80"><circle cx="20" cy="25" r="13" fill="#A1887F"/><circle cx="60" cy="25" r="13" fill="#A1887F"/><ellipse cx="40" cy="50" rx="27" ry="23" fill="#8D6E63"/><circle cx="29" cy="45" r="5.5" fill="#fff"/><circle cx="51" cy="45" r="5.5" fill="#fff"/><circle cx="30" cy="46" r="2.8" fill="#1a1a2e"/><circle cx="52" cy="46" r="2.8" fill="#1a1a2e"/><circle cx="31" cy="44.5" r="1.3" fill="#fff"/><circle cx="53" cy="44.5" r="1.3" fill="#fff"/></svg>,
              owl:   <svg width="60" height="60" viewBox="0 0 80 80"><ellipse cx="40" cy="48" rx="26" ry="26" fill="#7E57C2"/><ellipse cx="22" cy="24" rx="7" ry="9" fill="#7E57C2"/><ellipse cx="58" cy="24" rx="7" ry="9" fill="#7E57C2"/><circle cx="29" cy="43" r="9" fill="#D1C4E9"/><circle cx="51" cy="43" r="9" fill="#D1C4E9"/><circle cx="29" cy="44" r="5" fill="#4527A0"/><circle cx="51" cy="44" r="5" fill="#4527A0"/><circle cx="30" cy="42.5" r="2" fill="#fff"/><circle cx="52" cy="42.5" r="2" fill="#fff"/></svg>,
              cat:   <svg width="60" height="60" viewBox="0 0 80 80"><polygon points="17,30 12,10 30,26" fill="#26A69A"/><polygon points="63,30 68,10 50,26" fill="#26A69A"/><ellipse cx="40" cy="50" rx="26" ry="23" fill="#4DB6AC"/><circle cx="29" cy="45" r="5.5" fill="#fff"/><circle cx="51" cy="45" r="5.5" fill="#fff"/><circle cx="30" cy="46" r="2.8" fill="#1a1a2e"/><circle cx="52" cy="46" r="2.8" fill="#1a1a2e"/><circle cx="31" cy="44.5" r="1.3" fill="#fff"/><circle cx="53" cy="44.5" r="1.3" fill="#fff"/></svg>,
              dog:   <svg width="60" height="60" viewBox="0 0 80 80"><ellipse cx="16" cy="36" rx="9" ry="16" fill="#FFA726" transform="rotate(-20 16 36)"/><ellipse cx="64" cy="36" rx="9" ry="16" fill="#FFA726" transform="rotate(20 64 36)"/><ellipse cx="40" cy="50" rx="27" ry="23" fill="#FFB74D"/><circle cx="29" cy="45" r="5.5" fill="#fff"/><circle cx="51" cy="45" r="5.5" fill="#fff"/><circle cx="30" cy="46" r="2.8" fill="#1a1a2e"/><circle cx="52" cy="46" r="2.8" fill="#1a1a2e"/><circle cx="31" cy="44.5" r="1.3" fill="#fff"/><circle cx="53" cy="44.5" r="1.3" fill="#fff"/></svg>,
            })[mascotId] || null}

            {/* Shopping bag badge */}
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
            Mascot Shop
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
};

/* ── Shop Panel ── */
const ShopPanel = ({ activeChild, growthScore, supabase, setActiveChild, setChildren, onClose }) => {
  const unlocks = activeChild.seen_tooltips?.shop_unlocks || {};
  const equippedBg  = activeChild.mascot_bg || "";
  const equippedJar = activeChild.seen_tooltips?.jar_color || "#4DB6AC";
  const [buying, setBuying] = useState(null);
  const [confirm, setConfirm] = useState(null);

  const spentSeeds = Object.values(unlocks).reduce((a,v)=>a+(v?.cost||0), 0);
  const availableSeeds = Math.max(0, growthScore - spentSeeds);

  const buy = async (item) => {
    if (availableSeeds < item.cost) return;
    setBuying(item.id);
    const newUnlocks = { ...unlocks, [item.id]: { cost: item.cost, at: Date.now() } };
    const newTooltips = { ...(activeChild.seen_tooltips||{}), shop_unlocks: newUnlocks };
    const updates = { seen_tooltips: newTooltips };
    if (item.type === "bg")  updates.mascot_bg    = item.value;
    if (item.type === "jar") newTooltips.jar_color = item.value;
    const { error } = await supabase.from("children").update(updates).eq("id", activeChild.id);
    if (!error) {
      setActiveChild(prev => ({ ...prev, ...updates, seen_tooltips: newTooltips }));
      setChildren(cs => cs.map(c => c.id===activeChild.id ? {...c,...updates,seen_tooltips:newTooltips} : c));
    }
    setBuying(null);
    setConfirm(item.id);
    setTimeout(() => setConfirm(null), 1800);
  };

  const equip = async (item) => {
    const updates = {};
    const newTooltips = { ...(activeChild.seen_tooltips||{}) };
    if (item.type === "bg")  updates.mascot_bg = item.value;
    if (item.type === "jar") newTooltips.jar_color = item.value;
    updates.seen_tooltips = newTooltips;
    await supabase.from("children").update(updates).eq("id", activeChild.id);
    setActiveChild(prev => ({ ...prev, ...updates }));
    setChildren(cs => cs.map(c => c.id===activeChild.id ? {...c,...updates} : c));
  };

  const bgs  = SHOP_ITEMS.filter(i=>i.type==="bg");
  const jars = SHOP_ITEMS.filter(i=>i.type==="jar");

  const ItemGrid = ({ items }) => (
    <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:8,marginBottom:18}}>
      {items.map(item=>{
        const owned    = !!unlocks[item.id];
        const equipped = item.type==="bg" ? equippedBg===item.value : equippedJar===item.value;
        const canAfford = availableSeeds >= item.cost;
        const isConfirmed = confirm===item.id;
        return (
          <button key={item.id} onClick={()=>owned ? equip(item) : canAfford ? buy(item) : null}
            disabled={!owned && !canAfford}
            style={{
              background: equipped ? `${C.purple}18` : "#fff",
              border:`2px solid ${equipped ? C.purple : owned ? C.mint : canAfford ? C.border : "#eee"}`,
              borderRadius:16, padding:"12px 10px", cursor: owned||canAfford ? "pointer" : "default",
              textAlign:"center", transition:"all 0.18s", position:"relative",
              opacity: !owned && !canAfford ? 0.55 : 1,
            }}>
            {equipped && (
              <div style={{position:"absolute",top:6,right:6,background:C.purple,
                borderRadius:"50%",width:16,height:16,display:"flex",alignItems:"center",justifyContent:"center"}}>
                <span style={{color:"#fff",fontSize:9,fontWeight:900}}>✓</span>
              </div>
            )}
            <div style={{fontSize:22,marginBottom:4}}>{item.emoji}</div>
            <p style={{fontFamily:"'Baloo 2',cursive",fontWeight:800,fontSize:12,
              color:C.text,margin:"0 0 4px",lineHeight:1.2}}>{item.label}</p>
            {isConfirmed ? (
              <p style={{fontFamily:"'Poppins',sans-serif",fontWeight:700,fontSize:11,color:C.mint,margin:0}}>Got it! 🎉</p>
            ) : owned ? (
              <p style={{fontFamily:"'Poppins',sans-serif",fontWeight:600,fontSize:11,
                color:equipped?C.purple:C.mint,margin:0}}>{equipped?"Equipped":"Tap to equip"}</p>
            ) : (
              <div style={{display:"inline-flex",alignItems:"center",gap:3,
                background:canAfford?"#EDE7F6":"#f5f5f5",borderRadius:50,padding:"2px 8px"}}>
                <span style={{fontSize:11}}>🌱</span>
                <span style={{fontFamily:"'Poppins',sans-serif",fontWeight:700,fontSize:11,
                  color:canAfford?C.purple:C.muted}}>{item.cost}</span>
              </div>
            )}
            {buying===item.id && (
              <div style={{position:"absolute",inset:0,borderRadius:14,
                background:"rgba(255,255,255,0.8)",display:"flex",alignItems:"center",justifyContent:"center"}}>
                <span style={{fontSize:18}}>✨</span>
              </div>
            )}
          </button>
        );
      })}
    </div>
  );

  return (
    <div style={{position:"fixed",inset:0,zIndex:9990,background:"rgba(0,0,0,0.45)",
      display:"flex",alignItems:"flex-end",justifyContent:"center"}}
      onClick={onClose}>
      <div onClick={e=>e.stopPropagation()}
        style={{background:"#fff",borderRadius:"24px 24px 0 0",padding:"24px 20px 36px",
          width:"100%",maxWidth:480,maxHeight:"80vh",overflowY:"auto",
          boxShadow:"0 -8px 40px rgba(124,77,255,0.18)",
          animation:"slideUp 0.35s cubic-bezier(0.34,1.56,0.64,1)"}}>
        <style>{`@keyframes slideUp{from{transform:translateY(100%)}to{transform:translateY(0)}}`}</style>

        <div style={{display:"flex",alignItems:"center",justifyContent:"space-between",marginBottom:18}}>
          <div>
            <p style={{fontFamily:"'Baloo 2',cursive",fontWeight:900,fontSize:20,color:C.text,margin:0}}>
              Mascot Shop 🌱
            </p>
            <p style={{fontFamily:"'Poppins',sans-serif",fontWeight:600,fontSize:13,color:C.muted,margin:0}}>
              {availableSeeds} seeds to spend
            </p>
          </div>
          <button onClick={onClose} style={{background:"#f5f5f5",border:"none",borderRadius:"50%",
            width:32,height:32,cursor:"pointer",fontSize:16,display:"flex",
            alignItems:"center",justifyContent:"center"}}>✕</button>
        </div>

        <p style={{fontFamily:"'Poppins',sans-serif",fontWeight:700,fontSize:11,color:C.muted,
          letterSpacing:1.2,textTransform:"uppercase",margin:"0 0 10px"}}>Room Backgrounds</p>
        <ItemGrid items={bgs}/>

        <p style={{fontFamily:"'Poppins',sans-serif",fontWeight:700,fontSize:11,color:C.muted,
          letterSpacing:1.2,textTransform:"uppercase",margin:"0 0 10px"}}>Gratitude Jar</p>
        <ItemGrid items={jars}/>
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
  const activityTier  = getActivityTier(moodLog);
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
        <div style={{position:"absolute", top:0, left:0, right:0, bottom:0, zIndex:0}}>
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

        <div style={{position:"relative", zIndex:1}}>

          {/* Header */}
          <div style={{
            display:"flex",justifyContent:"space-between",alignItems:"center",
            padding:"52px 24px 16px",
          }}>
            <div style={{width:80}}/>
            <h2 style={{fontFamily:F.h,fontSize:22,fontWeight:900,color:C.text,margin:0,
              textShadow:"0 2px 8px rgba(255,255,255,0.9)"}}>
              {cm.name}'s Room
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

        </div>{/* end zIndex:1 */}
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
