/* ── All DOM rendering and event wiring ────────────────────── */
const UI = {
  els:{},
  init(){
    const $=id=>document.getElementById(id);
    this.els={ $,
      navbar:$("navbar"), greeting:$("greeting"), todayDate:$("todayDate"),
      todayCard:$("todayCard"), todayName:$("todayName"), todayMeta:$("todayMeta"), todayDuration:$("todayDuration"),
      homeStartBtn:$("homeStartBtn"), statStreak:$("statStreak"), statMinutes:$("statMinutes"),
      statSessions:$("statSessions"), statDone:$("statDone"), weekBars:$("weekBars"),
      routineList:$("routineList"), bExList:$("bExList"), bEst:$("bEst"),
      ringFg:$("ringFg"), pPhase:$("pPhase"), pRound:$("pRound"), pName:$("pName"), pTime:$("pTime"),
      pNext:$("pNext"), pProg:$("pProg"), pPlay:$("pPlay"),
      pSummary:$("pSummary"), sTitle:$("sTitle"), sDur:$("sDur"), sDetail:$("sDetail"),
      presets:$("presets"), tEst:$("tEst"),
      prBars:$("prBars"), prCal:$("prCal"), prList:$("prList"),
      dlg:$("dlg"), dlgTitle:$("dlgTitle"), dlgMsg:$("dlgMsg"), dlgOk:$("dlgOk"), dlgCancel:$("dlgCancel"),
      libDlg:$("libDlg"), libList:$("libList"), exDlg:$("exDlg"),
    };
    this.RING_C = 2*Math.PI*88;
    this.els.ringFg.style.strokeDasharray = this.RING_C;
  },

  /* ── navigation ── */
  NAV:[["home","🏠","home"],["workouts","💪","workouts"],["timer","⏱","timer"],["progress","📈","progress"],["settings","⚙️","settings"]],
  buildNav(){
    this.els.navbar.innerHTML = this.NAV.map(([id,ic,label])=>
      `<button class="nav-btn" data-page="${id}"><span>${ic}</span>${t(label)}</button>`).join("");
    this.els.navbar.querySelectorAll("[data-page]").forEach(b=>
      b.addEventListener("click", ()=>this.showPage(b.dataset.page)));
  },
  showPage(id){
    document.querySelectorAll(".page").forEach(p=>p.classList.remove("active"));
    document.getElementById("page-"+id).classList.add("active");
    this.els.navbar.querySelectorAll("[data-page]").forEach(b=>b.classList.toggle("on", b.dataset.page===id));
    window.scrollTo({top:0});
    if (id==="home") this.renderHome();
    if (id==="workouts") this.renderRoutines();
    if (id==="progress") this.renderProgress();
    if (id==="timer") this.renderPresets();
    if (id==="settings") this.fillSettings();
  },

  /* ── apply language/theme to the shell ── */
  applyShell(){
    document.documentElement.lang = App.lang;
    document.documentElement.dir = App.lang==="fa" ? "rtl" : "ltr";
    document.querySelectorAll("[data-i18n]").forEach(el=>{ el.textContent = t(el.dataset.i18n); });
    document.getElementById("themeBtn").textContent = App.data.settings.theme==="dark" ? "🌙" : "☀️";
  },

  /* ── home ── */
  renderHome(){
    const h=new Date().getHours();
    this.els.greeting.textContent = h<12 ? t("startDay") : (h<18 ? t("startDayEve") : t("startNight"));
    this.els.todayDate.textContent = new Date().toLocaleDateString(App.lang==="fa"?"fa-IR":"en-GB",{weekday:"long",day:"numeric",month:"long"});
    const s = Routines.stats();
    this.els.statStreak.textContent=fa(s.streak); this.els.statMinutes.textContent=fa(s.totalMin);
    this.els.statSessions.textContent=fa(s.sessions); this.els.statDone.textContent=fa(s.todayMin);
    const r = Routines.list()[0];
    if (r){
      const est = Routines.estSeconds(r);
      this.els.todayName.textContent = r.name[App.lang] || r.name.fa;
      this.els.todayMeta.textContent = r.desc?.[App.lang] || r.desc?.fa || (r.exercises.length + " " + t("exercises"));
      this.els.todayDuration.textContent = fa(Math.ceil(est/60)) + " " + t("minutes");
      this.els.todayCard.classList.remove("hidden");
    } else this.els.todayCard.classList.add("hidden");
    this.renderBars(this.els.weekBars, s.week);
  },
  renderBars(container, week){
    const max = Math.max(10, ...week.map(w=>w.min));
    container.innerHTML = week.map(w=>{
      const hPct = Math.round(w.min/max*100);
      return `<div class="bar-col"><div class="bar ${w.min?"":"zero"}" style="height:${w.min?Math.max(hPct,6):4}%"></div>
        <div class="bar-l">${w.label}</div></div>`;
    }).join("");
  },

  /* ── routines list ── */
  renderRoutines(){
    const list = Routines.list();
    if (!list.length){ this.els.routineList.innerHTML = `<p class="muted">${t("emptyRoutines")}</p>`; return; }
    this.els.routineList.innerHTML = list.map(r=>{
      const est = Math.ceil(Routines.estSeconds(r)/60);
      return `<div class="card routine"><div class="routine-head">
        <div><h4>${r.name[App.lang]||r.name.fa}</h4>
        <span class="muted">${fa(r.exercises.length)} ${t("exercises")} · ${fa(r.rounds)} ${t("round")} · ~${fa(est)} ${t("minutes")}</span></div>
        <div class="r-actions">
          <button class="mini" data-act="start" data-id="${r.id}" title="${t("start")}">▶</button>
          <button class="mini" data-act="edit" data-id="${r.id}" title="${t("edit")}">✏️</button>
          <button class="mini" data-act="dup" data-id="${r.id}" title="${t("duplicate")}">⧉</button>
          <button class="mini del" data-act="del" data-id="${r.id}" title="${t("del")}">🗑</button>
        </div></div></div>`;
    }).join("");
    this.els.routineList.querySelectorAll("[data-act]").forEach(b=>b.addEventListener("click",()=>{
      const id=b.dataset.id, act=b.dataset.act;
      if (act==="start") App.startRoutine(id);
      if (act==="edit") Builder.open(id);
      if (act==="dup") { Routines.duplicate(id); this.renderRoutines(); }
      if (act==="del") this.confirm(t("del"), t("confirmDelete"), ()=>{ Routines.remove(id); this.renderRoutines(); });
    }));
  },

  /* ── builder ── */
  renderBuilderEx(){
    const r = Builder.draft;
    this.els.bExList.innerHTML = r.exercises.map((ex,i)=>`<div class="ex-row">
      <div class="num">${fa(i+1)}</div>
      <div class="body"><div class="name" data-edit="${i}">${ex.fa}${ex.en?` <span class="muted" dir="ltr">${ex.en}</span>`:""}</div>
      <div class="meta">${ex.mode==="manual"? (ex.reps?("×"+ex.reps+" · "+t("manual")):t("manual")) : fa(ex.duration)+" "+t("sec")+" "+t("exercise")} · ${fa(ex.rest||0)} ${t("sec")} ${t("rest")}</div></div>
      <div class="tools">
        <button class="mini" data-up="${i}" ${i===0?"disabled":""}>↑</button>
        <button class="mini" data-down="${i}" ${i===r.exercises.length-1?"disabled":""}>↓</button>
        <button class="mini" data-copyex="${i}">⧉</button>
        <button class="mini del" data-delex="${i}">🗑</button>
      </div></div>`).join("");
    // estimated total
    const draftRoutine = {...r, cooldown:r.cooldownEnabled?{enabled:true,duration:120}:null};
    this.els.bEst.textContent = t("estTotal") + " " + fa(Math.ceil(Routines.estSeconds(draftRoutine)/60)) + " " + t("minutes");
    // events
    const wire=(sel,fn)=>this.els.bExList.querySelectorAll(sel).forEach(b=>b.addEventListener("click",()=>fn(+b.dataset[Object.keys(b.dataset)[0]])));
    wire("[data-up]", i=>{ const a=r.exercises; [a[i-1],a[i]]=[a[i],a[i-1]]; this.renderBuilderEx(); });
    wire("[data-down]", i=>{ const a=r.exercises; [a[i+1],a[i]]=[a[i],a[i+1]]; this.renderBuilderEx(); });
    wire("[data-delex]", i=>{ r.exercises.splice(i,1); this.renderBuilderEx(); });
    wire("[data-copyex]", i=>{ const c=JSON.parse(JSON.stringify(r.exercises[i])); c.id=uid(); c.fa+=" ۲"; r.exercises.splice(i+1,0,c); this.renderBuilderEx(); });
    this.els.bExList.querySelectorAll("[data-edit]").forEach(b=>b.addEventListener("click",()=>Builder.editExercise(+b.dataset.edit)));
  },

  /* ── player ── */
  showPlayer(){
    document.querySelectorAll(".page").forEach(p=>p.classList.remove("active"));
    document.getElementById("page-player").classList.add("active");
    this.els.navbar.querySelectorAll("[data-page]").forEach(b=>b.classList.remove("on"));
    this.els.pSummary.classList.add("hidden");
    document.querySelector(".player").classList.remove("hidden");
    window.scrollTo({top:0});
  },
  backToPage(id){ this.showPage(id || "home"); },

  phaseClass(type){ return {exercise:"phase-exercise",rest:"phase-rest",prepare:"phase-prepare",roundrest:"phase-rest",cooldown:"phase-cooldown"}[type]||"phase-exercise"; },
  phaseLabel(type){ return t(type==="roundrest"?"rest":type); },
  ringColor(type){ return {exercise:"var(--accent)",rest:"var(--rest)",prepare:"var(--ok)",roundrest:"var(--rest)",cooldown:"#b49aff"}[type]||"var(--accent)"; },

  renderSegment(seg, idx, total, planSec, doneSec, waiting){
    const s = seg;
    this.els.pPhase.textContent = waiting ? "⏸ " + t("confirm") : this.phaseLabel(s.type);
    this.els.pPhase.className = "chip phase-chip " + this.phaseClass(s.type);
    const name = (App.lang==="en" && s.en?.en) ? s.en.en : s.fa?.fa || s.fa;
    this.els.pName.textContent = name;
    if (s.round) this.els.pRound.textContent = t("round") + " " + fa(s.round);
    else this.els.pRound.textContent = "";
    // next segment
    const nxt = ENGINE.segs[idx+1];
    if (nxt){
      const nname = (App.lang==="en" && nxt.en?.en) ? nxt.en.en : nxt.fa?.fa || nxt.fa;
      this.els.pNext.textContent = t("next") + " " + nname;
    } else this.els.pNext.textContent = t("done");
    const manual = s.type==="exercise" && s.en && s.en.mode==="manual";
    if (manual){
      this.els.pNext.textContent = t("manual") + (s.en?.reps? " — ×"+fa(s.en.reps):"");
    }
    this.els.pPlay.textContent = ENGINE.running ? "⏸" : "▶";
    this.els.ringFg.style.stroke = this.ringColor(s.type);
    document.documentElement.style.setProperty("--ring", this.ringColor(s.type));
    this.updateClock(s.duration, s.duration, planSec, doneSec);
  },
  updateClock(remain, segDur, planSec, doneSec){
    this.els.pTime.textContent = mmss(remain);
    const frac = segDur>0 ? Math.min(1, (segDur-remain)/segDur) : 1;
    this.els.ringFg.style.strokeDashoffset = String(this.RING_C * (1-frac));
    const overall = planSec>0 ? Math.min(100, Math.round(doneSec/planSec*100)) : 0;
    this.els.pProg.style.width = overall + "%";
  },

  renderSummary(completed){
    const dur = Math.round((Date.now()-ENGINE.sessionStart)/1000);
    document.querySelector(".player").classList.add("hidden");
    this.els.pSummary.classList.remove("hidden");
    this.els.sTitle.textContent = completed ? "🎉 " + t("done") : t("cancelled");
    this.els.sDur.textContent = fa(Math.round(dur/60)) + " " + t("minutes");
    const done = ENGINE.idx;
    this.els.sDetail.textContent = fa(done) + " / " + fa(ENGINE.segs.length) + " " + t("exercises") +
      " · " + (completed? t("completed") : t("cancelled"));
    this._summaryData = {completed, dur};
  },

  /* ── custom timer page ── */
  renderPresets(){
    const P=[[20,10],[30,15],[40,20],[45,15],[60,30]];
    this.els.presets.innerHTML = P.map(([w,r])=>
      `<button data-w="${w}" data-r="${r}">${fa(w)}/${fa(r)}</button>`).join("");
    this.els.presets.querySelectorAll("button").forEach(b=>b.addEventListener("click",()=>{
      $("tWork").value=b.dataset.w; $("tRest").value=b.dataset.r;
      this.els.presets.querySelectorAll("button").forEach(x=>x.classList.remove("on"));
      b.classList.add("on"); this.updateTEst();
    }));
    this.updateTEst();
  },
  updateTEst(){
    const w=Math.max(0,+$("tWork").value||0), r=Math.max(0,+$("tRest").value||0),
          n=Math.max(1,+$("tRounds").value||1), p=Math.max(0,+$("tPrep").value||0),
          c=Math.max(0,+$("tCool").value||0);
    const tot = p + n*w + (n>0 ? (n-1)*r : 0) + c;
    this.els.tEst.textContent = t("estTotal") + " " + fa(Math.floor(tot/60)) + ":" + fa(String(tot%60).padStart(2,"0"));
  },

  /* ── progress ── */
  renderProgress(){
    const s = Routines.stats();
    $("prSessions").textContent=fa(s.sessions); $("prMin").textContent=fa(s.totalMin);
    $("prStreak").textContent=fa(s.streak); $("prBest").textContent=fa(s.best);
    this.renderBars(this.els.prBars, s.week);
    const cells = Routines.monthCells();
    this.els.prCal.innerHTML = cells.map(c=>
      c ? `<div class="d ${c.trained?"trained":""} ${c.today?"today":""}">${fa(c.d)}</div>` : `<div class="d"></div>`
    ).join("");
    const hist = [...Store.data.history].sort((a,b)=>new Date(b.date)-new Date(a.date));
    if (!hist.length){ this.els.prList.innerHTML = `<p class="muted">${t("noHistory")}</p>`; return; }
    this.els.prList.innerHTML = hist.map(h=>{
      const d=new Date(h.date).toLocaleString(App.lang==="fa"?"fa-IR":"en-GB",{day:"numeric",month:"short",hour:"2-digit",minute:"2-digit"});
      return `<div class="hist-item" data-hid="${h.id}"><b>${h.routineName}</b>
        <div class="muted">${d} · ${fa(Math.round(h.durationSec/60))} ${t("minutes")} · ${h.completed? "✅ "+t("completed") : "⏸ "+t("cancelled")}</div></div>`;
    }).join("");
    this.els.prList.querySelectorAll("[data-hid]").forEach(el=>el.addEventListener("click",()=>this.showSession(el.dataset.hid)));
  },
  showSession(id){
    const h = Store.data.history.find(x=>x.id===id); if (!h) return;
    const rows = (h.parts||[]).map(p=>`<div class="ex-row"><div class="body"><div class="name">${p.fa}</div>
      <div class="meta">${fa(Math.round(p.durationSec))} ${t("sec")}</div></div></div>`).join("");
    this.dialog(t("history"), h.routineName + " — " + new Date(h.date).toLocaleString(App.lang==="fa"?"fa-IR":"en-GB") +
      (rows?`<div style="max-height:40vh;overflow:auto;margin-top:8px">${rows}</div>`:""), null, t("confirm"), true);
  },

  /* ── settings ── */
  fillSettings(){
    const s=App.data.settings;
    $("setLang").value=s.lang; $("setTheme").value=s.theme;
    $("setSound").checked=s.sound; $("setVibe").checked=s.vibration; $("setAuto").checked=s.autoNext;
    $("setAwake").checked=s.keepAwake; $("setConfirm").checked=s.confirmStop; $("setTick").checked=s.tick;
    $("setPrep").value=s.prepare; $("setWork").value=s.defaultWork; $("setRest").value=s.defaultRest; $("setRounds").value=s.defaultRounds;
  },

  /* ── generic dialog ── */
  dialog(title, msg, onOk, okLabel, hideCancel){
    this.els.dlgTitle.textContent = title;
    this.els.dlgMsg.innerHTML = msg || "";
    this.els.dlgOk.textContent = okLabel || t("confirm");
    this.els.dlgCancel.classList.toggle("hidden", !!hideCancel);
    this.els.dlgCancel.textContent = t("cancel");
    const ok=()=>{ this.els.dlg.close(); onOk&&onOk(); };
    const old = this.els.dlgOk.onclick;
    this.els.dlgOk.onclick = ok;
    this.els.dlgCancel.onclick = ()=>this.els.dlg.close();
    this.els.dlg.showModal();
  },
  confirm(title, msg, onOk){ this.dialog(title, msg, onOk, t("yes")); },
}