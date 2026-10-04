import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import axiosClient from './axiosClient';
import { FiCheckCircle, FiAlertCircle } from 'react-icons/fi';

const PublicFormView = () => {
  const { slug } = useParams();
  const navigate = useNavigate();
  const [form, setForm] = useState(null);
  const [loading, setLoading] = useState(true);
  const [formData, setFormData] = useState({});
  const [submitting, setSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');

  // تحديد الاتجاه الافتراضي
  const [direction, setDirection] = useState('rtl');

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
        setForm(data);

        const titleText = renderSafeValue(data?.title);
        const descText = renderSafeValue(data?.description);
        const combinedText = titleText + " " + descText;

        const hasArabic = /[\u0600-\u06FF]/.test(combinedText);

        if (hasArabic) {
          setDirection('rtl');
        } else if (/^[a-zA-Z\s]/.test(titleText)) {
          setDirection('ltr');
        } else {
          setDirection('rtl');
        }
      } catch (error) {
        console.error('Error fetching form:', error);
        setErrorMessage('عذراً، هذا النموذج غير موجود أو تم إيقافه.');
      } finally {
        setLoading(false);
      }
    };

    fetchPublicForm();
  }, [slug]);

  // العودة للصفحة الرئيسية بعد 3 ثوانٍ من النجاح
  useEffect(() => {
    let timer;
    if (submitted) {
      timer = setTimeout(() => {
        navigate('/');
      }, 3000);
    }
    return () => clearTimeout(timer);
  }, [submitted, navigate]);

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
      const dataToSend = new FormData();
      Object.keys(formData).forEach((fieldId) => {
        const value = formData[fieldId];
        if (Array.isArray(value)) {
          value.forEach((item) => {
            dataToSend.append(`answers[${fieldId}][]`, item);
          });
        } else {
          dataToSend.append(`answers[${fieldId}]`, value);
        }
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
      <div className="flex justify-center items-center min-h-screen bg-gray-50/50 text-gray-500 text-sm">
        <div className="animate-pulse flex space-x-2 items-center">
          <div className="w-3 h-3 bg-[#f97316] rounded-full"></div>
          <div className="w-3 h-3 bg-[#f97316] rounded-full"></div>
          <div className="w-3 h-3 bg-[#f97316] rounded-full"></div>
          <span className="mr-3 font-medium">جاري تحميل النموذج...</span>
        </div>
      </div>
    );
  }

  if (errorMessage && !form) {
    return (
      <div className="flex flex-col justify-center items-center min-h-screen bg-gray-50/50 text-gray-700 p-4" dir={direction}>
        <div className="bg-white border border-gray-100 p-8 rounded-2xl text-center max-w-md w-full space-y-4 shadow-xl shadow-gray-200/50">
          <FiAlertCircle className="text-red-500 text-5xl mx-auto" />
          <p className="text-red-600 text-sm font-semibold">{errorMessage}</p>
        </div>
      </div>
    );
  }

  if (submitted) {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen bg-gray-50/50 text-gray-800 p-4" dir={direction}>
        <div className="bg-white p-8 rounded-2xl border border-gray-100 text-center max-w-md w-full shadow-xl shadow-gray-200/50 space-y-4">
          <FiCheckCircle className="text-green-500 text-5xl mx-auto" />
          <h2 className="text-xl font-bold text-[#211551]">تم إرسال ردك بنجاح!</h2>
          <p className="text-sm text-gray-600">شكراً لك على تعبئة النموذج، جاري تحويلك إلى الصفحة الرئيسية...</p>
        </div>
      </div>
    );
  }

  const fields = form?.fields || [];

  return (
    <div className="min-h-screen bg-gray-50/50 text-gray-800 py-6 px-4 sm:px-6 text-sm sm:text-base" dir={direction}>
      <div className="max-w-4xl mx-auto bg-white border border-gray-100 rounded-2xl overflow-hidden shadow-xl shadow-gray-200/50">
        
        {/* صورة الغلاف */}
        {form?.image && (
          <div className="w-full h-56 sm:h-72 overflow-hidden border-b border-gray-100 bg-gray-50">
            <img 
              src={form.image.startsWith('http') ? form.image : `http://localhost:8000/storage/${form.image}`} 
              alt="Form Cover" 
              className="w-full h-full object-cover"
            />
          </div>
        )}

        <div className="p-6 sm:p-10">
          {/* العناوين */}
          <h1 className="text-2xl sm:text-3xl font-bold text-[#211551] mb-3">
            {renderSafeValue(form?.title, 'نموذج جديد')}
          </h1>
          <p className="text-sm sm:text-base text-gray-600 mb-8 pb-4 border-b border-gray-100 leading-relaxed">
            {renderSafeValue(form?.description, 'يرجى تعبئة الحقول أدناه بدقة.')}
          </p>

          {errorMessage && (
            <div className="p-4 mb-6 rounded-xl bg-red-50 border border-red-100 text-red-600 text-sm flex items-center space-x-3 space-x-reverse font-medium">
              <FiAlertCircle className="text-lg shrink-0" />
              <span>{errorMessage}</span>
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-6">
            {fields.length === 0 ? (
              <p className="text-sm text-gray-400 text-center py-10">لا توجد حقول في هذا النموذج حالياً.</p>
            ) : (
              <div className="space-y-6">
                {fields.map((field, index) => {
                  const fieldKey = field.id || index;
                  const fieldLabel = renderSafeValue(field.label, 'حقل بدون عنوان');
                  const fieldPlaceholder = renderSafeValue(field.placeholder, '');

                  return (
                    <div key={fieldKey} className="space-y-2.5 bg-gray-50/90 p-5 rounded-2xl border border-gray-100 transition-all hover:bg-gray-50 shadow-sm">
                      <label className="block text-sm sm:text-base font-bold text-[#211551]">
                        {fieldLabel} {field.required && <span className="text-[#f97316] mr-1">*</span>}
                      </label>

                      {/* Text, Email, Number, Phone, Date */}
                      {['text', 'email', 'number', 'phone', 'date'].includes(field.type) && (
                        <input
                          type={field.type === 'phone' ? 'tel' : field.type}
                          required={field.required}
                          placeholder={fieldPlaceholder}
                          value={formData[fieldKey] || ''}
                          onChange={(e) => handleChange(fieldKey, e.target.value)}
                          className="w-full bg-white border border-gray-200 rounded-xl p-3 text-sm sm:text-base text-gray-800 focus:outline-none focus:border-[#f97316] focus:ring-2 focus:ring-[#f97316]/20 transition-all shadow-sm"
                        />
                      )}

                      {/* Textarea */}
                      {field.type === 'textarea' && (
                        <textarea
                          required={field.required}
                          placeholder={fieldPlaceholder}
                          rows="4"
                          value={formData[fieldKey] || ''}
                          onChange={(e) => handleChange(fieldKey, e.target.value)}
                          className="w-full bg-white border border-gray-200 rounded-xl p-3 text-sm sm:text-base text-gray-800 focus:outline-none focus:border-[#f97316] focus:ring-2 focus:ring-[#f97316]/20 transition-all shadow-sm resize-none"
                        />
                      )}

                      {/* Select Dropdown */}
                      {field.type === 'select' && (
                        <select
                          required={field.required}
                          value={formData[fieldKey] || ''}
                          onChange={(e) => handleChange(fieldKey, e.target.value)}
                          className="w-full bg-white border border-gray-200 rounded-xl p-3 text-sm sm:text-base text-gray-800 focus:outline-none focus:border-[#f97316] focus:ring-2 focus:ring-[#f97316]/20 transition-all shadow-sm"
                        >
                          <option value="" disabled className="text-gray-400">
                            {fieldPlaceholder || 'اختر من القائمة...'}
                          </option>
                          {Array.isArray(field.options) && field.options.map((opt, optIndex) => {
                            const optVal = typeof opt === 'object' && opt !== null ? (opt.ar || opt.en || JSON.stringify(opt)) : opt;
                            return (
                              <option key={optIndex} value={optVal} className="text-gray-800">
                                {optVal}
                              </option>
                            );
                          })}
                        </select>
                      )}

                      {/* Checkbox Options */}
                      {field.type === 'checkbox' && (
                        <div className="space-y-3 pt-2">
                          {Array.isArray(field.options) && field.options.map((opt, optIndex) => {
                            const optVal = typeof opt === 'object' && opt !== null ? (opt.ar || opt.en || JSON.stringify(opt)) : opt;
                            const currentValues = Array.isArray(formData[fieldKey]) ? formData[fieldKey] : [];
                            
                            return (
                              <label key={optIndex} className="flex items-center gap-3 text-sm sm:text-base text-gray-700 cursor-pointer">
                                <input
                                  type="checkbox"
                                  value={optVal}
                                  checked={currentValues.includes(optVal)}
                                  onChange={(e) => {
                                    const updatedValues = e.target.checked
                                      ? [...currentValues, optVal]
                                      : currentValues.filter((v) => v !== optVal);
                                    handleChange(fieldKey, updatedValues);
                                  }}
                                  className="w-5 h-5 rounded border-gray-300 text-[#f97316] focus:ring-[#f97316]"
                                />
                                <span className="font-medium">{optVal}</span>
                              </label>
                            );
                          })}
                        </div>
                      )}

                      {/* Radio Options */}
                      {field.type === 'radio' && (
                        <div className="space-y-3 pt-2">
                          {Array.isArray(field.options) && field.options.map((opt, optIndex) => {
                            const optVal = typeof opt === 'object' && opt !== null ? (opt.ar || opt.en || JSON.stringify(opt)) : opt;
                            
                            return (
                              <label key={optIndex} className="flex items-center gap-3 text-sm sm:text-base text-gray-700 cursor-pointer">
                                <input
                                  type="radio"
                                  name={`field-${fieldKey}`}
                                  required={field.required}
                                  value={optVal}
                                  checked={formData[fieldKey] === optVal}
                                  onChange={(e) => handleChange(fieldKey, e.target.value)}
                                  className="w-5 h-5 border-gray-300 text-[#f97316] focus:ring-[#f97316]"
                                />
                                <span className="font-medium">{optVal}</span>
                              </label>
                            );
                          })}
                        </div>
                      )}

                      {/* File Upload */}
                      {field.type === 'file' && (
                        <input
                          type="file"
                          required={field.required}
                          onChange={(e) => handleChange(fieldKey, e.target.files[0])}
                          className="w-full text-sm text-gray-600 file:mr-4 file:py-2.5 file:px-4 file:rounded-xl file:border-0 file:text-sm file:font-semibold file:bg-[#211551] file:text-white hover:file:bg-[#2e1d6d] cursor-pointer transition-all"
                        />
                      )}

                      {field.helpText && (
                        <p className="text-xs text-gray-500 mt-1.5">{renderSafeValue(field.helpText)}</p>
                      )}
                    </div>
                  );
                })}
              </div>
            )}

            {/* زر الإرسال النهائي */}
            <div className="flex justify-end pt-6 border-t border-gray-100 mt-8">
              <button
                type="submit"
                disabled={submitting}
                className="w-full sm:w-auto bg-[#f97316] text-white px-8 py-3 rounded-xl font-bold hover:bg-[#ea580c] shadow-lg shadow-orange-500/25 hover:shadow-orange-500/40 transition-all duration-300 flex items-center justify-center disabled:opacity-50 text-sm sm:text-base cursor-pointer"
              >
                <span>{submitting ? 'جاري الإرسال...' : 'إرسال النموذج'}</span>
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};

export default PublicFormView;