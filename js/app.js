/* ============================================================
   ZAMALEK LEGENDS – أسطورة الزمالك
   app.js : نقطة الدخول — الصوت، الشاشات، الروابط، التهيئة
   ============================================================ */

import { player, LEVELS } from './player.js';
import { register, startRouter, navigate, onBefore } from './router.js';
import { gameEngine } from './game-engine.js';
import { STAGES_INDEX, getStageMeta } from './stages-manager.js';
import { ACHIEVEMENTS, checkAchievements } from './achievements.js';
import { initEncyclopedia } from './encyclopedia.js';
import { DIFFICULTY_LABELS } from './scoring.js';

/* ==================== مدير الصوت ==================== */
const SOUNDS = {
  click: './assets/sounds/click.wav',
  correct: './assets/sounds/correct.wav',
  wrong: './assets/sounds/wrong.wav',
  star: './assets/sounds/star.wav',
  fanfare: './assets/sounds/fanfare.wav',
  tick: './assets/sounds/tick.wav',
  unlock: './assets/sounds/unlock.wav',
  timeout: './assets/sounds/timeout.wav',
  badge: './assets/sounds/badge.wav'
};

const audio = {
  ctx: null,
  buffers: {},
  enabled: player.data.sound !== false,

  init() {
    if (this.ctx) return;
    try {
      this.ctx = new (window.AudioContext || window.webkitAudioContext)();
    } catch { this.ctx = null; }
  },

  async play(name) {
    if (!this.enabled || !this.ctx) return;
    try {
      if (this.ctx.state === 'suspended') await this.ctx.resume();
      if (!this.buffers[name]) {
        const res = await fetch(SOUNDS[name]);
        const arr = await res.arrayBuffer();
        this.buffers[name] = await this.ctx.decodeAudioData(arr);
      }
      const src = this.ctx.createBufferSource();
      src.buffer = this.buffers[name];
      const gain = this.ctx.createGain();
      gain.gain.value = 0.55;
      src.connect(gain).connect(this.ctx.destination);
      src.start();
    } catch (err) {
      // الصوت ليس حرجًا — نتجاهل الأخطاء بصمت
    }
  }
};

/* ==================== أدوات واجهة ==================== */
function toast(msg, type = '') {
  const wrap = document.getElementById('toast-wrap');
  const el = document.createElement('div');
  el.className = `toast ${type}`;
  el.textContent = msg;
  wrap.appendChild(el);
  setTimeout(() => el.remove(), 2900);
}

function confettiBurst() {
  const colors = ['#d32f2f', '#ffffff', '#141414', '#d9a413', '#ff8a80'];
  for (let i = 0; i < 60; i++) {
    const c = document.createElement('div');
    c.className = 'confetti';
    c.style.right = `${Math.random() * 100}vw`;
    c.style.background = colors[i % colors.length];
    c.style.animationDuration = `${2 + Math.random() * 1.6}s`;
    c.style.animationDelay = `${Math.random() * 0.5}s`;
    document.body.appendChild(c);
    setTimeout(() => c.remove(), 4200);
  }
}

function openModal(id) { document.getElementById(id).classList.add('open'); }
function closeModal(id) { document.getElementById(id).classList.remove('open'); }

function updateHudPoints() {
  document.getElementById('hud-points-num').textContent = player.data.points;
}

/* ==================== الشاشة الرئيسية ==================== */
function renderHome() {
  updateHudPoints();

  // الاسم الترحيبي
  document.getElementById('welcome-name').textContent = player.name;

  // زر استكمال اللعب
  const resumeBtn = document.getElementById('btn-resume');
  const completedCount = player.completedCount;
  if (completedCount > 0 || player.data.lastStage > 1) {
    resumeBtn.hidden = false;
    const meta = getStageMeta(player.data.lastStage) || STAGES_INDEX[0];
    document.getElementById('resume-info').textContent =
      `آخر توقف عند: المرحلة ${meta.id} — ${meta.title}`;
  } else {
    resumeBtn.hidden = true;
  }

  // الإحصائيات
  document.getElementById('st-points').textContent = player.data.points;
  document.getElementById('st-stages').textContent = `${completedCount} / ${STAGES_INDEX.length}`;
  document.getElementById('st-correct').textContent = player.data.correct;
  document.getElementById('st-accuracy').textContent = `${player.accuracy}%`;

  // أعلى إنجاز مفتوح
  const unlockedAch = ACHIEVEMENTS.filter(a => player.data.achievements.includes(a.id));
  document.getElementById('st-best').textContent = unlockedAch.length
    ? unlockedAch[unlockedAch.length - 1].icon + ' ' + unlockedAch[unlockedAch.length - 1].title
    : '—';

  // المستوى
  const lvl = player.level;
  const nxt = player.nextLevel;
  document.getElementById('lvl-name').textContent = `${lvl.icon} ${lvl.name}`;
  document.getElementById('lvl-next').textContent = nxt
    ? `${nxt.min - player.data.points} نقطة للوصول إلى «${nxt.name}»`
    : 'وصلت إلى القمة! أنت أسطورة الزمالك 👑';
  document.getElementById('lvl-bar').style.width = `${player.levelProgress}%`;
}

