/* ============================================================
   ZAMALEK LEGENDS – أسطورة الزمالك
   sections-manager.js : نظام الأقسام + الفهرس المركزي + التحميل
   ------------------------------------------------------------
   البنية الجديدة: كل قسم مستقل في مجلده، وكل مرحلة لها ملف.

   لإضافة مرحلة جديدة لقسم موجود:
   1) أنشئ ملف js/sections/<القسم>/stage-XX.js يصدّر كائن المرحلة.
   2) أضف بيانات عرضه إلى NEW_STAGE_METAS أدناه.
   3) أضف رقمه إلى قائمة stages الخاصة بقسم في SECTIONS
      ومساره في REGISTRY.

   لإضافة قسم جديد:
   1) أنشئ مجلد js/sections/<id>/ وضع فيه ملفات المراحل.
   2) أضف كائن قسم إلى SECTIONS (العنوان، الإيموجي، الألوان،
      الشخصية المرافقة، قائمة المراحل).
   لا يحتاج محرك اللعبة أي تعديل.
   ============================================================ */

/* ============================================================
   1) تعريف الأقسام العشرة
   character: الشخصية الكرتونية المرافقة (انظر characters.js)
   c1/c2: تدرج لون البطاقة الكرتونية
   ============================================================ */
export const SECTIONS = [
  {
    id: 'history', emoji: '🏰', title: 'حكاية الزمالك',
    desc: 'قصة النادي من الميلاد عام 1911 حتى القلعة البيضاء',
    character: 'sage', c1: '#FFE9D6', c2: '#FFB37E',
    stages: [71, 72, 1, 2, 3, 4, 5, 6, 7, 33]
  },
  {
    id: 'football', emoji: '⚽', title: 'عالم كرة القدم',
    desc: 'قوانين اللعبة والمراكز والمهارات والتكتيكات',
    character: 'captain', c1: '#DFF5E3', c2: '#7BC96F',
    stages: [73, 74, 38, 40, 41, 47, 49, 53, 54, 55, 56, 57, 60, 61, 66, 68]
  },
  {
    id: 'legends', emoji: '👑', title: 'نجوم وأبطال الزمالك',
    desc: 'اللاعبون والمدربون والأساطير عبر الأجيال',
    character: 'captain', c1: '#FFE3EC', c2: '#F78FB3',
    stages: [75, 76, 12, 13, 14, 15, 16, 27, 28, 29, 30, 42, 58, 67]
  },
  {
    id: 'championships', emoji: '🏆', title: 'كنز البطولات',
    desc: 'خزنة الكؤوس: الدوري والكأس والمجد الإفريقي',
    character: 'sage', c1: '#FFF3C9', c2: '#FFC93C',
    stages: [77, 78, 8, 9, 10, 11, 21, 22, 23, 24, 25, 32, 39, 43, 45, 48, 51, 52, 59, 63]
  },
  {
    id: 'fans', emoji: '❤️', title: 'حكايات الجماهير',
    desc: 'التشجيع والملعب وليالي القمة التاريخية',
    character: 'zaki', c1: '#FFEDE3', c2: '#FF9E7E',
    stages: [79, 80, 17, 26, 31, 34, 44]
  },
  {
    id: 'general', emoji: '🧠', title: 'العبقري الصغير',
    desc: 'معلومات عامة ممتعة عن الزمالك وكرة القدم',
    character: 'zaki', c1: '#EDE7FF', c2: '#B39DDB',
    stages: [81, 82, 18, 50, 62]
  },
  {
    id: 'challenges', emoji: '🌟', title: 'تحدي الأبطال',
    desc: 'أسئلة أصعب لمن يريد أن يتحدى نفسه!',
    character: 'sage', c1: '#FFE5E5', c2: '#E53935',
    stages: [83, 84, 20, 70]
  },
  {
    id: 'other-sports', emoji: '🏀', title: 'أبطال الألعاب الأخرى',
    desc: 'كرة السلة واليد والطائرة ورياضات كثيرة',
    character: 'zizi', c1: '#E0F2F1', c2: '#26A69A',
    stages: [85, 86, 19, 35, 36, 37, 46, 64, 65, 69]
  },
  {
    id: 'kids', emoji: '🐣', title: 'عالم الصغار',
    desc: 'أسئلة سهلة ولطيفة لأول خطوة في عالم الزمالك',
    character: 'zizi', c1: '#FFF9E6', c2: '#FFD54F',
    stages: [87, 88]
  },
  {
    id: 'pictures', emoji: '🎨', title: 'تحدي الصور',
    desc: 'تعرف على الرموز والأشكال والألوان الزملكاوية',
    character: 'zizi', c1: '#F3E5F5', c2: '#BA68C8',
    stages: [89, 90]
  }
];

