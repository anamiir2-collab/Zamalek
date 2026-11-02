/* ============================================================
   ZAMALEK LEGENDS – أسطورة الزمالك
   player.js : إدارة اللاعب والمستويات والشخصية والمفضلة
   ============================================================ */

import { loadSave, saveSave, clearSave, defaultSave } from './progress-manager.js';
import { isStageUnlocked } from './sections-manager.js';

/** مستويات اللاعب بحسب إجمالي نقاط الخبرة (XP) */
export const LEVELS = [
  { name: 'مشجع جديد', min: 0, icon: '🎫' },
  { name: 'زملكاوي أصيل', min: 350, icon: '⚪' },
  { name: 'عاشق القلعة البيضاء', min: 950, icon: '🏰' },
  { name: 'فارس أبيض', min: 1750, icon: '🐎' },
  { name: 'أسطورة الزمالك', min: 2500, icon: '👑' }
];

/** عناوين أوسمة الأقسام */
export const SECTION_MEDAL_NAMES = {
  history: 'وسام مؤرخ القلعة',
  football: 'وسام حارس القوانين',
  legends: 'وسام أعز النجوم',
  championships: 'وسام خازن الكؤوس',
  fans: 'وسام قلب الجماهير',
  general: 'وسام المعلومات الذهبية',
  challenges: 'وسام بطل الأبطال',
  'other-sports': 'وسام متعدد المواهب',
  kids: 'وسام المستكشف الصغير',
  pictures: 'وسام عين الصقر'
};

class PlayerManager {
  constructor() {
    this.data = loadSave();
  }

  /** حفظ الحالة الحالية */
  persist() {
    saveSave(this.data);
  }

  /** إعادة ضبط كل التقدم */
  reset() {
    clearSave();
    this.data = defaultSave();
    this.persist();
  }

  get name() { return this.data.name || 'زملكاوي مجهول'; }

  setName(name) {
    this.data.name = String(name || '').trim().slice(0, 20);
    this.persist();
  }

  /* ---------------- الشخصية ---------------- */
  setCharacter(characterId) {
    this.data.character = characterId || '';
    this.persist();
  }

  get character() {
    return this.data.character || '';
  }

  /* ---------------- النقاط والإجابات ---------------- */
  addPoints(pts) {
    this.data.points = Math.max(0, this.data.points + pts);
    this.persist();
  }

  recordAnswer(isCorrect, isSpeed) {
    if (isCorrect) {
      this.data.correct += 1;
      if (isSpeed) this.data.speedCorrect += 1;
    } else {
      this.data.wrong += 1;
    }
    this.persist();
  }

  /** تسجيل نتيجة مرحلة (يُستدعى مرة واحدة عند انتهاء المحاولة) */
  finishStage(stageId, stars, score, passed, perfect = false) {
    const prev = this.data.completed[stageId];
    if (passed) {
      this.data.completed[stageId] = {
        stars: Math.max(stars, prev ? prev.stars : 0),
        best: Math.max(score, prev ? prev.best : 0),
        perfect: Boolean((prev && prev.perfect) || perfect)
      };
    }
    this.data.lastStage = stageId;
    this.persist();
  }

  setLastStage(stageId) {
    this.data.lastStage = stageId;
    this.persist();
  }

  /**
   * هل المرحلة مفتوحة؟
   * المنطق الجديد: أول مرحلة في كل قسم مفتوحة، وما بعدها
   * يُفتح بإكمال ما قبله داخل نفس القسم.
   */
  isUnlocked(stageId) {
    return isStageUnlocked(stageId, this.data.completed);
  }

  isCompleted(stageId) {
    return Boolean(this.data.completed[stageId]);
  }

  get stageStars() {
    return Object.values(this.data.completed).reduce((sum, s) => sum + (s.stars || 0), 0);
  }

  get completedCount() {
    return Object.keys(this.data.completed).length;
  }

  get totalAnswers() {
    return this.data.correct + this.data.wrong;
  }

  get accuracy() {
    const t = this.totalAnswers;
    return t === 0 ? 0 : Math.round((this.data.correct / t) * 100);
  }

  /* ---------------- المفضلة ---------------- */
  addFavorite(item) {
    // نمنع تكرار نفس السؤال في المفضلة
    if (this.data.favorites.some(f => f.q === item.q)) return false;
    this.data.favorites.unshift({
      q: String(item.q || '').slice(0, 400),
      fact: String(item.fact || '').slice(0, 600),
      stageId: item.stageId || null,
      sectionId: item.sectionId || null,
      ts: Date.now()
    });
    // حد أقصى 100 عنصر لطول الحفظ
    if (this.data.favorites.length > 100) this.data.favorites.length = 100;
    this.persist();
    return true;
  }

  removeFavorite(ts) {
    this.data.favorites = this.data.favorites.filter(f => f.ts !== ts);
    this.persist();
  }

  isFavorite(q) {
    return this.data.favorites.some(f => f.q === q);
  }

  /* ---------------- صندوق المفاجآت ---------------- */
  openBox(reward) {
    this.data.boxes += 1;
    this.data.boxHistory.unshift({ reward, ts: Date.now() });
    if (this.data.boxHistory.length > 20) this.data.boxHistory.length = 20;
    this.addPoints(reward.points || 0);
    this.persist();
  }

  markEncyRead(id) {
    if (!this.data.encyReads.includes(id)) {
      this.data.encyReads.push(id);
      this.persist();
    }
  }

  grantAchievement(id) {
    if (!this.data.achievements.includes(id)) {
      this.data.achievements.push(id);
      this.persist();
      return true; // جديد
    }
    return false;
  }

  /** المستوى الحالي */
  get level() {
    let lvl = LEVELS[0];
    for (const L of LEVELS) if (this.data.points >= L.min) lvl = L;
    return lvl;
  }

  /** المستوى التالي (أو null إن كان الأسطورة الأخير) */
  get nextLevel() {
    const idx = LEVELS.indexOf(this.level);
    return idx < LEVELS.length - 1 ? LEVELS[idx + 1] : null;
  }

  /** نسبة التقدم نحو المستوى التالي (0-100) */
  get levelProgress() {
    const cur = this.level;
    const nxt = this.nextLevel;
    if (!nxt) return 100;
    const span = nxt.min - cur.min;
    const done = this.data.points - cur.min;
    return Math.min(100, Math.round((done / span) * 100));
  }
}

export const player = new PlayerManager();
