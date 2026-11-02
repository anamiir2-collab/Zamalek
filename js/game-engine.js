/* ============================================================
   ZAMALEK LEGENDS – أسطورة الزمالك
   game-engine.js : محرك اللعبة
   ------------------------------------------------------------
   محرك مستقل تمامًا عن بيانات المراحل: يستقبل الأسئلة من
   ملفات المراحل عبر sections-manager ويعرضها ويحسب النتائج.

   أنواع الأسئلة المدعومة (13):
   multiple, truefalse, complete, year, whoami, guessplayer,
   guesstrophy, image, imagepick, logo, speed, order,
   pickinfo, match + شارة decisive (نقاط مضاعفة) وحقل hint.
   ============================================================ */

import { questionPoints, starsFromRatio, isPassed } from './scoring.js';
import { player } from './player.js';
import { loadStage, nextStageInSection, sectionOfStage, getSection, nextUnfinishedSection } from './sections-manager.js';
import { navigate } from './router.js';
import { say, drawCharacter, speechBubble } from './characters.js';

/* ============================================================
   رسوم توضيحية أصلية للأسئلة المصورة (SVG مولّد برمجيًا —
   لا صور محمية بحقوق ملكية)
   ============================================================ */
const MEDIA = {
  emblem: `<img src="./assets/icons/emblem.png" alt="درع اللعبة">`,
  kit_white: kitSVG('#ffffff', '#d32f2f', 'القميص الأبيض'),
  kit_red: kitSVG('#c62828', '#8e0000', 'القميص الأحمر'),
  kit_green: kitSVG('#2e7d32', '#1b5e20', 'القميص الأخضر'),
  kit_blue: kitSVG('#1565c0', '#0d47a1', 'القميص الأزرق'),
  ball: iconSVG(`<circle cx="50" cy="50" r="34" fill="#ffffff" stroke="#23262b" stroke-width="5"/>
    <path d="M50 32 l12 9 -5 14 h-14 l-5 -14 Z" fill="#23262b"/>
    <path d="M50 16 v10 M35 21 l6 9 M65 21 l-6 9" stroke="#23262b" stroke-width="4" stroke-linecap="round"/>`, 'كرة قدم'),
  castle: iconSVG(`<rect x="18" y="34" width="64" height="52" rx="4" fill="#ffffff" stroke="#23262b" stroke-width="5"/>
    <path d="M14 34 h72 M22 34 v-10 h8 v10 M46 34 v-10 h8 v10 M70 34 v-10 h8 v10" fill="none" stroke="#23262b" stroke-width="5" stroke-linejoin="round"/>
    <rect x="40" y="60" width="20" height="26" rx="3" fill="#d32f2f"/>
    <path d="M50 18 l0 -12 l14 4 -14 4" fill="#d32f2f" stroke="#23262b" stroke-width="3"/>`, 'قلعة بيضاء'),
  shield: iconSVG(`<path d="M50 12 l34 10 v22 c0 20 -14 32 -34 40 c-20 -8 -34 -20 -34 -40 v-22 Z" fill="#ffffff" stroke="#23262b" stroke-width="5" stroke-linejoin="round"/>
    <path d="M50 22 v50 M28 40 h44" stroke="#d32f2f" stroke-width="6" stroke-linecap="round"/>`, 'درع'),
  trophy: iconSVG(`<path d="M32 20 h36 v14 c0 14 -8 22 -18 22 s-18 -8 -18 -22 Z" fill="#f4c542" stroke="#23262b" stroke-width="5"/>
    <path d="M32 24 h-12 c0 12 6 18 14 19 M68 24 h12 c0 12 -6 18 -14 19" fill="none" stroke="#23262b" stroke-width="5"/>
    <rect x="44" y="56" width="12" height="12" fill="#f4c542" stroke="#23262b" stroke-width="4"/>
    <rect x="32" y="68" width="36" height="10" rx="3" fill="#d32f2f" stroke="#23262b" stroke-width="4"/>`, 'كأس'),
  star: iconSVG(`<path d="M50 14 l10 22 24 3 -18 17 5 24 -21 -12 -21 12 5 -24 -18 -17 24 -3 Z" fill="#ffd54f" stroke="#23262b" stroke-width="5" stroke-linejoin="round"/>`, 'نجمة'),
  whistle: iconSVG(`<circle cx="38" cy="56" r="20" fill="#f4c542" stroke="#23262b" stroke-width="5"/>
    <circle cx="38" cy="56" r="7" fill="#ffffff" stroke="#23262b" stroke-width="3.5"/>
    <path d="M56 48 h22 l-6 16 h-14" fill="#f4c542" stroke="#23262b" stroke-width="5" stroke-linejoin="round"/>
    <path d="M70 34 q10 -8 20 0 M72 26 q12 -10 24 0" fill="none" stroke="#23262b" stroke-width="4" stroke-linecap="round"/>`, 'صافرة حكم'),
  goal: iconSVG(`<path d="M14 76 V30 h72 v46" fill="none" stroke="#23262b" stroke-width="6" stroke-linecap="round"/>
    <path d="M14 76 h72 M26 30 v46 M40 30 v46 M54 30 v46 M68 30 v46 M14 44 h72 M14 60 h72" stroke="#9aa3b2" stroke-width="3"/>
    <circle cx="42" cy="68" r="8" fill="#ffffff" stroke="#23262b" stroke-width="3.5"/>`, 'مرمى'),
  glove: iconSVG(`<path d="M34 78 V38 c0 -6 4 -10 9 -10 s9 4 9 10 V30 c0 -6 4 -10 9 -10 s9 4 9 10 v8 c0 -6 4 -10 9 -10 s9 4 9 10 v26 c0 14 -11 24 -26 24 h-9 c-11 0 -19 -8 -19 -20 Z" fill="#2e7d32" stroke="#23262b" stroke-width="5" stroke-linejoin="round"/>
    <path d="M40 40 q10 6 20 0" fill="none" stroke="#ffffff" stroke-width="4" stroke-linecap="round"/>`, 'قفاز حارس'),
  scarf: iconSVG(`<path d="M30 20 h40 l-4 30 h-32 Z" fill="#ffffff" stroke="#23262b" stroke-width="5"/>
    <path d="M30 34 h40 M32 26 h36 M33 42 h34" stroke="#d32f2f" stroke-width="6"/>
    <path d="M38 50 l-4 34 h12 l3 -34 M60 50 l3 34 h12 l-5 -34" fill="#ffffff" stroke="#23262b" stroke-width="4" stroke-linejoin="round"/>
    <path d="M40 58 h8 M42 68 h8 M62 58 h8 M64 68 h8" stroke="#d32f2f" stroke-width="4"/>`, 'وشاح المشجعين'),
  medal: iconSVG(`<path d="M32 16 l12 18 M68 16 l-12 18" stroke="#d32f2f" stroke-width="7" stroke-linecap="round"/>
    <circle cx="50" cy="56" r="24" fill="#f4c542" stroke="#23262b" stroke-width="5"/>
    <circle cx="50" cy="56" r="14" fill="none" stroke="#d32f2f" stroke-width="4"/>
    <path d="M50 48 l3 6 7 1 -5 5 1 7 -6 -3 -6 3 1 -7 -5 -5 7 -1 Z" fill="#23262b"/>`, 'ميدالية'),
  heart: iconSVG(`<path d="M50 78 C28 62 16 50 16 36 c0 -11 8 -18 17 -18 c8 0 13 4 17 10 c4 -6 9 -10 17 -10 c9 0 17 7 17 18 c0 14 -12 26 -34 42 Z" fill="#d32f2f" stroke="#23262b" stroke-width="5" stroke-linejoin="round"/>
    <path d="M28 32 q4 -6 10 -5" stroke="#ffffff" stroke-width="4" fill="none" stroke-linecap="round"/>`, 'قلب'),
  basket: iconSVG(`<circle cx="50" cy="50" r="30" fill="#f4a742" stroke="#23262b" stroke-width="5"/>
    <path d="M20 50 h60 M50 20 v60 M28 28 q22 14 44 0 M28 72 q22 -14 44 0" fill="none" stroke="#23262b" stroke-width="3.5"/>`, 'كرة سلة'),
  handball: iconSVG(`<circle cx="60" cy="42" r="18" fill="#4db6ac" stroke="#23262b" stroke-width="5"/>
    <path d="M28 80 c0 -18 10 -26 22 -26 c8 0 12 4 12 10 c0 10 -10 12 -18 14 Z" fill="#ffe0c2" stroke="#23262b" stroke-width="5" stroke-linejoin="round"/>
    <path d="M40 62 l14 -8" stroke="#23262b" stroke-width="4" stroke-linecap="round"/>`, 'كرة يد'),
  volley: iconSVG(`<circle cx="50" cy="50" r="30" fill="#ffffff" stroke="#23262b" stroke-width="5"/>
    <path d="M26 32 q24 10 30 36 M50 20 q-4 30 24 44 M78 42 q-28 -4 -52 22" fill="none" stroke="#26a69a" stroke-width="4.5"/>`, 'كرة طائرة'),
  flag: iconSVG(`<path d="M30 84 V16" stroke="#23262b" stroke-width="6" stroke-linecap="round"/>
    <path d="M30 20 h38 l-8 12 8 12 h-38 Z" fill="#ffffff" stroke="#23262b" stroke-width="4.5" stroke-linejoin="round"/>
    <path d="M34 34 h30" stroke="#d32f2f" stroke-width="6"/>`, 'راية بيضاء وحمراء')
};

