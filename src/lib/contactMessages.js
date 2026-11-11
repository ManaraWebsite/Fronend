// تاريخ ووقت وصول رسالة «تواصل معنا» بتوقيت جهاز الأدمن
export const formatMessageDate = (value) => {
  if (!value) return '—';
  const date = new Date(value);
  return Number.isNaN(date.getTime()) ? String(value) : date.toLocaleString('en-GB', { dateStyle: 'medium', timeStyle: 'short' });
};

export const NOTIFICATION_LABELS = {
  pending: 'Queued — waiting for the queue worker',
  sent: 'Sent to the team',
  failed: 'Not sent',
};
