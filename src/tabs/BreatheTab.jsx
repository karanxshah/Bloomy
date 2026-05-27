import { useEffect, useRef } from "react";
import { useApp } from "../AppContext.jsx";
import { Card, Btn, Tooltip } from "../components/UI.jsx";
import { F, BREATHING } from "../constants.js";
import { GrowthMascot } from "../MascotGrowth.jsx";

export default function BreatheTab() {
  const {
    theme, breathPhase, setBreathPhase, breathActive, setBreathActive,
    breathCount, setBreathCount, dailyBreathCount, setDailyBreathCount, cm, currentStage,
    seenTooltips, setSeenTooltips, activeChild, setActiveChild,
    setChildren, supabase, showSeedPopup, earnBerry, completeMission,
    checkGrowthStageUp, moodLog, journals,
    tab,
  } = useApp();

  const C = theme;
  const timerRef = useRef(null);

  /* ── Clear the timer and fully reset when user leaves the tab ── */
  useEffect(() => {
    if (tab !== "breathe") {
      if (timerRef.current) {
        clearTimeout(timerRef.current);
        timerRef.current = null;
      }
      setBreathActive(false);
      setBreathPhase(0);
      setBreathCount(0);
    }
  }, [tab]);

  /* ── Breathing cycle timer ── */
  useEffect(() => {
    if (!breathActive) {
      if (timerRef.current) {
        clearTimeout(timerRef.current);
        timerRef.current = null;
      }
      return;
    }

    timerRef.current = setTimeout(async () => {
      const next = (breathPhase + 1) % BREATHING.length;
      setBreathPhase(next);
      if (next === 0) {
        setBreathCount(c => c + 1);
        setDailyBreathCount(c => {
          const next = c + 1;
          try {
            const todayStr = new Date().toISOString().split("T")[0];
            localStorage.setItem("bloomy_breath_count", String(next));
            localStorage.setItem("bloomy_breath_date", todayStr);
          } catch {}
          return next;
        });
        showSeedPopup(2);
        earnBerry();
        completeMission("breathe");
        if (activeChild) {
          const newCount = (activeChild.breath_sessions || 0) + 1;
          const todayStr = new Date().toISOString().split("T")[0];
          const { error } = await supabase.from("children")
            .update({ breath_sessions: newCount, last_breath_date: todayStr })
            .eq("id", activeChild.id);
          if (!error) {
            const updatedChild = { ...activeChild, breath_sessions: newCount, last_breath_date: todayStr };
            setActiveChild(updatedChild);
            setChildren(prev => prev.map(c => c.id === activeChild.id ? updatedChild : c));
            checkGrowthStageUp(moodLog, journals, updatedChild);
          }
        }
      }
    }, BREATHING[breathPhase].duration * 1000);

    return () => {
      if (timerRef.current) {
        clearTimeout(timerRef.current);
        timerRef.current = null;
      }
    };
  }, [breathActive, breathPhase]);

  const handleStartStop = () => {
    if (breathActive) {
      // Stop — cancel timer and reset phase only
      if (timerRef.current) {
        clearTimeout(timerRef.current);
        timerRef.current = null;
      }
      setBreathActive(false);
      setBreathPhase(0);
    } else {
      // Start — reset phase but keep accumulated count
      setBreathPhase(0);
      setBreathActive(true);
    }
  };

  const dismissTooltip = async () => {
    const updated = { ...seenTooltips, breathe:true };
    setSeenTooltips(updated);
    if (activeChild) {
      await supabase.from("children").update({ seen_tooltips:updated }).eq("id", activeChild.id);
      setActiveChild(prev=>({...prev, seen_tooltips:updated}));
      setChildren(prev=>prev.map(c=>c.id===activeChild.id?{...c,seen_tooltips:updated}:c));
    }
  };

  return (
    <div style={{ paddingTop:12, animation:"fadeIn 0.4s ease" }}>
      <h2 style={{ fontFamily:F.h, fontSize:28, fontWeight:800, color:C.text, marginBottom:4, textAlign:"center" }}>
        Breathe With Me
      </h2>
      <p style={{ color:C.muted, fontSize:15, marginBottom:16, fontWeight:500, textAlign:"center" }}>
        Let's calm down together.
      </p>
      <div style={{ textAlign:"left" }}>
        <Tooltip
          text="Press Start and follow along — breathe in, hold, and breathe out. Each full cycle earns you points!"
          seen={seenTooltips.breathe} theme={C} onDismiss={dismissTooltip}
        />
      </div>

      {/* Phase labels row */}
      <div style={{ display:"flex", gap:8, justifyContent:"center", marginBottom:20 }}>
        {BREATHING.map((b,i)=>(
          <div key={b.phase} style={{
            background:breathPhase===i&&breathActive?b.color:"#EEE9FF",
            color:breathPhase===i&&breathActive?"#fff":C.muted,
            borderRadius:50, padding:"8px 16px", fontSize:13, fontWeight:700,
            fontFamily:F.b, transition:"all 0.6s",
          }}>{b.phase}</div>
        ))}
      </div>

      {/* Breathing circle */}
      <div style={{ display:"flex", flexDirection:"column", alignItems:"center", marginBottom:24 }}>
        <div style={{ position:"relative", width:240, height:240, display:"flex", alignItems:"center", justifyContent:"center" }}>
          <style>{`
            @keyframes breatheIn  { from{transform:scale(0.65)} to{transform:scale(1.12)} }
            @keyframes breatheHold{ from{transform:scale(1.12)} to{transform:scale(1.12)} }
            @keyframes breatheOut { from{transform:scale(1.12)} to{transform:scale(0.65)} }
            @keyframes breatheIdle{ 0%{transform:scale(0.85)} 100%{transform:scale(0.95)} }
          `}</style>

          {/* Outer glow ring */}
          <div style={{
            position:"absolute", width:220, height:220, borderRadius:"50%",
            background:`radial-gradient(circle,${BREATHING[breathPhase].color}15,transparent 70%)`,
            border:`3px solid ${BREATHING[breathPhase].color}30`,
            animation: breathActive
              ? breathPhase===0 ? "breatheIn 4s ease-in-out forwards"
              : breathPhase===1 ? "breatheHold 2s linear forwards"
              : "breatheOut 4s ease-in-out forwards"
              : "breatheIdle 3s ease-in-out infinite alternate",
            transition:"border-color 0.6s, background 0.6s",
          }}/>

          {/* Inner bubble */}
          <div style={{
            position:"absolute", width:160, height:160, borderRadius:"50%",
            background:`radial-gradient(circle at 38% 35%, ${BREATHING[breathPhase].color}28, ${BREATHING[breathPhase].color}08)`,
            border:`2.5px solid ${BREATHING[breathPhase].color}88`,
            boxShadow: breathActive ? `0 0 ${breathPhase===1?44:22}px ${BREATHING[breathPhase].color}40` : "none",
            animation: breathActive
              ? breathPhase===0 ? "breatheIn 4s ease-in-out forwards"
              : breathPhase===1 ? "breatheHold 2s linear forwards"
              : "breatheOut 4s ease-in-out forwards"
              : "breatheIdle 3s ease-in-out infinite alternate",
            transition:"border-color 0.6s, background 0.6s, box-shadow 0.6s",
          }}/>

          {/* Mascot + text */}
          <div style={{ position:"absolute", display:"flex", flexDirection:"column", alignItems:"center", justifyContent:"center", zIndex:2 }}>
            <GrowthMascot id={cm.id} size={58} stage={currentStage.id}/>
            <p style={{ fontFamily:F.h, fontWeight:800, fontSize:15, color:BREATHING[breathPhase].color, marginTop:5, marginBottom:0, transition:"color 0.6s" }}>
              {breathActive ? BREATHING[breathPhase].phase : "Ready"}
            </p>
            {breathActive && (
              <p style={{ color:C.muted, fontSize:12, fontWeight:600, marginBottom:0 }}>
                {BREATHING[breathPhase].duration}s
              </p>
            )}
          </div>
        </div>
      </div>

      {/* Start/Stop */}
      <div style={{ display:"flex", justifyContent:"center", marginBottom:20 }}>
        <Btn onClick={handleStartStop} color={breathActive?"#EF5350":C.mint}>
          {breathActive ? "Stop" : "Start Breathing"}
        </Btn>
      </div>

      {dailyBreathCount > 0 && (
        <p style={{ color:C.purple, fontWeight:700, fontSize:16, fontFamily:F.b, textAlign:"center", marginBottom:16 }}>
          {dailyBreathCount} breath{dailyBreathCount>1?"s":""} complete today — well done!
        </p>
      )}

      <Card style={{ marginTop:4, textAlign:"left" }}>
        <p style={{ fontFamily:F.b, fontWeight:700, fontSize:12, color:C.muted, letterSpacing:1.3, textTransform:"uppercase", marginBottom:10 }}>
          Sessions completed
        </p>
        <p style={{ fontFamily:F.h, fontWeight:800, fontSize:28, color:C.purple, margin:0 }}>
          {activeChild.breath_sessions || 0}
        </p>
        <p style={{ color:C.muted, fontSize:14, fontWeight:500, marginTop:4 }}>
          {(activeChild.breath_sessions||0)>=5
            ? "Calm Champion badge earned!"
            : `${5-(activeChild.breath_sessions||0)} more for the Calm Champion badge`}
        </p>
      </Card>
    </div>
  );
}
