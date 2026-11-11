import React, { useCallback, useEffect, useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import {
  FiArrowDown, FiArrowLeft, FiArrowRight, FiArrowUp, FiCheck, FiEdit2, FiEye, FiEyeOff, FiFilm, FiImage, FiMove, FiPlus, FiStar, FiTrash2, FiX,
} from 'react-icons/fi';
import axiosClient from './axiosClient';
import { getApiErrorMessage } from '../lib/apiError';
import { momentThumbUrl } from '../lib/images';
import { mediaUrl } from '../content/activities';
import useDragSort, { moveItem } from '../hooks/useDragSort';

const inputClass = 'w-full px-3 py-2.5 bg-[#0d1117] text-white border border-gray-800 rounded-xl focus:outline-none focus:border-[#ff7a00] focus:ring-1 focus:ring-[#ff7a00] text-sm placeholder-gray-500';
const iconButton = 'grid place-items-center w-8 h-8 rounded-lg bg-gray-800 hover:bg-gray-700 transition cursor-pointer disabled:opacity-30 disabled:cursor-default';
const primaryButton = 'px-4 py-2 bg-[#ff7a00] text-white rounded-xl text-sm font-semibold hover:bg-[#e06c00] transition flex items-center gap-2 cursor-pointer disabled:opacity-50';
const secondaryButton = 'px-4 py-2 bg-[#161b22] border border-gray-800 text-gray-300 rounded-xl text-sm font-semibold hover:bg-gray-800 hover:text-white transition cursor-pointer disabled:opacity-50';

const sameOrder = (a, b) => a.length === b.length && a.every((id, i) => id === b[i]);

// إنشاء مجموعة أو تعديل عنوانها: العربي مطلوب، والإنجليزي اختياري (يُعرض العربي مكانه إن غاب)
function GroupTitleForm({ initial, submitLabel, busy, onSubmit, onCancel, idPrefix }) {
  const [titleAr, setTitleAr] = useState(initial?.title?.ar || '');
  const [titleEn, setTitleEn] = useState(initial?.title?.en || '');

  const handleSubmit = (event) => {
    event.preventDefault();
    onSubmit({ title_ar: titleAr.trim(), title_en: titleEn.trim() || null });
  };

  return (
    <form onSubmit={handleSubmit} className="grid gap-3 sm:grid-cols-[1fr_1fr_auto] items-end">
      <div>
        <label htmlFor={`${idPrefix}-ar`} className="block text-xs font-semibold text-gray-400 mb-1.5">Title (Arabic) *</label>
        <input id={`${idPrefix}-ar`} value={titleAr} onChange={(e) => setTitleAr(e.target.value)} required maxLength={255} dir="rtl" className={inputClass} placeholder="مثال: ورشة الذكاء الاصطناعي" autoFocus={Boolean(initial)} />
      </div>
      <div>
        <label htmlFor={`${idPrefix}-en`} className="block text-xs font-semibold text-gray-400 mb-1.5">Title (English)</label>
        <input id={`${idPrefix}-en`} value={titleEn} onChange={(e) => setTitleEn(e.target.value)} maxLength={255} dir="ltr" className={inputClass} placeholder="e.g. AI Workshop" />
      </div>
      <div className="flex gap-2">
        <button type="submit" disabled={busy || !titleAr.trim()} className={primaryButton}>
          {initial ? <FiCheck size={16} /> : <FiPlus size={16} />}
          <span>{busy ? 'Saving...' : submitLabel}</span>
        </button>
        {onCancel && <button type="button" onClick={onCancel} className={secondaryButton}>Cancel</button>}
      </div>
    </form>
  );
}

// حذف مجموعة: صورها تُحذف معها، أو تُنقل إلى آخر مجموعة أخرى
function DeleteGroupPanel({ group, groups, busy, onConfirm, onCancel }) {
  const others = groups.filter((g) => g.id !== group.id);
  const count = group.images_count ?? 0;
  const [target, setTarget] = useState('');

  return (
    <div role="group" aria-label={`Delete ${group.title.ar}`} className="mt-4 p-4 rounded-xl border border-red-500/30 bg-red-500/5 space-y-3">
      <p className="text-sm text-red-300">
        Delete this group{count > 0 ? ` and decide what happens to its ${count} photo${count === 1 ? '' : 's'}` : ''}?
      </p>
      {count > 0 && (
        <div>
          <label htmlFor={`delete-target-${group.id}`} className="block text-xs font-semibold text-gray-400 mb-1.5">Its photos</label>
          <select id={`delete-target-${group.id}`} value={target} onChange={(e) => setTarget(e.target.value)} className={inputClass}>
            <option value="">Delete them permanently</option>
            {others.map((g) => (
              <option key={g.id} value={g.id}>Move them to “{g.title.ar}”{g.title.en ? ` (${g.title.en})` : ''}</option>
            ))}
          </select>
        </div>
      )}
      <div className="flex flex-wrap gap-2">
        <button type="button" disabled={busy} onClick={() => onConfirm(target ? Number(target) : null)} className="px-4 py-2 bg-red-600 text-white rounded-xl text-sm font-semibold hover:bg-red-700 transition cursor-pointer disabled:opacity-50">
          {busy ? 'Deleting...' : 'Delete group'}
        </button>
        <button type="button" onClick={onCancel} className={secondaryButton}>Cancel</button>
      </div>
    </div>
  );
}

function GroupCard({ group, index, count, groups, busy, editing, deleting, dragProps, isOver, isDragging, onMove, onEdit, onSave, onToggle, onDelete, onConfirmDelete, onCancel }) {
  const previews = (group.images || []).slice(0, 4);
  const total = group.images_count ?? 0;
  const published = group.published_images_count ?? total;

  return (
    <li
      {...dragProps}
      className={`bg-[#161b22] border rounded-2xl p-4 transition ${isOver ? 'border-[#ff7a00]' : 'border-gray-800'} ${isDragging ? 'opacity-50' : ''}`}
    >
      <div className="flex gap-4">
        <Link to={`/admin/moments/${group.id}`} className="shrink-0 grid grid-cols-2 gap-1 w-24 h-24 sm:w-28 sm:h-28 rounded-xl overflow-hidden bg-[#0d1117] border border-gray-800" aria-label={`Manage photos of ${group.title.ar}`}>
          {previews.length === 0 ? (
            <span className="col-span-2 row-span-2 grid place-items-center text-gray-600"><FiImage size={24} aria-hidden="true" /></span>
          ) : (
            previews.map((image, i) => (
              <img
                key={image.id}
                src={momentThumbUrl(image)}
                alt=""
                loading="lazy"
                className={`w-full h-full object-cover ${previews.length === 1 ? 'col-span-2 row-span-2' : ''} ${previews.length === 3 && i === 0 ? 'row-span-2' : ''}`}
              />
            ))
          )}
        </Link>

        <div className="min-w-0 flex-1">
          <div className="flex items-start justify-between gap-2">
            <div className="min-w-0">
              <h2 className="font-semibold text-white truncate" dir="rtl">{group.title.ar}</h2>
              <p className="text-sm text-gray-400 truncate">{group.title.en || <span className="italic text-gray-600">No English title</span>}</p>
            </div>
            <span className="hidden sm:flex items-center gap-1 text-gray-500 cursor-grab active:cursor-grabbing" title="Drag to reorder" aria-hidden="true">
              <FiMove size={16} />
            </span>
          </div>
          <p className="mt-2 text-xs text-gray-500">
            {total} photo{total === 1 ? '' : 's'}{published !== total ? ` · ${published} visible` : ''} · strip: {{ image: 'a photo', video: 'its video', none: 'nothing' }[group.strip_media] ?? 'a photo'} · key <code className="text-gray-400">{group.key}</code>
          </p>
          {!group.is_published && (
            <span className="inline-block mt-2 px-2 py-0.5 rounded-full text-[11px] font-medium bg-yellow-500/10 text-yellow-400 border border-yellow-500/20">Hidden from the website</span>
          )}
          <div className="mt-3 flex flex-wrap items-center gap-2">
            <Link to={`/admin/moments/${group.id}`} className="px-3 py-1.5 rounded-lg text-xs font-semibold bg-[#ff7a00]/15 text-[#ff7a00] hover:bg-[#ff7a00]/25 transition">Manage photos</Link>
            <button type="button" onClick={onEdit} disabled={busy} title="Edit title" aria-label={`Edit title of ${group.title.ar}`} className={`${iconButton} text-blue-400`}><FiEdit2 size={14} /></button>
            <button type="button" onClick={onToggle} disabled={busy} title={group.is_published ? 'Hide from website' : 'Show on website'} aria-label={group.is_published ? `Hide ${group.title.ar} from the website` : `Show ${group.title.ar} on the website`} className={`${iconButton} ${group.is_published ? 'text-green-400' : 'text-yellow-400'}`}>
              {group.is_published ? <FiEye size={14} /> : <FiEyeOff size={14} />}
            </button>
            <button type="button" onClick={onDelete} disabled={busy} title="Delete group" aria-label={`Delete ${group.title.ar}`} className={`${iconButton} text-red-400`}><FiTrash2 size={14} /></button>
            <span className="ml-auto flex gap-1">
              <button type="button" onClick={() => onMove(-1)} disabled={index === 0} title="Move up" aria-label={`Move ${group.title.ar} up`} className={`${iconButton} text-gray-300`}><FiArrowUp size={14} /></button>
              <button type="button" onClick={() => onMove(1)} disabled={index === count - 1} title="Move down" aria-label={`Move ${group.title.ar} down`} className={`${iconButton} text-gray-300`}><FiArrowDown size={14} /></button>
            </span>
          </div>
        </div>
      </div>

      {editing && (
        <div className="mt-4 pt-4 border-t border-gray-800">
          <GroupTitleForm initial={group} submitLabel="Save" busy={busy} onSubmit={onSave} onCancel={onCancel} idPrefix={`edit-${group.id}`} />
        </div>
      )}
      {deleting && <DeleteGroupPanel group={group} groups={groups} busy={busy} onConfirm={onConfirmDelete} onCancel={onCancel} />}
    </li>
  );
}

// صورة الافتتاح: تملأ حروف العنوان وتفتح الشريط في كل زيارة؛ تُختار من صور أي مجموعة (★)
function LeadPanel({ lead, groups, busy, onClear }) {
  const group = lead ? groups.find((g) => g.id === lead.moment_group_id) : null;
  const hidden = lead && (!lead.is_published || (group && !group.is_published));

  return (
    <section aria-labelledby="lead-title" className="mb-6 bg-[#161b22] border border-gray-800 rounded-2xl p-4 flex flex-wrap items-center gap-4">
      <div className="w-28 aspect-video rounded-lg overflow-hidden bg-[#0d1117] border border-gray-800 grid place-items-center shrink-0">
        {lead ? (
          <img src={momentThumbUrl(lead)} alt="" className="w-full h-full object-cover" style={lead.focal_point ? { objectPosition: lead.focal_point } : undefined} />
        ) : (
          <FiStar size={22} className="text-gray-600" aria-hidden="true" />
        )}
      </div>
      <div className="min-w-0 flex-1">
        <h2 id="lead-title" className="text-sm font-semibold text-white">Opening photo</h2>
        {lead ? (
          <p className="text-xs text-gray-400 mt-1">
            Shown first on every visit, right after the title — from <span dir="rtl">“{group?.title.ar ?? lead.group}”</span>.
            {hidden && <span className="block text-yellow-400 mt-1">It is hidden, so the website opens with a random wide photo until you show it.</span>}
          </p>
        ) : (
          <p className="text-xs text-gray-400 mt-1">None chosen: each visit opens with a random wide photo. Open a group and press ★ on a photo to choose one.</p>
        )}
      </div>
      {lead && (
        <div className="flex flex-wrap gap-2">
          {group && <Link to={`/admin/moments/${group.id}`} className={secondaryButton}>Open its group</Link>}
          <button type="button" onClick={onClear} disabled={busy} className={secondaryButton}>{busy ? 'Saving...' : 'Use a random photo'}</button>
        </div>
      )}
    </section>
  );
}

// ما يعرضه كل مجموعة في الشريط: صورة (المختارة، وإلا أول صورة ظاهرة)، أو مقطعها، أو لا شيء (null)
const stripItemOf = (group, lead) => {
  if (!group.is_published) return null;
  if (group.strip_media === 'video') return group.video ? { type: 'video', video: group.video } : null;
  if (group.strip_media !== 'image') return null;
  const usable = (image) => image && image.is_published && image.id !== lead?.id;
  const chosen = usable(group.strip_image) && group.strip_image.moment_group_id === group.id ? group.strip_image : null;
  const image = chosen || (group.images || []).find(usable);
  return image ? { type: 'image', image } : null;
};

const byStripOrder = (a, b) => (a.strip_order ?? 0) - (b.strip_order ?? 0) || a.id - b.id;

// معاينة الشريط بعد العنوان بالترتيب الذي يظهر به على الموقع: صورة الافتتاح ثابتة أولاً، وعناصر المجموعات تُرتَّب
// بالسحب (أو الأسهم) ثم الحفظ. ترتيب الشريط مستقل عن ترتيب المجموعات (الذي يتبعه التكوين أسفل الشريط)
function StripPreview({ groups, lead, saving, onSave }) {
  const leadShown = Boolean(lead && lead.is_published && groups.find((g) => g.id === lead.moment_group_id)?.is_published);
  const items = useMemo(
    () => [...groups].sort(byStripOrder).map((group) => ({ group, item: stripItemOf(group, leadShown ? lead : null) })),
    [groups, lead, leadShown],
  );
  const shown = useMemo(() => items.filter(({ item }) => item), [items]);
  const [list, setList] = useState(shown);
  // يُعاد ضبط الترتيب المعروض فقط حين يتغيّر الشريط نفسه (حفظ، أو تغيير عنصر مجموعة)، لا عند سحب بطاقات المجموعات
  const signature = shown.map(({ group, item }) => `${group.id}:${group.strip_order}:${item.image?.id ?? item.video}`).join('|');
  const [synced, setSynced] = useState(signature);
  if (synced !== signature) {
    setSynced(signature);
    setList(shown);
  }
  const { itemProps, overIndex, dragIndex } = useDragSort(list, setList);
  const changed = !sameOrder(list.map(({ group }) => group.id), shown.map(({ group }) => group.id));
  const thumb = 'relative shrink-0 h-20 rounded-lg overflow-hidden border bg-[#0d1117]';
  const arrow = 'grid place-items-center w-6 h-6 rounded-md bg-gray-800 text-gray-300 hover:bg-gray-700 cursor-pointer disabled:opacity-30 disabled:cursor-default';
  const move = (index, step) => {
    const target = index + step;
    if (target >= 0 && target < list.length) setList(moveItem(list, index, target));
  };

  return (
    <section aria-labelledby="strip-preview-title" className="mb-6 bg-[#161b22] border border-gray-800 rounded-2xl p-4">
      <h2 id="strip-preview-title" className="text-sm font-semibold text-white flex items-center gap-2"><FiFilm size={16} aria-hidden="true" />Strip after the title</h2>
      <p className="text-xs text-gray-500 mt-1 mb-3">
        The opening photo, then one item per group. Drag the items (or use the arrows) to set their order, then save — the group order below is not affected.
        Click an item to choose that group’s photo, its video, or nothing.
      </p>
      <ol className="flex gap-2 overflow-x-auto pb-2" aria-label="Strip order">
        {leadShown && (
          <li className={`${thumb} w-32 border-[#ff7a00]`} title="Opening photo (always first)">
            <img src={momentThumbUrl(lead)} alt="Opening photo" draggable="false" className="w-full h-full object-cover" style={lead.focal_point ? { objectPosition: lead.focal_point } : undefined} />
            <span className="absolute top-1 left-1 text-[10px] font-bold px-1.5 rounded-full bg-[#ff7a00] text-white flex items-center gap-1"><FiStar size={9} aria-hidden="true" />Opening</span>
          </li>
        )}
        {list.map(({ group, item }, index) => {
          const name = group.title.en || group.title.ar;
          return (
            <li
              key={group.id}
              {...itemProps(index)}
              className={`shrink-0 flex flex-col items-center gap-1 cursor-grab active:cursor-grabbing transition ${dragIndex === index ? 'opacity-40' : ''}`}
            >
              <Link
                to={`/admin/moments/${group.id}`}
                draggable="false"
                className={`${thumb} block ${item.type === 'video' ? 'w-12' : 'w-28'} ${overIndex === index && dragIndex !== index ? 'border-[#ff7a00] ring-2 ring-[#ff7a00]' : 'border-gray-800 hover:border-[#ff7a00]'}`}
                title={`${group.title.ar}${group.title.en ? ` — ${group.title.en}` : ''}`}
              >
                <img src={item.type === 'video' ? mediaUrl(item.video, '/loop-poster.webp') : momentThumbUrl(item.image)} alt={`${name}: ${item.type}`} draggable="false" className="w-full h-full object-cover" />
                {item.type === 'video' && <span className="absolute bottom-1 left-1 text-white drop-shadow"><FiFilm size={12} aria-hidden="true" /></span>}
                <span className="absolute top-1 left-1 text-[10px] font-bold px-1.5 rounded-full bg-black/70 text-white">{index + 1}</span>
              </Link>
              <span className="flex gap-1">
                <button type="button" onClick={() => move(index, -1)} disabled={index === 0 || saving} aria-label={`Move ${name} earlier in the strip`} className={arrow}><FiArrowLeft size={12} /></button>
                <button type="button" onClick={() => move(index, 1)} disabled={index === list.length - 1 || saving} aria-label={`Move ${name} later in the strip`} className={arrow}><FiArrowRight size={12} /></button>
              </span>
            </li>
          );
        })}
      </ol>
      {changed && (
        <div className="mt-2 p-3 rounded-xl border border-[#ff7a00]/40 bg-[#1f1a14] flex flex-wrap items-center justify-between gap-3">
          <span className="text-sm text-[#ffb366]">The strip order has changed. Save it to update the website.</span>
          <div className="flex gap-2">
            <button type="button" onClick={() => setList(shown)} disabled={saving} className={secondaryButton}>Reset</button>
            <button type="button" onClick={() => onSave(list.map(({ group }) => group.id))} disabled={saving} className={primaryButton}>{saving ? 'Saving...' : 'Save strip order'}</button>
          </div>
        </div>
      )}
      {items.some(({ group, item }) => group.is_published && !item) && (
        <p className="text-xs text-gray-500 mt-2">
          Not in the strip: {items.filter(({ group, item }) => group.is_published && !item).map(({ group }) => group.title.en || group.title.ar).join(', ')}.
        </p>
      )}
    </section>
  );
}

// «لحظات حقيقية»: مجموعات الصور (عنوان كل نشاط) بترتيب ظهورها في شريط الأنشطة على الموقع
const MomentGroupsAdmin = () => {
  const [groups, setGroups] = useState([]);
  const [lead, setLead] = useState(null);
  const [savedOrder, setSavedOrder] = useState([]);
  const [loading, setLoading] = useState(true);
  const [loadError, setLoadError] = useState('');
  const [notice, setNotice] = useState(null);
  const [creating, setCreating] = useState(false);
  const [panel, setPanel] = useState({ id: null, mode: null }); // mode: edit | delete
  const [busyId, setBusyId] = useState(null);
  const [savingOrder, setSavingOrder] = useState(false);

  const applyGroups = (list) => {
    setGroups(list);
    setSavedOrder(list.map((g) => g.id));
  };

  // GET /admin/moment-groups
  const fetchGroups = useCallback(async () => {
    try {
      setLoadError('');
      const response = await axiosClient.get('/admin/moment-groups');
      applyGroups(response.data.data || []);
      setLead(response.data.lead || null);
    } catch (error) {
      setLoadError(getApiErrorMessage(error, 'Failed to load the photo groups.'));
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchGroups();
  }, [fetchGroups]);

  const order = useMemo(() => groups.map((g) => g.id), [groups]);
  const orderChanged = !sameOrder(order, savedOrder);
  const { itemProps, overIndex, dragIndex } = useDragSort(groups, setGroups);
  const totalPhotos = groups.reduce((sum, g) => sum + (g.images_count ?? 0), 0);

  const closePanel = () => setPanel({ id: null, mode: null });

  // POST /admin/moment-groups — المجموعة الجديدة تُضاف في آخر الترتيب
  const handleCreate = async (values) => {
    setBusyId('new');
    try {
      const response = await axiosClient.post('/admin/moment-groups', values);
      const created = response.data.data;
      setGroups((prev) => [...prev, created]);
      setSavedOrder((prev) => [...prev, created.id]);
      setCreating(false);
      setNotice({ type: 'success', text: `Group “${created.title.ar}” created. Open it to add photos.` });
    } catch (error) {
      setNotice({ type: 'error', text: getApiErrorMessage(error, 'Failed to create the group.') });
    } finally {
      setBusyId(null);
    }
  };

  // PUT /admin/moment-groups/{id}
  const updateGroup = async (group, values, successText) => {
    setBusyId(group.id);
    try {
      const response = await axiosClient.put(`/admin/moment-groups/${group.id}`, values);
      const updated = response.data.data;
      setGroups((prev) => prev.map((g) => (g.id === group.id ? updated : g)));
      closePanel();
      setNotice({ type: 'success', text: successText });
    } catch (error) {
      setNotice({ type: 'error', text: getApiErrorMessage(error, 'Failed to update the group.') });
    } finally {
      setBusyId(null);
    }
  };

  // DELETE /admin/moment-groups/{id} — مع move_images_to لنقل الصور بدل حذفها
  const handleDelete = async (group, moveTo) => {
    setBusyId(group.id);
    try {
      await axiosClient.delete(`/admin/moment-groups/${group.id}`, { data: moveTo ? { move_images_to: moveTo } : {} });
      closePanel();
      const target = groups.find((g) => g.id === moveTo);
      setNotice({ type: 'success', text: target ? `Group deleted. Its photos were moved to “${target.title.ar}”.` : 'Group and its photos deleted.' });
      await fetchGroups();
    } catch (error) {
      setNotice({ type: 'error', text: getApiErrorMessage(error, 'Failed to delete the group.') });
    } finally {
      setBusyId(null);
    }
  };

  // PUT /admin/moment-images/{id} مع is_lead=false: الافتتاح بصورة عشوائية
  const clearLead = async () => {
    setBusyId('lead');
    try {
      await axiosClient.put(`/admin/moment-images/${lead.id}`, { is_lead: false });
      setLead(null);
      setNotice({ type: 'success', text: 'The section now opens with a random wide photo.' });
    } catch (error) {
      setNotice({ type: 'error', text: getApiErrorMessage(error, 'Failed to change the opening photo.') });
    } finally {
      setBusyId(null);
    }
  };

  // POST /admin/moment-groups/strip-order — نحدّث strip_order فقط، فلا يضيع ترتيب مجموعات لم يُحفظ بعد
  const saveStripOrder = async (ids) => {
    setBusyId('strip');
    try {
      const response = await axiosClient.post('/admin/moment-groups/strip-order', { groups: ids });
      const stripOrder = new Map((response.data.data || []).map((g) => [g.id, g.strip_order]));
      setGroups((prev) => prev.map((g) => (stripOrder.has(g.id) ? { ...g, strip_order: stripOrder.get(g.id) } : g)));
      setNotice({ type: 'success', text: 'Strip order saved.' });
    } catch (error) {
      setNotice({ type: 'error', text: getApiErrorMessage(error, 'Failed to save the strip order.') });
    } finally {
      setBusyId(null);
    }
  };

  // POST /admin/moment-groups/reorder
  const saveOrder = async () => {
    setSavingOrder(true);
    try {
      const response = await axiosClient.post('/admin/moment-groups/reorder', { groups: order });
      applyGroups(response.data.data || []);
      setNotice({ type: 'success', text: 'Group order saved.' });
    } catch (error) {
      setNotice({ type: 'error', text: getApiErrorMessage(error, 'Failed to save the group order.') });
    } finally {
      setSavingOrder(false);
    }
  };

  const resetOrder = () => {
    const byId = new Map(groups.map((g) => [g.id, g]));
    setGroups(savedOrder.map((id) => byId.get(id)).filter(Boolean));
  };

  return (
    <div className="p-4 md:p-8 max-w-7xl mx-auto min-h-screen bg-[#0d1117] text-gray-100" dir="ltr">
      <div className="flex flex-wrap justify-between items-center gap-4 mb-6 border-b border-gray-800 pb-4">
        <div>
          <span className="text-xs text-gray-400">Admin /</span>
          <h1 className="text-xl font-bold text-white">Real Moments <span className="text-gray-500 font-normal" dir="rtl">لحظات حقيقية</span></h1>
          <p className="text-sm text-gray-400 mt-1 max-w-2xl">
            Photo groups shown in the homepage “Real moments” section. The scrolling strip shows the opening photo, then one photo or video per group in the group order;
            every other photo follows in the collage below, groups in order with each group’s photos shuffled on every visit.
          </p>
        </div>
        <button type="button" onClick={() => { setCreating(true); closePanel(); }} className={primaryButton}>
          <FiPlus size={18} />
          <span>New Group</span>
        </button>
      </div>

      {notice && (
        <div role="status" className={`p-4 mb-4 rounded-xl text-sm border flex items-start justify-between gap-3 ${notice.type === 'success' ? 'bg-green-500/10 text-green-400 border-green-500/25' : 'bg-red-500/10 text-red-400 border-red-500/25'}`}>
          <span>{notice.text}</span>
          <button type="button" onClick={() => setNotice(null)} aria-label="Dismiss message" className="cursor-pointer opacity-70 hover:opacity-100"><FiX size={16} /></button>
        </div>
      )}

      {creating && (
        <div className="mb-6 bg-[#161b22] border border-gray-800 rounded-2xl p-4 md:p-5">
          <h2 className="text-sm font-semibold text-white mb-3">New photo group</h2>
          <GroupTitleForm submitLabel="Create" busy={busyId === 'new'} onSubmit={handleCreate} onCancel={() => setCreating(false)} idPrefix="new-group" />
        </div>
      )}

      {orderChanged && (
        <div className="sticky top-14 md:top-0 z-10 mb-4 p-3 rounded-xl border border-[#ff7a00]/40 bg-[#1f1a14] flex flex-wrap items-center justify-between gap-3">
          <span className="text-sm text-[#ffb366]">The group order has changed. Save it to update the website.</span>
          <div className="flex gap-2">
            <button type="button" onClick={resetOrder} disabled={savingOrder} className={secondaryButton}>Reset</button>
            <button type="button" onClick={saveOrder} disabled={savingOrder} className={primaryButton}>{savingOrder ? 'Saving...' : 'Save order'}</button>
          </div>
        </div>
      )}

      {loading ? (
        <p className="text-center py-12 text-gray-500 text-sm">Loading photo groups...</p>
      ) : loadError ? (
        <div role="alert" className="bg-[#161b22] rounded-2xl p-12 text-center border border-red-500/25 space-y-3">
          <p className="text-red-400 text-sm">{loadError}</p>
          <button type="button" onClick={() => { setLoading(true); fetchGroups(); }} className="text-[#ff7a00] font-semibold text-sm hover:underline cursor-pointer">Try again</button>
        </div>
      ) : groups.length === 0 ? (
        <div className="bg-[#161b22] rounded-2xl p-12 text-center border border-gray-800 space-y-2">
          <p className="text-gray-300 text-sm">No photo groups yet.</p>
          <p className="text-gray-500 text-xs">Create a group (for example, one per workshop), then add its photos.</p>
        </div>
      ) : (
        <>
          <LeadPanel lead={lead} groups={groups} busy={busyId === 'lead'} onClear={clearLead} />
          <StripPreview groups={groups} lead={lead} saving={busyId === 'strip'} onSave={saveStripOrder} />
          <p className="text-xs text-gray-500 mb-3">{groups.length} group{groups.length === 1 ? '' : 's'} · {totalPhotos} photo{totalPhotos === 1 ? '' : 's'} · drag the cards or use the arrows to reorder.</p>
          <ul className="grid gap-4 lg:grid-cols-2">
            {groups.map((group, index) => (
              <GroupCard
                key={group.id}
                group={group}
                index={index}
                count={groups.length}
                groups={groups}
                busy={busyId === group.id}
                editing={panel.id === group.id && panel.mode === 'edit'}
                deleting={panel.id === group.id && panel.mode === 'delete'}
                dragProps={panel.id === group.id ? {} : itemProps(index)}
                isOver={overIndex === index && dragIndex !== index}
                isDragging={dragIndex === index}
                onMove={(step) => {
                  const target = index + step;
                  if (target >= 0 && target < groups.length) setGroups(moveItem(groups, index, target));
                }}
                onEdit={() => { setPanel({ id: group.id, mode: 'edit' }); setCreating(false); }}
                onSave={(values) => updateGroup(group, values, 'Group title updated.')}
                onToggle={() => updateGroup(group, { is_published: !group.is_published }, group.is_published ? 'Group hidden from the website.' : 'Group shown on the website.')}
                onDelete={() => setPanel({ id: group.id, mode: 'delete' })}
                onConfirmDelete={(moveTo) => handleDelete(group, moveTo)}
                onCancel={closePanel}
              />
            ))}
          </ul>
        </>
      )}
    </div>
  );
};

export default MomentGroupsAdmin;
