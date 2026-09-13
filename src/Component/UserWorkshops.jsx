import React, { useEffect, useState, useContext } from 'react';
import { Link } from 'react-router-dom';
import { LanguageContext } from '../LanguageContext';
import axiosClient from '../Api/axiosClient';
import { FiArrowRight, FiBookOpen } from 'react-icons/fi';

const UserWorkshops = () => {
  const { lang } = useContext(LanguageContext);
  const isAr = lang === 'AR';

  const [forms, setForms] = useState([]);
  const [loading, setLoading] = useState(true);
  const [errorMessage, setErrorMessage] = useState('');

  useEffect(() => {
    const fetchForms = async () => {
      try {
        const response = await axiosClient.get('/admin/forms');
        const data = response.data.data || response.data;
        
        // تصفية النماذج لعرض المنشورة فقط (is_active === true)
        const activeForms = Array.isArray(data) 
          ? data.filter(form => form.is_active === true || form.is_active === 1) 
          : [];

        setForms(activeForms);
      } catch (error) {
        console.error('Error fetching workshops:', error);
        setErrorMessage(isAr ? 'عذراً، لم نتمكن من جلب الورش والدورات المتاحة حالياً.' : 'Sorry, we could not fetch available workshops at the moment.');
      } finally {
        setLoading(false);
      }
    };

    fetchForms();
  }, [isAr]);

  return (
    <div className="min-h-screen bg-[#1a1a2e] text-gray-100 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-6xl mx-auto">
        
        {/* رأس الصفحة مع توجيه النص حسب اللغة */}
        <div className="text-center mb-12" dir={isAr ? 'rtl' : 'ltr'}>
          <h1 className="text-3xl font-bold text-white mb-3">
            {isAr ? 'ورش ودورات منارة المتاحة' : 'Available Manara Workshops'}
          </h1>
          <p className="text-sm text-gray-400">
            {isAr ? 'تصفح الورش الحالية وسجل فيها بسهولة لتبدأ رحلتك التقنية.' : 'Browse current workshops and register easily to start your tech journey.'}
          </p>
        </div>

        {errorMessage && (
          <div className="p-4 mb-6 rounded-xl bg-red-500/10 border border-red-500/20 text-red-400 text-center text-sm" dir={isAr ? 'rtl' : 'ltr'}>
            {errorMessage}
          </div>
        )}

        {/* شبكة الكروت للورش (ثابتة الاتجاه لضمان عدم تغير أماكن الكروت عند تغيير اللغة) */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6" dir="ltr">
          {forms.map((form) => {
            const title = typeof form.title === 'object'
              ? (isAr ? form.title?.ar || form.title?.en : form.title?.en || form.title?.ar)
              : form.title;

            const description = typeof form.description === 'object'
              ? (isAr ? form.description?.ar || form.description?.en : form.description?.en || form.description?.ar)
              : form.description;

            return (
              <div 
                key={form.id || form.slug} 
                className="bg-[#1a1a2e] border border-gray-800/80 rounded-2xl overflow-hidden shadow-lg flex flex-col justify-between hover:border-[#ff7a00]/50 transition duration-300"
                dir={isAr ? 'rtl' : 'ltr'}
                style={{ textAlign: isAr ? 'right' : 'left' }}
              >
                {/* صورة الغلاف إن وجدت */}
                {form.image ? (
                  <div className="w-full h-48 overflow-hidden bg-[#0d1117]">
                    <img 
                      src={form.image.startsWith('http') ? form.image : `http://43.156.53.131/storage/${form.image}`} 
                      alt="Workshop Cover" 
                      className="w-full h-full object-cover"
                    />
                  </div>
                ) : (
                  <div className="w-full h-48 bg-gradient-to-br from-[#161b22] to-gray-900 flex items-center justify-center border-b border-gray-800">
                    <FiBookOpen className="text-4xl text-[#ff7a00]" />
                  </div>
                )}

                {/* تفاصيل الورشة */}
                <div className="p-6 flex-1 flex flex-col justify-between">
                  <div>
                    <h2 className="text-xl font-bold text-white mb-2 line-clamp-1">
                      {title || (isAr ? 'ورشة عمل جديدة' : 'New Workshop')}
                    </h2>
                    <p className="text-xs text-gray-400 line-clamp-3 mb-4 leading-relaxed">
                      {description || (isAr ? 'انضم إلينا في هذه الورشة التطبيقية لتطوير مهاراتك التقنية.' : 'Join us in this practical workshop to develop your technical skills.')}
                    </p>
                  </div>

                  {/* زر الانتقال لصفحة التسجيل */}
                  <Link
                    to={`/forms/${form.slug}`}
                    className={`mt-4 inline-flex items-center justify-center w-full py-2.5 px-4 bg-[#ff7a00] text-white text-sm font-semibold rounded-xl hover:bg-[#e06c00] transition cursor-pointer ${
                      isAr ? 'space-x-reverse space-x-2' : 'space-x-2'
                    }`}
                  >
                    <span>{isAr ? 'سجل الآن' : 'Register Now'}</span>
                    <FiArrowRight className={`text-lg transition-transform ${isAr ? 'rotate-180' : ''}`} />
                  </Link>
                </div>
              </div>
            );
          })}
        </div>

        {forms.length === 0 && !loading && !errorMessage && (
          <div className="text-center text-gray-500 py-12 text-sm" dir={isAr ? 'rtl' : 'ltr'}>
            {isAr ? 'لا توجد ورش أو دورات منشورة للتسجيل في الوقت الحالي.' : 'No published workshops available for registration at the moment.'}
          </div>
        )}

      </div>
    </div>
  );
};

export default UserWorkshops;