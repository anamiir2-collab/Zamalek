/* ============================================================
   ZAMALEK LEGENDS – أسطورة الزمالك
   app.js : نقطة الدخول — الصوت، الشاشات، الروابط، التهيئة
   ============================================================ */

import { player, LEVELS } from './player.js';
import { register, startRouter, navigate, onBefore } from './router.js';
import { gameEngine } from './game-engine.js';
import {
  SECTIONS, getSection, sectionOfStage, sectionCompletedCount,
  sectionStars, isSectionComplete, getStageMeta, STAGES_INDEX,
  stagesCount, validateRegistry
} from './sections-manager.js';
import { ACHIEVEMENTS, checkAchievements, sectionMedals, MEDAL_TITLES } from './achievements.js';
import { initEncyclopedia } from './encyclopedia.js';
import { DIFFICULTY_LABELS } from './scoring.js';
import { CHARACTERS, CHARACTER_IDS, drawCharacter, speechBubble, say } from './characters.js';

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
  const colors = ['#d32f2f', '#ffffff', '#ffd54f', '#7bc96f', '#f78fb3', '#b39ddb'];
  for (let i = 0; i < 70; i++) {
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

/** أول مرحلة مفتوحة وغير مكتملة عبر كل الأقسام */
function firstPlayableStage() {
  for (const sec of SECTIONS) {
    for (const id of sec.stages) {
      if (player.isUnlocked(id) && !player.isCompleted(id)) return id;
    }
  }
  return Math.min(player.data.lastStage, stagesCount());
}

/** شبكة اختيار الشخصيات */
function renderCharGrid(containerId, interactive) {
  const box = document.getElementById(containerId);
  if (!box) return;
  const current = player.data.character;
  box.innerHTML = CHARACTER_IDS.map(id => {
    const c = CHARACTERS[id];
    const selected = current === id;
    return `
      <button class="char-card ${selected ? 'selected' : ''}" data-char="${id}"
              ${interactive ? '' : 'disabled'}
              aria-pressed="${selected}" aria-label="${c.name}">
        <div class="char-avatar">${c.draw()}</div>
        <b>${c.name}</b>
        <span>${c.role}</span>
      </button>`;
  }).join('');
  if (interactive) {
    box.querySelectorAll('[data-char]').forEach(btn => {
      btn.addEventListener('click', () => {
        player.setCharacter(btn.dataset.char);
        audio.play('unlock');
        toast(`اخترت ${CHARACTERS[btn.dataset.char].name} 🎉`, 'success');
        // تحديث التحديد في كل الشبكات الظاهرة
        document.querySelectorAll('.char-card').forEach(b => {
          b.classList.toggle('selected', b.dataset.char === btn.dataset.char);
        });
        renderProfileCharacter();
        // بعد الاختيار من شاشة الافتتاح: نغلقها بعد لحظة قصيرة ليستمتع الطفل بالاختيار
        if (containerId === 'splash-chars') setTimeout(closeSplash, 700);
      });
    });
  }
}

/* ==================== شاشة الافتتاح ==================== */
function maybeShowSplash() {
  const splash = document.getElementById('splash');
  if (player.data.character) { splash.classList.add('hidden'); return; }
  renderCharGrid('splash-chars', true);
  splash.classList.remove('hidden');
}

function closeSplash() {
  document.getElementById('splash').classList.add('hidden');
}

/* ==================== عالم الأقسام (الرئيسية) ==================== */
function renderHome() {
  updateHudPoints();
  document.getElementById('welcome-name').textContent = player.name;

  // زر الاستكمال
  const resumeBtn = document.getElementById('btn-resume');
  const target = firstPlayableStage();
  const completedCount = player.completedCount;
  if (completedCount > 0 || player.data.lastStage > 1) {
    resumeBtn.hidden = false;
    const meta = getStageMeta(target) || STAGES_INDEX[0];
    const sec = sectionOfStage(meta.id);
    document.getElementById('resume-info').textContent =
      `${sec ? sec.emoji + ' ' : ''}${meta.title}`;
  } else {
    resumeBtn.hidden = true;
  }

  // بطاقات الأقسام
  const grid = document.getElementById('sections-grid');
  grid.innerHTML = SECTIONS.map(sec => {
    const done = sectionCompletedCount(sec.id, player.data.completed);
    const total = sec.stages.length;
    const stars = sectionStars(sec.id, player.data.completed);
    const pct = total ? Math.round((done / total) * 100) : 0;
    const complete = isSectionComplete(sec.id, player.data.completed);
    const c = CHARACTERS[sec.character];
    return `
      <button class="section-card ${complete ? 'complete' : ''}" data-section="${sec.id}"
              style="--c1:${sec.c1};--c2:${sec.c2}" aria-label="قسم ${sec.title}">
        <div class="sc-char" aria-hidden="true">${c.draw()}</div>
        <span class="sc-emoji">${sec.emoji}</span>
        <h3>${sec.title}</h3>
        <p class="sc-desc">${sec.desc}</p>
        <div class="sc-progress">
          <div class="progress"><span style="width:${pct}%"></span></div>
          <div class="sc-meta">
            <span>${done} / ${total} مراحل</span>
            <span>⭐ ${stars}</span>
          </div>
        </div>
        ${complete ? '<span class="sc-medal">🎖️ وسام القسم!</span>' : ''}
      </button>`;
  }).join('');
  grid.querySelectorAll('[data-section]').forEach(el => {
    el.addEventListener('click', () => {
      audio.play('click');
      navigate(`#/section?id=${el.dataset.section}`);
    });
  });

  // الإحصائيات
  document.getElementById('st-points').textContent = player.data.points;
  document.getElementById('st-stages').textContent = `${completedCount} / ${stagesCount()}`;
  document.getElementById('st-stars').textContent = `⭐ ${player.stageStars}`;
  document.getElementById('st-correct').textContent = player.data.correct;
  document.getElementById('st-accuracy').textContent = `${player.accuracy}%`;

  // المستوى
  renderLevelCard('lvl-name', 'lvl-next', 'lvl-bar');
}

/** بطاقة المستوى قابلة لإعادة الاستخدام */
function renderLevelCard(nameId, nextId, barId) {
  const lvl = player.level;
  const nxt = player.nextLevel;
  document.getElementById(nameId).textContent = `${lvl.icon} ${lvl.name}`;
  document.getElementById(nextId).textContent = nxt
    ? `${nxt.min - player.data.points} نقطة للوصول إلى «${nxt.name}»`
    : 'وصلت إلى القمة! أنت أسطورة الزمالك 👑';
  document.getElementById(barId).style.width = `${player.levelProgress}%`;
}

/* ==================== صفحة القسم ومراحله ==================== */
let currentSectionId = null;

function renderSection(route) {
  updateHudPoints();
  const m = route.match(/id=([a-z-]+)/);
  const sec = getSection(m ? m[1] : '');
  if (!sec) { navigate('#/home'); return; }
  currentSectionId = sec.id;

  document.getElementById('sec-title').textContent = `${sec.emoji} ${sec.title}`;
  document.getElementById('sec-desc').textContent = sec.desc;
  document.getElementById('sec-greet').innerHTML =
    speechBubble(sec.character, say('greet', { characterId: sec.character }), '');

  const done = sectionCompletedCount(sec.id, player.data.completed);
  const total = sec.stages.length;
  const stars = sectionStars(sec.id, player.data.completed);
  document.getElementById('sec-stars').textContent = `⭐ ${stars} / ${total * 3}`;
  document.getElementById('sec-bar').style.width = `${total ? (done / total) * 100 : 0}%`;
  document.getElementById('sec-completed').textContent = `${done} مكتملة`;

  const grid = document.getElementById('sec-grid');
  grid.innerHTML = sec.stages.map(id => {
    const meta = getStageMeta(id);
    if (!meta) return '';
    const unlocked = player.isUnlocked(id);
    const completed = player.isCompleted(id);
    const info = player.data.completed[id];
    const starsHtml = completed
      ? `<div class="s-stars">${'★'.repeat(info.stars)}${'☆'.repeat(3 - info.stars)}</div>` : '';

    if (!unlocked) {
      return `
        <button class="stage-card locked" data-stage="${id}" aria-label="مرحلة مقفلة">
          <span class="num">${id}</span>
          <div class="lock-ico">🔒</div>
          <span class="s-icon">❔</span>
          <h3>مرحلة مقفلة</h3>
          <div class="s-meta"><span class="badge">أكمل المرحلة السابقة لفتحها</span></div>
        </button>`;
    }

    return `
      <button class="stage-card ${completed ? 'completed' : ''}" data-stage="${id}"
              style="background:${meta.theme}"
              aria-label="المرحلة ${id}: ${meta.title}">
        <span class="num">${id}</span>
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
    <p class="desc">20 سؤالًا ممتعًا بانتظارك — مع تلميحات لطيفة ومعلومة جميلة بعد كل إجابة!</p>
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

/* ==================== الجوائز والأوسمة ==================== */
function renderPrizes() {
  updateHudPoints();

  const medals = sectionMedals();
  document.getElementById('pr-stars').textContent = player.stageStars;
  document.getElementById('pr-medals').textContent =
    `${medals.filter(m => m.complete).length}/${SECTIONS.length}`;
  document.getElementById('pr-badges').textContent = player.data.achievements.length;
  document.getElementById('pr-boxes').textContent = player.data.boxes;

  renderLevelCard('ach-lvl-name', 'ach-lvl-next', 'ach-lvl-bar');

  // أوسمة الأقسام
  const medalsGrid = document.getElementById('prizes-medals');
  medalsGrid.innerHTML = medals.map(m => {
    const sec = getSection(m.sectionId);
    return `
      <div class="card medal-card ${m.complete ? 'got' : ''}">
        <div class="row">
          <span class="medal-icon" style="--c1:${sec.c1};--c2:${sec.c2}">${m.complete ? '🎖️' : sec.emoji}</span>
          <div class="grow">
            <b>${m.title}</b>
            <div class="muted" style="font-size:.8rem;font-weight:600">${m.desc}</div>
            <div class="progress mt-1"><span style="width:${m.progress}%"></span></div>
          </div>
        </div>
        ${m.complete ? '<div class="badge gold mt-1">✓ مُنح الوسام</div>' : '<div class="badge mt-1">قيد التحصيل</div>'}
      </div>`;
  }).join('');

  // شارات الإنجاز
  const badgesGrid = document.getElementById('prizes-badges');
  badgesGrid.innerHTML = ACHIEVEMENTS.map(ach => {
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

/* ==================== ملف اللاعب ==================== */
function renderProfileCharacter() {
  const avatar = document.getElementById('profile-avatar');
  const charId = player.data.character && player.data.character !== 'none'
    ? player.data.character : 'zaki';
  avatar.innerHTML = CHARACTERS[charId].draw();
  document.getElementById('profile-char').textContent =
    `رفيقك: ${CHARACTERS[charId].name}`;
  renderCharGrid('profile-char-grid', true);
}

function renderProfile() {
  updateHudPoints();
  document.getElementById('profile-name').textContent = player.name;
  const lvl = player.level;
  document.getElementById('profile-lvl').textContent = `${lvl.icon} ${lvl.name}`;
  document.getElementById('input-name').value = player.data.name || '';
  renderProfileCharacter();

  const medals = sectionMedals();
  document.getElementById('pf-points').textContent = player.data.points;
  document.getElementById('pf-stages').textContent = player.completedCount;
  document.getElementById('pf-stars').textContent = `⭐ ${player.stageStars}`;
  document.getElementById('pf-medals').textContent = `🎖️ ${medals.filter(m => m.complete).length}`;
  document.getElementById('pf-badges').textContent = `🏅 ${player.data.achievements.length}`;
  document.getElementById('pf-accuracy').textContent = `${player.accuracy}%`;
}

/* ==================== المفضلة ==================== */
function renderFavorites() {
  const list = document.getElementById('fav-list');
  const empty = document.getElementById('fav-empty');
  const favs = player.data.favorites;
  empty.classList.toggle('hidden', favs.length > 0);
  list.innerHTML = favs.map(f => {
    const sec = f.sectionId ? getSection(f.sectionId) : null;
    return `
      <div class="fav-item">
        <div class="fav-head">
          <span class="badge">${sec ? `${sec.emoji} ${sec.title}` : 'معلومة'}</span>
          <button class="fav-remove" data-ts="${f.ts}" aria-label="إزالة من المفضلة">🗑️</button>
        </div>
        <div class="fav-q">${f.q}</div>
        <div class="fav-fact">💡 ${f.fact}</div>
      </div>`;
  }).join('');
  list.querySelectorAll('[data-ts]').forEach(btn => {
    btn.addEventListener('click', () => {
      player.removeFavorite(Number(btn.dataset.ts));
      renderFavorites();
      toast('تم الإزالة من المفضلة', 'success');
    });
  });
}

/* ==================== المساعدة ==================== */
function renderHelp() {
  const box = document.getElementById('help-chars');
  if (box && !box.dataset.done) {
    box.innerHTML = CHARACTER_IDS.map(id => {
      const c = CHARACTERS[id];
      return `
        <div class="char-card static">
          <div class="char-avatar">${c.draw()}</div>
          <b>${c.name}</b>
          <span>${c.role}</span>
        </div>`;
    }).join('');
    box.dataset.done = '1';
  }
}

/* ==================== الإعدادات ==================== */
function renderSettings() {
  document.getElementById('input-name').value = player.data.name || '';
  document.getElementById('btn-toggle-sound').textContent = audio.enabled ? 'تشغيل ✓' : 'إيقاف';
  const dark = document.documentElement.dataset.theme === 'dark';
  document.getElementById('btn-toggle-theme').textContent = dark ? 'الوضع الليلي مفعّل' : 'إيقاف';
  renderCharGrid('settings-char-grid', true);
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

/* ==================== نافذة شارة/وسام جديد ==================== */
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

/** نافذة وسام قسم جديد */
function showMedalModal(sectionId) {
  const sec = getSection(sectionId);
  const body = document.getElementById('badge-modal-body');
  body.innerHTML = `
    <div style="font-size:3rem">🎖️</div>
    <h3>وسام جديد!</h3>
    <div class="card mt-2 badge-new" style="text-align:right">
      <div class="row">
        <span class="medal-icon got" style="--c1:${sec.c1};--c2:${sec.c2};font-size:2.2rem">${sec.emoji}</span>
        <div><b>${MEDAL_TITLES[sectionId]}</b>
          <div class="muted" style="font-size:.82rem;font-weight:600">أكملت كل مراحل قسم «${sec.title}»! 🎉</div>
        </div>
      </div>
    </div>
    <div class="modal-actions">
      <button class="btn btn-primary" id="badge-ok">مبروك! ⭐</button>
    </div>`;
  openModal('modal-badge');
  audio.play('badge');
  document.getElementById('badge-ok').addEventListener('click', () => closeModal('modal-badge'));
}

/* ==================== صندوق المفاجآت ==================== */
function openSurpriseBox() {
  // مكافأة عشوائية مرحّة
  const rewards = [
    { points: 5, label: '5 نقاط خبرة ⚡' },
    { points: 10, label: '10 نقاط خبرة ⚡' },
    { points: 15, label: '15 نقطة خبرة 🌟' },
    { points: 25, label: '25 نقطة خبرة 💎' }
  ];
  const weights = [4, 3, 2, 1];
  let r = Math.random() * weights.reduce((a, b) => a + b, 0);
  let reward = rewards[0];
  for (let i = 0; i < rewards.length; i++) {
    if (r < weights[i]) { reward = rewards[i]; break; }
    r -= weights[i];
  }
  player.openBox(reward);
  updateHudPoints();

  const body = document.getElementById('box-modal-body');
  body.innerHTML = `
    <div class="box-emoji">🎁</div>
    <h3>${say('box')}</h3>
    <div class="box-reward">${reward.label}</div>
    <div class="modal-actions">
      <button class="btn btn-primary btn-big" id="box-ok">شكرًا يا أحلى صندوق! 🎉</button>
    </div>`;
  openModal('modal-box');
  audio.play('unlock');
  document.getElementById('box-ok').addEventListener('click', () => {
    closeModal('modal-box');
    audio.play('star');
  });
}

/* ==================== ربط الأحداث العامة ==================== */
function bindGlobalEvents() {
  // أزرار الرئيسية
  document.getElementById('btn-resume').addEventListener('click', () => {
    audio.play('click');
    navigate(`#/game?stage=${firstPlayableStage()}`);
  });
  document.getElementById('btn-go-prizes').addEventListener('click', () => { audio.play('click'); navigate('#/prizes'); });
  document.getElementById('btn-go-profile').addEventListener('click', () => { audio.play('click'); navigate('#/profile'); });
  document.getElementById('btn-go-favorites').addEventListener('click', () => { audio.play('click'); navigate('#/favorites'); });
  document.getElementById('btn-go-encyclopedia').addEventListener('click', () => { audio.play('click'); navigate('#/encyclopedia'); });
  document.getElementById('btn-go-help').addEventListener('click', () => { audio.play('click'); navigate('#/help'); });
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

  // حفظ اللقب (من ملف اللاعب)
  document.getElementById('btn-save-name').addEventListener('click', () => {
    const val = document.getElementById('input-name').value;
    player.setName(val);
    document.getElementById('profile-name').textContent = player.name;
    document.getElementById('welcome-name').textContent = player.name;
    toast('تم حفظ اللقب بنجاح ✓', 'success');
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
    maybeShowSplash();
  });

  // شاشة الافتتاح
  document.getElementById('btn-skip-char').addEventListener('click', () => {
    player.setCharacter('none'); // تخطي واع لكن بلا اختيار
    closeSplash();
    audio.play('click');
  });

  // إغلاق النوافذ بالنقر على الخلفية
  document.querySelectorAll('.modal-overlay').forEach(ov => {
    ov.addEventListener('click', e => {
      if (e.target === ov) ov.classList.remove('open');
    });
  });
}

/* ==================== تشغيل التطبيق ==================== */
function boot() {
  // المظهر المحفوظ
  applyTheme(player.data.theme === 'dark' ? 'dark' : 'light');
  applySound(player.data.sound !== false);
  updateHudPoints();

  // تشخيص سجل المراحل (يظهر في الكونسول فقط عند وجود مشكلة)
  const missing = validateRegistry();
  if (missing.length) console.warn('مراحل غير مسجلة في REGISTRY:', missing);

  // حرس المسارات
  onBefore(route => {
    // توجيه المسارات القديمة إلى نظيراتها الجديدة
    if (route.startsWith('#/stages')) {
      window.location.hash = '#/home';
      return false;
    }
    if (route.startsWith('#/achievements')) {
      window.location.hash = '#/prizes';
      return false;
    }
    if (route.startsWith('#/game')) {
      const m = route.match(/stage=(\d+)/);
      const id = m ? Number(m[1]) : player.data.lastStage;
      if (!player.isUnlocked(id)) {
        toast('🔒 أكمل المرحلة السابقة داخل القسم لفتحها', 'error');
        const sec = sectionOfStage(id);
        window.location.hash = sec ? `#/section?id=${sec.id}` : '#/home';
        return false;
      }
    }
    return true;
  });

  // تسجيل الشاشات
  register('#/home', renderHome);
  register('#/section', renderSection);
  register('#/game', route => {
    const m = route.match(/stage=(\d+)/);
    const id = m ? Number(m[1]) : player.data.lastStage;
    gameEngine.start(id, {
      onCorrect: () => audio.play('correct'),
      onWrong: () => audio.play('wrong'),
      onTick: () => audio.play('tick'),
      onFav: () => toast('أُضيفت المعلومة إلى المفضلة ❤️', 'success'),
      onFinish: ({ passed, perfect, stageId }) => {
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
        // وسام القسم عند الاكتمال الأول
        const sec = sectionOfStage(stageId);
        if (sec && isSectionComplete(sec.id, player.data.completed) && !notifiedMedals.has(sec.id)) {
          notifiedMedals.add(sec.id);
          setTimeout(() => showMedalModal(sec.id), 1800);
        }
      },
      onBox: () => setTimeout(openSurpriseBox, 900)
    });
  });
  register('#/encyclopedia', initEncyclopedia);
  register('#/prizes', renderPrizes);
  register('#/profile', renderProfile);
  register('#/favorites', renderFavorites);
  register('#/help', renderHelp);
  register('#/settings', renderSettings);

  bindGlobalEvents();

  // شاشة الافتتاح لأول زيارة (بعد اختيار الشخصية تختفي)
  setTimeout(maybeShowSplash, 400);

  startRouter();
  audio.init();

  // تفعيل سياق الصوت مع أول تفاعل (سياسة المتصفحات)
  const unlockAudio = () => { audio.init(); };
  document.addEventListener('click', unlockAudio, { once: true });
}

/** الأوسمة التي أُظهر لها احتفال في هذه الجلسة */
const notifiedMedals = new Set();

boot();
