// HeroSection.jsx

import React, { useContext } from 'react';
import { LanguageContext } from '../LanguageContext';
import { motion } from 'framer-motion';

function HeroSection() {
  const { lang, t } = useContext(LanguageContext);
  const isAr = lang === 'AR';

  return (
    <section id='home' className="relative min-h-screen bg-[#1a1a2e] overflow-hidden flex items-center">
      
      <div className={`absolute top-0 ${isAr ? 'right-0' : 'left-0'} w-[600px] h-[600px] bg-orange-600/10 rounded-full blur-[150px] -z-0`}></div>

      <div className="container mx-auto px-6 md:px-10 z-10">
        
        {/* استخدام flex-row-reverse في الإنجليزية أو التحكم بالترتيب لضمان تبديل الصورة والكلام بالكامل */}
        <div className={`flex flex-col md:flex-row ${isAr ? '' : 'md:flex-row-reverse'} items-center justify-between gap-12`}>
          
          {/* قسم الصورة */}
          {/* قسم الصورة */}
<motion.div
  initial={{ x: isAr ? -100 : 100, opacity: 0 }}
  animate={{ x: 0, opacity: 1 }}
  transition={{ duration: 1, ease: "easeOut" }}
  className="flex-1 w-full flex justify-center md:justify-start"
>
  <img 
    src="Hero.png" 
    alt="Manara" 
    className={`w-[400px] max-w-lg drop-shadow-2xl md:w-xl transition-transform duration-300 ${!isAr ? 'scale-x-[-1]' : 'scale-x-[-1]'}`} 
  />
</motion.div>

          {/* قسم النص */}
          <motion.div
            initial={{ x: isAr ? 100 : -100, opacity: 0 }}
            animate={{ x: 0, opacity: 1 }}
            transition={{ duration: 1, ease: "easeOut" }}
            className={`flex-1 w-full ${isAr ? 'text-right' : 'text-left'}`}
          >
            <span className="text-orange-500 font-semibold block mb-4">
              {t.heroSub}
            </span>
           
            <h1 className="text-4xl md:text-6xl font-bold text-white mb-6 leading-tight">
              {t.heroTitle}
            </h1>
           
            {/* استخدام ms-auto بدلاً من ml-auto لضمان محاذاة النص والـ margin بالطريقة الصحيحة في الاتجاهين */}
            <p className={`text-gray-400 text-lg max-w-xl mb-8 leading-relaxed ${isAr ? 'ml-auto' : 'mr-auto'}`}>
              {t.heroDesc}
            </p>
           
            <button className="bg-orange-500 hover:bg-orange-600 text-white px-8 py-3 rounded-full font-bold transition-all">
              {t.contact}
            </button>
          </motion.div>

        </div>
      </div>
    </section>
  );
}

export default HeroSection;