import { useState, useEffect, useCallback, useRef } from "react";
import { db } from "./firebase";
import { doc, onSnapshot, setDoc, getDoc } from "firebase/firestore";

// ─── Program Data ────────────────────────────────────────────
// Updated Workout Program
const PROGRAM = {
  "Push Day 1": {
    subtitle: "Chest Focus",
    color: "#1B3A5C",
    accent: "#4A90D9",
    exercises: [
      { name: "Smith Machine Flat Bench Press", sets: 4, target: "4–6 reps", compound: true,  cue: "Control the descent, full ROM, drive through chest at top" },
      { name: "Incline Chest Machine",          sets: 3, target: "8–10 reps", compound: true,  cue: "Set seat so handles align with upper chest, squeeze at top" },
      { name: "Pec Deck / Cable Fly",           sets: 3, target: "12–15 reps", compound: false, cue: "Controlled arc, feel stretch at bottom, squeeze at peak" },
      { name: "Weighted Dips",                  sets: 3, target: "8–10 reps", compound: false, cue: "Slight forward lean to bias chest, controlled descent" },
      { name: "Preacher Curl Tricep Press",     sets: 3, target: "10–12 reps", compound: false, cue: "Elbows on pad, full extension, slow eccentric" },
      { name: "Single Arm Cable Tricep Pulldown", sets: 3, target: "12–15 reps", compound: false, cue: "Elbow pinned, full lockout, resist on the way back up" },
    ],
  },
  "Pull Day 1": {
    subtitle: "Back & Biceps",
    color: "#1B4D3E",
    accent: "#4ABF8A",
    exercises: [
      { name: "Weighted Pull-Ups",               sets: 4, target: "4–6 reps",    compound: true,  cue: "Dead hang start, chest to bar, full scapular depression at top" },
      { name: "Single Arm DB or Cable Row",      sets: 4, target: "8–10 reps",   compound: true,  cue: "Brace core, drive elbow past hip, full stretch at bottom" },
      { name: "Chest-Supported Machine Row",     sets: 3, target: "10–12 reps",  compound: false, cue: "Chest on pad, retract scapula, squeeze at peak contraction" },
      { name: "Wide Grip Lat Pulldown",          sets: 3, target: "10–12 reps",  compound: false, cue: "Slight lean back, pull to upper chest, stretch lats at top" },
      { name: "Straight Arm Cable Pulldown",     sets: 3, target: "12–15 reps",  compound: false, cue: "Arms straight, hinge at shoulder, pull to hips — lat isolation" },
      { name: "Barbell or Machine Bicep Curl",   sets: 3, target: "10–12 reps",  compound: false, cue: "Elbows fixed, supinate at top, controlled eccentric" },
      { name: "Hammer Curl",                     sets: 2, target: "12–15 reps",  compound: false, cue: "Neutral grip, controlled eccentric, elbows fixed at sides" },
    ],
  },
  "Leg Day 1": {
    subtitle: "Quad Focus",
    color: "#3D1A5C",
    accent: "#A06BD9",
    exercises: [
      { name: "Back Squat",                        sets: 4, target: "4–6 reps",     compound: true,  cue: "Brace hard, knees out, drive hips — push the floor away" },
      { name: "Bulgarian Split Squat (Smith)",     sets: 3, target: "8–10 reps ea", compound: true,  cue: "Front foot elevated, upright torso, knee tracks toe, feel quad stretch" },
      { name: "Leg Extension",                     sets: 3, target: "12–15 reps",   compound: false, cue: "Control eccentric, pause and squeeze at top, don't slam lockout" },
      { name: "GHD Hamstring Curl",                sets: 3, target: "8–12 reps",    compound: false, cue: "Full extension at start, curl heel to glute, controlled return" },
      { name: "Band Abductor/Adductor",            sets: 2, target: "15–20 reps ea", compound: false, cue: "Controlled throughout, feel tension in glutes/inner thigh" },
      { name: "Calf Raises",                       sets: 4, target: "15–20 reps",   compound: false, cue: "Full stretch at bottom, 2-sec pause at top, controlled descent" },
    ],
  },
  "Push Day 2": {
    subtitle: "Shoulder Focus",
    color: "#1B3A5C",
    accent: "#4A90D9",
    exercises: [
      { name: "Barbell Overhead Press",           sets: 4, target: "4–6 reps",     compound: true,  cue: "Bar clears chin, lock out overhead, ribcage down, no back arch" },
      { name: "Single Arm Landmine Press",        sets: 3, target: "8–10 reps ea", compound: true,  cue: "Half-kneeling if possible — angled bar path, anterior delt + upper chest tie-in" },
      { name: "Side Cable Lateral Raise",         sets: 3, target: "15–20 reps",   compound: false, cue: "Lead with elbow, slight forward lean, cable anchored below hip" },
      { name: "Face Pulls",                       sets: 3, target: "15–20 reps",   compound: false, cue: "External rotate at end range, thumbs behind ears, squeeze rear delts" },
      { name: "Rear Delt Cable Fly",              sets: 3, target: "15–20 reps",   compound: false, cue: "Arms straight, pull across body, focus on rear delt contraction" },
      { name: "Single Arm Cable Tricep Pulldown", sets: 3, target: "12–15 reps",   compound: false, cue: "Elbow pinned, full lockout, resist on the way back up" },
    ],
  },
  "Leg Day 2": {
    subtitle: "Posterior Chain & Abs",
    color: "#3D1A5C",
    accent: "#A06BD9",
    exercises: [
      { name: "Romanian Deadlift",   sets: 4, target: "6–8 reps",   compound: true,  cue: "Hip hinge, push hips back, feel hamstring stretch, bar stays close to body" },
      { name: "Zercher Squat",       sets: 3, target: "8–10 reps",  compound: false, cue: "Bar in crook of elbows, upright torso, brace hard — deep squat, quad + anterior core" },
      { name: "Barbell Hip Thrust",  sets: 3, target: "10–12 reps", compound: false, cue: "Upper back on bench, drive hips to ceiling, squeeze glutes hard at top" },
      { name: "Hamstring Curl",      sets: 3, target: "12–15 reps", compound: false, cue: "2-sec eccentric, squeeze at peak, don't let hips rise off pad" },
      { name: "Calf Raises",         sets: 3, target: "15–20 reps", compound: false, cue: "Full stretch at bottom, slow and controlled, pause at top" },
      { name: "Ab Circuit x3: Cable Crunch 15–20 / Hanging Leg Raise 12–15 / Ab Wheel Rollout 10–12 / Side Plank 30–45s / Plank 45–60s", sets: 3, target: "Circuit", compound: false, cue: "Rest minimally between exercises, 90s between rounds. Posterior tilt on all crunch movements." },
    ],
  },
};

