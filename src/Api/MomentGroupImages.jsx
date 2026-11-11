import React, { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { Link, useParams } from 'react-router-dom';
import {
  FiArrowLeft, FiArrowRight, FiCheckCircle, FiEdit2, FiEyeOff, FiFilm, FiMove, FiStar, FiTrash2, FiUploadCloud, FiX,
} from 'react-icons/fi';
import axiosClient from './axiosClient';
import { getApiErrorMessage } from '../lib/apiError';
import { resolveMediaUrl } from '../lib/media';
import { mediaUrl } from '../content/activities';
import { MOMENT_IMAGE_ACCEPT, momentFileError, momentThumbUrl, uploadPercent } from '../lib/images';
import useObjectUrl from '../hooks/useObjectUrl';
import useDragSort, { moveItem } from '../hooks/useDragSort';

const inputClass = 'w-full px-3 py-2.5 bg-[#0d1117] text-white border border-gray-800 rounded-xl focus:outline-none focus:border-[#ff7a00] focus:ring-1 focus:ring-[#ff7a00] text-sm placeholder-gray-500';
const control = 'grid place-items-center w-8 h-8 rounded-full bg-black/65 text-white hover:bg-[#ff7a00] disabled:opacity-30 disabled:hover:bg-black/65 transition cursor-pointer disabled:cursor-default';
const primaryButton = 'px-4 py-2 bg-[#ff7a00] text-white rounded-xl text-sm font-semibold hover:bg-[#e06c00] transition flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50 disabled:cursor-default';
const secondaryButton = 'px-4 py-2 bg-[#161b22] border border-gray-800 text-gray-300 rounded-xl text-sm font-semibold hover:bg-gray-800 hover:text-white transition cursor-pointer disabled:opacity-50';

const sameOrder = (a, b) => a.length === b.length && a.every((id, i) => id === b[i]);
let queueKey = 0;

// ملف مختار في قائمة الرفع: معاينة، حالة الرفع ونسبته، أو سبب الرفض
function QueueTile({ item, onRemove, disabled }) {
  const preview = useObjectUrl(item.file);
  const failed = item.status === 'error';

  return (
    <li className={`relative aspect-[4/3] rounded-xl overflow-hidden border bg-[#0d1117] ${failed ? 'border-red-500/60' : 'border-gray-800'}`}>
      {preview && <img src={preview} alt={`Preview of ${item.file.name}`} className={`absolute inset-0 w-full h-full object-cover ${item.status === 'uploading' ? 'opacity-50' : ''}`} />}
      {item.status !== 'uploading' && (
        <button type="button" onClick={onRemove} disabled={disabled} aria-label={`Remove ${item.file.name}`} className={`${control} absolute top-2 right-2 hover:!bg-red-600`}>
          <FiX size={14} />
        </button>
      )}
      <div className="absolute inset-x-0 bottom-0 p-2 bg-gradient-to-t from-black/85 to-transparent text-[11px] text-white">
        <p className="truncate" title={item.file.name}>{item.file.name}</p>
        {item.status === 'uploading' && (
          <div className="mt-1 h-1.5 rounded-full bg-white/20 overflow-hidden" role="progressbar" aria-label={`Uploading ${item.file.name}`} aria-valuemin={0} aria-valuemax={100} aria-valuenow={item.progress ?? 0}>
            <div className="h-full bg-[#ff7a00] transition-[width]" style={{ width: `${item.progress ?? 5}%` }} />
          </div>
        )}
        {failed && <p className="mt-1 text-red-300 leading-4">{item.error}</p>}
      </div>
    </li>
  );
}

// صورة محفوظة في المعرض: سحب أو أسهم للترتيب، صورة الافتتاح، وتعديل وحذف
function ImageTile({ image, index, count, inStrip, dragProps, isOver, isDragging, busy, onMove, onLead, onEdit, onDelete }) {
  const position = `Photo ${index + 1} of ${count}`;

  return (
    <li
      {...dragProps}
      className={`group relative aspect-[4/3] rounded-xl overflow-hidden border-2 bg-[#0d1117] transition ${isOver ? 'border-[#ff7a00]' : 'border-transparent'} ${isDragging ? 'opacity-40' : ''} ${busy ? 'opacity-50 pointer-events-none' : ''}`}
    >
      <img
        src={momentThumbUrl(image)}
        alt={image.alt?.en || image.alt?.ar || position}
        loading="lazy"
        draggable="false"
        className={`absolute inset-0 w-full h-full object-cover ${image.is_published ? '' : 'grayscale opacity-60'}`}
        style={image.focal_point ? { objectPosition: image.focal_point } : undefined}
      />
      {image.is_lead && <span className="absolute inset-0 rounded-[10px] ring-2 ring-inset ring-[#ff7a00] pointer-events-none" aria-hidden="true" />}
      <div className="absolute top-2 left-2 right-12 flex flex-wrap gap-1">
        <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-black/70 text-white">{index + 1}</span>
        {image.is_lead && <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-[#ff7a00] text-white flex items-center gap-1" title="Shown first, right after the title"><FiStar size={10} aria-hidden="true" />Opening</span>}
        {!image.is_published && <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-yellow-500 text-black flex items-center gap-1"><FiEyeOff size={10} aria-hidden="true" />Hidden</span>}
        {inStrip && <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-sky-500 text-white flex items-center gap-1" title="This group's photo in the strip after the title"><FiFilm size={10} aria-hidden="true" />Strip</span>}
        {image.is_bundled && <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-black/70 text-gray-300" title="One of the section's original photos">Original</span>}
      </div>
      <span className="absolute top-2 right-2 hidden sm:grid place-items-center w-8 h-8 rounded-full bg-black/65 text-white cursor-grab active:cursor-grabbing" title="Drag to reorder" aria-hidden="true">
        <FiMove size={14} />
      </span>
      <div className="absolute bottom-2 inset-x-2 flex justify-between gap-1">
        <span className="flex gap-1">
          <button type="button" onClick={() => onMove(-1)} disabled={index === 0} aria-label={`Move ${position.toLowerCase()} earlier`} className={control}><FiArrowLeft size={14} /></button>
          <button type="button" onClick={() => onMove(1)} disabled={index === count - 1} aria-label={`Move ${position.toLowerCase()} later`} className={control}><FiArrowRight size={14} /></button>
        </span>
        <span className="flex gap-1">
          <button
            type="button"
            onClick={onLead}
            aria-pressed={image.is_lead}
            aria-label={image.is_lead ? `Stop using ${position.toLowerCase()} as the opening photo` : `Use ${position.toLowerCase()} as the opening photo`}
            title={image.is_lead ? 'Opening photo — click to use a random one instead' : 'Use as the opening photo (first after the title)'}
            className={`${control} ${image.is_lead ? '!bg-[#ff7a00]' : ''}`}
          >
            <FiStar size={14} />
          </button>
          <button type="button" onClick={onEdit} aria-label={`Edit ${position.toLowerCase()}`} title="Edit, replace or move" className={control}><FiEdit2 size={14} /></button>
          <button type="button" onClick={onDelete} aria-label={`Delete ${position.toLowerCase()}`} title="Delete" className={`${control} hover:!bg-red-600`}><FiTrash2 size={14} /></button>
        </span>
      </div>
    </li>
  );
}

// ما تعرضه المجموعة في الشريط بعد العنوان: صورة (يختارها الأدمن، أو أول صورة تلقائياً)، أو مقطعها، أو لا شيء.
// كل تغيير يُحفظ مباشرة: PUT /admin/moment-groups/{id} مع strip_media و strip_image_id
const effectiveStripImageId = (group, images) => {
  if (group.strip_media !== 'image') return null;
  const chosen = images.find((image) => image.id === group.strip_image_id && image.is_published && !image.is_lead);
  return (chosen || images.find((image) => image.is_published && !image.is_lead))?.id ?? null;
};

function StripPanel({ group, images, busy, onChange }) {
  const mode = group.strip_media || 'image';
  const shownId = effectiveStripImageId(group, images);
  const option = (value, label, hint, disabled = false) => (
    <label className={`flex-1 min-w-[10rem] flex items-start gap-2 p-3 rounded-xl border cursor-pointer transition ${mode === value ? 'border-[#ff7a00] bg-[#ff7a00]/10' : 'border-gray-800 hover:border-gray-600'} ${disabled ? 'opacity-40 cursor-not-allowed' : ''}`}>
      <input type="radio" name="strip-media" value={value} checked={mode === value} disabled={busy || disabled} onChange={() => onChange({ strip_media: value })} className="accent-[#ff7a00] mt-0.5" />
      <span>
        <span className="block text-sm font-semibold text-white">{label}</span>
        <span className="block text-xs text-gray-500">{hint}</span>
      </span>
    </label>
  );

  return (
    <section aria-labelledby="strip-title" className="mb-8 bg-[#161b22] border border-gray-800 rounded-2xl p-4 md:p-6 space-y-4">
      <div>
        <h2 id="strip-title" className="text-sm font-semibold text-white flex items-center gap-2"><FiFilm size={16} aria-hidden="true" />In the strip after the title</h2>
        <p className="text-xs text-gray-500 mt-1">After the opening photo, the strip shows one item from each group, in the group order. Choose what this group shows. The rest of its photos appear in the collage below, shuffled on each visit.</p>
      </div>
      <div className="flex flex-wrap gap-3" role="radiogroup" aria-labelledby="strip-title">
        {option('image', 'A photo', 'One photo of this group')}
        {option('video', 'Its video', group.video ? 'The group’s short looping video' : 'This group has no video', !group.video)}
        {option('none', 'Nothing', 'Skip this group in the strip')}
      </div>

      {mode === 'video' && group.video && (
        <div className="w-24 aspect-[9/16] rounded-xl overflow-hidden border border-gray-800 bg-[#0d1117]">
          <img src={mediaUrl(group.video, '/loop-poster.webp')} alt="Video poster" className="w-full h-full object-cover" />
        </div>
      )}

      {mode === 'image' && (
        images.length === 0 ? (
          <p className="text-xs text-yellow-400">This group has no photos yet, so it is skipped in the strip until you add one.</p>
        ) : (
          <fieldset>
            <legend className="text-xs font-semibold text-gray-400 mb-2">Which photo</legend>
            <ul className="flex gap-2 overflow-x-auto pb-2">
              <li className="shrink-0">
                <label className={`grid place-items-center w-24 h-[4.5rem] rounded-lg border-2 text-[11px] text-center p-1 cursor-pointer ${!group.strip_image_id ? 'border-[#ff7a00] text-[#ff7a00]' : 'border-gray-800 text-gray-400 hover:border-gray-600'}`}>
                  <input type="radio" name="strip-image" className="sr-only" checked={!group.strip_image_id} disabled={busy} onChange={() => onChange({ strip_media: 'image', strip_image_id: null })} />
                  First photo (automatic)
                </label>
              </li>
              {images.map((image, i) => {
                const selected = group.strip_image_id === image.id;
                const unusable = !image.is_published || image.is_lead;
                return (
                  <li key={image.id} className="shrink-0">
                    <label className={`relative block w-24 h-[4.5rem] rounded-lg overflow-hidden border-2 cursor-pointer ${selected ? 'border-[#ff7a00]' : 'border-gray-800 hover:border-gray-600'}`} title={image.is_lead ? 'This is the opening photo, already shown first' : !image.is_published ? 'Hidden photos are not shown' : `Photo ${i + 1}`}>
                      <input type="radio" name="strip-image" className="sr-only" checked={selected} disabled={busy} onChange={() => onChange({ strip_media: 'image', strip_image_id: image.id })} aria-label={`Photo ${i + 1}${unusable ? ' (not shown)' : ''}`} />
                      <img src={momentThumbUrl(image)} alt="" className={`w-full h-full object-cover ${unusable ? 'grayscale opacity-50' : ''}`} style={image.focal_point ? { objectPosition: image.focal_point } : undefined} />
                      <span className="absolute bottom-0.5 left-1 text-[10px] font-bold text-white drop-shadow">{i + 1}</span>
                    </label>
                  </li>
                );
              })}
            </ul>
            {group.strip_image_id && shownId !== group.strip_image_id && (
              <p className="text-xs text-yellow-400">The chosen photo is hidden or is the opening photo, so the strip uses {shownId ? 'the first visible photo' : 'nothing from this group'} instead.</p>
            )}
          </fieldset>
        )
      )}
    </section>
  );
}

const parseFocal = (value) => {
  const match = /^(\d{1,3})% (\d{1,3})%$/.exec(value || '');
  return match ? [Number(match[1]), Number(match[2])] : [50, 50];
};

// تعديل صورة: استبدال الملف، الوصف، موضع القص، الظهور، أو نقلها إلى مجموعة أخرى (PUT /admin/moment-images/{id})
function ImageEditor({ image, groups, groupId, onClose, onSaved }) {
  const dialog = useRef(null);
  const [file, setFile] = useState(null);
  const [fileError, setFileError] = useState('');
  const [altAr, setAltAr] = useState(image.alt?.ar || '');
  const [altEn, setAltEn] = useState(image.alt?.en || '');
  const [focal, setFocal] = useState(() => parseFocal(image.focal_point));
  const [published, setPublished] = useState(image.is_published);
  const [lead, setLead] = useState(image.is_lead);
  const [target, setTarget] = useState(String(groupId));
  const [progress, setProgress] = useState(null);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');
  const preview = useObjectUrl(file);
  const shown = preview || resolveMediaUrl(image.url);
  const focalValue = `${focal[0]}% ${focal[1]}%`;

  useEffect(() => {
    const el = dialog.current;
    if (el && !el.open) el.showModal();
    return () => { if (el?.open) el.close(); };
  }, []);

  const chooseFile = (event) => {
    const chosen = event.target.files?.[0];
    event.target.value = '';
    if (!chosen) return;
    const problem = momentFileError(chosen);
    setFileError(problem || '');
    if (!problem) setFile(chosen);
  };

  const handleSubmit = async (event) => {
    event.preventDefault();
    setSaving(true);
    setError('');
    const values = {
      alt_ar: altAr.trim() || null,
      alt_en: altEn.trim() || null,
      focal_point: focalValue === '50% 50%' && !image.focal_point ? null : focalValue,
      is_published: published,
      is_lead: lead,
    };
    if (Number(target) !== groupId) values.moment_group_id = Number(target);

    try {
      let response;
      if (file) {
        // الملف يتطلب multipart؛ Laravel يقرأ PUT عبر _method
        const formData = new FormData();
        formData.append('_method', 'PUT');
        formData.append('image', file);
        Object.entries(values).forEach(([key, value]) => {
          if (typeof value === 'boolean') formData.append(key, value ? '1' : '0');
          else formData.append(key, value ?? '');
        });
        response = await axiosClient.post(`/admin/moment-images/${image.id}`, formData, {
          onUploadProgress: (e) => setProgress(uploadPercent(e)),
        });
      } else {
        response = await axiosClient.put(`/admin/moment-images/${image.id}`, values);
      }
      onSaved(response.data.data, { replaced: Boolean(file) });
    } catch (err) {
      setError(getApiErrorMessage(err, 'Failed to save the photo.'));
      setSaving(false);
      setProgress(null);
    }
  };

  const saveLabel = !saving ? 'Save changes' : progress !== null && progress < 100 ? `Uploading… ${progress}%` : 'Saving...';

  return (
    <dialog
      ref={dialog}
      onCancel={(e) => { e.preventDefault(); if (!saving) onClose(); }}
      className="m-auto w-[min(56rem,calc(100vw-2rem))] max-h-[calc(100vh-2rem)] rounded-2xl border border-gray-800 bg-[#161b22] text-gray-100 p-0 backdrop:bg-black/70"
      aria-labelledby="moment-editor-title"
    >
      <form onSubmit={handleSubmit} className="p-5 md:p-6 space-y-5" dir="ltr">
        <div className="flex items-center justify-between gap-3">
          <h2 id="moment-editor-title" className="text-lg font-bold text-white">Edit photo</h2>
          <button type="button" onClick={onClose} disabled={saving} aria-label="Close" className="p-2 rounded-lg text-gray-400 hover:text-white hover:bg-gray-800 cursor-pointer"><FiX size={18} /></button>
        </div>

        {error && <div role="alert" className="p-3 rounded-xl text-sm border bg-red-500/10 text-red-400 border-red-500/25">{error}</div>}

        <div className="grid gap-5 md:grid-cols-2">
          <div className="space-y-3">
            {/* معاينة القص بنسبتي الشريط: عريضة وطولية */}
            <div className="grid grid-cols-[1fr_auto] gap-2 items-start">
              <div className="aspect-[4/3] rounded-xl overflow-hidden bg-[#0d1117] border border-gray-800">
                {shown && <img src={shown} alt="Landscape crop preview" className="w-full h-full object-cover" style={{ objectPosition: focalValue }} />}
              </div>
              <div className="w-16 aspect-[9/16] rounded-xl overflow-hidden bg-[#0d1117] border border-gray-800">
                {shown && <img src={shown} alt="Portrait crop preview" className="w-full h-full object-cover" style={{ objectPosition: focalValue }} />}
              </div>
            </div>
            {file && <p className="text-xs text-[#ffb366]">New file: {file.name} — replaces the current photo when you save.</p>}
            <div className="flex flex-wrap items-center gap-2">
              <label className={`${secondaryButton} inline-flex items-center gap-2 focus-within:border-[#ff7a00]`}>
                <FiUploadCloud size={16} aria-hidden="true" />
                <span>{file ? 'Choose another file' : 'Replace photo'}</span>
                <input type="file" accept={MOMENT_IMAGE_ACCEPT} onChange={chooseFile} className="sr-only" disabled={saving} />
              </label>
              {file && <button type="button" onClick={() => setFile(null)} className="text-xs text-gray-400 hover:text-white underline cursor-pointer">Keep the current photo</button>}
            </div>
            {fileError && <p role="alert" className="text-xs text-red-400">{fileError}</p>}
            {image.is_bundled && file && <p className="text-xs text-gray-500">The original file stays in the website folder; only this record will point to the new upload.</p>}
          </div>

          <div className="space-y-4">
            <fieldset>
              <legend className="block text-xs font-semibold text-gray-400 mb-2">Crop position <span className="font-normal text-gray-500">({focalValue})</span></legend>
              <label className="flex items-center gap-3 text-xs text-gray-400 mb-2">
                <span className="w-16">Horizontal</span>
                <input type="range" min="0" max="100" value={focal[0]} onChange={(e) => setFocal([Number(e.target.value), focal[1]])} className="flex-1 accent-[#ff7a00]" />
              </label>
              <label className="flex items-center gap-3 text-xs text-gray-400">
                <span className="w-16">Vertical</span>
                <input type="range" min="0" max="100" value={focal[1]} onChange={(e) => setFocal([focal[0], Number(e.target.value)])} className="flex-1 accent-[#ff7a00]" />
              </label>
            </fieldset>
            <div>
              <label htmlFor="moment-alt-ar" className="block text-xs font-semibold text-gray-400 mb-1.5">Description (Arabic)</label>
              <input id="moment-alt-ar" value={altAr} onChange={(e) => setAltAr(e.target.value)} maxLength={255} dir="rtl" className={inputClass} placeholder="ما الذي يظهر في الصورة؟" />
            </div>
            <div>
              <label htmlFor="moment-alt-en" className="block text-xs font-semibold text-gray-400 mb-1.5">Description (English)</label>
              <input id="moment-alt-en" value={altEn} onChange={(e) => setAltEn(e.target.value)} maxLength={255} className={inputClass} placeholder="What does the photo show?" />
            </div>
            <div>
              <label htmlFor="moment-group" className="block text-xs font-semibold text-gray-400 mb-1.5">Group</label>
              <select id="moment-group" value={target} onChange={(e) => setTarget(e.target.value)} className={inputClass}>
                {groups.map((g) => (
                  <option key={g.id} value={g.id}>{g.title.ar}{g.title.en ? ` — ${g.title.en}` : ''}</option>
                ))}
              </select>
              {Number(target) !== groupId && <p className="mt-1 text-xs text-[#ffb366]">The photo will move to the end of that group.</p>}
            </div>
            <label className="flex items-center gap-2 text-sm text-gray-300 cursor-pointer">
              <input type="checkbox" checked={published} onChange={(e) => setPublished(e.target.checked)} className="accent-[#ff7a00] w-4 h-4" />
              Show on the website
            </label>
            <label className="flex items-start gap-2 text-sm text-gray-300 cursor-pointer">
              <input type="checkbox" checked={lead} onChange={(e) => setLead(e.target.checked)} className="accent-[#ff7a00] w-4 h-4 mt-0.5" />
              <span>
                Opening photo
                <span className="block text-xs text-gray-500">Fills the big title and opens the strip on every visit. Replaces the current opening photo.</span>
              </span>
            </label>
          </div>
        </div>

        <div className="flex flex-wrap justify-end gap-2 pt-2 border-t border-gray-800">
          <button type="button" onClick={onClose} disabled={saving} className={secondaryButton}>Cancel</button>
          <button type="submit" disabled={saving} className={primaryButton}>{saveLabel}</button>
        </div>
      </form>
    </dialog>
  );
}

// صور مجموعة واحدة: /admin/moments/:id — رفع عدة صور، ترتيب بالسحب، استبدال، نقل، وحذف
const MomentGroupImages = () => {
  const { id } = useParams();
  const groupId = Number(id);
  const [group, setGroup] = useState(null);
  const [groups, setGroups] = useState([]);
  const [images, setImages] = useState([]);
  const [savedOrder, setSavedOrder] = useState([]);
  const [loading, setLoading] = useState(true);
  const [loadError, setLoadError] = useState('');
  const [notice, setNotice] = useState(null);
  const [queue, setQueue] = useState([]);
  const [selectionErrors, setSelectionErrors] = useState([]);
  const [altAr, setAltAr] = useState('');
  const [altEn, setAltEn] = useState('');
  const [uploading, setUploading] = useState(false);
  const [dropActive, setDropActive] = useState(false);
  const [editing, setEditing] = useState(null);
  const [busyId, setBusyId] = useState(null);
  const [savingOrder, setSavingOrder] = useState(false);
  const [savingStrip, setSavingStrip] = useState(false);

  const applyImages = (list) => {
    setImages(list);
    setSavedOrder(list.map((image) => image.id));
  };

  // GET /admin/moment-groups/{id} مع قائمة المجموعات (لنقل الصور بينها)
  const load = useCallback(async () => {
    try {
      setLoadError('');
      const [groupResponse, groupsResponse] = await Promise.all([
        axiosClient.get(`/admin/moment-groups/${groupId}`),
        axiosClient.get('/admin/moment-groups'),
      ]);
      const loaded = groupResponse.data.data;
      setGroup(loaded);
      applyImages(loaded.images || []);
      setGroups(groupsResponse.data.data || []);
    } catch (error) {
      setLoadError(error.response?.status === 404 ? 'This photo group no longer exists.' : getApiErrorMessage(error, 'Failed to load the photo group.'));
    } finally {
      setLoading(false);
    }
  }, [groupId]);

  useEffect(() => {
    load();
  }, [load]);

  const order = useMemo(() => images.map((image) => image.id), [images]);
  const orderChanged = !sameOrder(order, savedOrder);
  const { itemProps, overIndex, dragIndex } = useDragSort(images, setImages);
  const pending = queue.filter((item) => item.status !== 'uploading');
  const visibleCount = images.filter((image) => image.is_published).length;
  const stripImageId = group ? effectiveStripImageId(group, images) : null;

  // تحذير قبل مغادرة الصفحة بترتيب غير محفوظ أو صور لم تُرفع
  useEffect(() => {
    if (!orderChanged && queue.length === 0) return undefined;
    const warn = (event) => { event.preventDefault(); };
    window.addEventListener('beforeunload', warn);
    return () => window.removeEventListener('beforeunload', warn);
  }, [orderChanged, queue.length]);

  // التحقق من النوع والحجم قبل الرفع، وتجاهل الملف نفسه إن اختير مرتين
  const addFiles = (fileList) => {
    const files = Array.from(fileList || []);
    if (files.length === 0) return;
    const problems = [];
    const accepted = [];
    const known = new Set(queue.map((item) => `${item.file.name}:${item.file.size}:${item.file.lastModified}`));
    files.forEach((file) => {
      const signature = `${file.name}:${file.size}:${file.lastModified}`;
      const problem = momentFileError(file);
      if (problem) problems.push(problem);
      else if (known.has(signature)) problems.push(`"${file.name}" is already selected.`);
      else {
        known.add(signature);
        accepted.push({ key: `queued-${++queueKey}`, file, status: 'ready', progress: null, error: '' });
      }
    });
    setSelectionErrors(problems);
    if (accepted.length) setQueue((prev) => [...prev, ...accepted]);
  };

  const patchQueue = (key, patch) => setQueue((prev) => prev.map((item) => (item.key === key ? { ...item, ...patch } : item)));

  // POST /admin/moment-groups/{id}/images — صورة في كل طلب، بالتتابع: تقدّم لكل صورة، وحدود الخادم لحجم الطلب لا تُتجاوز،
  // وفشل صورة (مكررة مثلاً) لا يوقف البقية
  const uploadAll = async () => {
    const items = queue.filter((item) => item.status !== 'uploading');
    if (items.length === 0) return;
    setUploading(true);
    setNotice(null);
    let done = 0;
    for (const item of items) {
      patchQueue(item.key, { status: 'uploading', progress: 0, error: '' });
      const formData = new FormData();
      formData.append('images[]', item.file);
      if (altAr.trim()) formData.append('alt_ar', altAr.trim());
      if (altEn.trim()) formData.append('alt_en', altEn.trim());
      try {
        const response = await axiosClient.post(`/admin/moment-groups/${groupId}/images`, formData, {
          onUploadProgress: (event) => patchQueue(item.key, { progress: uploadPercent(event) }),
        });
        const created = response.data.data || [];
        setImages((prev) => [...prev, ...created]);
        setSavedOrder((prev) => [...prev, ...created.map((image) => image.id)]);
        setQueue((prev) => prev.filter((queued) => queued.key !== item.key));
        done += 1;
      } catch (error) {
        patchQueue(item.key, { status: 'error', progress: null, error: getApiErrorMessage(error, 'Upload failed.') });
      }
    }
    setUploading(false);
    const failed = items.length - done;
    if (failed === 0) {
      setAltAr('');
      setAltEn('');
      setNotice({ type: 'success', text: `${done} photo${done === 1 ? '' : 's'} uploaded.` });
    } else {
      setNotice({ type: 'error', text: `${done} uploaded, ${failed} failed. Check the highlighted photos, then remove them or try again.` });
    }
  };

  // POST /admin/moment-groups/{id}/images/reorder
  const saveOrder = async () => {
    setSavingOrder(true);
    try {
      const response = await axiosClient.post(`/admin/moment-groups/${groupId}/images/reorder`, { images: order });
      applyImages(response.data.data || []);
      setNotice({ type: 'success', text: 'Photo order saved.' });
    } catch (error) {
      setNotice({ type: 'error', text: getApiErrorMessage(error, 'Failed to save the photo order.') });
    } finally {
      setSavingOrder(false);
    }
  };

  const resetOrder = () => {
    const byId = new Map(images.map((image) => [image.id, image]));
    setImages(savedOrder.map((imageId) => byId.get(imageId)).filter(Boolean));
  };

  // DELETE /admin/moment-images/{id}
  const handleDelete = async (image, index) => {
    if (!window.confirm(`Delete photo ${index + 1}? This cannot be undone.`)) return;
    setBusyId(image.id);
    try {
      await axiosClient.delete(`/admin/moment-images/${image.id}`);
      setImages((prev) => prev.filter((item) => item.id !== image.id));
      setSavedOrder((prev) => prev.filter((imageId) => imageId !== image.id));
      setNotice({ type: 'success', text: 'Photo deleted.' });
    } catch (error) {
      setNotice({ type: 'error', text: getApiErrorMessage(error, 'Failed to delete the photo.') });
    } finally {
      setBusyId(null);
    }
  };

  // PUT /admin/moment-groups/{id}: ما تعرضه المجموعة في الشريط
  const saveStrip = async (values) => {
    setSavingStrip(true);
    try {
      const response = await axiosClient.put(`/admin/moment-groups/${groupId}`, values);
      const updated = response.data.data;
      setGroup((prev) => ({ ...prev, strip_media: updated.strip_media, strip_image_id: updated.strip_image_id }));
      const text = { image: 'The strip will show a photo from this group.', video: 'The strip will show this group’s video.', none: 'This group is skipped in the strip.' }[updated.strip_media];
      setNotice({ type: 'success', text });
    } catch (error) {
      setNotice({ type: 'error', text: getApiErrorMessage(error, 'Failed to save the strip choice.') });
    } finally {
      setSavingStrip(false);
    }
  };

  const handleSaved = (updated, { replaced }) => {
    setEditing(null);
    if (updated.moment_group_id !== groupId) {
      const target = groups.find((g) => g.id === updated.moment_group_id);
      setImages((prev) => prev.filter((item) => item.id !== updated.id));
      setSavedOrder((prev) => prev.filter((imageId) => imageId !== updated.id));
      setNotice({ type: 'success', text: `Photo moved to “${target?.title.ar ?? 'another group'}”.` });
      return;
    }
    // صورة افتتاح واحدة فقط: اختيار هذه يلغي السابقة
    setImages((prev) => prev.map((item) => (item.id === updated.id ? updated : { ...item, is_lead: updated.is_lead ? false : item.is_lead })));
    setNotice({ type: 'success', text: replaced ? 'Photo replaced.' : 'Photo updated.' });
  };

  // PUT /admin/moment-images/{id} مع is_lead
  const toggleLead = async (image) => {
    setBusyId(image.id);
    try {
      const response = await axiosClient.put(`/admin/moment-images/${image.id}`, { is_lead: !image.is_lead });
      const updated = response.data.data;
      setImages((prev) => prev.map((item) => (item.id === updated.id ? updated : { ...item, is_lead: updated.is_lead ? false : item.is_lead })));
      const hiddenNote = !updated.is_published || !group.is_published ? ' It is hidden, so the website opens with a random photo until you show it.' : '';
      setNotice({ type: 'success', text: updated.is_lead ? `This is now the opening photo, shown first after the title.${hiddenNote}` : 'The section now opens with a random wide photo.' });
    } catch (error) {
      setNotice({ type: 'error', text: getApiErrorMessage(error, 'Failed to change the opening photo.') });
    } finally {
      setBusyId(null);
    }
  };

  const onDrop = (event) => {
    if (!event.dataTransfer?.files?.length) return;
    event.preventDefault();
    setDropActive(false);
    if (!uploading) addFiles(event.dataTransfer.files);
  };

  if (loading) {
    return <div className="p-8 text-center text-gray-400 min-h-screen bg-[#0d1117]">Loading photos...</div>;
  }

  if (loadError) {
    return (
      <div className="p-8 min-h-screen bg-[#0d1117] text-center space-y-4" dir="ltr">
        <p role="alert" className="text-red-400 text-sm">{loadError}</p>
        <div className="flex justify-center gap-4 text-sm">
          <button type="button" onClick={() => { setLoading(true); load(); }} className="text-[#ff7a00] font-semibold hover:underline cursor-pointer">Try again</button>
          <Link to="/admin/moments" className="text-gray-400 hover:underline">Back to groups</Link>
        </div>
      </div>
    );
  }

  return (
    <div className="p-4 md:p-8 max-w-7xl mx-auto min-h-screen bg-[#0d1117] text-gray-100" dir="ltr">
      <div className="flex flex-wrap justify-between items-center gap-4 mb-6 border-b border-gray-800 pb-4">
        <div className="min-w-0">
          <span className="text-xs text-gray-400">Admin / <Link to="/admin/moments" className="hover:text-[#ff7a00]">Real Moments</Link> /</span>
          <h1 className="text-xl font-bold text-white truncate" dir="rtl">{group.title.ar}</h1>
          <p className="text-sm text-gray-400">
            {group.title.en || 'No English title'} · {images.length} photo{images.length === 1 ? '' : 's'}{visibleCount !== images.length ? ` (${visibleCount} visible)` : ''}
            {!group.is_published && <span className="ml-2 px-2 py-0.5 rounded-full text-[11px] font-medium bg-yellow-500/10 text-yellow-400 border border-yellow-500/20">Group hidden from the website</span>}
          </p>
        </div>
        <Link to="/admin/moments" className={`${secondaryButton} flex items-center gap-2`}>
          <FiArrowLeft size={16} />
          <span>All groups</span>
        </Link>
      </div>

      {notice && (
        <div role="status" className={`p-4 mb-4 rounded-xl text-sm border flex items-start justify-between gap-3 ${notice.type === 'success' ? 'bg-green-500/10 text-green-400 border-green-500/25' : 'bg-red-500/10 text-red-400 border-red-500/25'}`}>
          <span>{notice.text}</span>
          <button type="button" onClick={() => setNotice(null)} aria-label="Dismiss message" className="cursor-pointer opacity-70 hover:opacity-100"><FiX size={16} /></button>
        </div>
      )}

      <StripPanel group={group} images={images} busy={savingStrip} onChange={saveStrip} />

      {/* الرفع */}
      <section aria-labelledby="upload-title" className="mb-8 bg-[#161b22] border border-gray-800 rounded-2xl p-4 md:p-6 space-y-4">
        <div>
          <h2 id="upload-title" className="text-sm font-semibold text-white">Add photos</h2>
          <p id="upload-hint" className="text-xs text-gray-500 mt-1">JPG, PNG or WebP, up to 2 MB each. Landscape photos around 1600 px wide work best. New photos are added to the end of the group.</p>
        </div>

        <label
          onDragOver={(e) => { if (e.dataTransfer?.types?.includes('Files')) { e.preventDefault(); setDropActive(true); } }}
          onDragLeave={() => setDropActive(false)}
          onDrop={onDrop}
          className={`flex flex-col items-center justify-center gap-2 py-8 rounded-xl border-2 border-dashed text-sm text-center cursor-pointer transition focus-within:border-[#ff7a00] ${dropActive ? 'border-[#ff7a00] bg-[#ff7a00]/5 text-[#ff7a00]' : 'border-gray-700 text-gray-400 hover:border-[#ff7a00] hover:text-[#ff7a00]'}`}
        >
          <FiUploadCloud size={28} aria-hidden="true" />
          <span><strong>Choose photos</strong> or drop them here</span>
          <span className="text-xs text-gray-500">You can select several at once</span>
          <input type="file" accept={MOMENT_IMAGE_ACCEPT} multiple disabled={uploading} onChange={(e) => { addFiles(e.target.files); e.target.value = ''; }} aria-describedby="upload-hint" className="sr-only" />
        </label>

        {selectionErrors.length > 0 && (
          <ul role="alert" className="text-xs text-red-400 space-y-1">
            {selectionErrors.map((message, i) => <li key={i}>{message}</li>)}
          </ul>
        )}

        {queue.length > 0 && (
          <>
            <ul className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-3" aria-label="Photos to upload">
              {queue.map((item) => (
                <QueueTile key={item.key} item={item} disabled={uploading} onRemove={() => setQueue((prev) => prev.filter((queued) => queued.key !== item.key))} />
              ))}
            </ul>
            <div className="grid gap-3 sm:grid-cols-2">
              <div>
                <label htmlFor="upload-alt-ar" className="block text-xs font-semibold text-gray-400 mb-1.5">Description (Arabic) — optional, for all of these photos</label>
                <input id="upload-alt-ar" value={altAr} onChange={(e) => setAltAr(e.target.value)} maxLength={255} dir="rtl" disabled={uploading} className={inputClass} placeholder="ما الذي يظهر في الصور؟" />
              </div>
              <div>
                <label htmlFor="upload-alt-en" className="block text-xs font-semibold text-gray-400 mb-1.5">Description (English) — optional</label>
                <input id="upload-alt-en" value={altEn} onChange={(e) => setAltEn(e.target.value)} maxLength={255} disabled={uploading} className={inputClass} placeholder="What do the photos show?" />
              </div>
            </div>
            <div className="flex flex-wrap items-center gap-2">
              <button type="button" onClick={uploadAll} disabled={uploading || pending.length === 0} className={primaryButton}>
                <FiUploadCloud size={16} />
                <span>{uploading ? 'Uploading...' : `Upload ${pending.length} photo${pending.length === 1 ? '' : 's'}`}</span>
              </button>
              <button type="button" onClick={() => { setQueue([]); setSelectionErrors([]); }} disabled={uploading} className={secondaryButton}>Clear selection</button>
            </div>
          </>
        )}
      </section>

      {/* المعرض والترتيب */}
      <section aria-labelledby="gallery-title">
        <div className="flex flex-wrap items-end justify-between gap-3 mb-3">
          <div>
            <h2 id="gallery-title" className="text-sm font-semibold text-white">Photos</h2>
            <p className="text-xs text-gray-500 mt-1">Drag photos (or use the arrows) to set their order, then save. Hidden photos are never picked for the website. The ★ button makes a photo the opening photo, shown right after the title.</p>
          </div>
        </div>

        {orderChanged && (
          <div className="sticky top-14 md:top-0 z-10 mb-4 p-3 rounded-xl border border-[#ff7a00]/40 bg-[#1f1a14] flex flex-wrap items-center justify-between gap-3">
            <span className="text-sm text-[#ffb366]">The photo order has changed and isn’t saved yet.</span>
            <div className="flex gap-2">
              <button type="button" onClick={resetOrder} disabled={savingOrder} className={secondaryButton}>Reset</button>
              <button type="button" onClick={saveOrder} disabled={savingOrder} className={primaryButton}>
                <FiCheckCircle size={16} />
                <span>{savingOrder ? 'Saving...' : 'Save order'}</span>
              </button>
            </div>
          </div>
        )}

        {images.length === 0 ? (
          <div className="bg-[#161b22] rounded-2xl p-12 text-center border border-gray-800">
            <p className="text-gray-400 text-sm">This group has no photos yet. Add some above.</p>
          </div>
        ) : (
          <ul className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-3">
            {images.map((image, index) => (
              <ImageTile
                key={image.id}
                image={image}
                index={index}
                count={images.length}
                inStrip={image.id === stripImageId}
                dragProps={itemProps(index)}
                isOver={overIndex === index && dragIndex !== index}
                isDragging={dragIndex === index}
                busy={busyId === image.id}
                onMove={(step) => {
                  const target = index + step;
                  if (target >= 0 && target < images.length) setImages(moveItem(images, index, target));
                }}
                onLead={() => toggleLead(image)}
                onEdit={() => setEditing(image)}
                onDelete={() => handleDelete(image, index)}
              />
            ))}
          </ul>
        )}
      </section>

      {editing && (
        <ImageEditor
          key={editing.id}
          image={editing}
          groups={groups}
          groupId={groupId}
          onClose={() => setEditing(null)}
          onSaved={handleSaved}
        />
      )}
    </div>
  );
};

export default MomentGroupImages;