/** أسماء أسماء الرسوم (للاستخدام في imagepick وأدوات الوصول) */
export const MEDIA_LABELS = {
  emblem: 'درع اللعبة', kit_white: 'قميص أبيض', kit_red: 'قميص أحمر',
  kit_green: 'قميص أخضر', kit_blue: 'قميص أزرق', ball: 'كرة قدم',
  castle: 'قلعة', shield: 'درع', trophy: 'كأس', star: 'نجمة',
  whistle: 'صافرة', goal: 'مرمى', glove: 'قفاز حارس', scarf: 'وشاح',
  medal: 'ميدالية', heart: 'قلب', basket: 'كرة سلة', handball: 'كرة يد',
  volley: 'كرة طائرة', flag: 'راية'
};

function kitSVG(bodyColor, trimColor, label) {
  return `
  <svg viewBox="0 0 120 130" role="img" aria-label="${label}">
    <path d="M38 14 L60 24 L82 14 L112 30 L98 52 L86 44 L86 118 L34 118 L34 44 L22 52 L8 30 Z"
          fill="${bodyColor}" stroke="#1a1a1a" stroke-width="4" stroke-linejoin="round"/>
    <path d="M52 12 h16 l-3 8 h-10 z" fill="${trimColor}" stroke="#1a1a1a" stroke-width="3"/>
    <path d="M8 30 l14 22 M112 30 l-14 22" stroke="${trimColor}" stroke-width="5"/>
    <path d="M34 104 h52" stroke="${trimColor}" stroke-width="6"/>
  </svg>`;
}

