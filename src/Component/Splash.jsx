import React, { useEffect, useRef, useState } from 'react';
import { useReducedMotion } from 'framer-motion';

// شاشة الافتتاح: الشعار يتجمّع من التشتت إلى الوضوح (نفس لغة نصوص القصة)، ثم يشتعل قرص المنارة
// ويمرّ شعاع ضوء على الشعار. عند جاهزية الصفحة يتوهّج القرص ويتّسع الضوء ويدفعنا عبره إلى مشهد
// المنارة، وتبدأ كاميرا المشهد بالهبوط في اللحظة نفسها فلا يبدو الانتقال قطعاً.
const EXIT_MS = 1000;

export default function Splash({ exiting, onDone }) {
  const reduced = useReducedMotion();
  // أول تحميل: الشاشة مرسومة مسبقاً في index.html وحركتها بدأت مع أول إطار، فنتسلّمها كما هي بدل إنشاء نسخة تعيد الحركة
  const [adopted] = useState(() => document.getElementById('splash'));

  useEffect(() => {
    adopted?.classList.toggle('is-exiting', exiting);
    if (!exiting) return undefined;
    const timer = setTimeout(() => { adopted?.remove(); onDone(); }, reduced ? 250 : EXIT_MS);
    return () => clearTimeout(timer);
  }, [adopted, exiting, onDone, reduced]);

  // إن أُزيلت الصفحة الرئيسية قبل نهاية الشاشة تُزال معها. الإزالة مؤجلة لأن StrictMode (أثناء التطوير) يزيل المكوّن
  // ويعيد تركيبه فوراً، فيلغي التركيب الثاني الإزالة
  const removal = useRef(0);
  useEffect(() => {
    clearTimeout(removal.current);
    return () => { removal.current = setTimeout(() => adopted?.remove(), 0); };
  }, [adopted]);

  if (adopted) return null;
  return (
    <div className={`splash${exiting ? ' is-exiting' : ''}`} aria-hidden="true">
      <div className="splash-stage">
        <div className="splash-halo" />
        <img className="splash-ghost splash-ghost--a" src="/logo-mark.svg" alt="" />
        <img className="splash-ghost splash-ghost--b" src="/logo-mark.svg" alt="" />
        <img className="splash-logo" src="/logo-mark.svg" alt="" />
        <div className="splash-sweep"><span /></div>
        <div className="splash-bloom" />
      </div>
    </div>
  );
}
