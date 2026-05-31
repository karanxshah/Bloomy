import { useState } from "react";
import { useApp } from "../AppContext.jsx";
import { Card, Icon, MoodFace } from "../components/UI.jsx";
import { F, MOOD_BG, MOOD_COLORS, STAGE_BGSANIM, getTimeGreeting, getSortedAffirmations } from "../constants.js";
import { today } from "../constants.js";
import { GrowthMascot, GardenScene, GrowthProgressBar } from "../MascotGrowth.jsx";
import { getActivityTier } from "../MascotRoom.jsx";

/* ── Feelings vocabulary word bank ───────────────────────────────── */
const FEELINGS_WORDS = [
  { word:"Joyful",      emoji:"😄", color:"#FFD54F", def:"Feeling really, really happy — like your heart is dancing!", example:"I felt joyful on my birthday." },
  { word:"Calm",        emoji:"😌", color:"#81C784", def:"Feeling peaceful and still inside, like a quiet lake.",      example:"I felt calm after my breathing exercise." },
  { word:"Proud",       emoji:"🌟", color:"#FF8A65", def:"Feeling good about something you did or who you are.",       example:"I felt proud when I helped my friend." },
  { word:"Nervous",     emoji:"😬", color:"#CE93D8", def:"Feeling a little worried about something that hasn't happened yet.", example:"I felt nervous before my test." },
  { word:"Frustrated",  emoji:"😤", color:"#EF5350", def:"Feeling stuck or annoyed when things don't go the way you wanted.", example:"I felt frustrated when I couldn't open the jar." },
  { word:"Grateful",    emoji:"🙏", color:"#4DB6AC", def:"Feeling thankful for something good in your life.",          example:"I felt grateful for my warm bed." },
  { word:"Overwhelmed", emoji:"😵", color:"#7E57C2", def:"Feeling like too many things are happening all at once.",    example:"I felt overwhelmed with so much homework." },
  { word:"Curious",     emoji:"🔍", color:"#4FC3F7", def:"Feeling excited to learn or find out about something.",     example:"I felt curious about how butterflies are made." },
  { word:"Embarrassed", emoji:"😳", color:"#F06292", def:"Feeling shy or uncomfortable when something goes wrong in front of others.", example:"I felt embarrassed when I tripped." },
  { word:"Hopeful",     emoji:"🌈", color:"#66BB6A", def:"Feeling like good things are coming, even if today is hard.", example:"I felt hopeful that tomorrow would be better." },
  { word:"Lonely",      emoji:"🥺", color:"#78909C", def:"Feeling like you wish you had someone to be with.",         example:"I felt lonely when my friend moved away." },
  { word:"Excited",     emoji:"🎉", color:"#FFA726", def:"Feeling full of energy about something great that is happening!", example:"I felt excited on the first day of holidays." },
  { word:"Disappointed",emoji:"😔", color:"#90A4AE", def:"Feeling sad when something you hoped for didn't happen.",   example:"I felt disappointed when the trip was cancelled." },
  { word:"Loved",       emoji:"💖", color:"#EC407A", def:"Feeling cared for and important to someone.",               example:"I felt loved when my mum gave me a hug." },
  { word:"Brave",       emoji:"🦁", color:"#FF7043", def:"Feeling ready to try something even if it feels scary.",    example:"I felt brave when I tried the high dive." },
  { word:"Confused",    emoji:"😕", color:"#9575CD", def:"Feeling mixed up or unsure about what is happening.",       example:"I felt confused by the instructions." },
  { word:"Cosy",        emoji:"🧸", color:"#A1887F", def:"Feeling warm, safe, and comfortable.",                      example:"I felt cosy reading under my blanket." },
  { word:"Jealous",     emoji:"😒", color:"#8BC34A", def:"Feeling upset that someone else has something you want.",   example:"I felt jealous of my sister's new toy." },
  { word:"Silly",       emoji:"🤪", color:"#FFCA28", def:"Feeling playful and wanting to laugh and joke around.",     example:"I felt silly wearing the funny hat." },
  { word:"Relieved",    emoji:"😮‍💨", color:"#26C6DA", def:"Feeling much better after something scary or stressful is over.", example:"I felt relieved when I found my lost dog." },
  { word:"Anxious",     emoji:"😰", color:"#AB47BC", def:"Feeling worried and tense, like something bad might happen.", example:"I felt anxious waiting for the doctor." },
  { word:"Determined",  emoji:"💪", color:"#42A5F5", def:"Feeling strong and sure that you will keep trying no matter what.", example:"I felt determined to finish the puzzle." },
];
function getTodaysWord() {
  const d = today();
  const seed = d.split("-").reduce((a,n)=>a+Number(n),0);
  return FEELINGS_WORDS[seed % FEELINGS_WORDS.length];
}