function iconSVG(inner, label) {
  return `<svg viewBox="0 0 100 100" role="img" aria-label="${label}">${inner}</svg>`;
}

/** أسماء أنواع الأسئلة للعرض */
const TYPE_LABELS = {
  multiple: 'اختر الإجابة الصحيحة',
  truefalse: 'صح أم خطأ؟',
  complete: 'أكمل الجملة الجميلة',
  order: 'رتب الأحداث حسب التاريخ',
  whoami: 'من أنا؟',
  year: 'في أي عام حدث ذلك؟',
  guessplayer: 'خمّن اللاعب',
  guesstrophy: 'خمّن البطولة من وصفها',
  image: 'سؤال بالصورة',
  imagepick: 'اختر الصورة الصحيحة',
  logo: 'خمّن الرمز',
  pickinfo: 'اكتشف المعلومة الصحيحة',
  match: 'صِل المعلومة بإجابتها',
  speed: '⚡ تحدي السرعة'
};

const DEFAULT_TIME = 30;
const SPEED_TIME = 12;
const ORDER_TIME = 45;
const MATCH_TIME = 60;

let shuffleSeed = Date.now();
function rng() {
  shuffleSeed = (shuffleSeed * 9301 + 49297) % 233280;
  return shuffleSeed / 233280;
}

function shuffled(arr) {
  const a = [...arr];
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(rng() * (i + 1));
    [a[i], a[j]] = [a[j], a[i]];
  }
  return a;
}

function escapeHtml(s) {
  return String(s).replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;');
}

class GameEngine {
  constructor() {
    this.stage = null;
    this.section = null;
    this.qIndex = 0;
    this.sessionScore = 0;
    this.correctCount = 0;
    this.results = [];
    this.timerId = null;
    this.timeLeft = 0;
    this.answered = false;
    this.hintUsed = false;
    this.hooks = {}; // { onCorrect, onWrong, onFinish, onTick, onBox }
  }

