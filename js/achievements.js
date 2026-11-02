/* ============================================================
   ZAMALEK LEGENDS – أسطورة الزمالك
   achievements.js : شارات الإنجازات القابلة للفتح
   ============================================================ */

import { player } from './player.js';

/** تعريف كل الشارات: كيف تُفتح (check تُستدعى بعد كل تغيير في التقدم) */
export const ACHIEVEMENTS = [
  {
    id: 'first_step', icon: '🌱', title: 'البذرة الأولى',
    desc: 'أكمل المرحلة الأولى «البدايات البيضاء».',
    check: () => player.isCompleted(1)
  },
  {
    id: 'historian', icon: '📜', title: 'مؤرخ القلعة',
    desc: 'أكمل 5 مراحل من خريطة التاريخ.',
    check: () => player.completedCount >= 5
  },
  {
    id: 'halfway', icon: '🌗', title: 'نصف المشوار',
    desc: 'أكمل 10 مراحل — أنت في منتصف الطريق نحو الأسطورة.',
    check: () => player.completedCount >= 10
  },
  {
    id: 'full_journey', icon: '🏁', title: 'الرحلة الكاملة',
    desc: 'أكمل المراحل العشرين كلها.',
    check: () => player.completedCount >= 20
  },
  {
    id: 'clean_heart', icon: '💎', title: 'قلب أبيض نقي',
    desc: 'أكمل مرحلة كاملة دون أي خطأ.',
    check: () => Object.values(player.data.completed).some(s => s.perfect)
  },
  {
    id: 'speed_hero', icon: '⚡', title: 'بطل السرعة',
    desc: 'أجب إجابة صحيحة على 5 أسئلة تحدي سرعة.',
    check: () => player.data.speedCorrect >= 5
  },
  {
    id: 'star_collector', icon: '⭐', title: 'جامع النجوم',
    desc: 'اجمع 25 نجمة عبر المراحل.',
    check: () => player.stageStars >= 25
  },
  {
    id: 'points_hunter', icon: '🎯', title: 'صائد النقاط',
    desc: 'تجاوز حاجز 1000 نقطة.',
    check: () => player.data.points >= 1000
  },
  {
    id: 'ency_reader', icon: '📚', title: 'موسوعي الزمالك',
    desc: 'اقرأ 10 بطاقات من موسوعة الزمالك.',
    check: () => player.data.encyReads.length >= 10
  },
  {
    id: 'derby_lover', icon: '🔥', title: 'عاشق القمة',
    desc: 'أكمل مرحلة «ليالي القمة» التاريخية.',
    check: () => player.isCompleted(17)
  },
  {
    id: 'legend_test', icon: '👑', title: 'الاختبار الأسطوري',
    desc: 'اجتز المرحلة العشرين الأخيرة.',
    check: () => player.isCompleted(20)
  },
  {
    id: 'eagle_eye', icon: '🦅', title: 'عين النسر',
    desc: 'ارفع نسبة نجاحك الإجمالية إلى 80% أو أكثر.',
    check: () => player.totalAnswers >= 15 && player.accuracy >= 80
  }
];

/**
 * فحص كل الشارات وفتح الجديد منها.
 * @returns {Array} قائمة الشارات المفتوحة حديثًا
 */
export function checkAchievements() {
  const unlockedNow = [];
  for (const ach of ACHIEVEMENTS) {
    if (player.data.achievements.includes(ach.id)) continue;
    let ok = false;
    try { ok = ach.check(); } catch { ok = false; }
    if (ok) {
      player.grantAchievement(ach.id);
      unlockedNow.push(ach);
    }
  }
  return unlockedNow;
}

export function getAchievementById(id) {
  return ACHIEVEMENTS.find(a => a.id === id) || null;
}
