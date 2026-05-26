import { useState, useEffect, useCallback, useRef } from "react";
import { createClient } from "@supabase/supabase-js";

/* ── Context ── */
import { AppContext } from "./AppContext.jsx";

/* ── Constants & helpers ── */
import {
  F, LIGHT, DARK, MASCOTS, MOODS, MOOD_COLORS, MOOD_BG, MOOD_MESSAGES,
  ALL_AFFIRMATIONS, BREATHING, JOURNAL_PROMPTS, BADGE_DEFS, STAGE_BGSANIM,
  today, getStreak, last7Days, getSortedAffirmations, getTimeGreeting,
  playSound, haptic,
} from "./constants.js";

/* ── UI primitives ── */
import {
  FontLoader, Icon, MascotFace, MoodFace, Card, Btn, Label,
  TextInput, Shell, Tooltip, Toast, SettingsPanel,
} from "./components/UI.jsx";

/* ── Screens ── */
import ConsentScreen from "./components/ConsentScreen.jsx";
import { LoginScreen, SignupScreen, ForgotPasswordScreen } from "./components/AuthScreens.jsx";

/* ── Tab components ── */
import HomeTab from "./tabs/HomeTab.jsx";
import MoodTab from "./tabs/MoodTab.jsx";
import BreatheTab from "./tabs/BreatheTab.jsx";
import { JournalTab, AffirmTab } from "./tabs/JournalAffirmTabs.jsx";
import GratitudeTab from "./tabs/GratitudeTab.jsx";

/* ── Feature components (unchanged files) ── */
import ParentInsights from "./ParentInsights.jsx";
import ChildOnboarding from "./ChildOnboarding.jsx";
import BerryBasket, { BerrySVG, FloatingBerry } from "./BerryBasket.jsx";
import {
  GrowthMascot, GardenScene, GrowthProgressBar, GrowthCelebration,
  SeedPopup, calcGrowthScore, getStage, STAGES,
} from "./MascotGrowth.jsx";
import MascotRoom from "./MascotRoom.jsx";

/* ── Supabase ──
   TODO before shipping: move these to environment variables.
   In Vite: import.meta.env.VITE_SUPABASE_URL / VITE_SUPABASE_KEY
   In CRA:  process.env.REACT_APP_SUPABASE_URL / REACT_APP_SUPABASE_KEY
*/
const SUPABASE_URL = import.meta.env?.VITE_SUPABASE_URL || "https://ymfvezvezzmckcdwjvzm.supabase.co";
const SUPABASE_KEY = import.meta.env?.VITE_SUPABASE_KEY || "sb_publishable_5CR_k4TEBUYXhqm3AuN7bQ_Csiafdcs";
const supabase = createClient(SUPABASE_URL, SUPABASE_KEY);