  /* ---------------- بدء مرحلة ---------------- */
  async start(stageId, hooks = {}) {
    this.hooks = hooks;
    const area = document.getElementById('game-area');
    area.innerHTML = `<div class="spinner" aria-label="جارٍ التحميل"></div>`;
    let stage;
    try {
      stage = await loadStage(stageId);
    } catch (err) {
      const sec = sectionOfStage(stageId);
      area.innerHTML = `
        <div class="load-error">
          <div class="char-avatar small">${drawCharacter('zaki')}</div>
          ⚠️ ${err.message}<br>
          <button class="btn btn-light mt-2" id="err-back-btn">العودة لمراحل القسم</button>
        </div>`;
      document.getElementById('err-back-btn').addEventListener('click',
        () => navigate(`#/section?id=${sec ? sec.id : 'history'}`));
      return;
    }
    this.stage = stage;
    this.section = sectionOfStage(stage.id);
    this.qIndex = 0;
    this.sessionScore = 0;
    this.correctCount = 0;
    this.results = [];
    this.updateHud();
    player.setLastStage(stage.id);
    this.renderStageIntro();
  }

  get currentQuestion() { return this.stage.questions[this.qIndex]; }

  get questionTime() {
    const q = this.currentQuestion;
    if (q.type === 'speed') return q.time || SPEED_TIME;
    if (q.type === 'order') return ORDER_TIME;
    if (q.type === 'match') return MATCH_TIME;
    return q.time || DEFAULT_TIME;
  }

  get characterId() {
    return (this.section && this.section.character) || 'zaki';
  }

  /* ---------------- واجهة HUD ---------------- */
  updateHud() {
    document.getElementById('game-stage-title').textContent =
      `${this.section ? this.section.emoji + ' ' : ''}${this.stage.title}`;
    document.getElementById('game-q-progress').textContent =
      `السؤال ${this.qIndex + 1} من ${this.stage.questions.length}`;
    document.getElementById('game-session-score').textContent = this.sessionScore;
    document.getElementById('q-bar').style.width =
      `${(this.qIndex / this.stage.questions.length) * 100}%`;
  }

  /* ---------------- المؤقت ---------------- */
  startTimer(onTimeout) {
    this.stopTimer();
    const total = this.questionTime;
    this.timeLeft = total;
    const timerEl = document.getElementById('q-timer');
    const bar = timerEl ? timerEl.querySelector('span') : null;
    const num = timerEl ? timerEl.querySelector('.t-num') : null;
    const paint = () => {
      if (!bar) return;
      const ratio = this.timeLeft / total;
      bar.style.width = `${ratio * 100}%`;
      timerEl.classList.toggle('danger', ratio <= 0.33);
      if (num) num.textContent = `⏱️ ${this.timeLeft} ثانية`;
    };
    paint();
    this.timerId = setInterval(() => {
      this.timeLeft -= 1;
      if (this.hooks.onTick && this.timeLeft <= 5 && this.timeLeft > 0) this.hooks.onTick();
      if (this.timeLeft <= 0) {
        this.stopTimer();
        paint();
        onTimeout();
      } else {
        paint();
      }
    }, 1000);
  }

  stopTimer() {
    if (this.timerId) { clearInterval(this.timerId); this.timerId = null; }
  }

  /* ---------------- مقدمة المرحلة (شاشة ترحيب قصيرة) ---------------- */
  renderStageIntro() {
    const area = document.getElementById('game-area');
    const charId = this.characterId;
    area.innerHTML = `
      <div class="q-card stage-intro">
        <div class="si-emoji">${this.section ? this.section.emoji : '🎉'}</div>
        <h2 class="si-title">${this.stage.title}</h2>
        <p class="si-sub">${this.stage.description || (this.stage.subtitle || '')}</p>
        ${speechBubble(charId, say('greet', { characterId: charId }), 'wide')}
        <div class="si-info">
          <span class="badge">🎯 ${this.stage.questions.length} أسئلة</span>
          <span class="badge">⭐ حتى 3 نجوم</span>
          <span class="badge">🎁 صندوق مفاجآت بانتظارك</span>
        </div>
        <button class="btn btn-primary btn-big" id="intro-start-btn">يلا نبدأ! 🚀</button>
      </div>`;
    document.getElementById('intro-start-btn').addEventListener('click', () => this.renderQuestion());
  }

