// HeroSection.jsx

import React, { useContext } from 'react';
import { LanguageContext } from '../LanguageContext';
import { motion } from 'framer-motion';

function HeroSection() {
  const { lang, t } = useContext(LanguageContext);
  const isAr = lang === 'AR';

  return (
    <section id='home' className="relative min-h-screen bg-[#1a1a2e] overflow-hidden flex items-center pt-24">
      
      {/* توهج الخلفية البرتقالي */}
      <div className={`absolute top-1/4 ${isAr ? 'right-0' : 'left-0'} w-[500px] h-[500px] bg-orange-600/10 rounded-full blur-[140px] -z-0`}></div>

      <div className="container mx-auto px-6 md:px-12 z-10">
        
        <div className={`flex flex-col md:flex-row ${isAr ? '' : 'md:flex-row-reverse'} items-center justify-between gap-12`}>
          
          {/* قسم الصورة */}
          <motion.div
            initial={{ x: isAr ? -100 : 100, opacity: 0 }}
            animate={{ x: 0, opacity: 1 }}
            transition={{ duration: 1, ease: "easeOut" }}
            className="flex-1 w-full flex justify-center"
          >
            <img 
              src="Hero.png" 
              alt="Manara" 
              className="w-[380px] md:w-[480px] max-w-full drop-shadow-2xl scale-x-[-1]" 
            />
          </motion.div>

          {/* قسم النص (متوافق مع الهيكل وحجم الخطوط) */}
          <motion.div
            initial={{ x: isAr ? 100 : -100, opacity: 0 }}
            animate={{ x: 0, opacity: 1 }}
            transition={{ duration: 1, ease: "easeOut" }}
            className={`flex-1 w-full ${isAr ? 'text-right' : 'text-left'}`}
          >
            {/* الشعار العلوي (مستقبل تقني جديد) بتصميم الباج المطابق تماماً للفيجما */}
            <div className={`inline-block mb-4 ${isAr ? 'ml-auto' : 'mr-auto'}`}>
              <span className="inline-block bg-[#3b2721] text-orange-400 border border-orange-500/30 px-5 py-2 rounded-full text-sm font-medium">
                {t.heroSub}
              </span>
            </div>
            <h1 className="text-2xl md:text-4xl font-bold text-[white] mb-6 leading-tight">
              {t.heroTitle2}
            </h1>
            {/* العنوان الرئيسي (نور يبدد الظلام) مع الحجم المظبوط */}
            <h1 className="text-4xl md:text-6xl font-bold text-[#f37321] mb-6 leading-tight">
              {t.heroTitle}
            </h1>
           
            {/* الوصف */}
            <p className={`text-gray-300 text-base md:text-lg max-w-xl mb-8 leading-relaxed ${isAr ? 'ml-auto' : 'mr-auto'}`}>
              {t.heroDesc}
            </p>
           
            {/* زر اتصل بنا بلونه البرتقالي البارز وتصميمه الدائري */}
            <a 
              href="#contact" 
              className="inline-block bg-orange-500 hover:bg-orange-600 text-white px-8 py-3.5 rounded-full font-bold transition-all shadow-lg shadow-orange-500/20 active:scale-95"
            >
              {t.contact}
            </a>
          </motion.div>

        </div>
      </div>
    </section>
  );
}

export default HeroSection;