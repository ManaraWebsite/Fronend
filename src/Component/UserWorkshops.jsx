import React, { useEffect, useState, useContext } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { LanguageContext } from '../LanguageContext';
import axiosClient from '../Api/axiosClient';
import { FiArrowRight } from 'react-icons/fi';
import { motion } from 'framer-motion';

const UserWorkshops = () => {
  const { lang } = useContext(LanguageContext);
  const isAr = lang === 'AR';
  const location = useLocation();

  const [forms, setForms] = useState([]);
  const [loading, setLoading] = useState(true);
  const [errorMessage, setErrorMessage] = useState('');

  useEffect(() => {
    const fetchForms = async () => {
      try {
        setLoading(true);
        setErrorMessage('');

        // جلب الـ Slugs المخزنة تلقائياً من المتصفح
        const savedSlugs = JSON.parse(localStorage.getItem('my_workshop_slugs') || '[]');

        if (savedSlugs.length === 0) {
          setForms([]);
          setLoading(false);
          return;
        }

        // جلب تفاصيل كل ورشة بشكل متزامن باستخدام الـ slug الخاص بها
        const formPromises = savedSlugs.map(async (slug) => {
          try {
            const response = await axiosClient.get(`/forms/${slug}`);
            return response.data.data || response.data;
          } catch (err) {
            console.error(`Failed to fetch form with slug: ${slug}`, err);
            return null;
          }
        });

        const results = await Promise.all(formPromises);
        const validForms = results.filter((form) => form !== null);

        console.log('Fetched Workshops from LocalStorage:', validForms);
        setForms(validForms);

      } catch (error) {
        console.error('Error fetching workshops:', error);

        setErrorMessage(
          isAr
            ? 'عذراً، لم نتمكن من جلب الورش والدورات المتاحة حالياً.'
            : 'Sorry, we could not fetch available workshops at the moment.'
        );
      } finally {
        setLoading(false);
      }
    };

    fetchForms();
  }, [isAr, location.pathname]);

  const getImageUrl = (form) => {
    const rawImage = form.cover_image || form.image || form.image_url;
    const fallbackImage = 'https://images.unsplash.com/photo-1531482615713-2afd69097998?auto=format&fit=crop&w=600&q=80';

    if (!rawImage) return fallbackImage;
    if (typeof rawImage === 'string' && rawImage.startsWith('http')) return rawImage;

    const baseServerUrl = axiosClient.defaults.baseURL
      ? axiosClient.defaults.baseURL.replace(/\/api\/?$/, '')
      : 'http://43.156.53.131';

    const cleanPath = String(rawImage).replace(/^\/+/, '').replace(/^storage\//, '');
    return `${baseServerUrl}/storage/${cleanPath}`;
  };

  const handleRegisterClick = () => {
    window.scrollTo({ top: 0, behavior: 'instant' });
  };

  return (
    <div id="workshops" className="min-h-screen bg-[#1a1a2e] text-gray-100 py-24 px-4 sm:px-6 lg:px-8">
      <div className="max-w-6xl mx-auto">
        <motion.div
          initial={{ opacity: 0, y: 40 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8 }}
          className="text-center mb-16"
          dir={isAr ? 'rtl' : 'ltr'}
        >
          <div className="w-16 h-1 bg-orange-500 mx-auto mb-5 rounded-full"></div>
          <h1 className="text-3xl md:text-4xl font-bold text-white mb-3">
            {isAr ? 'ورش ودورات منارة المتاحة' : 'Available Manara Workshops'}
          </h1>
          <p className="text-sm text-gray-300">
            {isAr ? 'تصفح الورش الحالية وسجل فيها بسهولة لتبدأ رحلتك التقنية.' : 'Browse current workshops and register easily.'}
          </p>
        </motion.div>

        {errorMessage && (
          <div className="p-4 mb-6 rounded-xl bg-red-500/10 border border-red-500/20 text-red-400 text-center text-sm" dir={isAr ? 'rtl' : 'ltr'}>
            {errorMessage}
          </div>
        )}

        {loading ? (
          <div className="text-center py-12 text-gray-400">
            {isAr ? 'جاري تحميل الورش والدورات...' : 'Loading workshops...'}
          </div>
        ) : forms.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8" dir="ltr">
            {forms.map((form, index) => {
              const title = typeof form.title === 'object' ? (isAr ? form.title?.ar || form.title?.en : form.title?.en || form.title?.ar) : form.title;
              const description = typeof form.content === 'object' ? (isAr ? form.content?.ar || form.content?.en : form.content?.en || form.content?.ar) : (typeof form.description === 'object' ? (isAr ? form.description?.ar || form.description?.en : form.description?.en || form.description?.ar) : form.description || form.content);
              const categoryName = form.category ? (typeof form.category === 'object' ? (isAr ? form.category?.ar || form.category?.en : form.category?.en || form.category?.ar) : form.category) : (isAr ? 'ورشة عمل' : 'Workshop');
              const imageUrl = getImageUrl(form);

              return (
                <motion.div
                  key={form.id || form.slug}
                  initial={{ opacity: 0, y: 80 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.6, delay: index * 0.2 }}
                  whileHover={{ y: -10, scale: 1.03 }}
                  className="bg-[#23233c] rounded-3xl overflow-hidden border border-orange-500/10 hover:border-orange-300 transition-all duration-300 flex flex-col group shadow-lg"
                  dir={isAr ? 'rtl' : 'ltr'}
                  style={{ textAlign: isAr ? 'right' : 'left' }}
                >
                  <div className="relative overflow-hidden h-52 bg-gray-800">
                    <img
                      src={imageUrl}
                      alt={title || 'Workshop image'}
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                      onError={(e) => {
                        e.target.onerror = null;
                        e.target.src = 'https://images.unsplash.com/photo-1531482615713-2afd69097998?auto=format&fit=crop&w=600&q=80';
                      }}
                    />
                    <span className="absolute top-4 right-4 bg-orange-500 text-white text-xs px-3 py-1 rounded-full font-medium shadow">
                      {categoryName}
                    </span>
                  </div>

                  <div className="p-8 flex flex-col flex-grow justify-between">
                    <div>
                      <h3 className="text-2xl font-bold text-white mb-5 group-hover:text-orange-400 transition-colors line-clamp-2">
                        {title || (isAr ? 'ورشة عمل جديدة' : 'New Workshop')}
                      </h3>
                      <p className="text-gray-300 leading-8 text-sm mb-6 line-clamp-3">
                        {description || (isAr ? 'انضم إلينا في هذه الورشة التطبيقية لتطوير مهاراتك التقنية' : 'Join us in this practical workshop.')}
                      </p>
                    </div>

                    <div className="mt-auto pt-4 border-t border-gray-800">
                      <Link
                        to={`/forms/${form.slug}`}
                        onClick={handleRegisterClick}
                        className={`inline-flex items-center justify-center w-full py-2.5 px-4 bg-[#ff7a00] text-white text-sm font-semibold rounded-xl hover:bg-[#e06c00] transition cursor-pointer ${
                          isAr ? 'space-x-reverse space-x-2' : 'space-x-2'
                        }`}
                      >
                        <span>{isAr ? 'سجل الآن' : 'Register Now'}</span>
                        <FiArrowRight className={`text-lg transition-transform ${isAr ? 'rotate-180' : ''}`} />
                      </Link>
                    </div>
                  </div>
                </motion.div>
              );
            })}
          </div>
        ) : (
          <div className="text-center text-gray-400 py-12 text-sm" dir={isAr ? 'rtl' : 'ltr'}>
            {isAr ? 'لا توجد ورش أو دورات منشورة للتسجيل في الوقت الحالي' : 'No published workshops available at the moment.'}
          </div>
        )}
      </div>
    </div>
  );
};

export default UserWorkshops;