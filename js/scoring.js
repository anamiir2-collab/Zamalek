/* ============================================================
   ZAMALEK LEGENDS – أسطورة الزمالك
   scoring.js : نظام النقاط والنجوم
   ============================================================ */

export const SCORING = {
  base: 10,               // نقاط الإجابة الصحيحة الأساسية
  speedBonusMax: 5,       // أقصى مكافأة سرعة
  speedPenalty: -5,       // خصم الخطأ في تحدي السرعة
  decisiveMultiplier: 2,  // مضاعف سؤال الحسم
  stageCompleteBonus: 20, // مكافأة اجتياز المرحلة
  perfectBonus: 15        // مكافأة المرحلة بلا أخطاء
};

/** نجوم المرحلة بحسب نسبة الإجابات الصحيحة */
export function starsFromRatio(ratio) {
  if (ratio >= 0.85) return 3;
  if (ratio >= 0.65) return 2;
  if (ratio >= 0.5) return 1;
  return 0;
}

/** هل اجتاز اللاعب المرحلة؟ */
export function isPassed(ratio) {
  return ratio >= 0.5;
}

/**
 * حساب نقاط سؤال واحد
 * @param {boolean} correct هل الإجابة صحيحة؟
 * @param {string} type نوع السؤال
 * @param {number} remainingRatio نسبة الوقت المتبقي (0-1)
 * @param {boolean} decisive هل هو سؤال حسم؟
 */
export function questionPoints(correct, type, remainingRatio, decisive) {
  if (!correct) {
    return type === 'speed' ? SCORING.speedPenalty : 0;
  }
  let pts = SCORING.base;
  // مكافأة السرعة: تتدرج مع الوقت المتبقي
  const speedBonus = Math.max(0, Math.min(SCORING.speedBonusMax, Math.ceil(remainingRatio * SCORING.speedBonusMax)));
  pts += speedBonus;
  if (decisive) pts *= SCORING.decisiveMultiplier;
  return pts;
}

/** وصف نصي لمستوى الصعوبة */
export const DIFFICULTY_LABELS = {
  easy: 'سهل',
  medium: 'متوسط',
  hard: 'صعب',
  legend: 'أسطوري'
};