/* ============================================================
   2) فهرس المراحل: بيانات العرض فقط — الأسئلة في ملفاتها
   (المراحل 1-70 موجودة في مستودع سابق وأرقامها محفوظة
    للحفاظ على تقدم اللاعبين، والمراحل 71-90 جديدة)
   ============================================================ */
const BASE_INDEX = [
  { id: 1,  title: 'البدايات البيضاء',      subtitle: 'تأسيس النادي عام 1911',              icon: '📖', difficulty: 'easy',   points: 100, theme: 'linear-gradient(135deg,#eceff4,#b0bec5)' },
  { id: 2,  title: 'نادي قصر النيل',        subtitle: 'الاسم الأول للنادي',                 icon: '🏛️', difficulty: 'easy',   points: 100, theme: 'linear-gradient(135deg,#f5f5f5,#90a4ae)' },
  { id: 3,  title: 'عصر النادي المختلط',    subtitle: 'تحولات الاسم والهوية',               icon: '🤝', difficulty: 'easy',   points: 100, theme: 'linear-gradient(135deg,#cfd8dc,#78909c)' },
  { id: 4,  title: 'قاهر الأجانب',          subtitle: 'إنجازات مبكرة ضد الفرق الأجنبية',    icon: '⚔️', difficulty: 'medium', points: 110, theme: 'linear-gradient(135deg,#ef5350,#b71c1c)' },
  { id: 5,  title: 'نادي فاروق الأول',      subtitle: 'حقبة الاسم الملكي 1941',             icon: '👑', difficulty: 'medium', points: 110, theme: 'linear-gradient(135deg,#ffd54f,#c9930a)' },
  { id: 6,  title: 'ثورة يوليو',            subtitle: 'ميلاد اسم «الزمالك» 1952',           icon: '🇪🇬', difficulty: 'medium', points: 110, theme: 'linear-gradient(135deg,#4db6ac,#00695c)' },
  { id: 7,  title: 'مدرسة الفن والهندسة',   subtitle: 'هوية النادي وأسلوبه وألوانه',        icon: '🎨', difficulty: 'easy',   points: 100, theme: 'linear-gradient(135deg,#ffffff,#b0bec5)' },
  { id: 8,  title: 'ملوك الدوري',           subtitle: '15 لقبًا في الدوري المصري',          icon: '🏆', difficulty: 'medium', points: 120, theme: 'linear-gradient(135deg,#ff8a65,#d84315)' },
  { id: 9,  title: 'أبطال الكأس',           subtitle: '29 لقبًا في كأس مصر',                icon: '🥇', difficulty: 'medium', points: 120, theme: 'linear-gradient(135deg,#ba68c8,#6a1b9a)' },
  { id: 10, title: 'ملوك إفريقيا',          subtitle: 'خماسية دوري الأبطال',                icon: '🌍', difficulty: 'hard',   points: 140, theme: 'linear-gradient(135deg,#4fc3f7,#01579b)' },
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
  { id: 26, title: 'السوبر المصري', subtitle: 'مباريات حسم الكؤوس المحلية ومواجهات القمة', icon: '⚽', difficulty: 'medium', points: 120, theme: 'linear-gradient(135deg,#4db6ac,#00695c)' },
  { id: 27, title: 'نجوم القلعة البيضاء', subtitle: 'أسماء صنعت لحظات لا تُنسى', icon: '🌟', difficulty: 'medium', points: 120, theme: 'linear-gradient(135deg,#f06292,#ad1457)' },
  { id: 28, title: 'حراس العرين الأبيض', subtitle: 'حراس مرمى ارتدوا قميص الزمالك', icon: '🧤', difficulty: 'medium', points: 120, theme: 'linear-gradient(135deg,#81c784,#2e7d32)' },
  { id: 29, title: 'مدربو الزمالك', subtitle: 'المدربون في المحطات التاريخية', icon: '🧠', difficulty: 'medium', points: 120, theme: 'linear-gradient(135deg,#ffb74d,#e65100)' },
  { id: 30, title: 'نجوم من مصر والعالم', subtitle: 'لاعبون دوليون مرّوا على تاريخ الزمالك', icon: '🌍', difficulty: 'medium', points: 120, theme: 'linear-gradient(135deg,#26c6da,#00838f)' },
  { id: 31, title: 'ليالي القمة', subtitle: 'مواجهات الزمالك والأهلي ومعاني الديربي', icon: '🔥', difficulty: 'hard', points: 140, theme: 'linear-gradient(135deg,#e57373,#8e0000)' },
  { id: 32, title: 'خصوم الزمالك في إفريقيا', subtitle: 'الأندية والدول التي واجهها الزمالك قاريًا', icon: '🌍', difficulty: 'hard', points: 140, theme: 'linear-gradient(135deg,#4fc3f7,#01579b)' },
  { id: 33, title: 'استادات الزمالك', subtitle: 'الملاعب المصرية التي استضافت الفريق', icon: '🏟️', difficulty: 'medium', points: 120, theme: 'linear-gradient(135deg,#90a4ae,#455a64)' },
  { id: 34, title: 'هوية الزمالك وجماهيره', subtitle: 'الألوان والشعار والثقافة الكروية', icon: '⚪', difficulty: 'easy', points: 100, theme: 'linear-gradient(135deg,#ffffff,#b0bec5)' },
  { id: 35, title: 'سلة الزمالك', subtitle: 'إنجازات كرة السلة وقواعد اللعبة', icon: '🏀', difficulty: 'medium', points: 120, theme: 'linear-gradient(135deg,#fff176,#f9a825)' },
  { id: 36, title: 'يد الزمالك', subtitle: 'كرة اليد وقواعدها وإنجازات الفريق', icon: '🤾', difficulty: 'medium', points: 120, theme: 'linear-gradient(135deg,#4db6ac,#00695c)' },
  { id: 37, title: 'طائرة الزمالك', subtitle: 'كرة الطائرة ومهاراتها وقواعدها', icon: '🏐', difficulty: 'easy', points: 100, theme: 'linear-gradient(135deg,#81d4fa,#0277bd)' },
  { id: 38, title: 'قواعد كرة القدم', subtitle: 'قوانين اللعبة التي يخوض بها الزمالك مبارياته', icon: '⚽', difficulty: 'easy', points: 100, theme: 'linear-gradient(135deg,#a5d6a7,#2e7d32)' },
  { id: 39, title: 'محطات زملكاوية حديثة', subtitle: 'سنوات ونتائج صنعت حضور الزمالك', icon: '🏆', difficulty: 'medium', points: 120, theme: 'linear-gradient(135deg,#ffb74d,#e65100)' },
  { id: 40, title: 'مراكز لاعبي الزمالك', subtitle: 'أدوار اللاعبين ومهامهم داخل الملعب', icon: '⚽', difficulty: 'easy', points: 100, theme: 'linear-gradient(135deg,#a5d6a7,#2e7d32)' },
  { id: 41, title: 'بطولات إفريقيا وقوانينها', subtitle: 'مسابقات الأندية الإفريقية وأنظمتها', icon: '🌍', difficulty: 'hard', points: 140, theme: 'linear-gradient(135deg,#4fc3f7,#01579b)' },
  { id: 42, title: 'الزمالك والمنتخبات', subtitle: 'لاعبون ومدربون ارتبطوا بالمنتخبات', icon: '🇪🇬', difficulty: 'medium', points: 120, theme: 'linear-gradient(135deg,#4db6ac,#00695c)' },
  { id: 43, title: 'ثنائية الزمالك 2015', subtitle: 'موسم جمع فيه الزمالك بين الدوري والكأس', icon: '🏆', difficulty: 'medium', points: 120, theme: 'linear-gradient(135deg,#ffb74d,#e65100)' },
  { id: 44, title: 'نهائي القرن الإفريقي', subtitle: 'مواجهة الزمالك والأهلي في نهائي 2020', icon: '🔥', difficulty: 'hard', points: 140, theme: 'linear-gradient(135deg,#e57373,#8e0000)' },
  { id: 45, title: 'مشوار الكونفدرالية 2024', subtitle: 'محطات الزمالك في طريق اللقب القاري الثاني', icon: '🌍', difficulty: 'hard', points: 140, theme: 'linear-gradient(135deg,#26a69a,#00695c)' },
  { id: 46, title: 'الرياضة داخل نادي الزمالك', subtitle: 'التنوع الرياضي والألعاب الجماعية بالنادي', icon: '🏅', difficulty: 'medium', points: 120, theme: 'linear-gradient(135deg,#fff176,#f9a825)' },
  { id: 47, title: 'مصطلحات كروية', subtitle: 'مصطلحات تكتيكية وتحكيمية في كرة القدم', icon: '📘', difficulty: 'medium', points: 120, theme: 'linear-gradient(135deg,#90caf9,#1565c0)' },
  { id: 48, title: 'مدن الكرة الإفريقية', subtitle: 'مدن وأماكن أندية واجهها الزمالك', icon: '🌍', difficulty: 'medium', points: 120, theme: 'linear-gradient(135deg,#26a69a,#00695c)' },
  { id: 49, title: 'تاريخ كرة القدم المصرية', subtitle: 'البطولات والاتحاد والمنتخبات المصرية', icon: '🇪🇬', difficulty: 'medium', points: 120, theme: 'linear-gradient(135deg,#4db6ac,#00695c)' },
  { id: 50, title: 'اختبار الزمالك الشامل', subtitle: 'مراجعة متنوعة في تاريخ النادي وألعابه', icon: '🎯', difficulty: 'medium', points: 120, theme: 'linear-gradient(135deg,#7e57c2,#311b92)' },
  { id: 51, title: 'المنافسات المحلية المصرية', subtitle: 'الدوري والكأس والسوبر المصري', icon: '🏆', difficulty: 'medium', points: 120, theme: 'linear-gradient(135deg,#ffb74d,#e65100)' },
  { id: 52, title: 'المسابقات القارية للأندية', subtitle: 'بطولات إفريقيا ومراحلها', icon: '🌍', difficulty: 'hard', points: 140, theme: 'linear-gradient(135deg,#4fc3f7,#01579b)' },
  { id: 53, title: 'خطط كرة القدم', subtitle: 'مبادئ تكتيكية لفهم طريقة اللعب', icon: '🧠', difficulty: 'medium', points: 120, theme: 'linear-gradient(135deg,#9575cd,#4527a0)' },
  { id: 54, title: 'قراءة أرقام المباراة', subtitle: 'إحصائيات كرة القدم وكيفية فهمها', icon: '📊', difficulty: 'medium', points: 120, theme: 'linear-gradient(135deg,#a1887f,#4e342e)' },
  { id: 55, title: 'بطولات المنتخبات الإفريقية', subtitle: 'تاريخ كأس الأمم الإفريقية ونظامها', icon: '🇪🇬', difficulty: 'medium', points: 120, theme: 'linear-gradient(135deg,#4db6ac,#00695c)' },
  { id: 56, title: 'قوانين التحكيم', subtitle: 'الحكام والبطاقات والقرارات', icon: '🟨', difficulty: 'medium', points: 120, theme: 'linear-gradient(135deg,#ffca28,#f57f17)' },
  { id: 57, title: 'إدارة الفريق والموسم', subtitle: 'الجهاز الفني والإداري داخل الفريق', icon: '🧠', difficulty: 'medium', points: 120, theme: 'linear-gradient(135deg,#9575cd,#4527a0)' },
  { id: 58, title: 'الزمالك عبر الأجيال', subtitle: 'أسماء وأدوار وحقب في تاريخ الفريق', icon: '🌟', difficulty: 'medium', points: 120, theme: 'linear-gradient(135deg,#f06292,#ad1457)' },
  { id: 59, title: 'الزمالك في المنافسات الدولية', subtitle: 'مفاهيم عن مشاركات الأندية خارج القارة', icon: '🌍', difficulty: 'hard', points: 140, theme: 'linear-gradient(135deg,#4fc3f7,#01579b)' },
  { id: 60, title: 'التدريب واللياقة', subtitle: 'أساسيات إعداد لاعبي كرة القدم بدنيًا', icon: '💪', difficulty: 'medium', points: 120, theme: 'linear-gradient(135deg,#81c784,#2e7d32)' },
  { id: 61, title: 'مهارات كرة القدم', subtitle: 'التمرير والتسديد والمراوغة والاستقبال', icon: '⚽', difficulty: 'medium', points: 120, theme: 'linear-gradient(135deg,#a5d6a7,#2e7d32)' },
  { id: 62, title: 'معلومات متنوعة عن الزمالك', subtitle: 'أسئلة عامة عن النادي وتاريخه وألعابه', icon: '🎯', difficulty: 'medium', points: 120, theme: 'linear-gradient(135deg,#7e57c2,#311b92)' },
  { id: 63, title: 'ألقاب الزمالك القارية', subtitle: 'سنوات وأسماء بطولات الزمالك الإفريقية', icon: '🏆', difficulty: 'hard', points: 140, theme: 'linear-gradient(135deg,#4fc3f7,#01579b)' },
  { id: 64, title: 'قواعد كرة السلة', subtitle: 'معلومات أساسية عن قوانين كرة السلة', icon: '🏀', difficulty: 'medium', points: 120, theme: 'linear-gradient(135deg,#fff176,#f9a825)' },
  { id: 65, title: 'قواعد كرة اليد والطائرة', subtitle: 'معلومات عن لعبتين جماعيتين في النادي', icon: '🏐', difficulty: 'medium', points: 120, theme: 'linear-gradient(135deg,#4db6ac,#00695c)' },
  { id: 66, title: 'مفاهيم كرة القدم المتقدمة', subtitle: 'تطبيقات ومواقف داخل الملعب', icon: '🧠', difficulty: 'medium', points: 120, theme: 'linear-gradient(135deg,#9575cd,#4527a0)' },
  { id: 67, title: 'أساطير القلعة البيضاء', subtitle: 'نجوم وشخصيات ارتبطت بتاريخ الزمالك', icon: '🌟', difficulty: 'medium', points: 120, theme: 'linear-gradient(135deg,#f06292,#ad1457)' },
  { id: 68, title: 'قوانين ومواقف المباراة', subtitle: 'أسئلة تطبيقية في قوانين كرة القدم', icon: '⚖️', difficulty: 'medium', points: 120, theme: 'linear-gradient(135deg,#ffca28,#f57f17)' },
  { id: 69, title: 'رياضات الزمالك الأخرى', subtitle: 'معلومات عن ألعاب جماعية وفردية متنوعة', icon: '🏅', difficulty: 'medium', points: 120, theme: 'linear-gradient(135deg,#fff176,#f9a825)' },
  { id: 70, title: 'التحدي الأبيض الأخير', subtitle: 'اختبار نهائي متنوع في الزمالك وكرة القدم', icon: '🎯', difficulty: 'legend', points: 160, theme: 'linear-gradient(135deg,#7e57c2,#311b92)' }
];

