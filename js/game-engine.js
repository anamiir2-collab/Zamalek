/* ============================================================
   ZAMALEK LEGENDS – أسطورة الزمالك
   game-engine.js : محرك اللعبة
   ------------------------------------------------------------
   محرك مستقل تمامًا عن بيانات المراحل: يستقبل الأسئلة من
   ملفات المراحل عبر stages-manager ويعرضها ويحسب النتائج.
   ============================================================ */

import { questionPoints, starsFromRatio, isPassed, DIFFICULTY_LABELS } from './scoring.js';
import { player } from './player.js';
import { loadStage } from './stages-manager.js';
import { navigate } from './router.js';

/** رسوم توضيحية أصلية للأسئلة المصورة (SVG مولّد برمجيًا — لا صور محمية بحقوق) */
const MEDIA = {
  emblem: `<img src="./assets/icons/emblem.svg" alt="درع اللعبة">`,
  kit_white: kitSVG('#ffffff', '#d32f2f', 'القميص الأبيض'),
  kit_red: kitSVG('#c62828', '#8e0000', 'القميص الأحمر'),
  kit_green: kitSVG('#2e7d32', '#1b5e20', 'القميص الأخضر'),
  kit_blue: kitSVG('#1565c0', '#0d47a1', 'القميص الأزرق')
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

/** أسماء أنواع الأسئلة للعرض */
const TYPE_LABELS = {
  multiple: 'اختر الإجابة الصحيحة',
  truefalse: 'صح أم خطأ؟',
  complete: 'أكمل المعلومة التاريخية',
  order: 'رتب الأحداث حسب التاريخ',
  whoami: 'من صاحب الإنجاز؟',
  year: 'في أي عام حدث ذلك؟',
  guessplayer: 'خمّن اللاعب',
  guesstrophy: 'خمّن البطولة من وصفها',
  image: 'سؤال بالصورة',
  speed: '⚡ تحدي السرعة'
};

const DEFAULT_TIME = 30;
const SPEED_TIME = 12;
const ORDER_TIME = 45;

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

class GameEngine {
  constructor() {
    this.stage = null;
    this.qIndex = 0;
    this.sessionScore = 0;
    this.correctCount = 0;
    this.results = [];
    this.timerId = null;
    this.timeLeft = 0;
    this.answered = false;
    this.hooks = {}; // { onCorrect, onWrong, onFinish, onTick }
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
      area.innerHTML = `
        <div class="load-error">
          ⚠️ ${err.message}<br>
          <button class="btn btn-light mt-2" id="err-back-btn">العودة لخريطة المراحل</button>
        </div>`;
      document.getElementById('err-back-btn').addEventListener('click', () => navigate('#/stages'));
      return;
    }
    this.stage = stage;
    this.qIndex = 0;
    this.sessionScore = 0;
    this.correctCount = 0;
    this.results = [];
    this.updateHud();
    player.setLastStage(stage.id);
    this.renderQuestion();
  }

  get currentQuestion() { return this.stage.questions[this.qIndex]; }

  get questionTime() {
    const q = this.currentQuestion;
    if (q.type === 'speed') return q.time || SPEED_TIME;
    if (q.type === 'order') return ORDER_TIME;
    return q.time || DEFAULT_TIME;
  }

  /* ---------------- واجهة HUD ---------------- */
  updateHud() {
    document.getElementById('game-stage-title').textContent =
      `المرحلة ${this.stage.id}: ${this.stage.title}`;
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

  /* ---------------- عرض السؤال ---------------- */
  renderQuestion() {
    this.answered = false;
    this.updateHud();
    const q = this.currentQuestion;
    const area = document.getElementById('game-area');
    const typeLabel = TYPE_LABELS[q.type] || TYPE_LABELS.multiple;
    const isDecisive = Boolean(q.decisive);

    const media = q.type === 'image' && MEDIA[q.image]
      ? `<div class="q-media"><div class="img-box">${MEDIA[q.image]}</div></div>` : '';

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
    } else {
      const options = q.type === 'truefalse'
        ? ['صح', 'خطأ']
        : shuffled(q.options);
      const cols = q.type === 'truefalse' ? 'two' : '';
      body = `
        <div class="options ${cols}" role="group" aria-label="الاختيارات">
          ${options.map((opt, i) => `
            <button class="opt" data-opt="${escapeHtml(opt)}">
              <span class="key">${['أ', 'ب', 'ج', 'د'][i] || i + 1}</span>
              <span>${opt}</span>
            </button>`).join('')}
        </div>`;
    }

    area.innerHTML = `
      <div class="q-card">
        <span class="q-type-badge ${isDecisive ? 'decisive' : ''}">
          ${isDecisive ? '⚔️ سؤال الحسم — نقاط مضاعفة' : `🎯 ${typeLabel}`}
        </span>
        <div class="q-text">${q.question}</div>
        ${media}
        ${body}
        <div id="feedback-area"></div>
      </div>
      <div class="timer mt-2" id="q-timer"><span></span><div class="t-num"></div></div>`;

    // ربط الأحداث
    if (q.type === 'order') {
      this.initOrderUI(q, this.currentBankItems);
      this.startTimer(() => this.handleAnswer(null));
    } else {
      area.querySelectorAll('.opt').forEach(btn => {
        btn.addEventListener('click', () => this.handleAnswer(btn.dataset.opt));
      });
      this.startTimer(() => this.handleAnswer(null));
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

  /* ---------------- التحقق من الإجابة ---------------- */
  handleAnswer(userAnswer) {
    if (this.answered) return;
    this.answered = true;
    this.stopTimer();

    const q = this.currentQuestion;
    const total = this.questionTime;
    const remainingRatio = Math.max(0, this.timeLeft / total);

    // تحديد صحة الإجابة
    let ok = false;
    if (userAnswer !== null) {
      if (q.type === 'order') {
        try { ok = JSON.stringify(JSON.parse(userAnswer)) === JSON.stringify(q.items); }
        catch { ok = false; }
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
    const correctText = q.type === 'order' ? q.items.join(' ← ') : String(q.answer);
    const userText = userAnswer === null ? 'انتهى الوقت / لم تُجب'
      : (q.type === 'order' ? JSON.parse(userAnswer).join(' ← ') : userAnswer);

    this.results.push({ q: q.question, userText, correctText, ok, explanation: q.explanation });

    // تعطيل المدخلات وتلوينها
    const area = document.getElementById('game-area');
    area.querySelectorAll('.opt, .order-chip').forEach(el => { el.disabled = true; });
    if (q.type === 'order') {
      this.revealOrder(q);
    } else {
      area.querySelectorAll('.opt').forEach(el => {
        if (el.dataset.opt === String(q.answer)) el.classList.add('correct');
        else if (el.dataset.opt === userAnswer) el.classList.add('wrong');
        else el.classList.add('dim');
      });
    }

    // التفسير التاريخي
    const feedback = document.getElementById('feedback-area');
    const ptsTag = pts > 0 ? `+${pts} نقطة` : `${pts} نقطة`;
    feedback.innerHTML = `
      <div class="explain ${ok ? 'ok' : 'no'}">
        <b>${ok ? '✅ إجابة صحيحة!' : (userAnswer === null ? '⏰ انتهى الوقت!' : '❌ إجابة خاطئة')}</b>
        ${q.explanation}
        <span class="pts-tag">⚡ ${ptsTag}</span>
      </div>
      <div class="next-btn-row">
        <button class="btn btn-primary" id="next-q-btn">
          ${this.qIndex + 1 < this.stage.questions.length ? 'السؤال التالي ←' : 'عرض النتيجة 🏁'}
        </button>
      </div>`;
    document.getElementById('next-q-btn').addEventListener('click', () => this.nextQuestion());

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
    if (this.hooks.onFinish) this.hooks.onFinish({ passed, stars, perfect });
  }

  renderResult({ passed, stars, finalScore, gained, ratio, total, perfect }) {
    const area = document.getElementById('game-area');
    const nextStageExists = this.stage.id < 20;
    const nextUnlocked = nextStageExists && player.isUnlocked(this.stage.id + 1);
    const best = player.data.completed[this.stage.id];

    const starsHtml = [1, 2, 3].map(i =>
      `<span class="${i <= stars ? 'lit' : ''}">⭐</span>`).join('');

    area.innerHTML = `
      <div class="result-wrap">
        <div class="result-card">
          <div class="r-icon">${passed ? (perfect ? '💎' : '🏆') : '💪'}</div>
          <h2>${passed ? (perfect ? 'أداء أسطوري كامل!' : 'أحسنت! مرحلة مكتملة') : 'محاولة شجاعة!'}</h2>
          <p class="r-sub">${passed
            ? `اجتزت «${this.stage.title}» بنسبة ${Math.round(ratio * 100)}%`
            : `تحتاج 50% على الأقل لاجتياز «${this.stage.title}» — نسبتك ${Math.round(ratio * 100)}%`}</p>
          <div class="result-stars" aria-label="${stars} من 3 نجوم">${starsHtml}</div>

          <div class="result-nums">
            <div class="rn"><b>${finalScore}</b><span>نقاط المرحلة</span></div>
            <div class="rn"><b>${this.correctCount}/${total}</b><span>إجابات صحيحة</span></div>
            <div class="rn"><b>${gained > 0 ? `+${gained}` : 0}</b><span>مكافأة الإنجاز</span></div>
            <div class="rn"><b>${best ? best.best : finalScore}</b><span>أفضل نتيجة</span></div>
          </div>

          <div class="result-actions">
            ${passed && nextUnlocked ? `<button class="btn btn-primary" id="res-next">المرحلة التالية ←</button>` : ''}
            <button class="btn btn-light" id="res-retry">🔁 إعادة المحاولة</button>
            <button class="btn btn-light" id="res-map">🗺️ خريطة المراحل</button>
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
    if (nextBtn) nextBtn.addEventListener('click', () => navigate(`#/game?stage=${this.stage.id + 1}`));
    document.getElementById('res-retry').addEventListener('click', () => this.start(this.stage.id, this.hooks));
    document.getElementById('res-map').addEventListener('click', () => navigate('#/stages'));
  }
}

function escapeHtml(s) {
  return String(s).replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;');
}

export const gameEngine = new GameEngine();