const DAYS = Object.keys(PROGRAM);
const WEEKS = Array.from({ length: 6 }, (_, i) => i + 1);

function logKey(day, week, exIdx, setIdx, field) {
  return `${day}__w${week}__e${exIdx}__s${setIdx}__${field}`;
}

// ─── Sync Code Screen ────────────────────────────────────────
function SyncCodeScreen({ onEnter }) {
  const [code, setCode] = useState("");
  const [error, setError] = useState("");
  const [checking, setChecking] = useState(false);

  const handleSubmit = async () => {
    const trimmed = code.trim().toLowerCase().replace(/\s+/g, "-");
    if (trimmed.length < 3) { setError("Code must be at least 3 characters."); return; }
    setChecking(true);
    setError("");
    try {
      // Just verify Firestore is reachable, then proceed
      await getDoc(doc(db, "trackers", trimmed));
      localStorage.setItem("mass-sync-code", trimmed);
      onEnter(trimmed);
    } catch (e) {
      setError("Couldn't connect to the database. Check your Firebase config.");
    }
    setChecking(false);
  };

  return (
    <div style={{ background: "#0A0A0A", minHeight: "100vh", display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", padding: 24, fontFamily: "'DM Sans', sans-serif" }}>
      <style>{`@import url('https://fonts.googleapis.com/css2?family=Bebas+Neue&family=DM+Sans:wght@300;400;500;600&display=swap');`}</style>
      <div style={{ fontFamily: "'Bebas Neue'", fontSize: 32, color: "#FFF", letterSpacing: 3, marginBottom: 8 }}>MASS METHOD</div>
      <div style={{ fontSize: 12, color: "#555", letterSpacing: 1, textTransform: "uppercase", marginBottom: 40 }}>Cross-Device Sync</div>

      <div style={{ background: "#141414", border: "1px solid #2A2A2A", borderRadius: 16, padding: 28, width: "100%", maxWidth: 340 }}>
        <div style={{ fontSize: 15, color: "#CCC", fontWeight: 600, marginBottom: 6 }}>Enter your sync code</div>
        <div style={{ fontSize: 12, color: "#555", lineHeight: 1.5, marginBottom: 20 }}>
          Pick any code (e.g. <span style={{ color: "#D4A017" }}>kevin-lifts</span>). Use the same code on every device to share your data.
        </div>
        <input
          type="text"
          value={code}
          onChange={e => setCode(e.target.value)}
          onKeyDown={e => e.key === "Enter" && handleSubmit()}
          placeholder="your-sync-code"
          autoCapitalize="none"
          style={{ width: "100%", background: "#1A1A1A", border: "1px solid #333", borderRadius: 10, color: "#FFF", fontFamily: "'DM Sans'", fontSize: 15, padding: "12px 14px", outline: "none", marginBottom: 12, boxSizing: "border-box" }}
        />
        {error && <div style={{ fontSize: 12, color: "#E74C3C", marginBottom: 10 }}>{error}</div>}
        <button
          onClick={handleSubmit}
          disabled={checking}
          style={{ width: "100%", background: "#D4A017", border: "none", borderRadius: 10, color: "#000", fontFamily: "'DM Sans'", fontWeight: 600, fontSize: 14, padding: "13px 0", cursor: checking ? "not-allowed" : "pointer", opacity: checking ? 0.7 : 1 }}>
          {checking ? "Connecting…" : "Let's Go →"}
        </button>
        <div style={{ fontSize: 11, color: "#444", marginTop: 14, textAlign: "center" }}>
          Your code is private — only people who know it can see your data.
        </div>
      </div>
    </div>
  );
}

// ─── Main Tracker ─────────────────────────────────────────────
export default function GymTracker() {
  const [syncCode, setSyncCode] = useState(() => localStorage.getItem("mass-sync-code") || null);
  const [activeDay, setActiveDay] = useState("Push Day 1");
  const [activeWeek, setActiveWeek] = useState(1);
  const [logs, setLogs] = useState({});
  const [bodyweights, setBodyweights] = useState({});
  const [completedSets, setCompletedSets] = useState({});
  const [showCue, setShowCue] = useState(null);
  const [view, setView] = useState("workout");
  const [syncStatus, setSyncStatus] = useState("connecting"); // connecting | ok | error | saving

  const day = PROGRAM[activeDay];
  const saveTimerRef = useRef(null);
  const latestData = useRef({ logs, bodyweights });

  // Keep ref in sync
  useEffect(() => { latestData.current = { logs, bodyweights }; }, [logs, bodyweights]);

  // ── Real-time listener from Firestore ──
  useEffect(() => {
    if (!syncCode) return;
    const ref = doc(db, "trackers", syncCode);
    const unsub = onSnapshot(ref,
      (snap) => {
        if (snap.exists()) {
          const data = snap.data();
          setLogs(data.logs || {});
          setBodyweights(data.bodyweights || {});
        }
        setSyncStatus("ok");
      },
      () => setSyncStatus("error")
    );
    return unsub;
  }, [syncCode]);

  // ── Debounced save to Firestore ──
  const scheduleSave = useCallback((newLogs, newBw) => {
    setSyncStatus("saving");
    if (saveTimerRef.current) clearTimeout(saveTimerRef.current);
    saveTimerRef.current = setTimeout(async () => {
      try {
        await setDoc(doc(db, "trackers", syncCode), { logs: newLogs, bodyweights: newBw }, { merge: true });
        setSyncStatus("ok");
      } catch {
        setSyncStatus("error");
      }
    }, 1200);
  }, [syncCode]);

  const getLog = (d, w, ei, si, field) => logs[logKey(d, w, ei, si, field)] || "";

  const setLog = useCallback((d, w, ei, si, field, value) => {
    setLogs(prev => {
      const next = { ...prev, [logKey(d, w, ei, si, field)]: value };
      scheduleSave(next, latestData.current.bodyweights);
      return next;
    });
  }, [scheduleSave]);

  const setBw = useCallback((w, value) => {
    setBodyweights(prev => {
      const next = { ...prev, [w]: value };
      scheduleSave(latestData.current.logs, next);
      return next;
    });
  }, [scheduleSave]);

  const toggleSet = (ei, si) => {
    const k = `${activeDay}:${activeWeek}:${ei}:${si}`;
    setCompletedSets(prev => ({ ...prev, [k]: !prev[k] }));
  };
  const isSetDone = (ei, si) => !!completedSets[`${activeDay}:${activeWeek}:${ei}:${si}`];

  const totalSetsForDay = day.exercises.reduce((a, e) => a + e.sets, 0);
  const doneSets = day.exercises.reduce((a, e, ei) =>
    a + Array.from({ length: e.sets }, (_, si) => isSetDone(ei, si) ? 1 : 0).reduce((x, y) => x + y, 0), 0);
  const pct = Math.round((doneSets / totalSetsForDay) * 100);

  const statusColor = { connecting: "#888", ok: "#4ABF8A", saving: "#D4A017", error: "#E74C3C" }[syncStatus];
  const statusText  = { connecting: "⏳ connecting…", ok: "✓ synced", saving: "↑ saving…", error: "⚠ sync error" }[syncStatus];

  if (!syncCode) return <SyncCodeScreen onEnter={setSyncCode} />;

  return (
    <div style={styles.root}>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Bebas+Neue&family=DM+Sans:wght@300;400;500;600&display=swap');
        * { box-sizing: border-box; margin: 0; padding: 0; }
        input[type=number]::-webkit-inner-spin-button,
        input[type=number]::-webkit-outer-spin-button { -webkit-appearance: none; }
        input[type=number] { -moz-appearance: textfield; }
        ::-webkit-scrollbar { width: 4px; }
        ::-webkit-scrollbar-track { background: #111; }
        ::-webkit-scrollbar-thumb { background: #333; border-radius: 2px; }
        .set-row  { transition: all 0.2s ease; }
        .set-row.done { opacity: 0.45; }
        .day-tab  { transition: all 0.15s; }
        .day-tab:active  { transform: scale(0.96); }
        .check-btn { transition: all 0.15s; }
        .check-btn:active { transform: scale(0.9); }
        .nav-btn  { transition: all 0.15s; }
        .nav-btn:active  { transform: scale(0.95); }
      `}</style>

      {/* ── Header ── */}
      <div style={{ background: "#0A0A0A", borderBottom: "1px solid #1E1E1E", padding: "14px 16px 10px" }}>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start" }}>
          <div>
            <div style={{ fontFamily: "'Bebas Neue'", fontSize: 26, color: "#FFF", letterSpacing: 2, lineHeight: 1 }}>MASS METHOD</div>
            <div style={{ fontFamily: "'DM Sans'", fontSize: 11, color: "#666", letterSpacing: 1, textTransform: "uppercase", marginTop: 2 }}>Push · Pull · Legs — Phase 2 · 6 Week</div>
          </div>
          <div style={{ display: "flex", gap: 6 }}>
            <button className="nav-btn" onClick={() => setView("workout")}
              style={{ ...styles.viewBtn, background: view === "workout" ? "#D4A017" : "#1A1A1A", color: view === "workout" ? "#000" : "#888" }}>
              Workout
            </button>
            <button className="nav-btn" onClick={() => setView("progress")}
              style={{ ...styles.viewBtn, background: view === "progress" ? "#D4A017" : "#1A1A1A", color: view === "progress" ? "#000" : "#888" }}>
              Progress
            </button>
          </div>
        </div>
      </div>

      {view === "workout" ? (
        <>
          {/* ── Day Tabs ── */}
          <div style={{ background: "#0D0D0D", padding: "10px 12px 0", borderBottom: "1px solid #1A1A1A" }}>
            <div style={{ display: "flex", gap: 6, overflowX: "auto", paddingBottom: 10 }}>
              {DAYS.map(d => {
                const active = d === activeDay;
                const prog = PROGRAM[d];
                return (
                  <button key={d} className="day-tab" onClick={() => setActiveDay(d)}
                    style={{
                      flexShrink: 0, padding: "7px 14px", borderRadius: 8,
                      background: active ? prog.accent : "#1A1A1A",
                      border: active ? `1px solid ${prog.accent}` : "1px solid #2A2A2A",
                      color: active ? "#000" : "#777",
                      fontFamily: "'DM Sans'", fontWeight: 600, fontSize: 12,
                      cursor: "pointer", letterSpacing: 0.3,
                    }}>
                    {d}
                  </button>
                );
              })}
            </div>
          </div>

          {/* ── Day title + week selector ── */}
          <div style={{ background: day.color, padding: "12px 16px", display: "flex", justifyContent: "space-between", alignItems: "center" }}>
            <div>
              <div style={{ fontFamily: "'Bebas Neue'", fontSize: 22, color: "#FFF", letterSpacing: 1.5 }}>{activeDay}</div>
              <div style={{ fontFamily: "'DM Sans'", fontSize: 11, color: "rgba(255,255,255,0.6)", letterSpacing: 0.5 }}>{day.subtitle}</div>
              <div style={{ fontFamily: "'DM Sans'", fontSize: 10, marginTop: 3, color: statusColor }}>{statusText}</div>
            </div>
            <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
              <button onClick={() => setActiveWeek(w => Math.max(1, w - 1))} style={{ ...styles.wkBtn, color: day.accent }}>‹</button>
              <div style={{ textAlign: "center" }}>
                <div style={{ fontFamily: "'Bebas Neue'", fontSize: 20, color: "#FFF", letterSpacing: 1 }}>WK {activeWeek}</div>
                <div style={{ fontFamily: "'DM Sans'", fontSize: 9, color: "rgba(255,255,255,0.5)" }}>of 6</div>
              </div>
              <button onClick={() => setActiveWeek(w => Math.min(12, w + 1))} style={{ ...styles.wkBtn, color: day.accent }}>›</button>
            </div>
          </div>

          {/* ── Progress bar ── */}
          <div style={{ background: "#111", padding: "8px 16px", display: "flex", alignItems: "center", gap: 10 }}>
            <div style={{ flex: 1, background: "#222", borderRadius: 4, height: 6, overflow: "hidden" }}>
              <div style={{ width: `${pct}%`, background: day.accent, height: "100%", borderRadius: 4, transition: "width 0.3s ease" }} />
            </div>
            <div style={{ fontFamily: "'DM Sans'", fontSize: 11, color: "#666", whiteSpace: "nowrap" }}>{doneSets}/{totalSetsForDay} sets</div>
          </div>

          {/* ── Exercises ── */}
          <div style={{ flex: 1, overflowY: "auto", padding: "8px 12px 100px" }}>
            {day.exercises.map((ex, ei) => (
              <div key={ei} style={{ marginBottom: 10, borderRadius: 12, overflow: "hidden", border: `1px solid ${ex.compound ? "#2A2A2A" : "#1A1A1A"}`, background: ex.compound ? "#141414" : "#0F0F0F" }}>
                <div style={{ padding: "10px 14px", display: "flex", justifyContent: "space-between", alignItems: "center", borderBottom: "1px solid #1E1E1E" }}>
                  <div style={{ flex: 1 }}>
                    <div style={{ display: "flex", alignItems: "center", gap: 7 }}>
                      {ex.compound && <div style={{ width: 6, height: 6, borderRadius: "50%", background: day.accent, flexShrink: 0 }} />}
                      <div style={{ fontFamily: "'DM Sans'", fontWeight: 600, fontSize: 13, color: ex.compound ? "#FFF" : "#CCC" }}>{ex.name}</div>
                    </div>
                    <div style={{ fontFamily: "'DM Sans'", fontSize: 11, color: "#555", marginTop: 1, paddingLeft: ex.compound ? 13 : 0 }}>{ex.sets} sets · {ex.target}</div>
                  </div>
                  <button onClick={() => setShowCue(showCue === `${ei}` ? null : `${ei}`)}
                    style={{ background: "none", border: "1px solid #2A2A2A", borderRadius: 6, padding: "4px 8px", color: "#555", fontFamily: "'DM Sans'", fontSize: 11, cursor: "pointer" }}>
                    cue
                  </button>
                </div>

                {showCue === `${ei}` && (
                  <div style={{ padding: "8px 14px", background: "#1A1A1A", borderBottom: "1px solid #222" }}>
                    <div style={{ fontFamily: "'DM Sans'", fontSize: 12, color: day.accent, fontStyle: "italic" }}>💡 {ex.cue}</div>
                  </div>
                )}

                <div style={{ padding: "6px 10px 8px" }}>
                  <div style={{ display: "grid", gridTemplateColumns: "28px 1fr 1fr 32px", gap: 6, padding: "4px 0 6px", borderBottom: "1px solid #1A1A1A", marginBottom: 6 }}>
                    <div />
                    <div style={{ fontFamily: "'DM Sans'", fontSize: 10, color: "#444", textAlign: "center" }}>WEIGHT (lbs)</div>
                    <div style={{ fontFamily: "'DM Sans'", fontSize: 10, color: "#444", textAlign: "center" }}>REPS</div>
                    <div />
                  </div>
                  {Array.from({ length: ex.sets }, (_, si) => {
                    const done = isSetDone(ei, si);
                    const weight = getLog(activeDay, activeWeek, ei, si, "weight");
                    const reps   = getLog(activeDay, activeWeek, ei, si, "reps");
                    const prevWeight = activeWeek > 1 ? getLog(activeDay, activeWeek - 1, ei, si, "weight") : "";
                    const prevReps   = activeWeek > 1 ? getLog(activeDay, activeWeek - 1, ei, si, "reps")   : "";
                    return (
                      <div key={si} className={`set-row ${done ? "done" : ""}`}
                        style={{ display: "grid", gridTemplateColumns: "28px 1fr 1fr 32px", gap: 6, marginBottom: 5, alignItems: "center" }}>
                        <div style={{ fontFamily: "'Bebas Neue'", fontSize: 15, color: done ? "#333" : "#555", textAlign: "center", letterSpacing: 1 }}>{si + 1}</div>
                        <div style={{ position: "relative" }}>
                          <input type="number" placeholder={prevWeight || "lbs"} value={weight}
                            onChange={e => setLog(activeDay, activeWeek, ei, si, "weight", e.target.value)}
                            style={{ ...styles.input, borderColor: done ? "#1A1A1A" : weight ? day.accent + "55" : "#2A2A2A" }} />
                          {prevWeight && !weight && (
                            <div style={{ position: "absolute", right: 6, top: "50%", transform: "translateY(-50%)", fontFamily: "'DM Sans'", fontSize: 9, color: "#3A3A3A", pointerEvents: "none" }}>prev: {prevWeight}</div>
                          )}
                        </div>
                        <div style={{ position: "relative" }}>
                          <input type="number" placeholder={prevReps || ex.target.split("–")[0] || "reps"} value={reps}
                            onChange={e => setLog(activeDay, activeWeek, ei, si, "reps", e.target.value)}
                            style={{ ...styles.input, borderColor: done ? "#1A1A1A" : reps ? day.accent + "55" : "#2A2A2A" }} />
                          {prevReps && !reps && (
                            <div style={{ position: "absolute", right: 6, top: "50%", transform: "translateY(-50%)", fontFamily: "'DM Sans'", fontSize: 9, color: "#3A3A3A", pointerEvents: "none" }}>prev: {prevReps}</div>
                          )}
                        </div>
                        <button className="check-btn" onClick={() => toggleSet(ei, si)}
                          style={{ width: 28, height: 28, borderRadius: 8, border: `2px solid ${done ? day.accent : "#2A2A2A"}`, background: done ? day.accent : "transparent", cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center" }}>
                          {done && <span style={{ fontSize: 13, color: "#000" }}>✓</span>}
                        </button>
                      </div>
                    );
                  })}
                </div>
              </div>
            ))}

            {/* ── Bodyweight ── */}
            <div style={{ borderRadius: 12, border: "1px solid #2A1A1A", background: "#0F0A0A", padding: "12px 14px", marginBottom: 10 }}>
              <div style={{ fontFamily: "'DM Sans'", fontWeight: 600, fontSize: 13, color: "#CCC", marginBottom: 8 }}>📊 Bodyweight this week</div>
              <input type="number" placeholder="lbs (e.g. 194)" value={bodyweights[activeWeek] || ""}
                onChange={e => setBw(activeWeek, e.target.value)}
                style={{ ...styles.input, width: "100%", borderColor: "#3A1A1A" }} />
            </div>

            {/* ── Cardio Finisher ── */}
            <div style={{ borderRadius: 12, border: "1px solid #1A2A1A", background: "#090F09", padding: "12px 14px" }}>
              <div style={{ fontFamily: "'DM Sans'", fontWeight: 600, fontSize: 13, color: "#CCC", marginBottom: 4 }}>🚶 Cardio Finisher</div>
              <div style={{ fontFamily: "'DM Sans'", fontSize: 12, color: "#4ABF8A" }}>10 min incline treadmill walk</div>
              <div style={{ fontFamily: "'DM Sans'", fontSize: 11, color: "#444", marginTop: 2 }}>10–12% grade · 3.0–3.5 mph · fat burn zone</div>
            </div>
          </div>
        </>
      ) : (
        /* ── PROGRESS VIEW ── */
        <div style={{ flex: 1, overflowY: "auto", padding: "12px 12px 80px" }}>
          <div style={{ fontFamily: "'Bebas Neue'", fontSize: 24, color: "#FFF", letterSpacing: 2, marginBottom: 4, padding: "0 4px" }}>Progress Tracker</div>
          <div style={{ fontFamily: "'DM Sans'", fontSize: 11, color: "#555", marginBottom: 16, padding: "0 4px" }}>Top lift per week — enter your heaviest working set</div>

          {/* Bodyweight chart */}
          <div style={{ borderRadius: 12, border: "1px solid #2A1A1A", background: "#0F0A0A", padding: "14px", marginBottom: 12 }}>
            <div style={{ fontFamily: "'DM Sans'", fontWeight: 600, fontSize: 13, color: "#D4A017", marginBottom: 10 }}>⚖️ Bodyweight (lbs) — Goal: 190 → 180</div>
            <div style={{ display: "flex", alignItems: "flex-end", gap: 4, height: 60 }}>
              {WEEKS.map(w => {
                const bw = parseFloat(bodyweights[w]);
                const allBws = WEEKS.map(ww => parseFloat(bodyweights[ww])).filter(v => !isNaN(v));
                const minBw = allBws.length ? Math.min(...allBws) : 180;
                const maxBw = allBws.length ? Math.max(...allBws) : 200;
                const range = maxBw - minBw || 10;
                const h = isNaN(bw) ? 4 : Math.max(4, ((bw - minBw) / range) * 50 + 10);
                return (
                  <div key={w} style={{ flex: 1, display: "flex", flexDirection: "column", alignItems: "center", gap: 2 }}>
                    <div style={{ width: "100%", background: isNaN(bw) ? "#1A1A1A" : bw <= 180 ? "#4ABF8A" : "#D4A017", height: h, borderRadius: "3px 3px 0 0" }} />
                    <div style={{ fontFamily: "'DM Sans'", fontSize: 8, color: "#444" }}>{w}</div>
                  </div>
                );
              })}
            </div>
            <div style={{ display: "flex", gap: 4, marginTop: 8 }}>
              {WEEKS.map(w => (
                <input key={w} type="number" placeholder={w} value={bodyweights[w] || ""} onChange={e => setBw(w, e.target.value)}
                  style={{ flex: 1, background: "#1A1A1A", border: "1px solid #2A2A2A", borderRadius: 4, color: "#D4A017", fontFamily: "'DM Sans'", fontSize: 9, textAlign: "center", padding: "3px 0", minWidth: 0 }} />
              ))}
            </div>
          </div>

          {/* Key lifts */}
          {[
            { day: "Push Day 1", ex: 0, label: "Smith Bench Press" },
            { day: "Push Day 2", ex: 0, label: "Overhead Press" },
            { day: "Leg Day 1",  ex: 0, label: "Back Squat" },
            { day: "Leg Day 2",  ex: 0, label: "Romanian DL" },
            { day: "Pull Day 1", ex: 0, label: "Weighted Pull-Ups" },
            { day: "Pull Day 1", ex: 1, label: "Single Arm Row" },
          ].map(({ day: d, ex: ei, label }) => {
            const prog = PROGRAM[d];
            const ex = prog.exercises[ei];
            const weights = WEEKS.map(w => {
              const vals = Array.from({ length: ex.sets }, (_, si) => parseFloat(getLog(d, w, ei, si, "weight"))).filter(v => !isNaN(v));
              return vals.length ? Math.max(...vals) : null;
            });
            const filled = weights.filter(v => v !== null);
            const maxW = filled.length ? Math.max(...filled) : 0;
            const minW = filled.length ? Math.min(...filled) : 0;
            const trend = filled.length >= 2 ? filled[filled.length - 1] - filled[0] : 0;
            return (
              <div key={label} style={{ borderRadius: 12, border: `1px solid ${prog.color}88`, background: "#0D0D0D", padding: "12px 14px", marginBottom: 8 }}>
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 8 }}>
                  <div style={{ fontFamily: "'DM Sans'", fontWeight: 600, fontSize: 13, color: "#DDD" }}>{label}</div>
                  {filled.length >= 2 && (
                    <div style={{ fontFamily: "'DM Sans'", fontSize: 11, color: trend >= 0 ? "#4ABF8A" : "#E74C3C", fontWeight: 600 }}>
                      {trend >= 0 ? "+" : ""}{trend} lbs
                    </div>
                  )}
                </div>
                <div style={{ display: "flex", alignItems: "flex-end", gap: 3, height: 36 }}>
                  {weights.map((w, i) => {
                    const range = maxW - minW || 20;
                    const h = w === null ? 0 : Math.max(4, ((w - minW) / range) * 28 + 8);
                    return (
                      <div key={i} style={{ flex: 1 }}>
                        <div style={{ width: "100%", background: w === null ? "#1A1A1A" : prog.accent, height: h, borderRadius: "2px 2px 0 0", opacity: w === null ? 0.3 : 1 }} />
                      </div>
                    );
                  })}
                </div>
                <div style={{ display: "flex", gap: 3, marginTop: 2 }}>
                  {WEEKS.map(wk => (
                    <div key={wk} style={{ flex: 1, textAlign: "center", fontFamily: "'DM Sans'", fontSize: 8, color: "#333" }}>{wk}</div>
                  ))}
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}

const styles = {
  root: {
    background: "#0A0A0A",
    minHeight: "100vh",
    display: "flex",
    flexDirection: "column",
    maxWidth: 480,
    margin: "0 auto",
    fontFamily: "'DM Sans', sans-serif",
    color: "#FFF",
  },
  viewBtn: {
    padding: "6px 12px", borderRadius: 8, border: "none",
    fontFamily: "'DM Sans'", fontWeight: 600, fontSize: 11,
    cursor: "pointer", letterSpacing: 0.3,
  },
  wkBtn: {
    background: "none", border: "none", fontSize: 24,
    cursor: "pointer", padding: "0 4px", lineHeight: 1, fontFamily: "'DM Sans'",
  },
  input: {
    width: "100%", background: "#1A1A1A", border: "1px solid #2A2A2A",
    borderRadius: 8, color: "#FFF", fontFamily: "'DM Sans'",
    fontSize: 14, fontWeight: 500, textAlign: "center",
    padding: "8px 4px", outline: "none",
  },
};
