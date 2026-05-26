import { useState, useRef } from "react";
import { useApp } from "../AppContext.jsx";
import { Card, Icon, Btn, Label, Tooltip } from "../components/UI.jsx";
import { F, JOURNAL_PROMPTS, ALL_AFFIRMATIONS, getSortedAffirmations } from "../constants.js";
import { today } from "../constants.js";

/* ── Journal Tab ── */
export function JournalTab() {
  const {
    theme, journalText, setJournalText, journalSaved, setJournalSaved,
    promptIdx, setPromptIdx, saveLoading, saveJournal,
    journals, setJournals, cm, seenTooltips, setSeenTooltips,
    activeChild, setActiveChild, setChildren, supabase,
  } = useApp();
  const [expandedId, setExpandedId] = useRef ? useRef(null) : { current: null };
  const [expanded, setExpanded] = useState(null);

  const C = theme;

  const dismissTooltip = async () => {
    const updated = { ...seenTooltips, journal:true };
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
        My Journal
      </h2>
      <p style={{ color:C.muted, fontSize:15, marginBottom:12, fontWeight:500 }}>
        Your thoughts are safe here.
      </p>

      <Tooltip
        text="Read the prompt and write whatever comes to mind. There are no wrong answers — your thoughts are private!"
        seen={seenTooltips.journal} theme={C} onDismiss={dismissTooltip}
      />

      <Card style={{ background:`linear-gradient(135deg,${C.pink},${C.purple})`, marginBottom:14 }}>
        <p style={{ color:"rgba(255,255,255,0.8)", fontWeight:700, fontSize:12, letterSpacing:1, textTransform:"uppercase", marginBottom:8 }}>
          Today's Prompt
        </p>
        <p style={{ color:"#fff", fontSize:18, fontWeight:700, fontFamily:F.h, lineHeight:1.5, margin:"0 0 14px" }}>
          {JOURNAL_PROMPTS[promptIdx]}
        </p>
        <button onClick={()=>setPromptIdx(i=>(i+1)%JOURNAL_PROMPTS.length)} style={{
          background:"rgba(255,255,255,0.22)", border:"none", color:"#fff",
          borderRadius:50, padding:"7px 18px", cursor:"pointer",
          fontSize:13, fontWeight:600, fontFamily:F.b,
          display:"inline-flex", alignItems:"center", gap:6,
        }}>
          <Icon name="refresh" size={14} color="#fff"/> Different prompt
        </button>
      </Card>

      {/* Textarea card */}
      <div style={{ background:"#fff", borderRadius:20, marginBottom:14, boxShadow:"0 2px 18px rgba(124,77,255,0.09)", overflow:"hidden" }}>
        <div style={{ padding:"20px 20px 0" }}>
          <Label>Write here</Label>
          <textarea
            value={journalText}
            onChange={e=>{setJournalText(e.target.value);setJournalSaved(false);}}
            placeholder="Write anything you want — there are no wrong answers."
            style={{
              width:"100%", minHeight:150,
              border:"2px solid #EEE9FF", borderRadius:16,
              padding:"14px 16px", fontSize:16, fontFamily:F.b, fontWeight:500,
              color:"#2D2040", background:"#F7F4FF",
              lineHeight:1.8, resize:"none", outline:"none", display:"block",
              WebkitAppearance:"none", MozAppearance:"none",
            }}
            onFocus={e=>{e.target.style.border=`2px solid ${C.purple}`;e.target.style.background="#fff";}}
            onBlur={e=>{e.target.style.border="2px solid #EEE9FF";e.target.style.background="#F7F4FF";}}
          />
        </div>
        <div style={{ display:"flex", justifyContent:"space-between", alignItems:"center", padding:"12px 20px", borderTop:`1px solid ${C.border}`, marginTop:12 }}>
          <span style={{ color:C.muted, fontSize:13, fontFamily:F.b, fontWeight:500 }}>{journalText.length} characters</span>
          <Btn
            onClick={saveJournal}
            disabled={!journalText.trim()||journalSaved}
            loading={saveLoading} small
            color={journalSaved?C.mint:C.pink}
            icon={journalSaved?"check":null}
          >
            {journalSaved?"Saved":"Save Entry"}
          </Btn>
        </div>
      </div>

      {journalSaved && (
        <Card style={{ textAlign:"center", background:"#E8F5E9", animation:"scaleIn 0.3s ease" }}>
          <div style={{ background:"#C8E6C9", borderRadius:"50%", width:64, height:64, display:"flex", alignItems:"center", justifyContent:"center", margin:"0 auto 12px" }}>
            <Icon name="check" size={34} color="#2E7D32"/>
          </div>
          <p style={{ fontFamily:F.h, fontWeight:800, fontSize:20, color:"#2E7D32", marginBottom:4 }}>Amazing job writing today!</p>
          <p style={{ color:"#66BB6A", fontSize:14, fontWeight:500 }}>{cm.name} is so proud of you.</p>
          <Btn small color="#fff" textColor="#43A047" style={{ marginTop:12, border:"1.5px solid #A5D6A7" }}
            onClick={()=>{setJournalText("");setJournalSaved(false);setPromptIdx(i=>(i+1)%JOURNAL_PROMPTS.length);}}>
            Write another
          </Btn>
        </Card>
      )}

      {journals.length > 0 && (
        <Card>
          <Label>Past Entries ({journals.length})</Label>
          {journals.slice(0,5).map((j,i)=>(
            <div key={j.id} style={{ padding:"12px 0", borderBottom:i<Math.min(4,journals.length-1)?"1px solid #F0EAFF":"none" }}>
              <div style={{ display:"flex", justifyContent:"space-between", alignItems:"flex-start", marginBottom:4, gap:8 }}>
                <div style={{ flex:1 }}>
                  <span style={{ fontSize:12, fontWeight:700, color:C.purple, fontFamily:F.b }}>{j.prompt}</span>
                </div>
                <div style={{ display:"flex", alignItems:"center", gap:8, flexShrink:0 }}>
                  <span style={{ fontSize:11, color:C.muted, fontFamily:F.b }}>
                    {j.date===today()?"Today":j.date}
                  </span>
                  <button
                    onClick={async()=>{
                      if (!window.confirm("Delete this journal entry?")) return;
                      await supabase.from("journal_entries").delete().eq("id", j.id);
                      setJournals(prev=>prev.filter(e=>e.id!==j.id));
                    }}
                    style={{ background:"#FFF5F5", border:"1px solid #FFCDD2", borderRadius:8,
                      padding:"3px 7px", cursor:"pointer", fontSize:11, color:"#E53935",
                      fontFamily:F.b, fontWeight:700 }}>
                    Delete
                  </button>
                </div>
              </div>
              <p
                onClick={()=>setExpanded(expanded===j.id?null:j.id)}
                style={{ color:C.text, fontSize:14, lineHeight:1.6, fontWeight:500, margin:"0 0 4px",
                  overflow:expanded===j.id?"visible":"hidden",
                  textOverflow:expanded===j.id?"unset":"ellipsis",
                  display:expanded===j.id?"block":"-webkit-box",
                  WebkitLineClamp:expanded===j.id?undefined:2,
                  WebkitBoxOrient:"vertical",
                  cursor:"pointer",
                }}>
                {j.text}
              </p>
              {j.text.length > 80 && (
                <button onClick={()=>setExpanded(expanded===j.id?null:j.id)} style={{
                  background:"none", border:"none", cursor:"pointer",
                  color:C.purple, fontFamily:F.b, fontWeight:700, fontSize:12, padding:0,
                }}>
                  {expanded===j.id ? "Show less ↑" : "Read more ↓"}
                </button>
              )}
            </div>
          ))}
        </Card>
      )}
    </div>
  );
}

