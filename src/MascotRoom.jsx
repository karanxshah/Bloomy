import { useState, useEffect, useRef, useCallback } from "react";
import { GrowthMascot, GardenScene, calcGrowthScore, getStage, STAGES } from "./MascotGrowth";
import { BerrySVG } from "./BerryBasket";

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
  const w = size;
  const h = size * 1.4;

  /* ── Expression helpers ── */
  /* BodyMouth: lx/rx = left/right x of mouth, my = vertical centre
     Smile = control point above (my - offset), frown = below (my + offset) */
  const BodyMouth = ({ lx, rx, my, stroke = "#333" }) => {
    const mx = (lx + rx) / 2;
    const hw = (rx - lx) / 2; // half-width
    if (energyTier === 0) {
      return <path d={`M ${lx} ${my + hw*0.25} Q ${mx} ${my - hw*0.55} ${rx} ${my + hw*0.25}`} stroke={stroke} strokeWidth="2.4" fill="none" strokeLinecap="round"/>;
    } else if (energyTier === 1) {
      return <path d={`M ${lx} ${my + hw*0.12} Q ${mx} ${my - hw*0.25} ${rx} ${my + hw*0.12}`} stroke={stroke} strokeWidth="2.2" fill="none" strokeLinecap="round"/>;
    } else if (energyTier === 2) {
      return <path d={`M ${lx} ${my - hw*0.1} Q ${mx} ${my + hw*0.3} ${rx} ${my - hw*0.1}`} stroke={stroke} strokeWidth="2.2" fill="none" strokeLinecap="round"/>;
    } else {
      return <path d={`M ${lx} ${my - hw*0.2} Q ${mx} ${my + hw*0.55} ${rx} ${my - hw*0.2}`} stroke={stroke} strokeWidth="2.4" fill="none" strokeLinecap="round"/>;
    }
  };

  /* DroopyLids: half-ellipse over each eye, only at tiers 2–3.
     Kept subtle — just enough to read as tired, not cartoonishly broken. */
  const DroopyLids = ({ lx, rx, ey, eyeR, fill }) => {
    if (energyTier < 2) return null;
    const lidH = energyTier === 3 ? eyeR * 0.55 : eyeR * 0.35;
    return (
      <>
        <ellipse cx={lx} cy={ey - eyeR * 0.3} rx={eyeR * 1.02} ry={lidH} fill={fill}/>
        <ellipse cx={rx} cy={ey - eyeR * 0.3} rx={eyeR * 1.02} ry={lidH} fill={fill}/>
      </>
    );
  };

  /* Stage accessories */
  const Scarf = ({ y = 95 }) => (
    <g>
      <ellipse cx={w/2} cy={y} rx={w*0.28} ry={h*0.04} fill="#4FC3F7"/>
      <ellipse cx={w/2} cy={y-4} rx={w*0.28} ry={h*0.035} fill="#29B6F6"/>
      <ellipse cx={w/2+w*0.18} cy={y+8} rx={w*0.07} ry={h*0.03} fill="#0288D1"/>
      <ellipse cx={w/2+w*0.18} cy={y+16} rx={w*0.055} ry={h*0.025} fill="#0288D1"/>
    </g>
  );

  const FlowerCrown = ({ y = 18 }) => (
    <g>
      {[-28,-14,0,14,28].map((x,i)=>(
        <g key={i}>
          <circle cx={w/2+x} cy={y} r={w*0.055}
            fill={["#F48FB1","#FFD54F","#A5D6A7","#F48FB1","#FFD54F"][i]}/>
          <circle cx={w/2+x} cy={y} r={w*0.025} fill="#fff" opacity="0.55"/>
        </g>
      ))}
      <ellipse cx={w/2-44} cy={y+8} rx={w*0.06} ry={h*0.022}
        fill="#81C784" transform={`rotate(-30 ${w/2-44} ${y+8})`}/>
      <ellipse cx={w/2+44} cy={y+8} rx={w*0.06} ry={h*0.022}
        fill="#81C784" transform={`rotate(30 ${w/2+44} ${y+8})`}/>
    </g>
  );

  const GlowRings = () => (
    <g>
      <circle cx={w/2} cy={h*0.45} r={w*0.46} fill="none"
        stroke="#FFD54F" strokeWidth="3" opacity="0.25"/>
      <circle cx={w/2} cy={h*0.45} r={w*0.42} fill="none"
        stroke="#FFA726" strokeWidth="2" opacity="0.15"/>
      {[[-35,20],[35,20],[-40,55],[40,55],[-30,85],[30,85]].map(([dx,dy],i)=>(
        <g key={i}>
          <line x1={w/2+dx} y1={dy-6} x2={w/2+dx} y2={dy+6}
            stroke="#FFD54F" strokeWidth="2" opacity="0.8"/>
          <line x1={w/2+dx-6} y1={dy} x2={w/2+dx+6} y2={dy}
            stroke="#FFD54F" strokeWidth="2" opacity="0.8"/>
        </g>
      ))}
    </g>
  );

  const bodies = {
    fox: (
      <svg width={w} height={h} viewBox={`0 0 ${w} ${h}`}>
        {stage===3 && <GlowRings/>}
        {/* Tail */}
        <ellipse cx={w*0.8} cy={h*0.72} rx={w*0.14} ry={h*0.18}
          fill="#FF7043" transform={`rotate(30 ${w*0.8} ${h*0.72})`}/>
        <ellipse cx={w*0.85} cy={h*0.66} rx={w*0.07} ry={h*0.08}
          fill="#fff" transform={`rotate(30 ${w*0.85} ${h*0.66})`}/>
        {/* Body */}
        <ellipse cx={w/2} cy={h*0.65} rx={w*0.3} ry={h*0.22} fill="#FF8A65"/>
        {/* Tummy */}
        <ellipse cx={w/2} cy={h*0.68} rx={w*0.18} ry={h*0.15} fill="#FFCCBC"/>
        {/* Legs */}
        <ellipse cx={w*0.38} cy={h*0.88} rx={w*0.1} ry={h*0.07} fill="#FF7043"/>
        <ellipse cx={w*0.62} cy={h*0.88} rx={w*0.1} ry={h*0.07} fill="#FF7043"/>
        {/* Feet */}
        <ellipse cx={w*0.36} cy={h*0.93} rx={w*0.12} ry={h*0.04} fill="#FF5722"/>
        <ellipse cx={w*0.64} cy={h*0.93} rx={w*0.12} ry={h*0.04} fill="#FF5722"/>
        {/* Arms */}
        <ellipse cx={w*0.22} cy={h*0.6} rx={w*0.08} ry={h*0.14}
          fill="#FF8A65" transform={`rotate(-20 ${w*0.22} ${h*0.6})`}/>
        <ellipse cx={w*0.78} cy={h*0.6} rx={w*0.08} ry={h*0.14}
          fill="#FF8A65" transform={`rotate(20 ${w*0.78} ${h*0.6})`}/>
        {/* Ears */}
        <polygon points={`${w*0.3},${h*0.18} ${w*0.2},${h*0.04} ${w*0.38},${h*0.16}`} fill="#FF7043"/>
        <polygon points={`${w*0.7},${h*0.18} ${w*0.8},${h*0.04} ${w*0.62},${h*0.16}`} fill="#FF7043"/>
        {/* Head */}
        <ellipse cx={w/2} cy={h*0.28} rx={w*0.26} ry={h*0.2} fill="#FF8A65"/>
        {/* Face */}
        <ellipse cx={w/2} cy={h*0.32} rx={w*0.16} ry={h*0.13} fill="#FFCCBC"/>
        <circle cx={w*0.42} cy={h*0.25} r={w*0.05} fill="#fff"/>
        <circle cx={w*0.58} cy={h*0.25} r={w*0.05} fill="#fff"/>
        <circle cx={w*0.43} cy={h*0.255} r={w*0.025} fill="#1a1a2e"/>
        <circle cx={w*0.59} cy={h*0.255} r={w*0.025} fill="#1a1a2e"/>
        <circle cx={w*0.44} cy={h*0.248} r={w*0.01} fill="#fff"/>
        <circle cx={w*0.6}  cy={h*0.248} r={w*0.01} fill="#fff"/>
        <ellipse cx={w/2} cy={h*0.33} rx={w*0.055} ry={h*0.035} fill="#EF5350"/>
        <BodyMouth lx={w*0.43} rx={w*0.57} my={h*0.365} stroke="#333"/>
        <DroopyLids lx={w*0.43} rx={w*0.59} ey={h*0.255} eyeR={w*0.05} fill="#FF8A65"/>
        {stage>=1 && <Scarf y={h*0.43}/>}
        {(stage===2||stage===3) && <FlowerCrown y={h*0.1}/>}
      </svg>
    ),

    bunny: (()=>{
      const pad = Math.round(h * 0.07);
      return (
      <svg width={w} height={h+pad} viewBox={`0 0 ${w} ${h+pad}`}>
        <g transform={`translate(0,${pad})`}>
        {stage===3 && <GlowRings/>}
        {/* Long ears */}
        <ellipse cx={w*0.38} cy={h*0.1} rx={w*0.07} ry={h*0.14} fill="#FCE4EC"/>
        <ellipse cx={w*0.62} cy={h*0.1} rx={w*0.07} ry={h*0.14} fill="#FCE4EC"/>
        <ellipse cx={w*0.38} cy={h*0.1} rx={w*0.035} ry={h*0.1} fill="#F48FB1"/>
        <ellipse cx={w*0.62} cy={h*0.1} rx={w*0.035} ry={h*0.1} fill="#F48FB1"/>
        {/* Body */}
        <ellipse cx={w/2} cy={h*0.65} rx={w*0.28} ry={h*0.22} fill="#FCE4EC"/>
        {/* Tummy */}
        <ellipse cx={w/2} cy={h*0.68} rx={w*0.16} ry={h*0.14} fill="#F8BBD0"/>
        {/* Tail */}
        <circle cx={w*0.74} cy={h*0.72} r={w*0.06} fill="#fff"/>
        {/* Legs */}
        <ellipse cx={w*0.38} cy={h*0.88} rx={w*0.11} ry={h*0.07} fill="#FCE4EC"/>
        <ellipse cx={w*0.62} cy={h*0.88} rx={w*0.11} ry={h*0.07} fill="#FCE4EC"/>
        <ellipse cx={w*0.36} cy={h*0.93} rx={w*0.13} ry={h*0.04} fill="#F8BBD0"/>
        <ellipse cx={w*0.64} cy={h*0.93} rx={w*0.13} ry={h*0.04} fill="#F8BBD0"/>
        {/* Arms */}
        <ellipse cx={w*0.23} cy={h*0.6} rx={w*0.07} ry={h*0.13}
          fill="#FCE4EC" transform={`rotate(-15 ${w*0.23} ${h*0.6})`}/>
        <ellipse cx={w*0.77} cy={h*0.6} rx={w*0.07} ry={h*0.13}
          fill="#FCE4EC" transform={`rotate(15 ${w*0.77} ${h*0.6})`}/>
        {/* Head */}
        <ellipse cx={w/2} cy={h*0.3} rx={w*0.24} ry={h*0.19} fill="#FCE4EC"/>
        <ellipse cx={w/2} cy={h*0.34} rx={w*0.15} ry={h*0.12} fill="#F8BBD0"/>
        <circle cx={w*0.42} cy={h*0.27} r={w*0.05} fill="#fff"/>
        <circle cx={w*0.58} cy={h*0.27} r={w*0.05} fill="#fff"/>
        <circle cx={w*0.43} cy={h*0.275} r={w*0.025} fill="#1a1a2e"/>
        <circle cx={w*0.59} cy={h*0.275} r={w*0.025} fill="#1a1a2e"/>
        <circle cx={w*0.44} cy={h*0.268} r={w*0.01} fill="#fff"/>
        <circle cx={w*0.6}  cy={h*0.268} r={w*0.01} fill="#fff"/>
        <ellipse cx={w/2} cy={h*0.345} rx={w*0.045} ry={h*0.028} fill="#F48FB1"/>
        <BodyMouth lx={w*0.44} rx={w*0.56} my={h*0.375} stroke="#333"/>
        <DroopyLids lx={w*0.43} rx={w*0.59} ey={h*0.275} eyeR={w*0.05} fill="#FCE4EC"/>
        {stage>=1 && <Scarf y={h*0.44}/>}
        {(stage===2||stage===3) && <FlowerCrown y={h*0.08}/>}
        </g>
      </svg>
      );
    })(),

    bear: (
      <svg width={w} height={h} viewBox={`0 0 ${w} ${h}`}>
        {stage===3 && <GlowRings/>}
        {/* Ears */}
        <circle cx={w*0.32} cy={h*0.15} r={w*0.1} fill="#A1887F"/>
        <circle cx={w*0.68} cy={h*0.15} r={w*0.1} fill="#A1887F"/>
        <circle cx={w*0.32} cy={h*0.15} r={w*0.055} fill="#8D6E63"/>
        <circle cx={w*0.68} cy={h*0.15} r={w*0.055} fill="#8D6E63"/>
        {/* Body */}
        <ellipse cx={w/2} cy={h*0.65} rx={w*0.3} ry={h*0.23} fill="#8D6E63"/>
        {/* Tummy */}
        <ellipse cx={w/2} cy={h*0.67} rx={w*0.18} ry={h*0.16} fill="#BCAAA4"/>
        {/* Legs */}
        <ellipse cx={w*0.38} cy={h*0.88} rx={w*0.11} ry={h*0.07} fill="#795548"/>
        <ellipse cx={w*0.62} cy={h*0.88} rx={w*0.11} ry={h*0.07} fill="#795548"/>
        <ellipse cx={w*0.36} cy={h*0.93} rx={w*0.13} ry={h*0.04} fill="#6D4C41"/>
        <ellipse cx={w*0.64} cy={h*0.93} rx={w*0.13} ry={h*0.04} fill="#6D4C41"/>
        {/* Arms */}
        <ellipse cx={w*0.21} cy={h*0.62} rx={w*0.09} ry={h*0.15}
          fill="#8D6E63" transform={`rotate(-18 ${w*0.21} ${h*0.62})`}/>
        <ellipse cx={w*0.79} cy={h*0.62} rx={w*0.09} ry={h*0.15}
          fill="#8D6E63" transform={`rotate(18 ${w*0.79} ${h*0.62})`}/>
        {/* Head */}
        <ellipse cx={w/2} cy={h*0.29} rx={w*0.27} ry={h*0.21} fill="#8D6E63"/>
        <ellipse cx={w/2} cy={h*0.34} rx={w*0.16} ry={h*0.12} fill="#BCAAA4"/>
        <circle cx={w*0.41} cy={h*0.26} r={w*0.055} fill="#fff"/>
        <circle cx={w*0.59} cy={h*0.26} r={w*0.055} fill="#fff"/>
        <circle cx={w*0.42} cy={h*0.265} r={w*0.028} fill="#1a1a2e"/>
        <circle cx={w*0.60} cy={h*0.265} r={w*0.028} fill="#1a1a2e"/>
        <circle cx={w*0.43} cy={h*0.258} r={w*0.011} fill="#fff"/>
        <circle cx={w*0.61} cy={h*0.258} r={w*0.011} fill="#fff"/>
        <ellipse cx={w/2} cy={h*0.34} rx={w*0.055} ry={h*0.036} fill="#795548"/>
        <BodyMouth lx={w*0.43} rx={w*0.57} my={h*0.375} stroke="#333"/>
        <DroopyLids lx={w*0.42} rx={w*0.60} ey={h*0.265} eyeR={w*0.055} fill="#8D6E63"/>
        {stage>=1 && <Scarf y={h*0.45}/>}
        {(stage===2||stage===3) && <FlowerCrown y={h*0.09}/>}
      </svg>
    ),

    owl: (
      <svg width={w} height={h} viewBox={`0 0 ${w} ${h}`}>
        {stage===3 && <GlowRings/>}
        {/* Wings */}
        <ellipse cx={w*0.18} cy={h*0.6} rx={w*0.12} ry={h*0.22}
          fill="#7E57C2" transform={`rotate(-25 ${w*0.18} ${h*0.6})`}/>
        <ellipse cx={w*0.82} cy={h*0.6} rx={w*0.12} ry={h*0.22}
          fill="#7E57C2" transform={`rotate(25 ${w*0.82} ${h*0.6})`}/>
        {/* Body */}
        <ellipse cx={w/2} cy={h*0.64} rx={w*0.26} ry={h*0.24} fill="#7E57C2"/>
        {/* Tummy pattern */}
        <ellipse cx={w/2} cy={h*0.66} rx={w*0.16} ry={h*0.18} fill="#B39DDB"/>
        {/* Feet */}
        <ellipse cx={w*0.4} cy={h*0.9} rx={w*0.1} ry={h*0.04} fill="#FFA726"/>
        <ellipse cx={w*0.6} cy={h*0.9} rx={w*0.1} ry={h*0.04} fill="#FFA726"/>
        {/* Tufts */}
        <ellipse cx={w*0.38} cy={h*0.17} rx={w*0.07} ry={h*0.09} fill="#7E57C2"/>
        <ellipse cx={w*0.62} cy={h*0.17} rx={w*0.07} ry={h*0.09} fill="#7E57C2"/>
        {/* Head */}
        <ellipse cx={w/2} cy={h*0.3} rx={w*0.25} ry={h*0.2} fill="#7E57C2"/>
        <ellipse cx={w/2} cy={h*0.32} rx={w*0.18} ry={h*0.16} fill="#B39DDB"/>
        {/* Eyes */}
        <circle cx={w*0.41} cy={h*0.28} r={w*0.08} fill="#fff"/>
        <circle cx={w*0.59} cy={h*0.28} r={w*0.08} fill="#fff"/>
        <circle cx={w*0.41} cy={h*0.282} r={w*0.048} fill="#4527A0"/>
        <circle cx={w*0.59} cy={h*0.282} r={w*0.048} fill="#4527A0"/>
        <circle cx={w*0.425} cy={h*0.272} r={w*0.018} fill="#fff"/>
        <circle cx={w*0.605} cy={h*0.272} r={w*0.018} fill="#fff"/>
        {/* Beak */}
        <polygon points={`${w*0.46},${h*0.34} ${w*0.5},${h*0.355} ${w*0.54},${h*0.34}`}
          fill="#FFA726"/>
        <DroopyLids lx={w*0.41} rx={w*0.59} ey={h*0.282} eyeR={w*0.08} fill="#7E57C2"/>
        {stage>=1 && <Scarf y={h*0.44}/>}
        {(stage===2||stage===3) && <FlowerCrown y={h*0.1}/>}
      </svg>
    ),

    cat: (
      <svg width={w} height={h} viewBox={`0 0 ${w} ${h}`}>
        {stage===3 && <GlowRings/>}
        {/* Tail */}
        <path d={`M ${w*0.72} ${h*0.88} Q ${w*0.92} ${h*0.75} ${w*0.82} ${h*0.58}`}
          stroke="#4DB6AC" strokeWidth={w*0.08} fill="none" strokeLinecap="round"/>
        {/* Body */}
        <ellipse cx={w/2} cy={h*0.65} rx={w*0.28} ry={h*0.22} fill="#4DB6AC"/>
        {/* Tummy */}
        <ellipse cx={w/2} cy={h*0.68} rx={w*0.16} ry={h*0.15} fill="#B2DFDB"/>
        {/* Legs */}
        <ellipse cx={w*0.38} cy={h*0.87} rx={w*0.1} ry={h*0.07} fill="#26A69A"/>
        <ellipse cx={w*0.62} cy={h*0.87} rx={w*0.1} ry={h*0.07} fill="#26A69A"/>
        <ellipse cx={w*0.36} cy={h*0.92} rx={w*0.12} ry={h*0.04} fill="#00897B"/>
        <ellipse cx={w*0.64} cy={h*0.92} rx={w*0.12} ry={h*0.04} fill="#00897B"/>
        {/* Arms */}
        <ellipse cx={w*0.22} cy={h*0.61} rx={w*0.08} ry={h*0.13}
          fill="#4DB6AC" transform={`rotate(-20 ${w*0.22} ${h*0.61})`}/>
        <ellipse cx={w*0.78} cy={h*0.61} rx={w*0.08} ry={h*0.13}
          fill="#4DB6AC" transform={`rotate(20 ${w*0.78} ${h*0.61})`}/>
        {/* Ears */}
        <polygon points={`${w*0.3},${h*0.2} ${w*0.22},${h*0.06} ${w*0.4},${h*0.18}`}
          fill="#26A69A"/>
        <polygon points={`${w*0.7},${h*0.2} ${w*0.78},${h*0.06} ${w*0.6},${h*0.18}`}
          fill="#26A69A"/>
        {/* Head */}
        <ellipse cx={w/2} cy={h*0.29} rx={w*0.25} ry={h*0.2} fill="#4DB6AC"/>
        <ellipse cx={w/2} cy={h*0.33} rx={w*0.15} ry={h*0.12} fill="#B2DFDB"/>
        <circle cx={w*0.42} cy={h*0.265} r={w*0.052} fill="#fff"/>
        <circle cx={w*0.58} cy={h*0.265} r={w*0.052} fill="#fff"/>
        <circle cx={w*0.43} cy={h*0.27} r={w*0.026} fill="#1a1a2e"/>
        <circle cx={w*0.59} cy={h*0.27} r={w*0.026} fill="#1a1a2e"/>
        <circle cx={w*0.44} cy={h*0.263} r={w*0.01} fill="#fff"/>
        <circle cx={w*0.6}  cy={h*0.263} r={w*0.01} fill="#fff"/>
        <ellipse cx={w/2} cy={h*0.335} rx={w*0.045} ry={h*0.028} fill="#FF8A80"/>
        {/* Whiskers */}
        <line x1={w*0.25} y1={h*0.32} x2={w*0.44} y2={h*0.335}
          stroke="#26A69A" strokeWidth="1.5" opacity="0.7"/>
        <line x1={w*0.25} y1={h*0.34} x2={w*0.44} y2={h*0.34}
          stroke="#26A69A" strokeWidth="1.5" opacity="0.7"/>
        <line x1={w*0.75} y1={h*0.32} x2={w*0.56} y2={h*0.335}
          stroke="#26A69A" strokeWidth="1.5" opacity="0.7"/>
        <line x1={w*0.75} y1={h*0.34} x2={w*0.56} y2={h*0.34}
          stroke="#26A69A" strokeWidth="1.5" opacity="0.7"/>
        <BodyMouth lx={w*0.43} rx={w*0.57} my={h*0.365} stroke="#333"/>
        <DroopyLids lx={w*0.43} rx={w*0.59} ey={h*0.27} eyeR={w*0.052} fill="#4DB6AC"/>
        {stage>=1 && <Scarf y={h*0.44}/>}
        {(stage===2||stage===3) && <FlowerCrown y={h*0.09}/>}
      </svg>
    ),

    dog: (
      <svg width={w} height={h} viewBox={`0 0 ${w} ${h}`}>
        {stage===3 && <GlowRings/>}
        {/* Floppy ears */}
        <ellipse cx={w*0.28} cy={h*0.27} rx={w*0.1} ry={h*0.18}
          fill="#FFA726" transform={`rotate(-15 ${w*0.28} ${h*0.27})`}/>
        <ellipse cx={w*0.72} cy={h*0.27} rx={w*0.1} ry={h*0.18}
          fill="#FFA726" transform={`rotate(15 ${w*0.72} ${h*0.27})`}/>
        {/* Tail */}
        <path d={`M ${w*0.72} ${h*0.7} Q ${w*0.9} ${h*0.6} ${w*0.85} ${h*0.48}`}
          stroke="#FFA726" strokeWidth={w*0.08} fill="none" strokeLinecap="round"/>
        {/* Body */}
        <ellipse cx={w/2} cy={h*0.65} rx={w*0.3} ry={h*0.23} fill="#FFB74D"/>
        {/* Tummy */}
        <ellipse cx={w/2} cy={h*0.68} rx={w*0.18} ry={h*0.16} fill="#FFE0B2"/>
        {/* Legs */}
        <ellipse cx={w*0.37} cy={h*0.88} rx={w*0.11} ry={h*0.07} fill="#FFA726"/>
        <ellipse cx={w*0.63} cy={h*0.88} rx={w*0.11} ry={h*0.07} fill="#FFA726"/>
        <ellipse cx={w*0.35} cy={h*0.93} rx={w*0.13} ry={h*0.04} fill="#FB8C00"/>
        <ellipse cx={w*0.65} cy={h*0.93} rx={w*0.13} ry={h*0.04} fill="#FB8C00"/>
        {/* Arms */}
        <ellipse cx={w*0.21} cy={h*0.62} rx={w*0.09} ry={h*0.14}
          fill="#FFB74D" transform={`rotate(-18 ${w*0.21} ${h*0.62})`}/>
        <ellipse cx={w*0.79} cy={h*0.62} rx={w*0.09} ry={h*0.14}
          fill="#FFB74D" transform={`rotate(18 ${w*0.79} ${h*0.62})`}/>
        {/* Head */}
        <ellipse cx={w/2} cy={h*0.29} rx={w*0.26} ry={h*0.21} fill="#FFB74D"/>
        <ellipse cx={w/2} cy={h*0.34} rx={w*0.17} ry={h*0.13} fill="#FFE0B2"/>
        <circle cx={w*0.41} cy={h*0.255} r={w*0.055} fill="#fff"/>
        <circle cx={w*0.59} cy={h*0.255} r={w*0.055} fill="#fff"/>
        <circle cx={w*0.42} cy={h*0.26} r={w*0.028} fill="#1a1a2e"/>
        <circle cx={w*0.60} cy={h*0.26} r={w*0.028} fill="#1a1a2e"/>
        <circle cx={w*0.43} cy={h*0.253} r={w*0.011} fill="#fff"/>
        <circle cx={w*0.61} cy={h*0.253} r={w*0.011} fill="#fff"/>
        <ellipse cx={w/2} cy={h*0.34} rx={w*0.06} ry={h*0.04} fill="#FF7043"/>
        <BodyMouth lx={w*0.43} rx={w*0.57} my={h*0.375} stroke="#333"/>
        <DroopyLids lx={w*0.42} rx={w*0.60} ey={h*0.26} eyeR={w*0.055} fill="#FFB74D"/>
        {stage>=1 && <Scarf y={h*0.45}/>}
        {(stage===2||stage===3) && <FlowerCrown y={h*0.09}/>}
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
const EnergyBar = ({ level }) => {
  const color = level>60?C.mint:level>30?C.yellow:C.coral;
  const label = level>60?"Feeling great!":level>30?"Could use a check-in!":"Needs some love!";
  return (
    <div>
      <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:6}}>
        <p style={{fontFamily:F.b,fontWeight:700,fontSize:12,color:C.muted,
          letterSpacing:1.2,textTransform:"uppercase",margin:0}}>Emotional Energy</p>
        <p style={{fontFamily:F.b,fontWeight:700,fontSize:12,color,margin:0}}>{label}</p>
      </div>
      <div style={{background:"#F0EAFF",borderRadius:50,height:12,overflow:"hidden"}}>
        <div style={{height:"100%",borderRadius:50,
          background:`linear-gradient(90deg,${color},${C.pink})`,
          width:`${level}%`,transition:"width 1.2s ease"}}/>
      </div>
      <div style={{display:"flex",gap:4,marginTop:6}}>
        {Array.from({length:5},(_,i)=>(
          <div key={i} style={{flex:1,height:4,borderRadius:50,
            background:i<Math.ceil(level/20)?color:"#EEE9FF",transition:"background 0.5s"}}/>
        ))}
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
          <GrowthMascot id={mascotId} size={34} stage={stage.id}/>
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
/* ── Feed Card ── */
const FeedCard = ({ energy, berries, mascotName, mascotId, stageId, onFeed }) => {
  const [feeding, setFeeding]           = useState(false);
  const [excited, setExcited]           = useState(false);
  const [fullMsg, setFullMsg]           = useState(false);

  const hasBerries = berries > 0;

  const handleFeed = () => {
    if (!hasBerries) return;
    if (energy >= 100) {
      setFullMsg(true);
      setTimeout(() => setFullMsg(false), 2000);
      return;
    }
    setFeeding(true);
    setExcited(true);
    setTimeout(() => setFeeding(false), 900);
    setTimeout(() => setExcited(false), 800);
    onFeed();
  };

  return (
    <div style={{background:"#fff",borderRadius:20,padding:"18px 20px",
      boxShadow:"0 2px 18px rgba(124,77,255,0.09)",marginBottom:14,
      position:"relative",overflow:"hidden"}}>
      <style>{`
        @keyframes berryFloat{
          0%  {opacity:1;transform:translate(-50%,-50%) scale(1)}
          60% {opacity:1;transform:translate(-50%,-200%) scale(1.15)}
          100%{opacity:0;transform:translate(-50%,-280%) scale(0.4)}
        }
        @keyframes mascotExcite{
          0%,100%{transform:scale(1) rotate(0deg)}
          20%{transform:scale(1.2) rotate(-8deg)}
          40%{transform:scale(1.2) rotate(8deg)}
          60%{transform:scale(1.1) rotate(-5deg)}
          80%{transform:scale(1.05) rotate(3deg)}
        }
      `}</style>

      {/* Excited mascot face in card */}
      <div style={{
        display:"flex",alignItems:"center",justifyContent:"center",
        marginBottom:10,
      }}>
        <div style={{
          animation: excited ? "mascotExcite 0.8s ease" : "none",
        }}>
          <GrowthMascot id={mascotId} size={52} stage={stageId}/>
        </div>
      </div>

      <EnergyBar level={energy}/>

      <p style={{fontFamily:F.b,fontWeight:500,fontSize:13,
        color:C.muted,margin:"10px 0 12px",textAlign:"center",lineHeight:1.6}}>
        {energy >= 100
          ? `${mascotName} is full of energy! 🌟`
          : energy < 30
          ? `${mascotName} is really hungry — feed them! 🥺`
          : `${mascotName} could use some berries! 🫐`}
      </p>

      {/* Full message — simple text, no card */}
      <p style={{
        fontFamily:F.b, fontWeight:600, fontSize:12,
        color:"#43A047", textAlign:"center",
        margin:"0 0 10px",
        opacity: fullMsg ? 1 : 0,
        transition:"opacity 0.3s ease",
        minHeight:16,
      }}>
        {mascotName} is already full! 🌟
      </p>

      {/* Feed button with floating berry */}
      <div style={{position:"relative",width:"100%"}}>
        {feeding && (
          <div style={{
            position:"absolute",left:"50%",bottom:"100%",
            animation:"berryFloat 0.9s ease forwards",
            pointerEvents:"none",zIndex:10,
          }}>
            <BerrySVG size={30}/>
          </div>
        )}
        <button
          onClick={handleFeed}
          style={{
            width:"100%",borderRadius:50,padding:"11px",
            background: hasBerries
              ? "linear-gradient(135deg,#7C4DFF,#9C6FFF)"
              : C.border,
            border:"none",
            cursor: hasBerries ? "pointer" : "default",
            fontFamily:F.b,fontWeight:700,fontSize:14,
            color: hasBerries ? "#fff" : C.muted,
            display:"flex",alignItems:"center",justifyContent:"center",gap:8,
            boxShadow: hasBerries ? "0 4px 14px rgba(124,77,255,0.3)" : "none",
            transition:"transform 0.15s",
          }}
          onMouseDown={e=>{if(hasBerries)e.currentTarget.style.transform="scale(0.97)"}}
          onMouseUp={e=>e.currentTarget.style.transform="scale(1)"}>
          <BerrySVG size={16}/>
          {hasBerries ? `Feed ${mascotName}` : "No berries yet!"}
        </button>
      </div>
    </div>
  );
};

export default function MascotRoom({ activeChild, moodLog, journals, energy: energyProp, berries: berriesProp, onFeed, onClose }) {
  const cm = {
    id:    activeChild.mascot_id,
    name:  activeChild.mascot_name,
    color: activeChild.mascot_color,
    bg:    activeChild.mascot_bg,
  };
  const personality   = PERSONALITIES[cm.id]||PERSONALITIES.fox;
  const score         = calcGrowthScore(activeChild, moodLog, journals);
  const stage         = getStage(score);
  const energy        = typeof energyProp === "number" ? energyProp : 100;
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
              <FullBodyMascot id={cm.id} size={210} stage={stage.id} energyTier={energy > 75 ? 0 : energy > 50 ? 1 : energy > 25 ? 2 : 3}/>
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
              You haven't checked in for {daysAway} day{daysAway!==1?"s":""}.
              Log your mood to restore {cm.name}'s energy!
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

        {/* Energy + Feed */}
        <FeedCard
          energy={energy}
          berries={berriesProp||0}
          mascotName={cm.name}
          mascotId={cm.id}
          stageId={stage.id}
          onFeed={onFeed}
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