  /* ---------------- عرض السؤال ---------------- */
  renderQuestion() {
    this.answered = false;
    this.hintUsed = false;
    this.updateHud();
    const q = this.currentQuestion;
    const area = document.getElementById('game-area');
    const typeLabel = TYPE_LABELS[q.type] || TYPE_LABELS.multiple;
    const isDecisive = Boolean(q.decisive);

    /* ----- جسم السؤال بحسب نوعه ----- */
    let body = '';

    if (q.type === 'order') {
      this.currentBankItems = shuffled(q.items);
      body = `
        <div class="order-slots" id="order-slots">
          ${q.items.map((_, i) => `
            <div class="order-slot empty" data-slot="${i}">
              <span class="idx">${i + 1}</span>
              <span>اختر الحدث المناسب لهذا الموقع</span>
            </div>`).join('')}
        </div>
        <div class="order-bank" id="order-bank">
          ${this.currentBankItems.map((item, i) =>
            `<button class="order-chip" data-chip="${i}">${item}</button>`).join('')}
        </div>`;

    } else if (q.type === 'match') {
      // أعمدة: معلومات (يمين ثابتة) وإجابات (يسار مخلوطة)
      const answersShuffled = shuffled(q.pairs.map(p => p[1]));
      this.matchState = { selected: null, matched: 0, userPairs: {} };
      body = `
        <div class="match-board">
          <div class="match-col">
            <div class="match-col-title">📌 المعلومة</div>
            ${q.pairs.map((p, i) => `
              <button class="match-item info" data-info="${i}">${p[0]}</button>`).join('')}
          </div>
          <div class="match-col">
            <div class="match-col-title">💡 الإجابة</div>
            ${answersShuffled.map(ans => `
              <button class="match-item ans" data-ans="${escapeHtml(ans)}">${ans}</button>`).join('')}
          </div>
        </div>`;

    } else if (q.type === 'imagepick') {
      body = `
        <div class="imgpick-grid">
          ${q.images.map(key => `
            <button class="imgpick-btn" data-opt="${key}" aria-label="${MEDIA_LABELS[key] || key}">
              <div class="img-box small">${MEDIA[key] || key}</div>
            </button>`).join('')}
        </div>`;

    } else {
      const options = q.type === 'truefalse'
        ? ['صح', 'خطأ']
        : shuffled(q.options);
      const cols = q.type === 'truefalse' ? 'two' : '';
      const statements = q.type === 'pickinfo' ? ' statements' : '';
      body = `
        <div class="options${cols}${statements}" role="group" aria-label="الاختيارات">
          ${options.map((opt, i) => `
            <button class="opt" data-opt="${escapeHtml(opt)}">
              <span class="key">${['أ', 'ب', 'ج', 'د'][i] || i + 1}</span>
              <span>${opt}</span>
            </button>`).join('')}
        </div>`;
    }

    /* ----- الصورة الرئيسية (image أو logo) ----- */
    let media = '';
    if (q.type === 'image' && MEDIA[q.image]) {
      media = `<div class="q-media"><div class="img-box">${MEDIA[q.image]}</div></div>`;
    } else if (q.type === 'logo' && MEDIA[q.logo]) {
      media = `<div class="q-media big"><div class="img-box">${MEDIA[q.logo]}</div></div>`;
    }

    /* ----- التلميح ----- */
    const hintBtn = q.hint
      ? `<button class="hint-btn" id="hint-btn" aria-label="تلميح">💡 تلميح</button>
         <div id="hint-area"></div>`
      : '';

    area.innerHTML = `
      ${speechBubble(this.characterId, say('pre'), 'compact')}
      <div class="q-card">
        <span class="q-type-badge ${isDecisive ? 'decisive' : ''}">
          ${isDecisive ? '⚔️ سؤال الحسم — نقاط مضاعفة' : `🎯 ${typeLabel}`}
        </span>
        <div class="q-text">${q.question}</div>
        ${media}
        ${body}
        ${hintBtn}
        <div id="feedback-area"></div>
      </div>
      <div class="timer mt-2" id="q-timer"><span></span><div class="t-num"></div></div>`;

    // ربط الأحداث
    if (q.type === 'order') {
      this.initOrderUI(q, this.currentBankItems);
      this.startTimer(() => this.handleAnswer(null));
    } else if (q.type === 'match') {
      this.initMatchUI(q);
      this.startTimer(() => this.handleAnswer(null));
    } else {
      area.querySelectorAll('.opt, .imgpick-btn').forEach(btn => {
        btn.addEventListener('click', () => this.handleAnswer(btn.dataset.opt));
      });
      this.startTimer(() => this.handleAnswer(null));
    }

    // زر التلميح
    const hintEl = document.getElementById('hint-btn');
    if (hintEl) {
      hintEl.addEventListener('click', () => {
        if (this.hintUsed || this.answered) return;
        this.hintUsed = true;
        hintEl.disabled = true;
        const zone = document.getElementById('hint-area');
        zone.innerHTML = speechBubble('zizi', say('hint') + q.hint, 'compact hint');
        zone.querySelector('.char-bubble').classList.add('pop');
      });
    }
  }

