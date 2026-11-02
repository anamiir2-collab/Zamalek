/* ============================================================
   ZAMALEK LEGENDS – أسطورة الزمالك
   player.js : إدارة اللاعب والمستويات
   ============================================================ */

import { loadSave, saveSave, clearSave, defaultSave } from './storage.js';

/** مستويات اللاعب بحسب إجمالي النقاط */
export const LEVELS = [
  { name: 'مشجع جديد', min: 0, icon: '🎫' },
  { name: 'زملكاوي أصيل', min: 350, icon: '⚪' },
  { name: 'عاشق القلعة البيضاء', min: 950, icon: '🏰' },
  { name: 'فارس أبيض', min: 1750, icon: '🐎' },
  { name: 'أسطورة الزمالك', min: 2500, icon: '👑' }
];

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
      // فتح المرحلة التالية
      const next = stageId + 1;
      if (!this.data.unlocked.includes(next)) this.data.unlocked.push(next);
    }
    this.data.lastStage = stageId;
    this.persist();
  }

  setLastStage(stageId) {
    this.data.lastStage = stageId;
    this.persist();
  }

  isUnlocked(stageId) {
    return this.data.unlocked.includes(stageId);
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
