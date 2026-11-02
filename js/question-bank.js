/* ============================================================
   ZAMALEK LEGENDS — بنك الأسئلة الموسّع
   20 مرحلة × 50 سؤال قابل للعب = 1000 سؤال.
   يحوّل أسئلة الحقائق الأصلية إلى أنماط اختبار مختلفة
   (اختيار، سرعة، أكمل، صح/خطأ) مع الحفاظ على الإجابة.
   ============================================================ */

function cloneQuestion(q, id, patch = {}) {
  return { ...q, ...patch, id };
}

function makeVariants(q, index) {
  const out = [];
  const answer = typeof q.answer === 'string' ? q.answer : null;
  const options = Array.isArray(q.options) ? q.options : [];
  const wrong = options.find(option => option !== answer);

  // السؤال الأصلي كما ورد في ملف المرحلة.
  out.push(cloneQuestion(q, index * 10 + 1));

  // تحدي سرعة بنفس المعلومة والاختيارات.
  if (q.type !== 'order' && options.length && answer !== null) {
    out.push(cloneQuestion(q, index * 10 + 2, {
      type: 'speed',
      time: 15,
      question: '⚡ أجب بسرعة: ' + q.question
    }));

    // صياغة إكمال للمعلومة.
    out.push(cloneQuestion(q, index * 10 + 3, {
      type: 'complete',
      question: 'أكمل المعلومة الزملكاوية: ' + q.question
    }));

    // اختبار فهم المعلومة بصيغة صح/خطأ.
    out.push(cloneQuestion(q, index * 10 + 4, {
      type: 'truefalse',
      question: 'صح أم خطأ: ' + q.question + ' الإجابة هي «' + answer + '».',
      answer: 'صح',
      options: undefined,
      image: undefined
    }));

    // عبارة خاطئة مشتقة من أحد الاختيارات غير الصحيحة.
    if (wrong !== undefined) {
      out.push(cloneQuestion(q, index * 10 + 5, {
        type: 'truefalse',
        question: 'صح أم خطأ: ' + q.question + ' الإجابة هي «' + wrong + '».',
        answer: 'خطأ',
        options: undefined,
        image: undefined
      }));
    }
  }

  // تنويعات صحيحة للأسئلة التي لا تعتمد على اختيارات متعددة.
  if (q.type === 'truefalse' && !options.length) {
    out.push(cloneQuestion(q, index * 10 + 2, {
      question: 'تحقق من صحة المعلومة التالية: ' + q.question
    }));
    out.push(cloneQuestion(q, index * 10 + 3, {
      question: 'في تاريخ الزمالك، هل العبارة الآتية صحيحة؟ ' + q.question
    }));
    out.push(cloneQuestion(q, index * 10 + 4, {
      question: 'اختر صح أو خطأ: ' + q.question
    }));
    out.push(cloneQuestion(q, index * 10 + 5, {
      question: 'اختبر ذاكرتك — ' + q.question
    }));
  } else if (q.type === 'order') {
    out.push(cloneQuestion(q, index * 10 + 2, {
      question: 'رتّب المحطات التالية زمنيًا: ' + q.question
    }));
    out.push(cloneQuestion(q, index * 10 + 3, {
      question: 'تحدي التسلسل التاريخي: ' + q.question
    }));
    out.push(cloneQuestion(q, index * 10 + 4, {
      question: 'من الأقدم إلى الأحدث: ' + q.question
    }));
    out.push(cloneQuestion(q, index * 10 + 5, {
      question: 'رتّب أحداث القلعة البيضاء: ' + q.question
    }));
  }

  // صياغة إضافية مع إبقاء بنية السؤال الأصلية.
  out.push(cloneQuestion(q, index * 10 + 6, {
    question: (q.type === 'order' ? 'ترتيب إضافي — ' : 'من ذاكرة القلعة البيضاء: ') + q.question
  }));

  return out;
}

/**
 * يضمن 50 سؤالًا في كل مرحلة. الأسئلة الإضافية هي تنويعات
 * في الصياغة ونمط التفاعل لحقائق المرحلة الأصلية، وليست
 * ادعاءً بوجود 1000 حقيقة تاريخية مستقلة.
 */
export function expandStageQuestions(stage) {
  const base = Array.isArray(stage?.questions) ? stage.questions : [];
  const expanded = [];

  base.forEach((question, index) => {
    expanded.push(...makeVariants(question, index + 1));
  });

  // تدوير التنويعات عند الحاجة حتى يصل كل ملف إلى 50 سؤالًا.
  let cursor = 0;
  while (expanded.length < 50 && base.length) {
    const source = base[cursor % base.length];
    const serial = expanded.length + 1;
    const copy = cloneQuestion(source, 10000 + serial, {
      question: (serial % 2 ? 'تحدي إضافي: ' : 'اختبر ذاكرتك: ') + source.question
    });
    expanded.push(copy);
    cursor += 1;
  }

  return expanded.slice(0, 50).map((q, i) => ({ ...q, id: i + 1 }));
}

export const QUESTION_BANK_TOTAL = 1000;
