/* ============================================================
   ZAMALEK LEGENDS – أسطورة الزمالك
   achievements.js : شارات الإنجازات + أوسمة الأقسام
   ============================================================ */

import { player } from './player.js';
import { SECTIONS, isSectionComplete, sectionCompletedCount } from './sections-manager.js';

/** عدد الأقسام التي لمس اللاعب مراحلها المكتملة فيها */
function completedSectionsCount() {
  return SECTIONS.filter(s => s.stages.some(id => player.isCompleted(id))).length;
}

/** عدد الأقسام المكتملة بالكامل */
function fullSectionsCount() {
  return SECTIONS.filter(s => isSectionComplete(s.id, player.data.completed)).length;
}

/** تعريف كل الشارات: كيف تُفتح (check تُستدعى بعد كل تغيير في التقدم) */
export const ACHIEVEMENTS = [
  {
    id: 'first_step', icon: '🌱', title: 'البذرة الأولى',
    desc: 'أكمل أول مرحلة في أي قسم من عالم الزمالك.',
    check: () => player.completedCount >= 1
  },
  {
    id: 'little_explorer', icon: '🐣', title: 'المستكشف الصغير',
    desc: 'أكمل مرحلة من قسم «عالم الصغار» — البداية الجميلة!',
    check: () => player.isCompleted(87) || player.isCompleted(88)
  },
  {
    id: 'historian', icon: '📜', title: 'مؤرخ القلعة',
    desc: 'أكمل 5 مراحل من مراحل العالم الزملكاوي.',
    check: () => player.completedCount >= 5
  },
  {
    id: 'history_hero', icon: '🏰', title: 'بطل التاريخ',
    desc: 'أكمل جميع مراحل قسم «حكاية الزمالك».',
    check: () => isSectionComplete('history', player.data.completed)
  },
  {
    id: 'info_king', icon: '🧠', title: 'ملك المعلومات',
    desc: 'أكمل جميع مراحل قسم «العبقري الصغير».',
    check: () => isSectionComplete('general', player.data.completed)
  },
  {
    id: 'sections_starter', icon: '🧭', title: 'جولة في الأقسام',
    desc: 'أكمل مراحل في 3 أقسام مختلفة على الأقل.',
    check: () => completedSectionsCount() >= 3
  },
  {
    id: 'halfway', icon: '🌗', title: 'نصف المشوار',
    desc: 'أكمل 10 مراحل — أنت في منتصف الطريق نحو الأسطورة.',
    check: () => player.completedCount >= 10
  },
  {
    id: 'full_journey', icon: '🏁', title: 'الرحلة الكبرى',
    desc: 'أكمل 30 مرحلة عبر عالم الزمالك.',
    check: () => player.completedCount >= 30
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
    id: 'box_opener', icon: '🎁', title: 'صائد المفاجآت',
    desc: 'افتح 5 صناديق مفاجآت بعد إكمال المراحل.',
    check: () => player.data.boxes >= 5
  },
  {
    id: 'fav_collector', icon: '❤️', title: 'قلب محب',
    desc: 'احفظ 5 معلومات جميلة في صفحة المفضلة.',
    check: () => player.data.favorites.length >= 5
  },
  {
    id: 'star_collector', icon: '⭐', title: 'جامع النجوم',
    desc: 'اجمع 25 نجمة عبر المراحل.',
    check: () => player.stageStars >= 25
  },
  {
    id: 'points_hunter', icon: '🎯', title: 'صائد النقاط',
    desc: 'تجاوز حاجز 1000 نقطة خبرة (XP).',
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
    check: () => player.isCompleted(17) || player.isCompleted(31)
  },
  {
    id: 'eagle_eye', icon: '🦅', title: 'عين النسر',
    desc: 'ارفع نسبة نجاحك الإجمالية إلى 80% أو أكثر.',
    check: () => player.totalAnswers >= 15 && player.accuracy >= 80
  },
  {
    id: 'half_sections', icon: '🏅', title: 'نصف الكنوز',
    desc: 'أكمل 5 أقسام كاملة من أقسام العالم الزملكاوي.',
    check: () => fullSectionsCount() >= 5
  },
  {
    id: 'all_sections', icon: '👑', title: 'ملك القلعة',
    desc: 'أكمل الأقسام العشرة كلها… أنت أسطورة حقيقية!',
    check: () => fullSectionsCount() >= SECTIONS.length
  },
  {
    id: 'pictures_eye', icon: '🖼️', title: 'عين الصقر الصغيرة',
    desc: 'أكمل مرحلة من قسم «تحدي الصور».',
    check: () => player.isCompleted(89) || player.isCompleted(90)
  }
];

/**
 * أوسمة الأقسام: تُحسب مباشرة من التقدم (لا تُخزن).
 * الوسام يُفتح بإكمال كل مراحل القسم.
 */
export function sectionMedals() {
  return SECTIONS.map(sec => {
    const done = sectionCompletedCount(sec.id, player.data.completed);
    const total = sec.stages.length;
    const complete = isSectionComplete(sec.id, player.data.completed);
    return {
      sectionId: sec.id,
      icon: '🎖️',
      emoji: sec.emoji,
      title: MEDAL_TITLES[sec.id] || `وسام ${sec.title}`,
      desc: `أكمل كل مراحل قسم «${sec.title}» (${done}/${total})`,
      progress: total ? Math.round((done / total) * 100) : 0,
      complete
    };
  });
}

/** عناوين أوسمة الأقسام العشرة */
export const MEDAL_TITLES = {
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
