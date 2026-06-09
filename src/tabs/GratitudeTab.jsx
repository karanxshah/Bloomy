import { useState } from "react";
import { useApp } from "../AppContext.jsx";
import { Btn, Label } from "../components/UI.jsx";
import { F, SHADOW, RADIUS, gratColor } from "../constants.js";
import { today } from "../constants.js";

export default function GratitudeTab() {
  const {
    theme, gratitudeText, setGratitudeText, gratitudeSaved, setGratitudeSaved,
    gratitudes, saveGratitude, darkMode, activeChild,
  } = useApp();

  const C = theme;
  /* ── Jar colour — default teal ── */
  const jarColor = "#4DB6AC";
  const [shaking, setShaking]       = useState(false);
  const [floater, setFloater]       = useState(null); // { text, color, id }

  /* One color per gratitude, shared by the jar SVG and the recent list. */
  const getGratColor = (g, i) => gratColor(g.id || g.text || i);

  const handleShake = () => {
    if (gratitudes.length === 0 || shaking) return;
    const idx = Math.floor(Math.random() * gratitudes.length);
    const pick = gratitudes[idx];
    setShaking(true);
    // Unique id per shake so React always mounts a fresh element → animation always fires
    setFloater({ text: pick.text, color: getGratColor(pick, idx), id: Date.now() });
    setTimeout(() => setShaking(false), 600);
    setTimeout(() => setFloater(null), 2400);
  };

  return (
    <div style={{ paddingTop:12, animation:"fadeIn 0.4s ease" }}>
      <h2 style={{ fontFamily:F.h, fontSize:28, fontWeight:800, color:C.text, marginBottom:4 }}>
        Gratitude Jar
      </h2>
      <p style={{ color:C.muted, fontSize:15, marginBottom:18, fontWeight:500 }}>
        What are you grateful for today?
      </p>

      {/* SVG Gratitude Jar */}
      <div style={{ textAlign:"center", marginBottom:20, position:"relative" }}>
        <style>{`
          @keyframes jarShake {
            0%{transform:rotate(0deg)} 20%{transform:rotate(-7deg)} 40%{transform:rotate(7deg)}
            60%{transform:rotate(-5deg)} 80%{transform:rotate(4deg)} 100%{transform:rotate(0deg)}
          }
          @keyframes floatUp {
            0%  { opacity:0; transform:translateY(0) scale(0.7); }
            20% { opacity:1; transform:translateY(-18px) scale(1); }
            80% { opacity:1; transform:translateY(-60px) scale(1); }
            100%{ opacity:0; transform:translateY(-80px) scale(0.9); }
          }
        `}</style>
        {floater && (
          <div
            key={floater.id}
            style={{
              position:"absolute", left:"50%", top:"30%",
              transform:"translateX(-50%)",
              background: floater.color, color:"#fff",
              borderRadius:14, padding:"8px 16px",
              fontFamily:F.b, fontWeight:700, fontSize:13,
              pointerEvents:"none", zIndex:10, maxWidth:180, textAlign:"center",
              animation:"floatUp 2.4s ease forwards",
              boxShadow:`0 4px 16px ${floater.color}55`,
              whiteSpace:"nowrap", overflow:"hidden", textOverflow:"ellipsis",
            }}>
            {floater.text.length > 40 ? floater.text.slice(0,40)+"…" : floater.text}
          </div>
        )}
        <svg viewBox="0 0 260 280" width="220" height="240"
          onClick={handleShake}
          style={{
            overflow:"visible", display:"block", margin:"0 auto",
            cursor: gratitudes.length > 0 ? "pointer" : "default",
            animation: shaking ? "jarShake 0.6s ease" : "none",
            transformOrigin:"center bottom",
          }}
          role="img" aria-label={gratitudes.length > 0 ? "Gratitude jar — tap to shake!" : "Gratitude jar"}>
          <title>Gratitude jar</title>
          <ellipse cx="130" cy="268" rx="70" ry="8" fill="rgba(0,0,0,0.08)"/>
          <path d="M 60 100 Q 55 100 52 105 L 40 240 Q 38 260 60 265 L 200 265 Q 222 260 220 240 L 208 105 Q 205 100 200 100 Z"
            fill={darkMode?"#2a1f4a":"#E8F5E9"} stroke={jarColor} strokeWidth="3"/>
          <path d="M 75 115 Q 72 130 74 155" stroke="rgba(255,255,255,0.5)" strokeWidth="4" fill="none" strokeLinecap="round"/>
          <rect x="75" y="80" width="110" height="24" rx="6" fill={darkMode?"#2a1f4a":"#E8F5E9"} stroke={jarColor} strokeWidth="3"/>
          <rect x="65" y="58" width="130" height="28" rx="8" fill={jarColor}/>
          <rect x="80" y="44" width="100" height="20" rx="6" fill={jarColor+"CC"}/>
          <rect x="112" y="34" width="36" height="14" rx="7" fill={jarColor+"99"}/>
          {gratitudes.length===0 ? (
            <text x="130" y="190" textAnchor="middle" fontFamily={F.b} fontSize="12" fill="#9B8DB5">
              Add your first gratitude!
            </text>
          ) : (
            gratitudes.slice(0,8).map((g,i)=>{
              const color = getGratColor(g, i);
              const xPos = 70+(i%3)*50+(i%2)*8;
              const yPos = 130+Math.floor(i/3)*40+(i%2)*12;
              const rot = (i%2===0?-1:1)*(i*3%8+2);
              return (
                <g key={g.id||i} transform={`translate(${xPos},${yPos}) rotate(${rot})`}>
                  <rect x="-28" y="-10" width="56" height="22" rx="4" fill={color} opacity="0.95"/>
                  <text x="0" y="6" textAnchor="middle" fontFamily={F.b} fontSize="9" fontWeight="700" fill="#fff">
                    {g.text.length>10?g.text.slice(0,10)+"…":g.text}
                  </text>
                </g>
              );
            })
          )}
          <path d="M 75 115 Q 72 130 74 155" stroke="rgba(255,255,255,0.4)" strokeWidth="4" fill="none" strokeLinecap="round"/>
        </svg>
        <p style={{ fontFamily:F.b, fontWeight:600, fontSize:13, color:C.muted, marginTop:4 }}>
          {gratitudes.length} gratitude{gratitudes.length!==1?"s":""} in your jar
            {gratitudes.length > 8 && (
              <span style={{ color:C.purple, fontWeight:700 }}> · showing 8 of {gratitudes.length}</span>
            )}
        </p>
        {gratitudes.length > 0 && (
          <p style={{ fontFamily:F.b, fontWeight:600, fontSize:12, color:C.purple, marginTop:2 }}>
            ✨ Tap the jar to shake it!
          </p>
        )}
      </div>

      {/* Add new gratitude */}
      <div style={{ background:C.card, borderRadius:RADIUS.lg, padding:"20px", boxShadow:SHADOW.e1, marginBottom:14 }}>
        <p style={{ fontFamily:F.h, fontWeight:800, fontSize:17, color:C.text, margin:"0 0 12px" }}>
          Add to your jar
        </p>
        <textarea
          value={gratitudeText}
          onChange={e=>{ setGratitudeText(e.target.value); setGratitudeSaved(false); }}
          placeholder="I am grateful for..."
          maxLength={150}
          style={{
            width:"100%", minHeight:80, border:`2px solid ${C.border}`,
            borderRadius:16, padding:"12px 14px", fontSize:15, fontFamily:F.b,
            fontWeight:500, color:C.text, background:C.bg,
            lineHeight:1.7, resize:"none", outline:"none", display:"block", marginBottom:12,
          }}
          onFocus={e=>e.target.style.border=`2px solid ${C.mint}`}
          onBlur={e=>e.target.style.border=`2px solid ${C.border}`}
        />
        <Btn
          onClick={saveGratitude}
          disabled={!gratitudeText.trim()}
          color={gratitudeSaved?C.mint:"#43A047"}
          style={{ width:"100%", justifyContent:"center" }}
          icon={gratitudeSaved?"check":"plus"}
        >
          {gratitudeSaved?"Added to your jar!":"Add to Jar"}
        </Btn>
      </div>

      {/* Past gratitudes */}
      {gratitudes.length > 0 && (
        <div style={{ background:C.card, borderRadius:RADIUS.lg, padding:"20px", boxShadow:SHADOW.e1 }}>
          <Label color={C.muted}>Recent Gratitudes</Label>
          {gratitudes.map((g,i)=>(
            <div key={g.id||i} style={{
              display:"flex", alignItems:"flex-start", gap:12,
              padding:"10px 0",
              borderBottom:i<gratitudes.length-1?`1px solid ${C.border}`:"none",
            }}>
              <div style={{
                width:10, height:10, borderRadius:"50%", flexShrink:0, marginTop:5,
                background:getGratColor(g, i),
              }}/>
              <div style={{ flex:1 }}>
                <p style={{ fontFamily:F.b, fontWeight:600, fontSize:14, color:C.text, margin:0, lineHeight:1.6 }}>{g.text}</p>
                <p style={{ fontFamily:F.b, fontWeight:500, fontSize:11, color:C.muted, margin:"2px 0 0" }}>
                  {g.date===today()?"Today":g.date}
                </p>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