/** بيانات عرض المراحل الجديدة (71-90) — مرحلة لطيفة لكل قسم */
const NEW_STAGE_METAS = [
  { id: 71, title: 'يلا نكتشف البداية!',      subtitle: 'قصة ميلاد القلعة البيضاء للصغار',   icon: '🎉', difficulty: 'easy',   points: 100 },
  { id: 72, title: 'أسماء النادي الملونة',    subtitle: 'من قصر النيل إلى الزمالك',           icon: '🌈', difficulty: 'easy',   points: 100 },
  { id: 73, title: 'كرة القدم للمبتدئين',     subtitle: 'قوانين اللعبة المفضلة عندك',         icon: '⚽', difficulty: 'easy',   points: 100 },
  { id: 74, title: 'مركزك المفضل؟',           subtitle: 'الحراسة والدفاع والوسط والهجوم',     icon: '🎯', difficulty: 'easy',   points: 110 },
  { id: 75, title: 'تعال نتعرف على النجوم!',  subtitle: 'أساطير الزمالك بأسلوب مرح',          icon: '🌟', difficulty: 'easy',   points: 110 },
  { id: 76, title: 'مين أنا؟ ألغاز النجوم',   subtitle: 'تلميحات لطيفة تخمّن بها النجم',      icon: '🕵️', difficulty: 'medium', points: 120 },
  { id: 77, title: 'خزنة الكؤوس السحرية',     subtitle: 'أشهر ألقاب الزمالك الكبرى',          icon: '🏆', difficulty: 'medium', points: 120 },
  { id: 78, title: 'نجوم القارة السمراء',     subtitle: 'مغامرات الزمالك في إفريقيا',         icon: '🌍', difficulty: 'medium', points: 130 },
  { id: 79, title: 'يلا نشجع صح!',            subtitle: 'آداب التشجيع والاحترام الجميل',      icon: '📣', difficulty: 'easy',   points: 100 },
  { id: 80, title: 'ليل القمة الكبير',        subtitle: 'قصة أشهر مباراة: الزمالك والأهلي',   icon: '🔥', difficulty: 'medium', points: 120 },
  { id: 81, title: 'تحدي المعلومات الممتعة',  subtitle: 'أسئلة لطيفة من كل مكان',             icon: '🧠', difficulty: 'easy',   points: 110 },
  { id: 82, title: 'معلومات سريعة ومظبوطة',   subtitle: 'تحدي العبقري الصغير',                icon: '💡', difficulty: 'medium', points: 120 },
  { id: 83, title: 'تحدّي الأبطال الحقيقي',   subtitle: 'أسئلة أصعب لعقلك الشاطر',            icon: '⚔️', difficulty: 'hard',   points: 140 },
  { id: 84, title: 'غرفة الأبطال الأخيرة',    subtitle: 'الاختبار الذي يتمناه كل بطل',        icon: '👑', difficulty: 'hard',   points: 150 },
  { id: 85, title: 'بطل بين الرياضات!',       subtitle: 'سلة ويد وطائرة وأكثر',               icon: '🏀', difficulty: 'easy',   points: 110 },
  { id: 86, title: 'قواعد الألعاب الجميلة',   subtitle: 'كيف نلعب السلة واليد والطائرة؟',     icon: '🤾', difficulty: 'medium', points: 120 },
  { id: 87, title: 'أول خطوة للزملكاوي الصغير', subtitle: 'أسهل أسئلة القلعة البيضاء',        icon: '🐣', difficulty: 'easy',   points: 100 },
  { id: 88, title: 'ألواني الجميلة',          subtitle: 'أبيض وأحمر ولا شيء غيرهما!',         icon: '🎨', difficulty: 'easy',   points: 100 },
  { id: 89, title: 'عين الصقر: رموز القلعة',  subtitle: 'تعرف على الرموز من صورها',           icon: '🦅', difficulty: 'easy',   points: 110 },
  { id: 90, title: 'غرفة الصور السحرية',      subtitle: 'صور وأشكال وألوان ممتعة',            icon: '🖼️', difficulty: 'medium', points: 120 }
];

