/* ============================================================
   ZAMALEK LEGENDS – أسطورة الزمالك
   stages-manager.js : الفهرس المركزي للمراحل + التحميل الديناميكي
   ------------------------------------------------------------
   لإضافة مرحلة جديدة:
   1) أنشئ ملف js/stages/stage-XX.js يصدّر كائن المرحلة.
   2) سجّل سطرًا واحدًا في STAGES_INDEX أدناه.
   محرك اللعبة لا يحتاج أي تعديل.
   ============================================================ */

/** فهرس المراحل المركزي (بيانات العرض فقط — الأسئلة في الملفات) */
export const STAGES_INDEX = [
  { id: 1,  title: 'البدايات البيضاء',      subtitle: 'تأسيس النادي عام 1911',              icon: '📖', difficulty: 'easy',   points: 100, theme: 'linear-gradient(135deg,#eceff4,#b0bec5)' },
  { id: 2,  title: 'نادي قصر النيل',        subtitle: 'الاسم الأول للنادي',                 icon: '🏛️', difficulty: 'easy',   points: 100, theme: 'linear-gradient(135deg,#f5f5f5,#90a4ae)' },
  { id: 3,  title: 'عصر النادي المختلط',    subtitle: 'تحولات الاسم والهوية',               icon: '🤝', difficulty: 'easy',   points: 100, theme: 'linear-gradient(135deg,#cfd8dc,#78909c)' },
  { id: 4,  title: 'قاهر الأجانب',          subtitle: 'إنجازات مبكرة ضد الفرق الأجنبية',    icon: '⚔️', difficulty: 'medium', points: 110, theme: 'linear-gradient(135deg,#ef5350,#b71c1c)' },
  { id: 5,  title: 'نادي فاروق الأول',      subtitle: 'حقبة الاسم الملكي 1941',             icon: '👑', difficulty: 'medium', points: 110, theme: 'linear-gradient(135deg,#ffd54f,#c9930a)' },
  { id: 6,  title: 'ثورة يوليو',            subtitle: 'ميلاد اسم «الزمالك» 1952',           icon: '🇪🇬', difficulty: 'medium', points: 110, theme: 'linear-gradient(135deg,#4db6ac,#00695c)' },
  { id: 7,  title: 'مدرسة الفن والهندسة',   subtitle: 'هوية النادي وأسلوبه وألوانه',        icon: '🎨', difficulty: 'easy',   points: 100, theme: 'linear-gradient(135deg,#ffffff,#b0bec5)' },
  { id: 8,  title: 'ملوك الدوري',           subtitle: '15 لقبًا في الدوري المصري',          icon: '🏆', difficulty: 'medium', points: 120, theme: 'linear-gradient(135deg,#ff8a65,#d84315)' },
  { id: 9,  title: 'أبطال الكأس',           subtitle: '29 لقبًا في كأس مصر',                icon: '🥇', difficulty: 'medium', points: 120, theme: 'linear-gradient(135deg,#ba68c8,#6a1b9a)' },
  { id: 10, title: 'ملوك إفريقيا',          subtitle: 'خماسية دوري أبطال إفريقيا',          icon: '🌍', difficulty: 'hard',   points: 140, theme: 'linear-gradient(135deg,#4fc3f7,#01579b)' },
  { id: 11, title: 'السوبر الإفريقي',       subtitle: 'الإنجازات القارية الكبرى',           icon: '⭐', difficulty: 'hard',   points: 140, theme: 'linear-gradient(135deg,#9575cd,#4527a0)' },
  { id: 12, title: 'جيل التسعينات',         subtitle: 'نجوم العقد الذهبي',                  icon: '🌟', difficulty: 'medium', points: 120, theme: 'linear-gradient(135deg,#f06292,#ad1457)' },
  { id: 13, title: 'الجيل الذهبي',          subtitle: 'أبرز نجوم الألفينات',                icon: '💎', difficulty: 'medium', points: 120, theme: 'linear-gradient(135deg,#26c6da,#00838f)' },
  { id: 14, title: 'فرسان القلعة البيضاء',  subtitle: 'أساطير اللاعبين عبر الأجيال',        icon: '🐎', difficulty: 'medium', points: 120, theme: 'linear-gradient(135deg,#eeeeee,#616161)' },
  { id: 15, title: 'حراس العرين',           subtitle: 'تاريخ حراس مرمى الزمالك',            icon: '🧤', difficulty: 'medium', points: 120, theme: 'linear-gradient(135deg,#81c784,#2e7d32)' },
  { id: 16, title: 'صناع المجد',            subtitle: 'المدربون والرؤساء',                  icon: '🧠', difficulty: 'medium', points: 120, theme: 'linear-gradient(135deg,#ffb74d,#e65100)' },
  { id: 17, title: 'ليالي القمة',           subtitle: 'مباريات الزمالك والأهلي التاريخية',  icon: '🔥', difficulty: 'hard',   points: 140, theme: 'linear-gradient(135deg,#e57373,#8e0000)' },
  { id: 18, title: 'الأرقام القياسية',      subtitle: 'الهدافون والأكثر مشاركة',            icon: '📊', difficulty: 'hard',   points: 140, theme: 'linear-gradient(135deg,#a1887f,#4e342e)' },
  { id: 19, title: 'الرياضات الأخرى',       subtitle: 'اليد والسلة والطائرة وأكثر',         icon: '🏀', difficulty: 'easy',   points: 100, theme: 'linear-gradient(135deg,#fff176,#f9a825)' },
  { id: 20, title: 'الاختبار الأسطوري',     subtitle: 'اختبار شامل في تاريخ الزمالك',       icon: '🎯', difficulty: 'legend', points: 160, theme: 'linear-gradient(135deg,#7e57c2,#311b92)' },
  { id: 21, title: 'ملوك دوري أبطال إفريقيا', subtitle: 'رحلة الألقاب القارية الخمسة', icon: '🏆', difficulty: 'hard', points: 140, theme: 'linear-gradient(135deg,#f9a825,#ef6c00)' },
  { id: 22, title: 'أبطال الكونفدرالية', subtitle: 'ليالي المجد في كأس الاتحاد الإفريقي', icon: '🌍', difficulty: 'hard', points: 140, theme: 'linear-gradient(135deg,#26a69a,#00695c)' },
  { id: 23, title: 'كؤوس السوبر الإفريقي', subtitle: 'خمس محطات ذهبية في السوبر القاري', icon: '⭐', difficulty: 'hard', points: 140, theme: 'linear-gradient(135deg,#7e57c2,#4527a0)' },
  { id: 24, title: 'تاريخ كأس مصر', subtitle: 'محطات الزمالك في أقدم مسابقات الكأس المحلية', icon: '🥇', difficulty: 'medium', points: 120, theme: 'linear-gradient(135deg,#ba68c8,#6a1b9a)' },
  { id: 25, title: 'ملوك الدوري المصري', subtitle: 'رحلة الزمالك عبر مواسم الدوري الممتاز', icon: '🏆', difficulty: 'medium', points: 120, theme: 'linear-gradient(135deg,#ff8a65,#d84315)' },
  { id: 26, title: 'السوبر المصري', subtitle: 'مباريات حسم الكؤوس المحلية ومواجهات القمة', icon: '⚽', difficulty: 'medium', points: 120, theme: 'linear-gradient(135deg,#4db6ac,#00695c)' }
];

