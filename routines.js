/* ── Routine CRUD + history/statistics (all derived from real data) ── */
const Routines = {
  list(){ return Store.data.routines; },
  get(id){ return Store.data.routines.find(r=>r.id===id); },
  save(r){
    const i = Store.data.routines.findIndex(x=>x.id===r.id);
    if (i>=0) Store.data.routines[i]=r; else Store.data.routines.push(r);
    Store.save();
  },
  duplicate(id){
    const r = this.get(id); if (!r) return;
    const c = JSON.parse(JSON.stringify(r));
    c.id = uid(); c.exercises.forEach(e=>e.id=uid());
    c.name = {fa:r.name?.fa + " (کپی)", en:(r.name?.en||"")+" (copy)"};
    this.save(c);
  },
  remove(id){ Store.data.routines = Store.data.routines.filter(r=>r.id!==id); Store.save(); },

  estSeconds(r){
    let s = r.prepare||0;
    for (let round=1; round<=r.rounds; round++){
      r.exercises.forEach((ex,i)=>{
        s += ex.mode==="manual" ? 30 : (ex.duration||0);
        const isLastGlobally = round===r.rounds && i===r.exercises.length-1;
        if (!(r.skipLastRest && isLastGlobally)) s += ex.rest||0;
      });
      if (round<r.rounds) s += r.restBetweenRounds||0;
    }
    if (r.cooldown?.enabled) s += r.cooldown.duration||0;
    return s;
  },
  dayKey(d){ const x=new Date(d); return x.getFullYear()+"-"+String(x.getMonth()+1).padStart(2,"0")+"-"+String(x.getDate()).padStart(2,"0"); },

  recordSession(routineName, durationSec, completed, parts){
    // never record duplicates when returning/refreshing mid-save: each "save result" press is explicit
    Store.data.history.push({ id:uid(), routineName, date:new Date().toISOString(),
      durationSec:Math.round(durationSec), completed:!!completed, parts:parts||[] });
    Store.save();
  },

  stats(){
    const h = Store.data.history.filter(x=>x.completed);
    const totalMin = Math.round(h.reduce((a,x)=>a+(x.durationSec||0),0)/60);
    const days = new Set(h.map(x=>this.dayKey(x.date)));
    // streaks computed on local calendar days
    let cur=0, best=0;
    const sorted=[...days].sort();
    let run=0, prev=null;
    for (const d of sorted){
      if (prev && (new Date(d)-new Date(prev))===86400000) run++; else run=1;
      best=Math.max(best,run); prev=new Date(d);
    }
    // current streak counts back from today/yesterday
    const today=new Date(); const todayK=this.dayKey(today);
    let probe=new Date(today); cur=0;
    if (!days.has(todayK)) probe.setDate(probe.getDate()-1); // streak alive if trained yesterday
    while (days.has(this.dayKey(probe))){ cur++; probe.setDate(probe.getDate()-1); }
    // week bars (last 7 days, local)
    const week=[];
    for (let i=6;i>=0;i--){
      const d=new Date(today); d.setDate(d.getDate()-i);
      const min=Math.round(h.filter(x=>this.dayKey(x.date)===this.dayKey(d)).reduce((a,x)=>a+x.durationSec,0)/60);
      week.push({label:t("daysShort")[d.getDay()], min});
    }
    const todayMin = week[6].min;
    return {totalMin, sessions:h.length, streak:cur, best:Math.max(best,cur), week, todayMin};
  },

  // Month calendar: weeks starting Saturday (Iran) — cells for trained days
  monthCells(){
    const now=new Date(), y=now.getFullYear(), m=now.getMonth();
    const first=new Date(y,m,1);
    const offset=(first.getDay()+1)%7;      // Saturday-first grid
    const days=new Date(y,m+1,0).getDate();
    const trained=new Set(Store.data.history.filter(x=>x.completed).map(x=>this.dayKey(x.date)));
    const cells=[];
    for(let i=0;i<offset;i++) cells.push(null);
    for(let d=1;d<=days;d++){
      const key=y+"-"+String(m+1).padStart(2,"0")+"-"+String(d).padStart(2,"0");
      cells.push({d, trained:trained.has(key), today:d===now.getDate()});
    }
    return cells;
  }
};