/** الفهرس الكامل: القديم + الجديد */
export const STAGES_INDEX = [...BASE_INDEX, ...NEW_STAGE_METAS];

/** ألوان عرض المراحل الجديدة (تُدمج تلقائيًا) */
const NEW_THEMES = {
  71: 'linear-gradient(135deg,#FFE9D6,#FFB37E)', 72: 'linear-gradient(135deg,#FFF9E6,#FFD54F)',
  73: 'linear-gradient(135deg,#DFF5E3,#7BC96F)', 74: 'linear-gradient(135deg,#DFF5E3,#4CAF50)',
  75: 'linear-gradient(135deg,#FFE3EC,#F78FB3)', 76: 'linear-gradient(135deg,#FCE4EC,#EC407A)',
  77: 'linear-gradient(135deg,#FFF3C9,#FFC93C)', 78: 'linear-gradient(135deg,#E0F2F1,#00897B)',
  79: 'linear-gradient(135deg,#FFEDE3,#FF9E7E)', 80: 'linear-gradient(135deg,#FFE5E5,#E53935)',
  81: 'linear-gradient(135deg,#EDE7FF,#B39DDB)', 82: 'linear-gradient(135deg,#EDE7FF,#7E57C2)',
  83: 'linear-gradient(135deg,#FFE5E5,#E53935)', 84: 'linear-gradient(135deg,#FFEBEE,#B71C1C)',
  85: 'linear-gradient(135deg,#E0F2F1,#26A69A)', 86: 'linear-gradient(135deg,#E0F7FA,#0097A7)',
  87: 'linear-gradient(135deg,#FFF9E6,#FFD54F)', 88: 'linear-gradient(135deg,#FFECB3,#FFA000)',
  89: 'linear-gradient(135deg,#F3E5F5,#BA68C8)', 90: 'linear-gradient(135deg,#E1BEE7,#8E24AA)'
};
for (const m of NEW_STAGE_METAS) if (NEW_THEMES[m.id]) m.theme = NEW_THEMES[m.id];