  /* ---------------- واجهة الترتيب ---------------- */
  initOrderUI(q, bankItems) {
    const bank = document.getElementById('order-bank');
    const slots = document.getElementById('order-slots');
    const picked = [];
    bank.querySelectorAll('.order-chip').forEach(chip => {
      chip.addEventListener('click', () => {
        if (this.answered) return;
        const idx = Number(chip.dataset.chip);
        picked.push(bankItems[idx]);
        chip.disabled = true;
        const slot = slots.querySelector(`[data-slot="${picked.length - 1}"]`);
        slot.classList.remove('empty');
        slot.querySelector('span:last-child').textContent = bankItems[idx];
        if (picked.length === q.items.length) {
          this.handleAnswer(JSON.stringify(picked));
        }
      });
    });
  }

  /* ---------------- واجهة التوصيل (صِل المعلومة) ---------------- */
  initMatchUI(q) {
    const board = document.getElementById('game-area');
    board.querySelectorAll('.match-item.info').forEach(btn => {
      btn.addEventListener('click', () => {
        if (this.answered) return;
        board.querySelectorAll('.match-item.info').forEach(b => b.classList.remove('selected'));
        btn.classList.add('selected');
        this.matchState.selected = Number(btn.dataset.info);
      });
    });
    board.querySelectorAll('.match-item.ans').forEach(btn => {
      btn.addEventListener('click', () => {
        if (this.answered || this.matchState.selected === null) return;
        const infoIdx = this.matchState.selected;
        const ans = btn.dataset.ans;
        const correctAns = q.pairs[infoIdx][1];
        if (ans === correctAns) {
          // إقران صحيح: تثبيت بالأخضر
          const infoBtn = board.querySelector(`.match-item.info[data-info="${infoIdx}"]`);
          infoBtn.classList.remove('selected');
          infoBtn.classList.add('locked', 'ok');
          btn.classList.add('locked', 'ok');
          btn.disabled = true;
          this.matchState.matched += 1;
          this.matchState.userPairs[infoIdx] = ans;
          this.matchState.selected = null;
          if (this.matchState.matched === q.pairs.length) {
            this.handleAnswer('matched');
          }
        } else {
          // إقران خاطئ: وميض أحمر لطيف بلا خصم
          btn.classList.add('flash-wrong');
          setTimeout(() => btn.classList.remove('flash-wrong'), 500);
        }
      });
    });
  }