/* ==================== خريطة المراحل ==================== */
function renderStagesMap() {
  const grid = document.getElementById('stages-grid');
  const totalStars = player.stageStars;
  document.getElementById('map-stars').textContent = `⭐ ${totalStars} / ${STAGES_INDEX.length * 3}`;
  document.getElementById('map-bar').style.width =
    `${(player.completedCount / STAGES_INDEX.length) * 100}%`;
  document.getElementById('map-completed').textContent = `${player.completedCount} مكتملة`;

  grid.innerHTML = STAGES_INDEX.map(meta => {
    const unlocked = player.isUnlocked(meta.id);
    const completed = player.isCompleted(meta.id);
    const info = player.data.completed[meta.id];
    const starsHtml = completed
      ? `<div class="s-stars">${'★'.repeat(info.stars)}${'☆'.repeat(3 - info.stars)}</div>` : '';

    if (!unlocked) {
      return `
        <button class="stage-card locked" data-stage="${meta.id}" aria-label="مرحلة مقفلة">
          <span class="num">${meta.id}</span>
          <div class="lock-ico">🔒</div>
          <span class="s-icon">❔</span>
          <h3>مرحلة مقفلة</h3>
          <div class="s-meta"><span class="badge">أكمل المرحلة السابقة لفتحها</span></div>
        </button>`;
    }

    return `
      <button class="stage-card ${completed ? 'completed' : ''}" data-stage="${meta.id}"
              style="background:${meta.theme}"
              aria-label="المرحلة ${meta.id}: ${meta.title}">
        <span class="num">${meta.id}</span>
        <span class="s-icon">${meta.icon}</span>
        <h3>${meta.title}</h3>
        ${starsHtml}
        <div class="s-meta">
          <span class="badge">${DIFFICULTY_LABELS[meta.difficulty]}</span>
          <span class="badge">${meta.points} نقطة</span>
        </div>
      </button>`;
  }).join('');

  grid.querySelectorAll('[data-stage]').forEach(el => {
    el.addEventListener('click', () => {
      const id = Number(el.dataset.stage);
      if (!player.isUnlocked(id)) {
        el.classList.add('shake');
        audio.play('wrong');
        toast('🔒 هذه المرحلة مقفلة — أكمل المرحلة السابقة أولًا', 'error');
        setTimeout(() => el.classList.remove('shake'), 600);
        return;
      }
      openStageModal(id);
    });
  });
}

/** نافذة تفاصيل المرحلة */
function openStageModal(id) {
  const meta = getStageMeta(id);
  const info = player.data.completed[id];
  const body = document.getElementById('stage-modal-body');
  body.innerHTML = `
    <div class="head">
      <div class="s-icon" style="background:${meta.theme}">${meta.icon}</div>
      <div class="grow">
        <h3>المرحلة ${meta.id}: ${meta.title}</h3>
        <div class="muted" style="font-weight:700;font-size:.85rem">${meta.subtitle}</div>
      </div>
    </div>
    <p class="desc">${stageDescriptions[id] || meta.subtitle}</p>
    <div class="info-grid">
      <div class="cell"><b class="diff-${meta.difficulty}">${DIFFICULTY_LABELS[meta.difficulty]}</b><span>الصعوبة</span></div>
      <div class="cell"><b>${meta.points}</b><span>النقاط الأساسية</span></div>
      <div class="cell"><b>${info ? '★'.repeat(info.stars) + '☆'.repeat(3 - info.stars) : '—'}</b><span>نجومك</span></div>
      <div class="cell"><b>${info ? info.best : '—'}</b><span>أفضل نتيجة</span></div>
    </div>
    <div class="modal-actions">
      <button class="btn btn-primary" id="modal-stage-start">
        ${info ? '🔁 إعادة اللعب' : '🚀 ابدأ المرحلة'}
      </button>
      <button class="btn btn-light" id="modal-stage-close">إغلاق</button>
    </div>`;
  openModal('modal-stage');
  document.getElementById('modal-stage-close').addEventListener('click', () => closeModal('modal-stage'));
  document.getElementById('modal-stage-start').addEventListener('click', () => {
    closeModal('modal-stage');
    navigate(`#/game?stage=${id}`);
  });
}