/* ============================================================
   3) مسارات ملفات المراحل (كل مرحلة في مجلد قسمها)
   ============================================================ */
const REGISTRY = {
  1: './sections/history/stage-01.js', 2: './sections/history/stage-02.js',
  3: './sections/history/stage-03.js', 4: './sections/history/stage-04.js',
  5: './sections/history/stage-05.js', 6: './sections/history/stage-06.js',
  7: './sections/history/stage-07.js', 33: './sections/history/stage-33.js',
  71: './sections/history/stage-71.js', 72: './sections/history/stage-72.js',

  38: './sections/football/stage-38.js', 40: './sections/football/stage-40.js',
  41: './sections/football/stage-41.js', 47: './sections/football/stage-47.js',
  49: './sections/football/stage-49.js', 53: './sections/football/stage-53.js',
  54: './sections/football/stage-54.js', 55: './sections/football/stage-55.js',
  56: './sections/football/stage-56.js', 57: './sections/football/stage-57.js',
  60: './sections/football/stage-60.js', 61: './sections/football/stage-61.js',
  66: './sections/football/stage-66.js', 68: './sections/football/stage-68.js',
  73: './sections/football/stage-73.js', 74: './sections/football/stage-74.js',

  12: './sections/legends/stage-12.js', 13: './sections/legends/stage-13.js',
  14: './sections/legends/stage-14.js', 15: './sections/legends/stage-15.js',
  16: './sections/legends/stage-16.js', 27: './sections/legends/stage-27.js',
  28: './sections/legends/stage-28.js', 29: './sections/legends/stage-29.js',
  30: './sections/legends/stage-30.js', 42: './sections/legends/stage-42.js',
  58: './sections/legends/stage-58.js', 67: './sections/legends/stage-67.js',
  75: './sections/legends/stage-75.js', 76: './sections/legends/stage-76.js',

  8: './sections/championships/stage-08.js', 9: './sections/championships/stage-09.js',
  10: './sections/championships/stage-10.js', 11: './sections/championships/stage-11.js',
  21: './sections/championships/stage-21.js', 22: './sections/championships/stage-22.js',
  23: './sections/championships/stage-23.js', 24: './sections/championships/stage-24.js',
  25: './sections/championships/stage-25.js', 32: './sections/championships/stage-32.js',
  39: './sections/championships/stage-39.js', 43: './sections/championships/stage-43.js',
  45: './sections/championships/stage-45.js', 48: './sections/championships/stage-48.js',
  51: './sections/championships/stage-51.js', 52: './sections/championships/stage-52.js',
  59: './sections/championships/stage-59.js', 63: './sections/championships/stage-63.js',
  77: './sections/championships/stage-77.js', 78: './sections/championships/stage-78.js',

  17: './sections/fans/stage-17.js', 26: './sections/fans/stage-26.js',
  31: './sections/fans/stage-31.js', 34: './sections/fans/stage-34.js',
  44: './sections/fans/stage-44.js',
  79: './sections/fans/stage-79.js', 80: './sections/fans/stage-80.js',

  18: './sections/general/stage-18.js', 50: './sections/general/stage-50.js',
  62: './sections/general/stage-62.js',
  81: './sections/general/stage-81.js', 82: './sections/general/stage-82.js',

  20: './sections/challenges/stage-20.js', 70: './sections/challenges/stage-70.js',
  83: './sections/challenges/stage-83.js', 84: './sections/challenges/stage-84.js',

  19: './sections/other-sports/stage-19.js', 35: './sections/other-sports/stage-35.js',
  36: './sections/other-sports/stage-36.js', 37: './sections/other-sports/stage-37.js',
  46: './sections/other-sports/stage-46.js', 64: './sections/other-sports/stage-64.js',
  65: './sections/other-sports/stage-65.js', 69: './sections/other-sports/stage-69.js',
  85: './sections/other-sports/stage-85.js', 86: './sections/other-sports/stage-86.js',

  87: './sections/kids/stage-87.js', 88: './sections/kids/stage-88.js',
  89: './sections/pictures/stage-89.js', 90: './sections/pictures/stage-90.js'
};

