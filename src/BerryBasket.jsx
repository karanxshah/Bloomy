import { useState, useRef, useEffect } from "react";

const F = { h:"'Baloo 2', cursive", b:"'Poppins', sans-serif" };
const C = {
  purple:"#7C4DFF", text:"#2D2040", muted:"#9B8DB5",
  border:"#EEE9FF", bg:"#F7F4FF", mint:"#4DB6AC",
};

/* ── SVG Berry ── */
export const BerrySVG = ({ size = 28 }) => (
  <svg width={size} height={size} viewBox="0 0 32 32" fill="none">
    {/* Leaf */}
    <ellipse cx="16" cy="7" rx="5" ry="3.5"
      fill="#66BB6A" transform="rotate(-15 16 7)"/>
    <ellipse cx="18" cy="6" rx="4" ry="2.5"
      fill="#81C784" transform="rotate(20 18 6)"/>
    {/* Stem */}
    <path d="M16 10 Q16.5 8 17 6" stroke="#43A047" strokeWidth="1.5"
      strokeLinecap="round" fill="none"/>
    {/* Berry body */}
    <circle cx="16" cy="20" r="10" fill="#7C4DFF"/>
    <circle cx="16" cy="20" r="10" fill="url(#berryGrad)"/>
    {/* Highlight */}
    <ellipse cx="12.5" cy="16" rx="2.5" ry="3.5"
      fill="rgba(255,255,255,0.28)" transform="rotate(-20 12.5 16)"/>
    <circle cx="13" cy="15" r="1.2" fill="rgba(255,255,255,0.45)"/>
    {/* Dimple dots */}
    <circle cx="13" cy="22" r="1" fill="rgba(255,255,255,0.15)"/>
    <circle cx="19" cy="21" r="1" fill="rgba(255,255,255,0.15)"/>
    <circle cx="16" cy="25" r="1" fill="rgba(255,255,255,0.15)"/>
    <defs>
      <radialGradient id="berryGrad" cx="40%" cy="35%" r="60%">
        <stop offset="0%" stopColor="#9575CD"/>
        <stop offset="100%" stopColor="#512DA8"/>
      </radialGradient>
    </defs>
  </svg>
);

/* ── SVG Basket ── */
const BasketSVG = ({ size = 34, bounce = false }) => (
  <svg width={size} height={size} viewBox="0 0 40 40" fill="none"
    style={{animation: bounce ? "basketBounce 0.4s cubic-bezier(0.34,1.56,0.64,1)" : "none"}}>
    {/* Handle */}
    <path d="M12 18 Q12 8 20 8 Q28 8 28 18"
      stroke="#8D6E63" strokeWidth="3" fill="none" strokeLinecap="round"/>
    {/* Basket body */}
    <path d="M6 18 L8 34 Q8 36 10 36 L30 36 Q32 36 32 34 L34 18 Z"
      fill="#A1887F"/>
    {/* Weave lines horizontal */}
    <path d="M7 23 L33 23" stroke="#8D6E63" strokeWidth="1.2" opacity="0.6"/>
    <path d="M7.5 28 L32.5 28" stroke="#8D6E63" strokeWidth="1.2" opacity="0.6"/>
    <path d="M8.5 33 L31.5 33" stroke="#8D6E63" strokeWidth="1.2" opacity="0.6"/>
    {/* Weave lines vertical */}
    {[11,15,19,23,27,31].map(x=>(
      <path key={x} d={`M${x} 18 L${x-1} 36`}
        stroke="#8D6E63" strokeWidth="1" opacity="0.4"/>
    ))}
    {/* Rim */}
    <rect x="5" y="16" width="30" height="5" rx="2.5"
      fill="#8D6E63"/>
    {/* Rim highlight */}
    <rect x="5" y="16" width="30" height="2" rx="1.5"
      fill="rgba(255,255,255,0.2)"/>
  </svg>
);