  /* ---------------- التحقق من الإجابة ---------------- */
  handleAnswer(userAnswer) {
    if (this.answered) return;
    this.answered = true;
    this.stopTimer();

    const q = this.currentQuestion;
    const area = document.getElementById('game-area');
    const total = this.questionTime;
    const remainingRatio = Math.max(0, this.timeLeft / total);
    const timedOut = userAnswer === null;

    // تحديد صحة الإجابة
    let ok = false;
    if (!timedOut) {
      if (q.type === 'order') {
        try { ok = JSON.stringify(JSON.parse(userAnswer)) === JSON.stringify(q.items); }
        catch { ok = false; }
      } else if (q.type === 'match') {
        ok = this.matchState.matched === q.pairs.length;
      } else {
        ok = userAnswer === String(q.answer);
      }
    }

    // النقاط
    const pts = questionPoints(ok, q.type, remainingRatio, Boolean(q.decisive));
    this.sessionScore += pts;
    if (ok) this.correctCount += 1;
    player.recordAnswer(ok, q.type === 'speed');
    document.getElementById('game-session-score').textContent = this.sessionScore;
    const scoreChip = document.getElementById('game-session-score');
    scoreChip.classList.remove('points-pulse'); void scoreChip.offsetWidth;
    scoreChip.classList.add('points-pulse');

    // نصوص الإجابات للمراجعة
    let correctText, userText;
    if (q.type === 'order') {
      correctText = q.items.join(' ← ');
      userText = timedOut ? 'انتهى الوقت / لم تُكمل الترتيب' : JSON.parse(userAnswer).join(' ← ');
    } else if (q.type === 'match') {
      correctText = q.pairs.map(p => `${p[0]} → ${p[1]}`).join(' • ');
      userText = ok ? 'تم التوصيل كاملًا' : 'لم يكتمل التوصيل';
    } else {
      correctText = String(q.answer);
      userText = timedOut ? 'انتهى الوقت / لم تُجب' : String(userAnswer);
    }

    this.results.push({ q: q.question, userText, correctText, ok, explanation: q.explanation });

    // تعطيل المدخلات وتلوينها
    area.querySelectorAll('.opt, .imgpick-btn, .order-chip, .match-item').forEach(el => { el.disabled = true; });
    if (q.type === 'order') {
      this.revealOrder(q);
    } else if (q.type === 'match') {
      // تظليل الإقرانات الصحيحة كاملة
      const board = area;
      q.pairs.forEach((p, i) => {
        const infoBtn = board.querySelector(`.match-item.info[data-info="${i}"]`);
        infoBtn.classList.add('locked', 'ok');
      });
    } else {
      area.querySelectorAll('.opt, .imgpick-btn').forEach(el => {
        if (el.dataset.opt === String(q.answer)) el.classList.add('correct');
        else if (el.dataset.opt === String(userAnswer)) el.classList.add('wrong');
        else el.classList.add('dim');
      });
    }

    // رسالة الشخصية + التفسير الممتع
    const lineKind = ok ? 'correct' : (timedOut ? 'timeout' : 'wrong');
    const isFav = player.isFavorite(q.question);
    const feedback = document.getElementById('feedback-area');
    const ptsTag = pts > 0 ? `+${pts} نقطة` : `${pts} نقطة`;
    feedback.innerHTML = `
      ${speechBubble(this.characterId, say(lineKind), 'compact pop')}
      <div class="explain ${ok ? 'ok' : 'no'}">
        <div class="explain-head">
          <b>${ok ? '✅ إجابة صحيحة!' : (timedOut ? '⏰ انتهى الوقت!' : '❌ إجابة مختلفة')}</b>
          <button class="fav-btn ${isFav ? 'on' : ''}" id="fav-btn"
                  aria-label="أضف إلى المفضلة" title="أضف المعلومة إلى المفضلة">
            ${isFav ? '❤️' : '🤍'}
          </button>
        </div>
        <div class="explain-fact">${say('fact')}${q.explanation}</div>
        <span class="pts-tag">⚡ ${ptsTag}</span>
      </div>
      <div class="next-btn-row">
        <button class="btn btn-primary btn-big" id="next-q-btn">
          ${this.qIndex + 1 < this.stage.questions.length ? 'السؤال التالي ←' : 'عرض النتيجة 🏁'}
        </button>
      </div>`;

    document.getElementById('next-q-btn').addEventListener('click', () => this.nextQuestion());
    document.getElementById('fav-btn').addEventListener('click', (e) => {
      const btn = e.currentTarget;
      if (btn.classList.contains('on')) return;
      const added = player.addFavorite({
        q: q.question, fact: q.explanation,
        stageId: this.stage.id, sectionId: this.section ? this.section.id : null
      });
      if (added) {
        btn.classList.add('on');
        btn.textContent = '❤️';
        this.hooks.onFav && this.hooks.onFav();
      }
    });

    // إشعارات الصوت والمؤثرات
    if (ok && this.hooks.onCorrect) this.hooks.onCorrect(q);
    if (!ok && this.hooks.onWrong) this.hooks.onWrong(q);
    if (!ok) area.querySelector('.q-card').classList.add('shake');
  }

  revealOrder(q) {
    const slots = document.getElementById('order-slots');
    q.items.forEach((item, i) => {
      const slot = slots.querySelector(`[data-slot="${i}"]`);
      slot.classList.remove('empty');
      slot.querySelector('span:last-child').textContent = item;
    });
  }

  nextQuestion() {
    this.qIndex += 1;
    if (this.qIndex < this.stage.questions.length) {
      this.renderQuestion();
    } else {
      this.finishStage();
    }
  }

  /* ---------------- نهاية المرحلة ---------------- */
  finishStage() {
    const total = this.stage.questions.length;
    const ratio = this.correctCount / total;
    const stars = starsFromRatio(ratio);
    const passed = isPassed(ratio);
    const perfect = passed && this.correctCount === total;

    let finalScore = this.sessionScore;
    if (passed) {
      finalScore += 20; // مكافأة إكمال المرحلة
      if (perfect) finalScore += 15; // مكافأة الكمال
    }
    const gained = finalScore - this.sessionScore;
    player.addPoints(finalScore);
    player.finishStage(this.stage.id, stars, finalScore, passed, perfect);

    this.renderResult({ passed, stars, finalScore, gained, ratio, total, perfect });
    if (this.hooks.onFinish) {
      this.hooks.onFinish({ passed, stars, perfect, stageId: this.stage.id });
    }
    // صندوق المفاجآت عند النجاح بنتيجة جيدة
    if (passed && stars >= 2 && this.hooks.onBox) {
      this.hooks.onBox({ stageId: this.stage.id, stars });
    }
  }

