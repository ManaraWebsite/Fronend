import { useRef, useState } from 'react';

// نقل عنصر من موضع إلى آخر في نسخة جديدة من القائمة
export const moveItem = (list, from, to) => {
  const next = [...list];
  const [item] = next.splice(from, 1);
  next.splice(to, 0, item);
  return next;
};

// ترتيب بالسحب والإفلات (HTML5) لعناصر قائمة: itemProps(index) تُوزَّع على كل عنصر.
// السحب يُقبل فقط إن بدأ من عنصر في القائمة نفسها، فإفلات الملفات من الجهاز لا يغيّر الترتيب.
// على اللمس ولوحة المفاتيح تبقى أزرار التقديم والتأخير.
export default function useDragSort(items, onChange) {
  const from = useRef(null);
  const [overIndex, setOverIndex] = useState(null);
  const [dragIndex, setDragIndex] = useState(null);

  const reset = () => {
    from.current = null;
    setDragIndex(null);
    setOverIndex(null);
  };

  const itemProps = (index) => ({
    draggable: true,
    onDragStart: (event) => {
      from.current = index;
      setDragIndex(index);
      event.dataTransfer.effectAllowed = 'move';
      event.dataTransfer.setData('text/plain', String(index));
    },
    onDragOver: (event) => {
      if (from.current === null) return;
      event.preventDefault();
      event.dataTransfer.dropEffect = 'move';
      if (overIndex !== index) setOverIndex(index);
    },
    onDrop: (event) => {
      if (from.current === null) return;
      event.preventDefault();
      const start = from.current;
      reset();
      if (start !== index) onChange(moveItem(items, start, index));
    },
    onDragEnd: reset,
  });

  return { itemProps, overIndex, dragIndex };
}
