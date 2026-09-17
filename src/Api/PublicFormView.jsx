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

        // الفحص الذكي: إذا وجدنا حروف عربية في العنوان أو الوصف، نجعل الاتجاه RTL فوراً
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
      <div className="flex justify-center items-center min-h-screen bg-gray-50/50 text-gray-500 text-xs">
        <div className="animate-pulse flex space-x-2 items-center">
          <div className="w-2.5 h-2.5 bg-[#f97316] rounded-full"></div>
          <div className="w-2.5 h-2.5 bg-[#f97316] rounded-full"></div>
          <div className="w-2.5 h-2.5 bg-[#f97316] rounded-full"></div>
          <span className="mr-2 font-medium">جاري تحميل النموذج...</span>
        </div>
      </div>
    );
  }

  if (errorMessage && !form) {
    return (
      <div className="flex flex-col justify-center items-center min-h-screen bg-gray-50/50 text-gray-700 p-4" dir={direction}>
        <div className="bg-white border border-gray-100 p-6 rounded-2xl text-center max-w-md w-full space-y-3 shadow-lg shadow-gray-200/50">
          <FiAlertCircle className="text-red-500 text-4xl mx-auto" />
          <p className="text-red-600 text-xs font-semibold">{errorMessage}</p>
        </div>
      </div>
    );
  }

  if (submitted) {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen bg-gray-50/50 text-gray-800 p-4" dir={direction}>
        <div className="bg-white p-6 rounded-2xl border border-gray-100 text-center max-w-md w-full shadow-lg shadow-gray-200/50 space-y-3">
          <FiCheckCircle className="text-green-500 text-4xl mx-auto" />
          <h2 className="text-lg font-bold text-[#211551]">تم إرسال ردك بنجاح!</h2>
          <p className="text-xs text-gray-500">شكراً لك على تعبئة النموذج، جاري تحويلك إلى الصفحة الرئيسية...</p>
        </div>
      </div>
    );
  }

  const fields = form?.fields || [];

  return (
    <div className="min-h-screen bg-gray-50/50 text-gray-800 py-0 px-0 sm:px-4 sm:py-4 text-xs sm:text-sm" dir={direction}>
      <div className="max-w-4xl mx-auto bg-white border-0 sm:border border-gray-100 rounded-none sm:rounded-2xl overflow-hidden shadow-none sm:shadow-lg sm:shadow-gray-200/50">
        
        {/* صورة الغلاف - تم تصغير الارتفاع */}
        {form?.image && (
          <div className="w-full h-48 sm:h-64 overflow-hidden border-b border-gray-100 bg-gray-50">
            <img 
              src={form.image.startsWith('http') ? form.image : `http://localhost:8000/storage/${form.image}`} 
              alt="Form Cover" 
              className="w-full h-full object-cover"
            />
          </div>
        )}

        <div className="p-5 sm:p-8">
          {/* العناوين */}
          <h1 className="text-xl sm:text-2xl font-bold text-[#211551] mb-2">
            {renderSafeValue(form?.title, 'نموذج جديد')}
          </h1>
          <p className="text-xs sm:text-sm text-gray-500 mb-6 pb-4 border-b border-gray-100 leading-relaxed">
            {renderSafeValue(form?.description, 'يرجى تعبئة الحقول أدناه بدقة.')}
          </p>

          {errorMessage && (
            <div className="p-3 mb-6 rounded-xl bg-red-50 border border-red-100 text-red-600 text-xs flex items-center space-x-2 space-x-reverse font-medium">
              <FiAlertCircle className="text-base shrink-0" />
              <span>{errorMessage}</span>
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
            {fields.length === 0 ? (
              <p className="text-xs text-gray-400 text-center py-8">لا توجد حقول في هذا النموذج حالياً.</p>
            ) : (
              <div className="space-y-4">
                {fields.map((field, index) => {
                  const fieldKey = field.id || index;
                  const fieldLabel = renderSafeValue(field.label, 'حقل بدون عنوان');
                  const fieldPlaceholder = renderSafeValue(field.placeholder, '');

                  return (
                    <div key={fieldKey} className="space-y-2 bg-gray-50/80 p-4 rounded-xl border border-gray-100/80 transition-all hover:bg-gray-50">
                      <label className="block text-xs sm:text-sm font-bold text-[#211551]">
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
                          className="w-full bg-white border border-gray-200/80 rounded-lg p-2.5 text-xs sm:text-sm text-gray-700 focus:outline-none focus:border-[#f97316] focus:ring-1 focus:ring-[#f97316]/10 transition-all"
                        />
                      )}

                      {/* Textarea */}
                      {field.type === 'textarea' && (
                        <textarea
                          required={field.required}
                          placeholder={fieldPlaceholder}
                          rows="3"
                          value={formData[fieldKey] || ''}
                          onChange={(e) => handleChange(fieldKey, e.target.value)}
                          className="w-full bg-white border border-gray-200/80 rounded-lg p-2.5 text-xs sm:text-sm text-gray-700 focus:outline-none focus:border-[#f97316] focus:ring-1 focus:ring-[#f97316]/10 transition-all resize-none"
                        />
                      )}

                      {/* Select Dropdown */}
                      {field.type === 'select' && (
                        <select
                          required={field.required}
                          value={formData[fieldKey] || ''}
                          onChange={(e) => handleChange(fieldKey, e.target.value)}
                          className="w-full bg-white border border-gray-200/80 rounded-lg p-2.5 text-xs sm:text-sm text-gray-700 focus:outline-none focus:border-[#f97316] focus:ring-1 focus:ring-[#f97316]/10 transition-all"
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

                      {/* File Upload */}
                      {field.type === 'file' && (
                        <input
                          type="file"
                          required={field.required}
                          onChange={(e) => handleChange(fieldKey, e.target.files[0])}
                          className="w-full text-xs text-gray-500 file:mr-3 file:py-2 file:px-3.5 file:rounded-lg file:border-0 file:text-xs file:font-semibold file:bg-[#211551] file:text-white hover:file:bg-[#2e1d6d] cursor-pointer transition-all"
                        />
                      )}

                      {field.helpText && (
                        <p className="text-[11px] text-gray-400 mt-1">{renderSafeValue(field.helpText)}</p>
                      )}
                    </div>
                  );
                })}
              </div>
            )}

            {/* زر الإرسال النهائي */}
            <div className="flex justify-end pt-6 border-t border-gray-100 mt-6">
              <button
                type="submit"
                disabled={submitting}
                className="w-full sm:w-auto bg-[#f97316] text-white px-6 py-2.5 rounded-lg font-medium hover:bg-[#ea580c] shadow-md shadow-orange-500/20 hover:shadow-orange-500/40 transition-all duration-300 flex items-center justify-center disabled:opacity-50 text-xs sm:text-sm cursor-pointer"
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