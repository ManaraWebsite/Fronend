// مواضع العناصر بإحداثيات الصفحة، تُقاس حين تتغيّر أحجام الصفحة فقط لا مع كل إطار تمرير.
// قراءة getBoundingClientRect/offsetHeight أثناء التمرير، بعد أن غيّرت شيفرة أخرى الأنماط في الإطار نفسه،
// تجبر المتصفح على إعادة تخطيط الصفحة كلها (أكثر من 30 ألف بكسل) في كل إطار: كان هذا السبب الأول لتقطّع
// التمرير على الهاتف (قياس فعلي: ~14 ثانية من 25 أثناء تمرير الواجهة والحكاية بمعالج مُبطّأ 4×).
// أثناء التمرير يكفي إذن مقارنة المواضع المحفوظة بـ window.scrollY، وقراءته لا تفرض تخطيطاً.

// موضع أعلى العنصر في الصفحة
export const pageTop = (el) => el.getBoundingClientRect().top + window.scrollY;

// يستدعي measure الآن، ثم كلما تغيّر حجم النافذة أو ارتفاع الصفحة (محتوى حُمّل من الـ API، خط، تغيّر تخطيط).
// ResizeObserver يُستدعى بعد التخطيط، فالقراءة داخله لا تفرض تخطيطاً إضافياً.
export function watchPageLayout(measure) {
  const observer = new ResizeObserver(() => measure());
  observer.observe(document.body);
  window.addEventListener('resize', measure);
  measure();
  return () => {
    observer.disconnect();
    window.removeEventListener('resize', measure);
  };
}