/* ==================== الإنجازات ==================== */
function renderAchievements() {
  const grid = document.getElementById('achievements-grid');
  const lvl = player.level;
  const nxt = player.nextLevel;
  document.getElementById('ach-lvl-name').textContent = `${lvl.icon} ${lvl.name}`;
  document.getElementById('ach-lvl-next').textContent = nxt
    ? `${nxt.min - player.data.points} نقطة للوصول إلى «${nxt.name}»`
    : 'وصلت إلى القمة! أنت أسطورة الزمالك 👑';
  document.getElementById('ach-lvl-bar').style.width = `${player.levelProgress}%`;

  grid.innerHTML = ACHIEVEMENTS.map(ach => {
    const got = player.data.achievements.includes(ach.id);
    return `
      <div class="card ${got ? '' : 'hidden'}" style="${got ? '' : 'opacity:.55;filter:grayscale(1)'}">
        <div class="row">
          <span style="font-size:1.9rem">${got ? ach.icon : '🔒'}</span>
          <div class="grow">
            <b>${ach.title}</b>
            <div class="muted" style="font-size:.8rem;font-weight:600;line-height:1.8">${ach.desc}</div>
          </div>
        </div>
        ${got ? '<div class="badge gold mt-1">🏅 مفتوحة</div>' : '<div class="badge mt-1">لم تُفتح بعد</div>'}
      </div>`;
  }).join('');
}

/* ==================== الإعدادات ==================== */
function renderSettings() {
  document.getElementById('input-name').value = player.data.name || '';
  document.getElementById('btn-toggle-sound').textContent = audio.enabled ? 'تشغيل ✓' : 'إيقاف';
  const dark = document.documentElement.dataset.theme === 'dark';
  document.getElementById('btn-toggle-theme').textContent = dark ? 'الوضع الليلي مفعّل' : 'إيقاف';
}

/* ==================== مظهر التطبيق ==================== */
function applyTheme(theme) {
  document.documentElement.dataset.theme = theme;
  player.data.theme = theme;
  player.persist();
  document.getElementById('btn-theme').textContent = theme === 'dark' ? '☀️' : '🌙';
  const settingsToggle = document.getElementById('btn-toggle-theme');
  if (settingsToggle) settingsToggle.textContent = theme === 'dark' ? 'الوضع الليلي مفعّل' : 'إيقاف';
}

function applySound(on) {
  audio.enabled = on;
  player.data.sound = on;
  player.persist();
  document.getElementById('btn-sound').textContent = on ? '🔊' : '🔇';
  document.getElementById('btn-toggle-sound').textContent = on ? 'تشغيل ✓' : 'إيقاف';
}

/* ==================== نافذة شارة جديدة ==================== */
function showBadgeModal(unlockedList) {
  if (!unlockedList.length) return;
  const body = document.getElementById('badge-modal-body');
  body.innerHTML = `
    <div style="font-size:3rem">🏅</div>
    <h3>إنجاز${unlockedList.length > 1 ? 'ات' : ''} جديد${unlockedList.length > 1 ? 'ة' : ''}!</h3>
    ${unlockedList.map(a => `
      <div class="card mt-2 badge-new" style="text-align:right">
        <div class="row">
          <span style="font-size:1.8rem">${a.icon}</span>
          <div><b>${a.title}</b><div class="muted" style="font-size:.82rem;font-weight:600">${a.desc}</div></div>
        </div>
      </div>`).join('')}
    <div class="modal-actions">
      <button class="btn btn-primary" id="badge-ok">رائع! ⚡</button>
    </div>`;
  openModal('modal-badge');
  audio.play('badge');
  document.getElementById('badge-ok').addEventListener('click', () => closeModal('modal-badge'));
}