  renderResult({ passed, stars, finalScore, gained, ratio, total, perfect }) {
    const area = document.getElementById('game-area');
    const sec = this.section;

    // التنقل الذكي: المرحلة التالية داخل القسم أو القسم التالي غير المكتمل
    const nextId = nextStageInSection(this.stage.id);
    const nextUnlocked = nextId && player.isUnlocked(nextId);
    const nextSection = sec ? nextUnfinishedSection(player.data.completed, sec.id) : null;

    const starsHtml = [1, 2, 3].map(i =>
      `<span class="${i <= stars ? 'lit' : ''}">⭐</span>`).join('');
    const best = player.data.completed[this.stage.id];

    const lineState = perfect ? 'perfect' : (passed ? 'passed' : 'failed');

    area.innerHTML = `
      <div class="result-wrap">
        <div class="result-card">
          <div class="r-icon">${passed ? (perfect ? '💎' : '🏆') : '💪'}</div>
          <h2>${passed ? (perfect ? 'أداء أسطوري كامل!' : 'أحسنت! مرحلة مكتملة') : 'محاولة شجاعة!'}</h2>
          <p class="r-sub">${passed
            ? `أنهيت «${this.stage.title}» بنسبة ${Math.round(ratio * 100)}%`
            : `تحتاج 50% على الأقل لاجتياز «${this.stage.title}» — نسبتك ${Math.round(ratio * 100)}%`}</p>
          <div class="result-stars" aria-label="${stars} من 3 نجوم">${starsHtml}</div>
          ${speechBubble(this.characterId, say('complete', { state: lineState }), 'wide')}

          <div class="result-nums">
            <div class="rn"><b>${finalScore}</b><span>نقاط المرحلة</span></div>
            <div class="rn"><b>${this.correctCount}/${total}</b><span>إجابات صحيحة</span></div>
            <div class="rn"><b>${gained > 0 ? `+${gained}` : 0}</b><span>مكافأة الإنجاز</span></div>
            <div class="rn"><b>${best ? best.best : finalScore}</b><span>أفضل نتيجة</span></div>
          </div>

          <div class="result-actions">
            ${nextUnlocked ? `<button class="btn btn-primary btn-big" id="res-next">المرحلة التالية ←</button>` : ''}
            ${!nextUnlocked && nextSection ? `<button class="btn btn-primary btn-big" id="res-sec">🌍 إلى قسم ${nextSection.emoji} ${nextSection.title}</button>` : ''}
            <button class="btn btn-light" id="res-retry">🔁 إعادة المرحلة</button>
            <button class="btn btn-light" id="res-map">${sec ? `${sec.emoji} مراحل القسم` : '🗺️ الأقسام'}</button>
          </div>
        </div>

        <div class="review">
          <h3>📋 مراجعة الإجابات</h3>
          <div class="review-list">
            ${this.results.map(r => `
              <div class="review-item ${r.ok ? 'ok' : 'no'}">
                <div class="rq">${r.q}</div>
                <div class="ra ${r.ok ? 'ok' : 'no'}">
                  ${r.ok ? '✔️ إجابتك: ' + r.userText : '✖️ إجابتك: ' + r.userText + ' — الصحيح: ' + r.correctText}
                </div>
                <div class="re">💡 ${r.explanation}</div>
              </div>`).join('')}
          </div>
        </div>
      </div>`;

    const nextBtn = document.getElementById('res-next');
    if (nextBtn) nextBtn.addEventListener('click', () => navigate(`#/game?stage=${nextId}`));
    const secBtn = document.getElementById('res-sec');
    if (secBtn) secBtn.addEventListener('click', () => navigate(`#/section?id=${nextSection.id}`));
    document.getElementById('res-retry').addEventListener('click', () => this.start(this.stage.id, this.hooks));
    document.getElementById('res-map').addEventListener('click', () =>
      navigate(sec ? `#/section?id=${sec.id}` : '#/home'));
  }
}

export const gameEngine = new GameEngine();
