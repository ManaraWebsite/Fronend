import React, { useState } from 'react';
import axiosClient from './axiosClient';
import { 
  FiType, FiFileText, FiMail, FiHash, FiPhone, 
  FiCalendar, FiChevronDown, FiCheckSquare, FiRadio, FiUpload, 
  FiTrash2, FiArrowUp, FiArrowDown, FiCheck, FiSave 
} from 'react-icons/fi';

const CreateForm = () => {
  const [slug, setSlug] = useState('untitled-form');
  const [status, setStatus] = useState('Draft'); // Draft or Published
  const [fields, setFields] = useState([
    { id: 1, type: 'text', label: 'Text', placeholder: '', helpText: '', required: false, minLength: '', maxLength: '' },
    { id: 2, type: 'textarea', label: 'Textarea', placeholder: '', helpText: '', required: false },
    { id: 3, type: 'email', label: 'Email', placeholder: '', helpText: '', required: false }
  ]);
  const [selectedFieldIndex, setSelectedFieldIndex] = useState(0);
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState('');

  // أنواع الحقول المتاحة للاضافة مع الأيقونات
  const fieldTypes = [
    { type: 'text', label: 'Text', icon: FiType },
    { type: 'textarea', label: 'Textarea', icon: FiFileText },
    { type: 'email', label: 'Email', icon: FiMail },
    { type: 'number', label: 'Number', icon: FiHash },
    { type: 'phone', label: 'Phone', icon: FiPhone },
    { type: 'date', label: 'Date', icon: FiCalendar },
    { type: 'dropdown', label: 'Dropdown', icon: FiChevronDown },
    { type: 'checkbox', label: 'Checkbox', icon: FiCheckSquare },
    { type: 'radio', label: 'Radio', icon: FiRadio },
    { type: 'file', label: 'File Upload', icon: FiUpload },
  ];

  // إضافة حقل جديد للقائمة
  const addField = (typeObj) => {
    const newField = {
      id: Date.now(),
      type: typeObj.type,
      label: typeObj.label,
      placeholder: '',
      helpText: '',
      required: false,
    };
    setFields([...fields, newField]);
    setSelectedFieldIndex(fields.length); // تحديد الحقل الجديد تلقائياً
  };

  // حذف حقل
  const removeField = (index, e) => {
    e.stopPropagation();
    const updated = fields.filter((_, i) => i !== index);
    setFields(updated);
    if (selectedFieldIndex >= updated.length) {
      setSelectedFieldIndex(Math.max(0, updated.length - 1));
    }
  };

  // تحريك الحقل للأعلى
  const moveUp = (index, e) => {
    e.stopPropagation();
    if (index === 0) return;
    const updated = [...fields];
    const temp = updated[index];
    updated[index] = updated[index - 1];
    updated[index - 1] = temp;
    setFields(updated);
    setSelectedFieldIndex(index - 1);
  };

  // تحريك الحقل للأسفل
  const moveDown = (index, e) => {
    e.stopPropagation();
    if (index === fields.length - 1) return;
    const updated = [...fields];
    const temp = updated[index];
    updated[index] = updated[index + 1];
    updated[index + 1] = temp;
    setFields(updated);
    setSelectedFieldIndex(index + 1);
  };

  // تحديث خصائص الحقل المحدد حالياً
  const updateSelectedField = (key, value) => {
    if (fields.length === 0) return;
    const updated = [...fields];
    updated[selectedFieldIndex][key] = value;
    setFields(updated);
  };

  // إرسال النموذج وحفظه للسيرفر
  const handleSubmit = async (formStatus) => {
    setLoading(true);
    setMessage('');
    try {
      const payload = {
        slug: slug,
        status: formStatus,
        fields: fields
      };
      const response = await axiosClient.post('/admin/forms', payload);
      setMessage('تم إنشاء النموذج بنجاح!');
    } catch (error) {
      console.error(error);
      setMessage('حدث خطأ أثناء حفظ النموذج، تأكد من البيانات.');
    } finally {
      setLoading(false);
    }
  };

  const selectedField = fields[selectedFieldIndex] || {};

  return (
    <div className="p-8 max-w-7xl mx-auto min-h-screen bg-[#0d1117] text-gray-100" dir="ltr">
      {/* رأس الصفحة والمبريد */}
      <div className="flex justify-between items-center mb-6 border-b border-gray-800 pb-4">
        <div>
          <span className="text-xs text-gray-400">Admin / Forms /</span>
          <h1 className="text-xl font-bold text-white">Create Form</h1>
        </div>
      </div>

      {message && (
        <div className={`p-4 mb-4 rounded-xl text-sm border ${message.includes('نجاح') ? 'bg-green-500/10 text-green-400 border-green-500/20' : 'bg-red-500/10 text-red-400 border-red-500/20'}`}>
          {message}
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        
        {/* القسم الأيسر: إعدادات النموذج العامة والحقول */}
        <div className="lg:col-span-2 space-y-6">
          
          {/* صندوق الـ Slug والـ Status */}
          <div className="bg-[#161b22] p-4 rounded-2xl shadow-xs border border-gray-800 grid grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold text-gray-400 uppercase mb-1">Slug</label>
              <input 
                type="text" 
                value={slug}
                onChange={(e) => setSlug(e.target.value)}
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
          </div>

          {/* صندوق إضافة حقل جديد (Add a Field) */}
          <div className="bg-[#161b22] p-6 rounded-2xl shadow-xs border border-gray-800">
            <h2 className="text-xs font-semibold text-gray-400 uppercase mb-4">Add a Field</h2>
            <div className="grid grid-cols-2 sm:grid-cols-5 gap-3">
              {fieldTypes.map((item, idx) => {
                const IconComponent = item.icon;
                return (
                  <button
                    key={idx}
                    type="button"
                    onClick={() => addField(item)}
                    className="flex flex-col items-center justify-center p-3 border border-gray-800 rounded-xl bg-[#0d1117] hover:border-[#ff7a00] hover:bg-[#ff7a00]/10 transition group"
                  >
                    <IconComponent className="text-gray-400 group-hover:text-[#ff7a00] mb-2 text-lg" />
                    <span className="text-xs font-medium text-gray-300">{item.label}</span>
                  </button>
                );
              })}
            </div>
          </div>

          {/* قائمة الحقول المُضافة (Fields List) */}
          <div className="bg-[#161b22] p-6 rounded-2xl shadow-xs border border-gray-800">
            <h2 className="text-xs font-semibold text-gray-400 uppercase mb-4">Fields ({fields.length})</h2>
            
            {fields.length === 0 ? (
              <p className="text-sm text-gray-500 text-center py-6">No fields added yet. Click an option above to add one.</p>
            ) : (
              <div className="space-y-3">
                {fields.map((f, index) => (
                  <div
                    key={f.id}
                    onClick={() => setSelectedFieldIndex(index)}
                    className={`flex items-center justify-between p-3.5 rounded-xl border cursor-pointer transition ${selectedFieldIndex === index ? 'border-[#ff7a00] bg-[#ff7a00]/10 ring-1 ring-[#ff7a00]' : 'border-gray-800 bg-[#0d1117] hover:bg-gray-800/50'}`}
                  >
                    <div className="flex items-center space-x-3">
                      <span className="text-gray-600 cursor-grab">⋮⋮</span>
                      <span className="text-xs font-semibold px-2 py-1 bg-[#ff7a00]/20 text-[#ff7a00] rounded uppercase">{f.type}</span>
                      <span className="text-sm font-medium text-gray-200">{f.label || 'Untitled Field'}</span>
                    </div>

                    <div className="flex items-center space-x-2">
                      <button type="button" onClick={(e) => moveUp(index, e)} className="p-1.5 text-gray-500 hover:text-gray-300 rounded">
                        <FiArrowUp size={14} />
                      </button>
                      <button type="button" onClick={(e) => moveDown(index, e)} className="p-1.5 text-gray-500 hover:text-gray-300 rounded">
                        <FiArrowDown size={14} />
                      </button>
                      <button type="button" onClick={(e) => removeField(index, e)} className="p-1.5 text-red-400 hover:text-red-300 rounded">
                        <FiTrash2 size={14} />
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

        </div>

        {/* القسم الأيمن: إعدادات الحقل المحدد (Field Settings) */}
        <div className="bg-[#161b22] p-6 rounded-2xl shadow-xs border border-gray-800 h-fit space-y-4">
          <h2 className="text-xs font-semibold text-gray-400 uppercase tracking-wider mb-2">Field Settings</h2>
          
          {fields.length === 0 ? (
            <p className="text-xs text-gray-500">Select a field to edit its settings.</p>
          ) : (
            <>
              <div>
                <span className="inline-block px-2 py-1 bg-[#ff7a00]/20 text-[#ff7a00] rounded text-xs font-medium mb-3">
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

      {/* أزرار الحفظ والنشر في الأسفل */}
      <div className="flex justify-end items-center space-x-3 mt-8 pt-4 border-t border-gray-800">
        <button 
          type="button" 
          onClick={() => handleSubmit('Draft')}
          disabled={loading}
          className="px-5 py-2.5 bg-[#161b22] border border-gray-800 text-gray-300 rounded-xl text-sm font-semibold hover:bg-gray-800 transition shadow-xs"
        >
          Save as Draft
        </button>
        <button 
          type="button" 
          onClick={() => handleSubmit('Published')}
          disabled={loading}
          className="px-5 py-2.5 bg-[#ff7a00] text-white rounded-xl text-sm font-semibold hover:bg-[#e06c00] transition shadow-sm flex items-center space-x-2"
        >
          <FiCheck />
          <span>Publish</span>
        </button>
      </div>

    </div>
  );
};

export default CreateForm;