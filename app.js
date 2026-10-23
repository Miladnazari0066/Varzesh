/* ── App bootstrap: wiring everything together ─────────────── */
const App = {
  lang: "fa", data: null,
  init(){
    Store.load();
    this.data = Store.data;
    this.lang = this.data.settings.lang;
    UI.init(); UI.applyShell(); UI.buildNav();

    // theme + language
    document.body.classList.toggle("light", this.data.settings.theme==="light");
    document.getElementById("themeBtn").addEventListener("click",()=>{
      this.data.settings.theme = this.data.settings.theme==="dark"?"light":"dark";
      document.body.classList.toggle("light", this.data.settings.theme==="light");
      Store.save(); UI.applyShell();
    });

    /* ── home ── */
    UI.els.homeStartBtn.addEventListener("click",()=>{
      const r = Routines.list()[0]; if (r) this.startRoutine(r.id);
    });
    UI.els.quickTimerBtn.addEventListener("click",()=>UI.showPage("timer"));
    const newR = ()=>Builder.open(null);
    document.getElementById("newRoutineBtn").addEventListener("click",newR);
    document.getElementById("newRoutineBtn2").addEventListener("click",newR);

    /* ── builder ── */
    Builder.wire();

    /* ── player controls ── */
    const P = id=>document.getElementById(id);
    P("pPlay").addEventListener("click",()=>{ ENGINE.toggle(); UI.renderSegment(ENGINE.seg, ENGINE.idx, ENGINE.segs.length, ENGINE.totalPlanSec(), ENGINE.totalDoneSec()); });
    P("pSkip").addEventListener("click",()=>ENGINE.skip());
    P("pRestart").addEventListener("click",()=>ENGINE.restartSegment());
    P("pPlus").addEventListener("click",()=>ENGINE.addTime(15));
    P("pMinus").addEventListener("click",()=>ENGINE.addTime(-15));
    P("pSound").addEventListener("click",e=>{ this.data.settings.sound=!this.data.settings.sound; Store.save(); e.currentTarget.textContent=this.data.settings.sound?"🔊":"🔇"; });
    P("pVibe").addEventListener("click",e=>{ this.data.settings.vibration=!this.data.settings.vibration; Store.save(); e.currentTarget.textContent=this.data.settings.vibration?"📳":"🚫"; });
    P("pStop").addEventListener("click",()=>{
      const stopIt=()=>{ ENGINE.abandon(); UI.renderSummary(false); };
      if (this.data.settings.confirmStop){
        UI.els.dlgOk.textContent=t("yes");
        UI.dialog(t("cancelled"), t("confirmStopMsg"), stopIt, t("yes"));
      } else stopIt();
    });
    P("sSave").addEventListener("click",()=>{
      const {completed,dur} = UI._summaryData || {completed:false,dur:0};
      const routineName = ENGINE.kind==="routine" && ENGINE.routine
        ? (ENGINE.routine.name[App.lang]||ENGINE.routine.name.fa)
        : t("customTimer");
      const parts = ENGINE.segs.slice(0,ENGINE.idx).map(s=>({fa:(App.lang==="en"&&s.en?.en)?s.en.en:(s.fa?.fa||s.fa||""),durationSec:s.duration}));
      Routines.recordSession(routineName, dur, completed, parts);
      UI.backToPage(this.data.settings.lang==="fa"?"home":"home");
      UI.renderHome();
    });
    P("sDiscard").addEventListener("click",()=>UI.backToPage("home"));

    /* ── custom timer ── */
    ["tWork","tRest","tRounds","tPrep","tCool"].forEach(id=>
      P(id).addEventListener("input",()=>UI.updateTEst()));
    P("tStart").addEventListener("click",()=>{
      const w=Math.max(1,Math.min(3600,Math.round(+$("tWork").value||30)));
      const r=Math.max(0,Math.min(3600,Math.round(+$("tRest").value||0)));
      const n=Math.max(1,Math.min(50,Math.round(+$("tRounds").value||1)));
      const p=Math.max(0,Math.min(120,Math.round(+$("tPrep").value||0)));
      const c=Math.max(0,Math.min(600,Math.round(+$("tCool").value||0)));
      if (w<1){ UI.confirm(t("exerciseSec"), t("importErr"), null); return; }
      const segs = ENGINE.buildCustom(w,r,n,p,c);
      if (!segs.length) return;
      ENGINE.start(segs, "custom", null);
    });

    /* ── progress ── */
    P("clearHistory").addEventListener("click",()=>UI.confirm(t("clearHistory"), t("confirmReset"), ()=>{
      Store.data.history=[]; Store.save(); UI.renderProgress(); UI.renderHome();
    }));

    /* ── settings ── */
    const S=(id,fn)=>P(id).addEventListener("change",fn);
    S("setLang",e=>{ this.data.settings.lang=e.target.value; Store.save(); location.reload(); });
    S("setTheme",e=>{ this.data.settings.theme=e.target.value; document.body.classList.toggle("light",e.target.value==="light"); Store.save(); UI.applyShell(); });
    S("setSound",e=>{ this.data.settings.sound=e.target.checked; Store.save(); });
    S("setVibe",e=>{ this.data.settings.vibration=e.target.checked; Store.save(); });
    S("setAuto",e=>{ this.data.settings.autoNext=e.target.checked; Store.save(); });
    S("setAwake",e=>{ this.data.settings.keepAwake=e.target.checked; Store.save(); });
    S("setConfirm",e=>{ this.data.settings.confirmStop=e.target.checked; Store.save(); });
    S("setTick",e=>{ this.data.settings.tick=e.target.checked; Store.save(); });
    S("setPrep",e=>{ this.data.settings.prepare=Math.max(0,Math.min(60,+e.target.value||0)); Store.save(); });
    S("setWork",e=>{ this.data.settings.defaultWork=Math.max(1,+e.target.value||30); Store.save(); });
    S("setRest",e=>{ this.data.settings.defaultRest=Math.max(0,+e.target.value||0); Store.save(); });
    S("setRounds",e=>{ this.data.settings.defaultRounds=Math.max(1,Math.min(10,+e.target.value||1)); Store.save(); });

    /* ── export / import / reset ── */
    P("exportBtn").addEventListener("click",()=>{
      const blob = new Blob([Store.export()],{type:"application/json"});
      const a=document.createElement("a");
      a.href=URL.createObjectURL(blob);
      a.download="hometrain-backup-"+new Date().toISOString().slice(0,10)+".json";
      a.click(); URL.revokeObjectURL(a.href);
    });
    P("importBtn").addEventListener("click",()=>P("importFile").click());
    P("importFile").addEventListener("change",e=>{
      const f=e.target.files[0]; if(!f) return;
      const rd=new FileReader();
      rd.onload=()=>{
        const err = Store.validate ? Store.validate(rd.result) : null;
        // first validate
        let raw; try{ raw=JSON.parse(rd.result);}catch(_){ raw=null; }
        if (!raw || raw.app!=="hometrain"){ UI.dialog(t("import"), t("importErr"), null, t("confirm"), true); return; }
        UI.dialog(t("import"), t("mergeOrReplace"), null, t("merge"), false);
        // build custom dialog with two actions: we reuse dialog with merge, then if cancelled ask replace
        // simpler: two-step dialogs
        UI.els.dlgOk.textContent = t("merge");
        UI.els.dlgOk.onclick = ()=>{ UI.els.dlg.close(); Store.import(rd.result,"merge"); UI.dialog(t("import"),t("imported"),null,t("confirm"),true); UI.renderHome(); };
        UI.els.dlgCancel.textContent = t("replace");
        UI.els.dlgCancel.classList.remove("hidden");
        UI.els.dlgCancel.onclick = ()=>{ UI.els.dlg.close(); Store.import(rd.result,"replace"); UI.dialog(t("import"),t("imported"),null,t("confirm"),true); };
      };
      rd.readAsText(f); e.target.value="";
    });
    P("resetBtn").addEventListener("click",()=>UI.confirm(t("resetAll"), t("confirmReset"), ()=>{
      Store.reset(); location.reload();
    }));

    /* ── exercise editor dialog wiring ── */
    P("exCancel").textContent=t("cancel"); P("exOk").textContent=t("save"); P("libClose").textContent=t("cancel");
    P("exCancel").addEventListener("click",()=>P("exDlg").close());
    P("libClose").addEventListener("click",()=>P("libDlg").close());
    P("exOk").addEventListener("click",()=>Builder.saveExercise());

    /* ── library dialog ── */
    P("bAddLib").addEventListener("click",()=>{
      UI.els.libList.innerHTML = libExercises().map((e,i)=>
        `<div class="lib-item" data-li="${i}"><b>${e.fa}</b><span class="muted">${e.en||""} · ${fa(e.duration)}${t("sec")}</span></div>`).join("");
      UI.els.libList.querySelectorAll("[data-li]").forEach(el=>el.addEventListener("click",()=>{
        const src=libExercises()[+el.dataset.li];
        Builder.draft.exercises.push({id:uid(),...src,rest:this.data.settings.defaultRest,safe:src.safe||""});
        P("libDlg").close(); UI.renderBuilderEx();
      }));
      P("libDlg").showModal();
    });

    UI.showPage("home");
    if ("serviceWorker" in navigator && location.protocol==="https:" || "serviceWorker" in navigator && location.hostname==="localhost"){
      navigator.serviceWorker.register("sw.js").catch(()=>{});
    }
  },

  startRoutine(id){
    const r = Routines.get(id); if (!r || !r.exercises.length) return;
    const segs = ENGINE.buildSegments({...r,
      prepare: r.prepare ?? this.data.settings.prepare,
      rounds: Math.max(1, r.rounds||1)});
    if (!segs.length) return;
    ENGINE.start(segs, "routine", r);
  }
};