/* ── Affirmations Tab ── */
export function AffirmTab() {
  const {
    theme, affirmIdx, setAffirmIdx, affirmAnim, nextAffirm,
    showAllAffirm, setShowAllAffirm, lastMood, activeChild,
    seenTooltips, setSeenTooltips, setActiveChild, setChildren, supabase,
  } = useApp();
  const swipeTouchX = useRef(null);

  const C = theme;
  const sorted = getSortedAffirmations(lastMood);

  const dismissTooltip = async () => {
    const updated = { ...seenTooltips, affirm:true };
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
        Daily Affirmations
      </h2>
      <p style={{ color:C.muted, fontSize:15, marginBottom:12, fontWeight:500 }}>
        Tap the card to flip to the next one.
      </p>

      <Tooltip
        text="Each card has a positive message just for you. Tap to flip through them and earn points!"
        seen={seenTooltips.affirm} theme={C} onDismiss={dismissTooltip}
      />

      {/* Card deck */}
      <div
        style={{ position:"relative", height:260, marginBottom:20, cursor:"pointer" }}
        onClick={nextAffirm}
        onTouchStart={e=>{ swipeTouchX.current = e.touches[0].clientX; }}
        onTouchEnd={e=>{
          if (swipeTouchX.current === null) return;
          const dx = e.changedTouches[0].clientX - swipeTouchX.current;
          swipeTouchX.current = null;
          if (Math.abs(dx) > 40) nextAffirm();
        }}
      >
        <div style={{ position:"absolute", top:8, left:"4%", right:"4%", bottom:0,
          background:`${ALL_AFFIRMATIONS[(affirmIdx+2)%ALL_AFFIRMATIONS.length].color}55`,
          borderRadius:24, transform:"rotate(-2deg)" }}/>
        <div style={{ position:"absolute", top:4, left:"2%", right:"2%", bottom:0,
          background:`${ALL_AFFIRMATIONS[(affirmIdx+1)%ALL_AFFIRMATIONS.length].color}88`,
          borderRadius:24, transform:"rotate(-1deg)" }}/>
        <div style={{
          position:"absolute", top:0, left:0, right:0, bottom:0,
          background:`linear-gradient(135deg,${sorted[affirmIdx%30].color},${C.pink})`,
          borderRadius:24, padding:"36px 28px",
          display:"flex", flexDirection:"column", alignItems:"center", justifyContent:"center",
          boxShadow:`0 10px 36px ${sorted[affirmIdx%30].color}44`,
          animation: affirmAnim==="swiping"
            ? "swipeLeft 0.35s ease-in forwards"
            : affirmAnim==="entering"
            ? "slideRight 0.4s ease-out forwards"
            : "none",
          textAlign:"center",
        }}>
          <Icon name="star" size={40} color="rgba(255,255,255,0.6)" style={{ marginBottom:16 }}/>
          <p style={{ color:"#fff", fontSize:24, fontWeight:800, fontFamily:F.h, lineHeight:1.35, margin:"0 0 16px" }}>
            {sorted[affirmIdx%30].text}
          </p>
          <div style={{ display:"flex", alignItems:"center", gap:6, color:"rgba(255,255,255,0.65)", fontSize:13, fontWeight:600 }}>
            <Icon name="next" size={14} color="rgba(255,255,255,0.65)"/> Tap to flip
          </div>
        </div>
      </div>

      {/* Dot indicators */}
      <div style={{ display:"flex", gap:6, justifyContent:"center", marginBottom:20 }}>
        {Array.from({length:10},(_,i)=>(
          <div key={i} onClick={()=>setAffirmIdx(i)} style={{
            width:i===(affirmIdx%10)?22:7, height:7, borderRadius:50,
            background:i===(affirmIdx%10)?C.purple:"#DDD",
            transition:"all 0.3s", cursor:"pointer",
          }}/>
        ))}
      </div>

      <Card style={{ display:"flex", alignItems:"center", gap:14, padding:"16px 20px", background:"linear-gradient(135deg,#F7F4FF,#FCE4EC)" }}>
        <div style={{ background:"#EDE7F6", borderRadius:50, padding:10, flexShrink:0 }}>
          <Icon name="star" size={22} color={C.purple}/>
        </div>
        <div>
          <p style={{ fontFamily:F.h, fontWeight:800, fontSize:16, color:C.text, margin:0 }}>
            {activeChild.affirm_count||0} affirmations read
          </p>
          <p style={{ color:C.muted, fontSize:13, fontWeight:500, margin:0 }}>
            {(activeChild.affirm_count||0)>=20
              ? "Affirmation Pro badge earned!"
              : `${20-(activeChild.affirm_count||0)} more for the badge`}
          </p>
        </div>
      </Card>

      <Card bg={C.card}>
        <div style={{ display:"flex", justifyContent:"space-between", alignItems:"center", marginBottom:10 }}>
          <Label color={C.muted} style={{ margin:0 }}>All Affirmations</Label>
          <button onClick={()=>setShowAllAffirm(s=>!s)} style={{
            background:C.purple+"18", border:"none", borderRadius:50,
            padding:"4px 12px", cursor:"pointer",
            color:C.purple, fontFamily:F.b, fontWeight:700, fontSize:12,
          }}>
            {showAllAffirm?"Show less":"See all 30"}
          </button>
        </div>
        {sorted.slice(0,showAllAffirm?30:5).map((a,i)=>(
          <div key={i} onClick={()=>setAffirmIdx(i)} style={{
            display:"flex", alignItems:"center", gap:14, padding:"11px 0",
            borderBottom:i<(showAllAffirm?29:4)?`1px solid ${C.border}`:"none",
            cursor:"pointer", opacity:(affirmIdx%30)===i?1:0.5, transition:"opacity 0.2s",
          }}>
            <div style={{ width:8, height:8, borderRadius:"50%", background:a.color, flexShrink:0 }}/>
            <span style={{ fontWeight:600, color:C.text, fontSize:15, fontFamily:F.b }}>{a.text}</span>
          </div>
        ))}
        {!showAllAffirm && (
          <button onClick={()=>setShowAllAffirm(true)} style={{
            width:"100%", marginTop:8, background:C.purple+"10",
            border:`1.5px dashed ${C.purple}44`, borderRadius:12,
            padding:"10px", cursor:"pointer",
            color:C.purple, fontFamily:F.b, fontWeight:700, fontSize:13,
          }}>
            + Show 25 more affirmations
          </button>
        )}
      </Card>
    </div>
  );
}