const MASCOT_DAILY_MESSAGES = [
  "I'm so happy you're here today! 🌟",
  "You make every day brighter! ☀️",
  "I've been thinking about you all day! 💜",
  "Ready for an amazing day together? 🌈",
  "You are so special to me! 🐾",
  "I believe in you with my whole heart! ❤️",
  "Today is going to be a great day! 🎉",
  "I'm your biggest fan, always! ⭐",
  "Just seeing you makes me happy! 😊",
  "We're going to have the best day! 🌸",
  "You are brave, kind and wonderful! 🦋",
  "I'm so lucky to be your buddy! 🍀",
  "Something amazing is coming your way! ✨",
  "You've got this — I'm right here! 💪",
  "Every day with you is my favourite! 🌻",
];

const getDailyMessage = () => {
  const dayOfYear = Math.floor((new Date() - new Date(new Date().getFullYear(), 0, 0)) / 86400000);
  return MASCOT_DAILY_MESSAGES[dayOfYear % MASCOT_DAILY_MESSAGES.length];
};

export default function HomeTab() {
  const {
    activeChild, tab, setTab, theme,
    todayEntry, cm, currentStage, growthScore, streak, streakShield,
    dailyMissions, affirmIdx, lastMood, setShowMascotRoom, darkMode,
    todayJournalDone, todayGratitudeDone, todayBreathDone,
    moodLog,
  } = useApp();

  const C = theme;
  const todaysWord = getTodaysWord();
  const activityTier = getActivityTier(moodLog);
  const [wordExpanded, setWordExpanded] = useState(false);

  return (
    <div style={{ paddingTop:12, animation:"fadeIn 0.4s ease" }}>

      {/* Hero — garden scene */}
      <div style={{ textAlign:"center", marginBottom:16 }}>
        <p style={{ color:C.muted, fontWeight:600, fontSize:13, marginBottom:2 }}>
          {getTimeGreeting()}
        </p>
        <h2 style={{ fontFamily:F.h, fontSize:30, fontWeight:900, color:C.text, marginBottom:12 }}>
          {activeChild.name}
        </h2>
        <button
          onClick={()=>setShowMascotRoom(true)}
          style={{ border:"none", background:"none", cursor:"pointer", transition:"transform 0.15s", display:"block", margin:"0 auto" }}
          onMouseDown={e=>e.currentTarget.style.transform="scale(0.97)"}
          onMouseUp={e=>e.currentTarget.style.transform="scale(1)"}
        >
          <div style={{
            width:180, height:180, borderRadius:"50%",
            background:`radial-gradient(circle at 40% 35%, ${currentStage.bg}, ${cm.bg||currentStage.bg})`,
            display:"flex", alignItems:"center", justifyContent:"center",
            margin:"0 auto",
            boxShadow:`0 8px 32px ${cm.color}55, 0 2px 12px rgba(0,0,0,0.08)`,
            animation:"floatUp 3s ease-in-out infinite",
          }}>
            <GrowthMascot id={cm.id} size={120} stage={currentStage.id} energyTier={activityTier}/>
          </div>
          <div style={{
            background:"rgba(255,255,255,0.92)", borderRadius:18,
            borderBottomLeftRadius:4, padding:"8px 16px",
            marginTop:14, marginBottom:8,
            boxShadow:"0 2px 12px rgba(0,0,0,0.08)",
            maxWidth:260,
          }}>
            <p style={{fontFamily:F.b, fontWeight:600, fontSize:13, color:"#2D2040", margin:0, textAlign:"center", lineHeight:1.4}}>
              {getDailyMessage()}
            </p>
          </div>

          <div style={{
            display:"inline-flex", alignItems:"center", gap:6,
            background:currentStage.color, borderRadius:50, padding:"5px 16px",
          }}>
            <span style={{ fontSize:14 }}>🌱</span>
            <p style={{ fontFamily:F.b, fontWeight:700, fontSize:12, color:"#fff", margin:0 }}>
              {currentStage.name} · {growthScore} seeds · Tap to visit
            </p>
          </div>
        </button>
      </div>

      {/* Daily missions */}
      {dailyMissions.length > 0 && (
        <div style={{
          background:C.card, borderRadius:20, padding:"16px 18px",
          marginBottom:14, boxShadow:"0 2px 18px rgba(124,77,255,0.09)",
        }}>
          <div style={{ display:"flex", justifyContent:"space-between", alignItems:"center", marginBottom:12 }}>
            <p style={{ fontFamily:F.h, fontWeight:800, fontSize:16, color:C.text, margin:0 }}>
              Today's Missions
            </p>
            <div style={{ background:"#E8F5E9", borderRadius:50, padding:"3px 10px" }}>
              <p style={{ fontFamily:F.b, fontWeight:700, fontSize:11, color:"#43A047", margin:0 }}>
                +3 seeds if completed
              </p>
            </div>
          </div>
          {dailyMissions.map((m,i)=>(
            <button key={m.id} onClick={()=>!m.done && setTab(m.id)} style={{
              display:"flex", alignItems:"center", gap:12,
              padding:"10px 12px",
              borderBottom:i<dailyMissions.length-1?`1px solid ${m.done?"#F9A82555":C.border}`:"none",
              background:m.done?"linear-gradient(135deg,#F9A825,#FFB300)":C.bg,
              border:"none", width:"100%", textAlign:"left", cursor:m.done?"default":"pointer",
              borderRadius:12, marginBottom:i<dailyMissions.length-1?2:0,
              transition:"all 0.4s ease",
              boxShadow:m.done?"0 2px 12px rgba(249,168,37,0.35)":"none",
            }}
              onMouseEnter={e=>{if(!m.done)e.currentTarget.style.background=C.border;}}
              onMouseLeave={e=>e.currentTarget.style.background=m.done?"linear-gradient(135deg,#F9A825,#FFB300)":C.bg}
            >
              <div style={{
                width:22, height:22, borderRadius:"50%", flexShrink:0,
                background:m.done?"rgba(255,255,255,0.3)":"#f0f0f0",
                border:`2px solid ${m.done?"rgba(255,255,255,0.6)":C.border}`,
                display:"flex", alignItems:"center", justifyContent:"center",
              }}>
                {m.done && <svg viewBox="0 0 24 24" width={14} height={14} fill="none" stroke="#fff" strokeWidth="2.5" strokeLinecap="round"><path d="M20 6L9 17l-5-5"/></svg>}
              </div>
              <p style={{ fontFamily:F.b, fontWeight:m.done?700:600, fontSize:14, color:m.done?"#fff":C.text, margin:0, flex:1 }}>
                {m.label}
              </p>
              <div style={{
                background:m.done?"rgba(255,255,255,0.25)":"#E8F5E9",
                borderRadius:50, padding:"2px 8px",
                display:"flex", alignItems:"center", gap:3,
              }}>
                <span style={{ fontSize:10 }}>🌱</span>
                <p style={{ fontFamily:F.b, fontWeight:700, fontSize:11, color:m.done?"#fff":"#43A047", margin:0 }}>+{m.seeds}</p>
              </div>
              {!m.done && <Icon name="next" size={14} color={C.muted}/>}
              {m.done && <span style={{ fontSize:14 }}>⭐</span>}
            </button>
          ))}
        </div>
      )}

      {/* Growth progress bar */}
      <GrowthProgressBar score={growthScore}/>

      {/* Mood hero action */}
      <button onClick={()=>setTab("mood")} style={{
        width:"100%", display:"flex", alignItems:"center", gap:14,
        padding:"18px 20px", borderRadius:20, marginBottom:14,
        border:todayEntry?"none":`2px dashed ${C.purple}`,
        background:todayEntry?MOOD_BG[todayEntry.mood]:C.card,
        boxShadow:todayEntry?"0 2px 18px rgba(124,77,255,0.09)":"none",
        cursor:"pointer", textAlign:"left", transition:"transform 0.15s",
      }}
        onMouseDown={e=>e.currentTarget.style.transform="scale(0.98)"}
        onMouseUp={e=>e.currentTarget.style.transform="scale(1)"}
        onMouseLeave={e=>e.currentTarget.style.transform="scale(1)"}
      >
        {todayEntry ? (
          <>
            <MoodFace type={todayEntry.mood} size={48}/>
            <div style={{ flex:1 }}>
              <p style={{ fontFamily:F.h, fontWeight:800, fontSize:17, color:MOOD_COLORS[todayEntry.mood], margin:0 }}>
                Feeling {todayEntry.mood} today
              </p>
              <p style={{ color:C.muted, fontSize:13, fontWeight:500, margin:0 }}>Tap to update your mood</p>
            </div>
            <Icon name="next" size={18} color={MOOD_COLORS[todayEntry.mood]}/>
          </>
        ) : (
          <>
            <div style={{ background:C.purple+"22", borderRadius:"50%", padding:12, flexShrink:0 }}>
              <Icon name="mood" size={32} color={C.purple}/>
            </div>
            <div style={{ flex:1 }}>
              <p style={{ fontFamily:F.h, fontWeight:800, fontSize:17, color:C.text, margin:0 }}>How are you feeling?</p>
              <p style={{ color:C.purple, fontSize:13, fontWeight:600, margin:0 }}>Tap to log today's mood</p>
            </div>
            <Icon name="next" size={18} color={C.purple}/>
          </>
        )}
      </button>

      {/* Affirmation of the day */}
      <div
        style={{ background:`linear-gradient(135deg,${cm.color},#F06292)`, borderRadius:20, padding:"18px 20px", marginBottom:14, cursor:"pointer" }}
        onClick={()=>setTab("affirm")}
      >
        <p style={{ color:"rgba(255,255,255,0.75)", fontSize:11, fontWeight:700, letterSpacing:1, textTransform:"uppercase", margin:"0 0 6px" }}>
          {cm.name}'s affirmation for you
        </p>
        <p style={{ color:"#fff", fontSize:17, fontWeight:700, fontFamily:F.h, lineHeight:1.4, margin:"0 0 10px" }}>
          "{getSortedAffirmations(lastMood)[affirmIdx % 30].text}"
        </p>
        <p style={{ color:"rgba(255,255,255,0.65)", fontSize:12, fontWeight:600, margin:0 }}>Tap to see more →</p>
      </div>

      {/* Quick actions */}
      <div style={{ display:"grid", gridTemplateColumns:"1fr 1fr 1fr", gap:10, marginBottom:14 }}>
        {[
          {label:"Breathe", icon:"wind",  color:"#4FC3F7", bg:"#E1F5FE", action:()=>setTab("breathe"), done:todayBreathDone},
          {label:"Journal", icon:"book",  color:"#F06292", bg:"#FCE4EC", action:()=>setTab("journal"), done:todayJournalDone},
          {label:"Grateful",icon:"heart", color:"#43A047", bg:"#E8F5E9", action:()=>setTab("gratitude"), done:todayGratitudeDone},
        ].map(item=>(
          <button key={item.label} onClick={item.action} style={{
            background:item.done ? item.color : item.bg,
            border:`1.5px solid ${item.color}22`,
            borderRadius:18, padding:"16px 10px", cursor:"pointer", textAlign:"center",
            transition:"transform 0.15s", position:"relative",
          }}
            onMouseDown={e=>e.currentTarget.style.transform="scale(0.95)"}
            onMouseUp={e=>e.currentTarget.style.transform="scale(1)"}
          >
            {item.done && (
              <div style={{
                position:"absolute", top:6, right:6,
                width:16, height:16, borderRadius:"50%",
                background:"rgba(255,255,255,0.9)",
                display:"flex", alignItems:"center", justifyContent:"center",
              }}>
                <svg viewBox="0 0 24 24" width={10} height={10} fill="none"
                  stroke={item.color} strokeWidth="3" strokeLinecap="round">
                  <path d="M20 6L9 17l-5-5"/>
                </svg>
              </div>
            )}
            <Icon name={item.icon} size={26} color={item.done ? "#fff" : item.color} style={{ margin:"0 auto 8px" }}/>
            <div style={{ fontSize:13, fontWeight:700, color:item.done ? "#fff" : item.color, fontFamily:F.b }}>{item.label}</div>
          </button>
        ))}
      </div>

      {/* ── Feeling of the Day ──────────────────────────────────────── */}
      <div
        onClick={()=>setWordExpanded(e=>!e)}
        style={{
          background: C.card,
          border:`1.5px solid ${C.purple}33`,
          borderRadius:20, padding:"16px 18px", marginBottom:14, cursor:"pointer",
          boxShadow:`0 2px 18px ${C.purple}12`,
        }}>
        <div style={{ display:"flex", alignItems:"center", gap:12 }}>
          <div style={{
            width:48, height:48, borderRadius:14, flexShrink:0,
            background:`linear-gradient(135deg,${C.purple},#C084FC)`,
            display:"flex", alignItems:"center", justifyContent:"center",
            fontSize:24,
          }}>
            {todaysWord.emoji}
          </div>
          <div style={{ flex:1 }}>
            <p style={{ fontFamily:F.b, fontWeight:700, fontSize:11, color:C.purple,
              letterSpacing:1.2, textTransform:"uppercase", margin:"0 0 2px" }}>
              Feeling of the Day
            </p>
            <p style={{ fontFamily:F.h, fontWeight:800, fontSize:20, color:C.text, margin:0 }}>
              {todaysWord.word}
            </p>
          </div>
          <span style={{ fontSize:13, color:C.muted }}>{wordExpanded ? "▲" : "▼"}</span>
        </div>
        {wordExpanded && (
          <div style={{ marginTop:14, animation:"fadeIn 0.25s ease" }}>
            <div style={{ height:1, background:C.border, marginBottom:12 }}/>
            <p style={{ fontFamily:F.b, fontWeight:600, fontSize:14, color:C.text,
              lineHeight:1.65, margin:"0 0 10px" }}>{todaysWord.def}</p>
            <div style={{ background:`${C.purple}12`, borderRadius:12, padding:"10px 14px" }}>
              <p style={{ fontFamily:F.b, fontWeight:500, fontSize:13, color:C.muted,
                fontStyle:"italic", margin:0, lineHeight:1.5 }}>"{todaysWord.example}"</p>
            </div>
          </div>
        )}
      </div>

      {/* Streak */}
      {streak > 0 && (
        <div style={{
          background:"linear-gradient(135deg,#FFD54F,#FF7043)",
          borderRadius:20, display:"flex", alignItems:"center", gap:14,
          padding:"16px 20px", marginBottom:14,
        }}>
          <Icon name="fire" size={32} color="#fff"/>
          <div style={{ flex:1 }}>
            <p style={{ color:"#fff", fontFamily:F.h, fontWeight:800, fontSize:19, margin:0 }}>{streak}-Day Streak!</p>
            <p style={{ color:"rgba(255,255,255,0.85)", fontSize:13, fontWeight:500, margin:0 }}>Keep it up — you are doing great!</p>
          </div>
          {streakShield && (
            <div style={{ background:"rgba(255,255,255,0.25)", borderRadius:50, padding:"6px 12px", display:"flex", alignItems:"center", gap:4 }}>
              <Icon name="shield" size={16} color="#fff"/>
              <p style={{ fontFamily:F.b, fontWeight:700, fontSize:11, color:"#fff", margin:0 }}>Shield</p>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
