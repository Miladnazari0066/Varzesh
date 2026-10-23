/* ── Two-language dictionary. Persian is primary ───────────── */
const I18N = {
fa: {
  appName:"تمرین خانگی", home:"خانه", workouts:"تمرین‌ها", timer:"تایمر", progress:"پیشرفت",
  settings:"تنظیمات", startWorkout:"شروع تمرین", todayWorkout:"تمرین امروز", customTimer:"تایمر دلخواه",
  newRoutine:"تمرین جدید", streak:"روز پیوسته", totalMin:"دقیقه تمرین", sessions:"جلسه کامل",
  todayDone:"امروز", weekActivity:"فعالیت این هفته", routineBuilder:"ساخت تمرین", back:"بازگشت",
  name:"نام", description:"توضیح (اختیاری)", rounds:"دور", restRound:"استراحت بین دورها (ثانیه)",
  prepare:"آماده‌سازی اولیه (ثانیه)", skipLastRest:"استراحت بعد از آخرین حرکت نگیر",
  cooldownOn:"سرد کردن بدن در پایان (۱۲۰ ثانیه)", exercises:"حرکت‌ها", addFromLib:"افزودن از کتابخانه",
  addCustom:"حرکت دلخواه", save:"ذخیره", exerciseSec:"تمرین (ثانیه)", restSec:"استراحت (ثانیه)",
  cooldownSec:"سرد کردن (ثانیه، ۰ = خاموش)", startTimer:"شروع تایمر", calendar:"تقویم تمرین",
  history:"تاریخچه", clearHistory:"پاک کردن تاریخچه", language:"زبان", theme:"تم", dark:"تیره",
  light:"روشن", sound:"صدای اعلام", vibration:"لرزش (در صورت پشتیبانی)", autoNext:"رفتن خودکار به بخش بعد",
  keepAwake:"روشن نگه داشتن صفحه", confirmStop:"تأیید قبل از پایان تمرین", tick:"شمارش ۳-۲-۱ قبل هر حرکت",
  defaultWork:"مدت پیش‌فرض حرکت (ثانیه)", defaultRest:"استراحت پیش‌فرض (ثانیه)", defaultRounds:"تعداد دور پیش‌فرض",
  export:"خروجی گرفتن داده‌ها", import:"بازگردانی داده‌ها", resetAll:"بازنشانی کامل برنامه",
  bgNote:"توجه: هشدار صوتی و لرزش بستگی به مرورگر و دستگاه دارد؛ وقتی صفحه در پس‌زمینه باشد، تایمر ممکن است دیرتر اجرا شود.",
  exercise:"تمرین", rest:"استراحت", preparePhase:"آماده‌سازی", cooldown:"سرد کردن بدن", round:"دور",
  of:"از", next:"بعدی:", ready:"آماده‌سازی", done:"تمرین تمام شد!", completed:"تمرین کامل شد",
  cancelled:"تمرین نیمه‌کاره", duration:"مدت تمرین", saveSession:"ذخیره نتیجه", discard:"بدون ذخیره",
  edit:"ویرایش", duplicate:"کپی", del:"حذف", start:"شروع", minutes:"دقیقه", sec:"ثانیه",
  nameEn:"نام انگلیسی (اختیاری)", instructions:"راهنمای اجرا", muscles:"عضلات هدف", difficulty:"سطح",
  easy:"آسان", medium:"متوسط", hard:"سخت", countdown:"تایمر شمارشی", manual:"دستی (خودم تمام می‌کنم)",
  reps:"تکرار (اختیاری)", repMode:"روش شمارش", restAfter:"استراحت بعد (ثانیه)", safety:"نکته ایمنی",
  editExercise:"ویرایش حرکت", newExercise:"حرکت جدید", estTotal:"زمان کل تقریبی:",
  confirmDelete:"این تمرین حذف شود؟", confirmReset:"همه داده‌ها (تمرین‌ها، تاریخچه، تنظیمات) پاک شود؟ این کار برگشت‌پذیر نیست.",
  confirmStopMsg:"تمرین نیمه‌کاره رها شود؟ نتیجه به‌عنوان ناتمام ثبت می‌شود یا می‌توانی از بدان صرف‌نظر کنی.",
  confirm:"تأیید", cancel:"انصراف", yes:"بله", no:"نه", noHistory:"هنوز تمرینی ثبت نشده. اولین تمرینت را انجام بده!",
  emptyRoutines:"هنوز تمرینی نساختی.", imported:"داده‌ها با موفقیت بازگردانی شد.", importErr:"فایل معتبر نیست.",
  mergeOrReplace:"داده‌ها جایگزین شوند یا به داده‌های فعلی اضافه شوند؟", replace:"جایگزینی", merge:"افزودن",
  startDay:"صبح بخیر", startDayEve:"عصر بخیر", startNight:"شب بخیر",
  tip1:"تنها ۱۰ تا ۱۵ دقیقه در روز کافی است؛ مهم‌تر از شدت، ادامه دادن است. اگر روزی خسته بودی، همین تمرین کوتاه را انجام بده.",
  darkAria:"تغییر تم", daysShort:["ش","ی","د","س","چ","پ","ج"], minutesShort:"د",
  bodyRest:"نفس عمیق بکش، آب بخور.", goodWork:"آفرین! همین‌طور ادامه بده."
},
en: {
  appName:"Home Fit", home:"Home", workouts:"Workouts", timer:"Timer", progress:"Progress",
  settings:"Settings", startWorkout:"Start workout", todayWorkout:"Today's workout", customTimer:"Custom timer",
  newRoutine:"New routine", streak:"Day streak", totalMin:"Total minutes", sessions:"Sessions",
  todayDone:"Today", weekActivity:"This week", routineBuilder:"Routine builder", back:"Back",
  name:"Name", description:"Description (optional)", rounds:"Rounds", restRound:"Rest between rounds (s)",
  prepare:"Warm-up countdown (s)", skipLastRest:"Skip rest after final exercise",
  cooldownOn:"Cooldown at end (120s)", exercises:"Exercises", addFromLib:"Add from library",
  addCustom:"Custom exercise", save:"Save", exerciseSec:"Exercise (s)", restSec:"Rest (s)",
  cooldownSec:"Cooldown (s, 0 = off)", startTimer:"Start timer", calendar:"Calendar",
  history:"History", clearHistory:"Clear history", language:"Language", theme:"Theme", dark:"Dark",
  light:"Light", sound:"Sound cues", vibration:"Vibration (if supported)", autoNext:"Auto-advance intervals",
  keepAwake:"Keep screen awake", confirmStop:"Confirm before stopping", tick:"3-2-1 tick before each exercise",
  defaultWork:"Default exercise length (s)", defaultRest:"Default rest (s)", defaultRounds:"Default rounds",
  export:"Export data", import:"Import data", resetAll:"Reset all data",
  bgNote:"Note: sound and vibration depend on your device and browser; timers may lag when the tab is in the background.",
  exercise:"Exercise", rest:"Rest", preparePhase:"Get ready", cooldown:"Cooldown", round:"Round",
  of:"of", next:"Next:", ready:"Get ready", done:"Workout complete!", completed:"Completed",
  cancelled:"Partially done", duration:"Duration", saveSession:"Save result", discard:"Discard",
  edit:"Edit", duplicate:"Duplicate", del:"Delete", start:"Start", minutes:"min", sec:"s",
  nameEn:"English name (optional)", instructions:"Instructions", muscles:"Target muscles", difficulty:"Level",
  easy:"Easy", medium:"Medium", hard:"Hard", countdown:"Countdown timer", manual:"Manual (I finish it)",
  reps:"Reps (optional)", repMode:"Counting method", restAfter:"Rest after (s)", safety:"Safety note",
  editExercise:"Edit exercise", newExercise:"New exercise", estTotal:"Estimated total:",
  confirmDelete:"Delete this routine?", confirmReset:"Delete all data (routines, history, settings)? This cannot be undone.",
  confirmStopMsg:"Abandon the workout? It will be logged as incomplete, or you can discard it.",
  confirm:"Confirm", cancel:"Cancel", yes:"Yes", no:"No", noHistory:"No sessions yet — do your first one!",
  emptyRoutines:"No routines yet.", imported:"Data imported successfully.", importErr:"Invalid file.",
  mergeOrReplace:"Replace existing data or merge with it?", replace:"Replace", merge:"Merge",
  startDay:"Good morning", startDayEve:"Good evening", startNight:"Good evening",
  tip1:"10–15 minutes a day is enough. Consistency beats intensity — on tired days, just do the short version.",
  darkAria:"Toggle theme", daysShort:["S","M","T","W","T","F","S"], minutesShort:"m",
  bodyRest:"Breathe deep, take some water.", goodWork:"Nice work — keep it up."
}
};
function t(key){ const L = I18N[App?.lang] || I18N.fa; return L[key] ?? I18N.fa[key] ?? key; }
function fa(n){ // Persian numerals for display when language is fa
  if (App?.lang !== "fa") return String(n);
  return String(n).replace(/\d/g, d => "۰۱۲۳۴۵۶۷۸۹"[d]);
}
function mmss(sec){
  const m = Math.floor(Math.max(0,sec)/60), s = Math.max(0,sec)%60;
  return fa(String(m).padStart(2,"0")) + ":" + fa(String(s).padStart(2,"0"));
}