/* ==================== وصف المراحل (لنافذة التفاصيل) ==================== */
const stageDescriptions = {
  1: 'في الخامس من يناير 1911 وُلد النادي في القاهرة. تعرّف على قصة الميلاد والمؤسس البلجيكي والاسم الأول.',
  2: 'قصة الاسم الأول «قصر النيل»، والمقر القديم، وبدايات النادي كبيت للرياضات المتعددة.',
  3: 'من 1913 إلى 1941 حمل النادي اسم «المختلط» — حقبة المزج والانطلاقة الأولى نحو الألقاب.',
  4: 'كيف لُقّب النادي «قاهر الأجانب»؟ بطولات مبكرة ضد فرق الجاليات والعصر المبكر لكرة القدم المصرية.',
  5: 'حقبة الاسم الملكي: نادي فاروق الأول، ونهائي 1944 الذي دخل التاريخ بنتيجة 6-0.',
  6: 'ثورة يوليو 1952 غيّرت وجه النادي: ولادة اسم «الزمالك» ومصرنة الإدارة والرئاسة.',
  7: '«مدرسة الفن والهندسة» — الألقاب، الألوان البيضاء، وهوية الأسلوب الذي ميّز الزمالك.',
  8: 'خمسة عشر لقب دوري: من أول لقب 1959-60 حتى التتويج الأخير. هل تحفظ أرقام الملوك؟',
  9: '29 لقبًا في كأس مصر، أقدم بطولة كأس في أفريقيا والعالم العربي، وليالي نهائيات لا تُنسى.',
  10: 'خمس بطولات لدوري أبطال إفريقيا: 1984، 1986، 1993، 1996، 2002. قصص النهائيات والترجيحات.',
  11: 'السوبر الإفريقي الخماسي والكونفدراليتان: من 1994 حتى «سوبر القرن» 2024 في الرياض.',
  12: 'التوأمان وإسماعيل يوسف وأيمن يونس وحازم إمام — جيل صنع بطولات إفريقيا في التسعينات.',
  13: 'أحمد حسن وشيكابالا وميدو وعبد الواحد السيد: نجوم الألفينات وصناع دوري أبطال 2002.',
  14: 'من حسين حجازي إلى شيكابالا: اختبار في معرفة أساطير القلعة البيضاء عبر الأجيال.',
  15: 'من شوبير إلى عبد الواحد السيد ومنسي نهائي 2024: قصة حراس عرين الزمالك.',
  16: 'الرجلون خلف الكواليس: الرؤساء من مرزباخ إلى حيدر باشا، والمدربون صناع البطولات.',
  17: 'من 6-0 عام 1944 إلى ترجيح الرياض 2024: اختبار في ليالي القمة التاريخية.',
  18: 'الهدافون والأكثر مشاركة وأرقام لا تُصدق: هل تعرف سجل الأرقام القياسية؟',
  19: 'الزمالك ليس كرة قدم فقط: كرة اليد والطائرة والسلة ورياضات كثيرة بجوهرة إفريقية.',
  20: 'المواجهة الأخيرة! أسئلة شاملة من كل الحقب — سؤال الحسم يمنحك نقاطًا مضاعفة. أثبت أنك أسطورة!'
};

