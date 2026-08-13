// Footer.jsx

import React, { useContext } from 'react';
import { LanguageContext } from '../LanguageContext';
import { FiMail, FiMapPin } from 'react-icons/fi';

function Footer() {
  const { lang, t } = useContext(LanguageContext);
  const isAr = lang === 'AR';

  return (
    <footer className="bg-[#1a1a2e] text-white pt-20 pb-10 overflow-hidden border-t border-gray-800/50">
      <div className="container mx-auto px-6 md:px-10">
        
        <div className="grid grid-cols-1 md:grid-cols-3 gap-12 pb-16 border-b border-gray-800 text-center md:text-start">
          
          <div className={`space-y-6 ${isAr ? 'md:text-right' : 'md:text-left'}`}>
            <h3 className="text-xl font-bold text-white relative inline-block pb-2 after:content-[''] after:absolute after:bottom-0 after:right-0 after:w-12 after:h-0.5 after:bg-orange-500">
              {t.footerContactTitle || "تواصل مباشر"}
            </h3>
            <ul className="space-y-4 text-gray-400">
              <li className={`flex items-center gap-3 justify-center ${isAr ? 'md:justify-end' : 'md:justify-start'}`}>
                <span>{t.email || "manara.gaza.pal@gmail.com"}</span>
                <FiMail className="text-orange-500 text-lg shrink-0" />
              </li>
              <li className={`flex items-center gap-3 justify-center ${isAr ? 'md:justify-end' : 'md:justify-start'}`}>
                <span>{t.address || "غزة، فلسطين"}</span>
                <FiMapPin className="text-orange-500 text-lg shrink-0" />
              </li>
            </ul>
          </div>

          <div className={`space-y-6 ${isAr ? 'md:text-right' : 'md:text-left'}`}>
            <h3 className="text-xl font-bold text-white relative inline-block pb-2 after:content-[''] after:absolute after:bottom-0 after:right-0 after:w-12 after:h-0.5 after:bg-orange-500">
              {t.footerLinksTitle || "روابط سريعة"}
            </h3>
            <ul className="space-y-3 text-gray-400">
              <li><a href="#about" className="hover:text-orange-500 transition-colors">{t.navAbout || "من نحن"}</a></li>
              <li><a href="#services" className="hover:text-orange-500 transition-colors">{t.navServices || "خدمات التدريب"}</a></li>
              <li><a href="#stories" className="hover:text-orange-500 transition-colors">{t.navStories || "قصص النجاح"}</a></li>
              <li><a href="#contact" className="hover:text-orange-500 transition-colors">{t.navContact || "اتصل بنا"}</a></li>
            </ul>
          </div>

          <div className={`space-y-6 flex flex-col items-center ${isAr ? 'md:items-end md:text-right' : 'md:items-start md:text-left'}`}>
            {/* الشعار */}
            <div className="flex items-center gap-2">
              <span className="text-2xl font-bold tracking-wider"><img src='/Logo.png'/></span>
            </div>
            <p className="text-gray-400 text-sm leading-relaxed max-w-sm">
              {t.footerDesc || "مبادرة تعليمية تقنية ولدت من رحم المعاناة في غزة، لتمكين الشباب الفلسطيني في المجال البرمجي والتقني والمهاري وفق أعلى المعايير الدولية."}
            </p>
          </div>

        </div>

        <div className="pt-8 text-center text-gray-500 text-sm">
          <p>{t.footerRights || "© 2026 منارة. جميع الحقوق محفوظة. مبادرة تقنية من قلب التحدي."}</p>
        </div>

      </div>
    </footer>
  );
}

export default Footer;