/* ============================================================
   4) واجهات الأقسام
   ============================================================ */

/** بيانات قسم بالمعرف */
export function getSection(sectionId) {
  return SECTIONS.find(s => s.id === sectionId) || null;
}

/** القسم الذي تنتمي إليه مرحلة */
export function sectionOfStage(stageId) {
  return SECTIONS.find(s => s.stages.includes(stageId)) || null;
}

/** عدد المراحل المكتملة داخل قسم */
export function sectionCompletedCount(sectionId, completedMap) {
  const sec = getSection(sectionId);
  if (!sec) return 0;
  return sec.stages.filter(id => completedMap[id]).length;
}

/** نجوم قسم: مجموع نجوم مراحله */
export function sectionStars(sectionId, completedMap) {
  const sec = getSection(sectionId);
  if (!sec) return 0;
  return sec.stages.reduce((sum, id) => sum + ((completedMap[id] && completedMap[id].stars) || 0), 0);
}

/** هل اكتمل القسم بالكامل؟ (لمنح الوسام) */
export function isSectionComplete(sectionId, completedMap) {
  const sec = getSection(sectionId);
  return Boolean(sec) && sec.stages.every(id => completedMap[id]);
}

/**
 * منطق فتح المراحل التدريجي داخل القسم:
 * أول مرحلة في كل قسم مفتوحة دائمًا، وكل مرحلة تُفتح
 * بإكمال المرحلة التي تسبقها في نفس القسم.
 * @param {number} stageId
 * @param {Object} completedMap خريطة المراحل المكتملة من بيانات اللاعب
 */