/* ==================== ربط الأحداث العامة ==================== */
function bindGlobalEvents() {
  // أزرار الرئيسية
  document.getElementById('btn-start-adventure').addEventListener('click', () => {
    audio.play('click');
    const target = firstPlayableStage();
    navigate(`#/game?stage=${target}`);
  });
  document.getElementById('btn-resume').addEventListener('click', () => {
    audio.play('click');
    navigate(`#/game?stage=${player.data.lastStage}`);
  });
  document.getElementById('btn-go-stages').addEventListener('click', () => { audio.play('click'); navigate('#/stages'); });
  document.getElementById('btn-go-achievements').addEventListener('click', () => { audio.play('click'); navigate('#/achievements'); });
  document.getElementById('btn-go-encyclopedia').addEventListener('click', () => { audio.play('click'); navigate('#/encyclopedia'); });
  document.getElementById('btn-go-settings').addEventListener('click', () => { audio.play('click'); navigate('#/settings'); });

  // أزرار الرجوع
  document.querySelectorAll('[data-nav]').forEach(btn => {
    btn.addEventListener('click', () => { audio.play('click'); navigate(btn.dataset.nav); });
  });

  // الصوت والمظهر (الشريط العلوي)
  document.getElementById('btn-sound').addEventListener('click', () => {
    applySound(!audio.enabled);
    if (audio.enabled) audio.play('click');
  });
  document.getElementById('btn-theme').addEventListener('click', () => {
    applyTheme(document.documentElement.dataset.theme === 'dark' ? 'light' : 'dark');
    audio.play('click');
  });

  // الإعدادات
  document.getElementById('btn-save-name').addEventListener('click', () => {
    const val = document.getElementById('input-name').value;
    player.setName(val);
    document.getElementById('welcome-name').textContent = player.name;
    toast('تم حفظ الاسم بنجاح ✓', 'success');
    audio.play('correct');
  });
  document.getElementById('btn-toggle-sound').addEventListener('click', () => applySound(!audio.enabled));
  document.getElementById('btn-toggle-theme').addEventListener('click', () => {
    applyTheme(document.documentElement.dataset.theme === 'dark' ? 'light' : 'dark');
  });

  // إعادة الضبط
  document.getElementById('btn-reset').addEventListener('click', () => openModal('modal-confirm'));
  document.getElementById('btn-cancel-reset').addEventListener('click', () => closeModal('modal-confirm'));
  document.getElementById('btn-confirm-reset').addEventListener('click', () => {
    player.reset();
    closeModal('modal-confirm');
    applySound(true);
    applyTheme('light');
    updateHudPoints();
    renderHome();
    toast('تم إعادة ضبط التقدم بالكامل', 'success');
    navigate('#/home');
  });

  // اسم اللاعب أول مرة
  document.getElementById('btn-name-first-save').addEventListener('click', () => {
    const val = document.getElementById('name-first-input').value;
    player.setName(val);
    renderHome();
    closeModal('modal-name');
    audio.play('correct');
  });
  document.getElementById('btn-name-first-skip').addEventListener('click', () => closeModal('modal-name'));

  // إغلاق النوافذ بالنقر على الخلفية
  document.querySelectorAll('.modal-overlay').forEach(ov => {
    ov.addEventListener('click', e => {
      if (e.target === ov) ov.classList.remove('open');
    });
  });
}

/** أول مرحلة غير مكتملة ومفتوحة */
function firstPlayableStage() {
  for (const meta of STAGES_INDEX) {
    if (player.isUnlocked(meta.id) && !player.isCompleted(meta.id)) return meta.id;
  }
  return Math.min(player.data.lastStage, STAGES_INDEX.length);
}

/* ==================== تشغيل التطبيق ==================== */
function boot() {
  // المظهر المحفوظ
  applyTheme(player.data.theme === 'dark' ? 'dark' : 'light');
  applySound(player.data.sound !== false);
  updateHudPoints();

  // حرس المسارات: منع دخول مرحلة مقفلة
  onBefore(route => {
    if (route.startsWith('#/game')) {
      const m = route.match(/stage=(\d+)/);
      const id = m ? Number(m[1]) : player.data.lastStage;
      if (!player.isUnlocked(id)) {
        toast('🔒 أكمل المرحلة السابقة لفتح هذه المرحلة', 'error');
        renderStagesMap();
        window.location.hash = '#/stages';
        return false;
      }
    }
    return true;
  });

  // تسجيل الشاشات
  register('#/home', renderHome);
  register('#/stages', renderStagesMap);
  register('#/game', route => {
    const m = route.match(/stage=(\d+)/);
    const id = m ? Number(m[1]) : player.data.lastStage;
    gameEngine.start(id, {
      onCorrect: () => audio.play('correct'),
      onWrong: () => audio.play('wrong'),
      onTick: () => audio.play('tick'),
      onFinish: ({ passed, perfect }) => {
        if (passed) {
          audio.play('fanfare');
          confettiBurst();
          if (perfect) audio.play('star');
        } else {
          audio.play('timeout');
        }
        // فحص الشارات بعد تحديث التقدم
        const unlockedNow = checkAchievements();
        if (unlockedNow.length) setTimeout(() => showBadgeModal(unlockedNow), 1200);
      }
    });
  });
  register('#/encyclopedia', initEncyclopedia);
  register('#/achievements', renderAchievements);
  register('#/settings', renderSettings);

  bindGlobalEvents();

  // نافذة الاسم لأول زيارة
  if (!player.data.name) {
    setTimeout(() => openModal('modal-name'), 600);
  }

  startRouter();
  audio.init();

  // تفعيل سياق الصوت مع أول تفاعل (سياسة المتصفحات)
  const unlockAudio = () => { audio.init(); };
  document.addEventListener('click', unlockAudio, { once: true });
}

boot();
