import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import axiosClient from './axiosClient';
import { 
  FiType, FiFileText, FiMail, FiHash, FiPhone, 
  FiCalendar, FiChevronDown, FiCheckSquare, FiRadio, FiUpload, 
  FiTrash2, FiArrowUp, FiArrowDown, FiCheck, FiImage, FiX 
} from 'react-icons/fi';

export function EditForm() {
  const { slug } = useParams();
  const navigate = useNavigate();

  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [formSlug, setFormSlug] = useState('');
  const [status, setStatus] = useState('Draft');

  const [fields, setFields] = useState([]);
  const [selectedFieldId, setSelectedFieldId] = useState(null);

  // إدارة الصورة
  const [image, setImage] = useState(null);
  const [imagePreview, setImagePreview] = useState(null);

  const [submitting, setSubmitting] = useState(false);
  const [loading, setLoading] = useState(true);
  const [message, setMessage] = useState('');

  const fieldTypes = [
    { type: 'text', label: 'Text', icon: FiType },
    { type: 'textarea', label: 'Textarea', icon: FiFileText },
    { type: 'email', label: 'Email', icon: FiMail },
    { type: 'number', label: 'Number', icon: FiHash },
    { type: 'tel', label: 'Phone', icon: FiPhone },
    { type: 'date', label: 'Date', icon: FiCalendar },
    { type: 'select', label: 'Dropdown', icon: FiChevronDown },
    { type: 'checkbox', label: 'Checkbox', icon: FiCheckSquare },
    { type: 'radio', label: 'Radio', icon: FiRadio },
    { type: 'file', label: 'File Upload', icon: FiUpload },
  ];

  const getSafeString = (val) => {
    if (!val) return '';
    if (typeof val === 'object') {
      return val.ar || val.en || Object.values(val)[0] || '';
    }
    return String(val);
  };

  const generateSlug = (text) => {
    return text
      .toLowerCase()
      .trim()
      .replace(/[^\w\s-]/g, '')
      .replace(/[\s_-]+/g, '-')
      .replace(/^-+|-+$/g, '') || 'untitled-form-' + Date.now();
  };

  // جلب بيانات النموذج عند فتح الصفحة
  useEffect(() => {
    axiosClient.get(`/admin/forms/${slug}`)
      .then(response => {
        const formData = response.data.data || response.data;
        setTitle(getSafeString(formData.title));
        setDescription(getSafeString(formData.description));
        setFormSlug(formData.slug || '');

        const isActiveVal = formData.is_active ?? formData.status;
        setStatus(isActiveVal === 1 || isActiveVal === 'Published' ? 'Published' : 'Draft');

        if (formData.image_url || formData.image) {
          setImagePreview(formData.image_url || formData.image);
        }

        // معالجة الحقول والـ options بنفس هيكلية CreateForm تماماً
        const processedFields = (formData.fields || []).map((f, index) => ({
          id: f.id || Date.now() + index,
          type: getSafeString(f.type) === 'tel' ? 'text' : (getSafeString(f.type) || 'text'),
          label: getSafeString(f.label),
          placeholder: getSafeString(f.placeholder),
          helpText: getSafeString(f.helpText || f.help_text),
          required: Boolean(f.required || f.is_required),
          options: Array.isArray(f.options) 
            ? f.options.map(opt => getSafeString(opt)) 
            : (['select', 'radio', 'checkbox'].includes(f.type) ? [''] : null)
        }));

        setFields(processedFields);
        if (processedFields.length > 0) {
          setSelectedFieldId(processedFields[0].id);
        }
        setLoading(false);
      })
      .catch(error => {
        console.error("Error fetching form:", error);
        setLoading(false);
        setMessage('فشل في تحميل بيانات النموذج.');
      });
  }, [slug]);

  const handleImageChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setImage(file);
      setImagePreview(URL.createObjectURL(file));
    }
  };

  const removeImage = () => {
    setImage(null);
    setImagePreview(null);
  };

  const addField = (typeObj) => {
    const needsOptions = ['select', 'radio', 'checkbox'].includes(typeObj.type);
    const newField = {
      id: Date.now(),
      type: typeObj.type,
      label: typeObj.label,
      placeholder: '',
      helpText: '',
      required: false,
      options: needsOptions ? [''] : null,
    };
    setFields([...fields, newField]);
    setSelectedFieldId(newField.id);
  };

  const removeField = (id, e) => {
    e.stopPropagation();
    const updated = fields.filter((f) => f.id !== id);
    setFields(updated);
    if (selectedFieldId === id) {
      setSelectedFieldId(updated[0]?.id || null);
    }
  };

  const moveField = (index, direction, e) => {
    e.stopPropagation();
    const newIndex = direction === 'up' ? index - 1 : index + 1;
    if (newIndex < 0 || newIndex >= fields.length) return;

    const updated = [...fields];
    const tempVal = updated[index];
    updated[index] = updated[newIndex];
    updated[newIndex] = tempVal;

    setFields(updated);
  };

  const updateSelectedField = (key, value) => {
    if (!selectedFieldId) return;
    setFields(fields.map(f => f.id === selectedFieldId ? { ...f, [key]: value } : f));
  };

  // تحديث النموذج وإرساله بالطريقة الصحيحة (Multipart FormData) متطابقة مع CreateForm
  const handleUpdate = async (targetStatus) => {
    setSubmitting(true);
    setMessage('');

    try {
      const generatedSlug = generateSlug(title);
      const formData = new FormData();
      formData.append('title', title || 'Untitled Form');
      formData.append('description', description || '');
      formData.append('slug', generatedSlug);
      formData.append('is_active', targetStatus === 'Published' ? 1 : 0);

      fields.forEach((field, index) => {
        let cleanType = typeof field.type === 'string' ? field.type : 'text';
        if (cleanType === 'tel') cleanType = 'text';

        formData.append(`fields[${index}][type]`, cleanType);
        formData.append(`fields[${index}][label]`, field.label || '');
        formData.append(`fields[${index}][placeholder]`, field.placeholder || '');
        formData.append(`fields[${index}][help_text]`, field.helpText || '');
        formData.append(`fields[${index}][is_required]`, field.required ? 1 : 0);
        formData.append(`fields[${index}][order]`, index + 1);
        formData.append(`fields[${index}][section]`, 'general');

        if (field.options && Array.isArray(field.options)) {
          field.options.forEach((opt, optIndex) => {
            if (opt && opt.trim() !== '') {
              formData.append(`fields[${index}][options][${optIndex}]`, opt);
            }
          });
        }
      });

      if (image) {
        formData.append('image', image);
      }

      // دعم بعض الـ Backends التي تتطلب _method لعكس طلب الـ PUT مع الـ FormData
      formData.append('_method', 'PUT');

      await axiosClient.post(`/admin/forms/${slug}`, formData, {
        headers: { 'Content-Type': 'multipart/form-data' }
      });

      setMessage('تم تحديث النموذج بنجاح!');
      setTimeout(() => {
        navigate('/admin/forms');
      }, 1000);
    } catch (error) {
      console.error('API Error Response:', error.response?.data);
      const errorMsg = error.response?.data?.message || error.response?.data?.error || 'حدث خطأ أثناء تحديث النموذج.';
      setMessage(errorMsg);
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) {
    return <div className="p-8 text-center text-gray-400 min-h-screen bg-[#0d1117] flex items-center justify-center">جاري تحميل البيانات...</div>;
  }

  const selectedField = fields.find(f => f.id === selectedFieldId) || {};

  return (
    <div className="p-8 max-w-7xl mx-auto min-h-screen bg-[#0d1117] text-gray-100" dir="ltr">
      <div className="flex justify-between items-center mb-6 border-b border-gray-800 pb-4">
        <div>
          <span className="text-xs text-gray-400">Admin / Forms / Edit /</span>
          <h1 className="text-xl font-bold text-white">Edit Single-Page Form</h1>
        </div>
      </div>

      {message && (
        <div className={`p-4 mb-4 rounded-xl text-sm border ${message.includes('نجاح') ? 'bg-green-500/10 text-green-400 border-green-500/25' : 'bg-red-500/10 text-red-400 border-red-500/25'}`}>
          {message}
        </div>
      )}

      {/* معاينة النموذج (Form Live Preview) */}
      <div className="bg-[#161b22] rounded-2xl border border-gray-800 mb-8 overflow-hidden shadow-sm">
        <div className="w-full h-32 bg-[#0d1117] border-b border-gray-800 relative flex items-center justify-center overflow-hidden">
          {imagePreview ? (
            <>
              <img src={imagePreview} alt="Form Cover" className="w-full h-full object-cover" />
              <button type="button" onClick={removeImage} className="absolute top-2 right-2 bg-black/60 text-white p-1.5 rounded-full hover:bg-red-600 transition cursor-pointer">
                <FiX size={14} />
              </button>
            </>
          ) : (
            <div className="flex flex-col items-center text-gray-500 text-xs gap-1">
              <FiImage size={20} />
              <span>Header Image Frame (Optional)</span>
            </div>
          )}
        </div>

        <div className="p-6 space-y-4">
          <div className="flex justify-between items-center">
            <div>
              <h2 className="text-lg font-bold text-white">{title || 'Untitled Course Registration'}</h2>
              <p className="text-xs text-gray-400 mt-1">{description || 'Please complete the following form to register.'}</p>
            </div>
            <span className="text-xs bg-[#ff7a00]/20 text-[#ff7a00] px-3 py-1 rounded-full font-semibold">
              Status: {status}
            </span>
          </div>

          {/* عرض كافة الحقول بصفحة واحدة في المعاينة */}
          <div className="mt-6 space-y-4 pt-4 border-t border-gray-800/60">
            <h3 className="text-xs font-bold text-[#ff7a00] uppercase tracking-wider">
              Form Fields ({fields.length})
            </h3>

            {fields.length === 0 ? (
              <p className="text-xs text-gray-500 italic py-3">No fields added yet.</p>
            ) : (
              fields.map((field) => (
                <div key={field.id} className="space-y-1">
                  <label className="block text-xs font-medium text-gray-300">
                    {field.label} {field.required && <span className="text-red-500">*</span>}
                  </label>
                  {field.type === 'select' ? (
                    <select className="w-full bg-[#0d1117] border border-gray-800 rounded-xl p-2.5 text-sm text-gray-400 focus:outline-none">
                      <option>اختر من القائمة...</option>
                      {field.options?.map((opt, i) => <option key={i}>{opt}</option>)}
                    </select>
                  ) : (
                    <input 
                      type={field.type} 
                      placeholder={field.placeholder || ''} 
                      disabled 
                      className="w-full bg-[#0d1117] border border-gray-800 rounded-xl p-2.5 text-sm text-gray-500 cursor-not-allowed"
                    />
                  )}
                </div>
              ))
            )}
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="lg:col-span-2 space-y-6">
          {/* إعدادات النموذج الأساسية */}
          <div className="bg-[#161b22] p-4 rounded-2xl border border-gray-800 grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div className="sm:col-span-2">
              <label className="block text-xs font-semibold text-gray-400 uppercase mb-1">Title</label>
              <input 
                type="text" 
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                placeholder="Form title..."
                className="w-full bg-[#0d1117] border border-gray-800 rounded-xl p-2.5 text-sm text-gray-200 focus:outline-none focus:border-[#ff7a00]"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-gray-400 uppercase mb-1">Status</label>
              <select 
                value={status}
                onChange={(e) => setStatus(e.target.value)}
                className="w-full bg-[#0d1117] border border-gray-800 rounded-xl p-2.5 text-sm text-gray-200 focus:outline-none focus:border-[#ff7a00]"
              >
                <option value="Draft">Draft</option>
                <option value="Published">Published</option>
              </select>
            </div>

            <div className="sm:col-span-3">
              <label className="block text-xs font-semibold text-gray-400 uppercase mb-1">Description</label>
              <textarea 
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                placeholder="Form description..."
                rows="2"
                className="w-full bg-[#0d1117] border border-gray-800 rounded-xl p-2.5 text-sm text-gray-200 focus:outline-none focus:border-[#ff7a00]"
              />
            </div>

            <div className="sm:col-span-3">
              <label className="block text-xs font-semibold text-gray-400 uppercase mb-1">Header Image / Frame</label>
              <div className="flex items-center gap-3">
                <label className="flex-1 flex items-center justify-center gap-2 p-3 bg-[#0d1117] border border-gray-800 border-dashed rounded-xl cursor-pointer hover:border-[#ff7a00] transition text-xs text-gray-400">
                  <FiUpload size={16} />
                  <span>{image ? image.name : 'Choose header image...'}</span>
                  <input type="file" accept="image/*" onChange={handleImageChange} className="hidden" />
                </label>
                {imagePreview && (
                  <button type="button" onClick={removeImage} className="px-4 py-3 bg-red-500/10 text-red-400 border border-red-500/20 rounded-xl text-xs font-semibold hover:bg-red-500/20 transition cursor-pointer">
                    Remove
                  </button>
                )}
              </div>
            </div>
          </div>

          {/* أزرار إضافة الحقول */}
          <div className="bg-[#161b22] p-6 rounded-2xl border border-gray-800">
            <h2 className="text-xs font-semibold text-gray-400 uppercase mb-4">Add Field</h2>
            <div className="grid grid-cols-2 sm:grid-cols-5 gap-3">
              {fieldTypes.map((item, idx) => {
                const IconComponent = item.icon;
                return (
                  <button
                    key={idx}
                    type="button"
                    onClick={() => addField(item)}
                    className="flex flex-col items-center justify-center p-3 border border-gray-800 rounded-xl bg-[#0d1117] hover:border-[#ff7a00] hover:bg-[#ff7a00]/10 transition group cursor-pointer"
                  >
                    <IconComponent className="text-gray-400 group-hover:text-[#ff7a00] mb-2 text-lg" />
                    <span className="text-xs font-medium text-gray-300">{item.label}</span>
                  </button>
                );
              })}
            </div>
          </div>

          {/* إدارة الحقول */}
          <div className="bg-[#161b22] p-6 rounded-2xl border border-gray-800">
            <h2 className="text-xs font-semibold text-gray-400 uppercase mb-4">
              Form Fields ({fields.length})
            </h2>

            {fields.length === 0 ? (
              <p className="text-sm text-gray-500 text-center py-6">No fields added yet. Click an option above to add one.</p>
            ) : (
              <div className="space-y-3">
                {fields.map((f, index) => (
                  <div
                    key={f.id}
                    onClick={() => setSelectedFieldId(f.id)}
                    className={`flex items-center justify-between p-3.5 rounded-xl border cursor-pointer transition ${selectedFieldId === f.id ? 'border-[#ff7a00] bg-[#ff7a00]/15 ring-1 ring-[#ff7a00]' : 'border-gray-800 bg-[#0d1117] hover:bg-gray-800/50'}`}
                  >
                    <div className="flex items-center gap-3">
                      <span className="text-gray-600">⋮⋮</span>
                      <span className="text-xs font-semibold px-2 py-1 bg-[#ff7a00]/20 text-[#ff7a00] rounded uppercase">{f.type}</span>
                      <span className="text-sm font-medium text-gray-200">{f.label || 'Untitled Field'}</span>
                    </div>

                    <div className="flex items-center gap-2">
                      <button type="button" onClick={(e) => moveField(index, 'up', e)} className="p-1.5 text-gray-500 hover:text-gray-300 rounded"><FiArrowUp size={14} /></button>
                      <button type="button" onClick={(e) => moveField(index, 'down', e)} className="p-1.5 text-gray-500 hover:text-gray-300 rounded"><FiArrowDown size={14} /></button>
                      <button type="button" onClick={(e) => removeField(f.id, e)} className="p-1.5 text-red-400 hover:text-red-300 rounded"><FiTrash2 size={14} /></button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* إعدادات الحقل الجانبية */}
        <div className="bg-[#161b22] p-6 rounded-2xl border border-gray-800 h-fit space-y-4">
          <h2 className="text-xs font-semibold text-gray-400 uppercase tracking-wider mb-2">Field Settings</h2>

          {!selectedFieldId || (!selectedField.label && fields.length === 0) ? (
            <p className="text-xs text-gray-500">Select a field to edit its settings.</p>
          ) : (
            <>
              <div>
                <span className="inline-block px-2 py-1 bg-[#ff7a00]/20 text-[#ff7a00] rounded text-xs font-medium uppercase">
                  {selectedField.type}
                </span>
              </div>

              <div>
                <label className="block text-xs font-semibold text-gray-400 mb-1">Label</label>
                <input 
                  type="text" 
                  value={selectedField.label || ''}
                  onChange={(e) => updateSelectedField('label', e.target.value)}
                  className="w-full bg-[#0d1117] border border-gray-800 rounded-xl p-2.5 text-sm text-gray-200 focus:outline-none focus:border-[#ff7a00]"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-gray-400 mb-1">Placeholder</label>
                <input 
                  type="text" 
                  value={selectedField.placeholder || ''}
                  onChange={(e) => updateSelectedField('placeholder', e.target.value)}
                  className="w-full bg-[#0d1117] border border-gray-800 rounded-xl p-2.5 text-sm text-gray-200 focus:outline-none focus:border-[#ff7a00]"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-gray-400 mb-1">Help text <span className="text-gray-600 font-normal">optional</span></label>
                <input 
                  type="text" 
                  value={selectedField.helpText || ''}
                  onChange={(e) => updateSelectedField('helpText', e.target.value)}
                  className="w-full bg-[#0d1117] border border-gray-800 rounded-xl p-2.5 text-sm text-gray-200 focus:outline-none focus:border-[#ff7a00]"
                />
              </div>

              {['select', 'radio', 'checkbox'].includes(selectedField.type) && (
                <div className="space-y-2 pt-3 border-t border-gray-800">
                  <label className="block text-xs font-semibold text-gray-400 uppercase">Options</label>
                  {selectedField.options?.map((opt, optIndex) => (
                    <div key={optIndex} className="flex items-center gap-2">
                      <input 
                        type="text" 
                        value={opt}
                        placeholder={`Option ${optIndex + 1}`}
                        onChange={(e) => {
                          const updatedOptions = [...selectedField.options];
                          updatedOptions[optIndex] = e.target.value;
                          updateSelectedField('options', updatedOptions);
                        }}
                        className="w-full bg-[#0d1117] border border-gray-800 rounded-xl p-2.5 text-xs text-gray-200 focus:outline-none focus:border-[#ff7a00]"
                      />
                      <button 
                        type="button"
                        onClick={() => {
                          const updatedOptions = selectedField.options.filter((_, i) => i !== optIndex);
                          updateSelectedField('options', updatedOptions);
                        }}
                        className="text-red-400 hover:text-red-300 text-xs px-2 py-1"
                      >
                        <FiTrash2 size={14} />
                      </button>
                    </div>
                  ))}
                  <button 
                    type="button"
                    onClick={() => {
                      const updatedOptions = [...(selectedField.options || []), ''];
                      updateSelectedField('options', updatedOptions);
                    }}
                    className="text-xs text-[#ff7a00] hover:underline mt-1 block font-medium cursor-pointer"
                  >
                    + Add Option
                  </button>
                </div>
              )}

              <div className="flex items-center justify-between pt-2 border-t border-gray-800">
                <span className="text-xs font-semibold text-gray-400">Required field</span>
                <label className="relative inline-flex items-center cursor-pointer">
                  <input 
                    type="checkbox" 
                    checked={selectedField.required || false}
                    onChange={(e) => updateSelectedField('required', e.target.checked)}
                    className="sr-only peer"
                  />
                  <div className="w-9 h-5 bg-gray-800 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-4 after:w-4 after:transition-all peer-checked:bg-[#ff7a00]"></div>
                </label>
              </div>
            </>
          )}
        </div>
      </div>

      <div className="flex justify-end items-center gap-3 mt-8 pt-4 border-t border-gray-800">
        <button type="button" onClick={() => handleUpdate('Draft')} disabled={submitting} className="px-5 py-2.5 bg-[#161b22] border border-gray-800 text-gray-300 rounded-xl text-sm font-semibold hover:bg-gray-800 transition cursor-pointer">
          {submitting ? 'Saving...' : 'Save as Draft'}
        </button>
        <button type="button" onClick={() => handleUpdate('Published')} disabled={submitting} className="px-5 py-2.5 bg-[#ff7a00] text-white rounded-xl text-sm font-semibold hover:bg-[#e06c00] transition shadow-sm flex items-center gap-2 cursor-pointer">
          <FiCheck />
          <span>{submitting ? 'Updating...' : 'Update Form'}</span>
        </button>
      </div>
    </div>
  );
}

export default EditForm;