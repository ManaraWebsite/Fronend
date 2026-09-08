import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import axiosClient from './axiosClient';
import { FiArrowLeft, FiFileText, FiBriefcase, FiMonitor, FiUsers, FiCode } from 'react-icons/fi';

const AvailableForms = () => {
  const [forms, setForms] = useState([]);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    const fetchPublishedForms = async () => {
      try {
        // افترض أن هذا هو المسار لجلب النماذج المتاحة للمستخدمين
        const response = await axiosClient.get('/forms'); 
        // أو إذا كانت تاتي من مسار عام للأدمن/اليوص: setForms(response.data.data || response.data);
        setForms(response.data.data || response.data);
      } catch (error) {
        console.error('Error fetching available forms:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchPublishedForms();
  }, []);

  // أيقونات افتراضية يتم توزيعها بناءً على نوع الفورم أو عشوائياً
  const icons = [FiBriefcase, FiMonitor, FiUsers, FiCode, FiFileText];

  return (
    <div className="min-h-screen bg-[#f8f9fa] text-gray-800 py-12 px-4 sm:px-6 lg:px-8" dir="rtl">
      <div className="max-w-6xl mx-auto">
        
        {/* رأس الصفحة */}
        <div className="text-center mb-12">
          <div className="w-12 h-1 bg-[#ff7a00] mx-auto mb-4 rounded-full"></div>
          <h1 className="text-3xl font-extrabold text-gray-900 mb-2">الفورمات المتاحة</h1>
          <p className="text-gray-500 text-sm">تصفح الفورمات وقدم طلبك للمشاركة في برامج منارة</p>
        </div>

        {/* محتوى الصفحة */}
        {loading ? (
          <div className="text-center py-20 text-gray-400">جاري تحميل الفورمات...</div>
        ) : forms.length === 0 ? (
          <div className="bg-white rounded-2xl p-12 text-center shadow-sm border border-gray-100">
            <p className="text-gray-500 text-sm">لا توجد فورمات متاحة حالياً.</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {forms.map((form, index) => {
              // اختيار أيقونة بشكل دوري
              const IconComponent = icons[index % icons.length];
              const isPopular = index === 3; // مثال: جعل الرابع مميز "الأكثر طلباً"

              return (
                <div 
                  key={form.id || index}
                  className={`bg-white rounded-3xl p-6 shadow-sm border transition-all duration-300 hover:shadow-md flex flex-col justify-between relative ${
                    isPopular ? 'border-[#ff7a00] ring-1 ring-[#ff7a00]' : 'border-gray-100'
                  }`}
                >
                  {/* شارة الأكثر طلباً إن وجدت */}
                  {isPopular && (
                    <span className="absolute -top-3 right-6 bg-[#ff7a00]/10 text-[#ff7a00] text-xs font-semibold px-3 py-1 rounded-full border border-[#ff7a00]/20">
                      الأكثر طلباً
                    </span>
                  )}

                  <div>
                    {/* الأيقونة */}
                    <div className="w-12 h-12 rounded-2xl bg-[#ff7a00]/10 flex items-center justify-center text-[#ff7a00] mb-4">
                      <IconComponent size={24} />
                    </div>

                    {/* العنوان */}
                    <h3 className="text-lg font-bold text-gray-900 mb-2">
                      {typeof form.title === 'object' ? form.title.ar : form.title}
                    </h3>

                    {/* الوصف أو الـ Help Text الأول */}
                    <p className="text-gray-500 text-xs leading-relaxed mb-6">
                      {form.description || 'سجل بياناتك للانضمام والمشاركة في هذا البرنامج بكل سهولة واحترافية.'}
                    </p>
                  </div>

                  {/* زر تعبئة الفورم */}
                  <button
                    onClick={() => navigate(`/forms/${form.slug}`)}
                    className="w-full py-3 bg-[#ff7a00] hover:bg-[#e06c00] text-white font-medium text-sm rounded-xl transition flex items-center justify-center space-x-2 space-x-reverse shadow-sm cursor-pointer"
                  >
                    <span>تعبئة الفورم</span>
                    <FiArrowLeft size={16} />
                  </button>
                </div>
              );
            })}
          </div>
        )}

      </div>
    </div>
  );
};