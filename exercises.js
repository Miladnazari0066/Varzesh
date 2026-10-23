/* ── Built-in exercise library (add-from-library) ──────────── */
function libExercises(){
  return [
    {fa:"راه رفتن درجا", en:"March in place", how:"زانوها را کمی بالا ببر و دست‌ها را هم‌راه حرکت بده.", muscles:"قلب و گردش خون", diff:1, duration:60, mode:"time"},
    {fa:"چرخش شانه", en:"Shoulder rolls", how:"شانه‌ها را آرام به بالا و عقب بچرخان.", muscles:"شانه و گردن", diff:1, duration:30, mode:"time"},
    {fa:"اسکات با صندلی", en:"Chair squats", how:"از حالت ایستاده، باسن را به سمت صندلی پایین ببر و بلند شو.", muscles:"ران و باسن", diff:1, duration:30, reps:"۸", mode:"time", safe:"زانوها هم‌جهت پنجه پا باشند."},
    {fa:"شنا روی دیوار", en:"Wall push-ups", how:"کف دست‌ها روی دیوار، آرنج‌ها را خم و باز کن.", muscles:"سینه و بازو", diff:1, duration:30, reps:"۸", mode:"time"},
    {fa:"شنا زانو", en:"Knee push-ups", how:"با زانوهای روی زمین، سینه را تا نزدیک زمین پایین ببر.", muscles:"سینه و بازو", diff:2, duration:30, reps:"۶", mode:"time", safe:"کمر را صاف نگه دار."},
    {fa:"پلانک از زانو", en:"Knee plank", how:"ساعد روی زمین، بدن صاف از سر تا زانو.", muscles:"مرکزی بدن", diff:2, duration:20, mode:"time", safe:"اگر کمر درد گرفت، متوقف کن."},
    {fa:"حرکت دست و پای مخالف", en:"Bird dog", how:"چهار دست‌وپا؛ دست و پای مخالف را هم‌زمان صاف کن.", muscles:"مرکزی بدن و کمر", diff:1, duration:30, mode:"time"},
    {fa:"پل باسن", en:"Glute bridge", how:"به پشت بخواب، زانوها خم، باسن را بالا ببر و پایین بیاور.", muscles:"باسن و کمر", diff:1, duration:30, reps:"۱۰", mode:"time"},
    {fa:"بالا آمدن روی پنجه", en:"Calf raises", how:"روی پنجه بالا برو و آرام پایین بیا.", muscles:"ساق پا", diff:1, duration:30, reps:"۱۰", mode:"time"},
    {fa:"لانژ ثابت", en:"Static lunge", how:"یک پا جلو، زانوی عقب به سمت زمین پایین بیاید.", muscles:"ران و باسن", diff:2, duration:30, mode:"time", safe:"برای تعادل از دیوار کمک بگیر."},
    {fa:"کرانچ شکم", en:"Crunches", how:"به پشت بخواب، شانه‌ها را کمی از زمین بلند کن.", muscles:"شکم", diff:1, duration:30, reps:"۱۰", mode:"time", safe:"گردن را با دست نکش."},
    {fa:"کش پهلو ایستاده", en:"Standing side stretch", how:"یک دست بالا، به پهلوی مخالف خم شو.", muscles:"پهلو", diff:1, duration:30, mode:"time"},
    {fa:"کش پشت پا نشسته", en:"Seated hamstring stretch", how:"پاها صاد، به سمت پنجه‌ها خم شو.", muscles:"پشت پا", diff:1, duration:60, mode:"time", safe:"تا جایی که درد نباشد."},
    {fa:"سرد کردن بدن", en:"Cooldown", how:"راه رفتن آرام و کشش‌های سبک.", muscles:"کل بدن", diff:1, duration:120, mode:"time"}
  ];
}
function findLib(faName){ return libExercises().find(e=>e.fa===faName); }