/* ── Versioned persistence layer over localStorage ─────────── */
const SCHEMA_VERSION = 1;
const KEY = "hometrain.v" + SCHEMA_VERSION;
const LEGACY_KEYS = ["hometrain.v0"];

function uid(){ return Date.now().toString(36) + Math.random().toString(36).slice(2,7); }

function defaultRoutines(){
  return [{
    id: "starter",
    name: {fa:"شروع قوی", en:"Strong Start"},
    desc: {fa:"شش حرکت ساده برای شروع بدون تجهیزات", en:"Six simple moves, no equipment"},
    rounds: 1, restBetweenRounds: 30, prepare: 5,
    skipLastRest: true, cooldown: {enabled:true, name:{fa:"سرد کردن بدن",en:"Cooldown"}, duration:120},
    exercises: [
      {id:uid(), fa:"راه رفتن درجا", en:"Warm-up walk", how:"با گام‌های آرام شروع کن و به‌تدریج سرعت را کمی بالا ببر.", muscles:"قلب و گردش خون", diff:1, duration:120, reps:"", mode:"time", rest:0, safe:""},
      {id:uid(), fa:"نشستن و بلند شدن از صندلی", en:"Chair Squats", how:"روی لبه صندلی بنشین و بدون کمک گرفتن با دست بلند شو.", muscles:"ران و باسن", diff:1, duration:30, reps:"۸", mode:"time", rest:15, safe:"زانوها هم‌جهت پنجه پا باشند."},
      {id:uid(), fa:"شنا روی دیوار", en:"Wall Push-ups", how:"رو به دیوار بایست، کف دست‌ها را روی دیوار بگذار و آرنج‌ها را خم و باز کن.", muscles:"سینه و بازو", diff:1, duration:30, reps:"۸", mode:"time", rest:15, safe:"بدن را صاف نگه دار."},
      {id:uid(), fa:"حرکت دست و پای مخالف", en:"Bird Dog", how:"چهار دست‌وپا؛ دست مخالف و پای مخالف را هم‌زمان صاف کن، کمی نگه دار، بعد تعویض کن.", muscles:"مرکزی بدن و کمر", diff:1, duration:30, reps:"", mode:"time", rest:15, safe:"کمر را قوس نده."},
      {id:uid(), fa:"بالا آمدن روی پنجه پا", en:"Calf Raises", how:"بایست و روی پنجه بالا برو، یک لحظه نگه دار، آرام پایین بیا.", muscles:"ساق پا", diff:1, duration:30, reps:"۱۰", mode:"time", rest:0, safe:"برای تعادل از دیوار کمک بگیر."},
    ]
  }];
}

function defaults(){
  return {
    settings:{ lang:"fa", theme:"dark", sound:true, vibration:true, autoNext:true,
      keepAwake:true, confirmStop:true, tick:true,
      prepare:5, defaultWork:30, defaultRest:15, defaultRounds:1 },
    routines: defaultRoutines(),
    customExercises: [],
    history: []        // {id, routineName, date(ISO), durationSec, completed, parts:[{fa,en,durationSec,diff}]}
  };
}

const Store = {
  data: null,
  load(){
    let raw = null;
    try { raw = JSON.parse(localStorage.getItem(KEY)); } catch(e){ raw = null; }
    if (!raw || typeof raw !== "object"){
      // try legacy / corrupted recover: start fresh, keep history if valid
      let recovered = null;
      for (const k of LEGACY_KEYS){
        try { const o = JSON.parse(localStorage.getItem(k)); if (o && Array.isArray(o.history)) recovered = o; } catch(e){}
      }
      this.data = defaults();
      if (recovered && Array.isArray(recovered.history)) this.data.history = recovered.history;
      this.save();
      return this.data;
    }
    const d = defaults();
    // merge with validation, field by field
    if (raw.settings && typeof raw.settings === "object") d.settings = {...d.settings, ...raw.settings};
    d.routines  = Array.isArray(raw.routines) ? raw.routines.filter(r=>r && r.id && Array.isArray(r.exercises)) : d.routines;
    d.customExercises = Array.isArray(raw.customExercises) ? raw.customExercises.filter(e=>e && e.id) : [];
    d.history   = Array.isArray(raw.history) ? raw.history.filter(h=>h && h.date) : [];
    this.data = d; this.save();
    return d;
  },
  save(){
    try { localStorage.setItem(KEY, JSON.stringify(this.data)); }
    catch(e){ console.warn("storage full", e); }
  },
  reset(){ this.data = defaults(); this.save(); },
  export(){ return JSON.stringify({app:"hometrain", version:SCHEMA_VERSION, exportedAt:new Date().toISOString(), ...this.data}, null, 2); },
  import(json, mode){ // mode: replace | merge — returns error string or null
    let raw;
    try { raw = JSON.parse(json); } catch(e){ return "badJson"; }
    if (!raw || typeof raw !== "object" || raw.app !== "hometrain") return "notAppData";
    const validHist = Array.isArray(raw.history) ? raw.history.filter(h=>h && typeof h.date==="string") : [];
    const validRoutines = Array.isArray(raw.routines) ? raw.routines.filter(r=>r && r.id && Array.isArray(r.exercises)) : [];
    const validEx = Array.isArray(raw.customExercises) ? raw.customExercises.filter(e=>e && e.id) : [];
    if (mode === "merge"){
      const have = new Set(this.data.history.map(h=>h.date + "|" + h.routineName));
      this.data.history = this.data.history.concat(validHist.filter(h=>!have.has(h.date + "|" + h.routineName)));
      const rids = new Set(this.data.routines.map(r=>r.id));
      this.data.routines = this.data.routines.concat(validRoutines.filter(r=>!rids.has(r.id)));
      const eids = new Set(this.data.customExercises.map(e=>e.id));
      this.data.customExercises = this.data.customExercises.concat(validEx.filter(e=>!eids.has(e.id)));
    } else {
      this.data.routines = validRoutines.length ? validRoutines : this.data.routines;
      this.data.customExercises = validEx;
      this.data.history = validHist;
      if (raw.settings && typeof raw.settings === "object") this.data.settings = {...this.data.settings, ...raw.settings};
    }
    this.save();
    return null;
  }
};