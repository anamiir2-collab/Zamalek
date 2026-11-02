/* ============================================================
   ZAMALEK LEGENDS – أسطورة الزمالك
   progress-manager.js : نظام حفظ التقدم باستخدام LocalStorage
   ------------------------------------------------------------
   ملاحظات مهمة:
   - مفتاح الحفظ كما هو (zamalek_legends_save_v1) لضمان عدم
     فقدان تقدم اللاعبين الحاليين عند التحديث.
   - الحقول الجديدة (character, favorites, boxes, boxHistory…)
     تُدمج تلقائيًا مع الحفظ القديم عبر defaultSave().
   - لا نخزن أي بيانات شخصية للأطفال (اسم عرض اختياري فقط).
   ============================================================ */

const SAVE_KEY = 'zamalek_legends_save_v1';

/** الشكل الافتراضي لبيانات اللاعب */
export function defaultSave() {
  return {
    version: 2,
    name: '',
    character: '',       // الشخصية المختارة: zaki | zizi | captain | sage | '' (تخطي)
    points: 0,
    correct: 0,
    wrong: 0,
    completed: {},        // { [stageId]: { stars, best, perfect } }
    unlocked: [1],        // (تُحترم للتوافق مع الحفظ القديم — الفتح الفعلي يُحسب من الأقسام)
    achievements: [],     // معرفات الشارات المفتوحة
    favorites: [],        // المفضلة: { q, fact, stageId, sectionId, ts }
    boxes: 0,             // عدد صناديق المفاجآت المفتوحة
    boxHistory: [],       // آخر 20 مكافأة من الصناديق
    speedCorrect: 0,      // إجابات صحيحة في تحديات السرعة
    encyReads: [],        // بطاقات الموسوعة المقروءة
    lastStage: 1,         // آخر مرحلة لعبها اللاعب
    sound: true,
    theme: 'light'
  };
}

/** تحميل بيانات اللاعب (مع الدمج الآمن مع الشكل الافتراضي) */
export function loadSave() {
  try {
    const raw = localStorage.getItem(SAVE_KEY);
    if (!raw) return defaultSave();
    const parsed = JSON.parse(raw);
    if (typeof parsed !== 'object' || parsed === null) return defaultSave();
    // دمج آمن مع القيم الافتراضية لتفادي المفاتيح الناقصة
    const merged = { ...defaultSave(), ...parsed };
    // ترحيل آمن للمصفوفات/الكائنات إن كانت تالفة في حفظ قديم
    if (!Array.isArray(merged.favorites)) merged.favorites = [];
    if (!Array.isArray(merged.boxHistory)) merged.boxHistory = [];
    if (!Array.isArray(merged.unlocked)) merged.unlocked = [1];
    if (!Array.isArray(merged.achievements)) merged.achievements = [];
    if (!Array.isArray(merged.encyReads)) merged.encyReads = [];
    if (typeof merged.completed !== 'object' || merged.completed === null) merged.completed = {};
    return merged;
  } catch (err) {
    console.warn('تعذر تحميل التقدم المحفوظ، سيبدأ التقدم من جديد.', err);
    return defaultSave();
  }
}

/** حفظ بيانات اللاعب */
export function saveSave(data) {
  try {
    localStorage.setItem(SAVE_KEY, JSON.stringify(data));
  } catch (err) {
    console.warn('تعذر حفظ التقدم (قد تكون مساحة التخزين ممتلئة).', err);
  }
}

/** حذف التقدم بالكامل */
export function clearSave() {
  try {
    localStorage.removeItem(SAVE_KEY);
  } catch (err) {
    console.warn('تعذر حذف بيانات التقدم.', err);
  }
}

export const STORAGE_KEY = SAVE_KEY;