/* ── Floating berry animation ── */
export const FloatingBerry = ({ visible, targetRef, onDone }) => {
  const [animating, setAnimating] = useState(false);
  const [pos, setPos]   = useState({x:"50%", y:"60%"});
  const [arrived, setArrived] = useState(false);

  useEffect(() => {
    if (!visible) { setAnimating(false); setArrived(false); return; }

    // Start at centre of screen
    setPos({x:"50%", y:"55%"});
    setArrived(false);
    setAnimating(true);

    // Get basket position and animate toward it
    const t1 = setTimeout(() => {
      if (targetRef?.current) {
        const rect = targetRef.current.getBoundingClientRect();
        setPos({
          x: rect.left + rect.width / 2 + "px",
          y: rect.top  + rect.height / 2 + "px",
        });
      } else {
        setPos({x:"calc(100% - 52px)", y:"52px"});
      }
      setArrived(true);
    }, 60);

    const t2 = setTimeout(() => {
      setAnimating(false);
      if (onDone) onDone();
    }, 750);

    return () => { clearTimeout(t1); clearTimeout(t2); };
  }, [visible]);

  if (!animating) return null;
  return (
    <div style={{
      position:"fixed",
      left: pos.x, top: pos.y,
      transform:`translate(-50%,-50%) scale(${arrived ? 0.4 : 1})`,
      opacity: arrived ? 0 : 1,
      transition:"left 0.6s cubic-bezier(0.4,0,0.2,1), top 0.6s cubic-bezier(0.4,0,0.2,1), transform 0.6s, opacity 0.2s 0.5s",
      zIndex:9998, pointerEvents:"none",
    }}>
      <BerrySVG size={34}/>
    </div>
  );
};

/* ── Basket panel ── */
const BasketPanel = ({ berries, energy, mascotName, onClose, onFeed, canFeed }) => (
  <div style={{
    position:"fixed", inset:0, zIndex:9990,
    display:"flex", alignItems:"flex-start", justifyContent:"flex-end",
  }} onClick={onClose}>
    <div
      onClick={e=>e.stopPropagation()}
      style={{
        marginTop:72, marginRight:16,
        background:"#fff", borderRadius:24,
        padding:"20px", width:280,
        boxShadow:"0 8px 40px rgba(124,77,255,0.18), 0 2px 12px rgba(0,0,0,0.08)",
        border:`1.5px solid ${C.border}`,
        animation:"panelIn 0.3s cubic-bezier(0.34,1.56,0.64,1)",
      }}>
      <style>{`@keyframes panelIn{from{opacity:0;transform:translateY(-12px) scale(0.95)}to{opacity:1;transform:none}}`}</style>

      {/* Header */}
      <div style={{display:"flex",alignItems:"center",gap:10,marginBottom:16}}>
        <BasketSVG size={36}/>
        <div>
          <p style={{fontFamily:F.h,fontWeight:900,fontSize:18,color:C.text,margin:0}}>
            Berry Basket
          </p>
          <div style={{display:"flex",alignItems:"center",gap:5}}>
            <BerrySVG size={16}/>
            <p style={{fontFamily:F.b,fontWeight:700,fontSize:13,
              color:C.purple,margin:0}}>{berries} berries</p>
          </div>
        </div>
      </div>

      {/* Mascot energy */}
      <div style={{background:C.bg,borderRadius:16,padding:"12px 14px",marginBottom:14}}>
        <p style={{fontFamily:F.b,fontWeight:600,fontSize:12,
          color:C.muted,margin:"0 0 6px",textTransform:"uppercase",letterSpacing:0.8}}>
          {mascotName}'s Energy
        </p>
        <div style={{height:8,borderRadius:50,background:C.border,overflow:"hidden",marginBottom:6}}>
          <div style={{
            height:"100%",borderRadius:50,
            background: energy>60 ? "linear-gradient(90deg,#66BB6A,#43A047)"
              : energy>30 ? "linear-gradient(90deg,#FFD54F,#F9A825)"
              : "linear-gradient(90deg,#FF7043,#E64A19)",
            width:`${energy}%`,transition:"width 0.6s ease",
          }}/>
        </div>
        <p style={{fontFamily:F.b,fontSize:12,fontWeight:500,color:C.muted,margin:0}}>
          {energy>70 ? `${mascotName} is full of energy! 🌟`
            : energy>40 ? `${mascotName} could use some berries! 🫐`
            : `${mascotName} is really hungry! Please feed them! 🥺`}
        </p>
      </div>

      {/* Feed button */}
      <button
        onClick={canFeed ? onFeed : undefined}
        style={{
          width:"100%", borderRadius:50, padding:"12px",
          background: canFeed
            ? "linear-gradient(135deg,#7C4DFF,#9C6FFF)"
            : C.border,
          border:"none", cursor: canFeed ? "pointer" : "default",
          fontFamily:F.h, fontWeight:800, fontSize:15,
          color: canFeed ? "#fff" : C.muted,
          display:"flex", alignItems:"center", justifyContent:"center", gap:8,
          marginBottom:14,
          boxShadow: canFeed ? "0 4px 16px rgba(124,77,255,0.35)" : "none",
          transition:"transform 0.15s",
        }}
        onMouseDown={e=>{if(canFeed)e.currentTarget.style.transform="scale(0.97)"}}
        onMouseUp={e=>e.currentTarget.style.transform="scale(1)"}>
        <BerrySVG size={18}/>
        {canFeed ? `Feed ${mascotName} (1 berry)` : "No berries yet!"}
      </button>

      {/* What earns berries */}
      <p style={{fontFamily:F.b,fontWeight:700,fontSize:11,color:C.muted,
        textTransform:"uppercase",letterSpacing:0.8,margin:"0 0 8px"}}>
        How to earn berries
      </p>
      {[
        {icon:"📓", label:"Write in your journal",    reward:"+1 berry"},
        {icon:"🫧", label:"Complete a breathing session", reward:"+1 berry"},
        {icon:"🙏", label:"Write a gratitude",        reward:"+1 berry"},
      ].map((item,i)=>(
        <div key={i} style={{display:"flex",alignItems:"center",gap:10,
          padding:"7px 0",
          borderBottom:i<2?`1px solid ${C.border}`:"none"}}>
          <span style={{fontSize:18}}>{item.icon}</span>
          <p style={{fontFamily:F.b,fontWeight:500,fontSize:13,
            color:C.text,margin:0,flex:1}}>{item.label}</p>
          <div style={{background:"#EDE7F6",borderRadius:50,padding:"2px 8px",
            display:"flex",alignItems:"center",gap:4}}>
            <BerrySVG size={12}/>
            <p style={{fontFamily:F.b,fontWeight:700,fontSize:11,
              color:C.purple,margin:0}}>{item.reward}</p>
          </div>
        </div>
      ))}
    </div>
  </div>
);

