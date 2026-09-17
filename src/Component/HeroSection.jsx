import React, { useContext } from 'react';
import { LanguageContext } from '../LanguageContext';
import { motion } from 'framer-motion';
import { Typewriter } from 'react-simple-typewriter';

function HeroSection() {
  const { lang, t } = useContext(LanguageContext);
  const isAr = lang === 'AR';

  return (
    <section id='home' className="relative min-h-[85vh] bg-[#1a1a2e] overflow-hidden flex items-center pt-20 pb-24">
      
      {/* توهج الخلفية البرتقالي */}
      <div className={`absolute top-1/4 ${isAr ? 'right-0' : 'left-0'} w-[400px] h-[400px] bg-orange-600/10 rounded-full blur-[120px] -z-0`}></div>

      <div className="container mx-auto px-6 md:px-12 z-10">
        
        <div className={`flex flex-col md:flex-row ${isAr ? '' : 'md:flex-row-reverse'} items-center justify-between gap-8`}>
          
          {/* قسم الصورة */}
          <motion.div
            initial={{ x: isAr ? -100 : 100, opacity: 0 }}
            animate={{ x: 0, opacity: 1 }}
            transition={{ duration: 1, ease: "easeOut" }}
            className="flex-1 w-full flex justify-center"
          >
            <motion.img 
              src="Hero.png" 
              alt="Manara" 
              className="w-[320px] md:w-[420px] max-w-full drop-shadow-2xl scale-x-[-1]" 
              animate={{ 
                y: [0, -10, 0], 
                rotate: [0, 1.5, -1.5, 0] 
              }}
              transition={{ 
                duration: 5, 
                repeat: Infinity, 
                ease: "easeInOut" 
              }}
            />
          </motion.div>

          {/* قسم النص */}
          <motion.div
            initial={{ x: isAr ? 100 : -100, opacity: 0 }}
            animate={{ x: 0, opacity: 1 }}
            transition={{ duration: 1, ease: "easeOut" }}
            className={`flex-1 w-full ${isAr ? 'text-right' : 'text-left'}`}
          >
            {/* الشعار العلوي */}
            <div className={`inline-block mb-3 ${isAr ? 'ml-auto' : 'mr-auto'}`}>
              <span className="inline-block bg-[#3b2721] text-orange-400 border border-orange-500/30 px-4 py-1.5 rounded-full text-xs md:text-sm font-medium">
                {t.heroSub}
              </span>
            </div>
            <h1 className="text-xl md:text-3xl font-bold text-[white] mb-4 leading-tight">
              {t.heroTitle2}
            </h1>
            
            {/* العنوان الرئيسي مع تأثير الكتابة وتغيير النص حسب اللغة فوراً */}
            <h1 className="text-2xl md:text-4xl font-bold text-[#f37321] mb-4 leading-tight min-h-[1.2em] drop-shadow-[0_0_12px_rgba(243,115,33,0.4)]">
              <Typewriter
                key={lang} // مفتاح هام جداً: لإعادة تشغيل تأثير الكتابة فوراً عند الضغط على زر تغيير اللغة
                words={[t.heroTitle]}
                loop={1}
                cursor
                cursorStyle='_'
                typeSpeed={110}
                deleteSpeed={50}
                delaySpeed={1000}
              />
            </h1>
           
            {/* الوصف */}
            <p className={`text-gray-300 text-sm md:text-base max-w-xl mb-6 leading-relaxed ${isAr ? 'ml-auto' : 'mr-auto'}`}>
              {t.heroDesc}
            </p>
           
            {/* زر اتصل بنا */}
            <a 
              href="#contact" 
              className="inline-block bg-orange-500 hover:bg-orange-600 text-white px-7 py-3 rounded-full font-bold transition-all shadow-lg shadow-orange-500/20 active:scale-95 text-sm"
            >
              {t.contact}
            </a>
          </motion.div>

        </div>
      </div>

      {/* التموج السفلي */}
      <div className="absolute bottom-0 left-0 w-full overflow-hidden leading-none -z-0">
        <svg 
          className="relative block w-full h-[50px] md:h-[80px]" 
          data-name="Layer 1" 
          xmlns="http://www.w3.org/2000/svg" 
          viewBox="0 0 1200 120" 
          preserveAspectRatio="none"
        >
          <path 
            d="M0,0 C150,90 350,-40 500,40 C650,120 900,20 1200,60 L1200,120 L0,120 Z" 
            fill="#ffffff"
          ></path>
        </svg>
      </div>

    </section>
  );
}

export default HeroSection;