/** مسارات ملفات المراحل */
const REGISTRY = {
  1: './stages/stage-01.js',  2: './stages/stage-02.js',  3: './stages/stage-03.js',
  4: './stages/stage-04.js',  5: './stages/stage-05.js',  6: './stages/stage-06.js',
  7: './stages/stage-07.js',  8: './stages/stage-08.js',  9: './stages/stage-09.js',
  10: './stages/stage-10.js', 11: './stages/stage-11.js', 12: './stages/stage-12.js',
  13: './stages/stage-13.js', 14: './stages/stage-14.js', 15: './stages/stage-15.js',
  16: './stages/stage-16.js', 17: './stages/stage-17.js', 18: './stages/stage-18.js',
  19: './stages/stage-19.js', 20: './stages/stage-20.js',
  21: './stages/stage-21.js', 22: './stages/stage-22.js', 23: './stages/stage-23.js',
  24: './stages/stage-24.js', 25: './stages/stage-25.js', 26: './stages/stage-26.js'
};

/** مخزن مؤقت لتجنب التحميل المتكرر */
const cache = new Map();

/** بيانات عرض مرحلة من الفهرس */
export function getStageMeta(id) {
  return STAGES_INDEX.find(s => s.id === id) || null;
}

/**
 * تحميل بيانات مرحلة كاملة (بما فيها الأسئلة) عبر Dynamic Import.
 * @param {number} id معرف المرحلة
 * @returns {Promise<Object>} كائن المرحلة
 */
export async function loadStage(id) {
  const path = REGISTRY[id];
  if (!path) throw new Error(`لا توجد مرحلة مسجلة بالرقم ${id}`);
  if (cache.has(id)) return cache.get(id);
  try {
    const mod = await import(/* webpackIgnore: true */ path);
    const stage = mod.default;
    if (!stage || !Array.isArray(stage.questions) || stage.questions.length === 0) {
      throw new Error(`ملف المرحلة ${id} لا يحتوي أسئلة صالحة`);
    }
    // دمج بيانات العرض من الفهرس المركزي مع بيانات الملف
    const meta = getStageMeta(id);
    const merged = { ...meta, ...stage, id };
    cache.set(id, merged);
    return merged;
  } catch (err) {
    console.error(`خطأ أثناء تحميل المرحلة ${id}:`, err);
    throw new Error(`تعذر تحميل المرحلة رقم ${id}. تحقق من ملف ${path}`);
  }
}

/** عدد المراحل المسجلة */
export function stagesCount() {
  return STAGES_INDEX.length;
}