/* ── Main BerryBasket component ── */
export default function BerryBasket({ berries, energy, mascotName, onFeed, basketRef }) {
  const [open, setOpen]         = useState(false);
  const [bounce, setBounce]     = useState(false);

  // Called from parent when a berry is earned to trigger bounce
  useEffect(() => {
    if (berries > 0) {
      setBounce(true);
      setTimeout(() => setBounce(false), 500);
    }
  }, [berries]);

  const canFeed = berries > 0 && energy < 100;

  return (
    <>
      {/* Basket button */}
      <button
        ref={basketRef}
        onClick={() => setOpen(o => !o)}
        style={{
          background:"rgba(255,255,255,0.88)",
          border:`1.5px solid ${C.border}`,
          borderRadius:50, padding:"6px 10px",
          cursor:"pointer",
          display:"flex", alignItems:"center", gap:5,
          boxShadow:"0 2px 10px rgba(124,77,255,0.12)",
          position:"relative",
          transition:"transform 0.15s",
        }}
        onMouseDown={e=>e.currentTarget.style.transform="scale(0.95)"}
        onMouseUp={e=>e.currentTarget.style.transform="scale(1)"}>
        <BasketSVG size={28} bounce={bounce}/>
        {berries > 0 && (
          <div style={{
            position:"absolute", top:-4, right:-4,
            background:C.purple, borderRadius:50,
            minWidth:18, height:18,
            display:"flex", alignItems:"center", justifyContent:"center",
            padding:"0 4px",
            boxShadow:"0 2px 6px rgba(124,77,255,0.4)",
          }}>
            <p style={{fontFamily:F.b,fontWeight:800,fontSize:10,
              color:"#fff",margin:0}}>{berries}</p>
          </div>
        )}
      </button>

      {open && (
        <BasketPanel
          berries={berries}
          energy={energy}
          mascotName={mascotName}
          onClose={() => setOpen(false)}
          onFeed={() => { onFeed(); setOpen(false); }}
          canFeed={canFeed}
        />
      )}
    </>
  );
}