export function isStageUnlocked(stageId, completedMap) {
  const sec = sectionOfStage(stageId);
  if (!sec) return true;
  const idx = sec.stages.indexOf(stageId);
  if (idx <= 0) return true;
  return Boolean(completedMap[sec.stages[idx - 1]]);
}

/** المرحلة التالية لنفس القسم (أو null إذا انتهى القسم) */
export function nextStageInSection(stageId) {
  const sec = sectionOfStage(stageId);
  if (!sec) return null;
  const idx = sec.stages.indexOf(stageId);
  if (idx === -1 || idx + 1 >= sec.stages.length) return null;
  return sec.stages[idx + 1];
}

/** القسم التالي غير المكتمل (لتنقل ذكي بعد نهاية قسم) */
export function nextUnfinishedSection(completedMap, afterSectionId = null) {
  const start = SECTIONS.findIndex(s => s.id === afterSectionId);
  for (let i = 0; i < SECTIONS.length; i++) {
    const j = (start + 1 + i) % SECTIONS.length;
    const sec = SECTIONS[j];
    if (sec.stages.some(id => !completedMap[id])) return sec;
  }
  return null;
}

/* ============================================================
   5) التحميل الديناميكي (كما في المشروع الأصلي مع تحسينات)
   ============================================================ */
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

/** التأكد من تسجيل كل مراحل الأقسام في REGISTRY (تشخيص تلقائي) */
export function validateRegistry() {
  const missing = [];
  for (const sec of SECTIONS) {
    for (const id of sec.stages) {
      if (!REGISTRY[id] || !getStageMeta(id)) missing.push(id);
    }
  }
  return missing;
}
