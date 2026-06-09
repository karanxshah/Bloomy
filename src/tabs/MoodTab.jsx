import { useApp } from "../AppContext.jsx";
import { Card, Icon, MoodFace, Btn, Tooltip, Label } from "../components/UI.jsx";
import { F, MOODS, MOOD_COLORS, MOOD_BG, MOOD_MESSAGES } from "../constants.js";
import { today, last7Days } from "../constants.js";

export default function MoodTab() {
  const {
    theme, selectedMood, setSelectedMood,
    moodLogged, setMoodLogged, moodNote, setMoodNote,
    moodNoteStep, setMoodNoteStep, savingNote,
    logMood, saveMoodNote, moodLog, seenTooltips, setSeenTooltips,
    activeChild, setActiveChild, setChildren, supabase, setTab,
  } = useApp();

  const C = theme;
  const week = last7Days();

  const dismissTooltip = async () => {
    const updated = { ...seenTooltips, mood:true };
    setSeenTooltips(updated);
    if (activeChild) {
      await supabase.from("children").update({ seen_tooltips:updated }).eq("id", activeChild.id);
      setActiveChild(prev=>({...prev, seen_tooltips:updated}));
      setChildren(prev=>prev.map(c=>c.id===activeChild.id?{...c,seen_tooltips:updated}:c));
    }
  };

  return (
    <div style={{ paddingTop:12, animation:"fadeIn 0.4s ease" }}>
      <h2 style={{ fontFamily:F.h, fontSize:28, fontWeight:800, color:C.text, marginBottom:4 }}>
        How are you feeling?
      </h2>
      <p style={{ color:C.muted, fontSize:15, marginBottom:12, fontWeight:500 }}>
        Tap the one that feels right.
      </p>

      <Tooltip
        text="Tap a face that matches how you feel right now. You can log your mood every day!"
        seen={seenTooltips.mood} theme={C} onDismiss={dismissTooltip}
      />

      <div style={{ display:"grid", gridTemplateColumns:"1fr 1fr 1fr", gap:12, marginBottom:18 }}>
        {MOODS.map(m=>(
          <button key={m} onClick={()=>{setSelectedMood(m);setMoodLogged(false);}} style={{
            background:selectedMood===m?MOOD_COLORS[m]:MOOD_BG[m],
            border:`2px solid ${selectedMood===m?MOOD_COLORS[m]:"transparent"}`,
            borderRadius:18, padding:"16px 8px", cursor:"pointer",
            display:"flex", flexDirection:"column", alignItems:"center", gap:8,
            transform:selectedMood===m?"scale(1.07)":"scale(1)", transition:"all 0.18s",
            boxShadow:selectedMood===m?`0 6px 18px ${MOOD_COLORS[m]}44`:"none",
          }}>
            <MoodFace type={m} size={40} active={selectedMood===m}/>
            <span style={{ fontSize:12, fontWeight:700, fontFamily:F.b, color:selectedMood===m?"#fff":MOOD_COLORS[m] }}>{m}</span>
          </button>
        ))}
      </div>

      {selectedMood && !moodLogged && (
        <Card style={{ background:MOOD_BG[selectedMood], textAlign:"center", animation:"scaleIn 0.3s ease" }}>
          <div style={{ display:"flex", justifyContent:"center", marginBottom:12 }}>
            <MoodFace type={selectedMood} size={64}/>
          </div>
          <p style={{ fontFamily:F.h, fontWeight:800, fontSize:20, color:MOOD_COLORS[selectedMood], marginBottom:6 }}>
            {MOOD_MESSAGES[selectedMood].title}
          </p>
          <p style={{ color:C.muted, marginBottom:18, fontSize:14, fontWeight:500 }}>
            {MOOD_MESSAGES[selectedMood].sub}
          </p>
          <Btn onClick={()=>logMood(selectedMood)} color={MOOD_COLORS[selectedMood]} icon="check">
            Log My Mood
          </Btn>
        </Card>
      )}

      {moodLogged && moodNoteStep==="note" && (
        <Card style={{ animation:"scaleIn 0.3s ease", background:MOOD_BG[selectedMood] }}>
          <p style={{ fontFamily:F.h, fontWeight:800, fontSize:20, color:MOOD_COLORS[selectedMood], marginBottom:4 }}>
            Want to share why?
          </p>
          <p style={{ fontFamily:F.b, fontWeight:500, fontSize:14, color:C.muted, marginBottom:14, lineHeight:1.6 }}>
            You can write a little note about how you are feeling. Only you and your parent can see this.
          </p>
          <textarea
            value={moodNote}
            onChange={e=>setMoodNote(e.target.value)}
            placeholder="I feel this way because..."
            maxLength={200}
            style={{
              width:"100%", minHeight:90,
              border:`2px solid ${MOOD_COLORS[selectedMood]}44`,
              borderRadius:16, padding:"12px 14px", fontSize:15, fontFamily:F.b,
              fontWeight:500, color:C.text, background:"rgba(255,255,255,0.7)",
              lineHeight:1.7, resize:"none", outline:"none", display:"block", marginBottom:12,
            }}
            onFocus={e=>e.target.style.border=`2px solid ${MOOD_COLORS[selectedMood]}`}
            onBlur={e=>e.target.style.border=`2px solid ${MOOD_COLORS[selectedMood]}44`}
          />
          <div style={{ display:"flex", gap:10 }}>
            <Btn onClick={saveMoodNote} loading={savingNote} color={MOOD_COLORS[selectedMood]} style={{ flex:1 }} icon="check">
              Save Note
            </Btn>
            <Btn onClick={()=>setMoodNoteStep("done")} color="#fff" textColor={C.muted}
              style={{ flex:1, border:`1.5px solid ${C.border}` }} small>
              Skip
            </Btn>
          </div>
        </Card>
      )}

      {moodLogged && moodNoteStep==="done" && (() => {
        const LOW_MOODS = ["Sad","Angry","Worried","Tired"];
        const isLow = LOW_MOODS.includes(selectedMood);
        const followUp = {
          Sad:     { msg:"When we're sad, breathing slowly can really help 💙", action:"breathe", label:"Try Breathing", icon:"wind",  color:"#4FC3F7" },
          Angry:   { msg:"Feeling angry? A breathing exercise can help you cool down 🌬️", action:"breathe", label:"Try Breathing", icon:"wind",  color:"#FF7043" },
          Worried: { msg:"Writing down worries can make them feel smaller ✏️",  action:"journal", label:"Write It Out", icon:"book",  color:"#CE93D8" },
          Tired:   { msg:"Even a quick breath can give you a little boost 🌿",   action:"breathe", label:"Try Breathing", icon:"wind",  color:"#A5D6A7" },
        };
        const tip = followUp[selectedMood];
        return (
          <Card style={{ textAlign:"center", animation:"scaleIn 0.3s ease" }}>
            <div style={{ background:"#E0F2F1", borderRadius:"50%", width:68, height:68,
              display:"flex", alignItems:"center", justifyContent:"center", margin:"0 auto 14px" }}>
              <Icon name="check" size={36} color={C.mint}/>
            </div>
            <p style={{ fontFamily:F.h, fontWeight:800, fontSize:22, color:C.text, marginBottom:4 }}>Mood logged!</p>
            <p style={{ color:C.muted, marginBottom:16, fontSize:14, fontWeight:500 }}>Great job checking in today.</p>
            {isLow && tip && (
              <div style={{ background:MOOD_BG[selectedMood], borderRadius:16, padding:"14px 16px", marginBottom:16 }}>
                <p style={{ fontFamily:F.b, fontWeight:600, fontSize:14, color:C.text, margin:"0 0 12px", lineHeight:1.6 }}>
                  {tip.msg}
                </p>
                <Btn onClick={()=>{ setMoodLogged(false); setSelectedMood(null); setMoodNoteStep("log"); setMoodNote(""); setTab(tip.action); }}
                  color={tip.color} icon={tip.icon} style={{ width:"100%", justifyContent:"center" }}>
                  {tip.label}
                </Btn>
              </div>
            )}
            <Btn onClick={()=>{ setMoodLogged(false); setSelectedMood(null); setMoodNoteStep("log"); setMoodNote(""); setTab("home"); }}
              color={C.purple} textColor="#fff" small icon="check">
              Back to Home
            </Btn>
          </Card>
        );
      })()}

      <Card>
        <Label color={C.muted}>This Week</Label>
        <div style={{ display:"flex", justifyContent:"space-between", alignItems:"flex-end" }}>
          {week.map(d=>{
            const entry = moodLog.slice().reverse().find(e=>e.date===d.date);
            return (
              <div key={d.date} style={{ textAlign:"center", display:"flex", flexDirection:"column", alignItems:"center", gap:5 }}>
                {entry
                  ? <MoodFace type={entry.mood} size={30}/>
                  : <div style={{ width:30, height:30, borderRadius:"50%", background:"#f0f0f0", border:"1.5px dashed #ddd" }}/>}
                <span style={{ fontSize:11, color:C.muted, fontWeight:700, fontFamily:F.b }}>{d.label}</span>
              </div>
            );
          })}
        </div>
      </Card>

      {moodLog.length > 0 && (
        <Card>
          <Label color={C.muted}>Recent Moods</Label>
          {[...moodLog].reverse().slice(0,5).map((e,i)=>(
            <div key={e.id} style={{ padding:"10px 0", borderBottom:i<4?`1px solid ${C.border}`:"none" }}>
              <div style={{ display:"flex", alignItems:"center", gap:12 }}>
                <MoodFace type={e.mood} size={32}/>
                <span style={{ flex:1, fontWeight:700, color:MOOD_COLORS[e.mood], fontSize:14, fontFamily:F.b }}>{e.mood}</span>
                <span style={{ fontSize:12, color:C.muted, fontFamily:F.b }}>{e.date===today()?"Today":e.date}</span>
              </div>
              {e.note && (
                <p style={{ fontFamily:F.b, fontSize:13, fontWeight:500, color:C.muted, margin:"6px 0 0 44px", fontStyle:"italic", lineHeight:1.5 }}>
                  "{e.note}"
                </p>
              )}
            </div>
          ))}
        </Card>
      )}
    </div>
  );
}
