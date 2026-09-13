import React, { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import axiosClient from './axiosClient';
import { FiCheckCircle } from 'react-icons/fi';

const PublicFormView = () => {
  const { slug } = useParams();
  const [form, setForm] = useState(null);
  const [loading, setLoading] = useState(true);
  const [formData, setFormData] = useState({});
  const [submitting, setSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');

  const renderSafeValue = (val, fallback = '') => {
    if (val === null || val === undefined) return fallback;
    if (typeof val === 'object') {
      return val.ar || val.en || JSON.stringify(val);
    }
    return String(val);
  };

  useEffect(() => {
    const fetchPublicForm = async () => {
      try {
        const response = await axiosClient.get(`/forms/${slug}`);
        const data = response.data.data || response.data;
        console.log("Form Fields:", data.fields);
        setForm(data);
      } catch (error) {
        console.error('Error fetching form:', error);
        setErrorMessage('عذراً، هذا النموذج غير موجود أو تم إيقافه.');
      } finally {
        setLoading(false);
      }
    };

    fetchPublicForm();
  }, [slug]);

  const handleChange = (fieldId, value) => {
    setFormData({
      ...formData,
      [fieldId]: value
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSubmitting(true);
    setErrorMessage('');

    try {
      // بناء FormData تماماً مثل بوستمان بحيث يكون كل حقل بالشكل answers[fieldId]
      const dataToSend = new FormData();
      Object.keys(formData).forEach((fieldId) => {
        dataToSend.append(`answers[${fieldId}]`, formData[fieldId]);
      });

      await axiosClient.post(`/forms/${slug}/submit`, dataToSend, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      });

      setSubmitted(true);
    } catch (error) {
      console.error('Error submitting form:', error.response?.data || error);
      
      const errorData = error.response?.data;
      let errorMsg = 'حدث خطأ أثناء إرسال الرد، يرجى المحاولة لاحقاً.';
      
      if (typeof errorData === 'string') {
        errorMsg = errorData;
      } else if (errorData?.message) {
        errorMsg = errorData.message;
      } else if (errorData?.errors) {
        errorMsg = Object.values(errorData.errors).flat().join(' - ');
      }
      
      setErrorMessage(errorMsg);
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center min-h-screen bg-[#0d1117] text-gray-400">
        جاري تحميل النموذج...
      </div>
    );
  }

  if (errorMessage && !form) {
    return (
      <div className="flex flex-col justify-center items-center min-h-screen bg-[#0d1117] text-gray-400 space-y-4">
        <p className="text-red-400">{errorMessage}</p>
      </div>
    );
  }

  if (submitted) {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen bg-[#0d1117] text-gray-100 p-4">
        <div className="bg-[#161b22] p-8 rounded-2xl border border-gray-800 text-center max-w-md w-full shadow-lg space-y-4">
          <FiCheckCircle className="text-green-400 text-5xl mx-auto" />
          <h2 className="text-xl font-bold mb-2">تم إرسال ردك بنجاح!</h2>
          <p className="text-sm text-gray-400">شكراً لك على تعبئة النموذج.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#0d1117] text-gray-100 py-12 px-4 sm:px-6 lg:px-8" dir="ltr">
      <div className="max-w-2xl mx-auto bg-[#161b22] border border-gray-800 rounded-2xl overflow-hidden shadow-xl">
        
        {form?.image && (
          <div className="w-full h-56 sm:h-72 overflow-hidden border-b border-gray-800 bg-[#0d1117]">
            <img 
              src={form.image.startsWith('http') ? form.image : `http://localhost:8000/storage/${form.image}`} 
              alt="Form Cover" 
              className="w-full h-full object-cover"
            />
          </div>
        )}

        <div className="p-8">
          <h1 className="text-2xl font-bold text-white mb-2">{renderSafeValue(form?.title, 'Untitled Form')}</h1>
          <p className="text-xs text-gray-400 mb-6 pb-4 border-b border-gray-800">يرجى تعبئة الحقول أدناه بدقة.</p>

          {errorMessage && (
            <div className="p-4 mb-6 rounded-xl bg-red-500/10 border border-red-500/20 text-red-400 text-sm">
              {errorMessage}
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-6">
            {form?.fields?.map((field, index) => {
              const fieldKey = field.id || index;
              return (
                <div key={fieldKey} className="space-y-2">
                  <label className="block text-sm font-semibold text-gray-300">
                    {renderSafeValue(field.label, 'Field')} {field.required && <span className="text-red-500">*</span>}
                  </label>

                  {field.type === 'text' && (
                    <input
                      type="text"
                      required={field.required}
                      placeholder={renderSafeValue(field.placeholder, '')}
                      value={formData[fieldKey] || ''}
                      onChange={(e) => handleChange(fieldKey, e.target.value)}
                      className="w-full bg-[#0d1117] border border-gray-800 rounded-xl p-3 text-sm text-gray-200 focus:outline-none focus:border-[#ff7a00]"
                    />
                  )}

                  {field.type === 'textarea' && (
                    <textarea
                      required={field.required}
                      placeholder={renderSafeValue(field.placeholder, '')}
                      rows="4"
                      value={formData[fieldKey] || ''}
                      onChange={(e) => handleChange(fieldKey, e.target.value)}
                      className="w-full bg-[#0d1117] border border-gray-800 rounded-xl p-3 text-sm text-gray-200 focus:outline-none focus:border-[#ff7a00]"
                    />
                  )}

                  {field.type === 'email' && (
                    <input
                      type="email"
                      required={field.required}
                      placeholder={renderSafeValue(field.placeholder, '')}
                      value={formData[fieldKey] || ''}
                      onChange={(e) => handleChange(fieldKey, e.target.value)}
                      className="w-full bg-[#0d1117] border border-gray-800 rounded-xl p-3 text-sm text-gray-200 focus:outline-none focus:border-[#ff7a00]"
                    />
                  )}

                  {field.type === 'number' && (
                    <input
                      type="number"
                      required={field.required}
                      placeholder={renderSafeValue(field.placeholder, '')}
                      value={formData[fieldKey] || ''}
                      onChange={(e) => handleChange(fieldKey, e.target.value)}
                      className="w-full bg-[#0d1117] border border-gray-800 rounded-xl p-3 text-sm text-gray-200 focus:outline-none focus:border-[#ff7a00]"
                    />
                  )}

                  {field.type === 'phone' && (
                    <input
                      type="tel"
                      required={field.required}
                      placeholder={renderSafeValue(field.placeholder, '')}
                      value={formData[fieldKey] || ''}
                      onChange={(e) => handleChange(fieldKey, e.target.value)}
                      className="w-full bg-[#0d1117] border border-gray-800 rounded-xl p-3 text-sm text-gray-200 focus:outline-none focus:border-[#ff7a00]"
                    />
                  )}

                  {field.type === 'date' && (
                    <input
                      type="date"
                      required={field.required}
                      value={formData[fieldKey] || ''}
                      onChange={(e) => handleChange(fieldKey, e.target.value)}
                      className="w-full bg-[#0d1117] border border-gray-800 rounded-xl p-3 text-sm text-gray-200 focus:outline-none focus:border-[#ff7a00]"
                    />
                  )}

                  {field.type === 'select' && (
                    <select
                      required={field.required}
                      value={formData[fieldKey] || ''}
                      onChange={(e) => handleChange(fieldKey, e.target.value)}
                      style={{ backgroundColor: '#0d1117', color: '#ffffff' }}
                      className="w-full bg-[#0d1117] border border-gray-800 rounded-xl p-3 text-sm text-white focus:outline-none focus:border-[#ff7a00]"
                    >
                      <option value="" disabled style={{ backgroundColor: '#161b22', color: '#9ca3af' }}>
                        {renderSafeValue(field.placeholder, 'اختر من القائمة...')}
                      </option>
                      {Array.isArray(field.options) && field.options.map((opt, optIndex) => {
                        const optValue = typeof opt === 'object' && opt !== null ? (opt.ar || opt.en || JSON.stringify(opt)) : opt;
                        const optLabel = typeof opt === 'object' && opt !== null ? (opt.ar || opt.en || JSON.stringify(opt)) : opt;
                        
                        return (
                          <option 
                            key={optIndex} 
                            value={optValue} 
                            style={{ backgroundColor: '#161b22', color: '#ffffff' }}
                          >
                            {optLabel}
                          </option>
                        );
                      })}
                    </select>
                  )}

                  {field.helpText && (
                    <p className="text-xs text-gray-500">{renderSafeValue(field.helpText)}</p>
                  )}
                </div>
              );
            })}

            <button
              type="submit"
              disabled={submitting}
              className="w-full py-3 bg-[#ff7a00] text-white font-semibold rounded-xl hover:bg-[#e06c00] transition cursor-pointer"
            >
              {submitting ? 'جاري الإرسال...' : 'إرسال النموذج'}
            </button>
          </form>
        </div>
      </div>
    </div>
  );
};

export default PublicFormView;