/* ════════════════════════════════════════
   MAIN APP
════════════════════════════════════════ */
export default function BloomyApp() {
  /* ── Auth / navigation ── */
  const [session, setSession]       = useState(null);
  const [loading, setLoading]       = useState(true);
  const [screen, setScreen]         = useState("landing");

  /* ── Children ── */
  const [children, setChildren]             = useState([]);
  const [childrenLoading, setChildrenLoading] = useState(false);
  const [activeChild, setActiveChild]       = useState(null);

  /* ── Child add/delete ── */
  const [addingChild, setAddingChild]   = useState(false);
  const [newChildName, setNewChildName] = useState("");
  const [newChildMascot, setNewChildMascot] = useState(null);
  const [addStep, setAddStep]           = useState(1);
  const [addLoading, setAddLoading]     = useState(false);
  const [deleteConfirm, setDeleteConfirm] = useState(null);

  /* ── Child data ── */
  const [moodLog, setMoodLog]       = useState([]);
  const [journals, setJournals]     = useState([]);
  const [gratitudes, setGratitudes] = useState([]);

  /* ── Tab & UI state ── */
  const [tab, setTab]                     = useState("home");
  const [showInsights, setShowInsights]   = useState(false);
  const [showMascotRoom, setShowMascotRoom] = useState(false);
  const [showChildIntro, setShowChildIntro] = useState(false);
  const [showSettings, setShowSettings]   = useState(false);
  const [darkMode, setDarkMode]           = useState(()=>{
    try { return localStorage.getItem("bloomy_dark") === "true"; } catch { return false; }
  });
  const [soundOn, setSoundOn]             = useState(true);
  const [onboardStep, setOnboardStep]     = useState(0);
  const [seenTooltips, setSeenTooltips]   = useState({});

  /* ── Mood state ── */
  const [selectedMood, setSelectedMood]   = useState(null);
  const [moodLogged, setMoodLogged]       = useState(false);
  const [todayMood, setTodayMood]         = useState(null);
  const [moodNote, setMoodNote]           = useState("");
  const [moodNoteStep, setMoodNoteStep]   = useState("log");
  const [savingNote, setSavingNote]       = useState(false);

  /* ── Affirmation state ── */
  const [affirmIdx, setAffirmIdx]   = useState(()=>{
    try {
      const stored = localStorage.getItem("bloomy_affirm_idx");
      const storedDate = localStorage.getItem("bloomy_affirm_date");
      const todayStr = new Date().toISOString().split("T")[0];
      // If we already picked an index today, use it — otherwise pick a fresh random one
      if (stored && storedDate === todayStr) {
        return parseInt(stored, 10);
      }
      const fresh = Math.floor(Math.random() * 30);
      localStorage.setItem("bloomy_affirm_idx", String(fresh));
      localStorage.setItem("bloomy_affirm_date", todayStr);
      return fresh;
    } catch { return 0; }
  });
  const [affirmAnim, setAffirmAnim] = useState("idle");
  const [showAllAffirm, setShowAllAffirm] = useState(false);

  /* ── Breathe state ── */
  const [breathPhase, setBreathPhase]   = useState(0);
  const [breathActive, setBreathActive] = useState(false);
  const [breathCount, setBreathCount]   = useState(0);

  /* ── Journal state ── */
  const [journalText, setJournalText]   = useState("");
  const [journalSaved, setJournalSaved] = useState(false);
  const [promptIdx, setPromptIdx]       = useState(0);
  const [saveLoading, setSaveLoading]   = useState(false);

  /* ── Gratitude state ── */
  const [gratitudeText, setGratitudeText] = useState("");
  const [gratitudeSaved, setGratitudeSaved] = useState(false);

  /* ── Growth / missions ── */
  const [celebration, setCelebration]         = useState(null);
  const [dailyMissions, setDailyMissions]     = useState([]);
  const [seedPopup, setSeedPopup]             = useState({visible:false,amount:0,gold:false});
  const [pendingBonusPopup, setPendingBonusPopup] = useState(false);
  const [streakShield, setStreakShield]       = useState(false);

  /* ── Berries / energy ── */
  const [berries, setBerries]       = useState(0);
  const [energy, setEnergy]         = useState(100);
  const [floatingBerry, setFloatingBerry] = useState(false);
  const basketRef                   = useRef(null);

  /* ── Toast ── */
  const [toast, setToast]           = useState({ visible:false, message:"", type:"error" });

  /* ── Touch refs for swipe ── */
  const touchStartX = useRef(null);
  const touchStartY = useRef(null);

  /* ── Persist darkMode ── */
  useEffect(()=>{
    try { localStorage.setItem("bloomy_dark", darkMode ? "true" : "false"); } catch {}
  }, [darkMode]);

  /* ── Persist affirmIdx ── */
  useEffect(()=>{
    try { localStorage.setItem("bloomy_affirm_idx", String(affirmIdx)); } catch {}
  }, [affirmIdx]);

  /* ── Helpers ── */
  const showToast = (message, type="error") => {
    setToast({ visible:true, message, type });
    setTimeout(()=>setToast(t=>({...t,visible:false})), 3000);
  };

  const showSeedPopup = (amount, gold=false) => {
    if (!activeChild) return;
    setSeedPopup({visible:true, amount, gold});
    setTimeout(()=>setSeedPopup({visible:false,amount:0,gold:false}), 2200);
  };

  /* ── Theme ── */
  const theme = darkMode ? DARK : LIGHT;

  /* ── Auth listener ── */
  useEffect(()=>{
    supabase.auth.getSession().then(({data:{session:s}})=>{
      setSession(s);
      if (s) setScreen("dashboard"); else setScreen("landing");
      setLoading(false);
    });
    const {data:{subscription}} = supabase.auth.onAuthStateChange((_,s)=>{
      setSession(s);
      if (s) { setScreen("dashboard"); loadChildren(s.user.id); }
      else { setScreen("landing"); setChildren([]); setActiveChild(null); }
    });
    return ()=>subscription.unsubscribe();
  }, []);

  /* ── Load children after login ── */
  const loadChildren = async (userId) => {
    setChildrenLoading(true);
    const {data,error} = await supabase.from("children").select("*")
      .eq("parent_id",userId).order("created_at",{ascending:true});
    if (!error && data) setChildren(data);
    setChildrenLoading(false);
  };
  useEffect(()=>{ if(session) loadChildren(session.user.id); },[session]);

  /* ── Berry helpers ── */
  const earnBerry = () => {
    setFloatingBerry(false);
    setTimeout(()=>setFloatingBerry(true), 30);
    haptic(12);
    const todayStr = new Date().toISOString().split("T")[0];
    setBerries(prev=>{
      const newCount = prev + 1;
      if (activeChild) {
        supabase.from("children")
          .update({berries:newCount, last_activity_date:todayStr})
          .eq("id",activeChild.id)
          .then(({error})=>{ if(error) console.error("berry save:",error); });
        setActiveChild(ac=>ac?{...ac,berries:newCount,last_activity_date:todayStr}:ac);
        setChildren(cs=>cs.map(c=>c.id===activeChild.id?{...c,berries:newCount,last_activity_date:todayStr}:c));
      }
      return newCount;
    });
  };

  const feedMascot = async () => {
    if (!activeChild||berries<=0||energy>=100) return;
    const newBerries = berries - 1;
    const newEnergy  = Math.min(100, energy + 25);
    setBerries(newBerries); setEnergy(newEnergy);
    const {error} = await supabase.from("children")
      .update({berries:newBerries, energy:newEnergy})
      .eq("id",activeChild.id);
    if (!error) {
      setActiveChild(prev=>prev?{...prev,berries:newBerries,energy:newEnergy}:prev);
      setChildren(cs=>cs.map(c=>c.id===activeChild.id?{...c,berries:newBerries,energy:newEnergy}:c));
    }
  };

  /* ── Missions ── */
  const completeMission = (id) => {
    setDailyMissions(prev=>{
      const mission = prev.find(m=>m.id===id);
      if (!mission||mission.done) return prev;
      const updated = prev.map(m=>m.id===id?{...m,done:true}:m);
      setActiveChild(child=>{
        if (!child) return child;
        const newCount = (child.missions_completed||0)+1;
        const updatedChild = {...child, missions_completed:newCount};
        supabase.from("children").update({missions_completed:newCount}).eq("id",child.id);
        setChildren(cs=>cs.map(c=>c.id===child.id?updatedChild:c));
        return updatedChild;
      });
      const allDone = updated.every(m=>m.done);
      if (allDone) {
        setPendingBonusPopup(true);
        setTimeout(()=>showSeedPopup(3, true), 600);
      }
      return updated;
    });
  };

  /* ── Growth stage check ── */
  const checkGrowthStageUp = (newMoodLog, newJournals, updatedChild) => {
    const child = updatedChild || activeChild;
    if (!child) return;
    const oldScore = calcGrowthScore(activeChild, moodLog, journals);
    const newScore = calcGrowthScore(child, newMoodLog, newJournals);
    const oldStage = getStage(oldScore);
    const newStage = getStage(newScore);
    if (newStage.id > oldStage.id) {
      setCelebration(newStage.id);
      playSound("levelup", soundOn);
    }
  };

  /* ── Affirmation ── */
  const nextAffirm = async () => {
    if (affirmAnim !== "idle") return;
    setAffirmAnim("swiping");
    playSound("whoosh", soundOn);
    setTimeout(()=>{
      setAffirmIdx(i=>(i+1)%ALL_AFFIRMATIONS.length);
      setAffirmAnim("entering");
      setTimeout(()=>setAffirmAnim("idle"),400);
    },350);
    if (activeChild) {
      const newCount = (activeChild.affirm_count||0)+1;
      const {error} = await supabase.from("children").update({affirm_count:newCount}).eq("id",activeChild.id);
      if (!error) {
        const updatedChild = {...activeChild, affirm_count:newCount};
        setActiveChild(updatedChild);
        setChildren(prev=>prev.map(c=>c.id===activeChild.id?updatedChild:c));
        showSeedPopup(1);
        if (newCount%3===0) completeMission("affirm");
        checkGrowthStageUp(moodLog, journals, updatedChild);
      }
    }
  };

  /* ── Mood actions ── */
  const logMood = async (mood) => {
    if (!activeChild) return;
    const todayStr = today();
    const alreadyLogged = moodLog.some(e => e.date === todayStr);
    if (alreadyLogged) {
      // Update the existing entry instead of inserting a new one
      try {
        const existing = [...moodLog].reverse().find(e => e.date === todayStr);
        const {error} = await supabase.from("mood_logs")
          .update({mood}).eq("id", existing.id);
        if (error) throw error;
        const newLog = moodLog.map(e => e.id === existing.id ? {...e, mood} : e);
        setMoodLog(newLog);
        setMoodLogged(true);
        setTodayMood(mood);
        setMoodNoteStep("note");
        setMoodNote("");
        playSound("chime", soundOn);
        haptic(8);
        // No seeds for updating — only for first log of the day
        checkGrowthStageUp(newLog, journals);
      } catch(e) {
        showToast("Couldn't update your mood. Please try again.");
      }
      return;
    }
    try {
      const {data,error} = await supabase.from("mood_logs")
        .insert({child_id:activeChild.id, mood, date:today()}).select().single();
      if (error) throw error;
      const newLog = [...moodLog, data];
      setMoodLog(newLog);
      setMoodLogged(true);
      setTodayMood(mood);
      setMoodNoteStep("note");
      setMoodNote("");
      playSound("chime", soundOn);
      haptic(8);
      showSeedPopup(1);
      completeMission("mood");
      checkGrowthStageUp(newLog, journals);
    } catch(e) {
      showToast("Couldn't save your mood. Please try again.");
    }
  };

  const saveMoodNote = async () => {
    if (!moodNote.trim()) { setMoodNoteStep("done"); return; }
    setSavingNote(true);
    const lastEntry = moodLog[moodLog.length-1];
    if (lastEntry) {
      try {
        await supabase.from("mood_logs").update({note:moodNote.trim()}).eq("id",lastEntry.id);
        setMoodLog(moodLog.map((e,i)=>i===moodLog.length-1?{...e,note:moodNote.trim()}:e));
      } catch(e) {
        showToast("Couldn't save your note. Please try again.");
      }
    }
    setSavingNote(false);
    setMoodNoteStep("done");
  };

  /* ── Journal ── */
  const saveJournal = async () => {
    if (!journalText.trim()||!activeChild) return;
    setSaveLoading(true);
    try {
      const {data,error} = await supabase.from("journal_entries")
        .insert({child_id:activeChild.id, text:journalText, prompt:JOURNAL_PROMPTS[promptIdx], date:today()})
        .select().single();
      if (error) throw error;
      const newJournals = [data, ...journals];
      setJournals(newJournals);
      setJournalSaved(true);
      playSound("chime", soundOn);
      haptic(10);
      showSeedPopup(2);
      // Only earn berry once per day for journaling
      const alreadyEarnedToday = journals.some(j => j.date === today());
      if (!alreadyEarnedToday) earnBerry();
      completeMission("journal");
      checkGrowthStageUp(moodLog, newJournals);
    } catch(e) {
      showToast("Couldn't save your journal entry. Please try again.");
    }
    setSaveLoading(false);
  };

  /* ── Gratitude ── */
  const saveGratitude = async () => {
    if (!gratitudeText.trim()||!activeChild) return;
    try {
      const {data,error} = await supabase.from("gratitudes")
        .insert({child_id:activeChild.id, text:gratitudeText.trim(), date:today()})
        .select().single();
      if (error) throw error;
      setGratitudes(prev=>[data,...prev]);
      setGratitudeText("");
      setGratitudeSaved(true);
      playSound("chime", soundOn);
      haptic(8);
      showSeedPopup(1);
      // Only earn berry once per day for gratitude
      const alreadyEarnedToday = gratitudes.some(g => g.date === today());
      if (!alreadyEarnedToday) earnBerry();
      completeMission("gratitude");
      setTimeout(()=>setGratitudeSaved(false),1500);
    } catch(e) {
      showToast("Couldn't save your gratitude. Please try again.");
    }
  };

  /* ── Open child profile ── */
  const [childLoading, setChildLoading] = useState(false);

  const openChild = async (child) => {
    setChildLoading(true);
    setShowSettings(false);
    setActiveChild(child); setTab("home");
    setMoodLogged(false); setJournalSaved(false); setJournalText("");
    setBreathActive(false); setBreathPhase(0); setBreathCount(0);
    setTodayMood(null); setPendingBonusPopup(false);

    /* Energy depletion */
    const lastActivity = child.last_activity_date || "";
    const todayStr = new Date().toISOString().split("T")[0];
    let currentEnergy;
    if (!lastActivity) {
      currentEnergy = child.energy > 0 ? child.energy : 60;
      if (!child.energy) supabase.from("children").update({energy:60}).eq("id",child.id);
    } else if (lastActivity === todayStr) {
      currentEnergy = child.energy ?? 100;
    } else {
      const daysMissed = Math.floor((new Date(todayStr)-new Date(lastActivity))/(1000*60*60*24));
      currentEnergy = Math.max(0, (child.energy??100)-(daysMissed*15));
      supabase.from("children").update({energy:currentEnergy}).eq("id",child.id);
    }
    setBerries(child.berries||0);
    setEnergy(currentEnergy);
    setSeenTooltips(child.seen_tooltips||{});
    if (!child.seen_tooltips?.intro) setShowChildIntro(true);

    /* Load all child data */
    const [moodRes,journalRes,gratitudeRes] = await Promise.all([
      supabase.from("mood_logs").select("*").eq("child_id",child.id).order("created_at",{ascending:true}),
      supabase.from("journal_entries").select("*").eq("child_id",child.id).order("created_at",{ascending:false}),
      supabase.from("gratitudes").select("*").eq("child_id",child.id).order("created_at",{ascending:false}),
    ]);
    const todayMoodLogs   = (moodRes.data||[]).filter(e=>e.date===todayStr);
    const todayJournals   = (journalRes.data||[]).filter(e=>e.date===todayStr);
    const todayGratitudes = (gratitudeRes.data||[]).filter(e=>e.date===todayStr);
    if (!moodRes.error)     setMoodLog(moodRes.data||[]);
    if (!journalRes.error)  setJournals(journalRes.data||[]);
    if (!gratitudeRes.error) setGratitudes(gratitudeRes.data||[]);
    if (todayMoodLogs.length>0) setTodayMood(todayMoodLogs[todayMoodLogs.length-1].mood);

    /* Generate daily missions */
    const seedStr = `${child.id}-${todayStr}`;
    const seedNum = seedStr.split("").reduce((a,c)=>a+c.charCodeAt(0),0);
    const all = [
      {id:"mood",      label:"Log your mood today",          seeds:1, icon:"mood",  done:todayMoodLogs.length>0},
      {id:"journal",   label:"Write a journal entry",        seeds:2, icon:"book",  done:todayJournals.length>0},
      /* FIX: breathe completion now checks a dedicated field, not mood logs */
      {id:"breathe",   label:"Complete a breathing session", seeds:2, icon:"wind",  done:(child.last_breath_date===todayStr)},
      {id:"affirm",    label:"Read 3 affirmations",          seeds:1, icon:"star",  done:(child.affirm_count||0)%3===0&&(child.affirm_count||0)>0},
      {id:"gratitude", label:"Add a gratitude",              seeds:1, icon:"heart", done:todayGratitudes.length>0},
    ];
    const idx1 = seedNum%all.length;
    const idx2 = (seedNum*7+3)%all.length===idx1?(seedNum*7+4)%all.length:(seedNum*7+3)%all.length;
    setDailyMissions([all[idx1],all[idx2]]);

    /* Streak shield */
    const lastShieldDate = child.last_shield_date||"";
    const weekAgo = new Date(); weekAgo.setDate(weekAgo.getDate()-7);
    setStreakShield(new Date(lastShieldDate)<weekAgo);
    setChildLoading(false);
  };

  /* ── Add/Delete child ── */
  const handleAddChild = async () => {
    if (!newChildName.trim()||!newChildMascot||!session) return;
    setAddLoading(true);
    const {data,error} = await supabase.from("children").insert({
      parent_id:session.user.id, name:newChildName.trim(),
      mascot_id:newChildMascot.id, mascot_name:newChildMascot.name,
      mascot_color:newChildMascot.color, mascot_bg:newChildMascot.bg,
      affirm_count:0, breath_sessions:0, missions_completed:0,
    }).select().single();
    if (!error&&data) {
      setChildren(prev=>[...prev,data]);
      setActiveChild(data); setMoodLog([]); setJournals([]); setTab("home");
      setShowChildIntro(true);
    }
    setAddingChild(false); setNewChildName(""); setNewChildMascot(null); setAddStep(1);
    setAddLoading(false);
  };

  const handleDeleteChild = async (childId) => {
    await supabase.from("children").delete().eq("id",childId);
    setChildren(prev=>prev.filter(c=>c.id!==childId));
    if (activeChild?.id===childId) { setActiveChild(null); setMoodLog([]); setJournals([]); }
  };

  const handleLogout = async () => {
    await supabase.auth.signOut();
    setBreathActive(false); setActiveChild(null); setMoodLog([]); setJournals([]);
  };

  const handleFinishIntro = async () => {
    setShowChildIntro(false);
    if (!activeChild) return;
    const updated = {...(activeChild.seen_tooltips||{}), intro:true};
    await supabase.from("children").update({seen_tooltips:updated}).eq("id",activeChild.id);
    setActiveChild(prev=>({...prev,seen_tooltips:updated}));
    setChildren(prev=>prev.map(c=>c.id===activeChild.id?{...c,seen_tooltips:updated}:c));
  };

  /* ── Computed values ── */
  const growthScore  = activeChild ? calcGrowthScore(activeChild,moodLog,journals,gratitudes) : 0;
  const todayJournalDone   = journals.some(j => j.date === today());
  const todayGratitudeDone = gratitudes.some(g => g.date === today());
  const todayBreathDone    = activeChild?.last_breath_date === today();
  const currentStage = getStage(growthScore);
  const streak       = getStreak(moodLog);
  const todayEntry   = todayMood
    ? {mood:todayMood, date:today()}
    : moodLog.slice().reverse().find(e=>e.date===today());
  const lastMood     = moodLog.length>0 ? moodLog[moodLog.length-1].mood : null;
  const cm           = activeChild
    ? {id:activeChild.mascot_id,name:activeChild.mascot_name,color:activeChild.mascot_color,bg:activeChild.mascot_bg}
    : MASCOTS[0];
  const parentName   = session?.user?.user_metadata?.name||session?.user?.email||"there";
  const stageBg      = STAGE_BGSANIM[currentStage.id]||STAGE_BGSANIM[0];
  const badges       = activeChild
    ? Object.fromEntries(BADGE_DEFS.map(b=>[b.id,b.check(moodLog,journals,activeChild.breath_sessions||0,activeChild.affirm_count||0)]))
    : {};

  /* ════════════════════════════════════════
     CONTEXT VALUE — passed to all tabs
  ════════════════════════════════════════ */
  const ctxValue = {
    supabase, session, theme,
    activeChild, setActiveChild,
    children, setChildren,
    tab, setTab,
    moodLog, setMoodLog,
    journals, setJournals,
    gratitudes, setGratitudes,
    selectedMood, setSelectedMood,
    moodLogged, setMoodLogged,
    todayMood, setTodayMood,
    moodNote, setMoodNote,
    moodNoteStep, setMoodNoteStep,
    savingNote,
    affirmIdx, setAffirmIdx,
    affirmAnim, setAffirmAnim,
    showAllAffirm, setShowAllAffirm,
    breathPhase, setBreathPhase,
    breathActive, setBreathActive,
    breathCount, setBreathCount,
    journalText, setJournalText,
    journalSaved, setJournalSaved,
    promptIdx, setPromptIdx,
    saveLoading,
    gratitudeText, setGratitudeText,
    gratitudeSaved, setGratitudeSaved,
    seenTooltips, setSeenTooltips,
    berries, energy,
    darkMode, soundOn,
    dailyMissions, streakShield,
    cm, currentStage, growthScore, streak,
    todayEntry, lastMood, badges,
    todayJournalDone, todayGratitudeDone, todayBreathDone,
    setShowMascotRoom,
    logMood, saveMoodNote,
    saveJournal, saveGratitude,
    earnBerry, feedMascot,
    completeMission, checkGrowthStageUp,
    nextAffirm,
    showSeedPopup,
    playSound: (t)=>playSound(t, soundOn),
    haptic,
    showToast,
  };

  /* ════════════════════════════════════════
     RENDER
  ════════════════════════════════════════ */

  /* Loading splash */
  if (loading) return (
    <div style={{minHeight:"100vh",background:"linear-gradient(148deg,#A78BFA 0%,#F06292 60%,#FFD54F 100%)",display:"flex",alignItems:"center",justifyContent:"center"}}>
      <FontLoader/>
      <div style={{textAlign:"center"}}>
        <div style={{animation:"floatUp 2s ease-in-out infinite",marginBottom:16}}>
          <Icon name="flower" size={64} color="#fff"/>
        </div>
        <p style={{color:"#fff",fontFamily:F.h,fontSize:24,fontWeight:800}}>Bloomy</p>
      </div>
    </div>
  );

  /* ── Consent screen (sits between landing and signup) ── */
  if (screen==="consent") return (
    <ConsentScreen onAccept={()=>setScreen("signup")} onBack={()=>setScreen("landing")}/>
  );

  /* ── Forgot password ── */
  if (screen==="forgot") return (
    <ForgotPasswordScreen supabase={supabase} onBack={()=>setScreen("login")}/>
  );

  /* ── Auth screens ── */
  if (screen==="signup") return (
    <SignupScreen supabase={supabase} onNavigate={setScreen} theme={theme}/>
  );
  if (screen==="login") return (
    <LoginScreen supabase={supabase} onNavigate={setScreen} theme={theme}/>
  );

  /* ── Landing / onboarding ── */
  if (screen==="landing") {
    const ONBOARD_SLIDES = [
      {grad:"linear-gradient(148deg,#A78BFA 0%,#7C4DFF 100%)",tag:"Welcome to Bloomy",title:"Where little feelings grow into big strengths.",sub:"A safe, joyful space built just for children ages 5 to 11.",mascots:["fox","bunny","bear"]},
      {grad:"linear-gradient(148deg,#F06292 0%,#FF7043 100%)",tag:"Check in every day",title:"How are you feeling today?",sub:"Children log their mood with friendly faces. Parents see patterns over time.",mascots:["owl","cat","dog"]},
      {grad:"linear-gradient(148deg,#4DB6AC 0%,#4FC3F7 100%)",tag:"Grow and shine",title:"Affirmations, journaling, breathing and more.",sub:"Every tool your child needs to build confidence, calm big emotions, and express themselves freely.",mascots:["fox","owl","cat"]},
      {grad:"linear-gradient(148deg,#FFD54F 0%,#F06292 100%)",tag:"Safe for your family",title:"No ads. No tracking. Always free to start.",sub:"Bloomy is built with child safety first. Parents stay in control with a private dashboard.",mascots:["bunny","bear","dog"],isCTA:true},
    ];
    const slide = ONBOARD_SLIDES[onboardStep];
    const isLast = onboardStep===ONBOARD_SLIDES.length-1;

    const handleTouchStart = (e)=>{ touchStartX.current=e.touches[0].clientX; touchStartY.current=e.touches[0].clientY; };
    const handleTouchEnd = (e)=>{
      if (touchStartX.current===null) return;
      const dx=e.changedTouches[0].clientX-touchStartX.current;
      const dy=e.changedTouches[0].clientY-touchStartY.current;
      if (Math.abs(dx)<40||Math.abs(dx)<Math.abs(dy)) return;
      if (dx<0) { if (!isLast) setOnboardStep(s=>s+1); else setScreen("consent"); }
      else { if (onboardStep>0) setOnboardStep(s=>s-1); }
      touchStartX.current=null;
    };

    return (
      <div onTouchStart={handleTouchStart} onTouchEnd={handleTouchEnd}
        style={{minHeight:"100vh",background:slide.grad,fontFamily:F.b,display:"flex",flexDirection:"column",position:"relative",overflow:"hidden",transition:"background 0.5s ease",userSelect:"none"}}>
        <FontLoader/>
        <div style={{position:"absolute",top:-80,right:-80,width:240,height:240,borderRadius:"50%",background:"rgba(255,255,255,0.1)",pointerEvents:"none"}}/>
        <div style={{position:"absolute",bottom:-60,left:-60,width:200,height:200,borderRadius:"50%",background:"rgba(255,255,255,0.08)",pointerEvents:"none"}}/>

        {!isLast&&<button onClick={()=>setScreen("consent")} style={{position:"absolute",top:24,right:24,background:"rgba(255,255,255,0.2)",border:"none",color:"#fff",borderRadius:50,padding:"8px 18px",fontSize:13,fontWeight:600,fontFamily:F.b,cursor:"pointer",zIndex:10}}>Skip</button>}
        <button onClick={()=>setScreen("login")} style={{position:"absolute",top:24,left:24,background:"none",border:"none",color:"rgba(255,255,255,0.7)",fontSize:13,fontWeight:600,fontFamily:F.b,cursor:"pointer",zIndex:10}}>Sign in</button>

        <div style={{flex:1,display:"flex",flexDirection:"column",alignItems:"center",justifyContent:"center",padding:"80px 32px 40px",textAlign:"center",animation:"fadeIn 0.5s ease"}}>
          <div style={{display:"flex",gap:12,justifyContent:"center",marginBottom:28}}>
            {slide.mascots.map((m,i)=>(
              <div key={m+i} style={{background:"rgba(255,255,255,0.2)",borderRadius:20,padding:10,animation:`floatUp ${2+i*0.4}s ease-in-out infinite`,animationDelay:`${i*0.3}s`}}>
                <MascotFace id={m} size={56}/>
              </div>
            ))}
          </div>
          <div style={{background:"rgba(255,255,255,0.2)",borderRadius:50,padding:"6px 18px",marginBottom:18,display:"inline-block"}}>
            <p style={{color:"#fff",fontSize:12,fontWeight:700,letterSpacing:1.2,textTransform:"uppercase",margin:0}}>{slide.tag}</p>
          </div>
          <h1 style={{fontFamily:F.h,fontSize:32,fontWeight:900,color:"#fff",marginBottom:16,lineHeight:1.25,textShadow:"0 2px 12px rgba(0,0,0,0.15)"}}>{slide.title}</h1>
          <p style={{fontSize:16,color:"rgba(255,255,255,0.88)",fontWeight:500,lineHeight:1.7,maxWidth:320,margin:"0 auto"}}>{slide.sub}</p>
          {onboardStep===0&&<p style={{color:"rgba(255,255,255,0.5)",fontSize:12,fontWeight:500,marginTop:24}}>Swipe to explore</p>}
        </div>

        <div style={{padding:"0 32px 52px",display:"flex",flexDirection:"column",alignItems:"center",gap:16}}>
          <div style={{display:"flex",gap:8,justifyContent:"center"}}>
            {ONBOARD_SLIDES.map((_,i)=>(
              <div key={i} onClick={()=>setOnboardStep(i)} style={{width:i===onboardStep?24:8,height:8,borderRadius:50,background:i===onboardStep?"#fff":"rgba(255,255,255,0.4)",transition:"all 0.3s",cursor:"pointer"}}/>
            ))}
          </div>
          {isLast?(
            <div style={{width:"100%",maxWidth:340,display:"flex",flexDirection:"column",gap:10}}>
              <Btn onClick={()=>setScreen("consent")} color="#fff" textColor={theme.purple} style={{fontSize:18,padding:"17px 0",width:"100%",justifyContent:"center"}}>
                Create Free Account
              </Btn>
              <button onClick={()=>setScreen("login")} style={{background:"rgba(255,255,255,0.18)",border:"2px solid rgba(255,255,255,0.5)",color:"#fff",borderRadius:50,padding:"13px 0",fontSize:15,fontWeight:600,fontFamily:F.b,cursor:"pointer",width:"100%"}}>
                I already have an account
              </button>
              <p style={{color:"rgba(255,255,255,0.6)",fontSize:12,fontWeight:500,textAlign:"center",margin:0}}>Free forever. No credit card needed.</p>
            </div>
          ):(
            <div style={{width:"100%",maxWidth:340}}>
              <Btn onClick={()=>setOnboardStep(s=>s+1)} color="#fff" textColor={theme.purple} style={{fontSize:17,padding:"16px 0",width:"100%",justifyContent:"center"}} icon="next">
                Next
              </Btn>
            </div>
          )}
        </div>
      </div>
    );
  }

  /* ── Parent Insights ── */
  if (showInsights) return (
    <ParentInsights session={session} children={children} onClose={()=>setShowInsights(false)}/>
  );

  /* ── Parent Dashboard ── */
  if (!activeChild) return (
    <Shell>
      {showSettings&&<SettingsPanel darkMode={darkMode} setDarkMode={setDarkMode} soundOn={soundOn} setSoundOn={setSoundOn} onClose={()=>setShowSettings(false)} theme={theme}/>}
      {deleteConfirm&&(
        <div style={{position:"fixed",inset:0,zIndex:9995,background:"rgba(0,0,0,0.45)",display:"flex",alignItems:"center",justifyContent:"center",padding:"0 24px",backdropFilter:"blur(4px)"}}
          onClick={()=>setDeleteConfirm(null)}>
          <div onClick={e=>e.stopPropagation()} style={{background:"#fff",borderRadius:24,padding:"28px 24px",width:"100%",maxWidth:360,boxShadow:"0 16px 48px rgba(0,0,0,0.18)",animation:"scaleIn 0.25s cubic-bezier(0.34,1.56,0.64,1)"}}>
            <div style={{width:56,height:56,borderRadius:"50%",background:"#FFF5F5",border:"2px solid #FFCDD2",display:"flex",alignItems:"center",justifyContent:"center",margin:"0 auto 18px"}}>
              <Icon name="trash" size={24} color="#E53935"/>
            </div>
            <h2 style={{fontFamily:F.h,fontWeight:900,fontSize:22,color:theme.text,textAlign:"center",margin:"0 0 10px"}}>Delete {deleteConfirm.name}'s profile?</h2>
            <p style={{fontFamily:F.b,fontWeight:500,fontSize:14,color:theme.muted,textAlign:"center",lineHeight:1.7,margin:"0 0 24px"}}>
              This will permanently remove <strong>{deleteConfirm.name}'s</strong> profile, including all their mood logs, journal entries, and garden progress. <strong>This cannot be undone.</strong>
            </p>
            <div style={{display:"flex",gap:10}}>
              <button onClick={()=>setDeleteConfirm(null)} style={{flex:1,borderRadius:50,padding:"13px",background:theme.bg,border:`1.5px solid ${theme.border}`,cursor:"pointer",fontFamily:F.b,fontWeight:700,fontSize:14,color:theme.muted}}>Keep Profile</button>
              <button onClick={async()=>{await handleDeleteChild(deleteConfirm.id);setDeleteConfirm(null);}} style={{flex:1,borderRadius:50,padding:"13px",background:"linear-gradient(135deg,#E53935,#EF5350)",border:"none",cursor:"pointer",fontFamily:F.b,fontWeight:700,fontSize:14,color:"#fff",boxShadow:"0 4px 14px rgba(229,57,53,0.4)"}}>Yes, Delete</button>
            </div>
          </div>
        </div>
      )}

      <div style={{paddingTop:36}}>
        <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:28}}>
          <div>
            <p style={{color:theme.muted,fontWeight:600,fontSize:13,marginBottom:2}}>Welcome back</p>
            <h2 style={{fontFamily:F.h,fontSize:28,fontWeight:900,color:theme.text}}>{parentName}</h2>
          </div>
          <button onClick={handleLogout} style={{background:"none",border:`1.5px solid ${theme.border}`,borderRadius:50,padding:"8px 14px",cursor:"pointer",display:"flex",alignItems:"center",gap:6,color:theme.muted,fontFamily:F.b,fontWeight:600,fontSize:13}}>
            <Icon name="logout" size={16} color={theme.muted}/> Sign out
          </button>
        </div>

        <Card style={{background:`linear-gradient(135deg,${theme.purple},${theme.pink})`,padding:"22px"}}>
          <p style={{color:"rgba(255,255,255,0.8)",fontSize:12,fontWeight:700,letterSpacing:1,textTransform:"uppercase",marginBottom:6}}>Children's Profiles</p>
          <p style={{color:"#fff",fontSize:17,fontWeight:600,lineHeight:1.5,margin:0}}>
            {childrenLoading?"Loading...":children.length===0?"Add your first child profile to get started.":`You have ${children.length} child profile${children.length>1?"s":""}.`}
          </p>
        </Card>

        {children.map(child=>{
          const m=MASCOTS.find(x=>x.id===child.mascot_id)||MASCOTS[0];
          return (
            <Card key={child.id} style={{padding:"18px 20px"}}>
              <div style={{display:"flex",alignItems:"center",gap:14,marginBottom:14}}>
                <div style={{background:m.bg,borderRadius:14,padding:8,flexShrink:0}}>
                  <MascotFace id={m.id} size={44}/>
                </div>
                <div style={{flex:1}}>
                  <h3 style={{fontFamily:F.h,fontSize:20,fontWeight:800,color:theme.text,marginBottom:2}}>{child.name}</h3>
                  <p style={{color:theme.muted,fontSize:13,fontWeight:500,margin:0}}>{child.mascot_name} · joined {child.created_at?.split("T")[0]}</p>
                </div>
              </div>
              <div style={{display:"flex",gap:8}}>
                <Btn small style={{flex:1}} onClick={()=>openChild(child)} loading={childLoading}>Open Profile</Btn>
                <button onClick={()=>setDeleteConfirm(child)} style={{background:"#FFF5F5",border:"1.5px solid #FFCDD2",borderRadius:50,padding:"8px 14px",cursor:"pointer",display:"flex",alignItems:"center"}}>
                  <Icon name="trash" size={16} color="#E53935"/>
                </button>
              </div>
            </Card>
          );
        })}

        {!addingChild?(
          <Btn onClick={()=>{setAddingChild(true);setAddStep(1);}} icon="plus" color="#EEE9FF" textColor={theme.purple} style={{width:"100%",marginTop:4}}>
            Add Child Profile
          </Btn>
        ):(
          <Card style={{border:`2px solid ${theme.purple}22`}}>
            {addStep===1&&(
              <>
                <h3 style={{fontFamily:F.h,fontSize:20,fontWeight:800,color:theme.text,marginBottom:8}}>What's your child's name?</h3>
                <TextInput value={newChildName} onChange={e=>setNewChildName(e.target.value)} placeholder="Child's name" style={{marginBottom:16}}/>
                <div style={{display:"flex",gap:8}}>
                  <Btn small onClick={()=>{if(newChildName.trim())setAddStep(2);}}>Next</Btn>
                  <Btn small color="#f5f5f5" textColor={theme.muted} onClick={()=>{setAddingChild(false);setNewChildName("");}}>Cancel</Btn>
                </div>
              </>
            )}
            {addStep===2&&(
              <>
                <h3 style={{fontFamily:F.h,fontSize:20,fontWeight:800,color:theme.text,marginBottom:8}}>Pick {newChildName}'s buddy</h3>
                <div style={{display:"grid",gridTemplateColumns:"repeat(3,1fr)",gap:10,marginBottom:16}}>
                  {MASCOTS.map(m=>(
                    <button key={m.id} onClick={()=>setNewChildMascot(m)} style={{background:newChildMascot?.id===m.id?m.color:m.bg,border:`2px solid ${newChildMascot?.id===m.id?m.color:"transparent"}`,borderRadius:16,padding:"12px 6px",cursor:"pointer",display:"flex",flexDirection:"column",alignItems:"center",gap:6,transform:newChildMascot?.id===m.id?"scale(1.06)":"scale(1)",transition:"all 0.18s"}}>
                      <MascotFace id={m.id} size={44}/>
                      <span style={{fontSize:12,fontWeight:700,fontFamily:F.b,color:newChildMascot?.id===m.id?"#fff":m.color}}>{m.name}</span>
                    </button>
                  ))}
                </div>
                <div style={{display:"flex",gap:8}}>
                  <Btn small icon="check" disabled={!newChildMascot} loading={addLoading} onClick={handleAddChild}>Create Profile</Btn>
                  <Btn small color="#f5f5f5" textColor={theme.muted} onClick={()=>setAddStep(1)}>Back</Btn>
                </div>
              </>
            )}
          </Card>
        )}

        <button onClick={()=>setShowInsights(true)} style={{width:"100%",background:"#fff",border:`1.5px solid ${theme.border}`,borderRadius:20,padding:"18px 20px",cursor:"pointer",marginTop:8,display:"flex",alignItems:"center",gap:14,boxShadow:"0 2px 18px rgba(124,77,255,0.07)",transition:"transform 0.15s"}}
          onMouseDown={e=>e.currentTarget.style.transform="scale(0.98)"}
          onMouseUp={e=>e.currentTarget.style.transform="scale(1)"}>
          <div style={{background:"#EDE7F6",borderRadius:14,padding:10,flexShrink:0}}>
            <Icon name="lock" size={24} color={theme.purple}/>
          </div>
          <div style={{flex:1,textAlign:"left"}}>
            <p style={{fontFamily:F.h,fontWeight:800,fontSize:17,color:theme.text,margin:0}}>Parent Insights</p>
            <p style={{color:theme.muted,fontSize:13,fontWeight:500,margin:0}}>View activity, mood history and journals</p>
          </div>
          <Icon name="back" size={20} color={theme.muted} style={{transform:"rotate(180deg)"}}/>
        </button>

        <button onClick={()=>setShowSettings(true)} style={{width:"100%",background:"#fff",border:`1.5px solid ${theme.border}`,borderRadius:20,padding:"18px 20px",cursor:"pointer",marginTop:8,display:"flex",alignItems:"center",gap:14,boxShadow:"0 2px 18px rgba(124,77,255,0.07)",transition:"transform 0.15s"}}
          onMouseDown={e=>e.currentTarget.style.transform="scale(0.98)"}
          onMouseUp={e=>e.currentTarget.style.transform="scale(1)"}>
          <div style={{background:"#EDE7F6",borderRadius:14,padding:10,flexShrink:0}}>
            <Icon name="settings" size={24} color={theme.purple}/>
          </div>
          <div style={{flex:1,textAlign:"left"}}>
            <p style={{fontFamily:F.h,fontWeight:800,fontSize:17,color:theme.text,margin:0}}>Settings</p>
            <p style={{color:theme.muted,fontSize:13,fontWeight:500,margin:0}}>Dark mode, sound effects and more</p>
          </div>
          <Icon name="back" size={20} color={theme.muted} style={{transform:"rotate(180deg)"}}/>
        </button>
      </div>
    </Shell>
  );

  /* ── Child intro ── */
  const childMascot = activeChild ? (MASCOTS.find(m=>m.id===activeChild.mascot_id)||MASCOTS[0]) : null;
  if (activeChild&&showChildIntro&&childMascot) {
    return <ChildOnboarding child={activeChild} mascot={childMascot} onFinish={handleFinishIntro}/>;
  }

  /* ── Mascot room ── */
  if (showMascotRoom) return (
    <MascotRoom activeChild={activeChild} moodLog={moodLog} journals={journals}
      energy={energy} berries={berries} onFeed={feedMascot} onClose={()=>setShowMascotRoom(false)}/>
  );

  /* ── Child app shell ── */
  const NavBar = () => (
    <div style={{position:"fixed",bottom:0,left:0,right:0,background:darkMode?"#1e1438":"#fff",borderTop:`1.5px solid ${theme.border}`,display:"flex",justifyContent:"space-around",alignItems:"center",padding:"10px 0 20px",zIndex:100,boxShadow:darkMode?"0 -4px 20px rgba(0,0,0,0.3)":"0 -4px 20px rgba(124,77,255,0.07)"}}>
      {[
        {id:"home",     icon:"home",  label:"Home"},
        {id:"mood",     icon:"mood",  label:"Mood", dot:!todayEntry},
        {id:"journal",  icon:"book",  label:"Journal"},
        {id:"breathe",  icon:"wind",  label:"Breathe"},
        {id:"gratitude",icon:"heart", label:"Grateful"},
        {id:"affirm",   icon:"star",  label:"Affirm"},
      ].map(t=>(
        <button key={t.id} onClick={()=>{
          if (t.id!=="breathe" && breathActive) {
            setBreathActive(false);
            setBreathPhase(0);
            setBreathCount(0);
          }
          setTab(t.id);
        }} style={{background:"none",border:"none",cursor:"pointer",display:"flex",flexDirection:"column",alignItems:"center",gap:3,opacity:tab===t.id?1:0.35,transform:tab===t.id?"scale(1.12)":"scale(1)",transition:"all 0.18s",position:"relative"}}>
          <div style={{position:"relative",display:"inline-flex"}}>
            <Icon name={t.icon} size={24} color={tab===t.id?theme.purple:theme.muted}/>
            {t.dot&&tab!==t.id&&(
              <div style={{
                position:"absolute",top:-2,right:-2,
                width:8,height:8,borderRadius:"50%",
                background:"#F06292",
                boxShadow:"0 0 0 2px #fff",
                animation:"pulse 1.8s ease-in-out infinite",
              }}/>
            )}
          </div>
          <span style={{fontSize:11,fontWeight:700,fontFamily:F.b,color:tab===t.id?theme.purple:theme.muted}}>{t.label}</span>
        </button>
      ))}

    </div>
  );

  return (
    <AppContext.Provider value={ctxValue}>
      <Shell stageBg={darkMode?undefined:stageBg} dark={darkMode}>
        <Toast visible={toast.visible} message={toast.message} type={toast.type}/>

        <SeedPopup visible={seedPopup.visible} amount={seedPopup.amount} gold={seedPopup.gold}/>
        <FloatingBerry visible={floatingBerry} targetRef={basketRef} onDone={()=>setFloatingBerry(false)}/>
        <NavBar/>
        {celebration!==null&&<GrowthCelebration mascotId={cm.id} newStage={celebration} childName={activeChild.name} onDismiss={()=>setCelebration(null)}/>}

        {/* Header */}
        <div style={{paddingTop:18,display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:4}}>
          {tab!=="home"?(
            <button onClick={()=>setTab("home")} style={{background:"none",border:"none",cursor:"pointer",display:"flex",alignItems:"center",gap:5,color:theme.muted,fontFamily:F.b,fontWeight:600,fontSize:13}}>
              <Icon name="back" size={18} color={theme.muted}/> Home
            </button>
          ):(
            <button onClick={()=>{
              if (journalText.trim()) {
                if (!window.confirm("You have an unsaved journal entry. Leave anyway?")) return;
              }
              setActiveChild(null); setBreathActive(false); setJournalText("");
            }} style={{background:"none",border:"none",cursor:"pointer",display:"flex",alignItems:"center",gap:5,color:theme.muted,fontFamily:F.b,fontWeight:600,fontSize:13}}>
              <Icon name="back" size={18} color={theme.muted}/> Profiles
            </button>
          )}
          <span style={{fontSize:13,fontWeight:700,color:theme.muted,fontFamily:F.b,
            maxWidth:120,overflow:"hidden",textOverflow:"ellipsis",whiteSpace:"nowrap",
            display:"inline-block"}}>{activeChild.name}</span>
          <BerryBasket berries={berries} energy={energy} mascotName={cm.name} onFeed={feedMascot} onGoToRoom={()=>setShowMascotRoom(true)} basketRef={basketRef}/>
        </div>

        {/* Tab content */}
        {tab==="home"     && <HomeTab/>}
        {tab==="mood"     && <MoodTab/>}
        {tab==="affirm"   && <AffirmTab/>}
        {tab==="breathe"  && <BreatheTab/>}
        {tab==="journal"  && <JournalTab/>}
        {tab==="gratitude"&& <GratitudeTab/>}
      </Shell>
    </AppContext.Provider>
  );
}
