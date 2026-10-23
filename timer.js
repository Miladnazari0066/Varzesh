/* ── The workout engine: ONE state machine, ONE rAF loop.
      All timing is timestamp-based (performance.now + elapsed
      accumulation), so pause/resume and throttled background
      tabs never drift. ──────────────────────────────────────── */
const ENGINE = {
  buildSegments(routine){
    // Flattens a routine into a list of segments; rest is part of the same list so exercise/rest can never desync.
    const segs = [];
    const L = ()=>App.lang;
    const push = (type, durationSec, fa, en, exIdx, round) => {
      if (durationSec > 0) segs.push({type, duration:Math.round(durationSec), fa, en, exIdx, round});
    };
    if (routine.prepare > 0)
      push("prepare", routine.prepare, {fa:"آماده‌سازی", en:"Get ready"}, {fa:"آماده‌سازی", en:"Get ready"}, -1, 1);
    for (let r=1; r<=routine.rounds; r++){
      routine.exercises.forEach((ex, i)=>{
        const isLastGlobally = (r === routine.rounds && i === routine.exercises.length-1);
        const dur = ex.mode === "manual" ? 30 : ex.duration; // manual moves have a nominal 30s slot, finished manually
        push("exercise", dur, {fa:ex.fa, en:ex.en}, ex, i, r);
        if (!(routine.skipLastRest && isLastGlobally))
          push("rest", ex.rest ?? App.data.settings.defaultRest, ex, ex, i, r);
      });
      if (r < routine.rounds && routine.restBetweenRounds > 0)
        push("roundrest", routine.restBetweenRounds, {fa:"استراحت بین دورها", en:"Rest between rounds"}, null, r, r);
    }
    if (routine.cooldown && routine.cooldown.enabled && routine.cooldown.duration > 0)
      push("cooldown", routine.cooldown.duration, routine.cooldown.name, routine.cooldown.name, -1, routine.rounds);
    return segs;
  },
  buildCustom(work, rest, rounds, prep, cool){
    const segs = [];
    const push=(type,d,fa,en)=>{ if(d>0) segs.push({type,duration:Math.round(d),fa,en,exIdx:-1,round:0}); };
    push("prepare", prep, {fa:"آماده‌سازی",en:"Get ready"}, {fa:"آماده‌سازی",en:"Get ready"});
    for (let r=1;r<=rounds;r++){
      push("exercise", work, {fa:"تمرین",en:"Exercise"} , null);
      if (!(r===rounds && rest===0)) push("rest", rest, {fa:"استراحت",en:"Rest"}, null);
    }
    push("cooldown", cool, {fa:"سرد کردن بدن",en:"Cooldown"}, {fa:"سرد کردن بدن",en:"Cooldown"});
    return segs;
  },

  // live state
  segs: [], idx: 0, running: false, elapsedInSeg: 0,  // seconds already consumed in current segment
  lastTs: 0, rafId: null, sessionStart: 0, kind: "routine", routine: null,
  tickedFor: -1, manualDone: false,

  get seg(){ return this.segs[this.idx] || null; },
  totalPlanSec(){ return this.segs.reduce((a,s)=>a+s.duration,0); },
  totalDoneSec(){
    let a=0; for(let i=0;i<this.idx;i++) a+=this.segs[i].duration;
    return a + this.elapsedInSeg;
  },

  start(segs, kind, routine){
    this.stopLoop();
    this.segs = segs; this.idx = 0; this.kind = kind; this.routine = routine || null;
    this.running = false; this.elapsedInSeg = 0; this.sessionStart = Date.now();
    this.tickedFor = -1; this.manualDone = false;
    this._enterSegment();          // renders first segment, plays nothing yet
    UI.showPlayer();
    this.pause();                  // wait for user to press play (autoplay-safe)
    this._loop();
  },

  _enterSegment(){
    const s = this.seg;
    this.elapsedInSeg = 0; this.tickedFor = -1; this.manualDone = false;
    if (s){
      const ex = s.type==="exercise" ? s.en : null;
      if (ex && ex.mode === "manual"){ /* manual: no auto transition */ }
      UI.renderSegment(s, this.idx, this.segs.length, this.totalPlanSec(), this.totalDoneSec());
      if (s.type === "exercise" || s.type === "cooldown") Sfx.vibe([120,80,120]);
      else Sfx.vibe(60);
    }
  },

  play(){ this.running = true; this.lastTs = performance.now(); this._acquireWake(); },
  pause(){ this.running = false; this._releaseWake(); },
  toggle(){ this.running ? this.pause() : this.play(); },

  restartSegment(){ this.elapsedInSeg = 0; this.tickedFor = -1; UI.renderSegment(this.seg, this.idx, this.segs.length, this.totalPlanSec(), this.totalDoneSec()); },

  addTime(sec){
    const s = this.seg; if (!s || s.type === "manual") return;
    s.duration = Math.max(1, s.duration + sec);
    UI.renderSegment(s, this.idx, this.segs.length, this.totalPlanSec(), this.totalDoneSec());
  },

  skip(){ // jump to next segment; skipping a manual exercise counts it as done
    this._advance(true);
  },

  stopLoop(){ if (this.rafId) cancelAnimationFrame(this.rafId); this.rafId = null; },

  _advance(fromSkip){
    const s = this.seg;
    // log a completed exercise
    if (s && s.type === "exercise" && (this.manualDone || fromSkip || this.elapsedInSeg >= s.duration)){
      // counted in history on save; nothing per-exercise here
    }
    this.idx++;
    if (this.idx >= this.segs.length){ this._finish(true); return; }
    this._enterSegment();
    // tick countdown for the new segment's last 3 seconds handled in _loop
  },

  _finish(){
    this.pause(); this.running = false;
    UI.renderSummary(true);
    Sfx.finish(); Sfx.vibe([200,100,200,100,300]);
    this.stopLoop();
  },

  abandon(){ // user stopped early
    this.pause(); this.stopLoop(); this._releaseWake();
  },

  _loop(){
    this.rafId = requestAnimationFrame(()=>this._loop());
    const s = this.seg; if (!s) return;
    const now = performance.now();
    if (this.running){
      const dt = (now - this.lastTs) / 1000;
      this.elapsedInSeg += Math.min(dt, 2); // clamp huge jumps (tab was frozen) — time is NOT lost, just capped per frame
    }
    this.lastTs = now;
    const remain = Math.max(0, Math.ceil(s.duration - this.elapsedInSeg));

    // 3-2-1 tick
    const manual = s.type === "exercise" && s.en && s.en.mode === "manual";
    if (App.data.settings.tick && this.running && !manual && remain <= 3 && remain > 0 && this.tickedFor !== remain){
      this.tickedFor = remain; Sfx.tick();
    }
    UI.updateClock(remain, s.duration, this.totalPlanSec(), this.totalDoneSec() + (s.duration - remain));

    // auto-advance (never for manual-mode exercises)
    if (this.running && !manual && this.elapsedInSeg >= s.duration){
      if (App.data.settings.autoNext){
        if (s.type === "exercise") Sfx.go(); else Sfx.restStart();
        this._advance(false);
      } else {
        this.pause();
        UI.renderSegment(s, this.idx, this.segs.length, this.totalPlanSec(), this.totalDoneSec(), true); // waiting state
      }
    }
  },

  // Wake Lock (best-effort, silently ignored where unsupported)
  wakeLock: null,
  async _acquireWake(){
    if (!App.data.settings.keepAwake || !navigator.wakeLock) return;
    try { this.wakeLock = await navigator.wakeLock.request("screen");
      this.wakeLock.addEventListener("release", ()=>{ this.wakeLock = null; }); } catch(e){}
  },
  _releaseWake(){ try{ this.wakeLock?.release(); }catch(e){} this.wakeLock = null; }
};