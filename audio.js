/* ── Sound (Web Audio API) + Vibration ─────────────────────── */
const Sfx = {
  ctx: null,
  _ac(){
    if (!this.ctx){ const AC = window.AudioContext || window.webkitAudioContext; if (AC) this.ctx = new AC(); }
    if (this.ctx && this.ctx.state === "suspended") this.ctx.resume().catch(()=>{});
    return this.ctx;
  },
  tone(freq, dur = .15, vol = .25, type = "sine"){
    if (!App.data.settings.sound) return;
    const ac = this._ac(); if (!ac) return;
    try{
      const o = ac.createOscillator(), g = ac.createGain();
      o.type = type; o.frequency.value = freq;
      g.gain.setValueAtTime(vol, ac.currentTime);
      g.gain.exponentialRampToValueAtTime(.001, ac.currentTime + dur);
      o.connect(g); g.connect(ac.destination);
      o.start(); o.stop(ac.currentTime + dur);
    }catch(e){}
  },
  tick(){ this.tone(660, .09, .18); },
  go(){ this.tone(880, .22, .3); setTimeout(()=>this.tone(1175,.22,.3),160); },
  restStart(){ this.tone(520, .18, .22); },
  finish(){ [784,988,1175].forEach((f,i)=>setTimeout(()=>this.tone(f,.28,.3),i*180)); },
  vibe(pattern){
    if (!App.data.settings.vibration) return;
    try { navigator.vibrate?.(pattern); } catch(e){}
  }
};