/* ── Routine builder ─────────────────────────────────────────── */
const Builder = {
  draft: null, editingId: null, exEditIdx: -1,
  open(id){
    this.editingId = id;
    if (id){
      const r = Routines.get(id);
      this.draft = JSON.parse(JSON.stringify(r));
    } else {
      const s = App.data.settings;
      this.draft = { id:uid(), name:{fa:"",en:""}, desc:{fa:"",en:""},
        rounds:s.defaultRounds, restBetweenRounds:s.defaultRest, prepare:s.prepare,
        skipLastRest:true, cooldownEnabled:false,
        exercises:[{id:uid(), fa:"", en:"", how:"", muscles:"", diff:1,
          duration:s.defaultWork, reps:"", mode:"time", rest:s.defaultRest, safe:""}] };
      // empty exercise row → open its editor immediately
      setTimeout(()=>this.editExercise(0),50);
    }
    document.getElementById("bName").value = this.draft.name.fa || "";
    document.getElementById("bDesc").value = this.draft.desc?.fa || "";
    document.getElementById("bRounds").value = this.draft.rounds;
    document.getElementById("bRestRounds").value = this.draft.restBetweenRounds;
    document.getElementById("bPrepare").value = this.draft.prepare;
    document.getElementById("bSkipLast").checked = !!this.draft.skipLastRest;
    document.getElementById("bCooldown").checked = !!this.draft.cooldownEnabled;
    UI.showPage("builder"); UI.renderBuilderEx();
  },
  wire(){
    const P=id=>document.getElementById(id);
    P("builderBack").addEventListener("click",()=>UI.showPage("workouts"));
    P("bAddNew").addEventListener("click",()=>{
      this.draft.exercises.push({id:uid(), fa:"", en:"", how:"", muscles:"", diff:1,
        duration:App.data.settings.defaultWork, reps:"", mode:"time", rest:App.data.settings.defaultRest, safe:""});
      UI.renderBuilderEx(); this.editExercise(this.draft.exercises.length-1);
    });
    P("bSave").addEventListener("click",()=>{
      const d=this.draft;
      d.name = {fa:P("bName").value.trim()||"تمرین من", en:P("bName").value.trim()};
      d.desc = {fa:P("bDesc").value.trim(), en:P("bDesc").value.trim()};
      d.rounds = Math.max(1,Math.min(10,Math.round(+P("bRounds").value||1)));
      d.restBetweenRounds = Math.max(0,Math.round(+P("bRestRounds").value||0));
      d.prepare = Math.max(0,Math.min(120,Math.round(+P("bPrepare").value||0)));
      d.skipLastRest = P("bSkipLast").checked;
      d.cooldownEnabled = P("bCooldown").checked;
      d.exercises = d.exercises.filter(e=>e.fa && e.fa.trim());
      if (!d.exercises.length){ UI.dialog(t("exercises"), t("importErr"), null, t("confirm"), true); return; }
      if (this.editingId) d.id = this.editingId;
      Routines.save(d);
      UI.showPage("workouts");
    });
  },
  editExercise(i){ this.exEditIdx=i; this._openExDlg(this.draft.exercises[i]); },
  _openExDlg(ex){
    const P=id=>document.getElementById(id);
    P("exDlgTitle").textContent = t("editExercise");
    P("eFa").value=ex.fa; P("eEn").value=ex.en||""; P("eHow").value=ex.how||"";
    P("eMus").value=ex.muscles||""; P("eDiff").value=String(ex.diff||1);
    P("eDur").value=ex.duration||30; P("eReps").value=ex.reps||"";
    P("eMode").value=ex.mode||"time"; P("eRest").value=ex.rest??App.data.settings.defaultRest;
    P("eSafe").value=ex.safe||"";
    P("exDlg").showModal();
  },
  saveExercise(){
    const P=id=>document.getElementById(id);
    const ex=this.draft.exercises[this.exEditIdx]; if(!ex){P("exDlg").close();return;}
    ex.fa=P("eFa").value.trim(); ex.en=P("eEn").value.trim(); ex.how=P("eHow").value.trim();
    ex.muscles=P("eMus").value.trim(); ex.diff=+P("eDiff").value||1;
    ex.duration=Math.max(1,Math.min(1800,Math.round(+P("eDur").value||30)));
    ex.reps=P("eReps").value.trim(); ex.mode=P("eMode").value;
    ex.rest=Math.max(0,Math.round(+P("eRest").value||0)); ex.safe=P("eSafe").value.trim();
    if (!ex.fa){ P("eFa").focus(); return; }
    P("exDlg").close(); UI.renderBuilderEx();
  }
};

document.addEventListener("DOMContentLoaded", ()=>App.init());