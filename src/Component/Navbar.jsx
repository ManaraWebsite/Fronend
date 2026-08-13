// Navbar.jsx

import React, { useContext, useState } from 'react';
import { LanguageContext } from '../LanguageContext';
import { HiMenu, HiX } from 'react-icons/hi';

function Navbar() {
  const { lang, setLang, t } = useContext(LanguageContext);
  const [isOpen, setIsOpen] = useState(false);
  const isAr = lang === 'AR';

  const linkStyle = "text-white hover:text-orange-500 cursor-pointer transition-colors duration-300 font-medium"; 
  
  return (
    /* تحويل الـ sticky إلى fixed مع top-0 و w-full لتثبيته أثناء السكرول وإلغاء المساحة البيضاء */
<nav className="fixed top-4 left-0 right-0 w-[89%] mx-auto z-50 rounded-[8px] bg-[#1a1a2e]/90 backdrop-blur-md border border-gray-800 shadow-lg">      <div className={`container mx-auto px-6 py-4 flex justify-between items-center ${isAr ? 'flex-row' : 'flex-row-reverse md:flex-row'}`} dir={isAr ? 'rtl' : 'ltr'}>
        
        {/* الشعار (يبقى في مكانه الأساسي) */}
        <div className="text-2xl font-bold cursor-pointer flex items-center">
          <img src='Logo.png' alt="Logo" className="h-10" />
        </div>

        {/* الروابط للشاشات الكبيرة */}
        <ul className="hidden md:flex gap-8">
          <li><a href="#home" className={linkStyle}>{t.home}</a></li>
          <li><a href="#services" className={linkStyle}>{t.services}</a></li>
          <li><a href="#team" className={linkStyle}>{t.team}</a></li>
          <li><a href="#about" className={linkStyle}>{t.about}</a></li>
        </ul>

        {/* زر التواصل + زر اللغة + أيقونة المنيو */}
        <div className="flex gap-4 items-center">
          <a href="#contact" className="hidden md:block bg-orange-500 px-6 py-2 rounded-full font-bold hover:bg-orange-600 active:scale-95 transition-all duration-200 text-white">
            {t.contact}
          </a>
          
          <button 
            onClick={setLang}
            className="border border-white px-3 py-1 rounded text-white hover:bg-white hover:text-black hover:border-white active:scale-95 transition-all duration-200 text-sm font-medium"
          >
            {lang === 'AR' ? 'English' : 'العربية'}
          </button>

          <button className="md:hidden text-3xl text-white hover:text-orange-500 transition-colors" onClick={() => setIsOpen(!isOpen)}>
            {isOpen ? <HiX /> : <HiMenu />}
          </button>
        </div>
      </div>

      {isOpen && (
        <div dir={isAr ? 'rtl' : 'ltr'} className="absolute top-full left-0 w-full bg-black/95 backdrop-blur-sm flex flex-col items-center gap-6 py-8 md:hidden border-t border-gray-900 z-40 rounded-b-2xl">
          <ul className="flex flex-col gap-6 text-center">
            <li><a href="#home" className={linkStyle} onClick={() => setIsOpen(false)}>{t.home}</a></li>
            <li><a href="#services" className={linkStyle} onClick={() => setIsOpen(false)}>{t.services}</a></li>
            <li><a href="#team" className={linkStyle} onClick={() => setIsOpen(false)}>{t.team}</a></li>
            <li><a href="#about" className={linkStyle} onClick={() => setIsOpen(false)}>{t.about}</a></li>
          </ul>
          <a href="#contact" onClick={() => setIsOpen(false)} className="bg-orange-500 px-8 py-2 rounded-full font-bold text-white hover:bg-orange-600 w-4/5 max-w-xs transition-colors text-center">
            {t.contact}
          </a>
        </div>
      )}
    </nav>
  );
}

export default Navbar;